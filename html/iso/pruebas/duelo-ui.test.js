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
assert(duelo.includes('fondo.hidden = true'), 'la ventana de partida debe empezar cerrada');
assert(!/anonimo|Preguntas anónimas|MAX_PREGUNTAS/.test(duelo), 'no debe quedar el modo antiguo de preguntas anónimas');
assert(!/modo === ['"]web['"]/.test(duelo), 'no debe quedar el modo web antiguo');
assert(duelo.includes('d-mode-grid'), 'el menú debe presentar los modos como tarjetas');
assert(duelo.includes('d-settings') && duelo.includes("htmlFor = 'd-nombre'"), 'la configuración debe estar agrupada y etiquetada');
assert(duelo.includes('d-salas-cab') && duelo.includes('d-empty'), 'la lista de salas debe tener cabecera y estado vacío propio');
assert(duelo.includes('d-crear') && duelo.includes('d-unirse'), 'las acciones de crear y unirse deben diferenciarse visualmente');
assert(duelo.includes('act-fondo d-fondo') && duelo.includes('d-ventana'), 'la ventana del duelo debe tener una geometría propia');
assert(duelo.includes('setTimeout(pintarPartida, 200)'), 'la cuenta atrás debe repintar hasta mostrar el ejercicio');
assert(duelo.includes('d-mapa') && duelo.includes('mapaResumenHtml') && duelo.includes('mapaEjercicioHtml'), 'la partida online debe mostrar el contexto del ejercicio');
assert(duelo.includes('d-mapa-min'), 'el panel de estructura debe poder plegarse');
console.log('✓ interfaz multijugador: 0 errores');
