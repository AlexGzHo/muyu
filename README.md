# Muyu: Crece Conmigo — MVP 1.0

Aplicación web interactiva infantil para niñas y niños de 3 a 5 años desarrollada con React 19, TypeScript y Vite.

---

## 1. Comandos de Ejecución Reales

En entorno Windows / PowerShell se recomienda el uso de `npm.cmd` o `npm`:

```bash
# Navegar al directorio de trabajo
cd C:\Proyectos\Muyu

# Instalar dependencias (solo si es necesario)
npm.cmd install

# Iniciar servidor de desarrollo en http://127.0.0.1:5174 (puerto exacto de pruebas):
npm.cmd run dev -- --host 127.0.0.1 --port 5174
# Nota: el comando base `npm.cmd run dev` sin flags levanta por defecto en http://localhost:5173

# Ejecutar la suite de pruebas unitarias automatizadas (requiere Node.js 22.6+ con soporte nativo de --experimental-strip-types):
npm.cmd test

# Validar calidad de código y linter (oxlint):
npm.cmd run lint

# Compilar tipos TypeScript y generar bundle de producción en dist/:
npm.cmd run build
```

---

## 2. Arquitectura del Proyecto

```text
C:\Proyectos\Muyu\
├── docs/
│   ├── agent-reports/       # Reportes por fase de auditoría técnica
│   └── THIRD_PARTY.md       # Licencias y componentes reutilizados
├── src/
│   ├── activities/          # Minijuegos: Conteo, Planta y Escucha
│   ├── audio/               # Síntesis Web Audio y SpeechSynthesis
│   ├── components/          # Ilustraciones SVG originales y modales
│   ├── game/                # Reglas puras, tipos y persistencia localStorage
│   ├── screens/             # Pantallas: Bienvenida, Selector y Hogar
│   └── styles/              # Variables CSS y tokens de diseño infantil
├── tests/
│   └── rules.test.ts        # Suite de pruebas unitarias deterministas
└── README.md
```

---

## 3. Características Clave

- **100% Gráficos Vectoriales SVG:** Sin emojis ni dependencias pesadas de assets externos.
- **Interacción Multicanal:** Soporte para arrastre táctil/puntero (`touch-action: none`) y toque alternativo en todos los flujos.
- **Economía e Idempotencia:** 3 rondas completadas entregan exactamente 1 alimento con ID de partida estable.
- **Persistencia Segura:** Reanuda la sesión en la ronda exacta y resiste esquemas corruptos sin provocar pantalla blanca.
- **Accesibilidad:** Diseñado para botones $\ge 64$px, reducción de movimiento (`prefers-reduced-motion`) y atajos de teclado (`Enter` / `Espacio`).
