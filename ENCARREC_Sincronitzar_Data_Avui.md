# Encàrrec — Sincronitzar el dia "avui" amb la data real

Preparat per enganxar directament a Claude Code, mentre es documenta la fase anterior (onboarding/estat inicial/reinici) a la memòria.

## Context

Actualment `data/seedData.js` defineix `today.dateKey = '2026-06-09'` fix, i aquest valor és el que Inici i Calendari fan servir com a "dia d'avui" (per exemple, per decidir quines activitats són "d'avui", per ressaltar el dia seleccionat per defecte al Calendari, o per als càlculs setmanals). Les missions, en canvi, ja funcionen amb l'hora real del sistema (`new Date()`), tal com documenta el NOTES.md — que ho registra explícitament com una inconsistència coneguda i acceptada durant el desenvolupament ("rellotge fictici" per a activitats vs. "rellotge real" per a missions). Ara que l'app ja té onboarding i un estat inicial real, té sentit eliminar-la del tot: "avui" ha de ser sempre el dia real del sistema, igual que ja passa amb les missions.

## Què cal canviar

- Localitzar totes les referències a `today.dateKey` (o equivalent) que vinguin de `seedData.js`, i substituir-les per un càlcul dinàmic a partir de `new Date()` — per exemple, una funció `getTodayKey()` a `utils/calendarUtils.js`, reutilitzant qualsevol lògica de format de data que ja hi hagi.
- Revisar `HomePage`/`CalendarPage` i qualsevol altre lloc on es faci servir aquest "avui" (tasques d'avui, dia seleccionat per defecte al calendari, càlculs de "aquesta setmana").
- Els càlculs setmanals (`weeklyActivity`, `isInWeek()`) ja tenen en compte l'inici de setmana configurable des de Configuració; assegurar que segueixen funcionant igual, ara amb la setmana real en lloc de la fictícia.
- Les dades de demo (`seedData.js`, `calendarData.js`, usades només per `buildInitialState()` com a utilitat interna de desenvolupament) es poden mantenir amb dates fixes internament si convé per a proves, però l'aplicació NO les ha d'utilitzar mai per decidir quin dia és "avui" per a un usuari real.

## Per què val la pena fer-ho ara

Resol, com a efecte secundari positiu, la inconsistència entre "rellotge fictici" (activitats) i "rellotge real" (missions) que el mateix NOTES.md documentava com a limitació coneguda: un cop fet aquest canvi, tota l'aplicació funciona amb un únic rellotge real.

## Verificació recomanada

- Comprovar que "avui" al Calendari i a Inici coincideix amb la data real del sistema.
- Comprovar que els comptadors setmanals ("Aquesta setmana", gràfics) segueixen quadrant.
- Repetir la verificació després de fer l'onboarding des de zero i després d'un reinici.

## Per documentar

Aquest és un bon quart exemple tècnic per a les iteracions del capítol 8 i per a l'apartat "Ús de Claude Code": codi que depenia d'una data fictícia fixada al mock, adaptat perquè fes servir la data real del sistema. Anota-ho al diari amb el mateix format que la resta d'entrades.
