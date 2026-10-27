/* ============================================================
   NetLab Studio · Motor de cálculo IP / subredes
   ============================================================ */
(function (root, factory) {
  const api = factory();
  root.IPCalc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ---------- conversiones básicas ---------- */
  function ipToInt(ip) {
    if (typeof ip !== 'string') return null;
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return null;
    let n = 0;
    for (const p of parts) {
      if (!/^\d{1,3}$/.test(p)) return null;
      const v = parseInt(p, 10);
      if (v > 255) return null;
      n = n * 256 + v;
    }
    return n >>> 0;
  }

  function intToIp(n) {
    n = n >>> 0;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  }

  function isValidIp(ip) { return ipToInt(ip) !== null; }

  function prefixToMaskInt(prefix) {
    prefix = clampPrefix(prefix);
    if (prefix === 0) return 0;
    return (0xffffffff << (32 - prefix)) >>> 0;
  }

  function prefixToMask(prefix) { return intToIp(prefixToMaskInt(prefix)); }

  function clampPrefix(p) {
    let n = Number(p);
    if (!isFinite(n)) n = 24;
    n = Math.round(n);
    return Math.max(0, Math.min(32, n));
  }

  function maskIntToPrefix(maskInt) {
    const bin = (maskInt >>> 0).toString(2).padStart(32, '0');
    if (!/^1*0*$/.test(bin)) return null;
    return (bin.match(/1/g) || []).length;
  }

  function maskToPrefix(mask) {
    const n = ipToInt(mask);
    if (n === null) return null;
    return maskIntToPrefix(n);
  }

  function parseCidr(str) {
    if (typeof str !== 'string') return null;
    const m = str.trim().match(/^([0-9.]+)\s*\/\s*(\d{1,2})$/);
    if (!m) return null;
    const ip = ipToInt(m[1]);
    const prefix = Number(m[2]);
    if (ip === null || prefix < 0 || prefix > 32) return null;
    return { ip, prefix, ipStr: intToIp(ip), cidr: intToIp(ip & prefixToMaskInt(prefix)) + '/' + prefix };
  }

  function toBinary(ip) {
    const n = ipToInt(ip);
    if (n === null) return '';
    return [24, 16, 8, 0].map(s => ((n >>> s) & 255).toString(2).padStart(8, '0')).join('.');
  }

  function toBinaryMask(prefix) {
    const m = prefixToMaskInt(prefix);
    return [24, 16, 8, 0].map(s => ((m >>> s) & 255).toString(2).padStart(8, '0')).join('.');
  }

  /* ---------- clase / tipo de dirección ---------- */
  function ipClass(ip) {
    const n = ipToInt(ip);
    if (n === null) return '-';
    const first = (n >>> 24) & 255;
    if (first === 127) return 'Loopback';
    if (first < 128) return 'A';
    if (first < 192) return 'B';
    if (first < 224) return 'C';
    if (first < 240) return 'D (multicast)';
    return 'E (experimental)';
  }

  const PRIVATE_RANGES = [
    ['10.0.0.0', 8, 'Privada (RFC1918 · 10/8)'],
    ['172.16.0.0', 12, 'Privada (RFC1918 · 172.16/12)'],
    ['192.168.0.0', 16, 'Privada (RFC1918 · 192.168/16)'],
    ['100.64.0.0', 10, 'CGNAT (RFC6598)'],
    ['169.254.0.0', 16, 'Link-local (APIPA)'],
    ['127.0.0.0', 8, 'Loopback'],
    ['224.0.0.0', 4, 'Multicast'],
    ['0.0.0.0', 8, 'Este host / por defecto']
  ];

  function ipScope(ip) {
    const n = ipToInt(ip);
    if (n === null) return '-';
    for (const [base, prefix, label] of PRIVATE_RANGES) {
      const b = ipToInt(base);
      if (((n & prefixToMaskInt(prefix)) >>> 0) === (b >>> 0)) return label;
    }
    return 'Pública (enrutable en Internet)';
  }

  /* ---------- información de red ---------- */
  function netInfo(ipStr, prefix) {
    const ip = ipToInt(ipStr);
    if (ip === null) return null;
    prefix = clampPrefix(prefix);
    const mask = prefixToMaskInt(prefix);
    const wildcard = (~mask) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    const total = Math.pow(2, 32 - prefix);
    let usable, first, last;
    if (prefix === 32) { usable = 1; first = last = network; }
    else if (prefix === 31) { usable = 2; first = network; last = broadcast; }
    else { usable = total - 2; first = network + 1; last = broadcast - 1; }

    return {
      ip: intToIp(ip),
      prefix,
      cidr: intToIp(network) + '/' + prefix,
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      mask: intToIp(mask),
      wildcard: intToIp(wildcard),
      firstHost: intToIp(first),
      lastHost: intToIp(last),
      total,
      usable,
      klass: ipClass(ipStr),
      scope: ipScope(ipStr),
      binIp: toBinary(ipStr),
      binMask: toBinaryMask(prefix),
      binNet: toBinary(intToIp(network)),
      isNetworkAddr: ip === network,
      isBroadcast: ip === broadcast,
      _networkInt: network,
      _broadcastInt: broadcast,
      _prefix: prefix
    };
  }

  function networkInt(ipStr, prefix) {
    const ip = ipToInt(ipStr);
    if (ip === null) return null;
    return (ip & prefixToMaskInt(prefix)) >>> 0;
  }

  function broadcastInt(ipStr, prefix) {
    const ip = ipToInt(ipStr);
    if (ip === null) return null;
    return ((ip & prefixToMaskInt(prefix)) | (~prefixToMaskInt(prefix) >>> 0)) >>> 0;
  }

  function sameSubnet(ipA, prefixA, ipB, prefixB) {
    if (ipToInt(ipA) === null || ipToInt(ipB) === null) return false;
    const pa = clampPrefix(prefixA), pb = clampPrefix(prefixB);
    if (pa !== pb) return false;
    return networkInt(ipA, pa) === networkInt(ipB, pb);
  }

  function ipInSubnet(ipStr, netStr, prefix) {
    const ip = ipToInt(ipStr);
    if (ip === null) return false;
    if (netStr && ipToInt(netStr) === null) {
      // admite "192.168.1.0/24"
      const c = parseCidr(netStr);
      if (!c) return false;
      return ipInSubnet(ipStr, intToIp(c.ip), c.prefix);
    }
    const m = prefixToMaskInt(prefix);
    return (ip & m) >>> 0 === ((ipToInt(netStr) & m) >>> 0);
  }

  /* ---------- listado de subredes ---------- */
  function subnets(baseIp, basePrefix, newPrefix, limit) {
    basePrefix = clampPrefix(basePrefix);
    newPrefix = clampPrefix(newPrefix);
    limit = limit || 1024;
    if (newPrefix < basePrefix) return { error: 'El nuevo prefijo debe ser mayor o igual que el original (más específico).' };
    const base = networkInt(baseIp, basePrefix);
    if (base === null) return { error: 'Dirección de red no válida.' };
    const count = Math.pow(2, newPrefix - basePrefix);
    const size = Math.pow(2, 32 - newPrefix);
    const list = [];
    for (let i = 0; i < Math.min(count, limit); i++) {
      const net = base + i * size;
      const info = netInfo(intToIp(net), newPrefix);
      list.push(info);
    }
    return { list, count, truncated: count > limit };
  }

  /* ---------- VLSM ---------- */
  function vlsm(baseIp, basePrefix, reqs) {
    basePrefix = clampPrefix(basePrefix);
    const base = networkInt(baseIp, basePrefix);
    if (base === null) return { error: 'Dirección base no válida.' };
    const baseEnd = base + Math.pow(2, 32 - basePrefix) - 1;
    const sorted = reqs
      .filter(r => r && Number(r.hosts) > 0)
      .map(r => ({ name: r.name || 'Subred', hosts: Number(r.hosts) }))
      .sort((a, b) => b.hosts - a.hosts);

    let cursor = base;
    const list = [];
    const errors = [];
    for (const r of sorted) {
      const needed = r.hosts + 2;
      const bits = Math.ceil(Math.log2(needed));
      let prefix = 32 - bits;
      if (prefix < basePrefix) {
        errors.push(`"${r.name}" (${r.hosts} hosts) no cabe en ${intToIp(base)}/${basePrefix}.`);
        continue;
      }
      const size = Math.pow(2, 32 - prefix);
      // alinear el cursor al tamaño del bloque
      if (cursor % size !== 0) cursor = Math.ceil(cursor / size) * size;
      const network = cursor;
      const info = netInfo(intToIp(network), prefix);
      if (network + size - 1 > baseEnd) {
        errors.push(`"${r.name}" (${r.hosts} hosts) se sale del rango base.`);
        continue;
      }
      info.name = r.name;
      info.requested = r.hosts;
      info.slack = info.usable - r.hosts;
      list.push(info);
      cursor = network + size;
    }
    return { list, errors, base: intToIp(base) + '/' + basePrefix, remaining: intToIp(cursor) + '/' + basePrefix };
  }

  /* ---------- utilidades de texto ---------- */
  function cidr(ip, prefix) {
    const n = networkInt(ip, prefix);
    if (n === null) return '';
    return intToIp(n) + '/' + clampPrefix(prefix);
  }

  function hostCountLabel(prefix) {
    prefix = clampPrefix(prefix);
    if (prefix === 32) return '1 dirección';
    if (prefix === 31) return '2 direcciones (enlace punto a punto)';
    return (Math.pow(2, 32 - prefix) - 2).toLocaleString('es-ES') + ' hosts útiles';
  }

  return {
    ipToInt, intToIp, isValidIp, prefixToMask, prefixToMaskInt, maskToPrefix, maskIntToPrefix,
    parseCidr, toBinary, toBinaryMask, ipClass, ipScope, netInfo, networkInt, broadcastInt,
    sameSubnet, ipInSubnet, subnets, vlsm, cidr, hostCountLabel, clampPrefix
  };
});
