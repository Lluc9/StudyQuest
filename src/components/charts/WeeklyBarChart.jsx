import { useState } from 'react'
import './charts.css'

/**
 * Gráfico de barras simple (CSS, sin librería). `data` es un array de
 * { day: string, hours: number }. Muestra un tooltip amb el valor exacte
 * en fer hover sobre una barra (no es mostra de manera permanent).
 */
export default function WeeklyBarChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const max = Math.max(...data.map((d) => d.hours), 1)

  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const heightPercent = (d.hours / max) * 100
        return (
          <div className="bar-chart-col" key={d.day}>
            <div
              className="bar-chart-track"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="bar-chart-fill" style={{ height: `${Math.max(heightPercent, 3)}%` }}>
                {hoveredIndex === i && <div className="bar-chart-tooltip">{d.hours}h</div>}
              </div>
            </div>
            <span className="bar-chart-label">{d.day}</span>
          </div>
        )
      })}
    </div>
  )
}
