import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9255;

async function main() {
  const tempProfileDir = resolve(tmpdir(), `muyu-cdp-profile-gallery-${Date.now()}`);
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

  await new Promise((r) => setTimeout(r, 1200));

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    const ws = new WebSocket(pages[0].webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      }
    };

    await new Promise((r) => (ws.onopen = r));

    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const id = msgId++;
        pending.set(id, { resolve: res, reject: rej });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1200,
      height: 1400,
      deviceScaleFactor: 2,
      mobile: false,
    });

    await send('Page.navigate', { url: 'http://localhost:5178/pet-gallery.html' });
    await new Promise((r) => setTimeout(r, 2000));

    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = resolve('docs/evidence/v2.1/captures/00_12_pet_forms_v2.1.png');
    writeFileSync(outPath, buffer);
    console.log(`[CAPTURED] 00_12_pet_forms_v2.1.png (${buffer.length} bytes)`);

    ws.close();
  } finally {
    proc.kill();
    await new Promise((r) => setTimeout(r, 400));
    const resolvedTemp = resolve(tempProfileDir);
    const resolvedTmp = resolve(tmpdir());
    if (dirname(resolvedTemp) === resolvedTmp && basename(resolvedTemp).startsWith('muyu-cdp-profile-')) {
      try {
        rmSync(resolvedTemp, { recursive: true, force: true });
      } catch {}
    }
  }
}

main().catch(console.error);
