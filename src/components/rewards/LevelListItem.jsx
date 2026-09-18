import Tag from '../common/Tag'
import { IconCheckCircle, IconLock } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './rewards.css'

/**
 * `status` és 'assolit' | 'actual' | 'futur', calculat pel component pare
 * comparant l'XP requerit del nivell amb l'XP total de l'usuari.
 */
export default function LevelListItem({ level, status }) {
  const { t } = useApp()
  return (
    <li className={`level-row level-row--${status}`}>
      <div className="level-badge" style={{ '--level-color': level.color }}>
        {level.number}
      </div>
      <div className="level-info">
        <div className="level-info-title-row">
          <span className="level-name">{level.name}</span>
          {status === 'actual' && (
            <Tag tone="pill" color="var(--accent-purple-light)">
              {t('rewards.current')}
            </Tag>
          )}
        </div>
        <span className="level-xp">{level.xpRequired.toLocaleString('ca-ES')} XP</span>
      </div>
      {status === 'futur' ? (
        <IconLock width={18} height={18} className="level-status-icon" />
      ) : (
        <IconCheckCircle width={18} height={18} className="level-status-icon" style={{ color: level.color }} />
      )}
    </li>
  )
}
