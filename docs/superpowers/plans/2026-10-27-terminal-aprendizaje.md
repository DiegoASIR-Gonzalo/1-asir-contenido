# Terminal aprendizaje Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que los ejercicios de terminal enseñen mediante diagnósticos concretos y pistas progresivas, manteniendo los ejercicios actuales y limpiando las definiciones duplicadas.

**Architecture:** El intérprete seguirá ejecutando cada respuesta sobre una copia del mundo virtual. Se añadirá un diagnóstico estructurado que prioriza errores de sintaxis, requisitos de `meta` y conceptos de aprendizaje; la interfaz convertirá ese diagnóstico en feedback breve y pistas sin mostrar la solución completa. `actividades.js` quedará con una única definición final por actividad y conservará compatibilidad con `window.ACTIVIDADES`.

**Tech Stack:** JavaScript del navegador, HTML/CSS existente, Node.js para pruebas con `vm`, sin dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-10-27-terminal-aprendizaje-design.md`

## Global Constraints

- Mantener las 92 actividades y 105 pasos existentes.
- No aceptar comandos incompletos ni opciones desconocidas como soluciones válidas.
- No revelar automáticamente el comando completo de solución.
- No duplicar un caso de error por cada ejercicio.
- Mantener el simulador sin dependencias nuevas ni backend.

## Review Focus

- Un comando incompleto que produce parte de la salida no puede completar un paso; la prueba de sintaxis debe cubrir `find`, `head`, `tail`, `sort`, `cut` y `mkdir`.
- Un comando alternativo que consigue el mismo estado pero no usa el concepto pedido debe fallar cuando el paso declara requisitos de aprendizaje; añadir una prueba de comando incorrecto por concepto.
- Un fallo no debe mutar el mundo virtual; comprobarlo después de un comando parcialmente ejecutado con error.
- La tercera pista debe orientar con la forma general sin contener el ejemplo completo; añadir una aserción de que no incluye `paso.ejemplo`.
- La limpieza de datos no debe alterar numeración, metas, ejemplos ni mundos iniciales; mantener la prueba de 92/105 y la ejecución secuencial de todos los ejemplos.

---

### Task 1: Diagnóstico estructurado del motor

**Files:**
- Modify: `html/iso/linux-terminal.html` en `cmd_find`, `cmd_mkdir`, `cmd_head`, `cmd_tail`, `cmd_sort`, `cmd_cut`, `comprobarMeta`, `validarPaso` y el flujo de envío de comandos.
- Modify: `html/iso/pruebas/actividades.test.js` para cubrir diagnósticos y atomicidad.

**Interfaces:**
- Consumes: `paso.meta`, `ejecutarLinea()`, `comprobarMeta()` y el estado clonado.
- Produces: `validarPaso()` devolverá `{ ok, estado, salida, error, diagnostico }`, manteniendo los campos existentes; `diagnostico` será texto breve cuando el fallo sea explicable.

- [ ] **Step 1: Write the failing tests**

Añadir pruebas que comprueben que `find / -type` falla con un diagnóstico que menciona el argumento ausente, que un paso con `meta.existe` informa de las rutas pendientes y que un fallo después de una mutación deja el estado igual al original.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node html/iso/pruebas/actividades.test.js`

Expected: FAIL en las aserciones nuevas de `diagnostico`.

- [ ] **Step 3: Implement the minimal diagnostic path**

Conservar los errores del intérprete en `validarPaso()`, hacer que `comprobarMeta()` devuelva el primer requisito concreto que falla y añadir el campo `diagnostico` sin cambiar la semántica de los pasos existentes.

- [ ] **Step 4: Connect diagnostics to the activity panel**

En el flujo de envío, mostrar `diagnostico` cuando exista y usar el mensaje genérico solo como último recurso. Mantener el estado sin guardar cuando `ok` sea falso.

- [ ] **Step 5: Run the focused and full tests**

Run: `node html/iso/pruebas/actividades.test.js`

Expected: `92 actividades, 105 pasos, 0 errores`.

- [ ] **Step 6: Commit**

```powershell
git add html/iso/linux-terminal.html html/iso/pruebas/actividades.test.js
git commit -m "feat: explain terminal exercise errors"
```

### Task 2: Requisitos de aprendizaje y pistas progresivas

**Files:**
- Modify: `html/iso/actividades.js` para declarar requisitos solo en ejercicios que enseñan una opción o comando concreto.
- Modify: `html/iso/linux-terminal.html` en `pistasDe`, `pistaHtml`, `validarPaso` y la presentación del feedback.
- Modify: `html/iso/pruebas/actividades.test.js` para validar requisitos y pistas.

**Interfaces:**
- Consumes: `paso.aprendizaje` opcional con `comando`, `opciones`, `valores` y `pistas`.
- Produces: `validarPaso()` rechazará un comando que alcanza una meta por casualidad sin usar el concepto requerido; `pistasDe()` devolverá pistas ordenadas sin añadir la solución completa.

- [ ] **Step 1: Write the failing tests**

Añadir un requisito a un ejercicio de `find` y probar que `ls -R /` no lo supera, que `find / -type d` sí lo supera y que la tercera pista no contiene el ejemplo completo.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node html/iso/pruebas/actividades.test.js`

Expected: FAIL porque todavía no se comprueba `aprendizaje`.

- [ ] **Step 3: Implement generic requirement checking**

Tokenizar la entrada ya normalizada, comparar el comando y las opciones declaradas, y devolver una explicación conceptual sin mostrar `paso.ejemplo`. No exigir una cadena exacta cuando varias formas válidas usan los mismos conceptos.

- [ ] **Step 4: Add useful progressive hints**

Reemplazar pistas genéricas de los ejercicios tocados por tres niveles: concepto, opción/estructura y forma general. El tercer nivel no podrá contener el ejemplo completo ni todos sus valores concretos.

- [ ] **Step 5: Run the full activity tests**

Run: `node html/iso/pruebas/actividades.test.js`

Expected: `92 actividades, 105 pasos, 0 errores`.

- [ ] **Step 6: Commit**

```powershell
git add html/iso/actividades.js html/iso/linux-terminal.html html/iso/pruebas/actividades.test.js
git commit -m "feat: add progressive learning hints"
```

### Task 3: Limpiar y consolidar las actividades

**Files:**
- Modify: `html/iso/actividades.js`, eliminando `antiguasRafa`, `nuevas36a40`, `rebaseadas`, `fusionada55`, `reemplazarPasoRafa` y los ajustes posteriores, y dejando una única lista final declarativa.
- Modify: `html/iso/pruebas/actividades.test.js` para validar la forma final de los datos.

**Interfaces:**
- Consumes: los mismos nombres públicos `window.ACTIVIDADES`, `actividadRafa()` o helpers equivalentes solo si siguen siendo necesarios.
- Produces: una lista final ordenada por `id`, sin mutaciones posteriores ni actividades temporales visibles al cargar el archivo.

- [ ] **Step 1: Write the failing structural test**

Añadir comprobaciones que fallen si aparecen en el archivo las colecciones temporales de migración o si hay IDs duplicados, y mantener las comprobaciones de numeración, ejemplos y mundos.

- [ ] **Step 2: Run the test to verify the baseline fails**

Run: `node html/iso/pruebas/actividades.test.js`

Expected: FAIL en la comprobación de duplicación/colecciones temporales del archivo actual.

- [ ] **Step 3: Replace migration code with one final data set**

Construir una única definición legible de los ejercicios 36–87 a partir del resultado actual, preservando literalmente sus metas, ejemplos, pasos y mundos. Eliminar la lógica de borrar y volver a insertar actividades.

- [ ] **Step 4: Run the complete activity suite**

Run: `node html/iso/pruebas/actividades.test.js`

Expected: `92 actividades, 105 pasos, 0 errores` y ningún cambio en la secuencia de IDs.

- [ ] **Step 5: Run syntax and whitespace checks**

Run: `node --check html/iso/pruebas/actividades.test.js`; extraer el script inline de `linux-terminal.html` y ejecutar `node --check`; ejecutar `git diff --check`.

Expected: todos los comandos terminan con código 0.

- [ ] **Step 6: Commit**

```powershell
git add html/iso/actividades.js html/iso/pruebas/actividades.test.js
git commit -m "refactor: consolidate terminal activity data"
```

### Task 4: Revisión visual y verificación final

**Files:**
- Modify: `html/iso/linux-terminal.html` solo si el feedback necesita ajustes de texto, foco o accesibilidad.
- Test: `html/iso/pruebas/actividades.test.js` y comprobación manual del panel de actividad.

**Interfaces:**
- Consumes: el diagnóstico y las pistas producidas por Tasks 1–3.
- Produces: feedback visible, accesible y consistente tras aciertos, fallos y peticiones de pista.

- [ ] **Step 1: Run the full automated suite**

Run: `node html/iso/pruebas/actividades.test.js`

Expected: `92 actividades, 105 pasos, 0 errores`.

- [ ] **Step 2: Check the browser flows manually**

Probar un ejercicio de `find`, uno de permisos y uno con varios pasos: comando incompleto, comando conceptualmente incorrecto, primera/segunda/tercera pista, acierto y reinicio.

Expected: el alumno recibe una explicación concreta, no ve automáticamente la solución completa y el progreso solo cambia al acertar.

- [ ] **Step 3: Run final verification**

Run: `git diff --check`; `git status --short`; comprobaciones de sintaxis JavaScript.

Expected: sin errores de formato ni sintaxis y solo quedan los cambios de esta tarea.

- [ ] **Step 4: Commit final adjustments**

```powershell
git add html/iso/linux-terminal.html html/iso/actividades.js html/iso/pruebas/actividades.test.js
git commit -m "test: verify terminal learning flow"
```
