import StatCard from '../common/StatCard'
import './home.css'

export default function StatsRow({ indicators }) {
  return (
    <div className="stats-row">
      {indicators.map((indicator) => (
        <StatCard key={indicator.id} {...indicator} />
      ))}
    </div>
  )
}
