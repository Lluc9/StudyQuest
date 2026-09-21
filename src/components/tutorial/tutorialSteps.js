// Recorregut del Tutorial inicial (veure NOTES.md, "Tutorial inicial") —
// font única d'aquests 9 passos, compartida entre `TutorialOverlay.jsx`
// (que els recorre) i qualsevol pantalla que necessiti saber "estic sent
// ressaltada ara mateix?" (MissionsPage/RewardsPage, per obrir la pestanya
// o el filtre correcte abans que el pas es faci visible).
//
// `target` és el valor de l'atribut `data-tutorial` de l'element a
// ressaltar — mai una classe CSS, que podria canviar. `type: 'active'`
// vol dir que el pas avança sol quan `TutorialOverlay` detecta l'acció
// real (mai amb el botó "Endavant", que en aquests passos no es mostra).
// `section` (opcional) és la secció de Configuració a forçar quan
// `screen` és `'configuracio'` (id de `SettingsSidebar.jsx`) — mateix
// mecanisme que `screen`, però per al segon nivell de navegació.
export const TUTORIAL_STEPS = [
  {
    id: 'today-goal',
    screen: 'inici',
    target: 'tutorial-daily-goal',
    type: 'explain',
    titleKey: 'tutorial.step.todayGoal.title',
    bodyKey: 'tutorial.step.todayGoal.body',
  },
  {
    id: 'upcoming-tasks',
    screen: 'inici',
    target: 'tutorial-upcoming-tasks',
    type: 'explain',
    titleKey: 'tutorial.step.upcomingTasks.title',
    bodyKey: 'tutorial.step.upcomingTasks.body',
  },
  {
    id: 'new-activity',
    screen: 'calendari',
    target: 'tutorial-new-activity-btn',
    type: 'active',
    titleKey: 'tutorial.step.newActivity.title',
    bodyKey: 'tutorial.step.newActivity.body',
  },
  {
    id: 'complete-task',
    screen: 'inici',
    target: 'tutorial-task-checkbox',
    type: 'active',
    titleKey: 'tutorial.step.completeTask.title',
    bodyKey: 'tutorial.step.completeTask.body',
  },
  {
    id: 'start-mission',
    screen: 'missions',
    target: 'tutorial-mission-card',
    type: 'active',
    titleKey: 'tutorial.step.startMission.title',
    bodyKey: 'tutorial.step.startMission.body',
  },
  {
    id: 'xp-block',
    screen: 'recompenses',
    target: 'tutorial-xp-block',
    type: 'explain',
    titleKey: 'tutorial.step.xpBlock.title',
    bodyKey: 'tutorial.step.xpBlock.body',
  },
  {
    id: 'unlock-card',
    screen: 'recompenses',
    target: 'tutorial-unlock-card',
    type: 'explain',
    titleKey: 'tutorial.step.unlockCard.title',
    bodyKey: 'tutorial.step.unlockCard.body',
  },
  {
    id: 'profile-stats',
    screen: 'perfil',
    target: 'tutorial-profile-stats',
    type: 'explain',
    titleKey: 'tutorial.step.profileStats.title',
    bodyKey: 'tutorial.step.profileStats.body',
  },
  {
    id: 'appearance',
    screen: 'configuracio',
    section: 'aparenca',
    target: 'tutorial-appearance-colors',
    type: 'explain',
    titleKey: 'tutorial.step.appearance.title',
    bodyKey: 'tutorial.step.appearance.body',
  },
]

/** Id del pas actualment actiu (o `null` si el tutorial ja s'ha acabat o
 * s'ha saltat) — usat per pantalles que necessiten reaccionar-hi sense
 * muntar tot `TutorialOverlay` (p. ex. forçar una pestanya/filtre concret
 * abans que el pas sigui visible). */
export function getTutorialStepId(settings) {
  if (!settings || settings.tutorialComplete) return null
  const index = Math.min(Math.max(settings.tutorialStepIndex ?? 0, 0), TUTORIAL_STEPS.length - 1)
  return TUTORIAL_STEPS[index]?.id ?? null
}
