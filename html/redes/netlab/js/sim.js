/* ============================================================
   NetLab Studio · Motor de simulación (L2/L3)
   Ping y traceroute "reales": consulta de tabla de rutas,
   resolución ARP por segmento, rutas de ida y vuelta.
   ============================================================ */
(function (root) {
  'use strict';

  const IP = (typeof IPCalc !== 'undefined') ? IPCalc : require('./ipcalc.js');
  const M = (typeof Model !== 'undefined') ? Model : require('./model.js');

  /* ================= topología ================= */

  function adjacency(state) {
    const map = new Map();
    state.nodes.forEach(n => map.set(n.id, []));
    state.links.forEach(l => {
      if (!map.has(l.a.node) || !map.has(l.b.node)) return;
      map.get(l.a.node).push({ port: l.a.port, other: l.b.node, otherPort: l.b.port, linkId: l.id });
      map.get(l.b.node).push({ port: l.b.port, other: l.a.node, otherPort: l.a.port, linkId: l.id });
    });
    return map;
  }

  /**
   * Equipos finales alcanzables por un puerto (atravesando switches/hubs/nubes = dominios L2).
   */
  function l2Targets(state, nodeId, port, adj) {
    adj = adj || adjacency(state);
    const results = [];
    const seen = new Set();
    const stack = [{ node: nodeId, port: port }];

    while (stack.length) {
      const cur = stack.pop();
      const key = cur.node + '|' + cur.port;
      if (seen.has(key)) continue;
      seen.add(key);

      const conns = adj.get(cur.node) || [];
      const link = conns.find(c => c.port === cur.port);
      if (!link) continue;

      const otherNode = M.getNode(state, link.other);
      if (!otherNode) continue;

      if (M.isL2(otherNode)) {
        if (seen.has(link.other + '|' + link.otherPort)) continue;
        (otherNode.ports || []).forEach(p => {
          if (p !== link.otherPort) stack.push({ node: otherNode.id, port: p });
        });
      } else {
        results.push({ node: otherNode, port: link.otherPort });
      }
    }
    return results;
  }

  function findIpOwner(state, ipStr) {
    const target = (ipStr || '').trim();
    if (!IP.isValidIp(target)) return null;
    for (const n of state.nodes) {
      for (const i of n.ifaces) {
        if (i.up !== false && i.ip === target) return { node: n, iface: i };
      }
    }
    return null;
  }

  function allIps(state) {
    const out = [];
    state.nodes.forEach(n => n.ifaces.forEach(i => {
      if (IP.isValidIp(i.ip)) out.push({ node: n, iface: i, ip: i.ip, prefix: IP.clampPrefix(i.prefix) });
    }));
    return out;
  }

  /* ================= tabla de rutas ================= */

  /**
   * Consulta de ruta: devuelve la mejor ruta del equipo hacia dstIp.
   * Orden: rutas conectadas -> rutas estáticas (mayor prefijo) -> puerta de enlace por defecto.
   */
  function routeLookup(dev, dstIp) {
    const dst = IP.ipToInt(dstIp);
    if (dst === null) return { error: 'IP destino no válida' };

    let best = null;
    const candidates = [];

    // 1) redes directamente conectadas
    (dev.ifaces || []).forEach(i => {
      if (!i.ip || i.up === false) return;
      const prefix = IP.clampPrefix(i.prefix);
      if (IP.ipInSubnet(dstIp, i.ip, prefix)) {
        candidates.push({ type: 'connected', prefix, iface: i.name, port: i.name, nextHop: null, label: 'Conectada directamente' });
      }
    });

    // 2) rutas estáticas
    (dev.routes || []).forEach(r => {
      const c = IP.parseCidr(r.dest);
      if (!c) return;
      if (IP.ipInSubnet(dstIp, IP.intToIp(c.ip), c.prefix)) {
        let port = r.iface || '';
        if (!port && r.nextHop) {
          // deducir interfaz de salida por la red del next hop
          const iface = (dev.ifaces || []).find(i => i.ip && IP.ipInSubnet(r.nextHop, i.ip, IP.clampPrefix(i.prefix)));
          port = iface ? iface.name : '';
        }
        candidates.push({
          type: 'static', prefix: c.prefix, iface: port, port,
          nextHop: r.nextHop, metric: Number(r.metric) || 1,
          label: r.nextHop ? 'Estática' : 'Estática (interfaz de salida)'
        });
      }
    });

    if (!candidates.length) {
      // 3) puerta de enlace por defecto de un host
      const withGw = (dev.ifaces || []).find(i => i.gateway && IP.isValidIp(i.gateway));
      if (withGw) {
        candidates.push({
          type: 'default', prefix: 0, iface: withGw.name, port: withGw.name,
          nextHop: withGw.gateway, label: 'Por defecto (gateway del host)'
        });
      }
    }

    if (!candidates.length) return null;

    candidates.sort((a, b) => {
      if (b.prefix !== a.prefix) return b.prefix - a.prefix;
      if (a.type === 'connected' && b.type !== 'connected') return -1;
      if (b.type === 'connected' && a.type !== 'connected') return 1;
      return (a.metric || 1) - (b.metric || 1);
    });
    return candidates[0];
  }

  function routingTable(dev) {
    const rows = [];
    (dev.ifaces || []).forEach(i => {
      if (!i.ip || i.up === false) return;
      const net = IP.networkInt(i.ip, i.prefix);
      rows.push({
        code: 'C', type: 'Conectada', network: IP.intToIp(net) + '/' + IP.clampPrefix(i.prefix),
        iface: i.name, nextHop: '—', metric: 0, source: i.ip + '/' + IP.clampPrefix(i.prefix)
      });
    });
    (dev.routes || []).forEach((r, idx) => {
      const c = IP.parseCidr(r.dest);
      rows.push({
        code: 'S', type: 'Estática', idx,
        network: c ? IP.intToIp(c.ip) + '/' + c.prefix : (r.dest || '?'),
        iface: r.iface || '—', nextHop: r.nextHop || '—',
        metric: Number(r.metric) || 1, valid: !!c
      });
    });
    return rows;
  }

  function selectGateway(dev) {
    const i = (dev.ifaces || []).find(x => x.gateway && IP.isValidIp(x.gateway));
    return i ? { iface: i, gateway: i.gateway } : null;
  }

  /* ---------- NAT simplificado (PAT de salida) ---------- */
  function isPrivate(ip) {
    const scope = IP.ipScope(ip);
    return scope.indexOf('Privada') === 0 || scope.indexOf('CGNAT') === 0 || scope.indexOf('Link-local') === 0;
  }
  function isPublic(ip) {
    return IP.ipScope(ip).indexOf('Pública') === 0;
  }

  /* ================= forwarding ================= */

  function pickSourceIface(dev, dstIp) {
    const withIp = (dev.ifaces || []).filter(i => IP.isValidIp(i.ip) && i.up !== false);
    if (!withIp.length) return null;
    const direct = withIp.find(i => IP.ipInSubnet(dstIp, i.ip, i.prefix));
    return direct || withIp[0];
  }

  /**
   * Recorrido de ida: devuelve { ok, hops[], log[], error }
   */
  function trace(state, srcNodeId, dstIp, opts) {
    opts = opts || {};
    const maxHops = opts.maxHops || 20;
    const src = M.getNode(state, srcNodeId);
    if (!src) return { ok: false, hops: [], log: ['Equipo origen no encontrado.'], error: 'origen' };

    const adj = adjacency(state);
    const srcIface = pickSourceIface(src, dstIp);
    if (!srcIface) {
      return { ok: false, hops: [], log: [`${src.name} no tiene ninguna dirección IP configurada.`], error: 'sin-ip' };
    }
    if (!IP.isValidIp(srcIface.ip)) {
      return { ok: false, hops: [], log: [`${src.name} no tiene IP válida en ${srcIface.name}.`], error: 'sin-ip' };
    }
    if (!IP.isValidIp(dstIp)) {
      return { ok: false, hops: [], log: ['La IP destino no es válida.'], error: 'ip' };
    }

    const dstOwner = findIpOwner(state, dstIp);
    if (!dstOwner) {
      return {
        ok: false, hops: [], error: 'sin-destino',
        log: [`✗ La dirección ${dstIp} no está configurada en ningún equipo de la topología.`]
      };
    }

    const log = [];
    const hops = [{ node: src, port: '—', ip: srcIface.ip, kind: 'origin' }];
    let cur = src;
    let guard = 0;
    let natIp = null;               // IP pública que traduce el origen (PAT)
    const originalSrc = srcIface.ip;

    if (src.id === dstOwner.node.id) {
      log.push(`✓ ${src.name} hace ping a su propia dirección ${dstIp} (interfaz local).`);
      return { ok: true, hops, log, dstOwner };
    }

    while (guard++ < maxHops) {
      const route = routeLookup(cur, dstIp);
      if (!route) {
        log.push(`✗ <b>${cur.name}</b> no tiene ruta hacia ${dstIp} → paquete descartado ("Destination host unreachable").`);
        return { ok: false, hops, log, error: 'sin-ruta', dstOwner };
      }
      if (!route.port) {
        log.push(`✗ <b>${cur.name}</b>: la ruta ${route.nextHop ? 'vía ' + route.nextHop : ''} no tiene interfaz de salida válida (next hop fuera de las redes conectadas).`);
        return { ok: false, hops, log, error: 'sin-interfaz', dstOwner };
      }
      if (route.nextHop && !IP.isValidIp(route.nextHop)) {
        log.push(`✗ <b>${cur.name}</b>: next hop "${route.nextHop}" no es una IP válida.`);
        return { ok: false, hops, log, error: 'next-hop', dstOwner };
      }

      const iface = (cur.ifaces || []).find(i => i.name === route.iface);
      if (!iface || !IP.isValidIp(iface.ip)) {
        log.push(`✗ <b>${cur.name}</b>: la interfaz ${route.iface} no tiene IP; no se puede enviar el paquete.`);
        return { ok: false, hops, log, error: 'iface-sin-ip', dstOwner };
      }

      /* --- NAT: origen privado saliendo por una interfaz pública --- */
      const effectiveSrc = natIp || originalSrc;
      if (!natIp && route.type !== 'connected' && IP.isValidIp(iface.ip) &&
          isPrivate(effectiveSrc) && isPublic(iface.ip)) {
        natIp = iface.ip;
        log.push(`ℹ NAT/PAT: <b>${cur.name}</b> traduce el origen privado ${effectiveSrc} → ${natIp} al salir por ${route.port}.`);
      }

      /* --- ruta conectada: el destino debe estar en el segmento --- */
      if (route.type === 'connected') {
        const targets = l2Targets(state, cur.id, route.port, adj);
        const owner = targets.find(t => t.node.id === dstOwner.node.id);
        if (owner) {
          hops.push({ node: dstOwner.node, port: owner.port, ip: dstIp, kind: 'dest' });
          log.push(`✓ ${src.name} → ${dstIp}: red ${IP.cidr(iface.ip, iface.prefix)} conectada a ${cur.name}:${route.port}.`);
          log.push(`✓ ARP resuelto, el paquete llega a <b>${dstOwner.node.name}</b>. Respuesta en ${(hops.length * 0.4 + 0.3).toFixed(1)} ms.`);
          return { ok: true, hops, log, dstOwner, route, natIp, originalSrc };
        }
        // ¿hay alguien distinto con esa IP? (conflicto) o nadie
        const conflict = allIps(state).filter(x => x.ip === dstIp);
        if (conflict.length > 1) {
          log.push(`✗ IP duplicada: ${dstIp} está configurada en ${conflict.map(c => c.node.name).join(' y ')}.`);
        }
        log.push(`✗ <b>${cur.name}</b> envía por ${route.port} hacia ${dstIp}, pero nadie con esa IP está conectado a ese segmento (ARP sin respuesta).`);
        return { ok: false, hops, log, error: 'arp', dstOwner };
      }

      /* --- ruta estática / por defecto: ir al next hop --- */
      const nextHop = route.nextHop;
      const targets = l2Targets(state, cur.id, route.port, adj);
      let targetIface = null;
      let targetNode = null;
      for (const t of targets) {
        const match = (t.node.ifaces || []).find(i => i.ip === nextHop && i.up !== false);
        if (match) { targetNode = t.node; targetIface = match; break; }
      }
      if (!targetNode) {
        log.push(`✗ <b>${cur.name}</b>: el next hop ${nextHop} no responde en el segmento de ${route.port} (ARP sin respuesta). Revisa la IP del vecino o el enlace.`);
        return { ok: false, hops, log, error: 'next-hop-arp', dstOwner };
      }

      if (targetNode.id === dstOwner.node.id) {
        hops.push({ node: targetNode, port: '', ip: nextHop, kind: 'dest' });
        log.push(`✓ ${src.name} → ${dstIp} a través de ${cur.name} (${route.label}) → <b>${targetNode.name}</b>.`);
        return { ok: true, hops, log, dstOwner, route, natIp, originalSrc };
      }

      hops.push({ node: targetNode, port: '', ip: nextHop, kind: 'hop' });
      cur = targetNode;
    }

    log.push('✗ Se ha superado el límite de saltos (posible bucle de enrutamiento).');
    return { ok: false, hops, log, error: 'loop', dstOwner, natIp, originalSrc };
  }

  /**
   * Ping completo: ida + vuelta.
   */
  function ping(state, srcNodeId, dstIp) {
    const src = M.getNode(state, srcNodeId);
    const out = { ok: false, forward: null, back: null, log: [], hops: [], dstOwner: null };
    if (!src) { out.log.push('Equipo origen no válido.'); return out; }

    const fwd = trace(state, srcNodeId, dstIp);
    out.forward = fwd;
    out.hops = fwd.hops;
    out.dstOwner = fwd.dstOwner || null;
    out.log.push(...fwd.log);

    if (!fwd.ok) return out;

    const dst = fwd.dstOwner.node;
    const srcIface = pickSourceIface(src, dstIp);
    const srcIp = fwd.natIp || (srcIface ? srcIface.ip : '');
    const back = trace(state, dst.id, srcIp);
    out.back = back;
    if (!back.ok) {
      out.log.push(`⚠ Ida correcta, pero la <b>ruta de vuelta</b> falla (${dst.name} → ${srcIp}):`);
      out.log.push(...back.log.map(l => '   ' + l));
      out.log.push('→ El ping NO se completa: falta la ruta de retorno o el gateway del destino.');
      return out;
    }

    out.ok = true;
    if (fwd.natIp) out.log.push(`ℹ La respuesta viaja hacia la IP traducida ${fwd.natIp} y el router la devuelve al origen ${fwd.originalSrc}.`);
    out.log.push(`✓ <b>${src.name} → ${dstIp}</b>: ping correcto (ida y vuelta, ${fwd.hops.length + back.hops.length - 2} salto(s)).`);
    return out;
  }

  function traceroute(state, srcNodeId, dstIp) {
    const res = trace(state, srcNodeId, dstIp);
    return res;
  }

  /* ================= diagnóstico ================= */

  function diagnose(state) {
    const issues = [];
    const ips = allIps(state);
    const byIp = new Map();

    ips.forEach(e => {
      if (!byIp.has(e.ip)) byIp.set(e.ip, []);
      byIp.get(e.ip).push(e);
    });

    // IP duplicadas
    byIp.forEach((list, ip) => {
      if (list.length > 1) {
        issues.push({
          level: 'error', title: `IP duplicada: ${ip}`,
          detail: `Asignada en ${list.map(l => `${l.node.name}:${l.iface.name}`).join(' · ')}`,
          nodes: list.map(l => l.node.id)
        });
      }
    });

    // direcciones de red / broadcast asignadas a interfaces
    ips.forEach(e => {
      const info = IP.netInfo(e.ip, e.prefix);
      if (!info) return;
      if (info.isNetworkAddr && info.prefix <= 30) {
        issues.push({ level: 'error', title: `${e.node.name} usa la dirección de red ${e.ip}/${e.prefix}`, detail: 'No se puede asignar la dirección de red a una interfaz. Usa la primera dirección útil: ' + info.firstHost, nodes: [e.node.id] });
      } else if (info.isBroadcast && info.prefix <= 30) {
        issues.push({ level: 'error', title: `${e.node.name} usa la dirección de broadcast ${e.ip}/${e.prefix}`, detail: 'Reserva la última dirección del rango para broadcast. Rango útil: ' + info.firstHost + ' – ' + info.lastHost, nodes: [e.node.id] });
      }
    });

    // hosts sin IP o sin gateway
    state.nodes.forEach(n => {
      if (M.isL2(n)) return;
      const withIp = n.ifaces.filter(i => IP.isValidIp(i.ip));
      const isRouter = n.type === 'router' || n.type === 'firewall';
      if (!withIp.length) {
        issues.push({ level: 'warn', title: `${n.name} no tiene direcciones IP`, detail: 'Todo equipo L3 necesita al menos una IP configurada.', nodes: [n.id] });
      }
      if (!isRouter) {
        n.ifaces.forEach(i => {
          if (IP.isValidIp(i.ip) && !i.gateway) {
            issues.push({ level: 'info', title: `${n.name}:${i.name} sin puerta de enlace`, detail: 'Solo es necesario si el equipo debe comunicarse fuera de su subred.', nodes: [n.id] });
          }
          if (IP.isValidIp(i.ip) && i.gateway && !IP.ipInSubnet(i.gateway, i.ip, i.prefix)) {
            issues.push({ level: 'error', title: `${n.name}: gateway ${i.gateway} fuera de la subred`, detail: `La puerta de enlace debe pertenecer a ${IP.cidr(i.ip, i.prefix)}.`, nodes: [n.id] });
          }
        });
      }
    });

    // equipos aislados
    const connected = new Set();
    state.links.forEach(l => { connected.add(l.a.node); connected.add(l.b.node); });
    state.nodes.forEach(n => {
      if (!connected.has(n.id)) {
        issues.push({ level: 'warn', title: `${n.name} sin enlaces`, detail: 'El equipo no está conectado a ningún otro.', nodes: [n.id] });
      }
    });

    // gateways inexistentes en el segmento
    state.nodes.forEach(n => {
      n.ifaces.forEach(i => {
        if (!i.gateway || !IP.isValidIp(i.ip)) return;
        const res = trace(state, n.id, i.gateway === i.ip ? i.ip : i.gateway);
        if (!IP.isValidIp(i.gateway)) return;
        const owner = findIpOwner(state, i.gateway);
        if (!owner) {
          issues.push({ level: 'error', title: `${n.name}: el gateway ${i.gateway} no existe`, detail: 'Ningún equipo tiene esa IP en la topología.', nodes: [n.id] });
        } else {
          const route = routeLookup(n, i.gateway);
          if (route && route.type === 'connected') {
            const targets = l2Targets(state, n.id, i.iface ? i.name : route.port);
            if (!targets.some(t => t.node.id === owner.node.id)) {
              issues.push({ level: 'error', title: `${n.name}: el gateway ${i.gateway} no está en su segmento`, detail: `${i.gateway} pertenece a ${owner.node.name}, pero no es alcanzable desde ${n.name}:${i.name}.`, nodes: [n.id, owner.node.id] });
            }
          }
        }
      });
    });

    // rutas estáticas inválidas
    state.nodes.forEach(n => {
      (n.routes || []).forEach((r, idx) => {
        if (!IP.parseCidr(r.dest)) {
          issues.push({ level: 'error', title: `${n.name}: ruta ${idx + 1} con destino inválido`, detail: `"${r.dest}" no es un CIDR válido (ej. 192.168.2.0/24).`, nodes: [n.id] });
        }
        if (r.nextHop && !IP.isValidIp(r.nextHop)) {
          issues.push({ level: 'error', title: `${n.name}: next hop inválido en ruta ${r.dest}`, detail: `"${r.nextHop}" no es una IP válida.`, nodes: [n.id] });
        }
      });
    });

    // suma: subredes solapadas
    const nets = new Map();
    ips.forEach(e => {
      const key = IP.cidr(e.ip, e.prefix);
      if (!nets.has(key)) nets.set(key, []);
      nets.get(key).push(e);
    });

    return {
      issues,
      errors: issues.filter(i => i.level === 'error').length,
      warns: issues.filter(i => i.level === 'warn').length,
      infos: issues.filter(i => i.level === 'info').length
    };
  }

  const Sim = {
    adjacency, l2Targets, findIpOwner, allIps, routeLookup, routingTable,
    selectGateway, pickSourceIface, trace, ping, traceroute, diagnose
  };

  root.Sim = Sim;
  if (typeof module !== 'undefined' && module.exports) module.exports = Sim;
})(typeof globalThis !== 'undefined' ? globalThis : this);
