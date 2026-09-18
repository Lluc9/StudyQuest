import { useEffect, useRef, useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './layout/Sidebar'
import HomePage from './pages/HomePage'
import CalendarPage from './pages/CalendarPage'
import MissionsPage from './pages/MissionsPage'
import RewardsPage from './pages/RewardsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage from './pages/OnboardingPage'
import SettingsSidebar from './components/settings/SettingsSidebar'
import Toast from './components/common/Toast'
import { playNotificationSound } from './components/common/notificationSound'
import {
  sendBrowserNotification,
  shouldSendStreakReminder,
  shouldSendWeeklySummary,
  getTodayDateKey,
  getWeekKey,
} from './utils/notifications'
import './components/settings/settings.css'

const REMINDER_CHECK_INTERVAL_MS = 60 * 1000

function LoggedOutScreen() {
  const { t, setSessionActive } = useApp()
  return (
    <div className="logged-out-screen">
      <div className="logged-out-card">
        <h1 className="logged-out-title">{t('settings.account.loggedOutTitle')}</h1>
        <p className="logged-out-description">{t('settings.account.loggedOutDescription')}</p>
        <button type="button" className="settings-btn settings-btn--primary" onClick={() => setSessionActive(true)}>
          {t('settings.account.loginAgain')}
        </button>
      </div>
    </div>
  )
}

function AppShell({ activeScreen, setActiveScreen, activeSettingsSection, setActiveSettingsSection }) {
  const { settings, t, progress, streak, weeklyActivity, eventLog, updateNotifications } = useApp()
  const [toast, setToast] = useState(null)
  const lastEventCountRef = useRef(eventLog.length)

  // "Guanyes XP": mostra un toast intern quan `eventLog` (el mateix
  // registre que ja alimenta Perfil) rep un esdeveniment nou amb XP —
  // reutilitza el sistema d'esdeveniments existent, no en crea un altre.
  // Un sol dispatch pot afegir diversos esdeveniments alhora (p. ex. una
  // tasca que també fa pujar la ratxa) — cal repassar-los TOTS els nous,
  // no només l'últim, perquè el que porta XP no quedi amagat darrere d'un
  // que no en porta (racha/nivell/assoliment/desbloqueig).
  useEffect(() => {
    if (eventLog.length > lastEventCountRef.current) {
      const newEvents = eventLog.slice(lastEventCountRef.current)
      const xpEvent = newEvents.find((e) => typeof e.xp === 'number' && e.xp > 0)
      if (settings.notifications.xpGain && xpEvent) {
        setToast({ id: xpEvent.id, text: t('toast.xpGained', { xp: xpEvent.xp }) })
        if (settings.notifications.notificationSound) playNotificationSound()
      }
    }
    lastEventCountRef.current = eventLog.length
  }, [eventLog, settings.notifications.xpGain, settings.notifications.notificationSound, t])

  // Recordatoris basats en temps (manteniment de ratxa, resum setmanal):
  // només poden funcionar mentre la pestanya estigui oberta (no hi ha
  // backend ni push real) — comprovació periòdica lleugera + flags de
  // "ja avisat avui/aquesta setmana" perquè no es repeteixi l'avís.
  useEffect(() => {
    function check() {
      const now = new Date()
      if (shouldSendStreakReminder(settings.notifications, progress, now)) {
        const text = t('toast.streakReminder')
        setToast({ id: `streak-${Date.now()}`, text })
        if (settings.notifications.notificationSound) playNotificationSound()
        sendBrowserNotification('StudyQuest', text)
        updateNotifications({ lastStreakReminderDateKey: getTodayDateKey(now) })
      }
      if (shouldSendWeeklySummary(settings.notifications, now)) {
        const hours = Math.round(weeklyActivity.reduce((sum, d) => sum + d.hours, 0) * 10) / 10
        const text = t('toast.weeklySummaryBody', {
          sessions: progress.weeklySessions,
          hours,
          xp: progress.weeklyXP,
          streak: streak.currentDays,
        })
        setToast({ id: `weekly-${Date.now()}`, text: `${t('toast.weeklySummaryTitle')}: ${text}` })
        if (settings.notifications.notificationSound) playNotificationSound()
        sendBrowserNotification(t('toast.weeklySummaryTitle'), text)
        updateNotifications({ lastWeeklySummaryWeekKey: getWeekKey(now) })
      }
    }
    check()
    const id = setInterval(check, REMINDER_CHECK_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.notifications, progress, streak, weeklyActivity])

  if (!settings.sessionActive) return <LoggedOutScreen />

  return (
    <div className="app-shell">
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />
      {activeScreen === 'configuracio' && (
        <SettingsSidebar activeSection={activeSettingsSection} onSelect={setActiveSettingsSection} />
      )}
      <main className="app-main">
        {activeScreen === 'inici' && <HomePage />}
        {activeScreen === 'calendari' && <CalendarPage />}
        {activeScreen === 'missions' && <MissionsPage />}
        {activeScreen === 'recompenses' && <RewardsPage />}
        {activeScreen === 'perfil' && <ProfilePage />}
        {activeScreen === 'configuracio' && <SettingsPage activeSection={activeSettingsSection} />}
      </main>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

// Decideix entre l'Onboarding i l'aplicació real segons
// `settings.onboardingComplete` — necessita viure dins de `<AppProvider>`
// per poder cridar `useApp()`, per això és un component separat de `App`.
function AppRoot(props) {
  const { settings } = useApp()
  if (!settings.onboardingComplete) return <OnboardingPage />
  return <AppShell {...props} />
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState('inici')
  const [activeSettingsSection, setActiveSettingsSection] = useState('compte')

  return (
    <AppProvider>
      <AppRoot
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        activeSettingsSection={activeSettingsSection}
        setActiveSettingsSection={setActiveSettingsSection}
      />
    </AppProvider>
  )
}
