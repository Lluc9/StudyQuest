import { IconGrid, IconCalendar, IconTarget, IconGift, IconUser, IconSettings } from '../components/common/Icons'
import { useApp } from '../context/AppContext'
import './Sidebar.css'

const NAV_ITEMS = [
  { id: 'inici', key: 'sidebar.inici', Icon: IconGrid },
  { id: 'calendari', key: 'sidebar.calendari', Icon: IconCalendar },
  { id: 'missions', key: 'sidebar.missions', Icon: IconTarget },
  { id: 'recompenses', key: 'sidebar.recompenses', Icon: IconGift },
  { id: 'perfil', key: 'sidebar.perfil', Icon: IconUser },
]

export default function Sidebar({ activeScreen, onNavigate }) {
  const { user, t } = useApp()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <IconGrid width={18} height={18} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-title">STUDYQUEST</span>
          <span className="sidebar-version">v2.1.4 BETA</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, key, Icon }) => {
          const isActive = id === activeScreen
          return (
            <button
              key={id}
              type="button"
              className={`sidebar-nav-item${isActive ? ' is-active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon width={18} height={18} />
              <span>{t(key)}</span>
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        className={`sidebar-nav-item sidebar-settings-btn${activeScreen === 'configuracio' ? ' is-active' : ''}`}
        onClick={() => onNavigate('configuracio')}
        aria-current={activeScreen === 'configuracio' ? 'page' : undefined}
      >
        <IconSettings width={18} height={18} />
        <span>{t('sidebar.configuracio')}</span>
      </button>

      <div className="sidebar-footer">
        <div className="sidebar-level-row">
          <span className="sidebar-level-label">NIV. {user.level}</span>
          <span className="sidebar-level-percent">{user.levelProgressPercent}%</span>
        </div>
        <div className="sidebar-progress-track">
          <div
            className="sidebar-progress-fill"
            style={{ width: `${user.levelProgressPercent}%` }}
          />
        </div>
        <span className="sidebar-xp-total">
          {user.xpTotal.toLocaleString('ca-ES')} {t('sidebar.xpTotals')}
        </span>
      </div>
    </aside>
  )
}
