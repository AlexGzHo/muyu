# REPORTE TÉCNICO: REWORK PROFESIONAL DEL SISTEMA DE ACCESORIOS (WEARABLE SYSTEM)

**Proyecto:** Muyu: Crece Conmigo  
**Fecha:** 19 de Octubre de 2026  
**Autor:** Antigravity (Ingeniero & Arquitecto Técnico)  
**Estado:** COMPLETADO Y VERIFICADO AL 100%

---

## 1. Causa Raíz del Problema Anterior

El sistema previo de accesorios se diseñó bajo un modelo de "overlay genérico con traslación fija por categoría":
1. **Ausencia de Variantes Anatómicas:** Se utilizaba una sola ilustración SVG genérica para los lentes (`round_glasses`, `star_glasses`), asumiendo simetría frontal plana en todas las especies. Esto provocaba que:
   - En el **Tucancito**, el puente y el lente derecho colisionaran e invadieran el pico y la comisura bucal, pareciendo un sticker pegado en el aire.
   - En la **Tortuguita**, cuya cabeza mira en ángulo oblicuo de 3/4 hacia la derecha, ambos lentes medían lo mismo sin perspectiva ocular, tapando los ojos saltones naturales de la especie.
   - En el **Monito**, los lentes no acompañaban la curvatura del arco ciliar.
2. **Sombreros y Gorras Flotantes:** Las gorras se apoyaban sobre un centroide global rígido sin considerar la cresta de plumas, la curvatura cefálica ni las orejas, dando sensación de flotar por encima de la cabeza en lugar de encajar.
3. **Mochilas sin Integración Corpórea:** Las mochilas no tenían el offset adecuado para reposar anatómicamente sobre el caparazón de la tortuga o detrás del ala del tucán, sintiéndose desconectadas del torso.

---

## 2. Patrones Arquitectónicos Adaptados de las Referencias

Inspirados en las referencias arquitectónicas acordadas:
- **`react-nice-avatar`:** Transición de simples imágenes sueltas a un **Wearable System** integrado en el renderizador del personaje, donde cada accesorio responde a propiedades anatómicas específicas y se renderiza con volumen, luces y sombras integradas.
- **`avatar-builder`:** Desacoplamiento por catálogo de partes vestibles con variantes anatómicas dedicadas por especie (`glasses-variant-monkey`, `glasses-variant-turtle`, `glasses-variant-toucan`), garantizando que la composición SVG DOM Stack respete la geometría corporal real.

---

## 3. Arquitectura y Solución Implementada

### A. Matriz Anatómica Específica (`WEARABLE_CONFIG`)
Se reemplazaron los anclajes genéricos por una matriz tridimensional en `src/components/svg/PetAccessories.tsx`:
```typescript
Record<AccessoryId, Record<PetId, Record<GrowthStage, WearableTransform>>>
```
Cada combinación canónica (12 accesorios $\times$ 3 especies $\times$ 4 etapas evolutivas) cuenta con coordenadas dedicadas de precisión submétrica:
- `x`, `y`: Posición calibrada en el lienzo normalizado `viewBox="0 0 200 200"`.
- `scale`: Escala ajustada según las proporciones cefálicas de cada etapa (Bebé = cabeza grande; Adulto = cabeza más proporcionada).
- `rotation`: Inclinación angular que acompaña la postura de la especie y etapa.

### B. Variantes Anatómicas Específicas
1. **Lentes Redondos (`round_glasses`):**
   - **Tucancito (`glasses-variant-toucan`):** Rediseñado como un **monóculo académico refinado** con cadena dorada hacia la pluma posterior, ajustado exactamente sobre el ojo visible sin invadir ni rozar el pico.
   - **Tortuguita (`glasses-variant-turtle`):** Rediseñado en **perspectiva 3/4**, con el lente frontal derecho circular de $r=14$ y el lente izquierdo elíptico en fuga oblicua ($rx=9, ry=11$) con puente adaptado.
   - **Monito (`glasses-variant-monkey`):** Lentes simétricos frontales con curvatura adaptada al puente nasal y patillas envolventes.
2. **Gafas de Estrella (`star_glasses`):**
   - Variantes análogas por especie, con estrella única para el tucán y estrellas escaladas con perspectiva para la tortuga.
3. **Gorrita y Sombrero de Explorador:**
   - Rediseñados con iluminación cenital, volumen esférico, sombras propias en la visera e inclinación natural sobre la corona cefálica.
4. **Mochila Pequeña y Mochila de Explorador:**
   - Desplazadas hacia los anclajes posteriores reales: apoyadas firmemente sobre el caparazón de la tortuga y asomando naturalmente tras el flanco alar del tucán.

---

## 4. Archivos Modificados

| Archivo | Rol en el Rework |
|---|---|
| `src/components/svg/PetAccessories.tsx` | Implementación del Wearable System: matriz `WEARABLE_CONFIG`, variantes anatómicas (`petId`), refinamiento de sombreros, lentes y mochilas. |
| `src/screens/ShopScreen.tsx` | Propagación de `petId={selectedPetId}` hacia las miniaturas y el maniquí probador del catálogo. |
| `public/calibrate_accessories.html` | Matriz interactiva de calibración visual de las 12 formas con el nuevo Wearable System sincronizado. |
| `scripts/capture_verification_cases.mjs` | Suite automatizada CDP para capturar los 7 casos de prueba obligatorios en la Tienda del Bosque. |
| `docs/evidence/v2.1/captures/` | Repositorio de evidencias con capturas reales CDP de alta resolución. |

---

## 5. Casos de Verificación Obligatorios

Los 7 casos obligatorios fueron verificados en el navegador mediante Chromium/Edge Headless vía CDP, confirmando una integración profesional sin solapamientos indebidos:

| Caso | Especie & Etapa | Accesorios Equipados | Evidencia Guardada |
|---|---|---|---|
| **Caso 1** | Monito Pequeño (`sprout`) | Gorrita Naranja + Lentes Redondos | `case1_monito_sprout_cap_glasses.png` |
| **Caso 2** | Monito Explorador (`young`) | Sombrero de Explorador | `case2_monito_young_explorer_hat.png` |
| **Caso 3** | Tortuguita Bebé (`baby`) | Gorrita Naranja | `case3_tortuga_baby_cap.png` |
| **Caso 4** | Tortuguita Bebé (`baby`) | Lentes Redondos (perspectiva 3/4) | `case4_tortuga_baby_glasses.png` |
| **Caso 5** | Tucancito Bebé (`baby`) | Lazo de Colores en la pluma | `case5_toucan_baby_bow_or_cap.png` |
| **Caso 6** | Tucancito Explorador (`young`) | Lentes Redondos (Monóculo) + Pañuelo | `case6_toucan_young_glasses_scarf.png` |
| **Caso 7** | Tortuguita Pequeña (`sprout`) | Mochila Pequeña (en caparazón) + Corona | `case7_backpack_monkey_turtle_toucan.png` |

---

## 6. Resultados de Validación y Calidad Técnica

- **Linter (`oxlint`):** 0 errores, 0 advertencias en 47 archivos.
- **Pruebas Unitarias (`node --test`):** **70 de 70 tests pasados** en 14 suites completadas exitosamente.
- **Compilación de Producción (`npm run build`):** Éxito total sin errores tipográficos ni colisiones de tipos (42 módulos empaquetados en ~607 ms).
- **Consistencia Visual:** Idéntica presentación y normalización viewBox en Tienda del Bosque, Bosque Central, Selector y Álbum.
- **Protección de Datos:** Partida original, hashes de EVIDENCIA A4 y ZIP de recuperación `muyu-v1-recovery-20261017.zip` rigurosamente intactos.

