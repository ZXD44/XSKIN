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
await sleep(3000);

const state = await ev(`(() => {
  const b = document.getElementById('standalone-download-btn');
  return {
    workarea: getComputedStyle(document.getElementById('standalone-skin-workarea')).display,
    dropzone: getComputedStyle(document.getElementById('standalone-dropzone')).display,
    btnDisabled: b.disabled,
    btnText: b.textContent.trim(),
    toasts: document.getElementById('toast-container')?.innerText || '',
    hasSheetFn: typeof window.showSaveFilePicker,
    userAgent: navigator.userAgent
  };
})()`);
console.log('STATE', JSON.stringify(state));

await ev(`document.getElementById('standalone-download-btn').click()`);
await sleep(3500);
const after = await ev(`(() => ({
  toasts: document.getElementById('toast-container')?.innerText || '',
  sheetHidden: document.getElementById('export-sheet').hidden,
  sheetOpen: document.getElementById('export-sheet').classList.contains('is-open'),
  file: document.getElementById('export-sheet-file').textContent
}))()`);
console.log('AFTER', JSON.stringify(after));
console.log('FILES', JSON.stringify(readdirSync('.tmp-assets/dl-verify')));
console.log('ERRORS', JSON.stringify(errors.slice(0, 8)));
ws.close();
process.exit(0);
