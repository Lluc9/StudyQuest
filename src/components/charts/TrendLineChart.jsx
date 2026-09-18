import { useState } from 'react'
import { getAxisSteps } from '../../utils/chartAxis'
import './charts.css'

/**
 * Gràfic de línia simple (SVG, sense llibreria). `data` és un array
 * d'objectes amb una etiqueta i un valor numèric, p. ex. { month, xp }.
 * Els punts es dibuixen com a quadrats HTML superposats (no dins de
 * l'SVG) perquè el `viewBox` s'estira de manera no uniforme i un
 * `<rect>` intern no es veuria quadrat; així es garanteix una mida
 * real en píxels i permet mostrar un tooltip individual per punt.
 */
export default function TrendLineChart({ data, dataKey = 'xp', labelKey = 'month' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const rawMax = Math.max(...data.map((d) => d[dataKey]), 1)
  const { niceMax, labels: axisLabels } = getAxisSteps(rawMax)
  const stepX = data.length > 1 ? 100 / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: 100 - (d[dataKey] / niceMax) * 100,
    value: d[dataKey],
    label: d[labelKey],
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="trend-chart">
      <div className="trend-chart-body">
        <div className="trend-chart-axis">
          {axisLabels.map((label, i) => (
            <span key={i}>{label.toLocaleString('ca-ES')}</span>
          ))}
        </div>

        <div className="trend-chart-main">
          <div className="trend-chart-plot">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="trend-chart-svg">
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent-cyan)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="trend-chart-points">
              {points.map((p, i) => (
                <div
                  key={p.label}
                  className="trend-chart-point-hit"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="trend-chart-point" />
                  {hoveredIndex === i && (
                    <div className="trend-chart-tooltip">{p.value.toLocaleString('ca-ES')} XP</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="trend-chart-labels">
            {data.map((d) => (
              <span key={d[labelKey]}>{d[labelKey]}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
