import { writeFileSync } from 'node:fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch('http://127.0.0.1:9344/json/list')).json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* retry */ }
    await sleep(300);
  }
  throw new Error('CDP unavailable');
}

const wsUrl = await connect();
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(a => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) => {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise(res => pending.set(msgId, res));
};
async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.result?.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails).slice(0, 400));
  return res.result.result.value;
}

await send('Runtime.enable');
await send('Page.enable');
await send('DOM.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://localhost:3000/' });
await sleep(3500);

// open the wearable studio
await evaluate(`document.querySelector('.nav-pill[data-tab="standalone"]').click()`);
await sleep(600);

// feed the demo skin into the real file input
const doc = await send('DOM.getDocument', { depth: -1 });
const node = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#standalone-skin-input' });
console.log('input nodeId', node.result.nodeId);
const skinPath = process.cwd().replace(/\\/g, '/') + '/public/showcase/demo-skin.png';
await send('DOM.setFileInputFiles', { nodeId: node.result.nodeId, files: [skinPath] });
await sleep(4500);

const state = await evaluate(`(() => {
  const c = document.getElementById('standalone-3d-canvas');
  return {
    workarea: getComputedStyle(document.getElementById('standalone-skin-workarea')).display,
    canvas: [c.width, c.height],
    badge: document.getElementById('standalone-res-badge')?.textContent,
    icon: !!document.getElementById('standalone-slot-icon-img').src
  };
})()`);
console.log('STATE', JSON.stringify(state));

// clean overlays for a product shot
await evaluate(`(() => {
  document.querySelectorAll('.stage-hud').forEach(el => el.style.display = 'none');
  document.querySelector('.workbench-stage-card').style.borderRadius = '0';
})()`);

// dynamic pose
await evaluate(`document.querySelector('.standalone-anim-btn[data-anim="run"]').click()`);
await sleep(900);

const rect = await evaluate(`(() => {
  const r = document.getElementById('standalone-3d-container').getBoundingClientRect();
  const w = Math.round(r.height * 0.8);
  return { x: Math.round(r.x + (r.width - w) / 2), y: Math.round(r.y), w, h: Math.round(r.height) };
})()`);
console.log('RECT', JSON.stringify(rect));

const shot = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: true,
  clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 2 },
});
writeFileSync('public/showcase/stage.png', Buffer.from(shot.result.data, 'base64'));
console.log('stage.png written');

// second shot: same stage but as the hide-part screen (transparent skin preview)
const rect2 = await evaluate(`(() => {
  document.querySelector('.nav-pill[data-tab="hidepart"]').click();
  return new Promise(res => setTimeout(() => {
    const r = document.getElementById('hidepart-3d-container').getBoundingClientRect();
    res({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
  }, 900));
})()`);
console.log('RECT2', JSON.stringify(rect2));
const shot2 = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: true,
  clip: { x: rect2.x, y: rect2.y, width: rect2.w, height: rect2.h, scale: 2 },
});
writeFileSync('.tmp-assets/hidepart-stage.png', Buffer.from(shot2.result.data, 'base64'));

console.log('ERRORS', JSON.stringify(errors.slice(0, 5)));
ws.close();
process.exit(0);
