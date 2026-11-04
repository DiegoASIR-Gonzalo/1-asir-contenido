/* =====================================================================
   casts.js — grabaciones de asciinema para los ejemplos
   ---------------------------------------------------------------------
   CÓMO AÑADIR UNA GRABACIÓN
   1) Graba:   asciinema rec ls-basico.cast      (termina con Ctrl+D o "exit")
              Consejo: antes de grabar, deja la terminal en unas 80 columnas.
   2) Abre el .cast con un editor de texto, copia TODO su contenido y pégalo
      aquí entre las comillas invertidas de String.raw`...` con una clave nueva.
      (String.raw es imprescindible: respeta las secuencias \u001b y \r\n del fichero.)
   3) En ejemplos.js, en la diapositiva:   { cast:"ls-basico", exp:'<h3>ls</h3>...' }

   ALTERNATIVA (solo con servidor: Live Server, GitHub Pages…):
   deja el .cast en una carpeta y usa la ruta:   { cast:"casts/ls-basico.cast", ... }
   Con doble clic sobre el HTML (file://) el navegador bloquea esa lectura.

   NOTA: si el texto del .cast contiene una comilla invertida (`) o la secuencia ${ ,
   escápalas como \` y \${ antes de pegarlo.
   ===================================================================== */
const CASTS = {

  // Demostración: colores, un error y un resumen. Bórrala cuando quieras.
  "demo-ls": String.raw`{"version":2,"width":80,"height":24,"timestamp":1730000000,"env":{"SHELL":"/bin/bash","TERM":"xterm-256color"}}
[0.25,"o","\u001b[01;32musuario@1º-ASIR\u001b[00m:\u001b[01;34m~\u001b[00m$ "]
[0.9,"o","l"]
[0.12,"o","s"]
[0.12,"o"," "]
[0.12,"o","-"]
[0.12,"o","l"]
[0.5,"o","\r\n"]
[0.05,"o","total 12\r\n"]
[0.01,"o","drwxr-xr-x 2 usuario usuario 4096 nov  4 10:02 \u001b[01;34mdocumentos\u001b[0m\r\n"]
[0.01,"o","-rw-r--r-- 1 usuario usuario  120 nov  4 10:01 notas.txt\r\n"]
[0.01,"o","-rwxr-xr-x 1 usuario usuario   64 nov  4 10:03 \u001b[01;32mcopia.sh\u001b[0m\r\n"]
[0.3,"o","\u001b[01;32musuario@1º-ASIR\u001b[00m:\u001b[01;34m~\u001b[00m$ "]
[1.1,"o","l"]
[0.12,"o","s"]
[0.12,"o"," "]
[0.12,"o","n"]
[0.12,"o","o"]
[0.12,"o","e"]
[0.12,"o","x"]
[0.12,"o","i"]
[0.12,"o","s"]
[0.12,"o","t"]
[0.12,"o","e"]
[0.5,"o","\r\n"]
[0.05,"o","ls: no se puede acceder a 'noexiste': No existe el fichero o el directorio\r\n"]
[0.3,"o","\u001b[01;32musuario@1º-ASIR\u001b[00m:\u001b[01;34m~\u001b[00m$ "]
`

};
