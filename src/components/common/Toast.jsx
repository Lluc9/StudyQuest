import { useEffect } from 'react'
import './common.css'

const AUTO_DISMISS_MS = 3200

/** Avís intern breu (sempre visible, mai requereix permisos) — veure
 * App.jsx per a quan es dispara. Es tanca sol al cap d'uns segons. */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(id)
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div className="toast-wrap" role="status">
      <div className="toast">{toast.text}</div>
    </div>
  )
}
