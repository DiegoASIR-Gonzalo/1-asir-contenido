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
    llave: svg('<circle cx="8" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 11l8 8M16 16l3-3M14 18l2-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>')
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
  const iconoMundo = m => ({ orientarse: ICO.brujula, organizar: ICO.caja, shell: ICO.cono, avanzado: ICO.llave }[m.id] || ICO.estrella);
  const clonar = e => JSON.parse(JSON.stringify(e));
  const limpiar = h => String(h || '').replace(/<[^>]*>/g, '');
  const normalizar = t => String(t || '').trim().replace(/\s+/g, ' ');

  /* ---------------- Progreso guardado ---------------- */
  const TODOS = {};
  DATOS.mundos.forEach(m => m.lecciones.forEach(l => { TODOS[l.id] = l; }));
  const totalRondas = Object.values(TODOS).reduce((s, l) => s + l.rondas.length, 0);

  function cargar() {
    const base = { version: 2, xp: 0, racha: { dias: 0, ultima: '' }, lecciones: {} };
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (g && typeof g === 'object') {
        base.xp = Math.max(0, Number(g.xp) || 0);
        base.racha = { dias: Math.max(0, Number(g.racha && g.racha.dias) || 0), ultima: String((g.racha && g.racha.ultima) || '') };
        base.lecciones = (g.lecciones && typeof g.lecciones === 'object') ? g.lecciones : {};
      }
    } catch (e) { /* sin localStorage: la aventura funciona igual, sin recordar */ }
    // Migración del modelo viejo (una lección = una pantalla) al de rondas.
    Object.keys(base.lecciones).forEach(id => {
      const def = TODOS[id], g = base.lecciones[id];
      if (!def || !g || typeof g !== 'object') return;
      if (g.rondasHechas == null){
        g.rondasHechas = g.hecha ? def.rondas.length : 0;
        g.ronda = 0;
        g.pantalla = Math.max(0, Number(g.pantalla) || 0);
      }
      g.rondasHechas = Math.min(def.rondas.length, Math.max(0, Number(g.rondasHechas) || 0));
      g.ronda = Math.min(def.rondas.length - 1, Math.max(0, Number(g.ronda) || 0));
      g.pantalla = Math.max(0, Number(g.pantalla) || 0);
    });
    return base;
  }
  const av = cargar();
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(av)); } catch (e) {} };

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
  const mundoAbierto = i => i === 0 || mundoHecho(i - 1);
  const leccionAbierta = (i, j) => mundoAbierto(i) && (estaHecha(leccionDe(i, j).id) || j === 0 || estaHecha(leccionDe(i, j - 1).id));
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
    if (!n) return;
    av.xp = Math.max(0, (av.xp || 0) + n);
    guardar();
    pintarCabecera();
    const pill = byId('av-xp-pill');
    if (pill) {
      pill.classList.remove('av-pop');
      void pill.offsetWidth;   // reinicia la animación sin recrear el elemento
      pill.classList.add('av-pop');
    }
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
  let vista = { tipo: 'mapa' };   // mapa | leccion | cierre
  let lec = null;                 // nodo y ronda en curso
  let respuesta = '';             // lo escrito en la terminal, para no perderlo al repintar
  let montada = null;             // clave de la pantalla que ya está en el DOM

  function abrir() {
    raiz.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    if (typeof alternarAct === 'function') alternarAct(false);
    vista = { tipo: 'mapa' };
    montada = null;
    pintar();
    byId('av-cerrar').focus();
  }

  function cerrar() {
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
      prog.setAttribute('aria-valuetext', 'Ronda ' + (lec.rondaIdx + 1) + ' de ' + lec.def.rondas.length +
        ', pantalla ' + (lec.pantalla + 1) + ' de ' + total);
    } else {
      prog.hidden = true;
    }
  }

  function pintar() {
    pintarCabecera();
    if (vista.tipo === 'mapa') return pintarMapa();
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

    let html =
      '<div class="av-mapa">' +
        '<section class="av-hero">' +
          '<div class="av-hero-cab">' +
            '<span class="av-hero-mascota" aria-hidden="true">' + PINGUINO + '</span>' +
            '<div>' +
              '<p class="av-kicker">Repaso autónomo · 1.º ASIR</p>' +
              '<h2 class="av-hero-titulo">' + (sig ? 'Tu aventura de Linux' : '¡Aventura terminada!') + '</h2>' +
            '</div>' +
          '</div>' +
          '<p class="av-hero-texto">' + (sig
            ? 'Cada comando es un nodo con varias rondas. La primera te lo explica y las siguientes te lo hacen practicar con variantes, cada vez un poco más difícil. El anillo se llena ronda a ronda. Sin prisa y sin castigos: si te atascas, pide ayuda.'
            : 'Has completado todos los nodos. Puedes repetir cualquiera cuando quieras: no se borra nada.') + '</p>' +
          '<div class="av-datos">' +
            '<span class="av-dato">' + ICO.estrella + ' <b>' + (av.xp || 0) + '</b> pts</span>' +
            '<span class="av-dato">' + ICO.fuego + ' <b>' + (av.racha.dias || 0) + '</b> ' + (av.racha.dias === 1 ? 'día' : 'días') + '</span>' +
            '<span class="av-dato">' + ICO.libro + ' <b>' + nHechas + '</b> / ' + totalLecciones + ' nodos</span>' +
            '<span class="av-dato">' + ICO.check + ' <b>' + rHechas + '</b> / ' + totalRondas + ' rondas</span>' +
          '</div>' +
          '<button class="av-btn av-btn--principal av-btn--grande" type="button" id="av-seguir">' +
            (sig ? 'Continuar' + (nHechas ? ' donde lo dejaste' : '') : 'Repasar desde el principio') +
          '</button>' +
        '</section>' +
        '<ol class="av-camino">';

    DATOS.mundos.forEach((m, i) => {
      const abierto = mundoAbierto(i);
      const listos = m.lecciones.filter(l => estaHecha(l.id)).length;
      const estado = !abierto ? 'bloqueado' : (listos === m.lecciones.length ? 'hecho' : 'actual');
      html +=
        '<li class="av-mundo" data-estado="' + estado + '">' +
          '<div class="av-mundo-cab">' +
            '<span class="av-mundo-emoji" aria-hidden="true">' + iconoMundo(m) + '</span>' +
            '<div class="av-mundo-txt"><h3>Mundo ' + (i + 1) + ' · ' + m.titulo + '</h3><p>' + m.resumen + '</p></div>' +
            '<span class="av-mundo-prog">' + listos + '/' + m.lecciones.length + '</span>' +
          '</div>' +
          '<ol class="av-nodos">';

      m.lecciones.forEach((l, j) => {
        const total = l.rondas.length;
        const hechasL = rondasHechas(l.id);
        const hechaL = hechasL >= total;
        const abiertaL = leccionAbierta(i, j);
        const clase = hechaL ? 'hecha' : (abiertaL ? 'actual' : 'bloqueada');
        const icono = hechaL ? ICO.check : (abiertaL ? ICO.play : ICO.candado);
        const etiqueta = abiertaL
          ? (hechaL ? 'Repasar ' : (hechasL ? 'Continuar ' : 'Empezar ')) + l.titulo + '. ' + hechasL + ' de ' + total + ' rondas.'
          : 'Nodo bloqueado: ' + l.titulo;
        const subnodos = l.rondas.map((r, k) => {
          const hechaR = hechaL || k < hechasL;
          const actualR = !hechaL && abiertaL && k === hechasL;
          const estadoR = hechaR ? 'hecha' : (actualR ? 'actual' : 'bloqueada');
          const abiertaR = abiertaL && (hechaR || actualR);
          const etiquetaR = 'Ronda ' + (k + 1) + ' de ' + total + ': ' + r.titulo + '. ' + r.resumen +
            (hechaR ? '. Ya hecha: pulsa para repasarla.' : (actualR ? '. Es tu siguiente ronda.' : '. Bloqueada.'));
          const estadoTxt = hechaR ? 'Hecha' : (actualR ? 'Ahora' : 'Bloqueada');
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

      html += '</ol></li>';
    });

    html += '</ol>' +
      '<div class="av-mapa-pie"><button class="av-enlace" type="button" id="av-reiniciar">Reiniciar aventura y borrar el progreso</button></div>' +
      '</div>';

    cuerpo.innerHTML = html;
    cuerpo.scrollTop = 0;

    byId('av-seguir').onclick = () => {
      const s = siguientePendiente();
      if (s) abrirLeccion(s.i, s.j);
      else abrirLeccion(0, 0);
    };
    byId('av-reiniciar').onclick = () => {
      if (!window.confirm('¿Borrar el progreso de la aventura (rondas, puntos y racha)?')) return;
      av.xp = 0; av.racha = { dias: 0, ultima: '' }; av.lecciones = {};
      guardar();
      pintar();
      decir('Progreso de la aventura borrado.');
    };
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

  /* ---- Abrir un nodo o una ronda concreta ---- */
  function abrirLeccion(i, j, opciones) {
    const def = leccionDe(i, j);
    const g = progresoDe(def.id);
    const total = def.rondas.length;
    const completado = rondasHechas(def.id) >= total;
    const forzada = opciones && opciones.ronda != null;
    const repaso = opciones ? !!opciones.repaso : completado;
    const rondaIdx = forzada
      ? Math.min(total - 1, Math.max(0, Number(opciones.ronda) || 0))
      : (repaso ? 0 : Math.min(total - 1, Math.max(0, Number(g.ronda) || 0)));
    const ronda = def.rondas[rondaIdx];
    const pantalla = (opciones && opciones.pantalla != null)
      ? Math.min(ronda.pantallas.length - 1, Math.max(0, Number(opciones.pantalla) || 0))
      : (repaso ? 0 : Math.min(ronda.pantallas.length - 1, Math.max(0, Number(g.pantalla) || 0)));

    lec = {
      i: i, j: j, def: def, rondaIdx: rondaIdx, ronda: ronda, repaso: repaso,
      baseHechas: completado ? total : rondasHechas(def.id),
      estado: crearEstado({ inicio: Object.assign({}, def.inicio || {}, ronda.inicio || {}) }),
      pantalla: pantalla,
      hist: [], mem: [], memI: 0,
      ayuda: 0, acierto: false, xp: 0, elegida: null, aviso: '', explica: '',
      ayudaTexto: '', histHTML: '', paso: false,
      salidaAcum: '', intentos: 0, estadoInicial: null
    };

    // Al retomar una ronda, se repiten en silencio las prácticas ya hechas
    // para llegar al mismo mundo virtual en el que se quedó.
    for (let k = 0; k < pantalla; k++) {
      const p = ronda.pantallas[k];
      if (p.tipo === 'practica') ejecutarEn(lec.estado, p.ejemplo);
    }

    respuesta = '';
    montada = null;
    vista = { tipo: 'leccion' };
    pintar();
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
      '<span class="av-chip av-chip--ronda">Ronda ' + (lec.rondaIdx + 1) + ' de ' + lec.def.rondas.length + '</span>' +
      (lec.repaso ? '<span class="av-chip av-chip--repaso">Repaso</span>' : '');
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

    if (p.tipo === 'teoria') {
      cuerpo.innerHTML =
        '<article class="av-tarjeta av-nueva">' +
          '<div class="av-tarjeta-cab">' + chipMundo() + '</div>' +
          '<h2 class="av-titulo">' + p.titulo + '</h2>' +
          '<div class="av-texto">' + p.html + '</div>' +
          bloqueEjemplo(p.ejemplo, lec.estado) +
          (p.mas ? '<details class="av-porque"><summary>¿Por qué?</summary><div class="av-porque-txt">' + p.mas + '</div></details>' : '') +
        '</article>';
      montarPie('teoria');
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
          '<p class="av-hazlo"><span>Escribe esto</span><code>' + ej + '</code></p>' +
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
      inp.oninput = () => { respuesta = inp.value; };
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
          (tipo === 'practica' ? '<button class="av-btn av-btn--ayuda" type="button" id="av-ayuda-btn">' + ICO.bombilla + ' Ayuda</button>' : '') +
        '</div>' +
        '<button class="av-btn av-btn--principal av-btn--sig" type="button" id="av-sig">Continuar</button>' +
      '</div>';
    byId('av-mapa').onclick = irAlMapa;
    if (tipo === 'practica') byId('av-ayuda-btn').onclick = pedirAyuda;
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
      const gana = lec.ayuda > 0 ? 6 : 10;
      if (!lec.repaso) { lec.xp += gana; sumarXp(gana); }
      celebrar(lec.repaso ? 0 : gana, false);
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
        lec.aviso = p.error || ('Casi: ' + (vale.motivo || 'eso no es lo que pide esta pantalla.') +
          ' <b>Mira el ejemplo de arriba y prueba otra vez.</b>');
      }
      decir('Todavía no. ' + limpiar(lec.aviso));
    }
    pintar();
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

  function pedirAyuda() {
    const p = lec.ronda.pantallas[lec.pantalla];
    if (lec.ayuda === 0) {
      lec.ayuda = 1;
      lec.ayudaTexto = p.pista || ('Fíjate en el ejemplo de arriba: <code>' + escapar([].concat(p.ejemplo).join(' ; ')) + '</code>');
    } else {
      lec.ayuda = 2;
      lec.ayudaTexto = 'Te lo escribo yo: ya solo tienes que pulsar Enter.';
      respuesta = [].concat(p.ejemplo).join('; ');
    }
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
    lec.elegida = k;
    if (o.ok) {
      lec.acierto = true;
      lec.explica = o.porque;
      if (!lec.repaso) { lec.xp += 5; sumarXp(5); }
      celebrar(lec.repaso ? 0 : 5, false);
      decir('¡Correcto! ' + limpiar(o.porque));
    } else {
      lec.explica = o.porque;
      decir('No es esa. ' + limpiar(o.porque));
    }
    pintar();
    if (o.ok) byId('av-sig').focus();
  }

  /* ---- Avanzar y cerrar la ronda ---- */
  function guardarPunto() {
    if (lec.repaso) return;
    const prev = progresoDe(lec.def.id);
    av.lecciones[lec.def.id] = Object.assign({}, prev, {
      rondasHechas: Math.max(Number(prev.rondasHechas) || 0, lec.baseHechas),
      ronda: lec.rondaIdx,
      pantalla: lec.pantalla
    });
    guardar();
  }

  function avanzar() {
    if (lec.pantalla + 1 >= lec.ronda.pantallas.length) return cerrarRonda();
    lec.pantalla++;
    lec.acierto = false; lec.elegida = null; lec.ayuda = 0; lec.ayudaTexto = '';
    lec.aviso = ''; lec.explica = ''; lec.paso = false;
    lec.hist = []; lec.mem = []; lec.memI = 0; lec.histHTML = '';
    lec.salidaAcum = ''; lec.intentos = 0; lec.estadoInicial = null;
    respuesta = '';
    guardarPunto();
    montada = null;
    pintar();
  }

  function cerrarRonda() {
    const def = lec.def, total = def.rondas.length;
    const nuevas = lec.repaso ? lec.baseHechas : Math.max(lec.baseHechas, lec.rondaIdx + 1);
    const ultima = lec.rondaIdx + 1 >= total;

    if (!lec.repaso) {
      av.lecciones[def.id] = Object.assign({}, progresoDe(def.id), {
        rondasHechas: nuevas,
        ronda: ultima ? total - 1 : lec.rondaIdx + 1,
        pantalla: 0
      });
    }

    let gana = 0;
    if (!lec.repaso) gana += 10;                       // ronda terminada
    if (!lec.repaso && nuevas >= total) gana += 30;    // nodo dominado
    lec.xp += gana;
    if (gana) sumarXp(gana);
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
    const hechasNodo = lec.repaso ? total : rondasHechas(def.id);
    const finNodo = vista.fin === 'nodo';
    const finMundo = !lec.repaso && finNodo && mundo.lecciones.every(l => estaHecha(l.id));
    const sig = siguientePendiente();
    const todas = !sig;

    const kicker = lec.repaso ? 'Ronda repasada'
      : (finNodo ? (finMundo ? 'Mundo completado' : 'Nodo dominado') : 'Ronda completada');
    const titulo = lec.repaso ? def.titulo : (finNodo ? def.titulo : lec.ronda.titulo);

    cuerpo.innerHTML =
      '<article class="av-tarjeta av-tarjeta--fin av-nueva">' +
        '<div class="av-fin-anillo" aria-hidden="true">' +
          anillo(hechasNodo, total, 'av-anillo--grande') +
          '<span class="av-fin-anillo-txt"><b>' + hechasNodo + '</b><small>de ' + total + '</small></span>' +
        '</div>' +
        '<p class="av-kicker">' + kicker + '</p>' +
        '<h2 class="av-titulo">' + titulo + '</h2>' +
        '<p class="av-fin-xp">' + (lec.xp ? '+' + lec.xp + ' ' + ICO.estrella : 'Repaso: sin puntos nuevos') + '</p>' +
        '<p class="av-fin-ronda">' + (lec.repaso
          ? 'Repaso terminado. Nada que recuperar: el progreso sigue intacto.'
          : (finNodo
            ? 'Has completado las ' + total + ' rondas de <b>' + escapar(def.titulo) + '</b>.'
            : 'Ronda ' + (lec.rondaIdx + 1) + ' de ' + total + ' lista. El anillo del nodo ya lo nota.')) + '</p>' +
        '<div class="av-datos">' +
          '<span class="av-dato">' + ICO.estrella + ' <b>' + (av.xp || 0) + '</b> pts en total</span>' +
          '<span class="av-dato">' + ICO.fuego + ' <b>' + (av.racha.dias || 0) + '</b> ' + (av.racha.dias === 1 ? 'día seguido' : 'días seguidos') + '</span>' +
          '<span class="av-dato">' + ICO.libro + ' <b>' + hechas() + '</b> / ' + totalLecciones + ' nodos</span>' +
        '</div>' +
        (finMundo && !todas ? '<p class="av-fin-mundo">Has terminado <b>Mundo ' + (lec.i + 1) + ' · ' + mundo.titulo + '</b>. Se ha abierto el siguiente.</p>' : '') +
        (!lec.repaso && todas ? '<p class="av-fin-mundo">Has terminado <b>toda la aventura</b>. Vuelve al mapa cuando quieras a repasar.</p>' : '') +
      '</article>';

    const etiqueta = vista.fin === 'ronda' ? 'Siguiente ronda' : (lec.repaso ? 'Volver al mapa' : (todas ? 'Volver al mapa' : 'Siguiente nodo'));
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
      if (vista.fin === 'ronda') return abrirLeccion(lec.i, lec.j, { ronda: lec.rondaIdx + 1, repaso: lec.repaso });
      if (lec.repaso || todas) return irAlMapa();
      const s = siguientePendiente();
      if (s) abrirLeccion(s.i, s.j);
      else irAlMapa();
    };
    byId('av-sig').focus();
    cuerpo.scrollTop = 0;
    decir(kicker + '. ' + (lec.xp ? 'Has ganado ' + lec.xp + ' puntos.' : ''));
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

  /* Lleva el scroll de la terminal al final, para ver siempre lo último. */
  function destino(id) {
    const el = byId(id);
    if (el) el.scrollTop = el.scrollHeight;
  }
})();
