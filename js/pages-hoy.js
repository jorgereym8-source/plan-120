/* Plan 120 · páginas Hoy y Plan */
(function () {
  'use strict';
  const P = window.PLAN, A = window.App, esc = A.esc, num = A.num, f = A.f;

  A.prepWeek = function (d) {
    let idx = 0; P.prepWeeks.forEach((w, i) => { if (d >= w.from) idx = i; });
    return idx >= 0 && A.dayN(d) < 1 ? { i: idx, w: P.prepWeeks[idx] } : null;
  };
  A.act.prepCheck = (el) => { const S = A.S; S.prep = S.prep || {}; const w = S.prep[el.dataset.w] = S.prep[el.dataset.w] || {}; w[el.dataset.i] = !w[el.dataset.i]; A.haptic(10); A.save(); A.rerender(); };

  function curDate() { return A.S.ui.hoyDate && A.S.ui.hoyDate <= A.today() ? A.S.ui.hoyDate : A.today(); }

  A.act.hoyPrev = () => { A.S.ui.hoyDate = A.addDays(curDate(), -1); A.save(); A.rerender(); };
  A.act.hoyNext = () => { const n = A.addDays(curDate(), 1); A.S.ui.hoyDate = n > A.today() ? A.today() : n; A.save(); A.rerender(); };
  A.act.hoyToday = () => { A.S.ui.hoyDate = A.today(); A.save(); A.rerender(); };
  A.act.toggleMeal = (el) => {
    const d = curDate(); const lg = A.log(d); lg.meals = lg.meals || {}; const s = el.dataset.slot;
    lg.meals[s] = lg.meals[s] === true ? false : true; A.haptic(12); A.save(); A.rerender();
  };
  A.act.water = (el) => { const lg = A.log(curDate()); lg.water = Math.max(0, (lg.water || 0) + (+el.dataset.d)); A.haptic(8); A.save(); A.rerender(); };
  A.act.check = (el) => { const lg = A.log(curDate()); lg.checks = lg.checks || {}; lg.checks[el.dataset.id] = !lg.checks[el.dataset.id]; A.haptic(10); A.save(); A.rerender(); };
  A.act.wcheck = (el) => { const w = el.dataset.w; const wk = A.S.weekly[w] = A.S.weekly[w] || {}; wk[el.dataset.id] = !wk[el.dataset.id]; A.haptic(10); A.save(); A.rerender(); };
  A.act.swapMeal = (el) => {
    const d = curDate(); const slot = el.dataset.slot; const menu = A.menuFor(d);
    const opts = A.S.recipes.filter((r) => r.slot === slot);
    const fuera = (slot === 'almuerzo' || slot === 'cena') ? '<button class="opt ' + (menu[slot] === 'fuera' ? 'on' : '') + '" data-act="doSwap" data-slot="' + slot + '" data-id="fuera"><b>🍽️ Comida fuera</b><small>≈750 kcal · aplica las reglas de comer fuera</small></button>' : '';
    A.modal(opts.map((r) => { const m = A.macros(r.ing); return '<button class="opt ' + (menu[slot] === r.id ? 'on' : '') + '" data-act="doSwap" data-slot="' + slot + '" data-id="' + r.id + '"><b>' + esc(r.name) + '</b><small>' + Math.round(m.k) + ' kcal · ' + Math.round(m.p) + ' g prot · ' + (r.tags || []).join(' · ') + '</small></button>'; }).join('') + fuera +
      '<div class="row gap"><button class="btn ghost" data-act="viewRecipe" data-id="' + menu[slot] + '">Ver receta actual</button><button class="btn ghost" data-act="doSwap" data-slot="' + slot + '" data-id="__reset">Volver al menú del plan</button></div>', { title: 'Cambiar ' + (A.S.mealSlots.find((s) => s.id === slot) || {}).name + ' de hoy' });
  };
  A.act.doSwap = (el) => {
    const lg = A.log(curDate()); lg.swap = lg.swap || {};
    if (el.dataset.id === '__reset') delete lg.swap[el.dataset.slot]; else lg.swap[el.dataset.slot] = el.dataset.id;
    A.save(); A.closeModal(); A.rerender();
  };
  A.act.addExtra = () => {
    A.modal('<div class="presets">' +
      [['Comida fuera (estimación)', 750, 40, 1], ['Cena fuera ligera', 600, 40, 1], ['Capricho extra', 150, 2, 0], ['Refresco normal', 140, 0, 0], ['Puñado frutos secos', 180, 6, 0], ['Yogur proteico extra', 75, 11, 0], ['Pieza de fruta', 80, 1, 0], ['Café con leche', 60, 4, 0]]
        .map((x) => '<button class="chip" data-act="quickExtra" data-n="' + esc(x[0]) + '" data-k="' + x[1] + '" data-p="' + x[2] + '" data-o="' + x[3] + '">' + esc(x[0]) + ' · ' + x[1] + '</button>').join('') +
      '</div><div class="grid2">' + '<label class="fld"><span>Qué</span><input id="xn" placeholder="Ej. bocadillo en la cafetería"></label>' +
      '<label class="fld"><span>kcal</span><input id="xk" type="number" inputmode="numeric"></label>' + '<label class="fld"><span>Proteína (g)</span><input id="xp" type="number" inputmode="numeric"></label>' +
      '<label class="tog"><span>Ha sido comer fuera</span><input id="xo" type="checkbox"><i></i></label></div><button class="btn" data-act="saveExtra">Añadir</button>', { title: 'Añadir algo fuera del plan' });
  };
  A.act.quickExtra = (el) => { const lg = A.log(curDate()); (lg.extras = lg.extras || []).push({ n: el.dataset.n, k: +el.dataset.k, p: +el.dataset.p, out: el.dataset.o === '1' }); A.save(); A.closeModal(); A.rerender(); };
  A.act.saveExtra = () => {
    const n = document.getElementById('xn').value || 'Extra'; const k = +document.getElementById('xk').value || 0; const p = +document.getElementById('xp').value || 0; const o = document.getElementById('xo').checked;
    const lg = A.log(curDate()); (lg.extras = lg.extras || []).push({ n, k, p, out: o }); A.save(); A.closeModal(); A.rerender();
  };
  A.act.delExtra = (el) => { const lg = A.log(curDate()); lg.extras.splice(+el.dataset.i, 1); A.save(); A.rerender(); };

  function nextRoutine() {
    const ws = A.S.workouts; if (!ws.length) return A.S.routines[0];
    const last = ws[ws.length - 1].routine; const idx = A.S.routines.findIndex((r) => r.id === last);
    return A.S.routines[(idx + 1) % A.S.routines.length];
  }
  A.nextRoutine = nextRoutine;

  A.pages.hoy = {
    render() {
      const S = A.S, d = curDate(), isToday = d === A.today(), dn = A.dayN(d), w = A.weekN(d), rw = A.roadWeek(Math.max(1, w));
      const lg = S.logs[d] || {}; const T = S.targets; let h = '';
      const name = S.profile.name ? ', ' + esc(S.profile.name) : '';
      h += '<div class="datebar"><button class="icon-btn" data-act="hoyPrev">‹</button><div><b>' + (isToday ? 'Hoy' : P.dayNames[A.dayKey(d)]) + '</b> · ' + A.fmtDate(d, true) + '</div><button class="icon-btn" data-act="hoyNext"' + (isToday ? ' disabled' : '') + '>›</button>' + (!isToday ? '<button class="chip" data-act="hoyToday">Hoy</button>' : '') + '</div>';

      if (dn < 1) {
        const pw = A.prepWeek(d);
        h += '<div class="card hero"><div class="kicker">Mes de adaptación · faltan ' + (1 - dn) + ' días</div><h1>El plan empieza el ' + A.fmtDate(S.profile.startDate, true) + '</h1><p>Noviembre es para aprender el sistema sin presión: compras, recetas, gimnasio, app y PDF. Aún no hay objetivo de peso; si comes el menú del plan, ya habrá un pequeño déficit, y está bien.</p>' +
          (pw ? '<div class="focus"><div><small>' + esc(pw.w.name) + '</small><div class="checks" style="margin-top:6px">' + pw.w.tasks.map((t, i) => { const on = ((S.prep || {})[pw.i] || {})[i]; return '<button class="checkrow ' + (on ? 'on' : '') + '" data-act="prepCheck" data-w="' + pw.i + '" data-i="' + i + '"><i>' + (on ? '✓' : '') + '</i>' + esc(t) + '</button>'; }).join('') + '</div></div></div>' : '') +
          '<a class="btn" href="#plan">Ver el mes de adaptación y la hoja de ruta</a></div>';
      } else {
        const pct = Math.min(100, dn / 120 * 100);
        h += '<div class="card hero"><div class="kicker">' + A.icon('🗓️') + 'Día ' + Math.min(dn, 120) + ' de 120 · Semana ' + Math.min(w, 17) + ' · ' + esc(rw.phase) + '</div><h1>' + (dn > 120 ? 'Plan completado. Toca mantener.' : 'Constancia, no perfección' + name + '.') + '</h1><div class="pbar-t big"><div style="width:' + pct + '%"></div></div>' +
          '<div class="focus">' + A.icon('🎯') + '<div><small>Hábito de la semana</small><p>' + esc(rw.focus) + '</p></div></div></div>';
      }
      if (!A.weightSeries().length) h += '<a class="card banner" href="#progreso/datos">' + A.icon('📥') + '<div><b>Importa tus datos de inicio</b><small>Peso inicial, historial y cintura: Progreso → Datos</small></div><span>›</span></a>';

      // Comidas
      const menu = A.menuFor(d); const intake = A.dayIntake(d); const meals = lg.meals || {};
      h += '<div class="card"><div class="card-h"><h3>' + A.icon('🍽️') + 'Comidas</h3><a class="link" href="#dieta/semana">Menú</a></div>';
      h += '<div class="rings">' + A.ring(intake.k, T.kcal, 'kcal', num(intake.k) + ' / ' + num(T.kcal)) + A.ring(intake.p, T.protein, 'proteína', num(intake.p) + ' / ' + T.protein + ' g', 'var(--success)') + '</div>';
      h += '<div class="meals">' + S.mealSlots.map((s) => {
        const id = menu[s.id]; if (!id) return ''; const m = A.recipeMacros(id); const done = meals[s.id] === true; const swapped = lg.swap && lg.swap[s.id];
        return '<div class="meal ' + (done ? 'done' : '') + '"><button class="chk ' + (done ? 'on' : '') + '" data-act="toggleMeal" data-slot="' + s.id + '" aria-label="Marcar">' + (done ? '✓' : '') + '</button><div class="meal-b" data-act="swapMeal" data-slot="' + s.id + '"><small>' + A.icon(s.icon) + esc(s.name) + ' · ' + esc(s.time) + (swapped ? ' · cambiado' : '') + '</small><b>' + esc(A.recipeName(id)) + '</b><span class="muted small">' + Math.round(m.k) + ' kcal · ' + Math.round(m.p) + ' g prot</span></div></div>';
      }).join('') + '</div>';
      if ((lg.extras || []).length) h += '<div class="extras">' + lg.extras.map((x, i) => '<span class="chip">' + (x.out ? '🍽️ ' : '') + esc(x.n) + ' · ' + x.k + ' kcal <button data-act="delExtra" data-i="' + i + '">✕</button></span>').join('') + '</div>';
      h += '<div class="row gap"><button class="btn ghost sm" data-act="addExtra">+ Fuera del plan</button><span class="muted small">Toca una comida para cambiarla por otra opción</span></div></div>';

      // Registro rápido
      const base = 'logs.' + d + '.';
      const waterTarget = Math.round(T.water * 4);
      h += '<div class="card"><div class="card-h"><h3>' + A.icon('📝') + 'Registro del día</h3></div><div class="grid2">' +
        f.num('Peso (ayunas)', base + 'w', lg.w, { unit: 'kg', step: '0.1', rr: true }) +
        f.num('Pasos', base + 'steps', lg.steps, { unit: '/ ' + num(T.steps), step: '100', rr: true }) +
        f.num('Sueño', base + 'sleepH', lg.sleepH, { unit: 'h', step: '0.25', rr: true }) +
        (A.dayKey(d) === 'dom' ? f.num('Cintura', 'measures.' + d + '.waist', (S.measures[d] || {}).waist, { unit: 'cm', step: '0.5', rr: true }) : '<div class="fld"><span>Cintura</span><small class="muted">Los domingos</small></div>') +
        '</div>' + f.scale('Calidad del sueño', base + 'sleepQ', lg.sleepQ) + f.scale('Energía', base + 'energy', lg.energy) + f.scale('Hambre', base + 'hunger', lg.hunger) + f.scale('Estrés', base + 'stress', lg.stress) +
        '<div class="fld"><span>Agua (vasos de 250 ml) · objetivo ' + waterTarget + '</span><div class="water"><button class="icon-btn" data-act="water" data-d="-1">−</button><div class="glasses">' + Array.from({ length: Math.max(waterTarget, lg.water || 0) }, (_, i) => '<i class="' + (i < (lg.water || 0) ? 'on' : '') + '"></i>').join('') + '</div><button class="icon-btn" data-act="water" data-d="1">+</button></div></div>' +
        f.text('Nota del día', base + 'note', lg.note, { ph: 'Qué ha ido bien / qué ha costado' }) + '</div>';

      // Entreno
      const wk = A.weekN(d); const ws = A.weekStats(Math.max(1, wk)); const nr = nextRoutine(); const runWeek = rw.run && dn >= 1;
      h += '<div class="card"><div class="card-h"><h3>' + A.icon('🏋️') + 'Entreno</h3><span class="pill">' + ws.gym + '/2 esta semana</span></div>';
      if (S.activeWorkout) h += '<a class="btn" href="#entreno/sesion">Continuar sesión ' + esc(S.activeWorkout.routine) + '</a>';
      else h += '<p class="muted">Siguiente: <b>' + esc(nr.name) + '</b> (' + esc(nr.duration) + ')</p><div class="row gap"><a class="btn" href="#entreno/sesion">Empezar sesión</a><a class="btn ghost" href="#entreno/guia">Sesión exprés</a></div>';
      if (runWeek) {
        const lv = P.runLevels.find((x) => x.lvl === S.run.level) || P.runLevels[0];
        h += '<div class="sub-card">' + A.icon('🏃') + (ws.run ? '<b>Carrera de la semana hecha ✓</b>' : '<b>Esta semana toca carrera</b><small>Nivel ' + lv.lvl + ': ' + esc(lv.name) + '</small><a class="btn sm" href="#carrera">Ir</a>') + '</div>';
      }
      h += '</div>';

      // Checklist diaria
      const checks = lg.checks || {}; const nC = P.dailyChecklist.filter((c) => checks[c.id]).length;
      h += '<div class="card"><div class="card-h"><h3>' + A.icon('✅') + 'Checklist diaria</h3><span class="pill">' + nC + '/' + P.dailyChecklist.length + '</span></div><div class="checks">' +
        P.dailyChecklist.map((c) => '<button class="checkrow ' + (checks[c.id] ? 'on' : '') + '" data-act="check" data-id="' + c.id + '"><i>' + (checks[c.id] ? '✓' : '') + '</i>' + esc(c.label) + '</button>').join('') + '</div></div>';

      // Semana
      if (dn >= 1) {
        const W = String(Math.min(17, w)); const wc = S.weekly[W] || {}; const nW = P.weeklyChecklist.filter((c) => wc[c.id]).length;
        h += '<div class="card"><div class="card-h"><h3>' + A.icon('📅') + 'Checklist de la semana ' + W + '</h3><span class="pill">' + nW + '/' + P.weeklyChecklist.length + '</span></div><div class="checks">' +
          P.weeklyChecklist.map((c) => '<button class="checkrow ' + (wc[c.id] ? 'on' : '') + '" data-act="wcheck" data-w="' + W + '" data-id="' + c.id + '"><i>' + (wc[c.id] ? '✓' : '') + '</i>' + esc(c.label) + '</button>').join('') + '</div>' +
          (A.dayKey(d) === 'dom' ? '<a class="btn" href="#progreso/revision">Hacer la revisión semanal</a>' : '') + '</div>';
      }

      // Regla del día
      const rule = P.rules[(Math.max(1, dn) - 1) % P.rules.length];
      h += '<div class="card"><div class="card-h"><h3>' + A.icon(rule.icon) + 'Regla del día · ' + esc(rule.title) + '</h3></div><ul class="ticks">' + rule.do.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><a class="link" href="#plan/reglas">Todas las reglas para situaciones difíciles ›</a></div>';
      return h;
    }
  };

  /* ===================== PLAN 120 ===================== */
  A.act.toggleWeek = (el) => { A.S.ui.openWeek = A.S.ui.openWeek === +el.dataset.w ? 0 : +el.dataset.w; A.save(); A.rerender(); };

  A.pages.plan = {
    render(sub) {
      sub = sub || 'ruta'; let h = '<h2 class="ptitle">' + 'Plan de 120 días</h2>';
      h += A.seg(sub, [['ruta', 'Hoja de ruta'], ['reglas', 'Situaciones'], ['habitos', 'Hábitos'], ['ajustes', 'Ajustes'], ['despues', 'Día 121+']], 'plan');
      const S = A.S; const sw = A.startWeight(); const curW = A.weekN();
      if (sub === 'ruta') {
        const pwNow = A.prepWeek(A.today());
        h += '<div class="card ' + (pwNow ? 'cur' : '') + '"><h3>Noviembre · mes de adaptación</h3><p class="muted small">Del 2 de noviembre al 6 de diciembre. Sin objetivo de peso: se trata de que el día 1 todo te salga de forma automática.</p>' + P.prepWeeks.map((w, i) => { const done = (S.prep || {})[i] || {}; const n = w.tasks.filter((_, j) => done[j]).length; return '<details' + (pwNow && pwNow.i === i ? ' open' : '') + '><summary><b>' + esc(w.name) + '</b> · desde el ' + A.fmtDate(w.from) + ' · ' + n + '/' + w.tasks.length + '</summary><div class="checks">' + w.tasks.map((t, j) => '<button class="checkrow ' + (done[j] ? 'on' : '') + '" data-act="prepCheck" data-w="' + i + '" data-i="' + j + '"><i>' + (done[j] ? '✓' : '') + '</i>' + esc(t) + '</button>').join('') + '</div></details>'; }).join('') + '</div>';
        h += '<div class="card"><h3>Fases</h3>' + P.phases.map((p) => '<div class="phase"><b>' + esc(p.name) + '</b><span class="pill">Sem. ' + p.weeks + '</span><p class="muted small">' + esc(p.goal) + '</p></div>').join('') + '</div>';
        h += '<div class="card"><h3>Objetivos de partida</h3><div class="kv"><span>Calorías</span><b>' + num(S.targets.kcalMin) + '–' + num(S.targets.kcalMax) + ' kcal (empieza en ' + num(S.targets.kcal) + ')</b><span>Proteína</span><b>' + S.targets.proteinMin + '–' + S.targets.proteinMax + ' g</b><span>Grasa</span><b>' + S.targets.fatMin + '–' + S.targets.fatMax + ' g</b><span>Carbohidratos</span><b>' + (S.targets.carbsMin || 190) + '–' + (S.targets.carbsMax || 250) + ' g</b><span>Fibra</span><b>≥ ' + S.targets.fiber + ' g</b><span>Agua</span><b>' + num(S.targets.water, 1) + '–3,5 L</b><span>Sueño</span><b>7–8 h</b><span>Gimnasio</span><b>2 sesiones/sem</b><span>Carrera</span><b>1 cada 2 semanas</b><span>Movilidad</span><b>1 sesión/sem + 5 min diarios</b></div></div>';
        h += P.roadmap.map((r) => {
          const [a, b] = A.weekRange(r.w); const open = S.ui.openWeek === r.w || (!S.ui.openWeek && r.w === curW); const cur = r.w === curW;
          const exp = sw ? num(sw * (1 - r.loss[1] / 100), 1) + '–' + num(sw * (1 - r.loss[0] / 100), 1) + ' kg' : '−' + num(r.loss[0], 1) + ' a −' + num(r.loss[1], 1) + ' %';
          const st = A.weekStats(r.w);
          return '<div class="card week ' + (cur ? 'cur' : '') + '"><div class="week-h" data-act="toggleWeek" data-w="' + r.w + '"><div><small>' + A.fmtDate(a) + ' – ' + A.fmtDate(b) + ' · ' + esc(r.phase) + '</small><b>Semana ' + r.w + (r.run ? ' · ' + A.icon('🏃') : '') + (r.review ? ' · ' + A.icon('🔎') : '') + '</b></div><span class="pill">' + exp + '</span></div>' +
            (open ? '<div class="week-b"><p>' + A.icon('🎯') + esc(r.focus) + '</p><div class="kv"><span>Calorías</span><b>' + esc(r.kcal) + '</b><span>Pasos</span><b>' + esc(r.steps) + '</b><span>Gimnasio</span><b>2 × full body · ' + esc(r.gymNote) + '</b><span>Carrera</span><b>' + (r.run ? 'Sí (sesión quincenal)' : 'No (opcional)') + '</b><span>Movilidad</span><b>1 sesión + meditación ' + medFor(r.w).min + ' min</b><span>Peso medio esperado</span><b>' + exp + '</b>' + (r.review ? '<span>Revisión</span><b>' + esc(r.review) + '</b>' : '') + '</div>' +
              (st.avgW ? '<div class="sub-card">Tu media real: <b>' + num(st.avgW, 1) + ' kg</b> · cumplimiento ' + (st.adherence != null ? Math.round(st.adherence * 100) + ' %' : '–') + ' · gimnasio ' + st.gym + '/2</div>' : '') + '</div>' : '') + '</div>';
        }).join('');
        h += '<p class="muted small center">Los rangos de peso son orientativos (0,4–0,7 % por semana), no una promesa. Lo que manda es la tendencia de varias semanas.</p>';
      } else if (sub === 'reglas') {
        h += '<p class="muted">Reglas "si pasa esto → hago esto". Decididas en frío para no improvisar en caliente.</p>';
        h += P.rules.map((r) => '<div class="card"><div class="card-h"><h3>' + A.icon(r.icon) + esc(r.title) + '</h3></div><p class="muted small">' + esc(r.when) + '</p><ul class="ticks">' + r.do.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>').join('');
      } else if (sub === 'habitos') {
        h += '<div class="card"><h3>Checklist diaria</h3><ul class="ticks">' + P.dailyChecklist.map((c) => '<li>' + esc(c.label) + '</li>').join('') + '</ul></div>';
        h += '<div class="card"><h3>Checklist semanal</h3><ul class="ticks">' + P.weeklyChecklist.map((c) => '<li>' + esc(c.label) + '</li>').join('') + '</ul></div>';
        h += '<div class="card"><h3>Horario tipo entre semana</h3><div class="kv">' + [['06:00–06:30', 'Despertar · 500 ml de agua · peso'], ['06:45', 'Desayuno preparado la noche anterior'], ['10:30', 'Snack proteico'], ['13:45–14:20', 'Almuerzo de táper'], ['15:00', 'Salida del trabajo: bájate una parada antes o camina 10–15 min'], ['15:30–16:30', 'Siesta ≤ 20 min (opcional) → paseo de 10 min'], ['17:00', 'Merienda / pre-entreno (60–90 min antes del gimnasio)'], ['18:00–19:15', 'Gimnasio (2 días) · paseo o recados (resto)'], ['20:30–21:00', 'Cena'], ['21:30', 'Desayuno y táper de mañana listos'], ['22:30', 'Pantallas fuera · respiración 4–7–8'], ['22:45–23:00', 'A la cama (7–7,5 h de sueño)']].map((x) => '<span>' + x[0] + '</span><b>' + esc(x[1]) + '</b>').join('') + '</div><p class="muted small">Las horas se ajustan en Dieta → Objetivos.</p></div>';
        h += '<div class="card"><h3>Sueño</h3><ul class="ticks"><li>Objetivo 7–7,5 h: si te levantas a las 6:15, apaga la luz a las 22:45–23:00.</li><li>Café como muy tarde a las 15:00.</li><li>Siesta de 20 min antes de las 17:00, o ninguna.</li><li>Habitación fresca y a oscuras, el móvil fuera de la mesilla.</li><li>Rutina de 15 min: desayuno listo → ducha o lectura → 4–7–8 en la cama.</li></ul></div>';
        h += '<div class="card"><h3>Hidratación</h3><ul class="ticks"><li>2,5–3,5 L al día (más en días de calor, playa o entreno).</li><li>500 ml al despertar y una botella de 1 L en el trabajo, rellenada una vez.</li><li>Orina de color amarillo pálido = vas bien.</li><li>Refrescos: zero. Zumo: 1 vaso como capricho, no como bebida.</li><li>Agua con gas y limón o infusiones frías para la tarde de sofá.</li></ul></div>';
        h += '<div class="card"><h3>Hambre y antojos</h3><ul class="ticks"><li>Proteína en cada toma (20–45 g): es lo que más sacia.</li><li>Volumen: verdura doble, fruta entera, sopas y gazpacho, papas cocidas.</li><li>Come sentado y sin pantalla al menos una comida al día.</li><li>Antojo → 10 min + agua → si sigue, capricho pactado en plato.</li><li>Los dulces, fuera de la vista: armario propio para los de Nati.</li></ul></div>';
        h += '<div class="card"><h3>Pasos diarios</h3><ul class="ticks"><li>Semana 1: solo mide (iPhone → Salud). Después, +1.000 cada 2 semanas hasta 9–10k.</li><li>Bájate del tranvía una parada antes, o deja la moto 10 min más lejos.</li><li>Levántate cada hora en la oficina (ya lo haces): 2 min andando, no solo de pie.</li><li>Paseo de 10 min después de comer o de la siesta.</li><li>Recados a pie; llamadas de teléfono caminando.</li></ul></div>';
      } else if (sub === 'ajustes') {
        h += '<div class="card"><h3>Cómo ajustar las calorías</h3><ul class="ticks">' + P.adjustRules.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
        h += '<div class="card"><h3>Pérdida real de grasa vs. agua</h3><ul class="ticks"><li>El peso diario puede variar 0,5–2 kg por agua, sal, carbohidratos (glucógeno), contenido intestinal, sueño y agujetas.</li><li>Grasa: 1 kg ≈ 7.000–7.700 kcal. Con ~500 kcal de déficit, ≈0,5 kg por semana. Una bajada de 1,5 kg en dos días NO es grasa.</li><li>Señales de pérdida real: la media semanal baja 2–3 semanas seguidas, la cintura baja, la ropa queda mejor y la fuerza se mantiene.</li><li>Señales de agua: subida tras una comida salada o fuera, tras una sesión de pierna, tras dormir mal o los días con más carbohidratos.</li><li>Por eso: media de 7 días, comparación semana contra semana y decisiones cada 2 semanas.</li></ul></div>';
        h += '<div class="card"><h3>Revisiones mensuales</h3><ul class="ticks"><li><b>Día 30 (5 ene):</b> balance de las 2 semanas de déficit y de la Navidad (¿has mantenido?). Vuelta al objetivo de calorías.</li><li><b>Día 60 (4 feb):</b> tendencia de enero, cintura, fotos, fuerza y pasos. Ajuste de calorías si toca y plan de Carnaval.</li><li><b>Día 90 (6 mar):</b> ajuste fino y plan de Semana Santa.</li><li><b>Día 120 (5 abr):</b> mediciones completas, bioimpedancia en el mismo aparato y plan de mantenimiento.</li></ul></div>';
      } else {
        h += '<div class="card"><h3>Después del día 120</h3><ul class="ticks"><li><b>Transición (2–4 semanas):</b> sube 150–200 kcal por semana hasta que la media semanal se estabilice (tu mantenimiento real; probablemente 2.400–2.700 kcal).</li><li><b>Mantener 6–8 semanas</b> antes de otro bloque de déficit, si quieres seguir bajando. El cuerpo y la cabeza lo agradecen.</li><li><b>Hábitos que se quedan:</b> desayuno preparado, proteína en cada comida, 8–10k pasos, 2 días de fuerza, capricho pactado, reglas para comer fuera.</li><li><b>Alarma de mantenimiento:</b> si la media semanal sube más de 2 kg sobre tu peso objetivo durante 2 semanas, vuelves 2–3 semanas al plan de déficit. Sin dramas: es el termostato.</li><li><b>Pesarte</b> al menos 3 días por semana para siempre: lo que no se mide, se escapa (tu historial lo demuestra: las subidas llegan cuando dejas de pesarte).</li><li><b>Revisión trimestral:</b> cintura, fotos y fuerza.</li></ul></div>';
      }
      return h;
    }
  };
  function medFor(w) { return w <= 4 ? P.meditation[0] : w <= 8 ? P.meditation[1] : w <= 12 ? P.meditation[2] : P.meditation[3]; }
  A.medFor = medFor;
})();
