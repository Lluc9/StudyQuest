import { useRef, useState } from 'react'
import Card from '../common/Card'
import AvatarFrame from '../rewards/AvatarFrame'
import { IconUser } from '../common/Icons'
import { languageOptions } from '../../data/settingsData'
import { useApp } from '../../context/AppContext'
import { fileToResizedDataUrl, isFileTooBig } from '../../utils/imageUtils'
import './settings.css'

export default function AccountSettings() {
  const { user, settings, character, t, saveAccountInfo, setAvatar, setSessionActive, restartApp } = useApp()
  const [username, setUsername] = useState(settings.username)
  const [language, setLanguage] = useState(settings.language)
  const [justSaved, setJustSaved] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef(null)

  const isDirty = username !== settings.username || language !== settings.language

  function handleSave(e) {
    e.preventDefault()
    saveAccountInfo({ username, language })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoError('')
    if (isFileTooBig(file)) {
      setPhotoError(t('settings.account.photoTooBig'))
      return
    }
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setAvatar(dataUrl)
    } catch {
      setPhotoError(t('settings.account.photoTooBig'))
    }
  }

  function handleLogout() {
    if (window.confirm(t('settings.account.logoutConfirm'))) {
      setSessionActive(false)
    }
  }

  function handleReset() {
    if (window.confirm(t('settings.account.resetConfirm'))) {
      restartApp()
    }
  }

  return (
    <div className="settings-view">
      <Card className="account-profile-card">
        <div className="account-profile-row">
          <div className="account-avatar-wrap">
            {/* Mateix marc que a Perfil: és el mateix avatar. */}
            <AvatarFrame itemId={character.equipped.marc?.id} />
            <div className="account-avatar">
              {user.avatarDataUrl ? (
                <img src={user.avatarDataUrl} alt="" className="account-avatar-img" />
              ) : (
                <IconUser width={24} height={24} />
              )}
            </div>
            <span className="account-level-badge">{user.level}</span>
          </div>
          <div className="account-profile-info">
            <span className="account-profile-name">{user.name}</span>
            <span className="account-profile-level">
              {user.levelName} · Nivell {user.level}
            </span>
            <span className="account-profile-xp">{user.xpTotal.toLocaleString('ca-ES')} XP acumulats</span>
          </div>
          <div className="account-photo-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="account-photo-input"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              className="settings-btn settings-btn--outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('settings.account.changePhoto')}
            </button>
            {user.avatarDataUrl && (
              <button type="button" className="settings-btn-link" onClick={() => setAvatar(null)}>
                {t('settings.account.removePhoto')}
              </button>
            )}
          </div>
        </div>
        {photoError && <p className="settings-field-error">{photoError}</p>}
      </Card>

      <Card title={t('settings.account.personalInfo')}>
        <form onSubmit={handleSave}>
          <div className="settings-field">
            <label className="settings-field-label" htmlFor="settings-username">
              {t('settings.account.username')}
            </label>
            <input
              id="settings-username"
              className="settings-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="settings-field">
            <label className="settings-field-label" htmlFor="settings-language">
              {t('settings.account.language')}
            </label>
            <select
              id="settings-language"
              className="settings-input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="settings-btn settings-btn--primary" disabled={!isDirty}>
            {justSaved ? t('settings.account.saved') : t('settings.account.save')}
          </button>
        </form>
      </Card>

      <Card title={t('settings.account.accountCard')}>
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-title">{t('settings.account.activeSession')}</span>
            <span className="settings-row-description">{t('settings.account.sessionDevice')}</span>
          </div>
          <span className="settings-badge settings-badge--active">{t('settings.account.active')}</span>
        </div>
        <button
          type="button"
          className="settings-btn settings-btn--danger-outline settings-btn--block"
          onClick={handleLogout}
        >
          {t('settings.account.logout')}
        </button>
      </Card>

      <Card title={t('settings.account.testData')}>
        <div className="settings-row">
          <div className="settings-row-text">
            <span className="settings-row-title">{t('settings.account.resetProgress')}</span>
            <span className="settings-row-description">{t('settings.account.resetDescription')}</span>
          </div>
        </div>
        <button
          type="button"
          className="settings-btn settings-btn--danger-outline settings-btn--block"
          onClick={handleReset}
        >
          {t('settings.account.resetButton')}
        </button>
      </Card>
    </div>
  )
}
