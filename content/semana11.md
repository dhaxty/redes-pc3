# Semana 11: Capa de Transporte - TCP y Wireshark

## 1. Temas Principales
- Servicios de la capa de transporte: Multiplexación y Demultiplexación.
- Concepto de Socket: Par IP + Puerto (IP origen:puerto origen <-> IP destino:puerto destino).
- Puertos bien conocidos (Well-known ports, 16 bits: 0 a 65535):
  * **20**: FTP Datos (TCP)
  * **21**: FTP Control (TCP)
  * **22**: SSH (TCP)
  * **23**: Telnet (TCP)
  * **25**: SMTP (TCP)
  * **53**: DNS (UDP / TCP)
  * **67**: DHCP Servidor (UDP)
  * **68**: DHCP Cliente (UDP)
  * **69**: TFTP (UDP)
  * **80**: HTTP (TCP)
  * **110**: POP3 (TCP)
  * **143**: IMAP (TCP)
  * **161**: SNMP (UDP)
  * **443**: HTTPS (TCP)
- Comando de verificación de conexiones activas en terminal: `netstat` (estados: ESTABLISHED, LISTENING, TIME_WAIT, CLOSE_WAIT).
- Regla del servidor: Un servidor no puede asignar dos servicios diferentes al mismo número de puerto en el mismo protocolo de transporte.

## 2. Protocolo TCP: Establecimiento y Cierre de Conexión
### Three-Way Handshake (Establecimiento de 3 vías):
1. **Paso 1 (Cliente -> Servidor)**: Segmento `SYN` (SEQ = ISN_c, CTL = SYN).
2. **Paso 2 (Servidor -> Cliente)**: Segmento `SYN, ACK` (SEQ = ISN_s, ACK = ISN_c + 1, CTL = SYN, ACK).
3. **Paso 3 (Cliente -> Servidor)**: Segmento `ACK` (SEQ = ISN_c + 1, ACK = ISN_s + 1, CTL = ACK).

### Cierre de Conexión (4 pasos / Four-way handshake):
1. **Paso 1 (Cliente -> Servidor)**: Segmento `FIN` (anuncia fin de transmisión de datos).
2. **Paso 2 (Servidor -> Cliente)**: Segmento `ACK` (confirma recepción del FIN).
3. **Paso 3 (Servidor -> Cliente)**: Segmento `FIN` (servidor cierra su envío).
4. **Paso 4 (Cliente -> Servidor)**: Segmento `ACK` (cliente confirma cierre).

### Bits de Control (Flags TCP):
- `SYN` (Synchronize), `ACK` (Acknowledgment), `FIN` (Finish), `RST` (Reset), `PSH` (Push), `URG` (Urgent).

## 3. Segmentación, Secuencias y Control de Flujo (Práctica Dirigida 06)
- **MSS (Maximum Segment Size)**: Típicamente 1460 bytes (MTU 1500 - 20B IPv4 - 20B TCP).
- Si una aplicación envía datos mayores a MSS (ej. 1550 B con MSS 1460 B):
  * Segmento 1: 1460 bytes.
  * Segmento 2: 90 bytes.
- Los números de secuencia incrementan según el número de bytes de datos transmitidos en el payload (o +1 en caso de SYN/FIN).
- El número de ACK esperado es el próximo byte que el receptor espera recibir.

## 4. Laboratorio de Wireshark
- **Modo Promiscuo**: Permite a la tarjeta de red capturar todo el tráfico del medio, no solo el dirigido a su propia MAC.
- **Tamaños de Cabeceras**:
  * Cabecera Ethernet II: 14 bytes (6 MAC Dest + 6 MAC Orig + 2 EtherType).
  * Cabecera IPv4: 20 bytes (mínimo sin opciones).
  * Cabecera TCP: 20 bytes (mínimo sin opciones).
  * Cabecera UDP: 8 bytes (Puerto Orig, Puerto Dest, Longitud, Checksum; 2 bytes cada uno).
- Filtros de visualización Wireshark comunes: `tcp`, `udp`, `icmp`, `tcp.port == 80`, `ip.addr == 192.168.1.1`.
- Comandos CLI en host para pruebas: `ping -t <host>`, `netstat`, `ipconfig /all`.
