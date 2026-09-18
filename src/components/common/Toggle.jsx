import './common.css'

/**
 * Interruptor on/off simple. Purament d'estat local: el component pare
 * decideix què fer amb el nou valor via `onChange`.
 */
export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle-switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch-knob" />
    </button>
  )
}
