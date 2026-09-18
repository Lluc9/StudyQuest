// Datos ficticios (mock) usados como valores iniciales del estado global
// (ver src/context/AppContext.jsx). A partir de la fase de funcionalidades,
// estos valores solo se usan para poblar `localStorage` la primera vez que
// se carga la aplicación; a partir de ahí el estado real vive en el reducer.

export const user = {
  name: 'Usuari',
  // Encara no hi ha onboarding real que registri quan es va crear el
  // compte, així que es manté com a valor estàtic (demanat explícitament
  // per l'usuari) fins que aquesta pantalla existeixi.
  memberSince: 'Set 2025',
}

export const weeklyActivity = [
  { day: 'DL', hours: 6 },
  { day: 'DT', hours: 7.5 },
  { day: 'DC', hours: 3 },
  { day: 'DJ', hours: 7 },
  { day: 'DV', hours: 6.5 },
  { day: 'DS', hours: 1 },
  { day: 'DG', hours: 0 },
]

// Configuració estàtica dels objectius d'avui: cada un s'associa a una
// mètrica de `progress` (o derivada de `activities`) que AppContext
// recalcula cada vegada que canvia l'estat.
// `titleKey` es passa a `t()` amb `{ n: target }` (veure buildSelectors a
// AppContext.jsx) — el text final ve del sistema de traduccions, mai
// hardcoded aquí, perquè cada idioma el pugui mostrar correctament.
export const dailyGoalsConfig = [
  { id: 'g1', titleKey: 'home.goal.tasks', metric: 'tasksCompletedToday', target: 3, xp: 200 },
  { id: 'g2', titleKey: 'home.goal.xp', metric: 'xpGainedToday', target: 450, xp: 100 },
  { id: 'g3', titleKey: 'home.goal.hours', metric: 'hoursStudiedToday', target: 2, xp: 150 },
]

// Configuració estàtica dels objectius pendents (setmanals).
export const pendingGoalsConfig = [
  { id: 'pg1', titleKey: 'home.pendingGoal.sessions', metric: 'weeklySessions', target: 20 },
  { id: 'pg2', titleKey: 'home.pendingGoal.streak', metric: 'streakDays', target: 7 },
  { id: 'pg3', titleKey: 'home.pendingGoal.weeklyXp', metric: 'weeklyXP', target: 5000 },
]

// Valors inicials de progrés de l'usuari. `xpGainedToday` i
// `hoursStudiedToday` inclouen una mica d'activitat ja registrada avui
// (fora de les tasques visibles a "Tasques previstes"), igual que
// `weeklySessions` i `weeklyXP` inclouen activitat prèvia d'aquesta setmana.
//
// `level`/`xpCurrentLevel`/`xpNextLevel` NO es defineixen aquí: es deriven
// sempre de `xpTotal` amb `computeLevelInfo()` (src/utils/levelSystem.js),
// l'escala única de nivells de l'app — mai es guarden com a valors solts
// que es puguin desincronitzar.
export const initialProgress = {
  // 10.000 XP situa l'usuari inicial al voltant del nivell 13 (no al màxim),
  // per poder veure la progressió real cap als nivells 14 i 15.
  xpTotal: 10000,
  // XP disponible per gastar en desbloquejos comprables. Es fixa per sota
  // de `xpTotal` (simulant que l'usuari ja ha gastat XP en el passat) per
  // poder provar el sistema de compra des de zero.
  xpAvailable: 1500,
  streakDays: 5,
  streakTarget: 7,
  streakBoostedToday: false,
  xpGainedToday: 300,
  hoursStudiedToday: 1.3,
  weeklySessions: 14,
  weeklyXP: 3720,
}
