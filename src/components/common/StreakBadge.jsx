import { IconFlame } from './Icons'
import { useApp } from '../../context/AppContext'
import './common.css'

export default function StreakBadge({ currentDays, targetDays, note }) {
  const { t } = useApp()
  return (
    <div className="streak-badge">
      <div className="streak-badge-top">
        <IconFlame width={14} height={14} className="streak-flame" />
        <span className="streak-label">{t('home.streak')}</span>
        <span className="streak-value">
          {currentDays}/{targetDays} {t('home.days')}
        </span>
      </div>
      <div className="streak-days">
        {Array.from({ length: targetDays }).map((_, i) => (
          <span key={i} className={`streak-day${i < currentDays ? ' is-active' : ''}`} />
        ))}
      </div>
      {note && <span className="streak-note">{note}</span>}
    </div>
  )
}
