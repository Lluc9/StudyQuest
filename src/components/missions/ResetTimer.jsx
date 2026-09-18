import { useEffect, useState } from 'react'
import Card from '../common/Card'
import { IconClock } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './missions.css'

function getMsUntilMidnight() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next - now
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/** Compte enrere en directe fins a la propera mitjanit (reset diari de missions). */
export default function ResetTimer() {
  const { t } = useApp()
  const [msLeft, setMsLeft] = useState(getMsUntilMidnight)

  useEffect(() => {
    const id = setInterval(() => setMsLeft(getMsUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <Card className="reset-timer-card">
      <div className="reset-timer-label">
        <IconClock width={13} height={13} />
        <span>{t('missions.resetDaily')}</span>
      </div>
      <div className="reset-timer-value">{formatCountdown(msLeft)}</div>
      <span className="reset-timer-note">{t('missions.newDailyMissions')}</span>
    </Card>
  )
}
