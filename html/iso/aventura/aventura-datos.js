/* =====================================================================
   AVENTURA GUIADA · CONTENIDO
   ---------------------------------------------------------------------
   Aquí solo hay texto y datos. No hay lógica: el motor está en aventura.js.

   Todo lo que se enseña sale de los apuntes del tema
   ("comandos basicos I"): mismos comandos, mismos ejemplos, explicados
   para quien nunca ha abierto una terminal.

   ESTRUCTURA
   ----------
   mundo → lección (un comando) → rondas → pantallas.

   Cada lección es un nodo del mapa y puede tener 1, 2 o 3 rondas.
   La primera ronda lleva la teoría; las siguientes son práctica con
   variantes y suben de dificultad. Cada ronda empieza con un mundo limpio
   (o con el que declare en "inicio") y termina con un test.

   Para comprobar que todo está bien escrito, sin abrir el navegador:
       node html/iso/pruebas/aventura.test.js

   TIPOS DE PANTALLA
   -----------------
   teoria:   { tipo:'teoria', titulo, html, ejemplo, mas? }
             "ejemplo" puede ser un comando o una lista de comandos.
             La salida se calcula de verdad al mostrarla: nunca miente.

   practica: { tipo:'practica', titulo, pide, ejemplo, meta, pista?, error? }
             El alumno escribe "ejemplo" y se comprueba con "meta",
             que usa el mismo vocabulario que las actividades:
             cwd, existe, noExiste, contenido, modo, muestra, noMuestra...

   test:     { tipo:'test', pregunta, opciones:[ { t, ok?, porque } ] }
             Exactamente una opción lleva ok:true.

   INICIO DEL MUNDO VIRTUAL
   ------------------------
   Cada lección o ronda puede traer "inicio": { cwd, fs, base }.
   base:'vacio' deja la carpeta personal vacía, para practicar sin miedo.
   ===================================================================== */
window.AVENTURA = {
  version: 2,
  titulo: 'Aventura Linux',

  mundos: [
    /* ================= MUNDO 1 · ORIENTARSE ================= */
    {
      id: 'orientarse',
      titulo: 'Orientarse',
      emoji: '🧭',
      resumen: 'Saber dónde estás, mirar a tu alrededor y moverte',
      lecciones: [

        {
          id: 'teclas-orientarse',
          titulo: 'Teclas básicas',
          resumen: 'Tab, Ctrl+L y flechas',
          comando: 'teclado',
          rondas: [
            {
              titulo: 'Moverte sin miedo',
              resumen: 'Los atajos que más vas a usar desde el primer día',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'La terminal también se maneja con teclas',
                  html: '<p>No hace falta escribir todo perfecto: la terminal te ayuda. <kbd>Tab</kbd> completa nombres, <kbd>Ctrl</kbd> + <kbd>L</kbd> limpia la pantalla y las flechas <kbd>↑</kbd> <kbd>↓</kbd> recuperan comandos anteriores.</p><p>Son las mismas teclas en cualquier Linux. Aprenderlas te ahorra tiempo y errores.</p>',
                  mas: '<p>Si algo se queda a medias, <kbd>Ctrl</kbd> + <kbd>C</kbd> cancela. Lo verás en el mundo 3.</p>'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Completar con Tab',
                  pide: 'Escribe <code>cd Doc</code> y pulsa <kbd>Tab</kbd> para que se complete el nombre de la carpeta.',
                  combo: { key: 'Tab' },
                  demo: {
                    antes: ['usuario@linux:~$ cd Doc▏'],
                    despues: ['usuario@linux:~$ cd Documentos/▏']
                  },
                  pista: 'Es la tecla de la izquierda, encima de Bloq Mayús.',
                  explica: 'Tab completa nombres de comandos, carpetas y ficheros. Si hay varias opciones, pulsa Tab dos veces para verlas.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Limpiar la pantalla',
                  pide: 'La pantalla está llena. Pulsa <kbd>Ctrl</kbd> + <kbd>L</kbd> para dejarla limpia sin borrar el historial.',
                  combo: { ctrl: true, key: 'l' },
                  demo: {
                    antes: ['usuario@linux:~$ ls -l', 'total 0', 'drwxr-xr-x 2 usuario usuario 4096 Documentos', 'usuario@linux:~$ ▏'],
                    despues: ['usuario@linux:~$ ▏']
                  },
                  pista: 'Ctrl + la letra de <i>clear</i>.',
                  explica: 'Ctrl+L limpia la vista, pero tus comandos siguen en el historial: puedes recuperarlos con ↑.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Recuperar el comando anterior',
                  pide: 'Pulsa <kbd>↑</kbd> para volver a poner el último comando que escribiste.',
                  combo: { key: 'ArrowUp' },
                  demo: {
                    antes: ['usuario@linux:~$ ls Documentos', 'usuario@linux:~$ ▏'],
                    despues: ['usuario@linux:~$ ls Documentos▏']
                  },
                  pista: 'Es la flecha hacia arriba.',
                  explica: 'Con ↑ y ↓ recorres el historial sin volver a escribir. Es uno de los atajos que más usarás.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Estás escribiendo <code>cd Doc</code> y quieres que se complete solo. ¿Qué tecla pulsas?',
                  opciones: [
                    { t: 'Tab', ok: true, porque: 'Tab completa nombres de comandos, carpetas y ficheros.' },
                    { t: 'Enter', porque: 'Enter ejecuta lo que hay escrito, no lo completa.' },
                    { t: 'Ctrl + L', porque: 'Ctrl+L limpia la pantalla.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'pwd',
          titulo: '¿Dónde estoy?',
          resumen: 'pwd',
          comando: 'pwd',
          rondas: [
            {
              titulo: 'Tu posición',
              resumen: 'El comando que te dice en qué carpeta estás',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'La terminal siempre está dentro de una carpeta',
                  html: '<p>Cuando abres la terminal, estás <b>dentro</b> de una carpeta. Todos los comandos que escribas se aplican ahí.</p><p>Por eso lo primero es saber dónde estás.</p>',
                  ejemplo: 'pwd',
                  mas: '<p><code>pwd</code> son las iniciales de <i>print working directory</i>: «imprime el directorio de trabajo».</p><p>La respuesta empieza por <code>/</code> porque es una <b>ruta absoluta</b>: el camino completo desde la raíz del sistema.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Compruébalo tú',
                  pide: 'Escribe el comando de arriba y pulsa Enter.',
                  ejemplo: 'pwd',
                  meta: { muestra: '/home/usuario' },
                  pista: 'Son tres letras: p, w y d.',
                  error: 'Casi. El comando que dice en qué carpeta estás es <code>pwd</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Tu carpeta personal se llama ~',
                  html: '<p><code>/home/usuario</code> es tu carpeta personal. En la terminal se escribe más corto con una virgulilla: <code>~</code>.</p><p>Son lo mismo: <code>cd ~</code> te lleva a tu carpeta.</p>',
                  ejemplo: ['cd ~', 'pwd'],
                  mas: '<p>La virgulilla solo funciona al principio de la ruta. Escribir <code>/~</code> es un error.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Entra en una carpeta',
                  pide: 'Entra en la carpeta <code>Documentos</code>.',
                  ejemplo: 'cd Documentos',
                  meta: { cwd: '~/Documentos' },
                  pista: 'El comando para cambiar de carpeta es <code>cd</code>, y la carpeta se llama <code>Documentos</code>.',
                  error: 'Casi. La carpeta se llama <code>Documentos</code>, con mayúscula y con todo escrito: no vale <code>doc</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué comando te dice en qué carpeta estás?',
                  opciones: [
                    { t: 'pwd', ok: true, porque: 'Correcto: <code>pwd</code> imprime la ruta de la carpeta actual.' },
                    { t: 'ls', porque: '<code>ls</code> lista lo que hay dentro, pero no dice dónde estás.' },
                    { t: 'cd', porque: '<code>cd</code> sirve para cambiar de carpeta, no para consultarla.' }
                  ]
                }
              ]
            },

            {
              titulo: 'La ruta por dentro',
              resumen: 'pwd y la variable $PWD',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'La misma ruta, dos formas de pedirla',
                  html: '<p>La shell guarda la carpeta actual en la variable <code>PWD</code>. Por eso <code>pwd</code> y <code>echo $PWD</code> dan la misma respuesta.</p>',
                  ejemplo: ['pwd', 'echo $PWD'],
                  mas: '<p><code>pwd</code> es un comando; <code>$PWD</code> es una variable. El resultado es el mismo camino absoluto.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Pregunta desde otra carpeta',
                  pide: 'Entra en una carpeta del sistema (por ejemplo <code>/usr/share</code>) y comprueba con <code>pwd</code> dónde estás.',
                  ejemplo: 'cd /usr/share; pwd',
                  meta: { cwdNoEs: '~', muestraCwd: true },
                  pista: 'Puedes cambiar de carpeta con <code>cd</code> y luego escribir <code>pwd</code>.',
                  error: 'Todavía no. Cambia de carpeta con <code>cd</code> y muestra la ruta con <code>pwd</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'La variable también lo sabe',
                  pide: 'Entra en otra carpeta y muestra su ruta con <code>echo $PWD</code>.',
                  ejemplo: 'cd /etc; echo $PWD',
                  meta: { cwdNoEs: '~', muestraCwd: true },
                  pista: 'Después de <code>cd</code>, escribe <code>echo $PWD</code>.',
                  error: 'Todavía no. Cambia de carpeta y muestra la ruta con <code>echo $PWD</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué contiene la variable <code>$PWD</code>?',
                  opciones: [
                    { t: 'La ruta de la carpeta en la que estás.', ok: true, porque: 'Correcto: es la misma información que da <code>pwd</code>.' },
                    { t: 'La lista de ficheros de la carpeta.', porque: 'Eso lo enseña <code>ls</code>.' },
                    { t: 'La contraseña del usuario.', porque: '<code>PWD</code> significa <i>print working directory</i>; no tiene nada que ver con contraseñas.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'ls',
          titulo: 'Mirar qué hay',
          resumen: 'ls',
          comando: 'ls',
          rondas: [
            {
              titulo: 'Lo básico',
              resumen: 'Listar el contenido de una carpeta',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Ver el contenido de una carpeta',
                  html: '<p><code>ls</code> lista lo que hay en la carpeta donde estás. No cambia nada: solo mira.</p>',
                  ejemplo: 'ls',
                  mas: '<p><code>ls</code> viene de <i>list</i>. Sin opciones enseña los nombres, uno detrás de otro.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mira tu carpeta personal',
                  pide: 'Lista lo que hay en tu carpeta personal.',
                  ejemplo: 'ls',
                  meta: { muestra: ['Descargas', 'Documentos'] },
                  pista: 'Son dos letras: l y s.',
                  error: 'Casi. Para listar lo que hay en la carpeta actual se usa <code>ls</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'También puedes mirar otra carpeta',
                  html: '<p>Si escribes una ruta detrás de <code>ls</code>, mira esa carpeta sin entrar en ella.</p>',
                  ejemplo: 'ls Descargas',
                  mas: '<p>Fíjate: sigues en tu carpeta personal. <code>ls</code> solo <b>mira</b>; para entrar se usa <code>cd</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mira Descargas',
                  pide: 'Lista el contenido de la carpeta <code>Descargas</code> sin entrar en ella.',
                  ejemplo: 'ls Descargas',
                  meta: { muestra: ['BinarioFH.pdf', '1-asir-contenido-main'] },
                  pista: 'Escribe <code>ls</code> y detrás el nombre de la carpeta.',
                  error: 'Casi. Sería <code>ls Descargas</code>. No hace falta <code>cd</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dos carpetas de una vez',
                  pide: 'Lista a la vez <code>Descargas</code> y <code>Documentos</code>.',
                  ejemplo: 'ls Descargas Documentos',
                  meta: { muestra: ['Descargas:', 'Documentos:'] },
                  pista: 'Puedes poner varias rutas separadas por espacios: <code>ls carpeta1 carpeta2</code>.',
                  error: 'Casi. Separa las dos carpetas con un espacio: <code>ls Descargas Documentos</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>ls</code>?',
                  opciones: [
                    { t: 'Lista el contenido de una carpeta.', ok: true, porque: 'Exacto: muestra nombres de ficheros y carpetas, sin cambiar nada.' },
                    { t: 'Cambia a otra carpeta.', porque: 'Para cambiar de carpeta se usa <code>cd</code>.' },
                    { t: 'Dice la ruta completa en la que estás.', porque: 'Eso lo hace <code>pwd</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Opciones que molan',
              resumen: 'Formato largo, ocultos, orden y subcarpetas',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/notas.txt': 'Notas del tema 1\n',
                  '~/apuntes.txt': 'Apuntes\n',
                  '~/carta.txt': 'Hola:\n',
                  '~/foto.png': 'PNG',
                  '~/.oculto': 'archivo oculto',
                  '~/Documentos/examen.txt': 'Examen\n',
                  '~/Documentos/tema1.txt': 'Tema 1\n',
                  '~/Descargas/instalador.deb': 'DEB'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Una letra cambia todo: -l',
                  html: '<p>La opción <code>-l</code> enseña el <b>formato largo</b>: permisos, propietario, tamaño, fecha y nombre.</p><p>Es la opción más completa de <code>ls</code>.</p>',
                  ejemplo: 'ls -l',
                  mas: '<p>Las opciones se escriben detrás del comando, con un guion delante: <code>ls -l</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Formato largo',
                  pide: 'Lista la carpeta actual en formato largo.',
                  ejemplo: 'ls -l',
                  meta: { muestra: ['notas.txt', 'apuntes.txt'] },
                  pista: 'Añade <code>-l</code> detrás de <code>ls</code>.',
                  error: 'Casi. Es <code>ls -l</code>, con un espacio antes del guion.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Los ficheros ocultos: -a',
                  html: '<p>Los ficheros que empiezan por punto, como <code>.oculto</code>, no salen con <code>ls</code>.</p><p>La opción <code>-a</code> los enseña todos.</p>',
                  ejemplo: 'ls -a',
                  mas: '<p>En Linux, «oculto» solo significa «empieza por punto». No hay nada secreto: es una convención.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Enseña los ocultos',
                  pide: 'Lista también los ficheros ocultos.',
                  ejemplo: 'ls -a',
                  meta: { muestra: '.oculto' },
                  pista: 'La opción de «todo» es <code>-a</code>.',
                  error: 'Casi. Con <code>ls -a</code> aparecen los que empiezan por punto.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Las opciones se pueden juntar',
                  html: '<p><code>-l</code> y <code>-h</code> a la vez se escriben <code>-lh</code>. También vale <code>-l -h</code>.</p><p><code>-h</code> enseña los tamaños en formato humano: KB, MB…</p>',
                  ejemplo: ['ls -lh', 'ls -l -h'],
                  mas: '<p>Se pueden mezclar opciones cortas y largas: <code>ls --all -l</code>. La opción larga de <code>-a</code> es <code>--all</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Tamaños legibles',
                  pide: 'Lista en formato largo con tamaños legibles.',
                  ejemplo: 'ls -lh',
                  meta: { muestra: 'notas.txt' },
                  pista: 'Junta <code>-l</code> y <code>-h</code> en una sola opción.',
                  error: 'Casi. Se escribe <code>ls -lh</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Ordenar y recorrer',
                  html: '<p><code>-t</code> ordena por fecha, primero lo más reciente. <code>-S</code> ordena por tamaño, primero lo más grande. <code>-r</code> invierte el orden.</p><p><code>-R</code> entra también en las subcarpetas.</p>',
                  ejemplo: ['ls -t', 'ls -lS', 'ls -R'],
                  mas: '<p><code>-r</code> no significa «recursivo»: significa <i>reverse</i>, dar la vuelta al orden. El recursivo es <code>-R</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Recursivo',
                  pide: 'Lista también lo que hay dentro de las subcarpetas.',
                  ejemplo: 'ls -R',
                  meta: { muestra: ['Documentos:', 'examen.txt'] },
                  pista: 'La opción recursiva es la mayúscula <code>-R</code>.',
                  error: 'Casi. Es <code>ls -R</code>. La minúscula <code>-r</code> solo invierte el orden.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué opción de <code>ls</code> ordena por tamaño, de mayor a menor?',
                  opciones: [
                    { t: '-S', ok: true, porque: 'Correcto: <code>-S</code> ordena por tamaño y pone primero los más grandes.' },
                    { t: '-t', porque: '<code>-t</code> ordena por fecha de modificación, no por tamaño.' },
                    { t: '-r', porque: '<code>-r</code> invierte el orden que ya había, no ordena por tamaño.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Leer ls -l',
              resumen: 'Qué significa cada columna del formato largo',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/proyecto': { tipo: 'dir', modo: '755' },
                  '~/proyecto/nota.txt': { contenido: 'hola\n', modo: '644' },
                  '~/enlace': { tipo: 'link', destino: '~/proyecto/nota.txt' }
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Ocho columnas, ocho pistas',
                  html: '<p>Cada línea de <code>ls -l</code> tiene esta forma:</p><p><code>-rw-r--r-- 1 usuario usuario 5 27 oct 00:00 nota.txt</code></p><p><b>1</b> tipo · <b>2</b> permisos · <b>3</b> enlaces · <b>4</b> propietario · <b>5</b> grupo · <b>6</b> tamaño · <b>7</b> fecha · <b>8</b> nombre.</p>',
                  ejemplo: 'ls -l',
                  mas: '<p>El tamaño está en <b>bytes</b>. La fecha es la de la última modificación.</p>'
                },
                {
                  tipo: 'teoria',
                  titulo: 'El primer carácter lo delata',
                  html: '<p>El primer carácter dice qué es:</p><p><code>-</code> fichero normal · <code>d</code> directorio · <code>l</code> enlace simbólico.</p>',
                  ejemplo: 'ls -l',
                  mas: '<p>Un enlace simbólico es como un acceso directo: apunta a otro fichero.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mira dentro del proyecto',
                  pide: 'Lista en formato largo el contenido de <code>proyecto</code>.',
                  ejemplo: 'ls -l proyecto',
                  meta: { muestra: ['nota.txt', '-rw-'] },
                  pista: 'Es <code>ls -l</code> y detrás la carpeta: <code>ls -l proyecto</code>.',
                  error: 'Casi. Escribe <code>ls -l proyecto</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'En <code>ls -l</code>, ¿qué significa que una línea empiece por <code>d</code>?',
                  opciones: [
                    { t: 'Que es un directorio.', ok: true, porque: 'Sí: <code>d</code> viene de <i>directory</i>, carpeta.' },
                    { t: 'Que es un fichero vacío.', porque: 'Un fichero normal empieza por guion (<code>-</code>).' },
                    { t: 'Que es un enlace simbólico.', porque: 'Los enlaces empiezan por <code>l</code>.' }
                  ]
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué permisos tiene <code>-rw-r--r--</code>?',
                  opciones: [
                    { t: 'El dueño lee y escribe; el grupo lee; los demás leen.', ok: true, porque: 'Correcto: <code>rw-</code> para el dueño, <code>r--</code> para grupo y <code>r--</code> para el resto.' },
                    { t: 'Todos pueden leer, escribir y ejecutar.', porque: 'Eso sería <code>-rwxrwxrwx</code>.' },
                    { t: 'Solo el dueño puede leerlo.', porque: 'El dueño puede leer y escribir, y el grupo y los demás también pueden leer.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Combinar y afinar',
              resumen: 'Opciones juntas, carpetas y orden por fecha',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/notas.txt': 'n\\n',
                  '~/foto.png': 'PNG',
                  '~/.oculto': 'oculto',
                  '~/Documentos/tema1.txt': 't1\\n',
                  '~/Descargas/instalador.deb': 'DEB'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Las opciones se suman',
                  html: '<p><code>ls -la</code> enseña el formato largo <b>y</b> los ocultos. <code>ls -ltr</code> ordena por fecha y le da la vuelta para dejar lo más reciente abajo.</p>',
                  ejemplo: ['ls -la', 'ls -ltr'],
                  mas: '<p>El orden de las letras no importa: <code>ls -la</code> y <code>ls -al</code> hacen lo mismo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Todo y con detalles',
                  pide: 'Lista en formato largo, incluyendo los ficheros ocultos.',
                  ejemplo: 'ls -la',
                  meta: { muestra: ['.oculto', '-rw-'] },
                  pista: 'Junta <code>-l</code> y <code>-a</code>.',
                  error: 'Casi. Sería <code>ls -la</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Mirar la carpeta, no su contenido: -d',
                  html: '<p>Con <code>ls -d */</code> solo ves las carpetas, sin entrar en ellas. La barra <code>/</code> del final filtra directorios.</p>',
                  ejemplo: ['ls -d */', 'ls -ld Documentos'],
                  mas: '<p><code>ls -d</code> sirve para ver los datos de una carpeta como si fuera un fichero, en vez de listar lo que tiene dentro.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo carpetas',
                  pide: 'Lista solo las carpetas de la carpeta actual.',
                  ejemplo: 'ls -d */',
                  meta: { muestra: ['Documentos/', 'Descargas/'], noMuestra: 'notas.txt' },
                  pista: 'Usa <code>ls -d */</code>.',
                  error: 'Casi. Sería <code>ls -d */</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>ls -lt</code>?',
                  opciones: [
                    { t: 'Ordena por fecha y deja primero lo más reciente.', ok: true, porque: 'Correcto: <code>-t</code> ordena por fecha y por defecto pone lo más nuevo primero.' },
                    { t: 'Lista solo los ficheros ocultos.', porque: 'Eso es <code>-a</code>.' },
                    { t: 'Entra en las subcarpetas.', porque: 'Eso es <code>-R</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'cd',
          titulo: 'Moverse',
          resumen: 'cd',
          comando: 'cd',
          rondas: [
            {
              titulo: 'Cambiar de carpeta',
              resumen: 'Entrar, salir y volver a casa',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'cd cambia de carpeta',
                  html: '<p><code>cd</code> viene de <i>change directory</i>. Detrás se escribe la carpeta a la que quieres ir.</p>',
                  ejemplo: ['cd Documentos', 'pwd'],
                  mas: '<p><code>cd</code> no muestra nada si todo va bien: en Linux, cuando un comando funciona, calla.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Entra en Documentos',
                  pide: 'Cambia a la carpeta <code>Documentos</code>.',
                  ejemplo: 'cd Documentos',
                  meta: { cwd: '~/Documentos' },
                  pista: 'Es <code>cd</code> y el nombre de la carpeta.',
                  error: 'Casi. Sería <code>cd Documentos</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Subir un nivel con ..',
                  html: '<p><code>..</code> significa «la carpeta de arriba».</p><p>Si estás en <code>~/Documentos</code>, <code>cd ..</code> te deja en <code>~</code>.</p>',
                  ejemplo: ['cd Documentos', 'cd ..', 'pwd'],
                  mas: '<p><code>.</code> es la carpeta actual y <code>..</code> la de arriba. Son dos entradas que existen en todos los directorios.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Sube un nivel',
                  pide: 'Estás en <code>Documentos</code>. Sube a la carpeta de arriba.',
                  ejemplo: 'cd ..',
                  meta: { cwd: '~' },
                  pista: 'Dos puntos seguidos de <code>cd</code>.',
                  error: 'Casi. Para subir un nivel se escribe <code>cd ..</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Volver a casa sin escribir la ruta',
                  html: '<p><code>cd</code> sin argumentos te devuelve a tu carpeta personal, <code>~</code>.</p><p><code>cd ~</code> hace exactamente lo mismo.</p>',
                  ejemplo: ['cd /etc', 'cd', 'pwd'],
                  mas: '<p>También puedes escribir <code>cd ~/Documentos</code> para ir directo a una carpeta de tu casa.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Entra en /etc',
                  pide: 'Entra en la carpeta <code>/etc</code> para cambiar de sitio.',
                  ejemplo: 'cd /etc',
                  meta: { cwd: '/etc' },
                  pista: 'Es una ruta absoluta: empieza por <code>/</code>.',
                  error: 'Casi. Escribe <code>cd /etc</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Vuelve a casa',
                  pide: 'Ahora vuelve a tu carpeta personal sin escribir la ruta.',
                  ejemplo: 'cd',
                  meta: { cwd: '~' },
                  pista: 'Escribe solo <code>cd</code> y pulsa Enter.',
                  error: 'Casi. Basta con <code>cd</code>, sin nada detrás.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>cd ..</code>?',
                  opciones: [
                    { t: 'Sube un nivel: va a la carpeta que contiene la actual.', ok: true, porque: 'Correcto: <code>..</code> es siempre la carpeta padre.' },
                    { t: 'Vuelve a tu carpeta personal.', porque: 'Para eso se usa <code>cd</code> sin argumentos o <code>cd ~</code>.' },
                    { t: 'Lista la carpeta actual.', porque: 'Eso lo hace <code>ls</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Rutas con cabeza',
              resumen: 'Absolutas, relativas, . y ~',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Dos formas de decir dónde',
                  html: '<p>Una ruta <b>absoluta</b> empieza por <code>/</code> y sirve desde cualquier sitio: <code>/etc</code>.</p><p>Una ruta <b>relativa</b> parte de donde estás: <code>Documentos</code>.</p>',
                  ejemplo: ['pwd', 'cd /etc', 'pwd'],
                  mas: '<p>Una ruta absoluta nunca lleva <code>.</code> ni <code>..</code>: es el camino completo desde la raíz.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Ve a /etc',
                  pide: 'Entra en la carpeta <code>/etc</code> usando su ruta absoluta.',
                  ejemplo: 'cd /etc',
                  meta: { cwd: '/etc' },
                  pista: 'Empieza la ruta por la barra: <code>/etc</code>.',
                  error: 'Casi. La ruta absoluta de esa carpeta es <code>/etc</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'El punto es «aquí mismo»',
                  html: '<p><code>cd .</code> no te mueve: significa «entra en la carpeta actual».</p><p>Se usa mucho para dejar claro que una ruta es relativa: <code>./Documentos/personal</code>.</p>',
                  ejemplo: ['cd /etc', 'cd .', 'pwd'],
                  mas: '<p><code>cd ./Documentos</code> y <code>cd Documentos</code> hacen lo mismo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Sube y baja',
                  pide: 'Estás en <code>/etc</code>. Sube a la raíz y entra en <code>usr</code>.',
                  ejemplo: 'cd ..; cd usr',
                  meta: { cwd: '/usr' },
                  pista: 'Primero <code>cd ..</code>, después <code>cd usr</code>. Puedes unirlos con punto y coma.',
                  error: 'Casi. Desde <code>/etc</code>: <code>cd ..</code> te lleva a <code>/</code> y <code>cd usr</code> a <code>/usr</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Rutas largas con ..',
                  html: '<p>Puedes encadenar <code>..</code> dentro de una ruta: desde <code>/usr/share</code>, <code>../../home/usuario</code> te lleva a tu carpeta.</p>',
                  ejemplo: ['cd /usr/share', 'cd ../../home/usuario', 'pwd'],
                  mas: '<p>Es más corto escribir <code>cd ~</code>, pero entender <code>..</code> te sirve para cualquier ruta.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Vuelve desde usr/share',
                  pide: 'Estás en <code>/usr/share</code>. Vuelve a tu carpeta personal con una ruta que use <code>..</code>.',
                  ejemplo: 'cd ../../home/usuario',
                  meta: { cwd: '~' },
                  pista: 'Desde <code>/usr/share</code> hay que subir dos niveles y entrar en <code>home/usuario</code>.',
                  error: 'Casi. Sería <code>cd ../../home/usuario</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Cuál de estas rutas es absoluta?',
                  opciones: [
                    { t: '/home/usuario/Documentos', ok: true, porque: 'Empieza por <code>/</code>: es el camino completo desde la raíz.' },
                    { t: 'Documentos/personal', porque: 'No empieza por <code>/</code>: es relativa a donde estés.' },
                    { t: '../usuario', porque: 'Empieza por <code>..</code>: también es relativa.' }
                  ]
                }
              ]
            },

            {
              titulo: 'La virgulilla manda',
              resumen: 'Rutas desde ~ y desde cualquier sitio',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: '~ siempre significa tu carpeta',
                  html: '<p>Una ruta que empieza por <code>~</code> funciona desde cualquier lugar: <code>cd ~/Documentos</code> te lleva a tu carpeta <code>Documentos</code> aunque estés en <code>/etc</code>.</p>',
                  ejemplo: ['cd /etc', 'cd ~/Documentos', 'pwd'],
                  mas: '<p><code>~</code> solo se expande al principio de la ruta. Escribir <code>Documentos/~</code> no hace lo que parece.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Entra en Descargas desde casa',
                  pide: 'Entra en tu carpeta <code>Descargas</code> usando <code>~</code>.',
                  ejemplo: 'cd ~/Descargas',
                  meta: { cwd: '~/Descargas' },
                  pista: 'Es <code>cd ~/Descargas</code>.',
                  error: 'Casi. Sería <code>cd ~/Descargas</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Una ruta, dos puntos de partida',
                  html: '<p><code>cd ../..</code> sube dos niveles contando desde donde estés. <code>cd ~/..</code> sube desde tu carpeta personal, así que acaba en <code>/home</code>.</p>',
                  ejemplo: ['cd /usr/share', 'cd ~/..', 'pwd'],
                  mas: '<p>Las rutas relativas dependen de dónde estés; las que empiezan por <code>/</code> o <code>~/</code> no.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'De /etc a Documentos',
                  pide: 'Entra en <code>/etc</code> y luego ve a <code>~/Documentos</code> en el mismo renglón.',
                  ejemplo: 'cd /etc; cd ~/Documentos',
                  meta: { cwd: '~/Documentos' },
                  pista: 'Une los dos comandos con <code>;</code>: <code>cd /etc; cd ~/Documentos</code>.',
                  error: 'Casi. Sería <code>cd /etc; cd ~/Documentos</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Estando en <code>/etc</code>, ¿a dónde lleva <code>cd ~/Documentos</code>?',
                  opciones: [
                    { t: 'A /home/usuario/Documentos.', ok: true, porque: 'Correcto: <code>~</code> es tu carpeta personal, estés donde estés.' },
                    { t: 'A /etc/Documentos.', porque: 'Eso pasaría con <code>cd Documentos</code>, sin la virgulilla.' },
                    { t: 'A /Documentos.', porque: '<code>~</code> no es la raíz; la raíz se escribe <code>/</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'tree',
          titulo: 'Ver el árbol',
          resumen: 'tree',
          comando: 'tree',
          inicio: {
            base: 'vacio',
            fs: {
              '~/proyecto': { tipo: 'dir' },
              '~/proyecto/nota.txt': 'hola\n',
              '~/proyecto/src': { tipo: 'dir' },
              '~/proyecto/src/main.c': 'int main(){}\n',
              '~/Documentos': { tipo: 'dir' },
              '~/Documentos/tema1.txt': 'Tema 1\n'
            }
          },
          rondas: [
            {
              titulo: 'El árbol completo',
              resumen: 'tree y su diferencia con ls -R',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'tree enseña la jerarquía',
                  html: '<p><code>tree</code> dibuja las carpetas y lo que contienen como un árbol. Es la forma más rápida de entender una estructura.</p>',
                  ejemplo: 'tree',
                  mas: '<p>Al final cuenta cuántos directorios y archivos ha encontrado.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dibuja el árbol',
                  pide: 'Muestra el árbol de la carpeta actual.',
                  ejemplo: 'tree',
                  meta: { muestra: ['proyecto', 'main.c'] },
                  pista: 'El comando es <code>tree</code>, sin nada más.',
                  error: 'Casi. Escribe <code>tree</code> y pulsa Enter.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'ls -R también baja, pero sin dibujo',
                  html: '<p><code>ls -R</code> recorre las subcarpetas y va poniendo cabeceras con el nombre de cada una. <code>tree</code> es más visual.</p>',
                  ejemplo: 'ls -R',
                  mas: '<p><code>tree</code> no viene instalado en todos los sistemas; en Ubuntu se instala con <code>apt install tree</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Recorre con ls',
                  pide: 'Muestra también el contenido de las subcarpetas con <code>ls</code>.',
                  ejemplo: 'ls -R',
                  meta: { muestra: ['proyecto:', 'main.c'] },
                  pista: 'La opción recursiva es <code>-R</code>, en mayúscula.',
                  error: 'Casi. Es <code>ls -R</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué comando enseña la estructura de carpetas como un árbol?',
                  opciones: [
                    { t: 'tree', ok: true, porque: 'Correcto: <code>tree</code> dibuja la jerarquía con líneas.' },
                    { t: 'ls -l', porque: '<code>ls -l</code> enseña detalles, pero solo del nivel actual.' },
                    { t: 'pwd', porque: '<code>pwd</code> solo dice en qué carpeta estás.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Árbol a medida',
              resumen: 'tree con ruta y desde otra carpeta',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/proyecto': { tipo: 'dir' },
                  '~/proyecto/nota.txt': 'hola\n',
                  '~/proyecto/src': { tipo: 'dir' },
                  '~/proyecto/src/main.c': 'int main(){}\n',
                  '~/Documentos/tema1.txt': 'Tema 1\n',
                  '~/Descargas/instalador.deb': 'DEB',
                  '/etc': { tipo: 'dir' },
                  '/etc/hostname': 'mi-equipo\n'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'tree también acepta una ruta',
                  html: '<p><code>tree Documentos</code> dibuja el árbol de esa carpeta sin cambiar la tuya. Es útil para revisar una estructura antes de tocarla.</p>',
                  ejemplo: ['tree Documentos', 'pwd'],
                  mas: '<p>Si la ruta no existe, <code>tree</code> avisa y no dibuja nada.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dibuja proyecto',
                  pide: 'Muestra el árbol de la carpeta <code>proyecto</code>.',
                  ejemplo: 'tree proyecto',
                  meta: { muestra: ['proyecto', 'main.c'] },
                  pista: 'Es <code>tree proyecto</code>.',
                  error: 'Casi. Sería <code>tree proyecto</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'El árbol de la raíz',
                  html: '<p>Con una ruta absoluta puedes mirar cualquier parte del sistema: <code>tree /etc</code> enseña la estructura de configuración sin moverte de casa.</p>',
                  ejemplo: ['tree /etc'],
                  mas: '<p>En un sistema real <code>tree /</code> puede tardar mucho: mejor pedir solo la carpeta que te interesa.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mira /etc',
                  pide: 'Muestra el árbol de <code>/etc</code> sin cambiar de carpeta.',
                  ejemplo: 'tree /etc',
                  meta: { muestra: ['etc', 'hostname'], cwd: '~' },
                  pista: 'Es <code>tree /etc</code>.',
                  error: 'Casi. Sería <code>tree /etc</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Después de <code>tree Documentos</code>, ¿dónde estás?',
                  opciones: [
                    { t: 'En la misma carpeta en la que estabas.', ok: true, porque: 'Correcto: <code>tree</code> solo mira, no entra ni cambia de sitio.' },
                    { t: 'Dentro de Documentos.', porque: 'Para entrar hay que usar <code>cd Documentos</code>.' },
                    { t: 'En la raíz del sistema.', porque: 'La ruta que se pasa a <code>tree</code> no cambia tu carpeta actual.' }
                  ]
                }
              ]
            }
          ]
        }

      ]
    },

    /* ================= MUNDO 2 · CREAR Y ORDENAR ================= */
    {
      id: 'organizar',
      titulo: 'Crear y ordenar',
      emoji: '📦',
      resumen: 'Carpetas, ficheros, copias, cambios de sitio y limpieza',
      lecciones: [

        {
          id: 'teclas-organizar',
          titulo: 'Editar la línea',
          resumen: 'Ctrl+A, Ctrl+E, Ctrl+U y Alt+.',
          comando: 'teclado',
          rondas: [
            {
              titulo: 'Corregir sin borrar todo',
              resumen: 'Mover el cursor y recuperar el último argumento',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'El cursor no es el final de la línea',
                  html: '<p>Puedes moverte por lo que estás escribiendo. <kbd>Ctrl</kbd> + <kbd>A</kbd> lleva el cursor al principio, <kbd>Ctrl</kbd> + <kbd>E</kbd> al final y <kbd>Ctrl</kbd> + <kbd>U</kbd> borra desde el cursor hasta el principio.</p><p><kbd>Alt</kbd> + <kbd>.</kbd> repite el último argumento del comando anterior: perfecto para no reescribir una ruta larga.</p>',
                  mas: '<p>Si te equivocas a mitad, no borres con la tecla de borrar veinte veces. Mueve el cursor y usa Ctrl+U.</p>'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Cursor al principio',
                  pide: 'Tienes el cursor al final. Pulsa <kbd>Ctrl</kbd> + <kbd>A</kbd> para llevarlo al principio de la línea.',
                  combo: { ctrl: true, key: 'a' },
                  demo: {
                    antes: ['usuario@linux:~$ cd Documentos▏'],
                    despues: ['usuario@linux:~$ ▏cd Documentos']
                  },
                  pista: 'Ctrl + la primera letra del abecedario.',
                  explica: 'Ctrl+A va al principio de la línea. Ctrl+E vuelve al final.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Cursor al final',
                  pide: 'Ahora el cursor está al principio. Pulsa <kbd>Ctrl</kbd> + <kbd>E</kbd> para volver al final.',
                  combo: { ctrl: true, key: 'e' },
                  demo: {
                    antes: ['usuario@linux:~$ ▏cd Documentos'],
                    despues: ['usuario@linux:~$ cd Documentos▏']
                  },
                  pista: 'Ctrl + la letra de <i>end</i>.',
                  explica: 'Ctrl+E te devuelve al final para seguir escribiendo sin usar las flechas.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Borrar hasta el principio',
                  pide: 'El comando está mal escrito. Pulsa <kbd>Ctrl</kbd> + <kbd>U</kbd> para borrar desde el cursor hasta el principio.',
                  combo: { ctrl: true, key: 'u' },
                  demo: {
                    antes: ['usuario@linux:~$ comando equivocado▏'],
                    despues: ['usuario@linux:~$ ▏']
                  },
                  pista: 'Ctrl + la letra de <i>undo</i> en la línea.',
                  explica: 'Ctrl+U borra la parte izquierda de la línea. Si el cursor está al final, borra todo lo escrito.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Repetir el último argumento',
                  pide: 'Acabas de listar <code>Documentos</code>. Escribe <code>cd </code> y pulsa <kbd>Alt</kbd> + <kbd>.</kbd> para recuperar ese argumento sin escribirlo.',
                  combo: { alt: true, key: '.' },
                  demo: {
                    antes: ['usuario@linux:~$ ls Documentos', 'usuario@linux:~$ cd ▏'],
                    despues: ['usuario@linux:~$ ls Documentos', 'usuario@linux:~$ cd Documentos▏']
                  },
                  pista: 'Alt + el punto del teclado.',
                  explica: 'Alt+. inserta el último argumento del comando anterior. Si la ruta es larga, te salva.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué atajo borra desde el cursor hasta el principio de la línea?',
                  opciones: [
                    { t: 'Ctrl + U', ok: true, porque: 'Ctrl+U borra hacia la izquierda del cursor.' },
                    { t: 'Ctrl + A', porque: 'Ctrl+A solo mueve el cursor al principio.' },
                    { t: 'Alt + .', porque: 'Alt+. repite el último argumento.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'mkdir',
          titulo: 'Crear carpetas',
          resumen: 'mkdir',
          comando: 'mkdir',
          rondas: [
            {
              titulo: 'Una carpeta nueva',
              resumen: 'mkdir y varios nombres a la vez',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'mkdir crea una carpeta',
                  html: '<p><code>mkdir</code> viene de <i>make directory</i>. Detrás se escribe el nombre de la carpeta que quieres crear.</p>',
                  ejemplo: ['mkdir proyectos', 'ls'],
                  mas: '<p>Se crea dentro de la carpeta en la que estás. Si quieres crearla en otro sitio, escribe la ruta: <code>mkdir Documentos/proyectos</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea proyectos',
                  pide: 'Crea una carpeta llamada <code>proyectos</code>.',
                  ejemplo: 'mkdir proyectos',
                  meta: { existe: '~/proyectos' },
                  pista: 'Es <code>mkdir</code> y el nombre de la carpeta.',
                  error: 'Casi. Sería <code>mkdir proyectos</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Varias de golpe',
                  html: '<p>Puedes crear varias carpetas en un solo comando, separando los nombres con espacios.</p>',
                  ejemplo: ['mkdir fotos videos', 'ls'],
                  mas: '<p><code>mkdir dir1 dir2 dir3</code> crea las tres a la vez.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dos carpetas',
                  pide: 'Crea a la vez las carpetas <code>fotos</code> y <code>videos</code>.',
                  ejemplo: 'mkdir fotos videos',
                  meta: { existe: ['~/fotos', '~/videos'] },
                  pista: 'Escribe los dos nombres separados por un espacio.',
                  error: 'Casi. Sería <code>mkdir fotos videos</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué crea <code>mkdir practicas</code>?',
                  opciones: [
                    { t: 'Una carpeta llamada practicas.', ok: true, porque: 'Correcto: <code>mkdir</code> crea directorios.' },
                    { t: 'Un fichero vacío llamado practicas.', porque: 'Para un fichero vacío se usa <code>touch</code>.' },
                    { t: 'Entra en la carpeta practicas.', porque: 'Para entrar se usa <code>cd practicas</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Cadenas y permisos',
              resumen: '-p para crear toda la ruta y -m para los permisos',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Crear toda la cadena: -p',
                  html: '<p><code>mkdir -p practicas/tema1/ejercicios</code> crea las tres carpetas de la ruta, aunque <code>practicas</code> y <code>tema1</code> no existan.</p><p>Sin <code>-p</code>, el comando fallaría.</p>',
                  ejemplo: ['mkdir -p practicas/tema1/ejercicios', 'tree'],
                  mas: '<p><code>-p</code> viene de <i>parents</i>: crea también los directorios padre que falten.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea la cadena',
                  pide: 'Crea de una vez <code>practicas/tema1/ejercicios</code>.',
                  ejemplo: 'mkdir -p practicas/tema1/ejercicios',
                  meta: { existe: '~/practicas/tema1/ejercicios' },
                  pista: 'Sin <code>-p</code> fallará porque faltan las carpetas de arriba.',
                  error: 'Casi. Es <code>mkdir -p practicas/tema1/ejercicios</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Nacer con permisos: -m',
                  html: '<p><code>mkdir -m 750 privado</code> crea la carpeta con permisos <code>750</code>: el dueño puede todo, el grupo puede entrar y leer, los demás nada.</p>',
                  ejemplo: ['mkdir -m 750 privado', 'ls -l'],
                  mas: '<p>Sin <code>-m</code>, la carpeta nace con los permisos que marca la <i>umask</i> del sistema (normalmente <code>755</code>).</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Carpeta privada',
                  pide: 'Crea la carpeta <code>privado</code> con permisos <code>750</code>.',
                  ejemplo: 'mkdir -m 750 privado',
                  meta: { modo: { '~/privado': '750' } },
                  pista: 'La opción es <code>-m</code> y detrás los permisos: <code>750</code>.',
                  error: 'Casi. Sería <code>mkdir -m 750 privado</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Para qué sirve <code>mkdir -p a/b/c</code>?',
                  opciones: [
                    { t: 'Para crear a, a/b y a/b/c aunque falten las de arriba.', ok: true, porque: 'Correcto: <code>-p</code> crea toda la cadena de padres.' },
                    { t: 'Para crear solo c dentro de una ruta que ya existe.', porque: 'Eso funciona incluso sin <code>-p</code>.' },
                    { t: 'Para entrar en la carpeta después de crearla.', porque: '<code>mkdir</code> solo crea; para entrar se usa <code>cd</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'touch',
          titulo: 'Crear ficheros',
          resumen: 'touch',
          comando: 'touch',
          rondas: [
            {
              titulo: 'Un fichero vacío',
              resumen: 'touch y la redirección >',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'touch crea un fichero vacío',
                  html: '<p><code>touch notas.txt</code> crea un fichero sin contenido. No escribe nada dentro: solo lo crea.</p>',
                  ejemplo: ['touch notas.txt', 'ls -l'],
                  mas: '<p>Si el fichero ya existe, <code>touch</code> no lo vacía: solo actualiza su fecha de modificación.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea notas.txt',
                  pide: 'Crea un fichero vacío llamado <code>notas.txt</code>.',
                  ejemplo: 'touch notas.txt',
                  meta: { existe: '~/notas.txt' },
                  pista: 'Es el comando <code>touch</code> y el nombre del fichero.',
                  error: 'Casi. Sería <code>touch notas.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Otra forma: redirigir con >',
                  html: '<p><code>&gt; lista.txt</code> también crea un fichero vacío. El símbolo <code>&gt;</code> redirige la salida de un comando a un fichero; si no hay salida, el fichero queda vacío.</p>',
                  ejemplo: ['> lista.txt', 'ls -l'],
                  mas: '<p>Ojo: <code>&gt;</code> <b>machaca</b> el contenido si el fichero ya existe. Para añadir sin borrar se usa <code>&gt;&gt;</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea con la redirección',
                  pide: 'Crea un fichero vacío llamado <code>lista.txt</code> usando <code>&gt;</code>.',
                  ejemplo: '> lista.txt',
                  meta: { existe: '~/lista.txt' },
                  pista: 'Escribe el símbolo mayor que y el nombre: <code>&gt; lista.txt</code>.',
                  error: 'Casi. Sería <code>&gt; lista.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Si <code>notas.txt</code> ya existe con texto dentro, ¿qué hace <code>touch notas.txt</code>?',
                  opciones: [
                    { t: 'No borra el contenido: solo actualiza la fecha.', ok: true, porque: 'Correcto: <code>touch</code> no vacía el fichero.' },
                    { t: 'Borra todo su contenido.', porque: 'Eso lo haría <code>&gt; notas.txt</code>, no <code>touch</code>.' },
                    { t: 'Da error porque ya existe.', porque: '<code>touch</code> funciona sin problema sobre un fichero que ya existe.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Fechas de los ficheros',
              resumen: 'touch -d, -t, -r y stat',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Los ficheros guardan tres fechas',
                  html: '<p>Linux guarda cuándo se <b>accedió</b> (atime), cuándo se <b>modificó</b> (mtime) y cuándo <b>cambió</b> (ctime).</p><p><code>touch</code> pone la fecha actual; <code>stat</code> las enseña.</p>',
                  ejemplo: ['touch nota.txt', 'stat nota.txt'],
                  mas: '<p>Modificar el contenido cambia mtime y ctime. Cambiar solo los permisos cambia ctime.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Pon una fecha concreta',
                  pide: 'Cambia la fecha de modificación de <code>nota.txt</code> al 3 de febrero de 2003 y compruébalo con <code>stat</code>.',
                  ejemplo: 'touch -d "03/02/2003" nota.txt; stat nota.txt',
                  meta: { muestra: ['nota.txt', '2003-02-03'] },
                  pista: 'Usa <code>touch -d "03/02/2003" nota.txt</code> y después <code>stat nota.txt</code>.',
                  error: 'Casi. Sería <code>touch -d "03/02/2003" nota.txt; stat nota.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Copiar la fecha de otro fichero: -r',
                  html: '<p><code>touch -r referencia.txt copia.txt</code> pone en <code>copia.txt</code> las mismas fechas que tiene <code>referencia.txt</code>.</p>',
                  ejemplo: ['touch -r nota.txt copia.txt', 'stat copia.txt'],
                  mas: '<p><code>-a</code> cambia solo el acceso y <code>-m</code> solo la modificación.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Fecha con formato -t',
                  pide: 'Pon la fecha <code>2003-02-03 09:08</code> en <code>nota.txt</code> usando <code>-t</code> y compruébala.',
                  ejemplo: 'touch -t 200302030908 nota.txt; stat nota.txt',
                  meta: { muestra: '2003-02-03 09:08' },
                  pista: 'El formato de <code>-t</code> es <code>AAAAMMDDhhmm</code>: <code>200302030908</code>.',
                  error: 'Casi. Sería <code>touch -t 200302030908 nota.txt; stat nota.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué comando enseña las fechas de un fichero?',
                  opciones: [
                    { t: 'stat', ok: true, porque: 'Correcto: <code>stat</code> muestra atime, mtime y ctime.' },
                    { t: 'touch', porque: '<code>touch</code> cambia las fechas, no las enseña.' },
                    { t: 'ls -a', porque: '<code>ls -a</code> enseña ocultos, no las fechas.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Nombres que empiezan por guion',
              resumen: 'El fin de opciones --',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'touch -i no crea un fichero -i',
                  html: '<p>Un nombre que empieza por <code>-</code> se confunde con una opción: <code>touch -i</code> intenta usar la opción <code>-i</code>, no crear un fichero.</p><p>El doble guion <code>--</code> marca el final de las opciones: todo lo que va detrás son nombres.</p>',
                  ejemplo: ['touch -- -i', 'ls -- -i'],
                  mas: '<p>También puedes escribir la ruta relativa: <code>touch ./-i</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea el fichero -i',
                  pide: 'Crea un fichero llamado <code>-i</code> usando <code>--</code>.',
                  ejemplo: 'touch -- -i',
                  meta: { existe: '~/-i' },
                  pista: 'Es <code>touch -- -i</code>.',
                  error: 'Casi. Sería <code>touch -- -i</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Borrarlo también necesita --',
                  html: '<p>Para borrarlo pasa lo mismo: <code>rm -i</code> sería la opción de preguntar. Se usa <code>rm -- -i</code> o <code>rm ./-i</code>.</p>',
                  ejemplo: ['rm -- -i', 'ls'],
                  mas: '<p>Este truco vale para cualquier comando: <code>--</code> significa «lo que viene ahora son datos, no opciones».</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borra el fichero -i',
                  pide: 'Borra el fichero <code>-i</code> sin que <code>rm</code> lo confunda con una opción.',
                  ejemplo: 'rm -- -i',
                  meta: { noExiste: '~/-i' },
                  pista: 'Es <code>rm -- -i</code>.',
                  error: 'Casi. Sería <code>rm -- -i</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Para qué sirve <code>--</code> en un comando?',
                  opciones: [
                    { t: 'Para marcar el final de las opciones y tratar lo siguiente como nombres.', ok: true, porque: 'Así se pueden usar nombres que empiezan por guion.' },
                    { t: 'Para pedir ayuda sobre el comando.', porque: 'La ayuda suele ser <code>--help</code>.' },
                    { t: 'Para ejecutar el comando dos veces.', porque: 'No tiene nada que ver con repetir.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'cp',
          titulo: 'Copiar',
          resumen: 'cp',
          comando: 'cp',
          rondas: [
            {
              titulo: 'Copiar ficheros',
              resumen: 'Una copia con otro nombre o en otra carpeta',
              inicio: { base: 'vacio', fs: { '~/a.txt': 'hola\n', '~/Documentos': { tipo: 'dir' } } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'cp copia un fichero',
                  html: '<p><code>cp origen destino</code> copia el fichero. El original sigue donde estaba.</p>',
                  ejemplo: ['cp a.txt b.txt', 'ls'],
                  mas: '<p>Si el destino ya existe, <b>se sobrescribe</b> sin preguntar. Por eso existe la opción <code>-i</code>: en un Linux real pregunta antes de pisar. Este simulador no hace preguntas, así que aquí la opción se acepta pero no cambia nada.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Copia a.txt en b.txt',
                  pide: 'Copia <code>a.txt</code> en un fichero nuevo llamado <code>b.txt</code>.',
                  ejemplo: 'cp a.txt b.txt',
                  meta: { existe: '~/b.txt', contenido: { '~/b.txt': 'hola\n' } },
                  pista: 'Es <code>cp</code> y después el origen y el destino.',
                  error: 'Casi. Sería <code>cp a.txt b.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Copiar dentro de una carpeta',
                  html: '<p>Si el destino es una carpeta que ya existe, la copia entra dentro con el mismo nombre.</p>',
                  ejemplo: ['cp a.txt Documentos/', 'ls Documentos'],
                  mas: '<p>La barra final no es obligatoria, pero deja claro que <code>Documentos</code> es una carpeta.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Copia a Documentos',
                  pide: 'Copia <code>a.txt</code> dentro de la carpeta <code>Documentos</code>.',
                  ejemplo: 'cp a.txt Documentos/',
                  meta: { existe: '~/Documentos/a.txt' },
                  pista: 'El destino es la carpeta, no un nombre nuevo: <code>cp a.txt Documentos/</code>.',
                  error: 'Casi. Sería <code>cp a.txt Documentos/</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Después de <code>cp a.txt b.txt</code>, ¿qué hay?',
                  opciones: [
                    { t: 'Dos ficheros: a.txt y b.txt, con el mismo contenido.', ok: true, porque: 'Correcto: <code>cp</code> duplica y conserva el original.' },
                    { t: 'Solo b.txt.', porque: 'Eso pasaría con <code>mv</code>, no con <code>cp</code>.' },
                    { t: 'Un enlace entre a.txt y b.txt.', porque: 'Para un enlace se usa <code>ln</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Carpetas y opciones',
              resumen: '-r para carpetas, -p para conservar, -u para actualizar',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/proyecto/nota.txt': 'hola\n',
                  '~/proyecto/src/main.c': 'int main(){}\n',
                  '~/a.txt': 'uno\n'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Copiar una carpeta: -r',
                  html: '<p><code>cp</code> sola no copia carpetas. Hay que añadir <code>-r</code> (recursivo): copia la carpeta y todo lo que tiene dentro.</p>',
                  ejemplo: ['cp -r proyecto copia', 'tree'],
                  mas: '<p><code>-r</code> viene de <i>recursive</i>. Sin él, <code>cp</code> avisa y omite el directorio.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Copia el proyecto',
                  pide: 'Copia la carpeta <code>proyecto</code> en una carpeta nueva llamada <code>copia</code>.',
                  ejemplo: 'cp -r proyecto copia',
                  meta: { existe: ['~/copia/nota.txt', '~/copia/src/main.c'] },
                  pista: 'Necesitas <code>-r</code>: <code>cp -r proyecto copia</code>.',
                  error: 'Casi. Sin <code>-r</code> no se copian carpetas.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Conservar y actualizar',
                  html: '<p><code>-p</code> conserva permisos y fechas. <code>-a</code> es como <code>-r</code> y <code>-p</code> juntos. <code>-u</code> solo copia si el original es más nuevo.</p>',
                  ejemplo: ['cp -rp proyecto copia2', 'ls -l copia2'],
                  mas: '<p><code>-i</code> pide confirmación antes de sobrescribir y <code>-f</code> fuerza la copia. El simulador no pregunta, así que <code>-i</code> no cambia el resultado aquí.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Copia conservando',
                  pide: 'Copia <code>proyecto</code> en <code>copia2</code> conservando permisos y fechas.',
                  ejemplo: 'cp -rp proyecto copia2',
                  meta: { existe: '~/copia2/src/main.c' },
                  pista: 'Junta <code>-r</code> y <code>-p</code>: <code>-rp</code>.',
                  error: 'Casi. Sería <code>cp -rp proyecto copia2</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>cp -r proyecto copia</code>?',
                  opciones: [
                    { t: 'Copia la carpeta proyecto y todo su contenido en copia.', ok: true, porque: 'Correcto: <code>-r</code> copia de forma recursiva.' },
                    { t: 'Copia solo los ficheros sueltos de proyecto.', porque: 'Sin <code>-r</code> ni siquiera copia la carpeta; con <code>-r</code> copia todo.' },
                    { t: 'Mueve proyecto a copia.', porque: 'Para mover se usa <code>mv</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'mv',
          titulo: 'Mover y renombrar',
          resumen: 'mv',
          comando: 'mv',
          rondas: [
            {
              titulo: 'Cambiar de nombre o de sitio',
              resumen: 'mv para las dos cosas',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n', '~/Documentos': { tipo: 'dir' } } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'mv renombra',
                  html: '<p><code>mv nota.txt nota.old</code> cambia el nombre. El contenido no se toca y el nombre viejo desaparece.</p>',
                  ejemplo: ['mv nota.txt nota.old', 'ls'],
                  mas: '<p><code>mv</code> viene de <i>move</i>. Sirve tanto para mover como para renombrar.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Renombra nota.txt',
                  pide: 'Cambia el nombre de <code>nota.txt</code> a <code>nota.old</code>.',
                  ejemplo: 'mv nota.txt nota.old',
                  meta: { noExiste: '~/nota.txt', existe: '~/nota.old' },
                  pista: 'Es <code>mv</code> y después el nombre viejo y el nuevo.',
                  error: 'Casi. Sería <code>mv nota.txt nota.old</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'mv mueve a una carpeta',
                  html: '<p>Si el destino es una carpeta, el fichero se mete dentro conservando su nombre.</p>',
                  ejemplo: ['mv nota.old Documentos/', 'ls Documentos'],
                  mas: '<p>También puedes mover y renombrar a la vez: <code>mv nota.old Documentos/nota.txt</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mueve a Documentos',
                  pide: 'Mueve <code>nota.old</code> dentro de <code>Documentos</code>.',
                  ejemplo: 'mv nota.old Documentos/',
                  meta: { noExiste: '~/nota.old', existe: '~/Documentos/nota.old' },
                  pista: 'El destino es la carpeta: <code>mv nota.old Documentos/</code>.',
                  error: 'Casi. Sería <code>mv nota.old Documentos/</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué diferencia hay entre <code>cp</code> y <code>mv</code>?',
                  opciones: [
                    { t: 'cp deja el original; mv lo quita del sitio viejo.', ok: true, porque: 'Correcto: copiar duplica; mover traslada.' },
                    { t: 'Son iguales.', porque: 'No: <code>mv</code> no deja copia en el origen.' },
                    { t: 'cp solo funciona con carpetas.', porque: '<code>cp</code> copia ficheros y, con <code>-r</code>, carpetas.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Mover carpetas',
              resumen: 'Directorios, barra final y -u',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/dir1': { tipo: 'dir' },
                  '~/dir2/x.txt': 'x\n',
                  '~/proyecto': { tipo: 'dir' },
                  '~/proyecto/nota.txt': 'hola\n'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Renombrar una carpeta',
                  html: '<p><code>mv dir1 dirold</code> cambia el nombre de la carpeta. Todo lo que tenía dentro sigue dentro.</p>',
                  ejemplo: ['mv dir1 dirold', 'ls'],
                  mas: '<p>La barra final (<code>dir1/</code>) no cambia el resultado, pero recuerda que es una carpeta.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Renombra dir1',
                  pide: 'Cambia el nombre de la carpeta <code>dir1</code> a <code>dirold</code>.',
                  ejemplo: 'mv dir1 dirold',
                  meta: { noExiste: '~/dir1', existe: '~/dirold' },
                  pista: 'Es <code>mv</code> con el nombre viejo y el nuevo.',
                  error: 'Casi. Sería <code>mv dir1 dirold</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Meter una carpeta en otra',
                  html: '<p><code>mv dir2/ proyecto/</code> mueve <code>dir2</code> dentro de <code>proyecto</code>, con todo su contenido.</p>',
                  ejemplo: ['mv dir2 proyecto/', 'tree proyecto'],
                  mas: '<p>Si el destino no existe, <code>mv</code> lo interpreta como un nombre nuevo y renombra.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mueve dir2 a proyecto',
                  pide: 'Mueve la carpeta <code>dir2</code> dentro de <code>proyecto</code>.',
                  ejemplo: 'mv dir2 proyecto/',
                  meta: { noExiste: '~/dir2', existe: '~/proyecto/dir2/x.txt' },
                  pista: 'El destino es <code>proyecto/</code>.',
                  error: 'Casi. Sería <code>mv dir2 proyecto/</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>mv -u a.txt b.txt</code>?',
                  opciones: [
                    { t: 'Solo mueve si a.txt es más nuevo que b.txt.', ok: true, porque: 'Correcto: <code>-u</code> significa <i>update</i>.' },
                    { t: 'Mueve siempre, pero sin preguntar.', porque: 'Eso es el comportamiento normal; <code>-u</code> añade la condición de fecha.' },
                    { t: 'Mueve el fichero a la papelera.', porque: 'Linux no tiene papelera en la terminal.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'rm',
          titulo: 'Borrar',
          resumen: 'rm y rmdir',
          comando: 'rm',
          rondas: [
            {
              titulo: 'Borrar ficheros',
              resumen: 'rm no tiene papelera',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n', '~/apuntes.txt': 'apuntes\n', '~/foto.png': 'PNG' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'rm borra de verdad',
                  html: '<p><code>rm foto.png</code> borra el fichero. <b>No hay papelera</b>: no se puede deshacer.</p>',
                  ejemplo: ['rm foto.png', 'ls'],
                  mas: '<p>Por eso conviene mirar dos veces el nombre antes de pulsar Enter.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borra la foto',
                  pide: 'Borra el fichero <code>foto.png</code>.',
                  ejemplo: 'rm foto.png',
                  meta: { noExiste: '~/foto.png' },
                  pista: 'Es <code>rm</code> y el nombre del fichero.',
                  error: 'Casi. Sería <code>rm foto.png</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Varios ficheros a la vez',
                  html: '<p><code>rm nota.txt apuntes.txt</code> borra los dos. Se pueden poner tantos nombres como quieras.</p>',
                  ejemplo: ['rm nota.txt apuntes.txt', 'ls'],
                  mas: '<p>El comodín <code>*</code> también sirve: <code>rm *.txt</code> borra todos los <code>.txt</code>. Úsalo con mucho cuidado.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borra los dos',
                  pide: 'Borra a la vez <code>nota.txt</code> y <code>apuntes.txt</code>.',
                  ejemplo: 'rm nota.txt apuntes.txt',
                  meta: { noExiste: ['~/nota.txt', '~/apuntes.txt'] },
                  pista: 'Separa los dos nombres con un espacio.',
                  error: 'Casi. Sería <code>rm nota.txt apuntes.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Si borras un fichero con <code>rm</code>, ¿puedes recuperarlo de la papelera?',
                  opciones: [
                    { t: 'No: rm no usa papelera.', ok: true, porque: 'Correcto: el borrado es directo.' },
                    { t: 'Sí, está en la papelera del escritorio.', porque: 'La papelera es del entorno gráfico; <code>rm</code> no pasa por ella.' },
                    { t: 'Sí, con <code>rm -u</code>.', porque: '<code>rm</code> no tiene esa opción: <code>-u</code> es de <code>cp</code> y <code>mv</code>, y solo evita pisar lo más nuevo.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Carpetas y opciones',
              resumen: '-r, -i, -f y el peligroso -rf',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/proyecto/nota.txt': 'hola\n',
                  '~/proyecto/src/main.c': 'int main(){}\n',
                  '~/vacia': { tipo: 'dir' },
                  '~/llena/x.txt': 'x\n'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'rm -r borra una carpeta entera',
                  html: '<p><code>rm -r proyecto</code> borra la carpeta y todo lo que tiene dentro. La opción <code>-r</code> es recursiva.</p>',
                  ejemplo: ['rm -r proyecto', 'ls'],
                  mas: '<p>Sin <code>-r</code>, <code>rm</code> se niega a borrar un directorio.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borra el proyecto',
                  pide: 'Borra la carpeta <code>proyecto</code> con todo su contenido.',
                  ejemplo: 'rm -r proyecto',
                  meta: { noExiste: '~/proyecto' },
                  pista: 'Necesitas <code>-r</code> para carpetas.',
                  error: 'Casi. Sería <code>rm -r proyecto</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'rmdir solo borra vacías',
                  html: '<p><code>rmdir vacia</code> borra una carpeta <b>solo si está vacía</b>. Si tiene algo dentro, falla y avisa.</p><p>Para una carpeta llena hay que usar <code>rm -r</code>.</p>',
                  ejemplo: ['rmdir vacia', 'ls'],
                  mas: '<p><code>rmdir</code> es más seguro que <code>rm -r</code>: no puede borrar contenido por accidente.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borra la carpeta vacía',
                  pide: 'Borra la carpeta <code>vacia</code> sin usar <code>rm</code>.',
                  ejemplo: 'rmdir vacia',
                  meta: { noExiste: '~/vacia' },
                  pista: 'El comando específico para carpetas vacías es <code>rmdir</code>.',
                  error: 'Casi. Sería <code>rmdir vacia</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borra la carpeta llena',
                  pide: 'Borra <code>llena</code>, que tiene un fichero dentro, sin que pregunte nada.',
                  ejemplo: 'rm -rf llena',
                  meta: { noExiste: '~/llena' },
                  pista: 'Combina <code>-r</code> y <code>-f</code>: <code>-rf</code>.',
                  error: 'Casi. Sería <code>rm -rf llena</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '-i pregunta, -f no',
                  html: '<p><code>rm -i fichero</code> pide confirmación antes de borrar, y <code>rm -f</code> fuerza el borrado sin avisar. Juntas, <code>-rf</code> borra una carpeta entera sin preguntar.</p>',
                  ejemplo: ['rm -f llena'],
                  mas: '<p>Este simulador no hace preguntas: acepta <code>-i</code>, pero borra igual. En un Linux real sí espera un <code>s</code> o una <code>n</code>.</p>'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>rm -rf carpeta</code>?',
                  opciones: [
                    { t: 'Borra la carpeta y todo su contenido sin preguntar.', ok: true, porque: 'Correcto: <code>-r</code> baja por la estructura y <code>-f</code> fuerza sin preguntar.' },
                    { t: 'Borra solo los ficheros vacíos.', porque: 'Borra todo lo que haya dentro.' },
                    { t: 'Mueve la carpeta a la papelera.', porque: 'No hay papelera: el borrado es definitivo.' }
                  ]
                }
              ]
            }
          ]
        },

        /* ---------------- PERMISOS · chmod ---------------- */
        {
          id: 'chmod',
          titulo: 'Cambiar permisos',
          resumen: 'chmod simbólico y octal',
          comando: 'chmod',
          rondas: [
            {
              titulo: 'Leer los permisos',
              resumen: 'rwx, dueño, grupo y otros',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/nota.txt': { contenido: 'hola\n', modo: '644' },
                  '~/privado': { tipo: 'dir', modo: '700' }
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'rwx: quién puede qué',
                  html: '<p>En <code>ls -l</code>, los permisos son nueve letras en tres grupos: <b>dueño</b>, <b>grupo</b> y <b>otros</b>. Cada grupo tiene <code>r</code> (leer), <code>w</code> (escribir) y <code>x</code> (ejecutar).</p><p>En una carpeta, <code>x</code> significa <b>entrar</b> y <code>r</code> significa <b>listar</b> lo que hay dentro.</p>',
                  ejemplo: ['ls -l nota.txt'],
                  mas: '<p><code>-rw-r--r--</code> se lee así: fichero, dueño <code>rw-</code>, grupo <code>r--</code>, otros <code>r--</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Lee los permisos',
                  pide: 'Muestra los permisos de <code>nota.txt</code> en formato largo.',
                  ejemplo: 'ls -l nota.txt',
                  meta: { muestra: '-rw-r--r--' },
                  pista: 'La opción del formato largo es <code>-l</code>.',
                  error: 'Casi. Sería <code>ls -l nota.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Los mismos permisos en números',
                  html: '<p>Cada permiso vale un número: <code>r</code> = 4, <code>w</code> = 2 y <code>x</code> = 1. Se suman por grupo.</p><p>Así, <code>644</code> es <code>rw-r--r--</code> y <code>755</code> es <code>rwxr-xr-x</code>.</p>',
                  ejemplo: ['ls -ld privado'],
                  mas: '<p><code>-ld</code> enseña la carpeta en sí, no lo que tiene dentro.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Comprueba la carpeta',
                  pide: 'Muestra los permisos de la carpeta <code>privado</code>, no su contenido.',
                  ejemplo: 'ls -ld privado',
                  meta: { muestra: 'drwx------' },
                  pista: 'Combina <code>-l</code> con <code>-d</code>.',
                  error: 'Casi. Sería <code>ls -ld privado</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'En una carpeta, ¿qué permite el permiso <code>x</code>?',
                  opciones: [
                    { t: 'Entrar en ella y acceder a lo que hay dentro.', ok: true, porque: 'Sin <code>x</code> no se puede atravesar la carpeta.' },
                    { t: 'Ejecutar la carpeta como si fuera un programa.', porque: 'Las carpetas no se ejecutan: la <code>x</code> permite entrar.' },
                    { t: 'Cambiarle el nombre.', porque: 'Para renombrar hace falta escribir en la carpeta que la contiene.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Cambiar con letras',
              resumen: 'u, g, o, a y los signos + - =',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/informe.txt': { contenido: 'datos\n', modo: '644' },
                  '~/carpeta': { tipo: 'dir', modo: '700' }
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'chmod habla de dueño, grupo y otros',
                  html: '<p><code>chmod</code> cambia los permisos. Se elige a quién afecta: <code>u</code> (dueño), <code>g</code> (grupo), <code>o</code> (otros) o <code>a</code> (todos).</p><p>Después va el signo: <code>+</code> añade, <code>-</code> quita y <code>=</code> deja exactamente esos permisos.</p>',
                  ejemplo: ['chmod u+x informe.txt', 'ls -l informe.txt'],
                  mas: '<p><code>chmod u+x</code> añade ejecución al dueño. <code>chmod o-r</code> quita lectura a los demás.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Quita la lectura a los demás',
                  pide: 'Quita el permiso de lectura al grupo y a otros en <code>informe.txt</code>. El dueño no cambia.',
                  ejemplo: 'chmod go-r informe.txt',
                  meta: { modo: { '~/informe.txt': '600' } },
                  pista: 'Puedes juntar grupo y otros: <code>go-r</code>.',
                  error: 'Casi. Sería <code>chmod go-r informe.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Varios sujetos y varias cláusulas',
                  html: '<p>Puedes juntar letras: <code>ug+rw</code> da lectura y escritura al dueño y al grupo. También puedes separar varias órdenes con comas: <code>u=rwx,go=rx</code>.</p>',
                  ejemplo: ['chmod u=rwx,go=rx carpeta'],
                  mas: '<p><code>chmod a-w fichero</code> quita la escritura a todo el mundo de una vez.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Prepara la carpeta',
                  pide: 'Deja <code>carpeta</code> con todos los permisos para el dueño y lectura y entrada para grupo y otros.',
                  ejemplo: 'chmod u=rwx,go=rx carpeta',
                  meta: { modo: { '~/carpeta': '755' } },
                  pista: 'Es <code>chmod u=rwx,go=rx carpeta</code>.',
                  error: 'Casi. Sería <code>chmod u=rwx,go=rx carpeta</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo lectura',
                  pide: 'Deja <code>informe.txt</code> con lectura para todos y nada más: sin escritura ni ejecución.',
                  ejemplo: 'chmod a=r informe.txt',
                  meta: { modo: { '~/informe.txt': '444' } },
                  pista: 'El signo <code>=</code> deja exactamente lo que pidas: <code>a=r</code>.',
                  error: 'Casi. Sería <code>chmod a=r informe.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>chmod g+w fichero</code>?',
                  opciones: [
                    { t: 'Añade escritura al grupo, sin tocar al dueño ni a otros.', ok: true, porque: 'La <code>g</code> limita el cambio al grupo y el <code>+</code> lo añade.' },
                    { t: 'Quita escritura al grupo.', porque: 'Para quitar se usa <code>-</code>, no <code>+</code>.' },
                    { t: 'Da escritura a todo el mundo.', porque: 'Para todos se usa <code>a</code>, no <code>g</code>.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Cambiar con números',
              resumen: 'chmod 600, 640, 755 y -R',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/clave.txt': { contenido: 'secreto\n', modo: '644' },
                  '~/publico': { tipo: 'dir', modo: '700' },
                  '~/proyecto': { tipo: 'dir', modo: '700' },
                  '~/proyecto/sub': { tipo: 'dir', modo: '700' },
                  '~/proyecto/nota.txt': { contenido: 'x\n', modo: '600' },
                  '~/proyecto/sub/dato.txt': { contenido: 'y\n', modo: '600' }
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Tres cifras, tres grupos',
                  html: '<p><code>chmod 600 clave.txt</code> pone los permisos de golpe. La primera cifra es el dueño, la segunda el grupo y la tercera los demás.</p><p><code>600</code> = <code>rw-------</code>, <code>640</code> = <code>rw-r-----</code> y <code>755</code> = <code>rwxr-xr-x</code>.</p>',
                  ejemplo: ['chmod 600 clave.txt', 'ls -l clave.txt'],
                  mas: '<p>Para una carpeta, <code>755</code> es lo habitual: el dueño puede todo y los demás entrar y leer.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo el dueño',
                  pide: 'Deja <code>clave.txt</code> para que solo el dueño pueda leer y escribir.',
                  ejemplo: 'chmod 600 clave.txt',
                  meta: { modo: { '~/clave.txt': '600' } },
                  pista: 'El dueño tiene <code>rw-</code>: 4 + 2 = 6. Los demás, nada.',
                  error: 'Casi. Sería <code>chmod 600 clave.txt</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Carpeta compartida',
                  pide: 'Deja <code>publico</code> con permisos <code>755</code>.',
                  ejemplo: 'chmod 755 publico',
                  meta: { modo: { '~/publico': '755' } },
                  pista: 'Dueño <code>rwx</code> (7), grupo y otros <code>r-x</code> (5).',
                  error: 'Casi. Sería <code>chmod 755 publico</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Cambiar una carpeta y todo lo de dentro: -R',
                  html: '<p><code>chmod -R</code> aplica el cambio a la carpeta y a todo su contenido. Úsalo con cuidado: si quitas la <code>x</code> a una carpeta, ya no podrás entrar en ella.</p>',
                  ejemplo: ['chmod -R a+r proyecto'],
                  mas: '<p>Para dar lectura sin tocar lo demás, <code>a+r</code> es más seguro que <code>chmod -R 644</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Lectura para todos',
                  pide: 'Da lectura a todos en <code>proyecto</code> y en todo lo que hay dentro, sin cambiar el resto de permisos.',
                  ejemplo: 'chmod -R a+r proyecto',
                  meta: { modo: { '~/proyecto': '744', '~/proyecto/nota.txt': '644', '~/proyecto/sub/dato.txt': '644' } },
                  pista: 'Añade <code>-R</code> y usa <code>a+r</code>: <code>chmod -R a+r proyecto</code>.',
                  error: 'Casi. Sería <code>chmod -R a+r proyecto</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué permisos deja <code>chmod 750 carpeta</code>?',
                  opciones: [
                    { t: 'Dueño todo; grupo lectura y entrada; otros nada.', ok: true, porque: '7 = <code>rwx</code>, 5 = <code>r-x</code> y 0 = <code>---</code>.' },
                    { t: 'Dueño todo; grupo y otros lectura y entrada.', porque: 'Eso sería <code>755</code>.' },
                    { t: 'Solo el dueño puede leer.', porque: '7 incluye leer, escribir y ejecutar.' }
                  ]
                }
              ]
            }
          ]
        },

        /* ---------------- PERMISOS · umask ---------------- */
        {
          id: 'umask',
          titulo: 'La máscara umask',
          resumen: 'umask y permisos por defecto',
          comando: 'umask',
          rondas: [
            {
              titulo: 'Permisos al nacer',
              resumen: 'umask 022, 644 y 755',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'umask recorta los permisos nuevos',
                  html: '<p>Cuando creas un fichero o una carpeta, Linux les pone permisos automáticamente. La <code>umask</code> decide cuáles se recortan.</p><p>Con la umask habitual <code>022</code>, los ficheros nacen <code>644</code> y las carpetas <code>755</code>.</p>',
                  ejemplo: ['umask', 'touch nuevo.txt', 'ls -l nuevo.txt'],
                  mas: '<p>Los ficheros parten de <code>666</code> y las carpetas de <code>777</code>; la umask quita bits a esa base.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mira la máscara',
                  pide: 'Muestra la umask actual.',
                  ejemplo: 'umask',
                  meta: { salida: '0022' },
                  pista: 'Es solo el comando <code>umask</code>.',
                  error: 'Casi. Sería <code>umask</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'El cálculo, sin misterio',
                  html: '<p>Se resta bit a bit: <code>666</code> menos <code>022</code> da <code>644</code>; <code>777</code> menos <code>022</code> da <code>755</code>.</p>',
                  ejemplo: ['mkdir nueva', 'ls -ld nueva'],
                  mas: '<p>La umask no se resta como en matemáticas: se apagan los permisos que coinciden con sus bits.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea y comprueba',
                  pide: 'Crea <code>normal.txt</code> y comprueba que nace con permisos <code>644</code>.',
                  ejemplo: 'touch normal.txt; ls -l normal.txt',
                  meta: { modo: { '~/normal.txt': '644' } },
                  pista: 'Crea el fichero con <code>touch</code> y míralo con <code>ls -l</code>.',
                  error: 'Casi. Sería <code>touch normal.txt; ls -l normal.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Con <code>umask 022</code>, ¿qué permisos tiene una carpeta nueva?',
                  opciones: [
                    { t: '755: dueño todo, grupo y otros lectura y entrada.', ok: true, porque: '<code>777</code> menos <code>022</code> deja <code>755</code>.' },
                    { t: '644: lectura y escritura para el dueño.', porque: 'Eso es lo que recibe un fichero nuevo, no una carpeta.' },
                    { t: '777: todos los permisos.', porque: 'La umask recorta algo: no deja <code>777</code>.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Cambiar la máscara',
              resumen: 'umask 077, 600 y 700',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'umask 077 cierra la puerta',
                  html: '<p><code>umask 077</code> hace que los ficheros nuevos nazcan <code>600</code> y las carpetas <code>700</code>: solo el dueño tiene acceso.</p>',
                  ejemplo: ['umask 077', 'touch privado.txt', 'ls -l privado.txt'],
                  mas: '<p>Es útil para datos personales, pero cuidado: otros usuarios no podrán ni leerlos.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Cierra la puerta',
                  pide: 'Cambia la umask a <code>077</code> y crea <code>diario.txt</code>.',
                  ejemplo: 'umask 077; touch diario.txt',
                  meta: { umask: '077', modo: { '~/diario.txt': '600' } },
                  pista: 'Primero <code>umask 077</code> y después <code>touch diario.txt</code>.',
                  error: 'Casi. Sería <code>umask 077; touch diario.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'La umask no cambia lo ya creado',
                  html: '<p>Cambiar la umask solo afecta a los ficheros y carpetas <b>nuevos</b>. Los que ya existen conservan sus permisos.</p>',
                  ejemplo: ['umask 022'],
                  mas: '<p>Para cambiar permisos de algo que ya existe se usa <code>chmod</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Vuelve a lo normal',
                  pide: 'Deja la umask en <code>022</code> y crea <code>compartido.txt</code>.',
                  ejemplo: 'umask 022; touch compartido.txt',
                  meta: { umask: '022', modo: { '~/compartido.txt': '644' } },
                  pista: 'Primero <code>umask 022</code> y después <code>touch compartido.txt</code>.',
                  error: 'Casi. Sería <code>umask 022; touch compartido.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Si cambias la umask, ¿qué pasa con los ficheros que ya existían?',
                  opciones: [
                    { t: 'Nada: conservan sus permisos.', ok: true, porque: 'La umask solo se aplica al crear cosas nuevas.' },
                    { t: 'Pierden los permisos que recorta la nueva umask.', porque: 'Eso no ocurre: para cambiarlos hay que usar <code>chmod</code>.' },
                    { t: 'Se borran y se vuelven a crear.', porque: 'La umask no toca el contenido ni los ficheros existentes.' }
                  ]
                }
              ]
            }
          ]
        }

      ]
    },

    /* ================= MUNDO 3 · HABLAR CON LA SHELL ================= */
    {
      id: 'shell',
      titulo: 'Hablar con la shell',
      emoji: '💬',
      resumen: 'Texto, variables, comodines, operadores y redirecciones',
      lecciones: [

        {
          id: 'teclas-shell',
          titulo: 'Controlar el prompt',
          resumen: 'Ctrl+C, Ctrl+R y doble Tab',
          comando: 'teclado',
          rondas: [
            {
              titulo: 'Cuando algo se atasca',
              resumen: 'Cancelar, buscar en el historial y ver opciones',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Tres teclas de emergencia',
                  html: '<p><kbd>Ctrl</kbd> + <kbd>C</kbd> corta el comando que está corriendo y te devuelve el prompt. <kbd>Ctrl</kbd> + <kbd>R</kbd> busca en el historial mientras escribes. Y si escribes <code>ls --</code> y pulsas <kbd>Tab</kbd> dos veces, ves todas las opciones disponibles.</p>',
                  mas: '<p>Ctrl+C no cierra la terminal: solo interrumpe lo que se está ejecutando. Es la tecla para salir de un comando que se queda colgado.</p>'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Cortar un comando colgado',
                  pide: 'El comando <code>sleep 100</code> se ha quedado pillado. Pulsa <kbd>Ctrl</kbd> + <kbd>C</kbd> para cortarlo y recuperar el prompt.',
                  combo: { ctrl: true, key: 'c' },
                  demo: {
                    antes: ['usuario@linux:~$ sleep 100', '▏'],
                    despues: ['usuario@linux:~$ sleep 100', '^C', 'usuario@linux:~$ ▏']
                  },
                  pista: 'Ctrl + la letra de <i>cancel</i>.',
                  explica: 'Ctrl+C interrumpe el proceso y devuelve el control. No borra nada de lo que ya está guardado.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Ver todas las opciones',
                  pide: 'Escribe <code>ls --</code> y pulsa <kbd>Tab</kbd> dos veces para que aparezcan las opciones del comando.',
                  combo: { key: 'Tab' },
                  demo: {
                    antes: ['usuario@linux:~$ ls --▏'],
                    despues: ['usuario@linux:~$ ls --', '--all  --almost-all  --directory  --human-readable  --recursive  ...']
                  },
                  pista: 'La misma tecla que completa nombres.',
                  explica: 'Un Tab completa lo que pueda; dos Tab seguidos muestran todas las posibilidades. Funciona con comandos, opciones y rutas.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Un comando lleva un rato sin responder. ¿Qué pulsas para cortarlo?',
                  opciones: [
                    { t: 'Ctrl + C', ok: true, porque: 'Ctrl+C interrumpe el proceso y vuelve al prompt.' },
                    { t: 'Ctrl + L', porque: 'Ctrl+L solo limpia la pantalla.' },
                    { t: 'Ctrl + U', porque: 'Ctrl+U borra lo escrito en la línea, no corta el proceso.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'echo',
          titulo: 'Escribir texto',
          resumen: 'echo y variables',
          comando: 'echo',
          rondas: [
            {
              titulo: 'Texto por pantalla',
              resumen: 'echo, comillas y saltos de línea',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'echo repite lo que le dices',
                  html: '<p><code>echo "Hola Mundo"</code> imprime el texto en la terminal. Es el comando más simple para comprobar que todo funciona.</p>',
                  ejemplo: 'echo "Hola Mundo"',
                  mas: '<p>Las comillas no se imprimen: solo sirven para que la shell sepa dónde empieza y acaba el texto.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Di hola',
                  pide: 'Escribe <code>Hola Mundo</code> con <code>echo</code>.',
                  ejemplo: 'echo "Hola Mundo"',
                  meta: { muestra: 'Hola Mundo' },
                  pista: 'Es <code>echo</code> y el texto entre comillas.',
                  error: 'Casi. Sería <code>echo "Hola Mundo"</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Saltos de línea con -e',
                  html: '<p>Con <code>-e</code>, <code>echo</code> interpreta secuencias: <code>\\n</code> salta de línea, <code>\\t</code> hace un tabulador y <code>\\\\</code> escribe una barra.</p>',
                  ejemplo: 'echo -e "Hola\\nme\\nllamo\\nPepe"',
                  mas: '<p>Sin <code>-e</code>, el <code>\\n</code> se imprimiría tal cual, con la barra y la letra.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Una línea por palabra',
                  pide: 'Usa <code>echo -e</code> para escribir <code>Hola</code>, <code>me</code>, <code>llamo</code> y <code>Pepe</code> en líneas separadas.',
                  ejemplo: 'echo -e "Hola\\nme\\nllamo\\nPepe"',
                  meta: { orden: ['Hola', 'me', 'llamo', 'Pepe'] },
                  pista: 'Separa las palabras con <code>\\n</code> dentro de las comillas.',
                  error: 'Casi. Sería <code>echo -e "Hola\\nme\\nllamo\\nPepe"</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Las variables del sistema',
                  html: '<p>La shell guarda datos en variables. Se leen con <code>$</code> delante: <code>$USER</code>, <code>$HOME</code>, <code>$PWD</code>.</p>',
                  ejemplo: ['echo $USER', 'echo $HOME', 'echo $PWD'],
                  mas: '<p><code>$HISTSIZE</code> guarda cuántos comandos recuerda el histórico.</p>'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>echo -e "a\\nb"</code>?',
                  opciones: [
                    { t: 'Escribe a y b en dos líneas.', ok: true, porque: 'Correcto: <code>\\n</code> es un salto de línea.' },
                    { t: 'Escribe literalmente <code>a\\nb</code>.', porque: 'Eso pasaría sin <code>-e</code>.' },
                    { t: 'Crea un fichero llamado b.', porque: '<code>echo</code> solo escribe por pantalla.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Variables propias',
              resumen: 'Guardar valores y usar $(comando)',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Crear una variable',
                  html: '<p>Se asigna con <code>nombre=valor</code>, <b>sin espacios</b> alrededor del igual. Luego se lee con <code>$nombre</code>.</p>',
                  ejemplo: ['cadena="esto es una cadena"', 'echo $cadena'],
                  mas: '<p>Las variables de la shell suelen ir en mayúsculas (<code>HISTFILE</code>), pero las tuyas pueden ir en minúsculas.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Guarda un número',
                  pide: 'Guarda <code>10</code> en la variable <code>entero</code> y muéstrala.',
                  ejemplo: 'entero=10; echo $entero',
                  meta: { salida: '10' },
                  pista: 'Asigna <code>entero=10</code> y después <code>echo $entero</code>.',
                  error: 'Casi. Sería <code>entero=10; echo $entero</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Guardar la salida de un comando',
                  html: '<p><code>variable=$(comando)</code> guarda lo que devuelve el comando. Es la <b>sustitución de comandos</b>.</p>',
                  ejemplo: ['fecha=$(date +%F)', 'echo $fecha'],
                  mas: '<p>También vale con comillas invertidas: <code>`date +%F`</code>. La forma <code>$( )</code> se lee mejor.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Guarda quién eres',
                  pide: 'Guarda el resultado de <code>whoami</code> en <code>quien</code> y muéstralo.',
                  ejemplo: 'quien=$(whoami); echo $quien',
                  meta: { muestra: 'usuario' },
                  pista: 'Es <code>quien=$(whoami)</code> y después <code>echo $quien</code>.',
                  error: 'Casi. Sería <code>quien=$(whoami); echo $quien</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Cómo se muestra el valor de la variable <code>cadena</code>?',
                  opciones: [
                    { t: 'echo $cadena', ok: true, porque: 'Correcto: el <code>$</code> delante indica que es una variable.' },
                    { t: 'echo cadena', porque: 'Así se imprime la palabra «cadena», no su valor.' },
                    { t: 'cat cadena', porque: '<code>cat</code> lee ficheros, no variables.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'type-file',
          titulo: '¿Qué es cada cosa?',
          resumen: 'type y file',
          comando: 'type',
          rondas: [
            {
              titulo: 'Comandos y ficheros',
              resumen: 'Interno, externo y tipo de fichero',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Comandos internos y externos',
                  html: '<p>Los comandos <b>internos</b> forman parte de la shell (<code>pwd</code>, <code>cd</code>, <code>echo</code>). Los <b>externos</b> son programas en disco, como <code>ls</code>.</p><p><code>type</code> te dice cuál es cuál.</p>',
                  ejemplo: ['type pwd', 'type ls'],
                  mas: '<p>Un comando interno se ejecuta dentro de la shell y suele ser más rápido. Si hay versión interna y externa, gana la interna.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Pregunta por pwd',
                  pide: 'Averigua con <code>type</code> si <code>pwd</code> es interno o externo.',
                  ejemplo: 'type pwd',
                  meta: { muestra: 'orden interna' },
                  pista: 'Es <code>type pwd</code>.',
                  error: 'Casi. Sería <code>type pwd</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'file dice qué hay dentro',
                  html: '<p><code>file</code> mira un fichero y dice de qué tipo es: texto, directorio, enlace, binario…</p>',
                  ejemplo: ['file /etc/passwd', 'file Documentos', 'file /etc/hosts'],
                  mas: '<p><code>file</code> necesita la ruta del fichero, no su contenido.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: '¿Qué es Documentos?',
                  pide: 'Averigua con <code>file</code> qué tipo es la carpeta <code>Documentos</code>.',
                  ejemplo: 'file Documentos',
                  meta: { muestra: 'directorio' },
                  pista: 'Es <code>file Documentos</code>.',
                  error: 'Casi. Sería <code>file Documentos</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué enseña <code>type pwd</code>?',
                  opciones: [
                    { t: 'Que pwd es una orden interna de la shell.', ok: true, porque: 'Correcto: <code>pwd</code> vive dentro de la shell.' },
                    { t: 'La ruta en la que estás.', porque: 'Eso lo hace <code>pwd</code>, no <code>type pwd</code>.' },
                    { t: 'El contenido del fichero pwd.', porque: '<code>type</code> clasifica comandos, no lee ficheros.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'history',
          titulo: 'El histórico',
          resumen: 'history y atajos',
          comando: 'history',
          rondas: [
            {
              titulo: 'Repetir sin escribir',
              resumen: 'history, !! y Ctrl+C',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'La shell apunta todo',
                  html: '<p><code>history</code> enseña los comandos que has escrito, numerados. Con <code>history 5</code> ves solo los últimos cinco.</p>',
                  ejemplo: ['pwd', 'ls', 'history'],
                  mas: '<p>El histórico se guarda en <code>~/.bash_history</code> al cerrar la sesión.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Haz tu propio histórico',
                  pide: 'Escribe <code>pwd</code>, luego <code>ls</code> y por último <code>history</code>, todo en la misma línea separado por <code>;</code>.',
                  ejemplo: 'pwd; ls; history',
                  meta: { orden: ['pwd', 'ls', 'history'] },
                  pista: 'Separa los tres comandos con punto y coma: <code>pwd; ls; history</code>.',
                  error: 'Casi. Primero <code>pwd</code>, después <code>ls</code> y al final <code>history</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Los atajos del histórico',
                  html: '<p><code>!!</code> repite el último comando. <code>!$</code> recupera el último argumento. <code>!n</code> ejecuta el comando número n.</p><p><code>!cadena</code> repite el último que empiece por esa cadena.</p>',
                  ejemplo: ['pwd', 'history 2'],
                  mas: '<p>En la terminal también puedes usar la flecha ↑ para ir recuperando comandos.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Los últimos dos',
                  pide: 'Muestra solo los dos últimos comandos del histórico.',
                  ejemplo: 'history 2',
                  meta: { muestra: 'history 2' },
                  pista: 'Es <code>history</code> y el número 2.',
                  error: 'Casi. Sería <code>history 2</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Cortar y terminar',
                  html: '<p><b>Ctrl+C</b> interrumpe el programa que se está ejecutando. <b>Ctrl+Z</b> lo pausa. <b>Ctrl+D</b> termina la entrada de datos.</p>',
                  ejemplo: ['pwd', 'history -c'],
                  mas: '<p><code>history -c</code> borra el histórico de la sesión actual. El fichero <code>~/.bash_history</code> puede seguir teniendo lo anterior.</p>'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>!!</code>?',
                  opciones: [
                    { t: 'Repite el último comando.', ok: true, porque: 'Correcto: es el atajo clásico para repetir.' },
                    { t: 'Borra el último comando.', porque: 'Eso no lo hace <code>!!</code>.' },
                    { t: 'Muestra los dos últimos comandos.', porque: 'Para verlos se usa <code>history 2</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'comodines',
          titulo: 'Comodines',
          resumen: '* ? [ ] y { }',
          comando: 'ls *.txt',
          rondas: [
            {
              titulo: 'Asterisco, interrogación y corchetes',
              resumen: 'Seleccionar varios nombres a la vez',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/notas.txt': 'n\n',
                  '~/carta.txt': 'c\n',
                  '~/apuntes.txt': 'a\n',
                  '~/a.txt': 'a\n',
                  '~/a1.txt': 'a1\n',
                  '~/b2.txt': 'b2\n',
                  '~/foto.png': 'PNG',
                  '~/video.mp4': 'MP4'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'El asterisco vale por cualquier cosa',
                  html: '<p><code>*</code> representa cualquier cadena, incluida la vacía. <code>ls *.txt</code> enseña todos los ficheros que acaban en <code>.txt</code>.</p>',
                  ejemplo: 'ls *.txt',
                  mas: '<p>Los comodines los expande la shell antes de ejecutar el comando, no el comando en sí.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo los .txt',
                  pide: 'Lista solo los ficheros que terminan en <code>.txt</code>.',
                  ejemplo: 'ls *.txt',
                  meta: { muestra: ['notas.txt', 'carta.txt'], noMuestra: 'foto.png' },
                  pista: 'Usa <code>*</code> antes de <code>.txt</code>.',
                  error: 'Casi. Sería <code>ls *.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'La interrogación vale por un carácter',
                  html: '<p><code>?</code> representa <b>exactamente un</b> carácter. <code>ls ?.txt</code> solo encuentra nombres de una letra antes de <code>.txt</code>.</p>',
                  ejemplo: 'ls ?.txt',
                  mas: '<p>Si no hay coincidencias, la shell deja el patrón tal cual y el comando falla.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Nombres de una letra',
                  pide: 'Lista los ficheros <code>.txt</code> cuyo nombre tenga una sola letra.',
                  ejemplo: 'ls ?.txt',
                  meta: { muestra: 'a.txt', noMuestra: 'notas.txt' },
                  pista: 'Es <code>ls ?.txt</code>.',
                  error: 'Casi. Sería <code>ls ?.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Corchetes: elige un carácter',
                  html: '<p><code>[ab]</code> vale por <code>a</code> o <code>b</code>. <code>[a-g]</code> vale por cualquier letra de la a a la g. <code>[!a-g]</code> vale por una que no esté en ese rango.</p>',
                  ejemplo: ['ls [ab]*.txt', 'ls [a-g]*.txt'],
                  mas: '<p>Los corchetes también aceptan rangos de números: <code>[0-9]</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Empiezan por a o b',
                  pide: 'Lista los <code>.txt</code> que empiezan por <code>a</code> o por <code>b</code>.',
                  ejemplo: 'ls [ab]*.txt',
                  meta: { muestra: ['a.txt', 'b2.txt'], noMuestra: 'notas.txt' },
                  pista: 'Usa <code>[ab]</code> al principio del patrón.',
                  error: 'Casi. Sería <code>ls [ab]*.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué ficheros encuentra <code>ls fich?.txt</code>?',
                  opciones: [
                    { t: 'Los que se llaman fich + un carácter + .txt.', ok: true, porque: 'Correcto: <code>?</code> es exactamente un carácter.' },
                    { t: 'Todos los que empiezan por fich.', porque: 'Para eso haría falta <code>fich*.txt</code>.' },
                    { t: 'Solo el fichero que se llame fich.txt.', porque: '<code>?</code> exige un carácter entre fich y .txt.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Llaves',
              resumen: 'Generar nombres y rangos con { }',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Las llaves generan varias palabras',
                  html: '<p><code>{uno,dos,tres}</code> se convierte en tres palabras. <code>mkdir {uno,dos,tres}</code> crea tres carpetas de una vez.</p>',
                  ejemplo: ['mkdir {uno,dos,tres}', 'ls'],
                  mas: '<p>La expansión de llaves ocurre antes que la de comodines, y no necesita que los nombres existan.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Tres fichas',
                  pide: 'Crea de una vez <code>fichaA.txt</code>, <code>fichaB.txt</code> y <code>fichaC.txt</code> con llaves.',
                  ejemplo: 'touch ficha{A,B,C}.txt',
                  meta: { existe: ['~/fichaA.txt', '~/fichaB.txt', '~/fichaC.txt'] },
                  pista: 'Escribe <code>ficha{A,B,C}.txt</code> como argumento de <code>touch</code>.',
                  error: 'Casi. Sería <code>touch ficha{A,B,C}.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Rangos con ..',
                  html: '<p><code>{1..5}</code> genera 1 2 3 4 5. <code>{a..e}</code> genera a b c d e. También admite salto: <code>{1..10..2}</code>.</p>',
                  ejemplo: ['touch f{1..3}.txt', 'ls'],
                  mas: '<p>Las llaves no comprueban si el fichero existe: solo generan texto. Los comodines, en cambio, solo devuelven lo que existe.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Tres carpetas',
                  pide: 'Crea las carpetas <code>dirA</code>, <code>dirB</code> y <code>dirC</code> con un rango de llaves.',
                  ejemplo: 'mkdir dir{A..C}',
                  meta: { existe: ['~/dirA', '~/dirB', '~/dirC'] },
                  pista: 'Usa <code>dir{A..C}</code>.',
                  error: 'Casi. Sería <code>mkdir dir{A..C}</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué diferencia hay entre <code>[a-c]</code> y <code>{a..c}</code>?',
                  opciones: [
                    { t: 'Los corchetes eligen un carácter existente; las llaves generan varios nombres.', ok: true, porque: 'Correcto: el comodín filtra ficheros; las llaves crean texto nuevo.' },
                    { t: 'Son exactamente lo mismo.', porque: 'No: uno es un patrón y el otro una expansión.' },
                    { t: 'Las llaves solo funcionan con números.', porque: 'También funcionan con letras y listas.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'operadores',
          titulo: 'Encadenar comandos',
          resumen: '; && ||',
          comando: '&&',
          rondas: [
            {
              titulo: 'Punto y coma, Y, O',
              resumen: 'Ejecutar uno detrás de otro o según el resultado',
              inicio: { base: 'vacio', fs: { '~/Documentos': { tipo: 'dir' }, '~/notas.txt': 'n\n' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Punto y coma: uno detrás de otro',
                  html: '<p><code>comando1; comando2</code> ejecuta los dos, pase lo que pase con el primero.</p>',
                  ejemplo: ['pwd; ls; date +%F'],
                  mas: '<p>El resultado del primero no impide que se ejecute el segundo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dos comandos seguidos',
                  pide: 'Muestra dónde estás y después lista el contenido, en un solo renglón.',
                  ejemplo: 'pwd; ls',
                  meta: { orden: ['/home/usuario', 'Documentos'] },
                  pista: 'Une <code>pwd</code> y <code>ls</code> con <code>;</code>.',
                  error: 'Casi. Sería <code>pwd; ls</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '&&: solo si el primero sale bien',
                  html: '<p><code>comando1 && comando2</code> ejecuta el segundo <b>solo si</b> el primero termina bien (código 0).</p>',
                  ejemplo: ['cd Documentos && pwd'],
                  mas: '<p>Si el primero falla, el segundo no se ejecuta. Es ideal para «entra y luego lista».</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Entra y comprueba',
                  pide: 'Entra en <code>Documentos</code> y muestra la ruta solo si la entrada sale bien.',
                  ejemplo: 'cd Documentos && pwd',
                  meta: { cwd: '~/Documentos', muestra: '/home/usuario/Documentos' },
                  pista: 'Une <code>cd Documentos</code> y <code>pwd</code> con <code>&&</code>.',
                  error: 'Casi. Sería <code>cd Documentos && pwd</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '||: solo si el primero falla',
                  html: '<p><code>comando1 || comando2</code> ejecuta el segundo <b>solo si</b> el primero falla.</p><p>El código de salida del último comando está en <code>$?</code>: 0 es bien, distinto de 0 es error.</p>',
                  ejemplo: ['cd noexiste || pwd', 'ls noexiste; echo $?'],
                  mas: '<p>Los mensajes de error van por la salida de error, pero el código <code>$?</code> te dice si hubo fallo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Si falla, muestra la ruta',
                  pide: 'Intenta entrar en <code>noexiste</code> y, si falla, muestra dónde estás.',
                  ejemplo: 'cd noexiste || pwd',
                  meta: { muestra: '/home/usuario' },
                  pista: 'Usa <code>||</code> entre <code>cd noexiste</code> y <code>pwd</code>.',
                  error: 'Casi. Sería <code>cd noexiste || pwd</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Cuándo ejecuta <code>a && b</code> el comando <code>b</code>?',
                  opciones: [
                    { t: 'Solo si a termina bien.', ok: true, porque: 'Correcto: <code>&&</code> es el Y lógico.' },
                    { t: 'Siempre.', porque: 'Para ejecutar siempre se usa <code>;</code>.' },
                    { t: 'Solo si a falla.', porque: 'Eso es <code>||</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Combinar y comprobar',
              resumen: 'Cadenas útiles y código de salida',
              inicio: { base: 'vacio', fs: { '~/notas.txt': 'n\n', '~/Documentos': { tipo: 'dir' } } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Se pueden combinar',
                  html: '<p>Puedes unir varios operadores: <code>cd Documentos && ls || echo "no existe"</code>. Primero entra; si sale bien lista, y si algo falla avisa.</p>',
                  ejemplo: ['cd Documentos && ls || echo "no existe"'],
                  mas: '<p>No hace falta memorizar combinaciones raras: con <code>;</code>, <code>&&</code> y <code>||</code> tienes lo básico.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea y copia',
                  pide: 'Crea la carpeta <code>backup</code> y, solo si se crea bien, copia <code>notas.txt</code> dentro.',
                  ejemplo: 'mkdir backup && cp notas.txt backup/',
                  meta: { existe: '~/backup/notas.txt' },
                  pista: 'Une <code>mkdir backup</code> y <code>cp notas.txt backup/</code> con <code>&&</code>.',
                  error: 'Casi. Sería <code>mkdir backup && cp notas.txt backup/</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'El código de salida: $?',
                  html: '<p>Todo comando devuelve un número al terminar. <code>0</code> significa «todo bien»; cualquier otro valor es un error.</p><p><code>echo $?</code> muestra el código del comando anterior.</p>',
                  ejemplo: ['ls noexiste; echo $?'],
                  mas: '<p>Un comando que funciona y no dice nada (como <code>cp</code>) sigue devolviendo 0.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Comprueba un fallo',
                  pide: 'Intenta listar <code>noexiste</code> y muestra su código de salida.',
                  ejemplo: 'ls noexiste; echo $?',
                  meta: { muestra: '1' },
                  pista: 'Después de <code>ls noexiste</code>, escribe <code>echo $?</code>.',
                  error: 'Casi. Sería <code>ls noexiste; echo $?</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Si <code>echo $?</code> muestra <code>0</code>, ¿qué significa?',
                  opciones: [
                    { t: 'Que el comando anterior terminó bien.', ok: true, porque: 'Correcto: 0 es éxito en Linux.' },
                    { t: 'Que el comando anterior falló.', porque: 'Los fallos devuelven un número distinto de 0.' },
                    { t: 'Que no hay ningún comando anterior.', porque: 'Siempre hay un código de salida.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'redirecciones',
          titulo: 'Guardar y conectar',
          resumen: '> >> | 2>',
          comando: '>',
          rondas: [
            {
              titulo: 'Guardar en un fichero',
              resumen: 'Redirigir la salida con > y >>',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: '> guarda la salida',
                  html: '<p><code>echo "Hola" &gt; saludo.txt</code> no imprime en pantalla: escribe «Hola» dentro de <code>saludo.txt</code>.</p><p>Si el fichero no existe, lo crea. Si existe, lo machaca.</p>',
                  ejemplo: ['echo "Hola" > saludo.txt', 'cat saludo.txt'],
                  mas: '<p>La redirección afecta a la salida del comando, no al comando en sí.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea saludo.txt',
                  pide: 'Guarda el texto <code>Hola</code> en <code>saludo.txt</code>.',
                  ejemplo: 'echo "Hola" > saludo.txt',
                  meta: { contenido: { '~/saludo.txt': 'Hola\n' } },
                  pista: 'Usa <code>echo "Hola" &gt; saludo.txt</code>.',
                  error: 'Casi. Sería <code>echo "Hola" &gt; saludo.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '>> añade sin borrar',
                  html: '<p><code>&gt;&gt;</code> añade al final. <code>echo "Adiós" &gt;&gt; saludo.txt</code> deja las dos líneas.</p>',
                  ejemplo: ['echo "Adiós" >> saludo.txt', 'cat saludo.txt'],
                  mas: '<p><code>&gt;</code> borra lo anterior; <code>&gt;&gt;</code> conserva. Es la diferencia más importante.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Añade una despedida',
                  pide: 'Añade <code>Adiós</code> al final de <code>saludo.txt</code> sin borrar lo que ya tiene.',
                  ejemplo: 'echo "Adiós" >> saludo.txt',
                  meta: { contenido: { '~/saludo.txt': 'Hola\nAdiós\n' } },
                  pista: 'Usa <code>&gt;&gt;</code>, no <code>&gt;</code>.',
                  error: 'Casi. Sería <code>echo "Adiós" &gt;&gt; saludo.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué diferencia hay entre <code>&gt;</code> y <code>&gt;&gt;</code>?',
                  opciones: [
                    { t: '> reemplaza el contenido; >> lo añade al final.', ok: true, porque: 'Correcto: uno machaca y el otro conserva.' },
                    { t: '> añade; >> reemplaza.', porque: 'Es al revés.' },
                    { t: 'Son iguales.', porque: 'No: cambia mucho si el fichero ya tiene texto.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Tuberías y errores',
              resumen: '| conecta comandos y 2> guarda los errores',
              inicio: { base: 'vacio', fs: { '~/a.txt': 'a\n', '~/b.txt': 'b\n', '~/c.txt': 'c\n' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'La tubería | conecta comandos',
                  html: '<p><code>ls | wc -l</code> pasa la salida de <code>ls</code> a <code>wc -l</code>, que cuenta las líneas. Así cuentas ficheros sin contarlos a mano.</p>',
                  ejemplo: 'ls | wc -l',
                  mas: '<p>Cada comando de la tubería hace su trabajo y pasa el resultado al siguiente.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Cuenta los ficheros',
                  pide: 'Cuenta cuántos ficheros hay en la carpeta actual usando <code>ls</code> y <code>wc</code>.',
                  ejemplo: 'ls | wc -l',
                  meta: { salida: '3' },
                  pista: 'Conecta <code>ls</code> y <code>wc -l</code> con una barra vertical.',
                  error: 'Casi. Sería <code>ls | wc -l</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '2> guarda los errores',
                  html: '<p>Los errores salen por otra salida. <code>2&gt;</code> los redirige a un fichero: <code>ls noexiste 2&gt; errores.txt</code>.</p>',
                  ejemplo: ['ls noexiste 2> errores.txt', 'cat errores.txt'],
                  mas: '<p><code>&gt;</code> guarda la salida normal; <code>2&gt;</code> guarda los mensajes de error.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Guarda el error',
                  pide: 'Intenta listar <code>noexiste</code> y guarda el mensaje de error en <code>errores.txt</code>.',
                  ejemplo: 'ls noexiste 2> errores.txt',
                  toleraError: true,
                  meta: { existe: '~/errores.txt' },
                  pista: 'Usa <code>2&gt;</code> entre el comando y el fichero.',
                  error: 'Casi. Sería <code>ls noexiste 2&gt; errores.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace la barra <code>|</code> en <code>ls | wc -l</code>?',
                  opciones: [
                    { t: 'Pasa la salida de ls a wc -l.', ok: true, porque: 'Correcto: es una tubería entre dos comandos.' },
                    { t: 'Ejecuta los dos a la vez sin relacionarlos.', porque: 'Los conecta: la salida de uno es la entrada del otro.' },
                    { t: 'Guarda la salida en un fichero.', porque: 'Para guardar se usa <code>&gt;</code>.' }
                  ]
                },
                {
                  tipo: 'test',
                  pregunta: '¿Para qué sirve <code>2&gt;</code>?',
                  opciones: [
                    { t: 'Para redirigir los mensajes de error a un fichero.', ok: true, porque: 'Correcto: el 2 identifica la salida de error.' },
                    { t: 'Para redirigir la salida normal.', porque: 'Eso es <code>&gt;</code>.' },
                    { t: 'Para añadir al final de un fichero.', porque: 'Eso es <code>&gt;&gt;</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Leer de un fichero',
              resumen: 'La entrada con <',
              inicio: {
                base: 'vacio',
                fs: { '~/colores.txt': 'rojo\nverde\nazul\n' }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: '< da la entrada desde un fichero',
                  html: '<p>Hasta ahora has redirigido la salida. <code>&lt;</code> hace lo contrario: mete un fichero como entrada del comando.</p><p><code>wc -l &lt; colores.txt</code> cuenta sus líneas sin que tengas que escribir el nombre detrás de <code>wc</code>.</p>',
                  ejemplo: ['wc -l < colores.txt', 'cat < colores.txt'],
                  mas: '<p>El fichero no se modifica: solo se lee. Para escribir se usa <code>&gt;</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Cuenta sin pasar el nombre',
                  pide: 'Cuenta las líneas de <code>colores.txt</code> usando <code>&lt;</code>, sin poner el nombre detrás de <code>wc</code>.',
                  ejemplo: 'wc -l < colores.txt',
                  meta: { salida: '3' },
                  pista: 'Es <code>wc -l &lt; colores.txt</code>.',
                  error: 'Casi. Sería <code>wc -l &lt; colores.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'La diferencia con pasar el fichero',
                  html: '<p><code>wc -l colores.txt</code> escribe el nombre del fichero en la salida. <code>wc -l &lt; colores.txt</code> solo da el número, porque el nombre se lo das a la shell, no al comando.</p>',
                  ejemplo: ['cat < colores.txt'],
                  mas: '<p>Esa diferencia importa cuando quieres guardar solo el número en una variable o en un fichero.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Lee el fichero',
                  pide: 'Muestra <code>colores.txt</code> con <code>cat</code> y una redirección de entrada.',
                  ejemplo: 'cat < colores.txt',
                  meta: { salida: 'rojo\nverde\nazul' },
                  pista: 'Es <code>cat &lt; colores.txt</code>.',
                  error: 'Casi. Sería <code>cat &lt; colores.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>&lt;</code> en <code>wc -l &lt; fichero</code>?',
                  opciones: [
                    { t: 'Mete el fichero como entrada del comando.', ok: true, porque: 'Redirige la entrada estándar desde ese fichero.' },
                    { t: 'Guarda la salida en el fichero.', porque: 'Para guardar se usa <code>&gt;</code>.' },
                    { t: 'Añade al final del fichero.', porque: 'Eso es <code>&gt;&gt;</code>.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Errores y /dev/null',
              resumen: '2>&1, &>, 2>> y el agujero negro',
              inicio: {
                base: 'vacio',
                fs: { '~/a.txt': 'a\n' }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: '2>&1 junta salida y errores',
                  html: '<p><code>ls noexiste &gt; todo.log 2&gt;&amp;1</code> guarda en <code>todo.log</code> tanto la salida normal como los errores. El orden importa: primero se redirige la salida y después se manda el error a donde está la salida.</p>',
                  ejemplo: ['ls noexiste > todo.log 2>&1', 'cat todo.log'],
                  mas: '<p><code>&amp;&gt;</code> es el atajo: <code>ls noexiste &amp;&gt; todo.log</code> hace lo mismo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Todo junto',
                  pide: 'Intenta listar <code>noexiste</code> y guarda salida y error en <code>todo.log</code>.',
                  ejemplo: 'ls noexiste > todo.log 2>&1',
                  toleraError: true,
                  meta: { existe: '~/todo.log' },
                  pista: 'Primero <code>&gt; todo.log</code> y después <code>2&gt;&amp;1</code>.',
                  error: 'Casi. Sería <code>ls noexiste &gt; todo.log 2&gt;&amp;1</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '&> y 2>>',
                  html: '<p><code>&amp;&gt;</code> guarda las dos salidas de golpe. <code>2&gt;&gt;</code> añade los errores al final de un fichero, sin borrar lo que ya había.</p>',
                  ejemplo: ['ls noexiste &> ambos.log', 'cat ambos.log'],
                  mas: '<p><code>&amp;&gt;&gt;</code> sería el equivalente de añadir con el atajo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Con el atajo',
                  pide: 'Guarda el error de <code>noexiste</code> en <code>ambos.log</code> usando <code>&amp;&gt;</code>.',
                  ejemplo: 'ls noexiste &> ambos.log',
                  toleraError: true,
                  meta: { existe: '~/ambos.log' },
                  pista: 'Es <code>ls noexiste &amp;&gt; ambos.log</code>.',
                  error: 'Casi. Sería <code>ls noexiste &amp;&gt; ambos.log</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '/dev/null: el agujero negro',
                  html: '<p><code>/dev/null</code> es un fichero especial que descarta todo lo que recibe. <code>ls noexiste 2&gt; /dev/null</code> ejecuta el comando pero no enseña el error.</p><p>También se usa para tirar la salida que no te interesa.</p>',
                  ejemplo: ['ls noexiste 2> /dev/null', 'echo silencio'],
                  mas: '<p>Ojo: <code>/dev/null</code> no es una papelera. Lo que envías ahí se pierde para siempre, no se puede recuperar.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Silencia un error',
                  pide: 'Lista <code>a.txt</code> y <code>noexiste</code>, tira el error a <code>/dev/null</code> y guarda la salida en <code>lista.txt</code>.',
                  ejemplo: 'ls a.txt noexiste 2> /dev/null > lista.txt',
                  toleraError: true,
                  meta: { contenido: { '~/lista.txt': 'a.txt\n' } },
                  pista: 'Añade <code>2&gt; /dev/null</code> y <code>&gt; lista.txt</code>.',
                  error: 'Casi. Sería <code>ls a.txt noexiste 2&gt; /dev/null &gt; lista.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>2&gt;&amp;1</code>?',
                  opciones: [
                    { t: 'Manda los errores al mismo sitio que la salida normal.', ok: true, porque: 'Duplica el canal de error sobre el de salida.' },
                    { t: 'Manda la salida normal a los errores.', porque: 'Es al revés: el 2 es el error y el 1 la salida.' },
                    { t: 'Crea un fichero llamado 1.', porque: '<code>&amp;1</code> es una referencia al canal 1, no un nombre.' }
                  ]
                }
              ]
            }
          ]
        }

      ]
    },

    /* ================= MUNDO 4 · NIVEL ASIR ================= */
    {
      id: 'avanzado',
      titulo: 'Nivel ASIR',
      emoji: '🔑',
      resumen: 'Enlaces, alias, fechas y nombres de ruta',
      lecciones: [

        {
          id: 'teclas-avanzado',
          titulo: 'Atajos de nivel',
          resumen: 'Ctrl+Z, Ctrl+D y Ctrl+Alt+E',
          comando: 'teclado',
          rondas: [
            {
              titulo: 'Suspender, cerrar y editar',
              resumen: 'Las teclas que quedan para dominar la terminal',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Cuando el comando no es el problema',
                  html: '<p><kbd>Ctrl</kbd> + <kbd>Z</kbd> suspende el proceso en vez de matarlo. <kbd>Ctrl</kbd> + <kbd>D</kbd> indica el final de la entrada: sirve para cerrar una sesión o terminar un texto. Y <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>E</kbd> abre la línea actual en un editor para escribir comandos largos con comodidad.</p>',
                  mas: '<p>No son teclas para memorizar de golpe. Quédate con la idea: la terminal tiene atajos para casi todo.</p>'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Suspender sin matar',
                  pide: 'Pulsa <kbd>Ctrl</kbd> + <kbd>Z</kbd> para suspender el proceso y devolver el control al prompt.',
                  combo: { ctrl: true, key: 'z' },
                  demo: {
                    antes: ['usuario@linux:~$ sleep 100', '▏'],
                    despues: ['usuario@linux:~$ sleep 100', '^Z', '[1]+  Stopped                 sleep 100', 'usuario@linux:~$ ▏']
                  },
                  pista: 'Ctrl + la última letra del abecedario.',
                  explica: 'Ctrl+Z no borra el proceso: lo deja en pausa. Se puede recuperar con <code>fg</code>. Ctrl+C, en cambio, lo termina.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Editar la línea en nano',
                  pide: 'La línea es larga. Pulsa <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>E</kbd> para abrirla en el editor.',
                  combo: { ctrl: true, alt: true, key: 'e' },
                  demo: {
                    antes: ['usuario@linux:~$ for i in {A..Z}; do touch fich$i.txt; done▏'],
                    despues: ['[editor abierto: escribe con calma y guarda al salir]']
                  },
                  pista: 'Ctrl + Alt + la letra de <i>edit</i>.',
                  explica: 'Ctrl+Alt+E abre la línea en nano. Al guardar y salir, el comando vuelve al prompt listo para ejecutarse.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué diferencia hay entre Ctrl+C y Ctrl+Z?',
                  opciones: [
                    { t: 'Ctrl+C termina el proceso; Ctrl+Z lo suspende.', ok: true, porque: 'Ctrl+C interrumpe y Ctrl+Z deja el proceso en pausa.' },
                    { t: 'Son lo mismo, pero una funciona en nano.', porque: 'No son equivalentes: una termina y la otra suspende.' },
                    { t: 'Ctrl+Z cierra la terminal.', porque: 'Ctrl+Z suspende el proceso; no cierra la terminal.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'ln',
          titulo: 'Enlaces',
          resumen: 'ln y ln -s',
          comando: 'ln',
          rondas: [
            {
              titulo: 'Accesos directos',
              resumen: 'El enlace simbólico con ln -s',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n', '~/Documentos': { tipo: 'dir' } } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Un enlace es un acceso directo',
                  html: '<p><code>ln -s nota.txt acceso</code> crea <code>acceso</code>, que apunta a <code>nota.txt</code>. Al abrir <code>acceso</code> ves el contenido del original.</p>',
                  ejemplo: ['ln -s nota.txt acceso', 'ls -l acceso'],
                  mas: '<p><code>-s</code> significa <i>symbolic</i>: el enlace guarda una ruta, no el contenido.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea el acceso',
                  pide: 'Crea un enlace simbólico llamado <code>acceso</code> que apunte a <code>nota.txt</code>.',
                  ejemplo: 'ln -s nota.txt acceso',
                  meta: { enlace: { path: '~/acceso', destino: '~/nota.txt' } },
                  pista: 'Es <code>ln -s</code>, después el original y por último el nombre del enlace.',
                  error: 'Casi. Sería <code>ln -s nota.txt acceso</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Se ve en ls -l',
                  html: '<p>En <code>ls -l</code>, un enlace empieza por <code>l</code> y enseña a dónde apunta con una flecha: <code>acceso -&gt; nota.txt</code>.</p>',
                  ejemplo: ['ls -l'],
                  mas: '<p>Si borras el original, el enlace simbólico se queda roto: apunta a algo que ya no existe.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Enlaza una carpeta',
                  pide: 'Crea un enlace llamado <code>docs</code> que apunte a la carpeta <code>Documentos</code>.',
                  ejemplo: 'ln -s Documentos docs',
                  meta: { enlace: { path: '~/docs', destino: '~/Documentos' } },
                  pista: 'También vale para carpetas: <code>ln -s Documentos docs</code>.',
                  error: 'Casi. Sería <code>ln -s Documentos docs</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué crea <code>ln -s original enlace</code>?',
                  opciones: [
                    { t: 'Un enlace simbólico que apunta al original.', ok: true, porque: 'Correcto: <code>-s</code> crea un enlace simbólico, como un acceso directo.' },
                    { t: 'Una copia completa del original.', porque: 'Para copiar se usa <code>cp</code>.' },
                    { t: 'Un enlace duro, sin usar ruta.', porque: 'El enlace duro se crea sin <code>-s</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Duros y blandos',
              resumen: 'ln sin -s y sus diferencias',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Enlace duro: sin -s',
                  html: '<p><code>ln nota.txt duro</code> crea otro nombre para el mismo contenido. No hay flecha: para el sistema son el mismo fichero.</p>',
                  ejemplo: ['ln nota.txt duro', 'cat duro', 'ls -l'],
                  mas: '<p>Los enlaces duros no pueden apuntar a carpetas ni cruzar de disco. Los simbólicos sí.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Crea un enlace duro',
                  pide: 'Crea un enlace duro llamado <code>duro</code> a partir de <code>nota.txt</code> y comprueba que se lee.',
                  ejemplo: 'ln nota.txt duro; cat duro',
                  meta: { contenido: { '~/duro': 'hola\n' }, muestra: 'hola' },
                  pista: 'Sin <code>-s</code>: <code>ln nota.txt duro; cat duro</code>.',
                  error: 'Casi. Sería <code>ln nota.txt duro; cat duro</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'La diferencia importante',
                  html: '<p>Un enlace <b>duro</b> sobrevive aunque borres el nombre original: el contenido sigue ahí. Un enlace <b>simbólico</b> se rompe si desaparece el original.</p>',
                  ejemplo: ['ls -l duro', 'ln -s nota.txt blando', 'ls -l blando'],
                  mas: '<p>Los enlaces simbólicos se usan mucho para rutas cómodas: <code>ln -s /var/www/html web</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Los dos a la vez',
                  pide: 'Crea un enlace simbólico <code>blando</code> a <code>nota.txt</code> y lista los dos enlaces.',
                  ejemplo: 'ln -s nota.txt blando; ls -l',
                  meta: { enlace: { path: '~/blando', destino: '~/nota.txt' }, muestra: ['duro', 'blando'] },
                  pista: 'Primero <code>ln -s nota.txt blando</code> y después <code>ls -l</code>.',
                  error: 'Casi. Sería <code>ln -s nota.txt blando; ls -l</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Si borras <code>nota.txt</code>, ¿qué enlace deja de funcionar?',
                  opciones: [
                    { t: 'El simbólico, porque apunta a una ruta que ya no existe.', ok: true, porque: 'Correcto: el enlace simbólico solo guarda el camino.' },
                    { t: 'El duro, porque guarda el nombre original.', porque: 'El duro mantiene el contenido aunque borres el otro nombre.' },
                    { t: 'Ninguno: los enlaces son copias independientes.', porque: 'Un simbólico no es una copia: depende del original.' }
                  ]
                }
              ]
            },

            {
              titulo: 'El mismo inodo',
              resumen: 'Comprobar enlaces con ls -li y stat',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Dos nombres, un mismo fichero',
                  html: '<p>Cada fichero tiene un número de <b>inodo</b>. Los enlaces duros comparten ese número: son dos nombres del mismo contenido.</p><p><code>ls -li</code> lo enseña en la primera columna y <code>stat</code> lo detalla.</p>',
                  ejemplo: ['ln nota.txt duro', 'ls -li', 'stat duro'],
                  mas: '<p>Si dos ficheros tienen inodos distintos, son ficheros distintos aunque se llamen parecido.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Comprueba el inodo',
                  pide: 'Crea un enlace duro llamado <code>duro</code> y comprueba con <code>stat</code> que los dos tienen el mismo inodo.',
                  ejemplo: 'ln nota.txt duro; stat nota.txt; stat duro',
                  meta: { muestra: /Inodo:\s+(\d+)[\s\S]*Inodo:\s+\1/ },
                  pista: 'Crea el enlace y ejecuta <code>stat</code> sobre los dos nombres.',
                  error: 'Casi. Sería <code>ln nota.txt duro; stat nota.txt; stat duro</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'El simbólico tiene su propio inodo',
                  html: '<p>Un enlace simbólico es un fichero aparte que guarda una ruta. Por eso su inodo es distinto y en <code>ls -l</code> aparece con una flecha.</p>',
                  ejemplo: ['ln -s nota.txt blando', 'ls -li blando nota.txt'],
                  mas: '<p>El enlace duro no guarda ruta: guarda el mismo inodo. Por eso no puede cruzar de disco.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'La flecha del simbólico',
                  pide: 'Crea un enlace simbólico <code>blando</code> y lista su línea para ver la flecha.',
                  ejemplo: 'ln -s nota.txt blando; ls -l blando',
                  meta: { muestra: '-> /home/usuario/nota.txt' },
                  pista: 'Es <code>ln -s nota.txt blando</code> y después <code>ls -l blando</code>.',
                  error: 'Casi. Sería <code>ln -s nota.txt blando; ls -l blando</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: 'Dos enlaces duros al mismo fichero, ¿qué comparten?',
                  opciones: [
                    { t: 'El número de inodo.', ok: true, porque: 'Correcto: son dos nombres del mismo fichero.' },
                    { t: 'Solo el nombre.', porque: 'Los nombres son distintos; lo que comparten es el inodo.' },
                    { t: 'Nada: son copias separadas.', porque: 'Una copia con <code>cp</code> tendría otro inodo.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'alias',
          titulo: 'Alias',
          resumen: 'alias y unalias',
          comando: 'alias',
          rondas: [
            {
              titulo: 'Atajos propios',
              resumen: 'Crear, listar y ejecutar un alias',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Un alias es un sobrenombre',
                  html: '<p><code>alias l=\'ls -l\'</code> hace que escribir <code>l</code> ejecute <code>ls -l</code>. Es un atajo que defines tú.</p>',
                  ejemplo: ["alias l='ls -l'", 'alias', 'l'],
                  mas: '<p>Sin espacios alrededor del <code>=</code>. Si los pones, la shell cree que es otra cosa.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Define el atajo',
                  pide: 'Crea el alias <code>ll</code> para <code>ls -l</code> y compruébalo con <code>alias</code>.',
                  ejemplo: "alias ll='ls -l'; alias",
                  meta: { muestra: "alias ll='ls -l'" },
                  pista: 'Es <code>alias ll=\'ls -l\'</code> y después <code>alias</code>.',
                  error: 'Casi. Sería <code>alias ll=\'ls -l\'; alias</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Los alias se borran con unalias',
                  html: '<p><code>unalias ll</code> elimina el alias. <code>unalias -a</code> los borra todos de la sesión.</p>',
                  ejemplo: ['unalias ll', 'alias'],
                  mas: '<p>Los alias viven en la sesión. Para que sigan al abrir otra terminal se escriben en <code>~/.bashrc</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Usa el alias de verdad',
                  pide: 'Crea el alias <code>l</code> para <code>ls -l</code> y ejecútalo para ver el formato largo.',
                  ejemplo: "alias l='ls -l'; l",
                  meta: { muestra: '-rw-' },
                  pista: 'Define <code>alias l=\'ls -l\'</code> y luego escribe <code>l</code>.',
                  error: 'Casi. Sería <code>alias l=\'ls -l\'; l</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Para qué sirve un alias?',
                  opciones: [
                    { t: 'Para ejecutar un comando largo con un nombre corto.', ok: true, porque: 'Correcto: es un atajo que tú defines.' },
                    { t: 'Para borrar un comando del sistema.', porque: 'Los alias no borran nada: solo añaden nombres.' },
                    { t: 'Para cambiar los permisos de un fichero.', porque: 'Para eso se usa <code>chmod</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Alias con argumentos',
              resumen: 'Varios alias, unalias -a y persistencia',
              inicio: { base: 'vacio', fs: { '~/nota.txt': 'hola\n', '/etc': { tipo: 'dir' }, '/etc/hosts': '127.0.0.1 localhost\n' } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'El alias admite argumentos',
                  html: '<p>Si el alias es <code>alias l=\'ls -l\'</code>, escribir <code>l Documentos</code> ejecuta <code>ls -l Documentos</code>: lo que añades se pega al final.</p>',
                  ejemplo: ["alias l='ls -l'", 'l /etc'],
                  mas: '<p>Por eso conviene que el alias sea un comando completo, no media orden.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Alias con eco',
                  pide: 'Crea el alias <code>saluda</code> que ejecute <code>echo Hola</code> y usa el alias.',
                  ejemplo: "alias saluda='echo Hola'; saluda",
                  meta: { muestra: 'Hola' },
                  pista: 'Es <code>alias saluda=\'echo Hola\'</code> y después <code>saluda</code>.',
                  error: 'Casi. Sería <code>alias saluda=\'echo Hola\'; saluda</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Varios de golpe y borrado total',
                  html: '<p>Puedes definir varios alias en una línea. <code>unalias -a</code> los elimina todos.</p>',
                  ejemplo: ["alias a='pwd' b='ls'", 'alias', 'unalias -a', 'alias'],
                  mas: '<p>Para que un alias sea permanente, añade su definición al final de <code>~/.bashrc</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dos alias y fuera',
                  pide: 'Crea los alias <code>a</code> y <code>b</code>, lístalos y bórralos todos.',
                  ejemplo: "alias a='pwd' b='ls'; alias; unalias -a",
                  meta: { orden: ["alias a='pwd'", "alias b='ls'"] },
                  pista: 'Define los dos, ejecuta <code>alias</code> y termina con <code>unalias -a</code>.',
                  error: 'Casi. Sería <code>alias a=\'pwd\' b=\'ls\'; alias; unalias -a</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>unalias -a</code>?',
                  opciones: [
                    { t: 'Borra todos los alias de la sesión.', ok: true, porque: 'Correcto: <code>-a</code> significa <i>all</i>.' },
                    { t: 'Borra solo el último alias creado.', porque: 'Para borrar uno concreto se pone su nombre, sin <code>-a</code>.' },
                    { t: 'Muestra todos los alias.', porque: 'Para mostrarlos se ejecuta <code>alias</code> sin nada más.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Un alias para todo',
              resumen: 'Atajos para tree y borrado selectivo',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/proyecto': { tipo: 'dir' },
                  '~/proyecto/nota.txt': 'hola\n',
                  '~/proyecto/src': { tipo: 'dir' },
                  '~/proyecto/src/main.c': 'int main(){}\n',
                  '/etc': { tipo: 'dir' },
                  '/etc/hostname': 'mi-equipo\n'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Atajo para un comando con opciones',
                  html: '<p>Los alias no son solo para <code>ls</code>. También puedes crear uno para <code>tree</code> y usarlo con cualquier ruta: <code>arbol proyecto</code>.</p>',
                  ejemplo: ["alias arbol='tree'", 'arbol proyecto', 'unalias arbol'],
                  mas: '<p>Al escribir el alias con una ruta detrás, la ruta se añade al comando guardado.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dibuja /etc con un alias',
                  pide: 'Crea el alias <code>arbol</code> para <code>tree</code> y úsalo con <code>/etc</code>.',
                  ejemplo: "alias arbol='tree'; arbol /etc",
                  meta: { muestra: ['etc', 'hostname'] },
                  pista: 'Define <code>alias arbol=\'tree\'</code> y después escribe <code>arbol /etc</code>.',
                  error: 'Casi. Sería <code>alias arbol=\'tree\'; arbol /etc</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Se borran uno a uno',
                  html: '<p><code>unalias arbol</code> borra solo ese alias. Los demás siguen vivos. Después, <code>alias</code> ya no lo muestra.</p>',
                  ejemplo: ["alias arbol='tree' l='ls -l'", 'unalias arbol', 'alias'],
                  mas: '<p>Los alias duran lo que dura la sesión. Para conservarlos, se escriben en <code>~/.bashrc</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borra solo uno',
                  pide: 'Crea los alias <code>a</code> y <code>b</code>, borra <code>a</code> y comprueba que solo queda <code>b</code>.',
                  ejemplo: "alias a='pwd' b='ls'; unalias a; alias",
                  meta: { muestra: "alias b='ls'", noMuestra: 'alias a=' },
                  pista: 'Define los dos, ejecuta <code>unalias a</code> y termina con <code>alias</code>.',
                  error: 'Casi. Sería <code>alias a=\'pwd\' b=\'ls\'; unalias a; alias</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Dónde se escribe un alias para que siga ahí al abrir otra terminal?',
                  opciones: [
                    { t: 'En ~/.bashrc.', ok: true, porque: 'Correcto: ese fichero se lee al arrancar la shell.' },
                    { t: 'En /etc/hostname.', porque: 'Ese fichero guarda el nombre del equipo.' },
                    { t: 'En un fichero dentro de ~/Documentos.', porque: 'La shell no lee esa carpeta al arrancar.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'fechas',
          titulo: 'Fecha y calendario',
          resumen: 'date y cal',
          comando: 'date',
          rondas: [
            {
              titulo: 'date y sus formatos',
              resumen: 'La fecha del sistema con +%F y +%B',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'date enseña la hora del sistema',
                  html: '<p><code>date</code> muestra la fecha y la hora actuales. Con un formato detrás de <code>+</code> eliges qué parte ver.</p>',
                  ejemplo: ['date', 'date +%F', 'date +%B'],
                  mas: '<p><code>%F</code> es el formato año-mes-día; <code>%B</code> es el nombre del mes.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Fecha corta',
                  pide: 'Muestra la fecha en formato <code>AAAA-MM-DD</code>.',
                  ejemplo: 'date +%F',
                  meta: { muestra: /^\d{4}-\d{2}-\d{2}$/ },
                  pista: 'El formato es <code>date +%F</code>.',
                  error: 'Casi. Sería <code>date +%F</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'El mes en palabras',
                  pide: 'Muestra solo el nombre del mes actual.',
                  ejemplo: 'date +%B',
                  meta: { muestra: /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)$/ },
                  pista: 'Usa <code>date +%B</code>.',
                  error: 'Casi. Sería <code>date +%B</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Formatos que se piden en los ejercicios',
                  html: '<p><code>date +%d%m%y</code> da día, mes y año en dos cifras cada uno: por ejemplo, <code>281026</code>.</p>',
                  ejemplo: ['date +%d%m%y'],
                  mas: '<p>También existen <code>%A</code> (día de la semana), <code>%H</code> (hora) y <code>%M</code> (minutos).</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Seis cifras',
                  pide: 'Muestra la fecha como <code>ddmmaa</code>, sin separadores.',
                  ejemplo: 'date +%d%m%y',
                  meta: { muestra: /^\d{6}$/ },
                  pista: 'Es <code>date +%d%m%y</code>.',
                  error: 'Casi. Sería <code>date +%d%m%y</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'El día de la semana',
                  pide: 'Muestra el día de la semana actual en palabras.',
                  ejemplo: 'date +%A',
                  meta: { muestra: /^(domingo|lunes|martes|miércoles|jueves|viernes|sábado)$/ },
                  pista: 'El formato del día es <code>%A</code>.',
                  error: 'Casi. Sería <code>date +%A</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué formato da <code>date +%F</code>?',
                  opciones: [
                    { t: 'AAAA-MM-DD, por ejemplo 2026-10-28.', ok: true, porque: 'Correcto: es el formato ISO que usa medio mundo.' },
                    { t: 'DD/MM/AAAA, por ejemplo 28/10/2026.', porque: 'Ese formato se consigue con otros especificadores.' },
                    { t: 'Solo la hora, sin fecha.', porque: 'Para la hora están <code>%H</code> y <code>%M</code>.' }
                  ]
                }
              ]
            },

            {
              titulo: 'cal y meses',
              resumen: 'Calendario de un mes concreto',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'cal dibuja el calendario',
                  html: '<p><code>cal</code> sin argumentos enseña el mes actual. <code>cal 12 1970</code> enseña diciembre de 1970: primero el mes y después el año.</p>',
                  ejemplo: ['cal', 'cal 12 1970'],
                  mas: '<p>La opción <code>-3</code> añade el mes anterior y el siguiente.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Diciembre de 1970',
                  pide: 'Muestra el calendario de diciembre de 1970.',
                  ejemplo: 'cal 12 1970',
                  meta: { muestra: ['December 1970', '31'] },
                  pista: 'Es <code>cal 12 1970</code>: mes y año.',
                  error: 'Casi. Sería <code>cal 12 1970</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Tres meses de golpe',
                  html: '<p><code>cal -3 12 1970</code> enseña noviembre, diciembre y enero alrededor de esa fecha.</p>',
                  ejemplo: ['cal -3 12 1970'],
                  mas: '<p><code>cal</code> viene del paquete <code>ncal</code>. Si no está instalado: <code>apt install ncal</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Los tres meses',
                  pide: 'Muestra los meses de alrededor de diciembre de 1970.',
                  ejemplo: 'cal -3 12 1970',
                  meta: { muestra: ['November 1970', 'December 1970', 'January 1971'] },
                  pista: 'Añade <code>-3</code> delante del mes y el año.',
                  error: 'Casi. Sería <code>cal -3 12 1970</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué muestra <code>cal 12 1970</code>?',
                  opciones: [
                    { t: 'El calendario de diciembre de 1970.', ok: true, porque: 'Correcto: primero el mes y después el año.' },
                    { t: 'El calendario de diciembre de 2012.', porque: 'El orden es mes y año, no al revés.' },
                    { t: 'Los doce meses de 1970.', porque: 'Para eso haría falta otra opción; aquí solo se pide un mes.' }
                  ]
                }
              ]
            },

            {
              titulo: 'La fecha en una variable',
              resumen: 'Guardar date con $(...) y combinar comandos',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Guardar la salida de date',
                  html: '<p>Con <code>fecha=$(date +%F)</code> guardas la fecha en una variable. Después <code>echo $fecha</code> la muestra cuando quieras.</p>',
                  ejemplo: ['fecha=$(date +%F)', 'echo $fecha'],
                  mas: '<p>Los paréntesis con <code>$</code> se llaman sustitución de comandos: ejecutan lo de dentro y devuelven su salida.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Guarda y muestra',
                  pide: 'Guarda la fecha <code>AAAA-MM-DD</code> en la variable <code>hoy</code> y muéstrala.',
                  ejemplo: 'hoy=$(date +%F); echo $hoy',
                  meta: { muestra: /^\d{4}-\d{2}-\d{2}$/ },
                  pista: 'Es <code>hoy=$(date +%F); echo $hoy</code>.',
                  error: 'Casi. Sería <code>hoy=$(date +%F); echo $hoy</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Tres comandos, una línea',
                  html: '<p>Puedes unir varios comandos con <code>;</code>. <code>date; pwd; cal</code> enseña la hora, la carpeta y el calendario del mes.</p>',
                  ejemplo: ['date; pwd; cal'],
                  mas: '<p>El punto y coma ejecuta el siguiente comando pase lo que pase; <code>&amp;&amp;</code> solo si el anterior sale bien.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Fecha, carpeta y calendario',
                  pide: 'Muestra en una sola línea la fecha, la carpeta actual y el calendario.',
                  ejemplo: 'date; pwd; cal',
                  meta: { muestra: ['/home/usuario', /\d{2}:\d{2}:\d{2}/] },
                  pista: 'Une <code>date</code>, <code>pwd</code> y <code>cal</code> con punto y coma.',
                  error: 'Casi. Sería <code>date; pwd; cal</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>echo $(date +%F)</code>?',
                  opciones: [
                    { t: 'Ejecuta date +%F y muestra su resultado.', ok: true, porque: 'Correcto: la sustitución devuelve la fecha y echo la imprime.' },
                    { t: 'Muestra el texto date +%F tal cual.', porque: 'Eso pasaría sin el <code>$</code> y los paréntesis.' },
                    { t: 'Guarda la fecha en un fichero.', porque: 'Para guardar en un fichero se usa una redirección.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Fechas relativas',
              resumen: 'date -d y sus frases',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'date -d calcula otra fecha',
                  html: '<p><code>date -d</code> acepta una frase y calcula la fecha: <code>date -d tomorrow</code>, <code>date -d "next friday"</code> o <code>date -d "1 week ago"</code>.</p><p>Si añades un formato detrás, ves solo lo que te interesa.</p>',
                  ejemplo: ['date -d tomorrow +%F', 'date -d "next friday" +%F', 'date -d "1 week ago" +%F'],
                  mas: '<p>Las frases van en inglés en un Linux real. También puedes escribir una fecha concreta: <code>date -d "2026-01-31" +%F</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mañana',
                  pide: 'Muestra la fecha de mañana en formato <code>AAAA-MM-DD</code>.',
                  ejemplo: 'date -d tomorrow +%F',
                  meta: { muestra: /^\d{4}-\d{2}-\d{2}$/ },
                  pista: 'Es <code>date -d tomorrow +%F</code>.',
                  error: 'Casi. Sería <code>date -d tomorrow +%F</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Hace una semana',
                  pide: 'Muestra la fecha de hace una semana en formato <code>AAAA-MM-DD</code>.',
                  ejemplo: 'date -d "1 week ago" +%F',
                  meta: { muestra: /^\d{4}-\d{2}-\d{2}$/ },
                  pista: 'Usa <code>date -d "1 week ago" +%F</code>.',
                  error: 'Casi. Sería <code>date -d "1 week ago" +%F</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Una fecha concreta también vale',
                  html: '<p>No hace falta que la frase sea relativa: <code>date -d "2026-01-31" +%A</code> dice qué día de la semana fue esa fecha.</p>',
                  ejemplo: ['date -d "2026-01-31" +%A'],
                  mas: '<p>Es una forma cómoda de comprobar fechas de exámenes, entregas o exámenes pasados.</p>'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué muestra <code>date -d tomorrow +%F</code>?',
                  opciones: [
                    { t: 'La fecha de mañana en formato AAAA-MM-DD.', ok: true, porque: '<code>-d tomorrow</code> calcula mañana y <code>+%F</code> le da ese formato.' },
                    { t: 'La fecha de hoy sin más.', porque: 'Para hoy basta con <code>date +%F</code>.' },
                    { t: 'La hora de mañana.', porque: '<code>%F</code> es fecha; para la hora están <code>%H</code> y <code>%M</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'rutas',
          titulo: 'Nombres de ruta',
          resumen: 'basename y dirname',
          comando: 'basename',
          rondas: [
            {
              titulo: 'Separar carpeta y fichero',
              resumen: 'basename y dirname sobre una ruta',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'basename se queda con el final',
                  html: '<p><code>basename /home/usuario/ficheros/nota.txt</code> devuelve <code>nota.txt</code>: solo el nombre del último tramo.</p>',
                  ejemplo: ['basename /home/usuario/ficheros/nota.txt'],
                  mas: '<p>Se usa en scripts para quedarse con el nombre de un fichero sin importar en qué carpeta esté.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo el nombre',
                  pide: 'Obtén solo el nombre del fichero de la ruta <code>/home/usuario/practicas/tema1.txt</code>.',
                  ejemplo: 'basename /home/usuario/practicas/tema1.txt',
                  meta: { salida: 'tema1.txt' },
                  pista: 'Es <code>basename</code> y la ruta completa.',
                  error: 'Casi. Sería <code>basename /home/usuario/practicas/tema1.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'dirname se queda con la carpeta',
                  html: '<p><code>dirname /home/usuario/ficheros/nota.txt</code> devuelve <code>/home/usuario/ficheros</code>: todo menos el nombre final.</p>',
                  ejemplo: ['dirname /home/usuario/ficheros/nota.txt'],
                  mas: '<p>Los dos comandos no comprueban si la ruta existe: solo parten el texto.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo la carpeta',
                  pide: 'Obtén la carpeta de la ruta <code>/home/usuario/practicas/tema1.txt</code>.',
                  ejemplo: 'dirname /home/usuario/practicas/tema1.txt',
                  meta: { salida: '/home/usuario/practicas' },
                  pista: 'Es <code>dirname</code> y la ruta completa.',
                  error: 'Casi. Sería <code>dirname /home/usuario/practicas/tema1.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué devuelve <code>dirname /etc/hosts</code>?',
                  opciones: [
                    { t: '/etc', ok: true, porque: 'Correcto: quita el nombre del fichero y deja la carpeta.' },
                    { t: 'hosts', porque: 'Eso lo devuelve <code>basename</code>.' },
                    { t: '/etc/hosts', porque: '<code>dirname</code> siempre recorta el último tramo.' }
                  ]
                }
              ]
            },

            {
              titulo: 'Quitar la extensión',
              resumen: 'basename con sufijo y dirname relativo',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'basename puede quitar el sufijo',
                  html: '<p>Si añades un segundo argumento, <code>basename</code> lo elimina del final: <code>basename /home/usuario/fichero1.txt .txt</code> devuelve <code>fichero1</code>.</p>',
                  ejemplo: ['basename /home/usuario/fichero1.txt .txt'],
                  mas: '<p>El sufijo se quita tal cual se escribe. Si pones <code>txt</code> sin el punto, el resultado conserva el punto: <code>fichero1.</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Sin la extensión',
                  pide: 'Obtén el nombre <code>fichero1</code> a partir de <code>/home/usuario/fichero1.txt</code>, quitando <code>.txt</code>.',
                  ejemplo: 'basename /home/usuario/fichero1.txt .txt',
                  meta: { salida: 'fichero1' },
                  pista: 'Es <code>basename</code>, la ruta y después <code>.txt</code>.',
                  error: 'Casi. Sería <code>basename /home/usuario/fichero1.txt .txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'dirname también con rutas relativas',
                  html: '<p><code>dirname Documentos/tema1.txt</code> devuelve <code>Documentos</code>. Si la ruta no tiene carpeta, como <code>nota.txt</code>, devuelve un punto: <code>.</code>.</p>',
                  ejemplo: ['dirname Documentos/tema1.txt', 'dirname nota.txt'],
                  mas: '<p><code>.</code> significa «la carpeta actual». Es la misma idea que usas con <code>cd .</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'La carpeta relativa',
                  pide: 'Obtén la carpeta de la ruta relativa <code>Documentos/tema1.txt</code>.',
                  ejemplo: 'dirname Documentos/tema1.txt',
                  meta: { salida: 'Documentos' },
                  pista: 'Es <code>dirname</code> y la ruta relativa.',
                  error: 'Casi. Sería <code>dirname Documentos/tema1.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué devuelve <code>basename /home/usuario/notas.txt .txt</code>?',
                  opciones: [
                    { t: 'notas', ok: true, porque: 'Correcto: quita la carpeta y después el sufijo .txt.' },
                    { t: '/home/usuario', porque: 'Eso lo devuelve <code>dirname</code>.' },
                    { t: 'notas.txt', porque: 'Ese sería el resultado sin el segundo argumento.' }
                  ]
                }
              ]
            }
          ]
        },

        /* ---------------- USUARIOS Y PROCESOS ---------------- */
        {
          id: 'usuarios',
          titulo: 'Usuarios y procesos',
          resumen: 'who, users, ps y time',
          comando: 'who',
          rondas: [
            {
              titulo: 'Quién está conectado',
              resumen: 'who, users y whoami',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'who enseña las sesiones abiertas',
                  html: '<p><code>who</code> muestra cada usuario conectado, su terminal y la hora en que entró. Es la forma rápida de saber si alguien más está usando el sistema.</p>',
                  ejemplo: ['who', 'users'],
                  mas: '<p>En un servidor puede haber varias sesiones del mismo usuario en terminales distintas.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Quién está conectado',
                  pide: 'Muestra las sesiones conectadas con <code>who</code>.',
                  ejemplo: 'who',
                  meta: { muestra: ['usuario', 'tty1'] },
                  pista: 'Es solo el comando <code>who</code>.',
                  error: 'Casi. Sería <code>who</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'users y whoami',
                  html: '<p><code>users</code> da una lista compacta de nombres, sin terminales ni horas. <code>whoami</code> dice solo quién eres tú.</p>',
                  ejemplo: ['users', 'whoami'],
                  mas: '<p><code>whoami</code> es útil dentro de un script para comprobar con qué usuario se está ejecutando.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Tu usuario',
                  pide: 'Muestra solo el nombre de tu usuario.',
                  ejemplo: 'whoami',
                  meta: { salida: 'usuario' },
                  pista: 'El comando empieza por <i>who</i>.',
                  error: 'Casi. Sería <code>whoami</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Cuenta las sesiones',
                  pide: 'Cuenta cuántas líneas devuelve <code>who</code> usando una tubería.',
                  ejemplo: 'who | wc -l',
                  meta: { salida: '1' },
                  pista: 'Conecta <code>who</code> y <code>wc -l</code> con <code>|</code>.',
                  error: 'Casi. Sería <code>who | wc -l</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué diferencia hay entre <code>who</code> y <code>users</code>?',
                  opciones: [
                    { t: 'who da detalles de cada sesión; users solo los nombres.', ok: true, porque: '<code>who</code> añade terminal y hora de entrada.' },
                    { t: 'who muestra procesos; users muestra usuarios.', porque: 'Para procesos está <code>ps</code>.' },
                    { t: 'Son exactamente iguales.', porque: '<code>users</code> es la versión compacta.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Procesos',
              resumen: 'ps, PID, TTY, TIME y CMD',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'ps enseña los procesos',
                  html: '<p><code>ps</code> lista los procesos de la sesión. Cada línea tiene cuatro columnas: <b>PID</b> (número del proceso), <b>TTY</b> (terminal), <b>TIME</b> (tiempo de CPU) y <b>CMD</b> (comando).</p>',
                  ejemplo: ['ps'],
                  mas: '<p>El proceso <code>ps</code> también aparece en la lista: es el que estás ejecutando en ese momento.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mira los procesos',
                  pide: 'Muestra los procesos con <code>ps</code>.',
                  ejemplo: 'ps',
                  meta: { muestra: ['PID', 'bash', 'ps'] },
                  pista: 'Son dos letras: <code>p</code> y <code>s</code>.',
                  error: 'Casi. Sería <code>ps</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'El PID identifica el proceso',
                  html: '<p>El <b>PID</b> es el número con el que el sistema identifica cada proceso. Sirve para seguirlo, pararlo o saber cuál consume recursos.</p>',
                  ejemplo: ['ps'],
                  mas: '<p>Los PID cambian cada vez que arrancas un proceso; no son fijos.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Cuenta los procesos',
                  pide: 'Cuenta las líneas de <code>ps</code>, incluida la cabecera.',
                  ejemplo: 'ps | wc -l',
                  meta: { salida: '3' },
                  pista: 'Pasa la salida de <code>ps</code> a <code>wc -l</code>.',
                  error: 'Casi. Sería <code>ps | wc -l</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué es el PID de un proceso?',
                  opciones: [
                    { t: 'Su número de identificación en el sistema.', ok: true, porque: 'Con ese número el sistema distingue unos procesos de otros.' },
                    { t: 'El tiempo que lleva ejecutándose.', porque: 'Eso está en la columna <code>TIME</code>.' },
                    { t: 'La terminal donde se ejecuta.', porque: 'Eso es la columna <code>TTY</code>.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Cuánto tarda',
              resumen: 'time y el tiempo real',
              inicio: { base: 'vacio' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'time mide la duración',
                  html: '<p><code>time who</code> ejecuta <code>who</code> y además dice cuánto ha tardado. La línea <code>real</code> es el tiempo de reloj: lo que has esperado de verdad.</p>',
                  ejemplo: ['time who'],
                  mas: '<p>En un Linux real también aparecen <code>user</code> y <code>sys</code>; aquí basta con <code>real</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Mide who',
                  pide: 'Mide cuánto tarda <code>who</code>.',
                  ejemplo: 'time who',
                  meta: { muestra: /real 0m/ },
                  pista: 'Pon <code>time</code> delante del comando.',
                  error: 'Casi. Sería <code>time who</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Para comparar comandos',
                  html: '<p><code>time</code> sirve para comparar alternativas: dos formas de buscar lo mismo, dos scripts, dos comandos. El que tarde menos, mejor.</p>',
                  ejemplo: ['time ps'],
                  mas: '<p>No confundas <code>time</code> con la columna <code>TIME</code> de <code>ps</code>: una mide el reloj y la otra el tiempo de CPU acumulado.</p>'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué mide la línea <code>real</code> de <code>time</code>?',
                  opciones: [
                    { t: 'El tiempo de reloj que ha durado el comando.', ok: true, porque: 'Es lo que has esperado desde que pulsaste Enter.' },
                    { t: 'El número de procesos creados.', porque: 'Eso no lo cuenta <code>time</code>.' },
                    { t: 'Los permisos del comando.', porque: 'Para permisos está <code>ls -l</code> o <code>stat</code>.' }
                  ]
                }
              ]
            }
          ]
        }

      ]
    },

    /* ================= MUNDO 5 · BUSCAR Y FILTRAR ================= */
    {
      id: 'buscar',
      titulo: 'Buscar y filtrar',
      emoji: '🔎',
      resumen: 'grep, wc, find, tee, xargs, locate y which',
      lecciones: [

        {
          id: 'teclas-buscar',
          titulo: 'Buscar sin ratón',
          resumen: 'Ctrl+R y Ctrl+G',
          comando: 'teclado',
          rondas: [
            {
              titulo: 'Encontrar en el historial',
              resumen: 'Buscar un comando antiguo y salir de la búsqueda',
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'El historial también se busca',
                  html: '<p>No hace falta recorrer el historial con <kbd>↑</kbd> veinte veces. <kbd>Ctrl</kbd> + <kbd>R</kbd> abre una búsqueda inversa: escribes un trozo del comando y la shell te enseña el más reciente que coincide.</p><p>Si no era ese, vuelves a pulsar <kbd>Ctrl</kbd> + <kbd>R</kbd> para ir al anterior. Y <kbd>Ctrl</kbd> + <kbd>G</kbd> cancela la búsqueda sin ejecutar nada.</p>',
                  mas: '<p>Cuando encuentras el comando, pulsa <kbd>Enter</kbd> para ejecutarlo o <kbd>→</kbd> para editarlo antes.</p>'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Buscar en el historial',
                  pide: 'Quieres recuperar un comando que llevaba <code>grep</code>. Pulsa <kbd>Ctrl</kbd> + <kbd>R</kbd> para abrir la búsqueda inversa.',
                  combo: { ctrl: true, key: 'r' },
                  demo: {
                    antes: ['usuario@linux:~$ ▏'],
                    despues: ['(reverse-i-search)`grep\': grep -r TODO ~/proyecto▏']
                  },
                  pista: 'Ctrl + la letra de <i>reverse</i>.',
                  explica: 'Ctrl+R busca hacia atrás en el historial mientras escribes. Es la forma rápida de repetir un comando largo.'
                },
                {
                  tipo: 'teclas',
                  titulo: 'Cancelar la búsqueda',
                  pide: 'La búsqueda no ha encontrado lo que querías. Pulsa <kbd>Ctrl</kbd> + <kbd>G</kbd> para cancelarla y volver al prompt.',
                  combo: { ctrl: true, key: 'g' },
                  demo: {
                    antes: ['(reverse-i-search)`xyz\': ▏'],
                    despues: ['usuario@linux:~$ ▏']
                  },
                  pista: 'Ctrl + la letra de <i>give up</i>.',
                  explica: 'Ctrl+G sale de la búsqueda sin ejecutar el comando que hubiera encontrado.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Para qué sirve <kbd>Ctrl</kbd> + <kbd>R</kbd>?',
                  opciones: [
                    { t: 'Para buscar comandos en el historial.', ok: true, porque: 'Abre la búsqueda inversa del historial.' },
                    { t: 'Para borrar todo el historial.', porque: 'Eso se hace con <code>history -c</code>.' },
                    { t: 'Para reiniciar la terminal.', porque: 'Ctrl+R no cierra ni reinicia la sesión.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'grep',
          titulo: 'Filtrar líneas',
          resumen: 'grep y sus opciones',
          comando: 'grep',
          rondas: [
            {
              titulo: 'Buscar dentro de un fichero',
              resumen: 'El patrón, -i, -n, -v y -c',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\nAdios mundo\nOtra linea\n',
                '~/proyecto/errores.txt': 'error 404\nTodo bien\nerror 500\n',
                '~/proyecto/src': { tipo: 'dir' },
                '~/proyecto/src/main.c': 'int main(){ return 0; }\n// TODO revisar\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'grep enseña solo lo que coincide',
                  html: '<p><code>grep mundo ~/proyecto/notas.txt</code> muestra las líneas que contienen <code>mundo</code>. No cambia el fichero: solo filtra lo que aparece en pantalla.</p><p>Opciones que vas a usar siempre:</p><ul><li><code>-i</code>: ignora mayúsculas y minúsculas.</li><li><code>-n</code>: pone delante el número de línea.</li><li><code>-v</code>: muestra las líneas que <b>no</b> coinciden.</li><li><code>-c</code>: cuenta las líneas que coinciden.</li></ul>',
                  ejemplo: ['grep mundo ~/proyecto/notas.txt', 'grep -in mundo ~/proyecto/notas.txt', 'grep -v mundo ~/proyecto/notas.txt'],
                  mas: '<p>El patrón es una expresión regular. Un punto <code>.</code> significa «cualquier carácter»; si quieres buscar un punto literal, escríbelo como <code>\\.</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Con número de línea',
                  pide: 'Busca <code>mundo</code> en <code>~/proyecto/notas.txt</code> y muestra el número de cada línea.',
                  ejemplo: 'grep -n mundo ~/proyecto/notas.txt',
                  meta: { muestra: ['1:hola mundo', '2:Adios mundo'], noMuestra: '3:' },
                  pista: 'Añade <code>-n</code> a <code>grep mundo</code>.',
                  error: 'Casi. Sería <code>grep -n mundo ~/proyecto/notas.txt</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Lo que no es un error',
                  pide: 'Muestra las líneas de <code>~/proyecto/errores.txt</code> que <b>no</b> contienen <code>error</code>.',
                  ejemplo: 'grep -v error ~/proyecto/errores.txt',
                  meta: { muestra: 'Todo bien', noMuestra: 'error 404' },
                  pista: 'La opción que invierte el filtro es <code>-v</code>.',
                  error: 'Casi. Sería <code>grep -v error ~/proyecto/errores.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué muestra <code>grep -c mundo fichero.txt</code>?',
                  opciones: [
                    { t: 'El número de líneas que contienen mundo.', ok: true, porque: '<code>-c</code> cuenta las líneas que coinciden.' },
                    { t: 'Todas las líneas, pero numeradas.', porque: 'Para numerarlas se usa <code>-n</code>.' },
                    { t: 'El contenido del fichero sin filtrar.', porque: '<code>grep</code> siempre filtra por el patrón.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Recorrer carpetas y tuberías',
              resumen: '-r, -l, -w, -F, -E y grep detrás de una tubería',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\nAdios mundo\nOtra linea\n',
                '~/proyecto/errores.txt': 'error 404\nTodo bien\nerror 500\n',
                '~/proyecto/src': { tipo: 'dir' },
                '~/proyecto/src/main.c': 'int main(){ return 0; }\n// TODO revisar\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'grep puede entrar en carpetas',
                  html: '<p><code>grep -r TODO ~/proyecto</code> busca dentro de todos los ficheros de la carpeta, en todos sus niveles. <code>-r</code> significa <i>recursive</i>.</p><p>Más opciones:</p><ul><li><code>-l</code>: solo enseña el nombre de los ficheros donde aparece.</li><li><code>-w</code>: obliga a que coincida la palabra completa.</li><li><code>-F</code>: busca el texto tal cual, sin interpretar expresiones regulares.</li><li><code>-E</code>: permite expresiones regulares extendidas con <code>|</code>.</li></ul>',
                  ejemplo: ['grep -r TODO ~/proyecto', 'grep -rl TODO ~/proyecto', 'grep -E "error|TODO" ~/proyecto/notas.txt'],
                  mas: '<p><code>grep</code> también lee de la entrada estándar: <code>ls ~/proyecto | grep txt</code> filtra la lista sin abrir ningún fichero.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo los nombres',
                  pide: 'Busca <code>TODO</code> en toda la carpeta <code>~/proyecto</code> y muestra solo el nombre del fichero que lo contiene.',
                  ejemplo: 'grep -rl TODO ~/proyecto',
                  meta: { muestra: '~/proyecto/src/main.c', noMuestra: 'TODO revisar' },
                  pista: 'Combina <code>-r</code> con <code>-l</code>.',
                  error: 'Casi. Sería <code>grep -rl TODO ~/proyecto</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Filtrar una lista',
                  pide: 'Lista <code>~/proyecto</code> y quédate solo con las líneas que contienen <code>txt</code>.',
                  ejemplo: 'ls ~/proyecto | grep txt',
                  meta: { muestra: ['notas.txt', 'errores.txt'], noMuestra: 'src' },
                  pista: 'Usa una tubería: <code>ls ~/proyecto | grep txt</code>.',
                  error: 'Casi. Sería <code>ls ~/proyecto | grep txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué añade <code>-l</code> a <code>grep -r</code>?',
                  opciones: [
                    { t: 'Muestra solo los nombres de los ficheros con coincidencias.', ok: true, porque: 'Con <code>-l</code> no imprime las líneas, solo el fichero.' },
                    { t: 'Cuenta las coincidencias.', porque: 'Para contar está <code>-c</code>.' },
                    { t: 'Ignora las mayúsculas.', porque: 'Para eso está <code>-i</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'wc',
          titulo: 'Contar con wc',
          resumen: 'Líneas, palabras y bytes',
          comando: 'wc',
          rondas: [
            {
              titulo: 'Tres números por defecto',
              resumen: 'wc, -l, -w, -c y tuberías',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\nAdios mundo\nOtra linea\n',
                '~/proyecto/lista.txt': 'uno\ndos\ntres\ncuatro\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'wc cuenta lo que le des',
                  html: '<p><code>wc ~/proyecto/notas.txt</code> muestra tres números: líneas, palabras y bytes (en ese orden). Con una opción eliges uno solo:</p><ul><li><code>-l</code>: líneas.</li><li><code>-w</code>: palabras.</li><li><code>-c</code>: bytes.</li></ul>',
                  ejemplo: ['wc ~/proyecto/notas.txt', 'wc -l ~/proyecto/notas.txt', 'wc -w ~/proyecto/notas.txt', 'wc -c ~/proyecto/notas.txt'],
                  mas: '<p>Si no le pasas ningún fichero, <code>wc</code> lee de la entrada estándar. Por eso funciona tan bien al final de una tubería.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo las líneas',
                  pide: 'Cuenta las líneas de <code>~/proyecto/notas.txt</code>.',
                  ejemplo: 'wc -l ~/proyecto/notas.txt',
                  meta: { muestra: /^3\s/ },
                  pista: 'Es <code>wc -l</code> y la ruta.',
                  error: 'Casi. Sería <code>wc -l ~/proyecto/notas.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'wc al final de una tubería',
                  html: '<p>Muchas veces no quieres contar un fichero, sino la salida de otro comando. <code>cat ~/proyecto/lista.txt | wc -l</code> cuenta las líneas que salen de <code>cat</code>.</p>',
                  ejemplo: ['cat ~/proyecto/lista.txt | wc -l', 'ls ~/proyecto | wc -l'],
                  mas: '<p>La tubería <code>|</code> conecta la salida del primero con la entrada del segundo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Contar palabras',
                  pide: 'Cuenta las palabras de <code>~/proyecto/notas.txt</code> pasando el fichero por <code>cat</code>.',
                  ejemplo: 'cat ~/proyecto/notas.txt | wc -w',
                  meta: { salida: '6' },
                  pista: 'Es <code>cat ~/proyecto/notas.txt | wc -w</code>.',
                  error: 'Casi. Sería <code>cat ~/proyecto/notas.txt | wc -w</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué cuenta <code>wc -c</code>?',
                  opciones: [
                    { t: 'Bytes.', ok: true, porque: '<code>-c</code> cuenta bytes.' },
                    { t: 'Palabras.', porque: 'Para palabras está <code>-w</code>.' },
                    { t: 'Líneas.', porque: 'Para líneas está <code>-l</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        /* ---------------- ORDENAR · sort ---------------- */
        {
          id: 'sort',
          titulo: 'Ordenar con sort',
          resumen: 'Alfabético, numérico y por campos',
          comando: 'sort',
          rondas: [
            {
              titulo: 'Ordenar líneas',
              resumen: 'sort y sort -r',
              inicio: {
                base: 'vacio',
                fs: { '~/frutas.txt': 'pera\nmanzana\nkiwi\n' }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'sort ordena alfabéticamente',
                  html: '<p><code>sort frutas.txt</code> muestra las líneas ordenadas de la A a la Z. No cambia el fichero: solo enseña el resultado ordenado.</p>',
                  ejemplo: ['sort frutas.txt'],
                  mas: '<p>Si no le pasas fichero, <code>sort</code> ordena lo que llegue por la entrada, así que funciona al final de una tubería.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'De la A a la Z',
                  pide: 'Muestra <code>frutas.txt</code> ordenado alfabéticamente.',
                  ejemplo: 'sort frutas.txt',
                  meta: { orden: ['kiwi', 'manzana', 'pera'] },
                  pista: 'Es <code>sort</code> y el nombre del fichero.',
                  error: 'Casi. Sería <code>sort frutas.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '-r invierte el orden',
                  html: '<p><code>sort -r frutas.txt</code> ordena de la Z a la A. La <code>r</code> viene de <i>reverse</i>.</p>',
                  ejemplo: ['sort -r frutas.txt'],
                  mas: '<p>Puedes combinar <code>-r</code> con las demás opciones: <code>sort -rn</code> ordena números de mayor a menor.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Al revés',
                  pide: 'Muestra <code>frutas.txt</code> en orden inverso.',
                  ejemplo: 'sort -r frutas.txt',
                  meta: { orden: ['pera', 'manzana', 'kiwi'] },
                  pista: 'Añade <code>-r</code> a <code>sort</code>.',
                  error: 'Casi. Sería <code>sort -r frutas.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>sort -r</code>?',
                  opciones: [
                    { t: 'Ordena en orden inverso.', ok: true, porque: '<code>-r</code> significa <i>reverse</i>.' },
                    { t: 'Ordena solo los números.', porque: 'Para números está <code>-n</code>.' },
                    { t: 'Borra las líneas repetidas.', porque: 'Para quitar repetidos se usa <code>sort -u</code>, que no vemos aquí.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Números y campos',
              resumen: '-n, -k y -t',
              inicio: {
                base: 'vacio',
                fs: {
                  '~/numeros.txt': '30\n5\n45\n',
                  '~/gastos.txt': 'luz 30\nagua 5\ninternet 45\n'
                }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Los números no se ordenan como letras',
                  html: '<p>Por defecto, <code>sort</code> compara texto: <code>30</code> iría antes que <code>5</code> porque el carácter <code>3</code> va antes que el <code>5</code>. Con <code>-n</code> compara valores numéricos.</p>',
                  ejemplo: ['sort numeros.txt', 'sort -n numeros.txt'],
                  mas: '<p>Con <code>-n</code>, <code>5</code> va antes que <code>30</code> y que <code>45</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'De menor a mayor',
                  pide: 'Ordena <code>numeros.txt</code> de menor a mayor.',
                  ejemplo: 'sort -n numeros.txt',
                  meta: { orden: ['5', '30', '45'] },
                  pista: 'Añade <code>-n</code> para comparar números.',
                  error: 'Casi. Sería <code>sort -n numeros.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: '-k elige la columna',
                  html: '<p><code>-k2</code> ordena por el segundo campo. Los campos se separan por espacios o tabuladores; con <code>-t</code> eliges otro separador, por ejemplo <code>sort -t : -k3</code>.</p>',
                  ejemplo: ['sort -k2 gastos.txt', 'sort -k2 -n gastos.txt'],
                  mas: '<p>Sin <code>-n</code>, el campo se compara como texto. Para importes o cantidades, añade <code>-n</code>.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Ordena por importe',
                  pide: 'Ordena <code>gastos.txt</code> por el segundo campo, de menor a mayor.',
                  ejemplo: 'sort -k2 -n gastos.txt',
                  meta: { orden: ['agua 5', 'luz 30', 'internet 45'] },
                  pista: 'Combina <code>-k2</code> con <code>-n</code>.',
                  error: 'Casi. Sería <code>sort -k2 -n gastos.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué ordena <code>sort -k2 -n</code>?',
                  opciones: [
                    { t: 'Por el segundo campo, comparando números.', ok: true, porque: '<code>-k2</code> elige el campo y <code>-n</code> lo trata como número.' },
                    { t: 'Por la segunda línea del fichero.', porque: '<code>-k</code> habla de campos, no de líneas.' },
                    { t: 'Solo las dos primeras columnas.', porque: '<code>-k</code> no recorta la salida; solo decide el orden.' }
                  ]
                }
              ]
            }
          ]
        },

        /* ---------------- CORTAR · cut ---------------- */
        {
          id: 'cut',
          titulo: 'Cortar con cut',
          resumen: 'Campos, delimitadores y tuberías',
          comando: 'cut',
          rondas: [
            {
              titulo: 'Quedarse con campos',
              resumen: 'cut -d y -f',
              inicio: {
                base: 'vacio',
                fs: { '~/agenda.txt': 'ana:1234:ana@mail\nluis:5678:luis@mail\n' }
              },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'cut separa por un delimitador',
                  html: '<p><code>cut -d : -f 1 agenda.txt</code> parte cada línea por <code>:</code> y se queda con el campo 1. <code>-d</code> elige el delimitador y <code>-f</code> el campo.</p>',
                  ejemplo: ['cut -d : -f 1 agenda.txt'],
                  mas: '<p>Sin <code>-d</code>, el delimitador por defecto es el tabulador.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo los nombres',
                  pide: 'Muestra el primer campo de <code>agenda.txt</code> usando <code>:</code> como separador.',
                  ejemplo: 'cut -d : -f 1 agenda.txt',
                  meta: { salida: 'ana\nluis' },
                  pista: 'Es <code>cut -d : -f 1 agenda.txt</code>.',
                  error: 'Casi. Sería <code>cut -d : -f 1 agenda.txt</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Varios campos a la vez',
                  html: '<p>Puedes pedir más de un campo separándolos con comas: <code>cut -d : -f 1,3</code> devuelve el primero y el tercero, unidos por el mismo delimitador.</p>',
                  ejemplo: ['cut -d : -f 1,3 agenda.txt'],
                  mas: '<p>También se pueden pedir rangos: <code>-f 1-3</code> devuelve del primero al tercero.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Nombre y correo',
                  pide: 'Muestra el primer y el tercer campo de <code>agenda.txt</code>.',
                  ejemplo: 'cut -d : -f 1,3 agenda.txt',
                  meta: { salida: 'ana:ana@mail\nluis:luis@mail' },
                  pista: 'Usa <code>-f 1,3</code>.',
                  error: 'Casi. Sería <code>cut -d : -f 1,3 agenda.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>cut -d : -f 2</code>?',
                  opciones: [
                    { t: 'Se queda con el segundo campo de cada línea, separando por :', ok: true, porque: '<code>-d</code> elige el separador y <code>-f</code> el campo.' },
                    { t: 'Corta las dos primeras líneas.', porque: '<code>-f</code> habla de campos, no de líneas.' },
                    { t: 'Ordena por el segundo campo.', porque: 'Para ordenar está <code>sort -k2</code>.' }
                  ]
                }
              ]
            },
            {
              titulo: 'cut dentro de una tubería',
              resumen: 'cut, wc y sort sobre /etc/passwd',
              inicio: { base: 'normal' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Cortar /etc/passwd',
                  html: '<p><code>/etc/passwd</code> guarda los usuarios del sistema separados por <code>:</code>. El primer campo es el nombre de usuario, y el último su shell.</p>',
                  ejemplo: ['cut -d : -f 1 /etc/passwd'],
                  mas: '<p><code>cut -d : -f 1,7 /etc/passwd</code> enseña usuario y shell en la misma línea.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Usuarios del sistema',
                  pide: 'Muestra los nombres de usuario de <code>/etc/passwd</code>: primer campo, separador <code>:</code>.',
                  ejemplo: 'cut -d : -f 1 /etc/passwd',
                  meta: { muestra: ['root', 'usuario'] },
                  pista: 'Es <code>cut -d : -f 1 /etc/passwd</code>.',
                  error: 'Casi. Sería <code>cut -d : -f 1 /etc/passwd</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Contar después de cortar',
                  html: '<p><code>cut -d : -f 1 /etc/passwd | wc -l</code> cuenta cuántos usuarios hay. La tubería pasa la lista de nombres a <code>wc</code>.</p>',
                  ejemplo: ['cut -d : -f 1 /etc/passwd | wc -l'],
                  mas: '<p>Así se responde a la pregunta «cuántos usuarios tiene el sistema» sin contarlos a mano.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Cuenta los usuarios',
                  pide: 'Cuenta cuántos usuarios hay en <code>/etc/passwd</code> usando <code>cut</code> y <code>wc</code>.',
                  ejemplo: 'cut -d : -f 1 /etc/passwd | wc -l',
                  meta: { salida: '2' },
                  pista: 'Primero corta el campo 1 y después cuenta líneas.',
                  error: 'Casi. Sería <code>cut -d : -f 1 /etc/passwd | wc -l</code>.'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Ordenar lo que has cortado',
                  html: '<p>Las tuberías se encadenan: <code>cut -d : -f 1 /etc/passwd | sort -r</code> corta los nombres y los ordena al revés.</p>',
                  ejemplo: ['cut -d : -f 1 /etc/passwd | sort -r'],
                  mas: '<p>Cada comando hace una cosa y pasa el resultado al siguiente. Esa es la gracia de la terminal.</p>'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>cut -d : -f 1 /etc/passwd | sort</code>?',
                  opciones: [
                    { t: 'Saca los nombres de usuario y los ordena alfabéticamente.', ok: true, porque: 'Primero corta el campo 1 y después lo ordena <code>sort</code>.' },
                    { t: 'Ordena el fichero /etc/passwd y lo guarda.', porque: 'No hay redirección: solo se muestra por pantalla.' },
                    { t: 'Cuenta los usuarios del sistema.', porque: 'Para contar hace falta <code>wc -l</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'find',
          titulo: 'Buscar ficheros con find',
          resumen: 'Criterios y acciones',
          comando: 'find',
          rondas: [
            {
              titulo: 'Por nombre y por tipo',
              resumen: '-name, -iname, -type y -maxdepth',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\nAdios mundo\nOtra linea\n',
                '~/proyecto/errores.txt': 'error 404\nTodo bien\nerror 500\n',
                '~/proyecto/vacio.txt': '',
                '~/proyecto/README': 'Instrucciones\n',
                '~/proyecto/src': { tipo: 'dir' },
                '~/proyecto/src/main.c': 'int main(){ return 0; }\n// TODO revisar\n',
                '~/proyecto/src/util.c': 'void util(){}\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'find recorre el árbol',
                  html: '<p><code>find ~/proyecto</code> enseña todo lo que hay dentro, incluida la propia carpeta. Para quedarte con algo concreto se añaden criterios:</p><ul><li><code>-name "*.txt"</code>: nombre que coincide con el patrón.</li><li><code>-iname "*.TXT"</code>: igual, sin distinguir mayúsculas.</li><li><code>-type f</code>: solo ficheros; <code>-type d</code>: solo carpetas; <code>-type l</code>: enlaces.</li><li><code>-maxdepth 1</code>: no bajar más de un nivel.</li></ul>',
                  ejemplo: ['find ~/proyecto', 'find ~/proyecto -name "*.txt"', 'find ~/proyecto -type d', 'find ~/proyecto -maxdepth 1 -type f'],
                  mas: '<p>Las comillas evitan que la shell expanda el <code>*</code> antes de que lo reciba <code>find</code>. Son importantes.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Todos los .txt',
                  pide: 'Busca en <code>~/proyecto</code> los ficheros cuyo nombre acabe en <code>.txt</code>.',
                  ejemplo: 'find ~/proyecto -name "*.txt"',
                  meta: { muestra: ['notas.txt', 'errores.txt', 'vacio.txt'], noMuestra: 'main.c' },
                  pista: 'Usa <code>-name "*.txt"</code>.',
                  error: 'Casi. Sería <code>find ~/proyecto -name "*.txt"</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo carpetas',
                  pide: 'Muestra solo las carpetas que hay dentro de <code>~/proyecto</code>.',
                  ejemplo: 'find ~/proyecto -type d',
                  meta: { muestra: ['~/proyecto', '~/proyecto/src'], noMuestra: 'notas.txt' },
                  pista: 'El criterio de tipo es <code>-type d</code>.',
                  error: 'Casi. Sería <code>find ~/proyecto -type d</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué diferencia hay entre <code>-name</code> y <code>-iname</code>?',
                  opciones: [
                    { t: 'Que -iname no distingue mayúsculas de minúsculas.', ok: true, porque: 'La i significa <i>insensitive</i>.' },
                    { t: 'Que -iname busca solo en la carpeta actual.', porque: 'Para limitar la profundidad está <code>-maxdepth</code>.' },
                    { t: 'Que -name solo busca carpetas.', porque: 'El tipo se elige con <code>-type</code>.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Tamaño, fechas y propietario',
              resumen: '-size, -mtime, -user, -perm, -links, -inum y -empty',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\nAdios mundo\nOtra linea\n',
                '~/proyecto/errores.txt': 'error 404\nTodo bien\nerror 500\n',
                '~/proyecto/vacio.txt': '',
                '~/proyecto/README': 'Instrucciones\n',
                '~/proyecto/src': { tipo: 'dir' },
                '~/proyecto/src/main.c': 'int main(){ return 0; }\n// TODO revisar\n',
                '~/proyecto/src/util.c': 'void util(){}\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Tamaño y fechas',
                  html: '<p><code>-size</code> compara tamaño. Sin sufijo cuenta bloques de 512 bytes; con <code>c</code> son bytes, con <code>k</code> KiB y con <code>M</code> MiB. Se puede pedir exacto (<code>-size 10c</code>), mayor (<code>+10c</code>) o menor (<code>-10c</code>).</p><p>Para fechas: <code>-mtime</code> (modificación), <code>-atime</code> (acceso) y <code>-ctime</code> (cambio), en días. <code>-mmin</code>, <code>-amin</code> y <code>-cmin</code> hacen lo mismo en minutos. <code>-newer fichero</code> compara con la fecha de otro fichero y <code>-newermt</code> con una fecha escrita. En un GNU find real usa <code>-newermt "yesterday"</code> o una fecha ISO; el simulador también acepta «ayer».</p>',
                  ejemplo: ['find ~/proyecto -type f -empty', 'find ~/proyecto -type f -size +10c', 'find ~/proyecto -type f -mtime -1'],
                  mas: '<p>Los signos se leen así: <code>+30</code> es «más de 30», <code>-30</code> es «menos de 30» y <code>30</code> es «exactamente 30».</p>'
                },
                {
                  tipo: 'teoria',
                  titulo: 'Dueño, permisos y vínculos',
                  html: '<p><code>-user usuario</code> filtra por propietario y <code>-group grupo</code> por grupo. <code>-perm 644</code> pide permisos exactos; <code>-perm -644</code> pide que estén incluidos y <code>-perm /111</code> que tengan algún bit de ejecución.</p><p><code>-links N</code> filtra por número de enlaces duros, <code>-inum N</code> por número de inodo y <code>-empty</code> por ficheros o carpetas vacías.</p>',
                  ejemplo: ['find ~/proyecto -type f -user usuario', 'find ~/proyecto -type f -perm -644', 'find ~/proyecto -type f -links +1'],
                  mas: '<p><code>-inum</code> es la forma de encontrar todos los enlaces duros de un mismo fichero: comparten inodo.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Ficheros vacíos',
                  pide: 'Encuentra los ficheros vacíos dentro de <code>~/proyecto</code>.',
                  ejemplo: 'find ~/proyecto -type f -empty',
                  meta: { muestra: '~/proyecto/vacio.txt', noMuestra: 'notas.txt' },
                  pista: 'El criterio es <code>-empty</code>, junto con <code>-type f</code>.',
                  error: 'Casi. Sería <code>find ~/proyecto -type f -empty</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Más de 10 bytes',
                  pide: 'Busca los ficheros de <code>~/proyecto</code> que pesen más de 10 bytes.',
                  ejemplo: 'find ~/proyecto -type f -size +10c',
                  meta: { muestra: ['notas.txt', 'errores.txt'], noMuestra: 'vacio.txt' },
                  pista: 'Usa <code>-size +10c</code>.',
                  error: 'Casi. Sería <code>find ~/proyecto -type f -size +10c</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué significa <code>-mtime +30</code>?',
                  opciones: [
                    { t: 'Modificados hace más de 30 días.', ok: true, porque: 'El signo + significa «más de».' },
                    { t: 'Modificados hace menos de 30 días.', porque: 'Para «menos de» se usa <code>-30</code>.' },
                    { t: 'Modificados hace exactamente 30 minutos.', porque: 'Para minutos está <code>-mmin</code>.' }
                  ]
                }
              ]
            },
            {
              titulo: 'Qué hacer con lo encontrado',
              resumen: '-print, -ls, -exec, -ok y -print0',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\nAdios mundo\nOtra linea\n',
                '~/proyecto/errores.txt': 'error 404\nTodo bien\nerror 500\n',
                '~/proyecto/vacio.txt': '',
                '~/proyecto/README': 'Instrucciones\n',
                '~/proyecto/src': { tipo: 'dir' },
                '~/proyecto/src/main.c': 'int main(){ return 0; }\n// TODO revisar\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'Acciones de find',
                  html: '<p>Por defecto <code>find</code> imprime las rutas, como si llevara <code>-print</code>. Puedes cambiarlo:</p><ul><li><code>-ls</code>: enseña la información detallada, como <code>ls -l</code>.</li><li><code>-exec comando {} \\;</code>: ejecuta el comando una vez por cada resultado. <code>{}</code> se sustituye por la ruta y el <code>\\;</code> cierra la orden.</li><li><code>-exec comando {} +</code>: agrupa muchos resultados en una sola ejecución.</li><li><code>-ok comando {} \\;</code>: como <code>-exec</code>, pero pregunta antes de cada uno.</li><li><code>-print0</code>: separa con un byte nulo, ideal para <code>xargs -0</code>.</li></ul>',
                  ejemplo: ['find ~/proyecto -type f -name "*.txt" -ls', 'find ~/proyecto -type f -name "*.txt" -exec wc -l {} \\;'],
                  mas: '<p>El <code>\\;</code> lleva barra para que la shell no lo confunda con el punto y coma que separa comandos.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Contar cada fichero',
                  pide: 'Busca los <code>.txt</code> de <code>~/proyecto</code> y ejecuta <code>wc -l</code> con cada uno.',
                  ejemplo: 'find ~/proyecto -type f -name "*.txt" -exec wc -l {} \\;',
                  meta: { muestra: ['3 /home/usuario/proyecto/notas.txt', '3 /home/usuario/proyecto/errores.txt', '0 /home/usuario/proyecto/vacio.txt'] },
                  pista: 'Añade <code>-exec wc -l {} \\;</code> al final.',
                  error: 'Casi. Sería <code>find ~/proyecto -type f -name "*.txt" -exec wc -l {} \\;</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Borrar los vacíos',
                  pide: 'Borra el fichero vacío que hay en <code>~/proyecto</code> usando <code>find</code> y <code>-exec</code>.',
                  ejemplo: 'find ~/proyecto -type f -empty -exec rm {} \\;',
                  meta: { noExiste: '~/proyecto/vacio.txt', existe: ['~/proyecto/notas.txt'] },
                  pista: 'Primero encuentra con <code>-empty</code> y después añade <code>-exec rm {} \\;</code>.',
                  error: 'Casi. Sería <code>find ~/proyecto -type f -empty -exec rm {} \\;</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué diferencia hay entre <code>-exec ... \\;</code> y <code>-exec ... +</code>?',
                  opciones: [
                    { t: 'Con + se agrupan varios resultados en una sola ejecución.', ok: true, porque: 'Eso lo hace más rápido cuando hay muchos ficheros.' },
                    { t: 'Con + se pide confirmación antes de ejecutar.', porque: 'Para confirmar está <code>-ok</code>.' },
                    { t: 'No hay diferencia: son sinónimos.', porque: 'Cambia cómo se pasan los argumentos al comando.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'tee',
          titulo: 'Ver y guardar con tee',
          resumen: 'tee y tee -a',
          comando: 'tee',
          rondas: [
            {
              titulo: 'La salida por duplicado',
              resumen: 'Guardar sin perder lo que se ve',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\n',
                '~/proyecto/errores.txt': 'error 404\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'tee escribe en pantalla y en fichero',
                  html: '<p>Una redirección normal (<code>&gt;</code>) manda la salida solo al fichero. <code>tee</code> la enseña <b>y</b> la guarda: <code>ls ~/proyecto | tee lista.txt</code>.</p><p>Con <code>-a</code> añade al final en vez de sobrescribir: <code>... | tee -a lista.txt</code>. Y puedes pasar varios ficheros: <code>... | tee uno.txt dos.txt</code>.</p>',
                  ejemplo: ['ls ~/proyecto | tee ~/proyecto/lista.txt', 'echo otra | tee -a ~/proyecto/lista.txt'],
                  mas: '<p><code>tee</code> viene de la tubería en forma de T: la entrada se divide en dos salidas.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Guardar una lista',
                  pide: 'Lista <code>~/proyecto</code> y guarda el resultado en <code>~/proyecto/lista.txt</code> sin dejar de verlo.',
                  ejemplo: 'ls ~/proyecto | tee ~/proyecto/lista.txt',
                  meta: { existe: '~/proyecto/lista.txt', muestra: ['notas.txt', 'errores.txt'], contenido: { '~/proyecto/lista.txt': 'errores.txt\nnotas.txt\n' } },
                  pista: 'Es <code>ls ~/proyecto | tee ~/proyecto/lista.txt</code>.',
                  error: 'Casi. Sería <code>ls ~/proyecto | tee ~/proyecto/lista.txt</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Añadir sin borrar',
                  pide: 'Guarda <code>primera</code> en <code>~/registro.txt</code> y después añade <code>segunda</code> con <code>tee -a</code>.',
                  ejemplo: 'echo primera | tee ~/registro.txt; echo segunda | tee -a ~/registro.txt',
                  meta: { contenido: { '~/registro.txt': 'primera\nsegunda\n' } },
                  pista: 'La segunda vez usa <code>tee -a ~/registro.txt</code>.',
                  error: 'Casi. Sería <code>echo primera | tee ~/registro.txt; echo segunda | tee -a ~/registro.txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>tee -a</code>?',
                  opciones: [
                    { t: 'Añade al final del fichero sin borrar lo anterior.', ok: true, porque: 'La a viene de <i>append</i>.' },
                    { t: 'Borra el fichero antes de escribir.', porque: 'Eso es lo que hace <code>&gt;</code>.' },
                    { t: 'Manda la salida solo al fichero.', porque: '<code>tee</code> siempre enseña y guarda.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'xargs',
          titulo: 'Convertir líneas en argumentos',
          resumen: 'xargs, -n, -I, -d y -0',
          comando: 'xargs',
          rondas: [
            {
              titulo: 'De la entrada a los argumentos',
              resumen: 'El comando por defecto, -n, -I, -d, -0 y -t',
              inicio: { base: 'vacio', fs: {
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/notas.txt': 'hola mundo\nAdios mundo\nOtra linea\n',
                '~/proyecto/errores.txt': 'error 404\nTodo bien\nerror 500\n',
                '~/proyecto/vacio.txt': ''
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'xargs lee y ejecuta',
                  html: '<p><code>xargs</code> toma palabras de la entrada estándar y las pone como argumentos de otro comando. Si no le dices qué comando, usa <code>echo</code>: <code>echo "a b c d" | xargs</code> imprime <code>a b c d</code>.</p><ul><li><code>-n 2</code>: pasa como mucho dos argumentos por ejecución.</li><li><code>-I {}</code>: sustituye <code>{}</code> por cada elemento; sirve para comandos con dos argumentos.</li><li><code>-d ":"</code>: usa <code>:</code> como separador.</li><li><code>-0</code>: separa por byte nulo, para usar con <code>find -print0</code>.</li><li><code>-t</code>: enseña el comando que va a ejecutar.</li></ul>',
                  ejemplo: ['echo "a b c d" | xargs -n 2', 'echo "a:b:c:d" | xargs -d : echo', 'find ~/proyecto -name "*.txt" -print0 | xargs -0 wc -l'],
                  mas: '<p><code>xargs</code> es imprescindible cuando la lista es tan larga que no cabe en una línea de comandos o cuando los nombres llevan espacios.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Dos argumentos por línea',
                  pide: 'Pasa <code>a b c d</code> a <code>xargs</code> y ejecuta el comando por defecto con dos argumentos cada vez.',
                  ejemplo: 'echo "a b c d" | xargs -n 2',
                  meta: { salida: 'a b\nc d' },
                  pista: 'Es <code>echo "a b c d" | xargs -n 2</code>.',
                  error: 'Casi. Sería <code>echo "a b c d" | xargs -n 2</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Separador personalizado',
                  pide: 'Usa <code>:</code> como separador para convertir <code>a:b:c:d</code> en cuatro argumentos de <code>echo</code>.',
                  ejemplo: 'echo "a:b:c:d" | xargs -d : echo',
                  meta: { salida: 'a b c d' },
                  pista: 'Añade <code>-d :</code> a <code>xargs echo</code>.',
                  error: 'Casi. Sería <code>echo "a:b:c:d" | xargs -d : echo</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Nombres con espacios',
                  pide: 'Cuenta las líneas de los <code>.txt</code> de <code>~/proyecto</code> usando <code>find -print0</code> y <code>xargs -0</code>.',
                  ejemplo: 'find ~/proyecto -name "*.txt" -print0 | xargs -0 wc -l',
                  meta: { muestra: ['3 /home/usuario/proyecto/notas.txt', '3 /home/usuario/proyecto/errores.txt', '0 /home/usuario/proyecto/vacio.txt'] },
                  pista: 'Enlaza <code>find ... -print0</code> con <code>xargs -0 wc -l</code>.',
                  error: 'Casi. Sería <code>find ~/proyecto -name "*.txt" -print0 | xargs -0 wc -l</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Para qué sirve <code>-I {}</code> en xargs?',
                  opciones: [
                    { t: 'Para sustituir {} por cada elemento en el comando.', ok: true, porque: 'Así puedes colocar el argumento donde quieras.' },
                    { t: 'Para ignorar los errores.', porque: 'Eso no lo hace <code>-I</code>.' },
                    { t: 'Para ordenar la entrada.', porque: 'Para ordenar está <code>sort</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'locate',
          titulo: 'El índice de locate',
          resumen: 'locate, updatedb, -c, -i y --regex',
          comando: 'locate',
          rondas: [
            {
              titulo: 'Buscar sin recorrer el disco',
              resumen: 'La base de datos de nombres',
              inicio: { base: 'vacio', fs: {
                '~/Documentos': { tipo: 'dir' },
                '~/Documentos/nota.txt': 'una nota\n',
                '~/Documentos/Apuntes.txt': 'apuntes\n',
                '~/proyecto': { tipo: 'dir' },
                '~/proyecto/src': { tipo: 'dir' },
                '~/proyecto/src/main.c': 'int main(){}\n'
              } },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'locate consulta un índice',
                  html: '<p><code>find</code> recorre el disco cada vez. <code>locate</code> consulta una base de datos de nombres que se actualiza con <code>updatedb</code>. Por eso es casi instantáneo, pero puede no ver un fichero recién creado hasta la siguiente actualización.</p><p>Opciones:</p><ul><li><code>-c</code>: cuenta los resultados.</li><li><code>-i</code>: ignora mayúsculas.</li><li><code>--regex</code>: usa una expresión regular.</li><li>Los comodines <code>*</code> y <code>?</code> funcionan en el patrón.</li></ul>',
                  ejemplo: ['updatedb', 'locate nota.txt', 'locate -c txt', 'locate -i apuntes', 'locate --regex ".*\\.txt$"'],
                  mas: '<p><code>locate</code> busca en la ruta completa, no solo en el nombre. Por eso <code>locate bin/wc</code> encuentra el ejecutable.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'Encontrar una nota',
                  pide: 'Busca con <code>locate</code> el fichero <code>nota.txt</code>.',
                  ejemplo: 'locate nota.txt',
                  meta: { muestra: '~/Documentos/nota.txt' },
                  pista: 'Es <code>locate nota.txt</code>.',
                  error: 'Casi. Sería <code>locate nota.txt</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Sin importar mayúsculas',
                  pide: 'Busca <code>apuntes</code> aunque el fichero se llame <code>Apuntes.txt</code>.',
                  ejemplo: 'locate -i apuntes',
                  meta: { muestra: '~/Documentos/Apuntes.txt' },
                  pista: 'Añade <code>-i</code>.',
                  error: 'Casi. Sería <code>locate -i apuntes</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Contar resultados',
                  pide: 'Cuenta cuántas rutas contienen <code>txt</code>.',
                  ejemplo: 'locate -c txt',
                  meta: { salida: '2' },
                  pista: 'Es <code>locate -c txt</code>.',
                  error: 'Casi. Sería <code>locate -c txt</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué hace <code>updatedb</code>?',
                  opciones: [
                    { t: 'Actualiza la base de datos que consulta locate.', ok: true, porque: 'Sin actualizar, locate puede no ver los ficheros nuevos.' },
                    { t: 'Borra todos los ficheros duplicados.', porque: 'No borra nada: solo genera el índice.' },
                    { t: 'Busca un fichero en todo el disco.', porque: 'Eso lo hace <code>locate</code>.' }
                  ]
                }
              ]
            }
          ]
        },

        {
          id: 'which',
          titulo: '¿Dónde está el programa?',
          resumen: 'which y whereis',
          comando: 'which',
          rondas: [
            {
              titulo: 'Ejecutables, manuales y fuentes',
              resumen: 'which y whereis con -b, -m y -s',
              inicio: { base: 'completo' },
              pantallas: [
                {
                  tipo: 'teoria',
                  titulo: 'which y whereis buscan programas',
                  html: '<p><code>which grep</code> dice qué ejecutable se usaría al escribir <code>grep</code>, mirando las carpetas del <code>PATH</code>.</p><p><code>whereis grep</code> busca más cosas: el binario y su página de manual. Puedes limitarlo con <code>-b</code> (solo binarios), <code>-m</code> (solo manuales) y <code>-s</code> (solo fuentes).</p>',
                  ejemplo: ['which grep', 'whereis grep', 'whereis -b grep', 'whereis -m grep'],
                  mas: '<p>Si <code>which</code> no encuentra nada, el comando no está en el <code>PATH</code> o no está instalado. <code>locate</code> busca ficheros por nombre; <code>which</code> busca programas ejecutables.</p>'
                },
                {
                  tipo: 'practica',
                  titulo: 'El ejecutable de grep',
                  pide: 'Averigua con <code>which</code> dónde está el ejecutable de <code>grep</code>.',
                  ejemplo: 'which grep',
                  meta: { salida: '/usr/bin/grep' },
                  pista: 'Es <code>which grep</code>.',
                  error: 'Casi. Sería <code>which grep</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo el binario',
                  pide: 'Pregunta a <code>whereis</code> por <code>grep</code>, pero muestra solo la ruta del binario.',
                  ejemplo: 'whereis -b grep',
                  meta: { salida: 'grep: /usr/bin/grep' },
                  pista: 'La opción de binarios es <code>-b</code>.',
                  error: 'Casi. Sería <code>whereis -b grep</code>.'
                },
                {
                  tipo: 'practica',
                  titulo: 'Solo el manual',
                  pide: 'Muestra solo la página de manual de <code>grep</code>.',
                  ejemplo: 'whereis -m grep',
                  meta: { salida: 'grep: /usr/share/man/man1/grep.1.gz' },
                  pista: 'La opción de manuales es <code>-m</code>.',
                  error: 'Casi. Sería <code>whereis -m grep</code>.'
                },
                {
                  tipo: 'test',
                  pregunta: '¿Qué busca <code>which</code>?',
                  opciones: [
                    { t: 'Un ejecutable dentro de las carpetas del PATH.', ok: true, porque: 'Es lo que se ejecuta al escribir ese nombre.' },
                    { t: 'Cualquier fichero con ese nombre en todo el disco.', porque: 'Para eso está <code>locate</code> o <code>find</code>.' },
                    { t: 'El contenido de un fichero.', porque: 'Para mirar contenido está <code>cat</code> o <code>grep</code>.' }
                  ]
                }
              ]
            }
          ]
        }

      ]
    }
  ]
};
