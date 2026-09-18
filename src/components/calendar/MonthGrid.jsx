import Card from '../common/Card'
import DayCell from './DayCell'
import { IconChevronLeft, IconChevronRight } from '../common/Icons'
import { WEEKDAY_LABELS } from '../../utils/calendarUtils'
import { useApp } from '../../context/AppContext'
import './calendar.css'

export default function MonthGrid({
  monthLabel,
  cells,
  activities,
  subjectsById,
  legendSubjects,
  selectedDateKey,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) {
  const { t } = useApp()
  return (
    <Card className="calendar-month-card">
      <div className="calendar-month-header">
        <button
          type="button"
          className="calendar-month-nav-btn"
          onClick={onPrevMonth}
          aria-label={t('calendar.prevMonth')}
        >
          <IconChevronLeft width={16} height={16} />
        </button>
        <h2 className="calendar-month-title">{monthLabel}</h2>
        <button
          type="button"
          className="calendar-month-nav-btn"
          onClick={onNextMonth}
          aria-label={t('calendar.nextMonth')}
        >
          <IconChevronRight width={16} height={16} />
        </button>
      </div>

      <div className="calendar-weekday-row">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="calendar-weekday-label">
            {label}
          </span>
        ))}
      </div>

      <div className="calendar-day-grid">
        {cells.map((cell, index) => (
          <DayCell
            key={cell ? cell.dateKey : `empty-${index}`}
            cell={cell}
            dayActivities={cell ? activities[cell.dateKey] : undefined}
            isSelected={cell ? cell.dateKey === selectedDateKey : false}
            subjectsById={subjectsById}
            onSelect={onSelectDate}
          />
        ))}
      </div>

      {legendSubjects.length > 0 && (
        <div className="calendar-legend">
          {legendSubjects.map((subject) => (
            <span key={subject.id} className="calendar-legend-item">
              <span className="calendar-legend-dot" style={{ background: subject.color }} />
              {subject.name}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
