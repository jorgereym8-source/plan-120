/* Plan 120 · Progreso y Ajustes */
(function () {
  'use strict';
  const P = window.PLAN, A = window.App, esc = A.esc, num = A.num, f = A.f;
  const dfmt = (x) => { const d = new Date(x); return d.getDate() + ' ' + A.MESES[d.getMonth()]; };
  const ts = (s) => A.parseISO(s).getTime();

  /* ---------- recomendación semanal ---------- */
  function recommend(w) {
    const s = A.weekStats(w), p = A.weekStats(w - 1), pp = A.weekStats(w - 2); const rw = A.roadWeek(w);
    if (s.nWeigh < 3 || !p.avgW) return { delta: 0, code: 'data', text: 'Faltan datos: necesito al menos 3–4 pesajes esta semana y la anterior para comparar medias.' };
    const d1 = s.avgW - p.avgW; const d0 = pp.avgW ? p.avgW - pp.avgW : null; const ad = s.adherence;
    const pw = p.waist, sw = s.waist; const waistDown = pw && sw ? sw < pw : false;
    const base = 'Media ' + num(s.avgW, 1) + ' kg (' + (d1 > 0 ? '+' : '') + num(d1, 2) + ' kg vs. semana anterior). ';
    if (/Navidad/.test(rw.phase)) return d1 > 0.8 ? { delta: 0, code: 'xmas', text: base + 'Has subido algo más de lo previsto en fiestas. Sin recortar comida: proteína alta, ≥ 9.000 pasos y vuelta al plan en la siguiente comida normal.' } : { delta: 0, code: 'ok', text: base + 'Objetivo de Navidad cumplido: mantener. Así se gana de verdad.' };
    if (ad != null && ad < 0.8) return { delta: 0, code: 'adh', text: base + 'Cumplimiento del ' + Math.round(ad * 100) + ' % (< 80 %). No tocamos calorías: la prioridad es cumplir el plan actual. Elige 1 comida difícil y prepárala mejor.' };
    if (w >= 3 && d1 < -1.2 && d0 != null && d0 < -1.2) return { delta: +125, code: 'fast', text: base + 'Bajas más de 1,2 kg/semana dos semanas seguidas: riesgo de perder músculo y de que el hambre se dispare. Sube ≈ 125 kcal (carbohidratos alrededor del entreno).' };
    if (d1 > 0.1 && d0 != null && d0 > 0.1) return { delta: -150, code: 'up', text: base + 'La media sube dos semanas seguidas con buen cumplimiento. Revisa comidas fuera, sal y sueño; si no hay explicación, baja ≈ 150 kcal.' };
    if (d1 > -0.25 && (d0 == null || d0 > -0.25)) {
      if (waistDown) return { delta: 0, code: 'waist', text: base + 'El peso se mueve poco pero la cintura baja: probable retención de agua o recomposición. Mantén 1 semana más.' };
      if (d0 == null) return { delta: 0, code: 'wait', text: base + 'Semana lenta. Espera a la siguiente antes de ajustar (las decisiones se toman con 2 semanas).' };
      return { delta: -125, code: 'slow', text: base + 'Dos semanas con < 0,25 kg/semana y la cintura estable. Opción A: −125 kcal (de grasas o carbohidratos). Opción B: +1.500 pasos diarios.' };
    }
    return { delta: 0, code: 'ok', text: base + 'En el ritmo previsto (0,25–1,2 kg/semana). No cambies nada: repite la semana.' };
  }
  A.recommend = recommend;

  A.act.applyAdj = (el) => {
    const d = +el.dataset.d; const T = A.S.targets; const from = T.kcal; const to = Math.max(1900, from + d);
    A.S.targetHistory.push({ date: A.today(), from, to, why: 'Revisión semana ' + el.dataset.w });
    T.kcal = to; T.kcalMin = to - 100; T.kcalMax = to + 100; A.save(); A.rerender(); A.toast('Nuevo objetivo: ' + to + ' kcal');
  };
  A.act.revWeek = (el) => { A.S.ui.revW = +el.value; A.save(); A.rerender(); };
  A.act.revAns = (el) => { const w = +el.dataset.w; let r = A.S.reviews.find((x) => x.w === w); if (!r) { r = { w, date: A.today(), ans: [] }; A.S.reviews.push(r); } r.ans[+el.dataset.i] = el.value; r.date = A.today(); A.save(); };
  A.act.wRange = (el) => { A.S.ui.wRange = el.dataset.v; A.save(); A.rerender(); };
  A.act.addPastWeight = () => { const d = document.getElementById('pwD').value; const v = +String(document.getElementById('pwV').value).replace(',', '.'); if (!d || !v) return A.toast('Fecha y peso'); A.log(d).w = v; A.save(); A.rerender(); A.toast('Guardado'); };
  A.act.delWeight = (el) => { const l = A.S.logs[el.dataset.d]; if (l) delete l.w; A.save(); A.rerender(); };
  A.act.saveMeasure = () => {
    const d = document.getElementById('msD').value || A.today(); const m = A.S.measures[d] = A.S.measures[d] || {};
    ['waist', 'hip', 'chest', 'arm', 'thigh', 'neck'].forEach((k) => { const v = document.getElementById('ms_' + k).value; if (v !== '') m[k] = +String(v).replace(',', '.'); });
    A.save(); A.rerender(); A.toast('Medidas guardadas');
  };
  A.act.saveComp = () => {
    const g = (k) => document.getElementById('cp_' + k).value; const n = (k) => (g(k) === '' ? null : +String(g(k)).replace(',', '.'));
    A.S.comps.push({ date: g('date') || A.today(), w: n('w'), fat: n('fat'), muscle: n('muscle'), visceral: n('visceral'), waist: n('waist'), note: g('note') });
    A.S.comps.sort((a, b) => a.date.localeCompare(b.date)); A.save(); A.rerender();
  };
  A.act.delComp = (el) => { A.S.comps.splice(+el.dataset.i, 1); A.save(); A.rerender(); };
  A.act.delMeasure = (el) => { delete A.S.measures[el.dataset.d]; A.save(); A.rerender(); };

  /* fotos */
  A.act.photoAdd = async () => {
    const inp = document.getElementById('phF'); const file = inp.files && inp.files[0]; if (!file) return A.toast('Elige una foto');
    const date = document.getElementById('phD').value || A.today(); const pose = document.getElementById('phP').value;
    try { const url = await A.compressImage(file, 1000); const id = 'p' + A.uid(); await A.idb.set('photo:' + id, url); A.S.photos.push({ id, date, pose }); A.save(); A.rerender(); A.toast('Foto guardada en el móvil'); } catch (e) { A.toast('No se pudo guardar la foto'); }
  };
  A.act.photoDel = async (el) => { if (!A.confirm('¿Borrar foto?')) return; await A.idb.del('photo:' + el.dataset.id); A.S.photos = A.S.photos.filter((x) => x.id !== el.dataset.id); A.save(); A.rerender(); };
  A.act.photoCmp = (el) => { A.S.ui[el.dataset.k] = el.value; A.save(); A.rerender(); };
  function fillPhotos() { document.querySelectorAll('img[data-pid]').forEach((img) => { A.idb.get('photo:' + img.dataset.pid).then((u) => { if (u) img.src = u; }); }); }

  /* importación */
  const MES = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, sept: 8, oct: 9, nov: 10, dic: 11 };
  function parseWeights(txt) {
    const out = {}; const re = /(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sept?|oct|nov|dic)\w*\.?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})\s*:\s*([\d.,]+)\s*kg/gi; let m;
    while ((m = re.exec(txt))) {
      const d = A.iso(new Date(+m[3], MES[m[2].toLowerCase()], +m[1])); const t = (+m[4]) * 60 + (+m[5]); const kg = Math.round(parseFloat(m[6].replace(',', '.')) * 10) / 10;
      if (!out[d] || t < out[d].t) out[d] = { t, kg };
    }
    const iso2 = /(\d{4}-\d{2}-\d{2})[ ,;\t]+([\d.,]+)/g; while ((m = iso2.exec(txt))) { if (!out[m[1]]) out[m[1]] = { t: 0, kg: Math.round(parseFloat(m[2].replace(',', '.')) * 10) / 10 }; }
    return out;
  }
  A.parseWeights = parseWeights;
  A.act.importTxt = () => {
    const txt = document.getElementById('impT').value; const ow = document.getElementById('impO').checked; const ws = parseWeights(txt); let n = 0;
    Object.keys(ws).forEach((d) => { const lg = A.log(d); if (lg.w == null || ow) { lg.w = ws[d].kg; n++; } });
    A.save(true); A.rerender(); A.toast(n + ' pesajes importados');
  };
  A.act.importFile = (el) => {
    const file = el.files && el.files[0]; if (!file) return; const fr = new FileReader();
    fr.onload = () => {
      const txt = String(fr.result);
      if (/^\s*\{/.test(txt)) { try { importJSON(JSON.parse(txt)); } catch (e) { A.toast('JSON no válido'); } }
      else { document.getElementById('impT').value = txt; A.act.importTxt(); }
    };
    fr.readAsText(file);
  };
  function importJSON(o) {
    if (o.app === 'plan120-backup' && o.state) { if (!A.confirm('Esto REEMPLAZA todos los datos de la app por la copia de seguridad. ¿Continuar?')) return; A.S = A.clone(o.state); A.save(true); A.applyTheme(); A.rerender(); return A.toast('Copia restaurada'); }
    let n = 0;
    if (o.profile) Object.keys(o.profile).forEach((k) => { if (o.profile[k] != null) A.S.profile[k] = o.profile[k]; });
    if (o.weights) Object.keys(o.weights).forEach((d) => { const lg = A.log(d); if (lg.w == null) { lg.w = o.weights[d]; n++; } });
    if (o.measures) Object.keys(o.measures).forEach((d) => { A.S.measures[d] = Object.assign({}, A.S.measures[d] || {}, o.measures[d]); });
    if (o.comps) o.comps.forEach((c) => { if (!A.S.comps.some((x) => x.date === c.date)) A.S.comps.push(c); });
    if (o.targets) Object.assign(A.S.targets, o.targets);
    A.save(true); A.rerender(); A.toast('Datos importados (' + n + ' pesajes)');
  }
  A.importJSON = importJSON;
  A.act.exportAll = () => {
    const blob = new Blob([JSON.stringify({ app: 'plan120-backup', date: A.today(), state: A.S }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'plan120-copia-' + A.today() + '.json'; document.body.appendChild(a); a.click(); a.remove();
    A.toast('Copia descargada (las fotos no se incluyen)');
  };
  A.act.resetAll = () => { if (A.confirm('¿Borrar TODOS los datos de la app? No se puede deshacer.') && A.confirm('Seguro, ¿de verdad?')) { A.resetAll(); A.applyTheme(); A.go('hoy'); A.rerender(); } };

  A.pages.progreso = {
    render(sub) {
      sub = sub || 'peso'; const S = A.S; let h = '<h2 class="ptitle">' + A.icon('📈') + 'Progreso</h2>';
      h += A.seg(sub, [['peso', 'Peso'], ['medidas', 'Medidas'], ['fotos', 'Fotos'], ['revision', 'Revisión'], ['datos', 'Datos']], 'progreso');
      const ser = A.weightSeries(); const ma = A.movingAvg(ser, 7); const sw = A.startWeight(); const start = S.profile.startDate;

      if (sub === 'peso') {
        const rng = S.ui.wRange || 'plan'; let from = '0000', to = '9999';
        if (rng === '30') from = A.addDays(A.today(), -30); else if (rng === 'plan') { from = A.addDays(start, -14); to = A.addDays(start, 125); } else if (rng === '365') from = A.addDays(A.today(), -365);
        const pts = ser.filter(([d]) => d >= from && d <= to).map(([d, v]) => [ts(d), v]); const mpts = ma.filter(([d]) => d >= from && d <= to).map(([d, v]) => [ts(d), v]);
        const band = sw && rng === 'plan' ? [[ts(start), sw, sw]].concat(P.roadmap.map((r) => [ts(A.addDays(start, r.w * 7 - 1)), sw * (1 - r.loss[1] / 100), sw * (1 - r.loss[0] / 100)])) : [];
        const last = ma.length ? ma[ma.length - 1][1] : null; const wk = A.weekN(); const cw = A.weekStats(Math.max(1, wk)), pw = A.weekStats(Math.max(1, wk) - 1);
        h += '<div class="card"><div class="stats3"><div><small>Media 7 días</small><b>' + num(last, 1) + '</b><span>kg</span></div><div><small>Desde el inicio</small><b>' + (sw && last ? (last - sw > 0 ? '+' : '') + num(last - sw, 1) : '–') + '</b><span>kg</span></div><div><small>Semana vs anterior</small><b>' + (cw.avgW && pw.avgW ? (cw.avgW - pw.avgW > 0 ? '+' : '') + num(cw.avgW - pw.avgW, 2) : '–') + '</b><span>kg</span></div></div>' +
          '<div class="chips">' + [['30', '30 días'], ['plan', 'Plan 120'], ['365', '1 año'], ['all', 'Todo']].map((x) => '<button class="chip ' + (rng === x[0] ? 'on' : '') + '" data-act="wRange" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
          A.chart({ series: [{ points: pts, line: false, dots: true, color: 'var(--muted)', r: rng === 'all' ? 1.6 : 2.6 }, { points: mpts, width: 2.6 }], band, xFmt: dfmt, yFmt: (y) => y.toFixed(0), height: 210, legend: [['Pesajes', 'var(--muted)'], ['Media 7 días', 'var(--primary)']].concat(band.length ? [['Rango esperado', 'rgba(var(--primary-rgb),.25)']] : []) }) + '</div>';
        h += '<div class="card"><h3>Añadir o corregir un pesaje</h3><div class="row gap wrap"><input id="pwD" type="date" value="' + A.today() + '"><input id="pwV" type="number" step="0.1" inputmode="decimal" placeholder="kg" class="inline"><button class="btn sm" data-act="addPastWeight">Guardar</button></div></div>';
        const weeks = []; for (let w = 1; w <= Math.min(17, Math.max(1, wk)); w++) weeks.push(A.weekStats(w));
        h += '<div class="card"><h3>Semana a semana</h3><div class="tbl"><div class="tr th"><span>Sem</span><span>Media</span><span>Δ</span><span>Pesajes</span><span>Cumpl.</span><span>Pasos</span></div>' + weeks.map((s, i) => { const prev = i ? weeks[i - 1].avgW : sw; const d = s.avgW && prev ? s.avgW - prev : null; return '<div class="tr"><span>' + s.w + '</span><span>' + num(s.avgW, 1) + '</span><span class="' + (d == null ? '' : d <= 0 ? 'good' : 'bad') + '">' + (d == null ? '–' : (d > 0 ? '+' : '') + num(d, 2)) + '</span><span>' + s.nWeigh + '</span><span>' + (s.adherence != null ? Math.round(s.adherence * 100) + '%' : '–') + '</span><span>' + num(s.steps) + '</span></div>'; }).join('') + '</div></div>';
        h += '<div class="card"><h3>¿Grasa o agua?</h3><ul class="ticks small"><li>Pésate cada mañana, después del baño y antes de comer o beber. Mira la <b>media de 7 días</b>, no el número del día.</li><li>Subidas de 0,5–2 kg tras sal, comida fuera, más carbohidratos, mal sueño o entreno de pierna = agua. Bajan en 2–5 días.</li><li>La grasa se pierde a ≈ 0,5–1 kg/semana. Si la media baja eso durante 2–3 semanas y la cintura acompaña, es pérdida real.</li><li>La 1.ª semana bajarás más (glucógeno y agua): no la uses para calcular tu ritmo.</li></ul></div>';
        const recent = ser.slice(-10).reverse();
        if (recent.length) h += '<details class="card"><summary>Últimos pesajes</summary>' + recent.map(([d, v]) => '<div class="row"><span>' + A.fmtDate(d, true) + '</span><b>' + num(v, 1) + ' kg</b><button class="icon-btn sm" data-act="delWeight" data-d="' + d + '">✕</button></div>').join('') + '</details>';
      }

      else if (sub === 'medidas') {
        const ms = Object.keys(S.measures).sort(); const wp = ms.filter((d) => S.measures[d].waist).map((d) => [ts(d), +S.measures[d].waist]);
        const lastW = wp.length ? wp[wp.length - 1][1] : S.profile.startWaist; const ratio = lastW ? lastW / S.profile.height : null;
        h += '<div class="card"><div class="stats3"><div><small>Cintura actual</small><b>' + num(lastW, 1) + '</b><span>cm</span></div><div><small>Desde el inicio</small><b>' + (lastW && S.profile.startWaist ? (lastW - S.profile.startWaist > 0 ? '+' : '') + num(lastW - S.profile.startWaist, 1) : '–') + '</b><span>cm</span></div><div><small>Cintura / altura</small><b>' + num(ratio, 2) + '</b><span>objetivo &lt; 0,50</span></div></div>' + A.chart({ series: [{ points: wp, dots: true, r: 3.5, opacity: 1, color: 'var(--accent)' }], xFmt: dfmt, yFmt: (y) => y.toFixed(0) }) + '</div>';
        h += '<div class="card"><h3>Nueva medición</h3><p class="muted small">Domingo por la mañana, en ayunas. Cintura a la altura del ombligo, de pie, relajado, al final de una exhalación normal. Mide 2 veces y apunta la media.</p><label class="fld"><span>Fecha</span><input id="msD" type="date" value="' + A.today() + '"></label><div class="grid3">' + [['waist', 'Cintura'], ['hip', 'Cadera'], ['chest', 'Pecho'], ['arm', 'Brazo'], ['thigh', 'Muslo'], ['neck', 'Cuello']].map((x) => '<label class="fld"><span>' + x[1] + '</span><input id="ms_' + x[0] + '" type="number" step="0.5" inputmode="decimal"></label>').join('') + '</div><button class="btn" data-act="saveMeasure">Guardar</button></div>';
        if (ms.length) h += '<div class="card"><h3>Historial</h3><div class="tbl"><div class="tr th"><span>Fecha</span><span>Cint.</span><span>Cad.</span><span>Pecho</span><span>Brazo</span><span></span></div>' + ms.slice().reverse().map((d) => { const m = S.measures[d]; return '<div class="tr"><span>' + A.fmtDate(d) + '</span><span>' + num(m.waist, 1) + '</span><span>' + num(m.hip, 1) + '</span><span>' + num(m.chest, 1) + '</span><span>' + num(m.arm, 1) + '</span><span><button class="icon-btn sm" data-act="delMeasure" data-d="' + d + '">✕</button></span></div>'; }).join('') + '</div></div>';
        h += '<div class="card"><h3>Composición corporal (bioimpedancia)</h3><p class="muted small">Úsala solo para comparar contigo mismo: mismo aparato, misma hora, en ayunas y sin entrenar antes. Las cifras absolutas (sobre todo % de grasa y agua) tienen bastante error.</p>' +
          (S.comps.length ? '<div class="tbl"><div class="tr th"><span>Fecha</span><span>Peso</span><span>Grasa %</span><span>Músc.</span><span>Visc.</span><span></span></div>' + S.comps.map((c, i) => '<div class="tr"><span>' + A.fmtDate(c.date) + '</span><span>' + num(c.w, 1) + '</span><span>' + num(c.fat, 1) + '</span><span>' + num(c.muscle, 1) + '</span><span>' + num(c.visceral) + '</span><span><button class="icon-btn sm" data-act="delComp" data-i="' + i + '">✕</button></span></div>').join('') + '</div>' : '') +
          '<details><summary>Añadir análisis</summary><div class="grid3">' + [['date', 'Fecha', 'date'], ['w', 'Peso'], ['fat', 'Grasa %'], ['muscle', 'Músculo kg'], ['visceral', 'Visceral'], ['waist', 'Cintura']].map((x) => '<label class="fld"><span>' + x[1] + '</span><input id="cp_' + x[0] + '" type="' + (x[2] || 'number') + '" step="any"></label>').join('') + '</div><label class="fld"><span>Nota</span><input id="cp_note"></label><button class="btn sm" data-act="saveComp">Guardar</button></details></div>';
      }

      else if (sub === 'fotos') {
        h += '<div class="card"><h3>Nueva foto</h3><p class="muted small">Cada 2 semanas (semanas pares), domingo por la mañana: misma luz, misma distancia, misma ropa. Frente, perfil y espalda. Se guardan solo en este móvil.</p><div class="grid3"><label class="fld"><span>Fecha</span><input id="phD" type="date" value="' + A.today() + '"></label><label class="fld"><span>Pose</span><select id="phP"><option value="frente">Frente</option><option value="perfil">Perfil</option><option value="espalda">Espalda</option></select></label><label class="fld"><span>Foto</span><input id="phF" type="file" accept="image/*"></label></div><button class="btn" data-act="photoAdd">Guardar foto</button></div>';
        const dates = [...new Set(S.photos.map((p) => p.date))].sort();
        if (dates.length >= 2) {
          const a = S.ui.phA || dates[0], b = S.ui.phB || dates[dates.length - 1], pose = S.ui.phPose || 'frente';
          const pa = S.photos.find((p) => p.date === a && p.pose === pose), pb = S.photos.find((p) => p.date === b && p.pose === pose);
          const opt = (sel) => dates.map((d) => '<option' + (d === sel ? ' selected' : '') + ' value="' + d + '">' + A.fmtDate(d, true) + '</option>').join('');
          h += '<div class="card"><h3>Comparar</h3><div class="grid3"><select data-on="photoCmp" data-k="phA">' + opt(a) + '</select><select data-on="photoCmp" data-k="phPose">' + ['frente', 'perfil', 'espalda'].map((p) => '<option' + (p === pose ? ' selected' : '') + '>' + p + '</option>').join('') + '</select><select data-on="photoCmp" data-k="phB">' + opt(b) + '</select></div><div class="cmp">' + [pa, pb].map((p) => p ? '<img data-pid="' + p.id + '" alt="">' : '<div class="empty">Sin foto</div>').join('') + '</div></div>';
        }
        h += dates.slice().reverse().map((d) => '<div class="card"><h3>' + A.fmtDate(d, true) + '</h3><div class="thumbs">' + S.photos.filter((p) => p.date === d).map((p) => '<figure><img data-pid="' + p.id + '" alt=""><figcaption>' + p.pose + ' <button class="icon-btn sm" data-act="photoDel" data-id="' + p.id + '">✕</button></figcaption></figure>').join('') + '</div></div>').join('');
      }

      else if (sub === 'revision') {
        const cur = A.weekN(); const def = A.dayKey(A.today()) === 'dom' ? cur : cur - 1; const w = A.clamp(S.ui.revW || Math.max(1, def), 1, 17);
        const s = A.weekStats(w); const rec = recommend(w); const rw = A.roadWeek(w); const rv = S.reviews.find((x) => x.w === w) || { ans: [] };
        h += '<div class="card"><label class="fld"><span>Semana</span><select data-on="revWeek">' + P.roadmap.map((r) => '<option value="' + r.w + '"' + (r.w === w ? ' selected' : '') + '>Semana ' + r.w + ' · ' + A.fmtDate(A.weekRange(r.w)[0]) + ' – ' + A.fmtDate(A.weekRange(r.w)[1]) + '</option>').join('') + '</select></label>' +
          '<div class="kv"><span>Peso medio</span><b>' + num(s.avgW, 1) + ' kg (' + s.nWeigh + ' pesajes)</b><span>Cintura</span><b>' + num(s.waist, 1) + ' cm</b><span>Cumplimiento comidas</span><b>' + (s.adherence != null ? Math.round(s.adherence * 100) + ' %' : '–') + '</b><span>Pasos (media)</span><b>' + num(s.steps) + '</b><span>Sueño</span><b>' + num(s.sleep, 1) + ' h · calidad ' + num(s.sleepQ, 1) + '</b><span>Energía / hambre / estrés</span><b>' + num(s.energy, 1) + ' / ' + num(s.hunger, 1) + ' / ' + num(s.stress, 1) + '</b><span>Gimnasio</span><b>' + s.gym + '/2</b><span>Carrera</span><b>' + (rw.run ? (s.run ? 'hecha ✓' : 'pendiente') : 'no tocaba') + '</b></div></div>';
        h += '<div class="card rec ' + rec.code + '"><h3>' + A.icon('🧭') + 'Recomendación</h3><p>' + esc(rec.text) + '</p>' + (rec.delta ? '<button class="btn" data-act="applyAdj" data-d="' + rec.delta + '" data-w="' + w + '">Aplicar ' + (rec.delta > 0 ? '+' : '') + rec.delta + ' kcal (→ ' + Math.max(1900, S.targets.kcal + rec.delta) + ')</button>' : '') + '<p class="muted small">Objetivo actual: ' + num(S.targets.kcal) + ' kcal. Un ajuste cada 2 semanas como máximo.</p></div>';
        h += '<div class="card"><h3>Preguntas de la semana</h3>' + P.reviewQuestions.map((q, i) => '<label class="fld"><span>' + (i + 1) + '. ' + esc(q) + '</span><textarea rows="2" data-on="revAns" data-w="' + w + '" data-i="' + i + '">' + esc(rv.ans[i] || '') + '</textarea></label>').join('') + '</div>';
        if (rw.review) {
          h += '<div class="card"><h3>' + A.icon('🔎') + esc(rw.review) + '</h3><ul class="ticks"><li>Compara la media de peso de esta semana con la de hace 4 semanas.</li><li>Cintura: ¿ha bajado 2–4 cm en el mes?</li><li>Fotos: frente/perfil/espalda contra las del mes anterior.</li><li>Fuerza: ¿se mantienen o suben los básicos? (Entreno → Historial)</li><li>Pasos y sueño medios del mes.</li><li>¿Qué hábito ya es automático y cuál cuesta? Ajusta las reglas.</li>' + (rw.w === 17 ? '<li>Bioimpedancia en el mismo aparato y en las mismas condiciones que la inicial.</li><li>Test de carrera (nivel 13) y comparación con la sesión de referencia.</li>' : '') + '</ul></div>';
        }
        h += '<div class="card"><h3>Reglas de ajuste</h3><ul class="ticks small">' + P.adjustRules.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
      }

      else {
        h += '<div class="card"><h3>Importar historial de peso</h3><p class="muted small">Pega el texto exportado de tu báscula/app (formato «13 nov 2021, 8:11: 98.8 kg») o líneas «2026-10-30 106.7». También acepta el archivo .txt o el archivo de datos personales .json.</p><label class="fld"><span>Archivo (.txt o .json)</span><input type="file" accept=".txt,.json,.csv,text/plain,application/json" data-on="importFile"></label><textarea id="impT" rows="5" placeholder="Pega aquí el texto…"></textarea>' + f.tog('Sobrescribir días que ya tengan peso', 'ui.impO', false).replace('data-bind="ui.impO"', 'id="impO"') + '<button class="btn" data-act="importTxt">Importar texto</button></div>';
        h += '<div class="card"><h3>Copia de seguridad</h3><p class="muted small">Todo se guarda solo en este dispositivo. Haz una copia de vez en cuando (y antes de cambiar de móvil).</p><div class="row gap"><button class="btn" data-act="exportAll">Descargar copia (.json)</button></div><p class="muted small">Para restaurar, carga el archivo .json en "Importar historial" de arriba.</p></div>';
        h += '<div class="card"><h3>Resumen de datos</h3><div class="kv"><span>Pesajes</span><b>' + ser.length + '</b><span>Primer pesaje</span><b>' + (ser[0] ? A.fmtDate(ser[0][0], true) : '–') + '</b><span>Mediciones</span><b>' + Object.keys(S.measures).length + '</b><span>Sesiones de gimnasio</span><b>' + S.workouts.length + '</b><span>Carreras</span><b>' + S.run.sessions.length + '</b><span>Fotos</span><b>' + S.photos.length + '</b></div></div>';
        h += '<div class="card"><h3>Zona peligrosa</h3><button class="btn danger" data-act="resetAll">Borrar todos los datos</button></div>';
      }
      return h;
    },
    after(sub) { if (sub === 'fotos') fillPhotos(); }
  };

  /* ===================== AJUSTES ===================== */
  A.act.pickTheme = (el) => { const st = A.S.settings; st.theme = el.dataset.t; st.useCustom = false; const t = P.themes.find((x) => x.id === st.theme); st.gradient = t.gradient; A.save(); A.applyTheme(); A.rerender(); };
  A.act.customOn = (el) => { const st = A.S.settings; if (el.checked) { st.custom = A.clone(A.themeColors()); st.custom.id = 'custom'; } st.useCustom = el.checked; A.save(); A.applyTheme(); A.rerender(); };
  A.act.bgUpload = async (el) => { const file = el.files && el.files[0]; if (!file) return; const url = await A.compressImage(file, 1400); await A.idb.set('bgImage', url); A.S.settings.bgImage = true; A.save(); A.applyTheme(); A.toast('Fondo aplicado'); A.rerender(); };
  A.act.bgRemove = async () => { await A.idb.del('bgImage'); A.S.settings.bgImage = false; document.getElementById('bgimg').style.backgroundImage = ''; A.save(); A.applyTheme(); A.rerender(); };
  A.act.navToggle = (el) => { const st = A.S.settings; const id = el.dataset.id; const i = st.navItems.indexOf(id); if (i >= 0) { if (st.navItems.length <= 2) return A.toast('Mínimo 2 pestañas'); st.navItems.splice(i, 1); } else { if (st.navItems.length >= 6) return A.toast('Máximo 6 pestañas'); st.navItems.splice(st.navItems.length - (st.navItems.includes('mas') ? 1 : 0), 0, id); } A.save(); A.rerender(); };
  A.act.navMove = (el) => { const a = A.S.settings.navItems; const i = a.indexOf(el.dataset.id); const j = i + (+el.dataset.d); if (i < 0 || j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; A.save(); A.rerender(); };
  A.act.resetLook = () => { if (!A.confirm('¿Restaurar la apariencia por defecto?')) return; const d = A.defaults().settings; A.S.settings = d; A.idb.del('bgImage'); A.save(); A.applyTheme(); A.rerender(); };
  A.act.testSound = () => A.beep(880, 0.2, 2);
  A.act.exportTheme = () => { const txt = JSON.stringify({ app: 'plan120-theme', settings: A.S.settings }); if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => A.toast('Tema copiado al portapapeles')); };
  A.act.importTheme = () => { const txt = prompt('Pega el tema (JSON):'); if (!txt) return; try { const o = JSON.parse(txt); if (o.app !== 'plan120-theme') throw 0; Object.assign(A.S.settings, o.settings); A.save(); A.applyTheme(); A.rerender(); } catch (e) { A.toast('Tema no válido'); } };
  A.act.randomTheme = () => { const st = A.S.settings; const h = Math.floor(Math.random() * 360); const hsl = (s, l, hh) => { hh = ((hh == null ? h : hh) % 360 + 360) % 360; s /= 100; l /= 100; const k = (n) => (n + hh / 30) % 12; const a = s * Math.min(l, 1 - l); const fn = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))); return '#' + [fn(0), fn(8), fn(4)].map((x) => x.toString(16).padStart(2, '0')).join(''); };
    st.custom = { id: 'custom', mode: 'dark', bg: hsl(35, 8), bg2: hsl(45, 22, h + 40), surface: hsl(30, 14), text: hsl(20, 95), muted: hsl(15, 65), primary: hsl(75, 60, h + 180), accent: hsl(85, 62, h + 60), danger: '#ef476f', success: '#3ddc97', gradient: true }; st.useCustom = true; st.gradient = true; A.save(); A.applyTheme(); A.rerender(); };

  A.pages.ajustes = {
    render(sub) {
      sub = sub || 'perfil'; const S = A.S, st = S.settings; let h = '<h2 class="ptitle">' + A.icon('⚙️') + 'Ajustes</h2>';
      h += A.seg(sub, [['perfil', 'Perfil'], ['tema', 'Colores'], ['estilo', 'Estilo'], ['texto', 'Texto'], ['nav', 'Navegación'], ['extra', 'Comportamiento']], 'ajustes');
      if (sub === 'perfil') {
        const pr = S.profile;
        h += '<div class="card"><h3>Perfil</h3><div class="grid2">' + f.text('Nombre', 'profile.name', pr.name, { ph: 'Opcional' }) + f.text('Inicio del plan', 'profile.startDate', pr.startDate, { type: 'date', rr: true }) + f.num('Altura', 'profile.height', pr.height, { unit: 'cm' }) + f.num('Edad', 'profile.age', pr.age, { unit: 'años' }) + f.sel('Sexo (fórmulas)', 'profile.sex', pr.sex, [['h', 'Hombre'], ['m', 'Mujer']]) + f.num('Peso inicial', 'profile.startWeight', pr.startWeight, { unit: 'kg', step: '0.1', rr: true }) + f.num('Cintura inicial', 'profile.startWaist', pr.startWaist, { unit: 'cm', step: '0.5' }) + '</div><p class="muted small">Cambiar la fecha de inicio desplaza toda la hoja de ruta, la carrera quincenal y las revisiones. El peso inicial se usa para los rangos esperados (si lo dejas vacío, se toma el pesaje más cercano al inicio).</p></div>';
        h += '<div class="card"><h3>Privacidad</h3><p class="small">El código de la app es público, pero <b>tus datos no salen de este dispositivo</b>: se guardan en el almacenamiento local del navegador (y las fotos en IndexedDB). Haz copias de seguridad desde Progreso → Datos.</p></div>';
        h += '<div class="card"><h3>Instalar en el iPhone</h3><ol class="ticks small"><li>Abre la web en Safari.</li><li>Botón Compartir → "Añadir a pantalla de inicio".</li><li>Se abrirá a pantalla completa y funcionará sin conexión.</li></ol></div>';
      } else if (sub === 'tema') {
        h += '<div class="card"><h3>Temas</h3><div class="themes">' + P.themes.map((t) => '<button class="theme ' + (!st.useCustom && st.theme === t.id ? 'on' : '') + '" data-act="pickTheme" data-t="' + t.id + '" style="background:linear-gradient(160deg,' + t.bg + ',' + t.bg2 + ');color:' + t.text + '"><span class="sw" style="background:' + t.primary + '"></span><span class="sw" style="background:' + t.accent + '"></span><span class="sw" style="background:' + t.surface + '"></span><b>' + esc(t.name) + '</b></button>').join('') + '</div><div class="row gap"><button class="btn ghost sm" data-act="randomTheme">🎲 Tema aleatorio</button></div></div>';
        h += '<div class="card"><h3>Colores personalizados</h3><label class="tog"><span>Usar mis colores</span><input type="checkbox" data-on="customOn"' + (st.useCustom ? ' checked' : '') + '><i></i></label>' +
          (st.useCustom ? '<div class="grid3">' + [['bg', 'Fondo'], ['bg2', 'Fondo 2 (degradado)'], ['surface', 'Tarjetas'], ['text', 'Texto'], ['muted', 'Texto secundario'], ['primary', 'Principal / botones'], ['accent', 'Acento'], ['success', 'Éxito'], ['danger', 'Alerta']].map((x) => f.color(x[1], 'settings.custom.' + x[0], st.custom[x[0]])).join('') + '</div>' + f.sel('Modo base', 'settings.custom.mode', st.custom.mode, [['dark', 'Oscuro'], ['light', 'Claro']], { theme: true }) : '<p class="muted small">Actívalo para editar cada color partiendo del tema actual.</p>') + '</div>';
        h += '<div class="card"><h3>Fondo</h3>' + f.tog('Degradado', 'settings.gradient', st.gradient, { theme: true }) + f.range('Ángulo del degradado', 'settings.gradAngle', st.gradAngle, 0, 360, 5, { theme: true, unit: '°' }) +
          '<label class="fld"><span>Imagen de fondo</span><input type="file" accept="image/*" data-on="bgUpload"></label>' + (st.bgImage ? f.range('Oscurecer imagen', 'settings.bgDim', st.bgDim, 0, 0.95, 0.05, { theme: true }) + '<button class="btn ghost sm" data-act="bgRemove">Quitar imagen</button>' : '') + '</div>';
      } else if (sub === 'estilo') {
        h += '<div class="card"><h3>Tarjetas y translucidez</h3>' + f.sel('Estilo de tarjeta', 'settings.cardStyle', st.cardStyle, [['glass', 'Cristal (translúcido + desenfoque)'], ['solid', 'Sólido'], ['outline', 'Solo borde'], ['flat', 'Plano'], ['neo', 'Relieve suave']], { theme: true }) + f.range('Opacidad de tarjetas', 'settings.cardAlpha', st.cardAlpha, 0.1, 1, 0.02, { theme: true }) + f.range('Desenfoque', 'settings.blur', st.blur, 0, 40, 1, { theme: true, unit: ' px' }) + f.range('Sombra', 'settings.shadow', st.shadow, 0, 1, 0.05, { theme: true }) + f.range('Grosor de borde', 'settings.borderW', st.borderW, 0, 3, 0.5, { theme: true, unit: ' px' }) + '</div>';
        h += '<div class="card"><h3>Formas</h3>' + f.range('Redondeo de tarjetas', 'settings.radius', st.radius, 0, 36, 1, { theme: true, unit: ' px' }) + f.range('Redondeo de botones', 'settings.btnRadius', st.btnRadius, 0, 30, 1, { theme: true, unit: ' px' }) + f.sel('Estilo de botones', 'settings.btnStyle', st.btnStyle, [['filled', 'Relleno'], ['soft', 'Suave (tono)'], ['outline', 'Contorno'], ['gradient', 'Degradado'], ['glass', 'Cristal']], { theme: true }) + f.sel('Densidad', 'settings.density', st.density, [['compact', 'Compacta'], ['normal', 'Normal'], ['comfortable', 'Amplia']], { theme: true }) + f.sel('Progreso', 'settings.progressStyle', st.progressStyle, [['ring', 'Anillos'], ['bar', 'Barras']]) + '</div>';
        h += '<div class="card"><h3>Vista previa</h3><div class="row gap wrap"><button class="btn">Botón</button><button class="btn ghost">Secundario</button><span class="chip on">Chip</span><span class="pill">Pastilla</span></div>' + A.ring(1450, 2100, 'kcal', '1.450 / 2.100') + '</div>';
      } else if (sub === 'texto') {
        h += '<div class="card"><h3>Tipografía</h3>' + f.sel('Fuente', 'settings.font', st.font, P.fonts.map((x) => [x.id, x.name]), { theme: true }) + f.range('Tamaño', 'settings.fontScale', st.fontScale, 0.8, 1.35, 0.05, { theme: true, unit: '×' }) + f.range('Peso del texto', 'settings.fontWeight', st.fontWeight, 300, 600, 50, { theme: true }) + f.range('Peso de títulos', 'settings.headWeight', st.headWeight, 400, 900, 50, { theme: true }) + f.range('Espaciado entre letras', 'settings.letter', st.letter, -0.04, 0.1, 0.005, { theme: true, unit: ' em' }) + f.range('Interlineado', 'settings.lineH', st.lineH, 1.1, 1.9, 0.05, { theme: true }) + f.tog('Mostrar emojis', 'settings.emojis', st.emojis, { theme: true, rr: true }) + f.tog('Mostrar carbohidratos y grasas en el menú', 'settings.showMacrosCarbFat', st.showMacrosCarbFat) + '</div>';
        h += '<div class="card"><h1>Título grande</h1><h3>Subtítulo de tarjeta</h3><p>Texto normal del plan: proteína en cada comida, 8–10k pasos y 2 sesiones de fuerza.</p><p class="muted small">Texto secundario pequeño.</p></div>';
      } else if (sub === 'nav') {
        h += '<div class="card"><h3>Barra de navegación</h3>' + f.sel('Posición', 'settings.navPos', st.navPos, [['bottom', 'Abajo'], ['top', 'Arriba']], { theme: true }) + f.sel('Estilo', 'settings.navStyle', st.navStyle, [['floating', 'Flotante'], ['docked', 'Acoplada'], ['minimal', 'Mínima']], { theme: true }) + f.tog('Mostrar nombres', 'settings.navLabels', st.navLabels, { theme: true }) + '</div>';
        h += '<div class="card"><h3>Pestañas (2–6)</h3>' + Object.keys(A.tabs).map((id) => { const on = st.navItems.includes(id); return '<div class="row navrow"><button class="checkrow ' + (on ? 'on' : '') + '" data-act="navToggle" data-id="' + id + '"><i>' + (on ? '✓' : '') + '</i>' + A.tabs[id].icon + ' ' + A.tabs[id].name + '</button>' + (on ? '<button class="icon-btn sm" data-act="navMove" data-id="' + id + '" data-d="-1">←</button><button class="icon-btn sm" data-act="navMove" data-id="' + id + '" data-d="1">→</button>' : '') + '</div>'; }).join('') + '</div>';
      } else {
        h += '<div class="card"><h3>Comportamiento</h3>' + f.tog('Animaciones', 'settings.anim', st.anim, { theme: true }) + f.tog('Vibración', 'settings.haptics', st.haptics) + f.tog('Sonidos de temporizador', 'settings.sound', st.sound) + f.range('Volumen', 'settings.volume', st.volume, 0.05, 1, 0.05) + '<button class="btn ghost sm" data-act="testSound">Probar sonido</button>' + f.tog('Mantener la pantalla encendida en temporizadores', 'settings.wakeLock', st.wakeLock) + f.tog('Iniciar el descanso al marcar una serie', 'settings.autoRest', st.autoRest) + '</div>';
        h += '<div class="card"><h3>Tema</h3><div class="row gap wrap"><button class="btn ghost sm" data-act="exportTheme">Copiar mi tema</button><button class="btn ghost sm" data-act="importTheme">Pegar un tema</button><button class="btn danger sm" data-act="resetLook">Restaurar apariencia</button></div></div>';
        h += '<p class="muted small center">Plan 120 · v1 · datos locales</p>';
      }
      return h;
    }
  };
})();
