import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9233;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const tempProfileDir = resolve(tmpdir(), `muyu-cdp-profile-slice-${Date.now()}`);
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

  await delay(1200);

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    const wsUrl = pages[0].webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
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

    console.log('Connected to Edge CDP. Loading images...');

    const toucanPath = 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783642_0be421f9.png';
    const monkeyPath = 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_065b2ae3.png';
    const turtlePath = 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_3fca7144.jpg';

    const toucanB64 = `data:image/png;base64,${readFileSync(toucanPath).toString('base64')}`;
    const monkeyB64 = `data:image/png;base64,${readFileSync(monkeyPath).toString('base64')}`;
    const turtleB64 = `data:image/jpeg;base64,${readFileSync(turtlePath).toString('base64')}`;

    console.log('Images loaded. Processing in browser Canvas...');

    const processScript = `
    (async () => {
      function loadImage(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      }

      const imgToucan = await loadImage(${JSON.stringify(toucanB64)});
      const imgMonkey = await loadImage(${JSON.stringify(monkeyB64)});
      const imgTurtle = await loadImage(${JSON.stringify(turtleB64)});

      function sliceAndCrop(img, quadX, quadY, quadW, quadH, isTurtle) {
        // Raw quadrant canvas
        const qCanvas = document.createElement('canvas');
        qCanvas.width = quadW;
        qCanvas.height = quadH;
        const qCtx = qCanvas.getContext('2d');
        qCtx.drawImage(img, quadX, quadY, quadW, quadH, 0, 0, quadW, quadH);

        const imgData = qCtx.getImageData(0, 0, quadW, quadH);
        const data = imgData.data;

        if (isTurtle) {
          // BFS flood fill from edges to identify black background
          const visited = new Uint8Array(quadW * quadH);
          const queue = [];
          
          for (let x = 0; x < quadW; x++) {
            queue.push(x, 0); visited[x] = 1;
            queue.push(x, quadH - 1); visited[(quadH - 1) * quadW + x] = 1;
          }
          for (let y = 0; y < quadH; y++) {
            queue.push(0, y); visited[y * quadW] = 1;
            queue.push(quadW - 1, y); visited[y * quadW + (quadW - 1)] = 1;
          }

          let head = 0;
          const bgThreshold = 36;
          while (head < queue.length) {
            const cx = queue[head++];
            const cy = queue[head++];
            const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
            for (let n = 0; n < 4; n++) {
              const nx = neighbors[n][0];
              const ny = neighbors[n][1];
              if (nx >= 0 && nx < quadW && ny >= 0 && ny < quadH) {
                const nIdx = ny * quadW + nx;
                if (!visited[nIdx]) {
                  const pIdx = nIdx * 4;
                  const maxVal = Math.max(data[pIdx], data[pIdx+1], data[pIdx+2]);
                  if (maxVal < bgThreshold) {
                    visited[nIdx] = 1;
                    queue.push(nx, ny);
                  }
                }
              }
            }
          }

          // Apply transparency
          for (let y = 0; y < quadH; y++) {
            for (let x = 0; x < quadW; x++) {
              const idx = (y * quadW + x) * 4;
              const nIdx = y * quadW + x;
              const maxVal = Math.max(data[idx], data[idx+1], data[idx+2]);
              if (visited[nIdx]) {
                data[idx + 3] = 0;
              } else if (maxVal < bgThreshold + 24) {
                const alpha = Math.min(255, Math.max(0, Math.round((maxVal - 14) * 255 / (bgThreshold + 10))));
                data[idx + 3] = alpha;
              } else {
                data[idx + 3] = 255;
              }
            }
          }
          qCtx.putImageData(imgData, 0, 0);
        }

        // Find bounding box
        let minX = quadW, maxX = 0, minY = quadH, maxY = 0;
        for (let y = 0; y < quadH; y++) {
          for (let x = 0; x < quadW; x++) {
            const a = data[(y * quadW + x) * 4 + 3];
            if (a > 15) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const pad = 16;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(quadW - 1, maxX + pad);
        maxY = Math.min(quadH - 1, maxY + pad);
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        // Render onto 512x512 normalized canvas, grounded at bottom
        const outCanvas = document.createElement('canvas');
        outCanvas.width = 512;
        outCanvas.height = 512;
        const outCtx = outCanvas.getContext('2d');
        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';

        const maxContentSize = 460;
        const scale = Math.min(maxContentSize / cropW, maxContentSize / cropH);
        const drawW = cropW * scale;
        const drawH = cropH * scale;
        const drawX = (512 - drawW) / 2;
        const drawY = 512 - drawH - 24; // slightly above bottom baseline

        outCtx.drawImage(qCanvas, minX, minY, cropW, cropH, drawX, drawY, drawW, drawH);
        return outCanvas.toDataURL('image/png').split(',')[1];
      }

      const results = {};
      const stages = [
        { name: 'baby', x: 0, y: 0, w: 512, h: 512 },
        { name: 'sprout', x: 512, y: 0, w: 512, h: 512 },
        { name: 'young', x: 0, y: 512, w: 512, h: 512 },
        { name: 'adult', x: 512, y: 512, w: 512, h: 512 },
      ];

      for (const st of stages) {
        results['toucan_' + st.name] = sliceAndCrop(imgToucan, st.x, st.y, st.w, st.h, false);
        results['monkey_' + st.name] = sliceAndCrop(imgMonkey, st.x, st.y, st.w, st.h, false);
        results['turtle_' + st.name] = sliceAndCrop(imgTurtle, st.x, st.y, st.w, st.h, true);
      }

      return results;
    })()
    `;

    const slices = await evaluate(processScript);
    ws.close();

    console.log('Saving all 12 stages to public/pets/...');

    const outDir = resolve('public/pets');
    mkdirSync(join(outDir, 'monkey'), { recursive: true });
    mkdirSync(join(outDir, 'turtle'), { recursive: true });
    mkdirSync(join(outDir, 'toucan'), { recursive: true });

    for (const [key, b64] of Object.entries(slices)) {
      const [petId, stage] = key.split('_');
      const filePath = join(outDir, petId, `${stage}.png`);
      writeFileSync(filePath, Buffer.from(b64, 'base64'));
      console.log(`Saved: ${filePath} (${Buffer.from(b64, 'base64').length} bytes)`);
    }

    console.log('ALL 12 IMAGES SAVED CLEANLY WITH TRANSPARENCY!');
  } finally {
    proc.kill();
    await delay(500);
    const resolvedTemp = resolve(tempProfileDir);
    const resolvedTmp = resolve(tmpdir());
    if (dirname(resolvedTemp) === resolvedTmp && basename(resolvedTemp).startsWith('muyu-cdp-profile-')) {
      try {
        rmSync(resolvedTemp, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
