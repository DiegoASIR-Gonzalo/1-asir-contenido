/* ============================================================
   NetLab Studio · Actividades predefinidas (ASIR / SMR)
   Cada actividad incluye: briefing, teoría, solución y checker.
   ============================================================ */
(function (root) {
  'use strict';

  const IP = (typeof IPCalc !== 'undefined') ? IPCalc : require('./ipcalc.js');
  const M = (typeof Model !== 'undefined') ? Model : require('./model.js');
  const S = (typeof Sim !== 'undefined') ? Sim : require('./sim.js');

  /* ---------------- helpers de construcción ---------------- */
  function mk(type, name, x, y, ifaces, routes) {
    return { type, name, x, y, ifaces: ifaces || [], routes: routes || [] };
  }

  function build(name, nodes, links) {
    const state = M.newState(name);
    const map = {};
    nodes.forEach(n => {
      const node = M.createNode(state, n.type, n.x, n.y, { name: n.name });
      if (n.ifaces) {
        if (node.ifaces.length) {
          // ajustar número de interfaces
          while (node.ifaces.length < n.ifaces.length) M.addIface(state, node, 'g0/' + node.ifaces.length);
          node.ifaces = n.ifaces.map((cfg, i) => ({
            name: cfg.name || (node.ifaces[i] ? node.ifaces[i].name : 'g0/' + i),
            ip: cfg.ip || '', prefix: IP.clampPrefix(cfg.prefix || 24),
            gateway: cfg.gateway || '', up: cfg.up !== false
          }));
          node.ports = node.ifaces.map(i => i.name);
        }
      }
      if (n.routes) node.routes = n.routes.map(r => ({ dest: r.dest, nextHop: r.nextHop || '', iface: r.iface || '', metric: r.metric || 1, note: r.note || '' }));
      map[n.name] = node;
    });
    (links || []).forEach(l => {
      const a = map[l[0]], b = map[l[1]];
      if (!a || !b) return;
      M.addLinkPorts(state, a.id, l[2] || M.freePort(state, a), b.id, l[3] || M.freePort(state, b));
    });
    return state;
  }

  /* ---------------- utilidades de comprobación ---------------- */
  function hosts(state) {
    return state.nodes.filter(n => !M.isL2(n));
  }

  function ipOwner(state, ip) { return S.findIpOwner(state, ip); }

  function ifaceWithSubnet(state, cidr) {
    const c = IP.parseCidr(cidr);
    if (!c) return [];
    const out = [];
    state.nodes.forEach(n => n.ifaces.forEach(i => {
      if (!IP.isValidIp(i.ip)) return;
      if (IP.networkInt(i.ip, i.prefix) === c.ip && IP.clampPrefix(i.prefix) === c.prefix) out.push({ node: n, iface: i });
    }));
    return out;
  }

  function cfgOn(state, cidr, ipStr) {
    const found = ifaceWithSubnet(state, cidr);
    return found.find(f => f.iface.ip === ipStr) || null;
  }

  function pingOk(state, n1, n2) {
    if (!n1 || !n2) return false;
    const i1 = n1.ifaces.find(i => IP.isValidIp(i.ip));
    const i2 = n2.ifaces.find(i => IP.isValidIp(i.ip));
    if (!i1 || !i2) return false;
    const r = S.ping(state, n1.id, i2.ip);
    return r.ok;
  }

  function routerHasRouteTo(router, cidr) {
    const c = IP.parseCidr(cidr);
    if (!c) return false;
    if (S.routeLookup(router, IP.intToIp(c.ip + 1))) {
      const r = S.routeLookup(router, IP.intToIp(c.ip + 1));
      if (r && r.type === 'static') return true;
    }
    return (router.routes || []).some(r => {
      const rc = IP.parseCidr(r.dest);
      if (!rc) return false;
      return rc.prefix <= c.prefix && (rc.ip >>> 0) === (c.ip & IP.prefixToMaskInt(rc.prefix)) >>> 0;
    });
  }

  function switchesOf(state) { return state.nodes.filter(n => n.type === 'switch'); }

  function degreeIn(state, node, filterFn) {
    let d = 0;
    state.links.forEach(l => {
      if (l.a.node === node.id) { const o = M.getNode(state, l.b.node); if (!filterFn || filterFn(o)) d++; }
      if (l.b.node === node.id) { const o = M.getNode(state, l.a.node); if (!filterFn || filterFn(o)) d++; }
    });
    return d;
  }

  function sum(list, fn) { return list.reduce((a, b) => a + fn(b), 0); }

  /* =========================================================
     ACTIVIDAD 1 · Estrella con switch
     ========================================================= */
  function sol1() {
    return build('Solución · LAN en estrella', [
      mk('switch', 'SW1', 430, 250),
      mk('pc', 'PC1', 250, 110, [{ ip: '192.168.10.10', prefix: 24 }]),
      mk('pc', 'PC2', 610, 110, [{ ip: '192.168.10.20', prefix: 24 }]),
      mk('pc', 'PC3', 250, 400, [{ ip: '192.168.10.30', prefix: 24 }]),
      mk('pc', 'PC4', 610, 400, [{ ip: '192.168.10.40', prefix: 24 }])
    ], [['SW1', 'PC1'], ['SW1', 'PC2'], ['SW1', 'PC3'], ['SW1', 'PC4']]);
  }

  const act1 = {
    id: 'estrella-basica',
    level: 'CFGM · SMR / 1º ASIR',
    title: 'Topología en estrella',
    tagline: '4 puestos de trabajo y un switch en la misma LAN',
    mins: 20,
    tags: ['capa 2', 'LAN', 'clase C'],
    goals: [
      'Montar una topología física en estrella.',
      'Direccionar una red /24 con direcciones .10, .20, .30 y .40.',
      'Comprobar la conectividad extremo a extremo con ping.'
    ],
    briefing: `
      <p>La oficina de <b>Aula 1</b> tiene 4 puestos de trabajo que deben compartir una única red local.</p>
      <ol>
        <li>Coloca un <b>switch</b> en el centro y conecta los <b>4 PC</b> a él (topología en estrella).</li>
        <li>Usa la red <code>192.168.10.0/24</code> con estas direcciones:
          <ul><li>PC1 → <code>192.168.10.10</code></li><li>PC2 → <code>192.168.10.20</code></li>
          <li>PC3 → <code>192.168.10.30</code></li><li>PC4 → <code>192.168.10.40</code></li></ul>
          Máscara <code>255.255.255.0</code> (<code>/24</code>) en todos.
        </li>
        <li>No hace falta router: todos están en la misma subred.</li>
        <li>Verifica con <b>ping</b> que todos se ven entre sí.</li>
      </ol>
      <p class="tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 9v4M12 16h.01"/></svg><span>💡 Doble clic en un equipo para asignar IP. Arrastra desde el puerto ⚪ de un equipo a otro para crear el cable.</span></p>`,
    theory: `
      <h4>Topología en estrella</h4>
      <p>Todos los equipos se conectan a un nodo central (switch o hub). Ventajas: un fallo en un cable solo afecta a ese puesto y es fácil de ampliar. Inconveniente: el nodo central es un punto único de fallo.</p>
      <h4>Red 192.168.10.0/24</h4>
      <ul>
        <li>Dirección de red: <code>192.168.10.0</code> · Broadcast: <code>192.168.10.255</code></li>
        <li>Rango útil: <code>192.168.10.1 – 192.168.10.254</code> (254 hosts)</li>
        <li>Máscara: <code>255.255.255.0</code> · Prefijo: <code>/24</code></li>
      </ul>
      <p>Un switch trabaja en <b>capa 2</b>: aprende direcciones MAC y no necesita IP (salvo para gestión). La comunicación entre equipos de la misma subred se hace directamente, sin router.</p>`,
    solution: sol1,
    check(state) {
      const sw = switchesOf(state);
      const pcs = state.nodes.filter(n => n.type === 'pc' || n.type === 'laptop' || n.type === 'server');
      const checks = [];

      checks.push({
        id: 'sw', text: 'Hay al menos un switch',
        ok: sw.length >= 1, msg: sw.length >= 1 ? `${sw.length} switch(s) en la topología` : 'Falta el switch central'
      });
      checks.push({
        id: 'pcs', text: 'Hay 4 equipos finales (PC)',
        ok: pcs.length >= 4, msg: `${pcs.length} equipo(s) final(es)`
      });

      const star = sw.some(s => pcs.filter(p => state.links.some(l =>
        (l.a.node === s.id && l.b.node === p.id) || (l.b.node === s.id && l.a.node === p.id))).length >= 4);
      checks.push({
        id: 'star', text: 'Estrella: los 4 PC cuelgan del mismo switch',
        ok: star, msg: star ? 'Topología en estrella correcta' : 'Los 4 PC deben conectarse directamente al mismo switch'
      });

      const required = ['192.168.10.10', '192.168.10.20', '192.168.10.30', '192.168.10.40'];
      const has = required.filter(ip => ipOwner(state, ip));
      checks.push({
        id: 'ips', text: 'Las 4 direcciones .10/.20/.30/.40 están asignadas',
        ok: has.length === 4,
        msg: has.length === 4 ? 'Direccionamiento correcto' : `Faltan: ${required.filter(ip => !has.includes(ip)).join(', ') || '—'}`
      });

      const inSubnet = pcs.every(p => p.ifaces.every(i => !IP.isValidIp(i.ip) || IP.networkInt(i.ip, i.prefix) === IP.ipToInt('192.168.10.0') && IP.clampPrefix(i.prefix) === 24));
      checks.push({
        id: 'mask', text: 'Todos los equipos en 192.168.10.0/24',
        ok: inSubnet, msg: inSubnet ? 'Máscara /24 correcta' : 'Alguna IP está fuera de 192.168.10.0/24 o tiene mal la máscara'
      });

      const withIp = required.map(ip => { const o = ipOwner(state, ip); return o ? o.node : null; }).filter(Boolean);
      let pingsOk = true;
      for (let i = 0; i < withIp.length && pingsOk; i++)
        for (let j = i + 1; j < withIp.length && pingsOk; j++)
          if (!pingOk(state, withIp[i], withIp[j])) pingsOk = false;
      checks.push({
        id: 'ping', text: 'Ping correcto entre los 4 PC',
        ok: withIp.length === 4 && pingsOk,
        msg: pingsOk && withIp.length === 4 ? 'Todos se comunican' : 'Alguna pareja no se comunica: revisa cables e IPs'
      });

      return checks;
    }
  };

  /* =========================================================
     ACTIVIDAD 2 · Anillo conmutado
     ========================================================= */
  function sol2() {
    return build('Solución · Anillo de switches', [
      mk('switch', 'SW1', 430, 90),
      mk('switch', 'SW2', 200, 380),
      mk('switch', 'SW3', 660, 380),
      mk('pc', 'PC1', 430, 250, [{ ip: '172.16.5.11', prefix: 24 }]),
      mk('pc', 'PC2', 430, 520, [{ ip: '172.16.5.12', prefix: 24 }])
    ], [['SW1', 'SW2'], ['SW2', 'SW3'], ['SW3', 'SW1'], ['SW1', 'PC1'], ['SW3', 'PC2']]);
  }

  const act2 = {
    id: 'anillo',
    level: 'CFGM · SMR / 1º ASIR',
    title: 'Anillo de switches',
    tagline: '3 switches en anillo y dos hosts que se comunican',
    mins: 25,
    tags: ['capa 2', 'redundancia', 'STP'],
    goals: [
      'Construir una topología en anillo con 3 switches.',
      'Direccionar dos hosts en la misma subred.',
      'Entender por qué un anillo necesita STP.'
    ],
    briefing: `
      <p>Queremos <b>redundancia</b> en el cableado del aula: si un cable se rompe, la red debe seguir funcionando.</p>
      <ol>
        <li>Crea <b>3 switches</b> y conéctalos formando un <b>anillo</b>: SW1–SW2, SW2–SW3 y SW3–SW1.</li>
        <li>Conecta un <b>PC1</b> a SW1 y un <b>PC2</b> a SW3.</li>
        <li>Red <code>172.16.5.0/24</code>: PC1 → <code>172.16.5.11</code>, PC2 → <code>172.16.5.12</code>.</li>
        <li>Haz ping entre PC1 y PC2: debe funcionar.</li>
      </ol>
      <p class="tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 9v4M12 16h.01"/></svg><span>⚠️ En un anillo físico real se produciría una <b>tormenta de broadcast</b>. Los switches reales ejecutan <b>STP (802.1D)</b> y bloquean un puerto para romper el bucle. En este simulador el reenvío es controlado, así que el anillo funciona como red de respaldo.</span></p>`,
    theory: `
      <h4>Anillo</h4>
      <p>Cada nodo se conecta con dos vecinos. Ventaja: tolerancia a fallos (existe un camino alternativo). Inconveniente: bucles en capa 2, que requieren <b>Spanning Tree Protocol</b>.</p>
      <h4>Estados de puerto STP</h4>
      <ol><li><b>Blocking</b> – no reenvía, solo escucha BPDU.</li><li><b>Listening</b> – 15 s.</li><li><b>Learning</b> – 15 s, aprende MACs.</li><li><b>Forwarding</b> – reenvía tráfico.</li></ol>
      <p>El switch con menor <b>Bridge ID</b> (prioridad + MAC) es la <b>raíz</b>. Elección de puerto raíz: menor coste acumulado hasta la raíz.</p>
      <h4>Costes STP habituales</h4>
      <table class="mini"><tr><th>Velocidad</th><th>Coste 802.1D</th></tr><tr><td>10 Mbps</td><td>100</td></tr><tr><td>100 Mbps</td><td>19</td></tr><tr><td>1 Gbps</td><td>4</td></tr></table>`,
    solution: sol2,
    check(state) {
      const sw = switchesOf(state);
      const checks = [];

      checks.push({ id: 'sw', text: 'Hay 3 switches', ok: sw.length >= 3, msg: `${sw.length} switch(s)` });

      const ring = sw.length >= 3 && sw.every(s => degreeIn(state, s, o => o && o.type === 'switch') >= 2);
      checks.push({
        id: 'ring', text: 'Anillo cerrado: cada switch conecta con otros dos',
        ok: ring, msg: ring ? 'Anillo correcto (3 enlaces entre switches)' : 'Cada switch debe tener 2 enlaces a otros switches'
      });

      const pcs = state.nodes.filter(n => n.type === 'pc' || n.type === 'laptop' || n.type === 'server');
      checks.push({ id: 'pcs', text: 'Hay 2 equipos finales', ok: pcs.length >= 2, msg: `${pcs.length} equipo(s)` });

      const p1 = ipOwner(state, '172.16.5.11');
      const p2 = ipOwner(state, '172.16.5.12');
      const sameNet = p1 && p2 && IP.sameSubnet(p1.iface.ip, p1.iface.prefix, p2.iface.ip, p2.iface.prefix);
      checks.push({
        id: 'ips', text: 'PC1=.11 y PC2=.12 en 172.16.5.0/24',
        ok: !!(p1 && p2 && sameNet),
        msg: p1 && p2 ? (sameNet ? 'Direccionamiento correcto' : 'Las IPs no están en la misma subred /24') : 'Falta alguna dirección (172.16.5.11 / 172.16.5.12)'
      });

      const okPing = p1 && p2 && pingOk(state, p1.node, p2.node);
      checks.push({ id: 'ping', text: 'Ping PC1 → PC2', ok: !!okPing, msg: okPing ? 'Comunicación extremo a extremo correcta' : 'No hay comunicación: revisa el anillo y las IPs' });

      return checks;
    }
  };

  /* =========================================================
     ACTIVIDAD 3 · Dos LANs con routers y rutas estáticas
     ========================================================= */
  function sol3() {
    return build('Solución · Enrutamiento entre dos LAN', [
      mk('pc', 'PC1', 150, 130, [{ ip: '192.168.1.10', prefix: 24, gateway: '192.168.1.1' }]),
      mk('switch', 'SW1', 330, 130),
      mk('router', 'R1', 330, 300, [
        { name: 'g0/0', ip: '192.168.1.1', prefix: 24 },
        { name: 'g0/1', ip: '10.0.0.1', prefix: 30 }
      ], [{ dest: '192.168.2.0/24', nextHop: '10.0.0.2' }]),
      mk('router', 'R2', 630, 300, [
        { name: 'g0/0', ip: '192.168.2.1', prefix: 24 },
        { name: 'g0/1', ip: '10.0.0.2', prefix: 30 }
      ], [{ dest: '192.168.1.0/24', nextHop: '10.0.0.1' }]),
      mk('switch', 'SW2', 630, 130),
      mk('pc', 'PC2', 810, 130, [{ ip: '192.168.2.10', prefix: 24, gateway: '192.168.2.1' }])
    ], [['PC1', 'SW1'], ['SW1', 'R1', 'Fa0/2', 'g0/0'], ['R1', 'R2', 'g0/1', 'g0/1'],
        ['R2', 'SW2', 'g0/0', 'Fa0/1'], ['SW2', 'PC2', 'Fa0/2', 'eth0']]);
  }

  const act3 = {
    id: 'rutas-estaticas',
    level: 'CFGS · ASIR',
    title: 'Dos LANs y enrutamiento estático',
    tagline: 'Dos routers, un enlace WAN /30 y rutas estáticas',
    mins: 40,
    tags: ['capa 3', 'rutas estáticas', '/30', 'gateway'],
    goals: [
      'Direccionar dos LAN y un enlace punto a punto /30.',
      'Configurar la puerta de enlace en los hosts.',
      'Añadir rutas estáticas en ambos routers y verificar el ping.'
    ],
    briefing: `
      <p>Dos sedes deben comunicarse. Cada sede tiene un router que da servicio a su LAN y ambos se unen por un enlace serie/Gigabit.</p>
      <table class="mini">
        <tr><th>Zona</th><th>Red</th><th>Puerta de enlace</th></tr>
        <tr><td>Sede A (LAN1)</td><td><code>192.168.1.0/24</code></td><td><code>192.168.1.1</code> (R1 g0/0)</td></tr>
        <tr><td>Sede B (LAN2)</td><td><code>192.168.2.0/24</code></td><td><code>192.168.2.1</code> (R2 g0/0)</td></tr>
        <tr><td>Enlace WAN</td><td><code>10.0.0.0/30</code></td><td>R1 g0/1 = <code>10.0.0.1</code>, R2 g0/1 = <code>10.0.0.2</code></td></tr>
      </table>
      <ol>
        <li>Monta: <code>PC1 – SW1 – R1 – R2 – SW2 – PC2</code>.</li>
        <li>PC1 = <code>192.168.1.10/24</code> con gateway <code>192.168.1.1</code>. PC2 = <code>192.168.2.10/24</code> con gateway <code>192.168.2.1</code>.</li>
        <li>En <b>R1</b> añade la ruta estática <code>192.168.2.0/24</code> vía <code>10.0.0.2</code>.</li>
        <li>En <b>R2</b> añade la ruta estática <code>192.168.1.0/24</code> vía <code>10.0.0.1</code>.</li>
        <li>Ping de PC1 a PC2 (192.168.2.10). Debe funcionar en ambos sentidos.</li>
      </ol>
      <p class="tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 9v4M12 16h.01"/></svg><span>💡 Sin la ruta de vuelta el ping falla aunque la ida funcione. Es el error más típico.</span></p>`,
    theory: `
      <h4>¿Por qué /30 en el enlace?</h4>
      <p>Una <code>/30</code> tiene 2 direcciones útiles: perfecta para enlaces punto a punto entre routers (las <code>/31</code>, RFC 3021, también ahorran direcciones).</p>
      <h4>Resolución de un ping</h4>
      <ol>
        <li>PC1 compara 192.168.2.10 con su red 192.168.1.0/24 → está fuera.</li>
        <li>Envía el paquete a su <b>puerta de enlace</b> 192.168.1.1 (ARP a nivel local).</li>
        <li>R1 consulta su tabla: 192.168.2.0/24 no es conectada → usa la estática vía 10.0.0.2.</li>
        <li>R2 recibe, comprueba que 192.168.2.10 está conectada por g0/0 y hace ARP para entregar el paquete.</li>
        <li>La respuesta recorre el camino inverso con la ruta 192.168.1.0/24 vía 10.0.0.1.</li>
      </ol>
      <h4>Comandos Cisco equivalentes</h4>
      <pre>ip route 192.168.2.0 255.255.255.0 10.0.0.2
! hosts
ip address 192.168.1.10 255.255.255.0
ip default-gateway 192.168.1.1</pre>`,
    solution: sol3,
    check(state) {
      const checks = [];
      const routers = state.nodes.filter(n => n.type === 'router' || n.type === 'firewall');

      checks.push({ id: 'routers', text: 'Hay 2 routers', ok: routers.length >= 2, msg: `${routers.length} router(s)` });

      const wan1 = cfgOn(state, '10.0.0.0/30', '10.0.0.1');
      const wan2 = cfgOn(state, '10.0.0.0/30', '10.0.0.2');
      checks.push({
        id: 'wan', text: 'Enlace WAN 10.0.0.0/30 con .1 y .2',
        ok: !!(wan1 && wan2 && wan1.node.id !== wan2.node.id),
        msg: wan1 && wan2 ? `${wan1.node.name}=.1 · ${wan2.node.name}=.2` : 'Falta configurar 10.0.0.1 y 10.0.0.2 en routers distintos'
      });

      const gw1 = ipOwner(state, '192.168.1.1');
      const gw2 = ipOwner(state, '192.168.2.1');
      checks.push({
        id: 'gws', text: 'Gateways 192.168.1.1 y 192.168.2.1 configurados',
        ok: !!(gw1 && gw2),
        msg: gw1 && gw2 ? `${gw1.node.name} y ${gw2.node.name}` : 'Falta alguna puerta de enlace en los routers'
      });

      const pc1 = ipOwner(state, '192.168.1.10');
      const pc2 = ipOwner(state, '192.168.2.10');
      const gwOk = pc1 && pc2 && pc1.iface.gateway === '192.168.1.1' && pc2.iface.gateway === '192.168.2.1';
      checks.push({
        id: 'hosts', text: 'PCs .10 con su puerta de enlace',
        ok: !!gwOk,
        msg: !pc1 || !pc2 ? 'Faltan PC1 (192.168.1.10) y/o PC2 (192.168.2.10)' :
          gwOk ? 'Gateways de host correctas' : `Gateway mal configurada: PC1=${pc1.iface.gateway || '—'} · PC2=${pc2.iface.gateway || '—'}`
      });

      const r1 = wan1 ? wan1.node : (gw1 ? gw1.node : null);
      const r2 = wan2 ? wan2.node : (gw2 ? gw2.node : null);
      const st1 = r1 ? routerHasRouteTo(r1, '192.168.2.0/24') : false;
      const st2 = r2 ? routerHasRouteTo(r2, '192.168.1.0/24') : false;
      checks.push({
        id: 'routes', text: 'Rutas estáticas en ambos routers',
        ok: !!(st1 && st2),
        msg: st1 && st2 ? 'Rutas de ida y vuelta presentes' : `${r1 ? r1.name : 'R1'}: ${st1 ? 'OK' : 'falta ruta a 192.168.2.0/24'} · ${r2 ? r2.name : 'R2'}: ${st2 ? 'OK' : 'falta ruta a 192.168.1.0/24'}`
      });

      const okPing = pc1 && pc2 && pingOk(state, pc1.node, pc2.node);
      checks.push({
        id: 'ping', text: 'Ping PC1 ↔ PC2 completo',
        ok: !!okPing,
        msg: okPing ? 'Conectividad extremo a extremo correcta' : 'El ping no llega: revisa rutas, gateways y direccionamiento'
      });

      return checks;
    }
  };

  /* =========================================================
     ACTIVIDAD 4 · VLSM
     ========================================================= */
  function sol4() {
    return build('Solución · VLSM 192.168.100.0/24', [
      mk('router', 'R1', 470, 250, [
        { name: 'g0/0', ip: '192.168.100.1', prefix: 25 },
        { name: 'g0/1', ip: '192.168.100.129', prefix: 26 },
        { name: 'g0/2', ip: '192.168.100.193', prefix: 28 }
      ]),
      mk('switch', 'SW-ADMIN', 200, 100),
      mk('pc', 'PC-ADMIN', 120, 300, [{ ip: '192.168.100.10', prefix: 25, gateway: '192.168.100.1' }]),
      mk('switch', 'SW-VENTAS', 470, 100),
      mk('pc', 'PC-VENTAS', 470, 400, [{ ip: '192.168.100.140', prefix: 26, gateway: '192.168.100.129' }]),
      mk('switch', 'SW-SIST', 740, 100),
      mk('pc', 'PC-SIST', 800, 300, [{ ip: '192.168.100.200', prefix: 28, gateway: '192.168.100.193' }])
    ], [['SW-ADMIN', 'PC-ADMIN', 'Fa0/1', 'eth0'], ['SW-ADMIN', 'R1', 'Fa0/2', 'g0/0'],
        ['SW-VENTAS', 'PC-VENTAS', 'Fa0/1', 'eth0'], ['SW-VENTAS', 'R1', 'Fa0/2', 'g0/1'],
        ['SW-SIST', 'PC-SIST', 'Fa0/1', 'eth0'], ['SW-SIST', 'R1', 'Fa0/2', 'g0/2']]);
  }

  const act4 = {
    id: 'vlsm',
    level: 'CFGS · ASIR',
    title: 'Subnetting VLSM desde 192.168.100.0/24',
    tagline: 'Tres subredes de tamaño distinto: 100, 40 y 12 hosts',
    mins: 45,
    tags: ['VLSM', 'subnetting', 'router-on-a-stick'],
    goals: [
      'Calcular 3 subredes VLSM a partir de una /24.',
      'Asignar la primera dirección útil al router (gateway).',
      'Comprobar que las 3 LAN se comunican a través del router.'
    ],
    briefing: `
      <p>Una empresa tiene una única red pública/clase C <code>192.168.100.0/24</code> y necesita dividirla en tres departamentos:</p>
      <table class="mini">
        <tr><th>Departamento</th><th>Hosts necesarios</th></tr>
        <tr><td>ADMIN</td><td>100</td></tr>
        <tr><td>VENTAS</td><td>40</td></tr>
        <tr><td>SISTEMAS</td><td>12</td></tr>
      </table>
      <ol>
        <li>Calcula las subredes con <b>VLSM</b> (de mayor a menor). Puedes usar la pestaña <b>Subredes</b> de la barra lateral.</li>
        <li>Monta 1 router con 3 interfaces y un switch + 1 PC por departamento.</li>
        <li>El router usa la <b>primera dirección útil</b> de cada subred.</li>
        <li>Cada PC lleva una dirección de su rango y su gateway correspondiente.</li>
        <li>Los tres PC deben poder hacer ping entre sí.</li>
      </ol>
      <p class="tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 9v4M12 16h.01"/></svg><span>💡 Solución esperada: ADMIN <code>/25</code>, VENTAS <code>/26</code>, SISTEMAS <code>/28</code>. Comprueba si tu reparto pasa el verificador antes de mirar la solución.</span></p>`,
    theory: `
      <h4>VLSM paso a paso</h4>
      <ol>
        <li>Ordena las necesidades de <b>mayor a menor</b>: 100, 40, 12.</li>
        <li>Añade 2 direcciones (red + broadcast) y busca la potencia de 2: 102→128 (<code>/25</code>), 42→64 (<code>/26</code>), 14→16 (<code>/28</code>).</li>
        <li>Asigna bloques consecutivos y alineados al tamaño del bloque:
          <ul>
            <li>ADMIN → <code>192.168.100.0/25</code> (0–127)</li>
            <li>VENTAS → <code>192.168.100.128/26</code> (128–191)</li>
            <li>SISTEMAS → <code>192.168.100.192/28</code> (192–207)</li>
          </ul>
        </li>
      </ol>
      <p>Quedan libres <code>192.168.100.208 – 192.168.100.255</code> para crecimiento.</p>
      <h4>Regla de oro</h4>
      <p>Una subred siempre empieza en un múltiplo del tamaño de su bloque. Si te sale <code>192.168.100.20/28</code> está mal: debe ser <code>...192/28</code>.</p>`,
    solution: sol4,
    check(state) {
      const checks = [];
      const base = IP.parseCidr('192.168.100.0/24');
      const nets = new Map();
      state.nodes.forEach(n => n.ifaces.forEach(i => {
        if (!IP.isValidIp(i.ip)) return;
        const cidr = IP.cidr(i.ip, i.prefix);
        if (!nets.has(cidr)) nets.set(cidr, []);
        nets.get(cidr).push({ node: n, iface: i });
      }));

      const keys = [...nets.keys()];
      const hasNet = (cidr) => keys.includes(cidr);
      const aligned = keys.every(k => {
        const c = IP.parseCidr(k);
        return c && (c.ip % Math.pow(2, 32 - c.prefix)) === 0;
      });

      const admin = hasNet('192.168.100.0/25');
      const ventas = hasNet('192.168.100.128/26');
      const sist = hasNet('192.168.100.192/28');

      checks.push({
        id: 'vlsm1', text: 'ADMIN = 192.168.100.0/25 (126 hosts útiles)',
        ok: admin, msg: admin ? 'OK' : 'Subred de 100 hosts mal calculada (debe ser /25 en .0)'
      });
      checks.push({
        id: 'vlsm2', text: 'VENTAS = 192.168.100.128/26 (62 hosts útiles)',
        ok: ventas, msg: ventas ? 'OK' : 'Subred de 40 hosts mal calculada (debe ser /26 en .128)'
      });
      checks.push({
        id: 'vlsm3', text: 'SISTEMAS = 192.168.100.192/28 (14 hosts útiles)',
        ok: sist, msg: sist ? 'OK' : 'Subred de 12 hosts mal calculada (debe ser /28 en .192)'
      });
      checks.push({
        id: 'aligned', text: 'Todas las subredes están bien alineadas',
        ok: aligned && keys.every(k => { const c = IP.parseCidr(k); return c && c.prefix >= 24; }),
        msg: aligned ? 'Alineación correcta' : 'Alguna subred no empieza en un múltiplo de su tamaño'
      });

      const router = state.nodes.find(n => n.type === 'router' || n.type === 'firewall');
      const gwOk = !!router && ['192.168.100.1', '192.168.100.129', '192.168.100.193'].every(ip => {
        const o = ipOwner(state, ip);
        return o && o.node.id === router.id;
      });
      checks.push({
        id: 'gw', text: 'El router tiene .1, .129 y .193',
        ok: gwOk, msg: gwOk ? 'Gateways = primera dirección útil de cada subred' : 'El router debe usar la primera dirección útil de cada subred (.1, .129, .193)'
      });

      const pcAdmin = nets.get('192.168.100.0/25') || [];
      const pcVentas = nets.get('192.168.100.128/26') || [];
      const pcSist = nets.get('192.168.100.192/28') || [];
      const hostA = pcAdmin.find(e => e.node.type === 'pc' || e.node.type === 'laptop' || e.node.type === 'server');
      const hostV = pcVentas.find(e => e.node.type === 'pc' || e.node.type === 'laptop' || e.node.type === 'server');
      const hostS = pcSist.find(e => e.node.type === 'pc' || e.node.type === 'laptop' || e.node.type === 'server');

      checks.push({
        id: 'hosts', text: 'Un host con IP válida en cada subred',
        ok: !!(hostA && hostV && hostS),
        msg: hostA && hostV && hostS ? `${hostA.node.name}, ${hostV.node.name}, ${hostS.node.name}` : 'Falta algún host en alguna de las tres subredes'
      });

      const gwHosts = [hostA, hostV, hostS].every(h => h && h.iface.gateway);
      checks.push({
        id: 'hostgw', text: 'Los hosts tienen gateway configurado',
        ok: gwHosts, msg: gwHosts ? 'Gateways de host correctas' : 'Cada PC debe apuntar a la IP del router de su subred'
      });

      const allPing = hostA && hostV && hostS &&
        pingOk(state, hostA.node, hostV.node) && pingOk(state, hostV.node, hostS.node) && pingOk(state, hostA.node, hostS.node);
      checks.push({
        id: 'ping', text: 'Ping entre los 3 departamentos',
        ok: !!allPing, msg: allPing ? 'Enrutamiento entre subredes correcto' : 'Falta conectividad entre departamentos'
      });

      return checks;
    }
  };

  /* =========================================================
     ACTIVIDAD 5 · Sucursal con salida a Internet (ruta por defecto)
     ========================================================= */
  function sol5() {
    return build('Solución · Sucursal con salida a Internet', [
      mk('pc', 'PC1', 120, 100, [{ ip: '10.10.0.10', prefix: 24, gateway: '10.10.0.1' }]),
      mk('pc', 'PC2', 120, 300, [{ ip: '10.10.0.11', prefix: 24, gateway: '10.10.0.1' }]),
      mk('switch', 'SW1', 320, 200),
      mk('router', 'R1', 520, 200, [
        { name: 'g0/0', ip: '10.10.0.1', prefix: 24 },
        { name: 'g0/1', ip: '200.1.1.2', prefix: 30 }
      ], [{ dest: '0.0.0.0/0', nextHop: '200.1.1.1' }]),
      mk('cloud', 'WAN', 720, 200),
      mk('router', 'R-ISP', 900, 200, [
        { name: 'g0/0', ip: '200.1.1.1', prefix: 30 },
        { name: 'g0/1', ip: '8.8.8.1', prefix: 24 }
      ]),
      mk('server', 'WEB', 1060, 320, [{ ip: '8.8.8.8', prefix: 24, gateway: '8.8.8.1' }])
    ], [['PC1', 'SW1', 'eth0', 'Fa0/1'], ['PC2', 'SW1', 'eth0', 'Fa0/2'], ['SW1', 'R1', 'Fa0/3', 'g0/0'],
        ['R1', 'WAN', 'g0/1', 'WAN0'], ['WAN', 'R-ISP', 'WAN1', 'g0/0'], ['R-ISP', 'WEB', 'g0/1', 'eth0']]);
  }

  const act5 = {
    id: 'internet',
    level: 'CFGS · ASIR',
    title: 'Sucursal con salida a Internet',
    tagline: 'Ruta por defecto, NAT implícito y un servidor remoto',
    mins: 35,
    tags: ['ruta por defecto', 'WAN', '0.0.0.0/0'],
    goals: [
      'Configurar una LAN de sucursal con su gateway.',
      'Salir a Internet mediante ruta por defecto 0.0.0.0/0.',
      'Verificar la conectividad con un servidor remoto.'
    ],
    briefing: `
      <p>La sucursal tiene 2 PC, un switch y un router <b>R1</b>. El proveedor (R-ISP) ya está configurado y da salida a un servidor web público.</p>
      <table class="mini">
        <tr><th>Elemento</th><th>Dirección</th></tr>
        <tr><td>LAN sucursal</td><td><code>10.10.0.0/24</code> · gateway <code>10.10.0.1</code> (R1 g0/0)</td></tr>
        <tr><td>Enlace WAN</td><td><code>200.1.1.0/30</code> · R1 g0/1 = <code>200.1.1.2</code>, ISP = <code>200.1.1.1</code></td></tr>
        <tr><td>Servidor web</td><td><code>8.8.8.8/24</code> · gateway <code>8.8.8.1</code></td></tr>
      </table>
      <ol>
        <li>Monta: <code>PC1</code> y <code>PC2</code> → <code>SW1</code> → <code>R1</code> → <code>WAN</code> → <code>R-ISP</code> → <code>WEB</code>.</li>
        <li>Asigna a los PC <code>10.10.0.10</code> y <code>10.10.0.11</code> con gateway <code>10.10.0.1</code>.</li>
        <li>En <b>R1</b>: g0/0 = <code>10.10.0.1/24</code>, g0/1 = <code>200.1.1.2/30</code>.</li>
        <li>Añade en R1 la <b>ruta por defecto</b> <code>0.0.0.0/0</code> vía <code>200.1.1.1</code>.</li>
        <li>Ping de PC1 a <code>8.8.8.8</code>.</li>
      </ol>
      <p class="tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 9v4M12 16h.01"/></svg><span>💡 El router ISP ya es alcanzable en su propio segmento, por lo que no necesita ruta de vuelta: la respuesta usa su ruta conectada 200.1.1.0/30.</span></p>`,
    theory: `
      <h4>Ruta por defecto</h4>
      <p><code>0.0.0.0/0</code> es la ruta menos específica posible: coincide con <b>cualquier</b> destino. Solo se usa cuando no existe una ruta más concreta (la más específica gana siempre).</p>
      <pre>ip route 0.0.0.0 0.0.0.0 200.1.1.1
! o bien
ip route 0.0.0.0 0.0.0.0 g0/1</pre>
      <h4>Longest prefix match</h4>
      <p>Tabla de R1:</p>
      <table class="mini">
        <tr><th>Destino</th><th>Salida</th></tr>
        <tr><td>10.10.0.0/24</td><td>conectada g0/0</td></tr>
        <tr><td>200.1.1.0/30</td><td>conectada g0/1</td></tr>
        <tr><td>0.0.0.0/0</td><td>200.1.1.1</td></tr>
      </table>
      <p>Para 10.10.0.10 gana la /24; para 8.8.8.8 solo encaja la /0.</p>
      <h4>NAT</h4>
      <p>En un caso real, R1 haría NAT/PAT para traducir 10.10.0.0/24 a 200.1.1.2. Este simulador no aplica NAT: el ISP conoce la ruta de vuelta por tener el enlace conectado.</p>`,
    solution: sol5,
    check(state) {
      const checks = [];
      const r1 = state.nodes.find(n => n.type === 'router' && n.ifaces.some(i => i.ip === '10.10.0.1'));
      const wanSide = state.nodes.find(n => n.ifaces.some(i => i.ip === '200.1.1.2'));

      const lan = ipOwner(state, '10.10.0.1');
      const wan = ipOwner(state, '200.1.1.2');
      checks.push({
        id: 'ifs', text: 'R1 con 10.10.0.1/24 y 200.1.1.2/30',
        ok: !!(lan && wan && lan.node.id === wan.node.id),
        msg: lan && wan ? (lan.node.id === wan.node.id ? 'Interfaces correctas' : 'Esas IPs deben estar en el mismo router (R1)') : 'Falta alguna IP en R1'
      });

      const p1 = ipOwner(state, '10.10.0.10');
      const p2 = ipOwner(state, '10.10.0.11');
      const gwOk = p1 && p2 && p1.iface.gateway === '10.10.0.1' && p2.iface.gateway === '10.10.0.1';
      checks.push({
        id: 'hosts', text: 'PC1 y PC2 con gateway 10.10.0.1',
        ok: !!gwOk, msg: gwOk ? 'Hosts correctos' : 'Falta algún PC o su gateway'
      });

      const defRoute = r1 ? ((r1.routes || []).some(r => {
        const c = IP.parseCidr(r.dest);
        return c && c.prefix === 0 && r.nextHop === '200.1.1.1';
      })) : false;
      checks.push({
        id: 'route', text: 'R1 tiene 0.0.0.0/0 vía 200.1.1.1',
        ok: defRoute, msg: defRoute ? 'Ruta por defecto correcta' : 'Añade la ruta estática 0.0.0.0/0 con next hop 200.1.1.1'
      });

      const web = ipOwner(state, '8.8.8.8');
      checks.push({ id: 'web', text: 'El servidor WEB (8.8.8.8) sigue conectado', ok: !!web, msg: web ? 'Servidor presente' : 'No borres el servidor de la topología' });

      const okPing = p1 && web && S.ping(state, p1.node.id, '8.8.8.8').ok;
      checks.push({
        id: 'ping', text: 'Ping de PC1 a 8.8.8.8', ok: !!okPing,
        msg: okPing ? 'Salida a Internet funcionando' : 'No llega: revisa la ruta por defecto y el direccionamiento WAN'
      });

      return checks;
    }
  };

  /* =========================================================
     Topologías iniciales (sin configurar) para el alumnado
     ========================================================= */
  function stripAll(state, keep) {
    keep = keep || [];
    state.nodes.forEach(n => {
      if (keep.includes(n.name)) return;
      n.ifaces.forEach(i => { i.ip = ''; i.gateway = ''; });
      n.routes = [];
    });
    return state;
  }

  act1.initial = function () { const st = stripAll(sol1()); st.links = []; return st; };
  act2.initial = function () { const st = stripAll(sol2()); st.links = []; return st; };
  act3.initial = function () { return stripAll(sol3()); };
  act4.initial = function () { return stripAll(sol4()); };
  act5.initial = function () { return stripAll(sol5(), ['R-ISP', 'WEB']); };

  const ACTIVITIES = [act1, act2, act3, act4, act5];

  function byId(id) { return ACTIVITIES.find(a => a.id === id) || null; }

  const Activities = { ACTIVITIES, byId };
  root.Activities = Activities;
  if (typeof module !== 'undefined' && module.exports) module.exports = Activities;
})(typeof globalThis !== 'undefined' ? globalThis : this);
