import './common.css'

/**
 * Barra de progreso horizontal simple.
 * `percent` se espera entre 0 y 100 (se recorta por seguridad).
 */
export default function ProgressBar({ percent, colorVar = 'var(--accent-purple-light)', height = 6 }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="progress-track" style={{ height }}>
      <div
        className="progress-fill"
        style={{ width: `${clamped}%`, background: colorVar }}
      />
    </div>
  )
}
