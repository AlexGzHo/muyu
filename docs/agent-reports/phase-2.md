# Reporte de Fase 2 — Tres Juegos Reales

**Proyecto:** Muyu: Crece Conmigo  
**Fecha:** 17 de octubre de 2026  
**Auditor:** Codex  
**Ejecutor:** Antigravity  
**Estado:** COMPLETA  

---

## 1. Resumen de Implementación de la Fase

Se implementaron y conectaron al dock del hogar los **tres minijuegos reales**, cada uno con su estructura obligatoria de **3 rondas independientes**, validación estricta de aciertos, soporte dual de entrada (Pointer Events para arrastre y modo táctil alternativo por toque), y emisión de identificador único de partida al finalizar para la economía de Fase 3.

### 1.1 Minijuego A — Contemos frutas (`src/activities/counting/CountingGame.tsx`)
- **Público / Enfoque:** Pensamiento matemático temprano (cantidades de 1 a 5).
- **Rondas y objetivos:** 3 rondas con metas diferenciadas (Ronda 1: 2 frutas; Ronda 2: 4 frutas; Ronda 3: 3 frutas).
- **Mecánica de depósito:** Bandeja de frutas que permite tanto arrastre continuo con Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`) como toque directo secuencial (tap-to-place).
- **Corrección y retiro:** Si el niño deposita frutas de más, puede tocar la canasta para retirar unidades una a una.
- **Validación rigurosa:** El botón de comprobación valida la cantidad real en la canasta contra el objetivo. No es posible avanzar con cantidad errónea ni saltarse la ronda. Los fallos activan un balanceo suave (`shake-feedback`) y permiten reintentar sin penalización.
- **Apoyo pedagógico prelector:** Contador visual con puntos guía (dots) para comparar la cantidad sin necesidad de abstracción numérica. Pista de audio en español repetible.

### 1.2 Minijuego B — Ayudemos a crecer (`src/activities/plant/PlantGame.tsx`)
- **Público / Enfoque:** Ciencia y ambiente (necesidades vitales de las plantas).
- **Secuencia biológica coherente:**
  - *Ronda 1 (Germinación):* La semilla en tierra necesita Agua (regadera).
  - *Ronda 2 (Brote tierno):* El brote verde emergente necesita Luz Solar (sol nutricio).
  - *Ronda 3 (Floración):* La planta adulta requiere tanto Agua como Sol para desplegar su flor tropical.
- **Distractores comprensibles para 3–5 años:** Zapato infantil, sombrero de paja y pelota de playa.
- **Validación y crecimiento visible:** Arrastre y toque alternativo. Los distractores son rechazados amablemente y no hacen avanzar la planta. La colocación de elementos correctos desencadena animación de crecimiento visible en la maceta (semilla → tallo con hojas → floración completa).

### 1.3 Minijuego C — Escucha y encuentra (`src/activities/listening/ListeningGame.tsx`)
- **Público / Enfoque:** Comunicación temprana y discriminación visual/auditiva.
- **Dinámica:** 3 rondas con 3 tarjetas ilustradas cada una, cambiando el objetivo en cada ronda:
  - *Ronda 1:* "El sol brillante" (entre flor, sol y canasta).
  - *Ronda 2:* "El tucancito" (entre tortuga, mono y tucán).
  - *Ronda 3:* "La fruta dulce" (entre hoja, fruta y regadera).
- **Pista de voz en español:** Locución pausada mediante `SpeechSynthesis` con botón de altavoz para repetir la indicación cuantas veces sea necesario.
- **Fallback VISUAL ANIMADO:** Botón de pista visual que despliega una burbuja con halo pulsante (`clue-pulse-glow`) mostrando la imagen del objetivo. Permite jugar y completar la actividad a niños con dificultades auditivas, sin sonido o en navegadores que bloqueen la síntesis de voz, sin depender de texto leído.
- **Validación:** Tocar la opción correcta confirma con destellos verdes y avanza; una opción errónea sacude la tarjeta suavemente y permite reintentar de inmediato.

### 1.4 Conexión de Eventos para Fase 3
Al completar las 3 rondas de cualquiera de los tres juegos, se dispara la pantalla de celebración y se emite el callback:
```ts
onComplete(activityId: 'counting' | 'plant' | 'listening', matchId: string)
```
Donde `matchId` es un identificador único (ej. `match_counting_1773789000_abc12`), preparando el acreditamiento determinista de +1 alimento en el inventario para la Fase 3.

---

## 2. Correcciones Solicitadas por el Auditor

1. **Eliminación de Emojis en el Dock de `PetHomeScreen.tsx`:** Se removieron los caracteres de emoji (`🌱` y `👂`) de las píldoras inferiores del dock, reemplazándolos por etiquetas de texto limpias y legibles: `"1·2·3"`, `"Planta"` y `"Escucha"`.
2. **Corrección de Declaración de Git en `phase-1.md`:** Se rectificó la redacción para declarar con precisión que el working tree contiene modificaciones pendientes de commit y elementos sin seguimiento previstos, no un árbol limpio de commits.
3. **Inspección vs Ejecución:** Se eliminaron afirmaciones de pruebas E2E no soportadas por herramientas de automatización, limitando las aseveraciones a la inspección estricta de código, compilación y pruebas de linter.

---

## 3. Archivos Modificados y Creados

### Archivos creados
- `src/activities/counting/CountingGame.tsx`: Lógica y UI de conteo de 1 a 5 con 3 rondas y arrastre/toque.
- `src/activities/plant/PlantGame.tsx`: Lógica y UI de ciencia con agua, sol, distractores y crecimiento en maceta.
- `src/activities/listening/ListeningGame.tsx`: Lógica y UI de escucha con pista de voz y fallback visual animado.
- `src/audio/soundManager.ts`: Módulo de audio nativo (Web Audio API para tonos y `SpeechSynthesis` para voz española).
- `src/components/svg/GameIllustrations.tsx`: Ilustraciones SVG para canasta, frutas, regadera, sol, maceta en 3 fases, distractores y objetos de escucha.
- `docs/agent-reports/phase-2.md`: Este reporte.

### Archivos modificados
- `src/screens/PetHomeScreen.tsx`: Dock conectado a los minijuegos reales y limpieza de emojis.
- `src/App.tsx`: Enrutamiento activo para las pantallas de actividades y callback `handleGameComplete`.
- `src/styles/global.css`: Estilos de juego, indicadores de rondas, zonas de arrastre, feedback de sacudida/rebote y accesibilidad `prefers-reduced-motion`.
- `docs/agent-reports/phase-1.md`: Rectificación documental solicitada.

### Elementos preservados
- Carpeta `EVIDENCIA A4/` intacta.
- Archivo histórico `src/screens/HomeScreen.tsx` intacto.

---

## 4. Comandos Ejecutados y Resultados Reales

| Comando literal | Salida / Observación | Código de salida |
| :--- | :--- | :---: |
| `npm.cmd run build` | `tsc -b && vite build` completado. 29 módulos empaquetados en `dist/` en 272 ms. Cero errores de TypeScript. | `0` |
| `npm.cmd run lint` | `oxlint` completado sin errores ni advertencias de hooks/React. | `0` |
| `git status` | Modificaciones esperadas en `src/`, nuevos archivos de actividades y preservación de `EVIDENCIA A4/`. | `0` |

---

## 5. Criterios de Aceptación Comprobados

- [x] Tres minijuegos reales, interactivos y con 3 rondas cada uno.
- [x] Conteo: cantidades 1 a 5, frutas depositadas con validación estricta; no se puede ganar sólo pulsando continuar ni con cantidad incorrecta.
- [x] Planta: secuencia agua/luz biológicamente coherente con distractores comprensibles y crecimiento visible.
- [x] Escucha: 3 imágenes cambiantes por ronda, pista de voz repetible y fallback visual animado independiente del audio.
- [x] Doble canal de interacción (Pointer Events para arrastre y modo táctil alternativo por toque).
- [x] Cero emojis usados como iconos; botones principales ≥ 64px; sin `alert`, `confirm` ni `prompt`.
- [x] Callback `onComplete` confiable con identificador único emitido por partida para conectar la economía en Fase 3.
- [x] `npm.cmd run build` y `npm.cmd run lint` finalizados con código 0.

---

## 6. Pendientes para Fase 3

- **Fase 3 (Ciclo completo y guardado):**
  - Conectar los eventos `onComplete` con el acreditamiento de **exactamente un alimento** por partida de 3 rondas (idempotente, evitando duplicación al refrescar o volver).
  - Mecánica de alimentación en el Hogar (arrastrar alimento a la mascota y alternativa por toque).
  - Avance de etapas de crecimiento: cada 2 alimentaciones avanza una etapa (`inicio → etapa 1 → etapa 2 → adulto`).
  - Persistencia individual en `localStorage` por mascota (mono, tortuga, tucán) sin números negativos.
