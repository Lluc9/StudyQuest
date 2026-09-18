import { useMemo, useState } from 'react'
import Card from '../common/Card'
import SegmentedControl from '../common/SegmentedControl'
import { IconX } from '../common/Icons'
import { activityDurationOptions, activityTypes } from '../../data/activityOptions'
import { calculateActivityXp } from '../../utils/xpFormulas'
import { getSelectedDayLabel, getSubjectInfo } from '../../utils/calendarUtils'
import { useApp } from '../../context/AppContext'
import './calendar.css'

/**
 * Modal per crear una activitat nova o, si es passa `activity`, editar-ne
 * una d'existent (mateix formulari, valors inicials precarregats). Mai la
 * data: l'edició manté sempre el dia original de l'activitat.
 */
export default function NewActivityModal({ dateKey, userSubjects, subjectsById, activity, onSubmit, onClose }) {
  const { t } = useApp()
  const isEditing = Boolean(activity)
  const [title, setTitle] = useState(activity?.title ?? '')
  const [time, setTime] = useState(activity?.time ?? '09:00')
  const [durationMin, setDurationMin] = useState(activity?.durationMin ?? 60)
  const [subjectId, setSubjectId] = useState(activity?.subjectId ?? userSubjects[0]?.id ?? '')
  const [type, setType] = useState(activity?.type ?? 'estudi')

  // Si s'edita una activitat la matèria de la qual ja no és seleccionable
  // (p. ex. una personalitzada eliminada després), s'afegeix igualment com
  // a opció perquè el <select> no quedi desincronitzat del valor real.
  const subjectOptions = useMemo(() => {
    if (!activity || userSubjects.some((s) => s.id === activity.subjectId)) return userSubjects
    const fallback = getSubjectInfo(subjectsById, activity.subjectId)
    return [{ id: activity.subjectId, name: fallback.name }, ...userSubjects]
  }, [activity, userSubjects, subjectsById])

  const hasSubjects = subjectOptions.length > 0
  const canSubmit = title.trim().length > 0 && Boolean(subjectId) && hasSubjects
  const xpPreview = calculateActivityXp(type, durationMin)

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ activityId: activity?.id, dateKey, title, time, durationMin, subjectId, type })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
        <Card
          title={isEditing ? t('calendar.editActivity') : t('calendar.newActivity')}
          headerRight={
            <button type="button" className="modal-close-btn" aria-label={t('common.close')} onClick={onClose}>
              <IconX width={18} height={18} />
            </button>
          }
        >
          <form className="modal-form" onSubmit={handleSubmit}>
            <p className="modal-form-subtitle">{getSelectedDayLabel(dateKey)}</p>

            <div className="modal-field">
              <label className="modal-field-label" htmlFor="activity-title">
                {t('calendar.modal.title')}
              </label>
              <input
                id="activity-title"
                type="text"
                className="modal-input"
                placeholder={t('calendar.modal.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label className="modal-field-label" htmlFor="activity-time">
                {t('calendar.modal.time')}
              </label>
              <input
                id="activity-time"
                type="time"
                className="modal-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="modal-field">
              <span className="modal-field-label">{t('calendar.modal.duration')}</span>
              <SegmentedControl options={activityDurationOptions} value={durationMin} onChange={setDurationMin} />
            </div>

            <div className="modal-field">
              <label className="modal-field-label" htmlFor="activity-subject">
                {t('calendar.modal.subject')}
              </label>
              {hasSubjects ? (
                <select
                  id="activity-subject"
                  className="modal-input"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  {subjectOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="modal-field-hint">{t('calendar.modal.noSubjects')}</p>
              )}
            </div>

            <div className="modal-field">
              <span className="modal-field-label">{t('calendar.modal.type')}</span>
              <SegmentedControl
                options={activityTypes.map((at) => ({ value: at.id, label: t(`activityType.${at.id}`) }))}
                value={type}
                onChange={setType}
              />
            </div>

            <button type="submit" className="modal-submit-btn" disabled={!canSubmit}>
              {isEditing ? t('calendar.modal.submitEdit') : t('calendar.modal.submitNew')} · +{xpPreview} XP
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}
