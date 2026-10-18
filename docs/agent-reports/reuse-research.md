# Reporte de Investigación y Reutilización Controlada (Fase -1)

**Proyecto:** Muyu: Crece Conmigo  
**Fecha de inspección:** 17 de octubre de 2026  
**Auditor / Ejecutor:** Antigravity (Auditoría: Codex)  
**Herramientas de inspección:** `read_url_content` contra dominios autorizados (`github.com`, `raw.githubusercontent.com`, `api.github.com`, `kenney.nl`), `view_file`.

---

## 1. Matriz de Evaluación de Fuentes Candidatas

| Fuente | Elemento considerado | Decisión | Licencia | Justificación técnica |
| :--- | :--- | :---: | :---: | :--- |
| **Tamagochi — Open Source Game**<br>`Tech-aficionado/Tamagochi---Open-Source-Game` | `src/game/progression.ts`<br>`src/game/save.ts`<br>`src/game/types.ts` | **ADAPTAR** | MIT License<br>*(c) 2026 Tamagochi contributors* | Arquitectura robusta de guardado: funciones puras de normalización (`bounded`, `isRecord`), persistencia en `localStorage` con fallback ante corrupción y tipado de progresión. Se descartan el motor 3D, historias y bucles temporales de presión/castigo. |
| **Digital Pet Game**<br>`ravizsz/digital-pet-game` | `index.tsx` (estado y ciclo de vida de mascota) | **DESCARTAR** | MIT License | Implementación de ejercicio con temporizadores agresivos que degradan hambre/energía cada 100ms y uso de emojis genéricos. Incompatible con la experiencia relajada y las reglas de diseño para 3–5 años del PRD. |
| **Edukiz — Juegos educativos**<br>`timmalich/edukiz` | `src/components/utils/SoundUtils.js`, lógica didáctica de conteo y correspondencia | **ADAPTAR** *(conceptual)* | MIT License<br>*(c) 2020 Tim Malich* | Se aprovechan los patrones pedagógicos de secuenciación de pistas sonoras y correspondencia visual. Se descarta Vue, Vuex y librerías externas de audio; se traslada la lógica a React con Web Audio API y `SpeechSynthesis` nativa. |
| **dnd-kit**<br>`clauderic/dnd-kit` | Paquetes de arrastrar y soltar (`@dnd-kit/react`) | **DESCARTAR** *(como dep externa)* / **ADAPTAR** *(patrón)* | MIT License<br>*(c) 2021 Claudéric Demers* | Se descartó como dependencia externa por **menor complejidad técnica**: se implementa arrastre fluido con Pointer Events estándar de HTML5/React y alternativa por toque (tap-to-place), evitando añadir paquetes adicionales y manteniendo el bundle ligero. |
| **Motion**<br>`motiondivision/motion` | `motion/react` para animaciones y celebraciones | **DESCARTAR** | MIT License<br>*(c) 2024 Motion B.V.* | El PRD prioriza soluciones ligeras sin dependencias innecesarias si CSS es suficiente. CSS keyframes y transiciones ofrecen aceleración por hardware, 0 KB de JS y soporte directo de `prefers-reduced-motion`. |
| **Kenney Assets**<br>`kenney.nl/assets/animal-pack`<br>`kenney.nl/assets/ui-pack` | Ilustraciones de animales, interfaz y audio | **ADAPTAR** *(conceptos UI)* / **DESCARTAR** *(sprites)* | CC0 1.0 Universal *(Dominio Público)* | La inspección de la página del catálogo oficial (`https://kenney.nl/assets/animal-pack`) constató que no dispone de los tres animales específicos (mono, tortuga, tucán) en cuatro etapas homogéneas. Se crean componentes SVG vectoriales originales y coherentes con la paleta tropical del proyecto. |

---

## 2. Decisiones de Arquitectura e Implementación

1. **Estado y Persistencia (`src/game/`):**
   - Se adaptará la estructura desacoplada inspirada en Tamagochi:
     - `src/game/types.ts`: Tipos estrictos para mascotas (`monkey`, `turtle`, `toucan`), etapas (`seed`, `stage1`, `stage2`, `adult`), inventario y actividades.
     - `src/game/rules.ts`: Funciones puras e idempotentes para recompensas (1 alimento por minijuego completado), consumo (1 unidad por alimentación) y transición de etapa (cada 2 alimentaciones).
     - `src/game/persistence.ts`: Almacenamiento versionado en `localStorage`, sanitización de datos (sin números negativos, sin estados nulos corruptos) y resiliencia ante excepciones.

2. **Interacciones y Gestos:**
   - Eventos Pointer nativos (`onPointerDown`, `onPointerMove`, `onPointerUp`) en superficies de juego.
   - Soporte dual obligatorio: arrastrar y soltar con alternativa de toque secuencial ("tocar fruta/alimento → tocar cesta/mascota").
   - Control de `touch-action: none` localizado exclusivamente en las áreas interactivas para prevenir scroll accidental sin romper la navegación global.

3. **Audio y Accesibilidad:**
   - Sintetizador con Web Audio API para efectos de sonido (éxito, recompensa, clic suave) sin archivos binarios pesados.
   - `SpeechSynthesis` para pistas en minijuego de comunicación, encapsulado con control de volumen/silencio y salvaguardas que nunca bloquean el juego si la API no está disponible en el entorno del navegador.
   - Pistas visuales complementarias constantes para no depender de lectura ni de audio exclusivo.

---

## 3. Evidencias de Acceso Real

- **Tamagochi LICENSE:** Confirmada licencia MIT vía `https://raw.githubusercontent.com/Tech-aficionado/Tamagochi---Open-Source-Game/main/LICENSE`.
- **Tamagochi progression.ts & save.ts:** Examinados en vivo con validadores `bounded`, `integer` y esquemas de guardado.
- **Digital Pet Game:** Verificado endpoint GitHub API `https://api.github.com/repos/ravizsz/digital-pet-game` y archivo `index.tsx`.
- **Edukiz LICENSE & SoundUtils:** Confirmada licencia MIT (Tim Malich) en `https://raw.githubusercontent.com/timmalich/edukiz/master/LICENSE` y arquitectura de audio en `SoundUtils.js`.
- **dnd-kit LICENSE:** Confirmada licencia MIT en `https://raw.githubusercontent.com/clauderic/dnd-kit/master/LICENSE`.
- **Motion LICENSE:** Confirmada licencia MIT en `https://raw.githubusercontent.com/motiondivision/motion/main/LICENSE.md`.
- **Kenney Animal Pack:** Verificada página oficial y licencia CC0 en `https://kenney.nl/assets/animal-pack`.
