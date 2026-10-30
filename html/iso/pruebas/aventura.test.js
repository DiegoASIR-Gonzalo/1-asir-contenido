#!/usr/bin/env node
/* =====================================================================
   pruebas/aventura.test.js · revisa la aventura guiada sin abrir el navegador
   ---------------------------------------------------------------------
   Uso (desde la carpeta del repositorio):
       node html/iso/pruebas/aventura.test.js

   Qué comprueba:
     1. Que cada mundo, lección (nodo) y ronda tiene id único y textos.
     2. Que cada pantalla es de un tipo conocido y tiene lo que necesita.
     3. Que cada práctica tiene ejemplo y meta.
     4. Que el "ejemplo" de cada práctica supera su propia meta de verdad,
        ejecutándolo con el mismo intérprete de la terminal y en el mismo
        orden que lo hará el alumno (el estado pasa de una pantalla a otra).
     5. Que el ejemplo de cada teoría se ejecuta sin error (así la salida
        que se enseña en pantalla nunca es un mensaje de error).
     6. Que ninguna práctica se supera sin escribir nada.
     7. Que cada test tiene exactamente una respuesta correcta y explica
        el porqué de todas las opciones.
     8. Que no se usa ningún comando que el simulador no conozca.

   No necesita dependencias: solo Node. Sale con código 1 si algo falla.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const RAIZ = path.join(__dirname, '..');
const HTML = path.join(RAIZ, 'linux-terminal.html');
const DATOS = path.join(RAIZ, 'aventura', 'aventura-datos.js');

const color = (n, t) => process.stdout.isTTY ? '\x1b[' + n + 'm' + t + '\x1b[0m' : t;
const rojo = t => color(31, t), verde = t => color(32, t), gris = t => color(90, t);

const fallos = [];
const comprobar = (fn, texto) => { try { fn(); } catch (e) { fallos.push(texto + ': ' + e.message); } };

/* ---------- 1) Motor del simulador ---------- */
const html = fs.readFileSync(HTML, 'utf8');
const desde = html.indexOf('const MUNDO_HOME');
const hasta = html.indexOf('// 1) Lectura y validación');
if (desde < 0 || hasta < 0 || hasta < desde){
  console.error(rojo('No se encuentra el motor dentro de linux-terminal.html.'));
  console.error('Busca las marcas "const MUNDO_HOME" y "// 1) Lectura y validación".');
  process.exit(1);
}
const caja = () => {
  let h = '';
  return {
    set innerHTML(v){ h = String(v); },
    get innerHTML(){ return h; },
    get textContent(){ return h.replace(/<[^>]*>/g, ''); }
  };
};
const ctx = { console, document: { createElement: caja } };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(html.slice(desde, hasta), ctx);

// `const` en un script no acaba en el objeto global del contexto: se pide aparte.
const CMD_SIM = vm.runInContext('CMD_SIM', ctx);

/* ---------- 2) Datos ---------- */
vm.runInContext(fs.readFileSync(DATOS, 'utf8'), ctx);
const AVENTURA = ctx.AVENTURA;
if (!AVENTURA || !Array.isArray(AVENTURA.mundos)){
  console.error(rojo('aventura-datos.js no define window.AVENTURA.mundos.'));
  process.exit(1);
}

/* ---------- 3) Utilidades ---------- */
const TIPOS = ['teoria', 'practica', 'test', 'teclas'];
const ids = new Set();
const comandosUsados = new Set();
let nodos = 0, rondas = 0, practicas = 0, teorias = 0, tests = 0, atajos = 0;

const clonar = e => JSON.parse(JSON.stringify(e));

// Ejecuta uno o varios comandos sobre un estado y devuelve la salida acumulada.
function ejecutarEn(estado, cmds){
  let out = '', code = 0;
  for (const c of [].concat(cmds)){
    const r = ctx.ejecutarLinea(estado, c);
    out += r.out + r.err;
    code = r.code;
  }
  return { salida: out, code };
}

const comandosDe = cmd => String(cmd)
  .split(/;|&&|\|\|/)
  .map(t => t.trim().split(/\s+/)[0])
  .filter(Boolean)
  .filter(t => !/^[<>]/.test(t) && !/^2>/.test(t) && !/^[A-Za-z_]\w*=/.test(t));

/* Los alias definidos en el propio ejemplo son nombres válidos, no comandos. */
const aliasDe = cmds => {
  const set = new Set();
  for (const c of [].concat(cmds)) {
    for (const m of String(c).matchAll(/\balias\s+([A-Za-z_][\w-]*)=/g)) set.add(m[1]);
  }
  return set;
};

/* ---------- 4) Recorrido de los datos ---------- */
AVENTURA.mundos.forEach((mundo, mi) => {
  const donde = 'mundo ' + (mi + 1);
  comprobar(() => assert(mundo.id && typeof mundo.id === 'string', 'falta id'), donde);
  comprobar(() => assert(mundo.titulo, 'falta título'), donde);
  comprobar(() => assert(mundo.resumen, 'falta resumen'), donde);
  comprobar(() => assert(Array.isArray(mundo.lecciones) && mundo.lecciones.length, 'sin lecciones'), donde);
  comprobar(() => assert(!ids.has(mundo.id), 'id repetido: ' + mundo.id), donde);
  ids.add(mundo.id);

  (mundo.lecciones || []).forEach((lec, li) => {
    const sitio = mundo.id + ' › ' + (lec.id || 'nodo ' + (li + 1));
    nodos++;
    comprobar(() => assert(lec.id && !ids.has(lec.id), 'falta id o está repetido'), sitio);
    ids.add(lec.id);
    comprobar(() => assert(lec.titulo, 'falta título'), sitio);
    comprobar(() => assert(lec.resumen, 'falta resumen'), sitio);
    comprobar(() => assert(lec.comando, 'falta el comando que se practica'), sitio);
    comprobar(() => assert(Array.isArray(lec.rondas) && lec.rondas.length >= 1, 'sin rondas'), sitio);

    (lec.rondas || []).forEach((ronda, ri) => {
      const suyoR = sitio + ' › ronda ' + (ri + 1);
      rondas++;
      comprobar(() => assert(ronda.titulo, 'falta título'), suyoR);
      comprobar(() => assert(ronda.resumen, 'falta resumen'), suyoR);
      comprobar(() => assert(Array.isArray(ronda.pantallas) && ronda.pantallas.length >= 3, 'necesita al menos 3 pantallas'), suyoR);

      // El estado avanza igual que en la ronda real: una práctica deja el mundo
      // preparado para la siguiente. Cada ronda empieza de cero.
      const inicio = Object.assign({}, lec.inicio || {}, ronda.inicio || {});
      let estado = ctx.crearEstado({ inicio: inicio });

      (ronda.pantallas || []).forEach((p, pi) => {
        const suyo = suyoR + ' · pantalla ' + (pi + 1);
        comprobar(() => assert(TIPOS.includes(p.tipo), 'tipo desconocido: ' + p.tipo), suyo);

        if (p.tipo === 'teoria'){
          teorias++;
          comprobar(() => assert(p.titulo, 'falta título'), suyo);
          comprobar(() => assert(p.html, 'falta explicación'), suyo);
          if (p.ejemplo) comprobar(() => {
            const alias = aliasDe(p.ejemplo);
            for (const c of [].concat(p.ejemplo)) comandosDe(c).filter(x => !alias.has(x)).forEach(x => comandosUsados.add(x));
            const r = ejecutarEn(clonar(estado), p.ejemplo);
            assert.strictEqual(r.code, 0, 'el ejemplo "' + [].concat(p.ejemplo).join('; ') + '" termina en error');
          }, suyo + ' (ejemplo de teoría)');
        }

        if (p.tipo === 'teclas'){
          atajos++;
          comprobar(() => assert(p.titulo, 'falta título'), suyo);
          comprobar(() => assert(p.pide, 'falta el enunciado "pide"'), suyo);
          comprobar(() => assert(p.combo && p.combo.key, 'falta el atajo "combo"'), suyo);
          comprobar(() => assert(p.demo && p.demo.antes && p.demo.despues, 'falta la demostración "demo"'), suyo);
          comprobar(() => assert(p.pista, 'falta pista'), suyo);
          comprobar(() => assert(p.explica, 'falta explicación del atajo'), suyo);
        }

        if (p.tipo === 'practica'){
          practicas++;
          comprobar(() => assert(p.pide, 'falta el enunciado "pide"'), suyo);
          comprobar(() => assert(p.ejemplo, 'falta ejemplo'), suyo);
          comprobar(() => assert(p.meta && typeof p.meta === 'object' && Object.keys(p.meta).length, 'falta meta'), suyo);
          comprobar(() => {
            const alias = aliasDe(p.ejemplo);
            for (const c of [].concat(p.ejemplo)) comandosDe(c).filter(x => !alias.has(x)).forEach(x => comandosUsados.add(x));

            const antes = clonar(estado);
            const despues = clonar(estado);
            const r = ejecutarEn(despues, p.ejemplo);
            if (!p.toleraError)
              assert.strictEqual(r.code, 0, 'el ejemplo "' + [].concat(p.ejemplo).join('; ') + '" termina en error');
            const v = ctx.comprobarMeta(despues, p.meta, r.salida);
            assert(v.ok, 'el ejemplo "' + p.ejemplo + '" NO cumple su meta: ' + v.motivo);

            // La misma meta no debe darse por buena sin haber hecho nada.
            const vacio = ctx.comprobarMeta(antes, p.meta, '');
            assert(!vacio.ok, 'la meta se cumple sin escribir nada (revisa "muestra" o "cwd")');

            estado = despues;   // el alumno sigue desde el mundo que dejó la práctica
          }, suyo + ' (ejemplo contra meta)');
        }

        if (p.tipo === 'test'){
          tests++;
          comprobar(() => assert(p.pregunta, 'falta pregunta'), suyo);
          comprobar(() => assert(Array.isArray(p.opciones) && p.opciones.length >= 2, 'faltan opciones'), suyo);
          comprobar(() => {
            const buenas = (p.opciones || []).filter(o => o.ok === true);
            assert.strictEqual(buenas.length, 1, 'debe haber exactamente una opción correcta (hay ' + buenas.length + ')');
          }, suyo);
          (p.opciones || []).forEach((o, oi) => {
            comprobar(() => assert(o.t && o.t.trim(), 'la opción ' + (oi + 1) + ' está vacía'), suyo);
            comprobar(() => assert(o.porque && o.porque.trim(), 'la opción ' + (oi + 1) + ' no explica el porqué'), suyo);
          });
        }
      });
    });
  });
});

/* ---------- 5) Comandos conocidos ---------- */
comprobar(() => {
  const desconocidos = [...comandosUsados].filter(c => !CMD_SIM[c]);
  assert.strictEqual(desconocidos.length, 0, 'el simulador no conoce: ' + desconocidos.join(', '));
}, 'comandos');

/* ---------- 6) Comandos nuevos del temario ---------- */
comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base: 'vacio' } });
  ctx.ejecutarLinea(e, 'touch nota.txt');
  ctx.ejecutarLinea(e, 'date +%F');
  ctx.ejecutarLinea(e, 'history');
  assert(/touch nota\.txt/.test(e.historial.join('\n')), 'history debe guardar los comandos');
  assert(/date \+%F/.test(e.historial.join('\n')), 'history debe guardar date +%F');
}, 'history');

comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base: 'vacio' } });
  ctx.ejecutarLinea(e, 'touch nota.txt');
  const r = ctx.ejecutarLinea(e, 'touch -d "03/02/2003" nota.txt; stat nota.txt');
  assert.strictEqual(r.code, 0, 'touch -d y stat deben funcionar');
  assert(/2003-02-03/.test(r.out), 'stat debe mostrar la fecha asignada con touch -d');
}, 'touch -d / stat');

comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base: 'vacio' } });
  assert.strictEqual(ctx.ejecutarLinea(e, 'basename /home/usuario/fichero1.txt .txt').out, 'fichero1');
  assert.strictEqual(ctx.ejecutarLinea(e, 'dirname /home/usuario/fichero1.txt').out, '/home/usuario');
}, 'basename / dirname');

comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base: 'vacio' } });
  const r = ctx.ejecutarLinea(e, 'cal 12 1970');
  assert(/December 1970/.test(r.out), 'cal 12 1970 debe mostrar diciembre de 1970');
  assert(/31/.test(r.out), 'cal debe mostrar el día 31');
}, 'cal');

comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base: 'vacio' } });
  ctx.ejecutarLinea(e, "alias l='ls -l'");
  const r = ctx.ejecutarLinea(e, 'l');
  assert.strictEqual(r.code, 0, 'el alias debe ejecutarse');
  assert.strictEqual(ctx.ejecutarLinea(e, 'unalias l').code, 0, 'unalias debe funcionar');
  assert.strictEqual(ctx.ejecutarLinea(e, 'l').code, 1, 'tras unalias, l ya no existe');
}, 'alias / unalias');

comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base: 'vacio' } });
  const r = ctx.ejecutarLinea(e, 'cadena="esto es una cadena"; echo $cadena');
  assert.strictEqual(r.out, 'esto es una cadena', 'las variables de la shell deben funcionar');
  const f = ctx.ejecutarLinea(e, 'fecha=$(date +%F); echo $fecha');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(f.out), 'la sustitución de comandos debe funcionar');
}, 'variables');

/* ---------- 7) find -print0 | xargs -0 conserva los bytes nulos ---------- */
comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base: 'vacio', fs: {
    '~/proyecto': 'dir',
    '~/proyecto/notas.txt': 'hola\nAdios\nOtra\n',
    '~/proyecto/errores.txt': 'error\nbien\nerror\n',
    '~/proyecto/vacio.txt': ''
  } } });
  const r = ctx.ejecutarLinea(e, 'find ~/proyecto -name "*.txt" -print0 | xargs -0 wc -l');
  assert.strictEqual(r.code, 0, 'la tubería con bytes nulos no debe fallar');
  assert(/3 .*notas\.txt/.test(r.out), 'wc debe contar notas.txt por separado');
  assert(/3 .*errores\.txt/.test(r.out), 'wc debe contar errores.txt por separado');
  assert(/0 .*vacio\.txt/.test(r.out), 'wc debe contar vacio.txt por separado');
}, 'find -print0 | xargs -0');

/* ---------- 8) rmdir se comporta como en Linux ---------- */
comprobar(() => {
  const e = ctx.crearEstado({ inicio: { fs: { '~/llena': 'dir', '~/llena/x': 'y', '~/vacia': 'dir' } } });
  const no = ctx.ejecutarLinea(e, 'rmdir llena');
  assert.notStrictEqual(no.code, 0, 'rmdir debe negarse con una carpeta llena');
  assert(e.fs['/home/usuario/llena'], 'rmdir no debe borrar una carpeta llena');
  const si = ctx.ejecutarLinea(e, 'rmdir vacia');
  assert.strictEqual(si.code, 0, 'rmdir debe borrar una carpeta vacía');
  assert(!e.fs['/home/usuario/vacia'], 'rmdir debe borrar la carpeta vacía');
}, 'rmdir');

/* ---------- 8) Motor ampliado: redirecciones, fechas y permisos ---------- */
comprobar(() => {
  const e = ctx.crearEstado({ inicio: { base:'vacio', fs:{ '~/a.txt':'uno\ndos\ntres\n' } } });
  assert.strictEqual(ctx.ejecutarLinea(e, 'wc -l < a.txt').out.trim(), '3', 'la entrada redirigida debe leerse del fichero');
  assert.strictEqual(ctx.ejecutarLinea(e, 'cat < a.txt').out, 'uno\ndos\ntres\n', 'cat < fichero debe mostrar su contenido');
  assert.notStrictEqual(ctx.ejecutarLinea(e, 'cat < noexiste').code, 0, 'un fichero de entrada inexistente debe fallar');
}, 'redirección de entrada <');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ base:'vacio' } });
  ctx.ejecutarLinea(e, 'ls noexiste > todo.log 2>&1');
  const todo = e.fs['/home/usuario/todo.log'];
  assert(todo && /No such file/.test(todo.contenido), '> f 2>&1 debe guardar también los errores');
  ctx.ejecutarLinea(e, 'ls noexiste &> ambos.log');
  assert(/No such file/.test(e.fs['/home/usuario/ambos.log'].contenido), '&> debe guardar salida y errores');
  ctx.ejecutarLinea(e, 'ls noexiste 2>> ambos.log');
  const lineas = e.fs['/home/usuario/ambos.log'].contenido.trim().split('\n');
  assert.strictEqual(lineas.length, 2, '2>> debe añadir sin borrar');
}, 'redirecciones 2>&1, &> y 2>>');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ base:'vacio' } });
  const r = ctx.ejecutarLinea(e, 'ls noexiste 2> /dev/null');
  assert.strictEqual(r.err, '', '2> /dev/null debe descartar el error');
  assert.strictEqual(ctx.ejecutarLinea(e, 'ls > /dev/null').out, '', '> /dev/null debe descartar la salida');
  assert(!e.fs['/dev/null'], 'no debe crearse un fichero /dev/null');
}, '/dev/null');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ base:'vacio' } });
  const p = n => String(n).padStart(2, '0');
  const manana = new Date(); manana.setDate(manana.getDate() + 1);
  const esperado = manana.getFullYear() + '-' + p(manana.getMonth() + 1) + '-' + p(manana.getDate());
  assert.strictEqual(ctx.ejecutarLinea(e, 'date -d tomorrow +%F').out, esperado, 'date -d tomorrow debe sumar un día');
  assert(/^(domingo|lunes|martes|miércoles|jueves|viernes|sábado)$/.test(ctx.ejecutarLinea(e, 'date +%A').out), 'date +%A debe dar el día de la semana');
  assert(/^\d{2}$/.test(ctx.ejecutarLinea(e, 'date +%H').out), 'date +%H debe dar la hora');
  assert(/^\d{2}$/.test(ctx.ejecutarLinea(e, 'date +%M').out), 'date +%M debe dar los minutos');
}, 'date con formatos y -d');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ fs:{ '~/lista':'c 3\na 10\nb 2\n' } } });
  assert.strictEqual(ctx.ejecutarLinea(e, 'sort -k2 -n lista').out, 'b 2\nc 3\na 10', 'sort -k2 -n debe ordenar por el campo 2');
  assert.strictEqual(ctx.ejecutarLinea(e, 'sort -r -k1 lista').out, 'c 3\nb 2\na 10', 'sort -r debe invertir');
  assert.strictEqual(ctx.ejecutarLinea(e, 'sort -k2 -n -t " " lista').out.split('\n')[0], 'b 2', 'sort -t debe usar el separador');
}, 'sort por campos');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ base:'vacio', fs:{ '~/d/x':'x\n' } } });
  ctx.ejecutarLinea(e, 'touch f');
  assert.strictEqual(ctx.ejecutarLinea(e, 'chmod ug+rw f').code, 0, 'chmod debe aceptar varios sujetos');
  assert.strictEqual(ctx.ejecutarLinea(e, 'chmod go-w f').code, 0, 'chmod debe aceptar varias cláusulas');
  assert.strictEqual(ctx.ejecutarLinea(e, 'chmod u=rwx,go=rx f').code, 0, 'chmod debe aceptar listas de cláusulas');
  assert.strictEqual(e.fs['/home/usuario/f'].modo, '755', 'chmod u=rwx,go=rx debe dejar 755');
  assert.strictEqual(ctx.ejecutarLinea(e, 'chmod -R 600 d').code, 0, 'chmod -R debe funcionar');
  assert.strictEqual(e.fs['/home/usuario/d/x'].modo, '600', 'chmod -R debe bajar a los hijos');
  assert.notStrictEqual(ctx.ejecutarLinea(e, 'chmod inventado f').code, 0, 'un modo inválido debe fallar');
}, 'chmod simbólico, octal y recursivo');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ base:'vacio' } });
  assert.strictEqual(ctx.ejecutarLinea(e, 'touch -- -i').code, 0, 'touch -- debe crear un fichero que empieza por guion');
  assert(e.fs['/home/usuario/-i'], 'debe existir el fichero -i');
  assert(ctx.ejecutarLinea(e, 'ls -- -i').out.includes('-i'), 'ls -- debe listar el fichero -i');
  assert.strictEqual(ctx.ejecutarLinea(e, 'rm -- -i').code, 0, 'rm -- debe borrar el fichero -i');
  assert(!e.fs['/home/usuario/-i'], 'el fichero -i debe haber desaparecido');
}, 'fin de opciones --');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ base:'vacio', fs:{
    '~/viejo.txt':{ contenido:'viejo\n', mtime:1000 },
    '~/nuevo.txt':{ contenido:'nuevo\n', mtime:2000 }
  } } });
  ctx.ejecutarLinea(e, 'mv -u viejo.txt nuevo.txt');
  assert(e.fs['/home/usuario/viejo.txt'], 'mv -u no debe mover si el destino es más nuevo');
  assert.strictEqual(e.fs['/home/usuario/nuevo.txt'].contenido, 'nuevo\n', 'mv -u no debe pisar un fichero más nuevo');
  e.fs['/home/usuario/viejo.txt'].mtime = 3000;
  ctx.ejecutarLinea(e, 'mv -u viejo.txt nuevo.txt');
  assert(!e.fs['/home/usuario/viejo.txt'], 'mv -u debe mover si el origen es más nuevo');
  assert.strictEqual(e.fs['/home/usuario/nuevo.txt'].contenido, 'viejo\n', 'mv -u debe actualizar el destino');
}, 'mv -u');

comprobar(() => {
  const e = ctx.crearEstado({ inicio:{ base:'vacio' } });
  ctx.ejecutarLinea(e, 'umask 077');
  ctx.ejecutarLinea(e, 'touch privado.txt');
  ctx.ejecutarLinea(e, 'mkdir privada');
  assert.strictEqual(e.fs['/home/usuario/privado.txt'].modo, '600', 'umask 077 debe crear ficheros 600');
  assert.strictEqual(e.fs['/home/usuario/privada'].modo, '700', 'umask 077 debe crear carpetas 700');
}, 'umask en ficheros nuevos');

/* ---------- 9) Resultado ---------- */
if (fallos.length){
  console.error(rojo('\n✗ ' + fallos.length + ' problema(s):'));
  fallos.forEach(f => console.error(rojo('  · ') + f));
  process.exit(1);
}
console.log(verde('✓ Aventura correcta'));
console.log(gris('  ' + AVENTURA.mundos.length + ' mundos · ' + nodos + ' nodos · ' + rondas + ' rondas · ' +
  teorias + ' teorías · ' + practicas + ' prácticas · ' + tests + ' tests · ' + atajos + ' atajos'));
