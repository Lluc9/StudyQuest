import { useAnimatedNumber } from '../../utils/useAnimatedNumber'
import './charts.css'

/**
 * Donut de progreso construido con SVG (sin librería de gráficos).
 * percent: 0-100. El anillo y el número central se animan de manera
 * progresiva hacia el nuevo `percent` en lugar de saltar directamente.
 */
export default function DonutProgress({ percent, centerBottom }) {
  const size = 140
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const animatedPercent = useAnimatedNumber(clamped)
  const dashOffset = circumference * (1 - animatedPercent / 100)

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-card-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#donut-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="donut-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="donut-center">
        <span className="donut-center-top">{Math.round(animatedPercent)}%</span>
        <span className="donut-center-bottom">{centerBottom}</span>
      </div>
    </div>
  )
}
