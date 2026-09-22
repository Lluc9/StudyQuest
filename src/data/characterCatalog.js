// Catàleg del Personatge (Recompenses → Personatge). Purament dades — la
// lògica de compra/equipament viu a `src/utils/characterEngine.js` i el
// dibuix SVG de cada peça a `components/rewards/CharacterAvatar.jsx`
// (mateixa separació que `rewardsCatalog.js` ↔ `rewardsEngine.js` ↔ la
// taula `ICONS` d'`UnlockCard.jsx`: les dades no saben res de com es
// pinten).
//
// Una peça amb `cost: 0` és la peça BASE del seu slot: mai es compra, es
// té sempre i és la que porta l'usuari d'entrada. La resta es compren amb
// `xpAvailable` (el mateix saldo que els desbloquejos) i cal equipar-les.
//
// `levelRequired` funciona exactament igual que als desbloquejos — de fet
// es comprova amb la mateixa `meetsRequirement` de `rewardsEngine.js`, per
// no tenir dues definicions d'"elegible" que puguin divergir.
//
// Preus: 150 / 350 / 700 XP per als tres graus de cada slot. El primer
// grau és deliberadament barat (una o dues activitats) perquè la primera
// compra arribi aviat — era justament el que demanava l'enquesta d'usuaris
// ("donar-li alguna utilitat més a la XP"). Comprar-ho absolutament tot
// són 4.800 XP, una fita de llarg recorregut.

// Ordre en què es mostren els slots a la pantalla.
export const CHARACTER_SLOTS = ['armadura', 'casc', 'arma', 'fons', 'marc']

export const characterItems = [
  // ---------- Armadura ----------
  {
    id: 'a0',
    slot: 'armadura',
    title: "Túnica d'Iniciat",
    description: 'La roba amb què comença tothom',
    icon: 'user',
    levelRequired: 1,
    cost: 0,
  },
  {
    id: 'a1',
    slot: 'armadura',
    title: 'Cuirassa de Cuir',
    description: 'Cuir reforçat, lleuger i resistent',
    icon: 'shield',
    levelRequired: 2,
    cost: 150,
  },
  {
    id: 'a2',
    slot: 'armadura',
    title: "Malla d'Acer",
    description: 'Cota de malla amb espatlleres',
    icon: 'shield',
    levelRequired: 4,
    cost: 350,
  },
  {
    id: 'a3',
    slot: 'armadura',
    title: 'Armadura Rúnica',
    description: 'Plaques gravades amb runes lluminoses',
    icon: 'diamond',
    levelRequired: 7,
    cost: 700,
  },

  // ---------- Casc ----------
  {
    id: 'c0',
    slot: 'casc',
    title: 'Sense casc',
    description: 'A cara descoberta',
    icon: 'user',
    levelRequired: 1,
    cost: 0,
  },
  {
    id: 'c1',
    slot: 'casc',
    title: "Caputxa d'Estudiós",
    description: 'La caputxa clàssica de biblioteca',
    icon: 'books',
    levelRequired: 2,
    cost: 150,
  },
  {
    id: 'c2',
    slot: 'casc',
    title: 'Elm de Ferro',
    description: 'Elm massís amb protector nasal',
    icon: 'shield',
    levelRequired: 5,
    cost: 350,
  },
  {
    id: 'c3',
    slot: 'casc',
    title: 'Corona del Savi',
    description: "Corona d'or per a qui ja ho ha llegit tot",
    icon: 'crown',
    levelRequired: 8,
    cost: 700,
  },

  // ---------- Arma ----------
  {
    id: 'w0',
    slot: 'arma',
    title: 'Mans buides',
    description: 'Encara no portes res',
    icon: 'user',
    levelRequired: 1,
    cost: 0,
  },
  {
    id: 'w1',
    slot: 'arma',
    title: "Ploma d'Escriba",
    description: 'La primera arma de tot estudiant',
    icon: 'pencil',
    levelRequired: 3,
    cost: 150,
  },
  {
    id: 'w2',
    slot: 'arma',
    title: 'Bastó de Saviesa',
    description: 'Bastó rematat amb una esfera de llum',
    icon: 'zap',
    levelRequired: 5,
    cost: 350,
  },
  {
    id: 'w3',
    slot: 'arma',
    title: 'Espasa del Coneixement',
    description: 'Fulla esmolada a força d’hores d’estudi',
    icon: 'sword',
    levelRequired: 8,
    cost: 700,
  },

  // ---------- Fons ----------
  {
    id: 'f0',
    slot: 'fons',
    title: 'Sense fons',
    description: 'Fons net, sense decoració',
    icon: 'user',
    levelRequired: 1,
    cost: 0,
  },
  {
    id: 'f1',
    slot: 'fons',
    title: 'Aurora Violeta',
    description: 'Resplendor violeta darrere teu',
    icon: 'star',
    levelRequired: 2,
    cost: 150,
  },
  {
    id: 'f2',
    slot: 'fons',
    title: 'Clariana del Bosc',
    description: 'Llum verda filtrada entre els arbres',
    icon: 'sun',
    levelRequired: 4,
    cost: 350,
  },
  {
    id: 'f3',
    slot: 'fons',
    title: 'Cel Estel·lat',
    description: 'Nit clara plena d’estrelles',
    icon: 'moon',
    levelRequired: 7,
    cost: 700,
  },

  // ---------- Marc ----------
  // `m1`/`m2` eren els desbloquejos `u2`/`u6` de `rewardsCatalog.js`
  // ("Marc d'Avatar: Flama"/"Cristall"). S'han mogut aquí perquè eren
  // conceptualment el mateix que aquest sistema; els preus i requisits es
  // mantenen com els tenien. Veure la migració de `ownedUnlockIds` a
  // `AppProvider` (AppContext.jsx) — qui ja els havia comprat no els perd.
  {
    id: 'm0',
    slot: 'marc',
    title: 'Sense marc',
    description: 'Avatar sense decoració al voltant',
    icon: 'user',
    levelRequired: 1,
    cost: 0,
  },
  {
    id: 'm1',
    slot: 'marc',
    title: 'Marc de Flama',
    description: 'Flames vives al voltant del teu avatar',
    icon: 'flame',
    levelRequired: 5,
    cost: 400,
  },
  {
    id: 'm2',
    slot: 'marc',
    title: 'Marc de Cristall',
    description: 'Cristalls tallats que reflecteixen la llum',
    icon: 'diamond',
    levelRequired: 9,
    cost: 700,
  },
]

/** Peça base (`cost: 0`) de cada slot — el que porta un personatge que
 * encara no ha comprat res. */
export function getBaseItemId(slot) {
  return characterItems.find((i) => i.slot === slot && i.cost === 0)?.id ?? null
}

/** Equipament inicial: la peça base de cada slot. S'usa tant per a un
 * usuari nou com per completar un estat persitit al qual li falti algun
 * slot (migració) — veure `AppProvider` a AppContext.jsx. */
export function getDefaultEquipped() {
  return Object.fromEntries(CHARACTER_SLOTS.map((slot) => [slot, getBaseItemId(slot)]))
}
