import { getSubjectInfo } from '../../utils/calendarUtils'
import './calendar.css'

/**
 * Una celda de día del calendario mensual. `cell` es `null` para los
 * huecos vacíos previos al día 1. `dayActivities` es el array de
 * actividades de ese día (puede ser undefined). `subjectsById` es el
 * diccionario combinat (catàleg + personalitzades) de calendarUtils.
 */
export default function DayCell({ cell, dayActivities, isSelected, subjectsById, onSelect }) {
  if (!cell) {
    return <div className="day-cell day-cell--empty" aria-hidden="true" />
  }

  const dotColors = [...new Set((dayActivities ?? []).map((a) => getSubjectInfo(subjectsById, a.subjectId).color))].slice(0, 3)

  return (
    <button
      type="button"
      className={`day-cell${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(cell.dateKey)}
      aria-pressed={isSelected}
    >
      <span className="day-cell-number">{cell.day}</span>
      {dotColors.length > 0 && (
        <span className="day-cell-dots">
          {dotColors.map((color) => (
            <span key={color} className="day-cell-dot" style={{ background: color }} />
          ))}
        </span>
      )}
    </button>
  )
}
