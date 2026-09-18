import { IconZap, IconStar, IconCheckCircle, IconClock } from './Icons'
import './common.css'

const ICONS = {
  zap: IconZap,
  star: IconStar,
  check: IconCheckCircle,
  clock: IconClock,
}

export default function StatCard({ label, value, icon, color = 'purple' }) {
  const Icon = ICONS[icon] ?? IconZap
  return (
    <div className="stat-card">
      <div className={`stat-card-label stat-card-label--${color}`}>
        <Icon width={13} height={13} />
        <span>{label.toUpperCase()}</span>
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  )
}
