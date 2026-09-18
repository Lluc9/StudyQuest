import { useState } from 'react'
import { getAxisSteps } from '../../utils/chartAxis'
import './charts.css'

/**
 * Gràfic de barres per a "Hores d'estudi" del Perfil: barres primes amb
 * un tooltip individual per barra en fer hover (el valor no es mostra
 * de manera permanent) i l'eix vertical a l'esquerra. Component separat
 * de WeeklyBarChart (usat a Inici) per no alterar-lo.
 */
export default function MonthlyHoursChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const rawMax = Math.max(...data.map((d) => d.hours), 1)
  const { niceMax, labels: axisLabels } = getAxisSteps(rawMax)

  return (
    <div className="monthly-hours-wrap">
      <div className="monthly-hours-axis">
        <div className="monthly-hours-axis-track">
          {axisLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <span className="monthly-hours-axis-spacer" />
      </div>

      <div className="monthly-hours-chart">
        {data.map((d, i) => {
          const heightPercent = Math.max((d.hours / niceMax) * 100, 4)
          return (
            <div key={d.day} className="monthly-hours-col">
              <div
                className="monthly-hours-track"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="monthly-hours-bar" style={{ height: `${heightPercent}%` }}>
                  {hoveredIndex === i && <div className="monthly-hours-tooltip">{d.hours}h aquest mes</div>}
                </div>
              </div>
              <span className="monthly-hours-month">{d.day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
