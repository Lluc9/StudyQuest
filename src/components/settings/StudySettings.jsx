import Card from '../common/Card'
import Toggle from '../common/Toggle'
import SegmentedControl from '../common/SegmentedControl'
import SettingsRow from './SettingsRow'
import {
  pomodoroSessionOptions,
  pomodoroBreakOptions,
  dailyTaskGoalOptions,
  weekStartOptions,
} from '../../data/settingsData'
import { useApp } from '../../context/AppContext'
import './settings.css'

export default function StudySettings() {
  const { t, settings, updateStudySettings } = useApp()
  const {
    studySessionDuration,
    studyBreakDuration,
    autoBreak,
    focusSound,
    dailyTaskGoal,
    weekStartsOn,
  } = settings

  const weekOptions = weekStartOptions.map((o) => ({
    ...o,
    label: t(`settings.study.weekStart.${o.value}`),
  }))

  return (
    <div className="settings-view">
      <Card title={t('settings.study.pomodoro')}>
        <div className="settings-subgroup">
          <span className="settings-subgroup-label">{t('settings.study.sessionDuration')}</span>
          <SegmentedControl
            options={pomodoroSessionOptions}
            value={studySessionDuration}
            onChange={(v) => updateStudySettings({ studySessionDuration: v })}
          />
        </div>
        <div className="settings-subgroup">
          <span className="settings-subgroup-label">{t('settings.study.breakDuration')}</span>
          <SegmentedControl
            options={pomodoroBreakOptions}
            value={studyBreakDuration}
            onChange={(v) => updateStudySettings({ studyBreakDuration: v })}
          />
        </div>
        <SettingsRow title={t('settings.study.autoBreak')} description={t('settings.study.autoBreakDesc')}>
          <Toggle
            checked={autoBreak}
            onChange={(v) => updateStudySettings({ autoBreak: v })}
            label={t('settings.study.autoBreak')}
          />
        </SettingsRow>
        <SettingsRow title={t('settings.study.focusSound')} description={t('settings.study.focusSoundDesc')}>
          <Toggle
            checked={focusSound}
            onChange={(v) => updateStudySettings({ focusSound: v })}
            label={t('settings.study.focusSound')}
          />
        </SettingsRow>
      </Card>

      <Card title={t('settings.study.goals')}>
        <div className="settings-subgroup">
          <span className="settings-subgroup-label">{t('settings.study.dailyTaskGoal')}</span>
          <SegmentedControl
            options={dailyTaskGoalOptions}
            value={dailyTaskGoal}
            onChange={(v) => updateStudySettings({ dailyTaskGoal: v })}
          />
        </div>
        <div className="settings-subgroup">
          <span className="settings-subgroup-label">{t('settings.study.weekStart')}</span>
          <SegmentedControl
            options={weekOptions}
            value={weekStartsOn}
            onChange={(v) => updateStudySettings({ weekStartsOn: v })}
          />
        </div>
      </Card>
    </div>
  )
}
