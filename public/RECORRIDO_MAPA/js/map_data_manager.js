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
    this.lotsHash = null;
    this.krpano = null;
    this.syncInterval = 60000; // 60s — matches ISR cache duration
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
      this.lotsHash = this.computeHash(this.lotsData);
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
          this.startPeriodicSync();
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
        this.startPeriodicSync();
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

    // Snapshot hotspot names to avoid index-shifting during iteration
    const hotspotNames = [];
    for (let i = 0; i < krpanoHotspotCount; i++) {
      const name = krpano.get(`hotspot[${i}].name`);
      if (name) hotspotNames.push(name);
    }

    for (const kName of hotspotNames) {
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

        // Rewrite localhost logic
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
            const slug = slugMatch[1];
            const lotInfo = this.lotsData.find((l) => l.slug === slug);

            if (lotInfo) {
              // Create Shadow Hotspot Implementation
              this.createShadowHotspot(
                krpano,
                kName,
                lotInfo,
              );
            }
          }
        }
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

  createShadowHotspot(krpano, originalName, lotInfo) {
    const shadowName = "shadow_" + originalName;
    const isNew = !krpano.get(`hotspot[${shadowName}].name`);
    const status = lotInfo.status;

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
    krpano.set(`hotspot[${shadowName}].borderalpha`, 0.0);

    const onOverCmd = `set(fillalpha, ${config.hoverAlpha}); set(fillcolor, ${colorHex});`;
    const onOutCmd = `set(fillalpha, ${config.alpha}); set(fillcolor, ${colorHex});`;
    krpano.set(`hotspot[${shadowName}].onover`, onOverCmd);
    krpano.set(`hotspot[${shadowName}].onout`, onOutCmd);

    // 5. Update Interaction — render card overlay from in-memory data (no navigation)
    const slug = lotInfo.slug;
    krpano.set(
      `hotspot[${shadowName}].onclick`,
      `js(window.mapManager.openLotCard('${slug}'));`,
    );

    console.log(
      `[MapDataManager] Shadow ${shadowName}: Status="${status}" -> Color=${colorHex}`,
    );
  }

  openLotCard(slug) {
    this.closeLotCard();

    const lot = this.lotsData.find((l) => l.slug === slug);
    if (!lot) return;

    const status = (lot.status || "").toUpperCase();
    const statusLabels = { AVAILABLE: "Disponible", RESERVED: "Reservado", SOLD: "Vendido" };
    const statusColors = { AVAILABLE: "#28a745", RESERVED: "#ffa500", SOLD: "#ff0000" };
    const label = statusLabels[status] || status;
    const color = statusColors[status] || "#808080";
    const price = Number(lot.price).toLocaleString();

    // Overlay backdrop
    const overlay = document.createElement("div");
    overlay.id = "lot-card-overlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;";
    overlay.addEventListener("click", (e) => { if (e.target === overlay) this.closeLotCard(); });

    // Card
    const card = document.createElement("div");
    card.style.cssText = "background:#fff;border-radius:16px;width:90%;max-width:360px;box-shadow:0 25px 50px rgba(0,0,0,0.25);overflow:hidden;animation:lotCardIn .25s ease-out;";

    card.innerHTML = `
      <style>@keyframes lotCardIn{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}</style>
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:50%;background:#1a3a2a;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;">${lot.number || slug}</div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;">Lote N\u00b0</div>
            <div style="display:inline-flex;align-items:center;gap:6px;margin-top:4px;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;color:${color};background:${color}18;border:1px solid ${color}30;">${label}</div>
          </div>
        </div>
        <button id="lot-card-close" style="background:none;border:none;font-size:22px;color:#999;cursor:pointer;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background .15s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='none'">\u2715</button>
      </div>
      <div style="padding:20px 24px;display:flex;gap:12px;">
        <div style="flex:1;background:#f8faf8;border-radius:12px;padding:14px;">
          <div style="font-size:11px;color:#888;margin-bottom:4px;">Dimensiones</div>
          <div style="font-size:16px;font-weight:600;color:#1a3a2a;">${lot.dimensions || "-"}</div>
        </div>
        <div style="flex:1;background:#f8faf8;border-radius:12px;padding:14px;">
          <div style="font-size:11px;color:#888;margin-bottom:4px;">Superficie</div>
          <div style="font-size:16px;font-weight:600;color:#1a3a2a;">${lot.area || "-"} m\u00b2</div>
        </div>
      </div>
      ${status === "AVAILABLE" ? `
      <div style="padding:4px 24px 8px;">
        <div style="font-size:11px;color:#888;margin-bottom:2px;">Precio</div>
        <div style="font-size:26px;font-weight:700;color:#1a3a2a;">${lot.currency || "USD"} ${price}</div>
      </div>` : ""}
      ${lot.description ? `<div style="padding:4px 24px 8px;font-size:13px;color:#666;line-height:1.5;">${lot.description}</div>` : ""}
      ${status === "AVAILABLE" ? `<div style="padding:12px 24px 20px;"><button style="width:100%;padding:12px;background:#1a3a2a;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;" onmouseover="this.style.background='#2a5a3a'" onmouseout="this.style.background='#1a3a2a'">Consultar Ahora</button></div>` : `<div style="height:12px"></div>`}
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    card.querySelector("#lot-card-close").addEventListener("click", () => this.closeLotCard());
  }

  closeLotCard() {
    const existing = document.getElementById("lot-card-overlay");
    if (existing) existing.remove();
  }

  computeHash(data) {
    // Simple string hash for change detection
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return hash;
  }

  startPeriodicSync() {
    if (this._syncTimer) return; // Already running
    this._syncTimer = setInterval(async () => {
      try {
        const response = await fetch(this.apiUrl);
        if (!response.ok) return;
        const newData = await response.json();
        const newHash = this.computeHash(newData);
        if (newHash !== this.lotsHash) {
          console.log("[MapDataManager] Re-sync: data changed, updating map.");
          this.lotsData = newData;
          this.lotsHash = newHash;
          if (this.krpano) this.updateMap(this.krpano);
        }
      } catch (e) {
        console.warn("[MapDataManager] Re-sync fetch failed:", e);
      }
    }, this.syncInterval);
  }
}

// Auto-init
const mapManager = new MapDataManager();
window.mapManager = mapManager;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mapManager.init());
} else {
  mapManager.init();
}
