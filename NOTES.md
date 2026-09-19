# StudyQuest — Notas para la fase de funcionalidades

Este documento resume el estado real del proyecto durante la fase de
funcionalidades, para que sobreviva a compactaciones de contexto o a
sesiones nuevas.

## Estado actual

Las 6 pantallas están implementadas visualmente y verificadas en navegador:
**Inici, Calendari, Missions, Recompenses, Perfil, Configuració**. Las 6
tienen ya funcionalidad real conectada al mismo estado global.

- No hay backend ni autenticación real.
- **Sí hay estado global y persistencia** desde la primera iteración de la
  fase de funcionalidades: `src/context/AppContext.jsx`
  (`AppProvider` + `useReducer`) envuelve toda la app en `App.jsx`, con
  persistencia en `localStorage` vía `src/data/storage.js`
  (clave `studyquest_state_v1`). Ver detalle en "Arquitectura de estado global".
- **Calendari también está conectado** desde la iteración anterior: el
  botón "+ Nova activitat" crea activitats reals en el estado global.
- **Inici i Calendari comparteixen ara la mateixa font de dades**
  (`state.activities`) — ja no hi ha `tasks` per separat. Veure secció
  "Unificació Inici + Calendari" més avall.
- **Missions también está conectado**: sistema completo de misiones
  (automáticas/manuales/híbridas) sobre el mismo estado global. Ver
  sección "Sistema de missions" más abajo.
- **Recompenses también está conectado** desde esta iteración: escala de
  nivel única para toda la app, XP total vs. XP disponible (gastable),
  desbloqueos automáticos/comprables y logros automáticos. Ver sección
  "Sistema de progressió (Recompenses)" más abajo.
- **Perfil también está conectado**: resumen 100% derivado de
  `activities`/`missions`/`rewards` + un registro cronológico mínimo
  (`eventLog`) nuevo en el estado global. Ver sección "Pantalla Perfil"
  más abajo.
- **Configuració también está conectada, las 4 subpantallas**: cuenta
  editable con foto, notificaciones internas + reales del navegador,
  tema/color/modo compacto/animaciones aplicados globalmente, Pomodoro +
  objetivo diario de tareas (con efecto real en Inici) + inicio de semana
  (con efecto real en cálculos semanales), y un **sistema de
  traducciones centralizado** (ca/es/en) usado por toda la app. Ver
  sección "Pantalla Configuració" más abajo.
- **Fase final de consolidació (cierre del prototipo)**: onboarding real de
  3 pasos (nombre/idioma/materias), estado inicial real (0 XP, sin
  progreso) para un usuario nuevo — las demos de `seedData.js`/
  `calendarData.js` pasan a ser solo una utilidad interna de desarrollo,
  invisible para un usuario real — y reinicio coherente (el botón
  "Reiniciar aplicació" devuelve al Onboarding, no al dashboard de demo).
  Ver sección "Fase final de consolidació" más abajo.
- **"Avui" sincronizado con la fecha real**: ya no queda ninguna fecha
  fictícia — `today.dateKey` (Inici/Calendari) venía fijo a `2026-06-09`
  en `seedData.js`; ahora se calcula siempre a partir de `new Date()`
  (`getTodayKey()`), igual que ya hacían las missions. Ver sección
  "Sincronitzar el dia d'avui amb la data real" más abajo.
- **Tutorial inicial**: recorregut guiat "spotlight" de 8 pasos justo
  después del Onboarding (Inici, Calendari, Missions, Recompenses, Perfil
  — Configuració queda fuera), con pasos activos donde el usuario hace la
  acción real (crear una tarea, completarla, iniciar una misión) para
  avanzar. Ver sección "Tutorial inicial" más abajo.

### Elementos ya dibujados pero SIN conectar (decorativos)

Estos ya existen en el JSX/CSS con su aspecto final, pero no tienen
`onClick` real ni efecto:

- **Missions**: chevron `›` al final de cada `MissionCard` (decorativo,
  no lleva a ninguna pantalla de detalle — no se ha pedido).

~~**Inici** checkbox de tareas~~ → conectado al estado global.
~~**Calendari** "+ Nova activitat"~~ → conectado al estado global.
~~**Missions** "Iniciar missió"~~ → conectado al estado global (ver
"Sistema de missions" más abajo).
~~**Configuració → Compte** "Canviar foto"/"Desar canvis"/"Tancar
sessió"~~ → conectados (ver "Pantalla Configuració" más abajo).

## Archivos de datos por pantalla

| Pantalla | Archivo | Contenido principal |
|---|---|---|
| Inici | `data/seedData.js` | `user` (nombre), `weeklyActivity` seed, `dailyGoalsConfig`, `pendingGoalsConfig`, `initialProgress` — usados solo para poblar el estado global la primera vez (dashboard de demo, ver "Fase final de consolidació"). Ya no exporta `tasks`/`subjects` (ver "Unificació Inici + Calendari") ni `today` (ver "Sincronitzar el dia d'avui amb la data real" — ahora `getTodayKey()`/`buildToday()` en `AppContext.jsx`) |
| Calendari | `data/calendarData.js` | `initialActivities` (por fecha) — **única fuente semilla de actividades**, usada tanto por Inici como por Calendari para poblar `state.activities` la primera vez |
| Missions | `data/missionsData.js` (solo `difficulties`/`missionTypes`/`filters`, diccionarios de presentación) + `data/missionTemplates.js` (catálogo de plantillas) | Las misiones reales viven en `state.missions` — ver "Sistema de missions" |
| Recompenses | `utils/levelSystem.js` (escala única de 15 nivells) + `data/rewardsCatalog.js` (desbloquejos/assoliments) + `data/rewardsData.js` (solo `unlockCategories`, etiquetas) | Todo lo real (nivel, XP, desbloqueos obtenidos, logros) viene de `useApp()` — ver "Sistema de progressió" |
| Perfil | *(sin archivo mock propio — `data/profileData.js` se eliminó)* | Todo viene de `useApp().profile` (ver `utils/profileEngine.js`), derivado de `activities`/`missions`/`rewards`/`eventLog` |
| Configuració | `data/settingsData.js` | Solo lo que sigue siendo estático: `languageOptions`, `accentColors` (`id`/`color`, etiquetas traducidas), y las opciones numéricas de Pomodoro/objetivo diario/inicio de semana (`weekStartOptions` con valores `monday`/`sunday`). Los 4 subapartados (Compte/Notificacions/Aparença/Estudi) leen y escriben en `useApp().settings` |
| *(i18n)* | `i18n/translations.js` | Diccionario ca/es/en centralizado — ver "Pantalla Configuració" |

✅ **Inconsistencia resuelta en esta iteración**: hasta ahora convivían dos
escalas de nivel distintas (la de 5.000 XP fijos/nivel de Inici/Sidebar, y
la tabla de 10 niveles de Recompenses). Ya no — ver "Sistema de progressió"
más abajo para la escala única definitiva.

## Arquitectura de estado global (implementada en la iteración de Inici)

`src/context/AppContext.jsx` (`AppProvider` + `useReducer`) envuelve toda
la app en `App.jsx`. Persistencia en `localStorage` vía
`src/data/storage.js` (clave `studyquest_state_v1`, todo el estado
serializado en cada cambio).

Forma del estado (actualizada a fecha de la iteración de Configuració — es
la forma real y completa a día de hoy):
```
state = {
  weeklyActivity: [...], // horas por día de la semana (DL..DG)
  progress: {
    level, xpTotal, xpAvailable, xpCurrentLevel, xpNextLevel,
    streakDays, streakTarget, streakBoostedToday, maxStreak,
    xpGainedToday, hoursStudiedToday,
    weeklySessions, weeklyXP,
  },
  subjects: { selectedDefaultIds, custom },
  activities: { [dateKey]: [Activity, ...] }, // única font per a Inici i Calendari
  missions: [Mission, ...],                   // array pla, totes les categories/estats
  missionsMeta: { dailyRenewedAt, weeklyRenewedAt }, // dates reals (renovació)
  ownedUnlockIds: [...],       // desbloquejos obtinguts (automàtics + comprats)
  ownedAchievementIds: [...],  // assoliments obtinguts
  eventLog: [Event, ...],      // registre cronològic — veure "Pantalla Perfil"
  settings: {                  // Configuració — veure "Pantalla Configuració"
    username, language, onboardingComplete, avatarDataUrl, sessionActive,
    notifications: { taskReminder, streakReminder, reminderTime, xpGain,
      weeklySummary, notificationSound, lastStreakReminderDateKey,
      lastWeeklySummaryWeekKey },
    appearance: { theme, accentColor, compactMode, animations },
    // Estudi — camps plans, no imbricats (veure "Subapartado Estudi")
    studySessionDuration, studyBreakDuration, autoBreak, focusSound,
    dailyTaskGoal, weekStartsOn,
  },
}
```

Acciones del reducer (`AppContext.jsx`), por área:
- Activitats/Inici/Calendari: `TOGGLE_TASK` (completar/desmarcar),
  `ADD_ACTIVITY`, `UPDATE_ACTIVITY`, `DELETE_ACTIVITY`.
- Matèries: `TOGGLE_DEFAULT_SUBJECT`, `ADD_CUSTOM_SUBJECT`,
  `REMOVE_CUSTOM_SUBJECT`.
- Missions: `START_MISSION`, `ADJUST_MANUAL_PROGRESS`, `COMPLETE_MISSION`,
  `CREATE_PERSONAL_MISSION`.
- Recompenses: `PURCHASE_UNLOCK`.
- Configuració: `SAVE_ACCOUNT_INFO` (nom+idioma), `SET_LANGUAGE` (només
  idioma, aplicació immediata — usat per l'Onboarding, pas 2), `SET_AVATAR`,
  `UPDATE_NOTIFICATIONS` (pedaç parcial), `UPDATE_APPEARANCE` (pedaç
  parcial), `UPDATE_STUDY` (pedaç parcial), `SET_SESSION_ACTIVE`
  (tancar/obrir sessió), `RESET_APP` (reinici complet de l'aplicació,
  torna a l'Onboarding — veure detall més avall).
- Onboarding: `COMPLETE_ONBOARDING` (`{ username, language }` — construeix
  l'estat real d'un usuari nou; veure "Fase final de consolidació").

Cada dispatch passa primer per `renewMissions()` (renovació de missions
diàries/setmanals si cal) i, en acabar, per `finalizeDispatch(current, next)`
(abans `evaluateRewards`): aplica desbloquejos/assoliments automàtics
(`applyAutomaticRewards`) i, comparant l'estat d'abans i després d'aquest
dispatch, hi afegeix a `eventLog` qualsevol esdeveniment notable derivat
(`collectDispatchEvents`) — veure "Pantalla Perfil" més avall per al detall.

Decisiones clave:
- **Nivel = escala única de 15 niveles** (`src/utils/levelSystem.js`,
  `computeLevelInfo(xpTotal)`) — ya no el sistema plano de 5.000 XP/nivel
  de las primeras iteraciones. Ver "Sistema de progressió" más abajo.
- `applyXpDelta` es simétrica: sumar/restar XP sube/baja nivel de forma
  reversible, para que desmarcar una tarea revierta exactamente lo que
  provocó al marcarla (XP, hores, nivell, ratxa si corresponia).
- La ratxa (`streakDays`) sube una vez cuando se cumplen los 3 objectius
  d'avui (`streakBoostedToday` evita subirla más de una vez por sesión) y
  baja si se desmarca una tarea y dejan de cumplirse.
- **Fix de una inconsistencia previa del mock**: la tarjeta "Hores aquesta
  setmana" mostraba un `15.0h` fijo que no coincidía con la suma real de
  `weeklyActivity` (31h). Ahora se deriva siempre de `weeklyActivity`,
  como pedía la fase de funcionalidades.
- **Sidebar, Recompenses y Configuració también se conectaron** al mismo
  `user` de `useApp()` (nivel/XP), porque mostraban el mismo dato que
  Inici — dejarlos con el valor estático antiguo habría roto la
  coherencia entre pantallas y, de hecho, rompía la build (`rewardsData.js`
  reexportaba el `user` de `seedData.js`, que ya no tiene esos campos). No
  se tocó ningún otro comportamiento de esas pantallas.

## Sistema de matèries de l'usuari (preparación para Calendario)

Implementado como paso previo a la funcionalidad de Calendario, para que
el futuro selector de "Nova activitat" pueda usar directamente las
materias reales del usuario en vez de las 4 categorías fijas que usan hoy
Inici/Calendari (`matematiques`/`fisica`/`ciencies`/`humanitats` en
`seedData.js` — **esas NO se han tocado ni fusionado con esto**, son dos
conceptos separados a propósito por ahora).

- `src/data/subjectsCatalog.js` — catálogo fijo de 12 materias
  predeterminadas (`defaultSubjectsCatalog`), con `id`/`name`/`color`. El
  usuario solo puede seleccionarlas, nunca editarlas.
- Nueva sección `subjects` dentro del mismo `state` de `AppContext`:
  `{ selectedDefaultIds: [], custom: [] }`. Persiste en el mismo
  `localStorage` (`studyquest_state_v1`); un estado guardado de antes de
  esta iteración se migra automáticamente añadiendo esta sección vacía sin
  perder tasks/progress.
- Acciones nuevas: `TOGGLE_DEFAULT_SUBJECT`, `ADD_CUSTOM_SUBJECT` (valida
  nombre no vacío y sin duplicados, insensible a mayúsculas, contra el
  catálogo y las ya añadidas), `REMOVE_CUSTOM_SUBJECT`.
- Selector `subjects.userSubjects` en el `useApp()` — lista ya combinada
  y resuelta (predeterminadas seleccionadas + personalizadas, cada una con
  `id`/`name`/`color`), pensada para que "Nova activitat" la consuma
  directamente cuando se implemente.
- UI mínima: `src/components/subjects/SubjectSelector.jsx` (+
  `subjects.css`). En esta iteración se usaba dentro de una previsualización
  aislada (`src/pages/SubjectsSetupPage.jsx`, abierta solo con
  `http://localhost:5173/#materies`) — **ya eliminada**: el componente se
  integró tal cual (sin cambiar su lógica, solo traduciendo sus textos) al
  paso 3 del Onboarding real. Ver "Fase final de consolidació" más abajo.

## Nova activitat (Calendari)

El botó "+ Nova activitat" abre un modal (`src/components/calendar/NewActivityModal.jsx`)
que crea activitats reals dins de `state.activities` (nova secció del
mateix `AppContext`, poblada inicialment amb `initialActivities` de
`calendarData.js`). El Calendari ja no té dades mock pròpies: `CalendarPage`
llegeix `activities`/`subjects` de `useApp()`.

### Estructura d'una activitat

```js
{
  id,            // "act-<timestamp>-<random>" (o l'id antic de seed: "t1", "c3"...)
  title,
  time,          // "HH:MM"
  durationMin,   // minuts (enter)
  subjectId,     // id de subjectsCatalog.js o d'una matèria personalitzada
  type,          // veure activityTypes
  xp,            // calculat, mai introduït per l'usuari
  completed,     // des de la unificació amb Inici (veure secció següent)
  urgent,        // opcional — només algunes activitats semilla migrades d'Inici el tenen
}
```
Es desa dins `state.activities[dateKey]` (diccionari per data). **Des de
la iteració següent, aquesta és també la font de dades d'Inici** — veure
"Unificació Inici + Calendari".

La data de l'activitat és sempre el dia seleccionat al calendari (no hi ha
selector de data al modal, tal com mostra el disseny de Figma); editar
tampoc permet canviar-la.

### Opcions fixes (`src/data/activityOptions.js`)

- **Durada** (`activityDurationOptions`, es tria amb `SegmentedControl`,
  no es pot escriure lliurement): 30 min, 45 min, 1h, 1h 30min, 2h, 3h.
- **Tipus** (`activityTypes`): Estudi, Exercicis, Deures, Examen, Pràctica,
  Treball, Presentació. Es guarda dins l'activitat (`type`) per poder-lo
  fer servir més endavant.

### Fórmula d'XP (`src/utils/xpFormulas.js`) — provisional, fàcil d'ajustar

```js
BASE_XP_PER_HOUR_BY_TYPE = {
  estudi: 60, exercicis: 70, deures: 60,
  practica: 80, treball: 90, presentacio: 100, examen: 150,
}
xp = round((BASE_XP_PER_HOUR_BY_TYPE[type] * durationMin) / 60 / 5) * 5
```
XP per hora segons el tipus, multiplicat per la durada real i arrodonit
als 5 XP més propers. La mateixa funció s'usa a la previsualització del
botó del modal ("Afegir activitat · +XXX XP") i dins del reducer
(`ADD_ACTIVITY`), perquè el valor mostrat sigui sempre exactament el que
es desa — no hi ha dues fórmules ni l'usuari pot introduir XP a mà. Ajustar
el càlcul en el futur només requereix tocar aquesta taula/fórmula.

**Important**: crear una activitat NO suma XP a `progress.xpTotal` de
manera immediata — l'`xp` que porta l'activitat és XP "disponible"
(consistent amb el banner "XP disponible avui" que ja existia), no XP
"guanyat". Encara no hi ha cap concepte de "completar" una activitat de
Calendari (a diferència de les tasques d'Inici); implementar-ho és fora de
l'abast d'aquesta tasca ("sistema complet de sessions d'estudi" — llistat
explícitament com a NO fer encara).

### Sistema de matèries reutilitzat, no duplicat

El selector "Matèria" del modal usa directament `subjects.userSubjects`
(predeterminades seleccionades + personalitzades). Si l'usuari no ha
seleccionat cap matèria encara, el modal ho indica i el botó de submit
queda deshabilitat — cal seleccionar-ne almenys una des de Configuració
(o des del pas 3 de l'Onboarding, veure "Fase final de consolidació" més
avall) abans de poder crear una activitat.

### Migració de les activitats semilla (`calendarData.js`)

Com que "Examen" ha passat de ser una materia falsa a un `type` real, i el
`subjectId` ara fa referència al catàleg de 12 matèries (no a les 4
categories antigues `matematiques/fisica/ciencies/humanitats`), les
activitats d'exemple s'han remapejat:
- `examen` (materia falsa) → `type: 'examen'` amb una materia real
  (Química, Matemàtiques).
- `ciencies` → `biologia` o `quimica` segons el contingut de l'activitat.
- `humanitats` → `catala` o `castella` segons el contingut.
- `duration: '2h'` (text) → `durationMin: 120` (number); l'entrada amb
  `duration: 'Límit'` (una data d'entrega, no una sessió d'estudi) es
  manté com a cas especial amb `durationMin: 0` → `formatDuration()` ho
  mostra com "Límit".
- Els valors `xp` originals de les activitats semilla **no** s'han
  recalculat amb la fórmula nova (es mantenen tal qual per continuïtat
  visual) — però en el moment que se n'edita una, el seu XP es recalcula
  automàticament amb la fórmula i deixa de ser el valor "a mà" original
  (comportament esperat, no és un bug).

### Resolució de colors de matèria (`src/utils/calendarUtils.js`)

`buildSubjectsById(customSubjects)` combina el catàleg complet (no només
les seleccionades) amb les personalitzades en un diccionari `id -> {name,
color}`, perquè una activitat pugui mostrar-se correctament encara que la
seva matèria no estigui "seleccionada" ara mateix (p. ex. activitats
semilla d'una matèria que l'usuari encara no ha triat). `getSubjectInfo()`
dona un valor per defecte segur si l'id no existeix (matèria personalitzada
eliminada després de fer-se servir en una activitat — cas límit no
bloquejant). La llegenda de colors del `MonthGrid` ara mostra
`subjects.userSubjects` (dinàmica, pot estar buida) en lloc de la llista
fixa de 5 elements d'abans.

## Unificació Inici + Calendari

Fins ara Inici tenia el seu propi `state.tasks` (5 tasques fixes, sistema
de matèries antic de 4 categories) totalment independent de
`state.activities` del Calendari. Aquesta iteració els fusiona en una
sola font: **`state.tasks` ha desaparegut; tot viu a `state.activities`**.

### Migració de les 5 tasques d'Inici

Es van migrar a `calendarData.js` com a activitats normals més (mateixos
ids `t1`..`t5` per continuïtat), amb dates ISO reals en lloc de labels
com "Avui"/"Demà"/"Dv 15:00":
- t1, t3, t4 → `2026-06-09` (avui)
- t2 → `2026-06-10` (demà)
- t5 → `2026-06-11` (dijous d'aquella setmana)

`t4` ("Exercicis d'Àlgebra Lineal") es manté `completed: true` des de
l'inici (abans representava una tasca "ja feta" un divendres passat; ara
es data avui per seguir demostrant l'estat "completada" des del primer
carregament sense necessitat d'una data històrica). Les seves matèries
antigues (`ciencies`/`humanitats`) es van remapejar al catàleg nou
(`biologia`, `catala`) igual que ja es va fer amb les activitats del
Calendari en la iteració anterior. `urgent` es manté com a camp opcional
només per no perdre aquest matís visual (Tag "URGENT") que ja existia —
el modal "Nova/Editar activitat" no el gestiona (no demanat en aquesta
iteració).

### Prioritat de "Tasques previstes" (Inici)

`getUpcomingActivities()` a `AppContext.jsx`: aplana totes les activitats,
**descarta les de dies anteriors a avui**, ordena per `dateKey` i després
per `time`, i talla a `UPCOMING_TASKS_LIMIT = 5` (mateix nombre de files
que ja tenia el disseny — no s'ha tocat la targeta ni el seu alçada/espai
per no fer un redisseny visual). Conseqüència directa: si avui ja té 5+
activitats, cap de demà hi cap — exactament el criteri demanat ("no
priorices actividades futuras por delante de una actividad de hoy").
Verificat en viu eliminant activitats d'avui fins deixar espai i
comprovant que la primera activitat de demà hi apareixia.

`pendingTasksCount` es calcula sobre aquesta mateixa llista retallada
(coherent amb el que es veu). `tasksCompletedToday`/"Tasques avui" ara es
calculen mirant únicament `activities[today.dateKey]` (abans mirava tot
l'array fix de 5, cosa que ja no té sentit ara que les dates són reals) —
és una millora de precisió semblant a la del fix "Hores aquesta setmana"
de la iteració anterior.

### Editar i eliminar activitats (Calendari)

`SelectedDayPanel.jsx` afegeix dos botons petits (llapis/paperera,
`IconPencil`/`IconTrash` noves a `Icons.jsx`) a cada targeta d'activitat.
- **Editar** obre `NewActivityModal` amb `activity` precarregada (mateix
  formulari, títol "Editar activitat", botó "Desar canvis · +XXX XP");
  actualitza en lloc de crear (`UPDATE_ACTIVITY`). Mai canvia la data.
- **Eliminar** demana confirmació amb `window.confirm()` nadiu (elecció
  deliberada per simplicitat — cap disseny nou necessari) abans de
  despatxar `DELETE_ACTIVITY`.

Com que `state.activities` és l'única font, actualitzar/eliminar es
reflecteix automàticament a Inici, al Calendari i a la distribució
setmanal — no calia cap sincronització addicional.

### XP disponible vs. XP guanyat (regla important)

- **Activitat NO completada**: editar-la o eliminar-la **no toca mai**
  `progress.xpTotal` ni cap altra mètrica global — el seu XP és només
  "disponible/previst". Aquest és el comportament explícitament demanat.
- **Activitat SÍ completada**: aquí calia prendre una decisió no
  especificada literalment a l'encàrrec. Es va optar per **revertir la
  seva contribució antiga i (en edició) aplicar la nova**, reutilitzant
  `applyActivityEffect()` (la mateixa funció que fa servir
  completar/descompletar des d'Inici) — si no ho féssim així, esborrar una
  activitat ja completada deixaria un XP "fantasma" per sempre a
  `xpTotal`, incoherent amb el que realment representen les activitats
  completades. Verificat en viu: editar la durada d'una activitat
  completada (`t4`) va recalcular `xpTotal`, `xpGainedToday`,
  `hoursStudiedToday` i el gràfic setmanal exactament pel delta esperat
  (-10 XP en aquell cas concret).
- `applyActivityEffect(state, dateKey, xp, durationMin, sign)` és la
  funció compartida per completar/descompletar, editar i eliminar: aplica
  XP total/nivell sempre; `xpGainedToday`/`hoursStudiedToday` només si
  `dateKey === today.dateKey`; `weeklySessions`/`weeklyXP`/la barra
  corresponent del gràfic "Aquesta setmana" només si `dateKey` cau dins la
  setmana actual (`isInWeek()`, nou a `calendarUtils.js`). És a dir,
  completar una activitat d'un altre dia de la setmana ja actualitza la
  barra d'aquell dia concret, no la d'avui.
- "XP disponible avui" (Calendari) ara només suma les activitats
  **pendents** del dia seleccionat (abans sumava totes, completades o no,
  ja que "completar" no existia al Calendari) — petit ajust de coherència,
  no un canvi de disseny.

### Completar activitats des del Calendari

**No implementat encara.** Marcar com a completada només és possible des
d'Inici (checkbox de sempre, ara operant sobre `activities` en lloc de
`tasks`). El Calendari mostra visualment quines activitats ja estan
completades (opacitat reduïda + títol ratllat a `SelectedDayPanel`) però
no té el seu propi control per completar-les — deliberadament fora
d'abast ("no avances más allá de lo que ya está implementado").

### Migració de `localStorage`

Un estat persistit d'una sessió anterior a aquesta unificació tenia
`state.tasks` (ja no s'usa, es descarta en carregar) i `state.activities`
sense els camps `completed`/`completedAt` (creades abans que existissin
aquests conceptes). `migrateActivities()` a `AppContext.jsx` els afegeix
per defecte (`false`/`null`) a qualsevol activitat que no els tingui, en
carregar l'estat.

## Sistema de missions

Fins ara Missions mostrava un array fix de 12 missions fictícies. Ara les
missions viuen a `state.missions` (array pla, totes les categories i
estats barrejats — el filtratge per categoria el fa la UI, com ja feia
abans) i deriven sempre d'un catàleg de plantilles fix
(`src/data/missionTemplates.js`), mai es generen ad hoc. Tota la lògica
de negoci (instanciar, calcular progrés, renovar, recomanar) viu en
funcions pures a `src/utils/missionEngine.js`, sense dependències de React
ni de la forma exacta de `AppContext` — es pot revisar/ajustar aïlladament.

### Estructura d'una missió (`state.missions[i]`)

```js
{
  id, templateId, title, description,
  category,       // 'daily' | 'weekly' | 'special' | 'personal'
  difficulty,      // 'easy' | 'medium' | 'hard' | 'epic'
  trackingType,    // 'automatic' | 'manual' | 'hybrid'
  status,          // 'available' | 'active' | 'completed'
  xpReward,
  startedAt,       // ISO real (Date.now()), null si 'available'
  completedAt,     // ISO real, null fins que es completa
  subjectId,       // opcional (missions lligades a una matèria)
  // Simples (automatic/manual):
  metric, unit, target, progress,   // `progress` només s'usa/es desa per a les manuals
  finalProgress,   // només un cop 'completed': valor congelat (veure més avall)
  // Híbrides:
  conditions,      // [{ conditionId, label, metric, trackingType, target, unit, progress }]
}
```

**Important**: `progress`/`finalProgress` de les automàtiques (i el
`progress` de les condicions automàtiques d'una híbrida) **no és la font
de veritat mentre la missió està activa** — es calcula en directe a
`getMissionDisplay()` a partir de les activitats completades dins la
finestra `[startedAt, ara]`, cada vegada que es demana. Només es "desa"
(`finalProgress` / `conditions[i].progress`) en el moment de completar-se,
per congelar-lo — veure "Per què es congela el progrés" més avall.

### Rellotge real vs. rellotge fictici (històric — ja unificat)

⚠️ **Resolt a la fase "Sincronitzar el dia d'avui amb la data real"** (veure
secció final del document): des d'aleshores `today.dateKey` ja NO és fix,
és sempre `getTodayKey()` (data real del sistema). Es manté aquesta secció
tal qual (context històric de per què les missions ja anaven per lliure)
perquè segueix explicant correctament el disseny de `mission.startedAt`/
`completedAt` i `activity.completedAt` — només la frase següent ha quedat
desactualitzada:

Les activitats (Inici/Calendari) vivien en una **data fictícia fixa**
(`today.dateKey = '2026-06-09'`, a `seedData.js`). Les missions, en canvi,
sempre han viscut en **temps real** (`new Date()` / `Date.now()`), igual
que el `ResetTimer` (compta fins a la mitjanit real del sistema). Per tant:
- `mission.startedAt`/`completedAt` són timestamps reals.
- `activity.completedAt` (nou camp, veure més avall) també és un
  timestamp real — és "quan l'usuari ho ha marcat de veritat", diferent
  de `activity.dateKey`/`time` (quan estava *programada* l'activitat,
  dins la data fictícia).
- Una missió automàtica compta **qualsevol activitat completada després
  del seu `startedAt` real**, sense importar per a quin dia fictici
  estigués programada.

⚠️ **Inconsistència coneguda i documentada** (com demana el punt 14 de
l'encàrrec, en lloc d'improvisar): l'XP de missions **no** s'afegeix a
`progress.xpGainedToday`/`hoursStudiedToday`/`weeklySessions`/`weeklyXP`
(els objectius diaris/setmanals d'Inici) — només a `progress.xpTotal` i
al nivell. Fer-ho consistentment requeriria decidir a quin "dia fictici"
pertany una missió completada en temps real, cosa que barrejaria els dos
rellotges de manera arbitrària. És un límit conscient, no un oblit.

### Camp nou a les activitats: `completedAt`

`toggleTask` (Inici/Calendari) ara desa `completedAt: new Date().toISOString()`
en completar una activitat, i el torna a `null` en desmarcar-la. És
l'únic camp nou que calia afegir al model d'activitats existent per fer
possible el seguiment automàtic de missions.

### A. Missions automàtiques

`trackingType: 'automatic'`. El progrés es calcula amb `computeMetricValue()`
sobre les activitats completades dins `[startedAt, ara]`:
- `activitiesCompleted` — nombre d'activitats completades.
- `hoursStudied` — suma de `durationMin/60`.
- `xpEarned` — suma de `xp` (disponible al motor, no usada per cap
  plantilla del catàleg inicial, útil per a futures plantilles).
- `subjectsWorked` — nombre de matèries diferents treballades.
- `activeDays` — dies reals diferents amb alguna activitat completada.
- `subjectActivity` — 1/0 si hi ha alguna activitat d'una matèria concreta
  (`mission.subjectId`).

Es reavaluen (`reevaluateAutomaticMissions`) després de **completar,
descompletar, editar o eliminar** qualsevol activitat (a `toggleTask`,
`updateActivity`, `deleteActivity`) i també en iniciar una missió. Quan el
progrés arriba a l'objectiu, es completen soles: `status: 'completed'`,
`completedAt: ara`, i s'atorga `xpReward` una única vegada
(`applyXpDelta`, la mateixa funció que fan servir tasques/activitats).

### B. Missions manuals

`trackingType: 'manual'`. `progress` es desa directament a la missió i es
modifica amb `ADJUST_MANUAL_PROGRESS` (botons +/- de `MissionCard`),
sempre clampat a `[0, target]`. **Mai es completen soles**: quan
`progress >= target` apareix el botó "Completar missió"
(`canComplete: true`), i només en prémer-lo (`COMPLETE_MISSION`) s'atorga
l'XP i es marca `completed`. El guard `status !== 'active'` dins
`completeMission` evita atorgar l'XP dues vegades si es despatxa
l'acció repetidament.

### C. Missions híbrides

`trackingType: 'hybrid'`, amb `conditions[]` — cada condició és
`automatic` o `manual` independentment (p. ex. "5 hores d'estudi"
automàtica + "30 pàgines llegides" manual). El botó "Completar missió"
només apareix quan **totes** les condicions arriben al seu `target`
(`canComplete` a `getMissionDisplay`). Igual que les manuals, **mai
s'autocompleten** — sempre cal `COMPLETE_MISSION` encara que la part
automàtica ja estigui al 100%.

### Per què es congela el progrés en completar-se

Bug real detectat durant les proves d'aquesta iteració: si el progrés
d'una missió ja completada es recalculés sempre en directe, desmarcar més
tard una activitat que hi havia comptat feia que la missió es veiés
"Completada" però amb progrés `0/1` (inconsistent — exactament el que
l'encàrrec demanava evitar explícitament al punt 8). Solució: en
completar-se una missió (automàtica o via `COMPLETE_MISSION`), el
progrés final es **desa** (`finalProgress` per a simples,
`conditions[i].progress` per a les condicions d'una híbrida, incloent les
automàtiques) i `getMissionDisplay()` el fa servir directament en lloc de
recalcular, sempre que `status === 'completed'`. L'XP, per la mateixa raó,
tampoc es revoca mai retroactivament — un cop guanyada, es queda guanyada,
independentment del que passi després amb les activitats que hi van
comptar.

### Catàleg de plantilles (`src/data/missionTemplates.js`)

5 plantilles diàries, 6 setmanals, 6 especials (4 manuals + 2 híbrides) i
5 plantilles de missió personal, tal com especificava l'encàrrec —
`xpReward`/`target`/`difficulty` calcats dels valors donats.
`pickDistinctByMetric()` selecciona les missions diàries/setmanals evitant
repetir la mateixa mètrica alhora (p. ex. no mostra "Completa 2
activitats" i "Completa 3 activitats" el mateix dia).

**Cas especial documentat**: la plantilla "Treballa una matèria concreta"
(`needsSubject: true`) necessita `subjects.userSubjects` no buit. Si
l'usuari no ha configurat cap matèria, se substitueix per una altra
plantilla encara que repeteixi mètrica amb una ja triada (p. ex. "Completa
1 activitat" al costat de "Completa 2 activitats") — millor això que
mostrar només 2 missions diàries. Un cop l'usuari selecciona matèries
(al pas 3 de l'Onboarding, o més endavant des de Configuració), la
següent renovació diària ja pot generar-la normalment (verificat forçant
una renovació manualment durant les proves, i també en completar
l'Onboarding — veure "Fase final de consolidació").

### Renovació (`renewMissions`, sense temporitzadors)

Es comprova a l'inici de **cada** dispatch del reducer (barat: només
compara dates guardades) i també en carregar l'app per primer cop —
robust encara que l'app hagi estat tancada dies, tal com demanava
l'encàrrec:
- **Diàries**: si `missionsMeta.dailyRenewedAt` ≠ data real d'avui,
  s'eliminen les diàries no completades (expiren) i se'n generen 3 de
  noves; les completades es mantenen a `state.missions` (fan
  d'"historial", filtrades per categoria/estat des de la UI existent —
  no calia una secció nova, el disseny original ja distingia visualment
  l'estat "completada").
- **Setmanals**: mateix mecanisme, comparant el dilluns real de la
  setmana (`getRealWeekMondayKey`), es generen 2 de noves.
- **Especials**: no depèn de dates — cada vegada que se'n completa una
  (via `COMPLETE_MISSION`), es genera immediatament la següent
  (`pickNextSpecialTemplate`, evita repetir la plantilla que s'acaba de
  completar si n'hi ha alternatives). A la primera càrrega de l'app, si no
  n'hi ha cap, se'n genera una (garanteix que sempre n'hi hagi
  exactament 1 disponible/activa).
- **Personals**: no es renoven mai automàticament (gestió 100% manual de
  l'usuari, tal com demanava l'encàrrec).

### Missions personals

`PersonalMissionForm.jsx` (nova, dins la columna lateral de Missions):
títol, plantilla (`personalMissionTemplates`), quantitat objectiu i
matèria opcional. La dificultat **no la tria l'usuari** — es calcula amb
`getPersonalMissionDifficulty()` segons llindars de magnitud per plantilla
a `PERSONAL_MAGNITUDE_THRESHOLDS` (p. ex. "Resoldre exercicis": ≤10 fàcil,
≤25 mitjana, ≤50 difícil, més èpica), i l'XP surt de
`PERSONAL_XP_BY_DIFFICULTY` (100/250/500/1.000). Bloquejat a
`MAX_ACTIVE_PERSONAL_MISSIONS = 2` missions personals no completades
alhora (disponibles + actives comptades juntes — interpretació pròpia,
documentada perquè l'encàrrec no ho concretava del tot: semblava més
robust que limitar només les "actives", que hauria permès acumular
personals "disponibles" sense límit).

### Recomanacions (`buildRecommendations`)

Substitueix les 2 recomanacions fixes fictícies per regles senzilles
sobre l'estat real (sense IA, tal com demanava l'encàrrec):
1. Si hi ha alguna missió `available`, proposa la de més `xpReward` amb
   un botó "Inicia-la" (despatxa `START_MISSION` directament des de la
   targeta de recomanació).
2. Si hi ha alguna missió `active` amb progrés parcial, assenyala la que
   estigui més a prop de completar-se (informativa, sense botó).
3. Si no hi ha cap disponible ni activa, mostra un missatge informatiu.

### Canvis mínims a components existents (per exposar el nou model)

- `MissionCard.jsx`: afegit botó "Iniciar missió" (available), stepper
  +/- (manual), fila per condició (híbrida) i botó "Completar missió"
  quan `canComplete`. S'ha tret l'estat "bloquejada"/`IconLock` (no existia
  cap concepte equivalent en el nou model — sempre hi ha com a màxim 1
  especial "disponible", mai una llista de bloquejades esperant).
- `MissionsSummary.jsx`: fila "Bloquejades" eliminada pel mateix motiu
  (única baixa visual d'aquesta iteració, petita i justificada).
- `missionsData.js`: `difficulties`/`missionTypes`/`filters` amb claus
  noves (`easy`/`daily`/etc. en lloc de `facil`/`diaria`/etc.) per casar
  amb l'enum de l'encàrrec — `DifficultyBreakdown.jsx`/`MissionFilters.jsx`
  no han calgut canvis (ja eren genèrics respecte als valors de les claus).

## Sistema de progressió (Recompenses)

Unifica definitivamente el nivell i introdueix XP total vs. XP disponible.
Tota la lògica viu a `src/utils/levelSystem.js` (escala) i
`src/utils/rewardsEngine.js` (elegibilitat/compra/assoliments) — dades
purament estàtiques a `src/data/rewardsCatalog.js`.

### Escala única de nivells (`src/utils/levelSystem.js`)

`LEVELS` — 15 nivells amb `xpRequired` ABSOLUT (llindar acumulat, no XP
per pujar), tal com es va donar a l'encàrrec (0/250/500/900/.../12.000).
`computeLevelInfo(xpTotal)` retorna `{ level, xpCurrentLevel, xpNextLevel }`
on `xpCurrentLevel`/`xpNextLevel` es mantenen com "XP dins d'aquest
nivell" / "mida de la banda" (no llindars absoluts) perquè els
components existents (`LevelHeader`, `DonutProgress` d'Inici,
`ProgressBar`...) ja esperaven aquesta forma des del sistema pla anterior
— **no ha calgut tocar cap d'aquests components per aquest canvi**, només
la funció que produeix els números. Al nivell 15 (màxim), sense "nivell
següent", `xpNextLevel` es fixa igual a `xpCurrentLevel` (barra sempre al
100%, "MÀX" en lloc de "NIV. 16" a `LevelHeader`).

⚠️ **Correcció aplicada (24/08/2026)**: l'`xpTotal` inicial de mock era
12.480, que amb la nova escala (nivell 15 = 12.000 XP) situava tot usuari
nou ja al **nivell 15 (màxim)**, impedint veure la progressió cap a
nivells superiors. S'ha ajustat `initialProgress` a `src/data/seedData.js`:
- `xpTotal: 10000` → nivell 13 (Eminent), amb marge visible fins al 14 i 15.
- `xpAvailable: 1500` → per sota de `xpTotal`, simulant que l'usuari ja ha
  gastat XP abans, per poder provar la compra de desbloquejos des de zero.

Només s'han tocat aquests dos valors del mock; la fórmula (`applyXpDelta`),
l'escala de nivells (`LEVELS`) i el catàleg de desbloquejos/assoliments
es mantenen intactes. Verificat: usuari nou queda al nivell 13 (no al
màxim), la pestanya "Nivells" marca correctament l'actual/futurs, i la
compra d'un desbloqueig (p. ex. "Tema Fosc Pro", 250 XP) descompta només
de `xpAvailable` (1.500 → 1.250) sense tocar `xpTotal` ni `level`.

⚙️ **Botó de reinici**: com que l'estat es persisteix a `localStorage`,
canviar l'`initialProgress` del mock no afecta navegadors amb progrés ja
desat. Ha passat per tres implementacions successives:
1. (24/08/2026) `clearState()` bàsic (`localStorage.removeItem`) + `reload`
   — esborrava *tot*, inclosa la configuració.
2. (iteració de Configuració) acció real del reducer `RESET_PROGRESS` —
   reiniciava el progrés però **preservava** `settings`/`subjects`
   explícitament.
3. (Fase final de consolidació, definitiva) `RESET_APP` — torna a preservar
   *res*: reinicia l'aplicació sencera a l'estat pre-Onboarding, perquè
   l'usuari torni a veure l'assistent de benvinguda en lloc del dashboard
   de demo. Veure "Pantalla Configuració → Compte" més avall i "Fase final
   de consolidació" per al detall i el perquè d'aquest últim canvi.

### XP total vs. XP disponible

`state.progress` ara té dos camps d'XP:
- **`xpTotal`**: acumulat de per vida, determina el nivell, **mai
  disminueix per una compra**.
- **`xpAvailable`**: saldo gastable en desbloquejos comprables.

`applyXpDelta(progress, delta)` — el mateix punt únic de mutació d'XP que
ja feien servir activitats i missions — aplica **el mateix delta als
dos camps alhora**. Així, completar una activitat o una missió sempre
suma la mateixa quantitat a `xpTotal` i a `xpAvailable` sense haver de
duplicar lògica a cap lloc on ja s'invocava `applyXpDelta`.

**Cas límit d'XP ja gastada (documentat, solució simple i segura, tal com
demanava l'encàrrec)**: si es reverteix XP que en part ja s'havia gastat
(desmarcar una activitat completada, o editar-la/eliminar-la després
d'haver comprat un desbloqueig amb l'XP que aportava), `xpAvailable` es
clampa a 0 amb `Math.max(0, ...)` en lloc d'anar negatiu. No es revoca cap
desbloqueig ja comprat ni es porta un "deute" — és la mateixa solució que
ja s'aplicava a hores/sessions/ratxa en revertir-les.

### Missions i els objectius d'Inici (decisió ja presa, reconfirmada)

Tal com ja s'havia documentat i com demanava explícitament aquest
encàrrec: l'XP de missions suma a `xpTotal`/`xpAvailable`/nivell, però
**mai** a `xpGainedToday`/`hoursStudiedToday`/`weeklySessions`/`weeklyXP`
(els objectius diaris/setmanals d'Inici) — barrejar el rellotge real de
les missions amb la data fictícia del calendari seria arbitrari. Verificat
en viu: completar una missió no mou cap objectiu d'Inici, només XP
TOTAL/NIVELL.

### Desbloquejos (`src/data/rewardsCatalog.js` — `unlockTemplates`)

Cada plantilla té `unlockType: 'automatic' | 'purchasable'` i un requisit
d'elegibilitat (`levelRequired`/`xpRequired`, tots dos s'han de complir si
estan presents):
- **Automàtics**: s'afegeixen sols a `state.ownedUnlockIds` en complir-se
  el requisit (`evaluateAutomaticUnlocks`, cridat des d'`evaluateRewards`
  — veure més avall). Sense cost, sense botó.
- **Comprables**: en complir-se el requisit apareix un botó
  "Comprar · X XP" a `UnlockCard`. `PURCHASE_UNLOCK` (acció nova) només
  té èxit si és comprable, elegible, no ja comprat, i `xpAvailable` n'hi
  ha prou — llavors resta el cost de `xpAvailable` i afegeix l'id a
  `ownedUnlockIds`. **`xpTotal` mai canvia en comprar.**

Repartiment del catàleg (8 desbloquejos, mateixos que abans): 3
automàtics (funcions: Mode Concentració+, Estadístiques Avançades, Mode
Arena — "les funcions importants no haurien de requerir compra", tal com
deia l'encàrrec) i 5 comprables (cosmètics/avatar/títol/insígnia).

No s'ha implementat l'aplicació visual real de cap desbloqueig (canviar
el tema, afegir el marc a l'avatar...) — l'encàrrec ho deixava
explícitament opcional per a aquesta iteració ("no es necessario
implementar todavía toda su aplicación visual"). `UnlockCard` sí reflecteix
correctament els tres estats (bloquejat / comprable / obtingut).

### Assoliments (`src/data/rewardsCatalog.js` — `achievementTemplates`)

Sempre automàtics (mai comprables). Cada plantilla té `metric`/`target`;
s'obtenen quan `computeLifetimeMetrics(state)[metric] >= target`
(`evaluateAchievements`). Mètriques de "tota la vida" (no acotades a una
finestra temporal com les missions): activitats completades, hores
d'estudi, matèries diferents treballades, ratxa actual, missions
completades, XP total, i si hi ha alguna activitat completada
(`completedAt` real) després de les 23:00.

8 assoliments (mateix nombre que abans, 5 reaprofitats del catàleg
fictici original + 3 nous per cobrir explícitament el que demanava
l'encàrrec): Primera Sang (1a activitat), Imparable (ratxa 7 dies),
Nocturn (activitat després de 23:00), Polímata (5 matèries diferents),
Centurió (100h d'estudi), **Primera Missió** (1a missió completada),
**Estratega** (5 missions completades), **Erudit** (8.000 XP totals).

### `applyAutomaticRewards` / `finalizeDispatch` — un únic punt de reavaluació

Igual que la renovació de missions es comprova a l'inici de cada acció
del reducer, `applyAutomaticRewards(state)` (abans `evaluateRewards`) es
comprova desbloquejos automàtics i assoliments contra l'estat resultant,
sense importar quina acció s'hagi disparat — evita haver d'afegir la
crida manualment a cada lloc on `xpTotal`/activitats/missions puguin
canviar (i el risc d'oblidar-se'n en algun). S'aplica al **final** de cada
acció i també un cop a la càrrega inicial.

**Ampliat a la iteració de Perfil**: el reducer ja no crida directament
`applyAutomaticRewards`, sinó `finalizeDispatch(current, next)`, que
l'aplica i després en compara el resultat amb `current` (l'estat just
abans d'aquest dispatch) per derivar `eventLog` — veure "Pantalla Perfil".

### Migració de `localStorage`

Un estat persistit d'abans d'aquesta iteració no tenia `xpAvailable`
(es dona per defecte igual a `xpTotal`) ni `ownedUnlockIds`/
`ownedAchievementIds` (per defecte `[]`). **Important**: `level`/
`xpCurrentLevel`/`xpNextLevel` es recalculen SEMPRE a partir de `xpTotal`
amb `computeLevelInfo()` en carregar, sobreescrivint qualsevol valor
persistit — així un estat guardat amb el sistema pla antic de 5.000
XP/nivell es corregeix sol a la primera càrrega, sense necessitat d'una
migració més elaborada.

## Feedback visual de interacciones (subir XP, nivell, misión completada…)

**Parcialmente implementado desde la iteración de Configuració**: un
toast interno breve (`src/components/common/Toast.jsx`) muestra "+X XP"
cuando se completa una actividad o misión, condicionado al interruptor
"Guanyes XP" de Notificacions — ver "Pantalla Configuració" para el
detalle. Sigue sin existir un "momento" dedicado más elaborado (modal de
subida de nivel, celebración de assoliment, etc.); no hay capturas de
Figma para esos estados. Cuando se aborde, se diseñará siguiendo el
sistema visual ya establecido (tarjetas oscuras, acentos morado/cian,
componentes `Card`/`Tag`/`ProgressBar` existentes) y debería reutilizar
`eventLog` igual que el toast actual, nunca un sistema paralelo.

## Pantalla Perfil

Perfil pasó de mostrar mock estático (`data/profileData.js`, ahora
**eliminado**) a ser un resumen 100% derivado del estado global. Cero
diseño visual tocado — mismos componentes (`ProfileHeader`, `ProfileStats`,
`SubjectDistribution`, `AchievedGoalsList`, `RecentActivityFeed`,
`MonthlyHoursChart`, `TrendLineChart`), solo cambia de dónde sacan los
datos. Toda la lógica de derivación vive en `src/utils/profileEngine.js`
(funciones puras, sin React), consumida desde `buildSelectors` en
`AppContext.jsx` como `useApp().profile`.

### Qué se pudo derivar directamente del estado ya existente

- **Cabecera**: nombre/nivel/nombre de nivel/XP total → `user`; racha
  actual → `streak`. Sin cambios de sistema.
- **Estadísticas** (tasques completades, hores totals): reutilizan
  literalmente `computeLifetimeMetrics(state)` de `rewardsEngine.js` (el
  mismo cálculo que ya usaban los requisitos de desbloqueos/assoliments)
  — cero lógica duplicada.
- **Assoliments X/Y**: `ownedAchievementIds.length` / número total de
  plantillas — ya existían ambos.
- **Distribució per matèria**: agrupa `activities` completades por
  `subjectId` real (nunca las 4 categorías fijas antiguas), resolviendo
  nombre/color con `buildSubjectsById` (el mismo resolver que ya usa
  Calendari) — top 5 + "Altres" si sobran.

### Qué se tuvo que añadir (mínimo, dentro del mismo estado)

1. **`progress.maxStreak`** — no existía. Se calcula dentro de
   `recomputeStreak` (`Math.max(maxStreak anterior, streakDays nuevo)`),
   nunca baja cuando la racha actual se rompe. Migración: si un estado
   persistido no lo tiene, se asume `streakDays` actual (el mínimo
   verdadero posible, nunca un valor inventado).
2. **`state.eventLog`** — no existía ningún registro cronológico de
   eventos. Es el único añadido no trivial de esta iteración, y sirve a
   la vez para **"Tendència XP"** y **"Activitat recent"** (un solo
   sistema, no dos paralelos). Cada entrada:
   `{ id, type, title, date (ISO, rellotge real), xp, xpTotalAfter?, refId? }`.
   - Se genera en `collectDispatchEvents(prevState, state)`
     (`AppContext.jsx`), comparando el estado justo antes y justo
     después de cada dispatch — **ninguna acción del reducer sabe nada
     de `eventLog`**, se deduce solo comparando qué cambió (activitat
     completada, missió completada, ratxa amb rècord, nivell superior,
     nou desbloqueig/assoliment). Cubre automáticamente tanto
     desbloqueigs automàtics com comprats (ambdós es veuen com un canvi
     a `ownedUnlockIds`).
   - Retallat a 60 entrades (`pushEvent` a `profileEngine.js`) perquè no
     creixi sense límit a `localStorage`.
   - **No es registren les reversions** (desmarcar una activitat, p. ex.)
     — decisió deliberada per no embrutar "Activitat recent" amb
     correccions de prova; el punt "actual" de "Tendència XP" sempre usa
     el `xpTotal` en viu (mai un valor de log potencialment desactualitzat
     per una reversió no registrada), així que la precisió del present
     mai es veu afectada.
   - **Migració/baseline**: un estat nou o persistit d'abans d'aquest
     sistema rep una única entrada `type: 'baseline'` amb el `xpTotal`
     conegut en aquell moment (mai un historial fictici — només ancora el
     punt de partida real). Es filtra sempre d'"Activitat recent".
3. **`t4` (activitat semilla `completed: true` sense `completedAt`)**:
   calia una data per agrupar-la per mes als gràfics. En lloc d'inventar-
   ne una, `migrateActivities` reutilitza la seva pròpia data/hora
   programada (`dateKey`+`time`) — una dada real ja existent, no fictícia.

### Gràfics ("Hores d'estudi" / "Tendència XP")

Finestra mòbil dels **últims 6 mesos acabant al mes real actual**
(`new Date()`), no un any fix "2026" — coherent amb el rellotge real que
ja fan servir missions/assoliments (secció "Missions i els objectius
d'Inici" més amunt). Per això s'ha canviat el títol de la targeta de
"— 2026" a "— últims 6 mesos" (únic canvi de text, cap canvi visual).

- **"Hores d'estudi"**: suma `durationMin` de les activitats completades
  agrupades pel mes del seu `completedAt` real (no el `dateKey` fix del
  calendari — demanat explícitament).
- **"Tendència XP"**: per cada mes passat, l'últim `xpTotalAfter` registrat
  a `eventLog` fins al final d'aquell mes; el mes actual sempre mostra el
  `xpTotal` en viu. Representa `xpTotal` (mai `xpAvailable`, que pot
  baixar per compres).
- Cap component de gràfic (`MonthlyHoursChart`/`TrendLineChart`) s'ha
  hagut de tocar — ja acceptaven `data` genèrica amb tooltip en hover des
  d'un principi.
- **Bug trobat i corregit de pas**: amb valors petits (poques hores),
  `getAxisSteps` pot arrodonir dues etiquetes de l'eix Y al mateix número
  (p. ex. `[1, 1, 1, 0, 0]`), i com que aquests dos gràfics feien servir
  `key={label}` a l'eix, React llançava un warning de keys duplicades.
  Solucionat canviant a `key={index}` (l'eix és una llista estàtica
  ordenada, mai es reordena) a `MonthlyHoursChart.jsx`/`TrendLineChart.jsx`.

### Objectius assolits / Activitat recent

- **Objectius assolits**: assoliments reals de Recompenses
  (`achievementTemplates` + `ownedAchievementIds`), amb la data llegida
  d'`eventLog` (`type: 'assoliment'`, `refId`). Un assoliment ja obtingut
  abans d'aquest sistema (sense esdeveniment registrat) es mostra igual
  però sense data — mai una data inventada.
- **Activitat recent**: últims 6 esdeveniments d'`eventLog` (excloent
  `baseline`), més recent primer. XP es mostra només si l'esdeveniment en
  té (assoliments/desbloquejos/nivell/ratxa no en tenen).
- Ambdós components tenen ara un estat buit explícit ("Encara no has
  desbloquejat cap assoliment." / "Encara no hi ha activitat registrada.")
  per a un usuari nou o just després d'esborrar dades de proves.

### Verificat en navegador

Completar una activitat actualitza en viu: tasques completades, hores
totals, distribució per matèria, punt actual de "Tendència XP" i un nou
event "tasca" a "Activitat recent". Es va provocar deliberadament (marcant
i desmarcant activitats) una pujada de nivell (13→14), dues pujades reals
de ratxa (amb una baixada silenciosa enmig, sense event — comportament
correcte), i es va completar una missió automàtica en directe: un sol
dispatch va generar correctament TRES events simultanis (`tasca`,
`missio`, `assoliment` per "Primera Missió"). Es va comprar un desbloqueig
a Recompenses i va aparèixer com a event `desbloqueig` sense tocar
`xpTotal`. Tot va persistir després de recarregar, i les 6 pantalles es
van navegar sense errors de consola.

## Pantalla Configuració

Los 4 subapartados (**Compte, Notificacions, Aparença, Estudi**) están ya
implementados sobre el mismo `AppContext`/`localStorage` de siempre —
**Estudi se completó en una iteración posterior a los otros 3** (ver
"Subapartado Estudi" más abajo).

### Compte

- **Canviar foto**: `<input type="file">` oculto disparado por el botón.
  `src/utils/imageUtils.js` redimensiona la imagen a máx. 160px (canvas +
  `toDataURL('image/jpeg', 0.85)`) antes de guardarla como
  `settings.avatarDataUrl` — sin esto, una foto de móvil de varios MB
  podría agotar la cuota de `localStorage` compartida con el resto de la
  app. Sin backend: la imagen vive solo en este dispositivo, como pedía
  el encargo. Se muestra en el avatar de Compte y de Perfil (`<img>` en
  vez del icono por defecto cuando hay foto).
- **Nombre + idioma**: formulario propio, solo se aplica al pulsar "Desar
  canvis" (`SAVE_ACCOUNT_INFO`). `user.name` en `AppContext` ahora lee de
  `settings.username` (antes era la constante `seedData.user.name`) — se
  actualiza en Sidebar, Perfil, Compte, todo, porque todos leen el mismo
  `useApp().user`.
- **Tancar sessió**: no hay autenticación real, así que **no se ha
  construido un login falso** (habría sido peor que no tener nada). Es un
  flag `settings.sessionActive` — al desactivarlo, `App.jsx` muestra una
  pantalla mínima "Sessió tancada" con un botón para volver a activarlo.
  **El progreso NUNCA se borra al cerrar sesión** (se decidió no borrar
  nada, la opción más simple y segura, tal como pedía el encargo).
  Preparado para que el día que haya autenticación real, solo haga falta
  sustituir el flag por la comprobación real.
- **Reiniciar aplicació** (antes "Restablir dades de proves"): desde la
  Fase final de consolidación es la acción `RESET_APP` del reducer, que
  **ya NO preserva nada** — devuelve el estado a `buildInitialState()`
  (el mismo que se cargaría con Local Storage totalmente vacío, con
  `settings.onboardingComplete: false`), así que tras pulsarlo el usuario
  vuelve a ver el Onboarding, no el dashboard de demo. Sustituye
  explícitamente al `RESET_PROGRESS` de la iteración de Configuració (que
  sí conservaba `settings`/`subjects` — decisión correcta para aquella
  fase, superada aquí porque este encargo pedía justo lo contrario: que
  el botón de reinicio "vuelva a la casilla de salida" por completo). Ver
  "Fase final de consolidació" para el detalle completo.

### Notificacions

Todos los toggles persisten en `settings.notifications` y se aplican al
momento (sin botón "Desar"). Distinción clara entre dos sistemas
(`src/utils/notifications.js`):

1. **Avisos internos** (`Toast`, `src/components/common/Toast.jsx` +
   `App.jsx`): siempre funcionan, no requieren permisos. "Guanyes XP"
   reutiliza directamente `eventLog` (el mismo registro de Perfil) — un
   `useEffect` en `App.jsx` compara la longitud de `eventLog` con la del
   render anterior y, si hay algún evento nuevo con XP numérico positivo,
   muestra el toast — **cero sistema paralelo**. Importante: un solo
   dispatch puede añadir varios eventos a la vez (p. ej. tarea + subida
   de racha), así que se repasan *todos* los eventos nuevos del lote, no
   solo el último (bug real encontrado y corregido durante las pruebas:
   mirar solo `eventLog[length-1]` podía esconder el evento con XP detrás
   de uno sin XP).
2. **Notificaciones reales del navegador** (`Notification` API): el
   permiso se pide **solo** al activar el toggle "Manteniment de ratxa"
   (nunca al cargar la pantalla, para no ser intrusivo), y solo si el
   navegador aún no lo ha concedido/denegado. Si se deniega, se muestra
   un aviso explicando que solo se recibirán avisos dentro de la app —
   nunca se vuelve a pedir. Si se envía una notificación real, **también**
   se muestra el toast interno en paralelo (redundancia intencionada:
   nunca depender solo del permiso del navegador).

**Limitación aceptada y documentada** (pedida explícitamente que se
documentara): "Manteniment de ratxa" y "Resum setmanal" son recordatorios
basados en tiempo (hora del día / domingo) que **solo pueden dispararse
mientras la pestaña de StudyQuest esté abierta** — no hay backend ni
infraestructura de push, así que es imposible avisar con la app/navegador
cerrados. Implementado como una comprobación ligera cada 60s
(`REMINDER_CHECK_INTERVAL_MS` en `App.jsx`) más una comprobación inmediata
al cargar, con *dedupe* (`lastStreakReminderDateKey`/
`lastWeeklySummaryWeekKey`, guardados en `settings.notifications`) para
no repetir el aviso el mismo día/semana. El resumen semanal usa datos
reales (`weeklySessions`, `weeklyXP`, horas de `weeklyActivity`, ratxa
actual) — no hay pantalla de informe nueva, tal como pedía el encargo,
pero la lógica ya está lista para una futura.

### Aparença

Todo se aplica **globalmente** vía atributos `data-*` en `<html>`
(efecto único dentro de `AppProvider`, en `AppContext.jsx`) + variables
CSS en `src/styles/variables.css` — **no se ha tocado ningún componente
individual** para que reciba los cambios, tal como pedía el encargo:

- **Tema** (`data-theme="fosc"|"clar"`): el tema claro es una paleta
  nueva completa (`:root[data-theme='clar']`) que redefine solo los
  tokens de fondo/borde/texto — el resto de variables (acentos, radios,
  sombras) se reutilizan sin cambios. "Sistema" resuelve
  `prefers-color-scheme` en el momento y escucha cambios en vivo
  (`matchMedia(...).addEventListener('change', ...)`) mientras esté
  seleccionado.
- **Color d'accent** (`data-accent`): `--accent-purple`/
  `--accent-purple-light`/`--gradient-brand` son los tokens que ya usaban
  botones primarios, navegación activa, barras de progreso y bordes
  destacados en *toda* la app — se redefinen bajo `[data-accent="..."]`
  para los 5 colores no-violeta. El nombre "purple" se mantiene aposta
  (evita renombrar la variable en todos los CSS existentes) pero pasa a
  significar "color de marca", igual que `--bg-app` no significa
  literalmente "fondo de app roja". "Violeta" es el valor por defecto
  (coincide con los tokens base, cero redefinición).
- **Mode compacte** (`data-compact="true"`): `zoom: 0.88` aplicado solo a
  `.app-main` (no al Sidebar, para no encoger los objetivos de clic de
  navegación). **Limitación conocida y documentada**: `zoom` no es
  estándar CSS y no lo soporta Firefox — en ese navegador el interruptor
  se guarda pero no tiene efecto visual. Se eligió sobre una alternativa
  "correcta" (una escala de variables de espaciado aplicada a cada
  componente) porque esa habría exigido tocar 15+ archivos CSS, justo lo
  que el encargo pedía evitar.
- **Animacions** (`data-animations="on"|"off"`): regla global
  `[data-animations='off'] * { transition-duration: 0s !important;
  animation-duration: 0s !important; }` — apaga transiciones/animaciones
  sin tocar ningún componente; los cambios de estado siguen funcionando
  igual, solo sin la transición visual.

### Sistema de traduccions (`src/i18n/translations.js`)

Diccionario plano centralizado por idioma (`ca`/`es`/`en`), claves tipo
`namespace.clau` con interpolación mínima `{{var}}` (`interpolate()`) —
**cero if/else de idioma repartidos por componentes**, tal como exigía
explícitamente el encargo. `state.settings.language` decide el idioma;
`useApp().t(key, vars)` (definida en `buildSelectors`, `AppContext.jsx`)
es la única forma de consumirlo — cualquier componente que necesite texto
traducido simplemente hace `const { t } = useApp()`.

**Cobertura completa** (verificada cambiando de idioma en las 6
pantallas, sin recargar): Sidebar, los 4 títulos de sección + los 3
subapartados implementados de Configuració, y todo el "chrome" estático
de Inici/Calendari/Missions/Recompenses/Perfil — títulos de pantalla y de
tarjeta, botones, etiquetas de formulario, pestañas/filtros, mensajes de
confirmación (`window.confirm`), aria-labels, y estados vacíos. También
los catálogos cortos y muy reutilizados: tipos de actividad
(`activityOptions.js`), dificultades/tipos de misión/filtros
(`missionsData.js`), categorías de desbloqueo (`rewardsData.js`). Los
títulos de los objetivos diarios/semanales de Inici (`seedData.js`) pasan
de texto fijo a `titleKey` + `{ n: target }` interpolado, para que el
número siga viniendo siempre de la configuración real, nunca de un texto
traducido hardcodeado.

**Límite aceptado y documentado** (decisión de alcance explícita, dado el
volumen): **no se ha traducido el contenido narrativo largo** de los
catálogos de misiones/assoliments/desbloquejos (~46 títulos+descripciones
en `missionTemplates.js`/`rewardsCatalog.js`), ni los nombres de los 15
niveles (`levelSystem.js`), ni los nombres de las 12 matèries del catàleg
(`subjectsCatalog.js`), ni los nombres de mes/día del calendario
(`calendarUtils.js`, usados también en los gráficos de Perfil vía
`profileEngine.js`) — todo esto se queda en catalán en los 3 idiomas.
Tampoco se traducen (intencionadamente, por instrucción explícita del
encargo) los datos creados por el usuario: nombre de usuario, matèries
personalitzades, títols d'activitats ni missions personals. El texto de
las recomendaciones de Missions (`missionEngine.buildRecommendations`,
generado dinámicamente) tampoco se ha traducido, por la misma razón de
alcance. Si se quiere ampliar la cobertura más adelante, el sistema ya
está listo para ello — solo hace falta añadir las claves que falten.

Una consecuencia menor aceptada: los títulos guardados en `eventLog`
("Vas completar tasca: X", "Nivell 14 assolit"...) se generan una sola
vez, en el idioma activo en ese momento, y quedan fijados así para
siempre en el historial — igual que un registro de auditoría real, no se
traducen retroactivamente si luego se cambia de idioma.

### Verificado en navegador

Cambio de nombre + idioma aplicado y persistente tras recargar, en las 6
pantallas. Subida de foto (simulada con un `File` generado por canvas)
persistente y visible en Compte y Perfil. "Tancar sessió" → pantalla de
sesión cerrada → persiste tras recargar → "Tornar a iniciar sessió"
recupera la app normal. "Restablir dades de proves" → 0 XP/nivel 1/todo
vacío, con nombre/idioma/foto/apariencia/matèries intactos — verificado
directamente en `localStorage`. Tema claro, color de acento, modo
compacto y animaciones aplicados y persistentes (comprobados vía
`document.documentElement.dataset` y `getComputedStyle`). Toast de XP
verificado end-to-end (encontrado y corregido el bug de "solo mirar el
último evento" descrito arriba). Recordatorio de racha probado forzando
la hora y limpiando el *dedupe* en `localStorage` — se disparó una vez y
no se repitió en una segunda carga el mismo día. Navegadas las 6
pantallas en catalán, castellano e inglés sin errores de consola.

### Subapartado Estudi

Última pieza de Configuració, implementada en una iteración posterior a
Compte/Notificacions/Aparença sobre la misma base. Campos nuevos, **planos
directamente sobre `settings`** (no imbricados como `notifications`/
`appearance`, tal como pedía explícitamente el encargo con su bloque de
código de ejemplo):
```js
settings: {
  ...
  studySessionDuration: 25,  // minutos — aún sin temporizador real que lo consuma
  studyBreakDuration: 5,     // minutos — ídem
  autoBreak: true,           // ídem, solo se guarda
  focusSound: false,         // ídem, solo se guarda
  dailyTaskGoal: 3,          // SÍ tiene efecto real — ver más abajo
  weekStartsOn: 'monday',    // 'monday' | 'sunday' — SÍ tiene efecto real
}
```
Acción del reducer: `UPDATE_STUDY` (`updateStudySettings(patch)`), mismo
patrón de pedazo parcial que `UPDATE_NOTIFICATIONS`/`UPDATE_APPEARANCE`.
Todo se aplica al momento (sin botón "Desar"), igual que Notificacions/
Aparença. Migración de `localStorage` antiguo: como son campos planos,
el mismo `{...defaultSettings, ...base.settings}` que ya existía los
completa solos si faltan — no hizo falta tocar la lógica de migración.

**Pomodoro (duración de sesión/pausa) y "Pausa automàtica"/"So de
focus"**: tal como pedía el encargo, solo se guardan — no existe todavía
un temporizador Pomodoro real que los consuma (no se ha construido esa
pantalla/lógica esta iteración). Quedan en `settings` listos para
cuando exista.

**Objectiu diari de tasques → efecto real en Inici**: antes,
`DAILY_TASKS_TARGET` era una constante fija (3) leída de
`seedData.dailyGoalsConfig`. Ahora `AppContext.jsx` la sustituye por
`settings.dailyTaskGoal` en dos sitios: (1) `buildSelectors` calcula el
`target` de la card "Completa X tasques avui" a partir de
`settings.dailyTaskGoal` en vez del `target` fijo del catálogo (el título
traducido usa el mismo valor interpolado, así que el número mostrado
siempre coincide); (2) `recomputeStreak` (que decide si sube la ratxa)
recibe `dailyTaskGoal` como parámetro nuevo en vez de la constante — así
que la ratxa ahora solo sube cuando se completan tantas tareas como
diga la preferencia real, no un 3 fijo. Los objetivos de XP/horas
**no** se han tocado, tal como pedía el encargo.

**Inici de la setmana → utilidad compartida centralizada**: existían ya
dos cálculos de "límites de semana" independientes (`isInWeek`/
`getWeekDates` en `calendarUtils.js`, y `getRealWeekMondayKey` en
`missionEngine.js`, que internamente llamaba a `getWeekDates`). Se ha
centralizado añadiendo un parámetro `weekStartsOn` ('monday' por defecto,
retrocompatible) a `getWeekDates`/`isInWeek` — toda la app pasa por estas
mismas dos funciones, nunca hay una tercera implementación:
- `AppContext.jsx` → `applyActivityEffect` (qué cuenta como "esta semana"
  para `weeklySessions`/`weeklyXP`/la barra `weeklyActivity`) lee
  `state.settings.weekStartsOn` directamente.
- `CalendarPage.jsx` → `getWeekDates(selectedDateKey, settings.weekStartsOn)`,
  de donde beben tanto el rango mostrado ("Distribució setmanal — Setmana
  del...") como los 7 días de `WeeklyDistribution`.
- `missionEngine.js` → `getRealWeekMondayKey(weekStartsOn)` (y
  `renewMissions(..., weekStartsOn)`), para que la renovación de misiones
  semanales use el mismo límite de semana — se pasa desde `AppContext.jsx`
  en los dos sitios donde se llama a `renewMissions` (inicio del reducer
  y carga inicial de `AppProvider`).

**Bug real encontrado y corregido durante la implementación**:
`WeeklyDistribution.jsx` calculaba la etiqueta del día (`Dl`/`Dt`...) por
la *posición* del array (`WEEKDAY_LABELS[index]`), asumiendo que el
índice 0 siempre era dilluns. Con `weekStartsOn: 'sunday'`, el índice 0
pasa a ser diumenge, así que esa fila mostraba la etiqueta equivocada
para cada día. Se ha añadido `getWeekdayLabel(date)` en `calendarUtils.js`
(deriva la etiqueta del `date.getDay()` real, nunca de la posición) y se
usa en su lugar — verificado que "Distribució setmanal — Setmana del
7-13 Jun" muestra correctamente `Dg 7, Dl 8, Dt 9...` con `weekStartsOn:
'sunday'`.

**`state.weeklyActivity` (barra "Aquesta setmana" d'Inici) — reordenado
solo para mostrar, nunca al guardar**: sigue internamente indexado
DL..DG (igual que siempre, vía `getDayCodeForDateKey`, que no depende de
`weekStartsOn` — un dimarts sempre és 'DT'). Se ha añadido
`reorderWeekArray(items, weekStartsOn)` en `calendarUtils.js`, aplicado
solo en el selector (`buildSelectors`) justo antes de devolver
`weeklyActivity` a los componentes — con `weekStartsOn: 'sunday'` rota el
array para que la barra empiece en diumenge, sin tocar `WeeklyBarChart.jsx`
ni cómo se persiste el dato.

**Límite aceptado y documentado**: cambiar `weekStartsOn` puede disparar
inmediatamente una renovación de missions setmanals (la clave de semana
cambia, así que `renewMissions` la detecta como "semana nueva" y
regenera las missions setmanals activas no completadas, perdiendo su
progreso automático acumulado). No se ha construido una migración más
compleja para preservarlo — es la misma filosofía de "solución simple y
documentada" ya aplicada a otros casos límite de este proyecto (XP ya
gastada, etc.); cambiar esta preferencia es una acción rara y deliberada,
no algo que ocurra por accidente en el uso normal.

**Traducciones**: `settings.study.*` (título de card, subgrupos,
toggles) y `settings.study.weekStart.monday`/`.sunday` para las etiquetas
de "Inici de la setmana" (valores internos neutros `monday`/`sunday`,
igual que pedía el encargo — antes eran `dilluns`/`diumenge` en catalán
como *valor*, no solo como etiqueta, lo cual ya no tenía sentido con
3 idiomas). Los números/opciones de Pomodoro y objectiu diari no
necesitan traducción (números y "min", iguales en los 3 idiomas).

**Verificado en navegador**: cambiados duración de sesión (45 min),
duración de pausa (15 min), pausa automàtica (off), so de focus (on),
objectiu diari (5) e inici de setmana (diumenge) — todo persistente tras
recargar (`localStorage`). Inici mostró correctamente "Completa 5
tasques avui" / "X / 5", y la ratxa solo subió al completar la 5a tasca
del día (no a la 3a). La barra "Aquesta setmana" pasó a mostrar
`DG DL DT DC DJ DV DS`. Calendari mostró "Distribució setmanal — Setmana
del 7-13 Jun" con las etiquetas de día correctas (bug corregido, ver
arriba). Missions renovó sus missions setmanals sin errores con la nueva
clave de semana (`weeklyRenewedAt` recalculado a un diumenge real).
Verificadas las 3 lenguas en el subapartado Estudi. Navegadas las 6
pantallas sin errores de consola.

## Fase final de consolidació

**Objetivo** (`ENCARREC_Fase_Final_Consolidacio.md`, apartado 8.5.4 de la
memoria): cerrar el prototipo como "resultado final" con tres cambios —
(1) onboarding real de usuario nuevo, (2) estado inicial real (0 XP, sin
progreso) cuando no hay nada en Local Storage, (3) reinicio coherente (el
botón de reinicio debe volver al Onboarding, no al dashboard de demo).

**Decisión tomada sobre el punto abierto del encargo** (Calendari buit o
amb activitats d'exemple): `activities: {}` completamente vacío. El
onboarding pregunta nombre/idioma/materias, nunca fechas ni actividades
concretas — inventar 2-3 actividades de ejemplo habría exigido elegir
fechas/materias sin ningún vínculo real con lo que el usuario acaba de
configurar, rompiendo la coherencia del resto del "estado inicial real"
(0 XP, nivel inicial, ratxa 0, sin misiones completadas, sin recompensas).

### 1. Onboarding (`src/pages/OnboardingPage.jsx`)

Asistente de 3 pasos (nombre → idioma → materias), mostrado por `App.jsx`
cuando `settings.onboardingComplete` es falso — ver más abajo cómo se
decide ese valor. Nombre se guarda en estado local del componente hasta
el botón final; idioma y materias, en cambio, escriben directamente al
estado global desde el propio paso:
- **Paso 2 (idioma)**: nueva acción `SET_LANGUAGE` (solo el campo
  `settings.language`, aplicación inmediata) — así el resto del asistente,
  incluido el `SubjectSelector` del paso 3, se ve ya en el idioma elegido
  sin esperar ningún guardado. Es un punto de entrada distinto de
  `SAVE_ACCOUNT_INFO` (que sigue siendo el de Configuració → Compte, con
  su botón "Desar canvis").
- **Paso 3 (materias)**: reutiliza `SubjectSelector` **tal cual**
  (ninguna nueva lógica de "selección pendiente de confirmar") — ya
  escribe en `state.subjects` con las mismas acciones que usa el resto de
  la app (`TOGGLE_DEFAULT_SUBJECT`/`ADD_CUSTOM_SUBJECT`/
  `REMOVE_CUSTOM_SUBJECT`). Solo se han traducido sus textos (antes
  hardcodeados en catalán) vía nuevas claves `subjects.*` — el componente
  ya no vive dentro de una previsualización aislada: `SubjectsSetupPage.jsx`
  y la ruta oculta `#materies` de `App.jsx` se han **eliminado**.

Botón final ("Comença"/"Empezar"/"Get started") despacha
`COMPLETE_ONBOARDING` con `{ username, language }` — las materias NO van
en este payload porque ya están aplicadas al estado global desde el paso 3
(ver más abajo por qué esto es una desviación deliberada de la propuesta
literal del encargo).

**Bug encontrado y corregido**: la primera versión envolvía todo el
asistente en un único `<form onSubmit>` (para aprovechar el submit por
Enter). El paso 3 renderiza `SubjectSelector`, que ya tiene su propio
`<form>` interno para "Afegeix una altra matèria" — un `<form>` anidado
dentro de otro es HTML inválido, y el evento `submit` del formulario
interno (p. ej. al pulsar "Afegeix") burbujeaba también hasta el `<form>`
externo, disparando el avance/finalización del Onboarding sin que el
usuario lo pidiera (verificado en el navegador: `onboardingComplete`
seguía en `false` pero las materias personalizadas añadidas justo antes
se perdían, o el asistente volvía al paso 1). **Solución**: se ha quitado
el `<form>` envolvente del Onboarding — los botones "Enrere"/"Següent"/
"Comença" son `<button type="button">` normales con `onClick`, y el envío
con Enter se mantiene solo en el input del paso 1 (`onKeyDown`, no
depende de ningún `<form>`).

### 2. Estado inicial real (`buildFreshState`, `AppContext.jsx`)

Se separan dos conceptos que antes convivían en una sola función
(`buildInitialState()`):
- **`buildInitialState()`**: sigue siendo el estado de demo
  (`seedData.js`/`calendarData.js`, ~10.000 XP y actividades ya
  existentes) — ahora es **solo una utilidad interna de desarrollo**,
  nunca lo que ve un usuario real, porque a partir de esta fase también
  fija `settings.onboardingComplete: false`. Se sigue usando cuando
  `loadState()` no devuelve nada válido (instalación totalmente nueva) y,
  ahora también, como destino íntegro del reinicio (`RESET_APP`, ver
  punto 3).
- **`buildFreshState(state, { username, language })`** (nueva): el estado
  real de un usuario que acaba de completar el Onboarding — progreso a
  cero vía `buildZeroProgress()` (nueva, extraída para no duplicar los
  mismos campos que ya ponía a cero `resetProgress`), `activities: {}`,
  `missions: []`/`missionsMeta` reinicializados, `ownedUnlockIds`/
  `ownedAchievementIds: []`, `eventLog` con una única entrada baseline a
  0 XP, y `settings` con `username`/`language` del asistente más
  `onboardingComplete: true`. `subjects` se toma de `state.subjects` (las
  materias ya aplicadas en el paso 3) — **desviación deliberada** de la
  propuesta literal del encargo, que decía `custom: []` a secas: descartar
  las materias personalizadas creadas segundos antes en el mismo asistente
  habría sido un comportamiento confuso e inconsistente con reutilizar
  `SubjectSelector` "tal cual", así que se preservan también.
- `completeOnboarding(state, payload)`: llama a `buildFreshState` y acto
  seguido a `renewMissions()` (mismo mecanismo que ya usa `AppProvider` en
  la primera carga) para que las misiones diarias/semanales/especial ya
  existan en el primer render del dashboard, sin depender de que el
  usuario dispare otra acción cualquiera primero.

**Migración de `onboardingComplete`** (compatibilidad con partidas de
prueba ya guardadas): `buildInitialSettings()` — la función que también
rellena campos que falten en un `settings` ya persistido — usa `true`
como valor por defecto (un estado guardado de antes de esta fase no tiene
este campo y debe considerarse ya "onboarded", nunca debe verse forzado a
repetir el asistente). Solo `buildInitialState()` lo sobreescribe
explícitamente a `false`, porque es el único caso que representa de
verdad "no hay nada en Local Storage". Verificado manualmente: borrando
solo el campo `settings.onboardingComplete` de un estado ya guardado (sin
tocar nada más) la app sigue cargando el dashboard directamente, no el
Onboarding.

### 3. Reinicio coherente (`RESET_APP`, antes `RESET_PROGRESS`)

El botón de Configuració → Compte (tarjeta renombrada de "Dades de
proves" a "Reinici de l'aplicació") ya no preserva `settings`/`subjects`
como hacía `RESET_PROGRESS` en la iteración de Configuració — ahora
devuelve el estado íntegro a `buildInitialState()`, así que en el
siguiente render `settings.onboardingComplete` es `false` y aparece el
Onboarding. Es un cambio de comportamiento deliberado que **supera
explícitamente** la decisión de aquella iteración anterior (documentada
en su momento como "preserva compte/matèries a propósito"): este encargo
pedía justo lo contrario para este botón en concreto. Sin recarga de
página ni `clearState()`/`localStorage.removeItem` — es una transformación
de estado pura, igual que el resto del reducer.

### Verificado en navegador

Local Storage vacío → aparece el Onboarding (no el dashboard). Completado
el asistente (nombre, cambio de idioma en vivo en el paso 2, 2 materias +
1 personalizada añadida en el paso 3) → dashboard con 0 XP, nivel 1,
ratxa 0/7, 0/0 tasques, missions ya generadas (incluida una "Treballa
Matemàtiques" usando la materia elegida). Repetido también dejando 0
materias seleccionadas (edge case): sin errores, la misión que necesita
materia usa su plantilla de fallback ya existente. "Reiniciar aplicació"
(con `window.confirm` aceptado) devuelve al Onboarding, paso 1, campos
vacíos. Recarga con la app ya "onboarded": persiste, va directo al
dashboard. Estado guardado simulando una partida anterior a esta fase
(sin el campo `onboardingComplete`): migra a `true`, no fuerza el
Onboarding. Repetido el asistente completo en català/castellà/English —
los 3 textos del asistente y del `SubjectSelector` se ven correctamente
traducidos (los nombres del catálogo de materias, p. ej. "Matemàtiques",
se mantienen en catalán en los 3 idiomas: es una limitación ya existente
y documentada del proyecto — nunca se han traducido en ningún otro sitio
de la app — no algo introducido ni corregido en esta fase). Navegadas las
6 pantallas sin errores de consola. `localStorage` dejado vacío al
terminar las pruebas.

## Sincronitzar el dia d'avui amb la data real

**Objetivo** (`ENCARREC_Sincronitzar_Data_Avui.md`): eliminar l'última data
fictícia que quedava a l'app. `data/seedData.js` fixava `today.dateKey =
'2026-06-09'`, i era la font de "avui" per a activitats/Inici/Calendari
(quines tasques són "d'avui", dia seleccionat per defecte al Calendari,
càlculs "aquesta setmana"). Les missions, en canvi, ja funcionaven amb
`new Date()` real — era una inconsistència coneguda i acceptada durant el
desenvolupament (veure secció anterior, "Rellotge real vs. rellotge
fictici"). Amb l'onboarding i l'estat inicial real ja fets (Fase final de
consolidació), calia també aquest últim pas.

### Canvis

- **`getTodayKey()`** (nova, `utils/calendarUtils.js`): `toDateKey(new
  Date())` — única font de veritat per a "avui" a tota l'app. Substitueix
  totes les referències a `today.dateKey` de `seedData.js` dins
  `AppContext.jsx` (`applyActivityEffect`, `recomputeStreak` als tres
  llocs on es criden, `getUpcomingActivities`, `buildSelectors`).
- **`buildToday()`** (nova, `AppContext.jsx`): reemplaça l'objecte
  `today` importat de `seedData.js` — es recalcula a cada
  `buildSelectors()` (és a dir, a cada dispatch, prou fresc per a un
  prototip sense necessitat de cap temporitzador) a partir de `new
  Date()`: `dateKey` (`getTodayKey()`), `dayCode`
  (`getDayCodeForDateKey`), `weekday`/`dateLabel` amb dos helpers nous
  també a `calendarUtils.js` (`getWeekdayFullLabelCa`,
  `getShortDateLabelCa`) que reprodueixen exactament el format que abans
  tenia fixat el mock ("DILLUNS", "9 JUN 2026") — **es manté en català
  sense traduir**, igual que ja estava abans d'aquest canvi (no formava
  part de l'abast d'aquest encàrrec ampliar la traducció de la capçalera
  d'Inici).
- **`missionEngine.js`**: `getRealTodayKey()` ara delega en `getTodayKey()`
  de `calendarUtils.js` en lloc de tenir la seva pròpia implementació
  idèntica (`toDateKey(new Date())` duplicat) — es manté el nom per no
  haver de tocar cada crida existent (`getRealWeekMondayKey`,
  `renewMissions`), però ja no hi ha dues implementacions del mateix
  càlcul.
- **`CalendarPage.jsx`**: el mes i el dia seleccionats per defecte en
  obrir el Calendari ara venen de `getCurrentCalendarMonth()`/
  `getTodayKey()` (noves a `calendarUtils.js`), no de
  `initialCalendarMonth`/`initialSelectedDate` (constants fixes de
  `data/calendarData.js`, **eliminades** — ja no calien enlloc més).
- `data/seedData.js`: **eliminat** l'objecte `today` sencer (ja no
  l'importa ningú).

### Dades de demo: es mantenen fixes a propòsit

Tal com demanava l'encàrrec, `data/calendarData.js` (`initialActivities`)
manté les seves dates fixes de juny del 2026 — és només la llavor de
`buildInitialState()` (utilitat interna de desenvolupament des de la Fase
final de consolidació, mai el que veu un usuari real). Conseqüència
acceptada i esperada: si es carrega aquest estat de demo (p. ex. sense
haver fet mai l'Onboarding en aquell navegador), les seves activitats
apareixeran "al passat" respecte al dia real — no calia remapejar-les,
l'aplicació NO les fa servir mai per decidir quin dia és avui per a un
usuari real.

### Verificat en navegador

Onboarding complet des de zero → capçalera d'Inici mostra "DILLUNS, 31 AGO
2026" (coincidint amb la data real del sistema en el moment de la prova).
Calendari obert directament al mes real ("AGOST 2026") amb el dia 31
seleccionat i "Distribució setmanal — Setmana del 31-6 set" (setmana real,
travessant el canvi de mes correctament). Creada una activitat nova per a
"avui" (matèria triada a l'Onboarding) i marcada com a completada des
d'Inici: `xpTotal`/`xpGainedToday`/`hoursStudiedToday`/barra "Aquesta
setmana" es van actualitzar correctament (60 XP, 1/1 tasca, 1.0h), i
Perfil va registrar l'esdeveniment amb data real ("Avui", "31 Ago 2026" a
l'assoliment desbloquejat) i el va comptar al mes "Ago" del gràfic
"Tendència XP". Repetit després d'un reinici (`RESET_APP`) amb el mateix
resultat. Cap error de consola navegant les 6 pantalles. `localStorage`
buidat en acabar.

## Tutorial inicial

**Objetivo** (`ENCARREC_Tutorial_Inicial.md`): recorregut guiat "spotlight"
de 8 passos per a l'usuari nou, just després de l'Onboarding — Inici (2),
Calendari (1), tornada a Inici (1), Missions (1), Recompenses (2) i Perfil
(1). Configuració queda fora. Als passos clau l'usuari ha de fer l'acció
real (crear una tasca, completar-la, iniciar una missió) per avançar, no
només llegir.

### 1. Estat i activació

Dos camps nous a `settings` (mateix criteri de migració que
`onboardingComplete`): `tutorialComplete` (per defecte `true` a
`buildInitialSettings()` — una partida de proves anterior a aquesta fase
no ha de veure's obligada a fer el tutorial; només `false` a
`buildInitialState()`/`buildFreshState()`, per a un usuari realment nou) i
`tutorialStepIndex` (per reprendre pel mateix pas si es recarrega la
pàgina a mitges — punt 5 de l'encàrrec). Accions noves al reducer:
`COMPLETE_TUTORIAL`/`SKIP_TUTORIAL` (la mateixa funció `finishTutorial()`
per a totes dues — "Saltar" té exactament el mateix efecte que acabar-lo,
tal com demanava l'encàrrec) i `SET_TUTORIAL_STEP`.

`App.jsx` renderitza `<TutorialOverlay>` dins d'`AppShell`, com a germà de
`Sidebar`/`main` (mai una pantalla a part com l'Onboarding), quan
`settings.onboardingComplete && !settings.tutorialComplete`.

### 2. `TutorialOverlay.jsx` — patró "spotlight"

- **Localització de l'element**: atribut `data-tutorial="<id>"` als
  components concrets (mai classes CSS) — `Card` (`components/common/
  Card.jsx`) ara reenvia `...rest` a la `<section>` perquè `DailyGoals`/
  `UpcomingTasks` el puguin fer servir directament.
- **Retallat visual**: 4 `<div>` foscos que tapen tota la pantalla EXCEPTE
  un requadre al voltant de l'element (mai una màscara SVG amb "forat" —
  més simple i igual de fiable). Els 4 divs capturen clics (bloquegen la
  resta de la interfície als passos explicatius); un cinquè div decoratiu
  (`.tutorial-ring`, vora + resplendor) té `pointer-events: none` perquè
  als passos "actius" l'element real de sota (botó, checkbox) segueixi
  sent clicable.
- **z-index**: per sota del modal de Calendari (50, veure `calendar.css`)
  — si l'usuari obre el `NewActivityModal` real durant el pas 3, el
  cobreix per complet sense competir-hi visualment.
- **Seguiment de l'element**: `getBoundingClientRect()` recalculat en
  canviar de pas, en redimensionar la finestra i cada 400ms (sense
  dependre de cap listener de scroll concret, ja que cada pantalla pot
  tenir un contenidor diferent que faci scroll).
- **Canvi de pantalla**: reutilitza la mateixa `setActiveScreen` que ja
  rep `AppShell` — `TutorialOverlay` la crida ell mateix quan el pas ho
  demana (p. ex. saltar a Calendari pel pas 3).

### 3. Passos "actius": l'usuari fa l'acció real, no hi ha "Endavant"

Font única dels 8 passos: `src/components/tutorial/tutorialSteps.js`
(`TUTORIAL_STEPS` + `getTutorialStepId(settings)`, usada també per
pantalles que necessiten reaccionar-hi — veure més avall). Cada pas actiu
es detecta comparant l'estat actual (`activities`/`tasks`/`missions`, tots
ja disponibles a `useApp()`) sense necessitat de "recordar" cap ID
concret entre renders:
- **Nova activitat** (Calendari): avança quan `activities` deixa de ser
  buit (`Object.values(activities).reduce(...)  > 0`) — segur perquè un
  usuari que arriba aquí ve sempre de l'Onboarding amb `activities: {}`.
- **Completar tasca** (tornada a Inici): avança quan `tasks[0].completed`
  — únic element de la llista en aquest punt del recorregut, per això no
  calia cap ID trackejat: n'hi ha prou amb l'`index === 0` de
  `UpcomingTasks.jsx`.
- **Iniciar missió**: avança comparant un COMPTADOR ("missions ja no
  `available`") capturat en entrar al pas (`useRef`) contra el mateix
  comptador en cada canvi de `missions` — mai una missió concreta per ID,
  perquè la llista es pot reordenar sense que això compti com "trampa".

### 4. Passos que necessiten obrir una pestanya/filtre concret

`RewardsPage.jsx` (pestanya "Desbloquejos" pel pas 7) i `MissionsPage.jsx`
(filtre "Totes" pel pas 5) gestionen aquest estat com a `useState` LOCAL
seu, no lligat a l'Onboarding ni a cap ruta — el Tutorial no els pot obrir
via `setActiveScreen`. Solució minimal: cada pantalla crida
`getTutorialStepId(settings)` (mateixa font que `TutorialOverlay`) i, amb
un `useEffect` d'una línia, força la pestanya/filtre correcte només quan
el pas actual és el que l'afecta — mai fora del tutorial, no interfereix
amb la navegació normal de l'usuari un cop acabat.

**MissionCard**/**UnlockCard** reben un nou prop `isTutorialTarget`
(booleà) que aplica `data-tutorial` només a la instància correcta (la
primera missió `available`/el primer desbloqueig visible), calculat a la
pàgina pare — mai al component de la llista mateix, que no sap res del
tutorial.

### Problema trobat i corregit: salt momentani al canviar de pas

En avançar d'un pas actiu al següent (p. ex. de "Completar tasca" a
"Iniciar missió", que també canvia de pantalla), l'anell apareixia un
instant sobre la posició de l'element del pas ANTERIOR abans de corregir-
se sol (el `setInterval` de 400ms ho arreglava, però es notava un salt
visual lleig). Causa: el `rect` de l'estat no s'esborrava fins que la
següent consulta trobava l'element nou. **Solució**: `setRect(null)` a
l'inici mateix de l'efecte que recalcula la posició (abans de fer cap
consulta), perquè el canvi de pas mostri sempre "sense element trobat
encara" (targeta centrada, sense anell) en lloc d'un anell mal posicionat.

### Ajust posterior: pausa abans d'avançar (passos 4 i 5)

Als passos "actius" amb un efecte visual immediat que val la pena veure
—completar la tasca (pas 4, l'XP puja) i iniciar una missió (pas 5)— el
salt automàtic al pas següent era instantani i no deixava temps de
fixar-s'hi: se sentia "frenètic". Afegit `ADVANCE_DELAY_MS = 1800`
(`TutorialOverlay.jsx`): en complir-se la condició, `scheduleAdvance()`
guarda un `setTimeout` (mai deixa que se'n solapin dos si l'efecte es
torna a disparar mentre s'espera) i canvia el missatge de
`t('tutorial.waitingHint')` ("Fes l'acció per continuar") a
`t('tutorial.advancing')` ("Molt bé! Continuem...") perquè l'usuari sàpiga
que l'acció ja s'ha registrat. El pas "Nova activitat" (3) es manté amb
avanç instantani — crear-la no té cap efecte visual immediat que calgui
esperar. El temporitzador es neteja en canviar de pas (`useEffect` amb
`[step.id]`) per si l'usuari salta el tutorial mentre s'espera.

### Verificat en navegador

Recorregut complet de principi a fi després de l'Onboarding: els 8 passos
en ordre correcte, canvis de pantalla automàtics (Inici→Calendari→Inici→
Missions→Recompenses→Perfil), pestanya "Nivells"/"Desbloquejos" oberta
sola als passos 6/7. Creada una activitat real al pas 3 (el modal real es
va obrir per sobre sense conflictes de z-index) → avanç automàtic.
Completada la tasca al pas 4 → avanç automàtic (XP/nivell actualitzats
amb normalitat, mateix comportament que sense tutorial). Iniciada una
missió al pas 5 → avanç automàtic. "Saltar tutorial" des del pas 1 →
`tutorialComplete: true`, overlay desapareix, app totalment interactiva.
Recàrrega de la pàgina a mig recorregut (pas 6 desat manualment a
`localStorage`) → reprèn exactament al mateix pas, pantalla i pestanya
correctes. Verificat en anglès (canvi d'idioma a mig tutorial): textos,
botons i indicador de progrés traduïts correctament — els noms de mes/dia
del Calendari es mantenen en català, limitació ja coneguda i documentada,
no introduïda ni corregida per aquesta fase. Cap error de consola. Un cop
acabat, navegades les 6 pantalles amb normalitat, sense cap rastre del
tutorial. `localStorage` buidat en acabar les proves.

## "Membre des de" real a Perfil

`profile.memberSince` (Perfil → capçalera) mostrava sempre el valor fix
`seedUser.memberSince` ('Set 2025', `data/seedData.js`) — últim rastre
d'una data de mock, detectat per l'usuari revisant Perfil després del
Tutorial inicial. Igual que amb `getTodayKey()` (veure "Sincronitzar el
dia d'avui amb la data real"), calia una data real: nou camp
`settings.memberSinceDateKey`, fixat a `getTodayKey()` dins
`buildFreshState()` (és a dir, el dia real en què l'usuari acaba
l'Onboarding). `buildSelectors` el formata amb la nova
`formatMonthYearCa(dateKey)` (`calendarUtils.js`, p. ex. "Set 2026") i
només cau al valor fix de `seedUser.memberSince` com a reserva per a
`buildInitialState()` (dashboard de demo) o un `settings` persistit
d'abans d'aquest camp (`memberSinceDateKey: null` per defecte a
`buildInitialSettings()` — mateix criteri de migració que
`onboardingComplete`/`tutorialComplete`). Verificat: Onboarding complet un
19 de setembre → "Membre des de: Set 2026"; esborrant manualment el camp
d'un estat ja desat → torna a "Set 2025" sense trencar-se.

## Coletilla "basat en el teu patró d'estudi" (Missions)

Detectat per l'usuari: la secció "Recomanacions personalitzades" de
Missions sempre mostrava l'etiqueta "basat en el teu patró d'estudi"
(`missions.recommendationsTag`), fins i tot per a un compte acabat de
crear amb 0 activitats i 0 missions completades — `buildRecommendations()`
(`missionEngine.js`) només aplica regles fixes (missió disponible amb més
XP, activa més a prop de completar-se), mai cap dada real de l'usuari,
així que la frase era enganyosa sense cap historial. `MissionsPage.jsx`
ara calcula `hasStudyHistory` (`profile.stats.tasksCompleted > 0` o
alguna missió amb `status === 'completed'`) i només renderitza l'etiqueta
si és `true` — el títol "Recomanacions personalitzades" i les targetes es
mantenen sempre (siguin o no útils per a un usuari nou). Verificat: compte
nou → sense etiqueta; amb una activitat completada (injectada per a la
prova) → etiqueta visible de nou, sense error de consola ni salt de
disseny (el `justify-content: space-between` de la capçalera ja
funcionava bé amb un sol fill).

## Convenciones a mantener

- **Texto de la UI (chrome de interfaz): sistema de traducciones**
  (`src/i18n/translations.js`, `useApp().t(key, vars)`), nunca texto
  hardcodeado — ver "Pantalla Configuració" para el alcance exacto de qué
  está traducido y qué se ha dejado en catalán a propósito. Dato creado
  por el usuario (nombres, matèries, títols) y catálogos de contenido
  narrativo largo (misiones/assoliments/desbloquejos/nivells): en
  catalán, tal como ya vivían en el código.
- Cada carpeta de funcionalidad tiene su propio CSS (`home.css`,
  `calendar.css`, `missions.css`, `rewards.css`, `profile.css`,
  `settings.css`) — evitar que se mezclen estilos entre carpetas.
- Componentes genéricos reutilizables en `components/common/` (`Card`,
  `Tag`, `ProgressBar`, `Toggle`, `SegmentedControl`, `StatCard`,
  `StreakBadge`, `Icons.jsx`).
- Los iconos son SVG "stroke" dibujados a mano en `Icons.jsx` — reutilizar
  antes de crear uno nuevo.
- Disciplina de iteración: al tocar una pantalla, no tocar las demás salvo
  que sea estrictamente necesario para conectar la navegación.
