import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'
import { IconTrophy } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './home.css'

export default function DailyGoals({ goals, completedCount }) {
  const { t } = useApp()
  return (
    <Card
      title={t('home.dailyGoal')}
      icon={<IconTrophy width={15} height={15} color="var(--accent-yellow)" />}
      headerRight={t('home.completedCount', { count: completedCount, total: goals.length })}
      data-tutorial="tutorial-daily-goal"
    >
      <div className="daily-goals-grid">
        {goals.map((goal) => {
          const percent = (goal.current / goal.target) * 100
          return (
            <div className="daily-goal" key={goal.id}>
              <div className="daily-goal-top">
                <span className="daily-goal-title">{goal.title}</span>
                <span className="daily-goal-xp">+{goal.xp} XP</span>
              </div>
              <ProgressBar percent={percent} />
              <span className="daily-goal-values">
                {goal.current} / {goal.target}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
