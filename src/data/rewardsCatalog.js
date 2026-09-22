// Catàleg de desbloquejos i assoliments de Recompenses. Purament dades —
// la lògica d'elegibilitat/compra viu a src/utils/rewardsEngine.js.

// `unlockType`:
//  - 'automatic': s'obté sol en complir el requisit de nivell/XP, sense cost.
//  - 'purchasable': cal comprar-lo amb `xpAvailable` un cop s'és elegible.
// `levelRequired`/`xpRequired` són el requisit per ser elegible (poden
// combinar-se; tots els que estiguin presents s'han de complir).
export const unlockTemplates = [
  {
    id: 'u1',
    title: 'Tema Fosc Pro',
    description: 'Paleta de colors exclusiva per a la interfície',
    category: 'cosmetic',
    icon: 'shield',
    unlockType: 'purchasable',
    levelRequired: 3,
    xpRequired: 500,
    cost: 250,
  },
  // `u2` ("Marc d'Avatar: Flama") i `u6` ("...: Cristall") vivien aquí.
  // S'han mogut al slot `marc` del Personatge (`characterCatalog.js`,
  // `m1`/`m2`): eren conceptualment el mateix sistema i allà es veuen
  // aplicats de debò. Els ids `u2`/`u6` NO es reutilitzen mai per a res
  // més — hi ha estats desats que encara els porten, i `AppProvider` els
  // migra a `m1`/`m2`.
  {
    id: 'u3',
    title: 'Mode Concentració+',
    description: 'Temporitzador Pomodoro avançat amb música',
    category: 'funcio',
    icon: 'zap',
    unlockType: 'automatic',
    levelRequired: 6,
    xpRequired: 2000,
  },
  {
    id: 'u4',
    title: 'Estadístiques Avançades',
    description: 'Gràfics detallats de productivitat',
    category: 'funcio',
    icon: 'star',
    unlockType: 'automatic',
    levelRequired: 7,
    xpRequired: 2700,
  },
  {
    id: 'u5',
    title: 'Titol: Gran Mestre',
    description: 'Títol especial visible al teu perfil',
    category: 'titol',
    icon: 'trophy',
    unlockType: 'purchasable',
    levelRequired: 8,
    xpRequired: 3500,
    cost: 600,
  },
  {
    id: 'u7',
    title: 'Mode Arena',
    description: 'Reptes cronometrats contra altres estudiants',
    category: 'funcio',
    icon: 'sword',
    unlockType: 'automatic',
    levelRequired: 10,
    xpRequired: 5400,
  },
  {
    id: 'u8',
    title: "Llegenda de l'Acadèmia",
    description: 'Insígnia permanent de llegenda',
    category: 'insignia',
    icon: 'trophy',
    unlockType: 'purchasable',
    levelRequired: 14,
    xpRequired: 10400,
    cost: 1000,
  },
]

// `metric` fa referència a una clau del "lifetime metrics snapshot" que
// calcula rewardsEngine.computeLifetimeMetrics() (activitatsCompleted,
// hoursStudied, subjectsWorked, streakDays, missionsCompleted, xpTotal,
// hasLateNightActivity). Un assoliment s'obté quan
// `metrics[metric] >= target`. Sempre automàtics, mai comprables.
export const achievementTemplates = [
  {
    id: 'a1',
    title: 'Primera Sang',
    description: 'Completa la teva primera activitat',
    icon: 'sword',
    metric: 'activitiesCompleted',
    target: 1,
  },
  {
    id: 'a2',
    title: 'Imparable',
    description: 'Ratxa de 7 dies consecutius',
    icon: 'flame',
    metric: 'streakDays',
    target: 7,
  },
  {
    id: 'a3',
    title: 'Nocturn',
    description: 'Completa una activitat després de les 23:00',
    icon: 'moon',
    metric: 'hasLateNightActivity',
    target: 1,
  },
  {
    id: 'a4',
    title: 'Polímata',
    description: 'Completa activitats de 5 matèries diferents',
    icon: 'books',
    metric: 'subjectsWorked',
    target: 5,
  },
  {
    id: 'a5',
    title: 'Centurió',
    description: "Acumula 100 hores d'estudi",
    icon: 'building',
    metric: 'hoursStudied',
    target: 100,
  },
  {
    id: 'a6',
    title: 'Primera Missió',
    description: 'Completa la teva primera missió',
    icon: 'zap',
    metric: 'missionsCompleted',
    target: 1,
  },
  {
    id: 'a7',
    title: 'Estratega',
    description: 'Completa 5 missions',
    icon: 'sun',
    metric: 'missionsCompleted',
    target: 5,
  },
  {
    id: 'a8',
    title: 'Erudit',
    description: 'Acumula 8.000 XP totals',
    icon: 'crown',
    metric: 'xpTotal',
    target: 8000,
  },
]
