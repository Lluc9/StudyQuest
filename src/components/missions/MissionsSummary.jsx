import Card from '../common/Card'
import { useApp } from '../../context/AppContext'
import './missions.css'

export default function MissionsSummary({ missions }) {
  const { t } = useApp()
  const todayKey = new Date().toISOString().slice(0, 10)

  const actives = missions.filter((m) => m.status === 'active').length
  const personals = missions.filter((m) => m.category === 'personal').length
  const completedToday = missions.filter(
    (m) => m.status === 'completed' && m.completedAt && m.completedAt.slice(0, 10) === todayKey,
  ).length
  const xpAvailable = missions
    .filter((m) => m.status === 'active' || m.status === 'available')
    .reduce((sum, m) => sum + m.xpReward, 0)

  return (
    <Card title={t('missions.summary')}>
      <ul className="missions-summary-list">
        <li>
          <span>{t('missions.active')}</span>
          <span className="missions-summary-value">{actives}</span>
        </li>
        <li>
          <span>{t('missions.personal')}</span>
          <span className="missions-summary-value">{personals}</span>
        </li>
        <li>
          <span>{t('missions.completedToday')}</span>
          <span className="missions-summary-value missions-summary-value--cyan">{completedToday}</span>
        </li>
      </ul>
      <div className="missions-xp-available">
        <span>{t('missions.xpAvailable')}</span>
        <span className="missions-xp-available-value">{xpAvailable.toLocaleString('ca-ES')}</span>
      </div>
    </Card>
  )
}
