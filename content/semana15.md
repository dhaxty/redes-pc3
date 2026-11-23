# Semana 15: VLANs, Enrutamiento Inter-VLAN (Router-on-a-Stick), VTP y Seguridad

## 1. Conceptos Fundamentales de VLANs
- **Definición**: Segmentación lógica dentro de una infraestructura física conmutada. Cada VLAN constituye un **dominio de difusión (broadcast domain)** independiente.
- **Beneficios**:
  * Reducción de dominios de difusión -> Mayor rendimiento y ancho de banda útil.
  * Mayor seguridad: el tráfico entre VLANs requiere obligatoriamente un dispositivo de Capa 3 (router o switch multicapa).
  * Flexibilidad administrativa y reducción de costos de infraestructura.
- **VLAN 1**: VLAN predeterminada en switches Cisco (nativa y administración por defecto). No se puede borrar ni renombrar. Las VLANs se almacenan en la memoria flash en el archivo `vlan.dat`.
- **Tipos de Puertos**:
  * **Puerto de Acceso (Access Port)**: Transporta tráfico de una sola VLAN sin etiquetar hacia terminales (PCs, servidores, impresoras).
  * **Puerto Troncal (Trunk Port)**: Enlace punto a punto entre switches o entre switch y router. Transporta tráfico de múltiples VLANs mediante el estándar de etiquetado **IEEE 802.1Q (dot1q)**.

## 2. VTP (VLAN Trunking Protocol)
- Permite propagar y sincronizar la base de datos de VLANs a través de enlaces troncales en el mismo dominio.
- **Modos VTP**:
  * **Server**: Puede crear, modificar y eliminar VLANs y las propaga a toda la red.
  * **Client**: No puede crear ni modificar VLANs; aprende y sincroniza del server.
  * **Transparent**: No sincroniza su base de datos, pero reenvía los anuncios VTP a través de sus troncales.
- Verificación: `show vtp status`.

## 3. Enrutamiento Inter-VLAN: Router-on-a-Stick (Subinterfaces dot1q)
- Permite enrutar paquetes entre distintas VLANs utilizando una sola interfaz física de router conectada a un puerto troncal del switch.
- **Comandos Cisco en Switch (CORE, SW-SERVER, SW-ACCE)**:
```cisco
CORE(config)# vlan 10
CORE(config-vlan)# name servidores
CORE(config-vlan)# vlan 30
CORE(config-vlan)# name estudiantes
CORE(config-vlan)# vlan 99
CORE(config-vlan)# name administracion
CORE(config-vlan)# exit

CORE(config)# vtp domain UTP
CORE(config)# interface range g1/0/1-3
CORE(config-if-range)# switchport mode trunk
CORE(config-if-range)# exit

SW-SERVER(config)# vtp domain UTP
SW-SERVER(config)# vtp mode client
SW-SERVER(config)# interface g0/1
SW-SERVER(config-if)# switchport mode trunk
SW-SERVER(config-if)# interface f0/1
SW-SERVER(config-if)# switchport mode access
SW-SERVER(config-if)# switchport access vlan 10

SW-ACCE(config)# vtp domain UTP
SW-ACCE(config)# vtp mode client
SW-ACCE(config)# interface g0/1
SW-ACCE(config-if)# switchport mode trunk
SW-ACCE(config)# interface range f0/1 - 2
SW-ACCE(config-if-range)# switchport mode access
SW-ACCE(config-if-range)# switchport access vlan 30

CORE(config)# interface vlan 99
CORE(config-if)# ip address 10.99.0.2 255.255.0.0
CORE(config-if)# no shutdown
```

## 4. Configuración en Router (RLOCAL) - Router-on-a-Stick y Servidor DHCP
```cisco
RLOCAL(config)# interface g0/0/0
RLOCAL(config-if)# no shutdown
RLOCAL(config-if)# exit

RLOCAL(config)# interface g0/0/0.10
RLOCAL(config-subif)# encapsulation dot1Q 10
RLOCAL(config-subif)# ip address 10.10.0.1 255.255.0.0

RLOCAL(config)# interface g0/0/0.30
RLOCAL(config-subif)# encapsulation dot1Q 30
RLOCAL(config-subif)# ip address 10.30.0.1 255.255.0.0

RLOCAL(config)# interface g0/0/0.99
RLOCAL(config-subif)# encapsulation dot1Q 99
RLOCAL(config-subif)# ip address 10.99.0.1 255.255.0.0
RLOCAL(config-subif)# exit

! Exclusiones DHCP
RLOCAL(config)# ip dhcp excluded-address 10.99.0.1 10.99.0.20
RLOCAL(config)# ip dhcp excluded-address 10.10.0.1 10.10.0.10
RLOCAL(config)# ip dhcp excluded-address 10.30.0.1 10.30.0.5

! Pools DHCP
RLOCAL(config)# ip dhcp pool estudiantes
RLOCAL(dhcp-config)# network 10.30.0.0 255.255.0.0
RLOCAL(dhcp-config)# default-router 10.30.0.1
RLOCAL(dhcp-config)# dns-server 10.10.0.11
```

## 5. Fundamentos de Seguridad y Amenazas de Red
- **Amenazas de Red**: Robo de información, pérdida y manipulación de datos, robo de identidad, interrupción del servicio (DoS).
- **Tipos de Vulnerabilidades**:
  * **Tecnológicas**: Debilidades intrínsecas de protocolos (ej. TCP/IP sin cifrado) y de software/SO.
  * **De Configuración**: Cuentas con claves por defecto, servicios innecesarios habilitados, contraseñas débiles.
  * **De Política de Seguridad**: Falta de planes de contingencia, ausencia de normativas escritas de seguridad y control de acceso.
- **Tipos de Malware**:
  * **Virus**: Requiere infectar un programa anfitrión y la acción humana para ejecutarse y propagarse.
  * **Gusano (Worm)**: Malware autónomo e independiente; se propaga por la red replicándose sin anfitrión ni acción del usuario.
  * **Troyano (Trojan Horse)**: Se disfraza de programa legítimo pero contiene carga dañina; no se autoreplica infectando otros ficheros.
