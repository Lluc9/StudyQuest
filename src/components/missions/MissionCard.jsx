import Tag from '../common/Tag'
import ProgressBar from '../common/ProgressBar'
import { IconZap, IconTarget, IconStar, IconFlame, IconCheckCircle, IconClock, IconChevronRight, IconMinus, IconPlus } from '../common/Icons'
import { difficulties, missionTypes } from '../../data/missionsData'
import { useApp } from '../../context/AppContext'
import './missions.css'

const TYPE_ICONS = {
  daily: IconZap,
  weekly: IconTarget,
  special: IconStar,
  personal: IconFlame,
}

function ManualStepper({ current, target, onAdjust, t }) {
  return (
    <div className="mission-stepper">
      <button
        type="button"
        className="mission-stepper-btn"
        aria-label={t('missions.reduce')}
        onClick={() => onAdjust(-1)}
        disabled={current <= 0}
      >
        <IconMinus width={12} height={12} />
      </button>
      <span className="mission-stepper-value">
        {current} / {target}
      </span>
      <button
        type="button"
        className="mission-stepper-btn"
        aria-label={t('missions.increase')}
        onClick={() => onAdjust(1)}
        disabled={current >= target}
      >
        <IconPlus width={12} height={12} />
      </button>
    </div>
  )
}

export default function MissionCard({ mission, onStart, onAdjustProgress, onComplete, isTutorialTarget = false }) {
  const { t } = useApp()
  const {
    id,
    title,
    description,
    tip,
    category,
    difficulty,
    trackingType,
    xpReward,
    progressCurrent,
    progressTarget,
    status,
    conditionsDisplay,
    canComplete,
  } = mission

  const isCompleted = status === 'completed'
  const isAvailable = status === 'available'
  const difficultyInfo = difficulties[difficulty]
  const typeInfo = missionTypes[category]
  const TypeIcon = TYPE_ICONS[category] ?? IconZap
  const percent = progressTarget > 0 ? (progressCurrent / progressTarget) * 100 : 0

  return (
    <li
      className={`mission-card${isCompleted ? ' is-completed' : ''}`}
      data-tutorial={isTutorialTarget ? 'tutorial-mission-card' : undefined}
    >
      <div className={`mission-icon${isCompleted ? ' is-completed' : ''}`}>
        {isCompleted ? <IconCheckCircle width={17} height={17} /> : <TypeIcon width={17} height={17} />}
      </div>

      <div className="mission-body">
        <div className="mission-top-row">
          <div className="mission-title-group">
            <span className="mission-title">{title}</span>
            <Tag tone="pill" color={difficultyInfo.color}>
              {t(`difficulty.${difficulty}`)}
            </Tag>
            <Tag tone="pill" color={typeInfo.color}>
              {t(`missionType.${category}`)}
            </Tag>
          </div>
          <span className="mission-xp">+{xpReward} XP</span>
        </div>

        {description && <p className="mission-description">{description}</p>}

        {tip && (
          <p className="recommendation-tip mission-tip">
            <span>💡</span> {tip}
          </p>
        )}

        {isAvailable && (
          <button type="button" className="mission-start-btn" onClick={() => onStart(id)}>
            {t('missions.start')}
          </button>
        )}

        {!isAvailable && trackingType !== 'hybrid' && (
          <>
            <ProgressBar percent={percent} colorVar={isCompleted ? 'var(--accent-green)' : typeInfo.color} />
            <div className="mission-bottom-row">
              <span className="mission-time">
                {isCompleted ? <IconCheckCircle width={12} height={12} /> : <IconClock width={12} height={12} />}
                {isCompleted
                  ? t('missions.completed')
                  : trackingType === 'manual'
                    ? t('missions.inProgress')
                    : t('missions.autoCalculated')}
              </span>
              {trackingType === 'manual' && !isCompleted ? (
                <ManualStepper
                  current={progressCurrent}
                  target={progressTarget}
                  onAdjust={(delta) => onAdjustProgress(id, null, delta)}
                  t={t}
                />
              ) : (
                <span className="mission-progress-label">
                  {progressCurrent}/{progressTarget}
                </span>
              )}
            </div>
          </>
        )}

        {!isAvailable && trackingType === 'hybrid' && (
          <div className="mission-conditions">
            {conditionsDisplay.map((condition) => (
              <div key={condition.conditionId} className="mission-condition-row">
                <span className={`mission-condition-label${condition.met ? ' is-met' : ''}`}>
                  {condition.met && <IconCheckCircle width={12} height={12} />}
                  {condition.label}
                </span>
                {condition.trackingType === 'manual' && !isCompleted ? (
                  <ManualStepper
                    current={condition.current}
                    target={condition.target}
                    onAdjust={(delta) => onAdjustProgress(id, condition.conditionId, delta)}
                    t={t}
                  />
                ) : (
                  <span className="mission-progress-label">
                    {condition.current}/{condition.target} {condition.unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {canComplete && !isCompleted && (
          <button type="button" className="mission-complete-btn" onClick={() => onComplete(id)}>
            {t('missions.complete')}
          </button>
        )}
      </div>

      <IconChevronRight width={16} height={16} className="mission-chevron" />
    </li>
  )
}
