import { useMemo, useState } from 'react'
import RecommendationCard from '../components/missions/RecommendationCard'
import MissionFilters from '../components/missions/MissionFilters'
import MissionCard from '../components/missions/MissionCard'
import ResetTimer from '../components/missions/ResetTimer'
import MissionsSummary from '../components/missions/MissionsSummary'
import DifficultyBreakdown from '../components/missions/DifficultyBreakdown'
import PersonalMissionForm from '../components/missions/PersonalMissionForm'
import { filters } from '../data/missionsData'
import { useApp } from '../context/AppContext'
import './MissionsPage.css'

export default function MissionsPage() {
  const {
    t,
    missions,
    missionStats,
    missionRecommendations,
    subjects,
    startMission,
    adjustMissionProgress,
    completeMission,
    createPersonalMission,
  } = useApp()
  const [activeFilter, setActiveFilter] = useState('totes')

  const filterCounts = useMemo(() => {
    const counts = { totes: missions.length }
    for (const filter of filters) {
      if (filter.id === 'totes') continue
      counts[filter.id] = missions.filter((m) => m.category === filter.id).length
    }
    return counts
  }, [missions])

  const visibleMissions = useMemo(
    () => (activeFilter === 'totes' ? missions : missions.filter((m) => m.category === activeFilter)),
    [activeFilter, missions],
  )

  const openPersonalCount = missions.filter((m) => m.category === 'personal' && m.status !== 'completed').length

  return (
    <div className="missions-page">
      <header className="missions-page-header">
        <div>
          <h1>{t('missions.title')}</h1>
          <p className="missions-page-subtitle">{t('missions.subtitle')}</p>
        </div>
        <div className="missions-page-stats">
          <div className="missions-stat-badge missions-stat-badge--cyan">
            <span className="missions-stat-badge-value">{missionStats.xpDaily}</span>
            <span className="missions-stat-badge-label">{t('missions.xpDaily')}</span>
          </div>
          <div className="missions-stat-badge missions-stat-badge--purple">
            <span className="missions-stat-badge-value">{missionStats.xpWeekly}</span>
            <span className="missions-stat-badge-label">{t('missions.xpWeekly')}</span>
          </div>
        </div>
      </header>

      <section className="mission-recommendations">
        <div className="mission-recommendations-header">
          <span className="mission-recommendations-title">{t('missions.recommendationsTitle')}</span>
          <span className="mission-recommendations-tag">{t('missions.recommendationsTag')}</span>
        </div>
        <div className="recommendations-grid">
          {missionRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} {...rec} onAction={startMission} />
          ))}
        </div>
      </section>

      <MissionFilters
        filters={filters}
        counts={filterCounts}
        activeFilter={activeFilter}
        onSelect={setActiveFilter}
      />

      <div className="missions-page-grid">
        <ul className="mission-list">
          {visibleMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onStart={startMission}
              onAdjustProgress={(missionId, conditionId, delta) =>
                adjustMissionProgress(missionId, conditionId, delta)
              }
              onComplete={completeMission}
            />
          ))}
        </ul>

        <div className="missions-side-col">
          <ResetTimer />
          <MissionsSummary missions={missions} />
          <DifficultyBreakdown missions={missions} />
          <PersonalMissionForm
            openPersonalCount={openPersonalCount}
            userSubjects={subjects.userSubjects}
            onCreate={createPersonalMission}
          />
        </div>
      </div>
    </div>
  )
}
