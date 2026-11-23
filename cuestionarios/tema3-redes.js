HubQuiz.registrar({
  id: 'tema3-tcpip',
  titulo: 'Tema 3. Protocolo TCP/IP',
  mezclarOpciones: true,
  feedback: 'inmediato',

  preguntas: [
    {
      q: '¿Qué diferencia principal existe entre TCP y UDP según el tema?',
      opciones: [
        'TCP prioriza el orden y recupera mensajes perdidos; UDP prioriza la velocidad.',
        'TCP prioriza la velocidad y UDP recupera los mensajes perdidos.',
        'TCP solo se utiliza en redes locales y UDP solo en Internet.',
        'TCP y UDP garantizan por igual el orden de los mensajes.'
      ],
      correcta: 0,
      explicacion: 'TCP mantiene el orden y vuelve a pedir los mensajes perdidos. UDP da prioridad a la velocidad y no recupera los paquetes perdidos.'
    },
    {
      q: 'El modelo OSI se organiza en siete niveles o capas.',
      correcta: true,
      explicacion: 'El modelo OSI define siete niveles para describir y estandarizar la comunicación en redes.'
    },
    {
      q: '¿De qué se encarga principalmente el nivel físico?',
      opciones: [
        'De traducir nombres de dominio a direcciones IP.',
        'De definir aspectos del hardware, los cables y las señales de comunicación.',
        'De elegir la ruta entre distintas redes locales.',
        'De identificar las aplicaciones mediante números de puerto.'
      ],
      correcta: 1,
      explicacion: 'El nivel físico recoge las normas relacionadas con la infraestructura y los aspectos mecánicos y eléctricos de la comunicación.'
    },
    {
      q: 'En el nivel de enlace, ¿qué representa el MTU?',
      opciones: [
        'El número de dispositivos que pueden conectarse a un switch.',
        'El tiempo de espera antes de enviar una trama.',
        'El tamaño máximo que puede tener una trama.',
        'El número de saltos que puede atravesar un paquete.'
      ],
      correcta: 2,
      explicacion: 'El MTU indica el tamaño máximo de una trama a nivel de enlace y puede ajustarse en determinados entornos.'
    },
    {
      q: '¿Qué nivel permite la comunicación entre ordenadores situados en redes locales distintas?',
      opciones: [
        'El nivel físico.',
        'El nivel de enlace.',
        'El nivel de aplicación.',
        'El nivel de red.'
      ],
      correcta: 3,
      explicacion: 'El nivel de red permite interconectar redes distintas. Los routers intervienen para dirigir los mensajes hacia su destino.'
    },
    {
      q: '¿Qué caracteriza al enrutamiento estático?',
      opciones: [
        'Un administrador configura manualmente las rutas.',
        'Un algoritmo actualiza automáticamente las rutas según los vecinos.',
        'Cada cliente recibe una dirección IP mediante DHCP.',
        'Todos los mensajes se envían a la dirección de difusión.'
      ],
      correcta: 0,
      explicacion: 'En el enrutamiento estático las tablas se configuran manualmente; en el dinámico, un algoritmo determina las rutas.'
    },
    {
      q: 'En una dirección de difusión (broadcast), todos los bits correspondientes al host están a 0.',
      correcta: false,
      explicacion: 'En una dirección de difusión todos los bits de host están a 1. Los bits de host a 0 identifican la dirección de red.'
    },
    {
      q: '¿Cuántos bits tiene una dirección IPv4?',
      correcta: ['32', '32 bits'],
      explicacion: 'IPv4 utiliza direcciones de 32 bits.'
    },
    {
      q: '¿En qué orden se intercambian los cuatro mensajes del proceso DHCP?',
      opciones: [
        'DISCOVER → REQUEST → OFFER → ACK',
        'DISCOVER → OFFER → REQUEST → ACK',
        'OFFER → DISCOVER → ACK → REQUEST',
        'REQUEST → OFFER → DISCOVER → ACK'
      ],
      correcta: 1,
      explicacion: 'El cliente envía DISCOVER, el servidor responde OFFER, el cliente solicita la configuración con REQUEST y el servidor la confirma con ACK.'
    },
    {
      q: 'Según el PDF, ¿qué sucede si un equipo no recibe configuración IP de un servidor DHCP y utiliza APIPA?',
      opciones: [
        'Obtiene automáticamente una dirección IP pública del proveedor.',
        'Emplea DNS para elegir una dirección IP disponible.',
        'Busca una IP libre en la red local, pero no puede salir a Internet con esa configuración.',
        'Deja de utilizar la tarjeta de red hasta que vuelva el DHCP.'
      ],
      correcta: 2,
      explicacion: 'APIPA permite obtener una dirección automática tras comprobar que está libre, pero el material señala que esa configuración no permite salir a Internet.'
    },
    {
      q: 'Selecciona todas las direcciones que pertenecen a rangos de IP privadas indicados en el tema.',
      opciones: ['10.1.2.3', '172.20.5.10', '192.168.1.25', '8.8.8.8'],
      correcta: [0, 1, 2],
      explicacion: 'Los rangos privados indicados son 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255 y 192.168.0.0–192.168.255.255. La dirección 8.8.8.8 no pertenece a ellos.'
    },
    {
      q: '¿Qué puerto de destino utiliza normalmente SSH?',
      opciones: ['21', '22', '53', '443'],
      correcta: 1,
      explicacion: 'Según la tabla de puertos del nivel de transporte, SSH utiliza el puerto 22.'
    },
    {
      q: '¿Para qué se utiliza un mensaje ARP Request dentro de una red local?',
      opciones: [
        'Para averiguar qué dirección MAC corresponde a una dirección IP.',
        'Para asignar automáticamente una puerta de enlace mediante DHCP.',
        'Para traducir el nombre de una página web a su IP pública.',
        'Para comprobar la conectividad mediante Echo Reply.'
      ],
      correcta: 0,
      explicacion: 'ARP Request pregunta por la dirección MAC asociada a una IP. El equipo correspondiente puede responder con ARP Reply.'
    },
    {
      q: 'Selecciona todas las asociaciones correctas entre protocolo y función.',
      opciones: [
        'DNS: traducir nombres de páginas web a direcciones IP.',
        'ICMP: comprobar la conectividad mediante mensajes Echo Request y Echo Reply.',
        'DNS: cambiar la IP de origen de las peticiones salientes.',
        'ICMP: asignar direcciones IP automáticamente a los clientes.'
      ],
      correcta: [0, 1],
      explicacion: 'DNS resuelve nombres en direcciones IP. ICMP utiliza mensajes como Echo Request y Echo Reply, empleados por ping. Cambiar la IP de origen corresponde a SNAT y asignar configuraciones IP, a DHCP.'
    },
    {
      q: '¿Cuál es la diferencia entre SNAT y DNAT?',
      opciones: [
        'SNAT modifica el puerto de origen y DNAT modifica el puerto de destino.',
        'SNAT cambia la IP de destino y DNAT cambia la IP de origen.',
        'Ambos cambian únicamente la dirección MAC de origen.',
        'SNAT cambia la IP de origen y DNAT cambia la IP de destino.'
      ],
      correcta: 3,
      explicacion: 'SNAT sustituye la dirección IP de origen, normalmente por la IP de salida del router; DNAT sustituye la IP de destino, por ejemplo por la IP privada de un servidor.'
    }
  ]
});
