/* Arena Linux: salas públicas de Carrera y Práctica compartida. */
(() => {
  'use strict';

  const CONFIG = { apiKey:'AIzaSyCrXCFetCv1lcIh0-x0u0VDW13v8ggFrVs', authDomain:'asir-pruebas.firebaseapp.com', databaseURL:'https://asir-pruebas-default-rtdb.europe-west1.firebasedatabase.app', projectId:'asir-pruebas', appId:'1:925637498896:web:9bd353e2c034ad2ac81295' };
  const MODOS = window.DUELO_CORE.MODOS, MIN_EJ = 5, MAX_EJ = 20, MAX_JUGADORES = 30, CUENTA_ATRAS = 4000;
  const E = (tag, clase, html) => { const e = document.createElement(tag); if (clase) e.className = clase; if (html != null) e.innerHTML = html; return e; };
  const boton = (texto, fn, disabled) => { const b = E('button', 'd-btn', texto); b.type = 'button'; b.disabled = !!disabled; b.onclick = fn; return b; };
  const estilo = E('style', null, `
    .d-cuerpo{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px;padding:6px 16px 16px}
    .d-cuerpo>*{flex:none;margin:0}
    .d-cuerpo input,.d-cuerpo select{width:100%;font:inherit;font-size:13px;color:#fff;background:#2e2c33;border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:7px 10px}
    .d-cuerpo select{cursor:pointer}.d-cuerpo .act-vacio{padding:0}
    .d-cuerpo>h3{margin-top:10px;padding-top:12px;border-top:1px solid rgba(255,255,255,.12);font-size:14px}
    .d-btn{display:block;width:100%;text-align:left;font:inherit;font-weight:700;color:#fff;background:#4a4752;border:0;border-radius:8px;padding:9px 12px;cursor:pointer}.d-btn:hover:not(:disabled),.d-btn.sel{background:var(--acento)}.d-btn:disabled{opacity:.4;cursor:default}
    .d-sala{padding:10px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.05)}.d-sala h3{font-size:14px;margin:0 0 4px}.d-sala p{margin:3px 0;color:#c0bfbc;font-size:12px}.d-sala .d-btn{margin-top:8px}.d-cod{font:700 30px "Ubuntu Mono",monospace;letter-spacing:.25em;text-align:center;background:#2e2c33;border-radius:10px;padding:8px}.d-jug{display:flex;justify-content:space-between;gap:8px;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.06);font-size:13px}.d-jug small{color:#c0bfbc}.d-barra{height:6px;margin:3px 0 8px;border-radius:3px;background:rgba(0,0,0,.15);overflow:hidden}.d-barra i{display:block;height:100%;background:var(--acento);transition:width .3s ease}.d-pista{margin-top:8px;padding:7px 9px;border-left:3px solid var(--acento);background:rgba(255,255,255,.06);font-size:12px}.d-fin button{font:inherit;font-weight:700;padding:6px 10px;border:0;border-radius:6px;background:var(--acento);color:#fff;cursor:pointer}.act-term[hidden]{display:none}.enunciado.d-full{max-height:none;flex:1}
    .d-conf{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(0,0,0,.55)}.d-conf-c{width:min(380px,calc(100% - 24px));background:var(--ventana);color:#fff;border-radius:12px;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,.55)}.d-conf-c h3{font-size:17px;margin-bottom:6px}.d-conf-c p{margin-bottom:14px;color:#c0bfbc}.d-conf-c div{display:flex;justify-content:flex-end;gap:8px}.d-conf-c button{font:inherit;font-weight:700;color:#fff;background:#4a4752;border:0;border-radius:8px;padding:7px 14px;cursor:pointer}.d-conf-c .d-si{background:#c01c28}
  `);
  document.head.append(estilo);

  let db = null, uid = null, offset = 0, nombre = '', modo = 'carrera', numeroEjercicios = 8, capacidad = 20;
  let codigo = null, referencia = null, sala = null, salas = {}, secuencias = null, jugador = null, aviso = '', ayudaReloj = null, ayudaClave = '';
  try { nombre = localStorage.getItem('duelo-nombre') || ''; } catch (e) {}

  const caja = E('div'); caja.style.cssText = 'display:flex;gap:4px'; btnAct.replaceWith(caja);
  const btnDuelo = E('button', 'barra-btn', 'Duelo'); btnDuelo.type = 'button'; caja.append(btnAct, btnDuelo);
  const panel = E('aside', 'act-panel', '<div class="act-cab"><h2>Duelo</h2><p>Compite o practica en grupo.</p></div><div class="d-cuerpo"></div>');
  const cuerpo = panel.lastChild;
  const fondo = E('div', 'act-fondo', '<div class="act-velo"></div><section class="act-ventana" role="dialog" aria-label="Arena Linux"><div class="act-int"><div class="titulo" id="d-barra" tabindex="0" role="group" aria-label="Barra de título. Flechas: mover la ventana. Mayús + flechas: cambiar su tamaño"><span id="d-tit">Arena Linux</span><button id="d-max" class="act-max" type="button" aria-label="Maximizar ventana">□</button><button id="d-x" class="act-cerrar" type="button" aria-label="Salir">✕</button></div><div class="act-cuerpo"><article id="d-enun" class="enunciado"></article><div id="d-term" class="terminal act-term"><div id="d-pant" class="pantalla"><span id="d-hist"></span><div class="entrada"><span id="d-prompt"></span><input id="d-in" type="text" autocomplete="off" spellcheck="false" aria-label="Escribe un comando"></div></div><div class="pie"><button id="d-salir" type="button">Salir</button><span id="d-contador" class="contador"></span></div></div></div></div></section>');
  fondo.hidden = true;
  document.body.append(panel, fondo);
  const enunciado = $('d-enun'), terminal = $('d-term'), pantalla = $('d-pant'), entrada = $('d-in');

  /* ---- Mover y redimensionar la ventana (mismo comportamiento que la de Actividades) ----
     Mover: arrastrar la barra de título (o flechas con la barra enfocada).
     Redimensionar: arrastrar bordes y esquinas (o Mayús + flechas). Doble clic en la barra o botón □: maximizar.
     La posición y el tamaño se conservan mientras no se recargue la página. */
  const ventana = fondo.querySelector('.act-ventana'), barra = $('d-barra'), btnMax = $('d-max');
  const TOPE = 30, MIN_W = 420, MIN_H = 320;   // TOPE = alto de la barra superior; mínimos de tamaño
  let geo = null, maxim = false, gesto = null;
  const minimos = () => ({ w:Math.min(MIN_W, innerWidth - 12), h:Math.min(MIN_H, innerHeight - TOPE) });
  function geometriaInicial(){
    const w = Math.min(900, innerWidth - 12), h = Math.min(680, innerHeight - TOPE - 12);
    return { x:Math.round((innerWidth - w) / 2), y:TOPE + Math.max(6, Math.round((innerHeight - TOPE - h) / 2)), w, h };
  }
  function limitar(){   // la ventana nunca queda fuera de la pantalla ni más pequeña que el mínimo
    const m = minimos();
    geo.w = Math.max(m.w, Math.min(geo.w, innerWidth));
    geo.h = Math.max(m.h, Math.min(geo.h, innerHeight - TOPE));
    geo.x = Math.max(80 - geo.w, Math.min(geo.x, innerWidth - 80));  // siempre quedan 80 px visibles para poder agarrarla
    geo.y = Math.max(TOPE, Math.min(geo.y, innerHeight - 42));       // la barra de título nunca baja del borde inferior
  }
  function colocar(){
    if (!geo) geo = geometriaInicial();   // la primera vez se centra; después conserva donde la dejó la persona
    if (!maxim) limitar();
    const r = maxim ? { x:0, y:TOPE, w:innerWidth, h:innerHeight - TOPE } : geo;
    Object.assign(ventana.style, { left:r.x + 'px', top:r.y + 'px', width:r.w + 'px', height:r.h + 'px' });
    ventana.classList.toggle('maximizada', maxim);
    btnMax.textContent = maxim ? '❐' : '□';
    btnMax.setAttribute('aria-label', maxim ? 'Restaurar ventana' : 'Maximizar ventana');
  }
  const alternarMax = () => { maxim = !maxim; colocar(); };
  // Tiradores de los ocho bordes/esquinas (el CSS de .res ya está en el HTML)
  ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(d => { const h = E('span', 'res ' + d); h.dataset.d = d; ventana.append(h); });
  ventana.addEventListener('pointerdown', e => {
    if (e.button !== 0 || maxim) return;
    const tirador = e.target.closest('.res'), enBarra = barra.contains(e.target) && !e.target.closest('button');
    if (!tirador && !enBarra) return;
    gesto = { tipo:tirador ? tirador.dataset.d : 'mover', px:e.clientX, py:e.clientY, o:{ ...geo } };
    (tirador || barra).setPointerCapture(e.pointerId);
  });
  ventana.addEventListener('pointermove', e => {
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
  ['pointerup', 'pointercancel'].forEach(ev => ventana.addEventListener(ev, () => { gesto = null; }));
  barra.addEventListener('dblclick', e => { if (!e.target.closest('button')) alternarMax(); });
  btnMax.onclick = alternarMax;
  barra.addEventListener('keydown', e => {   // con la barra enfocada: flechas = mover, Mayús + flechas = redimensionar
    if (e.target !== barra || maxim) return;
    const d = 24, v = { ArrowLeft:[-d, 0], ArrowRight:[d, 0], ArrowUp:[0, -d], ArrowDown:[0, d] }[e.key];
    if (!v) return;
    e.preventDefault();
    if (e.shiftKey){ geo.w += v[0]; geo.h += v[1]; } else { geo.x += v[0]; geo.y += v[1]; }
    colocar();
  });
  addEventListener('resize', () => { if (!fondo.hidden) colocar(); });
  const abrir = () => { fondo.hidden = false; colocar(); void fondo.offsetWidth; fondo.classList.add('visible'); };
  const cerrar = () => { cancelarAyudas(); fondo.classList.remove('visible'); fondo.hidden = true; };
  const avisar = texto => { aviso = texto; renderPanel(); };
  btnDuelo.onclick = () => { panel.classList.toggle('abierto'); if (panel.classList.contains('abierto')) { alternarAct(false); iniciarFirebase(); renderPanel(); } };
  btnAct.addEventListener('click', () => panel.classList.remove('abierto'));
  $('d-x').onclick = $('d-salir').onclick = () => salirConConfirmacion();

  function iniciarFirebase(){
    if (db) return;
    if (!window.firebase) return avisar('No se cargó Firebase. Sirve la carpeta por HTTP para usar el multijugador.');
    try {
      firebase.initializeApp(CONFIG); db = firebase.database();
      db.ref('.info/serverTimeOffset').on('value', s => offset = s.val() || 0);
      db.ref('salas').on('value', s => { salas = s.val() || {}; renderPanel(); if (sala && !fondo.hidden) pintarPartida(); });
      firebase.auth().signInAnonymously().then(x => { uid = x.user.uid; renderPanel(); }).catch(e => avisar('No se pudo iniciar sesión: ' + e.code));
    } catch (e) { avisar('Error de Firebase: ' + e.message); }
  }

  function idsParaSala(){ return ORDEN_ACT.map(a => a.id).sort(() => Math.random() - .5).slice(0, numeroEjercicios); }
  async function crearSala(){
    if (!nombre) return avisar('Escribe tu nombre.');
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let intento = 0; intento < 8; intento++){
      const id = Array.from({ length:4 }, () => letras[Math.random() * letras.length | 0]).join('');
      const base = { ...window.DUELO_CORE.crearConfiguracionSala(modo, idsParaSala(), capacidad), anfitrion:uid, creador:nombre, jugadores:{ [uid]:{ nombre, prog:0, paso:0, fallos:0, pistas:0, solucion:0 } } };
      const resultado = await db.ref('salas/' + id).transaction(actual => actual === null ? base : undefined);
      if (resultado.committed) return entrarSala(id);
    }
    avisar('No se pudo crear la sala. Inténtalo de nuevo.');
  }
  async function unirSala(id){
    id = String(id || '').trim().toUpperCase(); if (!id) return avisar('Escribe un código o elige una sala.');
    if (!nombre) return avisar('Escribe tu nombre.');
    const actual = (await db.ref('salas/' + id).get()).val();
    if (!actual) return avisar('Esa sala no existe.');
    const normal = window.DUELO_CORE.normalizarSala(actual);
    if (!normal.jugadores[uid] && !window.DUELO_CORE.esSalaUnible(normal)) return avisar('La sala está llena o ya ha empezado.');
    if (!normal.jugadores[uid]) await db.ref('salas/' + id + '/jugadores/' + uid).set({ nombre, prog:0, paso:0, fallos:0, pistas:0, solucion:0 });
    entrarSala(id);
  }
  function entrarSala(id){
    codigo = id; referencia = db.ref('salas/' + id); aviso = '';
    referencia.child('jugadores/' + uid).onDisconnect().remove();
    referencia.on('value', s => { sala = s.val(); if (!sala) return salirLocal(); renderPanel(); if (sala.jugadores && sala.jugadores[uid]) { if (sala.estado !== 'espera') abrir(); pintarPartida(); } });
  }
  function iniciarSala(){
    if (!sala || sala.anfitrion !== uid || sala.estado !== 'espera') return;
    referencia.update({ estado:'cuenta-atras', inicio:Date.now() + offset + CUENTA_ATRAS });
    setTimeout(() => { if (sala && sala.estado === 'cuenta-atras' && referencia) referencia.update({ estado:'jugando' }); }, CUENTA_ATRAS + 150);
  }
  function salirLocal(){ cancelarAyudas(); if (referencia) referencia.off(); referencia = sala = secuencias = jugador = null; codigo = null; cerrar(); renderPanel(); }
  function salir(){
    if (!referencia) return salirLocal();
    const eraAnfitrion = sala && sala.anfitrion === uid;
    cancelarAyudas(); referencia.off();
    if (eraAnfitrion && sala.estado === 'espera') referencia.update({ estado:'cerrada', visible:false });
    else referencia.child('jugadores/' + uid).remove();
    salirLocal();
  }
  function salirConConfirmacion(){
    if (!sala || sala.estado === 'terminada') return salir();
    if (document.querySelector('.d-conf')) return;
    const modal = E('div', 'd-conf', '<div class="d-conf-c" role="alertdialog" aria-modal="true"><h3>¿Salir de la sala?</h3><p></p><div><button class="d-no" type="button">Seguir</button><button class="d-si" type="button">Salir</button></div></div>');
    modal.querySelector('p').textContent = sala.anfitrion === uid ? 'La sala se cerrará para todos.' : 'Tu progreso dejará de aparecer en la sala.';
    modal.querySelector('.d-no').onclick = () => modal.remove(); modal.querySelector('.d-si').onclick = () => { modal.remove(); salir(); }; document.body.append(modal); modal.querySelector('.d-no').focus();
  }

  function renderPanel(){
    cuerpo.innerHTML = '';
    if (!CONFIG.apiKey) return cuerpo.append(E('p', 'act-vacio', 'Falta la configuración de Firebase.'));
    if (!uid) return cuerpo.append(E('p', 'act-vacio', escapar(aviso || 'Conectando…')));
    if (sala) return renderSalaPanel();
    const nombreInput = E('input'); nombreInput.placeholder = 'Tu nombre'; nombreInput.maxLength = 16; nombreInput.value = nombre; nombreInput.oninput = () => { nombre = nombreInput.value.trim(); try { localStorage.setItem('duelo-nombre', nombre); } catch (e) {} };
    cuerpo.append(nombreInput, E('p', 'act-vacio', 'Crea una sala para toda la clase o únete a una abierta.'));
    Object.entries(MODOS).forEach(([id, texto]) => cuerpo.append(boton(texto, () => { modo = id; renderPanel(); }, false)));
    const ejercicios = E('select'); for (let i = MIN_EJ; i <= MAX_EJ; i++) ejercicios.append(new Option(i + ' ejercicios', i, false, i === numeroEjercicios)); ejercicios.onchange = () => numeroEjercicios = +ejercicios.value;
    const maximo = E('select'); for (let i = 5; i <= MAX_JUGADORES; i += 5) maximo.append(new Option(i + ' jugadores máximo', i, false, i === capacidad)); maximo.onchange = () => capacidad = +maximo.value;
    cuerpo.append(ejercicios, maximo, boton('＋ Crear sala', crearSala));
    const codigoInput = E('input'); codigoInput.placeholder = 'Código privado (opcional)'; codigoInput.maxLength = 4; codigoInput.style.textTransform = 'uppercase'; cuerpo.append(codigoInput, boton('→ Unirme con código', () => unirSala(codigoInput.value)));
    cuerpo.append(E('h3', null, 'Salas abiertas'));
    const abiertas = Object.entries(salas).map(([id, raw]) => ({ id, ...window.DUELO_CORE.normalizarSala(raw) })).filter(window.DUELO_CORE.esSalaUnible);
    if (!abiertas.length) cuerpo.append(E('p', 'act-vacio', 'No hay salas abiertas todavía.'));
    abiertas.forEach(s => { const n = Object.keys(s.jugadores || {}).length; const card = E('div', 'd-sala', '<h3>' + escapar(MODOS[s.modo]) + '</h3><p>' + escapar(s.creador || 'Sala') + ' · ' + n + '/' + s.capacidad + ' jugadores · ' + s.ids.length + ' ejercicios</p>'); card.append(boton('Unirme', () => unirSala(s.id))); cuerpo.append(card); });
    if (aviso) cuerpo.append(E('p', 'act-vacio', escapar(aviso)));
  }
  function renderSalaPanel(){
    const jugadores = Object.values(sala.jugadores || {}); cuerpo.append(E('div', 'd-cod', codigo), E('p', 'act-vacio', MODOS[sala.modo] + ' · ' + jugadores.length + '/' + sala.capacidad + ' jugadores'));
    jugadores.forEach(j => cuerpo.append(E('div', 'd-jug', '<span>' + escapar(j.nombre) + '</span><small>' + (j.prog || 0) + ' ejercicios</small>')));
    if (sala.estado === 'espera' && sala.anfitrion === uid) cuerpo.append(boton('▶ Empezar sala', iniciarSala));
    else if (sala.estado === 'espera') cuerpo.append(E('p', 'act-vacio', 'Esperando a que empiece el creador…'));
    if (sala.estado !== 'espera') cuerpo.append(boton('Volver a la partida', abrir));
    cuerpo.append(boton('Salir de la sala', salirConConfirmacion));
  }

  function secuenciaActual(){
    if (!secuencias) secuencias = (sala.ids || []).map(id => ORDEN_ACT.find(a => a.id === id)).filter(Boolean).map(a => ({ titulo:a.titulo, enun:unir(a.enunciado), estado:crearEstado(a), pasos:a.pasos.map(p => ({ tarea:p.tarea, paso:p })) }));
    return secuencias;
  }
  function cancelarAyudas(){ if (ayudaReloj) ayudaReloj.cancelar(); ayudaReloj = null; ayudaClave = ''; }
  function guardarJugador(cambios){ if (referencia && uid) referencia.child('jugadores/' + uid).update(cambios); }
  function programarAyudas(paso){
    if (!jugador || !sala || sala.estado !== 'jugando') return;
    const clave = codigo + ':' + jugador.paso, plan = window.DUELO_CORE.crearPlanAyudas(paso); if (ayudaClave === clave) return;
    cancelarAyudas(); ayudaClave = clave;
    ayudaReloj = window.DUELO_CORE.crearRelojAyudas(plan, {
      onPista:i => { if (ayudaClave !== clave) return; jugador.pistas++; jugador.hist += '<span class="c"># Pista ' + (i + 1) + '/3: ' + escapar(plan.pistas[i]) + '</span>\n'; guardarJugador({ pistas:jugador.pistas }); pintarPartida(); },
      onSolucion:() => { if (ayudaClave !== clave) return; jugador.solucion++; jugador.hist += '<span class="c"># Solución: ' + escapar(plan.solucion) + '</span>\n'; guardarJugador({ solucion:jugador.solucion }); pintarPartida(); }
    });
    ayudaReloj.iniciar();
  }
  function posicionesHtml(total){ return window.DUELO_CORE.calcularPosiciones(sala.jugadores || {}).map((j, i) => '<div><b>' + (i + 1) + '. ' + escapar(j.nombre) + (j.uid === uid ? ' (tú)' : '') + '</b> <small>' + (j.prog || 0) + '/' + total + '</small><div class="d-barra"><i style="width:' + (total ? 100 * (j.prog || 0) / total : 0) + '%"></i></div></div>').join(''); }
  function pintarPartida(){
    if (!sala || !sala.jugadores || !sala.jugadores[uid]) return;
    const anterior = jugador || {};
    jugador = { ...sala.jugadores[uid], estado:anterior.estado, estadoActividad:anterior.estadoActividad, hist:anterior.hist };
    if (!secuencias && sala.ids) secuenciaActual();
    const seq = secuenciaActual(), total = seq.reduce((n, s) => n + s.pasos.length, 0), ranking = posicionesHtml(total);
    if (sala.estado === 'espera') { terminal.hidden = true; enunciado.className = 'enunciado d-full'; enunciado.innerHTML = '<h3>Esperando al inicio</h3><p>Ya hay ' + Object.keys(sala.jugadores).length + ' personas en la sala.</p><div>' + ranking + '</div>'; return; }
    if (sala.estado === 'cuenta-atras') { terminal.hidden = true; enunciado.className = 'enunciado d-full'; const falta = Math.max(0, Number(sala.inicio || 0) - (Date.now() + offset)); enunciado.innerHTML = '<h3>¡Preparados!</h3><p>La partida empieza en ' + Math.ceil(falta / 1000) + '…</p><div>' + ranking + '</div>'; if (falta > 0) setTimeout(pintarPartida, 200); return; }
    if (sala.estado === 'terminada') { cancelarAyudas(); terminal.hidden = true; enunciado.className = 'enunciado d-full'; enunciado.innerHTML = '<div class="d-fin"><h3>' + (sala.modo === 'carrera' ? '🏆 Carrera terminada' : 'Práctica terminada') + '</h3><div>' + ranking + '</div><p>Has usado ' + (jugador.pistas || 0) + ' pistas y cometido ' + (jugador.fallos || 0) + ' fallos.</p><button type="button" onclick="this.closest(\'.act-fondo\').querySelector(\'#d-salir\').click()">Salir</button></div>'; return; }
    if ((jugador.paso || 0) >= total) { terminal.hidden = true; enunciado.className = 'enunciado d-full'; enunciado.innerHTML = '<h3>Has terminado</h3><p>Esperando al resto de participantes…</p><div>' + ranking + '</div>'; return; }
    const ubicacion = (() => { let n = 0; for (let i = 0; i < seq.length; i++) for (let j = 0; j < seq[i].pasos.length; j++, n++) if (n === jugador.paso) return { q:i, p:j }; return { q:0, p:0 }; })();
    const actual = seq[ubicacion.q], paso = actual.pasos[ubicacion.p], idActividad = sala.ids[ubicacion.q];
    if (jugador.estadoActividad !== idActividad){ jugador.estadoActividad = idActividad; jugador.estado = crearEstado(ORDEN_ACT.find(a => a.id === idActividad)); }
    const local = jugador.estado; terminal.hidden = false; enunciado.className = 'enunciado'; enunciado.innerHTML = '<div aria-label="Progreso de participantes">' + ranking + '</div><h3>' + (sala.modo === 'carrera' ? 'Carrera' : 'Práctica') + ' · ejercicio ' + (ubicacion.q + 1) + '/' + seq.length + '</h3>' + actual.enun + '<ol class="tareas">' + actual.pasos.map((p, i) => '<li class="' + (i < ubicacion.p ? 'hecha' : i === ubicacion.p ? 'actual' : '') + '">' + p.tarea + '</li>').join('') + '</ol>';
    pantalla.querySelector('#d-hist').innerHTML = jugador.hist || '<span class="c"># Escribe el comando y pulsa Enter.</span>\n'; pantalla.querySelector('#d-prompt').innerHTML = promptHtml(rutaVisible(local.cwd)); $('d-contador').textContent = 'Progreso ' + (jugador.paso || 0) + '/' + total; programarAyudas(paso.paso); if (document.activeElement !== entrada) entrada.focus();
  }
  function enviar(){
    if (!sala || sala.estado !== 'jugando' || !jugador || (jugador.paso || 0) >= (secuenciaActual().reduce((n, s) => n + s.pasos.length, 0))) return;
    const seq = secuenciaActual(), crudo = entrada.value, t = normalizar(crudo); entrada.value = ''; if (!t) return; const ubicacion = (() => { let n = 0; for (let i = 0; i < seq.length; i++) for (let j = 0; j < seq[i].pasos.length; j++, n++) if (n === jugador.paso) return { q:i, p:j }; })(); const act = seq[ubicacion.q], paso = act.pasos[ubicacion.p]; if (jugador.estadoActividad !== sala.ids[ubicacion.q]){ jugador.estadoActividad = sala.ids[ubicacion.q]; jugador.estado = crearEstado(ORDEN_ACT.find(a => a.id === sala.ids[ubicacion.q])); } jugador.hist = (jugador.hist || '') + promptHtml(rutaVisible(jugador.estado.cwd)) + escapar(crudo) + '\n'; const resultado = validarPaso(paso.paso, jugador.estado, t);
    if (resultado.ok){ cancelarAyudas(); jugador.estado = resultado.estado; jugador.paso++; jugador.prog = jugador.paso; jugador.hist += resultado.salida ? resultado.salida + '\n' : ''; guardarJugador({ paso:jugador.paso, prog:jugador.prog, fallos:jugador.fallos || 0, pistas:jugador.pistas || 0, solucion:jugador.solucion || 0 }); if (jugador.paso >= seq.reduce((n, s) => n + s.pasos.length, 0)){ jugador.fin = Date.now() + offset; guardarJugador({ fin:firebase.database.ServerValue.TIMESTAMP }); if (sala.modo === 'carrera') referencia.child('ganador').transaction(g => g || uid).then(() => referencia.update({ estado:'terminada' })); } }
    else { jugador.fallos = (jugador.fallos || 0) + 1; jugador.hist += '<span class="c"># ' + escapar(resultado.diagnostico || resultado.error || 'Revisa el comando y el objetivo.') + '</span>\n'; guardarJugador({ fallos:jugador.fallos }); }
    pintarPartida();
  }
  entrada.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); enviar(); } else if (e.key === 'Tab'){ e.preventDefault(); completarInput(entrada, jugador && jugador.estado, html => { jugador.hist += html; pintarPartida(); }); } else if (e.ctrlKey && e.key.toLowerCase() === 'l'){ e.preventDefault(); jugador.hist = ''; pintarPartida(); } };
  pantalla.onclick = () => entrada.focus();
  addEventListener('beforeunload', e => { if (sala && sala.estado === 'jugando'){ e.preventDefault(); e.returnValue = ''; } });
})();
