/* Utilidades puras del multijugador. No toca el DOM ni Firebase. */
(() => {
  'use strict';
  const MODOS = Object.freeze({ carrera:'Carrera multijugador', practica:'Práctica compartida' });
  const ESTADOS = new Set(['espera', 'cuenta-atras', 'jugando', 'terminada', 'cerrada']);
  const OPERADORES = new Set(['|', ';', '&&', '||', '>', '>>', '2>']);
  const tokenizar = linea => String(linea || '').match(/"(?:\\.|[^"\\])*"|'[^']*'|&&|\|\||2>|>>|[|;>]|\S+/g) || [];
  const normal = texto => String(texto || '').replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
  const ejemploCompleto = paso => normal(paso && paso.ejemplo);

  function normalizarSala(sala){
    const s = { ...(sala || {}) };
    if (!MODOS[s.modo] || !ESTADOS.has(s.estado)) return { ...s, estado:'cerrada' };
    s.capacidad = Math.min(30, Math.max(2, Number(s.capacidad) || 20));
    s.jugadores = typeof s.jugadores === 'number' ? s.jugadores : (s.jugadores && typeof s.jugadores === 'object' ? s.jugadores : {});
    return s;
  }

  function crearConfiguracionSala(modo, ids, capacidad){
    if (!MODOS[modo]) throw new Error('Modo de sala no válido');
    return { modo, ids:[].concat(ids || []).filter(Boolean), capacidad:Math.min(30, Math.max(2, Number(capacidad) || 20)), estado:'espera', visible:true };
  }

  function numeroJugadores(sala){
    if (typeof sala.jugadores === 'number') return sala.jugadores;
    return Object.keys(sala.jugadores || {}).length;
  }

  function esSalaUnible(sala){
    const s = normalizarSala(sala);
    return s.estado === 'espera' && s.visible !== false && numeroJugadores(s) < s.capacidad;
  }

  function calcularPosiciones(jugadores){
    return Object.entries(jugadores || {}).map(([uid, jugador]) => ({ uid, ...(jugador || {}) }))
      .sort((a, b) => {
        const aFin = Number.isFinite(a.fin), bFin = Number.isFinite(b.fin);
        if (aFin !== bFin) return aFin ? -1 : 1;
        if (aFin && a.fin !== b.fin) return a.fin - b.fin;
        return (b.prog || 0) - (a.prog || 0) || (a.nombre || '').localeCompare(b.nombre || '', 'es');
      });
  }

  function pistasContextuales(paso){
    const ejemplo = ejemploCompleto(paso), tokens = tokenizar(ejemplo), pistas = [];
    const añadir = texto => { if (texto && !pistas.includes(texto) && !texto.includes(ejemplo)) pistas.push(texto); };
    const comandos = tokens.filter(t => /^[a-z][a-z0-9.-]*$/.test(t));
    const primero = comandos[0] || 'comando';
    añadir('Empieza por el comando ' + primero + ' y completa sus argumentos.');
    const opciones = { '-p':'Usa la opción -p para crear también las carpetas intermedias.', '-w':'Usa -w para contar palabras.', '-l':'Usa -l para contar líneas.', '-d':'Indica con -d el delimitador de los campos.', '-f':'Indica con -f el campo que quieres extraer.', '-i':'Usa -i para ignorar mayúsculas y minúsculas.', '-n':'Usa -n para ordenar o contar numéricamente.', '-type':'Después de -type indica el tipo que buscas.', '-name':'Después de -name escribe el patrón del nombre.', '-user':'Después de -user indica el usuario propietario.' };
    tokens.forEach((t, i) => {
      if (!/^-[A-Za-z]/.test(t)) return;
      const siguiente = tokens[i + 1] && !OPERADORES.has(tokens[i + 1]) ? ' En este paso, el valor es ' + tokens[i + 1] + '.' : '';
      añadir((opciones[t] || 'Revisa la opción ' + t + '.') + siguiente);
    });
    const redir = tokens.findIndex(t => ['>', '>>', '2>'].includes(t));
    if (redir >= 0) añadir('Guarda ' + (tokens[redir] === '2>' ? 'los errores' : 'la salida') + ' con ' + tokens[redir] + ' en el fichero indicado.');
    if (tokens.includes('|')) añadir('Conecta los comandos con una tubería: la salida del primero entra en el siguiente.');
    const argumentos = tokens.filter((t, i) => !OPERADORES.has(t) && !/^-/.test(t) && !/^[a-z][a-z0-9.-]*$/.test(t) && !(tokens[i - 1] && /^-[A-Za-z]/.test(tokens[i - 1])));
    if (argumentos.length) añadir('La ruta o argumento que pide el paso es ' + argumentos[argumentos.length - 1] + '.');
    while (pistas.length < 3) añadir('Relaciona el comando con el objetivo concreto y revisa qué argumento falta.');
    return pistas.slice(0, 3);
  }

  function crearPlanAyudas(paso){
    const pistas = pistasContextuales(paso);
    return { pistas, solucion: ejemploCompleto(paso), duracionPista:8000, momentos:[8000, 16000, 24000, 32000] };
  }

  function crearRelojAyudas(plan, callbacks, reloj){
    const r = reloj || window, ids = [];
    const iniciar = () => {
      plan.momentos.slice(0, 3).forEach((ms, i) => ids.push(r.setTimeout(() => callbacks.onPista(i), ms)));
      ids.push(r.setTimeout(() => callbacks.onSolucion(), plan.momentos[3]));
    };
    const cancelar = () => { ids.splice(0).forEach(id => r.clearTimeout(id)); };
    return { iniciar, cancelar };
  }

  window.DUELO_CORE = { MODOS, ESTADOS_SALA:[...ESTADOS], crearConfiguracionSala, normalizarSala, esSalaUnible, calcularPosiciones, crearPlanAyudas, crearRelojAyudas };
})();
