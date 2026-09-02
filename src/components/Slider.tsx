import { useId } from 'react'
import { cn } from '../lib/cn'

const TRACK =
  'h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent focus:outline-none'
const THUMB =
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[var(--slider-tone)] [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&:active::-webkit-slider-thumb]:scale-110 [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[var(--slider-tone)] [&::-moz-range-thumb]:border-solid'

export type SliderTone = 'primary' | 'accent' | 'calm' | 'rose'

const TONE_VAR: Record<SliderTone, string> = {
  primary: 'var(--c-primary)',
  accent: 'var(--c-accent)',
  calm: 'var(--c-calm)',
  rose: 'var(--c-rose)',
}

/**
 * Skattningsreglage. Används för allt som mäts 0–100 (tilltro, SUD) och 0–10
 * (glädje, bemästring). Värdet visas alltid i siffror — ett reglage utan
 * avläsbart tal är svårt att jämföra med gårdagens.
 */
export function Slider({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  anchors,
  tone = 'primary',
}: {
  label: string
  hint?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  anchors?: [string, string]
  tone?: SliderTone
}) {
  const id = useId()
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div style={{ ['--slider-tone' as string]: TONE_VAR[tone] }}>
      <div className="mb-1 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-semibold text-ink">
          {label}
        </label>
        <output
          htmlFor={id}
          className="shrink-0 text-2xl font-bold tabular-nums"
          style={{ color: TONE_VAR[tone] }}
        >
          {value}
          {suffix}
        </output>
      </div>
      {hint ? <p className="mb-3 text-sm leading-relaxed text-ink-soft">{hint}</p> : null}

      <div className="relative py-2">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-canvas-soft" />
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full transition-[width] duration-100"
          style={{ width: `${percent}%`, background: TONE_VAR[tone] }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn('relative', TRACK, THUMB)}
        />
      </div>

      {anchors ? (
        <div className="flex justify-between text-xs text-ink-faint">
          <span>{anchors[0]}</span>
          <span>{anchors[1]}</span>
        </div>
      ) : null}
    </div>
  )
}
