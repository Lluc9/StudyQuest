import Card from '../common/Card'
import Tag from '../common/Tag'
import { IconClock, IconPencil, IconTrash } from '../common/Icons'
import { getSelectedDayLabel, getSubjectInfo, formatDuration } from '../../utils/calendarUtils'
import { useApp } from '../../context/AppContext'
import './calendar.css'

export default function SelectedDayPanel({ dateKey, dayActivities, totalXp, subjectsById, onEditActivity, onDeleteActivity }) {
  const { t } = useApp()
  return (
    <Card className="calendar-day-panel">
      <div className="calendar-day-panel-header">
        <span className="calendar-day-panel-label">{t('calendar.selectedDay')}</span>
        <h2 className="calendar-day-panel-date">{getSelectedDayLabel(dateKey)}</h2>
      </div>

      {dayActivities.length > 0 ? (
        <ul className="activity-list">
          {dayActivities.map((activity) => {
            const subject = getSubjectInfo(subjectsById, activity.subjectId)
            return (
              <li
                key={activity.id}
                className={`activity-card${activity.completed ? ' is-completed' : ''}`}
                style={{ '--activity-color': subject.color }}
              >
                <div className="activity-card-top">
                  <span className="activity-card-title">{activity.title}</span>
                  <div className="activity-card-top-right">
                    <Tag tone="xp">+{activity.xp} XP</Tag>
                    <button
                      type="button"
                      className="activity-card-action-btn"
                      aria-label={t('calendar.editActivityAria')}
                      onClick={() => onEditActivity(activity)}
                    >
                      <IconPencil width={13} height={13} />
                    </button>
                    <button
                      type="button"
                      className="activity-card-action-btn"
                      aria-label={t('calendar.deleteActivityAria')}
                      onClick={() => onDeleteActivity(activity)}
                    >
                      <IconTrash width={13} height={13} />
                    </button>
                  </div>
                </div>
                <div className="activity-card-meta">
                  <IconClock width={12} height={12} />
                  <span>
                    {activity.time} · {subject.name} · {formatDuration(activity.durationMin)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="calendar-day-panel-empty">{t('calendar.noActivities')}</p>
      )}

      <div className="xp-banner">
        <span>{t('calendar.xpAvailableToday')}</span>
        <span className="xp-banner-value">+{totalXp} XP</span>
      </div>
    </Card>
  )
}
