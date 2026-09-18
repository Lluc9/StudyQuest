// Iconos SVG minimalistas, estilo "stroke", inspirados en feather-icons.
// Se implementan a mano para no depender de ninguna librería de iconos externa.

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconGrid(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  )
}

export function IconTarget(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

export function IconGift(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <path d="M3 9h18v0" />
      <path d="M12 9v12" />
      <path d="M12 9C9.5 9 8 7.5 8 5.8 8 4.3 9 3 10.3 3 12 3 12 6 12 9Z" />
      <path d="M12 9c2.5 0 4-1.5 4-3.2C16 4.3 15 3 13.7 3 12 3 12 6 12 9Z" />
    </svg>
  )
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

export function IconFlame(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 22c4.2 0 7-2.8 7-6.7 0-3-1.8-5-3-6.8.2 2-1 3-1.8 2.3-1-.9-.3-3-1-5.3C12.5 2.7 10 5.5 10 8.5c0 1.3.6 2.1 1 2.7-1.7-.4-3-2-3.5-3.7C6.3 9 5 11.4 5 14c0 4.5 3 8 7 8Z" />
    </svg>
  )
}

export function IconTrophy(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a3 3 0 0 0 3 5" />
      <path d="M16 5h3a3 3 0 0 1-3 5" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M10 16h4l.5 4h-5l.5-4Z" />
    </svg>
  )
}

export function IconZap(props) {
  return (
    <svg {...base} {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  )
}

export function IconStar(props) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.3-.6L12 3Z" />
    </svg>
  )
}

export function IconCheckCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.2 2.2L16 10" />
    </svg>
  )
}

export function IconClock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function IconCheckboxEmpty(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    </svg>
  )
}

export function IconCheckboxChecked(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  )
}

export function IconChevronLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

export function IconChevronRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}

export function IconLock(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function IconFilter(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16l-6 7.5V19l-4 2v-8.5L4 5Z" />
    </svg>
  )
}

export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
    </svg>
  )
}

export function IconDiamond(props) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 6 6-6 12-6-12 6-6Z" />
      <path d="M6 9h12" />
    </svg>
  )
}

export function IconSword(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 3.5 20 9l-9 9-3-3-4 4v-3l4-4-3-3 9-9Z" />
      <path d="m4 20 3-3" />
    </svg>
  )
}

export function IconMoon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
    </svg>
  )
}

export function IconSun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  )
}

export function IconBooks(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="6" height="16" rx="1" />
      <rect x="10" y="7" width="6" height="13" rx="1" />
      <path d="M17 6h3v14h-3" />
    </svg>
  )
}

export function IconBuilding(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 21h16" />
      <path d="M5 21V10l7-6 7 6v11" />
      <path d="M9 21v-7h6v7" />
    </svg>
  )
}

export function IconCrown(props) {
  return (
    <svg {...base} {...props}>
      <path d="m3 8 4 3 5-6 5 6 4-3-2 10H5L3 8Z" />
      <path d="M5 21h14" />
    </svg>
  )
}

export function IconSettings(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.09a1.65 1.65 0 0 1-1 1.51 1.65 1.65 0 0 1-1.82-.33l-.06-.06a2 2 0 0 0-2.83 0l-.31.31a2 2 0 0 0 0 2.83l.06.06a1.65 1.65 0 0 1 .33 1.82 1.65 1.65 0 0 1-1.51 1H2a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2h.09a1.65 1.65 0 0 1 1.51 1 1.65 1.65 0 0 1-.33 1.82l-.06.06a2 2 0 0 0 0 2.83l.31.31a2 2 0 0 0 2.83 0l.06-.06a1.65 1.65 0 0 1 1.82-.33 1.65 1.65 0 0 1 1 1.51V22a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.09a1.65 1.65 0 0 1 1-1.51 1.65 1.65 0 0 1 1.82.33l.06.06a2 2 0 0 0 2.83 0l.31-.31a2 2 0 0 0 0-2.83l-.06-.06a1.65 1.65 0 0 1-.33-1.82 1.65 1.65 0 0 1 1.51-1H22a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2h-.09a1.65 1.65 0 0 1-1.51-1 1.65 1.65 0 0 1 .33-1.82l.06-.06a2 2 0 0 0 0-2.83l-.31-.31a2 2 0 0 0-2.83 0l-.06.06a1.65 1.65 0 0 1-1.82.33 1.65 1.65 0 0 1-1-1.51V4a2 2 0 0 0-2-2Z" />
    </svg>
  )
}

export function IconBell(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function IconPalette(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-.5-1.5-.5-2.5S14.5 15 16 15h2a3 3 0 0 0 3-3c0-5-4-9-9-9Z" />
      <circle cx="7.5" cy="11" r="1.1" />
      <circle cx="9.5" cy="7.5" r="1.1" />
      <circle cx="14.5" cy="7.5" r="1.1" />
      <circle cx="16.5" cy="11" r="1.1" />
    </svg>
  )
}

export function IconMonitor(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

export function IconX(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconMinus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function IconPencil(props) {
  return (
    <svg {...base} {...props}>
      <path d="m14.5 4.5 5 5L8 21H3v-5Z" />
      <path d="m13 6 5 5" />
    </svg>
  )
}

export function IconTrash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}
