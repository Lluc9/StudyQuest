// Capa d'accés a localStorage, aïllada de la resta de l'app perquè es
// pugui substituir per una API real en el futur sense tocar components.

const STORAGE_KEY = 'studyquest_state_v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage no disponible (mode privat, quota plena, etc.):
    // l'app continua funcionant sense persistència.
  }
}
