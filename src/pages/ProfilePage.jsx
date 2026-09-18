import Card from '../components/common/Card'
import MonthlyHoursChart from '../components/charts/MonthlyHoursChart'
import TrendLineChart from '../components/charts/TrendLineChart'
import ProfileHeader from '../components/profile/ProfileHeader'
import SubjectDistribution from '../components/profile/SubjectDistribution'
import AchievedGoalsList from '../components/profile/AchievedGoalsList'
import RecentActivityFeed from '../components/profile/RecentActivityFeed'
import { useApp } from '../context/AppContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { t, profile } = useApp()

  return (
    <div className="profile-page">
      <ProfileHeader />

      <div className="profile-charts-grid">
        <Card title={t('profile.hoursTitle')}>
          <MonthlyHoursChart data={profile.monthlyHours} />
        </Card>
        <Card title={t('profile.xpTrendTitle')}>
          <TrendLineChart data={profile.xpTrend} />
        </Card>
      </div>

      <div className="profile-bottom-grid">
        <SubjectDistribution subjects={profile.subjectDistribution} />
        <AchievedGoalsList goals={profile.achievedGoals} />
        <RecentActivityFeed items={profile.recentActivity} />
      </div>
    </div>
  )
}
