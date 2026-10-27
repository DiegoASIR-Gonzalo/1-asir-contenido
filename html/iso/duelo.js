/* =====================================================================
   DUELO · multijugador (pestaña "Duelo" junto a "Actividades")
   ---------------------------------------------------------------------
   Se carga DESPUÉS del script principal del HTML (reutiliza sus funciones y estilos:
   $, prompt, escapar, normalizar, unir, aceptado, ORDEN_ACT y las clases .act-*, .terminal, .enunciado…).

   Modos:
     · "web"      (1vs1)    : se eligen N actividades al azar de actividades.js (5-12); gana quien las termina antes.
     · "anonimo"  (1vs1vs1) : el anfitrión NO juega: escribe hasta 10 preguntas (enunciado + comandos correctos,
                              cada uno con las respuestas alternativas válidas que quiera) y los otros dos compiten. Las soluciones se guardan como huella (hash),
                              no en claro, para que no se lean mirando la base de datos.

   Datos en Firebase Realtime Database:  salas/<CÓDIGO> = { modo, anfitrion, estado, ids | preguntas, sem, inicio,
                                           ganador, jugadores:{ uid:{nombre, rol, prog, fin} } }
   estado: "espera" (sala web) · "redactando" (sala anónima) · "jugando".
   ===================================================================== */
(() => {
'use strict';

/* ---- 1) PEGA AQUÍ TU CONFIGURACIÓN (Firebase › Configuración del proyecto › Tus apps › Web) ---- */
const FIREBASE_CONFIG = { apiKey:'AIzaSyCrXCFetCv1lcIh0-x0u0VDW13v8ggFrVs', authDomain:'asir-pruebas.firebaseapp.com', databaseURL:'https://asir-pruebas-default-rtdb.europe-west1.firebasedatabase.app', projectId:'asir-pruebas', appId:'1:925637498896:web:9bd353e2c034ad2ac81295' };
const MIN_SEC = 5, MAX_SEC = 12, MAX_PREGUNTAS = 10, CUENTA_ATRAS_MS = 4000;
const MODOS = { web:'Preguntas de la web (1vs1)', anonimo:'Preguntas anónimas (1vs1vs1)' };

/* ---- 2) Estilos propios (lo demás reutiliza los del HTML) ---- */
document.head.append(Object.assign(document.createElement('style'), { textContent: `
.d-cuerpo{flex:1;overflow:auto;padding:0 16px 16px}
.d-cuerpo input,.d-cuerpo select{width:100%;font:inherit;font-size:13px;color:#fff;background:#2e2c33;border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:6px 10px;margin-top:8px}
.d-btn{display:block;width:100%;margin-top:8px;text-align:left;font:inherit;font-weight:700;color:#fff;background:#4a4752;border:0;border-radius:8px;padding:8px 12px;cursor:pointer;transition:background .2s ease}
.d-btn:hover:not(:disabled),.d-btn.sel{background:var(--acento)}.d-btn:disabled{opacity:.4;cursor:default}
.d-cod{font:700 30px "Ubuntu Mono",monospace;letter-spacing:.25em;text-align:center;background:#2e2c33;border-radius:10px;padding:8px;margin-top:10px}
.d-jug{display:flex;justify-content:space-between;gap:8px;margin-top:6px;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.06);font-size:13px}
.d-jug small{color:#c0bfbc}
.d-barra{height:6px;margin:3px 0 8px;border-radius:3px;background:rgba(0,0,0,.15);overflow:hidden}
.d-barra i{display:block;height:100%;background:var(--acento);transition:width .3s ease}
.d-q{margin-bottom:8px;padding:8px;border:1px solid rgba(0,0,0,.15);border-radius:8px}
.d-q textarea{display:block;width:100%;margin-top:4px;padding:4px 8px;font:14px "Ubuntu Mono",monospace;border:1px solid rgba(0,0,0,.2);border-radius:6px}
.d-q button,.d-fin button{font:inherit;font-weight:700;padding:4px 10px;border-radius:6px;border:1px solid rgba(0,0,0,.2);background:#e1dedb;cursor:pointer}
.d-fin button{background:var(--acento);color:#fff;border:0}
.d-lanzar{margin-left:8px;background:var(--acento)!important;color:#fff;border:0!important}.d-lanzar:disabled{opacity:.4}
.act-term[hidden]{display:none}.enunciado.d-full{max-height:none;flex:1}
.d-q input{display:block;width:100%;margin-top:4px;padding:4px 8px;font:14px "Ubuntu Mono",monospace;border:1px solid rgba(0,0,0,.2);border-radius:6px}
.d-paso{margin-top:8px;padding-left:10px;border-left:3px solid var(--acento)}.d-paso small{font-weight:700}
.d-paso button,.d-addp,.d-del{margin-top:4px}
.d-conf{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(0,0,0,.55)}
.d-conf-c{width:min(380px,calc(100% - 24px));background:var(--ventana);color:#fff;border-radius:12px;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,.55)}
.d-conf-c h3{font-size:17px;margin-bottom:6px}.d-conf-c p{margin-bottom:14px;color:#c0bfbc}
.d-conf-c div{display:flex;justify-content:flex-end;gap:8px}
.d-conf-c button{font:inherit;font-weight:700;color:#fff;background:#4a4752;border:0;border-radius:8px;padding:7px 14px;cursor:pointer}
.d-conf-c .d-si{background:#c01c28}.d-conf-c button:hover{filter:brightness(1.15)}
` }));

/* ---- 3) Utilidades ---- */
const E = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
// Huella de 53 bits (cyrb53): síncrona y igual en todos los navegadores. "sem" es una sal distinta en cada duelo.
const huella = (s, sem) => { let a = 0xdeadbeef, b = 0x41c6ce57; for (let i = 0, c; i < s.length + sem.length; i++){ c = (s + sem).charCodeAt(i); a = Math.imul(a ^ c, 2654435761); b = Math.imul(b ^ c, 1597334677); }
  a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909); b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
  return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36); };

/* ---- 4) Estado ---- */
let db, uid = null, off = 0, nombre = '', modoSel = '', nSec = 8, codigo = null, ref = null, sala = null,
    secs = null, S = null, qs = [], editorListo = false, aviso = '';
try { nombre = localStorage.getItem('duelo-nombre') || ''; } catch (e) {}

/* ---- 5) Pestaña, panel lateral y ventana (se crean aquí para no tocar el HTML) ---- */
const caja = E('div'); caja.style.cssText = 'display:flex;gap:4px';
btnAct.replaceWith(caja);
const btn = E('button', 'barra-btn', 'Duelo'); btn.type = 'button'; btn.setAttribute('aria-expanded', 'false');
caja.append(btnAct, btn);

const panelD = E('aside', 'act-panel', '<div class="act-cab"><h2>Duelo</h2><p>Compite en tiempo real con otras personas.</p></div><div class="d-cuerpo"></div>');
const cuerpo = panelD.lastChild; panelD.setAttribute('aria-label', 'Duelo');
const fondo = E('div', 'act-fondo', '<div class="act-velo"></div><section class="act-ventana" role="dialog" aria-label="Duelo"><div class="act-int">' +
  '<div class="titulo" id="d-barra" tabindex="0" role="group" aria-label="Barra de título. Flechas: mover la ventana. Mayús + flechas: cambiar su tamaño"><span id="d-tit"></span><button class="act-max" id="d-max" type="button" aria-label="Maximizar ventana">□</button><button class="act-cerrar" id="d-x" type="button" aria-label="Salir del duelo">✕</button></div>' +
  '<div class="act-cuerpo"><article class="enunciado" id="d-enun"></article><div class="terminal act-term" id="d-term"><div class="pantalla" id="d-pant">' +
  '<span id="d-hist"></span><div class="entrada"><span id="d-prompt"></span><input id="d-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Escribe un comando"></div></div>' +
  '<div class="pie"><button id="d-salir" type="button">Salir del duelo</button><span class="contador" id="d-cont"></span></div></div></div></div></section>');
fondo.hidden = true;
document.body.append(panelD, fondo);
const vent = fondo.querySelector('.act-ventana'), enun = $('d-enun'), term = $('d-term'), inp = $('d-in');

const alternarD = abierto => { panelD.classList.toggle('abierto', abierto); btn.setAttribute('aria-expanded', abierto); if (abierto){ alternarAct(false); iniciar(); vistaPanel(); } };
btn.onclick = () => alternarD(!panelD.classList.contains('abierto'));
btnAct.addEventListener('click', () => alternarD(false));
// Clic fuera = cerrar. Se usa composedPath() porque vistaPanel() redibuja el panel al pulsar un botón: el botón ya no está
// en el DOM cuando el clic llega aquí y contains() diría que se pulsó fuera.
addEventListener('click', e => { const ruta = e.composedPath(); if (panelD.classList.contains('abierto') && !ruta.includes(panelD) && !ruta.includes(caja)) alternarD(false); });
/* Mover: arrastrar la barra de título (o flechas). Redimensionar: bordes y esquinas (o Mayús + flechas).
   Doble clic en la barra o botón □: maximizar. Es la misma lógica que la ventana de Actividades. */
const barra = $('d-barra'), TOPE = 30, MIN_W = 420, MIN_H = 320;
let geo = null, maxim = false, gesto = null;
const minimos = () => ({ w: Math.min(MIN_W, innerWidth - 12), h: Math.min(MIN_H, innerHeight - TOPE) });
const geometriaInicial = () => { const w = Math.min(900, innerWidth - 12), h = Math.min(680, innerHeight - TOPE - 12);
  return { x: Math.round((innerWidth - w) / 2), y: TOPE + Math.max(6, Math.round((innerHeight - TOPE - h) / 2)), w, h }; };
function limitar(){
  const m = minimos();
  geo.w = Math.max(m.w, Math.min(geo.w, innerWidth)); geo.h = Math.max(m.h, Math.min(geo.h, innerHeight - TOPE));
  geo.x = Math.max(80 - geo.w, Math.min(geo.x, innerWidth - 80)); geo.y = Math.max(TOPE, Math.min(geo.y, innerHeight - 42));
}
function colocar(){
  if (!geo) geo = geometriaInicial();
  if (!maxim) limitar();
  const r = maxim ? { x: 0, y: TOPE, w: innerWidth, h: innerHeight - TOPE } : geo;
  Object.assign(vent.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  vent.classList.toggle('maximizada', maxim);
  $('d-max').textContent = maxim ? '❐' : '□'; $('d-max').setAttribute('aria-label', maxim ? 'Restaurar ventana' : 'Maximizar ventana');
}
const alternarMax = () => { maxim = !maxim; colocar(); };
['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(d => { const h = E('span', 'res ' + d); h.dataset.d = d; vent.append(h); });
vent.addEventListener('pointerdown', e => {
  if (e.button !== 0 || maxim) return;
  const tirador = e.target.closest('.res'), enBarra = barra.contains(e.target) && !e.target.closest('button');
  if (!tirador && !enBarra) return;
  gesto = { tipo: tirador ? tirador.dataset.d : 'mover', px: e.clientX, py: e.clientY, o: { ...geo } };
  (tirador || barra).setPointerCapture(e.pointerId);
});
vent.addEventListener('pointermove', e => {
  if (!gesto) return;
  const dx = e.clientX - gesto.px, dy = e.clientY - gesto.py, o = gesto.o, t = gesto.tipo, m = minimos();
  if (t === 'mover'){ geo.x = o.x + dx; geo.y = o.y + dy; }
  else {
    if (t.includes('e')) geo.w = Math.max(m.w, Math.min(o.w + dx, innerWidth - o.x));
    if (t.includes('s')) geo.h = Math.max(m.h, Math.min(o.h + dy, innerHeight - o.y));
    if (t.includes('w')){ const x = Math.max(0, Math.min(o.x + dx, o.x + o.w - m.w)); geo.w = o.x + o.w - x; geo.x = x; }
    if (t.includes('n')){ const y = Math.max(TOPE, Math.min(o.y + dy, o.y + o.h - m.h)); geo.h = o.y + o.h - y; geo.y = y; }
  }
  colocar();
});
['pointerup', 'pointercancel'].forEach(ev => vent.addEventListener(ev, () => { gesto = null; }));
barra.addEventListener('dblclick', e => { if (!e.target.closest('button')) alternarMax(); });
$('d-max').onclick = alternarMax;
barra.addEventListener('keydown', e => {
  if (e.target !== barra || maxim) return;
  const d = 24, v = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
  if (!v) return;
  e.preventDefault();
  if (e.shiftKey){ geo.w += v[0]; geo.h += v[1]; } else { geo.x += v[0]; geo.y += v[1]; }
  colocar();
});
addEventListener('resize', () => { if (!fondo.hidden) colocar(); });
const abrirVentana = () => { fondo.hidden = false; colocar(); void fondo.offsetWidth; fondo.classList.add('visible'); };   // conserva donde la dejó la persona

/* ---- 6) Firebase ---- */
function iniciar(){
  if (db || !FIREBASE_CONFIG.apiKey) return;
  if (!window.firebase){ aviso = 'No se cargó el SDK de Firebase (revisa los <script> del HTML).'; return; }
  try {
    firebase.initializeApp(FIREBASE_CONFIG); db = firebase.database();
    db.ref('.info/serverTimeOffset').on('value', s => off = s.val() || 0);
    firebase.auth().signInAnonymously().then(u => { uid = u.user.uid; vistaPanel(); })
      .catch(e => { aviso = 'No se pudo iniciar sesión (' + e.code + '). Con file:// no funciona: sirve la carpeta por http.'; vistaPanel(); });
  } catch (e) { aviso = 'Error de Firebase: ' + e.message; }
}

async function crear(modo){
  if (!nombre) return avisar('Escribe tu nombre.');
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (let k = 0; k < 8; k++){
    const c = Array.from({ length: 4 }, () => L[Math.random() * L.length | 0]).join('');
    const base = { modo, anfitrion: uid, estado: modo === 'web' ? 'espera' : 'redactando', jugadores: { [uid]: { nombre, rol: modo === 'web' ? 'jugador' : 'creador', prog: 0 } } };
    if (modo === 'web') base.ids = ORDEN_ACT.map(a => a.id).sort(() => Math.random() - .5).slice(0, nSec);   // N actividades al azar
    const r = await db.ref('salas/' + c).transaction(x => x === null ? base : undefined);
    if (r.committed) return entrar(c);
  }
}
async function unirse(c){
  c = c.trim().toUpperCase();
  if (!nombre) return avisar('Escribe tu nombre.');
  const v = (await db.ref('salas/' + c).get()).val();
  if (!v) return avisar('Esa sala no existe.');
  const yaEsta = v.jugadores && v.jugadores[uid], jugadores = Object.values(v.jugadores || {}).filter(j => j.rol === 'jugador').length;
  if (!yaEsta && (v.estado === 'jugando' || jugadores >= 2)) return avisar('La sala está llena o ya ha empezado.');
  await db.ref('salas/' + c + '/jugadores/' + uid).set({ nombre, rol: 'jugador', prog: 0 });
  entrar(c);
}
function entrar(c){
  codigo = c; ref = db.ref('salas/' + c); aviso = '';
  ref.on('value', s => { sala = s.val(); if (!sala) return salirLocal(); vistaPanel(); if (sala.jugadores[uid]) onSala(); });
}
function salir(){
  if (!ref) return;
  const r = ref, soyAnfitrion = sala && sala.anfitrion === uid;
  r.off(); if (soyAnfitrion) r.remove(); else r.child('jugadores/' + uid).remove();   // si se va el anfitrión, la sala se borra
  salirLocal();
}
function salirLocal(){ if (ref) ref.off(); ref = sala = secs = S = null; codigo = null; qs = []; editorListo = false; fondo.classList.remove('visible'); fondo.hidden = true; vistaPanel(); }
// Confirmación antes de abandonar (por si se pulsa sin querer). Si la partida ya terminó, se sale directamente.
function pedirSalir(){
  if (!sala || sala.ganador) return salir();
  if (document.querySelector('.d-conf')) return;
  const d = E('div', 'd-conf', '<div class="d-conf-c" role="alertdialog" aria-modal="true" aria-labelledby="d-conf-t"><h3 id="d-conf-t">¿Abandonar el duelo?</h3><p></p><div><button type="button" class="d-no">Seguir en el duelo</button><button type="button" class="d-si">Abandonar</button></div></div>');
  d.querySelector('p').textContent = sala.anfitrion === uid ? 'Eres el anfitrión: si sales, la sala se cerrará para todos los jugadores.'
    : sala.estado === 'jugando' ? 'Si abandonas perderás tu progreso y no podrás volver a entrar en esta partida.' : 'Saldrás de la sala.';
  const cerrar = () => { d.remove(); removeEventListener('keydown', tecla, true); },
        tecla = e => { if (e.key === 'Escape'){ e.stopPropagation(); cerrar(); } };
  d.querySelector('.d-no').onclick = cerrar;
  d.querySelector('.d-si').onclick = () => { cerrar(); salir(); };
  addEventListener('keydown', tecla, true);
  document.body.append(d); d.querySelector('.d-no').focus();   // el foco va a "Seguir": un Enter accidental no abandona
}
// Cerrar o recargar la página en plena partida también avisa
addEventListener('beforeunload', e => { if (sala && sala.estado === 'jugando' && !sala.ganador){ e.preventDefault(); e.returnValue = ''; } });
const avisar = t => { aviso = t; vistaPanel(); };

/* ---- 7) Panel lateral ---- */
const boton = (t, fn, off, sel) => { const b = E('button', 'd-btn' + (sel ? ' sel' : ''), t); b.type = 'button'; b.disabled = !!off; b.onclick = fn; return b; };
function vistaPanel(){
  cuerpo.innerHTML = ''; const add = (...n) => cuerpo.append(...n);
  if (!FIREBASE_CONFIG.apiKey) return add(E('p', 'act-vacio', 'Falta configurar Firebase: pega tu configuración en <b>FIREBASE_CONFIG</b> al principio de duelo.js.'));
  if (!uid) return add(E('p', 'act-vacio', escapar(aviso || 'Conectando…')));
  if (!sala){
    const n = E('input'); n.placeholder = 'Tu nombre en el duelo'; n.maxLength = 16; n.value = nombre;
    n.oninput = () => { nombre = n.value.trim(); try { localStorage.setItem('duelo-nombre', nombre); } catch (e) {} };
    add(n);
    for (const m in MODOS) add(boton(MODOS[m], () => { modoSel = m; vistaPanel(); }, false, modoSel === m));
    if (modoSel === 'web'){
      const s = E('select'); for (let i = MIN_SEC; i <= MAX_SEC; i++) s.append(new Option(i + ' secuencias', i, false, i === nSec));
      s.onchange = () => nSec = +s.value; add(s);
    }
    if (modoSel) add(boton('＋ Crear sala' + (modoSel === 'anonimo' ? ' (yo escribo las preguntas)' : ''), () => crear(modoSel)));
    const c = E('input'); c.placeholder = 'Código de sala (4 letras)'; c.maxLength = 4; c.style.textTransform = 'uppercase';
    add(c, boton('→ Unirme a una sala', () => unirse(c.value)));
    if (aviso) add(E('p', 'act-vacio', escapar(aviso)));
    return;
  }
  add(E('div', 'd-cod', codigo), E('p', 'act-vacio', MODOS[sala.modo] + ' · comparte el código con los otros jugadores.'));
  Object.values(sala.jugadores || {}).forEach(j => add(E('div', 'd-jug', '<span>' + escapar(j.nombre) + '</span><small>' + (j.rol === 'creador' ? 'creador de preguntas' : 'jugador') + '</small>')));
  const nJug = Object.values(sala.jugadores || {}).filter(j => j.rol === 'jugador').length;
  if (sala.modo === 'web' && sala.estado === 'espera' && sala.anfitrion === uid) add(boton('▶ Empezar duelo', () => ref.update({ estado: 'jugando', inicio: Date.now() + off + CUENTA_ATRAS_MS }), nJug < 2));
  if (sala.modo === 'web' && sala.estado === 'espera' && sala.anfitrion !== uid) add(E('p', 'act-vacio', 'Esperando a que el anfitrión empiece…'));
  if (sala.estado !== 'espera' && fondo.hidden) add(boton('Volver al duelo', abrirVentana));
  add(boton('Salir de la sala', pedirSalir));
}

/* ---- 8) Secuencias a resolver (mismo formato para los dos modos) ---- */
function secuencias(){
  if (sala.modo === 'web') return (sala.ids || []).map(id => ORDEN_ACT.find(a => a.id === id)).filter(Boolean).map(a => ({
    titulo: a.titulo, enun: unir(a.enunciado),
    pasos: a.pasos.map(p => ({ tarea: p.tarea, ok: t => aceptado(p, t), out: p.out, ruta: p.ruta })) }));
  return (sala.preguntas || []).map((q, i) => ({ titulo: 'Pregunta anónima ' + (i + 1), enun: '<p>' + escapar(q.enun).replace(/\n/g, '<br>') + '</p>',
    pasos: Object.values(q.h).map((hs, j, todos) => ({ tarea: 'Comando ' + (j + 1) + ' de ' + todos.length, ok: t => Object.values(hs).includes(huella(t, sala.sem)) })) }));
}

/* ---- 9) Ventana del duelo ---- */
function onSala(){ if (sala.estado !== 'espera' && fondo.hidden) abrirVentana(); if (!fondo.hidden) pintar(); }

function editor(){   // formulario del creador (se construye una sola vez para no borrar lo escrito)
  enun.innerHTML = '<h3>Escribe tus preguntas (máx. ' + MAX_PREGUNTAS + ')</h3><p>Cada pregunta lleva un enunciado y uno o varios comandos. En cada comando puedes añadir <b>otras respuestas válidas</b> (p. ej. <code>ls -l</code> y <code>ls -la</code>). Los jugadores no verán tus respuestas.</p><div id="d-qs"></div>' +
    '<button type="button" id="d-mas">＋ Añadir pregunta</button><button type="button" class="d-lanzar" id="d-lanzar">▶ Lanzar duelo</button> <small id="d-est"></small>';
  const lista = $('d-qs');
  const numerar = () => qs.forEach((q, i) => q.d.querySelector('b').textContent = 'Pregunta ' + (i + 1));
  const nuevoPaso = q => {   // un comando = una lista de respuestas válidas (inputs)
    const p = E('div', 'd-paso', '<small></small><div></div><button type="button">＋ Otra respuesta válida</button>'), alts = [];
    const alt = () => { const i = E('input'); i.placeholder = alts.length ? 'Respuesta alternativa' : 'Comando correcto'; i.spellcheck = false; alts.push(i); p.children[1].append(i); return i; };
    p.children[0].textContent = 'Comando ' + (q.pasos.length + 1);
    p.lastChild.onclick = () => alt().focus();
    alt(); q.pasos.push(alts); q.d.querySelector('.d-pasos').append(p);
  };
  const nueva = () => { if (qs.length >= MAX_PREGUNTAS) return;
    const d = E('div', 'd-q', '<b></b> <button type="button" class="d-del">✕ Quitar pregunta</button><textarea rows="2" placeholder="Enunciado: p. ej. Crea la carpeta datos y entra en ella"></textarea><div class="d-pasos"></div><button type="button" class="d-addp">＋ Añadir comando</button>');
    const q = { d, e: d.querySelector('textarea'), pasos: [] };
    d.querySelector('.d-addp').onclick = () => { nuevoPaso(q); estado(); };
    d.querySelector('.d-del').onclick = () => { qs.splice(qs.indexOf(q), 1); d.remove(); if (!qs.length) nueva(); numerar(); estado(); };
    nuevoPaso(q); qs.push(q); lista.append(d); numerar(); estado(); };
  $('d-mas').onclick = nueva;
  $('d-lanzar').onclick = () => {   // las respuestas se guardan como huellas; las vacías se ignoran
    const sem = Math.random().toString(36).slice(2, 8);
    const preguntas = qs.map(q => ({ enun: q.e.value.trim(),
      h: q.pasos.map(alts => alts.map(i => normalizar(i.value)).filter(Boolean).map(x => huella(x, sem))).filter(a => a.length) })).filter(q => q.enun && q.h.length);
    if (preguntas.length) ref.update({ preguntas, sem, estado: 'jugando', inicio: Date.now() + off + CUENTA_ATRAS_MS });
  };
  enun.oninput = estado; nueva(); editorListo = true;
}
function estado(){   // habilita "Lanzar" solo con 2 jugadores y al menos una pregunta completa
  if (!$('d-lanzar') || !sala) return;
  const jug = Object.values(sala.jugadores || {}).filter(j => j.rol === 'jugador').length;
  const ok = qs.some(q => q.e.value.trim() && q.pasos.some(a => a.some(i => i.value.trim())));
  $('d-lanzar').disabled = jug < 2 || !ok; $('d-mas').disabled = qs.length >= MAX_PREGUNTAS;
  $('d-est').textContent = jug + '/2 jugadores conectados' + (ok ? '' : ' · falta al menos una pregunta completa');
}

function pintar(){
  const yo = sala.jugadores[uid], creador = yo.rol === 'creador', jugando = sala.estado === 'jugando';
  $('d-tit').textContent = 'Duelo · ' + MODOS[sala.modo] + ' · sala ' + codigo;
  const nada = html => { enun.classList.add('d-full'); term.hidden = true; enun.innerHTML = html; };
  if (!jugando){
    if (creador){ enun.classList.add('d-full'); term.hidden = true; if (!editorListo) editor(); estado(); }
    else nada('<h3>Preguntas anónimas</h3><p>Un jugador está escribiendo las preguntas… ¡prepárate!</p>');
    return;
  }
  if (!secs) secs = secuencias();
  const total = secs.reduce((a, s) => a + s.pasos.length, 0);
  const barras = Object.values(sala.jugadores).filter(j => j.rol === 'jugador').map(j => '<div><b>' + escapar(j.nombre) + (j === yo ? ' (tú)' : '') + '</b> <small>' + (j.prog || 0) + ' / ' + total + '</small>' +
    '<div class="d-barra"><i style="width:' + (total ? 100 * (j.prog || 0) / total : 0) + '%"></i></div></div>').join('');
  if (sala.ganador){
    const g = sala.jugadores[sala.ganador], t = g && g.fin ? ((g.fin - sala.inicio) / 1000).toFixed(1) + ' s' : '';
    return nada('<div class="d-fin"><h3>🏆 ' + (sala.ganador === uid ? '¡Has ganado!' : 'Gana ' + escapar(g ? g.nombre : 'tu rival')) + '</h3><p>Tiempo del ganador: ' + t + '</p>' + barras + '<button type="button" onclick="this.closest(\'.act-fondo\').querySelector(\'#d-salir\').click()">Salir del duelo</button></div>');
  }
  const falta = sala.inicio - (Date.now() + off);
  if (falta > 0){ setTimeout(() => { if (sala && !fondo.hidden) pintar(); }, 200); return nada('<h3>¡Prepárate!</h3><p>Empieza en ' + Math.ceil(falta / 1000) + '…</p>' + barras); }
  if (creador) return nada('<h3>Estás observando el duelo</h3>' + barras);
  if (!S){ S = { q: 0, p: 0, hecho: 0, ruta: '~', hist: '<span class="c"># Escribe el comando y pulsa Enter. ¡El primero en terminar gana!</span>\n' }; }
  if (S.q >= secs.length) return nada('<h3>¡Has terminado!</h3><p>Comprobando el resultado…</p>' + barras);
  const q = secs[S.q]; enun.classList.remove('d-full'); term.hidden = false;
  enun.innerHTML = barras + '<h3>Secuencia ' + (S.q + 1) + ' / ' + secs.length + ' · ' + escapar(q.titulo) + '</h3>' + q.enun +
    '<ol class="tareas">' + q.pasos.map((p, i) => '<li class="' + (i < S.p ? 'hecha' : i === S.p ? 'actual' : '') + '">' + p.tarea + '</li>').join('') + '</ol>';
  $('d-hist').innerHTML = S.hist; $('d-prompt').innerHTML = prompt(S.ruta);
  $('d-cont').textContent = 'Comando ' + (S.hecho + 1) + ' / ' + total; $('d-pant').scrollTop = $('d-pant').scrollHeight;
  if (document.activeElement !== inp) inp.focus();
}

function enviar(){
  if (!S || S.q >= secs.length || sala.ganador) return;
  const crudo = inp.value, t = normalizar(crudo), paso = secs[S.q].pasos[S.p]; inp.value = '';
  S.hist += prompt(S.ruta) + escapar(crudo) + '\n';
  if (t === 'clear') S.hist = '';
  else if (t){
    if (paso.ok(t)){
      if (paso.out) S.hist += paso.out + '\n';
      if (paso.ruta) S.ruta = paso.ruta;
      S.hecho++; S.p++;
      if (S.p >= secs[S.q].pasos.length){ S.q++; S.p = 0; S.ruta = '~'; S.hist = ''; }   // siguiente secuencia: terminal limpia
      ref.child('jugadores/' + uid + '/prog').set(S.hecho);
      if (S.q >= secs.length){   // ¡terminó! El primero en escribir "ganador" gana (transacción)
        ref.child('jugadores/' + uid + '/fin').set(firebase.database.ServerValue.TIMESTAMP);
        ref.child('ganador').transaction(g => g || uid);
      }
    } else S.hist += 'bash: ' + escapar(t.split(' ')[0]) + ': orden no encontrada\n';
  }
  pintar();
}
inp.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); enviar(); } };
$('d-pant').onclick = () => { if (!getSelection().toString()) inp.focus(); };
$('d-salir').onclick = $('d-x').onclick = pedirSalir;
})();
