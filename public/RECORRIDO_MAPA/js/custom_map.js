/**
 * MapDataManager
 * Manages the fetching of Lot data and updates the Panoee/Krpano map visualization.
 * Designed/Refined for Organic Modern aesthetics and robustness.
 */

class MapDataManager {
  // Brand Colors from index.html / Design System
  // Available: Green/Teal
  COLOR_AVAILABLE = 0x2fd0ac;
  // Reserved: Yellow
  COLOR_RESERVED = 0xf0c330;
  // Sold: Red or Dark Grey (using Red as per plan, but adjustable)
  COLOR_SOLD = 0xe54d42;

  // Fallback/Default
  COLOR_DEFAULT = 0xffffff;

  constructor() {
    this.apiUrl = "/api/lots";
    this.retryInterval = 2000; // 2 seconds
    this.maxRetries = 5;
    this.lotsData = null;
  }

  /**
   * Initialize the manager.
   */
  init() {
    console.log("[MapDataManager] Initializing...");
    this.fetchData();
  }

  /**
   * Fetch lot data from the API.
   */
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
      // Simple retry logic could go here if needed
    }
  }

  /**
   * Wait for Krpano object to be available in the DOM.
   */
  waitForKrpano() {
    let attempts = 0;
    const interval = setInterval(() => {
      const krpano = document.getElementById("krpanoSWFObject");
      if (krpano && krpano.get) {
        clearInterval(interval);
        console.log("[MapDataManager] Krpano found. Updating map...");
        this.updateMap(krpano);

        // Optional: Re-run update on scene change if needed
        // krpano.set("events.onloadcomplete", () => this.updateMap(krpano));
      } else {
        attempts++;
        if (attempts > 30) {
          // Timeout after ~60s
          clearInterval(interval);
          console.error("[MapDataManager] Krpano not found after timeout.");
        }
      }
    }, this.retryInterval);
  }

  /**
   * Update map hotspots based on fetched data.
   * @param {Object} krpano - The Krpano viewer object
   */
  /**
   * Update map hotspots based on fetched data.
   * @param {Object} krpano - The Krpano viewer object
   */
  updateMap(krpano) {
    if (!this.lotsData) return;

    // Get count of hotspots
    const hotspotCount = krpano.get("hotspot.count");
    console.log(`[MapDataManager] Found ${hotspotCount} hotspots in Krpano.`);

    for (let i = 0; i < hotspotCount; i++) {
      // Krpano hotspots are accessible via index or name.
      // We iterate by index to ensure we catch everything.
      const hotspotName = krpano.get(`hotspot[${i}].name`);

      // Attempt to get the URL link from different possible Panoee properties
      // standard: hotspot[].link.url
      // Panoee often puts custom data in 'link' object
      let hotspotUrl = krpano.get(`hotspot[${i}].link.url`);

      // Fallback: check other common link properties or 'onclick' actions if URL isn't direct
      if (!hotspotUrl) {
        // Sometimes stored in a custom attribute by Panoee plugins
        hotspotUrl = krpano.get(`hotspot[${i}].url`);
      }

      console.log(
        `[MapDataManager] Checking hotspot: ${hotspotName}, URL: ${hotspotUrl}`,
      );

      // Check if this hotspot is linked to a lot card
      // URL format might be: https://.../card/lote-1?embed=true
      if (hotspotUrl && hotspotUrl.includes("/card/")) {
        const slugMatch = hotspotUrl.match(/\/card\/([^\?]+)/);
        if (slugMatch && slugMatch[1]) {
          const slug = slugMatch[1];
          const lotInfo = this.lotsData.find((l) => l.slug === slug);

          if (lotInfo) {
            console.log(
              `[MapDataManager] Match found! Hotspot: ${hotspotName} -> Lot: ${slug} (${lotInfo.status})`,
            );
            this.applyStyle(krpano, hotspotName, lotInfo.status);
          } else {
            console.warn(
              `[MapDataManager] Hotspot links to ${slug}, but no data found in API.`,
            );
          }
        }
      }
    }
    // Force a redraw of the view to apply changes immediately
    krpano.call("updatescreen();");
  }

  /**
   * Apply visual style to a hotspot based on status.
   */
  applyStyle(krpano, hotspotName, status) {
    let color = this.COLOR_DEFAULT;
    let alpha = 0.4;
    let borderColor = 0xffffff;

    switch (status) {
      case "AVAILABLE":
        color = this.COLOR_AVAILABLE; // Green/Teal
        alpha = 0.4;
        break;
      case "RESERVED":
        color = this.COLOR_RESERVED; // Yellow
        alpha = 0.6;
        break;
      case "SOLD":
        color = this.COLOR_SOLD; // Red
        alpha = 0.7; // Sold = darker/more solid
        break;
      default:
        color = this.COLOR_DEFAULT;
    }

    // Hex string for logging
    const colorHex = "0x" + color.toString(16).toUpperCase();

    // 1. Set Standard Krpano Polygon Properties
    krpano.set(`hotspot[${hotspotName}].fillcolor`, colorHex);
    krpano.set(`hotspot[${hotspotName}].fillalpha`, alpha);
    krpano.set(`hotspot[${hotspotName}].bordercolor`, "0xFFFFFF");

    // 2. Set Panoee Custom Properties (often used for their rendering engine)
    // Panoee usually stores config in a 'polygon_config' object or similar custom attributes
    // We try to override the "hover" and "normal" states if they exist as variables

    // Attempt to set Panoee's internal color variables if they are exposed
    // This is a guess based on common Panoee structures seen in index.html
    krpano.set(
      `hotspot[${hotspotName}].polygon_config.properties.fillColor`,
      `rgba(${this.hexToRgb(color)},${alpha})`,
    );

    // IMPORTANT: Disable Panoee's default hover effect which might reset the color
    // We set the "Hover" color to be the same as the status color, or slightly brighter
    krpano.set(
      `hotspot[${hotspotName}].polygon_config.properties.fillColorHover`,
      `rgba(${this.hexToRgb(color)},0.8)`,
    );

    console.log(
      `[MapDataManager] Applied style to ${hotspotName}: ${status} (${colorHex})`,
    );
  }

  // Helper to convert hex integer to r,g,b string
  hexToRgb(hex) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `${r},${g},${b}`;
  }
}

// Instantiate and run
const mapManager = new MapDataManager();
// Wait for DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mapManager.init());
} else {
  mapManager.init();
}
