import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'
import { IconBooks } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './profile.css'

export default function SubjectDistribution({ subjects }) {
  const { t } = useApp()
  return (
    <Card title={t('profile.subjectDistribution')} icon={<IconBooks width={14} height={14} />}>
      {subjects.length === 0 ? (
        <p className="profile-empty-state">{t('profile.emptySubjects')}</p>
      ) : (
        <ul className="subject-distribution-list">
          {subjects.map((subject) => (
            <li key={subject.id} className="subject-distribution-row">
              <div className="subject-distribution-top">
                <span className="subject-distribution-label">{subject.label}</span>
                <span className="subject-distribution-value">
                  {subject.hours}h · {subject.percent}%
                </span>
              </div>
              <ProgressBar percent={subject.percent} colorVar={subject.color} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
