import './common.css'

/**
 * Grup de botons d'una sola selecció. `options` és un array de
 * { value, label, Icon? }. `Icon` és opcional (component d'icona).
 */
export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="segmented-control">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`segmented-control-btn${option.value === value ? ' is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.Icon && <option.Icon width={14} height={14} />}
          {option.label}
        </button>
      ))}
    </div>
  )
}
