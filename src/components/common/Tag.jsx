import './common.css'

/**
 * Etiqueta pequeña de texto. `tone` controla el color de fondo/texto.
 * tones soportados: 'urgent' | 'subject' | 'xp' | 'neutral' | 'pill'
 * 'pill' usa `color` para generar un fondo tintado del mismo color (para
 * etiquetas de dificultad/tipo de misión, cada una con un color distinto).
 */
export default function Tag({ children, tone = 'neutral', color }) {
  const style = color ? { '--tag-color': color } : undefined
  return (
    <span className={`tag tag--${tone}`} style={style}>
      {children}
    </span>
  )
}
