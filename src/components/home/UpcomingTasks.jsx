import Card from '../common/Card'
import Tag from '../common/Tag'
import { IconCheckboxEmpty, IconCheckboxChecked } from '../common/Icons'
import { getSubjectInfo, formatRelativeDateTime } from '../../utils/calendarUtils'
import { useApp } from '../../context/AppContext'
import './home.css'

export default function UpcomingTasks({ tasks, pendingCount, onToggleTask, subjectsById, todayDateKey }) {
  const { t } = useApp()
  return (
    <Card
      title={t('home.upcomingTasks')}
      headerRight={t('home.pending', { count: pendingCount })}
      className="task-list-card"
      data-tutorial="tutorial-upcoming-tasks"
    >
      <ul className="task-list">
        {tasks.map((task, index) => {
          const subject = getSubjectInfo(subjectsById, task.subjectId)
          return (
            <li
              key={task.id}
              className={`task-row${task.completed ? ' is-completed' : ''}${
                task.urgent && !task.completed ? ' is-urgent' : ''
              }`}
              style={{ '--task-color': subject.color }}
            >
              <button
                type="button"
                className="task-checkbox"
                aria-label={task.completed ? t('home.markPending') : t('home.markCompleted')}
                onClick={() => onToggleTask(task.id)}
                data-tutorial={index === 0 ? 'tutorial-task-checkbox' : undefined}
              >
                {task.completed ? (
                  <IconCheckboxChecked width={18} height={18} color="var(--accent-green)" />
                ) : (
                  <IconCheckboxEmpty width={18} height={18} color="var(--text-muted)" />
                )}
              </button>

              <div className="task-info">
                <div className="task-title-row">
                  <span className="task-title">{task.title}</span>
                  {task.urgent && !task.completed && <Tag tone="urgent">{t('home.urgent')}</Tag>}
                </div>
                <Tag tone="subject" color={subject.color}>
                  {subject.name}
                </Tag>
              </div>

              <div className="task-meta">
                <span className="task-time">{formatRelativeDateTime(task.dateKey, task.time, todayDateKey)}</span>
                <span className="task-xp">+{task.xp} XP</span>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
