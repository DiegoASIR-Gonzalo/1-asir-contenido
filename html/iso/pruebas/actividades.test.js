#!/usr/bin/env node
/* =====================================================================
   pruebas/actividades.test.js · revisa que las actividades están bien
   ---------------------------------------------------------------------
   Uso (desde la carpeta del repositorio):
       node html/iso/pruebas/actividades.test.js

   Qué comprueba, sin abrir el navegador:
     1. Que cada actividad tiene id único, título, nivel y pasos.
     2. Que cada paso tiene "meta" (o el formato antiguo "ok"/"acepta"),
        3 pistas, explicación y ejemplo.
     3. Que las claves de "meta" existen (así se cazan erratas como
        "muestras" en vez de "muestra", que se ignorarían sin avisar).
     4. Que el "ejemplo" de cada paso lo supera de verdad, en orden.
     5. Que un comando inventado NO supera el paso ni cambia el mundo.

   No necesita dependencias: solo Node. Sale con código 1 si algo falla,
   para poder usarlo en un hook o en una tarea automática.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const RAIZ = path.join(__dirname, '..');
const HTML = path.join(RAIZ, 'linux-terminal.html');
const DATOS = path.join(RAIZ, 'actividades.js');
const fuenteDatos = fs.readFileSync(DATOS, 'utf8');

const color = (n, t) => process.stdout.isTTY ? '\x1b[' + n + 'm' + t + '\x1b[0m' : t;
const rojo = t => color(31, t), verde = t => color(32, t), amarillo = t => color(33, t), gris = t => color(90, t);

/* ---------- 1) Cargar el motor del simulador y las actividades ---------- */
const html = fs.readFileSync(HTML, 'utf8');
const desde = html.indexOf('const MUNDO_HOME');
const hasta = html.indexOf('// 1) Lectura y validación');
if (desde < 0 || hasta < 0 || hasta < desde){
  console.error(rojo('No se encuentra el motor dentro de linux-terminal.html.'));
  console.error('Busca las marcas "const MUNDO_HOME" y "// 1) Lectura y validación".');
  process.exit(1);
}

// El motor solo usa el DOM para quitar el HTML de una salida; con este doble basta.
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

/* El panel de estructura debe leer el mundo real de la actividad, no una lista fija. */
const mapaPrueba = ctx.crearEstado({ inicio:{ cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/nota.txt':{ contenido:'x', modo:'600' }, '~/prueba/acceso':{ tipo:'link', destino:'~/prueba/nota.txt' }, '~/otra':'dir' } } });
const mapa = ctx.mapaHtml(mapaPrueba);
assert(mapa.includes('data-path="/home/usuario/prueba/nota.txt"'), 'el mapa no muestra el fichero creado');
assert(mapa.includes('data-path="/home/usuario/prueba/acceso"'), 'el mapa no muestra el enlace creado');
assert(mapa.includes('lrwxrwxrwx') && mapa.includes('mapa-flecha">→</span> ~/prueba/nota.txt'), 'el mapa no muestra correctamente el enlace');
assert(mapa.includes('actual'), 'el mapa no marca la carpeta actual');
const resumen = ctx.mapaResumenHtml(mapaPrueba, { meta:{ modo:{ '~/prueba/nota.txt':'600' } } });
assert(resumen.includes('Ubicación actual') && resumen.includes('Objetivo del paso'), 'el panel no muestra el contexto importante');
assert(resumen.includes('~/prueba/nota.txt'), 'el resumen no muestra la ruta del objetivo');
const estructuraEjercicio = ctx.mapaEjercicioHtml(mapaPrueba, { meta:{ modo:{ '~/prueba/nota.txt':'600' } } });
assert(estructuraEjercicio.includes('nota.txt') && estructuraEjercicio.includes('prueba/'), 'la estructura del ejercicio no muestra sus rutas');
assert(!estructuraEjercicio.includes('otra/'), 'la estructura del ejercicio muestra carpetas irrelevantes');
assert(!resumen.includes('mapa-completo'), 'el resumen no debe ofrecer el árbol completo');

// validarPaso() usa aceptado() en los pasos del formato antiguo (ok / acepta).
// En el HTML vive después del motor; aquí se replica para poder probarlos.
vm.runInContext(`
  function normalizar(t){ return String(t).trim().replace(/\\s+/g, ' '); }
  function aceptado(paso, t){
    return [].concat(paso.acepta || paso.ok || []).some(o => {
      if (!(o instanceof RegExp)) return normalizar(o) === t;
      o.lastIndex = 0;
      return o.test(t);
    });
  }
`, ctx);

vm.runInContext(fs.readFileSync(DATOS, 'utf8'), ctx);
const ACTIVIDADES = ctx.ACTIVIDADES || [];

for (const temporal of ['antiguasRafa', 'nuevas36a40', 'rebaseadas', 'fusionada55', 'reemplazarPasoRafa']){
  assert(!fuenteDatos.includes(temporal), 'actividades.js no debe conservar la capa temporal ' + temporal);
}

/* Una opción incompleta no puede superar un ejercicio solo porque coincida
   parte de la salida esperada. */
const ejercicioFind = ACTIVIDADES.find(a => a.pasos.some(p => p.ejemplo === 'find / -type d'));
assert(ejercicioFind, 'no se encuentra el ejercicio de find desde la raíz');
for (const comando of ['find / -type', 'find / -name', 'find / -user', 'find / -group', 'find / -exec']){
  const findIncompleto = ctx.validarPaso(ejercicioFind.pasos[0], ctx.crearEstado(ejercicioFind), comando);
  assert(!findIncompleto.ok, comando + ' no debe completar un ejercicio con una opción incompleta');
}
for (const comando of ['mkdir -m', 'head -n', 'tail -n', 'sort -k', 'cut -d', 'cut -f']){
  assert(ctx.ejecutarLinea(ctx.crearEstado({ inicio:{ cwd:'~', fs:{ '~/texto':{ contenido:'uno\ndos\n' } } } }), comando).code !== 0, comando + ' debe fallar si falta el argumento de su opción');
}
const ejercicioFindF = ACTIVIDADES.find(a => a.pasos.some(p => p.ejemplo === 'find /usr/bin -type f'));
const diagnosticoMeta = ctx.validarPaso(ejercicioFindF.pasos[0], ctx.crearEstado(ejercicioFindF), 'pwd');
assert(!diagnosticoMeta.ok && diagnosticoMeta.diagnostico, 'un objetivo no alcanzado debe devolver un diagnóstico útil');
const pasoAtomico = { meta:{ existe:'~/a' }, ejemplo:'mkdir a' };
const estadoAtomico = ctx.crearEstado({ inicio:{ cwd:'~' } });
const antesAtomico = JSON.stringify(estadoAtomico);
const resultadoAtomico = ctx.validarPaso(pasoAtomico, estadoAtomico, 'mkdir a; mkdir -m');
assert(!resultadoAtomico.ok && JSON.stringify(resultadoAtomico.estado) === antesAtomico, 'un fallo después de una mutación no debe cambiar el estado original');
const pasoAprendizaje = {
  meta:{ muestra:'/' }, ejemplo:'find / -type d',
  aprendizaje:{ comando:'find', opciones:['-type'], valores:['d'], pistas:['Piensa en cómo filtrar por tipo.', 'Revisa la opción que usa find para distinguir entradas.', 'Usa la forma general: find [ruta] [filtro].'] }
};
const estadoAprendizaje = ctx.crearEstado({ inicio:{ cwd:'~' } });
assert(!ctx.validarPaso(pasoAprendizaje, estadoAprendizaje, 'ls -R /').ok, 'un comando alternativo no debe superar un concepto obligatorio');
assert(ctx.validarPaso(pasoAprendizaje, estadoAprendizaje, 'find / -type d').ok, 'el comando que usa el concepto obligatorio debe superar el paso');
const pistasAprendizaje = ctx.pistasSeguras(pasoAprendizaje);
assert(!pistasAprendizaje.some(p => p.includes(pasoAprendizaje.ejemplo)), 'las pistas no deben mostrar el comando completo');
ACTIVIDADES.forEach(a => a.pasos.forEach(p => {
  const pistas = ctx.pistasSeguras(p);
  assert(pistas.length >= 3, 'cada paso debe ofrecer tres orientaciones útiles en ' + a.id);
  assert(pistas.every(pista => pista.trim() !== (p.ejemplo || '').trim()), 'una pista no debe mostrar el ejemplo completo en ' + a.id);
}));
assert(!html.includes('pulsa «Ver solución»'), 'el flujo de fallos no debe dirigir a la solución completa');
const paso42 = { meta:{ modo:{ '~/prueba/dir2':'555' } }, ejemplo:'chmod a-w prueba/dir2' };
const estado42 = ctx.crearEstado({ inicio:{ cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'755' } } } });
const numerico42 = ctx.validarPaso(paso42, estado42, 'chmod 555 prueba/dir2');
assert(!numerico42.ok && /simbólica/i.test(numerico42.diagnostico), 'el ejercicio 42 debe explicar que pide notación simbólica');
const pistas42 = ctx.pistasSeguras(paso42);
assert(pistas42.some(pista => /simbólica|chmod/i.test(pista)), 'el ejercicio 42 debe dar una pista específica');
assert(ctx.validarPaso(paso42, estado42, 'chmod a-w prueba/dir2').ok, 'la forma simbólica correcta debe superar el ejercicio 42');
const paso83 = ACTIVIDADES.find(a => a.id === 'rafa-83').pasos[0];
assert(!ctx.pistasSeguras(paso83).some(pista => /notación simbólica/i.test(pista)), 'el ejercicio 83 no debe recibir una pista de chmod');
assert(html.includes("fallosPaso < 3"), 'la solución debe reservarse para quien se atasca');
assert(html.includes('no se escribe automáticamente'), 'la solución debe explicar sin rellenar la terminal');
assert(!html.includes('entradaAct.value = ej;'), 'la solución no debe escribir el comando automáticamente');

/* ---------- 2) Utilidades de impresión ---------- */
let errores = 0, avisos = 0, pasosTotal = 0;
const error = (donde, texto) => { errores++; console.log('   ' + rojo('✗') + ' ' + donde + ': ' + texto); };
const aviso = (donde, texto) => { avisos++; console.log('   ' + amarillo('!') + ' ' + donde + ': ' + texto); };

const CLAVES_META = new Set(['cwd', 'existe', 'noExiste', 'contenido', 'modo', 'enlace', 'funcion', 'muestra', 'noMuestra', 'orden', 'salida', 'umask']);
const NOMBRE_META = { cwd:'cwd', existe:'existe', noExiste:'noExiste', contenido:'contenido', modo:'modo', enlace:'enlace',
  funcion:'funcion', muestra:'muestra', noMuestra:'noMuestra', orden:'orden', salida:'salida', umask:'umask' };

/* ---------- 3) Revisión ---------- */
console.log('\n' + color(1, 'Actividades') + gris(' · ' + ACTIVIDADES.length + ' cargadas\n'));

if (!ACTIVIDADES.length){
  console.log(rojo('No hay actividades. ¿Está bien el archivo actividades.js?'));
  process.exit(1);
}

const ids = new Map();
ACTIVIDADES.forEach((a, n) => {
  const nombre = a && a.titulo ? a.titulo : 'actividad ' + (n + 1);
  const donde = '«' + nombre + '»';
  if (!a || typeof a !== 'object') return error('actividad ' + (n + 1), 'no es un objeto');
  if (!a.id || typeof a.id !== 'string') error(donde, 'falta el id');
  else if (ids.has(a.id)) error(donde, 'el id «' + a.id + '» está repetido (también en «' + ids.get(a.id) + '»)');
  else if (/\s/.test(a.id)) aviso(donde, 'el id «' + a.id + '» tiene espacios; mejor sin ellos');
  else ids.set(a.id, nombre);

  if (!a.titulo) error(donde, 'falta el título');
  if (!a.grupo) aviso(donde, 'no tiene "grupo": saldrá en «General»');
  if (![1, 2, 3].includes(a.nivel)) aviso(donde, 'el nivel debería ser 1, 2 o 3');
  if (!Array.isArray(a.pasos) || !a.pasos.length) return error(donde, 'no tiene pasos');

  console.log('  ' + (a.nivel || '?') + '  ' + nombre + gris(' (' + a.pasos.length + (a.pasos.length === 1 ? ' paso)' : ' pasos)')));

  let estado;
  try { estado = ctx.crearEstado(a); }
  catch (e) { return error(donde, 'no se puede crear su mundo virtual: ' + e.message); }

  a.pasos.forEach((p, i) => {
    pasosTotal++;
    const d = 'paso ' + (i + 1);
    if (!p || typeof p !== 'object') return error(donde + ', ' + d, 'no es un objeto');
    if (!p.tarea) error(donde + ', ' + d, 'falta la tarea');
    if (!p.meta && !p.ok && !p.acepta) return error(donde + ', ' + d, 'no tiene "meta", "ok" ni "acepta"');
    if (!p.ejemplo) error(donde + ', ' + d, 'falta el "ejemplo"');
    if (!p.explica) aviso(donde + ', ' + d, 'no tiene "explica" (la tarea no se explicará al superarla)');
    if (!Array.isArray(p.pista) || !p.pista.length) error(donde + ', ' + d, 'no tiene pistas');
    else if (p.pista.length < 3) aviso(donde + ', ' + d, 'tiene ' + p.pista.length + ' pista(s); lo recomendable son 3');

    if (p.meta){
      if (typeof p.meta !== 'object' || Array.isArray(p.meta)) return error(donde + ', ' + d, '"meta" debe ser un objeto');
      const claves = Object.keys(p.meta);
      if (!claves.length) error(donde + ', ' + d, '"meta" está vacío: cualquier comando lo superaría');
      claves.filter(k => !CLAVES_META.has(k)).forEach(k =>
        error(donde + ', ' + d, 'la clave "' + k + '" de "meta" no existe (¿querías "' + (NOMBRE_META[k.replace(/s$/, '')] || '?') + '"?)'));
    }

    if (!p.ejemplo) return;
    const antes = JSON.stringify(estado);
    let r;
    try { r = ctx.validarPaso(p, estado, p.ejemplo); }
    catch (e) { return error(donde + ', ' + d, 'el ejemplo «' + p.ejemplo + '» lanza un error: ' + e.message); }
    if (!r.ok){
      error(donde + ', ' + d, 'el ejemplo «' + p.ejemplo + '» no supera el paso: ' + (r.error || 'sin motivo'));
      return;
    }
    const despues = JSON.stringify(r.estado);
    estado = r.estado;

    // Un comando que no existe no puede dar el paso por bueno ni tocar el mundo.
    let mal;
    try { mal = ctx.validarPaso(p, estado, 'comandoInventado --x'); }
    catch (e) { return error(donde + ', ' + d, 'un comando inventado lanza un error: ' + e.message); }
    if (mal.ok) error(donde + ', ' + d, 'acepta un comando inventado: el objetivo es demasiado blando');
    if (JSON.stringify(mal.estado) !== despues) error(donde + ', ' + d, 'un fallo modifica el mundo virtual (el paso no es atómico)');

    if (despues === antes) console.log('     ' + gris('· ' + d + ' solo consulta (no cambia el mundo)'));
  });
});

/* ---------- 4) Resumen ---------- */
console.log('');
if (errores) console.log(rojo('✗ ' + errores + ' error(es)') + gris(' · ' + pasosTotal + ' pasos revisados') + (avisos ? ' · ' + amarillo(avisos + ' aviso(s)') : ''));
else console.log(verde('✓ ' + ACTIVIDADES.length + ' actividades, ' + pasosTotal + ' pasos, 0 errores') + (avisos ? ' · ' + amarillo(avisos + ' aviso(s)') : ''));
console.log('');

process.exit(errores ? 1 : 0);
