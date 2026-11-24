'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

// El mismo motor que usa la página, con ficheros enteramente virtuales.
const html = fs.readFileSync(path.join(__dirname, '..', 'linux-terminal.html'), 'utf8');
const ctx = { console, document: { createElement: () => ({
  set innerHTML(v) { this.textContent = String(v).replace(/<[^>]*>/g, ''); }
}) } };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(html.slice(html.indexOf('const MUNDO_HOME'), html.indexOf('// 1) Lectura y validación')), ctx);
const estado = archivos => ctx.crearEstado({ inicio: { base: 'vacio', fs: archivos } });
const run = (e, cmd) => ctx.ejecutarLinea(e, cmd);
const salida = (e, cmd) => {
  const r = run(e, cmd);
  assert.equal(r.code, 0, cmd + ': ' + r.err);
  return r.out;
};

test('grep distingue operadores BRE, ERE y texto fijo sin expandir cuantificadores', () => {
  const e = estado({ '~/patrones': 'aa\na+\nab\na|b\nabab\na(2)\n' });
  assert.equal(salida(e, "grep '^a+$' patrones"), 'a+');
  assert.equal(salida(e, "grep '^a\\+$' patrones"), 'aa');
  assert.equal(salida(e, "grep -E '^a+$' patrones"), 'aa');
  assert.equal(salida(e, "egrep '^(ab){2}$' patrones"), 'abab');
  assert.equal(salida(e, "grep '^\\(ab\\)\\{2\\}$' patrones"), 'abab');
  assert.equal(salida(e, "grep -F -e 'a+' -e 'a|b' patrones"), 'a+\na|b');
});

test('grep combina clases POSIX ASCII, -i -n -v -x -w y múltiples patrones', () => {
  const e = estado({ '~/lineas': '# comentario\n\tAlias uno\n alias dos\naliasXYZ\n42\nCAF9\n\n' });
  assert.equal(salida(e, "grep -Ein '^[[:blank:]]+alias' lineas"), '2:\tAlias uno\n3: alias dos');
  assert.equal(salida(e, "grep -Ex '[[:digit:]]+' lineas"), '42');
  assert.equal(salida(e, "grep -Ex '[[:xdigit:]]+' lineas"), '42\nCAF9');
  assert.equal(salida(e, "grep -viwe alias -e CAF9 lineas"), '# comentario\naliasXYZ\n42\n');
  assert.equal(salida(e, "grep -E '[[:space:]][[:alpha:]]+[[:alnum:]]*' lineas"), '# comentario\n\tAlias uno\n alias dos');
});

test('grep -o imprime cada coincidencia no vacía y -c cuenta líneas, incluido cero', () => {
  const e = estado({ '~/n': 'a12 b34\n56\nno\n', '~/vacio': '' });
  assert.equal(salida(e, "grep -onE '[0-9]+' n"), '1:12\n1:34\n2:56');
  assert.equal(salida(e, "grep -ocE '[0-9]+' n"), '2');
  const cero = run(e, "grep -c ausente n");
  assert.equal(cero.out, '0');
  assert.equal(cero.code, 1);
  assert.equal(run(e, 'grep -q ausente n').code, 1);
  assert.equal(salida(e, 'grep -q 12 n'), '');
  assert.equal(salida(e, "grep '' n"), 'a12 b34\n56\nno');
  assert.equal(run(e, "grep '' vacio").code, 1);
  assert.equal(salida(e, "grep -oE 'a|aa' n", ''), 'a');
});

test('grep -f, -- y -r leen solo el mundo virtual y reportan errores', () => {
  const e = estado({ '~/busca': '-security\n^deb\n', '~/conf/a': 'deb uno\n-security\n', '~/conf/sub/b': '# fuera\ndeb dos\n' });
  assert.equal(salida(e, 'grep -nr -f busca conf'), 'conf/a:1:deb uno\nconf/a:2:-security\nconf/sub/b:2:deb dos');
  assert.equal(salida(e, 'grep -- -security conf/a'), '-security');
  assert.equal(run(e, 'grep -f noexiste conf/a').code, 2);
  assert.equal(run(e, 'grep x noexiste').code, 2);
  assert.equal(run(e, "grep -E '[' conf/a").code, 2);
  assert.equal(run(e, 'grep --inventada x conf/a').code, 2);
});

test('los operadores entre comillas son argumentos y no separan órdenes', () => {
  const e=estado({'~/p':';\n|\n>\n','~/tabla':'nombre;nota\nana;7\n'});
  assert.equal(salida(e,"grep -F ';' p"),';');
  assert.equal(salida(e,"grep -F '|' p"),'|');
  assert.equal(salida(e,"grep -F '>' p"),'>');
  assert.equal(salida(e,"awk -F ';' 'NR >= 2 {print $1,$2}' tabla"),'ana 7\n');
});

test('las comillas dobles conservan las barras de una expresión regular',()=>{
  const e=estado({'~/correos':'ana@aula.es\nusuario@servidor\nsoporte@centro.org\n'});
  assert.equal(salida(e,'grep -E "^[[:alnum:]_.-]+@[[:alnum:]]+\\.[[:alpha:]]{2,4}$" correos'),'ana@aula.es\nsoporte@centro.org');
});

test('less admite numeración y búsquedas iniciales conservando el fichero',()=>{
  const e=estado({'~/guia':'Inicio\nReferencia CAPITULO-2\nCAPITULO-2: fin\nDetalle\n'});
  assert.equal(salida(e,'less -N guia'),'     1 Inicio\n     2 Referencia CAPITULO-2\n     3 CAPITULO-2: fin\n     4 Detalle\n');
  assert.equal(salida(e,"less '+/^CAPITULO-2:' guia"),'CAPITULO-2: fin\nDetalle\n');
  assert.equal(e.fs['/home/usuario/guia'].contenido,'Inicio\nReferencia CAPITULO-2\nCAPITULO-2: fin\nDetalle\n');
});

test('date calcula días ISO y ordinales también en años bisiestos',()=>{
  const e=estado({});
  assert.equal(salida(e,'date -d "2028-02-29" +%u'),'2');
  assert.equal(salida(e,'date -d "2028-02-29" +%j'),'060');
  assert.equal(salida(e,'date -d "2028-12-31" +%j'),'366');
  assert.equal(salida(e,'date -d "2027-03-01" +%j'),'060');
});

test('sort -u elimina duplicados en las tuberías con cut compacto',()=>{
  const e=estado({'~/avisos':'pc01:ERROR:aula2\npc02:ERROR:aula1\npc03:ERROR:aula2\n'});
  assert.equal(salida(e,'cut -d: -f3 avisos | sort -u'),'aula1\naula2');
  assert.equal(salida(e,'cut -d: -f3 avisos | sort -ru'),'aula2\naula1');
});

test('el aprendizaje reconoce grupos de opciones y alias largos sin leer el patrón como flags',()=>{
  const fijo={aprendizaje:{comando:'grep',opciones:['-F']}};
  assert.equal(ctx.comprobarAprendizaje(fijo,"grep -Fi 'ruta.v1' p").ok,true);
  assert.equal(ctx.comprobarAprendizaje(fijo,"grep --fixed-strings 'ruta.v1' p").ok,true);
  const lista={aprendizaje:{comando:'grep',opciones:['-f'],valores:['patrones.txt']}};
  assert.equal(ctx.comprobarAprendizaje(lista,'grep --file=patrones.txt p').ok,true);
  const bre={aprendizaje:{comando:'grep',sinOpciones:['-E','-F','-P']}};
  assert.equal(ctx.comprobarAprendizaje(bre,"grep -Ei '[a-z]+' p").ok,false);
  assert.equal(ctx.comprobarAprendizaje(bre,"grep --extended-regexp '[a-z]+' p").ok,false);
  assert.equal(ctx.comprobarAprendizaje(bre,"grep -e '-E' p").ok,true);
  assert.equal(ctx.comprobarAprendizaje({aprendizaje:{comando:'rename',opciones:['-n']}},"rename -nv 's/a/b/' p").ok,true);
});

test('sed selecciona direcciones numéricas, última línea, regex e intervalos', () => {
  const e = estado({ '~/texto': '# uno\nfoo\nbar\n# fin\n' });
  assert.equal(salida(e, "sed -n '2,3p' texto"), 'foo\nbar\n');
  assert.equal(salida(e, "sed -n '$p' texto"), '# fin\n');
  assert.equal(salida(e, "sed '/^#/d' texto"), 'foo\nbar\n');
  assert.equal(salida(e, "sed -n '/foo/,/^#/p' texto"), 'foo\nbar\n# fin\n');
  assert.equal(salida(e, "sed -n -e '2p' -e '4p' texto"), 'foo\n# fin\n');
});

test('sed sustituye por defecto una vez y conserva &, grupos y flags g/i', () => {
  const e = estado({ '~/texto': 'foo Foo foo\nAna López\n', '~/sinlf': 'foo' });
  assert.equal(salida(e, "sed 's/foo/[&]/' texto"), '[foo] Foo foo\nAna López\n');
  assert.equal(salida(e, "sed 's/foo/bar/gi' texto"), 'bar bar bar\nAna López\n');
  assert.equal(salida(e, "sed -E '2s/^([^ ]+) (.+)$/\\2, \\1/' texto"), 'foo Foo foo\nLópez, Ana\n');
  assert.equal(salida(e, "sed 's/foo/bar/g' sinlf"), 'bar');
  assert.equal(salida(e, "sed 's#foo#bar#g' texto"), 'bar Foo bar\nAna López\n');
});

test('sed -i.bak copia el original, -i modifica sin imprimir y valida antes de escribir', () => {
  const e = estado({ '~/texto': 'foo\n', '~/otro': 'foo\n' });
  assert.equal(salida(e, "sed -i.bak 's/foo/bar/' texto"), '');
  assert.equal(e.fs['/home/usuario/texto'].contenido, 'bar\n');
  assert.equal(e.fs['/home/usuario/texto.bak'].contenido, 'foo\n');
  assert.equal(salida(e, "sed -i -e 's/bar/baz/' texto"), '');
  assert.equal(e.fs['/home/usuario/texto'].contenido, 'baz\n');
  assert.notEqual(run(e, "sed -i 's/[//g' otro").code, 0);
  assert.equal(e.fs['/home/usuario/otro'].contenido, 'foo\n');
  const no = run(e, "sed 'a\\inventado' otro");
  assert.notEqual(no.code, 0);
  assert.match(no.err, /soportad|admitid/i);
});

test('awk imprime campos, último campo y contadores con -F y espacio por defecto', () => {
  const e = estado({ '~/usuarios': 'root:x:0:0:root:/root:/bin/bash\nusuario:x:1000:1000:Usuario:/home/usuario:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n', '~/tabla': '  Ana  20\nLuis\t30\n' });
  assert.equal(salida(e, "awk '{print $1,$2}' tabla"), 'Ana 20\nLuis 30\n');
  assert.equal(salida(e, "awk -F: '{print NR,NF,$1,$NF}' usuarios"), '1 7 root /bin/bash\n2 7 usuario /bin/bash\n3 7 nobody /usr/sbin/nologin\n');
  assert.equal(salida(e, "awk -F ':' '$1 == \"usuario\" {print $1,$7}' usuarios"), 'usuario /bin/bash\n');
});

test('awk filtra ERE y condiciones && sin ejecutar código del alumno', () => {
  const e = estado({ '~/usuarios': 'root:x:0:0:root:/root:/bin/bash\nusuario:x:1000:1000:Usuario:/home/usuario:/bin/bash\nwww:x:33:33:www:/var/www:/bin/false\n' });
  assert.equal(salida(e, "awk -F: '/usuario|www/ {print $1}' usuarios"), 'usuario\nwww\n');
  assert.equal(salida(e, "awk -F: 'NR >= 2 && $7 ~ /bash$/ {print $1}' usuarios"), 'usuario\n');
  assert.equal(salida(e, "awk -F: '$1 == \"usuario\" && $7 ~ /bash$/ {print}' usuarios"), 'usuario:x:1000:1000:Usuario:/home/usuario:/bin/bash\n');
  for (const cmd of ["awk 'BEGIN {system(\"touch fuera\")}' usuarios", "awk '{print $1; system(\"x\")}' usuarios", "awk '/[/ {print}' usuarios"]){
    const r = run(e, cmd);
    assert.notEqual(r.code, 0, cmd);
    assert.match(r.err, /awk:/);
  }
  assert(!e.fs['/home/usuario/fuera']);
});

test('rename s/// respeta -n, -v, grupos, globs y no sobrescribe', () => {
  const e = estado({ '~/Foto 1.JPG': 'imagen', '~/Foto 2.JPG': 'imagen2', '~/a.txt': 'a', '~/b.txt': 'b' });
  const ensayo = salida(e, "rename -n 's/ /_/g' *.JPG");
  assert.match(ensayo, /rename\(Foto 1\.JPG, Foto_1\.JPG\)/, 'la simulación usa la salida de File::Rename');
  assert.match(ensayo, /Foto 1\.JPG.*Foto_1\.JPG/);
  assert(e.fs['/home/usuario/Foto 1.JPG']);
  assert.match(salida(e, "rename -v 's/^(Foto) ([0-9])\\.JPG$/$1_$2.jpg/i' *.JPG"), /Foto_1\.jpg/);
  assert.equal(e.fs['/home/usuario/Foto_1.jpg'].contenido, 'imagen');
  assert(!e.fs['/home/usuario/Foto 1.JPG']);
  const choque = run(e, "rename 's/a/b/' a.txt");
  assert.notEqual(choque.code, 0);
  assert.equal(e.fs['/home/usuario/a.txt'].contenido, 'a');
  assert.equal(e.fs['/home/usuario/b.txt'].contenido, 'b');
  const colision = run(e, "rename 's/Foto_[0-9]/Foto/' *.jpg");
  assert.notEqual(colision.code, 0);
  assert(e.fs['/home/usuario/Foto_1.jpg']);
  assert(e.fs['/home/usuario/Foto_2.jpg']);
  assert.notEqual(run(e, "rename 'system(\"x\")' a.txt").code, 0);
});

test('tr, uniq y less admiten filtros ASCII y lectura de ficheros virtuales', () => {
  const e = estado({ '~/lista': 'uno\nuno\ndos\ntres\ntres\ntres\n', '~/texto': 'aa  bb\t12\n' });
  assert.equal(salida(e, "tr -s '[:blank:]' < texto"), 'aa bb\t12\n');
  assert.equal(salida(e, "tr -d '[:digit:]' < texto"), 'aa  bb\t\n');
  assert.equal(salida(e, "tr 'a-z' 'A-Z' < texto"), 'AA  BB\t12\n');
  assert.equal(salida(e, 'uniq -d lista'), 'uno\ntres\n');
  assert.equal(salida(e, 'uniq -u lista'), 'dos\n');
  assert.equal(salida(e, 'uniq -c lista'), '      2 uno\n      1 dos\n      3 tres\n');
  assert.equal(salida(e, 'less texto'), 'aa  bb\t12\n');
});

test('casos críticos coinciden con GNU local si se solicita FILTROS_GNU=1', { skip: process.env.FILTROS_GNU !== '1' }, t => {
  const casos = [
    ['grep', ['^a\\+$'], 'aa\na+\n', "grep '^a\\+$' < entrada"],
    ['grep', ['-oE', 'a|aa'], 'aa\n', "grep -oE 'a|aa' < entrada"],
    ['grep', ['-Ein', '^[[:blank:]]+alias'], '\tAlias uno\nno\n', "grep -Ein '^[[:blank:]]+alias' < entrada"],
    ['sed', ['-n', '2,3p'], 'uno\ndos\ntres\ncuatro\n', "sed -n '2,3p' < entrada"],
    ['sed', ['-E', 's/^([^ ]+) (.+)$/\\2, \\1/'], 'Ana López\n', "sed -E 's/^([^ ]+) (.+)$/\\2, \\1/' < entrada"],
    ['awk', ['-F:', 'NR >= 2 && $3 ~ /bash$/ {print $1}'], 'root:x:/bin/bash\nusuario:x:/bin/bash\n', "awk -F: 'NR >= 2 && $3 ~ /bash$/ {print $1}' < entrada"]
  ];
  for (const [bin, args, input, cmd] of casos){
    const real = spawnSync(bin, args, { input, encoding: 'utf8', timeout: 2000, env: { ...process.env, LC_ALL: 'C' } });
    if (real.error && ['EPERM','EACCES','ENOSYS'].includes(real.error.code)) {
      t.skip('El entorno impide ejecutar GNU desde un proceso hijo de Node; compara mediante la shell.');
      return;
    }
    if (real.error && real.error.code === 'ENOENT') { t.diagnostic(bin + ' no está instalado; se omite la comparación'); continue; }
    assert.equal(real.status, 0, real.stderr);
    const sim = run(estado({ '~/entrada': input }), cmd);
    assert.equal(sim.code, 0, sim.err);
    assert.equal(sim.out.replace(/\n$/, ''), real.stdout.replace(/\n$/, ''), cmd);
  }
});
