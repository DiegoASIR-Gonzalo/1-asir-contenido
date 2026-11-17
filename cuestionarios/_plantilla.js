/* =====================================================================
   PLANTILLA DE CUESTIONARIO  ·  copia este archivo y cámbiale el nombre
   ---------------------------------------------------------------------
   1) Duplica este archivo:  cuestionarios/_plantilla.js
                        ->   cuestionarios/so-ud1.js   (el nombre que quieras)
   2) Cambia "id" y "titulo", y escribe tus preguntas.
   3) Añade en index.html una tarjeta que lo abra (el data-quiz es el
      nombre del archivo sin ".js"):

      <a class="card" href="#" data-modal="quiz" data-quiz="so-ud1">
        <span class="icon"><svg><use href="#i-quiz"/></svg></span>
        <span class="card-body"><strong>Cuestionario</strong><small>Repasa el tema 1.</small></span>
        <span class="arrow">✦</span>
      </a>

   Nada más: no hay que tocar el motor ni el CSS.
   ===================================================================== */
HubQuiz.registrar({
  id: 'plantilla',                 // identificador único (se usa para guardar la mejor nota)
  titulo: 'Cuestionario de ejemplo',

  /* Opciones (todas opcionales) */
  mezclar: false,                  // true = las preguntas salen en orden aleatorio
  mezclarOpciones: true,           // false = las opciones salen siempre en el orden escrito
  feedback: 'inmediato',           // 'inmediato' = corrige tras cada pregunta
                                   // 'final'     = solo muestra la corrección al terminar (modo examen)

  preguntas: [

    /* ---- UNA respuesta correcta ----
       "correcta" = nº de la opción correcta, empezando por 0. */
    {
      q: '¿Qué comando muestra el directorio actual?',
      opciones: ['ls', 'pwd', 'cd', 'whoami'],
      correcta: 1,
      explicacion: '`pwd` = print working directory.'          // opcional
    },

    /* ---- VARIAS respuestas correctas ----
       "correcta" es una lista. Puntúa solo si marcas todas las correctas y ninguna más. */
    {
      q: 'Selecciona los comandos que sirven para ver el contenido de un fichero.',
      opciones: ['cat', 'less', 'mkdir', 'rm'],
      correcta: [0, 1],
      explicacion: '`mkdir` crea directorios y `rm` borra.'
    },

    /* ---- VERDADERO / FALSO ----
       "correcta" es true o false. */
    {
      q: 'En Linux, el usuario root tiene permisos sobre todo el sistema.',
      correcta: true
    },

    /* ---- RESPUESTA ESCRITA ----
       "correcta" es una respuesta o una lista de respuestas válidas.
       Se ignoran mayúsculas, tildes y espacios de más. */
    {
      q: '¿Qué comando se usa para cambiar los permisos de un fichero?',
      correcta: ['chmod'],
      explicacion: '`chmod` = change mode.'
    },

    /* ---- Opción que debe quedarse en su sitio ----
       Con "fijo: true" las opciones de esta pregunta no se mezclan
       (útil para "Todas las anteriores"). */
    {
      q: '¿Cuál de estas es una distribución de Linux?',
      opciones: ['Debian', 'Ubuntu', 'Fedora', 'Todas las anteriores'],
      correcta: 3,
      fijo: true
    }

    /* Para añadir más preguntas, copia uno de los bloques de arriba
       y pon una coma entre ellos.
       En los textos, lo que escribas entre `comillas inversas` se ve como código. */
  ]
});
