// Escala única i definitiva de nivells de StudyQuest. Font única de
// veritat per a tota l'aplicació (abans convivien dues escales
// diferents: la de 5.000 XP fixos per nivell d'Inici/Sidebar i la taula
// de 10 nivells de Recompenses — ja no).
//
// `xpRequired` és XP ACUMULADA (llindar absolut), no XP per pujar d'aquell
// nivell concret.
export const LEVELS = [
  { number: 1, name: 'Iniciat', xpRequired: 0, color: 'var(--text-muted)' },
  { number: 2, name: 'Aprenent', xpRequired: 250, color: 'var(--accent-green)' },
  { number: 3, name: 'Estudiant', xpRequired: 500, color: 'var(--accent-green)' },
  { number: 4, name: 'Dedicat', xpRequired: 900, color: 'var(--accent-cyan)' },
  { number: 5, name: 'Enfocat', xpRequired: 1400, color: 'var(--accent-cyan)' },
  { number: 6, name: 'Constant', xpRequired: 2000, color: 'var(--accent-cyan)' },
  { number: 7, name: 'Expert', xpRequired: 2700, color: 'var(--accent-purple-light)' },
  { number: 8, name: 'Savi', xpRequired: 3500, color: 'var(--accent-purple-light)' },
  { number: 9, name: 'Erudit', xpRequired: 4400, color: 'var(--accent-purple-light)' },
  { number: 10, name: 'Virtuós', xpRequired: 5400, color: 'var(--accent-orange)' },
  { number: 11, name: 'Mestre', xpRequired: 6500, color: 'var(--accent-orange)' },
  { number: 12, name: 'Gran Estudiant', xpRequired: 7700, color: 'var(--accent-orange)' },
  { number: 13, name: 'Eminent', xpRequired: 9000, color: 'var(--accent-red)' },
  { number: 14, name: 'Llegenda', xpRequired: 10400, color: 'var(--accent-red)' },
  { number: 15, name: 'Llegenda Suprema', xpRequired: 12000, color: 'var(--accent-yellow)' },
]

/**
 * Deriva nivell + progrés dins del nivell a partir de l'XP total
 * acumulada. `xpCurrentLevel`/`xpNextLevel` es mantenen com "XP dins
 * d'aquest nivell" / "mida de la banda d'aquest nivell" (no llindars
 * absoluts), perquè els components existents (LevelHeader, DonutProgress,
 * ProgressBar d'Inici...) ja esperaven aquesta forma des de l'època del
 * sistema pla de 5.000 XP/nivell — així no cal tocar-los.
 */
export function computeLevelInfo(xpTotal) {
  let index = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xpTotal >= LEVELS[i].xpRequired) index = i
    else break
  }
  const current = LEVELS[index]
  const next = LEVELS[index + 1]
  const xpCurrentLevel = xpTotal - current.xpRequired
  const xpNextLevel = next ? next.xpRequired - current.xpRequired : Math.max(xpCurrentLevel, 1)
  return { level: current.number, xpCurrentLevel, xpNextLevel }
}

export function getLevelName(levelNumber) {
  return LEVELS.find((l) => l.number === levelNumber)?.name ?? LEVELS[0].name
}
