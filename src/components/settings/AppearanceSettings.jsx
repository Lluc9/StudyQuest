import Card from '../common/Card'
import Toggle from '../common/Toggle'
import SegmentedControl from '../common/SegmentedControl'
import SettingsRow from './SettingsRow'
import { IconMoon, IconSun, IconMonitor } from '../common/Icons'
import { accentColors } from '../../data/settingsData'
import { useApp } from '../../context/AppContext'
import './settings.css'

export default function AppearanceSettings() {
  const { settings, t, updateAppearance } = useApp()
  const { theme, accentColor, compactMode, animations } = settings.appearance

  const themeOptions = [
    { value: 'fosc', label: t('settings.appearance.themeDark'), Icon: IconMoon },
    { value: 'clar', label: t('settings.appearance.themeLight'), Icon: IconSun },
    { value: 'sistema', label: t('settings.appearance.themeSystem'), Icon: IconMonitor },
  ]

  const selectedColorLabel = t(`settings.appearance.accent.${accentColor}`)

  return (
    <div className="settings-view">
      <Card title={t('settings.appearance.theme')}>
        <SegmentedControl options={themeOptions} value={theme} onChange={(v) => updateAppearance({ theme: v })} />
      </Card>

      <Card title={t('settings.appearance.accentColor')}>
        <div className="accent-color-grid">
          {accentColors.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`accent-color-swatch${c.id === accentColor ? ' is-selected' : ''}`}
              style={{ background: c.color }}
              onClick={() => updateAppearance({ accentColor: c.id })}
              aria-label={t(`settings.appearance.accent.${c.id}`)}
              aria-pressed={c.id === accentColor}
            >
              {c.id === accentColor && <span className="accent-color-check">✓</span>}
            </button>
          ))}
        </div>
        <span className="accent-color-caption">
          {t('settings.appearance.accentSelected')} <strong>{selectedColorLabel}</strong>
        </span>
      </Card>

      <Card title={t('settings.appearance.interface')}>
        <SettingsRow
          title={t('settings.appearance.compactMode')}
          description={t('settings.appearance.compactModeDesc')}
        >
          <Toggle
            checked={compactMode}
            onChange={(v) => updateAppearance({ compactMode: v })}
            label={t('settings.appearance.compactMode')}
          />
        </SettingsRow>
        <SettingsRow title={t('settings.appearance.animations')} description={t('settings.appearance.animationsDesc')}>
          <Toggle
            checked={animations}
            onChange={(v) => updateAppearance({ animations: v })}
            label={t('settings.appearance.animations')}
          />
        </SettingsRow>
      </Card>
    </div>
  )
}
