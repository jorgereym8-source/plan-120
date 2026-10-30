/* Plan 120 · núcleo: estado, utilidades, tema, gráficas, temporizadores, router */
(function () {
  'use strict';
  const P = window.PLAN;
  const KEY = 'plan120_state_v1';
  const App = window.App = { pages: {}, act: {}, ui: {} };

  /* ---------------- utilidades ---------------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
  const today = () => iso(new Date());
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  const fmtDate = (s, long) => { const d = parseISO(s); return long ? d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear() : d.getDate() + ' ' + MESES[d.getMonth()]; };
  const dayKey = (s) => DIAS[parseISO(s).getDay()];
  const num = (v, dec) => { if (v == null || v === '' || isNaN(v)) return '–'; return Number(v).toLocaleString('es-ES', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); };
  const avg = (arr) => { const a = arr.filter((x) => x != null && !isNaN(x)); return a.length ? a.reduce((s, x) => s + +x, 0) / a.length : null; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const uid = () => Math.random().toString(36).slice(2, 9);
  Object.assign(App, { clone, esc, iso, parseISO, addDays, diffDays, today, fmtDate, dayKey, num, avg, clamp, uid, MESES });

  /* ---------------- estado ---------------- */
  function defaults() {
    return {
      v: 1, planV: P.version,
      profile: { name: '', startDate: P.defaultStart, height: 180, age: 30, sex: 'h', startWeight: null, startWaist: null, activity: 1.4 },
      targets: clone(P.targets),
      targetHistory: [],
      foods: clone(P.foods),
      recipes: clone(P.recipes),
      weekMenu: clone(P.weekMenu),
      mealSlots: clone(P.mealSlots),
      routines: clone(P.routines),
      run: { level: 0, sessions: [], weekParity: 'par', preferredDay: 'mie' },
      logs: {},
      measures: {},
      comps: [],
      workouts: [],
      activeWorkout: null,
      reviews: [],
      weekly: {},
      shopping: { checked: {}, extras: [], weeks: 1, dinnerX2: true, basics: true },
      photos: [],
      ui: {},
      settings: {
        theme: 'oceano', useCustom: false, custom: clone(P.themes[0]),
        gradient: true, gradAngle: 165, bgImage: false, bgDim: 0.45,
        cardAlpha: 0.78, blur: 16, font: 'system', fontScale: 1, fontWeight: 400, headWeight: 750, letter: 0, lineH: 1.45,
        radius: 18, btnRadius: 14, borderW: 1, shadow: 0.35, btnStyle: 'filled', cardStyle: 'glass', density: 'normal',
        navPos: 'bottom', navStyle: 'floating', navLabels: true, navItems: ['hoy', 'dieta', 'entreno', 'carrera', 'progreso', 'mas'],
        emojis: true, anim: true, haptics: true, sound: true, volume: 0.6, wakeLock: true, autoRest: true,
        progressStyle: 'ring', showMacrosCarbFat: true, decimals: 1, compactHome: false, accentButtons: false
      }
    };
  }

  function merge(base, saved) {
    if (saved == null) return base;
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return saved;
    const out = Object.assign({}, base);
    Object.keys(saved).forEach((k) => {
      out[k] = (k in base && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], saved[k]) : saved[k];
    });
    return out;
  }

  /* Migración: cuando cambian los datos del plan, se actualizan recetas, alimentos y menú por defecto
     sin tocar los registros (pesos, sesiones, fotos…) ni las recetas propias. */
  function migrate(S) {
    if ((S.planV || 0) >= P.version) return S;
    Object.keys(P.foods).forEach((k) => { if (!S.foods[k]) S.foods[k] = clone(P.foods[k]); else S.foods[k].cas = clone(P.foods[k].cas); });
    const own = S.recipes.filter((r) => !P.recipes.some((d) => d.id === r.id));
    S.recipes = clone(P.recipes).concat(own);
    S.weekMenu = clone(P.weekMenu);
    S.mealSlots = S.mealSlots.map((s) => { const d = P.mealSlots.find((x) => x.id === s.id); return d ? Object.assign({}, s, { time: d.time }) : s; });
    S.planV = P.version;
    return S;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); return raw ? migrate(merge(defaults(), Object.assign({ planV: 0 }, JSON.parse(raw)))) : defaults(); }
    catch (e) { console.warn(e); return defaults(); }
  }
  App.S = load();
  let saveT = null;
  App.save = function (now) {
    clearTimeout(saveT);
    const doit = () => { try { localStorage.setItem(KEY, JSON.stringify(App.S)); } catch (e) { App.toast('No se pudo guardar: almacenamiento lleno'); } };
    if (now) doit(); else saveT = setTimeout(doit, 250);
  };
  App.resetAll = function () { localStorage.removeItem(KEY); App.S = defaults(); App.save(true); };
  App.defaults = defaults;

  App.get = function (path) { return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), App.S); };
  App.set = function (path, val) {
    const ks = path.split('.'); let o = App.S;
    for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = val; App.save();
  };
  App.log = function (date) { const d = date || today(); if (!App.S.logs[d]) App.S.logs[d] = {}; return App.S.logs[d]; };

  /* ---------------- plan: día, semana ---------------- */
  App.dayN = function (date) { return diffDays(App.S.profile.startDate, date || today()) + 1; };
  App.weekN = function (date) { const d = App.dayN(date); return d < 1 ? 0 : Math.ceil(d / 7); };
  App.weekRange = function (w) { const s = addDays(App.S.profile.startDate, (w - 1) * 7); return [s, addDays(s, 6)]; };
  App.roadWeek = function (w) { return P.roadmap[clamp(w, 1, P.roadmap.length) - 1]; };
  App.recipe = function (id) { return App.S.recipes.find((r) => r.id === id); };
  App.macros = function (ing) { return P.macros(ing, App.S.foods); };
  App.recipeMacros = function (id) {
    if (id === 'fuera') return { k: 750, p: 40, c: 70, f: 30, fib: 6 };
    const r = App.recipe(id); return r ? App.macros(r.ing) : { k: 0, p: 0, c: 0, f: 0, fib: 0 };
  };
  App.recipeName = function (id) { if (id === 'fuera') return 'Comida fuera (reglas para comer fuera)'; const r = App.recipe(id); return r ? r.name : '—'; };
  App.menuFor = function (date) {
    const dk = dayKey(date); const base = Object.assign({}, App.S.weekMenu[dk] || {});
    const lg = App.S.logs[date]; if (lg && lg.swap) Object.assign(base, lg.swap);
    return base;
  };
  App.dayIntake = function (date) {
    const lg = App.S.logs[date] || {}; const menu = App.menuFor(date); const t = { k: 0, p: 0, c: 0, f: 0 };
    Object.keys(lg.meals || {}).forEach((slot) => { if (lg.meals[slot] && menu[slot]) { const m = App.recipeMacros(menu[slot]); t.k += m.k; t.p += m.p; t.c += m.c; t.f += m.f; } });
    (lg.extras || []).forEach((x) => { t.k += +x.k || 0; t.p += +x.p || 0; });
    return t;
  };
  App.adherence = function (date) {
    const lg = App.S.logs[date]; if (!lg || !lg.meals) return null;
    const slots = App.S.mealSlots.filter((s) => s.id !== 'capricho').map((s) => s.id);
    const marked = slots.filter((s) => lg.meals[s] === true).length;
    const any = slots.some((s) => s in lg.meals);
    return any ? marked / slots.length : null;
  };
  App.weekStats = function (w) {
    const [a] = App.weekRange(w); const days = []; for (let i = 0; i < 7; i++) days.push(addDays(a, i));
    const L = (d) => App.S.logs[d] || {};
    const ws = days.map((d) => L(d).w).filter((x) => x != null && x !== '');
    const waist = days.map((d) => (App.S.measures[d] || {}).waist).filter((x) => x != null && x !== '');
    const ad = days.map((d) => App.adherence(d)).filter((x) => x != null);
    return {
      w, from: a, to: days[6], nWeigh: ws.length,
      avgW: avg(ws), waist: waist.length ? +waist[waist.length - 1] : null,
      adherence: ad.length ? avg(ad) : null,
      steps: avg(days.map((d) => L(d).steps)), sleep: avg(days.map((d) => L(d).sleepH)), sleepQ: avg(days.map((d) => L(d).sleepQ)),
      energy: avg(days.map((d) => L(d).energy)), hunger: avg(days.map((d) => L(d).hunger)), stress: avg(days.map((d) => L(d).stress)),
      gym: App.S.workouts.filter((x) => x.date >= a && x.date <= days[6]).length,
      run: App.S.run.sessions.filter((x) => x.date >= a && x.date <= days[6]).length,
      eatOut: days.reduce((sum, d) => { const m = App.menuFor(d); const ml = L(d).meals || {}; return sum + ['almuerzo', 'cena'].filter((k) => m[k] === 'fuera' && ml[k]).length + (L(d).extras || []).filter((x) => x.out).length; }, 0)
    };
  };
  App.startWeight = function () {
    if (App.S.profile.startWeight) return +App.S.profile.startWeight;
    const s = App.S.profile.startDate; const ks = Object.keys(App.S.logs).filter((d) => App.S.logs[d].w && d <= addDays(s, 2)).sort();
    return ks.length ? +App.S.logs[ks[ks.length - 1]].w : null;
  };
  App.weightSeries = function () {
    return Object.keys(App.S.logs).filter((d) => App.S.logs[d].w != null && App.S.logs[d].w !== '').sort().map((d) => [d, +App.S.logs[d].w]);
  };
  App.movingAvg = function (series, n) {
    const out = []; series.forEach(([d], i) => {
      const from = addDays(d, -(n - 1)); const win = series.filter(([dd]) => dd >= from && dd <= d).map((x) => x[1]);
      out.push([d, avg(win)]); void i;
    }); return out;
  };

  /* ---------------- tema ---------------- */
  function hexToRgb(h) { h = (h || '#000').replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  App.hexToRgb = hexToRgb;
  App.themeColors = function () {
    const st = App.S.settings; if (st.useCustom) return st.custom;
    return P.themes.find((t) => t.id === st.theme) || P.themes[0];
  };
  App.applyTheme = function () {
    const st = App.S.settings; const t = App.themeColors(); const r = document.documentElement.style;
    const font = (P.fonts.find((f) => f.id === st.font) || P.fonts[0]).css;
    const [sr, sg, sb] = hexToRgb(t.surface);
    const set = (k, v) => r.setProperty(k, v);
    set('--bg', t.bg); set('--bg2', t.bg2); set('--surface', t.surface); set('--text', t.text); set('--muted', t.muted);
    set('--primary', t.primary); set('--accent', t.accent); set('--danger', t.danger); set('--success', t.success);
    set('--primary-rgb', hexToRgb(t.primary).join(',')); set('--text-rgb', hexToRgb(t.text).join(','));
    set('--card', 'rgba(' + sr + ',' + sg + ',' + sb + ',' + st.cardAlpha + ')');
    set('--card-solid', t.surface);
    set('--blur', st.blur + 'px'); set('--radius', st.radius + 'px'); set('--btn-radius', st.btnRadius + 'px');
    set('--bw', st.borderW + 'px'); set('--shadow-a', st.shadow);
    set('--font', font); set('--fs', st.fontScale); set('--fw', st.fontWeight); set('--hw', st.headWeight);
    set('--ls', st.letter + 'em'); set('--lh', st.lineH);
    set('--grad-angle', st.gradAngle + 'deg'); set('--bg-dim', st.bgDim);
    const b = document.body; if (!b) return;
    b.dataset.mode = t.mode || 'dark'; b.dataset.btn = st.btnStyle; b.dataset.card = st.cardStyle; b.dataset.density = st.density;
    b.dataset.nav = st.navPos; b.dataset.navstyle = st.navStyle; b.dataset.navlabels = st.navLabels ? '1' : '0';
    b.dataset.anim = st.anim ? '1' : '0'; b.dataset.grad = (st.useCustom ? st.gradient : (t.gradient && st.gradient)) ? '1' : '0';
    b.dataset.emoji = st.emojis ? '1' : '0'; b.dataset.bgimg = st.bgImage ? '1' : '0';
    const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.setAttribute('content', t.bg);
    if (st.bgImage) App.idb.get('bgImage').then((url) => { document.getElementById('bgimg').style.backgroundImage = url ? 'url(' + url + ')' : ''; });
  };

  /* ---------------- IndexedDB (fotos, imagen de fondo) ---------------- */
  App.idb = (function () {
    let dbp = null;
    function db() {
      if (dbp) return dbp;
      dbp = new Promise((res, rej) => { const q = indexedDB.open('plan120', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
      return dbp;
    }
    const tx = (mode, fn) => db().then((d) => new Promise((res, rej) => { const t = d.transaction('kv', mode); const s = t.objectStore('kv'); const r = fn(s); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); }));
    return { get: (k) => tx('readonly', (s) => s.get(k)), set: (k, v) => tx('readwrite', (s) => s.put(v, k)), del: (k) => tx('readwrite', (s) => s.delete(k)) };
  })();
  App.compressImage = function (file, max) {
    return new Promise((res, rej) => {
      const fr = new FileReader(); fr.onerror = rej;
      fr.onload = () => { const img = new Image(); img.onload = () => { const sc = Math.min(1, (max || 900) / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.8)); }; img.onerror = rej; img.src = fr.result; };
      fr.readAsDataURL(file);
    });
  };

  /* ---------------- UI: toast, modal, sheet ---------------- */
  App.toast = function (msg, ms) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, ms || 2200);
  };
  App.modal = function (html, opts) {
    opts = opts || {};
    App.closeModal();
    const wrap = document.createElement('div'); wrap.className = 'modal-wrap' + (opts.full ? ' full' : ''); wrap.id = 'modal';
    wrap.innerHTML = '<div class="modal-bg" data-act="closeModal"></div><div class="modal card">' + (opts.title ? '<div class="modal-h"><h3>' + esc(opts.title) + '</h3><button class="icon-btn" data-act="closeModal" aria-label="Cerrar">✕</button></div>' : '') + '<div class="modal-body">' + html + '</div></div>';
    document.body.appendChild(wrap); requestAnimationFrame(() => wrap.classList.add('show'));
    if (opts.onClose) wrap._onClose = opts.onClose;
    return wrap;
  };
  App.closeModal = function () { const m = document.getElementById('modal'); if (m) { if (m._onClose) m._onClose(); m.remove(); } };
  App.act.closeModal = () => App.closeModal();
  App.confirm = function (msg) { return window.confirm(msg); };
  App.haptic = function (ms) { if (App.S.settings.haptics && navigator.vibrate) navigator.vibrate(ms || 15); };

  /* ---------------- sonido y wake lock ---------------- */
  let actx = null;
  App.beep = function (freq, dur, times) {
    if (!App.S.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < (times || 1); i++) {
        const o = actx.createOscillator(); const g = actx.createGain(); const t0 = actx.currentTime + i * (dur + 0.08);
        o.frequency.value = freq || 880; o.type = 'sine'; g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(Math.max(0.001, App.S.settings.volume), t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
      }
    } catch (e) { /* sin audio */ }
  };
  let wl = null;
  App.wake = async function (on) {
    try {
      if (on && App.S.settings.wakeLock && 'wakeLock' in navigator) wl = await navigator.wakeLock.request('screen');
      else if (!on && wl) { await wl.release(); wl = null; }
    } catch (e) { /* no soportado */ }
  };

  /* ---------------- temporizador por fases ---------------- */
  App.Sequencer = function (phases, onTick, onDone) {
    let i = 0, left = phases.length ? phases[0].dur : 0, running = false, last = 0, raf = null;
    const self = { phases, get i() { return i; }, get left() { return left; }, get running() { return running; } };
    function enter(k) { i = k; left = phases[i] ? phases[i].dur : 0; if (phases[i]) { App.beep(phases[i].work ? 990 : 660, 0.18, phases[i].work ? 2 : 1); App.haptic([60, 40, 60]); } }
    function loop(ts) {
      if (!running) return;
      if (!last) last = ts; const dt = (ts - last) / 1000; last = ts; left -= dt;
      if (left <= 3.05 && left > 0 && Math.ceil(left) !== Math.ceil(left + dt)) App.beep(520, 0.08, 1);
      if (left <= 0) { if (i + 1 >= phases.length) { running = false; App.beep(1200, 0.3, 3); onTick(self); onDone && onDone(); return; } enter(i + 1); }
      onTick(self); raf = requestAnimationFrame(loop);
    }
    self.start = () => { if (running) return; running = true; last = 0; App.wake(true); if (i === 0 && left === phases[0].dur) enter(0); raf = requestAnimationFrame(loop); };
    self.pause = () => { running = false; cancelAnimationFrame(raf); onTick(self); };
    self.toggle = () => (running ? self.pause() : self.start());
    self.skip = () => { if (i + 1 < phases.length) { enter(i + 1); onTick(self); } else { left = 0; running = false; onTick(self); onDone && onDone(); } };
    self.back = () => { enter(Math.max(0, i - 1)); onTick(self); };
    self.stop = () => { running = false; cancelAnimationFrame(raf); App.wake(false); };
    self.total = () => phases.reduce((s, p) => s + p.dur, 0);
    self.elapsed = () => phases.slice(0, i).reduce((s, p) => s + p.dur, 0) + (phases[i] ? phases[i].dur - left : 0);
    return self;
  };
  App.mmss = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + pad(s % 60); };

  /* Temporizador de descanso flotante */
  App.restTimer = (function () {
    let end = 0, iv = null, total = 0;
    function render() {
      let el = document.getElementById('rest'); const left = Math.max(0, (end - Date.now()) / 1000);
      document.body.classList.toggle('has-rest', !!end);
      if (!end) { if (el) el.remove(); return; }
      if (!el) { el = document.createElement('div'); el.id = 'rest'; el.className = 'rest card'; document.body.appendChild(el); }
      el.innerHTML = '<div class="rest-bar" style="width:' + (100 * left / total) + '%"></div><span>Descanso</span><b>' + App.mmss(left) + '</b><button class="chip" data-act="restAdd">+30″</button><button class="chip" data-act="restStop">✕</button>';
      if (left <= 0) { App.beep(990, 0.2, 3); App.haptic([200, 100, 200]); stop(); App.toast('¡A por la siguiente serie!'); }
    }
    function stop() { end = 0; clearInterval(iv); iv = null; render(); }
    App.act.restAdd = () => { end += 30000; total += 30; render(); };
    App.act.restStop = () => stop();
    return { start(sec) { total = sec; end = Date.now() + sec * 1000; clearInterval(iv); iv = setInterval(render, 250); render(); }, stop };
  })();

  /* ---------------- gráficas SVG ---------------- */
  App.chart = function (o) {
    const W = o.width || 340, H = o.height || 190, pl = 38, pr = 10, pt = 12, pb = 24;
    const all = []; (o.series || []).forEach((s) => s.points.forEach((p) => all.push(p)));
    (o.band || []).forEach((b) => { all.push([b[0], b[1]]); all.push([b[0], b[2]]); });
    if (!all.length) return '<div class="empty">Sin datos todavía</div>';
    let x0 = Math.min(...all.map((p) => p[0])), x1 = Math.max(...all.map((p) => p[0]));
    let y0 = Math.min(...all.map((p) => p[1])), y1 = Math.max(...all.map((p) => p[1]));
    if (o.yMin != null) y0 = Math.min(y0, o.yMin); if (o.yMax != null) y1 = Math.max(y1, o.yMax);
    if (x1 === x0) { x1 += 1; x0 -= 1; } const yp = (y1 - y0) * 0.08 || 1; y0 -= yp; y1 += yp;
    const X = (x) => pl + (x - x0) / (x1 - x0) * (W - pl - pr); const Y = (y) => pt + (1 - (y - y0) / (y1 - y0)) * (H - pt - pb);
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = y0 + (y1 - y0) * i / 4; const y = Y(v); g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '" class="grid"/><text x="' + (pl - 5) + '" y="' + (y + 3) + '" class="axis" text-anchor="end">' + (o.yFmt ? o.yFmt(v) : v.toFixed(0)) + '</text>'; }
    const nx = o.xTicks || 4; for (let i = 0; i <= nx; i++) { const v = x0 + (x1 - x0) * i / nx; g += '<text x="' + X(v) + '" y="' + (H - 6) + '" class="axis" text-anchor="' + (i === 0 ? 'start' : i === nx ? 'end' : 'middle') + '">' + (o.xFmt ? o.xFmt(v) : v.toFixed(0)) + '</text>'; }
    if (o.band && o.band.length) {
      const up = o.band.map((b) => X(b[0]) + ',' + Y(b[2])).join(' '); const dn = o.band.slice().reverse().map((b) => X(b[0]) + ',' + Y(b[1])).join(' ');
      g += '<polygon points="' + up + ' ' + dn + '" class="band"/>';
    }
    (o.series || []).forEach((s) => {
      if (!s.points.length) return;
      if (s.line !== false && s.points.length > 1) g += '<polyline fill="none" stroke="' + (s.color || 'var(--primary)') + '" stroke-width="' + (s.width || 2.2) + '" stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + ' points="' + s.points.map((p) => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ') + '"/>';
      if (s.dots) s.points.forEach((p) => { g += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="' + (s.r || 2.4) + '" fill="' + (s.color || 'var(--primary)') + '" opacity="' + (s.opacity || 0.55) + '"/>'; });
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img">' + g + '</svg>' + (o.legend ? '<div class="legend">' + o.legend.map((l) => '<span><i style="background:' + l[1] + '"></i>' + esc(l[0]) + '</span>').join('') + '</div>' : '');
  };
  App.ring = function (val, max, label, sub, color) {
    const pct = clamp(max ? val / max : 0, 0, 1.2); const R = 34, C = 2 * Math.PI * R;
    const over = pct > 1.05;
    if (App.S.settings.progressStyle === 'bar') return '<div class="pbar"><div class="pbar-h"><span>' + esc(label) + '</span><b>' + esc(sub) + '</b></div><div class="pbar-t"><div style="width:' + Math.min(100, pct * 100) + '%;background:' + (over ? 'var(--danger)' : color || 'var(--primary)') + '"></div></div></div>';
    return '<div class="ring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="' + R + '" class="ring-bg"/><circle cx="40" cy="40" r="' + R + '" class="ring-fg" style="stroke:' + (over ? 'var(--danger)' : color || 'var(--primary)') + ';stroke-dasharray:' + (C * Math.min(1, pct)).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><div class="ring-t"><b>' + esc(sub) + '</b><span>' + esc(label) + '</span></div></div>';
  };

  /* ---------------- enrutado ---------------- */
  /* Iconos vectoriales minimalistas (trazo, heredan el color del texto) */
  const svg = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  App.svgIcons = {
    hoy: svg('<path d="M12 21.2s-6.4-5.5-6.4-11a6.4 6.4 0 0 1 12.8 0c0 5.5-6.4 11-6.4 11z"/><circle cx="12" cy="10.2" r="2.3"/>'),
    dieta: svg('<path d="M18.6 15.6c-.9 2.6-2.6 5-4.3 5-.9 0-1.4-.5-2.3-.5s-1.4.5-2.3.5c-2.4 0-5.1-4.6-5.1-8.6 0-3.3 2-5.4 4.4-5.4 1.2 0 2.2.6 3 .6s1.8-.6 3-.6c1 0 1.9.3 2.6.9a2.6 2.6 0 0 0-.4 4.2 2.6 2.6 0 0 0 1.4 3.9z"/><path d="M12 7.6V3.8"/><path d="M12.2 5.4c.9-1.7 2.4-2.4 4.3-2.2-.5 1.8-2.1 2.6-4.3 2.2z"/>'),
    entreno: svg('<path d="M8.6 10.2 7.9 7.1A2.3 2.3 0 0 1 10.1 4.3h3.8a2.3 2.3 0 0 1 2.2 2.8l-.7 3.1"/><path d="M7 20.6h10a6.3 6.3 0 1 0-10 0z"/>'),
    carrera: svg('<circle cx="12" cy="13.6" r="7.2"/><path d="M10 2.8h4M12 2.8v3.6M12 13.6l3-3M18.4 6.9l1.4-1.4"/>'),
    progreso: svg('<path d="M12 20V4.5M5.5 11 12 4.5 18.5 11"/>'),
    bienestar: svg('<path d="M5 19.5c0-8.3 5-13.6 14.5-14.5-.8 9.5-6.2 14.5-14.5 14.5z"/><path d="M5 19.5 12.5 12"/>'),
    plan: svg('<path d="M3.5 6.5 9 4.2l6 2.3 5.5-2.3v13.3L15 19.8l-6-2.3-5.5 2.3z"/><path d="M9 4.2v13.3M15 6.5v13.3"/>'),
    ajustes: svg('<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>'),
    mas: svg('<path d="M4 7h16M4 12h16M4 17h16"/>')
  };
  App.tabs = {
    hoy: { name: 'Hoy' }, dieta: { name: 'Dieta' }, entreno: { name: 'Entreno' }, carrera: { name: 'Carrera' }, progreso: { name: 'Progreso' },
    bienestar: { name: 'Bienestar' }, plan: { name: 'Plan 120' }, ajustes: { name: 'Ajustes' }, mas: { name: 'Más' }
  };
  Object.keys(App.tabs).forEach((k) => { App.tabs[k].icon = App.svgIcons[k]; });
  App.route = function () { const h = (location.hash || '#hoy').slice(1).split('/'); return { page: h[0] || 'hoy', sub: h[1] || '' }; };
  App.go = function (page, sub) { location.hash = '#' + page + (sub ? '/' + sub : ''); };
  App.render = function () {
    const r = App.route(); const pg = App.pages[r.page] || App.pages.hoy;
    const main = document.getElementById('main'); const y = window.scrollY; const same = main.dataset.page === r.page + '/' + r.sub;
    try { main.innerHTML = pg.render(r.sub); } catch (e) { console.error(e); main.innerHTML = '<div class="card"><h3>Error</h3><p>' + esc(e.message) + '</p></div>'; }
    main.dataset.page = r.page + '/' + r.sub;
    if (pg.after) try { pg.after(r.sub); } catch (e) { console.error(e); }
    App.renderNav(r.page);
    if (same) window.scrollTo(0, y); else window.scrollTo(0, 0);
  };
  App.rerender = function () { App.render(); };
  App.renderNav = function (cur) {
    const nav = document.getElementById('nav'); const items = App.S.settings.navItems;
    nav.innerHTML = items.map((id) => { const t = App.tabs[id]; if (!t) return ''; const active = cur === id || (id === 'mas' && ['bienestar', 'plan', 'ajustes'].includes(cur) && !items.includes(cur));
      return '<a href="' + (id === 'mas' ? '#' : '#' + id) + '" data-act="' + (id === 'mas' ? 'openMore' : 'nav') + '" class="' + (active ? 'on' : '') + '"><span class="ni">' + t.icon + '</span><span class="nl">' + t.name + '</span></a>'; }).join('');
  };
  App.act.nav = (el, ev) => { App.haptic(8); void ev; };
  App.act.openMore = (el, ev) => {
    if (ev) ev.preventDefault();
    const nav = App.S.settings.navItems;
    const ids = Object.keys(App.tabs).filter((x) => x !== 'mas' && (!nav.includes(x) || ['bienestar', 'plan', 'ajustes'].includes(x)));
    App.modal('<div class="more-grid">' + ids.map((id) => '<a href="#' + id + '" class="more-item" data-act="closeModal"><span>' + App.tabs[id].icon + '</span>' + App.tabs[id].name + '</a>').join('') + '</div><p class="muted small">Elige qué pestañas van en la barra en Ajustes → Navegación.</p>', { title: 'Más' });
  };

  /* ---------------- delegación de eventos ---------------- */
  function findAct(el, attr) { while (el && el !== document) { if (el.dataset && el.dataset[attr]) return el; el = el.parentNode; } return null; }
  document.addEventListener('click', (ev) => {
    const el = findAct(ev.target, 'act'); if (!el) return;
    const fn = App.act[el.dataset.act]; if (!fn) return;
    if (el.tagName === 'A' && el.getAttribute('href') === '#') ev.preventDefault();
    fn(el, ev);
  });
  function bindChange(ev) {
    const el = ev.target; if (!el.dataset) return;
    if (el.dataset.bind) {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (el.dataset.type === 'num' || el.type === 'number' || el.type === 'range') v = v === '' ? null : Number(String(v).replace(',', '.'));
      App.set(el.dataset.bind, v);
      if (el.dataset.out) { const o = document.getElementById(el.dataset.out); if (o) o.textContent = el.value; }
      if (el.dataset.after) (App.act[el.dataset.after] || (() => {}))(el, ev);
      if (el.dataset.theme !== undefined) App.applyTheme();
      if (el.dataset.rr !== undefined && ev.type === 'change') App.rerender();
    } else if (el.dataset.on && App.act[el.dataset.on]) App.act[el.dataset.on](el, ev);
  }
  document.addEventListener('change', bindChange);
  document.addEventListener('input', (ev) => { const el = ev.target; if (el.dataset && (el.type === 'range' || el.type === 'color' || el.dataset.live !== undefined)) bindChange(ev); });

  /* ---------------- helpers de formulario ---------------- */
  App.f = {
    num(label, bind, val, o) { o = o || {}; return '<label class="fld"><span>' + label + '</span><input type="number" inputmode="decimal" step="' + (o.step || 'any') + '" data-bind="' + bind + '" data-type="num" value="' + (val == null ? '' : val) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.rr ? ' data-rr' : '') + (o.after ? ' data-after="' + o.after + '"' : '') + '>' + (o.unit ? '<em>' + o.unit + '</em>' : '') + '</label>'; },
    text(label, bind, val, o) { o = o || {}; return '<label class="fld"><span>' + label + '</span><input type="' + (o.type || 'text') + '" data-bind="' + bind + '" value="' + esc(val == null ? '' : val) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.rr ? ' data-rr' : '') + '></label>'; },
    range(label, bind, val, min, max, step, o) { o = o || {}; const id = 'o' + uid(); return '<label class="fld rng"><span>' + label + ' <output id="' + id + '">' + val + '</output>' + (o.unit || '') + '</span><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-bind="' + bind + '" data-out="' + id + '"' + (o.theme ? ' data-theme' : '') + (o.rr ? ' data-rr' : '') + '></label>'; },
    sel(label, bind, val, opts, o) { o = o || {}; return '<label class="fld"><span>' + label + '</span><select data-bind="' + bind + '"' + (o.theme ? ' data-theme' : '') + (o.rr !== false ? ' data-rr' : '') + '>' + opts.map((x) => '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(val) ? ' selected' : '') + '>' + esc(x[1]) + '</option>').join('') + '</select></label>'; },
    tog(label, bind, val, o) { o = o || {}; return '<label class="tog"><span>' + label + '</span><input type="checkbox" data-bind="' + bind + '"' + (val ? ' checked' : '') + (o.theme ? ' data-theme' : '') + (o.rr ? ' data-rr' : '') + '><i></i></label>'; },
    color(label, bind, val) { return '<label class="fld clr"><span>' + label + '</span><input type="color" data-bind="' + bind + '" value="' + esc(val) + '" data-theme></label>'; },
    scale(label, bind, val, n) { n = n || 5; let s = '<div class="fld"><span>' + label + '</span><div class="scale">'; for (let i = 1; i <= n; i++) s += '<button class="' + (+val === i ? 'on' : '') + '" data-act="setScale" data-path="' + bind + '" data-v="' + i + '">' + i + '</button>'; return s + '</div></div>'; }
  };
  App.act.setScale = (el) => { const cur = App.get(el.dataset.path); App.set(el.dataset.path, +cur === +el.dataset.v ? null : +el.dataset.v); App.haptic(8); App.rerender(); };
  App.seg = function (cur, items, page) { return '<div class="seg">' + items.map((x) => '<a href="#' + page + '/' + x[0] + '" class="' + (cur === x[0] ? 'on' : '') + '">' + x[1] + '</a>').join('') + '</div>'; };
  App.icon = function (e) { return App.S.settings.emojis ? '<span class="emo">' + e + '</span>' : ''; };

  /* ---------------- arranque ---------------- */
  App.boot = function () {
    App.applyTheme();
    window.addEventListener('hashchange', App.render);
    App.render();
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') App.save(true); });
  };
})();
