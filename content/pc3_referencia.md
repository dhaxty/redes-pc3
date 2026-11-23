# Transcripción y Análisis: Examen de Referencia PC3 (Examen Físico en Hoja)

> **Aviso Importante**: Este examen proviene de una captura de referencia externa (formato impreso en hoja de la UTP, curso Redes y Comunicación de Datos I - 100000I41N). En los exámenes presenciales en hoja, las respuestas se escriben a mano describiendo pasos de configuración, valores de parámetros, comandos Cisco IOS / CLI y resultados esperados en pantalla.

---

## 1. Encabezado del Examen (Imagen PC3-1.png)
- **Institución**: Universidad Tecnológica del Perú (UTP)
- **Código y Asignatura**: 100000I41N - REDES Y COMUNICAC DE DATOS 1
- **Evaluación**: PRÁCTICA CALIFICADA No. 3
- **Área**: ING. DE SISTEMAS E INFORMÁTICA
- **Periodo**: CICLO 2 AGOSTO (o Marzo/Agosto) | Fila: ÚNICA
- **Puntaje total**: 4 preguntas de 5 puntos cada una = **20 puntos**.
- **Indicaciones**:
  * Prohibido el uso de celulares y material de clase o separatas.
  * La ortografía, redacción y claridad técnica son tomadas en cuenta en la calificación.

---

## 2. Transcripción de Preguntas

### Pregunta 1 (5 puntos) - Servicio DNS en Servidor y Verificación Web
- **Enunciado textual**:
  > *"En el Cisco Packet Tracer, configure el servidor1 con el servicio DNS (Primerapellido.utp.com y Segundoapellido.utp.com), demuestre su captura desde la PC1 y PC4. Tal como las imágenes de ejemplo."*
- **Evidencia visual (Capturas)**:
  * **PC1**: Abre *Desktop > Web Browser*, ingresa URL `http://Primerapellido.utp.com` (ejemplo en captura: `http://correa.utp.com`). La página web carga con título *"Redes y Comunicaciones I"* y contenido *"Bienvenido a mi página web. [NOMBRE COMPLETO]. Hiciste ping con correa.utp.com"*.
  * **PC4**: Abre *Desktop > Web Browser*, ingresa URL `http://Segundoapellido.utp.com` (ejemplo en captura: `http://calle.utp.com`). Carga la misma página personalizada demostrando la resolución DNS del segundo dominio.

### Pregunta 2 (5 puntos) - Configuración del Servicio DHCP en Servidor
- **Enunciado textual**:
  > *"Configure el servicio de DHCP en el Servidor 1. Realice pruebas de conectividad que demuestre este servicio en la PC3. Tal como las imágenes de ejemplo."*
- **Evidencia visual (Captura en PC3)**:
  * Abre *Desktop > IP Configuration*.
  * Se selecciona la opción de radio `DHCP`.
  * Se observa el mensaje del sistema: `DHCP request successful.`
  * Parámetros asignados dinámicamente:
    - **IPv4 Address**: `192.168.X.102` (en la captura muestra `192.168.10.102`).
    - **Subnet Mask**: `255.255.255.0`.
    - **Default Gateway**: `192.168.X.254` (o gateway configurado en el pool).
    - **DNS Server**: `192.168.X.1` (IP del Servidor 1).

### Pregunta 3 (5 puntos) - Configuración de Correo Electrónico (SMTP/POP3)
- **Enunciado textual**:
  > *"Configure el servicio de Correo electrónico en el servidor 2, con el dominio minombre.com.pe. Realice pruebas de conectividad que demuestre este servicio entre la PC2 Y Pc3. Tal como las imágenes de ejemplo."*
- **Evidencia visual (Capturas en PC2 y PC3)**:
  * **Servidor 2**: Servicio *EMAIL* encendido (SMTP ON, POP3 ON). Dominio: `minombre.com.pe` (ejemplo: `teofilo.com.pe`). Se crean al menos dos cuentas de usuario (ej. `r1` y `r2` con contraseña).
  * **PC2 (Cliente Mail Browser)**: Configurado con usuario `r1@teofilo.com.pe`, Incoming Mail Server `192.168.X.2`, Outgoing Mail Server `192.168.X.2`.
  * **PC3 (Cliente Mail Browser)**: Configurado con usuario `r2@teofilo.com.pe`, Incoming Mail Server `192.168.X.2`, Outgoing Mail Server `192.168.X.2`.
  * **Prueba**: PC2 redacta correo (Compose) hacia `r2@teofilo.com.pe` con asunto *"Envio de Prueba1"*, presiona Send (`Send Success`). PC3 entra a *Mail Browser > Receive* y comprueba la recepción. Luego PC3 responde *"Este es una prueba de regreso"* y PC2 comprueba recepción.

### Pregunta 4 (5 puntos) - Topología con Router 2811, Teléfonos IP 7960 y Laptop
- **Enunciado textual**:
  > *"Configure y realice pruebas de conectividad que demuestre este servicio entre todas las Pc, además de Laptop."*
- **Topología representada (Imagen PC3-3.png)**:
  * **Red LAN 1 (Izquierda - 192.168.X.0/24)**:
    - Switch 1 (Superior): Conecta PC1_APELLIDO (Fa0), PC2_APELLIDO (Fa0), Servidor1_APELLIDO (Fa0 -> Fa0/24), Servidor2_APELLIDO (Fa0 -> Fa0/23).
      - Servidor 1 IP: `192.168.X.1`
      - Servidor 2 IP: `192.168.X.2`
    - Switch 2 (Inferior): Conecta PC4_APELLIDO (Fa0/1), PC3_APELLIDO (Fa0/2).
    - Enlace de interconexión entre Switch 1 y Switch 2.
    - Router Cisco 2811 (R1): Interfaz Fa0/0 configurada con `192.168.X.254 255.255.255.0` (Default Gateway de las PCs y Servidores).
  * **Red LAN 2 (Derecha - 192.169.1.0/24 o 192.168.Y.0/24)**:
    - Router 2811 Fa0/1 configurada con `192.169.1.1 255.255.255.0` hacia Switch 3 (Fa0/1).
    - Switch 3 conecta:
      - Teléfono IP 7960 (extensión 1000) en Fa0/2.
      - Teléfono IP 7960 (extensión 2000) en Fa0/3.
      - Laptop-PT L1_APELLIDO en Fa0/4.
- **Análisis crítico del servicio solicitado**:
  * En la hoja impresa dice textualmente: *"demuestre este servicio entre todas las Pc, además de Laptop"*.
  * La presencia de teléfonos IP 7960 con números de extensión `1000` y `2000` sugiere **Telefonía IP (VoIP con CME - CallManager Express)**.
  * **Contraste con materiales oficiales UTP (Semanas 11-15)**:
    - En los materiales del curso (S11 a S15, guías de laboratorio y sílabo), la telefonía IP con CallManager Express **NO** está en el sílabo ni en las separatas. S14 cubre DHCP, FTP, Email, DNS y Celular; S15 cubre VLANs, VTP, Dot1q y DHCP en Router.
    - **Veredicto**: Se cataloga como **"HIPÓTESIS SIN CONFIRMAR"**.
    - La preparación debe cubrir dos vertientes:
      1. **Conectividad Inter-red y Enrutamiento / DHCP**: Configuración de interfaces Fa0/0 y Fa0/1 en Router 2811, asignación de IP a la Laptop, y pruebas de ping mutuo entre PCs y Laptop.
      2. **Comandos Cisco para Telefonía IP (CME)**: Por si el profesor lo explicó en clase: `telephony-service`, `max-ephones`, `max-dn`, `ip source-address`, `ephone-dn 1`, `number 1000`, `ephone-dn 2`, `number 2000`, más DHCP con `option 150 ip`.

---

## 3. Puntos Clave para la Resolución Escrita (En Hoja)
Dado que el examen se rinde escribiendo a mano:
1. **Identificar la ruta de navegación en Packet Tracer**: Explicar qué equipo se abre (ej. `Server1 > pestaña Services > DNS`), qué interruptor se activa (`On`), qué campos se llenan y qué botón se pulsa (`Add` / `Save`).
2. **Especificar valores exactos**: Nombres de dominio, registros A (`Type: A Record`), direcciones IP de mapeo, rangos DHCP, default-gateway y DNS.
3. **Comandos de consola / terminal**:
   - `ipconfig /all`: para verificar IP, máscara, puerta de enlace y DNS obtenidos por DHCP.
   - `nslookup <dominio>`: para comprobar la resolución de nombres DNS.
   - `ping <ip>`: para probar conectividad de Capa 3.
   - Comandos Cisco IOS para configuración de interfaces en Router: `enable`, `configure terminal`, `interface fastEthernet 0/0`, `ip address ...`, `no shutdown`.
4. **Descripción de la evidencia en pantalla**: Qué mensaje o pantalla confirma el éxito (`DHCP request successful.`, `Send Success`, página web renderizada con nombre y apellido).
