import './avatarFrame.css'

/**
 * Marc decoratiu al voltant d'un avatar. Un sol component per als tres
 * llocs on es veu (el retrat de Recompenses → Personatge, la capçalera de
 * Perfil i Configuració → Compte), en lloc del `.avatar-flame-ring` de CSS
 * que hi havia abans — era un `conic-gradient` desenfocat que es veia com
 * una taca, no com un marc.
 *
 * S'indexa per l'id de la peça del slot `marc` (`data/characterCatalog.js`),
 * mateixa convenció que la resta del personatge.
 *
 * El `viewBox` és de 100x100 i l'avatar ocupa el requadre central
 * (11.5..88.5, és a dir 77 unitats): amb `inset: -15%` al CSS, aquest
 * requadre queda exactament a sobre de l'avatar sigui quina sigui la seva
 * mida, i les flames/cristalls sobresurten pels 11.5 d'orla.
 */

const BOX = { x: 11.5, y: 11.5, size: 77, r: 17 }

// Alçada dels cristalls respecte de l'orla. Els traçats de sota fan 21
// unitats: a 0.42 en fan ~9, prou per sobresortir amb força sense
// sortir-se de l'orla d'11.5 — a escala 1 el marc trepitjava el text del
// voltant.
const DECOR_SCALE = 0.42

// Cristall apuntant amunt: dues cares (una il·luminada i una a l'ombra)
// perquè es llegeixi com un volum tallat i no com un triangle pla. Aquí
// SÍ que van peces soltes i regulars: un cristall és facetat i discret,
// a diferència del foc (veure `buildFirePath`).
const SHARD_LEFT = 'M 0 -21 L -4.5 -7 L 0 0 Z'
const SHARD_RIGHT = 'M 0 -21 L 4.5 -7 L 0 0 Z'

// ---------- Foc ----------
// Primer es va provar amb 16 flames soltes, iguals i equidistants: es
// veien com llumetes o raigs de sol, no com foc. El foc real és una vora
// CONTÍNUA i irregular, així que ara cada capa és un únic traçat tancat
// amb desenes de llengües de mida i inclinació variables, i se'n
// superposen tres. El traçat s'omple cap endins i l'avatar (que sempre té
// fons opac) tapa el centre, de manera que la base del foc mai fa costura
// amb la vora de l'avatar.

/** Soroll determinista [0,1). Mai `Math.random()`: el marc ha de ser
 * idèntic a cada render, si no les flames saltarien a cada repintat. */
function noise(i, seed) {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const round2 = (n) => Math.round(n * 100) / 100

/** Punt sobre una superel·lipse de grau 5 centrada al viewBox. Amb aquest
 * grau la corba segueix gairebé exactament el requadre arrodonit de
 * l'avatar (`BOX`, radi 17), també a les cantonades — amb graus més
 * baixos el foc quedava massa endins just als angles. */
function polar(theta, radius) {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  return [
    round2(50 + Math.sign(c) * Math.abs(c) ** 0.4 * radius),
    round2(50 + Math.sign(s) * Math.abs(s) ** 0.4 * radius),
  ]
}

/** Una capa de foc: llengües encadenades al llarg de tot el perímetre,
 * amb alçada i inclinació variables, com un únic traçat tancat. */
function buildFirePath(count, base, minH, maxH, seed) {
  const step = (Math.PI * 2) / count
  let d = `M ${polar(0, base).join(' ')}`

  for (let i = 0; i < count; i++) {
    const t0 = i * step
    const t1 = t0 + step
    const h = minH + noise(i, seed) * (maxH - minH)
    // Les llengües s'inclinen a banda i banda: una punta centrada i
    // vertical a cada uneix és el que feia que semblessin raigs.
    const peak = t0 + step * (0.5 + (noise(i, seed + 7) - 0.5) * 0.5)

    // Base ampla que s'estreny de pressa cap a la punta: amb els punts de
    // control repartits uniformement sortien dents de serra, no llengües.
    d += ` C ${polar(t0 + step * 0.02, base + h * 0.12).join(' ')}`
    d += ` ${polar(peak - step * 0.08, base + h * 0.88).join(' ')}`
    d += ` ${polar(peak, base + h).join(' ')}`
    d += ` C ${polar(peak + step * 0.07, base + h * 0.8).join(' ')}`
    d += ` ${polar(t1 - step * 0.02, base + h * 0.1).join(' ')}`
    d += ` ${polar(t1, base).join(' ')}`
  }

  return `${d} Z`
}

// Base 37.5 (just per dins del requadre de 38.5) perquè el foc surti de
// SOTA l'avatar, sense costura. Tres capes: llengües altes i vermelles al
// darrere, curtes i grogues al davant — la profunditat és el que acaba de
// fer que es llegeixi com una flama i no com una sanefa.
//
// L'alçada MÍNIMA és deliberadament molt baixa: amb un mínim alt tot el
// perímetre quedava ple i el marc semblava un anell massís. Amb valls que
// cauen per sota de la vora de l'avatar, les llengües se separen soles
// però la base continua sent contínua. El màxim es queda a 12 perquè la
// punta més alta (37.5 + 12) no surti del viewBox.
const FIRE_BACK = buildFirePath(34, 37.5, 1.5, 12, 1)
const FIRE_MID = buildFirePath(43, 37.5, 1, 8, 2)
const FIRE_FRONT = buildFirePath(52, 37.5, 0.5, 5, 3)

/** Punts d'ancoratge al llarg del perímetre del requadre, amb l'angle cap
 * enfora (0 = amunt). Es calculen un sol cop en carregar el mòdul. */
function buildAnchors() {
  const { x, y, size, r } = BOX
  const max = x + size
  const mid = x + size / 2
  const near = x + size * 0.28
  const far = x + size * 0.72
  // Els centres dels quatre arcs de cantonada, per treure'n el punt a 45°.
  const c = r * Math.SQRT1_2

  return [
    { x: near, y, angle: 0, scale: 0.8 },
    { x: mid, y, angle: 0, scale: 1.05 },
    { x: far, y, angle: 0, scale: 0.8 },
    { x: max - r + c, y: y + r - c, angle: 45, scale: 0.9 },
    { x: max, y: near, angle: 90, scale: 0.8 },
    { x: max, y: mid, angle: 90, scale: 1 },
    { x: max, y: far, angle: 90, scale: 0.8 },
    { x: max - r + c, y: max - r + c, angle: 135, scale: 0.9 },
    { x: far, y: max, angle: 180, scale: 0.8 },
    { x: mid, y: max, angle: 180, scale: 1 },
    { x: near, y: max, angle: 180, scale: 0.8 },
    { x: x + r - c, y: max - r + c, angle: 225, scale: 0.9 },
    { x, y: far, angle: 270, scale: 0.8 },
    { x, y: mid, angle: 270, scale: 1 },
    { x, y: near, angle: 270, scale: 0.8 },
    { x: x + r - c, y: y + r - c, angle: 315, scale: 0.9 },
  ]
}

const ANCHORS = buildAnchors()

function FlameFrame() {
  return (
    <svg className="avatar-frame" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        {/* Radials, no lineals: el foc és més calent (clar) a la base,
            arran de l'avatar, i es refreda cap a vermell a les puntes.
            Només es veu del 77% enfora — la resta la tapa l'avatar. */}
        <radialGradient id="sqf-fire-back">
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="84%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        <radialGradient id="sqf-fire-mid">
          <stop offset="72%" stopColor="#fcd34d" />
          <stop offset="88%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
        <radialGradient id="sqf-fire-front">
          <stop offset="74%" stopColor="#fffbeb" />
          <stop offset="89%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#fb923c" />
        </radialGradient>
        <radialGradient id="sqf-flame-glow">
          <stop offset="52%" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="100" height="100" fill="url(#sqf-flame-glow)" />

      {/* Tres durades diferents: en no estar sincronitzades, la silueta
          canvia contínuament i el conjunt parpelleja com una brasa en
          lloc de "respirar" tot alhora. */}
      <path className="avatar-frame-fire" style={{ animationDuration: '1.7s' }} d={FIRE_BACK} fill="url(#sqf-fire-back)" />
      <path
        className="avatar-frame-fire"
        style={{ animationDuration: '1.15s', animationDelay: '-0.4s' }}
        d={FIRE_MID}
        fill="url(#sqf-fire-mid)"
      />
      <path
        className="avatar-frame-fire"
        style={{ animationDuration: '0.85s', animationDelay: '-0.7s' }}
        d={FIRE_FRONT}
        fill="url(#sqf-fire-front)"
      />
    </svg>
  )
}

function CrystalFrame() {
  return (
    <svg className="avatar-frame" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="sqf-shard-light" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
        <linearGradient id="sqf-shard-dark" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <radialGradient id="sqf-shard-glow">
          <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="100" height="100" fill="url(#sqf-shard-glow)" />

      {ANCHORS.map((a, i) => (
        <g
          key={`${a.x}-${a.y}`}
          className="avatar-frame-shard"
          style={{ animationDelay: `${(i % 4) * 0.5}s` }}
          transform={`translate(${a.x} ${a.y}) rotate(${a.angle}) scale(${a.scale * DECOR_SCALE})`}
        >
          <path d={SHARD_LEFT} fill="url(#sqf-shard-dark)" />
          <path d={SHARD_RIGHT} fill="url(#sqf-shard-light)" />
        </g>
      ))}

      <rect
        x={BOX.x}
        y={BOX.y}
        width={BOX.size}
        height={BOX.size}
        rx={BOX.r}
        fill="none"
        stroke="#a5f3fc"
        strokeWidth="1.6"
        opacity="0.9"
      />
    </svg>
  )
}

const FRAMES = {
  m1: FlameFrame,
  m2: CrystalFrame,
}

export default function AvatarFrame({ itemId }) {
  const Frame = FRAMES[itemId]
  return Frame ? <Frame /> : null
}
