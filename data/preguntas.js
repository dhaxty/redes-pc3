// Banco de preguntas teóricas para Repaso PC3 - UTP
// Semanas 11 a 15: Transporte, Direccionamiento IPv6, Aplicación, Servicios y VLANs/Seguridad

const PREGUNTAS_DATA = [
  // SEMANA 11: Transporte, TCP, UDP, Puertos, Sockets, Wireshark
  {
    id: "s11-p01",
    semana: 11,
    tema: "Capa de Transporte",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es la función principal de la multiplexación en la capa de transporte?",
    opciones: [
      "Permitir que múltiples aplicaciones utilicen simultáneamente la red a través de números de puerto",
      "Dividir físicamente un cable de red en varios canales de fibra",
      "Asignar direcciones MAC dinámicas a los paquetes IP",
      "Convertir señales digitales en señales analógicas para modems"
    ],
    respuesta: 0,
    explicacion: "La multiplexación permite intercalar flujos de datos de diferentes aplicaciones que se ejecutan en el host de origen hacia un mismo medio físico, identificando cada sesión con puertos únicos."
  },
  {
    id: "s11-p02",
    semana: 11,
    tema: "Sockets",
    tipo: "opcion_multiple",
    enunciado: "¿Cómo se define un socket de red según el material del curso?",
    opciones: [
      "La combinación de una dirección IP (origen o destino) y un número de puerto (origen o destino)",
      "Un conector físico RJ-45 hembra instalado en el switch de capa 2",
      "El identificador hexadecimal de 48 bits de una tarjeta de red",
      "El tiempo de vida que permanece activo un proceso de servidor"
    ],
    respuesta: 0,
    explicacion: "Un socket se define como la combinación de la dirección IP de origen o destino y el respectivo número de puerto (por ejemplo: 192.168.1.5:1099)."
  },
  {
    id: "s11-p03",
    semana: 11,
    tema: "Puertos Bien Conocidos",
    tipo: "relacionar",
    enunciado: "Relacione cada protocolo con su respectivo puerto de transporte bien conocido:",
    pares: [
      { premisa: "FTP Control", respuesta: "TCP 21" },
      { premisa: "SSH", respuesta: "TCP 22" },
      { premisa: "Telnet", respuesta: "TCP 23" },
      { premisa: "SMTP", respuesta: "TCP 25" },
      { premisa: "DNS", respuesta: "UDP/TCP 53" },
      { premisa: "TFTP", respuesta: "UDP 69" }
    ],
    explicacion: "Los puertos bien conocidos van del 0 al 1023. FTP Control usa TCP 21, SSH TCP 22, Telnet TCP 23, SMTP TCP 25, DNS UDP/TCP 53 y TFTP UDP 69."
  },
  {
    id: "s11-p04",
    semana: 11,
    tema: "Puertos Bien Conocidos",
    tipo: "opcion_multiple",
    enunciado: "¿Cuáles son los puertos UDP utilizados por el protocolo DHCP para el servidor y el cliente respectivamente?",
    opciones: [
      "Servidor: UDP 67 / Cliente: UDP 68",
      "Servidor: UDP 68 / Cliente: UDP 67",
      "Servidor: TCP 67 / Cliente: TCP 68",
      "Servidor: UDP 20 / Cliente: UDP 21"
    ],
    respuesta: 0,
    explicacion: "En DHCPv4, el servidor escucha peticiones en el puerto UDP 67, mientras que los clientes reciben respuestas en el puerto UDP 68."
  },
  {
    id: "s11-p05",
    semana: 11,
    tema: "Three-Way Handshake",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es la secuencia correcta de los tres pasos en el establecimiento de conexión TCP (Three-Way Handshake)?",
    opciones: [
      "1: SYN (cliente a servidor) -> 2: SYN, ACK (servidor a cliente) -> 3: ACK (cliente a servidor)",
      "1: ACK -> 2: SYN -> 3: FIN",
      "1: SYN -> 2: ACK -> 3: FIN",
      "1: CONNECT -> 2: ACCEPT -> 3: ESTABLISHED"
    ],
    respuesta: 0,
    explicacion: "El handshake de 3 vías de TCP inicia con el cliente enviando SYN, el servidor responde con SYN y ACK confirmando la sesión, y finalmente el cliente confirma con ACK."
  },
  {
    id: "s11-p06",
    semana: 11,
    tema: "Cierre de Conexión TCP",
    tipo: "verdadero_falso",
    enunciado: "El cierre normal de una conexión TCP se realiza en 4 pasos mediante el intercambio de segmentos FIN y ACK entre ambos extremos.",
    opciones: ["Verdadero", "Falso"],
    respuesta: 0,
    explicacion: "Verdadero. Debido a que TCP es dúplex completo (full-duplex), cada extremo debe cerrar independientemente su sentido de transmisión enviando FIN y recibiendo ACK (Four-Way Handshake)."
  },
  {
    id: "s11-p07",
    semana: 11,
    tema: "Servicios TCP",
    tipo: "verdadero_falso",
    enunciado: "Un servidor individual puede asignar dos servicios diferentes al mismo número de puerto dentro del mismo protocolo de capa de transporte (TCP).",
    opciones: ["Verdadero", "Falso"],
    respuesta: 1,
    explicacion: "Falso. En una máquina servidor, no pueden existir dos servicios o aplicaciones simultáneas escuchando en el mismo número de puerto bajo el mismo protocolo de transporte (ej. dos servidores web en TCP 80 sin IP binding diferente)."
  },
  {
    id: "s11-p08",
    semana: 11,
    tema: "Comandos CLI",
    tipo: "completar",
    enunciado: "Para visualizar en la consola de comandos las conexiones TCP activas y los puertos abiertos en el host se utiliza el comando: _________",
    respuestasValidas: ["netstat", "netstat -a", "netstat -an"],
    explicacion: "El comando `netstat` (Network Statistics) lista las conexiones TCP/UDP activas, sus direcciones locales, foráneas y su estado actual."
  },
  {
    id: "s11-p09",
    semana: 11,
    tema: "Wireshark",
    tipo: "opcion_multiple",
    enunciado: "En Wireshark, ¿para qué se habilita el 'Modo Promiscuo' en las interfaces de captura?",
    opciones: [
      "Para capturar todo el tráfico que circula por el medio físico, sin descartar los paquetes dirigidos a otras direcciones MAC",
      "Para encriptar las contraseñas que viajan en el segmento TCP",
      "Para acelerar la velocidad de transferencia de la tarjeta Ethernet",
      "Para simular un ataque de denegación de servicio a los routers vecinos"
    ],
    respuesta: 0,
    explicacion: "El modo promiscuo desactiva el filtrado por MAC de la tarjeta de red, permitiendo que la aplicación de captura lea todas las tramas que circulan por el segmento de red."
  },
  {
    id: "s11-p10",
    semana: 11,
    tema: "Cabeceras de Red",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es el tamaño mínimo estándar en bytes de la cabecera IPv4 y de la cabecera TCP respectivamente?",
    opciones: [
      "IPv4: 20 bytes / TCP: 20 bytes",
      "IPv4: 14 bytes / TCP: 8 bytes",
      "IPv4: 32 bytes / TCP: 16 bytes",
      "IPv4: 64 bytes / TCP: 128 bytes"
    ],
    respuesta: 0,
    explicacion: "Tanto la cabecera estándar de IPv4 como la de TCP tienen un tamaño mínimo de 20 bytes (sin campos opcionales). La cabecera UDP mide 8 bytes y la Ethernet II mide 14 bytes."
  },
  {
    id: "s11-p11",
    semana: 11,
    tema: "TCP Flags",
    tipo: "opcion_multiple",
    enunciado: "¿Qué indicador (flag) en la cabecera TCP solicita de manera urgente que el receptor entregue los datos a la aplicación inmediatamente sin esperar a llenar el búfer?",
    opciones: [
      "PSH (Push)",
      "FIN (Finish)",
      "SYN (Synchronize)",
      "RST (Reset)"
    ],
    respuesta: 0,
    explicacion: "El bit PSH (Push) instruye a la pila receptora para que envíe inmediatamente los datos almacenados a la capa de aplicación sin demoras de búfer."
  },
  {
    id: "s11-p12",
    semana: 11,
    tema: "Control de Flujo TCP",
    tipo: "opcion_multiple",
    enunciado: "Si un cliente envía un mensaje de 1550 bytes a través de una conexión con MSS de 1460 bytes, ¿cómo se segmentan los datos?",
    opciones: [
      "En dos segmentos: el primero de 1460 bytes y el segundo de 90 bytes",
      "En un solo segmento de 1550 bytes con trama Jumbo",
      "En tres segmentos iguales de 516.6 bytes",
      "El paquete se descarta por exceder el MTU permitido"
    ],
    respuesta: 0,
    explicacion: "El MSS (Maximum Segment Size) define la cantidad máxima de datos en el payload TCP. 1550 bytes se dividen en un primer segmento de 1460 bytes y un segundo segmento con los 90 bytes restantes."
  },
  {
    id: "s11-p13",
    semana: 11,
    tema: "Puertos de Correo",
    tipo: "opcion_multiple",
    enunciado: "¿Qué puertos TCP corresponden a los protocolos POP3 e IMAP para recuperación de correo electrónico?",
    opciones: [
      "POP3: TCP 110 / IMAP: TCP 143",
      "POP3: TCP 25 / IMAP: TCP 110",
      "POP3: UDP 69 / IMAP: TCP 80",
      "POP3: TCP 443 / IMAP: TCP 22"
    ],
    respuesta: 0,
    explicacion: "POP3 opera en el puerto TCP 110 e IMAP opera en el puerto TCP 143. Ambos se utilizan para consultar o descargar mensajes de los servidores de correo."
  },

  // SEMANA 12: Subneteo IPv6, ICMPv6, NDP, EIGRP
  {
    id: "s12-p01",
    semana: 12,
    tema: "Estructura IPv6",
    tipo: "opcion_multiple",
    enunciado: "En una dirección IPv6 Global Unicast (GUA) con prefijo de enrutamiento global /48 asignado por un ISP, ¿cuántos bits quedan disponibles para el ID de Subred si la interfaz usa /64?",
    opciones: [
      "16 bits",
      "32 bits",
      "8 bits",
      "64 bits"
    ],
    respuesta: 0,
    explicacion: "En la estructura clásica /48 global con /64 de LAN, los bits del 49 al 64 (16 bits, es decir 1 hexteto completo) corresponden al ID de Subred (Subnet ID)."
  },
  {
    id: "s12-p02",
    semana: 12,
    tema: "Subredes IPv6",
    tipo: "opcion_multiple",
    enunciado: "¿Cuántas subredes con prefijo /64 permite crear un ID de subred de 16 bits en una red IPv6?",
    opciones: [
      "65,536 subredes (2^16)",
      "256 subredes",
      "4,096 subredes",
      "16,384 subredes"
    ],
    respuesta: 0,
    explicacion: "Con 16 bits asignados a subred ($2^{16}$), una empresa puede desplegar exactamente 65,536 subredes /64 independientes."
  },
  {
    id: "s12-p03",
    semana: 12,
    tema: "Direccionamiento IPv6",
    tipo: "opcion_multiple",
    enunciado: "Dada la dirección IPv6 2016:ABC:10::/80, ¿cuántos bits corresponden a la Identificación de Interfaz (Interface ID)?",
    opciones: [
      "48 bits (128 - 80)",
      "80 bits",
      "64 bits",
      "32 bits"
    ],
    respuesta: 0,
    explicacion: "Una dirección IPv6 completa tiene 128 bits. Si el prefijo es /80, los bits restantes para la interfaz son $128 - 80 = 48$ bits."
  },
  {
    id: "s12-p04",
    semana: 12,
    tema: "ICMPv4 vs ICMPv6",
    tipo: "relacionar",
    enunciado: "Relacione los códigos de 'Destino Inalcanzable' de ICMPv4 con su significado:",
    pares: [
      { premisa: "Código 0", respuesta: "Red inalcanzable" },
      { premisa: "Código 1", respuesta: "Host inalcanzable" },
      { premisa: "Código 2", respuesta: "Protocolo inalcanzable" },
      { premisa: "Código 3", respuesta: "Puerto inalcanzable" }
    ],
    explicacion: "En ICMPv4, tipo 3 (Destination Unreachable) utiliza: 0=red inalcanzable, 1=host inalcanzable, 2=protocolo inalcanzable y 3=puerto inalcanzable."
  },
  {
    id: "s12-p05",
    semana: 12,
    tema: "ICMPv6",
    tipo: "opcion_multiple",
    enunciado: "¿Qué campo de la cabecera IPv6 se decrementa en cada salto de router y genera un mensaje ICMPv6 de Tiempo Excedido al llegar a 0?",
    opciones: [
      "Límite de Saltos (Hop Limit)",
      "Tiempo de Vida (TTL)",
      "Etiqueta de Flujo (Flow Label)",
      "Siguiente Cabecera (Next Header)"
    ],
    respuesta: 0,
    explicacion: "En IPv4 se llamaba TTL (Time-To-Live). En la cabecera IPv6 se denomina 'Hop Limit' (Límite de Saltos) y cumple la misma función para evitar bucles infinitos."
  },
  {
    id: "s12-p06",
    semana: 12,
    tema: "Protocolo NDP",
    tipo: "opcion_multiple",
    enunciado: "¿Con qué frecuencia por defecto los routers habilitados para IPv6 envían mensajes Router Advertisement (RA) a los hosts?",
    opciones: [
      "Cada 200 segundos",
      "Cada 30 segundos",
      "Cada 5 minutos",
      "Cada 60 segundos"
    ],
    respuesta: 0,
    explicacion: "Según los materiales del curso UTP, los routers envían mensajes de anuncio de router (RA) periódicamente cada 200 segundos o en respuesta inmediata a un mensaje RS."
  },
  {
    id: "s12-p07",
    semana: 12,
    tema: "Protocolo NDP",
    tipo: "opcion_multiple",
    enunciado: "¿Qué dos funciones principales cumple el mensaje Neighbor Solicitation (NS) en IPv6?",
    opciones: [
      "Resolución de direcciones MAC (reemplazo de ARP) y Detección de Direcciones Duplicadas (DAD)",
      "Configuración de dominios VTP y asignación de contraseñas de consola",
      "Control de congestión TCP y fragmentación de tramas de capa física",
      "Asignación de puertos bien conocidos a los servidores HTTP"
    ],
    respuesta: 0,
    explicacion: "NS (Neighbor Solicitation) consulta la dirección MAC del vecino (reemplazando el ARP Request de IPv4) y verifica que una dirección IP tentativa no esté duplicada (DAD)."
  },
  {
    id: "s12-p08",
    semana: 12,
    tema: "Métodos de Asignación IPv6",
    tipo: "opcion_multiple",
    enunciado: "¿Qué método de autoconfiguración IPv6 permite a un host generar su propia dirección GUA a partir del prefijo recibido en el RA sin consultar a un servidor DHCPv6?",
    opciones: [
      "SLAAC (Stateless Address Autoconfiguration)",
      "DHCPv6 Stateful",
      "BOOTP dinámico",
      "Proxy ARP"
    ],
    respuesta: 0,
    explicacion: "SLAAC permite que el host reciba el prefijo de red (/64) desde el Router Advertisement y genere sus propios 64 bits de ID de interfaz mediante EUI-64 o aleatorio."
  },
  {
    id: "s12-p09",
    semana: 12,
    tema: "Gateway IPv6",
    tipo: "opcion_multiple",
    enunciado: "Cuando un host configura su IPv6 mediante SLAAC, ¿cuál es la dirección de puerta de enlace predeterminada (default gateway) que adopta?",
    opciones: [
      "La dirección Link-Local (fe80::) del router que envió el mensaje RA",
      "La primera dirección IP útil de la subred /64 del servidor DNS",
      "La dirección loopback ::1 del cliente local",
      "La dirección multicast FF02::1"
    ],
    respuesta: 0,
    explicacion: "En IPv6, los clientes utilizan siempre como Default Gateway la dirección de enlace local (Link-Local Address - LLA, fe80::x) de la interfaz del router en su segmento."
  },
  {
    id: "s12-p10",
    semana: 12,
    tema: "Comandos Cisco IPv6",
    tipo: "completar",
    enunciado: "Para habilitar el reenvío y enrutamiento de paquetes IPv6 en un router Cisco se debe ejecutar en modo de configuración global el comando: _________",
    respuestasValidas: ["ipv6 unicast-routing"],
    explicacion: "Por defecto, los routers Cisco tienen deshabilitado el enrutamiento IPv6; el comando obligatorio para activarlo es `ipv6 unicast-routing`."
  },
  {
    id: "s12-p11",
    semana: 12,
    tema: "Comandos Cisco IPv6",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es el comando correcto para asignar la dirección link-local fe80::1 a una interfaz en un router Cisco?",
    opciones: [
      "ipv6 address fe80::1 link-local",
      "ip address fe80::1 link-local",
      "ipv6 link-local fe80::1 enable",
      "ipv6 route fe80::1 /64 local"
    ],
    respuesta: 0,
    explicacion: "El comando de interfaz es `ipv6 address <direccion> link-local`."
  },
  {
    id: "s12-p12",
    semana: 12,
    tema: "Enrutamiento Dinámico EIGRP",
    tipo: "opcion_multiple",
    enunciado: "En la tabla de enrutamiento de Cisco (`show ip route`), ¿con qué letra se identifican las rutas aprendidas mediante el protocolo dinámico EIGRP y cuál es su distancia administrativa interna?",
    opciones: [
      "Letra D / Distancia administrativa: 90",
      "Letra E / Distancia administrativa: 110",
      "Letra O / Distancia administrativa: 110",
      "Letra R / Distancia administrativa: 120"
    ],
    respuesta: 0,
    explicacion: "EIGRP utiliza el algoritmo DUAL y por ello se identifica en la tabla de rutas con la letra **D**. Su distancia administrativa interna es 90."
  },
  {
    id: "s12-p13",
    semana: 12,
    tema: "Configuración EIGRP",
    tipo: "opcion_multiple",
    enunciado: "Al configurar `router eigrp 1` en Cisco, ¿cómo se publica la red 10.1.1.0 con máscara 255.255.255.252 (/30)?",
    opciones: [
      "network 10.1.1.0 0.0.0.3",
      "network 10.1.1.0 255.255.255.252",
      "network 10.1.1.0 /30",
      "ip eigrp route 10.1.1.0 0.0.0.3"
    ],
    respuesta: 0,
    explicacion: "En Cisco IOS, el comando network de EIGRP requiere la máscara wildcard inversa: 255.255.255.255 - 255.255.255.252 = 0.0.0.3."
  },

  // SEMANA 13: Aplicación, Presentación, Sesión, DNS, HTTP, DHCPv6 Stateless
  {
    id: "s13-p01",
    semana: 13,
    tema: "Modelos OSI y TCP/IP",
    tipo: "opcion_multiple",
    enunciado: "¿Qué capas del modelo OSI de 7 niveles se consolidan en la capa de Aplicación del modelo TCP/IP?",
    opciones: [
      "Aplicación, Presentación y Sesión",
      "Transporte, Red y Enlace de datos",
      "Física, Enlace de datos y Red",
      "Sesión, Transporte y Red"
    ],
    respuesta: 0,
    explicacion: "Las tres capas superiores de OSI (7: Aplicación, 6: Presentación y 5: Sesión) están combinadas en la única Capa de Aplicación de la arquitectura TCP/IP."
  },
  {
    id: "s13-p02",
    semana: 13,
    tema: "Capa de Presentación",
    tipo: "relacionar",
    enunciado: "Relacione las tres funciones de la Capa de Presentación con su objetivo:",
    pares: [
      { premisa: "Formateo / Presentación", respuesta: "Compatibilidad de datos entre origen y destino" },
      { premisa: "Compresión", respuesta: "Reducir tamaño de datos para optimizar ancho de banda" },
      { premisa: "Cifrado", respuesta: "Garantizar confidencialidad y descifrar al recibir" }
    ],
    explicacion: "La Capa de Presentación tiene 3 funciones principales: dar formato/presentación compatible a los datos, comprimir los datos y cifrarlos/descifrarlos."
  },
  {
    id: "s13-p03",
    semana: 13,
    tema: "Capa de Sesión",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es la función fundamental de la Capa de Sesión?",
    opciones: [
      "Crear, mantener y reiniciar diálogos entre las aplicaciones de origen y destino",
      "Asignar la ruta óptima a través de routers vecinos",
      "Fragmentar los paquetes IP según el MTU físico",
      "Convertir bits en voltajes para el cable de cobre"
    ],
    respuesta: 0,
    explicacion: "La capa de sesión maneja el intercambio de información para iniciar los diálogos, mantenerlos activos y reiniciar sesiones caídas o inactivas."
  },
  {
    id: "s13-p04",
    semana: 13,
    tema: "Redes P2P",
    tipo: "verdadero_falso",
    enunciado: "En una red Punto a Punto (P2P), todo terminal conectado puede funcionar simultáneamente como cliente y como servidor dependiendo de la transacción.",
    opciones: ["Verdadero", "Falso"],
    respuesta: 0,
    explicacion: "Verdadero. En redes P2P no existe un servidor central dedicado; las funciones de cliente o servidor se asignan dinámicamente por solicitud entre pares."
  },
  {
    id: "s13-p05",
    semana: 13,
    tema: "Aplicaciones P2P",
    tipo: "opcion_multiple",
    enunciado: "¿Cuáles de los siguientes son ejemplos de redes y aplicaciones P2P mencionados en el material de clase?",
    opciones: [
      "BitTorrent, eDonkey y Freenet",
      "Telnet, SSH y FTP",
      "BGP, OSPF y EIGRP",
      "SNMP, Syslog y NTP"
    ],
    respuesta: 0,
    explicacion: "Las diapositivas UTP de la Semana 13 listan explícitamente BitTorrent, Conexión directa, eDonkey y Freenet como redes P2P."
  },
  {
    id: "s13-p06",
    semana: 13,
    tema: "Protocolo DNS",
    tipo: "opcion_multiple",
    enunciado: "¿Qué función cumple el protocolo DNS y en qué puertos opera?",
    opciones: [
      "Traduce nombres de dominio (como cisco.com) a direcciones IP, usando el puerto 53 en UDP y TCP",
      "Asigna IPs dinámicas mediante broadcast en el puerto UDP 67",
      "Descarga archivos multimedia en el puerto TCP 80",
      "Envía correos electrónicos utilizando el puerto TCP 25"
    ],
    respuesta: 0,
    explicacion: "DNS (Domain Name System) resuelve nombres a direcciones IP operando en el puerto 53 (UDP para consultas comunes de clientes, TCP para respuestas extensas o transferencias de zona)."
  },
  {
    id: "s13-p07",
    semana: 13,
    tema: "Protocolo HTTP",
    tipo: "opcion_multiple",
    enunciado: "¿Qué protocolo de capa de transporte y qué número de puerto utiliza por defecto el protocolo HTTP?",
    opciones: [
      "TCP en el puerto 80",
      "UDP en el puerto 80",
      "TCP en el puerto 21",
      "UDP en el puerto 53"
    ],
    respuesta: 0,
    explicacion: "HTTP (HyperText Transfer Protocol) utiliza TCP en el puerto 80 (y alternativamente el 8080)."
  },
  {
    id: "s13-p08",
    semana: 13,
    tema: "DHCPv6 Stateless Cisco",
    tipo: "opcion_multiple",
    enunciado: "En un router Cisco, ¿qué comando en la interfaz GigabitEthernet activa la bandera que indica a los clientes SLAAC que consulten a un servidor DHCPv6 para obtener opciones de red adicionales (como el DNS)?",
    opciones: [
      "ipv6 nd other-config-flag",
      "ipv6 nd managed-config-flag",
      "ipv6 dhcp stateless enable",
      "ipv6 flag slaac active"
    ],
    respuesta: 0,
    explicacion: "El comando `ipv6 nd other-config-flag` configura la bandera 'O' (Other Information) en los anuncios RA, instruyendo al cliente a usar SLAAC para la IP y DHCPv6 para otra información como el DNS."
  },
  {
    id: "s13-p09",
    semana: 13,
    tema: "DHCPv6 Cisco",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es la sintaxis correcta para asociar el pool de DHCPv6 llamado 'CISCO' a una interfaz en un router Cisco?",
    opciones: [
      "ipv6 dhcp server CISCO",
      "ip dhcp pool CISCO",
      "service dhcpv6 CISCO",
      "ipv6 helper-address CISCO"
    ],
    respuesta: 0,
    explicacion: "En modo de interfaz (`config-if`), se vincula el pool de DHCPv6 mediante el comando `ipv6 dhcp server <nombre_pool>`."
  },
  {
    id: "s13-p10",
    semana: 13,
    tema: "DHCPv6 Cisco",
    tipo: "completar",
    enunciado: "Para definir dentro de un pool DHCPv6 en Cisco la IP del servidor DNS 2001:DB8:ACAD:1::10, el comando dentro de `(config-dhcpv6)#` es: _________",
    respuestasValidas: [
      "dns-server 2001:DB8:ACAD:1::10",
      "dns-server 2001:db8:acad:1::10"
    ],
    explicacion: "El comando dentro del submodo del pool DHCPv6 es `dns-server <direccion-IPv6>`."
  },
  {
    id: "s13-p11",
    semana: 13,
    tema: "Diagnóstico",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es el comando utilizado en el CLI de un router Cisco para rastrear la ruta salto a salto hacia una dirección IP de destino?",
    opciones: [
      "traceroute",
      "tracert",
      "route print",
      "show hops"
    ],
    respuesta: 0,
    explicacion: "En los equipos Cisco IOS el comando completo es `traceroute <ip>`. En el sistema operativo Windows se utiliza la versión abreviada `tracert <ip>`."
  },

  // SEMANA 14: DHCP, FTP, SMB, Correo (SMTP, POP, IMAP), Rutas Estáticas
  {
    id: "s14-p01",
    semana: 14,
    tema: "Proceso DHCPv4",
    tipo: "opcion_multiple",
    enunciado: "¿Qué significa el acrónimo DORA en el proceso de concesión de direcciones IPv4 por DHCP?",
    opciones: [
      "Discover, Offer, Request, Acknowledgment",
      "Domain, Option, Route, Address",
      "Deliver, Open, Receive, Accept",
      "Dynamic, Online, Reliable, Allocation"
    ],
    respuesta: 0,
    explicacion: "El proceso DHCPv4 de 4 pasos es: 1. DHCPDISCOVER (cliente busca server), 2. DHCPOFFER (servidor ofrece IP), 3. DHCPREQUEST (cliente solicita la IP), 4. DHCPACK (servidor confirma la concesión)."
  },
  {
    id: "s14-p02",
    semana: 14,
    tema: "Mensajes DHCP",
    tipo: "opcion_multiple",
    enunciado: "¿Qué mensaje envía un servidor DHCP si la oferta que intentó tomar el cliente ya no es válida o la IP está en uso por otro dispositivo?",
    opciones: [
      "DHCPNAK (Negative Acknowledgment)",
      "DHCPDECLINE",
      "DHCPRELEASE",
      "DHCPFAIL"
    ],
    respuesta: 0,
    explicacion: "Si la concesión ya no es válida o expira, el servidor responde con DHCPNAK y el cliente debe reiniciar el proceso emitiendo un nuevo DHCPDISCOVER."
  },
  {
    id: "s14-p03",
    semana: 14,
    tema: "DHCPv6 Mensajes",
    tipo: "relacionar",
    enunciado: "Relacione los mensajes de DHCPv4 con su equivalente funcional en DHCPv6:",
    pares: [
      { premisa: "DHCPDISCOVER", respuesta: "SOLICIT" },
      { premisa: "DHCPOFFER", respuesta: "ADVERTISE" },
      { premisa: "DHCPREQUEST", respuesta: "INFORMATION REQUEST / REQUEST" },
      { premisa: "DHCPACK", respuesta: "REPLY" }
    ],
    explicacion: "En DHCPv6 los mensajes son: Solicit (busca servidor), Advertise (oferta de servidor), Request / Information-Request (solicitud del cliente) y Reply (respuesta/confirmación del servidor)."
  },
  {
    id: "s14-p04",
    semana: 14,
    tema: "Protocolo FTP",
    tipo: "opcion_multiple",
    enunciado: "¿Por qué el protocolo FTP requiere dos puertos TCP distintos y cuáles son?",
    opciones: [
      "Usa el puerto 21 para control/comandos y el puerto 20 para la transferencia real de datos",
      "Usa el puerto 20 para subir archivos y el 21 para descargarlos",
      "Usa el puerto 21 para IPv4 y el puerto 20 para IPv6",
      "Usa el puerto 20 para autenticación y el puerto 21 para encriptación SSL"
    ],
    respuesta: 0,
    explicacion: "FTP divide su funcionamiento en una conexión de control persistente (TCP 21) por donde viajan las instrucciones, y conexiones de datos temporales (TCP 20) que se abren para transferir los ficheros."
  },
  {
    id: "s14-p05",
    semana: 14,
    tema: "Comandos FTP",
    tipo: "opcion_multiple",
    enunciado: "En una sesión de cliente FTP desde el símbolo del sistema (cmd), ¿cuáles son los comandos utilizados para subir y descargar un archivo respectivamente?",
    opciones: [
      "Subir: put <archivo> / Descargar: get <archivo>",
      "Subir: upload <archivo> / Descargar: download <archivo>",
      "Subir: send <archivo> / Descargar: fetch <archivo>",
      "Subir: push <archivo> / Descargar: pull <archivo>"
    ],
    respuesta: 0,
    explicacion: "Los comandos estándar de cliente FTP en terminal son `put` (para subir/insertar un archivo) y `get` (para descargar/extraer un archivo)."
  },
  {
    id: "s14-p06",
    semana: 14,
    tema: "Protocolo SMB",
    tipo: "verdadero_falso",
    enunciado: "A diferencia de FTP, los clientes que utilizan el protocolo SMB establecen conexiones a largo plazo que permiten acceder a los recursos compartidos en el servidor como si fueran locales.",
    opciones: ["Verdadero", "Falso"],
    respuesta: 0,
    explicacion: "Verdadero. SMB (Server Message Block) mantiene una sesión continua que permite interactuar con carpetas e impresoras compartidas de forma transparente para el usuario local."
  },
  {
    id: "s14-p07",
    semana: 14,
    tema: "Protocolo SMTP",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es la función exclusiva de SMTP (puerto TCP 25) en el flujo de correo electrónico?",
    opciones: [
      "Enviar correos desde el cliente hacia el servidor y retransmitirlos entre servidores de correo",
      "Descargar correos desde el servidor a la bandeja de entrada del usuario",
      "Asignar direcciones IP automáticas a los servidores de correo",
      "Encriptar la contraseña de acceso de la cuenta de usuario"
    ],
    respuesta: 0,
    explicacion: "SMTP es un protocolo de 'envío' (push). Se encarga de transferir el mensaje desde el emisor a su servidor y entre los servidores de correo intermedios hasta el de destino."
  },
  {
    id: "s14-p08",
    semana: 14,
    tema: "POP3 vs IMAP",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es la diferencia fundamental en el almacenamiento de mensajes entre POP3 e IMAP?",
    opciones: [
      "POP3 descarga los mensajes al cliente y los elimina del servidor; IMAP mantiene copias originales en el servidor y sincroniza carpetas",
      "POP3 no requiere contraseña y es inseguro; IMAP siempre usa cifrado cuántico",
      "POP3 solo soporta archivos adjuntos de texto; IMAP soporta archivos de video",
      "POP3 corre sobre UDP mientras que IMAP corre sobre TCP"
    ],
    respuesta: 0,
    explicacion: "POP3 descarga los mensajes al host y por defecto los borra del buzón del servidor (no apto para acceso multidispositivo). IMAP mantiene los correos centralizados en el servidor, sincronizando estados de lectura y carpetas."
  },
  {
    id: "s14-p09",
    semana: 14,
    tema: "Rutas Estáticas Cisco",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es el comando correcto para configurar una ruta estática por defecto en IPv4 apuntando al siguiente salto 201.1.1.5?",
    opciones: [
      "ip route 0.0.0.0 0.0.0.0 201.1.1.5",
      "ip default-gateway 201.1.1.5",
      "ip route default 201.1.1.5",
      "ip route *.*.*.* 201.1.1.5"
    ],
    respuesta: 0,
    explicacion: "La ruta estática por defecto (quad-zero) en Cisco IOS se escribe: `ip route 0.0.0.0 0.0.0.0 <ip-siguiente-salto | interfaz-salida>`."
  },
  {
    id: "s14-p10",
    semana: 14,
    tema: "Rutas Estáticas IPv6",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál es el comando correcto para configurar una ruta estática por defecto en IPv6 apuntando al siguiente salto 2001:db8:acad:1::1?",
    opciones: [
      "ipv6 route ::/0 2001:db8:acad:1::1",
      "ip route ::/0 2001:db8:acad:1::1",
      "ipv6 route default 2001:db8:acad:1::1",
      "ipv6 default-gateway 2001:db8:acad:1::1"
    ],
    respuesta: 0,
    explicacion: "En IPv6 la ruta por defecto se representa con el prefijo `::/0`. La sintaxis es `ipv6 route ::/0 <ip-siguiente-salto>`."
  },
  {
    id: "s14-p11",
    semana: 14,
    tema: "Comandos Cisco TFTP",
    tipo: "completar",
    enunciado: "Para realizar una copia de seguridad de la imagen del sistema operativo del router desde su memoria flash hacia un servidor TFTP se utiliza el comando de modo EXEC privilegiado: _________",
    respuestasValidas: [
      "copy flash: tftp:",
      "copy flash: tftp",
      "copy flash tftp"
    ],
    explicacion: "El comando es `copy flash: tftp:`. Luego el sistema solicita la dirección IP del servidor TFTP y el nombre del archivo fuente y destino."
  },
  {
    id: "s14-p12",
    semana: 14,
    tema: "Seguridad Cisco",
    tipo: "completar",
    enunciado: "Para configurar la contraseña secreta cifrada global del router con la palabra 'cisco' en modo `(config)#`, el comando es: _________",
    respuestasValidas: [
      "enable secret cisco"
    ],
    explicacion: "El comando `enable secret cisco` establece una contraseña fuertemente encriptada con algoritmo de hash (MD5 o SHA-256) para acceder al modo privilegiado."
  },

  // SEMANA 15: VLANs, Inter-VLAN (Router-on-a-Stick), VTP, Seguridad de Red
  {
    id: "s15-p01",
    semana: 15,
    tema: "Concepto de VLAN",
    tipo: "opcion_multiple",
    enunciado: "¿Qué es una VLAN (Red de Área Local Virtual)?",
    opciones: [
      "Una red de área local que agrupa un conjunto de equipos de manera lógica independientemente de su ubicación física",
      "Una conexión VPN cifrada a través de Internet público",
      "Un cable coaxial blindado que une dos switches en cascada",
      "Un protocolo de nivel 4 para acelerar descargas de archivos"
    ],
    respuesta: 0,
    explicacion: "Una VLAN permite segmentar una red física en múltiples dominios de difusión lógicos independientes según departamento, función o seguridad, sin importar la distribución física de puertos."
  },
  {
    id: "s15-p02",
    semana: 15,
    tema: "Beneficios de VLANs",
    tipo: "opcion_multiple",
    enunciado: "¿Cuál de los siguientes NO es un beneficio del uso de VLANs en una red conmutada?",
    opciones: [
      "Eliminar por completo la necesidad de routers para comunicar redes de diferente ID",
      "Reducción del tamaño de los dominios de difusión",
      "Seguridad mejorada entre distintos departamentos",
      "Mayor eficiencia del personal de TI y flexibilidad organizativa"
    ],
    respuesta: 0,
    explicacion: "Las VLANs aíslan el tráfico en capa 2. Por tanto, para comunicarse entre VLANs distintas es OBLIGATORIO un dispositivo de Capa 3 (router o switch multicapa); las VLANs no eliminan al router."
  },
  {
    id: "s15-p03",
    semana: 15,
    tema: "VLAN 1 Cisco",
    tipo: "opcion_multiple",
    enunciado: "¿Qué características posee la VLAN 1 predeterminada en los switches Cisco?",
    opciones: [
      "Es la VLAN nativa, predeterminada y de administración por defecto; no se puede eliminar ni renombrar",
      "Es una VLAN temporal que se borra al reiniciar el conmutador",
      "Solo admite tráfico de voz IP",
      "Está reservada exclusivamente para enlaces WAN seriales"
    ],
    respuesta: 0,
    explicacion: "La VLAN 1 viene configurada de fábrica en todos los puertos. Es la VLAN default, nativa y de administración. No se puede eliminar ni cambiar su nombre."
  },
  {
    id: "s15-p04",
    semana: 15,
    tema: "Almacenamiento VLAN",
    tipo: "opcion_multiple",
    enunciado: "¿En qué archivo de la memoria flash del switch Cisco se almacenan las configuraciones de las VLANs de rango normal?",
    opciones: [
      "vlan.dat",
      "running-config",
      "startup-config.bak",
      "ios.bin"
    ],
    respuesta: 0,
    explicacion: "La base de datos de VLANs de rango normal (1 a 1005) se guarda de manera independiente en la memoria flash en el archivo `vlan.dat`."
  },
  {
    id: "s15-p05",
    semana: 15,
    tema: "Tipos de Puertos",
    tipo: "opcion_multiple",
    enunciado: "¿Qué diferencia existe entre un enlace de acceso (Access Port) y un enlace troncal (Trunk Port)?",
    opciones: [
      "El puerto de acceso pertenece a una sola VLAN y no etiqueta tramas; el puerto troncal transporta tráfico de múltiples VLANs mediante etiquetas 802.1Q",
      "El puerto de acceso es inalámbrico y el troncal es alámbrico",
      "El puerto de acceso solo opera a 10 Mbps y el troncal a 10 Gbps",
      "El puerto de acceso se conecta a routers y el troncal a PCs de escritorio"
    ],
    respuesta: 0,
    explicacion: "Los puertos de acceso transportan tráfico de una única VLAN hacia dispositivos finales (sin etiquetas). Los enlaces troncales multiplexan y transportan tramas de múltiples VLANs entre switches usando encabezados dot1q."
  },
  {
    id: "s15-p06",
    semana: 15,
    tema: "Etiquetado Troncal",
    tipo: "completar",
    enunciado: "El estándar internacional de la industria para el etiquetado y encapsulamiento de tramas en enlaces troncales de VLAN es el estándar IEEE _________",
    respuestasValidas: ["802.1q", "802.1Q", "dot1q"],
    explicacion: "El estándar IEEE 802.1Q (coloquialmente dot1q) inserta una etiqueta de 4 bytes en la cabecera Ethernet original para identificar a qué VLAN pertenece la trama."
  },
  {
    id: "s15-p07",
    semana: 15,
    tema: "Protocolo VTP",
    tipo: "opcion_multiple",
    enunciado: "¿Qué funciones tienen los modos Server y Client en el protocolo VTP (VLAN Trunking Protocol)?",
    opciones: [
      "Server: puede crear, modificar y borrar VLANs; Client: no puede modificar VLANs localmente y solo sincroniza la base de datos",
      "Server: reparte direcciones IP por DHCP; Client: recibe la dirección IP",
      "Server: almacena los correos electrónicos; Client: descarga con POP3",
      "Server: solo funciona con fibra óptica; Client: solo con par trenzado"
    ],
    respuesta: 0,
    explicacion: "En VTP, los switches en modo Server tienen control para crear y eliminar VLANs en el dominio. Los switches en modo Client reciben esas actualizaciones y no permiten modificaciones manuales."
  },
  {
    id: "s15-p08",
    semana: 15,
    tema: "Router-on-a-Stick",
    tipo: "opcion_multiple",
    enunciado: "¿En qué consiste el método de enrutamiento Inter-VLAN denominado 'Router-on-a-Stick'?",
    opciones: [
      "En utilizar una sola interfaz física de router dividida en subinterfaces lógicas con encapsulación dot1q conectada a un enlace troncal del switch",
      "En conectar un cable físico independiente desde el router para cada VLAN existente en la red",
      "En utilizar dos routers idénticos conectados en paralelo para redundancia HSRP",
      "En conectar antenas inalámbricas a todos los switches del armario de comunicaciones"
    ],
    respuesta: 0,
    explicacion: "Router-on-a-Stick optimiza el uso de puertos físicos creando subinterfaces lógicas en el router (ej. g0/0/0.10, g0/0/0.30) que atienden cada VLAN a través de un único cable troncal 802.1Q."
  },
  {
    id: "s15-p09",
    semana: 15,
    tema: "Comandos Inter-VLAN Cisco",
    tipo: "opcion_multiple",
    enunciado: "¿Cuáles son los comandos correctos para crear y activar la subinterfaz GigabitEthernet 0/0/0.30 para la VLAN 30 con IP 10.30.0.1/16 en un router Cisco?",
    opciones: [
      "interface g0/0/0.30 -> encapsulation dot1Q 30 -> ip address 10.30.0.1 255.255.0.0",
      "interface g0/0/0 -> vlan 30 -> ip address 10.30.0.1 255.255.0.0",
      "subinterface vlan 30 -> dot1q enable -> ip address 10.30.0.1",
      "interface g0/0/0.30 -> switchport mode access 30 -> ip address 10.30.0.1"
    ],
    respuesta: 0,
    explicacion: "La sintaxis obligatoria en routers Cisco es entrar a la subinterfaz (`interface g0/0/0.30`), definir el encapsulamiento y el número de VLAN (`encapsulation dot1Q 30`) y finalmente asignar la IP (`ip address ...`)."
  },
  {
    id: "s15-p10",
    semana: 15,
    tema: "DHCP en Router Cisco",
    tipo: "opcion_multiple",
    enunciado: "Para evitar que el servidor DHCP de un router Cisco asigne las primeras direcciones IP reservadas para gateways y servidores (de la 10.30.0.1 a la 10.30.0.5), ¿qué comando se aplica?",
    opciones: [
      "ip dhcp excluded-address 10.30.0.1 10.30.0.5",
      "ip dhcp reserve 10.30.0.1 10.30.0.5",
      "no ip dhcp pool 10.30.0.1 10.30.0.5",
      "ip dhcp deny 10.30.0.1 10.30.0.5"
    ],
    respuesta: 0,
    explicacion: "En modo de configuración global se usa el comando `ip dhcp excluded-address <ip-inicio> [<ip-fin>]` para excluir rangos estáticos del pool dinámico."
  },
  {
    id: "s15-p11",
    semana: 15,
    tema: "Seguridad de Red - Malware",
    tipo: "relacionar",
    enunciado: "Relacione cada tipo de software malicioso (malware) con su característica operativa:",
    pares: [
      { premisa: "Virus", respuesta: "Se propaga insertando copias de sí mismo en otro programa anfitrión" },
      { premisa: "Gusano (Worm)", respuesta: "Software independiente y autónomo que se replica por la red sin anfitrión" },
      { premisa: "Caballo de Troya", respuesta: "Parece legítimo pero contiene código dañino; no se autorreplica" }
    ],
    explicacion: "El virus necesita un programa ejecutable huésped; el gusano es un programa autónomo que se propaga solo explotando vulnerabilidades de red; el troyano engaña al usuario para que lo abra voluntariamente."
  },
  {
    id: "s15-p12",
    semana: 15,
    tema: "Vulnerabilidades de Red",
    tipo: "opcion_multiple",
    enunciado: "¿Cuáles son las tres clases principales de vulnerabilidades de red presentadas en las diapositivas de clase?",
    opciones: [
      "Vulnerabilidades tecnológicas, de configuración y de política de seguridad",
      "Vulnerabilidades físicas, biológicas y nucleares",
      "Vulnerabilidades de hardware, de software y de usuario",
      "Vulnerabilidades de capa 1, capa 2 y capa 3"
    ],
    respuesta: 0,
    explicacion: "El material clasifica las debilidades en: Tecnológicas (fallas en protocolos o SO), De Configuración (claves por defecto, malas prácticas) y De Política de Seguridad (ausencia de normativas o procedimientos)."
  },
  {
    id: "s15-p13",
    semana: 15,
    tema: "Amenazas Físicas",
    tipo: "opcion_multiple",
    enunciado: "Un pico de voltaje imprevisto o una caída de tensión en el data center que apaga los switches corresponde a una amenaza física de tipo:",
    opciones: [
      "Amenaza eléctrica",
      "Amenaza ambiental",
      "Amenaza de mantenimiento",
      "Amenaza de hardware"
    ],
    respuesta: 0,
    explicacion: "Las amenazas físicas se agrupan en: de Hardware (daño físico), Ambientales (temperatura, humedad), Eléctricas (picos, ruido, apagones) y de Mantenimiento (estática, cableado y etiquetado deficiente)."
  }
];
