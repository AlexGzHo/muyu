/**
 * capture-screens-v21.mjs
 * Captura automatizada de evidencias visuales para Muyu 2.1.
 */

import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs'
import { join, resolve, basename, dirname } from 'node:path'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { createServer } from 'node:net'

const TARGET_HOST = 'http://localhost:5178'
const CAPTURES_DIR = join(process.cwd(), 'docs', 'evidence', 'v2.1', 'captures')

function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  throw new Error('No se encontró ejecutable de Edge o Chrome.')
}

function findOpenPort(startPort = 9280) {
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
      } catch {}
    }

    this.ws.onclose = () => {
      this.rejectAllPending('Conexión CDP cerrada')
    }

    this.ws.onerror = (err) => {
      this.rejectAllPending(`Error de WebSocket CDP: ${err?.message || err}`)
    }
  }

  rejectAllPending(reason) {
    for (const [, entry] of this.pending.entries()) {
      if (entry.timer) clearTimeout(entry.timer)
      entry.reject(new Error(`CDP cancelado: ${reason}`))
    }
    this.pending.clear()
  }

  send(method, params = {}, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error(`CDP timeout en '${method}' (id: ${id})`))
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

  async capturePng(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' })
    const buffer = Buffer.from(res.data, 'base64')
    writeFileSync(outputPath, buffer)
    console.log(`[CAPTURA GUARDADA] -> ${outputPath} (${buffer.length} bytes)`)
  }

  close() {
    this.rejectAllPending('Sesión cerrada')
    try {
      this.ws.close()
    } catch {}
  }
}

async function connectToBrowser(debugPort) {
  let list = null
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`)
      if (res.ok) {
        list = await res.json()
        break
      }
    } catch {}
    await sleep(200)
  }

  if (!list) throw new Error(`No se pudo conectar a CDP en puerto ${debugPort}`)

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

async function run() {
  if (!existsSync(CAPTURES_DIR)) {
    mkdirSync(CAPTURES_DIR, { recursive: true })
  }

  const browserPath = findBrowserExecutable()
  const debugPort = await findOpenPort(9280)

  const tempRoot = resolve(tmpdir())
  const tempProfileDir = mkdtempSync(join(tempRoot, 'muyu-cdp-profile-v21-'))

  const browserProc = spawn(
    browserPath,
    [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${tempProfileDir}`,
      'about:blank',
    ],
    { windowsHide: true }
  )

  await sleep(1500)

  let session
  try {
    session = await connectToBrowser(debugPort)

    console.log('[1/7] Navegando a Portada...');
    await session.send('Page.navigate', { url: TARGET_HOST });
    await sleep(2000);
    const p1 = await session.eval(() => document.title); console.log('Doc title 1:', p1); await session.capturePng(join(CAPTURES_DIR, '01_portada_v2.1.png'));

    console.log('[2/7] Navegando a Selección de Mascotas...');
    await session.eval(() => {
      const btn = document.querySelector('.btn-play-hero');
      if (btn) btn.click();
    });
    await sleep(1200);
    await session.capturePng(join(CAPTURES_DIR, '02_seleccion_v2.1.png'));

    console.log('[3/7] Seleccionando Monito para entrar al Bosque...');
    await session.eval(() => {
      const card = document.querySelector('.pet-selection-card');
      if (card) card.click();
    });
    await sleep(1500);

    // Inyectar saldo de monedas para probar la tienda
    await session.eval(() => {
      const raw = localStorage.getItem('muyu_game_save_v2');
      if (raw) {
        const s = JSON.parse(raw);
        s.selectedPetId = 'monkey';
        s.pets.monkey.coinsBalance = 100;
        localStorage.setItem('muyu_game_save_v2', JSON.stringify(s));
      }
    });
    await session.eval(() => location.reload());
    await sleep(1800);
    await session.capturePng(join(CAPTURES_DIR, '03_bosque_v2.1.png'));

    console.log('[4/7] Abriendo Tienda del Bosque...');
    await session.eval(() => {
      const btn = document.querySelector('.shop-area-card') ||
                  Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TIENDA'));
      if (btn) btn.click();
    });
    await sleep(1500);
    await session.capturePng(join(CAPTURES_DIR, '04_tienda_v2.1.png'));

    console.log('[5/7] Tienda del Bosque a 360 px (Responsive Móvil)...');
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 740,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(800);
    await session.capturePng(join(CAPTURES_DIR, '05_tienda_mobile_360px_v2.1.png'));

    // Restaurar resolución de escritorio
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(400);

    console.log('[6/7] Volviendo al Bosque y abriendo Álbum...');
    await session.eval(() => {
      const back = document.querySelector('button[aria-label="Volver al bosque"]');
      if (back) back.click();
    });
    await sleep(1200);

    await session.eval(() => {
      const album = document.querySelector('.album-area-card');
      if (album) album.click();
    });
    await sleep(1500);
    await session.capturePng(join(CAPTURES_DIR, '06_album_v2.1.png'));

    console.log('[7/7] Matriz de las 12 Formas Anatómicas...');
    await session.send('Page.navigate', { url: `${TARGET_HOST}/pet-gallery.html` });
    await sleep(1800);
    await session.capturePng(join(CAPTURES_DIR, '07_12formas_v2.1.png'));

    console.log('\n--- TODAS LAS 7 CAPTURAS V2.1 GENERADAS EXITOSAMENTE ---');
  } finally {
    if (session) session.close();
    browserProc.kill();
    await sleep(500);

    const resolvedTemp = resolve(tempProfileDir);
    if (dirname(resolvedTemp) === tempRoot && basename(resolvedTemp).startsWith('muyu-cdp-profile-v21-')) {
      try {
        rmSync(resolvedTemp, { recursive: true, force: true });
      } catch {}
    }
  }
}

run().catch((err) => {
  console.error('Fallo en capture-screens-v21:', err);
  process.exit(1);
});

