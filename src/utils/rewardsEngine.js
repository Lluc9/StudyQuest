// Motor de Recompenses: funcions pures per calcular mètriques "de tota la
// vida" de l'usuari, avaluar quins desbloquejos/assoliments automàtics
// s'han d'obtenir, i comprovar l'elegibilitat/compra dels comprables. Sense
// dependències de React — es crida des del reducer d'AppContext.

import { flattenActivities } from './calendarUtils'

/**
 * Mètriques calculades sobre TOT l'historial (no una finestra temporal
 * com les missions) — per als assoliments i per als requisits de
 * desbloqueig, que són fites acumulades de sempre.
 */
export function computeLifetimeMetrics(state) {
  const completed = flattenActivities(state.activities).filter((a) => a.completed)
  const missionsCompleted = (state.missions ?? []).filter((m) => m.status === 'completed').length
  const hasLateNightActivity = completed.some(
    (a) => a.completedAt && new Date(a.completedAt).getHours() >= 23,
  )

  return {
    xpTotal: state.progress.xpTotal,
    level: state.progress.level,
    streakDays: state.progress.streakDays,
    activitiesCompleted: completed.length,
    hoursStudied: completed.reduce((sum, a) => sum + a.durationMin / 60, 0),
    subjectsWorked: new Set(completed.map((a) => a.subjectId)).size,
    missionsCompleted,
    hasLateNightActivity: hasLateNightActivity ? 1 : 0,
  }
}

function meetsRequirement(template, metrics) {
  const levelOk = template.levelRequired == null || metrics.level >= template.levelRequired
  const xpOk = template.xpRequired == null || metrics.xpTotal >= template.xpRequired
  return levelOk && xpOk
}

/** Afegeix a `ownedUnlockIds` qualsevol desbloqueig AUTOMÀTIC que ja
 * compleixi el requisit i encara no s'hagi obtingut. Els comprables mai
 * s'afegeixen sols aquí — necessiten `purchaseUnlock`. Retorna la mateixa
 * referència si no hi ha cap canvi (permet un check barat de "no-op"). */
export function evaluateAutomaticUnlocks(unlockTemplates, metrics, ownedUnlockIds) {
  const toAdd = unlockTemplates
    .filter((u) => u.unlockType === 'automatic')
    .filter((u) => !ownedUnlockIds.includes(u.id))
    .filter((u) => meetsRequirement(u, metrics))
    .map((u) => u.id)

  if (toAdd.length === 0) return ownedUnlockIds
  return [...ownedUnlockIds, ...toAdd]
}

/** Igual que `evaluateAutomaticUnlocks` però per als assoliments (sempre
 * automàtics, es comparen amb `metrics[metric] >= target`). */
export function evaluateAchievements(achievementTemplates, metrics, ownedAchievementIds) {
  const toAdd = achievementTemplates
    .filter((a) => !ownedAchievementIds.includes(a.id))
    .filter((a) => (metrics[a.metric] ?? 0) >= a.target)
    .map((a) => a.id)

  if (toAdd.length === 0) return ownedAchievementIds
  return [...ownedAchievementIds, ...toAdd]
}

/**
 * Intenta comprar un desbloqueig comprable. Retorna `null` si no es pot
 * (no existeix, no és comprable, ja és propietat, no elegible encara, o
 * XP disponible insuficient) — el reducer no fa cap canvi en aquest cas.
 * Si té èxit, retorna `{ ownedUnlockIds, xpAvailable }` ja actualitzats.
 */
export function purchaseUnlock(unlockTemplates, unlockId, metrics, ownedUnlockIds, xpAvailable) {
  const template = unlockTemplates.find((u) => u.id === unlockId)
  if (!template || template.unlockType !== 'purchasable') return null
  if (ownedUnlockIds.includes(unlockId)) return null
  if (!meetsRequirement(template, metrics)) return null
  if (xpAvailable < template.cost) return null

  return {
    ownedUnlockIds: [...ownedUnlockIds, unlockId],
    xpAvailable: xpAvailable - template.cost,
  }
}

/** Vista "resolta" d'un desbloqueig per a la UI: si és propietat, si és
 * elegible (requisit complert) i, si és comprable i elegible però encara
 * no comprat, si l'usuari es pot permetre el cost ara mateix. */
export function getUnlockDisplay(template, metrics, ownedUnlockIds, xpAvailable) {
  const owned = ownedUnlockIds.includes(template.id)
  const eligible = meetsRequirement(template, metrics)
  const canPurchase = !owned && template.unlockType === 'purchasable' && eligible && xpAvailable >= template.cost

  return { ...template, owned, eligible, canPurchase }
}
