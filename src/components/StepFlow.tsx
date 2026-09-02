import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { ProgressDots } from './ProgressDots'

export interface FlowStep {
  id: string
  /** Frågan, ställd rakt till användaren. En per skärm. */
  question: string
  /** Kort förklaring under frågan — varför den ställs, eller hur man svarar. */
  help?: ReactNode
  body: ReactNode
  /** Falskt när svaret inte räcker för att gå vidare. Default: sant. */
  canAdvance?: boolean
  /** Text på knappen när steget är valfritt och tomt. */
  skipLabel?: string
}

/**
 * Motorn bakom alla guidade övningar.
 *
 * En fråga per skärm är inte en stilgrej: en tom skärm med en enda fråga är
 * märkbart lättare att svara på när man är nedstämd eller ångestfylld än ett
 * formulär med tolv fält. Priset är fler klick, och det är värt det.
 *
 * Steget byts direkt och animeras bara in — det finns medvetet ingen
 * utgångsanimation att vänta på. Ett flöde där nästa fråga inte kan visas
 * förrän en animation blivit klar går i baklås om webbläsaren stryper
 * bildrutor, till exempel i en bakgrundsflik. Övningen måste fungera även då.
 */
export function StepFlow({
  title,
  steps,
  onFinish,
  onExit,
  finishLabel = 'Spara',
  busy = false,
  index: controlledIndex,
  onIndexChange,
}: {
  title: string
  steps: FlowStep[]
  onFinish: () => void | Promise<void>
  onExit: () => void
  finishLabel?: string
  busy?: boolean
  /** Skicka med för att styra steget utifrån, t.ex. för att hoppa fram automatiskt. */
  index?: number
  onIndexChange?: (index: number) => void
}) {
  const [internalIndex, setInternalIndex] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const index = controlledIndex ?? internalIndex
  const setIndex = (update: (current: number) => number) => {
    const next = update(index)
    if (controlledIndex === undefined) setInternalIndex(next)
    onIndexChange?.(next)
  }

  const safeIndex = Math.min(index, steps.length - 1)
  const step = steps[safeIndex]
  const isLast = safeIndex === steps.length - 1

  /**
   * Vid varje steg flyttas fokus in i svarsfältet, så att man kan börja skriva
   * direkt — över tretton steg blir det annars tretton onödiga klick. Frågan
   * skulle då gå förlorad för en skärmläsare, så den läses i stället upp via
   * det dolda annonseringsfältet nedan.
   */
  useEffect(() => {
    const field = bodyRef.current?.querySelector<HTMLElement>(
      'textarea, input:not([type="radio"]):not([type="checkbox"]):not([type="range"])',
    )
    if (field) field.focus()
    else headingRef.current?.focus()
  }, [safeIndex])

  if (!step) return null

  const go = (delta: 1 | -1) => {
    setIndex((current) => Math.max(0, Math.min(steps.length - 1, current + delta)))
  }

  const canAdvance = step.canAdvance !== false

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[42rem] flex-col px-5 pb-8 pt-4 sm:px-6">
      <header className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => (safeIndex === 0 ? onExit() : go(-1))}
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          aria-label={safeIndex === 0 ? 'Avbryt' : 'Föregående fråga'}
        >
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
            <path
              d="M12.5 4 6.5 10l6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-soft">{title}</p>
          <div className="mt-2">
            <ProgressDots total={steps.length} index={safeIndex} />
          </div>
        </div>
        <span className="shrink-0 text-sm tabular-nums text-ink-faint">
          {safeIndex + 1}/{steps.length}
        </span>
      </header>

      {/* Läses upp av skärmläsare vid varje steg, eftersom fokus går till fältet. */}
      <p aria-live="polite" className="sr-only">
        {`Fråga ${safeIndex + 1} av ${steps.length}. ${step.question}`}
      </p>

      <div className="flex-1">
        {/* Nyckeln gör att elementet byts ut vid varje steg, vilket startar om
            intoningen. Animationen stängs av automatiskt för den som bett om
            mindre rörelse, via regeln i theme.css. */}
        <div key={step.id} className="animate-[var(--animate-rise)]">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-[1.75rem] leading-tight text-ink outline-none sm:text-[2rem]"
          >
            {step.question}
          </h1>
          {step.help ? (
            <div className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{step.help}</div>
          ) : null}
          <div ref={bodyRef} className="mt-7">
            {step.body}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-10 -mx-5 bg-gradient-to-t from-canvas via-canvas to-transparent px-5 pb-2 pt-6 sm:-mx-6 sm:px-6">
        <Button
          size="lg"
          fullWidth
          disabled={!canAdvance || busy}
          onClick={() => (isLast ? void onFinish() : go(1))}
        >
          {busy ? 'Sparar…' : isLast ? finishLabel : (step.skipLabel ?? 'Nästa')}
        </Button>
      </div>
    </div>
  )
}
