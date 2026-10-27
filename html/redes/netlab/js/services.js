/* ============================================================
   NetLab Studio · Servicios de red simulados
   DHCP (DORA, reservas, exclusiones, concesiones), HTTP y correo POP3/SMTP
   ============================================================ */
(function (root) {
  'use strict';

  const IP = (typeof IPCalc !== 'undefined') ? IPCalc : require('./ipcalc.js');
  const M = (typeof Model !== 'undefined') ? Model : require('./model.js');
  const S = (typeof Sim !== 'undefined') ? Sim : require('./sim.js');

  /* =========================================================
     DHCP
     ========================================================= */

  function isHost(node) { return M.isL3(node); }

  /** Puertos/pares L3 del mismo dominio de difusión que la interfaz indicada */
  function segment(state, clientId, ifaceName) {
    const adj = S.adjacency(state);
    const link = state.links.find(l =>
      (l.a.node === clientId && l.a.port === ifaceName) || (l.b.node === clientId && l.b.port === ifaceName));
    if (!link) return { error: 'La interfaz no tiene cable: sin enlace no hay DHCP.' };
    return { targets: S.l2Targets(state, clientId, ifaceName, adj) };
  }

  function serversIn(state, targets) {
    return targets
      .filter(t => t.node.type === 'server' && t.node.services && t.node.services.dhcp && t.node.services.dhcp.enabled)
      .map(t => ({ server: t.node, port: t.port }));
  }

  /** ¿El servidor tiene esa red configurada justo en el puerto que da a este segmento? */
  function ifaceOfPoolOnSegment(server, pool, port) {
    const c = IP.parseCidr(pool.network);
    if (!c) return null;
    return (server.ifaces || []).find(i => {
      if (!IP.isValidIp(i.ip)) return false;
      if (port && i.name !== port) return false;
      return IP.networkInt(i.ip, i.prefix) === c.ip && IP.clampPrefix(i.prefix) === c.prefix;
    }) || null;
  }

  /** Busca ofertas DHCP para un cliente (una por pool válido) */
  function discover(state, client, ifaceName) {
    const out = { offers: [], log: [], error: null };
    const iface = (client.ifaces || []).find(i => i.name === ifaceName);
    if (!iface) { out.error = 'Interfaz inexistente.'; return out; }

    const seg = segment(state, client.id, ifaceName);
    if (seg.error) { out.error = seg.error; out.log.push('✗ ' + seg.error); return out; }

    const srv = serversIn(state, seg.targets);
    if (!srv.length) {
      out.error = 'No hay ningún servidor DHCP activo en este segmento de red.';
      out.log.push('✗ DHCPDISCOVER enviado en broadcast: nadie responde (no hay servidor DHCP en el dominio de difusión).');
      return out;
    }

    out.log.push(`→ DHCPDISCOVER · ${client.name} (${client.mac || '—'}) · broadcast FF:FF:FF:FF:FF:FF`);

    srv.forEach(({ server, port }) => {
      (server.services.dhcp.pools || []).forEach(pool => {
        const ifacePool = ifaceOfPoolOnSegment(server, pool, port);
        if (!ifacePool) return; // pool de otra red: se ignora en este segmento
        const alloc = allocate(state, server, pool, client);
        if (alloc.error) {
          out.log.push(`✗ ${server.name} (pool ${pool.name || '—'}): ${alloc.error}`);
          return;
        }
        out.offers.push({
          serverId: server.id, serverName: server.name, poolId: pool.id, poolName: pool.name || 'pool',
          serverIp: ifacePool.ip, ip: alloc.ip, type: alloc.type,
          prefix: IP.parseCidr(pool.network).prefix,
          gateway: pool.gateway || '', dns: pool.dns || [], domain: pool.domain || '',
          leaseMin: Number(pool.leaseMin) || 1440,
          log: [`← DHCPOFFER · ${server.name} · pool "${pool.name || 'pool'}" · ofrece ${alloc.ip}/${IP.parseCidr(pool.network).prefix} (${alloc.type})`]
        });
      });
    });

    if (!out.offers.length) {
      out.error = 'Hay servidor DHCP, pero ningún pool sirve a la red de esta interfaz.';
      out.log.push('✗ El servidor DHCP no tiene un pool cuya red coincida con la interfaz del servidor en este segmento.');
    }
    return out;
  }

  /** Reserva por MAC → si no, primera IP libre del rango (respetando exclusiones y usadas) */
  function allocate(state, server, pool, client) {
    const c = IP.parseCidr(pool.network);
    if (!c) return { error: 'la red del pool no es un CIDR válido ("' + pool.network + '")' };
    const prefix = c.prefix;

    const mac = String(client.mac || '').toUpperCase();
    const res = (pool.reservations || []).find(r => r.mac && String(r.mac).toUpperCase() === mac && IP.isValidIp(r.ip));
    if (res) {
      if (IP.networkInt(res.ip, prefix) !== c.ip) return { error: `la reserva ${res.ip} no pertenece a la red ${pool.network}` };
      return { ip: res.ip, type: 'reserva por MAC' };
    }

    const start = IP.ipToInt(pool.rangeStart || '');
    const end = IP.ipToInt(pool.rangeEnd || '');
    if (start === null || end === null) return { error: 'el rango (inicio/fin) no es válido' };
    if (end < start) return { error: 'el fin del rango es menor que el inicio' };
    if (IP.networkInt(pool.rangeStart, prefix) !== c.ip || IP.networkInt(pool.rangeEnd, prefix) !== c.ip) {
      return { error: `el rango ${pool.rangeStart}-${pool.rangeEnd} sale de la red ${pool.network}` };
    }

    const used = new Set(S.allIps(state).map(x => x.ip));
    (pool.reservations || []).forEach(r => { if (IP.isValidIp(r.ip)) used.add(r.ip); });
    (pool.excluded || []).forEach(x => { if (IP.isValidIp(x)) used.add(x); });

    for (let v = start; v <= end; v++) {
      const ip = IP.intToIp(v);
      if (used.has(ip)) continue;
      return { ip, type: 'dinámica' };
    }
    return { error: 'no queda ninguna dirección libre en el rango' };
  }

  /** Aplica un lease al cliente (escribe la IP en su interfaz) */
  function applyOffer(state, client, iface, offer) {
    iface.ip = offer.ip;
    iface.prefix = offer.prefix;
    iface.gateway = offer.gateway || '';
    iface.dns = (offer.dns && offer.dns.length) ? offer.dns.slice() : iface.dns || [];
    iface.dhcp = true;
    iface.lease = {
      serverId: offer.serverId, serverName: offer.serverName, pool: offer.poolName,
      type: offer.type, domain: offer.domain || '',
      minutes: offer.leaseMin, at: Date.now()
    };
  }

  /**
   * Renueva (o pide por primera vez) la IP de un cliente por DHCP.
   * Devuelve { ok, log[], lease }
   */
  function renew(state, client, ifaceName) {
    const log = [];
    client = typeof client === 'string' ? M.getNode(state, client) : client;
    if (!client) return { ok: false, log: ['✗ Equipo no encontrado.'] };
    const iface = (client.ifaces || []).find(i => i.name === ifaceName) || (client.ifaces || [])[0];
    if (!iface) return { ok: false, log: [`✗ ${client.name} no tiene interfaces.`] };

    const res = discover(state, client, iface.name);
    log.push(...res.log);
    if (!res.offers.length) return { ok: false, log, error: res.error };

    const offer = res.offers[0];
    log.push(`→ DHCPREQUEST · ${client.name} solicita ${offer.ip} a ${offer.serverName}`);
    applyOffer(state, client, iface, offer);
    log.push(`← DHCPACK · ${offer.serverName}: ${offer.ip}/${offer.prefix} · puerta de enlace ${offer.gateway || '—'} · DNS ${(offer.dns || []).join(', ') || '—'} · concesión ${offer.leaseMin} min`);
    if (offer.domain) log.push(`ℹ Dominio asignado: ${offer.domain} · tipo de concesión: ${offer.type}`);
    return { ok: true, log, lease: iface.lease, offer, iface };
  }

  /** Suelta la concesión */
  function release(client, ifaceName) {
    const iface = (client.ifaces || []).find(i => i.name === ifaceName);
    if (!iface) return;
    iface.ip = ''; iface.gateway = ''; iface.lease = null; iface.dhcp = true;
  }

  /** Renueva todas las interfaces en modo DHCP de la topología */
  function renewAll(state) {
    const log = [];
    let ok = 0, ko = 0;
    state.nodes.filter(isHost).forEach(n => {
      (n.ifaces || []).forEach(i => {
        if (!i.dhcp) return;
        const r = renew(state, n, i.name);
        log.push(`<b>${n.name}:${i.name}</b>`);
        log.push(...r.log.map(l => '  ' + l));
        if (r.ok) ok++; else ko++;
      });
    });
    if (!log.length) log.push('ℹ Ningún equipo está en modo DHCP.');
    return { ok, ko, log };
  }

  /** Concesiones activas de un servidor */
  function leases(state, serverId) {
    const rows = [];
    state.nodes.forEach(n => (n.ifaces || []).forEach(i => {
      if (i.lease && i.lease.serverId === serverId && i.ip) {
        rows.push({
          node: n, iface: i, ip: i.ip, prefix: i.prefix, mac: n.mac || '—',
          type: i.lease.type, pool: i.lease.pool, expires: i.lease.at + (i.lease.minutes * 60000)
        });
      }
    }));
    return rows;
  }

  /* =========================================================
     HTTP
     ========================================================= */
  function normHost(q) {
    return String(q || '').trim().toLowerCase()
      .replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
  }

  function findSite(state, query) {
    const q = normHost(query);
    if (!q) return null;
    for (const n of state.nodes) {
      const web = n.services && n.services.web;
      if (!web || !web.enabled) continue;
      for (const s of (web.sites || [])) {
        const name = normHost(s.name);
        if (name === q || name.split('.')[0] === q || String(s.alias || '').toLowerCase() === q) {
          return { server: n, site: s };
        }
      }
      if (IP.isValidIp(q)) {
        const i = (n.ifaces || []).find(x => x.ip === q);
        if (i) return { server: n, site: (web.sites || [])[0] || { name: q, title: 'Página por defecto', body: 'Servidor web sin contenido configurado.' } };
      }
    }
    return null;
  }

  /** Recorre las IPs del servidor hasta encontrar una alcanzable desde el cliente */
  function reachableIp(state, client, server) {
    const ips = (server.ifaces || []).filter(i => IP.isValidIp(i.ip)).map(i => i.ip);
    for (const ip of ips) {
      const r = S.ping(state, client.id, ip);
      if (r.ok) return { ip, res: r };
    }
    return null;
  }

  function httpGet(state, client, target) {
    const log = [];
    client = typeof client === 'string' ? M.getNode(state, client) : client;
    if (!client) return { ok: false, log: ['✗ Equipo no encontrado.'] };
    const found = findSite(state, target);
    if (!found) {
      return {
        ok: false, log: [
          `→ DNS: resolviendo "${target}"…`,
          `✗ NXDOMAIN: ningún servidor web de la topología publica ese nombre. Revisa la configuración del servicio Web.`
        ]
      };
    }
    const { server, site } = found;
    log.push(`← DNS: ${normHost(site.name)} → ${(server.ifaces.find(i => IP.isValidIp(i.ip)) || {}).ip || '—'} (servidor ${server.name})`);

    const reach = reachableIp(state, client, server);
    if (!reach) {
      log.push(`✗ TCP/80: no se puede establecer conexión con ${server.name}. No hay conectividad IP desde ${client.name}.`);
      return { ok: false, log, server, site };
    }
    log.push(`✓ TCP/80 · conexión establecida con ${reach.ip} (${server.name})`);
    log.push(`→ GET / HTTP/1.1 · Host: ${normHost(site.name)}`);
    const size = 200 + ((site.body || '').length * 2);
    log.push(`← HTTP/1.1 200 OK · ${size} bytes · Content-Type: text/html`);
    return { ok: true, log, server, site, ip: reach.ip, ping: reach.res };
  }

  /* =========================================================
     CORREO (POP3 / SMTP simulados)
     ========================================================= */
  function mailServers(state) {
    return state.nodes.filter(n => n.type === 'server' && n.services && n.services.mail && n.services.mail.enabled);
  }

  function findAccount(state, address) {
    const raw = String(address || '').trim().toLowerCase();
    if (!raw.includes('@')) return null;
    const [user, domain] = raw.split('@');
    for (const n of mailServers(state)) {
      const mail = n.services.mail;
      if (String(mail.domain || '').toLowerCase() !== domain) continue;
      const acc = (mail.users || []).find(u => String(u.user).toLowerCase() === user);
      if (acc) return { server: n, account: acc, address: raw };
    }
    return null;
  }

  function login(state, client, serverId, username, password) {
    client = typeof client === 'string' ? M.getNode(state, client) : client;
    const server = M.getNode(state, serverId);
    const log = [];
    if (!client || !server) return { ok: false, log: ['✗ Datos incompletos.'] };
    const mail = server.services && server.services.mail;
    if (!mail || !mail.enabled) return { ok: false, log: [`✗ ${server.name} no tiene el servicio de correo activo.`] };
    const acc = (mail.users || []).find(u => String(u.user).toLowerCase() === String(username || '').toLowerCase());
    if (!acc) return { ok: false, log: [`✗ POP3: -ERR usuario "${username}" desconocido en ${server.name}.`] };

    const reach = reachableIp(state, client, server);
    log.push(`→ POP3 · conectando a ${(server.ifaces.find(i => IP.isValidIp(i.ip)) || {}).ip}:${mail.pop3 || 110}`);
    if (!reach) {
      log.push(`✗ TCP/${mail.pop3 || 110}: sin conectividad IP con ${server.name} desde ${client.name}.`);
      return { ok: false, log };
    }
    log.push(`← +OK ${server.name} NetLab POP3 ready`);
    log.push(`→ USER ${acc.user}`);
    if (acc.password && acc.password !== password) {
      log.push('← -ERR invalid password');
      return { ok: false, log };
    }
    log.push('← +OK');
    log.push(`→ PASS ${'•'.repeat(Math.max(4, (password || '').length))}`);
    log.push('← +OK logged in · mailbox has ' + (acc.box || []).length + ' message(s)');
    return { ok: true, log, server, account: acc, address: acc.user + '@' + mail.domain };
  }

  function send(state, client, from, to, subject, body) {
    client = typeof client === 'string' ? M.getNode(state, client) : client;
    const log = [];
    const sender = findAccount(state, from);
    const rcpt = findAccount(state, to);
    if (!client) return { ok: false, log: ['✗ Equipo no encontrado.'] };
    if (!sender) return { ok: false, log: [`✗ SMTP: 550 · la cuenta origen "${from}" no existe en ningún servidor de correo.`] };
    if (!rcpt) return { ok: false, log: [`✗ SMTP: 550 · el destinatario "${to}" no existe. Comprueba el dominio y el usuario.`] };

    log.push(`→ SMTP · EHLO ${client.name}`);
    const reach = reachableIp(state, client, sender.server);
    if (!reach) {
      log.push(`✗ SMTP: no hay conectividad IP con ${sender.server.name} para enviar el mensaje.`);
      return { ok: false, log };
    }
    log.push(`← 250 ${sender.server.name} · SMTP ready`);
    log.push(`→ MAIL FROM: ${from} · RCPT TO: ${to}`);

    // ¿mismo servidor o hay que entregar en otro?
    if (rcpt.server.id !== sender.server.id) {
      const reach2 = reachableIp(state, sender.server, rcpt.server);
      if (!reach2) {
        log.push(`→ RELAY hacia ${rcpt.server.name}…`);
        log.push(`✗ SMTP: 451 · no hay ruta IP entre ${sender.server.name} y ${rcpt.server.name}. El mensaje queda en cola.`);
        return { ok: false, log };
      }
      log.push(`→ RELAY · ${sender.server.name} entrega a ${rcpt.server.name} (${reach2.ip})`);
    }
    log.push('→ DATA … .');
    const msg = {
      from, to, subject: subject || '(sin asunto)', body: body || '',
      date: new Date().toLocaleString('es-ES'),
      via: client.name, server: sender.server.name
    };
    rcpt.account.box = rcpt.account.box || [];
    rcpt.account.box.push(msg);
    log.push('← 250 OK · mensaje aceptado y entregado');
    log.push(`✓ Correo entregado en el buzón de ${to} (${rcpt.server.name})`);
    return { ok: true, log, message: msg };
  }

  const Services = {
    segment, discover, allocate, renew, renewAll, release, leases,
    findSite, httpGet, mailServers, findAccount, login, send, reachableIp, normHost
  };

  root.Services = Services;
  if (typeof module !== 'undefined' && module.exports) module.exports = Services;
})(typeof globalThis !== 'undefined' ? globalThis : this);
