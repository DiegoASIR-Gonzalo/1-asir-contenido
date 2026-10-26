/* =====================================================================
   CÓMO AÑADIR CONTENIDO (solo tocas este bloque)
   ---------------------------------------------------------------------
   GRUPOS      → cada grupo es una sección desplegable del panel lateral.
   comandos    → cada comando es un subapartado clicable dentro del grupo.
   diapositivas→ la 1.ª explica el comando; las siguientes, ejemplos.
   Cada diapositiva tiene:
     cmd : texto que se "teclea" en la terminal
     out : salida del comando (HTML). Clases útiles:
           <b class="d">carpeta</b>  <b class="x">ejecutable</b>  <mark>resaltado</mark>
           <span class="u">usuario@linux</span>:<span class="r">~/ruta</span>$
     exp : explicación bajo la terminal (HTML: <h3>, <p>, <code>, <ul>)
   VARIOS COMANDOS EN CADENA: en vez de cmd/out usa pasos, una lista de {cmd, out, ruta}.
   Se teclean uno tras otro, como una sesión real. "ruta" (opcional) cambia el prompt
   tras ese paso (útil con cd), p. ej. ruta:"~/proyectos".
   Ejemplo: { pasos:[ {cmd:"cd web", ruta:"~/web"}, {cmd:"ls", out:"index.html"} ], exp:"..." }
   CÓDIGO (funciones de ~/.bashrc): dentro de out usa <span class="k">palabra clave</span>,
   <span class="s">"texto"</span> y <span class="c"># comentario</span>. Para mostrar < y > escribe &lt; y &gt;.

   Plantilla para copiar y pegar un comando nuevo:

   { nombre:"mkdir", resumen:"Crear carpetas", diapositivas:[
       { cmd:"mkdir fotos", out:"", exp:"<h3>mkdir</h3><p>Crea una carpeta.</p>" },
       { cmd:"mkdir -p a/b/c", out:"", exp:"<p>Con <code>-p</code> crea toda la ruta.</p>" }
   ]},
   ===================================================================== */
const prompt = ruta => '<span class="u">usuario@linux</span>:<span class="r">' + ruta + '</span>$ '; // texto antes del comando

// Imagen de fondo por defecto: ruta o URL, p. ej. "fondo.jpg" o "img/escritorio.png".
// Déjala vacía ("") para usar el degradado de color. Desde el botón cuadriculado también se puede elegir otra imagen.
const FONDO_IMAGEN = "";

// Fondo animado por defecto (tapa la imagen): "" = ninguno, o una de estas claves:
//   "microondas" · "matrix" · "cuadricula" (cuadrícula eléctrica verdosa) · "placa" (placa base)
// Desde el botón cuadriculado › "Animado" también se puede cambiar en cualquier momento.
const FONDO_ANIMADO = "";

const GRUPOS = [

  { titulo:"Consultar comandos", comandos:[

    { nombre:"type", resumen:"Tipo de comando", diapositivas:[
      { cmd:"type nano",
        out:'nano is /usr/bin/nano',
        exp:'<h3>type</h3><p>Muestra que tipo de comando es el que queremos saber</p><p>Te dice ademas en donde esta alojado el comando o incluso si es interno.</p>' },
      { cmd:"type nano (pero si fuera un alias)",
        out:'nano es un alias de nano -l',
        exp:'<h3>¿Que pasaría si fuera un alias?</h3><p>Solamente nos especificaría que es un alias y no el comando en si.</p>' },
      { cmd:"type pwd",
        out:'pwd es una orden interna del shell',
        exp:'<p>Esto es lo que sucede cuando estamos ante un comando interno, nos especifica que es de la <strong>bash</strong></p>' }
    ]},

    { nombre:"man", resumen:"Manual de comandos", diapositivas:[
      { cmd:"man",
        out:'¿Qué página del manual desea?<p>Por ejemplo, pruebe man man.</p>',
        exp:'<h3>El manual universal</h3><p>Podremos consultar casi cualquier comando con "man", pero habra otros que no ya que dependa si tiene o no dentro de man.</p>' },
	  { cmd:"man -k whoami",
        out:'whoami (1)           - print effective user name',
        exp:'<h3>Forma de verlo abrebiado</h3><p>Podremos consultar de forma más breve con "man", pero usando el parametro <code>-k</code></p>' },
    ]},
			
	{ nombre:"tldr", resumen:"Resumen de un comando", diapositivas:[
      { pasos:[
          { cmd:"tldr pwd", out:'pwd\n  Imprime el nombre del directorio actual.\n  Más información: Enlace ficticio\n\n- Imprime el directorio actual:\n   pwd\n\n- Imprime el directorio actual y resuelve todos los enlaces simbólicos (es decir, muestra la ruta física real):\n    pwd -P' }
        ],
        exp:'<h3>Taildeer</h3>Comando que nos sirve para saber que hace un comando o un resumen de este, pero antes de nada siempre hay que poner <code>tldr --update</code>' }
    ]},
	
	{ nombre:"whatis", resumen:"Consultar comando", diapositivas:[
      { cmd:"whatis whoami",
        out:'whoami (1)           - print effective user name',
        exp:'Para consultar brevemente un comando, practicamente es lo mismo que <code>man -k "comando a poner"</code>' }
    ]},
	
	{ nombre:"whereis", resumen:"Ruta de un comando", diapositivas:[
      { cmd:"whereis whoami",
        out:'whoami: /usr/bin/whoami /usr/share/man/man1/whoami.1.gz',
        exp:'Podremos ver la ruta donde se aloja un comando.' }
    ]}
  ]},

  { titulo:"Ficheros y Instalaciones", comandos:[

    { nombre:"file", resumen:"Mostrar un archivo", diapositivas:[
      { cmd:'file test.txt',
        out:'test.txt: empty',
        exp:'<h3>file</h3><p>Nos dira si un archivo tiene contenido dentro o esta vacio, muy util para saber que tipo de archivo es un fichero.' },
      { cmd:'file test.txt',
        out:'test.txt: ASCII text',
        exp:'Lo que pasaría si ese fichero tuviera unos bits rellenados.' }
    ]},
    
    { nombre:"du", resumen:"Consultas espacio", diapositivas:[
      { pasos:[
          { cmd:"cd ./Prueba", out:'', ruta:'~/Prueba'},
          { cmd:"du", out:'4   .'},
          { cmd:"du -lh", out:'4,0K	.' }
        ],
        exp:'<h3>El comando para ver el espacio</h3>Este comando nos permite ver a detalle cuanto espacio se esta consumiendo en una ruta.<p>Si usamos el parametro <code>-lh</code> podremos ver hasta si son MB o GB.</p>' },
      { pasos:[
          { cmd:"cd ./Prueba", out:'', ruta:'~/Prueba'},
          { cmd:"du", out:'8  	./1-asir-contenido-main/pdfs/fundamentos-hardware\n396	./1-asir-contenido-main/pdfs/redes\n2000	./1-asir-contenido-main/pdfs/bd\n7472	./1-asir-contenido-main/pdfs\n80	./1-asir-contenido-main/html/redes\n88	./1-asir-contenido-main/html\n7924	./1-asir-contenido-main\n8	./PruebasISO\n5755448	.' },
          { cmd:"du -lh", out:'8,0K	./1-asir-contenido-main/pdfs/fundamentos-hardware\n396K	./1-asir-contenido-main/pdfs/redes\n2,0M	./1-asir-contenido-main/pdfs/bd\n7,3M	./1-asir-contenido-main/pdfs\n80K	./1-asir-contenido-main/html/redes\n88K	./1-asir-contenido-main/html\n7,8M	./1-asir-contenido-main\n12K	./PruebasISO\n5,5G	.' }
        ],
        exp:'<h3>El comando para ver el espacio</h3>Este comando nos permite ver a detalle cuanto espacio se esta consumiendo en una ruta.<p>Si usamos el parametro <code>-lh</code> podremos ver hasta si son MB o GB.</p>' },
    ]},
    
	  { nombre:"wc", resumen:"Contar líneas", diapositivas:[
      { cmd:'wc test.txt',
        out:'1  3 13 test.txt',
        exp:'<h3>wc (Word Count)</h3><p>Contara el número de líneas, palabras, caracteres y bytes que tiene un fichero o documento de texto.' },
      { cmd:'wc -l test.txt',
        out:'1 test.txt',
        exp:'Con el parametro <code>-l</code> contara las líneas directamente.' }
    ]},

    { nombre:"chmod", resumen:"Cambiar permisos", diapositivas:[
      { cmd:"chmod +x script.sh && ls -l script.sh",
        out:'-rwxr-xr-x 1 usuario usuario 58 oct 20 10:30 <b class="x">script.sh</b>',
        exp:'<h3>chmod — change mode</h3><p>Modifica quién puede leer (<code>r</code>), escribir (<code>w</code>) o ejecutar (<code>x</code>) un archivo. <code>+x</code> lo vuelve ejecutable y por eso <code>ls</code> lo pinta en verde.</p>' },
      { cmd:"chmod 644 notas.txt && ls -l notas.txt",
        out:'-rw-r--r-- 1 usuario usuario 120 oct 20 10:12 notas.txt',
        exp:'<h3>Modo numérico</h3><p>Cada cifra suma permisos: lectura = 4, escritura = 2, ejecución = 1. Las tres cifras son propietario, grupo y resto. Así, <code>644</code> da <code>rw-r--r--</code>.</p>' },
      { cmd:"chmod 755 script.sh && chmod 600 clave.pem",
        out:'',
        exp:'<h3>Valores habituales</h3><ul><li><code>755</code>: scripts y carpetas públicas.</li><li><code>644</code>: documentos normales.</li><li><code>600</code>: archivos privados, como claves.</li></ul>' }
    ]}
  ]},

  { titulo:"Cadenas de comandos", comandos:[

    { nombre:"pipes", resumen:"Encadenar con |", diapositivas:[
      { pasos:[
          { cmd:"mkdir saludos", out:'' },
          { cmd:"touch saludo1.txt | mv saludo1.txt saludos", out:'' },
          { cmd:"ls saludos | wc -l saludos/saludo1.txt | tree saludos", out:'<b class="d">saludos</b>\n└── saludo1.txt\n\n1 directory, 1 file' }
        ],
        exp:'<h3>Tuberías</h3><p>El símbolo <code>|</code> envía la salida de un comando como entrada del siguiente. Cada eslabón filtra o transforma: primero se lista el directorio, luego <code>wc -l</code> cuenta las líneas del fichero y <code>tree</code> lista de forma ordenada el directorio de nuevo.</p>' },
      { pasos:[
          { cmd:'mkdir demo && echo "carpeta creada"', out:'carpeta creada' },
          { cmd:'ls /noexiste || echo "no existe, sigo igualmente"', out:'ls: no se puede acceder a \'/noexiste\': No existe el fichero o el directorio\nno existe, sigo igualmente' },
          { cmd:'echo uno; echo dos; echo tres', out:'uno\ndos\ntres' }
        ],
        exp:'<h3>Otros encadenadores</h3><ul><li><code>&amp;&amp;</code>: ejecuta el siguiente solo si el anterior funcionó.</li><li><code>||</code>: ejecuta el siguiente solo si el anterior falló.</li><li><code>;</code>: ejecuta todos, pase lo que pase.</li></ul>' }
    ]},

    { nombre:"sesión", resumen:"Crear un proyecto", diapositivas:[
      { pasos:[
          { cmd:"mkdir -p web/css", out:'' },
          { cmd:"cd web", out:'', ruta:'~/web' },
          { cmd:"touch index.html css/estilo.css", out:'' },
          { cmd:"ls -R", out:'.:\n<b class="d">css</b>  index.html\n\n./css:\nestilo.css' },
          { cmd:"cd ..", out:'', ruta:'~' }
        ],
        exp:'<h3>Una sesión completa</h3><p>Así se ve un flujo real: se crea la estructura (<code>mkdir -p</code>), se entra (<code>cd</code>), se crean archivos vacíos (<code>touch</code>), se revisa todo (<code>ls -R</code>) y se vuelve atrás. Fíjate en cómo el prompt cambia de ruta.</p>' }
    ]}
  ]},

  { titulo:"Funciones en .bashrc", comandos:[
    
    { nombre:"Ejemplo 1", resumen:"Ver la hora", diapositivas:[
      { pasos:[
          { cmd:"Función de ver la hora", out:'hora () {\n        date +%T\n}' },
          { cmd:"hora", out:'Se vería la hora'}
        ],
        exp:'<h3>Una sesión completa</h3><p>Así se ve un flujo real: se crea la estructura (<code>mkdir -p</code>), se entra (<code>cd</code>), se crean archivos vacíos (<code>touch</code>), se revisa todo (<code>ls -R</code>) y se vuelve atrás. Fíjate en cómo el prompt cambia de ruta.</p>' }
    ]},
    
    { nombre:"mkcd", resumen:"Crear y entrar", diapositivas:[
      { pasos:[
          { cmd:"tail -n 4 ~/.bashrc", out:'<span class="c"># Crea una carpeta y entra en ella</span>\nmkcd() {\n  mkdir -p <span class="s">"$1"</span> &amp;&amp; cd <span class="s">"$1"</span>\n}' },
          { cmd:"source ~/.bashrc", out:'' },
          { cmd:"mkcd proyectos/nuevo", out:'', ruta:'~/proyectos/nuevo' },
          { cmd:"pwd", out:'/home/usuario/proyectos/nuevo' }
        ],
        exp:'<h3>Funciones en ~/.bashrc</h3><ul><li><code>~/.bashrc</code> se lee al abrir cada terminal: ahí se guardan tus funciones.</li><li><code>$1</code> es el primer argumento que recibe la función.</li><li><code>source</code> recarga el archivo sin cerrar la terminal.</li></ul>' },
      { pasos:[
          { cmd:'mkcd "mis fotos"', out:'', ruta:'~/mis fotos' },
          { cmd:"pwd", out:'/home/usuario/mis fotos' }
        ],
        exp:'<h3>Las comillas importan</h3><p>Por eso la función usa <code>"$1"</code> entre comillas: así un nombre con espacios cuenta como un solo argumento. Sin ellas, crearía dos carpetas, <code>mis</code> y <code>fotos</code>.</p>' },
      { pasos:[
          { cmd:"type mkcd", out:'mkcd is a function\nmkcd () \n{ \n    mkdir -p "$1" &amp;&amp; cd "$1"\n}' },
          { cmd:"declare -F", out:'declare -f extraer\ndeclare -f mkcd' }
        ],
        exp:'<h3>Inspeccionar funciones</h3><p><code>type</code> muestra la definición de una función cargada y <code>declare -F</code> lista todas. Para quitar una de la sesión actual se usa <code>unset -f nombre</code>.</p>' }
    ]},

    { nombre:"extraer", resumen:"Descomprimir todo", diapositivas:[
      { pasos:[
          { cmd:"tail -n 11 ~/.bashrc", out:'<span class="c"># Descomprime según la extensión</span>\nextraer() {\n  <span class="k">if</span> [ -z <span class="s">"$1"</span> ]; <span class="k">then</span>\n    echo <span class="s">"Uso: extraer &lt;archivo&gt;"</span>; <span class="k">return</span> 1\n  <span class="k">fi</span>\n  <span class="k">case</span> <span class="s">"$1"</span> <span class="k">in</span>\n    *.tar.gz) tar -xzf <span class="s">"$1"</span> ;;\n    *.zip)    unzip <span class="s">"$1"</span> ;;\n    *)        echo <span class="s">"Formato no soportado"</span> ;;\n  <span class="k">esac</span>\n}' },
          { cmd:"source ~/.bashrc", out:'' },
          { cmd:"extraer datos.tar.gz", out:'' },
          { cmd:"ls", out:'<b class="d">datos</b>  datos.tar.gz' }
        ],
        exp:'<h3>Una función con lógica</h3><p>Con <code>case</code> la función elige el programa según la extensión del archivo. Así recuerdas un solo comando, <code>extraer</code>, en lugar de varias opciones de <code>tar</code> y <code>unzip</code>.</p>' },
      { pasos:[
          { cmd:'extraer; echo $?', out:'Uso: extraer &lt;archivo&gt;\n1' },
          { cmd:"extraer foto.rar", out:'Formato no soportado' }
        ],
        exp:'<h3>Validar los argumentos</h3><ul><li><code>[ -z "$1" ]</code> comprueba si no se pasó ningún argumento.</li><li><code>return 1</code> devuelve un código de error; <code>$?</code> muestra el del último comando.</li><li>El patrón <code>*)</code> atrapa cualquier formato no previsto.</li></ul>' }
    ]}
  ]},

  { titulo:"Expansión de llaves", comandos:[
    { nombre:"Ejemplo 1", resumen:"", diapositivas:[
      { pasos:[
          { cmd:"cd Descargas/ && pwd", out:'/home/usuario/Descargas', ruta:'~/Descargas'}
        ],
        exp:'<h3>Ejemplo 1</h3><p>El simbolo <code>&</code> nos servirá para poder decir que si un comando es exitoso, pues que se ejecute uno despues.</p>' }
    ]},
    { nombre:"Ejemplo 2", resumen:"", diapositivas:[
      { pasos:[
          { cmd:"cd Prueba", out:'', ruta:'~/Prueba'},
          { cmd:"touch fich-{1..10}.txt", out:''},
          { cmd:"ls", out:'fich-10.txt  fich-2.txt  fich-4.txt  fich-6.txt  fich-8.txt\nfich-1.txt   fich-3.txt  fich-5.txt  fich-7.txt  fich-9.txt' }
        ],
        exp:'<h3>Crear varios ficheros o carpetas a la vez</h3><p>No es muy complicado ya que unicamente usamos los simbolos <code>{ }</code> para poder crear varios ficheros de golpe.</p>' }
    ]}
  ]},

  { titulo:"Varios Comandos", comandos:[
    { nombre:"SoftLink", resumen:"Accesos Directos", diapositivas:[
      { pasos:[
          { cmd:"ln -s /home/usuario/Descargas/ softDes", out:'' },
          { cmd:"ls softDes", out:'1-asir-contenido-main\n1-asir-contenido-main.zip\nBinarioFH.pdf\nBoletin Scott II.odt\nConceptos UD 1.pdf\n...'}
        ],
        exp:'<h3>SoftLink</h3><p>Un pequeña utilidad para crear accesos directos al estilo de Windows, podemos hacerlo tanto con rutas como con ficheros.</p>' }
    ]},
    { nombre:"HardLink", resumen:"* Mas pesados", diapositivas:[
      { pasos:[
          { cmd:"touch test.txt > prueba", out:'' },
          { cmd:"ln test.txt hardtest.txt", out:'' },
          { cmd:"ls -lhi", out:'total 8,0K\n394844 -rw-rw-r-- 2 usuario usuario 7 oct 21 14:17 hardtest.txt\n394844 -rw-rw-r-- 2 usuario usuario 7 oct 21 14:17 hardtest.txt'}
        ],
        exp:'<h3>HardLink</h3><p>Casi lo mismo que el SoftLink, pero puede con ficheros más pesados, el ejemplo en pantalla tiene el mismo peso y mismo contenido.<p>Si borraramos el fichero creado no pasaría nada.</p></p>' }
    ]}
  ]}
];
