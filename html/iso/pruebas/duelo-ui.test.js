#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'linux-terminal.html'), 'utf8');
const duelo = fs.readFileSync(path.join(raiz, 'duelo.js'), 'utf8');
assert(html.indexOf('<script src="duelo-core.js"></script>') < html.indexOf('<script src="duelo.js"></script>'), 'el motor de salas debe cargarse antes del adaptador visual');
assert(duelo.includes("Carrera") || duelo.includes('MODOS'), 'el modo Carrera debe aparecer en el multijugador');
assert(duelo.includes('Práctica'), 'el modo Práctica debe aparecer en el multijugador');
assert(duelo.includes('MAX_JUGADORES = 30'), 'las salas deben admitir una clase completa');
assert(duelo.includes('crearRelojAyudas'), 'la interfaz debe usar el reloj común de pistas');
assert(duelo.includes('onDisconnect'), 'la sala debe limpiar participantes desconectados');
assert(!/anonimo|Preguntas anónimas|MAX_PREGUNTAS/.test(duelo), 'no debe quedar el modo antiguo de preguntas anónimas');
assert(!/modo === ['"]web['"]/.test(duelo), 'no debe quedar el modo web antiguo');
console.log('✓ interfaz multijugador: 0 errores');
