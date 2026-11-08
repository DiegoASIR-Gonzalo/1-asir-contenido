const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function main() {
  const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
  const match = html.match(/<script id="contador-visitas">([\s\S]*?)<\/script>/);
  assert.ok(match, 'Falta el contador de visitas');
  let visits = 0;
  const load = async (fetch) => {
    const element = { textContent: '' };
    vm.runInNewContext(match[1], { document: { getElementById: () => element }, fetch, Intl });
    await new Promise(resolve => setImmediate(resolve));
    return element.textContent;
  };
  const fetch = async () => ({ ok: true, json: async () => ({ value: ++visits }) });
  assert.match(await load(fetch), /1/);
  assert.match(await load(fetch), /2/);
  assert.equal(await load(async () => { throw new Error('sin conexión'); }), '');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
