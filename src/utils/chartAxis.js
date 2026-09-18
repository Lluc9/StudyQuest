// Calcula els valors "arrodonits" de l'eix vertical d'un gràfic
// (5 valors, de dalt a baix), seguint l'estil del disseny de Figma
// (p. ex. 60/45/30/15/0 en lloc del màxim exacte de les dades, 55).

const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]

export function getAxisSteps(rawMax, count = 4) {
  const safeMax = Math.max(rawMax, 1)
  const rawStep = safeMax / count
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude
  const niceNormalized = NICE_STEPS.find((n) => n >= normalized) ?? 10
  const step = niceNormalized * magnitude
  const niceMax = step * count

  return {
    niceMax,
    labels: Array.from({ length: count + 1 }, (_, i) => Math.round(niceMax - i * step)),
  }
}
