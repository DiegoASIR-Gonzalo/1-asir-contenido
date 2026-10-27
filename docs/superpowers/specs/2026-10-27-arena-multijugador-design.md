# Arena multijugador de actividades Linux

## Objetivo

Convertir el modo Duelo en una experiencia multijugador sencilla para estudiar las actividades de Rafa con otras personas. No se usarán variantes automáticas, matchmaking ni preguntas creadas por jugadores.

## Modos

### Carrera

Varias personas entran en una sala y resuelven exactamente la misma secuencia de actividades. La partida comienza con una cuenta atrás común. Cada jugador tiene su propio estado de terminal y progreso, mientras la sala muestra posiciones, ejercicios completados y estado de cada participante. La clasificación premia terminar antes, pero el resultado también registra errores y pistas usadas.

### Práctica compartida

Varias personas comparten una sala y trabajan con la misma secuencia, pero sin ganador ni presión de carrera. Cada jugador avanza a su ritmo. La sala muestra el progreso de los participantes y cada uno recibe su revisión individual.

El antiguo modo de preguntas anónimas se elimina. El modo 1vs1 no será un modo separado: una carrera con dos participantes cubre ese caso.

## Salas

Crear una sala debe añadirla a una lista visible y actualizada en tiempo real. Cada tarjeta muestra modo, creador, bloque de actividades, jugadores conectados, capacidad y estado, con un botón directo para unirse. El código se conserva solo como alternativa para compartir una sala privada.

Estados: `espera`, `cuenta-atras`, `jugando`, `terminada` y `cerrada`.

El creador selecciona modo, bloque o rango de ejercicios y capacidad máxima. Una vez iniciada la cuenta atrás no se admiten nuevos jugadores. Las salas abandonadas o sin actividad se limpian de forma segura.

## Pistas durante el multijugador

Las pistas no se muestran todas al principio ni dependen de que el jugador pulse repetidamente un botón.

- A los 8 segundos se muestra la primera pista del paso.
- Cada 8 segundos se muestra la siguiente pista.
- A los 8 segundos de mostrar la última pista se muestra la solución explicada.
- Si el jugador completa el paso antes, se detienen los temporizadores.
- Si cambia de paso, se reinicia el ciclo.
- La solución no rellena automáticamente el terminal.
- En carrera, el uso de pistas y solución queda registrado y afecta a la puntuación o al tiempo mostrado, pero no bloquea el aprendizaje.
- En práctica, las pistas sirven de ayuda y no generan penalización.

El sistema reutiliza `pistasSeguras()` y las pistas contextuales actuales. Nunca debe mostrar el comando completo como pista. La solución completa solo aparece en el momento definido o mediante una acción explícita equivalente.

## Estado de datos

La sala contiene la configuración compartida y sus participantes. Cada jugador conserva en su propio nodo el progreso, el paso actual, el tiempo de finalización, los fallos y las pistas usadas. El servidor de Firebase marca el inicio común usando su reloj; el cliente no decide el ganador ni puede modificar el progreso de otro jugador.

La migración debe mantener compatibilidad con salas antiguas durante la transición o cerrarlas con un mensaje claro, sin intentar interpretar preguntas anónimas como carreras nuevas.

## Flujo de carrera

1. Se crea una sala pública.
2. La sala aparece en el listado.
3. Los jugadores se unen y se muestran en la sala.
4. El creador inicia cuando hay participantes suficientes.
5. Todos ven la misma cuenta atrás.
6. Cada jugador resuelve las actividades en su propia terminal.
7. El progreso se actualiza en la lista y en la partida.
8. Al terminar todos o finalizar la carrera, se muestra la clasificación.
9. Se ofrece revisar errores, volver a practicar o crear una revancha.

## Flujo de práctica

Comparte los pasos 1 a 6, pero no tiene ganador. La sala permanece activa hasta que todos terminan o el creador la cierra. El resumen individual muestra los conceptos fallados y las pistas utilizadas.

## Interfaz

La pantalla inicial tendrá dos acciones principales: `Crear sala` y `Unirse a una sala`. La lista prioriza salas abiertas y oculta detalles técnicos. En partida se debe ver siempre el ejercicio actual, la terminal, el progreso de participantes y el estado de las pistas. En móvil, la clasificación se pliega sin ocultar el terminal.

Los estados de conexión, espera, cuenta atrás, error y finalización deben ser visibles, accesibles con teclado y no depender solo del color.

## Verificación

- Pruebas del motor para carrera y práctica.
- Pruebas de transición de estados de sala.
- Pruebas de cuenta atrás y temporizadores de pistas.
- Pruebas de desconexión y reconexión.
- Pruebas de que una pista nunca contiene el comando completo.
- Pruebas de que la solución aparece exactamente 8 segundos después de la última pista.
- Pruebas manuales con 2 y 3 navegadores/sesiones.
- Verificación de reglas Firebase para impedir modificar ganador, inicio o progreso ajeno.
