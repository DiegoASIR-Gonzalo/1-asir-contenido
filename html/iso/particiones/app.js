"use strict";
const DISK = 21500; // MB (21.5 GB, como en las capturas)
const app = document.getElementById("app");
const fmt = m => m >= 1000 ? (m / 1000).toFixed(1) + " GB" : Math.round(m) + " MB";
const U = {kb:.001, mb:1, gb:1000, tb:1e6, kib:.001024, mib:1.048576, gib:1073.74, tib:1099511.6};
let S = null; // estado de la práctica

function parseSize(v, max) {
  v = v.trim().toLowerCase().replace(",", ".");
  if (v === "max") return max;
  let m = v.match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (m) return max * m[1] / 100;
  m = v.match(/^(\d+(?:\.\d+)?)\s*(kb|mb|gb|tb|kib|mib|gib|tib)?$/);
  return m ? +m[1] * U[m[2] || "mb"] : NaN;
}
const free = () => DISK - S.parts.reduce((a, p) => a + p.size, 0);
const P = m => S.parts.find(p => p.mount === m);
const SW = () => S.parts.find(p => p.fs === "swap");
const rg = (p, a, b) => !!p && p.size >= a && p.size <= b;
const ext = p => !!p && p.fs === "ext4";

/* ---------- Contenido de la guía ---------- */
const G = [
 ["Conceptos básicos", `<p>Un disco se divide en <b>particiones</b>. Cada una se formatea con un <b>sistema de ficheros</b> y se <b>monta</b> en un directorio del árbol de Linux.</p>
  <ul><li>Tabla <code>msdos</code> (MBR, BIOS): máximo <b>4 particiones primarias</b>. Para tener más, una se convierte en <b>extendida</b> y contiene particiones <b>lógicas</b> (numeradas desde la 5). El instalador crea la extendida automáticamente.</li>
  <li>Tabla <code>GPT</code> (UEFI): hasta 128 primarias, sin lógicas.</li>
  <li>Nombres de disco: <code>sda</code> (SATA/SCSI), <code>vda</code> (virtio, máquinas virtuales), <code>nvme0n1</code> (NVMe). La primera primaria es <code>sda1</code> y la primera lógica <code>sda5</code>.</li></ul>
  <p>Cadena completa: disco → partición → sistema de ficheros → punto de montaje.</p>`],
 ["Ficheros y puntos de montaje", `<ul><li><b>ext4</b>: sistema de ficheros transaccional (con journal), el predeterminado.</li>
  <li><b>intercambio (swap)</b>: memoria virtual. No tiene punto de montaje. Orientativo: 1-2 GB en máquinas virtuales; igual a la RAM si se quiere hibernar.</li>
  <li><code>/</code> raíz: obligatoria. <code>/boot</code>: arranque (300-512 MB). <code>/home</code>: datos de usuarios, permite reinstalar sin perderlos. <code>/var</code>: logs, correo y bases de datos (servidores). <code>/tmp</code>: temporales.</li>
  <li>Bloques reservados 5 %: espacio que ext4 reserva para root. Se puede dejar por defecto.</li></ul>`],
 ["Pasos del particionado manual", `<ol><li>Método de particionado: <b>Manual</b>.</li>
  <li>Seleccionar el disco (p. ej. <code>Disco virtual 1 (vda) - 21.5 GB</code>) y aceptar crear una <b>tabla de particiones vacía</b>.</li>
  <li>Seleccionar <b>ESPACIO LIBRE</b> → <i>Crear una partición nueva</i>.</li>
  <li>Indicar el <b>tamaño</b> (<code>10GB</code>, <code>512MB</code>, <code>20%</code> o <code>max</code>).</li>
  <li>Elegir el <b>tipo</b>: Primaria o Lógica, y la ubicación (Principio).</li>
  <li>Configurar: <i>Utilizar como</i> (ext4 / intercambio) y <i>Punto de montaje</i>.</li>
  <li>Pulsar <b>Se ha terminado de definir la partición</b> y repetir para el resto.</li>
  <li>Revisar el resumen y <b>Finalizar el particionado y escribir los cambios en el disco</b> (irreversible).</li></ol>`],
 ["Errores frecuentes", `<ul><li>No definir ninguna partición con punto de montaje <code>/</code>: la instalación no puede continuar.</li>
  <li>Intentar crear más de 4 primarias.</li>
  <li>Usar <code>max</code> en la primera partición y no dejar espacio para las demás.</li>
  <li>Dar punto de montaje a la swap o no marcarla como «intercambio».</li>
  <li>Repetir un punto de montaje en dos particiones.</li>
  <li>Confundir GB (decimal) con GiB (binario): 21.5 GB ≈ 20 GiB.</li>
  <li>Finalizar sin revisar: se borran los datos del disco.</li></ul>`]
];

/* ---------- Actividades ---------- */
const ACTS = [
 {n:"Actividad 1 - Particionado guiado: utilizar todo el disco",
  obj:"Usa el método guiado y observa el esquema que propone Debian. Después finaliza el particionado.",
  hint:"En el método de particionado elige «Guiado - utilizar todo el disco». Debian crea / en ext4 (primaria) y una swap (lógica).",
  chk:()=>[["Se ha usado el método guiado", S.guided],["Existe / en ext4", ext(P("/"))],["Existe un área de intercambio", !!SW()]]},
 {n:"Actividad 2 - Manual: / (ext4) + intercambio",
  obj:"Método manual. Crea una partición primaria de 19.3 GB ext4 montada en «/» y una lógica de 2.1 GB de intercambio.",
  hint:"Disco → tabla vacía → ESPACIO LIBRE → tamaño 19.3GB → Primaria → ext4 y «/». Repite con 2.1GB (o max) → Lógica → intercambio.",
  chk:()=>{const r=P("/"),s=SW();return [["Tabla de particiones creada", S.table],["«/» es primaria, ext4 y mide ≈19.3 GB", !!r&&r.type==="primaria"&&ext(r)&&rg(r,18500,19800)],["La swap es lógica y mide ≈2.1 GB", !!s&&s.type==="lógica"&&rg(s,1800,2400)]]}},
 {n:"Actividad 3 - Manual: separar /home",
  obj:"Crea «/» ext4 primaria de ≈10 GB, intercambio de ≈2 GB y «/home» ext4 con el resto del disco.",
  hint:"Calcula: 21.5 - 10 - 2 = 9.5 GB para /home. Usa «max» en la última partición para aprovechar el espacio libre.",
  chk:()=>{const r=P("/"),h=P("/home"),s=SW();return [["«/» es primaria ext4 de ≈10 GB", !!r&&r.type==="primaria"&&ext(r)&&rg(r,9000,11000)],["Swap de ≈2 GB", rg(s,1500,2600)],["«/home» es ext4 y mide ≥ 8 GB", ext(h)&&rg(h,8000,12000)]]}},
 {n:"Actividad 4 - Manual: esquema de servidor con /boot y /var",
  obj:"Crea: /boot (≈512 MB, primaria, marca de arranque activada), / (≈8 GB), /var (≈5 GB) y swap (≈2 GB). Recuerda el límite de 4 primarias.",
  hint:"Si pones las 4 como primarias no podrás crear más. Usa lógicas para las últimas. Todas ext4 salvo la swap.",
  chk:()=>{const b=P("/boot"),r=P("/"),v=P("/var"),s=SW();return [["/boot primaria, ext4, ≈512 MB", !!b&&b.type==="primaria"&&ext(b)&&rg(b,400,700)],["/boot con marca de arranque", !!b&&b.boot],["«/» ext4 de ≈8 GB", ext(r)&&rg(r,7000,9500)],["/var ext4 de ≈5 GB", ext(v)&&rg(v,4000,6500)],["Swap de ≈2 GB", rg(s,1500,2600)]]}}
];

/* ---------- Motor de pantallas ---------- */
function show(o) {
  const items = o.items || [];
  if (o.sel == null) o.sel = Math.max(0, items.findIndex(i => !i.sp));
  let h = `<h1>${o.title || "Particionado de discos"}</h1><main><div class="frame">`;
  if (o.text) h += `<div class="txt">${o.text}</div>`;
  if (o.label) h += `<div class="lbl">${o.label}</div>`;
  if (o.input != null) h += `<input id="in" value="${o.input}" spellcheck="false">`;
  if (items.length) h += `<ul class="list">` + items.map((it, i) => `<li data-i="${i}" class="${it.sub ? "sub" : ""}${i === o.sel ? " sel" : ""}">${it.t || ""}</li>`).join("") + `</ul>`;
  h += `</div></main><footer><div><button id="bH">Ir a los Comandos</button><button id="bI">Inicio</button></div><div><button id="bB">Retroceder</button><button id="bC">Continuar</button></div></footer>`;
  app.innerHTML = h;
  const lis = [...app.querySelectorAll(".list li")];
  const go = () => o.cont ? o.cont(document.getElementById("in")?.value) : items[o.sel]?.go?.();
  const mark = i => { o.sel = i; lis.forEach((l, k) => l.classList.toggle("sel", k === i)); lis[i]?.scrollIntoView({block:"nearest"}); };
  lis.forEach((l, i) => {
    if (items[i].sp) return;
    l.onclick = () => mark(i);
    l.ondblclick = go;
  });
  document.getElementById("bC").onclick = go;
  document.getElementById("bB").onclick = () => o.back ? o.back() : menu();
  document.getElementById("bI").onclick = menu;
  document.getElementById("bH").onclick = () => window.open("ayuda.html", "_blank");
  window.onkeydown = e => {
    if (e.key === "Enter") { e.preventDefault(); go(); }
    else if (e.key === "Escape") document.getElementById("bB").click();
    else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && lis.length) {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      let i = o.sel + d;
      while (items[i] && items[i].sp) i += d;
      if (items[i]) mark(i);
    }
  };
  const inp = document.getElementById("in");
  if (inp) { inp.focus(); inp.select(); }
}
function msg(text, back) { show({text:`<p>${text}</p>`, cont:back, back}); }
const sp = {sp:1};
function pick(text, label, opts, onPick, back) {
  show({text, label, items:opts.map(o => ({t:o[1], go:() => onPick(o[0])})), back});
}

/* ---------- Menú inicial ---------- */
function menu() {
  S = null;
  show({
    text:"Guía de referencia de particionado en Debian 13 y actividades simuladas para practicar. Seleccione una guía o una actividad.",
    label:"Instrucciones y actividades:",
    items:[...G.map((g, i) => ({t:"Guía " + (i + 1) + " - " + g[0], go:() => guide(i)})), sp,
      ...ACTS.map((a, i) => ({t:a.n, go:() => start(i)}))],
    back:() => {}
  });
}
function guide(i) {
  show({title:"Guía de referencia: " + G[i][0], text:G[i][1], label:`Página ${i + 1} de ${G.length}`,
    cont:() => i < G.length - 1 ? guide(i + 1) : menu(), back:() => i ? guide(i - 1) : menu(),
    help:"Continuar avanza a la siguiente página; al final vuelves al menú."});
}

/* ---------- Simulador ---------- */
function start(a) { S = {a, parts:[], table:false, guided:false}; method(); }
function renum() {
  let p = 0, l = 4;
  S.parts.forEach(x => x.type === "primaria" ? x.n = ++p : x.n = ++l);
  S.parts.sort((a, b) => a.n - b.n);
}
function method() {
  const no = () => msg("Esta opción no se practica en esta actividad.", method);
  show({
    text:`<p>Objetivo: ${ACTS[S.a].obj}</p><p>Este instalador puede guiarle en el particionado del disco (utilizando distintos esquemas estándar) o, si lo desea, puede hacerlo de forma manual.</p>`,
    label:"Método de particionado:",
    items:[
      {t:"Guiado - utilizar todo el disco", go:() => {
        S.guided = true; S.table = true;
        S.parts = [{n:1, type:"primaria", size:19300, fs:"ext4", mount:"/"}, {n:5, type:"lógica", size:2100, fs:"swap", mount:""}];
        summary();
      }},
      {t:"Guiado - utilizar el disco completo y configurar LVM", go:no},
      {t:"Guiado - utilizar todo el disco y configurar LVM cifrado", go:no},
      {t:"Manual", go:summary}
    ]
  });
}
function prow(p) {
  return `<span class="a">&gt;</span><span class="c1">#${p.n}</span><span class="c2">${p.type}</span><span class="c3">${fmt(p.size)}</span><span class="c4">f</span><span class="c5">${p.fs === "swap" ? "intercambio" : p.fs === "none" ? "" : p.fs}</span><span>${p.fs === "swap" ? "intercambio" : p.mount}</span>`;
}
function summary(sel) {
  const it = [
    {t:"Particionado guiado", go:method},
    {t:"Configurar los volúmenes iSCSI", go:() => msg("No necesario en esta práctica.", summary)},
    sp,
    {t:"Disco virtual 1 (vda) - 21.5 GB Virtio Block Device", go:() => S.table ? 0 : confirmTable()}
  ];
  if (S.table) {
    S.parts.forEach((p, i) => it.push({t:prow(p), sub:1, go:() => cfg({...p}, i)}));
    if (free() > 50) it.push({t:`<span class="a">&gt;</span><span class="c1"></span><span class="c2">pri/lóg</span><span class="c3">${fmt(free())}</span><span class="c4"></span><span>ESPACIO LIBRE</span>`, sub:1, go:newPart});
  }
  it.push(sp, {t:"Deshacer los cambios realizados a las particiones", go:() => { S.parts = []; S.table = false; S.guided = false; summary(); }},
    {t:"Finalizar el particionado y escribir los cambios en el disco", go:finish});
  show({
    text:`<p>Objetivo: ${ACTS[S.a].obj}</p><p class="it">Éste es un resumen de las particiones y puntos de montaje que tiene configurados actualmente. Seleccione una partición para modificar sus valores (sistema de ficheros, puntos de montaje, etc.), el espacio libre para añadir una partición nueva o un dispositivo para inicializar la tabla de particiones.</p>`,
    items:it, sel, back:method
  });
}
function confirmTable() {
  pick(`<p>Ha seleccionado un dispositivo completo para particionarlo. Si crea una nueva tabla de particiones en el dispositivo, se eliminarán todas las particiones actuales.</p>`,
    "¿Desea crear una nueva tabla de particiones vacía en este dispositivo?",
    [[1, "Sí"], [0, "No"]], v => { if (v) S.table = true; summary(); }, summary);
}
function newPart() {
  const max = free();
  show({
    text:`<p>El tamaño máximo para esta partición es ${fmt(max)}.</p><p>Sugerencia: "max" puede usarse como un atajo para especificar el tamaño máximo, o introducir un porcentaje (por ejemplo, "20%") para usar ese porcentaje del tamaño máximo. Puedes especificar los tamaños de la partición en unidades decimales (como MB o GB) así como en unidades binarias (como GiB o TiB).</p>`,
    label:"Nuevo tamaño de partición:", input:fmt(max),
    cont:v => {
      const s = parseSize(v || "", max);
      if (!(s > 0)) return msg("El tamaño indicado no es válido.", newPart);
      if (s > max + 0.5) return msg("El tamaño indicado es mayor que el espacio libre.", newPart);
      type(Math.min(s, max));
    }, back:summary
  });
}
function type(size) {
  const prim = S.parts.filter(p => p.type === "primaria").length;
  const o = [["primaria", "Primaria"], ["lógica", "Lógica"]].filter(x => x[0] !== "primaria" || prim < 4);
  pick("", "Tipo de la nueva partición:", o, t => pick("", "Ubicación de la nueva partición:", [[1, "Principio"], [2, "Final"]],
    () => cfg({type:t, size, fs:"ext4", mount:"/", boot:false}, -1), () => type(size)), newPart);
}
const FS = [["ext4", "sistema de ficheros ext4 transaccional"], ["btrfs", "sistema de ficheros btrfs transaccional"], ["swap", "área de intercambio"], ["none", "no utilizar esta partición"]];
const MP = [["/", "/ - el sistema de ficheros raíz"], ["/boot", "/boot - ficheros estáticos del cargador de arranque"], ["/home", "/home - directorios de usuario"], ["/var", "/var - datos variables"], ["/tmp", "/tmp - ficheros temporales"], ["", "ninguno"]];
function cfg(t, edit, sel) {
  const n = edit >= 0 ? S.parts[edit].n : (t.type === "primaria" ? S.parts.filter(p => p.type === "primaria").length + 1 : S.parts.filter(p => p.type === "lógica").length + 5);
  const r = (k, v) => ({t:`<span class="k">${k}</span><span>${v}</span>`});
  const back = () => edit >= 0 ? summary() : newPart();
  const fsT = FS.find(f => f[0] === t.fs)[1];
  const it = [r("Nombre:", ""), {...r("Utilizar como:", fsT), go:() => pick("", "Utilizar como:", FS, v => { t.fs = v; if (v === "swap" || v === "none") t.mount = ""; else if (!t.mount) t.mount = "/"; cfg(t, edit, 1); }, () => cfg(t, edit, 1))}, sp];
  if (t.fs === "ext4" || t.fs === "btrfs") {
    it.push({...r("Punto de montaje:", t.mount || "ninguno"), go:() => pick("", "Punto de montaje para esta partición:", MP, v => { t.mount = v; cfg(t, edit, 3); }, () => cfg(t, edit, 3))},
      r("Opciones de montaje:", "defaults"), r("Etiqueta:", "ninguno"), r("Bloques reservados:", "5%"), r("Uso habitual:", "estándar"));
  }
  it.push({...r("Marca de arranque:", t.boot ? "activada" : "desactivada"), go:() => { t.boot = !t.boot; cfg(t, edit, it.length - 1); }}, sp);
  if (edit >= 0) it.push({t:"Borrar la partición", go:() => { S.parts.splice(edit, 1); renum(); summary(); }});
  it.push({t:"Se ha terminado de definir la partición", go:() => {
    if (t.mount && S.parts.some((p, i) => i !== edit && p.mount === t.mount)) return msg(`Ya existe otra partición con el punto de montaje ${t.mount}.`, () => cfg(t, edit, sel));
    if (edit >= 0) S.parts[edit] = {...S.parts[edit], ...t}; else S.parts.push(t);
    renum(); summary();
  }});
  show({
    text:`<p>Está editando la partición #${n} de Disco virtual 1 (vda). No se ha detectado ningún sistema de ficheros en esta partición.</p>`,
    label:"Configuración de la partición:", items:it, sel, back
  });
}
function finish() {
  const c = ACTS[S.a].chk(), ok = c.every(x => x[1]);
  const lines = c.map(x => `<li>${x[1] ? "✔" : "✘"} ${x[0]}</li>`).join("");
  show({
    text:`<p>${ok ? "¡Práctica superada! El particionado cumple los requisitos." : "El particionado todavía no cumple todos los requisitos:"}</p><ul style="list-style:none;padding:0">${lines}</ul>`,
    cont:() => ok ? menu() : summary(), back:summary,
    help:ok ? "Pulsa Continuar para volver al menú." : "Pulsa Continuar para volver al resumen y corregir el esquema."
  });
}
menu();
