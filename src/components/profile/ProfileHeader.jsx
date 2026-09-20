import Card from '../common/Card'
import ProfileStats from './ProfileStats'
import { IconUser, IconFlame, IconZap, IconCalendar } from '../common/Icons'
import { useApp } from '../../context/AppContext'
import './profile.css'

// Id del desbloqueig "Marc d'Avatar: Flama" a `data/rewardsCatalog.js` —
// un cop comprat (`ownedUnlockIds`), s'aplica sol, sense cap "equipar"
// separat (encara és l'únic marc implementat).
const AVATAR_FLAME_UNLOCK_ID = 'u2'

// Colors dels indicadors de `ProfileStats` — purament de presentació (no
// és una dada de l'estat), per això es defineix aquí en lloc d'a AppContext.
export default function ProfileHeader() {
  const { user, streak, profile, unlocks, t } = useApp()
  const hasAvatarFlame = unlocks.find((u) => u.id === AVATAR_FLAME_UNLOCK_ID)?.owned ?? false

  const stats = [
    { id: 'tasksCompleted', label: t('profile.stat.tasksCompleted'), color: 'green', value: String(profile.stats.tasksCompleted) },
    { id: 'hoursTotal', label: t('profile.stat.hoursTotal'), color: 'cyan', value: `${profile.stats.hoursTotal}h` },
    {
      id: 'achievements',
      label: t('profile.stat.achievements'),
      color: 'purple',
      value: `${profile.stats.achievementsUnlocked}/${profile.stats.achievementsTotal}`,
    },
    { id: 'maxStreak', label: t('profile.stat.maxStreak'), color: 'red', value: `${profile.stats.maxStreak}d` },
  ]

  return (
    <Card className="profile-header-card">
      <div className="profile-header-top">
        <div className="profile-header-identity">
          <div className="profile-avatar-wrap">
            {hasAvatarFlame && <div className="avatar-flame-ring" />}
            <div className="profile-avatar">
              <IconUser width={26} height={26} />
            </div>
            <span className="profile-level-badge">{user.level}</span>
          </div>

          <div>
            <h2 className="profile-name">{user.name}</h2>
            <span className="profile-level-title">
              {user.levelName} · Nivell {user.level}
            </span>
            <div className="profile-meta-row">
              <span className="profile-meta-item">
                <IconFlame width={13} height={13} className="profile-meta-icon profile-meta-icon--orange" />
                {t('profile.streakLabel')} {streak.currentDays} dies
              </span>
              <span className="profile-meta-item">
                <IconZap width={13} height={13} className="profile-meta-icon profile-meta-icon--yellow" />
                XP: {user.xpTotal.toLocaleString('ca-ES')}
              </span>
              <span className="profile-meta-item">
                <IconCalendar width={13} height={13} className="profile-meta-icon" />
                {t('profile.memberSince')} {profile.memberSince}
              </span>
            </div>
          </div>
        </div>

        <ProfileStats stats={stats} />
      </div>
    </Card>
  )
}
