import { toDateKey, getWeekdayLabel } from '../../utils/calendarUtils'
import { useApp } from '../../context/AppContext'
import './calendar.css'

export default function WeeklyDistribution({ weekDates, activities }) {
  const { t } = useApp()
  const days = weekDates.map((date) => {
    const dateKey = toDateKey(date)
    const dayActivities = activities[dateKey] ?? []
    return {
      dateKey,
      label: getWeekdayLabel(date),
      dayNumber: date.getDate(),
      count: dayActivities.length,
      hasExam: dayActivities.some((a) => a.type === 'examen'),
    }
  })

  const maxCount = Math.max(...days.map((d) => d.count), 1)

  return (
    <div className="weekly-distribution">
      {days.map((day) => (
        <div key={day.dateKey} className="weekly-distribution-col">
          <span className="weekly-distribution-day">
            {day.label} {day.dayNumber}
          </span>
          <div className="weekly-distribution-track">
            <div
              className={`weekly-distribution-fill${day.hasExam ? ' is-exam' : ''}`}
              style={{ width: `${day.count === 0 ? 0 : Math.max((day.count / maxCount) * 100, 25)}%` }}
            />
          </div>
          <span className="weekly-distribution-count">
            {day.count === 0 ? t('calendar.free') : `${day.count} ${day.count === 1 ? t('calendar.task') : t('calendar.tasks')}`}
          </span>
        </div>
      ))}
    </div>
  )
}
