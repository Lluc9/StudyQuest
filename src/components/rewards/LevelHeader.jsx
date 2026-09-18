import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'
import { useApp } from '../../context/AppContext'
import { LEVELS } from '../../utils/levelSystem'
import './rewards.css'

export default function LevelHeader() {
  const { user, t } = useApp()

  return (
    <Card className="level-header-card">
      <div className="level-header-top">
        <div className="level-header-left">
          <div className="level-header-badge">{user.level}</div>
          <div>
            <span className="level-header-label">{t('rewards.currentLevel')}</span>
            <h2 className="level-header-name">{user.levelName}</h2>
          </div>
        </div>
        <div className="level-header-right" data-tutorial="tutorial-xp-block">
          <div className="level-header-xp-block">
            <span className="level-header-xp">{user.xpTotal.toLocaleString('ca-ES')}</span>
            <span className="level-header-xp-label">{t('rewards.xpTotalLabel')}</span>
          </div>
          <div className="level-header-xp-block">
            <span className="level-header-xp level-header-xp--available">
              {user.xpAvailable.toLocaleString('ca-ES')}
            </span>
            <span className="level-header-xp-label">{t('rewards.xpAvailableLabel')}</span>
          </div>
        </div>
      </div>

      <div className="level-header-progress-row">
        <span className="level-header-progress-label">NIV. {user.level}</span>
        <div className="level-header-progress-track-wrap">
          <ProgressBar percent={user.levelProgressPercent} height={8} />
        </div>
        <span className="level-header-progress-label">
          {user.level < LEVELS.length ? `NIV. ${user.level + 1}` : t('rewards.max')}
        </span>
      </div>
      <span className="level-header-progress-caption">
        {user.xpCurrentLevel.toLocaleString('ca-ES')} / {user.xpNextLevel.toLocaleString('ca-ES')} {t('rewards.xpToLevelUp')}
      </span>
    </Card>
  )
}
