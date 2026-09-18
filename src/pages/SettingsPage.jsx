import AccountSettings from '../components/settings/AccountSettings'
import NotificationSettings from '../components/settings/NotificationSettings'
import AppearanceSettings from '../components/settings/AppearanceSettings'
import StudySettings from '../components/settings/StudySettings'
import { useApp } from '../context/AppContext'
import './SettingsPage.css'

const TITLE_KEYS = {
  compte: 'settings.section.compte',
  notificacions: 'settings.section.notificacions',
  aparenca: 'settings.section.aparenca',
  estudi: 'settings.section.estudi',
}

const VIEWS = {
  compte: AccountSettings,
  notificacions: NotificationSettings,
  aparenca: AppearanceSettings,
  estudi: StudySettings,
}

export default function SettingsPage({ activeSection }) {
  const { t } = useApp()
  const ActiveView = VIEWS[activeSection] ?? AccountSettings

  return (
    <div className="settings-page">
      <h1>{t(TITLE_KEYS[activeSection] ?? TITLE_KEYS.compte)}</h1>
      <ActiveView />
    </div>
  )
}
