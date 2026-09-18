// Opcions fixes del formulari "Nova activitat" del Calendari. Separades
// dels components perquè es puguin ajustar sense tocar la UI.

// La durada es tria d'una llista fixa (no es pot escriure lliurement) per
// mantenir el càlcul d'XP determinista i les dades netes.
export const activityDurationOptions = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 h' },
  { value: 90, label: '1 h 30 min' },
  { value: 120, label: '2 h' },
  { value: 180, label: '3 h' },
]

// Etiquetes traduïdes amb `t('activityType.<id>')` als components que les
// mostren (mai hardcoded aquí).
export const activityTypes = [
  { id: 'estudi' },
  { id: 'exercicis' },
  { id: 'deures' },
  { id: 'examen' },
  { id: 'practica' },
  { id: 'treball' },
  { id: 'presentacio' },
]
