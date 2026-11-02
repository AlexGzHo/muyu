import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { createServer as createNetServer } from 'node:net';
import { createServer as createHttpServer } from 'node:http';

const OUT_DIR = join(process.cwd(), 'docs', 'evidencias_v4', 'baseline');
mkdirSync(OUT_DIR, { recursive: true });

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

function findOpenPort(startPort = 9380) {
  return new Promise((resolve) => {
    const server = createNetServer();
    server.listen(startPort, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findOpenPort(startPort + 1));
    });
  });
}

function startStaticServer(port) {
  return new Promise((res) => {
    const srv = createHttpServer((req, resHttp) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/' || urlPath === '') urlPath = '/qa_matrix_v4.html';
      const filePath = join(process.cwd(), 'public', urlPath.replace(/^\//, ''));
      if (existsSync(filePath)) {
        const ext = filePath.split('.').pop();
        const mime = ext === 'html' ? 'text/html' : ext === 'png' ? 'image/png' : 'text/plain';
        resHttp.writeHead(200, { 'Content-Type': mime });
        resHttp.end(readFileSync(filePath));
      } else {
        resHttp.writeHead(404);
        resHttp.end('Not found');
      }
    });
    srv.listen(port, '127.0.0.1', () => res(srv));
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
  return session;
}

async function run() {
  const httpPort = await findOpenPort(8200);
  const server = await startStaticServer(httpPort);
  console.log(`Servidor estático corriendo en http://127.0.0.1:${httpPort}`);

  const browserPath = findBrowserExecutable();
  const debugPort = await findOpenPort(9400);

  const tempRoot = resolve(tmpdir());
  const tempProfileDir = mkdtempSync(join(tempRoot, 'muyu-cdp-qa-'));

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

  try {
    const session = await connectToBrowser(debugPort);
    const targetUrl = `http://127.0.0.1:${httpPort}/qa_matrix_v4.html`;

    // 1. Captura Escritorio (1280x900)
    console.log('Capturando baseline escritorio...');
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await session.send('Page.navigate', { url: targetUrl });
    await sleep(2000);
    await session.capturePng(join(OUT_DIR, '01_qa_matrix_desktop_1280px.png'));

    // 2. Captura Móvil (390x844)
    console.log('Capturando baseline móvil 390px...');
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await session.send('Page.navigate', { url: targetUrl });
    await sleep(2000);
    await session.capturePng(join(OUT_DIR, '02_qa_matrix_mobile_390px.png'));

    session.close();
    console.log('Capturas completadas con éxito.');
  } finally {
    browserProc.kill();
    server.close();
    try {
      rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
