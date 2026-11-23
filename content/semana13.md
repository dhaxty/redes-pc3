# Semana 13: Capa de Aplicación, DNS, HTTP, P2P y Configuración DHCPv6 Stateless

## 1. Capas Superiores: Aplicación, Presentación y Sesión
- En el modelo TCP/IP, las tres capas superiores del modelo OSI corresponden a una sola: la **Capa de Aplicación**.
- **Capa de Presentación (OSI)** - 3 funciones fundamentales:
  1. **Formateo y compatibilidad de datos**: Presentar datos de forma compatible entre el emisor y el receptor.
  2. **Compresión**: Optimizar el tamaño de los datos transmitidos para un uso eficiente del ancho de banda.
  3. **Cifrado y descifrado**: Proteger la confidencialidad de la información durante el tránsito.
- **Capa de Sesión (OSI)**:
  - Crear y mantener diálogos entre las aplicaciones origen y destino.
  - Administrar el intercambio y reiniciar sesiones interrumpidas o inactivas.

## 2. Modelos de Comunicación en Capa de Aplicación
- **Cliente - Servidor**:
  * El **cliente** inicia la solicitud de información.
  * El **servidor** escucha en un puerto asignado y responde a la solicitud.
- **Redes Punto a Punto (P2P / Peer-to-Peer)**:
  * Dos o más terminales comparten recursos (archivos, impresoras) sin servidor central dedicado.
  * Cada nodo puede actuar simultáneamente como cliente y servidor según la transacción.
  * Ejemplos de redes/protocolos P2P: BitTorrent, eDonkey, Freenet, Direct Connect.

## 3. Protocolos Principales
- **DNS (Domain Name System)**:
  * Puerto: **UDP / TCP 53**.
  * Función: Resolución jerárquica de nombres FQDN a direcciones IP (registros A para IPv4, AAAA para IPv6).
- **HTTP (Hypertext Transfer Protocol)**:
  * Puerto: **TCP 80** (alternativo: 8080). HTTPS: **TCP 443**.
  * Función: Transporte de páginas web y contenido multimedia.
- **DHCP (Dynamic Host Configuration Protocol)**:
  * Puertos: **UDP 67** (servidor), **UDP 68** (cliente).
  * Función: Asignación dinámica y reutilización de direcciones IPv4.

## 4. Laboratorio Packet Tracer: SLAAC + Servidor DHCPv6 Stateless
Configuración completa en Router RLOCAL:
```cisco
RLOCAL(config)# ipv6 unicast-routing

RLOCAL(config)# ipv6 dhcp pool CISCO
RLOCAL(config-dhcpv6)# dns-server 2001:DB8:ACAD:1::10
RLOCAL(config-dhcpv6)# exit

RLOCAL(config)# interface GigabitEthernet0/0/1
RLOCAL(config-if)# ipv6 address FE80::1 link-local
RLOCAL(config-if)# ipv6 address 2001:DB8:ACAD:1::1/64
RLOCAL(config-if)# ipv6 nd other-config-flag
RLOCAL(config-if)# ipv6 dhcp server CISCO
RLOCAL(config-if)# no shutdown
```
- **Explicación del comando clave**: `ipv6 nd other-config-flag` indica a los clientes que utilicen SLAAC para su dirección IP IPv6 (prefijo mediante RA), pero que consulten al servidor DHCPv6 para obtener otra configuración de red adicional (en este caso, la dirección del servidor DNS `2001:DB8:ACAD:1::10`).
- Diagnósticos utilizados: `ping <ip>`, `traceroute <ip>` (en Cisco) / `tracert <ip>` (en Windows).
