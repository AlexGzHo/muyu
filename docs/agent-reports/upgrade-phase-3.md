# Reporte Fase 3 — Siete Minijuegos Educativos con Tres Niveles de Dificultad

**Auditor:** Codex | **Ejecutor:** Antigravity  
**Fecha:** 2026-10-17 | **Ruta:** `C:\Proyectos\Muyu` | **Estado:** Fase 3 Concluida Exitosamente

---

## 1. Resumen de Implementación de Fase 3

Se implementó la suite completa de los **7 minijuegos educativos** para Muyu 2.0, cumpliendo de manera estricta los requerimientos pedagógicos y mecánicos de la **Sección 6 del PRD**, las **21 configuraciones de dificultad real** (3 dificultades x 7 juegos) y **3 rondas cambiantes por sesión** (63 rondas generadas y verificadas deterministamente). No se implementaron cuestionarios con skins, sino mecánicas interactivas singulares, controles táctiles accesibles (touch y drag) y narración con fallback visual.

### A. Catálogo Canónico y Estado de Disponibilidad ([`src/game/rules.ts`](file:///C:/Proyectos/Muyu/src/game/rules.ts))

Todos los 7 minijuegos están declarados y habilitados con `isAvailable: true` en [`ACTIVITIES_CATALOG`](file:///C:/Proyectos/Muyu/src/game/rules.ts#L197-L255):
1. **J1 — Fiesta de frutas (`counting`):** Área Matemática.
2. **J2 — El camino de los patrones (`patterns`):** Área Matemática / Lógica. **Nuevo**.
3. **J3 — El huerto de Muyu (`plant`):** Área Ciencia y Ambiente.
4. **J4 — Cada animal en su hogar (`habitats`):** Área Ciencia y Ambiente. **Nuevo**.
5. **J5 — Escucha y encuentra (`listening`):** Área Comunicación.
6. **J6 — Cuentos en orden (`stories`):** Área Comunicación. **Nuevo**.
7. **J7 — Sombras y formas (`shadows`):** Área Percepción / Psicomotricidad. **Nuevo**.

---

## 2. Detalle de los Siete Minijuegos Implementados

### J1: Fiesta de frutas ([`src/activities/counting/CountingGame.tsx`](file:///C:/Proyectos/Muyu/src/activities/counting/CountingGame.tsx))
- **Mecánica:** Conteo y arrastre/toque de frutas a la cesta con indicador numérico dinámico y retorno táctil de frutas si el niño coloca de más.
- **Dificultad real:**
  - *Inicial (~3 años):* Metas de 1 a 3 frutas.
  - *Medio (~4 años):* Metas de 3 a 5 frutas.
  - *Avanzado (~5 años):* Metas de 4 a 6 frutas.
- **Variabilidad:** Soporte de 4 tipos de frutas ilustradas SVG (`mango`, `apple`, `orange`, `strawberry`).
- **Controles:** Arrastre continuo con proxy flotante y alternativa de un solo toque directo sobre la fruta y sobre la canasta.

### J2: El camino de los patrones ([`src/activities/patterns/PatternsGame.tsx`](file:///C:/Proyectos/Muyu/src/activities/patterns/PatternsGame.tsx))
- **Mecánica:** Completar secuencias lógicas de formas con fichas grandes (`PatternTile`: círculo, cuadrado, triángulo, estrella, hoja, flor).
- **Dificultad real:**
  - *Inicial (~3 años):* Patrón repetitivo AB-AB (4 casillas), 2 opciones grandes con distractor evidente.
  - *Medio (~4 años):* Patrones de repetición dual AAB-AAB o ABB-ABB (6 casillas), 3 opciones.
  - *Avanzado (~5 años):* Patrón ternario ABC-ABC o con hueco alterno, 4 opciones.
- **Controles:** Toque para seleccionar/colocar o arrastre táctil hacia la casilla faltante con interrogación (`?`).

### J3: El huerto de Muyu ([`src/activities/plant/PlantGame.tsx`](file:///C:/Proyectos/Muyu/src/activities/plant/PlantGame.tsx))
- **Mecánica:** Secuencia pedagógica de cultivo y cuidado de la planta con transformación visual real de la maceta en 3 etapas anatómicas (1: semilla fértil, 2: brote verde con tallo, 3: gran floración abierta).
- **Herramientas reales e ilustraciones:** Semilla (`SeedTool`), tierra fértil (`SoilTool`), agua (`WateringCan`), luz solar (`SunTool`) y cuidado/poda (`CareTool`), con distractores infantiles inocuos (`ShoeDistractor`, `HatDistractor`, `BallDistractor`).
- **Dificultad real y orden según nivel:**
  - *Inicial:* 1 paso por ronda (R0: semillita con tierra, R1: agua con regadera, R2: sol radiante).
  - *Medio:* 2 pasos secuenciales por ronda (R0: tierra + semilla, R1: agua + sol, R2: agua + cuidado).
  - *Avanzado:* 3 pasos secuenciales ordenados (R0: tierra + semilla + agua, R1: agua + sol + cuidado, R2: sol + agua + cuidado especial).

### J4: Cada animal en su hogar ([`src/activities/habitats/HabitatsGame.tsx`](file:///C:/Proyectos/Muyu/src/activities/habitats/HabitatsGame.tsx))
- **Mecánica:** Clasificación de animales de la fauna peruana y selvática en sus ecosistemas correspondientes mediante tarjetas ilustradas (`AnimalBadge`: tucán, mono, pez, tortuga, oso, armadillo) y hábitats ilustrados (`HabitatBackdrop`: árboles, río, tierra/cueva).
- **Dificultad real y variación estricta de rondas:**
  - *Inicial:* 2 hábitats y 2 animales inequívocos.
  - *Medio:* 2 hábitats y 3 animales, variando los hábitats y animales en cada una de las 3 rondas (R0: árboles/río, R1: río/tierra, R2: árboles/tierra).
  - *Avanzado:* 3 hábitats simultáneos y 4 animales variados por ronda.
- **Controles:** Arrastre táctil al hábitat o selección por toque del animal y toque posterior del hábitat destino.

### J5: Escucha y encuentra ([`src/activities/listening/ListeningGame.tsx`](file:///C:/Proyectos/Muyu/src/activities/listening/ListeningGame.tsx))
- **Mecánica:** Discriminación auditiva y visual mediante locución en español neutro/peruano (`soundManager.speakSpanish`).
- **Pool de objetivos ampliado y semillado:** Cobertura de todo el catálogo (sol, tucán, fruta, flor, mono, tortuga, etc.) con selección determinista mediante PRNG FNV-1a.
- **Dificultad real:** 2 opciones en inicial, 3 en medio, 4 en avanzado.
- **Accesibilidad y Fallback:** Indicador visual de pista que se activa automáticamente si el dispositivo carece de síntesis vocal o si el sonido está silenciado.

### J6: Cuentos en orden ([`src/activities/stories/StoriesGame.tsx`](file:///C:/Proyectos/Muyu/src/activities/stories/StoriesGame.tsx))
- **Mecánica:** Comprensión narrativa y causalidad temporal ordenando viñetas ilustradas (`StoryVignette`) sobre una línea de tiempo numerada (Paso 1, 2, 3, 4).
- **Temas infantiles originales:** "El nacimiento del pajarito", "El ciclo de la flor", "El día del monito".
- **Dificultad real:** 2 viñetas en inicial, 3 en medio, 4 en avanzado.
- **Narración de éxito:** Al ordenar correctamente, el juego lee en voz alta el relato completo continuo para premiar y reforzar la comprensión lectora del niño.

### J7: Sombras y formas ([`src/activities/shadows/ShadowsGame.tsx`](file:///C:/Proyectos/Muyu/src/activities/shadows/ShadowsGame.tsx))
- **Mecánica:** Asociación perceptual de figuras geométricas y orgánicas de colores (`ShapePiece`) con sus siluetas oscuras de contorno punteado.
- **Figuras:** Círculo, cuadrado, triángulo, estrella, corazón y hoja.
- **Dificultad real:** 2 siluetas en inicial, 3 en medio, 4 en avanzado.
- **Controles:** Arrastre táctil o toque de la figura y toque de la sombra.

---

## 3. Modelo Canónico, Generadores y Persistencia

1. **Generadores Puros Deterministas ([`src/game/activitiesModel.ts`](file:///C:/Proyectos/Muyu/src/game/activitiesModel.ts)):**  
   Todas las funciones `generateCountingRound`, `generatePatternsRound`, `generatePlantRound`, `generateHabitatsRound`, `generateListeningRound`, `generateStoriesRound` y `generateShadowsRound` son puras y estables por semilla (`createSeededRandom(seed)`), garantizando que recargar el navegador en mitad de una partida reanuda exactamente los mismos elementos, posiciones y metas.
2. **Registro de Intentos y Pistas para Fase 4:**  
   Cada componente registra atómicamente `errorsCount` y `hintsUsed` en `partialData` en cada interacción, dejándolo preparado para el cálculo de estrellas de Fase 4 (3 estrellas: 0-1 errores y 0 pistas; 2 estrellas: hasta 3 errores o 1 pista; 1 estrella: finalización).
3. **Flujo de Resultados Idempotente:**  
   Al culminar la ronda 2, se presenta la pantalla de celebración con el incentivo de un alimento ganado (`+1 Alimento`), opción de **"Volver a jugar"** (crea una nueva partida tipada) o **"Volver al bosque"** (`exitMatch()`). El registro en `completedMatchIds` garantiza que refrescar la pantalla de victoria jamás duplica premios.
4. **Sintaxis y Recursos SVG Corregidos ([`src/components/svg/GameIllustrations.tsx`](file:///C:/Proyectos/Muyu/src/components/svg/GameIllustrations.tsx)):**  
   - Se corrigió el paréntesis faltante tras `AppleFruit`.
   - Se eliminaron las declaraciones duplicadas de `OrangeFruit` y `StrawberryFruit`.
   - Se crearon los nuevos componentes SVG: `SeedTool`, `SoilTool`, `CareTool`, `PatternTile`, `HabitatBackdrop`, `AnimalBadge`, `StoryVignette` y `ShapePiece`.

---

## 4. Verificación de Calidad y Pruebas

- **`npm.cmd test`:** **45/45 pruebas unitarias pasadas** (11 suites en total, 0 fallos).
  - Incorporada la **Suite 12** con 11 pruebas dedicadas validando:
    - Ejecución de las **21 configuraciones x 3 rondas (63 rondas generadas y verificadas)**.
    - Rangos pedagógicos de conteo J1.
    - Patrones AB, AAB/ABB y ABC en J2.
    - Secuencia pedagógica completa (semilla, tierra, agua, luz, cuidado) en J3.
    - Variación estricta de rondas en hábitats J4 (medio y avanzado).
    - Selección amplia de objetivos mediante semilla en escucha J5.
    - Escalabilidad de viñetas en cuentos J6.
    - Siluetas y formas en J7.
    - Determinismo estricto e invariabilidad tras recarga.
    - Flujo completo de partida y premiación para los 4 juegos nuevos.
    - Disponibilidad canónica de las 7 actividades en el catálogo.
- **`npm.cmd run lint`:** **0 errores, 0 advertencias** con oxlint.
- **`npm.cmd run build`:** Compilación exitosa en 258 ms (38 módulos procesados, bundle de producción optimizado de 369.98 kB JS y 40.23 kB CSS).
- **Protección de Entorno:** Sin tocar datos de usuario en puerto 5174; QA verificado en 5176.

---

## 5. Siguientes Pasos (Hacia Fase 4)

Con los 7 juegos x 3 niveles completos y jugables, el proyecto queda listo para la **Fase 4**:
- Cálculo e integración de estrellas por sesión en base a `errorsCount` y `hintsUsed`.
- Puntuación acumulada local (mejor marca por combinación juego+nivel, máx. 630 pts).
- Medallas de hitos pedagógicos y visualización en el Álbum.
