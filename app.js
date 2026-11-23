// APLICACIÓN SIMULADOR PC3 - UTP (REDES Y COMUNICACIÓN DE DATOS I)
// Vanilla JavaScript - 100% Offline, sin dependencias.

(function () {
  'use strict';

  // ==========================================
  // ACCESO SEGURO A LOS DATOS CARGADOS
  // ==========================================
  // Si algún archivo de data/ no se carga (ruta incorrecta, caché, error de
  // red), la aplicación sigue funcionando y muestra un aviso claro en vez de
  // romperse por completo.
  const DATA = {
    preguntas: (typeof PREGUNTAS_DATA !== 'undefined' && Array.isArray(PREGUNTAS_DATA)) ? PREGUNTAS_DATA : [],
    comandos: (typeof COMANDOS_DATA !== 'undefined' && Array.isArray(COMANDOS_DATA)) ? COMANDOS_DATA : [],
    calculo: (typeof CALCULO_DATA !== 'undefined' && Array.isArray(CALCULO_DATA)) ? CALCULO_DATA : [],
    pc3: (typeof PC3_REF_DATA !== 'undefined' && PC3_REF_DATA && typeof PC3_REF_DATA === 'object') ? PC3_REF_DATA : null,
    resumenes: (typeof RESUMENES_DATA !== 'undefined' && RESUMENES_DATA && typeof RESUMENES_DATA === 'object') ? RESUMENES_DATA : {}
  };

  function esArray(valor) {
    return Array.isArray(valor) ? valor : [];
  }

  // Mezcla aleatoria uniforme (Fisher-Yates)
  function mezclarArray(lista) {
    const copia = esArray(lista).slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copia[i];
      copia[i] = copia[j];
      copia[j] = tmp;
    }
    return copia;
  }

  // ---- Avisos en pantalla (reemplazan alert/confirm del navegador) ----
  let avisoTimeoutId = null;

  function mostrarAviso(elemento, mensaje, tipo, duracion) {
    const el = typeof elemento === 'string' ? document.getElementById(elemento) : elemento;
    if (!el) return;
    el.className = 'inline-notice' + (tipo ? ' is-' + tipo : '');
    el.innerHTML = mensaje;
    el.style.display = 'block';
    if (avisoTimeoutId) {
      clearTimeout(avisoTimeoutId);
      avisoTimeoutId = null;
    }
    if (duracion) {
      avisoTimeoutId = setTimeout(function () { el.style.display = 'none'; }, duracion);
    }
  }

  function ocultarAviso(elemento) {
    const el = typeof elemento === 'string' ? document.getElementById(elemento) : elemento;
    if (el) el.style.display = 'none';
  }

  // Confirmación por doble clic: funciona incluso cuando el navegador
  // bloquea los diálogos nativos (alert/confirm).
  function confirmarEnBoton(btn, textoConfirmacion, alConfirmar) {
    if (!btn) return;
    if (btn.dataset.confirmando === '1') {
      btn.dataset.confirmando = '0';
      btn.classList.remove('is-confirming');
      btn.textContent = btn.dataset.textoOriginal || btn.textContent;
      alConfirmar();
      return;
    }
    btn.dataset.textoOriginal = btn.textContent;
    btn.dataset.confirmando = '1';
    btn.classList.add('is-confirming');
    btn.textContent = textoConfirmacion;
    setTimeout(function () {
      if (btn.dataset.confirmando === '1') {
        btn.dataset.confirmando = '0';
        btn.classList.remove('is-confirming');
        btn.textContent = btn.dataset.textoOriginal;
      }
    }, 5000);
  }

  // ---- Validador tolerante de comandos Cisco IOS / consola ----
  function normalizarComando(str) {
    return String(str || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  const EQUIVALENCIAS_COMANDOS = [
    [/^conf\s+t$/, 'configure terminal'],
    [/^sh\s+/, 'show '],
    [/^int\s+/, 'interface '],
    [/^inter\s+/, 'interface '],
    [/^g(\d\/\d\/?\d*)/, 'gigabitethernet $1'],
    [/^f(\d\/\d\/?\d*)/, 'fastethernet $1'],
    [/^sw\s+mo(de)?\s+acc(ess)?/, 'switchport mode access'],
    [/^sw\s+acc(ess)?\s+vlan/, 'switchport access vlan'],
    [/^sw\s+mo(de)?\s+tr(unk)?/, 'switchport mode trunk'],
    [/^encap\s+dot1q/, 'encapsulation dot1q'],
    [/^ip\s+add\s+/, 'ip address '],
    [/^ipv6\s+add\s+/, 'ipv6 address '],
    [/^no\s+sh$/, 'no shutdown'],
    [/^ip\s+dhcp\s+excl\s+/, 'ip dhcp excluded-address ']
  ];

  function validarComandoTolerante(inputStr, cmdObj) {
    const raw = String(inputStr || '').trim();
    if (!raw || !cmdObj) return false;

    // 1. Patrones oficiales declarados en los datos
    for (const pat of esArray(cmdObj.patronesValidos)) {
      try {
        if (pat.test(raw)) return true;
      } catch (e) { /* patrón inválido: se ignora */ }
    }

    // 2. Comparación normalizada con abreviaturas Cisco
    let norm = normalizarComando(raw);
    let solNorm = normalizarComando(cmdObj.solucion);
    if (norm === solNorm) return true;

    for (const [regex, rep] of EQUIVALENCIAS_COMANDOS) {
      norm = norm.replace(regex, rep);
      solNorm = solNorm.replace(regex, rep);
    }

    return norm === solNorm;
  }

  // ---- Banner global de error ----
  function mostrarErrorGlobal(mensaje) {
    const barra = document.getElementById('app-fatal');
    if (!barra || barra.dataset.visible === '1') return;
    barra.dataset.visible = '1';
    barra.innerHTML = '<span>&#9888; ' + mensaje + '</span>' +
      '<button type="button" id="app-fatal-close">Ocultar</button>';
    barra.style.display = 'flex';
    const cerrar = document.getElementById('app-fatal-close');
    if (cerrar) {
      cerrar.addEventListener('click', function () { barra.style.display = 'none'; });
    }
  }

  window.addEventListener('error', function (e) {
    mostrarErrorGlobal('Se produjo un error de JavaScript: ' + (e.message || 'desconocido') +
      '. Abre la consola (F12) para más detalles.');
  });

  window.addEventListener('unhandledrejection', function (e) {
    const motivo = e && e.reason ? (e.reason.message || e.reason) : 'desconocido';
    mostrarErrorGlobal('Se produjo un error asíncrono: ' + motivo + '.');
  });

  // ==========================================
  // ESTADO GLOBAL Y LOCALSTORAGE
  // ==========================================
  const STORAGE_KEY = 'utp_pc3_progreso_v1';

  function estadisticasVacias() {
    return {
      total: 0,
      aciertos: 0,
      fallos: 0,
      semanas: {
        11: { aciertos: 0, fallos: 0 },
        12: { aciertos: 0, fallos: 0 },
        13: { aciertos: 0, fallos: 0 },
        14: { aciertos: 0, fallos: 0 },
        15: { aciertos: 0, fallos: 0 }
      },
      fallosIds: []
    };
  }

  let appState = {
    stats: estadisticasVacias(),
    simulacro: {
      activo: false,
      timerInterval: null,
      segundosRestantes: 0,
      preguntas: [],
      respuestasUsuario: {},
      calificado: false
    },
    comandoActualIdx: 0,
    calculoActual: null,
    flashcards: {
      lista: [],
      actualIdx: 0,
      volteada: false
    }
  };

  function cargarStats() {
    const base = estadisticasVacias();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          base.total = Number(parsed.total) || 0;
          base.aciertos = Number(parsed.aciertos) || 0;
          base.fallos = Number(parsed.fallos) || 0;
          if (parsed.semanas && typeof parsed.semanas === 'object') {
            for (let sem = 11; sem <= 15; sem++) {
              const valor = parsed.semanas[sem];
              if (valor) {
                base.semanas[sem] = {
                  aciertos: Number(valor.aciertos) || 0,
                  fallos: Number(valor.fallos) || 0
                };
              }
            }
          }
          if (Array.isArray(parsed.fallosIds)) {
            base.fallosIds = parsed.fallosIds.filter(id => typeof id === 'string');
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
    }
    appState.stats = base;
  }

  function guardarStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.stats));
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e);
    }
  }

  function registrarIntento(id, semana, esCorrecto) {
    const stats = appState.stats;
    if (!stats.semanas) stats.semanas = estadisticasVacias().semanas;
    if (!Array.isArray(stats.fallosIds)) stats.fallosIds = [];

    const semNum = Number(semana);
    if (!stats.semanas[semNum]) stats.semanas[semNum] = { aciertos: 0, fallos: 0 };

    stats.total = (Number(stats.total) || 0) + 1;
    if (esCorrecto) {
      stats.aciertos = (Number(stats.aciertos) || 0) + 1;
      stats.semanas[semNum].aciertos++;
      // Quitar de fallos si estaba
      const idx = stats.fallosIds.indexOf(id);
      if (idx > -1) {
        stats.fallosIds.splice(idx, 1);
      }
    } else {
      stats.fallos = (Number(stats.fallos) || 0) + 1;
      stats.semanas[semNum].fallos++;
      if (!stats.fallosIds.includes(id)) {
        stats.fallosIds.push(id);
      }
    }
    guardarStats();
    actualizarPanelProgreso();
  }

  // ==========================================
  // NORMALIZACIÓN DE PREGUNTAS Y ARRANQUE SEGURO
  // ==========================================
  function normalizarPregunta(p) {
    if (!p || typeof p !== 'object') return p;

    // 1. Opciones alternativas si falta 'opciones'
    if (!p.opciones) {
      p.opciones = p.options || p.alternativas || p.choices || null;
    }

    // 2. Manejo de tipo verdadero_falso
    if (p.tipo === 'verdadero_falso') {
      if (!p.opciones || !Array.isArray(p.opciones) || p.opciones.length === 0) {
        p.opciones = ['Verdadero', 'Falso'];
      }
      // Soporte para campo booleano 'esVerdadero'
      if (typeof p.esVerdadero === 'boolean' && p.respuesta === undefined && p.correcta === undefined) {
        p.respuesta = p.esVerdadero ? 0 : 1;
      }
    }

    // 3. Unificar 'correcta' o 'answer' hacia 'respuesta'
    if (p.respuesta === undefined) {
      if (p.correcta !== undefined) {
        p.respuesta = p.correcta;
      } else if (p.answer !== undefined) {
        p.respuesta = p.answer;
      }
    }

    // 4. verdadero_falso con respuesta booleana: true -> 0, false -> 1
    if (typeof p.respuesta === 'boolean') {
      p.respuesta = p.respuesta ? 0 : 1;
    }

    // 5. respuesta como letra ("A".."D" o "a".."d") o como texto idéntico a una opción
    if (typeof p.respuesta === 'string') {
      const rTrim = p.respuesta.trim();
      if (/^[a-dA-D]$/.test(rTrim)) {
        p.respuesta = rTrim.toUpperCase().charCodeAt(0) - 65;
      } else if (Array.isArray(p.opciones)) {
        const idxFound = p.opciones.findIndex(op => op.trim().toLowerCase() === rTrim.toLowerCase());
        if (idxFound !== -1) {
          p.respuesta = idxFound;
        }
      }
    }

    // 6. Asegurar que respuesta sea número si es opción múltiple o verdadero/falso numérico
    if ((p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') && typeof p.respuesta === 'string' && !isNaN(Number(p.respuesta))) {
      p.respuesta = parseInt(p.respuesta, 10);
    }

    // 7. Tipo completar: garantizar array respuestasValidas
    if (p.tipo === 'completar' && !p.respuestasValidas && (p.respuesta !== undefined || p.correcta !== undefined)) {
      p.respuestasValidas = [String(p.respuesta !== undefined ? p.respuesta : p.correcta)];
    }

    return p;
  }

  function seguro(nombre, fn, sectionId) {
    try {
      fn();
    } catch (e) {
      console.error(`[Módulo ${nombre} falló al iniciar]`, e);
      if (sectionId) {
        const sec = document.getElementById(sectionId);
        if (sec) {
          const alertBox = document.createElement('div');
          alertBox.className = 'module-init-error';
          alertBox.style.cssText = 'background: #fee2e2; border: 2px solid #ef4444; color: #991b1b; padding: 1rem; margin: 1rem; border-radius: 8px; font-weight: 600;';
          alertBox.innerHTML = `⚠️ Ocurrió un error al inicializar el módulo "${nombre}": ${e.message}. Revisa la consola para más detalles.`;
          sec.prepend(alertBox);
        }
      }
    }
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  document.addEventListener('DOMContentLoaded', function () {
    // Incorporar preguntas teóricas nuevas de PC3 de Referencia al banco general si existen
    if (DATA.pc3 && Array.isArray(DATA.pc3.preguntasTeoricasNuevas)) {
      DATA.pc3.preguntasTeoricasNuevas.forEach(np => {
        if (!DATA.preguntas.some(p => p.id === np.id)) {
          DATA.preguntas.push(np);
        }
      });
    }

    // Normalizar TODO el banco de preguntas teóricas
    DATA.preguntas.forEach(p => normalizarPregunta(p));

    seguro('Stats', cargarStats);
    seguro('Navegación', initNavegacion);
    seguro('Preguntas Teóricas', initModuloPreguntas, 'mod-preguntas');
    seguro('Entrenador de Comandos', initModuloComandos, 'mod-comandos');
    seguro('Ejercicios de Cálculo', initModuloCalculo, 'mod-calculo');
    seguro('Simulacro de Examen', initModuloSimulacro, 'mod-simulacro');
    seguro('Panel de Progreso', initModuloProgreso, 'mod-progreso');
    seguro('Flashcards', initModuloFlashcards, 'mod-flashcards');
    seguro('Resúmenes Teóricos', initModuloResumenes, 'mod-resumenes');

    if (DATA.pc3) {
      seguro('PC3 de Referencia', initModuloPC3Referencia, 'mod-pc3ref');
    } else {
      const pc3Sec = document.getElementById('mod-pc3ref');
      if (pc3Sec) {
        const warn = document.createElement('div');
        warn.className = 'pc3ref-data-missing-notice';
        warn.style.cssText = 'background: #fef3c7; border: 2px solid #f59e0b; color: #92400e; padding: 1.25rem; margin: 1rem; border-radius: 8px; font-weight: 600; text-align: center;';
        warn.innerHTML = '⚠️ No se cargaron los datos de este módulo (<code>data/pc3_referencia.js</code>). ' +
          'Verifica que la carpeta <code>data</code> esté junto a <code>index.html</code> y recarga con <strong>Ctrl + F5</strong>.';
        pc3Sec.prepend(warn);
      }
    }

    // Diagnóstico visible de carga de datos
    seguro('Diagnóstico de datos', renderEstadoDatos);

    // Si falta algún archivo esencial, avisar de forma visible
    const faltantes = [];
    if (DATA.preguntas.length === 0) faltantes.push('data/preguntas.js');
    if (DATA.comandos.length === 0) faltantes.push('data/comandos.js');
    if (DATA.calculo.length === 0) faltantes.push('data/calculo.js');
    if (!DATA.pc3) faltantes.push('data/pc3_referencia.js');

    if (faltantes.length > 0) {
      mostrarErrorGlobal('No se pudieron cargar estos archivos: <code>' + faltantes.join('</code>, <code>') +
        '</code>. Abre la página con Live Server desde la carpeta del proyecto o recarga con Ctrl + F5. ' +
        'También puedes revisar la pestaña <strong>Panel de Progreso</strong>.');
    }
  });

  // ==========================================
  // NAVEGACIÓN ENTRE MÓDULOS (TABS)
  // ==========================================
  function initNavegacion() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.module-section');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetTab = this.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        this.classList.add('active');
        const activeSec = document.getElementById(`mod-${targetTab}`);
        if (activeSec) {
          activeSec.classList.add('active');
        }

        if (targetTab === 'progreso') {
          actualizarPanelProgreso();
          renderEstadoDatos();
        }

        if (targetTab === 'comandos') {
          const termInput = document.getElementById('term-input');
          if (termInput) setTimeout(() => termInput.focus(), 60);
        }

        // Mantener visible la pestaña activa cuando la barra hace scroll horizontal
        try {
          this.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        } catch (e) { /* navegadores antiguos */ }

        // Volver arriba al cambiar de módulo (evita quedar a mitad de una sección larga)
        const headerOffset = document.querySelector('header.app-header');
        if (headerOffset) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ==========================================
  // DIAGNÓSTICO DE CARGA DE DATOS
  // ==========================================
  function renderEstadoDatos() {
    const contenedor = document.getElementById('data-status-list');
    const tarjeta = document.getElementById('data-status-card');
    if (!contenedor) return;

    const fuentes = [
      {
        nombre: 'Banco de preguntas teóricas',
        archivo: 'data/preguntas.js',
        cantidad: DATA.preguntas.length,
        etiqueta: 'preguntas'
      },
      {
        nombre: 'Entrenador de comandos',
        archivo: 'data/comandos.js',
        cantidad: DATA.comandos.length,
        etiqueta: 'ejercicios'
      },
      {
        nombre: 'Ejercicios de cálculo',
        archivo: 'data/calculo.js',
        cantidad: DATA.calculo.length,
        etiqueta: 'generadores'
      },
      {
        nombre: 'PC3 de referencia',
        archivo: 'data/pc3_referencia.js',
        cantidad: DATA.pc3 && Array.isArray(DATA.pc3.preguntas) ? DATA.pc3.preguntas.length : 0,
        etiqueta: 'preguntas escritas'
      },
      {
        nombre: 'Resúmenes teóricos de clase',
        archivo: 'data/resumenes.js',
        cantidad: Object.keys(DATA.resumenes || {}).length,
        etiqueta: 'guías de estudio'
      }
    ];

    let hayFallo = false;
    contenedor.innerHTML = '';

    fuentes.forEach(fuente => {
      const ok = fuente.cantidad > 0;
      if (!ok) hayFallo = true;
      const item = document.createElement('div');
      item.className = 'data-status-item ' + (ok ? 'ok' : 'bad');
      item.innerHTML = `<span>${ok ? '&#9989;' : '&#10060;'}</span>` +
        `<span><strong>${fuente.nombre}</strong><br>` +
        `<code>${fuente.archivo}</code> &rarr; ${fuente.cantidad} ${fuente.etiqueta}</span>`;
      contenedor.appendChild(item);
    });

    const extra = document.createElement('div');
    extra.className = 'data-status-item ' + (DATA.pc3 && DATA.pc3.comandosDrill && DATA.pc3.comandosDrill.length ? 'ok' : 'bad');
    const drill = DATA.pc3 && Array.isArray(DATA.pc3.comandosDrill) ? DATA.pc3.comandosDrill.length : 0;
    if (drill === 0) hayFallo = true;
    extra.innerHTML = `<span>${drill ? '&#9989;' : '&#10060;'}</span>` +
      `<span><strong>Comandos drill (PC3)</strong><br><code>pc3_referencia.js</code> &rarr; ${drill} comandos</span>`;
    contenedor.appendChild(extra);

    if (tarjeta) {
      tarjeta.style.borderLeftColor = hayFallo ? '#dc2626' : '#16a34a';
      tarjeta.style.background = hayFallo ? '#fef2f2' : '#f0fdf4';
    }
  }

  // ==========================================
  // MÓDULO 1: BANCO DE PREGUNTAS TEÓRICAS
  // ==========================================
  function initModuloPreguntas() {
    const filterSemana = document.getElementById('filter-semana-preguntas');
    const filterTipo = document.getElementById('filter-tipo-preguntas');
    const btnReset = document.getElementById('btn-reset-preguntas');
    const PREGUNTAS = DATA.preguntas;

    if (!filterSemana || !filterTipo || !btnReset) return;

    if (PREGUNTAS.length === 0) {
      const container = document.getElementById('preguntas-container');
      if (container) {
        container.innerHTML = '<p style="color: var(--danger); padding: 1.5rem; text-align: center; font-weight: 600;">' +
          'No se cargó el banco de preguntas (data/preguntas.js). Revisa que la carpeta data esté junto a index.html y recarga con Ctrl + F5.</p>';
      }
      return;
    }

    function renderizar() {
      const sem = filterSemana.value;
      const tipo = filterTipo.value;
      const container = document.getElementById('preguntas-container');
      const counter = document.getElementById('preguntas-counter');
      if (!container) return;

      let lista = PREGUNTAS.filter(p => {
        const matchSem = sem === 'todas' || String(p.semana) === sem;
        const matchTipo = tipo === 'todos' || p.tipo === tipo;
        return matchSem && matchTipo;
      });

      if (counter) counter.textContent = `Mostrando ${lista.length} de ${PREGUNTAS.length} preguntas`;
      container.innerHTML = '';

      if (lista.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); padding: 1.5rem; text-align: center;">No hay preguntas que coincidan con los filtros seleccionados.</p>';
        return;
      }

      lista.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'card question-item';
        card.id = `q-card-${p.id}`;

        const meta = document.createElement('div');
        meta.className = 'q-meta';
        meta.innerHTML = `<span class="tag-week">SEMANA ${p.semana}</span> <span class="tag-topic">${p.tema}</span>`;
        card.appendChild(meta);

        const enunciado = document.createElement('div');
        enunciado.className = 'q-text';
        enunciado.textContent = `${idx + 1}. ${p.enunciado}`;
        card.appendChild(enunciado);

        const feedbackBox = document.createElement('div');
        feedbackBox.className = 'feedback-box';
        feedbackBox.id = `fb-${p.id}`;

        // Renderizado según tipo
        if (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') {
          const opciones = Array.isArray(p.opciones) ? p.opciones : [];
          if (p.tipo === 'opcion_multiple' && opciones.length < 2) {
            console.warn(`[Pregunta sin opciones válidas] ID: ${p.id}`);
            const aviso = document.createElement('div');
            aviso.className = 'inline-notice is-warn';
            aviso.innerHTML = '<strong>Pregunta incompleta:</strong> no tiene opciones de respuesta configuradas en <code>data/preguntas.js</code>.';
            card.appendChild(aviso);
            card.appendChild(feedbackBox);
            container.appendChild(card);
            return;
          }

          const optList = document.createElement('div');
          optList.className = 'options-list';

          opciones.forEach((optText, optIdx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span style="font-weight: 700; color: var(--text-muted);">${String.fromCharCode(65 + optIdx)})</span> ${optText}`;

            btn.addEventListener('click', function () {
              if (card.classList.contains('answered')) return;
              card.classList.add('answered');

              const btns = optList.querySelectorAll('.option-btn');
              btns.forEach(b => b.classList.add('disabled'));

              const esCorrecto = optIdx === p.respuesta;
              if (esCorrecto) {
                btn.classList.add('selected-correct');
                feedbackBox.className = 'feedback-box show correct';
                feedbackBox.innerHTML = `<strong>&#10004; ¡Correcto!</strong> ${p.explicacion}`;
              } else {
                btn.classList.add('selected-wrong');
                if (btns[p.respuesta]) {
                  btns[p.respuesta].classList.add('selected-correct');
                }
                feedbackBox.className = 'feedback-box show wrong';
                feedbackBox.innerHTML = `<strong>&#10008; Incorrecto.</strong> ${p.explicacion}`;
              }
              registrarIntento(p.id, p.semana, esCorrecto);
            });

            optList.appendChild(btn);
          });
          card.appendChild(optList);

        } else if (p.tipo === 'completar') {
          const compDiv = document.createElement('div');
          compDiv.style.display = 'flex';
          compDiv.style.gap = '0.5rem';
          compDiv.style.marginBottom = '1rem';
          compDiv.style.flexWrap = 'wrap';

          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'input-text';
          input.style.flex = '1';
          input.style.minWidth = '220px';
          input.placeholder = 'Escriba aquí el término o comando...';

          const btnComprobar = document.createElement('button');
          btnComprobar.className = 'btn btn-primary';
          btnComprobar.textContent = 'Comprobar';

          const rValidas = Array.isArray(p.respuestasValidas) && p.respuestasValidas.length > 0
            ? p.respuestasValidas
            : [String(p.respuesta !== undefined ? p.respuesta : (p.correcta !== undefined ? p.correcta : ''))];

          btnComprobar.addEventListener('click', function () {
            if (card.classList.contains('answered')) return;
            const val = input.value.trim().toLowerCase();
            if (!val) {
              feedbackBox.className = 'feedback-box show warn';
              feedbackBox.innerHTML = 'Escribe un término antes de comprobar.';
              return;
            }

            card.classList.add('answered');
            input.disabled = true;
            btnComprobar.disabled = true;

            const esCorrecto = rValidas.some(r => r.toLowerCase() === val);
            if (esCorrecto) {
              feedbackBox.className = 'feedback-box show correct';
              feedbackBox.innerHTML = `<strong>&#10004; ¡Correcto!</strong> ${p.explicacion}`;
            } else {
              feedbackBox.className = 'feedback-box show wrong';
              feedbackBox.innerHTML = `<strong>&#10008; Respuesta incorrecta.</strong> La respuesta esperada era: <code>${rValidas[0]}</code>.<br>${p.explicacion}`;
            }
            registrarIntento(p.id, p.semana, esCorrecto);
          });

          compDiv.appendChild(input);
          compDiv.appendChild(btnComprobar);
          card.appendChild(compDiv);

        } else if (p.tipo === 'relacionar') {
          const matchContainer = document.createElement('div');
          matchContainer.style.marginBottom = '1rem';

          const pares = Array.isArray(p.pares) ? p.pares : [];
          const opcionesRespuestas = pares.map(item => item.respuesta).sort(() => Math.random() - 0.5);

          const grid = document.createElement('div');
          grid.className = 'match-grid';

          const selectores = [];

          pares.forEach((par, pIdx) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'match-item';
            itemDiv.innerHTML = `<span><strong>${par.premisa}</strong></span>`;

            const select = document.createElement('select');
            select.className = 'filter-select';
            select.innerHTML = '<option value="">-- Seleccionar --</option>' +
              opcionesRespuestas.map(op => `<option value="${op}">${op}</option>`).join('');

            itemDiv.appendChild(select);
            grid.appendChild(itemDiv);
            selectores.push({ select, respuestaEsperada: par.respuesta });
          });

          matchContainer.appendChild(grid);

          const btnValidarMatch = document.createElement('button');
          btnValidarMatch.className = 'btn btn-primary';
          btnValidarMatch.textContent = 'Verificar Relaciones';

          btnValidarMatch.addEventListener('click', function () {
            if (card.classList.contains('answered')) return;
            const completos = selectores.every(s => s.select.value !== '');
            if (!completos) {
              feedbackBox.className = 'feedback-box show warn';
              feedbackBox.innerHTML = 'Selecciona una opción para cada premisa antes de verificar.';
              return;
            }

            card.classList.add('answered');
            btnValidarMatch.disabled = true;
            selectores.forEach(s => s.select.disabled = true);

            let aciertos = 0;
            selectores.forEach(s => {
              if (s.select.value === s.respuestaEsperada) {
                s.select.style.borderColor = 'var(--success)';
                s.select.style.background = 'var(--success-bg)';
                aciertos++;
              } else {
                s.select.style.borderColor = 'var(--danger)';
                s.select.style.background = 'var(--danger-bg)';
              }
            });

            const esCorrecto = aciertos === selectores.length;
            if (esCorrecto) {
              feedbackBox.className = 'feedback-box show correct';
              feedbackBox.innerHTML = `<strong>&#10004; ¡Excelente! Has relacionado todos los conceptos correctamente.</strong><br>${p.explicacion}`;
            } else {
              feedbackBox.className = 'feedback-box show wrong';
              feedbackBox.innerHTML = `<strong>&#10008; Acertaste ${aciertos} de ${selectores.length}.</strong><br>${p.explicacion}`;
            }
            registrarIntento(p.id, p.semana, esCorrecto);
          });

          matchContainer.appendChild(btnValidarMatch);
          card.appendChild(matchContainer);
        } else {
          // Soporte tolerante para tipos desconocidos o nuevos
          const warnDiv = document.createElement('div');
          warnDiv.style.cssText = 'color: var(--text-muted); font-style: italic; margin-bottom: 0.75rem;';
          warnDiv.textContent = `Formato de pregunta (${p.tipo || 'desconocido'}) no admitido en este visor.`;
          card.appendChild(warnDiv);
        }

        card.appendChild(feedbackBox);
        container.appendChild(card);
      });
    }

    filterSemana.addEventListener('change', renderizar);
    filterTipo.addEventListener('change', renderizar);
    btnReset.addEventListener('click', function () {
      renderizar();
      mostrarAviso('preguntas-aviso',
        'Se reiniciaron las tarjetas de esta vista. Tus estadísticas acumuladas se conservan; ' +
        'para borrarlas usa el <strong>Panel de Progreso</strong>.', 'success', 6000);
    });

    renderizar();
  }

  // ==========================================
  // MÓDULO 2: ENTRENADOR DE COMANDOS (TERMINAL)
  // ==========================================
  function initModuloComandos() {
    const select = document.getElementById('select-comando-ejercicio');
    const metaDiv = document.getElementById('cmd-meta');
    const enunciadoDiv = document.getElementById('cmd-enunciado');
    const promptSpan = document.getElementById('term-prompt');
    const termInput = document.getElementById('term-input');
    const termHistory = document.getElementById('term-history');
    const feedbackBox = document.getElementById('cmd-feedback');
    const COMANDOS = DATA.comandos;

    const btnPrev = document.getElementById('btn-cmd-prev');
    const btnNext = document.getElementById('btn-cmd-next');
    const btnPista = document.getElementById('btn-cmd-pista');
    const btnSol = document.getElementById('btn-cmd-solucion');

    if (!select || !termInput || !feedbackBox) return;

    if (COMANDOS.length === 0) {
      const card = document.getElementById('cmd-scenario-card');
      if (card) {
        card.innerHTML = '<strong>No se cargaron los ejercicios de comandos</strong> (data/comandos.js). ' +
          'Verifica la carpeta data y recarga con Ctrl + F5.';
      }
      return;
    }

    // Poblar selector de comandos
    COMANDOS.forEach((cmd, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `[Semana ${cmd.semana}] ${cmd.tema}: Ejercicio ${idx + 1}`;
      select.appendChild(opt);
    });

    function cargarEjercicio(idx) {
      if (idx < 0) idx = 0;
      if (idx >= COMANDOS.length) idx = COMANDOS.length - 1;
      appState.comandoActualIdx = idx;
      select.value = idx;

      const c = COMANDOS[idx];
      metaDiv.textContent = `SEMANA ${c.semana} • ${c.tema}`;
      enunciadoDiv.textContent = c.enunciado;
      promptSpan.textContent = c.prompt;

      termInput.value = '';
      termInput.disabled = false;
      termInput.focus();

      feedbackBox.className = 'feedback-box';
      feedbackBox.style.display = 'none';
      feedbackBox.innerHTML = '';

      termHistory.textContent = `Terminal Cisco IOS / Consola activa.\nModo actual: ${c.prompt}\nEscriba la sintaxis y presione [Enter]:`;
    }

    termInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;

      const cmd = COMANDOS[appState.comandoActualIdx];
      const val = termInput.value;
      if (!val.trim()) {
        // No registrar un intento vacío como fallo
        feedbackBox.className = 'feedback-box show warn';
        feedbackBox.innerHTML = 'Escribe un comando antes de presionar [Enter].';
        return;
      }

      const esCorrecto = validarComandoTolerante(val, cmd);

      termHistory.textContent += `\n${cmd.prompt}${val}`;
      termInput.value = '';

      if (esCorrecto) {
        termHistory.textContent += `\n[OK] Comando reconocido y aplicado correctamente.`;
        feedbackBox.className = 'feedback-box show correct';
        feedbackBox.innerHTML = `<strong>&#10004; ¡Excelente! Sintaxis correcta:</strong> <code>${cmd.solucion}</code><br>${cmd.explicacion}`;
        registrarIntento(cmd.id, cmd.semana, true);
      } else {
        termHistory.textContent += `\n% Invalid input detected at '^' marker / Comando no reconocido.`;
        feedbackBox.className = 'feedback-box show wrong';
        feedbackBox.innerHTML = `<strong>&#10008; Sintaxis incorrecta.</strong> Revise los parámetros requeridos. Puedes presionar <em>Ver Pista</em> si necesitas ayuda.`;
        registrarIntento(cmd.id, cmd.semana, false);
      }

      const body = document.getElementById('term-body');
      if (body) body.scrollTop = body.scrollHeight;
      termInput.focus();
    });

    select.addEventListener('change', () => cargarEjercicio(parseInt(select.value, 10)));
    btnPrev.addEventListener('click', () => cargarEjercicio(appState.comandoActualIdx - 1));
    btnNext.addEventListener('click', () => cargarEjercicio(appState.comandoActualIdx + 1));

    btnPista.addEventListener('click', function () {
      const c = COMANDOS[appState.comandoActualIdx];
      const pistas = esArray(c.pistas);
      feedbackBox.className = 'feedback-box show hint';
      feedbackBox.innerHTML = `<strong>&#128161; Pista para el ejercicio:</strong><ul style="margin:0.4rem 0 0 1.1rem;">` +
        pistas.map(p => `<li>${p}</li>`).join('') + '</ul>';
      feedbackBox.style.display = 'block';
    });

    btnSol.addEventListener('click', function () {
      const c = COMANDOS[appState.comandoActualIdx];
      feedbackBox.className = 'feedback-box show correct';
      feedbackBox.innerHTML = `<strong>Solución esperada:</strong> <code>${c.solucion}</code><br><strong>Explicación:</strong> ${c.explicacion}`;
      feedbackBox.style.display = 'block';
    });

    cargarEjercicio(0);
  }

  // ==========================================
  // MÓDULO 3: EJERCICIOS DE CÁLCULO
  // ==========================================
  function initModuloCalculo() {
    const select = document.getElementById('select-calculo-tipo');
    const btnNuevo = document.getElementById('btn-calc-nuevo');
    const btnVerificar = document.getElementById('btn-calc-verificar');
    const btnPasos = document.getElementById('btn-calc-pasos');
    const metaDiv = document.getElementById('calc-meta');
    const tituloH3 = document.getElementById('calc-titulo');
    const enunciadoDiv = document.getElementById('calc-enunciado');
    const input = document.getElementById('calc-input');
    const feedbackBox = document.getElementById('calc-feedback');
    const pasosBox = document.getElementById('calc-pasos-box');
    const pasosLista = document.getElementById('calc-pasos-lista');
    const CALCULOS = DATA.calculo;

    if (!select || !btnVerificar || !btnNuevo) return;

    if (CALCULOS.length === 0) {
      if (enunciadoDiv) {
        enunciadoDiv.textContent = 'No se cargaron los generadores de cálculo (data/calculo.js). ' +
          'Verifica la carpeta data y recarga con Ctrl + F5.';
      }
      return;
    }

    // Llenar selector
    CALCULOS.forEach((calc, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `[Semana ${calc.semana}] ${calc.titulo}`;
      select.appendChild(opt);
    });

    function generarVariante() {
      const idx = parseInt(select.value, 10);
      const template = CALCULOS[idx];
      const instancia = template.generar();

      appState.calculoActual = {
        template: template,
        instancia: instancia
      };

      metaDiv.textContent = `SEMANA ${template.semana} • ${template.tema}`;
      tituloH3.textContent = template.titulo;
      enunciadoDiv.textContent = instancia.enunciado;
      input.value = '';
      input.placeholder = instancia.placeholder || 'Tu respuesta...';
      input.focus();

      feedbackBox.className = 'feedback-box';
      feedbackBox.style.display = 'none';
      feedbackBox.innerHTML = '';
      pasosBox.style.display = 'none';

      pasosLista.innerHTML = esArray(instancia.pasos).map(p => `<li>${p}</li>`).join('');
    }

    btnNuevo.addEventListener('click', generarVariante);
    select.addEventListener('change', generarVariante);

    btnVerificar.addEventListener('click', function () {
      if (!appState.calculoActual) return;
      const inst = appState.calculoActual.instancia;
      const tmpl = appState.calculoActual.template;
      const val = input.value.trim();

      if (!val) {
        feedbackBox.className = 'feedback-box show warn';
        feedbackBox.innerHTML = 'Ingresa un resultado antes de verificar.';
        feedbackBox.style.display = 'block';
        return;
      }

      let esCorrecto = false;

      if (typeof inst.validador === 'function') {
        esCorrecto = inst.validador(val);
      } else if (inst.tipoInput === 'numero') {
        const numVal = parseFloat(val.replace(',', '.'));
        const esperada = inst.respuestaCorrecta;
        const tol = inst.tolerancia || 0.001;
        esCorrecto = !isNaN(numVal) && Math.abs(numVal - esperada) <= tol;
      } else {
        esCorrecto = val.toLowerCase() === inst.respuestaCorrecta.toString().toLowerCase();
      }

      if (esCorrecto) {
        feedbackBox.className = 'feedback-box show correct';
        feedbackBox.innerHTML = `<strong>&#10004; ¡Cálculo Correcto!</strong> El resultado es <strong>${inst.respuestaCorrecta} ${inst.unidad || ''}</strong>.`;
      } else {
        feedbackBox.className = 'feedback-box show wrong';
        feedbackBox.innerHTML = `<strong>&#10008; Valor incorrecto.</strong> El resultado correcto es: <strong>${inst.respuestaCorrecta} ${inst.unidad || ''}</strong>. Haz clic en 'Ver Paso a Paso' para revisar la fórmula.`;
      }
      feedbackBox.style.display = 'block';
      registrarIntento(tmpl.id, tmpl.semana, esCorrecto);
    });

    btnPasos.addEventListener('click', function () {
      if (pasosBox.style.display === 'none') {
        pasosBox.style.display = 'block';
      } else {
        pasosBox.style.display = 'none';
      }
    });

    // Enter en el input también verifica
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnVerificar.click();
      }
    });

    generarVariante();
  }

  // ==========================================
  // MÓDULO 4: SIMULACRO DE EXAMEN
  // ==========================================
  function initModuloSimulacro() {
    const configDiv = document.getElementById('simulacro-config');
    const activoDiv = document.getElementById('simulacro-activo');
    const resultadoDiv = document.getElementById('simulacro-resultado');

    const selectTiempo = document.getElementById('simulacro-tiempo');
    const btnIniciar = document.getElementById('btn-iniciar-simulacro');
    const btnFinalizar = document.getElementById('btn-finalizar-simulacro');
    const btnReintentar = document.getElementById('btn-reintentar-simulacro');
    const btnVerFallos = document.getElementById('btn-ver-fallos-simulacro');
    const avisoBox = document.getElementById('simulacro-aviso');

    const timerSpan = document.getElementById('simulacro-timer');
    const preguntasLista = document.getElementById('simulacro-preguntas-lista');
    const revisionContainer = document.getElementById('simulacro-revision-container');

    if (!btnIniciar || !btnFinalizar) return;

    btnIniciar.addEventListener('click', function () {
      iniciarSimulacro(parseInt(selectTiempo.value, 10));
    });

    btnFinalizar.addEventListener('click', function () {
      confirmarEnBoton(btnFinalizar, '¿Entregar? Haz clic otra vez', function () {
        finalizarSimulacro(false);
      });
    });

    btnReintentar.addEventListener('click', function () {
      resultadoDiv.style.display = 'none';
      configDiv.style.display = 'block';
      activoDiv.style.display = 'none';
    });

    btnVerFallos.addEventListener('click', function () {
      try {
        revisionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) { /* navegadores antiguos */ }
    });

    function iniciarSimulacro(minutos) {
      configDiv.style.display = 'none';
      resultadoDiv.style.display = 'none';
      activoDiv.style.display = 'block';
      ocultarAviso(avisoBox);
      revisionContainer.innerHTML = '';

      // Restaurar el botón de finalizar si quedó en modo confirmación
      btnFinalizar.dataset.confirmando = '0';
      btnFinalizar.classList.remove('is-confirming');
      btnFinalizar.textContent = btnFinalizar.dataset.textoOriginal || 'Finalizar y Calificar';

      appState.simulacro.activo = true;
      appState.simulacro.calificado = false;
      appState.simulacro.respuestasUsuario = {};

      // Armar las 20 preguntas del simulacro ponderadas por semana
      // 10 preguntas teóricas (2 de cada semana 11-15)
      // 5 de comandos (1 de cada semana 11-15)
      // 5 de cálculo (repartidas)
      let examSet = [];

      for (let s = 11; s <= 15; s++) {
        const teoricasSemana = mezclarArray(DATA.preguntas.filter(p => Number(p.semana) === s));
        if (teoricasSemana[0]) examSet.push({ tipoItem: 'teoria', data: teoricasSemana[0] });
        if (teoricasSemana[1]) examSet.push({ tipoItem: 'teoria', data: teoricasSemana[1] });

        const cmdSemana = mezclarArray(DATA.comandos.filter(c => Number(c.semana) === s));
        if (cmdSemana[0]) examSet.push({ tipoItem: 'comando', data: cmdSemana[0] });
      }

      // 5 ejercicios de cálculo
      const calcMezclados = mezclarArray(DATA.calculo.slice());
      for (let i = 0; i < 5 && i < calcMezclados.length; i++) {
        try {
          const inst = calcMezclados[i].generar();
          examSet.push({ tipoItem: 'calculo', data: calcMezclados[i], instancia: inst });
        } catch (e) {
          console.warn('No se pudo generar un ejercicio de cálculo para el simulacro:', e);
        }
      }

      if (examSet.length === 0) {
        activoDiv.style.display = 'none';
        configDiv.style.display = 'block';
        mostrarAviso(avisoBox, 'No hay datos suficientes para generar el simulacro. Revisa el <strong>Panel de Progreso</strong> para ver el estado de carga.', 'error');
        return;
      }

      appState.simulacro.preguntas = examSet;
      renderizarPreguntasSimulacro();

      // Temporizador
      if (appState.simulacro.timerInterval) {
        clearInterval(appState.simulacro.timerInterval);
        appState.simulacro.timerInterval = null;
      }

      if (minutos > 0) {
        appState.simulacro.segundosRestantes = minutos * 60;
        actualizarTimerUI();
        appState.simulacro.timerInterval = setInterval(function () {
          appState.simulacro.segundosRestantes--;
          actualizarTimerUI();
          if (appState.simulacro.segundosRestantes <= 0) {
            clearInterval(appState.simulacro.timerInterval);
            appState.simulacro.timerInterval = null;
            mostrarAviso(avisoBox, '&#9201; ¡El tiempo del examen ha finalizado! Se calificó automáticamente tu simulacro.', 'warn');
            finalizarSimulacro(true);
          }
        }, 1000);
      } else {
        appState.simulacro.segundosRestantes = 0;
        if (timerSpan) {
          timerSpan.textContent = 'Sin límite';
          timerSpan.style.color = '#38bdf8';
        }
      }

      // Llevar al inicio del examen
      try {
        activoDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) { /* navegadores antiguos */ }
    }

    function actualizarTimerUI() {
      if (!timerSpan) return;
      const seg = Math.max(0, appState.simulacro.segundosRestantes);
      const m = Math.floor(seg / 60);
      const s = seg % 60;
      timerSpan.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      if (seg < 300) {
        timerSpan.style.color = '#ef4444'; // Alerta roja últimos 5 minutos
      } else {
        timerSpan.style.color = '#38bdf8';
      }
    }

    function renderizarPreguntasSimulacro() {
      preguntasLista.innerHTML = '';

      appState.simulacro.preguntas.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginBottom = '1.25rem';

        const numPto = idx + 1;
        const meta = document.createElement('div');
        meta.className = 'q-meta';

        if (item.tipoItem === 'teoria') {
          meta.innerHTML = `<span class="tag-week">SEMANA ${item.data.semana}</span> <span class="tag-topic">Teoría: ${item.data.tema}</span> <span style="margin-left: auto; font-weight:700;">[1.0 Pto]</span>`;
          card.appendChild(meta);

          const enunciado = document.createElement('div');
          enunciado.className = 'q-text';
          enunciado.textContent = `${numPto}. ${item.data.enunciado}`;
          card.appendChild(enunciado);

          if (item.data.tipo === 'opcion_multiple' || item.data.tipo === 'verdadero_falso') {
            const list = document.createElement('div');
            list.className = 'options-list';
            (item.data.opciones || []).forEach((op, opIdx) => {
              const label = document.createElement('label');
              label.style.display = 'flex';
              label.style.alignItems = 'center';
              label.style.gap = '0.5rem';
              label.style.padding = '0.5rem';
              label.style.cursor = 'pointer';
              label.innerHTML = `<input type="radio" name="sim-q-${idx}" value="${opIdx}"> <span>${op}</span>`;
              label.querySelector('input').addEventListener('change', function () {
                appState.simulacro.respuestasUsuario[idx] = parseInt(this.value, 10);
              });
              list.appendChild(label);
            });
            card.appendChild(list);
          } else if (item.data.tipo === 'completar') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-text';
            input.style.width = '100%';
            input.placeholder = 'Escriba su respuesta...';
            input.addEventListener('input', function () {
              appState.simulacro.respuestasUsuario[idx] = this.value;
            });
            card.appendChild(input);
          } else if (item.data.tipo === 'relacionar') {
            const matchContainer = document.createElement('div');
            matchContainer.style.marginBottom = '0.75rem';

            const pares = Array.isArray(item.data.pares) ? item.data.pares : [];
            const opcionesRespuestas = mezclarArray(pares.map(p => p.respuesta));

            const grid = document.createElement('div');
            grid.className = 'match-grid';

            pares.forEach((par, pIdx) => {
              const itemDiv = document.createElement('div');
              itemDiv.className = 'match-item';
              itemDiv.innerHTML = `<span><strong>${par.premisa}</strong></span>`;

              const select = document.createElement('select');
              select.className = 'filter-select';
              select.innerHTML = '<option value="">-- Seleccionar --</option>' +
                opcionesRespuestas.map(op => `<option value="${op}">${op}</option>`).join('');

              select.addEventListener('change', function () {
                if (!appState.simulacro.respuestasUsuario[idx] || typeof appState.simulacro.respuestasUsuario[idx] !== 'object') {
                  appState.simulacro.respuestasUsuario[idx] = {};
                }
                appState.simulacro.respuestasUsuario[idx][pIdx] = this.value;
              });

              itemDiv.appendChild(select);
              grid.appendChild(itemDiv);
            });

            matchContainer.appendChild(grid);
            card.appendChild(matchContainer);
          } else {
            const warnBox = document.createElement('div');
            warnBox.className = 'inline-notice is-warn';
            warnBox.style.display = 'block';
            warnBox.innerHTML = `<strong>Aviso:</strong> Formato de pregunta desconocido (${item.data.tipo || 'no especificado'}).`;
            card.appendChild(warnBox);
          }

        } else if (item.tipoItem === 'comando') {
          meta.innerHTML = `<span class="tag-week">SEMANA ${item.data.semana}</span> <span class="tag-topic">Comando Cisco: ${item.data.tema}</span> <span style="margin-left: auto; font-weight:700;">[1.0 Pto]</span>`;
          card.appendChild(meta);

          const enunciado = document.createElement('div');
          enunciado.className = 'q-text';
          enunciado.textContent = `${numPto}. [Prompt: ${item.data.prompt}] ${item.data.enunciado}`;
          card.appendChild(enunciado);

          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'input-text';
          input.style.width = '100%';
          input.placeholder = `Escriba el comando aquí... (ej. ${item.data.prompt})`;
          input.addEventListener('input', function () {
            appState.simulacro.respuestasUsuario[idx] = this.value;
          });
          card.appendChild(input);

        } else if (item.tipoItem === 'calculo') {
          meta.innerHTML = `<span class="tag-week">SEMANA ${item.data.semana}</span> <span class="tag-topic">Cálculo: ${item.data.titulo}</span> <span style="margin-left: auto; font-weight:700;">[1.0 Pto]</span>`;
          card.appendChild(meta);

          const enunciado = document.createElement('div');
          enunciado.className = 'q-text';
          enunciado.textContent = `${numPto}. ${item.instancia.enunciado}`;
          card.appendChild(enunciado);

          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'input-text';
          input.style.width = '100%';
          input.placeholder = item.instancia.placeholder || 'Ingrese valor...';
          input.addEventListener('input', function () {
            appState.simulacro.respuestasUsuario[idx] = this.value;
          });
          card.appendChild(input);
        }

        preguntasLista.appendChild(card);
      });
    }

    function finalizarSimulacro() {
      if (appState.simulacro.timerInterval) {
        clearInterval(appState.simulacro.timerInterval);
      }
      appState.simulacro.activo = false;
      appState.simulacro.calificado = true;

      activoDiv.style.display = 'none';
      resultadoDiv.style.display = 'block';

      let puntaje = 0;
      let revisionHtml = '';

      appState.simulacro.preguntas.forEach((item, idx) => {
        const numPto = idx + 1;
        const rUser = appState.simulacro.respuestasUsuario[idx];
        let puntajeItem = 0;
        let esCorrecto = false;
        let respuestaEsperadaTxt = '';
        let tuRespuestaTxt = '';
        let explicacionTxt = '';

        if (item.tipoItem === 'teoria') {
          explicacionTxt = item.data.explicacion;
          if (item.data.tipo === 'opcion_multiple' || item.data.tipo === 'verdadero_falso') {
            esCorrecto = rUser === item.data.respuesta;
            puntajeItem = esCorrecto ? 1.0 : 0.0;
            const elegida = (item.data.opciones && item.data.opciones[rUser] !== undefined)
              ? item.data.opciones[rUser]
              : '(Sin responder)';
            tuRespuestaTxt = `<code>${elegida}</code>`;
            respuestaEsperadaTxt = (item.data.opciones && item.data.opciones[item.data.respuesta] !== undefined)
              ? `<code>${item.data.opciones[item.data.respuesta]}</code>`
              : `<code>Opción ${item.data.respuesta}</code>`;
          } else if (item.data.tipo === 'completar') {
            const valList = Array.isArray(item.data.respuestasValidas) && item.data.respuestasValidas.length > 0
              ? item.data.respuestasValidas
              : [String(item.data.respuesta !== undefined ? item.data.respuesta : '')];
            esCorrecto = Boolean(rUser && valList.some(r => r.toLowerCase() === rUser.trim().toLowerCase()));
            puntajeItem = esCorrecto ? 1.0 : 0.0;
            tuRespuestaTxt = `<code>${rUser !== undefined && rUser !== '' ? rUser : '(Sin responder)'}</code>`;
            respuestaEsperadaTxt = `<code>${valList[0]}</code>`;
          } else if (item.data.tipo === 'relacionar') {
            const pares = Array.isArray(item.data.pares) ? item.data.pares : [];
            let aciertosPares = 0;
            const respUserObj = (rUser && typeof rUser === 'object') ? rUser : {};
            const revisionPares = pares.map((par, pIdx) => {
              const elegida = respUserObj[pIdx] || '(Sin seleccionar)';
              const acerto = elegida === par.respuesta;
              if (acerto) aciertosPares++;
              return `<li><strong>${par.premisa}</strong> &rarr; tu respuesta: <code>${elegida}</code> ${acerto ? '&#10004;' : '&#10008;'} (Correcta: <code>${par.respuesta}</code>)</li>`;
            });
            puntajeItem = pares.length > 0 ? (aciertosPares / pares.length) : 0;
            esCorrecto = pares.length > 0 && aciertosPares === pares.length;
            tuRespuestaTxt = `Pares acertados: <strong>${aciertosPares} de ${pares.length}</strong>`;
            respuestaEsperadaTxt = `<ul style="margin:0.25rem 0 0 1rem; padding-left:0.5rem;">${revisionPares.join('')}</ul>`;
          } else {
            esCorrecto = false;
            puntajeItem = 0.0;
            tuRespuestaTxt = `Formato desconocido (${item.data.tipo || 'desconocido'})`;
            respuestaEsperadaTxt = 'No evaluable';
          }
        } else if (item.tipoItem === 'comando') {
          explicacionTxt = item.data.explicacion;
          respuestaEsperadaTxt = `<code>${item.data.solucion}</code>`;
          if (rUser) {
            tuRespuestaTxt = `<code>${rUser}</code>`;
            const raw = rUser.trim();
            if (item.data.patronesValidos && item.data.patronesValidos.some(p => p.test(raw))) {
              esCorrecto = true;
            } else if (raw.toLowerCase() === item.data.solucion.toLowerCase()) {
              esCorrecto = true;
            } else {
              esCorrecto = validarComandoTolerante(raw, item.data);
            }
          } else {
            tuRespuestaTxt = '<code>(Sin responder)</code>';
          }
          puntajeItem = esCorrecto ? 1.0 : 0.0;
        } else if (item.tipoItem === 'calculo') {
          explicacionTxt = Array.isArray(item.instancia.pasos) ? item.instancia.pasos.join('<br>') : '';
          respuestaEsperadaTxt = `<code>${item.instancia.respuestaCorrecta} ${item.instancia.unidad || ''}</code>`;
          if (rUser) {
            tuRespuestaTxt = `<code>${rUser}</code>`;
            if (typeof item.instancia.validador === 'function') {
              esCorrecto = item.instancia.validador(rUser);
            } else if (item.instancia.tipoInput === 'numero') {
              const num = parseFloat(rUser.replace(',', '.'));
              const tol = item.instancia.tolerancia || 0.001;
              esCorrecto = !isNaN(num) && Math.abs(num - item.instancia.respuestaCorrecta) <= tol;
            } else {
              esCorrecto = rUser.trim().toLowerCase() === item.instancia.respuestaCorrecta.toString().toLowerCase();
            }
          } else {
            tuRespuestaTxt = '<code>(Sin responder)</code>';
          }
          puntajeItem = esCorrecto ? 1.0 : 0.0;
        }

        puntaje += puntajeItem;
        registrarIntento(`sim-${idx}`, item.data.semana, esCorrecto);

        // Bloque de revisión
        revisionHtml += `
          <div class="card" style="border-left: 4px solid ${puntajeItem >= 1.0 ? 'var(--success)' : (puntajeItem > 0 ? 'var(--warning)' : 'var(--danger)')}; margin-bottom: 1rem;">
            <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:0.25rem;">
              <span>Pregunta ${numPto} (${item.tipoItem.toUpperCase()} - SEMANA ${item.data.semana})</span>
              <span style="color:${puntajeItem >= 1.0 ? 'var(--success)' : (puntajeItem > 0 ? 'var(--warning)' : 'var(--danger)')};">${puntajeItem >= 1.0 ? '+1.0 Pto (Correcto)' : (puntajeItem > 0 ? `+${puntajeItem.toFixed(2)} Ptos (Parcial)` : '0.0 Ptos (Incorrecto)')}</span>
            </div>
            <p style="font-size:0.92rem; margin-bottom:0.5rem;"><strong>Tu respuesta:</strong> ${tuRespuestaTxt}</p>
            <div style="font-size:0.92rem; margin-bottom:0.5rem; color:#1e293b;"><strong>Solución esperada:</strong> ${respuestaEsperadaTxt}</div>
            <div style="background:#f8fafc; padding:0.75rem; border-radius:6px; font-size:0.88rem; color:var(--text-muted); border:1px solid var(--border);">
              <strong>Explicación:</strong><br>${explicacionTxt}
            </div>
          </div>
        `;
      });

      // Calificación escala 0-20
      const gradeDisplay = document.getElementById('grade-display');
      const gradeStatus = document.getElementById('grade-status');
      const gradeFeedback = document.getElementById('grade-feedback');

      gradeDisplay.textContent = `${puntaje.toFixed(1)} / 20.0`;

      if (puntaje >= 12.0) {
        gradeDisplay.className = 'grade-number pass';
        gradeStatus.style.color = 'var(--success)';
        gradeStatus.textContent = `APROBADO (Nota: ${puntaje.toFixed(1)})`;
        gradeFeedback.textContent = '¡Felicidades! Has superado la nota mínima aprobatoria (12.0) según el sílabo de la UTP.';
      } else {
        gradeDisplay.className = 'grade-number fail';
        gradeStatus.style.color = 'var(--danger)';
        gradeStatus.textContent = `DESAPROBADO (Nota: ${puntaje.toFixed(1)})`;
        gradeFeedback.textContent = 'Tu nota es menor a 12.0. Revisa el detalle de fallos y vuelve a practicar los temas con debilidad.';
      }

      revisionContainer.innerHTML = '<h3 style="margin-bottom: 1rem;">Detalle de Respuestas y Corrección:</h3>' + revisionHtml;
    }
  }

  // ==========================================
  // MÓDULO 5: PANEL DE PROGRESO
  // ==========================================
  function initModuloProgreso() {
    const btnRepasarFallos = document.getElementById('btn-repasar-fallos');
    const btnResetStats = document.getElementById('btn-reset-stats');

    btnRepasarFallos.addEventListener('click', function () {
      if (appState.stats.fallosIds.length === 0) {
        alert('¡No tienes preguntas falladas registradas! Sigue practicando en el Banco de Preguntas o Comandos.');
        return;
      }
      mostrarRevisionFallos();
    });

    btnResetStats.addEventListener('click', function () {
      if (confirm('¿Deseas reiniciar todas tus estadísticas acumuladas? Esta acción no se puede deshacer.')) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          console.warn('Error al limpiar localStorage:', e);
        }
        appState.stats = {
          total: 0,
          aciertos: 0,
          fallos: 0,
          semanas: {
            11: { aciertos: 0, fallos: 0 },
            12: { aciertos: 0, fallos: 0 },
            13: { aciertos: 0, fallos: 0 },
            14: { aciertos: 0, fallos: 0 },
            15: { aciertos: 0, fallos: 0 }
          },
          fallosIds: []
        };
        actualizarPanelProgreso();
        const fallosBox = document.getElementById('fallos-review-box');
        if (fallosBox) fallosBox.style.display = 'none';
        alert('Estadísticas reiniciadas con éxito.');
      }
    });

    actualizarPanelProgreso();
  }

  function actualizarPanelProgreso() {
    const totalEl = document.getElementById('stat-total-resueltas');
    const aciertosEl = document.getElementById('stat-aciertos');
    const fallosEl = document.getElementById('stat-fallos');
    const porcentajeEl = document.getElementById('stat-porcentaje');
    const semanasContainer = document.getElementById('stats-semanas-container');

    if (!totalEl) return;

    const s = appState.stats;
    totalEl.textContent = s.total;
    aciertosEl.textContent = s.aciertos;
    fallosEl.textContent = s.fallos;

    const pct = s.total > 0 ? Math.round((s.aciertos / s.total) * 100) : 0;
    porcentajeEl.textContent = `${pct}%`;

    // Desglose por semana
    let html = '';
    const nombresSemana = {
      11: 'Semana 11: Capa de Transporte (TCP, UDP, Sockets, Wireshark)',
      12: 'Semana 12: Subneteo IPv6, ICMPv6, NDP, EIGRP',
      13: 'Semana 13: Capa de Aplicación (DNS, HTTP, SLAAC + DHCPv6)',
      14: 'Semana 14: DHCPv4/v6, FTP, SMB, SMTP, POP3, IMAP, Rutas Estáticas',
      15: 'Semana 15: VLANs, Router-on-a-Stick dot1q, VTP, Seguridad de Red'
    };

    for (let sem = 11; sem <= 15; sem++) {
      const semStat = s.semanas[sem] || { aciertos: 0, fallos: 0 };
      const subTotal = semStat.aciertos + semStat.fallos;
      const semPct = subTotal > 0 ? Math.round((semStat.aciertos / subTotal) * 100) : 0;

      html += `
        <div style="margin-bottom: 1rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.88rem; font-weight:600;">
            <span>${nombresSemana[sem]}</span>
            <span>${semStat.aciertos} / ${subTotal} (${semPct}%)</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-fill" style="width: ${semPct}%; background-color: ${semPct >= 60 ? 'var(--success)' : (semPct > 30 ? 'var(--warning)' : 'var(--primary)')};"></div>
          </div>
        </div>
      `;
    }
    semanasContainer.innerHTML = html;

    // Actualizar Estadísticas de PC3 de Referencia (si existen los elementos)
    const pc3RefPuntosEl = document.getElementById('stat-pc3ref-puntos');
    const pc3RefRespEl = document.getElementById('stat-pc3ref-respondidas');
    const pc3RefCmdsEl = document.getElementById('stat-pc3ref-cmds');

    if (pc3RefPuntosEl && pc3RefRespEl && pc3RefCmdsEl) {
      try {
        const rubricSaved = JSON.parse(localStorage.getItem('pc3ref_rubric') || '{}');
        let totalPuntos = 0;
        if (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.preguntas)) {
          PC3_REF_DATA.preguntas.forEach(p => {
            (p.puntosClave || []).forEach(pt => {
              if (rubricSaved[pt.id]) {
                totalPuntos += pt.valor;
              }
            });
          });
        }
        pc3RefPuntosEl.textContent = `${totalPuntos.toFixed(1)} / 20`;

        const respSaved = JSON.parse(localStorage.getItem('pc3ref_respuestas') || '{}');
        let respCount = 0;
        ['p1', 'p2', 'p3', 'p4'].forEach(qid => {
          if (respSaved[qid] && respSaved[qid].trim().length > 10) {
            respCount++;
          }
        });
        pc3RefRespEl.textContent = `${respCount} / 4`;

        const cmdStats = JSON.parse(localStorage.getItem('pc3ref_cmd_stats') || '{"aciertos":0}');
        const totalCmds = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.comandosDrill)) ? PC3_REF_DATA.comandosDrill.length : 10;
        pc3RefCmdsEl.textContent = `${cmdStats.aciertos || 0} / ${totalCmds}`;
      } catch (e) {
        console.warn('Error leyendo stats de pc3ref:', e);
      }
    }

    const btnRepasarFallos = document.getElementById('btn-repasar-fallos');
    if (btnRepasarFallos) {
      const cantFallos = Array.isArray(appState.stats.fallosIds) ? appState.stats.fallosIds.length : 0;
      btnRepasarFallos.innerHTML = `&#128260; Repasar Solo Mis Fallos (${cantFallos})`;
      btnRepasarFallos.disabled = cantFallos === 0;
    }
  }

  function mostrarRevisionFallos() {
    const fallosBox = document.getElementById('fallos-review-box');
    const fallosList = document.getElementById('fallos-list-container');
    if (!fallosBox || !fallosList) return;
    fallosBox.style.display = 'block';
    fallosList.innerHTML = '';

    const fallosIds = esArray(appState.stats.fallosIds);

    if (fallosIds.length === 0) {
      fallosList.innerHTML = '<p style="color:var(--text-muted); padding:1rem; text-align:center;">¡No tienes fallos registrados! Tu historial está limpio.</p>';
      return;
    }

    const heading = document.createElement('div');
    heading.style.cssText = 'font-size:0.95rem; font-weight:700; color:var(--danger); margin-bottom:1rem;';
    heading.textContent = `Mostrando ${fallosIds.length} ejercicio(s) con fallos registrados:`;
    fallosList.appendChild(heading);

    fallosIds.forEach((falloId) => {
      // 1. Buscar en DATA.preguntas (fusionadas)
      const p = DATA.preguntas.find(item => item.id === falloId);
      if (p) {
        let respCorrectaTxt = '';
        if (p.opciones && p.opciones[p.respuesta] !== undefined) {
          respCorrectaTxt = p.opciones[p.respuesta];
        } else if (p.respuestasValidas && p.respuestasValidas[0]) {
          respCorrectaTxt = p.respuestasValidas.join(' / ');
        } else if (p.pares && Array.isArray(p.pares)) {
          respCorrectaTxt = p.pares.map(pr => `${pr.premisa} &rarr; ${pr.respuesta}`).join('<br>');
        } else {
          respCorrectaTxt = p.respuesta !== undefined ? p.respuesta : 'Consultar solución';
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderLeft = '4px solid var(--danger)';
        card.style.marginBottom = '1rem';
        card.innerHTML = `
          <div class="q-meta">
            <span class="tag-week">SEMANA ${p.semana}</span>
            <span class="tag-topic">Teoría: ${p.tema}</span>
            <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted);">ID: ${p.id}</span>
          </div>
          <div class="q-text">${p.enunciado}</div>
          <div style="background:var(--success-bg); border:1px solid #bbf7d0; padding:0.75rem; border-radius:6px; font-size:0.9rem; margin-top:0.5rem; color:#166534;">
            <strong>Respuesta correcta:</strong><br>${respCorrectaTxt}<br><br>
            <strong>Explicación:</strong> ${p.explicacion}
          </div>
        `;
        fallosList.appendChild(card);
        return;
      }

      // 2. Buscar en DATA.comandos
      const c = DATA.comandos.find(item => item.id === falloId);
      if (c) {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderLeft = '4px solid #0284c7';
        card.style.marginBottom = '1rem';
        card.innerHTML = `
          <div class="q-meta">
            <span class="tag-week">SEMANA ${c.semana}</span>
            <span class="tag-topic">Comando: ${c.tema}</span>
            <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted);">ID: ${c.id}</span>
          </div>
          <div class="q-text"><strong>[Prompt: <code>${c.prompt}</code>]</strong> ${c.enunciado}</div>
          <div style="background:#f0f9ff; border:1px solid #bae6fd; padding:0.75rem; border-radius:6px; font-size:0.9rem; margin-top:0.5rem; color:#0369a1;">
            <strong>Comando Correcto:</strong> <code>${c.solucion}</code><br><br>
            <strong>Explicación técnica:</strong> ${c.explicacion}
          </div>
        `;
        fallosList.appendChild(card);
        return;
      }

      // 3. Buscar en DATA.calculo
      const calc = DATA.calculo.find(item => item.id === falloId);
      if (calc) {
        let ejemplo;
        try { ejemplo = calc.generar(); } catch (e) {}
        const pasosHtml = (ejemplo && Array.isArray(ejemplo.pasos))
          ? `<ol style="margin:0.4rem 0 0 1.2rem; line-height:1.5;">${ejemplo.pasos.map(ps => `<li>${ps}</li>`).join('')}</ol>`
          : 'Revisa la fórmula en el generador de cálculo.';

        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderLeft = '4px solid #8b5cf6';
        card.style.marginBottom = '1rem';
        card.innerHTML = `
          <div class="q-meta">
            <span class="tag-week">SEMANA ${calc.semana}</span>
            <span class="tag-topic">Cálculo: ${calc.titulo}</span>
            <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted);">ID: ${calc.id}</span>
          </div>
          <div class="q-text">${ejemplo ? ejemplo.enunciado : calc.titulo}</div>
          <div style="background:#faf5ff; border:1px solid #e9d5ff; padding:0.75rem; border-radius:6px; font-size:0.9rem; margin-top:0.5rem; color:#6b21a8;">
            <strong>Solución Paso a Paso:</strong>
            ${pasosHtml}
          </div>
        `;
        fallosList.appendChild(card);
        return;
      }

      // 4. Buscar en DATA.pc3 (comandos drill)
      if (DATA.pc3 && Array.isArray(DATA.pc3.comandosDrill)) {
        const d = DATA.pc3.comandosDrill.find(item => item.id === falloId);
        if (d) {
          const solTexto = d.tipo === 'escribir' ? d.comandoCorrecto : d.palabraFaltante;
          const card = document.createElement('div');
          card.className = 'card';
          card.style.borderLeft = '4px solid #f59e0b';
          card.style.marginBottom = '1rem';
          card.innerHTML = `
            <div class="q-meta">
              <span class="tag-week">PC3 Referencia</span>
              <span class="tag-topic">Comando Drill: ${d.categoria}</span>
              <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted);">ID: ${d.id}</span>
            </div>
            <div class="q-text">${d.enunciado}</div>
            <div style="background:#fffbeb; border:1px solid #fde68a; padding:0.75rem; border-radius:6px; font-size:0.9rem; margin-top:0.5rem; color:#92400e;">
              <strong>Solución oficial:</strong> <code>${solTexto}</code><br><br>
              <strong>Propósito:</strong> ${d.explicacion}
            </div>
          `;
          fallosList.appendChild(card);
          return;
        }
      }

      // 5. Fallos del simulacro en sesión activa
      if (falloId.startsWith('sim-')) {
        const simIdx = parseInt(falloId.replace('sim-', ''), 10);
        const simPreg = appState.simulacro.preguntas && appState.simulacro.preguntas[simIdx];
        if (simPreg) {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.borderLeft = '4px solid var(--danger)';
          card.style.marginBottom = '1rem';
          card.innerHTML = `
            <div class="q-meta">
              <span class="tag-week">SEMANA ${simPreg.data.semana}</span>
              <span class="tag-topic">Simulacro: ${simPreg.tipoItem.toUpperCase()}</span>
              <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted);">ID: ${falloId}</span>
            </div>
            <div class="q-text">${simPreg.tipoItem === 'calculo' ? simPreg.instancia.enunciado : simPreg.data.enunciado}</div>
            <div style="background:var(--danger-bg); border:1px solid #fecaca; padding:0.75rem; border-radius:6px; font-size:0.9rem; margin-top:0.5rem; color:#991b1b;">
              Pregunta errada en el último simulacro rendido.
            </div>
          `;
          fallosList.appendChild(card);
          return;
        }
      }

      // 6. ID no encontrado
      const card = document.createElement('div');
      card.className = 'card';
      card.style.borderLeft = '4px solid var(--warning)';
      card.style.marginBottom = '1rem';
      card.innerHTML = `
        <div class="q-meta">
          <span class="tag-topic">Registro Histórico</span>
          <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted);">ID: ${falloId}</span>
        </div>
        <div class="q-text">Ejercicio no disponible (id: <code>${falloId}</code>)</div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.35rem;">
          Este registro corresponde a un ejercicio o variante generada en una sesión anterior.
        </p>
      `;
      fallosList.appendChild(card);
    });

    fallosBox.scrollIntoView({ behavior: 'smooth' });
  }

  // ==========================================
  // MÓDULO 6: MODO TARJETAS (FLASHCARDS)
  // ==========================================
  function initModuloFlashcards() {
    const cardEl = document.getElementById('active-flashcard');
    const filterSem = document.getElementById('filter-semana-flashcards');
    const tagEl = document.getElementById('fc-tag');
    const indexEl = document.getElementById('fc-index');
    const pregEl = document.getElementById('fc-pregunta');
    const respEl = document.getElementById('fc-respuesta');

    const btnFlip = document.getElementById('btn-fc-flip');
    const btnPrev = document.getElementById('btn-fc-prev');
    const btnNext = document.getElementById('btn-fc-next');

    function actualizarListaFlashcards() {
      const sem = filterSem.value;
      let items = [];
      const idsVistos = new Set();

      // 1. Extraer de DATA.preguntas (incluye las 7 nuevas integradas)
      DATA.preguntas.forEach(p => {
        if (!p || idsVistos.has(p.id)) return;
        if (sem === 'todas' || p.semana.toString() === sem) {
          idsVistos.add(p.id);
          let rCard = '';
          if (p.opciones && p.opciones[p.respuesta] !== undefined) {
            rCard = p.opciones[p.respuesta];
          } else if (p.respuestasValidas && p.respuestasValidas[0]) {
            rCard = p.respuestasValidas[0];
          } else if (p.pares && Array.isArray(p.pares)) {
            rCard = p.pares.map(pr => `${pr.premisa} &rarr; ${pr.respuesta}`).join('<br>');
          } else {
            rCard = p.respuesta !== undefined ? p.respuesta : 'Ver concepto';
          }

          items.push({
            id: p.id,
            semana: p.semana,
            tema: `Teoría: ${p.tema}`,
            pregunta: p.enunciado,
            respuesta: `<strong>Respuesta:</strong> ${rCard}<br><br><strong>Explicación:</strong> ${p.explicacion}`
          });
        }
      });

      // 2. Extraer de DATA.comandos
      DATA.comandos.forEach(c => {
        if (!c || idsVistos.has(c.id)) return;
        if (sem === 'todas' || c.semana.toString() === sem) {
          idsVistos.add(c.id);
          items.push({
            id: c.id,
            semana: c.semana,
            tema: `Comando: ${c.tema}`,
            pregunta: `[${c.prompt}] ${c.enunciado}`,
            respuesta: `<strong>Comando Cisco:</strong> <code>${c.solucion}</code><br><br><strong>Propósito:</strong> ${c.explicacion}`
          });
        }
      });

      // 3. Extraer conceptos y fórmulas de DATA.calculo
      DATA.calculo.forEach(calc => {
        if (!calc || idsVistos.has(calc.id)) return;
        if (sem === 'todas' || calc.semana.toString() === sem) {
          idsVistos.add(calc.id);
          let ej;
          try { ej = calc.generar(); } catch (e) {}
          const pasosTxt = (ej && Array.isArray(ej.pasos)) ? ej.pasos.join('<br>') : '';
          items.push({
            id: calc.id,
            semana: calc.semana,
            tema: `Fórmula / Cálculo: ${calc.tema}`,
            pregunta: `¿Cuál es el método y fórmula para resolver: "${calc.titulo}"?`,
            respuesta: `<strong>Método y Fórmula Aplicada:</strong><br>${pasosTxt || calc.titulo}`
          });
        }
      });

      appState.flashcards.lista = items.sort(() => Math.random() - 0.5);
      appState.flashcards.actualIdx = 0;
      mostrarCard(0);
    }

    function mostrarCard(idx) {
      if (appState.flashcards.lista.length === 0) {
        tagEl.textContent = 'SIN ELEMENTOS';
        indexEl.textContent = '0 / 0';
        pregEl.textContent = 'No hay tarjetas para el filtro seleccionado.';
        respEl.innerHTML = '';
        return;
      }
      if (idx < 0) idx = 0;
      if (idx >= appState.flashcards.lista.length) idx = appState.flashcards.lista.length - 1;

      appState.flashcards.actualIdx = idx;
      appState.flashcards.volteada = false;
      cardEl.classList.remove('flipped');

      const item = appState.flashcards.lista[idx];
      tagEl.textContent = `SEMANA ${item.semana} • ${item.tema}`;
      indexEl.textContent = `${idx + 1} / ${appState.flashcards.lista.length}`;
      pregEl.textContent = item.pregunta;
      respEl.innerHTML = item.respuesta;
    }

    function voltearCard() {
      appState.flashcards.volteada = !appState.flashcards.volteada;
      if (appState.flashcards.volteada) {
        cardEl.classList.add('flipped');
      } else {
        cardEl.classList.remove('flipped');
      }
    }

    cardEl.addEventListener('click', voltearCard);
    btnFlip.addEventListener('click', voltearCard);
    btnPrev.addEventListener('click', () => mostrarCard(appState.flashcards.actualIdx - 1));
    btnNext.addEventListener('click', () => mostrarCard(appState.flashcards.actualIdx + 1));
    filterSem.addEventListener('change', actualizarListaFlashcards);

    actualizarListaFlashcards();
  }

  // ==========================================
  // MÓDULO 7: PC3 DE REFERENCIA (EXAMEN EN HOJA)
  // ==========================================
  function initModuloPC3Referencia() {
    // 1. Manejo de Subtabs internas
    const subtabBtns = document.querySelectorAll('.pc3ref-subtab-btn');
    const subviews = document.querySelectorAll('.pc3ref-subview');

    subtabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const target = this.getAttribute('data-subtab');
        subtabBtns.forEach(b => b.classList.remove('active'));
        subviews.forEach(v => v.classList.remove('active'));

        this.classList.add('active');
        const viewEl = document.getElementById(`pc3ref-sub-${target}`);
        if (viewEl) viewEl.classList.add('active');
      });
    });

    // 2. Renderizar Preguntas Escritas
    renderizarPreguntasReferencia();

    // 3. Renderizar Variantes
    initVariantesReferencia();

    // 4. Renderizar Plantillas Rápidas
    renderizarPlantillasReferencia();

    // 5. Entrenador de Comandos Drill
    initComandosDrillReferencia();

    // 6. Simulacro e Impresión
    initImpresionYTimerReferencia();
  }

  // --- RENDERIZADO DE LAS 4 PREGUNTAS Y RÚBRICA ---
  function renderizarPreguntasReferencia() {
    const container = document.getElementById('pc3ref-questions-container');
    const qNavBtns = document.querySelectorAll('.pc3ref-q-nav');
    if (!container) return;

    let respuestasGuardadas = {};
    try {
      respuestasGuardadas = JSON.parse(localStorage.getItem('pc3ref_respuestas') || '{}');
    } catch (e) {
      console.warn('Error leyendo pc3ref_respuestas:', e);
    }

    let rubricGuardada = {};
    try {
      rubricGuardada = JSON.parse(localStorage.getItem('pc3ref_rubric') || '{}');
    } catch (e) {
      console.warn('Error leyendo pc3ref_rubric:', e);
    }

    // Filtrar pregunta
    qNavBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        qNavBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const qTarget = this.getAttribute('data-q');
        const cards = container.querySelectorAll('.pc3ref-q-card');
        cards.forEach(card => {
          if (qTarget === 'todos' || card.getAttribute('data-qid') === qTarget) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    container.innerHTML = '';
    const preguntas = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.preguntas))
      ? PC3_REF_DATA.preguntas
      : [];

    preguntas.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pc3ref-q-card';
      card.setAttribute('data-qid', p.id);

      const savedText = respuestasGuardadas[p.id] || '';
      const wordCount = savedText.trim() ? savedText.trim().split(/\s+/).length : 0;
      const charCount = savedText.length;

      // Calcular puntos actuales en rúbrica de esta pregunta
      let pScore = 0;
      (p.puntosClave || []).forEach(pt => {
        if (rubricGuardada[pt.id]) pScore += pt.valor;
      });

      card.innerHTML = `
        <div class="pc3ref-q-header">
          <div class="pc3ref-q-title">${p.titulo}</div>
          <span class="pc3ref-q-badge" id="badge-score-${p.id}">${pScore.toFixed(1)} / 5.0 pts</span>
        </div>

        <div class="pc3ref-q-enunciado">
          <strong>Enunciado oficial del examen:</strong><br>
          ${p.enunciado}
        </div>

        <div class="pc3ref-q-contexto">
          <strong>Topología y Contexto:</strong> ${p.contexto}
        </div>
        ${p.id === 'p4' ? `
        <div class="topology-svg-container" style="margin: 0.85rem 0; padding: 0.75rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <span>🗺️ Diagrama Vectorial de la Topología Oficial (Pregunta 4)</span>
            <span style="font-size: 0.75rem; background: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 4px; border: 1px solid #eab308; font-weight: 700;">Etiquetas VERIFICAR = Hipótesis no confirmadas</span>
          </div>
          ${generarSvgTopologiaPC3()}
        </div>` : ''}

        <!-- EDITOR DE RESPUESTA A MANO -->
        <div class="written-editor-wrapper">
          <div class="written-editor-label">
            <span>Tu respuesta escrita (pasos, campos, valores y comandos tal como en hoja):</span>
            <span id="save-status-${p.id}" style="color:var(--success); font-weight:normal; font-size:0.8rem;">💾 Auto-guardado en tu equipo</span>
          </div>
          <textarea class="written-answer-box" id="answer-${p.id}" placeholder="Escribe aquí tu respuesta paso a paso:&#10;1. Configuración del dispositivo (pestaña y opciones)...&#10;2. Valores exactos (nombres, IPs, máscaras)...&#10;3. Comandos de prueba o verificación en consola...&#10;4. Lo que se observa en pantalla...">${savedText}</textarea>
          <div class="written-editor-footer">
            <span id="count-${p.id}">${wordCount} palabras | ${charCount} caracteres</span>
            <span>Se guarda automáticamente al escribir</span>
          </div>
        </div>

        <div style="font-size:0.83rem; color:#475569; margin-top:0.45rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.35rem;">
          <span>&#128161;</span> <em>Al terminar de escribir, despliega la respuesta modelo, la rúbrica y los errores típicos.</em>
        </div>

        <!-- BOTÓN DESPLEGABLE SOLUCIÓN Y RÚBRICA -->
        <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:0.5rem;">
          <button class="btn btn-primary btn-sm btn-toggle-model" data-target="model-content-${p.id}">
            &#128065; Ver Respuesta Modelo, Rúbrica y Evidencias
          </button>
        </div>

        <!-- CONTENIDO DE SOLUCIÓN Y EVALUACIÓN -->
        <div id="model-content-${p.id}" style="display:none; margin-top:1.25rem; border-top:1px solid #cbd5e1; padding-top:1rem;">
          
          <!-- RÚBRICA AUTOEVALUACIÓN -->
          <div class="rubric-box">
            <div class="rubric-title">
              <span>&#128203; Rúbrica de Autoevaluación (Puntos Clave - 5.0 pts)</span>
              <span id="rubric-qscore-${p.id}" style="color:var(--primary);">${pScore.toFixed(1)} / 5.0</span>
            </div>
            <div style="font-size:0.84rem; color:var(--text-muted); margin-bottom:0.6rem;">
              Marca las casillas que hayas incluido con claridad en tu respuesta escrita:
            </div>
            <div class="rubric-checklist" id="rubric-list-${p.id}">
              ${(p.puntosClave || []).map(pt => `
                <label class="rubric-item">
                  <input type="checkbox" class="rubric-checkbox" data-qid="${p.id}" data-pid="${pt.id}" data-val="${pt.valor}" ${rubricGuardada[pt.id] ? 'checked' : ''}>
                  <span><strong>(+${pt.valor.toFixed(1)} pt)</strong> ${pt.texto}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- QUÉ DEBERÍA VERSE EN LA PRUEBA -->
          <div class="screen-box">
            <div style="font-weight:700; color:#0891b2; margin-bottom:0.4rem;">
              &#128269; ¿Qué debería verse en la pantalla durante la prueba?
            </div>
            <div>${p.queDeberiaVerse}</div>
          </div>

          <!-- RESPUESTA MODELO COMPLETA -->
          <div class="model-box">
            <div style="font-weight:700; color:#059669; margin-bottom:0.4rem;">
              &#9989; Respuesta Modelo Oficial Recomendada:
            </div>
            <div>${p.respuestaModelo}</div>
          </div>

          <!-- ERRORES TÍPICOS -->
          <div class="errors-box">
            <div style="font-weight:700; color:#e11d48; margin-bottom:0.35rem;">
              &#9888; Errores frecuentes al responder en hoja:
            </div>
            <ul>
              ${p.erroresTipicos.map(err => `<li>${err}</li>`).join('')}
            </ul>
          </div>

          <!-- COMANDOS DE PRUEBA -->
          <div style="margin-top:0.75rem; background:#f8fafc; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0; font-size:0.86rem;">
            <strong>Comandos de prueba / verificación recomendados para este servicio:</strong>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.4rem;">
              ${p.comandosPrueba.map(c => `<code style="background:#e2e8f0; padding:2px 6px; border-radius:4px; color:#0f172a;" title="${c.desc}">${c.cmd}</code>`).join('')}
            </div>
          </div>

        </div>
      `;

      container.appendChild(card);

      // Evento de escritura
      const textarea = card.querySelector(`#answer-${p.id}`);
      const countEl = card.querySelector(`#count-${p.id}`);
      const saveStatusEl = card.querySelector(`#save-status-${p.id}`);

      textarea.addEventListener('input', function () {
        const val = this.value;
        const words = val.trim() ? val.trim().split(/\s+/).length : 0;
        countEl.textContent = `${words} palabras | ${val.length} caracteres`;
        saveStatusEl.textContent = '💾 Guardando...';

        respuestasGuardadas[p.id] = val;
        try {
          localStorage.setItem('pc3ref_respuestas', JSON.stringify(respuestasGuardadas));
          setTimeout(() => {
            saveStatusEl.textContent = '💾 Guardado';
          }, 300);
        } catch (e) {
          saveStatusEl.textContent = '⚠️ Error al guardar';
        }

        actualizarPanelProgreso();
      });

      // Botón Toggle Modelo
      const btnToggle = card.querySelector('.btn-toggle-model');
      const modelContent = card.querySelector(`#model-content-${p.id}`);
      btnToggle.addEventListener('click', function () {
        const isHidden = modelContent.style.display === 'none';
        modelContent.style.display = isHidden ? 'block' : 'none';
        this.innerHTML = isHidden
          ? '&#128064; Ocultar Respuesta Modelo y Rúbrica'
          : '&#128065; Ver Respuesta Modelo, Rúbrica y Evidencias';
      });

      // Eventos de checkboxes de rúbrica
      const checkboxes = card.querySelectorAll('.rubric-checkbox');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
          const pid = this.getAttribute('data-pid');
          rubricGuardada[pid] = this.checked;

          try {
            localStorage.setItem('pc3ref_rubric', JSON.stringify(rubricGuardada));
          } catch (e) {
            console.warn('Error guardando rúbrica:', e);
          }

          actualizarPuntajesRubrica();
          actualizarPanelProgreso();
        });
      });
    });

    actualizarPuntajesRubrica();

    // Interruptor: Mostrar todas las soluciones y rúbricas
    const chkMostrarSol = document.getElementById('chk-pc3ref-mostrar-soluciones');
    let mostrarTodasSol = false;
    try {
      mostrarTodasSol = localStorage.getItem('pc3ref_mostrar_soluciones') === 'true';
    } catch (e) {}

    function aplicarVisibilidadSoluciones(forzarMostrar) {
      preguntas.forEach(p => {
        const modelContent = container.querySelector(`#model-content-${p.id}`);
        const btnToggle = container.querySelector(`[data-target="model-content-${p.id}"]`);
        if (modelContent) modelContent.style.display = forzarMostrar ? 'block' : 'none';
        if (btnToggle) {
          btnToggle.innerHTML = forzarMostrar
            ? '&#128064; Ocultar Respuesta Modelo y Rúbrica'
            : '&#128065; Ver Respuesta Modelo, Rúbrica y Evidencias';
        }
      });
    }

    if (chkMostrarSol) {
      chkMostrarSol.checked = mostrarTodasSol;
      aplicarVisibilidadSoluciones(mostrarTodasSol);
      chkMostrarSol.addEventListener('change', function () {
        const estado = this.checked;
        try {
          localStorage.setItem('pc3ref_mostrar_soluciones', estado ? 'true' : 'false');
        } catch (e) {}
        aplicarVisibilidadSoluciones(estado);
      });
    }
  }

  function actualizarPuntajesRubrica() {
    let rubricGuardada = {};
    try {
      rubricGuardada = JSON.parse(localStorage.getItem('pc3ref_rubric') || '{}');
    } catch (e) {
      console.warn(e);
    }

    let totalGlobal = 0;
    const preguntas = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.preguntas))
      ? PC3_REF_DATA.preguntas
      : [];

    preguntas.forEach(p => {
      let pScore = 0;
      (p.puntosClave || []).forEach(pt => {
        if (rubricGuardada[pt.id]) {
          pScore += pt.valor;
        }
      });
      totalGlobal += pScore;

      const badgeScore = document.getElementById(`badge-score-${p.id}`);
      const rubricQScore = document.getElementById(`rubric-qscore-${p.id}`);
      if (badgeScore) badgeScore.textContent = `${pScore.toFixed(1)} / 5.0 pts`;
      if (rubricQScore) rubricQScore.textContent = `${pScore.toFixed(1)} / 5.0`;
    });

    const totalBadge = document.getElementById('pc3ref-total-score-badge');
    const printScore = document.getElementById('pc3ref-print-score');
    if (totalBadge) totalBadge.textContent = `Calificación Autoevaluada: ${totalGlobal.toFixed(1)} / 20.0`;
    if (printScore) printScore.textContent = `${totalGlobal.toFixed(1)} / 20`;
  }

  // --- VARIANTES ALEATORIAS ---
  function initVariantesReferencia() {
    const btnGenerar = document.getElementById('btn-generar-variante');
    const displayEl = document.getElementById('pc3ref-variante-display');
    if (!btnGenerar || !displayEl) return;

    function renderVariante(v) {
      displayEl.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.85rem;">
            <div style="font-weight:700; color:var(--primary); font-size:0.9rem; margin-bottom:0.35rem;">&#128100; Datos del Alumno Asignado</div>
            <div style="font-size:0.86rem; line-height:1.5;">
              <strong>Nombre completo:</strong> ${v.alumno.nombreCompleto}<br>
              <strong>Primer Apellido:</strong> ${v.alumno.primerApellido}<br>
              <strong>Segundo Apellido:</strong> ${v.alumno.segundoApellido}
            </div>
          </div>

          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.85rem;">
            <div style="font-weight:700; color:#0284c7; font-size:0.9rem; margin-bottom:0.35rem;">&#127760; Parámetros de Red y Servidores</div>
            <div style="font-size:0.86rem; line-height:1.5;">
              <strong>Valor de X:</strong> ${v.red.x} (Red LAN 1: <code>${v.red.lan1Red}</code>)<br>
              <strong>Servidor 1 (DNS/DHCP):</strong> <code>${v.red.servidor1IP}</code><br>
              <strong>Servidor 2 (Correo):</strong> <code>${v.red.servidor2IP}</code><br>
              <strong>Gateway LAN 1 (Fa0/0):</strong> <code>${v.red.gatewayLAN1}</code><br>
              <strong>Rango DHCP inicial:</strong> <code>${v.red.rangoDHCPStart}</code>
            </div>
          </div>

          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.85rem;">
            <div style="font-weight:700; color:#059669; font-size:0.9rem; margin-bottom:0.35rem;">&#128279; Nombres y Dominios a Configurar</div>
            <div style="font-size:0.86rem; line-height:1.5;">
              <strong>DNS 1 (P1):</strong> <code>${v.dominios.dns1}</code> &rarr; ${v.red.servidor1IP}<br>
              <strong>DNS 2 (P1):</strong> <code>${v.dominios.dns2}</code> &rarr; ${v.red.servidor1IP}<br>
              <strong>Dominio Correo (P3):</strong> <code>${v.dominios.correoDominio}</code><br>
              <strong>Cuentas Email:</strong> <code>${v.dominios.cuenta1}</code> y <code>${v.dominios.cuenta2}</code>
            </div>
          </div>

          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.85rem;">
            <div style="font-weight:700; color:#7c3aed; font-size:0.9rem; margin-bottom:0.35rem;">&#128222; Red Derecha y Extensiones (P4)</div>
            <div style="font-size:0.86rem; line-height:1.5;">
              <strong>Red LAN 2:</strong> <code>${v.red.lan2Red}</code> (Fa0/1: <code>${v.red.gatewayLAN2}</code>)<br>
              <strong>Laptop IP:</strong> <code>${v.red.laptopIP}</code><br>
              <strong>Teléfono IP 1:</strong> Extensión <code>${v.telefonia.ext1}</code><br>
              <strong>Teléfono IP 2:</strong> Extensión <code>${v.telefonia.ext2}</code>
            </div>
          </div>
        </div>
      `;
    }

    // Cargar guardada o generar inicial
    let varianteActual = null;
    try {
      const savedVar = localStorage.getItem('pc3ref_variante');
      if (savedVar) varianteActual = JSON.parse(savedVar);
    } catch (e) {}

    if (!varianteActual) {
      varianteActual = generarVarianteExamenPC3();
      try {
        localStorage.setItem('pc3ref_variante', JSON.stringify(varianteActual));
      } catch (e) {}
    }
    renderVariante(varianteActual);

    btnGenerar.addEventListener('click', function () {
      varianteActual = generarVarianteExamenPC3();
      try {
        localStorage.setItem('pc3ref_variante', JSON.stringify(varianteActual));
      } catch (e) {}
      renderVariante(varianteActual);
    });
  }

  // --- PLANTILLAS RÁPIDAS ---
  function renderizarPlantillasReferencia() {
    const container = document.getElementById('pc3ref-plantillas-container');
    if (!container) return;
    container.innerHTML = '';

    const plantillas = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.plantillas))
      ? PC3_REF_DATA.plantillas
      : [];

    plantillas.forEach(pl => {
      const card = document.createElement('div');
      card.className = 'plantilla-card';
      card.innerHTML = `
        <div class="plantilla-header">
          <span class="plantilla-icon">${pl.icono}</span>
          <div>
            <div class="plantilla-title">${pl.servicio}</div>
            <div class="plantilla-meta">Puerto: ${pl.puerto} • Equipo: ${pl.dispositivo} • Ruta: <strong>${pl.pestaña}</strong></div>
          </div>
        </div>

        <div class="plantilla-steps">
          <strong>Secuencia Estándar de Configuración:</strong><br>
          ${pl.secuenciaPasos.map(s => `&bull; ${s}<br>`).join('')}
        </div>

        <table class="plantilla-table">
          <thead>
            <tr><th>Campo / Parámetro</th><th>Valor de Ejemplo</th><th>Nota Clave</th></tr>
          </thead>
          <tbody>
            ${pl.camposClave.map(c => `
              <tr>
                <td><strong>${c.campo}</strong></td>
                <td><code>${c.valorEjemplo}</code></td>
                <td>${c.nota}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="font-size:0.8rem; color:var(--text-muted);">
          <strong>Comandos de prueba recomendados:</strong>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:0.25rem;">
            ${pl.comandosPrueba.map(cmd => `<code style="background:#f1f5f9; padding:2px 5px; border-radius:3px;">${cmd}</code>`).join('')}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // --- ENTRENADOR DE COMANDOS DRILL ---
  function initComandosDrillReferencia() {
    const container = document.getElementById('pc3ref-comandos-container');
    const btnModoEscribir = document.getElementById('btn-drill-modo-escribir');
    const btnModoCompletar = document.getElementById('btn-drill-modo-completar');
    if (!container || !btnModoEscribir || !btnModoCompletar) return;

    let modoActual = 'escribir'; // 'escribir' o 'completar'

    btnModoEscribir.addEventListener('click', function () {
      modoActual = 'escribir';
      btnModoEscribir.classList.add('active', 'btn-primary');
      btnModoEscribir.classList.remove('btn-secondary');
      btnModoCompletar.classList.remove('active', 'btn-primary');
      btnModoCompletar.classList.add('btn-secondary');
      renderDrill();
    });

    btnModoCompletar.addEventListener('click', function () {
      modoActual = 'completar';
      btnModoCompletar.classList.add('active', 'btn-primary');
      btnModoCompletar.classList.remove('btn-secondary');
      btnModoEscribir.classList.remove('active', 'btn-primary');
      btnModoEscribir.classList.add('btn-secondary');
      renderDrill();
    });

    function normalizarCmd(str) {
      return (str || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
    }

    function renderDrill() {
      container.innerHTML = '';
      const todosCmds = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.comandosDrill))
        ? PC3_REF_DATA.comandosDrill
        : [];
      const lista = todosCmds.filter(c => c.tipo === modoActual);

      let cmdStats = {};
      try {
        cmdStats = JSON.parse(localStorage.getItem('pc3ref_cmd_stats') || '{"aciertos":0,"ids":[]}');
      } catch (e) {
        cmdStats = { aciertos: 0, ids: [] };
      }

      const idsAcertados = Array.isArray(cmdStats.ids) ? cmdStats.ids : [];
      const escribirCmds = todosCmds.filter(c => c.tipo === 'escribir');
      const completarCmds = todosCmds.filter(c => c.tipo === 'completar');
      const aciertoEscribir = escribirCmds.filter(c => idsAcertados.includes(c.id)).length;
      const aciertoCompletar = completarCmds.filter(c => idsAcertados.includes(c.id)).length;

      const summaryBadge = document.getElementById('drill-summary-badge');
      if (summaryBadge) {
        summaryBadge.textContent = `10 ejercicios: 5 escribir (${aciertoEscribir}/5) + 5 completar (${aciertoCompletar}/5) | Superados: ${idsAcertados.length}/10`;
      }
      if (btnModoEscribir) btnModoEscribir.textContent = `Modo Escribe el Comando (${aciertoEscribir}/5)`;
      if (btnModoCompletar) btnModoCompletar.textContent = `Modo Completa el Comando (${aciertoCompletar}/5)`;

      lista.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'drill-card';
        const yaAcertado = Array.isArray(cmdStats.ids) && cmdStats.ids.includes(item.id);

        if (item.tipo === 'escribir') {
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="tag-topic">${item.categoria}</span>
              <span style="font-size:0.8rem; font-weight:700; color:${yaAcertado ? 'var(--success)' : 'var(--text-muted)'};">
                ${yaAcertado ? '&#9989; Superado' : `Ejercicio ${idx + 1} / ${lista.length}`}
              </span>
            </div>
            <div style="font-weight:600; font-size:0.95rem; margin-top:0.5rem; margin-bottom:0.75rem;">
              ${item.enunciado}
            </div>

            <div class="drill-input-row">
              <span class="drill-prompt">${item.prompt}</span>
              <input type="text" class="drill-input" id="drill-input-${item.id}" placeholder="Escribe el comando aquí..." autocomplete="off" spellcheck="false" ${yaAcertado ? `value="${item.comandoCorrecto}" disabled` : ''}>
              <button class="btn btn-primary btn-sm btn-drill-verify" data-id="${item.id}" ${yaAcertado ? 'disabled' : ''}>Verificar</button>
            </div>

            <div id="drill-fb-${item.id}" style="margin-top:0.6rem; font-size:0.88rem; display:${yaAcertado ? 'block' : 'none'};">
              ${yaAcertado ? `<span style="color:var(--success); font-weight:600;">&#9989; ¡Correcto!</span> <span style="color:var(--text-muted);">${item.explicacion}</span>` : ''}
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:0.6rem;">
              <button class="btn btn-secondary btn-sm btn-drill-sol" data-id="${item.id}">Ver Solución</button>
            </div>
          `;
        } else {
          // Modo completar
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="tag-topic">${item.categoria}</span>
              <span style="font-size:0.8rem; font-weight:700; color:${yaAcertado ? 'var(--success)' : 'var(--text-muted)'};">
                ${yaAcertado ? '&#9989; Superado' : `Ejercicio ${idx + 1} / ${lista.length}`}
              </span>
            </div>
            <div style="font-weight:600; font-size:0.95rem; margin-top:0.5rem; margin-bottom:0.75rem;">
              ${item.enunciado}
            </div>

            <div class="drill-input-row" style="flex-wrap:wrap; font-family:monospace; font-size:0.95rem;">
              <span>${item.textoAntes}</span>
              <input type="text" class="drill-input" style="max-width:180px;" id="drill-input-${item.id}" placeholder="palabra faltante" autocomplete="off" spellcheck="false" ${yaAcertado ? `value="${item.palabraFaltante}" disabled` : ''}>
              <span>${item.textoDespues}</span>
              <button class="btn btn-primary btn-sm btn-drill-verify" data-id="${item.id}" ${yaAcertado ? 'disabled' : ''}>Verificar</button>
            </div>

            <div id="drill-fb-${item.id}" style="margin-top:0.6rem; font-size:0.88rem; display:${yaAcertado ? 'block' : 'none'};">
              ${yaAcertado ? `<span style="color:var(--success); font-weight:600;">&#9989; ¡Correcto!</span> <span style="color:var(--text-muted);">${item.explicacion}</span>` : ''}
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:0.6rem;">
              <button class="btn btn-secondary btn-sm btn-drill-sol" data-id="${item.id}">Ver Solución</button>
            </div>
          `;
        }

        container.appendChild(card);

        // Eventos de verificación
        const inputEl = card.querySelector(`#drill-input-${item.id}`);
        const btnVerify = card.querySelector(`.btn-drill-verify`);
        const fbEl = card.querySelector(`#drill-fb-${item.id}`);
        const btnSol = card.querySelector(`.btn-drill-sol`);

        function ejecutarVerificacion() {
          const userVal = normalizarCmd(inputEl.value);
          let esValido = false;

          if (item.tipo === 'escribir') {
            if (userVal === normalizarCmd(item.comandoCorrecto)) {
              esValido = true;
            } else if (Array.isArray(item.aliasValidos)) {
              esValido = item.aliasValidos.some(al => normalizarCmd(al) === userVal);
            }
          } else {
            if (userVal === normalizarCmd(item.palabraFaltante)) {
              esValido = true;
            } else if (Array.isArray(item.aliasValidos)) {
              esValido = item.aliasValidos.some(al => normalizarCmd(al) === userVal);
            }
          }

          fbEl.style.display = 'block';
          if (esValido) {
            fbEl.innerHTML = `<span style="color:var(--success); font-weight:700;">&#9989; ¡Excelente! Comando correcto.</span> <span style="color:var(--text-muted);">${item.explicacion}</span>`;
            inputEl.style.borderColor = 'var(--success)';
            inputEl.disabled = true;
            btnVerify.disabled = true;

            // Registrar en localStorage
            if (!cmdStats.ids) cmdStats.ids = [];
            if (!cmdStats.ids.includes(item.id)) {
              cmdStats.ids.push(item.id);
              cmdStats.aciertos = cmdStats.ids.length;
              try {
                localStorage.setItem('pc3ref_cmd_stats', JSON.stringify(cmdStats));
              } catch (e) {}
              actualizarPanelProgreso();

              const todos = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.comandosDrill)) ? PC3_REF_DATA.comandosDrill : [];
              const esc = todos.filter(c => c.tipo === 'escribir');
              const comp = todos.filter(c => c.tipo === 'completar');
              const acEsc = esc.filter(c => cmdStats.ids.includes(c.id)).length;
              const acComp = comp.filter(c => cmdStats.ids.includes(c.id)).length;
              const sBadge = document.getElementById('drill-summary-badge');
              if (sBadge) sBadge.textContent = `10 ejercicios: 5 escribir (${acEsc}/5) + 5 completar (${acComp}/5) | Superados: ${cmdStats.ids.length}/10`;
              if (btnModoEscribir) btnModoEscribir.textContent = `Modo Escribe el Comando (${acEsc}/5)`;
              if (btnModoCompletar) btnModoCompletar.textContent = `Modo Completa el Comando (${acComp}/5)`;
            }
          } else {
            fbEl.innerHTML = `<span style="color:var(--danger); font-weight:700;">&#10060; Comando incorrecto.</span> Revisa la sintaxis, abreviaciones o prueba el botón "Ver Solución".`;
            inputEl.style.borderColor = 'var(--danger)';
          }
        }

        btnVerify.addEventListener('click', ejecutarVerificacion);
        inputEl.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') ejecutarVerificacion();
        });

        btnSol.addEventListener('click', function () {
          fbEl.style.display = 'block';
          const solTexto = item.tipo === 'escribir' ? item.comandoCorrecto : item.palabraFaltante;
          fbEl.innerHTML = `<strong>Solución oficial:</strong> <code>${solTexto}</code><br><span style="color:var(--text-muted);">${item.explicacion}</span>`;
        });
      });
    }

    renderDrill();
  }

  // --- SIMULACRO EN PAPEL, TIMER E IMPRESIÓN ---
  function initImpresionYTimerReferencia() {
    const btnPrintExam = document.getElementById('btn-imprimir-examen');
    const btnPrintSol = document.getElementById('btn-imprimir-solucionario');
    const timerDisplay = document.getElementById('pc3ref-timer-display');
    const btnStart = document.getElementById('btn-pc3ref-timer-start');
    const btnPause = document.getElementById('btn-pc3ref-timer-pause');
    const btnReset = document.getElementById('btn-pc3ref-timer-reset');
    const printArea = document.getElementById('print-exam-area');

    if (!btnPrintExam || !btnPrintSol || !printArea) return;

    // Timer de 60 min
    let timerRefInterval = null;
    let segundosRefRestantes = 60 * 60;

    function renderTimer() {
      const min = Math.floor(segundosRefRestantes / 60);
      const sec = segundosRefRestantes % 60;
      if (timerDisplay) {
        timerDisplay.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      }
    }

    if (btnStart) {
      btnStart.addEventListener('click', function () {
        if (timerRefInterval) return;
        timerRefInterval = setInterval(() => {
          if (segundosRefRestantes > 0) {
            segundosRefRestantes--;
            renderTimer();
          } else {
            clearInterval(timerRefInterval);
            timerRefInterval = null;
            alert('¡Tiempo de simulacro de examen en papel finalizado!');
          }
        }, 1000);
      });
    }

    if (btnPause) {
      btnPause.addEventListener('click', function () {
        if (timerRefInterval) {
          clearInterval(timerRefInterval);
          timerRefInterval = null;
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (timerRefInterval) {
          clearInterval(timerRefInterval);
          timerRefInterval = null;
        }
        segundosRefRestantes = 60 * 60;
        renderTimer();
      });
    }

    // IMPRESIÓN 1: EXAMEN EN BLANCO CON RENGLONES
    const screenExamPreview = document.getElementById('screen-exam-preview');

    function generarHtmlExamenEnBlanco() {
      let variante = null;
      try {
        const v = localStorage.getItem('pc3ref_variante');
        if (v) variante = JSON.parse(v);
      } catch (e) {}
      if (!variante) variante = generarVarianteExamenPC3();

      let html = `
        <div class="print-header">
          <div class="print-header-row">
            <div class="print-header-cell" style="width:70%; font-weight:bold; font-size:11pt;">
              UNIVERSIDAD TECNOLÓGICA DEL PERÚ (UTP)<br>
              REDES Y COMUNICACIÓN DE DATOS I (100000I41N) - PRÁCTICA CALIFICADA N° 3
            </div>
            <div class="print-header-cell" style="width:30%; text-align:right;">
              <strong>NOTA:</strong> [ &nbsp; &nbsp; &nbsp; &nbsp; / 20 ]
            </div>
          </div>
          <div class="print-header-row">
            <div class="print-header-cell"><strong>Alumno:</strong> ${variante ? variante.alumno.nombreCompleto : '................................................................................................'}</div>
            <div class="print-header-cell"><strong>Código / DNI:</strong> .................................</div>
          </div>
          <div class="print-header-row">
            <div class="print-header-cell"><strong>Sede:</strong> LIMA CENTRO &nbsp; <strong>Sección:</strong> UTP-RED1 &nbsp; <strong>Turno:</strong> REGULAR</div>
            <div class="print-header-cell"><strong>Fecha:</strong> 22 / 11 / 2026 &nbsp; <strong>Fila:</strong> ÚNICA</div>
          </div>
          <div class="print-header-row">
            <div class="print-header-cell" colspan="2" style="font-size:8.5pt; color:#444; border-bottom:none;">
              <strong>Indicaciones:</strong> Examen teórico en hoja impresa resuelto a mano. Describa detalladamente pasos de configuración, rutas de menú de Packet Tracer, nombres, valores y comandos Cisco IOS solicitados.
            </div>
          </div>
        </div>
      `;

      const preguntasExam = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.preguntas))
        ? PC3_REF_DATA.preguntas
        : [];

      preguntasExam.forEach((p, idx) => {
        html += `
          <div class="print-q-block">
            <div class="print-q-title">${p.titulo}</div>
            <div class="print-q-text"><strong>Enunciado:</strong> ${p.enunciado}</div>
            <div style="font-size:9pt; color:#555; margin-bottom:6px;"><strong>Contexto:</strong> ${p.contexto}</div>
            <div style="font-size:9pt; font-weight:bold; margin-top:8px;">Espacio para respuesta escrita (Pasos, Valores, Comandos y Qué se ve en pantalla):</div>
            <div class="print-ruled-lines">
              <div class="print-rule-line"></div>
              <div class="print-rule-line"></div>
              <div class="print-rule-line"></div>
              <div class="print-rule-line"></div>
              <div class="print-rule-line"></div>
              <div class="print-rule-line"></div>
              <div class="print-rule-line"></div>
              <div class="print-rule-line"></div>
            </div>
          </div>
        `;
        if (idx === 1) {
          html += `<div class="page-break"></div>`;
        }
      });

      // Tabla de rúbrica al final
      html += `
        <div style="margin-top:15px; border:1px solid #000; padding:10px; font-size:9pt; page-break-inside:avoid;">
          <strong>CUADRO DE CALIFICACIÓN OFICIAL:</strong>
          <table style="width:100%; border-collapse:collapse; margin-top:5px; text-align:center;">
            <tr>
              <th style="border:1px solid #000; padding:4px;">Pregunta 1 (DNS)</th>
              <th style="border:1px solid #000; padding:4px;">Pregunta 2 (DHCP)</th>
              <th style="border:1px solid #000; padding:4px;">Pregunta 3 (Correo)</th>
              <th style="border:1px solid #000; padding:4px;">Pregunta 4 (Router/VoIP)</th>
              <th style="border:1px solid #000; padding:4px; font-weight:bold;">TOTAL</th>
            </tr>
            <tr>
              <td style="border:1px solid #000; padding:8px;">&nbsp; / 5.0</td>
              <td style="border:1px solid #000; padding:8px;">&nbsp; / 5.0</td>
              <td style="border:1px solid #000; padding:8px;">&nbsp; / 5.0</td>
              <td style="border:1px solid #000; padding:8px;">&nbsp; / 5.0</td>
              <td style="border:1px solid #000; padding:8px; font-weight:bold;">&nbsp; / 20.0</td>
            </tr>
          </table>
          <div style="margin-top:15px; text-align:right;">Firma del Docente: ...........................................................</div>
        </div>
      `;

      return html;
    }

    if (screenExamPreview) {
      screenExamPreview.innerHTML = generarHtmlExamenEnBlanco();
    }

    btnPrintExam.addEventListener('click', function () {
      printArea.innerHTML = generarHtmlExamenEnBlanco();
      window.print();
    });

    // IMPRESIÓN 2: SOLUCIONARIO Y RÚBRICA
    btnPrintSol.addEventListener('click', function () {
      let html = `
        <div class="print-header">
          <div class="print-header-row">
            <div class="print-header-cell" style="width:100%; font-weight:bold; font-size:12pt; text-align:center;">
              UNIVERSIDAD TECNOLÓGICA DEL PERÚ (UTP)<br>
              SOLUCIONARIO MODELO Y RÚBRICA OFICIAL - PRÁCTICA CALIFICADA N° 3 (20 PUNTOS)
            </div>
          </div>
          <div class="print-header-row">
            <div class="print-header-cell" style="font-size:9pt; color:#444;">
              Documento de referencia para corrección de examen teórico en hoja. Cada pregunta evalúa 5 criterios ponderados a 1.0 pt c/u.
            </div>
          </div>
        </div>
      `;

      const preguntasSol = (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.preguntas))
        ? PC3_REF_DATA.preguntas
        : [];

      preguntasSol.forEach((p, idx) => {
        html += `
          <div class="print-q-block">
            <div class="print-q-title">${p.titulo}</div>
            <div class="print-q-text"><strong>Enunciado:</strong> ${p.enunciado}</div>
            
            <div style="margin-top:6px; font-size:9.5pt; background:#f5f5f5; padding:6px; border-left:3px solid #000;">
              <strong>Rúbrica de Evaluación (1.0 pt por cada punto clave):</strong><br>
              ${(p.puntosClave || []).map(pt => `[ &nbsp; ] (+${pt.valor.toFixed(1)} pt) ${pt.texto}<br>`).join('')}
            </div>

            <div style="margin-top:8px; font-size:9.5pt;">
              <strong>Respuesta Modelo Escrita:</strong>
              <pre style="white-space:pre-wrap; font-family:inherit; font-size:9pt; background:#fafafa; border:1px solid #ccc; padding:6px; margin-top:4px;">${p.respuestaModelo}</pre>
            </div>

            <div style="margin-top:6px; font-size:9pt;">
              <strong>Qué debería verse en pantalla:</strong>
              <pre style="white-space:pre-wrap; font-family:inherit; font-size:8.5pt; color:#222; margin-top:2px;">${p.queDeberiaVerse}</pre>
            </div>
          </div>
        `;
        if (idx === 1) {
          html += `<div class="page-break"></div>`;
        }
      });

      printArea.innerHTML = html;
      window.print();
    });
  }

  // Fin de inicialización PC3 Referencia

  // ==========================================
  // DIAGRAMA DE TOPOLOGÍA SVG (PREGUNTA 4 PC3)
  // ==========================================
  function generarSvgTopologiaPC3() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 490" width="100%" height="auto" style="min-width: 680px; max-width: 960px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- FONDO Y ZONAS -->
  <rect width="960" height="490" fill="#f8fafc" rx="8" />
  
  <!-- ZONA LAN 1 (IZQUIERDA) -->
  <rect x="15" y="15" width="460" height="420" fill="#eff6ff" rx="8" stroke="#bfdbfe" stroke-width="1.5" stroke-dasharray="4 4" />
  <text x="30" y="40" font-size="13" font-weight="700" fill="#1e40af">RED LAN 1: 192.168.X.0 /24</text>
  <text x="30" y="56" font-size="10.5" fill="#3b82f6">Default Gateway: 192.168.X.254 (Fa0/0)</text>

  <!-- ZONA LAN 2 (DERECHA) -->
  <rect x="620" y="15" width="325" height="420" fill="#faf5ff" rx="8" stroke="#e9d5ff" stroke-width="1.5" stroke-dasharray="4 4" />
  <text x="635" y="40" font-size="13" font-weight="700" fill="#6b21a8">RED LAN 2: 192.169.1.0 /24</text>
  <rect x="805" y="27" width="70" height="18" fill="#fef08a" rx="4" stroke="#eab308" />
  <text x="812" y="40" font-size="9" font-weight="700" fill="#854d0e">VERIFICAR</text>
  <text x="635" y="56" font-size="10.5" fill="#7c3aed">Default Gateway: 192.169.1.1 (Fa0/1)</text>

  <!-- ENLACES LAN 1 -->
  <line x1="120" y1="105" x2="230" y2="175" stroke="#64748b" stroke-width="2" />
  <text x="145" y="145" font-size="9" fill="#475569">Fa0/24</text>

  <line x1="120" y1="210" x2="230" y2="185" stroke="#64748b" stroke-width="2" />
  <text x="145" y="195" font-size="9" fill="#475569">Fa0/23</text>

  <line x1="260" y1="95" x2="260" y2="165" stroke="#64748b" stroke-width="2" />
  <text x="264" y="125" font-size="9" fill="#475569">Fa0</text>

  <line x1="370" y1="95" x2="290" y2="170" stroke="#64748b" stroke-width="2" />
  <text x="325" y="130" font-size="9" fill="#475569">Fa0</text>

  <line x1="260" y1="205" x2="260" y2="285" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="3 3" />
  <text x="265" y="245" font-size="9" font-weight="700" fill="#0284c7">Troncal/Enlace SW1-SW2</text>

  <line x1="190" y1="365" x2="240" y2="305" stroke="#64748b" stroke-width="2" />
  <text x="195" y="330" font-size="9" fill="#475569">Fa0/1</text>

  <line x1="330" y1="365" x2="280" y2="305" stroke="#64748b" stroke-width="2" />
  <text x="315" y="330" font-size="9" fill="#475569">Fa0/2</text>

  <line x1="290" y1="185" x2="500" y2="215" stroke="#0f172a" stroke-width="2.5" />
  <text x="380" y="195" font-size="9.5" font-weight="700" fill="#0f172a">Fa0/0 (192.168.X.254)</text>

  <line x1="560" y1="215" x2="710" y2="195" stroke="#0f172a" stroke-width="2.5" />
  <text x="575" y="195" font-size="9.5" font-weight="700" fill="#6b21a8">Fa0/1 (192.169.1.1)</text>

  <!-- ENLACES LAN 2 -->
  <line x1="770" y1="180" x2="840" y2="110" stroke="#64748b" stroke-width="2" />
  <text x="800" y="145" font-size="9" fill="#475569">Fa0/2</text>

  <line x1="770" y1="200" x2="840" y2="200" stroke="#64748b" stroke-width="2" />
  <text x="795" y="193" font-size="9" fill="#475569">Fa0/3</text>

  <line x1="770" y1="215" x2="840" y2="295" stroke="#64748b" stroke-width="2" />
  <text x="800" y="260" font-size="9" fill="#475569">Fa0/4</text>

  <!-- DISPOSITIVOS LAN 1 -->
  <!-- Servidor 1 -->
  <g filter="url(#shadow)">
    <rect x="30" y="80" width="115" height="50" rx="6" fill="#1e40af" stroke="#1d4ed8" />
    <text x="87" y="100" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">SERVIDOR 1</text>
    <text x="87" y="113" font-size="8.5" fill="#bfdbfe" text-anchor="middle">DNS + Web + DHCP</text>
    <text x="87" y="124" font-size="8.5" font-weight="700" fill="#facc15" text-anchor="middle">192.168.X.1</text>
  </g>

  <!-- Servidor 2 -->
  <g filter="url(#shadow)">
    <rect x="30" y="180" width="115" height="50" rx="6" fill="#1e40af" stroke="#1d4ed8" />
    <text x="87" y="200" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">SERVIDOR 2</text>
    <text x="87" y="213" font-size="8.5" fill="#bfdbfe" text-anchor="middle">Email (SMTP/POP3)</text>
    <text x="87" y="224" font-size="8.5" font-weight="700" fill="#facc15" text-anchor="middle">192.168.X.2</text>
  </g>

  <!-- PC1 -->
  <g filter="url(#shadow)">
    <rect x="220" y="50" width="80" height="42" rx="5" fill="#0284c7" stroke="#0369a1" />
    <text x="260" y="68" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">PC1</text>
    <text x="260" y="82" font-size="8" fill="#e0f2fe" text-anchor="middle">Web DNS 1</text>
  </g>

  <!-- PC2 -->
  <g filter="url(#shadow)">
    <rect x="330" y="50" width="80" height="42" rx="5" fill="#0284c7" stroke="#0369a1" />
    <text x="370" y="68" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">PC2</text>
    <text x="370" y="82" font-size="8" fill="#e0f2fe" text-anchor="middle">Mail Client r1</text>
  </g>

  <!-- Switch 1 (Superior) -->
  <g filter="url(#shadow)">
    <rect x="225" y="165" width="70" height="38" rx="4" fill="#0f766e" stroke="#115e59" />
    <text x="260" y="182" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">SWITCH 1</text>
    <text x="260" y="195" font-size="8" fill="#ccfbf1" text-anchor="middle">2960-24TT</text>
  </g>

  <!-- Switch 2 (Inferior) -->
  <g filter="url(#shadow)">
    <rect x="225" y="285" width="70" height="38" rx="4" fill="#0f766e" stroke="#115e59" />
    <text x="260" y="302" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">SWITCH 2</text>
    <text x="260" y="315" font-size="8" fill="#ccfbf1" text-anchor="middle">2960-24TT</text>
  </g>

  <!-- PC4 -->
  <g filter="url(#shadow)">
    <rect x="150" y="365" width="80" height="42" rx="5" fill="#0284c7" stroke="#0369a1" />
    <text x="190" y="383" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">PC4</text>
    <text x="190" y="397" font-size="8" fill="#e0f2fe" text-anchor="middle">Web DNS 2</text>
  </g>

  <!-- PC3 -->
  <g filter="url(#shadow)">
    <rect x="290" y="365" width="85" height="42" rx="5" fill="#0284c7" stroke="#0369a1" />
    <text x="332" y="383" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">PC3 (DHCP)</text>
    <text x="332" y="397" font-size="8" fill="#e0f2fe" text-anchor="middle">Mail Client r2</text>
  </g>

  <!-- ROUTER 2811 (CENTRO) -->
  <g filter="url(#shadow)">
    <circle cx="530" cy="215" r="32" fill="#4f46e5" stroke="#3730a3" stroke-width="2" />
    <text x="530" y="212" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">ROUTER</text>
    <text x="530" y="225" font-size="9" font-weight="600" fill="#c7d2fe" text-anchor="middle">CISCO 2811</text>
  </g>

  <!-- DISPOSITIVOS LAN 2 -->
  <!-- Switch 3 -->
  <g filter="url(#shadow)">
    <rect x="700" y="180" width="70" height="38" rx="4" fill="#0f766e" stroke="#115e59" />
    <text x="735" y="197" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">SWITCH 3</text>
    <text x="735" y="210" font-size="8" fill="#ccfbf1" text-anchor="middle">2960-24TT</text>
  </g>

  <!-- Teléfono IP 1 -->
  <g filter="url(#shadow)">
    <rect x="830" y="80" width="105" height="46" rx="5" fill="#d97706" stroke="#b45309" />
    <text x="882" y="98" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">TELÉFONO IP 1</text>
    <text x="882" y="110" font-size="8.5" fill="#fef3c7" text-anchor="middle">IP 7960 • Ext: 1000</text>
    <text x="882" y="121" font-size="7.5" font-weight="700" fill="#fde047" text-anchor="middle">VERIFICAR VoIP</text>
  </g>

  <!-- Teléfono IP 2 -->
  <g filter="url(#shadow)">
    <rect x="830" y="175" width="105" height="46" rx="5" fill="#d97706" stroke="#b45309" />
    <text x="882" y="193" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">TELÉFONO IP 2</text>
    <text x="882" y="205" font-size="8.5" fill="#fef3c7" text-anchor="middle">IP 7960 • Ext: 2000</text>
    <text x="882" y="216" font-size="7.5" font-weight="700" fill="#fde047" text-anchor="middle">VERIFICAR VoIP</text>
  </g>

  <!-- Laptop -->
  <g filter="url(#shadow)">
    <rect x="830" y="270" width="105" height="46" rx="5" fill="#059669" stroke="#047857" />
    <text x="882" y="288" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">LAPTOP (L1)</text>
    <text x="882" y="300" font-size="8.5" fill="#d1fae5" text-anchor="middle">192.169.1.X</text>
    <text x="882" y="311" font-size="7.5" font-weight="700" fill="#fde047" text-anchor="middle">VERIFICAR IP</text>
  </g>

  <!-- LEYENDA INFERIOR -->
  <rect x="25" y="445" width="910" height="35" rx="6" fill="#ffffff" stroke="#e2e8f0" />
  <circle cx="45" cy="462" r="5" fill="#1e40af" />
  <text x="56" y="466" font-size="9" fill="#334155">Servidores</text>

  <circle cx="130" cy="462" r="5" fill="#0284c7" />
  <text x="141" y="466" font-size="9" fill="#334155">PCs LAN 1</text>

  <circle cx="215" cy="462" r="5" fill="#0f766e" />
  <text x="226" y="466" font-size="9" fill="#334155">Switches 2960</text>

  <circle cx="315" cy="462" r="5" fill="#4f46e5" />
  <text x="326" y="466" font-size="9" fill="#334155">Router 2811</text>

  <circle cx="410" cy="462" r="5" fill="#d97706" />
  <text x="421" y="466" font-size="9" fill="#334155">Teléfonos IP 7960</text>

  <circle cx="530" cy="462" r="5" fill="#059669" />
  <text x="541" y="466" font-size="9" fill="#334155">Laptop L1</text>

  <rect x="615" y="454" width="55" height="16" fill="#fef08a" rx="3" stroke="#eab308" />
  <text x="622" y="466" font-size="8.5" font-weight="700" fill="#854d0e">VERIFICAR</text>
  <text x="677" y="466" font-size="9" fill="#64748b">= Hipótesis no confirmada en sílabo o valor ilegible en hoja impresa</text>
</svg>`;
  }

  // ==========================================
  // MODULO: RESÚMENES TEÓRICOS (MARKDOWN MIN)
  // ==========================================
  function escaparHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMarkdownInline(str) {
    return String(str || '')
      .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#0f172a; padding:2px 5px; border-radius:4px; font-size:0.86rem; font-family:monospace;">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  }

  function renderMarkdownMinimo(md) {
    if (!md) return '<p style="color:var(--text-muted); font-style:italic;">No hay contenido disponible para esta semana.</p>';

    const codeBlocks = [];
    let text = escaparHtml(md);

    // Extraer bloques de código con ```
    text = text.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, function(match, lang, code) {
      const idx = codeBlocks.length;
      codeBlocks.push('<pre style="background:#0f172a; color:#f8fafc; padding:0.85rem 1rem; border-radius:6px; overflow-x:auto; font-size:0.88rem; line-height:1.45; margin:0.85rem 0;"><code>' + code.trim() + '</code></pre>');
      return '__CODE_BLOCK_' + idx + '__';
    });

    const lines = text.split('\n');
    const out = [];
    let inList = false;
    let listType = 'ul';
    let inTable = false;
    let tableHeaderDone = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('__CODE_BLOCK_') && line.endsWith('__')) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        if (inTable) { out.push('</tbody></table></div>'); inTable = false; }
        out.push(line);
        continue;
      }

      // Tablas Markdown (| ... |)
      if (line.startsWith('|') && line.endsWith('|')) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        if (cells.every(c => /^:?-+:?$/.test(c))) {
          tableHeaderDone = true;
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHeaderDone = false;
          out.push('<div style="overflow-x:auto; margin:1rem 0;"><table style="width:100%; border-collapse:collapse; font-size:0.88rem; border:1px solid #cbd5e1;">');
        }
        if (!tableHeaderDone) {
          out.push('<thead style="background:#f1f5f9;"><tr>' + cells.map(c => '<th style="border:1px solid #cbd5e1; padding:0.5rem 0.75rem; text-align:left;">' + formatMarkdownInline(c) + '</th>').join('') + '</tr></thead><tbody>');
        } else {
          out.push('<tr>' + cells.map(c => '<td style="border:1px solid #cbd5e1; padding:0.45rem 0.75rem;">' + formatMarkdownInline(c) + '</td>').join('') + '</tr>');
        }
        continue;
      } else if (inTable) {
        out.push('</tbody></table></div>');
        inTable = false;
      }

      if (!line) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        continue;
      }

      if (line.startsWith('#### ')) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        out.push('<h4 style="font-size:1rem; font-weight:700; color:#1e293b; margin:1.25rem 0 0.5rem 0;">' + formatMarkdownInline(line.slice(5)) + '</h4>');
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        out.push('<h3 style="font-size:1.15rem; font-weight:700; color:var(--primary); margin:1.35rem 0 0.5rem 0;">' + formatMarkdownInline(line.slice(4)) + '</h3>');
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        out.push('<h2 style="font-size:1.3rem; font-weight:700; color:var(--secondary); margin:1.5rem 0 0.6rem 0; border-bottom:1px solid #e2e8f0; padding-bottom:0.35rem;">' + formatMarkdownInline(line.slice(3)) + '</h2>');
        continue;
      }
      if (line.startsWith('# ')) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        out.push('<h1 style="font-size:1.5rem; font-weight:800; color:var(--primary); margin:1.5rem 0 0.75rem 0;">' + formatMarkdownInline(line.slice(2)) + '</h1>');
        continue;
      }

      if (/^---$|^\*\*\*$|^___$/.test(line)) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        out.push('<hr style="border:none; border-top:1px solid #cbd5e1; margin:1.25rem 0;">');
        continue;
      }

      if (line.startsWith('&gt;') || line.startsWith('>')) {
        if (inList) { out.push('</' + listType + '>'); inList = false; }
        const clean = line.replace(/^(&gt;|>)\s?/, '');
        out.push('<blockquote style="border-left:4px solid var(--primary); padding:0.5rem 1rem; margin:0.75rem 0; background:#f0f9ff; color:#0369a1; border-radius:4px;">' + formatMarkdownInline(clean) + '</blockquote>');
        continue;
      }

      if (/^[-*+]\s+/.test(line)) {
        if (!inList || listType !== 'ul') {
          if (inList) out.push('</' + listType + '>');
          out.push('<ul style="margin:0.5rem 0 0.75rem 1.4rem; padding-left:0.5rem; line-height:1.6;">');
          inList = true;
          listType = 'ul';
        }
        out.push('<li>' + formatMarkdownInline(line.replace(/^[-*+]\s+/, '')) + '</li>');
        continue;
      }
      if (/^\d+\.\s+/.test(line)) {
        if (!inList || listType !== 'ol') {
          if (inList) out.push('</' + listType + '>');
          out.push('<ol style="margin:0.5rem 0 0.75rem 1.4rem; padding-left:0.5rem; line-height:1.6;">');
          inList = true;
          listType = 'ol';
        }
        out.push('<li>' + formatMarkdownInline(line.replace(/^\d+\.\s+/, '')) + '</li>');
        continue;
      }

      if (inList) { out.push('</' + listType + '>'); inList = false; }
      out.push('<p style="margin-bottom:0.75rem; line-height:1.6;">' + formatMarkdownInline(line) + '</p>');
    }

    if (inList) out.push('</' + listType + '>');
    if (inTable) out.push('</tbody></table></div>');

    let html = out.join('\n');
    codeBlocks.forEach(function(cb, idx) {
      html = html.replace('__CODE_BLOCK_' + idx + '__', cb);
    });

    return html;
  }

  function resaltarTextoEnHtml(html, termino) {
    if (!termino || termino.trim().length < 2) return { html: html, count: 0 };
    const q = termino.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = /((?:<[^>]+>)*)([^<]+)/g;
    let count = 0;
    const targetRegex = new RegExp('(' + escaped + ')', 'gi');
    const resultado = html.replace(regex, function(match, tags, text) {
      if (!text) return match;
      const nuevoTexto = text.replace(targetRegex, function(m) {
        count++;
        return '<mark class="resumen-search-match">' + m + '</mark>';
      });
      return (tags || '') + nuevoTexto;
    });
    return { html: resultado, count: count };
  }

  function initModuloResumenes() {
    const selectSemana = document.getElementById('select-resumen-semana');
    const inputBuscar = document.getElementById('input-buscar-resumen');
    const container = document.getElementById('resumen-contenido-box');
    const titleEl = document.getElementById('resumen-titulo');
    const badgeArchivo = document.getElementById('resumen-badge-archivo');
    const searchStatus = document.getElementById('resumen-search-status');

    if (!container || !selectSemana) return;

    function renderizarSemanaActual() {
      const clave = selectSemana.value;
      const query = inputBuscar ? inputBuscar.value.trim() : '';
      const datos = DATA.resumenes && DATA.resumenes[clave];

      if (!datos) {
        if (titleEl) titleEl.textContent = 'Semana ' + clave;
        if (badgeArchivo) badgeArchivo.textContent = '';
        if (searchStatus) searchStatus.textContent = '';
        container.innerHTML = '<p style="color:var(--danger); padding:1rem;">⚠️ El resumen para esta semana no está disponible en <code>data/resumenes.js</code>.</p>';
        return;
      }

      if (titleEl) titleEl.textContent = datos.titulo || ('Resumen Semana ' + clave);
      if (badgeArchivo) badgeArchivo.textContent = datos.archivo ? 'content/' + datos.archivo : '';

      const htmlBase = renderMarkdownMinimo(datos.markdown);
      if (query && query.length >= 2) {
        const busqueda = resaltarTextoEnHtml(htmlBase, query);
        container.innerHTML = busqueda.html;
        if (searchStatus) {
          if (busqueda.count > 0) {
            searchStatus.textContent = busqueda.count + ' coincidencia' + (busqueda.count > 1 ? 's' : '') + ' encontrada' + (busqueda.count > 1 ? 's' : '');
            searchStatus.style.color = '#15803d';
          } else {
            searchStatus.textContent = 'Sin coincidencias en esta semana';
            searchStatus.style.color = '#b91c1c';
          }
        }
      } else {
        container.innerHTML = htmlBase;
        if (searchStatus) searchStatus.textContent = '';
      }
    }

    selectSemana.addEventListener('change', function() {
      if (inputBuscar) inputBuscar.value = '';
      renderizarSemanaActual();
    });

    if (inputBuscar) {
      inputBuscar.addEventListener('input', function() {
        renderizarSemanaActual();
      });
    }

    renderizarSemanaActual();
  }

  // Fin de inicialización PC3 Referencia

})();
