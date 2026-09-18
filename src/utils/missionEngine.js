// Motor de missions: funcions pures que instancien missions a partir del
// catàleg de plantilles, calculen el progrés de les automàtiques a partir
// de les activitats completades, i gestionen la renovació diària/setmanal.
// No coneix res de React ni de l'estructura de `AppContext` més enllà del
// que se li passa explícitament — així es pot provar/ajustar aïlladament.

import {
  dailyMissionTemplates,
  weeklyMissionTemplates,
  specialMissionTemplates,
  personalMissionTemplates,
  PERSONAL_MAGNITUDE_THRESHOLDS,
  PERSONAL_XP_BY_DIFFICULTY,
  DAILY_MISSION_COUNT,
  WEEKLY_MISSION_COUNT,
} from '../data/missionTemplates'
import { flattenActivities, getWeekDates, toDateKey, getTodayKey } from './calendarUtils'

function round1(value) {
  return Math.round(value * 10) / 10
}

let missionIdCounter = 0
function makeMissionId() {
  missionIdCounter += 1
  return `mis-${Date.now()}-${missionIdCounter}-${Math.random().toString(36).slice(2, 6)}`
}

/** Data real d'avui (rellotge del sistema). Fins ara les missions eren
 * l'única part de l'app que ja funcionava en "temps real" (com el
 * ResetTimer, que compta fins a mitjanit real) — des de la sincronització
 * del dia d'avui (veure NOTES.md), activitats/Inici/Calendari també fan
 * servir el mateix rellotge (`getTodayKey` a `calendarUtils.js`), així
 * que aquesta funció ara només hi delega: es manté pel seu nom
 * (`getRealWeekMondayKey` la crida) per no haver de tocar cada punt on ja
 * s'usava. */
export function getRealTodayKey() {
  return getTodayKey()
}

/** Clau (dateKey) del primer dia de la setmana real actual, segons
 * `weekStartsOn` (`settings.weekStartsOn` — 'monday' per defecte). Nom
 * mantingut per compatibilitat encara que ja no sigui sempre "dilluns". */
export function getRealWeekMondayKey(weekStartsOn = 'monday') {
  return toDateKey(getWeekDates(getRealTodayKey(), weekStartsOn)[0])
}

/** Activitats completades amb `completedAt` (timestamp real) dins la finestra [startIso, endIso]. */
export function getCompletedActivitiesInWindow(activitiesByDate, startIso, endIso) {
  if (!startIso) return []
  return flattenActivities(activitiesByDate).filter(
    (a) => a.completed && a.completedAt && a.completedAt >= startIso && a.completedAt <= endIso,
  )
}

function computeMetricValue(metric, activities, subjectId) {
  const filtered = subjectId && metric !== 'subjectActivity' ? activities.filter((a) => a.subjectId === subjectId) : activities
  switch (metric) {
    case 'activitiesCompleted':
      return filtered.length
    case 'hoursStudied':
      return round1(filtered.reduce((sum, a) => sum + a.durationMin / 60, 0))
    case 'xpEarned':
      return filtered.reduce((sum, a) => sum + a.xp, 0)
    case 'subjectsWorked':
      return new Set(filtered.map((a) => a.subjectId)).size
    case 'activeDays':
      return new Set(filtered.map((a) => new Date(a.completedAt).toDateString())).size
    case 'subjectActivity':
      return activities.some((a) => a.subjectId === subjectId) ? 1 : 0
    default:
      return 0
  }
}

/**
 * Instancia una missió nova a partir d'una plantilla. `extra.subjectId`/
 * `extra.subjectName` només s'usen per a plantilles amb `needsSubject`
 * (p. ex. "Treballa una matèria concreta").
 */
export function instantiateMission(template, category, extra = {}) {
  const base = {
    id: makeMissionId(),
    templateId: template.templateId,
    title: template.title,
    description: template.description,
    category,
    difficulty: template.difficulty,
    trackingType: template.trackingType,
    xpReward: template.xpReward,
    status: 'available',
    startedAt: null,
    completedAt: null,
    subjectId: extra.subjectId ?? null,
  }

  if (template.needsSubject && extra.subjectName) {
    base.title = `Treballa ${extra.subjectName}`
    base.description = `Completa almenys una activitat de ${extra.subjectName} avui`
  }

  if (template.trackingType === 'hybrid') {
    return {
      ...base,
      conditions: template.conditions.map((c) => ({
        ...c,
        progress: c.trackingType === 'manual' ? 0 : undefined,
      })),
    }
  }

  return {
    ...base,
    metric: template.metric,
    unit: template.unit,
    target: template.target,
    progress: template.trackingType === 'manual' ? 0 : undefined,
  }
}

/** Tria `count` plantilles evitant repetir la mateixa mètrica (per no
 * mostrar dues missions "pràcticament idèntiques" alhora). */
function pickDistinctByMetric(templates, count) {
  const seen = new Set()
  const picked = []
  for (const t of templates) {
    const key = t.metric ?? t.templateId
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(t)
    if (picked.length === count) break
  }
  return picked
}

export function selectDailyMissions(userSubjects) {
  let templates = pickDistinctByMetric(dailyMissionTemplates, DAILY_MISSION_COUNT)

  const needsSubjectPicked = templates.some((t) => t.needsSubject)
  if (needsSubjectPicked && userSubjects.length === 0) {
    // Sense matèries configurades no es pot generar "Treballa una matèria
    // concreta" (l'enunciat prohibeix missions amb matèries no
    // configurades). Se substitueix per una altra plantilla encara que
    // repeteixi mètrica amb una ja triada — excepció deliberada, documentada
    // a NOTES.md, preferible a mostrar només 2 missions diàries.
    templates = templates.filter((t) => !t.needsSubject)
    const fallback = dailyMissionTemplates.find(
      (t) => !t.needsSubject && !templates.some((picked) => picked.templateId === t.templateId),
    )
    if (fallback) templates = [...templates, fallback]
  }

  return templates.map((template) => {
    if (template.needsSubject) {
      const subject = userSubjects[0]
      return instantiateMission(template, 'daily', { subjectId: subject.id, subjectName: subject.name })
    }
    return instantiateMission(template, 'daily')
  })
}

export function selectWeeklyMissions() {
  return pickDistinctByMetric(weeklyMissionTemplates, WEEKLY_MISSION_COUNT).map((template) =>
    instantiateMission(template, 'weekly'),
  )
}

export function pickNextSpecialTemplate(excludeTemplateId) {
  const candidates = specialMissionTemplates.filter((t) => t.templateId !== excludeTemplateId)
  const pool = candidates.length > 0 ? candidates : specialMissionTemplates
  return pool[Math.floor(Math.random() * pool.length)]
}

export function selectInitialSpecialMission() {
  return instantiateMission(pickNextSpecialTemplate(null), 'special')
}

export function getPersonalMissionDifficulty(templateId, target) {
  const thresholds = PERSONAL_MAGNITUDE_THRESHOLDS[templateId]
  if (!thresholds) return 'medium'
  if (target <= thresholds.easy) return 'easy'
  if (target <= thresholds.medium) return 'medium'
  if (target <= thresholds.hard) return 'hard'
  return 'epic'
}

/** Crea una missió personal a partir del formulari de l'usuari. Retorna
 * `null` si les dades no són vàlides (títol buit o objectiu <= 0). */
export function createPersonalMission(payload) {
  const template = personalMissionTemplates.find((t) => t.templateId === payload.templateId)
  const title = (payload.title ?? '').trim()
  const target = Number(payload.target)
  if (!template || !title || !Number.isFinite(target) || target <= 0) return null

  const difficulty = getPersonalMissionDifficulty(template.templateId, target)

  return {
    id: makeMissionId(),
    templateId: template.templateId,
    title,
    description: null,
    category: 'personal',
    difficulty,
    trackingType: template.trackingType,
    metric: template.trackingType === 'automatic' ? template.metric : undefined,
    unit: template.unit,
    target,
    progress: template.trackingType === 'manual' ? 0 : undefined,
    xpReward: PERSONAL_XP_BY_DIFFICULTY[difficulty],
    status: 'available',
    startedAt: null,
    completedAt: null,
    subjectId: payload.subjectId || null,
  }
}

/**
 * Construeix la vista "resolta" d'una missió per a la UI: progrés/objectiu
 * calculats en directe per a les parts automàtiques (mai emmagatzemats —
 * així sempre reflecteixen l'estat actual d'activitats sense poder
 * desincronitzar-se), i les manuals tal com estan desades. Un cop la
 * missió té `completedAt`, el càlcul queda "congelat" en aquell moment.
 */
export function getMissionDisplay(mission, activitiesByDate, nowIso) {
  if (mission.status === 'available') {
    return {
      ...mission,
      progressCurrent: 0,
      progressTarget: mission.trackingType === 'hybrid' ? mission.conditions.length : mission.target,
      conditionsDisplay:
        mission.trackingType === 'hybrid' ? mission.conditions.map((c) => ({ ...c, current: 0, met: false })) : null,
      canComplete: false,
    }
  }

  const endIso = mission.completedAt ?? nowIso
  const startIso = mission.startedAt ?? nowIso
  const isFrozen = mission.status === 'completed'

  if (mission.trackingType === 'hybrid') {
    // Un cop completada, el progrés de cada condició es congela al valor
    // que tenia en aquell moment (desat a `c.progress` per completeMission)
    // — si es recalculés en directe, desmarcar més tard una activitat que
    // hi va comptar faria mostrar una missió "Completada" amb 0 de
    // progrés, una inconsistència explícitament a evitar.
    const conditionsDisplay = mission.conditions.map((c) => {
      const current =
        isFrozen || c.trackingType === 'manual'
          ? (c.progress ?? 0)
          : computeMetricValue(c.metric, getCompletedActivitiesInWindow(activitiesByDate, startIso, endIso), mission.subjectId)
      return { ...c, current: Math.min(current, c.target), met: current >= c.target }
    })
    const metCount = conditionsDisplay.filter((c) => c.met).length
    return {
      ...mission,
      conditionsDisplay,
      progressCurrent: metCount,
      progressTarget: conditionsDisplay.length,
      canComplete: mission.status === 'active' && metCount === conditionsDisplay.length,
    }
  }

  if (mission.trackingType === 'automatic') {
    // Mateix motiu que a dalt: un cop completada, es mostra el valor
    // congelat (`finalProgress`) en lloc de recalcular en directe.
    const current =
      isFrozen && mission.finalProgress != null
        ? mission.finalProgress
        : computeMetricValue(mission.metric, getCompletedActivitiesInWindow(activitiesByDate, startIso, endIso), mission.subjectId)
    return {
      ...mission,
      progressCurrent: Math.min(current, mission.target),
      progressTarget: mission.target,
      conditionsDisplay: null,
      canComplete: false,
    }
  }

  // manual
  const current = mission.progress ?? 0
  return {
    ...mission,
    progressCurrent: current,
    progressTarget: mission.target,
    conditionsDisplay: null,
    canComplete: mission.status === 'active' && current >= mission.target,
  }
}

/**
 * Recalcula totes les missions automàtiques (simples) actives i completa
 * automàticament les que han arribat a l'objectiu. Les híbrides NO es
 * completen aquí encara que totes les seves condicions es compleixin —
 * sempre requereixen confirmació explícita de l'usuari (COMPLETAR MISSIÓ).
 * Retorna la llista actualitzada i les que s'acaben de completar (perquè
 * qui ho crida pugui atorgar-ne l'XP i, si calen, regenerar especials).
 */
export function reevaluateAutomaticMissions(missions, activitiesByDate, nowIso) {
  const newlyCompleted = []
  const updated = missions.map((mission) => {
    if (mission.status !== 'active' || mission.trackingType !== 'automatic') return mission
    const current = computeMetricValue(
      mission.metric,
      getCompletedActivitiesInWindow(activitiesByDate, mission.startedAt, nowIso),
      mission.subjectId,
    )
    if (current >= mission.target) {
      const completed = { ...mission, status: 'completed', completedAt: nowIso, finalProgress: Math.min(current, mission.target) }
      newlyCompleted.push(completed)
      return completed
    }
    return mission
  })
  return { missions: updated, newlyCompleted }
}

/**
 * Renovació de missions diàries/setmanals basada en dates desades
 * (`missionsMeta`), no en temporitzadors — robust encara que l'app hagi
 * estat tancada dies. Les incompletes del període anterior s'eliminen
 * (expiren); les completades es mantenen a `missions` com a historial.
 * També garanteix que sempre hi hagi exactament 1 missió especial
 * disponible/activa (la genera si no n'hi ha cap en el primer ús).
 */
export function renewMissions({ missions, missionsMeta }, userSubjects, weekStartsOn = 'monday') {
  const todayKey = getRealTodayKey()
  const weekKey = getRealWeekMondayKey(weekStartsOn)
  let next = missions
  let meta = missionsMeta
  let changed = false

  if (meta.dailyRenewedAt !== todayKey) {
    next = next.filter((m) => m.category !== 'daily' || m.status === 'completed')
    next = [...next, ...selectDailyMissions(userSubjects)]
    meta = { ...meta, dailyRenewedAt: todayKey }
    changed = true
  }

  if (meta.weeklyRenewedAt !== weekKey) {
    next = next.filter((m) => m.category !== 'weekly' || m.status === 'completed')
    next = [...next, ...selectWeeklyMissions()]
    meta = { ...meta, weeklyRenewedAt: weekKey }
    changed = true
  }

  const hasOpenSpecial = next.some((m) => m.category === 'special' && m.status !== 'completed')
  if (!hasOpenSpecial) {
    next = [...next, selectInitialSpecialMission()]
    changed = true
  }

  if (!changed) return null
  return { missions: next, missionsMeta: meta }
}

/** Recomanacions basades en regles senzilles sobre l'estat real de les
 * missions (cap IA): proposa començar la disponible més valuosa, o
 * assenyala l'activa que està més a prop de completar-se. */
export function buildRecommendations(missionsDisplay) {
  const recs = []

  const available = missionsDisplay.filter((m) => m.status === 'available')
  if (available.length > 0) {
    const best = [...available].sort((a, b) => b.xpReward - a.xpReward)[0]
    recs.push({
      id: `rec-start-${best.id}`,
      title: `Comença per «${best.title}»`,
      description: `És la missió disponible amb més recompensa ara mateix (+${best.xpReward} XP).`,
      tip: 'El progrés no compta fins que la inicies.',
      actionLabel: 'Inicia-la',
      actionMissionId: best.id,
    })
  }

  const active = missionsDisplay.filter((m) => m.status === 'active' && m.progressTarget > 0)
  if (active.length > 0) {
    const closest = [...active].sort((a, b) => b.progressCurrent / b.progressTarget - a.progressCurrent / a.progressTarget)[0]
    const ratio = closest.progressCurrent / closest.progressTarget
    if (ratio > 0 && ratio < 1) {
      recs.push({
        id: `rec-continue-${closest.id}`,
        title: 'Ets a prop!',
        description: `«${closest.title}» ja porta ${closest.progressCurrent}/${closest.progressTarget}. Un últim esforç i la tens.`,
        tip: null,
      })
    }
  }

  if (recs.length === 0) {
    recs.push({
      id: 'rec-empty',
      title: 'Tot al dia!',
      description: "No tens missions disponibles ni actives ara mateix. Torna més tard o crea'n una de personal.",
      tip: null,
    })
  }

  return recs.slice(0, 2)
}
