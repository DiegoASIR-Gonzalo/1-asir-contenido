/* =====================================================================
   ATAJOS REALES · datos de la ventana "Atajos reales"
   ---------------------------------------------------------------------
   Este archivo va en la misma carpeta que linux-terminal.html y se carga ANTES del
   script principal (igual que ejemplos.js y actividades.js).

   CÓMO AÑADIR UN ATAJO
   1. Busca el grupo donde encaja (o crea uno nuevo copiando un bloque { grupo:..., atajos:[...] }).
   2. Añade dentro de "atajos" un bloque como este:

        {
          teclas:  'Ctrl + R',                  // se dibuja como teclas: [Ctrl] + [R]
          titulo:  'Buscar en el historial',    // nombre corto del atajo
          explica: 'Texto que explica qué hace.',            // opcional · admite HTML (<code>, <b>…)
          ejemplo: '<span class="c"># lo que verías</span>', // opcional · se muestra como un mini terminal
          nota:    'Un detalle extra o una advertencia.',    // opcional · admite HTML
          practica: true                                     // opcional · etiqueta "Pruébalo en una actividad"
        },

   DETALLES
   · Separa las teclas con " + " (con espacios): 'Ctrl + Shift + C'. Para la tecla "+" escribe 'Ctrl + +'.
   · Si un atajo tiene VARIAS formas, usa una lista: teclas: ['Ctrl + L', 'clear'].
   · "explica" y "ejemplo" pueden ser un texto o una lista de textos (cada elemento de "explica" es un párrafo
     y cada elemento de "ejemplo" una línea).
   · En "ejemplo" puedes usar los colores de la terminal:
       <span class="u">usuario@linux</span>  <span class="r">~</span>  <span class="c"># comentario</span>
       <mark>resaltado</mark>  <span class="k">palabra clave</span>  <span class="s">"texto"</span>
   · Con "practica: true" marca los atajos que sí funcionan en la terminal de las actividades.
   · El buscador de la ventana busca en teclas, título, explicación y nombre del grupo.
   · Si cambias algo y no aparece, revisa que no falte ninguna coma ni comilla (la consola del navegador lo dirá).

   AJUSTE
   · true = los grupos empiezan plegados · false = todos desplegados.
   ===================================================================== */
const ATAJOS_PLEGAR_GRUPOS = false;

const ATAJOS = [
  {
    grupo: 'Terminal (bash)',
    atajos: [
      {
        teclas: 'Tab',
        titulo: 'Autocompletar',
        explica: [
          'Completa el nombre de un comando, archivo o carpeta con lo que ya has escrito. Si hay varias opciones, pulsa <b>Tab</b> dos veces para verlas todas.',
          'Es el atajo que más tiempo ahorra y además evita errores al escribir rutas largas.'
        ],
        ejemplo: [
          '<span class="u">usuario@linux</span>:<span class="r">~</span>$ cd Doc<mark>[Tab]</mark>',
          '<span class="u">usuario@linux</span>:<span class="r">~</span>$ cd Documentos/'
        ],
        practica: true
      },
      {
        teclas: ['↑', '↓'],
        titulo: 'Recorrer el historial',
        explica: 'Con <b>↑</b> recuperas los comandos que ya has escrito, del más reciente al más antiguo. Con <b>↓</b> vuelves hacia adelante. Así repites o corriges un comando sin volver a escribirlo.',
        nota: 'El comando <code>history</code> muestra la lista completa y <code>!!</code> repite el último.',
        practica: true
      },
      {
        teclas: 'Ctrl + C',
        titulo: 'Cancelar el comando en curso',
        explica: 'Envía la señal de interrupción (<code>SIGINT</code>) al programa que se está ejecutando para que se detenga. También descarta la línea que estabas escribiendo.',
        ejemplo: [
          '<span class="u">usuario@linux</span>:<span class="r">~</span>$ ping google.es',
          '<span class="c"># ...el ping no acaba nunca...</span>',
          '^C'
        ],
        nota: 'No sirve para copiar en la terminal: para eso se usa <code>Ctrl + Shift + C</code>.',
        practica: true
      },
      {
        teclas: 'Ctrl + D',
        titulo: 'Cerrar la sesión (fin de entrada)',
        explica: 'Con la línea vacía, indica «fin de entrada» y cierra la terminal o la sesión actual. Es lo mismo que escribir <code>exit</code>.'
      },
      {
        teclas: 'Ctrl + L',
        titulo: 'Limpiar la pantalla',
        explica: 'Borra lo que se ve en la terminal y deja el prompt arriba. Equivale al comando <code>clear</code>, pero sin escribir nada y sin perder lo que llevas escrito en la línea.',
        practica: true
      },
      {
        teclas: 'Ctrl + Z',
        titulo: 'Suspender un programa',
        explica: 'Pausa el programa en ejecución y lo deja en segundo plano. Para retomarlo usa <code>fg</code> (primer plano) o <code>bg</code> (que siga en segundo plano).',
        nota: 'Con <code>jobs</code> ves los programas que has dejado en pausa.'
      },
      {
        teclas: 'Ctrl + R',
        titulo: 'Buscar en el historial',
        explica: 'Abre una búsqueda inversa: según escribes, bash te muestra el comando más reciente que contiene ese texto. <b>Intro</b> lo ejecuta y <b>Esc</b> lo deja en la línea para editarlo.',
        ejemplo: '(reverse-i-search)`apt\': sudo apt update'
      }
    ]
  },
  {
    grupo: 'Editar la línea de comandos',
    atajos: [
      {
        teclas: 'Ctrl + A',
        titulo: 'Ir al principio de la línea',
        explica: 'Mueve el cursor al inicio sin tener que pulsar la flecha muchas veces.',
        practica: true
      },
      {
        teclas: 'Ctrl + E',
        titulo: 'Ir al final de la línea',
        explica: 'Mueve el cursor al final de lo que has escrito.',
        practica: true
      },
      {
        teclas: ['Alt + B', 'Alt + F'],
        titulo: 'Moverse de palabra en palabra',
        explica: '<b>Alt + B</b> retrocede una palabra y <b>Alt + F</b> avanza una. Es mucho más rápido que ir letra a letra.'
      },
      {
        teclas: 'Ctrl + W',
        titulo: 'Borrar la palabra anterior',
        explica: 'Borra desde el cursor hasta el inicio de la palabra que tienes a la izquierda.',
        practica: true
      },
      {
        teclas: 'Ctrl + U',
        titulo: 'Borrar hasta el principio',
        explica: 'Corta todo lo que hay desde el cursor hasta el inicio de la línea. Lo cortado se puede pegar con <b>Ctrl + Y</b>.',
        practica: true
      },
      {
        teclas: 'Ctrl + K',
        titulo: 'Borrar hasta el final',
        explica: 'Corta todo lo que hay desde el cursor hasta el final de la línea.'
      },
      {
        teclas: 'Ctrl + Y',
        titulo: 'Pegar lo último que cortaste',
        explica: 'Pega el texto que borraste con <b>Ctrl + U</b>, <b>Ctrl + K</b> o <b>Ctrl + W</b>.'
      },
      {
        teclas: ['Ctrl + Shift + C', 'Ctrl + Shift + V'],
        titulo: 'Copiar y pegar en la terminal',
        explica: 'En la mayoría de terminales gráficas (como la de Ubuntu) se copia con <b>Ctrl + Shift + C</b> y se pega con <b>Ctrl + Shift + V</b>, porque <b>Ctrl + C</b> ya se usa para cancelar.'
      }
    ]
  },
  {
    grupo: 'Escritorio (GNOME / Ubuntu)',
    atajos: [
      {
        teclas: 'Ctrl + Alt + T',
        titulo: 'Abrir una terminal',
        explica: 'Abre una ventana de terminal desde cualquier parte del escritorio.'
      },
      {
        teclas: 'Super',
        titulo: 'Abrir Actividades',
        explica: 'Pulsar la tecla <b>Super</b> (la de Windows) muestra las ventanas abiertas y permite buscar aplicaciones escribiendo su nombre.'
      },
      {
        teclas: 'Alt + Tab',
        titulo: 'Cambiar de ventana',
        explica: 'Salta entre las ventanas abiertas. Mantén <b>Alt</b> y pulsa <b>Tab</b> varias veces para elegir una.'
      },
      {
        teclas: 'Ctrl + Alt + F3',
        titulo: 'Pasar a una consola de texto (TTY)',
        explica: 'Cambia a una terminal sin entorno gráfico. Se pueden usar de <b>F3</b> a <b>F6</b>. Para volver al escritorio se prueba con <b>Ctrl + Alt + F1</b> o <b>F2</b>.',
        nota: 'La tecla exacta para volver al entorno gráfico depende de la distribución y de la versión.'
      }
    ]
  },
  {
    grupo: 'Editor nano',
    atajos: [
      {
        teclas: 'Ctrl + O',
        titulo: 'Guardar el archivo',
        explica: 'Escribe los cambios en el archivo («WriteOut»). nano te pide confirmar el nombre: pulsa <b>Intro</b>.'
      },
      {
        teclas: 'Ctrl + X',
        titulo: 'Salir de nano',
        explica: 'Cierra el editor. Si hay cambios sin guardar, te pregunta si quieres guardarlos (<b>S</b> / <b>N</b>).'
      },
      {
        teclas: 'Ctrl + W',
        titulo: 'Buscar texto',
        explica: 'Busca una palabra dentro del archivo.'
      },
      {
        teclas: ['Ctrl + K', 'Ctrl + U'],
        titulo: 'Cortar y pegar una línea',
        explica: '<b>Ctrl + K</b> corta la línea donde está el cursor y <b>Ctrl + U</b> la pega donde lo coloques.',
        nota: 'Los atajos de cada opción aparecen siempre en la parte de abajo de nano (<code>^</code> significa Ctrl).'
      }
    ]
  },
  {
    grupo: 'Editor vim',
    atajos: [
      {
        teclas: 'Esc',
        titulo: 'Volver al modo normal',
        explica: 'vim tiene varios modos. Con <b>Esc</b> vuelves siempre al modo normal, desde el que se mueven y se borran cosas.'
      },
      {
        teclas: 'i',
        titulo: 'Empezar a escribir',
        explica: 'Entra en modo inserción justo antes del cursor: a partir de aquí lo que tecleas se escribe en el archivo.'
      },
      {
        teclas: [':wq', ':q!'],
        titulo: 'Guardar y salir / salir sin guardar',
        explica: [
          'Desde el modo normal, escribe <code>:wq</code> y pulsa <b>Intro</b> para guardar y salir.',
          'Si prefieres descartar los cambios, usa <code>:q!</code>.'
        ]
      }
    ]
  }
];
