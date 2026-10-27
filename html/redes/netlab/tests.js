/* Pruebas de humo del motor: node tests.js */
global.IPCalc = require('./js/ipcalc.js');
global.Model = require('./js/model.js');
global.Sim = require('./js/sim.js');
global.Services = require('./js/services.js');
const A = require('./js/activities.js');
let fails = 0;
for (const act of A.ACTIVITIES) {
  const st = act.solution();
  const res = act.check(st);
  const bad = res.filter(r => !r.ok);
  console.log(`\n=== ${act.id} · ${st.nodes.length} equipos / ${st.links.length} enlaces`);
  res.forEach(r => console.log(`  ${r.ok ? 'OK ' : 'XX '}${r.text} :: ${r.msg}`));
  if (bad.length) fails++;
  if (act.initial) {
    try { act.check(act.initial()); } catch (e) { console.log('  EXCEPCIÓN en initial:', e.message); fails++; }
  }
}
console.log('\nfallos:', fails);
process.exit(fails ? 1 : 0);
