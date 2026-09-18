// Petit hook per animar un valor numèric cap al seu `target` cada cop que
// canvia, en lloc de saltar-hi directament. S'utilitza als indicadors de la
// pantalla d'Inici (XP total, hores d'aquesta setmana, progrés de nivell)
// perquè pugin de manera progressiva en comptes de canviar a l'instant.
import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(target, { duration = 700 } = {}) {
  const [display, setDisplay] = useState(target)
  const displayRef = useRef(target)
  const frameRef = useRef(null)

  useEffect(() => {
    const from = displayRef.current
    if (from === target) return undefined

    let start = null

    const step = (timestamp) => {
      if (start === null) start = timestamp
      const progress = Math.min(1, (timestamp - start) / duration)
      // ease-out cubic: comença ràpid i frena en arribar al valor final.
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = from + (target - from) * eased
      displayRef.current = value
      setDisplay(value)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return display
}
