/* La ruta de las señales · Examen 25/11/2026.
   Datos independientes de la aventura anterior. Las soluciones «ejemplo»
   sirven al verificador; practicaSinEjemplo las oculta durante el reto.
   Los ficheros son muestras locales: SSH y tmux se estudian por decisiones,
   sin simular que se haya abierto una conexión real. */
window.AVENTURA_TEMA3 = {
  version: 1,
  titulo: 'La ruta de las señales',
  practicaSinEjemplo: true,
  mundos: [
    {
      id: 't3-archivo', titulo: 'Archivo de señales', emoji: '📡',
      resumen: 'La señal se ha perdido entre registros. Aprende a reconocerla sin confundirla con el ruido.',
      lecciones: [
        {
          id: 't3-patrones', titulo: 'El alfabeto del archivo', resumen: 'BRE, ERE, texto literal y varios patrones', comando: 'grep',
          rondas: [
            {
              id: 't3-patrones-forma', titulo: 'Reconocer la forma', resumen: 'Anclas, clases y repeticiones',
              inicio: { base: 'vacio', fs: {
                '~/demo-claves.txt': 'pan\ncasa\npez\n12a\n',
                '~/demo-rumbos.txt': 'norte\nsur\nnoroeste\n',
                '~/claves.txt': 'sol\nmar\nluz\nonda\n12a\ns.o\nabc1\n',
                '~/estados.log': 'info: inicio\naviso: red lenta\nerror: disco\npreerror: prueba\n'
              } },
              pantallas: [
                { id: 't3-teoria-alfabeto', tipo: 'teoria', titulo: 'El patrón describe, las comillas protegen',
                  html: '<p><code>grep</code> usa BRE; <code>egrep</code> equivale a <code>grep -E</code> y usa ERE. En BRE una repetición exacta se escribe <code>\\{n\\}</code>; en ERE, <code>{n}</code>. Los grupos y las alternativas ERE usan <code>()</code> y <code>|</code>.</p><p><code>[[:alpha:]]</code> es una letra; aquí trabajamos con datos ASCII. <code>-x</code> exige toda la línea; <code>^</code> y <code>$</code> anclan sus extremos. Las comillas evitan que la shell interprete el patrón.</p>',
                  ejemplo: ["grep -x '[[:alpha:]]\\{4\\}' demo-claves.txt", "egrep '^(norte|sur)$' demo-rumbos.txt"] },
                { id: 't3-practica-bre', tipo: 'practica', titulo: 'Tres letras, toda la clave',
                  pide: 'En <code>claves.txt</code>, muestra solo las líneas formadas por exactamente tres letras ASCII. Usa <code>grep</code> en modo BRE, sin <code>-E</code>.',
                  ejemplo: "grep -x '[[:alpha:]]\\{3\\}' claves.txt", meta: { salida: 'sol\nmar\nluz' }, aprendizaje: { comando: 'grep', sinOpciones: ['-E', '-P', '-F'] },
                  pistas: ['Una clave completa no puede contener cifras ni signos.', 'Necesitas una clase de letras y una repetición exacta, aplicada a toda la línea.', 'En BRE las llaves del cuantificador llevan barra; -x exige que no sobren caracteres.'],
                  explica: 'La clase reconoce una letra, el cuantificador BRE la repite tres veces y -x descarta cualquier prefijo o sufijo.' },
                { id: 't3-practica-ere', tipo: 'practica', titulo: 'Dos clases de aviso',
                  pide: 'Usa <code>egrep</code> para mostrar las líneas de <code>estados.log</code> que empiecen por <code>aviso:</code> o <code>error:</code>. <code>preerror:</code> debe quedar fuera.',
                  ejemplo: "egrep '^(aviso|error):' estados.log", meta: { salida: 'aviso: red lenta\nerror: disco' }, aprendizaje: { comando: 'egrep' },
                  pistas: ['Hay dos comienzos válidos, pero no vale encontrar esas palabras en cualquier posición.', 'Agrupa las dos alternativas antes de añadir el signo que comparten.', 'En ERE el grupo usa paréntesis, la alternativa usa | y el comienzo se ancla con ^.'],
                  explica: 'El ancla afecta al grupo de alternativas: ambos nombres deben aparecer al principio y seguidos de dos puntos.' },
                { id: 't3-test-bre-ere', tipo: 'test', pregunta: '¿Qué pareja expresa «exactamente cuatro a» en GNU grep?', opciones: [
                  { t: '<code>grep -x \'a\\{4\\}\'</code> y <code>egrep -x \'a{4}\'</code>', ok: true, porque: 'BRE necesita escapar las llaves del cuantificador; ERE las interpreta directamente.' },
                  { t: '<code>grep -x \'a{4}\'</code> y <code>egrep -x \'a\\{4\\}\'</code>', porque: 'Se han intercambiado las sintaxis BRE y ERE.' },
                  { t: '<code>grep -x \'a*\'</code> en ambos modos.', porque: 'El asterisco permite cero o más repeticiones; no exige cuatro.' }
                ] }
              ]
            },
            {
              id: 't3-patrones-fuentes', titulo: 'La fuente del patrón', resumen: 'Buscar literalmente o leer una lista',
              inicio: { base: 'vacio', fs: {
                '~/demo-versiones.txt': 'v2.0 lista\nv2X0 falsa\n',
                '~/demo-patrones.txt': '^AZUL:\n^VERDE:\n',
                '~/demo-colores.log': 'AZUL: activo\nROJO: detenido\nVERDE: listo\n',
                '~/notas.txt': 'ruta.v1 lista\nrutaXv1 antigua\ncopia ruta.v1\n',
                '~/patrones.txt': '^ALERTA:\n^CAIDA:\n',
                '~/alertas.log': 'INFO: listo\nALERTA: bateria\npreCAIDA: ensayo\nCAIDA: enlace\n'
              } },
              pantallas: [
                { id: 't3-teoria-fuentes', tipo: 'teoria', titulo: 'No todo texto debe ser una regex',
                  html: '<p><code>-F</code> busca texto fijo: un punto deja de significar «cualquier carácter». <code>-e</code> añade un patrón y se puede repetir. <code>-f fichero</code> lee un patrón por línea y conserva las líneas que coincidan con cualquiera de ellos.</p>',
                  ejemplo: ["grep -F 'v2.0' demo-versiones.txt", 'grep -f demo-patrones.txt demo-colores.log', "grep -e '^AZUL:' -e '^VERDE:' demo-colores.log"] },
                { id: 't3-practica-literal', tipo: 'practica', titulo: 'El punto pertenece al nombre',
                  pide: 'Muestra las líneas de <code>notas.txt</code> que contengan el texto literal <code>ruta.v1</code>. Usa el modo de texto fijo de <code>grep</code>.',
                  ejemplo: "grep -F 'ruta.v1' notas.txt", meta: { salida: 'ruta.v1 lista\ncopia ruta.v1' }, aprendizaje: { comando: 'grep', opciones: ['-F'] },
                  pistas: ['rutaXv1 parece similar, pero no contiene el punto solicitado.', 'Elige el modo que no interpreta metacaracteres.', 'La opción de texto fijo permite escribir el nombre tal como aparece.'],
                  explica: '-F trata el punto como un carácter literal y descarta rutaXv1.' },
                { id: 't3-practica-lista-patrones', tipo: 'practica', titulo: 'La lista de alertas',
                  pide: 'Filtra <code>alertas.log</code> con los patrones ya guardados en <code>patrones.txt</code>. Haz que <code>grep</code> lea ese fichero, sin volver a escribir los patrones.',
                  ejemplo: 'grep -f patrones.txt alertas.log', meta: { salida: 'ALERTA: bateria\nCAIDA: enlace' }, aprendizaje: { comando: 'grep', opciones: ['-f'], valores: ['patrones.txt'] },
                  pistas: ['Un fichero contiene criterios y el otro contiene los registros.', 'grep tiene una opción que lee un patrón por línea.', 'El fichero de patrones es el argumento de -f; después indica dónde buscar.'],
                  explica: '-f carga las dos expresiones ancladas: acepta ALERTA y CAIDA al principio, pero no preCAIDA.' },
                { id: 't3-test-patron-literal', tipo: 'test', pregunta: 'Quieres encontrar <code>a.b</code> literalmente. ¿Qué opción comunica mejor esa intención?', opciones: [
                  { t: '<code>grep -F \'a.b\' fichero</code>', ok: true, porque: '-F interpreta los tres caracteres como texto fijo.' },
                  { t: '<code>grep \'a.b\' fichero</code>', porque: 'El punto de la regex también coincide con X en aXb.' },
                  { t: '<code>grep -v \'a.b\' fichero</code>', porque: '-v invierte la selección; no convierte el patrón en texto fijo.' }
                ] }
              ]
            }
          ]
        },
        {
          id: 't3-puertos', titulo: 'La puerta correcta', resumen: 'Subcadenas, campos y recuentos', comando: 'grep',
          rondas: [
            {
              id: 't3-puertos-exactos', titulo: '80 no es 8080', resumen: 'Reconocer un campo sin aceptar comentarios',
              inicio: { base: 'vacio', fs: {
                '~/demo-servicios.txt': 'dns 53/udp nombres\ndns-alt 5353/udp multicast\n# 53/udp comentario\n',
                '~/servicios.txt': 'http 80/tcp web\nproxy 8080/tcp cache\nsocks 1080/tcp tunel\nhttp-alt 80/udp laboratorio\nldap 389/tcp directorio\n# 389/tcp comentario\nldap-udp\t389/udp directorio\nldap-alt 1389/tcp prueba\n# http 80/tcp desactivado\n'
              } },
              pantallas: [
                { id: 't3-teoria-puertos', tipo: 'teoria', titulo: 'Primero entiende la estructura',
                  html: '<p>En esta muestra de servicios, el primer campo es el nombre y el segundo, <code>puerto/protocolo</code>. Buscar una subcadena no comprueba el campo. Una búsqueda exacta debe exigir un nombre activo, blancos, el puerto y un límite después del protocolo.</p><p><code>[[:blank:]]</code> incluye espacio y tabulador. Un primer campo que empiece por <code>#</code> es un comentario.</p>',
                  ejemplo: "egrep '^[^#[:space:]]+[[:blank:]]+53/udp([[:blank:]]|$)' demo-servicios.txt" },
                { id: 't3-practica-subcadena-80', tipo: 'practica', titulo: 'Recoger todas las pistas',
                  pide: 'Antes de afinar, muestra con <code>grep</code> todas las líneas de <code>servicios.txt</code> que contengan la cadena <code>80</code>, también dentro de otros números o comentarios.',
                  ejemplo: "grep '80' servicios.txt", meta: { salida: 'http 80/tcp web\nproxy 8080/tcp cache\nsocks 1080/tcp tunel\nhttp-alt 80/udp laboratorio\n# http 80/tcp desactivado' }, aprendizaje: { comando: 'grep' },
                  pistas: ['En este paso la petición es una subcadena, todavía no un puerto exacto.', 'No añadas anclas ni límites de palabra.', 'El patrón debe poder coincidir dentro de un número más largo.'],
                  explica: 'Una búsqueda de 80 también encuentra 8080, 1080 y una línea comentada. Eso cumple esta petición, pero no selecciona el puerto exacto.' },
                { id: 't3-practica-puerto-80', tipo: 'practica', titulo: 'Abrir solo la puerta 80/tcp',
                  pide: 'Ahora usa <code>egrep</code> para mostrar únicamente el servicio activo cuyo segundo campo sea <code>80/tcp</code> en <code>servicios.txt</code>. Excluye 1080, 8080, UDP y comentarios.',
                  ejemplo: "egrep '^[^#[:space:]]+[[:blank:]]+80/tcp([[:blank:]]|$)' servicios.txt", meta: { salida: 'http 80/tcp web' }, aprendizaje: { comando: 'egrep' },
                  pistas: ['Sitúa el puerto después del nombre del servicio, en el segundo campo.', 'El nombre no puede comenzar por #; el separador puede ser espacio o tabulador.', 'Exige el protocolo tcp completo y, después, blanco o final de línea.'],
                  explica: 'La estructura anclada impide confundir otros campos, comentarios y puertos que solo contienen la subcadena 80.' },
                { id: 't3-practica-puerto-389-bre', tipo: 'practica', titulo: 'La misma puerta en BRE',
                  pide: 'Con <code>grep</code> en BRE, muestra los servicios activos con segundo campo <code>389/tcp</code> o <code>389/udp</code>. Mantén fuera <code># 389/tcp</code> y <code>1389/tcp</code>.',
                  ejemplo: "grep '^[^#[:space:]]\\{1,\\}[[:blank:]]\\{1,\\}389/\\(tcp\\|udp\\)\\([[:blank:]]\\|$\\)' servicios.txt", meta: { salida: 'ldap 389/tcp directorio\nldap-udp\t389/udp directorio' }, aprendizaje: { comando: 'grep', sinOpciones: ['-E', '-P', '-F'] },
                  pistas: ['El comentario contiene el puerto correcto, pero no un nombre de servicio activo.', 'Reutiliza la estructura nombre, blancos y campo completo, admitiendo dos protocolos.', 'En BRE los grupos, la alternativa GNU y las llaves de repetición necesitan barras.'],
                  explica: 'Los límites del segundo campo distinguen 389 de 1389; el primer campo excluye # y la clase blank acepta la tabulación de ldap-udp.' },
                { id: 't3-test-puerto-comentado', tipo: 'test', pregunta: '¿Por qué buscar solo <code>389/(tcp|udp)</code> no basta para localizar servicios activos?', opciones: [
                  { t: 'También podría coincidir dentro de 1389 o de un comentario.', ok: true, porque: 'El puerto debe ocupar el campo completo y la línea debe tener un nombre activo.' },
                  { t: 'Porque una regex nunca reconoce una barra.', porque: 'En grep una barra puede aparecer literalmente en el patrón entre comillas.' },
                  { t: 'Porque -i siempre excluye los comentarios.', porque: '-i solo ignora la diferencia entre mayúsculas y minúsculas.' }
                ] }
              ]
            },
            {
              id: 't3-puertos-contar', titulo: 'Contar sin perder el significado', resumen: 'Líneas seleccionadas frente a coincidencias',
              inicio: { base: 'vacio', fs: { '~/demo-cuenta.txt': 'ok ok\nninguno\n', '~/lecturas.txt': '80 80\n1080\nsin dato\n80\n' } },
              pantallas: [
                { id: 't3-teoria-cuenta', tipo: 'teoria', titulo: 'Una línea puede tener varios aciertos',
                  html: '<p><code>grep -c</code> cuenta líneas seleccionadas, aunque una línea tenga varias coincidencias. <code>grep -o</code> imprime cada coincidencia por separado. Para contar esas coincidencias se puede conectar su salida con <code>wc -l</code>.</p>',
                  ejemplo: ["grep -c 'ok' demo-cuenta.txt", "grep -o 'ok' demo-cuenta.txt"] },
                { id: 't3-practica-contar-lineas', tipo: 'practica', titulo: 'Cuántas líneas contienen 80',
                  pide: 'Haz que <code>grep</code> muestre solamente cuántas líneas de <code>lecturas.txt</code> contienen <code>80</code>. Cuenta también el 80 que aparece dentro de 1080.',
                  ejemplo: "grep -c '80' lecturas.txt", meta: { salida: '3' }, aprendizaje: { comando: 'grep' },
                  pistas: ['La primera línea cuenta una sola vez, aunque repita el patrón.', 'La pregunta pide líneas seleccionadas, no el número total de apariciones.', 'Busca la opción de recuento de grep.'],
                  explica: 'Coinciden las líneas primera, segunda y cuarta: -c informa de tres líneas.' },
                { id: 't3-practica-extraer-coincidencias', tipo: 'practica', titulo: 'Cada aparición es una señal',
                  pide: 'Ahora extrae con <code>grep</code> cada aparición de <code>80</code> de <code>lecturas.txt</code>, una por línea, sin imprimir el resto del registro.',
                  ejemplo: "grep -o '80' lecturas.txt", meta: { salida: '80\n80\n80\n80' }, aprendizaje: { comando: 'grep' },
                  pistas: ['Esta vez la primera línea debe producir dos resultados.', 'El resultado contiene fragmentos coincidentes, no registros completos.', 'La opción de «solo coincidencia» cambia qué parte imprime grep.'],
                  explica: '-o obtiene cuatro fragmentos: dos de la primera línea, uno de 1080 y uno de la última.' },
                { id: 't3-test-contar', tipo: 'test', pregunta: 'Una línea contiene <code>fallo fallo fallo</code>. ¿Qué diferencia hay entre <code>grep -c fallo</code> y <code>grep -o fallo | wc -l</code>?', opciones: [
                  { t: 'El primero da 1; la tubería da 3.', ok: true, porque: '-c cuenta la línea; -o produce una línea por cada una de las tres coincidencias.' },
                  { t: 'Ambos dan 3.', porque: '-c no cuenta apariciones individuales dentro de la misma línea.' },
                  { t: 'El primero da 3 y la tubería da 1.', porque: 'Está invertida la diferencia entre líneas y coincidencias.' }
                ] }
              ]
            }
          ]
        },
        {
          id: 't3-huellas', titulo: 'Las huellas de la señal', resumen: 'IPv4, MAC, correo y alias con sangría', comando: 'egrep',
          rondas: [
            {
              id: 't3-huellas-red', titulo: 'Leer huellas de red', resumen: 'Escapar puntos y repetir grupos',
              inicio: { base: 'vacio', fs: {
                '~/demo-red.txt': 'version 2.7\nversion 2x7\n', '~/demo-mac.txt': 'AA:BB:01\nAA:BB\n',
                '~/red.txt': 'inet 172.20.4.8/24\nrespaldo 10.7.0.12\nformato 999.1.2.3\nfalsa 172x20x4x8\n',
                '~/mac.txt': 'bc:24:11:bb:6a:a6\nBC:24:11:BB:6A:A7\nbc:24:11:bb:6a\nbc:24:11:bb:6a:a6:ff\nbc:24:11:bb:6g:a6\n'
              } },
              pantallas: [
                { id: 't3-teoria-huellas', tipo: 'teoria', titulo: 'La forma también tiene límites',
                  html: '<p>Un punto de regex significa cualquier carácter; <code>\\.</code> exige un punto literal. Una IPv4 de formato simple tiene cuatro grupos de uno a tres dígitos. Esto reconoce la forma, pero no comprueba el rango 0–255.</p><p>Una MAC tiene seis pares hexadecimales: cinco pares con sus dos puntos y un par final. <code>-x</code> rechaza grupos de más; <code>-i</code> ignora mayúsculas. Estos ejemplos usan una versión con un punto y una etiqueta de tres pares; los retos necesitan estructuras más largas.</p>',
                  ejemplo: ["egrep -o '[[:digit:]]+\\.[[:digit:]]+' demo-red.txt", "egrep -ix '([[:xdigit:]]{2}:){2}[[:xdigit:]]{2}' demo-mac.txt"] },
                { id: 't3-practica-ipv4', tipo: 'practica', titulo: 'Extraer la forma IPv4',
                  pide: 'Extrae con <code>egrep</code> las cadenas con formato IPv4 de <code>red.txt</code>, sin el texto que las rodea. Este reto comprueba la forma, así que <code>999.1.2.3</code> también se incluye; la cadena con letras x debe quedar fuera.',
                  ejemplo: "egrep -o '([[:digit:]]{1,3}\\.){3}[[:digit:]]{1,3}' red.txt", meta: { salida: '172.20.4.8\n10.7.0.12\n999.1.2.3' }, aprendizaje: { comando: 'egrep' },
                  pistas: ['Busca cuatro grupos numéricos, separados por puntos reales.', 'Puedes repetir tres veces el grupo «dígitos y punto», y terminar con los últimos dígitos.', 'Escapa los puntos y selecciona solo el fragmento coincidente. El rango de cada octeto no forma parte de este reto.'],
                  explica: 'La repetición construye los cuatro grupos y los puntos escapados excluyen 172x20x4x8. Aceptar 999 demuestra que esta regex no valida una dirección utilizable.' },
                { id: 't3-practica-mac', tipo: 'practica', titulo: 'Seis grupos, ni cinco ni siete',
                  pide: 'Con <code>egrep</code>, muestra únicamente las líneas de <code>mac.txt</code> que sean una MAC completa de seis pares hexadecimales separados por dos puntos. Acepta mayúsculas y minúsculas.',
                  ejemplo: "egrep -ix '([[:xdigit:]]{2}:){5}[[:xdigit:]]{2}' mac.txt", meta: { salida: 'bc:24:11:bb:6a:a6\nBC:24:11:BB:6A:A7' }, aprendizaje: { comando: 'egrep' },
                  pistas: ['Cada grupo necesita exactamente dos dígitos hexadecimales.', 'El último grupo no lleva dos puntos detrás; separa ese caso del grupo que se repite.', 'Exige toda la línea y acepta ambos casos de letra para rechazar MAC con un grupo adicional.'],
                  explica: 'Cinco grupos terminados en dos puntos y un par final forman seis pares. La selección completa impide aceptar un prefijo de una MAC de siete grupos.' },
                { id: 't3-test-ip-formato', tipo: 'test', pregunta: 'El patrón de formato IPv4 acepta <code>999.1.2.3</code>. ¿Qué conclusión es correcta?', opciones: [
                  { t: 'Reconoce cuatro grupos de dígitos, pero no valida sus rangos.', ok: true, porque: '{1,3} limita la longitud de cada grupo, no su valor máximo.' },
                  { t: '999 es un octeto IPv4 válido.', porque: 'Los octetos IPv4 van de 0 a 255.' },
                  { t: 'Escapar los puntos habría rechazado 999.', porque: 'Escapar los puntos controla el separador, no el valor numérico.' }
                ] }
              ]
            },
            {
              id: 't3-huellas-config', titulo: 'Identificar remitentes y alias', resumen: 'Patrones simplificados y blancos iniciales',
              inicio: { base: 'vacio', fs: {
                '~/demo-correos.txt': 'luz@faro.org\nsin-dominio\n', '~/demo-bashrc.txt': "alias faro='pwd'\nunalias faro\n",
                '~/correos.txt': 'ana.ruta+1@faro.example\noperador@red.local\nsin-arroba.example\nana@red\nana@@red.local\ntexto ana@red.local\n',
                '~/bashrc.txt': "# alias viejo='ls'\nalias ll='ls -l'\n  alias examen='cd ~/examen'\n\talias puertos='grep 80 servicios.txt'\nmalias x='pwd'\nunalias ll\n"
              } },
              pantallas: [
                { id: 't3-teoria-correos-alias', tipo: 'teoria', titulo: 'Define el alcance de una regla',
                  html: '<p>El ejemplo de correo usa solo letras y cifras antes de @ y dos etiquetas de letras en el dominio. El reto amplía esa regla: parte local con letras ASCII, cifras o <code>._%+-</code>, y un dominio con etiquetas alfanuméricas o guiones y al menos un punto. Es una regla simplificada, no todo el estándar de correo.</p><p>El ejemplo de alias comienza en la primera columna. En el reto tendrás que admitir sangría, exigir <code>alias</code> y un blanco detrás. <code>-n</code> muestra el número original de línea.</p>',
                  ejemplo: ["egrep -x '[[:alnum:]]+@[[:alpha:]]+\\.[[:alpha:]]+' demo-correos.txt", "grep -n '^alias[[:blank:]]' demo-bashrc.txt"] },
                { id: 't3-practica-correo', tipo: 'practica', titulo: 'Un remitente por línea',
                  pide: 'Selecciona con <code>egrep</code> las líneas completas de <code>correos.txt</code> que cumplan la regla simplificada de correo de la teoría. No aceptes texto alrededor ni dominios sin punto.',
                  ejemplo: "egrep -x '[[:alnum:]._%+-]+@[[:alnum:]-]+(\\.[[:alnum:]-]+)+' correos.txt", meta: { salida: 'ana.ruta+1@faro.example\noperador@red.local' }, aprendizaje: { comando: 'egrep' },
                  pistas: ['Hay una parte local, una sola arroba y un dominio formado por etiquetas.', 'El dominio debe tener al menos un punto seguido de otra etiqueta.', 'Exige la línea completa para que «texto correo» no se acepte como si toda ella fuera un correo.'],
                  explica: 'La regla exige una arroba y al menos dos etiquetas de dominio; -x descarta texto adicional. Es una selección didáctica, no una validación completa de correo.' },
                { id: 't3-practica-alias', tipo: 'practica', titulo: 'Alias escondidos en la sangría',
                  pide: 'Con <code>grep</code>, muestra con su número de línea las declaraciones activas de alias de <code>bashrc.txt</code>, aunque empiecen por espacios o tabulador. Excluye comentarios, malias y unalias.',
                  ejemplo: "grep -En '^[[:blank:]]*alias[[:blank:]]+' bashrc.txt", meta: { salida: "2:alias ll='ls -l'\n3:  alias examen='cd ~/examen'\n4:\talias puertos='grep 80 servicios.txt'" }, aprendizaje: { comando: 'grep' },
                  pistas: ['La palabra buscada debe ser la primera tras los blancos iniciales.', 'Admite cero o más blancos antes y exige al menos uno después de alias.', 'Usa una clase que incluya tabuladores y conserva los números de línea con la opción correspondiente.'],
                  explica: 'El patrón anclado admite la sangría y exige alias como declaración completa; -n conserva las posiciones 2, 3 y 4 del fichero.' },
                { id: 't3-test-clase-blank', tipo: 'test', pregunta: '¿Qué evita que un alias sangrado con tabulador se pierda en la búsqueda?', opciones: [
                  { t: 'Usar <code>[[:blank:]]*</code> antes de alias.', ok: true, porque: 'blank incluye espacios y tabuladores, y * permite que no haya sangría.' },
                  { t: 'Buscar solo <code>^alias</code>.', porque: 'Eso exige que alias empiece en la primera columna.' },
                  { t: 'Buscar <code>alias</code> en cualquier posición.', porque: 'También encontraría comentarios y palabras como unalias.' }
                ] }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 't3-taller', titulo: 'Taller de texto', emoji: '🛠️',
      resumen: 'Las pistas están dañadas. Recorta, transforma y guarda los mensajes sin perder el original.',
      lecciones: [
        {
          id: 't3-sed-seleccion', titulo: 'Las ventanas del mensaje', resumen: 'sed -n, p, rangos y d', comando: 'sed',
          rondas: [{
            id: 't3-sed-seleccion-ronda', titulo: 'Decidir qué pasa', resumen: 'Imprimir una parte o descartar ruido',
            inicio: { base: 'vacio', fs: {
              '~/demo-lineas.txt': 'alfa\nbeta\ngamma\ndelta\n',
              '~/bitacora.txt': 'cabecera\n09:00 antena lista\n09:05 pulso recibido\n09:10 rumbo norte\npie\n',
              '~/paquete.txt': 'Package: faro\nVersion: 2\nDescription: Guia de la costa\n Mantiene las rutas locales.\n Incluye un mapa de luces.\n\nDepends: base\n',
              '~/config.txt': '# ajustes\n  # provisional\n\ncanal=7\n\t\nmodo=escucha\n'
            } },
            pantallas: [
              { id: 't3-teoria-sed-p', tipo: 'teoria', titulo: 'sed imprime por defecto',
                html: '<p><code>sed</code> recorre el texto línea a línea. <code>-n</code> desactiva su impresión automática; <code>p</code> imprime las líneas seleccionadas. Una dirección puede ser un número, <code>$</code> o una regex entre barras. Dos direcciones separadas por coma forman un intervalo inclusivo.</p>',
                ejemplo: "sed -n '1,2p' demo-lineas.txt" },
              { id: 't3-practica-sed-rango', tipo: 'practica', titulo: 'El tramo de la bitácora',
                pide: 'Muestra con <code>sed</code> únicamente las líneas 2 a 4 de <code>bitacora.txt</code>, una vez cada una.',
                ejemplo: "sed -n '2,4p' bitacora.txt", meta: { salida: '09:00 antena lista\n09:05 pulso recibido\n09:10 rumbo norte' }, aprendizaje: { comando: 'sed' },
                pistas: ['Las dos direcciones numéricas incluyen ambos extremos.', 'Imprimir una selección requiere el comando p.', 'Desactiva la impresión automática para que no aparezcan las demás líneas ni se duplique el tramo.'],
                explica: '-n silencia la salida automática y 2,4p imprime solo ese intervalo, incluida la segunda y la cuarta línea.' },
              { id: 't3-practica-sed-description', tipo: 'practica', titulo: 'La descripción completa',
                pide: 'En la salida de paquete guardada en <code>paquete.txt</code>, muestra con <code>sed</code> el bloque desde <code>Description:</code> hasta la primera línea vacía, ambos incluidos. No ejecutes apt: ya tienes su muestra local.',
                ejemplo: "sed -n '/^Description:/,/^$/p' paquete.txt", meta: { salida: 'Description: Guia de la costa\n Mantiene las rutas locales.\n Incluye un mapa de luces.\n' }, aprendizaje: { comando: 'sed' },
                pistas: ['La descripción ocupa varias líneas; buscar solo el encabezado perdería la continuación.', 'El inicio y el final del intervalo pueden ser expresiones regulares.', 'Ancla el encabezado al principio y representa la línea vacía con sus dos extremos juntos.'],
                explica: 'El intervalo empieza en Description y se mantiene hasta la línea vacía. -n con p conserva las líneas de continuación sin enseñar Depends.' },
              { id: 't3-teoria-sed-d', tipo: 'teoria', titulo: 'Eliminar del flujo no es editar el fichero',
                html: '<p><code>d</code> descarta una línea de la salida. Sin <code>-i</code>, el fichero original sigue igual. Con varias opciones <code>-e</code> puedes aplicar varias reglas en orden; <code>^[[:space:]]*$</code> reconoce líneas vacías o solo con blancos.</p>',
                ejemplo: "sed -e '1d' -e '$d' demo-lineas.txt" },
              { id: 't3-practica-sed-limpiar', tipo: 'practica', titulo: 'Dos clases de ruido',
                pide: 'Muestra <code>config.txt</code> con <code>sed</code>, suprimiendo tanto comentarios cuyo primer carácter no blanco sea # como líneas vacías o solo con blancos. Conserva los dos ajustes.',
                ejemplo: "sed -e '/^[[:space:]]*#/d' -e '/^[[:space:]]*$/d' config.txt", meta: { salida: 'canal=7\nmodo=escucha' }, aprendizaje: { comando: 'sed' },
                pistas: ['No basta con eliminar líneas que comiencen por # en la primera columna.', 'Distingue la regla de comentario de la regla de línea en blanco.', 'Puedes encadenar dos expresiones -e de borrado; cada una debe reconocer la línea completa que sobra.'],
                explica: 'La primera regla elimina comentarios con sangría; la segunda elimina blancos. sed imprime por defecto las líneas que sobreviven.' },
              { id: 't3-test-sed-duplicados', tipo: 'test', pregunta: '¿Por qué <code>sed \'2p\' fichero</code> muestra dos veces la línea 2?', opciones: [
                { t: 'Por la impresión automática más la orden p.', ok: true, porque: '-n desactiva la salida automática y permite imprimir solo la selección.' },
                { t: 'Porque p significa imprimir dos veces.', porque: 'p imprime una vez; la segunda copia procede del comportamiento por defecto.' },
                { t: 'Porque la dirección 2 selecciona dos líneas.', porque: 'Una dirección numérica selecciona únicamente esa línea.' }
              ] }
            ]
          }]
        },
        {
          id: 't3-sed-sustituir', titulo: 'Reparar las palabras', resumen: 'Primera coincidencia, g, i y &', comando: 'sed',
          rondas: [{
            id: 't3-sed-sustituir-ronda', titulo: 'Cambiar lo necesario', resumen: 'Patrón, reemplazo y alcance',
            inicio: { base: 'vacio', fs: {
              '~/demo-texto.txt': 'vela vela\nVELA al norte\n', '~/demo-cifras.txt': 'canal 4, pulso 27\n',
              '~/relevo.txt': 'nodo nodo\nel nodo responde\n', '~/avisos.txt': 'alerta ALERTA Alerta\nsin aviso\n', '~/lecturas.txt': 'canal 12, nivel 7\npulso 300\n'
            } },
            pantallas: [
              { id: 't3-teoria-sed-s', tipo: 'teoria', titulo: 'Una sustitución por línea, salvo que pidas más',
                html: '<p><code>s/patrón/reemplazo/</code> cambia la primera coincidencia de cada línea. <code>g</code> cambia todas las de esa línea; <code>i</code> ignora mayúsculas. En el reemplazo, <code>&amp;</code> representa el texto completo que ha coincidido.</p>',
                ejemplo: ["sed 's/vela/faro/' demo-texto.txt", "sed 's/vela/faro/gi' demo-texto.txt", "sed 's/[[:digit:]]\\{1,\\}/(&)/g' demo-cifras.txt"] },
              { id: 't3-practica-sed-primera', tipo: 'practica', titulo: 'Solo el primer relevo',
                pide: 'Muestra <code>relevo.txt</code> sustituyendo únicamente la primera aparición de <code>nodo</code> de cada línea por <code>faro</code>. Usa <code>sed</code> sin modificar el fichero.',
                ejemplo: "sed 's/nodo/faro/' relevo.txt", meta: { salida: 'faro nodo\nel faro responde' }, aprendizaje: { comando: 'sed' },
                pistas: ['Cada línea inicia su propia búsqueda de la primera coincidencia.', 'Necesitas una sustitución normal, sin ampliar su alcance.', 'La bandera global cambiaría también el segundo nodo de la primera línea.'],
                explica: 'Sin g, la primera línea conserva su segundo nodo; la segunda cambia su única aparición.' },
              { id: 't3-practica-sed-global-i', tipo: 'practica', titulo: 'Unificar todas las alertas',
                pide: 'Muestra <code>avisos.txt</code> con todas las variantes de <code>alerta</code> cambiadas a <code>AVISO</code>, independientemente de las mayúsculas. Usa <code>sed</code>.',
                ejemplo: "sed 's/alerta/AVISO/gi' avisos.txt", meta: { salida: 'AVISO AVISO AVISO\nsin aviso' }, aprendizaje: { comando: 'sed' },
                pistas: ['Cambiar solo la primera coincidencia dejaría dos palabras sin reparar.', 'La repetición y la diferencia de mayúsculas son dos problemas distintos.', 'Combina la bandera de alcance global y la de búsqueda sin distinguir el caso.'],
                explica: 'g cambia las tres coincidencias de la primera línea e i permite reconocer sus distintas mayúsculas.' },
              { id: 't3-practica-sed-ampersand', tipo: 'practica', titulo: 'Enmarcar sin conocer el número',
                pide: 'Usa <code>sed</code> para mostrar <code>lecturas.txt</code> con cada secuencia de cifras entre corchetes, manteniendo su valor y todo el texto restante.',
                ejemplo: "sed 's/[[:digit:]]\\{1,\\}/[&]/g' lecturas.txt", meta: { salida: 'canal [12], nivel [7]\npulso [300]' }, aprendizaje: { comando: 'sed' },
                pistas: ['El patrón debe reunir todas las cifras consecutivas de cada número.', 'No escribas los valores concretos en el reemplazo: recupera lo que ha coincidido.', 'El símbolo & en el reemplazo conserva la coincidencia completa; repite el cambio en toda la línea.'],
                explica: 'La repetición agrupa las cifras de cada número y [&] añade los corchetes sin perder el valor capturado.' },
              { id: 't3-test-sed-g', tipo: 'test', pregunta: '¿Qué significa g en <code>sed \'s/rojo/azul/g\'</code>?', opciones: [
                { t: 'Cambiar todas las coincidencias de cada línea.', ok: true, porque: 'sed ya procesa todas las líneas; g amplía la sustitución dentro de cada una.' },
                { t: 'Guardar el cambio automáticamente en el fichero.', porque: 'Para editar el fichero se necesita -i, o guardar la salida en otro destino.' },
                { t: 'Ignorar mayúsculas.', porque: 'La bandera que ignora mayúsculas es i.' }
              ] }
            ]
          }]
        },
        {
          id: 't3-sed-guardar', titulo: 'La copia del cartógrafo', resumen: 'Capturas, redirección y sed -i.bak', comando: 'sed',
          rondas: [{
            id: 't3-sed-guardar-ronda', titulo: 'Guardar con criterio', resumen: 'Separar salida, copia y edición',
            inicio: { base: 'vacio', fs: {
              '~/demo-inventario.txt': 'vela:4\nancla:8\n', '~/demo-enlace.conf': 'modo=lento\n',
              '~/inventario.txt': 'baliza:17\nantena:4\n', '~/enlace.conf': 'activo=no\ncanal=7\n',
              '~/fuentes.list': 'deb stable main\n# deb-src stable main\ndeb-src stable main\ndeb-src stable contrib\n'
            } },
            pantallas: [
              { id: 't3-teoria-sed-capturas', tipo: 'teoria', titulo: 'Capturar para cambiar el orden',
                html: '<p>En <code>sed -E</code>, los paréntesis capturan partes del patrón. El reemplazo usa <code>\\1</code>, <code>\\2</code>… para recuperarlas. Una redirección a otro nombre guarda el resultado y conserva la fuente.</p><p><code>-i.bak</code> edita el fichero y guarda su contenido anterior con sufijo <code>.bak</code>. Evita redirigir la salida al mismo fichero que estás leyendo: la shell podría vaciarlo antes de leer.</p>',
                ejemplo: ["sed -E 's/^([[:alpha:]]+):([[:digit:]]+)$/\\2 - \\1/' demo-inventario.txt", "sed -i.bak 's/lento/rapido/' demo-enlace.conf"] },
              { id: 't3-practica-sed-grupos', tipo: 'practica', titulo: 'Número antes del nombre',
                pide: 'Transforma <code>inventario.txt</code> con <code>sed -E</code>: cada registro <code>nombre:numero</code> debe quedar como <code>numero;nombre</code>. Guarda el resultado en <code>ordenado.txt</code> y conserva el inventario original.',
                ejemplo: "sed -E 's/^([[:alpha:]]+):([[:digit:]]+)$/\\2;\\1/' inventario.txt > ordenado.txt", meta: { existe: 'ordenado.txt', contenido: { 'ordenado.txt': '17;baliza\n4;antena\n', 'inventario.txt': 'baliza:17\nantena:4\n' } }, aprendizaje: { comando: 'sed' },
                pistas: ['Separa el nombre y el número en dos grupos del patrón.', 'El reemplazo debe recuperar primero el segundo grupo y después el primero.', 'Guarda la salida en un destino distinto de la entrada; las referencias numeradas evitan escribir valores fijos.'],
                explica: 'Las dos capturas reconocen los campos; el reemplazo invierte su orden y la redirección crea ordenado.txt sin editar inventario.txt.' },
              { id: 't3-practica-sed-copia', tipo: 'practica', titulo: 'Activar conservando el pasado',
                pide: 'Edita <code>enlace.conf</code> con <code>sed</code> para que la línea completa <code>activo=no</code> pase a <code>activo=si</code>. Conserva automáticamente el contenido anterior en <code>enlace.conf.bak</code>.',
                ejemplo: "sed -i.bak 's/^activo=no$/activo=si/' enlace.conf", meta: { existe: ['enlace.conf', 'enlace.conf.bak'], contenido: { 'enlace.conf': 'activo=si\ncanal=7\n', 'enlace.conf.bak': 'activo=no\ncanal=7\n' } }, aprendizaje: { comando: 'sed' },
                pistas: ['El cambio debe quedar guardado, no solo aparecer en pantalla.', 'La opción de edición puede recibir el sufijo de una copia del original.', 'Ancla el ajuste completo para no alterar otras claves y usa .bak como sufijo de respaldo.'],
                explica: '-i.bak guarda la versión anterior antes de editar. Las anclas limitan la sustitución al ajuste exacto.' },
              { id: 't3-teoria-sed-direccion', tipo: 'teoria', titulo: 'Una dirección limita la sustitución',
                html: '<p>Una dirección antes de <code>s</code> decide en qué líneas se aplica. Por ejemplo, <code>/^clave=/s/viejo/nuevo/</code> cambia ese valor solo en líneas que empiecen por la clave indicada.</p>',
                ejemplo: "sed '/^modo=/s/lento/rapido/' demo-enlace.conf" },
              { id: 't3-practica-sed-direccion', tipo: 'practica', titulo: 'Cambiar solo las fuentes activas',
                pide: 'Edita <code>fuentes.list</code> con <code>sed</code>: cambia <code>stable</code> por <code>testing</code> solo en líneas activas que empiecen por <code>deb-src</code> y un blanco. La línea deb y el comentario deben conservarse.',
                ejemplo: "sed -i '/^deb-src[[:blank:]]/s/stable/testing/g' fuentes.list", meta: { existe: 'fuentes.list', contenido: { 'fuentes.list': 'deb stable main\n# deb-src stable main\ndeb-src testing main\ndeb-src testing contrib\n' } }, aprendizaje: { comando: 'sed' },
                pistas: ['Una sustitución global sin dirección alteraría también líneas que debes conservar.', 'Decide primero qué comienzo identifica una fuente activa deb-src.', 'Coloca esa dirección delante de la sustitución y guarda el cambio mediante edición del fichero.'],
                explica: 'La dirección excluye deb y # deb-src. Solo las dos fuentes activas llegan a ejecutar la sustitución.' },
              { id: 't3-test-sed-i-bak', tipo: 'test', pregunta: '¿Qué contiene <code>datos.txt.bak</code> después de <code>sed -i.bak \'s/a/b/\' datos.txt</code>?', opciones: [
                { t: 'El contenido de datos.txt anterior a la edición.', ok: true, porque: 'El sufijo de -i pide conservar una copia de la versión original.' },
                { t: 'Solo las líneas que han cambiado.', porque: 'La copia contiene todo el fichero anterior, no únicamente las diferencias.' },
                { t: 'La nueva versión, mientras datos.txt queda igual.', porque: '-i edita datos.txt y la copia guarda la versión previa.' }
              ] }
            ]
          }]
        }
      ]
    },
    {
      id: 't3-observatorio', titulo: 'Observatorio de datos', emoji: '🔭',
      resumen: 'Las coordenadas se esconden en columnas. Lee registros, compara campos y ordena los pulsos.',
      lecciones: [
        {
          id: 't3-awk-campos', titulo: 'Coordenadas del registro', resumen: 'print, -F, $NF, NR y NF', comando: 'awk',
          rondas: [
            {
              id: 't3-awk-campos-ronda', titulo: 'Separar antes de leer', resumen: 'Último campo y número de campos',
              inicio: { base: 'vacio', fs: {
                '~/demo-campos.txt': 'luz:4:este\nvela:9:oeste\n', '~/demo-blancos.txt': 'vela  4 este\n',
                '~/usuarios.txt': 'root:x:0:0:root:/root:/bin/bash\nana:x:1000:1000:Ana:/home/ana:/bin/zsh\ninvitado:x:1001:1001:Invitado:/home/invitado:/bin/sh\n',
                '~/medidas.txt': 'este 8 claro\n  oeste   15    niebla\nsur 5\n'
              } },
              pantallas: [
                { id: 't3-teoria-awk-campos', tipo: 'teoria', titulo: 'Cada línea es un registro',
                  html: '<p><code>awk</code> divide cada registro en campos: <code>$1</code> es el primero, <code>$0</code> la línea completa y <code>$NF</code> el último. <code>NF</code> es el número de campos; <code>NR</code>, el número de registro.</p><p><code>-F</code> elige el separador. Sin él, los grupos de espacios y tabuladores separan campos. En <code>print $1,$2</code>, la coma imprime un espacio entre valores. print es una acción de awk, no un comando de Bash.</p>',
                  ejemplo: ["awk -F: '{print $2,$NF}' demo-campos.txt", "awk '{print NR,$1,NF}' demo-blancos.txt"] },
                { id: 't3-practica-awk-ultimo', tipo: 'practica', titulo: 'El usuario y su shell',
                  pide: 'Usa <code>awk</code> con el separador de <code>usuarios.txt</code> para mostrar el primer y el último campo de cada registro, separados por un espacio. Selecciona el último mediante <code>$NF</code>.',
                  ejemplo: "awk -F: '{print $1,$NF}' usuarios.txt", meta: { salida: 'root /bin/bash\nana /bin/zsh\ninvitado /bin/sh' }, aprendizaje: { comando: 'awk' },
                  pistas: ['El fichero separa los campos con dos puntos.', 'La variable NF contiene cuántos campos hay, y puede usarse para localizar el último.', 'Imprime dos expresiones separadas por coma: el primer campo y el campo cuyo índice es NF.'],
                  explica: '-F: fija el separador y $NF recupera la shell final. La coma de print separa ambos valores con un espacio.' },
                { id: 't3-practica-awk-nr-nf', tipo: 'practica', titulo: 'Tres medidas de cada línea',
                  pide: 'En <code>medidas.txt</code>, muestra con <code>awk</code> el número de registro, su cantidad de campos y su último campo, en ese orden y separados por espacios. Los espacios repetidos no son campos vacíos.',
                  ejemplo: "awk '{print NR,NF,$NF}' medidas.txt", meta: { salida: '1 3 claro\n2 3 niebla\n3 2 5' }, aprendizaje: { comando: 'awk' },
                  pistas: ['No necesitas fijar un separador de un solo espacio.', 'Distingue la posición de la línea de la cantidad de campos de esa línea.', 'NR cuenta registros, NF cuenta campos y $NF obtiene el contenido del último.'],
                  explica: 'La separación por blancos agrupa los espacios consecutivos. Por eso la segunda línea tiene tres campos y la tercera, dos.' },
                { id: 't3-test-awk-variables', tipo: 'test', pregunta: '¿Cuál es la diferencia entre <code>NF</code> y <code>$NF</code>?', opciones: [
                  { t: 'NF es la cantidad de campos; $NF es el contenido del último.', ok: true, porque: 'El dólar usa el valor de NF como índice del campo que se quiere leer.' },
                  { t: 'NF es el nombre del fichero y $NF el número de línea.', porque: 'NF cuenta campos y NR cuenta registros; el nombre del fichero no es NF.' },
                  { t: 'Son dos formas de escribir el primer campo.', porque: 'El primer campo es $1.' }
                ] }
              ]
            },
            {
              id: 't3-awk-registros-ronda', titulo: 'Elegir registros', resumen: 'Omitir cabeceras y reconocer una línea',
              inicio: { base: 'vacio', fs: {
                '~/demo-tabla.csv': 'objeto;unidades;zona\nvela;4;sur\n', '~/demo-eventos.log': 'BIEN: listo\nMAL: perdido\n',
                '~/medidas.csv': 'baliza;potencia;rumbo\nA1;17;norte\nB2;9;este\nC3;12;sur\n',
                '~/enlace.log': 'INFO: buscando\nOK: antena visible\nNOOK: ensayo\nOK: canal abierto\n'
              } },
              pantallas: [
                { id: 't3-teoria-awk-registros', tipo: 'teoria', titulo: 'La condición va antes de la acción',
                  html: '<p>Una condición antes de las llaves decide qué registros ejecutan <code>print</code>. <code>NR &gt;= 2</code> omite una primera cabecera. Un patrón <code>/regex/</code> busca en el registro completo y awk lo interpreta como ERE.</p>',
                  ejemplo: ["awk -F';' 'NR >= 2 {print $1,$2}' demo-tabla.csv", "awk '/^BIEN:/ {print $0}' demo-eventos.log"] },
                { id: 't3-practica-awk-cabecera', tipo: 'practica', titulo: 'El rumbo sin la cabecera',
                  pide: 'Muestra con <code>awk</code> los campos primero y tercero de <code>medidas.csv</code>, separados por espacio, omitiendo su primera línea de cabecera. Es una tabla simple sin separadores dentro de campos.',
                  ejemplo: "awk -F';' 'NR >= 2 {print $1,$3}' medidas.csv", meta: { salida: 'A1 norte\nB2 este\nC3 sur' }, aprendizaje: { comando: 'awk' },
                  pistas: ['El carácter que separa campos no es un blanco.', 'Usa el número de registro para que la primera línea no ejecute print.', 'La condición debe permitir desde la segunda línea hasta el final.'],
                  explica: '-F elige el punto y coma; NR >= 2 excluye la cabecera y print muestra baliza y rumbo.' },
                { id: 't3-practica-awk-patron', tipo: 'practica', titulo: 'El registro confirmado',
                  pide: 'Usa un patrón de <code>awk</code> para mostrar las líneas completas de <code>enlace.log</code> que empiecen exactamente por <code>OK:</code>. <code>NOOK:</code> no debe pasar.',
                  ejemplo: "awk '/^OK:/ {print $0}' enlace.log", meta: { salida: 'OK: antena visible\nOK: canal abierto' }, aprendizaje: { comando: 'awk' },
                  pistas: ['La coincidencia debe comenzar en la primera columna.', 'Un patrón entre barras puede seleccionar el registro antes de ejecutar la acción.', 'Para conservar la línea completa imprime el campo especial que la representa.'],
                  explica: 'El ancla excluye NOOK y $0 conserva todo el registro, incluidos los espacios y el mensaje.' },
                { id: 't3-test-awk-print', tipo: 'test', pregunta: '¿Qué falla en escribir <code>print $1</code> directamente como comando de Bash?', opciones: [
                  { t: 'print es una acción que aquí debe ir dentro del programa de awk.', ok: true, porque: 'Las llaves contienen la acción y las comillas protegen $1 para que lo interprete awk.' },
                  { t: 'A print le falta siempre -F.', porque: '-F es una opción de awk para elegir separador; no convierte print en un comando Bash.' },
                  { t: 'Solo falla si el fichero tiene más de una línea.', porque: 'El problema es la sintaxis y el intérprete, no la cantidad de registros.' }
                ] }
              ]
            }
          ]
        },
        {
          id: 't3-awk-condiciones', titulo: 'Cruzar las coordenadas', resumen: 'Igualdad, regex de campo y &&', comando: 'awk',
          rondas: [{
            id: 't3-awk-condiciones-ronda', titulo: 'Preguntas sobre campos', resumen: 'Distinguir una cuenta de un texto parecido',
            inicio: { base: 'vacio', fs: {
              '~/demo-zonas.txt': 'norte 8\nsur 12\nsur 3\n',
              '~/cuentas.txt': 'root:x:0:0:root:/root:/bin/bash\nvigia:x:1000:1000:Vigia:/home/vigia:/bin/bash\nvigia2:x:1001:1001:Otro:/home/vigia2:/bin/bash.old\nmar:x:1002:1002:Mar:/home/mar:/usr/bin/bash\nsol:x:1003:1003:Sol:/home/sol:/bin/zsh\n'
            } },
            pantallas: [
              { id: 't3-teoria-awk-condiciones', tipo: 'teoria', titulo: 'Igualdad no es asignación',
                html: '<p><code>==</code> compara un campo con un valor exacto; <code>~ /regex/</code> comprueba una ERE en ese campo. <code>&amp;&amp;</code> exige ambas condiciones. Para umbrales numéricos puedes usar <code>&gt;=</code>, <code>&lt;</code> y otros comparadores.</p><p>Usa <code>==</code> para comparar: un único <code>=</code> es una asignación en awk real, no una prueba de igualdad.</p>',
                ejemplo: ["awk '$1 == \"sur\" {print $0}' demo-zonas.txt", "awk '$1 ~ /sur$/ && $2 >= 10 {print $1,$2}' demo-zonas.txt"] },
              { id: 't3-practica-awk-igualdad', tipo: 'practica', titulo: 'Una cuenta exacta',
                pide: 'En <code>cuentas.txt</code>, usa <code>awk</code> para mostrar nombre y UID únicamente de la cuenta cuyo primer campo sea exactamente <code>vigia</code>. <code>vigia2</code> debe quedar fuera.',
                ejemplo: "awk -F: '$1 == \"vigia\" {print $1,$3}' cuentas.txt", meta: { salida: 'vigia 1000' }, aprendizaje: { comando: 'awk' },
                pistas: ['La identidad está en el primer campo y el UID en el tercero.', 'Buscar la subcadena vigia también aceptaría vigia2.', 'Compara el campo completo con una cadena usando el operador de igualdad.'],
                explica: 'La comparación exacta de $1 descarta vigia2; print muestra el nombre y el UID de la única cuenta seleccionada.' },
              { id: 't3-practica-awk-shell', tipo: 'practica', titulo: 'La shell debe terminar en bash',
                pide: 'Usa <code>awk</code> para mostrar los nombres de las cuentas de <code>cuentas.txt</code> cuyo séptimo campo termine en <code>bash</code>. Incluye /usr/bin/bash y excluye /bin/bash.old.',
                ejemplo: "awk -F: '$7 ~ /bash$/ {print $1}' cuentas.txt", meta: { salida: 'root\nvigia\nmar' }, aprendizaje: { comando: 'awk' },
                pistas: ['La condición debe mirar el campo de la shell, no todo el registro.', 'No necesitas fijar la ruta completa si te piden cómo termina.', 'El operador ~ relaciona un campo con la regex; el ancla final evita aceptar .old.'],
                explica: '$7 limita la búsqueda a la shell y bash$ exige ese final; root, vigia y mar cumplen, pero vigia2 no.' },
              { id: 't3-practica-awk-doble', tipo: 'practica', titulo: 'Cuenta personal y shell correcta',
                pide: 'Muestra con <code>awk</code> nombre y UID de las cuentas de <code>cuentas.txt</code> que tengan UID mayor o igual a 1000 y una shell que termine en bash. Deben cumplirse ambas condiciones.',
                ejemplo: "awk -F: '$3 >= 1000 && $7 ~ /bash$/ {print $1,$3}' cuentas.txt", meta: { salida: 'vigia 1000\nmar 1002' }, aprendizaje: { comando: 'awk' },
                pistas: ['El umbral numérico excluye root; el final de la shell excluye otros dos registros.', 'Cada condición se aplica a un campo distinto.', 'Une la comparación numérica y la prueba de regex con el operador lógico que exige ambas.'],
                explica: '&& cruza los dos filtros: no basta con tener UID personal ni basta con usar bash. Solo vigia y mar cumplen ambos.' },
              { id: 't3-test-awk-igualdad', tipo: 'test', pregunta: 'Para comprobar dos campos, ¿qué condición expresa la intención sin modificar datos?', opciones: [
                { t: '<code>$1 == "ana" &amp;&amp; $7 == "/bin/bash"</code>', ok: true, porque: 'Ambos == comparan y && exige las dos comparaciones verdaderas.' },
                { t: '<code>$1 == "ana" &amp;&amp; $7 = "/bin/bash"</code>', porque: 'El segundo = asigna un valor en awk real; no compara la shell.' },
                { t: '<code>/ana|bash/</code>', porque: 'Eso busca cualquiera de esas palabras en cualquier parte del registro y no comprueba ambos campos.' }
              ] }
            ]
          }]
        },
        {
          id: 't3-filtros', titulo: 'El ritmo de los pulsos', resumen: 'tr, uniq, sort y lectura con less', comando: 'tr',
          rondas: [
            {
              id: 't3-filtros-caracteres', titulo: 'Normalizar caracteres', resumen: 'Entrada estándar, traducción y repetición',
              inicio: { base: 'vacio', fs: {
                '~/demo-espacios.txt': 'vela   al  sur\n', '~/demo-codigo.txt': 'faro c3\n',
                '~/baliza.txt': 'luz    al   norte\npulso  recibido\n', '~/codigo.txt': 'canal a7\nruta sur\n'
              } },
              pantallas: [
                { id: 't3-teoria-tr', tipo: 'teoria', titulo: 'tr recibe texto, no un nombre de fichero',
                  html: '<p><code>tr</code> lee de la entrada estándar: usa una redirección de entrada o una tubería. Traduce caracteres con dos conjuntos; <code>-s</code> comprime las repeticiones del conjunto indicado y <code>-d</code> las elimina.</p><p>Estos ejercicios usan ASCII: el rango a-z no resuelve por sí solo letras acentuadas.</p>',
                  ejemplo: ["tr -s ' ' < demo-espacios.txt", "tr 'a-z' 'A-Z' < demo-codigo.txt"] },
                { id: 't3-practica-tr-s', tipo: 'practica', titulo: 'Un espacio entre pulsos',
                  pide: 'Usa <code>tr</code> para comprimir los espacios repetidos de <code>baliza.txt</code> a uno solo y guarda el resultado en <code>normalizado.txt</code>. Conserva las líneas y el fichero original.',
                  ejemplo: "tr -s ' ' < baliza.txt > normalizado.txt", meta: { existe: 'normalizado.txt', contenido: { 'normalizado.txt': 'luz al norte\npulso recibido\n', 'baliza.txt': 'luz    al   norte\npulso  recibido\n' } }, aprendizaje: { comando: 'tr' },
                  pistas: ['No se pide borrar todos los espacios, sino reducir sus repeticiones.', 'El texto debe llegar por la entrada estándar.', 'Selecciona el espacio como conjunto a comprimir y dirige la salida al nuevo nombre.'],
                  explica: '-s agrupa espacios consecutivos en uno; las redirecciones leen la muestra y crean un fichero distinto.' },
                { id: 't3-practica-tr-mayus', tipo: 'practica', titulo: 'El código en mayúsculas',
                  pide: 'Convierte las letras ASCII minúsculas de <code>codigo.txt</code> a mayúsculas con <code>tr</code> y guarda <code>codigo-mayus.txt</code>. Conserva cifras, espacios y saltos de línea.',
                  ejemplo: "tr 'a-z' 'A-Z' < codigo.txt > codigo-mayus.txt", meta: { existe: 'codigo-mayus.txt', contenido: { 'codigo-mayus.txt': 'CANAL A7\nRUTA SUR\n', 'codigo.txt': 'canal a7\nruta sur\n' } }, aprendizaje: { comando: 'tr' },
                  pistas: ['Cada letra del conjunto de origen se corresponde con una del destino.', 'Los caracteres ajenos a ese conjunto deben pasar sin cambios.', 'Lee mediante entrada estándar y usa los rangos ASCII de minúsculas y mayúsculas.'],
                  explica: 'La traducción carácter a carácter cambia las letras de a-z y mantiene todo lo demás.' },
                { id: 't3-test-tr-entrada', tipo: 'test', pregunta: '¿Cómo lee tr el contenido de un fichero?', opciones: [
                  { t: 'Por entrada estándar: <code>tr ... &lt; fichero</code> o una tubería.', ok: true, porque: 'tr transforma un flujo recibido por su entrada estándar.' },
                  { t: 'Siempre como último argumento: <code>tr a b fichero</code>.', porque: 'Los argumentos de tr describen conjuntos y opciones, no ficheros de entrada.' },
                  { t: 'Solo si abres antes el fichero con less.', porque: 'less sirve para leer por páginas; no es un requisito de tr.' }
                ] }
              ]
            },
            {
              id: 't3-filtros-duplicados', titulo: 'Escuchar el orden', resumen: 'Duplicados adyacentes y totales',
              inicio: { base: 'vacio', fs: { '~/demo-pulsos.txt': 'sur\nsur\neste\n', '~/senales.txt': 'alfa\nalfa\nbeta\nalfa\nbeta\nbeta\n' } },
              pantallas: [
                { id: 't3-teoria-uniq', tipo: 'teoria', titulo: 'uniq compara vecinos',
                  html: '<p><code>uniq</code> reúne líneas iguales solo cuando son consecutivas. <code>-c</code> muestra el tamaño de cada grupo. Para reunir todas las apariciones de cada texto, ordena primero con <code>sort</code>; la tubería entrega ese orden a uniq.</p><p>En una terminal real puedes revisar un fichero grande con <code>less fichero</code>: <code>/palabra</code> busca hacia delante, <code>n</code> repite en la misma dirección, <code>N</code> en la contraria y <code>q</code> sale. El simulador muestra el texto, sin fingir un paginador interactivo.</p>',
                  ejemplo: ['uniq -c demo-pulsos.txt', 'sort demo-pulsos.txt | uniq -c'] },
                { id: 't3-practica-uniq-vecinos', tipo: 'practica', titulo: 'Contar los grupos que llegaron',
                  pide: 'Usa <code>uniq -c</code> directamente sobre <code>senales.txt</code>, sin ordenar, para mostrar el tamaño de cada grupo consecutivo. Las alfa que vuelven más tarde deben seguir en otro grupo.',
                  ejemplo: 'uniq -c senales.txt', meta: { salida: '      2 alfa\n      1 beta\n      1 alfa\n      2 beta' }, aprendizaje: { comando: 'uniq' },
                  pistas: ['El orden de llegada importa en este paso.', 'Cada cambio de texto termina un grupo y comienza otro.', 'Activa el recuento de uniq sin introducir una ordenación previa.'],
                  explica: 'Hay cuatro grupos consecutivos, aunque solo dos textos distintos: uniq no busca duplicados a distancia.' },
                { id: 't3-practica-uniq-total', tipo: 'practica', titulo: 'Contar cada señal una sola vez',
                  pide: 'Obtén el total de apariciones de cada texto de <code>senales.txt</code>, en orden alfabético. Usa una tubería que ordene las líneas y luego cuente los grupos con <code>uniq</code>.',
                  ejemplo: 'sort senales.txt | uniq -c', meta: { salida: '      3 alfa\n      3 beta' }, aprendizaje: { comando: 'sort' },
                  pistas: ['Las apariciones que estaban separadas deben volverse vecinas.', 'La primera herramienta debe agrupar por orden y la segunda contar.', 'El flujo de sort debe alimentar a uniq con la opción de recuento.'],
                  explica: 'sort reúne todas las alfa y todas las beta; uniq -c puede entonces contar tres apariciones de cada una.' },
                { id: 't3-test-less', tipo: 'test', pregunta: 'En less real has buscado <code>/canal</code>. ¿Cómo repites la búsqueda en la misma dirección y sales después?', opciones: [
                  { t: 'Pulsa n para repetir y q para salir.', ok: true, porque: 'n mantiene la dirección de la búsqueda anterior y q cierra el paginador.' },
                  { t: 'Pulsa N para repetir siempre hacia delante y exit para salir.', porque: 'N invierte la dirección anterior; less se cierra con q.' },
                  { t: 'Pulsa Ctrl+B y d.', porque: 'Esa secuencia desacopla una sesión tmux; no controla less.' }
                ] }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 't3-torre', titulo: 'Torre de enlace', emoji: '🗼',
      resumen: 'Prepara los nombres, decide cómo recuperar la sesión remota y reconstruye la última señal.',
      lecciones: [
        {
          id: 't3-rename', titulo: 'Los nombres del mapa', resumen: 'rename de Perl, ensayo y UUID anclado', comando: 'rename',
          rondas: [
            {
              id: 't3-rename-plan', titulo: 'Mirar antes de renombrar', resumen: 'Final de nombre y mayúsculas',
              inicio: { base: 'vacio', fs: { '~/muestra.log': 'demo\n', '~/informe.TXT': 'coordenadas\n', '~/informe.txt.bak': 'respaldo\n' } },
              pantallas: [
                { id: 't3-teoria-rename', tipo: 'teoria', titulo: 'La expresión cambia nombres',
                  html: '<p>Usamos la variante Perl de <code>rename</code>: <code>s/patrón/reemplazo/</code>. <code>-n</code> enseña un ensayo sin renombrar; <code>-v</code> informa de los cambios al aplicarlos. <code>i</code> ignora mayúsculas y <code>g</code> sustituye todas las coincidencias del nombre.</p><p>El punto de una extensión se escapa y <code>$</code> exige el final. El patrón cambia el nombre, no el contenido. En una máquina real identifica la variante con <code>rename --help</code>; rename de util-linux tiene otra sintaxis.</p>',
                  ejemplo: "rename -n 's/\\.log$/.txt/' ./muestra.log" },
                { id: 't3-practica-rename-ensayo', tipo: 'practica', titulo: 'Ensayar la nueva extensión',
                  pide: 'Con <code>rename</code> de Perl, ensaya el cambio de la extensión final <code>.txt</code> a <code>.md</code>, sin distinguir mayúsculas, sobre <code>./informe*</code>. No apliques cambios y no incluyas <code>.txt.bak</code> en el plan.',
                  ejemplo: "rename -n 's/\\.txt$/.md/i' ./informe*", meta: { salida: 'rename(./informe.TXT, ./informe.md)', existe: ['informe.TXT', 'informe.txt.bak'], noExiste: 'informe.md' }, aprendizaje: { comando: 'rename', opciones: ['-n'] },
                  pistas: ['El modo de ensayo debe mostrar un cambio sin modificar los nombres.', 'La extensión tiene que estar al final; el respaldo termina en .bak.', 'Escapa el punto, ancla el final y usa la bandera que ignora el caso de TXT.'],
                  explica: '-n muestra el único cambio previsto. El ancla final impide tocar informe.txt.bak y la bandera i admite TXT.' },
                { id: 't3-practica-rename-aplicar', tipo: 'practica', titulo: 'Aplicar el plan revisado',
                  pide: 'Aplica ahora ese cambio de extensión a <code>./informe*</code> con <code>rename</code>. Debe existir <code>informe.md</code> con su contenido, desaparecer <code>informe.TXT</code> y conservarse el respaldo.',
                  ejemplo: "rename 's/\\.txt$/.md/i' ./informe*", meta: { existe: ['informe.md', 'informe.txt.bak'], noExiste: 'informe.TXT', contenido: { 'informe.md': 'coordenadas\n', 'informe.txt.bak': 'respaldo\n' } }, aprendizaje: { comando: 'rename' },
                  pistas: ['El patrón del ensayo ya distinguía el objetivo del respaldo.', 'Esta vez el cambio debe existir en el sistema de ficheros.', 'Elimina el modo de ensayo; la expresión y el conjunto de nombres siguen teniendo el mismo objetivo.'],
                  explica: 'Al ejecutar sin -n se renombra el fichero. Su contenido permanece y el respaldo no coincide con la extensión final.' },
                { id: 't3-test-rename-variante', tipo: 'test', pregunta: '¿Qué debes comprobar antes de reutilizar estas expresiones rename en otra máquina?', opciones: [
                  { t: 'Que esté instalada la variante Perl compatible con s/patrón/reemplazo/.', ok: true, porque: 'Hay programas llamados rename con sintaxis distinta; la ayuda identifica la variante.' },
                  { t: 'Que todos los ficheros estén vacíos.', porque: 'El contenido no decide si el nombre se puede transformar.' },
                  { t: 'Que -n esté quitado incluso para revisar el plan.', porque: '-n es precisamente el modo de ensayo sin cambios.' }
                ] }
              ]
            },
            {
              id: 't3-rename-uuid', titulo: 'Quitar solo la etiqueta final', resumen: 'Grupos hexadecimales y ancla de final',
              inicio: { base: 'vacio', fs: {
                '~/demo-carta-AB12': 'demo\n',
                '~/fich-mapa-12345678-1234-abcd-9876-abcdef123456': 'ruta al faro\n',
                '~/fich-registro-12345678-1234-abcd-9876-abcdef123456.tmp': 'guardar extension\n',
                '~/fich-largo-12345678-1234-abcd-9876-abcdef123456extra': 'guardar sufijo\n',
                '~/fich-invalido-12345678-1234-zzzz-9876-abcdef123456': 'guardar invalido\n'
              } },
              pantallas: [
                { id: 't3-teoria-uuid', tipo: 'teoria', titulo: 'El guion también forma parte del sufijo',
                  html: '<p>La forma de un UUID tiene grupos hexadecimales de longitudes <code>8-4-4-4-12</code>. Para retirar una etiqueta final de un nombre, incluye su guion inicial y ancla al final: así no borras una secuencia que aún tenga extensión o texto detrás.</p><p>La clase <code>[[:xdigit:]]</code> acepta cifras y letras a-f en ambos casos; reconocer la forma no verifica versión ni significado del UUID.</p>',
                  ejemplo: "rename -n 's/-[[:xdigit:]]{4}$//' ./demo-carta-AB12" },
                { id: 't3-practica-rename-uuid', tipo: 'practica', titulo: 'Liberar el nombre del mapa',
                  pide: 'Usa <code>rename</code> para quitar de <code>./fich-*</code> únicamente un sufijo formado por guion y UUID hexadecimal completo de forma 8-4-4-4-12 al final del nombre. El mapa debe pasar a <code>fich-mapa</code>; conserva los otros tres nombres.',
                  ejemplo: "rename 's/-[[:xdigit:]]{8}(-[[:xdigit:]]{4}){3}-[[:xdigit:]]{12}$//' ./fich-*", meta: {
                    existe: ['fich-mapa', 'fich-registro-12345678-1234-abcd-9876-abcdef123456.tmp', 'fich-largo-12345678-1234-abcd-9876-abcdef123456extra', 'fich-invalido-12345678-1234-zzzz-9876-abcdef123456'],
                    noExiste: 'fich-mapa-12345678-1234-abcd-9876-abcdef123456',
                    contenido: { 'fich-mapa': 'ruta al faro\n', 'fich-registro-12345678-1234-abcd-9876-abcdef123456.tmp': 'guardar extension\n', 'fich-largo-12345678-1234-abcd-9876-abcdef123456extra': 'guardar sufijo\n', 'fich-invalido-12345678-1234-zzzz-9876-abcdef123456': 'guardar invalido\n' }
                  }, aprendizaje: { comando: 'rename' },
                  pistas: ['El sufijo tiene cinco grupos, no una longitud arbitraria de caracteres con guiones.', 'Los tres grupos centrales tienen cuatro caracteres y pueden reunirse con una repetición.', 'Incluye el guion anterior al UUID, exige hexadecimales y ancla el final para proteger .tmp y extra.'],
                  explica: 'El patrón representa 8, tres grupos de 4 y un grupo final de 12 hexadecimales. El ancla final y la clase excluyen los tres contraejemplos.' },
                { id: 't3-test-uuid-ancla', tipo: 'test', pregunta: '¿Por qué es necesaria el ancla <code>$</code> al retirar este sufijo UUID?', opciones: [
                  { t: 'Para no retirar una secuencia parecida si tiene .tmp o más texto detrás.', ok: true, porque: 'La tarea pide un sufijo final, no cualquier aparición dentro del nombre.' },
                  { t: 'Para convertir el nombre a mayúsculas.', porque: '$ no transforma letras; representa el final de la cadena.' },
                  { t: 'Para comprobar que el UUID pertenece a un equipo real.', porque: 'Una regex de forma no comprueba la procedencia ni el significado del identificador.' }
                ] }
              ]
            }
          ]
        },
        {
          id: 't3-remoto', titulo: 'La sala remota', resumen: 'Decidir SSH y conservar una sesión tmux', comando: 'ssh / tmux',
          rondas: [
            {
              id: 't3-remoto-ssh', titulo: 'Elegir el enlace', resumen: 'Conexión real fuera del simulador', inicio: { base: 'vacio' },
              pantallas: [
                { id: 't3-teoria-ssh', tipo: 'teoria', titulo: 'Aquí decides; la conexión real se hace fuera',
                  html: '<p>Esta pantalla no abre redes ni autentica. En una terminal real, <code>ssh -p 2222 -i ~/.ssh/faro_ed25519 operador@faro</code> elige puerto, clave privada y cuenta. SSH usa <code>-p</code> minúscula; scp usa <code>-P</code> para el puerto.</p><p>Un comando entre comillas simples tras el destino se interpreta en el servidor. <code>ssh-add</code> carga una clave privada en un agente ya disponible; la clave pública autorizada va en <code>~/.ssh/authorized_keys</code> del usuario remoto. El agente no almacena la contraseña de esa cuenta.</p>' },
                { id: 't3-test-ssh-puerto', tipo: 'test', pregunta: 'El servidor escucha en 2207 y debes usar tu clave privada. ¿Qué conexión prepararías en una terminal real?', opciones: [
                  { t: '<code>ssh -p 2207 -i ~/.ssh/examen_ed25519 ana@servidor</code>', ok: true, porque: '-p elige el puerto SSH y -i selecciona la clave privada.' },
                  { t: '<code>ssh -P 2207 -i ~/.ssh/examen_ed25519.pub ana@servidor</code>', porque: 'SSH usa -p para puerto y la identidad seleccionada debe ser la clave privada, no el fichero .pub.' },
                  { t: '<code>ssh -p 2207 ana@servidor</code> y compartir la clave privada con el servidor.', porque: 'La clave privada permanece en el cliente; al servidor se instala la pública autorizada.' }
                ] },
                { id: 't3-test-ssh-comillas', tipo: 'test', pregunta: 'Quieres que el servidor interprete <code>$HOME</code>. ¿Qué forma conserva la variable para la shell remota?', opciones: [
                  { t: '<code>ssh ana@servidor \'echo "$HOME"\'</code>', ok: true, porque: 'Las comillas simples impiden que la shell local expanda $HOME; la remota recibe la expresión.' },
                  { t: '<code>ssh ana@servidor "echo $HOME"</code>', porque: 'La shell local expande $HOME antes de establecer la ejecución remota.' },
                  { t: '<code>echo $HOME</code> antes de conectar.', porque: 'Eso consulta la carpeta personal local y no ejecuta la consulta en el servidor.' }
                ] },
                { id: 't3-test-ssh-agente', tipo: 'test', pregunta: 'Ya tienes un agente SSH disponible. ¿Qué acción permite que ofrezca tu clave privada al autenticar?', opciones: [
                  { t: 'Cargarla con <code>ssh-add ~/.ssh/examen_ed25519</code>.', ok: true, porque: 'ssh-add incorpora la clave al agente; ssh-add -l permite ver las identidades cargadas.' },
                  { t: 'Copiar la clave privada a authorized_keys del servidor.', porque: 'authorized_keys contiene claves públicas autorizadas; la privada no se comparte.' },
                  { t: 'Guardar la contraseña remota dentro de tmux.', porque: 'tmux conserva sesiones de terminal, no actúa como agente de autenticación SSH.' }
                ] }
              ]
            },
            {
              id: 't3-remoto-tmux', titulo: 'Guardar el puesto de escucha', resumen: 'Desacoplar, recuperar y dividir paneles', inicio: { base: 'vacio' },
              pantallas: [
                { id: 't3-teoria-tmux', tipo: 'teoria', titulo: 'El proceso sigue en el servidor',
                  html: '<p>Después de conectarte por SSH real, <code>tmux new -s escucha</code> crea una sesión. <code>tmux ls</code> lista sesiones y <code>tmux attach -t escucha</code> recupera una existente.</p><p>Para un atajo pulsa <kbd>Ctrl+B</kbd>, suelta y pulsa la segunda tecla: <kbd>d</kbd> desacopla conservando la sesión; <kbd>%</kbd> crea paneles lado a lado; <kbd>"</kbd> los apila; las flechas cambian de panel y <kbd>z</kbd> amplía o restaura. <code>exit</code> termina la shell: cerrar el último panel termina la sesión. Aquí solo practicamos la decisión.</p>' },
                { id: 't3-test-tmux-desacoplar', tipo: 'test', pregunta: 'Necesitas cerrar la conexión y dejar el trabajo de tmux ejecutándose. ¿Qué haces primero?', opciones: [
                  { t: 'Pulso Ctrl+B, suelto y pulso d para desacoplar.', ok: true, porque: 'Desacoplar deja la sesión y sus procesos activos en el servidor.' },
                  { t: 'Escribo exit en el único panel.', porque: 'Eso termina su shell; si era el último panel, termina también la sesión.' },
                  { t: 'Pulso q como en less.', porque: 'q cierra less, pero no es el atajo de desacoplar tmux.' }
                ] },
                { id: 't3-test-tmux-volver', tipo: 'test', pregunta: 'Tras reconectar por SSH, <code>tmux ls</code> muestra una sesión llamada <code>ruta</code>. ¿Cómo vuelves a ella?', opciones: [
                  { t: '<code>tmux attach -t ruta</code>', ok: true, porque: 'attach conecta el cliente a una sesión existente identificada con -t.' },
                  { t: '<code>tmux new -s ruta</code>', porque: 'new intenta crear otra sesión; no recupera la que ya existe con ese nombre.' },
                  { t: '<code>ssh-add ruta</code>', porque: 'ssh-add gestiona claves del agente, no sesiones tmux.' }
                ] },
                { id: 't3-test-tmux-panel', tipo: 'test', pregunta: 'Quieres comparar dos ficheros en paneles lado a lado dentro de tmux. ¿Qué secuencia eliges?', opciones: [
                  { t: 'Ctrl+B, soltar y %.', ok: true, porque: '% divide el espacio en paneles a izquierda y derecha.' },
                  { t: 'Ctrl+B, soltar y ".', porque: 'Las comillas crean paneles uno encima del otro.' },
                  { t: 'Ctrl+B, soltar y d.', porque: 'd desacopla de la sesión en lugar de dividir un panel.' }
                ] }
              ]
            }
          ]
        },
        {
          id: 't3-final', titulo: 'La señal recuperada', resumen: 'Recorrer registros y construir la lista final', comando: 'grep',
          rondas: [
            {
              id: 't3-final-busqueda', titulo: 'La última búsqueda', resumen: 'Recursión, palabra completa y fin de opciones',
              inicio: { base: 'vacio', fs: {
                '~/demo-manual.txt': '-v mostrar detalle\n-vacio otra opcion\n',
                '~/demo-archivo/uno.log': 'RUMBO confirmado\nRUMBOs falsos\n',
                '~/archivo/a.log': 'LISTADO\nLISTA\n', '~/archivo/sub/b.log': 'lista\nLISTA final\n',
                '~/manual.txt': '--color usar colores\n--column columnas\n--count contar\n'
              } },
              pantallas: [
                { id: 't3-teoria-grep-recursivo', tipo: 'teoria', titulo: 'Buscar en el árbol y tratar guiones como texto',
                  html: '<p><code>grep -r</code> recorre un directorio; <code>-n</code> numera las líneas y <code>-w</code> exige una palabra completa, sin obligar a ocupar toda la línea. Al recorrer varios ficheros, la salida identifica también el nombre.</p><p><code>--</code> termina las opciones. Así un patrón que empieza por guion se interpreta como texto de búsqueda.</p>',
                  ejemplo: ["grep -r -n -w 'RUMBO' demo-archivo/", "grep -F -- '-v' demo-manual.txt"] },
                { id: 't3-practica-grep-recursivo', tipo: 'practica', titulo: 'La palabra que confirma el mapa',
                  pide: 'Busca recursivamente en <code>archivo/</code> la palabra completa <code>LISTA</code>, respetando mayúsculas. Muestra fichero y número de línea, y ordena el resultado alfabéticamente. LISTADO y lista no deben coincidir.',
                  ejemplo: "grep -r -n -w 'LISTA' archivo/ | sort", meta: { salida: 'archivo/a.log:2:LISTA\narchivo/sub/b.log:2:LISTA final' }, aprendizaje: { comando: 'grep' },
                  pistas: ['Hay un registro en una subcarpeta: no basta con leer un solo fichero.', 'LISTA puede tener texto detrás, pero no formar parte de una palabra más larga.', 'Combina recorrido recursivo, número de línea y límite de palabra; pasa después la salida a una ordenación alfabética.'],
                  explica: '-r llega al subdirectorio; -w descarta LISTADO y la búsqueda distingue el caso. -n conserva el número de línea, y sort da un orden estable aunque cambie el orden de recorrido.' },
                { id: 't3-practica-grep-guiones', tipo: 'practica', titulo: 'Una opción que es el dato',
                  pide: 'Busca con <code>grep</code> el texto literal <code>--color</code> en <code>manual.txt</code>. Usa el marcador de fin de opciones para que el patrón no se interprete como una opción del comando.',
                  ejemplo: "grep -F -- '--color' manual.txt", meta: { salida: '--color usar colores' }, aprendizaje: { comando: 'grep', valores: ['--'] },
                  pistas: ['Las comillas protegen la shell, pero el programa aún puede interpretar un argumento que empiece por guion.', 'Necesitas separar las opciones del comando de los datos que vas a buscar.', 'El marcador formado por dos guiones termina el análisis de opciones antes del patrón literal.'],
                  explica: '-- impide interpretar --color como una opción de grep y -F deja claro que se busca el texto exacto.' },
                { id: 't3-test-grep-w-x', tipo: 'test', pregunta: '¿Qué diferencia importa al buscar LISTA en <code>LISTA final</code>?', opciones: [
                  { t: '-w permite la palabra dentro de la línea; -x exigiría que ocupara toda la línea.', ok: true, porque: 'Los límites de palabra y los límites de línea expresan condiciones distintas.' },
                  { t: '-w y -x siempre son equivalentes.', porque: 'LISTA final contiene la palabra completa, pero la línea completa no es LISTA.' },
                  { t: '-n hace que LISTADO también coincida.', porque: '-n solo añade el número de línea; no modifica el patrón.' }
                ] }
              ]
            },
            {
              id: 't3-final-enlace', titulo: 'Reconstruir la señal', resumen: 'Seleccionar registros y guardar solo sus campos útiles',
              inicio: { base: 'vacio', fs: {
                '~/demo-final.txt': 'hora 37/tcp pulso\n# hora 37/tcp desactivado\n',
                '~/servicios-final.txt': '# 389/tcp no es servicio\nldap 389/tcp directorio principal\nldap-udp\t389/udp directorio secundario\nprueba 1389/tcp falso\nweb 80/tcp otra ruta\n'
              } },
              pantallas: [
                { id: 't3-teoria-final', tipo: 'teoria', titulo: 'Una herramienta selecciona y otra proyecta',
                  html: '<p>Una tubería deja que cada herramienta haga una parte: una regex selecciona registros según su estructura y <code>awk</code> imprime los campos útiles. La redirección guarda la lista resultante en un fichero nuevo.</p>',
                  ejemplo: "egrep '^[^#[:space:]]+[[:blank:]]+37/tcp([[:blank:]]|$)' demo-final.txt | awk '{print $1,$2}'" },
                { id: 't3-practica-final', tipo: 'practica', titulo: 'Entregar la lista de enlace',
                  pide: 'A partir de <code>servicios-final.txt</code>, crea <code>enlace.list</code> con nombre y puerto/protocolo de los servicios activos del puerto 389, TCP o UDP, separados por un espacio y sin descripciones. Empieza por <code>egrep</code>, pasa la selección a <code>awk</code> y conserva la fuente.',
                  ejemplo: "egrep '^[^#[:space:]]+[[:blank:]]+389/(tcp|udp)([[:blank:]]|$)' servicios-final.txt | awk '{print $1,$2}' > enlace.list", meta: { existe: 'enlace.list', contenido: { 'enlace.list': 'ldap 389/tcp\nldap-udp 389/udp\n', 'servicios-final.txt': '# 389/tcp no es servicio\nldap 389/tcp directorio principal\nldap-udp\t389/udp directorio secundario\nprueba 1389/tcp falso\nweb 80/tcp otra ruta\n' } }, aprendizaje: { comando: 'egrep' },
                  pistas: ['El comentario y 1389 son dos trampas distintas; filtra antes de escoger campos.', 'El segundo comando debe imprimir solo los dos primeros campos de los registros que sobrevivan.', 'Une selección y proyección mediante una tubería y dirige el resultado a un fichero nuevo, no a la fuente.'],
                  explica: 'La regex comprueba el segundo campo y excluye comentarios. awk normaliza el separador al imprimir dos campos, y la redirección guarda la lista con las dos rutas de enlace.' },
                { id: 't3-test-final-herramienta', tipo: 'test', pregunta: 'Debes comparar el segundo campo numéricamente con 1000. ¿Qué herramienta expresa directamente esa comparación?', opciones: [
                  { t: 'awk, mediante una condición sobre $2.', ok: true, porque: 'awk entiende campos y operadores numéricos; permite describir la comparación de forma directa.' },
                  { t: 'grep 1000, porque siempre significa mayor o igual a 1000.', porque: 'Eso busca una subcadena y no compara valores numéricos.' },
                  { t: 'rename, porque cambia cualquier dato que parezca un número.', porque: 'rename transforma nombres de ficheros; no es un filtro de registros por campos.' }
                ] }
              ]
            }
          ]
        }
      ]
    }
  ]
};
