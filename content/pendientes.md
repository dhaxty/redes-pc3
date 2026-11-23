# Aspectos y Puntos a Verificar (content/pendientes.md)

1. **Rutas Estáticas de ISP1 y CORP (Semana 14)**:
   - En el texto de indicaciones aparecía una errata de tipeo en CORP: `0.0.0.0.0` (cinco ceros). En la sintaxis estándar de Cisco IOS es `ip route 0.0.0.0 0.0.0.0 201.1.1.5`. Se toma la sintaxis estándar.
2. **Máscara en Router CORP / DHCP (Semana 15)**:
   - Red 10.0.0.0 dividida con máscara /16 (255.255.0.0) para las subredes VLAN 10, 30 y 99. Se respetan exactamente los valores dados en las indicaciones oficiales.
3. **Comportamiento POP3 vs IMAP**:
   - Respetar definición de las diapositivas UTP: POP3 descarga y elimina del servidor por defecto (TCP 110); IMAP mantiene los originales en el servidor (TCP 143).
4. **Comandos Cisco Abreviados**:
   - En el entrenador se admitirán tanto formas abreviadas (`conf t`, `int g0/0`, `sw mo acc`, `encap dot1q`, `sh ip route`) como las formas completas (`configure terminal`, `interface GigabitEthernet 0/0`, `switchport mode access`, `encapsulation dot1Q`, `show ip route`).

## Aspectos de la PC3 de Referencia (Fotos TikTok - Examen en Hoja)
5. **Servicio de Pregunta 4 (VERIFICAR - Hipótesis sin Confirmar)**:
   - El enunciado impreso dice textualmente *"demuestre este servicio entre todas las Pc, además de Laptop"*, sin nombrar el servicio.
   - La topología incluye Router 2811, switch, dos teléfonos IP 7960 (ext. 1000 y 2000) y una Laptop.
   - Hipótesis más probable: Telefonía IP (VoIP con Cisco CallManager Express).
   - Sin embargo, en el sílabo y separatas oficiales de las Semanas 11 a 15 de este curso, la telefonía IP NO forma parte del temario formal. Por tanto, se documenta como hipótesis sin confirmar y se ofrece tanto la solución de conectividad/enrutamiento IP como los comandos de VoIP.
6. **IP de la subred del Switch 3 / Teléfonos en P4 (VERIFICAR)**:
   - En la interfaz Fa0/1 del Router 2811 se lee `192.169.1.1` (o posiblemente `192.168.Y.1`). Se toma `192.169.1.1/24` como valor visible en la imagen.
7. **Default Gateway en captura de DHCP P2 (VERIFICAR)**:
   - En la captura de PC3 el campo Default Gateway se ve difuso (`0.0.0.0` o no configurado en el pool del servidor en ese instante de la foto). Técnicamente en una solución completa se debe ingresar el Default Gateway del router (`192.168.X.254`).
8. **Almacenamiento de progreso para el nuevo módulo**:
   - Se utilizarán exclusivamente claves de localStorage con prefijo `pc3ref_` (`pc3ref_respuestas`, `pc3ref_checklist`, `pc3ref_stats`, etc.) para no interferir con las estadísticas previas.
