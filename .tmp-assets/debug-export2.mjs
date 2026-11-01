import { readdirSync } from 'node:fs';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const PORT = process.env.VITE_PORT || '3002';

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
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) => {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise(r => pending.set(i, r));
};
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600));
  return r.result.result.value;
}

await send('Page.enable');
await send('Runtime.enable');
await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: '.tmp-assets/dl-verify', eventsEnabled: true });
await send('Page.navigate', { url: `http://localhost:${PORT}/` });
await sleep(3000);
await ev(`document.querySelector('.nav-pill[data-tab="standalone"]').click()`);
await sleep(400);
const doc = await send('DOM.getDocument', { depth: -1 });
const node = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#standalone-skin-input' });
await send('DOM.setFileInputFiles', { nodeId: node.result.nodeId, files: [process.cwd().replace(/\\/g, '/') + '/.tmp-assets/steve.png'] });
await sleep(2500);

console.log('NAMES', JSON.stringify(await ev(`(() => ({
  addon: document.getElementById('standalone-addon-name').value,
  item: document.getElementById('standalone-item-name').value
}))()`)));

await ev(`(() => {
  const set = (elId, v) => { const el = document.getElementById(elId); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
  set('standalone-addon-name', 'VerifyAddon');
  set('standalone-item-name', 'Verify Wearable');
  return true;
})()`);
await sleep(300);
await ev(`document.getElementById('standalone-download-btn').click()`);
await sleep(4000);
const after = await ev(`(() => ({
  toasts: document.getElementById('toast-container')?.innerText || '',
  sheetHidden: document.getElementById('export-sheet').hidden,
  sheetOpen: document.getElementById('export-sheet').classList.contains('is-open'),
  file: document.getElementById('export-sheet-file').textContent,
  title: document.getElementById('export-sheet-title').textContent,
  steps: [...document.querySelectorAll('.export-sheet-step')].map(li => li.textContent),
  pickerHidden: document.getElementById('export-sheet-picker').hidden,
  shareHidden: document.getElementById('export-sheet-share').hidden,
  hint: document.getElementById('export-sheet-hint').textContent
}))()`);
console.log('AFTER', JSON.stringify(after, null, 2));
console.log('FILES', JSON.stringify(readdirSync('.tmp-assets/dl-verify')));
console.log('ERRORS', JSON.stringify(errors.slice(0, 8)));
ws.close();
process.exit(0);
