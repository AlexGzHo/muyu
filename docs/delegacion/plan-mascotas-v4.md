# Muyu 4.0 — Plan de acción: crecimiento natural de mascotas y accesorios

## Diagnóstico (revisión del orquestador, 2026-11-02)

| # | Problema | Causa en el código |
|---|----------|--------------------|
| 1 | El crecimiento no se ve natural | Las 12 imágenes `public/pets/<especie>/<etapa>.png` son ilustraciones independientes: cambian de pose (sentado → saltando → brazos cruzados), de encuadre y de proporciones, y todas se escalan para llenar 512×512. El bebé ocupa igual o más espacio que el adulto. La tortuga "young" se ve más pequeña que "sprout". |
| 2 | Las transiciones de etapa no se perciben | `EvolutionModal` solo muestra la etapa nueva; no hay antes/después ni transformación. |
| 3 | Los accesorios no encajan | `WEARABLE_CONFIG` (PetAccessories.tsx) tiene 144 transformaciones fijadas a mano y heredadas de las mascotas SVG anteriores. No hay puntos de anclaje por imagen. |
| 4 | Choque de estilo | Los accesorios son vectoriales planos sobre un arte rasterizado con volumen y textura. |
| 5 | La personalización es inconsistente | Los accesorios solo aparecen en Hogar y Tienda; Evolución, Bienvenida, Álbum y Resultados no los muestran. `ActivityResultModal` fija `stage="adult"`. |
| 6 | Errores técnicos | Ids de gradiente duplicados en la Tienda; la capa de accesorios se desalinea cuando `size` es string; no hay compatibilidad por especie (todo se puede comprar aunque no encaje). |

## Fases

### Fase 1 — Línea base y sistema de anclajes (orden actual)
Matriz de QA 3×4×12, anclajes medidos por imagen, colocación por reglas, compatibilidad por especie/etapa, un único renderizador en todas las pantallas, escala por etapa y corrección de errores. No se toca el arte.

### Fase 2 — Arte coherente de las mascotas (requiere decisión del usuario)
Volver a generar las 12 imágenes como una **hoja de modelo**: mismo personaje y paleta, la misma pose frontal o de 3/4 en todas las etapas (cabeza en una zona estable), lienzo y línea de suelo comunes, crecimiento progresivo en las proporciones (cabeza/cuerpo de ~1:1 a ~1:2,5) y sin halos en el recorte. Opcional: capas separadas (cuerpo/cabeza/cola) para animación.
Alternativa: rehacer las mascotas como SVG modular. Es más caro, pero permite animar y encajar los accesorios de forma natural.
**Recomendación:** mantener el raster con hoja de modelo y anclajes (menor coste y conserva el acabado actual).

### Fase 3 — Accesorios en el mismo estilo
Redibujar los 12 accesorios con el contorno, el sombreado y la paleta de las mascotas (raster o SVG con volumen), con variante de perfil cuando la especie lo exija (tucán y tortuga), y validarlos contra la matriz de QA.

### Fase 4 — Evolución que se siente
Animación de evolución antes → después (silueta, brillo, cambio de escala), una línea de tiempo de etapas en el Álbum y pequeñas animaciones idle por etapa, respetando `prefers-reduced-motion`.

### Fase 5 — QA final
Matriz completa en 360/390/768/escritorio, compatibilidad con guardados antiguos, test/lint/build e informe.

## Decisiones pendientes del usuario
1. Fase 2: ¿raster con hoja de modelo (recomendado) o SVG modular?
2. ¿Se pueden bloquear en la Tienda los accesorios incompatibles, o todos deben encajar en todas las especies?
