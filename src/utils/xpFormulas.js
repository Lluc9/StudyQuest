// Càlcul automàtic de l'XP d'una activitat del Calendari. L'usuari mai
// introdueix l'XP a mà: es deriva del tipus d'activitat i la seva durada.
//
// Fórmula (provisional, pensada per ajustar-se fàcilment): cada tipus té
// una taxa base d'XP per hora; es multiplica per la durada real i
// s'arrodoneix als 5 XP més propers perquè els valors quedin nets.
export const BASE_XP_PER_HOUR_BY_TYPE = {
  estudi: 60,
  exercicis: 70,
  deures: 60,
  practica: 80,
  treball: 90,
  presentacio: 100,
  examen: 150,
}

export function calculateActivityXp(type, durationMin) {
  const baseXpPerHour = BASE_XP_PER_HOUR_BY_TYPE[type] ?? BASE_XP_PER_HOUR_BY_TYPE.estudi
  const rawXp = (baseXpPerHour * durationMin) / 60
  return Math.max(5, Math.round(rawXp / 5) * 5)
}
