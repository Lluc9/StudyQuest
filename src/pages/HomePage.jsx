import { useMemo } from 'react'
import Card from '../components/common/Card'
import StreakBadge from '../components/common/StreakBadge'
import DailyGoals from '../components/home/DailyGoals'
import StatsRow from '../components/home/StatsRow'
import UpcomingTasks from '../components/home/UpcomingTasks'
import PendingGoals from '../components/home/PendingGoals'
import DonutProgress from '../components/charts/DonutProgress'
import WeeklyBarChart from '../components/charts/WeeklyBarChart'
import { useApp } from '../context/AppContext'
import { buildSubjectsById } from '../utils/calendarUtils'
import './HomePage.css'

export default function HomePage() {
  const {
    t,
    user,
    today,
    streak,
    dailyGoals,
    dailyGoalsCompletedCount,
    indicators,
    tasks,
    pendingTasksCount,
    weeklyActivity,
    pendingGoals,
    subjects,
    toggleTask,
  } = useApp()

  const subjectsById = useMemo(() => buildSubjectsById(subjects.custom), [subjects.custom])

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <div className="home-header-date">
            {today.weekday}, {today.dateLabel}
          </div>
          <h1 className="home-header-welcome">
            {t('home.welcome')} <span>{user.name}</span>
          </h1>
        </div>
        <StreakBadge
          currentDays={streak.currentDays}
          targetDays={streak.targetDays}
          note={streak.note}
        />
      </header>

      <div className="home-sections">
        <DailyGoals goals={dailyGoals} completedCount={dailyGoalsCompletedCount} />

        <StatsRow indicators={indicators} />

        <div className="home-content-grid">
          <UpcomingTasks
            tasks={tasks}
            pendingCount={pendingTasksCount}
            onToggleTask={toggleTask}
            subjectsById={subjectsById}
            todayDateKey={today.dateKey}
          />

          <div className="home-side-col">
            <Card title={t('home.xpProgress')}>
              <DonutProgress
                percent={user.levelProgressPercent}
                centerBottom={`${t('home.level')} ${user.level}`}
              />
              <p className="home-xp-caption">
                {user.xpCurrentLevel.toLocaleString('ca-ES')} / {user.xpNextLevel.toLocaleString('ca-ES')} XP
              </p>
            </Card>

            <Card title={t('home.thisWeek')}>
              <WeeklyBarChart data={weeklyActivity} />
            </Card>
          </div>
        </div>

        <PendingGoals goals={pendingGoals} />
      </div>
    </div>
  )
}
