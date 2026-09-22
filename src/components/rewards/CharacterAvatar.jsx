import './character.css'

/**
 * Dibuix del personatge segons el que porta equipat. Cada peça del catàleg
 * (`data/characterCatalog.js`) té aquí la seva forma SVG, indexada pel seu
 * id — mateixa convenció que la taula `ICONS` d'`UnlockCard.jsx`: les
 * dades porten una clau i el component decideix com es pinta.
 *
 * Capes, de darrere cap endavant: fons → arma → pit → braços → detalls →
 * espatlleres → mà que agafa l'arma → coll → casc (darrere) → cap → cara
 * → casc (davant). L'arma va abans del cos i la mà després, que és el que
 * fa que sembli AGAFADA i no enganxada al costat.
 *
 * Dues decisions que fan que no sembli un dibuix pla:
 * - Tot material té degradat (llum a dalt a l'esquerra, ombra a baix a la
 *   dreta) en lloc d'un color pla.
 * - Cada armadura canvia la SILUETA (espatlleres, cinturons), no només el
 *   color: és el que permet reconèixer de cop què s'ha comprat.
 *
 * Els colors són fixos (no tokens CSS) a propòsit: són materials del
 * personatge —cuir, acer, or— que han de llegir-se igual amb el tema clar
 * i amb el fosc, no acompanyar el color d'accent de la interfície.
 */

// Silueta del pit, retallada pel marge inferior del viewBox. Compartida
// per totes les armadures (i pel `clipPath` que manté els seus detalls
// dins del cos).
const CHEST =
  'M 100 104 C 84 104, 72 109, 66 120 C 62 128, 60 142, 59 158 L 57 200 L 143 200 L 141 158 C 140 142, 138 128, 134 120 C 128 109, 116 104, 100 104 Z'
const ARM_RIGHT = 'M 136 116 C 149 120, 156 133, 158 150 L 160 200 L 140 200 L 138 150 Z'
const ARM_LEFT = 'M 64 116 C 51 120, 44 133, 42 150 L 40 200 L 60 200 L 62 150 Z'

// Estrelles del fons "Cel Estel·lat" — posicions fixes (mai aleatòries:
// han de ser idèntiques a cada render, sense saltar entre repintats).
const STARS = [
  { x: 26, y: 30, r: 1.9, o: 0.95 },
  { x: 48, y: 58, r: 1.1, o: 0.65 },
  { x: 36, y: 100, r: 1.5, o: 0.8 },
  { x: 172, y: 24, r: 1.7, o: 0.9 },
  { x: 150, y: 54, r: 1, o: 0.6 },
  { x: 182, y: 82, r: 1.4, o: 0.85 },
  { x: 92, y: 18, r: 1.3, o: 0.75 },
  { x: 126, y: 36, r: 1, o: 0.6 },
  { x: 68, y: 16, r: 1.6, o: 0.9 },
  { x: 164, y: 124, r: 1.2, o: 0.7 },
  { x: 14, y: 62, r: 1.2, o: 0.7 },
  { x: 112, y: 62, r: 0.9, o: 0.5 },
]

function Defs() {
  return (
    <defs>
      <linearGradient id="sqc-skin" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#f2c9a0" />
        <stop offset="100%" stopColor="#d79a6b" />
      </linearGradient>
      <linearGradient id="sqc-hair" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#513a2d" />
        <stop offset="100%" stopColor="#2a1c16" />
      </linearGradient>
      <linearGradient id="sqc-cloth" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#62607d" />
        <stop offset="100%" stopColor="#3a3950" />
      </linearGradient>
      <linearGradient id="sqc-cloth-dark" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#4a4864" />
        <stop offset="100%" stopColor="#2b2a3c" />
      </linearGradient>
      <linearGradient id="sqc-leather" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#b87a44" />
        <stop offset="100%" stopColor="#70471f" />
      </linearGradient>
      <linearGradient id="sqc-leather-dark" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#8a5a30" />
        <stop offset="100%" stopColor="#4e3015" />
      </linearGradient>
      <linearGradient id="sqc-steel" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#c3cddc" />
        <stop offset="55%" stopColor="#93a0b4" />
        <stop offset="100%" stopColor="#5f6b7e" />
      </linearGradient>
      <linearGradient id="sqc-steel-dark" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#8c99ad" />
        <stop offset="100%" stopColor="#4c5768" />
      </linearGradient>
      <linearGradient id="sqc-plate" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#7d6ac0" />
        <stop offset="100%" stopColor="#3a2f6b" />
      </linearGradient>
      <linearGradient id="sqc-plate-dark" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#5c4c97" />
        <stop offset="100%" stopColor="#2a2150" />
      </linearGradient>
      <linearGradient id="sqc-gold" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#a16207" />
      </linearGradient>
      <linearGradient id="sqc-wood" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#a9763f" />
        <stop offset="100%" stopColor="#5b3a1c" />
      </linearGradient>
      <linearGradient id="sqc-blade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7e8ca1" />
        <stop offset="45%" stopColor="#eef2f7" />
        <stop offset="100%" stopColor="#8c98ac" />
      </linearGradient>
      <linearGradient id="sqc-feather" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#cbc5b4" />
      </linearGradient>

      {/* Cota de malla: anelles entrellaçades de debò, no punts solts —
          és el que fa que es reconegui com a malla d'un cop d'ull. */}
      <pattern id="sqc-mail" width="9" height="9" patternUnits="userSpaceOnUse">
        <rect width="9" height="9" fill="#77839a" />
        <circle cx="2.25" cy="2.25" r="2.4" fill="none" stroke="#a7b3c6" strokeWidth="1.1" />
        <circle cx="6.75" cy="6.75" r="2.4" fill="none" stroke="#a7b3c6" strokeWidth="1.1" />
        <circle cx="6.75" cy="2.25" r="2.4" fill="none" stroke="#5e6a7e" strokeWidth="1.1" />
        <circle cx="2.25" cy="6.75" r="2.4" fill="none" stroke="#5e6a7e" strokeWidth="1.1" />
      </pattern>

      <filter id="sqc-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <clipPath id="sqc-chest">
        <path d={CHEST} />
      </clipPath>
    </defs>
  )
}

const BACKGROUNDS = {
  f0: null,
  f1: (
    <>
      <defs>
        <radialGradient id="sqc-f1" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.62" />
          <stop offset="62%" stopColor="#7c3aed" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id="sqc-f1-band" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0" />
          <stop offset="50%" stopColor="#e9d5ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#sqc-f1)" />
      <path d="M -10 58 C 40 30, 90 72, 140 44 C 170 28, 195 40, 210 34 L 210 54 C 190 60, 168 50, 140 64 C 92 88, 42 52, -10 78 Z" fill="url(#sqc-f1-band)" />
      <path d="M -10 96 C 44 74, 86 110, 136 86 C 172 68, 196 82, 210 76 L 210 90 C 192 96, 172 86, 140 100 C 96 120, 46 92, -10 112 Z" fill="url(#sqc-f1-band)" opacity="0.6" />
    </>
  ),
  f2: (
    <>
      <defs>
        <linearGradient id="sqc-f2-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#10b981" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="sqc-f2-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#sqc-f2-sky)" />
      {/* Arbres llunyans (més clars) i propers (més foscos): dos plans de
          profunditat, no una silueta plana. */}
      <path d="M 46 200 L 46 76 Q 52 62, 58 76 L 58 200 Z" fill="#065f46" opacity="0.35" />
      <path d="M 146 200 L 146 88 Q 152 74, 158 88 L 158 200 Z" fill="#065f46" opacity="0.3" />
      <path d="M 10 200 L 10 52 Q 20 30, 30 52 L 30 200 Z" fill="#022c22" opacity="0.62" />
      <path d="M 170 200 L 170 64 Q 180 42, 190 64 L 190 200 Z" fill="#022c22" opacity="0.55" />
      <path d="M 64 0 L 96 0 L 70 200 L 48 200 Z" fill="url(#sqc-f2-ray)" />
      <path d="M 118 0 L 138 0 L 150 200 L 128 200 Z" fill="url(#sqc-f2-ray)" opacity="0.7" />
    </>
  ),
  f3: (
    <>
      <defs>
        <linearGradient id="sqc-f3-sky" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="55%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0b1026" />
        </linearGradient>
        <radialGradient id="sqc-f3-moon">
          <stop offset="40%" stopColor="#f8fafc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#sqc-f3-sky)" />
      <circle cx="158" cy="40" r="26" fill="url(#sqc-f3-moon)" />
      <circle cx="158" cy="40" r="12" fill="#eef2ff" />
      <circle cx="152" cy="36" r="3" fill="#cbd5e1" opacity="0.7" />
      <circle cx="162" cy="45" r="2" fill="#cbd5e1" opacity="0.6" />
      {STARS.map((s) => (
        <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} fill="#e0e7ff" opacity={s.o} />
      ))}
    </>
  ),
}

// Cada armadura pinta el pit, els braços i les seves espatlleres. Es
// defineix sencera (en lloc d'un cos comú + detalls) justament perquè
// pugui canviar la silueta de les espatlles, que és el que més ajuda a
// reconèixer-la.
const ARMORS = {
  a0: (
    <>
      <path d={ARM_LEFT} fill="url(#sqc-cloth-dark)" />
      <path d={ARM_RIGHT} fill="url(#sqc-cloth-dark)" />
      <path d={CHEST} fill="url(#sqc-cloth)" />
      <g clipPath="url(#sqc-chest)">
        {/* Plecs de la tela */}
        <path d="M 78 120 C 74 146, 74 172, 76 200" stroke="#33324a" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 122 120 C 126 146, 126 172, 124 200" stroke="#33324a" strokeWidth="2" fill="none" opacity="0.6" />
        {/* Cordó a la cintura */}
        <path d="M 52 168 Q 100 178, 148 168 L 148 176 Q 100 186, 52 176 Z" fill="#8a7b5c" />
        <circle cx="100" cy="180" r="4" fill="#6f6247" />
      </g>
      <path d="M 100 104 L 88 126 L 100 136 L 112 126 Z" fill="#2f2e42" />
    </>
  ),
  a1: (
    <>
      <path d={ARM_LEFT} fill="url(#sqc-leather-dark)" />
      <path d={ARM_RIGHT} fill="url(#sqc-leather-dark)" />
      <path d={CHEST} fill="url(#sqc-leather)" />
      <g clipPath="url(#sqc-chest)">
        {/* Pitrera cosida */}
        <path d="M 66 124 L 134 124 L 138 162 L 62 162 Z" fill="#9c6535" />
        <path d="M 100 124 L 100 162" stroke="#5c3a1c" strokeWidth="2.2" />
        <path d="M 72 130 L 72 156 M 128 130 L 128 156" stroke="#5c3a1c" strokeWidth="1.4" strokeDasharray="3 3" />
        {/* Cinturó ample amb sivella */}
        <rect x="40" y="164" width="120" height="18" fill="url(#sqc-leather-dark)" />
        <rect x="40" y="164" width="120" height="3" fill="#c08a52" opacity="0.5" />
        <rect x="88" y="160" width="24" height="26" rx="4" fill="url(#sqc-gold)" />
        <rect x="95" y="168" width="10" height="10" rx="2" fill="#7a4e12" />
      </g>
      {/* Corretges a les espatlles */}
      <path d="M 70 114 C 80 122, 86 132, 88 142 L 78 146 C 74 134, 68 126, 60 120 Z" fill="url(#sqc-leather-dark)" />
      <path d="M 130 114 C 120 122, 114 132, 112 142 L 122 146 C 126 134, 132 126, 140 120 Z" fill="url(#sqc-leather-dark)" />
      <path d="M 100 104 L 89 124 L 100 133 L 111 124 Z" fill="#5c3a1c" />
    </>
  ),
  a2: (
    <>
      <path d={ARM_LEFT} fill="url(#sqc-steel-dark)" />
      <path d={ARM_RIGHT} fill="url(#sqc-steel-dark)" />
      <path d={CHEST} fill="url(#sqc-mail)" />
      <g clipPath="url(#sqc-chest)">
        {/* Ombra als costats, perquè la malla no quedi plana */}
        <path d="M 59 120 L 74 120 L 70 200 L 57 200 Z" fill="#2c3341" opacity="0.35" />
        <path d="M 141 120 L 126 120 L 130 200 L 143 200 Z" fill="#2c3341" opacity="0.45" />
        <rect x="40" y="166" width="120" height="14" fill="url(#sqc-leather-dark)" />
      </g>
      {/* Espatlleres d'acer amb reblons */}
      <path d="M 58 116 C 72 112, 82 118, 84 130 C 74 138, 60 138, 50 130 C 50 122, 52 118, 58 116 Z" fill="url(#sqc-steel)" />
      <path d="M 142 116 C 128 112, 118 118, 116 130 C 126 138, 140 138, 150 130 C 150 122, 148 118, 142 116 Z" fill="url(#sqc-steel)" />
      <circle cx="60" cy="126" r="2.2" fill="#4c5768" />
      <circle cx="74" cy="124" r="2.2" fill="#4c5768" />
      <circle cx="140" cy="126" r="2.2" fill="#4c5768" />
      <circle cx="126" cy="124" r="2.2" fill="#4c5768" />
      <path d="M 100 104 L 89 124 L 100 133 L 111 124 Z" fill="#4c5768" />
    </>
  ),
  a3: (
    <>
      <path d={ARM_LEFT} fill="url(#sqc-plate-dark)" />
      <path d={ARM_RIGHT} fill="url(#sqc-plate-dark)" />
      <path d={CHEST} fill="url(#sqc-plate)" />
      <g clipPath="url(#sqc-chest)">
        <path d="M 66 122 L 134 122 L 137 160 L 63 160 Z" fill="#6b59b0" />
        <path d="M 63 158 L 137 158 L 138 166 L 62 166 Z" fill="url(#sqc-gold)" />
        <rect x="40" y="172" width="120" height="10" fill="url(#sqc-gold)" opacity="0.9" />
        <g filter="url(#sqc-glow)">
          <circle cx="100" cy="138" r="12" fill="none" stroke="#67e8f9" strokeWidth="2.6" />
          <path d="M 100 128 L 100 148 M 90 138 L 110 138" stroke="#67e8f9" strokeWidth="2.6" />
          <path d="M 74 188 L 80 180 L 86 188" stroke="#67e8f9" strokeWidth="2.2" fill="none" />
          <path d="M 114 188 L 120 180 L 126 188" stroke="#67e8f9" strokeWidth="2.2" fill="none" />
        </g>
      </g>
      {/* Espatlleres angulars amb caire d'or */}
      <path d="M 60 112 C 76 108, 88 116, 90 130 L 76 142 C 66 138, 54 134, 46 128 C 48 118, 52 114, 60 112 Z" fill="url(#sqc-plate)" />
      <path d="M 140 112 C 124 108, 112 116, 110 130 L 124 142 C 134 138, 146 134, 154 128 C 152 118, 148 114, 140 112 Z" fill="url(#sqc-plate)" />
      <path d="M 46 128 C 54 134, 66 138, 76 142 L 74 148 C 62 144, 50 138, 44 132 Z" fill="url(#sqc-gold)" />
      <path d="M 154 128 C 146 134, 134 138, 124 142 L 126 148 C 138 144, 150 138, 156 132 Z" fill="url(#sqc-gold)" />
      <path d="M 100 102 L 87 124 L 100 134 L 113 124 Z" fill="url(#sqc-gold)" />
    </>
  ),
}

// Els cascs es parteixen en `back` (darrere el cap) i `front` (al davant),
// perquè una caputxa necessita tela per darrere i vora per davant amb el
// mateix cap enmig. `hidesHair` evita cabells sota un casc que els taparia.
const HELMETS = {
  c0: { hidesHair: false },
  c1: {
    hidesHair: true,
    back: (
      <>
        <path d="M 58 126 C 50 74, 66 40, 100 40 C 134 40, 150 74, 142 126 Z" fill="url(#sqc-cloth-dark)" />
        <path d="M 58 126 C 54 100, 56 78, 62 60 C 56 80, 54 104, 58 126 Z" fill="#232234" />
      </>
    ),
    front: (
      <>
        {/* La vora ha de ser tan fosca com la resta de la tela: amb un to
            clar semblava una cinta al cap, no una caputxa. El relleu el fa
            el filet de llum de sobre, no un canvi de color. */}
        <path d="M 69 72 C 71 46, 129 46, 131 72 C 126 56, 74 56, 69 72 Z" fill="url(#sqc-cloth-dark)" />
        <path d="M 71 68 C 74 50, 126 50, 129 68" stroke="#7a7799" strokeWidth="1.8" fill="none" opacity="0.6" />
        {/* Ombra que la caputxa projecta sobre el front */}
        <path d="M 74 60 C 82 56, 118 56, 126 60 C 116 66, 84 66, 74 60 Z" fill="#1b1a29" opacity="0.4" />
        <path d="M 72 64 C 74 82, 70 104, 62 122 L 52 118 C 60 100, 64 82, 64 64 Z" fill="url(#sqc-cloth-dark)" />
        <path d="M 128 64 C 126 82, 130 104, 138 122 L 148 118 C 140 100, 136 82, 136 64 Z" fill="url(#sqc-cloth)" />
      </>
    ),
  },
  c2: {
    hidesHair: true,
    front: (
      <>
        {/* La vora de l'elm ha de quedar JUST per sobre dels ulls (y≈70),
            si no el personatge sembla portar un cubell. */}
        <path d="M 98 20 L 102 20 L 102 38 L 98 38 Z" fill="#7f1d1d" />
        <path d="M 96 24 C 92 30, 92 36, 96 40 L 104 40 C 108 36, 108 30, 104 24 Z" fill="#b91c1c" />
        <path d="M 75 64 C 75 38, 125 38, 125 64 Z" fill="url(#sqc-steel)" />
        <path d="M 75 64 C 75 44, 90 38, 100 38 C 88 42, 80 50, 79 64 Z" fill="#dbe3ee" opacity="0.5" />
        <rect x="70" y="58" width="60" height="9" rx="4" fill="url(#sqc-steel-dark)" />
        <path d="M 96 64 L 104 64 L 103 94 C 103 97, 97 97, 97 94 Z" fill="url(#sqc-steel)" />
        {/* Galteres */}
        <path d="M 74 64 C 74 78, 78 88, 82 94 L 74 96 C 68 86, 66 74, 68 64 Z" fill="url(#sqc-steel-dark)" />
        <path d="M 126 64 C 126 78, 122 88, 118 94 L 126 96 C 132 86, 134 74, 132 64 Z" fill="url(#sqc-steel-dark)" />
        <circle cx="78" cy="62" r="1.8" fill="#4c5768" />
        <circle cx="122" cy="62" r="1.8" fill="#4c5768" />
      </>
    ),
  },
  c3: {
    hidesHair: false,
    front: (
      <>
        <path d="M 74 52 L 80 28 L 90 44 L 100 22 L 110 44 L 120 28 L 126 52 Z" fill="url(#sqc-gold)" />
        <path d="M 74 52 L 80 28 L 90 44 L 100 22 L 110 44 L 120 28 L 126 52 Z" fill="none" stroke="#a16207" strokeWidth="1.2" />
        <rect x="72" y="50" width="56" height="12" rx="4" fill="url(#sqc-gold)" />
        <rect x="72" y="50" width="56" height="3" rx="1.5" fill="#fef3c7" opacity="0.7" />
        <circle cx="100" cy="56" r="4" fill="#22d3ee" />
        <circle cx="99" cy="55" r="1.4" fill="#cffafe" />
        <circle cx="84" cy="56" r="2.8" fill="#ef4444" />
        <circle cx="116" cy="56" r="2.8" fill="#ef4444" />
        <circle cx="100" cy="24" r="3" fill="#fef3c7" />
      </>
    ),
  },
}

const WEAPONS = {
  w0: null,
  w1: (
    <>
      <path d="M 154 196 L 174 118" stroke="url(#sqc-wood)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 176 108 C 190 126, 186 156, 166 170 C 162 146, 167 124, 176 108 Z" fill="url(#sqc-feather)" />
      <path d="M 176 112 C 172 132, 169 152, 167 166" stroke="#a8a291" strokeWidth="1.4" fill="none" />
      <path d="M 174 122 L 182 126 M 172 134 L 181 139 M 170 146 L 178 151 M 169 156 L 175 161" stroke="#bdb7a6" strokeWidth="1" />
    </>
  ),
  w2: (
    <>
      <rect x="160" y="62" width="8.5" height="138" rx="4" fill="url(#sqc-wood)" />
      <path d="M 162 70 L 162 196" stroke="#c99a61" strokeWidth="1.2" opacity="0.5" />
      <g filter="url(#sqc-glow)">
        <circle cx="164" cy="52" r="15" fill="#22d3ee" opacity="0.35" />
        <circle cx="164" cy="52" r="9" fill="#a5f3fc" />
        <circle cx="161" cy="49" r="3" fill="#ffffff" opacity="0.9" />
      </g>
      <path d="M 156 62 C 160 56, 168 56, 172 62 C 168 66, 160 66, 156 62 Z" fill="url(#sqc-gold)" />
    </>
  ),
  w3: (
    <>
      <path d="M 164 22 L 172 42 L 172 140 L 156 140 L 156 42 Z" fill="url(#sqc-blade)" />
      <path d="M 164 30 L 164 136" stroke="#6f7c90" strokeWidth="1.6" opacity="0.65" />
      <path d="M 140 140 L 188 140 L 186 150 L 142 150 Z" fill="url(#sqc-gold)" />
      <rect x="158" y="150" width="13" height="34" rx="5" fill="url(#sqc-leather-dark)" />
      <path d="M 158 156 L 171 160 M 158 166 L 171 170 M 158 176 L 171 180" stroke="#3f2711" strokeWidth="1.4" />
      <circle cx="164.5" cy="189" r="7" fill="url(#sqc-gold)" />
      <circle cx="162.5" cy="187" r="2" fill="#fef3c7" opacity="0.8" />
    </>
  ),
}

export default function CharacterAvatar({ equipped, size = 200 }) {
  const helmet = HELMETS[equipped.casc?.id] ?? HELMETS.c0
  const weaponId = equipped.arma?.id ?? 'w0'
  const holdsWeapon = weaponId !== 'w0'

  return (
    <svg
      className="character-avatar"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
    >
      <Defs />

      {BACKGROUNDS[equipped.fons?.id] ?? null}
      {WEAPONS[weaponId] ?? null}

      {ARMORS[equipped.armadura?.id] ?? ARMORS.a0}

      {/* La mà va DESPRÉS de l'arma: és el que fa que sembli agafada. */}
      {holdsWeapon && (
        <>
          <ellipse cx="161" cy="168" rx="11" ry="8.5" fill="url(#sqc-skin)" />
          <path d="M 153 164 C 158 162, 166 162, 170 165" stroke="#c98d5f" strokeWidth="1.3" fill="none" />
          <path d="M 154 170 C 159 172, 166 172, 169 170" stroke="#c98d5f" strokeWidth="1.3" fill="none" />
        </>
      )}

      {/* Coll amb ombra sota la barbeta */}
      <path d="M 89 84 L 111 84 L 111 106 L 89 106 Z" fill="#c98d5f" />
      <path d="M 89 84 L 111 84 L 111 92 C 104 98, 96 98, 89 92 Z" fill="#a9753f" opacity="0.55" />

      {helmet.back ?? null}

      {/* Cap */}
      <ellipse cx="76" cy="74" rx="5.5" ry="7" fill="url(#sqc-skin)" />
      <ellipse cx="124" cy="74" rx="5.5" ry="7" fill="url(#sqc-skin)" />
      <ellipse cx="100" cy="70" rx="23" ry="25.5" fill="url(#sqc-skin)" />

      {/* Creixent de cabell: la corba INTERIOR ha de quedar clarament per
          sota de l'exterior (y 56 contra 45), si no el gruix surt gairebé
          zero i el personatge sembla calb. S'atura als 56 per no trepitjar
          les celles (y≈59). */}
      {!helmet.hidesHair && (
        <path d="M 77 68 C 76 38, 124 38, 123 68 C 121 60, 114 56, 100 56 C 86 56, 79 60, 77 68 Z" fill="url(#sqc-hair)" />
      )}

      {/* Cara */}
      <path d="M 85 62 C 88 59, 93 59, 96 61" stroke="#8a5a38" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 104 61 C 107 59, 112 59, 115 62" stroke="#8a5a38" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="91" cy="71" rx="3" ry="3.6" fill="#2f2a33" />
      <ellipse cx="109" cy="71" rx="3" ry="3.6" fill="#2f2a33" />
      <circle cx="92" cy="69.5" r="1.1" fill="#ffffff" opacity="0.9" />
      <circle cx="110" cy="69.5" r="1.1" fill="#ffffff" opacity="0.9" />
      <path d="M 100 74 L 101.5 80 L 98.5 80 Z" fill="#c98d5f" opacity="0.65" />
      <path d="M 93 86 Q 100 91, 107 86" stroke="#9c5f38" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="82" cy="79" rx="4.5" ry="3" fill="#e8926f" opacity="0.22" />
      <ellipse cx="118" cy="79" rx="4.5" ry="3" fill="#e8926f" opacity="0.22" />

      {helmet.front ?? null}
    </svg>
  )
}
