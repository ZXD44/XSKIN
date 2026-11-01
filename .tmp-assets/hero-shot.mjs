import { writeFileSync } from 'node:fs';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result.result.value;
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://localhost:3000/' });
await sleep(3200);

const info = await ev(`(() => {
  const q = s => document.querySelector(s);
  const r = q('.hero').getBoundingClientRect();
  const shot = q('.stage-shot');
  const img = q('.stage-shot');
  return JSON.stringify({
    hero: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    shotNatural: [img.naturalWidth, img.naturalHeight],
    shotRendered: [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)],
    sideVisible: getComputedStyle(q('.stage-side')).display,
    icons: document.querySelectorAll('.slot-btn-icon svg, .work-card-icon svg, .nav-pill svg').length,
    emojiLeft: (document.body.innerText.match(/[\\u{1F300}-\\u{1FAFF}]/gu) || []).length
  });
})()`);
console.log(info);

const rect = JSON.parse(info).hero;
const png = await send('Page.captureScreenshot', {
  format: 'png', captureBeyondViewport: true,
  clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 1 },
});
writeFileSync('.tmp-assets/hero.png', Buffer.from(png.result.data, 'base64'));
console.log('errors', JSON.stringify(errors));
ws.close();
process.exit(0);
