/* Cartografía y navegación visual del examen del 25. */
(function () {
  const tramos = ['Primeros pasos', 'Herramientas', 'Precisión', 'Combinaciones', 'Expedición'];
  const regiones = [
    { nombre: 'Bosque de rutas', x: 23, y: 73, codigo: 'BR', color: '#8fe1a4', escena: '22% 80%' },
    { nombre: 'Costa de señales', x: 20, y: 24, codigo: 'CS', color: '#82e6ef', escena: '20% 22%' },
    { nombre: 'Taller del viaducto', x: 69, y: 65, codigo: 'TV', color: '#f7bc74', escena: '72% 65%' },
    { nombre: 'Cumbre Boreal', x: 79, y: 23, codigo: 'CB', color: '#c4acff', escena: '95% 0%' }
  ];
  const puntos = [[15,22],[43,17],[73,23],[85,46],[56,49],[28,45],[15,73],[43,80],[74,76]];
  const iconos = {
    tren: '<path d="M7 17h10M8 22l2-3m6 3-2-3M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM5 10h14M9 14h.01m6 0h.01"/>',
    brujula: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    flecha: '<path d="M5 12h14m-5-5 5 5-5 5"/>'
  };
  const ico = n => '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + iconos[n] + '</svg>';
  const estilo = r => ' style="--atlas-acento:' + r.color + ';--escena:' + r.escena + '"';
  const coord = (x, y) => ' style="--x:' + x + '%;--y:' + y + '%"';
  const linea = puntos => '<svg class="av-atlas-linea" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="' +
    puntos.map(p => p.join(',')).join(' ') + '"/></svg>';

  function mapa({mundos, titulo, region, total, completadas, cuenta, enCurso, esc}) {
    const r = regiones[region], m = mundos[region];
    return '<div class="av-mapa av-atlas-boreal">' +
      '<header class="av-atlas-cab"><div><p class="av-atlas-ceja">' + ico('brujula') + ' EXAMEN DEL 25 DE NOVIEMBRE</p>' +
      '<h2 tabindex="-1" id="av-atlas-titulo">' + esc(titulo) + '</h2><p>Elige una región y abre la ruta del comando que quieras practicar.</p></div>' +
      '<div class="av-atlas-medidor"><span>PROGRESO TOTAL</span><b>' + completadas + ' <small>/ ' + total + '</small></b>' +
      '<progress aria-label="Paradas completadas" value="' + completadas + '" max="' + total + '"></progress></div></header>' +
      '<div class="av-atlas-tablero"><section class="av-atlas-territorio" aria-label="Regiones del archipiélago">' +
      '<div class="av-atlas-sello">' + ico('brujula') + '<span>ARCHIPIÉLAGO<br><b>BOREAL</b></span></div>' +
      regiones.map((a,i) =>
        '<div class="av-atlas-punto"' + coord(a.x,a.y) + '><button type="button" class="av-atlas-region" data-region="' + i +
        '" aria-pressed="' + (i === region) + '"' + estilo(a) + '><span>' + a.codigo + '</span><b>' + a.nombre + '</b></button></div>'
      ).join('') + '</section>' +
      '<section class="av-atlas-distritos" aria-labelledby="av-region-titulo"' + estilo(r) + '>' +
      '<p class="av-atlas-ceja">' + ico('tren') + ' REGIÓN ' + String(region + 1).padStart(2,'0') + '</p>' +
      '<h3 id="av-region-titulo">' + r.nombre + '</h3><p>' + esc(m.resumen) + '</p>' +
      '<ol>' + m.lecciones.map((l,j) => '<li><button type="button" data-distrito="' + j + '" aria-label="Abrir ruta de ' + esc(l.comando) +
        '"><span><b><code>' + esc(l.comando) + '</code></b><small>' + esc(l.titulo) + '</small></span>' +
        '<span class="av-atlas-cuentadistrito">' + cuenta(l.id) + '/' + l.rondas.length + '</span>' + ico('flecha') + '</button></li>').join('') +
      '</ol></section></div>' +
      '<section class="av-atlas-examen"><div class="av-atlas-examen-ico">' + ico('reloj') + '</div>' +
      '<div><p class="av-atlas-ceja">20 PREGUNTAS · 60 MIN</p><h3>Simulacro de examen</h3>' +
      '<p>Enunciados cortos con reloj y corrección al entregar.</p></div>' +
      '<button class="av-btn av-atlas-cta" type="button" id="av-simulacro">' + (enCurso ? 'Retomar simulacro' : 'Empezar simulacro') + ' ' + ico('flecha') + '</button></section>' +
      '<div class="av-atlas-herramientas"><button class="av-btn av-btn--fantasma" type="button" id="av-seguir">Próxima parada pendiente</button>' +
      '<button class="av-btn av-btn--fantasma" type="button" id="av-elegir-examen">Cambiar de examen</button>' +
      '<button class="av-btn av-btn--fantasma" type="button" id="av-stats">Estadísticas</button>' +
      '<button class="av-btn av-btn--fantasma" type="button" id="av-glosario">Glosario</button></div>';
  }

  function distrito({def, region, tramo, hechas, siguiente, esc}) {
    const r = regiones[region], inicio = tramo * 9;
    const fragmento = def.rondas.slice(inicio,inicio+9);
    const paradas = fragmento.map((ronda,k) => {
      const n = inicio + k, [x,y] = puntos[k], completa = hechas.has(n);
      return '<li class="av-cartografia-punto"' + coord(x,y) + '><button type="button" data-parada="' + n +
        '" class="av-cartografia-parada' + (completa ? ' is-done' : n === siguiente ? ' is-next' : '') +
        '" aria-label="Parada ' + (n + 1) + '. ' + esc(ronda.titulo) + (completa ? '. Completada' : '') + '"' +
        (n === siguiente ? ' aria-current="step"' : '') + '><span class="av-cartografia-num">' + (n + 1) + (completa ? ico('check') : '') +
        '</span><span class="av-cartografia-nombre">' + esc(ronda.titulo) + '</span></button></li>';
    }).join('');
    return '<div class="av-atlas-boreal av-cartografia"' + estilo(r) + '>' +
      '<div class="av-cartografia-miga"><button type="button" class="av-enlace" id="av-volver-atlas">← Volver al atlas</button><span>' + r.nombre + '</span></div>' +
      '<header class="av-atlas-cab"><div><p class="av-atlas-ceja">' + ico('tren') + ' <code>' + esc(def.comando) + '</code></p>' +
      '<h2 id="av-distrito-titulo" tabindex="-1">' + esc(def.titulo) + '</h2><p>' + esc(def.resumen) + '</p></div>' +
      '<div class="av-atlas-medidor"><span>PARADAS SUPERADAS</span><b>' + hechas.size + ' <small>/ ' + def.rondas.length + '</small></b>' +
      '<progress aria-label="Paradas del distrito completadas" value="' + hechas.size + '" max="' + def.rondas.length + '"></progress></div></header>' +
      '<nav class="av-cartografia-tramos" aria-label="Tramos de la ruta">' + tramos.map((t,k) => {
        const bloques = def.rondas.slice(k*9,(k+1)*9);
        const cuenta = bloques.filter((_,i) => hechas.has(k*9+i)).length;
        return '<button type="button" data-tramo="' + k + '" aria-pressed="' + (k === tramo) +
          '"><span>' + String(k+1).padStart(2,'0') + '</span><b>' + t + '</b><small>' + cuenta + '/' + bloques.length + '</small></button>';
      }).join('') + '</nav>' +
      '<section class="av-cartografia-terreno" aria-label="Paradas del tramo ' + tramos[tramo] + '">' +
      '<div class="av-cartografia-sector"><span>TRAMO ' + String(tramo+1).padStart(2,'0') + '</span><b>' + tramos[tramo] + '</b></div>' +
      linea(puntos.slice(0,fragmento.length)) + '<ol>' + paradas + '</ol></section>' +
      '<div class="av-cartografia-pie"><p><span class="av-cartografia-leyenda"></span> Recomendada <span class="av-cartografia-leyenda is-done"></span> Completada</p>' +
      '<button type="button" class="av-btn av-atlas-cta" id="av-distrito-continuar">' + (siguiente < 0 ? 'Repasar desde la primera' : 'Continuar en la parada ' + (siguiente+1)) + ' ' + ico('flecha') + '</button></div></div>';
  }

  window.BOREAL_ATLAS = { mapa, distrito, tramos };
})();
