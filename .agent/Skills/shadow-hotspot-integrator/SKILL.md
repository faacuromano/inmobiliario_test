---
name: shadow-hotspot-integrator
description: Guide and implementation pattern for integrating dynamic database data with Krpano/Panoee tours using Shadow Hotspots. Use when needing to colorize map polygons, handle custom interactions, or override Panoee's default styling.
---

# Shadow Hotspot Integrator

This skill provides the architectural pattern and implementation details for the "Shadow Hotspot" technique. This allows for stable, flicker-free integration of dynamic data (PostgreSQL/Prisma) into Panoee (Krpano) virtual tours.

## Quick Start

The core concept is **"Hide & Clone"**:

1.  **Hide** the original Panoee hotspot.
2.  **Clone** its geometry to a new "Shadow" hotspot.
3.  **Control** the Shadow completely via script.

## Core Implementation

### 1. The Class Structure (`MapDataManager.js`)

Your manager class should handle fetching data and syncing the map.

```javascript
class MapDataManager {
  constructor() {
    this.styleConfigs = []; // Store style definitions
  }

  // ... fetch logic ...

  updateMap(krpano) {
    // 1. Define Styles (Idempotent)
    this.defineStyles(krpano);

    // 2. Iterate & Match
    // ... matching logic ...

    // 3. Create Shadow
    this.createShadowHotspot(krpano, krpanoName, status, linkUrl);
  }
}
```

### 2. Style Definitions (Robust)

Use a configuration array to define styles. This creates a "Source of Truth" for your colors.

```javascript
defineStyles(krpano) {
    this.styleConfigs = [
        { name: "custom_style_AVAILABLE", color: 0x28a745, alpha: 0.4, hoverAlpha: 0.7 },
        { name: "custom_style_SOLD",      color: 0xFF0000, alpha: 0.7, hoverAlpha: 0.9 },
        // ...
    ];

    this.styleConfigs.forEach(s => {
        // Define Krpano style
        // ...
    });
}
```

### 3. The Shadow Creator (The Logic)

This function ensures the shadow exists and forces visual properties to guarantee rendering.

```javascript
createShadowHotspot(krpano, originalName, status, clickUrl) {
    const shadowName = "shadow_" + originalName;
    const isNew = !krpano.get(`hotspot[${shadowName}].name`);

    // A. Hide Original
    krpano.set(`hotspot[${originalName}].visible`, false);
    krpano.set(`hotspot[${originalName}].enabled`, false);

    // B. Create Shadow (One-time geometry copy)
    if (isNew) {
        krpano.call(`addhotspot(${shadowName});`);
        const pointCount = krpano.get(`hotspot[${originalName}].point.count`);
        for (let i = 0; i < pointCount; i++) {
            const ath = krpano.get(`hotspot[${originalName}].point[${i}].ath`);
            const atv = krpano.get(`hotspot[${originalName}].point[${i}].atv`);
            krpano.call(`set(hotspot[${shadowName}].point[${i}].ath, ${ath});`);
            krpano.call(`set(hotspot[${shadowName}].point[${i}].atv, ${atv});`);
        }
        krpano.set(`hotspot[${shadowName}].zorder`, 9999);
    }

    // C. Apply Style & Force Visuals (Brute Force Pattern)
    // This is critical for overcoming render lazy-loading
    const config = this.styleConfigs.find(s => s.name === `custom_style_${status}`)
                   || this.styleConfigs.find(s => s.name === "custom_style_DEFAULT");

    krpano.set(`hotspot[${shadowName}].style`, config.name);

    // Manual Property Injection
    const colorHex = "0x" + config.color.toString(16).toUpperCase();
    krpano.set(`hotspot[${shadowName}].fillcolor`, colorHex);
    krpano.set(`hotspot[${shadowName}].fillalpha`, config.alpha);

    // Interaction Injection
    krpano.set(`hotspot[${shadowName}].onclick`, `openurl('${clickUrl}', _blank);`);
}
```

## Troubleshooting

- **Grey Colors?** Check if `color` is exactly `0xFF0000` (Number) not `"FF0000"` (String). Ensure you are forcing properties (`fillcolor`) manually after setting the style.
- **Green Flashes?** Ensure you are calling `createShadowHotspot` on every update cycle and that the original hotspot is set to `visible=false`.
- **Clicks not working?** Verify `zorder` is high (9999) and `enabled=true` on the shadow, and `enabled=false` on the original.

## References

- **Krpano XML Reference**: [Addhotspot](https://krpano.com/docu/actions/#addhotspot)
- **Krpano Events**: [Onover/Onout](https://krpano.com/docu/xml/#events)
- **Prisma/DB**: Ensure your `status` values match your `styleConfigs`.
