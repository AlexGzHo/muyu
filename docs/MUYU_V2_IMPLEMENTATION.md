# Muyu 2.0: El Bosque Crece — Guía de Implementación y Arquitectura

**Proyecto:** Muyu 2.0 (Upgrade desde MVP) | **Ruta:** `C:\Proyectos\Muyu`  
**Supervisión y Auditoría UI:** Codex | **Investigación y Soporte:** Antigravity  
**Estatus Fase 5:** **PARCIAL** (pendiente ejecución de capturas y verificación final)  
**Fecha:** 2026-10-18  

---

## 1. Comandos de Ejecución y Entorno

Cadena de herramientas estándar (React 19 + TypeScript + Vite + oxlint + Node.js test runner):

```powershell
# Servidor Vite aislado en puerto 5176 (QA y evidencias)
npx vite --port 5176

# Compilación de producción y análisis estático
npm.cmd run build
npm.cmd run lint

# Suite de pruebas unitarias (58 tests reportados, pendiente check final por supervisor)
npm.cmd test

# Script nativo de capturas headless (Node 24 builtin + CDP, sin npm i ni npx)
node docs/evidence/v2/capture-screens.mjs --run
```

> **Salvaguarda de Entorno:** El puerto exclusivo de desarrollo y QA es **5176**. Queda estrictamente prohibido interactuar con el puerto **5174** para salvaguardar los datos reales del usuario.

---

## 2. Arquitectura del Sistema

```
C:\Proyectos\Muyu\
├── docs/
│   ├── MUYU_V2_IMPLEMENTATION.md       # Guía sintética de entrega y arquitectura (<= 100 líneas)
│   ├── THIRD_PARTY.md                  # Procedencia de licencias y terceros
│   └── evidence/v2/
│       ├── pet-comparison.html         # Visor Vite (12 formas 3x4 + 4 reacciones, 0 emojis)
│       ├── pet-comparison.tsx          # Componente React que usa PetRenderer real
│       └── capture-screens.mjs         # Automatización CDP nativa (7 capturas PNG)
├── src/
│   ├── activities/                     # 7 minijuegos pedagógicos deterministas (J1 a J7)
│   ├── components/svg/                 # PetIllustrations (12 formas), GameIllustrations, UiIcons
│   ├── game/                           # Reglas puras, modelos PRNG y persistencia V1->V2
│   └── screens/                        # Welcome, SelectPet, PetHome, Activities, Album, Result
└── tests/rules.test.ts                 # 58 pruebas unitarias reportadas
```

### Principios Fundamentales
1. **Modelos Deterministas y PRNG:** Las 21 actividades pedagógicas usan generadores semillados por partida; recargar mantiene estado y metas.
2. **0 Emojis en la Interfaz:** Iconografía 100% SVG vectorial propia (`UiIcons.tsx`), accesible y táctil (≥ 64×64 px).
3. **Persistencia No Destructiva:** La clave MVP `muyu_game_save_v1` permanece intacta. Aplica *Adult Floor*, aislamiento por especie y techo de 630 pts.
4. **Interacción Web Universal:** Eventos pointer (`PointerDown/Move/Up`) compatibles con ratón y pantallas táctiles sin hardware propietario.

---

## 3. Estado de Fase 5 y Auditoría

- **Estatus Global Fase 5:** **PARCIAL**. Pendiente la ejecución de capturas reales y la aprobación final del supervisor.
- **Auditoría UI:** Realizada previamente por **Codex** en sesión interactiva en puerto 5176 (validó evolución del Monito a Adulto en 147 u, 6/6 medallas, 300 pts, y aislamiento con Tortuga).
- **Pruebas Automatizadas:** 58 pruebas unitarias reportadas en `tests/rules.test.ts`. *Este job de corrección puntual no ejecutó la suite; queda pendiente el check final por parte del supervisor.*
- **Visor Anatómico:** `pet-comparison.html` simplificado a matriz compacta 3×4 (12 formas) con 4 reacciones abajo, ajustado a 1280×960 y con erradicación total de emojis.

---

## 4. Capturas de Evidencia Canónicas (7 Pantallas)

El script `docs/evidence/v2/capture-screens.mjs` utiliza Edge/Chrome headless con perfil temporal y CDP loopback:
1. `01_portada.png`: Bienvenida con trío interactivo (`/`)
2. `02_bosque.png`: Bosque hub con mascota activa
3. `03_catalogo.png`: Catálogo con las 7 actividades
4. `04_juego.png`: Minijuego activo (J2 Patrones)
5. `05_resultado.png`: Victoria tras 3 rondas completadas vía DOM
6. `06_album.png`: Álbum de etapas y medallas
7. `07_12formas.png`: Matriz compacta 12 formas + 4 reacciones (`/docs/evidence/v2/pet-comparison.html`)
