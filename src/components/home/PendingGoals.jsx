import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'
import { useApp } from '../../context/AppContext'
import './home.css'

export default function PendingGoals({ goals }) {
  const { t } = useApp()
  return (
    <Card title={t('home.pendingGoals')}>
      <div className="pending-goals-grid">
        {goals.map((goal) => (
          <div className="pending-goal" key={goal.id}>
            <div className="pending-goal-top">
              <span className="pending-goal-title">{goal.title}</span>
              <span className="pending-goal-percent">{goal.percent}%</span>
            </div>
            <ProgressBar percent={goal.percent} colorVar="var(--accent-cyan)" />
            <span className="pending-goal-values">
              {goal.current.toLocaleString('ca-ES')} / {goal.target.toLocaleString('ca-ES')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
