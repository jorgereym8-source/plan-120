/* Plan 120 · página Dieta */
(function () {
  'use strict';
  const P = window.PLAN, A = window.App, esc = A.esc, num = A.num, f = A.f;
  const SLOTN = () => Object.fromEntries(A.S.mealSlots.map((s) => [s.id, s.name]));

  function macroBox(m) {
    return '<div class="macro4"><div><b>' + Math.round(m.k) + '</b><small>kcal</small></div><div><b>' + Math.round(m.p) + '</b><small>prot</small></div><div><b>' + Math.round(m.c) + '</b><small>carb</small></div><div><b>' + Math.round(m.f) + '</b><small>grasa</small></div>' + (m.fib != null ? '<div><b>' + Math.round(m.fib) + '</b><small>fibra</small></div>' : '') + '</div>';
  }
  A.macroBox = macroBox;
  const foodOpts = (sel) => Object.keys(A.S.foods).sort((a, b) => A.S.foods[a].n.localeCompare(A.S.foods[b].n, 'es')).map((k) => '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(A.S.foods[k].n) + '</option>').join('');

  /* ---------- receta: modal editable ---------- */
  function recipeHTML(r) {
    const m = A.macros(r.ing); const isDefault = P.recipes.some((x) => x.id === r.id);
    return '<div id="rm">' + macroBox(m) + '</div>' +
      '<div class="grid2">' + '<label class="fld"><span>Nombre</span><input data-on="rField" data-f="name" data-r="' + r.id + '" value="' + esc(r.name) + '"></label>' +
      '<label class="fld"><span>Momento</span><select data-on="rField" data-f="slot" data-r="' + r.id + '">' + A.S.mealSlots.map((s) => '<option value="' + s.id + '"' + (s.id === r.slot ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') + '</select></label></div>' +
      '<h4>Ingredientes <small class="muted">(edita los gramos y las macros se recalculan)</small></h4><div class="ings">' +
      r.ing.map((x, i) => { const fd = A.S.foods[x[0]] || { n: x[0] }; const u = fd.unit ? '<small class="muted">≈ ' + num(x[1] / fd.unit, 1) + ' ' + esc(fd.unitN) + '</small>' : ''; return '<div class="ing"><span>' + esc(fd.n) + u + '</span><input type="number" inputmode="decimal" data-live data-on="ingGram" data-r="' + r.id + '" data-i="' + i + '" value="' + x[1] + '"><em>g</em><button class="icon-btn sm" data-act="delIng" data-r="' + r.id + '" data-i="' + i + '">✕</button></div>'; }).join('') + '</div>' +
      '<div class="ing add"><select id="niF">' + foodOpts() + '</select><input id="niG" type="number" inputmode="decimal" placeholder="g"><button class="btn sm" data-act="addIng" data-r="' + r.id + '">Añadir</button></div>' +
      '<h4>Preparación</h4><textarea rows="5" data-on="rSteps" data-r="' + r.id + '">' + esc((r.steps || []).join('\n')) + '</textarea>' +
      '<label class="fld"><span>Etiquetas (separadas por comas)</span><input data-on="rTags" data-r="' + r.id + '" value="' + esc((r.tags || []).join(', ')) + '"></label>' +
      '<div class="row gap wrap"><input id="scK" type="number" inputmode="numeric" placeholder="kcal objetivo" class="inline"><button class="btn sm" data-act="scaleRecipe" data-r="' + r.id + '">Escalar receta</button></div>' +
      '<div class="row gap wrap"><button class="btn ghost sm" data-act="dupRecipe" data-r="' + r.id + '">Duplicar</button>' + (isDefault ? '<button class="btn ghost sm" data-act="restoreRecipe" data-r="' + r.id + '">Restaurar original</button>' : '<button class="btn danger sm" data-act="delRecipe" data-r="' + r.id + '">Eliminar</button>') + '</div>';
  }
  function openRecipe(id) { const r = A.recipe(id); if (!r) return; A.modal(recipeHTML(r), { title: 'Receta', onClose: () => setTimeout(A.rerender, 0) }); }
  function refreshRecipe(id, full) { const r = A.recipe(id); if (!r) return; if (full) { const b = document.querySelector('#modal .modal-body'); if (b) b.innerHTML = recipeHTML(r); } else { const el = document.getElementById('rm'); if (el) el.innerHTML = macroBox(A.macros(r.ing)); } }
  A.act.viewRecipe = (el) => openRecipe(el.dataset.id);
  A.act.ingGram = (el) => { const r = A.recipe(el.dataset.r); r.ing[+el.dataset.i][1] = +String(el.value).replace(',', '.') || 0; A.save(); refreshRecipe(r.id); };
  A.act.delIng = (el) => { const r = A.recipe(el.dataset.r); r.ing.splice(+el.dataset.i, 1); A.save(); refreshRecipe(r.id, true); };
  A.act.addIng = (el) => { const r = A.recipe(el.dataset.r); const g = +document.getElementById('niG').value; if (!g) return A.toast('Indica los gramos'); r.ing.push([document.getElementById('niF').value, g]); A.save(); refreshRecipe(r.id, true); };
  A.act.rField = (el) => { const r = A.recipe(el.dataset.r); r[el.dataset.f] = el.value; A.save(); };
  A.act.rSteps = (el) => { const r = A.recipe(el.dataset.r); r.steps = el.value.split('\n').map((s) => s.trim()).filter(Boolean); A.save(); };
  A.act.rTags = (el) => { const r = A.recipe(el.dataset.r); r.tags = el.value.split(',').map((s) => s.trim()).filter(Boolean); A.save(); };
  A.act.scaleRecipe = (el) => {
    const r = A.recipe(el.dataset.r); const k = +document.getElementById('scK').value; const cur = A.macros(r.ing).k; if (!k || !cur) return A.toast('Indica las kcal objetivo');
    const fct = k / cur; r.ing = r.ing.map(([id, g]) => [id, Math.round(g * fct / (g * fct > 20 ? 5 : 1)) * (g * fct > 20 ? 5 : 1)]); A.save(); refreshRecipe(r.id, true); A.toast('Receta escalada a ≈' + Math.round(A.macros(r.ing).k) + ' kcal');
  };
  A.act.dupRecipe = (el) => { const r = A.clone(A.recipe(el.dataset.r)); r.id = 'u' + A.uid(); r.name += ' (copia)'; delete r.main; A.S.recipes.push(r); A.save(); openRecipe(r.id); };
  A.act.delRecipe = (el) => { if (!A.confirm('¿Eliminar esta receta?')) return; A.S.recipes = A.S.recipes.filter((x) => x.id !== el.dataset.r); A.save(); A.closeModal(); };
  A.act.restoreRecipe = (el) => { const o = P.recipes.find((x) => x.id === el.dataset.r); const i = A.S.recipes.findIndex((x) => x.id === el.dataset.r); A.S.recipes[i] = A.clone(o); A.save(); refreshRecipe(o.id, true); };
  A.act.newRecipe = () => { const slot = A.S.ui.recipeSlot && A.S.ui.recipeSlot !== 'all' ? A.S.ui.recipeSlot : 'cena'; const r = { id: 'u' + A.uid(), slot, name: 'Nueva receta', ing: [], steps: [], tags: ['mía'] }; A.S.recipes.push(r); A.save(); openRecipe(r.id); };
  A.act.recipeSlot = (el) => { A.S.ui.recipeSlot = el.dataset.s; A.save(); A.rerender(); };
  A.act.setMenu = (el) => { A.S.weekMenu[el.dataset.day][el.dataset.slot] = el.value; A.save(); A.rerender(); };
  A.act.resetMenu = () => { if (A.confirm('¿Restaurar el menú semanal por defecto?')) { A.S.weekMenu = A.clone(P.weekMenu); A.save(); A.rerender(); } };
  A.act.recipeSearch = (el) => { A.S.ui.recipeQ = el.value; A.save(); const list = document.getElementById('rlist'); if (list) list.innerHTML = recipeList(); };

  /* ---------- lista de la compra ---------- */
  function shoppingAgg() {
    const sh = A.S.shopping; const tot = {};
    P.days.forEach((dk) => {
      const menu = A.S.weekMenu[dk] || {};
      Object.keys(menu).forEach((slot) => {
        const id = menu[slot]; if (!id || id === 'fuera') return; const r = A.recipe(id); if (!r) return;
        const mult = (slot === 'cena' && sh.dinnerX2) ? 2 : 1;
        r.ing.forEach(([fid, g]) => { tot[fid] = (tot[fid] || 0) + g * mult * (sh.weeks || 1); });
      });
    });
    return tot;
  }
  A.shoppingAgg = shoppingAgg;
  A.act.shopCheck = (el) => { const k = el.dataset.k; A.S.shopping.checked[k] = !A.S.shopping.checked[k]; A.haptic(8); A.save(); A.rerender(); };
  A.act.shopClear = () => { A.S.shopping.checked = {}; A.S.shopping.extras.forEach((x) => { x.done = false; }); A.save(); A.rerender(); };
  A.act.shopAdd = () => { const n = document.getElementById('shN').value.trim(); if (!n) return; A.S.shopping.extras.push({ n, done: false }); A.save(); A.rerender(); };
  A.act.shopExtra = (el) => { const x = A.S.shopping.extras[+el.dataset.i]; x.done = !x.done; A.save(); A.rerender(); };
  A.act.shopDel = (el) => { A.S.shopping.extras.splice(+el.dataset.i, 1); A.save(); A.rerender(); };
  A.act.shopShare = () => {
    const agg = shoppingAgg(); const lines = [];
    const bySec = {}; Object.keys(agg).forEach((k) => { const fd = A.S.foods[k]; if (!fd) return; (bySec[fd.sec] = bySec[fd.sec] || []).push(k); });
    Object.keys(bySec).sort().forEach((s) => { lines.push('— ' + s); bySec[s].forEach((k) => { if (A.S.shopping.checked[k]) return; const fd = A.S.foods[k]; const n = Math.max(1, Math.ceil(agg[k] / fd.pack - 0.15)); lines.push('• ' + fd.n + ': ' + n + ' × ' + fd.packN); }); });
    A.S.shopping.extras.filter((x) => !x.done).forEach((x) => lines.push('• ' + x.n));
    const txt = 'Lista de la compra · Plan 120\n' + lines.join('\n');
    if (navigator.share) navigator.share({ text: txt }).catch(() => {}); else navigator.clipboard.writeText(txt).then(() => A.toast('Lista copiada'));
  };
  const BASICS = ['Especias: pimentón, orégano, comino, curry, ajo en polvo, sazonador fajitas', 'Limones', 'Café / infusiones', 'Agua con gas', 'Refrescos zero / Nestea zero', 'Caldo de verduras o pollo', 'Vinagre y sal', 'Spray de aceite (opcional)', 'Edulcorante / canela / cacao puro'];

  /* ---------- alimentos ---------- */
  A.act.editFood = (el) => {
    const id = el.dataset.id; const fd = A.S.foods[id] || { n: '', k: 0, p: 0, c: 0, f: 0, fib: 0, sec: 'Despensa', pack: 500, packN: 'envase', price: 0 };
    const fl = (k, l, t) => '<label class="fld"><span>' + l + '</span><input id="fd_' + k + '" ' + (t ? 'type="number" inputmode="decimal" step="any"' : '') + ' value="' + esc(fd[k] == null ? '' : fd[k]) + '"></label>';
    A.modal('<p class="muted small">Valores por 100 g o 100 ml (copia la etiqueta).</p>' + fl('n', 'Nombre') + '<div class="grid2">' + fl('k', 'kcal', 1) + fl('p', 'Proteína', 1) + fl('c', 'Carbohidratos', 1) + fl('f', 'Grasa', 1) + fl('fib', 'Fibra', 1) + fl('sec', 'Sección del súper') + fl('pack', 'Tamaño envase (g)', 1) + fl('packN', 'Nombre envase') + fl('price', 'Precio aprox. €', 1) + '</div>' +
      '<div class="row gap"><button class="btn" data-act="saveFood" data-id="' + (A.S.foods[id] ? id : '') + '">Guardar</button>' + (A.S.foods[id] && !P.foods[id] ? '<button class="btn danger" data-act="delFood" data-id="' + id + '">Eliminar</button>' : '') + (P.foods[id] ? '<button class="btn ghost" data-act="restoreFood" data-id="' + id + '">Restaurar</button>' : '') + '</div>', { title: A.S.foods[id] ? 'Editar alimento' : 'Nuevo alimento' });
  };
  A.act.saveFood = (el) => {
    const id = el.dataset.id || ('f' + A.uid()); const g = (k) => document.getElementById('fd_' + k).value; const n = (k) => +String(g(k)).replace(',', '.') || 0;
    A.S.foods[id] = Object.assign({}, A.S.foods[id] || {}, { n: g('n') || 'Alimento', k: n('k'), p: n('p'), c: n('c'), f: n('f'), fib: n('fib'), sec: g('sec') || 'Despensa', pack: n('pack') || 100, packN: g('packN') || 'envase', price: n('price') });
    A.save(); A.closeModal(); A.rerender(); A.toast('Guardado');
  };
  A.act.delFood = (el) => { if (!A.confirm('¿Eliminar alimento?')) return; delete A.S.foods[el.dataset.id]; A.save(); A.closeModal(); A.rerender(); };
  A.act.restoreFood = (el) => { A.S.foods[el.dataset.id] = A.clone(P.foods[el.dataset.id]); A.save(); A.closeModal(); A.rerender(); };
  A.act.foodSearch = (el) => { A.S.ui.foodQ = el.value; const l = document.getElementById('flist'); if (l) l.innerHTML = foodList(); };

  /* ---------- objetivos ---------- */
  A.act.applyCalc = (el) => {
    const k = +el.dataset.k; A.S.targetHistory.push({ date: A.today(), from: A.S.targets.kcal, to: k, why: 'Calculadora' });
    A.S.targets.kcal = k; A.S.targets.kcalMin = k - 100; A.S.targets.kcalMax = k + 100; A.save(); A.rerender(); A.toast('Objetivo: ' + k + ' kcal');
  };
  A.act.slotField = (el) => { const s = A.S.mealSlots.find((x) => x.id === el.dataset.s); s[el.dataset.f] = el.dataset.f === 'time' || el.dataset.f === 'name' ? el.value : +el.value; A.save(); };

  function latestWeight() { const ser = A.weightSeries(); if (!ser.length) return A.startWeight(); const ma = A.movingAvg(ser, 7); return ma[ma.length - 1][1]; }
  A.latestWeight = latestWeight;

  function recipeList() {
    const slot = A.S.ui.recipeSlot || 'all'; const q = (A.S.ui.recipeQ || '').toLowerCase();
    const list = A.S.recipes.filter((r) => (slot === 'all' || r.slot === slot) && (!q || (r.name + ' ' + (r.tags || []).join(' ')).toLowerCase().includes(q)));
    const SN = SLOTN();
    return list.map((r) => { const m = A.macros(r.ing); return '<div class="card recipe" data-act="viewRecipe" data-id="' + r.id + '"><div><small>' + esc(SN[r.slot] || r.slot) + (r.prep != null ? ' · ' + r.prep + ' min' : '') + (r.main ? ' · principal' : '') + '</small><b>' + esc(r.name) + '</b><div class="tags">' + (r.tags || []).map((t) => '<span>' + esc(t) + '</span>').join('') + '</div></div><div class="rk"><b>' + Math.round(m.k) + '</b><small>kcal</small><b>' + Math.round(m.p) + '</b><small>prot</small></div></div>'; }).join('') || '<p class="muted center">No hay recetas con ese filtro.</p>';
  }
  function foodList() {
    const q = (A.S.ui.foodQ || '').toLowerCase();
    return Object.keys(A.S.foods).filter((k) => !q || A.S.foods[k].n.toLowerCase().includes(q)).sort((a, b) => A.S.foods[a].n.localeCompare(A.S.foods[b].n, 'es')).map((k) => { const x = A.S.foods[k]; return '<div class="row food" data-act="editFood" data-id="' + k + '"><span>' + esc(x.n) + '<small class="muted"> · ' + esc(x.sec) + '</small></span><span class="small">' + x.k + ' kcal · ' + x.p + ' P · ' + x.c + ' C · ' + x.f + ' G</span></div>'; }).join('');
  }

  A.pages.dieta = {
    render(sub) {
      sub = sub || 'semana'; const S = A.S; const T = S.targets; let h = '<h2 class="ptitle">' + A.icon('🥗') + 'Dieta</h2>';
      h += A.seg(sub, [['semana', 'Menú'], ['recetas', 'Recetas'], ['compra', 'Compra'], ['objetivos', 'Objetivos'], ['alimentos', 'Alimentos']], 'dieta');
      const SN = SLOTN();

      if (sub === 'semana') {
        let wk = { k: 0, p: 0, c: 0, f: 0 };
        const cards = P.days.map((dk) => {
          const menu = S.weekMenu[dk] || {}; const t = { k: 0, p: 0, c: 0, f: 0 };
          const rows = S.mealSlots.map((s) => {
            const id = menu[s.id]; const m = A.recipeMacros(id); ['k', 'p', 'c', 'f'].forEach((x) => { t[x] += m[x] || 0; });
            const opts = S.recipes.filter((r) => r.slot === s.id).map((r) => '<option value="' + r.id + '"' + (r.id === id ? ' selected' : '') + '>' + esc(r.name) + '</option>').join('') + ((s.id === 'almuerzo' || s.id === 'cena') ? '<option value="fuera"' + (id === 'fuera' ? ' selected' : '') + '>🍽️ Comida fuera (≈750 kcal)</option>' : '') + '<option value=""' + (!id ? ' selected' : '') + '>— nada —</option>';
            return '<div class="mrow"><small>' + esc(s.name) + '</small><div class="mrow-s"><select data-on="setMenu" data-day="' + dk + '" data-slot="' + s.id + '">' + opts + '</select>' + (id && id !== 'fuera' ? '<button class="icon-btn sm" data-act="viewRecipe" data-id="' + id + '">i</button>' : '') + '</div><span class="muted small">' + Math.round(m.k || 0) + ' kcal · ' + Math.round(m.p || 0) + ' P</span></div>';
          }).join('');
          ['k', 'p', 'c', 'f'].forEach((x) => { wk[x] += t[x] / 7; });
          const ok = t.k >= T.kcalMin - 50 && t.k <= T.kcalMax + 150;
          return '<div class="card"><div class="card-h"><h3>' + P.dayNames[dk] + '</h3><span class="pill ' + (ok ? '' : 'warn') + '">' + Math.round(t.k) + ' kcal · ' + Math.round(t.p) + ' P' + (S.settings.showMacrosCarbFat ? ' · ' + Math.round(t.c) + ' C · ' + Math.round(t.f) + ' G' : '') + '</span></div>' + rows + '</div>';
        }).join('');
        h += '<div class="card"><h3>Media de la semana</h3>' + macroBox(wk) + '<p class="muted small">Objetivo: ' + num(T.kcalMin) + '–' + num(T.kcalMax) + ' kcal · ' + T.proteinMin + '–' + T.proteinMax + ' g de proteína. Un día por encima se compensa con la media, no con ayunos.</p><div class="row gap"><a class="btn sm" href="#dieta/compra">Lista de la compra</a><button class="btn ghost sm" data-act="resetMenu">Restaurar menú</button></div></div>' + cards;
        h += '<div class="card"><h3>Batch cooking (domingo, ~60–75 min)</h3><ul class="ticks"><li>Horno: bandeja de muslitos con papas (tápers de jueves y domingo).</li><li>Fuego: arroz para 3 tápers + solomillo de cerdo/pollo a la plancha.</li><li>Olla: potaje (cena del lunes + 1–2 raciones).</li><li>Cuece 6–8 huevos. Prepara 2–3 tarros de overnight oats.</li><li>Miércoles por la noche: segunda tanda rápida (ñoquis o pasta rellena).</li></ul></div>';
      }

      else if (sub === 'recetas') {
        const slot = S.ui.recipeSlot || 'all';
        h += '<div class="chips scroll">' + [['all', 'Todas']].concat(S.mealSlots.map((s) => [s.id, s.name])).map((x) => '<button class="chip ' + (slot === x[0] ? 'on' : '') + '" data-act="recipeSlot" data-s="' + x[0] + '">' + esc(x[1]) + '</button>').join('') + '</div>';
        h += '<div class="row gap"><input class="search" placeholder="Buscar receta o etiqueta…" value="' + esc(S.ui.recipeQ || '') + '" data-live data-on="recipeSearch"><button class="btn sm" data-act="newRecipe">+ Nueva</button></div>';
        h += '<div id="rlist">' + recipeList() + '</div>';
        h += '<div class="card"><h3>Snacks ricos en proteína (≈150–250 kcal)</h3><ul class="ticks"><li>2 yogures proteicos (≈150 kcal · 23 g)</li><li>Skyr/queso batido 200 g + fruta (≈175 kcal · 21 g)</li><li>Pollo mechado 100 g + fruta (≈220 kcal · 24 g)</li><li>Sándwich de pavo y queso light (≈220 kcal · 20 g)</li><li>Lata de atún al natural + 1 rebanada (≈150 kcal · 18 g)</li><li>Batido: 300 ml de leche desnatada + 25 g de whey (≈200 kcal · 30 g)</li><li>2 huevos cocidos + fruta (≈250 kcal · 16 g)</li><li>Postre de skyr con cacao puro y canela (≈120 kcal · 20 g)</li></ul></div>';
        h += '<div class="card"><h3>Antes y después de entrenar</h3><ul class="ticks"><li><b>60–90 min antes:</b> plátano + 2 yogures proteicos, tostada de pavo con miel o el batido de leche y plátano.</li><li><b>Si entrenas justo al salir:</b> la merienda a las 17:00 y un plátano en el coche/tranvía.</li><li><b>Después:</b> la cena ES tu comida post-entreno (40–50 g de proteína + carbohidrato). No necesitas batido salvo que cenes más de 2 h después.</li><li><b>Durante:</b> solo agua (500–750 ml).</li></ul></div>';
      }

      else if (sub === 'compra') {
        const sh = S.shopping; const agg = shoppingAgg(); const bySec = {}; let total = 0;
        Object.keys(agg).forEach((k) => { const fd = S.foods[k]; if (!fd) return; (bySec[fd.sec] = bySec[fd.sec] || []).push(k); });
        h += '<div class="card"><div class="grid2">' + f.sel('Semanas', 'shopping.weeks', sh.weeks, [[1, '1 semana'], [2, '2 semanas']]) + '<div>' + f.tog('Cenas ×2 (con Nati)', 'shopping.dinnerX2', sh.dinnerX2, { rr: true }) + f.tog('Mostrar básicos', 'shopping.basics', sh.basics, { rr: true }) + '</div></div><p class="muted small">Calculada a partir de tu menú semanal. Cambia el menú y la lista se actualiza sola. Precios aproximados (Mercadona/HiperDino).</p><div class="row gap"><button class="btn sm" data-act="shopShare">Compartir / copiar</button><button class="btn ghost sm" data-act="shopClear">Desmarcar todo</button></div></div>';
        Object.keys(bySec).sort().forEach((sec) => {
          h += '<div class="card"><h3>' + esc(sec) + '</h3>' + bySec[sec].sort((a, b) => S.foods[a].n.localeCompare(S.foods[b].n, 'es')).map((k) => {
            const fd = S.foods[k]; const n = Math.max(1, Math.ceil(agg[k] / fd.pack - 0.15)); const cost = n * (fd.price || 0); total += cost; const on = sh.checked[k];
            const g = agg[k] >= 1000 ? num(agg[k] / 1000, 1) + ' kg' : Math.round(agg[k]) + ' g';
            return '<button class="checkrow ' + (on ? 'on' : '') + '" data-act="shopCheck" data-k="' + k + '"><i>' + (on ? '✓' : '') + '</i><span><b>' + esc(fd.n) + '</b><small class="muted">' + g + ' → ' + n + ' × ' + esc(fd.packN) + '</small></span><em>' + num(cost, 2) + ' €</em></button>';
          }).join('') + '</div>';
        });
        h += '<div class="card"><div class="card-h"><h3>Total estimado</h3><b>' + num(total, 0) + ' €</b></div><p class="muted small">Incluye las raciones de Nati en las cenas si tienes activado "Cenas ×2". Lo que sobra (aceite, miel, avena…) dura varias semanas.</p></div>';
        if (sh.basics) h += '<div class="card"><h3>Básicos de despensa</h3>' + BASICS.map((b, i) => { const k = 'b' + i; const on = sh.checked[k]; return '<button class="checkrow ' + (on ? 'on' : '') + '" data-act="shopCheck" data-k="' + k + '"><i>' + (on ? '✓' : '') + '</i>' + esc(b) + '</button>'; }).join('') + '</div>';
        h += '<div class="card"><h3>Extras</h3>' + sh.extras.map((x, i) => '<div class="checkrow ' + (x.done ? 'on' : '') + '"><i data-act="shopExtra" data-i="' + i + '">' + (x.done ? '✓' : '') + '</i><span data-act="shopExtra" data-i="' + i + '">' + esc(x.n) + '</span><button class="icon-btn sm" data-act="shopDel" data-i="' + i + '">✕</button></div>').join('') + '<div class="row gap"><input id="shN" placeholder="Añadir producto"><button class="btn sm" data-act="shopAdd">+</button></div></div>';
        h += '<div class="card"><h3>Cambios inteligentes respecto a tus tickets</h3><ul class="ticks"><li>Coca-Cola en lata → Coca-Cola Zero (la normal, como capricho pactado).</li><li>Zumo de naranja diario → fruta entera o 1 vaso como capricho.</li><li>Cereales bolitas de miel → avena o Weetabix pesados.</li><li>Salsas 4 quesos/cheddar → salsa de yogur, tomate o mojo medido.</li><li>Pizza precocinada entera → pizza casera o media pizza + pollo + ensalada.</li><li>Lasaña de bolsa → ñoquis/pasta rellena con pollo (más proteína).</li><li>Barquetas de ensalada: buena opción de emergencia + 100 g de pollo extra.</li><li>Mantén: yogures proteicos, leche desnatada, pollo mechado, huevos, salmorejo, frutos rojos y mango congelados.</li></ul></div>';
      }

      else if (sub === 'objetivos') {
        const lw = latestWeight(); const pr = S.profile;
        const bmr = lw ? 10 * lw + 6.25 * pr.height - 5 * pr.age + (pr.sex === 'm' ? -161 : 5) : null;
        const fct = +pr.activity || 1.4;
        h += '<div class="card"><h3>Objetivos diarios</h3><div class="grid2">' + f.num('Calorías objetivo', 'targets.kcal', T.kcal, { unit: 'kcal', rr: true }) + f.num('Mínimo', 'targets.kcalMin', T.kcalMin, { unit: 'kcal', rr: true }) + f.num('Máximo', 'targets.kcalMax', T.kcalMax, { unit: 'kcal', rr: true }) + f.num('Proteína', 'targets.protein', T.protein, { unit: 'g', rr: true }) + f.num('Grasa', 'targets.fat', T.fat, { unit: 'g', rr: true }) + f.num('Fibra', 'targets.fiber', T.fiber, { unit: 'g' }) + f.num('Agua', 'targets.water', T.water, { unit: 'L', step: '0.25', rr: true }) + f.num('Pasos', 'targets.steps', T.steps, { step: '500', rr: true }) + f.num('Sueño', 'targets.sleep', T.sleep, { unit: 'h', step: '0.25' }) + f.num('Capricho', 'targets.treatKcal', T.treatKcal, { unit: 'kcal' }) + '</div>' +
          '<div class="sub-card">Carbohidratos resultantes: <b>' + Math.max(0, Math.round((T.kcal - T.protein * 4 - T.fat * 9) / 4)) + ' g</b> (lo que queda tras proteína y grasa)</div></div>';
        h += '<div class="card"><h3>Calculadora de mantenimiento</h3>' + (bmr ? '<div class="grid2">' + f.sel('Actividad', 'profile.activity', fct, [[1.3, 'Muy baja (1,3)'], [1.4, 'Baja: oficina + algo de paseo (1,4)'], [1.5, 'Moderada: 8–10k pasos + 2 gym (1,5)'], [1.6, 'Alta (1,6)']]) + '<div class="kv"><span>Peso usado</span><b>' + num(lw, 1) + ' kg</b><span>Metabolismo basal (Mifflin)</span><b>' + num(bmr) + ' kcal</b><span>Mantenimiento estimado</span><b>' + num(bmr * fct - 150) + '–' + num(bmr * fct + 150) + ' kcal</b></div></div>' +
          '<p class="muted small">Es una estimación: tu mantenimiento real lo dirá la tendencia del peso tras 2–3 semanas. Déficit recomendado: 15–25 %.</p><div class="row gap wrap">' + [0.8, 0.85, 0.75].map((x) => { const k = Math.round(bmr * fct * x / 50) * 50; return '<button class="btn ghost sm" data-act="applyCalc" data-k="' + k + '">−' + Math.round((1 - x) * 100) + ' % → ' + num(k) + ' kcal</button>'; }).join('') + '</div>' : '<p class="muted">Registra tu peso (o importa tus datos) para calcularlo.</p>') + '</div>';
        h += '<div class="card"><h3>Reparto por comidas</h3>' + S.mealSlots.map((s) => '<div class="slotrow"><input value="' + esc(s.name) + '" data-on="slotField" data-s="' + s.id + '" data-f="name"><input type="time" value="' + (s.time !== 'libre' ? s.time : '') + '" data-on="slotField" data-s="' + s.id + '" data-f="time"><input type="number" value="' + s.kcal + '" data-on="slotField" data-s="' + s.id + '" data-f="kcal"><em>kcal</em></div>').join('') + '</div>';
        if (S.targetHistory.length) h += '<div class="card"><h3>Historial de ajustes</h3>' + S.targetHistory.slice().reverse().map((x) => '<div class="row"><span>' + A.fmtDate(x.date, true) + '</span><b>' + x.from + ' → ' + x.to + ' kcal</b><small class="muted">' + esc(x.why || '') + '</small></div>').join('') + '</div>';
        h += '<div class="card"><h3>Por qué estos números</h3><ul class="ticks"><li><b>Mantenimiento ≈ 2.550–2.850 kcal:</b> fórmula de Mifflin-St Jeor con un factor de actividad de 1,3–1,4, contrastada con tu peso estable de 2025. La bioimpedancia daba 2.181, pero se queda corta.</li><li><b>Déficit ≈ 500 kcal (≈ 20 %):</b> suficiente para perder ≈ 0,5–0,8 kg/semana sin comprometer el entrenamiento ni el hambre.</li><li><b>Proteína 160–185 g:</b> ≈ 1,6–2,2 g/kg de tu peso objetivo aproximado. Protege el músculo en déficit y sacia.</li><li><b>Grasa ≥ 55 g:</b> mínimo para hormonas y saciedad. <b>Carbohidratos:</b> el resto, para rendir en el gimnasio.</li></ul></div>';
      }

      else if (sub === 'alimentos') {
        h += '<div class="row gap"><input class="search" placeholder="Buscar alimento…" value="' + esc(S.ui.foodQ || '') + '" data-live data-on="foodSearch"><button class="btn sm" data-act="editFood" data-id="">+ Nuevo</button></div><div class="card" id="flist">' + foodList() + '</div>';
      }
      void SN;
      return h;
    }
  };
})();
