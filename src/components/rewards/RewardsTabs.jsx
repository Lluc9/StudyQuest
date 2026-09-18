import './rewards.css'

export default function RewardsTabs({ tabs, activeTab, onSelect }) {
  return (
    <div className="rewards-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`rewards-tab-btn${tab.id === activeTab ? ' is-active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
