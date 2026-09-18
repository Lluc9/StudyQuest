import './common.css'

/**
 * Contenedor visual genérico ("panel") usado por casi todos los bloques
 * del dashboard. Puramente presentacional.
 */
export default function Card({ title, icon, headerRight, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || headerRight) && (
        <header className="card-header">
          <div className="card-header-title">
            {icon}
            {title && <h2>{title}</h2>}
          </div>
          {headerRight && <div className="card-header-right">{headerRight}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  )
}
