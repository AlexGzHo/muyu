import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9310;
const CAPTURES_DIR = resolve('docs/evidence/v2.1/captures');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync(CAPTURES_DIR, { recursive: true });

  const tempProfileDir = resolve(tmpdir(), `muyu-cdp-profile-calib-${Date.now()}`);
  mkdirSync(tempProfileDir, { recursive: true });

  const browserProc = spawn(
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
    const pageTarget = pages.find((t) => t.type === 'page') || pages[0];

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id && pending.has(data.id)) {
          const entry = pending.get(data.id);
          pending.delete(data.id);
          if (data.error) entry.reject(new Error(data.error.message));
          else entry.resolve(data.result);
        }
      } catch {}
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
      width: 1100,
      height: 1800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('Navigating to calibrate_accessories.html...');
    await send('Page.navigate', { url: 'http://localhost:5178/calibrate_accessories.html' });
    await sleep(2500);

    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = join(CAPTURES_DIR, '08_accessory_calibration_check.png');
    writeFileSync(outPath, buffer);
    console.log(`[CAPTURED] 08_accessory_calibration_check.png (${buffer.length} bytes)`);

    ws.close();
  } finally {
    browserProc.kill();
    await sleep(400);

    const resolvedTemp = resolve(tempProfileDir);
    const tempRoot = resolve(tmpdir());
    if (dirname(resolvedTemp) === tempRoot && basename(resolvedTemp).startsWith('muyu-cdp-profile-calib-')) {
      try {
        rmSync(resolvedTemp, { recursive: true, force: true });
      } catch {}
    }
  }
}

main().catch((err) => {
  console.error('Calibration check error:', err);
  process.exit(1);
});
