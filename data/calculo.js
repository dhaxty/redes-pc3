// Banco y Generador de Ejercicios de Cálculo para PC3 - UTP
// Incluye cálculo paso a paso y generación de variantes aleatorias.

const CALCULO_DATA = [
  // 1. IPv6: Cálculo de bits de interfaz
  {
    id: "calc-01",
    semana: 12,
    tema: "Subneteo IPv6",
    titulo: "Cálculo de Bits de Interfaz (Interface ID)",
    generar: function() {
      const prefijos = [64, 70, 80, 96, 112, 120, 126];
      const p = prefijos[Math.floor(Math.random() * prefijos.length)];
      const bitsInterfaz = 128 - p;
      return {
        enunciado: `Dada una red IPv6 con prefijo /${p}, ¿cuántos bits quedan disponibles para la identificación de la interfaz (Interface ID)?`,
        tipoInput: "numero",
        placeholder: "Ingrese el número de bits",
        respuestaCorrecta: bitsInterfaz,
        unidad: "bits",
        pasos: [
          `Una dirección IPv6 completa tiene una longitud fija de 128 bits.`,
          `Fórmula: Bits de Interfaz = 128 - Prefijo CIDR`,
          `Cálculo: 128 - ${p} = ${bitsInterfaz} bits.`
        ]
      };
    }
  },

  // 2. IPv6: Cantidad de subredes entre prefijos
  {
    id: "calc-02",
    semana: 12,
    tema: "Subneteo IPv6",
    titulo: "Número de Subredes IPv6 Disponibles",
    generar: function() {
      const globalPrefix = 48;
      const targetPrefixes = [52, 56, 60, 64];
      const target = targetPrefixes[Math.floor(Math.random() * targetPrefixes.length)];
      const bitsSubred = target - globalPrefix;
      const subredes = Math.pow(2, bitsSubred);
      return {
        enunciado: `Si un proveedor ISP asigna a una empresa el bloque 2001:DB8:ACAD::/${globalPrefix}, ¿cuántas subredes con prefijo /${target} se pueden crear a partir de dicho bloque?`,
        tipoInput: "numero",
        placeholder: "Número de subredes",
        respuestaCorrecta: subredes,
        unidad: "subredes",
        pasos: [
          `Identificar los bits prestados para subred: Bits subred = ${target} - ${globalPrefix} = ${bitsSubred} bits.`,
          `Calcular la cantidad de combinaciones binarias: N = 2^(bits subred).`,
          `N = 2^${bitsSubred} = ${subredes.toLocaleString()} subredes.`
        ]
      };
    }
  },

  // 3. IPv6: Identificación del hexteto de subred
  {
    id: "calc-03",
    semana: 12,
    tema: "Subneteo IPv6",
    titulo: "Dirección de la N-ésima Subred IPv6",
    generar: function() {
      const n = Math.floor(Math.random() * 14) + 2; // entre 2 y 15
      const hexSubred = (n - 1).toString(16).toLowerCase();
      const ipSubred = `2001:db8:acad:${hexSubred}::/64`;
      return {
        enunciado: `Dado el prefijo de enrutamiento global 2001:db8:acad::/48 y asumiendo que la subred 1 es 2001:db8:acad:0::/64, ¿cuál es la dirección de la subred número ${n} (en minúsculas y formato comprimido /64)?`,
        tipoInput: "texto",
        placeholder: "ej: 2001:db8:acad:1::/64",
        respuestaCorrecta: ipSubred,
        validador: (val) => val.trim().toLowerCase().replace(/::0\/64$/, "::/64") === ipSubred,
        pasos: [
          `El cuarto hexteto de 16 bits corresponde al ID de subred.`,
          `La subred 1 usa el índice 0x0. Por tanto, la subred ${n} usa el índice (${n} - 1) en hexadecimal.`,
          `Índice en hex: ${n - 1} en decimal = '${hexSubred}' en hexadecimal.`,
          `Resultado: ${ipSubred}`
        ]
      };
    }
  },

  // 4. TCP: Fragmentación según MSS
  {
    id: "calc-04",
    semana: 11,
    tema: "Protocolo TCP",
    titulo: "Segmentación de Payload según MSS",
    generar: function() {
      const mss = 1460;
      const tamanos = [1550, 2100, 2920, 3200, 4380, 5000];
      const total = tamanos[Math.floor(Math.random() * tamanos.length)];
      const numSegmentos = Math.ceil(total / mss);
      const ultimoSegmento = total % mss === 0 ? mss : total % mss;
      return {
        enunciado: `Una aplicación genera un bloque de datos de ${total} bytes para enviar por TCP. Si la conexión opera con un MSS estándar de ${mss} bytes, ¿en cuántos segmentos TCP se fragmentará el mensaje?`,
        tipoInput: "numero",
        placeholder: "Cantidad de segmentos",
        respuestaCorrecta: numSegmentos,
        unidad: "segmentos",
        pasos: [
          `El MSS (Maximum Segment Size) representa la carga máxima útil por segmento TCP (${mss} bytes).`,
          `Fórmula: Segmentos = techo(Tamaño total / MSS) = techo(${total} / ${mss}).`,
          `${total} / ${mss} = ${(total / mss).toFixed(2)} -> Se requieren ${numSegmentos} segmentos.`,
          `Nota: Los primeros ${numSegmentos - 1} segmentos llevarán ${mss} bytes y el último llevará ${ultimoSegmento} bytes.`
        ]
      };
    }
  },

  // 5. TCP: Cálculo de Números de Secuencia (SEQ)
  {
    id: "calc-05",
    semana: 11,
    tema: "Protocolo TCP",
    titulo: "Cálculo del Próximo Número de Secuencia TCP",
    generar: function() {
      const isn = Math.floor(Math.random() * 500) + 100;
      const bytesPayload = [100, 250, 500, 1460][Math.floor(Math.random() * 4)];
      const nextSeq = isn + bytesPayload;
      return {
        enunciado: `Un cliente envía un segmento TCP de datos con número de secuencia inicial SEQ = ${isn} transportando ${bytesPayload} bytes de carga útil. ¿Cuál será el número de secuencia (SEQ) del SIGUIENTE segmento enviado por el cliente?`,
        tipoInput: "numero",
        placeholder: "Número de secuencia",
        respuestaCorrecta: nextSeq,
        pasos: [
          `En TCP, el número de secuencia cuenta el número de bytes de datos transmitidos en el flujo.`,
          `Fórmula: Próximo SEQ = SEQ actual + Bytes de carga útil transmitidos.`,
          `Cálculo: ${isn} + ${bytesPayload} = ${nextSeq}.`
        ]
      };
    }
  },

  // 6. TCP: Cálculo del Acknowledgment (ACK) esperado
  {
    id: "calc-06",
    semana: 11,
    tema: "Protocolo TCP",
    titulo: "Cálculo del Número de Asentimiento (ACK)",
    generar: function() {
      const isn = Math.floor(Math.random() * 800) + 200;
      const bytes = [150, 300, 750, 1460][Math.floor(Math.random() * 4)];
      const ackEsperado = isn + bytes;
      return {
        enunciado: `El servidor recibe exitosamente un segmento TCP que comienza en SEQ = ${isn} y contiene ${bytes} bytes de datos. ¿Qué valor de ACK enviará el servidor en su respuesta de confirmación?`,
        tipoInput: "numero",
        placeholder: "Valor ACK",
        respuestaCorrecta: ackEsperado,
        pasos: [
          `El campo ACK en la cabecera TCP especifica el próximo byte que el receptor espera recibir.`,
          `Fórmula: ACK = SEQ recibido + Bytes recibidos.`,
          `Cálculo: ${isn} + ${bytes} = ${ackEsperado}.`
        ]
      };
    }
  },

  // 7. IPv4: Hosts útiles por máscara de subred
  {
    id: "calc-07",
    semana: 12,
    tema: "Direccionamiento IPv4",
    titulo: "Cantidad de Hosts Útiles en IPv4",
    generar: function() {
      const mascaras = [
        { cidr: 24, mask: "255.255.255.0", bitsHost: 8 },
        { cidr: 25, mask: "255.255.255.128", bitsHost: 7 },
        { cidr: 26, mask: "255.255.255.192", bitsHost: 6 },
        { cidr: 27, mask: "255.255.255.224", bitsHost: 5 },
        { cidr: 28, mask: "255.255.255.240", bitsHost: 4 },
        { cidr: 29, mask: "255.255.255.248", bitsHost: 3 },
        { cidr: 30, mask: "255.255.255.252", bitsHost: 2 }
      ];
      const m = mascaras[Math.floor(Math.random() * mascaras.length)];
      const hostsUtiles = Math.pow(2, m.bitsHost) - 2;
      return {
        enunciado: `¿Cuántos hosts útiles (direcciones asignables a dispositivos terminales) admite una subred IPv4 con máscara ${m.mask} (prefijo /${m.cidr})?`,
        tipoInput: "numero",
        placeholder: "Hosts útiles",
        respuestaCorrecta: hostsUtiles,
        unidad: "hosts útiles",
        pasos: [
          `Determinar el número de bits de host: 32 - ${m.cidr} = ${m.bitsHost} bits.`,
          `Fórmula: Hosts útiles = 2^(bits host) - 2 (se descuentan la dirección de red y la de broadcast).`,
          `Cálculo: 2^${m.bitsHost} - 2 = ${Math.pow(2, m.bitsHost)} - 2 = ${hostsUtiles} hosts.`
        ]
      };
    }
  },

  // 8. IPv4: Máscara CIDR necesaria para N hosts
  {
    id: "calc-08",
    semana: 12,
    tema: "Subneteo VLSM IPv4",
    titulo: "Prefijo CIDR Requerido según Hosts",
    generar: function() {
      const casos = [
        { hosts: 10, bits: 4, cidr: 28 },
        { hosts: 25, bits: 5, cidr: 27 },
        { hosts: 50, bits: 6, cidr: 26 },
        { hosts: 120, bits: 7, cidr: 25 },
        { hosts: 200, bits: 8, cidr: 24 },
        { hosts: 450, bits: 9, cidr: 23 },
        { hosts: 1000, bits: 10, cidr: 22 }
      ];
      const c = casos[Math.floor(Math.random() * casos.length)];
      return {
        enunciado: `En un diseño VLSM se requiere una subred para atender a un departamento con ${c.hosts} computadoras. ¿Cuál es el prefijo CIDR mínimo (ej. 24, 25, 26...) que cumple el requerimiento optimizando el espacio?`,
        tipoInput: "numero",
        placeholder: "Prefijo (solo número)",
        respuestaCorrecta: c.cidr,
        pasos: [
          `Buscar la menor potencia de 2 tal que: 2^h - 2 >= ${c.hosts}.`,
          `Probando potencias: 2^${c.bits} - 2 = ${Math.pow(2, c.bits) - 2} hosts útiles (suficiente para ${c.hosts}).`,
          `Bits de host (h) = ${c.bits}.`,
          `Prefijo CIDR = 32 - h = 32 - ${c.bits} = /${c.cidr}.`
        ]
      };
    }
  },

  // 9. EIGRP: Máscara Wildcard
  {
    id: "calc-09",
    semana: 12,
    tema: "Enrutamiento Dinámico",
    titulo: "Cálculo de Máscara Wildcard para EIGRP / OSPF",
    generar: function() {
      const mascaras = [
        { mask: "255.255.255.0", wild: "0.0.0.255" },
        { mask: "255.255.255.128", wild: "0.0.0.127" },
        { mask: "255.255.255.192", wild: "0.0.0.63" },
        { mask: "255.255.255.224", wild: "0.0.0.31" },
        { mask: "255.255.255.240", wild: "0.0.0.15" },
        { mask: "255.255.255.248", wild: "0.0.0.7" },
        { mask: "255.255.255.252", wild: "0.0.0.3" }
      ];
      const m = mascaras[Math.floor(Math.random() * mascaras.length)];
      return {
        enunciado: `Para la máscara de red IPv4 ${m.mask}, ¿cuál es su máscara wildcard inversa equivalente que debe ingresarse en el comando network de EIGRP?`,
        tipoInput: "texto",
        placeholder: "0.0.0.x",
        respuestaCorrecta: m.wild,
        validador: (val) => val.trim() === m.wild,
        pasos: [
          `La máscara wildcard se obtiene restando la máscara de subred de la dirección de difusión total (255.255.255.255).`,
          `  255.255.255.255`,
          `- ${m.mask}`,
          `-----------------`,
          `= ${m.wild}`
        ]
      };
    }
  },

  // 10. IPv4: Dirección de Broadcast
  {
    id: "calc-10",
    semana: 12,
    tema: "Subneteo IPv4",
    titulo: "Dirección de Broadcast de una Subred",
    generar: function() {
      const subredes = [
        { red: "192.168.1.0/26", bc: "192.168.1.63", salto: 64 },
        { red: "192.168.1.64/26", bc: "192.168.1.127", salto: 64 },
        { red: "192.168.1.128/26", bc: "192.168.1.191", salto: 64 },
        { red: "192.168.1.0/27", bc: "192.168.1.31", salto: 32 },
        { red: "192.168.1.32/27", bc: "192.168.1.63", salto: 32 },
        { red: "10.1.1.0/30", bc: "10.1.1.3", salto: 4 },
        { red: "10.2.2.4/30", bc: "10.2.2.7", salto: 4 }
      ];
      const s = subredes[Math.floor(Math.random() * subredes.length)];
      return {
        enunciado: `¿Cuál es la dirección de broadcast correspondiente a la subred ${s.red}?`,
        tipoInput: "texto",
        placeholder: "x.x.x.x",
        respuestaCorrecta: s.bc,
        validador: (val) => val.trim() === s.bc,
        pasos: [
          `Identificar el tamaño de bloque (salto): ${s.salto} direcciones.`,
          `La dirección de broadcast es la última dirección del bloque antes de la siguiente subred.`,
          `Resultado: ${s.bc}`
        ]
      };
    }
  },

  // 11. Redes: Retardo de Transmisión
  {
    id: "calc-11",
    semana: 11,
    tema: "Tiempos de Red",
    titulo: "Cálculo de Retardo de Transmisión (T_tx)",
    generar: function() {
      const paquetesBytes = [1000, 1500, 2000, 5000]; // Bytes
      const velocidadesMbps = [10, 100, 1000]; // Mbps
      const L_bytes = paquetesBytes[Math.floor(Math.random() * paquetesBytes.length)];
      const R_mbps = velocidadesMbps[Math.floor(Math.random() * velocidadesMbps.length)];
      const L_bits = L_bytes * 8;
      const R_bps = R_mbps * 1000000;
      const t_tx_ms = (L_bits / R_bps) * 1000;
      return {
        enunciado: `Un host transmite un paquete de tamaño L = ${L_bytes} bytes a través de un enlace con ancho de banda R = ${R_mbps} Mbps. Calcule el retardo de transmisión en milisegundos (ms).`,
        tipoInput: "numero",
        placeholder: "ms (ej: 0.12)",
        respuestaCorrecta: parseFloat(t_tx_ms.toFixed(4)),
        tolerancia: 0.005,
        unidad: "ms",
        pasos: [
          `Convertir tamaño a bits: L = ${L_bytes} B * 8 bits/B = ${L_bits} bits.`,
          `Convertir ancho de banda a bps: R = ${R_mbps} Mbps = ${R_bps.toLocaleString()} bps.`,
          `Fórmula: T_tx = L / R = ${L_bits} / ${R_bps} = ${(L_bits / R_bps).toFixed(6)} segundos.`,
          `Convertir a milisegundos: ${(L_bits / R_bps).toFixed(6)} s * 1000 = ${t_tx_ms.toFixed(4)} ms.`
        ]
      };
    }
  },

  // 12. Redes: Retardo de Propagación
  {
    id: "calc-12",
    semana: 11,
    tema: "Tiempos de Red",
    titulo: "Cálculo de Retardo de Propagación (T_prop)",
    generar: function() {
      const distanciasKm = [100, 200, 500, 1000];
      const d_km = distanciasKm[Math.floor(Math.random() * distanciasKm.length)];
      const vp = 200000000; // 2 * 10^8 m/s velocidad en fibra/cobre típica
      const d_m = d_km * 1000;
      const t_prop_ms = (d_m / vp) * 1000;
      return {
        enunciado: `Se tiene un enlace de fibra óptica de distancia d = ${d_km} km. Si la velocidad de propagación de la señal en el medio es Vp = 200,000,000 m/s (2x10^8 m/s), calcule el retardo de propagación en milisegundos (ms).`,
        tipoInput: "numero",
        placeholder: "ms (ej: 0.5)",
        respuestaCorrecta: parseFloat(t_prop_ms.toFixed(3)),
        tolerancia: 0.01,
        unidad: "ms",
        pasos: [
          `Convertir distancia a metros: d = ${d_km} km = ${d_m.toLocaleString()} metros.`,
          `Fórmula: T_prop = d / Vp`,
          `Cálculo: ${d_m} m / 200,000,000 m/s = ${(d_m / vp).toFixed(6)} segundos.`,
          `Convertir a ms: ${(d_m / vp).toFixed(6)} * 1000 = ${t_prop_ms.toFixed(3)} ms.`
        ]
      };
    }
  },

  // 13. Ethernet: Número de tramas por MTU
  {
    id: "calc-13",
    semana: 11,
    tema: "Capa de Enlace y MTU",
    titulo: "Número de Tramas Ethernet Requeridas",
    generar: function() {
      const mtuPayload = 1500; // MTU Ethernet max data
      const archivos = [4500, 7500, 10000, 15000]; // Bytes (como en el examen PC1: 7500 bytes)
      const tam = archivos[Math.floor(Math.random() * archivos.length)];
      const numTramas = Math.ceil(tam / mtuPayload);
      return {
        enunciado: `Un dispositivo debe transmitir un mensaje de ${tam} bytes a través de una red Ethernet estándar con MTU de 1500 bytes de carga útil. ¿Cuántas tramas Ethernet como mínimo se transmitirán?`,
        tipoInput: "numero",
        placeholder: "Número de tramas",
        respuestaCorrecta: numTramas,
        unidad: "tramas",
        pasos: [
          `El MTU (Maximum Transmission Unit) para Ethernet estándar permite un payload máximo de 1500 bytes por trama.`,
          `Fórmula: Tramas = techo(Tamaño total / MTU) = techo(${tam} / 1500).`,
          `${tam} / 1500 = ${(tam / 1500).toFixed(2)} -> Se requieren ${numTramas} tramas Ethernet.`
        ]
      };
    }
  },

  // 14. IPv4: Rango de Hosts Útiles en subred WAN /30
  {
    id: "calc-14",
    semana: 14,
    tema: "Direccionamiento WAN",
    titulo: "Primer y Último Host Útil en Enlace WAN (/30)",
    generar: function() {
      const octeto = [0, 4, 8, 12, 16, 20][Math.floor(Math.random() * 6)];
      const red = `201.1.1.${octeto}`;
      const primerHost = `201.1.1.${octeto + 1}`;
      const ultimoHost = `201.1.1.${octeto + 2}`;
      return {
        enunciado: `Dada la subred de enlace WAN punto a punto ${red}/30, ¿cuál es la ÚLTIMA dirección IP asignable a un router en dicho enlace?`,
        tipoInput: "texto",
        placeholder: "201.1.1.x",
        respuestaCorrecta: ultimoHost,
        validador: (val) => val.trim() === ultimoHost,
        pasos: [
          `En una subred /30 hay 4 direcciones en total (salto de 4).`,
          `Dirección de red: 201.1.1.${octeto}`,
          `Primer host útil: 201.1.1.${octeto + 1}`,
          `Último host útil: 201.1.1.${octeto + 2}`,
          `Broadcast: 201.1.1.${octeto + 3}`
        ]
      };
    }
  },

  // 15. VLANs / Subneteo: Cálculo de Capacidad de Hosts en VLAN /16
  {
    id: "calc-15",
    semana: 15,
    tema: "VLANs y Direccionamiento",
    titulo: "Capacidad de Hosts en VLANs con Máscara /16",
    generar: function() {
      // Como en el laboratorio Semana 15: vlan 99 10.99.0.0/16, vlan 10 10.10.0.0/16, vlan 30 10.30.0.0/16
      const bitsHost = 16;
      const capacidad = Math.pow(2, bitsHost) - 2;
      return {
        enunciado: `En el laboratorio de la Semana 15, la VLAN 30 (estudiantes) utiliza la red 10.30.0.0 con máscara 255.255.0.0 (/16). ¿Cuál es el número total de direcciones IP útiles para clientes en dicha VLAN?`,
        tipoInput: "numero",
        placeholder: "Total hosts útiles",
        respuestaCorrecta: capacidad,
        unidad: "hosts útiles",
        pasos: [
          `El prefijo /16 deja 32 - 16 = 16 bits para hosts.`,
          `Fórmula: 2^16 - 2`,
          `2^16 = 65,536 direcciones totales.`,
          `Descontando red (10.30.0.0) y broadcast (10.30.255.255): 65,536 - 2 = 65,534 hosts útiles.`
        ]
      };
    }
  }
];
