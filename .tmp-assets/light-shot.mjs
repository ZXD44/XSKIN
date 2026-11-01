import { writeFileSync } from 'node:fs';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const PORT = process.env.VITE_PORT || '3002';

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
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 980, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `http://localhost:${PORT}/` });
await sleep(3200);

// force light theme before touching the studio
await ev(`(() => {
  localStorage.setItem('zirconx-theme', 'light');
  document.documentElement.setAttribute('data-theme', 'light');
  return document.documentElement.getAttribute('data-theme');
})()`);
await sleep(300);

await ev('document.querySelector(".nav-pill[data-tab=\\"standalone\\"]").click()');
await sleep(500);

const doc = await send('DOM.getDocument', { depth: -1 });
const node = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#standalone-skin-input' });
await send('DOM.setFileInputFiles', { nodeId: node.result.nodeId, files: [process.cwd().replace(/\\/g, '/') + '/.tmp-assets/steve.png'] });
await sleep(3400);

const pos = await ev(`(() => { const r = document.getElementById('standalone-3d-canvas').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: pos.x, y: pos.y, deltaX: 0, deltaY: -180 });
await sleep(900);

await ev('document.querySelectorAll(".stage-hud").forEach(el => el.style.display = "none")');
await ev('document.querySelector(".standalone-anim-btn[data-anim=\\"idle\\"]").click()');
await sleep(900);
// keep the captured frame free of stray hover/highlight chrome
await ev(`(() => {
  const card = document.querySelector('.workbench-stage-card');
  if (card) card.style.border = 'none';
  return getComputedStyle(document.querySelector('.workbench-canvas-container')).backgroundImage.slice(0, 120);
})()`);

const rect = await ev(`(() => {
  const r = document.getElementById('standalone-3d-container').getBoundingClientRect();
  const w = Math.round(r.height * 0.58);
  return { x: Math.round(r.x + (r.width - w) / 2), y: Math.round(r.y), w, h: Math.round(r.height * 0.92) };
})()`);
console.log('clip', JSON.stringify(rect));

const shot = await send('Page.captureScreenshot', {
  format: 'png', captureBeyondViewport: true,
  clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 2 },
});
writeFileSync('public/showcase/stage-light.png', Buffer.from(shot.result.data, 'base64'));
console.log('stage-light.png saved');
ws.close();
process.exit(0);
