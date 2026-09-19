// Funciones puras para trabajar con el calendario mensual/semanal.
// Sin dependencias externas: solo Date nativo de JS.

import { defaultSubjectsCatalog } from '../data/subjectsCatalog'

export const WEEKDAY_LABELS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

/** Etiqueta curta (Dl..Dg) del dia de la setmana real de `date` —
 * independent de la posició que ocupi dins d'un array de `getWeekDates`
 * (que pot començar en diumenge). Mai assumir que l'índex 0 és dilluns. */
export function getWeekdayLabel(date) {
  return WEEKDAY_LABELS[(date.getDay() + 6) % 7]
}

// Codis de dia (DL..DG) tal com els fa servir `weeklyActivity` a AppContext,
// en el mateix ordre que WEEKDAY_LABELS (dilluns primer).
const DAY_CODES = ['DL', 'DT', 'DC', 'DJ', 'DV', 'DS', 'DG']

const CUSTOM_SUBJECT_COLOR = 'var(--accent-purple-light)'
const FALLBACK_SUBJECT = { name: 'Matèria', color: 'var(--text-muted)' }

/**
 * Combina el catàleg fix de matèries amb les personalitzades de l'usuari
 * en un únic diccionari `id -> { name, color }`, perquè els components del
 * Calendari puguin resoldre el color/nom de qualsevol activitat sense
 * dependre de si aquella matèria està "seleccionada" ara mateix.
 */
export function buildSubjectsById(customSubjects) {
  const byId = {}
  for (const s of defaultSubjectsCatalog) byId[s.id] = { name: s.name, color: s.color }
  for (const s of customSubjects) byId[s.id] = { name: s.name, color: CUSTOM_SUBJECT_COLOR }
  return byId
}

/** Resol un `subjectId` amb un valor per defecte segur si no es troba
 * (p. ex. una matèria personalitzada que l'usuari ha eliminat). */
export function getSubjectInfo(subjectsById, subjectId) {
  return subjectsById[subjectId] ?? FALLBACK_SUBJECT
}

/** Format llegible d'una durada en minuts ("1h 30min", "45 min", "2h"). */
export function formatDuration(durationMin) {
  if (!durationMin || durationMin <= 0) return 'Límit'
  const hours = Math.floor(durationMin / 60)
  const minutes = durationMin % 60
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}

const MONTH_LABELS = [
  'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
]

export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Clau (dateKey) del dia real d'avui, segons el rellotge del sistema —
 * font única de veritat per a "avui" a tota l'app (activitats a Inici i
 * Calendari, dia seleccionat per defecte, càlculs "aquesta setmana"...).
 * Substitueix el `today.dateKey` fix que abans venia de `data/seedData.js`
 * (veure NOTES.md, "Sincronitzar el dia d'avui amb la data real") — les
 * missions ja feien servir `new Date()` des de sempre (`getRealTodayKey`
 * a `missionEngine.js`, que ara delega en aquesta mateixa funció). */
export function getTodayKey() {
  return toDateKey(new Date())
}

/** Any/mes (0-indexat) del mes real actual, en la mateixa forma que
 * `{ year, month }` que espera `getMonthMatrix` — per obrir el Calendari
 * mostrant sempre el mes real, mai un mes fix de mock. */
export function getCurrentCalendarMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() }
}

const WEEKDAY_FULL_LABELS_CA = [
  'DILLUNS', 'DIMARTS', 'DIMECRES', 'DIJOUS', 'DIVENDRES', 'DISSABTE', 'DIUMENGE',
]

/** Nom complet del dia de la setmana en català i en majúscules (p. ex.
 * "DILLUNS"), per a la capçalera d'Inici ("avui"). Independent de
 * `WEEKDAY_LABELS` (versió curta "Dl".."Dg") i de qualsevol array de
 * setmana — sempre el dia real de `date`. */
export function getWeekdayFullLabelCa(date) {
  return WEEKDAY_FULL_LABELS_CA[(date.getDay() + 6) % 7]
}

/** Etiqueta curta de data en català i en majúscules (p. ex. "9 JUN
 * 2026"), mateix format que abans tenia fixat `data/seedData.js`. */
export function getShortDateLabelCa(date) {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()].slice(0, 3).toUpperCase()} ${date.getFullYear()}`
}

export function getMonthLabel(year, month) {
  return `${MONTH_LABELS[month].toUpperCase()} ${year}`
}

/** Etiqueta "Mes Any" en català (p. ex. "Set 2026"), per a "Membre des de"
 * a Perfil — mateix format que tenia el valor fix de `data/seedData.js`,
 * ara calculat a partir d'un `dateKey` real (`settings.memberSinceDateKey`,
 * desat en completar l'Onboarding). */
export function formatMonthYearCa(dateKey) {
  const [y, m] = dateKey.split('-').map(Number)
  return `${MONTH_LABELS[m - 1].slice(0, 3)} ${y}`
}

/**
 * Devuelve un array de longitud múltiple de 7 representando la cuadrícula
 * del mes (semanas empezando en dilluns). Las celdas antes del día 1 son
 * `null` (huecos vacíos, sin número).
 */
export function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (firstDay.getDay() + 6) % 7 // Lunes=0 ... Domingo=6

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    cells.push({ day, dateKey: toDateKey(date) })
  }
  return cells
}

/**
 * Índex (0-6) del `date` donat dins la setmana, segons si la setmana
 * comença en dilluns ('monday', per defecte) o diumenge ('sunday') —
 * única font de veritat per als límits de setmana de tota l'app
 * (Calendari, resums setmanals, renovació de missions setmanals). Ve de
 * `settings.weekStartsOn` (Configuració → Estudi).
 */
function getWeekdayIndex(date, weekStartsOn) {
  const jsDay = date.getDay() // 0=diumenge..6=dissabte
  return weekStartsOn === 'sunday' ? jsDay : (jsDay + 6) % 7
}

/** Devuelve los 7 objetos Date de la semana que contiene dateKey, empezando
 * el día indicado por `weekStartsOn` ('monday' per defecte, o 'sunday'). */
export function getWeekDates(dateKey, weekStartsOn = 'monday') {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const idx = getWeekdayIndex(date, weekStartsOn)
  const start = new Date(date)
  start.setDate(date.getDate() - idx)

  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start)
    dd.setDate(start.getDate() + i)
    return dd
  })
}

export function getWeekRangeLabel(weekDates) {
  const first = weekDates[0]
  const last = weekDates[6]
  return `${first.getDate()}-${last.getDate()} ${MONTH_LABELS[last.getMonth()].slice(0, 3).toLowerCase()}`
}

export function getSelectedDayLabel(dateKey) {
  const [, m, d] = dateKey.split('-').map(Number)
  return `${d} ${MONTH_LABELS[m - 1]}`
}

/** Codi de dia (DL..DG) del `dateKey` donat, per casar-lo amb `weeklyActivity`. */
export function getDayCodeForDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekdayIndex = (date.getDay() + 6) % 7
  return DAY_CODES[weekdayIndex]
}

/** Cert si `dateKey` cau dins la mateixa setmana que `referenceDateKey`,
 * segons `weekStartsOn` (veure `getWeekDates`). */
export function isInWeek(dateKey, referenceDateKey, weekStartsOn = 'monday') {
  return getWeekDates(referenceDateKey, weekStartsOn).some((d) => toDateKey(d) === dateKey)
}

/** Reordena un array de 7 elements desats sempre en ordre DL..DG
 * (`state.weeklyActivity`) perquè es mostri començant pel dia triat a
 * `weekStartsOn` — només afecta la visualització (WeeklyBarChart a
 * Inici), mai com es desa internament (sempre indexat per dia de la
 * setmana via `getDayCodeForDateKey`, independent de la preferència). */
export function reorderWeekArray(items, weekStartsOn = 'monday') {
  if (weekStartsOn !== 'sunday' || items.length !== 7) return items
  return [items[6], ...items.slice(0, 6)]
}

/** Aplana `{ [dateKey]: Activity[] }` a un array pla d'activitats, cada
 * una amb el seu `dateKey` afegit. Compartit entre Calendari/Inici i el
 * motor de missions (src/utils/missionEngine.js). */
export function flattenActivities(activitiesByDate) {
  const flat = []
  for (const dateKey of Object.keys(activitiesByDate)) {
    for (const activity of activitiesByDate[dateKey]) {
      flat.push({ ...activity, dateKey })
    }
  }
  return flat
}

/**
 * Data+hora d'una activitat en format llegible i relatiu a avui
 * ("Avui 20:00", "Demà 09:00", "11 jun 10:00"), fent servir el mateix
 * patró que ja mostrava Inici abans que les tasques tinguessin dates reals.
 */
export function formatRelativeDateTime(dateKey, time, todayDateKey) {
  if (dateKey === todayDateKey) return `Avui ${time}`

  const [ty, tm, td] = todayDateKey.split('-').map(Number)
  const tomorrow = new Date(ty, tm - 1, td + 1)
  if (dateKey === toDateKey(tomorrow)) return `Demà ${time}`

  const [, m, d] = dateKey.split('-').map(Number)
  return `${d} ${MONTH_LABELS[m - 1].slice(0, 3).toLowerCase()} ${time}`
}
