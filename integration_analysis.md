# Integration Analysis: Panoee/Krpano Shadow Hotspots

## Architecture Match with Guide

The implementation correctly follows all 3 core steps from `integration_guide.md`:

| Step | Guide Spec | Implementation | Status |
|------|-----------|----------------|--------|
| **A. Data Sync** | Map Panoee hotspot ID → DB slug via `__NEXT_DATA__` | `getHotspotsFromReactState()` reads `listScene` from React state, extracts `/card/{slug}` from hotspot URLs | OK |
| **B. Shadow Maker** | Hide original → Clone geometry → Control shadow | `createShadowHotspot()` at line 213 does exactly this | OK |
| **C. Brute Force Styling** | Double-layer: style assignment + forced property override | `defineStyles()` + per-shadow forced `fillcolor`/`fillalpha` at lines 256-267 | OK |

## Potential Issues Found

### 1. Click handler precedence (line 270-281)

The shadow hotspot inherits the *original* Panoee `onclick` if it exists. This is problematic — Panoee's native `onclick` likely triggers internal navigation (scene switching), not the `/card/{slug}` URL. The shadow should **always** use the DB-driven `clickUrl` for matched lots, since the whole point is to override Panoee's behavior.

```js
// Current: prefers original onclick (Panoee internal navigation)
if (originalOnClick && originalOnClick !== "" && originalOnClick !== "null") {
    krpano.set(`hotspot[${shadowName}].onclick`, originalOnClick); // ← risky
}
```

This means if Panoee sets *any* onclick on the original hotspot, the shadow will use Panoee's action instead of opening `/card/{slug}`.

### 2. Missing `borderalpha` on shadow creation (line 262)

`defineStyles()` sets `borderalpha: 0.0` on styles, but the brute-force section in `createShadowHotspot` sets `borderwidth: 3` without explicitly forcing `borderalpha: 0.0`. If the style assignment fails to apply, you'll get a visible 3px border with default alpha.

### 3. `_self` target in `openurl` (line 279)

```js
`openurl('${clickUrl}', _self);`
```

This navigates the **entire page** away from the tour. Per the Architect spec (section 2), the card should open *inside* or *over* the Panoee iframe — not replace it. If the iframe is embedded in a Next.js page, `_self` navigates the iframe, not the parent. This might be intentional depending on your iframe nesting, but worth verifying.

### 4. No re-sync mechanism

The guide (section 4.2) notes the pattern "only executes on data change detection." Currently, `fetchData()` runs once on `DOMContentLoaded` and never again. If admin updates lot status while a user has the tour open, the shadows won't update. No polling or event-based refresh exists.

### 5. `hotspot.count` iteration (line 113)

Iterating by index (`hotspot[${i}]`) is fragile in krpano — if hotspots are added/removed mid-loop (e.g., by Panoee's internal engine), the index can shift. The `kName` retrieval at line 114 could return the wrong hotspot or `null`.

## Summary

The Shadow Hotspot pattern is correctly architected and matches the guide. The main risk is **issue #1** — the onclick fallback logic may silently route clicks through Panoee's internal handler instead of your `/card/{slug}` URL, breaking the "fake-integration" contract from the Architect spec. The other issues are edge cases that could cause visual glitches or stale data.
