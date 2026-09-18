# Encàrrec — Fase final de consolidació del prototip

Onboarding de nou usuari, estat inicial real i reinici coherent. Preparat per enganxar directament a Claude Code.

## Context

El prototip de StudyQuest té les sis pantalles connectades a un mateix estat global (`AppContext.jsx`), però totes les proves fetes fins ara parteixen d'un estat de demo precarregat (`seedData.js`, uns 10.000-12.500 XP, activitats i progrés ja existents). Per tancar el prototip com a "resultat final" del TR (apartat 8.5.4 de la memòria) calen tres canvis, i només aquests tres:

1. Onboarding de nou usuari (nom, idioma, matèries inicials).
2. Estat inicial real (0 XP, sense progrés) quan no hi ha res a Local Storage.
3. Reinici coherent: el botó de reinici ha de tornar a l'onboarding, no al dashboard de demo.

## Abast (i què NO toca aquest encàrrec)

No afegir pantalles noves, no tocar el sistema de gamificació (XP/nivells/missions/recompenses tal com ja funcionen), no afegir base de dades, autenticació ni cap funcionalitat que no sigui necessària per als tres punts anteriors. Les dades de demo actuals (`seedData.js`, `calendarData.js`) es poden mantenir com a utilitat interna de desenvolupament; deixen de ser el que veu un usuari real en el primer ús.

## 1. Onboarding de nou usuari

Flux de 3 passos que apareix quan `state.settings.onboardingComplete` és `false` (o no existeix):

- Nou component (`src/pages/OnboardingPage.jsx` o una carpeta `src/components/onboarding/`), reutilitzant l'estil visual existent (`Card` i altres components de `components/common`).
- **Pas 1 — Nom d'usuari**: input de text (mateix camp que ja existeix a `AccountSettings.jsx`).
- **Pas 2 — Idioma**: reutilitzar `languageOptions` de `data/settingsData.js` i el mateix selector que ja hi ha a Configuració → Compte.
- **Pas 3 — Matèries inicials**: reutilitzar directament el component `SubjectSelector` (el que ja fas servir a `src/pages/SubjectsSetupPage.jsx`, ara mateix una previsualització aïllada). Aquest fitxer es pot substituir o eliminar un cop integrat al flux real.
- Botó final ("Comença" o similar) que fa `dispatch` d'una acció nova `COMPLETE_ONBOARDING` amb `{ username, language, subjectIds }`.
- Tots els textos van per `i18n/translations.js` (ca/es/en) — mai text hardcoded, com ja es fa a la resta de l'app.

A `App.jsx`: si `state.settings.onboardingComplete` és fals, renderitzar només `OnboardingPage` (sense Sidebar ni la resta de rutes/pantalles); si és cert, l'app funciona exactament com ara.

## 2. Estat inicial real (sense dades de demo)

Separar dos conceptes que ara estan mesclats: l'**estat inicial real** (zero, per a un usuari nou) i les **dades de demo** actuals (`seedData.js`), que passen a ser només una utilitat de desenvolupament.

L'estat inicial real, en completar l'onboarding, hauria de tenir:

- `progress`: XP total i disponible a 0; nivell inicial calculat amb `computeLevelInfo(0)` de `utils/levelSystem.js` (no un número fix escrit a mà); ratxa, `xpGainedToday`, `hoursStudiedToday`, `weeklySessions` i `weeklyXP` a 0; `weeklyActivity` com un array de 7 zeros.
- `subjects`: `selectedDefaultIds` = les matèries triades a l'onboarding, `custom: []`.
- `activities: {}` — sense activitats precarregades. *(Decisió oberta: si es prefereix que el Calendari no es vegi completament buit es podrien deixar 2-3 activitats d'exemple no completades, però cap `completed: true`. Confirmar amb en Lluc abans d'implementar-ho així.)*
- `missions: []` i `missionsMeta: { dailyRenewedAt: null, weeklyRenewedAt: null }` — reutilitzar `renewMissions()` (ja existent) perquè generi soles les missions disponibles del catàleg en el primer render, igual que ja fa ara.
- `ownedUnlockIds: []`, `ownedAchievementIds: []`, `eventLog: []`.
- `settings`: `username`/`language` de l'onboarding, `onboardingComplete: true`, i la resta de camps amb els valors per defecte que ja defineix `data/settingsData.js`.

Proposta d'implementació: una funció nova `buildFreshState({ username, language, subjectIds })` que retorni aquest objecte, cridada des del reducer en gestionar `COMPLETE_ONBOARDING`.

**Migració important**: un estat ja guardat a Local Storage d'una sessió de proves anterior a aquest canvi no tindrà el camp `onboardingComplete`. Igual que ja es fa a `migrateActivities()`, cal assumir-hi `onboardingComplete: true` per defecte (per no trencar les proves ja fetes) — `false` només s'aplica quan Local Storage està completament buit.

## 3. Reinici coherent

Ara: el botó "Restablir dades de proves" (targeta "Dades de proves" a `AccountSettings.jsx`) crida `clearState()` i recarrega la pàgina, que torna a carregar `seedData.js` (el dashboard de demo).

Ha de passar a fer: eliminar el progrés → en recarregar, com que Local Storage està buit, no hi ha `onboardingComplete` → es mostra l'Onboarding (punt 1) en lloc del dashboard de demo.

Si el punt 2 està ben implementat (estat inicial real per defecte quan no hi ha res a Local Storage), aquest tercer punt hauria de sortir "gratis": només cal comprovar que `clearState()` esborra tot el rastre anterior i que el primer render després del `reload()` detecta l'absència d'estat i mostra l'onboarding, no l'estat de demo antic. Es pot aprofitar per revisar el text del botó ("dades de proves" → ja serà el reinici real de l'aplicació).

## Verificació recomanada

- Esborrar Local Storage manualment i comprovar que apareix l'onboarding, no el dashboard.
- Completar l'onboarding i comprovar que el dashboard mostra 0 XP, nivell inicial, ratxa 0, sense tasques ni missions completades.
- Completar alguna activitat/missió i comprovar que tot es continua actualitzant amb normalitat (XP, nivell, estadístiques...).
- Prémer "Restablir" i comprovar que torna a l'onboarding, no al dashboard de demo.
- Repetir la comprovació en els 3 idiomes (català, castellà, anglès).

## Per documentar després al TR

Un cop fet, aquests tres canvis completen exactament el que falta a l'apartat 8.5.4 (Limitacions i aspectes pendents) i tanquen el capítol 8 amb el resultat final. Val la pena apuntar-ho al diari de desenvolupament amb el mateix format que la resta d'entrades (Objectiu / Desenvolupament / Problemes i solucions / Resultat), perquè es pugui reaprofitar directament a la memòria — inclosa la pantalla d'onboarding com a nova evidència visual.
