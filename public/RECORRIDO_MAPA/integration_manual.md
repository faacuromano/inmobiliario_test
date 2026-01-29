# PROMPT: Integration Protocol for Panoee Transfer to Next.js

This document serves as both a manual for developers and a protocol for AI Agents to execute the integration.

## 1. Context & Objective
We have a raw Panoee Export (a static Reach/Next.js output) located at `Downloads/INTEGRATE VS EXPORT/RECORRIDO_MAPA/tour`. 
**Objective**: Transfer this export into the user's main Next.js application (`public/tour`) and configure it for isolation and customization.

---

## 2. File System Operations

### Step 2.1: Transfer Directory
**Agent Action**: Copy directory content recursively.
- **Source**: `[USER_DOWNLOADS]/INTEGRATE VS EXPORT/RECORRIDO_MAPA/tour/`
- **Destination**: `[NEXTJS_ROOT]/public/tour/`

> [!IMPORTANT]
> Ensure the destination folder `public/tour` is created if it does not exist. If it exists, confirm overwrite or clean it first.

### Step 2.2: Verify Structure
**Validation**: Check if `[NEXTJS_ROOT]/public/tour/index.html` exists.
**Expected Structure**:
```text
public/
  └── tour/
      ├── index.html
      ├── static/
      ├── _next/
      └── ...
```

---

## 3. Customization Layer (CSS Injection)

**Goal**: Inject a custom stylesheet to override Panoee's internal styles without modifying minified code.

### Step 3.1: Create `custom.css`
**Agent Action**: Create file `[NEXTJS_ROOT]/public/tour/custom.css`.
**Content**:
```css
/* Custom Overrides for Panoee Tour */
/* -------------------------------- */

/* Example: Reset body margin just in case */
body {
    margin: 0;
    overflow: hidden; /* Prevent double scrollbars in iframe */
}

/* Add your custom overrides here. 
   Use !important if necessary as Panoee uses styled-components with high specificity. 
*/
```

### Step 3.2: Hook into [index.html](file:///c:/Users/Facundo/Downloads/INTEGRATE%20VS%20EXPORT/out/out/index.html)
**Agent Action**: Read `[NEXTJS_ROOT]/public/tour/index.html`.
**Transformation**: finding the closing `</head>` tag and inserting the link reference before it.

**Target**: `</head>`
**Replacement**: 
```html
<link rel="stylesheet" href="custom.css" />
</head>
```

---

## 4. React Integration Component

**Goal**: Create a seamless Next.js component to render the tour.

### Step 4.1: Create Component
**Agent Action**: Write to `[NEXTJS_ROOT]/src/components/VirtualTour.tsx` (adjust `src` if using page directory).

**Code**:
```tsx
'use client'; 
import React, { useState, useEffect } from 'react';

interface VirtualTourProps {
  className?: string;
}

export default function VirtualTour({ className = "" }: VirtualTourProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className={`relative w-full h-[600px] bg-gray-100 rounded-xl overflow-hidden shadow-lg ${className}`}>
      {/* Loading State Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
           <span className="text-gray-500 font-medium">Cargando Recorrido 360...</span>
        </div>
      )}

      {/* Sandboxed Iframe */}
      <iframe
        src="/tour/index.html"
        title="Recorrido Virtual 360"
        className={`w-full h-full border-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        allowFullScreen
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </section>
  );
}
```

---

## 5. Dynamic Data Injection (Future Proofing)

**Context**: The user wants to colorize polygons based on DB status (Sold/Available).
**Mechanism**: We will inject a script tag that polls an internal API.

### Step 5.1: Create API Schema (Hypothetical)
**Requirement**: The main app must provide:
- **Endpoint**: `GET /api/lots/status`
- **Response**: `Record<string, 'sold' | 'available' | 'reserved'>`

### Step 5.2: The Injector Script
(To be implemented in `public/tour/index.html` body).

```javascript
/* INJECTOR SCRIPT DRAFT */
window.addEventListener('load', async () => {
  try {
    const res = await fetch('/api/lots/status');
    const statusMap = await res.json();
    
    // Wait for Krpano to be ready
    const krpano = document.getElementById("krpanoSWFObject");
    
    if (krpano && krpano.get) {
       // Logic to iterate hotspots and set attributes
       // krpano.call("set(hotspot[name].fillcolor, 0xFF0000)");
    }
  } catch (e) {
    console.warn("Failed to sync lot status", e);
  }
});
```

---

## Summary of Changes
1.  **Renamed** source folder to `tour` for semantic clarity.
2.  **Isolated** run-time environment using `iframe` + `public/` folder strategy.
3.  **Decoupled** styling using `custom.css` injection.
4.  **Prepared** architecture for dynamic data binding via API.
