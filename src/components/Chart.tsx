import { useId } from 'react'
import { formatShort } from '../lib/date'

/**
 * Diagrammen ritas för hand i SVG i stället för med ett diagrambibliotek.
 * Skälen är tre: de blir några rader kod i stället för hundra kilobyte, de
 * följer temat automatiskt eftersom de använder samma färgvariabler som
 * resten av appen, och de kan hållas dämpade — en graf över hur någon mått
 * ska inte se ut som en aktiekurs.
 */

const W = 640
const PAD = { top: 16, right: 14, bottom: 28, left: 34 }

export interface TrendPoint {
  date: Date
  value: number
}

function buildPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0]!.x} ${points[0]!.y}`

  // Mjuk kurva genom punkterna: kontrollpunkter halvvägs i x-led ger en linje
  // som följer datan utan att svänga förbi den.
  return points.reduce((path, point, i) => {
    if (i === 0) return `M${point.x} ${point.y}`
    const previous = points[i - 1]!
    const midX = (previous.x + point.x) / 2
    return `${path} C${midX} ${previous.y} ${midX} ${point.y} ${point.x} ${point.y}`
  }, '')
}

export function TrendChart({
  points,
  domain,
  color = 'var(--c-primary)',
  height = 200,
  label,
  invertGood = false,
}: {
  points: TrendPoint[]
  domain: [number, number]
  color?: string
  height?: number
  /** Beskriver serien för skärmläsare. */
  label: string
  /** Sant när ett lågt värde är det goda (PHQ-9, GAD-7). Styr bara textsammanfattningen. */
  invertGood?: boolean
}) {
  const gradientId = useId()
  const [min, max] = domain
  const innerW = W - PAD.left - PAD.right
  const innerH = height - PAD.top - PAD.bottom

  const sorted = [...points].sort((a, b) => a.date.getTime() - b.date.getTime())

  const scaled = sorted.map((point, i) => ({
    x: PAD.left + (sorted.length === 1 ? innerW / 2 : (i / (sorted.length - 1)) * innerW),
    y: PAD.top + innerH - ((point.value - min) / (max - min)) * innerH,
    point,
  }))

  const line = buildPath(scaled)
  const area =
    scaled.length > 1
      ? `${line} L${scaled[scaled.length - 1]!.x} ${PAD.top + innerH} L${scaled[0]!.x} ${PAD.top + innerH} Z`
      : ''

  const gridValues = [min, (min + max) / 2, max]
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  const summary =
    sorted.length < 2 || !first || !last
      ? `${label}: för få mätningar för en trend.`
      : `${label}: från ${first.value} den ${formatShort(first.date)} till ${last.value} den ${formatShort(last.date)}. ${
          last.value === first.value
            ? 'Oförändrat.'
            : (last.value < first.value) === invertGood
              ? 'Utvecklingen går åt rätt håll.'
              : 'Utvecklingen går åt fel håll.'
        }`

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={summary}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {gridValues.map((value) => {
          const y = PAD.top + innerH - ((value - min) / (max - min)) * innerH
          return (
            <g key={value}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="var(--c-line)"
                strokeWidth={1}
                strokeDasharray="3 6"
              />
              <text
                x={PAD.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill="var(--c-ink-faint)"
              >
                {Math.round(value)}
              </text>
            </g>
          )
        })}

        {area ? <path d={area} fill={`url(#${gradientId})`} /> : null}
        {line ? (
          <path d={line} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
        ) : null}

        {scaled.map(({ x, y, point }, i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={4.5} fill="var(--c-surface)" stroke={color} strokeWidth={2.4} />
            {(i === 0 || i === scaled.length - 1 || scaled.length <= 6) && (
              <text
                x={x}
                y={height - 8}
                textAnchor={i === 0 ? 'start' : i === scaled.length - 1 ? 'end' : 'middle'}
                fontSize={11}
                fill="var(--c-ink-faint)"
              >
                {formatShort(point.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  )
}

export interface BarPoint {
  label: string
  value: number
  color?: string
  /** Visas under stapeln, kortare än label. */
  short?: string
}

export function BarChart({
  bars,
  max,
  height = 160,
  suffix = '',
}: {
  bars: BarPoint[]
  max: number
  height?: number
  suffix?: string
}) {
  if (bars.length === 0) return null

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {bars.map((bar, i) => {
        const ratio = max > 0 ? Math.max(bar.value / max, 0) : 0
        return (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold tabular-nums text-ink-soft">
              {bar.value > 0 ? `${Math.round(bar.value * 10) / 10}${suffix}` : ''}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-lg transition-[height] duration-700 ease-[var(--ease-calm)]"
                style={{
                  height: `${Math.max(ratio * 100, bar.value > 0 ? 4 : 0)}%`,
                  background: bar.color ?? 'var(--c-primary)',
                  opacity: 0.9,
                }}
                title={`${bar.label}: ${bar.value}${suffix}`}
              />
            </div>
            <span className="w-full truncate text-center text-[0.6875rem] text-ink-faint">
              {bar.short ?? bar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** En liten kurva utan axlar, för att visa ett förlopp inuti ett kort. */
export function Sparkline({
  values,
  color = 'var(--c-primary)',
  domain,
  height = 44,
}: {
  values: number[]
  color?: string
  domain: [number, number]
  height?: number
}) {
  if (values.length < 2) return null
  const [min, max] = domain
  const width = 120
  const points = values.map((value, i) => ({
    x: (i / (values.length - 1)) * width,
    y: height - ((value - min) / (max - min)) * height,
  }))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-hidden>
      <path
        d={buildPath(points)}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  )
}
