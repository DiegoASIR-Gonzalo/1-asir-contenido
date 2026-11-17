/* =====================================================================
   HUB ASIR · Motor de cuestionarios
   ---------------------------------------------------------------------
   Este archivo NO se toca para crear cuestionarios nuevos.
   Para crear uno:
     1) Copia  cuestionarios/_plantilla.js  con otro nombre
        (p. ej. cuestionarios/so-ud1.js) y rellena las preguntas.
     2) Añade una tarjeta en index.html:
        <a class="card" href="#" data-modal="quiz" data-quiz="so-ud1"> ... </a>
   El archivo se carga solo al abrir la tarjeta y se muestra dentro de la
   ventana emergente del HUB, sin salir de la página.

   data-quiz admite:  un nombre ("so-ud1" -> cuestionarios/so-ud1.js)
                  o   una ruta completa ("otra/carpeta/examen.js")
   ===================================================================== */
(function () {
  'use strict';

  const REG = Object.create(null);

  /* ---------- utilidades ---------- */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
  // Texto de las preguntas: se escapa el HTML y `así` se muestra como código.
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const norm = (s) => String(s).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const barajar = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  const nota10 = (ok, total) => (total ? Math.round((ok / total) * 100) / 10 : 0);
  const fmtNota = (n) => n.toLocaleString('es-ES', { maximumFractionDigits: 1 });

  /* ---------- validación y normalización de una pregunta ---------- */
  function prep(p, n) {
    const aviso = (m) => { console.warn('[HubQuiz] Pregunta ' + (n + 1) + ': ' + m); return null; };
    if (!p || typeof p.q !== 'string' || !p.q.trim()) return aviso('falta el enunciado (q).');

    let tipo = p.tipo;
    if (!tipo) {
      tipo = typeof p.correcta === 'boolean' ? 'vf'
        : !p.opciones ? 'texto'
        : Array.isArray(p.correcta) ? 'multiple' : 'unica';
    }
    const base = { tipo, q: p.q, exp: p.explicacion || '', fijo: !!p.fijo };

    if (tipo === 'vf') {
      if (typeof p.correcta !== 'boolean') return aviso('en «vf» correcta debe ser true o false.');
      return { ...base, fijo: true, opts: [{ t: 'Verdadero', ok: p.correcta }, { t: 'Falso', ok: !p.correcta }] };
    }
    if (tipo === 'texto') {
      const r = [].concat(p.correcta == null ? [] : p.correcta).map(String).filter((x) => x.trim());
      if (!r.length) return aviso('en «texto» correcta debe ser una respuesta o una lista de respuestas válidas.');
      return { ...base, resp: r };
    }
    if (tipo !== 'unica' && tipo !== 'multiple') return aviso('tipo «' + tipo + '» desconocido.');
    if (!Array.isArray(p.opciones) || p.opciones.length < 2) return aviso('hacen falta al menos 2 opciones.');
    const ok = [].concat(p.correcta);
    if (!ok.length || ok.some((i) => !Number.isInteger(i) || i < 0 || i >= p.opciones.length)) {
      return aviso('«correcta» debe ser el nº de la opción (la primera es 0).');
    }
    if (tipo === 'unica' && ok.length !== 1) return aviso('«unica» solo admite una correcta; usa tipo «multiple».');
    return { ...base, opts: p.opciones.map((t, i) => ({ t, ok: ok.includes(i) })) };
  }

  /* ---------- cuestionario en marcha ---------- */
  function montar(box, def) {
    const preguntas = (def.preguntas || []).map(prep).filter(Boolean);
    if (!preguntas.length) {
      box.innerHTML = '<p class="an-hint">Este cuestionario no tiene preguntas válidas (mira la consola del navegador).</p>';
      return null;
    }
    const inmediato = def.feedback !== 'final';
    const KEY = 'hub-quiz-mejor:' + (def.id || 'sin-id');
    let cola = [], pos = 0, parcial = false;

    const mejor = () => { try { return parseFloat(localStorage.getItem(KEY)); } catch { return NaN; } };
    const guardar = (n) => { try { if (!(mejor() >= n)) localStorage.setItem(KEY, String(n)); } catch { /* sin almacenamiento */ } };

    function empezar(indices, esParcial) {
      cola = (def.mezclar ? barajar(indices) : indices).map((k) => {
        const q = preguntas[k];
        let opts = q.opts ? q.opts.map((o) => ({ ...o })) : null;
        if (opts && !q.fijo && def.mezclarOpciones !== false) opts = barajar(opts);
        return { k, q, opts, sel: [], txt: '', ok: null, hecho: false };
      });
      pos = 0; parcial = esParcial;
      pregunta();
    }

    function evaluar(it) {
      if (it.q.tipo === 'texto') return it.q.resp.map(norm).includes(norm(it.txt));
      const correctas = it.opts.map((o, n) => (o.ok ? n : -1)).filter((n) => n >= 0);
      return correctas.length === it.sel.length && correctas.every((n) => it.sel.includes(n));
    }

    /* ---------- pantalla de pregunta ---------- */
    function pregunta() {
      const it = cola[pos], q = it.q, total = cola.length, ultima = pos === total - 1;
      const multi = q.tipo === 'multiple', texto = q.tipo === 'texto';
      const necesitaComprobar = inmediato && (multi || texto);
      const etiqueta = { unica: 'Una respuesta', vf: 'Verdadero o falso', multiple: 'Varias respuestas', texto: 'Respuesta corta' }[q.tipo];

      const cuerpo = texto
        ? '<div class="qz-opts"><input class="qz-input" type="text" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta" aria-labelledby="qz-q" autofocus></div>'
        : '<div class="qz-opts" role="' + (multi ? 'group' : 'radiogroup') + '" aria-labelledby="qz-q">' +
          it.opts.map((o, n) =>
            '<button type="button" class="qz-opt" role="' + (multi ? 'checkbox' : 'radio') + '" aria-checked="false" data-n="' + n + '">' +
            '<span class="qz-key">' + (n + 1) + '</span><span>' + fmt(o.t) + '</span></button>').join('') +
          '</div>';

      box.innerHTML =
        '<div class="qz">' +
          '<div class="qz-top"><span class="qz-count">' + (pos + 1) + ' / ' + total + '</span>' +
            '<div class="qz-bar" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + pos + '"><i></i></div></div>' +
          '<p class="qz-kind">' + etiqueta + '</p>' +
          '<h4 class="qz-q" id="qz-q" tabindex="-1"' + (texto ? '' : ' autofocus') + '>' + fmt(q.q) + '</h4>' +
          cuerpo +
          '<div class="qz-fb" role="status" aria-live="polite"></div>' +
          '<div class="an-actions"><button type="button" class="btn btn-primary btn-sm" data-a="ok"></button></div>' +
        '</div>';

      const bar = box.querySelector('.qz-bar i');
      const btn = box.querySelector('[data-a="ok"]');
      const fb = box.querySelector('.qz-fb');
      const input = box.querySelector('.qz-input');
      const opts = [...box.querySelectorAll('.qz-opt')];
      bar.style.width = (pos / total * 100) + '%';

      const tieneResp = () => (texto ? it.txt.trim() !== '' : it.sel.length > 0);
      const pintaBtn = () => {
        btn.disabled = !it.hecho && !tieneResp();
        btn.textContent = it.hecho ? (ultima ? 'Ver resultado' : 'Siguiente')
          : necesitaComprobar ? 'Comprobar'
          : ultima ? 'Terminar' : 'Siguiente';
      };
      const fijar = () => { it.ok = evaluar(it); it.hecho = true; };
      const marcar = () => {
        if (texto) {
          input.disabled = true;
          input.classList.add(it.ok ? 'ok' : 'ko');
        } else {
          opts.forEach((b, n) => {
            b.disabled = true;
            b.classList.toggle('ok', it.opts[n].ok);
            b.classList.toggle('ko', !it.opts[n].ok && it.sel.includes(n));
          });
        }
        fb.dataset.ok = String(it.ok);
        fb.innerHTML = '<strong>' + (it.ok ? '✓ Correcto' : '✕ Incorrecto') + '</strong>' +
          (texto && !it.ok ? ' · Respuesta válida: <code>' + esc(q.resp[0]) + '</code>' : '') +
          (q.exp ? '<br>' + fmt(q.exp) : '');
        bar.style.width = ((pos + 1) / total * 100) + '%';
        box.querySelector('.qz-bar').setAttribute('aria-valuenow', pos + 1);
      };
      const avanzar = () => { if (pos < total - 1) { pos++; pregunta(); } else resultado(); };

      opts.forEach((b) => b.addEventListener('click', () => {
        if (it.hecho) return;
        const n = +b.dataset.n;
        it.sel = multi ? (it.sel.includes(n) ? it.sel.filter((x) => x !== n) : [...it.sel, n]) : [n];
        opts.forEach((x, m) => x.setAttribute('aria-checked', it.sel.includes(m)));
        if (inmediato && !necesitaComprobar) { fijar(); marcar(); }
        pintaBtn();
      }));

      if (input) {
        input.addEventListener('input', () => { it.txt = input.value; pintaBtn(); });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && tieneResp()) { e.preventDefault(); btn.click(); } });
      }

      btn.addEventListener('click', () => {
        if (!it.hecho) {
          fijar();
          if (inmediato) { marcar(); pintaBtn(); btn.focus({ preventScroll: true }); return; }
        }
        avanzar();
      });

      pintaBtn();
      try { (input || box.querySelector('.qz-q')).focus({ preventScroll: true }); } catch { /* ventana aún cerrada */ }
    }

    /* ---------- pantalla de resultado ---------- */
    function resultado() {
      const total = cola.length, aciertos = cola.filter((x) => x.ok).length;
      const fallos = cola.filter((x) => !x.ok);
      const n = nota10(aciertos, total);
      if (!parcial) guardar(n);
      const m = mejor();
      const msg = n >= 9 ? '¡Excelente!' : n >= 7 ? 'Muy bien' : n >= 5 ? 'Aprobado, pero repasa' : 'Toca repasar un poco más';

      const suya = (it) => (it.q.tipo === 'texto'
        ? (it.txt.trim() ? '<code>' + esc(it.txt.trim()) + '</code>' : 'sin respuesta')
        : (it.sel.length ? it.sel.slice().sort((a, b) => a - b).map((i) => fmt(it.opts[i].t)).join(' · ') : 'sin respuesta'));
      const correcta = (it) => (it.q.tipo === 'texto'
        ? '<code>' + esc(it.q.resp[0]) + '</code>'
        : it.opts.filter((o) => o.ok).map((o) => fmt(o.t)).join(' · '));

      box.innerHTML =
        '<div class="qz qz-end">' +
          (def.titulo ? '<p class="qz-kind">' + esc(def.titulo) + (parcial ? ' · repaso' : '') + '</p>' : '') +
          '<h4 class="qz-q" tabindex="-1" autofocus>' + msg + '</h4>' +
          '<p class="an-hint">' + aciertos + ' de ' + total + ' correctas.</p>' +
          '<div class="an-out">' +
            '<div><small>Nota</small><b>' + fmtNota(n) + ' / 10</b></div>' +
            '<div><small>Aciertos</small><b>' + aciertos + '/' + total + '</b></div>' +
            (!parcial && isFinite(m) ? '<div><small>Mejor nota</small><b>' + fmtNota(m) + '</b></div>' : '') +
          '</div>' +
          (fallos.length
            ? '<p class="qz-kind">Para repasar</p><div class="qz-rev">' + fallos.map((it) =>
                '<div><small>Pregunta ' + (it.k + 1) + '</small>' + fmt(it.q.q) +
                '<small>Tu respuesta: ' + suya(it) + '</small>' +
                '<small>Correcta: ' + correcta(it) + '</small>' +
                (it.q.exp ? '<small>' + fmt(it.q.exp) + '</small>' : '') + '</div>').join('') + '</div>'
            : '') +
          '<div class="an-actions">' +
            (fallos.length ? '<button type="button" class="an-btn" data-a="falladas">Repasar falladas (' + fallos.length + ')</button>' : '') +
            '<button type="button" class="an-btn" data-a="todo">Repetir cuestionario</button>' +
          '</div>' +
        '</div>';

      const todas = preguntas.map((_, k) => k);
      box.querySelector('[data-a="todo"]').addEventListener('click', () => empezar(todas, false));
      const bf = box.querySelector('[data-a="falladas"]');
      if (bf) bf.addEventListener('click', () => empezar(fallos.map((x) => x.k), true));
      try { box.querySelector('.qz-q').focus({ preventScroll: true }); } catch { /* ventana aún cerrada */ }
    }

    /* ---------- teclado: 1-9 elige opción, Enter continúa ---------- */
    const onKey = (e) => {
      if (!box.isConnected || e.ctrlKey || e.metaKey || e.altKey || e.target.tagName === 'INPUT') return;
      if (/^[1-9]$/.test(e.key)) {
        const b = box.querySelectorAll('.qz-opt')[+e.key - 1];
        if (b && !b.disabled) { b.click(); e.preventDefault(); }
      } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        const b = box.querySelector('[data-a="ok"]');
        if (b && !b.disabled) { b.click(); e.preventDefault(); }
      }
    };
    document.addEventListener('keydown', onKey);

    empezar(preguntas.map((_, k) => k), false);
    return () => document.removeEventListener('keydown', onKey);
  }

  /* ---------- registro y carga del archivo del cuestionario ---------- */
  function registrar(def) {
    if (!def || !Array.isArray(def.preguntas)) {
      throw new Error('[HubQuiz] registrar() necesita un objeto con una lista "preguntas".');
    }
    const s = document.currentScript;
    const clave = s && s.dataset.hubQuiz;
    if (!def.id && clave) def.id = clave;
    if (def.id) REG[def.id] = def;
    if (clave) REG[clave] = def;
    return def;
  }

  function cargar(clave) {
    const ruta = /\.js(\?.*)?$/i.test(clave) ? clave : API.carpeta + clave + '.js';
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = ruta;
      s.dataset.hubQuiz = clave;
      s.onload = () => {
        s.remove();
        REG[clave] ? ok(REG[clave]) : ko(new Error('«' + ruta + '» no llama a HubQuiz.registrar({...}).'));
      };
      s.onerror = () => {
        s.remove();
        ko(new Error('No se pudo cargar «' + ruta + '». Comprueba que el archivo existe y que su nombre coincide con data-quiz.'));
      };
      document.head.append(s);
    });
  }

  // Muestra el cuestionario `clave` dentro de `box`. Devuelve la función de limpieza.
  function abrir(box, clave) {
    let limpiar = null, vivo = true;
    const ir = (def) => { if (vivo) limpiar = montar(box, def); };
    if (REG[clave]) ir(REG[clave]);
    else {
      box.innerHTML = '<p class="an-hint">Cargando cuestionario…</p>';
      cargar(clave).then(ir).catch((err) => {
        if (vivo) box.innerHTML = '<p class="an-hint">' + esc(err.message) + '</p>';
      });
    }
    return () => { vivo = false; if (limpiar) limpiar(); };
  }

  const API = { carpeta: 'cuestionarios/', registrar, abrir };
  window.HubQuiz = API;
})();
