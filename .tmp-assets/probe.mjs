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
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result.result.value;
}

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://localhost:3000/' });
await sleep(2600);
await ev('document.querySelector(".nav-pill[data-tab=\\"standalone\\"]").click()');
await sleep(400);

const doc = await send('DOM.getDocument', { depth: -1 });
const node = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#standalone-skin-input' });
await send('DOM.setFileInputFiles', { nodeId: doc.result.root.nodeId && node.result.nodeId, files: [process.cwd().replace(/\\/g, '/') + '/public/showcase/demo-skin.png'] });
await sleep(3000);

await ev('document.querySelector(".standalone-preset-btn[data-preset=\\"all\\"]").click()');
await sleep(1200);
await ev('document.querySelectorAll(".stage-hud").forEach(el => el.style.display = "none")');

const canvasRect = await ev(`(() => { const r = document.getElementById('standalone-3d-canvas').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
for (const type of ['mousePressed', 'mouseMoved', 'mouseReleased']) {
  await send('Input.dispatchMouseEvent', {
    type,
    x: canvasRect.x + (type === 'mouseMoved' ? 26 : 0),
    y: canvasRect.y,
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1
  });
  await sleep(120);
}
await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: canvasRect.x, y: canvasRect.y, deltaX: 0, deltaY: -520 });
await sleep(900);

const rect = await ev(`(() => {
  const r = document.getElementById('standalone-3d-container').getBoundingClientRect();
  const w = Math.round(r.height * 0.8);
  return { x: Math.round(r.x + (r.width - w) / 2), y: Math.round(r.y), w, h: Math.round(r.height) };
})()`);

const shot = await send('Page.captureScreenshot', {
  format: 'png', captureBeyondViewport: true,
  clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 2 },
});
writeFileSync('.tmp-assets/stage-all.png', Buffer.from(shot.result.data, 'base64'));

const state = await ev(`JSON.stringify({
  checked: [...document.querySelectorAll('.part-toggle-checkbox')].map(c => c.checked),
  autofix: getComputedStyle(document.getElementById('standalone-autofix-btn')).display
})`);
console.log(state);
ws.close();
process.exit(0);
