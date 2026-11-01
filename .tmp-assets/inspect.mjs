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
await send('Page.navigate', { url: 'http://localhost:3000/' });
await sleep(2600);
await ev('document.querySelector(".nav-pill[data-tab=\\"standalone\\"]").click()');
await sleep(500);

const doc = await send('DOM.getDocument', { depth: -1 });
const node = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#standalone-skin-input' });
const skinPath = process.cwd().replace(/\\/g, '/') + '/public/showcase/demo-skin.png';
await send('DOM.setFileInputFiles', { nodeId: node.result.nodeId, files: [skinPath] });
await sleep(3500);

const result = await ev(`(() => {
  const c = document.getElementById('standalone-canvas');
  const x = c.getContext('2d');
  const s = c.width / 64;
  const at = (u, v) => {
    const d = x.getImageData(Math.round(u * s), Math.round(v * s), 1, 1).data;
    return '#' + [d[0], d[1], d[2]].map(n => n.toString(16).padStart(2, '0')).join('') + ' a' + d[3];
  };
  return JSON.stringify({
    canvas: [c.width, c.height],
    autofix: getComputedStyle(document.getElementById('standalone-autofix-btn')).display,
    autofixText: document.querySelector('#standalone-autofix-btn .autofix-text')?.textContent,
    positions: {
      armFront: at(45, 22),
      armSide: at(41, 22),
      armOverlay: at(45, 38),
      legFront: at(5, 22),
      legSide: at(1, 22),
      legOverlay: at(5, 38),
      shoe: at(5, 30),
      torso: at(23, 24)
    },
    url: c.toDataURL('image/png')
  });
})()`);

const parsed = JSON.parse(result);
console.log(JSON.stringify({ ...parsed, url: parsed.url.slice(0, 40) }, null, 1));
writeFileSync('.tmp-assets/processed.png', Buffer.from(parsed.url.split(',')[1], 'base64'));
ws.close();
process.exit(0);
