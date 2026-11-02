import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';

const TARGET_HOST = 'http://localhost:5178';
const CAPTURES_DIR = join(process.cwd(), 'docs', 'evidence', 'v2.1', 'captures');

function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error('No se encontró ejecutable de Edge o Chrome.');
}

function findOpenPort(startPort = 9285) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startPort, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findOpenPort(startPort + 1));
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpSession {
  constructor(ws) {
    this.ws = ws;
    this.msgId = 0;
    this.pending = new Map();

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id && this.pending.has(data.id)) {
          const entry = this.pending.get(data.id);
          this.pending.delete(data.id);
          if (entry.timer) clearTimeout(entry.timer);
          if (data.error) {
            entry.reject(new Error(`CDP [${data.error.code}]: ${data.error.message}`));
          } else {
            entry.resolve(data.result);
          }
        }
      } catch (err) {
        console.error('Error parseando CDP onmessage:', err);
      }
    };
  }

  send(method, params = {}, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout (${timeoutMs}ms) en comando: ${method}`));
        }
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      try {
        this.ws.send(JSON.stringify({ id, method, params }));
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(err);
      }
    });
  }

  async eval(expression) {
    const exprStr = typeof expression === 'function'
      ? `(${expression.toString()})()`
      : String(expression);
    const res = await this.send('Runtime.evaluate', {
      expression: exprStr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      const details = res.exceptionDetails.text || JSON.stringify(res.exceptionDetails);
      throw new Error(`Error en evaluación JS: ${details}`);
    }
    return res.result?.value;
  }

  async capturePng(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    writeFileSync(outputPath, buffer);
    console.log(`[CAPTURA GUARDADA] -> ${outputPath} (${buffer.length} bytes)`);
  }

  close() {
    for (const [id, entry] of this.pending.entries()) {
      if (entry.timer) clearTimeout(entry.timer);
      entry.reject(new Error('Sesión cerrada'));
    }
    this.pending.clear();
    try {
      this.ws.close();
    } catch {}
  }
}

async function connectToBrowser(debugPort) {
  let list = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (res.ok) {
        list = await res.json();
        break;
      }
    } catch {}
    await sleep(200);
  }

  if (!list) throw new Error(`No se pudo conectar a CDP en puerto ${debugPort}`);

  let pageTarget = list.find((t) => t.type === 'page');
  if (!pageTarget) {
    const newRes = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' });
    pageTarget = await newRes.json();
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const session = new CdpSession(ws);
  await session.send('Page.enable');
  await session.send('Runtime.enable');
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  return session;
}

async function run() {
  mkdirSync(CAPTURES_DIR, { recursive: true });

  const browserPath = findBrowserExecutable();
  const debugPort = await findOpenPort(9288);

  const tempRoot = resolve(tmpdir());
  const tempProfileDir = mkdtempSync(join(tempRoot, 'muyu-cdp-cases-'));

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
  );

  await sleep(1500);

  let session;
  try {
    session = await connectToBrowser(debugPort);

    console.log('Navigating to Muyu initial page...');
    await session.send('Page.navigate', { url: TARGET_HOST });
    await sleep(2500);

    const testCases = [
      {
        name: 'case1_monito_sprout_cap_glasses',
        petId: 'monkey',
        stage: 'sprout',
        equipped: { head: 'orange_cap', face: 'round_glasses' },
      },
      {
        name: 'case2_monito_young_explorer_hat',
        petId: 'monkey',
        stage: 'young',
        equipped: { head: 'explorer_hat' },
      },
      {
        name: 'case3_tortuga_baby_cap',
        petId: 'turtle',
        stage: 'baby',
        equipped: { head: 'orange_cap' },
      },
      {
        name: 'case4_tortuga_baby_glasses',
        petId: 'turtle',
        stage: 'baby',
        equipped: { face: 'round_glasses' },
      },
      {
        name: 'case5_toucan_baby_bow_or_cap',
        petId: 'toucan',
        stage: 'baby',
        equipped: { head: 'color_bow' },
      },
      {
        name: 'case6_toucan_young_glasses_scarf',
        petId: 'toucan',
        stage: 'young',
        equipped: { face: 'round_glasses', neck: 'explorer_scarf' },
      },
      {
        name: 'case7_backpack_monkey_turtle_toucan',
        petId: 'turtle',
        stage: 'sprout',
        equipped: { back: 'small_backpack', head: 'leaf_crown' },
      },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      console.log(`Setting up [${tc.name}]...`);
      await session.eval(`
        (() => {
          const raw = localStorage.getItem('muyu_game_save_v2');
          let s = raw ? JSON.parse(raw) : {
            schemaVersion: 2,
            currentScreen: 'shop',
            selectedPetId: 'monkey',
            settings: { soundEnabled: true, difficultyLevel: 'initial' },
            pets: {
              monkey: { id: 'monkey', name: 'Monito', stage: 'baby', growthUnits: 0, foodCount: 0, coinsBalance: 150, purchasedAccessories: [], equippedAccessories: {} },
              turtle: { id: 'turtle', name: 'Tortuguita', stage: 'baby', growthUnits: 0, foodCount: 0, coinsBalance: 150, purchasedAccessories: [], equippedAccessories: {} },
              toucan: { id: 'toucan', name: 'Tucancito', stage: 'baby', growthUnits: 0, foodCount: 0, coinsBalance: 150, purchasedAccessories: [], equippedAccessories: {} }
            }
          };
          s.currentScreen = 'shop';
          s.selectedPetId = '${tc.petId}';
          s.pets['${tc.petId}'].stage = '${tc.stage}';
          const equippedObj = ${JSON.stringify(tc.equipped)};
          s.pets['${tc.petId}'].equippedAccessories = equippedObj;
          s.pets['${tc.petId}'].purchasedAccessories = Object.values(equippedObj).filter(Boolean);
          s.pets['${tc.petId}'].coinsBalance = 150;
          localStorage.setItem('muyu_game_save_v2', JSON.stringify(s));
        })()
      `);
      await session.send('Page.navigate', { url: TARGET_HOST });
      await sleep(2000);
      await session.capturePng(join(CAPTURES_DIR, `${tc.name}.png`));
    }

    console.log('\n--- TODOS LOS 7 CASOS DE VERIFICACIÓN CAPTURADOS EXITOSAMENTE ---');
  } finally {
    if (session) session.close();
    browserProc.kill();
    await sleep(500);

    const resolvedTemp = resolve(tempProfileDir);
    if (dirname(resolvedTemp) === tempRoot && basename(resolvedTemp).startsWith('muyu-cdp-cases-')) {
      try {
        rmSync(resolvedTemp, { recursive: true, force: true });
      } catch {}
    }
  }
}

run().catch((err) => {
  console.error('Error in capture_verification_cases:', err);
  process.exit(1);
});
