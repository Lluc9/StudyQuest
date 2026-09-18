import './missions.css'

export default function RecommendationCard({ title, description, tip, actionLabel, actionMissionId, onAction }) {
  return (
    <div className="recommendation-card">
      <h3 className="recommendation-title">{title}</h3>
      <p className="recommendation-description">{description}</p>
      {tip && (
        <p className="recommendation-tip">
          <span>💡</span> {tip}
        </p>
      )}
      {actionLabel && (
        <button type="button" className="recommendation-action-btn" onClick={() => onAction(actionMissionId)}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
