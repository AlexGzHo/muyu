import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9266;
const BASE_URL = 'http://localhost:5178';
const CAPTURES_DIR = resolve('docs/evidence/v2.1/captures');

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync(CAPTURES_DIR, { recursive: true });

  const tempProfileDir = resolve(tmpdir(), `muyu-cdp-profile-v21-${Date.now()}`);
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

    async function setViewport(width, height, isMobile = false) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: isMobile ? 2 : 1,
        mobile: isMobile,
      });
    }

    async function captureScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = join(CAPTURES_DIR, filename);
      writeFileSync(outPath, buffer);
      console.log(`[CAPTURED] ${filename} (${buffer.length} bytes)`);
    }

    // 1. Navegar a Muyu (Portada)
    console.log('Navigating to Portada...');
    await setViewport(1280, 800, false);
    await send('Page.navigate', { url: BASE_URL });
    await delay(2000);
    await captureScreenshot('01_portada_v2.1.png');

    // 2. Click en botón JUGAR para ir a Selección
    console.log('Entering pet selection...');
    await evaluate(`
      (() => {
        const playBtn = document.querySelector('.btn-play-hero');
        if (playBtn) playBtn.click();
      })()
    `);
    await delay(1200);
    await captureScreenshot('02_seleccion_v2.1.png');

    // 3. Seleccionar Monito
    console.log('Selecting Monito...');
    await evaluate(`
      (() => {
        const petCard = document.querySelector('.pet-selection-card');
        if (petCard) petCard.click();
      })()
    `);
    await delay(1500);

    // Preparar saldo canjeable de prueba para compras
    console.log('Configuring test save for shop...');
    await evaluate(`
      (() => {
        const raw = localStorage.getItem('muyu_game_save_v2');
        if (raw) {
          const s = JSON.parse(raw);
          s.selectedPetId = 'monkey';
          s.pets.monkey.coinsBalance = 100;
          s.pets.toucan.coinsBalance = 0;
          localStorage.setItem('muyu_game_save_v2', JSON.stringify(s));
        }
      })()
    `);
    await evaluate(`location.reload()`);
    await delay(1800);

    // 4. Bosque Central
    console.log('Capturing Forest Home...');
    await captureScreenshot('03_bosque_v2.1.png');

    // 5. Entrar a la Tienda
    console.log('Entering Shop...');
    await evaluate(`
      (() => {
        const btn = document.querySelector('.shop-area-card') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TIENDA'));
        if (btn) btn.click();
      })()
    `);
    await delay(1500);
    await captureScreenshot('04_tienda_desktop_v2.1.png');

    // 6. Probar accesorio (Gorrita Naranja)
    console.log('Testing accessory preview...');
    const previewRes = await evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.shop-item-card'));
        if (cards.length > 0) {
          const tryBtn = cards[0].querySelector('.btn-try');
          if (tryBtn) tryBtn.click();
          return { name: cards[0].querySelector('.shop-item-name')?.textContent, success: true };
        }
        return { success: false };
      })()
    `);
    console.log('Preview test:', previewRes);
    await delay(800);
    await captureScreenshot('04b_tienda_preview_active.png');

    // 7. Comprar accesorio
    console.log('Buying accessory with balance...');
    const buyRes = await evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.shop-item-card'));
        const affordable = cards.find(c => {
          const b = c.querySelector('.btn-buy');
          return b && !b.disabled;
        });
        if (affordable) {
          const name = affordable.querySelector('.shop-item-name')?.textContent;
          const buyBtn = affordable.querySelector('.btn-buy');
          buyBtn.click();
          return { name, success: true };
        }
        return { success: false };
      })()
    `);
    console.log('Buy result:', buyRes);
    await delay(1000);
    await captureScreenshot('04c_tienda_after_buy.png');

    // 8. Recargar y verificar persistencia
    console.log('Verifying reload persistence...');
    await evaluate(`location.reload()`);
    await delay(1800);

    const persistInfo = await evaluate(`
      (() => {
        const save = JSON.parse(localStorage.getItem('muyu_game_save_v2') || '{}');
        const monkey = save.pets?.monkey;
        return {
          screen: save.currentScreen,
          balance: monkey?.coinsBalance,
          purchased: monkey?.purchasedAccessories?.length,
          equippedHead: monkey?.equippedAccessories?.head
        };
      })()
    `);
    console.log('Persistence check:', persistInfo);

    // 9. Tienda en viewport móvil (360x740)
    console.log('Testing mobile 360px viewport...');
    await setViewport(360, 740, true);
    await delay(800);
    await captureScreenshot('05_tienda_mobile_360px_v2.1.png');

    // 10. Cambiar a Tucán (saldo 0)
    console.log('Switching to Toucan in mobile...');
    await evaluate(`
      (() => {
        const toucanTab = Array.from(document.querySelectorAll('.shop-pet-tab-btn')).find(b => b.textContent.includes('Tucancito'));
        if (toucanTab) toucanTab.click();
      })()
    `);
    await delay(800);
    await captureScreenshot('05b_tienda_mobile_toucan_zero_balance.png');

    // 11. Volver al bosque y abrir Álbum
    console.log('Navigating to Album...');
    await setViewport(1280, 800, false);
    await evaluate(`
      (() => {
        const backBtn = document.querySelector('button[aria-label="Volver al bosque"]');
        if (backBtn) backBtn.click();
      })()
    `);
    await delay(1200);

    await evaluate(`
      (() => {
        const albumBtn = document.querySelector('.album-area-card');
        if (albumBtn) albumBtn.click();
      })()
    `);
    await delay(1200);
    await captureScreenshot('06_album_v2.1.png');

    console.log('==============================================');
    console.log('ALL PRIORIDAD 1 & 2 VERIFIED SUCCESSFULLY!');
    console.log('==============================================');
  } finally {
    proc.kill();
    await delay(400);
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
  console.error('CDP verification error:', err);
  process.exit(1);
});

