/* =====================================================================
   MINI-PANEL DE EJEMPLO (botón dentro de la explicación)
   ---------------------------------------------------------------------
   Añade, bajo la explicación de una diapositiva, uno o varios botones que
   abren un panel pequeño con un comando simulado a un lado y su explicación
   al otro. El contenido se escribe en ejemplos.js, en el campo "mini" de la
   diapositiva, con el MISMO patrón que el resto de ejemplos (cmd/out, pasos
   o cast, más exp). Este archivo solo contiene el motor: no hay que tocarlo
   para añadir ejemplos.

   CÓMO USARLO EN ejemplos.js (dentro de una diapositiva)
     { cmd:"whereis whoami", out:'...', exp:'...',
       mini:{ boton:"Probar con -b",            // texto del botón (opcional; por defecto "Ver ejemplo")
              titulo:"whereis -b",              // título de la ventana (opcional; por defecto, el del botón)
              cmd:"whereis -b whoami",          // comando simulado ...
              out:'whoami: /usr/bin/whoami',    // ... y su salida (HTML, mismas clases que en ejemplos.js)
              exp:'<h3>Solo el ejecutable</h3><p>Explicación junto al comando.</p>' } }

   TIPOS DE COMANDO (igual que una diapositiva normal; usa solo uno)
     · cmd + out (+ ruta, info)   un comando.
     · pasos:[ {cmd,out,ruta,info}, … ]   varios comandos en cadena, como una sesión.
     · cast:"cast/mi-grabacion.cast"       grabación de asciinema (necesita cast-player.js).
       Con cast también valen maxPausa, tiempo:"real" y cmds, como en las diapositivas.
     · info en un paso = texto del globo de ayuda; si no lo pones, se usa FUNCION_COMANDOS.

   VARIOS BOTONES: mini puede ser una lista, uno por botón:
     mini:[ { boton:"Con -l", cmd:"ls -l", out:'...', exp:'...' },
            { boton:"Grabación", cast:"cast/ls.cast", exp:'...' } ]

   SI NO PONES exp, el panel muestra solo la terminal.
   El botón sale al final de la explicación; el panel se cierra con ✕, Esc,
   un clic fuera, y también al cambiar de diapositiva. Respeta la velocidad de
   tecleo de los ajustes y "reducir movimiento".

   CÓMO SE ENGANCHA: linux-terminal.html carga este archivo antes del script
   principal y, al pintar cada diapositiva, llama a MiniPanel.montar(dia, zona).
   Los estilos van incluidos aquí abajo y solo usan las variables de la página
   (--ventana, --acento, --term, --papel…), así que siguen el tema elegido.
   ===================================================================== */
(function () {
  'use strict';

  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escHtml = t => Object.assign(document.createElement('div'), { textContent: t }).innerHTML;
  const nuevo = (etiqueta, clase, texto) => {
    const e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  };

  /* ---------------- Estilos (mismos radios, sombra, botones y letra que el resto de ventanas) ---------------- */
  const estilos = document.createElement('style');
  estilos.id = 'mini-estilos';
  estilos.textContent = `
  .mini-acciones{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}
  .mini-btn{font:inherit;font-size:13.5px;font-weight:700;display:inline-flex;align-items:center;gap:8px;background:var(--ventana);color:#fff;
    border:1px solid rgba(255,255,255,.2);padding:6px 14px;border-radius:8px;cursor:pointer;transition:background .2s ease,border-color .2s ease}
  .mini-btn:hover{background:var(--acento);border-color:var(--acento)}
  .mini-btn span{font-size:10px}
  .mini-fondo{position:fixed;inset:0;z-index:32;display:grid;place-items:center;padding:12px}
  .mini-fondo[hidden]{display:none}
  .mini-velo{position:absolute;inset:0;background:rgba(0,0,0,.5);opacity:0;transition:opacity .28s ease}
  .mini-ventana{position:relative;width:min(860px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--ventana);color:#fff;
    border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.55);opacity:0;transform:scale(.97);transition:opacity .22s ease,transform .22s ease}
  .mini-fondo.visible .mini-velo{opacity:1}
  .mini-fondo.visible .mini-ventana{opacity:1;transform:none}
  .mini-ventana .titulo{flex:none;user-select:none}
  .mini-ventana .titulo span{min-width:0;max-width:100%;padding:0 48px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mini-cerrar{position:absolute;right:12px;width:26px;height:26px;padding:0;border:0;border-radius:50%;background:#4a4752;color:#fff;
    font-size:12px;line-height:26px;text-align:center;cursor:pointer}
  .mini-cerrar:hover{background:var(--acento)}
  .mini-cuerpo{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);overflow:auto}
  .mini-sin-exp .mini-cuerpo{grid-template-columns:minmax(0,1fr)}
  .mini-term{display:flex;flex-direction:column;min-width:0;min-height:180px;background:var(--term);color:var(--term-txt)}
  .mini-pantalla{flex:1;overflow:auto;padding:16px 18px;font:15px/1.55 "Ubuntu Mono","DejaVu Sans Mono",Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word}
  .mini-pie{flex:none;display:flex;justify-content:flex-end;padding:8px 12px;border-top:1px solid color-mix(in srgb,var(--term-txt) 20%,transparent)}
  .mini-rep{font:inherit;font-size:13px;font-weight:700;color:var(--term-txt);background:color-mix(in srgb,var(--term-txt) 12%,transparent);
    border:1px solid color-mix(in srgb,var(--term-txt) 25%,transparent);padding:5px 12px;border-radius:8px;cursor:pointer}
  .mini-rep:hover{background:var(--acento);border-color:var(--acento);color:#fff}
  .mini-exp{min-width:0;overflow:auto;padding:18px 22px;background:var(--papel);color:var(--papel-txt)}
  .mini-exp h3{font-size:17px;margin-bottom:6px}
  .mini-exp p{margin-bottom:8px}
  .mini-exp code{font:14px "Ubuntu Mono","DejaVu Sans Mono",monospace;background:#e1dedb;padding:1px 6px;border-radius:4px}
  .mini-exp ul{padding-left:20px}
  @media (max-width:640px){.mini-cuerpo{grid-template-columns:minmax(0,1fr)}}
  @media (prefers-reduced-motion:reduce){.mini-velo,.mini-ventana,.mini-btn{transition:none}}
  `;
  document.head.append(estilos);

  /* ---------------- Panel: se crea una sola vez, la primera vez que se abre ---------------- */
  let fondo = null, ventana, tituloEl, pantalla, expEl, btnCerrar, btnRepetir;
  let abierto = null;         // definición del mini que se está mostrando
  let origen = null;          // botón que lo abrió (el foco vuelve a él al cerrar)
  let turno = 0;              // invalida animaciones viejas al repetir, cambiar o cerrar
  let temporizador = 0;

  function crearPanel() {
    fondo = nuevo('div', 'mini-fondo'); fondo.hidden = true;
    const velo = nuevo('div', 'mini-velo');
    ventana = nuevo('section', 'mini-ventana');
    ventana.setAttribute('role', 'dialog');
    ventana.setAttribute('aria-modal', 'true');
    ventana.setAttribute('aria-labelledby', 'mini-titulo');

    const barra = nuevo('div', 'titulo');
    tituloEl = nuevo('span'); tituloEl.id = 'mini-titulo';
    btnCerrar = nuevo('button', 'mini-cerrar', '✕');
    btnCerrar.type = 'button'; btnCerrar.setAttribute('aria-label', 'Cerrar el ejemplo');
    barra.append(tituloEl, btnCerrar);

    const cuerpo = nuevo('div', 'mini-cuerpo');
    const term = nuevo('div', 'mini-term');
    pantalla = nuevo('div', 'mini-pantalla');
    pantalla.tabIndex = 0; pantalla.setAttribute('aria-label', 'Terminal simulada');
    const pie = nuevo('div', 'mini-pie');
    btnRepetir = nuevo('button', 'mini-rep', '↻ Repetir');
    btnRepetir.type = 'button';
    pie.append(btnRepetir);
    term.append(pantalla, pie);
    expEl = nuevo('div', 'mini-exp');
    cuerpo.append(term, expEl);

    ventana.append(barra, cuerpo);
    fondo.append(velo, ventana);
    document.body.append(fondo);

    velo.onclick = () => cerrar();
    btnCerrar.onclick = () => cerrar();
    btnRepetir.onclick = () => { if (abierto) reproducir(abierto); };

    ventana.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.stopPropagation(); return; }   // no cambiar de diapositiva con el panel abierto
      if (e.key !== 'Tab') return;
      const enfocables = [...ventana.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.offsetParent !== null);
      if (!enfocables.length) return;
      const primero = enfocables[0], ultimo = enfocables[enfocables.length - 1];
      if (!ventana.contains(document.activeElement)) { e.preventDefault(); primero.focus(); }
      else if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });

    // Globo de ayuda sobre los comandos de la terminal del panel (usa el de la página, si está)
    const globoDe = e => e.target.closest && e.target.closest('.cmd');
    pantalla.addEventListener('mouseover', e => { const el = globoDe(e); if (el && typeof mostrarGlobo === 'function') mostrarGlobo(el, e); });
    pantalla.addEventListener('mouseout', e => { const el = globoDe(e); if (el && typeof ocultarGlobo === 'function' && !(e.relatedTarget && el.contains(e.relatedTarget))) ocultarGlobo(); });
    pantalla.addEventListener('focusin', e => { const el = globoDe(e); if (el && typeof mostrarGlobo === 'function') mostrarGlobo(el); });
    pantalla.addEventListener('focusout', () => { if (typeof ocultarGlobo === 'function') ocultarGlobo(); });
    pantalla.addEventListener('scroll', () => { if (typeof ocultarGlobo === 'function') ocultarGlobo(); });
  }

  function abrir(def, boton) {
    if (!fondo) crearPanel();
    clearTimeout(temporizador);
    abierto = def; origen = boton || null;
    tituloEl.textContent = def.titulo || def.boton || 'Ejemplo';
    expEl.innerHTML = def.exp || '';
    ventana.classList.toggle('mini-sin-exp', !def.exp);
    expEl.hidden = !def.exp;
    fondo.classList.toggle('mini-sin-exp', !def.exp);
    fondo.hidden = false;
    void fondo.offsetWidth;                  // fuerza el primer dibujado para que el fundido de entrada se anime
    fondo.classList.add('visible');
    btnCerrar.focus();
    reproducir(def);
  }

  function cerrar(sinFoco) {
    if (!fondo || fondo.hidden) return;
    turno++;                                 // corta la animación que estuviera en marcha
    abierto = null;
    if (typeof ocultarGlobo === 'function') ocultarGlobo();
    fondo.classList.remove('visible');
    temporizador = setTimeout(() => { fondo.hidden = true; }, sinMovimiento ? 0 : 230);
    if (!sinFoco && origen && document.contains(origen)) origen.focus();
    origen = null;
  }

  /* ---------------- Reproducción: mismo comportamiento que la terminal principal ---------------- */
  async function reproducir(def) {
    const mio = ++turno, p = pantalla;
    const vivo = () => mio === turno && fondo && !fondo.hidden;
    const vel = typeof ajustes === 'object' && ajustes && typeof ajustes.vel === 'number' ? ajustes.vel : 20;
    const quieto = (typeof reducido !== 'undefined' && reducido) || sinMovimiento;
    const infoDe = typeof infoComando === 'function' ? infoComando : (paso => paso.info || '');
    const prompt = ruta => (typeof promptHtml === 'function' ? promptHtml(ruta) : '$ ');
    if (typeof ocultarGlobo === 'function') ocultarGlobo();

    // Grabación de asciinema: { cast:"clave-o-ruta", maxPausa, tiempo:"real", cmds }
    if (def.cast) {
      p.innerHTML = '';
      if (typeof CastPlayer === 'undefined') { p.textContent = '# Falta cast-player.js para reproducir la grabación.'; return; }
      try {
        const grabacion = await CastPlayer.cargar(def.cast);
        if (!vivo()) return;
        await CastPlayer.reproducir(grabacion, p, {
          msPorLetra: def.tiempo === 'real' ? null : vel,
          instantaneo: quieto || (vel === 0 && def.tiempo !== 'real'),
          maxPausa: def.maxPausa,
          comandos: Array.isArray(def.cmds) ? def.cmds.map(m => typeof m === 'string' ? m : m.cmd) : null,
          info: Array.isArray(def.cmds) && !def.cmds.length ? null : (texto => {
            const propio = Array.isArray(def.cmds) ? def.cmds.find(m => m && typeof m === 'object' && m.cmd === texto) : null;
            return infoDe({ cmd: texto, info: propio && propio.info });
          }),
          vivo
        });
      } catch (err) {
        if (vivo()) p.textContent = '# No se pudo reproducir la grabación: ' + err.message;
      }
      return;
    }

    // Terminal simulada: cmd/out (+ruta, info) o varios en cadena (pasos)
    const pasos = def.pasos || [{ cmd: def.cmd, out: def.out, ruta: def.ruta, info: def.info }];
    const instantaneo = quieto || vel === 0;
    const esc = t => escHtml(t);
    const espera = ms => new Promise(r => setTimeout(r, ms));
    let hecho = '', ruta = '~';
    for (const paso of pasos) {
      if (!vivo()) return;
      const texto = String(paso.cmd == null ? '' : paso.cmd);
      p.innerHTML = hecho + prompt(ruta) + '<span class="mini-tec"></span><span class="cursor"></span>';
      const tec = p.querySelector('.mini-tec');
      if (instantaneo) tec.textContent = texto;
      else for (const ch of texto) { if (!vivo()) return; tec.textContent += ch; await espera(vel); }
      const conGlobo = typeof comandoHtml === 'function' ? comandoHtml(paso, esc) : esc(texto);
      hecho += prompt(ruta) + conGlobo + '\n' + (paso.out ? paso.out + '\n' : '');
      if (paso.ruta) ruta = paso.ruta;
      p.innerHTML = hecho; p.scrollTop = p.scrollHeight;
      if (!instantaneo) await espera(350);   // pausa entre comandos de la cadena
      if (!vivo()) return;
    }
    p.innerHTML = hecho + prompt(ruta) + '<span class="cursor"></span>';
    p.scrollTop = p.scrollHeight;
  }

  /* ---------------- Enganche con la página ---------------- */
  // linux-terminal.html llama a esto cada vez que pinta una diapositiva, justo después de poner su explicación.
  function montar(dia, zona) {
    cerrar(true);                            // si había un panel abierto de la diapositiva anterior, se cierra
    const lista = [].concat(dia && dia.mini ? dia.mini : []).filter(Boolean);
    if (!lista.length || !zona) return;
    const fila = nuevo('div', 'mini-acciones');
    lista.forEach((def, i) => {
      const hayComando = def.cast || def.cmd || (Array.isArray(def.pasos) && def.pasos.length);
      if (!hayComando) { console.warn('Mini-panel: el elemento ' + (i + 1) + ' de "mini" necesita cmd, pasos o cast; se ignora.'); return; }
      const b = nuevo('button', 'mini-btn');
      b.type = 'button';
      b.setAttribute('aria-haspopup', 'dialog');
      const icono = nuevo('span', '', '▶'); icono.setAttribute('aria-hidden', 'true');
      b.append(icono, document.createTextNode(def.boton || 'Ver ejemplo'));
      b.onclick = () => abrir(def, b);
      fila.append(b);
    });
    if (fila.children.length) zona.append(fila);
  }

  window.MiniPanel = { montar, abrir, cerrar };
})();
