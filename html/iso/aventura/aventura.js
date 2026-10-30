/* =====================================================================
   AVENTURA GUIADA · MOTOR
   ---------------------------------------------------------------------
   Pantalla completa con nodos por comando. Cada nodo tiene 1-3 rondas:
   la primera explica, las siguientes practican variantes y suben de nivel.
   El anillo del nodo del mapa se va llenando ronda a ronda.

   Lo que NO hace este fichero:
     · No reinterpreta comandos. Usa el intérprete de linux-terminal.html
       (crearEstado, ejecutarLinea, comprobarMeta), que ya está probado.
     · No modifica el mundo de las actividades ni el del duelo: cada
       ronda monta su propio mundo virtual y lo tira al terminar.

   El contenido está en aventura-datos.js (window.AVENTURA).
   Se engancha a la barra superior como un botón más y se carga después
   del script principal, igual que duelo.js.

   SOBRE LOS REPINTADOS
   --------------------
   La tarjeta de una pantalla se monta UNA vez. Cuando el alumno escribe,
   falla o pide ayuda, solo se actualizan los trozos que cambian (terminal,
   avisos, botones). Así no hay saltos ni animaciones que se repiten.
   ===================================================================== */
(function () {
  'use strict';

  const DATOS = window.AVENTURA;
  if (!DATOS || !Array.isArray(DATOS.mundos) || !DATOS.mundos.length) {
    console.warn('Aventura: no se encuentra window.AVENTURA (¿falta aventura-datos.js?).');
    return;
  }
  if (typeof crearEstado !== 'function' || typeof ejecutarLinea !== 'function' || typeof comprobarMeta !== 'function') {
    console.warn('Aventura: el motor de la terminal no está disponible.');
    return;
  }

  const CLAVE = 'aventura-v1';
  const CLAVE_SONIDO = 'aventura-sonido';
  const byId = id => document.getElementById(id);
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Iconos (SVG propios: se ven igual en cualquier equipo) ---------------- */
  const svg = interior => '<svg class="av-svg" viewBox="0 0 24 24" aria-hidden="true">' + interior + '</svg>';
  const ICO = {
    estrella: svg('<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/>'),
    fuego: svg('<path d="M12 2c.5 3.4-2.3 4.9-2.3 7.7 0 1.5.9 2.7 2.3 2.7s2.3-1.2 2.3-2.7c0-.9-.3-1.6-.3-1.6 2.4 1.5 4.1 3.9 4.1 6.6 0 3.7-2.9 6.3-6.1 6.3S5.9 18.3 5.9 14.7C5.9 9.3 10.3 6.9 12 2z" fill="currentColor"/>'),
    libro: svg('<path d="M4 5.5A2.5 2.5 0 016.5 3H11v16H6.5A2.5 2.5 0 004 21.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M20 5.5A2.5 2.5 0 0017.5 3H13v16h4.5A2.5 2.5 0 0120 21.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'),
    play: svg('<path d="M8 5l11 7-11 7z" fill="currentColor"/>'),
    candado: svg('<rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="2"/>'),
    sonido: svg('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    mudo: svg('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    bombilla: svg('<path d="M12 3a6 6 0 00-3.6 10.8c.6.5 1 1.2 1 2h5.2c0-.8.4-1.5 1-2A6 6 0 0012 3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M9.5 18.5h5M10.5 21h3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'),
    trofeo: svg('<path d="M8 4h8v4.5a4 4 0 01-8 0z" fill="currentColor"/><path d="M8 5H5.5A3.5 3.5 0 009 8.5M16 5h2.5A3.5 3.5 0 0115 8.5M12 12.5V16M9.5 20h5M10 16h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    brujula: svg('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 8.5l-2.2 5.3-4.8 1.7 2.2-5.3z" fill="currentColor"/>'),
    carpeta: svg('<path d="M3 7.5A2.5 2.5 0 015.5 5H9l2 2h7.5A2.5 2.5 0 0121 9.5v8A2.5 2.5 0 0118.5 20h-13A2.5 2.5 0 013 17.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 11v6M9 14h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
    caja: svg('<path d="M4 8.5l8-4.2 8 4.2-8 4.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 8.5v8l8 4.2 8-4.2v-8M12 12.7v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
    cono: svg('<path d="M12 3l7 13H5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 16h14v3H5z" fill="currentColor"/>'),
    llave: svg('<circle cx="8" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 11l8 8M16 16l3-3M14 18l2-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
    lupa: svg('<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5L21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    grafico: svg('<path d="M5 20V10M10 20V4M15 20v-7M20 20V7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
    descargar: svg('<path d="M12 3v12M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    subir: svg('<path d="M12 17V5M7 10l5-5 5 5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    corona: svg('<path d="M4 8l4 3 4-6 4 6 4-3-2 10H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 20h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>')
  };
  const PINGUINO = '<svg class="av-svg av-pinguino" viewBox="0 0 64 64" aria-hidden="true">' +
    '<ellipse cx="32" cy="35" rx="19" ry="25" fill="#2b2330"/>' +
    '<ellipse cx="32" cy="45" rx="12" ry="14.5" fill="#f6f5f4"/>' +
    '<circle cx="25" cy="27" r="6.8" fill="#f6f5f4"/>' +
    '<circle cx="39" cy="27" r="6.8" fill="#f6f5f4"/>' +
    '<circle cx="26.4" cy="27.6" r="2.3" fill="#241f31"/>' +
    '<circle cx="37.6" cy="27.6" r="2.3" fill="#241f31"/>' +
    '<path d="M28.8 32.5h6.4L32 37.4z" fill="#f6a623"/>' +
    '<ellipse cx="25" cy="59.5" rx="6" ry="2.4" fill="#f6a623"/>' +
    '<ellipse cx="39" cy="59.5" rx="6" ry="2.4" fill="#f6a623"/>' +
  '</svg>';
  const iconoMundo = m => ({ orientarse: ICO.brujula, organizar: ICO.caja, shell: ICO.cono, avanzado: ICO.llave, buscar: ICO.lupa }[m.id] || ICO.estrella);
  const clonar = e => JSON.parse(JSON.stringify(e));
  const limpiar = h => String(h || '').replace(/<[^>]*>/g, '');
  const normalizar = t => String(t || '').trim().replace(/\s+/g, ' ');
  const sinTildes = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  /* ---------------- Progreso guardado ---------------- */
  const TODOS = {};
  DATOS.mundos.forEach(m => m.lecciones.forEach(l => { TODOS[l.id] = l; }));
  const totalRondas = Object.values(TODOS).reduce((s, l) => s + l.rondas.length, 0);

  function normalizarDatos(g) {
    const base = {
      version: 3, xp: 0, racha: { dias: 0, ultima: '' }, lecciones: {}, retos: {},
      modoRey: false,
      stats: { intentos: 0, aciertos: 0, primerIntento: 0, primerAcierto: 0, tests: 0, testsOk: 0, ayudas: 0, segundos: 0 }
    };
    if (g && typeof g === 'object') {
      base.xp = Math.max(0, Number(g.xp) || 0);
      base.racha = { dias: Math.max(0, Number(g.racha && g.racha.dias) || 0), ultima: String((g.racha && g.racha.ultima) || '') };
      base.lecciones = (g.lecciones && typeof g.lecciones === 'object') ? g.lecciones : {};
      base.retos = (g.retos && typeof g.retos === 'object') ? g.retos : {};
      base.modoRey = !!g.modoRey;
      base.stats = Object.assign(base.stats, (g.stats && typeof g.stats === 'object') ? g.stats : {});
    }
    // Se ignoran ids que ya no existen (contenido retirado) y se migra el
    // modelo viejo (una lección = una pantalla) al de rondas.
    Object.keys(base.lecciones).forEach(id => {
      const def = TODOS[id], g = base.lecciones[id];
      if (!def || !g || typeof g !== 'object') { delete base.lecciones[id]; return; }
      if (g.rondasHechas == null){
        g.rondasHechas = g.hecha ? def.rondas.length : 0;
        g.ronda = 0;
        g.pantalla = Math.max(0, Number(g.pantalla) || 0);
      }
      g.rondasHechas = Math.min(def.rondas.length, Math.max(0, Number(g.rondasHechas) || 0));
      g.ronda = Math.min(def.rondas.length - 1, Math.max(0, Number(g.ronda) || 0));
      g.pantalla = Math.max(0, Number(g.pantalla) || 0);
      if (g.snapshot && typeof g.snapshot !== 'object') g.snapshot = null;
      if (g.entrada != null) g.entrada = String(g.entrada);
    });
    Object.keys(base.retos).forEach(id => {
      if (!DATOS.mundos.some(m => m.id === id)) delete base.retos[id];
    });
    Object.keys(base.stats).forEach(k => {
      base.stats[k] = Math.max(0, Number(base.stats[k]) || 0);
    });
    return base;
  }
  function cargar() {
    let g = null;
    try { g = JSON.parse(localStorage.getItem(CLAVE) || 'null'); }
    catch (e) { /* sin localStorage: la aventura funciona igual, sin recordar */ }
    return normalizarDatos(g);
  }
  const av = cargar();
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(av)); } catch (e) {} };
  let inicioSesion = 0;
  function cerrarSesionTiempo() {
    if (!inicioSesion) return;
    const seg = Math.round((Date.now() - inicioSesion) / 1000);
    inicioSesion = 0;
    if (seg > 0) { av.stats.segundos = (av.stats.segundos || 0) + seg; guardar(); }
  }
  const cuenta = (campo, n) => { av.stats[campo] = Math.max(0, Number(av.stats[campo]) || 0) + (n == null ? 1 : n); };

  let sonido = true;
  try { sonido = localStorage.getItem(CLAVE_SONIDO) !== '0'; } catch (e) {}

  /* ---------------- Sonido propio (no toca el de las actividades) ---------------- */
  let audio = null;
  function avTono(frec, dur, tipo, vol, retraso) {
    if (!sonido) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      audio = audio || new Ctx();
      const t0 = audio.currentTime + (retraso || 0);
      const o = audio.createOscillator(), v = audio.createGain();
      o.type = tipo || 'sine';
      o.frequency.value = frec;
      v.gain.setValueAtTime(0.0001, t0);
      v.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + 0.012);
      v.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(v); v.connect(audio.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) {}
  }
  const sonidoPaso = () => { avTono(784, 0.12, 'sine', 0.04); avTono(1175, 0.16, 'sine', 0.028, 0.08); };
  const sonidoFin = () => [523, 659, 784, 1047].forEach((f, k) => avTono(f, 0.22, 'triangle', 0.038, k * 0.1));

  /* ---------------- Ayudas de progreso ---------------- */
  const mundoDe = i => DATOS.mundos[i];
  const leccionDe = (i, j) => DATOS.mundos[i].lecciones[j];
  const progresoDe = id => av.lecciones[id] || {};
  const rondasHechas = id => {
    const def = TODOS[id];
    return def ? Math.min(def.rondas.length, Math.max(0, Number(progresoDe(id).rondasHechas) || 0)) : 0;
  };
  const estaHecha = id => !!TODOS[id] && rondasHechas(id) >= TODOS[id].rondas.length;
  const mundoHecho = i => mundoDe(i).lecciones.every(l => estaHecha(l.id));
  const modoRey = () => !!av.modoRey;
  const mundoAbierto = i => modoRey() || i === 0 || mundoHecho(i - 1);
  const leccionAbierta = (i, j) => modoRey() || (mundoAbierto(i) && (estaHecha(leccionDe(i, j).id) || j === 0 || estaHecha(leccionDe(i, j - 1).id)));
  // Sin contar el Modo rey: sirve para marcar cuál sería el siguiente nodo/ronda
  // de verdad. Así el mapa sigue teniendo un solo "Ahora" y el resto se ve en amarillo.
  const mundoBaseAbierto = i => i === 0 || mundoHecho(i - 1);
  const leccionBaseAbierta = (i, j) => mundoBaseAbierto(i) && (estaHecha(leccionDe(i, j).id) || j === 0 || estaHecha(leccionDe(i, j - 1).id));
  const totalLecciones = Object.keys(TODOS).length;
  const hechas = () => Object.keys(TODOS).filter(estaHecha).length;
  const rondasTotalesHechas = () => Object.keys(TODOS).reduce((s, id) => s + rondasHechas(id), 0);

  function siguientePendiente() {
    for (let i = 0; i < DATOS.mundos.length; i++) {
      if (!mundoAbierto(i)) continue;
      const lecciones = mundoDe(i).lecciones;
      for (let j = 0; j < lecciones.length; j++) if (!estaHecha(lecciones[j].id)) return { i: i, j: j };
    }
    return null;
  }

  const dos = n => String(n).padStart(2, '0');
  const fecha = d => d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate());
  function tocarRacha() {
    const hoy = fecha(new Date());
    if (av.racha.ultima === hoy) return;
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    av.racha.dias = av.racha.ultima === fecha(ayer) ? (av.racha.dias || 0) + 1 : 1;
    av.racha.ultima = hoy;
  }

  function sumarXp(n) {
    if (!n || modoRey()) return 0;
    av.xp = Math.max(0, (av.xp || 0) + n);
    guardar();
    pintarCabecera();
    const pill = byId('av-xp-pill');
    if (pill) {
      pill.classList.remove('av-pop');
      void pill.offsetWidth;   // reinicia la animación sin recrear el elemento
      pill.classList.add('av-pop');
    }
    return n;
  }

  /* ---------------- Interfaz: se crea una sola vez ---------------- */
  const raiz = document.createElement('div');
  raiz.className = 'av';
  raiz.id = 'av';
  raiz.hidden = true;
  raiz.setAttribute('role', 'dialog');
  raiz.setAttribute('aria-modal', 'true');
  raiz.setAttribute('aria-label', 'Aventura guiada de Linux');
  raiz.innerHTML =
    '<header class="av-cab">' +
      '<button class="av-icono av-cerrar" id="av-cerrar" type="button" aria-label="Cerrar la aventura" title="Cerrar (Esc)">✕</button>' +
      '<div class="av-marca">' +
        '<span class="av-logo" aria-hidden="true">' + PINGUINO + '</span>' +
        '<span class="av-marca-txt">Aventura <b>Linux</b></span>' +
      '</div>' +
      '<div class="av-prog" id="av-prog" role="progressbar" aria-label="Progreso de la ronda" hidden></div>' +
      '<div class="av-hud">' +
        '<span class="av-pill av-pill--xp" id="av-xp-pill" title="Puntos de la aventura">' + ICO.estrella + '<b id="av-xp">0</b></span>' +
        '<span class="av-pill av-pill--fuego" title="Días seguidos">' + ICO.fuego + '<b id="av-racha">0</b></span>' +
        '<button class="av-icono av-sonido" id="av-sonido" type="button"></button>' +
      '</div>' +
    '</header>' +
    '<main class="av-cuerpo" id="av-cuerpo"></main>' +
    '<footer class="av-pie" id="av-pie" hidden></footer>' +
    '<div class="av-fx" id="av-fx" aria-hidden="true"></div>' +
    '<p class="sr-only" id="av-anuncio" role="status" aria-live="polite"></p>';
  document.body.append(raiz);

  const cuerpo = byId('av-cuerpo'), pie = byId('av-pie'), prog = byId('av-prog'), fx = byId('av-fx');
  const anuncio = byId('av-anuncio'), btnSonido = byId('av-sonido');

  const pintarSonido = () => {
    btnSonido.innerHTML = sonido ? ICO.sonido : ICO.mudo;
    btnSonido.setAttribute('aria-pressed', String(sonido));
    btnSonido.setAttribute('aria-label', sonido ? 'Desactivar sonido' : 'Activar sonido');
    btnSonido.title = sonido ? 'Sonido activado. Pulsa para desactivarlo.' : 'Sonido desactivado. Pulsa para activarlo.';
  };
  btnSonido.onclick = () => {
    sonido = !sonido;
    try { localStorage.setItem(CLAVE_SONIDO, sonido ? '1' : '0'); } catch (e) {}
    pintarSonido();
    if (sonido) sonidoPaso();
  };
  pintarSonido();

  function decir(texto) {
    anuncio.textContent = '';
    setTimeout(() => { anuncio.textContent = texto; }, 30);
  }

  /* ---------------- Celebración ---------------- */
  function celebrar(n, fin) {
    if (n) {
      const s = document.createElement('span');
      s.className = 'av-mas';
      s.innerHTML = '+' + n + ' ' + ICO.estrella;
      s.style.left = Math.round(fx.clientWidth / 2) + 'px';
      s.style.top = Math.round(fx.clientHeight * 0.4) + 'px';
      fx.append(s);
      s.addEventListener('animationend', () => s.remove(), { once: true });
    }
    if (!sinMovimiento) {
      const colores = ['#f6d32d', '#8ae234', '#729fcf', '#c061cb', '#ffffff', '#c34113'];
      const n2 = fin ? 60 : 16;
      const x0 = fx.clientWidth / 2, y0 = fx.clientHeight * 0.4;
      for (let i = 0; i < n2; i++) {
        const p = document.createElement('i');
        const ang = Math.random() * Math.PI * 2;
        const dist = (fin ? 90 : 30) + Math.random() * (fin ? 240 : 80);
        p.style.left = x0 + 'px';
        p.style.top = y0 + 'px';
        p.style.background = colores[i % colores.length];
        p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        p.style.setProperty('--dy', (Math.sin(ang) * dist * 0.8 - (fin ? 50 : 8)) + 'px');
        p.style.setProperty('--rot', Math.round(Math.random() * 900 - 450) + 'deg');
        p.style.setProperty('--dur', Math.round(600 + Math.random() * 550) + 'ms');
        fx.append(p);
        p.addEventListener('animationend', () => p.remove(), { once: true });
      }
    }
    if (fin) sonidoFin(); else sonidoPaso();
  }

  /* Anillo de progreso de un nodo: 0/3, 1/3... */
  const RADIO_ANILLO = 29, CIRCUNFERENCIA = 2 * Math.PI * RADIO_ANILLO;
  function anillo(hechas, total, clase) {
    const frac = total ? Math.min(1, hechas / total) : 0;
    const offset = CIRCUNFERENCIA * (1 - frac);
    return '<svg class="av-anillo' + (clase ? ' ' + clase : '') + '" viewBox="0 0 64 64" aria-hidden="true">' +
        '<circle class="av-anillo-fondo" cx="32" cy="32" r="' + RADIO_ANILLO + '"/>' +
        (frac > 0 ? '<circle class="av-anillo-hecho" cx="32" cy="32" r="' + RADIO_ANILLO + '" ' +
          'stroke-dasharray="' + CIRCUNFERENCIA.toFixed(2) + '" stroke-dashoffset="' + offset.toFixed(2) + '" ' +
          'transform="rotate(-90 32 32)"/>' : '') +
      '</svg>';
  }

  /* ---------------- Botón en la barra superior ---------------- */
  const btn = document.createElement('button');
  btn.className = 'barra-btn';
  btn.type = 'button';
  btn.id = 'btn-aventura';
  btn.textContent = 'Aventura';
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  const btnActividades = byId('btn-act');
  if (btnActividades && btnActividades.parentNode) btnActividades.before(btn);
  else document.querySelector('.barra').prepend(btn);

  /* ---------------- Estado de la vista ---------------- */
  let vista = { tipo: 'mapa' };   // mapa | leccion | cierre | stats | glosario
  let lec = null;                 // nodo y ronda en curso
  let respuesta = '';             // lo escrito en la terminal, para no perderlo al repintar
  let montada = null;             // clave de la pantalla que ya está en el DOM
  let retoActual = null;          // examen de mundo en curso: { i, def, aciertos }

  function abrir() {
    raiz.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    if (typeof alternarAct === 'function') alternarAct(false);
    vista = { tipo: 'mapa' };
    montada = null;
    inicioSesion = Date.now();
    pintar();
    byId('av-cerrar').focus();
  }

  function cerrar() {
    flushEntrada();
    cerrarSesionTiempo();
    raiz.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }

  /* ---------------- Cabecera ---------------- */
  function pintarCabecera() {
    byId('av-xp').textContent = String(av.xp || 0);
    byId('av-racha').textContent = String(av.racha.dias || 0);

    if (vista.tipo === 'leccion' && lec) {
      const total = lec.ronda.pantallas.length;
      if (prog.childElementCount !== total) {
        let segs = '';
        for (let i = 0; i < total; i++) segs += '<i></i>';
        prog.innerHTML = segs;
      }
      for (let i = 0; i < total; i++) {
        const seg = prog.children[i];
        seg.className = i < lec.pantalla ? 'hecha' : (i === lec.pantalla ? 'actual' : '');
      }
      prog.hidden = false;
      prog.setAttribute('aria-valuemin', '1');
      prog.setAttribute('aria-valuemax', String(total));
      prog.setAttribute('aria-valuenow', String(lec.pantalla + 1));
      prog.setAttribute('aria-valuetext', (lec.examen ? 'Ejercicio ' : 'Ronda ') + (lec.rondaIdx + 1) + ' de ' + lec.def.rondas.length +
        ', pantalla ' + (lec.pantalla + 1) + ' de ' + total);
    } else {
      prog.hidden = true;
    }
  }

  function pintar() {
    pintarCabecera();
    if (vista.tipo === 'mapa') return pintarMapa();
    if (vista.tipo === 'stats') return pintarStats();
    if (vista.tipo === 'glosario') return pintarGlosario();
    if (vista.tipo === 'cierre') return pintarCierre();
    return pintarLeccion();
  }

  /* ---- Pantalla: mapa de mundos ---- */
  function pintarMapa() {
    montada = null;
    pie.hidden = true;
    pie.innerHTML = '';
    const sig = siguientePendiente();
    const nHechas = hechas();
    const rHechas = rondasTotalesHechas();
    const retosHechos = DATOS.mundos.filter(m => av.retos[m.id] && av.retos[m.id].hecho).length;

    let html =
      '<div class="av-mapa' + (modoRey() ? ' av-mapa--rey' : '') + '">' +
        '<section class="av-hero">' +
          '<div class="av-hero-cab">' +
            '<span class="av-hero-mascota" aria-hidden="true">' + PINGUINO + '</span>' +
            '<div>' +
              '<p class="av-kicker">Repaso autónomo · 1.º ASIR</p>' +
              '<h2 class="av-hero-titulo">' + (sig ? 'Tu aventura de Linux' : (retosHechos < DATOS.mundos.length ? 'Ahora, los retos' : '¡Aventura terminada!')) + '</h2>' +
            '</div>' +
          '</div>' +
          '<p class="av-hero-texto">' + (sig
            ? 'Cada comando es un nodo con varias rondas. La primera te lo explica y las siguientes te lo hacen practicar con variantes, cada vez un poco más difícil. El anillo se llena ronda a ronda. Sin prisa y sin castigos: si te atascas, pide ayuda.'
            : (retosHechos < DATOS.mundos.length
              ? 'Has completado todos los nodos. Cada mundo tiene un reto final que mezcla lo aprendido, con menos pistas. No resta puntos: solo comprueba si de verdad te lo sabes.'
              : 'Has completado todos los nodos y todos los retos. Puedes repetir cualquiera cuando quieras: no se borra nada.')) + '</p>' +
          (modoRey()
            ? '<p class="av-rey-aviso">' + ICO.corona + '<span><b>Modo rey activo.</b> Puedes abrir cualquier mundo, nodo, ronda o reto sin desbloquearlo. En este modo no se ganan puntos, pero sí se guarda lo que completes.</span></p>'
            : '') +
          '<div class="av-datos">' +
            '<span class="av-dato">' + ICO.estrella + ' <b>' + (av.xp || 0) + '</b> pts</span>' +
            '<span class="av-dato">' + ICO.fuego + ' <b>' + (av.racha.dias || 0) + '</b> ' + (av.racha.dias === 1 ? 'día' : 'días') + '</span>' +
            '<span class="av-dato">' + ICO.libro + ' <b>' + nHechas + '</b> / ' + totalLecciones + ' nodos</span>' +
            '<span class="av-dato">' + ICO.check + ' <b>' + rHechas + '</b> / ' + totalRondas + ' rondas</span>' +
            '<span class="av-dato">' + ICO.trofeo + ' <b>' + retosHechos + '</b> / ' + DATOS.mundos.length + ' retos</span>' +
          '</div>' +
          '<button class="av-btn av-btn--principal av-btn--grande" type="button" id="av-seguir">' +
            (sig ? 'Continuar' + (nHechas ? ' donde lo dejaste' : '') : 'Repasar desde el principio') +
          '</button>' +
          '<div class="av-herramientas">' +
            '<button class="av-btn av-btn--fantasma" type="button" id="av-stats">' + ICO.grafico + ' Estadísticas</button>' +
            '<button class="av-btn av-btn--fantasma" type="button" id="av-glosario">' + ICO.libro + ' Glosario</button>' +
          '</div>' +
        '</section>' +
        '<ol class="av-camino">';

    DATOS.mundos.forEach((m, i) => {
      const abierto = mundoAbierto(i);
      const listos = m.lecciones.filter(l => estaHecha(l.id)).length;
      const estado = !abierto ? 'bloqueado' : (listos === m.lecciones.length ? 'hecho' : 'actual');
      const tieneProgreso = listos > 0 || !!(av.retos[m.id] && av.retos[m.id].hecho);
      const reto = av.retos[m.id];
      const retoCompleto = listos === m.lecciones.length;
      const retoHecho = !!(reto && reto.hecho);
      const retoListo = abierto && (modoRey() || retoCompleto || retoHecho);
      html +=
        '<li class="av-mundo" data-estado="' + estado + '">' +
          '<div class="av-mundo-cab">' +
            '<span class="av-mundo-emoji" aria-hidden="true">' + iconoMundo(m) + '</span>' +
            '<div class="av-mundo-txt"><h3>Mundo ' + (i + 1) + ' · ' + m.titulo + '</h3><p>' + m.resumen + '</p></div>' +
            (tieneProgreso ? '<button class="av-mundo-reset" type="button" data-world-reset="' + i + '" title="Reiniciar solo este mundo" aria-label="Reiniciar el Mundo ' + (i + 1) + '">↺</button>' : '') +
            '<span class="av-mundo-prog">' + listos + '/' + m.lecciones.length + '</span>' +
          '</div>' +
          '<ol class="av-nodos">';

      m.lecciones.forEach((l, j) => {
        const total = l.rondas.length;
        const hechasL = rondasHechas(l.id);
        const hechaL = hechasL >= total;
        const abiertaL = leccionAbierta(i, j);
        const baseAbiertaL = leccionBaseAbierta(i, j);
        const clase = hechaL ? 'hecha' : (baseAbiertaL ? 'actual' : (abiertaL ? 'rey' : 'bloqueada'));
        const icono = hechaL ? ICO.check : (abiertaL ? ICO.play : ICO.candado);
        const etiqueta = abiertaL
          ? (hechaL ? 'Repasar ' : (hechasL ? 'Continuar ' : 'Empezar ')) + l.titulo + '. ' + hechasL + ' de ' + total + ' rondas.'
          : 'Nodo bloqueado: ' + l.titulo;
        const subnodos = l.rondas.map((r, k) => {
          const hechaR = hechaL || k < hechasL;
          const actualR = !hechaL && baseAbiertaL && k === hechasL;
          const reyR = modoRey() && !hechaR && !actualR;
          const estadoR = hechaR ? 'hecha' : (actualR ? 'actual' : (reyR ? 'rey' : 'bloqueada'));
          const abiertaR = modoRey() || (abiertaL && (hechaR || actualR));
          const etiquetaR = 'Ronda ' + (k + 1) + ' de ' + total + ': ' + r.titulo + '. ' + r.resumen +
            (hechaR ? '. Ya hecha: pulsa para repasarla.' : (actualR ? '. Es tu siguiente ronda.' : (reyR ? '. Abierta con Modo rey.' : '. Bloqueada.')));
          const estadoTxt = hechaR ? 'Hecha' : (actualR ? 'Ahora' : (reyR ? 'Modo rey' : 'Bloqueada'));
          const iconoR = abiertaR ? (hechaR ? ICO.check : ICO.play) : ICO.candado;
          return '<li class="av-subnodo-fila">' +
            '<button class="av-subnodo av-subnodo--' + estadoR + '" type="button"' +
              ' data-i="' + i + '" data-j="' + j + '" data-r="' + k + '"' +
              ' aria-label="' + etiquetaR + '" title="' + etiquetaR + '"' +
              (abiertaR ? '' : ' disabled aria-disabled="true"') + '>' +
              '<span class="av-subnodo-punto" aria-hidden="true">' + iconoR + '</span>' +
              '<span class="av-subnodo-txt">' +
                '<b>Ronda ' + (k + 1) + ' · ' + r.titulo + '</b>' +
                '<small>' + r.resumen + '</small>' +
              '</span>' +
              '<span class="av-subnodo-estado">' + estadoTxt + '</span>' +
            '</button></li>';
        }).join('');
        html +=
          '<li class="av-nodo-fila">' +
            '<button class="av-nodo av-nodo--' + clase + '" type="button" data-i="' + i + '" data-j="' + j + '"' +
              ' aria-label="' + etiqueta + '"' +
              (abiertaL ? '' : ' disabled aria-disabled="true"') +
              ' title="' + (abiertaL ? (hechaL ? 'Repasar este comando' : 'Seguir con este comando') : 'Termina el nodo anterior para abrir este') + '">' +
              '<span class="av-nodo-anillo">' +
                (abiertaL ? anillo(hechasL, total) : '') +
                '<span class="av-nodo-circulo" aria-hidden="true">' + icono + '</span>' +
              '</span>' +
              '<span class="av-nodo-txt"><b>' + l.titulo + '</b><small>' + l.comando + ' · ' +
                total + (total === 1 ? ' ronda' : ' rondas') + '</small></span>' +
              (abiertaL ? '<span class="av-nodo-rondas" title="' + hechasL + ' de ' + total + ' rondas hechas">' +
                hechasL + '/' + total + '</span>' : '') +
              '<span class="av-nodo-flecha" aria-hidden="true">›</span>' +
            '</button>' +
            '<ol class="av-subnodos">' + subnodos + '</ol>' +
          '</li>';
      });

      html += '</ol>' +
        '<div class="av-reto' + (retoListo ? ' av-reto--listo' : '') + '">' +
          '<span class="av-reto-ico" aria-hidden="true">' + ICO.trofeo + '</span>' +
          '<div class="av-reto-txt">' +
            '<b>Reto · ' + m.titulo + '</b>' +
            '<small>' + (reto && reto.hecho
              ? 'Superado' + (reto.aciertos != null ? ' · ' + reto.aciertos + '/' + reto.total + ' a la primera' : '') + '. Puedes repetirlo.'
              : (retoCompleto ? 'Mezcla lo aprendido en este mundo. Sin castigo y con menos pistas.'
                : (modoRey() ? 'Disponible con Modo rey. No da puntos.' : 'Se abre al completar los ' + m.lecciones.length + ' nodos del mundo.'))) + '</small>' +
          '</div>' +
          '<button class="av-btn ' + (retoListo ? 'av-btn--principal' : 'av-btn--fantasma') + ' av-reto-btn" type="button"' +
            ' data-reto="' + i + '"' + (retoListo ? '' : ' disabled aria-disabled="true"') + '>' +
            (reto && reto.hecho ? 'Repetir' : (retoListo ? 'Empezar' : ICO.candado + ' Bloqueado')) +
          '</button>' +
        '</div>' +
      '</li>';
    });

    html += '</ol>' +
      '<div class="av-mapa-pie">' +
        '<button class="av-enlace" type="button" id="av-exportar">' + ICO.descargar + ' Exportar progreso</button>' +
        '<span class="av-pie-sep" aria-hidden="true">·</span>' +
        '<button class="av-enlace" type="button" id="av-importar">' + ICO.subir + ' Importar</button>' +
        '<span class="av-pie-sep" aria-hidden="true">·</span>' +
        '<button class="av-enlace" type="button" id="av-reiniciar">Reiniciar aventura y borrar el progreso</button>' +
        '<span class="av-pie-sep" aria-hidden="true">·</span>' +
        '<button class="av-enlace av-enlace--rey" type="button" id="av-modo-rey" aria-pressed="' + modoRey() + '">' +
          ICO.corona + ' ' + (modoRey() ? 'Salir del Modo rey' : 'Modo rey') +
        '</button>' +
      '</div>' +
      '<p class="av-pie-nota" id="av-pie-nota" hidden></p>' +
      '<input type="file" id="av-archivo" accept="application/json,.json" hidden>' +
      '</div>';

    cuerpo.innerHTML = html;
    cuerpo.scrollTop = 0;

    byId('av-seguir').onclick = () => {
      const s = siguientePendiente();
      if (s) abrirLeccion(s.i, s.j);
      else abrirLeccion(0, 0);
    };
    byId('av-stats').onclick = () => { vista = { tipo: 'stats' }; pintar(); };
    byId('av-glosario').onclick = () => { vista = { tipo: 'glosario' }; pintar(); };
    byId('av-exportar').onclick = exportarProgreso;
    byId('av-importar').onclick = () => byId('av-archivo').click();
    byId('av-archivo').onchange = importarProgreso;
    byId('av-reiniciar').onclick = () => {
      const extra = modoRey() ? '\n\nTambién se desactivará el Modo rey.' : '';
      if (!window.confirm('¿Borrar el progreso de la aventura (rondas, puntos, retos, estadísticas y racha)?' + extra)) return;
      av.xp = 0; av.racha = { dias: 0, ultima: '' }; av.lecciones = {}; av.retos = {};
      av.modoRey = false;
      av.stats = { intentos: 0, aciertos: 0, primerIntento: 0, primerAcierto: 0, tests: 0, testsOk: 0, ayudas: 0, segundos: 0 };
      guardar();
      pintar();
      decir('Progreso de la aventura borrado.');
    };
    byId('av-modo-rey').onclick = () => {
      av.modoRey = !modoRey();
      guardar();
      pintar();
      notaPie(av.modoRey
        ? 'Modo rey activado: todos los niveles abiertos y sin puntos.'
        : 'Modo rey desactivado.');
      decir(av.modoRey ? 'Modo rey activado.' : 'Modo rey desactivado.');
    };
    cuerpo.querySelectorAll('[data-world-reset]').forEach(b => {
      b.onclick = () => reiniciarMundo(Number(b.dataset.worldReset));
    });
    cuerpo.querySelectorAll('.av-reto-btn').forEach(b => {
      b.onclick = () => abrirExamen(Number(b.dataset.reto));
    });
    cuerpo.querySelectorAll('.av-nodo').forEach(b => {
      b.onclick = () => abrirLeccion(Number(b.dataset.i), Number(b.dataset.j));
    });
    cuerpo.querySelectorAll('.av-subnodo').forEach(b => {
      b.onclick = () => {
        const i = Number(b.dataset.i), j = Number(b.dataset.j), r = Number(b.dataset.r);
        const def = leccionDe(i, j);
        // Una ronda ya hecha se abre en modo repaso: se puede ver otra vez,
        // pero no vuelve a dar puntos ni toca el progreso guardado.
        const repaso = estaHecha(def.id) || r < rondasHechas(def.id);
        abrirLeccion(i, j, { ronda: r, repaso: repaso });
      };
    });
  }

  /* ---- Pantalla: estadísticas ---- */
  function duracion(seg) {
    seg = Math.max(0, Math.round(seg));
    const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
    if (h) return h + ' h ' + m + ' min';
    if (m) return m + ' min ' + s + ' s';
    return s + ' s';
  }

  function pintarStats() {
    montada = null;
    pie.hidden = true;
    pie.innerHTML = '';
    const st = av.stats;
    const ahora = inicioSesion ? Math.round((Date.now() - inicioSesion) / 1000) : 0;
    const seg = (Number(st.segundos) || 0) + ahora;
    const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
    const precision = pct(st.aciertos, st.intentos);
    const primer = pct(st.primerAcierto, st.primerIntento);
    const tests = pct(st.testsOk, st.tests);
    const nHechas = hechas(), rHechas = rondasTotalesHechas();
    const retos = DATOS.mundos.filter(m => av.retos[m.id] && av.retos[m.id].hecho).length;

    const tarjeta = (icono, valor, etiqueta, nota) =>
      '<div class="av-stat">' +
        '<span class="av-stat-ico" aria-hidden="true">' + icono + '</span>' +
        '<b class="av-stat-valor">' + valor + '</b>' +
        '<span class="av-stat-etiqueta">' + etiqueta + '</span>' +
        (nota ? '<small class="av-stat-nota">' + nota + '</small>' : '') +
      '</div>';

    cuerpo.innerHTML =
      '<section class="av-panel">' +
        '<button class="av-enlace av-volver" type="button" id="av-volver">← Volver al mapa</button>' +
        '<p class="av-kicker">Tu recorrido</p>' +
        '<h2 class="av-titulo">Estadísticas</h2>' +
        '<p class="av-panel-texto">Solo cuenta lo que haces en este navegador. Aquí no se resta nada: los fallos son intentos, no castigos.</p>' +
        (modoRey() ? '<p class="av-rey-aviso av-rey-aviso--panel">' + ICO.corona + '<span><b>Modo rey activo:</b> las rondas y retos completados sí cuentan, pero no suman puntos.</span></p>' : '') +
        '<div class="av-stats-grid">' +
          tarjeta(ICO.estrella, av.xp || 0, 'puntos', 'Se ganan con cada ronda y reto.') +
          tarjeta(ICO.libro, nHechas + ' / ' + totalLecciones, 'nodos completados', 'Cada comando es un nodo.') +
          tarjeta(ICO.check, rHechas + ' / ' + totalRondas, 'rondas superadas', 'Las rondas se llenan una a una.') +
          tarjeta(ICO.trofeo, retos + ' / ' + DATOS.mundos.length, 'retos superados', 'Un reto por mundo.') +
          tarjeta(ICO.grafico, precision + '%', 'aciertos al enviar', st.aciertos + ' de ' + st.intentos + ' comandos enviados.') +
          tarjeta(ICO.bombilla, primer + '%', 'a la primera', st.primerAcierto + ' de ' + st.primerIntento + ' primeros intentos.') +
          tarjeta(ICO.check, tests + '%', 'tests acertados', st.testsOk + ' de ' + st.tests + ' preguntas contestadas.') +
          tarjeta(ICO.fuego, av.racha.dias || 0, av.racha.dias === 1 ? 'día seguido' : 'días seguidos', 'Se mantiene practicando cada día.') +
          tarjeta(ICO.bombilla, st.ayudas || 0, 'ayudas pedidas', 'Pedir ayuda también es aprender.') +
          tarjeta(ICO.brujula, duracion(seg), 'tiempo practicando', 'Tiempo con la aventura abierta.') +
        '</div>' +
        '<p class="av-panel-nota">Los datos se guardan en este navegador. Puedes exportarlos desde el mapa para no perderlos.</p>' +
      '</section>';
    cuerpo.scrollTop = 0;
    byId('av-volver').onclick = irAlMapa;
  }

  /* ---- Pantalla: glosario buscable ---- */
  const textoHtml = h => {
    const d = document.createElement('div');
    d.innerHTML = String(h == null ? '' : h).replace(/<\/(p|li|ul|ol|div|h[1-6]|details|pre)>/gi, ' ');
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  };
  const recortar = (t, n) => {
    t = String(t || '').trim();
    return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t;
  };
  const primeraFrase = (t, n) => {
    const m = /^(.+?[.!?])(\s|$)/.exec(t);
    return recortar(m ? m[1] : t, n || 220);
  };

  let glosarioCache = null;
  function glosario() {
    if (glosarioCache) return glosarioCache;
    const items = [], vistos = new Set();
    const meter = (t, sub, mundo, d) => {
      const clave = sinTildes(t);
      if (!t || !d || vistos.has(clave)) return;
      vistos.add(clave);
      items.push({ t: t, sub: sub || '', mundo: mundo, d: d });
    };

    DATOS.mundos.forEach((m, i) => {
      const etiquetaMundo = 'Mundo ' + (i + 1) + ' · ' + m.titulo;
      m.lecciones.forEach(l => {
        let descripcion = '';
        const codigos = [];
        l.rondas.forEach(r => r.pantallas.forEach(p => {
          if (p.tipo !== 'teoria') return;
          const texto = textoHtml(p.html);
          if (!descripcion) descripcion = primeraFrase(texto, 240);
          const re = /<code>([\s\S]*?)<\/code>/g;
          let mm;
          while ((mm = re.exec(p.html || ''))) {
            const codigo = textoHtml(mm[1]);
            const opcion = /^--?[A-Za-z][\w-]*$/.test(codigo) || codigo === '-0';
            const variable = /^\$[A-Za-z_?][\w?]*$/.test(codigo);
            const simbolo = ['{}', '{ }', '|', '>>', '2>', '&&', '||'].includes(codigo);
            if (codigo && codigo.length <= 24 && (opcion || variable || simbolo)) codigos.push(codigo);
          }
        }));
        meter(l.comando === 'teclado' ? l.titulo : l.comando, l.titulo, etiquetaMundo,
          descripcion || l.resumen);

        // Argumentos y piezas de código que aparecen en la teoría, con la
        // frase que los explica. Así el glosario cubre -n, -exec, -print0...
        codigos.forEach(codigo => {
          if (codigo === l.comando) return;
          l.rondas.forEach(r => r.pantallas.forEach(p => {
            if (p.tipo !== 'teoria') return;
            const texto = textoHtml(p.html);
            const trozos = texto.split(/(?<=[.!?])\s+/);
            const frase = trozos.find(t => t.includes(codigo));
            if (frase) meter(codigo, l.titulo, etiquetaMundo, recortar(frase, 220));
          }));
        });

        // Atajos de teclado: se buscan por su nombre y por su utilidad.
        l.rondas.forEach(r => r.pantallas.forEach(p => {
          if (p.tipo !== 'teclas') return;
          const combo = comboTexto(p.combo).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          meter(combo, p.titulo, etiquetaMundo, p.explica || p.pista || 'Atajo de teclado.');
        }));
      });
    });

    if (Array.isArray(DATOS.glosario)) {
      DATOS.glosario.forEach(g => {
        if (g && g.t) meter(g.t, g.sub || '', g.mundo || 'Extra', g.d || g.texto || '');
      });
    }
    items.sort((a, b) => a.t.localeCompare(b.t, 'es', { numeric: true }));
    glosarioCache = items;
    return items;
  }

  function pintarGlosario() {
    montada = null;
    pie.hidden = true;
    pie.innerHTML = '';
    const items = glosario();
    cuerpo.innerHTML =
      '<section class="av-panel av-panel--glos">' +
        '<button class="av-enlace av-volver" type="button" id="av-volver">← Volver al mapa</button>' +
        '<p class="av-kicker">Consulta rápida</p>' +
        '<h2 class="av-titulo">Glosario</h2>' +
        '<p class="av-panel-texto">Comandos, argumentos y atajos que salen en la aventura. Busca sin tildes y sin preocuparte por las mayúsculas.</p>' +
        '<div class="av-buscador">' +
          '<label class="sr-only" for="av-glos-buscar">Buscar en el glosario</label>' +
          '<input id="av-glos-buscar" type="search" autocomplete="off" placeholder="Busca: grep, -n, find, Ctrl+R…">' +
        '</div>' +
        '<p class="av-glos-cuenta" id="av-glos-cuenta">' + items.length + ' entradas</p>' +
        '<ul class="av-glos-lista" id="av-glos-lista">' +
          items.map(it =>
            '<li class="av-glos-item" data-buscar="' + escapar(sinTildes(it.t + ' ' + it.sub + ' ' + it.mundo + ' ' + it.d) + ' ' + sinTildes(it.t).replace(/\s+/g, '')) + '">' +
              '<div class="av-glos-cab">' +
                '<b class="av-glos-term">' + escapar(it.t) + '</b>' +
                '<span class="av-glos-mundo">' + escapar(it.mundo) + '</span>' +
              '</div>' +
              (it.sub ? '<small class="av-glos-sub">' + escapar(it.sub) + '</small>' : '') +
              '<p class="av-glos-def">' + escapar(it.d) + '</p>' +
            '</li>').join('') +
        '</ul>' +
        '<p class="av-glos-vacio" id="av-glos-vacio" hidden>No hay ninguna entrada que coincida. Prueba con otra palabra.</p>' +
      '</section>';
    cuerpo.scrollTop = 0;
    byId('av-volver').onclick = irAlMapa;

    const inp = byId('av-glos-buscar');
    const cuenta = byId('av-glos-cuenta');
    const lista = byId('av-glos-lista');
    const vacio = byId('av-glos-vacio');
    const filtrar = () => {
      const q = sinTildes(inp.value.trim());
      let n = 0;
      lista.querySelectorAll('.av-glos-item').forEach(el => {
        const vale = !q || el.dataset.buscar.includes(q);
        el.hidden = !vale;
        if (vale) n++;
      });
      cuenta.textContent = q
        ? n + ' de ' + items.length + ' entradas'
        : items.length + ' entradas';
      vacio.hidden = n > 0;
    };
    inp.addEventListener('input', filtrar);
    inp.addEventListener('search', filtrar);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Escape' && inp.value) {
        e.preventDefault();
        e.stopPropagation();
        inp.value = '';
        filtrar();
      }
    });
  }

  /* ---- Abrir un nodo o una ronda concreta ---- */
  function abrirLeccion(i, j, opciones) {
    abrirNodo(leccionDe(i, j), i, j, opciones);
  }

  function abrirNodo(def, i, j, opciones) {
    const g = progresoDe(def.id);
    const total = def.rondas.length;
    const completado = rondasHechas(def.id) >= total;
    const esExamen = !!(opciones && opciones.examen);
    if (!esExamen) retoActual = null;
    const forzada = opciones && opciones.ronda != null;
    const repaso = esExamen ? false : (opciones ? !!opciones.repaso : completado);
    const rondaIdx = forzada
      ? Math.min(total - 1, Math.max(0, Number(opciones.ronda) || 0))
      : (repaso ? 0 : Math.min(total - 1, Math.max(0, Number(g.ronda) || 0)));
    const ronda = def.rondas[rondaIdx];
    const pantalla = (opciones && opciones.pantalla != null)
      ? Math.min(ronda.pantallas.length - 1, Math.max(0, Number(opciones.pantalla) || 0))
      : (repaso ? 0 : Math.min(ronda.pantallas.length - 1, Math.max(0, Number(g.pantalla) || 0)));

    lec = {
      i: i, j: j, def: def, rondaIdx: rondaIdx, ronda: ronda, repaso: repaso,
      examen: esExamen,
      baseHechas: completado ? total : rondasHechas(def.id),
      estado: crearEstado({ inicio: Object.assign({}, def.inicio || {}, ronda.inicio || {}) }),
      pantalla: pantalla,
      hist: [], mem: [], memI: 0,
      ayuda: 0, acierto: false, xp: 0, elegida: null, aviso: '', explica: '',
      ayudaTexto: '', histHTML: '', paso: false,
      salidaAcum: '', intentos: 0, testFallos: 0, testVisto: false, estadoInicial: null
    };

    // Un ejercicio del reto puede necesitar el mundo que dejaron las
    // prácticas anteriores de su ronda: se repiten en silencio.
    if (esExamen && Array.isArray(ronda.previas) && ronda.previas.length) {
      ejecutarEn(lec.estado, ronda.previas);
    }

    // Al retomar una ronda, se repiten en silencio las prácticas ya hechas
    // para llegar al mismo mundo virtual en el que se quedó.
    if (!esExamen) {
      for (let k = 0; k < pantalla; k++) {
        const p = ronda.pantallas[k];
        if (p.tipo === 'practica') ejecutarEn(lec.estado, p.ejemplo);
      }
    }

    // Reanudar exactamente donde se quedó: estado, terminal y respuesta.
    const mismaPantalla = !esExamen && !repaso && !forzada && Number(g.ronda) === rondaIdx && Number(g.pantalla) === pantalla;
    const snap = mismaPantalla && g.snapshot ? g.snapshot : null;
    if (snap) {
      if (snap.estado) lec.estado = clonar(snap.estado);
      lec.hist = Array.isArray(snap.hist) ? snap.hist.slice() : [];
      lec.mem = Array.isArray(snap.mem) ? snap.mem.slice() : [];
      lec.memI = lec.mem.length;
      lec.acierto = !!snap.acierto;
      lec.elegida = snap.elegida != null ? snap.elegida : null;
      lec.explica = snap.explica || '';
      lec.ayuda = Number(snap.ayuda) || 0;
      lec.ayudaTexto = snap.ayudaTexto || '';
      lec.aviso = snap.aviso || '';
      lec.paso = !!snap.paso;
      lec.salidaAcum = snap.salidaAcum || '';
      lec.intentos = Number(snap.intentos) || 0;
      lec.testFallos = Number(snap.testFallos) || 0;
      lec.histHTML = '';
      respuesta = g.entrada != null ? String(g.entrada) : (snap.entrada != null ? String(snap.entrada) : '');
    } else {
      respuesta = mismaPantalla && g.entrada ? String(g.entrada) : '';
    }

    montada = null;
    vista = { tipo: 'leccion' };
    pintar();
  }

  /* ---- Reto de mundo: examen con prácticas y tests mezclados ---- */
  function construirExamen(i) {
    const mundo = mundoDe(i);
    const rondas = [];
    mundo.lecciones.forEach(l => {
      let elegida = null;
      l.rondas.forEach(r => {
        const previas = [];
        r.pantallas.forEach(p => {
          if (p.tipo !== 'practica') return;
          elegida = { ronda: r, pantalla: p, previas: previas.slice() };
          for (const c of [].concat(p.ejemplo)) previas.push(c);
        });
      });
      if (!elegida) {
        let test = null;
        l.rondas.forEach(r => r.pantallas.forEach(p => { if (p.tipo === 'test') test = p; }));
        if (!test) return;
        rondas.push({
          titulo: l.titulo,
          resumen: l.resumen,
          inicio: Object.assign({}, l.inicio || {}),
          previas: [],
          pantallas: [test]
        });
        return;
      }
      const pantallas = [elegida.pantalla];
      let test = null;
      l.rondas.forEach(r => r.pantallas.forEach(p => { if (p.tipo === 'test') test = p; }));
      if (test) pantallas.push(test);
      rondas.push({
        titulo: l.titulo,
        resumen: l.resumen,
        inicio: Object.assign({}, l.inicio || {}, elegida.ronda.inicio || {}),
        previas: elegida.previas,
        pantallas: pantallas
      });
    });
    return { id: 'reto-' + mundo.id, titulo: 'Reto · ' + mundo.titulo, rondas: rondas };
  }

  function abrirExamen(i) {
    const hecho = !!(av.retos[mundoDe(i).id] && av.retos[mundoDe(i).id].hecho);
    if (!modoRey() && (!mundoAbierto(i) || (!mundoHecho(i) && !hecho))) return;
    const def = construirExamen(i);
    if (!def.rondas.length) return;
    retoActual = { i: i, aciertos: 0 };
    abrirNodo(def, i, null, { examen: true, ronda: 0 });
  }

  function reiniciarMundo(i) {
    const mundo = mundoDe(i);
    if (!mundo) return;
    if (!window.confirm('¿Reiniciar solo el Mundo ' + (i + 1) + ' · ' + mundo.titulo + '?\n\nSe borran sus nodos, su reto y sus respuestas guardadas. Los puntos y las estadísticas se conservan.')) return;
    mundo.lecciones.forEach(l => { delete av.lecciones[l.id]; });
    delete av.retos[mundo.id];
    guardar();
    vista = { tipo: 'mapa' };
    pintar();
    notaPie('Mundo ' + (i + 1) + ' reiniciado. Los puntos siguen ahí.');
    decir('Mundo ' + (i + 1) + ' reiniciado.');
  }

  /* ---- Copia de seguridad del progreso ---- */
  function exportarProgreso() {
    flushEntrada();
    const sobre = { app: 'aventura-linux', version: 3, exportado: new Date().toISOString(), datos: av };
    const blob = new Blob([JSON.stringify(sobre, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aventura-linux-' + fecha(new Date()) + '.json';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    notaPie('Progreso exportado. Guarda el archivo donde quieras.');
    decir('Progreso exportado.');
  }

  function importarProgreso(ev) {
    const input = ev && ev.target;
    const archivo = input && input.files && input.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      let sobre = null;
      try { sobre = JSON.parse(String(lector.result)); } catch (e) { sobre = null; }
      const datos = sobre && sobre.app === 'aventura-linux' ? sobre.datos : null;
      if (!datos || typeof datos !== 'object') {
        window.alert('Ese archivo no es una copia de la aventura. Debe ser el JSON que genera «Exportar progreso».');
        return;
      }
      if (!window.confirm('Se sustituirá el progreso actual por el del archivo.\n\n¿Continuar?')) return;
      const nuevo = normalizarDatos(datos);
      av.version = nuevo.version;
      av.xp = nuevo.xp;
      av.racha = nuevo.racha;
      av.lecciones = nuevo.lecciones;
      av.retos = nuevo.retos;
      av.modoRey = nuevo.modoRey;
      av.stats = nuevo.stats;
      guardar();
      lec = null;
      retoActual = null;
      vista = { tipo: 'mapa' };
      pintar();
      notaPie('Progreso importado correctamente.');
      decir('Progreso importado.');
    };
    lector.onerror = () => window.alert('No se ha podido leer el archivo.');
    lector.readAsText(archivo);
    if (input) input.value = '';
  }

  function notaPie(texto) {
    const nota = byId('av-pie-nota');
    if (nota) { nota.textContent = texto; nota.hidden = false; }
  }

  function ejecutarEn(estado, cmds) {
    let out = '';
    for (const c of [].concat(cmds)) {
      const r = ejecutarLinea(estado, c);
      const trozo = (r.out || '') + (r.err || '');
      if (trozo && out && !out.endsWith('\n')) out += '\n';
      out += trozo;
    }
    return out;
  }

  /* ---- Bloque de ejemplo (teoría) ---- */
  function bloqueEjemplo(cmds, estado) {
    const e = clonar(estado);
    const salida = ejecutarEn(e, cmds);
    const guion = [].concat(cmds)
      .map(c => '<span class="av-dollar">$</span> ' + escapar(c))
      .join('\n');
    const limpia = limpiar(salida).trim();
    const cuerpoSalida = limpia
      ? salida
      : '<span class="av-nada">(sin salida: cuando algo funciona bien, Linux no dice nada)</span>';
    return '<div class="av-ejemplo">' +
        '<div class="av-ejemplo-cab">Ejemplo</div>' +
        '<pre>' + guion + '\n' + cuerpoSalida + '</pre>' +
      '</div>';
  }

  const chipMundo = () => {
    const mundo = mundoDe(lec.i);
    return '<span class="av-chip">' + iconoMundo(mundo) + ' Mundo ' + (lec.i + 1) + ' · ' + escapar(mundo.titulo) + '</span>' +
      '<span class="av-chip av-chip--suave">' + escapar(lec.def.titulo) + '</span>' +
      '<span class="av-chip av-chip--ronda">' + (lec.examen ? 'Ejercicio ' : 'Ronda ') + (lec.rondaIdx + 1) + ' de ' + lec.def.rondas.length + '</span>' +
      (lec.examen ? '<span class="av-chip av-chip--reto">Reto</span>' : '') +
      (lec.repaso ? '<span class="av-chip av-chip--repaso">Repaso</span>' : '') +
      (modoRey() ? '<span class="av-chip av-chip--rey">' + ICO.corona + ' Modo rey</span>' : '');
  };

  /* ---- Pantalla: lección ---- */
  function clavePantalla() {
    return lec.def.id + '#' + lec.rondaIdx + '#' + lec.pantalla + (lec.repaso ? '#r' : '');
  }

  function pintarLeccion() {
    const p = lec.ronda.pantallas[lec.pantalla];
    const clave = clavePantalla();
    if (montada !== clave) {
      montarPantalla(p);
      montada = clave;
    }
    actualizarPantalla(p);
    pintarCabecera();
  }

  function montarPantalla(p) {
    cuerpo.scrollTop = 0;
    lec.histHTML = '';

    if (p.tipo === 'teoria') {
      cuerpo.innerHTML =
        '<article class="av-tarjeta av-nueva">' +
          '<div class="av-tarjeta-cab">' + chipMundo() + '</div>' +
          '<h2 class="av-titulo">' + p.titulo + '</h2>' +
          '<div class="av-texto">' + p.html + '</div>' +
          (p.ejemplo ? bloqueEjemplo(p.ejemplo, lec.estado) : '') +
          (p.mas ? '<details class="av-porque"><summary>¿Por qué?</summary><div class="av-porque-txt">' + p.mas + '</div></details>' : '') +
        '</article>';
      montarPie('teoria');
      return;
    }

    if (p.tipo === 'teclas') {
      cuerpo.innerHTML =
        '<article class="av-tarjeta av-nueva">' +
          '<div class="av-tarjeta-cab">' + chipMundo() + '<span class="av-chip av-chip--teclas">Atajos</span></div>' +
          '<h2 class="av-titulo">' + p.titulo + '</h2>' +
          '<p class="av-pide">' + p.pide + '</p>' +
          '<div class="av-teclas-demo" id="av-teclas-demo" aria-live="polite"></div>' +
          '<button class="av-tecla-zona" id="av-tecla-zona" type="button">' +
            '<span class="av-tecla-icono" aria-hidden="true">' + ICO.llave + '</span>' +
            '<span id="av-tecla-zona-txt">Pulsa aquí y haz el atajo</span>' +
          '</button>' +
          '<div id="av-feedback"></div>' +
        '</article>';
      montarPie('teclas');
      const zona = byId('av-tecla-zona');
      if (zona) {
        zona.focus();
        zona.onkeydown = probarTecla;
      }
      return;
    }

    if (p.tipo === 'practica') {
      lec.estadoInicial = clonar(lec.estado);
      const ej = [].concat(p.ejemplo).map(escapar).join(' ; ');
      cuerpo.innerHTML =
        '<article class="av-tarjeta av-nueva">' +
          '<div class="av-tarjeta-cab">' + chipMundo() + '</div>' +
          '<h2 class="av-titulo">' + p.titulo + '</h2>' +
          '<p class="av-pide">' + p.pide + '</p>' +
          (lec.examen
            ? '<p class="av-reto-nota">' + ICO.trofeo + ' Reto: sin ejemplo. Usa lo que has aprendido; si te atascas, pide una pista.</p>'
            : '<p class="av-hazlo"><span>Escribe esto</span><code>' + ej + '</code></p>') +
          '<div class="av-term">' +
            '<div class="av-term-cab">Terminal</div>' +
            '<div class="av-pantalla" id="av-pantalla"></div>' +
            '<div class="av-linea">' +
              '<span class="av-prompt" id="av-prompt">' + promptHtml(rutaVisible(lec.estado.cwd)) + '</span>' +
              '<input id="av-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
                'aria-label="Escribe un comando" enterkeyhint="send">' +
            '</div>' +
          '</div>' +
          '<div id="av-feedback"></div>' +
        '</article>';
      montarPie('practica');
      const inp = byId('av-in');
      inp.value = respuesta;
      inp.oninput = () => { respuesta = inp.value; guardarEntrada(); };
      inp.onkeydown = teclaTerminal;
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
      return;
    }

    /* test */
    const opciones = p.opciones.map((o, k) =>
      '<button class="av-op" type="button" data-k="' + k + '">' +
        '<span class="av-op-letra" aria-hidden="true">' + String.fromCharCode(65 + k) + '</span>' +
        '<span class="av-op-txt">' + o.t + '</span>' +
        '<span class="av-op-marca" aria-hidden="true"></span>' +
      '</button>').join('');
    cuerpo.innerHTML =
      '<article class="av-tarjeta av-nueva">' +
        '<div class="av-tarjeta-cab">' + chipMundo() + '<span class="av-chip av-chip--test">Test</span></div>' +
        '<h2 class="av-titulo">' + p.pregunta + '</h2>' +
        '<div class="av-opciones">' + opciones + '</div>' +
        '<div id="av-explica" hidden></div>' +
      '</article>';
    cuerpo.querySelectorAll('.av-op').forEach(b => {
      b.onclick = () => elegir(Number(b.dataset.k));
    });
    montarPie('test');
  }

  /* ---- Actualizaciones sin volver a montar la tarjeta ---- */
  function actualizarPantalla(p) {
    if (p.tipo === 'teoria') {
      const sig = byId('av-sig');
      if (sig) sig.disabled = false;
      return;
    }

    if (p.tipo === 'teclas') {
      const demo = byId('av-teclas-demo');
      if (demo) {
        const lineas = lec.acierto ? (p.demo && p.demo.despues) : (p.demo && p.demo.antes);
        demo.innerHTML = [].concat(lineas || [])
          .map(l => '<div class="av-teclas-linea">' + escapar(l) + '</div>').join('');
        demo.classList.toggle('av-teclas-demo--ok', !!lec.acierto);
      }
      const zona = byId('av-tecla-zona');
      if (zona) {
        zona.disabled = !!lec.acierto;
        zona.classList.toggle('av-tecla-zona--ok', !!lec.acierto);
        const txt = byId('av-tecla-zona-txt');
        if (txt) txt.textContent = lec.acierto ? '¡Atajo correcto!' : 'Pulsa aquí y haz el atajo';
      }
      let fb = '';
      if (lec.acierto) {
        fb += '<div class="av-msg av-msg--ok"><span class="av-msg-icono" aria-hidden="true">' + ICO.check + '</span>' +
          '<div><b>¡Eso es!</b> ' + (p.explica || 'Atajo correcto.') + '</div></div>';
      } else if (lec.aviso) {
        fb += '<div class="av-msg av-msg--paso"><span class="av-msg-icono" aria-hidden="true">i</span><div>' + lec.aviso + '</div></div>';
      }
      if (lec.ayudaTexto && !lec.acierto) {
        fb += '<div class="av-msg av-msg--pista"><span class="av-msg-icono" aria-hidden="true">' + ICO.bombilla + '</span>' +
          '<div><b>Pista.</b> ' + lec.ayudaTexto + '</div></div>';
      }
      const caja = byId('av-feedback');
      if (caja && caja.innerHTML !== fb) caja.innerHTML = fb;
      const ayuda = byId('av-ayuda-btn');
      if (ayuda) ayuda.hidden = !!lec.acierto;
      const sig = byId('av-sig');
      if (sig) sig.disabled = !lec.acierto;
      return;
    }

    if (p.tipo === 'practica') {
      const hist = lec.hist.length
        ? lec.hist.join('')
        : '<span class="av-vacio"># Escribe el comando y pulsa Enter.</span>\n';
      const papel = byId('av-pantalla');
      if (papel && hist !== lec.histHTML) {
        papel.innerHTML = hist;
        lec.histHTML = hist;
        destino('av-pantalla');
      }

      const prompt = byId('av-prompt');
      if (prompt) prompt.innerHTML = promptHtml(rutaVisible(lec.estado.cwd));

      const inp = byId('av-in');
      if (inp) {
        if (inp.value !== respuesta) {
          inp.value = respuesta;
          if (document.activeElement === inp) inp.setSelectionRange(inp.value.length, inp.value.length);
        }
        inp.disabled = !!lec.acierto;
      }

      let fb = '';
      if (lec.acierto) {
        fb += '<div class="av-msg av-msg--ok"><span class="av-msg-icono" aria-hidden="true">' + ICO.check + '</span>' +
          '<div><b>¡Eso es!</b> Muy bien.</div></div>';
      } else if (lec.aviso) {
        fb += '<div class="av-msg ' + (lec.paso ? 'av-msg--paso' : 'av-msg--mal') + '"><span class="av-msg-icono" aria-hidden="true">' +
          (lec.paso ? 'i' : '!') + '</span><div>' + lec.aviso + '</div></div>';
      }
      if (lec.ayudaTexto && !lec.acierto) {
        fb += '<div class="av-msg av-msg--pista"><span class="av-msg-icono" aria-hidden="true">' + ICO.bombilla + '</span>' +
          '<div><b>Pista.</b> ' + lec.ayudaTexto + '</div></div>';
      }
      if (!lec.acierto && lec.intentos > 0) {
        fb += '<p class="av-reiniciar-linea"><button class="av-enlace av-enlace--mini" type="button" id="av-reiniciar-pantalla">' +
          'Reiniciar este ejercicio</button></p>';
      }
      const caja = byId('av-feedback');
      if (caja && caja.innerHTML !== fb) {
        caja.innerHTML = fb;
        const reiniciar = byId('av-reiniciar-pantalla');
        if (reiniciar) reiniciar.onclick = reiniciarPantalla;
      }

      const ayuda = byId('av-ayuda-btn');
      if (ayuda) ayuda.hidden = !!lec.acierto;
      const sig = byId('av-sig');
      if (sig) sig.disabled = !lec.acierto;
      return;
    }

    /* test */
    cuerpo.querySelectorAll('.av-op').forEach(b => {
      const k = Number(b.dataset.k), o = p.opciones[k];
      const elegida = lec.elegida === k;
      b.classList.toggle('av-op--ok', elegida && !!o.ok);
      b.classList.toggle('av-op--mal', elegida && !o.ok);
      b.classList.toggle('av-op--off', !!lec.acierto && !elegida);
      b.disabled = !!lec.acierto;
      b.setAttribute('aria-pressed', String(elegida));
      const marca = b.querySelector('.av-op-marca');
      if (marca) marca.textContent = elegida ? (o.ok ? '✓' : '✕') : '';
    });

    const ex = byId('av-explica');
    if (ex) {
      if (lec.explica) {
        ex.hidden = false;
        ex.className = 'av-explica' + (lec.acierto ? ' av-explica--bien' : '');
        if (ex.innerHTML !== lec.explica) ex.innerHTML = lec.explica;
      } else {
        ex.hidden = true;
      }
    }

    const sig = byId('av-sig');
    if (sig) sig.disabled = !lec.acierto;
  }

  /* ---- Pie de la lección ---- */
  function montarPie(tipo) {
    pie.hidden = false;
    pie.innerHTML =
      '<div class="av-pie-int">' +
        '<div class="av-pie-izq">' +
          '<button class="av-btn av-btn--fantasma" type="button" id="av-mapa" title="Volver al mapa">← Mapa</button>' +
          (tipo === 'practica' || tipo === 'teclas' ? '<button class="av-btn av-btn--ayuda" type="button" id="av-ayuda-btn">' + ICO.bombilla + ' Ayuda</button>' : '') +
        '</div>' +
        '<button class="av-btn av-btn--principal av-btn--sig" type="button" id="av-sig">Continuar</button>' +
      '</div>';
    byId('av-mapa').onclick = irAlMapa;
    if (tipo === 'practica' || tipo === 'teclas') byId('av-ayuda-btn').onclick = pedirAyuda;
    byId('av-sig').onclick = avanzar;
    if (tipo !== 'teoria') byId('av-sig').disabled = true;
  }

  function irAlMapa() {
    vista = { tipo: 'mapa' };
    respuesta = '';
    montada = null;
    pintar();
  }

  /* ---- Terminal de la práctica ---- */
  function teclaTerminal(e) {
    const inp = e.currentTarget;
    if (e.key === 'Enter') { e.preventDefault(); enviar(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      respuesta = inp.value;
      completarInput(inp, lec.estado, html => { lec.hist.push(html); pintar(); });
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === 'l') { e.preventDefault(); respuesta = inp.value; lec.hist = []; pintar(); }
      else if (k === 'c') {
        e.preventDefault();
        lec.hist.push(promptHtml(rutaVisible(lec.estado.cwd)) + escapar(inp.value) + '<span class="av-caret">^C</span>\n');
        respuesta = '';
        pintar();
      }
      else if (k === 'a') {
        e.preventDefault();
        inp.setSelectionRange(0, 0);
      }
      else if (k === 'e') {
        e.preventDefault();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
      else if (k === 'u' || k === 'k') {
        e.preventDefault();
        const pos = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
        inp.value = k === 'u' ? inp.value.slice(pos) : inp.value.slice(0, pos);
        respuesta = inp.value;
        const nuevo = k === 'u' ? 0 : inp.value.length;
        inp.setSelectionRange(nuevo, nuevo);
      }
      return;
    }
    if (e.altKey && e.key === '.') {
      e.preventDefault();
      const anterior = lec.mem[lec.mem.length - 1] || '';
      const trozos = anterior.trim().split(/\s+/).filter(Boolean);
      if (!trozos.length) return;
      const ultimo = trozos[trozos.length - 1];
      const ini = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
      const fin = inp.selectionEnd == null ? ini : inp.selectionEnd;
      inp.value = inp.value.slice(0, ini) + ultimo + inp.value.slice(fin);
      respuesta = inp.value;
      const pos = ini + ultimo.length;
      inp.setSelectionRange(pos, pos);
      return;
    }
    if (e.key === 'ArrowUp') {
      if (!lec.mem.length) return;
      e.preventDefault();
      lec.memI = Math.max(0, lec.memI - 1);
      inp.value = lec.mem[lec.memI];
      respuesta = inp.value;
      inp.setSelectionRange(inp.value.length, inp.value.length);
    } else if (e.key === 'ArrowDown') {
      if (!lec.mem.length) return;
      e.preventDefault();
      lec.memI = Math.min(lec.mem.length, lec.memI + 1);
      inp.value = lec.mem[lec.memI] || '';
      respuesta = inp.value;
    }
  }

  function enviar() {
    const inp = byId('av-in');
    if (!inp) return;
    const p = lec.ronda.pantallas[lec.pantalla];
    const crudo = inp.value;
    const linea = normalizar(crudo);
    if (!linea) return;

    lec.hist.push(promptHtml(rutaVisible(lec.estado.cwd)) + escapar(crudo) + '\n');
    lec.mem.push(crudo.trim()); lec.memI = lec.mem.length;
    lec.intentos++;
    cuenta('intentos');
    if (lec.intentos === 1) cuenta('primerIntento');

    const candidato = clonar(lec.estado);
    const r = ejecutarLinea(candidato, linea);
    const salida = (r.out || '') + (r.err || '');
    lec.hist.push(salida ? salida + '\n' : '');
    if (lec.hist.join('').split('\n').length > 220) lec.hist = lec.hist.slice(-120);

    // Primero se comprueba lo último que ha escrito. Si no llega, se prueba
    // con todo lo escrito en esta pantalla: así también vale hacerlo en dos
    // pasos (por ejemplo, "cd /etc" y después "pwd") en vez de en una línea.
    const v = comprobarMeta(candidato, p.meta, salida);
    let vale = v;
    let bien = v.ok && (r.code === 0 || !!p.toleraError);
    if (!bien && p.meta.salida == null && lec.salidaAcum) {
      const vAcum = comprobarMeta(candidato, p.meta, lec.salidaAcum + salida);
      if (vAcum.ok && (r.code === 0 || !!p.toleraError)) { bien = true; vale = vAcum; }
    }

    if (bien) {
      lec.estado = candidato;
      lec.acierto = true;
      lec.paso = false;
      lec.aviso = '';
      lec.ayudaTexto = '';
      respuesta = '';
      cuenta('aciertos');
      if (lec.intentos === 1 && lec.ayuda === 0) cuenta('primerAcierto');
      const gana = lec.ayuda > 0 ? 6 : 10;
      const puntos = lec.repaso ? 0 : sumarXp(gana);
      lec.xp += puntos;
      celebrar(puntos, false);
      decir('¡Correcto!');
    } else {
      const ejecutado = r.code === 0 || !!p.toleraError;
      if (ejecutado) {
        // El comando ha funcionado aunque todavía no sea la respuesta final:
        // se conserva el mundo y se limpia la línea para poder seguir.
        lec.estado = candidato;
        lec.salidaAcum += salida ? (salida.endsWith('\n') ? salida : salida + '\n') : '';
        respuesta = '';
        lec.paso = true;
        lec.aviso = '<b>Ese comando se ha ejecutado</b>, pero todavía no es el objetivo. ' +
          (vale.motivo || 'Todavía falta completar lo que pide este ejercicio.');
      } else {
        respuesta = crudo;   // si el comando falla, se deja escrito para corregirlo
        lec.paso = false;
        lec.aviso = lec.examen
          ? '<b>Todavía no.</b> ' + (vale.motivo || 'Ese comando no cumple el objetivo.') +
            (lec.ayuda ? '' : ' Pulsa <b>Ayuda</b> si necesitas una pista.')
          : (p.error || ('Casi: ' + (vale.motivo || 'eso no es lo que pide esta pantalla.') +
            ' <b>Mira el ejemplo de arriba y prueba otra vez.</b>'));
      }
      decir('Todavía no. ' + limpiar(lec.aviso));
    }
    pintar();
    guardarPunto();
    if (bien) byId('av-sig').focus();
  }

  function reiniciarPantalla() {
    if (!lec || !lec.estadoInicial) return;
    lec.estado = clonar(lec.estadoInicial);
    lec.hist = []; lec.mem = []; lec.memI = 0; lec.histHTML = '';
    lec.aviso = ''; lec.acierto = false; lec.elegida = null; lec.explica = '';
    lec.ayuda = 0; lec.ayudaTexto = ''; lec.paso = false;
    lec.salidaAcum = ''; lec.intentos = 0;
    respuesta = '';
    pintar();
    const inp = byId('av-in');
    if (inp) inp.focus();
    decir('Ejercicio reiniciado.');
  }

  function comboTexto(combo){
    const partes = [];
    if (combo.ctrl) partes.push('<kbd>Ctrl</kbd>');
    if (combo.alt) partes.push('<kbd>Alt</kbd>');
    if (combo.shift) partes.push('<kbd>Mayús</kbd>');
    const nombre = combo.key === 'ArrowUp' ? '↑' : combo.key === 'ArrowDown' ? '↓' :
      (String(combo.key).length === 1 ? String(combo.key).toUpperCase() : combo.key);
    partes.push('<kbd>' + escapar(nombre) + '</kbd>');
    return partes.join(' + ');
  }

  function teclaNombre(e){
    const partes = [];
    if (e.ctrlKey) partes.push('Ctrl');
    if (e.altKey) partes.push('Alt');
    if (e.shiftKey) partes.push('Mayús');
    const k = e.key === ' ' ? 'espacio' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
    partes.push(k);
    return partes.join(' + ');
  }

  function teclaCoincide(e, combo){
    if (!combo || !combo.key) return false;
    if (!!combo.ctrl !== !!e.ctrlKey || !!combo.alt !== !!e.altKey || !!combo.shift !== !!e.shiftKey) return false;
    const normal = k => k.length === 1 ? k.toLowerCase() : k;
    return normal(e.key) === normal(String(combo.key));
  }

  function probarTecla(e){
    const p = lec.ronda.pantallas[lec.pantalla];
    if (!p || p.tipo !== 'teclas' || lec.acierto) return;
    if (['Control','Alt','Shift','Meta'].includes(e.key)) return;
    e.preventDefault();
    if (teclaCoincide(e, p.combo)) {
      lec.acierto = true;
      lec.aviso = '';
      lec.ayudaTexto = '';
      if (!lec.repaso) {
        cuenta('intentos'); cuenta('aciertos');
        if (!lec.paso && lec.ayuda === 0) { cuenta('primerIntento'); cuenta('primerAcierto'); }
        else cuenta('primerIntento');
      }
      const gana = lec.ayuda > 0 ? 6 : 10;
      const puntos = lec.repaso ? 0 : sumarXp(gana);
      lec.xp += puntos;
      celebrar(puntos, false);
      decir('¡Atajo correcto!');
      pintar();
      const sig = byId('av-sig');
      if (sig) sig.focus();
      return;
    }
    lec.paso = true;
    if (!lec.repaso) cuenta('intentos');
    lec.aviso = 'Has pulsado <b>' + escapar(teclaNombre(e)) + '</b>. Ese no es el atajo de esta pantalla. ' +
      (lec.ayuda ? '' : 'Pulsa <b>Ayuda</b> si no lo recuerdas.');
    pintar();
    const zona = byId('av-tecla-zona');
    if (zona) zona.focus();
  }

  function pedirAyuda() {
    const p = lec.ronda.pantallas[lec.pantalla];
    if (p.tipo === 'teclas') {
      lec.ayuda = 1;
      lec.ayudaTexto = p.pista || ('El atajo es ' + comboTexto(p.combo) + '.');
      pintar();
      const zona = byId('av-tecla-zona');
      if (zona) zona.focus();
      return;
    }
    if (lec.ayuda === 0) {
      lec.ayuda = 1;
      lec.ayudaTexto = p.pista || ('Fíjate en el ejemplo de arriba: <code>' + escapar([].concat(p.ejemplo).join(' ; ')) + '</code>');
    } else if (lec.examen) {
      // En el reto solo hay una pista: no se escribe la respuesta por ti.
      lec.ayuda = 1;
      lec.ayudaTexto = (p.pista || 'Repasa la teoría del nodo y prueba con lo que recuerdes.') +
        ' <b>El reto no completa el comando por ti.</b>';
      lec.aviso = '';
    } else {
      lec.ayuda = 2;
      lec.ayudaTexto = 'Te lo escribo yo: ya solo tienes que pulsar Enter.';
      respuesta = [].concat(p.ejemplo).join('; ');
    }
    if (!lec.repaso) cuenta('ayudas');
    pintar();
    const inp = byId('av-in');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  }

  /* ---- Test ---- */
  function elegir(k) {
    if (lec.acierto) return;   // ya resuelto: volver a pulsar no vuelve a dar puntos
    const p = lec.ronda.pantallas[lec.pantalla];
    const o = p.opciones[k];
    if (!lec.testVisto) { lec.testVisto = true; if (!lec.repaso) cuenta('tests'); }
    lec.elegida = k;
    if (o.ok) {
      lec.acierto = true;
      lec.explica = o.porque;
      const puntos = lec.repaso ? 0 : sumarXp(5);
      lec.xp += puntos;
      if (!lec.repaso) cuenta('testsOk');
      celebrar(puntos, false);
      decir('¡Correcto! ' + limpiar(o.porque));
    } else {
      lec.testFallos++;
      lec.explica = o.porque;
      decir('No es esa. ' + limpiar(o.porque));
    }
    pintar();
    if (o.ok) byId('av-sig').focus();
  }

  /* ---- Avanzar y cerrar la ronda ---- */
  /* ---- Guardado exacto de la pantalla ---- */
  let tEntrada = 0;
  function guardarEntrada() {
    if (!lec || lec.repaso || lec.examen) return;
    clearTimeout(tEntrada);
    tEntrada = setTimeout(flushEntrada, 300);
  }
  function flushEntrada() {
    clearTimeout(tEntrada);
    tEntrada = 0;
    if (!lec || lec.repaso || lec.examen) return;
    const prev = progresoDe(lec.def.id);
    av.lecciones[lec.def.id] = Object.assign({}, prev, { entrada: respuesta });
    guardar();
  }

  function guardarPunto() {
    if (!lec || lec.repaso || lec.examen) return;
    const prev = progresoDe(lec.def.id);
    const p = lec.ronda.pantallas[lec.pantalla];
    const datos = {
      rondasHechas: Math.max(Number(prev.rondasHechas) || 0, lec.baseHechas),
      ronda: lec.rondaIdx,
      pantalla: lec.pantalla
    };
    if (p && p.tipo !== 'teoria') {
      datos.snapshot = {
        estado: lec.estado,
        acierto: lec.acierto,
        hist: lec.hist,
        mem: lec.mem,
        elegida: lec.elegida,
        explica: lec.explica,
        ayuda: lec.ayuda,
        ayudaTexto: lec.ayudaTexto,
        aviso: lec.aviso,
        paso: lec.paso,
        salidaAcum: lec.salidaAcum,
        intentos: lec.intentos,
        testFallos: lec.testFallos,
        entrada: respuesta
      };
    } else {
      datos.snapshot = null;
      datos.entrada = '';
    }
    av.lecciones[lec.def.id] = Object.assign({}, prev, datos);
    guardar();
  }

  function avanzar() {
    if (lec.pantalla + 1 >= lec.ronda.pantallas.length) return cerrarRonda();
    lec.pantalla++;
    lec.acierto = false; lec.elegida = null; lec.ayuda = 0; lec.ayudaTexto = '';
    lec.aviso = ''; lec.explica = ''; lec.paso = false;
    lec.hist = []; lec.mem = []; lec.memI = 0; lec.histHTML = '';
    lec.salidaAcum = ''; lec.intentos = 0; lec.estadoInicial = null;
    lec.testVisto = false;
    respuesta = '';
    guardarPunto();
    montada = null;
    pintar();
  }

  function cerrarRonda() {
    const def = lec.def, total = def.rondas.length;
    const ultima = lec.rondaIdx + 1 >= total;

    if (lec.examen) {
      if (retoActual) {
        const p = lec.ronda.pantallas[lec.pantalla];
        const primer = p && p.tipo === 'test'
          ? (lec.testFallos === 0 && lec.ayuda === 0)
          : (lec.intentos === 1 && lec.ayuda === 0);
        if (primer) retoActual.aciertos++;
      }
      let gana = 10;
      if (ultima) {
        const mundo = mundoDe(lec.i);
        const prev = av.retos[mundo.id];
        if (!prev || !prev.hecho) gana += 50;
        av.retos[mundo.id] = {
          hecho: true,
          total: total,
          aciertos: retoActual ? retoActual.aciertos : 0,
          fecha: fecha(new Date())
        };
      }
      lec.xp += sumarXp(gana);
      guardar();
      celebrar(0, ultima && !sinMovimiento);
      montada = null;
      vista = { tipo: 'cierre', fin: ultima ? 'reto' : 'ronda' };
      pintar();
      return;
    }

    const nuevas = lec.repaso ? lec.baseHechas : Math.max(lec.baseHechas, lec.rondaIdx + 1);

    if (!lec.repaso) {
      av.lecciones[def.id] = Object.assign({}, progresoDe(def.id), {
        rondasHechas: nuevas,
        ronda: ultima ? total - 1 : lec.rondaIdx + 1,
        pantalla: 0,
        snapshot: null,
        entrada: ''
      });
    }

    let gana = 0;
    if (!lec.repaso) gana += 10;                       // ronda terminada
    if (!lec.repaso && nuevas >= total) gana += 30;    // nodo dominado
    lec.xp += sumarXp(gana);
    if (!lec.repaso && ultima) tocarRacha();
    guardar();

    celebrar(0, !lec.repaso && ultima && !sinMovimiento);
    montada = null;
    vista = { tipo: 'cierre', fin: ultima ? 'nodo' : 'ronda' };
    pintar();
  }

  /* ---- Pantalla: fin de ronda o de nodo ---- */
  function pintarCierre() {
    const def = lec.def;
    const mundo = mundoDe(lec.i);
    const total = def.rondas.length;
    const esReto = vista.fin === 'reto';
    const hechasNodo = esReto ? (retoActual ? retoActual.aciertos : 0)
      : (lec.examen ? lec.rondaIdx + 1 : (lec.repaso ? total : rondasHechas(def.id)));
    const finNodo = vista.fin === 'nodo';
    const finMundo = !lec.repaso && !lec.examen && !esReto && finNodo && mundo.lecciones.every(l => estaHecha(l.id));
    const sig = siguientePendiente();
    const todas = !sig;

    const kicker = esReto ? 'Reto superado'
      : (lec.examen ? 'Reto en marcha'
      : (lec.repaso ? 'Ronda repasada'
      : (finNodo ? (finMundo ? 'Mundo completado' : 'Nodo dominado') : 'Ronda completada')));
    const titulo = (esReto || lec.examen) ? 'Reto · ' + mundo.titulo
      : (lec.repaso ? def.titulo : (finNodo ? def.titulo : lec.ronda.titulo));

    cuerpo.innerHTML =
      '<article class="av-tarjeta av-tarjeta--fin av-tarjeta--reto av-nueva">' +
        (esReto
          ? '<div class="av-fin-reto" aria-hidden="true">' + ICO.trofeo + '</div>'
          : '<div class="av-fin-anillo" aria-hidden="true">' +
              anillo(hechasNodo, total, 'av-anillo--grande') +
              '<span class="av-fin-anillo-txt"><b>' + hechasNodo + '</b><small>de ' + total + '</small></span>' +
            '</div>') +
        '<p class="av-kicker">' + kicker + '</p>' +
        '<h2 class="av-titulo">' + titulo + '</h2>' +
        '<p class="av-fin-xp">' + (lec.xp ? '+' + lec.xp + ' ' + ICO.estrella : (modoRey() ? 'Modo rey: sin puntos' : 'Repaso: sin puntos nuevos')) + '</p>' +
        '<p class="av-fin-ronda">' + (esReto
          ? 'Has superado el reto de <b>Mundo ' + (lec.i + 1) + ' · ' + escapar(mundo.titulo) + '</b> con <b>' + hechasNodo + ' de ' + total + '</b> a la primera. Los fallos no restan: solo te dicen qué conviene repasar.'
          : (lec.examen
            ? 'Ejercicio ' + (lec.rondaIdx + 1) + ' de ' + total + ' superado. Quedan ' + (total - lec.rondaIdx - 1) + ' antes de la insignia del mundo.'
            : (lec.repaso
              ? 'Repaso terminado. Nada que recuperar: el progreso sigue intacto.'
              : (finNodo
                ? 'Has completado ' + (total === 1 ? 'la única ronda' : 'las ' + total + ' rondas') + ' de <b>' + escapar(def.titulo) + '</b>.'
                : 'Ronda ' + (lec.rondaIdx + 1) + ' de ' + total + ' lista. El anillo del nodo ya lo nota.')))) + '</p>' +
        '<div class="av-datos">' +
          '<span class="av-dato">' + ICO.estrella + ' <b>' + (av.xp || 0) + '</b> pts en total</span>' +
          '<span class="av-dato">' + ICO.fuego + ' <b>' + (av.racha.dias || 0) + '</b> ' + (av.racha.dias === 1 ? 'día seguido' : 'días seguidos') + '</span>' +
          '<span class="av-dato">' + ICO.libro + ' <b>' + hechas() + '</b> / ' + totalLecciones + ' nodos</span>' +
          (esReto ? '<span class="av-dato">' + ICO.trofeo + ' <b>' + DATOS.mundos.filter(m => av.retos[m.id] && av.retos[m.id].hecho).length + '</b> / ' + DATOS.mundos.length + ' retos</span>' : '') +
        '</div>' +
        (finMundo && !todas ? '<p class="av-fin-mundo">Has terminado <b>Mundo ' + (lec.i + 1) + ' · ' + mundo.titulo + '</b>. Se ha abierto el siguiente.</p>' : '') +
        (esReto ? '<p class="av-fin-mundo">Insignia conseguida: <b>Reto de ' + escapar(mundo.titulo) + '</b>.</p>' : '') +
        (!lec.repaso && !lec.examen && !esReto && todas ? '<p class="av-fin-mundo">Has terminado <b>toda la aventura</b>. Vuelve al mapa cuando quieras a repasar.</p>' : '') +
      '</article>';

    let etiqueta;
    if (esReto) etiqueta = 'Volver al mapa';
    else if (vista.fin === 'ronda') etiqueta = lec.examen ? 'Siguiente ejercicio' : 'Siguiente ronda';
    else if (lec.repaso || todas) etiqueta = 'Volver al mapa';
    else etiqueta = 'Siguiente nodo';
    pie.hidden = false;
    pie.innerHTML =
      '<div class="av-pie-int">' +
        '<div class="av-pie-izq">' +
          '<button class="av-btn av-btn--fantasma" type="button" id="av-mapa">← Mapa</button>' +
        '</div>' +
        '<button class="av-btn av-btn--principal av-btn--sig" type="button" id="av-sig">' + etiqueta + '</button>' +
      '</div>';
    byId('av-mapa').onclick = irAlMapa;
    byId('av-sig').onclick = () => {
      if (esReto) return irAlMapa();
      if (vista.fin === 'ronda') return lec.examen
        ? abrirNodo(lec.def, lec.i, null, { ronda: lec.rondaIdx + 1, examen: true })
        : abrirLeccion(lec.i, lec.j, { ronda: lec.rondaIdx + 1, repaso: lec.repaso });
      if (lec.repaso || todas) return irAlMapa();
      const s = siguientePendiente();
      if (s) abrirLeccion(s.i, s.j);
      else irAlMapa();
    };
    byId('av-sig').focus();
    cuerpo.scrollTop = 0;
    decir(kicker + '. ' + (lec.xp ? 'Has ganado ' + lec.xp + ' puntos.' : (modoRey() ? 'Modo rey: sin puntos.' : '')));
  }

  /* ---- Saltar el foco dentro de la ventana ---- */
  raiz.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
    if (e.key !== 'Tab') return;
    const enfocables = [...raiz.querySelectorAll('button, input, summary, [href], [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!enfocables.length) return;
    const primero = enfocables[0], ultimo = enfocables[enfocables.length - 1];
    if (!raiz.contains(document.activeElement)) { e.preventDefault(); primero.focus(); return; }
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

  byId('av-cerrar').onclick = cerrar;
  btn.onclick = () => { if (raiz.hidden) abrir(); else cerrar(); };

  // Al cerrar la pestaña o cambiar de aplicación se guarda lo escrito y el
  // tiempo, sin esperar a que el alumno pulse cerrar.
  window.addEventListener('pagehide', () => { flushEntrada(); cerrarSesionTiempo(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { flushEntrada(); cerrarSesionTiempo(); }
    else if (!raiz.hidden && !inicioSesion) inicioSesion = Date.now();
  });

  /* Lleva el scroll de la terminal al final, para ver siempre lo último. */
  function destino(id) {
    const el = byId(id);
    if (el) el.scrollTop = el.scrollHeight;
  }
})();
