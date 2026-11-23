// Banco de ejercicios de comandos Cisco IOS y Terminal para PC3 - UTP
// Permite tolerancia a abreviaturas, mayúsculas/minúsculas y espacios.

const COMANDOS_DATA = [
  // SEMANA 11
  {
    id: "s11-c01",
    semana: 11,
    tema: "Capa de Transporte - Diagnóstico",
    prompt: "C:\\Users\\Estudiante> ",
    enunciado: "En la consola del sistema operativo Windows, ejecute el comando para visualizar todas las conexiones TCP activas y los puertos en escucha.",
    solucion: "netstat -an",
    pistas: [
      "Utilice la herramienta de estadísticas de red del sistema",
      "El comando empieza con 'netstat'"
    ],
    patronesValidos: [
      /^netstat(\s+-[a-z]+)?$/i
    ],
    explicacion: "`netstat` muestra las conexiones de red activas. El modificador `-a` muestra todas las conexiones y puertos de escucha, y `-n` muestra las direcciones y números de puerto de forma numérica."
  },
  {
    id: "s11-c02",
    semana: 11,
    tema: "Diagnóstico Host",
    prompt: "C:\\Users\\Estudiante> ",
    enunciado: "Ejecute el comando para consultar la configuración de red detallada de todas las interfaces del equipo (incluyendo direcciones MAC, IP, máscara, gateway y DNS).",
    solucion: "ipconfig /all",
    pistas: [
      "Es el comando ipconfig con un parámetro",
      "Use el modificador /all"
    ],
    patronesValidos: [
      /^ipconfig\s*(\/all|-all)$/i
    ],
    explicacion: "`ipconfig /all` despliega los parámetros completos de red TCP/IP de todos los adaptadores físicos y virtuales instalados."
  },
  {
    id: "s11-c03",
    semana: 11,
    tema: "Wireshark / ICMP",
    prompt: "C:\\Users\\Estudiante> ",
    enunciado: "Inicie un ping continuo y sostenido hacia el servidor 'www.youtube.com' como se indicó en la guía del laboratorio de Wireshark.",
    solucion: "ping -t www.youtube.com",
    pistas: [
      "El modificador para ping continuo en Windows es -t",
      "ping -t <dominio>"
    ],
    patronesValidos: [
      /^ping\s+-t\s+www\.youtube\.com$/i,
      /^ping\s+www\.youtube\.com\s+-t$/i
    ],
    explicacion: "`ping -t www.youtube.com` envía solicitudes de eco ICMP de forma indefinida hasta que se presione Ctrl+C, generando tráfico constante para capturas en Wireshark."
  },
  {
    id: "s11-c04",
    semana: 11,
    tema: "Resolución de Direcciones",
    prompt: "C:\\Users\\Estudiante> ",
    enunciado: "Consulte la tabla de correspondencia entre direcciones IP y direcciones físicas MAC en la memoria caché del host local.",
    solucion: "arp -a",
    pistas: [
      "El comando es de la familia ARP",
      "Use el parámetro -a"
    ],
    patronesValidos: [
      /^arp\s+-a$/i,
      /^arp\s+-g$/i
    ],
    explicacion: "`arp -a` muestra las entradas dinámicas y estáticas de la tabla ARP del sistema operativo."
  },
  {
    id: "s11-c05",
    semana: 11,
    tema: "Verificación Cisco",
    prompt: "Router# ",
    enunciado: "En el modo EXEC privilegiado del router, visualice las estadísticas y el estado de la interfaz GigabitEthernet 0/0/0.",
    solucion: "show interfaces gigabitethernet 0/0/0",
    pistas: [
      "Comando show interfaces...",
      "Se puede abreviar como: sh int g0/0/0"
    ],
    patronesValidos: [
      /^sh(ow)?\s+int(erfaces)?\s+g(igabitethernet)?\s*0\/0\/0$/i
    ],
    explicacion: "`show interfaces gigabitethernet 0/0/0` muestra el ancho de banda, MTU, duplex, velocidad, paquetes transmitidos y posibles colisiones o errores."
  },

  // SEMANA 12
  {
    id: "s12-c01",
    semana: 12,
    tema: "Enrutamiento IPv6",
    prompt: "Router(config)# ",
    enunciado: "Habilite el enrutamiento de unidifusión IPv6 de forma global en el router Cisco.",
    solucion: "ipv6 unicast-routing",
    pistas: [
      "Comando de tres palabras",
      "Empieza con 'ipv6'"
    ],
    patronesValidos: [
      /^ipv6\s+unicast-routing$/i
    ],
    explicacion: "Sin el comando `ipv6 unicast-routing`, un router Cisco actúa simplemente como un host IPv6 y no reenvía paquetes entre diferentes interfaces."
  },
  {
    id: "s12-c02",
    semana: 12,
    tema: "Direccionamiento IPv6",
    prompt: "Router(config-if)# ",
    enunciado: "Asigne la dirección IPv6 global '2001:db8:acad:1::1/64' a la interfaz GigabitEthernet seleccionada.",
    solucion: "ipv6 address 2001:db8:acad:1::1/64",
    pistas: [
      "Se usa 'ipv6 address <ip>/<prefijo>'",
      "Se puede abreviar como: ipv6 add 2001:db8:acad:1::1/64"
    ],
    patronesValidos: [
      /^ipv6\s+add(ress)?\s+2001:db8:acad:1::1\/64$/i
    ],
    explicacion: "El comando `ipv6 address <dir/prefijo>` configura una dirección de unidifusión global (GUA) en la interfaz del router."
  },
  {
    id: "s12-c03",
    semana: 12,
    tema: "Link-Local IPv6",
    prompt: "Router(config-if)# ",
    enunciado: "Configure la dirección Link-Local 'fe80::1' en la interfaz actual del router.",
    solucion: "ipv6 address fe80::1 link-local",
    pistas: [
      "No olvide el parámetro al final 'link-local'",
      "ipv6 add fe80::1 link-local"
    ],
    patronesValidos: [
      /^ipv6\s+add(ress)?\s+fe80::1\s+link-local$/i
    ],
    explicacion: "El parámetro `link-local` indica que la dirección FE80::1 es de ámbito de enlace local y no se enruta fuera del segmento."
  },
  {
    id: "s12-c04",
    semana: 12,
    tema: "Enrutamiento EIGRP",
    prompt: "Router(config)# ",
    enunciado: "Inicie el proceso de enrutamiento dinámico EIGRP con el número de Sistema Autónomo 1.",
    solucion: "router eigrp 1",
    pistas: [
      "router <protocolo> <as>",
      "router eigrp 1"
    ],
    patronesValidos: [
      /^router\s+eigrp\s+1$/i
    ],
    explicacion: "`router eigrp 1` ingresa al submodo de configuración del protocolo EIGRP con Autonomous System ID = 1."
  },
  {
    id: "s12-c05",
    semana: 12,
    tema: "Redes EIGRP",
    prompt: "Router(config-router)# ",
    enunciado: "Publique la red local 192.168.1.0/24 en el proceso EIGRP utilizando su máscara wildcard correspondiente.",
    solucion: "network 192.168.1.0 0.0.0.255",
    pistas: [
      "Wildcard de /24 (255.255.255.0) es 0.0.0.255",
      "network 192.168.1.0 0.0.0.255"
    ],
    patronesValidos: [
      /^net(work)?\s+192\.168\.1\.0\s+0\.0\.0\.255$/i
    ],
    explicacion: "En EIGRP se utiliza la wildcard inversa: para /24 es `0.0.0.255`."
  },
  {
    id: "s12-c06",
    semana: 12,
    tema: "Verificación EIGRP",
    prompt: "Router# ",
    enunciado: "Muestre únicamente las rutas aprendidas dinámicamente a través de EIGRP en la tabla de enrutamiento.",
    solucion: "show ip route eigrp",
    pistas: [
      "sh ip route ...",
      "show ip route eigrp"
    ],
    patronesValidos: [
      /^sh(ow)?\s+ip\s+route\s+eigrp$/i
    ],
    explicacion: "`show ip route eigrp` filtra la tabla de rutas mostrando solo las marcadas con la letra D (EIGRP)."
  },

  // SEMANA 13
  {
    id: "s13-c01",
    semana: 13,
    tema: "DHCPv6 Stateless Cisco",
    prompt: "RLOCAL(config)# ",
    enunciado: "Cree un grupo o pool de configuración DHCPv6 con el nombre 'CISCO'.",
    solucion: "ipv6 dhcp pool CISCO",
    pistas: [
      "ipv6 dhcp pool <NOMBRE>",
      "ipv6 dhcp pool CISCO"
    ],
    patronesValidos: [
      /^ipv6\s+dhcp\s+pool\s+CISCO$/i
    ],
    explicacion: "`ipv6 dhcp pool CISCO` crea el contenedor de parámetros DHCPv6 e ingresa al submodo `(config-dhcpv6)#`."
  },
  {
    id: "s13-c02",
    semana: 13,
    tema: "DHCPv6 DNS",
    prompt: "RLOCAL(config-dhcpv6)# ",
    enunciado: "Dentro del pool DHCPv6, configure la dirección del servidor DNS con la IP '2001:DB8:ACAD:1::10'.",
    solucion: "dns-server 2001:DB8:ACAD:1::10",
    pistas: [
      "dns-server <ipv6>",
      "dns-server 2001:DB8:ACAD:1::10"
    ],
    patronesValidos: [
      /^dns-server\s+2001:db8:acad:1::10$/i
    ],
    explicacion: "El comando `dns-server <ipv6>` instruye a los clientes qué servidor consultar para resolución de nombres de dominio."
  },
  {
    id: "s13-c03",
    semana: 13,
    tema: "SLAAC Other Flag",
    prompt: "RLOCAL(config-if)# ",
    enunciado: "En la interfaz GigabitEthernet0/0/1, active la bandera de otra configuración (other-config-flag) para notificar a los clientes SLAAC que obtengan el DNS por DHCPv6.",
    solucion: "ipv6 nd other-config-flag",
    pistas: [
      "Empieza con 'ipv6 nd...'",
      "ipv6 nd other-config-flag"
    ],
    patronesValidos: [
      /^ipv6\s+nd\s+other-config-flag$/i
    ],
    explicacion: "`ipv6 nd other-config-flag` enciende la bandera 'O' en los mensajes Router Advertisement (RA), indicando que hay información adicional disponible mediante DHCP sin estado."
  },
  {
    id: "s13-c04",
    semana: 13,
    tema: "DHCPv6 en Interfaz",
    prompt: "RLOCAL(config-if)# ",
    enunciado: "Vincule el servicio DHCPv6 utilizando el pool 'CISCO' a la interfaz actual.",
    solucion: "ipv6 dhcp server CISCO",
    pistas: [
      "ipv6 dhcp server <pool>",
      "ipv6 dhcp server CISCO"
    ],
    patronesValidos: [
      /^ipv6\s+dhcp\s+server\s+CISCO$/i
    ],
    explicacion: "`ipv6 dhcp server CISCO` asocia el pool previamente creado a la interfaz donde los clientes solicitarán opciones de configuración."
  },
  {
    id: "s13-c05",
    semana: 13,
    tema: "Diagnóstico Cisco",
    prompt: "RLOCAL# ",
    enunciado: "Rastree el camino y los saltos hacia la IP destino 192.168.40.2 desde el modo EXEC privilegiado del router.",
    solucion: "traceroute 192.168.40.2",
    pistas: [
      "En Cisco el comando se escribe completo: traceroute",
      "traceroute 192.168.40.2"
    ],
    patronesValidos: [
      /^traceroute\s+192\.168\.40\.2$/i
    ],
    explicacion: "`traceroute` envía sondas UDP/ICMP con TTL creciente para descubrir cada salto de router hasta alcanzar la dirección de destino."
  },

  // SEMANA 14
  {
    id: "s14-c01",
    semana: 14,
    tema: "Seguridad y Nombre",
    prompt: "Router(config)# ",
    enunciado: "Asigne el nombre de host 'CORP' al router.",
    solucion: "hostname CORP",
    pistas: [
      "hostname <NOMBRE>",
      "hostname CORP"
    ],
    patronesValidos: [
      /^hostname\s+CORP$/i
    ],
    explicacion: "`hostname CORP` define el identificador del equipo que aparece en el prompt del sistema."
  },
  {
    id: "s14-c02",
    semana: 14,
    tema: "Seguridad Privilegiada",
    prompt: "CORP(config)# ",
    enunciado: "Configure la contraseña secreta cifrada global del router con el valor 'cisco'.",
    solucion: "enable secret cisco",
    pistas: [
      "enable secret <clave>",
      "enable secret cisco"
    ],
    patronesValidos: [
      /^enable\s+secret\s+cisco$/i
    ],
    explicacion: "`enable secret cisco` protege el acceso al modo privilegiado aplicando un algoritmo hash a la clave."
  },
  {
    id: "s14-c03",
    semana: 14,
    tema: "Ruta Estática IPv4",
    prompt: "CORP(config)# ",
    enunciado: "Configure una ruta estática por defecto en IPv4 apuntando hacia el router de siguiente salto con IP 201.1.1.5.",
    solucion: "ip route 0.0.0.0 0.0.0.0 201.1.1.5",
    pistas: [
      "ip route <red> <mascara> <siguiente-salto>",
      "ip route 0.0.0.0 0.0.0.0 201.1.1.5"
    ],
    patronesValidos: [
      /^ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+201\.1\.1\.5$/i
    ],
    explicacion: "`ip route 0.0.0.0 0.0.0.0 201.1.1.5` envía todo el tráfico no coincidente con rutas locales hacia la pasarela 201.1.1.5."
  },
  {
    id: "s14-c04",
    semana: 14,
    tema: "Ruta Estática IPv6",
    prompt: "CORP(config)# ",
    enunciado: "Configure la ruta estática por defecto en IPv6 apuntando a la IP de siguiente salto 2001:db8:acad:1::1.",
    solucion: "ipv6 route ::/0 2001:db8:acad:1::1",
    pistas: [
      "En IPv6 la red por defecto es ::/0",
      "ipv6 route ::/0 2001:db8:acad:1::1"
    ],
    patronesValidos: [
      /^ipv6\s+route\s+::\/0\s+2001:db8:acad:1::1$/i
    ],
    explicacion: "`ipv6 route ::/0 <ip>` establece la ruta predeterminada en IPv6."
  },
  {
    id: "s14-c05",
    semana: 14,
    tema: "Cliente FTP",
    prompt: "ftp> ",
    enunciado: "Dentro de la sesión de consola FTP conectada al servidor, suba el archivo de texto local denominado 'utp.txt'.",
    solucion: "put utp.txt",
    pistas: [
      "El comando para subir archivos en FTP es put",
      "put utp.txt"
    ],
    patronesValidos: [
      /^put\s+utp\.txt$/i
    ],
    explicacion: "En el cliente FTP estándar, `put <archivo>` transmite el archivo local al servidor remoto a través del puerto de datos TCP 20."
  },
  {
    id: "s14-c06",
    semana: 14,
    tema: "Backup Cisco TFTP",
    prompt: "CORP# ",
    enunciado: "Inicie el proceso para copiar la imagen IOS almacenada en flash hacia un servidor TFTP.",
    solucion: "copy flash: tftp:",
    pistas: [
      "copy <origen> <destino>",
      "copy flash: tftp:"
    ],
    patronesValidos: [
      /^copy\s+flash:?\s+tftp:?$/i
    ],
    explicacion: "`copy flash: tftp:` permite respaldar archivos de firmware y configuración hacia un servidor TFTP de la red."
  },

  // SEMANA 15
  {
    id: "s15-c01",
    semana: 15,
    tema: "Creación de VLAN",
    prompt: "CORE(config)# ",
    enunciado: "Cree la VLAN número 10 en el conmutador CORE.",
    solucion: "vlan 10",
    pistas: [
      "vlan <id>",
      "vlan 10"
    ],
    patronesValidos: [
      /^vlan\s+10$/i
    ],
    explicacion: "`vlan 10` crea la VLAN y entra al submodo `(config-vlan)#` para asignar propiedades."
  },
  {
    id: "s15-c02",
    semana: 15,
    tema: "Nombre de VLAN",
    prompt: "CORE(config-vlan)# ",
    enunciado: "Asigne el nombre 'servidores' a la VLAN actual.",
    solucion: "name servidores",
    pistas: [
      "name <nombre>",
      "name servidores"
    ],
    patronesValidos: [
      /^name\s+servidores$/i
    ],
    explicacion: "`name servidores` etiqueta la VLAN con un nombre descriptivo en la base de datos `vlan.dat`."
  },
  {
    id: "s15-c03",
    semana: 15,
    tema: "Dominio VTP",
    prompt: "CORE(config)# ",
    enunciado: "Establezca el nombre del dominio VTP como 'UTP'.",
    solucion: "vtp domain UTP",
    pistas: [
      "vtp domain <nombre>",
      "vtp domain UTP"
    ],
    patronesValidos: [
      /^vtp\s+domain\s+UTP$/i
    ],
    explicacion: "`vtp domain UTP` agrupa a los conmutadores para sincronizar sus bases de datos de VLANs."
  },
  {
    id: "s15-c04",
    semana: 15,
    tema: "Modo VTP Cliente",
    prompt: "SW-SERVER(config)# ",
    enunciado: "Configure el modo operativo de VTP del switch en modo 'client'.",
    solucion: "vtp mode client",
    pistas: [
      "vtp mode <server | client | transparent>",
      "vtp mode client"
    ],
    patronesValidos: [
      /^vtp\s+mode\s+client$/i
    ],
    explicacion: "`vtp mode client` bloquea la edición local de VLANs y recibe la sincronización desde el switch servidor VTP."
  },
  {
    id: "s15-c05",
    semana: 15,
    tema: "Puerto Troncal",
    prompt: "SW-SERVER(config-if)# ",
    enunciado: "Configure la interfaz GigabitEthernet0/1 del switch en modo troncal (trunk).",
    solucion: "switchport mode trunk",
    pistas: [
      "switchport mode ...",
      "Se puede abreviar como: sw mode trunk o sw mo tr"
    ],
    patronesValidos: [
      /^sw(itchport)?\s+mo(de)?\s+tr(unk)?$/i
    ],
    explicacion: "`switchport mode trunk` permite que el puerto transporte tráfico etiquetado de múltiples VLANs mediante 802.1Q."
  },
  {
    id: "s15-c06",
    semana: 15,
    tema: "Puerto de Acceso",
    prompt: "SW-SERVER(config-if)# ",
    enunciado: "Asigne el puerto actual a la VLAN 10 en modo de acceso.",
    solucion: "switchport access vlan 10",
    pistas: [
      "switchport access vlan ...",
      "sw acc vlan 10"
    ],
    patronesValidos: [
      /^sw(itchport)?\s+acc(ess)?\s+vlan\s+10$/i
    ],
    explicacion: "`switchport access vlan 10` asocia el puerto final a la VLAN 10 despojando de etiquetas a las tramas que van al host."
  },
  {
    id: "s15-c07",
    semana: 15,
    tema: "SVI de Administración",
    prompt: "CORE(config-if)# ",
    enunciado: "Dentro de la interfaz virtual de switch `interface vlan 99`, configure la dirección IP 10.99.0.2 con máscara 255.255.0.0 (/16).",
    solucion: "ip address 10.99.0.2 255.255.0.0",
    pistas: [
      "ip add 10.99.0.2 255.255.0.0",
      "ip address 10.99.0.2 255.255.0.0"
    ],
    patronesValidos: [
      /^ip\s+add(ress)?\s+10\.99\.0\.2\s+255\.255\.0\.0$/i
    ],
    explicacion: "Configura la dirección IP de gestión del switch en la SVI (Switch Virtual Interface) de la VLAN de administración 99."
  },
  {
    id: "s15-c08",
    semana: 15,
    tema: "Router-on-a-Stick",
    prompt: "RLOCAL(config-subif)# ",
    enunciado: "En la subinterfaz g0/0/0.30 del router, aplique la encapsulación dot1Q para la VLAN 30.",
    solucion: "encapsulation dot1Q 30",
    pistas: [
      "encapsulation dot1Q <vlan>",
      "Se puede abreviar: encap dot1q 30"
    ],
    patronesValidos: [
      /^encap(sulation)?\s+dot1q\s+30$/i
    ],
    explicacion: "`encapsulation dot1Q 30` habilita el etiquetado 802.1Q en la subinterfaz y la asocia al ID de VLAN 30."
  },
  {
    id: "s15-c09",
    semana: 15,
    tema: "Exclusiones DHCP Cisco",
    prompt: "RLOCAL(config)# ",
    enunciado: "Excluya el rango de direcciones IP desde la 10.30.0.1 hasta la 10.30.0.5 para que no sean entregadas por DHCP.",
    solucion: "ip dhcp excluded-address 10.30.0.1 10.30.0.5",
    pistas: [
      "ip dhcp excl...",
      "ip dhcp excluded-address 10.30.0.1 10.30.0.5"
    ],
    patronesValidos: [
      /^ip\s+dhcp\s+excl(uded-address)?\s+10\.30\.0\.1\s+10\.30\.0\.5$/i
    ],
    explicacion: "`ip dhcp excluded-address` reserva rangos de direcciones estáticas previniendo conflictos de IP duplicadas."
  },
  {
    id: "s15-c10",
    semana: 15,
    tema: "Pool DHCP Cisco",
    prompt: "RLOCAL(dhcp-config)# ",
    enunciado: "Dentro del pool DHCP, defina la dirección del gateway predeterminado como 10.30.0.1.",
    solucion: "default-router 10.30.0.1",
    pistas: [
      "default-router <ip>",
      "default-router 10.30.0.1"
    ],
    patronesValidos: [
      /^default-router\s+10\.30\.0\.1$/i
    ],
    explicacion: "`default-router 10.30.0.1` asigna la puerta de enlace por defecto a los clientes DHCP que soliciten dirección en esa subred."
  },
  {
    id: "s15-c11",
    semana: 15,
    tema: "Verificación de Troncales",
    prompt: "CORE# ",
    enunciado: "Ejecute el comando para verificar el estado de los puertos troncales, su encapsulación y las VLANs permitidas.",
    solucion: "show interfaces trunk",
    pistas: [
      "show interfaces ...",
      "Se puede abreviar como: sh inter trunk o sh int trunk"
    ],
    patronesValidos: [
      /^sh(ow)?\s+int(erfaces)?\s+trunk$/i
    ],
    explicacion: "`show interfaces trunk` muestra qué interfaces están en modo troncal, el protocolo de encapsulación (802.1q), la VLAN nativa y las VLANs activas permitidas."
  }
];
