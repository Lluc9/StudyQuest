import { useState } from 'react'
import Card from '../common/Card'
import { IconCheckCircle, IconPlus, IconX } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './subjects.css'

/**
 * Interfície mínima per triar les matèries de l'usuari: matèries
 * predeterminades (només seleccionables, no editables) + matèries
 * personalitzades (afegir/eliminar). Es fa servir tant al pas 3 de
 * l'Onboarding (`OnboardingPage.jsx`) com, més endavant, si es vol tornar
 * a editar les matèries des d'algun altre lloc.
 */
export default function SubjectSelector() {
  const { t, subjects, toggleDefaultSubject, addCustomSubject, removeCustomSubject } = useApp()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!newSubjectName.trim()) return
    addCustomSubject(newSubjectName)
    setNewSubjectName('')
    setShowAddForm(false)
  }

  return (
    <Card title={t('subjects.title')} headerRight={t('subjects.selectedCount', { n: subjects.userSubjects.length })}>
      <p className="subjects-caption">{t('subjects.caption')}</p>

      <div className="subjects-grid">
        {subjects.catalog.map((subject) => {
          const isSelected = subjects.selectedDefaultIds.includes(subject.id)
          return (
            <button
              key={subject.id}
              type="button"
              className={`subject-chip${isSelected ? ' is-selected' : ''}`}
              style={{ '--subject-color': subject.color }}
              aria-pressed={isSelected}
              onClick={() => toggleDefaultSubject(subject.id)}
            >
              {isSelected && <IconCheckCircle width={14} height={14} />}
              <span>{subject.name}</span>
            </button>
          )
        })}
      </div>

      {subjects.custom.length > 0 && (
        <div className="subjects-custom-list">
          {subjects.custom.map((subject) => (
            <span key={subject.id} className="subject-chip subject-chip--custom is-selected">
              <span>{subject.name}</span>
              <button
                type="button"
                className="subject-chip-remove"
                aria-label={t('subjects.removeAria', { name: subject.name })}
                onClick={() => removeCustomSubject(subject.id)}
              >
                <IconX width={12} height={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {showAddForm ? (
        <form className="subjects-add-form" onSubmit={handleAddSubmit}>
          <input
            type="text"
            className="subjects-add-input"
            placeholder={t('subjects.addPlaceholder')}
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="subjects-add-confirm">
            {t('subjects.addConfirm')}
          </button>
          <button
            type="button"
            className="subjects-add-cancel"
            onClick={() => {
              setShowAddForm(false)
              setNewSubjectName('')
            }}
          >
            {t('subjects.addCancel')}
          </button>
        </form>
      ) : (
        <button type="button" className="subjects-add-trigger" onClick={() => setShowAddForm(true)}>
          <IconPlus width={14} height={14} />
          {t('subjects.addTrigger')}
        </button>
      )}
    </Card>
  )
}
