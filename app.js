// APLICACIÓN SIMULADOR PC3 - UTP (REDES Y COMUNICACIÓN DE DATOS I)
// Vanilla JavaScript - 100% Offline, sin dependencias.

(function () {
  'use strict';

  // ==========================================
  // ESTADO GLOBAL Y LOCALSTORAGE
  // ==========================================
  const STORAGE_KEY = 'utp_pc3_progreso_v1';

  let appState = {
    stats: {
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
    },
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
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        appState.stats = Object.assign(appState.stats, parsed);
      }
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
    }
  }

  function guardarStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.stats));
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e);
    }
  }

  function registrarIntento(id, semana, esCorrecto) {
    appState.stats.total++;
    if (esCorrecto) {
      appState.stats.aciertos++;
      if (appState.stats.semanas[semana]) {
        appState.stats.semanas[semana].aciertos++;
      }
      // Quitar de fallos si estaba
      const idx = appState.stats.fallosIds.indexOf(id);
      if (idx > -1) {
        appState.stats.fallosIds.splice(idx, 1);
      }
    } else {
      appState.stats.fallos++;
      if (appState.stats.semanas[semana]) {
        appState.stats.semanas[semana].fallos++;
      }
      if (!appState.stats.fallosIds.includes(id)) {
        appState.stats.fallosIds.push(id);
      }
    }
    guardarStats();
    actualizarPanelProgreso();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  document.addEventListener('DOMContentLoaded', function () {
    // Incorporar preguntas teóricas nuevas de PC3 de Referencia al banco general si existen
    if (typeof PC3_REF_DATA !== 'undefined' && Array.isArray(PC3_REF_DATA.preguntasTeoricasNuevas)) {
      PC3_REF_DATA.preguntasTeoricasNuevas.forEach(np => {
        if (!PREGUNTAS_DATA.some(p => p.id === np.id)) {
          PREGUNTAS_DATA.push(np);
        }
      });
    }

    cargarStats();
    initNavegacion();
    initModuloPreguntas();
    initModuloComandos();
    initModuloCalculo();
    initModuloSimulacro();
    initModuloProgreso();
    initModuloFlashcards();
    if (typeof PC3_REF_DATA !== 'undefined') {
      initModuloPC3Referencia();
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
        }
      });
    });
  }

  // ==========================================
  // MÓDULO 1: BANCO DE PREGUNTAS TEÓRICAS
  // ==========================================
  function initModuloPreguntas() {
    const filterSemana = document.getElementById('filter-semana-preguntas');
    const filterTipo = document.getElementById('filter-tipo-preguntas');
    const btnReset = document.getElementById('btn-reset-preguntas');

    function renderizar() {
      const sem = filterSemana.value;
      const tipo = filterTipo.value;
      const container = document.getElementById('preguntas-container');
      const counter = document.getElementById('preguntas-counter');

      let lista = PREGUNTAS_DATA.filter(p => {
        const matchSem = sem === 'todas' || p.semana.toString() === sem;
        const matchTipo = tipo === 'todos' || p.tipo === tipo;
        return matchSem && matchTipo;
      });

      counter.textContent = `Mostrando ${lista.length} de ${PREGUNTAS_DATA.length} preguntas`;
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
          const optList = document.createElement('div');
          optList.className = 'options-list';

          p.opciones.forEach((optText, optIdx) => {
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
                btns[p.respuesta].classList.add('selected-correct');
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

          btnComprobar.addEventListener('click', function () {
            if (card.classList.contains('answered')) return;
            const val = input.value.trim().toLowerCase();
            if (!val) return;

            card.classList.add('answered');
            input.disabled = true;
            btnComprobar.disabled = true;

            const esCorrecto = p.respuestasValidas.some(r => r.toLowerCase() === val);
            if (esCorrecto) {
              feedbackBox.className = 'feedback-box show correct';
              feedbackBox.innerHTML = `<strong>&#10004; ¡Correcto!</strong> ${p.explicacion}`;
            } else {
              feedbackBox.className = 'feedback-box show wrong';
              feedbackBox.innerHTML = `<strong>&#10008; Respuesta incorrecta.</strong> La respuesta esperada era: <code>${p.respuestasValidas[0]}</code>.<br>${p.explicacion}`;
            }
            registrarIntento(p.id, p.semana, esCorrecto);
          });

          compDiv.appendChild(input);
          compDiv.appendChild(btnComprobar);
          card.appendChild(compDiv);

        } else if (p.tipo === 'relacionar') {
          const matchContainer = document.createElement('div');
          matchContainer.style.marginBottom = '1rem';

          const pares = p.pares;
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
              alert('Por favor seleccione una opción para cada elemento antes de verificar.');
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
        }

        card.appendChild(feedbackBox);
        container.appendChild(card);
      });
    }

    filterSemana.addEventListener('change', renderizar);
    filterTipo.addEventListener('change', renderizar);
    btnReset.addEventListener('click', renderizar);

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

    const btnPrev = document.getElementById('btn-cmd-prev');
    const btnNext = document.getElementById('btn-cmd-next');
    const btnPista = document.getElementById('btn-cmd-pista');
    const btnSol = document.getElementById('btn-cmd-solucion');

    // Poblar selector de comandos
    COMANDOS_DATA.forEach((cmd, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `[Semana ${cmd.semana}] ${cmd.tema}: Ejercicio ${idx + 1}`;
      select.appendChild(opt);
    });

    function cargarEjercicio(idx) {
      if (idx < 0) idx = 0;
      if (idx >= COMANDOS_DATA.length) idx = COMANDOS_DATA.length - 1;
      appState.comandoActualIdx = idx;
      select.value = idx;

      const c = COMANDOS_DATA[idx];
      metaDiv.textContent = `SEMANA ${c.semana} • ${c.tema}`;
      enunciadoDiv.textContent = c.enunciado;
      promptSpan.textContent = c.prompt;

      termInput.value = '';
      termInput.disabled = false;
      termInput.focus();

      feedbackBox.className = 'feedback-box';
      feedbackBox.style.display = 'none';

      termHistory.textContent = `Terminal Cisco IOS / Consola activa.\nModo actual: ${c.prompt}\nEscriba la sintaxis y presione [Enter]:`;
    }

    // Normalizador y validador con tolerancia a comandos Cisco
    function validarComando(inputStr, cmdObj) {
      const raw = inputStr.trim();
      if (!raw) return false;

      // 1. Probar patrones Regex oficiales
      if (cmdObj.patronesValidos && cmdObj.patronesValidos.length > 0) {
        for (let pat of cmdObj.patronesValidos) {
          if (pat.test(raw)) return true;
        }
      }

      // 2. Normalización de abreviaturas frecuentes de Cisco
      let norm = raw.toLowerCase().replace(/\s+/g, ' ');
      let solNorm = cmdObj.solucion.toLowerCase().replace(/\s+/g, ' ');

      if (norm === solNorm) return true;

      // Diccionario de equivalencias
      const equivalencias = [
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

      for (let [regex, rep] of equivalencias) {
        norm = norm.replace(regex, rep);
      }

      for (let [regex, rep] of equivalencias) {
        solNorm = solNorm.replace(regex, rep);
      }

      return norm === solNorm;
    }

    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const cmd = COMANDOS_DATA[appState.comandoActualIdx];
        const val = termInput.value;
        const esCorrecto = validarComando(val, cmd);

        termHistory.textContent += `\n${cmd.prompt}${val}`;

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
        body.scrollTop = body.scrollHeight;
        termInput.value = '';
      }
    });

    select.addEventListener('change', () => cargarEjercicio(parseInt(select.value, 10)));
    btnPrev.addEventListener('click', () => cargarEjercicio(appState.comandoActualIdx - 1));
    btnNext.addEventListener('click', () => cargarEjercicio(appState.comandoActualIdx + 1));

    btnPista.addEventListener('click', function () {
      const c = COMANDOS_DATA[appState.comandoActualIdx];
      alert(`Pista:\n- ${c.pistas.join('\n- ')}`);
    });

    btnSol.addEventListener('click', function () {
      const c = COMANDOS_DATA[appState.comandoActualIdx];
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

    // Llenar selector
    CALCULO_DATA.forEach((calc, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `[Semana ${calc.semana}] ${calc.titulo}`;
      select.appendChild(opt);
    });

    function generarVariante() {
      const idx = parseInt(select.value, 10);
      const template = CALCULO_DATA[idx];
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
      pasosBox.style.display = 'none';

      pasosLista.innerHTML = instancia.pasos.map(p => `<li>${p}</li>`).join('');
    }

    btnNuevo.addEventListener('click', generarVariante);
    select.addEventListener('change', generarVariante);

    btnVerificar.addEventListener('click', function () {
      if (!appState.calculoActual) return;
      const inst = appState.calculoActual.instancia;
      const tmpl = appState.calculoActual.template;
      const val = input.value.trim();

      if (!val) {
        alert('Por favor ingrese un resultado antes de verificar.');
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

    const timerSpan = document.getElementById('simulacro-timer');
    const preguntasLista = document.getElementById('simulacro-preguntas-lista');
    const revisionContainer = document.getElementById('simulacro-revision-container');

    btnIniciar.addEventListener('click', function () {
      iniciarSimulacro(parseInt(selectTiempo.value, 10));
    });

    btnFinalizar.addEventListener('click', function () {
      if (confirm('¿Estás seguro de que deseas finalizar y calificar tu examen?')) {
        finalizarSimulacro();
      }
    });

    btnReintentar.addEventListener('click', function () {
      resultadoDiv.style.display = 'none';
      configDiv.style.display = 'block';
    });

    btnVerFallos.addEventListener('click', function () {
      revisionContainer.scrollIntoView({ behavior: 'smooth' });
    });

    function iniciarSimulacro(minutos) {
      configDiv.style.display = 'none';
      resultadoDiv.style.display = 'none';
      activoDiv.style.display = 'block';

      appState.simulacro.activo = true;
      appState.simulacro.calificado = false;
      appState.simulacro.respuestasUsuario = {};

      // Armar las 20 preguntas del simulacro ponderadas por semana
      // 10 preguntas teóricas (2 de cada semana 11-15)
      // 5 de comandos (1 de cada semana 11-15)
      // 5 de cálculo (repartidas)
      let examSet = [];

      for (let s = 11; s <= 15; s++) {
        const teoricasSemana = PREGUNTAS_DATA.filter(p => p.semana === s).sort(() => Math.random() - 0.5);
        if (teoricasSemana[0]) examSet.push({ tipoItem: 'teoria', data: teoricasSemana[0] });
        if (teoricasSemana[1]) examSet.push({ tipoItem: 'teoria', data: teoricasSemana[1] });

        const cmdSemana = COMANDOS_DATA.filter(c => c.semana === s).sort(() => Math.random() - 0.5);
        if (cmdSemana[0]) examSet.push({ tipoItem: 'comando', data: cmdSemana[0] });
      }

      // 5 ejercicios de cálculo
      const calcMezclados = CALCULO_DATA.slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < 5; i++) {
        if (calcMezclados[i]) {
          const inst = calcMezclados[i].generar();
          examSet.push({ tipoItem: 'calculo', data: calcMezclados[i], instancia: inst });
        }
      }

      appState.simulacro.preguntas = examSet;
      renderizarPreguntasSimulacro();

      // Temporizador
      if (appState.simulacro.timerInterval) {
        clearInterval(appState.simulacro.timerInterval);
      }

      if (minutos > 0) {
        appState.simulacro.segundosRestantes = minutos * 60;
        actualizarTimerUI();
        appState.simulacro.timerInterval = setInterval(function () {
          appState.simulacro.segundosRestantes--;
          actualizarTimerUI();
          if (appState.simulacro.segundosRestantes <= 0) {
            clearInterval(appState.simulacro.timerInterval);
            alert('¡El tiempo del examen ha finalizado! Se procederá a calificar.');
            finalizarSimulacro();
          }
        }, 1000);
      } else {
        timerSpan.textContent = 'Sin límite';
      }
    }

    function actualizarTimerUI() {
      const seg = appState.simulacro.segundosRestantes;
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
            item.data.opciones.forEach((op, opIdx) => {
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
          } else {
            // Completar
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-text';
            input.style.width = '100%';
            input.placeholder = 'Escriba su respuesta...';
            input.addEventListener('input', function () {
              appState.simulacro.respuestasUsuario[idx] = this.value;
            });
            card.appendChild(input);
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
        let esCorrecto = false;
        let respuestaEsperadaTxt = '';
        let explicacionTxt = '';

        if (item.tipoItem === 'teoria') {
          explicacionTxt = item.data.explicacion;
          if (item.data.tipo === 'opcion_multiple' || item.data.tipo === 'verdadero_falso') {
            esCorrecto = rUser === item.data.respuesta;
            respuestaEsperadaTxt = item.data.opciones[item.data.respuesta];
          } else if (item.data.tipo === 'completar') {
            esCorrecto = rUser && item.data.respuestasValidas.some(r => r.toLowerCase() === rUser.trim().toLowerCase());
            respuestaEsperadaTxt = item.data.respuestasValidas[0];
          }
        } else if (item.tipoItem === 'comando') {
          explicacionTxt = item.data.explicacion;
          respuestaEsperadaTxt = item.data.solucion;
          if (rUser) {
            const raw = rUser.trim();
            if (item.data.patronesValidos && item.data.patronesValidos.some(p => p.test(raw))) {
              esCorrecto = true;
            } else if (raw.toLowerCase() === item.data.solucion.toLowerCase()) {
              esCorrecto = true;
            }
          }
        } else if (item.tipoItem === 'calculo') {
          explicacionTxt = item.instancia.pasos.join('<br>');
          respuestaEsperadaTxt = `${item.instancia.respuestaCorrecta} ${item.instancia.unidad || ''}`;
          if (rUser) {
            if (typeof item.instancia.validador === 'function') {
              esCorrecto = item.instancia.validador(rUser);
            } else if (item.instancia.tipoInput === 'numero') {
              const num = parseFloat(rUser.replace(',', '.'));
              const tol = item.instancia.tolerancia || 0.001;
              esCorrecto = !isNaN(num) && Math.abs(num - item.instancia.respuestaCorrecta) <= tol;
            } else {
              esCorrecto = rUser.trim().toLowerCase() === item.instancia.respuestaCorrecta.toString().toLowerCase();
            }
          }
        }

        if (esCorrecto) {
          puntaje += 1.0;
        }

        registrarIntento(`sim-${idx}`, item.data.semana, esCorrecto);

        // Bloque de revisión
        revisionHtml += `
          <div class="card" style="border-left: 4px solid ${esCorrecto ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 1rem;">
            <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:0.25rem;">
              <span>Pregunta ${numPto} (${item.tipoItem.toUpperCase()} - SEMANA ${item.data.semana})</span>
              <span style="color:${esCorrecto ? 'var(--success)' : 'var(--danger)'};">${esCorrecto ? '+1.0 Pto (Correcto)' : '0.0 Ptos (Incorrecto)'}</span>
            </div>
            <p style="font-size:0.92rem; margin-bottom:0.5rem;"><strong>Tu respuesta:</strong> <code>${rUser !== undefined ? rUser : '(Sin responder)'}</code></p>
            <p style="font-size:0.92rem; margin-bottom:0.5rem; color:#1e293b;"><strong>Solución esperada:</strong> <code>${respuestaEsperadaTxt}</code></p>
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
        localStorage.removeItem(STORAGE_KEY);
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
            p.puntosClave.forEach(pt => {
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
        const totalCmds = typeof PC3_REF_DATA !== 'undefined' ? PC3_REF_DATA.comandosDrill.length : 10;
        pc3RefCmdsEl.textContent = `${cmdStats.aciertos || 0} / ${totalCmds}`;
      } catch (e) {
        console.warn('Error leyendo stats de pc3ref:', e);
      }
    }
  }

  function mostrarRevisionFallos() {
    const fallosBox = document.getElementById('fallos-review-box');
    const fallosList = document.getElementById('fallos-list-container');
    fallosBox.style.display = 'block';
    fallosList.innerHTML = '';

    const preguntasFalladas = PREGUNTAS_DATA.filter(p => appState.stats.fallosIds.includes(p.id));

    if (preguntasFalladas.length === 0) {
      fallosList.innerHTML = '<p style="color:var(--text-muted);">Los fallos registrados corresponden a comandos o simulacros previos.</p>';
      return;
    }

    preguntasFalladas.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.borderLeft = '4px solid var(--danger)';
      card.style.marginBottom = '1rem';

      card.innerHTML = `
        <div class="q-meta">
          <span class="tag-week">SEMANA ${p.semana}</span>
          <span class="tag-topic">${p.tema}</span>
        </div>
        <div class="q-text">${p.enunciado}</div>
        <div style="background:var(--success-bg); border:1px solid #bbf7d0; padding:0.75rem; border-radius:6px; font-size:0.9rem; margin-top:0.5rem; color:#166534;">
          <strong>Respuesta correcta:</strong> ${p.opciones ? p.opciones[p.respuesta] : p.respuestasValidas[0]}<br>
          <strong>Explicación:</strong> ${p.explicacion}
        </div>
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

      // Extraer tanto de PREGUNTAS_DATA como de COMANDOS_DATA
      PREGUNTAS_DATA.forEach(p => {
        if (sem === 'todas' || p.semana.toString() === sem) {
          items.push({
            semana: p.semana,
            tema: p.tema,
            pregunta: p.enunciado,
            respuesta: `<strong>Respuesta:</strong> ${p.opciones ? p.opciones[p.respuesta] : (p.respuestasValidas ? p.respuestasValidas[0] : 'Ver concepto')}<br><br><strong>Explicación:</strong> ${p.explicacion}`
          });
        }
      });

      COMANDOS_DATA.forEach(c => {
        if (sem === 'todas' || c.semana.toString() === sem) {
          items.push({
            semana: c.semana,
            tema: `Comando: ${c.tema}`,
            pregunta: `[${c.prompt}] ${c.enunciado}`,
            respuesta: `<strong>Comando Cisco:</strong> <code>${c.solucion}</code><br><br><strong>Propósito:</strong> ${c.explicacion}`
          });
        }
      });

      appState.flashcards.lista = items.sort(() => Math.random() - 0.5);
      appState.flashcards.actualIdx = 0;
      mostrarCard(0);
    }

    function mostrarCard(idx) {
      if (appState.flashcards.lista.length === 0) return;
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

    PC3_REF_DATA.preguntas.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pc3ref-q-card';
      card.setAttribute('data-qid', p.id);

      const savedText = respuestasGuardadas[p.id] || '';
      const wordCount = savedText.trim() ? savedText.trim().split(/\s+/).length : 0;
      const charCount = savedText.length;

      // Calcular puntos actuales en rúbrica de esta pregunta
      let pScore = 0;
      p.puntosClave.forEach(pt => {
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

        <!-- BOTÓN DESPLEGABLE SOLUCIÓN Y RÚBRICA -->
        <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:0.75rem;">
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
              ${p.puntosClave.map(pt => `
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
  }

  function actualizarPuntajesRubrica() {
    let rubricGuardada = {};
    try {
      rubricGuardada = JSON.parse(localStorage.getItem('pc3ref_rubric') || '{}');
    } catch (e) {
      console.warn(e);
    }

    let totalGlobal = 0;

    PC3_REF_DATA.preguntas.forEach(p => {
      let pScore = 0;
      p.puntosClave.forEach(pt => {
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

    PC3_REF_DATA.plantillas.forEach(pl => {
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
      const lista = PC3_REF_DATA.comandosDrill.filter(c => c.tipo === modoActual);

      let cmdStats = {};
      try {
        cmdStats = JSON.parse(localStorage.getItem('pc3ref_cmd_stats') || '{"aciertos":0,"ids":[]}');
      } catch (e) {
        cmdStats = { aciertos: 0, ids: [] };
      }

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
    btnPrintExam.addEventListener('click', function () {
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
            <div class="print-header-cell"><strong>Alumno:</strong> ................................................................................................</div>
            <div class="print-header-cell"><strong>Código / DNI:</strong> .................................</div>
          </div>
          <div class="print-header-row">
            <div class="print-header-cell"><strong>Sede:</strong> .................................... &nbsp; <strong>Sección:</strong> ................ &nbsp; <strong>Turno:</strong> ..........</div>
            <div class="print-header-cell"><strong>Fecha:</strong> ...... / ...... / 2026 &nbsp; <strong>Fila:</strong> ÚNICA</div>
          </div>
          <div class="print-header-row">
            <div class="print-header-cell" colspan="2" style="font-size:8.5pt; color:#444; border-bottom:none;">
              <strong>Indicaciones:</strong> Examen teórico en hoja impresa resuelto a mano. Describa detalladamente pasos de configuración, rutas de menú de Packet Tracer, nombres, valores y comandos Cisco IOS solicitados.
            </div>
          </div>
        </div>
      `;

      PC3_REF_DATA.preguntas.forEach((p, idx) => {
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

      printArea.innerHTML = html;
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

      PC3_REF_DATA.preguntas.forEach((p, idx) => {
        html += `
          <div class="print-q-block">
            <div class="print-q-title">${p.titulo}</div>
            <div class="print-q-text"><strong>Enunciado:</strong> ${p.enunciado}</div>
            
            <div style="margin-top:6px; font-size:9.5pt; background:#f5f5f5; padding:6px; border-left:3px solid #000;">
              <strong>Rúbrica de Evaluación (1.0 pt por cada punto clave):</strong><br>
              ${p.puntosClave.map(pt => `[ &nbsp; ] (+${pt.valor.toFixed(1)} pt) ${pt.texto}<br>`).join('')}
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

})();
