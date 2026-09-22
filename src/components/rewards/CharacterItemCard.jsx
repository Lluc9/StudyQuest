import {
  IconUser,
  IconShield,
  IconDiamond,
  IconBooks,
  IconCrown,
  IconPencil,
  IconZap,
  IconSword,
  IconStar,
  IconSun,
  IconMoon,
  IconFlame,
  IconLock,
  IconCheckCircle,
} from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './character.css'

// Mateixa convenció que `UnlockCard.jsx`: el catàleg només porta la clau
// de la icona, el component decideix quin component SVG hi correspon.
const ICONS = {
  user: IconUser,
  shield: IconShield,
  diamond: IconDiamond,
  books: IconBooks,
  crown: IconCrown,
  pencil: IconPencil,
  zap: IconZap,
  sword: IconSword,
  star: IconStar,
  sun: IconSun,
  moon: IconMoon,
  flame: IconFlame,
}

export default function CharacterItemCard({ item, onPurchase, onEquip }) {
  const { t } = useApp()
  const { id, title, description, icon, levelRequired, cost, owned, eligible, canPurchase, equipped } = item
  const Icon = ICONS[icon] ?? IconStar
  const isLocked = !owned && !eligible

  return (
    <div className={`character-item${equipped ? ' is-equipped' : ''}${isLocked ? ' is-locked' : ''}`}>
      <div className="character-item-top">
        <span className={`character-item-icon${owned ? '' : ' is-locked'}`}>
          <Icon width={16} height={16} />
        </span>
        {equipped && <IconCheckCircle width={14} height={14} color="var(--accent-green)" />}
        {isLocked && <IconLock width={13} height={13} className="character-item-lock" />}
      </div>

      <span className="character-item-title">{title}</span>
      <p className="character-item-description">{description}</p>

      {/* La peça base no té ni preu ni requisit: es té sempre. */}
      {cost > 0 && (
        <span className="character-item-meta">
          {cost.toLocaleString('ca-ES')} XP · {t('character.levelShort')} {levelRequired}
        </span>
      )}

      {equipped ? (
        <span className="character-item-state">{t('character.equipped')}</span>
      ) : owned ? (
        <button type="button" className="character-item-btn character-item-btn--equip" onClick={() => onEquip(id)}>
          {t('character.equip')}
        </button>
      ) : eligible ? (
        <button
          type="button"
          className="character-item-btn"
          disabled={!canPurchase}
          onClick={() => onPurchase(id)}
        >
          {t('character.buy')}
        </button>
      ) : (
        <span className="character-item-state character-item-state--locked">
          {t('character.needsLevel', { n: levelRequired })}
        </span>
      )}
    </div>
  )
}
