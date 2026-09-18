import './rewards.css'

export default function UnlockFilters({ categories, activeCategory, onSelect }) {
  return (
    <div className="reward-filters">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`reward-filter-btn${category.id === activeCategory ? ' is-active' : ''}`}
          onClick={() => onSelect(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
