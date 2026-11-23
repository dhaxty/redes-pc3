// DATOS DEL MÓDULO: PC3 DE REFERENCIA (EXAMEN EN HOJA IMPRESA)
// Redes y Comunicación de Datos I (UTP) - 100% Offline, sin dependencias.

const PC3_REF_DATA = {
  aviso: "Basado en un examen de referencia (fuente externa); tu examen puede ser distinto.",
  
  // 1. LAS 4 PREGUNTAS DEL EXAMEN FÍSICO
  preguntas: [
    {
      id: "p1",
      numero: 1,
      titulo: "Pregunta 1: Servicio DNS y Servidor Web (5 puntos)",
      enunciado: "En el Cisco Packet Tracer, configure el servidor1 con el servicio DNS (Primerapellido.utp.com y Segundoapellido.utp.com), demuestre su captura desde la PC1 y PC4. Tal como las imágenes de ejemplo.",
      puntosTotal: 5,
      contexto: "Servidor 1 con IP 192.168.X.1 en la misma red LAN que PC1 y PC4. Servidor aloja servicio Web (HTTP) y Servicio DNS.",
      puntosClave: [
        { id: "p1_1", texto: "Ruta de configuración en Servidor 1 (Desktop > IP Configuration y Services > DNS / HTTP)", valor: 1.0 },
        { id: "p1_2", texto: "Activación del servicio DNS (Service: ON) y tipo de registro (Type: A Record)", valor: 1.0 },
        { id: "p1_3", texto: "Ingreso exacto de nombres (Primerapellido.utp.com y Segundoapellido.utp.com) apuntando a la IP 192.168.X.1 y clic en Add", valor: 1.0 },
        { id: "p1_4", texto: "Configuración en PC1 y PC4 de la IP del DNS Server (192.168.X.1) en su IP Configuration", valor: 1.0 },
        { id: "p1_5", texto: "Descripción de la prueba y captura: abrir Web Browser en PC1 y PC4, escribir URL y verificar carga de página con apellidos", valor: 1.0 }
      ],
      respuestaModelo: `PASOS DE CONFIGURACIÓN A ESCRIBIR EN HOJA:

1. Configuración IP del Servidor 1:
   - Entrar a Servidor 1 > Desktop > IP Configuration.
   - Asignar IP estática: 192.168.X.1 (ej. 192.168.10.1), Máscara: 255.255.255.0, Default Gateway: 192.168.X.254, DNS Server: 127.0.0.1 (o 192.168.X.1).

2. Configuración del Servicio DNS en Servidor 1:
   - Ir a la pestaña Services > DNS.
   - Habilitar el servicio seleccionando DNS Service: ON.
   - En la sección "Resource Records":
     * Name: correa.utp.com (Primerapellido.utp.com)
     * Type: A Record
     * Address: 192.168.X.1 (IP del Servidor 1)
     * Pulsar botón "Add".
   - Repetir para el segundo dominio:
     * Name: calle.utp.com (Segundoapellido.utp.com)
     * Type: A Record
     * Address: 192.168.X.1
     * Pulsar botón "Add".

3. Configuración del Servicio Web (HTTP) en Servidor 1:
   - Ir a Services > HTTP.
   - Verificar que HTTP y HTTPS estén en ON.
   - En el archivo "index.html", dar clic en "edit" y personalizar el HTML:
     <h1>Redes y Comunicaciones I</h1>
     <p>Bienvenido a mi página web.</p>
     <p>TEOFILO ROBERTO CORREA CALLE</p>
     <p>Hiciste ping con correa.utp.com</p>
   - Guardar cambios (Save).

4. Configuración de clientes (PC1 y PC4):
   - En cada PC > Desktop > IP Configuration:
     * Asegurar que el campo "DNS Server" tenga la IP 192.168.X.1.

5. Pruebas de verificación:
   - Desde PC1: Abrir Command Prompt y ejecutar:
     nslookup correa.utp.com
     (Debe responder Address: 192.168.X.1)
   - Abrir Desktop > Web Browser en PC1:
     URL: http://correa.utp.com -> Carga la página web con el nombre.
   - Abrir Desktop > Web Browser en PC4:
     URL: http://calle.utp.com -> Carga la página web con el segundo apellido.`,
      queDeberiaVerse: `EVIDENCIA Y MENSAJES EN PANTALLA:
- En Web Browser de PC1:
  * Barra de direcciones (URL): http://correa.utp.com
  * Área de renderizado web:
    - Encabezado: "Redes y Comunicaciones I"
    - Párrafo 1: "Bienvenido a mi página web."
    - Párrafo 2: "TEOFILO ROBERTO CORREA CALLE"
    - Párrafo 3: "Hiciste ping con correa.utp.com"
- En Web Browser de PC4:
  * Barra de direcciones (URL): http://calle.utp.com
  * Mismo encabezado y nombre con: "Hiciste ping desde calle.utp.com"
- En Command Prompt (opcional para sustentar):
  * "Server: Server-PT"
  * "Address: 192.168.X.1"
  * "Name: correa.utp.com / Address: 192.168.X.1"`,
      erroresTipicos: [
        "Olvidar encender el interruptor 'DNS Service: ON' (queda en OFF por defecto).",
        "Olvidar configurar el campo 'DNS Server' en la IP Configuration de PC1 y PC4 (si el cliente no tiene DNS configurado, el navegador mostrará 'Host name unresolved').",
        "Escribir mal el tipo de registro (debe ser 'A Record', no CNAME ni MX).",
        "Olvidar presionar el botón 'Add' tras escribir el nombre y la IP.",
        "Poner 'http://' dentro del campo Name del registro DNS (en el servidor solo va el FQDN 'correa.utp.com')."
      ],
      comandosPrueba: [
        { cmd: "nslookup correa.utp.com", desc: "Verifica resolución de nombres DNS en PC1" },
        { cmd: "ping correa.utp.com", desc: "Comprueba resolución y conectividad ICMP" },
        { cmd: "ipconfig /all", desc: "Verifica que la PC tenga asignado el servidor DNS 192.168.X.1" }
      ]
    },

    {
      id: "p2",
      numero: 2,
      titulo: "Pregunta 2: Servicio DHCP en Servidor 1 (5 puntos)",
      enunciado: "Configure el servicio de DHCP en el Servidor 1. Realice pruebas de conectividad que demuestre este servicio en la PC3. Tal como las imágenes de ejemplo.",
      puntosTotal: 5,
      contexto: "Servidor 1 actúa como servidor DHCP para la red LAN 192.168.X.0/24. PC3 solicita parámetros dinámicos por difusión DORA.",
      puntosClave: [
        { id: "p2_1", texto: "Ruta de configuración en Servidor 1 (Services > DHCP) y activación del servicio (Service: ON)", valor: 1.0 },
        { id: "p2_2", texto: "Configuración del pool: Pool Name (serverPool), Default Gateway (192.168.X.254) y DNS Server (192.168.X.1)", valor: 1.0 },
        { id: "p2_3", texto: "Definición del rango de direcciones: Start IP (ej. 192.168.X.100), Subnet Mask (255.255.255.0) y Maximum Users", valor: 1.0 },
        { id: "p2_4", texto: "Guardado del pool con el botón 'Save' en el pool existente", valor: 1.0 },
        { id: "p2_5", texto: "Demostración en PC3: Desktop > IP Configuration, marcar radio button DHCP y constatar mensaje 'DHCP request successful.'", valor: 1.0 }
      ],
      respuestaModelo: `PASOS DE CONFIGURACIÓN A ESCRIBIR EN HOJA:

1. Configuración del Servicio DHCP en Servidor 1:
   - Abrir Servidor 1 > Pestaña Services > seleccionar DHCP.
   - Poner el interruptor "Service" en ON.
   - Seleccionar el pool predeterminado "serverPool" y rellenar los parámetros:
     * Pool Name: serverPool
     * Default Gateway: 192.168.X.254
     * DNS Server: 192.168.X.1
     * Start IP Address: 192.168.X.100 (evita conflicto con Servidor1 .1, Servidor2 .2 y PCs fijas)
     * Subnet Mask: 255.255.255.0
     * Maximum number of Users: 50 (o valor adecuado)
   - Presionar el botón "Save" (Guardar) para actualizar el pool.

2. Configuración y prueba desde la PC3:
   - Abrir PC3 > Pestaña Desktop > IP Configuration.
   - En el bloque "IP Configuration", cambiar la opción de "Static" a "DHCP".
   - Esperar la negociación de 4 pasos DORA (Discover, Offer, Request, ACK).
   - Verificar que al lado del selector aparezca el mensaje en texto verde/negro:
     "DHCP request successful."
   - Comprobar que los campos se autorellenen:
     * IPv4 Address: 192.168.X.102 (o primera IP libre del rango)
     * Subnet Mask: 255.255.255.0
     * Default Gateway: 192.168.X.254
     * DNS Server: 192.168.X.1

3. Verificación adicional por consola (Command Prompt de PC3):
   - Ejecutar: ipconfig /all
     Comprueba la concesión completa de dirección, máscara, gateway y DNS.
   - Ejecutar: ping 192.168.X.1
     Comprueba conectividad bidireccional con el servidor DHCP.`,
      queDeberiaVerse: `EVIDENCIA Y MENSAJES EN PANTALLA:
- Ventana "IP Configuration" de PC3 (FastEthernet0):
  * Radio button seleccionado: (●) DHCP
  * Mensaje de estado: "DHCP request successful."
  * IPv4 Address: 192.168.10.102 (o 192.168.X.xxx)
  * Subnet Mask: 255.255.255.0
  * Default Gateway: 192.168.10.254
  * DNS Server: 192.168.10.1
- En Command Prompt de PC3 con 'ipconfig /all':
  * FastEthernet0 Connection:
    - IP Address: 192.168.X.102
    - Subnet Mask: 255.255.255.0
    - Default Gateway: 192.168.X.254
    - DNS Servers: 192.168.X.1`,
      erroresTipicos: [
        "Pulsar 'Add' en vez de 'Save', creando un pool duplicado que Packet Tracer no atiende.",
        "Empezar la IP inicial en 192.168.X.1 o .2 generando conflicto de IP con los servidores.",
        "Olvidar colocar el Default Gateway (192.168.X.254) o el DNS Server en la plantilla del pool.",
        "Si sale 'DHCP failed. APIPA is being used (169.254.x.x)', significa que el servicio DHCP está en OFF o el enlace de switch está en estado blocking (naranja/STP).",
        "Olvidar encender el interruptor 'Service: ON'."
      ],
      comandosPrueba: [
        { cmd: "ipconfig /all", desc: "Muestra IP, máscara, gateway y DNS otorgados por DHCP" },
        { cmd: "ipconfig /release", desc: "Libera la dirección IP asignada por DHCP" },
        { cmd: "ipconfig /renew", desc: "Solicita una nueva concesión DHCP (repite DORA)" },
        { cmd: "ping 192.168.X.1", desc: "Prueba conectividad con el Servidor DHCP" }
      ]
    },

    {
      id: "p3",
      numero: 3,
      titulo: "Pregunta 3: Servicio de Correo Electrónico en Servidor 2 (5 puntos)",
      enunciado: "Configure el servicio de Correo electrónico en el servidor 2, con el dominio minombre.com.pe. Realice pruebas de conectividad que demuestre este servicio entre la PC2 Y Pc3. Tal como las imágenes de ejemplo.",
      puntosTotal: 5,
      contexto: "Servidor 2 (IP 192.168.X.2) ejecuta servicio EMAIL con protocolos SMTP (envío, TCP 25) y POP3 (descarga, TCP 110). Se comunican clientes PC2 y PC3.",
      puntosClave: [
        { id: "p3_1", texto: "Ruta de configuración en Servidor 2 (Services > EMAIL) y activación de servicios (SMTP: ON, POP3: ON)", valor: 1.0 },
        { id: "p3_2", texto: "Configuración del dominio: escribir 'teofilo.com.pe' (o minombre.com.pe) y presionar el botón 'Set'", valor: 1.0 },
        { id: "p3_3", texto: "Creación de cuentas de usuario: User 'r1' y User 'r2' con contraseñas respectivas pulsando '+'", valor: 1.0 },
        { id: "p3_4", texto: "Configuración de cliente en PC2 y PC3 (Desktop > Mail Browser > Configure Mail): Incoming/Outgoing = 192.168.X.2", valor: 1.0 },
        { id: "p3_5", texto: "Prueba de envío y recepción cruzada: Compose de r1 a r2, 'Send Success', Receive en PC3 y respuesta inversa", valor: 1.0 }
      ],
      respuestaModelo: `PASOS DE CONFIGURACIÓN A ESCRIBIR EN HOJA:

1. Configuración IP del Servidor 2:
   - Desktop > IP Configuration:
     * IP Address: 192.168.X.2
     * Subnet Mask: 255.255.255.0
     * Default Gateway: 192.168.X.254
     * DNS Server: 192.168.X.1

2. Configuración del Servicio E-MAIL en Servidor 2:
   - Ir a la pestaña Services > EMAIL.
   - Asegurar que los dos servicios estén encendidos:
     * SMTP Service: ON (envío de correos, TCP 25)
     * POP3 Service: ON (recepción/descarga, TCP 110)
   - En "Domain Name":
     * Escribir: teofilo.com.pe (o el nombre solicitado: minombre.com.pe)
     * Hacer clic obligatorio en el botón "Set".
   - En "User Setup" crear dos usuarios:
     * User: r1  |  Password: 123 (o cisco) -> Clic en [+]
     * User: r2  |  Password: 123 (o cisco) -> Clic en [+]

3. Configuración del Cliente de Correo en PC2:
   - Abrir PC2 > Desktop > E-mail (Mail Browser).
   - Clic en "Configure Mail" (o aparece formulario si es primera vez):
     * Your Name: PC2 - Usuario 1
     * E-mail Address: r1@teofilo.com.pe
     * Incoming Mail Server: 192.168.X.2
     * Outgoing Mail Server (SMTP): 192.168.X.2
     * User Name: r1
     * Password: 123
   - Clic en "Save".

4. Configuración del Cliente de Correo en PC3:
   - Abrir PC3 > Desktop > E-mail (Mail Browser).
   - Clic en "Configure Mail":
     * Your Name: PC3 - Usuario 2
     * E-mail Address: r2@teofilo.com.pe
     * Incoming Mail Server: 192.168.X.2
     * Outgoing Mail Server (SMTP): 192.168.X.2
     * User Name: r2
     * Password: 123
   - Clic en "Save".

5. Pruebas de conectividad y demostración:
   - En PC2: Clic en "Compose".
     * To: r2@teofilo.com.pe
     * Subject: Envio de Prueba1
     * Cuerpo: Mensaje de prueba desde PC2
     * Clic en "Send".
     * En la barra inferior debe mostrar: "Send Success".
   - En PC3: Abrir Mail Browser y presionar el botón "Receive".
     * En la bandeja debe aparecer el correo de r1@teofilo.com.pe con asunto "Envio de Prueba1".
   - En PC3: Seleccionar el correo recibido, presionar "Reply" (o Compose a r1), asunto: "Este es una prueba de regreso", y pulsar "Send" ("Send Success").
   - En PC2: Pulsar "Receive" y comprobar la llegada de la respuesta.`,
      queDeberiaVerse: `EVIDENCIA Y MENSAJES EN PANTALLA:
- En Mail Browser de PC2 al enviar:
  * Barra inferior: "Sending mail to r2@teofilo.com.pe with subject: Envio de Prueba1... Send Success"
- En Mail Browser de PC3 al presionar [Receive]:
  * Barra inferior: "Receiving mail from POP3 Server 192.168.X.2... Receive Mail Success"
  * Lista de mensajes en la tabla:
    - From: r1@teofilo.com.pe
    - Subject: Envio de Prueba1
    - Date/Time: [Fecha y hora de simulación]
- En Mail Browser de PC3 al responder:
  * "Sending mail to r1@teofilo.com.pe with subject: Este es una prueba de regreso... Send Success"`,
      erroresTipicos: [
        "Olvidar hacer clic en el botón 'Set' tras escribir el Domain Name (el dominio no queda registrado).",
        "Poner en Incoming/Outgoing Mail Server el nombre de dominio sin haber creado un registro DNS para ese dominio (usar la IP 192.168.X.2 garantiza que funcione directamente).",
        "Olvidar presionar el botón '+' para agregar a cada usuario a la lista.",
        "Confundir los roles de protocolos: SMTP es para envío (TCP 25) y POP3 es para descarga (TCP 110).",
        "Escribir contraseñas distintas en el servidor y en la configuración del cliente."
      ],
      comandosPrueba: [
        { cmd: "ping 192.168.X.2", desc: "Comprueba conectividad IP desde la PC al Servidor de Correo" },
        { cmd: "ipconfig /all", desc: "Verifica que la PC tenga IP válida para alcanzar al servidor" }
      ]
    },

    {
      id: "p4",
      numero: 4,
      titulo: "Pregunta 4: Conectividad y Enrutamiento con Router 2811, Teléfonos IP y Laptop (5 puntos)",
      enunciado: "Configure y realice pruebas de conectividad que demuestre este servicio entre todas las Pc, además de Laptop.",
      puntosTotal: 5,
      contexto: "Router Cisco 2811 interconecta dos redes: Fa0/0 (LAN 1: 192.168.X.0/24 con PCs y Servidores) y Fa0/1 (LAN 2: 192.169.1.0/24 con Switch, 2 teléfonos IP 7960 ext 1000 y 2000, y Laptop). NOTA: En la hoja el servicio no está nombrado. Hipótesis sin confirmar: Telefonía IP (VoIP) o conectividad/enrutamiento general.",
      puntosClave: [
        { id: "p4_1", texto: "Configuración de la interfaz Fa0/0 del Router 2811: IP 192.168.X.254 /24 y comando 'no shutdown'", valor: 1.0 },
        { id: "p4_2", texto: "Configuración de la interfaz Fa0/1 del Router 2811: IP 192.169.1.1 /24 y comando 'no shutdown'", valor: 1.0 },
        { id: "p4_3", texto: "Configuración IP de la Laptop L1 (IP: 192.169.1.10, Máscara: 255.255.255.0, Gateway: 192.169.1.1, DNS: 192.168.X.1)", valor: 1.0 },
        { id: "p4_4", texto: "Pruebas de conectividad ICMP (ping) cruzado entre todas las PCs (PC1-PC4) y la Laptop a través del Router 2811", valor: 1.0 },
        { id: "p4_5", texto: "Explicación del servicio: Enrutamiento inter-red básico Y comandos de Telefonía IP CME si el docente evaluaba VoIP", valor: 1.0 }
      ],
      respuestaModelo: `PASOS DE CONFIGURACIÓN A ESCRIBIR EN HOJA:

-- ENFOQUE A: ENRUTAMIENTO Y CONECTIVIDAD TOTAL (Material oficial S14/S15) --

1. Configuración de Interfaces en el Router Cisco 2811 (R1):
   Router> enable
   Router# configure terminal
   Router(config)# hostname R1
   ! Interfaz hacia la LAN de PCs y Servidores:
   R1(config)# interface FastEthernet0/0
   R1(config-if)# ip address 192.168.X.254 255.255.255.0
   R1(config-if)# no shutdown
   R1(config-if)# exit
   ! Interfaz hacia la LAN de Telefonía y Laptop:
   R1(config)# interface FastEthernet0/1
   R1(config-if)# ip address 192.169.1.1 255.255.255.0
   R1(config-if)# no shutdown
   R1(config-if)# exit

2. Configuración de la Laptop (L1):
   - Desktop > IP Configuration:
     * IP Address: 192.169.1.10
     * Subnet Mask: 255.255.255.0
     * Default Gateway: 192.169.1.1
     * DNS Server: 192.168.X.1

3. Pruebas de conectividad:
   - Desde Laptop (Command Prompt):
     ping 192.168.X.254 (Gateway remoto - R1 Fa0/0)
     ping 192.168.X.1   (Servidor 1)
     ping 192.168.X.102 (PC3)
   - Desde PC1 / PC3:
     ping 192.169.1.10  (Laptop)

-- ENFOQUE B: HIPÓTESIS SIN CONFIRMAR - TELEFONÍA IP (VOIP / CME) --
(Por la presencia de teléfonos 7960 con extensiones 1000 y 2000 en la hoja):

1. Configuración de DHCP para Teléfonos IP en el Router 2811:
   R1(config)# ip dhcp pool TELEFONIA
   R1(dhcp-config)# network 192.169.1.0 255.255.255.0
   R1(dhcp-config)# default-router 192.169.1.1
   R1(dhcp-config)# option 150 ip 192.169.1.1
   R1(dhcp-config)# exit

2. Configuración de Telefonía en Router 2811 (Cisco CallManager Express):
   R1(config)# telephony-service
   R1(config-telephony)# max-ephones 5
   R1(config-telephony)# max-dn 5
   R1(config-telephony)# ip source-address 192.169.1.1 port 2000
   R1(config-telephony)# auto assign 1 to 2
   R1(config-telephony)# exit
   ! Asignar extensión 1000:
   R1(config)# ephone-dn 1
   R1(config-ephone-dn)# number 1000
   R1(config-ephone-dn)# exit
   ! Asignar extensión 2000:
   R1(config)# ephone-dn 2
   R1(config-ephone-dn)# number 2000
   R1(config-ephone-dn)# exit

3. Configuración en Switch 3 (VLAN de Voz):
   Switch(config)# interface range fa0/2 - 3
   Switch(config-if-range)# switchport mode access
   Switch(config-if-range)# switchport voice vlan 1
   Switch(config-if-range)# exit

4. Prueba del servicio de Telefonía:
   - Conectar cable de energía en los teléfonos 7960 (Physical view).
   - Esperar registro: En pantalla del teléfono 1 debe verse '1000' y en teléfono 2 '2000'.
   - Levantar auricular en Teléfono 1, marcar '2000' y verificar llamada sonando ('Ring Out' y 'From 1000').`,
      queDeberiaVerse: `EVIDENCIA Y MENSAJES EN PANTALLA:
- Para Conectividad IP:
  * Salida de ping exitoso en Command Prompt:
    "Reply from 192.169.1.10: bytes=32 time<1ms TTL=127"
    "Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)"
- Para Telefonía IP (si aplica VoIP):
  * Pantalla de los teléfonos IP 7960 en Packet Tracer:
    - Teléfono 1: muestra arriba a la derecha su número "1000" y estado "Configured".
    - Teléfono 2: muestra "2000" y estado "Configured".
  * Al marcar desde el teléfono 1 el 2000:
    - Teléfono 1: muestra "Ring Out 2000".
    - Teléfono 2: parpadea en rojo/verde con mensaje "From 1000". Al contestar: "Connected".`,
      erroresTipicos: [
        "Olvidar ejecutar 'no shutdown' en las interfaces Fa0/0 y Fa0/1 del Router 2811 (los puertos quedan en rojo).",
        "Poner mal las máscaras de subred (debe ser 255.255.255.0 en ambas interfaces).",
        "Olvidar configurar el Default Gateway en la Laptop (192.169.1.1) impidiendo que salga de su subred.",
        "En VoIP: olvidar conectar el eliminador de corriente (Power Adapter) al teléfono 7960 en la vista física de Packet Tracer.",
        "En VoIP: olvidar el comando 'option 150 ip <ip-router>' en el pool DHCP del router, sin el cual el teléfono no encuentra el servidor TFTP/CME."
      ],
      comandosPrueba: [
        { cmd: "show ip interface brief", desc: "Verifica que Fa0/0 y Fa0/1 estén Up/Up" },
        { cmd: "ping 192.169.1.10", desc: "Prueba conectividad hacia la Laptop desde una PC" },
        { cmd: "show ip route", desc: "Muestra las dos redes directamente conectadas (C)" }
      ]
    }
  ],

  // 2. HOJAS DE REFERENCIA RÁPIDA (PLANTILLAS ESTÁNDAR)
  plantillas: [
    {
      servicio: "DNS (Domain Name System)",
      icono: "🌐",
      puerto: "UDP/TCP 53",
      dispositivo: "Servidor 1 (Server-PT)",
      pestaña: "Services > DNS",
      secuenciaPasos: [
        "1. Asignar IP fija, máscara, gateway y DNS (127.0.0.1 o propia IP) en Desktop > IP Configuration.",
        "2. Ir a Services > DNS y marcar 'DNS Service: ON'.",
        "3. En 'Name' escribir el FQDN (ej. apellido.utp.com).",
        "4. En 'Type' seleccionar 'A Record'.",
        "5. En 'Address' colocar la IP del servidor destino (ej. 192.168.X.1).",
        "6. Pulsar el botón 'Add' (repetir por cada dominio adicional).",
        "7. En las PCs clientes, asegurar que el campo 'DNS Server' apunte a la IP de este servidor.",
        "8. Probar con 'nslookup dominio' en CMD y abriendo la URL en el Web Browser."
      ],
      camposClave: [
        { campo: "DNS Service", valorEjemplo: "ON", nota: "Obligatorio" },
        { campo: "Name", valorEjemplo: "correa.utp.com", nota: "Sin http:// ni barras" },
        { campo: "Type", valorEjemplo: "A Record", nota: "Mapeo de nombre a IPv4" },
        { campo: "Address", valorEjemplo: "192.168.10.1", nota: "IP del servidor web" }
      ],
      comandosPrueba: ["nslookup correa.utp.com", "ping correa.utp.com", "ipconfig /all"]
    },

    {
      servicio: "DHCP (Dynamic Host Configuration Protocol)",
      icono: "📡",
      puerto: "UDP 67 (Server), UDP 68 (Client)",
      dispositivo: "Servidor 1 (Server-PT)",
      pestaña: "Services > DHCP",
      secuenciaPasos: [
        "1. Asignar IP fija al servidor (ej. 192.168.X.1 /24).",
        "2. Ir a Services > DHCP y marcar 'Service: ON'.",
        "3. Seleccionar el pool 'serverPool'.",
        "4. Llenar Default Gateway (192.168.X.254) y DNS Server (192.168.X.1).",
        "5. Definir Start IP Address (ej. 192.168.X.100) y Subnet Mask (255.255.255.0).",
        "6. Definir Maximum number of Users (ej. 50).",
        "7. Pulsar el botón 'Save' para guardar cambios en el pool.",
        "8. En la PC cliente, ir a Desktop > IP Configuration y marcar 'DHCP'.",
        "9. Verificar el mensaje 'DHCP request successful.' y parámetros con 'ipconfig /all'."
      ],
      camposClave: [
        { campo: "Service", valorEjemplo: "ON", nota: "Obligatorio" },
        { campo: "Pool Name", valorEjemplo: "serverPool", nota: "Pool por defecto" },
        { campo: "Default Gateway", valorEjemplo: "192.168.10.254", nota: "IP del Router Fa0/0" },
        { campo: "DNS Server", valorEjemplo: "192.168.10.1", nota: "IP del Servidor DNS" },
        { campo: "Start IP Address", valorEjemplo: "192.168.10.100", nota: "Evita colisión con estáticas" },
        { campo: "Subnet Mask", valorEjemplo: "255.255.255.0", nota: "Máscara /24" }
      ],
      comandosPrueba: ["ipconfig /all", "ipconfig /release", "ipconfig /renew"]
    },

    {
      servicio: "Correo Electrónico (E-MAIL: SMTP / POP3)",
      icono: "✉️",
      puerto: "SMTP: TCP 25 | POP3: TCP 110",
      dispositivo: "Servidor 2 (Server-PT)",
      pestaña: "Services > EMAIL",
      secuenciaPasos: [
        "1. Asignar IP fija al Servidor 2 (192.168.X.2 /24, Gateway: 192.168.X.254).",
        "2. Ir a Services > EMAIL y activar SMTP Service: ON y POP3 Service: ON.",
        "3. En 'Domain Name' ingresar el dominio (ej. teofilo.com.pe) y pulsar 'Set'.",
        "4. En 'User Setup' ingresar User (ej. r1) y Password (ej. 123) y pulsar '+'.",
        "5. Repetir para el segundo usuario (User: r2, Password: 123, pulsar '+').",
        "6. En PC2 > Desktop > E-mail > Configure Mail: Name, r1@dominio, servidor 192.168.X.2 (Incoming/Outgoing), r1 y pass.",
        "7. En PC3 > Desktop > E-mail > Configure Mail: Name, r2@dominio, servidor 192.168.X.2, r2 y pass.",
        "8. Redactar (Compose) de PC2 a PC3, presionar Send ('Send Success') y en PC3 presionar Receive."
      ],
      camposClave: [
        { campo: "SMTP Service / POP3 Service", valorEjemplo: "ON / ON", nota: "Ambos activos" },
        { campo: "Domain Name", valorEjemplo: "teofilo.com.pe", nota: "Presionar botón 'Set'" },
        { campo: "User Setup", valorEjemplo: "r1 / 123 y r2 / 123", nota: "Presionar botón '+'" },
        { campo: "Incoming / Outgoing Server", valorEjemplo: "192.168.10.2", nota: "IP del Servidor 2" }
      ],
      comandosPrueba: ["ping 192.168.X.2", "ipconfig /all"]
    },

    {
      servicio: "Enrutamiento Cisco y Telefonía IP (Hipótesis sin Confirmar)",
      icono: "📞",
      puerto: "SCCP: TCP 2000 / RTP: UDP",
      dispositivo: "Router Cisco 2811 y Switch 3",
      pestaña: "CLI (Command Line Interface)",
      secuenciaPasos: [
        "1. Router 2811: Configurar Fa0/0 con IP 192.168.X.254 255.255.255.0 y 'no shutdown'.",
        "2. Router 2811: Configurar Fa0/1 con IP 192.169.1.1 255.255.255.0 y 'no shutdown'.",
        "3. Laptop: Asignar IP 192.169.1.10 /24 con Gateway 192.169.1.1.",
        "4. Probar conectividad inter-red con 'ping' entre Laptop y PCs.",
        "5. (Si evalúan VoIP): Crear pool DHCP con 'option 150 ip 192.169.1.1' para teléfonos.",
        "6. (Si evalúan VoIP): En 'telephony-service' definir max-ephones, max-dn, ip source-address 192.169.1.1 port 2000, auto assign.",
        "7. (Si evalúan VoIP): Crear ephone-dn 1 con number 1000 y ephone-dn 2 con number 2000.",
        "8. Conectar el adaptador de poder a los teléfonos 7960 en la vista física y llamar entre extensiones."
      ],
      camposClave: [
        { campo: "Fa0/0 IP (Gateway LAN 1)", valorEjemplo: "192.168.10.254 255.255.255.0", nota: "no shutdown" },
        { campo: "Fa0/1 IP (Gateway LAN 2)", valorEjemplo: "192.169.1.1 255.255.255.0", nota: "no shutdown" },
        { campo: "DHCP Option 150", valorEjemplo: "option 150 ip 192.169.1.1", nota: "Apunta al TFTP/CME" },
        { campo: "Extensiones", valorEjemplo: "1000 y 2000", nota: "Configuradas en ephone-dn" }
      ],
      comandosPrueba: ["show ip interface brief", "show ip route", "ping 192.169.1.10"]
    }
  ],

  // 3. VARIANTES ALEATORIAS DEL EXAMEN
  variantesBase: {
    apellidos1: ["Correa", "Flores", "Gómez", "Torres", "Morales", "Vargas", "Rojas", "Díaz", "Castro", "Mendoza"],
    apellidos2: ["Calle", "Paredes", "Salazar", "Reyes", "Guerrero", "Navarro", "Soto", "Chávez", "Huamán", "Silva"],
    nombres: ["Teófilo", "Roberto", "Carlos", "Luis", "Ana", "Patricia", "Jorge", "Manuel", "Elena", "Sofía"],
    valoresX: [10, 20, 30, 40, 50, 60, 100],
    dominios: ["utp.edu.pe", "teofilo.com.pe", "datacenter.com.pe", "redesutp.com.pe", "soluciones.com.pe"],
    paresExtensiones: [
      { ext1: "1000", ext2: "2000" },
      { ext1: "1001", ext2: "1002" },
      { ext1: "2001", ext2: "2002" },
      { ext1: "3001", ext2: "3002" }
    ]
  },

  // 4. ENTRENADOR DE COMANDOS ESCRITOS Y COMPLETAR
  comandosDrill: [
    {
      id: "cmd_ref_1",
      tipo: "escribir",
      categoria: "Router 2811 - Interfaces",
      enunciado: "Escribe el comando para ingresar a la interfaz FastEthernet 0/0 en el Router 2811:",
      prompt: "Router(config)# ",
      comandoCorrecto: "interface FastEthernet 0/0",
      aliasValidos: [
        "interface fastethernet 0/0",
        "interface fastethernet0/0",
        "interface fa0/0",
        "int fa0/0",
        "int fastethernet 0/0",
        "int fastethernet0/0",
        "inter fa0/0"
      ],
      explicacion: "Ingresa al modo de configuración de interfaz para asignar IP y habilitar el puerto."
    },
    {
      id: "cmd_ref_2",
      tipo: "escribir",
      categoria: "Router 2811 - Interfaces",
      enunciado: "Asigna la IP 192.168.10.254 con máscara de 24 bits (/24) a la interfaz del router:",
      prompt: "Router(config-if)# ",
      comandoCorrecto: "ip address 192.168.10.254 255.255.255.0",
      aliasValidos: [
        "ip address 192.168.10.254 255.255.255.0",
        "ip add 192.168.10.254 255.255.255.0"
      ],
      explicacion: "Define la dirección IPv4 que actuará como Default Gateway de la red LAN."
    },
    {
      id: "cmd_ref_3",
      tipo: "escribir",
      categoria: "Router 2811 - Interfaces",
      enunciado: "Escribe el comando para encender/habilitar la interfaz y pasarla a estado Up/Up:",
      prompt: "Router(config-if)# ",
      comandoCorrecto: "no shutdown",
      aliasValidos: [
        "no shutdown",
        "no shut",
        "no sh"
      ],
      explicacion: "Por defecto en los routers Cisco las interfaces están 'administratively down'. 'no shutdown' las activa."
    },
    {
      id: "cmd_ref_4",
      tipo: "escribir",
      categoria: "Diagnóstico PC",
      enunciado: "En la consola (Command Prompt) de una PC, ¿qué comando muestra la IP, máscara, Default Gateway y servidor DNS asignados por DHCP?",
      prompt: "C:\\> ",
      comandoCorrecto: "ipconfig /all",
      aliasValidos: [
        "ipconfig /all",
        "ipconfig/all"
      ],
      explicacion: "'ipconfig /all' brinda el detalle completo de direccionamiento, puerta de enlace y DNS asignado."
    },
    {
      id: "cmd_ref_5",
      tipo: "escribir",
      categoria: "Diagnóstico DNS",
      enunciado: "En la consola de la PC1, ¿qué comando consulta directamente al servidor DNS la resolución del dominio correa.utp.com?",
      prompt: "C:\\> ",
      comandoCorrecto: "nslookup correa.utp.com",
      aliasValidos: [
        "nslookup correa.utp.com"
      ],
      explicacion: "'nslookup' interroga al servidor DNS configurado para comprobar si resuelve el nombre a una IP."
    },
    {
      id: "cmd_ref_6",
      tipo: "completar",
      categoria: "DHCP en Router",
      enunciado: "Completa el comando para excluir el rango de IPs de la 192.168.10.1 a la 192.168.10.10 de la asignación automática:",
      textoAntes: "Router(config)# ip dhcp ",
      textoDespues: " 192.168.10.1 192.168.10.10",
      palabraFaltante: "excluded-address",
      aliasValidos: ["excluded-address", "excl", "exclude-address"],
      explicacion: "'ip dhcp excluded-address <inicio> <fin>' reserva IPs para servidores y routers."
    },
    {
      id: "cmd_ref_7",
      tipo: "completar",
      categoria: "DHCP en Router",
      enunciado: "Dentro del pool de DHCP, completa el comando para configurar la puerta de enlace predeterminada 192.168.10.254:",
      textoAntes: "Router(dhcp-config)# ",
      textoDespues: " 192.168.10.254",
      palabraFaltante: "default-router",
      aliasValidos: ["default-router", "def"],
      explicacion: "'default-router' especifica el Gateway que se entregará a los clientes DHCP."
    },
    {
      id: "cmd_ref_8",
      tipo: "completar",
      categoria: "DHCP en Router",
      enunciado: "Dentro del pool de DHCP, completa el comando para especificar la dirección del servidor DNS 192.168.10.1:",
      textoAntes: "Router(dhcp-config)# ",
      textoDespues: " 192.168.10.1",
      palabraFaltante: "dns-server",
      aliasValidos: ["dns-server", "dns"],
      explicacion: "'dns-server' entrega a los clientes la IP a la que deben enviar sus consultas de resolución de nombres."
    },
    {
      id: "cmd_ref_9",
      tipo: "completar",
      categoria: "Telefonía IP (CME)",
      enunciado: "En un router con CallManager Express, ¿qué comando entra al modo de configuración general de telefonía IP?",
      textoAntes: "Router(config)# ",
      textoDespues: "",
      palabraFaltante: "telephony-service",
      aliasValidos: ["telephony-service"],
      explicacion: "'telephony-service' activa las capacidades de centralita VoIP en routers Cisco."
    },
    {
      id: "cmd_ref_10",
      tipo: "completar",
      categoria: "Telefonía IP (CME)",
      enunciado: "Para asignar el número de extensión 1000 al directorio ephone-dn 1, completa el comando:",
      textoAntes: "Router(config-ephone-dn)# ",
      textoDespues: " 1000",
      palabraFaltante: "number",
      aliasValidos: ["number", "num"],
      explicacion: "'number <extensión>' define el número telefónico que marcarán otros teléfonos para comunicarse."
    }
  ],

  // 5. BANCO DE PREGUNTAS TEÓRICAS COMPLEMENTARIAS
  preguntasTeoricasNuevas: [
    {
      id: "pref_t1",
      semana: 13,
      tipo: "opcion_multiple",
      enunciado: "¿En qué menú y pestaña de un Servidor en Cisco Packet Tracer se configuran los registros de nombres de dominio y sus direcciones IP asociadas?",
      opciones: [
        "Config > FastEthernet0 > DNS Settings",
        "Services > DNS > Resource Records",
        "Desktop > Command Prompt > nslookup add",
        "Services > HTTP > index.html"
      ],
      correcta: 1,
      explicacion: "En Packet Tracer los servicios de red se gestionan en la pestaña 'Services'. El servicio DNS contiene la tabla 'Resource Records' donde se ingresa el nombre, el tipo (A Record) y la IP.",
      cita: "Semana 13 / 14: Configuración de Servicios de Capa de Aplicación en Packet Tracer"
    },
    {
      id: "pref_t2",
      semana: 14,
      tipo: "opcion_multiple",
      enunciado: "¿Qué mensaje exacto de confirmación muestra la ventana Desktop > IP Configuration de una PC en Packet Tracer cuando el servidor DHCP responde exitosamente a la solicitud?",
      opciones: [
        "DHCP IP assigned correctly.",
        "DHCP request successful.",
        "Connection established to DHCP Server.",
        "DORA handshake completed."
      ],
      correcta: 1,
      explicacion: "En Cisco Packet Tracer, al seleccionar el botón de opción DHCP, el software emite 'DHCP request successful.' si la negociación DORA culminó con un DHCPACK. Si falla, indica 'DHCP failed. APIPA is being used.'",
      cita: "Semana 14: Protocolo DHCP y Prácticas de Laboratorio"
    },
    {
      id: "pref_t3",
      semana: 14,
      tipo: "opcion_multiple",
      enunciado: "Al configurar una cuenta en el cliente Mail Browser de una PC, ¿qué protocolos y puertos de Capa de Transporte intervienen respectivamente en el servidor de correo entrante (Incoming) y saliente (Outgoing)?",
      opciones: [
        "Incoming: SMTP (TCP 25) | Outgoing: POP3 (TCP 110)",
        "Incoming: POP3 (TCP 110) | Outgoing: SMTP (TCP 25)",
        "Incoming: IMAP (UDP 143) | Outgoing: SMTP (UDP 25)",
        "Incoming: HTTP (TCP 80) | Outgoing: FTP (TCP 21)"
      ],
      correcta: 1,
      explicacion: "POP3 (Post Office Protocol v3) opera en TCP 110 para descargar el correo del servidor (Incoming), mientras que SMTP (Simple Mail Transfer Protocol) opera en TCP 25 para remitir correos hacia el servidor (Outgoing).",
      cita: "Semana 14: Protocolos de Correo Electrónico (SMTP, POP3, IMAP)"
    },
    {
      id: "pref_t4",
      semana: 15,
      tipo: "opcion_multiple",
      enunciado: "¿Por qué una interfaz recién configurada con 'ip address' en un router Cisco 2811 permanece con el enlace físico en color rojo en la topología de Packet Tracer?",
      opciones: [
        "Porque falta configurar una ruta estática en el router.",
        "Porque por defecto las interfaces de los routers Cisco están en estado administrativo apagado ('administratively down') y requieren el comando 'no shutdown'.",
        "Porque los cables de red en Packet Tracer requieren obligatoriamente conectores de fibra óptica.",
        "Porque el switch del otro extremo debe estar configurado en modo VTP Server."
      ],
      correcta: 1,
      explicacion: "A diferencia de los switches donde los puertos están activos ('no shutdown') por defecto, en los routers Cisco todas las interfaces vienen deshabilitadas ('shutdown') por seguridad.",
      cita: "Semanas 12, 14 y 15: Configuración Básica de Dispositivos Cisco IOS"
    },
    {
      id: "pref_t5",
      semana: 13,
      tipo: "opcion_multiple",
      enunciado: "¿Cuál es la utilidad principal del comando 'nslookup' frente al comando 'ping' al verificar un servicio web?",
      opciones: [
        "nslookup mide el retardo de ida y vuelta (RTT), mientras que ping solo descarga código HTML.",
        "nslookup consulta exclusivamente al servidor DNS para comprobar si el nombre resuelve a una IP, aislando fallas de DNS de posibles fallas de conectividad o de servidor web caído.",
        "nslookup envía paquetes ICMP Echo Request para validar que el router intermedio esté encendido.",
        "nslookup se utiliza únicamente para configurar servidores DHCP en la nube."
      ],
      correcta: 1,
      explicacion: "Si 'ping nombre' falla, no sabemos si falló el DNS o falló la conectividad ICMP o el servidor está apagado. Con 'nslookup nombre' probamos directamente la resolución DNS de Capa de Aplicación.",
      cita: "Semana 13: Capa de Aplicación y Diagnóstico de Red"
    },
    {
      id: "pref_t6",
      semana: 14,
      tipo: "verdadero_falso",
      enunciado: "Si en el Servidor DHCP se define como Start IP la dirección 192.168.10.1, y esa misma IP está asignada estáticamente al Servidor 1, no habrá ningún problema porque el servidor DHCP detecta automáticamente sus propias IPs y no las entrega.",
      esVerdadero: false,
      explicacion: "Falso. En el servicio DHCP de servidores genéricos de Packet Tracer, si la IP inicial coincide con una IP ya asignada, se generará un conflicto de dirección IP ('IP address conflict') en la red. Se debe iniciar el rango por encima de las IPs estáticas o usar exclusiones.",
      cita: "Semana 14: DHCP y Administración de Direcciones"
    },
    {
      id: "pref_t7",
      semana: 15,
      tipo: "verdadero_falso",
      enunciado: "Para que una PC en la subred 192.168.10.0/24 pueda comunicarse exitosamente mediante ping con una Laptop en la subred 192.169.1.0/24, ambas deben tener configurado como Default Gateway la dirección IP de la interfaz del router conectada a su propia subred local.",
      esVerdadero: true,
      explicacion: "Verdadero. Al tratarse de dos redes lógicas distintas, los dispositivos terminales no pueden resolver la MAC destino por ARP local; deben enviar las tramas dirigidas a la MAC de su Default Gateway (el router 2811), quien enrutará los paquetes entre subredes.",
      cita: "Semana 15: Enrutamiento Inter-Red y Puertas de Enlace"
    }
  ]
};

// Generador de variantes aleatorias
function generarVarianteExamenPC3() {
  const vb = PC3_REF_DATA.variantesBase;
  const ap1 = vb.apellidos1[Math.floor(Math.random() * vb.apellidos1.length)];
  const ap2 = vb.apellidos2[Math.floor(Math.random() * vb.apellidos2.length)];
  const nom = vb.nombres[Math.floor(Math.random() * vb.nombres.length)];
  const x = vb.valoresX[Math.floor(Math.random() * vb.valoresX.length)];
  const dom = vb.dominios[Math.floor(Math.random() * vb.dominios.length)];
  const parExt = vb.paresExtensiones[Math.floor(Math.random() * vb.paresExtensiones.length)];
  
  const ap1Lower = ap1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ap2Lower = ap2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nomLower = nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return {
    alumno: {
      nombre: nom,
      primerApellido: ap1,
      segundoApellido: ap2,
      nombreCompleto: `${nom.toUpperCase()} ${ap1.toUpperCase()} ${ap2.toUpperCase()}`
    },
    red: {
      x: x,
      lan1Red: `192.168.${x}.0/24`,
      servidor1IP: `192.168.${x}.1`,
      servidor2IP: `192.168.${x}.2`,
      gatewayLAN1: `192.168.${x}.254`,
      rangoDHCPStart: `192.168.${x}.100`,
      pcAsignadaDHCP: `192.168.${x}.102`,
      lan2Red: "192.169.1.0/24",
      gatewayLAN2: "192.169.1.1",
      laptopIP: "192.169.1.10"
    },
    dominios: {
      dns1: `${ap1Lower}.utp.com`,
      dns2: `${ap2Lower}.utp.com`,
      correoDominio: `${nomLower}.com.pe`,
      cuenta1: `r1@${nomLower}.com.pe`,
      cuenta2: `r2@${nomLower}.com.pe`
    },
    telefonia: {
      ext1: parExt.ext1,
      ext2: parExt.ext2
    }
  };
}
