// Notificacions: distingeix sempre entre avisos INTERNS (toast dins de
// l'app — sempre funcionen, no calen permisos) i notificacions REALS del
// navegador (Notification API — requereixen permís, i només funcionen
// mentre la pestanya de StudyQuest estigui oberta; no hi ha backend ni
// infraestructura de push, així que no es pot garantir res amb la
// pestanya/navegador tancats — limitació acceptada i documentada a
// NOTES.md).

/** Cert si el navegador suporta la Notification API (evita crides que
 * trenquessin en navegadors/entorns sense suport). */
export function isBrowserNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  if (!isBrowserNotificationSupported()) return 'unsupported'
  return Notification.permission
}

/** Demana permís només si encara no s'ha demanat ni denegat abans — mai
 * de manera repetitiva/molesta. Retorna el permís resultant. */
export async function requestNotificationPermissionIfNeeded() {
  if (!isBrowserNotificationSupported()) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

/** Envia una notificació real del navegador si hi ha permís concedit;
 * si no (denegat, no suportat, o encara no demanat), no fa res — el
 * cridant ha de mostrar un toast intern com a alternativa sempre visible. */
export function sendBrowserNotification(title, body) {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') return false
  try {
    new Notification(title, { body, icon: undefined })
    return true
  } catch {
    return false
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

export function getTodayDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Clau ISO de la setmana (any-Wnn) del `date` donat, per no repetir el
 * resum setmanal més d'un cop dins de la mateixa setmana. */
export function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((d - firstThursday) / DAY_MS - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** Cert si, ara mateix, toca avisar de manteniment de ratxa: l'hora
 * configurada ja ha passat, la ratxa d'avui encara no s'ha assolit, i no
 * s'ha avisat ja avui (dedupe via `lastStreakReminderDateKey`). */
export function shouldSendStreakReminder(notifications, progress, now = new Date()) {
  if (!notifications.streakReminder) return false
  if (progress.streakBoostedToday) return false
  const todayKey = getTodayDateKey(now)
  if (notifications.lastStreakReminderDateKey === todayKey) return false
  const [h, m] = (notifications.reminderTime ?? '19:00').split(':').map(Number)
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  return now >= target
}

/** Cert si, ara mateix, toca enviar el resum setmanal: és diumenge i
 * encara no s'ha enviat aquesta setmana (dedupe via
 * `lastWeeklySummaryWeekKey`, clau ISO de setmana). */
export function shouldSendWeeklySummary(notifications, now = new Date()) {
  if (!notifications.weeklySummary) return false
  if (now.getDay() !== 0) return false
  return notifications.lastWeeklySummaryWeekKey !== getWeekKey(now)
}
