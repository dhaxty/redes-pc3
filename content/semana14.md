# Semana 14: DHCP, FTP, SMB, Correo Electrónico (SMTP, POP3, IMAP) y Rutas Estáticas

## 1. Protocolo DHCP (IPv4 y comparación IPv6)
- **Función**: Automatiza la asignación dinámica de direcciones IP, máscara, puerta de enlace y DNS.
- **Proceso DORA en DHCPv4 (4 pasos)**:
  1. **DHCPDISCOVER**: Mensaje de difusión (broadcast) del cliente para localizar servidores DHCP.
  2. **DHCPOFFER**: El servidor ofrece una concesión de dirección IP al cliente.
  3. **DHCPREQUEST**: El cliente solicita formalmente aceptar la oferta del servidor elegido.
  4. **DHCPACK**: El servidor confirma y formaliza la concesión.
  - *DHCPNAK*: Si la oferta ya no es válida o hay conflicto de IP, el servidor envía reconocimiento negativo y el cliente reinicia con DHCPDISCOVER.
- **Puertos**: UDP 67 (servidor) y UDP 68 (cliente).
- **Mensajes equivalentes en DHCPv6**: `SOLICIT`, `ADVERTISE`, `INFORMATION REQUEST`, `REPLY`.

## 2. Transferencia de Archivos: FTP vs SMB
- **FTP (File Transfer Protocol)**:
  * Utiliza **dos conexiones TCP**:
    1. **Conexión de Control (Puerto TCP 21)**: Envío de comandos y respuestas de estado.
    2. **Conexión de Datos (Puerto TCP 20)**: Transferencia de datos reales cada vez que se sube o baja un archivo.
  * Comandos de cliente FTP en terminal:
    - `ftp <ip>`: Iniciar conexión al servidor FTP.
    - `put <archivo>`: Subir/insertar archivo local al servidor FTP.
    - `get <archivo>`: Descargar/extraer archivo del servidor al host local.
    - `dir`: Listar archivos del directorio actual en el servidor.
    - `quit` / `bye`: Cerrar sesión FTP.
- **SMB (Server Message Block)**:
  * Protocolo cliente-servidor para compartir archivos e impresoras en red local.
  * Establece conexiones a largo plazo y permite acceder a recursos remotos como si fueran locales.

## 3. Protocolos de Correo Electrónico
- **Arquitectura de correo (Store-and-forward)**:
  * **SMTP (Simple Mail Transfer Protocol)**:
    - Puerto: **TCP 25**.
    - Función: Envío de correo electrónico (desde el cliente hacia el servidor de correo, y entre servidores de correo). Pone en cola si el destinatario no está disponible.
  * **POP3 (Post Office Protocol v3)**:
    - Puerto: **TCP 110**.
    - Función: Descarga de correo al cliente. Por defecto, **elimina** los mensajes del servidor tras descargarlos.
  * **IMAP (Internet Message Access Protocol)**:
    - Puerto: **TCP 143**.
    - Función: Sincronización y consulta de correo. Mantiene los mensajes originales en el servidor y sincroniza carpetas.

## 4. Comandos Cisco de Laboratorio (S14)
### Configuración de Seguridad Básica:
```cisco
Router(config)# hostname CORP
CORP(config)# enable secret cisco
```
### Rutas Estáticas por Defecto (Default Routes) IPv4 e IPv6:
```cisco
CORP(config)# ip route 0.0.0.0 0.0.0.0 201.1.1.5
CORP(config)# ipv6 route ::/0 2001:db8:acad:1::1
ISP1(config)# ip route 0.0.0.0 0.0.0.0 201.1.1.6
ISP1(config)# ip route 190.98.161.0 255.255.255.0 s0/2/0
ISP1(config)# ipv6 route ::/0 2001:db8:acad:1::2
```
### DHCPv6 Stateless en Router CORP:
```cisco
CORP(config)# ipv6 unicast-routing
CORP(config)# ipv6 dhcp pool utp
CORP(config-dhcpv6)# dns-server 2800:3F0:4003:C08::68
CORP(config-dhcpv6)# exit
CORP(config)# interface GigabitEthernet0/0/0
CORP(config-if)# ipv6 dhcp server utp
CORP(config-if)# ipv6 nd other-config-flag
CORP(config-if)# no shutdown
```
### Copia de seguridad a servidor TFTP:
```cisco
CORP# copy flash: tftp:
```
