// Motor del Personatge (Recompenses → Personatge): funcions pures per
// comprar i equipar peces. Mateix plantejament que `rewardsEngine.js` —
// sense dependències de React, es crida des del reducer d'AppContext — i
// de fet en reutilitza `meetsRequirement` perquè "ser elegible" signifiqui
// exactament el mateix aquí que als desbloquejos.
//
// La diferència amb els desbloquejos és que aquí SÍ que cal triar: es
// poden tenir diverses peces del mateix slot i només se'n porta una. Per
// això hi ha `equipped` (una peça per slot) a més d'`ownedItemIds`.

import { meetsRequirement } from './rewardsEngine'
import { CHARACTER_SLOTS, getBaseItemId } from '../data/characterCatalog'

/** Les peces base (`cost: 0`) es consideren sempre en propietat: no
 * s'han de comprar mai i són el punt de partida de cada slot. */
function isOwned(item, ownedItemIds) {
  return item.cost === 0 || ownedItemIds.includes(item.id)
}

/** Vista "resolta" d'una peça per a la UI, amb el mateix vocabulari que
 * `getUnlockDisplay`: `owned`/`eligible`/`canPurchase`, més `equipped`
 * (només el Personatge en té). */
export function getCharacterItemDisplay(item, metrics, ownedItemIds, xpAvailable, equipped) {
  const owned = isOwned(item, ownedItemIds)
  const eligible = meetsRequirement(item, metrics)
  return {
    ...item,
    owned,
    eligible,
    canPurchase: !owned && eligible && xpAvailable >= item.cost,
    // Mai "equipada" una peça que no es té: `resolveEquippedItems` tampoc
    // la dibuixaria, i les dues vistes han de coincidir sempre.
    equipped: owned && equipped[item.slot] === item.id,
  }
}

/**
 * Compra una peça amb `xpAvailable`. Retorna `null` si no es pot (no
 * existeix, és una peça base, ja es té, encara no és elegible o no hi ha
 * prou XP) — el reducer no fa cap canvi en aquest cas.
 *
 * En comprar-la s'equipa automàticament: és l'únic moment en què val la
 * pena decidir per l'usuari, perquè veure el canvi al personatge a
 * l'instant és tot el sentit de la compra. Després ja pot canviar de peça
 * quan vulgui amb `equipCharacterItem`.
 */
export function purchaseCharacterItem(catalog, itemId, metrics, ownedItemIds, xpAvailable, equipped) {
  const item = catalog.find((i) => i.id === itemId)
  if (!item || item.cost === 0) return null
  if (isOwned(item, ownedItemIds)) return null
  if (!meetsRequirement(item, metrics)) return null
  if (xpAvailable < item.cost) return null

  return {
    ownedItemIds: [...ownedItemIds, itemId],
    xpAvailable: xpAvailable - item.cost,
    equipped: { ...equipped, [item.slot]: itemId },
  }
}

/** Equipa una peça que ja es tingui (incloses les base, que permeten
 * tornar enrere). Retorna `null` si no es pot equipar o si ja la porta. */
export function equipCharacterItem(catalog, itemId, ownedItemIds, equipped) {
  const item = catalog.find((i) => i.id === itemId)
  if (!item || !isOwned(item, ownedItemIds)) return null
  if (equipped[item.slot] === itemId) return null

  return { ...equipped, [item.slot]: itemId }
}

/** Peça equipada a cada slot, ja resolta a l'objecte sencer del catàleg
 * (no només l'id) — és el que necessita `CharacterAvatar` per dibuixar.
 * Cau a la peça base sempre que l'slot apunti a una peça que no es pugui
 * dur: inexistent (catàleg canviat sota un estat ja desat) o no comprada. */
export function resolveEquippedItems(catalog, equipped, ownedItemIds) {
  const resolved = {}
  for (const slot of CHARACTER_SLOTS) {
    const item = catalog.find((i) => i.id === equipped[slot] && i.slot === slot)
    const wearable = item && isOwned(item, ownedItemIds) ? item : null
    resolved[slot] = wearable ?? catalog.find((i) => i.id === getBaseItemId(slot)) ?? null
  }
  return resolved
}
