import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const PORT = process.env.VITE_PORT || '3002';
const DL = '.tmp-assets/dl-verify';
rmSync(DL, { recursive: true, force: true });
mkdirSync(DL, { recursive: true });

const list = await (await fetch('http://127.0.0.1:9344/json/list')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
};
const send = (method, params = {}) => {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise(r => pending.set(i, r));
};
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result.result.value;
}

await send('Page.enable');
await send('Runtime.enable');
await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DL });
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 980, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `http://localhost:${PORT}/` });
await sleep(3200);

// ---- 1. stage theming ----
const darkStage = await ev(`(() => {
  const g = (s, p) => getComputedStyle(document.querySelector(s))[p];
  return {
    theme: document.documentElement.dataset.theme,
    screenBg: g('.stage-screen', 'backgroundImage'),
    shotWrapBg: g('.stage-shot-wrap', 'backgroundColor'),
    darkOpacity: g('.stage-shot-dark', 'opacity'),
    lightOpacity: g('.stage-shot-light', 'opacity'),
    sideBg: g('.stage-side', 'backgroundColor'),
    shotLiveBg: g('.shot-live', 'backgroundColor'),
    sideFileBg: g('.side-file', 'backgroundColor'),
    lightLoaded: document.querySelector('.stage-shot-light').naturalWidth,
    themeColor: document.querySelector('meta[name=theme-color]').content
  };
})()`);

await ev(`document.getElementById('theme-toggle-btn').click()`);
await sleep(600);
const lightStage = await ev(`(() => {
  const g = (s, p) => getComputedStyle(document.querySelector(s))[p];
  return {
    theme: document.documentElement.dataset.theme,
    screenBg: g('.stage-screen', 'backgroundImage'),
    shotWrapBg: g('.stage-shot-wrap', 'backgroundColor'),
    darkOpacity: g('.stage-shot-dark', 'opacity'),
    lightOpacity: g('.stage-shot-light', 'opacity'),
    sideBg: g('.stage-side', 'backgroundColor'),
    shotLiveBg: g('.shot-live', 'backgroundColor'),
    sideFileBg: g('.side-file', 'backgroundColor'),
    themeColor: document.querySelector('meta[name=theme-color]').content,
    colorScheme: getComputedStyle(document.documentElement).colorScheme
  };
})()`);

// ---- 2. guide ----
await ev(`document.querySelector('.nav-pill[data-tab="guide"]').click()`);
await sleep(400);
const guide = await ev(`(() => {
  const tabs = [...document.querySelectorAll('.guide-tab-btn')].map(b => b.textContent.trim());
  const panels = [...document.querySelectorAll('.guide-panel')].map(p => p.id);
  const details = [...document.querySelectorAll('.guide-fix-item')].map(d => ({
    title: d.querySelector('.guide-fix-title').textContent,
    open: d.open
  }));
  document.querySelectorAll('.guide-fix-item')[0].open = true;
  document.querySelector('.guide-tab-btn[data-guidetab="wardrobe"]').click();
  return { tabs, panels, details, activeAfter: document.querySelector('.guide-panel.active').id };
})()`);
await sleep(200);

// ---- 3. export flow -> bottom sheet ----
const isLightBefore = await ev(`document.documentElement.dataset.theme`);
await ev(`document.querySelector('.nav-pill[data-tab="standalone"]').click()`);
await sleep(400);
const doc = await send('DOM.getDocument', { depth: -1 });
const node = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#standalone-skin-input' });
await send('DOM.setFileInputFiles', { nodeId: node.result.nodeId, files: [process.cwd().replace(/\\/g, '/') + '/.tmp-assets/steve.png'] });
await sleep(3000);
await ev(`document.getElementById('standalone-download-btn').click()`);
await sleep(2600);

const sheet = await ev(`(() => {
  const s = document.getElementById('export-sheet');
  return {
    hidden: s.hidden,
    open: s.classList.contains('is-open'),
    title: document.getElementById('export-sheet-title').textContent,
    file: document.getElementById('export-sheet-file').textContent,
    steps: [...document.querySelectorAll('.export-sheet-step')].map(li => li.textContent),
    hint: document.getElementById('export-sheet-hint').textContent,
    pickerHidden: document.getElementById('export-sheet-picker').hidden,
    shareHidden: document.getElementById('export-sheet-share').hidden,
    panelTransform: getComputedStyle(s.querySelector('.export-sheet-panel')).transform
  };
})()`);
await sleep(1200);
const files = readdirSync(DL);

console.log(JSON.stringify({ darkStage, lightStage, guide, sheet, files, isLightBefore, errors }, null, 2));
ws.close();
process.exit(0);
