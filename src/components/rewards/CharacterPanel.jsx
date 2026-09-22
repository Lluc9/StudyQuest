import Card from '../common/Card'
import CharacterAvatar from './CharacterAvatar'
import AvatarFrame from './AvatarFrame'
import CharacterItemCard from './CharacterItemCard'
import ProgressBar from '../common/ProgressBar'
import { useApp } from '../../context/AppContext'
import './character.css'

/**
 * Pestanya "Personatge" de Recompenses: a l'esquerra el personatge tal com
 * el porta l'usuari ara mateix, a la dreta les peces de cada slot per
 * comprar (amb `xpAvailable`, el mateix saldo que els desbloquejos) i
 * equipar. A diferència de "Desbloquejos", aquí la compra es VEU de
 * seguida al dibuix — és tota la raó de ser d'aquest apartat.
 */
export default function CharacterPanel() {
  const { t, user, character, purchaseCharacterItem, equipCharacterItem } = useApp()
  const { slots, equipped, ownedCount, totalCount } = character

  return (
    <div className="character-panel">
      <Card className="character-preview-card" data-tutorial="tutorial-character">
        <div className="character-preview">
          <div className="character-portrait">
            <AvatarFrame itemId={equipped.marc?.id} />
            <CharacterAvatar equipped={equipped} size={200} />
          </div>
          <span className="character-preview-name">{user.name}</span>
          <span className="character-preview-level">
            {user.levelName} · {t('character.levelShort')} {user.level}
          </span>

          <div className="character-preview-progress">
            <div className="character-preview-progress-row">
              <span className="character-preview-progress-label">{t('character.piecesLabel')}</span>
              <span className="character-preview-progress-value">
                {ownedCount}/{totalCount}
              </span>
            </div>
            <ProgressBar percent={totalCount === 0 ? 0 : Math.round((ownedCount / totalCount) * 100)} />
          </div>

          <div className="character-preview-xp">
            <span className="character-preview-xp-value">{user.xpAvailable.toLocaleString('ca-ES')}</span>
            <span className="character-preview-xp-label">{t('character.availableXp')}</span>
          </div>
        </div>
      </Card>

      <div className="character-slots">
        {slots.map(({ slot, items }) => (
          <section key={slot} className="character-slot">
            <h3 className="character-slot-title">{t(`character.slot.${slot}`)}</h3>
            <div className="character-slot-grid">
              {items.map((item) => (
                <CharacterItemCard
                  key={item.id}
                  item={item}
                  onPurchase={purchaseCharacterItem}
                  onEquip={equipCharacterItem}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
