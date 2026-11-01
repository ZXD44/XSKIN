import { writeFileSync } from 'node:fs';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const list = await (await fetch('http://127.0.0.1:9344/json/list')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise(r => pending.set(i, r));
};
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result.result.value;
}

await send('Page.enable');
await send('Page.bringToFront');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://localhost:3000/' });
await sleep(3200);

async function shot(name, selector) {
  const rect = await ev(`(() => { const r = document.querySelector('${selector}').getBoundingClientRect(); return {x: Math.max(0,Math.round(r.x)), y: Math.max(0,Math.round(r.y+window.scrollY)), w: Math.round(r.width), h: Math.round(r.height)}; })()`);
  const png = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 1 } });
  if (!png.result?.data) { console.log('ERR', name, JSON.stringify(png).slice(0, 500)); return; }
  writeFileSync(`.tmp-assets/${name}.png`, Buffer.from(png.result.data, 'base64'));
  console.log(name, JSON.stringify(rect));
}

await ev(`document.documentElement.setAttribute('data-theme','dark')`);
await sleep(300);
await shot('review-hero-dark', '.hero');
await ev(`document.querySelector('.nav-pill[data-tab="standalone"]').click()`);
await sleep(500);
await ev(`document.getElementById('standalone-dropzone').scrollIntoView()`);
await sleep(400);
await shot('review-standalone-dark', '#section-standalone');

await ev(`document.documentElement.setAttribute('data-theme','light')`);
await sleep(400);
await ev(`document.querySelector('.nav-pill[data-tab="home"]').click()`);
await sleep(500);
await shot('review-hero-light', '.hero');
await ev(`document.querySelector('.nav-pill[data-tab="standalone"]').click()`);
await sleep(500);
await shot('review-standalone-light', '#section-standalone');

await ev(`document.documentElement.setAttribute('data-theme','dark')`);
ws.close();
process.exit(0);
