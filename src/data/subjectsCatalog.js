// Catàleg fix de matèries predeterminades que StudyQuest ofereix a
// qualsevol usuari nou. És independent de les matèries que cada usuari
// tria o afegeix (veure `subjects` dins l'estat de AppContext), perquè es
// pugui ampliar aquesta llista en el futur sense tocar l'estat de ningú.
// L'usuari NOMÉS pot seleccionar-les, mai modificar-les.

const PALETTE = [
  'var(--accent-purple-light)',
  'var(--accent-cyan)',
  'var(--accent-green)',
  'var(--accent-orange)',
  'var(--accent-yellow)',
  'var(--accent-red)',
  'var(--accent-blue)',
]

const CATALOG_NAMES = [
  'Matemàtiques',
  'Física',
  'Química',
  'Biologia',
  'Català',
  'Castellà',
  'Anglès',
  'Història',
  'Geografia',
  'Filosofia',
  'Tecnologia',
  'Economia',
]

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const defaultSubjectsCatalog = CATALOG_NAMES.map((name, i) => ({
  id: slugify(name),
  name,
  color: PALETTE[i % PALETTE.length],
}))
