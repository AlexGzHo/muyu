# Referencias Técnicas — Muyu: Crece Conmigo
**Fase 1 · Investigación de Mecánicas de Mascotas**  
Fecha: 2026-10-15 · Investigador: Agente Técnico Muyu

---

## 1. Repositorios Analizados

| Repo | URL | Licencia | Estado |
|------|-----|----------|--------|
| Meowtron | https://github.com/CatWithNineLives/meowtron | MIT (declarada en README; sin archivo LICENSE físico) | ✅ Analizado |
| TamaGatcha | https://github.com/mizziness/tamagatcha | MIT (Copyright © 2026 Tammy Shipps) | ✅ Analizado |

> [!IMPORTANT]
> Ambas licencias MIT permiten libre copia, modificación y distribución sin restricciones. Se puede reutilizar lógica y patrones de ambos proyectos. Sin embargo, **no copiar archivos fuente completos** sin atribución en comentario de código.

---

## 2. Meowtron — Mecánicas y Archivos Responsables

### Stack
- **React 19** + **Vite 7** · CSS Vanilla puro · Web Audio API nativa
- **Cero dependencias de producción externas** (solo `react` + `react-dom`)
- Gestión de estado: **React puro** (`useState`, `useEffect`, `useCallback`, `useRef`)

### Archivos Clave Verificados

| Archivo Solicitado | Ruta Real | ¿Existe? |
|--------------------|-----------|----------|
| `usePetStats.js` | `src/hooks/usePetStats.js` | ✅ Sí |
| `useSpriteAnimation.js` | `src/hooks/useSpriteAnimation.js` | ✅ Sí |
| `petLogic.js` | `src/utils/petLogic.js` | ✅ Sí |

Archivos adicionales relevantes:
- `src/hooks/useMultiSpriteAnimation.js` — encadena múltiples sprite sheets en secuencia o al azar
- `src/hooks/usePetSounds.js` — gestión de audio (maullidos, ronroneos, quejas)
- `src/utils/spriteUtils.js` — cálculo matemático de frames de sprite

### Mecánicas Implementadas

#### A. Alimentación / Acciones (`petLogic.js` → `applyAction`)
```
feed:  hunger +25, energy -5
play:  happiness +20, hunger -5, energy -10
sleep: energy +30, hunger -5
```
- Todos los valores con `clamp(val, 0, 100)`
- Anti-spam: cooldown de 500 ms por botón tras cada acción
- Atajos de teclado: `F`, `P`, `S` (implementados, no documentados)

#### B. Animación (`useSpriteAnimation.js`)
- **Sin canvas ni librerías**: sprites PNG horizontales + CSS puro
- Técnica: `backgroundPosition: -${frame * frameWidth}px 0` con `imageRendering: pixelated` (pixel art x4)
- FPS: 10 por defecto, 3 FPS en estados felices
- `useMultiSpriteAnimation`: alterna hojas de sprites en secuencia o modo `random: true`
- **Mood Glow**: filtros CSS `drop-shadow` por estado:
  - Happy → Cian `#00FFF7` · Hungry → Rosa `#FF6EC7` · Sleepy → Púrpura `#B266FF`
  - Angry → Rojo `#FF4D4D` · Critical → Rojo intenso · Dead → `#660000`

#### C. Estados y Decaimiento (`petLogic.js` → `determineMood`, `calculateDecay`)
- **7 estados** en cascada de prioridad: `dead → critical → angry → hungry → sleepy → happy → idle`
- Decaimiento: **0.5 pts/seg**, ejecutado cada 30–60 s (intervalo aleatorio)
- Multiplicadores: `feed` desacelera hambre (×0.3), `play` desacelera felicidad (×0.3), `sleep` desacelera energía (×0.2)
- ⚠️ **Espiral de muerte** (`rapidDecayMultiplier = 5.0`): si 2 stats llegan a 0, la restante decae ×5

#### D. Progresión
- **No existe.** Bucle cerrado de supervivencia. Sin XP, niveles, edad, ni desbloqueo.

#### E. Persistencia (`usePetStats.js`)
- `localStorage` bajo clave `'meowtron-pet-stats'`
- Guarda `{ hunger, happiness, energy }` en cada cambio de stats
- Inicia en `50/50/50` si no hay datos guardados
- ⚠️ **Sin cálculo offline**: al regresar la mascota tiene exactamente los mismos stats de cuando se fue

### Documentado pero NO implementado

| Característica | En Docs | En Código |
|----------------|---------|-----------|
| Componente `SpriteAnimation.jsx` | Sí (spec.md) | ❌ No; reemplazado por hooks |
| Evolución, Mini-juegos, Logros, Monedas | Sí (spec.md "Future") | ❌ No implementados |
| Archivo `LICENSE` físico | README dice MIT | ❌ Archivo no existe |
| Modo Debug terminal retro (`/dev/meowtron`) | No documentado | ✅ Implementado (6 clics → terminal) |
| Efectos de sonido | "Mejora futura" en spec | ✅ Completamente implementados |
| Estados `critical` y `dead` | Solo 5 estados en README | ✅ 7 estados implementados |

---

## 3. TamaGatcha — Mecánicas y Archivos Responsables

### Stack
- **React 19** + **Vite 8** + **React Router 7** + **Tailwind CSS 4**
- **Zustand 5** — gestión de estado global
- **@react-spring/web 10** — animaciones físicas tipo resorte
- **react-svg 17** — inyección dinámica de SVGs para colorear capas

### Archivos Clave Verificados

| Archivo Solicitado | Ruta Real | ¿Existe? |
|--------------------|-----------|----------|
| `petStore.js` | `src/store/petStore.js` | ✅ Sí |
| `petRules.js` | `src/helpers/petRules.js` | ✅ Sí |
| `usePetActions.js` | `src/helpers/usePetActions.js` | ✅ Sí |

Archivos adicionales relevantes:
- `gameConfig.js` — configuración central (ticks, equivalencias de tiempo, velocidades)
- `src/helpers/gameTiming.js` — cálculo de ticks y tiempo transcurrido offline
- `src/helpers/eggSelection.js` — generación procedural con probabilidades ponderadas
- `src/helpers/utilities.js` — `safeParse()` para JSON defensivo en localStorage
- `src/store/authStore.js` — sesión local de usuario (multi-perfil)
- `src/store/eggStore.js` — inventario de huevos
- `src/store/settingsStore.js` — velocidad de simulación (1×, 2×, 3×)

### Mecánicas Implementadas

#### A. Alimentación / Cuidados (`usePetActions.js`)
```
feed:  hunger +30, health +5
play:  happiness +X
sleep: energy +X
clean: cleanliness +X
```
- Cada acción despacha registro estructurado a `addPetEvent()` (historial FIFO, tope 264 entradas)

#### B. Animación (`EggSelection.jsx`, `Pet.jsx`)
- **Huevos**: oscilación tipo resorte con `@react-spring/web` (-6° a +6° con pausas aleatorias)
- **Hover**: rebote con clase Tailwind `group-hover:animate-hover-bounce`
- **Re-roll**: transición con Web Animations API nativa (fade out / fade in)
- ⚠️ **Mascota activa**: solo `transform: scale()` oscilado por `Math.sin()` — visualmente incompleta

#### C. Stats y Mood (`usePetActions.js`, `StatusBars.jsx`)
- **5 stats continuas** (0–100): `hunger`, `happiness`, `energy`, `health`, `cleanliness`
- **Mood derivado**: promedio >70 = *happy*, >40 = *neutral*, ≤40 = *sad*, 0 = *dead*
- Barras de color dinámico: >60 verde · >30 amarillo · ≤30 rojo

#### D. Progresión y Envejecimiento (`gameConfig.js` + `petRules.js` + `gameTiming.js`)
- Ticks de **1 segundo real** (`TICK_MS = 1000`)
- Equivalencia: 1 día real = 91.25 días mascota (1× velocidad); ciclo vital = 5 años mascota en 20 días reales
- `getPetLifeStage`: `baby` <0.5a → `child` <2a → `adult` <4a → `elderly` ≥4a
- **Cálculo offline**: `computeElapsedTicks` recalcula tiempo transcurrido al reabrir la app

#### E. Persistencia (`petStore.js` + `utilities.js`)
- `localStorage` con claves por usuario: `tamagacha_pets_${user}`, `tamagacha_events_${user}_${petId}`
- Multi-perfil nativo (varios niños en el mismo dispositivo)
- Autosave cada 3 ticks (`AUTOSAVE_TICKS`)
- `safeParse()` con manejo defensivo de errores

### Documentado pero NO implementado

| Característica | En Docs | En Código |
|----------------|---------|-----------|
| Renderizado visual del Slime (mascota) | Sprites en `/public/images/` | ❌ `Pet.jsx` solo renderiza `<div>` vacío |
| Genética / DNA funcional | Implementado en eclosión | ❌ No afecta gameplay ni apariencia |
| Colección y Graveyard | En roadmap README | ❌ No existen rutas ni componentes |
| Concursos, paseos, crossbreeding | Roadmap README | ❌ Sin código |
| `eggStore.js` conectado al flujo | Existe el store | ❌ `App.jsx` bypasea el store |

---

## 4. Comparativa: Meowtron vs TamaGatcha

| Aspecto | Meowtron | TamaGatcha |
|---------|----------|------------|
| Complejidad | ⭐ Baja | ⭐⭐ Media |
| Dependencias prod. | 0 extra | Zustand + react-spring + react-svg |
| Motor de sprites | ✅ Completo (CSS) | ⚠️ Parcial (solo huevos) |
| Progresión/edad | ❌ No | ✅ Completa + offline |
| Multi-perfil | ❌ No | ✅ Nativo |
| Decaimiento offline | ❌ No | ✅ Sí (computeElapsedTicks) |
| Animación táctil | ✅ Fade in/out suave | ⚠️ Solo spring en huevos |
| Cooldown anti-spam | ✅ 500 ms | ❌ No |
| Lógica pura testeable | ✅ (`petLogic.js`) | ✅ (`petRules.js`) |

---

## 5. Recomendación para Muyu: Crece Conmigo

### Tomar de Meowtron
| Qué | Archivo origen | Motivo |
|-----|---------------|--------|
| Motor de sprites CSS | `useSpriteAnimation.js` / `useMultiSpriteAnimation.js` | Ligero, sin dependencias, pixel-art perfecto, multi-sheet |
| Animaciones de acción superpuestas (fade in/out) | `PetDisplay.jsx` | Ideal para respuesta visual inmediata al toque de niños |
| Lógica pura en funciones aisladas | `petLogic.js` → `clamp`, `applyAction` | Testeable, desacoplada de UI |
| Anti-spam (cooldown 500 ms) | `ActionButtons.jsx` | Evita saturación en pantallas táctiles infantiles |
| Atajos de teclado opcionales | `App.jsx` | Accesibilidad |

### Tomar de TamaGatcha
| Qué | Archivo origen | Motivo |
|-----|---------------|--------|
| Motor de tiempo desacoplado | `gameConfig.js` + `gameTiming.js` | Crecimiento orgánico real; resistente a reinicios |
| Etapas de crecimiento por edad | `petRules.js` → `getPetLifeStage` | Bebé→Juvenil→Adulto vinculable a actividades educativas |
| Persistencia multi-perfil | `petStore.js` + `utilities.js` | Varios niños en el mismo dispositivo |
| Registro de hitos / bitácora | `EventLog.jsx` + `addPetEvent` | Álbum de recuerdos (logros positivos) |
| Zustand como gestor de estado | `petStore.js` | Mínimo boilerplate, escribible fuera de React (timers) |

### Descartar / Modificar
| Elemento | Por qué |
|----------|---------|
| Estados `dead`, `critical` | Angustiante para niños; eliminación total |
| `rapidDecayMultiplier = 5.0` | Mecánica de castigo; prohibida en Muyu |
| Efectos negativos cruzados (jugar resta hambre) | Confusión cognitiva en preescolares |
| Stats que llegan a 0 | Piso mínimo en 20–30; jamás llega a 0 |
| `checkIfDead` / `killPet` | Eliminar de `petRules.js` si se adopta |
| Monedas, graveyard, crossbreeding | Fuera de scope pedagógico |

### Adaptación Pedagógica de Stats
En lugar de stats que *castigan*, Muyu usa **necesidades que *invitan*:**

| Stat Muyu | Indicador visual | Trigger en baja | Acción invitada |
|-----------|-----------------|-----------------|-----------------|
| `animo` | Corazón / estrellas | "Oti quiere jugar" | Mini-juego educativo |
| `curiosidad` | Bombilla | "Tuki tiene preguntas" | Pregunta o cuento |
| `descanso` | Luna | "Nima quiere un cuento para dormir" | Audio/cuento |
| `nutricion` | Frutita | "Es hora de una merienda" | Actividad de alimentos |

> [!NOTE]
> Los valores nunca van a rojo alarmante. El rango visual mínimo es "descansado/neutral" con colores cálidos (naranja suave, amarillo), nunca rojo.

---

## 6. Progresión Infantil Propuesta

```
BEBÉ (etapa 0)
  └── Nivel 1: Nacimiento (0 alimentos ganados)
  └── Nivel 2: Primer juego (5 alimentos)
  └── Nivel 3: Primera palabra (10 alimentos)

JUVENIL (etapa 1) — desbloqueado con 15 alimentos
  └── Nivel 4: Explorador curioso
  └── Nivel 5: Amigo lector
  └── Nivel 6: Pequeño científico

ADULTO (etapa 2) — desbloqueado con 35 alimentos
  └── Nivel 7: Compañero pleno
  └── Cambios visuales: tamaño, accesorios, expresiones
```

**Alimentos ganados** = unidad de progresión; se obtienen completando actividades educativas (no comprando). Sin monedas.

**Vinculación educativa:**
- Responder correctamente una pregunta → +1 alimento
- Completar un mini-cuento → +2 alimentos
- Actividad de hábitos saludables → +1 alimento

---

## 7. Dependencias Mínimas para Muyu

```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "zustand": "^5.x",
    "@react-spring/web": "^10.x"
  }
}
```

> [!TIP]
> `@react-spring/web` es opcional si se adopta el motor CSS de Meowtron para sprites. Se puede prescindir de ella y usar solo CSS keyframes + `useSpriteAnimation` de Meowtron para mantener cero dependencias de animación.

---

## 8. Propuesta de Componentes para el Primer Circuito Jugable

```
src/
├── game/
│   ├── logic/
│   │   ├── petLogic.js          ← clamp, applyNeed, deriveAura (adapt. Meowtron)
│   │   ├── petRules.js          ← getLifeStage, getFoodThreshold (adapt. TamaGatcha)
│   │   └── gameTiming.js        ← tickEngine, computeOfflineTicks (adapt. TamaGatcha)
│   ├── hooks/
│   │   ├── usePetStats.js       ← stats + persistencia localStorage (adapt. Meowtron)
│   │   ├── useSpriteAnimation.js ← motor CSS sprites (Meowtron, mínima adaptación)
│   │   └── useGameTick.js       ← useEffect con tick engine (nuevo)
│   ├── store/
│   │   └── petStore.js          ← Zustand store; multi-perfil (adapt. TamaGatcha)
│   └── config/
│       └── gameConfig.js        ← TICK_MS, STAGE_THRESHOLDS, FOOD_PER_ACTIVITY
├── components/
│   ├── PetDisplay.jsx           ← sprite + acción superpuesta + aura (adapt. Meowtron)
│   ├── NeedIndicators.jsx       ← barras de necesidades (sin rojo; paleta cálida)
│   ├── ActionPanel.jsx          ← botones de interacción + cooldown 500ms
│   └── MilestoneLog.jsx         ← álbum de hitos positivos (adapt. TamaGatcha EventLog)
```

### Flujo del Primer Circuito Jugable

```
Inicio
  └─► petStore carga perfil de localStorage
        └─► useGameTick inicia tick engine
              └─► Cada tick: gameTiming.computeDecay → petStore.updateStats
                    └─► PetDisplay reacciona al aura actual
                          └─► Niño toca acción (ActionPanel)
                                └─► petLogic.applyNeed → petStore.setStats
                                      └─► Si necesidad educativa cubierta: +1 alimento
                                            └─► petRules.getLifeStage → ¿cambia etapa?
                                                  └─► MilestoneLog registra hito positivo
```

---

## 9. Conclusión y Próximos Pasos

**Arquitectura recomendada:** Híbrida Meowtron (sprites, lógica pura, anti-spam) + TamaGatcha (tiempo, progresión, persistencia multi-perfil, Zustand).

**Mecánicas que existen realmente vs. documentadas:**
- Meowtron: motor de sprites **100% funcional** y lógica de estados **100% funcional**; progresión **inexistente**.
- TamaGatcha: motor de tiempo y progresión **100% funcional**; mascota visual **incompleta** (solo `<div>`).

**Nada modifica código del juego todavía.** Este documento es solo referencia técnica.

---
*Generado por investigación directa de código fuente — sin REA — para Muyu: Crece Conmigo*
