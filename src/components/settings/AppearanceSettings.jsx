import Card from '../common/Card'
import Toggle from '../common/Toggle'
import SegmentedControl from '../common/SegmentedControl'
import SettingsRow from './SettingsRow'
import { IconMoon, IconSun, IconMonitor, IconShield } from '../common/Icons'
import { accentColors } from '../../data/settingsData'
import { useApp } from '../../context/AppContext'
import './settings.css'

// Id del desbloqueig "Tema Fosc Pro" a `data/rewardsCatalog.js` — només
// apareix com a opció seleccionable un cop comprat (`ownedUnlockIds`),
// igual que el botó "Comprar" de `UnlockCard` només apareix quan és
// elegible.
const THEME_PRO_UNLOCK_ID = 'u1'

export default function AppearanceSettings() {
  const { settings, unlocks, t, updateAppearance } = useApp()
  const { theme, accentColor, compactMode, animations } = settings.appearance
  const hasThemePro = unlocks.find((u) => u.id === THEME_PRO_UNLOCK_ID)?.owned ?? false

  const themeOptions = [
    { value: 'fosc', label: t('settings.appearance.themeDark'), Icon: IconMoon },
    { value: 'clar', label: t('settings.appearance.themeLight'), Icon: IconSun },
    { value: 'sistema', label: t('settings.appearance.themeSystem'), Icon: IconMonitor },
    ...(hasThemePro ? [{ value: 'fosc-pro', label: t('settings.appearance.themeDarkPro'), Icon: IconShield }] : []),
  ]

  const selectedColorLabel = t(`settings.appearance.accent.${accentColor}`)

  return (
    <div className="settings-view">
      <Card title={t('settings.appearance.theme')}>
        <SegmentedControl options={themeOptions} value={theme} onChange={(v) => updateAppearance({ theme: v })} />
      </Card>

      <Card title={t('settings.appearance.accentColor')} data-tutorial="tutorial-appearance-colors">
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
