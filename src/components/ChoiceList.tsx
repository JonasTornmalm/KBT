import { useId } from 'react'
import { cn } from '../lib/cn'

export interface Choice<T> {
  value: T
  label: string
  description?: string
}

/**
 * Radioknappar som stora tryckytor. Byggt på riktiga radioinputs så att
 * tangentbord och skärmläsare får piltangentnavigering gratis.
 */
export function ChoiceList<T extends string | number>({
  legend,
  hideLegend,
  hint,
  choices,
  value,
  onChange,
  columns = 1,
}: {
  legend: string
  /** Dölj rubriken visuellt när frågan redan står som sidans rubrik. */
  hideLegend?: boolean
  hint?: string
  choices: Choice<T>[]
  value: T | undefined
  onChange: (value: T) => void
  columns?: 1 | 2
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className={cn('font-semibold text-ink', hideLegend ? 'sr-only' : 'mb-1')}>
        {legend}
      </legend>
      {hint ? <p className="mb-3 text-sm leading-relaxed text-ink-soft">{hint}</p> : null}
      <div className={cn('grid gap-2', columns === 2 && 'sm:grid-cols-2')}>
        {choices.map((choice) => {
          const selected = value === choice.value
          return (
            <label
              key={String(choice.value)}
              className={cn(
                'flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-200',
                selected
                  ? 'border-primary bg-primary-soft text-primary-ink'
                  : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={selected}
                onChange={() => onChange(choice.value)}
              />
              <span
                aria-hidden
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors',
                  selected ? 'border-primary' : 'border-line-strong',
                )}
              >
                {selected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{choice.label}</span>
                {choice.description ? (
                  <span className="block text-sm text-ink-soft">{choice.description}</span>
                ) : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Flerval, samma utseende men med kryssrutor. */
export function CheckList<T extends string>({
  legend,
  hint,
  choices,
  values,
  onToggle,
}: {
  legend: string
  hint?: string
  choices: Choice<T>[]
  values: T[]
  onToggle: (value: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-1 font-semibold text-ink">{legend}</legend>
      {hint ? <p className="mb-3 text-sm leading-relaxed text-ink-soft">{hint}</p> : null}
      <div className="grid gap-2">
        {choices.map((choice) => {
          const selected = values.includes(choice.value)
          return (
            <label
              key={choice.value}
              className={cn(
                'flex min-h-[3.25rem] cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors duration-200',
                selected
                  ? 'border-primary bg-primary-soft text-primary-ink'
                  : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selected}
                onChange={() => onToggle(choice.value)}
              />
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors',
                  selected ? 'border-primary bg-primary' : 'border-line-strong',
                )}
              >
                {selected ? (
                  <svg viewBox="0 0 12 12" className="size-3 text-on-primary" aria-hidden>
                    <path
                      d="M2 6.2 4.6 8.8 10 3.4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{choice.label}</span>
                {choice.description ? (
                  <span className="block text-sm leading-relaxed text-ink-soft">
                    {choice.description}
                  </span>
                ) : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
