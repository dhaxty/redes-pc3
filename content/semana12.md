# Semana 12: Subneteo IPv6, ICMPv6, NDP y Enrutamiento Dinámico (EIGRP)

## 1. Subneteo en IPv6
- **Estructura típica de dirección Global Unicast (GUA - 128 bits)**:
  * **Prefijo de enrutamiento global**: Asignado por el ISP, típicamente /48 (primeros 3 hextetos, 48 bits).
  * **ID de Subred (Subnet ID)**: 16 bits (4to hexteto, bits 49 al 64). Permite $2^{16} = 65,536$ subredes /64.
  * **ID de Interfaz (Interface ID)**: 64 bits (últimos 4 hextetos).
- **Ejemplo de generación de subredes con prefijo /48**:
  * Base: `2001:db8:acad::/48`
  * Subred 1: `2001:db8:acad:0001::/64`
  * Subred 2: `2001:db8:acad:0002::/64`
  * Subred 3: `2001:db8:acad:0003::/64`
  * Última subred: `2001:db8:acad:ffff::/64`
- **Cálculo de bits de interfaz**: $\text{Bits interfaz} = 128 - \text{Prefijo CIDR}$.
  * Ej. Para `/80`, bits de interfaz = $128 - 80 = 48$ bits.
  * Ej. Para `/64`, bits de interfaz = $128 - 64 = 64$ bits.

## 2. Protocolo ICMPv4 vs ICMPv6
- Mensajes comunes:
  * **Accesibilidad al host**: Echo Request (solicitud de eco) y Echo Reply (respuesta de eco) - usados por `ping`.
  * **Destino/Servicio inalcanzable (Destination Unreachable)**.
  * **Tiempo Excedido (Time Exceeded)**: IPv4 cuando TTL=0. En IPv6 cuando Límite de Saltos (Hop Limit) llega a 0.
- **Códigos de Destino Inalcanzable**:
  * **ICMPv4**:
    - 0: Red inalcanzable.
    - 1: Host inalcanzable.
    - 2: Protocolo inalcanzable.
    - 3: Puerto inalcanzable.
  * **ICMPv6**:
    - 0: No hay ruta hacia el destino.
    - 1: Comunicación con destino prohibida administrativamente (firewall).
    - 2: Más allá del alcance de la dirección de origen.
    - 3: No se puede alcanzar la dirección.
    - 4: Puerto inalcanzable.

## 3. Protocolo de Descubrimiento de Vecinos (NDP / Neighbor Discovery Protocol)
Reemplaza ARP de IPv4 y gestiona autoconfiguración:
1. **RS (Router Solicitation)**: Enviado por hosts multicast (`FF02::2`) al arrancar para pedir información del router.
2. **RA (Router Advertisement)**: Enviado por routers periódicamente (cada 200 s) o en respuesta a RS, anunciando prefijo, MTU y default gateway (su link-local LLA).
3. **NS (Neighbor Solicitation)**: Para resolver MAC de un vecino (equivalente a ARP request) y para DAD (Detección de Direcciones Duplicadas).
4. **NA (Neighbor Advertisement)**: Respuesta con dirección MAC de destino (equivalente a ARP reply) o respuesta a DAD.

## 4. Métodos de Configuración Dinámica GUA IPv6
1. **SLAAC**: El host obtiene el prefijo de red del RA del router y genera sus 64 bits de ID de interfaz mediante EUI-64 o aleatorio. Gateway = Link-local del router.
2. **SLAAC con DHCPv6 sin estado (Stateless)**: SLAAC asigna prefijo e IP; servidor DHCPv6 proporciona datos adicionales (DNS, dominio).
3. **DHCPv6 con estado (Stateful)**: Servidor DHCPv6 asigna la GUA completa y parámetros DNS. Router solo provee el default gateway.

## 5. Comandos Cisco de Laboratorio (IPv6 + EIGRP)
### Habilitar enrutamiento IPv6:
```cisco
Router(config)# ipv6 unicast-routing
```
### Configurar interfaz IPv6 (GUA y Link-Local):
```cisco
Router(config)# interface gigabitethernet 0/0/1
Router(config-if)# ipv6 address 2001:db8:acad:1::1/64
Router(config-if)# ipv6 address fe80::1 link-local
Router(config-if)# no shutdown
```
### Enrutamiento Dinámico EIGRP (del ejercicio de pizarra S12):
```cisco
ISP(config)# interface loopback 0
ISP(config-if)# ip address 1.0.0.1 255.0.0.0
ISP(config)# router eigrp 1
ISP(config-router)# network 1.0.0.0 0.255.255.255
ISP(config-router)# network 10.1.1.0 0.0.0.3
ISP(config-router)# network 10.2.2.0 0.0.0.3

Local(config)# router eigrp 1
Local(config-router)# network 10.1.1.0 0.0.0.3
Local(config-router)# network 192.168.1.0 0.0.0.255

Remoto(config)# router eigrp 1
Remoto(config-router)# network 10.2.2.0 0.0.0.3
Remoto(config-router)# network 192.168.3.0 0.0.0.255
```
### Verificación:
```cisco
Router# show ip route eigrp
```
*(Las rutas aprendidas por EIGRP se identifican con el código **D**, distancia administrativa 90).*
