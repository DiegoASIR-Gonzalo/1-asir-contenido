/* ============================================================
   NetLab Studio · Modelo de datos (equipos, enlaces, rutas)
   ============================================================ */
(function (root) {
  'use strict';

  const VERSION = 1;

  const TYPES = {
    router: {
      label: 'Router', role: 'L3', l2: false, color: '#f59e0b',
      ifaces: ['g0/0', 'g0/1', 'g0/2'], hints: 'Enruta entre redes. Interfaces GigabitEthernet.'
    },
    switch: {
      label: 'Switch', role: 'L2', l2: true, color: '#38bdf8',
      ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5', 'Fa0/6', 'Fa0/7', 'Fa0/8'],
      hints: 'Conmutador: interconecta equipos en la misma red.'
    },
    hub: {
      label: 'Hub', role: 'L2', l2: true, color: '#94a3b8',
      ports: ['1', '2', '3', '4'],
      hints: 'Repetidor multipuerto: un solo dominio de colisión.'
    },
    pc: {
      label: 'PC', role: 'Host', l2: false, color: '#a3e635',
      ifaces: ['eth0'], hints: 'Puesto de trabajo.'
    },
    laptop: {
      label: 'Portátil', role: 'Host', l2: false, color: '#34d399',
      ifaces: ['wlan0'], hints: 'Equipo portátil.'
    },
    server: {
      label: 'Servidor', role: 'Host', l2: false, color: '#c084fc',
      ifaces: ['eth0'], hints: 'Servidor de servicios de red.'
    },
    firewall: {
      label: 'Firewall', role: 'L3', l2: false, color: '#ef4444',
      ifaces: ['eth0', 'eth1'], hints: 'Cortafuegos / filtrado entre zonas.'
    },
    cloud: {
      label: 'Internet', role: 'L2', l2: true, color: '#60a5fa',
      ports: ['WAN0', 'WAN1', 'WAN2', 'WAN3'],
      hints: 'Nube / red externa: úsala como interconexión.'
    }
  };

  /* ---------- iconos SVG ---------- */
  const ICONS = {
    router: '<circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 20h16M18 16l-3 4 3 4M30 28H14M30 28l3-4-3-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    switch: '<rect x="7" y="15" width="34" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M13 21h16M25 17l4 4-4 4M35 27H19M23 23l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    hub: '<rect x="9" y="17" width="30" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="16" cy="24" r="1.8" fill="currentColor"/><circle cx="23" cy="24" r="1.8" fill="currentColor"/><circle cx="30" cy="24" r="1.8" fill="currentColor"/>',
    pc: '<rect x="8" y="10" width="32" height="22" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M18 38h12M24 32v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M12 15h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/>',
    laptop: '<rect x="9" y="12" width="30" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5 35h38l-3 5H8z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    server: '<rect x="13" y="7" width="22" height="34" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M18 15h12M18 23h12M18 31h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".85"/><circle cx="18" cy="36" r="1.6" fill="currentColor"/>',
    firewall: '<path d="M8 14h32v20H8z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8 22h32M8 30h32M17 14v8M29 14v8M13 22v8M25 22v8M33 22v8" stroke="currentColor" stroke-width="1.8" opacity=".85"/>',
    cloud: '<path d="M15 32a7 7 0 0 1 .6-14 9.5 9.5 0 0 1 17.6 2.4A6.3 6.3 0 0 1 33 32z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>'
  };

  const PREFIXES = ['PC', 'SRV', 'SW', 'R', 'FW', 'AP', 'HUB', 'NET'];

  /* ---------- estado ---------- */
  function newState(name) {
    return {
      version: VERSION,
      name: name || 'Topología sin título',
      nodes: [],
      links: [],
      activityId: null,
      seq: 1
    };
  }

  function uid(state, prefix) {
    state.seq = (state.seq || 1) + 1;
    return (prefix || 'id') + '_' + state.seq.toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  }

  function nextName(state, type) {
    const t = TYPES[type] || TYPES.pc;
    let base;
    if (type === 'pc') base = 'PC';
    else if (type === 'laptop') base = 'LAP';
    else if (type === 'server') base = 'SRV';
    else if (type === 'switch') base = 'SW';
    else if (type === 'router') base = 'R';
    else if (type === 'firewall') base = 'FW';
    else if (type === 'hub') base = 'HUB';
    else if (type === 'cloud') base = 'NET';
    else base = t.label.slice(0, 3).toUpperCase();
    let i = 1;
    const used = new Set(state.nodes.map(n => n.name));
    while (used.has(base + i)) i++;
    return base + i;
  }

  function createNode(state, type, x, y, opts) {
    opts = opts || {};
    const def = TYPES[type];
    if (!def) return null;
    const node = {
      id: uid(state, 'n'),
      type,
      name: opts.name || nextName(state, type),
      x: Math.round(x || 0),
      y: Math.round(y || 0),
      ifaces: [],
      ports: [],
      routes: [],
      notes: ''
    };
    if (def.ifaces) {
      def.ifaces.forEach((name, idx) => {
        node.ifaces.push({
          name,
          ip: (opts.ifaces && opts.ifaces[idx] && opts.ifaces[idx].ip) || '',
          prefix: (opts.ifaces && opts.ifaces[idx] && opts.ifaces[idx].prefix) || 24,
          gateway: (opts.ifaces && opts.ifaces[idx] && opts.ifaces[idx].gateway) || '',
          up: true
        });
      });
      node.ports = def.ifaces.slice();
    } else {
      node.ports = (def.ports || []).slice();
    }
    if (opts.routes) node.routes = opts.routes.map(r => Object.assign({}, r));
    state.nodes.push(node);
    return node;
  }

  function getNode(state, id) { return state.nodes.find(n => n.id === id) || null; }
  function byName(state, name) {
    if (!name) return null;
    const q = String(name).trim().toLowerCase();
    return state.nodes.find(n => n.name.toLowerCase() === q) || null;
  }

  function nodePorts(node) {
    const def = TYPES[node.type];
    if (def && def.l2) return node.ports.length ? node.ports : (def.ports || []).slice();
    return node.ifaces.map(i => i.name);
  }

  function usedPorts(state, nodeId) {
    const set = new Set();
    state.links.forEach(l => {
      if (l.a.node === nodeId) set.add(l.a.port);
      if (l.b.node === nodeId) set.add(l.b.port);
    });
    return set;
  }

  function freePort(state, node) {
    const used = usedPorts(state, node.id);
    const ports = nodePorts(node);
    return ports.find(p => !used.has(p)) || null;
  }

  function linkExists(state, aId, bId) {
    return state.links.find(l =>
      (l.a.node === aId && l.b.node === bId) || (l.a.node === bId && l.b.node === aId));
  }

  function addLink(state, aId, bId) {
    const a = getNode(state, aId), b = getNode(state, bId);
    if (!a || !b || aId === bId) return { error: 'Enlace no válido.' };
    if (linkExists(state, aId, bId)) return { error: 'Ya existe un enlace entre esos equipos.' };
    const pa = freePort(state, a);
    const pb = freePort(state, b);
    if (!pa) return { error: `${a.name} no tiene puertos libres.` };
    if (!pb) return { error: `${b.name} no tiene puertos libres.` };
    const link = { id: uid(state, 'l'), a: { node: aId, port: pa }, b: { node: bId, port: pb } };
    state.links.push(link);
    return { link };
  }

  function addLinkPorts(state, aId, aPort, bId, bPort) {
    const a = getNode(state, aId), b = getNode(state, bId);
    if (!a || !b) return { error: 'Equipo no encontrado.' };
    const link = { id: uid(state, 'l'), a: { node: aId, port: aPort }, b: { node: bId, port: bPort } };
    state.links.push(link);
    return { link };
  }

  function removeLink(state, linkId) {
    state.links = state.links.filter(l => l.id !== linkId);
  }

  function removeNode(state, nodeId) {
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
    state.links = state.links.filter(l => l.a.node !== nodeId && l.b.node !== nodeId);
  }

  function addIface(state, node, name) {
    if (!node) return null;
    const nm = name || 'g0/' + node.ifaces.length;
    if (node.ifaces.some(i => i.name === nm)) return null;
    const iface = { name: nm, ip: '', prefix: 24, gateway: '', up: true };
    node.ifaces.push(iface);
    node.ports.push(nm);
    return iface;
  }

  function removeIface(state, node, name) {
    const used = usedPorts(state, node.id);
    if (used.has(name)) return { error: 'Ese puerto tiene un enlace conectado.' };
    node.ifaces = node.ifaces.filter(i => i.name !== name);
    node.ports = node.ports.filter(p => p !== name);
    return { ok: true };
  }

  function isL2(node) {
    const def = TYPES[node.type];
    return !!(def && def.l2);
  }

  function isL3(node) {
    const def = TYPES[node.type];
    return !!(def && !def.l2);
  }

  /* ---------- rutas ---------- */
  function addRoute(node, route) {
    node.routes = node.routes || [];
    node.routes.push({
      dest: route.dest || '0.0.0.0/0',
      nextHop: route.nextHop || '',
      iface: route.iface || '',
      metric: Number(route.metric) || 1,
      note: route.note || ''
    });
  }

  function ifaceList(node) {
    return (node.ifaces || []).map(i => i.name);
  }

  /* ---------- serialización ---------- */
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function serialize(state) {
    return JSON.stringify({
      version: VERSION,
      name: state.name,
      nodes: state.nodes,
      links: state.links,
      activityId: state.activityId || null,
      seq: state.seq || 1
    }, null, 2);
  }

  function deserialize(json) {
    let data;
    try { data = typeof json === 'string' ? JSON.parse(json) : json; }
    catch (e) { return { error: 'JSON no válido.' }; }
    if (!data || !Array.isArray(data.nodes)) return { error: 'El archivo no contiene una topología válida.' };
    const state = newState(data.name);
    state.nodes = data.nodes.map(n => ({
      id: n.id,
      type: TYPES[n.type] ? n.type : 'pc',
      name: n.name || 'Equipo',
      x: Number(n.x) || 0,
      y: Number(n.y) || 0,
      ifaces: (n.ifaces || []).map(i => ({
        name: i.name, ip: i.ip || '', prefix: IPCalc.clampPrefix(i.prefix),
        gateway: i.gateway || '', up: i.up !== false
      })),
      ports: Array.isArray(n.ports) ? n.ports : nodePorts(n),
      routes: (n.routes || []).map(r => ({
        dest: r.dest || '', nextHop: r.nextHop || '', iface: r.iface || '',
        metric: Number(r.metric) || 1, note: r.note || ''
      })),
      notes: n.notes || ''
    }));
    state.links = (data.links || []).filter(l => l && l.a && l.b).map(l => ({
      id: l.id, a: { node: l.a.node, port: l.a.port }, b: { node: l.b.node, port: l.b.port }
    }));
    state.activityId = data.activityId || null;
    state.seq = data.seq || (state.nodes.length + state.links.length + 1);
    return { state };
  }

  /* ---------- estadísticas ---------- */
  function stats(state) {
    const counts = {};
    state.nodes.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
    const ips = [];
    state.nodes.forEach(n => n.ifaces.forEach(i => {
      if (i.ip && IPCalc.isValidIp(i.ip)) ips.push({ node: n, iface: i, ip: i.ip, prefix: i.prefix });
    }));
    const networks = new Map();
    ips.forEach(e => {
      const key = IPCalc.cidr(e.ip, e.prefix);
      if (!networks.has(key)) networks.set(key, []);
      networks.get(key).push(e);
    });
    return { counts, ips, networks, totalNodes: state.nodes.length, totalLinks: state.links.length };
  }

  const Model = {
    VERSION, TYPES, ICONS, PREFIXES,
    newState, createNode, getNode, byName, nodePorts, usedPorts, freePort,
    addLink, addLinkPorts, removeLink, removeNode, linkExists,
    addIface, removeIface, ifaceList, addRoute,
    isL2, isL3, uid, nextName, serialize, deserialize, clone, stats
  };

  root.Model = Model;
  if (typeof module !== 'undefined' && module.exports) module.exports = Model;
})(typeof globalThis !== 'undefined' ? globalThis : this);
