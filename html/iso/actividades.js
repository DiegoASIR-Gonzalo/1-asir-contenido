/* =====================================================================
   actividades.js · DATOS de las actividades (botón "Actividades")
   =====================================================================

   QUÉ ES ESTE ARCHIVO
   Aquí solo hay datos: la lista de actividades. Todo el funcionamiento
   (panel lateral, ventana, terminal, motor del simulador) está en el
   <script> de linux-terminal.html. Este archivo se carga con
       <script src="actividades.js"></script>
   justo ANTES del script principal, así que debe estar en la MISMA CARPETA
   que el HTML. Si le cambias el nombre, cambia también esa línea.

   CÓMO AÑADIR UNA ACTIVIDAD
   Copia una actividad de las que hay al final, cambia su "id" y adapta los
   pasos. No hay que tocar el HTML ni el motor: el panel se construye solo.

   CAMPOS DE CADA ACTIVIDAD
     id        : texto ÚNICO, sin espacios (p. ej. "estructura"). Sirve para recordar
                 qué actividades están completadas: si lo cambias, esa actividad
                 vuelve a aparecer como pendiente.
     grupo     : nombre del subapartado del panel. Mismo texto = mismo subapartado.
     nivel     : 1 = Básico, 2 = Medio, 3 = Reto. El panel permite filtrar por nivel.
     titulo    : nombre de la actividad (sale en el panel y en la ventana).
     resumen   : frase corta que sale bajo el título en el panel.
     enunciado : HTML que se muestra arriba en la ventana (<p>, <code>, <pre>...).
                 Para mostrar < y > escribe &lt; y &gt;; para & escribe &amp;.
     inicio    : (opcional) mundo virtual de partida. Es un objeto con:
                   cwd  : carpeta inicial (por defecto "~").
                   base : "vacio" deja solo /, /home y el home (sin Descargas ni /bin).
                   fs   : ficheros y carpetas extra. Ejemplos:
                            "~/Prueba": "dir"
                            "~/nota.txt": "Hola"
                            "~/nota.txt": { contenido: "Hola", modo: "600" }
                            "~/copia.txt": { tipo: "link", destino: "~/nota.txt" }
                 Sin "inicio" se usa el escritorio completo del simulador.
     final     : (opcional) mensaje de éxito al terminar. También admite HTML.
     solucion  : (opcional) explicación de la solución (texto o lista de párrafos).
                 Si no se pone, se genera con el "ejemplo" y el "explica" de cada paso.
     pasos     : lista de pasos que hay que superar EN ORDEN. Cada paso tiene:
        tarea  : lo que se pide (HTML). Sale como casilla en el enunciado.
        meta   : objetivo que debe cumplirse en el mundo virtual. Es la forma
                 recomendada de validar. Admite:
                   cwd        : carpeta en la que hay que terminar ("~/proyectos/web").
                   existe     : rutas que deben existir (ficheros o carpetas).
                   noExiste   : rutas que ya no deben existir.
                   contenido  : { "ruta": "texto exacto" } que debe tener un fichero.
                   modo       : { "ruta": "644" } permisos esperados.
                   enlace     : [{ path: "softDes", destino: "~/Descargas" }].
                   funcion    : nombre de una función que debe estar cargada.
                   muestra    : texto o expresión regular que debe aparecer en la salida.
                   noMuestra  : texto o expresión regular que NO debe aparecer.
                   orden      : textos que deben salir en ese orden.
                   salida     : salida completa esperada (se comparan los espacios sobrantes).
                 Las rutas relativas de "meta" se resuelven desde la carpeta en la
                 que queda la terminal DESPUÉS de ejecutar el comando. Si el paso
                 cambia de carpeta, usa rutas con "~/" para no depender de dónde
                 acabe la terminal.
                 Si el comando no cumple alguno, el paso no avanza y el mundo
                 virtual se queda como estaba (los pasos son atómicos).
        acepta : (alternativa a "meta") textos o expresiones regulares que se aceptan
                 como comando correcto. Se mantiene por compatibilidad con el formato
                 antiguo "ok".
        ok     : igual que "acepta" (formato antiguo).
        pista  : TEXTO PLANO sin HTML. Puede ser un texto o una lista de 3 pistas,
                 de más suave a más directa. Cada petición enseña la siguiente.
        explica: (recomendado) HTML con la explicación que aparece bajo la tarea
                 cuando se supera el paso. Texto o lista de párrafos.
        ejemplo: (recomendado) el comando exacto que resuelve el paso. Se usa para
                 el botón "Ver solución" y para reconstruir el progreso guardado.
        out    : (formato antiguo) salida fija que se muestra al acertar.

   CÓMO SE COMPARA LO QUE ESCRIBE LA PERSONA
   - Antes de comparar se recorta el texto y los espacios repetidos se juntan en
     uno: "  ls    -l " equivale a "ls -l".
   - En los pasos con "meta" no se compara el texto: se ejecuta el comando en una
     copia del mundo virtual y se comprueba el objetivo. Así se aceptan variantes
     equivalentes (por ejemplo "ls /bin" y "ls -l /bin" para listar /bin).
   - "acepta" y "ok" sí comparan el comando completo. Cada elemento puede ser:
       * un TEXTO: tiene que coincidir exactamente (distingue mayúsculas).
       * una EXPRESIÓN REGULAR para aceptar varias formas: /^mkdir -p (\.\/)?web\/?$/
   - La terminal acepta siempre "clear", las flechas arriba/abajo (historial) y Enter vacío.
     Además, Tab completa comandos, opciones y rutas (como bash) y Ctrl+L limpia la
     pantalla. Al superar un paso se suman puntos y se celebra con partículas; al
     terminar la actividad, confeti. No hay que configurar nada de eso en los datos.

   PLANTILLA PARA COPIAR Y PEGAR (ojo con las comas entre actividades):

   { id:"mi-actividad", grupo:"Nombre del subapartado", nivel:1,
     titulo:"Título", resumen:"Qué se practica",
     enunciado:"<p>Contexto de la actividad.</p>",
     final:"¡Muy bien!",
     pasos:[
       { tarea:"Crea la carpeta <code>fotos</code>",
         meta:{ existe:["fotos"] },
         pista:["Es un comando de crear.","Se llama mkdir.","mkdir fotos"],
         explica:"<code>mkdir</code> = make directory.",
         ejemplo:"mkdir fotos" },
       { tarea:"Lista el contenido",
         meta:{ muestra:"fotos" },
         pista:["Lista la carpeta actual.","El comando es de dos letras.","ls"],
         explica:"<code>ls</code> lista el contenido del directorio actual.",
         ejemplo:"ls" }
     ]},

   CÓMO REPARTIRLAS EN VARIOS ARCHIVOS (recomendado si hay muchas)
   Puedes crear más archivos con este mismo formato, p. ej. act-ficheros.js.
   Cada uno empieza igual que este y añade sus actividades:
       window.ACTIVIDADES = window.ACTIVIDADES || [];
       ACTIVIDADES.push( { ...actividad 1... }, { ...actividad 2... } );
   Después, en linux-terminal.html, añade un <script src="..."> por archivo,
   uno detrás de otro y siempre antes del script principal. El ORDEN de esas
   líneas decide el orden de los subapartados (y de las actividades).

   COMPROBAR QUE TODO ESTÁ BIEN (antes de dar una actividad por terminada)
   Desde la carpeta del repositorio, ejecuta:
       node html/iso/pruebas/actividades.test.js
   Recorre todas las actividades, escribe el "ejemplo" de cada paso y avisa si
   alguno no lo supera, si falta una pista, si un "meta" tiene una clave mal
   escrita o si un comando inventado consigue avanzar. Solo necesita Node; no
   hay que instalar nada.

   SI ALGO NO FUNCIONA
   Abre la consola del navegador (F12). El script avisa si falta el archivo, si
   hay ids repetidos, si a una actividad le faltan pasos o si un paso no tiene
   "meta", "ok" ni "acepta"; las actividades incompletas se ignoran para que no
   rompan el resto.
   ===================================================================== */

window.ACTIVIDADES = window.ACTIVIDADES || [];

ACTIVIDADES.push(


  // ---------- Subapartado: Consultar comandos ----------
  { id:"tipo-ubicacion", grupo:"Consultar comandos", nivel:1, titulo:"¿Qué es y dónde vive?", resumen:"type y whereis",
    enunciado:'<p>Un compañero duda de dos cosas: si <code>pwd</code> es un programa o una orden interna de la bash, y en qué ruta está instalado <code>whoami</code>. Averígualo desde la terminal.</p>',
    final:'<code>type</code> te dice qué clase de comando es y <code>whereis</code> te dice dónde está.',
    solucion:['<code>type</code> consulta cómo interpreta la shell un nombre: orden interna, programa, alias o función.',
              '<code>whereis</code> busca el ejecutable y sus páginas de manual en las carpetas habituales.'],
    pasos:[
      { tarea:'Averigua qué tipo de comando es <code>pwd</code>',
        meta:{ salida:'pwd es una orden interna del shell' },
        pista:['Hace falta un comando que te diga de qué tipo es otro comando.','Se llama type y recibe el nombre del comando.','type pwd'],
        explica:'<code>type</code> distingue las órdenes internas del shell (como <code>pwd</code>) de los programas instalados (como <code>ls</code>).',
        ejemplo:'type pwd' },
      { tarea:'Localiza dónde está <code>whoami</code>',
        meta:{ salida:'whoami: /usr/bin/whoami /usr/share/man/man1/whoami.1.gz' },
        pista:['Busca un comando que localice el ejecutable y su manual.','Su nombre empieza por "where".','whereis whoami'],
        explica:'<code>whereis</code> muestra el ejecutable y las páginas de manual que coinciden con el nombre.',
        ejemplo:'whereis whoami' }
    ]},

  // ---------- Subapartado: Ficheros y carpetas ----------
  { id:"estructura", grupo:"Ficheros y carpetas", nivel:1, titulo:"Tu primera estructura", resumen:"mkdir, cd, touch y ls",
    enunciado:'<p>Vas a montar la carpeta de una web desde cero. La carpeta <code>proyectos</code> todavía no existe.</p>',
    inicio:{ base:'vacio' },
    final:'Has creado una estructura, entrado en ella y comprobado el resultado: el flujo básico de cualquier sesión.',
    solucion:['La secuencia completa era: <code>mkdir -p proyectos/web</code>, <code>cd proyectos/web</code>, <code>touch index.html</code> y <code>ls</code>.',
              '<code>-p</code> creó las dos carpetas de una vez, <code>cd</code> te colocó dentro, <code>touch</code> creó el fichero vacío y <code>ls</code> confirmó que existe.'],
    pasos:[
      { tarea:'Crea de golpe la ruta <code>proyectos/web</code>',
        meta:{ existe:['proyectos','proyectos/web'] },
        pista:['Necesitas crear una carpeta dentro de otra que aún no existe.','mkdir tiene una opción que crea también las carpetas intermedias.','La opción es -p: mkdir -p proyectos/web'],
        explica:'Con <code>-p</code> no hace falta crear <code>proyectos</code> antes que <code>web</code>, y si ya existe no da error.',
        ejemplo:'mkdir -p proyectos/web' },
      { tarea:'Entra en <code>proyectos/web</code>',
        meta:{ cwd:'~/proyectos/web' },
        pista:['Cambia de carpeta con cd.','La ruta es relativa: proyectos/web.','cd proyectos/web'],
        explica:'<code>cd</code> cambia el directorio actual. El prompt muestra <code>~/proyectos/web</code> para confirmarlo.',
        ejemplo:'cd proyectos/web' },
      { tarea:'Crea un fichero vacío llamado <code>index.html</code>',
        meta:{ existe:['index.html'] },
        pista:['El comando crea el fichero si no existe.','Se llama touch.','touch index.html'],
        explica:'<code>touch</code> crea un fichero vacío (o actualiza la fecha de uno que ya existe).',
        ejemplo:'touch index.html' },
      { tarea:'Muestra el contenido de la carpeta',
        meta:{ muestra:'index.html' },
        pista:['Lista el directorio actual.','El comando es de dos letras.','ls'],
        explica:'<code>ls</code> lista el contenido del directorio actual. Debe aparecer <code>index.html</code>.',
        ejemplo:'ls' }
    ]},

  { id:"ficheros-lote", grupo:"Ficheros y carpetas", nivel:2, titulo:"Ficheros en lote", resumen:"Expansión de llaves",
    enunciado:'<p>Necesitas diez ficheros de prueba, <code>fich-1.txt</code> a <code>fich-10.txt</code>, dentro de la carpeta <code>Prueba</code>. Hacerlo uno a uno sería eterno: usa las llaves.</p>',
    inicio:{ fs:{ '~/Prueba':'dir' } },
    final:'Las llaves <code>{1..10}</code> se expanden antes de ejecutar el comando, así que <code>touch</code> recibe los diez nombres.',
    solucion:['Primero se entra en <code>Prueba</code> con <code>cd Prueba</code>.',
              'Después, <code>touch fich-{1..10}.txt</code> genera diez argumentos y <code>ls</code> confirma que están todos.'],
    pasos:[
      { tarea:'Entra en la carpeta <code>Prueba</code>',
        meta:{ cwd:'~/Prueba' },
        pista:['La carpeta ya existe en tu home.','Cambia de directorio con cd.','cd Prueba'],
        explica:'<code>cd Prueba</code> entra en una carpeta que ya existe.',
        ejemplo:'cd Prueba' },
      { tarea:'Crea los diez ficheros con un solo <code>touch</code>',
        meta:{ existe:['fich-1.txt','fich-2.txt','fich-3.txt','fich-4.txt','fich-5.txt','fich-6.txt','fich-7.txt','fich-8.txt','fich-9.txt','fich-10.txt'] },
        pista:['El nombre lleva un rango entre llaves.','El rango se escribe con dos puntos: {1..10}.','touch fich-{1..10}.txt'],
        explica:'La bash expande <code>{1..10}</code> en <code>1 2 3 … 10</code> antes de ejecutar <code>touch</code>, que recibe los diez nombres.',
        ejemplo:'touch fich-{1..10}.txt' },
      { tarea:'Comprueba que se han creado',
        meta:{ muestra:['fich-1.txt','fich-10.txt'], noMuestra:'fich-11.txt' },
        pista:['Lista el contenido de la carpeta actual.','El comando es de dos letras.','ls'],
        explica:'<code>ls</code> muestra los diez ficheros. El orden de las columnas no importa: lo que importa es que estén todos.',
        ejemplo:'ls' }
    ]},

  // ---------- Subapartado: Funciones en .bashrc ----------
  { id:"funcion-mkcd", grupo:"Funciones en .bashrc", nivel:2, titulo:"Tu función mkcd", resumen:"Funciones en ~/.bashrc",
    enunciado:'<p>En tu <code>~/.bashrc</code> acabas de añadir esta función:</p><pre>mkcd() {\n  mkdir -p "$1" &amp;&amp; cd "$1"\n}</pre><p>Cárgala y pruébala.</p>',
    final:'Una función de <code>~/.bashrc</code> se usa como cualquier comando. <code>$1</code> es su primer argumento.',
    solucion:['<code>source ~/.bashrc</code> vuelve a leer el fichero y define la función en la sesión actual.',
              'Después, <code>mkcd proyectos/nuevo</code> la ejecuta, y <code>pwd</code> confirma la ruta final.'],
    pasos:[
      { tarea:'Recarga <code>~/.bashrc</code> sin cerrar la terminal',
        meta:{ funcion:'mkcd' },
        pista:['El fichero se lee con un comando que empieza por "s".','Se llama source y recibe el fichero a cargar.','source ~/.bashrc'],
        explica:'<code>source</code> ejecuta el fichero en la shell actual, así que la función queda disponible.',
        ejemplo:'source ~/.bashrc' },
      { tarea:'Usa <code>mkcd</code> para crear y entrar en <code>proyectos/nuevo</code>',
        meta:{ cwd:'~/proyectos/nuevo', existe:['~/proyectos/nuevo'] },
        pista:['mkcd recibe la ruta que quieres crear y en la que quieres entrar.','La ruta pedida es proyectos/nuevo.','mkcd proyectos/nuevo'],
        explica:'<code>mkcd</code> combina <code>mkdir -p</code> y <code>cd</code>: crea la ruta y te coloca dentro.',
        ejemplo:'mkcd proyectos/nuevo' },
      { tarea:'Comprueba en qué directorio estás',
        meta:{ salida:'/home/usuario/proyectos/nuevo' },
        pista:['El comando imprime la ruta de trabajo actual.','Su nombre son tres letras.','pwd'],
        explica:'<code>pwd</code> (print working directory) muestra la ruta absoluta del directorio actual.',
        ejemplo:'pwd' }
    ]},

  // ---------- Subapartado: Varios comandos ----------
  { id:"enlace-simbolico", grupo:"Varios comandos", nivel:2, titulo:"Acceso directo", resumen:"Enlace simbólico con ln -s",
    enunciado:'<p>Quieres entrar a tu carpeta <code>/home/usuario/Descargas/</code> desde un acceso directo llamado <code>softDes</code>.</p>',
    final:'Un enlace simbólico apunta a la ruta original: es el equivalente a un acceso directo de Windows.',
    solucion:['<code>ln -s /home/usuario/Descargas softDes</code> crea el enlace en tu home.',
              '<code>ls softDes</code> lista el contenido del destino y <code>file softDes</code> confirma que es un enlace simbólico.'],
    pasos:[
      { tarea:'Crea el enlace simbólico <code>softDes</code> hacia <code>/home/usuario/Descargas/</code>',
        meta:{ enlace:[{ path:'softDes', destino:'~/Descargas' }] },
        pista:['El comando para crear enlaces es ln.','Con la opción -s el enlace es simbólico.','ln -s ~/Descargas softDes'],
        explica:'<code>-s</code> crea un enlace simbólico; si se omite, se crea un enlace duro al mismo contenido.',
        ejemplo:'ln -s ~/Descargas softDes' },
      { tarea:'Lista el contenido de <code>softDes</code>',
        meta:{ muestra:['1-asir-contenido-main','BinarioFH.pdf','Conceptos UD 1.pdf'] },
        pista:['El enlace se usa como si fuera la carpeta de destino.','Lista la ruta softDes.','ls softDes'],
        explica:'Al listar el enlace, la shell resuelve el destino y muestra el contenido de <code>~/Descargas</code>.',
        ejemplo:'ls softDes' },
      { tarea:'Comprueba de qué tipo es <code>softDes</code>',
        meta:{ muestra:'enlace simbólico a /home/usuario/Descargas' },
        pista:['Hay un comando que dice qué tipo de fichero es.','Se llama file.','file softDes'],
        explica:'<code>file</code> identifica el tipo: en este caso, un enlace simbólico y la ruta a la que apunta.',
        ejemplo:'file softDes' }
    ]},

  // ---------- Subapartado: Ejercicios de Rafa ----------
  { id:"ejercicio1", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 1 Básico", resumen:"Listar carpetas",
    enunciado:'<p>Listar todos los archivos del directorio <code>bin</code>.</p>',
    final:'¡Bien hecho!',
    solucion:['Siempre podemos listar carpetas de varias formas; depende de cómo lo pida el profesor (con <code>ls</code> o <code>tree</code>).'],
    pasos:[
      { tarea:'Lista el directorio <code>bin</code> de las formas que conozcas.',
        meta:{ muestra:['bash','cat','ls','pwd'] },
        pista:['Recuerda que hay muchos comandos para poder listar directorios.','Uno de ellos empieza por la letra l.','ls /bin'],
        explica:'Tanto <code>ls /bin</code> como <code>tree /bin</code> listan su contenido: las dos formas son válidas.',
        ejemplo:'ls /bin' },
      { tarea:'Lista el directorio <code>tmp</code> de las formas que conozcas.',
        meta:{ muestra:'cache' },
        pista:['Recuerda que hay muchos comandos para poder listar directorios.','El comando ls recibe la ruta como argumento.','ls /tmp'],
        explica:'Dentro de <code>/tmp</code> hay una carpeta llamada <code>cache</code>.',
        ejemplo:'ls /tmp' }
    ]},

  { id:"ejercicio3", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 2 Básico", resumen:"Listados complejos",
    enunciado:'<p>Listar todos los archivos del directorio <code>etc</code> que empiecen por t en orden inverso.</p>',
    final:'¡Bien hecho!',
    solucion:['El comodín <code>t*</code> filtra los nombres que empiezan por t y <code>-r</code> invierte el orden.'],
    pasos:[
      { tarea:'Lista los archivos de <code>/etc</code> que empiezan por t, en orden inverso.',
        meta:{ orden:['tmpfiles.d','timezone','terminfo'], noMuestra:['hosts','passwd'] },
        pista:['Para filtrar por la letra t, añade t* al final de la ruta.','Si no sabes cómo ordenarlo al revés, usa -r.','ls -r /etc/t*'],
        explica:'<code>ls -r</code> invierte el orden de la lista; <code>ls -R</code> (con mayúscula) es otra cosa: recorre también las subcarpetas.',
        ejemplo:'ls -r /etc/t*' },
      { tarea:'Ahora lista esos mismos archivos sin invertir el orden, para comparar.',
        meta:{ orden:['terminfo','timezone','tmpfiles.d'], noMuestra:['hosts','passwd'] },
        pista:['Quita la opción que invierte el orden.','El comodín t* sigue siendo necesario.','ls /etc/t*'],
        explica:'Sin <code>-r</code> los nombres salen en orden alfabético normal: <code>terminfo</code>, <code>timezone</code> y <code>tmpfiles.d</code>.',
        ejemplo:'ls /etc/t*' }
    ]},

  { id:"ejercicio4", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 3 Básico", resumen:"Comodines con ? y []",
    enunciado:'<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por tty y tengan 4 caracteres.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>?</code> sustituye exactamente a un carácter y <code>[1-4]</code> a un dígito del 1 al 4.'],
    pasos:[
      { tarea:'Lista los archivos de <code>/dev</code> que empiezan por tty y tienen 4 caracteres.',
        meta:{ muestra:['tty0','tty4'], noMuestra:'ttyS0' },
        pista:['Para exigir exactamente un carácter se usa el comodín ?.','Necesitas un solo comodín después de tty.','ls /dev/tty?'],
        explica:'Cada <code>?</code> equivale a un carácter, así que <code>tty?</code> encaja con <code>tty0</code>…<code>tty4</code>, pero no con <code>tty</code> ni con <code>ttyS0</code>.',
        ejemplo:'ls /dev/tty?' },
      { tarea:'Lista los que empiezan por tty y acaban en un dígito del 1 al 4.',
        meta:{ muestra:['tty1','tty2','tty3','tty4'], noMuestra:['tty0','ttyS0'] },
        pista:['Para aceptar un rango de caracteres se usan corchetes.','El rango del 1 al 4 se escribe [1-4].','ls /dev/tty[1-4]'],
        explica:'<code>[1-4]</code> acepta un único carácter entre 1 y 4, así que deja fuera <code>tty0</code> y <code>ttyS0</code>.',
        ejemplo:'ls /dev/tty[1-4]' }
    ]}

);
