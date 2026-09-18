import { IconZap, IconStar, IconCheckCircle, IconClock } from './Icons'
import { useAnimatedNumber } from '../../utils/useAnimatedNumber'
import './common.css'

const ICONS = {
  zap: IconZap,
  star: IconStar,
  check: IconCheckCircle,
  clock: IconClock,
}

// `animatedValue`, si es passa, fa que el número del card pugi/baixi de
// manera progressiva cap al nou valor en lloc de canviar a l'instant
// (s'utilitza a XP Total i Hores aquesta setmana). Els cards que no el
// passen (Nivell, Tasques avui) mantenen el comportament immediat d'abans.
export default function StatCard({ label, value, icon, color = 'purple', animatedValue, decimals = 0, suffix = '' }) {
  const Icon = ICONS[icon] ?? IconZap
  const animated = useAnimatedNumber(animatedValue ?? 0)
  const displayValue =
    animatedValue === undefined
      ? value
      : decimals > 0
        ? `${animated.toLocaleString('ca-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
        : `${Math.round(animated).toLocaleString('ca-ES')}${suffix}`

  return (
    <div className="stat-card">
      <div className={`stat-card-label stat-card-label--${color}`}>
        <Icon width={13} height={13} />
        <span>{label.toUpperCase()}</span>
      </div>
      <div className="stat-card-value">{displayValue}</div>
    </div>
  )
}
