import { useState } from 'react'
import Card from '../common/Card'
import { personalMissionTemplates, MAX_ACTIVE_PERSONAL_MISSIONS } from '../../data/missionTemplates'
import { useApp } from '../../context/AppContext'
import './missions.css'

/**
 * Formulari mínim per crear una missió personal a partir d'una plantilla
 * fixa. La dificultat i l'XP es calculen automàticament (veure
 * missionEngine.getPersonalMissionDifficulty) — l'usuari només tria
 * plantilla, títol, quantitat objectiu i, opcionalment, matèria.
 */
export default function PersonalMissionForm({ openPersonalCount, userSubjects, onCreate }) {
  const { t } = useApp()
  const [templateId, setTemplateId] = useState(personalMissionTemplates[0].templateId)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState(5)
  const [subjectId, setSubjectId] = useState('')

  const atLimit = openPersonalCount >= MAX_ACTIVE_PERSONAL_MISSIONS
  const canSubmit = !atLimit && title.trim().length > 0 && Number(target) > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onCreate({ templateId, title, target: Number(target), subjectId: subjectId || null })
    setTitle('')
    setTarget(5)
    setSubjectId('')
  }

  return (
    <Card title={t('missions.personalMission')}>
      {atLimit ? (
        <p className="modal-field-hint">{t('missions.personalLimit', { max: MAX_ACTIVE_PERSONAL_MISSIONS })}</p>
      ) : (
        <form className="personal-mission-form" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-field-label" htmlFor="personal-mission-title">
              {t('missions.form.title')}
            </label>
            <input
              id="personal-mission-title"
              type="text"
              className="modal-input"
              placeholder={t('missions.form.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-field-label" htmlFor="personal-mission-type">
              {t('missions.form.type')}
            </label>
            <select
              id="personal-mission-type"
              className="modal-input"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {personalMissionTemplates.map((tpl) => (
                <option key={tpl.templateId} value={tpl.templateId}>
                  {tpl.title}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-field-label" htmlFor="personal-mission-target">
              {t('missions.form.quantity')}
            </label>
            <input
              id="personal-mission-target"
              type="number"
              min="1"
              className="modal-input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>

          {userSubjects.length > 0 && (
            <div className="modal-field">
              <label className="modal-field-label" htmlFor="personal-mission-subject">
                {t('missions.form.subject')}
              </label>
              <select
                id="personal-mission-subject"
                className="modal-input"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">{t('missions.form.noSubject')}</option>
                {userSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="personal-mission-submit-btn" disabled={!canSubmit}>
            {t('missions.form.submit')}
          </button>
        </form>
      )}
    </Card>
  )
}
