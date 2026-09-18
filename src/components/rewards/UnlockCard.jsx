import { IconShield, IconFlame, IconZap, IconStar, IconTrophy, IconDiamond, IconSword, IconCheckCircle, IconLock } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './rewards.css'

const ICONS = {
  shield: IconShield,
  flame: IconFlame,
  zap: IconZap,
  star: IconStar,
  trophy: IconTrophy,
  diamond: IconDiamond,
  sword: IconSword,
}

export default function UnlockCard({ unlock, onPurchase }) {
  const { t } = useApp()
  const { id, title, description, icon, xpRequired, levelRequired, unlockType, cost, owned, eligible, canPurchase } = unlock
  const Icon = ICONS[icon] ?? IconStar
  const isLocked = !owned && !eligible

  return (
    <div className={`unlock-card${owned ? '' : ' is-locked'}`}>
      <div className={`unlock-icon${owned ? '' : ' is-locked'}`}>
        <Icon width={18} height={18} />
      </div>
      <div className="unlock-body">
        <div className="unlock-title-row">
          <span className="unlock-title">{title}</span>
          {owned && <IconCheckCircle width={14} height={14} color="var(--accent-green)" />}
        </div>
        <p className="unlock-description">{description}</p>
        <div className="unlock-meta">
          <span className="unlock-xp">
            {xpRequired.toLocaleString('ca-ES')} XP · NIV. {levelRequired}
          </span>
          {!owned && isLocked && <IconLock width={13} height={13} className="unlock-lock-icon" />}
        </div>

        {!owned && unlockType === 'purchasable' && eligible && (
          <button
            type="button"
            className="unlock-buy-btn"
            disabled={!canPurchase}
            onClick={() => onPurchase(id)}
          >
            {t('rewards.buy')} · {cost.toLocaleString('ca-ES')} XP
          </button>
        )}
      </div>
    </div>
  )
}
