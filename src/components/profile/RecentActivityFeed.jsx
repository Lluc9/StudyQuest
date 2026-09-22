import Card from '../common/Card'
import { IconCheckCircle, IconFlame, IconTarget, IconStar, IconTrophy, IconGift, IconClock, IconShield } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './profile.css'

const TYPE_CONFIG = {
  tasca: { Icon: IconCheckCircle, color: 'var(--accent-green)' },
  racha: { Icon: IconFlame, color: 'var(--accent-orange)' },
  missio: { Icon: IconTarget, color: 'var(--accent-purple-light)' },
  nivell: { Icon: IconStar, color: 'var(--accent-yellow)' },
  assoliment: { Icon: IconTrophy, color: 'var(--accent-orange)' },
  desbloqueig: { Icon: IconGift, color: 'var(--accent-cyan)' },
  personatge: { Icon: IconShield, color: 'var(--accent-purple-light)' },
}

export default function RecentActivityFeed({ items }) {
  const { t } = useApp()
  return (
    <Card title={t('profile.recentActivity')} icon={<IconClock width={14} height={14} />}>
      {items.length === 0 ? (
        <p className="profile-empty-state">{t('profile.emptyActivity')}</p>
      ) : (
        <ul className="recent-activity-list">
          {items.map((item) => {
            const { Icon, color } = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.tasca
            return (
              <li key={item.id} className="recent-activity-row">
                <span
                  className="recent-activity-icon"
                  style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
                >
                  <Icon width={14} height={14} />
                </span>
                <div className="recent-activity-info">
                  <span className="recent-activity-title">{item.title}</span>
                  <span className="recent-activity-time">{item.time}</span>
                </div>
                {item.xp != null && <span className="recent-activity-xp">+{item.xp}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
