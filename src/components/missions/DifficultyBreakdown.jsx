import Card from '../common/Card'
import { difficulties } from '../../data/missionsData'
import { useApp } from '../../context/AppContext'
import './missions.css'

export default function DifficultyBreakdown({ missions }) {
  const { t } = useApp()
  const counts = Object.entries(difficulties).map(([key, info]) => ({
    key,
    ...info,
    count: missions.filter((m) => m.difficulty === key).length,
  }))

  return (
    <Card title={t('missions.difficulty')}>
      <ul className="difficulty-breakdown-list">
        {counts.map((d) => (
          <li key={d.key}>
            <span className="difficulty-breakdown-label">
              <span className="difficulty-breakdown-dot" style={{ background: d.color }} />
              {t(`difficulty.${d.key}`)}
            </span>
            <span className="difficulty-breakdown-count">{t('missions.missionsCount', { count: d.count })}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
