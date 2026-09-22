// Etiquetes de presentació per a la pantalla Recompenses. Els nivells
// viuen a src/utils/levelSystem.js (escala única de l'app) i el catàleg
// de desbloquejos/assoliments a src/data/rewardsCatalog.js. Aquest fitxer
// només tradueix les categories internes a text per a la UI.

// Etiquetes traduïdes amb `t('unlockCategory.<id>')` al component — mai
// hardcoded aquí.
// La categoria 'avatar' va desaparèixer en moure els dos marcs d'avatar al
// Personatge (veure `rewardsCatalog.js`): era l'única categoria que es
// quedava sense cap desbloqueig, i un filtre que no retorna mai res no
// s'ha de poder prémer.
export const unlockCategories = [
  { id: 'tots' },
  { id: 'cosmetic' },
  { id: 'funcio' },
  { id: 'titol' },
  { id: 'insignia' },
]
