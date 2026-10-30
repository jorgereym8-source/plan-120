/* =========================================================
   Plan 120 · Datos por defecto del plan
   (sin datos personales: el peso, la cintura y el historial
   se importan dentro de la app y se guardan solo en el móvil)
   ========================================================= */
(function (root) {
  'use strict';

  /* ---------- Alimentos (valores por 100 g / 100 ml, aprox. de etiqueta) ----------
     k kcal · p proteína · c carbohidratos · f grasa · fib fibra
     sec sección del súper · pack tamaño del envase (g/ml) · packN nombre · price € aprox. */
  const foods = {
    skyr:        { n: 'Queso batido 0% / skyr natural', k: 55, p: 10, c: 3.8, f: 0.2, fib: 0, sec: 'Lácteos y huevos', pack: 500, packN: 'tarrina 500 g', price: 1.7 },
    yopro:       { n: 'Yogur proteico (YoPro, Danone/Kaiku/Hacendado +Proteínas)', k: 62, p: 9.5, c: 5, f: 0.2, fib: 0, sec: 'Lácteos y huevos', pack: 480, packN: 'pack 4 × 120 g', price: 2.5 },
    leche:       { n: 'Leche desnatada', k: 35, p: 3.4, c: 4.9, f: 0.1, fib: 0, sec: 'Lácteos y huevos', pack: 1000, packN: 'brik 1 L', price: 0.95 },
    yogurnat:    { n: 'Yogur natural desnatado', k: 40, p: 4.5, c: 5.5, f: 0.1, fib: 0, sec: 'Lácteos y huevos', pack: 500, packN: 'pack 4 × 125 g', price: 0.9 },
    huevo:       { n: 'Huevos L (≈60 g sin cáscara)', k: 143, p: 12.6, c: 0.7, f: 9.5, fib: 0, sec: 'Lácteos y huevos', pack: 720, packN: 'docena', price: 3.2, unit: 60, unitN: 'huevo' },
    claras:      { n: 'Claras de huevo pasteurizadas', k: 48, p: 11, c: 0.7, f: 0.2, fib: 0, sec: 'Lácteos y huevos', pack: 500, packN: 'brik 500 ml', price: 1.9 },
    quesolight:  { n: 'Queso en lonchas light', k: 260, p: 28, c: 1, f: 16, fib: 0, sec: 'Lácteos y huevos', pack: 200, packN: 'paquete 200 g', price: 1.9 },
    mozzarella:  { n: 'Mozzarella light (rallada o en bola)', k: 165, p: 20, c: 2, f: 9, fib: 0, sec: 'Lácteos y huevos', pack: 200, packN: 'bolsa 200 g', price: 1.9 },
    quesorallado:{ n: 'Queso rallado curado/parmesano', k: 390, p: 28, c: 1, f: 30, fib: 0, sec: 'Lácteos y huevos', pack: 100, packN: 'bolsa 100 g', price: 1.6 },

    pollo:       { n: 'Solomillo / pechuga de pollo (crudo)', k: 110, p: 23, c: 0, f: 1.5, fib: 0, sec: 'Carne y pescado', pack: 1000, packN: 'bandeja ≈1 kg', price: 7.5 },
    muslos:      { n: 'Muslitos/jamoncitos de pollo sin piel (parte comestible)', k: 125, p: 19, c: 0, f: 5.5, fib: 0, sec: 'Carne y pescado', pack: 700, packN: 'bandeja ≈1 kg (con hueso)', price: 3.5 },
    cerdo:       { n: 'Solomillo de cerdo (crudo)', k: 120, p: 21, c: 0, f: 4, fib: 0, sec: 'Carne y pescado', pack: 1000, packN: '2 solomillos ≈1 kg', price: 7 },
    pollomechado:{ n: 'Pollo mechado / pechuguita asada lista', k: 140, p: 23, c: 2, f: 4.5, fib: 0, sec: 'Carne y pescado', pack: 250, packN: 'bandeja 250 g', price: 3.65 },
    kebab:       { n: 'Relleno kebab de pollo', k: 165, p: 20, c: 3, f: 8, fib: 0, sec: 'Carne y pescado', pack: 300, packN: 'bandeja 300 g', price: 3.15 },
    pavo:        { n: 'Pechuga de pavo en lonchas', k: 100, p: 18, c: 2, f: 2, fib: 0, sec: 'Carne y pescado', pack: 250, packN: 'paquete 250 g', price: 2.4 },
    jamon:       { n: 'Jamón serrano', k: 240, p: 31, c: 0, f: 13, fib: 0, sec: 'Carne y pescado', pack: 100, packN: 'sobre 100 g', price: 2.25 },
    atun:        { n: 'Atún al natural (escurrido)', k: 110, p: 25, c: 0, f: 1, fib: 0, sec: 'Despensa', pack: 168, packN: 'pack 3 latas', price: 2.8 },
    merluza:     { n: 'Merluza / pescado blanco congelado', k: 75, p: 17, c: 0, f: 0.8, fib: 0, sec: 'Congelados', pack: 800, packN: 'bolsa ≈800 g', price: 6 },

    avena:       { n: 'Copos de avena', k: 372, p: 13.5, c: 59, f: 7, fib: 10, sec: 'Despensa', pack: 500, packN: 'bolsa 500 g', price: 0.95 },
    weetabix:    { n: 'Weetabix minis chocolate', k: 375, p: 10, c: 67, f: 5, fib: 9, sec: 'Despensa', pack: 500, packN: 'caja 500 g', price: 4.19 },
    granola:     { n: 'Granola', k: 450, p: 9, c: 64, f: 16, fib: 7, sec: 'Despensa', pack: 375, packN: 'bolsa 375 g', price: 2.2 },
    pb:          { n: 'Crema de cacahuete', k: 610, p: 26, c: 12, f: 50, fib: 7, sec: 'Despensa', pack: 350, packN: 'tarro 350 g', price: 1.8 },
    miel:        { n: 'Miel', k: 320, p: 0.3, c: 80, f: 0, fib: 0, sec: 'Despensa', pack: 500, packN: 'bote 500 g', price: 3.5 },
    arroz:       { n: 'Arroz (crudo)', k: 350, p: 7, c: 78, f: 0.6, fib: 1, sec: 'Despensa', pack: 1000, packN: 'paquete 1 kg', price: 1.3 },
    pasta:       { n: 'Pasta seca', k: 355, p: 12.5, c: 71, f: 1.5, fib: 3, sec: 'Despensa', pack: 500, packN: 'paquete 500 g', price: 0.9 },
    garbanzos:   { n: 'Garbanzos cocidos (escurridos)', k: 120, p: 7, c: 16, f: 2.5, fib: 5, sec: 'Despensa', pack: 400, packN: 'bote (400 g escurrido)', price: 0.9 },
    lentejas:    { n: 'Lentejas cocidas (escurridas)', k: 100, p: 7.5, c: 13, f: 0.5, fib: 5, sec: 'Despensa', pack: 400, packN: 'bote (400 g escurrido)', price: 0.9 },
    maiz:        { n: 'Maíz dulce', k: 86, p: 2.7, c: 16, f: 1.2, fib: 2, sec: 'Despensa', pack: 140, packN: 'lata 140 g', price: 0.7 },
    tomatetri:   { n: 'Tomate triturado', k: 25, p: 1.3, c: 4, f: 0.2, fib: 1.5, sec: 'Despensa', pack: 400, packN: 'bote 400 g', price: 0.7 },
    aceite:      { n: 'Aceite de oliva virgen extra', k: 900, p: 0, c: 0, f: 100, fib: 0, sec: 'Despensa', pack: 1000, packN: 'botella 1 L', price: 7 },
    palomitas:   { n: 'Maíz para palomitas (grano)', k: 375, p: 11, c: 64, f: 4.5, fib: 14, sec: 'Despensa', pack: 500, packN: 'bolsa 500 g', price: 1.2 },
    whey:        { n: 'Proteína whey (opcional)', k: 380, p: 78, c: 7, f: 6, fib: 0, sec: 'Despensa', pack: 1000, packN: 'bote 1 kg', price: 25 },
    choco85:     { n: 'Chocolate negro 85%', k: 590, p: 11, c: 19, f: 50, fib: 13, sec: 'Despensa', pack: 100, packN: 'tableta 100 g', price: 1.6 },
    nocilla:     { n: 'Nocilla / Nutella', k: 540, p: 5, c: 58, f: 31, fib: 2, sec: 'Despensa', pack: 400, packN: 'tarro', price: 3 },
    pikotas:     { n: 'Caramelos de goma (tipo Pikotas)', k: 350, p: 4, c: 82, f: 0.3, fib: 0, sec: 'Despensa', pack: 100, packN: 'bolsa 100 g', price: 1.44 },
    minirelleno: { n: 'Mini bizcocho relleno de leche (1 ud ≈ 30 g)', k: 430, p: 6, c: 52, f: 21, fib: 1, sec: 'Panadería', pack: 180, packN: 'paquete', price: 1.95, unit: 30, unitN: 'unidad' },
    cola:        { n: 'Coca-Cola normal', k: 42, p: 0, c: 10.6, f: 0, fib: 0, sec: 'Bebidas', pack: 330, packN: 'lata 330 ml', price: 0.91 },
    zumo:        { n: 'Zumo de naranja', k: 45, p: 0.7, c: 10, f: 0, fib: 0.3, sec: 'Bebidas', pack: 1000, packN: 'botella 1 L', price: 1.79 },

    pan:         { n: 'Pan integral de molde', k: 245, p: 10, c: 41, f: 3.5, fib: 6, sec: 'Panadería', pack: 450, packN: 'paquete 450 g', price: 1.3, unit: 30, unitN: 'rebanada' },
    tortilla:    { n: 'Tortillas de trigo (1 ud ≈ 40 g)', k: 300, p: 8.5, c: 50, f: 7.5, fib: 3, sec: 'Panadería', pack: 320, packN: 'paquete 8 uds', price: 1.2, unit: 40, unitN: 'tortilla' },
    masapizza:   { n: 'Masa de pizza fina refrigerada', k: 280, p: 8.5, c: 50, f: 5, fib: 2, sec: 'Panadería', pack: 260, packN: 'rollo 260 g', price: 1.4 },

    platano:     { n: 'Plátano de Canarias (pelado)', k: 90, p: 1.1, c: 21, f: 0.3, fib: 2.5, sec: 'Fruta y verdura', pack: 1000, packN: 'kg', price: 1.9, unit: 120, unitN: 'plátano' },
    fruta:       { n: 'Fruta de temporada (pera, manzana, naranja, kiwi…)', k: 55, p: 0.5, c: 13, f: 0.2, fib: 2.5, sec: 'Fruta y verdura', pack: 1000, packN: 'kg', price: 2.2, unit: 150, unitN: 'pieza' },
    frutosrojos: { n: 'Frutos rojos (frambuesas o mix congelado)', k: 45, p: 1, c: 8, f: 0.4, fib: 4, sec: 'Congelados', pack: 300, packN: 'bolsa 300 g', price: 1.9 },
    mango:       { n: 'Mango / fresas congelados', k: 55, p: 0.8, c: 12, f: 0.3, fib: 2, sec: 'Congelados', pack: 300, packN: 'bolsa 300 g', price: 1.8 },
    acai:        { n: 'Pulpa de açaí sin azúcar (congelada)', k: 70, p: 1, c: 4, f: 5, fib: 3, sec: 'Congelados', pack: 400, packN: '4 sobres 100 g', price: 4.5 },
    ensalada:    { n: 'Lechuga / mezcla de ensalada', k: 17, p: 1.3, c: 2, f: 0.2, fib: 1.5, sec: 'Fruta y verdura', pack: 250, packN: 'bolsa 250 g', price: 1.2 },
    tomate:      { n: 'Tomate', k: 20, p: 0.9, c: 3.5, f: 0.2, fib: 1.2, sec: 'Fruta y verdura', pack: 1000, packN: 'kg', price: 2.2 },
    pimiento:    { n: 'Pimiento y cebolla', k: 30, p: 1, c: 5.5, f: 0.3, fib: 2, sec: 'Fruta y verdura', pack: 1000, packN: 'kg', price: 2 },
    champi:      { n: 'Champiñón laminado', k: 22, p: 3, c: 0.5, f: 0.3, fib: 1.5, sec: 'Fruta y verdura', pack: 250, packN: 'bandeja 250 g', price: 1.4 },
    patata:      { n: 'Papas / patata', k: 77, p: 2, c: 17, f: 0.1, fib: 2, sec: 'Fruta y verdura', pack: 1000, packN: 'kg', price: 1.8 },
    verduras:    { n: 'Verduras congeladas (salteado / al vapor / menestra)', k: 35, p: 2, c: 5, f: 0.3, fib: 2.5, sec: 'Congelados', pack: 1000, packN: 'bolsa 1 kg', price: 2 },
    noquis:      { n: 'Ñoquis de patata', k: 155, p: 3.5, c: 33, f: 0.5, fib: 1.5, sec: 'Despensa', pack: 500, packN: 'paquete 500 g', price: 1.5 },
    tortellini:  { n: 'Pasta rellena fresca (tortellini)', k: 290, p: 11, c: 42, f: 8, fib: 2, sec: 'Lácteos y huevos', pack: 250, packN: 'bandeja 250 g', price: 1.5 },
    salmorejo:   { n: 'Salmorejo (brik)', k: 105, p: 1.6, c: 7, f: 8, fib: 1, sec: 'Lácteos y huevos', pack: 1000, packN: 'brik 1 L', price: 2.19 },
    gazpacho:    { n: 'Gazpacho (brik)', k: 45, p: 1, c: 4, f: 2.8, fib: 1, sec: 'Lácteos y huevos', pack: 1000, packN: 'brik 1 L', price: 1.49 },
    guacamole:   { n: 'Guacamole', k: 165, p: 1.8, c: 5, f: 15, fib: 4, sec: 'Lácteos y huevos', pack: 200, packN: 'tarrina 200 g', price: 1.8 },
    barqueta:    { n: 'Ensalada barqueta con pollo (tipo Florette Xtreme, 210 g)', k: 160, p: 9, c: 9, f: 10, fib: 1.5, sec: 'Fruta y verdura', pack: 210, packN: 'barqueta 210 g', price: 3.79 }
  };

  /* ---------- Recetas / opciones de comida ----------
     slot: desayuno | media | almuerzo | merienda | cena | capricho
     prep: minutos · batch: se puede dejar preparado */
  const recipes = [
    // ---------- DESAYUNOS (preparables la noche anterior) ----------
    { id: 'd1', slot: 'desayuno', name: 'Overnight oats de skyr, frutos rojos y cacahuete', main: true, prep: 5, batch: true,
      tags: ['noche anterior', 'saciante'],
      ing: [['skyr', 250], ['avena', 40], ['leche', 60], ['frutosrojos', 100], ['pb', 10], ['miel', 5]],
      steps: ['En un tarro: skyr, avena y leche. Remueve.', 'Encima los frutos rojos (congelados valen: se descongelan en la nevera).', 'Por la mañana añade la crema de cacahuete y la miel.', 'Haz 2–3 tarros a la vez: aguantan 3 días en la nevera.'] },
    { id: 'd2', slot: 'desayuno', name: 'Bocadillo de pavo y queso + yogur proteico + fruta', prep: 5, batch: true,
      tags: ['noche anterior', 'para llevar'],
      ing: [['pan', 80], ['pavo', 60], ['quesolight', 20], ['yopro', 120], ['fruta', 150]],
      steps: ['Prepara el bocadillo la noche anterior y envuélvelo.', 'Yogur y fruta a la mochila: puedes desayunar al llegar al trabajo.'] },
    { id: 'd3', slot: 'desayuno', name: 'Bol de Weetabix minis con leche y queso batido', prep: 3,
      tags: ['2 minutos', 'dulce'],
      ing: [['weetabix', 35], ['leche', 250], ['skyr', 200], ['mango', 100], ['pb', 8]],
      steps: ['Queso batido en el fondo, fruta encima.', 'Weetabix con la leche aparte para que no se ablanden.', 'Pesa los Weetabix la primera vez y marca el nivel en el bol.'] },
    { id: 'd4', slot: 'desayuno', name: 'Tostadas con revuelto de huevo y claras (fin de semana)', prep: 10,
      tags: ['finde', 'salado'],
      ing: [['pan', 80], ['huevo', 120], ['claras', 100], ['tomate', 60], ['aceite', 3]],
      steps: ['Revuelto de 2 huevos + claras con una gota de aceite.', 'Tostadas con tomate rallado.'] },
    { id: 'd5', slot: 'desayuno', name: 'Porridge proteico de avena, claras y plátano (fin de semana)', prep: 8,
      tags: ['finde', 'caliente'],
      ing: [['avena', 50], ['claras', 150], ['leche', 100], ['platano', 60], ['yopro', 120], ['miel', 5]],
      steps: ['Avena + leche al fuego 3 min, añade las claras removiendo 2 min más.', 'Sirve con plátano, miel y el yogur proteico encima.'] },

    // ---------- MEDIA MAÑANA (snacks proteicos) ----------
    { id: 's1', slot: 'media', name: '2 yogures proteicos', main: true, prep: 0, tags: ['0 minutos', 'oficina'],
      ing: [['yopro', 240]], steps: ['Déjalos en la nevera del trabajo para toda la semana.'] },
    { id: 's2', slot: 'media', name: 'Skyr con fruta', prep: 2, tags: ['oficina'],
      ing: [['skyr', 200], ['fruta', 120]], steps: ['Tarro con skyr y fruta troceada.'] },
    { id: 's3', slot: 'media', name: 'Sándwich de pavo y queso', prep: 3, tags: ['salado', 'para llevar'],
      ing: [['pan', 50], ['pavo', 60], ['quesolight', 15]], steps: ['Prepáralo junto al desayuno la noche anterior.'] },
    { id: 's4', slot: 'media', name: 'Pollo mechado + pieza de fruta', prep: 1, tags: ['salado'],
      ing: [['pollomechado', 100], ['fruta', 150]], steps: ['Táper pequeño de pollo mechado frío.'] },
    { id: 's5', slot: 'media', name: '2 huevos cocidos + fruta', prep: 1, tags: ['salado', 'barato'],
      ing: [['huevo', 120], ['fruta', 150]], steps: ['Cuece 6–8 huevos el domingo: duran 5 días pelados en la nevera.'] },
    { id: 's6', slot: 'media', name: 'Queso batido con crema de cacahuete y miel', prep: 2, tags: ['dulce'],
      ing: [['skyr', 200], ['pb', 10], ['miel', 10]], steps: ['Mezcla y listo: sabe a postre.'] },
    { id: 's7', slot: 'media', name: 'Atún al natural con pan', prep: 2, tags: ['salado', 'barato'],
      ing: [['atun', 56], ['pan', 30], ['tomate', 60]], steps: ['Una lata pequeña, una rebanada y tomate.'] },

    // ---------- ALMUERZOS (táper al trabajo) ----------
    { id: 'a1', slot: 'almuerzo', name: 'Solomillo de cerdo con arroz y verduras', main: true, prep: 25, batch: true,
      tags: ['táper', 'batch'],
      ing: [['cerdo', 170], ['arroz', 70], ['verduras', 200], ['aceite', 8]],
      steps: ['Solomillo en medallones a la plancha con ajo, pimentón y orégano.', 'Arroz cocido aparte (o vasitos de arroz: 1 vasito de 125 g ≈ 45 g de arroz crudo).', 'Verduras salteadas con el aceite. Reparte en 3 tápers.'] },
    { id: 'a2', slot: 'almuerzo', name: 'Ensalada completa de atún, huevo y garbanzos', prep: 10, batch: true,
      tags: ['táper', 'fresco'],
      ing: [['ensalada', 100], ['tomate', 150], ['atun', 112], ['huevo', 120], ['garbanzos', 120], ['maiz', 40], ['aceite', 8]],
      steps: ['Base de lechuga, tomate, maíz y garbanzos.', 'Atún y huevo cocido encima; el aliño en un botecito aparte.'] },
    { id: 'a3', slot: 'almuerzo', name: 'Ñoquis con pollo y verduras', prep: 15, batch: true,
      tags: ['táper', 'rápido'],
      ing: [['noquis', 200], ['pollo', 150], ['verduras', 150], ['aceite', 5], ['quesorallado', 10]],
      steps: ['Dora el pollo en tiras con especias.', 'Saltea los ñoquis en la misma sartén 4–5 min con las verduras.', 'Queso rallado por encima al servir.'] },
    { id: 'a4', slot: 'almuerzo', name: 'Muslitos de pollo al horno con papas y ensalada', prep: 45, batch: true,
      tags: ['táper', 'horno'],
      ing: [['muslos', 180], ['patata', 250], ['ensalada', 100], ['tomate', 80], ['aceite', 8]],
      steps: ['Bandeja de horno: muslitos sin piel + papas en gajos con especias y el aceite, 40 min a 200 °C.', 'Ensalada aparte. Una bandeja da para 3–4 tápers.'] },
    { id: 'a5', slot: 'almuerzo', name: 'Pasta rellena con pollo mechado y tomate', prep: 10,
      tags: ['táper', 'rápido'],
      ing: [['tortellini', 130], ['pollomechado', 100], ['tomatetri', 100], ['verduras', 100]],
      steps: ['Cuece la pasta rellena 3 min.', 'Salsa: tomate triturado + verduras + pollo mechado 5 min.', 'Mezcla y al táper.'] },
    { id: 'a6', slot: 'almuerzo', name: 'Solomillo de pollo con arroz y verduras', prep: 20, batch: true,
      tags: ['táper', 'batch'],
      ing: [['pollo', 180], ['arroz', 70], ['verduras', 150], ['aceite', 8]],
      steps: ['Pollo a la plancha (curry, limón y ajo o fajita).', 'Arroz y verduras igual que el solomillo de cerdo.'] },
    { id: 'a7', slot: 'almuerzo', name: 'Barqueta de ensalada con pollo "mejorada" (rápida)', prep: 2,
      tags: ['sin cocinar', 'emergencia'],
      ing: [['barqueta', 210], ['pollomechado', 100], ['fruta', 150]],
      steps: ['Barqueta + 100 g extra de pollo para llegar a la proteína.', 'Usa la mitad de la salsa si tienes hambre de volumen y no de grasa.'] },

    // ---------- MERIENDA / PRE-ENTRENO ----------
    { id: 'p1', slot: 'merienda', name: 'Plátano + 2 yogures proteicos', main: true, prep: 0, tags: ['pre-entreno'],
      ing: [['platano', 120], ['yopro', 240]], steps: ['60–90 min antes del gimnasio.'] },
    { id: 'p2', slot: 'merienda', name: 'Tostada de pavo con miel', prep: 3, tags: ['pre-entreno'],
      ing: [['pan', 60], ['pavo', 60], ['miel', 10]], steps: ['Combinación dulce-salada, fácil de digerir.'] },
    { id: 'p3', slot: 'merienda', name: 'Batido de leche, plátano y proteína', prep: 2, tags: ['pre/post-entreno'],
      ing: [['leche', 300], ['platano', 100], ['whey', 25]], steps: ['Batidora 20 s. Sin whey: usa 200 g de skyr.'] },
    { id: 'p4', slot: 'merienda', name: 'Skyr con avena y fruta', prep: 2, tags: ['descanso'],
      ing: [['skyr', 200], ['avena', 20], ['fruta', 100]], steps: ['Merienda de días sin entreno.'] },

    // ---------- CENAS ----------
    { id: 'c1', slot: 'cena', name: 'Fajitas de kebab de pollo con salsa de yogur', main: true, prep: 15,
      tags: ['casa', 'compartir'],
      ing: [['tortilla', 80], ['kebab', 150], ['pimiento', 200], ['yogurnat', 60], ['ensalada', 40]],
      steps: ['Saltea pimiento y cebolla en tiras; añade el kebab 4 min.', 'Salsa: yogur natural + ajo en polvo + comino + limón + sal.', '2 tortillas bien cargadas. Si repites, la 3.ª tortilla solo con verdura y pollo.'] },
    { id: 'c2', slot: 'cena', name: 'Pizza casera proteica', prep: 20,
      tags: ['casa', 'viernes'],
      ing: [['masapizza', 125], ['tomatetri', 60], ['mozzarella', 60], ['pollomechado', 80], ['champi', 80]],
      steps: ['Media masa fina por persona (corta el rollo en 2).', 'Tomate, champiñón, pollo mechado y mozzarella light.', '12–14 min a 220 °C. Acompaña con ensalada si te quedas con hambre.', 'Versión rápida: media pizza fresca refrigerada + 100 g de pollo encima + ensalada (≈650 kcal).'] },
    { id: 'c3', slot: 'cena', name: 'Salmorejo completo con huevo, jamón y pollo', prep: 5,
      tags: ['sin cocinar', 'fresco'],
      ing: [['salmorejo', 200], ['huevo', 60], ['jamon', 30], ['pollomechado', 100], ['pan', 30]],
      steps: ['Salmorejo de brik en bol grande.', 'Huevo cocido picado, jamón y pollo desmigado por encima.', 'Una rebanada de pan para mojar.'] },
    { id: 'c4', slot: 'cena', name: 'Potaje de garbanzos con pollo y verduras', prep: 35, batch: true,
      tags: ['olla', 'batch', 'compartir'],
      ing: [['garbanzos', 200], ['verduras', 200], ['patata', 100], ['pollo', 120], ['aceite', 7]],
      steps: ['Sofrito con el aceite, añade verduras, papa en dados y caldo/agua.', 'Pollo en dados y garbanzos de bote 10 min al final.', 'Haz olla para 4–6 raciones: cena + 1–2 tápers.'] },
    { id: 'c5', slot: 'cena', name: 'Bowl de açaí proteico', prep: 5,
      tags: ['dulce', 'sin cocinar'],
      ing: [['acai', 100], ['skyr', 250], ['platano', 100], ['mango', 100], ['granola', 30], ['pb', 10], ['whey', 15]],
      steps: ['Bate açaí + plátano + mitad del skyr (+ whey).', 'Encima: resto de skyr, mango/fresas, granola y la crema de cacahuete.', 'Si tu açaí lleva azúcar, cuenta ≈ +30 kcal.'] },
    { id: 'c6', slot: 'cena', name: 'Tortilla francesa grande con ensalada y pan', prep: 10,
      tags: ['rápido', 'barato'],
      ing: [['huevo', 120], ['claras', 150], ['ensalada', 80], ['tomate', 120], ['pan', 60], ['quesolight', 20], ['aceite', 5]],
      steps: ['2 huevos + claras, con queso dentro.', 'Ensalada de tomate y pan.'] },
    { id: 'c7', slot: 'cena', name: 'Merluza con papas y verduras al horno', prep: 30,
      tags: ['horno', 'ligero'],
      ing: [['merluza', 250], ['patata', 250], ['verduras', 200], ['aceite', 10]],
      steps: ['Papas en rodajas 20 min a 200 °C.', 'Añade la merluza y las verduras 12–15 min más.', 'Mojo verde o limón por encima (el mojo cuenta: 1 cda ≈ 50 kcal).'] },

    // ---------- CAPRICHO PACTADO (≈100–150 kcal) ----------
    { id: 't1', slot: 'capricho', name: '2 onzas grandes de chocolate 85%', main: true, prep: 0, tags: ['dulce'], ing: [['choco85', 20]], steps: [] },
    { id: 't2', slot: 'capricho', name: 'Cucharada de Nocilla/Nutella (20 g)', prep: 0, tags: ['dulce'], ing: [['nocilla', 20]], steps: ['Pesada una vez; luego cucharilla rasa conocida.'] },
    { id: 't3', slot: 'capricho', name: 'Caramelos de goma (30 g)', prep: 0, tags: ['dulce'], ing: [['pikotas', 30]], steps: ['Sírvelos en un platito, nunca de la bolsa.'] },
    { id: 't4', slot: 'capricho', name: '1 mini bizcocho relleno', prep: 0, tags: ['dulce'], ing: [['minirelleno', 30]], steps: [] },
    { id: 't5', slot: 'capricho', name: 'Palomitas caseras (30 g de grano)', prep: 5, tags: ['salado', 'volumen'], ing: [['palomitas', 30], ['aceite', 3]], steps: ['Bol de cristal tapado en el microondas 2–3 min.'] },
    { id: 't6', slot: 'capricho', name: 'Lata de Coca-Cola normal', prep: 0, tags: ['bebida'], ing: [['cola', 330]], steps: ['Si eliges esta, el resto de refrescos del día: zero.'] },
    { id: 't7', slot: 'capricho', name: 'Vaso de zumo de naranja (250 ml)', prep: 0, tags: ['bebida'], ing: [['zumo', 250]], steps: ['Mejor con comida que entre horas.'] }
  ];

  const mealSlots = [
    { id: 'desayuno', name: 'Desayuno', time: '06:45', kcal: 450, protein: 35, icon: '🥣' },
    { id: 'media',    name: 'Media mañana', time: '10:30', kcal: 180, protein: 20, icon: '🥛' },
    { id: 'almuerzo', name: 'Almuerzo (táper)', time: '13:30', kcal: 590, protein: 45, icon: '🍱' },
    { id: 'merienda', name: 'Merienda / pre-entreno', time: '17:30', kcal: 250, protein: 22, icon: '🍌' },
    { id: 'cena',     name: 'Cena', time: '20:45', kcal: 590, protein: 45, icon: '🍽️' },
    { id: 'capricho', name: 'Capricho pactado', time: 'libre', kcal: 120, protein: 0, icon: '🍫' }
  ];

  const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  const dayNames = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' };

  /* Menú semanal por defecto (rotación). "fuera" = comida fuera con reglas */
  const weekMenu = {
    lun: { desayuno: 'd1', media: 's1', almuerzo: 'a1', merienda: 'p1', cena: 'c4', capricho: 't1' },
    mar: { desayuno: 'd1', media: 's5', almuerzo: 'a2', merienda: 'p4', cena: 'c1', capricho: 't2' },
    mie: { desayuno: 'd2', media: 's1', almuerzo: 'a3', merienda: 'p1', cena: 'c3', capricho: 't5' },
    jue: { desayuno: 'd1', media: 's4', almuerzo: 'a6', merienda: 'p4', cena: 'c7', capricho: 't3' },
    vie: { desayuno: 'd3', media: 's1', almuerzo: 'a5', merienda: 'p1', cena: 'c2', capricho: 't6' },
    sab: { desayuno: 'd4', media: 's6', almuerzo: 'fuera', merienda: 'p4', cena: 'c5', capricho: 't1' },
    dom: { desayuno: 'd5', media: 's2', almuerzo: 'a4', merienda: 'p2', cena: 'c6', capricho: 't4' }
  };

  /* ---------- Entrenamiento de fuerza: 2 días / semana, cuerpo completo ---------- */
  const warmup = [
    '5 min bici, elíptica o cinta inclinada suave (RPE 3–4).',
    'Movilidad 3 min: 8 gato-camello, 6 world\'s greatest stretch por lado, 8 rotaciones 90/90 por lado.',
    'Activación: 15 band pull-aparts + 10 puentes de glúteo.',
    'Series de aproximación del primer ejercicio: 10 reps con barra vacía/40 % → 5 reps al 60 % → 3 reps al 80 % del peso de trabajo.',
    'Para el 2.º ejercicio basta 1–2 series de aproximación.'
  ];

  const routines = [
    { id: 'A', name: 'Full Body A · Sentadilla + empuje horizontal', duration: '65–75 min', exercises: [
      { id: 'sq',   name: 'Sentadilla con barra (o hack squat)', sets: 3, repMin: 5, repMax: 8, rir: 2, rest: 180, inc: 5, alt: 'Hack squat · sentadilla en multipower · sentadilla goblet pesada', cue: 'Bracing antes de bajar, rodillas siguen la punta del pie, profundidad que controles sin perder la espalda.' },
      { id: 'bp',   name: 'Press banca con barra', sets: 3, repMin: 6, repMax: 10, rir: 2, rest: 150, inc: 2.5, alt: 'Press con mancuernas · press pecho en máquina', cue: 'Escápulas atrás y abajo, pies firmes, barra a la parte baja del pecho.' },
      { id: 'row',  name: 'Remo con pecho apoyado (máquina o banco inclinado)', sets: 3, repMin: 8, repMax: 12, rir: 2, rest: 120, inc: 2.5, alt: 'Remo en polea baja · remo T con apoyo', cue: 'Tira con el codo hacia la cadera, pausa 1 s arriba.' },
      { id: 'rdl',  name: 'Peso muerto rumano (barra o mancuernas)', sets: 3, repMin: 8, repMax: 10, rir: 2, rest: 120, inc: 5, alt: 'Hip thrust · good morning en multipower', cue: 'Cadera atrás, barra pegada a las piernas, para cuando notes el isquio tenso.' },
      { id: 'lat',  name: 'Elevaciones laterales (polea o mancuernas)', sets: 3, repMin: 12, repMax: 20, rir: 1, rest: 75, inc: 1, alt: 'Máquina de laterales', cue: 'Sube hasta la altura del hombro, baja en 2 s.' },
      { id: 'lc',   name: 'Curl femoral (sentado o tumbado)', sets: 2, repMin: 10, repMax: 15, rir: 1, rest: 75, inc: 2.5, alt: 'Curl nórdico asistido', cue: 'Controla la bajada.' },
      { id: 'core', name: 'Pallof press o plancha', sets: 3, repMin: 10, repMax: 12, rir: 2, rest: 60, inc: 0, alt: 'Dead bug · rueda abdominal', cue: 'Pallof: 10–12 por lado. Plancha: 30–45 s.' }
    ]},
    { id: 'B', name: 'Full Body B · Bisagra + empuje vertical + tirón', duration: '65–75 min', exercises: [
      { id: 'dl',   name: 'Peso muerto con trap bar (o convencional)', sets: 3, repMin: 4, repMax: 6, rir: 2, rest: 180, inc: 5, alt: 'Peso muerto rumano pesado · rack pull', cue: 'Empuja el suelo, espalda neutra, la barra no se separa del cuerpo.' },
      { id: 'ohp',  name: 'Press militar con mancuernas sentado', sets: 3, repMin: 6, repMax: 10, rir: 2, rest: 150, inc: 2, alt: 'Press hombro en máquina · press militar con barra', cue: 'Costillas abajo, no arquees la lumbar.' },
      { id: 'pd',   name: 'Jalón al pecho (o dominadas asistidas)', sets: 3, repMin: 8, repMax: 12, rir: 2, rest: 120, inc: 2.5, alt: 'Dominadas · jalón unilateral', cue: 'Pecho arriba, codos hacia los bolsillos.' },
      { id: 'lp',   name: 'Prensa de piernas', sets: 3, repMin: 10, repMax: 12, rir: 2, rest: 120, inc: 10, alt: 'Zancadas búlgaras · sentadilla hack', cue: 'Bajada completa sin despegar la pelvis.' },
      { id: 'ip',   name: 'Press inclinado con mancuernas', sets: 3, repMin: 8, repMax: 12, rir: 1, rest: 120, inc: 2, alt: 'Press inclinado en máquina · fondos asistidos', cue: 'Banco a 30°, codos a 45°.' },
      { id: 'fp',   name: 'Face pull en polea', sets: 2, repMin: 12, repMax: 15, rir: 1, rest: 60, inc: 2.5, alt: 'Pájaros con mancuerna · reverse fly en máquina', cue: 'Tira hacia la frente abriendo las manos.' },
      { id: 'arms', name: 'Superserie: curl bíceps + extensión de tríceps en polea', sets: 2, repMin: 10, repMax: 15, rir: 1, rest: 60, inc: 1, alt: 'Curl martillo · press francés', cue: 'Sin balanceo. Una serie de cada sin descanso.' },
      { id: 'carry',name: 'Paseo del granjero', sets: 3, repMin: 30, repMax: 40, rir: 2, rest: 60, inc: 2, alt: 'Suitcase carry (una mano)', cue: 'Metros por serie. Pesado, postura alta, pasos cortos.' }
    ]}
  ];

  /* Sesión exprés para días con poco tiempo (30 min) */
  const expressSession = {
    name: 'Sesión exprés (30 min) · cuando no hay tiempo',
    items: ['Calentamiento 4 min', 'Sentadilla o prensa 3 × 6–10', 'Press banca o press inclinado 3 × 6–10', 'Jalón o remo 3 × 8–12', 'Opcional: 5 min de caminata inclinada'],
    note: 'Si solo tienes 30 minutos, esto vale más que saltarte la sesión. Cuenta como sesión completa.'
  };

  const trainingRules = [
    'Doble progresión: cuando completes TODAS las series en el máximo del rango de repeticiones con el RIR indicado, sube la carga (inc.) y vuelve al mínimo del rango.',
    'RIR = repeticiones que te quedan en reserva. RIR 2 = podrías hacer 2 más con buena técnica.',
    'Semanas 1–2: RIR 3–4 para calibrar cargas y técnica. A partir de la semana 3: RIR 1–2 en la última serie.',
    'En déficit lo normal es mantener o subir poco la fuerza. Mantenerla = estás conservando músculo.',
    'Si un ejercicio baja de rendimiento 2 sesiones seguidas: quita 1 serie a todo durante 1 semana y revisa sueño y calorías.',
    'Navidad (semanas 8–9): misma carga, 1 serie menos por ejercicio (descarga).',
    'Dolor articular agudo (no agujetas) = cambia por la alternativa y no fuerces.',
    'Cardio extra en el gimnasio: 10–15 min de cinta inclinada al final solo si te sobra tiempo; los pasos diarios pesan más que esto.'
  ];

  /* ---------- Carrera: escalera de niveles con progresión por feedback ---------- */
  const runLevels = [
    { lvl: 0, name: 'Sesión de referencia', type: 'test', warm: 5, cool: 5, blocks: [{ reps: 1, work: 1200, workT: 'Trote cómodo continuo (RPE 5)', rest: 0, restT: '' }, { reps: 4, work: 20, workT: 'Progresivo hasta rápido', rest: 60, restT: 'Caminar' }], note: 'Anota la distancia de los 20 min: será tu referencia para el test final.' },
    { lvl: 1, name: '6 × 1′ vivo / 2′ suave', warm: 8, cool: 5, blocks: [{ reps: 6, work: 60, workT: 'Ritmo vivo (RPE 7)', rest: 120, restT: 'Trote muy suave o caminar' }] },
    { lvl: 2, name: '8 × 1′ vivo / 1′30″ suave', warm: 8, cool: 5, blocks: [{ reps: 8, work: 60, workT: 'Ritmo vivo (RPE 7)', rest: 90, restT: 'Trote suave' }] },
    { lvl: 3, name: '10 × 1′ vivo / 1′30″ suave', warm: 8, cool: 5, blocks: [{ reps: 10, work: 60, workT: 'Ritmo vivo (RPE 7–8)', rest: 90, restT: 'Trote suave' }] },
    { lvl: 4, name: '8 × 30″ rápido / 1′30″ suave + 8′ continuo', warm: 8, cool: 5, blocks: [{ reps: 8, work: 30, workT: 'Rápido (RPE 8–9)', rest: 90, restT: 'Trote suave' }, { reps: 1, work: 480, workT: 'Trote cómodo continuo', rest: 0, restT: '' }] },
    { lvl: 5, name: '6 × 2′ fuerte / 2′ suave', warm: 8, cool: 5, blocks: [{ reps: 6, work: 120, workT: 'Fuerte (RPE 7–8)', rest: 120, restT: 'Trote suave' }] },
    { lvl: 6, name: '8 × 45″ en cuesta / bajar andando', warm: 10, cool: 5, blocks: [{ reps: 8, work: 45, workT: 'Cuesta, zancada corta (RPE 8)', rest: 90, restT: 'Bajar caminando' }], note: 'Santa Cruz tiene cuestas de sobra (p. ej. hacia La Salle o el Toscal). Sin cuesta: cinta al 6–8 %.' },
    { lvl: 7, name: '7 × 2′ fuerte / 1′30″ suave', warm: 8, cool: 5, blocks: [{ reps: 7, work: 120, workT: 'Fuerte (RPE 8)', rest: 90, restT: 'Trote suave' }] },
    { lvl: 8, name: '5 × 3′ fuerte / 2′ suave', warm: 10, cool: 5, blocks: [{ reps: 5, work: 180, workT: 'Fuerte (RPE 7–8)', rest: 120, restT: 'Trote suave' }] },
    { lvl: 9, name: '10 × 1′ muy fuerte / 1′ suave', warm: 10, cool: 5, blocks: [{ reps: 10, work: 60, workT: 'Muy fuerte (RPE 8–9)', rest: 60, restT: 'Trote muy suave' }] },
    { lvl: 10, name: '6 × 3′ fuerte / 2′ suave', warm: 10, cool: 5, blocks: [{ reps: 6, work: 180, workT: 'Fuerte (RPE 8)', rest: 120, restT: 'Trote suave' }] },
    { lvl: 11, name: '4 × 4′ fuerte / 2′30″ suave', warm: 10, cool: 5, blocks: [{ reps: 4, work: 240, workT: 'Fuerte (RPE 8)', rest: 150, restT: 'Trote suave' }] },
    { lvl: 12, name: '3 × 6′ umbral / 2′ suave', warm: 10, cool: 5, blocks: [{ reps: 3, work: 360, workT: 'Umbral: duro pero sostenido (RPE 7–8)', rest: 120, restT: 'Trote suave' }] },
    { lvl: 13, name: 'Test: 20′ al máximo sostenible', type: 'test', warm: 10, cool: 5, blocks: [{ reps: 1, work: 1200, workT: 'Máximo ritmo que puedas mantener 20 min', rest: 0, restT: '' }], note: 'Compara la distancia con tu sesión de referencia.' }
  ];

  const runRules = [
    'Una sesión cada 2 semanas (semanas pares). Puedes hacer más si te apetece: la progresión es por sesión, no por calendario.',
    'Valora la sesión en conjunto del 1 al 10 al terminar. ≤ 6 → subes 2 niveles · 7–8 → subes 1 · 9 → repites · 10 o sin terminar → bajas 1.',
    'Molestia que cambia tu forma de correr → bajas 1 nivel y no corres hasta que desaparezca. Si dura más de 1 semana, fisio o médico.',
    'Calentamiento: 5 min caminando rápido + 3–5 min de trote muy suave + 4 skippings/talones de 20 m.',
    'Zapatillas con amortiguación y superficie regular (paseo de la Avenida de Anaga, Parque García Sanabria o cinta). Evita bajadas largas mientras peses más de 100 kg.',
    'El día de carrera cuenta como pasos y cardio: no hace falta añadir nada más.'
  ];

  /* ---------- Movilidad, liberación y meditación ---------- */
  const mobility = {
    weekly: { name: 'Sesión semanal: movilidad, liberación y meditación (≈30 min)', when: 'Domingo por la tarde o el día que no entrenes', steps: [
      { name: 'Respiración de inicio: 4 s inhalar / 6 s exhalar', dur: 120, cue: 'Tumbado, una mano en el abdomen.' },
      { name: 'Rodillo: cuádriceps', dur: 60, side: true, cue: 'Busca los puntos tensos y quédate 20–30 s en cada uno.' },
      { name: 'Rodillo: isquios y gemelos', dur: 60, side: true, cue: 'Cruza una pierna sobre la otra para más presión.' },
      { name: 'Pelota: glúteo y piriforme', dur: 60, side: true, cue: 'Tobillo sobre la rodilla contraria.' },
      { name: 'Rodillo: dorsal y zona torácica', dur: 90, cue: 'Manos detrás de la cabeza; no ruedes sobre la lumbar.' },
      { name: 'Pelota: pectoral contra la pared', dur: 45, side: true, cue: 'Pequeños círculos bajo la clavícula.' },
      { name: 'Estiramiento de flexor de cadera (rodilla en el suelo)', dur: 45, side: true, cue: 'Aprieta el glúteo de la pierna de atrás.' },
      { name: 'Estiramiento de isquios tumbado con toalla', dur: 45, side: true, cue: 'Pierna estirada, sin tirar del cuello.' },
      { name: 'Figura 4 tumbado (glúteo)', dur: 45, side: true, cue: 'Respira hacia la zona que tira.' },
      { name: 'Pectoral en el marco de la puerta', dur: 45, side: true, cue: 'Codo a la altura del hombro.' },
      { name: 'Gemelo en la pared', dur: 30, side: true, cue: 'Talón al suelo, rodilla estirada.' },
      { name: 'Postura del niño con brazos largos', dur: 60, cue: 'Exhala largo y deja caer la cadera.' },
      { name: 'Meditación guiada (ver nivel de la semana)', dur: 600, cue: 'Sentado o tumbado. Sigue la guía del nivel actual.' }
    ]},
    daily: { name: 'Mini rutina diaria (5 min, p. ej. al levantarte de la siesta o antes de dormir)', steps: [
      { name: 'Gato-camello', dur: 45, cue: 'Lento, siguiendo la respiración.' },
      { name: 'World\'s greatest stretch', dur: 60, side: true, cue: '3 por lado.' },
      { name: 'Rotaciones 90/90 de cadera', dur: 60, cue: 'Sin manos si puedes.' },
      { name: 'Apertura torácica en cuadrupedia', dur: 45, side: true, cue: 'Mano en la nuca, abre el codo al techo.' },
      { name: 'Respiración 4–6', dur: 90, cue: 'Cierra el día o empieza la tarde con esto.' }
    ]}
  };

  const meditation = [
    { weeks: '1–4', min: 5, name: 'Contar respiraciones', guide: 'Cuenta cada exhalación del 1 al 10 y vuelve a empezar. Cuando te despistes (pasará muchas veces), vuelve al 1 sin juzgarte. Ese "volver" ES el entrenamiento.' },
    { weeks: '5–8', min: 8, name: 'Body scan', guide: 'Recorre el cuerpo de los pies a la cabeza, 20–30 s por zona. Solo notas sensaciones: tensión, calor, nada. Si una zona está tensa, exhala largo hacia ella.' },
    { weeks: '9–12', min: 10, name: 'Atención a la respiración + etiquetar', guide: 'Atiende a la respiración en la nariz. Cuando aparezca un pensamiento, etiquétalo con una palabra ("plan", "recuerdo", "preocupación") y vuelve a respirar.' },
    { weeks: '13–17', min: 12, name: 'Atención abierta', guide: 'Empieza 2 min con la respiración y luego abre la atención a sonidos, sensaciones y pensamientos, como quien mira pasar coches. Termina con 3 respiraciones largas.' }
  ];

  const breathing = [
    { id: 'coh', name: 'Coherente 4–6 (calma)', phases: [['Inhala', 4], ['Exhala', 6]] },
    { id: 'box', name: 'Caja 4–4–4–4 (foco)', phases: [['Inhala', 4], ['Mantén', 4], ['Exhala', 4], ['Mantén', 4]] },
    { id: '478', name: '4–7–8 (para dormir)', phases: [['Inhala', 4], ['Mantén', 7], ['Exhala', 8]] },
    { id: 'sigh', name: 'Suspiro fisiológico (antojo / estrés)', phases: [['Inhala', 2], ['Sorbe un poco más', 1], ['Exhala largo', 6]] }
  ];

  /* ---------- Hoja de ruta de 17 semanas + día 120 ----------
     loss = rango de pérdida acumulada esperada (% del peso inicial) al final de la semana */
  const roadmap = [
    { w: 1,  phase: 'Arranque', kcal: '2.000–2.200', steps: 'Mide tu línea base', run: false, focus: 'Pésate cada mañana, apunta pasos y deja el desayuno hecho la noche anterior.', gymNote: 'RIR 3–4: calibrar cargas', loss: [0.8, 2.0] },
    { w: 2,  phase: 'Arranque', kcal: '2.000–2.200', steps: 'Línea base + 1.000 (≈7.000)', run: true, focus: 'Proteína en cada comida (5 tomas de 20–45 g).', gymNote: 'RIR 3: técnica', loss: [1.2, 2.6] },
    { w: 3,  phase: 'Arranque', kcal: '2.000–2.200', steps: '≈7.000', run: false, focus: 'Agua: 500 ml al despertar + botella de 1 L en el trabajo, dos veces.', gymNote: 'RIR 2: empieza la progresión', loss: [1.6, 3.2] },
    { w: 4,  phase: 'Arranque', kcal: '2.000–2.200', steps: '≈8.000', run: true, focus: 'Capricho pactado: uno al día, servido en plato y sentado. Refrescos → zero.', gymNote: 'RIR 1–2', loss: [2.0, 3.8], review: 'Revisión del mes 1 (día 28–30)' },
    { w: 5,  phase: 'Progresión', kcal: 'Según revisión', steps: '≈8.000', run: false, focus: 'Paseo "reset" de 10 min después de comer o al levantarte de la siesta.', gymNote: 'RIR 1–2', loss: [2.4, 4.4] },
    { w: 6,  phase: 'Progresión', kcal: 'Según revisión', steps: '≈8.500', run: true, focus: 'Sueño: pantallas fuera a las 22:30, en la cama a las 22:45–23:00.', gymNote: 'RIR 1–2', loss: [2.8, 5.0] },
    { w: 7,  phase: 'Progresión', kcal: 'Según revisión', steps: '≈8.500', run: false, focus: 'Comer fuera con la regla del plato (ensayo general para Navidad).', gymNote: 'RIR 1–2', loss: [3.2, 5.6] },
    { w: 8,  phase: 'Navidad · mantenimiento consciente', kcal: '2.400–2.600 (mantener)', steps: '≥ 9.000', run: true, focus: 'Objetivo: NO perder, mantener. Solo las comidas señaladas son de fiesta; el resto, plan normal.', gymNote: 'Descarga: 1 serie menos', loss: [3.0, 5.6] },
    { w: 9,  phase: 'Navidad · mantenimiento consciente', kcal: '2.400–2.600 (mantener)', steps: '≥ 9.000', run: false, focus: 'Fin de año y Reyes: proteína + paseo largo al día siguiente; nada de compensar sin comer.', gymNote: 'Descarga: 1 serie menos', loss: [2.8, 5.6], review: 'Revisión del mes 2 (día 60)' },
    { w: 10, phase: 'Déficit principal', kcal: 'Vuelve al objetivo', steps: '≈9.000', run: true, focus: 'Reinicio de 3 días: proteína alta, pasos y batch cooking el domingo.', gymNote: 'RIR 2 y vuelve a progresar', loss: [3.4, 6.2] },
    { w: 11, phase: 'Déficit principal', kcal: 'Objetivo ajustado', steps: '≈9.000', run: false, focus: 'Doble ración de verdura en almuerzo y cena (más volumen, mismas calorías).', gymNote: 'RIR 1–2', loss: [3.8, 6.8] },
    { w: 12, phase: 'Déficit principal', kcal: 'Objetivo ajustado', steps: '≈9.500', run: true, focus: 'Revisión de despensa: los dulces de Nati en su armario, tus caprichos en ración.', gymNote: 'RIR 1–2', loss: [4.2, 7.4] },
    { w: 13, phase: 'Déficit principal', kcal: 'Objetivo ajustado', steps: '≈10.000', run: false, focus: 'Recados a pie: todo lo que esté a menos de 20 min, andando.', gymNote: 'RIR 1–2', loss: [4.6, 8.0], review: 'Revisión del mes 3 (día 90)' },
    { w: 14, phase: 'Déficit principal', kcal: 'Objetivo ajustado', steps: '≈10.000', run: true, focus: 'Comer fuera: decide qué vas a pedir antes de mirar la carta.', gymNote: 'RIR 1–2', loss: [5.0, 8.6] },
    { w: 15, phase: 'Carnaval', kcal: 'Objetivo (días de fiesta a mantenimiento)', steps: '≈10.000 (bailar cuenta)', run: false, focus: 'Plan de Carnaval: cena de proteína ANTES de salir y agua siempre en la mano.', gymNote: 'RIR 1–2', loss: [5.4, 9.2] },
    { w: 16, phase: 'Cierre', kcal: 'Objetivo ajustado', steps: '≈10.000', run: true, focus: 'Ensaya el mantenimiento: un día a la semana a +300 kcal y observa cómo responde el peso.', gymNote: 'Intenta récords en los básicos (RIR 1)', loss: [5.8, 9.8] },
    { w: 17, phase: 'Cierre', kcal: 'Objetivo ajustado', steps: '≈10.000', run: false, focus: 'Mediciones finales (día 120): peso medio, cintura, fotos, fuerza, test de carrera y bioimpedancia.', gymNote: 'Test de fuerza: mejor serie de 5', loss: [6.2, 10.4], review: 'Revisión final (día 120) + plan de mantenimiento' }
  ];

  const phases = [
    { name: 'Arranque', weeks: '1–4', goal: 'Instalar hábitos y medir tu línea base. Cargas cómodas, técnica impecable.' },
    { name: 'Progresión', weeks: '5–7', goal: 'Primer ajuste de calorías con datos reales. Más pasos y entrenos con intensidad.' },
    { name: 'Navidad · mantenimiento consciente', weeks: '8–9', goal: 'Pausa de dieta planificada: comer a mantenimiento para no ganar, descansar la cabeza y volver con fuerza.' },
    { name: 'Déficit principal', weeks: '10–14', goal: 'El bloque más productivo: ajustar calorías con la tendencia, 9–10k pasos y fuerza estable.' },
    { name: 'Carnaval', weeks: '15', goal: 'Gestionar fiestas sin perder la semana.' },
    { name: 'Cierre', weeks: '16–17', goal: 'Mediciones finales y transición a mantenimiento.' }
  ];

  /* ---------- Hábitos y listas de verificación ---------- */
  const dailyChecklist = [
    { id: 'peso', label: 'Pesarme al levantarme (después del baño)' },
    { id: 'agua', label: '500 ml de agua al despertar' },
    { id: 'prot', label: 'Proteína en las 5 comidas' },
    { id: 'verd', label: 'Verdura o fruta en cada comida principal' },
    { id: 'pasos', label: 'Objetivo de pasos' },
    { id: 'capr', label: 'Como mucho 1 capricho, servido y sentado' },
    { id: 'resp', label: '5 min de respiración o meditación' },
    { id: 'manana', label: 'Desayuno y táper de mañana preparados' },
    { id: 'pantalla', label: 'Pantallas fuera a las 22:30' }
  ];

  const weeklyChecklist = [
    { id: 'compra', label: 'Compra con la lista de la app (sin hambre)' },
    { id: 'batch', label: 'Batch cooking: 3 tápers + proteína cocinada + huevos cocidos' },
    { id: 'gym2', label: '2 sesiones de gimnasio' },
    { id: 'stretch', label: 'Sesión de movilidad + meditación' },
    { id: 'cintura', label: 'Cintura medida (domingo)' },
    { id: 'review', label: 'Revisión semanal hecha' },
    { id: 'fotos', label: 'Fotos de progreso (semanas pares)' }
  ];

  /* ---------- Reglas para situaciones difíciles (si… entonces…) ---------- */
  const rules = [
    { id: 'skipgym', icon: '🏋️', title: 'Me salto un entrenamiento', when: 'Se cae una sesión de gimnasio',
      do: ['No la "recuperes" haciendo dos seguidas ni alargando la siguiente.', 'Muévela al siguiente día libre de esa misma semana. Si no hay hueco, haz la sesión exprés de 30 min.', 'Si la semana se cierra con 1 sesión, la próxima empieza por la rutina que te tocaba.', 'Regla de oro: nunca dos semanas seguidas con menos de 2 sesiones. Si pasa, la siguiente sesión es exprés pero se hace sí o sí.'] },
    { id: 'eatout', icon: '🍽️', title: 'Como o ceno fuera', when: '2–4 veces por semana',
      do: ['Elige primero la proteína (pescado, pollo, carne magra, pulpo, cherne a la plancha…) y pide guarnición de verdura, ensalada o papas sencillas.', 'Elige 1 de 3: pan, postre o bebida azucarada. Las otras dos, no.', 'Entrantes para compartir: sírvete una ración en el plato, no picotees del centro.', 'Salsas, mojos y alioli aparte.', 'Antes de salir, come lo demás del día según el plan: sin saltarte comidas para "guardar".', 'Al día siguiente, plan normal. Nunca compensar con ayuno.'] },
    { id: 'weekend', icon: '🏖️', title: 'Fin de semana', when: 'Sábado y domingo',
      do: ['Mantén el desayuno proteico y la hora de levantarte ±1,5 h.', 'Una comida libre consciente, no un día libre.', 'Mete movimiento: paseo largo, sendero, playa o pádel. Sube pasos, no restes comida.', 'Domingo por la tarde: batch cooking + revisión semanal (40 min en total).'] },
    { id: 'craving', icon: '🍫', title: 'Antojo de dulce', when: 'Sobre todo por la tarde o en el sofá',
      do: ['Espera 10 minutos con un vaso de agua, café o infusión. Haz un suspiro fisiológico ×3.', 'Si sigue: tu capricho pactado (100–150 kcal), servido en plato, sentado y sin pantalla.', 'Si ya lo tomaste: postre proteico (skyr con cacao y canela, yogur proteico, fruta congelada).', 'Los dulces de casa, fuera de la vista. Acordar con Nati un armario "suyo".'] },
    { id: 'hunger', icon: '😋', title: 'Tengo mucha hambre', when: 'Hambre real entre comidas o por la noche',
      do: ['Comprueba que la comida anterior tuvo ≥ 30 g de proteína.', 'Añade volumen: verdura, sopa, gazpacho, fruta, palomitas caseras.', 'Si lleva 3+ días así y el peso baja más de 1 kg/semana: sube 100–150 kcal.', 'Duerme más: con menos de 6 h el hambre sube claramente al día siguiente.'] },
    { id: 'sofa', icon: '🛋️', title: 'Tarde de tele o siesta', when: 'Cuando la tarde se te va en el sofá',
      do: ['Siesta máximo 20–25 min y antes de las 17:00.', 'Al levantarte: paseo de 10 min o mini rutina de movilidad de 5 min.', 'Pon la tele DESPUÉS del paseo, no antes.', 'Si picas viendo la tele: bebida (agua con gas, infusión) o palomitas medidas, nunca la bolsa entera.'] },
    { id: 'badday', icon: '🔁', title: 'Me he pasado (un día o un finde)', when: 'Atracón, cena grande, finde descontrolado',
      do: ['Regla de la siguiente comida: la próxima comida vuelve al plan. No la siguiente semana.', 'No compenses con ayuno ni con cardio extra. Pésate como siempre y espera a la media semanal.', 'Una subida de 1–2 kg tras un día así es casi todo agua y sal: baja en 3–5 días.', 'Anota qué lo provocó (hambre, estrés, sueño, social) para preparar la próxima vez.'] },
    { id: 'nosleep', icon: '😴', title: 'He dormido mal', when: 'Menos de 6 h o noche mala',
      do: ['Ese día: proteína alta, café antes de las 15:00, pasos sí; gimnasio con 1 serie menos o sesión exprés.', 'No es día para pesarse y sacar conclusiones.', 'Siesta de 20 min permitida (antes de las 17:00).'] },
    { id: 'stress', icon: '🧠', title: 'Semana de mucho estrés o trabajo', when: 'Oposición, entregas, imprevistos',
      do: ['Modo mínimo viable: desayuno preparado, proteína en cada comida, 6.000+ pasos y 1 sesión exprés.', 'Usa las opciones "sin cocinar": barqueta mejorada, salmorejo completo, yogures proteicos.', 'Mantener el peso una semana difícil también es un buen resultado.'] },
    { id: 'xmas', icon: '🎄', title: 'Navidad', when: 'Semanas 8–9 (21 dic – 3 ene)',
      do: ['Fechas de fiesta: Nochebuena, Navidad, Nochevieja, Año Nuevo y Reyes. El resto de días, plan normal.', 'En las comidas de fiesta: proteína primero, 1 plato de entrantes, 1 postre, turrón en raciones.', 'Paseo largo al día siguiente de cada fiesta.', 'Objetivo realista: salir de las fiestas con la misma media semanal (±1 kg).'] },
    { id: 'carnaval', icon: '🎭', title: 'Carnaval', when: 'Semana 15 (mediados de febrero)',
      do: ['Cena de proteína y verdura en casa antes de salir.', 'Agua siempre en la mano; refresco zero si quieres algo con sabor.', 'Comida de la calle: elige 1 cosa y disfrútala; no un picoteo continuo.', 'Al día siguiente: desayuno normal, paseo y a la cama pronto.'] },
    { id: 'sick', icon: '🤒', title: 'Enfermo o lesionado', when: 'Resfriado, gripe o lesión',
      do: ['Con fiebre o síntomas por debajo del cuello: nada de entreno.', 'Come a mantenimiento (≈ +400 kcal) y mantén la proteína.', 'Vuelve con la sesión exprés y RIR 3 la primera semana.'] },
    { id: 'plateau', icon: '📉', title: 'El peso no baja', when: '2+ semanas sin bajar la media',
      do: ['Revisa la adherencia real (≥ 80 %), las comidas fuera y los pasos.', 'Mira la cintura: si baja, sigue igual (recomposición o agua).', 'Si de verdad está parado 2–3 semanas con ≥ 80 % de cumplimiento: −100/150 kcal o +1.500 pasos.', 'Nunca bajes de 1.900 kcal sin consultarlo con un profesional.'] },
    { id: 'travel', icon: '✈️', title: 'Viaje o día fuera', when: 'Excursiones, viajes, días de playa',
      do: ['Lleva snacks de proteína: yogur proteico en nevera, pollo mechado, huevos cocidos, atún.', 'Camina todo lo que puedas: esos días los pasos se disparan solos.', 'Una comida libre al día como máximo; el resto, plato sencillo con proteína.'] }
  ];

  /* ---------- Revisión semanal ---------- */
  const reviewQuestions = [
    '¿Cuál ha sido tu media de peso esta semana y cuánto ha cambiado frente a la anterior?',
    '¿Cuánto ha cambiado la cintura?',
    '¿Qué porcentaje de comidas cumpliste (objetivo ≥ 80 %)?',
    '¿Cuántas veces comiste fuera y cómo aplicaste las reglas?',
    '¿Hiciste las 2 sesiones de gimnasio? ¿Subiste carga o repeticiones en algún básico?',
    '¿Media de pasos diarios?',
    '¿Media de horas de sueño y calidad (1–5)?',
    '¿Energía, hambre y estrés (1–5)?',
    '¿Qué situación te puso a prueba y qué regla funcionó o falló?',
    '¿Qué UNA cosa vas a mejorar la semana que viene?'
  ];

  const adjustRules = [
    'Usa SIEMPRE la media semanal (lunes a domingo), nunca un peso suelto. Mínimo 4 pesajes por semana.',
    'Ritmo objetivo: perder 0,5–1 % del peso por semana (≈0,5–1 kg/semana para ti), más rápido la 1.ª semana por el agua.',
    'Si la adherencia fue < 80 %: NO toques calorías. El ajuste es cumplir el plan.',
    'Si con ≥ 80 % de adherencia la media baja < 0,25 kg/semana durante 2 semanas seguidas (y la cintura no baja): −100/150 kcal (quítalas de grasas y carbohidratos, nunca de la proteína) o +1.500 pasos diarios.',
    'Si baja > 1,2 kg/semana durante 2 semanas seguidas (a partir de la semana 3), o el hambre, la fatiga o la fuerza empeoran: +100/150 kcal.',
    'Si la media sube 2 semanas seguidas con ≥ 80 % de adherencia: revisa sal, sueño y comidas fuera; si no hay explicación, −150 kcal.',
    'Un ajuste cada 2 semanas como máximo. Después espera 2 semanas a ver el efecto.',
    'Suelo: no bajar de ~1.900 kcal ni de 160 g de proteína sin consultarlo con un profesional.'
  ];

  /* ---------- Temas de la app ---------- */
  const themes = [
    { id: 'oceano',   name: 'Océano (por defecto)', mode: 'dark',  bg: '#0b1622', bg2: '#10324a', surface: '#13263a', text: '#e8f1f8', muted: '#8fa7bd', primary: '#2ec4b6', accent: '#ffb703', danger: '#ef476f', success: '#3ddc97', gradient: true },
    { id: 'teide',    name: 'Teide',               mode: 'dark',  bg: '#1a1110', bg2: '#3b1f17', surface: '#2a1a16', text: '#f7ece6', muted: '#bfa59a', primary: '#ff7a3d', accent: '#ffd166', danger: '#e63946', success: '#8ac926', gradient: true },
    { id: 'laurisilva',name: 'Laurisilva',         mode: 'dark',  bg: '#0d1712', bg2: '#173826', surface: '#14271d', text: '#e9f5ec', muted: '#93b39e', primary: '#52b788', accent: '#d9ed92', danger: '#e76f51', success: '#95d5b2', gradient: true },
    { id: 'atardecer',name: 'Atardecer',           mode: 'dark',  bg: '#1b1029', bg2: '#4a1942', surface: '#2a1838', text: '#fbeffa', muted: '#c3a6c7', primary: '#ff6b9a', accent: '#ffc857', danger: '#ff4d6d', success: '#7bdff2', gradient: true },
    { id: 'arena',    name: 'Arena',               mode: 'light', bg: '#f6efe4', bg2: '#ead9c0', surface: '#fffaf2', text: '#2f2418', muted: '#7c6a55', primary: '#c96b2c', accent: '#2a9d8f', danger: '#c0392b', success: '#2e8b57', gradient: true },
    { id: 'claro',    name: 'Minimal claro',       mode: 'light', bg: '#f4f5f7', bg2: '#f4f5f7', surface: '#ffffff', text: '#15181d', muted: '#6b7280', primary: '#2563eb', accent: '#f59e0b', danger: '#dc2626', success: '#16a34a', gradient: false },
    { id: 'oscuro',   name: 'Minimal oscuro',      mode: 'dark',  bg: '#0e0f11', bg2: '#0e0f11', surface: '#18191c', text: '#ececee', muted: '#8b8d93', primary: '#a78bfa', accent: '#34d399', danger: '#f87171', success: '#34d399', gradient: false },
    { id: 'contraste',name: 'Alto contraste',      mode: 'dark',  bg: '#000000', bg2: '#000000', surface: '#111111', text: '#ffffff', muted: '#d0d0d0', primary: '#ffea00', accent: '#00e5ff', danger: '#ff5252', success: '#69f0ae', gradient: false }
  ];

  const fonts = [
    { id: 'system', name: 'Sistema (SF Pro)', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { id: 'rounded', name: 'Redondeada', css: 'ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", system-ui, sans-serif' },
    { id: 'serif', name: 'Serif (New York)', css: 'ui-serif, "New York", Georgia, "Times New Roman", serif' },
    { id: 'mono', name: 'Monoespaciada', css: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
    { id: 'condensed', name: 'Condensada', css: '"Avenir Next Condensed", "Arial Narrow", "Roboto Condensed", sans-serif' },
    { id: 'humanist', name: 'Humanista', css: '"Avenir Next", Avenir, "Segoe UI", "Trebuchet MS", sans-serif' }
  ];

  const PLAN = {
    version: 3,
    defaultStart: '2026-11-02',
    targets: { kcal: 2100, kcalMin: 2000, kcalMax: 2200, protein: 170, proteinMin: 160, proteinMax: 185, fat: 62, fatMin: 55, fatMax: 75, carbs: 220, carbsMin: 190, carbsMax: 250, fiber: 30, water: 2.75, steps: 8000, sleep: 7.25, treatKcal: 150, maintenanceMin: 2550, maintenanceMax: 2850 },
    foods, recipes, mealSlots, days, dayNames, weekMenu,
    warmup, routines, expressSession, trainingRules,
    runLevels, runRules, mobility, meditation, breathing,
    roadmap, phases, dailyChecklist, weeklyChecklist, rules, reviewQuestions, adjustRules,
    themes, fonts
  };

  /* Cálculo de macros de una receta */
  PLAN.macros = function (ing, foodsDb) {
    const db = foodsDb || foods;
    const t = { k: 0, p: 0, c: 0, f: 0, fib: 0 };
    (ing || []).forEach(function (pair) {
      const fd = db[pair[0]]; const g = +pair[1] || 0;
      if (!fd) return;
      ['k', 'p', 'c', 'f', 'fib'].forEach(function (key) { t[key] += (fd[key] || 0) * g / 100; });
    });
    return t;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PLAN;
  else root.PLAN = PLAN;
})(typeof window !== 'undefined' ? window : globalThis);
