# Matriz Comparativa de las 12 Formas Anatómicas — Muyu 2.0

**Archivo Fuente:** [`src/components/svg/PetIllustrations.tsx`](file:///C:/Proyectos/Muyu/src/components/svg/PetIllustrations.tsx)  
**Componente:** `PetRenderer` (`id`, `stage`, `reaction`, `size`)  
**Auditoría:** Codex / Fase 2 y Fase 3

---

## 1. Matriz Anatómica Estructural (3 Especies × 4 Etapas = 12 Formas Únicas)

| Especie | Etapa Display (ID) | Proporción Cabeza / Torso | Rasgos Anatómicos Clave | Distintivo Visual Único |
| :--- | :--- | :--- | :--- | :--- |
| **Mono** (`monkey`) | **Bebé** (`baby`) | Proporción 1:1 (cabeza r=45, torso rx=32 ry=33) | Extremidades cortas recogidas, pose sentada tierna | Orejas grandes (r=22), mechoncito infantil |
| **Mono** (`monkey`) | **Joven** (`sprout`) | Torso alargado (rx=36, ry=38) | Extremidades ágiles, silueta activa | Dos mechones erizados, cola en "S" expresiva |
| **Mono** (`monkey`) | **Explorador** (`young`) | Silueta atlética de trepador | Brazos y piernas largas, cola en espiral alta | Bandana verde selva (`#489B6E`) con nudo |
| **Mono** (`monkey`) | **Adulto** (`adult`) | Robusto (pecho rx=46, ry=46) | Hombros anchos con pelaje denso, patas firmes | Corona selvática de hojas y gema dorada (`#FFD166`) |
| **Tortuga** (`turtle`) | **Bebé** (`baby`) | Cabeza esférica (r=38), caparazón liso | Sin placas ni divisiones, aletitas regordetas | Caparazón completamente liso recién salida del huevo |
| **Tortuga** (`turtle`) | **Joven** (`sprout`) | Caparazón con reborde definido | Aletas estilizadas, cuello visible | 3 placas protectoras simples (rombo y 2 laterales) |
| **Tortuga** (`turtle`) | **Explorador** (`young`) | Caparazón aerodinámico de nadadora | Silueta ágil, aletas con escamas turquesas | Patrón geométrico hexagonal completo (7 placas) |
| **Tortuga** (`turtle`) | **Adulto** (`adult`) | Gran caparazón volumétrico doble borde | Doble reborde ornamentado, aletas majestuosas | Mosaico concéntrico tallado + flor de loto en cabeza |
| **Tucán** (`toucan`) | **Bebé** (`baby`) | Polluelo compacto (rx=32, ry=36) | Pico cónico muy corto (26px) sin franjas | Amarillo pastel suave (`#FFE066`), patitas tiernas |
| **Tucán** (`toucan`) | **Joven** (`sprout`) | Torso estilizado en crecimiento | Pico mediano curvado (44px) con 2 tonos | Base limón y punta mango, primeras plumas remeras |
| **Tucán** (`toucan`) | **Explorador** (`young`) | Esbelto con cola de 3 plumas vivaces | Alas semi-desplegadas en pose de equilibrio | Pico tricolor largo (60px: menta, oro, fuego) |
| **Tucán** (`toucan`) | **Adulto** (`adult`) | Imponente plumaje azul índigo | Gran pico de 76px con borde aserrado ornamental | Cresta nucal dorada + orquídea tropical en rama |

---

## 2. Matriz de Reacciones Conductuales (4 Reacciones Vivas)

1. **Reposo (`idle` / `'none'`):** Postura neutra y serena, ojos abiertos brillantes, sonrisa suave.
2. **Alegría (`happy` / `'tap'`):** Extremidades/alas alzadas saludando enérgicamente, boca abierta sonriente, destellos y animación `bounce-tap`.
3. **Alimentación (`eating` / `'feed'`):** Manos/aletas/pico sosteniendo la fruta en la boca, mejillas infladas sonrosadas, ojos en arco degustando (`^ ^`), sonido de deglución y partículas.
4. **Caricia (`petting` / `'pet'`):** Ojos cerrados plácidamente en curvas de afecto, sonrojo en mejillas, meneo suave `wiggle-pet`.
