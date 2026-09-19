import { useEffect, useMemo, useState } from 'react'
import RecommendationCard from '../components/missions/RecommendationCard'
import MissionFilters from '../components/missions/MissionFilters'
import MissionCard from '../components/missions/MissionCard'
import ResetTimer from '../components/missions/ResetTimer'
import MissionsSummary from '../components/missions/MissionsSummary'
import DifficultyBreakdown from '../components/missions/DifficultyBreakdown'
import PersonalMissionForm from '../components/missions/PersonalMissionForm'
import { filters } from '../data/missionsData'
import { useApp } from '../context/AppContext'
import { getTutorialStepId } from '../components/tutorial/tutorialSteps'
import './MissionsPage.css'

export default function MissionsPage() {
  const {
    t,
    settings,
    missions,
    missionStats,
    missionRecommendations,
    subjects,
    profile,
    startMission,
    adjustMissionProgress,
    completeMission,
    createPersonalMission,
  } = useApp()
  const [activeFilter, setActiveFilter] = useState('totes')
  const tutorialStepId = getTutorialStepId(settings)

  // La coletilla "basat en el teu patró d'estudi" només té sentit si
  // l'usuari ja té alguna cosa completada que pugui formar un "patró" —
  // per a un compte nou (0 activitats i 0 missions completades), les
  // recomanacions es basen només en regles fixes (missió disponible amb
  // més XP), no en cap dada real seva encara.
  const hasStudyHistory = profile.stats.tasksCompleted > 0 || missions.some((m) => m.status === 'completed')

  // Mentre el Tutorial inicial ressalta una missió disponible, assegura
  // que el filtre "Totes" la mostri (si l'usuari l'hagués canviat abans)
  // — mai força el filtre fora del tutorial.
  useEffect(() => {
    if (tutorialStepId === 'start-mission') setActiveFilter('totes')
  }, [tutorialStepId])

  const tutorialTargetMissionId =
    tutorialStepId === 'start-mission' ? missions.find((m) => m.status === 'available')?.id : undefined

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
          {hasStudyHistory && (
            <span className="mission-recommendations-tag">{t('missions.recommendationsTag')}</span>
          )}
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
              isTutorialTarget={mission.id === tutorialTargetMissionId}
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
