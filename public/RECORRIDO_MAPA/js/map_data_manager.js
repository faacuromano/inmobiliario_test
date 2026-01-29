class MapDataManager {
  // Brand Colors
  COLOR_AVAILABLE = 0x28a745; // Vibrant Green
  COLOR_RESERVED = 0xffa500; // Orange
  COLOR_SOLD = 0xff0000; // Pure Red
  COLOR_DEFAULT = 0x808080; // Grey (Fallback)

  constructor() {
    this.apiUrl = "/api/lots";
    this.retryInterval = 2000;
    this.maxRetries = 60;
    this.lotsData = null;
    this.krpano = null;

    // MAPPING CORRECTIONS
    // Format: "wrong-slug-from-panoee": "correct-slug-in-db"
    this.urlOverrides = {
      // Example: "lote-error": "lote-1",
    };
  }

  init() {
    console.log("[MapDataManager] Initializing...");
    this.fetchData();
  }

  async fetchData() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      this.lotsData = await response.json();
      console.log(
        "[MapDataManager] Data fetched:",
        this.lotsData.length,
        "lots",
      );
      this.waitForKrpano();
    } catch (error) {
      console.error("[MapDataManager] Fetch error:", error);
    }
  }

  waitForKrpano() {
    let attempts = 0;
    const interval = setInterval(() => {
      if (window.listKrpanoInstance && window.listKrpanoInstance.length > 0) {
        const autoId = window.listKrpanoInstance[0];
        const kObj = document.getElementById(autoId) || window[autoId];
        if (kObj && typeof kObj.get === "function") {
          clearInterval(interval);
          console.log(`[MapDataManager] Connected to Krpano (${autoId}).`);
          this.krpano = kObj;
          this.updateMap(kObj);
          return;
        }
      }

      let krpano =
        window.krpanoContainer ||
        window.krpano ||
        document.getElementById("krpanoContainer") ||
        document.getElementById("krpanoSWFObject") ||
        document.getElementById("krpano");

      if (krpano && typeof krpano.get === "function") {
        clearInterval(interval);
        console.log("[MapDataManager] Krpano found via standard checks.");
        this.krpano = krpano;
        this.updateMap(krpano);
      } else {
        attempts++;
        if (attempts > this.maxRetries) {
          clearInterval(interval);
          console.error(
            "[MapDataManager] Krpano not found after timeout. Aborting.",
          );
        }
      }
    }, this.retryInterval);
  }

  getHotspotsFromReactState() {
    try {
      if (
        window.__NEXT_DATA__?.props?.pageProps?.initialState?.app?.listScene
      ) {
        const scenes =
          window.__NEXT_DATA__.props.pageProps.initialState.app.listScene;
        let allHotspots = [];
        scenes.forEach((scene) => {
          if (scene.hotspots && Array.isArray(scene.hotspots)) {
            allHotspots = allHotspots.concat(scene.hotspots);
          }
        });
        return allHotspots;
      }
    } catch (e) {
      console.warn("[MapDataManager] Failed to read __NEXT_DATA__:", e);
    }
    return [];
  }

  updateMap(krpano) {
    if (!this.lotsData) return;
    this.krpano = krpano;

    const reactHotspots = this.getHotspotsFromReactState();
    const krpanoHotspotCount = krpano.get("hotspot.count");

    console.log(
      `[MapDataManager] Syncing Map. Found ${krpanoHotspotCount} active hotspots.`,
    );

    // We define our styles globally once (idempotent)
    this.defineStyles(krpano);

    for (let i = 0; i < krpanoHotspotCount; i++) {
      const kName = krpano.get(`hotspot[${i}].name`);
      let targetSlug = null;
      let targetUrl = null;

      // 1. CHECK NAME OVERRIDE (Direct mapping from Hotspot ID)
      if (this.urlOverrides[kName]) {
        targetSlug = this.urlOverrides[kName];
        console.log(
          `[MapDataManager] ⚠️ Override by Name: "${kName}" -> "${targetSlug}"`,
        );
      }

      // 2. CHECK URL/REACT MAPPING (If no name override)
      if (!targetSlug) {
        const matchingReactHotspot = reactHotspots.find((rh) =>
          kName.includes(rh.id),
        );
        if (matchingReactHotspot) {
          let hotspotUrl =
            (matchingReactHotspot.config &&
              matchingReactHotspot.config.link &&
              matchingReactHotspot.config.link.url) ||
            (matchingReactHotspot.link && matchingReactHotspot.link.url) ||
            null;

          // Rewrite localhost
          const isLocal =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
          if (hotspotUrl && isLocal) {
            const prodDomain = "inmobiliario-test.vercel.app";
            if (hotspotUrl.includes(prodDomain)) {
              hotspotUrl = hotspotUrl
                .replace(`https://${prodDomain}`, window.location.origin)
                .replace(`http://${prodDomain}`, window.location.origin);
            }
          }

          if (
            hotspotUrl &&
            typeof hotspotUrl === "string" &&
            hotspotUrl.includes("/card/")
          ) {
            const slugMatch = hotspotUrl.match(/\/card\/([^\?]+)/);
            if (slugMatch && slugMatch[1]) {
              let rawSlug = slugMatch[1];
              // Apply Slug Override
              if (this.urlOverrides[rawSlug]) {
                console.log(
                  `[MapDataManager] ⚠️ Override by Slug: "${rawSlug}" -> "${this.urlOverrides[rawSlug]}"`,
                );
                targetSlug = this.urlOverrides[rawSlug];
              } else {
                targetSlug = rawSlug;
              }
              targetUrl = hotspotUrl;
            }
          }
        }
      }

      // 3. GENERATE SHADOW IF SLUG FOUND
      if (targetSlug) {
        const lotInfo = this.lotsData.find((l) => l.slug === targetSlug);
        if (lotInfo) {
          // Construct URL if missing (e.g. forced by name override)
          if (!targetUrl) {
            targetUrl = `${window.location.origin}/card/${targetSlug}?embed=true`;
          }
          // Ensure embed param
          if (!targetUrl.includes("embed=true")) {
            targetUrl += (targetUrl.includes("?") ? "&" : "?") + "embed=true";
          }

          this.createShadowHotspot(krpano, kName, lotInfo.status, targetUrl);
        } else {
          console.warn(
            `[MapDataManager] Slug "${targetSlug}" not found in DB.`,
          );
        }
      } else {
        // Log unmapped hotspots to help user find IDs
        // console.log(`[MapDataManager] Unmapped Hotspot: ${kName}`);
      }
    }
    krpano.call("updatescreen();");
  }

  defineStyles(krpano) {
    // Define clean styles for our shadow hotspots and store them for lookup
    this.styleConfigs = [
      {
        name: "custom_style_AVAILABLE",
        color: this.COLOR_AVAILABLE,
        alpha: 0.4,
        hoverAlpha: 0.7,
      },
      {
        name: "custom_style_RESERVED",
        color: this.COLOR_RESERVED,
        alpha: 0.6,
        hoverAlpha: 0.8,
      },
      {
        name: "custom_style_SOLD",
        color: this.COLOR_SOLD,
        alpha: 0.5,
        hoverAlpha: 0.5,
      },
      {
        name: "custom_style_DEFAULT",
        color: 0x800080, // PURPLE for debugging
        alpha: 0.5,
        hoverAlpha: 0.8,
      },
    ];

    this.styleConfigs.forEach((s) => {
      const colorHex = "0x" + s.color.toString(16).toUpperCase();
      const cmd = `
                addstyle(${s.name});
                set(style[${s.name}].fillcolor, ${colorHex});
                set(style[${s.name}].fillalpha, ${s.alpha});
                set(style[${s.name}].borderwidth, 3);
                set(style[${s.name}].borderalpha, 0.0);
                set(style[${s.name}].enabled, true);
                set(style[${s.name}].capture, true);
                set(style[${s.name}].handcursor, true);
                set(style[${s.name}].onover, set(fillalpha, ${s.hoverAlpha}); set(fillcolor, ${colorHex}); );
                set(style[${s.name}].onout,  set(fillalpha, ${s.alpha}); set(fillcolor, ${colorHex}); );
            `;
      krpano.call(cmd);
    });
  }

  createShadowHotspot(krpano, originalName, status, clickUrl) {
    const shadowName = "shadow_" + originalName;
    const isNew = !krpano.get(`hotspot[${shadowName}].name`);

    // 0. Capture Native Interaction
    let originalOnClick = krpano.get(`hotspot[${originalName}].onclick`);
    if (originalOnClick === "null") originalOnClick = null;

    // 1. Hide Origin Panoee Hotspot (Always ensure this)
    krpano.set(`hotspot[${originalName}].visible`, false);
    krpano.set(`hotspot[${originalName}].enabled`, false);

    // 2. Create Shadow Hotspot if needed
    if (isNew) {
      krpano.call(`addhotspot(${shadowName});`);
      // Copy Geometry (Only needed once on creation)
      const pointCount = krpano.get(`hotspot[${originalName}].point.count`);
      if (pointCount > 0) {
        for (let i = 0; i < pointCount; i++) {
          const ath = krpano.get(`hotspot[${originalName}].point[${i}].ath`);
          const atv = krpano.get(`hotspot[${originalName}].point[${i}].atv`);
          krpano.call(`set(hotspot[${shadowName}].point[${i}].ath, ${ath});`);
          krpano.call(`set(hotspot[${shadowName}].point[${i}].atv, ${atv});`);
        }
      }
      // Ensure Z-Order
      krpano.set(`hotspot[${shadowName}].zorder`, 9999);
    }

    // 3. Resolve Style Config
    const safeStatus = status ? status.toUpperCase() : "UNKNOWN";
    const styleName = `custom_style_${safeStatus}`;

    // Find config or fallback to DEFAULT
    let config = this.styleConfigs
      ? this.styleConfigs.find((s) => s.name === styleName)
      : null;
    if (!config) {
      config = this.styleConfigs
        ? this.styleConfigs.find((s) => s.name === "custom_style_DEFAULT")
        : { color: 0x800080, alpha: 0.5, hoverAlpha: 0.8 };
    }

    // 4. Update Style & Force Visuals (Brute Force)
    krpano.set(`hotspot[${shadowName}].style`, styleName);

    const colorHex = "0x" + config.color.toString(16).toUpperCase();
    krpano.set(`hotspot[${shadowName}].fillcolor`, colorHex);
    krpano.set(`hotspot[${shadowName}].fillalpha`, config.alpha);
    krpano.set(`hotspot[${shadowName}].borderwidth`, 3);

    const onOverCmd = `set(fillalpha, ${config.hoverAlpha}); set(fillcolor, ${colorHex});`;
    const onOutCmd = `set(fillalpha, ${config.alpha}); set(fillcolor, ${colorHex});`;
    krpano.set(`hotspot[${shadowName}].onover`, onOverCmd);
    krpano.set(`hotspot[${shadowName}].onout`, onOutCmd);

    // 5. Update Interaction
    if (
      originalOnClick &&
      originalOnClick !== "" &&
      originalOnClick !== "null"
    ) {
      krpano.set(`hotspot[${shadowName}].onclick`, originalOnClick);
    } else {
      krpano.set(
        `hotspot[${shadowName}].onclick`,
        `openurl('${clickUrl}', _self);`,
      );
    }

    console.log(
      `[MapDataManager] Shadow ${shadowName}: Status="${status}" -> Forced Color=${colorHex} | ClickFallback=${!originalOnClick}`,
    );
  }
}

// Auto-init
const mapManager = new MapDataManager();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mapManager.init());
} else {
  mapManager.init();
}
