# Terceros y Atribución de Licencias — Muyu: Crece Conmigo

Este documento registra las dependencias, componentes y referencias externas del proyecto **Muyu: Crece Conmigo**, distinguiendo con precisión entre lo **efectivamente implementado en el producto**, lo **propuesto para portar**, y lo que actúa como **mera inspiración pedagógica o de diseño**.

---

## 1. Dependencias Directas (Implementadas en `package.json`)

| Paquete | Versión | Licencia | Estado | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **react** | `^19.2.8` | MIT | Implementado | Biblioteca base de interfaz de usuario. |
| **react-dom** | `^19.2.8` | MIT | Implementado | Renderizador DOM para React. |
| **vite** | `^8.3.0` | MIT | Implementado | Empaquetador y servidor de desarrollo. |
| **typescript** | `~6.0.2` | Apache-2.0 | Implementado | Sistema de tipado estático y compilación. |
| **oxlint** | `^1.81.0` | MIT / Apache-2.0 | Implementado | Linter de alto rendimiento. |
| **@vitejs/plugin-react** | `^6.1.1` | MIT | Implementado | Plugin Fast Refresh para Vite. |

---

## 2. Código de Código Abierto Adaptado y Referenciado

### A. Tamagochi — Open Source Game (Implementado)
- **Repositorio canónico:** `https://github.com/Tech-aficionado/Tamagochi---Open-Source-Game` (Rama: `main`)
- **Licencia:** MIT License
- **Copyright:** Copyright (c) 2026 Tamagochi contributors
- **Archivos verificados:**
  - `src/game/save.ts` (SHA: `983840f54645e0cc4a079adf3a19d0743f2567a2`): sanitización determinista (`bounded`, `integer`, `isRecord`). **Implementado** en `src/game/persistence.ts`.
  - `src/game/progression.ts` (SHA: `e52ab6a63540fda1d1f2c4ebc527ab48fe7b9da7`): estructura de umbrales `GrowthStageDefinition` (`minimum`, `nextAt`).
- **Detalle de adaptación:** Se adoptaron las funciones de sanitización determinista y el modelo numérico de etapas de crecimiento desacoplado del tiempo. Se descartaron íntegramente el motor 3D (Three.js/R3F), decrecimiento temporal de necesidades y temporizadores punitivos.
- **Texto completo de la licencia:**

```text
MIT License

Copyright (c) 2026 Tamagochi contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### B. Edukiz (Mera Inspiración Conceptual — Sin Copia de Código)
- **Repositorio canónico:** `https://github.com/timmalich/edukiz` (Rama: `main`)
- **Licencia:** MIT License
- **Copyright:** Copyright (c) 2020 Tim Malich
- **Dependencia base del repositorio:** Vue 3 (`vue: "^3.3.4"`, Vite).
- **Archivos verificados en árbol:** `src/components/memory/MemoryGame.vue` (SHA: `7455a21cc355a3a40f0cf7770cc597edfab65822`), `src/utils/logger.js`.
- **Declaración de no copia:** Tras auditoría del árbol `src/utils/` en la API oficial de GitHub, se confirmó que `ArrayUtils.js` **no existe** en dicho repositorio (devuelve 404). Por tanto, **NO se ha copiado ningún archivo ni función de Edukiz**. Actúa exclusivamente como **inspiración conceptual** de dinámicas infantiles offline. Las secuencias pedagógicas de patrones (AB → AAB/ABB → ABC para J2) son 100% de autoría original para Muyu.
- **Texto completo de la licencia:**

```text
MIT License

Copyright (c) 2020 Tim Malich

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### C. Memory Game (Lógica de Mejor Marca sin Copia de Arte)
- **Repositorio canónico:** `https://github.com/sromku/memory-game` (Rama: `master`)
- **Licencia:** Apache License 2.0 (código fuente)
- **Copyright:** Copyright 2014-2026 Roman Nurik / sromku
- **Lenguaje:** Kotlin (Android).
- **Archivos verificados:**
  - `app/src/main/kotlin/com/snatik/matches/game/progression/Progress.kt` (SHA: `518eb832f451c65155e9cf67d9c023d58b491502`).
  - `app/src/main/kotlin/com/snatik/matches/game/progression/RoundSpec.kt` (SHA: `c6df39a81b197b93e4680223db1047f0ef99d650`).
  - `app/src/main/kotlin/com/snatik/matches/game/GameResult.kt` (SHA: `6d4a74d46caae2a90d6ecef19327685630d10e5f`).
- **Función concreta adaptada conceptualmente:** Algoritmo de preservación de mejor marca (`RoundResult.improvedBy`), que registra la mejor marca de estrellas por combinación sin permitir acumulación infinita por repetición (anti-farming).
- **AVISO ESTRICTO DE ILUSTRACIONES Y ARTE:** Las ilustraciones del juego poseen **licencias independientes**. Queda **terminantemente prohibido copiar o importar cualquier recurso gráfico o arte** de este repositorio. Todo el arte visual de Muyu es 100% vectorial SVG propio.
- **Texto completo de la Licencia Apache 2.0:**

```text
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.
      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work.

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner.

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:
      (a) You must give any other recipients of the Work or Derivative Works
          a copy of this License; and
      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and
      (c) You must retain, in the Source form of any Derivative Works that
          You distribute, all copyright, patent, trademark, and attribution
          notices from the Source form of the Work; and
      (d) If the Work includes a "NOTICE" text file as part of its distribution,
          then any Derivative Works that You distribute must include a readable
          copy of the attribution notices contained within such NOTICE file.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or agreed
      to in writing, Licensor provides the Work (and each Contributor provides
      its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
      OF ANY KIND, either express or implied, including, without limitation,
      any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY,
      or FITNESS FOR A PARTICULAR PURPOSE.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      shall any Contributor be liable to You for damages, including any
      direct, indirect, special, incidental, or consequential damages of
      any character arising as a result of this License or out of the use
      or inability to use the Work.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License.
```

---

---

### D. react-nice-avatar (Patrón Arquitectónico de Capas SVG)
- **Repositorio canónico:** `https://github.com/dapi-labs/react-nice-avatar`
- **Licencia:** MIT License
- **Copyright:** Copyright (c) 2021 dapi-labs
- **Uso en Muyu:** Referencia técnica para la descomposición modular de piezas y accesorios SVG en capas React (`headwear`, `eyewear`, `neckwear`, `body`) con orden estricto de pintado DOM y tipado de propiedades. No se importó la dependencia ni sus gráficos; se implementaron capas vectoriales originales adaptadas a la anatomía animal de Muyu.

### E. FBLA-PET-GAME (Patrón Conceptual de Economía de Tienda)
- **Repositorio canónico:** `https://github.com/rkoppa123/FBLA-PET-GAME`
- **Licencia:** MIT License
- **Copyright:** Copyright (c) 2026 Rahul Kopparapu, Milan Patel, Neil Parikh
- **Uso en Muyu:** Referencia conceptual para el desacoplamiento estricto entre saldo canjeable gastable y el progreso vital/récord histórico, así como inventario por mascota y protección contra saldos negativos. Cero copia de código ni librerías externas.

---

## 3. Fuentes Evaluadas y Descartadas

| Fuente | Licencia | Decisión | Motivo técnico |
| :--- | :--- | :--- | :--- |
| **avatar-builder** (`AakashKakkar`) | MIT | Descartado como paquete | Servicio en Python/Rust ajeno al stack cliente React/Vite de Muyu; se toma como referencia de composición modular JSON -> SVG. |
| **NeoPet-Virtual-Pet-Web-App** (`EgoisticCoder`) | Sin licencia formal (`private: true`) | Inspiración conceptual únicamente | Referencia de tienda de accesorios y equivalencia de recompensas; sin copia de código, activos ni librerías externas. |
| **dnd-kit** | MIT | Descartado | La interacción táctil y drag & drop se resuelve con Pointer Events estándar (`onPointerDown/Move/Up`) sin dependencias externas. |
| **Motion** | MIT | Descartado | Animaciones CSS nativas con aceleración por GPU y respeto a `@media (prefers-reduced-motion: reduce)` sin añadir dependencias. |
| **Kenney Animal Pack** | CC0 | Descartado (sprites) | No contiene el conjunto homogéneo requerido (mono, tortuga, tucán en 4 etapas anatómicas). Se usan SVGs originales. |
| **Digital Pet Game** | MIT | Descartado | Penalizaciones por inactividad contrarias a la pedagogía infantil de Muyu. |

---

## 4. Recursos Visuales y Sonoros Propios (Originales)

- **Ilustraciones vectoriales (SVG):** Diseños vectoriales creados exclusivamente para Muyu para mono, tortuga y tucán.
- **Iconografía táctil:** Pictogramas SVG de gran tamaño (≥ 64×64 px) diseñados para una navegación infantil sin requerir alfabetización.
- **Efectos auditivos:** Tonos armónicos y recompensas sintetizados nativamente mediante `AudioContext` (Web Audio API) y `SpeechSynthesis` para locución en español.
