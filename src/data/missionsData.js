// Diccionaris de presentació (etiquetes/colors) per al sistema de
// missions. Les missions en si ja no són dades fictícies: viuen a
// `state.missions` (AppContext), derivades del catàleg de plantilles
// (src/data/missionTemplates.js). Aquest fitxer només tradueix els valors
// interns ('easy', 'daily'...) a text/color per a la UI.

// Etiquetes traduïdes amb `t('difficulty.<key>')`/`t('missionType.<key>')`/
// `t('missions.filter.<id>')` als components — mai hardcoded aquí.
export const difficulties = {
  easy: { color: 'var(--accent-green)' },
  medium: { color: 'var(--accent-orange)' },
  hard: { color: 'var(--accent-red)' },
  epic: { color: 'var(--accent-purple-light)' },
}

export const missionTypes = {
  daily: { color: 'var(--accent-cyan)' },
  weekly: { color: 'var(--accent-purple-light)' },
  special: { color: 'var(--accent-orange)' },
  personal: { color: 'var(--accent-green)' },
}

export const filters = [{ id: 'totes' }, { id: 'daily' }, { id: 'weekly' }, { id: 'special' }, { id: 'personal' }]
