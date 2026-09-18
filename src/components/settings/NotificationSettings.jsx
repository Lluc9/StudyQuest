import { useState } from 'react'
import Card from '../common/Card'
import Toggle from '../common/Toggle'
import SettingsRow from './SettingsRow'
import { IconClock } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import { getNotificationPermission, requestNotificationPermissionIfNeeded } from '../../utils/notifications'
import './settings.css'

export default function NotificationSettings() {
  const { settings, t, updateNotifications } = useApp()
  const { notifications } = settings
  const [permission, setPermission] = useState(getNotificationPermission)

  // Només es demana permís del navegador quan l'usuari activa un
  // recordatori que en depèn (mai a l'obrir la pantalla, per no ser
  // molest amb un diàleg no demanat).
  async function handleStreakReminderChange(checked) {
    updateNotifications({ streakReminder: checked })
    if (checked) {
      const result = await requestNotificationPermissionIfNeeded()
      setPermission(result)
    }
  }

  return (
    <div className="settings-view">
      <Card title={t('settings.notifications.reminders')}>
        <SettingsRow
          title={t('settings.notifications.taskReminder')}
          description={t('settings.notifications.taskReminderDesc')}
        >
          <Toggle
            checked={notifications.taskReminder}
            onChange={(v) => updateNotifications({ taskReminder: v })}
            label={t('settings.notifications.taskReminder')}
          />
        </SettingsRow>
        <SettingsRow
          title={t('settings.notifications.streakReminder')}
          description={t('settings.notifications.streakReminderDesc')}
        >
          <Toggle
            checked={notifications.streakReminder}
            onChange={handleStreakReminderChange}
            label={t('settings.notifications.streakReminder')}
          />
        </SettingsRow>
        <SettingsRow
          title={t('settings.notifications.reminderTime')}
          description={
            notifications.streakReminder
              ? t('settings.notifications.reminderTimeDesc')
              : t('settings.notifications.reminderTimeInactive')
          }
        >
          <label className={`settings-time-input${notifications.streakReminder ? '' : ' is-inactive'}`}>
            <IconClock width={14} height={14} />
            <input
              type="time"
              className="settings-time-input-field"
              value={notifications.reminderTime}
              onChange={(e) => updateNotifications({ reminderTime: e.target.value })}
              disabled={!notifications.streakReminder}
            />
          </label>
        </SettingsRow>
        {notifications.streakReminder && permission === 'denied' && (
          <p className="settings-field-error">{t('settings.notifications.permissionDenied')}</p>
        )}
      </Card>

      <Card title={t('settings.notifications.activity')}>
        <SettingsRow title={t('settings.notifications.xpGain')} description={t('settings.notifications.xpGainDesc')}>
          <Toggle
            checked={notifications.xpGain}
            onChange={(v) => updateNotifications({ xpGain: v })}
            label={t('settings.notifications.xpGain')}
          />
        </SettingsRow>
        <SettingsRow
          title={t('settings.notifications.weeklySummary')}
          description={t('settings.notifications.weeklySummaryDesc')}
        >
          <Toggle
            checked={notifications.weeklySummary}
            onChange={(v) => updateNotifications({ weeklySummary: v })}
            label={t('settings.notifications.weeklySummary')}
          />
        </SettingsRow>
      </Card>

      <Card title={t('settings.notifications.sound')}>
        <SettingsRow
          title={t('settings.notifications.notificationSound')}
          description={t('settings.notifications.notificationSoundDesc')}
        >
          <Toggle
            checked={notifications.notificationSound}
            onChange={(v) => updateNotifications({ notificationSound: v })}
            label={t('settings.notifications.notificationSound')}
          />
        </SettingsRow>
      </Card>

      <p className="settings-footnote">{t('settings.notifications.permissionNote')}</p>
    </div>
  )
}
