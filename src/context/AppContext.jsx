import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  user as seedUser,
  weeklyActivity as seedWeeklyActivity,
  dailyGoalsConfig,
  pendingGoalsConfig,
  initialProgress,
} from '../data/seedData'
import { defaultSubjectsCatalog } from '../data/subjectsCatalog'
import { initialActivities } from '../data/calendarData'
import { MAX_ACTIVE_PERSONAL_MISSIONS } from '../data/missionTemplates'
import { unlockTemplates, achievementTemplates } from '../data/rewardsCatalog'
import { loadState, saveState } from '../data/storage'
import { calculateActivityXp } from '../utils/xpFormulas'
import {
  getDayCodeForDateKey,
  isInWeek,
  flattenActivities,
  buildSubjectsById,
  reorderWeekArray,
  getTodayKey,
  getWeekdayFullLabelCa,
  getShortDateLabelCa,
} from '../utils/calendarUtils'
import { computeLevelInfo, getLevelName } from '../utils/levelSystem'
import {
  pushEvent,
  computeMonthlyStudyHours,
  computeXpTrend,
  computeSubjectDistribution,
  computeAchievedGoals,
  computeRecentActivity,
} from '../utils/profileEngine'
import {
  computeLifetimeMetrics,
  evaluateAutomaticUnlocks,
  evaluateAchievements,
  purchaseUnlock as purchaseUnlockEngine,
  getUnlockDisplay,
} from '../utils/rewardsEngine'
import {
  renewMissions,
  reevaluateAutomaticMissions,
  getMissionDisplay,
  instantiateMission,
  pickNextSpecialTemplate,
  createPersonalMission,
  buildRecommendations,
} from '../utils/missionEngine'
import { translate, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../i18n/translations'

const SUPPORTED_LANGUAGE_SET = new Set(SUPPORTED_LANGUAGES)

const DAILY_XP_TARGET = dailyGoalsConfig.find((g) => g.metric === 'xpGainedToday').target
const DAILY_HOURS_TARGET = dailyGoalsConfig.find((g) => g.metric === 'hoursStudiedToday').target

// Nombre màxim d'activitats que mostra "Tasques previstes" a Inici. Amb
// aquest límit, si avui ja n'hi ha prou per omplir la llista, les de demà
// no hi caben — és exactament el criteri de prioritat demanat.
const UPCOMING_TASKS_LIMIT = 5

const CUSTOM_SUBJECT_COLOR = 'var(--accent-purple-light)'

// Valors per defecte de `state.settings` (Configuració) — un usuari nou o
// un estat persistit d'abans d'aquest sistema rep exactament aquests
// valors (veure migració a `AppProvider`). Res d'això toca `progress` ni
// cap altre sistema: és la seva pròpia secció de l'estat, amb les seves
// pròpies accions, però la mateixa persistència de sempre.
//
// `onboardingComplete: true` és el valor per defecte AQUÍ perquè aquesta
// funció també s'usa per completar camps d'un `settings` ja persistit
// (migració a `AppProvider`) — un estat real d'una sessió de proves
// anterior a l'onboarding no té aquest camp i ha de considerar-se ja
// "onboarded" (mai se l'ha de fer tornar a passar l'assistent). Només
// `buildInitialState()` (estat totalment nou, sense res a Local Storage)
// el sobreescriu a `false` — veure aquesta funció més avall.
function buildInitialSettings() {
  return {
    username: seedUser.name,
    language: DEFAULT_LANGUAGE,
    onboardingComplete: true,
    // Mateix criteri que `onboardingComplete`: `true` per defecte perquè
    // aquesta funció també completa un `settings` ja persistit — una
    // sessió de proves anterior al Tutorial inicial no té aquest camp i
    // no ha de veure's obligada a fer-lo (només `buildInitialState()` i
    // `buildFreshState()` el sobreescriuen a `false` per a un usuari
    // realment nou). `tutorialStepIndex` permet reprendre el tutorial pel
    // mateix pas si es recarrega la pàgina a mitja seqüència.
    tutorialComplete: true,
    tutorialStepIndex: 0,
    avatarDataUrl: null,
    sessionActive: true,
    notifications: {
      taskReminder: true,
      streakReminder: true,
      reminderTime: '19:00',
      xpGain: false,
      weeklySummary: true,
      notificationSound: true,
      lastStreakReminderDateKey: null,
      lastWeeklySummaryWeekKey: null,
    },
    appearance: {
      theme: 'fosc',
      accentColor: 'violeta',
      compactMode: false,
      animations: true,
    },
    // Estudi — camps plans (no imbricats) tal com demanava l'encàrrec.
    // `studySessionDuration`/`studyBreakDuration` encara no els fa servir
    // cap temporitzador real (no implementat aquesta iteració): només es
    // desen, a punt per quan existeixi. `dailyTaskGoal` sí que té efecte
    // real (veure `recomputeStreak`/`buildSelectors`), igual que
    // `weekStartsOn` (veure `applyActivityEffect`/`renewMissions`/Calendari).
    studySessionDuration: 25,
    studyBreakDuration: 5,
    autoBreak: true,
    focusSound: false,
    dailyTaskGoal: 3,
    weekStartsOn: 'monday',
  }
}

// Cap matèria predeterminada ve seleccionada d'entrada: és l'usuari qui
// tria, en la futura pantalla d'onboarding, quines estudia.
function buildInitialSubjectsState() {
  return {
    selectedDefaultIds: [],
    custom: [],
  }
}

// Migració suau: un estat persistit d'una iteració anterior pot tenir
// activitats sense `completed`/`completedAt` (camps afegits en iteracions
// successives). Se'ls dona un valor per defecte segur.
//
// Cas concret: l'activitat `t4` de la llavor (seedData) neix `completed:
// true` però sense `completedAt` (es va completar "abans" que aquest camp
// existís). Perfil necessita una data per agrupar-la per mes als gràfics
// ("Hores d'estudi"/"Tendència XP") — en lloc d'inventar-ne una, es
// reutilitza la seva pròpia data/hora programada (`dateKey`+`time`), que
// ja és una dada real de l'activitat, no un valor fictici nou.
function migrateActivities(activitiesByDate) {
  const migrated = {}
  for (const dateKey of Object.keys(activitiesByDate)) {
    migrated[dateKey] = activitiesByDate[dateKey].map((a) => {
      const withDefaults = { completed: false, completedAt: null, ...a }
      if (withDefaults.completed && !withDefaults.completedAt) {
        return { ...withDefaults, completedAt: `${dateKey}T${withDefaults.time}:00` }
      }
      return withDefaults
    })
  }
  return migrated
}

function buildInitialProgress() {
  return { ...initialProgress, ...computeLevelInfo(initialProgress.xpTotal) }
}

// Estat que carrega `AppProvider` quan Local Storage està completament
// buit (primera visita real, o després d'un reinici — veure `RESET_APP`).
// Conté les dades de demo (`seedData.js`/`calendarData.js`, XP i
// activitats ja existents) — des de la Fase final de consolidació aquestes
// ja NO són el que veu un usuari real: `onboardingComplete: false` fa que
// `App.jsx` mostri només l'Onboarding (mai aquest dashboard de demo) fins
// que es completa. Es mantenen com a utilitat interna de desenvolupament
// (proves manuals, captures) — veure `buildFreshState` per a l'estat
// real que rep un usuari nou en acabar l'Onboarding.
function buildInitialState() {
  return {
    weeklyActivity: seedWeeklyActivity,
    progress: buildInitialProgress(),
    subjects: buildInitialSubjectsState(),
    activities: initialActivities,
    ownedUnlockIds: [],
    ownedAchievementIds: [],
    // Registre cronològic mínim d'esdeveniments importants (activitat
    // completada, missió completada, ratxa, nivell, assoliment,
    // desbloqueig), reutilitzat tant per "Activitat recent" com per
    // reconstruir "Tendència XP" a Perfil — mai un sistema paral·lel.
    // Veure `finalizeDispatch`/`collectDispatchEvents` més avall.
    eventLog: [],
    settings: { ...buildInitialSettings(), onboardingComplete: false, tutorialComplete: false, tutorialStepIndex: 0 },
  }
}

// Progrés a zero, reutilitzat tant per `RESET_APP` (reinici complet) com
// per `buildFreshState` (usuari nou acabant l'Onboarding) — una única
// definició de "què vol dir començar de zero", igual que `computeLevelInfo`
// és l'única font de veritat per a nivell/XP dins del nivell.
function buildZeroProgress() {
  return {
    xpTotal: 0,
    xpAvailable: 0,
    streakDays: 0,
    streakTarget: initialProgress.streakTarget,
    streakBoostedToday: false,
    maxStreak: 0,
    xpGainedToday: 0,
    hoursStudiedToday: 0,
    weeklySessions: 0,
    weeklyXP: 0,
    ...computeLevelInfo(0),
  }
}

// Estat real d'un usuari nou en completar l'Onboarding (`COMPLETE_ONBOARDING`):
// tot a zero (progrés, activitats, missions, recompenses, historial), amb
// `subjects` = les matèries que ha triat al pas 3 (ja aplicades a l'estat
// via `TOGGLE_DEFAULT_SUBJECT`/`ADD_CUSTOM_SUBJECT`, es reutilitzen tal
// qual — incloent qualsevol matèria personalitzada que hagi creat, no
// només les predeterminades) i `username`/`language` dels passos 1 i 2.
function buildFreshState(state, { username, language }) {
  const trimmedUsername = (username ?? '').trim()
  const resolvedLanguage = SUPPORTED_LANGUAGE_SET.has(language) ? language : DEFAULT_LANGUAGE
  const defaultSettings = buildInitialSettings()

  return {
    weeklyActivity: seedWeeklyActivity.map((d) => ({ ...d, hours: 0 })),
    progress: buildZeroProgress(),
    subjects: state.subjects ?? buildInitialSubjectsState(),
    activities: {},
    missions: [],
    missionsMeta: { dailyRenewedAt: null, weeklyRenewedAt: null },
    ownedUnlockIds: [],
    ownedAchievementIds: [],
    eventLog: [{ id: 'ev-onboarding', type: 'baseline', date: new Date().toISOString(), xp: null, xpTotalAfter: 0 }],
    settings: {
      ...defaultSettings,
      username: trimmedUsername || defaultSettings.username,
      language: resolvedLanguage,
      onboardingComplete: true,
      // Usuari real i nou: encara li falta el Tutorial inicial (veure
      // `TutorialOverlay.jsx`) — mai `true` aquí, a diferència del valor
      // per defecte de `buildInitialSettings()` (pensat per a migració).
      tutorialComplete: false,
      tutorialStepIndex: 0,
    },
  }
}

// Llista combinada, ja resolta, de matèries que estudia l'usuari
// (predeterminades seleccionades + personalitzades). Es fa servir tant per
// a selectors (UI) com dins del reducer (generar missions relacionades amb
// matèries), per això viu com a funció compartida en lloc de dins de
// `buildSelectors`.
function resolveUserSubjects(subjectsState) {
  const selectedDefaults = defaultSubjectsCatalog.filter((s) => subjectsState.selectedDefaultIds.includes(s.id))
  const customWithColor = subjectsState.custom.map((s) => ({ ...s, color: CUSTOM_SUBJECT_COLOR, isCustom: true }))
  return [...selectedDefaults, ...customWithColor]
}

// Aplica un delta d'XP (positiu o negatiu) i recalcula nivell/progrés amb
// l'escala única (computeLevelInfo), de forma simètrica perquè desmarcar
// una activitat pugui revertir exactament una pujada de nivell provocada
// per marcar-la. `xpAvailable` (el saldo gastable en desbloquejos) rep
// sempre el mateix delta que `xpTotal` — guanyar XP suma als dos alhora.
//
// Cas límit documentat (demanat explícitament no complicar): si es
// reverteix XP que en part ja s'havia gastat en un desbloqueig comprat,
// `xpAvailable` simplement es clampa a 0 en lloc d'anar negatiu — no es
// revoca cap desbloqueig ja comprat ni es porta un "deute". És la mateixa
// solució de `Math.max(0, ...)` que ja s'aplicava a la resta de mètriques
// reversibles (hores, sessions, ratxa...).
function applyXpDelta(progress, delta) {
  const xpTotal = Math.max(0, progress.xpTotal + delta)
  const xpAvailable = Math.max(0, progress.xpAvailable + delta)
  const { level, xpCurrentLevel, xpNextLevel } = computeLevelInfo(xpTotal)
  return { ...progress, xpTotal, xpAvailable, level, xpCurrentLevel, xpNextLevel }
}

function round1(value) {
  return Math.round(value * 10) / 10
}

function findActivityLocation(activitiesByDate, activityId) {
  for (const dateKey of Object.keys(activitiesByDate)) {
    const idx = activitiesByDate[dateKey].findIndex((a) => a.id === activityId)
    if (idx !== -1) return { dateKey, idx }
  }
  return null
}

// Aplica (sign=1) o reverteix (sign=-1) l'efecte d'una activitat sobre el
// progrés global. L'XP total/nivell es toca sempre; les mètriques "d'avui"
// (xpGainedToday/hoursStudiedToday) només si l'activitat és d'avui; les
// setmanals (weeklySessions/weeklyXP) i la barra del gràfic "Aquesta
// setmana" només si l'activitat cau dins la setmana actual.
function applyActivityEffect(state, activityDateKey, xp, durationMin, sign) {
  const xpDelta = sign * xp
  const hoursDelta = sign * (durationMin / 60)
  const todayKey = getTodayKey()
  const isToday = activityDateKey === todayKey
  const inCurrentWeek = isInWeek(activityDateKey, todayKey, state.settings.weekStartsOn)

  let weeklyActivity = state.weeklyActivity
  if (inCurrentWeek) {
    const dayCode = getDayCodeForDateKey(activityDateKey)
    weeklyActivity = state.weeklyActivity.map((d) =>
      d.day === dayCode ? { ...d, hours: Math.max(0, round1(d.hours + hoursDelta)) } : d,
    )
  }

  let progress = applyXpDelta(state.progress, xpDelta)
  progress = {
    ...progress,
    xpGainedToday: isToday ? Math.max(0, progress.xpGainedToday + xpDelta) : progress.xpGainedToday,
    hoursStudiedToday: isToday
      ? Math.max(0, round1(progress.hoursStudiedToday + hoursDelta))
      : progress.hoursStudiedToday,
    weeklySessions: inCurrentWeek ? Math.max(0, progress.weeklySessions + sign) : progress.weeklySessions,
    weeklyXP: inCurrentWeek ? Math.max(0, progress.weeklyXP + xpDelta) : progress.weeklyXP,
  }

  return { weeklyActivity, progress }
}

// Recalcula la ratxa a partir de les activitats d'avui actuals — mateixa
// lògica de sempre (puja un cop quan es compleixen els 3 objectius d'avui,
// baixa si deixen de complir-se), ara mirant `activities[getTodayKey()]`.
// `dailyTaskGoal` ve de `settings.dailyTaskGoal` (Configuració → Estudi,
// per defecte 3, com abans) — mai un XP/hores objectiu, que es mantenen
// fixos tal com demanava l'encàrrec.
function recomputeStreak(progress, todaysActivities, dailyTaskGoal) {
  const tasksCompletedToday = todaysActivities.filter((a) => a.completed).length
  const allGoalsComplete =
    tasksCompletedToday >= dailyTaskGoal &&
    progress.xpGainedToday >= DAILY_XP_TARGET &&
    progress.hoursStudiedToday >= DAILY_HOURS_TARGET

  let next = progress
  if (allGoalsComplete && !progress.streakBoostedToday) {
    next = { ...progress, streakDays: progress.streakDays + 1, streakBoostedToday: true }
  } else if (!allGoalsComplete && progress.streakBoostedToday) {
    next = { ...progress, streakDays: Math.max(0, progress.streakDays - 1), streakBoostedToday: false }
  }

  // `maxStreak` és el rècord històric de `streakDays` — mai baixa quan la
  // ratxa actual es trenca, només puja quan es supera. Es guarda dins de
  // `progress` (mateix sistema de progrés, no un camp paral·lel) perquè
  // "Ratxa màxima" a Perfil el pugui llegir directament.
  const maxStreak = Math.max(progress.maxStreak ?? 0, next.streakDays)
  return maxStreak === next.maxStreak ? next : { ...next, maxStreak }
}

// Recalcula les missions automàtiques (simples) a partir de l'estat
// d'activitats ja actualitzat i atorga l'XP de les que s'acaben de
// completar (una única vegada — la missió queda `completed` i el seu
// càlcul de progrés es congela des d'aquell moment). Es crida després de
// completar/descompletar, editar o eliminar qualsevol activitat.
function reevaluateMissionsAfterActivityChange(state, activities, progress) {
  const nowIso = new Date().toISOString()
  const { missions, newlyCompleted } = reevaluateAutomaticMissions(state.missions ?? [], activities, nowIso)

  let finalProgress = progress
  let finalMissions = missions
  for (const mission of newlyCompleted) {
    finalProgress = applyXpDelta(finalProgress, mission.xpReward)
    if (mission.category === 'special') {
      finalMissions = [...finalMissions, instantiateMission(pickNextSpecialTemplate(mission.templateId), 'special')]
    }
  }

  return { missions: finalMissions, progress: finalProgress }
}

function toggleTask(state, activityId) {
  const loc = findActivityLocation(state.activities, activityId)
  if (!loc) return state
  const { dateKey, idx } = loc
  const activity = state.activities[dateKey][idx]
  const willComplete = !activity.completed
  const sign = willComplete ? 1 : -1
  const nowIso = new Date().toISOString()

  const dayActivities = state.activities[dateKey].map((a, i) =>
    i === idx ? { ...a, completed: willComplete, completedAt: willComplete ? nowIso : null } : a,
  )
  const activities = { ...state.activities, [dateKey]: dayActivities }

  const { weeklyActivity, progress: progressAfterEffect } = applyActivityEffect(
    state,
    dateKey,
    activity.xp,
    activity.durationMin,
    sign,
  )
  const progress = recomputeStreak(progressAfterEffect, activities[getTodayKey()] ?? [], state.settings.dailyTaskGoal)
  const { missions, progress: finalProgress } = reevaluateMissionsAfterActivityChange(state, activities, progress)

  return { ...state, activities, weeklyActivity, progress: finalProgress, missions }
}

function toggleDefaultSubject(state, subjectId) {
  const isCatalogId = defaultSubjectsCatalog.some((s) => s.id === subjectId)
  if (!isCatalogId) return state

  const { selectedDefaultIds } = state.subjects
  const isSelected = selectedDefaultIds.includes(subjectId)
  const nextIds = isSelected
    ? selectedDefaultIds.filter((id) => id !== subjectId)
    : [...selectedDefaultIds, subjectId]

  return { ...state, subjects: { ...state.subjects, selectedDefaultIds: nextIds } }
}

function nameExists(name, state) {
  const normalized = name.trim().toLowerCase()
  const inCatalog = defaultSubjectsCatalog.some((s) => s.name.toLowerCase() === normalized)
  const inCustom = state.subjects.custom.some((s) => s.name.toLowerCase() === normalized)
  return inCatalog || inCustom
}

function addCustomSubject(state, name) {
  const trimmed = (name ?? '').trim()
  if (!trimmed || nameExists(trimmed, state)) return state

  const subject = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimmed,
  }

  return { ...state, subjects: { ...state.subjects, custom: [...state.subjects.custom, subject] } }
}

function removeCustomSubject(state, subjectId) {
  return {
    ...state,
    subjects: { ...state.subjects, custom: state.subjects.custom.filter((s) => s.id !== subjectId) },
  }
}

// Crea una activitat de Calendari al dia `dateKey`. L'XP es calcula
// sempre aquí (mai el passa l'usuari) perquè sigui determinista i única
// font de veritat — la mateixa fórmula que fa servir la previsualització
// del formulari (veure NewActivityModal). Una activitat nova sempre neix
// pendent (`completed: false`).
function addActivity(state, payload) {
  const title = (payload.title ?? '').trim()
  if (!title || !payload.dateKey || !payload.time || !payload.subjectId || !payload.type || !payload.durationMin) {
    return state
  }

  const activity = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    time: payload.time,
    durationMin: payload.durationMin,
    subjectId: payload.subjectId,
    type: payload.type,
    xp: calculateActivityXp(payload.type, payload.durationMin),
    completed: false,
    completedAt: null,
  }

  const dayActivities = state.activities[payload.dateKey] ?? []
  const nextDayActivities = [...dayActivities, activity].sort((a, b) => a.time.localeCompare(b.time))

  return {
    ...state,
    activities: { ...state.activities, [payload.dateKey]: nextDayActivities },
  }
}

// Edita una activitat existent (títol/hora/durada/matèria/tipus — mai la
// data). Si encara no s'havia completat, el nou XP calculat només queda
// desat a l'activitat ("XP disponible") i NO toca el progrés global. Si ja
// estava completada, es reverteix la seva contribució antiga i s'aplica la
// nova, perquè `xpTotal` no quedi desincronitzat del que realment
// representen les activitats completades. En qualsevol cas, es recalculen
// les missions automàtiques (una activitat que canvia de durada/tipus pot
// fer variar el progrés d'una missió d'hores, per exemple).
function updateActivity(state, payload) {
  const { activityId, dateKey } = payload
  const title = (payload.title ?? '').trim()
  if (
    !activityId ||
    !title ||
    !dateKey ||
    !payload.time ||
    !payload.subjectId ||
    !payload.type ||
    !payload.durationMin
  ) {
    return state
  }

  const dayList = state.activities[dateKey]
  if (!dayList) return state
  const idx = dayList.findIndex((a) => a.id === activityId)
  if (idx === -1) return state

  const oldActivity = dayList[idx]
  const newXp = calculateActivityXp(payload.type, payload.durationMin)
  const updatedActivity = {
    ...oldActivity,
    title,
    time: payload.time,
    durationMin: payload.durationMin,
    subjectId: payload.subjectId,
    type: payload.type,
    xp: newXp,
  }

  const dayActivities = dayList
    .map((a, i) => (i === idx ? updatedActivity : a))
    .sort((a, b) => a.time.localeCompare(b.time))
  const activities = { ...state.activities, [dateKey]: dayActivities }

  if (!oldActivity.completed) {
    const { missions, progress } = reevaluateMissionsAfterActivityChange(state, activities, state.progress)
    return { ...state, activities, missions, progress }
  }

  const removed = applyActivityEffect(state, dateKey, oldActivity.xp, oldActivity.durationMin, -1)
  const added = applyActivityEffect(
    { ...state, weeklyActivity: removed.weeklyActivity, progress: removed.progress },
    dateKey,
    newXp,
    payload.durationMin,
    1,
  )
  const progress = recomputeStreak(added.progress, activities[getTodayKey()] ?? [], state.settings.dailyTaskGoal)
  const { missions, progress: finalProgress } = reevaluateMissionsAfterActivityChange(state, activities, progress)

  return { ...state, activities, weeklyActivity: added.weeklyActivity, progress: finalProgress, missions }
}

// Elimina una activitat. Si no s'havia completat, l'XP total NO canvia
// (era només XP "disponible/previst"). Si ja estava completada, es
// reverteix la seva contribució per mantenir `xpTotal` coherent. També es
// recalculen les missions automàtiques (poden perdre progrés si
// l'activitat eliminada era una de les que hi comptaven).
function deleteActivity(state, { activityId, dateKey }) {
  const dayList = state.activities[dateKey]
  if (!dayList) return state
  const activity = dayList.find((a) => a.id === activityId)
  if (!activity) return state

  const dayActivities = dayList.filter((a) => a.id !== activityId)
  const activities = { ...state.activities, [dateKey]: dayActivities }

  if (!activity.completed) {
    const { missions, progress } = reevaluateMissionsAfterActivityChange(state, activities, state.progress)
    return { ...state, activities, missions, progress }
  }

  const removed = applyActivityEffect(state, dateKey, activity.xp, activity.durationMin, -1)
  const progress = recomputeStreak(removed.progress, activities[getTodayKey()] ?? [], state.settings.dailyTaskGoal)
  const { missions, progress: finalProgress } = reevaluateMissionsAfterActivityChange(state, activities, progress)

  return { ...state, activities, weeklyActivity: removed.weeklyActivity, progress: finalProgress, missions }
}

// available -> active. A partir d'aquí compta el progrés (automàtic o
// manual) de la missió.
function startMission(state, missionId) {
  const nowIso = new Date().toISOString()
  const missions = (state.missions ?? []).map((m) =>
    m.id === missionId && m.status === 'available' ? { ...m, status: 'active', startedAt: nowIso } : m,
  )
  // Recalcula per si la missió arrenca ja complint l'objectiu (p. ex.
  // target molt baix i activitat completada al mateix instant).
  const { missions: reevaluated, progress } = reevaluateMissionsAfterActivityChange(
    { ...state, missions },
    state.activities,
    state.progress,
  )
  return { ...state, missions: reevaluated, progress }
}

// Incrementa/decrementa manualment el progrés d'una missió manual (o d'una
// condició manual dins d'una híbrida). Mai completa la missió: només
// prepara el terreny perquè el botó "Completar missió" aparegui.
function adjustManualProgress(state, { missionId, conditionId, delta }) {
  const missions = (state.missions ?? []).map((mission) => {
    if (mission.id !== missionId || mission.status !== 'active') return mission

    if (conditionId) {
      if (mission.trackingType !== 'hybrid') return mission
      const conditions = mission.conditions.map((c) =>
        c.conditionId === conditionId && c.trackingType === 'manual'
          ? { ...c, progress: Math.max(0, Math.min(c.target, (c.progress ?? 0) + delta)) }
          : c,
      )
      return { ...mission, conditions }
    }

    if (mission.trackingType !== 'manual') return mission
    return { ...mission, progress: Math.max(0, Math.min(mission.target, (mission.progress ?? 0) + delta)) }
  })

  return { ...state, missions }
}

// Confirma una missió manual o híbrida (mai una automàtica, que ja
// s'autocompleta). Només l'atorga si realment ha arribat a l'objectiu, i
// només un cop (el `status !== 'active'` guard evita duplicar l'XP si es
// despatxa dues vegades per error).
function completeMission(state, missionId) {
  const mission = (state.missions ?? []).find((m) => m.id === missionId)
  if (!mission || mission.status !== 'active' || mission.trackingType === 'automatic') return state

  const nowIso = new Date().toISOString()
  const display = getMissionDisplay(mission, state.activities, nowIso)
  if (!display.canComplete) return state

  // Congela el progrés en completar: si és híbrida, desa el valor resolt
  // de cada condició (incloent les automàtiques) dins `progress`, perquè
  // més endavant `getMissionDisplay` no l'hagi de recalcular en directe —
  // si ho fes, desmarcar després una activitat que hi va comptar faria
  // mostrar una missió "Completada" amb progrés a 0 (inconsistència a
  // evitar explícitament).
  const completedMission = {
    ...mission,
    status: 'completed',
    completedAt: nowIso,
    conditions:
      mission.trackingType === 'hybrid'
        ? mission.conditions.map((c, i) => ({ ...c, progress: display.conditionsDisplay[i].current }))
        : mission.conditions,
    finalProgress: mission.trackingType !== 'hybrid' ? display.progressCurrent : undefined,
  }
  let missions = state.missions.map((m) => (m.id === missionId ? completedMission : m))
  if (mission.category === 'special') {
    missions = [...missions, instantiateMission(pickNextSpecialTemplate(mission.templateId), 'special')]
  }

  const progress = applyXpDelta(state.progress, mission.xpReward)
  return { ...state, missions, progress }
}

// Crea una missió personal a partir d'una plantilla + quantitat objectiu
// triades per l'usuari. Bloquejada si ja hi ha MAX_ACTIVE_PERSONAL_MISSIONS
// personals no completades (disponibles o actives).
function createPersonalMissionAction(state, payload) {
  const openPersonalCount = (state.missions ?? []).filter(
    (m) => m.category === 'personal' && m.status !== 'completed',
  ).length
  if (openPersonalCount >= MAX_ACTIVE_PERSONAL_MISSIONS) return state

  const mission = createPersonalMission(payload)
  if (!mission) return state

  return { ...state, missions: [...(state.missions ?? []), mission] }
}

// Compra un desbloqueig comprable amb `xpAvailable` (mai toca `xpTotal`).
// No fa res si no és comprable, ja s'ha comprat, no es compleix el
// requisit de nivell/XP, o no hi ha prou XP disponible.
function purchaseUnlockAction(state, unlockId) {
  const metrics = computeLifetimeMetrics(state)
  const result = purchaseUnlockEngine(
    unlockTemplates,
    unlockId,
    metrics,
    state.ownedUnlockIds ?? [],
    state.progress.xpAvailable,
  )
  if (!result) return state

  return {
    ...state,
    ownedUnlockIds: result.ownedUnlockIds,
    progress: { ...state.progress, xpAvailable: result.xpAvailable },
  }
}

// Desa nom d'usuari + idioma (botó "Desar canvis" de Compte). Ignora
// noms buits perquè el `user.name` mostrat a tot arreu mai quedi buit.
function saveAccountInfo(state, { username, language }) {
  const trimmed = (username ?? '').trim()
  return {
    ...state,
    settings: {
      ...state.settings,
      username: trimmed || state.settings.username,
      language: SUPPORTED_LANGUAGE_SET.has(language) ? language : state.settings.language,
    },
  }
}

// Canvi d'idioma immediat (sense botó "Desar"), usat per l'Onboarding
// (pas 2) perquè la resta de l'assistent —inclòs `SubjectSelector` al pas
// 3— es vegi a l'idioma triat sense esperar cap confirmació. Compte →
// idioma continua fent servir `saveAccountInfo` (amb el botó "Desar
// canvis"): són dos punts d'entrada diferents al mateix camp.
function setLanguage(state, language) {
  return {
    ...state,
    settings: { ...state.settings, language: SUPPORTED_LANGUAGE_SET.has(language) ? language : state.settings.language },
  }
}

// "Canviar foto" — s'aplica immediatament (independent del botó "Desar
// canvis", que només és per a nom/idioma). `avatarDataUrl: null` treu la
// foto (torna a l'avatar per defecte).
function setAvatar(state, avatarDataUrl) {
  return { ...state, settings: { ...state.settings, avatarDataUrl } }
}

// Aplica un pedaç parcial a `settings.notifications` — cada toggle
// d'aquest bloc s'aplica immediatament, sense botó "Desar".
function updateNotifications(state, patch) {
  return { ...state, settings: { ...state.settings, notifications: { ...state.settings.notifications, ...patch } } }
}

// Igual que `updateNotifications` però per a `settings.appearance`.
function updateAppearance(state, patch) {
  return { ...state, settings: { ...state.settings, appearance: { ...state.settings.appearance, ...patch } } }
}

// Configuració → Estudi. A diferència de `notifications`/`appearance`,
// aquests camps viuen plans directament a `settings` (no imbricats) —
// el pedaç s'aplica igual, només canvia on.
function updateStudySettings(state, patch) {
  return { ...state, settings: { ...state.settings, ...patch } }
}

// "Tancar sessió" / tornar a entrar. No hi ha autenticació real: és un
// senzill flag de sessió local (mai esborra el progrés ni cap altra
// dada), pensat perquè en el futur es pugui substituir per un flux
// d'autenticació real sense canviar la resta de l'app.
function setSessionActive(state, sessionActive) {
  return { ...state, settings: { ...state.settings, sessionActive } }
}

// "Reiniciar aplicació" (Configuració → Compte, targeta abans anomenada
// "Dades de proves"): des de la Fase final de consolidació ja NO és un
// reinici parcial que preserva compte/matèries — torna l'aplicació
// SENCERA a l'estat pre-Onboarding (`buildInitialState()`, amb
// `onboardingComplete: false`), perquè en recarregar-se la interfície
// l'usuari torni a veure l'assistent de benvenida, no el dashboard de
// demo. **Substitueix** el `RESET_PROGRESS` de la iteració de
// Configuració (que sí preservava `settings`/`subjects` — decisió vàlida
// per a aquella fase, superada explícitament per aquest encàrrec: veure
// NOTES.md, secció "Fase final de consolidació").
function restartApp() {
  return buildInitialState()
}

// Botó final de l'Onboarding ("Comença"): construeix l'estat real d'un
// usuari nou (`buildFreshState`, veure comentari allà) i genera d'entrada
// les missions diàries/setmanals/especial disponibles, reutilitzant
// `renewMissions()` — el mateix mecanisme que ja fa servir `AppProvider`
// en la primera càrrega — perquè el dashboard no aparegui buit de
// missions just en sortir de l'assistent, sense esperar cap altre
// dispatch per activar-lo.
function completeOnboarding(state, payload) {
  const fresh = buildFreshState(state, payload)
  const renewal = renewMissions(fresh, resolveUserSubjects(fresh.subjects), fresh.settings.weekStartsOn)
  return renewal ? { ...fresh, ...renewal } : fresh
}

// Tutorial inicial (`TutorialOverlay.jsx`, `COMPLETE_TUTORIAL`/
// `SKIP_TUTORIAL`): "Saltar tutorial" té exactament el mateix efecte que
// acabar-lo normalment (demanat explícitament a l'encàrrec) — mai torna
// a aparèixer, l'usuari no queda "a mitges" per sempre.
function finishTutorial(state) {
  return { ...state, settings: { ...state.settings, tutorialComplete: true } }
}

// Desa el pas actual mentre el tutorial està en marxa, perquè recarregar
// la pàgina a mitja seqüència el continuï pel mateix punt en lloc de
// reiniciar-lo — reutilitza la mateixa persistència de `settings` que ja
// existeix, tal com suggeria l'encàrrec.
function setTutorialStep(state, stepIndex) {
  return { ...state, settings: { ...state.settings, tutorialStepIndex: stepIndex } }
}

// Afegeix qualsevol desbloqueig AUTOMÀTIC i assoliment que ja compleixi
// el seu requisit i encara no s'hagi obtingut. Es crida al final de CADA
// acció del reducer (i a la càrrega inicial), perquè cap camí (completar
// una activitat, una missió, etc.) pugui oblidar-se d'actualitzar-los.
// Pura: no toca `eventLog` (veure `finalizeDispatch` per als esdeveniments).
function applyAutomaticRewards(state) {
  const ownedUnlockIds = state.ownedUnlockIds ?? []
  const ownedAchievementIds = state.ownedAchievementIds ?? []
  const metrics = computeLifetimeMetrics(state)

  const nextUnlockIds = evaluateAutomaticUnlocks(unlockTemplates, metrics, ownedUnlockIds)
  const nextAchievementIds = evaluateAchievements(achievementTemplates, metrics, ownedAchievementIds)

  if (
    nextUnlockIds === ownedUnlockIds &&
    nextAchievementIds === ownedAchievementIds &&
    state.ownedUnlockIds &&
    state.ownedAchievementIds
  ) {
    return state
  }

  return { ...state, ownedUnlockIds: nextUnlockIds, ownedAchievementIds: nextAchievementIds }
}

// Compara l'estat just abans d'aquest dispatch (`prevState`) amb el
// resultat final (`state`, ja amb els desbloquejos/assoliments automàtics
// aplicats) per derivar quins esdeveniments "notables" han passat — sense
// que cada acció del reducer hagi de saber res sobre `eventLog`. Cobreix
// tant els desbloquejos automàtics com els comprats (ambdós es veuen com
// un canvi a `ownedUnlockIds`, independentment de com hi han arribat).
function collectDispatchEvents(prevState, state) {
  const events = []
  const xpTotalAfter = state.progress.xpTotal

  const prevActivityById = new Map(flattenActivities(prevState.activities ?? {}).map((a) => [a.id, a]))
  for (const a of flattenActivities(state.activities ?? {})) {
    const before = prevActivityById.get(a.id)
    if (a.completed && !(before && before.completed)) {
      events.push({ type: 'tasca', title: `Vas completar tasca: ${a.title}`, xp: a.xp, xpTotalAfter, refId: a.id })
    }
  }

  const prevMissionById = new Map((prevState.missions ?? []).map((m) => [m.id, m]))
  for (const m of state.missions ?? []) {
    const before = prevMissionById.get(m.id)
    if (m.status === 'completed' && !(before && before.status === 'completed')) {
      events.push({ type: 'missio', title: `Missió completada: ${m.title}`, xp: m.xpReward, xpTotalAfter, refId: m.id })
    }
  }

  const prevProgress = prevState.progress
  const nextProgress = state.progress
  if (nextProgress.streakBoostedToday && !prevProgress.streakBoostedToday) {
    events.push({ type: 'racha', title: `Ratxa de ${nextProgress.streakDays} dies mantinguda`, xp: null })
  }
  if ((nextProgress.maxStreak ?? 0) > (prevProgress.maxStreak ?? 0)) {
    events.push({ type: 'racha', title: `Nova ratxa màxima: ${nextProgress.maxStreak} dies`, xp: null })
  }
  if (nextProgress.level > prevProgress.level) {
    events.push({ type: 'nivell', title: `Nivell ${nextProgress.level} assolit`, xp: null })
  }

  const prevAchievementIds = prevState.ownedAchievementIds ?? []
  for (const id of state.ownedAchievementIds ?? []) {
    if (prevAchievementIds.includes(id)) continue
    const template = achievementTemplates.find((a) => a.id === id)
    if (template) events.push({ type: 'assoliment', title: `Assoliment desbloquejat: ${template.title}`, xp: null, refId: id })
  }

  const prevUnlockIds = prevState.ownedUnlockIds ?? []
  for (const id of state.ownedUnlockIds ?? []) {
    if (prevUnlockIds.includes(id)) continue
    const template = unlockTemplates.find((u) => u.id === id)
    if (template) events.push({ type: 'desbloqueig', title: `Desbloqueig obtingut: ${template.title}`, xp: null, refId: id })
  }

  return events
}

// Pas final de CADA dispatch: aplica els desbloquejos/assoliments
// automàtics i, comparant amb l'estat previ, hi afegeix a `eventLog`
// qualsevol esdeveniment notable derivat (mai un càlcul redundant: es
// dedueix del mateix canvi d'estat que ja s'ha produït).
function finalizeDispatch(prevState, state) {
  const rewarded = applyAutomaticRewards(state)
  const newEvents = collectDispatchEvents(prevState, rewarded)
  if (newEvents.length === 0) return rewarded

  let eventLog = rewarded.eventLog ?? []
  for (const event of newEvents) eventLog = pushEvent(eventLog, event)
  return { ...rewarded, eventLog }
}

function reducer(state, action) {
  const renewal = renewMissions(
    { missions: state.missions ?? [], missionsMeta: state.missionsMeta ?? { dailyRenewedAt: null, weeklyRenewedAt: null } },
    resolveUserSubjects(state.subjects),
    state.settings?.weekStartsOn,
  )
  const current = renewal ? { ...state, ...renewal } : state

  let next
  switch (action.type) {
    case 'TOGGLE_TASK':
      next = toggleTask(current, action.taskId)
      break
    case 'TOGGLE_DEFAULT_SUBJECT':
      next = toggleDefaultSubject(current, action.subjectId)
      break
    case 'ADD_CUSTOM_SUBJECT':
      next = addCustomSubject(current, action.name)
      break
    case 'REMOVE_CUSTOM_SUBJECT':
      next = removeCustomSubject(current, action.subjectId)
      break
    case 'ADD_ACTIVITY':
      next = addActivity(current, action.payload)
      break
    case 'UPDATE_ACTIVITY':
      next = updateActivity(current, action.payload)
      break
    case 'DELETE_ACTIVITY':
      next = deleteActivity(current, action.payload)
      break
    case 'START_MISSION':
      next = startMission(current, action.missionId)
      break
    case 'ADJUST_MANUAL_PROGRESS':
      next = adjustManualProgress(current, action.payload)
      break
    case 'COMPLETE_MISSION':
      next = completeMission(current, action.missionId)
      break
    case 'CREATE_PERSONAL_MISSION':
      next = createPersonalMissionAction(current, action.payload)
      break
    case 'PURCHASE_UNLOCK':
      next = purchaseUnlockAction(current, action.unlockId)
      break
    case 'SAVE_ACCOUNT_INFO':
      next = saveAccountInfo(current, action.payload)
      break
    case 'SET_LANGUAGE':
      next = setLanguage(current, action.language)
      break
    case 'SET_AVATAR':
      next = setAvatar(current, action.avatarDataUrl)
      break
    case 'UPDATE_NOTIFICATIONS':
      next = updateNotifications(current, action.patch)
      break
    case 'UPDATE_APPEARANCE':
      next = updateAppearance(current, action.patch)
      break
    case 'UPDATE_STUDY':
      next = updateStudySettings(current, action.patch)
      break
    case 'SET_SESSION_ACTIVE':
      next = setSessionActive(current, action.sessionActive)
      break
    case 'RESET_APP':
      next = restartApp()
      break
    case 'COMPLETE_ONBOARDING':
      next = completeOnboarding(current, action.payload)
      break
    case 'COMPLETE_TUTORIAL':
    case 'SKIP_TUTORIAL':
      next = finishTutorial(current)
      break
    case 'SET_TUTORIAL_STEP':
      next = setTutorialStep(current, action.stepIndex)
      break
    default:
      next = current
  }

  return finalizeDispatch(current, next)
}

// Llista d'activitats per a "Tasques previstes" d'Inici: només avui i
// endavant, ordenades per data i, dins del mateix dia, per hora — mai una
// activitat futura per davant d'una d'avui — i retallada a
// UPCOMING_TASKS_LIMIT (si avui ja l'omple, les de demà no hi caben).
function getUpcomingActivities(activitiesByDate, todayKey) {
  return flattenActivities(activitiesByDate)
    .filter((a) => a.dateKey >= todayKey)
    .sort((a, b) => (a.dateKey === b.dateKey ? a.time.localeCompare(b.time) : a.dateKey.localeCompare(b.dateKey)))
    .slice(0, UPCOMING_TASKS_LIMIT)
}

// "Avui" real (rellotge del sistema, `getTodayKey()`) en la mateixa forma
// que abans tenia el mock fix de `data/seedData.js` — veure NOTES.md,
// "Sincronitzar el dia d'avui amb la data real". Es recalcula a cada
// `buildSelectors()` (és a dir, a cada dispatch): prou fresc per a un
// prototip, sense necessitat de cap temporitzador.
function buildToday() {
  const now = new Date()
  const dateKey = getTodayKey()
  return {
    dateKey,
    dayCode: getDayCodeForDateKey(dateKey),
    weekday: getWeekdayFullLabelCa(now),
    dateLabel: getShortDateLabelCa(now),
  }
}

function buildSelectors(state) {
  const { progress, weeklyActivity, activities, subjects: subjectsState, settings } = state

  const language = settings.language
  const t = (key, vars) => translate(language, key, vars)

  const today = buildToday()
  const todaysActivities = activities[today.dateKey] ?? []
  const tasksCompletedToday = todaysActivities.filter((a) => a.completed).length

  const user = {
    name: settings.username,
    avatarDataUrl: settings.avatarDataUrl,
    level: progress.level,
    levelName: getLevelName(progress.level),
    xpTotal: progress.xpTotal,
    xpAvailable: progress.xpAvailable,
    xpCurrentLevel: progress.xpCurrentLevel,
    xpNextLevel: progress.xpNextLevel,
    levelProgressPercent: Math.round((progress.xpCurrentLevel / progress.xpNextLevel) * 100),
  }

  const streak = {
    currentDays: progress.streakDays,
    targetDays: progress.streakTarget,
    note:
      progress.streakDays >= progress.streakTarget
        ? t('home.streakChallengeDone')
        : t('home.streakChallengeNote', { n: progress.streakTarget - progress.streakDays }),
  }

  const metricValues = {
    tasksCompletedToday,
    xpGainedToday: progress.xpGainedToday,
    hoursStudiedToday: progress.hoursStudiedToday,
    weeklySessions: progress.weeklySessions,
    streakDays: progress.streakDays,
    weeklyXP: progress.weeklyXP,
  }

  // L'objectiu de "Completa X tasques avui" ja no és el `target` fix del
  // catàleg: ve de `settings.dailyTaskGoal` (Configuració → Estudi), amb
  // efecte real sobre el denominador mostrat i sobre quan es compleix
  // l'objectiu (veure `recomputeStreak`). Els altres objectius d'avui
  // (XP/hores) es mantenen fixos, tal com demanava l'encàrrec.
  const dailyGoals = dailyGoalsConfig.map((cfg) => {
    const target = cfg.metric === 'tasksCompletedToday' ? settings.dailyTaskGoal : cfg.target
    return {
      id: cfg.id,
      title: t(cfg.titleKey, { n: target }),
      xp: cfg.xp,
      target,
      current: metricValues[cfg.metric],
    }
  })
  const dailyGoalsCompletedCount = dailyGoals.filter((g) => g.current >= g.target).length

  const pendingGoals = pendingGoalsConfig.map((cfg) => {
    const current = metricValues[cfg.metric]
    return {
      id: cfg.id,
      title: t(cfg.titleKey, { n: cfg.target.toLocaleString('ca-ES') }),
      target: cfg.target,
      current,
      percent: Math.min(100, Math.round((current / cfg.target) * 100)),
    }
  })

  const weeklyHoursTotal = weeklyActivity.reduce((sum, d) => sum + d.hours, 0)

  const upcomingTasks = getUpcomingActivities(activities, today.dateKey)
  const pendingTasksCount = upcomingTasks.filter((a) => !a.completed).length

  const indicators = [
    {
      id: 'xp',
      label: t('home.indicator.xpTotal'),
      value: user.xpTotal.toLocaleString('ca-ES'),
      animatedValue: user.xpTotal,
      icon: 'zap',
      color: 'purple',
    },
    { id: 'level', label: t('home.indicator.level'), value: String(user.level), icon: 'star', color: 'yellow' },
    {
      id: 'tasks',
      label: t('home.indicator.tasksToday'),
      value: `${tasksCompletedToday}/${todaysActivities.length}`,
      icon: 'check',
      color: 'green',
    },
    {
      id: 'hours',
      label: t('home.indicator.hoursThisWeek'),
      value: `${weeklyHoursTotal.toFixed(1)}h`,
      animatedValue: weeklyHoursTotal,
      decimals: 1,
      suffix: 'h',
      icon: 'clock',
      color: 'cyan',
    },
  ]

  const userSubjects = resolveUserSubjects(subjectsState)
  const subjects = {
    catalog: defaultSubjectsCatalog,
    selectedDefaultIds: subjectsState.selectedDefaultIds,
    custom: subjectsState.custom,
    userSubjects,
  }

  const nowIso = new Date().toISOString()
  const missionsDisplay = (state.missions ?? []).map((m) => getMissionDisplay(m, activities, nowIso))
  const missionStats = {
    xpDaily: missionsDisplay
      .filter((m) => m.category === 'daily' && m.status !== 'completed')
      .reduce((sum, m) => sum + m.xpReward, 0),
    xpWeekly: missionsDisplay
      .filter((m) => m.category === 'weekly' && m.status !== 'completed')
      .reduce((sum, m) => sum + m.xpReward, 0),
  }
  const missionRecommendations = buildRecommendations(missionsDisplay)

  const lifetimeMetrics = computeLifetimeMetrics(state)
  const ownedUnlockIds = state.ownedUnlockIds ?? []
  const ownedAchievementIds = state.ownedAchievementIds ?? []
  const unlocks = unlockTemplates.map((tpl) => getUnlockDisplay(tpl, lifetimeMetrics, ownedUnlockIds, progress.xpAvailable))
  const achievements = achievementTemplates.map((tpl) => ({ ...tpl, unlocked: ownedAchievementIds.includes(tpl.id) }))

  // Tot el que consumeix Perfil, derivat dels mateixos sistemes de dalt
  // (activities, missions, rewards, eventLog) — cap dada mock nova. Veure
  // src/utils/profileEngine.js per a com es calcula cada bloc.
  const eventLog = state.eventLog ?? []
  const subjectsById = buildSubjectsById(subjectsState.custom)
  const profile = {
    stats: {
      tasksCompleted: lifetimeMetrics.activitiesCompleted,
      hoursTotal: Math.round(lifetimeMetrics.hoursStudied * 10) / 10,
      achievementsUnlocked: ownedAchievementIds.length,
      achievementsTotal: achievementTemplates.length,
      maxStreak: progress.maxStreak ?? progress.streakDays,
    },
    memberSince: seedUser.memberSince,
    monthlyHours: computeMonthlyStudyHours(activities),
    xpTrend: computeXpTrend(eventLog, progress.xpTotal),
    subjectDistribution: computeSubjectDistribution(activities, subjectsById),
    achievedGoals: computeAchievedGoals(achievementTemplates, ownedAchievementIds, eventLog),
    recentActivity: computeRecentActivity(eventLog, 6, { today: t('profile.today'), yesterday: t('profile.yesterday') }),
  }

  return {
    t,
    settings,
    user,
    progress,
    today,
    streak,
    dailyGoals,
    dailyGoalsCompletedCount,
    indicators,
    tasks: upcomingTasks,
    pendingTasksCount,
    unlocks,
    achievements,
    // Reordenat només per a la visualització (WeeklyBarChart d'Inici) —
    // es desa sempre en ordre DL..DG intern, independent de la preferència.
    weeklyActivity: reorderWeekArray(weeklyActivity, settings.weekStartsOn),
    pendingGoals,
    subjects,
    activities,
    missions: missionsDisplay,
    missionStats,
    missionRecommendations,
    profile,
    eventLog,
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const loaded = loadState()
    const base = loaded && loaded.progress && loaded.weeklyActivity ? loaded : buildInitialState()
    const subjects = base.subjects ?? buildInitialSubjectsState()

    // Migració: `xpAvailable` és nou (per defecte, igual que `xpTotal` si
    // encara no existia); `level`/`xpCurrentLevel`/`xpNextLevel` es
    // recalculen SEMPRE a partir de `xpTotal` amb l'escala única de
    // nivells (computeLevelInfo) — així un estat persistit d'abans de la
    // unificació (sistema pla de 5.000 XP/nivell) queda corregit sol,
    // sense arrossegar valors desincronitzats.
    const baseProgress = {
      ...base.progress,
      xpAvailable: base.progress.xpAvailable ?? base.progress.xpTotal,
      // `maxStreak` és nou (veure `recomputeStreak`): si un estat persistit
      // no el té encara, el millor valor conegut sense inventar-lo és la
      // ratxa actual (el rècord real mai pot ser inferior a això).
      maxStreak: base.progress.maxStreak ?? base.progress.streakDays ?? 0,
    }
    const progress = { ...baseProgress, ...computeLevelInfo(baseProgress.xpTotal) }

    // `eventLog` és nou (veure `finalizeDispatch`). Un estat sense encara
    // cap entrada (usuari nou o migrat d'abans d'aquest sistema) rep una
    // única entrada "baseline" que ancora l'XP total conegut en aquest
    // moment — mai un historial fictici, només el punt de partida real a
    // partir del qual "Tendència XP" començarà a registrar canvis.
    const eventLog =
      base.eventLog && base.eventLog.length > 0
        ? base.eventLog
        : [{ id: 'ev-baseline', type: 'baseline', date: new Date().toISOString(), xp: null, xpTotalAfter: progress.xpTotal }]

    // `settings` és nou (Configuració). Un estat persistit d'abans
    // d'aquest sistema no en té — es completa amb els valors per defecte,
    // fent merge camp a camp perquè un estat parcialment nou (p. ex. amb
    // `notifications` però sense el camp `xpGain` afegit més tard) també
    // quedi complet sense perdre res del que ja s'havia desat.
    const defaultSettings = buildInitialSettings()
    const settings = {
      ...defaultSettings,
      ...base.settings,
      notifications: { ...defaultSettings.notifications, ...base.settings?.notifications },
      appearance: { ...defaultSettings.appearance, ...base.settings?.appearance },
    }

    const withDefaults = {
      weeklyActivity: base.weeklyActivity,
      progress,
      subjects,
      activities: migrateActivities(base.activities ?? initialActivities),
      missions: base.missions ?? [],
      missionsMeta: base.missionsMeta ?? { dailyRenewedAt: null, weeklyRenewedAt: null },
      ownedUnlockIds: base.ownedUnlockIds ?? [],
      ownedAchievementIds: base.ownedAchievementIds ?? [],
      eventLog,
      settings,
    }
    // Assegura missions diàries/setmanals/especial fresques ja a la
    // primera càrrega (fins i tot si l'app no s'obria des de feia dies).
    const renewal = renewMissions(withDefaults, resolveUserSubjects(subjects), settings.weekStartsOn)
    const withMissions = renewal ? { ...withDefaults, ...renewal } : withDefaults
    // Desbloquejos/assoliments automàtics que ja es compleixin d'entrada
    // (p. ex. l'XP inicial ja supera algun requisit). No es registren com
    // a esdeveniments "nous" a l'`eventLog`: ja eren certs des de l'inici,
    // no han "passat" ara mateix.
    return applyAutomaticRewards(withMissions)
  })

  useEffect(() => {
    saveState(state)
  }, [state])

  // Aplica tema/color d'accent/mode compacte/animacions a l'arrel del
  // document via atributs `data-*` + variables CSS (veure
  // src/styles/variables.css) — mai s'ha de tocar cap component perquè
  // rebi el canvi, tots ja llegeixen les mateixes variables CSS. Viu aquí
  // (no a un component de pantalla) perquè s'apliqui sempre,
  // independentment de quina pantalla estigui activa.
  useEffect(() => {
    const root = document.documentElement
    const { theme, accentColor, compactMode, animations } = state.settings.appearance

    function resolveTheme() {
      if (theme === 'sistema') {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'clar' : 'fosc'
      }
      return theme
    }

    function applyTheme() {
      root.dataset.theme = resolveTheme()
    }
    applyTheme()
    root.dataset.accent = accentColor
    root.dataset.compact = String(compactMode)
    root.dataset.animations = animations ? 'on' : 'off'

    if (theme !== 'sistema') return undefined
    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [state.settings.appearance])

  const selectors = useMemo(() => buildSelectors(state), [state])

  const value = useMemo(
    () => ({
      ...selectors,
      toggleTask: (activityId) => dispatch({ type: 'TOGGLE_TASK', taskId: activityId }),
      toggleDefaultSubject: (subjectId) => dispatch({ type: 'TOGGLE_DEFAULT_SUBJECT', subjectId }),
      addCustomSubject: (name) => dispatch({ type: 'ADD_CUSTOM_SUBJECT', name }),
      removeCustomSubject: (subjectId) => dispatch({ type: 'REMOVE_CUSTOM_SUBJECT', subjectId }),
      addActivity: (payload) => dispatch({ type: 'ADD_ACTIVITY', payload }),
      updateActivity: (payload) => dispatch({ type: 'UPDATE_ACTIVITY', payload }),
      deleteActivity: (payload) => dispatch({ type: 'DELETE_ACTIVITY', payload }),
      startMission: (missionId) => dispatch({ type: 'START_MISSION', missionId }),
      adjustMissionProgress: (missionId, conditionId, delta) =>
        dispatch({ type: 'ADJUST_MANUAL_PROGRESS', payload: { missionId, conditionId, delta } }),
      completeMission: (missionId) => dispatch({ type: 'COMPLETE_MISSION', missionId }),
      createPersonalMission: (payload) => dispatch({ type: 'CREATE_PERSONAL_MISSION', payload }),
      purchaseUnlock: (unlockId) => dispatch({ type: 'PURCHASE_UNLOCK', unlockId }),
      saveAccountInfo: (payload) => dispatch({ type: 'SAVE_ACCOUNT_INFO', payload }),
      setLanguage: (language) => dispatch({ type: 'SET_LANGUAGE', language }),
      setAvatar: (avatarDataUrl) => dispatch({ type: 'SET_AVATAR', avatarDataUrl }),
      updateNotifications: (patch) => dispatch({ type: 'UPDATE_NOTIFICATIONS', patch }),
      updateAppearance: (patch) => dispatch({ type: 'UPDATE_APPEARANCE', patch }),
      updateStudySettings: (patch) => dispatch({ type: 'UPDATE_STUDY', patch }),
      setSessionActive: (sessionActive) => dispatch({ type: 'SET_SESSION_ACTIVE', sessionActive }),
      restartApp: () => dispatch({ type: 'RESET_APP' }),
      completeOnboarding: (payload) => dispatch({ type: 'COMPLETE_ONBOARDING', payload }),
      completeTutorial: () => dispatch({ type: 'COMPLETE_TUTORIAL' }),
      skipTutorial: () => dispatch({ type: 'SKIP_TUTORIAL' }),
      setTutorialStep: (stepIndex) => dispatch({ type: 'SET_TUTORIAL_STEP', stepIndex }),
    }),
    [selectors],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp s\'ha de fer servir dins de <AppProvider>')
  }
  return ctx
}
