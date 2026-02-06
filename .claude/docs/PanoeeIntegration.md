# Guía de Integración: Patrón "Shadow Hotspots" para Krpano/Panoee

Este documento detalla la arquitectura y metodología utilizada para integrar datos dinámicos (base de datos) sobre un tour virtual de **Panoee** (basado en Krpano) sin entrar en conflicto con el motor de renderizado interno de Panoee.

## 1. El Problema Base
Panoee es un "wrapper" sobre Krpano que gestiona agresivamente el estado visual.
- Si intentas cambiar el color de un hotspot (`fillcolor`) directamente, Panoee lo detecta como una anomalía y lo restaura a su estilo por defecto en el siguiente ciclo de renderizado (aprox. cada 100-200ms o al pasar el mouse).
- Esto causa "parpadeos" o que los estilos personalizados simplemente se ignoren.

## 2. La Solución Generalizada: "Shadow Hotspots"
En lugar de luchar por el control del objeto original, aplicamos la técnica de **"Ocultar y Clonar"**.

### Concepto
1.  **Identificar** el hotspot original de Panoee (que tiene la geometría del polígono).
2.  **Leer** sus vértices (puntos `ath`, `atv`).
3.  **Ocultar** el original (`visible=false`, `enabled=false`).
4.  **Crear** un nuevo hotspot ("Shadow") justo encima, con la misma geometría.
5.  **Controlar** totalmente este nuevo hotspot desde nuestro script, sin interferencias de Panoee.

## 3. Implementación Paso a Paso

### Paso A: Sincronización de Datos
Primero, necesitamos mapear los objetos del mundo 3D con nuestra base de datos.
- **Panoee/Krpano**: Los hotspots tienen nombres generados (ej: `hotspot_123`).
- **Base de Datos**: Tenemos `slugs` (ej: `lote-12`).
- **Puente**: Usamos el estado interno de React (`__NEXT_DATA__`) o metadatos en la URL del hotspot para asociar `ID Panoee` <-> `Slug DB`.

### Paso B: El Algoritmo "Shadow Maker"
Este es el núcleo de la solución ([createShadowHotspot](file:///d:/Proyectos/inmobiliarios/public/RECORRIDO_MAPA/js/map_data_manager.js#213-275)).

```javascript
createShadowHotspot(krpano, originalName, status, clickAction) {
    const shadowName = "shadow_" + originalName;
    
    // 1. Ocultar el Original (Para que no capture clics ni se vea)
    krpano.set(`hotspot[${originalName}].visible`, false);
    krpano.set(`hotspot[${originalName}].enabled`, false);

    // 2. Crear el Clon (Solo si no existe)
    if (!krpano.get(`hotspot[${shadowName}].name`)) {
        krpano.call(`addhotspot(${shadowName});`);
        
        // Copiar Geometría (Vértice a Vértice)
        const count = krpano.get(`hotspot[${originalName}].point.count`);
        for(let i=0; i<count; i++) {
            const ath = krpano.get(`hotspot[${originalName}].point[${i}].ath`);
            const atv = krpano.get(`hotspot[${originalName}].point[${i}].atv`);
            // Copiar al clon
            krpano.call(`set(hotspot[${shadowName}].point[${i}].ath, ${ath});`);
            krpano.call(`set(hotspot[${shadowName}].point[${i}].atv, ${atv});`);
        }
    }
}
```

### Paso C: "Brute Force" Styling (Styling Robusto)
Krpano a veces es perezoso al aplicar estilos definidos con `style="..."`. Para garantizar que el color se vea (especialmente en la carga inicial), aplicamos una doble capa de asignación:

1.  **Nivel Estilo**: Asignamos un estilo predefinido (`style="custom_ROJO"`).
2.  **Nivel Propiedad (Forzado)**: Sobrescribimos manualmente las propiedades visuales.

```javascript
// Asignar Estilo Base
krpano.set(`hotspot[${shadowName}].style`, `custom_style_${status}`);

// Forzar Propiedades Visuales (El "Seguro de Vida")
krpano.set(`hotspot[${shadowName}].fillcolor`, colorHex); // ej: 0xFF0000
krpano.set(`hotspot[${shadowName}].fillalpha`, 0.7);

// Forzar Eventos (Hover)
// Inyectamos el comando set al evento onover directamente
krpano.set(`hotspot[${shadowName}].onover`, `set(fillalpha, 1.0);`);
krpano.set(`hotspot[${shadowName}].onout`,  `set(fillalpha, 0.7);`);
```

## 4. Ventajas de esta Arquitectura
1.  **Estabilidad**: Panoee no conoce la existencia de los "Shadows", por lo que nunca intentará resetear sus estilos.
2.  **Performance**: No requiere un bucle `setInterval` constante revisando cambios (como la estrategia anterior). Solo se ejecuta al detectar cambios en los datos.
3.  **Flexibilidad**: Podemos añadir lógica arbitraria al `onclick` de los Shadows (abrir modales, navegar, reproducir sonidos) sin depender de la UI de Panoee.

## 5. Resumen para Futuros Proyectos
Para replicar esto:
1.  Localiza el script de carga del tour.
2.  Inyecta la clase [MapDataManager](file:///d:/Proyectos/inmobiliarios/public/RECORRIDO_MAPA/js/map_data_manager.js#1-276).
3.  Asegúrate de tener acceso al objeto `krpano` global.
4.  Implementa la lógica [fetchData](file:///d:/Proyectos/inmobiliarios/public/RECORRIDO_MAPA/js/map_data_manager.js#21-38) -> [createShadowHotspot](file:///d:/Proyectos/inmobiliarios/public/RECORRIDO_MAPA/js/map_data_manager.js#213-275).
