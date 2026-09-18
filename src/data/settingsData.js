// Dades de Configuració que continuen sent estàtiques (opcions de
// formulari). `accountInfo` ha desaparegut: nom d'usuari i idioma ara
// viuen a `state.settings` (AppContext) — veure AccountSettings.jsx.
// Els noms de cada color d'accent es tradueixen amb `t('settings.
// appearance.accent.<id>')`, per això aquí només hi ha `id`/`color`.

export const languageOptions = [
  { value: 'ca', label: 'Català' },
  { value: 'es', label: 'Castellà' },
  { value: 'en', label: 'English' },
]

export const accentColors = [
  { id: 'violeta', color: 'var(--accent-purple)' },
  { id: 'cian', color: 'var(--accent-cyan)' },
  { id: 'verd', color: 'var(--accent-green)' },
  { id: 'taronja', color: 'var(--accent-orange)' },
  { id: 'vermell', color: 'var(--accent-red)' },
  { id: 'blau', color: 'var(--accent-blue)' },
]

// "min" és igual en català/castellà/anglès — no cal traduir-ho.
export const pomodoroSessionOptions = [15, 20, 25, 30, 45, 60].map((v) => ({ value: v, label: `${v} min` }))
export const pomodoroBreakOptions = [5, 10, 15, 20].map((v) => ({ value: v, label: `${v} min` }))
export const dailyTaskGoalOptions = [1, 2, 3, 4, 5, 6, 8].map((v) => ({ value: v, label: String(v) }))
// Valors interns neutres (`monday`/`sunday`, coincidint amb
// `settings.weekStartsOn`) — l'etiqueta es tradueix amb
// `t('settings.study.weekStart.<value>')` al component.
export const weekStartOptions = [{ value: 'monday' }, { value: 'sunday' }]
