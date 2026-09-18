import { useState } from 'react'
import Card from '../components/common/Card'
import SubjectSelector from '../components/subjects/SubjectSelector'
import { IconGrid, IconChevronLeft } from '../components/common/Icons'
import { languageOptions } from '../data/settingsData'
import { useApp } from '../context/AppContext'
import './OnboardingPage.css'

const TOTAL_STEPS = 3

/**
 * Assistent de benvinguda de 3 passos, mostrat per `App.jsx` quan
 * `settings.onboardingComplete` és fals (usuari nou, o després de
 * "Reiniciar aplicació" a Configuració → Compte). Substitueix per
 * complet la previsualització aïllada que hi havia abans
 * (`SubjectsSetupPage.jsx`, ja eliminat).
 *
 * Nom i idioma es guarden en local fins al botó final ("Comença"), que
 * despatxa `COMPLETE_ONBOARDING` en un sol pas — és l'únic moment en què
 * es construeix l'estat real de l'usuari (veure `buildFreshState` a
 * AppContext.jsx). Les matèries (pas 3) són l'excepció: reutilitzen
 * directament `SubjectSelector`, que ja escriu a `state.subjects` amb les
 * mateixes accions que fa servir la resta de l'app — no calia inventar
 * cap mecanisme de "selecció pendent de confirmar" a part.
 */
export default function OnboardingPage() {
  const { t, settings, setLanguage, completeOnboarding } = useApp()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')

  const trimmedUsername = username.trim()
  const canAdvanceFromStep1 = trimmedUsername.length > 0

  // Botons normals (no un <form> envoltant tot el pas), a propòsit: el
  // pas 3 renderitza `SubjectSelector`, que ja té el seu propi <form>
  // intern per afegir una matèria — imbricar-hi un altre <form> a sobre
  // feia que un submit del formulari intern (p. ex. l'"Afegeix") es
  // propagués també com a submit del formulari extern, avançant/acabant
  // l'Onboarding sense voler-ho.
  function handleAdvance() {
    if (step === 1 && !canAdvanceFromStep1) return
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      return
    }
    completeOnboarding({ username: trimmedUsername, language: settings.language })
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-wrap">
        <div className="onboarding-brand">
          <div className="onboarding-logo">
            <IconGrid width={20} height={20} />
          </div>
          <span className="onboarding-brand-title">STUDYQUEST</span>
        </div>

        <Card className="onboarding-card">
          <div>
            <span className="onboarding-step-label">{t('onboarding.stepLabel', { n: step, total: TOTAL_STEPS })}</span>

            {step === 1 && (
              <div className="onboarding-step">
                <h1 className="onboarding-step-title">{t('onboarding.step1Title')}</h1>
                <p className="onboarding-step-description">{t('onboarding.step1Description')}</p>
                <div className="settings-field">
                  <label className="settings-field-label" htmlFor="onboarding-username">
                    {t('settings.account.username')}
                  </label>
                  <input
                    id="onboarding-username"
                    className="settings-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdvance()
                    }}
                    placeholder={t('onboarding.usernamePlaceholder')}
                    autoFocus
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="onboarding-step">
                <h1 className="onboarding-step-title">{t('onboarding.step2Title')}</h1>
                <p className="onboarding-step-description">{t('onboarding.step2Description')}</p>
                <div className="settings-field">
                  <label className="settings-field-label" htmlFor="onboarding-language">
                    {t('settings.account.language')}
                  </label>
                  <select
                    id="onboarding-language"
                    className="settings-input"
                    value={settings.language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="onboarding-step">
                <h1 className="onboarding-step-title">{t('onboarding.step3Title')}</h1>
                <p className="onboarding-step-description">{t('onboarding.step3Description')}</p>
                <SubjectSelector />
              </div>
            )}

            <div className="onboarding-actions">
              {step > 1 ? (
                <button type="button" className="settings-btn settings-btn--outline" onClick={() => setStep(step - 1)}>
                  <IconChevronLeft width={14} height={14} />
                  {t('onboarding.back')}
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                className="settings-btn settings-btn--primary"
                disabled={step === 1 && !canAdvanceFromStep1}
                onClick={handleAdvance}
              >
                {step < TOTAL_STEPS ? t('onboarding.next') : t('onboarding.finish')}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
