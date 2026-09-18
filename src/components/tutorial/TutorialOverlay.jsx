import { useEffect, useMemo, useRef, useState } from 'react'
import { IconX, IconChevronRight } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import { TUTORIAL_STEPS } from './tutorialSteps'
import './tutorial.css'

const CARD_WIDTH = 320
const CARD_MARGIN = 16

// Posició de la targeta flotant: sota l'element ressaltat si hi ha prou
// espai, si no a sobre; sempre dins dels límits de la finestra. Sense
// `rect` (element encara no localitzat, p. ex. mentre canvia de pantalla)
// es mostra centrada com a estat de transició breu.
function computeCardPosition(rect) {
  if (!rect) {
    return { top: window.innerHeight / 2 - 90, left: Math.max(CARD_MARGIN, window.innerWidth / 2 - CARD_WIDTH / 2) }
  }
  const spaceBelow = window.innerHeight - rect.bottom
  const top = spaceBelow > 220 ? rect.bottom + CARD_MARGIN : Math.max(CARD_MARGIN, rect.top - 220)
  let left = rect.left
  if (left + CARD_WIDTH + CARD_MARGIN > window.innerWidth) left = window.innerWidth - CARD_WIDTH - CARD_MARGIN
  if (left < CARD_MARGIN) left = CARD_MARGIN
  return { top, left }
}

/**
 * Recorregut "spotlight" del Tutorial inicial (8 passos — veure
 * `tutorialSteps.js` i NOTES.md). Viu dins d'`AppShell` (App.jsx), per
 * sobre de `Sidebar` + `main`: l'usuari veu l'app real de fons, mai una
 * pantalla a part (a diferència de l'Onboarding). Localitza l'element a
 * ressaltar de cada pas per l'atribut `data-tutorial` (mai per classes
 * CSS, que poden canviar) i pot canviar de pantalla ell mateix
 * reutilitzant `setActiveScreen`.
 */
export default function TutorialOverlay({ activeScreen, setActiveScreen }) {
  const { t, settings, activities, tasks, missions, completeTutorial, skipTutorial, setTutorialStep } = useApp()
  // Lazy init: si l'usuari recarrega a mitja seqüència, reprèn pel mateix
  // pas desat a `settings.tutorialStepIndex` (punt 5 de l'encàrrec).
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(settings.tutorialStepIndex ?? 0, 0), TUTORIAL_STEPS.length - 1),
  )
  const [rect, setRect] = useState(null)
  // Punt de referència en entrar al pas de missions: es compara un
  // COMPTADOR (missions ja no "available"), no una missió concreta,
  // perquè la llista es pot reordenar sense que això sigui "trampa".
  const missionsResolvedAtEntryRef = useRef(0)

  const step = TUTORIAL_STEPS[stepIndex]
  const isLastStep = stepIndex === TUTORIAL_STEPS.length - 1
  const totalActivities = useMemo(
    () => Object.values(activities).reduce((sum, list) => sum + list.length, 0),
    [activities],
  )

  function goToStep(index) {
    setStepIndex(index)
    setTutorialStep(index)
  }

  function handleNext() {
    if (isLastStep) {
      completeTutorial()
    } else {
      goToStep(stepIndex + 1)
    }
  }

  // El tutorial canvia de pantalla ell mateix quan el pas ho requereix
  // (p. ex. Calendari pel pas 3) — reutilitza la mateixa `setActiveScreen`
  // que ja fa servir el Sidebar.
  useEffect(() => {
    if (activeScreen !== step.screen) setActiveScreen(step.screen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.screen])

  useEffect(() => {
    if (step.id === 'start-mission') {
      missionsResolvedAtEntryRef.current = missions.filter((m) => m.status !== 'available').length
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id])

  // Localitza i segueix l'element ressaltat: recalcula en canviar de pas,
  // en redimensionar la finestra i periòdicament (per si el layout es mou
  // per una altra raó, p. ex. una animació) — sense dependre de cap
  // listener de scroll concret, ja que no sabem per endavant quin
  // contenidor fa scroll a cada pantalla.
  useEffect(() => {
    // Neteja el requadre anterior de seguida (mai deixar-lo un instant
    // sobre l'element del pas anterior mentre en busquem un de nou —
    // es veuria "saltar" a un lloc incorrecte just abans de corregir-se).
    setRect(null)
    function updateRect() {
      const el = document.querySelector(`[data-tutorial="${step.target}"]`)
      if (!el) {
        setRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height })
    }
    const raf = requestAnimationFrame(updateRect)
    const timeout = setTimeout(updateRect, 250)
    const interval = setInterval(updateRect, 400)
    window.addEventListener('resize', updateRect)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
      clearInterval(interval)
      window.removeEventListener('resize', updateRect)
    }
  }, [step.target, activeScreen])

  useEffect(() => {
    const id = setTimeout(() => {
      document.querySelector(`[data-tutorial="${step.target}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(id)
  }, [step.target, activeScreen])

  // Avanç automàtic dels passos "actius": l'usuari fa l'acció real (crear
  // una activitat, completar-la, iniciar una missió) — mai amb "Endavant".
  useEffect(() => {
    if (step.id === 'new-activity' && totalActivities > 0) {
      handleNext()
    } else if (step.id === 'complete-task' && tasks.length > 0 && tasks[0].completed) {
      handleNext()
    } else if (step.id === 'start-mission') {
      const resolvedNow = missions.filter((m) => m.status !== 'available').length
      if (resolvedNow > missionsResolvedAtEntryRef.current) handleNext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, totalActivities, tasks, missions])

  const cardPosition = computeCardPosition(rect)

  return (
    <>
      {rect ? (
        <>
          <div className="tutorial-mask" style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top) }} />
          <div className="tutorial-mask" style={{ top: rect.bottom, left: 0, right: 0, bottom: 0 }} />
          <div
            className="tutorial-mask"
            style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }}
          />
          <div className="tutorial-mask" style={{ top: rect.top, left: rect.right, right: 0, height: rect.height }} />
          <div
            className="tutorial-ring"
            style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
          />
        </>
      ) : (
        <div className="tutorial-mask tutorial-mask--full" />
      )}

      <div className="tutorial-card" style={{ top: cardPosition.top, left: cardPosition.left }}>
        <div className="tutorial-card-top">
          <span className="tutorial-progress">
            {t('tutorial.progress', { n: stepIndex + 1, total: TUTORIAL_STEPS.length })}
          </span>
          <button type="button" className="tutorial-skip-btn" onClick={skipTutorial}>
            <IconX width={12} height={12} />
            {t('tutorial.skip')}
          </button>
        </div>
        <h3 className="tutorial-card-title">{t(step.titleKey)}</h3>
        <p className="tutorial-card-body">{t(step.bodyKey)}</p>

        {step.type === 'explain' ? (
          <button type="button" className="settings-btn settings-btn--primary tutorial-next-btn" onClick={handleNext}>
            {isLastStep ? t('tutorial.finish') : t('tutorial.next')}
            <IconChevronRight width={14} height={14} />
          </button>
        ) : (
          <span className="tutorial-waiting-hint">{t('tutorial.waitingHint')}</span>
        )}
      </div>
    </>
  )
}
