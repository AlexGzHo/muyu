/**
 * capture-screens.mjs
 * Script funcional de captura de evidencias visuales para Muyu 2.0 (Fase 5).
 * 
 * ESPECIFICACIONES:
 * - 100% módulos nativos de Node.js (node:child_process, node:fs, node:os, node:path, node:net, fetch, WebSocket).
 * - Sin dependencias externas, sin npx, sin paquetes de npm (cero descargas).
 * - Detección automática de Microsoft Edge o Google Chrome en rutas oficiales de Windows.
 * - Ejecución headless con perfil de usuario temporal y aislado (os.tmpdir()).
 * - Comunicación CDP directa por loopback (127.0.0.1) vía fetch + WebSocket nativo de Node 24.
 * - Salvaguarda estricta: ÚNICAMENTE navega a http://127.0.0.1:5176. Acceso a 5174 o externos bloqueado.
 * - Rutina guiada 100% por clics DOM reales:
 *     Portada -> Bosque -> Catálogo -> Juego (J2 Patrones) -> Resultado (3 rondas resueltas) -> Álbum -> Matriz 12 formas
 * - Genera 7 capturas PNG reales mediante Page.captureScreenshot en docs/evidence/v2/captures/.
 * 
 * COMANDO EXACTO PARA EJECUCIÓN SUPERVISADA:
 *   node docs/evidence/v2/capture-screens.mjs --run
 */

import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs'
import { join, resolve, basename, dirname } from 'node:path'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { createServer } from 'node:net'
import { URL } from 'node:url'

const TARGET_HOST = 'http://127.0.0.1:5176'
const FORBIDDEN_PORTS = ['5174']
const CAPTURES_DIR = join(process.cwd(), 'docs', 'evidence', 'v2', 'captures')

const CANONICAL_CAPTURES = [
  { id: '01_portada.png', name: 'Portada de bienvenida con trío interactivo' },
  { id: '02_bosque.png', name: 'Bosque central con mascota activa y estado' },
  { id: '03_catalogo.png', name: 'Catálogo con las 7 actividades canónicas' },
  { id: '04_juego.png', name: 'Minijuego activo (J2 El camino de los patrones)' },
  { id: '05_resultado.png', name: 'Pantalla unificada de victoria y recompensa' },
  { id: '06_album.png', name: 'Álbum del bosque, etapas y medallas' },
  { id: '07_12formas.png', name: 'Matriz comparativa compacta de 12 formas + 4 reacciones' },
]

/**
 * Localiza la ruta del ejecutable oficial de Microsoft Edge o Google Chrome en Windows.
 */
function findBrowserExecutable() {
  const localAppData = process.env.LOCALAPPDATA || ''
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files'
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'

  const candidates = [
    // Microsoft Edge
    join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    // Google Chrome
    join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ]

  for (const p of candidates) {
    if (p && existsSync(p)) return p
  }
  return null
}

/**
 * Valida que una URL apunte exclusivamente al entorno aislado de Vite en 5176.
 */
function validateTargetUrl(rawUrl) {
  const parsed = new URL(rawUrl)
  if (parsed.protocol !== 'http:') {
    throw new Error(`[SALVAGUARDA] Protocolo no permitido: ${parsed.protocol}. Solo se permite http:`)
  }
  if (parsed.hostname !== '127.0.0.1' && parsed.hostname !== 'localhost') {
    throw new Error(`[SALVAGUARDA] Host no permitido: ${parsed.hostname}. Solo loopback local.`)
  }
  if (parsed.port !== '5176') {
    throw new Error(`[SALVAGUARDA] Puerto ${parsed.port} estrictamente prohibido. Solo se permite 5176.`)
  }
  if (FORBIDDEN_PORTS.includes(parsed.port)) {
    throw new Error(`[SALVAGUARDA] Puerto 5174 bloqueado para proteger datos reales del usuario.`)
  }
}

/**
 * Busca un puerto de depuración libre en 127.0.0.1 a partir de un puerto base.
 */
function findOpenPort(startPort = 9223) {
  return new Promise((resolve) => {
    const server = createServer()
    server.listen(startPort, '127.0.0.1', () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
    server.on('error', () => {
      resolve(findOpenPort(startPort + 1))
    })
  })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Cliente CDP mínimo implementado sobre WebSocket nativo de Node.js.
 */
class CdpSession {
  constructor(ws) {
    this.ws = ws
    this.msgId = 0
    this.pending = new Map()

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.id && this.pending.has(data.id)) {
          const entry = this.pending.get(data.id)
          this.pending.delete(data.id)
          if (entry.timer) clearTimeout(entry.timer)
          if (data.error) {
            entry.reject(new Error(`CDP [${data.error.code}]: ${data.error.message}`))
          } else {
            entry.resolve(data.result)
          }
        }
      } catch {
        // Ignorar tramas no JSON
      }
    }

    this.ws.onclose = () => {
      this.rejectAllPending('Conexión CDP cerrada')
    }

    this.ws.onerror = (err) => {
      this.rejectAllPending(`Error de WebSocket CDP: ${err?.message || err}`)
    }
  }

  rejectAllPending(reason) {
    for (const [id, entry] of this.pending.entries()) {
      if (entry.timer) clearTimeout(entry.timer)
      entry.reject(new Error(`CDP cancelado (${id}): ${reason}`))
    }
    this.pending.clear()
  }

  send(method, params = {}, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error(`CDP timeout de 20s en llamada '${method}' (id: ${id})`))
        }
      }, timeoutMs)

      this.pending.set(id, { resolve, reject, timer })
      try {
        this.ws.send(JSON.stringify({ id, method, params }))
      } catch (err) {
        clearTimeout(timer)
        this.pending.delete(id)
        reject(err)
      }
    })
  }

  async eval(expression) {
    const exprStr = typeof expression === 'function'
      ? `(${expression.toString()})()`
      : String(expression)
    const res = await this.send('Runtime.evaluate', {
      expression: exprStr,
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      const details = res.exceptionDetails.text || JSON.stringify(res.exceptionDetails)
      throw new Error(`Error en evaluación JS: ${details}`)
    }
    return res.result?.value
  }

  async waitFor(condition, timeoutMs = 20000, intervalMs = 150) {
    const exprStr = typeof condition === 'function'
      ? `Boolean((${condition.toString()})())`
      : `Boolean(${condition})`
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      try {
        const ok = await this.eval(exprStr)
        if (ok === true) return true
      } catch {
        // Continuar esperando si la expresión aún arroja por elementos transitorios
      }
      await sleep(intervalMs)
    }
    throw new Error(`Timeout (${timeoutMs}ms) esperando condición: ${condition}`)
  }

  async capturePng(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' })
    const buffer = Buffer.from(res.data, 'base64')
    writeFileSync(outputPath, buffer)
    console.log(`[CAPTURA GUARDADA] ${outputPath} (${buffer.length} bytes)`)
  }

  close() {
    this.rejectAllPending('Sesión cerrada manualmente')
    try {
      this.ws.close()
    } catch {}
  }
}

/**
 * Conecta al endpoint CDP del navegador headless vía fetch + WebSocket.
 */
async function connectToBrowser(debugPort) {
  let list = null
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`)
      if (res.ok) {
        list = await res.json()
        break
      }
    } catch {
      // Reintento de conexión
    }
    await sleep(200)
  }

  if (!list) {
    throw new Error(`No se pudo conectar a la interfaz de depuración en puerto ${debugPort}`)
  }

  let pageTarget = list.find((t) => t.type === 'page')
  if (!pageTarget) {
    const newRes = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })
    pageTarget = await newRes.json()
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })

  const session = new CdpSession(ws)
  await session.send('Page.enable')
  await session.send('Runtime.enable')
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  })

  return session
}

/**
 * Rutina guiada automatizada: recorre todas las vistas mediante interacción DOM real.
 */
async function runGuidedCaptureWorkflow(session) {
  if (!existsSync(CAPTURES_DIR)) {
    mkdirSync(CAPTURES_DIR, { recursive: true })
  }

  console.log('\n--- INICIO DE RUTINA GUIADA DE CAPTURAS ---')

  // 1. Portada
  console.log('[1/7] Navegando a Portada...')
  validateTargetUrl(`${TARGET_HOST}/`)
  await session.send('Page.navigate', { url: `${TARGET_HOST}/` })
  await session.waitFor(() => Boolean(document.querySelector('.welcome-screen') && document.querySelector('.btn-play-hero')))
  await sleep(700)
  await session.capturePng(join(CAPTURES_DIR, '01_portada.png'))

  // 2. Bosque
  console.log('[2/7] Avanzando al Bosque...')
  await session.eval(() => {
    const btn = document.querySelector('.btn-play-hero')
    if (btn) btn.click()
  })

  await session.waitFor(() => Boolean(document.querySelector('.select-screen') || document.querySelector('.home-screen')))
  const onSelectScreen = await session.eval(() => Boolean(document.querySelector('.select-screen')))
  if (onSelectScreen) {
    console.log('   (Perfil nuevo: seleccionando primera mascota Monito)...')
    await session.eval(() => {
      const card = document.querySelector('.pet-selection-card')
      if (card) card.click()
    })
  }

  await session.waitFor(() => Boolean(document.querySelector('.home-screen')))
  await sleep(800)
  await session.capturePng(join(CAPTURES_DIR, '02_bosque.png'))

  // 3. Catálogo
  console.log('[3/7] Abriendo Catálogo de Actividades...')
  await session.eval(() => {
    const playCard = document.querySelector('.hub-action-card.play-area-card') ||
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('JUGAR'))
    if (playCard) playCard.click()
  })

  await session.waitFor(() => Boolean(
    document.querySelector('.activities-catalog-screen') &&
    document.querySelectorAll('.activity-card-item').length === 7
  ))
  await sleep(600)
  await session.capturePng(join(CAPTURES_DIR, '03_catalogo.png'))

  // 4. Juego Activo (J2 Patrones)
  console.log('[4/7] Iniciando minijuego J2: El camino de los patrones...')
  await session.eval(() => {
    const cards = Array.from(document.querySelectorAll('.activity-card-item'))
    const patternsCard = cards.find((c) => {
      const label = c.getAttribute('aria-label') || ''
      return label.includes('patrones') || label.includes('J2')
    }) || cards[1]
    if (patternsCard) patternsCard.click()
  })

  await session.waitFor(() => Boolean(document.querySelector('.patterns-game-screen') || document.querySelector('.pattern-road-container')))
  await sleep(800)
  await session.capturePng(join(CAPTURES_DIR, '04_juego.png'))

  // 5. Resultado (Completar 3 rondas en patronesInicial mediante clics DOM)
  console.log('[5/7] Completando 3 rondas pedagógicas de patrones...')
  for (let round = 0; round < 3; round++) {
    const currentExpectedText = `Ronda ${round + 1}/3`
    console.log(`   - ${currentExpectedText}...`)
    await session.waitFor(`(() => {
      const slots = document.querySelectorAll('.pattern-track .pattern-slot')
      const options = document.querySelectorAll('.pattern-option-btn')
      const roundPill = document.querySelector('.round-badge')
      return slots.length >= 4 && options.length > 0 && roundPill && roundPill.textContent.includes(${JSON.stringify(currentExpectedText)})
    })()`)
    await sleep(200)

    // En dificultad inicial (patrón AB-AB con hueco en casilla 4), la respuesta es la figura correspondiente a la casilla 2 (índice 1)
    await session.eval(() => {
      const slots = document.querySelectorAll('.pattern-track .pattern-slot')
      const targetLabel = slots[1]?.getAttribute('aria-label') || ''
      const symbolName = targetLabel.replace('Figura ', '').trim()
      if (!symbolName) {
        throw new Error('No se pudo identificar la figura esperada en la casilla 2 del patrón')
      }
      const buttons = Array.from(document.querySelectorAll('.pattern-option-btn'))
      const match = buttons.find((b) => (b.getAttribute('aria-label') || '').includes(symbolName))
      if (!match) {
        throw new Error(`[ERROR PATRÓN] No se encontró el botón de la opción esperada: '${symbolName}'`)
      }
      match.click()
    })

    if (round < 2) {
      const nextExpectedText = `Ronda ${round + 2}/3`
      console.log(`   Verificando avance a ${nextExpectedText}...`)
      await session.waitFor(`(() => {
        const roundPill = document.querySelector('.round-badge')
        return Boolean(roundPill && roundPill.textContent.includes(${JSON.stringify(nextExpectedText)}))
      })()`, 10000)
    } else {
      console.log('   Última ronda completada, verificando pantalla de resultado...')
      await session.waitFor(() => {
        return Boolean(
          document.querySelector('.result-screen') ||
          document.querySelector('.result-card-container') ||
          document.querySelector('.game-celebration-card')
        )
      }, 15000)
    }
  }

  console.log('   Esperando pantalla unificada de resultados...')
  await session.waitFor(() => Boolean(document.querySelector('.result-screen') || document.querySelector('.result-card-container')), 15000)
  await sleep(1000)
  await session.capturePng(join(CAPTURES_DIR, '05_resultado.png'))

  // 6. Álbum
  console.log('[6/7] Regresando al Bosque y navegando al Álbum...')
  await session.eval(() => {
    const exitBtn = document.querySelector('.btn-result-forest') ||
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('BOSQUE'))
    if (exitBtn) exitBtn.click()
  })

  await session.waitFor(() => Boolean(document.querySelector('.home-screen')))
  await sleep(600)

  await session.eval(() => {
    const albumBtn = document.querySelector('.hub-action-card.album-area-card') ||
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('ÁLBUM'))
    if (albumBtn) albumBtn.click()
  })

  await session.waitFor(() => Boolean(document.querySelector('.album-screen')))
  await sleep(800)
  await session.capturePng(join(CAPTURES_DIR, '06_album.png'))

  // 7. Matriz de 12 Formas
  console.log('[7/7] Navegando al visor de Matriz Anatómica (12 formas)...')
  const comparisonUrl = `${TARGET_HOST}/docs/evidence/v2/pet-comparison.html`
  validateTargetUrl(comparisonUrl)
  await session.send('Page.navigate', { url: comparisonUrl })
  await session.waitFor(() => Boolean(document.querySelector('.matrix-section') && document.querySelector('.reactions-section')))
  await sleep(1000)
  await session.capturePng(join(CAPTURES_DIR, '07_12formas.png'))

  console.log('\n=== RUTINA DE CAPTURA COMPLETADA CON ÉXITO ===')
  console.log(`Las 7 capturas fueron guardadas en: ${CAPTURES_DIR}`)
}

/**
 * Punto de entrada principal.
 */
async function main() {
  const isRunRequested = process.argv.includes('--run')
  const browserPath = findBrowserExecutable()

  console.log('=================================================================')
  console.log('  MUYU 2.0 — SISTEMA NATIVO DE CAPTURAS HEADLESS (CDP LOOPBACK)  ')
  console.log('=================================================================')
  console.log(`Navegador oficial detectado: ${browserPath || 'NO ENCONTRADO'}`)
  console.log(`Destino autorizado:         ${TARGET_HOST} (solo loopback)`)
  console.log(`Salvaguarda de seguridad:   Puerto 5174 y dominios externos BLOQUEADOS`)
  console.log(`Directorio de salida:       ${CAPTURES_DIR}`)
  console.log('\nCapturas canónicas definidas (7):')
  CANONICAL_CAPTURES.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.id.padEnd(20)} -> ${c.name}`)
  })

  if (!browserPath) {
    console.error('\n[ERROR CRÍTICO] No se encontró Microsoft Edge ni Google Chrome en rutas estándar de Windows.')
    process.exit(1)
  }

  if (!isRunRequested) {
    console.log('\n[MODO STANDBY — NO EJECUTADO AUTOMÁTICAMENTE]')
    console.log('El script está verificado y listo para ser ejecutado por el supervisor.')
    console.log('Requisitos previos:')
    console.log('  1. Servidor Vite activo en puerto 5176:')
    console.log('     npx vite --port 5176')
    console.log('  2. Ejecutar el comando exacto:')
    console.log('     node docs/evidence/v2/capture-screens.mjs --run\n')
    process.exit(0)
  }

  // Ejecución activa con --run
  console.log('\n[MODO EJECUCIÓN ACTIVO] Iniciando entorno headless aislado...')
  const tempProfileDir = mkdtempSync(join(tmpdir(), 'muyu-cdp-profile-'))
  const debugPort = await findOpenPort(9223)

  console.log(`Puerto de depuración loopback asignado: ${debugPort}`)
  console.log(`Perfil temporal aislado creado en:      ${tempProfileDir}`)

  const browserProc = spawn(
    browserPath,
    [
      '--headless=new',
      `--user-data-dir=${tempProfileDir}`,
      `--remote-debugging-port=${debugPort}`,
      '--remote-debugging-address=127.0.0.1',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--window-size=1280,960',
      '--hide-scrollbars',
      '--mute-audio',
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true }
  )

  let session = null
  try {
    session = await connectToBrowser(debugPort)
    await runGuidedCaptureWorkflow(session)
  } catch (err) {
    console.error('\n[ERROR DURANTE LA CAPTURA]:', err)
    process.exitCode = 1
  } finally {
    if (session) session.close()
    try {
      browserProc.kill()
    } catch {}
    await sleep(400)
    try {
      const resolvedTemp = resolve(tempProfileDir)
      const resolvedRoot = resolve(tmpdir())
      const baseName = basename(resolvedTemp)
      const parentDir = dirname(resolvedTemp)

      if (
        parentDir === resolvedRoot &&
        baseName.startsWith('muyu-cdp-profile-') &&
        resolvedTemp !== resolvedRoot
      ) {
        rmSync(resolvedTemp, { recursive: true, force: true })
        console.log(`Perfil temporal eliminado limpiamente: ${resolvedTemp}`)
      } else {
        console.warn(`[SALVAGUARDA] Omitiendo rmSync: ${resolvedTemp} no es hijo directo válido de ${resolvedRoot}`)
      }
    } catch {
      // Ignorar bloqueo temporal de ficheros por el SO
    }
  }
}

main().catch((err) => {
  console.error('[ERROR NO CONTROLADO]:', err)
  process.exit(1)
})
