#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const archivo = path.join(__dirname, '..', 'duelo-core.js');
const fuente = fs.readFileSync(archivo, 'utf8');
const contexto = { window:{}, console, setTimeout, clearTimeout };
vm.createContext(contexto);
vm.runInContext(fuente, contexto);
const core = contexto.window.DUELO_CORE;

assert.strictEqual(JSON.stringify(core.MODOS), JSON.stringify({ carrera:'Carrera multijugador', practica:'Práctica compartida' }));
assert.strictEqual(core.normalizarSala({ estado:'espera', modo:'carrera' }).estado, 'espera');
assert.strictEqual(core.normalizarSala({ estado:'anonimo', modo:'anonimo' }).estado, 'cerrada');
assert.strictEqual(core.esSalaUnible({ modo:'carrera', estado:'espera', visible:true, capacidad:30, jugadores:{ a:{} } }), true);
assert.strictEqual(core.esSalaUnible({ modo:'carrera', estado:'espera', visible:true, capacidad:2, jugadores:{ a:{}, b:{} } }), false);

const posiciones = core.calcularPosiciones({
  a:{ nombre:'Ana', prog:3, fin:12000 },
  b:{ nombre:'Beto', prog:4, fin:null },
  c:{ nombre:'Cris', prog:3, fin:10000 },
  d:{ nombre:'Dani', prog:1, fin:null }
});
assert.strictEqual(JSON.stringify(posiciones.map(x => x.uid)), JSON.stringify(['c', 'a', 'b', 'd']));

const plan = core.crearPlanAyudas({ ejemplo:'mkdir -p proyectos/web', pista:['Una pista genérica.'] });
assert.strictEqual(plan.duracionPista, 8000);
assert.strictEqual(JSON.stringify(plan.momentos), JSON.stringify([8000, 16000, 24000, 32000]));
assert(!plan.pistas.some(x => x.includes('mkdir -p proyectos/web')));

console.log('✓ core de salas, posiciones y pistas: 0 errores');
