# Plan 120

Web app (PWA) para seguir un plan de pérdida de grasa de 120 días: dieta, fuerza, carrera, movilidad/meditación y seguimiento.

**Abrir:** https://jorgereym8-source.github.io/plan-120/ → en el iPhone, Safari → Compartir → *Añadir a pantalla de inicio*.

## Secciones
- **Hoy**: día del plan, hábito de la semana, comidas (marcar/cambiar), anillos de kcal y proteína, registro rápido y checklists.
- **Dieta**: menú semanal editable, recetas con macros recalculables, lista de la compra automática, objetivos y alimentos.
- **Entreno**: rutinas Full Body A/B editables, registro serie a serie con carga sugerida (doble progresión), descanso, historial y 1RM estimado.
- **Carrera**: intervalos guiados con sonido/vibración; el nivel sube o baja según tu valoración.
- **Progreso**: peso (media de 7 días + rango esperado), medidas, bioimpedancia, fotos privadas, revisión semanal con recomendación de ajuste, importación y copia de seguridad.
- **Bienestar**: movilidad guiada, respiración animada, meditación progresiva y sueño.
- **Plan 120**: hoja de ruta semana a semana, reglas para situaciones difíciles, hábitos y mantenimiento.
- **Ajustes**: temas, colores, fondo, translucidez, tipografía, formas, navegación y comportamiento.

## Privacidad
El repositorio no contiene datos personales. Todo lo que registras se guarda solo en tu dispositivo (localStorage + IndexedDB). Los datos iniciales se importan desde *Progreso → Datos*.

## Desarrollo
Sin dependencias ni compilación: HTML + CSS + JS. Los datos por defecto del plan están en `js/data.js`.
