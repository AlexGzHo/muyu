import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9277;
const BASE_URL = 'http://localhost:5178';
const CAPTURES_DIR = resolve('docs/evidence/v2.1/captures');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync(CAPTURES_DIR, { recursive: true });

  const tempProfileDir = resolve(tmpdir(), `muyu-cdp-profile-v21screens-${Date.now()}`);
  mkdirSync(tempProfileDir, { recursive: true });

  const proc = spawn(
    EDGE_PATH,
    [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${tempProfileDir}`,
      'about:blank',
    ],
    { windowsHide: true }
  );

  await sleep(1500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    const ws = new WebSocket(pages[0].webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id && pending.has(data.id)) {
          const { resolve, reject } = pending.get(data.id);
          pending.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
      } catch {}
    };

    await new Promise((r) => (ws.onopen = r));

    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const id = msgId++;
        const timer = setTimeout(() => {
          pending.delete(id);
          rej(new Error(`Timeout on ${method}`));
        }, 15000);
        pending.set(id, {
          resolve: (val) => { clearTimeout(timer); res(val); },
          reject: (err) => { clearTimeout(timer); rej(err); },
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
      }
      return res.result?.value;
    }

    async function captureScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = join(CAPTURES_DIR, filename);
      writeFileSync(outPath, buffer);
      console.log(`[CAPTURED] ${filename} (${buffer.length} bytes)`);
    }

    console.log('[1/4] Portada...');
    await send('Page.navigate', { url: BASE_URL });
    await sleep(2000);
    await captureScreenshot('01_portada_v2.1.png');

    console.log('[2/4] Selección de mascotas...');
    await evaluate(`
      (() => {
        const btn = document.querySelector('.btn-play-hero');
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);
    await captureScreenshot('02_seleccion_v2.1.png');

    console.log('[3/4] Bosque central...');
    await evaluate(`
      (() => {
        const card = document.querySelector('.pet-selection-card');
        if (card) card.click();
      })()
    `);
    await sleep(1500);
    await captureScreenshot('03_bosque_v2.1.png');

    console.log('[4/4] Álbum...');
    await evaluate(`
      (() => {
        const albumBtn = document.querySelector('.album-area-card');
        if (albumBtn) albumBtn.click();
      })()
    `);
    await sleep(1500);
    await captureScreenshot('06_album_v2.1.png');

    console.log('Screenshots generated successfully!');
    ws.close();
  } finally {
    proc.kill();
    await sleep(400);
    const resolvedTemp = resolve(tempProfileDir);
    const resolvedTmp = resolve(tmpdir());
    if (dirname(resolvedTemp) === resolvedTmp && basename(resolvedTemp).startsWith('muyu-cdp-profile-')) {
      try {
        rmSync(resolvedTemp, { recursive: true, force: true });
      } catch {}
    }
  }
}

main().catch((err) => {
  console.error('Error in capture_screens_v21:', err);
  process.exit(1);
});

