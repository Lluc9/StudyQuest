import './profile.css'

export default function ProfileStats({ stats }) {
  return (
    <div className="profile-stats-grid">
      {stats.map((stat) => (
        <div className="profile-stat-card" key={stat.id}>
          <span className={`profile-stat-value profile-stat-value--${stat.color}`}>{stat.value}</span>
          <span className="profile-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
