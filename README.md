# StudyQuest — Prototipo (fase 1: pantalla Inici)

## Requisitos
- Node.js 18 o superior instalado en tu ordenador.

## Cómo ejecutar

```bash
cd studyquest
npm install
npm run dev
```

Luego abre en el navegador la URL que te indique la terminal
(normalmente `http://localhost:5173`).

## Qué hay implementado en esta fase
- Barra lateral de navegación (Inici / Calendari / Missions / Recompenses / Perfil).
- Pantalla **Inici** completa a nivel visual, con datos ficticios.
- El resto de pantallas muestran una página provisional ("Properament
  disponible") — se implementarán en las siguientes fases.

No hay backend, autenticación ni persistencia de datos todavía: todo el
contenido de la pantalla Inici proviene de `src/data/seedData.js`.
