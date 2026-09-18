import { useMemo, useState } from 'react'
import LevelHeader from '../components/rewards/LevelHeader'
import RewardsTabs from '../components/rewards/RewardsTabs'
import LevelListItem from '../components/rewards/LevelListItem'
import UnlockFilters from '../components/rewards/UnlockFilters'
import UnlockCard from '../components/rewards/UnlockCard'
import AchievementCard from '../components/rewards/AchievementCard'
import { unlockCategories } from '../data/rewardsData'
import { LEVELS } from '../utils/levelSystem'
import { useApp } from '../context/AppContext'
import './RewardsPage.css'

function getLevelStatus(level, currentLevelNumber) {
  if (level.number < currentLevelNumber) return 'assolit'
  if (level.number === currentLevelNumber) return 'actual'
  return 'futur'
}

export default function RewardsPage() {
  const { t, user, unlocks, achievements, purchaseUnlock } = useApp()
  const [activeTab, setActiveTab] = useState('nivells')
  const [activeCategory, setActiveCategory] = useState('tots')

  const tabs = [
    { id: 'nivells', label: t('rewards.tabs.levels') },
    { id: 'desbloquejos', label: t('rewards.tabs.unlocks') },
    { id: 'assoliments', label: t('rewards.tabs.achievements') },
  ]
  const categories = unlockCategories.map((c) => ({ ...c, label: t(`unlockCategory.${c.id}`) }))

  const visibleUnlocks = useMemo(
    () => (activeCategory === 'tots' ? unlocks : unlocks.filter((u) => u.category === activeCategory)),
    [activeCategory, unlocks],
  )

  return (
    <div className="rewards-page">
      <header className="rewards-page-header">
        <h1>{t('rewards.title')}</h1>
        <p className="rewards-page-subtitle">{t('rewards.subtitle')}</p>
      </header>

      <LevelHeader />

      <RewardsTabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />

      {activeTab === 'nivells' && (
        <ul className="level-list">
          {LEVELS.map((level) => (
            <LevelListItem key={level.number} level={level} status={getLevelStatus(level, user.level)} />
          ))}
        </ul>
      )}

      {activeTab === 'desbloquejos' && (
        <div className="rewards-tab-panel">
          <UnlockFilters
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
          <div className="unlocks-grid">
            {visibleUnlocks.map((unlock) => (
              <UnlockCard key={unlock.id} unlock={unlock} onPurchase={purchaseUnlock} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assoliments' && (
        <div className="unlocks-grid">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  )
}
