import Card from '../common/Card'
import { IconCheckCircle, IconTarget } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './profile.css'

export default function AchievedGoalsList({ goals }) {
  const { t } = useApp()
  return (
    <Card title={t('profile.achievedGoals')} icon={<IconTarget width={14} height={14} />}>
      {goals.length === 0 ? (
        <p className="profile-empty-state">{t('profile.emptyAchievements')}</p>
      ) : (
        <ul className="achieved-goals-list">
          {goals.map((goal) => (
            <li key={goal.id} className="achieved-goal-row">
              <span className="achieved-goal-icon">
                <IconCheckCircle width={15} height={15} color="var(--accent-green)" />
              </span>
              <div className="achieved-goal-info">
                <span className="achieved-goal-title">{goal.title}</span>
                {goal.date && <span className="achieved-goal-date">{goal.date}</span>}
              </div>
              {goal.xp != null && <span className="achieved-goal-xp">+{goal.xp}</span>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
