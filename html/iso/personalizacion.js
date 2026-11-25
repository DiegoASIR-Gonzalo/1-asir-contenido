/* =====================================================================
   PERSONALIZACIÓN COMPARTIDA · personalizacion.js
   ---------------------------------------------------------------------
   La usan linux-terminal.html y regex-desglose.html. Ambas páginas tienen el
   mismo botón cuadriculado y el mismo panel (ids: btn-ajustes, panel-ajustes,
   tema, colores, vel, fondo-anim-sel, fondo-elegir, fondo-archivo, fondo-quitar,
   restablecer, fondo-anim, aviso) y comparten los ajustes guardados en el
   navegador: ajustes-terminal, fondo-terminal y fondo-animado.

   Orden de carga: ejemplos.js (si la página lo usa) → personalizacion.js → script
   principal de la página. Si ejemplos.js define FONDO_IMAGEN o FONDO_ANIMADO, se usan
   como valores por defecto; si no existen, se toma "" (degradado, sin animación).

   Expone window.Personalizacion. Al cambiar la velocidad o restablecer, lanza el
   evento "personalizacion:cambio" sobre document por si la página necesita reaccionar.
   ===================================================================== */
(function(){
const $ = id => document.getElementById(id);
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Aviso flotante (fondo cambiado, ajustes restablecidos…)
let tAviso = 0;
function avisar(texto){
  const caja = $('aviso'); if (!caja) return;
  caja.textContent = texto; caja.classList.add('visible');
  clearTimeout(tAviso); tAviso = setTimeout(() => caja.classList.remove('visible'), 2800);
}
const FONDO_POR_DEFECTO = typeof FONDO_IMAGEN === 'string' ? FONDO_IMAGEN : '';

/* ---------------- Panel de personalización ----------------
   EDITABLE: añade colores a AJUSTES_COLORES (v = variable CSS de :root, t = etiqueta)
   o temas a TEMAS (cada tema da un valor #rrggbb a cada variable). */
const AJUSTES_COLORES = [
  {v:'--term', t:'Fondo'}, {v:'--term-txt', t:'Texto'}, {v:'--usuario', t:'Usuario'},
  {v:'--ruta', t:'Ruta'}, {v:'--carpeta', t:'Carpetas'}, {v:'--exec', t:'Ejecutables'}, {v:'--marca', t:'Resaltado'},
  {v:'--kw', t:'Código: palabras clave'}, {v:'--str', t:'Código: textos'}, {v:'--com', t:'Código: comentarios'}
];
const TEMAS = {
  'Ubuntu':     {'--term':'#300a24','--term-txt':'#eeeeec','--usuario':'#8ae234','--ruta':'#729fcf','--carpeta':'#729fcf','--exec':'#8ae234','--marca':'#fce94f','--kw':'#ad7fa8','--str':'#e9b96e','--com':'#888a85'},
  'Matrix':     {'--term':'#000000','--term-txt':'#39ff14','--usuario':'#39ff14','--ruta':'#00c853','--carpeta':'#00e5ff','--exec':'#b2ff59','--marca':'#ffeb3b','--kw':'#76ff03','--str':'#ffee58','--com':'#2e7d32'},
  'Solarizado': {'--term':'#002b36','--term-txt':'#93a1a1','--usuario':'#859900','--ruta':'#268bd2','--carpeta':'#2aa198','--exec':'#b58900','--marca':'#cb4b16','--kw':'#6c71c4','--str':'#b58900','--com':'#586e75'},
  'Claro':      {'--term':'#fafafa','--term-txt':'#2e3436','--usuario':'#4e9a06','--ruta':'#3465a4','--carpeta':'#3465a4','--exec':'#4e9a06','--marca':'#c4a000','--kw':'#75507b','--str':'#8f5902','--com':'#6e7371'}
};
const VEL_DEFECTO = 24; // milisegundos por letra
// fondo: "" = usar FONDO_IMAGEN · "ninguna" = solo degradado · otro valor = imagen elegida por la persona (data URL)
// animado: "" = usar FONDO_ANIMADO · "ninguno" = sin animación · otro valor = clave de FONDOS_ANIMADOS (tapa la imagen)
const ajustes = { colores:{...TEMAS.Ubuntu}, vel:VEL_DEFECTO, fondo:'', animado:'' };
const fondoAnimado = () => ajustes.animado === 'ninguno' ? '' : (ajustes.animado || (typeof FONDO_ANIMADO === 'string' ? FONDO_ANIMADO : ''));

// Recupera lo guardado (si el navegador lo permite) validando los datos para que uno corrupto no rompa la página
try {
  const guardado = JSON.parse(localStorage.getItem('ajustes-terminal')) || {};
  const claves = AJUSTES_COLORES.map(o => o.v);
  const esColor = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
  if (guardado.colores && typeof guardado.colores === 'object')
    for (const k of claves) if (esColor(guardado.colores[k])) ajustes.colores[k] = guardado.colores[k];
  const vel = Number(guardado.vel);
  if (Number.isFinite(vel)) ajustes.vel = Math.max(0, Math.min(120, Math.round(vel)));
  ajustes.fondo = localStorage.getItem('fondo-terminal') || '';
  ajustes.animado = localStorage.getItem('fondo-animado') || '';
} catch (e) {}
// La imagen se guarda aparte: si no cupiera, los colores y la velocidad se conservan igualmente.
// Devuelve false si el navegador no pudo guardar (por ejemplo, cuota llena).
const guardar = () => {
  let ok = true;
  try { localStorage.setItem('ajustes-terminal', JSON.stringify({ colores: ajustes.colores, vel: ajustes.vel })); } catch (e) { ok = false; }
  try { if (ajustes.fondo) localStorage.setItem('fondo-terminal', ajustes.fondo); else localStorage.removeItem('fondo-terminal'); } catch (e) { ok = false; }
  try { if (ajustes.animado) localStorage.setItem('fondo-animado', ajustes.animado); else localStorage.removeItem('fondo-animado'); } catch (e) { ok = false; }
  return ok;
};

// Aplica los ajustes a la página y sincroniza los controles
function aplicar(){
  if (ajustes.animado && ajustes.animado !== 'ninguno' && !FONDOS_ANIMADOS[ajustes.animado]) ajustes.animado = '';
  for (const k in ajustes.colores) document.documentElement.style.setProperty(k, ajustes.colores[k]);
  const imagen = ajustes.fondo === 'ninguna' ? '' : (ajustes.fondo || FONDO_POR_DEFECTO);
  document.documentElement.style.setProperty('--fondo-img', imagen ? 'url("' + imagen.replace(/"/g, '%22') + '")' : 'none');
  const anim = FONDOS_ANIMADOS[fondoAnimado()] ? fondoAnimado() : '';
  if (anim !== fondoClave || (anim && lienzoFondo.hidden)) iniciarFondo(anim);
  $('fondo-anim-sel').value = anim || 'ninguno';
  AJUSTES_COLORES.forEach((o, i) => $('col' + i).value = ajustes.colores[o.v]);
  $('vel').value = ajustes.vel;
  $('vel-txt').textContent = ajustes.vel ? ajustes.vel + ' ms por letra' : 'instantáneo';
}

// Selectores de color
AJUSTES_COLORES.forEach((o, i) => {
  const fila = document.createElement('label'); fila.className = 'fila'; fila.append(o.t);
  const inp = document.createElement('input'); inp.type = 'color'; inp.id = 'col' + i;
  inp.oninput = () => { ajustes.colores[o.v] = inp.value; aplicar(); guardar(); };
  fila.append(inp); $('colores').append(fila);
});

// Temas predefinidos
$('tema').innerHTML = '<option value="">Elegir tema…</option>';
Object.keys(TEMAS).forEach(n => { const op = document.createElement('option'); op.value = op.textContent = n; $('tema').append(op); });
$('tema').onchange = () => {
  if (!$('tema').value) return;
  ajustes.colores = {...TEMAS[$('tema').value]}; $('tema').value = '';
  aplicar(); guardar();
};

// Velocidad: se actualiza al mover y, al soltar, repite el comando para que veas el resultado
$('vel').oninput = () => { ajustes.vel = +$('vel').value; aplicar(); };
$('vel').onchange = () => { guardar(); document.dispatchEvent(new Event('personalizacion:cambio')); };

$('restablecer').onclick = () => {
  if (!confirm('¿Restablecer los colores, la velocidad, el fondo de pantalla y la animación?')) return;
  ajustes.colores = {...TEMAS.Ubuntu}; ajustes.vel = VEL_DEFECTO; ajustes.fondo = ''; ajustes.animado = '';
  aplicar(); guardar(); document.dispatchEvent(new Event('personalizacion:cambio')); avisar('Ajustes restablecidos');
};

// Abrir y cerrar el panel (botón, clic fuera o Escape)
const btnAjustes = $('btn-ajustes'), panel = $('panel-ajustes');
function alternar(abierto){ panel.hidden = !abierto; btnAjustes.setAttribute('aria-expanded', abierto); }
btnAjustes.onclick = () => alternar(panel.hidden);
addEventListener('keydown', e => { if (e.key === 'Escape') alternar(false); });
addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target) && !btnAjustes.contains(e.target)) alternar(false); });


// Fondo de pantalla: se reduce a 1280 px como máximo para que ocupe poco y quepa en localStorage
function cargarImagen(archivo){
  const img = new Image(), url = URL.createObjectURL(archivo);
  img.onload = () => {
    try {
      const k = Math.min(1, 1280 / Math.max(img.width, img.height));
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(img.width * k); lienzo.height = Math.round(img.height * k);
      lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
      ajustes.fondo = lienzo.toDataURL('image/jpeg', .8);
      ajustes.animado = 'ninguno';   // al elegir una imagen se quita la animación para que se vea
      aplicar();
      const guardada = guardar();
      avisar(guardada ? 'Imagen de fondo aplicada' : 'Imagen aplicada, pero el navegador no pudo guardarla');
      if (!guardada) console.warn('Fondo: no se pudo guardar la imagen (cuota de localStorage llena).');
    } catch (e) {
      avisar('No se pudo procesar la imagen');
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  img.onerror = () => { URL.revokeObjectURL(url); avisar('No se pudo leer la imagen'); };
  img.src = url;
}
$('fondo-elegir').onclick = () => $('fondo-archivo').click();
$('fondo-archivo').onchange = e => { const f = e.target.files[0]; if (f) cargarImagen(f); e.target.value = ''; };
$('fondo-quitar').onclick = () => {
  ajustes.fondo = 'ninguna'; ajustes.animado = 'ninguno'; aplicar(); guardar();
  avisar('Fondo de pantalla restablecido');
};

/* =====================================================================
   FONDOS ANIMADOS (panel de personalización › "Animado")
   ---------------------------------------------------------------------
   Se dibujan en un <canvas> fijo detrás de todo (#fondo-anim).
   Cada fondo tiene un nombre visible y una función crear(ctx, ancho, alto, dpr)
   que prepara lo necesario y devuelve { dibujar(t, dt) }:
     t  = segundos desde que empezó la animación
     dt = segundos desde el fotograma anterior
   Para añadir uno nuevo, copia un bloque y cambia su clave y su nombre.
   ===================================================================== */
const azar = (a, b) => a + Math.random() * (b - a);
const elegir = lista => lista[Math.floor(Math.random() * lista.length)];
// Lienzo auxiliar para dibujar una sola vez las partes que no se mueven
function lienzoAparte(w, h, dpr){
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [c, x];
}
// Punto de luz difuminado (se reutiliza para cabezas de pulsos y destellos)
function crearDestello(color, r){
  const c = document.createElement('canvas'); c.width = c.height = r * 2;
  const x = c.getContext('2d'), g = x.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.25, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, r * 2, r * 2);
  return c;
}

const FONDOS_ANIMADOS = {

  /* 1 · Microondas: luz cálida que zumba, ondas que oscilan y la rejilla de la puerta delante */
  microondas: { nombre:'Microondas', crear(ctx, w, h, dpr){
    const [rejilla, r] = lienzoAparte(w, h, dpr);
    r.fillStyle = 'rgba(0,0,0,.62)'; r.fillRect(0, 0, w, h);
    r.globalCompositeOperation = 'destination-out';           // agujeros de la rejilla
    for (let y = 3, fila = 0; y < h + 7; y += 7, fila++)
      for (let x = (fila % 2) * 3.5 + 3; x < w + 7; x += 7){ r.beginPath(); r.arc(x, y, 2.3, 0, 7); r.fill(); }
    const luz = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) / 2);
    luz.addColorStop(0, '#ffb347'); luz.addColorStop(.45, '#7a3a08'); luz.addColorStop(1, '#120700');
    const ondas = Array.from({length:7}, (_, i) => ({
      y: h * (.2 + i * .1), amp: azar(18, 60), k: azar(.006, .016), vel: azar(1.2, 2.6) * (i % 2 ? 1 : -1),
      fase: azar(0, 6.3), color: `hsl(${azar(18, 48).toFixed(0)} 100% ${azar(55, 70).toFixed(0)}%)` }));
    return { dibujar(t){
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#0a0400'; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = .75 + .2 * Math.sin(t * 3) + .05 * Math.sin(t * 17);   // zumbido de la lámpara
      ctx.fillStyle = luz; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = ctx.lineJoin = 'round';
      for (const o of ondas){
        const a = o.amp * (.65 + .35 * Math.sin(t * .7 + o.fase));
        ctx.strokeStyle = o.color; ctx.beginPath();
        for (let x = -10; x <= w + 10; x += 8) ctx.lineTo(x, o.y + a * Math.sin(x * o.k + t * o.vel + o.fase));
        // halo: el mismo trazo varias veces, de ancho y tenue a fino y brillante (más ligero que shadowBlur)
        for (const [ancho, alfa] of [[14, .08], [7, .18], [2.5, 1]]){ ctx.lineWidth = ancho; ctx.globalAlpha = alfa; ctx.stroke(); }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(rejilla, 0, 0, w, h);
    }};
  }},

  /* 2 · Matrix: lluvia de caracteres verdes con la cabeza de cada gota más clara */
  matrix: { nombre:'Matrix', crear(ctx, w, h){
    const tam = 16, letras = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789ABCDEF<>*+=';
    const gotas = Array.from({length: Math.ceil(w / tam)}, () => ({ y: azar(-h / tam, 0), vel: azar(.4, 1), fila: -1 }));
    let acum = 1;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    ctx.font = `bold ${tam - 2}px "Noto Sans JP", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    return { dibujar(t, dt){
      acum += dt; if (acum < 1 / 20) return; acum = 0;          // unos 20 pasos por segundo
      ctx.fillStyle = 'rgba(0,0,0,.07)'; ctx.fillRect(0, 0, w, h);  // las letras antiguas se van apagando
      gotas.forEach((g, i) => {
        g.y += g.vel; const fila = Math.floor(g.y); if (fila === g.fila) return;
        const x = i * tam + tam / 2;
        if (g.fila >= 0){                                          // la cabeza anterior pasa a verde
          ctx.fillStyle = '#000'; ctx.fillRect(i * tam, g.fila * tam, tam, tam);
          ctx.fillStyle = '#22d63a'; ctx.fillText(elegir(letras), x, g.fila * tam);
        }
        g.fila = fila;
        if (fila >= 0){ ctx.fillStyle = '#d8ffd8'; ctx.fillText(elegir(letras), x, fila * tam); }
        if (fila * tam > h && Math.random() > .95){ g.y = azar(-20, 0); g.fila = -1; g.vel = azar(.4, 1); }
      });
    }};
  }},

  /* 3 · Cuadrícula eléctrica: rejilla verdosa con pulsos que la recorren, nodos que destellan y chispazos */
  cuadricula: { nombre:'Cuadrícula eléctrica', crear(ctx, w, h, dpr){
    const S = 44, nx = Math.ceil(w / S) + 1, ny = Math.ceil(h / S) + 1;
    const [base, b] = lienzoAparte(w, h, dpr);
    const fondo = b.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) / 2);
    fondo.addColorStop(0, '#04210f'); fondo.addColorStop(1, '#000804');
    b.fillStyle = fondo; b.fillRect(0, 0, w, h);
    b.strokeStyle = 'rgba(60,255,140,.14)'; b.lineWidth = 1; b.beginPath();
    for (let i = 0; i < nx; i++){ b.moveTo(i * S + .5, 0); b.lineTo(i * S + .5, h); }
    for (let j = 0; j < ny; j++){ b.moveTo(0, j * S + .5); b.lineTo(w, j * S + .5); }
    b.stroke();
    b.fillStyle = 'rgba(120,255,170,.3)';
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) b.fillRect(i * S - 1, j * S - 1, 2, 2);

    const chispa = crearDestello('rgba(80,255,150,.9)', 18), nodo = crearDestello('rgba(80,255,150,.6)', 26);
    const DIRS = [[1,0],[0,1],[-1,0],[0,-1]];
    const brillo = new Map();                                    // nodo "i,j" → intensidad del destello
    const nuevo = () => ({ i: Math.floor(azar(0, nx)), j: Math.floor(azar(0, ny)), d: Math.floor(azar(0, 4)),
                           p: 0, vel: azar(3, 7), vida: azar(2, 6), estela: [], muerto: false });
    const pulsos = Array.from({length: Math.max(8, Math.min(40, Math.round(w * h / 45000)))}, nuevo);
    const arcos = []; let proximoArco = 1;
    return { dibujar(t, dt){
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(base, 0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      // barrido suave de luz de arriba abajo
      const yb = (t * 120) % (h + 300) - 150, barrido = ctx.createLinearGradient(0, yb - 150, 0, yb + 150);
      barrido.addColorStop(0, 'rgba(40,255,120,0)'); barrido.addColorStop(.5, 'rgba(40,255,120,.06)'); barrido.addColorStop(1, 'rgba(40,255,120,0)');
      ctx.fillStyle = barrido; ctx.fillRect(0, yb - 150, w, 300);
      // pulsos que viajan por las líneas y a veces giran en un cruce
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let k = 0; k < pulsos.length; k++){
        const q = pulsos[k];
        if (!q.muerto){
          q.vida -= dt; q.p += q.vel * dt;
          while (q.p >= 1){
            q.p -= 1; q.i += DIRS[q.d][0]; q.j += DIRS[q.d][1];
            brillo.set(q.i + ',' + q.j, 1);
            const r = Math.random(); if (r < .35) q.d = (q.d + (r < .175 ? 1 : 3)) % 4;
          }
          const x = (q.i + DIRS[q.d][0] * q.p) * S, y = (q.j + DIRS[q.d][1] * q.p) * S;
          q.estela.push([x, y, t]);
          if (q.vida <= 0 || x < -S || y < -S || x > w + S || y > h + S) q.muerto = true;
        }
        while (q.estela.length && t - q.estela[0][2] > .45) q.estela.shift();
        if (q.muerto && !q.estela.length){ pulsos[k] = nuevo(); continue; }
        for (let m = 1; m < q.estela.length; m++){
          const [x0, y0] = q.estela[m - 1], [x1, y1, tm] = q.estela[m];
          ctx.strokeStyle = `rgba(110,255,170,${(1 - (t - tm) / .45).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        if (!q.muerto && q.estela.length){ const [x, y] = q.estela[q.estela.length - 1]; ctx.drawImage(chispa, x - 18, y - 18); }
      }
      // los cruces por los que ha pasado un pulso destellan y se apagan
      for (const [clave, v] of brillo){
        const [i, j] = clave.split(','), s = 52 * v;
        ctx.globalAlpha = v; ctx.drawImage(nodo, i * S - s / 2, j * S - s / 2, s, s);
        const nv = v - dt * 1.6; if (nv <= 0) brillo.delete(clave); else brillo.set(clave, nv);
      }
      ctx.globalAlpha = 1;
      // chispazos: pequeños rayos entre dos nodos cercanos
      if (t >= proximoArco){
        proximoArco = t + azar(.6, 2.5);
        const i = Math.floor(azar(0, nx)), j = Math.floor(azar(0, ny)), horiz = Math.random() < .5, n = Math.floor(azar(1, 4));
        const pts = [], pasos = 10 * n;
        for (let m = 0; m <= pasos; m++){
          const u = m / pasos, ruido = m && m < pasos ? azar(-9, 9) : 0;
          pts.push(horiz ? [(i + u * n) * S, j * S + ruido] : [i * S + ruido, (j + u * n) * S]);
        }
        arcos.push({ pts, vida: .25 });
        brillo.set(i + ',' + j, 1); brillo.set(horiz ? (i + n) + ',' + j : i + ',' + (j + n), 1);
      }
      ctx.shadowColor = '#5dff9a'; ctx.shadowBlur = 12; ctx.lineWidth = 1.6;
      for (let k = arcos.length - 1; k >= 0; k--){
        const a = arcos[k]; a.vida -= dt; if (a.vida <= 0){ arcos.splice(k, 1); continue; }
        ctx.strokeStyle = `rgba(220,255,230,${(a.vida / .25 * (Math.random() * .5 + .5)).toFixed(3)})`;
        ctx.beginPath(); a.pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke();
      }
      ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    }};
  }},

  /* 4 · Placa base: pistas, chips y vías generados al azar; algunas pistas se iluminan de vez en cuando */
  placa: { nombre:'Placa base', crear(ctx, w, h, dpr){
    const S = 12, nx = Math.floor(w / S), ny = Math.floor(h / S);
    const ocupado = new Uint8Array(nx * ny);
    const dentro = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny;
    const libre = (i, j) => dentro(i, j) && !ocupado[j * nx + i];
    const marcar = (i, j) => { if (dentro(i, j)) ocupado[j * nx + i] = 1; };
    const centro = (i, j) => [i * S + S / 2, j * S + S / 2];

    // 1) Componentes: CPU, ranuras de RAM, chips pequeños y condensadores
    const chips = [], pines = [];
    function ponerChip(i, j, cw, ch, tipo, lados){
      i = Math.round(i); j = Math.round(j);
      if (i < 2 || j < 2 || i + cw > nx - 2 || j + ch > ny - 2) return false;
      for (let a = i - 2; a < i + cw + 2; a++) for (let c = j - 2; c < j + ch + 2; c++) if (!libre(a, c)) return false;
      for (let a = i - 1; a <= i + cw; a++) for (let c = j - 1; c <= j + ch; c++) marcar(a, c);   // cuerpo + anillo de patillas
      chips.push({ i, j, cw, ch, tipo });
      const saltar = tipo === 'cpu' ? .15 : .3;
      if (lados.includes('n')) for (let a = i; a < i + cw; a++) if (Math.random() > saltar) pines.push([a, j - 1, 6]);
      if (lados.includes('s')) for (let a = i; a < i + cw; a++) if (Math.random() > saltar) pines.push([a, j + ch, 2]);
      if (lados.includes('o')) for (let c = j; c < j + ch; c++) if (Math.random() > saltar) pines.push([i - 1, c, 4]);
      if (lados.includes('e')) for (let c = j; c < j + ch; c++) if (Math.random() > saltar) pines.push([i + cw, c, 0]);
      return true;
    }
    const lado = Math.max(8, Math.min(22, Math.round(Math.min(nx, ny) * .22)));
    ponerChip(nx * .33 - lado / 2, ny * .5 - lado / 2, lado, lado, 'cpu', 'nsoe');
    const altoRam = Math.round(ny * .55), iRam = Math.round(nx * .33 + lado / 2 + 7);
    for (let k = 0; k < 4; k++) ponerChip(iRam + k * 5, ny * .5 - altoRam / 2, 2, altoRam, 'ram', 'oe');
    for (let n = 0; n < 60 && chips.length < 18; n++){
      const cw = Math.floor(azar(3, 8)), ch = Math.floor(azar(2, 6));
      ponerChip(azar(2, nx - cw - 2), azar(2, ny - ch - 2), cw, ch, 'chip', cw >= ch ? 'ns' : 'oe');
    }
    const condensadores = [];
    for (let n = 0; n < 80 && condensadores.length < 14; n++){
      const i = Math.floor(azar(2, nx - 3)), j = Math.floor(azar(2, ny - 3));
      if ([0, 1].every(a => [0, 1].every(c => libre(i + a, j + c)))){
        [0, 1].forEach(a => [0, 1].forEach(c => marcar(i + a, j + c)));
        condensadores.push([(i + 1) * S, (j + 1) * S]);
      }
    }

    // 2) Pistas: avanzan por una rejilla invisible con giros de 45° y sin cruzarse
    const D8 = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    const pistas = [];
    function trazar(i, j, d, max, viaInicial){
      const pts = [centro(i, j)]; let pasos = 0;
      while (pasos < max){
        const pref = Math.random() < .1 ? (d + (Math.random() < .5 ? 1 : 7)) % 8 : d;
        let movido = false;
        for (const giro of [0, 1, 7]){
          const nd = (pref + giro) % 8;
          if (nd === (d + 4) % 8 || !libre(i + D8[nd][0], j + D8[nd][1])) continue;
          if (nd !== d){ pts.push(centro(i, j)); d = nd; }
          i += D8[nd][0]; j += D8[nd][1]; marcar(i, j); movido = true; break;
        }
        if (!movido) break;
        pasos++;
      }
      if (pasos < 4) return;
      pts.push(centro(i, j));
      const acum = [0];
      for (let m = 1; m < pts.length; m++) acum.push(acum[m - 1] + Math.hypot(pts[m][0] - pts[m - 1][0], pts[m][1] - pts[m - 1][1]));
      pistas.push({ pts, acum, largo: acum[acum.length - 1], viaInicial });
    }
    pines.sort(() => Math.random() - .5).forEach(([i, j, d]) => { if (Math.random() < .75) trazar(i, j, d, Math.floor(azar(8, 60)), false); });
    for (let n = 0, intentos = Math.round(nx * ny / 45); n < intentos; n++){
      const i = Math.floor(azar(0, nx)), j = Math.floor(azar(0, ny));
      if (!libre(i, j)) continue;
      marcar(i, j); trazar(i, j, Math.floor(azar(0, 4)) * 2, Math.floor(azar(6, 40)), true);
    }

    // 3) Dibujo estático de la placa (una sola vez)
    const [base, b] = lienzoAparte(w, h, dpr);
    const fondo = b.createLinearGradient(0, 0, w, h);
    fondo.addColorStop(0, '#0d3a22'); fondo.addColorStop(1, '#062414');
    b.fillStyle = fondo; b.fillRect(0, 0, w, h);
    b.lineCap = b.lineJoin = 'round';
    b.strokeStyle = '#1d7245'; b.lineWidth = 2;
    for (const p of pistas){ b.beginPath(); p.pts.forEach(([x, y]) => b.lineTo(x, y)); b.stroke(); }
    const via = (x, y) => { b.beginPath(); b.arc(x, y, 3.2, 0, 7); b.fillStyle = '#062414'; b.fill(); b.strokeStyle = '#c9a94a'; b.lineWidth = 1.5; b.stroke(); };
    for (const p of pistas){ const f = p.pts[p.pts.length - 1]; via(f[0], f[1]); if (p.viaInicial) via(p.pts[0][0], p.pts[0][1]); }
    b.fillStyle = '#b9b9ad';                                         // patillas
    for (const [i, j, d] of pines){
      const [x, y] = centro(i, j);
      if (d === 0 || d === 4) b.fillRect(x - S / 2, y - 2, S, 4); else b.fillRect(x - 2, y - S / 2, 4, S);
    }
    b.font = '9px monospace'; b.textBaseline = 'bottom';
    let ram = 1, ic = 1;
    for (const c of chips){
      const x = c.i * S, y = c.j * S, cw = c.cw * S, ch = c.ch * S;
      b.fillStyle = c.tipo === 'ram' ? '#191919' : '#111316'; b.fillRect(x, y, cw, ch);
      b.strokeStyle = '#2c3136'; b.lineWidth = 1; b.strokeRect(x + .5, y + .5, cw - 1, ch - 1);
      b.fillStyle = 'rgba(255,255,255,.55)';
      if (c.tipo === 'cpu'){
        b.fillStyle = '#23272c'; b.fillRect(x + cw * .2, y + ch * .2, cw * .6, ch * .6);
        b.fillStyle = 'rgba(255,255,255,.5)'; b.font = '11px monospace'; b.fillText('NX-CORE', x + cw * .24, y + ch * .5); b.font = '9px monospace';
        b.fillText('CPU1', x, y - S - 2);
      } else if (c.tipo === 'ram'){
        b.fillStyle = '#000'; b.fillRect(x + cw / 2 - 1, y + 8, 2, ch - 16);
        b.fillStyle = '#d9d9d9'; b.fillRect(x, y, cw, 6); b.fillRect(x, y + ch - 6, cw, 6);
        b.fillStyle = 'rgba(255,255,255,.55)'; b.fillText('DIMM' + ram++, x - 6, y - S - 2);
      } else b.fillText('U' + ic++, x, y - S - 2);
    }
    for (const [x, y] of condensadores){
      b.beginPath(); b.arc(x, y, 8, 0, 7); b.fillStyle = '#2a2d31'; b.fill(); b.strokeStyle = '#9a9a92'; b.lineWidth = 1.5; b.stroke();
      b.beginPath(); b.moveTo(x - 5, y); b.lineTo(x + 5, y); b.moveTo(x, y - 5); b.lineTo(x, y + 5); b.strokeStyle = '#55595e'; b.stroke();
    }

    // 4) Animación: cada cierto tiempo una pista al azar se enciende de punta a punta y se apaga
    function trazoParcial(p, d0, d1){
      let ultimo = null; ctx.beginPath();
      for (let m = 1; m < p.pts.length; m++){
        const a = p.acum[m - 1], z = p.acum[m]; if (z < d0) continue; if (a > d1) break;
        const [x0, y0] = p.pts[m - 1], [x1, y1] = p.pts[m], seg = z - a || 1;
        const u0 = Math.max(0, (d0 - a) / seg), u1 = Math.min(1, (d1 - a) / seg);
        if (!ultimo) ctx.moveTo(x0 + (x1 - x0) * u0, y0 + (y1 - y0) * u0);
        ultimo = [x0 + (x1 - x0) * u1, y0 + (y1 - y0) * u1]; ctx.lineTo(ultimo[0], ultimo[1]);
      }
      ctx.stroke(); return ultimo;
    }
    const colores = ['#6dffb0', '#6dffb0', '#7df9ff', '#ffd36d'];
    const destellos = Object.fromEntries(colores.map(c => [c, crearDestello(c, 16)]));
    const activas = []; let siguiente = 0;
    return { dibujar(t, dt){
      ctx.drawImage(base, 0, 0, w, h);
      if (t >= siguiente && pistas.length){
        siguiente = t + azar(.08, .4);
        activas.push({ p: elegir(pistas), d: 0, vel: azar(250, 600), fin: 0, color: elegir(colores) });
      }
      ctx.lineCap = ctx.lineJoin = 'round';
      for (let k = activas.length - 1; k >= 0; k--){
        const a = activas[k], L = a.p.largo;
        if (a.d < L) a.d = Math.min(L, a.d + a.vel * dt); else a.fin += dt;
        const alfa = Math.max(0, 1 - a.fin / .9);
        if (alfa <= 0){ activas.splice(k, 1); continue; }
        ctx.strokeStyle = ctx.shadowColor = a.color;
        ctx.globalAlpha = .4 * alfa; ctx.lineWidth = 2; ctx.shadowBlur = 6;
        trazoParcial(a.p, 0, a.d);                                   // tramo ya recorrido, encendido
        ctx.globalAlpha = alfa; ctx.lineWidth = 2.6; ctx.shadowBlur = 14;
        const punta = trazoParcial(a.p, Math.max(0, a.d - 90), a.d); // estela brillante
        ctx.shadowBlur = 0;
        if (punta) ctx.drawImage(destellos[a.color], punta[0] - 16, punta[1] - 16);
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }};
  }}
};

// Motor: prepara el lienzo, arranca el fondo elegido y lo rehace si cambia el tamaño de la ventana
const lienzoFondo = $('fondo-anim'), ctxFondo = lienzoFondo.getContext('2d');
let fondoClave = '', fondoFotograma = 0;
function iniciarFondo(clave){
  cancelAnimationFrame(fondoFotograma); fondoClave = clave;
  const def = FONDOS_ANIMADOS[clave];
  lienzoFondo.hidden = !def; if (!def) return;
  const dpr = Math.min(devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight;
  lienzoFondo.width = Math.round(w * dpr); lienzoFondo.height = Math.round(h * dpr);
  ctxFondo.setTransform(dpr, 0, 0, dpr, 0, 0);
  const fondo = def.crear(ctxFondo, w, h, dpr);
  // Con "reducir movimiento" activado en el sistema se muestra un fotograma fijo
  if (reducido){ for (let n = 0; n < 240; n++) fondo.dibujar(n / 60, 1 / 60); return; }
  let inicio = null, previo = 0;
  const paso = ahora => {
    if (inicio === null) inicio = previo = ahora;
    fondo.dibujar((ahora - inicio) / 1000, Math.min(.1, (ahora - previo) / 1000)); previo = ahora;
    fondoFotograma = requestAnimationFrame(paso);
  };
  fondoFotograma = requestAnimationFrame(paso);
}
let esperaTamano;
addEventListener('resize', () => { clearTimeout(esperaTamano); esperaTamano = setTimeout(() => { if (fondoClave) iniciarFondo(fondoClave); }, 200); });

// Selector "Animado" del panel
$('fondo-anim-sel').innerHTML = '<option value="ninguno">Sin animación</option>' +
  Object.entries(FONDOS_ANIMADOS).map(([clave, f]) => `<option value="${clave}">${f.nombre}</option>`).join('');
$('fondo-anim-sel').onchange = () => {
  ajustes.animado = $('fondo-anim-sel').value;
  aplicar(); guardar();
  const fondo = FONDOS_ANIMADOS[ajustes.animado];
  avisar(fondo ? 'Fondo animado: ' + fondo.nombre : 'Animación desactivada');
};


aplicar();   // aplica los ajustes guardados nada más cargar

window.Personalizacion = { ajustes, aplicar, guardar, TEMAS, VEL_DEFECTO, AJUSTES_COLORES, FONDOS_ANIMADOS, avisar };
})();
