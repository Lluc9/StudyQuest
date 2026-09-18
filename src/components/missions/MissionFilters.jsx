import { IconFilter } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './missions.css'

export default function MissionFilters({ filters, counts, activeFilter, onSelect }) {
  const { t } = useApp()
  return (
    <div className="mission-filters">
      <IconFilter width={15} height={15} className="mission-filters-icon" />
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={`mission-filter-btn${filter.id === activeFilter ? ' is-active' : ''}`}
          onClick={() => onSelect(filter.id)}
        >
          {t(`missions.filter.${filter.id}`)} ({counts[filter.id] ?? 0})
        </button>
      ))}
    </div>
  )
}
