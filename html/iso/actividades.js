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
    enunciado:'<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por tty y tengan 5 caracteres.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>?</code> sustituye exactamente a un carácter y <code>[1-4]</code> a un dígito del 1 al 4.'],
    pasos:[
      { tarea:'Lista los archivos de <code>/dev</code> que empiezan por tty y tienen 5 caracteres.',
        meta:{ muestra:'ttyS0', noMuestra:['tty0','tty4'] },
        pista:['Para exigir exactamente un carácter se usa el comodín ?.','Necesitas dos comodines después de tty: cada uno vale por un carácter.','ls /dev/tty??'],
        explica:'Cada <code>?</code> equivale a un carácter, así que <code>tty??</code> encaja con <code>ttyS0</code>, que tiene 5 letras, pero no con <code>tty0</code> ni con <code>tty</code>.',
        ejemplo:'ls /dev/tty??' },
      { tarea:'Lista los que empiezan por tty y acaban en un dígito del 1 al 4.',
        meta:{ muestra:['tty1','tty2','tty3','tty4'], noMuestra:['tty0','ttyS0'] },
        pista:['Para aceptar un rango de caracteres se usan corchetes.','El rango del 1 al 4 se escribe [1-4].','ls /dev/tty[1-4]'],
        explica:'<code>[1-4]</code> acepta un único carácter entre 1 y 4, así que deja fuera <code>tty0</code> y <code>ttyS0</code>.',
        ejemplo:'ls /dev/tty[1-4]' }
    ]},

  { id:"permisos-crear", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Permisos · Crear y comprobar", resumen:"mkdir y ls -ld (Rafa 42)",
    enunciado:'<p>Crea los directorios <code>dir2</code> y <code>dir3</code> dentro de <code>prueba</code> y averigua con qué permisos nace <code>dir2</code>.</p>',
    final:'¡Bien hecho!',
    solucion:['Al crear una carpeta con <code>mkdir</code> hereda los permisos que deja la <code>umask</code>: con la máscara por defecto, <code>drwxr-xr-x</code> (755).'],
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba':'dir' } },
    pasos:[
      { tarea:'Crea <code>dir2</code> y <code>dir3</code> dentro de <code>prueba</code>.',
        meta:{ existe:['dir2','dir3'] },
        pista:['Estás dentro de prueba; no hace falta escribir la ruta completa.','mkdir acepta varios nombres a la vez.','mkdir dir2 dir3'],
        explica:'<code>mkdir dir2 dir3</code> crea las dos carpetas en el directorio actual.',
        ejemplo:'mkdir dir2 dir3' },
      { tarea:'Muestra la línea larga de <code>dir2</code> para ver sus permisos.',
        meta:{ muestra:['drwxr-xr-x','dir2'] },
        pista:['La opción -l muestra la línea larga.','Para ver la carpeta en sí, y no su contenido, añade -d.','ls -ld dir2'],
        explica:'La primera columna, <code>drwxr-xr-x</code>, indica que es un directorio y que el propietario puede leer, escribir y entrar; el grupo y el resto solo leer y entrar.',
        ejemplo:'ls -ld dir2' }
    ]},

  { id:"permisos-sin-escritura", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Permisos · Quitar escritura", resumen:"chmod simbólico (Rafa 43)",
    enunciado:'<p>Quita todos los permisos de escritura de <code>dir2</code>, para el propietario, el grupo y el resto, y comprueba el resultado.</p>',
    final:'¡Bien hecho!',
    solucion:['Con <code>chmod a-w dir2</code> se quita la escritura a los tres bloques y el directorio pasa de 755 a 555.'],
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir2':{ tipo:'dir', modo:'755' }, '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Elimina con notación simbólica el permiso de escritura de <code>dir2</code> para todos.',
        meta:{ modo:{ dir2:'555' } },
        pista:['La notación simbólica usa u, g, o y a para propietario, grupo, otros y todos.','Para quitar un permiso se usa el signo menos.','chmod a-w dir2'],
        explica:'<code>a-w</code> quita la escritura a los tres bloques; los demás permisos no cambian y el directorio queda en 555.',
        ejemplo:'chmod a-w dir2' },
      { tarea:'Comprueba los permisos de <code>dir2</code>.',
        meta:{ muestra:'dr-xr-xr-x' },
        pista:['Vuelve a usar ls con -l y -d.','Busca la línea que empieza por d.','ls -ld dir2'],
        explica:'<code>dr-xr-xr-x</code> no tiene ninguna <code>w</code>: ya no se puede escribir dentro.',
        ejemplo:'ls -ld dir2' }
    ]},

  { id:"permisos-octal", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Permisos · Notación octal", resumen:"chmod 551 (Rafa 44–45)",
    enunciado:'<p>Quita con notación octal el permiso de lectura de <code>dir2</code> al resto de usuarios y comprueba cómo queda.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>chmod 551 dir2</code> deja al propietario y al grupo en <code>r-x</code> y al resto en <code>--x</code>, sin lectura.'],
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir2':{ tipo:'dir', modo:'555' }, '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Quita con notación octal el permiso de lectura de <code>dir2</code> para el resto.',
        meta:{ modo:{ dir2:'551' } },
        pista:['El modo octal se escribe con tres dígitos: propietario, grupo y otros.','Lectura vale 4 y ejecución vale 1.','chmod 551 dir2'],
        explica:'<code>551</code> deja al propietario y al grupo en <code>r-x</code> y al resto en <code>--x</code>.',
        ejemplo:'chmod 551 dir2' },
      { tarea:'Comprueba los permisos actuales de <code>dir2</code>.',
        meta:{ muestra:'dr-xr-x--x' },
        pista:['La línea larga empieza por el tipo de fichero.','El último bloque de tres letras es el del resto.','ls -ld dir2'],
        explica:'<code>dr-xr-x--x</code> confirma que el resto ya no puede leer el directorio, solo atravesarlo.',
        ejemplo:'ls -ld dir2' }
    ]},

  { id:"permisos-dir2l", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Permisos · Volver a escribir", resumen:"chmod u+w y mkdir (Rafa 46–47)",
    enunciado:'<p>Concede al propietario permiso de escritura en <code>dir2</code> y crea dentro el directorio <code>dir2l</code>.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>chmod u+w dir2</code> devuelve la escritura al propietario (751) y permite crear <code>dir2l</code> dentro.'],
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir2':{ tipo:'dir', modo:'551' }, '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Concede al propietario permiso de escritura en <code>dir2</code>.',
        meta:{ modo:{ dir2:'751' } },
        pista:['El propietario se representa con u.','Añadir un permiso se hace con +.','chmod u+w dir2'],
        explica:'<code>u+w</code> suma la escritura al propietario y deja el directorio en 751.',
        ejemplo:'chmod u+w dir2' },
      { tarea:'Crea ahora <code>dir2l</code> dentro de <code>dir2</code>.',
        meta:{ existe:['dir2/dir2l'], modo:{ 'dir2/dir2l':'755' } },
        pista:['Ya puedes escribir en dir2.','La ruta relativa es dir2/dir2l.','mkdir dir2/dir2l'],
        explica:'La nueva carpeta nace con los permisos por defecto, 755: <code>rwxr-xr-x</code>.',
        ejemplo:'mkdir dir2/dir2l' }
    ]},

  { id:"permisos-defecto", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Permisos · Valores por defecto", resumen:"umask y touch (Rafa 48)",
    enunciado:'<p>Averigua qué permisos recibe por defecto un fichero nuevo.</p>',
    final:'¡Bien hecho!',
    solucion:['Los ficheros parten de 666 y la <code>umask</code> 022 les quita la escritura del grupo y del resto, así que quedan en 644.'],
    inicio:{ cwd:'~' },
    pasos:[
      { tarea:'Crea un fichero vacío llamado <code>fichero</code>.',
        meta:{ existe:'fichero', modo:{ fichero:'644' } },
        pista:['touch crea un fichero vacío.','El nombre va como argumento.','touch fichero'],
        explica:'Los ficheros nacen con 666 menos lo que quita la <code>umask</code>; con 022 queda 644.',
        ejemplo:'touch fichero' },
      { tarea:'Muestra sus permisos en formato largo.',
        meta:{ muestra:'-rw-r--r--' },
        pista:['Usa ls -l con el nombre del fichero.','La primera columna son los permisos.','ls -l fichero'],
        explica:'<code>-rw-r--r--</code> significa que el propietario lee y escribe, y el grupo y el resto solo leen.',
        ejemplo:'ls -l fichero' }
    ]},

  { id:"permisos-dir3", grupo:"Ejercicios de Rafa", nivel:1, titulo:"Permisos · Entrar en dir3", resumen:"cd, pwd y ls -ld (Rafa 49–50)",
    enunciado:'<p>Cambia al directorio <code>dir3</code>, comprueba dónde estás y mira los permisos que tiene.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>cd dir3</code> cambia de carpeta, <code>pwd</code> muestra la ruta completa y <code>ls -ld .</code> enseña los permisos del directorio actual.'],
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Cambia al directorio <code>dir3</code>.',
        meta:{ cwd:'~/prueba/dir3' },
        pista:['Estás en prueba y dir3 está dentro.','cd recibe la carpeta como argumento.','cd dir3'],
        explica:'<code>cd dir3</code> entra en la carpeta y el directorio actual pasa a ser <code>~/prueba/dir3</code>.',
        ejemplo:'cd dir3' },
      { tarea:'Imprime la trayectoria completa para verificar el cambio.',
        meta:{ salida:'/home/usuario/prueba/dir3' },
        pista:['El comando que muestra la ruta actual es muy corto.','Son tres letras.','pwd'],
        explica:'<code>pwd</code> imprime la ruta absoluta desde la raíz.',
        ejemplo:'pwd' },
      { tarea:'Muestra los permisos del directorio actual.',
        meta:{ muestra:'drwxr-xr-x' },
        pista:['Puedes referirte a la carpeta actual con un punto.','Usa -l y -d.','ls -ld .'],
        explica:'<code>ls -ld .</code> muestra la línea del directorio actual, con sus permisos 755.',
        ejemplo:'ls -ld .' }
    ]},

  { id:"permisos-umask", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Permisos · Configurar umask", resumen:"umask 033 (Rafa 51–53)",
    enunciado:'<p>Ajusta la <code>umask</code> para que los directorios nazcan como <code>rwxr--r--</code> y los ficheros como <code>rw-r--r--</code>, crea cuatro carpetas y comprueba el resultado.</p>',
    final:'¡Bien hecho!',
    solucion:['La máscara que produce 744 en directorios y 644 en ficheros es <code>033</code>.'],
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba/dir2':'dir', '~/prueba/dir3':'dir' } },
    pasos:[
      { tarea:'Establece la umask adecuada para esos permisos.',
        meta:{ umask:'033' },
        pista:['Los directorios parten de 777 y los ficheros de 666.','La umask contiene los bits que se quitan.','umask 033'],
        explica:'Con <code>033</code>, a los directorios se les quita escritura y ejecución del grupo y del resto (777 & ~033 = 744) y a los ficheros, escritura y ejecución (666 & ~033 = 644).',
        ejemplo:'umask 033' },
      { tarea:'Crea <code>dira</code>, <code>dirb</code>, <code>dirc</code> y <code>dird</code>.',
        meta:{ existe:['dira','dirb','dirc','dird'], modo:{ dira:'744', dirb:'744', dirc:'744', dird:'744' } },
        pista:['mkdir acepta varios nombres.','No cambies de carpeta.','mkdir dira dirb dirc dird'],
        explica:'Las cuatro carpetas se crean con la máscara nueva y quedan en 744.',
        ejemplo:'mkdir dira dirb dirc dird' },
      { tarea:'Comprueba los permisos de los cuatro directorios.',
        meta:{ muestra:'drwxr--r--' },
        pista:['Puedes pasar los cuatro nombres a la vez.','Usa -l y -d.','ls -ld dira dirb dirc dird'],
        explica:'<code>drwxr--r--</code> es el resultado de aplicar la umask 033 a un directorio.',
        ejemplo:'ls -ld dira dirb dirc dird' }
    ]},

  { id:"permisos-fichero-lectura", grupo:"Ejercicios de Rafa", nivel:2, titulo:"Permisos · Quitar lectura", resumen:"chmod a-r y rm (Rafa 54)",
    enunciado:'<p>Crea el fichero <code>uno</code>, quítale todos los permisos de lectura, comprueba cómo queda e intenta borrarlo.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>chmod a-r uno</code> deja el fichero en 200, pero <code>rm</code> funciona porque para borrar manda el permiso del directorio, no el del fichero.'],
    inicio:{ cwd:'~/prueba', fs:{ '~/prueba':'dir' } },
    pasos:[
      { tarea:'Crea el fichero <code>uno</code>.',
        meta:{ existe:'uno' },
        pista:['touch crea un fichero vacío.','No hace falta cambiar de carpeta.','touch uno'],
        explica:'<code>touch uno</code> crea el fichero en la carpeta actual.',
        ejemplo:'touch uno' },
      { tarea:'Quita todos los permisos de lectura de <code>uno</code>.',
        meta:{ modo:{ uno:'200' } },
        pista:['Con la notación simbólica, a afecta a todos.','Quitar lectura se escribe con -r.','chmod a-r uno'],
        explica:'Al quitar la lectura a los tres bloques solo queda la escritura del propietario: 200.',
        ejemplo:'chmod a-r uno' },
      { tarea:'Comprueba sus permisos.',
        meta:{ muestra:'--w-------' },
        pista:['Usa ls -l con el nombre del fichero.','El primer carácter es el tipo y los nueve siguientes los permisos.','ls -l uno'],
        explica:'<code>--w-------</code> confirma que nadie puede leerlo, pero el propietario sí puede escribirlo.',
        ejemplo:'ls -l uno' },
      { tarea:'Borra el fichero <code>uno</code>.',
        meta:{ noExiste:'uno' },
        pista:['El comando de borrado es rm.','Pasa el nombre del fichero como argumento.','rm uno'],
        explica:'Para borrar un fichero manda el permiso de escritura del directorio, no el del fichero; por eso <code>rm</code> funciona aunque el fichero no tenga lectura.',
        ejemplo:'rm uno' }
    ]},

  { id:"permisos-carpeta1", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Permisos · Carpeta1", resumen:"chmod 700, 666 y 644 (Rafa 56)",
    enunciado:'<p>Crea en tu directorio personal <code>carpeta1</code> con todos los permisos para el propietario. Dentro crea <code>fich1</code>, con lectura y escritura para todos, y <code>fich2</code>, con lectura y escritura para el propietario y solo lectura para el resto.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>carpeta1</code> queda en 700, <code>fich1</code> en 666 y <code>fich2</code> en 644.'],
    inicio:{ cwd:'~' },
    pasos:[
      { tarea:'Crea <code>carpeta1</code> con todos los permisos para el propietario y ninguno para el grupo y el resto.',
        meta:{ modo:{ carpeta1:'700' } },
        pista:['Crea la carpeta con mkdir.','Todos los permisos del propietario son rwx, es decir, 7.','mkdir carpeta1; chmod 700 carpeta1'],
        explica:'<code>700</code> deja <code>rwx------</code>: solo el propietario puede entrar y escribir.',
        ejemplo:'mkdir carpeta1; chmod 700 carpeta1' },
      { tarea:'Dentro crea <code>fich1</code> con lectura y escritura para todos.',
        meta:{ modo:{ 'carpeta1/fich1':'666' } },
        pista:['La ruta relativa es carpeta1/fich1.','Lectura y escritura valen 4 + 2 = 6.','touch carpeta1/fich1; chmod 666 carpeta1/fich1'],
        explica:'<code>666</code> da <code>rw-rw-rw-</code>: todos pueden leer y escribir, nadie ejecutar.',
        ejemplo:'touch carpeta1/fich1; chmod 666 carpeta1/fich1' },
      { tarea:'Dentro crea <code>fich2</code> con lectura y escritura para el propietario y solo lectura para el resto.',
        meta:{ modo:{ 'carpeta1/fich2':'644' } },
        pista:['La ruta relativa es carpeta1/fich2.','El propietario lleva 6 y el grupo y el resto, 4.','touch carpeta1/fich2; chmod 644 carpeta1/fich2'],
        explica:'<code>644</code> da <code>rw-r--r--</code>: el propietario escribe y los demás solo leen.',
        ejemplo:'touch carpeta1/fich2; chmod 644 carpeta1/fich2' },
      { tarea:'Comprueba los permisos de los dos ficheros.',
        meta:{ muestra:['-rw-rw-rw-','-rw-r--r--'] },
        pista:['Lista el contenido de carpeta1 en formato largo.','Usa ls -l con la carpeta como argumento.','ls -l carpeta1'],
        explica:'La salida muestra <code>fich1</code> con <code>rw-rw-rw-</code> y <code>fich2</code> con <code>rw-r--r--</code>.',
        ejemplo:'ls -l carpeta1' }
    ]},

  { id:"permisos-carpeta2", grupo:"Ejercicios de Rafa", nivel:3, titulo:"Permisos · Carpeta2", resumen:"chmod 750, 660 y 640 (Rafa 56)",
    enunciado:'<p>Crea <code>carpeta2</code> con todos los permisos para el propietario y lectura y ejecución para el grupo. Dentro crea <code>file1</code>, con lectura y escritura para el propietario y el grupo, y <code>file2</code>, con lectura y escritura para el propietario y solo lectura para el grupo.</p>',
    final:'¡Bien hecho!',
    solucion:['<code>carpeta2</code> queda en 750, <code>file1</code> en 660 y <code>file2</code> en 640.'],
    inicio:{ cwd:'~' },
    pasos:[
      { tarea:'Crea <code>carpeta2</code> con todos los permisos para el propietario y lectura y ejecución para el grupo.',
        meta:{ modo:{ carpeta2:'750' } },
        pista:['El propietario lleva 7.','Lectura y ejecución para el grupo son 4 + 1 = 5.','mkdir carpeta2; chmod 750 carpeta2'],
        explica:'<code>750</code> deja <code>rwxr-x---</code>: el propietario lo controla y el grupo puede entrar y leer.',
        ejemplo:'mkdir carpeta2; chmod 750 carpeta2' },
      { tarea:'Dentro crea <code>file1</code> con lectura y escritura para el propietario y el grupo.',
        meta:{ modo:{ 'carpeta2/file1':'660' } },
        pista:['La ruta relativa es carpeta2/file1.','Lectura y escritura valen 6.','touch carpeta2/file1; chmod 660 carpeta2/file1'],
        explica:'<code>660</code> da <code>rw-rw----</code>: propietario y grupo leen y escriben; el resto no tiene nada.',
        ejemplo:'touch carpeta2/file1; chmod 660 carpeta2/file1' },
      { tarea:'Dentro crea <code>file2</code> con lectura y escritura para el propietario y solo lectura para el grupo.',
        meta:{ modo:{ 'carpeta2/file2':'640' } },
        pista:['La ruta relativa es carpeta2/file2.','El propietario lleva 6 y el grupo, 4.','touch carpeta2/file2; chmod 640 carpeta2/file2'],
        explica:'<code>640</code> da <code>rw-r-----</code>: el propietario escribe y el grupo solo lee.',
        ejemplo:'touch carpeta2/file2; chmod 640 carpeta2/file2' },
      { tarea:'Comprueba los permisos de los dos ficheros.',
        meta:{ muestra:['-rw-rw----','-rw-r-----'] },
        pista:['Lista el contenido de carpeta2 en formato largo.','Usa ls -l con la carpeta como argumento.','ls -l carpeta2'],
        explica:'La salida muestra <code>file1</code> con <code>rw-rw----</code> y <code>file2</code> con <code>rw-r-----</code>.',
        ejemplo:'ls -l carpeta2' }
    ]}

);
