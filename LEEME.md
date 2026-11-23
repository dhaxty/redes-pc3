# Simulador Interactivo de Práctica - Examen PC3 (UTP)
**Curso**: Redes y Comunicación de Datos I (100000I41N)  
**Profesor**: Velarde Sagastegui, Juan Lenin  
**Cobertura**: Semanas 11 a 15  

---

## 1. ¿Cómo abrir y utilizar la plataforma?
- La aplicación es una página web estática que **no requiere ningún servidor**, instalación de paquetes, compilación (build), ni conexión a Internet.
- **Instrucciones**:
  1. Diríjase a la carpeta `C:\Users\Steve\Documents\Repaso_Redes\web_PC3\`.
  2. Haga doble clic sobre el archivo **`index.html`** para abrirlo en su navegador predeterminado (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, etc.).
  3. Puede utilizarlo tanto en su laptop/computadora como en su teléfono móvil.

---

## 2. Módulos Interactivos Incluidos
1. **&#128214; Banco de Preguntas Teóricas (65 preguntas)**:
   - Filtros dinámicos por Semana (11 a 15) y por Tipo de pregunta.
   - 4 formatos de pregunta: Opción múltiple, Verdadero/Falso, Completar término y Relacionar conceptos.
   - Retroalimentación inmediata con explicación detallada y citas de los materiales de clase.
2. **&#128421; Entrenador de Comandos (27 ejercicios)**:
   - Terminal simulada estilo Cisco IOS CLI / consola.
   - Validador con tolerancia a comandos abreviados oficiales (`conf t`, `int g0/0`, `sh ip route`, `sw mo acc`, `encap dot1q`, `no sh`, etc.), mayúsculas/minúsculas y espacios extra.
   - Botón de Pista progresiva, botón para revelar solución y explicación técnica del comando.
3. **&#129303; Ejercicios de Cálculo (15 generadores)**:
   - Variantes numéricas aleatorias e infinitas: bits de interfaz IPv6 ($128 - \text{prefijo}$), cantidad de subredes, identificación de hextetos, fragmentación MSS TCP, cálculo de números de secuencia (SEQ) y asentimiento (ACK), hosts útiles por máscara, wildcard EIGRP, broadcast, retardos de transmisión ($T_{tx}$), retardos de propagación ($T_{prop}$) y tramas Ethernet por MTU.
   - Botón *"Ver Paso a Paso"* con el desglose matemático de fórmulas aplicadas.
4. **&#9201; Simulacro de Examen PC3**:
   - Evaluación ponderada de 20 preguntas (10 teóricas, 5 de comandos y 5 de cálculo) repartidas entre las semanas 11 a 15.
   - Temporizador configurable (30, 45, 60 min o sin límite).
   - Calificación automática en escala vigesimal UTP (0 a 20). Nota mínima aprobatoria: **12.0**.
   - Pantalla de revisión detallada con solución paso a paso de cada pregunta.
5. **&#128202; Panel de Progreso y Rendimiento**:
   - Estadísticas persistentes en `localStorage` (total respondidas, aciertos, fallos y % efectividad).
   - Barras de progreso por cada semana individual (11, 12, 13, 14 y 15) para detectar temas débiles.
   - Botón *"Repasar Solo Mis Fallos"* para estudiar focalizadamente las preguntas erradas.
6. **&#127183; Modo Tarjetas (Flashcards)**:
   - Tarjetas interactivas 3D con efecto de volteo para memorizar rápidamente conceptos clave, puertos y comandos Cisco.
7. **&#128221; PC3 de Referencia - Examen en Hoja Impresa**:
   - Basado en un examen físico real de la UTP resuelto **a mano por escrito** (4 preguntas de 5 puntos c/u = 20 pts).
   - **Diagrama Vectorial SVG**: Topología oficial en línea (sin imágenes externas) con routers, switches, servidores, teléfonos IP y etiquetas claras "VERIFICAR" para hipótesis no confirmadas.
   - **Área de redacción escrita y Maqueta A4**: Vista previa interactiva de la hoja de examen físico con renglones pautados para redactar a mano e impresión limpia oficial UTP.
   - **Interruptor de Soluciones y Rúbricas**: Botón superior para alternar la visualización de respuestas modelo y rúbricas sin alterar el modo de práctica escrita.
   - **Entrenador de Comandos Escritos (Drill)**: 10 ejercicios (5 escribir + 5 completar) con resumen visible de avance por modo.
8. **&#128218; Visor de Resúmenes Teóricos (Nuevo Módulo)**:
   - Acceso offline inmediato a las guías de estudio de las Semanas 11 a 15 y al análisis de estilo de las PC1 y PC2.
   - Renderizador Markdown mínimo integrado (encabezados, tablas, listas, código y estilos tipográficos con escape HTML).
   - Buscador de texto en tiempo real para localizar conceptos, comandos y puertos rápidamente dentro de la semana seleccionada.

---

## 3. Estructura del Proyecto (`web_PC3/`)
```text
web_PC3/
│
├── index.html            <- Página principal (abrir con doble clic)
├── styles.css            <- Estilos limpios, responsivos y tema de terminal
├── app.js                <- Lógica de interacción, validador de comandos y simulacro
├── progreso.md           <- Registro de avance y estado de cada fase
├── LEEME.md              <- Este manual de usuario y documentación técnica
│
├── data/
│   ├── preguntas.js      <- Banco de 65 preguntas teóricas estructuradas (+ 7 nuevas del examen de referencia)
│   ├── comandos.js       <- 27 ejercicios de consola y terminal con validación
│   ├── calculo.js        <- 15 generadores de variantes aleatorias con pasos
│   ├── pc3_referencia.js <- Módulo de examen en hoja: 4 preguntas, plantillas, variantes y comandos drill
│   └── resumenes.js      <- Guías de estudio Markdown compiladas para uso offline sin fetch()
│
└── content/
    ├── semana11.md       <- Resumen teórico y comandos de la Semana 11
    ├── semana12.md       <- Resumen teórico y comandos de la Semana 12
    ├── semana13.md       <- Resumen teórico y comandos de la Semana 13
    ├── semana14.md       <- Resumen teórico y comandos de la Semana 14
    ├── semana15.md       <- Resumen teórico y comandos de la Semana 15
    ├── pc3_referencia.md <- Transcripción y análisis de las 3 imágenes de examen impreso
    ├── estilo_examenes.md<- Análisis del modelo de preguntas de PC1 y PC2
    └── pendientes.md     <- Registro de observaciones y decisiones técnicas
```

---

## 4. Aspectos Registrados y Decisiones Técnicas
1. **P4 - Servicio no nombrado (Hipótesis sin confirmar: VoIP vs Enrutamiento LAN)**:
   - En la hoja física la P4 no nombra el servicio explícitamente (dice "demuestre este servicio"). Visualmente muestra 2 teléfonos IP 7960 (ext. 1000 y 2000) y una Laptop.
   - Al contrastar con las separatas de Semana 14 y Semana 15, la telefonía IP / CallManager Express NO forma parte del temario formal de clases.
   - **Decisión**: Se presenta como "Hipótesis sin confirmar". Se provee la respuesta oficial de conectividad/enrutamiento entre subredes con Router 2811 y también los comandos estándar de VoIP en Packet Tracer (`telephony-service`, `ephone-dn`) por si el docente lo dictó como tema extra.
2. **Examen escrito a mano vs simulador de laboratorio**:
   - Siguiendo la indicación del alumno, el examen en hoja impresa es teórico. El módulo entrena la redacción de respuestas escritas: rutas de menús, nombres de pestañas, valores de configuración, comandos de consola y lo que se visualiza en pantalla.
3. **Claves de almacenamiento localStorage**:
   - Para no alterar las estadísticas ni progreso existente, se crearon claves independientes con prefijo `pc3ref_`: `pc3ref_respuestas`, `pc3ref_rubric`, `pc3ref_variante`, `pc3ref_cmd_stats`.
4. **Erratas en guías de laboratorio**:
   - En la guía de la S14 figuraba `0.0.0.0.0` (cinco ceros). Se corrigió al estándar `0.0.0.0`.
5. **Aviso visible obligatorio**:
   - Se incorporó un aviso visible en el módulo: *"Basado en un examen de referencia (fuente externa); tu examen puede ser distinto."*

---

## 5. Sugerencias Extra para Futuras Mejoras
- **Exportación en PDF directo**: Agregar una función de guardado directo a `.pdf` vía biblioteca ligera si en el futuro se requiriera entrega digital de borradores.
- **Modo cronómetro estricto**: Opción para bloquear la edición del área de texto una vez agotados los 60 minutos de simulacro.
