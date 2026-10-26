/* =====================================================================
   actividades.js · DATOS de las actividades (botón "Actividades")
   =====================================================================

   QUÉ ES ESTE ARCHIVO
   Aquí solo hay datos: la lista de actividades. Todo el funcionamiento
   (panel lateral, ventana, terminal, comprobación de comandos) está en el
   <script> de linux-terminal.html. Este archivo se carga con
       <script src="actividades.js"></script>
   justo ANTES del script principal, así que debe estar en la MISMA CARPETA
   que el HTML. Si le cambias el nombre, cambia también esa línea.

   CÓMO FUNCIONA (resumen)
   1. Al cargar, este archivo deja las actividades en la lista global ACTIVIDADES.
   2. El script principal las agrupa por el campo "grupo" para crear los
      subapartados del panel (salen en el orden en que se escriban aquí).
   3. Al elegir una actividad se abre la ventana: el enunciado y las casillas
      salen de "enunciado" y de la "tarea" de cada paso.
   4. La persona escribe un comando y pulsa Enter. Se compara con los "ok" del
      PASO ACTUAL: si coincide se muestra su "out" y se pasa al siguiente paso;
      si no, la terminal responde con un error y, tras dos fallos seguidos,
      con la "pista".
   5. Al superar el último paso la actividad queda completada. El progreso se
      guarda en el navegador usando el "id" de cada actividad.

   CAMPOS DE CADA ACTIVIDAD
     id        : texto ÚNICO, sin espacios (p. ej. "estructura"). Sirve para recordar
                 qué actividades están completadas: si lo cambias, esa actividad
                 vuelve a aparecer como pendiente.
     grupo     : nombre del subapartado del panel. Mismo texto = mismo subapartado.
                 Los subapartados se crean solos; no hay que declararlos antes.
     titulo    : nombre de la actividad (sale en el panel y en la ventana).
     resumen   : frase corta que sale bajo el título en el panel.
     enunciado : HTML que se muestra arriba en la ventana (<p>, <code>, <pre>...).
                 Para mostrar < y > escribe &lt; y &gt;; para & escribe &amp;.
     final     : (opcional) mensaje de éxito al terminar. También admite HTML.
     pasos     : lista de pasos que hay que superar EN ORDEN. Cada paso tiene:
        tarea : lo que se pide (HTML). Sale como casilla en el enunciado.
        ok    : comandos que se aceptan como correctos (ver más abajo).
        out   : lo que muestra la terminal al acertar (HTML, como en las
                diapositivas: <b class="d">carpeta</b>, <mark>resaltado</mark>...).
                Usa \n para saltos de línea. Vacío ("") si el comando no imprime nada.
        ruta  : (opcional) cambia el prompt tras acertar, p. ej. "~/proyectos"
                (útil con cd). Se mantiene en los pasos siguientes.
        pista : (opcional, TEXTO PLANO sin HTML) ayuda del botón "Pista" y la
                que sale tras dos fallos seguidos. Puede ser un texto o una LISTA
                con tantas pistas como quieras, de más suave a más directa:
                  pista:["Piensa en crear carpetas.","Es mkdir.","mkdir -p ruta"]
                Cada vez que se pide una pista sale la siguiente (Pista 2/3...);
                al agotarlas se repite la última.
        explica : (opcional, HTML) explicación extra que aparece bajo la tarea
                cuando se supera ese paso. Texto o LISTA de textos (un párrafo
                cada uno).
     solucion : (opcional, a nivel de actividad) explicación de la solución. Al completar
                la actividad aparece con un fundido en un recuadro blanco bajo el mensaje
                de éxito. Texto o LISTA de textos (HTML, un párrafo cada uno). Si no lo
                pones, se genera solo con el comando de cada paso y su "explica".
     Además, "enunciado" y "final" también pueden ser una lista de textos.

   CÓMO SE COMPARA LO QUE ESCRIBE LA PERSONA
   - Antes de comparar se recorta el texto y los espacios repetidos se juntan en
     uno: "  ls    -l " equivale a "ls -l".
   - Cada elemento de "ok" puede ser:
       * un TEXTO: tiene que coincidir con el comando completo, y distingue
         mayúsculas de minúsculas. Ejemplo: "cd Prueba".
       * una EXPRESIÓN REGULAR para aceptar varias formas a la vez. Ejemplo:
         /^mkdir -p (\.\/)?proyectos\/web\/?$/  acepta "mkdir -p proyectos/web",
         "mkdir -p ./proyectos/web" y la variante con "/" al final.
         Consejos: empieza con ^ y termina con $ (si no, aceptaría texto extra),
         y escribe \/ para una barra normal y \. para un punto literal.
   - Si el comando escrito empieza igual que alguno de los "ok" de texto (misma
     primera palabra) pero no coincide, la terminal avisa de que no es lo que pide
     el paso. Si la primera palabra no se parece a ninguno, responde como bash:
     "orden no encontrada". Por eso conviene que haya al menos un "ok" de texto.
   - Además, la terminal acepta siempre "clear" (limpiar), las flechas arriba y
     abajo (historial) y Enter vacío.

   PLANTILLA PARA COPIAR Y PEGAR (ojo con las comas entre actividades):

   { id:"mi-actividad", grupo:"Nombre del subapartado", titulo:"Título", resumen:"Qué se practica",
     enunciado:"<p>Contexto de la actividad.</p>",
     final:"¡Muy bien!",
     pasos:[
       { tarea:"Crea la carpeta <code>fotos</code>", ok:["mkdir fotos"], out:"",
         pista:["Es un comando de crear.","Se llama mkdir.","mkdir fotos"],
         explica:"<code>mkdir</code> = make directory." },
       { tarea:"Lista el contenido", ok:["ls"], out:"fotos" }
     ]},

   CÓMO REPARTIRLAS EN VARIOS ARCHIVOS (recomendado si hay muchas)
   Puedes crear más archivos con este mismo formato, p. ej. act-ficheros.js,
   act-bashrc.js... Cada uno empieza igual que este y añade sus actividades:
       window.ACTIVIDADES = window.ACTIVIDADES || [];
       ACTIVIDADES.push( { ...actividad 1... }, { ...actividad 2... } );
   Después, en linux-terminal.html, añade un <script src="..."> por archivo,
   uno detrás de otro y siempre antes del script principal. El ORDEN de esas
   líneas decide el orden de los subapartados (y de las actividades).

   SI ALGO NO FUNCIONA
   Abre la consola del navegador (F12). El script avisa si falta el archivo, si
   hay ids repetidos o si a una actividad le faltan pasos o "ok"; las actividades
   incompletas se ignoran para que no rompan el resto.
   ===================================================================== */

window.ACTIVIDADES = window.ACTIVIDADES || [];

ACTIVIDADES.push(


  // ---------- Subapartado: Consultar comandos ----------
  { id:"tipo-ubicacion", grupo:"Consultar comandos", titulo:"¿Qué es y dónde vive?", resumen:"type y whereis",
    enunciado:'<p>Un compañero duda de dos cosas: si <code>pwd</code> es un programa o una orden interna de la bash, y en qué ruta está instalado <code>whoami</code>. Averígualo desde la terminal.</p>',
    final:'<code>type</code> te dice qué clase de comando es y <code>whereis</code> te dice dónde está.',
    pasos:[
      { tarea:'Averigua qué tipo de comando es <code>pwd</code>',
        ok:['type pwd'], out:'pwd es una orden interna del shell',
        pista:'El comando que muestra de qué tipo es otro comando se llama type.' },
      { tarea:'Localiza dónde está <code>whoami</code>',
        ok:['whereis whoami'], out:'whoami: /usr/bin/whoami /usr/share/man/man1/whoami.1.gz',
        pista:'Se usa igual que el anterior, pero la palabra empieza por "where".' }
    ]},

  // ---------- Subapartado: Ficheros y carpetas ----------
  { id:"estructura", grupo:"Ficheros y carpetas", titulo:"Tu primera estructura", resumen:"mkdir, cd, touch y ls",
    enunciado:'<p>Vas a montar la carpeta de una web desde cero. La carpeta <code>proyectos</code> todavía no existe.</p>',
    final:'Has creado una estructura, entrado en ella y comprobado el resultado: el flujo básico de cualquier sesión.',
    solucion:['La secuencia completa era: <code>mkdir -p proyectos/web</code>, <code>cd proyectos/web</code>, <code>touch index.html</code> y <code>ls</code>.',
              '<code>-p</code> creó las dos carpetas de una vez, <code>cd</code> te colocó dentro, <code>touch</code> creó el fichero vacío y <code>ls</code> confirmó que existe.'],
    pasos:[
      { tarea:'Crea de golpe la ruta <code>proyectos/web</code>',
        ok:[/^mkdir -p (\.\/)?proyectos\/web\/?$/], out:'',
        pista:['Necesitas crear una carpeta dentro de otra que aún no existe.','mkdir tiene una opción que crea también las carpetas intermedias.','La opción es -p: mkdir -p proyectos/web'],
        explica:['Con <code>-p</code> no hace falta crear <code>proyectos</code> antes que <code>web</code>.','Si la carpeta ya existe, <code>-p</code> no da error.'] },
      { tarea:'Entra en <code>proyectos/web</code>',
        ok:['cd proyectos/web','cd proyectos/web/','cd ./proyectos/web','cd ~/proyectos/web'], out:'', ruta:'~/proyectos/web',
        pista:'cd seguido de la ruta de la carpeta.' },
      { tarea:'Crea un fichero vacío llamado <code>index.html</code>',
        ok:['touch index.html'], out:'',
        pista:'touch crea ficheros vacíos.' },
      { tarea:'Muestra el contenido de la carpeta',
        ok:['ls'], out:'index.html',
        pista:'El comando para listar es de dos letras.' }
    ]},

  { id:"ficheros-lote", grupo:"Ficheros y carpetas", titulo:"Ficheros en lote", resumen:"Expansión de llaves",
    enunciado:'<p>Necesitas diez ficheros de prueba, <code>fich-1.txt</code> … <code>fich-10.txt</code>, dentro de la carpeta <code>Prueba</code>. Hacerlo uno a uno sería eterno: usa las llaves.</p>',
    final:'Las llaves <code>{1..10}</code> se expanden antes de ejecutar el comando, así que <code>touch</code> recibe los diez nombres.',
    pasos:[
      { tarea:'Entra en la carpeta <code>Prueba</code>',
        ok:['cd Prueba','cd ./Prueba','cd Prueba/','cd ~/Prueba'], out:'', ruta:'~/Prueba',
        pista:'cd Prueba' },
      { tarea:'Crea los diez ficheros con un solo <code>touch</code>',
        ok:['touch fich-{1..10}.txt'], out:'',
        pista:'El nombre lleva un rango entre llaves: fich-{1..10}.txt' },
      { tarea:'Comprueba que se han creado',
        ok:['ls'], out:'fich-10.txt  fich-2.txt  fich-4.txt  fich-6.txt  fich-8.txt\nfich-1.txt   fich-3.txt  fich-5.txt  fich-7.txt  fich-9.txt',
        pista:'Lista el contenido de la carpeta.' }
    ]},

  // ---------- Subapartado: Funciones en .bashrc ----------
  { id:"funcion-mkcd", grupo:"Funciones en .bashrc", titulo:"Tu función mkcd", resumen:"Funciones en ~/.bashrc",
    enunciado:'<p>En tu <code>~/.bashrc</code> acabas de añadir esta función:</p><pre>mkcd() {\n  mkdir -p "$1" &amp;&amp; cd "$1"\n}</pre><p>Cárgala y pruébala.</p>',
    final:'Una función de <code>~/.bashrc</code> se usa como cualquier comando. <code>$1</code> es su primer argumento.',
    pasos:[
      { tarea:'Recarga <code>~/.bashrc</code> sin cerrar la terminal',
        ok:['source ~/.bashrc','. ~/.bashrc'], out:'',
        pista:'El comando se llama source y recibe el fichero a cargar.' },
      { tarea:'Usa <code>mkcd</code> para crear y entrar en <code>proyectos/nuevo</code>',
        ok:['mkcd proyectos/nuevo','mkcd "proyectos/nuevo"'], out:'', ruta:'~/proyectos/nuevo',
        pista:'mkcd seguido de la ruta que quieres crear.' },
      { tarea:'Comprueba en qué directorio estás',
        ok:['pwd'], out:'/home/usuario/proyectos/nuevo',
        pista:'Imprime el directorio actual.' }
    ]},

  // ---------- Subapartado: Varios comandos ----------
  { id:"enlace-simbolico", grupo:"Varios comandos", titulo:"Acceso directo", resumen:"Enlace simbólico con ln -s",
    enunciado:'<p>Quieres entrar a tu carpeta <code>/home/usuario/Descargas/</code> desde un acceso directo llamado <code>softDes</code>.</p>',
    final:'Un enlace simbólico apunta a la ruta original: es el equivalente a un acceso directo de Windows.',
    pasos:[
      { tarea:'Crea el enlace simbólico <code>softDes</code> hacia <code>/home/usuario/Descargas/</code>',
        ok:['ln -s /home/usuario/Descargas/ softDes','ln -s /home/usuario/Descargas softDes','ln -s ~/Descargas softDes','ln -s ~/Descargas/ softDes'], out:'',
        pista:'ln con la opción -s, luego el destino y por último el nombre del enlace.' },
      { tarea:'Lista el contenido de <code>softDes</code>',
        ok:['ls softDes','ls softDes/'], out:'1-asir-contenido-main\nBinarioFH.pdf\nConceptos UD 1.pdf\n...',
        pista:'ls seguido del nombre del enlace.' }
    ]},
  
  // ---------- Subapartado: Ejercicios de Rafa ----------
  { id:"ejercicio1", grupo:"Ejercicios de Rafa", titulo:"Ejercicio 1/2 Básico", resumen:"Listar carpetas",
    enunciado:'<p>Listar todos los archivos del directorio <code>bin</code>.</p>',
    final:'¡Bien hecho!',
    solucion:['Podemos siempre consultar carpetas de diferentes formas, ya dependera de como nos lo pida el profesor (ya sea con <code>ls</code> o <code>tree</code>)'],
    pasos:[
      { tarea:'Lista el directorio <code>bin</code> de las formas que conozcas.',
        ok:['ls /bin', 'ls /bin/', 'tree /bin', 'tree /bin/'], out:'',
        pista:['Recuerda que hay muchos comandos para poder listar directorios.', 'Uno de ellos empieza por la l...', 'Siempre podremos listarlo de 2 o 3 formas.'],
        explica:['Si pusiste <code>ls</code> lo has hecho bien, y si pusiste <code>tree</code> tambien, el proposito iba a ser si o si listar el contenido'] },
      { tarea:'Lista el directorio <code>tmp</code> de las formas que conozcas.',
        ok:['ls /tmp', 'ls /tmp/', 'tree /tmp', 'tree /tmp/'], out:'',
        pista:'Recuerda que hay muchos comandos para poder listar directorios.' }
    ]},

  { id:"ejercicio3", grupo:"Ejercicios de Rafa", titulo:"Ejercicio 3 Básico", resumen:"Listados complejos",
    enunciado:'<p>Listar todos los archivos del directorio <code>etc</code> que empiecen por t en orden  inverso.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista el directorio <code>etc</code> de las formas que conozcas. Pero respetando el orden dictado.',
        ok:['ls -r /etc/t*', 'ls -r etc/t*'], out:'Listado de archivos...',
        pista:['Para ordenarlo por t tendríamos que poner al final t *', 'Si no sabes como ordenarlo inversamente, usa -r'] }
    ]},

  { id:"ejercicio4", grupo:"Ejercicios de Rafa", titulo:"Ejercicio 4 Básico", resumen:"Listar especial 2",
    enunciado:'<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por tty y tengan 5 caracteres.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista el directorio <code>dev</code> de las formas que conozcas. Pero empezando por tty y que tengan 5 caracteres.',
        ok:['ls /dev/tty??'], out:'',
        pista:'Para listarlo por los que empiezan por <code>tty</code> tendríamos que ponerlo al final del comando.' },
	  { tarea:'Lista el directorio <code>dev</code> de las formas que conozcas. Pero que empiecen por tty y acaben en 1,2,3 o 4.',
        ok:['ls /dev/tty[1-4]'], out:'',
        pista:'Para listarlo por los que empiezan por <code>tty</code> tendríamos que ponerlo al final del comando.' }
		
    ]}
  
);
