import './settings.css'

/**
 * Fila reutilitzable títol + descripció + control (toggle, badge, etc.).
 * `children` és el control que es mostra a la dreta.
 */
export default function SettingsRow({ title, description, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <span className="settings-row-title">{title}</span>
        {description && <span className="settings-row-description">{description}</span>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  )
}
