HubQuiz.registrar({
  id: 'hw-binario',
  titulo: 'Binario y hexadecimal',
  mezclarOpciones: true,
  feedback: 'inmediato',

  preguntas: [
    {
      q: '¿Cuántos valores distintos se pueden representar con un byte (8 bits)?',
      opciones: ['8', '16', '128', '256'],
      correcta: 3,
      explicacion: '2⁸ = 256 valores, del 0 al 255.'
    },
    {
      q: '¿Qué número decimal es `1010` en binario?',
      opciones: ['8', '10', '12', '20'],
      correcta: 1,
      explicacion: '8 + 0 + 2 + 0 = 10.'
    },
    {
      q: 'En hexadecimal, la letra `F` equivale a 15 en decimal.',
      correcta: true,
      explicacion: 'Los dígitos hexadecimales van de 0 a 9 y de A (10) a F (15).'
    },
    {
      q: 'Selecciona los números que son potencias de 2.',
      opciones: ['16', '24', '64', '100'],
      correcta: [0, 2],
      explicacion: '16 = 2⁴ y 64 = 2⁶. El 24 y el 100 no lo son.'
    },
    {
      q: '¿Cuál es el valor decimal de `11111111`?',
      correcta: ['255'],
      explicacion: '128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.'
    },
    {
      q: '¿Cómo se escribe el número 255 en hexadecimal?',
      correcta: ['FF', '0xFF'],
      explicacion: '255 = 15·16 + 15, es decir, `FF`.'
    }
  ]
});
