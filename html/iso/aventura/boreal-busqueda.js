/* Estación Boreal · distritos de búsqueda. Los ejercicios tienen datos y resultados propios. */
(function () {
  const archivo = 'archivo';
  const raiz = '~/archivo';
  const bajoRaiz = nombres => nombres.map(nombre => nombre ? archivo + '/' + nombre : archivo);
  const texto = lineas => lineas.join('\n') + '\n';
  const q = valor => "\x27" + valor + "\x27";
  const codigo = valor => '<code>' + valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>';
  const findFS = {
    'archivo/mapas/base.txt': { contenido: 'BASE\n', modo: '640', propietario: 'ana', grupo: 'cartografia', mtime: '2026-11-22' },
    'archivo/mapas/eco.TXT': { contenido: 'ECO\n', modo: '600', propietario: 'luz', grupo: 'cartografia', mtime: '2026-11-23' },
    'archivo/mapas/sub/panel.txt': { contenido: '', modo: '644', propietario: 'ana', grupo: 'cartografia', mtime: '2026-11-24' },
    'archivo/mapas/sub/sector.log': { contenido: 'SECTOR\n', modo: '644', propietario: 'luz', grupo: 'guardia', mtime: '2026-11-20' },
    'archivo/mapas/sub/atajo': { tipo: 'link', destino: '~/archivo/mapas/base.txt' },
    'archivo/partes/uno.log': { contenido: 'AVISO: norte\n', modo: '640', propietario: 'ana', grupo: 'guardia', mtime: '2026-11-24' },
    'archivo/partes/dos.log': { contenido: 'OK: sur\n', modo: '644', propietario: 'luz', grupo: 'guardia', mtime: '2026-11-21' },
    'archivo/partes/noche.log': { contenido: 'AVISO: nieve\n', modo: '600', propietario: 'ana', grupo: 'guardia', mtime: '2026-11-25' },
    'archivo/partes/pendiente.txt': { contenido: '', modo: '600', propietario: 'ana', grupo: 'guardia', mtime: '2026-11-24' },
    'archivo/partes/lote viejo.csv': { contenido: 'ID;ESTADO\n17;OK\n', modo: '640', propietario: 'luz', grupo: 'cartografia', mtime: '2026-11-22' },
    'archivo/partes/lote nuevo.csv': { contenido: 'ID;ESTADO\n24;AVISO\n', modo: '640', propietario: 'ana', grupo: 'cartografia', mtime: '2026-11-25' },
    'archivo/paso.txt': { contenido: 'ABIERTO\n', modo: '644', propietario: 'luz', grupo: 'cartografia', mtime: '2026-11-23' },
    'archivo/control/fecha.ref': { contenido: 'Fecha de corte\n', modo: '644', propietario: 'ana', grupo: 'guardia', mtime: '2026-11-23' },
    'archivo/control/silencio.log': { contenido: '', modo: '644', propietario: 'ana', grupo: 'guardia', mtime: '2026-11-23' },
    'archivo/control/acta.md': { contenido: '# Acta final\n', modo: '644', propietario: 'luz', grupo: 'guardia', mtime: '2026-11-25' },
    'archivo/control/resumen.log': { contenido: 'AVISO: norte\nAVISO: hielo\n', modo: '644', propietario: 'ana', grupo: 'guardia', mtime: '2026-11-25' },
    'archivo/copia.txt': 'dir',
    'archivo/copia.txt/archivo.bak': 'RESPALDO\n',
    'archivo/reserva': 'dir',
    'archivo/acceso': { tipo: 'link', destino: '~/archivo/partes' }
  };

  const findGuias = {
    nombre: 'Da primero la ruta de inicio a <code>find</code>. <code>-name</code> compara solo el nombre, y <code>-iname</code> ignora mayúsculas. Las comillas dejan que find interprete el comodín.',
    tipo: '<code>-type f</code> selecciona ficheros normales, <code>-type d</code> carpetas y <code>-type l</code> enlaces simbólicos. <code>-empty</code> selecciona ficheros de tamaño cero o carpetas vacías.',
    alcance: '<code>-maxdepth 0</code> mira solo la ruta inicial. Con <code>-maxdepth 1</code> también mira sus hijos directos.',
    nombres: 'Puedes elegir varios caracteres con un grupo como <code>[ab]</code>; <code>?</code> equivale a un carácter y <code>*</code> a cero o más.',
    logica: 'Las condiciones seguidas se combinan con un «y». Usa <code>-o</code> para «o» y protege los paréntesis con barras: <code>\\( … \\)</code>.',
    negacion: '<code>!</code> invierte la condición siguiente. Coloca <code>-type f</code> delante si quieres excluir carpetas de antemano.',
    tamano: 'Con <code>-size</code>, el sufijo <code>c</code> mide bytes. El prefijo <code>+</code> significa más de y <code>-</code> significa menos de.',
    acceso: '<code>-user</code> y <code>-group</code> filtran metadatos de propiedad. <code>-perm 640</code> comprueba un modo exacto.',
    fecha: '<code>-newer REFERENCIA</code> selecciona elementos modificados después del fichero indicado. Los que tienen la misma fecha quedan fuera.',
    tuberia: '<code>find</code> produce rutas. Puedes pasar esa lista a <code>wc -l</code> para contar, a <code>sort</code> para ordenar o al siguiente filtro.',
    leer: '<code>-exec COMANDO {} \\;</code> ejecuta el comando una vez por ruta. Con <code>{} +</code>, find entrega varias rutas juntas.',
    espacios: '<code>-print0</code> separa las rutas con un carácter nulo y <code>xargs -0</code> las recibe así. Un espacio dentro del nombre no corta la ruta.',
    guardar: 'Prepara la carpeta de entrega antes de guardar. <code>&gt;</code> escribe la salida en un fichero; <code>find -exec</code> también puede pasar las rutas encontradas a un comando que trabaje sobre ellas.'
  };

  function bancoFind(parada) {
    const prueba = (titulo, pide, orden, meta, tema, pista) => parada({
      titulo, pide, ejemplo: orden, meta, archivos: findFS,
      pistas: ['Puedes recorrer el árbol con ' + codigo('tree ~/archivo') + ' antes de filtrar.', pista],
      guia: '<p>' + findGuias[tema] + '</p>',
      explica: findGuias[tema],
      aprendizaje: { comando: 'find' }
    });
    const rutas = (titulo, pide, filtros, esperadas, tema, pista, desde = raiz) =>
      prueba(titulo, pide, 'find ' + desde + ' ' + filtros, { lineas: bajoRaiz(esperadas) }, tema, pista);
    const salida = (titulo, pide, orden, lineas, tema, pista) =>
      prueba(titulo, pide, orden, { salida: lineas.join('\n') }, tema, pista);
    const entrega = (titulo, pide, orden, contenido, tema, pista) => parada({
      titulo, pide, ejemplo: ['mkdir -p ~/entrega', orden], archivos: findFS,
      meta: { directorios: '~/entrega', contenido },
      guia: '<p>' + findGuias[tema] + '</p>',
      pistas: ['Crea la carpeta de entrega antes de buscar.', pista],
      explica: 'La comprobación revisa la carpeta y el contenido de los ficheros entregados.'
    });

    return [
      rutas('El plano de salida', 'Localiza el fichero de nombre exacto <code>paso.txt</code> en <code>~/archivo</code>.', "-name 'paso.txt'", ['paso.txt'], 'nombre', 'Busca el nombre completo.'),
      rutas('Las extensiones visibles', 'Busca los ficheros normales <code>.txt</code> de <code>~/archivo/mapas</code> y sus subcarpetas. Distingue mayúsculas.', "-type f -name '*.txt'", ['mapas/base.txt', 'mapas/sub/panel.txt'], 'nombre', 'El comodín va antes de la extensión.', raiz + '/mapas'),
      rutas('Una extensión con dos grafías', 'Busca los ficheros <code>.txt</code> de <code>~/archivo/mapas</code>, incluidas extensiones en mayúsculas.', "-type f -iname '*.txt'", ['mapas/base.txt', 'mapas/eco.TXT', 'mapas/sub/panel.txt'], 'nombre', 'Cambia la opción de nombre para ignorar mayúsculas.', raiz + '/mapas'),
      rutas('El esqueleto de cartografía', 'Lista las carpetas de <code>~/archivo/mapas</code>, incluida la carpeta inicial.', '-type d', ['mapas', 'mapas/sub'], 'tipo', 'Pide directorios en lugar de ficheros.', raiz + '/mapas'),
      rutas('La antigua entrada', 'Localiza todos los enlaces simbólicos en <code>~/archivo</code>, sin seguir su destino.', '-type l', ['acceso', 'mapas/sub/atajo'], 'tipo', 'El enlace tiene su propio tipo. No hace falta seguirlo.'),
      rutas('Solo la planta baja', 'Muestra los ficheros que cuelgan directamente de <code>~/archivo</code>, sin bajar a subcarpetas.', '-maxdepth 1 -type f', ['paso.txt'], 'alcance', 'Un fichero directamente debajo está a profundidad 1.'),
      rutas('Una reserva sin ocupar', 'Busca las carpetas vacías de <code>~/archivo</code>.', '-type d -empty', ['reserva'], 'tipo', 'Combina tipo de directorio y condición de vacío.'),
      rutas('Partes sin redactar', 'Busca los ficheros normales vacíos de <code>~/archivo</code>.', '-type f -empty', ['control/silencio.log', 'mapas/sub/panel.txt', 'partes/pendiente.txt'], 'tipo', 'Pide ficheros normales para dejar fuera las carpetas vacías.'),

      rutas('La tanda de nombres cortos', 'Busca los registros de <code>~/archivo/partes</code> con exactamente tres caracteres antes de <code>.log</code>.', "-type f -name '???.log'", ['partes/dos.log', 'partes/uno.log'], 'nombres', 'Cada interrogación representa un carácter.', raiz + '/partes'),
      rutas('Lote de carga', 'Busca los ficheros cuyo nombre empiece por <code>lote </code> (con espacio) y termine en <code>.csv</code>, dentro de <code>~/archivo</code>.', "-type f -name 'lote *.csv'", ['partes/lote nuevo.csv', 'partes/lote viejo.csv'], 'nombre', 'Incluye el espacio literal dentro de las comillas.'),
      rutas('Planos o partes de control', 'Busca los ficheros <code>.txt</code> o <code>.log</code> dentro de <code>~/archivo/mapas</code>. Distingue mayúsculas.', "-type f \\( -name '*.txt' -o -name '*.log' \\)", ['mapas/base.txt', 'mapas/sub/panel.txt', 'mapas/sub/sector.log'], 'logica', 'Agrupa las dos extensiones para aplicar el tipo a ambas.', raiz + '/mapas'),
      rutas('Sin hojas de cálculo', 'En <code>~/archivo/partes</code>, lista los ficheros normales que no terminen en <code>.csv</code>.', "-type f ! -name '*.csv'", ['partes/dos.log', 'partes/noche.log', 'partes/pendiente.txt', 'partes/uno.log'], 'negacion', 'Invierte el filtro de extensión, no el filtro de tipo.', raiz + '/partes'),
      rutas('Texto listo para enviar', 'En <code>~/archivo/mapas</code>, encuentra los ficheros de texto no vacíos, con extensión <code>.txt</code> sin distinguir mayúsculas.', "-type f -iname '*.txt' ! -empty", ['mapas/base.txt', 'mapas/eco.TXT'], 'negacion', 'El «no» se aplica solamente al estado vacío.', raiz + '/mapas'),
      rutas('El plano de cinco bytes', 'Localiza en <code>~/archivo/mapas</code> los ficheros que ocupen exactamente 5 bytes.', '-type f -size 5c', ['mapas/base.txt'], 'tamano', 'Recuerda contar el salto de línea como un byte.', raiz + '/mapas'),
      rutas('Partes mínimos', 'En <code>~/archivo/partes</code>, busca ficheros de menos de 10 bytes, incluidos los vacíos.', '-type f -size -10c', ['partes/dos.log', 'partes/pendiente.txt'], 'tamano', 'El criterio es estricto: 10 exactos no valen.', raiz + '/partes'),
      rutas('Notas con margen', 'En <code>~/archivo/control</code>, busca ficheros de más de 14 bytes.', '-type f -size +14c', ['control/fecha.ref', 'control/resumen.log'], 'tamano', 'Las unidades aquí son bytes, no bloques.', raiz + '/control'),
      rutas('Huellas en dos ramales', 'Busca los enlaces simbólicos en <code>~/archivo/mapas</code> y <code>~/archivo/control</code>, usando ambas rutas como puntos de partida.', '-type l', ['mapas/sub/atajo'], 'alcance', 'Antes de los filtros, find admite varias rutas iniciales.', raiz + '/mapas ' + raiz + '/control'),

      rutas('Los partes de Ana', 'Muestra los ficheros cuyo propietario sea <code>ana</code> dentro de <code>~/archivo/partes</code>.', '-type f -user ana', ['partes/lote nuevo.csv', 'partes/noche.log', 'partes/pendiente.txt', 'partes/uno.log'], 'acceso', 'El propietario es un atributo del fichero. No lo busques en el nombre.', raiz + '/partes'),
      rutas('Cartografía en el control', 'En <code>~/archivo/partes</code>, selecciona los ficheros del grupo <code>cartografia</code>.', '-type f -group cartografia', ['partes/lote nuevo.csv', 'partes/lote viejo.csv'], 'acceso', 'Busca por grupo de propiedad con -group.', raiz + '/partes'),
      rutas('Planos compartidos en lectura', 'En <code>~/archivo/mapas</code>, localiza los ficheros con modo exacto <code>640</code>.', '-type f -perm 640', ['mapas/base.txt'], 'acceso', 'El modo exacto no lleva un guion delante de 640.', raiz + '/mapas'),
      rutas('Custodia nocturna', 'En <code>~/archivo/partes</code>, selecciona los ficheros de <code>ana</code> que tengan modo exacto <code>600</code>.', '-type f -user ana -perm 600', ['partes/noche.log', 'partes/pendiente.txt'], 'acceso', 'Combina el propietario y el modo con las dos pruebas seguidas.', raiz + '/partes'),
      rutas('Entregados después del corte', 'Busca en <code>~/archivo/control</code> los ficheros más recientes que <code>~/archivo/control/fecha.ref</code>.', '-type f -newer ~/archivo/control/fecha.ref', ['control/acta.md', 'control/resumen.log'], 'fecha', 'Escribe la ruta del fichero de referencia después de la prueba de fecha.', raiz + '/control'),
      rutas('Los mapas recientes de Ana', 'En <code>~/archivo/mapas</code>, lista los ficheros de <code>ana</code> modificados después de <code>~/archivo/control/fecha.ref</code>.', '-type f -user ana -newer ~/archivo/control/fecha.ref', ['mapas/sub/panel.txt'], 'fecha', 'La referencia está en otra carpeta, pero sigue siendo válida.', raiz + '/mapas'),
      rutas('Avisos recientes, no borradores', 'Busca en <code>~/archivo/partes</code> los ficheros <code>.log</code> modificados después de <code>~/archivo/control/fecha.ref</code>.', "-type f -name '*.log' -newer ~/archivo/control/fecha.ref", ['partes/noche.log', 'partes/uno.log'], 'fecha', 'Combina nombre, tipo y fecha.', raiz + '/partes'),
      rutas('Material reservado con datos', 'En <code>~/archivo/partes</code>, localiza los ficheros con modo <code>600</code> y contenido no vacío.', '-type f -perm 600 ! -empty', ['partes/noche.log'], 'negacion', 'Aplica el «no» exclusivamente a -empty.', raiz + '/partes'),
      rutas('Dos equipos bajo un modo', 'En <code>~/archivo/partes</code>, busca los ficheros de <code>ana</code> o <code>luz</code> que tengan modo exacto <code>640</code>.', '-type f -perm 640 \\( -user ana -o -user luz \\)', ['partes/lote nuevo.csv', 'partes/lote viejo.csv', 'partes/uno.log'], 'logica', 'Agrupa la elección de propietario; el modo se exige en ambos casos.', raiz + '/partes'),

      salida('Censo de partes', 'Cuenta cuántos ficheros <code>.log</code> hay bajo <code>~/archivo/partes</code>. Imprime solo el número.', "find ~/archivo/partes -type f -name '*.log' | wc -l", ['3'], 'tuberia', 'El primer comando genera una ruta por fichero.'),
      salida('Contar reservas concretas', 'Cuenta los ficheros normales vacíos con nombre <code>.log</code> bajo <code>~/archivo/control</code>.', "find ~/archivo/control -type f -name '*.log' -empty | wc -l", ['1'], 'tuberia', 'La tubería debe recibir solo las rutas que cumplen las tres condiciones.'),
      prueba('Orden del inventario', 'Lista las rutas de los ficheros <code>.log</code> de <code>~/archivo/partes</code> por nombre descendente.', "find ~/archivo/partes -type f -name '*.log' | sort -r",
        { orden: ['uno.log', 'noche.log', 'dos.log'], lineas: bajoRaiz(['partes/uno.log', 'partes/noche.log', 'partes/dos.log']) }, 'tuberia', 'Ordena tras buscar; las rutas comparten el mismo prefijo.'),
      salida('Nombres sin su ruta', 'Busca los <code>.log</code> de <code>~/archivo/partes</code> y muestra solamente sus nombres base, en orden alfabético.',
        "find ~/archivo/partes -type f -name '*.log' -exec basename {} \\; | sort", ['dos.log', 'noche.log', 'uno.log'], 'leer', 'basename toma una ruta y devuelve su último componente.'),
      salida('Un vistazo a los originales', 'Busca en <code>~/archivo/mapas</code> ficheros de texto no vacíos, sin distinguir mayúsculas, y muestra su contenido ordenado.',
        "find ~/archivo/mapas -type f -iname '*.txt' ! -empty -exec cat {} + | sort", ['BASE', 'ECO'], 'leer', 'Filtra los ficheros primero y pasa las rutas a cat después.'),
      salida('Lotes con espacios', 'Busca los <code>.csv</code> de <code>~/archivo/partes</code> y muestra juntos sus contenidos en orden alfabético de líneas. Sus nombres incluyen espacios.',
        "find ~/archivo/partes -type f -name '*.csv' -print0 | xargs -0 cat | sort", ['17;OK', '24;AVISO', 'ID;ESTADO', 'ID;ESTADO'], 'espacios', 'No uses espacios ni saltos de línea como delimitador de rutas.'),
      salida('Solo avisos de los partes', 'Busca los registros <code>.log</code> de <code>~/archivo/partes</code> y muestra solo las líneas que empiezan por <code>AVISO:</code>, ordenadas.',
        "find ~/archivo/partes -type f -name '*.log' -exec cat {} + | grep '^AVISO:' | sort", ['AVISO: nieve', 'AVISO: norte'], 'leer', 'Haz que grep lea el contenido de los ficheros, no sus nombres.'),
      salida('Cuántas líneas útiles quedan', 'Busca los <code>.log</code> de <code>~/archivo/control</code> y cuenta las líneas de contenido que empiezan por <code>AVISO:</code>.',
        "find ~/archivo/control -type f -name '*.log' -exec cat {} + | grep -c '^AVISO:'", ['2'], 'leer', 'Solo debes contar las coincidencias una vez reunido el contenido.'),
      salida('Una medida de control', 'Muestra el nombre base de los ficheros entre 1 y 9 bytes de <code>~/archivo/mapas</code>, ordenados.',
        'find ~/archivo/mapas -type f -size +0c -size -10c -exec basename {} \\; | sort', ['base.txt', 'eco.TXT', 'sector.log'], 'tamano', 'Aplica ambos límites antes de extraer los nombres.'),

      entrega('Recuento de salida', 'Crea <code>~/entrega</code> y guarda en <code>partes.total</code> solo el número de ficheros <code>.log</code> de <code>~/archivo/partes</code>.',
        "find ~/archivo/partes -type f -name '*.log' | wc -l > ~/entrega/partes.total", { '~/entrega/partes.total': '3\n' }, 'guardar', 'Cuenta en la tubería y redirige solo su resultado final.'),
      entrega('Los nombres del archivo', 'Crea <code>~/entrega</code> y guarda en <code>registros.txt</code> los nombres base, ordenados, de los ficheros <code>.log</code> de <code>~/archivo/partes</code>.',
        "find ~/archivo/partes -type f -name '*.log' -exec basename {} \\; | sort > ~/entrega/registros.txt", { '~/entrega/registros.txt': 'dos.log\nnoche.log\nuno.log\n' }, 'leer', 'Quien escribe el fichero debe recibir los nombres ya ordenados.'),
      entrega('Selección de la guardia', 'Crea <code>~/entrega</code> y copia allí los <code>.log</code> de <code>~/archivo/partes</code> cuyo propietario sea <code>ana</code>. Usa <code>find</code> para seleccionar los originales.',
        "find ~/archivo/partes -type f -user ana -name '*.log' -exec cp {} ~/entrega/ \\;", { '~/entrega/uno.log': 'AVISO: norte\n', '~/entrega/noche.log': 'AVISO: nieve\n' }, 'guardar', 'Después de la selección, ejecuta cp para cada ruta.'),
      entrega('Tras el corte de control', 'Crea <code>~/entrega</code> y copia allí los ficheros de <code>~/archivo/control</code> más nuevos que <code>fecha.ref</code>. Usa <code>find</code>.',
        'find ~/archivo/control -type f -newer ~/archivo/control/fecha.ref -exec cp {} ~/entrega/ \\;', { '~/entrega/acta.md': '# Acta final\n', '~/entrega/resumen.log': 'AVISO: norte\nAVISO: hielo\n' }, 'fecha', 'Usa la referencia original y deja el destino fuera del árbol que recorres.'),
      entrega('Parte de avisos alfabético', 'Crea <code>~/entrega</code> y guarda en <code>alertas.txt</code> las líneas que empiezan por <code>AVISO:</code> de los <code>.log</code> de <code>~/archivo/partes</code>, ordenadas.',
        "find ~/archivo/partes -type f -name '*.log' -exec cat {} + | grep '^AVISO:' | sort > ~/entrega/alertas.txt", { '~/entrega/alertas.txt': 'AVISO: nieve\nAVISO: norte\n' }, 'guardar', 'Piensa en cuatro pasos: localizar, leer, filtrar, ordenar.'),
      entrega('Un inventario sin huecos', 'Crea <code>~/entrega</code> y guarda en <code>planos.txt</code> los nombres base ordenados de los ficheros de texto no vacíos de <code>~/archivo/mapas</code>. Ignora mayúsculas en la extensión.',
        "find ~/archivo/mapas -type f -iname '*.txt' ! -empty -exec basename {} \\; | sort > ~/entrega/planos.txt", { '~/entrega/planos.txt': 'base.txt\neco.TXT\n' }, 'guardar', 'Deja las tres condiciones antes de la operación sobre cada nombre.'),
      entrega('Copias de carga con espacios', 'Crea <code>~/entrega</code> y copia con <code>find</code> los lotes <code>.csv</code> de <code>~/archivo/partes</code> al directorio de entrega. Conserva sus nombres con espacios.',
        "find ~/archivo/partes -type f -name '*.csv' -exec cp {} ~/entrega/ \\;", { '~/entrega/lote nuevo.csv': 'ID;ESTADO\n24;AVISO\n', '~/entrega/lote viejo.csv': 'ID;ESTADO\n17;OK\n' }, 'guardar', 'El {} de -exec recibe una ruta completa incluso si tiene espacios.'),
      entrega('Control de los partes que faltan', 'Crea <code>~/entrega</code> y escribe en <code>pendientes.txt</code> los nombres base ordenados de los ficheros vacíos de <code>~/archivo</code> que sean <code>.txt</code> o <code>.log</code>.',
        "find ~/archivo -type f -empty \\( -name '*.txt' -o -name '*.log' \\) -exec basename {} \\; | sort > ~/entrega/pendientes.txt",
        { '~/entrega/pendientes.txt': 'panel.txt\npendiente.txt\nsilencio.log\n' }, 'logica', 'Agrupa la elección de extensiones antes de llamar a basename.'),
      entrega('Manifiesto de la estación', 'Crea <code>~/entrega</code> y guarda en <code>manifiesto.txt</code> una lista alfabética de las líneas útiles de todos los <code>.csv</code> de <code>~/archivo/partes</code>. Omite la cabecera <code>ID;ESTADO</code> de cada lote.',
        "find ~/archivo/partes -type f -name '*.csv' -print0 | xargs -0 cat | grep -v '^ID;ESTADO$' | sort > ~/entrega/manifiesto.txt",
        { '~/entrega/manifiesto.txt': '17;OK\n24;AVISO\n' }, 'espacios', 'Mantén las rutas completas al leer y filtra las cabeceras después.')
    ];
  }

  const guardia = ['OK enlace', 'AVISO hielo', 'aviso norte', 'ERROR motor', 'AVERIA recuperada', 'RECUPERADO motor'];
  const consola = ['RUN', 'run', 'RUN listo', 'PRERUN', 'ejecuta RUN ahora', '--reset', 'versión v2.1', 'versión v2X1'];
  const grepFS = {
    'guardia.log': texto(guardia),
    'consola.log': texto(consola),
    'control.log': 'OK\nOK\nAVISO\nERROR\nAVISO\n',
    'medidas.txt': 'norte:AVISO:17\nsur:OK:6\neste:AVISO:11\noeste:ERROR:46\n',
    'conteo.txt': 'sol sol\nsol\nluna\nparasol\nsol y luna\n',
    'patrones.txt': 'AVISO\nERROR\n',
    'cabeceras.log': '# ronda 13\nAVISO: hielo\n# reintento\nERROR: motor\nOK: camino\n',
    'senal/a.log': 'AVISO hielo\nOK puente\n',
    'senal/b.log': 'OK salida\naviso baterias\n',
    'senal/remota/z.log': 'ERROR camara\nAVISO nieve\n',
    'senal/remota/guia.txt': 'Guía de mantenimiento\n'
  };
  const grepGuias = {
    lineas: 'El patrón decide qué líneas entran. <code>-i</code> ignora mayúsculas y <code>-v</code> invierte la selección.',
    salida: '<code>-n</code> añade el número original. <code>-c</code> muestra cuántas líneas coinciden. Puedes juntar letras de opciones, por ejemplo <code>-in</code>.',
    palabra: '<code>-w</code> busca una palabra completa. <code>-x</code> exige que toda la línea coincida.',
    literal: '<code>-F</code> interpreta el patrón como texto literal. <code>--</code> indica que ya no hay más opciones, útil si el patrón empieza por guion.',
    varios: '<code>-e PATRÓN</code> se puede repetir y <code>-f FICHERO</code> lee un patrón por línea. Basta con que coincida cualquiera.',
    recursivo: '<code>-r</code> baja a subcarpetas. Añade <code>-l</code> para sacar solo nombres de ficheros, <code>-n</code> para números de línea o <code>-c</code> para recuentos.',
    etiqueta: 'Al buscar en varias fuentes, grep suele indicar el fichero. <code>-h</code> oculta ese prefijo y <code>-H</code> lo fuerza.',
    ocurrencia: '<code>-o</code> emite cada coincidencia en una línea. <code>-c</code> cuenta líneas originales, no apariciones individuales.',
    tuberia: 'Usa una tubería para que otro comando trabaje con las líneas seleccionadas. Dos filtros seguidos permiten exigir dos condiciones diferentes.',
    entrega: 'Primero prueba el filtro en pantalla. Luego usa <code>&gt;</code> para guardar el resultado y <code>&gt;&gt;</code> para añadir al final sin borrar lo anterior.'
  };

  function bancoGrep(parada) {
    const prueba = (titulo, pide, orden, esperadas, tema, pista, datos = [], archivos = grepFS) => parada({
      titulo, pide, ejemplo: orden, archivos, datos, meta: { salida: esperadas.join('\n') },
      guia: '<p>' + grepGuias[tema] + '</p>',
      pistas: ['Separa lo que debes buscar de la forma en que debes presentar las coincidencias.', pista],
      explica: grepGuias[tema], aprendizaje: { comando: 'grep' }
    });
    const entrega = (titulo, pide, orden, nombre, esperadas, tema, pista) => parada({
      titulo, pide, ejemplo: ['mkdir -p ~/entrega', ...[].concat(orden)], archivos: grepFS,
      meta: { directorios: '~/entrega', contenido: { ['~/entrega/' + nombre]: texto(esperadas) } },
      guia: '<p>' + grepGuias[tema] + '</p>',
      pistas: ['Una vez creada la carpeta, prueba el filtro en pantalla.', pista],
      explica: 'La actividad comprueba que el fichero tenga el contenido pedido y el orden de líneas correcto.'
    });
    return [
      prueba('Primera alerta', 'En <code>guardia.log</code>, muestra las líneas con <code>AVISO</code> respetando mayúsculas.', "grep 'AVISO' guardia.log", [guardia[1]], 'lineas', 'Escribe el texto tal como aparece.', ['guardia.log']),
      prueba('Escucha sin distinguir la caja', 'Busca los avisos de <code>guardia.log</code> sean mayúsculas o minúsculas.', "grep -i 'aviso' guardia.log", guardia.slice(1, 3), 'lineas', 'Hay una opción que hace equivalentes AVISO y aviso.', ['guardia.log']),
      prueba('Sin señales normales', 'Muestra las líneas de <code>control.log</code> que no contienen <code>OK</code>.', "grep -v 'OK' control.log", ['AVISO', 'ERROR', 'AVISO'], 'lineas', 'El filtro debe descartar las coincidencias, no quedarse con ellas.', ['control.log']),
      prueba('El número de la avería', 'Localiza <code>ERROR</code> en <code>guardia.log</code> e indica su número de línea.', "grep -n 'ERROR' guardia.log", ['4:ERROR motor'], 'salida', 'La posición se calcula antes de filtrar.', ['guardia.log']),
      prueba('Balance de rondas correctas', 'Cuenta cuántas líneas de <code>control.log</code> contienen <code>OK</code>.', "grep -c 'OK' control.log", ['2'], 'salida', 'Busca la opción que sustituye las líneas por el total.', ['control.log']),
      prueba('RUN sin prefijos', 'Busca <code>RUN</code> como palabra completa y en mayúsculas dentro de <code>consola.log</code>.', "grep -w 'RUN' consola.log", ['RUN', 'RUN listo', 'ejecuta RUN ahora'], 'palabra', 'PRERUN contiene las letras, pero no la palabra.', ['consola.log']),
      prueba('Una orden sin argumentos', 'Muestra solo las líneas de <code>consola.log</code> que sean exactamente <code>RUN</code> en mayúsculas.', "grep -x 'RUN' consola.log", ['RUN'], 'palabra', 'El resto de la línea también se tiene en cuenta.', ['consola.log']),
      prueba('El punto de la versión', 'Busca el texto literal <code>v2.1</code> en <code>consola.log</code>. No aceptes <code>v2X1</code>.', "grep -F 'v2.1' consola.log", ['versión v2.1'], 'literal', 'El punto debe ser literal, no un comodín.', ['consola.log']),

      prueba('Avisos con coordenadas de línea', 'Muestra los avisos de <code>guardia.log</code> sin distinguir mayúsculas y con sus números de línea.', "grep -in 'aviso' guardia.log", ['2:AVISO hielo', '3:aviso norte'], 'salida', 'Combina la selección sin mayúsculas con la opción de numerar.', ['guardia.log']),
      prueba('Recuento de la palabra aviso', 'Cuenta las líneas de <code>guardia.log</code> que contienen aviso, sin distinguir mayúsculas.', "grep -ic 'aviso' guardia.log", ['2'], 'salida', 'Primero decide qué líneas corresponden y después cómo resumirlas.', ['guardia.log']),
      prueba('Posiciones de lo que sobra', 'Muestra las líneas de <code>guardia.log</code> que no empiecen por <code>OK</code> y numéralas.', "grep -vn '^OK' guardia.log", guardia.slice(1).map((l, i) => (i + 2) + ':' + l), 'salida', 'El ^ ancla el patrón al inicio; invierte y conserva los números.', ['guardia.log']),
      prueba('La palabra de cualquier operador', 'En <code>consola.log</code>, encuentra la palabra completa <code>run</code> sin distinguir mayúsculas.', "grep -iw 'run' consola.log", ['RUN', 'run', 'RUN listo', 'ejecuta RUN ahora'], 'palabra', 'Puedes combinar el límite de palabra con la comparación sin mayúsculas.', ['consola.log']),
      prueba('Orden desnuda en ambas grafías', 'Selecciona en <code>consola.log</code> las líneas que solo digan <code>run</code>, sin distinguir mayúsculas.', "grep -ix 'run' consola.log", ['RUN', 'run'], 'palabra', 'Exige una coincidencia de línea completa, además de ignorar el uso de mayúsculas.', ['consola.log']),
      prueba('Dos tipos de incidencia', 'Muestra las líneas de <code>guardia.log</code> que contengan literalmente <code>AVISO</code> o <code>ERROR</code>, en mayúsculas.', "grep -F -e 'AVISO' -e 'ERROR' guardia.log", [guardia[1], guardia[3]], 'varios', 'Proporciona los dos patrones como opciones independientes.', ['guardia.log']),
      prueba('La instrucción que empieza por guion', 'Encuentra literalmente <code>--reset</code> en <code>consola.log</code> sin que se interprete como opción.', "grep -F -- '--reset' consola.log", ['--reset'], 'literal', 'Separa las opciones del patrón con el indicador de fin de opciones.', ['consola.log']),
      prueba('Lista de control reutilizable', 'Usa las líneas de <code>patrones.txt</code> como patrones literales para filtrar <code>guardia.log</code>.', 'grep -F -f patrones.txt guardia.log', [guardia[1], guardia[3]], 'varios', 'No necesitas copiar cada patrón; pásale a grep el nombre del fichero.', ['patrones.txt', 'guardia.log']),
      prueba('Rastrear el punto por posición', 'Busca literalmente <code>v2X1</code> en <code>consola.log</code> y muestra el número de línea.', "grep -Fn 'v2X1' consola.log", ['8:versión v2X1'], 'literal', 'Combina la búsqueda literal con la numeración de líneas.', ['consola.log']),

      prueba('Señal en el ramal remoto', 'Busca <code>ERROR</code> en todos los ficheros bajo <code>senal</code>, incluida la subcarpeta.', "grep -r 'ERROR' senal", ['senal/remota/z.log:ERROR camara'], 'recursivo', 'Busca desde la carpeta superior y deja que grep baje por ti.'),
      prueba('Archivos con incidencias', 'Muestra solo los nombres de los archivos de <code>senal</code> y sus subcarpetas que contienen <code>AVISO</code>, ordenados.', "grep -rl 'AVISO' senal | sort", ['senal/a.log', 'senal/remota/z.log'], 'recursivo', 'Pide nombres de archivos en vez de líneas de contenido.'),
      prueba('Coordenadas de una cámara', 'Busca <code>camara</code> recursivamente en <code>senal</code> y muestra nombre de fichero y número de línea.', "grep -rn 'camara' senal", ['senal/remota/z.log:1:ERROR camara'], 'recursivo', 'Usa la opción que numera las líneas junto con la búsqueda recursiva.'),
      prueba('Censo por fichero', 'Dentro de <code>senal/remota</code>, cuenta por fichero las líneas que contienen <code>AVISO</code>. Incluye los ceros y ordena por ruta.', "grep -rc 'AVISO' senal/remota | sort", ['senal/remota/guia.txt:0', 'senal/remota/z.log:1'], 'recursivo', 'El recuento de grep se puede calcular para cada fichero.'),
      prueba('Sensores de distinto formato', 'Busca todos los avisos bajo <code>senal</code> sin distinguir mayúsculas y ordena las líneas por ruta.', "grep -ri 'aviso' senal | sort", ['senal/a.log:AVISO hielo', 'senal/b.log:aviso baterias', 'senal/remota/z.log:AVISO nieve'], 'recursivo', 'El camino determina el alcance; otra opción determina cómo se comparan las letras.'),
      prueba('Última revisión con procedencia', 'Busca <code>AVISO</code> en <code>senal/a.log</code> y fuerza que la coincidencia indique el nombre del fichero.', "grep -H 'AVISO' senal/a.log", ['senal/a.log:AVISO hielo'], 'etiqueta', 'Con un fichero no se imprime el nombre de forma predeterminada.'),
      prueba('Solo el nombre del parte correcto', 'Entre <code>senal/a.log</code> y <code>senal/b.log</code>, muestra solo el nombre del fichero que contenga <code>puente</code>.', "grep -l 'puente' senal/a.log senal/b.log", ['senal/a.log'], 'recursivo', 'Puedes pasar dos ficheros a grep como argumentos sin recorrer una carpeta.'),
      prueba('Dos turnos sin etiqueta', 'Busca <code>OK</code> en <code>senal/a.log</code> y luego en <code>senal/b.log</code>. Imprime las líneas sin el nombre del archivo.', "grep -h 'OK' senal/a.log senal/b.log", ['OK puente', 'OK salida'], 'etiqueta', 'Oculta el prefijo que normalmente sale con varios ficheros.'),
      prueba('Patrones contra toda la red', 'Usa <code>patrones.txt</code> para buscar sus textos literales y exactos en mayúsculas bajo <code>senal</code>. Imprime solo rutas ordenadas.', 'grep -Frl -f patrones.txt senal | sort', ['senal/a.log', 'senal/remota/z.log'], 'varios', 'Combina la fuente de patrones con la salida que solo enumera ficheros.', ['patrones.txt']),

      prueba('Las ocurrencias van separadas', 'Muestra cada aparición literal de <code>sol</code> como línea aparte, incluso dentro de otra palabra, en <code>conteo.txt</code>.', "grep -Fo 'sol' conteo.txt", Array(5).fill('sol'), 'ocurrencia', 'Una misma línea del original puede contribuir más de una vez.', ['conteo.txt']),
      prueba('Ocurrencias con ubicación', 'En <code>conteo.txt</code>, extrae cada <code>sol</code> como palabra completa e indica el número de su línea de origen.', "grep -now 'sol' conteo.txt", ['1:sol', '1:sol', '2:sol', '5:sol'], 'ocurrencia', 'Para cada aparición, combina extracción, palabra completa y numeración.', ['conteo.txt']),
      prueba('El recuento que no suma líneas', 'Cuenta cuántas veces aparece la palabra completa <code>sol</code> en <code>conteo.txt</code>, incluyendo repeticiones en la misma línea.', "grep -ow 'sol' conteo.txt | wc -l", ['4'], 'ocurrencia', 'Saca cada coincidencia por separado antes de contar.', ['conteo.txt']),
      prueba('Comentarios fuera del parte', 'Quita las líneas que empiezan por <code>#</code> de <code>cabeceras.log</code> y conserva solo las que contienen la palabra <code>AVISO</code>.', "grep -v '^#' cabeceras.log | grep -w 'AVISO'", ['AVISO: hielo'], 'tuberia', 'El segundo filtro debe recibir la salida del primero.', ['cabeceras.log']),
      prueba('Dos palabras obligatorias', 'En <code>conteo.txt</code>, conserva las líneas con las palabras completas <code>sol</code> y <code>luna</code>, ambas presentes.', "grep -w 'sol' conteo.txt | grep -w 'luna'", ['sol y luna'], 'tuberia', 'Encadena dos búsquedas. Con -e repetido bastaría que coincidiera una.', ['conteo.txt']),
      prueba('Cobertura de incidentes', 'Muestra las filas de <code>medidas.txt</code> con <code>AVISO</code> o <code>ERROR</code> y conserva solo el primer campo. Respeta el orden original.', "grep -F -e 'AVISO' -e 'ERROR' medidas.txt | cut -d ':' -f 1", ['norte', 'este', 'oeste'], 'tuberia', 'Filtra por estado y luego extrae la columna que identifica la zona.', ['medidas.txt']),
      prueba('Destacar la última incidencia', 'En <code>guardia.log</code>, busca <code>AVISO</code> o <code>ERROR</code> en mayúsculas. Muestra solo la última coincidencia.', "grep -F -e 'AVISO' -e 'ERROR' guardia.log | tail -n 1", ['ERROR motor'], 'tuberia', 'Selecciona primero y toma al final la última línea de lo encontrado.', ['guardia.log']),
      prueba('Totales sin rutas', 'Cuenta el total de avisos bajo <code>senal</code>, sin distinguir mayúsculas. Imprime un solo número.', "grep -ri 'aviso' senal | wc -l", ['3'], 'tuberia', 'Evita -c por fichero; cuenta toda la salida de la búsqueda recursiva.'),
      prueba('La mayor lectura en alerta', 'En <code>medidas.txt</code>, extrae el tercer campo de las filas con <code>AVISO</code> y muestra solo el valor mayor.', "grep -F 'AVISO' medidas.txt | cut -d ':' -f 3 | sort -n | tail -n 1", ['17'], 'tuberia', 'Tras filtrar y extraer los números, ordénalos como números.', ['medidas.txt']),

      entrega('Libro de alertas', 'Crea <code>~/entrega</code> y guarda en <code>alertas.txt</code> las líneas con <code>AVISO</code> o <code>ERROR</code> de <code>guardia.log</code>, en mayúsculas y en el orden original.',
        "grep -F -e 'AVISO' -e 'ERROR' guardia.log > ~/entrega/alertas.txt", 'alertas.txt', [guardia[1], guardia[3]], 'entrega', 'Guarda las coincidencias, no el número de ellas.'),
      entrega('Incidencias sin cabeceras', 'Crea <code>~/entrega</code> y guarda en <code>limpio.log</code> todas las líneas de <code>cabeceras.log</code> que no sean comentarios iniciados por <code>#</code>.',
        "grep -v '^#' cabeceras.log > ~/entrega/limpio.log", 'limpio.log', ['AVISO: hielo', 'ERROR: motor', 'OK: camino'], 'entrega', 'Aplica la inversión a un patrón anclado al principio.'),
      entrega('Inventario de la alarma remota', 'Crea <code>~/entrega</code> y escribe en <code>rutas.txt</code> los nombres ordenados de los ficheros de <code>senal</code> que tengan la palabra <code>aviso</code>, ignorando mayúsculas.',
        "grep -rilw 'aviso' senal | sort > ~/entrega/rutas.txt", 'rutas.txt', ['senal/a.log', 'senal/b.log', 'senal/remota/z.log'], 'recursivo', 'Necesitas recursión, palabra completa y nombres de fichero.'),
      entrega('Rastreo con números de línea', 'Crea <code>~/entrega</code> y recopila en <code>rastro.txt</code> las líneas de <code>senal</code> con <code>ERROR</code> o <code>AVISO</code> en mayúsculas. Incluye fichero y número, y ordena la salida.',
        "grep -rnF -e 'ERROR' -e 'AVISO' senal | sort > ~/entrega/rastro.txt", 'rastro.txt', ['senal/a.log:1:AVISO hielo', 'senal/remota/z.log:1:ERROR camara', 'senal/remota/z.log:2:AVISO nieve'], 'recursivo', 'Combina dos patrones, pero usa un solo recorrido recursivo para etiquetar las líneas.'),
      entrega('Recuento de ocurrencias archivado', 'Crea <code>~/entrega</code> y guarda en <code>total.txt</code> el número de apariciones de <code>sol</code> como palabra en <code>conteo.txt</code>.',
        "grep -ow 'sol' conteo.txt | wc -l > ~/entrega/total.txt", 'total.txt', ['4'], 'ocurrencia', 'Cuenta las apariciones, no las líneas de origen.'),
      entrega('Recopilar desde dos turnos', 'Crea <code>~/entrega</code>. Guarda en <code>turnos.txt</code> los avisos de <code>senal/a.log</code> y añade después los de <code>senal/b.log</code>. Ignora mayúsculas y guarda solo el contenido de las líneas.',
        ["grep -i 'aviso' senal/a.log > ~/entrega/turnos.txt", "grep -i 'aviso' senal/b.log >> ~/entrega/turnos.txt"], 'turnos.txt', ['AVISO hielo', 'aviso baterias'], 'entrega', 'Para el segundo lote debes conservar las líneas ya guardadas.'),
      entrega('Parte de zonas en alerta', 'Crea <code>~/entrega</code> y guarda en <code>zonas.txt</code> los nombres de las zonas de <code>medidas.txt</code> con <code>AVISO</code> o <code>ERROR</code>, en orden alfabético.',
        "grep -F -e 'AVISO' -e 'ERROR' medidas.txt | cut -d ':' -f1 | sort > ~/entrega/zonas.txt", 'zonas.txt', ['este', 'norte', 'oeste'], 'tuberia', 'Tras buscar incidentes, extrae los nombres antes de ordenar.'),
      entrega('Parte de temperaturas fuera de rango', 'Crea <code>~/entrega</code> y guarda en <code>mediciones.txt</code> los valores del tercer campo de <code>medidas.txt</code> de las zonas que no estén en estado <code>OK</code>. Ordena de menor a mayor.',
        "grep -vF ':OK:' medidas.txt | cut -d ':' -f3 | sort -n > ~/entrega/mediciones.txt", 'mediciones.txt', ['11', '17', '46'], 'tuberia', 'Busca el estado con sus separadores y usa orden numérico.'),
      entrega('Avisos incluidos y excluidos', 'Crea <code>~/entrega</code> y guarda en <code>filtro.txt</code> las líneas con <code>aviso</code> de todo <code>senal</code>, excepto las que hablan de <code>nieve</code>. Ignora mayúsculas, conserva rutas y ordena.',
        "grep -ri 'aviso' senal | grep -vi 'nieve' | sort > ~/entrega/filtro.txt", 'filtro.txt', ['senal/a.log:AVISO hielo', 'senal/b.log:aviso baterias'], 'tuberia', 'El primer filtro incluye; el segundo excluye.')
    ];
  }

  const ids = ['17', '007', '42', '8', '17B', 'B17', '7 2', '000', '15  ', ''];
  const codigos = ['AB-123', 'AB-12', 'ab-123', 'XY-009', 'AX-321-extra', 'B0-432', '09:AB', 'ZZ-999'];
  const mensajes = [
    'OK zona=sur nota=10',
    'AVISO zona=norte temp=07',
    'ERROR zona=este temp=14',
    'AVISO zona=sur temp=11',
    'DEBUG aviso zona=oeste temp=09',
    'AVISO  zona=sur temp=0xA1'
  ];
  const formatoFS = {
    'ids.txt': texto(ids),
    'codigos.txt': texto(codigos),
    'mensajes.log': texto(mensajes),
    'nombres.txt': 'ALBA\nsol\nRio\nA3\n3A\nA-B\ndos palabras\nB\n',
    'saltos.txt': 'MAR 17\nMAR\t09\nMARCA 11\nMAR-22\nTIERRA 03\nMAR    5\n',
    'trazas.txt': '00 AF 9b\nFF 7f 0c\nGX 12 03\n2F AB\n',
    'legado.txt': 'nodo=ab.ab\nnodo=ab-ac\nnodo=sol.sol\nnodo=Sol.sol\nnodo=rio.sol\n',
    'separadores.txt': 'norte|18\nsur|7\nestep20\noeste|XX\neste|21\n',
    'turnos.txt': 'N1-inicio\nS2-guardia\nNX-anulado\nN3\nS5-final\nN8-beta extra\n',
    'rangos.txt': '0004\n0075\n1100\n500\n050\n12340\n0000\n',
    'observatorio/campo.log': 'AVISO zona=norte temp=12\nOK zona=norte nota=17\n',
    'observatorio/remota/campo.log': 'ERROR zona=sur temp=09\nAVISO zona=este temp=04\n',
    'observatorio/remota/parte.txt': 'Estado: operativo\n'
  };

  const regexGuias = {
    anclas: '<code>^</code> marca el comienzo de una línea y <code>$</code> su final. Con <code>-x</code>, grep también comprueba la línea entera.',
    clases: 'En una expresión regular, una clase equivale a un carácter. <code>[[:digit:]]</code> reconoce cifras y <code>[[:alpha:]]</code> reconoce letras.',
    repetir: 'En <code>grep -E</code>, <code>+</code> significa una o más veces. <code>{n}</code> significa exactamente n y <code>{m,n}</code> admite un intervalo.',
    grupo: 'Los paréntesis convierten un conjunto de caracteres o alternativas en una unidad que puedes repetir. La barra vertical significa «o».',
    opciones: 'Combina <code>-E</code> con las otras opciones de grep. <code>-i</code> ignora mayúsculas y <code>-n</code> añade el número de línea.',
    espacios: '<code>[[:blank:]]</code> coincide con espacios y tabulaciones. <code>[[:lower:]]</code>, <code>[[:upper:]]</code> y <code>[[:alnum:]]</code> distinguen familias de caracteres.',
    signos: 'Usa una barra invertida para escribir literalmente un signo que normalmente significa algo especial en una expresión regular.',
    extraer: '<code>-o</code> imprime cada fragmento encontrado por separado. Si necesitas solo un campo, puedes cortar la salida después.',
    pareja: 'Puedes reutilizar el texto capturado por el primer grupo con <code>\\1</code>. La comparación usa lo capturado, no solo su forma.',
    cifras: 'Valida la forma y la cantidad de cifras por separado. Una expresión regular comprueba texto; si tienes que comparar magnitudes, usa una etapa numérica tras extraer los campos.',
    informe: 'Combina pasos pequeños. Comprueba el patrón por sí solo, después transforma los resultados y, al final, guarda el fichero.'
  };

  function bancoRegex(parada) {
    const prueba = (titulo, pide, patron, fichero, esperadas, tema, pista, opciones = '', pipe = '') => parada({
      titulo, pide: 'Usa <code>grep -E</code>. ' + pide,
      ejemplo: 'grep -E' + opciones + ' ' + q(patron) + ' ' + fichero + pipe,
      archivos: formatoFS, datos: fichero.startsWith('observatorio') ? [] : [fichero],
      meta: { salida: esperadas.join('\n') },
      pistas: ['Empieza por decidir si buscas toda la línea o solo un fragmento.', pista],
      guia: '<p>' + regexGuias[tema] + '</p>', explica: regexGuias[tema],
      aprendizaje: { comando: 'grep', opciones: ['-E'] }
    });
    const entrega = (titulo, pide, orden, nombre, esperadas, tema, pista) => parada({
      titulo, pide: 'Usa <code>grep -E</code> en la selección. ' + pide,
      ejemplo: ['mkdir -p ~/entrega', orden + ' > ~/entrega/' + nombre], archivos: formatoFS,
      meta: { directorios: '~/entrega', contenido: { ['~/entrega/' + nombre]: texto(esperadas) } },
      pistas: ['Crea la carpeta de destino y verifica el patrón antes de redirigir.', pista],
      guia: '<p>' + regexGuias[tema] + '</p>',
      explica: 'El informe se valida por su contenido. La búsqueda describe el formato, y las etapas siguientes preparan el dato que se entrega.'
    });

    return [
      prueba('Una sola cifra', 'Muestra las líneas de <code>ids.txt</code> que sean exactamente una cifra.', '^[[:digit:]]$', 'ids.txt', ['8'], 'clases', 'La clase ocupa una posición. Ponla entre los límites de línea.'),
      prueba('Dos cifras, nada detrás', 'Muestra las líneas de <code>ids.txt</code> formadas por exactamente dos cifras, sin espacios.', '^[[:digit:]]{2}$', 'ids.txt', ['17', '42'], 'repetir', 'Repite exactamente dos veces y comprueba ambos extremos.'),
      prueba('Código largo completo', 'Selecciona en <code>ids.txt</code> identificadores completos de tres cifras. Conserva los ceros iniciales.', '^[[:digit:]]{3}$', 'ids.txt', ['007', '000'], 'anclas', 'Los ceros también son cifras. No conviertas el texto en un número.'),
      prueba('Todas las longitudes enteras', 'Selecciona en <code>ids.txt</code> líneas formadas por una o más cifras y ningún otro carácter.', '^[[:digit:]]+$', 'ids.txt', ['17', '007', '42', '8', '000'], 'repetir', 'El mínimo es uno. El patrón no debe aceptar una línea vacía.'),
      prueba('Longitud variable con dos límites', 'Muestra en <code>ids.txt</code> solo identificadores completos de una o dos cifras.', '^[[:digit:]]{1,2}$', 'ids.txt', ['17', '42', '8'], 'repetir', 'Pon el límite inferior y el superior en el mismo cuantificador.'),
      prueba('Dos cifras al comienzo de un identificador', 'Muestra las líneas de <code>ids.txt</code> que empiecen por dos cifras seguidas, aunque haya más texto detrás.', '^[[:digit:]]{2}', 'ids.txt', ['17', '007', '42', '17B', '000', '15  '], 'anclas', 'Solo importa el límite izquierdo.'),
      prueba('Barra sin contenido', 'Muestra las líneas de <code>ids.txt</code> que tengan algún carácter que no sea una cifra. Omite las líneas vacías.', '[^[:digit:]]', 'ids.txt', ['17B', 'B17', '7 2', '15  '], 'clases', 'Un ^ dentro de la clase niega esa clase. La línea debe contener al menos un carácter de ese tipo.'),
      prueba('Nombres sin separadores', 'Muestra las líneas de <code>nombres.txt</code> que contengan solo letras y tengan al menos dos.', '^[[:alpha:]]{2,}$', 'nombres.txt', ['ALBA', 'sol', 'Rio'], 'clases', 'Usa una clase de letras y deja abierto el máximo de repeticiones.'),

      prueba('Nombre de indicativo oficial', 'Muestra las líneas de <code>nombres.txt</code> con exclusivamente letras mayúsculas.', '^[[:upper:]]+$', 'nombres.txt', ['ALBA', 'B'], 'espacios', 'La clase de mayúsculas excluye cifras y minúsculas.'),
      prueba('Indicativo mixto', 'De <code>nombres.txt</code>, conserva solo líneas de dos caracteres que tengan una letra mayúscula seguida de una cifra.', '^[[:upper:]][[:digit:]]$', 'nombres.txt', ['A3'], 'clases', 'El orden de las dos clases define el orden de los caracteres.'),
      prueba('La cifra va delante', 'De <code>nombres.txt</code>, conserva identificadores de dos caracteres que empiecen por una cifra y acaben en letra.', '^[[:digit:]][[:alpha:]]$', 'nombres.txt', ['3A'], 'clases', 'Invierte el orden de las clases con respecto al ejercicio anterior.'),
      prueba('Claves sin espacios ni guiones', 'En <code>nombres.txt</code>, conserva las líneas de dos o más caracteres exclusivamente alfanuméricos.', '^[[:alnum:]]{2,}$', 'nombres.txt', ['ALBA', 'sol', 'Rio', 'A3', '3A'], 'espacios', 'Una clase alfanumérica admite letras o cifras en cada posición.'),
      prueba('Dos mayúsculas y tres cifras', 'De <code>codigos.txt</code>, muestra solo los códigos válidos. Cada código tiene dos letras mayúsculas, un guion y tres cifras.', '^[[:upper:]]{2}-[[:digit:]]{3}$', 'codigos.txt', ['AB-123', 'XY-009', 'ZZ-999'], 'repetir', 'Aplica un cuantificador a cada clase, dejando el guion fijo en medio.'),
      prueba('Familias sin distinguir caja', 'De <code>codigos.txt</code>, muestra líneas con <code>ab</code> o <code>AB</code> seguido de guion y exactamente tres cifras.', '^ab-[[:digit:]]{3}$', 'codigos.txt', ['AB-123', 'ab-123'], 'opciones', 'La opción de ignorar mayúsculas evita duplicar el prefijo.', 'i'),
      prueba('El indicador con tabulación', 'En <code>saltos.txt</code>, selecciona líneas que sean <code>MAR</code>, espacio o tabulación (uno solo), y dos cifras.', '^MAR[[:blank:]][[:digit:]]{2}$', 'saltos.txt', ['MAR 17', 'MAR\t09'], 'espacios', 'Representa los dos tipos de separación con una clase.'),
      prueba('Campos alineados a mano', 'Selecciona en <code>saltos.txt</code> líneas con <code>MAR</code>, uno o más espacios o tabulaciones y un campo numérico completo.', '^MAR[[:blank:]]+[[:digit:]]+$', 'saltos.txt', ['MAR 17', 'MAR\t09', 'MAR    5'], 'espacios', 'Repite de forma independiente el separador y las cifras.'),
      prueba('Solo el bloque de tres números hexadecimales', 'En <code>trazas.txt</code>, encuentra líneas de tres bytes hexadecimales, cada uno con dos caracteres, separados por un espacio.', '^([[:xdigit:]]{2} ){2}[[:xdigit:]]{2}$', 'trazas.txt', ['00 AF 9b', 'FF 7f 0c'], 'grupo', 'Agrupa un byte junto con el espacio y repite ese bloque dos veces.'),

      prueba('Cifras dentro de un registro', 'Extrae solo los grupos de cifras de <code>codigos.txt</code>, por orden de aparición.', '[[:digit:]]+', 'codigos.txt', ['123', '12', '123', '009', '321', '0', '432', '09', '999'], 'extraer', 'La búsqueda tiene que devolver cada fragmento en vez de la línea completa.', 'o'),
      prueba('Códigos de estación en fragmentos', 'De <code>turnos.txt</code>, extrae solo el prefijo de dos caracteres del comienzo, una mayúscula seguida de una cifra.', '^[[:upper:]][[:digit:]]', 'turnos.txt', ['N1', 'S2', 'N3', 'S5', 'N8'], 'extraer', 'Haz la coincidencia al principio y emite solo esos dos caracteres.', 'o'),
      prueba('Temperaturas decimales sin cortar hexadecimales', 'En <code>mensajes.log</code>, extrae solo fragmentos <code>temp=NN</code> con dos cifras decimales al final de la línea.', 'temp=[[:digit:]]{2}$', 'mensajes.log', ['temp=07', 'temp=14', 'temp=11', 'temp=09'], 'extraer', 'El final de línea impide recortar una cifra desde un valor más largo.', 'o'),
      prueba('Identificar un campo de zona', 'Extrae de <code>mensajes.log</code> los fragmentos <code>zona=</code> seguidos de un nombre en minúsculas.', 'zona=[[:lower:]]+', 'mensajes.log', ['zona=sur', 'zona=norte', 'zona=este', 'zona=sur', 'zona=oeste', 'zona=sur'], 'extraer', 'Mantén la etiqueta fija y usa la clase de minúsculas para el valor.', 'o'),
      prueba('Parte sin etiquetas repetidas', 'Extrae de <code>mensajes.log</code> los nombres de zona sin la etiqueta <code>zona=</code>, por orden de aparición.', 'zona=[[:lower:]]+', 'mensajes.log', ['sur', 'norte', 'este', 'sur', 'oeste', 'sur'], 'extraer', 'Quita la etiqueta después de extraer el fragmento.', 'o', " | cut -d '=' -f2"),
      prueba('Zonas distintas del día', 'Muestra los nombres de zona de <code>mensajes.log</code> una sola vez y en orden alfabético.', 'zona=[[:lower:]]+', 'mensajes.log', ['este', 'norte', 'oeste', 'sur'], 'extraer', 'Tras extraer los valores, ordenar permite eliminar repeticiones.', 'o', " | cut -d '=' -f2 | sort -u"),
      prueba('Índice de códigos completos', 'Numera las líneas de <code>codigos.txt</code> que contengan un código completo de dos mayúsculas, guion y tres cifras.', '^[[:upper:]]{2}-[[:digit:]]{3}$', 'codigos.txt', ['1:AB-123', '4:XY-009', '8:ZZ-999'], 'opciones', 'Combina modo extendido y numeración; los números se refieren al original.', 'n'),
      prueba('Total de turnos breves', 'Cuenta las líneas completas de <code>turnos.txt</code> formadas por una mayúscula y una cifra, sin descripción.', '^[[:upper:]][[:digit:]]$', 'turnos.txt', ['1'], 'opciones', 'Usa la opción de contar líneas en vez de mostrar la coincidencia.', 'c'),
      prueba('Fragmento separado por barra vertical', 'De <code>separadores.txt</code>, muestra las filas con un nombre de zona, una barra vertical literal y un número de una o más cifras.', '^[[:lower:]]+\\|[[:digit:]]+$', 'separadores.txt', ['norte|18', 'sur|7', 'este|21'], 'signos', 'Protege la barra vertical dentro de la expresión para que sea parte del texto.'),

      prueba('Dos clases de señal, solo al inicio', 'En <code>mensajes.log</code>, selecciona líneas que empiecen por <code>AVISO</code> o <code>ERROR</code> como primer campo.', '^(AVISO|ERROR)[[:blank:]]+', 'mensajes.log', [mensajes[1], mensajes[2], mensajes[3], mensajes[5]], 'grupo', 'El límite de inicio debe aplicarse a las dos alternativas.'),
      prueba('El identificador opcional', 'De <code>turnos.txt</code>, selecciona líneas completas con una mayúscula y una cifra, con o sin un sufijo formado por guion y letras minúsculas.', '^[[:upper:]][[:digit:]](-[[:lower:]]+)?$', 'turnos.txt', ['N1-inicio', 'S2-guardia', 'N3', 'S5-final'], 'grupo', 'Haz opcional un grupo que incluye tanto el guion como las letras.'),
      prueba('Las dos mitades se repiten', 'De <code>legado.txt</code>, conserva identificadores <code>nodo=palabra.palabra</code> que repitan la misma palabra minúscula a ambos lados del punto.', '^nodo=([[:lower:]]+)\\.\\1$', 'legado.txt', ['nodo=ab.ab', 'nodo=sol.sol'], 'pareja', 'El segundo grupo debe coincidir con lo que ya capturó el primero, carácter por carácter.'),
      prueba('Registros que no cumplen el formato', 'En <code>codigos.txt</code>, muestra las líneas que no sean un código completo de dos mayúsculas, guion y tres cifras.', '^[[:upper:]]{2}-[[:digit:]]{3}$', 'codigos.txt', ['AB-12', 'ab-123', 'AX-321-extra', 'B0-432', '09:AB'], 'opciones', 'Escribe primero la regla de un código correcto y después invierte el filtro.', 'v'),
      prueba('Localizar códigos bajos por prefijo', 'Selecciona en <code>rangos.txt</code> códigos completos de cuatro cifras que empiecen por dos ceros.', '^00[[:digit:]]{2}$', 'rangos.txt', ['0004', '0075', '0000'], 'cifras', 'Los dos primeros caracteres son fijos; los restantes sí son una clase.'),
      prueba('Una bitácora con formatos admitidos', 'En <code>mensajes.log</code>, conserva las alertas <code>AVISO</code> cuyo campo final sea una temperatura decimal de dos cifras o hexadecimal de dos caracteres con prefijo <code>0x</code>.', '^AVISO[[:blank:]].*temp=([[:digit:]]{2}|0x[[:xdigit:]]{2})$', 'mensajes.log', [mensajes[1], mensajes[3], mensajes[5]], 'grupo', 'Agrupa los dos formatos de valor para que ambos acaben en el final de línea.'),
      prueba('Valores decimales por tamaño y no por texto', 'De <code>mensajes.log</code>, extrae el valor de los campos <code>temp</code> de dos cifras decimales que cierren la línea. Ordénalos de mayor a menor, conservando su formato.', 'temp=[[:digit:]]{2}$', 'mensajes.log', ['14', '11', '09', '07'], 'cifras', 'Separa el valor de la etiqueta y usa orden numérico inverso.', 'o', " | cut -d '=' -f2 | sort -nr"),
      prueba('Localizar alertas en todo el observatorio', 'Busca de forma recursiva en <code>observatorio</code> las líneas que empiecen por <code>ERROR</code> o <code>AVISO</code> seguido de espacio o tabulación. Muestra ruta y número, en orden lexicográfico.', '^(ERROR|AVISO)[[:blank:]]', 'observatorio', ['observatorio/campo.log:1:AVISO zona=norte temp=12', 'observatorio/remota/campo.log:1:ERROR zona=sur temp=09', 'observatorio/remota/campo.log:2:AVISO zona=este temp=04'], 'opciones', 'Modo extendido, recursión y numeración se pueden combinar.', 'rn', ' | sort'),
      prueba('Valores sin el campo de estado','Muestra solo los valores numéricos de las filas de <code>separadores.txt</code> que tengan formato nombre, barra vertical literal y número completo. Ordénalos de menor a mayor.',
        '^[[:lower:]]+\\|[[:digit:]]+$', 'separadores.txt', ['7', '18', '21'], 'cifras', 'Primero valida la estructura de la fila; después separa por la barra y ordena numéricamente.', '', " | cut -d '|' -f2 | sort -n"),

      entrega('Depósito de códigos válidos', 'Crea <code>~/entrega</code> y guarda en <code>validos.txt</code> los códigos de <code>codigos.txt</code> que sean dos mayúsculas, guion y tres cifras. Ordena alfabéticamente.',
        "grep -E '^[[:upper:]]{2}-[[:digit:]]{3}$' codigos.txt | sort", 'validos.txt', ['AB-123', 'XY-009', 'ZZ-999'], 'informe', 'Prueba primero el filtro anclado y ordena después.'),
      entrega('Inventario de códigos mal formados', 'Crea <code>~/entrega</code> y guarda en <code>invalidos.txt</code> los números de línea y contenido de los códigos no válidos de <code>codigos.txt</code>. Un código válido tiene dos mayúsculas, guion y tres cifras.',
        "grep -Env '^[[:upper:]]{2}-[[:digit:]]{3}$' codigos.txt", 'invalidos.txt', ['2:AB-12', '3:ab-123', '5:AX-321-extra', '6:B0-432', '7:09:AB'], 'opciones', 'Invierte la regla válida y conserva la numeración de origen.'),
      entrega('La cifra que falta en la mesa', 'Crea <code>~/entrega</code> y escribe en <code>total.txt</code> cuántos códigos completos de <code>ids.txt</code> tienen tres cifras.',
        "grep -Ec '^[[:digit:]]{3}$' ids.txt", 'total.txt', ['2'], 'repetir', 'La cuenta debe incluir 000: tiene tres caracteres válidos.'),
      entrega('Firma de trazas hexadecimal', 'Crea <code>~/entrega</code> y guarda en <code>bytes.txt</code> las líneas de <code>trazas.txt</code> que contengan exactamente tres bytes hexadecimales separados por un espacio.',
        "grep -E '^([[:xdigit:]]{2} ){2}[[:xdigit:]]{2}$' trazas.txt", 'bytes.txt', ['00 AF 9b', 'FF 7f 0c'], 'grupo', 'Usa una repetición del grupo para no duplicar tres veces la misma idea.'),
      entrega('Mapa de zonas distintas', 'Crea <code>~/entrega</code> y guarda en <code>zonas.txt</code> los nombres de zona de <code>mensajes.log</code> que figuren en líneas con primer campo <code>AVISO</code> o <code>ERROR</code>. Sin etiquetas, duplicados ni cambios de caja. Orden alfabético.',
        "grep -E '^(AVISO|ERROR)[[:blank:]]' mensajes.log | grep -Eo 'zona=[[:lower:]]+' | cut -d '=' -f2 | sort -u", 'zonas.txt', ['este', 'norte', 'sur'], 'informe', 'Divide la tarea en dos patrones: seleccionar registros y extraer campos.'),
      entrega('Filtrado de turnos en la frontera', 'Crea <code>~/entrega</code> y escribe en <code>entrega/turnos.txt</code> solo los códigos válidos del <code>turnos.txt</code> original. Un código consta de mayúscula y cifra. Después puede haber un guion seguido de una descripción formada solo por minúsculas. Mantén el orden original.',
        "grep -E '^[[:upper:]][[:digit:]](-[[:lower:]]+)?$' turnos.txt | grep -Eo '^[[:upper:]][[:digit:]]'", 'turnos.txt', ['N1', 'S2', 'N3', 'S5'], 'informe', 'Valida la línea entera. Luego saca el fragmento de interés sin repetir la validación.'),
      entrega('Parte de frío medible', 'Crea <code>~/entrega</code> y guarda en <code>temperaturas.txt</code> las temperaturas decimales de dos cifras que cierran líneas con primer campo <code>AVISO</code> o <code>ERROR</code> en <code>mensajes.log</code>. Guarda solo los números y ordénalos de menor a mayor.',
        "grep -E '^(AVISO|ERROR)[[:blank:]]' mensajes.log | grep -Eo 'temp=[[:digit:]]{2}$' | cut -d '=' -f2 | sort -n", 'temperaturas.txt', ['07', '11', '14'], 'informe', 'El segundo filtro exige el final de línea para no mezclar valores hexadecimales.'),
      entrega('Coincidencias de claves duplicadas', 'Crea <code>~/entrega</code> y escribe en <code>nodos.txt</code> las líneas de <code>legado.txt</code> donde, después de <code>nodo=</code>, se repite la misma palabra minúscula a ambos lados de un punto. Ordena alfabéticamente.',
        "grep -E '^nodo=([[:lower:]]+)\\.\\1$' legado.txt | sort", 'nodos.txt', ['nodo=ab.ab', 'nodo=sol.sol'], 'pareja', 'Captura la primera palabra y exige una repetición de lo capturado.'),
      entrega('Informe de dos ramales', 'Crea <code>~/entrega</code> y guarda en <code>radar.txt</code> los códigos de zona (solo nombres) en líneas de <code>observatorio</code> y sus subcarpetas que empiecen por <code>AVISO</code> o <code>ERROR</code>. Ordénalos y elimina repeticiones.',
        "grep -Erh '^(AVISO|ERROR)[[:blank:]]' observatorio | grep -Eo 'zona=[[:lower:]]+' | cut -d '=' -f2 | sort -u", 'radar.txt', ['este', 'norte', 'sur'], 'informe', 'Recorre todo el árbol antes de separar y reunir los valores.')
    ];
  }

  Object.assign(window.BOREAL_BANCOS ||= {}, {
    'boreal-find': ({ parada }) => bancoFind(parada),
    'boreal-grep': ({ parada }) => bancoGrep(parada),
    'boreal-regex': ({ parada }) => bancoRegex(parada)
  });
})();
