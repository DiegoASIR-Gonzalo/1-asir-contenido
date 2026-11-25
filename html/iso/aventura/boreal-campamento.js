/* Campamento, depósito de cargas y observatorio. Cada tramo cambia de objetivo. */
(function () {
  const cuatro = [
    { sitio: 'norte', lugar: 'Norte', rama: 'rutas', aux: 'mapas', archivo: 'turno.txt', modo: '700', mes: 2 },
    { sitio: 'faro', lugar: 'del Faro', rama: 'planos', aux: 'costa', archivo: 'guardia.txt', modo: '750', mes: 3 },
    { sitio: 'cumbre', lugar: 'de la Cumbre', rama: 'medidas', aux: 'sensores', archivo: 'cota.txt', modo: '710', mes: 4 },
    { sitio: 'valle', lugar: 'del Valle', rama: 'partes', aux: 'vias', archivo: 'estado.txt', modo: '770', mes: 5 }
  ];
  const code = t => '<code>' + t + '</code>';
  const home = t => '~/' + t;
  const vacios = (...rutas) => Object.fromEntries(rutas.map(r => [home(r), '']));
  const dir = (...rutas) => ({ directorios: rutas.map(home) });
  const pista = (a, b) => [a, b];
  const herramienta = comando => ({ comando });

  function carpetas({parada}) {
    return [
      ({sitio:s, lugar:l}) => ['Patio ' + l, 'Crea la carpeta ' + code(s) + ' en tu carpeta personal.',
        'mkdir ' + s, dir(s), 'Un solo nombre basta para crear bajo la carpeta actual.', 'Comprueba el directorio con pwd.'],
      ({sitio:s, lugar:l, rama:r}) => ['Dos alas ' + l, 'Crea dos carpetas hermanas en tu carpeta personal: ' + code(s) + ' y ' + code(r) + '.',
        'mkdir ' + s + ' ' + r, dir(s,r), 'Dales el mismo directorio padre.', 'mkdir admite más de una ruta.'],
      ({sitio:s, lugar:l, rama:r, aux:a}) => ['Sendero ' + l, 'Crea ' + code(s+'/'+r+'/'+a) + '. No hay carpetas previas.',
        'mkdir -p '+s+'/'+r+'/'+a, dir(s,s+'/'+r,s+'/'+r+'/'+a), 'Piensa en padres que aún no existen.', '-p crea toda la cadena.'],
      ({sitio:s, lugar:l, aux:a}) => ['Nombre con espacios ' + l, 'Dentro de ' + code(s) + ', crea una carpeta llamada ' + code(a+' antiguos') + '.',
        "mkdir -p '"+s+'/'+a+" antiguos'", dir(s+'/'+a+' antiguos'), 'La carpeta hija tiene un espacio.', 'Las comillas conservan la ruta como un argumento.'],
      ({sitio:s, lugar:l, modo:m}) => ['Permisos ' + l, 'Crea ' + code(s) + ' con permisos exactos ' + code(m) + '.',
        'mkdir -m '+m+' '+s, {...dir(s), modo:{[home(s)]:m}}, 'El modo se puede asignar al crear.', 'La opción -m recibe el modo y luego la ruta.'],
      ({sitio:s, lugar:l, rama:r, modo:m}) => ['Padres y permisos ' + l, 'Crea ' + code(s+'/'+r) + ' con permisos ' + code(m) + '. El padre nuevo debe quedar con 755.',
        'mkdir -p -m '+m+' '+s+'/'+r, {...dir(s+'/'+r), modo:{[home(s)]:'755',[home(s+'/'+r)]:m}}, 'El permiso especial corresponde a la carpeta hoja.', '-p crea los padres; -m se aplica a la última ruta.'],
      ({sitio:s, lugar:l, aux:a}) => ['Prepara el turno ' + l, 'Dentro de ' + code(s) + ' crea ' + code(a) + ' y ' + code('entrega') + '. Conserva ' + code(s+'/nota.txt') + '.',
        'mkdir -p '+s+'/'+a+' '+s+'/entrega', {...dir(s+'/'+a,s+'/entrega'),contenido:{[home(s+'/nota.txt')]:'inventario\n'}}, 'Las dos rutas comparten el padre.', '-p se puede usar aunque el padre ya exista.', {[s+'/nota.txt']:'inventario\n'}],
      ({sitio:s, lugar:l, rama:r, aux:a}) => ['Desde el almacén ' + l, 'Estás dentro de ' + code(s+'/'+r) + '. Crea ' + code(s+'/'+a) + ' a su mismo nivel usando una ruta relativa.',
        'mkdir ../'+a, dir(s+'/'+a), 'Una carpeta hermana comparte el padre.', '.. sube un nivel.', {[s+'/'+r]:'dir'}, home(s+'/'+r), {comando:'mkdir',valores:['../'+a]}],
      ({sitio:s, lugar:l, rama:r, archivo:f}) => ['Árbol y registro ' + l, 'Prepara ' + code(s+'/'+r+'/entrada') + ' y ' + code(s+'/'+r+'/salida') + '. Deja ' + code(f) + ' vacío solo en entrada.',
        ['mkdir -p '+s+'/'+r+'/{entrada,salida}','touch '+s+'/'+r+'/entrada/'+f],
        {...dir(s+'/'+r+'/entrada',s+'/'+r+'/salida'),contenido:vacios(s+'/'+r+'/entrada/'+f),noExiste:home(s+'/'+r+'/salida/'+f)},
        'Separa el árbol del paso que crea el fichero.', 'Las llaves de Bash pueden generar dos ramas; escribirlas por separado también sirve.'],
      ({sitio:s, lugar:l, rama:r, archivo:f, modo:m}) => ['Entrega privada ' + l, 'Crea ' + code(s+'/'+r+'/privado') + ' con permisos ' + code(m) + ' y ' + code(s+'/'+r+'/publico') + ' con 755. Copia ' + code(f) + ' al privado sin quitar el original.',
        ['mkdir -p -m '+m+' '+s+'/'+r+'/privado','mkdir '+s+'/'+r+'/publico','cp '+f+' '+s+'/'+r+'/privado/'],
        {...dir(s+'/'+r+'/privado',s+'/'+r+'/publico'), modo:{[home(s+'/'+r+'/privado')]:m,[home(s+'/'+r+'/publico')]:'755'},
          contenido:{[home(f)]:'reserva\n',[home(s+'/'+r+'/privado/'+f)]:'reserva\n'}},
        'Las dos ramas piden modos distintos.', 'Crea el padre y la rama privada primero, y usa cp para conservar la fuente.', {[f]:'reserva\n'}],
      ({sitio:s, lugar:l, rama:r, aux:a, archivo:f}) => ['Repara el plano ' + l, 'La carpeta ' + code(a) + ' quedó fuera. Crea ' + code(s+'/'+r) + ', mueve ' + code(a) + ' allí con su contenido, y crea ' + code(s+'/salida') + '.',
        ['mkdir -p '+s+'/'+r+' '+s+'/salida','mv '+a+' '+s+'/'+r+'/'],
        {...dir(s+'/'+r+'/'+a,s+'/salida'), contenido:{[home(s+'/'+r+'/'+a+'/'+f)]:'conservar\n'},noExiste:home(a)},
        'La carpeta que vas a mover ya tiene un fichero útil.', 'Crea antes la ruta receptora. Mover la carpeta también mueve sus hijos.', {[a+'/'+f]:'conservar\n'}]
    ].flatMap(familia => cuatro.map(zona => {
      const [titulo,pide,ejemplo,meta,explica,sugerencia,archivos,cwd,aprendizaje] = familia(zona);
      return parada({titulo,pide,ejemplo,meta,archivos,cwd,aprendizaje,pistas:pista(explica,sugerencia),
        explica:sugerencia,guia:'<p>Una ruta relativa nace en <code>pwd</code>. <code>..</code> sube de nivel; <code>~</code> vuelve al directorio personal. Puedes revisar el árbol con <code>tree</code>.</p>'});
    }));
  }

  function ficheros({parada}) {
    const original = new Date(2025, 0, 8).getTime();
    const fecha = mes => new Date(2026, mes-1, 14).getTime();
    const conDatos = contenido => ({ contenido, atime:original, mtime:original });
    const marca = (ruta, campos) => ({ marcas:{[home(ruta)]:campos} });
    return [
      ({lugar:l,archivo:f}) => ['Ficha ' + l, 'Crea el fichero vacío '+code(f)+'.', 'touch '+f,
        {contenido:vacios(f)}, 'Un nombre nuevo produce un fichero vacío.'],
      ({lugar:l,sitio:s,archivo:f}) => ['Ficha en depósito ' + l, 'Crea '+code(f)+' dentro de '+code(s)+'. El depósito existe.',
        'touch '+s+'/'+f,{contenido:vacios(s+'/'+f)},'La barra separa el padre del nombre del fichero.',{[s]:'dir'}],
      ({lugar:l,archivo:f,aux:a}) => ['Dos fichas ' + l, 'Prepara '+code(f)+' y '+code(a+'.txt')+' vacíos.',
        'touch '+f+' '+a+'.txt',{contenido:vacios(f,a+'.txt')},'touch admite varios ficheros en la misma orden.'],
      ({lugar:l,sitio:s,archivo:f}) => ['Ficha con nombre compuesto ' + l,'Crea el fichero vacío '+code(s+' '+f)+'. El espacio forma parte del nombre.',
        "touch '"+s+" "+f+"'",{contenido:vacios(s+' '+f)},'Las comillas hacen que todo el nombre cuente como un argumento.'],
      ({lugar:l,archivo:f,mes:m}) => ['Fecha de archivo ' + l, 'Crea '+code(f)+' con fecha de acceso y modificación '+code('2026-0'+m+'-14')+' a medianoche.',
        "touch -d '2026-0"+m+"-14' "+f,{contenido:vacios(f),...marca(f,{mtime:fecha(m),atime:fecha(m)})},'-d indica la fecha en texto.'],
      ({lugar:l,archivo:f,mes:m}) => ['Actualiza solo modificación ' + l,'Conserva el contenido de '+code(f)+' y pon su modificación en '+code('2026-0'+m+'-14')+'. Mantén el acceso.',
        "touch -m -d '2026-0"+m+"-14' "+f,{contenido:{[home(f)]:'datos\n'},...marca(f,{mtime:fecha(m),atime:original})},'-m limita el cambio a modificación.',{[f]:conDatos('datos\n')}],
      ({lugar:l,archivo:f,mes:m}) => ['Actualiza solo acceso ' + l,'Cambia solo el acceso de '+code(f)+' a '+code('2026-0'+m+'-14')+'. No alteres el contenido ni su modificación.',
        "touch -a -d '2026-0"+m+"-14' "+f,{contenido:{[home(f)]:'lectura\n'},...marca(f,{atime:fecha(m),mtime:original})},'-a apunta a la fecha de acceso.',{[f]:conDatos('lectura\n')}],
      ({lugar:l,archivo:f,mes:m}) => ['Copia las marcas ' + l,'Aplica a '+code(f)+' las dos fechas de '+code('modelo.txt')+' sin copiar su contenido.',
        'touch -r modelo.txt '+f,{contenido:{[home(f)]:'turno\n'},...marca(f,{atime:original,mtime:fecha(m)})},'-r toma las marcas del fichero de referencia.',{[f]:conDatos('turno\n'),'modelo.txt':{contenido:'modelo\n',atime:original,mtime:fecha(m)}}],
      ({lugar:l,archivo:f,mes:m}) => ['Actualización sin altas ' + l,'Pon fecha '+code('2026-0'+m+'-14')+' en '+code(f)+' y aplica la misma orden a '+code('ausente.txt')+' sin crearlo.',
        "touch -c -d '2026-0"+m+"-14' "+f+" ausente.txt",{...marca(f,{mtime:fecha(m),atime:fecha(m)}),noExiste:home('ausente.txt')},
        '-c evita crear los nombres que falten.',{[f]:conDatos('datos\n')},{comando:'touch',valores:['ausente.txt']}],
      ({lugar:l,sitio:s,archivo:f,mes:m}) => ['Sella la entrega ' + l,'Crea '+code(s+'/entrega')+' y deja allí '+code(f)+' vacío, fechado el '+code('2026-0'+m+'-14')+'.',
        ['mkdir -p '+s+'/entrega',"touch -d '2026-0"+m+"-14' "+s+'/entrega/'+f],
        {...dir(s+'/entrega'),contenido:vacios(s+'/entrega/'+f),...marca(s+'/entrega/'+f,{mtime:fecha(m),atime:fecha(m)})},
        'Primero prepara la ruta, luego crea el fichero con una fecha.'],
      ({lugar:l,sitio:s,archivo:f,mes:m}) => ['Recupera y fecha ' + l,'Mueve '+code('borrador/'+f)+' a '+code(s+'/entrega/'+f)+'. Conserva su texto y usa la fecha de modificación de '+code('sello.txt')+' dejando intacto el acceso.',
        ['mkdir -p '+s+'/entrega','mv borrador/'+f+' '+s+'/entrega/','touch -m -r sello.txt '+s+'/entrega/'+f],
        {...dir(s+'/entrega'),noExiste:home('borrador/'+f),contenido:{[home(s+'/entrega/'+f)]:'parte final\n'},...marca(s+'/entrega/'+f,{mtime:fecha(m),atime:original})},
        'Mover conserva el fichero. -m con -r permite copiar solo la marca pedida.',{['borrador/'+f]:conDatos('parte final\n'),'sello.txt':{contenido:'sellado\n',mtime:fecha(m)}}]
    ].flatMap(familia => cuatro.map(zona => {
      const [titulo,pide,ejemplo,meta,idea,archivos,aprendizaje] = familia(zona);
      return parada({titulo,pide,ejemplo,meta,archivos,aprendizaje,pistas:pista('Distingue qué ficheros existen y qué dato debes cambiar.',idea),
        explica:idea,guia:'<p><code>touch</code> puede crear un fichero vacío o cambiar las fechas de uno existente. <code>stat</code> muestra sus marcas sin cambiar el contenido.</p>'});
    }));
  }

  function sesiones({parada}) {
    return [
      ({sitio:s,lugar:l}) => ['Abre guardia ' + l,'Crea y entra en una sesión llamada '+code(s)+'.',
        'tmux new -s '+s,{sesion:s,activa:s},'new crea la sesión y -s le da nombre.'],
      ({sitio:s,lugar:l}) => ['Prepara guardia ' + l,'Crea la sesión '+code(s)+' en segundo plano. No entres en ella.',
        'tmux new -d -s '+s,{sesion:s,activa:null},'-d crea la sesión desacoplada.'],
      ({sitio:s,lugar:l,aux:a}) => ['Recupera la guardia ' + l,'Vuelve a la sesión existente '+code(s)+'. La sesión '+code(a)+' debe seguir abierta.',
        'tmux attach -t '+s,{sesiones:[s,a],activa:s},'attach toma como destino -t.',[s,a]],
      ({sitio:s,lugar:l}) => ['Deja la guardia ' + l,'Desacopla la sesión '+code(s)+' sin cerrarla.',
        'tmux detach',{sesion:s,activa:null},'detach conserva la sesión y sus procesos.',[s],s],
      ({sitio:s,lugar:l,aux:a}) => ['Renombra la guardia ' + l,'Cambia el nombre de la sesión '+code(s)+' por '+code(a)+'. Déjala desacoplada.',
        'tmux rename-session -t '+s+' '+a,{sesiones:[a],activa:null},'rename-session recibe el destino actual y el nombre nuevo.',[s]],
      ({sitio:s,lugar:l,aux:a}) => ['Cambio de puesto ' + l,'Ya estás en '+code(s)+'. Cambia a la sesión existente '+code(a)+' con switch-client y conserva ambas.',
        'tmux switch-client -t '+a,{sesiones:[s,a],activa:a},'switch-client cambia el cliente activo a otra sesión.',[s,a],s],
      ({sitio:s,lugar:l,rama:r}) => ['Canal de trabajo ' + l,'En la sesión '+code(s)+', crea una ventana '+code(r)+' y selecciónala. Conserva la ventana inicial bash.',
        'tmux new-window -t '+s+' -n '+r,{sesion:s,ventanas:['bash',r],ventanaActiva:r},
        'new-window añade una ventana; -n indica el nombre.',[s],s],
      ({sitio:s,lugar:l,aux:a,rama:r}) => ['Dos ventanas ' + l,'Renombra la ventana inicial de '+code(s)+' a '+code(r)+'. Abre '+code(a)+' y vuelve a seleccionar '+code(r)+'.',
        ['tmux rename-window -t '+s+':0 '+r,'tmux new-window -t '+s+' -n '+a,'tmux select-window -t '+s+':'+r],
        {sesion:s,ventanas:[r,a],ventanaActiva:r},'El destino sesión:ventana elige la ventana concreta.',[s],s],
      ({sitio:s,lugar:l,aux:a,mes:m}) => ['Paneles de control ' + l,'En '+code(s)+', añade la ventana '+code(a)+' y divídela en dos paneles '+(m%2?'uno encima de otro':'uno al lado del otro')+'. La ventana bash queda con un panel.',
        ['tmux new-window -t '+s+' -n '+a,'tmux split-window -'+(m%2?'v':'h')+' -t '+s+':'+a],
        {sesion:s,ventanas:['bash',a],paneles:{bash:1,[a]:2},division:{[a]:m%2?'filas':'lados'}},
        'split-window divide el panel. -h deja dos a los lados y -v dos en vertical.',[s],s],
      ({sitio:s,lugar:l,aux:a,rama:r}) => ['Cierra el puesto viejo ' + l,'Vuelve a '+code(s)+', cierra únicamente la sesión '+code(r)+' y deja '+code(a)+' disponible.',
        ['tmux attach -t '+s,'tmux kill-session -t '+r],{sesiones:[s,a],activa:s},
        'kill-session termina solo el destino indicado. Las demás sesiones siguen disponibles.',[s,a,r]],
      ({sitio:s,lugar:l,aux:a,rama:r}) => ['Relevo completo ' + l,'Crea desacoplada '+code(s)+' con ventana inicial '+code(r)+'. Añade '+code(a)+', divídela lado a lado y guarda los nombres de las ventanas en '+code('relevo.txt')+', un nombre por línea y en su orden.',
        ['tmux new -d -s '+s+' -n '+r,'tmux new-window -t '+s+' -n '+a,'tmux split-window -h -t '+s+':'+a,
          "tmux list-windows -t "+s+" -F '#{window_name}' > relevo.txt"],
        {sesion:s,activa:null,ventanas:[r,a],paneles:{[r]:1,[a]:2},division:{[a]:'lados'}},
        'El formato #{window_name} permite guardar los nombres sin decoraciones.',null,null,{contenido:{'~/relevo.txt':r+'\n'+a+'\n'}}]
    ].flatMap(familia => cuatro.map(zona => {
      const [titulo,pide,ejemplo,tmuxMeta,idea,tmux,tmuxActiva,otroMeta] = familia(zona);
      return parada({titulo,pide,ejemplo,meta:{tmux:tmuxMeta,...otroMeta},tmux,tmuxActiva,
        aprendizaje:herramienta('tmux'),pistas:pista('Identifica si cambias una sesión, una ventana o un panel.',idea),
        explica:idea,guia:'<p>Una sesión contiene ventanas y cada ventana contiene paneles. Puedes inspeccionar sesiones con <code>tmux ls</code> y ventanas con <code>tmux list-windows -t SESIÓN</code>.</p>'});
    }));
  }
  Object.assign(window.BOREAL_BANCOS ||= {}, { 'boreal-carpetas': carpetas, 'boreal-touch': ficheros, 'boreal-tmux': sesiones });
})();
