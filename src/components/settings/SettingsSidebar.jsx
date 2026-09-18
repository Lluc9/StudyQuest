import { IconUser, IconBell, IconPalette, IconClock } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './settings.css'

const SECTIONS = [
  { id: 'compte', key: 'settings.section.compte', Icon: IconUser },
  { id: 'notificacions', key: 'settings.section.notificacions', Icon: IconBell },
  { id: 'aparenca', key: 'settings.section.aparenca', Icon: IconPalette },
  { id: 'estudi', key: 'settings.section.estudi', Icon: IconClock },
]

export default function SettingsSidebar({ activeSection, onSelect }) {
  const { t } = useApp()

  return (
    <aside className="settings-sidebar">
      <span className="settings-sidebar-title">{t('settings.sidebarTitle')}</span>
      <nav className="settings-sidebar-nav">
        {SECTIONS.map(({ id, key, Icon }) => {
          const isActive = id === activeSection
          return (
            <button
              key={id}
              type="button"
              className={`settings-sidebar-item${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon width={16} height={16} />
              <span>{t(key)}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
