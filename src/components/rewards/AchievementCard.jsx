import { IconSword, IconFlame, IconMoon, IconSun, IconBooks, IconBuilding, IconZap, IconCrown, IconCheckCircle } from '../common/Icons'
import './rewards.css'

const ICONS = {
  sword: IconSword,
  flame: IconFlame,
  moon: IconMoon,
  sun: IconSun,
  books: IconBooks,
  building: IconBuilding,
  zap: IconZap,
  crown: IconCrown,
}

export default function AchievementCard({ achievement }) {
  const { title, description, icon, unlocked } = achievement
  const Icon = ICONS[icon] ?? IconSword

  return (
    <div className={`unlock-card${unlocked ? '' : ' is-locked'}`}>
      <div className={`unlock-icon${unlocked ? '' : ' is-locked'}`}>
        <Icon width={18} height={18} />
      </div>
      <div className="unlock-body">
        <div className="unlock-title-row">
          <span className="unlock-title">{title}</span>
          {unlocked && <IconCheckCircle width={14} height={14} color="var(--accent-green)" />}
        </div>
        <p className="unlock-description">{description}</p>
      </div>
    </div>
  )
}
