/* ============================================================
   NetLab Studio · Aplicación
   ============================================================ */
(function () {
  'use strict';

  const { Model, IPCalc: IP, Sim, Activities } = window;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const NW = 96, NH = 88;

  /* iconos inline (SVG) para los controles generados por JS */
  const SVG = (paths, w) => `<svg viewBox="0 0 24 24" width="${w || 15}" height="${w || 15}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex:none">${paths}</svg>`;
  const ICO = {
    doc: SVG('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4"/><path d="M9 12h6M9 16h4"/>'),
    book: SVG('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19"/>'),
    eye: SVG('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>'),
    reset: SVG('<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4h4"/>'),
    trash: SVG('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>'),
    copy: SVG('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5H6a2 2 0 0 0-2 2v9"/>'),
    play: SVG('<path d="M7 4l13 8-13 8z"/>'),
    gear: SVG('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 3h-4l-.4 2.1a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L6.1 10a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.1h4l.4-2.1a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/>'),
    edit: SVG('<path d="M5 19h4l10-10-4-4L5 15z"/><path d="M14 5l4 4"/>'),
    plus: SVG('<path d="M12 5v14M5 12h14"/>'),
    x: SVG('<path d="M6 6l12 12M18 6L6 18"/>'),
    home: SVG('<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>'),
    grid: SVG('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
    fit: SVG('<path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/>'),
    plusCirc: SVG('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),
    globe: SVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18"/>'),
    mailIco: SVG('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    server: SVG('<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>')
  };
  const LS_CURRENT = 'netlab.current';
  const LS_PROJECTS = 'netlab.projects';
  const LS_DONE = 'netlab.done';

  /* ------------------------------------------------------------
     estado global
  ------------------------------------------------------------ */
  const App = {
    state: Model.newState('Topología sin título'),
    view: { x: 60, y: 40, z: 1 },
    sel: { nodes: new Set(), links: new Set() },
    activity: null,
    drag: null,
    history: [],
    future: [],
    vlsm: [],
    lastCheck: null
  };

  /* ------------------------------------------------------------
     utilidades
  ------------------------------------------------------------ */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escAttr = esc;
  const num = (n) => Number(n).toLocaleString('es-ES');

  function toast(msg, type) {
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 3200);
  }

  function openModal(opts) {
    $('#modalTitle').innerHTML = opts.title || '';
    $('#modalBody').innerHTML = opts.body || '';
    $('#modalFoot').innerHTML = '';
    (opts.buttons || []).forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (b.cls || '');
      btn.innerHTML = b.label;
      btn.onclick = () => { if (b.fn) b.fn(); if (b.keep !== true) closeModal(); };
      $('#modalFoot').appendChild(btn);
    });
    $('#modal').className = 'modal' + (opts.wide ? ' wide' : '');
    $('#modalBack').classList.add('on');
    if (opts.onMount) opts.onMount();
    return $('#modalBody');
  }
  function closeModal() { $('#modalBack').classList.remove('on'); }

  function copyText(txt) {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      else {
        const ta = document.createElement('textarea');
        ta.value = txt; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
      }
      toast('Copiado: <b class="mono">' + esc(txt) + '</b>', 'ok');
    } catch (e) { toast('No se pudo copiar', 'err'); }
  }

  function download(name, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ------------------------------------------------------------
     historial (undo / redo)
  ------------------------------------------------------------ */
  function snapshot() { return Model.serialize(App.state); }
  function pushHistory() {
    App.history.push(snapshot());
    if (App.history.length > 40) App.history.shift();
    App.future = [];
  }
  function undo() {
    if (!App.history.length) return toast('Nada que deshacer');
    App.future.push(snapshot());
    const prev = Model.deserialize(App.history.pop());
    if (prev.state) { App.state = prev.state; App.sel.nodes.clear(); App.sel.links.clear(); renderAll(); renderInspector(); refreshPanels(); autosave(); }
  }
  function redo() {
    if (!App.future.length) return toast('Nada que rehacer');
    App.history.push(snapshot());
    const nx = Model.deserialize(App.future.pop());
    if (nx.state) { App.state = nx.state; App.sel.nodes.clear(); App.sel.links.clear(); renderAll(); renderInspector(); refreshPanels(); autosave(); }
  }

  /* ------------------------------------------------------------
     persistencia
  ------------------------------------------------------------ */
  let saveTimer = null;
  function autosave() {
    $('#saveState').innerHTML = '<span class="dot" style="background:#f59e0b;box-shadow:0 0 8px #f59e0b"></span><span>Guardando…</span>';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(LS_CURRENT, JSON.stringify({
          data: JSON.parse(snapshot()),
          activityId: App.activity ? App.activity.id : null,
          ts: Date.now()
        }));
      } catch (e) { /* almacenamiento lleno */ }
      $('#saveState').innerHTML = '<span class="dot"></span><span>Guardado</span>';
    }, 420);
  }

  function projects() {
    try { return JSON.parse(localStorage.getItem(LS_PROJECTS) || '[]'); } catch (e) { return []; }
  }
  function writeProjects(list) {
    try { localStorage.setItem(LS_PROJECTS, JSON.stringify(list)); } catch (e) { toast('No hay espacio en el almacenamiento local', 'err'); }
  }
  function doneList() {
    try { return JSON.parse(localStorage.getItem(LS_DONE) || '{}'); } catch (e) { return {}; }
  }

  function saveProject() {
    const name = ($('#projectName').value || 'Topología sin título').trim();
    App.state.name = name;
    const list = projects();
    const idx = list.findIndex(p => p.name === name);
    const entry = { id: idx >= 0 ? list[idx].id : 'p' + Date.now(), name, data: JSON.parse(snapshot()), activityId: App.activity ? App.activity.id : null, ts: Date.now() };
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    writeProjects(list);
    toast('Proyecto <b>' + esc(name) + '</b> guardado', 'ok');
  }

  function openProjectsDialog() {
    const list = projects();
    if (!list.length) {
      return openModal({
        title: 'Proyectos guardados', body: '<p class="hint">Todavía no has guardado ningún proyecto. Usa 💾 en la barra superior.</p>',
        buttons: [{ label: 'Cerrar' }]
      });
    }
    const rows = list.sort((a, b) => b.ts - a.ts).map(p => `
      <div class="issue" data-pid="${p.id}" style="cursor:default">
        <div class="ic" style="background:var(--cyan)"></div>
        <div style="flex:1">
          <div class="t">${esc(p.name)}</div>
          <div class="d">${new Date(p.ts).toLocaleString('es-ES')} · ${(p.data.nodes || []).length} equipos</div>
        </div>
        <div class="flex gap8">
          <button class="btn sm primary" data-open="${p.id}">Abrir</button>
          <button class="btn sm danger" data-del="${p.id}">${ICO.trash}</button>
        </div>
      </div>`).join('');
    openModal({
      title: 'Proyectos guardados', body: '<div id="projList">' + rows + '</div>',
      buttons: [{ label: 'Cerrar' }],
      onMount() {
        $$('#projList [data-open]').forEach(b => b.onclick = () => {
          const p = projects().find(x => x.id === b.dataset.open);
          if (!p) return;
          const res = Model.deserialize(p.data);
          if (!res.state) return toast('Proyecto dañado', 'err');
          App.state = res.state;
          App.activity = p.activityId ? Activities.byId(p.activityId) : null;
          App.sel.nodes.clear(); App.sel.links.clear();
          closeModal(); gotoWorkspace(); loadIntoView(); toast('Proyecto cargado', 'ok');
        });
        $$('#projList [data-del]').forEach(b => b.onclick = () => {
          writeProjects(projects().filter(x => x.id !== b.dataset.del));
          closeModal(); openProjectsDialog();
        });
      }
    });
  }

  /* ------------------------------------------------------------
     navegación entre pantallas
  ------------------------------------------------------------ */
  function showScreen(id) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    $('#workspace').classList.toggle('active', id === 'workspace');
    if (id !== 'workspace') termOpen(false);
  }

  function gotoWorkspace() {
    showScreen('workspace');
    $('#projectName').value = App.state.name || 'Topología sin título';
    renderAll();
    renderInspector();
    refreshPanels();
    buildActTab();
    requestAnimationFrame(() => fitView());
  }

  /* ------------------------------------------------------------
     paleta de equipos y plantillas
  ------------------------------------------------------------ */
  const TYPE_ORDER = ['router', 'switch', 'hub', 'pc', 'laptop', 'server', 'firewall', 'cloud'];

  function renderPalette() {
    $('#palette').innerHTML = TYPE_ORDER.map(t => {
      const def = Model.TYPES[t];
      return `<div class="pal-item" draggable="true" data-type="${t}" title="${esc(def.hints)}">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor">${Model.ICONS[t]}</svg>
        <span class="nm">${esc(def.label)}</span>
        <span class="role">${esc(def.role)}</span>
      </div>`;
    }).join('');

    $$('#palette .pal-item').forEach(item => {
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/netlab-type', item.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
      });
      item.addEventListener('click', () => addNodeAt(item.dataset.type, null));
    });
  }

  const TEMPLATES = {
    estrella: {
      label: 'Estrella', desc: '1 switch + 4 PC',
      build() {
        const st = Model.newState(App.state.name);
        const sw = Model.createNode(st, 'switch', 430, 260);
        const spots = [[240, 120], [640, 120], [240, 420], [640, 420]];
        spots.forEach(p => { const pc = Model.createNode(st, 'pc', p[0], p[1]); Model.addLink(st, sw.id, pc.id); });
        return st;
      }
    },
    anillo: {
      label: 'Anillo', desc: '3 switches en bucle',
      build() {
        const st = Model.newState(App.state.name);
        const s1 = Model.createNode(st, 'switch', 430, 100);
        const s2 = Model.createNode(st, 'switch', 210, 400);
        const s3 = Model.createNode(st, 'switch', 650, 400);
        Model.addLink(st, s1.id, s2.id);
        Model.addLink(st, s2.id, s3.id);
        Model.addLink(st, s3.id, s1.id);
        const p1 = Model.createNode(st, 'pc', 430, 250); Model.addLink(st, s1.id, p1.id);
        const p2 = Model.createNode(st, 'pc', 430, 560); Model.addLink(st, s3.id, p2.id);
        return st;
      }
    },
    malla: {
      label: 'Malla', desc: '4 routers full mesh',
      build() {
        const st = Model.newState(App.state.name);
        const r = [[300, 140], [680, 140], [300, 460], [680, 460]].map((p, i) => Model.createNode(st, 'router', p[0], p[1], { name: 'R' + (i + 1) }));
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) Model.addLink(st, r[i].id, r[j].id);
        return st;
      }
    },
    bus: {
      label: 'Bus', desc: '2 hubs en cascada',
      build() {
        const st = Model.newState(App.state.name);
        const h1 = Model.createNode(st, 'hub', 330, 300);
        const h2 = Model.createNode(st, 'hub', 620, 300);
        Model.addLink(st, h1.id, h2.id);
        [[200, 130], [200, 470]].forEach(p => { const pc = Model.createNode(st, 'pc', p[0], p[1]); Model.addLink(st, h1.id, pc.id); });
        [[760, 130], [760, 470]].forEach(p => { const pc = Model.createNode(st, 'pc', p[0], p[1]); Model.addLink(st, h2.id, pc.id); });
        return st;
      }
    },
    sedes: {
      label: 'Dos sedes', desc: '2 routers + LANs',
      build() {
        const st = Model.newState(App.state.name);
        const pc1 = Model.createNode(st, 'pc', 140, 140, { name: 'PC1' });
        const sw1 = Model.createNode(st, 'switch', 340, 140, { name: 'SW1' });
        const r1 = Model.createNode(st, 'router', 340, 320, { name: 'R1' });
        const r2 = Model.createNode(st, 'router', 680, 320, { name: 'R2' });
        const sw2 = Model.createNode(st, 'switch', 680, 140, { name: 'SW2' });
        const pc2 = Model.createNode(st, 'pc', 880, 140, { name: 'PC2' });
        Model.addLinkPorts(st, pc1.id, 'eth0', sw1.id, 'Fa0/1');
        Model.addLinkPorts(st, sw1.id, 'Fa0/2', r1.id, 'g0/0');
        Model.addLinkPorts(st, r1.id, 'g0/1', r2.id, 'g0/1');
        Model.addLinkPorts(st, r2.id, 'g0/0', sw2.id, 'Fa0/2');
        Model.addLinkPorts(st, sw2.id, 'Fa0/1', pc2.id, 'eth0');
        return st;
      }
    }
  };

  function renderTemplates() {
    $('#templates').innerHTML = Object.entries(TEMPLATES).map(([k, t]) =>
      `<div class="pal-item" data-tpl="${k}" style="cursor:pointer">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="5"/><circle cx="10" cy="12" r="4"/><circle cx="38" cy="12" r="4"/><circle cx="10" cy="36" r="4"/><circle cx="38" cy="36" r="4"/><path d="M14 14l6 7M34 14l-6 7M14 34l6-7M34 34l-6-7"/></svg>
        <span class="nm">${t.label}</span>
        <span class="role">${t.desc}</span>
      </div>`).join('');
    $$('#templates .pal-item').forEach(el => el.onclick = () => applyTemplate(el.dataset.tpl));
  }

  function applyTemplate(key) {
    const tpl = TEMPLATES[key];
    if (!tpl) return;
    if (App.state.nodes.length && !confirm('Se reemplazará la topología actual. ¿Continuar?')) return;
    pushHistory();
    const st = tpl.build();
    st.name = App.state.name;
    App.state = st;
    App.sel.nodes.clear(); App.sel.links.clear();
    renderAll(); renderInspector(); refreshPanels(); fitView(); autosave();
    toast('Plantilla <b>' + tpl.label + '</b> cargada', 'ok');
  }

  /* ------------------------------------------------------------
     añadir equipos
  ------------------------------------------------------------ */
  function overlaps(x, y) {
    return App.state.nodes.some(n => Math.abs(n.x - x) < NW + 18 && Math.abs(n.y - y) < NH + 18);
  }

  function freeSpot(cx, cy) {
    const sx = NW + 40, sy = NH + 40;
    for (let ring = 0; ring < 8; ring++) {
      for (let dy = -ring; dy <= ring; dy++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
          const x = Math.round(cx + dx * sx), y = Math.round(cy + dy * sy);
          if (!overlaps(x, y)) return { x, y };
        }
      }
    }
    return { x: Math.round(cx), y: Math.round(cy) };
  }

  function addNodeAt(type, world) {
    pushHistory();
    const area = $('#canvasArea').getBoundingClientRect();
    let pos = world;
    if (!pos) {
      const c = screenToWorld(area.left + area.width / 2, area.top + area.height / 2);
      pos = freeSpot(c.x - NW / 2, c.y - NH / 2);
    } else if (overlaps(pos.x, pos.y)) {
      pos = freeSpot(pos.x, pos.y);
    }
    const node = Model.createNode(App.state, type, pos.x, pos.y);
    App.sel.nodes.clear(); App.sel.nodes.add(node.id);
    renderAll(); renderInspector(); refreshPanels(); autosave();
    return node;
  }

  /* ------------------------------------------------------------
     coordenadas
  ------------------------------------------------------------ */
  function screenToWorld(clientX, clientY) {
    const r = $('#world').getBoundingClientRect();
    return { x: (clientX - r.left - App.view.x) / App.view.z, y: (clientY - r.top - App.view.y) / App.view.z };
  }
  function applyView() {
    const g = $('#viewport');
    if (g) g.setAttribute('transform', `translate(${App.view.x},${App.view.y}) scale(${App.view.z})`);
  }
  function zoomBy(factor, cx, cy) {
    const r = $('#world').getBoundingClientRect();
    const px = (cx == null ? r.width / 2 : cx - r.left);
    const py = (cy == null ? r.height / 2 : cy - r.top);
    const z2 = Math.max(0.25, Math.min(2.4, App.view.z * factor));
    App.view.x = px - (px - App.view.x) * (z2 / App.view.z);
    App.view.y = py - (py - App.view.y) * (z2 / App.view.z);
    App.view.z = z2;
    applyView();
  }
  function fitView() {
    const nodes = App.state.nodes;
    const area = $('#canvasArea').getBoundingClientRect();
    if (!nodes.length) { App.view = { x: 60, y: 40, z: 1 }; applyView(); return; }
    const minX = Math.min(...nodes.map(n => n.x)) - 60;
    const minY = Math.min(...nodes.map(n => n.y)) - 60;
    const maxX = Math.max(...nodes.map(n => n.x + NW)) + 60;
    const maxY = Math.max(...nodes.map(n => n.y + NH)) + 60;
    const w = maxX - minX, h = maxY - minY;
    const z = Math.max(0.3, Math.min(1.25, Math.min(area.width / w, (area.height - 40) / h)));
    App.view.z = z;
    App.view.x = (area.width - w * z) / 2 - minX * z;
    App.view.y = (area.height - h * z) / 2 - minY * z;
    applyView();
  }

  /* ------------------------------------------------------------
     posiciones de puertos
  ------------------------------------------------------------ */
  function portPos(node, port) {
    const ports = Model.nodePorts(node);
    const n = ports.length;
    if (n <= 1) return { x: node.x + NW / 2, y: node.y + NH };
    const idx = Math.max(0, ports.indexOf(port));
    const step = Math.min(15, 80 / (n - 1));
    const total = step * (n - 1);
    return { x: node.x + NW / 2 - total / 2 + idx * step, y: node.y + NH };
  }

  function linkPath(p1, p2) {
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const c = Math.min(80, len * 0.28);
    const c1 = { x: p1.x + dx * 0.32 + nx * c, y: p1.y + dy * 0.32 + ny * c };
    const c2 = { x: p1.x + dx * 0.68 + nx * c, y: p1.y + dy * 0.68 + ny * c };
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  /* ------------------------------------------------------------
     render del lienzo
  ------------------------------------------------------------ */
  function ipLabel(node) {
    const withIp = node.ifaces.filter(i => IP.isValidIp(i.ip));
    if (withIp.length === 1) return withIp[0].ip + '/' + IP.clampPrefix(withIp[0].prefix) + (withIp[0].dhcp ? ' ⇄' : '');
    if (withIp.length > 1) return withIp.length + ' redes';
    if (Model.isL2(node)) return node.ports.length + ' puertos';
    return 'sin IP';
  }

  function renderNodes() {
    const html = App.state.nodes.map(n => {
      const ports = Model.nodePorts(n);
      const used = Model.usedPorts(App.state, n.id);
      const cnt = ports.length;
      const circles = ports.map((p, i) => {
        const step = cnt > 1 ? Math.min(15, 80 / (cnt - 1)) : 0;
        const total = step * (cnt - 1);
        const x = NW / 2 - total / 2 + i * step;
        return `<circle class="port ${used.has(p) ? 'used' : ''}" data-port="${escAttr(p)}" cx="${x.toFixed(1)}" cy="${NH}" r="5"></circle>`;
      }).join('');
      const sel = App.sel.nodes.has(n.id) ? 'selected' : '';
      let svcDots = '';
      if (n.type === 'server' && n.services) {
        const act = [['dhcp', 'DHCP'], ['web', 'HTTP'], ['mail', 'POP3']];
        svcDots = act.map(([k, label], i) => {
          const on = n.services[k] && n.services[k].enabled;
          return `<circle cx="${NW - 12 - i * 9}" cy="11" r="3" fill="${on ? '#a3e635' : '#24304d'}" stroke="${on ? '#a3e635' : '#2b3c5e'}" stroke-width="1"><title>${label}: ${on ? 'activo' : 'inactivo'}</title></circle>`;
        }).join('');
      }
      return `<g class="node ${sel}" data-id="${n.id}" data-type="${n.type}" transform="translate(${n.x},${n.y})">
        <rect class="node-box" width="${NW}" height="${NH}" rx="12"></rect>
        <g class="node-icon" transform="translate(23,9) scale(1.05)">${Model.ICONS[n.type] || ''}</g>
        ${svcDots}
        <text class="node-name" x="${NW / 2}" y="68" text-anchor="middle">${esc(n.name)}</text>
        <text class="node-ip ${n.ifaces.some(i => i.dhcp && i.ip) ? 'dyn' : ''}" x="${NW / 2}" y="80" text-anchor="middle">${esc(ipLabel(n))}</text>
        <g class="ports">${circles}</g>
      </g>`;
    }).join('');
    $('#layerNodes').innerHTML = html;
  }

  function renderLinks() {
    const html = App.state.links.map(l => {
      const a = Model.getNode(App.state, l.a.node), b = Model.getNode(App.state, l.b.node);
      if (!a || !b) return '';
      let p1 = portPos(a, l.a.port), p2 = portPos(b, l.b.port);
      // curva invertida si los dos puertos cuelgan hacia abajo
      const d = linkPath(p1, p2);
      const sel = App.sel.links.has(l.id) ? 'selected' : '';
      return `<g class="link-group ${sel}" data-id="${l.id}">
        <path class="link-hit" d="${d}"></path>
        <path class="link" d="${d}"></path>
      </g>`;
    }).join('');
    $('#layerLinks').innerHTML = html;
  }

  function renderAll() {
    renderLinks();
    renderNodes();
    updateInfo();
    applyView();
    $('#canvasEmpty').classList.toggle('hidden', App.state.nodes.length > 0);
  }

  function updateInfo() {
    $('#cntNodes').textContent = App.state.nodes.length;
    $('#cntLinks').textContent = App.state.links.length;
    const st = Model.stats(App.state);
    $('#cntNets').textContent = st.networks.size;
  }

  function updateNodeLabels() {
    App.state.nodes.forEach(n => {
      const g = $(`.node[data-id="${n.id}"]`);
      if (!g) return;
      const t = $('.node-ip', g);
      if (t) t.textContent = ipLabel(n);
    });
    updateInfo();
  }

  /* ------------------------------------------------------------
     selección
  ------------------------------------------------------------ */
  function selectNode(id, additive) {
    if (!additive) { App.sel.nodes.clear(); App.sel.links.clear(); }
    if (App.sel.nodes.has(id) && additive) App.sel.nodes.delete(id);
    else App.sel.nodes.add(id);
    renderNodes(); renderLinks(); renderInspector();
  }
  function selectLink(id, additive) {
    if (!additive) { App.sel.nodes.clear(); App.sel.links.clear(); }
    if (App.sel.links.has(id) && additive) App.sel.links.delete(id);
    else App.sel.links.add(id);
    renderNodes(); renderLinks(); renderInspector();
  }
  function clearSelection() {
    App.sel.nodes.clear(); App.sel.links.clear();
    renderNodes(); renderLinks(); renderInspector();
  }
  function deleteSelection() {
    if (!App.sel.nodes.size && !App.sel.links.size) return;
    pushHistory();
    App.sel.links.forEach(id => Model.removeLink(App.state, id));
    App.sel.nodes.forEach(id => Model.removeNode(App.state, id));
    App.sel.nodes.clear(); App.sel.links.clear();
    renderAll(); renderInspector(); refreshPanels(); autosave();
  }

  /* ------------------------------------------------------------
     interacción con el lienzo
  ------------------------------------------------------------ */
  function bindCanvas() {
    const svg = $('#world');
    const area = $('#canvasArea');

    // arrastrar y soltar desde la paleta
    area.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    area.addEventListener('drop', e => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/netlab-type');
      if (!type) return;
      const w = screenToWorld(e.clientX, e.clientY);
      addNodeAt(type, { x: Math.round(w.x - NW / 2), y: Math.round(w.y - NH / 2) });
    });

    svg.addEventListener('wheel', e => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
    }, { passive: false });

    svg.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('contextmenu', onContextMenu);

    // doble clic en puerto: crear enlace al equipo más cercano libre
    svg.addEventListener('dblclick', e => {
      const nodeEl = e.target.closest && e.target.closest('.node');
      if (nodeEl) {
        const n = Model.getNode(App.state, nodeEl.dataset.id);
        if (n) { App.sel.nodes.clear(); App.sel.nodes.add(n.id); renderNodes(); renderInspector(); }
      }
    });

    $('#zoomIn').onclick = () => zoomBy(1.2);
    $('#zoomOut').onclick = () => zoomBy(1 / 1.2);
    $('#zoomFit').onclick = () => fitView();

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', () => applyView());
  }

  function onPointerDown(e) {
    if (e.button === 2) return;
    hideCtx();
    const target = e.target;
    const portEl = target.closest && target.closest('.port');
    const nodeEl = target.closest && target.closest('.node');
    const linkEl = target.closest && target.closest('.link-group');

    if (portEl && nodeEl) {
      e.preventDefault();
      const node = Model.getNode(App.state, nodeEl.dataset.id);
      if (!node) return;
      App.drag = { type: 'link', nodeId: node.id, port: portEl.dataset.port, start: screenToWorld(e.clientX, e.clientY) };
      const r = $('#rubber');
      r.style.display = 'block';
      const p = portPos(node, portEl.dataset.port);
      r.setAttribute('d', `M ${p.x} ${p.y} L ${p.x} ${p.y}`);
      $('#world').classList.add('linking');
      return;
    }

    if (nodeEl) {
      e.preventDefault();
      const id = nodeEl.dataset.id;
      const additive = e.shiftKey || e.ctrlKey || e.metaKey;
      if (!App.sel.nodes.has(id) || additive) selectNode(id, additive);
      const before = App.state.nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
      App.drag = { type: 'node', id, additive, start: screenToWorld(e.clientX, e.clientY), before, moved: false };
      return;
    }

    if (linkEl) {
      e.preventDefault();
      selectLink(linkEl.dataset.id, e.shiftKey || e.ctrlKey || e.metaKey);
      return;
    }

    // vacío: pan (y limpiar selección si no se arrastra)
    App.drag = { type: 'pan', start: { x: e.clientX, y: e.clientY }, view: { ...App.view }, moved: false };
    $('#world').classList.add('panning');
  }

  function onPointerMove(e) {
    const d = App.drag;
    if (!d) return;

    if (d.type === 'pan') {
      const dx = e.clientX - d.start.x, dy = e.clientY - d.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      App.view.x = d.view.x + dx;
      App.view.y = d.view.y + dy;
      applyView();
      return;
    }

    if (d.type === 'node') {
      const w = screenToWorld(e.clientX, e.clientY);
      const dx = w.x - d.start.x, dy = w.y - d.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
      const ids = App.sel.nodes.has(d.id) && App.sel.nodes.size > 1 ? [...App.sel.nodes] : [d.id];
      ids.forEach(id => {
        const n = Model.getNode(App.state, id);
        const b = d.before.find(x => x.id === id);
        if (n && b) { n.x = Math.round(b.x + dx); n.y = Math.round(b.y + dy); }
      });
      App.state.nodes.forEach(n => {
        const g = $(`.node[data-id="${n.id}"]`);
        if (g) g.setAttribute('transform', `translate(${n.x},${n.y})`);
      });
      renderLinks();
      return;
    }

    if (d.type === 'link') {
      const node = Model.getNode(App.state, d.nodeId);
      if (!node) return;
      const p = portPos(node, d.port);
      const w = screenToWorld(e.clientX, e.clientY);
      $('#rubber').setAttribute('d', `M ${p.x} ${p.y} L ${w.x} ${w.y}`);
      return;
    }
  }

  function onPointerUp(e) {
    const d = App.drag;
    App.drag = null;
    $('#world').classList.remove('panning', 'linking');
    const rubber = $('#rubber');
    if (rubber) rubber.style.display = 'none';
    if (!d) return;

    if (d.type === 'pan') {
      if (!d.moved) clearSelection();
      return;
    }

    if (d.type === 'node') {
      if (d.moved) { pushHistory(); autosave(); }
      return;
    }

    if (d.type === 'link') {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const targetNode = el && el.closest && el.closest('.node');
      if (!targetNode) { toast('Suelta el cable sobre otro equipo', 'err'); return; }
      const targetId = targetNode.dataset.id;
      if (targetId === d.nodeId) return;
      const portEl = el.closest('.port');
      connect(d.nodeId, d.port, targetId, portEl ? portEl.dataset.port : null);
    }
  }

  function connect(aId, aPort, bId, bPort) {
    const a = Model.getNode(App.state, aId), b = Model.getNode(App.state, bId);
    if (!a || !b) return;
    if (Model.isL3(a) && Model.isL3(b) && !isRouterLike(a) && !isRouterLike(b)) {
      return toast('Dos equipos finales no se conectan directamente: usa un switch o hub', 'err');
    }
    if (Model.linkExists(App.state, aId, bId)) return toast('Ya existe un enlace entre esos equipos', 'err');
    pushHistory();
    let res;
    if (aPort && bPort) {
      const usedA = Model.usedPorts(App.state, aId), usedB = Model.usedPorts(App.state, bId);
      if (usedA.has(aPort) || usedB.has(bPort)) return toast('Ese puerto ya está ocupado', 'err');
      res = Model.addLinkPorts(App.state, aId, aPort, bId, bPort);
    } else if (aPort) {
      const free = Model.freePort(App.state, b);
      if (!free) return toast(b.name + ' no tiene puertos libres', 'err');
      res = Model.addLinkPorts(App.state, aId, aPort, bId, free);
    } else if (bPort) {
      const free = Model.freePort(App.state, a);
      if (!free) return toast(a.name + ' no tiene puertos libres', 'err');
      res = Model.addLinkPorts(App.state, aId, free, bId, bPort);
    } else {
      res = Model.addLink(App.state, aId, bId);
    }
    if (res && res.error) return toast(res.error, 'err');
    renderAll(); renderInspector(); refreshPanels(); autosave();
  }

  function isRouterLike(n) { return n.type === 'router' || n.type === 'firewall'; }

  /* ------------------------------------------------------------
     menú contextual
  ------------------------------------------------------------ */
  function hideCtx() { $('#ctxMenu').classList.remove('on'); }

  function showCtx(x, y, items) {
    const m = $('#ctxMenu');
    m.innerHTML = items.map(it => it === '-' ? '<hr>' :
      `<button data-act="${it.act}" class="${it.cls || ''}">${it.icon ? it.icon + ' ' : ''}${esc(it.label)}</button>`).join('');
    m.classList.add('on');
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(x, window.innerWidth - r.width - 10) + 'px';
    m.style.top = Math.min(y, window.innerHeight - r.height - 10) + 'px';
    $$('#ctxMenu button').forEach(b => b.onclick = () => {
      hideCtx();
      const it = items.find(i => i !== '-' && i.act === b.dataset.act);
      if (it && it.fn) it.fn();
    });
  }

  function onContextMenu(e) {
    e.preventDefault();
    const nodeEl = e.target.closest && e.target.closest('.node');
    const linkEl = e.target.closest && e.target.closest('.link-group');

    if (nodeEl) {
      const id = nodeEl.dataset.id;
      const n = Model.getNode(App.state, id);
      if (!n) return;
      if (!App.sel.nodes.has(id)) selectNode(id, false);
      showCtx(e.clientX, e.clientY, [
        { act: 'cfg', icon: ICO.gear, label: 'Configurar equipo', fn: () => { selectNode(id, false); $('#inspector').scrollTop = 0; } },
        { act: 'rename', icon: ICO.edit, label: 'Renombrar', fn: () => renameNode(n) },
        { act: 'ping', icon: ICO.play, label: 'Ping desde aquí', fn: () => openPingDialog(id) },
        { act: 'dup', icon: ICO.copy, label: 'Duplicar', fn: () => duplicateNode(n) },
        '-',
        { act: 'del', icon: ICO.trash, label: 'Eliminar equipo', cls: 'danger', fn: () => { pushHistory(); Model.removeNode(App.state, id); App.sel.nodes.clear(); renderAll(); renderInspector(); refreshPanels(); autosave(); } }
      ]);
    } else if (linkEl) {
      const id = linkEl.dataset.id;
      showCtx(e.clientX, e.clientY, [
        { act: 'del', icon: ICO.trash, label: 'Eliminar enlace', cls: 'danger', fn: () => { pushHistory(); Model.removeLink(App.state, id); renderAll(); renderInspector(); refreshPanels(); autosave(); } }
      ]);
    } else {
      showCtx(e.clientX, e.clientY, [
        { act: 'fit', icon: ICO.fit, label: 'Ajustar vista', fn: fitView },
        { act: 'pal', icon: ICO.plus, label: 'Añadir equipo', fn: () => { switchTab('devices'); $('#palette').scrollIntoView({ behavior: 'smooth', block: 'center' }); } },
        '-',
        { act: 'clear', icon: ICO.trash, label: 'Vaciar lienzo', cls: 'danger', fn: () => {
          if (!App.state.nodes.length) return;
          if (!confirm('¿Eliminar todos los equipos y enlaces?')) return;
          pushHistory(); App.state.nodes = []; App.state.links = [];
          renderAll(); renderInspector(); refreshPanels(); autosave();
        } }
      ]);
    }
  }

  function renameNode(n) {
    const v = prompt('Nombre del equipo:', n.name);
    if (!v || !v.trim()) return;
    pushHistory();
    n.name = v.trim();
    renderAll(); renderInspector(); refreshPanels(); autosave();
  }

  function duplicateNode(n) {
    pushHistory();
    const c = JSON.parse(JSON.stringify(n));
    c.id = Model.uid(App.state, 'n');
    c.name = Model.nextName(App.state, n.type);
    c.x += 40; c.y += 40;
    App.state.nodes.push(c);
    App.sel.nodes.clear(); App.sel.nodes.add(c.id);
    renderAll(); renderInspector(); refreshPanels(); autosave();
  }

  /* ------------------------------------------------------------
     INSPECTOR
  ------------------------------------------------------------ */
  function prefixOptions(sel) {
    let out = '';
    for (let p = 32; p >= 8; p--) out += `<option value="${p}" ${p === sel ? 'selected' : ''}>/${p} · ${IP.prefixToMask(p)}</option>`;
    return out;
  }

  function peersOf(node, port) {
    const out = [];
    App.state.links.forEach(l => {
      if (l.a.node === node.id && (!port || l.a.port === port)) { const o = Model.getNode(App.state, l.b.node); if (o) out.push(o.name + ':' + l.b.port); }
      if (l.b.node === node.id && (!port || l.b.port === port)) { const o = Model.getNode(App.state, l.a.node); if (o) out.push(o.name + ':' + l.a.port); }
    });
    return out;
  }

  function renderInspector() {
    const box = $('#inspector');
    const selNodes = [...App.sel.nodes].map(id => Model.getNode(App.state, id)).filter(Boolean);
    const selLinks = [...App.sel.links].map(id => App.state.links.find(l => l.id === id)).filter(Boolean);

    if (selLinks.length === 1 && !selNodes.length) {
      const l = selLinks[0];
      const a = Model.getNode(App.state, l.a.node), b = Model.getNode(App.state, l.b.node);
      box.innerHTML = `
        <div class="insp-head">
          <div class="ic"><svg viewBox="0 0 48 48" fill="none" stroke="var(--cyan)" stroke-width="2.4"><path d="M8 24h32"/><circle cx="8" cy="24" r="4"/><circle cx="40" cy="24" r="4"/></svg></div>
          <div class="tx"><div class="n">Enlace</div><div class="t">capa 2</div></div>
        </div>
        <div class="kv"><span class="k">Extremo A</span><span class="v">${esc(a ? a.name : '?')} · ${esc(l.a.port)}</span></div>
        <div class="kv"><span class="k">Extremo B</span><span class="v">${esc(b ? b.name : '?')} · ${esc(l.b.port)}</span></div>
        <div class="mt14"><button class="btn danger sm" id="delLink" style="width:100%">Eliminar enlace</button></div>`;
      $('#delLink').onclick = () => { pushHistory(); Model.removeLink(App.state, l.id); App.sel.links.clear(); renderAll(); renderInspector(); refreshPanels(); autosave(); };
      return;
    }

    if (selNodes.length > 1) {
      box.innerHTML = `
        <div class="insp-head"><div class="ic">◻</div><div class="tx"><div class="n">${selNodes.length} equipos</div><div class="t">selección múltiple</div></div></div>
        <p class="hint">Puedes moverlos arrastrando o eliminarlos juntos.</p>
        <div class="flex gap8 wrap">
          <button class="btn sm" id="alignRow">Alinear en fila</button>
          <button class="btn sm" id="alignGrid">En rejilla</button>
          <button class="btn sm danger" id="delSel">Eliminar</button>
        </div>`;
      $('#delSel').onclick = deleteSelection;
      $('#alignRow').onclick = () => {
        pushHistory();
        const y = selNodes[0].y;
        selNodes.forEach((n, i) => { n.x = selNodes[0].x + i * (NW + 60); n.y = y; });
        renderAll(); autosave();
      };
      $('#alignGrid').onclick = () => {
        pushHistory();
        const x0 = selNodes[0].x, y0 = selNodes[0].y;
        selNodes.forEach((n, i) => { n.x = x0 + (i % 3) * (NW + 50); n.y = y0 + Math.floor(i / 3) * (NH + 50); });
        renderAll(); autosave();
      };
      return;
    }

    if (!selNodes.length) {
      const st = Model.stats(App.state);
      const nets = [...st.networks.entries()];
      box.innerHTML = `
        <div class="insp-empty">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="7" width="34" height="34" rx="6"/><path d="M16 24h16M24 16v16"/></svg>
          <div style="font-weight:700;color:var(--txt-2);margin-bottom:4px">Nada seleccionado</div>
          <div style="font-size:12px">Haz clic en un equipo para configurarlo</div>
        </div>
        <div class="sec-title">Resumen de la red</div>
        <div class="kv"><span class="k">Equipos</span><span class="v">${st.totalNodes}</span></div>
        <div class="kv"><span class="k">Enlaces</span><span class="v">${st.totalLinks}</span></div>
        <div class="kv"><span class="k">Direcciones IP</span><span class="v">${st.ips.length}</span></div>
        <div class="kv"><span class="k">Redes distintas</span><span class="v">${nets.length}</span></div>
        ${nets.length ? `<div class="sec-title">Redes configuradas</div>` + nets.map(([k, v]) =>
          `<div class="route-row"><div><div class="d">${esc(k)}</div><div class="h">${v.length} interfaz(es)</div></div><button class="btn sm" data-copy="${escAttr(k)}">${ICO.copy}</button></div>`).join('') : ''}`;
      $$('#inspector [data-copy]').forEach(b => b.onclick = () => copyText(b.dataset.copy));
      return;
    }

    const n = selNodes[0];
    const def = Model.TYPES[n.type];
    const isRouter = n.type === 'router' || n.type === 'firewall';
    const isL2 = Model.isL2(n);

    let html = `
      <div class="insp-head">
        <div class="ic" style="color:${def.color}"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor">${Model.ICONS[n.type]}</svg></div>
        <div class="tx">
          <input class="project-name" id="nodeName" value="${escAttr(n.name)}" style="min-width:0;width:100%;padding:4px 7px;font-size:14px">
          <div class="t">${esc(def.label)} · ${esc(def.role)} · ${esc(def.hints)}</div>
        </div>
      </div>`;

    if (isL2) {
      const used = Model.usedPorts(App.state, n.id);
      html += `<div class="sec-title">Puertos (${n.ports.length})</div>
        <div class="port-pills">${n.ports.map(p => {
          const peer = peersOf(n, p);
          return `<span class="port-pill ${used.has(p) ? 'used' : ''}" title="${escAttr(peer[0] || 'libre')}">${esc(p)}${peer.length ? ' →' : ''}</span>`;
        }).join('')}</div>
        <p class="hint">Un switch/hub conmuta en capa 2: no necesita dirección IP para funcionar. Todos sus puertos pertenecen al mismo dominio de difusión.</p>
        <div class="sec-title">Conexiones</div>
        ${peersOf(n).length ? peersOf(n).map(p => `<div class="route-row"><div class="d">${esc(p)}</div></div>`).join('') : '<p class="hint">Sin conexiones.</p>'}`;
    } else {
      html += `<div class="sec-title">Interfaces <button class="btn sm" id="addIface">+ Añadir</button></div>`;
      html += n.ifaces.map((i, idx) => {
        const valid = IP.isValidIp(i.ip);
        const info = valid ? IP.netInfo(i.ip, i.prefix) : null;
        const peer = peersOf(n, i.name);
        const dyn = !!i.dhcp;
        const leaseTxt = (i.lease && i.ip)
          ? `<div class="lease-box">
               <div><b>Concesión DHCP</b> · ${esc(i.lease.type || 'dinámica')} · pool ${esc(i.lease.pool || '—')}</div>
               <div class="tiny">Servidor: ${esc(i.lease.serverName || '—')} · caduca en ${num(Math.max(0, Math.round(((i.lease.at || Date.now()) + (i.lease.minutes || 0) * 60000 - Date.now()) / 60000)))} min${i.dns && i.dns.length ? ' · DNS ' + esc(i.dns.join(', ')) : ''}</div>
             </div>`
          : `<div class="lease-box empty">Sin concesión: pulsa <b>Renovar DHCP</b> para solicitar dirección al servidor.</div>`;
        return `<div class="iface-card" data-iface="${escAttr(i.name)}" data-idx="${idx}">
          <div class="top">
            <span class="pn">${esc(i.name)} <span class="iface-st ${valid ? '' : 'none'}" data-st>${valid ? 'UP' : 'SIN IP'}</span>${dyn ? '<span class="iface-st dhcp">DHCP</span>' : ''}</span>
            <span class="linkd">${peer.length ? '→ ' + esc(peer[0]) : 'sin enlace'}</span>
          </div>
          <div class="tab-inline" style="margin-bottom:8px">
            <button data-mode="static" class="${dyn ? '' : 'on'}">IP estática</button>
            <button data-mode="dhcp" class="${dyn ? 'on' : ''}">DHCP</button>
          </div>
          ${dyn ? leaseTxt : `
          <div class="row2">
            <div class="field" style="margin:0"><label>Dirección IP</label>
              <input class="input ${valid ? '' : (i.ip ? 'bad' : '')}" data-f="ip" value="${escAttr(i.ip)}" placeholder="192.168.1.1"></div>
            <div class="field" style="margin:0"><label>Máscara</label>
              <select class="input" data-f="prefix">${prefixOptions(IP.clampPrefix(i.prefix))}</select></div>
          </div>
          ${isRouter ? '' : `<div class="field" style="margin:8px 0 0"><label>Puerta de enlace</label>
            <input class="input" data-f="gateway" value="${escAttr(i.gateway)}" placeholder="192.168.1.1"></div>`}
          <div class="tiny mt8" data-netof>${info ? `Red <b style="color:var(--cyan)">${esc(info.cidr)}</b> · ${esc(IP.hostCountLabel(info.prefix))}` : 'Sin dirección asignada'}</div>`}
          <div class="flex gap8 mt8 wrap">
            ${dyn ? `<button class="btn sm primary" data-act="renew">${ICO.play} Renovar DHCP</button>
                     <button class="btn sm ghost" data-act="release">Liberar</button>`
                  : `<button class="btn sm ghost" data-act="copy-ip" data-val="${escAttr(i.ip)}">${ICO.copy} Copiar</button>`}
            ${n.ifaces.length > 1 ? `<button class="btn sm danger" data-act="rm-iface">Quitar</button>` : ''}
          </div>
        </div>`;
      }).join('');
    }

    if (n.type === 'server') html += servicesSectionHTML(n);
    if (!isL2 && n.type !== 'server') html += clientServicesHTML(n);

    html += `<div class="sec-title">Rutas estáticas ${isRouter ? '' : '<span class="tiny">(opcional)</span>'}</div>
      <div id="routeList"></div>
      <div class="field mt8"><input class="input" id="rDest" placeholder="Destino CIDR · 0.0.0.0/0"></div>
      <div class="row2">
        <div class="field"><input class="input" id="rHop" placeholder="Next hop"></div>
        <div class="field"><select class="input" id="rIf">${['<option value="">Interfaz…</option>'].concat(n.ifaces.map(i => `<option value="${escAttr(i.name)}">${esc(i.name)}</option>`)).join('')}</select></div>
      </div>
      <button class="btn sm" id="addRoute" style="width:100%">+ Añadir ruta</button>`;

    html += `<div class="sec-title">Notas</div>
      <textarea class="input" id="nodeNotes" rows="2" placeholder="Anotaciones del equipo…" style="resize:vertical;font-family:var(--font)">${esc(n.notes || '')}</textarea>
      <div class="flex gap8 mt14 wrap">
        <button class="btn sm" id="inspPing">${ICO.play} Ping</button>
        <button class="btn sm" id="inspTpl">${ICO.copy} Duplicar</button>
        <button class="btn sm danger" id="inspDel">${ICO.trash} Eliminar</button>
      </div>`;

    box.innerHTML = html;
    bindInspector(n, isL2, isRouter);
    if (n.type === 'server') bindServicesSection(n);
    else if (!isL2) bindClientServices(n);
    renderInspRouteList(n);
  }

  function renderInspRouteList(n) {
    const el = $('#routeList');
    if (!el) return;
    if (!(n.routes || []).length) { el.innerHTML = '<p class="hint" style="margin:0 0 4px">Sin rutas estáticas. Los equipos solo conocen sus redes conectadas.</p>'; return; }
    el.innerHTML = n.routes.map((r, i) => `
      <div class="route-row">
        <div><div class="d">${esc(r.dest)}</div><div class="h">${r.nextHop ? 'via ' + esc(r.nextHop) : ''} ${r.iface ? '· ' + esc(r.iface) : ''}</div></div>
        <button class="x" data-rm="${i}" title="Eliminar">✕</button>
      </div>`).join('');
    $$('#routeList [data-rm]').forEach(b => b.onclick = () => {
      pushHistory();
      n.routes.splice(Number(b.dataset.rm), 1);
      renderInspector(); refreshPanels(); autosave();
    });
  }

  function bindInspector(n, isL2, isRouter) {
    const nameInput = $('#nodeName');
    if (nameInput) {
      nameInput.onchange = () => {
        const v = nameInput.value.trim();
        if (!v) return;
        pushHistory();
        n.name = v;
        renderAll(); refreshPanels(); autosave();
      };
    }

    const addIf = $('#addIface');
    if (addIf) addIf.onclick = () => {
      pushHistory();
      let i = 0;
      while (n.ifaces.some(x => x.name === 'g0/' + i)) i++;
      Model.addIface(App.state, n, 'g0/' + i);
      renderInspector(); renderAll(); refreshPanels(); autosave();
    };

    $$('#inspector .iface-card').forEach(card => {
      const idx = Number(card.dataset.idx);
      const iface = n.ifaces[idx];
      if (!iface) return;
      const upd = (field, value) => {
        iface[field] = field === 'prefix' ? IP.clampPrefix(value) : value.trim();
        updateNodeLabels();
        const valid = IP.isValidIp(iface.ip);
        const st = $('[data-st]', card);
        st.textContent = valid ? 'UP' : 'SIN IP';
        st.classList.toggle('none', !valid);
        const info = valid ? IP.netInfo(iface.ip, iface.prefix) : null;
        $('[data-netof]', card).innerHTML = info ? `Red <b style="color:var(--cyan)">${esc(info.cidr)}</b> · ${esc(IP.hostCountLabel(info.prefix))}` : 'Sin dirección asignada';
        const ipIn = $('[data-f="ip"]', card);
        ipIn.classList.toggle('bad', !!iface.ip && !valid);
        autosave();
      };
      $$('[data-f]', card).forEach(inp => {
        inp.onchange = () => upd(inp.dataset.f, inp.value);
        if (inp.dataset.f === 'ip') inp.oninput = () => upd('ip', inp.value);
      });
      $$('[data-mode]', card).forEach(b => b.onclick = () => {
        const mode = b.dataset.mode;
        if (mode === 'dhcp' && !iface.dhcp) {
          pushHistory();
          iface.dhcp = true; iface.ip = ''; iface.gateway = ''; iface.lease = null;
          renderInspector(); renderAll(); refreshPanels(); autosave();
          toast('Interfaz en modo DHCP: pulsa <b>Renovar DHCP</b>', 'ok');
        } else if (mode === 'static' && iface.dhcp) {
          pushHistory();
          iface.dhcp = false; iface.lease = null;
          renderInspector(); renderAll(); refreshPanels(); autosave();
        }
      });
      $$('[data-act]', card).forEach(b => b.onclick = () => {
        if (b.dataset.act === 'renew') {
          const r = Services.renew(state(), n, iface.name);
          renderInspector(); renderAll(); refreshPanels(); autosave();
          termLog([`dhcp renew ${n.name} ${iface.name}`], 'cmd');
          termLog(r.log);
          showServiceLogModal('DHCP · ' + n.name + ':' + iface.name, r.log, r.ok);
          return;
        }
        if (b.dataset.act === 'release') {
          pushHistory();
          Services.release(n, iface.name);
          renderInspector(); renderAll(); refreshPanels(); autosave();
          toast('Concesión liberada', 'ok');
          return;
        }
        if (b.dataset.act === 'copy-ip') copyText(b.dataset.val || iface.ip);
        if (b.dataset.act === 'rm-iface') {
          const res = Model.removeIface(App.state, n, iface.name);
          if (res.error) return toast(res.error, 'err');
          pushHistory(); renderInspector(); renderAll(); refreshPanels(); autosave();
        }
      });
    });

    const addRoute = $('#addRoute');
    if (addRoute) addRoute.onclick = () => {
      const dest = $('#rDest').value.trim();
      const hop = $('#rHop').value.trim();
      const iff = $('#rIf').value;
      if (!IP.parseCidr(dest)) return toast('Destino no válido: usa formato CIDR, ej. 192.168.2.0/24', 'err');
      if (hop && !IP.isValidIp(hop)) return toast('Next hop no es una IP válida', 'err');
      if (!hop && !iff) return toast('Indica un next hop o una interfaz de salida', 'err');
      pushHistory();
      Model.addRoute(n, { dest, nextHop: hop, iface: iff });
      renderInspector(); refreshPanels(); autosave();
      toast('Ruta añadida a ' + esc(n.name), 'ok');
    };

    const notes = $('#nodeNotes');
    if (notes) notes.onchange = () => { n.notes = notes.value; autosave(); };

    if ($('#inspPing')) $('#inspPing').onclick = () => openPingDialog(n.id);
    if ($('#inspTpl')) $('#inspTpl').onclick = () => duplicateNode(n);
    if ($('#inspDel')) $('#inspDel').onclick = () => {
      pushHistory(); Model.removeNode(App.state, n.id); App.sel.nodes.clear();
      renderAll(); renderInspector(); refreshPanels(); autosave();
    };
  }

  /* ------------------------------------------------------------
     sincronizar selectores de la barra lateral
  ------------------------------------------------------------ */
  function refreshPanels() {
    // selector de equipos para rutas
    const opts = App.state.nodes.map(n => `<option value="${n.id}">${esc(n.name)} · ${esc(Model.TYPES[n.type].label)}</option>`).join('');
    const rd = $('#routeDevice');
    const prev = rd.value;
    rd.innerHTML = opts || '<option value="">— sin equipos —</option>';
    if (prev && App.state.nodes.some(n => n.id === prev)) rd.value = prev;
    updateRouteTable();

    // interfaces del formulario de ruta
    const dev = Model.getNode(App.state, rd.value);
    $('#newIface').innerHTML = '<option value="">—</option>' + (dev ? dev.ifaces.map(i => `<option value="${escAttr(i.name)}">${esc(i.name)}</option>`).join('') : '');
    if ($('#panel-services') && $('#panel-services').classList.contains('on')) renderServicesPanel();
    updateInfo();
  }

  /* ------------------------------------------------------------
     PANEL SUBREDES
  ------------------------------------------------------------ */
  function currentBase() {
    const ip = $('#subIp').value.trim();
    const p = IP.clampPrefix($('#subPrefix').value);
    if (!IP.isValidIp(ip)) return null;
    return { ip, p, net: IP.netInfo(ip, p) };
  }

  function renderSubnetInfo() {
    const base = currentBase();
    const box = $('#subResult');
    if (!base) { box.innerHTML = '<p class="hint" style="color:#fca5a5">Dirección IP no válida.</p>'; return; }
    const n = base.net;
    box.innerHTML = `
      <div class="result-card">
        <div class="kv"><span class="k">Clase</span><span class="v">${esc(n.klass)}</span></div>
        <div class="kv"><span class="k">Tipo</span><span class="v" style="font-size:11px">${esc(n.scope)}</span></div>
        <div class="kv"><span class="k">Dirección de red</span><span class="v cy">${n.network}</span></div>
        <div class="kv"><span class="k">Máscara</span><span class="v">${n.mask} <span style="color:var(--txt-3)">/${n.prefix}</span></span></div>
        <div class="kv"><span class="k">Wildcard</span><span class="v">${n.wildcard}</span></div>
        <div class="kv"><span class="k">Broadcast</span><span class="v am">${n.broadcast}</span></div>
        <div class="kv"><span class="k">Rango útil</span><span class="v gr">${n.firstHost} – ${n.lastHost}</span></div>
        <div class="kv"><span class="k">Hosts útiles</span><span class="v">${num(n.usable)}</span></div>
        <div class="kv"><span class="k">Total direcciones</span><span class="v">${num(n.total)}</span></div>
      </div>
      <div class="bin">IP&nbsp; ${n.binIp}<br>MSK ${n.binMask}<br>NET ${n.binNet}</div>
      <div class="chips">
        <button class="btn sm" data-copy="${escAttr(n.cidr)}">${ICO.copy} ${esc(n.cidr)}</button>
        <button class="btn sm" data-copy="${escAttr(n.mask)}">${ICO.copy} máscara</button>
        <button class="btn sm" data-copy="${escAttr(n.firstHost)}">${ICO.copy} 1ª IP</button>
      </div>`;
    $$('#subResult [data-copy]').forEach(b => b.onclick = () => copyText(b.dataset.copy));

    // opciones de división
    const sp = $('#splitPrefix');
    const cur = IP.clampPrefix($('#splitPrefix').value) || Math.min(30, base.p + 1);
    let opts = '';
    for (let p = base.p + 1; p <= 32; p++) opts += `<option value="${p}" ${p === cur ? 'selected' : ''}>/${p} · ${Math.pow(2, p - base.p)} subredes</option>`;
    sp.innerHTML = opts || '<option value="">—</option>';
    if (!sp.dataset.init) sp.dataset.init = '1';
  }

  function doSplit() {
    const base = currentBase();
    if (!base) return toast('IP no válida', 'err');
    const np = Number($('#splitPrefix').value);
    if (!np || np <= base.p) return toast('Elige un prefijo mayor que el actual', 'err');
    const res = IP.subnets(base.ip, base.p, np, 256);
    if (res.error) return toast(res.error, 'err');
    const rows = res.list.map((s, i) => `<tr>
      <td>${i + 1}</td><td style="color:var(--cyan)">${s.cidr}</td>
      <td>${s.firstHost}</td><td>${s.lastHost}</td><td>${s.broadcast}</td><td>${s.usable}</td>
      <td><button class="btn sm" data-copy="${s.cidr}">${ICO.copy}</button></td></tr>`).join('');
    $('#splitResult').innerHTML = `
      <p class="hint">${num(res.count)} subredes de ${num(res.list[0].usable)} hosts útiles${res.truncated ? ' (mostrando 256)' : ''}.</p>
      <div style="max-height:280px;overflow:auto;border:1px solid var(--line);border-radius:10px">
      <table class="tbl"><thead><tr><th>#</th><th>Subred</th><th>1ª útil</th><th>Última</th><th>Broadcast</th><th>Hosts</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
    $$('#splitResult [data-copy]').forEach(b => b.onclick = () => copyText(b.dataset.copy));
  }

  function renderVlsmRows() {
    const box = $('#vlsmRows');
    if (!App.vlsm.length) { box.innerHTML = '<p class="hint">Añade departamentos con sus hosts necesarios.</p>'; return; }
    box.innerHTML = App.vlsm.map((r, i) => `
      <div class="route-row"><div><div class="d">${esc(r.name)}</div><div class="h">${r.hosts} hosts</div></div>
      <button class="x" data-rm="${i}">✕</button></div>`).join('');
    $$('#vlsmRows [data-rm]').forEach(b => b.onclick = () => { App.vlsm.splice(Number(b.dataset.rm), 1); renderVlsmRows(); });
  }

  function doVlsm() {
    const base = currentBase();
    if (!base) return toast('IP no válida', 'err');
    if (!App.vlsm.length) return toast('Añade al menos una subred', 'err');
    const res = IP.vlsm(base.ip, base.p, App.vlsm);
    if (res.error) return toast(res.error, 'err');
    const rows = res.list.map((s, i) => `<tr>
      <td>${i + 1}</td><td>${esc(s.name)}</td><td style="color:var(--cyan)">${s.cidr}</td>
      <td>${s.firstHost} – ${s.lastHost}</td><td>${s.usable}</td><td>${s.requested}</td><td>${s.slack}</td>
      <td><button class="btn sm" data-copy="${s.cidr}">${ICO.copy}</button></td></tr>`).join('');
    $('#vlsmResult').innerHTML = `
      <p class="hint">Base ${esc(res.base)} · siguiente bloque libre <b style="color:var(--green)">${esc(res.remaining)}</b></p>
      <div style="overflow:auto;border:1px solid var(--line);border-radius:10px">
      <table class="tbl"><thead><tr><th>#</th><th>Nombre</th><th>Subred</th><th>Rango útil</th><th>Útil</th><th>Pedidos</th><th>Sobra</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>
      ${res.errors.length ? '<p class="hint" style="color:#fca5a5">' + res.errors.map(esc).join('<br>') + '</p>' : ''}`;
    $$('#vlsmResult [data-copy]').forEach(b => b.onclick = () => copyText(b.dataset.copy));
  }

  function bindSubnets() {
    const sync = () => {
      const p = IP.clampPrefix($('#subPrefix').value);
      const sel = $('#subMask');
      const has = [...sel.options].some(o => o.value.trim().startsWith('/' + p + ' '));
      if (has) sel.value = [...sel.options].find(o => o.value.trim().startsWith('/' + p + ' ')).value;
      renderSubnetInfo();
    };
    $('#subIp').oninput = () => renderSubnetInfo();
    $('#subPrefix').onchange = () => { sync(); };
    $('#subPrefix').oninput = () => { sync(); };
    $('#subMask').onchange = () => {
      const p = $('#subMask').value.split(' ')[0].replace('/', '');
      $('#subPrefix').value = p;
      renderSubnetInfo();
    };
    $('#btnCalc').onclick = () => renderSubnetInfo();
    $('#btnSplit').onclick = doSplit;
    $('#splitPrefix').onchange = doSplit;
    $('#vlsmAdd').onclick = () => {
      const name = $('#vlsmName').value.trim();
      const hosts = Number($('#vlsmHosts').value);
      if (!name) return toast('Pon un nombre', 'err');
      if (!hosts || hosts < 1) return toast('Nº de hosts no válido', 'err');
      App.vlsm.push({ name, hosts });
      $('#vlsmName').value = ''; $('#vlsmHosts').value = '';
      renderVlsmRows();
    };
    $('#btnVlsm').onclick = doVlsm;
    renderSubnetInfo(); renderVlsmRows();
  }

  /* ------------------------------------------------------------
     PANEL RUTAS
  ------------------------------------------------------------ */
  function updateRouteTable() {
    const dev = Model.getNode(App.state, $('#routeDevice').value);
    const box = $('#routeTable');
    if (!dev) { box.innerHTML = '<p class="hint">Añade equipos a la topología.</p>'; return; }
    const rows = Sim.routingTable(dev);
    if (!rows.length) {
      box.innerHTML = `<p class="hint"><b>${esc(dev.name)}</b> no tiene rutas: asigna IP a sus interfaces o añade rutas estáticas.</p>`;
      return;
    }
    box.innerHTML = `<div style="overflow:auto;border:1px solid var(--line);border-radius:10px">
      <table class="tbl"><thead><tr><th>Tipo</th><th>Destino</th><th>Salida</th><th>Next hop</th></tr></thead><tbody>
      ${rows.map(r => `<tr>
        <td><span class="code-${r.code}">${r.code}</span> ${r.type}</td>
        <td>${esc(r.network)}</td><td>${esc(r.iface)}</td><td>${esc(r.nextHop)}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="hint mt8"><b>C</b> = red conectada · <b>S</b> = ruta estática. La ruta más específica (mayor prefijo) tiene prioridad.</p>`;

    $('#newIface').innerHTML = '<option value="">—</option>' + dev.ifaces.map(i => `<option value="${escAttr(i.name)}">${esc(i.name)}</option>`).join('');
  }

  function bindRoutes() {
    $('#routeDevice').onchange = updateRouteTable;
    $('#btnAddRoute').onclick = () => {
      const dev = Model.getNode(App.state, $('#routeDevice').value);
      if (!dev) return toast('Selecciona un equipo', 'err');
      const dest = $('#newDest').value.trim();
      const hop = $('#newHop').value.trim();
      const iff = $('#newIface').value;
      if (!IP.parseCidr(dest)) return toast('Destino no válido (CIDR), ej. 10.0.0.0/8', 'err');
      if (hop && !IP.isValidIp(hop)) return toast('Next hop no válido', 'err');
      if (!hop && !iff) return toast('Indica next hop o interfaz', 'err');
      pushHistory();
      Model.addRoute(dev, { dest, nextHop: hop, iface: iff });
      updateRouteTable(); renderInspector(); autosave();
      toast('Ruta añadida', 'ok');
      $('#newDest').value = ''; $('#newHop').value = '';
    };
    $('#btnLookup').onclick = () => {
      const dev = Model.getNode(App.state, $('#routeDevice').value);
      const ip = $('#lookupIp').value.trim();
      if (!dev) return toast('Selecciona un equipo', 'err');
      if (!IP.isValidIp(ip)) return toast('IP destino no válida', 'err');
      const r = Sim.routeLookup(dev, ip);
      const box = $('#lookupResult');
      if (!r) {
        box.innerHTML = `<div class="issue error"><div class="ic"></div><div><div class="t">Sin ruta</div><div class="d">${esc(dev.name)} descartaría el paquete hacia ${esc(ip)}.</div></div></div>`;
        return;
      }
      box.innerHTML = `<div class="issue info"><div class="ic"></div><div>
        <div class="t">${esc(dev.name)} → ${esc(ip)}</div>
        <div class="d">Sale por <b>${esc(r.port || '—')}</b> ${r.nextHop ? '· next hop <b>' + esc(r.nextHop) + '</b>' : '· entrega directa'} — ${esc(r.label)}</div>
      </div></div>`;
    };
  }

  /* ------------------------------------------------------------
     PANEL DIAGNÓSTICO
  ------------------------------------------------------------ */
  function runDiagnose() {
    const d = Sim.diagnose(App.state);
    const box = $('#diagResult');
    if (!d.issues.length) {
      box.innerHTML = `<div class="issue ok"><div class="ic"></div><div><div class="t">Sin problemas detectados</div>
        <div class="d">Direccionamiento coherente, gateways alcanzables y rutas válidas.</div></div></div>`;
      return d;
    }
    box.innerHTML = `<div class="pill-row mb8">
        ${d.errors ? `<span class="badge am" style="border-color:#7f1d1d;color:#fecaca">${d.errors} error(es)</span>` : ''}
        ${d.warns ? `<span class="badge am">${d.warns} aviso(s)</span>` : ''}
        ${d.infos ? `<span class="badge cy">${d.infos} info</span>` : ''}
      </div>` +
      d.issues.map(i => `<div class="issue ${i.level}" data-node="${escAttr((i.nodes || [])[0] || '')}">
        <div class="ic"></div><div><div class="t">${esc(i.title)}</div><div class="d">${esc(i.detail)}</div></div></div>`).join('');
    $$('#diagResult .issue[data-node]').forEach(el => el.onclick = () => {
      const id = el.dataset.node;
      if (!id || !Model.getNode(App.state, id)) return;
      selectNode(id, false);
      const n = Model.getNode(App.state, id);
      App.view.x = $('#canvasArea').clientWidth / 2 - (n.x + NW / 2) * App.view.z;
      App.view.y = $('#canvasArea').clientHeight / 2 - (n.y + NH / 2) * App.view.z;
      applyView();
    });
    return d;
  }


  /* ------------------------------------------------------------
     SERVICIOS DEL SERVIDOR (DHCP / WEB / CORREO)
  ------------------------------------------------------------ */
  function state() { return App.state; }

  function rerenderInspector() {
    const box = $('#inspector');
    const top = box.scrollTop;
    renderInspector();
    box.scrollTop = top;
  }

  function showServiceLogModal(title, log, ok) {
    openModal({
      title: esc(title),
      wide: true,
      body: `<div class="result-card" style="max-height:340px;overflow:auto;font-family:var(--mono);font-size:12px;line-height:1.7">
        ${logLines(log)}
      </div>
      <p class="hint">${ok ? '✓ Operación completada' : '✗ La operación no se ha podido completar'}</p>`,
      buttons: [{ label: 'Cerrar', cls: 'primary' }]
    });
  }

  function svcDot(on) { return on ? '<span class="on-dot"></span>' : ''; }

  function servicesSectionHTML(n) {
    const sv = n.services || (n.services = Model.defaultServices('server'));
    const tab = App.svcTab || 'dhcp';
    return `<div class="sec-title">Servicios del servidor</div>
      <div class="tab-inline" id="svcTabs">
        <button data-svc="dhcp" class="${tab === 'dhcp' ? 'on' : ''}">DHCP${svcDot(sv.dhcp.enabled)}</button>
        <button data-svc="web" class="${tab === 'web' ? 'on' : ''}">Web${svcDot(sv.web.enabled)}</button>
        <button data-svc="mail" class="${tab === 'mail' ? 'on' : ''}">Correo${svcDot(sv.mail.enabled)}</button>
      </div>
      <div id="svcBody">${svcBodyHTML(n, tab)}</div>`;
  }

  function svcBodyHTML(n, tab) {
    const sv = n.services;
    if (tab === 'dhcp') return dhcpBodyHTML(n);
    if (tab === 'web') return webBodyHTML(n);
    return mailBodyHTML(n);
  }

  function ifaceOptions(n, sel) {
    return '<option value="">— automática —</option>' + (n.ifaces || []).map(i =>
      `<option value="${escAttr(i.name)}" ${sel === i.name ? 'selected' : ''}>${esc(i.name)}${i.ip ? ' · ' + esc(i.ip) : ''}</option>`).join('');
  }

  function dhcpBodyHTML(n) {
    const d = n.services.dhcp;
    let h = `<label class="switch-row"><input type="checkbox" id="svcDhcpOn" ${d.enabled ? 'checked' : ''}><span>Servicio DHCP activo</span></label>`;
    if (!d.enabled) {
      return h + `<p class="hint">Actívalo para repartir direcciones IP a los equipos del mismo segmento. El servidor debe tener una interfaz en la red que anuncia.</p>`;
    }
    if (!d.pools.length) h += `<p class="hint">Sin ámbitos configurados: no se puede asignar ninguna dirección.</p>`;

    d.pools.forEach((pool, idx) => {
      const c = IP.parseCidr(pool.network || '');
      const onSeg = c ? (n.ifaces || []).find(i => IP.isValidIp(i.ip) && IP.networkInt(i.ip, i.prefix) === c.ip && IP.clampPrefix(i.prefix) === c.prefix) : null;
      h += `<div class="pool-card">
        <div class="pool-head">
          <span class="pname">${esc(pool.name || 'Ámbito ' + (idx + 1))}</span>
          <button class="x" data-pool-del="${idx}" title="Eliminar ámbito">✕</button>
        </div>
        <div class="field"><label>Nombre del ámbito</label><input class="input" data-pool="${idx}" data-pk="name" value="${escAttr(pool.name)}"></div>
        <div class="field"><label>Red / máscara</label><input class="input ${c ? '' : 'bad'}" data-pool="${idx}" data-pk="network" value="${escAttr(pool.network)}" placeholder="192.168.1.0/24"></div>
        <div class="row2">
          <div class="field"><label>Rango · inicio</label><input class="input" data-pool="${idx}" data-pk="rangeStart" value="${escAttr(pool.rangeStart)}" placeholder=".100"></div>
          <div class="field"><label>Rango · fin</label><input class="input" data-pool="${idx}" data-pk="rangeEnd" value="${escAttr(pool.rangeEnd)}" placeholder=".200"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Puerta de enlace (opc. 3)</label><input class="input" data-pool="${idx}" data-pk="gateway" value="${escAttr(pool.gateway)}"></div>
          <div class="field"><label>DNS (opc. 6)</label><input class="input" data-pool="${idx}" data-pk="dns" value="${escAttr((pool.dns || []).join(','))}" placeholder="8.8.8.8"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Dominio (opc. 15)</label><input class="input" data-pool="${idx}" data-pk="domain" value="${escAttr(pool.domain || '')}"></div>
          <div class="field"><label>Concesión (min)</label><input class="input" type="number" min="1" data-pool="${idx}" data-pk="leaseMin" value="${Number(pool.leaseMin) || 1440}"></div>
        </div>
        <div class="field"><label>Interfaz de servicio</label><select class="input" data-pool="${idx}" data-pk="iface">${ifaceOptions(n, pool.iface)}</select></div>
        <div class="tiny ${onSeg ? '' : 'warn-txt'}">${onSeg ? `✓ Anuncia la red ${esc(pool.network)} por ${esc(onSeg.name)} (${esc(onSeg.ip)})` : `⚠ Ninguna interfaz del servidor está en la red ${esc(pool.network || '—')}: los clientes de ese segmento no recibirán oferta.`}</div>

        <div class="sub-block">
          <div class="sub-title">Exclusiones <span class="tiny">(nunca se entregan)</span></div>
          <div class="chips">
            ${(pool.excluded || []).map(x => `<span class="chip" data-exdel="${idx}|${escAttr(x)}">${esc(x)} <b>✕</b></span>`).join('') || '<span class="tiny">ninguna</span>'}
          </div>
          <div class="inline mt8">
            <input class="input" data-exin="${idx}" placeholder="192.168.1.21">
            <button class="btn sm" data-exadd="${idx}">Añadir</button>
          </div>
        </div>

        <div class="sub-block">
          <div class="sub-title">Reservas por MAC</div>
          ${(pool.reservations || []).map((r, ri) => `
            <div class="res-row">
              <input class="input" data-res="${idx}|${ri}" data-rk="mac" value="${escAttr(r.mac)}" placeholder="00:1A:2B:..">
              <input class="input" data-res="${idx}|${ri}" data-rk="ip" value="${escAttr(r.ip)}" placeholder="IP fija">
              <button class="x" data-resdel="${idx}|${ri}">✕</button>
            </div>`).join('')}
          <button class="btn sm mt8" data-resadd="${idx}" style="width:100%">+ Nueva reserva</button>
        </div>
      </div>`;
    });

    h += `<button class="btn sm" id="addPool" style="width:100%;margin-bottom:10px">+ Añadir ámbito</button>`;

    const ls = Services.leases(App.state, n.id);
    h += `<div class="sec-title">Concesiones de este servidor <span class="tiny">${ls.length}</span></div>`;
    if (!ls.length) h += `<p class="hint" style="margin:0">Todavía no ha entregado ninguna dirección.</p>`;
    else h += `<div class="lease-table">${ls.map(l => `<div class="lease-row">
        <span class="ip">${esc(l.ip)}</span>
        <span class="who">${esc(l.node.name)}<br><span class="tiny">${esc(l.mac)}</span></span>
        <span class="tag ${l.type === 'reserva por MAC' ? 'res' : ''}">${esc(l.type === 'reserva por MAC' ? 'reserva' : 'dinámica')}</span>
      </div>`).join('')}</div>`;
    h += `<button class="btn sm primary mt8" id="renewSrv" style="width:100%">${ICO.play} Renovar clientes DHCP</button>`;
    return h;
  }

  function webBodyHTML(n) {
    const w = n.services.web;
    let h = `<label class="switch-row"><input type="checkbox" id="svcWebOn" ${w.enabled ? 'checked' : ''}><span>Servidor HTTP activo (TCP/80)</span></label>`;
    if (!w.enabled) return h + `<p class="hint">Actívalo y publica al menos un sitio para que los clientes puedan abrirlo con el navegador.</p>`;
    if (!w.sites.length) h += `<p class="hint">Sin sitios publicados.</p>`;
    w.sites.forEach((site, idx) => {
      h += `<div class="pool-card">
        <div class="pool-head"><span class="pname">${esc(site.name || 'sitio')}</span><button class="x" data-site-del="${idx}">✕</button></div>
        <div class="field"><label>Nombre / dominio</label><input class="input" data-site="${idx}" data-sk="name" value="${escAttr(site.name)}" placeholder="intranet.aula.local"></div>
        <div class="row2">
          <div class="field"><label>Alias</label><input class="input" data-site="${idx}" data-sk="alias" value="${escAttr(site.alias || '')}" placeholder="intranet"></div>
          <div class="field"><label>Título</label><input class="input" data-site="${idx}" data-sk="title" value="${escAttr(site.title || '')}"></div>
        </div>
        <div class="field"><label>Contenido (HTML simulado)</label><textarea class="input" rows="3" data-site="${idx}" data-sk="body" style="font-family:var(--mono);font-size:11px">${esc(site.body || '')}</textarea></div>
      </div>`;
    });
    h += `<button class="btn sm" id="addSite" style="width:100%">+ Publicar sitio</button>
      <p class="hint">Los clientes abren el sitio con el botón <b>Navegar</b> o en la consola: <code>http PC1 intranet</code>.</p>`;
    return h;
  }

  function mailBodyHTML(n) {
    const m = n.services.mail;
    let h = `<label class="switch-row"><input type="checkbox" id="svcMailOn" ${m.enabled ? 'checked' : ''}><span>Servicio de correo activo</span></label>`;
    if (!m.enabled) return h + `<p class="hint">Actívalo, define el dominio y crea los buzones. Se simulan SMTP (25) y POP3 (110).</p>`;
    h += `<div class="row2">
        <div class="field"><label>Dominio</label><input class="input" data-mail="domain" value="${escAttr(m.domain || '')}" placeholder="aula.local"></div>
        <div class="field"><label>Puertos SMTP/POP3</label>
          <div class="inline"><input class="input" type="number" data-mail="smtp" value="${Number(m.smtp) || 25}"><input class="input" type="number" data-mail="pop3" value="${Number(m.pop3) || 110}"></div>
        </div>
      </div>`;
    h += `<div class="sec-title">Buzones <span class="tiny">${(m.users || []).length}</span></div>`;
    if (!(m.users || []).length) h += `<p class="hint" style="margin:0">Sin buzones: crea al menos uno para poder enviar y recibir correo.</p>`;
    (m.users || []).forEach((u, idx) => {
      h += `<div class="mail-user">
        <div class="mu-head">
          <span class="addr">${esc(u.user)}@${esc(m.domain || '')}</span>
          <span class="tiny">${(u.box || []).length} mensaje(s)</span>
        </div>
        <div class="row2">
          <div class="field" style="margin:0"><label>Usuario</label><input class="input" data-user="${idx}" data-uk="user" value="${escAttr(u.user)}"></div>
          <div class="field" style="margin:0"><label>Contraseña</label><input class="input" data-user="${idx}" data-uk="password" value="${escAttr(u.password || '')}"></div>
        </div>
        <div class="flex gap8 mt8">
          <button class="btn sm ghost" data-inbox="${idx}">Ver buzón</button>
          <button class="btn sm danger" data-userdel="${idx}">Eliminar</button>
        </div>
      </div>`;
    });
    h += `<button class="btn sm" id="addUser" style="width:100%;margin-top:8px">+ Nuevo buzón</button>`;
    return h;
  }

  function bindServicesSection(n) {
    const sv = n.services;
    $$('#svcTabs button').forEach(b => b.onclick = () => {
      App.svcTab = b.dataset.svc;
      rerenderInspector();
    });

    const chk = (id, fn) => { const el = $(id); if (el) el.onchange = () => { pushHistory(); fn(el.checked); rerenderInspector(); autosave(); }; };

    chk('#svcDhcpOn', v => { sv.dhcp.enabled = v; if (v && !sv.dhcp.pools.length) sv.dhcp.pools.push(Model.newPool()); });
    chk('#svcWebOn', v => { sv.web.enabled = v; });
    chk('#svcMailOn', v => { sv.mail.enabled = v; });

    /* --- DHCP --- */
    $$('#svcBody [data-pool]').forEach(inp => {
      inp.onchange = () => {
        const pool = sv.dhcp.pools[Number(inp.dataset.pool)];
        if (!pool) return;
        const k = inp.dataset.pk;
        if (k === 'dns') pool.dns = inp.value.split(',').map(x => x.trim()).filter(Boolean);
        else if (k === 'leaseMin') pool.leaseMin = Number(inp.value) || 1440;
        else pool[k] = inp.value.trim();
        autosave(); rerenderInspector();
      };
    });
    $$('#svcBody [data-pool-del]').forEach(b => b.onclick = () => {
      pushHistory();
      sv.dhcp.pools.splice(Number(b.dataset.poolDel), 1);
      rerenderInspector(); autosave();
    });
    const addPool = $('#addPool');
    if (addPool) addPool.onclick = () => {
      pushHistory();
      const last = sv.dhcp.pools[sv.dhcp.pools.length - 1];
      sv.dhcp.pools.push(Model.newPool(last ? { network: last.network } : {}));
      rerenderInspector(); autosave();
    };
    $$('#svcBody [data-exadd]').forEach(b => b.onclick = () => {
      const pool = sv.dhcp.pools[Number(b.dataset.exadd)];
      const inp = $(`#svcBody [data-exin="${b.dataset.exadd}"]`);
      const v = (inp.value || '').trim();
      if (!IP.isValidIp(v)) return toast('Dirección a excluir no válida', 'err');
      pool.excluded = pool.excluded || [];
      if (!pool.excluded.includes(v)) pool.excluded.push(v);
      pushHistory(); rerenderInspector(); autosave();
    });
    $$('#svcBody [data-exdel]').forEach(el => el.onclick = () => {
      const [i, val] = el.dataset.exdel.split('|');
      const pool = sv.dhcp.pools[Number(i)];
      pool.excluded = (pool.excluded || []).filter(x => x !== val);
      pushHistory(); rerenderInspector(); autosave();
    });
    $$('#svcBody [data-resadd]').forEach(b => b.onclick = () => {
      const pool = sv.dhcp.pools[Number(b.dataset.resadd)];
      pool.reservations = pool.reservations || [];
      pool.reservations.push({ mac: '', ip: '', note: '' });
      rerenderInspector();
    });
    $$('#svcBody [data-res]').forEach(inp => {
      inp.onchange = () => {
        const [i, ri] = inp.dataset.res.split('|').map(Number);
        const pool = sv.dhcp.pools[i];
        if (!pool || !pool.reservations[ri]) return;
        pool.reservations[ri][inp.dataset.rk] = inp.value.trim();
        autosave(); rerenderInspector();
      };
    });
    $$('#svcBody [data-resdel]').forEach(b => b.onclick = () => {
      const [i, ri] = b.dataset.resdel.split('|').map(Number);
      sv.dhcp.pools[i].reservations.splice(ri, 1);
      pushHistory(); rerenderInspector(); autosave();
    });
    const rs = $('#renewSrv');
    if (rs) rs.onclick = () => {
      const res = Services.renewAll(App.state);
      renderAll(); refreshPanels(); rerenderInspector(); autosave();
      termLog(['dhcp renew-all'], 'cmd'); termLog(res.log);
      showServiceLogModal('Renovación DHCP', res.log, res.ko === 0 && res.ok > 0);
    };

    /* --- WEB --- */
    $$('#svcBody [data-site]').forEach(inp => {
      inp.onchange = () => {
        const site = sv.web.sites[Number(inp.dataset.site)];
        if (!site) return;
        site[inp.dataset.sk] = inp.value;
        autosave();
      };
    });
    $$('#svcBody [data-site-del]').forEach(b => b.onclick = () => {
      sv.web.sites.splice(Number(b.dataset.siteDel), 1);
      pushHistory(); rerenderInspector(); autosave();
    });
    const addSite = $('#addSite');
    if (addSite) addSite.onclick = () => {
      pushHistory();
      sv.web.sites.push(Model.newSite({ name: 'nuevo.' + (sv.mail.domain || 'local') }));
      rerenderInspector(); autosave();
    };

    /* --- CORREO --- */
    $$('#svcBody [data-mail]').forEach(inp => {
      inp.onchange = () => {
        const k = inp.dataset.mail;
        sv.mail[k] = (k === 'pop3' || k === 'smtp') ? (Number(inp.value) || (k === 'pop3' ? 110 : 25)) : inp.value.trim();
        autosave(); rerenderInspector();
      };
    });
    $$('#svcBody [data-user]').forEach(inp => {
      inp.onchange = () => {
        const u = sv.mail.users[Number(inp.dataset.user)];
        if (!u) return;
        u[inp.dataset.uk] = inp.value.trim();
        autosave();
      };
    });
    $$('#svcBody [data-userdel]').forEach(b => b.onclick = () => {
      sv.mail.users.splice(Number(b.dataset.userdel), 1);
      pushHistory(); rerenderInspector(); autosave();
    });
    const addUser = $('#addUser');
    if (addUser) addUser.onclick = () => {
      pushHistory();
      sv.mail.users.push(Model.newMailUser({ user: 'usuario' + ((sv.mail.users || []).length + 1) }));
      rerenderInspector(); autosave();
    };
    $$('#svcBody [data-inbox]').forEach(b => b.onclick = () => {
      const u = sv.mail.users[Number(b.dataset.inbox)];
      openModal({
        title: 'Buzón · ' + esc(u.user + '@' + sv.mail.domain),
        body: (u.box || []).length
          ? (u.box || []).map(m => `<div class="result-card">
              <div class="kv"><span class="k">De</span><span class="v">${esc(m.from)}</span></div>
              <div class="kv"><span class="k">Para</span><span class="v">${esc(m.to)}</span></div>
              <div class="kv"><span class="k">Asunto</span><span class="v">${esc(m.subject)}</span></div>
              <div class="kv"><span class="k">Fecha</span><span class="v">${esc(m.date)}</span></div>
              <p style="font-size:12.5px;color:var(--txt-2);margin:8px 0 0">${esc(m.body)}</p>
            </div>`).join('')
          : '<p class="hint">Buzón vacío.</p>',
        buttons: [{ label: 'Cerrar' }]
      });
    });
  }

  function clientServicesHTML(n) {
    const web = App.state.nodes.some(x => x.services && x.services.web && x.services.web.enabled && (x.services.web.sites || []).length);
    const mail = App.state.nodes.some(x => x.services && x.services.mail && x.services.mail.enabled && (x.services.mail.users || []).length);
    if (!web && !mail) return '';
    return `<div class="sec-title">Servicios de cliente</div>
      <div class="flex gap8 wrap">
        ${web ? `<button class="btn sm" id="cliWeb">${ICO.globe || ''} Navegar web</button>` : ''}
        ${mail ? `<button class="btn sm" id="cliMail">${ICO.mailIco || ''} Correo POP3</button>` : ''}
      </div>`;
  }

  function bindClientServices(n) {
    const w = $('#cliWeb'), m = $('#cliMail');
    if (w) w.onclick = () => openWebBrowser(n.id);
    if (m) m.onclick = () => openMailClient(n.id);
  }

  /* ---------------- navegador simulado ---------------- */
  function openWebBrowser(clientId) {
    const sites = [];
    App.state.nodes.forEach(srv => {
      const web = srv.services && srv.services.web;
      if (!web || !web.enabled) return;
      (web.sites || []).forEach(s => sites.push({ server: srv, site: s }));
    });
    if (!sites.length) return toast('Ningún servidor web tiene sitios publicados', 'err');
    const client = Model.getNode(App.state, clientId);
    openModal({
      title: 'Navegador · ' + esc(client.name),
      wide: true,
      body: `<div class="inline mb8">
          <input class="input" id="urlBar" value="${escAttr(sites[0].site.name)}" list="siteList" placeholder="intranet.aula.local">
          <datalist id="siteList">${sites.map(x => `<option value="${escAttr(x.site.name)}">${esc(x.server.name)}</option>`).join('')}</datalist>
          <button class="btn sm primary" id="goUrl">Ir</button>
        </div>
        <div id="webOut"></div>`,
      buttons: [{ label: 'Cerrar' }],
      onMount() {
        const go = () => {
          const res = Services.httpGet(App.state, client, $('#urlBar').value);
          $('#webOut').innerHTML = `<div class="result-card" style="font-family:var(--mono);font-size:11.5px;line-height:1.65;margin-bottom:10px">${logLines(res.log)}</div>` +
            (res.ok ? `<div class="browser-frame"><div class="bf-bar">🔒 ${esc(res.site.name)}</div><div class="bf-body">${res.site.body || ''}</div></div>` : '');
          termLog([`http ${client.name} ${$('#urlBar').value}`], 'cmd');
          termLog(res.log);
        };
        $('#goUrl').onclick = go;
        $('#urlBar').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        go();
      }
    });
  }

  /* ---------------- cliente de correo ---------------- */
  function openMailClient(clientId) {
    const client = Model.getNode(App.state, clientId);
    const servers = Services.mailServers(App.state);
    if (!servers.length) return toast('No hay servidores de correo activos', 'err');
    const opts = [];
    servers.forEach(sv => (sv.services.mail.users || []).forEach(u => opts.push({ sv, u, addr: u.user + '@' + sv.services.mail.domain })));
    if (!opts.length) return toast('Los servidores de correo no tienen buzones creados', 'err');

    openModal({
      title: 'Cliente de correo · ' + esc(client.name),
      wide: true,
      body: `
        <div class="row2">
          <div class="field"><label>Cuenta (POP3)</label>
            <select class="input" id="mailAcc">${opts.map((o, i) => `<option value="${i}">${esc(o.addr)} · ${esc(o.sv.name)}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Contraseña</label><input class="input" id="mailPass" value="${escAttr(opts[0].u.password || '')}"></div>
        </div>
        <div class="flex gap8 mb8"><button class="btn sm primary" id="mailLogin">Conectar y ver buzón</button></div>
        <div id="mailOut"></div>
        <div id="mailSendOut"></div>
        <div class="sec-title">Enviar mensaje (SMTP)</div>
        <div class="row2">
          <div class="field"><label>Para</label><input class="input" id="mailTo" list="accList" placeholder="profesor@aula.local">
            <datalist id="accList">${opts.map(o => `<option value="${escAttr(o.addr)}">`).join('')}</datalist></div>
          <div class="field"><label>Asunto</label><input class="input" id="mailSubj" value="Prueba desde NetLab"></div>
        </div>
        <div class="field"><label>Mensaje</label><textarea class="input" id="mailBody" rows="3" style="font-family:var(--font)">Hola, este correo viaja por la topología simulada.</textarea></div>
        <button class="btn sm primary" id="mailSend" style="width:100%">Enviar correo</button>`,
      buttons: [{ label: 'Cerrar' }],
      onMount() {
        const cfg = () => opts[Number($('#mailAcc').value)];
        const doLogin = () => {
          const c = cfg();
          const res = Services.login(App.state, client, c.sv.id, c.u.user, $('#mailPass').value);
          $('#mailOut').innerHTML = `<div class="result-card" style="font-family:var(--mono);font-size:11.5px;line-height:1.65">${logLines(res.log)}</div>`;
          if (res.ok) {
            const box = res.account.box || [];
            $('#mailOut').innerHTML += `<div class="sec-title">Bandeja de entrada <span class="tiny">${box.length}</span></div>` +
              (box.length ? box.map(m => `<div class="result-card">
                  <div class="kv"><span class="k">De</span><span class="v">${esc(m.from)}</span></div>
                  <div class="kv"><span class="k">Asunto</span><span class="v">${esc(m.subject)}</span></div>
                  <div class="kv"><span class="k">Fecha</span><span class="v">${esc(m.date)}</span></div>
                  <p style="font-size:12.5px;color:var(--txt-2);margin:8px 0 0">${esc(m.body)}</p></div>`).join('')
                : '<p class="hint">Buzón vacío.</p>');
          }
          termLog([`pop3 ${client.name} ${c.addr}`], 'cmd'); termLog(res.log);
        };
        $('#mailLogin').onclick = doLogin;
        $('#mailSend').onclick = () => {
          const c = cfg();
          const res = Services.send(App.state, client, c.addr, $('#mailTo').value, $('#mailSubj').value, $('#mailBody').value);
          $('#mailSendOut').innerHTML = `<div class="result-card" style="font-family:var(--mono);font-size:11.5px;line-height:1.65">${logLines(res.log)}</div>`;
          termLog([`smtp ${client.name} → ${$('#mailTo').value}`], 'cmd'); termLog(res.log);
          autosave(); renderInspector(); refreshPanels();
          if (res.ok) {
            toast('Correo entregado en el buzón de ' + esc($('#mailTo').value), 'ok');
            // al ser un POP3 simulado, se recarga la bandeja para ver el mensaje recibido
            const cfgNow = cfg();
            const dest = Services.findAccount(App.state, $('#mailTo').value);
            if (dest && dest.server.id === cfgNow.sv.id && String(dest.account.user).toLowerCase() === String(cfgNow.u.user).toLowerCase()) {
              const rr = Services.login(App.state, client, cfgNow.sv.id, cfgNow.u.user, $('#mailPass').value);
              if (rr.ok) {
                const box = rr.account.box || [];
                $('#mailOut').innerHTML = `<div class="result-card" style="font-family:var(--mono);font-size:11.5px;line-height:1.65">${logLines(rr.log)}</div>
                  <div class="sec-title">Bandeja de entrada <span class="tiny">${box.length}</span></div>` +
                  box.map(m => `<div class="result-card">
                      <div class="kv"><span class="k">De</span><span class="v">${esc(m.from)}</span></div>
                      <div class="kv"><span class="k">Asunto</span><span class="v">${esc(m.subject)}</span></div>
                      <div class="kv"><span class="k">Fecha</span><span class="v">${esc(m.date)}</span></div>
                      <p style="font-size:12.5px;color:var(--txt-2);margin:8px 0 0">${esc(m.body)}</p></div>`).join('');
              }
            }
          }
        };
        doLogin();
      }
    });
  }

  /* ------------------------------------------------------------
     TABS DE LA BARRA LATERAL
  ------------------------------------------------------------ */
  function renderServicesPanel() {
    const box = $('#svcPanel');
    if (!box) return;
    const servers = App.state.nodes.filter(n => n.type === 'server');
    let h = '';
    if (!servers.length) {
      h += `<p class="hint">No hay servidores en la topología. Añade uno desde la pestaña <b>Equipos</b> y actívales servicios en el panel derecho.</p>`;
    }
    servers.forEach(srv => {
      const sv = srv.services || {};
      const d = sv.dhcp || {}, w = sv.web || {}, m = sv.mail || {};
      const leasesN = Services.leases(App.state, srv.id).length;
      h += `<div class="svc-list" data-srv="${srv.id}">
        <div class="nm"><span>${esc(srv.name)}</span><span class="tiny">${srv.ifaces.filter(i => IP.isValidIp(i.ip)).length} IP</span></div>
        <div class="det">
          <span class="svc-badge ${d.enabled ? '' : 'off'}">DHCP ${d.enabled ? (d.pools || []).length + ' ámbito(s)' : 'off'}</span>
          <span class="svc-badge ${w.enabled ? '' : 'off'}">HTTP ${w.enabled ? (w.sites || []).length + ' sitio(s)' : 'off'}</span>
          <span class="svc-badge ${m.enabled ? '' : 'off'}">POP3 ${m.enabled ? (m.users || []).length + ' buzón(es)' : 'off'}</span>
          ${leasesN ? `<span class="svc-badge">${leasesN} concesión(es)</span>` : ''}
        </div>
        <div class="det">${srv.ifaces.map(i => i.ip ? `${esc(i.name)}: ${esc(i.ip)}/${IP.clampPrefix(i.prefix)}` : `${esc(i.name)}: sin IP`).join(' · ')}</div>
      </div>`;
    });

    const allLeases = [];
    App.state.nodes.forEach(n => (n.ifaces || []).forEach(i => {
      if (i.lease && i.ip) allLeases.push({ node: n, iface: i });
    }));
    h += `<h3>Clientes DHCP</h3>`;
    const dhcpClients = App.state.nodes.filter(n => !Model.isL2(n) && n.ifaces.some(i => i.dhcp));
    if (!dhcpClients.length) h += `<p class="hint">Ningún equipo está en modo DHCP. En el inspector de un PC elige la pestaña <b>DHCP</b>.</p>`;
    else h += dhcpClients.map(n => {
      const i = n.ifaces.find(x => x.dhcp);
      return `<div class="lease-row" style="border:1px solid var(--line);border-radius:8px;margin-bottom:5px">
        <span class="ip">${esc(i.ip || '— sin IP —')}</span>
        <span class="who">${esc(n.name)}<br><span class="tiny">${esc(n.mac || '')}</span></span>
        <span class="tag ${i.lease && i.lease.type === 'reserva por MAC' ? 'res' : ''}">${i.lease ? esc(i.lease.type) : 'pendiente'}</span>
      </div>`;
    }).join('');

    h += `<p class="hint">El botón <b>Renovar DHCP</b> lanza el proceso DORA de todos los clientes y deja las concesiones en sus interfaces.</p>`;
    box.innerHTML = h;
    $$('#svcPanel [data-srv]').forEach(el => el.onclick = () => {
      selectNode(el.dataset.srv, false);
      const n = Model.getNode(App.state, el.dataset.srv);
      if (n) {
        App.view.x = $('#canvasArea').clientWidth / 2 - (n.x + NW / 2) * App.view.z;
        App.view.y = $('#canvasArea').clientHeight / 2 - (n.y + NH / 2) * App.view.z;
        applyView();
      }
    });
  }

  function showLeasesModal() {
    const rows = [];
    App.state.nodes.forEach(n => (n.ifaces || []).forEach(i => {
      if (i.lease && i.ip) rows.push({ n, i });
    }));
    openModal({
      title: 'Concesiones DHCP activas',
      wide: true,
      body: rows.length ? `<table class="tbl"><thead><tr><th>Cliente</th><th>IP</th><th>MAC</th><th>Servidor</th><th>Tipo</th><th>Concesión</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${esc(r.n.name)}</td><td style="color:var(--cyan)">${esc(r.i.ip)}</td><td>${esc(r.n.mac || '')}</td>
          <td>${esc(r.i.lease.serverName || '')}</td><td>${esc(r.i.lease.type || '')}</td><td>${r.i.lease.minutes} min</td></tr>`).join('')}
      </tbody></table>` : '<p class="hint">No hay concesiones activas. Pulsa «Renovar DHCP».</p>',
      buttons: [{ label: 'Cerrar' }]
    });
  }

  function renewAllDhcp(silent) {
    const res = Services.renewAll(App.state);
    renderAll(); renderInspector(); refreshPanels(); autosave();
    termLog(['dhcp renew-all'], 'cmd');
    termLog(res.log);
    if (!silent) showServiceLogModal('Renovación DHCP · ' + res.ok + ' concesión(es)', res.log, res.ok > 0);
    return res;
  }

  function switchTab(tab) {
    $$('#leftTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    $$('.side-body .panel').forEach(p => p.classList.toggle('on', p.id === 'panel-' + tab));
    if (tab === 'diag') runDiagnose();
    if (tab === 'routes') refreshPanels();
    if (tab === 'services') renderServicesPanel();
  }

  /* ------------------------------------------------------------
     ACTIVIDADES
  ------------------------------------------------------------ */
  function renderActivityGrid() {
    const done = doneList();
    $('#actGrid').innerHTML = Activities.ACTIVITIES.map(a => `
      <button class="act-card" data-act="${a.id}">
        <div class="act-meta">
          <span class="badge ${a.level.startsWith('CFGS') ? 'vi' : 'cy'}">${esc(a.level)}</span>
          ${done[a.id] ? '<span class="badge done">✓ completada</span>' : ''}
          <span class="badge">${a.mins} min</span>
        </div>
        <h4>${esc(a.title)}</h4>
        <p>${esc(a.tagline)}</p>
        <div class="act-tags">${a.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </button>`).join('');
    $$('#actGrid .act-card').forEach(c => c.onclick = () => loadActivity(c.dataset.act));
  }

  function loadActivity(id) {
    const act = Activities.byId(id);
    if (!act) return;
    if (App.state.nodes.length && !App.state.activityId && !confirm('Se reemplazará la topología actual por la de la actividad. ¿Continuar?')) return;
    App.activity = act;
    App.state = act.initial();
    App.state.name = act.title;
    App.state.activityId = act.id;
    App.sel.nodes.clear(); App.sel.links.clear();
    App.history = []; App.future = [];
    $('#projectName').value = act.title;
    gotoWorkspace();
    showRibbon();
    switchTab('activity');
    openBriefing();
    runActivityCheck(false);
    autosave();
  }

  function showRibbon() {
    const r = $('#actRibbon');
    r.classList.toggle('hidden', !App.activity);
    $('#canvasArea').classList.toggle('has-ribbon', !!App.activity);
    $('#tabActivity').classList.toggle('hidden', !App.activity);
    if (App.activity) $('#ribbonTitle').textContent = App.activity.title;
  }

  function buildActTab() {
    const el = $('#actSide');
    if (!App.activity) { el.innerHTML = ''; showRibbon(); return; }
    const a = App.activity;
    el.innerHTML = `
      <div class="act-meta mb8"><span class="badge cy">${esc(a.level)}</span><span class="badge">${a.mins} min</span></div>
      <h3 style="text-transform:none;font-size:16px;letter-spacing:0;color:var(--txt);margin:0 0 6px">${esc(a.title)}</h3>
      <p class="hint">${esc(a.tagline)}</p>
      <div class="sec-title">Objetivos</div>
      <ul class="goal-list">${a.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
      <div class="sec-title">Progreso</div>
      <div class="progress-bar"><i id="actProg" style="width:0%"></i></div>
      <div id="actChecks"></div>
      <button class="btn primary sm mt8" id="actCheckBtn" style="width:100%">Comprobar actividad</button>
      <div class="flex gap8 mt8">
        <button class="btn sm" id="actBrief">${ICO.doc} Enunciado</button>
        <button class="btn sm" id="actTheory">${ICO.book} Teoría</button>
      </div>
      <div class="flex gap8 mt8">
        <button class="btn sm ghost" id="actSol">${ICO.eye} Ver solución</button>
        <button class="btn sm ghost" id="actReset">${ICO.reset} Reiniciar</button>
      </div>`;
    $('#actCheckBtn').onclick = () => runActivityCheck(true);
    $('#actBrief').onclick = openBriefing;
    $('#actTheory').onclick = () => openModal({
      title: 'Teoría · ' + esc(a.title),
      body: `<div class="briefing">${a.theory}</div>`,
      buttons: [{ label: 'Entendido' }], wide: true
    });
    $('#actSol').onclick = () => {
      if (!confirm('Se cargará la solución completa (perderás tus cambios). ¿Continuar?')) return;
      App.state = a.solution();
      App.state.name = 'Solución · ' + a.title;
      App.state.activityId = a.id;
      App.sel.nodes.clear(); App.sel.links.clear();
      renderAll(); renderInspector(); refreshPanels(); fitView(); autosave();
      toast('Solución cargada', 'ok');
    };
    $('#actReset').onclick = () => {
      if (!confirm('¿Reiniciar la actividad con la topología inicial?')) return;
      App.state = a.initial();
      App.state.name = a.title; App.state.activityId = a.id;
      App.sel.nodes.clear(); App.sel.links.clear();
      renderAll(); renderInspector(); refreshPanels(); fitView(); autosave();
      runActivityCheck(false);
    };
    showRibbon();
  }

  function openBriefing() {
    const a = App.activity;
    if (!a) return;
    openModal({
      title: esc(a.title),
      wide: true,
      body: `<div class="briefing">
        <div class="act-meta mb8"><span class="badge cy">${esc(a.level)}</span><span class="badge">${a.mins} min</span>
        ${a.tags.map(t => `<span class="badge">${esc(t)}</span>`).join('')}</div>
        ${a.briefing}
        <h4>Objetivos de aprendizaje</h4>
        <ul class="goal-list">${a.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
      </div>`,
      buttons: [
        { label: ICO.book + ' Ver teoría', cls: 'ghost', keep: true, fn: () => openModal({ title: 'Teoría · ' + esc(a.title), body: `<div class="briefing">${a.theory}</div>`, buttons: [{ label: 'Cerrar' }], wide: true }) },
        { label: 'Empezar', cls: 'primary' }
      ]
    });
  }

  function runActivityCheck(showModal) {
    const a = App.activity;
    if (!a) return;
    let results;
    try { results = a.check(App.state); }
    catch (e) { console.error(e); results = [{ ok: false, text: 'Error al comprobar', msg: String(e.message || e) }]; }
    App.lastCheck = results;
    const pass = results.filter(r => r.ok).length;
    const total = results.length;
    const pct = total ? Math.round(pass / total * 100) : 0;

    $('#ribbonScore').textContent = pass + '/' + total;
    const prog = $('#actProg');
    if (prog) prog.style.width = pct + '%';
    const list = $('#actChecks');
    if (list) list.innerHTML = results.map(r => `
      <div class="check-item ${r.ok ? 'pass' : 'fail'}">
        <div class="st">${r.ok ? '✓' : '✕'}</div>
        <div class="tx"><b>${esc(r.text)}</b><span>${esc(r.msg || '')}</span></div>
      </div>`).join('');

    if (pass === total) {
      const done = doneList();
      done[a.id] = Date.now();
      try { localStorage.setItem(LS_DONE, JSON.stringify(done)); } catch (e) {}
      if (showModal) toast('★ <b>¡Actividad completada!</b> Todos los requisitos se cumplen.', 'ok');
    }

    if (showModal) {
      openModal({
        title: 'Corrección · ' + esc(a.title),
        wide: true,
        body: `<div class="flex between ac mb8">
            <div style="font-size:14px;font-weight:700">${pass} de ${total} requisitos correctos</div>
            <div class="badge ${pass === total ? 'done' : ''}">${pct}%</div>
          </div>
          <div class="progress-bar"><i style="width:${pct}%"></i></div>
          ${results.map(r => `<div class="check-item ${r.ok ? 'pass' : 'fail'}">
            <div class="st">${r.ok ? '✓' : '✕'}</div>
            <div class="tx"><b>${esc(r.text)}</b><span>${esc(r.msg || '')}</span></div>
          </div>`).join('')}
          ${pass === total ? '<p class="tip" style="margin-top:14px"><span>★ <b>¡Enhorabuena!</b> Puedes seguir practicando con otra actividad o probar a montar tu propia topología.</p>' : '<p class="hint mt8">Corrige los puntos marcados en rojo y vuelve a comprobar.</p>'}`,
        buttons: [
          { label: 'Ver enunciado', cls: 'ghost', keep: true, fn: openBriefing },
          { label: 'Cerrar', cls: 'primary' }
        ]
      });
    }
  }

  /* ------------------------------------------------------------
     SIMULACIÓN · ping / traceroute
  ------------------------------------------------------------ */
  function nodesWithIp() {
    return App.state.nodes.filter(n => n.ifaces.some(i => IP.isValidIp(i.ip)));
  }

  function openPingDialog(presetId, mode) {
    const eligible = nodesWithIp();
    if (!eligible.length) return toast('Configura alguna IP antes de simular', 'err');
    const srcId = presetId || eligible[0].id;
    const datalist = [...new Set(eligible.flatMap(n => n.ifaces.filter(i => IP.isValidIp(i.ip)).map(i => `${i.ip} · ${n.name}`)))]
      .map(s => `<option value="${escAttr(s.split(' · ')[0])}">${esc(s)}</option>`).join('');

    openModal({
      title: mode === 'trace' ? 'Traceroute simulado' : 'Simular ping',
      wide: true,
      body: `
        <div class="row2">
          <div class="field"><label>Equipo origen</label>
            <select class="input" id="pingSrc">${eligible.map(n => `<option value="${n.id}" ${n.id === srcId ? 'selected' : ''}>${esc(n.name)} · ${esc(n.ifaces.find(i => IP.isValidIp(i.ip)).ip)}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Destino (IP o equipo)</label>
            <input class="input" id="pingDst" list="ipList" placeholder="192.168.2.10 o PC2">
            <datalist id="ipList">${datalist}</datalist>
          </div>
        </div>
        <div class="flex gap8 mb8">
          <button class="btn sm primary" id="doPing">▶ Ejecutar</button>
          <button class="btn sm ghost" id="fillFirst">Usar primer equipo con IP</button>
        </div>
        <div id="pingOut" class="mt8"></div>`,
      buttons: [{ label: 'Cerrar' }],
      onMount() {
        const dst = $('#pingDst');
        const run = () => {
          const src = Model.getNode(App.state, $('#pingSrc').value);
          let target = dst.value.trim();
          const byName = Model.byName(App.state, target);
          if (byName) {
            const i = byName.ifaces.find(x => IP.isValidIp(x.ip));
            if (i) target = i.ip;
          }
          if (!src) return;
          if (!IP.isValidIp(target)) return toast('Destino no válido', 'err');
          if (mode === 'trace') runTraceroute(src, target, $('#pingOut'));
          else runPing(src, target, $('#pingOut'));
        };
        $('#doPing').onclick = run;
        dst.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
        $('#fillFirst').onclick = () => {
          const other = eligible.find(n => n.id !== srcId);
          if (other) dst.value = other.ifaces.find(i => IP.isValidIp(i.ip)).ip;
        };
      }
    });
  }

  function logLines(log) {
    return log.map(l => `<div class="ln ${l[0] === '✓' ? 'ok' : l[0] === '✗' ? 'err' : l[0] === '⚠' ? 'warn' : l[0] === 'ℹ' ? 'info' : ''}">${l}</div>`).join('');
  }

  function runPing(src, target, outEl) {
    const res = Sim.ping(App.state, src.id, target);
    if (outEl) {
      outEl.innerHTML = `<div class="result-card" style="max-height:300px;overflow:auto;font-family:var(--mono);font-size:12px;line-height:1.7">
        <div style="color:var(--txt-3);margin-bottom:8px">netlab&gt; ping ${esc(src.name)} ${esc(target)}</div>
        ${logLines(res.log)}
      </div>`;
    }
    termLog([`ping ${src.name} ${target}`], 'cmd');
    termLog(res.log);
    highlightPath(res.hops);
    return res;
  }

  function runTraceroute(src, target, outEl) {
    const res = Sim.trace(App.state, src.id, target);
    const hops = res.hops.map((h, i) => `<tr><td>${i + 1}</td><td>${esc(h.node.name)}</td><td>${esc(h.ip)}</td></tr>`).join('');
    if (outEl) {
      outEl.innerHTML = `<div class="result-card" style="max-height:300px;overflow:auto">
        <div style="color:var(--txt-3);font-family:var(--mono);font-size:12px;margin-bottom:8px">netlab&gt; tracert ${esc(src.name)} ${esc(target)}</div>
        ${res.hops.length ? `<table class="tbl"><thead><tr><th>#</th><th>Salto</th><th>IP</th></tr></thead><tbody>${hops}</tbody></table>` : ''}
        <div class="mt8" style="font-family:var(--mono);font-size:12px;line-height:1.7">${logLines(res.log)}</div>
      </div>`;
    }
    termLog([`tracert ${src.name} ${target}`], 'cmd');
    termLog(res.hops.length ? res.hops.map((h, i) => `  ${i + 1}  ${h.node.name}  (${h.ip})`) : []);
    termLog(res.log);
    highlightPath(res.hops);
    return res;
  }

  function physicalPath(aId, bId) {
    // BFS sobre el grafo físico para resaltar también los switches del camino
    const adj = Sim.adjacency(App.state);
    const prev = new Map();
    const seen = new Set([aId]);
    const q = [aId];
    while (q.length) {
      const cur = q.shift();
      if (cur === bId) break;
      (adj.get(cur) || []).forEach(c => {
        if (!seen.has(c.other)) { seen.add(c.other); prev.set(c.other, { from: cur, linkId: c.linkId }); q.push(c.other); }
      });
    }
    const links = [], nodes = [bId];
    let cur = bId;
    while (prev.has(cur)) {
      const p = prev.get(cur);
      links.push(p.linkId);
      nodes.push(p.from);
      cur = p.from;
    }
    return { nodes, links };
  }

  function highlightPath(hops) {
    $$('.node').forEach(g => g.classList.remove('on-path'));
    $$('.link-group').forEach(g => g.classList.remove('on-path'));
    if (!hops || hops.length < 2) return;
    const nodeIds = new Set(), linkIds = new Set();
    hops.forEach(h => nodeIds.add(h.node.id));
    for (let i = 0; i < hops.length - 1; i++) {
      const p = physicalPath(hops[i].node.id, hops[i + 1].node.id);
      p.nodes.forEach(n => nodeIds.add(n));
      p.links.forEach(l => linkIds.add(l));
    }
    nodeIds.forEach(id => { const g = $(`.node[data-id="${id}"]`); if (g) g.classList.add('on-path'); });
    linkIds.forEach(id => { const g = $(`.link-group[data-id="${id}"]`); if (g) g.classList.add('on-path'); });
    clearTimeout(highlightPath._t);
    highlightPath._t = setTimeout(() => {
      $$('.node.on-path').forEach(g => g.classList.remove('on-path'));
      $$('.link-group.on-path').forEach(g => g.classList.remove('on-path'));
    }, 9000);
  }

  /* ------------------------------------------------------------
     TERMINAL
  ------------------------------------------------------------ */
  function termLog(lines, cls) {
    const out = $('#termOut');
    lines.forEach(l => {
      const span = document.createElement('span');
      span.className = 'ln ' + (cls || (l[0] === '✓' ? 'ok' : l[0] === '✗' ? 'err' : l[0] === '⚠' ? 'warn' : l[0] === 'ℹ' ? 'info' : ''));
      span.innerHTML = l;
      out.appendChild(span);
    });
    out.scrollTop = out.scrollHeight;
  }

  function termOpen(open) {
    $('#terminal').classList.toggle('open', open !== false);
    if (open !== false) setTimeout(() => $('#termInput').focus(), 120);
  }

  const HELP = `Comandos disponibles:
  <span class="info">help</span>                        esta ayuda
  <span class="info">devices</span>                     lista de equipos
  <span class="info">show topology</span>               resumen de la topología
  <span class="info">show ip route &lt;equipo&gt;</span>      tabla de enrutamiento
  <span class="info">show interfaces &lt;equipo&gt;</span>    interfaces e IPs
  <span class="info">ping &lt;equipo&gt; &lt;ip|equipo&gt;</span>  ping simulado
  <span class="info">tracert &lt;equipo&gt; &lt;ip|equipo&gt;</span> traza de ruta
  <span class="info">dhcp renew [equipo]</span>         renovar IP por DHCP
  <span class="info">ipconfig &lt;equipo&gt;</span>             IP, MAC y estado DHCP
  <span class="info">http &lt;equipo&gt; &lt;sitio&gt;</span>       abrir sitio web
  <span class="info">mail</span> / <span class="info">services</span>             buzones y servicios activos
  <span class="info">check</span>                       validación de la red
  <span class="info">clear</span>                       limpiar consola`;

  function runCommand(raw) {
    const line = raw.trim();
    if (!line) return;
    termLog([`<span class="dim">netlab&gt;</span> ${esc(line)}`]);
    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    const resolve = (tok) => {
      const n = Model.byName(App.state, tok);
      if (n) { const i = n.ifaces.find(x => IP.isValidIp(x.ip)); return { node: n, ip: i ? i.ip : null }; }
      if (IP.isValidIp(tok)) return { node: null, ip: tok };
      return null;
    };

    if (cmd === 'help' || cmd === '?') return termLog([HELP]);
    if (cmd === 'clear') { $('#termOut').innerHTML = ''; return; }

    if (cmd === 'devices') {
      if (!App.state.nodes.length) return termLog(['No hay equipos.']);
      return termLog(App.state.nodes.map(n => `  ${n.name.padEnd(8)} ${Model.TYPES[n.type].label.padEnd(10)} ${n.ifaces.map(i => i.ip ? i.ip + '/' + i.prefix : '—').join(', ') || n.ports.length + ' puertos'}`));
    }

    if (cmd === 'show') {
      const sub = (parts[1] || '').toLowerCase();
      if (sub === 'topology') {
        const st = Model.stats(App.state);
        return termLog([
          `  Equipos: ${st.totalNodes} · Enlaces: ${st.totalLinks} · Redes: ${st.networks.size}`,
          ...Object.entries(st.counts).map(([k, v]) => `   - ${Model.TYPES[k].label}: ${v}`),
          ...(st.networks.size ? ['  Redes configuradas:', ...[...st.networks.keys()].map(k => `   - ${k} (${st.networks.get(k).length} interfaz/es)`)] : [])
        ]);
      }
      if (sub === 'ip' && (parts[2] || '').toLowerCase() === 'route') {
        const n = Model.byName(App.state, parts[3]);
        if (!n) return termLog(['<span class="err">Uso: show ip route &lt;equipo&gt;</span>']);
        const rows = Sim.routingTable(n);
        if (!rows.length) return termLog([`${n.name}: tabla vacía.`]);
        return termLog([`Tabla de ${n.name}:`].concat(rows.map(r => `  ${r.code}  ${r.network.padEnd(20)} ${String(r.iface).padEnd(8)} ${r.nextHop !== '—' ? 'via ' + r.nextHop : ''}`)));
      }
      if (sub === 'interfaces') {
        const n = Model.byName(App.state, parts[2]) || Model.getNode(App.state, $('#routeDevice').value);
        if (!n) return termLog(['<span class="err">Uso: show interfaces &lt;equipo&gt;</span>']);
        if (Model.isL2(n)) return termLog([`${n.name}: ${n.ports.length} puertos (${Model.usedPorts(App.state, n.id).size} ocupados)`]);
        return termLog(n.ifaces.map(i => `  ${i.name.padEnd(7)} ${(i.ip ? i.ip + '/' + i.prefix : 'unassigned').padEnd(20)} ${i.gateway ? 'gw ' + i.gateway : ''}`));
      }
      return termLog(['<span class="err">Subcomando no reconocido. Prueba: show topology | show ip route &lt;eq&gt; | show interfaces &lt;eq&gt;</span>']);
    }

    if (cmd === 'ping' || cmd === 'tracert' || cmd === 'traceroute') {
      const src = Model.byName(App.state, parts[1]);
      if (!src) return termLog(['<span class="err">Indica el equipo origen: ping PC1 192.168.1.20</span>']);
      const r = resolve(parts[2] || '');
      if (!r || !r.ip) return termLog(['<span class="err">Indica un destino válido (IP o nombre de equipo)</span>']);
      const res = cmd === 'ping' ? Sim.ping(App.state, src.id, r.ip) : Sim.trace(App.state, src.id, r.ip);
      if (cmd !== 'ping') termLog(res.hops.map((h, i) => `  ${i + 1}  ${h.node.name} (${h.ip})`));
      termLog(res.log);
      highlightPath(res.hops);
      return;
    }

    if (cmd === 'dhcp') {
      const sub = (parts[1] || '').toLowerCase();
      if (sub === 'renew' || sub === 'all') {
        const target = parts[2] ? Model.byName(App.state, parts[2]) : null;
        if (target) {
          const r = Services.renew(App.state, target);
          renderAll(); refreshPanels(); autosave();
          return termLog(r.log);
        }
        const r = Services.renewAll(App.state);
        renderAll(); refreshPanels(); autosave();
        return termLog(r.log);
      }
      return termLog(['<span class="err">Uso: dhcp renew [equipo]</span>']);
    }

    if (cmd === 'ipconfig') {
      const n = Model.byName(App.state, parts[1]) || Model.getNode(App.state, $('#routeDevice').value);
      if (!n) return termLog(['<span class="err">Uso: ipconfig &lt;equipo&gt;</span>']);
      if (Model.isL2(n)) return termLog([`${n.name}: ${n.ports.length} puertos (dispositivo de capa 2, sin IP necesaria)`]);
      return termLog(n.ifaces.map(i => {
        const st = i.dhcp ? (i.lease ? 'DHCP · ' + i.lease.type + ' · ' + i.lease.minutes + ' min' : 'DHCP · sin concesión') : 'estática';
        return `  ${i.name.padEnd(6)} ${(i.ip ? i.ip + '/' + i.prefix : 'sin IP').padEnd(20)} gw ${(i.gateway || '—').padEnd(15)} ${st}${i.dns && i.dns.length ? ' · dns ' + i.dns.join(',') : ''}`;
      }).concat([`  MAC ${n.mac || '—'}`]));
    }

    if (cmd === 'http' || cmd === 'curl') {
      const n = Model.byName(App.state, parts[1]);
      if (!n) return termLog(['<span class="err">Uso: http &lt;equipo&gt; &lt;sitio|ip&gt;</span>']);
      const r = Services.httpGet(App.state, n, parts[2] || '');
      renderAll(); autosave();
      return termLog(r.log.concat(r.ok ? ['', `  ${(r.site.body || '').replace(/<[^>]+>/g, ' ').trim()}`] : []));
    }

    if (cmd === 'mail' || cmd === 'correo') {
      const servers = Services.mailServers(App.state);
      if (!servers.length) return termLog(['No hay servidores de correo activos.']);
      return termLog(servers.flatMap(sv => [
        `${sv.name} · dominio ${sv.services.mail.domain} · POP3/${sv.services.mail.pop3} SMTP/${sv.services.mail.smtp}`,
        ...(sv.services.mail.users || []).map(u => `   ${u.user}@${sv.services.mail.domain}  (${(u.box || []).length} mensajes)`)
      ]));
    }

    if (cmd === 'services') {
      const servers = App.state.nodes.filter(n => n.type === 'server' && n.services);
      if (!servers.length) return termLog(['No hay servidores en la topología.']);
      return termLog(servers.flatMap(sv => [
        `${sv.name}:`,
        `   DHCP ${sv.services.dhcp.enabled ? 'activo (' + (sv.services.dhcp.pools || []).length + ' ámbitos)' : 'inactivo'}`,
        `   HTTP ${sv.services.web.enabled ? 'activo (' + (sv.services.web.sites || []).length + ' sitios)' : 'inactivo'}`,
        `   POP3 ${sv.services.mail.enabled ? 'activo (' + (sv.services.mail.users || []).length + ' buzones)' : 'inactivo'}`
      ]));
    }

    if (cmd === 'check') {
      const d = Sim.diagnose(App.state);
      if (!d.issues.length) return termLog(['<span class="ok">✓ Sin problemas detectados.</span>']);
      return termLog(d.issues.map(i => `  ${i.level === 'error' ? '<span class="err">✗</span>' : i.level === 'warn' ? '<span class="warn">!</span>' : '<span class="info">i</span>'} ${esc(i.title)}`));
    }

    termLog(['<span class="err">Comando no reconocido. Escribe <b>help</b>.</span>']);
  }

  function bindTerminal() {
    $('#termInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') { runCommand(e.target.value); e.target.value = ''; }
      if (e.key === 'ArrowUp') { e.target.value = lastCmd || ''; }
    });
    let lastCmd = '';
    $('#termInput').addEventListener('change', e => { lastCmd = e.target.value; });
    $('#termClose').onclick = () => termOpen(false);
    $('#btnConsole').onclick = () => {
      const open = !$('#terminal').classList.contains('open');
      termOpen(open);
      if (open && !$('#termOut').children.length) {
        termLog(['<span class="info">NetLab Studio · consola de simulación</span>',
          'Escribe <b>help</b> y pulsa Enter. Ejemplo: <b>ping PC1 192.168.2.10</b>']);
      }
    };
  }

  /* ------------------------------------------------------------
     DEMO
  ------------------------------------------------------------ */
  function loadDemo() {
    if (App.state.nodes.length && !confirm('Se reemplazará la topología actual. ¿Continuar?')) return;
    const demo = Activities.byId('rutas-estaticas').solution();
    demo.name = 'Demostración · enrutamiento entre LANs';
    App.state = demo;
    App.activity = null;
    App.sel.nodes.clear(); App.sel.links.clear();
    gotoWorkspace();
    toast('Topología de demostración cargada · prueba <b>ping PC1 192.168.2.10</b> en la consola', 'ok');
  }

  /* ------------------------------------------------------------
     inicio / nuevos
  ------------------------------------------------------------ */
  function newTopology(keepActivity) {
    if (App.state.nodes.length && !confirm('¿Vaciar el lienzo y empezar una topología nueva?')) return;
    App.state = Model.newState('Topología sin título');
    if (!keepActivity) App.activity = null;
    App.sel.nodes.clear(); App.sel.links.clear();
    App.history = []; App.future = [];
    $('#projectName').value = App.state.name;
    showRibbon(); buildActTab();
    gotoWorkspace();
    autosave();
  }

  function loadIntoView() {
    $('#projectName').value = App.state.name || 'Topología sin título';
    App.sel.nodes.clear(); App.sel.links.clear();
    renderAll(); renderInspector(); refreshPanels(); buildActTab(); showRibbon();
    requestAnimationFrame(() => fitView());
    autosave();
  }

  function importFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const res = Model.deserialize(reader.result);
      if (!res.state) return toast(res.error || 'Archivo no válido', 'err');
      App.state = res.state;
      App.activity = res.state.activityId ? Activities.byId(res.state.activityId) : null;
      closeModal();
      gotoWorkspace();
      loadIntoView();
      toast('Topología importada', 'ok');
    };
    reader.readAsText(file);
  }

  /* ------------------------------------------------------------
     arranque
  ------------------------------------------------------------ */
  function init() {
    renderPalette();
    renderTemplates();
    bindCanvas();
    bindSubnets();
    bindRoutes();
    bindTerminal();

    // inicio
    $('#choiceCreate').onclick = () => { App.state = Model.newState('Topología sin título'); App.activity = null; gotoWorkspace(); };
    $('#choiceActivities').onclick = () => { renderActivityGrid(); showScreen('activitiesScreen'); };
    $('#backToStart').onclick = () => showScreen('startScreen');
    $('#startOpen').onclick = openProjectsDialog;
    $('#startImport').onclick = () => $('#fileImportStart').click();
    $('#startHelp').onclick = showHelp;

    // topbar
    $('#btnNew').onclick = () => newTopology();
    $('#btnSave').onclick = saveProject;
    $('#btnOpen').onclick = openProjectsDialog;
    $('#btnExport').onclick = () => {
      const name = (App.state.name || 'topologia').replace(/[^\w\-]+/g, '_');
      download(name + '.json', snapshot());
      toast('JSON exportado', 'ok');
    };
    $('#btnImport').onclick = () => $('#fileImport').click();
    $('#fileImport').onchange = e => { if (e.target.files[0]) importFile(e.target.files[0]); };
    $('#fileImportStart').onchange = e => { if (e.target.files[0]) importFile(e.target.files[0]); };
    $('#btnHome').onclick = () => { showScreen('startScreen'); renderActivityGrid(); };
    $('#btnPing').onclick = () => openPingDialog(null, 'ping');
    $('#btnTrace').onclick = () => openPingDialog(null, 'trace');
    $('#btnValidate').onclick = () => { switchTab('diag'); openPanels(); };
    $('#btnServices').onclick = () => { switchTab('services'); openPanels(); };
    $('#btnRenewAll').onclick = () => renewAllDhcp(false);
    $('#btnLeases').onclick = showLeasesModal;
    $('#projectName').onchange = () => {
      App.state.name = $('#projectName').value.trim() || 'Topología sin título';
      autosave();
    };

    // tabs laterales
    $$('#leftTabs button').forEach(b => b.onclick = () => switchTab(b.dataset.tab));

    // actividad
    $('#btnCheck').onclick = () => runActivityCheck(true);
    $('#btnBriefing').onclick = openBriefing;

    // acciones rápidas del lienzo vacío
    $$('#canvasEmpty [data-quick]').forEach(b => b.onclick = () => {
      const q = b.dataset.quick;
      if (TEMPLATES[q]) applyTemplate(q);
      else addNodeAt(q, null);
    });

    // demo
    $('#btnDemo').onclick = loadDemo;

    // modal
    $('#modalClose').onclick = closeModal;
    $('#modalBack').addEventListener('click', e => { if (e.target.id === 'modalBack') closeModal(); });

    // teclado
    document.addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (e.key === 'Escape') { closeModal(); hideCtx(); if (App.drag) { App.drag = null; renderAll(); } }
      if (typing) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelection(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if (e.key === 'f') fitView();
    });
    document.addEventListener('click', e => { if (!e.target.closest('#ctxMenu')) hideCtx(); });

    // ¿sesión anterior?
    try {
      const last = JSON.parse(localStorage.getItem(LS_CURRENT) || 'null');
      if (last && last.data && (last.data.nodes || []).length) {
        const btn = document.createElement('button');
        btn.className = 'btn primary';
        btn.innerHTML = '↻ Continuar sesión anterior';
        btn.onclick = () => {
          const res = Model.deserialize(last.data);
          if (!res.state) return toast('Sesión dañada', 'err');
          App.state = res.state;
          App.activity = last.activityId ? Activities.byId(last.activityId) : null;
          gotoWorkspace();
          if (App.activity) { showRibbon(); buildActTab(); }
        };
        $('.start-foot').prepend(btn);
      }
    } catch (e) {}

    renderSubnetInfo();
  }

  function openPanels() {
    // en pantallas estrechas permite cerrar paneles; aquí solo aseguramos visibilidad
    $('#wsBody').classList.remove('no-left');
  }

  function showHelp() {
    openModal({
      title: 'Guía rápida de NetLab Studio',
      wide: true,
      body: `<div class="briefing">
        <h4>1 · Crear la topología</h4>
        <ul>
          <li>Arrastra un equipo desde la barra izquierda al lienzo (o haz clic en la tarjeta).</li>
          <li>Pasa el ratón por el equipo: aparecen los <b>puertos</b> ⚪ en la base. Arrastra de un puerto a otro equipo para crear el cable.</li>
          <li>Botón derecho sobre un equipo: renombrar, duplicar, eliminar, ping.</li>
          <li>Rueda del ratón = zoom · arrastrar el fondo = mover el lienzo.</li>
        </ul>
        <h4>2 · Direccionar</h4>
        <ul>
          <li>Haz clic en un equipo y rellena IP, máscara y puerta de enlace en el panel derecho.</li>
          <li>Usa la pestaña <b>Subredes</b> para calcular red, broadcast, rango y VLSM.</li>
          <li>En los routers añade <b>rutas estáticas</b> desde el inspector o la pestaña <b>Rutas</b>.</li>
        </ul>
        <h4>3 · Comprobar</h4>
        <ul>
          <li><b>Ping</b> y <b>Traceroute</b> simulan el recorrido real: consultan la tabla de rutas, resuelven ARP en cada segmento y verifican la <b>ruta de vuelta</b>.</li>
          <li><b>Validar</b> detecta IPs duplicadas, direcciones de red/broadcast mal usadas, gateways inalcanzables y rutas inválidas.</li>
          <li>La <b>consola</b> acepta comandos: <code>ping PC1 192.168.2.10</code>, <code>show ip route R1</code>, <code>help</code>.</li>
        </ul>
        <h4>4 · Servicios de red</h4>
        <ul>
          <li>Un <b>servidor</b> puede ser DHCP, Web y servidor de correo a la vez: activa cada rol en el panel derecho (pestañas DHCP / Web / Correo).</li>
          <li><b>DHCP técnico</b>: ámbito (red/máscara), rango dinámico, exclusiones, reservas por MAC, puerta de enlace, DNS, dominio y tiempo de concesión.</li>
          <li>Los <b>clientes</b> se ponen en modo DHCP por interfaz y con <b>Renovar DHCP</b> ejecutan el proceso DORA completo.</li>
          <li>El <b>navegador</b> y el <b>cliente de correo</b> de un PC comprueban primero la conectividad IP y después abren la conexión TCP simulada.</li>
          <li>Pestaña <b>Servicios</b>: estado de cada servidor, clientes DHCP y concesiones activas.</li>
        </ul>
        <h4>Atajos</h4>
        <ul>
          <li><code>Supr</code> borra lo seleccionado · <code>Ctrl+Z</code> deshacer · <code>Ctrl+S</code> guardar · <code>F</code> ajustar vista</li>
        </ul>
      </div>`,
      buttons: [{ label: 'Empezar', cls: 'primary' }]
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  window.NetLabApp = App;
})();
