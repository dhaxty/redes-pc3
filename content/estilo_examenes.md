# Resumen de Estilo de Exámenes Previos (PC1 y PC2) - UTP

## Estilo General
- **Profesor**: Velarde Sagastegui, Juan Lenin
- **Estructura combinada**: Preguntas teóricas de concepto directo, ejercicios numéricos/cálculo con topologías y comandos específicos de configuración en equipos Cisco.
- **Enfoque práctico**: Se evalúa comprensión exacta de sintaxis Cisco, comportamiento de protocolos en topologías reales y cálculo preciso sin ambigüedades.

## Tipos de Preguntas Observadas
1. **Comandos Cisco específicos**:
   - Modo de configuración adecuado (ej. `router(config)# enable secret <pass>` vs `service password-encryption`).
   - Configuración de líneas remotas y consola (`line vty 0 4`, `line con 0`).
   - Asignación de IPs en interfaces (`interface g0/0`, `ip address <ip> <mask>`, `no shutdown`).
2. **Tablas de Subneteo (VLSM y FLSM)**:
   - Ordenar de mayor a menor host requerido.
   - Cálculo de hosts requeridos, hosts potencia ($2^n - 2$), máscara de subred (decimal y prefijo /CIDR), dirección de red, primer host útil, último host útil y broadcast.
   - Restricciones típicas: "no usar subred 0", subredes WAN con /30.
3. **Análisis de Topologías y Flujo de Paquetes**:
   - Seguimiento salto a salto (Hop-by-Hop): MAC origen, MAC destino, IP origen, IP destino cuando un paquete atraviesa routers y switches.
   - Comportamiento de switches y tabla CAM/MAC (forwarding, flooding/difusión si MAC no está en tabla).
4. **Cálculo de Tiempos de Red**:
   - Retardo de transmisión ($T_{tx} = L / R$) y retardo de propagación ($T_{prop} = D / V_p$).
   - Fragmentación y tramas Ethernet (MTU 1518 bytes, trama mínima 64 bytes).
5. **Preguntas Conceptuales y Normativas**:
   - Opciones múltiples, verdadero/falso, completar términos clave (siglas IEEE, tipos de conectores, códigos de colores de fibra, estándares de cableado).
