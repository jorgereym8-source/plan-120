/* Plan 120 · Entreno, Carrera y Bienestar */
(function () {
  'use strict';
  const P = window.PLAN, A = window.App, esc = A.esc, num = A.num;

  /* ================= utilidades de fuerza ================= */
  const e1rm = (w, r) => (w && r ? w * (1 + r / 30) : 0);
  function exDef(id) { for (const r of A.S.routines) { const e = r.exercises.find((x) => x.id === id); if (e) return e; } return null; }
  function lastSets(exId, beforeId) {
    for (let i = A.S.workouts.length - 1; i >= 0; i--) { const w = A.S.workouts[i]; if (w.id === beforeId) continue; const s = w.ex && w.ex[exId]; if (s && s.some((x) => x.done && x.w)) return { date: w.date, sets: s.filter((x) => x.done) }; }
    return null;
  }
  function suggest(ex) {
    const last = lastSets(ex.id); if (!last) return { w: null, r: ex.repMin, why: 'Primera vez: elige un peso con el que hagas ' + ex.repMax + ' reps dejando ' + (ex.rir + 2) + ' en reserva.' };
    const ws = last.sets.map((s) => +s.w || 0); const top = Math.max(...ws); const topSets = last.sets.filter((s) => +s.w === top);
    const allMax = topSets.length >= ex.sets && topSets.every((s) => +s.r >= ex.repMax);
    if (allMax && ex.inc) return { w: +(top + ex.inc).toFixed(2), r: ex.repMin, why: 'Completaste ' + ex.sets + '×' + ex.repMax + ': sube ' + ex.inc + ' kg.' };
    const best = Math.max(...topSets.map((s) => +s.r || 0));
    return { w: top, r: Math.min(ex.repMax, best + 1), why: 'Mismo peso: intenta +1 repetición en alguna serie.' };
  }
  A.suggest = suggest;

  A.act.startWorkout = (el) => {
    const r = A.S.routines.find((x) => x.id === el.dataset.r); if (!r) return;
    const ex = {}; r.exercises.forEach((e) => { const s = suggest(e); ex[e.id] = Array.from({ length: e.sets }, () => ({ w: s.w, r: '', done: false })); });
    A.S.activeWorkout = { id: 'w' + A.uid(), routine: r.id, date: A.today(), start: Date.now(), ex, note: '' }; A.save(); A.rerender();
  };
  A.act.setVal = (el) => { const aw = A.S.activeWorkout; const s = aw.ex[el.dataset.ex][+el.dataset.i]; s[el.dataset.k] = el.value === '' ? '' : +String(el.value).replace(',', '.'); A.save(); };
  A.act.setDone = (el) => {
    const aw = A.S.activeWorkout; const s = aw.ex[el.dataset.ex][+el.dataset.i]; s.done = !s.done; A.haptic(20); A.save();
    if (s.done && A.S.settings.autoRest) { const e = exDef(el.dataset.ex); A.restTimer.start((e && e.rest) || 90); }
    el.classList.toggle('on', s.done); el.textContent = s.done ? '✓' : ''; el.closest('.setrow').classList.toggle('done', s.done);
  };
  A.act.addSet = (el) => { const arr = A.S.activeWorkout.ex[el.dataset.ex]; const l = arr[arr.length - 1] || {}; arr.push({ w: l.w || '', r: '', done: false }); A.save(); A.rerender(); };
  A.act.delSet = (el) => { const arr = A.S.activeWorkout.ex[el.dataset.ex]; if (arr.length > 1) arr.pop(); A.save(); A.rerender(); };
  A.act.awNote = (el) => { A.S.activeWorkout.note = el.value; A.save(); };
  A.act.finishWorkout = () => {
    const aw = A.S.activeWorkout; if (!aw) return;
    const anyDone = Object.values(aw.ex).some((a) => a.some((s) => s.done));
    if (!anyDone && !A.confirm('No has marcado ninguna serie como hecha. ¿Guardar igualmente?')) return;
    aw.min = Math.round((Date.now() - aw.start) / 60000);
    const prs = []; Object.keys(aw.ex).forEach((id) => { const best = Math.max(0, ...aw.ex[id].filter((s) => s.done).map((s) => e1rm(+s.w, +s.r))); const prev = Math.max(0, ...A.S.workouts.map((w) => Math.max(0, ...((w.ex && w.ex[id]) || []).filter((s) => s.done).map((s) => e1rm(+s.w, +s.r))))); if (best > prev && prev > 0) { const e = exDef(id); prs.push(e ? e.name : id); } });
    A.S.workouts.push(aw); A.S.activeWorkout = null; A.restTimer.stop();
    const lg = A.log(aw.date); lg.checks = lg.checks || {};
    A.save(true); A.rerender(); A.toast(prs.length ? '🏆 Récord estimado en: ' + prs.join(', ') : 'Sesión guardada (' + aw.min + ' min). ¡Bien!', 3500);
  };
  A.act.cancelWorkout = () => { if (A.confirm('¿Descartar la sesión en curso?')) { A.S.activeWorkout = null; A.restTimer.stop(); A.save(); A.rerender(); } };
  A.act.exInfo = (el) => { const e = exDef(el.dataset.ex); if (!e) return; A.modal('<p><b>Técnica:</b> ' + esc(e.cue) + '</p><p><b>Alternativas:</b> ' + esc(e.alt) + '</p><p class="muted small">' + e.sets + ' series · ' + e.repMin + '–' + e.repMax + ' reps · RIR ' + e.rir + ' · descanso ' + A.mmss(e.rest) + ' · incremento ' + e.inc + ' kg</p>', { title: e.name }); };
  A.act.delWorkout = (el) => { if (!A.confirm('¿Eliminar esta sesión del historial?')) return; A.S.workouts = A.S.workouts.filter((w) => w.id !== el.dataset.id); A.save(); A.rerender(); };
  A.act.histEx = (el) => { A.S.ui.histEx = el.value; A.save(); A.rerender(); };
  A.act.manualWorkout = () => { A.S.workouts.push({ id: 'w' + A.uid(), routine: 'libre', date: A.today(), ex: {}, min: 60, note: 'Registrada sin detalle' }); A.save(); A.rerender(); A.toast('Sesión contada'); };

  /* edición de rutinas */
  A.act.exField = (el) => { const r = A.S.routines.find((x) => x.id === el.dataset.r); const e = r.exercises[+el.dataset.i]; const k = el.dataset.f; e[k] = ['name', 'cue', 'alt'].includes(k) ? el.value : +String(el.value).replace(',', '.'); A.save(); };
  A.act.exMove = (el) => { const r = A.S.routines.find((x) => x.id === el.dataset.r); const i = +el.dataset.i, j = i + (+el.dataset.d); if (j < 0 || j >= r.exercises.length) return; const t = r.exercises[i]; r.exercises[i] = r.exercises[j]; r.exercises[j] = t; A.save(); A.rerender(); };
  A.act.exDel = (el) => { const r = A.S.routines.find((x) => x.id === el.dataset.r); if (!A.confirm('¿Quitar ejercicio?')) return; r.exercises.splice(+el.dataset.i, 1); A.save(); A.rerender(); };
  A.act.exAdd = (el) => { const r = A.S.routines.find((x) => x.id === el.dataset.r); r.exercises.push({ id: 'x' + A.uid(), name: 'Nuevo ejercicio', sets: 3, repMin: 8, repMax: 12, rir: 2, rest: 90, inc: 2.5, alt: '', cue: '' }); A.save(); A.rerender(); };
  A.act.rtName = (el) => { const r = A.S.routines.find((x) => x.id === el.dataset.r); r.name = el.value; A.save(); };
  A.act.rtAdd = () => { const used = A.S.routines.map((r) => r.id); const id = 'CDEFGH'.split('').find((c) => !used.includes(c)) || 'R' + A.uid(); A.S.routines.push({ id, name: 'Rutina ' + id, duration: '60 min', exercises: [] }); A.save(); A.rerender(); };
  A.act.rtDel = (el) => { if (!A.confirm('¿Eliminar la rutina?')) return; A.S.routines = A.S.routines.filter((r) => r.id !== el.dataset.r); A.save(); A.rerender(); };
  A.act.rtReset = () => { if (A.confirm('¿Restaurar las rutinas A y B originales? Se pierden tus cambios en ejercicios.')) { A.S.routines = A.clone(P.routines); A.save(); A.rerender(); } };

  A.pages.entreno = {
    render(sub) {
      sub = sub || 'sesion'; const S = A.S; let h = '<h2 class="ptitle">' + A.icon('🏋️') + 'Entreno de fuerza</h2>';
      h += A.seg(sub, [['sesion', 'Sesión'], ['rutinas', 'Rutinas'], ['historial', 'Historial'], ['guia', 'Guía']], 'entreno');
      if (sub === 'sesion') {
        const aw = S.activeWorkout;
        if (!aw) {
          const nr = A.nextRoutine(); const ws = A.weekStats(Math.max(1, A.weekN()));
          h += '<div class="card"><div class="card-h"><h3>Esta semana</h3><span class="pill">' + ws.gym + '/2 sesiones</span></div><p class="muted">2 sesiones de cuerpo completo cualquier tarde, idealmente con 48 h entre ellas (lun–jue, mar–vie, mié–sáb…). Te toca la <b>' + esc(nr.id) + '</b>.</p></div>';
          h += S.routines.map((r) => '<div class="card ' + (r.id === nr.id ? 'cur' : '') + '"><div class="card-h"><h3>' + esc(r.name) + '</h3><span class="pill">' + esc(r.duration || '') + '</span></div><ol class="exlist">' + r.exercises.map((e) => { const s = suggest(e); return '<li><b>' + esc(e.name) + '</b><small>' + e.sets + ' × ' + e.repMin + '–' + e.repMax + ' · RIR ' + e.rir + ' · ' + A.mmss(e.rest) + (s.w ? ' · próximo: ' + s.w + ' kg × ' + s.r : '') + '</small></li>'; }).join('') + '</ol><button class="btn" data-act="startWorkout" data-r="' + r.id + '">Empezar ' + esc(r.id) + '</button></div>').join('');
          h += '<div class="card"><h3>' + esc(P.expressSession.name) + '</h3><ul class="ticks">' + P.expressSession.items.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><p class="muted small">' + esc(P.expressSession.note) + '</p><button class="btn ghost sm" data-act="manualWorkout">Contar como sesión hecha</button></div>';
        } else {
          const r = S.routines.find((x) => x.id === aw.routine) || { name: aw.routine, exercises: [] };
          const mins = Math.round((Date.now() - aw.start) / 60000);
          h += '<div class="card hero"><div class="kicker">Sesión en curso · ' + mins + ' min</div><h1>' + esc(r.name) + '</h1><details><summary>Calentamiento (8–10 min)</summary><ul class="ticks">' + P.warmup.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></details></div>';
          h += r.exercises.map((e) => {
            const sets = aw.ex[e.id] || []; const last = lastSets(e.id, aw.id); const sg = suggest(e);
            return '<div class="card ex"><div class="card-h"><h3>' + esc(e.name) + '</h3><button class="icon-btn sm" data-act="exInfo" data-ex="' + e.id + '">i</button></div><p class="muted small">' + e.sets + ' × ' + e.repMin + '–' + e.repMax + ' reps · RIR ' + e.rir + ' · descanso ' + A.mmss(e.rest) + '</p>' +
              (last ? '<p class="small">Última (' + A.fmtDate(last.date) + '): ' + last.sets.map((s) => (s.w || 0) + '×' + (s.r || 0)).join(' · ') + '</p>' : '') + '<p class="small hint">' + esc(sg.why) + '</p>' +
              '<div class="sets"><div class="setrow head"><span>#</span><span>kg</span><span>reps</span><span></span></div>' + sets.map((s, i) => '<div class="setrow ' + (s.done ? 'done' : '') + '"><span>' + (i + 1) + '</span><input type="number" inputmode="decimal" step="0.5" value="' + (s.w == null ? '' : s.w) + '" data-live data-on="setVal" data-ex="' + e.id + '" data-i="' + i + '" data-k="w"><input type="number" inputmode="numeric" placeholder="' + e.repMin + '–' + e.repMax + '" value="' + (s.r == null ? '' : s.r) + '" data-live data-on="setVal" data-ex="' + e.id + '" data-i="' + i + '" data-k="r"><button class="chk ' + (s.done ? 'on' : '') + '" data-act="setDone" data-ex="' + e.id + '" data-i="' + i + '">' + (s.done ? '✓' : '') + '</button></div>').join('') + '</div>' +
              '<div class="row gap"><button class="chip" data-act="addSet" data-ex="' + e.id + '">+ serie</button><button class="chip" data-act="delSet" data-ex="' + e.id + '">− serie</button></div></div>';
          }).join('');
          h += '<div class="card"><label class="fld"><span>Notas de la sesión</span><textarea rows="2" data-on="awNote">' + esc(aw.note || '') + '</textarea></label><div class="row gap"><button class="btn" data-act="finishWorkout">Terminar y guardar</button><button class="btn ghost" data-act="cancelWorkout">Descartar</button></div></div>';
        }
      } else if (sub === 'rutinas') {
        h += '<p class="muted small">Todo editable: nombre, series, rango de reps, RIR, descanso (s) e incremento de carga (kg). Los cambios se aplican a las próximas sesiones.</p>';
        h += S.routines.map((r) => '<div class="card"><div class="card-h"><input class="h3in" value="' + esc(r.name) + '" data-on="rtName" data-r="' + r.id + '"><button class="icon-btn sm" data-act="rtDel" data-r="' + r.id + '">🗑</button></div>' +
          r.exercises.map((e, i) => '<div class="exedit"><div class="row"><input class="grow" value="' + esc(e.name) + '" data-on="exField" data-r="' + r.id + '" data-i="' + i + '" data-f="name"><button class="icon-btn sm" data-act="exMove" data-r="' + r.id + '" data-i="' + i + '" data-d="-1">↑</button><button class="icon-btn sm" data-act="exMove" data-r="' + r.id + '" data-i="' + i + '" data-d="1">↓</button><button class="icon-btn sm" data-act="exDel" data-r="' + r.id + '" data-i="' + i + '">✕</button></div><div class="exnums">' +
            [['sets', 'Series'], ['repMin', 'Reps mín'], ['repMax', 'Reps máx'], ['rir', 'RIR'], ['rest', 'Desc. (s)'], ['inc', '+kg']].map((x) => '<label><small>' + x[1] + '</small><input type="number" inputmode="decimal" value="' + e[x[0]] + '" data-on="exField" data-r="' + r.id + '" data-i="' + i + '" data-f="' + x[0] + '"></label>').join('') + '</div>' +
            '<details><summary class="small">Técnica y alternativas</summary><label class="fld"><span>Técnica</span><input value="' + esc(e.cue) + '" data-on="exField" data-r="' + r.id + '" data-i="' + i + '" data-f="cue"></label><label class="fld"><span>Alternativas</span><input value="' + esc(e.alt) + '" data-on="exField" data-r="' + r.id + '" data-i="' + i + '" data-f="alt"></label></details></div>').join('') +
          '<button class="btn ghost sm" data-act="exAdd" data-r="' + r.id + '">+ Ejercicio</button></div>').join('');
        h += '<div class="row gap"><button class="btn ghost" data-act="rtAdd">+ Nueva rutina</button><button class="btn ghost" data-act="rtReset">Restaurar A/B</button></div>';
      } else if (sub === 'historial') {
        const allEx = []; S.routines.forEach((r) => r.exercises.forEach((e) => allEx.push(e)));
        const sel = S.ui.histEx || (allEx[0] && allEx[0].id);
        const pts = S.workouts.filter((w) => w.ex && w.ex[sel]).map((w) => [A.parseISO(w.date).getTime(), Math.max(0, ...w.ex[sel].filter((s) => s.done).map((s) => e1rm(+s.w, +s.r)))]).filter((p) => p[1] > 0);
        h += '<div class="card"><h3>Fuerza estimada (1RM, fórmula de Epley)</h3><select data-on="histEx">' + allEx.map((e) => '<option value="' + e.id + '"' + (e.id === sel ? ' selected' : '') + '>' + esc(e.name) + '</option>').join('') + '</select>' + A.chart({ series: [{ points: pts, dots: true, r: 3.5, opacity: 1 }], xFmt: (x) => { const d = new Date(x); return d.getDate() + '/' + (d.getMonth() + 1); }, yFmt: (y) => y.toFixed(0) }) + '<p class="muted small">En déficit, mantener esta línea plana ya es una victoria: significa que conservas músculo.</p></div>';
        const wk = {}; S.workouts.forEach((w) => { const n = A.weekN(w.date); wk[n] = (wk[n] || 0) + 1; });
        h += '<div class="card"><h3>Sesiones por semana</h3><div class="bars">' + P.roadmap.map((r) => '<div title="Semana ' + r.w + '"><i style="height:' + Math.min(100, (wk[r.w] || 0) / 2 * 100) + '%" class="' + ((wk[r.w] || 0) >= 2 ? 'ok' : '') + '"></i><small>' + r.w + '</small></div>').join('') + '</div></div>';
        h += '<div class="card"><h3>Sesiones</h3>' + (S.workouts.slice().reverse().map((w) => { const vol = Object.values(w.ex || {}).reduce((s, a) => s + a.filter((x) => x.done).reduce((t, x) => t + (+x.w || 0) * (+x.r || 0), 0), 0); return '<details class="hist"><summary><b>' + A.fmtDate(w.date, true) + '</b> · ' + esc(w.routine) + ' · ' + (w.min || '–') + ' min · ' + num(vol) + ' kg de volumen</summary>' + Object.keys(w.ex || {}).map((id) => { const e = exDef(id); return '<p class="small"><b>' + esc(e ? e.name : id) + ':</b> ' + w.ex[id].filter((s) => s.done).map((s) => s.w + '×' + s.r).join(' · ') + '</p>'; }).join('') + (w.note ? '<p class="small muted">' + esc(w.note) + '</p>' : '') + '<button class="btn danger sm" data-act="delWorkout" data-id="' + w.id + '">Eliminar</button></details>'; }).join('') || '<p class="muted">Aún no hay sesiones.</p>') + '</div>';
      } else {
        h += '<div class="card"><h3>Calentamiento</h3><ol class="ticks">' + P.warmup.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol></div>';
        h += '<div class="card"><h3>Reglas de progresión</h3><ul class="ticks">' + P.trainingRules.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
        h += '<div class="card"><h3>' + esc(P.expressSession.name) + '</h3><ul class="ticks">' + P.expressSession.items.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><p class="muted small">' + esc(P.expressSession.note) + '</p></div>';
        h += '<div class="card"><h3>Cardio: dónde encaja</h3><ul class="ticks"><li><b>Base:</b> pasos diarios (lo que más energía mueve sin restar recuperación).</li><li><b>Calidad:</b> 1 sesión de carrera cada 2 semanas (pestaña Carrera).</li><li><b>Extra opcional:</b> 10–15 min de cinta inclinada (8–12 %, 5 km/h) al final de la sesión de fuerza.</li><li><b>Fines de semana:</b> sendero, playa o paseo largo. Cuenta, y mucho.</li></ul></div>';
      }
      return h;
    }
  };

  /* ================= temporizador modal genérico ================= */
  let seq = null;
  A.timerModal = function (title, phases, opts) {
    opts = opts || {};
    if (seq) seq.stop();
    A.modal('<div class="timer ' + (opts.breath ? 'breath' : '') + '"><div class="t-phase" id="tPh"></div><div class="t-sub" id="tSub"></div>' + (opts.breath ? '<div class="bcircle"><div id="bC"></div></div>' : '') + '<div class="t-time" id="tTm"></div><div class="t-next" id="tNx"></div><div class="pbar-t"><div id="tBar"></div></div><div class="t-tot" id="tTot"></div>' +
      '<div class="t-ctl"><button class="icon-btn lg" data-act="tBack">⏮</button><button class="icon-btn xl" data-act="tToggle" id="tPlay">▶</button><button class="icon-btn lg" data-act="tSkip">⏭</button></div>' + (opts.extra || '') + '</div>', { title, full: true, onClose: () => { if (seq) { seq.stop(); seq = null; } } });
    seq = A.Sequencer(phases, tick, () => { A.wake(false); const b = document.getElementById('tPlay'); if (b) b.textContent = '✓'; if (opts.onDone) opts.onDone(); });
    function tick(s) {
      const ph = phases[s.i] || phases[phases.length - 1]; const g = (id) => document.getElementById(id); if (!g('tPh')) return;
      g('tPh').textContent = ph.label; g('tPh').className = 't-phase ' + (ph.work ? 'is-work' : 'is-rest');
      g('tSub').textContent = ph.sub || ''; g('tTm').textContent = A.mmss(s.left);
      const nx = phases[s.i + 1]; g('tNx').textContent = nx ? 'Después: ' + nx.label + ' · ' + A.mmss(nx.dur) : 'Último tramo';
      g('tBar').style.width = (100 * s.elapsed() / s.total()) + '%'; g('tTot').textContent = A.mmss(s.elapsed()) + ' / ' + A.mmss(s.total());
      g('tPlay').textContent = s.running ? '⏸' : '▶';
      if (opts.breath && g('bC')) { const p = 1 - s.left / ph.dur; const lab = ph.label.toLowerCase(); let sc = 0.55; if (lab.startsWith('inhala')) sc = 0.55 + 0.45 * p; else if (lab.startsWith('exhala')) sc = 1 - 0.45 * p; else sc = ph.hold === 'top' ? 1 : 0.55; g('bC').style.transform = 'scale(' + sc.toFixed(3) + ')'; }
    }
    tick(seq);
    return seq;
  };
  A.act.tToggle = () => seq && seq.toggle();
  A.act.tSkip = () => seq && seq.skip();
  A.act.tBack = () => seq && seq.back();

  /* ================= CARRERA ================= */
  function runPhases(lv) {
    const ph = [{ label: 'Calentamiento', sub: 'Camina rápido y termina con trote muy suave', dur: lv.warm * 60 }];
    lv.blocks.forEach((b, bi) => { for (let i = 0; i < b.reps; i++) { ph.push({ label: b.workT, sub: (b.reps > 1 ? 'Repetición ' + (i + 1) + ' de ' + b.reps : '') + (lv.blocks.length > 1 ? ' · bloque ' + (bi + 1) : ''), dur: b.work, work: true }); if (b.rest && i < b.reps - 1) ph.push({ label: b.restT, sub: 'Recupera', dur: b.rest }); } if (bi < lv.blocks.length - 1) ph.push({ label: 'Transición', sub: 'Trote suave', dur: 90 }); });
    ph.push({ label: 'Vuelta a la calma', sub: 'Caminar y respirar', dur: lv.cool * 60 });
    return ph;
  }
  const lvDur = (lv) => Math.round(runPhases(lv).reduce((s, p) => s + p.dur, 0) / 60);
  A.act.runStart = () => { const lv = P.runLevels.find((x) => x.lvl === A.S.run.level) || P.runLevels[0]; A.timerModal('Carrera · nivel ' + lv.lvl, runPhases(lv), { onDone: () => setTimeout(() => A.act.runFeedback(), 900) }); };
  A.act.runFeedback = () => {
    const lv = A.S.run.level; A.S.ui.fb = { rpe: null, feel: '', pain: 'no' };
    const b = (k, v, l) => '<button class="chip" data-act="fbSet" data-k="' + k + '" data-v="' + v + '">' + l + '</button>';
    A.modal('<p class="muted">Nivel ' + lv + '. Tu valoración decide el siguiente nivel.</p><div class="fld"><span>¿Qué tan dura fue la sesión en conjunto? (1–10)</span><div class="scale ten" id="fbR">' + Array.from({ length: 10 }, (_, i) => b('rpe', i + 1, i + 1)).join('') + '</div></div>' +
      '<div class="fld"><span>Sensación</span><div class="chips" id="fbF">' + [['facil', 'Fácil'], ['bien', 'Bien'], ['justo', 'Justo'], ['duro', 'Muy duro'], ['nofin', 'No terminé']].map((x) => b('feel', x[0], x[1])).join('') + '</div></div>' +
      '<div class="fld"><span>¿Molestias?</span><div class="chips" id="fbP">' + [['no', 'Ninguna'], ['leve', 'Leve, no cambia la zancada'], ['si', 'Sí, me hizo cambiar la forma de correr']].map((x) => b('pain', x[0], x[1])).join('') + '</div></div>' +
      '<div class="grid2"><label class="fld"><span>Distancia (km)</span><input id="fbD" type="number" inputmode="decimal" step="0.01"></label><label class="fld"><span>Tiempo total (min)</span><input id="fbT" type="number" inputmode="decimal"></label><label class="fld"><span>FC media (opcional)</span><input id="fbH" type="number" inputmode="numeric"></label><label class="fld"><span>Fecha</span><input id="fbDate" type="date" value="' + A.today() + '"></label></div><label class="fld"><span>Notas</span><input id="fbN" placeholder="Ruta, calor, zapatillas…"></label><button class="btn" data-act="fbSave">Guardar y calcular siguiente nivel</button>', { title: '¿Cómo ha ido?' });
  };
  A.act.fbSet = (el) => { A.S.ui.fb[el.dataset.k] = el.dataset.k === 'rpe' ? +el.dataset.v : el.dataset.v; el.parentNode.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === el)); };
  A.act.fbSave = () => {
    const fb = A.S.ui.fb || {}; if (!fb.rpe) return A.toast('Marca la dureza (1–10)');
    const lv = A.S.run.level; let d = 0, why = '';
    if (fb.pain === 'si') { d = -1; why = 'Molestia que cambia la zancada: bajas 1 nivel y descansas de correr hasta que desaparezca.'; }
    else if (fb.feel === 'nofin' || fb.rpe >= 10) { d = -1; why = 'Sesión al límite: bajas 1 nivel para consolidar.'; }
    else if (fb.rpe === 9) { d = 0; why = 'Muy exigente: repites el nivel.'; }
    else if (fb.rpe >= 7) { d = 1; why = 'Esfuerzo adecuado: subes 1 nivel.'; }
    else { d = 2; why = 'Te ha resultado fácil: subes 2 niveles.'; }
    if (fb.pain === 'leve' && d > 1) { d = 1; why += ' (Molestia leve: limitado a +1.)'; }
    const max = P.runLevels[P.runLevels.length - 1].lvl; const nl = A.clamp(lv + d, 0, max);
    const g = (id) => document.getElementById(id).value;
    A.S.run.sessions.push({ id: 'r' + A.uid(), date: g('fbDate') || A.today(), lvl: lv, rpe: fb.rpe, feel: fb.feel, pain: fb.pain, dist: +g('fbD') || null, time: +g('fbT') || null, hr: +g('fbH') || null, note: g('fbN'), next: nl, why });
    A.S.run.level = nl; A.save(true); A.closeModal(); A.rerender();
    A.modal('<p>' + esc(why) + '</p><p>Próxima sesión: <b>nivel ' + nl + ' · ' + esc((P.runLevels.find((x) => x.lvl === nl) || {}).name) + '</b></p>', { title: 'Sesión guardada' });
  };
  A.act.setLevel = (el) => { if (!A.confirm('¿Fijar el nivel ' + el.dataset.l + ' como actual?')) return; A.S.run.level = +el.dataset.l; A.save(); A.rerender(); };
  A.act.delRun = (el) => { if (!A.confirm('¿Eliminar este registro?')) return; A.S.run.sessions = A.S.run.sessions.filter((x) => x.id !== el.dataset.id); A.save(); A.rerender(); };

  A.pages.carrera = {
    render(sub) {
      sub = sub || 'hoy'; const S = A.S; const lv = P.runLevels.find((x) => x.lvl === S.run.level) || P.runLevels[0]; let h = '<h2 class="ptitle">' + A.icon('🏃') + 'Carrera</h2>';
      h += A.seg(sub, [['hoy', 'Próxima'], ['niveles', 'Niveles'], ['historial', 'Historial'], ['guia', 'Guía']], 'carrera');
      if (sub === 'hoy') {
        const ph = runPhases(lv);
        h += '<div class="card hero"><div class="kicker">Nivel ' + lv.lvl + ' de ' + P.runLevels[P.runLevels.length - 1].lvl + ' · ≈ ' + lvDur(lv) + ' min</div><h1>' + esc(lv.name) + '</h1>' + (lv.note ? '<p class="small">' + esc(lv.note) + '</p>' : '') +
          '<ol class="ticks small"><li>Calentamiento ' + lv.warm + ' min</li>' + lv.blocks.map((b) => '<li>' + b.reps + ' × ' + A.mmss(b.work) + ' ' + esc(b.workT) + (b.rest ? ' / ' + A.mmss(b.rest) + ' ' + esc(b.restT) : '') + '</li>').join('') + '<li>Vuelta a la calma ' + lv.cool + ' min</li></ol>' +
          '<div class="row gap"><button class="btn" data-act="runStart">▶ Iniciar con temporizador</button><button class="btn ghost" data-act="runFeedback">Registrar sin temporizador</button></div><p class="muted small">' + ph.length + ' tramos con avisos sonoros y vibración. Deja la pantalla encendida.</p></div>';
        h += '<div class="card"><h3>Calendario (semanas pares)</h3>' + P.roadmap.filter((r) => r.run).map((r) => { const [a, b] = A.weekRange(r.w); const done = S.run.sessions.some((x) => x.date >= a && x.date <= b); const cur = A.weekN() === r.w; return '<div class="row cal ' + (cur ? 'cur' : '') + '"><span>Semana ' + r.w + '</span><small class="muted">' + A.fmtDate(a) + ' – ' + A.fmtDate(b) + '</small><b>' + (done ? '✓ hecha' : cur ? 'esta semana' : '') + '</b></div>'; }).join('') + '<p class="muted small">Si te apetece correr más, hazlo: la progresión es por sesión.</p></div>';
      } else if (sub === 'niveles') {
        h += P.runLevels.map((l) => '<div class="card lvl ' + (l.lvl === S.run.level ? 'cur' : '') + '" data-act="setLevel" data-l="' + l.lvl + '"><div><small>Nivel ' + l.lvl + (l.type === 'test' ? ' · test' : '') + ' · ≈ ' + lvDur(l) + ' min</small><b>' + esc(l.name) + '</b></div>' + (l.lvl === S.run.level ? '<span class="pill">actual</span>' : l.lvl < S.run.level ? '<span class="muted">✓</span>' : '') + '</div>').join('');
      } else if (sub === 'historial') {
        const ss = S.run.sessions;
        h += '<div class="card"><h3>Evolución del nivel</h3>' + A.chart({ series: [{ points: ss.map((s, i) => [i + 1, s.next]), dots: true, r: 3.5, opacity: 1 }, { points: ss.map((s, i) => [i + 1, s.rpe]), color: 'var(--accent)', dash: '4 4', dots: true }], xFmt: (x) => '#' + x.toFixed(0), legend: [['Nivel', 'var(--primary)'], ['Dureza (1–10)', 'var(--accent)']] }) + '</div>';
        h += '<div class="card"><h3>Sesiones</h3>' + (ss.slice().reverse().map((s) => '<details class="hist"><summary><b>' + A.fmtDate(s.date, true) + '</b> · nivel ' + s.lvl + ' → ' + s.next + ' · dureza ' + s.rpe + (s.dist ? ' · ' + num(s.dist, 2) + ' km' : '') + (s.dist && s.time ? ' · ' + A.mmss(s.time * 60 / s.dist) + '/km' : '') + '</summary><p class="small">' + esc(s.why) + '</p>' + (s.note ? '<p class="small muted">' + esc(s.note) + '</p>' : '') + '<button class="btn danger sm" data-act="delRun" data-id="' + s.id + '">Eliminar</button></details>').join('') || '<p class="muted">Aún no hay sesiones.</p>') + '</div>';
      } else {
        h += '<div class="card"><h3>Cómo funciona</h3><ul class="ticks">' + P.runRules.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
        h += '<div class="card"><h3>Escala de esfuerzo (RPE)</h3><div class="kv"><span>3–4</span><b>Caminar rápido / trote que te deja cantar</b><span>5–6</span><b>Trote cómodo, puedes hablar con frases</b><span>7</span><b>Ritmo vivo: frases cortas</b><span>8</span><b>Fuerte: palabras sueltas</b><span>9–10</span><b>Casi máximo / máximo</b></div></div>';
      }
      return h;
    }
  };

  /* ================= BIENESTAR ================= */
  function stepPhases(steps) { const ph = []; steps.forEach((s) => { if (s.side) { ph.push({ label: s.name + ' · izquierda', sub: s.cue, dur: s.dur }); ph.push({ label: s.name + ' · derecha', sub: s.cue, dur: s.dur }); } else ph.push({ label: s.name, sub: s.cue, dur: s.dur }); }); return ph; }
  A.act.mobStart = (el) => {
    const which = el.dataset.w; const m = P.mobility[which]; let steps = m.steps.slice();
    if (which === 'weekly') { const med = A.medFor(Math.max(1, A.weekN())); steps = steps.map((s) => (s.dur === 600 ? Object.assign({}, s, { dur: med.min * 60, name: 'Meditación · ' + med.name, cue: med.guide }) : s)); }
    A.timerModal(m.name, stepPhases(steps), { onDone: () => { const lg = A.log(); lg.checks = lg.checks || {}; lg.checks.resp = true; if (which === 'weekly') { const w = String(Math.max(1, A.weekN())); A.S.weekly[w] = A.S.weekly[w] || {}; A.S.weekly[w].stretch = true; } A.save(); A.toast('Sesión completada ✓'); } });
  };
  A.act.breathStart = () => {
    const b = P.breathing.find((x) => x.id === (A.S.ui.breath || 'coh')) || P.breathing[0]; const mins = +(A.S.ui.breathMin || 3);
    const cyc = b.phases.reduce((s, p) => s + p[1], 0); const n = Math.max(1, Math.round(mins * 60 / cyc)); const ph = [];
    for (let i = 0; i < n; i++) b.phases.forEach((p, j) => { const prev = b.phases[j - 1]; ph.push({ label: p[0], sub: 'Ciclo ' + (i + 1) + ' de ' + n, dur: p[1], hold: prev && prev[0].toLowerCase().startsWith('inhala') ? 'top' : 'bottom' }); });
    A.timerModal(b.name, ph, { breath: true, onDone: () => { const lg = A.log(); lg.checks = lg.checks || {}; lg.checks.resp = true; lg.med = (lg.med || 0) + mins; A.save(); } });
  };
  A.act.medStart = () => {
    const med = A.medFor(Math.max(1, A.weekN())); const mins = +(A.S.ui.medMin || med.min);
    A.timerModal('Meditación · ' + med.name, [{ label: 'Prepárate', sub: 'Siéntate cómodo, cierra los ojos', dur: 15 }, { label: med.name, sub: med.guide, dur: mins * 60, work: true }, { label: '3 respiraciones largas', sub: 'Abre los ojos poco a poco', dur: 20 }], { onDone: () => { const lg = A.log(); lg.checks = lg.checks || {}; lg.checks.resp = true; lg.med = (lg.med || 0) + mins; A.save(); } });
  };
  A.act.uiSet = (el) => { A.S.ui[el.dataset.k] = el.dataset.v; A.save(); A.rerender(); };

  A.pages.bienestar = {
    render(sub) {
      sub = sub || 'movilidad'; const S = A.S; let h = '<h2 class="ptitle">' + A.icon('🧘') + 'Bienestar</h2>';
      h += A.seg(sub, [['movilidad', 'Movilidad'], ['respira', 'Respiración'], ['medita', 'Meditación'], ['sueno', 'Sueño']], 'bienestar');
      if (sub === 'movilidad') {
        ['weekly', 'daily'].forEach((k) => { const m = P.mobility[k]; const tot = stepPhases(m.steps).reduce((s, p) => s + p.dur, 0); h += '<div class="card"><div class="card-h"><h3>' + esc(m.name) + '</h3><span class="pill">≈ ' + Math.round(tot / 60) + ' min</span></div>' + (m.when ? '<p class="muted small">' + esc(m.when) + '</p>' : '') + '<ol class="ticks small">' + m.steps.map((s) => '<li><b>' + esc(s.name) + '</b> · ' + (s.side ? A.mmss(s.dur) + ' por lado' : A.mmss(s.dur)) + '<br><span class="muted">' + esc(s.cue) + '</span></li>').join('') + '</ol><button class="btn" data-act="mobStart" data-w="' + k + '">▶ Empezar guiada</button></div>'; });
        h += '<div class="card"><h3>Liberación miofascial: pautas</h3><ul class="ticks"><li>Presión moderada (molestia 5–6/10, nunca dolor agudo).</li><li>Cuando encuentres un nudo, quédate quieto 20–30 s respirando lento.</li><li>Nada de rodillo directo sobre la zona lumbar ni sobre articulaciones.</li><li>Rodillo de densidad media + pelota de lacrosse/tenis: suficiente.</li></ul></div>';
      } else if (sub === 'respira') {
        const cur = S.ui.breath || 'coh'; const mins = S.ui.breathMin || '3';
        h += '<div class="card"><h3>Elige un patrón</h3><div class="chips">' + P.breathing.map((b) => '<button class="chip ' + (b.id === cur ? 'on' : '') + '" data-act="uiSet" data-k="breath" data-v="' + b.id + '">' + esc(b.name) + '</button>').join('') + '</div><div class="fld"><span>Duración</span><div class="chips">' + ['1', '2', '3', '5', '10'].map((m) => '<button class="chip ' + (m === String(mins) ? 'on' : '') + '" data-act="uiSet" data-k="breathMin" data-v="' + m + '">' + m + ' min</button>').join('') + '</div></div><button class="btn" data-act="breathStart">▶ Empezar</button></div>';
        h += '<div class="card"><h3>Cuándo usar cada una</h3><ul class="ticks"><li><b>Coherente 4–6:</b> después de comer, en la tarde de sofá, tras un día tenso.</li><li><b>Caja:</b> antes de un examen de la oposición o de una reunión.</li><li><b>4–7–8:</b> en la cama, 4–6 ciclos.</li><li><b>Suspiro fisiológico:</b> antojo repentino o pico de estrés (3 repeticiones bastan).</li></ul></div>';
      } else if (sub === 'medita') {
        const w = Math.max(1, A.weekN()); const med = A.medFor(w); const mins = S.ui.medMin || med.min;
        h += '<div class="card hero"><div class="kicker">Nivel de la semana ' + w + ' · ' + med.min + ' min</div><h1>' + esc(med.name) + '</h1><p>' + esc(med.guide) + '</p><div class="chips">' + [3, 5, 8, 10, 12, 15, 20].map((m) => '<button class="chip ' + (+m === +mins ? 'on' : '') + '" data-act="uiSet" data-k="medMin" data-v="' + m + '">' + m + ' min</button>').join('') + '</div><button class="btn" data-act="medStart">▶ Empezar</button></div>';
        h += '<div class="card"><h3>Progresión de 17 semanas</h3>' + P.meditation.map((m) => '<div class="phase"><b>' + esc(m.name) + '</b><span class="pill">Sem. ' + m.weeks + ' · ' + m.min + ' min</span><p class="muted small">' + esc(m.guide) + '</p></div>').join('') + '</div>';
        const total = Object.values(S.logs).reduce((s, l) => s + (l.med || 0), 0);
        h += '<div class="card"><div class="kv"><span>Minutos acumulados</span><b>' + total + ' min</b></div><p class="muted small">Meditar no es "dejar la mente en blanco". Es darte cuenta de que te has ido y volver. Cada vuelta cuenta como una repetición.</p></div>';
      } else {
        h += '<div class="card"><h3>Rutina de sueño (objetivo 7–7,5 h)</h3><ol class="ticks"><li>21:30 · desayuno y táper de mañana listos.</li><li>22:15 · luz cálida, ducha o lectura.</li><li>22:30 · pantallas fuera (el móvil a cargar fuera de la habitación).</li><li>22:45 · en la cama · 4–7–8 × 4 ciclos.</li><li>06:00–06:30 · luz natural y 500 ml de agua al levantarte.</li></ol></div>';
        h += '<div class="card"><h3>Lo que más influye</h3><ul class="ticks"><li>Horario regular, también el fin de semana (±1,5 h).</li><li>Café antes de las 15:00.</li><li>Siesta ≤ 20 min, antes de las 17:00.</li><li>Cena 2 h antes de acostarte; si cenas muy tarde, más ligera.</li><li>Habitación fresca, oscura y silenciosa.</li><li>Dormir menos de 6 h sube el hambre del día siguiente: es una herramienta para perder grasa, no un lujo.</li></ul></div>';
        const last7 = Array.from({ length: 7 }, (_, i) => A.addDays(A.today(), -6 + i)); const vals = last7.map((d) => (S.logs[d] || {}).sleepH);
        h += '<div class="card"><h3>Últimos 7 días</h3><div class="bars">' + last7.map((d, i) => '<div><i style="height:' + Math.min(100, (vals[i] || 0) / 9 * 100) + '%" class="' + ((vals[i] || 0) >= 7 ? 'ok' : '') + '"></i><small>' + A.dayKey(d).slice(0, 1).toUpperCase() + '</small></div>').join('') + '</div><p class="muted small center">Media: ' + num(A.avg(vals), 1) + ' h</p></div>';
      }
      return h;
    }
  };
})();
