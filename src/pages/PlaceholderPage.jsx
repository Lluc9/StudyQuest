import './PlaceholderPage.css'

/**
 * Pantalla temporal para las secciones que todavía no se han
 * desarrollado (Calendari, Missions, Recompenses, Perfil).
 * Se sustituirá progresivamente en próximas fases.
 */
export default function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>Aquesta secció encara no s'ha implementat. Properament disponible.</p>
    </div>
  )
}
