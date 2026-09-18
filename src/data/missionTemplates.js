// Catàleg fix de plantilles de missions. Les missions actives/disponibles
// de l'usuari SEMPRE deriven d'aquestes plantilles (veure
// src/utils/missionEngine.js) — mai es generen ad hoc.
//
// `metric` fa referència a una de les mètriques que sap calcular
// missionEngine.js a partir de les activitats completades:
// 'activitiesCompleted' | 'hoursStudied' | 'xpEarned' | 'subjectsWorked' |
// 'activeDays' | 'subjectActivity' (necessita `subjectId`).
// Els metrics manuals (l'usuari els actualitza a mà) es marquen amb el
// prefix "manual:" i no es calculen automàticament.

export const dailyMissionTemplates = [
  {
    templateId: 'daily-complete-2',
    title: 'Completa 2 activitats',
    description: 'Completa 2 activitats avui',
    difficulty: 'easy',
    trackingType: 'automatic',
    metric: 'activitiesCompleted',
    target: 2,
    unit: 'activitats',
    xpReward: 75,
  },
  {
    templateId: 'daily-complete-1',
    title: 'Completa 1 activitat',
    description: 'Completa 1 activitat avui',
    difficulty: 'easy',
    trackingType: 'automatic',
    metric: 'activitiesCompleted',
    target: 1,
    unit: 'activitats',
    xpReward: 50,
  },
  {
    templateId: 'daily-complete-3',
    title: 'Completa 3 activitats',
    description: 'Completa 3 activitats avui',
    difficulty: 'medium',
    trackingType: 'automatic',
    metric: 'activitiesCompleted',
    target: 3,
    unit: 'activitats',
    xpReward: 125,
  },
  {
    templateId: 'daily-study-1h',
    title: 'Estudia durant 1 hora',
    description: "Acumula 1 hora d'estudi avui",
    difficulty: 'easy',
    trackingType: 'automatic',
    metric: 'hoursStudied',
    target: 1,
    unit: 'hores',
    xpReward: 75,
  },
  {
    templateId: 'daily-subject',
    title: 'Treballa una matèria concreta',
    // La descripció final s'omple en generar-la, amb el nom real de la
    // matèria triada (veure missionEngine.instantiateMission).
    description: null,
    difficulty: 'medium',
    trackingType: 'automatic',
    metric: 'subjectActivity',
    target: 1,
    unit: 'activitats',
    xpReward: 100,
    needsSubject: true,
  },
]

export const weeklyMissionTemplates = [
  {
    templateId: 'weekly-complete-5',
    title: 'Completa 5 activitats',
    description: 'Completa 5 activitats aquesta setmana',
    difficulty: 'medium',
    trackingType: 'automatic',
    metric: 'activitiesCompleted',
    target: 5,
    unit: 'activitats',
    xpReward: 200,
  },
  {
    templateId: 'weekly-study-3h',
    title: 'Estudia 3 hores',
    description: "Acumula 3 hores d'estudi aquesta setmana",
    difficulty: 'medium',
    trackingType: 'automatic',
    metric: 'hoursStudied',
    target: 3,
    unit: 'hores',
    xpReward: 200,
  },
  {
    templateId: 'weekly-days-3',
    title: 'Treballa durant 3 dies diferents',
    description: 'Completa alguna activitat en 3 dies diferents aquesta setmana',
    difficulty: 'medium',
    trackingType: 'automatic',
    metric: 'activeDays',
    target: 3,
    unit: 'dies',
    xpReward: 250,
  },
  {
    templateId: 'weekly-complete-10',
    title: 'Completa 10 activitats',
    description: 'Completa 10 activitats aquesta setmana',
    difficulty: 'hard',
    trackingType: 'automatic',
    metric: 'activitiesCompleted',
    target: 10,
    unit: 'activitats',
    xpReward: 450,
  },
  {
    templateId: 'weekly-study-8h',
    title: 'Estudia 8 hores',
    description: "Acumula 8 hores d'estudi aquesta setmana",
    difficulty: 'hard',
    trackingType: 'automatic',
    metric: 'hoursStudied',
    target: 8,
    unit: 'hores',
    xpReward: 500,
  },
  {
    templateId: 'weekly-subjects-3',
    title: 'Completa activitats de 3 matèries diferents',
    description: 'Completa alguna activitat de 3 matèries diferents aquesta setmana',
    difficulty: 'hard',
    trackingType: 'automatic',
    metric: 'subjectsWorked',
    target: 3,
    unit: 'matèries',
    xpReward: 500,
  },
]

export const specialMissionTemplates = [
  {
    templateId: 'special-exercises-10',
    title: 'Resol 10 exercicis',
    description: "Resol 10 exercicis (poden ser fets fora de StudyQuest)",
    difficulty: 'medium',
    trackingType: 'manual',
    unit: 'exercicis',
    target: 10,
    xpReward: 200,
  },
  {
    templateId: 'special-pages-20',
    title: 'Llegeix 20 pàgines',
    description: 'Llegeix 20 pàgines de material acadèmic',
    difficulty: 'medium',
    trackingType: 'manual',
    unit: 'pàgines',
    target: 20,
    xpReward: 200,
  },
  {
    templateId: 'special-concepts-15',
    title: 'Repassa 15 conceptes',
    description: 'Repassa 15 conceptes clau',
    difficulty: 'medium',
    trackingType: 'manual',
    unit: 'conceptes',
    target: 15,
    xpReward: 225,
  },
  {
    templateId: 'special-exercises-25',
    title: 'Resol 25 exercicis',
    description: "Resol 25 exercicis (poden ser fets fora de StudyQuest)",
    difficulty: 'hard',
    trackingType: 'manual',
    unit: 'exercicis',
    target: 25,
    xpReward: 500,
  },
  {
    templateId: 'special-hybrid-activities-exercises',
    title: 'Completa 5 activitats i resol 10 exercicis',
    description: "Combina activitats de StudyQuest amb exercicis fets fora de l'app",
    difficulty: 'hard',
    trackingType: 'hybrid',
    xpReward: 650,
    conditions: [
      {
        conditionId: 'activities',
        label: 'Activitats completades',
        metric: 'activitiesCompleted',
        trackingType: 'automatic',
        target: 5,
        unit: 'activitats',
      },
      {
        conditionId: 'exercises',
        label: 'Exercicis resolts',
        metric: 'manual:exercises',
        trackingType: 'manual',
        target: 10,
        unit: 'exercicis',
      },
    ],
  },
  {
    templateId: 'special-hybrid-hours-pages',
    title: 'Estudia 5 hores i llegeix 30 pàgines',
    description: "Combina temps d'estudi amb lectura",
    difficulty: 'epic',
    trackingType: 'hybrid',
    xpReward: 1000,
    conditions: [
      {
        conditionId: 'hours',
        label: 'Hores estudiades',
        metric: 'hoursStudied',
        trackingType: 'automatic',
        target: 5,
        unit: 'hores',
      },
      {
        conditionId: 'pages',
        label: 'Pàgines llegides',
        metric: 'manual:pages',
        trackingType: 'manual',
        target: 30,
        unit: 'pàgines',
      },
    ],
  },
]

// Plantilles disponibles per crear missions personals. L'usuari tria una
// d'aquestes, un títol i una quantitat objectiu — la dificultat i l'XP es
// determinen automàticament (veure PERSONAL_MAGNITUDE_THRESHOLDS).
export const personalMissionTemplates = [
  { templateId: 'personal-activities', title: 'Completar activitats', trackingType: 'automatic', metric: 'activitiesCompleted', unit: 'activitats' },
  { templateId: 'personal-hours', title: 'Estudiar hores', trackingType: 'automatic', metric: 'hoursStudied', unit: 'hores' },
  { templateId: 'personal-exercises', title: 'Resoldre exercicis', trackingType: 'manual', metric: 'manual:exercises', unit: 'exercicis' },
  { templateId: 'personal-pages', title: 'Llegir pàgines', trackingType: 'manual', metric: 'manual:pages', unit: 'pàgines' },
  { templateId: 'personal-concepts', title: 'Repassar conceptes', trackingType: 'manual', metric: 'manual:concepts', unit: 'conceptes' },
]

// Llindars de magnitud per determinar automàticament la dificultat (i per
// tant l'XP, via PERSONAL_XP_BY_DIFFICULTY) d'una missió personal, segons
// la plantilla triada i la quantitat objectiu que defineix l'usuari.
// >llindar "hard" => 'epic'. Ajustables aquí sense tocar cap component.
export const PERSONAL_MAGNITUDE_THRESHOLDS = {
  'personal-activities': { easy: 2, medium: 5, hard: 10 },
  'personal-hours': { easy: 1, medium: 3, hard: 6 },
  'personal-exercises': { easy: 10, medium: 25, hard: 50 },
  'personal-pages': { easy: 20, medium: 50, hard: 100 },
  'personal-concepts': { easy: 10, medium: 25, hard: 50 },
}

export const PERSONAL_XP_BY_DIFFICULTY = {
  easy: 100,
  medium: 250,
  hard: 500,
  epic: 1000,
}

export const MAX_ACTIVE_PERSONAL_MISSIONS = 2
export const DAILY_MISSION_COUNT = 3
export const WEEKLY_MISSION_COUNT = 2
