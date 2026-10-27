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
                   umask: máscara inicial ("022", "077"...). Afecta a mkdir y touch.
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
                   umask      : máscara esperada ("022", "077"...).
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
  { id:"rafa-01", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 1", resumen:"Listar /bin",
    enunciado:'<p>Listar todos los archivos del directorio <code>bin</code>.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista el contenido de <code>/bin</code>.',
        meta:{ muestra:['bash','cat','ls','pwd'] },
        pista:['La ruta del directorio es /bin.','ls recibe la ruta como argumento.','ls /bin'],
        explica:'<code>ls /bin</code> muestra los comandos instalados en ese directorio.',
        ejemplo:'ls /bin' }
    ]},

  { id:"rafa-02", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 2", resumen:"Listar /tmp",
    enunciado:'<p>Listar todos los archivos del directorio <code>tmp</code>.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista el contenido de <code>/tmp</code>.',
        meta:{ muestra:'cache' },
        pista:['La ruta del directorio es /tmp.','Puedes usar ls con la ruta absoluta.','ls /tmp'],
        explica:'Dentro de <code>/tmp</code> hay una carpeta llamada <code>cache</code>.',
        ejemplo:'ls /tmp' }
    ]},

  { id:"rafa-03", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 3", resumen:"Filtrar y ordenar /etc",
    enunciado:'<p>Listar todos los archivos del directorio <code>etc</code> que empiecen por <code>t</code> en orden inverso.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista los archivos de <code>/etc</code> que empiezan por <code>t</code>, en orden inverso.',
        meta:{ orden:['tmpfiles.d','timezone','terminfo'], noMuestra:['hosts','passwd'] },
        pista:['Para filtrar por la letra t, añade t* al final de la ruta.','Si no sabes cómo ordenarlo al revés, usa -r.','ls -r /etc/t*'],
        explica:'<code>-r</code> invierte el orden de la lista; <code>t*</code> deja solo los nombres que empiezan por t.',
        ejemplo:'ls -r /etc/t*' }
    ]},

  { id:"rafa-04", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 4", resumen:"Comodín de un carácter",
    enunciado:'<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por <code>tty</code> y tengan 5 caracteres.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista los archivos de <code>/dev</code> que empiezan por <code>tty</code> y tienen 5 caracteres.',
        meta:{ muestra:'ttyS0', noMuestra:['tty0','tty4'] },
        pista:['Cada ? sustituye exactamente a un carácter.','Después de tty necesitas dos comodines.','ls /dev/tty??'],
        explica:'<code>tty??</code> exige dos caracteres más después de tty, así que encaja con <code>ttyS0</code> y no con <code>tty0</code>.',
        ejemplo:'ls /dev/tty??' }
    ]},

  { id:"rafa-05", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 5", resumen:"Rango de caracteres",
    enunciado:'<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por <code>tty</code> y acaben en 1,2,3 ó 4.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista los archivos de <code>/dev</code> que empiezan por <code>tty</code> y acaban en un dígito del 1 al 4.',
        meta:{ muestra:['tty1','tty2','tty3','tty4'], noMuestra:['tty0','ttyS0'] },
        pista:['Para aceptar un rango de caracteres se usan corchetes.','El rango del 1 al 4 se escribe [1-4].','ls /dev/tty[1-4]'],
        explica:'<code>[1-4]</code> acepta un único carácter entre 1 y 4 y deja fuera <code>tty0</code> y <code>ttyS0</code>.',
        ejemplo:'ls /dev/tty[1-4]' }
    ]},

  { id:"rafa-06", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 6", resumen:"Filtrar por el final",
    enunciado:'<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por <code>t</code> y acaben en <code>C1</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ fs:{ '/dev/ttyC1':'' } },
    pasos:[
      { tarea:'Lista los archivos de <code>/dev</code> que empiezan por <code>t</code> y acaban en <code>C1</code>.',
        meta:{ muestra:'ttyC1', noMuestra:['tty0','ttyS0'] },
        pista:['Puedes combinar el comodín * con el texto final.','La ruta empieza por /dev/t.','ls /dev/t*C1'],
        explica:'El patrón <code>t*C1</code> empieza por t, admite cualquier cosa en medio y termina en C1.',
        ejemplo:'ls /dev/t*C1' }
    ]},

  { id:"rafa-07", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 7", resumen:"Mostrar archivos ocultos",
    enunciado:'<p>Listar todos los archivos, incluidos los ocultos, del directorio raíz.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista el contenido de <code>/</code>, incluidos los archivos ocultos.',
        meta:{ muestra:['.dockerenv','bin','etc'] },
        pista:['Los archivos ocultos empiezan por punto.','La opción -a muestra los ocultos.','ls -a /'],
        explica:'<code>ls -a /</code> enseña también los nombres que empiezan por punto, como <code>.dockerenv</code>.',
        ejemplo:'ls -a /' }
    ]},

  { id:"rafa-08", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 8", resumen:"Excluir con comodines",
    enunciado:'<p>Listar todos los archivos del directorio <code>etc</code> que no empiecen por <code>t</code>.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista los archivos de <code>/etc</code> que no empiezan por <code>t</code>.',
        meta:{ muestra:['hostname','motd','passwd'], noMuestra:['timezone','terminfo','tmpfiles.d'] },
        pista:['Dentro de unos corchetes, ! niega el conjunto.','El patrón sería [!t]*.','ls /etc/[!t]*'],
        explica:'<code>[!t]</code> acepta un carácter que no sea t; el resto del nombre lo cubre <code>*</code>.',
        ejemplo:'ls /etc/[!t]*' }
    ]},

  { id:"rafa-09", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 9", resumen:"Listado recursivo",
    enunciado:'<p>Listar todos los archivos del directorio <code>usr</code> y sus subdirectorios.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista <code>/usr</code> y todo lo que cuelga de sus subdirectorios.',
        meta:{ muestra:['/usr/share/man:','man1'] },
        pista:['La opción -R recorre los subdirectorios.','Combínala con la ruta /usr.','ls -R /usr'],
        explica:'<code>ls -R /usr</code> muestra cada carpeta y, debajo, el contenido de sus subcarpetas.',
        ejemplo:'ls -R /usr' }
    ]},

  { id:"rafa-10", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 10", resumen:"Cambiar a /tmp",
    enunciado:'<p>Cambiarse al directorio <code>tmp</code>.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Cambia al directorio <code>/tmp</code>.',
        meta:{ cwd:'/tmp' },
        pista:['El comando para cambiar de carpeta es cd.','Puedes usar la ruta absoluta.','cd /tmp'],
        explica:'<code>cd /tmp</code> cambia el directorio actual a <code>/tmp</code>.',
        ejemplo:'cd /tmp' }
    ]},

  { id:"rafa-11", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 11", resumen:"Comprobar el directorio",
    enunciado:'<p>Verificar que el directorio actual ha cambiado.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'/tmp' },
    pasos:[
      { tarea:'Muestra la ruta del directorio actual.',
        meta:{ salida:'/tmp' },
        pista:['El comando que muestra la ruta actual tiene tres letras.','Muestra la trayectoria completa.','pwd'],
        explica:'<code>pwd</code> imprime la ruta absoluta del directorio en el que estás.',
        ejemplo:'pwd' }
    ]},

  { id:"rafa-12", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 12", resumen:"Día y hora",
    enunciado:'<p>Mostrar el día y la hora actual.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Muestra la fecha y la hora del sistema.',
        meta:{ muestra:[/\d{2}:\d{2}/,'UTC'] },
        pista:['El comando se llama date.','No necesita argumentos.','date'],
        explica:'<code>date</code> muestra el día, la fecha y la hora actuales.',
        ejemplo:'date' }
    ]},

  { id:"rafa-13", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 13", resumen:"Volver a $HOME",
    enunciado:'<p>Con un solo comando posicionarse en el directorio <code>$HOME</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'/tmp' },
    pasos:[
      { tarea:'Vuelve a tu directorio personal con un solo comando.',
        meta:{ cwd:'~' },
        pista:['La variable $HOME guarda tu directorio personal.','También puedes usar la abreviatura ~.','cd $HOME'],
        explica:'<code>cd $HOME</code> cambia al directorio personal del usuario.',
        ejemplo:'cd $HOME' }
    ]},

  { id:"rafa-14", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 14", resumen:"Verificar $HOME",
    enunciado:'<p>Verificar que se está en él.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~' },
    pasos:[
      { tarea:'Comprueba que el directorio actual es tu directorio personal.',
        meta:{ salida:'/home/usuario' },
        pista:['Usa el comando que muestra la ruta actual.','La ruta completa empieza por /home.','pwd'],
        explica:'<code>pwd</code> debe mostrar <code>/home/usuario</code>.',
        ejemplo:'pwd' }
    ]},

  { id:"rafa-15", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 15", resumen:"Número de inodo",
    enunciado:'<p>Listar todos los ficheros del directorio <code>HOME</code> mostrando su número de inodo.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Lista los ficheros de tu directorio personal mostrando el número de inodo.',
        meta:{ muestra:[/\d+/,'Descargas'] },
        pista:['La opción -i de ls muestra el número de inodo.','Puedes combinar -i con la ruta del home.','ls -i ~'],
        explica:'<code>ls -i ~</code> antepone a cada nombre su número de inodo.',
        ejemplo:'ls -i ~' }
    ]},

  { id:"rafa-16", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Ejercicio 16", resumen:"Crear prueba",
    enunciado:'<p>Crear en vuestro directorio de inicio, un directorio <code>prueba</code>.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Crea el directorio <code>prueba</code> en tu directorio personal.',
        meta:{ existe:'~/prueba' },
        pista:['Estás en tu directorio personal.','mkdir crea un directorio.','mkdir prueba'],
        explica:'<code>mkdir prueba</code> crea la carpeta <code>~/prueba</code>.',
        ejemplo:'mkdir prueba' }
    ]},

  { id:"rafa-17", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 17", resumen:"Árbol de directorios",
    enunciado:'<p>Crear los directorios <code>dir1</code>, <code>dir2</code> y <code>dir3</code> en el directorio <code>prueba</code>. Dentro de <code>dir1</code> crear el directorio <code>dir11</code>. Dentro del directorio <code>dir3</code> crear el directorio <code>dir31</code>. Dentro del directorio <code>dir31</code>, crear los directorios <code>dir311</code> y <code>dir312</code>.</p>',
    final:'¡Bien hecho!',
    pasos:[
      { tarea:'Crea toda la estructura con una sola orden.',
        meta:{ existe:['prueba/dir1/dir11','prueba/dir2','prueba/dir3/dir31/dir311','prueba/dir3/dir31/dir312'] },
        pista:['La opción -p crea también los directorios intermedios.','Puedes pasar varias rutas a mkdir.','mkdir -p prueba/dir1/dir11 prueba/dir2 prueba/dir3/dir31/dir311 prueba/dir3/dir31/dir312'],
        explica:'<code>mkdir -p</code> crea cada ruta completa sin quejarse de los niveles que faltan.',
        ejemplo:'mkdir -p prueba/dir1/dir11 prueba/dir2 prueba/dir3/dir31/dir311 prueba/dir3/dir31/dir312' }
    ]},

  { id:"rafa-18", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 18", resumen:"Copiar motd",
    enunciado:'<p>Copiar el archivo <code>/etc/motd</code> a un archivo llamado <code>mensaje</code> de nuestro directorio <code>prueba</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba':'dir' } },
    pasos:[
      { tarea:'Copia <code>/etc/motd</code> en <code>prueba/mensaje</code>.',
        meta:{ existe:'prueba/mensaje', contenido:{ 'prueba/mensaje':'Bienvenido a Linux\n' } },
        pista:['El comando de copia es cp.','El primer argumento es el origen y el segundo el destino.','cp /etc/motd prueba/mensaje'],
        explica:'<code>cp</code> copia el contenido del fichero de origen en la ruta de destino.',
        ejemplo:'cp /etc/motd prueba/mensaje' }
    ]},

  { id:"rafa-19", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 19", resumen:"Copiar mensaje en tres carpetas",
    enunciado:'<p>Copiar <code>mensaje</code> en <code>dir1</code>, <code>dir2</code> y <code>dir3</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/mensaje':'Bienvenido a Linux\n', '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Copia <code>prueba/mensaje</code> en las tres carpetas.',
        meta:{ existe:['prueba/dir1/mensaje','prueba/dir2/mensaje','prueba/dir3/mensaje'] },
        pista:['Puedes encadenar varios comandos con punto y coma.','Cada cp necesita su origen y su destino.','cp prueba/mensaje prueba/dir1; cp prueba/mensaje prueba/dir2; cp prueba/mensaje prueba/dir3'],
        explica:'Cada <code>cp</code> copia el mismo fichero a una carpeta distinta.',
        ejemplo:'cp prueba/mensaje prueba/dir1; cp prueba/mensaje prueba/dir2; cp prueba/mensaje prueba/dir3' }
    ]},

  { id:"rafa-20", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 20", resumen:"Comprobar con un comando",
    enunciado:'<p>Comprobar el ejercicio anterior mediante un solo comando.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1/mensaje':'x', '~/prueba/dir2/mensaje':'x', '~/prueba/dir3/mensaje':'x' } },
    pasos:[
      { tarea:'Comprueba con un solo comando que <code>mensaje</code> está en <code>dir1</code>, <code>dir2</code> y <code>dir3</code>.',
        meta:{ orden:['dir1/mensaje','dir2/mensaje','dir3/mensaje'] },
        pista:['find busca de forma recursiva por un nombre.','Puedes buscar dentro de la carpeta prueba.','find prueba -name mensaje'],
        explica:'<code>find prueba -name mensaje</code> recorre el árbol y muestra las tres copias en una sola salida.',
        ejemplo:'find prueba -name mensaje' }
    ]},

  { id:"rafa-21", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 21", resumen:"Copiar rc2.d",
    enunciado:'<p>Copiar los archivos del directorio <code>rc2.d</code> que se encuentra en <code>/etc</code> al directorio <code>dir31</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir3/dir31':'dir' } },
    pasos:[
      { tarea:'Copia todos los archivos de <code>/etc/rc2.d</code> en <code>prueba/dir3/dir31</code>.',
        meta:{ existe:['prueba/dir3/dir31/README','prueba/dir3/dir31/S01cron','prueba/dir3/dir31/S20ssh'] },
        pista:['El comodín * representa todos los nombres.','El destino es la carpeta dir31.','cp /etc/rc2.d/* prueba/dir3/dir31'],
        explica:'El comodín <code>*</code> expande todos los ficheros de <code>rc2.d</code> y <code>cp</code> los copia en el destino.',
        ejemplo:'cp /etc/rc2.d/* prueba/dir3/dir31' }
    ]},

  { id:"rafa-22", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 22", resumen:"Filtrar nombres de /bin",
    enunciado:'<p>Copiar en el directorio <code>dir311</code> los archivos de <code>/bin</code> que tengan una <code>a</code> como segunda letra y su nombre tenga cuatro letras.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir3/dir31/dir311':'dir' } },
    pasos:[
      { tarea:'Copia en <code>prueba/dir3/dir31/dir311</code> los archivos de <code>/bin</code> con cuatro letras y una <code>a</code> en segundo lugar.',
        meta:{ existe:['prueba/dir3/dir31/dir311/bash','prueba/dir3/dir31/dir311/date','prueba/dir3/dir31/dir311/tail'], noExiste:['prueba/dir3/dir31/dir311/cat'] },
        pista:['? sustituye a un solo carácter.','El patrón ?a?? empieza por cualquier letra, sigue con a y acaba con dos caracteres.','cp /bin/?a?? prueba/dir3/dir31/dir311'],
        explica:'<code>?a??</code> encaja con <code>bash</code>, <code>date</code> y <code>tail</code>, pero no con <code>cat</code>, que solo tiene tres letras.',
        ejemplo:'cp /bin/?a?? prueba/dir3/dir31/dir311' }
    ]},

  { id:"rafa-23", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 23", resumen:"Copiar otro usuario",
    enunciado:'<p>Copiar el directorio de otro usuario y sus subdirectorios debajo de <code>dir11</code> (incluido el propio directorio).</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1/dir11':'dir' } },
    pasos:[
      { tarea:'Copia <code>/home/rafa</code> y todo su contenido dentro de <code>prueba/dir1/dir11</code>.',
        meta:{ existe:['prueba/dir1/dir11/rafa','prueba/dir1/dir11/rafa/Documentos/nota.txt','prueba/dir1/dir11/rafa/Descargas/apuntes.txt'] },
        pista:['Para copiar carpetas necesitas la opción -r.','El origen es /home/rafa y el destino dir11.','cp -r /home/rafa prueba/dir1/dir11'],
        explica:'<code>cp -r</code> copia la carpeta indicada, sus subcarpetas y todos sus ficheros.',
        ejemplo:'cp -r /home/rafa prueba/dir1/dir11' }
    ]},

  { id:"rafa-24", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 24", resumen:"Mover dir31",
    enunciado:'<p>Mover el directorio <code>dir31</code> y sus subdirectorios debajo de <code>dir2</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir2':'dir', '~/prueba/dir3/dir31/dir311':'dir', '~/prueba/dir3/dir31/dir312':'dir' } },
    pasos:[
      { tarea:'Mueve <code>prueba/dir3/dir31</code> dentro de <code>prueba/dir2</code>.',
        meta:{ existe:['prueba/dir2/dir31/dir311','prueba/dir2/dir31/dir312'], noExiste:'prueba/dir3/dir31' },
        pista:['El comando para mover es mv.','El destino es la carpeta dir2.','mv prueba/dir3/dir31 prueba/dir2'],
        explica:'<code>mv</code> traslada la carpeta completa, con sus subdirectorios, a la nueva ubicación.',
        ejemplo:'mv prueba/dir3/dir31 prueba/dir2' }
    ]},

  { id:"rafa-25", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 25", resumen:"Archivos ordinarios del HOME",
    enunciado:'<p>Mostrar por pantalla los archivos ordinarios del directorio <code>HOME</code> y sus subdirectorios.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1/mensaje':'x' } },
    pasos:[
      { tarea:'Muestra solo los archivos ordinarios de tu directorio personal y sus subdirectorios.',
        meta:{ muestra:['.bashrc','BinarioFH.pdf','mensaje'] },
        pista:['find recorre el árbol de directorios.','El criterio -type f selecciona archivos ordinarios.','find ~ -type f'],
        explica:'<code>find ~ -type f</code> recorre el home y muestra únicamente los ficheros, sin las carpetas.',
        ejemplo:'find ~ -type f' }
    ]},

  { id:"rafa-26", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 26", resumen:"Ocultar mensaje",
    enunciado:'<p>Ocultar el archivo <code>mensaje</code> del directorio <code>dir3</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir3/mensaje':'x' } },
    pasos:[
      { tarea:'Renombra <code>prueba/dir3/mensaje</code> para que quede oculto.',
        meta:{ existe:'prueba/dir3/.mensaje', noExiste:'prueba/dir3/mensaje' },
        pista:['Un archivo se oculta si su nombre empieza por punto.','Puedes cambiar el nombre con mv.','mv prueba/dir3/mensaje prueba/dir3/.mensaje'],
        explica:'Al poner un punto delante del nombre, el archivo deja de aparecer en un <code>ls</code> normal.',
        ejemplo:'mv prueba/dir3/mensaje prueba/dir3/.mensaje' },
      { tarea:'Comprueba que el archivo oculto está en <code>dir3</code>.',
        meta:{ muestra:'.mensaje' },
        pista:['Usa ls con la opción -a.','La ruta es prueba/dir3.','ls -a prueba/dir3'],
        explica:'<code>ls -a</code> sí muestra los nombres que empiezan por punto.',
        ejemplo:'ls -a prueba/dir3' }
    ]},

  { id:"rafa-27", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 27", resumen:"Borrar dir1",
    enunciado:'<p>Borrar los archivos y directorios de <code>dir1</code>, incluido el propio directorio.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1/dir11':'dir', '~/prueba/dir1/mensaje':'x', '~/prueba/dir2':'dir' } },
    pasos:[
      { tarea:'Borra <code>prueba/dir1</code> con todo lo que contiene.',
        meta:{ noExiste:'prueba/dir1', existe:'prueba/dir2' },
        pista:['rm borra archivos, pero para carpetas necesita -r.','La ruta que hay que borrar es prueba/dir1.','rm -r prueba/dir1'],
        explica:'<code>rm -r</code> borra la carpeta y todo su contenido de forma recursiva.',
        ejemplo:'rm -r prueba/dir1' }
    ]},

  { id:"rafa-28", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 28", resumen:"Copiar dispositivos filtrados",
    enunciado:'<p>Copiar al directorio <code>dir312</code> los ficheros del directorio <code>/dev</code> que empiecen por <code>t</code>, acaben en una letra que vaya de la <code>a</code> a la <code>b</code> y tengan cinco letras en su nombre.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir3/dir31/dir312':'dir', '/dev/ttySa':'', '/dev/ttySb':'' } },
    pasos:[
      { tarea:'Copia en <code>prueba/dir3/dir31/dir312</code> los archivos de <code>/dev</code> con cinco letras, que empiecen por <code>t</code> y acaben en <code>a</code> o <code>b</code>.',
        meta:{ existe:['prueba/dir3/dir31/dir312/ttySa','prueba/dir3/dir31/dir312/ttySb'], noExiste:'prueba/dir3/dir31/dir312/ttyS0' },
        pista:['Necesitas cinco caracteres: t y cuatro más.','El último carácter debe estar en el rango [a-b].','cp /dev/t???[ab] prueba/dir3/dir31/dir312'],
        explica:'<code>t???[ab]</code> exige una t, tres caracteres cualesquiera y una a o una b al final.',
        ejemplo:'cp /dev/t???[ab] prueba/dir3/dir31/dir312' }
    ]},

  { id:"rafa-29", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 29", resumen:"Borrar con comodines",
    enunciado:'<p>Borrar los archivos de <code>dir312</code> que no acaben en <code>b</code> y tengan una <code>q</code> como cuarta letra.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir3/dir31/dir312/ttyqa':'a', '~/prueba/dir3/dir31/dir312/ttyqb':'b', '~/prueba/dir3/dir31/dir312/ttyqc':'c' } },
    pasos:[
      { tarea:'Borra de <code>dir312</code> los archivos con <code>q</code> en cuarta posición que no acaben en <code>b</code>.',
        meta:{ existe:'prueba/dir3/dir31/dir312/ttyqb', noExiste:['prueba/dir3/dir31/dir312/ttyqa','prueba/dir3/dir31/dir312/ttyqc'] },
        pista:['Puedes combinar * con corchetes negados.','El patrón *q[!b] deja fuera los que acaban en b.','rm prueba/dir3/dir31/dir312/*q[!b]'],
        explica:'<code>[!b]</code> acepta cualquier carácter que no sea b; por eso se conserva <code>ttyqb</code>.',
        ejemplo:'rm prueba/dir3/dir31/dir312/*q[!b]' }
    ]},

  { id:"rafa-30", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 30", resumen:"Mover dir312",
    enunciado:'<p>Mover el directorio <code>dir312</code> debajo de <code>dir3</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir3/dir31/dir312/ttyqb':'b' } },
    pasos:[
      { tarea:'Mueve <code>prueba/dir3/dir31/dir312</code> dentro de <code>prueba/dir3</code>.',
        meta:{ existe:'prueba/dir3/dir312/ttyqb', noExiste:'prueba/dir3/dir31/dir312' },
        pista:['mv mueve archivos y carpetas.','El destino es la carpeta dir3.','mv prueba/dir3/dir31/dir312 prueba/dir3'],
        explica:'<code>mv</code> cambia de sitio la carpeta completa con su contenido.',
        ejemplo:'mv prueba/dir3/dir31/dir312 prueba/dir3' }
    ]},

  { id:"rafa-31", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 31", resumen:"Enlace simbólico",
    enunciado:'<p>Crear un enlace simbólico al directorio <code>dir1</code> dentro del directorio <code>dir3</code> llamado <code>enlacedir1</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir1':'dir', '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Crea el enlace <code>prueba/dir3/enlacedir1</code> apuntando a <code>prueba/dir1</code>.',
        meta:{ enlace:[{ path:'~/prueba/dir3/enlacedir1', destino:'~/prueba/dir1' }] },
        pista:['Un enlace simbólico se crea con ln -s.','Primero va el destino y después el nombre del enlace.','ln -s dir1 dir3/enlacedir1'],
        explica:'<code>ln -s</code> crea un acceso directo que apunta al directorio indicado.',
        ejemplo:'ln -s dir1 dir3/enlacedir1' }
    ]},

  { id:"rafa-32", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 32", resumen:"Crear a través del enlace",
    enunciado:'<p>Posicionarse en <code>dir3</code> y, empleando el enlace creado en el ejercicio anterior, crear el directorio <code>nuevo1</code> dentro de <code>dir1</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir1':'dir', '~/prueba/dir3':'dir', '~/prueba/dir3/enlacedir1':{ tipo:'link', destino:'~/prueba/dir1' } } },
    pasos:[
      { tarea:'Entra en <code>dir3</code>, accede por el enlace y crea <code>nuevo1</code> dentro de <code>dir1</code>.',
        meta:{ cwd:'~/prueba/dir1', existe:'nuevo1' },
        pista:['Primero entra en dir3.','Después puedes entrar en enlacedir1 como si fuera dir1.','cd dir3; cd enlacedir1; mkdir nuevo1'],
        explica:'Al entrar por <code>enlacedir1</code>, el directorio actual se resuelve a <code>dir1</code> y <code>nuevo1</code> se crea dentro.',
        ejemplo:'cd dir3; cd enlacedir1; mkdir nuevo1' }
    ]},

  { id:"rafa-33", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 33", resumen:"Copiar a través del enlace",
    enunciado:'<p>Utilizando el enlace creado copiar los archivos que empiecen por <code>u</code> del directorio <code>/bin</code> en directorio <code>nuevo1</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir1/nuevo1':'dir', '~/prueba/dir3':'dir', '~/prueba/dir3/enlacedir1':{ tipo:'link', destino:'~/prueba/dir1' } } },
    pasos:[
      { tarea:'Entra por el enlace y copia en <code>nuevo1</code> los archivos de <code>/bin</code> que empiezan por <code>u</code>.',
        meta:{ existe:['nuevo1/uname','nuevo1/uptime'] },
        pista:['El comodín /bin/u* selecciona los archivos que empiezan por u.','Entra en dir3 y después en enlacedir1.','cd dir3; cd enlacedir1; cp /bin/u* nuevo1'],
        explica:'El enlace lleva a <code>dir1</code>, donde está <code>nuevo1</code>; <code>cp</code> copia allí los dos archivos.',
        ejemplo:'cd dir3; cd enlacedir1; cp /bin/u* nuevo1' }
    ]},

  { id:"rafa-34", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 34", resumen:"Enlaces duros",
    enunciado:'<p>Crear dos enlaces duros del fichero <code>fich1</code>, llamarlo <code>enlace</code>, en los directorios <code>dir1</code> y <code>dir2</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1/fich1':'contenido de fich1\n', '~/prueba/dir2':'dir' } },
    pasos:[
      { tarea:'Crea <code>enlace</code> en <code>dir1</code> y en <code>dir2</code> como enlace duro de <code>fich1</code>.',
        meta:{ existe:['prueba/dir1/enlace','prueba/dir2/enlace'], contenido:{ 'prueba/dir1/enlace':'contenido de fich1\n', 'prueba/dir2/enlace':'contenido de fich1\n' } },
        pista:['Los enlaces duros se crean con ln, sin la opción -s.','Primero va el fichero original y después el nombre del enlace.','ln prueba/dir1/fich1 prueba/dir1/enlace; ln prueba/dir1/fich1 prueba/dir2/enlace'],
        explica:'Cada enlace duro comparte el contenido y el inodo del fichero original.',
        ejemplo:'ln prueba/dir1/fich1 prueba/dir1/enlace; ln prueba/dir1/fich1 prueba/dir2/enlace' }
    ]},

  { id:"rafa-35", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 35", resumen:"Borrar fich1 y copiar enlace",
    enunciado:'<p>Borrar el archivo <code>fich1</code> y copiar <code>enlace</code> en <code>dir3</code>.</p>',
    final:'¡Bien hecho!',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1/fich1':'contenido de fich1\n', '~/prueba/dir1/enlace':'contenido de fich1\n', '~/prueba/dir2/enlace':'contenido de fich1\n', '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Borra <code>prueba/dir1/fich1</code> y copia <code>prueba/dir2/enlace</code> en <code>prueba/dir3</code>.',
        meta:{ noExiste:'prueba/dir1/fich1', existe:['prueba/dir3/enlace'], contenido:{ 'prueba/dir3/enlace':'contenido de fich1\n' } },
        pista:['Puedes encadenar el borrado y la copia con punto y coma.','El enlace que se copia está en dir2.','rm prueba/dir1/fich1; cp prueba/dir2/enlace prueba/dir3'],
        explica:'El enlace duro sigue existiendo aunque se borre <code>fich1</code>; después se copia en <code>dir3</code>.',
        ejemplo:'rm prueba/dir1/fich1; cp prueba/dir2/enlace prueba/dir3' }
    ]},

  { id:"rafa-36", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 36", resumen:"Copiar mediante un enlace simbólico",
    enunciado:'<p>Utiliza el enlace simbólico creado para copiar en <code>dir311</code> el fichero <code>fich1</code> de <code>dir2</code>.</p>',
    final:'El enlace se puede usar como cualquier otra ruta.',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'contenido de fich1\n', '~/prueba/dir3':'dir', '~/prueba/dir3/enlafich1':{ tipo:'link', destino:'~/prueba/dir2/enlace' }, '~/prueba/dir3/dir311':'dir' } },
    pasos:[
      { tarea:'Copia <code>prueba/dir2/enlace</code> en <code>prueba/dir3/dir311</code> usando el enlace <code>prueba/dir3/enlafich1</code>.',
        meta:{ existe:['prueba/dir3/dir311/enlafich1'] },
        pista:['Un enlace simbólico se utiliza escribiendo su ruta.','El destino es el directorio dir311.','cp prueba/dir3/enlafich1 prueba/dir3/dir311'],
        explica:'<code>cp</code> sigue el enlace simbólico y copia el contenido del fichero apuntado.',
        ejemplo:'cp prueba/dir3/enlafich1 prueba/dir3/dir311' }
    ]},

  { id:"rafa-37", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Ejercicio 37", resumen:"Enlaces duros y wc",
    enunciado:'<p>Conserva dos enlaces duros al mismo fichero y cuenta sus líneas mediante <code>wc</code>.</p>',
    final:'Los enlaces duros comparten el mismo contenido.',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir1/enlace':'línea uno\nlínea dos\n', '~/prueba/dir2/enlace':'línea uno\nlínea dos\n' } },
    pasos:[
      { tarea:'Muestra cuántas líneas tiene <code>prueba/dir2/enlace</code>.',
        meta:{ muestra:'2' },
        pista:['wc cuenta líneas, palabras y caracteres.','La opción -l pide solo líneas.','wc -l prueba/dir2/enlace'],
        explica:'<code>wc -l</code> cuenta los saltos de línea del fichero.',
        ejemplo:'wc -l prueba/dir2/enlace' }
    ]},

  { id:"rafa-38", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 38", resumen:"Leer un fichero a través del enlace",
    enunciado:'<p>Usa el enlace simbólico para mostrar por pantalla el contenido del fichero.</p>',
    final:'Una ruta simbólica también sirve para leer el fichero.',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'línea uno\nlínea dos\n', '~/prueba/dir1/enlafich1':{ tipo:'link', destino:'~/prueba/dir2/enlace' } } },
    pasos:[
      { tarea:'Muestra el contenido de <code>prueba/dir2/enlace</code> mediante <code>prueba/dir1/enlafich1</code>.',
        meta:{ salida:'línea uno\nlínea dos' },
        pista:['cat muestra el contenido de un fichero.','Escribe la ruta del enlace, no la del destino.','cat prueba/dir1/enlafich1'],
        explica:'<code>cat</code> sigue el enlace y muestra el contenido del fichero original.',
        ejemplo:'cat prueba/dir1/enlafich1' }
    ]},

  { id:"rafa-39", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 39", resumen:"Borrar el enlace original",
    enunciado:'<p>Borra el nombre original <code>fich1</code>; el enlace duro debe seguir disponible.</p>',
    final:'Borrar un nombre no elimina el contenido mientras quede otro enlace duro.',
    inicio:{ cwd:'~', fs:{ '~/prueba/dir1':'dir', '~/prueba/dir1/fich1':'contenido de fich1\n', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'contenido de fich1\n' } },
    pasos:[
      { tarea:'Borra <code>prueba/dir1/fich1</code> y conserva <code>prueba/dir2/enlace</code>.',
        meta:{ noExiste:'prueba/dir1/fich1', existe:['prueba/dir2/enlace'], contenido:{ 'prueba/dir2/enlace':'contenido de fich1\n' } },
        pista:['rm elimina una entrada de directorio.','El enlace duro de dir2 no debe borrarse.','rm prueba/dir1/fich1'],
        explica:'Los enlaces duros son nombres distintos para el mismo contenido.',
        ejemplo:'rm prueba/dir1/fich1' }
    ]},

  { id:"rafa-40", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Ejercicio 40", resumen:"Limpieza final",
    enunciado:'<p>Borra todos los ficheros y directorios creados durante los ejercicios dentro de <code>prueba</code>.</p>',
    final:'Actividad terminada: el entorno ha quedado limpio.',
    inicio:{ cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir1':'dir', '~/prueba/dir1/enlace':'x', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'x', '~/prueba/dir3':'dir', '~/prueba/dir3/enlafich1':{ tipo:'link', destino:'~/prueba/dir2/enlace' }, '~/prueba/dir3/dir311':'dir', '~/prueba/dir3/dir311/fich1':'x' } },
    pasos:[
      { tarea:'Elimina el directorio <code>prueba</code> completo y todo su contenido.',
        meta:{ noExiste:'prueba' },
        pista:['rm puede borrar directorios de forma recursiva.','La opción -r incluye todo su contenido.','rm -r prueba'],
        explica:'<code>rm -r</code> elimina el árbol indicado; úsalo con cuidado en un sistema real.',
        ejemplo:'rm -r prueba' }
    ]}

);

// ---------- Ejercicios restantes del ODT de Rafa (41–91) ----------
const pasoRafa = (tarea, meta, ejemplo, explica) => ({
  tarea, meta, ejemplo, explica,
  pista:['Piensa en el comando que corresponde al objetivo.','Puedes consultar la chuleta de comandos de la terminal.','Prueba: ' + ejemplo]
});
const actividadRafa = (n, resumen, inicio, paso, nivel = 2) => ({
  id:'rafa-' + String(n).padStart(2, '0'), grupo:'Ejercicios de Rafa', nivel,
  titulo:'Ejercicio ' + n, resumen, enunciado:'<p>Resuelve el ejercicio ' + n + ' del documento de prácticas de Rafa.</p>',
  final:'Ejercicio completado.', inicio, pasos:[paso]
});

ACTIVIDADES.push(
  actividadRafa(41, 'Leer mediante un enlace', { cwd:'~/prueba', fs:{ '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'línea uno\nlínea dos\n', '~/prueba/dir1/enlafich1':{ tipo:'link', destino:'~/prueba/dir2/enlace' } } }, pasoRafa('Muestra las líneas de <code>fich1</code> usando el enlace.', { muestra:'línea uno' }, 'cat dir1/enlafich1', '<code>cat</code> sigue el enlace y muestra el contenido.'), 2),
  actividadRafa(42, 'Borrar fich1', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/fich1':'contenido\n' } }, pasoRafa('Borra <code>prueba/dir2/fich1</code>.', { noExiste:'~/prueba/dir2/fich1' }, 'rm prueba/dir2/fich1', 'Con <code>rm</code> se elimina el nombre del fichero.'), 1),
  actividadRafa(43, 'Limpiar los ejercicios', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir1':'dir', '~/prueba/dir1/fich1':'x', '~/prueba/dir2':'dir', '~/prueba/dir3':'dir' } }, pasoRafa('Borra todo el árbol <code>prueba</code>.', { noExiste:'~/prueba' }, 'rm -r prueba', '<code>rm -r</code> elimina el directorio y su contenido.'), 2),
  actividadRafa(44, 'Permisos iniciales', { cwd:'~', fs:{ '~/prueba':'dir' } }, pasoRafa('Crea <code>dir2</code> y <code>dir3</code> dentro de prueba.', { existe:['~/prueba/dir2','~/prueba/dir3'], modo:{ '~/prueba/dir2':'755' } }, 'mkdir prueba/dir2 prueba/dir3', 'Los directorios nuevos parten de los permisos normales.'), 1),
  actividadRafa(45, 'Quitar escritura', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'755' } } }, pasoRafa('Quita la escritura para todos en <code>dir2</code>.', { modo:{ '~/prueba/dir2':'555' } }, 'chmod a-w prueba/dir2', 'La notación simbólica modifica solo los permisos indicados.'), 2),
  actividadRafa(46, 'Permisos octales', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'555' } } }, pasoRafa('Quita la lectura para otros usuarios usando octal.', { modo:{ '~/prueba/dir2':'551' } }, 'chmod 551 prueba/dir2', 'El último dígito representa los permisos de otros usuarios.'), 2),
  actividadRafa(47, 'Comprobar permisos', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'551' } } }, pasoRafa('Deja <code>dir2</code> con permisos 551.', { modo:{ '~/prueba/dir2':'551' } }, 'chmod 551 prueba/dir2', 'Los permisos se pueden comprobar con <code>ls -l</code>.'), 1),
  actividadRafa(48, 'Crear dentro de dir2', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'555' } } }, pasoRafa('Crea <code>dir2l</code> debajo de dir2.', { existe:'~/prueba/dir2/dir2l' }, 'mkdir prueba/dir2/dir2l', 'Para crear dentro de un directorio hace falta permiso de escritura.'), 2),
  actividadRafa(49, 'Dar escritura y crear', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'555' } } }, pasoRafa('Devuelve la escritura al propietario y crea <code>dir2l</code>.', { existe:'~/prueba/dir2/dir2l', modo:{ '~/prueba/dir2':'755' } }, 'chmod u+w prueba/dir2; mkdir prueba/dir2/dir2l', 'El operador <code>u+w</code> añade escritura al propietario.'), 2),
  actividadRafa(50, 'Máscara actual', { cwd:'~' }, pasoRafa('Muestra la máscara de permisos actual.', { muestra:'022' }, 'umask', '<code>umask</code> muestra los permisos que se restan por defecto.'), 1),
  actividadRafa(51, 'Cambiar a dir3', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir3':'dir' } }, pasoRafa('Entra en dir3 y muestra su trayectoria completa.', { cwd:'~/prueba/dir3', muestra:'/home/usuario/prueba/dir3' }, 'cd prueba/dir3; pwd', '<code>pwd</code> imprime la ruta absoluta.'), 1),
  actividadRafa(52, 'Permisos de dir3', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir3':{ tipo:'dir', modo:'755' } } }, pasoRafa('Conserva dir3 con permisos 755.', { modo:{ '~/prueba/dir3':'755' } }, 'chmod 755 prueba/dir3', 'Los permisos del directorio controlan listar, crear y entrar.'), 1),
  actividadRafa(53, 'Establecer umask', { cwd:'~' }, pasoRafa('Establece la máscara habitual 022.', { umask:'022' }, 'umask 022', 'Con 022 los archivos nuevos quedan normalmente en 644 y los directorios en 755.'), 2),
  actividadRafa(54, 'Crear cuatro directorios', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir3':'dir' } }, pasoRafa('Crea dira, dirb, dirc y dird dentro de dir3.', { existe:['~/prueba/dir3/dira','~/prueba/dir3/dirb','~/prueba/dir3/dirc','~/prueba/dir3/dird'] }, 'mkdir prueba/dir3/dira prueba/dir3/dirb prueba/dir3/dirc prueba/dir3/dird', 'Un comando puede recibir varias rutas.'), 1),
  actividadRafa(55, 'Comprobar permisos nuevos', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir3':'dir' } }, pasoRafa('Crea los cuatro directorios con la máscara 022.', { existe:['~/prueba/dir3/dira','~/prueba/dir3/dirb','~/prueba/dir3/dirc','~/prueba/dir3/dird'], modo:{ '~/prueba/dir3/dira':'755' } }, 'umask 022; mkdir prueba/dir3/dira prueba/dir3/dirb prueba/dir3/dirc prueba/dir3/dird', 'La máscara se aplica al crear cada directorio.'), 2),
  actividadRafa(56, 'Crear y proteger un fichero', { cwd:'~', fs:{ '~/prueba':'dir' } }, pasoRafa('Crea <code>uno</code> y quítale todos los permisos de lectura.', { existe:'~/prueba/uno', modo:{ '~/prueba/uno':'200' } }, 'touch prueba/uno; chmod a-r prueba/uno', 'Quitar lectura no elimina el fichero; solo cambia su modo.'), 2),
  actividadRafa(57, 'Permisos de paso', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'755' } } }, pasoRafa('Quita el permiso de paso a dir2 y deja los demás permisos.', { modo:{ '~/prueba/dir2':'644' } }, 'chmod a-x prueba/dir2', 'El permiso <code>x</code> de un directorio permite atravesarlo.'), 2),
  actividadRafa(58, 'Crear carpeta1 y carpeta2', { cwd:'~' }, pasoRafa('Crea carpeta1 y carpeta2 en tu directorio personal.', { existe:['~/carpeta1','~/carpeta2'] }, 'mkdir carpeta1 carpeta2', 'Se pueden crear varias carpetas con un solo <code>mkdir</code>.'), 1),
  actividadRafa(59, 'Crear ficheros con permisos', { cwd:'~', fs:{ '~/carpeta1':'dir', '~/carpeta2':'dir' } }, pasoRafa('Crea fich1, fich2, file1 y file2 dentro de sus carpetas.', { existe:['~/carpeta1/fich1','~/carpeta1/fich2','~/carpeta2/file1','~/carpeta2/file2'] }, 'touch carpeta1/fich1 carpeta1/fich2 carpeta2/file1 carpeta2/file2', 'Después de crear los ficheros se pueden ajustar con <code>chmod</code>.'), 1),
  actividadRafa(60, 'Comprobar la estructura', { cwd:'~', fs:{ '~/carpeta1':'dir', '~/carpeta1/fich1':'x', '~/carpeta1/fich2':'x', '~/carpeta2':'dir', '~/carpeta2/file1':'x', '~/carpeta2/file2':'x' } }, pasoRafa('Muestra la estructura creada.', { muestra:['carpeta1','fich1'] }, 'tree carpeta1', 'El árbol permite revisar rápidamente los ficheros creados.'), 1),
  actividadRafa(61, 'Crear correo y fuentes', { cwd:'~' }, pasoRafa('Muestra tu ruta y crea correo y fuentes.', { existe:['~/correo','~/fuentes'], muestra:'/home/usuario' }, 'pwd; mkdir correo fuentes', 'Se puede consultar la ruta sin cambiar de carpeta.'), 1),
  actividadRafa(62, 'Crear directorios en fuentes', { cwd:'~', fs:{ '~/fuentes':'dir' } }, pasoRafa('Entra en fuentes y crea dir1, dir2 y dir3.', { existe:['~/fuentes/dir1','~/fuentes/dir2','~/fuentes/dir3'], cwd:'~/fuentes' }, 'cd fuentes; mkdir dir1 dir2 dir3', 'Las rutas relativas se resuelven desde la carpeta actual.'), 1),
  actividadRafa(63, 'Crear menus sin moverse', { cwd:'~/fuentes', fs:{ '~/correo':'dir', '~/fuentes':'dir' } }, pasoRafa('Crea menus debajo de correo sin cambiar de carpeta.', { existe:'~/correo/menus', cwd:'~/fuentes' }, 'mkdir ../correo/menus', 'Una ruta relativa puede apuntar a otra carpeta sin usar <code>cd</code>.'), 2),
  actividadRafa(64, 'Borrar directorios seleccionados', { cwd:'~', fs:{ '~/fuentes':'dir', '~/fuentes/dir1':'dir', '~/fuentes/dir2':'dir', '~/fuentes/dir3':'dir' } }, pasoRafa('Borra de fuentes los directorios que no terminan en 1.', { noExiste:['~/fuentes/dir2','~/fuentes/dir3'], existe:'~/fuentes/dir1' }, 'rm -r fuentes/dir2 fuentes/dir3', 'Los comodines y las rutas explícitas permiten seleccionar varias entradas.'), 2),
  actividadRafa(65, 'Consultar tty2', { cwd:'~' }, pasoRafa('Comprueba si existe tty2 y consulta su tipo.', { muestra:'tty2' }, 'file /dev/tty2', '<code>file</code> informa del tipo de una entrada.'), 2),
  actividadRafa(66, 'Permisos de tty', { cwd:'~' }, pasoRafa('Lista con permisos los archivos que empiezan por tt en /dev.', { muestra:'tty' }, 'ls -l /dev/tt*', '<code>ls -l</code> muestra los permisos junto al nombre.'), 2),
  actividadRafa(67, 'Ficheros ordinarios de usr/bin', { cwd:'~' }, pasoRafa('Busca los ficheros ordinarios de /usr/bin.', { muestra:'/usr/bin/' }, 'find /usr/bin -type f', '<code>find -type f</code> selecciona solo ficheros ordinarios.'), 2),
  actividadRafa(68, 'Directorios desde la raíz', { cwd:'~' }, pasoRafa('Lista los directorios que cuelgan del sistema.', { muestra:'/' }, 'find / -type d', '<code>find</code> puede recorrer todo el árbol virtual.'), 2),
  actividadRafa(69, 'Ficheros del sistema', { cwd:'~' }, pasoRafa('Busca ficheros ordinarios del sistema.', { muestra:'/etc/' }, 'find /etc -type f', '<code>find</code> permite acotar la búsqueda a una ruta.'), 2),
  actividadRafa(70, 'Ficheros .h', { cwd:'~', fs:{ '/usr/include':'dir', '/usr/include/stdio.h':'x', '/usr/include/stdlib.h':'x' } }, pasoRafa('Busca los ficheros que terminan en .h.', { muestra:'stdio.h' }, 'find /usr/include -name "*.h"', 'El patrón de <code>-name</code> filtra por el nombre.'), 2),
  actividadRafa(71, 'Comandos ls', { cwd:'~' }, pasoRafa('Lista los comandos de /bin que empiezan por ls.', { muestra:'ls' }, 'ls /bin/ls*', 'Los comodines seleccionan nombres que empiezan por una cadena.'), 1),
  actividadRafa(72, 'Tipos de ficheros', { cwd:'~' }, pasoRafa('Consulta el tipo de los ficheros ejecutables de /bin.', { muestra:'archivo vacío' }, 'file /bin/*', '<code>file</code> describe cada entrada recibida.'), 3),
  actividadRafa(73, 'Directorio con permisos concretos', { cwd:'~', fs:{ '~/prueba':'dir' } }, pasoRafa('Crea uno con modo 350.', { existe:'~/prueba/uno', modo:{ '~/prueba/uno':'350' } }, 'mkdir prueba/uno; chmod 350 prueba/uno', 'El modo octal permite expresar exactamente cada grupo de permisos.'), 3),
  actividadRafa(74, 'Crear uno1', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/uno':{ tipo:'dir', modo:'350' } } }, pasoRafa('Crea uno1 dentro de uno con modo 702.', { existe:'~/prueba/uno/uno1', modo:{ '~/prueba/uno/uno1':'702' } }, 'mkdir prueba/uno/uno1; chmod 702 prueba/uno/uno1', 'El segundo dígito corresponde al grupo.'), 3),
  actividadRafa(75, 'Copiar ficheros seleccionados', { cwd:'~', fs:{ '~/menus':'dir' } }, pasoRafa('Copia ficheros de /bin en menus.', { existe:'~/menus/bash' }, 'cp /bin/bash menus', 'La expansión de comodines permite copiar varios ficheros.'), 3),
  actividadRafa(76, 'Usuarios conectados', { cwd:'~' }, pasoRafa('Muestra los usuarios conectados y sus terminales.', { muestra:'tty1' }, 'who', '<code>who</code> muestra usuario y terminal.'), 1),
  actividadRafa(77, 'Fichero vacío', { cwd:'~' }, pasoRafa('Crea un fichero de tamaño cero.', { existe:'~/vacio', contenido:{ '~/vacio':'' } }, 'touch vacio', '<code>touch</code> crea un fichero vacío.'), 1),
  actividadRafa(78, 'Guardar usuarios ordenados', { cwd:'~' }, pasoRafa('Guarda la información de usuarios ordenada por hora en persona.', { existe:'~/persona' }, 'who | sort > persona', 'Una tubería pasa la salida de <code>who</code> a <code>sort</code> y la redirección la guarda.'), 2),
  actividadRafa(79, 'Guardar directorios', { cwd:'~', fs:{ '~/prueba':'dir' } }, pasoRafa('Crea carpeta sin lectura y guarda los directorios encontrados en direc.', { existe:['~/prueba/carpeta','~/direc'], modo:{ '~/prueba/carpeta':'333' } }, 'mkdir prueba/carpeta; chmod 333 prueba/carpeta; find ~ -type d > direc', 'La salida de <code>find</code> se puede guardar con <code>></code>.'), 3),
  actividadRafa(80, 'Guardar errores', { cwd:'~' }, pasoRafa('Redirige el error de una búsqueda inexistente a malos y muéstralo.', { existe:'~/malos', muestra:'No such file' }, 'find /noexiste -type d 2> malos; cat malos', '<code>2></code> redirige la salida de error.'), 3),
  actividadRafa(81, 'Añadir ficheros a direc', { cwd:'~', fs:{ '~/direc':'inicio\n' } }, pasoRafa('Añade los ficheros ordinarios de /etc a direc.', { contenido:{ '~/direc':'inicio\n/etc/hostname\n/etc/hosts\n/etc/motd\n/etc/passwd\n/etc/rc2.d/README\n/etc/rc2.d/S01cron\n/etc/rc2.d/S20ssh\n/etc/timezone\n' } }, 'find /etc -type f >> direc', '<code>find /etc -type f</code> localiza todos los ficheros ordinarios de <code>/etc</code> y <code>&gt;&gt;</code> los añade a <code>direc</code> sin borrar lo anterior.'), 2),
  actividadRafa(82, 'Buscar nombres con ai', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/archivo.txt':'x', '~/nuevalista':'' } }, pasoRafa('Busca en prueba los nombres que contienen ai y guárdalos.', { existe:'~/nuevalista' }, 'find prueba -name "*ai*" > nuevalista', '<code>-name</code> puede buscar una cadena dentro del nombre.'), 2),
  actividadRafa(83, 'Medir who', { cwd:'~' }, pasoRafa('Mide el tiempo que tarda el comando who.', { muestra:'real 0m0.001s' }, 'time who', '<code>time</code> muestra el tiempo de ejecución.'), 2),
  actividadRafa(84, 'Ordenar procesos', { cwd:'~' }, pasoRafa('Muestra los procesos ordenados.', { muestra:'PID' }, 'ps | sort', '<code>ps</code> muestra procesos y <code>sort</code> los ordena.'), 2),
  actividadRafa(85, 'Contar usuarios', { cwd:'~', fs:{ '/tmp/passwd':'usuario:x:1:/bin/bash\notro:x:2:/bin/sh\n' } }, pasoRafa('Cuenta los usuarios registrados.', { muestra:'2' }, 'cut -d : -f 1 /tmp/passwd | wc -l', '<code>cut</code> extrae el campo y <code>wc -l</code> cuenta líneas.'), 2),
  actividadRafa(86, 'Contar usuarios bash', { cwd:'~', fs:{ '/tmp/passwd':'usuario:x:1:/bin/bash\notro:x:2:/bin/sh\n' } }, pasoRafa('Cuenta los usuarios que usan bash.', { muestra:'1' }, 'grep "/bin/bash" /tmp/passwd | wc -l', '<code>grep</code> filtra y <code>wc</code> cuenta.'), 2),
  actividadRafa(87, 'Contar conectados', { cwd:'~' }, pasoRafa('Cuenta los usuarios conectados.', { muestra:'1' }, 'users | wc -w', '<code>users</code> muestra los nombres y <code>wc -w</code> los cuenta.'), 1),
  actividadRafa(88, 'Filtrar líneas por L', { cwd:'~', fs:{ '~/texto':'Luna\nmar\nLago\nsol\n' } }, pasoRafa('Muestra las líneas que empiezan por L, sin distinguir mayúsculas.', { muestra:'Luna', noMuestra:'mar' }, 'grep -i "^l" texto', 'La opción <code>-i</code> ignora mayúsculas y minúsculas.'), 2),
  actividadRafa(89, 'Contar líneas filtradas', { cwd:'~', fs:{ '~/texto':'Luna\nmar\nLago\nsol\n' } }, pasoRafa('Cuenta las líneas que empiezan por L.', { muestra:'2' }, 'grep -i "^l" texto | wc -l', 'La salida de <code>grep</code> se convierte en entrada de <code>wc</code>.'), 2),
  actividadRafa(90, 'Extraer usuarios', { cwd:'~', fs:{ '/tmp/passwd':'usuario:x:1:/bin/bash\notro:x:2:/bin/sh\n' } }, pasoRafa('Extrae el primer campo de los usuarios.', { muestra:['usuario','otro'] }, 'cut -d : -f 1 /tmp/passwd', '<code>cut -d :</code> separa campos usando dos puntos.'), 2),
  actividadRafa(91, 'Extraer usuario y shell', { cwd:'~', fs:{ '/tmp/passwd':'usuario:x:1:/bin/bash\notro:x:2:/bin/sh\n' } }, pasoRafa('Extrae el usuario y el shell.', { muestra:['/bin/bash','/bin/sh'] }, 'cut -d : -f 1,4 /tmp/passwd', 'Se pueden seleccionar varios campos con <code>-f</code>.'), 2)
);

// El ODT contiene 87 ejercicios numerados. Desde el 36, el texto visible debe
// coincidir con el documento; las actividades generales no forman parte de esta serie.
const tareasRafa = {
  36:'Crear un enlace simbólico (llamado enlafich1) al fichero enlace de dir2 endir1.',
  37:'Posicionarse en dir1 y, mediante el enlace creado, copiar el archivo fichl dentro de dir311.',
  38:'Seguir en dir1 y, mediante el enlace creado, sacar por pantalla las líneas que tiene el archivo fich1.',
  39:'Borrar el fichero fich1 de dir2',
  40:'Borrar todos los archivos y directorios creados durante los ejercicios.',
  41:'Crear el directorio dir2 y dir3 en el directorio prueba ¿Cuáles son los actuales permisos del directorio dir2?',
  42:'Utilizando la notación simbólica, eliminar todos los permisos de escritura (propietario, grupo, otros) del directorio dir2. .',
  43:'Utilizando la notación octal, eliminar el permiso de lectura del directorio dir2, al resto de los usuarios.',
  44:'¿Cuáles son ahora los permisos asociados a dir2?',
  45:'Crear bajo dir2, un directorio llamado dir2l.',
  46:'Concederse a sí mismo permiso de escritura en el directorio dir2 e intentar de nuevo el paso anterior.',
  47:'¿Cuáles son los valores por omisión asignados a los archivos?',
  48:'Cambiar el directorio actual al directorio dir3. Imprimir su trayectoria completa para verificar el cambio.',
  49:'¿Cuáles son los permisos asignados en su momento a este directorio?',
  50:'Establecer mediante el comando umask los siguientes valores por omisión: rwxr--r-- para los directorios y rw-r--r-- para los archivos ordinarios.',
  51:'Crear cuatro nuevos directorios llamados dira, dirb, dirc, y dird bajo el directorio actual.',
  52:'Comprobar los permisos de acceso de los directorios recién creados para comprobar el funcionamiento del comando umask.',
  53:'Crear el fichero uno . Quitarle todos los permisos de lectura. Comprobarlo. Intentar borrar dicho fichero.',
  54:'Quitarle todos los permisos de paso al directorio dir2 y otorgarle todos los demás.',
  55:'Crear en el directorio propio:El directorio carpeta1 con los tres permisos para el propietario, dentro de él fich1 con lectura y escritura para todos y fich2 con lectura y escritura para el propietario y solo lectura para el resto. El directorio carpeta2 con todos los permisos para el propietario y lectura y ejecución para los del mismo grupo. Dentro file1 con lectura y escritura para el propietario y los del grupo y file2 con los mismos para el propietario y solo lectura para el grupo.',
  56:'Desde otro usuario probar todas las operaciones que se pueden hacer en los ficheros y directorios creados.',
  57:'Desde otro usuario probar todas las operaciones que se pueden hacer en los ficheros y directorios creados.',
  58:'Visualizar la trayectoria completa del directorio actual. Crear dos directorios llamados correo y fuentes debajo del directorio actual.',
  59:'Posicionarse en el directorio fuentes y crear los directorios dir1, dir2, dir3.',
  60:'Crear el directorio menus bajo correo sin moverse del directorio actual.',
  61:'Posicionarse en el directorio prueba. Borrar los directorios que cuelgan de fuentes que acaben en un número que no sea el 1.',
  62:'Ver si existe el archivo tty2 en el directorio dev. En caso de que exista, ver su fecha de creación o actualización.',
  63:'Ver los permisos que tienen los archivos que empiecen por tt del directorio /dev.',
  64:'Visualizar la lista de los archivos ordinarios que están en el directorio /usr/bin.',
  65:'Visualizar la lista de todos los directorios que cuelgan del raíz.',
  66:'Visualizar la lista de todos los ficheros que pertenezcan a root.',
  67:'Visualizar la lista de todos los ficheros .h del directorio /usr/include.',
  68:'Ejecutar todos los comandos que empiecen por ls del directorio /bin.',
  69:'Visualizar de qué tipo son todos y cada uno de ficheros de todo el árbol del sistema propiedad de un usuario conocido.',
  70:'Crear el directorio uno en el directorio prueba con permiso de escritura y paso para el propietario, de lectura y paso para los usuarios de su mismo grupo y ningún permiso para el resto de usuarios.',
  71:'Crear el directorio uno1 dentro del directorio creado en el ejercicio anterior con todos lo permisos para el usuario, ninguno para los usuarios del grupo y permiso de escritura para el resto de usuarios.',
  72:'Copiar todos los ficheros propiedad de un usuario conocido que acaben en un número en el directorio menus.',
  73:'Visualiza con la orden who la relación de usuarios conectados y sus terminales.',
  74:'Crea un archivo de tamaño 0',
  75:'Utilizando de entrada la información de los usuarios conectados al sistema, guardar, ordenadas por el campo hora, las líneas correspondientes al usuario que se desee en el archivo persona.',
  76:'Crear el directorio carpeta debajo del directorio PRUEBA. Quitarle todos los permisos de lectura. A continuación, buscar todos los directorios que cuelguen del directorio propio y guardarlos en el archivo direc.',
  77:'Volver a realizar la segunda parte del ejercicio anterior, pero redireccionando los errores al fichero malos. Comprobar la información del fichero malos.',
  78:'Añadir al fichero direc la lista de todos los ficheros ordinarios que cuelguen de /etc.',
  79:'Añadir al archivo nuevalista el/los nombre/s de el/los fichero/s del directorio PRUEBA que contengan en su nombre la cadena "ai", añadiendo el posible error al fichero malos.',
  80:'Sacar por pantalla únicamente el tiempo (buscar comando time) que tarda en ejecutarse el comando who.',
  81:'Sacar por pantalla el listado de todos los usuarios conectados ordenados por número de proceso asignado.',
  82:'Mostrar cuantos usuarios tiene registrados el sistema',
  83:'Mostrar cuántos usuarios tiene registrados el sistema y que utilizan el intérprete bash',
  84:'Mostrar cuantos usuarios hay conectados',
  85:'Mostrar las líneas, de un archivo de texto, empiecen por L (mayúscula o minúscula)',
  86:'Contar las líneas, del ejemplo anterior',
  87:'Extraer los nombres de usuario (primer campo) del sistema',
  88:'Extraer los nombres de usuario y el shell que utilizan (último campo)'
};

const antiguasRafa = ACTIVIDADES.filter(a => /^rafa-\d+$/.test(a.id) && Number(a.id.slice(5)) >= 44 && Number(a.id.slice(5)) <= 91);
for (let i = ACTIVIDADES.length - 1; i >= 0; i--) if (/^rafa-\d+$/.test(ACTIVIDADES[i].id) && Number(ACTIVIDADES[i].id.slice(5)) >= 36) ACTIVIDADES.splice(i, 1);

const nuevas36a40 = [
  actividadRafa(36, 'Enlace simbólico al fichero', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'fich1\n' } }, pasoRafa(tareasRafa[36], { enlace:[{ path:'~/prueba/dir1/enlafich1', destino:'~/prueba/dir2/enlace' }] }, 'ln -s prueba/dir2/enlace prueba/dir1/enlafich1', 'Un enlace simbólico guarda la ruta del fichero de destino.'), 3),
  actividadRafa(37, 'Copiar mediante el enlace', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'fich1\n', '~/prueba/dir1/enlafich1':{ tipo:'link', destino:'~/prueba/dir2/enlace' }, '~/prueba/dir3':'dir', '~/prueba/dir3/dir31':'dir', '~/prueba/dir3/dir31/dir311':'dir' } }, pasoRafa(tareasRafa[37], { existe:'~/prueba/dir3/dir31/dir311/enlafich1' }, 'cd prueba/dir1; cp enlafich1 ../dir3/dir31/dir311', 'Desde dir1, la ruta relativa lleva al directorio dir311 que cuelga de dir3.'), 3),
  actividadRafa(38, 'Leer mediante el enlace', { cwd:'~/prueba/dir1', fs:{ '~/prueba':'dir', '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/enlace':'línea uno\nlínea dos\n', '~/prueba/dir1/enlafich1':{ tipo:'link', destino:'~/prueba/dir2/enlace' } } }, pasoRafa(tareasRafa[38], { muestra:'línea uno' }, 'cat enlafich1', 'La ruta simbólica permite leer el fichero original.'), 3),
  actividadRafa(39, 'Borrar fich1 de dir2', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':'dir', '~/prueba/dir2/fich1':'fich1\n' } }, pasoRafa(tareasRafa[39], { noExiste:'~/prueba/dir2/fich1' }, 'rm prueba/dir2/fich1', 'Se elimina la entrada indicada con <code>rm</code>.'), 2),
  actividadRafa(40, 'Limpieza final', { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir1':'dir', '~/prueba/dir2':'dir', '~/prueba/dir3':'dir' } }, pasoRafa(tareasRafa[40], { noExiste:'~/prueba' }, 'rm -r prueba', 'La opción recursiva borra todo el árbol.'), 2)
];
nuevas36a40.forEach(a => { const n = Number(a.id.slice(5)); a.enunciado = '<p>' + tareasRafa[n] + '</p>'; });

const antigua55 = antiguasRafa.find(a => Number(a.id.slice(5)) === 58);
const antigua56 = antiguasRafa.find(a => Number(a.id.slice(5)) === 59);
const fusionada55 = antigua55 ? {
  ...antigua55,
  id:'rafa-55', titulo:'Ejercicio 55', enunciado:'<p>' + tareasRafa[55] + '</p>',
  pasos:[{ ...antigua55.pasos[0], tarea:tareasRafa[55] }, { ...antigua56.pasos[0], tarea:tareasRafa[56] }]
} : null;
const rebaseadas = antiguasRafa.filter(a => Number(a.id.slice(5)) !== 58 && Number(a.id.slice(5)) !== 59).map(a => {
  const antiguo = Number(a.id.slice(5));
  const numero = antiguo <= 57 ? antiguo - 3 : antiguo - 4;
  const tarea = numero === 55 ? tareasRafa[55] + ' ' + tareasRafa[56] : tareasRafa[numero + (numero >= 56 ? 1 : 0)];
  a.id = 'rafa-' + String(numero).padStart(2, '0');
  a.titulo = 'Ejercicio ' + numero;
  a.enunciado = '<p>' + tarea + '</p>';
  a.pasos[0].tarea = tarea;
  return a;
});
const actividadesRafa = [
  ...nuevas36a40,
  ...rebaseadas,
  ...(fusionada55 ? [fusionada55] : [])
].sort((a, b) => Number(a.id.slice(5)) - Number(b.id.slice(5)));
ACTIVIDADES.push(...actividadesRafa);

// Ajustes finales: cada ejemplo debe enseñar el comando que resuelve literalmente
// el enunciado del ODT, no solo dejar un estado parecido.
const reemplazarPasoRafa = (numero, inicio, meta, ejemplo, explica, tarea) => {
  const actividad = ACTIVIDADES.find(a => a.id === 'rafa-' + String(numero).padStart(2, '0'));
  if (!actividad) return;
  actividad.inicio = inicio;
  actividad.pasos = [pasoRafa(tarea || actividad.pasos[0].tarea, meta, ejemplo, explica)];
};

reemplazarPasoRafa(41,
  { cwd:'~', fs:{ '~/prueba':'dir' } },
  { existe:['~/prueba/dir2','~/prueba/dir3'], modo:{ '~/prueba/dir2':'755' }, muestra:'dir2' },
  'mkdir prueba/dir2 prueba/dir3; ls -ld prueba/dir2',
  'Se crean los dos directorios y <code>ls -ld</code> permite consultar los permisos de dir2.'
);
reemplazarPasoRafa(44,
  { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir2':{ tipo:'dir', modo:'551' } } },
  { modo:{ '~/prueba/dir2':'551' }, muestra:['dir2','dr-xr-x--x'] },
  'ls -ld prueba/dir2',
  '<code>ls -ld</code> muestra los permisos del directorio sin listar su contenido.'
);
reemplazarPasoRafa(49,
  { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/dir3':{ tipo:'dir', modo:'755' } } },
  { modo:{ '~/prueba/dir3':'755' }, muestra:['dir3','drwxr-xr-x'] },
  'ls -ld prueba/dir3',
  '<code>ls -ld</code> consulta los permisos actuales de dir3.'
);
reemplazarPasoRafa(51,
  { cwd:'~/prueba/dir3', fs:{ '~/prueba/dir3':'dir' } },
  { existe:['dira','dirb','dirc','dird'], cwd:'~/prueba/dir3' },
  'mkdir dira dirb dirc dird',
  'Al estar dentro de dir3, las rutas relativas crean las cuatro carpetas allí.'
);
reemplazarPasoRafa(52,
  { cwd:'~/prueba/dir3', fs:{ '~/prueba/dir3':'dir', '~/prueba/dir3/dira':'dir', '~/prueba/dir3/dirb':'dir', '~/prueba/dir3/dirc':'dir', '~/prueba/dir3/dird':'dir' } },
  { modo:{ dira:'755', dirb:'755', dirc:'755', dird:'755' }, muestra:'dira' },
  'ls -ld dira dirb dirc dird',
  '<code>ls -ld</code> permite comprobar que la máscara 022 dejó los directorios con modo 755.'
);

const actividad53 = ACTIVIDADES.find(a => a.id === 'rafa-53');
if (actividad53){
  actividad53.inicio = { cwd:'~', fs:{ '~/prueba':'dir' } };
  actividad53.pasos = [
    pasoRafa(actividad53.pasos[0].tarea, { existe:'~/prueba/uno', modo:{ '~/prueba/uno':'200' }, muestra:'uno' }, 'touch prueba/uno; chmod a-r prueba/uno; ls -l prueba/uno', 'Se crea el fichero, se quita la lectura y se comprueba el modo con <code>ls -l</code>.'),
    pasoRafa('Intenta borrar el fichero <code>uno</code>.', { noExiste:'~/prueba/uno' }, 'rm prueba/uno', '<code>rm</code> elimina el fichero indicado.')
  ];
}

const actividad55 = ACTIVIDADES.find(a => a.id === 'rafa-55');
if (actividad55){
  actividad55.inicio = { cwd:'~' };
  actividad55.pasos = [
    pasoRafa(actividad55.pasos[0].tarea, { existe:['~/carpeta1','~/carpeta2'], modo:{ '~/carpeta1':'700', '~/carpeta2':'750' } }, 'mkdir -m 700 carpeta1; mkdir -m 750 carpeta2', 'La opción <code>-m</code> crea cada directorio con los permisos indicados.'),
    pasoRafa('Crea los cuatro ficheros y asigna sus permisos.', { existe:['~/carpeta1/fich1','~/carpeta1/fich2','~/carpeta2/file1','~/carpeta2/file2'], modo:{ '~/carpeta1/fich1':'666', '~/carpeta1/fich2':'644', '~/carpeta2/file1':'664', '~/carpeta2/file2':'640' } }, 'touch carpeta1/fich1 carpeta1/fich2 carpeta2/file1 carpeta2/file2; chmod 666 carpeta1/fich1; chmod 644 carpeta1/fich2; chmod 664 carpeta2/file1; chmod 640 carpeta2/file2', '<code>chmod</code> aplica los permisos que pide el documento a cada fichero.')
  ];
}
reemplazarPasoRafa(56,
  { cwd:'~', fs:{ '~/carpeta1':{ tipo:'dir', modo:'700' }, '~/carpeta1/fich1':{ contenido:'fich1\n', modo:'666' }, '~/carpeta1/fich2':{ contenido:'fich2\n', modo:'644' }, '~/carpeta2':{ tipo:'dir', modo:'750' }, '~/carpeta2/file1':{ contenido:'file1\n', modo:'664' }, '~/carpeta2/file2':{ contenido:'file2\n', modo:'640' } } },
  { modo:{ '~/carpeta1':'700', '~/carpeta2':'750', '~/carpeta1/fich1':'666', '~/carpeta1/fich2':'644', '~/carpeta2/file1':'664', '~/carpeta2/file2':'640' }, muestra:['carpeta1','fich1','file1'] },
  'ls -ld carpeta1 carpeta2; ls -l carpeta1 carpeta2',
  'La consulta de permisos permite comprobar qué operaciones puede hacer otro usuario en cada entrada.'
);
reemplazarPasoRafa(60,
  { cwd:'~', fs:{ '~/prueba':'dir', '~/fuentes':'dir', '~/fuentes/dir1':'dir', '~/fuentes/dir2':'dir', '~/fuentes/dir3':'dir' } },
  { cwd:'~/prueba', noExiste:['~/fuentes/dir2','~/fuentes/dir3'], existe:'~/fuentes/dir1' },
  'cd prueba; rm -r ../fuentes/dir2 ../fuentes/dir3',
  'Primero se entra en prueba y después se eliminan las carpetas de fuentes cuyo número no es 1.'
);
reemplazarPasoRafa(61,
  { cwd:'~' },
  { muestra:'tty2' },
  'ls -l /dev/tty2',
  '<code>ls -l</code> confirma que tty2 existe y muestra su fecha de actualización.'
);
reemplazarPasoRafa(65,
  { cwd:'~' },
  { muestra:'/etc/hosts' },
  'find / -type f -user root',
  '<code>-user root</code> filtra los ficheros cuyo propietario es root.'
);
reemplazarPasoRafa(68,
  { cwd:'~' },
  { muestra:['/home/usuario/.bashrc','texto ASCII'] },
  'find / -type f -user usuario -exec file {} +',
  '<code>find</code> selecciona los ficheros del usuario y ejecuta <code>file</code> para mostrar su tipo.'
);
reemplazarPasoRafa(71,
  { cwd:'~', fs:{ '~/menus':'dir', '/home/rafa/Descargas/informe1':'uno\n', '/home/rafa/Descargas/informe2':'dos\n' } },
  { existe:['~/menus/informe1','~/menus/informe2'] },
  'cp /home/rafa/Descargas/informe[12] menus',
  'El comodín selecciona todos los ficheros del usuario conocido cuyo nombre acaba en número.'
);
reemplazarPasoRafa(78,
  { cwd:'~', fs:{ '~/prueba':'dir', '~/prueba/archivo.txt':'x' } },
  { existe:['~/nuevalista','~/malos'], muestra:'No such file' },
  'find prueba -name "*ai*" > nuevalista; find /noexiste -name "*ai*" 2> malos; cat malos',
  'La salida correcta va a <code>nuevalista</code> y el error de una búsqueda fallida se redirige a <code>malos</code>.'
);
reemplazarPasoRafa(80,
  { cwd:'~' },
  { muestra:'PID' },
  'ps | sort -n',
  '<code>sort -n</code> ordena numéricamente las líneas de <code>ps</code> por su PID.'
);
reemplazarPasoRafa(81,
  { cwd:'~' },
  { muestra:'2' },
  'cut -d : -f 1 /etc/passwd | wc -l',
  '<code>cut</code> extrae el primer campo de <code>/etc/passwd</code> y <code>wc -l</code> cuenta sus líneas.'
);
reemplazarPasoRafa(82,
  { cwd:'~' },
  { muestra:'2' },
  'grep "/bin/bash" /etc/passwd | wc -l',
  '<code>grep</code> filtra los usuarios que usan bash y <code>wc -l</code> los cuenta.'
);
reemplazarPasoRafa(86,
  { cwd:'~' },
  { muestra:['root','usuario'] },
  'cut -d : -f 1 /etc/passwd',
  '<code>cut -d :</code> extrae el primer campo de cada entrada del sistema.'
);
reemplazarPasoRafa(87,
  { cwd:'~' },
  { muestra:['root:/bin/bash','usuario:/bin/bash'] },
  'cut -d : -f 1,7 /etc/passwd',
  'El primer campo es el usuario y el séptimo, el intérprete que utiliza.'
);

const aprendizajesTerminal = {
  'find /usr/bin -type f': { comando:'find', opciones:['-type'], valores:['f'], pistas:['Piensa en cómo limitar la búsqueda a una ruta.', 'Revisa el filtro que distingue ficheros y directorios.', 'Usa la forma general: find [ruta] [filtro].'] },
  'find / -type d': { comando:'find', opciones:['-type'], valores:['d'], pistas:['Piensa en cómo distinguir directorios de ficheros.', 'Revisa la opción que filtra por tipo.', 'Usa la forma general: find [ruta] [filtro].'] },
  'find /etc -type f': { comando:'find', opciones:['-type'], valores:['f'], pistas:['La búsqueda debe recorrer solo la ruta indicada.', 'Revisa el filtro para seleccionar ficheros ordinarios.', 'Usa la forma general: find [ruta] [filtro].'] },
  'find / -type f -user root': { comando:'find', opciones:['-type','-user'], valores:['f','root'], pistas:['Necesitas combinar un filtro de tipo con uno de propietario.', 'Revisa las opciones que limitan por tipo y usuario.', 'Usa la forma general: find [ruta] [filtros].'] },
  'find / -type f -user usuario -exec file {} +': { comando:'find', opciones:['-type','-user','-exec'], valores:['f','usuario','file'], pistas:['Primero selecciona los ficheros del usuario indicado.', 'Después necesitas ejecutar otro comando sobre cada resultado.', 'Usa la forma general: find [ruta] [filtros] -exec [comando] {} +.'] }
};
ACTIVIDADES.forEach(a => a.pasos.forEach(p => {
  if (aprendizajesTerminal[p.ejemplo]) p.aprendizaje = aprendizajesTerminal[p.ejemplo];
}));
