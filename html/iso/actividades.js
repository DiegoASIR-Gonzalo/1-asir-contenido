/* Actividades de la terminal: datos finales, metas, ejemplos y pistas. */
const revivirRegExp = valor => {
  if (Array.isArray(valor)) return valor.map(revivirRegExp);
  if (valor && typeof valor === "object") {
    if (valor.__regexp != null) return new RegExp(valor.__regexp, valor.__flags || "");
    Object.keys(valor).forEach(clave => { valor[clave] = revivirRegExp(valor[clave]); });
  }
  return valor;
};
window.ACTIVIDADES = revivirRegExp([{"id":"tipo-ubicacion","grupo":"Consultar comandos","nivel":1,"titulo":"¿Qué es y dónde vive?","resumen":"type y whereis","enunciado":"<p>Un compañero duda de dos cosas: si <code>pwd</code> es un programa o una orden interna de la bash, y en qué ruta está instalado <code>whoami</code>. Averígualo desde la terminal.</p>","final":"<code>type</code> te dice qué clase de comando es y <code>whereis</code> te dice dónde está.","solucion":["<code>type</code> consulta cómo interpreta la shell un nombre: orden interna, programa, alias o función.","<code>whereis</code> busca el ejecutable y sus páginas de manual en las carpetas habituales."],"pasos":[{"tarea":"Averigua qué tipo de comando es <code>pwd</code>","meta":{"salida":"pwd es una orden interna del shell"},"pista":["Hace falta un comando que te diga de qué tipo es otro comando.","Se llama type y recibe el nombre del comando.","type pwd"],"explica":"<code>type</code> distingue las órdenes internas del shell (como <code>pwd</code>) de los programas instalados (como <code>ls</code>).","ejemplo":"type pwd"},{"tarea":"Localiza dónde está <code>whoami</code>","meta":{"salida":"whoami: /usr/bin/whoami /usr/share/man/man1/whoami.1.gz"},"pista":["Busca un comando que localice el ejecutable y su manual.","Su nombre empieza por \"where\".","whereis whoami"],"explica":"<code>whereis</code> muestra el ejecutable y las páginas de manual que coinciden con el nombre.","ejemplo":"whereis whoami"}]},{"id":"estructura","grupo":"Ficheros y carpetas","nivel":1,"titulo":"Tu primera estructura","resumen":"mkdir, cd, touch y ls","enunciado":"<p>Vas a montar la carpeta de una web desde cero. La carpeta <code>proyectos</code> todavía no existe.</p>","inicio":{"base":"vacio"},"final":"Has creado una estructura, entrado en ella y comprobado el resultado: el flujo básico de cualquier sesión.","solucion":["La secuencia completa era: <code>mkdir -p proyectos/web</code>, <code>cd proyectos/web</code>, <code>touch index.html</code> y <code>ls</code>.","<code>-p</code> creó las dos carpetas de una vez, <code>cd</code> te colocó dentro, <code>touch</code> creó el fichero vacío y <code>ls</code> confirmó que existe."],"pasos":[{"tarea":"Crea de golpe la ruta <code>proyectos/web</code>","meta":{"existe":["proyectos","proyectos/web"]},"pista":["Necesitas crear una carpeta dentro de otra que aún no existe.","mkdir tiene una opción que crea también las carpetas intermedias.","La opción es -p: mkdir -p proyectos/web"],"explica":"Con <code>-p</code> no hace falta crear <code>proyectos</code> antes que <code>web</code>, y si ya existe no da error.","ejemplo":"mkdir -p proyectos/web"},{"tarea":"Entra en <code>proyectos/web</code>","meta":{"cwd":"~/proyectos/web"},"pista":["Cambia de carpeta con cd.","La ruta es relativa: proyectos/web.","cd proyectos/web"],"explica":"<code>cd</code> cambia el directorio actual. El prompt muestra <code>~/proyectos/web</code> para confirmarlo.","ejemplo":"cd proyectos/web"},{"tarea":"Crea un fichero vacío llamado <code>index.html</code>","meta":{"existe":["index.html"]},"pista":["El comando crea el fichero si no existe.","Se llama touch.","touch index.html"],"explica":"<code>touch</code> crea un fichero vacío (o actualiza la fecha de uno que ya existe).","ejemplo":"touch index.html"},{"tarea":"Muestra el contenido de la carpeta","meta":{"muestra":"index.html"},"pista":["Lista el directorio actual.","El comando es de dos letras.","ls"],"explica":"<code>ls</code> lista el contenido del directorio actual. Debe aparecer <code>index.html</code>.","ejemplo":"ls"}]},{"id":"ficheros-lote","grupo":"Ficheros y carpetas","nivel":2,"titulo":"Ficheros en lote","resumen":"Expansión de llaves","enunciado":"<p>Necesitas diez ficheros de prueba, <code>fich-1.txt</code> a <code>fich-10.txt</code>, dentro de la carpeta <code>Prueba</code>. Hacerlo uno a uno sería eterno: usa las llaves.</p>","inicio":{"fs":{"~/Prueba":"dir"}},"final":"Las llaves <code>{1..10}</code> se expanden antes de ejecutar el comando, así que <code>touch</code> recibe los diez nombres.","solucion":["Primero se entra en <code>Prueba</code> con <code>cd Prueba</code>.","Después, <code>touch fich-{1..10}.txt</code> genera diez argumentos y <code>ls</code> confirma que están todos."],"pasos":[{"tarea":"Entra en la carpeta <code>Prueba</code>","meta":{"cwd":"~/Prueba"},"pista":["La carpeta ya existe en tu home.","Cambia de directorio con cd.","cd Prueba"],"explica":"<code>cd Prueba</code> entra en una carpeta que ya existe.","ejemplo":"cd Prueba"},{"tarea":"Crea los diez ficheros con un solo <code>touch</code>","meta":{"existe":["fich-1.txt","fich-2.txt","fich-3.txt","fich-4.txt","fich-5.txt","fich-6.txt","fich-7.txt","fich-8.txt","fich-9.txt","fich-10.txt"]},"pista":["El nombre lleva un rango entre llaves.","El rango se escribe con dos puntos: {1..10}.","touch fich-{1..10}.txt"],"explica":"La bash expande <code>{1..10}</code> en <code>1 2 3 … 10</code> antes de ejecutar <code>touch</code>, que recibe los diez nombres.","ejemplo":"touch fich-{1..10}.txt"},{"tarea":"Comprueba que se han creado","meta":{"muestra":["fich-1.txt","fich-10.txt"],"noMuestra":"fich-11.txt"},"pista":["Lista el contenido de la carpeta actual.","El comando es de dos letras.","ls"],"explica":"<code>ls</code> muestra los diez ficheros. El orden de las columnas no importa: lo que importa es que estén todos.","ejemplo":"ls"}]},{"id":"funcion-mkcd","grupo":"Funciones en .bashrc","nivel":2,"titulo":"Tu función mkcd","resumen":"Funciones en ~/.bashrc","enunciado":"<p>En tu <code>~/.bashrc</code> acabas de añadir esta función:</p><pre>mkcd() {\n  mkdir -p \"$1\" &amp;&amp; cd \"$1\"\n}</pre><p>Cárgala y pruébala.</p>","final":"Una función de <code>~/.bashrc</code> se usa como cualquier comando. <code>$1</code> es su primer argumento.","solucion":["<code>source ~/.bashrc</code> vuelve a leer el fichero y define la función en la sesión actual.","Después, <code>mkcd proyectos/nuevo</code> la ejecuta, y <code>pwd</code> confirma la ruta final."],"pasos":[{"tarea":"Recarga <code>~/.bashrc</code> sin cerrar la terminal","meta":{"funcion":"mkcd"},"pista":["El fichero se lee con un comando que empieza por \"s\".","Se llama source y recibe el fichero a cargar.","source ~/.bashrc"],"explica":"<code>source</code> ejecuta el fichero en la shell actual, así que la función queda disponible.","ejemplo":"source ~/.bashrc"},{"tarea":"Usa <code>mkcd</code> para crear y entrar en <code>proyectos/nuevo</code>","meta":{"cwd":"~/proyectos/nuevo","existe":["~/proyectos/nuevo"]},"pista":["mkcd recibe la ruta que quieres crear y en la que quieres entrar.","La ruta pedida es proyectos/nuevo.","mkcd proyectos/nuevo"],"explica":"<code>mkcd</code> combina <code>mkdir -p</code> y <code>cd</code>: crea la ruta y te coloca dentro.","ejemplo":"mkcd proyectos/nuevo"},{"tarea":"Comprueba en qué directorio estás","meta":{"salida":"/home/usuario/proyectos/nuevo"},"pista":["El comando imprime la ruta de trabajo actual.","Su nombre son tres letras.","pwd"],"explica":"<code>pwd</code> (print working directory) muestra la ruta absoluta del directorio actual.","ejemplo":"pwd"}]},{"id":"enlace-simbolico","grupo":"Varios comandos","nivel":2,"titulo":"Acceso directo","resumen":"Enlace simbólico con ln -s","enunciado":"<p>Quieres entrar a tu carpeta <code>/home/usuario/Descargas/</code> desde un acceso directo llamado <code>softDes</code>.</p>","final":"Un enlace simbólico apunta a la ruta original: es el equivalente a un acceso directo de Windows.","solucion":["<code>ln -s /home/usuario/Descargas softDes</code> crea el enlace en tu home.","<code>ls softDes</code> lista el contenido del destino y <code>file softDes</code> confirma que es un enlace simbólico."],"pasos":[{"tarea":"Crea el enlace simbólico <code>softDes</code> hacia <code>/home/usuario/Descargas/</code>","meta":{"enlace":[{"path":"softDes","destino":"~/Descargas"}]},"pista":["El comando para crear enlaces es ln.","Con la opción -s el enlace es simbólico.","ln -s ~/Descargas softDes"],"explica":"<code>-s</code> crea un enlace simbólico; si se omite, se crea un enlace duro al mismo contenido.","ejemplo":"ln -s ~/Descargas softDes"},{"tarea":"Lista el contenido de <code>softDes</code>","meta":{"muestra":["1-asir-contenido-main","BinarioFH.pdf","Conceptos UD 1.pdf"]},"pista":["El enlace se usa como si fuera la carpeta de destino.","Lista la ruta softDes.","ls softDes"],"explica":"Al listar el enlace, la shell resuelve el destino y muestra el contenido de <code>~/Descargas</code>.","ejemplo":"ls softDes"},{"tarea":"Comprueba de qué tipo es <code>softDes</code>","meta":{"muestra":"enlace simbólico a /home/usuario/Descargas"},"pista":["Hay un comando que dice qué tipo de fichero es.","Se llama file.","file softDes"],"explica":"<code>file</code> identifica el tipo: en este caso, un enlace simbólico y la ruta a la que apunta.","ejemplo":"file softDes"}]},{"id":"rafa-01","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 1","resumen":"Listar /bin","enunciado":"<p>Listar todos los archivos del directorio <code>bin</code>.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista el contenido de <code>/bin</code>.","meta":{"muestra":["bash","cat","ls","pwd"]},"pista":["La ruta del directorio es /bin.","ls recibe la ruta como argumento.","ls /bin"],"explica":"<code>ls /bin</code> muestra los comandos instalados en ese directorio.","ejemplo":"ls /bin"}]},{"id":"rafa-02","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 2","resumen":"Listar /tmp","enunciado":"<p>Listar todos los archivos del directorio <code>tmp</code>.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista el contenido de <code>/tmp</code>.","meta":{"muestra":"cache"},"pista":["La ruta del directorio es /tmp.","Puedes usar ls con la ruta absoluta.","ls /tmp"],"explica":"Dentro de <code>/tmp</code> hay una carpeta llamada <code>cache</code>.","ejemplo":"ls /tmp"}]},{"id":"rafa-03","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 3","resumen":"Filtrar y ordenar /etc","enunciado":"<p>Listar todos los archivos del directorio <code>etc</code> que empiecen por <code>t</code> en orden inverso.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista los archivos de <code>/etc</code> que empiezan por <code>t</code>, en orden inverso.","meta":{"orden":["tmpfiles.d","timezone","terminfo"],"noMuestra":["hosts","passwd"]},"pista":["Para filtrar por la letra t, añade t* al final de la ruta.","Si no sabes cómo ordenarlo al revés, usa -r.","ls -r /etc/t*"],"explica":"<code>-r</code> invierte el orden de la lista; <code>t*</code> deja solo los nombres que empiezan por t.","ejemplo":"ls -r /etc/t*"}]},{"id":"rafa-04","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 4","resumen":"Comodín de un carácter","enunciado":"<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por <code>tty</code> y tengan 5 caracteres.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista los archivos de <code>/dev</code> que empiezan por <code>tty</code> y tienen 5 caracteres.","meta":{"muestra":"ttyS0","noMuestra":["tty0","tty4"]},"pista":["Cada ? sustituye exactamente a un carácter.","Después de tty necesitas dos comodines.","ls /dev/tty??"],"explica":"<code>tty??</code> exige dos caracteres más después de tty, así que encaja con <code>ttyS0</code> y no con <code>tty0</code>.","ejemplo":"ls /dev/tty??"}]},{"id":"rafa-05","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 5","resumen":"Rango de caracteres","enunciado":"<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por <code>tty</code> y acaben en 1,2,3 ó 4.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista los archivos de <code>/dev</code> que empiezan por <code>tty</code> y acaban en un dígito del 1 al 4.","meta":{"muestra":["tty1","tty2","tty3","tty4"],"noMuestra":["tty0","ttyS0"]},"pista":["Para aceptar un rango de caracteres se usan corchetes.","El rango del 1 al 4 se escribe [1-4].","ls /dev/tty[1-4]"],"explica":"<code>[1-4]</code> acepta un único carácter entre 1 y 4 y deja fuera <code>tty0</code> y <code>ttyS0</code>.","ejemplo":"ls /dev/tty[1-4]"}]},{"id":"rafa-06","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 6","resumen":"Filtrar por el final","enunciado":"<p>Listar todos los archivos del directorio <code>dev</code> que empiecen por <code>t</code> y acaben en <code>C1</code>.</p>","final":"¡Bien hecho!","inicio":{"fs":{"/dev/ttyC1":""}},"pasos":[{"tarea":"Lista los archivos de <code>/dev</code> que empiezan por <code>t</code> y acaban en <code>C1</code>.","meta":{"muestra":"ttyC1","noMuestra":["tty0","ttyS0"]},"pista":["Puedes combinar el comodín * con el texto final.","La ruta empieza por /dev/t.","ls /dev/t*C1"],"explica":"El patrón <code>t*C1</code> empieza por t, admite cualquier cosa en medio y termina en C1.","ejemplo":"ls /dev/t*C1"}]},{"id":"rafa-07","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 7","resumen":"Mostrar archivos ocultos","enunciado":"<p>Listar todos los archivos, incluidos los ocultos, del directorio raíz.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista el contenido de <code>/</code>, incluidos los archivos ocultos.","meta":{"muestra":[".dockerenv","bin","etc"]},"pista":["Los archivos ocultos empiezan por punto.","La opción -a muestra los ocultos.","ls -a /"],"explica":"<code>ls -a /</code> enseña también los nombres que empiezan por punto, como <code>.dockerenv</code>.","ejemplo":"ls -a /"}]},{"id":"rafa-08","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 8","resumen":"Excluir con comodines","enunciado":"<p>Listar todos los archivos del directorio <code>etc</code> que no empiecen por <code>t</code>.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista los archivos de <code>/etc</code> que no empiezan por <code>t</code>.","meta":{"muestra":["hostname","motd","passwd"],"noMuestra":["timezone","terminfo","tmpfiles.d"]},"pista":["Dentro de unos corchetes, ! niega el conjunto.","El patrón sería [!t]*.","ls /etc/[!t]*"],"explica":"<code>[!t]</code> acepta un carácter que no sea t; el resto del nombre lo cubre <code>*</code>.","ejemplo":"ls /etc/[!t]*"}]},{"id":"rafa-09","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 9","resumen":"Listado recursivo","enunciado":"<p>Listar todos los archivos del directorio <code>usr</code> y sus subdirectorios.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista <code>/usr</code> y todo lo que cuelga de sus subdirectorios.","meta":{"muestra":["/usr/share/man:","man1"]},"pista":["La opción -R recorre los subdirectorios.","Combínala con la ruta /usr.","ls -R /usr"],"explica":"<code>ls -R /usr</code> muestra cada carpeta y, debajo, el contenido de sus subcarpetas.","ejemplo":"ls -R /usr"}]},{"id":"rafa-10","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 10","resumen":"Cambiar a /tmp","enunciado":"<p>Cambiarse al directorio <code>tmp</code>.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Cambia al directorio <code>/tmp</code>.","meta":{"cwd":"/tmp"},"pista":["El comando para cambiar de carpeta es cd.","Puedes usar la ruta absoluta.","cd /tmp"],"explica":"<code>cd /tmp</code> cambia el directorio actual a <code>/tmp</code>.","ejemplo":"cd /tmp"}]},{"id":"rafa-11","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 11","resumen":"Comprobar el directorio","enunciado":"<p>Verificar que el directorio actual ha cambiado.</p>","final":"¡Bien hecho!","inicio":{"cwd":"/tmp"},"pasos":[{"tarea":"Muestra la ruta del directorio actual.","meta":{"salida":"/tmp"},"pista":["El comando que muestra la ruta actual tiene tres letras.","Muestra la trayectoria completa.","pwd"],"explica":"<code>pwd</code> imprime la ruta absoluta del directorio en el que estás.","ejemplo":"pwd"}]},{"id":"rafa-12","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 12","resumen":"Día y hora","enunciado":"<p>Mostrar el día y la hora actual.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Muestra la fecha y la hora del sistema.","meta":{"muestra":[{"__regexp":"\\d{2}:\\d{2}","__flags":""},"UTC"]},"pista":["El comando se llama date.","No necesita argumentos.","date"],"explica":"<code>date</code> muestra el día, la fecha y la hora actuales.","ejemplo":"date"}]},{"id":"rafa-13","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 13","resumen":"Volver a $HOME","enunciado":"<p>Con un solo comando posicionarse en el directorio <code>$HOME</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"/tmp"},"pasos":[{"tarea":"Vuelve a tu directorio personal con un solo comando.","meta":{"cwd":"~"},"pista":["La variable $HOME guarda tu directorio personal.","También puedes usar la abreviatura ~.","cd $HOME"],"explica":"<code>cd $HOME</code> cambia al directorio personal del usuario.","ejemplo":"cd $HOME"}]},{"id":"rafa-14","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 14","resumen":"Verificar $HOME","enunciado":"<p>Verificar que se está en él.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~"},"pasos":[{"tarea":"Comprueba que el directorio actual es tu directorio personal.","meta":{"salida":"/home/usuario"},"pista":["Usa el comando que muestra la ruta actual.","La ruta completa empieza por /home.","pwd"],"explica":"<code>pwd</code> debe mostrar <code>/home/usuario</code>.","ejemplo":"pwd"}]},{"id":"rafa-15","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 15","resumen":"Número de inodo","enunciado":"<p>Listar todos los ficheros del directorio <code>HOME</code> mostrando su número de inodo.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Lista los ficheros de tu directorio personal mostrando el número de inodo.","meta":{"muestra":[{"__regexp":"\\d+","__flags":""},"Descargas"]},"pista":["La opción -i de ls muestra el número de inodo.","Puedes combinar -i con la ruta del home.","ls -i ~"],"explica":"<code>ls -i ~</code> antepone a cada nombre su número de inodo.","ejemplo":"ls -i ~"}]},{"id":"rafa-16","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 16","resumen":"Crear prueba","enunciado":"<p>Crear en vuestro directorio de inicio, un directorio <code>prueba</code>.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Crea el directorio <code>prueba</code> en tu directorio personal.","meta":{"existe":"~/prueba"},"pista":["Estás en tu directorio personal.","mkdir crea un directorio.","mkdir prueba"],"explica":"<code>mkdir prueba</code> crea la carpeta <code>~/prueba</code>.","ejemplo":"mkdir prueba"}]},{"id":"rafa-17","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 17","resumen":"Árbol de directorios","enunciado":"<p>Crear los directorios <code>dir1</code>, <code>dir2</code> y <code>dir3</code> en el directorio <code>prueba</code>. Dentro de <code>dir1</code> crear el directorio <code>dir11</code>. Dentro del directorio <code>dir3</code> crear el directorio <code>dir31</code>. Dentro del directorio <code>dir31</code>, crear los directorios <code>dir311</code> y <code>dir312</code>.</p>","final":"¡Bien hecho!","pasos":[{"tarea":"Crea toda la estructura con una sola orden.","meta":{"existe":["prueba/dir1/dir11","prueba/dir2","prueba/dir3/dir31/dir311","prueba/dir3/dir31/dir312"]},"pista":["La opción -p crea también los directorios intermedios.","Puedes pasar varias rutas a mkdir.","mkdir -p prueba/dir1/dir11 prueba/dir2 prueba/dir3/dir31/dir311 prueba/dir3/dir31/dir312"],"explica":"<code>mkdir -p</code> crea cada ruta completa sin quejarse de los niveles que faltan.","ejemplo":"mkdir -p prueba/dir1/dir11 prueba/dir2 prueba/dir3/dir31/dir311 prueba/dir3/dir31/dir312"}]},{"id":"rafa-18","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 18","resumen":"Copiar motd","enunciado":"<p>Copiar el archivo <code>/etc/motd</code> a un archivo llamado <code>mensaje</code> de nuestro directorio <code>prueba</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba":"dir"}},"pasos":[{"tarea":"Copia <code>/etc/motd</code> en <code>prueba/mensaje</code>.","meta":{"existe":"prueba/mensaje","contenido":{"prueba/mensaje":"Bienvenido a Linux\n"}},"pista":["El comando de copia es cp.","El primer argumento es el origen y el segundo el destino.","cp /etc/motd prueba/mensaje"],"explica":"<code>cp</code> copia el contenido del fichero de origen en la ruta de destino.","ejemplo":"cp /etc/motd prueba/mensaje"}]},{"id":"rafa-19","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 19","resumen":"Copiar mensaje en tres carpetas","enunciado":"<p>Copiar <code>mensaje</code> en <code>dir1</code>, <code>dir2</code> y <code>dir3</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/mensaje":"Bienvenido a Linux\n","~/prueba/dir1":"dir","~/prueba/dir2":"dir","~/prueba/dir3":"dir"}},"pasos":[{"tarea":"Copia <code>prueba/mensaje</code> en las tres carpetas.","meta":{"existe":["prueba/dir1/mensaje","prueba/dir2/mensaje","prueba/dir3/mensaje"]},"pista":["Puedes encadenar varios comandos con punto y coma.","Cada cp necesita su origen y su destino.","cp prueba/mensaje prueba/dir1; cp prueba/mensaje prueba/dir2; cp prueba/mensaje prueba/dir3"],"explica":"Cada <code>cp</code> copia el mismo fichero a una carpeta distinta.","ejemplo":"cp prueba/mensaje prueba/dir1; cp prueba/mensaje prueba/dir2; cp prueba/mensaje prueba/dir3"}]},{"id":"rafa-20","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 20","resumen":"Comprobar con un comando","enunciado":"<p>Comprobar el ejercicio anterior mediante un solo comando.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir1/mensaje":"x","~/prueba/dir2/mensaje":"x","~/prueba/dir3/mensaje":"x"}},"pasos":[{"tarea":"Comprueba con un solo comando que <code>mensaje</code> está en <code>dir1</code>, <code>dir2</code> y <code>dir3</code>.","meta":{"orden":["dir1/mensaje","dir2/mensaje","dir3/mensaje"]},"pista":["find busca de forma recursiva por un nombre.","Puedes buscar dentro de la carpeta prueba.","find prueba -name mensaje"],"explica":"<code>find prueba -name mensaje</code> recorre el árbol y muestra las tres copias en una sola salida.","ejemplo":"find prueba -name mensaje"}]},{"id":"rafa-21","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 21","resumen":"Copiar rc2.d","enunciado":"<p>Copiar los archivos del directorio <code>rc2.d</code> que se encuentra en <code>/etc</code> al directorio <code>dir31</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir3/dir31":"dir"}},"pasos":[{"tarea":"Copia todos los archivos de <code>/etc/rc2.d</code> en <code>prueba/dir3/dir31</code>.","meta":{"existe":["prueba/dir3/dir31/README","prueba/dir3/dir31/S01cron","prueba/dir3/dir31/S20ssh"]},"pista":["El comodín * representa todos los nombres.","El destino es la carpeta dir31.","cp /etc/rc2.d/* prueba/dir3/dir31"],"explica":"El comodín <code>*</code> expande todos los ficheros de <code>rc2.d</code> y <code>cp</code> los copia en el destino.","ejemplo":"cp /etc/rc2.d/* prueba/dir3/dir31"}]},{"id":"rafa-22","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 22","resumen":"Filtrar nombres de /bin","enunciado":"<p>Copiar en el directorio <code>dir311</code> los archivos de <code>/bin</code> que tengan una <code>a</code> como segunda letra y su nombre tenga cuatro letras.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir3/dir31/dir311":"dir"}},"pasos":[{"tarea":"Copia en <code>prueba/dir3/dir31/dir311</code> los archivos de <code>/bin</code> con cuatro letras y una <code>a</code> en segundo lugar.","meta":{"existe":["prueba/dir3/dir31/dir311/bash","prueba/dir3/dir31/dir311/date","prueba/dir3/dir31/dir311/tail"],"noExiste":["prueba/dir3/dir31/dir311/cat"]},"pista":["? sustituye a un solo carácter.","El patrón ?a?? empieza por cualquier letra, sigue con a y acaba con dos caracteres.","cp /bin/?a?? prueba/dir3/dir31/dir311"],"explica":"<code>?a??</code> encaja con <code>bash</code>, <code>date</code> y <code>tail</code>, pero no con <code>cat</code>, que solo tiene tres letras.","ejemplo":"cp /bin/?a?? prueba/dir3/dir31/dir311"}]},{"id":"rafa-23","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 23","resumen":"Copiar otro usuario","enunciado":"<p>Copiar el directorio de otro usuario y sus subdirectorios debajo de <code>dir11</code> (incluido el propio directorio).</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir1/dir11":"dir"}},"pasos":[{"tarea":"Copia <code>/home/rafa</code> y todo su contenido dentro de <code>prueba/dir1/dir11</code>.","meta":{"existe":["prueba/dir1/dir11/rafa","prueba/dir1/dir11/rafa/Documentos/nota.txt","prueba/dir1/dir11/rafa/Descargas/apuntes.txt"]},"pista":["Para copiar carpetas necesitas la opción -r.","El origen es /home/rafa y el destino dir11.","cp -r /home/rafa prueba/dir1/dir11"],"explica":"<code>cp -r</code> copia la carpeta indicada, sus subcarpetas y todos sus ficheros.","ejemplo":"cp -r /home/rafa prueba/dir1/dir11"}]},{"id":"rafa-24","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 24","resumen":"Mover dir31","enunciado":"<p>Mover el directorio <code>dir31</code> y sus subdirectorios debajo de <code>dir2</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir2":"dir","~/prueba/dir3/dir31/dir311":"dir","~/prueba/dir3/dir31/dir312":"dir"}},"pasos":[{"tarea":"Mueve <code>prueba/dir3/dir31</code> dentro de <code>prueba/dir2</code>.","meta":{"existe":["prueba/dir2/dir31/dir311","prueba/dir2/dir31/dir312"],"noExiste":"prueba/dir3/dir31"},"pista":["El comando para mover es mv.","El destino es la carpeta dir2.","mv prueba/dir3/dir31 prueba/dir2"],"explica":"<code>mv</code> traslada la carpeta completa, con sus subdirectorios, a la nueva ubicación.","ejemplo":"mv prueba/dir3/dir31 prueba/dir2"}]},{"id":"rafa-25","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 25","resumen":"Archivos ordinarios del HOME","enunciado":"<p>Mostrar por pantalla los archivos ordinarios del directorio <code>HOME</code> y sus subdirectorios.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir1/mensaje":"x"}},"pasos":[{"tarea":"Muestra solo los archivos ordinarios de tu directorio personal y sus subdirectorios.","meta":{"muestra":[".bashrc","BinarioFH.pdf","mensaje"]},"pista":["find recorre el árbol de directorios.","El criterio -type f selecciona archivos ordinarios.","find ~ -type f"],"explica":"<code>find ~ -type f</code> recorre el home y muestra únicamente los ficheros, sin las carpetas.","ejemplo":"find ~ -type f"}]},{"id":"rafa-26","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 26","resumen":"Ocultar mensaje","enunciado":"<p>Ocultar el archivo <code>mensaje</code> del directorio <code>dir3</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir3/mensaje":"x"}},"pasos":[{"tarea":"Renombra <code>prueba/dir3/mensaje</code> para que quede oculto.","meta":{"existe":"prueba/dir3/.mensaje","noExiste":"prueba/dir3/mensaje"},"pista":["Un archivo se oculta si su nombre empieza por punto.","Puedes cambiar el nombre con mv.","mv prueba/dir3/mensaje prueba/dir3/.mensaje"],"explica":"Al poner un punto delante del nombre, el archivo deja de aparecer en un <code>ls</code> normal.","ejemplo":"mv prueba/dir3/mensaje prueba/dir3/.mensaje"},{"tarea":"Comprueba que el archivo oculto está en <code>dir3</code>.","meta":{"muestra":".mensaje"},"pista":["Usa ls con la opción -a.","La ruta es prueba/dir3.","ls -a prueba/dir3"],"explica":"<code>ls -a</code> sí muestra los nombres que empiezan por punto.","ejemplo":"ls -a prueba/dir3"}]},{"id":"rafa-27","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 27","resumen":"Borrar dir1","enunciado":"<p>Borrar los archivos y directorios de <code>dir1</code>, incluido el propio directorio.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir1/dir11":"dir","~/prueba/dir1/mensaje":"x","~/prueba/dir2":"dir"}},"pasos":[{"tarea":"Borra <code>prueba/dir1</code> con todo lo que contiene.","meta":{"noExiste":"prueba/dir1","existe":"prueba/dir2"},"pista":["rm borra archivos, pero para carpetas necesita -r.","La ruta que hay que borrar es prueba/dir1.","rm -r prueba/dir1"],"explica":"<code>rm -r</code> borra la carpeta y todo su contenido de forma recursiva.","ejemplo":"rm -r prueba/dir1"}]},{"id":"rafa-28","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 28","resumen":"Copiar dispositivos filtrados","enunciado":"<p>Copiar al directorio <code>dir312</code> los ficheros del directorio <code>/dev</code> que empiecen por <code>t</code>, acaben en una letra que vaya de la <code>a</code> a la <code>b</code> y tengan cinco letras en su nombre.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir3/dir31/dir312":"dir","/dev/ttySa":"","/dev/ttySb":""}},"pasos":[{"tarea":"Copia en <code>prueba/dir3/dir31/dir312</code> los archivos de <code>/dev</code> con cinco letras, que empiecen por <code>t</code> y acaben en <code>a</code> o <code>b</code>.","meta":{"existe":["prueba/dir3/dir31/dir312/ttySa","prueba/dir3/dir31/dir312/ttySb"],"noExiste":"prueba/dir3/dir31/dir312/ttyS0"},"pista":["Necesitas cinco caracteres: t y cuatro más.","El último carácter debe estar en el rango [a-b].","cp /dev/t???[ab] prueba/dir3/dir31/dir312"],"explica":"<code>t???[ab]</code> exige una t, tres caracteres cualesquiera y una a o una b al final.","ejemplo":"cp /dev/t???[ab] prueba/dir3/dir31/dir312"}]},{"id":"rafa-29","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 29","resumen":"Borrar con comodines","enunciado":"<p>Borrar los archivos de <code>dir312</code> que no acaben en <code>b</code> y tengan una <code>q</code> como cuarta letra.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir3/dir31/dir312/ttyqa":"a","~/prueba/dir3/dir31/dir312/ttyqb":"b","~/prueba/dir3/dir31/dir312/ttyqc":"c"}},"pasos":[{"tarea":"Borra de <code>dir312</code> los archivos con <code>q</code> en cuarta posición que no acaben en <code>b</code>.","meta":{"existe":"prueba/dir3/dir31/dir312/ttyqb","noExiste":["prueba/dir3/dir31/dir312/ttyqa","prueba/dir3/dir31/dir312/ttyqc"]},"pista":["Puedes combinar * con corchetes negados.","El patrón *q[!b] deja fuera los que acaban en b.","rm prueba/dir3/dir31/dir312/*q[!b]"],"explica":"<code>[!b]</code> acepta cualquier carácter que no sea b; por eso se conserva <code>ttyqb</code>.","ejemplo":"rm prueba/dir3/dir31/dir312/*q[!b]"}]},{"id":"rafa-30","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 30","resumen":"Mover dir312","enunciado":"<p>Mover el directorio <code>dir312</code> debajo de <code>dir3</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir3/dir31/dir312/ttyqb":"b"}},"pasos":[{"tarea":"Mueve <code>prueba/dir3/dir31/dir312</code> dentro de <code>prueba/dir3</code>.","meta":{"existe":"prueba/dir3/dir312/ttyqb","noExiste":"prueba/dir3/dir31/dir312"},"pista":["mv mueve archivos y carpetas.","El destino es la carpeta dir3.","mv prueba/dir3/dir31/dir312 prueba/dir3"],"explica":"<code>mv</code> cambia de sitio la carpeta completa con su contenido.","ejemplo":"mv prueba/dir3/dir31/dir312 prueba/dir3"}]},{"id":"rafa-31","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 31","resumen":"Enlace simbólico","enunciado":"<p>Crear un enlace simbólico al directorio <code>dir1</code> dentro del directorio <code>dir3</code> llamado <code>enlacedir1</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~/prueba","fs":{"~/prueba/dir1":"dir","~/prueba/dir3":"dir"}},"pasos":[{"tarea":"Crea el enlace <code>prueba/dir3/enlacedir1</code> apuntando a <code>prueba/dir1</code>.","meta":{"enlace":[{"path":"~/prueba/dir3/enlacedir1","destino":"~/prueba/dir1"}]},"pista":["Un enlace simbólico se crea con ln -s.","Primero va el destino y después el nombre del enlace.","ln -s dir1 dir3/enlacedir1"],"explica":"<code>ln -s</code> crea un acceso directo que apunta al directorio indicado.","ejemplo":"ln -s dir1 dir3/enlacedir1"}]},{"id":"rafa-32","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 32","resumen":"Crear a través del enlace","enunciado":"<p>Posicionarse en <code>dir3</code> y, empleando el enlace creado en el ejercicio anterior, crear el directorio <code>nuevo1</code> dentro de <code>dir1</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~/prueba","fs":{"~/prueba/dir1":"dir","~/prueba/dir3":"dir","~/prueba/dir3/enlacedir1":{"tipo":"link","destino":"~/prueba/dir1"}}},"pasos":[{"tarea":"Entra en <code>dir3</code>, accede por el enlace y crea <code>nuevo1</code> dentro de <code>dir1</code>.","meta":{"cwd":"~/prueba/dir1","existe":"nuevo1"},"pista":["Primero entra en dir3.","Después puedes entrar en enlacedir1 como si fuera dir1.","cd dir3; cd enlacedir1; mkdir nuevo1"],"explica":"Al entrar por <code>enlacedir1</code>, el directorio actual se resuelve a <code>dir1</code> y <code>nuevo1</code> se crea dentro.","ejemplo":"cd dir3; cd enlacedir1; mkdir nuevo1"}]},{"id":"rafa-33","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 33","resumen":"Copiar a través del enlace","enunciado":"<p>Utilizando el enlace creado copiar los archivos que empiecen por <code>u</code> del directorio <code>/bin</code> en directorio <code>nuevo1</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~/prueba","fs":{"~/prueba/dir1/nuevo1":"dir","~/prueba/dir3":"dir","~/prueba/dir3/enlacedir1":{"tipo":"link","destino":"~/prueba/dir1"}}},"pasos":[{"tarea":"Entra por el enlace y copia en <code>nuevo1</code> los archivos de <code>/bin</code> que empiezan por <code>u</code>.","meta":{"existe":["nuevo1/uname","nuevo1/uptime"]},"pista":["El comodín /bin/u* selecciona los archivos que empiezan por u.","Entra en dir3 y después en enlacedir1.","cd dir3; cd enlacedir1; cp /bin/u* nuevo1"],"explica":"El enlace lleva a <code>dir1</code>, donde está <code>nuevo1</code>; <code>cp</code> copia allí los dos archivos.","ejemplo":"cd dir3; cd enlacedir1; cp /bin/u* nuevo1"}]},{"id":"rafa-34","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 34","resumen":"Enlaces duros","enunciado":"<p>Crear dos enlaces duros del fichero <code>fich1</code>, llamarlo <code>enlace</code>, en los directorios <code>dir1</code> y <code>dir2</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir1/fich1":"contenido de fich1\n","~/prueba/dir2":"dir"}},"pasos":[{"tarea":"Crea <code>enlace</code> en <code>dir1</code> y en <code>dir2</code> como enlace duro de <code>fich1</code>.","meta":{"existe":["prueba/dir1/enlace","prueba/dir2/enlace"],"contenido":{"prueba/dir1/enlace":"contenido de fich1\n","prueba/dir2/enlace":"contenido de fich1\n"}},"pista":["Los enlaces duros se crean con ln, sin la opción -s.","Primero va el fichero original y después el nombre del enlace.","ln prueba/dir1/fich1 prueba/dir1/enlace; ln prueba/dir1/fich1 prueba/dir2/enlace"],"explica":"Cada enlace duro comparte el contenido y el inodo del fichero original.","ejemplo":"ln prueba/dir1/fich1 prueba/dir1/enlace; ln prueba/dir1/fich1 prueba/dir2/enlace"}]},{"id":"rafa-35","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 35","resumen":"Borrar fich1 y copiar enlace","enunciado":"<p>Borrar el archivo <code>fich1</code> y copiar <code>enlace</code> en <code>dir3</code>.</p>","final":"¡Bien hecho!","inicio":{"cwd":"~","fs":{"~/prueba/dir1/fich1":"contenido de fich1\n","~/prueba/dir1/enlace":"contenido de fich1\n","~/prueba/dir2/enlace":"contenido de fich1\n","~/prueba/dir3":"dir"}},"pasos":[{"tarea":"Borra <code>prueba/dir1/fich1</code> y copia <code>prueba/dir2/enlace</code> en <code>prueba/dir3</code>.","meta":{"noExiste":"prueba/dir1/fich1","existe":["prueba/dir3/enlace"],"contenido":{"prueba/dir3/enlace":"contenido de fich1\n"}},"pista":["Puedes encadenar el borrado y la copia con punto y coma.","El enlace que se copia está en dir2.","rm prueba/dir1/fich1; cp prueba/dir2/enlace prueba/dir3"],"explica":"El enlace duro sigue existiendo aunque se borre <code>fich1</code>; después se copia en <code>dir3</code>.","ejemplo":"rm prueba/dir1/fich1; cp prueba/dir2/enlace prueba/dir3"}]},{"id":"rafa-36","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 36","resumen":"Enlace simbólico al fichero","enunciado":"<p>Crear un enlace simbólico (llamado enlafich1) al fichero enlace de dir2 endir1.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir1":"dir","~/prueba/dir2":"dir","~/prueba/dir2/enlace":"fich1\n"}},"pasos":[{"tarea":"Crear un enlace simbólico (llamado enlafich1) al fichero enlace de dir2 endir1.","meta":{"enlace":[{"path":"~/prueba/dir1/enlafich1","destino":"~/prueba/dir2/enlace"}]},"ejemplo":"ln -s prueba/dir2/enlace prueba/dir1/enlafich1","explica":"Un enlace simbólico guarda la ruta del fichero de destino.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ln -s prueba/dir2/enlace prueba/dir1/enlafich1"]}]},{"id":"rafa-37","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 37","resumen":"Copiar mediante el enlace","enunciado":"<p>Posicionarse en dir1 y, mediante el enlace creado, copiar el archivo fichl dentro de dir311.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir1":"dir","~/prueba/dir2":"dir","~/prueba/dir2/enlace":"fich1\n","~/prueba/dir1/enlafich1":{"tipo":"link","destino":"~/prueba/dir2/enlace"},"~/prueba/dir3":"dir","~/prueba/dir3/dir31":"dir","~/prueba/dir3/dir31/dir311":"dir"}},"pasos":[{"tarea":"Posicionarse en dir1 y, mediante el enlace creado, copiar el archivo fichl dentro de dir311.","meta":{"existe":"~/prueba/dir3/dir31/dir311/enlafich1"},"ejemplo":"cd prueba/dir1; cp enlafich1 ../dir3/dir31/dir311","explica":"Desde dir1, la ruta relativa lleva al directorio dir311 que cuelga de dir3.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cd prueba/dir1; cp enlafich1 ../dir3/dir31/dir311"]}]},{"id":"rafa-38","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 38","resumen":"Leer mediante el enlace","enunciado":"<p>Seguir en dir1 y, mediante el enlace creado, sacar por pantalla las líneas que tiene el archivo fich1.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~/prueba/dir1","fs":{"~/prueba":"dir","~/prueba/dir1":"dir","~/prueba/dir2":"dir","~/prueba/dir2/enlace":"línea uno\nlínea dos\n","~/prueba/dir1/enlafich1":{"tipo":"link","destino":"~/prueba/dir2/enlace"}}},"pasos":[{"tarea":"Seguir en dir1 y, mediante el enlace creado, sacar por pantalla las líneas que tiene el archivo fich1.","meta":{"muestra":"línea uno"},"ejemplo":"cat enlafich1","explica":"La ruta simbólica permite leer el fichero original.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cat enlafich1"]}]},{"id":"rafa-39","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 39","resumen":"Borrar fich1 de dir2","enunciado":"<p>Borrar el fichero fich1 de dir2</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir2":"dir","~/prueba/dir2/fich1":"fich1\n"}},"pasos":[{"tarea":"Borrar el fichero fich1 de dir2","meta":{"noExiste":"~/prueba/dir2/fich1"},"ejemplo":"rm prueba/dir2/fich1","explica":"Se elimina la entrada indicada con <code>rm</code>.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: rm prueba/dir2/fich1"]}]},{"id":"rafa-40","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 40","resumen":"Limpieza final","enunciado":"<p>Borrar todos los archivos y directorios creados durante los ejercicios.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir1":"dir","~/prueba/dir2":"dir","~/prueba/dir3":"dir"}},"pasos":[{"tarea":"Borrar todos los archivos y directorios creados durante los ejercicios.","meta":{"noExiste":"~/prueba"},"ejemplo":"rm -r prueba","explica":"La opción recursiva borra todo el árbol.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: rm -r prueba"]}]},{"id":"rafa-41","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 41","resumen":"Permisos iniciales","enunciado":"<p>Crear el directorio dir2 y dir3 en el directorio prueba ¿Cuáles son los actuales permisos del directorio dir2?</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir"}},"pasos":[{"tarea":"Crear el directorio dir2 y dir3 en el directorio prueba ¿Cuáles son los actuales permisos del directorio dir2?","meta":{"existe":["~/prueba/dir2","~/prueba/dir3"],"modo":{"~/prueba/dir2":"755"},"muestra":"dir2"},"ejemplo":"mkdir prueba/dir2 prueba/dir3; ls -ld prueba/dir2","explica":"Se crean los dos directorios y <code>ls -ld</code> permite consultar los permisos de dir2.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir prueba/dir2 prueba/dir3; ls -ld prueba/dir2"]}]},{"id":"rafa-42","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 42","resumen":"Quitar escritura","enunciado":"<p>Utilizando la notación simbólica, eliminar todos los permisos de escritura (propietario, grupo, otros) del directorio dir2. .</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir2":{"tipo":"dir","modo":"755"}}},"pasos":[{"tarea":"Utilizando la notación simbólica, eliminar todos los permisos de escritura (propietario, grupo, otros) del directorio dir2. .","meta":{"modo":{"~/prueba/dir2":"555"}},"ejemplo":"chmod a-w prueba/dir2","explica":"La notación simbólica modifica solo los permisos indicados.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: chmod a-w prueba/dir2"]}]},{"id":"rafa-43","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 43","resumen":"Permisos octales","enunciado":"<p>Utilizando la notación octal, eliminar el permiso de lectura del directorio dir2, al resto de los usuarios.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir2":{"tipo":"dir","modo":"555"}}},"pasos":[{"tarea":"Utilizando la notación octal, eliminar el permiso de lectura del directorio dir2, al resto de los usuarios.","meta":{"modo":{"~/prueba/dir2":"551"}},"ejemplo":"chmod 551 prueba/dir2","explica":"El último dígito representa los permisos de otros usuarios.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: chmod 551 prueba/dir2"]}]},{"id":"rafa-44","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 44","resumen":"Comprobar permisos","enunciado":"<p>¿Cuáles son ahora los permisos asociados a dir2?</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir2":{"tipo":"dir","modo":"551"}}},"pasos":[{"tarea":"¿Cuáles son ahora los permisos asociados a dir2?","meta":{"modo":{"~/prueba/dir2":"551"},"muestra":["dir2","dr-xr-x--x"]},"ejemplo":"ls -ld prueba/dir2","explica":"<code>ls -ld</code> muestra los permisos del directorio sin listar su contenido.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ls -ld prueba/dir2"]}]},{"id":"rafa-45","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 45","resumen":"Crear dentro de dir2","enunciado":"<p>Crear bajo dir2, un directorio llamado dir2l.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir2":{"tipo":"dir","modo":"555"}}},"pasos":[{"tarea":"Crear bajo dir2, un directorio llamado dir2l.","meta":{"existe":"~/prueba/dir2/dir2l"},"ejemplo":"mkdir prueba/dir2/dir2l","explica":"Para crear dentro de un directorio hace falta permiso de escritura.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir prueba/dir2/dir2l"]}]},{"id":"rafa-46","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 46","resumen":"Dar escritura y crear","enunciado":"<p>Concederse a sí mismo permiso de escritura en el directorio dir2 e intentar de nuevo el paso anterior.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir2":{"tipo":"dir","modo":"555"}}},"pasos":[{"tarea":"Concederse a sí mismo permiso de escritura en el directorio dir2 e intentar de nuevo el paso anterior.","meta":{"existe":"~/prueba/dir2/dir2l","modo":{"~/prueba/dir2":"755"}},"ejemplo":"chmod u+w prueba/dir2; mkdir prueba/dir2/dir2l","explica":"El operador <code>u+w</code> añade escritura al propietario.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: chmod u+w prueba/dir2; mkdir prueba/dir2/dir2l"]}]},{"id":"rafa-47","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 47","resumen":"Máscara actual","enunciado":"<p>¿Cuáles son los valores por omisión asignados a los archivos?</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"¿Cuáles son los valores por omisión asignados a los archivos?","meta":{"muestra":"022"},"ejemplo":"umask","explica":"<code>umask</code> muestra los permisos que se restan por defecto.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: umask"]}]},{"id":"rafa-48","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 48","resumen":"Cambiar a dir3","enunciado":"<p>Cambiar el directorio actual al directorio dir3. Imprimir su trayectoria completa para verificar el cambio.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir3":"dir"}},"pasos":[{"tarea":"Cambiar el directorio actual al directorio dir3. Imprimir su trayectoria completa para verificar el cambio.","meta":{"cwd":"~/prueba/dir3","muestra":"/home/usuario/prueba/dir3"},"ejemplo":"cd prueba/dir3; pwd","explica":"<code>pwd</code> imprime la ruta absoluta.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cd prueba/dir3; pwd"]}]},{"id":"rafa-49","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 49","resumen":"Permisos de dir3","enunciado":"<p>¿Cuáles son los permisos asignados en su momento a este directorio?</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir3":{"tipo":"dir","modo":"755"}}},"pasos":[{"tarea":"¿Cuáles son los permisos asignados en su momento a este directorio?","meta":{"modo":{"~/prueba/dir3":"755"},"muestra":["dir3","drwxr-xr-x"]},"ejemplo":"ls -ld prueba/dir3","explica":"<code>ls -ld</code> consulta los permisos actuales de dir3.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ls -ld prueba/dir3"]}]},{"id":"rafa-50","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 50","resumen":"Establecer umask","enunciado":"<p>Establecer mediante el comando umask los siguientes valores por omisión: rwxr--r-- para los directorios y rw-r--r-- para los archivos ordinarios.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Establecer mediante el comando umask los siguientes valores por omisión: rwxr--r-- para los directorios y rw-r--r-- para los archivos ordinarios.","meta":{"umask":"022"},"ejemplo":"umask 022","explica":"Con 022 los archivos nuevos quedan normalmente en 644 y los directorios en 755.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: umask 022"]}]},{"id":"rafa-51","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 51","resumen":"Crear cuatro directorios","enunciado":"<p>Crear cuatro nuevos directorios llamados dira, dirb, dirc, y dird bajo el directorio actual.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~/prueba/dir3","fs":{"~/prueba/dir3":"dir"}},"pasos":[{"tarea":"Crear cuatro nuevos directorios llamados dira, dirb, dirc, y dird bajo el directorio actual.","meta":{"existe":["dira","dirb","dirc","dird"],"cwd":"~/prueba/dir3"},"ejemplo":"mkdir dira dirb dirc dird","explica":"Al estar dentro de dir3, las rutas relativas crean las cuatro carpetas allí.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir dira dirb dirc dird"]}]},{"id":"rafa-52","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 52","resumen":"Comprobar permisos nuevos","enunciado":"<p>Comprobar los permisos de acceso de los directorios recién creados para comprobar el funcionamiento del comando umask.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~/prueba/dir3","fs":{"~/prueba/dir3":"dir","~/prueba/dir3/dira":"dir","~/prueba/dir3/dirb":"dir","~/prueba/dir3/dirc":"dir","~/prueba/dir3/dird":"dir"}},"pasos":[{"tarea":"Comprobar los permisos de acceso de los directorios recién creados para comprobar el funcionamiento del comando umask.","meta":{"modo":{"dira":"755","dirb":"755","dirc":"755","dird":"755"},"muestra":"dira"},"ejemplo":"ls -ld dira dirb dirc dird","explica":"<code>ls -ld</code> permite comprobar que la máscara 022 dejó los directorios con modo 755.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ls -ld dira dirb dirc dird"]}]},{"id":"rafa-53","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 53","resumen":"Crear y proteger un fichero","enunciado":"<p>Crear el fichero uno . Quitarle todos los permisos de lectura. Comprobarlo. Intentar borrar dicho fichero.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir"}},"pasos":[{"tarea":"Crear el fichero uno . Quitarle todos los permisos de lectura. Comprobarlo. Intentar borrar dicho fichero.","meta":{"existe":"~/prueba/uno","modo":{"~/prueba/uno":"200"},"muestra":"uno"},"ejemplo":"touch prueba/uno; chmod a-r prueba/uno; ls -l prueba/uno","explica":"Se crea el fichero, se quita la lectura y se comprueba el modo con <code>ls -l</code>.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: touch prueba/uno; chmod a-r prueba/uno; ls -l prueba/uno"]},{"tarea":"Intenta borrar el fichero <code>uno</code>.","meta":{"noExiste":"~/prueba/uno"},"ejemplo":"rm prueba/uno","explica":"<code>rm</code> elimina el fichero indicado.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: rm prueba/uno"]}]},{"id":"rafa-54","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 54","resumen":"Permisos de paso","enunciado":"<p>Quitarle todos los permisos de paso al directorio dir2 y otorgarle todos los demás.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/dir2":{"tipo":"dir","modo":"755"}}},"pasos":[{"tarea":"Quitarle todos los permisos de paso al directorio dir2 y otorgarle todos los demás.","meta":{"modo":{"~/prueba/dir2":"644"}},"ejemplo":"chmod a-x prueba/dir2","explica":"El permiso <code>x</code> de un directorio permite atravesarlo.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: chmod a-x prueba/dir2"]}]},{"id":"rafa-55","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 55","resumen":"Crear carpeta1 y carpeta2","enunciado":"<p>Crear en el directorio propio:El directorio carpeta1 con los tres permisos para el propietario, dentro de él fich1 con lectura y escritura para todos y fich2 con lectura y escritura para el propietario y solo lectura para el resto. El directorio carpeta2 con todos los permisos para el propietario y lectura y ejecución para los del mismo grupo. Dentro file1 con lectura y escritura para el propietario y los del grupo y file2 con los mismos para el propietario y solo lectura para el grupo.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Crear en el directorio propio:El directorio carpeta1 con los tres permisos para el propietario, dentro de él fich1 con lectura y escritura para todos y fich2 con lectura y escritura para el propietario y solo lectura para el resto. El directorio carpeta2 con todos los permisos para el propietario y lectura y ejecución para los del mismo grupo. Dentro file1 con lectura y escritura para el propietario y los del grupo y file2 con los mismos para el propietario y solo lectura para el grupo.","meta":{"existe":["~/carpeta1","~/carpeta2"],"modo":{"~/carpeta1":"700","~/carpeta2":"750"}},"ejemplo":"mkdir -m 700 carpeta1; mkdir -m 750 carpeta2","explica":"La opción <code>-m</code> crea cada directorio con los permisos indicados.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir -m 700 carpeta1; mkdir -m 750 carpeta2"]},{"tarea":"Crea los cuatro ficheros y asigna sus permisos.","meta":{"existe":["~/carpeta1/fich1","~/carpeta1/fich2","~/carpeta2/file1","~/carpeta2/file2"],"modo":{"~/carpeta1/fich1":"666","~/carpeta1/fich2":"644","~/carpeta2/file1":"664","~/carpeta2/file2":"640"}},"ejemplo":"touch carpeta1/fich1 carpeta1/fich2 carpeta2/file1 carpeta2/file2; chmod 666 carpeta1/fich1; chmod 644 carpeta1/fich2; chmod 664 carpeta2/file1; chmod 640 carpeta2/file2","explica":"<code>chmod</code> aplica los permisos que pide el documento a cada fichero.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: touch carpeta1/fich1 carpeta1/fich2 carpeta2/file1 carpeta2/file2; chmod 666 carpeta1/fich1; chmod 644 carpeta1/fich2; chmod 664 carpeta2/file1; chmod 640 carpeta2/file2"]}]},{"id":"rafa-56","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 56","resumen":"Comprobar la estructura","enunciado":"<p>Desde otro usuario probar todas las operaciones que se pueden hacer en los ficheros y directorios creados.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/carpeta1":{"tipo":"dir","modo":"700"},"~/carpeta1/fich1":{"contenido":"fich1\n","modo":"666"},"~/carpeta1/fich2":{"contenido":"fich2\n","modo":"644"},"~/carpeta2":{"tipo":"dir","modo":"750"},"~/carpeta2/file1":{"contenido":"file1\n","modo":"664"},"~/carpeta2/file2":{"contenido":"file2\n","modo":"640"}}},"pasos":[{"tarea":"Desde otro usuario probar todas las operaciones que se pueden hacer en los ficheros y directorios creados.","meta":{"modo":{"~/carpeta1":"700","~/carpeta2":"750","~/carpeta1/fich1":"666","~/carpeta1/fich2":"644","~/carpeta2/file1":"664","~/carpeta2/file2":"640"},"muestra":["carpeta1","fich1","file1"]},"ejemplo":"ls -ld carpeta1 carpeta2; ls -l carpeta1 carpeta2","explica":"La consulta de permisos permite comprobar qué operaciones puede hacer otro usuario en cada entrada.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ls -ld carpeta1 carpeta2; ls -l carpeta1 carpeta2"]}]},{"id":"rafa-57","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 57","resumen":"Crear correo y fuentes","enunciado":"<p>Visualizar la trayectoria completa del directorio actual. Crear dos directorios llamados correo y fuentes debajo del directorio actual.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Visualizar la trayectoria completa del directorio actual. Crear dos directorios llamados correo y fuentes debajo del directorio actual.","meta":{"existe":["~/correo","~/fuentes"],"muestra":"/home/usuario"},"ejemplo":"pwd; mkdir correo fuentes","explica":"Se puede consultar la ruta sin cambiar de carpeta.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: pwd; mkdir correo fuentes"]}]},{"id":"rafa-58","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 58","resumen":"Crear directorios en fuentes","enunciado":"<p>Posicionarse en el directorio fuentes y crear los directorios dir1, dir2, dir3.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/fuentes":"dir"}},"pasos":[{"tarea":"Posicionarse en el directorio fuentes y crear los directorios dir1, dir2, dir3.","meta":{"existe":["~/fuentes/dir1","~/fuentes/dir2","~/fuentes/dir3"],"cwd":"~/fuentes"},"ejemplo":"cd fuentes; mkdir dir1 dir2 dir3","explica":"Las rutas relativas se resuelven desde la carpeta actual.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cd fuentes; mkdir dir1 dir2 dir3"]}]},{"id":"rafa-59","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 59","resumen":"Crear menus sin moverse","enunciado":"<p>Crear el directorio menus bajo correo sin moverse del directorio actual.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~/fuentes","fs":{"~/correo":"dir","~/fuentes":"dir"}},"pasos":[{"tarea":"Crear el directorio menus bajo correo sin moverse del directorio actual.","meta":{"existe":"~/correo/menus","cwd":"~/fuentes"},"ejemplo":"mkdir ../correo/menus","explica":"Una ruta relativa puede apuntar a otra carpeta sin usar <code>cd</code>.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir ../correo/menus"]}]},{"id":"rafa-60","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 60","resumen":"Borrar directorios seleccionados","enunciado":"<p>Posicionarse en el directorio prueba. Borrar los directorios que cuelgan de fuentes que acaben en un número que no sea el 1.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/fuentes":"dir","~/fuentes/dir1":"dir","~/fuentes/dir2":"dir","~/fuentes/dir3":"dir"}},"pasos":[{"tarea":"Posicionarse en el directorio prueba. Borrar los directorios que cuelgan de fuentes que acaben en un número que no sea el 1.","meta":{"cwd":"~/prueba","noExiste":["~/fuentes/dir2","~/fuentes/dir3"],"existe":"~/fuentes/dir1"},"ejemplo":"cd prueba; rm -r ../fuentes/dir2 ../fuentes/dir3","explica":"Primero se entra en prueba y después se eliminan las carpetas de fuentes cuyo número no es 1.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cd prueba; rm -r ../fuentes/dir2 ../fuentes/dir3"]}]},{"id":"rafa-61","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 61","resumen":"Consultar tty2","enunciado":"<p>Ver si existe el archivo tty2 en el directorio dev. En caso de que exista, ver su fecha de creación o actualización.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Ver si existe el archivo tty2 en el directorio dev. En caso de que exista, ver su fecha de creación o actualización.","meta":{"muestra":"tty2"},"ejemplo":"ls -l /dev/tty2","explica":"<code>ls -l</code> confirma que tty2 existe y muestra su fecha de actualización.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ls -l /dev/tty2"]}]},{"id":"rafa-62","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 62","resumen":"Permisos de tty","enunciado":"<p>Ver los permisos que tienen los archivos que empiecen por tt del directorio /dev.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Ver los permisos que tienen los archivos que empiecen por tt del directorio /dev.","meta":{"muestra":"tty"},"ejemplo":"ls -l /dev/tt*","explica":"<code>ls -l</code> muestra los permisos junto al nombre.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ls -l /dev/tt*"]}]},{"id":"rafa-63","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 63","resumen":"Ficheros ordinarios de usr/bin","enunciado":"<p>Visualizar la lista de los archivos ordinarios que están en el directorio /usr/bin.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Visualizar la lista de los archivos ordinarios que están en el directorio /usr/bin.","meta":{"muestra":"/usr/bin/"},"ejemplo":"find /usr/bin -type f","explica":"<code>find -type f</code> selecciona solo ficheros ordinarios.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find /usr/bin -type f"],"aprendizaje":{"comando":"find","opciones":["-type"],"valores":["f"],"pistas":["Piensa en cómo limitar la búsqueda a una ruta.","Revisa el filtro que distingue ficheros y directorios.","Usa la forma general: find [ruta] [filtro]."]}}]},{"id":"rafa-64","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 64","resumen":"Directorios desde la raíz","enunciado":"<p>Visualizar la lista de todos los directorios que cuelgan del raíz.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Visualizar la lista de todos los directorios que cuelgan del raíz.","meta":{"muestra":"/"},"ejemplo":"find / -type d","explica":"<code>find</code> puede recorrer todo el árbol virtual.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find / -type d"],"aprendizaje":{"comando":"find","opciones":["-type"],"valores":["d"],"pistas":["Piensa en cómo distinguir directorios de ficheros.","Revisa la opción que filtra por tipo.","Usa la forma general: find [ruta] [filtro]."]}}]},{"id":"rafa-65","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 65","resumen":"Ficheros del sistema","enunciado":"<p>Visualizar la lista de todos los ficheros que pertenezcan a root.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Visualizar la lista de todos los ficheros que pertenezcan a root.","meta":{"muestra":"/etc/hosts"},"ejemplo":"find / -type f -user root","explica":"<code>-user root</code> filtra los ficheros cuyo propietario es root.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find / -type f -user root"],"aprendizaje":{"comando":"find","opciones":["-type","-user"],"valores":["f","root"],"pistas":["Necesitas combinar un filtro de tipo con uno de propietario.","Revisa las opciones que limitan por tipo y usuario.","Usa la forma general: find [ruta] [filtros]."]}}]},{"id":"rafa-66","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 66","resumen":"Ficheros .h","enunciado":"<p>Visualizar la lista de todos los ficheros .h del directorio /usr/include.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"/usr/include":"dir","/usr/include/stdio.h":"x","/usr/include/stdlib.h":"x"}},"pasos":[{"tarea":"Visualizar la lista de todos los ficheros .h del directorio /usr/include.","meta":{"muestra":"stdio.h"},"ejemplo":"find /usr/include -name \"*.h\"","explica":"El patrón de <code>-name</code> filtra por el nombre.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find /usr/include -name \"*.h\""]}]},{"id":"rafa-67","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 67","resumen":"Comandos ls","enunciado":"<p>Ejecutar todos los comandos que empiecen por ls del directorio /bin.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Ejecutar todos los comandos que empiecen por ls del directorio /bin.","meta":{"muestra":"ls"},"ejemplo":"ls /bin/ls*","explica":"Los comodines seleccionan nombres que empiezan por una cadena.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ls /bin/ls*"]}]},{"id":"rafa-68","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 68","resumen":"Tipos de ficheros","enunciado":"<p>Visualizar de qué tipo son todos y cada uno de ficheros de todo el árbol del sistema propiedad de un usuario conocido.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Visualizar de qué tipo son todos y cada uno de ficheros de todo el árbol del sistema propiedad de un usuario conocido.","meta":{"muestra":["/home/usuario/.bashrc","texto ASCII"]},"ejemplo":"find / -type f -user usuario -exec file {} +","explica":"<code>find</code> selecciona los ficheros del usuario y ejecuta <code>file</code> para mostrar su tipo.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find / -type f -user usuario -exec file {} +"],"aprendizaje":{"comando":"find","opciones":["-type","-user","-exec"],"valores":["f","usuario","file"],"pistas":["Primero selecciona los ficheros del usuario indicado.","Después necesitas ejecutar otro comando sobre cada resultado.","Usa la forma general: find [ruta] [filtros] -exec [comando] {} +."]}}]},{"id":"rafa-69","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 69","resumen":"Directorio con permisos concretos","enunciado":"<p>Crear el directorio uno en el directorio prueba con permiso de escritura y paso para el propietario, de lectura y paso para los usuarios de su mismo grupo y ningún permiso para el resto de usuarios.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir"}},"pasos":[{"tarea":"Crear el directorio uno en el directorio prueba con permiso de escritura y paso para el propietario, de lectura y paso para los usuarios de su mismo grupo y ningún permiso para el resto de usuarios.","meta":{"existe":"~/prueba/uno","modo":{"~/prueba/uno":"350"}},"ejemplo":"mkdir prueba/uno; chmod 350 prueba/uno","explica":"El modo octal permite expresar exactamente cada grupo de permisos.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir prueba/uno; chmod 350 prueba/uno"]}]},{"id":"rafa-70","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 70","resumen":"Crear uno1","enunciado":"<p>Crear el directorio uno1 dentro del directorio creado en el ejercicio anterior con todos lo permisos para el usuario, ninguno para los usuarios del grupo y permiso de escritura para el resto de usuarios.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/uno":{"tipo":"dir","modo":"350"}}},"pasos":[{"tarea":"Crear el directorio uno1 dentro del directorio creado en el ejercicio anterior con todos lo permisos para el usuario, ninguno para los usuarios del grupo y permiso de escritura para el resto de usuarios.","meta":{"existe":"~/prueba/uno/uno1","modo":{"~/prueba/uno/uno1":"702"}},"ejemplo":"mkdir prueba/uno/uno1; chmod 702 prueba/uno/uno1","explica":"El segundo dígito corresponde al grupo.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir prueba/uno/uno1; chmod 702 prueba/uno/uno1"]}]},{"id":"rafa-71","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 71","resumen":"Copiar ficheros seleccionados","enunciado":"<p>Copiar todos los ficheros propiedad de un usuario conocido que acaben en un número en el directorio menus.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/menus":"dir","/home/rafa/Descargas/informe1":"uno\n","/home/rafa/Descargas/informe2":"dos\n"}},"pasos":[{"tarea":"Copiar todos los ficheros propiedad de un usuario conocido que acaben en un número en el directorio menus.","meta":{"existe":["~/menus/informe1","~/menus/informe2"]},"ejemplo":"cp /home/rafa/Descargas/informe[12] menus","explica":"El comodín selecciona todos los ficheros del usuario conocido cuyo nombre acaba en número.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cp /home/rafa/Descargas/informe[12] menus"]}]},{"id":"rafa-72","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 72","resumen":"Usuarios conectados","enunciado":"<p>Visualiza con la orden who la relación de usuarios conectados y sus terminales.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Visualiza con la orden who la relación de usuarios conectados y sus terminales.","meta":{"muestra":"tty1"},"ejemplo":"who","explica":"<code>who</code> muestra usuario y terminal.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: who"]}]},{"id":"rafa-73","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 73","resumen":"Fichero vacío","enunciado":"<p>Crea un archivo de tamaño 0</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Crea un archivo de tamaño 0","meta":{"existe":"~/vacio","contenido":{"~/vacio":""}},"ejemplo":"touch vacio","explica":"<code>touch</code> crea un fichero vacío.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: touch vacio"]}]},{"id":"rafa-74","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 74","resumen":"Guardar usuarios ordenados","enunciado":"<p>Utilizando de entrada la información de los usuarios conectados al sistema, guardar, ordenadas por el campo hora, las líneas correspondientes al usuario que se desee en el archivo persona.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Utilizando de entrada la información de los usuarios conectados al sistema, guardar, ordenadas por el campo hora, las líneas correspondientes al usuario que se desee en el archivo persona.","meta":{"existe":"~/persona"},"ejemplo":"who | sort > persona","explica":"Una tubería pasa la salida de <code>who</code> a <code>sort</code> y la redirección la guarda.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: who | sort > persona"]}]},{"id":"rafa-75","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 75","resumen":"Guardar directorios","enunciado":"<p>Crear el directorio carpeta debajo del directorio PRUEBA. Quitarle todos los permisos de lectura. A continuación, buscar todos los directorios que cuelguen del directorio propio y guardarlos en el archivo direc.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir"}},"pasos":[{"tarea":"Crear el directorio carpeta debajo del directorio PRUEBA. Quitarle todos los permisos de lectura. A continuación, buscar todos los directorios que cuelguen del directorio propio y guardarlos en el archivo direc.","meta":{"existe":["~/prueba/carpeta","~/direc"],"modo":{"~/prueba/carpeta":"333"}},"ejemplo":"mkdir prueba/carpeta; chmod 333 prueba/carpeta; find ~ -type d > direc","explica":"La salida de <code>find</code> se puede guardar con <code>></code>.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: mkdir prueba/carpeta; chmod 333 prueba/carpeta; find ~ -type d > direc"]}]},{"id":"rafa-76","grupo":"Ejercicios de Rafa","nivel":3,"titulo":"Ejercicio 76","resumen":"Guardar errores","enunciado":"<p>Volver a realizar la segunda parte del ejercicio anterior, pero redireccionando los errores al fichero malos. Comprobar la información del fichero malos.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Volver a realizar la segunda parte del ejercicio anterior, pero redireccionando los errores al fichero malos. Comprobar la información del fichero malos.","meta":{"existe":"~/malos","muestra":"No such file"},"ejemplo":"find /noexiste -type d 2> malos; cat malos","explica":"<code>2></code> redirige la salida de error.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find /noexiste -type d 2> malos; cat malos"]}]},{"id":"rafa-77","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 77","resumen":"Añadir ficheros a direc","enunciado":"<p>Añadir al fichero direc la lista de todos los ficheros ordinarios que cuelguen de /etc.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/direc":"inicio\n"}},"pasos":[{"tarea":"Añadir al fichero direc la lista de todos los ficheros ordinarios que cuelguen de /etc.","meta":{"contenido":{"~/direc":"inicio\n/etc/hostname\n/etc/hosts\n/etc/motd\n/etc/passwd\n/etc/rc2.d/README\n/etc/rc2.d/S01cron\n/etc/rc2.d/S20ssh\n/etc/timezone\n"}},"ejemplo":"find /etc -type f >> direc","explica":"<code>find /etc -type f</code> localiza todos los ficheros ordinarios de <code>/etc</code> y <code>&gt;&gt;</code> los añade a <code>direc</code> sin borrar lo anterior.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find /etc -type f >> direc"]}]},{"id":"rafa-78","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 78","resumen":"Buscar nombres con ai","enunciado":"<p>Añadir al archivo nuevalista el/los nombre/s de el/los fichero/s del directorio PRUEBA que contengan en su nombre la cadena \"ai\", añadiendo el posible error al fichero malos.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/prueba":"dir","~/prueba/archivo.txt":"x"}},"pasos":[{"tarea":"Añadir al archivo nuevalista el/los nombre/s de el/los fichero/s del directorio PRUEBA que contengan en su nombre la cadena \"ai\", añadiendo el posible error al fichero malos.","meta":{"existe":["~/nuevalista","~/malos"],"muestra":"No such file"},"ejemplo":"find prueba -name \"*ai*\" > nuevalista; find /noexiste -name \"*ai*\" 2> malos; cat malos","explica":"La salida correcta va a <code>nuevalista</code> y el error de una búsqueda fallida se redirige a <code>malos</code>.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: find prueba -name \"*ai*\" > nuevalista; find /noexiste -name \"*ai*\" 2> malos; cat malos"]}]},{"id":"rafa-79","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 79","resumen":"Medir who","enunciado":"<p>Sacar por pantalla únicamente el tiempo (buscar comando time) que tarda en ejecutarse el comando who.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Sacar por pantalla únicamente el tiempo (buscar comando time) que tarda en ejecutarse el comando who.","meta":{"muestra":"real 0m0.001s"},"ejemplo":"time who","explica":"<code>time</code> muestra el tiempo de ejecución.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: time who"]}]},{"id":"rafa-80","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 80","resumen":"Ordenar procesos","enunciado":"<p>Sacar por pantalla el listado de todos los usuarios conectados ordenados por número de proceso asignado.</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Sacar por pantalla el listado de todos los usuarios conectados ordenados por número de proceso asignado.","meta":{"muestra":"PID"},"ejemplo":"ps | sort -n","explica":"<code>sort -n</code> ordena numéricamente las líneas de <code>ps</code> por su PID.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: ps | sort -n"]}]},{"id":"rafa-81","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 81","resumen":"Contar usuarios","enunciado":"<p>Mostrar cuantos usuarios tiene registrados el sistema</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Mostrar cuantos usuarios tiene registrados el sistema","meta":{"muestra":"2"},"ejemplo":"cut -d : -f 1 /etc/passwd | wc -l","explica":"<code>cut</code> extrae el primer campo de <code>/etc/passwd</code> y <code>wc -l</code> cuenta sus líneas.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cut -d : -f 1 /etc/passwd | wc -l"]}]},{"id":"rafa-82","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 82","resumen":"Contar usuarios bash","enunciado":"<p>Mostrar cuántos usuarios tiene registrados el sistema y que utilizan el intérprete bash</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Mostrar cuántos usuarios tiene registrados el sistema y que utilizan el intérprete bash","meta":{"muestra":"2"},"ejemplo":"grep \"/bin/bash\" /etc/passwd | wc -l","explica":"<code>grep</code> filtra los usuarios que usan bash y <code>wc -l</code> los cuenta.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: grep \"/bin/bash\" /etc/passwd | wc -l"]}]},{"id":"rafa-83","grupo":"Ejercicios de Rafa","nivel":1,"titulo":"Ejercicio 83","resumen":"Contar conectados","enunciado":"<p>Mostrar cuantos usuarios hay conectados</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Mostrar cuantos usuarios hay conectados","meta":{"muestra":"1"},"ejemplo":"users | wc -w","explica":"<code>users</code> muestra los nombres y <code>wc -w</code> los cuenta.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: users | wc -w"]}]},{"id":"rafa-84","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 84","resumen":"Filtrar líneas por L","enunciado":"<p>Mostrar las líneas, de un archivo de texto, empiecen por L (mayúscula o minúscula)</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/texto":"Luna\nmar\nLago\nsol\n"}},"pasos":[{"tarea":"Mostrar las líneas, de un archivo de texto, empiecen por L (mayúscula o minúscula)","meta":{"muestra":"Luna","noMuestra":"mar"},"ejemplo":"grep -i \"^l\" texto","explica":"La opción <code>-i</code> ignora mayúsculas y minúsculas.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: grep -i \"^l\" texto"]}]},{"id":"rafa-85","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 85","resumen":"Contar líneas filtradas","enunciado":"<p>Contar las líneas, del ejemplo anterior</p>","final":"Ejercicio completado.","inicio":{"cwd":"~","fs":{"~/texto":"Luna\nmar\nLago\nsol\n"}},"pasos":[{"tarea":"Contar las líneas, del ejemplo anterior","meta":{"muestra":"2"},"ejemplo":"grep -i \"^l\" texto | wc -l","explica":"La salida de <code>grep</code> se convierte en entrada de <code>wc</code>.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: grep -i \"^l\" texto | wc -l"]}]},{"id":"rafa-86","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 86","resumen":"Extraer usuarios","enunciado":"<p>Extraer los nombres de usuario (primer campo) del sistema</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Extraer los nombres de usuario (primer campo) del sistema","meta":{"muestra":["root","usuario"]},"ejemplo":"cut -d : -f 1 /etc/passwd","explica":"<code>cut -d :</code> extrae el primer campo de cada entrada del sistema.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cut -d : -f 1 /etc/passwd"]}]},{"id":"rafa-87","grupo":"Ejercicios de Rafa","nivel":2,"titulo":"Ejercicio 87","resumen":"Extraer usuario y shell","enunciado":"<p>Extraer los nombres de usuario y el shell que utilizan (último campo)</p>","final":"Ejercicio completado.","inicio":{"cwd":"~"},"pasos":[{"tarea":"Extraer los nombres de usuario y el shell que utilizan (último campo)","meta":{"muestra":["root:/bin/bash","usuario:/bin/bash"]},"ejemplo":"cut -d : -f 1,7 /etc/passwd","explica":"El primer campo es el usuario y el séptimo, el intérprete que utiliza.","pista":["Piensa en el comando que corresponde al objetivo.","Puedes consultar la chuleta de comandos de la terminal.","Prueba: cut -d : -f 1,7 /etc/passwd"]}]},
{
  "id": "examen-t3-01",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "01. Un informe extenso",
  "resumen": "less y consulta de ficheros",
  "enunciado": "<p>El parte de incidencias está almacenado en <code>tema3/parte.txt</code>. Consúltalo desde la terminal usando un paginador en lugar de imprimirlo con <code>cat</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/parte.txt": "PARTE DE INCIDENCIAS\nEquipo: aula 3\nFecha: 14/03/2026\nObservacion: revisar cables\nCIERRE DEL PARTE\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Se abre el fichero con <code>less tema3/parte.txt</code>.",
    "En <code>less</code> puedes avanzar con Espacio, retroceder con <code>b</code> y salir con <code>q</code>."
  ],
  "pasos": [
    {
      "tarea": "Abre <code>tema3/parte.txt</code> con el paginador <code>less</code>.",
      "meta": {
        "muestra": "PARTE DE INCIDENCIAS"
      },
      "pista": [
        "No necesitas modificar el fichero.",
        "Busca un visor que permita avanzar y retroceder por el texto.",
        "Prueba con less tema3/parte.txt."
      ],
      "explica": "<code>less</code> permite examinar un fichero sin modificarlo. En una terminal real se sale pulsando <code>q</code>.",
      "ejemplo": "less tema3/parte.txt"
    }
  ]
},
{
  "id": "examen-t3-02",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "02. Líneas numeradas",
  "resumen": "less -N",
  "enunciado": "<p>Necesitas revisar un procedimiento y localizar rápidamente la línea que te indique un compañero. Muestra el archivo <code>tema3/procedimiento.txt</code> con numeración de líneas, sin cambiar su contenido.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/procedimiento.txt": "ALTA DE EQUIPO\nComprobar red\nInstalar paquetes\nActualizar sistema\nValidar acceso\nCERRAR TAREA\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Usa <code>less -N tema3/procedimiento.txt</code>.",
    "La opción <code>-N</code> es útil para referirse a líneas concretas durante una revisión."
  ],
  "pasos": [
    {
      "tarea": "Consulta el fichero con <code>less</code> y la opción de números de línea.",
      "meta": {
        "muestra": "ALTA DE EQUIPO"
      },
      "pista": [
        "El paginador es less.",
        "La opción para mostrar números de línea es una N mayúscula.",
        "Escribe less -N tema3/procedimiento.txt."
      ],
      "explica": "<code>less -N</code> presenta números de línea en el visor, sin añadirlos al fichero.",
      "ejemplo": "less -N tema3/procedimiento.txt"
    }
  ]
},
{
  "id": "examen-t3-03",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "03. Ir al error",
  "resumen": "less con búsqueda inicial",
  "enunciado": "<p>El fichero <code>tema3/arranque.log</code> contiene una incidencia. Ábrelo con <code>less</code> haciendo que se inicie una búsqueda de la palabra <code>ERROR</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/arranque.log": "INFO Inicio\nINFO Red operativa\nAVISO Espacio bajo\nERROR Disco lleno\nINFO Fin\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "La forma <code>less +/ERROR tema3/arranque.log</code> inicia el visor buscando la primera coincidencia.",
    "Dentro de <code>less</code> puedes repetir la búsqueda con <code>n</code>."
  ],
  "pasos": [
    {
      "tarea": "Abre el registro y busca <code>ERROR</code> desde el inicio.",
      "meta": {
        "muestra": "ERROR Disco lleno"
      },
      "pista": [
        "Puedes iniciar less con una orden ya preparada.",
        "La búsqueda dentro de less se hace con /.",
        "Usa less +/ERROR tema3/arranque.log."
      ],
      "explica": "El argumento <code>+/ERROR</code> indica a <code>less</code> que busque esa cadena al abrir el fichero.",
      "ejemplo": "less +/ERROR tema3/arranque.log"
    }
  ]
},
{
  "id": "examen-t3-04",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "04. Solo errores, con número",
  "resumen": "grep, ^ y -n",
  "enunciado": "<p>Del registro <code>tema3/eventos.log</code> muestra únicamente las líneas que <strong>empiecen</strong> por <code>ERROR:</code>, incluyendo el número de línea original.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/eventos.log": "INFO: inicio\nERROR: disco\nAVISO: temperatura\nERROR: red\nINFO: fin\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -n \"^ERROR:\" tema3/eventos.log</code>."
  ],
  "pasos": [
    {
      "tarea": "Filtra errores de comienzo de línea y numera las coincidencias.",
      "meta": {
        "muestra": [
          "2:ERROR: disco",
          "4:ERROR: red"
        ],
        "noMuestra": "INFO: inicio"
      },
      "pista": [
        "Necesitas grep y el ancla de comienzo de línea.",
        "El ancla de inicio es ^; -n muestra el número de línea.",
        "grep -n \"^ERROR:\" tema3/eventos.log"
      ],
      "explica": "<code>^</code> obliga a que <code>ERROR:</code> aparezca al principio y <code>-n</code> añade el número de línea del archivo.",
      "ejemplo": "grep -n \"^ERROR:\" tema3/eventos.log"
    }
  ]
},
{
  "id": "examen-t3-05",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "05. Ignora las mayúsculas",
  "resumen": "grep -i",
  "enunciado": "<p>En <code>tema3/estados.txt</code> han escrito las incidencias con diferentes mayúsculas. Encuentra todas las líneas que contengan <code>fallo</code> independientemente de cómo esté escrito.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/estados.txt": "FALLO en red\ncorrecto\nfallo en disco\nFaLlO de autenticacion\nrevisado\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -i \"fallo\" tema3/estados.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Busca <code>fallo</code> sin distinguir mayúsculas.",
      "meta": {
        "muestra": [
          "FALLO en red",
          "fallo en disco",
          "FaLlO de autenticacion"
        ],
        "noMuestra": "correcto"
      },
      "pista": [
        "La búsqueda es con grep.",
        "La opción -i ignora mayúsculas y minúsculas.",
        "grep -i \"fallo\" tema3/estados.txt"
      ],
      "explica": "<code>grep -i</code> encuentra las coincidencias sin distinguir la capitalización.",
      "ejemplo": "grep -i \"fallo\" tema3/estados.txt"
    }
  ]
},
{
  "id": "examen-t3-06",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "06. Códigos válidos",
  "resumen": "grep -E y {n}",
  "enunciado": "<p>El archivo <code>tema3/tickets.txt</code> contiene identificadores. Muestra solo los que tienen <strong>exactamente</strong> el formato <code>TKT-</code> seguido de tres dígitos, sin texto adicional.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/tickets.txt": "TKT-001\nTKT-42\nTKT-120\nXTKT-555\nTKT-1000\nTKT-999\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -E \"^TKT-[0-9]{3}$\" tema3/tickets.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Utiliza una expresión regular extendida que valide toda la línea.",
      "meta": {
        "muestra": [
          "TKT-001",
          "TKT-120",
          "TKT-999"
        ],
        "noMuestra": [
          "TKT-42",
          "TKT-1000",
          "XTKT-555"
        ]
      },
      "pista": [
        "Ancla el principio y el final de la línea.",
        "Usa [0-9]{3} para pedir exactamente tres cifras.",
        "grep -E \"^TKT-[0-9]{3}$\" tema3/tickets.txt"
      ],
      "explica": "<code>^</code> y <code>$</code> delimitan toda la línea; <code>{3}</code> obliga a que haya tres dígitos.",
      "ejemplo": "grep -E \"^TKT-[0-9]{3}$\" tema3/tickets.txt"
    }
  ]
},
{
  "id": "examen-t3-07",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "07. Sin comentarios ni vacíos",
  "resumen": "grep -Ev",
  "enunciado": "<p>En <code>tema3/servicios.conf</code> hay comentarios y líneas en blanco. Muestra solo las líneas útiles de configuración, sin modificar el fichero.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/servicios.conf": "# Configuracion\nHOST=servidor1\n\n# Puerto TCP\nPORT=8080\nMODE=produccion\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -Ev \"^(#|$)\" tema3/servicios.conf</code>."
  ],
  "pasos": [
    {
      "tarea": "Excluye a la vez comentarios y líneas vacías.",
      "meta": {
        "muestra": [
          "HOST=servidor1",
          "PORT=8080",
          "MODE=produccion"
        ],
        "noMuestra": "# Configuracion"
      },
      "pista": [
        "Invierte el filtro con -v.",
        "Activa regex extendidas con -E y alternancia con |.",
        "grep -Ev \"^(#|$)\" tema3/servicios.conf"
      ],
      "explica": "<code>-v</code> invierte la selección; <code>^(#|$)</code> coincide con comentarios iniciales o líneas vacías.",
      "ejemplo": "grep -Ev \"^(#|$)\" tema3/servicios.conf"
    }
  ]
},
{
  "id": "examen-t3-08",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "08. Turnos entre semana",
  "resumen": "grep -E, alternancia y días",
  "enunciado": "<p>Dispones de un cuadrante con días abreviados. Extrae exclusivamente los turnos de <strong>lunes a viernes</strong>, dejando fuera sábado y domingo.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/turnos.txt": "lun: manana\nmar: tarde\nmie: manana\njue: tarde\nvie: manana\nsab: guardia\ndom: descanso\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -E \"^(lun|mar|mie|jue|vie):\" tema3/turnos.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Filtra las líneas que empiecen por una abreviatura laboral.",
      "meta": {
        "muestra": [
          "lun: manana",
          "vie: manana"
        ],
        "noMuestra": [
          "sab: guardia",
          "dom: descanso"
        ]
      },
      "pista": [
        "Los días están al principio de cada línea.",
        "Para varias alternativas, usa (opcion1|opcion2) con grep -E.",
        "grep -E \"^(lun|mar|mie|jue|vie):\" tema3/turnos.txt"
      ],
      "explica": "Con <code>grep -E</code> se puede usar <code>|</code> para elegir entre distintas abreviaturas de día.",
      "ejemplo": "grep -E \"^(lun|mar|mie|jue|vie):\" tema3/turnos.txt"
    }
  ]
},
{
  "id": "examen-t3-09",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "09. Palabras completas",
  "resumen": "grep -w",
  "enunciado": "<p>Localiza la palabra aislada <code>red</code> en <code>tema3/etiquetas.txt</code>, pero evita coincidencias dentro de palabras como <code>redes</code> o <code>pared</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/etiquetas.txt": "red caida\nredes disponibles\npared pintada\nreiniciar red\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -w \"red\" tema3/etiquetas.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Muestra solo las líneas que contengan <code>red</code> como palabra completa.",
      "meta": {
        "muestra": [
          "red caida",
          "reiniciar red"
        ],
        "noMuestra": [
          "redes disponibles",
          "pared pintada"
        ]
      },
      "pista": [
        "Busca con grep.",
        "La opción -w obliga a coincidir con una palabra completa.",
        "grep -w \"red\" tema3/etiquetas.txt"
      ],
      "explica": "<code>grep -w</code> evita que una palabra buscada coincida con fragmentos de otra palabra.",
      "ejemplo": "grep -w \"red\" tema3/etiquetas.txt"
    }
  ]
},
{
  "id": "examen-t3-10",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "10. ¿Cuántas incidencias?",
  "resumen": "grep -c",
  "enunciado": "<p>La dirección quiere saber cuántas <strong>líneas</strong> del registro <code>tema3/incidencias.log</code> contienen <code>ERROR</code>. Muestra solo el número, sin las líneas.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/incidencias.log": "INFO inicio\nERROR disco\nERROR red\nAVISO memoria\nERROR acceso\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -c \"ERROR\" tema3/incidencias.log</code>."
  ],
  "pasos": [
    {
      "tarea": "Cuenta las líneas que contienen <code>ERROR</code>.",
      "meta": {
        "salida": "3"
      },
      "pista": [
        "grep puede contar coincidencias por línea.",
        "La opción -c devuelve un único número.",
        "grep -c \"ERROR\" tema3/incidencias.log"
      ],
      "explica": "<code>grep -c</code> cuenta las líneas seleccionadas, no el número total de apariciones de una palabra dentro de una línea.",
      "ejemplo": "grep -c \"ERROR\" tema3/incidencias.log"
    }
  ]
},
{
  "id": "examen-t3-11",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "11. Busca en subdirectorios",
  "resumen": "grep -rn",
  "enunciado": "<p>Los registros se encuentran en subcarpetas de <code>tema3/logs</code>. Localiza todas las apariciones de <code>timeout</code> mostrando también la ruta y el número de línea.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/logs": "dir",
      "~/tema3/logs/web": "dir",
      "~/tema3/logs/db": "dir",
      "~/tema3/logs/web/error.log": "OK\ntimeout en web\n",
      "~/tema3/logs/db/error.log": "timeout db\nOK\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -rn \"timeout\" tema3/logs</code>."
  ],
  "pasos": [
    {
      "tarea": "Busca recursivamente e incluye números de línea.",
      "meta": {
        "muestra": [
          "tema3/logs/web/error.log:2:timeout en web",
          "tema3/logs/db/error.log:1:timeout db"
        ]
      },
      "pista": [
        "Necesitas recorrer todas las subcarpetas.",
        "Las opciones son -r (recursivo) y -n (número de línea).",
        "grep -rn \"timeout\" tema3/logs"
      ],
      "explica": "Con <code>-r</code>, <code>grep</code> recorre directorios; con <code>-n</code> añade la posición del hallazgo.",
      "ejemplo": "grep -rn \"timeout\" tema3/logs"
    }
  ]
},
{
  "id": "examen-t3-12",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "12. Correos bien formados",
  "resumen": "grep -E y clases de caracteres",
  "enunciado": "<p>Filtra <code>tema3/contactos.txt</code> para mostrar direcciones de correo sencillas con el patrón <code>usuario@dominio.extensión</code>. Para este ejercicio se aceptan letras, números, punto, guion y guion bajo en el usuario; letras y números en el dominio y una extensión de 2 a 4 letras.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/contactos.txt": "ana.lopez@aula.es\ncorreo-sin-arroba\nusuario@servidor\nsoporte_2@centro.org\n@centro.es\nana@clase.123\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -E \"^[[:alnum:]_.-]+@[[:alnum:]]+\\.[[:alpha:]]{2,4}$\" tema3/contactos.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Encuentra solo las líneas que cumplan el patrón definido.",
      "meta": {
        "muestra": [
          "ana.lopez@aula.es",
          "soporte_2@centro.org"
        ],
        "noMuestra": [
          "correo-sin-arroba",
          "usuario@servidor",
          "ana@clase.123"
        ]
      },
      "pista": [
        "Necesitas grep -E, con anclas ^ y $.",
        "Para el punto literal utiliza \\.; para las letras puedes usar [:alpha:].",
        "grep -E \"^[[:alnum:]_.-]+@[[:alnum:]]+\\.[[:alpha:]]{2,4}$\" tema3/contactos.txt"
      ],
      "explica": "Las clases POSIX <code>[:alnum:]</code> y <code>[:alpha:]</code> ayudan a construir patrones; <code>\\.</code> significa punto literal.",
      "ejemplo": "grep -E \"^[[:alnum:]_.-]+@[[:alnum:]]+\\.[[:alpha:]]{2,4}$\" tema3/contactos.txt"
    }
  ]
},
{
  "id": "examen-t3-13",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "13. Sustituye una etiqueta",
  "resumen": "sed s///",
  "enunciado": "<p>En <code>tema3/estados.csv</code> aparecen elementos con el estado <code>pendiente</code>. Muestra una versión en pantalla donde ese texto se convierta en <code>revisado</code>, sin editar el archivo.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/estados.csv": "router,pendiente\nswitch,activo\nservidor,pendiente\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed 's/pendiente/revisado/' tema3/estados.csv</code>."
  ],
  "pasos": [
    {
      "tarea": "Sustituye el texto al mostrar el fichero con <code>sed</code>.",
      "meta": {
        "muestra": [
          "router,revisado",
          "servidor,revisado"
        ],
        "noMuestra": "router,pendiente"
      },
      "pista": [
        "Usa sed para transformar la salida.",
        "La forma básica de sustitución es s/antiguo/nuevo/.",
        "sed 's/pendiente/revisado/' tema3/estados.csv"
      ],
      "explica": "<code>sed</code> procesa las líneas y muestra la transformación; sin <code>-i</code> no modifica el archivo.",
      "ejemplo": "sed 's/pendiente/revisado/' tema3/estados.csv"
    }
  ]
},
{
  "id": "examen-t3-14",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "14. Todas las apariciones",
  "resumen": "sed y modificador g",
  "enunciado": "<p>Un exportado usa punto y coma como separador. Transfórmalo para que en la salida aparezcan comas en <strong>todas</strong> las columnas.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/datos.csv": "ana;red;alta\nbea;soporte;baja\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed 's/;/,/g' tema3/datos.csv</code>."
  ],
  "pasos": [
    {
      "tarea": "Cambia todos los <code>;</code> de cada línea por <code>,</code>.",
      "meta": {
        "muestra": [
          "ana,red,alta",
          "bea,soporte,baja"
        ],
        "noMuestra": "ana;red;alta"
      },
      "pista": [
        "La sustitución básica de sed solo cambia la primera coincidencia por línea.",
        "Añade la letra g al final de la sustitución.",
        "sed 's/;/,/g' tema3/datos.csv"
      ],
      "explica": "El modificador <code>g</code> significa global: cambia todas las coincidencias de cada línea.",
      "ejemplo": "sed 's/;/,/g' tema3/datos.csv"
    }
  ]
},
{
  "id": "examen-t3-15",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "15. Muestra un tramo",
  "resumen": "sed -n y direcciones",
  "enunciado": "<p>En <code>tema3/listado.txt</code> hay seis tareas. Muestra únicamente las líneas 2, 3 y 4, sin imprimir el resto.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/listado.txt": "Uno\nDos\nTres\nCuatro\nCinco\nSeis\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed -n '2,4p' tema3/listado.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Imprime solo el rango de líneas del 2 al 4.",
      "meta": {
        "salida": "Dos\nTres\nCuatro"
      },
      "pista": [
        "sed puede seleccionar un rango numérico.",
        "Con -n se desactiva la impresión automática; p imprime lo seleccionado.",
        "sed -n '2,4p' tema3/listado.txt"
      ],
      "explica": "<code>2,4p</code> selecciona las líneas 2 a 4; <code>-n</code> evita imprimir también las demás.",
      "ejemplo": "sed -n '2,4p' tema3/listado.txt"
    }
  ]
},
{
  "id": "examen-t3-16",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "16. Limpia los comentarios",
  "resumen": "sed y comando d",
  "enunciado": "<p>El fichero <code>tema3/config.ini</code> combina comentarios iniciados por <code>#</code> y ajustes. Muestra las líneas de configuración suprimiendo los comentarios, sin tocar el fichero original.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/config.ini": "# Configuracion interna\nHOST=local\n# Fin del bloque\nPORT=22\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed '/^#/d' tema3/config.ini</code>."
  ],
  "pasos": [
    {
      "tarea": "Descarta las líneas que empiezan por <code>#</code>.",
      "meta": {
        "salida": "HOST=local\nPORT=22"
      },
      "pista": [
        "sed permite ejecutar una operación en las líneas que cumplan un patrón.",
        "El comando d elimina las líneas seleccionadas de la salida.",
        "sed '/^#/d' tema3/config.ini"
      ],
      "explica": "<code>/^#/d</code> elimina las líneas que comienzan con <code>#</code> del flujo de salida.",
      "ejemplo": "sed '/^#/d' tema3/config.ini"
    }
  ]
},
{
  "id": "examen-t3-17",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "17. Intercambia dos campos",
  "resumen": "sed -E y grupos capturados",
  "enunciado": "<p>Recibes nombres como <code>apellido,nombre</code> en <code>tema3/personas.csv</code>. Devuélvelos por pantalla en el orden <code>nombre,apellido</code> con una sola expresión de <code>sed</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/personas.csv": "lopez,ana\nperez,juan\nmartin,lucia\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed -E 's/^([^,]+),([^,]+)$/\\2,\\1/' tema3/personas.csv</code>."
  ],
  "pasos": [
    {
      "tarea": "Intercambia los dos campos usando referencias a grupos.",
      "meta": {
        "muestra": [
          "ana,lopez",
          "juan,perez",
          "lucia,martin"
        ],
        "noMuestra": "lopez,ana"
      },
      "pista": [
        "Necesitas capturar los textos a izquierda y derecha de la coma.",
        "Con sed -E puedes usar paréntesis; las capturas se recuperan con \\1 y \\2.",
        "sed -E 's/^([^,]+),([^,]+)$/\\2,\\1/' tema3/personas.csv"
      ],
      "explica": "<code>([^,]+)</code> captura cada campo; en el reemplazo <code>\\2,\\1</code> invierte el orden.",
      "ejemplo": "sed -E 's/^([^,]+),([^,]+)$/\\2,\\1/' tema3/personas.csv"
    }
  ]
},
{
  "id": "examen-t3-18",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "18. Espacios irregulares",
  "resumen": "sed -E y +",
  "enunciado": "<p>Los registros de <code>tema3/registro.txt</code> tienen varios espacios seguidos. Normaliza cada secuencia de espacios a uno solo en la salida.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/registro.txt": "ERROR    disco\nAVISO  temperatura\nINFO     activo\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed -E 's/ +/ /g' tema3/registro.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Reduce cada bloque de espacios repetidos a uno.",
      "meta": {
        "muestra": [
          "ERROR disco",
          "AVISO temperatura",
          "INFO activo"
        ],
        "noMuestra": "ERROR    disco"
      },
      "pista": [
        "La expresión regular necesita detectar uno o más espacios.",
        "Con sed -E, + significa una o más repeticiones; g repite la sustitución.",
        "sed -E 's/ +/ /g' tema3/registro.txt"
      ],
      "explica": "<code> +</code> coincide con grupos de espacios; <code>g</code> sustituye todos los bloques de cada línea.",
      "ejemplo": "sed -E 's/ +/ /g' tema3/registro.txt"
    }
  ]
},
{
  "id": "examen-t3-19",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "19. Corrige el archivo de verdad",
  "resumen": "sed -i y cat",
  "enunciado": "<p>En <code>tema3/maquinas.txt</code> hay máquinas marcadas como <code>INACTIVO</code> cuando deberían figurar como <code>ACTIVO</code>. Esta vez debes <strong>guardar</strong> el cambio en el propio fichero y comprobarlo.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/maquinas.txt": "equipo01 INACTIVO\nequipo02 ACTIVO\nequipo03 INACTIVO\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed -i 's/INACTIVO/ACTIVO/g' tema3/maquinas.txt</code>.",
    "Una posible solución es <code>cat tema3/maquinas.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Sustituye <code>INACTIVO</code> por <code>ACTIVO</code> en el archivo.",
      "meta": {
        "contenido": {
          "~/tema3/maquinas.txt": "equipo01 ACTIVO\nequipo02 ACTIVO\nequipo03 ACTIVO\n"
        }
      },
      "pista": [
        "Esta vez la transformación debe persistir.",
        "sed usa -i para editar el fichero en el sitio.",
        "sed -i 's/INACTIVO/ACTIVO/g' tema3/maquinas.txt"
      ],
      "explica": "<code>sed -i</code> escribe el resultado en el fichero original. En un sistema real conviene hacer una copia antes de editar.",
      "ejemplo": "sed -i 's/INACTIVO/ACTIVO/g' tema3/maquinas.txt"
    },
    {
      "tarea": "Confirma que las tres máquinas aparecen activas.",
      "meta": {
        "muestra": [
          "equipo01 ACTIVO",
          "equipo02 ACTIVO",
          "equipo03 ACTIVO"
        ],
        "noMuestra": "INACTIVO"
      },
      "pista": [
        "El cambio ya se ha aplicado al archivo.",
        "Utiliza un comando que imprima el fichero.",
        "cat tema3/maquinas.txt"
      ],
      "explica": "<code>cat</code> permite comprobar el contenido guardado.",
      "ejemplo": "cat tema3/maquinas.txt"
    }
  ]
},
{
  "id": "examen-t3-20",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "20. Filtra después de transformar",
  "resumen": "sed, grep y tuberías",
  "enunciado": "<p>El archivo <code>tema3/mensajes.log</code> tiene espacios de más. Normaliza los espacios y, de la salida resultante, conserva <strong>solo</strong> los mensajes de error en una única tubería.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/mensajes.log": "ERROR    disco\nINFO     inicio\nERROR  acceso\nAVISO   calor\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>sed -E 's/ +/ /g' tema3/mensajes.log | grep '^ERROR '</code>."
  ],
  "pasos": [
    {
      "tarea": "Conecta <code>sed</code> con <code>grep</code> utilizando <code>|</code>.",
      "meta": {
        "salida": "ERROR disco\nERROR acceso"
      },
      "pista": [
        "Primero normaliza espacios con sed.",
        "Pasa el resultado a grep y filtra los mensajes que empiecen por ERROR.",
        "sed -E 's/ +/ /g' tema3/mensajes.log | grep '^ERROR '"
      ],
      "explica": "La tubería <code>|</code> envía la salida de <code>sed</code> a <code>grep</code> sin necesidad de un fichero temporal.",
      "ejemplo": "sed -E 's/ +/ /g' tema3/mensajes.log | grep '^ERROR '"
    }
  ]
},
{
  "id": "examen-t3-21",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "21. Fecha en formato ISO",
  "resumen": "date +%F",
  "enunciado": "<p>Necesitas mostrar la fecha actual en formato <code>AAAA-MM-DD</code>, por ejemplo <code>2026-03-14</code>. No debe incluirse la hora.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {}
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Con <code>date +%F</code> obtienes la fecha del equipo en formato ISO, sin depender del día en que hagas el ejercicio."
  ],
  "pasos": [
    {
      "tarea": "Muestra la fecha ISO del sistema.",
      "meta": {
        "muestra": {
          "__regexp": "\\d{4}-\\d{2}-\\d{2}",
          "__flags": ""
        }
      },
      "pista": [
        "El comando para obtener la fecha es date.",
        "Los formatos se eligen con el signo + y códigos %.",
        "date +%F"
      ],
      "explica": "<code>%F</code> representa <code>%Y-%m-%d</code>, el formato ISO de fecha.",
      "ejemplo": "date +%F"
    }
  ]
},
{
  "id": "examen-t3-22",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "22. Número del día semanal",
  "resumen": "date +%u",
  "enunciado": "<p>Consulta qué número corresponde al día de la semana actual usando la convención ISO: lunes es <code>1</code> y domingo es <code>7</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {}
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>date +%u</code>."
  ],
  "pasos": [
    {
      "tarea": "Imprime únicamente el número ISO del día de la semana.",
      "meta": {
        "muestra": {
          "__regexp": "^[1-7]$",
          "__flags": ""
        }
      },
      "pista": [
        "Usa date con formato personalizado.",
        "El especificador de día de la semana ISO es %u.",
        "date +%u"
      ],
      "explica": "<code>%u</code> produce un número entre 1 (lunes) y 7 (domingo).",
      "ejemplo": "date +%u"
    }
  ]
},
{
  "id": "examen-t3-23",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "23. ¿Qué día del año es?",
  "resumen": "date +%j",
  "enunciado": "<p>Un sistema de seguimiento numera los días desde el 1 de enero. Obtén el número ordinal del día de hoy, con <strong>tres cifras</strong> (por ejemplo, <code>005</code>).</p>",
  "inicio": {
    "cwd": "~",
    "fs": {}
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>date +%j</code>."
  ],
  "pasos": [
    {
      "tarea": "Muestra el día ordinal del año.",
      "meta": {
        "muestra": {
          "__regexp": "^(00[1-9]|0[1-9][0-9]|[12][0-9]{2}|3[0-5][0-9]|36[0-6])$",
          "__flags": ""
        }
      },
      "pista": [
        "Este dato no es el día del mes.",
        "date tiene un formato especial para el número de día dentro del año: %j.",
        "date +%j"
      ],
      "explica": "Con <code>%j</code> se obtiene el número de día del año, normalmente entre 001 y 365, o 366 en año bisiesto.",
      "ejemplo": "date +%j"
    }
  ]
},
{
  "id": "examen-t3-24",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "24. Retrocede una semana",
  "resumen": "date -d y días relativos",
  "enunciado": "<p>Un ticket se abrió hace exactamente siete días. Obtén la fecha de hace una semana en formato <code>AAAA-MM-DD</code>. Utiliza la sintaxis relativa de GNU <code>date</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {}
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>date -d '7 days ago' +%F</code>."
  ],
  "pasos": [
    {
      "tarea": "Calcula la fecha correspondiente a siete días atrás.",
      "meta": {
        "muestra": {
          "__regexp": "\\d{4}-\\d{2}-\\d{2}",
          "__flags": ""
        }
      },
      "pista": [
        "El comando date puede interpretar expresiones relativas.",
        "Usa -d con 7 days ago y formatea como fecha ISO.",
        "date -d '7 days ago' +%F"
      ],
      "explica": "<code>date -d</code> interpreta fechas en lenguaje natural; <code>7 days ago</code> retrocede siete días.",
      "ejemplo": "date -d '7 days ago' +%F"
    }
  ]
},
{
  "id": "examen-t3-25",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "25. El día de una fecha concreta",
  "resumen": "date -d y %u",
  "enunciado": "<p>Sin mirar un calendario, averigua qué número de día ISO de la semana fue el <code>29/02/2028</code> (lunes = 1, domingo = 7).</p>",
  "inicio": {
    "cwd": "~",
    "fs": {}
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>date -d \"2028-02-29\" +%u</code>."
  ],
  "pasos": [
    {
      "tarea": "Calcula el día semanal de la fecha dada.",
      "meta": {
        "salida": "2"
      },
      "pista": [
        "Introduce una fecha concreta con date -d.",
        "El especificador %u devuelve el día de la semana en formato ISO.",
        "date -d \"2028-02-29\" +%u"
      ],
      "explica": "El 29 de febrero de 2028 cae en martes, de modo que <code>%u</code> devuelve <code>2</code>.",
      "ejemplo": "date -d \"2028-02-29\" +%u"
    }
  ]
},
{
  "id": "examen-t3-26",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "26. Calendario de año bisiesto",
  "resumen": "cal mes año",
  "enunciado": "<p>Comprueba con <code>cal</code> el calendario de <strong>febrero de 2028</strong> y verifica que ese mes tiene día 29.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {}
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>cal 2 2028</code>."
  ],
  "pasos": [
    {
      "tarea": "Muestra el calendario de febrero de 2028.",
      "meta": {
        "muestra": [
          "2028",
          "29"
        ]
      },
      "pista": [
        "El comando cal imprime calendarios.",
        "Acepta mes y año como argumentos numéricos.",
        "cal 2 2028"
      ],
      "explica": "<code>cal 2 2028</code> muestra febrero de 2028, un año bisiesto con 29 días en febrero.",
      "ejemplo": "cal 2 2028"
    }
  ]
},
{
  "id": "examen-t3-27",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "27. El próximo viernes",
  "resumen": "date -d next day",
  "enunciado": "<p>Vas a planificar una revisión para el próximo viernes. Calcula esa fecha con GNU <code>date</code> y preséntala en formato ISO; no introduzcas una fecha fija.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {}
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>date -d 'next Friday' +%F</code>."
  ],
  "pasos": [
    {
      "tarea": "Calcula la fecha del próximo viernes.",
      "meta": {
        "muestra": {
          "__regexp": "\\d{4}-\\d{2}-\\d{2}",
          "__flags": ""
        }
      },
      "pista": [
        "La fecha debe calcularse respecto al día de ejecución.",
        "date -d acepta expresiones como next Friday.",
        "date -d 'next Friday' +%F"
      ],
      "explica": "GNU <code>date -d</code> interpreta la expresión <code>next Friday</code> y con <code>%F</code> imprime el resultado como fecha ISO.",
      "ejemplo": "date -d 'next Friday' +%F"
    }
  ]
},
{
  "id": "examen-t3-28",
  "grupo": "Examen Tema 3",
  "nivel": 1,
  "titulo": "28. Selecciona campos",
  "resumen": "cut con delimitadores",
  "enunciado": "<p>En <code>tema3/cuentas.txt</code> cada fila contiene <code>usuario:grupo:uid</code>. Muestra solo el nombre de usuario y el UID, conservando los dos puntos como separador.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/cuentas.txt": "ana:alumnos:1001\nbea:profes:1002\ncarlos:alumnos:1003\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>cut -d : -f 1,3 tema3/cuentas.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Extrae las columnas 1 y 3 con <code>cut</code>.",
      "meta": {
        "salida": "ana:1001\nbea:1002\ncarlos:1003"
      },
      "pista": [
        "Hay un comando para elegir campos separados por un carácter.",
        "cut utiliza -d para el delimitador y -f para los campos.",
        "cut -d : -f 1,3 tema3/cuentas.txt"
      ],
      "explica": "<code>-d :</code> establece el separador y <code>-f 1,3</code> elige el primer y tercer campo.",
      "ejemplo": "cut -d : -f 1,3 tema3/cuentas.txt"
    }
  ]
},
{
  "id": "examen-t3-29",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "29. Encuentra los logs",
  "resumen": "find, -type y -name",
  "enunciado": "<p>En la estructura de <code>tema3</code> hay ficheros mezclados. Localiza recursivamente solo los archivos cuyo nombre termine en <code>.log</code>, excluyendo carpetas y ficheros de texto.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/logs": "dir",
      "~/tema3/notas": "dir",
      "~/tema3/logs/web.log": "a\n",
      "~/tema3/logs/db.log": "b\n",
      "~/tema3/notas/leeme.txt": "texto\n",
      "~/tema3/logs/archivo.log.bak": "c\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>find tema3 -type f -name '*.log'</code>."
  ],
  "pasos": [
    {
      "tarea": "Encuentra únicamente archivos terminados en <code>.log</code>.",
      "meta": {
        "muestra": [
          "tema3/logs/web.log",
          "tema3/logs/db.log"
        ],
        "noMuestra": [
          "tema3/notas/leeme.txt",
          "tema3/logs/archivo.log.bak"
        ]
      },
      "pista": [
        "find puede recorrer todas las subcarpetas.",
        "Combina -type f con -name y un patrón entre comillas.",
        "find tema3 -type f -name '*.log'"
      ],
      "explica": "<code>find</code> evalúa atributos de ficheros; el comodín <code>*.log</code> está entre comillas para que lo interprete <code>find</code>, no la shell.",
      "ejemplo": "find tema3 -type f -name '*.log'"
    }
  ]
},
{
  "id": "examen-t3-30",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "30. Listado sin duplicados",
  "resumen": "cut, sort y uniq",
  "enunciado": "<p>El fichero <code>tema3/avisos.csv</code> contiene <code>servicio,estado</code>. Obtén los nombres de los servicios con algún registro, sin duplicados y por orden alfabético.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/avisos.csv": "web,ok\ndb,error\nweb,error\nftp,ok\ndb,ok\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>cut -d , -f 1 tema3/avisos.csv | sort -u</code>."
  ],
  "pasos": [
    {
      "tarea": "Extrae los servicios y elimina repeticiones mediante una tubería.",
      "meta": {
        "salida": "db\nftp\nweb"
      },
      "pista": [
        "Primero extrae la primera columna con cut.",
        "sort -u ordena y elimina duplicados.",
        "cut -d , -f 1 tema3/avisos.csv | sort -u"
      ],
      "explica": "<code>cut</code> extrae nombres y <code>sort -u</code> ordena y elimina las líneas repetidas.",
      "ejemplo": "cut -d , -f 1 tema3/avisos.csv | sort -u"
    }
  ]
},
{
  "id": "examen-t3-31",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "31. Últimas incidencias",
  "resumen": "tail, grep y tuberías",
  "enunciado": "<p>El registro <code>tema3/actual.log</code> es largo. Analiza solo sus últimas tres líneas y muestra únicamente las que empiezan por <code>ERROR</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/actual.log": "ERROR antiguo\nINFO inicio\nAVISO bajo\nERROR reciente1\nINFO ok\nERROR reciente2\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>tail -n 3 tema3/actual.log | grep \"^ERROR\"</code>."
  ],
  "pasos": [
    {
      "tarea": "Filtra errores de las tres últimas líneas.",
      "meta": {
        "salida": "ERROR reciente1\nERROR reciente2"
      },
      "pista": [
        "No debes examinar todo el fichero.",
        "tail -n 3 extrae las últimas líneas; después aplica grep.",
        "tail -n 3 tema3/actual.log | grep \"^ERROR\""
      ],
      "explica": "La tubería aplica <code>grep</code> únicamente al resultado de <code>tail -n 3</code>.",
      "ejemplo": "tail -n 3 tema3/actual.log | grep \"^ERROR\""
    }
  ]
},
{
  "id": "examen-t3-32",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "32. Permisos mínimos",
  "resumen": "chmod y ls -l",
  "enunciado": "<p>El archivo <code>tema3/credenciales.txt</code> tiene información delicada. Ajusta sus permisos a <code>rw-r-----</code>, es decir, <code>640</code> en octal, y comprueba el resultado.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/credenciales.txt": {
        "contenido": "clave de laboratorio\n",
        "modo": "644"
      }
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>chmod 640 tema3/credenciales.txt</code>.",
    "Una posible solución es <code>ls -l tema3/credenciales.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Asigna los permisos octales 640.",
      "meta": {
        "modo": {
          "~/tema3/credenciales.txt": "640"
        }
      },
      "pista": [
        "Usa chmod para cambiar los permisos.",
        "6=lectura+escritura, 4=lectura y 0=ninguno.",
        "chmod 640 tema3/credenciales.txt"
      ],
      "explica": "<code>640</code> permite leer y escribir al propietario, leer al grupo y no concede permisos a otros.",
      "ejemplo": "chmod 640 tema3/credenciales.txt"
    },
    {
      "tarea": "Comprueba los permisos con un listado largo.",
      "meta": {
        "muestra": "rw-r-----"
      },
      "pista": [
        "ls permite mostrar permisos.",
        "La opción -l activa el formato largo.",
        "ls -l tema3/credenciales.txt"
      ],
      "explica": "<code>ls -l</code> presenta los permisos en formato simbólico.",
      "ejemplo": "ls -l tema3/credenciales.txt"
    }
  ]
},
{
  "id": "examen-t3-33",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "33. Respaldo de registros",
  "resumen": "mkdir -p, cp y glob",
  "enunciado": "<p>Hay dos ficheros <code>.log</code> en <code>tema3</code>. Crea la carpeta <code>tema3/respaldo</code> y copia dentro todos los <code>.log</code> del directorio principal sin mover los originales.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/web.log": "web\n",
      "~/tema3/db.log": "db\n",
      "~/tema3/notas.txt": "notas\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>mkdir -p tema3/respaldo</code>.",
    "Una posible solución es <code>cp tema3/*.log tema3/respaldo/</code>."
  ],
  "pasos": [
    {
      "tarea": "Crea el directorio que guardará las copias.",
      "meta": {
        "existe": "~/tema3/respaldo"
      },
      "pista": [
        "Necesitas un directorio nuevo.",
        "mkdir -p crea directorios si no existen.",
        "mkdir -p tema3/respaldo"
      ],
      "explica": "<code>mkdir -p</code> prepara la carpeta de destino.",
      "ejemplo": "mkdir -p tema3/respaldo"
    },
    {
      "tarea": "Copia los archivos <code>.log</code> al respaldo.",
      "meta": {
        "existe": [
          "~/tema3/respaldo/web.log",
          "~/tema3/respaldo/db.log"
        ],
        "noExiste": "~/tema3/respaldo/notas.txt"
      },
      "pista": [
        "Copia los ficheros, no los muevas.",
        "El patrón *.log selecciona solo los nombres con esa extensión.",
        "cp tema3/*.log tema3/respaldo/"
      ],
      "explica": "<code>cp</code> mantiene los originales; el comodín <code>*.log</code> se expande en los dos archivos correspondientes.",
      "ejemplo": "cp tema3/*.log tema3/respaldo/"
    }
  ]
},
{
  "id": "examen-t3-34",
  "grupo": "Examen Tema 3",
  "nivel": 2,
  "titulo": "34. Hay un fichero oculto",
  "resumen": "ls -a y grep",
  "enunciado": "<p>Una carpeta tiene una configuración oculta llamada <code>.config</code>. Muestra su nombre desde la terminal; con un <code>ls</code> normal puede pasar inadvertido.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/.config": "PUERTO=2222\n",
      "~/tema3/publico.txt": "datos\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>ls -a tema3</code>."
  ],
  "pasos": [
    {
      "tarea": "Lista los elementos ocultos de <code>tema3</code>.",
      "meta": {
        "muestra": [
          ".config",
          "publico.txt"
        ]
      },
      "pista": [
        "Los nombres que empiezan por punto se consideran ocultos.",
        "ls tiene una opción para mostrar todos los elementos, incluidos los ocultos.",
        "ls -a tema3"
      ],
      "explica": "<code>ls -a</code> incluye los nombres que empiezan por un punto, como <code>.config</code>.",
      "ejemplo": "ls -a tema3"
    }
  ]
},
{
  "id": "examen-t3-35",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "35. Guardar el filtrado",
  "resumen": "grep, redirección y wc",
  "enunciado": "<p>Debes generar un informe <code>tema3/errores.txt</code> a partir de <code>tema3/servicio.log</code>. Guarda en él solo las líneas que empiezan por <code>ERROR</code> y después comprueba el número de líneas guardadas.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/servicio.log": "INFO inicio\nERROR disco\nAVISO espacio\nERROR acceso\nINFO fin\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep \"^ERROR\" tema3/servicio.log &gt; tema3/errores.txt</code>.",
    "Una posible solución es <code>wc -l &lt; tema3/errores.txt</code>."
  ],
  "pasos": [
    {
      "tarea": "Filtra los errores y guárdalos en un fichero nuevo.",
      "meta": {
        "contenido": {
          "~/tema3/errores.txt": "ERROR disco\nERROR acceso\n"
        }
      },
      "pista": [
        "Necesitas encontrar líneas por patrón y guardar la salida.",
        "grep \"^ERROR\" selecciona las líneas; > redirige la salida a un fichero.",
        "grep \"^ERROR\" tema3/servicio.log > tema3/errores.txt"
      ],
      "explica": "<code>></code> escribe la salida filtrada en un fichero; si ya existía, sobrescribe su contenido.",
      "ejemplo": "grep \"^ERROR\" tema3/servicio.log > tema3/errores.txt"
    },
    {
      "tarea": "Cuenta cuántas líneas tiene el informe.",
      "meta": {
        "salida": "2"
      },
      "pista": [
        "El comando wc cuenta líneas con -l.",
        "Redirige el fichero hacia su entrada con < para obtener solo el número.",
        "wc -l < tema3/errores.txt"
      ],
      "explica": "<code>wc -l &lt; fichero</code> muestra el número de líneas sin añadir el nombre del fichero.",
      "ejemplo": "wc -l < tema3/errores.txt"
    }
  ]
},
{
  "id": "examen-t3-36",
  "grupo": "Examen Tema 3",
  "nivel": 3,
  "titulo": "36. Mini-reto: depurar un inventario",
  "resumen": "grep -E, cut, sort y sed",
  "enunciado": "<p>En <code>tema3/inventario.csv</code> cada línea tiene el formato <code>equipo:estado:grupo</code>. Obtén los <strong>grupos</strong> de los equipos cuyo estado sea <code>ERROR</code>, sin duplicados y en orden alfabético. Después genera una versión en pantalla donde se sustituya <code>ERROR</code> por <code>REVISAR</code>, sin editar el archivo.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/tema3": "dir",
      "~/tema3/inventario.csv": "pc01:OK:aula1\npc02:ERROR:aula2\npc03:ERROR:aula1\npc04:OK:aula3\npc05:ERROR:aula2\n"
    }
  },
  "final": "Actividad completada. Has practicado el comando y comprobado el resultado.",
  "solucion": [
    "Una posible solución es <code>grep -E '^[^:]+:ERROR:' tema3/inventario.csv | cut -d: -f3 | sort -u</code>.",
    "Una posible solución es <code>sed 's/:ERROR:/:REVISAR:/g' tema3/inventario.csv</code>."
  ],
  "pasos": [
    {
      "tarea": "Extrae los grupos afectados, ordenados y sin duplicados.",
      "meta": {
        "salida": "aula1\naula2"
      },
      "pista": [
        "Filtra solo los registros cuyo segundo campo sea ERROR.",
        "Luego usa cut para obtener el tercer campo y sort -u para ordenarlo y quitar duplicados.",
        "grep -E '^[^:]+:ERROR:' tema3/inventario.csv | cut -d: -f3 | sort -u"
      ],
      "explica": "Se encadenan tres herramientas: <code>grep -E</code> selecciona registros, <code>cut</code> extrae grupos y <code>sort -u</code> los deduplica.",
      "ejemplo": "grep -E '^[^:]+:ERROR:' tema3/inventario.csv | cut -d: -f3 | sort -u"
    },
    {
      "tarea": "Muestra el inventario transformado, sin guardarlo.",
      "meta": {
        "muestra": [
          "pc02:REVISAR:aula2",
          "pc03:REVISAR:aula1"
        ],
        "noMuestra": "pc02:ERROR:aula2"
      },
      "pista": [
        "Ahora utiliza sed para hacer una sustitución.",
        "Sustituye :ERROR: por :REVISAR: sin la opción -i.",
        "sed 's/:ERROR:/:REVISAR:/g' tema3/inventario.csv"
      ],
      "explica": "Sin <code>-i</code>, <code>sed</code> solo transforma la salida, mientras el fichero original permanece intacto.",
      "ejemplo": "sed 's/:ERROR:/:REVISAR:/g' tema3/inventario.csv"
    }
  ]
},

/* Practica Examen 2 */
{
  "id": "practica-examen-2-01",
  "grupo": "Practica Examen 2",
  "nivel": 1,
  "titulo": "01. Leer un manual",
  "resumen": "less -N",
  "enunciado": "<p>Trabaja con <code>practica2/manual.txt</code>. Abre el manual con un paginador y activa la numeración de líneas.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/manual.txt": "MANUAL DEL AULA\nInventario de material\nReserva de espacios\nPréstamo de equipos\nDevolución de llaves\nCierre del aula\n"
    }
  },
  "final": "La opción <code>-N</code> muestra los números en el visor. En una terminal real, pulsa <code>q</code> para salir.",
  "solucion": [
    "<code>less -N practica2/manual.txt</code>. La opción <code>-N</code> muestra los números en el visor. En una terminal real, pulsa <code>q</code> para salir."
  ],
  "pasos": [
    {
      "tarea": "Abre el manual con <code>less</code> y muestra los números de línea.",
      "meta": {
        "muestra": "MANUAL DEL AULA"
      },
      "pista": [
        "Usa el paginador less.",
        "La opción de numeración es -N, con N mayúscula.",
        "less -N practica2/manual.txt"
      ],
      "explica": "La opción <code>-N</code> muestra los números en el visor. En una terminal real, pulsa <code>q</code> para salir.",
      "ejemplo": "less -N practica2/manual.txt"
    }
  ]
},
{
  "id": "practica-examen-2-02",
  "grupo": "Practica Examen 2",
  "nivel": 1,
  "titulo": "02. Extensiones exactas",
  "resumen": "grep, punto literal y $",
  "enunciado": "<p>Trabaja con <code>practica2/ficheros.txt</code>. El listado incluye copias y nombres parecidos. Muestra únicamente los nombres que terminan en <code>.txt</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/ficheros.txt": "apuntes.txt\napuntes.txt.bak\ninventario-txt\ndiario.txt\nnotasTXT\nlista.csv\n"
    }
  },
  "final": "<code>[.]</code> representa un punto literal y <code>$</code> sitúa la extensión al final de la línea.",
  "solucion": [
    "<code>grep '[.]txt$' practica2/ficheros.txt</code>. <code>[.]</code> representa un punto literal y <code>$</code> sitúa la extensión al final de la línea."
  ],
  "pasos": [
    {
      "tarea": "Filtra los nombres que terminan exactamente en <code>.txt</code>.",
      "meta": {
        "salida": "apuntes.txt\ndiario.txt"
      },
      "pista": [
        "El punto debe coincidir literalmente.",
        "Usa [.] para el punto y $ para el final de línea.",
        "grep '[.]txt$' practica2/ficheros.txt"
      ],
      "explica": "<code>[.]</code> representa un punto literal y <code>$</code> sitúa la extensión al final de la línea.",
      "ejemplo": "grep '[.]txt$' practica2/ficheros.txt"
    }
  ]
},
{
  "id": "practica-examen-2-03",
  "grupo": "Practica Examen 2",
  "nivel": 2,
  "titulo": "03. Etiquetas con separador opcional",
  "resumen": "grep -E y ?",
  "enunciado": "<p>Trabaja con <code>practica2/equipos.txt</code>. Selecciona las etiquetas formadas por <code>PC</code>, un guion opcional y exactamente dos dígitos.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/equipos.txt": "PC-07\nPC08\nPC--09\nXPC-10\nPC-111\nPC-4\nPC-00\n"
    }
  },
  "final": "<code>-?</code> hace que el guion sea opcional y <code>[0-9]{2}</code> exige dos dígitos. Las anclas abarcan la línea completa.",
  "solucion": [
    "<code>grep -E '^PC-?[0-9]{2}$' practica2/equipos.txt</code>. <code>-?</code> hace que el guion sea opcional y <code>[0-9]{2}</code> exige dos dígitos. Las anclas abarcan la línea completa."
  ],
  "pasos": [
    {
      "tarea": "Muestra las etiquetas válidas en el orden del fichero.",
      "meta": {
        "salida": "PC-07\nPC08\nPC-00"
      },
      "pista": [
        "El guion puede aparecer cero o una vez.",
        "Con -E puedes escribir -? y [0-9]{2}.",
        "grep -E '^PC-?[0-9]{2}$' practica2/equipos.txt"
      ],
      "explica": "<code>-?</code> hace que el guion sea opcional y <code>[0-9]{2}</code> exige dos dígitos. Las anclas abarcan la línea completa.",
      "ejemplo": "grep -E '^PC-?[0-9]{2}$' practica2/equipos.txt"
    }
  ]
},
{
  "id": "practica-examen-2-04",
  "grupo": "Practica Examen 2",
  "nivel": 2,
  "titulo": "04. Avisos de dos niveles",
  "resumen": "grep -En y alternancia",
  "enunciado": "<p>Trabaja con <code>practica2/alertas.log</code>. Selecciona las líneas que empiezan por <code>AVISO:</code> o <code>CRITICO:</code> e indica sus números de línea.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/alertas.log": "INFO: inicio\nAVISO: batería baja\nINFO: texto CRITICO: simulado\nCRITICO: sensor fuera de rango\nAVISOS: resumen\nAVISO: puerta abierta\n"
    }
  },
  "final": "<code>^</code> se aplica a ambas alternativas porque están agrupadas. <code>-n</code> añade el número de línea.",
  "solucion": [
    "<code>grep -En '^(AVISO|CRITICO):' practica2/alertas.log</code>. <code>^</code> se aplica a ambas alternativas porque están agrupadas. <code>-n</code> añade el número de línea."
  ],
  "pasos": [
    {
      "tarea": "Muestra los dos niveles pedidos con su número de línea.",
      "meta": {
        "salida": "2:AVISO: batería baja\n4:CRITICO: sensor fuera de rango\n6:AVISO: puerta abierta"
      },
      "pista": [
        "Las dos alternativas comparten el inicio de línea y los dos puntos.",
        "Agrupa (AVISO|CRITICO) y usa -n para numerar.",
        "grep -En '^(AVISO|CRITICO):' practica2/alertas.log"
      ],
      "explica": "<code>^</code> se aplica a ambas alternativas porque están agrupadas. <code>-n</code> añade el número de línea.",
      "ejemplo": "grep -En '^(AVISO|CRITICO):' practica2/alertas.log"
    }
  ]
},
{
  "id": "practica-examen-2-05",
  "grupo": "Practica Examen 2",
  "nivel": 2,
  "titulo": "05. Limpiar una configuración",
  "resumen": "grep -Ev y espacios opcionales",
  "enunciado": "<p>Trabaja con <code>practica2/aula.conf</code>. Muestra las líneas útiles. Excluye las líneas vacías, las que contienen únicamente espacios y los comentarios que empiezan por <code>#</code> tras cero o más espacios.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/aula.conf": "# Ajustes\nAULA=2\n   # Ajustes antiguos\n\n   \nTURNO=tarde\nCOLOR=#ddeeff\n"
    }
  },
  "final": "<code>^ *</code> permite espacios al principio y <code>(#|$)</code> detecta un comentario o el fin de la línea. <code>-v</code> conserva el resto.",
  "solucion": [
    "<code>grep -Ev '^ *(#|$)' practica2/aula.conf</code>. <code>^ *</code> permite espacios al principio y <code>(#|$)</code> detecta un comentario o el fin de la línea. <code>-v</code> conserva el resto."
  ],
  "pasos": [
    {
      "tarea": "Invierte la búsqueda para conservar únicamente las líneas útiles.",
      "meta": {
        "salida": "AULA=2\nTURNO=tarde\nCOLOR=#ddeeff"
      },
      "pista": [
        "Una alternativa termina la línea y la otra encuentra el comienzo de un comentario.",
        "Tras ^ y los espacios opcionales, agrupa (#|$).",
        "grep -Ev '^ *(#|$)' practica2/aula.conf"
      ],
      "explica": "<code>^ *</code> permite espacios al principio y <code>(#|$)</code> detecta un comentario o el fin de la línea. <code>-v</code> conserva el resto.",
      "ejemplo": "grep -Ev '^ *(#|$)' practica2/aula.conf"
    }
  ]
},
{
  "id": "practica-examen-2-06",
  "grupo": "Practica Examen 2",
  "nivel": 2,
  "titulo": "06. Contar reservas confirmadas",
  "resumen": "grep -Ec, {n,m} y anclas",
  "enunciado": "<p>Trabaja con <code>practica2/reservas.txt</code>. Cuenta las líneas cuyo formato completo sea <code>R-</code>, de dos a cuatro dígitos, y el sufijo <code>:OK</code>.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/reservas.txt": "R-14:OK\nR-999:OK\nR-9:OK\nR-1030:PEND\nR-5100:OK\nR-51000:OK\nR-18:OK extra\nXR-21:OK\n"
    }
  },
  "final": "<code>{2,4}</code> acepta de dos a cuatro repeticiones y <code>-c</code> cuenta las líneas seleccionadas.",
  "solucion": [
    "<code>grep -Ec '^R-[0-9]{2,4}:OK$' practica2/reservas.txt</code>. <code>{2,4}</code> acepta de dos a cuatro repeticiones y <code>-c</code> cuenta las líneas seleccionadas."
  ],
  "pasos": [
    {
      "tarea": "Da el número de reservas que cumplen la condición.",
      "meta": {
        "salida": "3"
      },
      "pista": [
        "El intervalo limita cuántos dígitos se admiten.",
        "Usa [0-9]{2,4} con -E y cuenta con -c.",
        "grep -Ec '^R-[0-9]{2,4}:OK$' practica2/reservas.txt"
      ],
      "explica": "<code>{2,4}</code> acepta de dos a cuatro repeticiones y <code>-c</code> cuenta las líneas seleccionadas.",
      "ejemplo": "grep -Ec '^R-[0-9]{2,4}:OK$' practica2/reservas.txt"
    }
  ]
},
{
  "id": "practica-examen-2-07",
  "grupo": "Practica Examen 2",
  "nivel": 2,
  "titulo": "07. Buscar el comienzo de una sección",
  "resumen": "less +/ y ^",
  "enunciado": "<p>Trabaja con <code>practica2/guia.txt</code>. Abre el fichero directamente en la búsqueda del encabezado <code>CAPITULO-2</code>. Hay una referencia a ese capítulo antes del encabezado.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/guia.txt": "GUIA DE PRÉSTAMOS\nConsulta CAPITULO-2 para devoluciones\nCAPITULO-1: reservas\nIndica tu número de aula\nCAPITULO-2: devoluciones\nEntrega las llaves en conserjería\n"
    }
  },
  "final": "<code>+/</code> ejecuta una búsqueda al abrir el visor. <code>^</code> limita la coincidencia al comienzo de línea. En una terminal real, <code>n</code> busca la siguiente coincidencia.",
  "solucion": [
    "<code>less '+/^CAPITULO-2:' practica2/guia.txt</code>. <code>+/</code> ejecuta una búsqueda al abrir el visor. <code>^</code> limita la coincidencia al comienzo de línea. En una terminal real, <code>n</code> busca la siguiente coincidencia."
  ],
  "pasos": [
    {
      "tarea": "Abre <code>less</code> con una búsqueda que reconozca el encabezado al inicio de una línea.",
      "meta": {
        "muestra": "CAPITULO-2: devoluciones"
      },
      "pista": [
        "Usa +/ para lanzar una búsqueda al abrir less.",
        "Empieza el patrón por ^ y conserva los dos puntos del encabezado.",
        "less '+/^CAPITULO-2:' practica2/guia.txt"
      ],
      "explica": "<code>+/</code> ejecuta una búsqueda al abrir el visor. <code>^</code> limita la coincidencia al comienzo de línea. En una terminal real, <code>n</code> busca la siguiente coincidencia.",
      "ejemplo": "less '+/^CAPITULO-2:' practica2/guia.txt"
    }
  ]
},
{
  "id": "practica-examen-2-08",
  "grupo": "Practica Examen 2",
  "nivel": 2,
  "titulo": "08. Quitar marcas al final",
  "resumen": "sed, s/// y $",
  "enunciado": "<p>Trabaja con <code>practica2/copias.txt</code>. Elimina de la salida el sufijo <code>.bak</code> de los nombres que lo tengan al final. Conserva las apariciones en otras posiciones.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/copias.txt": "inventario.csv.bak\nmapa.bak.txt\nnotasXbak\nparte.bak\nacta.txt\n"
    }
  },
  "final": "<code>s/[.]bak$//</code> sustituye el sufijo por texto vacío. <code>sed</code> imprime el listado resultante.",
  "solucion": [
    "<code>sed 's/[.]bak$//' practica2/copias.txt</code>. <code>s/[.]bak$//</code> sustituye el sufijo por texto vacío. <code>sed</code> imprime el listado resultante."
  ],
  "pasos": [
    {
      "tarea": "Muestra el listado tras quitar el sufijo <code>.bak</code>.",
      "meta": {
        "salida": "inventario.csv\nmapa.bak.txt\nnotasXbak\nparte\nacta.txt"
      },
      "pista": [
        "El texto de reemplazo queda vacío.",
        "Combina el punto literal [.] con el ancla $.",
        "sed 's/[.]bak$//' practica2/copias.txt"
      ],
      "explica": "<code>s/[.]bak$//</code> sustituye el sufijo por texto vacío. <code>sed</code> imprime el listado resultante.",
      "ejemplo": "sed 's/[.]bak$//' practica2/copias.txt"
    }
  ]
},
{
  "id": "practica-examen-2-09",
  "grupo": "Practica Examen 2",
  "nivel": 3,
  "titulo": "09. Enmascarar códigos de bandeja",
  "resumen": "sed -E, {n} y g",
  "enunciado": "<p>Trabaja con <code>practica2/bandeja.txt</code>. Sustituye en la salida cada código independiente con el formato <code>ID-</code> seguido de tres dígitos por la etiqueta <code>OCULTO</code>. Una línea puede contener varios códigos.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/bandeja.txt": "Entrada ID-321 y salida ID-807\nReferencia ID-9\nTurno con ID-054\nID-1234 y XID-321\n"
    }
  },
  "final": "<code>\\b</code> delimita el código. <code>g</code> procesa todas las coincidencias de cada línea.",
  "solucion": [
    "<code>sed -E 's/\\bID-[0-9]{3}\\b/OCULTO/g' practica2/bandeja.txt</code>. <code>\\b</code> delimita el código. <code>g</code> procesa todas las coincidencias de cada línea."
  ],
  "pasos": [
    {
      "tarea": "Transforma todas las coincidencias de cada línea.",
      "meta": {
        "salida": "Entrada OCULTO y salida OCULTO\nReferencia ID-9\nTurno con OCULTO\nID-1234 y XID-321"
      },
      "pista": [
        "Usa [0-9]{3} y límites de palabra \\b para que el código quede separado.",
        "Añade g para repetir la sustitución dentro de cada línea.",
        "sed -E 's/\\bID-[0-9]{3}\\b/OCULTO/g' practica2/bandeja.txt"
      ],
      "explica": "<code>\\b</code> delimita el código. <code>g</code> procesa todas las coincidencias de cada línea.",
      "ejemplo": "sed -E 's/\\bID-[0-9]{3}\\b/OCULTO/g' practica2/bandeja.txt"
    }
  ]
},
{
  "id": "practica-examen-2-10",
  "grupo": "Practica Examen 2",
  "nivel": 3,
  "titulo": "10. Reordenar fechas",
  "resumen": "sed -E, capturas y referencias",
  "enunciado": "<p>Trabaja con <code>practica2/fechas.txt</code>. Cambia las líneas que tengan el formato <code>DD-MM-AAAA</code> a <code>AAAA-MM-DD</code>. Conserva el encabezado y el resto de líneas. Comprueba el formato por número de dígitos.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/fechas.txt": "FECHAS\n07-03-2026\n18-11-2025\npendiente\n7-03-2026\n15-12-2026\n"
    }
  },
  "final": "Las referencias <code>\\1</code>, <code>\\2</code> y <code>\\3</code> recuperan el día, el mes y el año en el reemplazo.",
  "solucion": [
    "<code>sed -E 's/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/\\3-\\2-\\1/' practica2/fechas.txt</code>. Las referencias <code>\\1</code>, <code>\\2</code> y <code>\\3</code> recuperan el día, el mes y el año en el reemplazo."
  ],
  "pasos": [
    {
      "tarea": "Captura día, mes y año y vuelve a imprimirlos en el orden pedido.",
      "meta": {
        "salida": "FECHAS\n2026-03-07\n2025-11-18\npendiente\n7-03-2026\n2026-12-15"
      },
      "pista": [
        "Cada parte de la fecha necesita su propio grupo entre paréntesis.",
        "En el reemplazo, empieza por la tercera captura. El año es \\3.",
        "sed -E 's/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/\\3-\\2-\\1/' practica2/fechas.txt"
      ],
      "explica": "Las referencias <code>\\1</code>, <code>\\2</code> y <code>\\3</code> recuperan el día, el mes y el año en el reemplazo.",
      "ejemplo": "sed -E 's/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/\\3-\\2-\\1/' practica2/fechas.txt"
    }
  ]
},
{
  "id": "practica-examen-2-11",
  "grupo": "Practica Examen 2",
  "nivel": 3,
  "titulo": "11. Extraer solo las reservas pendientes",
  "resumen": "grep -E, sed y tubería",
  "enunciado": "<p>Trabaja con <code>practica2/salas.txt</code>. Cada fila de datos tiene el formato <code>SALA;ESTADO;NOTA</code>. Primero filtra las filas con estado <code>PENDIENTE</code>. Después, en una sola orden con tubería, muestra únicamente el nombre de la sala de esas filas.</p>",
  "inicio": {
    "cwd": "~",
    "fs": {
      "~/practica2": "dir",
      "~/practica2/salas.txt": "SALA;ESTADO;NOTA\nA-01;PENDIENTE;proyector\nA-02;LISTA;PENDIENTE de revisar cable\nB-07;PENDIENTE;luces\nB-09;NO PENDIENTE;cerrada\nC-06;PENDIENTE;llaves\n"
    }
  },
  "final": "La tubería entrega a <code>sed</code> las filas filtradas. La sustitución borra desde el primer <code>;</code> y deja el nombre de cada sala.",
  "solucion": [
    "<code>grep -E '^[^;]+;PENDIENTE;' practica2/salas.txt</code>. <code>[^;]+</code> consume el primer campo. Los separadores delimitan el estado exacto.",
    "<code>grep -E '^[^;]+;PENDIENTE;' practica2/salas.txt | sed 's/;.*$//'</code>. La tubería entrega a <code>sed</code> las filas filtradas. La sustitución borra desde el primer <code>;</code> y deja el nombre de cada sala."
  ],
  "pasos": [
    {
      "tarea": "Filtra las filas por el valor exacto del segundo campo.",
      "meta": {
        "salida": "A-01;PENDIENTE;proyector\nB-07;PENDIENTE;luces\nC-06;PENDIENTE;llaves"
      },
      "pista": [
        "El primer campo termina en el primer punto y coma.",
        "Usa [^;]+ para el nombre de la sala y busca ;PENDIENTE; justo después.",
        "grep -E '^[^;]+;PENDIENTE;' practica2/salas.txt"
      ],
      "explica": "<code>[^;]+</code> consume el primer campo. Los separadores delimitan el estado exacto.",
      "ejemplo": "grep -E '^[^;]+;PENDIENTE;' practica2/salas.txt"
    },
    {
      "tarea": "Encadena <code>grep</code> y <code>sed</code> para mostrar solo las salas pendientes.",
      "meta": {
        "salida": "A-01\nB-07\nC-06"
      },
      "pista": [
        "Envía las filas filtradas a sed mediante una tubería.",
        "Elimina desde el primer punto y coma hasta el final con ;.*$.",
        "grep -E '^[^;]+;PENDIENTE;' practica2/salas.txt | sed 's/;.*$//'"
      ],
      "explica": "La tubería entrega a <code>sed</code> las filas filtradas. La sustitución borra desde el primer <code>;</code> y deja el nombre de cada sala.",
      "ejemplo": "grep -E '^[^;]+;PENDIENTE;' practica2/salas.txt | sed 's/;.*$//'"
    }
  ]
}
]);
