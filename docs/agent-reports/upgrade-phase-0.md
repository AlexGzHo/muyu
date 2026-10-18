# Auditoría Fase 0 — Cierre de Punto de Recuperación e Investigación

**Auditor:** Codex | **Ejecutor:** Antigravity  
**Fecha:** 2026-10-17 | **Ruta:** `C:\Proyectos\Muyu` | **Estado:** Fase 0 Cerrada (sin edición de producto).

---

## 1. Verificación y Punto de Recuperación Aprobado

- **Respaldo ZIP Completo Ejecutado:**  
  Ejecutado con éxito el comando aprobado:  
  `Compress-Archive -Path src,public,docs,tests,package.json,package-lock.json,index.html,README.md,vite.config.ts,tsconfig.json,tsconfig.app.json,tsconfig.node.json,.oxlintrc.json,.gitignore -DestinationPath C:/Users/lizna/AppData/Local/Temp/muyu-v1-recovery-20261017.zip`  
  *Resultado:* Archivo zip generado íntegro y verificado.
- **Respaldos Nativos:** Copias individuales de seguridad preservadas en [`docs/recovery-v1/`](file:///C:/Proyectos/Muyu/docs/recovery-v1/).
- **Baseline de Código:**  
  - `npm.cmd run build`: Exitoso (bundle `dist/` 284 kB, 30 módulos).
  - `npm.cmd test`: 24/24 pruebas unitarias pasadas en [`tests/rules.test.ts`](file:///C:/Proyectos/Muyu/tests/rules.test.ts).
  - `npm.cmd run lint`: 0 advertencias / 0 errores.
- **Baseline UI Usuario:** Mono Adulto (`foodCount: 0`), Tortuga Bebé (`foodCount: 2`), Tucán Brote (`foodCount: 0`), seleccionado `toucan`, sonido apagado. Clave `'muyu_game_save_v1'` intacta; migración a `'muyu_game_save_v2'` mantendrá adultos sin rebajar.

---

## 2. Evidencia File-Level de Repositorios (Gaps V2)

### A. Tamagochi (MIT - 2026 contributors)
- **Archivos verificados:**  
  - `src/game/save.ts` (SHA: `983840f54645e0cc4a079adf3a19d0743f2567a2`): sanitización determinista. *Ya implementado en Muyu*.
  - `src/game/progression.ts` (SHA: `e52ab6a63540fda1d1f2c4ebc527ab48fe7b9da7`): estructura `GrowthStageDefinition` (`minimum`, `nextAt`).
- **Qué se porta a V2:** Mapeo numérico desacoplado de tiempo para umbrales de etapas en [`src/game/rules.ts`](file:///C:/Proyectos/Muyu/src/game/rules.ts).
- **Descartado:** Motor 3D (Three.js/R3F), decrecimiento de necesidades y eventos de incidente.

### B. Edukiz (MIT - Tim Malich, 2020) — Mera Inspiración (Sin Copia de Código)
- **Dependencia:** Vue 3 (`vue: "^3.3.4"`, Vite).
- **Archivos verificados en árbol:** `src/components/memory/MemoryGame.vue` (SHA: `7455a21cc355a3a40f0cf7770cc597edfab65822`), `src/utils/logger.js`.
- **Hallazgo crítico y corrección:** Tras verificar en la API de GitHub, se confirmó que `ArrayUtils.js` **no existe** (devuelve 404). Por tanto, **NO se ha copiado ningún archivo ni función de Edukiz** y se elimina toda atribución de código. Actúa exclusivamente como inspiración conceptual. Tanto la lógica de barajado como los patrones pedagógicos (AB → AAB/ABB → ABC para J2) son 100% de autoría original para Muyu.
- **Descartado:** Componentes `.vue`, framework Vue y Web Audio externo.

### C. Memory Game (SnatiK / sromku)
- **Licencia:** Apache-2.0 (código) | Lenguaje: Kotlin (Android).
- **Archivos verificados:**  
  - `app/src/main/kotlin/com/snatik/matches/game/progression/Progress.kt` (SHA: `518eb832f451c65155e9cf67d9c023d58b491502`).
  - `app/src/main/kotlin/com/snatik/matches/game/progression/RoundSpec.kt` (SHA: `c6df39a81b197b93e4680223db1047f0ef99d650`).
- **Qué se porta a V2:** Función `RoundResult.improvedBy` traducida a TypeScript, garantizando que una repetición registre únicamente la mejor marca (máx. 3 estrellas) sin sumar puntos ilimitados (anti-farming).
- **AVISO ESTRICTO DE LICENCIA GRÁFICA:** Las ilustraciones de `memory-game` poseen licencias independientes ajenas a Apache-2.0. **Se prohíbe copiar o importar arte**. Muyu utilizará exclusivamente SVGs originales propios.

---

## 3. Cierre y Transición

Fase 0 concluida sin modificar código de producto. Código base verificado y respaldado. Listo para recibir la delegación de la **Fase 1**.
