/* =====================================================================
   cast-player.js — reproduce grabaciones de asciinema (.cast v1, v2 y v3)
   dentro de la terminal de linux-terminal.html, sin librerías externas.

   USO EN ejemplos.js (una diapositiva con "cast" en vez de cmd/out o pasos):
     { cast:"ls-basico",            // clave de CASTS (casts.js) ...
       cast:"casts/ls.cast",        // ... o ruta a un .cast (necesita servidor, ver README)
       maxPausa:0.8,                // opcional: pausa máxima entre salidas, en segundos
       cmds:["ls -l", "ls noexiste"],   // opcional: comandos con globo (ver abajo)
       tiempo:"real",               // opcional: respeta el tiempo exacto de la grabación (ver abajo)
       exp:'<h3>ls</h3><p>...</p>' }

   VELOCIDAD: el ajuste "ms por letra" del panel de configuración manda sobre el tecleo grabado.
     Cada tecla escrita se pinta a ese ritmo (24 ms por defecto), tecleara como tecleara la persona.
     Se conservan el tiempo real de pensar antes de escribir, de esperar tras Enter y de la salida del
     comando (con un tope de "maxPausa"). En "instantáneo" se ve el resultado final de golpe.
     Con  tiempo:"real"  la diapositiva ignora el ajuste y se reproduce exactamente como se grabó.

   GLOBOS DE AYUDA en las grabaciones (mismos textos que en el resto de la web):
     · Sin "cmds": se detecta solo lo que va tras el "$ " (o "# ") de cada línea y se busca en
       FUNCION_COMANDOS, igual que en las diapositivas normales.
     · Con "cmds": solo llevan globo esos comandos, escritos tal cual se ven en pantalla. Cada uno
       puede ser un texto o { cmd:"ls -l", info:"Texto propio del globo" } (el "info" gana).
     · Una diapositiva con  cmds:[]  desactiva los globos.
   El globo aparece cuando la línea ya está terminada (no mientras se está tecleando).

   Qué entiende: texto, colores (16 / 256 / RGB), negrita, subrayado, inverso,
   \r \n \b \t, borrar pantalla/línea, mover el cursor y pantalla alternativa
   (nano, less, top: mejor esfuerzo; sin regiones de scroll).
   ===================================================================== */
(function (global) {
  'use strict';

  const PALETA = ['#2e3436', '#cc0000', '#4e9a06', '#c4a000', '#3465a4', '#75507b', '#06989a', '#d3d7cf',
                  '#555753', '#ef2929', '#8ae234', '#fce94f', '#729fcf', '#ad7fa8', '#34e2e2', '#eeeeec'];
  const NIVELES = [0, 95, 135, 175, 215, 255];
  function color256(n) {
    if (n < 16) return PALETA[n];
    if (n < 232) { n -= 16; return 'rgb(' + NIVELES[Math.floor(n / 36)] + ',' + NIVELES[Math.floor(n / 6) % 6] + ',' + NIVELES[n % 6] + ')'; }
    const g = 8 + (n - 232) * 10; return 'rgb(' + g + ',' + g + ',' + g + ')';
  }
  const escHtml = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------------- 1. Lectura del fichero .cast ---------------- */
  function parse(texto) {
    texto = String(texto).replace(/^\uFEFF/, '').trim();
    if (!texto) throw new Error('El fichero está vacío.');

    // v1: un único objeto JSON con "stdout": [[retraso, "texto"], ...]
    if (texto[0] === '{') {
      try {
        const obj = JSON.parse(texto);
        if (obj && Array.isArray(obj.stdout)) {
          let t = 0; const eventos = [];
          for (const par of obj.stdout) { t += +par[0] || 0; eventos.push({ t, d: String(par[1]) }); }
          return { cab: { cols: obj.width, rows: obj.height }, eventos };
        }
      } catch (e) { /* no es v1: se prueba como v2/v3 */ }
    }

    const lineas = texto.split(/\r?\n/).filter(l => l.trim());
    let cab;
    try { cab = JSON.parse(lineas[0]); }
    catch (e) { throw new Error('La primera línea no es una cabecera JSON: ¿seguro que es un .cast de asciinema?'); }
    const ver = cab.version;
    if (ver !== 2 && ver !== 3) throw new Error('Versión de .cast no soportada: ' + ver);

    const eventos = []; let t = 0;
    for (let i = 1; i < lineas.length; i++) {
      let ev; try { ev = JSON.parse(lineas[i]); } catch (e) { continue; }
      if (!Array.isArray(ev) || ev.length < 3) continue;
      t = ver === 3 ? t + (+ev[0] || 0) : (+ev[0] || 0);   // v3: intervalos · v2: tiempo absoluto
      if (ev[1] === 'o') eventos.push({ t, d: String(ev[2]) });   // solo salida; se ignoran entradas ("i"), marcas ("m") y resize ("r")
    }
    const term = cab.term || {};
    return { cab: { cols: cab.width || term.cols, rows: cab.height || term.rows, idle: cab.idle_time_limit || (cab.term && cab.term.idle_time_limit) }, eventos };
  }

  /* ---------------- 2. Terminal virtual ---------------- */
  function Pantalla(cols, rows) {
    rows = rows > 0 ? rows : 24;
    let lineas = [[]], base = 0, f = 0, c = 0;   // f = fila absoluta; la pantalla visible son lineas[base .. base+rows-1]
    let fg = null, bg = null, neg = false, dim = false, ita = false, sub = false, bold = false, css = '';
    let guardada = null, alterna = null, cursorVisible = true, pendiente = '';

    const fila = i => { while (lineas.length <= i) lineas.push([]); return lineas[i]; };
    const actualizarCss = () => {
      let a = fg, b = bg;
      if (neg) { a = bg || 'var(--term)'; b = fg || 'var(--term-txt)'; }
      const s = [];
      if (a) s.push('color:' + a); if (b) s.push('background:' + b);
      if (bold) s.push('font-weight:700'); if (dim) s.push('opacity:.65');
      if (ita) s.push('font-style:italic'); if (sub) s.push('text-decoration:underline');
      css = s.join(';');
    };
    const celda = ch => ({ ch, st: css });
    const limpiarPantalla = () => { for (let i = base; i < base + rows; i++) if (lineas[i]) lineas[i] = []; };
    const saltoLinea = () => {
      if (f >= base + rows - 1) { lineas.push([]); base++; f = base + rows - 1; fila(f); } else { f++; fila(f); }
    };
    const poner = ch => {
      const l = fila(f);
      while (l.length < c) l.push(celda(' '));
      l[c] = celda(ch); c++;
    };

    function sgr(n) {
      if (!n.length) n = [0];
      for (let i = 0; i < n.length; i++) {
        const v = Number.isFinite(n[i]) ? n[i] : 0;
        if (v === 0) { fg = bg = null; neg = dim = ita = sub = bold = false; }
        else if (v === 1) bold = true; else if (v === 2) dim = true; else if (v === 3) ita = true;
        else if (v === 4) sub = true; else if (v === 7) neg = true;
        else if (v === 22) { bold = false; dim = false; } else if (v === 23) ita = false;
        else if (v === 24) sub = false; else if (v === 27) neg = false;
        else if (v >= 30 && v <= 37) fg = PALETA[v - 30]; else if (v === 39) fg = null;
        else if (v >= 40 && v <= 47) bg = PALETA[v - 40]; else if (v === 49) bg = null;
        else if (v >= 90 && v <= 97) fg = PALETA[v - 90 + 8]; else if (v >= 100 && v <= 107) bg = PALETA[v - 100 + 8];
        else if (v === 38 || v === 48) {
          let col = null;
          if (n[i + 1] === 5) { col = color256(n[i + 2] | 0); i += 2; }
          else if (n[i + 1] === 2) { col = 'rgb(' + (n[i + 2] | 0) + ',' + (n[i + 3] | 0) + ',' + (n[i + 4] | 0) + ')'; i += 4; }
          if (col) { if (v === 38) fg = col; else bg = col; }
        }
      }
      actualizarCss();
    }

    function modoPrivado(nums, activar) {
      for (const m of nums) {
        if (m === 25) cursorVisible = activar;
        else if (m === 1049 || m === 1047 || m === 47) {
          if (activar && !alterna) { alterna = { lineas, base, f, c }; lineas = [[]]; base = 0; f = 0; c = 0; }
          else if (!activar && alterna) { ({ lineas, base, f, c } = alterna); alterna = null; }
        }
      }
    }

    function csi(par, fin) {
      const privado = /^[?>=!]/.test(par);
      const nums = par.replace(/^[?>=!]/, '').split(/[;:]/).map(x => x === '' ? NaN : parseInt(x, 10));
      const n = (k, def) => Number.isFinite(nums[k]) && nums[k] > 0 ? nums[k] : def;   // 0 o ausente = valor por defecto
      if (privado) { if (fin === 'h') modoPrivado(nums, true); else if (fin === 'l') modoPrivado(nums, false); return; }
      switch (fin) {
        case 'm': sgr(nums); break;
        case 'A': f = Math.max(base, f - n(0, 1)); break;
        case 'B': f = Math.min(base + rows - 1, f + n(0, 1)); fila(f); break;
        case 'C': c += n(0, 1); break;
        case 'D': c = Math.max(0, c - n(0, 1)); break;
        case 'E': f = Math.min(base + rows - 1, f + n(0, 1)); fila(f); c = 0; break;
        case 'F': f = Math.max(base, f - n(0, 1)); c = 0; break;
        case 'G': c = n(0, 1) - 1; break;
        case 'd': f = Math.min(base + rows - 1, base + n(0, 1) - 1); fila(f); break;
        case 'H': case 'f': f = Math.min(base + rows - 1, base + n(0, 1) - 1); c = n(1, 1) - 1; fila(f); break;
        case 'J': {
          const m = Number.isFinite(nums[0]) ? nums[0] : 0;
          if (m === 0) { fila(f).length = Math.min(fila(f).length, c); for (let i = f + 1; i < base + rows; i++) if (lineas[i]) lineas[i] = []; }
          else if (m === 1) { for (let i = base; i < f; i++) if (lineas[i]) lineas[i] = []; const l = fila(f); for (let i = 0; i <= c && i < l.length; i++) l[i] = celda(' '); }
          else if (m === 2) limpiarPantalla();
          else if (m === 3) { lineas.splice(0, base); f -= base; base = 0; }
          break;
        }
        case 'K': {
          const m = Number.isFinite(nums[0]) ? nums[0] : 0, l = fila(f);
          if (m === 0) l.length = Math.min(l.length, c);
          else if (m === 1) { for (let i = 0; i <= c && i < l.length; i++) l[i] = celda(' '); }
          else lineas[f] = [];
          break;
        }
        case 'L': { const k = n(0, 1); for (let i = 0; i < k; i++) { lineas.splice(f, 0, []); lineas.splice(base + rows, 1); } break; }
        case 'M': { const k = n(0, 1); for (let i = 0; i < k; i++) { lineas.splice(f, 1); lineas.splice(base + rows - 1, 0, []); } break; }
        case 'P': fila(f).splice(c, n(0, 1)); break;
        case '@': { const l = fila(f); while (l.length < c) l.push(celda(' ')); for (let i = 0; i < n(0, 1); i++) l.splice(c, 0, celda(' ')); break; }
        case 'X': { const l = fila(f); for (let i = c; i < c + n(0, 1) && i < l.length; i++) l[i] = celda(' '); break; }
        case 's': guardada = { f, c }; break;
        case 'u': if (guardada) { f = guardada.f; c = guardada.c; } break;
        default: break;   // el resto (modos, títulos, regiones de scroll…) se ignora
      }
    }

    function escribir(texto) {
      const cs = Array.from(pendiente + texto); pendiente = '';
      for (let i = 0; i < cs.length; i++) {
        const ch = cs[i];
        if (ch === '\x1b') {
          const sig = cs[i + 1];
          if (sig === undefined) { pendiente = ch; return; }
          if (sig === '[') {
            let j = i + 2; while (j < cs.length && !/[\x40-\x7e]/.test(cs[j])) j++;
            if (j >= cs.length) { pendiente = cs.slice(i).join(''); return; }   // secuencia cortada entre dos eventos
            csi(cs.slice(i + 2, j).join(''), cs[j]); i = j;
          } else if (sig === ']') {                                             // OSC (títulos, enlaces…): se descarta
            let j = i + 2; while (j < cs.length && cs[j] !== '\x07' && !(cs[j] === '\x1b' && cs[j + 1] === '\\')) j++;
            if (j >= cs.length) { pendiente = cs.slice(i).join(''); return; }
            i = cs[j] === '\x07' ? j : j + 1;
          } else if (sig === '(' || sig === ')') i += 2;                        // juego de caracteres
          else if (sig === '7') { guardada = { f, c }; i++; }
          else if (sig === '8') { if (guardada) { f = guardada.f; c = guardada.c; } i++; }
          else if (sig === 'M') { f = Math.max(base, f - 1); i++; }
          else if (sig === 'c') { lineas = [[]]; base = 0; f = 0; c = 0; fg = bg = null; neg = dim = ita = sub = bold = false; actualizarCss(); i++; }
          else i++;
        }
        else if (ch === '\r') c = 0;
        else if (ch === '\n') saltoLinea();
        else if (ch === '\b') c = Math.max(0, c - 1);
        else if (ch === '\t') c = (c | 7) + 1;
        else if (ch < ' ' || ch === '\x7f') { /* otros caracteres de control: se ignoran */ }
        else poner(ch);
      }
    }

    // Busca en una línea el comando al que poner globo. Devuelve [inicio, fin, info] o null.
    function buscarComando(l, opc) {
      let fin = l.length; while (fin > 0 && l[fin - 1].ch === ' ') fin--;      // se ignoran los espacios finales
      if (!fin) return null;
      let ini = -1;
      if (opc.comandos) {                                                         // lista explícita: gana la coincidencia más larga al final de la línea
        let mejor = 0;
        for (const t of opc.comandos) {
          const m = Array.from(t);
          if (m.length <= mejor || m.length > fin) continue;
          const desde = fin - m.length;
          if ((desde === 0 || l[desde - 1].ch === ' ') && m.every((ch, i) => l[desde + i].ch === ch)) { ini = desde; mejor = m.length; }
        }
      } else {                                                                    // automático: lo que va tras el primer "$ " o "# " del prompt
        const txt = l.slice(0, fin).map(ce => ce.ch).join('');
        const m = /[$#] /.exec(txt);
        if (m) ini = Array.from(txt.slice(0, m.index + 2)).length;
      }
      if (ini < 0 || ini >= fin) return null;
      const texto = l.slice(ini, fin).map(ce => ce.ch).join('');
      const info = opc.info ? opc.info(texto) : '';
      return info ? [ini, fin, info] : null;
    }
    const escAttr = t => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    function html(opc) {
      opc = opc || {};
      let ult = f;
      for (let i = lineas.length - 1; i > f; i--) if (lineas[i] && lineas[i].length) { ult = i; break; }
      const out = [];
      for (let i = 0; i <= ult; i++) {
        const l = lineas[i] || [], hayCursor = cursorVisible && i === f;
        const total = hayCursor ? Math.max(l.length, c + 1) : l.length;
        const rango = i === f || !(opc.info || opc.comandos) ? null : buscarComando(l, opc);   // la línea que se está tecleando no lleva globo
        let s = '', run = '', st = null, abierto = false;
        const cerrar = () => { if (run) s += st ? '<span style="' + st + '">' + escHtml(run) + '</span>' : escHtml(run); run = ''; };
        for (let k = 0; k < total; k++) {
          if (rango && k === rango[0]) { cerrar(); st = null; s += '<span class="cmd" tabindex="0" data-info="' + escAttr(rango[2]) + '">'; abierto = true; }
          if (rango && k === rango[1] && abierto) { cerrar(); st = null; s += '</span>'; abierto = false; }
          if (hayCursor && k === c) { cerrar(); s += '<span class="cursor"></span>'; st = null; continue; }
          const ce = l[k] || { ch: ' ', st: '' };
          if ((ce.st || null) !== st) { cerrar(); st = ce.st || null; }
          run += ce.ch;
        }
        cerrar(); if (abierto) s += '</span>';
        out.push(s);
      }
      return out.join('\n');
    }

    actualizarCss();
    return { escribir, html };
  }

  /* ---------------- 3. Carga y reproducción ---------------- */
  const cache = new Map();
  async function cargar(origen) {
    if (typeof origen !== 'string') throw new Error('El campo "cast" debe ser texto.');
    if (cache.has(origen)) return cache.get(origen);
    let texto;
    if (/[\r\n]/.test(origen) || origen.trim()[0] === '{') texto = origen;                       // contenido pegado directamente
    else if (typeof global.CASTS === 'object' && global.CASTS && Object.prototype.hasOwnProperty.call(global.CASTS, origen)) texto = global.CASTS[origen];   // clave de casts.js
    else {                                                                                       // ruta o URL
      try {
        const r = await fetch(origen);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        texto = await r.text();
      } catch (e) {
        throw new Error('No se pudo leer "' + origen + '" (' + e.message + '). Si abres el HTML con doble clic (file://), el navegador no permite leer ficheros sueltos: pega la grabación en casts.js o usa un servidor local.');
      }
    }
    const cast = parse(texto);
    cache.set(origen, cast);
    return cast;
  }

  // ¿Este evento es una tecla escrita? Un solo carácter imprimible, o el borrado de un carácter (retroceso).
  const esTecla = d => {
    const a = Array.from(d);
    return (a.length === 1 && a[0] >= ' ' && a[0] !== '\x7f') || d === '\b \b' || d === '\b\x1b[K' || d === '\x08\x1b[K';
  };

  // Calcula el instante (en ms) en que se pinta cada evento.
  //  · msPorLetra definido → las teclas escritas van a ese ritmo, da igual cómo tecleó la persona al grabar.
  //    La pausa antes de empezar a teclear, la espera tras pulsar Enter y la salida de los comandos conservan
  //    su tiempo real (recortado a maxPausa).
  //  · msPorLetra sin definir → todo el tiempo real, multiplicado por "velocidad" (1 = como se grabó).
  function planificar(cast, opc) {
    opc = opc || {};
    const velocidad = opc.velocidad > 0 ? opc.velocidad : 1;
    const maxPausa = opc.maxPausa > 0 ? opc.maxPausa : (cast.cab.idle > 0 ? cast.cab.idle : 1);
    const fijo = Number.isFinite(opc.msPorLetra) && opc.msPorLetra >= 0 ? opc.msPorLetra : null;
    let previo = 0, acum = 0, enRacha = false; const evs = [];
    for (const e of cast.eventos) {
      const real = Math.min(Math.max(0, e.t - previo), maxPausa) * 1000 / velocidad; previo = e.t;
      const tecla = fijo !== null && esTecla(e.d);
      acum += tecla && enRacha ? fijo : real;           // la 1.ª letra de una racha conserva la pausa real (la persona "piensa")
      enRacha = tecla;
      evs.push({ t: acum, d: e.d });
    }
    return evs;
  }

  async function reproducir(cast, destino, opc) {
    opc = opc || {};
    const vivo = opc.vivo || (() => true);
    const pan = Pantalla(cast.cab.cols, cast.cab.rows);
    const memo = new Map();                              // el texto del globo de cada comando se calcula una sola vez
    const info = opc.info ? (t => { if (!memo.has(t)) memo.set(t, opc.info(t) || ''); return memo.get(t); }) : null;
    const pintar = () => { destino.innerHTML = pan.html({ comandos: opc.comandos, info }); destino.scrollTop = destino.scrollHeight; };

    if (opc.instantaneo) { for (const e of cast.eventos) pan.escribir(e.d); pintar(); return; }

    const evs = planificar(cast, opc);

    let ahora = 0; pintar();
    for (const e of evs) {
      const dt = e.t - ahora;
      if (dt > 16) {                                    // se agrupan eventos muy seguidos y se pinta una vez
        pintar();
        await new Promise(r => setTimeout(r, dt));
        if (!vivo()) return;
        ahora = e.t;
      }
      pan.escribir(e.d);
    }
    if (vivo()) pintar();
  }

  global.CastPlayer = { parse, Pantalla, planificar, cargar, reproducir };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.CastPlayer;
})(typeof window !== 'undefined' ? window : globalThis);
