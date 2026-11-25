#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');

// Ejecuta el motor real con un DOM mínimo: se comprueban estado, HTML generado
// y acciones reales de la aventura, sin exponer una API de pruebas al producto.
function iniciar(datosReales=false, progresoBoreal=null) {
  const elements = new Map(), storage = new Map(), alerts = [];
  const seed = JSON.stringify({ xp:27, lecciones:{ pwd:{ rondasHechas:1, ronda:0, pantalla:0 } } });
  storage.set('aventura-v1', seed);
  if (progresoBoreal) storage.set('aventura-tema3-v2',JSON.stringify(progresoBoreal));
  let document;
  function element() {
    const e = { className:'', hidden:false, children:[], value:'', style:{}, attrs:{}, dataset:{},
      append(){}, prepend(){}, before(){}, remove(){}, addEventListener(){}, querySelectorAll(){return [];},
      contains(){return false;}, focus(){document.activeElement=e;}, setSelectionRange(){},
      setAttribute(k,v){e.attrs[k]=String(v);}, getAttribute(k){return e.attrs[k];} };
    let content='';
    Object.defineProperties(e, {
      innerHTML:{ get(){return content;}, set(v){content=String(v);e.children=[...content.matchAll(/<i[ >]/g)].map(()=>element());} },
      textContent:{ get(){return content.replace(/<[^>]*>/g,'');}, set(v){content=String(v);} },
      childElementCount:{get(){return e.children.length;}}
    });
    e.classList = { add(c){if(!this.contains(c))e.className+=' '+c;}, remove(c){e.className=e.className.split(/\s+/).filter(x=>x!==c).join(' ');},
      contains(c){return e.className.split(/\s+/).includes(c);}, toggle(c,b){b=b==null?!this.contains(c):b;b?this.add(c):this.remove(c);return b;} };
    return e;
  }
  const byId = id => {if(!elements.has(id))elements.set(id,element());return elements.get(id);};
  document={ getElementById:byId, createElement:element, querySelector:element, addEventListener(){}, activeElement:null, hidden:false };
  document.body=element();
  const ctx={console,document,matchMedia:()=>({matches:true}),setTimeout:()=>1,clearTimeout(){},
    addEventListener(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},
    promptHtml:()=>'$ ',escapar:t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    confirm:()=>true,alert:t=>alerts.push(t)};
  ctx.window=ctx;
  ctx.FileReader=class {readAsText(f){this.result=f.text;this.onload();}};
  vm.createContext(ctx);
  const html=fs.readFileSync(path.join(root,'linux-terminal.html'),'utf8');
  vm.runInContext(html.slice(html.indexOf('const MUNDO_HOME'),html.indexOf('// 1) Lectura y validación')),ctx);
  vm.runInContext(fs.readFileSync(path.join(root,'aventura/aventura-datos.js'),'utf8'),ctx);
  if (datosReales) {
    for (const archivo of ['boreal-campamento', 'boreal-busqueda', 'boreal-columnas', 'boreal-taller', 'aventura-tema3', 'boreal-atlas'])
      vm.runInContext(fs.readFileSync(path.join(root,'aventura',archivo+'.js'),'utf8'),ctx);
  }
  else vm.runInContext(`window.AVENTURA_TEMA3={titulo:'La ruta de las señales',practicaSinEjemplo:true,mundos:[{
    id:'t3-archivo',titulo:'Archivo de señales',resumen:'Recupera el mensaje',lecciones:[{
      id:'t3-filtro',titulo:'Busca la señal',resumen:'Filtra el contenido',comando:'grep',
      inicio:{base:'vacio',fs:{'~/señal.txt':'ruido\\nclave=42\\ndato  doble\\n'}},rondas:[{
        titulo:'La primera señal',resumen:'Elige el patrón',pantallas:[
          {tipo:'teoria',titulo:'Filtra',html:'<p>Selecciona líneas con grep.</p>',ejemplo:"grep '^ruido' señal.txt"},
          {tipo:'practica',titulo:'Recupera la clave',pide:'Muestra solo la línea clave con grep.',ejemplo:"grep '^clave=' señal.txt",
            aprendizaje:{comando:'grep'},pistas:['Busca el comienzo.','Usa un ancla.','El prefijo es clave=.'],
            explica:'El ancla limita el comienzo de la línea.',meta:{salida:'clave=42'}},
          {tipo:'test',pregunta:'¿Qué ancla el comienzo?',opciones:[{t:'^',ok:true,porque:'Principio.'},{t:'$',porque:'Final.'}]}
        ]}]
    }]}]};`,ctx);
  const source=fs.readFileSync(path.join(root,'aventura/aventura.js'),'utf8');
  const hook=`window.__avTest={abrir,abrirLeccion,abrirDistrito,avanzar,elegir,enviar,pedirAyuda,irAlMapa,importarProgreso,
    elegirExamen:typeof elegirExamen==='function'?elegirExamen:null,
    seleccionarExamen:typeof seleccionarExamen==='function'?seleccionarExamen:null,
    glosario,get progreso(){return av;},get leccion(){return lec;}};`;
  vm.runInContext(source.replace(/\}\)\(\);\s*$/,hook+'})();'),ctx);
  return {api:ctx.__avTest,byId,storage,seed,alerts,ctx};
}

test('Aventura ofrece elegir examen antes de mostrar un mapa',()=>{
  const {api,byId}=iniciar();api.abrir();
  const html=byId('av-cuerpo').innerHTML;
  assert.match(html,/data-examen="basicos"/,'falta el modo del examen del 12 de noviembre');
  assert.match(html,/data-examen="tema3"/,'falta el modo del próximo examen');
  assert.doesNotMatch(html,/class="av-camino/,'no debe concatenar los mapas en el selector');
});

test('el mapa del tema 3 y su progreso están separados del examen del 12 de noviembre',()=>{
  const {api,byId,storage,seed}=iniciar();api.abrir();api.seleccionarExamen('tema3');
  assert.match(byId('av-cuerpo').innerHTML,/Archivo de señales/);
  assert.doesNotMatch(byId('av-cuerpo').innerHTML,/Crear y ordenar/);
  assert.equal(api.progreso.xp,0);
  api.elegirExamen();api.seleccionarExamen('basicos');
  assert.equal(api.progreso.xp,27);
  assert.equal(api.progreso.lecciones.pwd.rondasHechas,1);
  assert.equal(storage.get('aventura-v1'),seed,'cambiar de modo no modifica el progreso anterior');
});

test('el glosario cambia con el temario elegido',()=>{
  const {api}=iniciar();api.abrir();api.seleccionarExamen('basicos');
  assert.ok(api.glosario().some(item=>item.t==='pwd'));
  api.elegirExamen();api.seleccionarExamen('tema3');
  assert.ok(!api.glosario().some(item=>item.t==='pwd'),'no debe reutilizar la caché del otro examen');
});

test('se aprende ejecutando: sin respuesta visible, con pistas y sin aprobar mediante echo',()=>{
  const {api,byId,storage,seed}=iniciar();api.abrir();api.seleccionarExamen('tema3');
  api.abrirLeccion(0,0);api.avanzar();
  assert.doesNotMatch(byId('av-cuerpo').innerHTML,/Escribe esto|class="av-hazlo"/);
  api.pedirAyuda();assert.match(byId('av-feedback').innerHTML,/Busca el comienzo/);
  api.pedirAyuda();assert.match(byId('av-feedback').innerHTML,/Usa un ancla/);
  assert.equal(byId('av-in').value,'','la ayuda no escribe la respuesta por el alumno');
  byId('av-in').value='echo clave=42';api.enviar();
  assert.equal(api.leccion.acierto,false,'echo no practica grep aunque imprima la respuesta');
  byId('av-in').value="grep 'inexistente' señal.txt; echo clave=42";api.enviar();
  assert.equal(api.leccion.acierto,false,'no se puede fabricar la salida después de un grep vacío');
  byId('av-in').value="grep 'inexistente' señal.txt | echo clave=42";api.enviar();
  assert.equal(api.leccion.acierto,false,'la última etapa de una tubería debe trabajar con los datos');
  byId('av-in').value="grep '^clave=' señal.txt";api.enviar();
  assert.equal(api.leccion.acierto,true);
  assert.match(byId('av-feedback').innerHTML,/El ancla limita/,'falta explicar por qué funciona');
  api.irAlMapa();api.elegirExamen();api.seleccionarExamen('basicos');
  assert.equal(api.progreso.xp,27);
  assert.equal(storage.get('aventura-v1'),seed);
  assert.ok(JSON.parse(storage.get('aventura-tema3-v1')).xp>0);
});

test('conserva el comando sin terminar al cambiar de examen y recuperarlo',()=>{
  const {api,byId}=iniciar();api.abrir();api.seleccionarExamen('tema3');api.abrirLeccion(0,0);api.avanzar();
  byId('av-in').value="grep '^cla";byId('av-in').oninput();
  api.irAlMapa();api.elegirExamen();api.seleccionarExamen('basicos');api.elegirExamen();api.seleccionarExamen('tema3');
  api.abrirLeccion(0,0);
  assert.equal(byId('av-in').value,"grep '^cla");
});

test('respeta los espacios del patrón entre comillas',()=>{
  const {api,byId}=iniciar();api.abrir();api.seleccionarExamen('tema3');api.abrirLeccion(0,0);api.avanzar();
  byId('av-in').value="grep -F 'dato  doble' señal.txt";api.enviar();
  assert.equal(api.leccion.hist.at(-1),'dato  doble\n');
});

test('una copia del otro examen no puede sustituir el progreso del seleccionado',()=>{
  const {api,byId,alerts}=iniciar();api.abrir();api.seleccionarExamen('tema3');
  api.importarProgreso({target:{files:[{text:JSON.stringify({app:'aventura-linux',datos:{xp:99}})}],value:'copia.json'}});
  assert.equal(api.progreso.xp,0);
  assert.match(alerts.join(' '),/examen/i);
  api.elegirExamen();api.seleccionarExamen('basicos');
  api.importarProgreso({target:{files:[{text:JSON.stringify({app:'aventura-linux',datos:{xp:99}})}],value:'copia.json'}});
  assert.equal(api.progreso.xp,99,'las copias anteriores siguen siendo válidas en el primer examen');
  byId('av-reiniciar').onclick();
  assert.equal(api.progreso.xp,0);
});

test('volver al mapa después de cerrar una ronda conserva la siguiente, sin repetir puntos',()=>{
  const {api,ctx,byId}=iniciar();
  const leccion=ctx.AVENTURA_TEMA3.mundos[0].lecciones[0];
  leccion.rondas.push(JSON.parse(JSON.stringify(leccion.rondas[0])));
  api.abrir();api.seleccionarExamen('tema3');api.abrirLeccion(0,0);api.avanzar();
  byId('av-in').value="grep '^clave=' señal.txt";api.enviar();api.avanzar();api.elegir(0);api.avanzar();
  assert.equal(api.progreso.lecciones['t3-filtro'].ronda,1);
  const xp=api.progreso.xp;
  api.irAlMapa();api.elegirExamen();api.seleccionarExamen('tema3');api.abrirLeccion(0,0);
  assert.equal(api.leccion.rondaIdx,1,'debe continuar por la nueva ronda');
  assert.equal(api.leccion.pantalla,0);
  assert.equal(api.progreso.xp,xp);
});

test('se puede completar toda la nueva ruta usando sus comandos reales sin alterar el primer examen',()=>{
  const {api,ctx,byId,storage,seed}=iniciar(true);
  api.abrir();api.seleccionarExamen('tema3');
  let practicas=0;
  ctx.AVENTURA_TEMA3.mundos.forEach((mundo,i)=>mundo.lecciones.forEach((leccion,j)=>{
    leccion.rondas.forEach((ronda,r)=>{
      api.abrirLeccion(i,j,{ronda:r});
      for (const pantalla of ronda.pantallas){
        if(pantalla.tipo==='practica'){
          for(const comando of [].concat(pantalla.ejemplo)){
            byId('av-in').value=comando;api.enviar();
          }
          assert.equal(api.leccion.acierto,true,pantalla.id+': '+api.leccion.aviso);
          practicas++;
        }else if(pantalla.tipo==='test'){
          api.elegir(pantalla.opciones.findIndex(opcion=>opcion.ok));
          assert.equal(api.leccion.acierto,true,pantalla.id);
        }
        api.avanzar();
      }
      api.irAlMapa();
    });
    assert.equal(api.progreso.lecciones[leccion.id].rondasHechas,leccion.rondas.length);
  }));
  assert.equal(practicas,505);
  assert.equal(storage.get('aventura-v1'),seed);
});


test('el atlas tiene cuatro regiones, 45 paradas por ruta y un simulacro de 20 preguntas',()=>{
  const {api,ctx,byId}=iniciar(true);
  api.abrir();api.seleccionarExamen('tema3');
  assert.match(byId('av-cuerpo').innerHTML,/Atlas Boreal/);
  assert.match(byId('av-cuerpo').innerHTML,/av-atlas-territorio/);
  assert.match(byId('av-cuerpo').innerHTML,/20 preguntas · 60 min/i);
  assert.equal(ctx.AVENTURA_TEMA3.simulacro.length,20);
  assert.equal([...byId('av-cuerpo').innerHTML.matchAll(/data-region=/g)].length,4);
  const rutas=ctx.AVENTURA_TEMA3.mundos.flatMap(mundo=>mundo.lecciones);
  assert.equal(rutas.length,11);
  assert.ok(rutas.every(ruta=>ruta.rondas.length===45));
  api.abrirDistrito(0,2);
  assert.match(byId('av-cuerpo').innerHTML,/<code>find<\/code>/);
  assert.equal([...byId('av-cuerpo').innerHTML.matchAll(/data-tramo=/g)].length,5);
  assert.equal([...byId('av-cuerpo').innerHTML.matchAll(/data-parada=/g)].length,9);
});

test('saltar a la última parada cuenta solo esa parada y mantiene el progreso anterior',()=>{
  const anterior={lecciones:{'boreal-find':{rondasHechas:1,ronda:0,pantalla:0,snapshot:null}}};
  const {api,ctx,byId,storage}=iniciar(true,anterior);
  api.abrir();api.seleccionarExamen('tema3');api.abrirDistrito(0,2);
  assert.match(byId('av-cuerpo').innerHTML,/Continuar en la parada 2/);
  api.abrirLeccion(0,2,{ronda:44});
  for (const comando of [].concat(api.leccion.ronda.pantallas[0].ejemplo)) {
    byId('av-in').value=comando;api.enviar();
  }
  assert.equal(api.leccion.acierto,true);
  api.avanzar();
  assert.match(byId('av-cuerpo').innerHTML,/2 de 45 paradas/);
  const progreso=JSON.parse(storage.get('aventura-tema3-v2')).lecciones['boreal-find'];
  assert.deepEqual(progreso.paradas,[0,44]);
  api.irAlMapa();
  assert.match(byId('av-cuerpo').innerHTML,/Continuar en la parada 2/);
  assert.match(byId('av-cuerpo').innerHTML,/aria-label="Parada 45\..*Completada/);
});

test('el simulacro permite pasar, retomar y corregir sus 20 preguntas',()=>{
  const {api,ctx,byId,storage,seed}=iniciar(true);
  api.abrir();api.seleccionarExamen('tema3');
  byId('av-simulacro').onclick();
  assert.match(byId('av-cuerpo').innerHTML,/Pregunta 1 de 20/);
  assert.match(byId('av-reloj').textContent,/^(60:00|59:59)$/);
  assert.doesNotMatch(byId('av-pie').innerHTML,/av-ayuda-btn|av-resultado-btn/);
  assert.equal(byId('av-sig').disabled,false);
  api.avanzar(); // omitir la primera
  byId('av-in').value='mkdir -p proyecto/datos';api.enviar();
  assert.equal(api.leccion.acierto,false);
  api.irAlMapa();byId('av-simulacro').onclick();
  assert.match(byId('av-cuerpo').innerHTML,/Pregunta 2 de 20/);
  byId('av-in').value='touch proyecto/datos/lista.txt';api.enviar();
  assert.equal(api.leccion.acierto,true,'se conserva la carpeta al salir y volver');
  api.avanzar();
  for(const ronda of ctx.AVENTURA_TEMA3.simulacro.slice(2)){
    for(const comando of [].concat(ronda.pantallas[0].ejemplo)){
      byId('av-in').value=comando;api.enviar();
    }
    assert.equal(api.leccion.acierto,true,ronda.titulo);
    api.avanzar();
  }
  assert.match(byId('av-cuerpo').innerHTML,/19 de 20 resueltas/);
  assert.match(byId('av-cuerpo').innerHTML,/Carpetas de entrega · Pendiente/);
  assert.equal(storage.get('aventura-v1'),seed);
  assert.equal(api.progreso.xp,0);
});

test('al vencer el reloj se cierra el simulacro y se muestra la corrección',()=>{
  const {api,ctx,byId}=iniciar(true);
  vm.runInContext('Date.now = () => window.relojPrueba',ctx);
  ctx.relojPrueba=1000;
  api.abrir();api.seleccionarExamen('tema3');byId('av-simulacro').onclick();
  ctx.relojPrueba+=60*60*1000;
  byId('av-in').value='mkdir -p examen/entrada examen/salida';api.enviar();
  assert.match(byId('av-cuerpo').innerHTML,/Tiempo agotado/);
  assert.match(byId('av-cuerpo').innerHTML,/0 de 20 resueltas/);
});

test('las pistas de Estación Boreal no revelan la solución del ejercicio',()=>{
  const {api,byId}=iniciar(true);
  api.abrir();api.seleccionarExamen('tema3');api.abrirLeccion(1,1);api.avanzar();
  assert.match(byId('av-cuerpo').innerHTML,/Contenido de claves\.txt/);
  assert.match(byId('av-cuerpo').innerHTML,/Repasar la explicación/);
  for(let i=0;i<5;i++) api.pedirAyuda();
  assert.doesNotMatch(byId('av-feedback').innerHTML,/solución razonada|grep -E/);
  assert.equal(byId('av-in').value,'');
  byId('av-in').value="grep -Ex '[[:digit:]]{3}' claves.txt";api.enviar();
  assert.equal(api.leccion.acierto,true,'acepta -x como alternativa a las anclas');
});

test('la última pista deja consultar el resultado sin ejecutar ni aprobar la práctica',()=>{
  const {api,byId}=iniciar(true);
  api.abrir();api.seleccionarExamen('tema3');api.abrirLeccion(1,0);api.avanzar();
  const boton=byId('av-resultado-btn'), panel=byId('av-resultado');
  assert.equal(boton.hidden,true);
  api.pedirAyuda();
  assert.equal(boton.hidden,true);
  api.pedirAyuda();
  assert.equal(boton.hidden,false);
  assert.equal(panel.hidden,true);
  boton.onclick();
  assert.match(panel.innerHTML,/<pre>2<\/pre>/);
  assert.doesNotMatch(panel.innerHTML,/grep -ic/);
  assert.equal(byId('av-in').value,'');
  assert.equal(byId('av-sig').disabled,true);
  assert.equal(api.leccion.acierto,false);
  boton.onclick();
  assert.equal(panel.hidden,true);
});

test('para un reto sin salida, la vista enseña la carpeta y el archivo esperados',()=>{
  const {api,byId}=iniciar(true);
  api.abrir();api.seleccionarExamen('tema3');api.abrirLeccion(0,0);api.avanzar();
  byId('av-in').value='mkdir -p base/mapas';api.enviar();api.avanzar();
  api.pedirAyuda();api.pedirAyuda();byId('av-resultado-btn').onclick();
  assert.match(byId('av-resultado').innerHTML,/Carpeta <code>~\/base\/partes<\/code>/);
  assert.match(byId('av-resultado').innerHTML,/Archivo <code>~\/base\/partes\/turno\.txt<\/code>.*vacío/);
  assert.equal(api.leccion.estado.fs['/home/usuario/base/partes'],undefined);
});

test('Campamento explica la carpeta mal colocada y permite moverla con su fichero',()=>{
  const {api,byId}=iniciar(true);
  api.abrir();api.seleccionarExamen('tema3');api.abrirLeccion(0,0);api.avanzar();
  const enviar = comando => { byId('av-in').value=comando;api.enviar(); };
  enviar('mkdir -p base/mapas');
  api.avanzar();
  enviar('mkdir partes');
  enviar('cd partes');
  enviar('touch turno.txt');
  assert.equal(api.leccion.acierto,false);
  assert.match(byId('av-feedback').innerHTML,/Encontré .*~\/partes.*debe quedar en .*~\/base\/partes/);
  enviar('cd ~');
  enviar('mv partes base/');
  assert.equal(api.leccion.acierto,true);
});
