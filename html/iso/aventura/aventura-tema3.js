/* Estación Boreal · prácticas y simulacro del 25 de noviembre. */
(function () {
  const inicio = fs => ({
    base: 'vacio',
    fs: Object.fromEntries(Object.entries(fs).map(([ruta, contenido]) => ['~/' + ruta, contenido]))
  });
  const salida = texto => ({ salida: texto });
  const practica = (id, titulo, pide, ejemplo, meta, pistas, explica, datos = [], aprendizaje) =>
    ({ id, tipo: 'practica', titulo, pide, ejemplo, meta, pistas, explica, datos, aprendizaje });
  const nivel = (id, titulo, comando, resumen, fs, html, ejemplo, ...practicas) => ({
    id, titulo, comando, resumen,
    rondas: [{ titulo, resumen, inicio: inicio(fs), pantallas: [
      { tipo: 'teoria', titulo: 'Antes de probar · ' + comando, html, ejemplo }, ...practicas
    ] }]
  });
  const pregunta = (titulo, fs, p) => ({ titulo, inicio: inicio(fs), pantallas: [p] });
  const parada = ({ titulo, pide, ejemplo, meta, pistas, explica, archivos = {}, datos = [], aprendizaje, guia, cwd, tmux, tmuxActiva }) => ({
    titulo, resumen: pide.replace(/<[^>]*>/g, ''),
    inicio: { ...inicio(archivos), cwd, tmux, tmuxActiva },
    pantallas: [{ ...practica('', titulo, pide, ejemplo, meta, pistas, explica, datos, aprendizaje), guia }]
  });

  const mundos = [
    {
      id: 'boreal-bosque', titulo: 'Bosque de rutas', resumen: 'Crea y localiza archivos.',
      lecciones: [
        nivel('boreal-carpetas', 'Campamento', 'mkdir · touch', 'Crea carpetas y ficheros.',
          {}, '<p><code>mkdir -p</code> crea una carpeta y sus niveles intermedios. <code>touch</code> crea un fichero vacío si aún no existe. Haz cada paso en una línea y comprueba el árbol con <code>tree</code>.</p>',
          ['mkdir -p refugio/mapas', 'touch refugio/mapas/ruta.txt', 'tree refugio'],
          practica('carpetas-1', 'Monta el campamento', 'Crea <code>base/mapas</code> dentro de tu carpeta personal.',
            'mkdir -p base/mapas', { directorios: '~/base/mapas' },
            ['Dibuja mentalmente la ruta: mapas va dentro de base.', 'mkdir -p crea también la carpeta intermedia.'],
            'La ruta contiene la carpeta superior y la subcarpeta. Puedes crearlas juntas o una a una.'),
          practica('carpetas-2', 'Deja el material listo', 'Dentro de <code>base</code>, crea la carpeta <code>partes</code> y, dentro, el fichero vacío <code>turno.txt</code>.',
            ['mkdir base/partes', 'touch base/partes/turno.txt'],
            { directorios: ['~/base/mapas', '~/base/partes'], contenido: { '~/base/partes/turno.txt': '' } },
            ['Comprueba dónde estás con pwd. Si escribes solo un nombre, se crea en la carpeta actual.',
              'Con tree ~ puedes ver si partes cuelga de base y si turno.txt quedó dentro de partes.'],
            'El fichero queda dentro de partes. Puedes comprobarlo con tree base.')),
        nivel('boreal-find', 'Sendero de archivos', 'find', 'Encuentra archivos por nombre, permisos o tamaño y prepara inventarios con los resultados.',
          { 'guia/a.log': '', 'guia/b.txt': '', 'zona/audio.txt': 'hola', 'zona/sub/mapa.txt': '', 'zona/copias.txt': 'dir', 'zona/sub/aviso.log': '' },
          '<p><code>find</code> empieza en la carpeta que le indiques. <code>-type f</code> elige ficheros, <code>-name</code> filtra el nombre y <code>-empty</code> pide que esté vacío. Pon el comodín entre comillas para que lo interprete find.</p>',
          "find guia -type f -name '*.log'",
          practica('find-1', 'Localiza los ficheros de texto', 'Usa <code>find</code> en <code>zona</code> para mostrar los ficheros <code>.txt</code>, incluidas las subcarpetas.',
            "find zona -type f -name '*.txt'", { lineas: ['zona/audio.txt', 'zona/sub/mapa.txt'] },
            ['Hay una carpeta con nombre terminado en .txt. El tipo importa.', 'Combina -type f con -name y un comodín entre comillas.'],
            'find baja a subcarpetas automáticamente. El filtro de tipo evita incluir una carpeta que termine igual.', [], { comando: 'find' }),
          practica('find-2', 'Encuentra el mapa vacío', 'En <code>zona</code>, muestra con <code>find</code> solo los ficheros <code>.txt</code> vacíos.',
            "find zona -type f -name '*.txt' -empty", { lineas: ['zona/sub/mapa.txt'] },
            ['Mantén la búsqueda anterior y añade una condición.', 'La opción -empty pide un fichero vacío.'],
            'find exige las tres condiciones a la vez: fichero normal, nombre .txt y contenido vacío.', [], { comando: 'find' }))
      ]
    },
    {
      id: 'boreal-humedal', titulo: 'Humedal de señales', resumen: 'Filtra líneas y saca coincidencias.',
      lecciones: [
        nivel('boreal-grep', 'Puesto de radio', 'grep', 'Filtra, cuenta y numera líneas.',
          { 'sala.txt': 'Norte listo\nsur abierto\nnorte cerrado\n', 'radio.log': 'INFO listo\nAviso: viento\nERROR: sonda\naviso: señal\nINFO fin\n' },
          '<p><code>grep TEXTO FICHERO</code> muestra líneas completas. <code>-i</code> ignora mayúsculas, <code>-n</code> numera, <code>-c</code> cuenta líneas, <code>-v</code> invierte la selección y <code>-F</code> busca signos tal cual. Puedes juntar letras de opciones, como <code>-in</code>.</p>',
          "grep -in 'norte' sala.txt",
          practica('grep-1', 'Cuenta los avisos', 'En <code>radio.log</code>, cuenta las líneas que contienen <code>aviso</code>, sin distinguir mayúsculas y minúsculas.',
            "grep -ic 'aviso' radio.log", salida('2'),
            ['Te piden un número, no las líneas.', 'Combina -i para mayúsculas y -c para contar.'],
            'grep cuenta cada línea que contiene aviso, aunque la primera letra sea mayúscula.', ['radio.log'], { comando: 'grep' }),
          practica('grep-2', 'Limpia el parte de radio', 'En <code>radio.log</code>, muestra todas las líneas que <strong>no</strong> contienen <code>INFO</code>. Incluye su número original.',
            "grep -vn 'INFO' radio.log", salida('2:Aviso: viento\n3:ERROR: sonda\n4:aviso: señal'),
            ['Primero piensa qué líneas quieres descartar.', 'Usa -v para invertir el filtro y -n para ver el número.'],
            'El número corresponde a la posición original, antes de quitar las líneas con INFO.', ['radio.log'], { comando: 'grep' })),
        nivel('boreal-regex', 'Baliza de cifras', 'grep -E', 'Clases POSIX, repeticiones y coincidencias.',
          { 'pilotos.txt': 'A-10\nB-2\nA-5x\n', 'claves.txt': '071\n54\n810\n91A\n22 23\n', 'partes.txt': 'subida 12m\nviento 305km\nsin datos\n' },
          '<p><code>grep -E</code> activa la sintaxis extendida. <code>[[:digit:]]</code> reconoce un dígito; <code>{2}</code> pide dos seguidos y <code>+</code> pide uno o más. <code>^</code> y <code>$</code> indican inicio y final. <code>-o</code> saca solo el trozo encontrado; <code>-x</code> pide toda la línea. Dentro de la expresión, <code>|</code> significa «o».</p>',
          "grep -E '^A-[[:digit:]]{2}$' pilotos.txt",
          practica('regex-1', 'Encuentra las claves de tres cifras', 'Con <code>grep -E</code> y <code>[[:digit:]]</code>, muestra las líneas de <code>claves.txt</code> que contienen exactamente tres cifras y nada más.',
            "grep -E '^[[:digit:]]{3}$' claves.txt", salida('071\n810'),
            ['Describe un dígito y pide que aparezca tres veces seguidas.', 'Pon límites de línea con ^ y $, o usa -x.'],
            'Las filas con letras, espacios o una cantidad diferente de cifras quedan fuera.', ['claves.txt'], { comando: 'grep', opciones: ['-E'], contiene: '[[:digit:]]' }),
          practica('regex-2', 'Extrae las medidas', 'Con la sintaxis extendida de grep, extrae solo los grupos de cifras de <code>partes.txt</code>. Las palabras y unidades deben quedar fuera.',
            "grep -Eo '[[:digit:]]+' partes.txt", salida('12\n305'),
            ['Quieres un trozo de cada línea, no la línea entera.', 'Combina -o con una clase de dígitos y el signo +.'],
            '-o muestra solo lo que encuentra. El + une las cifras seguidas en un grupo.', ['partes.txt'], { comando: 'grep', opciones: ['-E'] }))
      ]
    },
    {
      id: 'boreal-taller', titulo: 'Taller del viaducto', resumen: 'Trabaja con campos y números.',
      lecciones: [
        nivel('boreal-cut', 'Mesa de columnas', 'cut', 'Extrae campos con un separador.',
          { 'muestra.txt': 'faro:12\npuente:3\n', 'turnos.txt': 'Ada:norte:8\nIvo:sur:12\nSol:este:7\n' },
          '<p><code>cut -d</code> dice qué signo separa las columnas. <code>-f</code> elige por número. Cuenta desde 1; usa una coma para elegir columnas separadas.</p>',
          "cut -d ':' -f2 muestra.txt",
          practica('cut-1', 'Saca la lista de nombres', 'Muestra solo los nombres de <code>turnos.txt</code>. Son la primera columna y los campos se separan por <code>:</code>.',
            "cut -d ':' -f1 turnos.txt", salida('Ada\nIvo\nSol'),
            ['El separador es el signo que hay entre los datos.', 'Indica : con -d y el número de columna con -f.'],
            'cut lee cada fila y conserva únicamente la primera columna.', ['turnos.txt'], { comando: 'cut' }),
          practica('cut-2', 'Prepara el panel de turnos', 'De <code>turnos.txt</code>, muestra el nombre y la hora, conservando los dos puntos entre ambos.',
            "cut -d ':' -f1,3 turnos.txt", salida('Ada:8\nIvo:12\nSol:7'),
            ['La zona ocupa la columna de en medio y no debe salir.', 'Con -f puedes pedir dos números separados por coma.'],
            'Pedir 1 y 3 deja fuera la columna 2 y conserva el separador.', ['turnos.txt'], { comando: 'cut' })),
        nivel('boreal-awk', 'Báscula de carga', 'awk', 'Compara números y elige columnas.',
          { 'muestra.txt': 'mar:4\nlago:9\n', 'carga.txt': 'pino:3\nacero:12\nvidrio:8\n' },
          '<p>En <code>awk</code>, <code>-F</code> indica el separador. <code>$1</code> es la primera columna y <code>$2</code> la segunda. Puedes escribir una condición antes de <code>{print ...}</code> para imprimir solo las filas que la cumplan.</p>',
          "awk -F ':' '$2 >= 5 {print $1}' muestra.txt",
          practica('awk-1', 'Enseña nombre y peso', 'Usa <code>awk</code> para mostrar el nombre y el peso de cada fila de <code>carga.txt</code>, separados por un espacio.',
            "awk -F ':' '{print $1,$2}' carga.txt", salida('pino 3\nacero 12\nvidrio 8'),
            ['Primero dile a awk cómo se separan los campos de entrada.', 'En print, la coma entre $1 y $2 pone un espacio en la salida.'],
            'La entrada se divide con dos puntos y print muestra ambas columnas con un espacio.', ['carga.txt'], { comando: 'awk' }),
          practica('awk-2', 'Elige la carga pesada', 'Muestra solo los nombres de <code>carga.txt</code> con peso de <strong>8 o más</strong>.',
            "awk -F ':' '$2 >= 8 {print $1}' carga.txt", salida('acero\nvidrio'),
            ['Comparas la segunda columna, pero muestras la primera.', 'Escribe la condición antes de print. >= incluye el 8.'],
            'La condición se prueba fila a fila. La acción print se ejecuta solo si se cumple.', ['carga.txt'], { comando: 'awk' })),
        nivel('boreal-sort', 'Andén de cargas', 'sort', 'Ordena números y columnas.',
          { 'muestra.txt': 'oeste:4\neste:12\n', 'pesos.txt': '10\n2\n30\n', 'envios.txt': 'caja:20\nbobina:5\ntubo:11\n' },
          '<p><code>sort</code> ordena texto. <code>-n</code> compara números y <code>-r</code> invierte el orden. Si hay columnas, <code>-t</code> indica el separador y <code>-k2,2</code> elige solo la segunda. Puedes escribir <code>-k2,2n</code> para comparar esa columna como número.</p>',
          "sort -t ':' -k2,2n muestra.txt",
          practica('sort-1', 'Ordena los pesos', 'Muestra los pesos de <code>pesos.txt</code> de menor a mayor.',
            'sort -n pesos.txt', salida('2\n10\n30'),
            ['Ordena por valor, no por la primera cifra.', 'La opción -n activa la comparación numérica.'],
            'Como número, 2 va antes que 10. Ordenando como texto, no.', ['pesos.txt'], { comando: 'sort' }),
          practica('sort-2', 'Da prioridad al envío pesado', 'Ordena las filas completas de <code>envios.txt</code> por el peso, que es la segunda columna. Empieza por el peso mayor.',
            "sort -t ':' -k2,2nr envios.txt", salida('caja:20\ntubo:11\nbobina:5'),
            ['Conservas toda la fila, pero decides el orden mirando una sola columna.', 'Combina el separador, la segunda columna, la n numérica y la r inversa.'],
            'El peso manda, pero el nombre sigue en cada fila.', ['envios.txt'], { comando: 'sort' }))
      ]
    },
    {
      id: 'boreal-cumbre', titulo: 'Cumbre Boreal', resumen: 'Edita texto, archivos y sesiones.',
      lecciones: [
        nivel('boreal-sed', 'Imprenta de partes', 'sed', 'Sustituye texto y selecciona líneas.',
          { 'demo.txt': 'viejo viejo\noriginal\n', 'estado.txt': 'rojo rojo\nverde rojo\n', 'parte.txt': 'Norte\nSur\nEste\nOeste\n' },
          '<p>La forma <code>s/viejo/nuevo/</code> cambia la primera aparición de cada línea. Una <code>g</code> al final cambia todas. Para ver líneas concretas, usa <code>-n</code> y <code>p</code>, como en <code>sed -n \'1,2p\' fichero</code>. La acción <code>d</code> quita líneas de la salida.</p>',
          "sed 's/viejo/nuevo/g' demo.txt",
          practica('sed-1', 'Corrige todas las señales', 'Muestra <code>estado.txt</code> cambiando cada <code>rojo</code> por <code>azul</code>. Conserva el archivo original.',
            "sed 's/rojo/azul/g' estado.txt", { salida: 'azul azul\nverde azul', contenido: { '~/estado.txt': 'rojo rojo\nverde rojo\n' } },
            ['En la primera línea hay dos apariciones de rojo.', 'Usa la forma s/buscar/cambiar/g. Guarda el original evitando -i.'],
            'La g cambia todas las apariciones. Sin -i el cambio se muestra en la terminal.', ['estado.txt'], { comando: 'sed' }),
          practica('sed-2', 'Lee el tramo del parte', 'Con <code>sed</code>, muestra solo las líneas 2 y 3 de <code>parte.txt</code>.',
            "sed -n '2,3p' parte.txt", salida('Sur\nEste'),
            ['Te piden un tramo por número de línea.', 'La coma indica el tramo. Usa -n para que solo se vea lo que marque p.'],
            '-n desactiva la impresión automática y p imprime las dos líneas elegidas.', ['parte.txt'], { comando: 'sed' })),
        nivel('boreal-rename', 'Archivo de la cumbre', 'rename', 'Previsualiza y cambia nombres en lote.',
          { 'muestras/demo.bak': 'demo', 'partes/uno.tmp': 'uno\n', 'partes/dos.tmp': 'dos\n', 'partes/nota.txt': 'sin cambios\n' },
          '<p><code>rename</code> de Perl cambia nombres usando <code>s/buscar/cambiar/</code>. Un punto literal se escribe <code>\\.</code> y <code>$</code> marca el final del nombre. <code>-n</code> muestra una vista previa. Tras revisarla, quita <code>-n</code> para aplicar el cambio.</p>',
          "rename -n 's/\\.bak$/.txt/' muestras/*.bak",
          practica('rename-1', 'Prueba el cambio de extensión', 'Previsualiza con <code>rename</code> el cambio de <code>.tmp</code> a <code>.log</code> en <code>partes</code>. Todavía no cambies los archivos. Puedes verlos con <code>ls partes</code>.',
            "rename -n 's/\\.tmp$/.log/' partes/*.tmp",
            { muestra: ['partes/uno.log', 'partes/dos.log'], noExiste: ['~/partes/uno.log', '~/partes/dos.log'], existe: ['~/partes/uno.tmp', '~/partes/dos.tmp'] },
            ['La vista previa tiene su propia opción.', 'Usa -n y limita la sustitución al final del nombre.'],
            'La terminal enseña los dos nombres nuevos, pero los ficheros siguen siendo .tmp.', [], { comando: 'rename', opciones: ['-n'] }),
          practica('rename-2', 'Aplica el cambio', 'Cambia de verdad los dos <code>.tmp</code> de <code>partes</code> a <code>.log</code>. Deja <code>nota.txt</code> como está.',
            "rename 's/\\.tmp$/.log/' partes/*.tmp",
            { noExiste: ['~/partes/uno.tmp', '~/partes/dos.tmp'], contenido: { '~/partes/uno.log': 'uno\n', '~/partes/dos.log': 'dos\n', '~/partes/nota.txt': 'sin cambios\n' } },
            ['Reutiliza la regla que acabas de probar.', 'Quita -n para que el cambio se aplique.'],
            'Cambió el nombre de los dos archivos. El contenido que tenían dentro se conserva.', [], { comando: 'rename' })),
        nivel('boreal-tmux', 'Observatorio', 'tmux', 'Gestiona sesiones, ventanas y divisiones de paneles.',
          {}, '<p><code>tmux new -s NOMBRE</code> crea una sesión. <code>tmux detach</code> la deja funcionando. <code>tmux ls</code> lista sesiones y <code>tmux attach -t NOMBRE</code> recupera una. Dentro de tmux real, <kbd>Ctrl+B</kbd> y después <kbd>d</kbd> desacopla; <kbd>%</kbd> divide lado a lado y <kbd>"</kbd> divide arriba y abajo. Aquí practicas con sesiones simuladas.</p>',
          ['tmux new -s ejemplo', 'tmux detach', 'tmux ls', 'tmux attach -t ejemplo'],
          practica('tmux-1', 'Abre el puesto de guardia', 'Crea una sesión de tmux llamada <code>guardia</code> y entra en ella.',
            'tmux new -s guardia', { tmux: { sesion: 'guardia', activa: 'guardia' } },
            ['Necesitas crear una sesión nueva y darle un nombre.', 'Usa la acción new y pasa el nombre con -s.'],
            'La sesión guardia queda creada y conectada.'),
          practica('tmux-2', 'Deja la sesión funcionando', 'Desacopla la sesión <code>guardia</code> y comprueba que sigue en la lista de sesiones.',
            ['tmux detach', 'tmux ls'], { tmux: { sesion: 'guardia', activa: null }, muestra: 'guardia:' },
            ['Primero sal sin terminar la sesión. Después pregunta qué sesiones quedan.', 'Usa detach para desacoplar y ls para listar.'],
            'La sesión sigue existiendo aunque la terminal ya no esté conectada a ella.', [], { comando: 'tmux' }))
      ]
    }
  ];

  // La primera parada conserva el identificador y el progreso de la ruta original.
  const campamento = mundos[0].lecciones[0];
  mundos[0].lecciones.splice(1, 0, nivel('boreal-touch', 'Depósito de cargas', 'touch', 'Crea ficheros y controla sus fechas.',
    {}, '<p><code>touch</code> crea un fichero vacío al indicar una ruta que no existe. Si ya existe, conserva sus datos y actualiza la fecha.</p>',
    ['touch registro.txt', 'ls registro.txt'],
    practica('touch-1', 'Prepara la hoja de salida', 'Crea un fichero vacío <code>salida.txt</code> en tu carpeta personal.',
      'touch salida.txt', { contenido: { '~/salida.txt': '' } },
      ['Aquí debes crear un fichero, no una carpeta.', 'touch solo necesita el nombre.'],
      'El fichero ya se puede abrir o rellenar.')));
  campamento.comando = 'mkdir';
  const bancos = window.BOREAL_BANCOS || {};
  for (const mundo of mundos) {
    for (const leccion of mundo.lecciones) {
      const nuevas = bancos[leccion.id]?.({ parada }) || [];
      nuevas.forEach((ronda, i) => {
        ronda.pantallas[0].id = leccion.id + '-' + (i + 2);
      });
      leccion.rondas.push(...nuevas);
    }
  }

  // Cada pregunta tiene sus propios datos y puede hacerse sin las anteriores.
  const reg = { comando: 'grep', opciones: ['-E'], contiene: '[[:digit:]]' };
  const simulacro = [
    pregunta('Carpetas de entrega', {}, practica('s01', 'Carpetas de entrega', 'Crea <code>examen/entrada</code> y <code>examen/salida</code> en tu carpeta personal.',
      'mkdir -p examen/entrada examen/salida', { directorios: ['~/examen/entrada', '~/examen/salida'] }, [], 'Puedes pasar las dos rutas a mkdir o crearlas por separado.')),
    pregunta('Árbol y fichero', {}, practica('s02', 'Árbol y fichero', 'Crea <code>proyecto/datos</code> y, dentro, un fichero vacío llamado <code>lista.txt</code>.',
      ['mkdir -p proyecto/datos', 'touch proyecto/datos/lista.txt'], { directorios: '~/proyecto/datos', contenido: { '~/proyecto/datos/lista.txt': '' } }, [], 'Primero crea la carpeta, luego el fichero.')),
    pregunta('Buscar por extensión', { 'archivo/a.csv': '', 'archivo/sub/b.csv': '', 'archivo/c.txt': '' }, practica('s03', 'Buscar por extensión', 'Busca con <code>find</code> los ficheros <code>.csv</code> dentro de <code>archivo</code> y sus subcarpetas.',
      "find archivo -type f -name '*.csv'", { lineas: ['archivo/a.csv', 'archivo/sub/b.csv'] }, [], 'Filtra por tipo de archivo y por nombre.', [], { comando: 'find' })),
    pregunta('Buscar vacíos', { 'zona/a.txt': '', 'zona/b.txt': 'datos', 'zona/vacia': 'dir' }, practica('s04', 'Buscar vacíos', 'Muestra con <code>find</code> únicamente los ficheros vacíos de <code>zona</code>.',
      'find zona -type f -empty', { lineas: ['zona/a.txt'] }, [], 'Combina -type f con -empty.', [], { comando: 'find' })),
    pregunta('Contar coincidencias', { 'alertas.log': 'aviso uno\nOK\nAVISO dos\nOK\n' }, practica('s05', 'Contar coincidencias', 'Cuenta las líneas de <code>alertas.log</code> que contienen <code>aviso</code>, sin distinguir mayúsculas.',
      "grep -ic 'aviso' alertas.log", salida('2'), [], '-i ignora mayúsculas y -c cuenta líneas.', ['alertas.log'], { comando: 'grep' })),
    pregunta('Numerar coincidencias', { 'control.log': 'OK\nruido\nOK\nERROR\n' }, practica('s06', 'Numerar coincidencias', 'Muestra las líneas de <code>control.log</code> que no contienen <code>OK</code>, con sus números de línea.',
      "grep -vn 'OK' control.log", salida('2:ruido\n4:ERROR'), [], '-v invierte la búsqueda y -n añade el número original.', ['control.log'], { comando: 'grep' })),
    pregunta('Cuatro dígitos', { 'codigos.txt': '0241\n517\nA321\n0030\n12345\n' }, practica('s07', 'Cuatro dígitos', 'Con <code>grep -E</code> y <code>[[:digit:]]</code>, muestra las líneas de <code>codigos.txt</code> que sean exactamente cuatro cifras.',
      "grep -E '^[[:digit:]]{4}$' codigos.txt", salida('0241\n0030'), [], 'El cuantificador pide cuatro cifras y las anclas delimitan la línea.', ['codigos.txt'], reg)),
    pregunta('Extraer cifras', { 'medidas.txt': '11km\nsin datos\naltitud 650m\n' }, practica('s08', 'Extraer cifras', 'Extrae de <code>medidas.txt</code> solo los grupos de cifras con <code>grep -E</code> y <code>[[:digit:]]</code>.',
      "grep -Eo '[[:digit:]]+' medidas.txt", salida('11\n650'), [], '-o saca el trozo encontrado y + junta cifras seguidas.', ['medidas.txt'], reg)),
    pregunta('Dos comienzos', { 'rutas.txt': 'norte: 3\nsur: 9\neste: 7\nprenorte: 1\n' }, practica('s09', 'Dos comienzos', 'Usa <code>grep -E</code> para mostrar líneas de <code>rutas.txt</code> que empiecen por <code>norte:</code> o <code>sur:</code>.',
      "grep -E '^(norte|sur):' rutas.txt", salida('norte: 3\nsur: 9'), [], 'Agrupa las alternativas para aplicar el inicio a ambas.', ['rutas.txt'], { comando: 'grep', opciones: ['-E'] })),
    pregunta('Extraer un campo', { 'cuentas.txt': 'ana:4:norte\nleo:9:sur\n' }, practica('s10', 'Extraer un campo', 'Con <code>cut</code>, muestra solo la tercera columna de <code>cuentas.txt</code>. El separador es <code>:</code>.',
      "cut -d ':' -f3 cuentas.txt", salida('norte\nsur'), [], '-d elige el separador y -f3 elige la tercera columna.', ['cuentas.txt'], { comando: 'cut' })),
    pregunta('Elegir dos campos', { 'rutas.txt': '1:tren:norte\n2:bus:sur\n' }, practica('s11', 'Elegir dos campos', 'Usa <code>cut</code> para mostrar las columnas 1 y 3 de <code>rutas.txt</code>, separadas por dos puntos.',
      "cut -d ':' -f1,3 rutas.txt", salida('1:norte\n2:sur'), [], 'La coma elige las columnas 1 y 3 y deja fuera la 2.', ['rutas.txt'], { comando: 'cut' })),
    pregunta('Filtrar por valor', { 'cajas.txt': 'oro:12\ncobre:3\nplata:10\n' }, practica('s12', 'Filtrar por valor', 'Con <code>awk</code>, muestra los nombres de <code>cajas.txt</code> cuyo peso sea 10 o más.',
      "awk -F ':' '$2 >= 10 {print $1}' cajas.txt", salida('oro\nplata'), [], 'Compara el campo 2 e imprime el campo 1.', ['cajas.txt'], { comando: 'awk' })),
    pregunta('Orden numérico', { 'numeros.txt': '10\n3\n28\n' }, practica('s13', 'Orden numérico', 'Ordena los valores de <code>numeros.txt</code> del mayor al menor.',
      'sort -nr numeros.txt', salida('28\n10\n3'), [], '-n ordena números y -r invierte el orden.', ['numeros.txt'], { comando: 'sort' })),
    pregunta('Ordenar por campo', { 'vagones.txt': 'v1:11\nv2:2\nv3:27\n' }, practica('s14', 'Ordenar por campo', 'Ordena las filas completas de <code>vagones.txt</code> por el número de la segunda columna, de menor a mayor.',
      "sort -t ':' -k2,2n vagones.txt", salida('v2:2\nv1:11\nv3:27'), [], 'Elige el separador y ordena numéricamente solo por la columna 2.', ['vagones.txt'], { comando: 'sort' })),
    pregunta('Cambiar texto', { 'parte.txt': 'bajo bajo\nalto bajo\n' }, practica('s15', 'Cambiar texto', 'Con <code>sed</code>, muestra <code>parte.txt</code> cambiando cada <code>bajo</code> por <code>normal</code>. Conserva el original.',
      "sed 's/bajo/normal/g' parte.txt", { salida: 'normal normal\nalto normal', contenido: { '~/parte.txt': 'bajo bajo\nalto bajo\n' } }, [], 'La g cambia todas las apariciones de cada línea.', ['parte.txt'], { comando: 'sed' })),
    pregunta('Leer dos líneas', { 'parte.txt': 'uno\ndos\ntres\ncuatro\n' }, practica('s16', 'Leer dos líneas', 'Usa <code>sed</code> para mostrar solo las líneas 3 y 4 de <code>parte.txt</code>.',
      "sed -n '3,4p' parte.txt", salida('tres\ncuatro'), [], '-n deja que p elija qué líneas mostrar.', ['parte.txt'], { comando: 'sed' })),
    pregunta('Renombrar en lote', { 'a.bak': 'a', 'b.bak': 'b', 'nota.txt': 'nota' }, practica('s17', 'Renombrar en lote', 'Con <code>rename</code>, cambia la extensión <code>.bak</code> a <code>.txt</code> de <code>a.bak</code> y <code>b.bak</code>. Conserva sus contenidos.',
      "rename 's/\\.bak$/.txt/' *.bak", { noExiste: ['~/a.bak', '~/b.bak'], contenido: { '~/a.txt': 'a', '~/b.txt': 'b', '~/nota.txt': 'nota' } }, [], 'Sustituye el sufijo del nombre con rename.', [], { comando: 'rename' })),
    pregunta('Crear una sesión', {}, practica('s18', 'Crear una sesión', 'Crea una sesión de tmux llamada <code>repaso</code> y entra en ella.',
      'tmux new -s repaso', { tmux: { sesion: 'repaso', activa: 'repaso' } }, [], '-s elige el nombre de la nueva sesión.')),
    pregunta('Recuperar una sesión', {}, practica('s19', 'Recuperar una sesión', 'Ya existe una sesión desacoplada llamada <code>norte</code>. Vuelve a conectarte a ella con tmux.',
      'tmux attach -t norte', { tmux: { sesion: 'norte', activa: 'norte' } }, [], 'attach recupera la sesión que indiques con -t.')),
    pregunta('Filtrar y guardar', { 'parte.log': 'OK\nAVISO tren\nAVISO nieve\n' }, practica('s20', 'Filtrar y guardar', 'Crea la carpeta <code>entrega</code> y guarda en <code>entrega/avisos.txt</code> solo las líneas de <code>parte.log</code> que contengan <code>AVISO</code>.',
      ['mkdir entrega', "grep 'AVISO' parte.log > entrega/avisos.txt"], { directorios: '~/entrega', contenido: { '~/entrega/avisos.txt': 'AVISO tren\nAVISO nieve\n' } }, [], 'Crea primero la carpeta y guarda la salida del filtro con >.', ['parte.log']))
  ];
  simulacro[18].inicio.tmux = ['norte'];

  window.AVENTURA_TEMA3 = {
    version: 2, titulo: 'Atlas Boreal', practicaSinEjemplo: true, mundos, simulacro
  };
})();
