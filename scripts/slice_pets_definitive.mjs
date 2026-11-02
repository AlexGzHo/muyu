import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9292;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const tempProfileDir = resolve(tmpdir(), `muyu-cdp-profile-segment-${Date.now()}`);
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

  await delay(1500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    let pageTarget = pages.find((t) => t.type === 'page') || pages[0];

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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

    console.log('Loading source images from user uploads...');

    const toucanPath = 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783642_0be421f9.png';
    const monkeyPath = 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_065b2ae3.png';
    const turtlePath = 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_3fca7144.jpg';

    const toucanB64 = `data:image/png;base64,${readFileSync(toucanPath).toString('base64')}`;
    const monkeyB64 = `data:image/png;base64,${readFileSync(monkeyPath).toString('base64')}`;
    const turtleB64 = `data:image/jpeg;base64,${readFileSync(turtlePath).toString('base64')}`;

    console.log('Executing Connected-Component Segmentation in V8 Canvas...');

    const segmentationScript = `
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

      function segmentSheet(img, isTurtle) {
        const W = img.width; // 1024
        const H = img.height; // 1024

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, W, H);
        const data = imgData.data;

        // Foreground mask: 1 if pixel is pet, 0 if background
        const fg = new Uint8Array(W * H);

        if (isTurtle) {
          // BFS flood fill from outside border to identify black background
          const visited = new Uint8Array(W * H);
          const queue = [];
          for (let x = 0; x < W; x++) {
            queue.push(x, 0); visited[x] = 1;
            queue.push(x, H - 1); visited[(H - 1) * W + x] = 1;
          }
          for (let y = 0; y < H; y++) {
            queue.push(0, y); visited[y * W] = 1;
            queue.push(W - 1, y); visited[y * W + (W - 1)] = 1;
          }

          let head = 0;
          const bgThreshold = 38;
          while (head < queue.length) {
            const cx = queue[head++];
            const cy = queue[head++];
            const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
            for (let n = 0; n < 4; n++) {
              const nx = neighbors[n][0];
              const ny = neighbors[n][1];
              if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                const nIdx = ny * W + nx;
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

          for (let i = 0; i < W * H; i++) {
            if (!visited[i]) {
              const pIdx = i * 4;
              const maxVal = Math.max(data[pIdx], data[pIdx+1], data[pIdx+2]);
              if (maxVal >= bgThreshold + 10) {
                fg[i] = 1;
              }
            }
          }
        } else {
          // Monkey / Toucan: background has alpha == 0 or white border
          for (let i = 0; i < W * H; i++) {
            const a = data[i * 4 + 3];
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            // If alpha > 30 and not pure white
            if (a > 30 && !(r > 248 && g > 248 && b > 248 && a < 100)) {
              fg[i] = 1;
            }
          }
        }

        // Connected Component Labeling via Breadth-First Search
        const labels = new Int32Array(W * H);
        labels.fill(0);
        let currentLabel = 0;
        const blobSizes = new Map();
        const blobCenters = new Map();

        const q = new Int32Array(W * H);

        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const idx = y * W + x;
            if (fg[idx] === 1 && labels[idx] === 0) {
              currentLabel++;
              let head = 0;
              let tail = 0;
              q[tail++] = idx;
              labels[idx] = currentLabel;

              let sumX = 0;
              let sumY = 0;
              let count = 0;

              while (head < tail) {
                const cIdx = q[head++];
                const cx = cIdx % W;
                const cy = (cIdx / W) | 0;

                sumX += cx;
                sumY += cy;
                count++;

                // 4 neighbors
                const n1 = cIdx + 1;
                const n2 = cIdx - 1;
                const n3 = cIdx + W;
                const n4 = cIdx - W;

                if (cx + 1 < W && fg[n1] === 1 && labels[n1] === 0) { labels[n1] = currentLabel; q[tail++] = n1; }
                if (cx - 1 >= 0 && fg[n2] === 1 && labels[n2] === 0) { labels[n2] = currentLabel; q[tail++] = n2; }
                if (cy + 1 < H && fg[n3] === 1 && labels[n3] === 0) { labels[n3] = currentLabel; q[tail++] = n3; }
                if (cy - 1 >= 0 && fg[n4] === 1 && labels[n4] === 0) { labels[n4] = currentLabel; q[tail++] = n4; }
              }

              blobSizes.set(currentLabel, count);
              blobCenters.set(currentLabel, { cx: sumX / count, cy: sumY / count });
            }
          }
        }

        // Quadrant targets:
        // 0: baby (TL): ideal center (260, 260)
        // 1: sprout (TR): ideal center (760, 260)
        // 2: young (BL): ideal center (260, 760)
        // 3: adult (BR): ideal center (760, 760)
        const targetCenters = [
          { name: 'baby', x: 260, y: 260 },
          { name: 'sprout', x: 760, y: 260 },
          { name: 'young', x: 260, y: 760 },
          { name: 'adult', x: 760, y: 760 },
        ];

        // Assign each blob (size >= 80) to the nearest quadrant target
        const blobAssignment = new Map();
        for (const [lbl, count] of blobSizes.entries()) {
          if (count >= 50) {
            const bc = blobCenters.get(lbl);
            let bestDist = Infinity;
            let bestIdx = 0;
            for (let i = 0; i < 4; i++) {
              const tc = targetCenters[i];
              const d2 = (bc.cx - tc.x) ** 2 + (bc.cy - tc.y) ** 2;
              if (d2 < bestDist) {
                bestDist = d2;
                bestIdx = i;
              }
            }
            blobAssignment.set(lbl, bestIdx);
          }
        }

        // For each of the 4 characters, isolate ONLY its assigned blobs!
        const resultSlices = {};

        for (let targetIdx = 0; targetIdx < 4; targetIdx++) {
          const stName = targetCenters[targetIdx].name;

          // Find bounding box for this character only
          let minX = W, maxX = 0, minY = H, maxY = 0;
          let pixelCount = 0;

          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const idx = y * W + x;
              const lbl = labels[idx];
              if (lbl > 0 && blobAssignment.get(lbl) === targetIdx) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                pixelCount++;
              }
            }
          }

          if (pixelCount === 0) {
            console.error('No pixels for target', stName);
            continue;
          }

          // Build clean isolated canvas for this character
          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;

          const charCanvas = document.createElement('canvas');
          charCanvas.width = cropW;
          charCanvas.height = cropH;
          const charCtx = charCanvas.getContext('2d');
          const charImgData = charCtx.createImageData(cropW, cropH);
          const charData = charImgData.data;

          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              const srcIdx = y * W + x;
              const lbl = labels[srcIdx];
              const dstIdx = ((y - minY) * cropW + (x - minX)) * 4;

              if (lbl > 0 && blobAssignment.get(lbl) === targetIdx) {
                charData[dstIdx] = data[srcIdx * 4];
                charData[dstIdx + 1] = data[srcIdx * 4 + 1];
                charData[dstIdx + 2] = data[srcIdx * 4 + 2];
                charData[dstIdx + 3] = data[srcIdx * 4 + 3] || 255;
              } else {
                charData[dstIdx + 3] = 0; // completely transparent
              }
            }
          }

          charCtx.putImageData(charImgData, 0, 0);

          // Render centered and grounded into a 512x512 canvas
          const outCanvas = document.createElement('canvas');
          outCanvas.width = 512;
          outCanvas.height = 512;
          const outCtx = outCanvas.getContext('2d');
          outCtx.imageSmoothingEnabled = true;
          outCtx.imageSmoothingQuality = 'high';

          const maxW = 450;
          const maxH = 450;
          const scale = Math.min(maxW / cropW, maxH / cropH);
          const drawW = Math.round(cropW * scale);
          const drawH = Math.round(cropH * scale);
          const drawX = Math.round((512 - drawW) / 2);
          const drawY = Math.round(512 - drawH - 24); // grounded near bottom

          outCtx.drawImage(charCanvas, 0, 0, cropW, cropH, drawX, drawY, drawW, drawH);

          // Return base64 + metadata about bounding box inside 512x512
          resultSlices[stName] = {
            base64: outCanvas.toDataURL('image/png').split(',')[1],
            drawX,
            drawY,
            drawW,
            drawH,
            cropW,
            cropH,
          };
        }

        return resultSlices;
      }

      return {
        monkey: segmentSheet(imgMonkey, false),
        toucan: segmentSheet(imgToucan, false),
        turtle: segmentSheet(imgTurtle, true),
      };
    })()
    `;

    const allSlices = await evaluate(segmentationScript);
    ws.close();

    console.log('Writing cleanly segmented images without any neighbor overlap...');

    const outDir = resolve('public/pets');
    for (const [petId, stages] of Object.entries(allSlices)) {
      mkdirSync(join(outDir, petId), { recursive: true });
      for (const [stage, meta] of Object.entries(stages)) {
        const filePath = join(outDir, petId, `${stage}.png`);
        writeFileSync(filePath, Buffer.from(meta.base64, 'base64'));
        console.log(`[CLEAN SEGMENTATION] ${petId}/${stage}.png saved -> box: (${meta.drawX}, ${meta.drawY}, ${meta.drawW}x${meta.drawH})`);
      }
    }

    console.log('ALL 12 PET STAGES SEGMENTED WITH ZERO OVERLAP!');
  } finally {
    proc.kill();
    await delay(500);
    const resolvedTemp = resolve(tempProfileDir);
    const resolvedTmp = resolve(tmpdir());
    if (dirname(resolvedTemp) === resolvedTmp && basename(resolvedTemp).startsWith('muyu-cdp-profile-segment-')) {
      try {
        rmSync(resolvedTemp, { recursive: true, force: true });
      } catch {}
    }
  }
}

main().catch((err) => {
  console.error('Segmentation error:', err);
  process.exit(1);
});

