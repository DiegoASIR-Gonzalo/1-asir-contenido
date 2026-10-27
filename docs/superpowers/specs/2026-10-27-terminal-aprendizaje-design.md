# Diseño: modo de aprendizaje para los ejercicios de terminal

## Objetivo

Convertir los ejercicios de terminal en una herramienta para estudiar: el alumno debe recibir una explicación útil de su error, avanzar con pistas progresivas y resolver el ejercicio sin necesitar ver el comando completo.

El comportamiento debe conservar las actividades actuales, sus numeraciones, mundos virtuales y ejemplos válidos. La mejora no añade ejercicios.

## Límites

- Mantener las 92 actividades y 105 pasos existentes.
- No aceptar comandos incompletos ni opciones desconocidas como soluciones válidas.
- No revelar automáticamente el comando completo de solución.
- No duplicar un caso de error por cada ejercicio.
- Mantener el simulador sin dependencias nuevas ni backend.

## Diseño de datos

`html/iso/actividades.js` quedará como una definición declarativa de actividades. Cada paso conservará `tarea`, `meta`, `ejemplo`, `explica` y `pista`, pero se eliminarán las listas temporales y las reconstrucciones duplicadas que hoy conservan actividades antiguas para volver a numerarlas.

Los ejercicios que necesiten comprobar el concepto aprendido podrán declarar opcionalmente:

```js
aprendizaje: {
  comando: 'find',
  opciones: ['-type'],
  valores: ['d'],
  pistas: [
    'Revisa el filtro que distingue ficheros y directorios.',
    'La opción que necesitas es -type.',
    'El tipo de directorio se representa con d.'
  ]
}
```

La mayoría de los pasos no necesitará este bloque: el diagnóstico se construirá a partir de `meta` y del error del intérprete.

## Diagnóstico

El flujo de validación será:

1. Ejecutar el comando sobre una copia del estado.
2. Si hay error de sintaxis o de ejecución, mostrar el mensaje específico del comando.
3. Si el comando se ejecuta pero no alcanza la meta, devolver el primer requisito que falta: ruta actual, entradas que faltan, entradas que sobran, permisos, contenido u salida.
4. Si el paso declara `aprendizaje`, comprobar que se ha usado el comando y las opciones/conceptos requeridos.
5. No modificar el estado cuando el paso falla.

Los diagnósticos se representarán como texto corto y claro para la terminal y como una ayuda accesible en el panel de actividad.

## Pistas progresivas

Las pistas se mostrarán en tres niveles, siempre sin el comando completo:

- Nivel 1: concepto que debe revisar.
- Nivel 2: opción, ruta o estructura relevante.
- Nivel 3: forma general del comando, sin valores concretos de la solución.

Después de un fallo se mostrará el diagnóstico; las pistas solo aparecerán cuando el alumno las solicite o según el número de intentos configurado. El botón de solución completa dejará de ser el camino principal del aprendizaje.

## Limpieza de actividades

Se conservará una única fuente de verdad para cada ejercicio. Se eliminarán:

- `antiguasRafa` y las transformaciones de renumeración.
- reconstrucciones de actividades ya existentes.
- ajustes finales que sobrescriben pasos definidos anteriormente.
- helpers que solo servían para migrar datos antiguos.

Los mundos iniciales, metas y ejemplos resultantes se mantendrán explícitos y legibles. Si el archivo sigue siendo demasiado grande tras la limpieza, se separarán los datos por bloques en archivos JS cargados en orden, sin introducir un sistema de build.

## Verificación

Se ampliará `html/iso/pruebas/actividades.test.js` para comprobar:

- todos los ejemplos siguen superando su paso;
- ningún fallo modifica el estado;
- opciones incompletas devuelven error;
- los requisitos de aprendizaje se cumplen;
- las pistas no contienen el comando completo de solución;
- siguen existiendo 92 actividades y 105 pasos.

También se ejecutarán `node --check`, la suite de actividades y `git diff --check`.

## Criterio de éxito

Un alumno que escriba un comando incompleto o conceptualmente incorrecto recibe una indicación concreta de qué revisar, puede pedir una pista progresiva y puede completar cada ejercicio sin abrir la solución completa. Los ejercicios actuales siguen funcionando y el código de datos queda sin duplicaciones de migración.
