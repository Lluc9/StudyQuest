// Motor de Perfil: funcions pures que deriven tot el que mostra la
// pantalla Perfil (estadístiques, gràfics, distribució per matèria,
// objectius assolits, activitat recent) a partir de l'estat global
// existent (activities, missions, rewards, eventLog). Sense dependències
// de React — es crida des de `buildSelectors` a AppContext.jsx. Cap
// d'aquestes funcions inventa dades: si no hi ha prou informació real,
// retornen llistes buides o mantenen el darrer valor conegut (mai un
// valor fictici).

import { flattenActivities, getSubjectInfo } from './calendarUtils'

const MONTH_ABBR = ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des']

function round1(value) {
  return Math.round(value * 10) / 10
}

/** Últims 6 mesos (any/mes), del més antic al més recent, acabant al mes
 * real actual — mateix rellotge real que ja fan servir missions/rewards. */
function lastSixMonths(referenceDate) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - (5 - i), 1)
    return { year: d.getFullYear(), monthIndex: d.getMonth() }
  })
}

// Afegeix un esdeveniment al registre global (`state.eventLog`), amb id i
// data (rellotge real) generats aquí. Es retalla a `maxEntries` perquè no
// creixi sense límit a localStorage — es descarten sempre els més antics.
export function pushEvent(eventLog, entry, maxEntries = 60) {
  const next = [
    ...eventLog,
    {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      ...entry,
    },
  ]
  return next.length > maxEntries ? next.slice(next.length - maxEntries) : next
}

/** Hores d'estudi reals per mes (últims 6 mesos), sumant la durada de les
 * activitats completades agrupades pel mes del seu `completedAt` real. */
export function computeMonthlyStudyHours(activitiesByDate, referenceDate = new Date()) {
  const months = lastSixMonths(referenceDate)
  const totals = months.map(() => 0)

  for (const a of flattenActivities(activitiesByDate)) {
    if (!a.completed || !a.completedAt) continue
    const d = new Date(a.completedAt)
    const idx = months.findIndex((m) => m.year === d.getFullYear() && m.monthIndex === d.getMonth())
    if (idx !== -1) totals[idx] += a.durationMin / 60
  }

  return months.map((m, i) => ({ day: MONTH_ABBR[m.monthIndex], hours: round1(totals[i]) }))
}

/** Tendència real de l'XP total acumulat (últims 6 mesos). Reconstrueix
 * cada mes a partir de l'últim `xpTotalAfter` registrat a l'`eventLog`
 * fins al final d'aquell mes; el mes actual sempre mostra el `xpTotal`
 * en viu (mai un valor de log potencialment desactualitzat). Si encara
 * no hi ha cap esdeveniment registrat (usuari nou), es manté pla al
 * valor inicial conegut en lloc d'inventar una evolució. */
export function computeXpTrend(eventLog, currentXpTotal, referenceDate = new Date()) {
  const snapshots = eventLog
    .filter((e) => typeof e.xpTotalAfter === 'number')
    .map((e) => ({ date: new Date(e.date), xpTotal: e.xpTotalAfter }))
    .sort((a, b) => a.date - b.date)

  const months = lastSixMonths(referenceDate)
  const fallbackBaseline = snapshots.length > 0 ? snapshots[0].xpTotal : currentXpTotal

  return months.map(({ year, monthIndex }, i) => {
    const isCurrentMonth = i === months.length - 1
    if (isCurrentMonth) return { month: MONTH_ABBR[monthIndex], xp: currentXpTotal }

    const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)
    let value = fallbackBaseline
    for (const s of snapshots) {
      if (s.date <= monthEnd) value = s.xpTotal
      else break
    }
    return { month: MONTH_ABBR[monthIndex], xp: value }
  })
}

/** Distribució real d'hores per matèria de l'usuari, a partir de les
 * activitats completades (mai les antigues categories fixes). Ordenada
 * de més a menys hores; si hi ha més de 5 matèries amb hores, les
 * restants s'agrupen sota "Altres" per no perdre coherència visual. */
export function computeSubjectDistribution(activitiesByDate, subjectsById, topN = 5) {
  const completed = flattenActivities(activitiesByDate).filter((a) => a.completed)
  const hoursBySubject = new Map()
  for (const a of completed) {
    const hours = a.durationMin / 60
    hoursBySubject.set(a.subjectId, (hoursBySubject.get(a.subjectId) ?? 0) + hours)
  }

  const totalHours = [...hoursBySubject.values()].reduce((sum, h) => sum + h, 0)
  if (totalHours === 0) return []

  const rows = [...hoursBySubject.entries()]
    .map(([subjectId, hours]) => {
      const info = getSubjectInfo(subjectsById, subjectId)
      return { id: subjectId, label: info.name, color: info.color, hours: round1(hours) }
    })
    .sort((a, b) => b.hours - a.hours)

  const top = rows.slice(0, topN)
  const rest = rows.slice(topN)
  if (rest.length > 0) {
    top.push({
      id: 'altres',
      label: 'Altres',
      color: 'var(--text-muted)',
      hours: round1(rest.reduce((sum, r) => sum + r.hours, 0)),
    })
  }

  return top.map((r) => ({ ...r, percent: Math.round((r.hours / totalHours) * 100) }))
}

function formatFullDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`
}

function formatRelativeReal(iso, labels, now = new Date()) {
  const d = new Date(iso)
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(d, now)) return labels.today
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, yesterday)) return labels.yesterday
  return d.getFullYear() === now.getFullYear()
    ? `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`
    : `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`
}

/** Últims assoliments reals desbloquejats (sistema de Recompenses), amb
 * la data en què `eventLog` va registrar el desbloqueig. Un assoliment ja
 * obtingut d'una càrrega anterior a aquest sistema (sense esdeveniment
 * registrat) es mostra igualment però sense data, mai amb una inventada. */
export function computeAchievedGoals(achievementTemplates, ownedAchievementIds, eventLog, limit = 6) {
  const dateByAchievementId = new Map()
  for (const e of eventLog) {
    if (e.type === 'assoliment' && e.refId) dateByAchievementId.set(e.refId, e.date)
  }

  return achievementTemplates
    .filter((t) => ownedAchievementIds.includes(t.id))
    .map((t) => {
      const iso = dateByAchievementId.get(t.id) ?? null
      return { id: t.id, title: t.title, date: iso ? formatFullDate(iso) : null, sortKey: iso ?? '' }
    })
    .sort((a, b) => (a.sortKey < b.sortKey ? 1 : a.sortKey > b.sortKey ? -1 : 0))
    .slice(0, limit)
    .map(({ sortKey, ...rest }) => rest)
}

/** Historial cronològic real dels últims esdeveniments importants
 * (activitat completada, missió completada, ratxa, nivell, assoliment,
 * desbloqueig). Descendent per data; l'esdeveniment intern 'baseline'
 * (punt d'ancoratge de l'XP en el moment en què va començar a
 * registrar-se l'historial) mai es mostra aquí. */
export function computeRecentActivity(eventLog, limit = 6, labels = { today: 'Avui', yesterday: 'Ahir' }) {
  return eventLog
    .filter((e) => e.type !== 'baseline')
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
    .map((e) => ({ id: e.id, type: e.type, title: e.title, time: formatRelativeReal(e.date, labels), xp: e.xp ?? null }))
}
