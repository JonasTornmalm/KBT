import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../../app/VaultProvider'
import { Button } from '../../../components/Button'
import { Card, Muted } from '../../../components/Card'
import { BreathIcon, CheckIcon } from '../../../components/Icons'
import { cn } from '../../../lib/cn'
import { usePrefersReducedMotion } from '../../../lib/useReducedMotion'
import { ToolPage } from '../ToolPage'
import {
  BREATHING_EXERCISES,
  GROUNDING_STEPS,
  MUSCLE_GROUPS,
  RELEASE_SECONDS,
  TENSE_SECONDS,
  type BreathingExercise,
  type PracticeData,
} from './exercises'

const SCALE = { in: 1, 'hold-in': 1, out: 0.55, 'hold-out': 0.55 } as const

/** Cirkeln som andas. Den styr takten – man följer den utan att räkna. */
function BreathingSession({
  exercise,
  onDone,
}: {
  exercise: BreathingExercise
  onDone: (seconds: number) => void
}) {
  const reduceMotion = usePrefersReducedMotion()
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [remaining, setRemaining] = useState(exercise.phases[0]!.seconds)
  const [elapsed, setElapsed] = useState(0)
  const ticker = useRef<number | undefined>(undefined)

  const phase = exercise.phases[phaseIndex]!

  useEffect(() => {
    if (!running) return
    ticker.current = window.setInterval(() => {
      setElapsed((value) => value + 1)
      setRemaining((value) => {
        if (value > 1) return value - 1

        setPhaseIndex((current) => {
          const next = (current + 1) % exercise.phases.length
          if (next === 0) setCycles((count) => count + 1)
          return next
        })
        return 0
      })
    }, 1000)
    return () => window.clearInterval(ticker.current)
  }, [running, exercise.phases])

  // Ny fas: ladda om nedräkningen.
  useEffect(() => {
    setRemaining(exercise.phases[phaseIndex]!.seconds)
  }, [phaseIndex, exercise.phases])

  const reset = () => {
    setRunning(false)
    setPhaseIndex(0)
    setCycles(0)
    setElapsed(0)
    setRemaining(exercise.phases[0]!.seconds)
  }

  const scale = running ? SCALE[phase.scale] : 0.75
  const finished = cycles >= exercise.suggestedCycles

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center py-4">
        <div className="relative grid size-64 place-items-center">
          <div
            aria-hidden
            className="absolute rounded-full bg-calm/15"
            style={{
              width: '16rem',
              height: '16rem',
            }}
          />
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              width: '16rem',
              height: '16rem',
              background: 'radial-gradient(circle, var(--c-calm) 0%, var(--c-primary-vivid) 100%)',
              opacity: 0.28,
              transform: `scale(${scale})`,
              transition: reduceMotion
                ? 'none'
                : `transform ${phase.seconds}s cubic-bezier(0.4, 0, 0.4, 1)`,
            }}
          />
          <div className="relative text-center">
            <p className="text-lg font-semibold text-ink">
              {running ? phase.label : 'Redo när du är'}
            </p>
            <p className="mt-1 text-[3rem] font-bold leading-none tabular-nums text-ink">
              {running ? remaining : exercise.phases[0]!.seconds}
            </p>
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {running ? `${phase.label}, ${remaining} sekunder kvar` : ''}
        </p>

        <p className="mt-6 text-sm text-ink-soft">
          {cycles} av {exercise.suggestedCycles} andetag
        </p>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: exercise.suggestedCycles }, (_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-4 rounded-full transition-colors duration-500',
                i < cycles ? 'bg-calm' : 'bg-line',
              )}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => setRunning((value) => !value)}>
            {running ? 'Pausa' : cycles > 0 ? 'Fortsätt' : 'Börja'}
          </Button>
          {cycles > 0 ? (
            <Button size="lg" variant="outline" onClick={reset}>
              Börja om
            </Button>
          ) : null}
        </div>

        {finished ? (
          <div className="mt-6 w-full rounded-2xl bg-primary-soft p-4 text-center">
            <p className="text-[0.9375rem] leading-relaxed text-primary-ink">
              Klart. Lägg märke till hur kroppen känns nu jämfört med för några minuter sedan –
              skillnaden är ofta mindre dramatisk och mer verklig än man väntar sig.
            </p>
            <Button
              variant="soft"
              className="mt-3"
              onClick={() => {
                onDone(elapsed)
                reset()
              }}
            >
              Spara passet
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

function MuscleSession({ onDone }: { onDone: (seconds: number) => void }) {
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<'idle' | 'tense' | 'release'>('idle')
  const [remaining, setRemaining] = useState(TENSE_SECONDS)
  const [elapsed, setElapsed] = useState(0)
  const ticker = useRef<number | undefined>(undefined)

  const group = MUSCLE_GROUPS[index]!
  const done = index >= MUSCLE_GROUPS.length - 1 && stage === 'idle' && elapsed > 0

  useEffect(() => {
    if (stage === 'idle') return
    ticker.current = window.setInterval(() => {
      setElapsed((value) => value + 1)
      setRemaining((value) => {
        if (value > 1) return value - 1
        window.clearInterval(ticker.current)

        if (stage === 'tense') {
          setStage('release')
          return RELEASE_SECONDS
        }
        setStage('idle')
        setIndex((current) => Math.min(current + 1, MUSCLE_GROUPS.length - 1))
        return TENSE_SECONDS
      })
    }, 1000)
    return () => window.clearInterval(ticker.current)
  }, [stage])

  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        {index + 1} av {MUSCLE_GROUPS.length}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-ink">{group.name}</h2>

      <div className="mt-6 rounded-2xl bg-surface-2 p-6 text-center">
        {stage === 'idle' ? (
          <p className="leading-relaxed text-ink">{group.instruction}</p>
        ) : (
          <>
            <p className="text-lg font-semibold text-ink">
              {stage === 'tense' ? 'Spänn – håll kvar' : 'Släpp helt. Känn skillnaden.'}
            </p>
            <p className="mt-2 text-[3rem] font-bold leading-none tabular-nums text-ink">
              {remaining}
            </p>
          </>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {stage === 'idle' ? group.instruction : `${stage === 'tense' ? 'Spänn' : 'Slappna av'}, ${remaining} sekunder`}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {stage === 'idle' ? (
          <Button
            size="lg"
            onClick={() => {
              setStage('tense')
              setRemaining(TENSE_SECONDS)
            }}
          >
            {index === 0 && elapsed === 0 ? 'Börja' : 'Nästa grupp'}
          </Button>
        ) : (
          <Button size="lg" variant="outline" onClick={() => setStage('idle')}>
            Pausa
          </Button>
        )}
        {done ? (
          <Button size="lg" variant="soft" onClick={() => onDone(elapsed)}>
            Spara passet
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

function GroundingSession({ onDone }: { onDone: (seconds: number) => void }) {
  const [index, setIndex] = useState(0)
  const step = GROUNDING_STEPS[index]!
  const last = index === GROUNDING_STEPS.length - 1

  return (
    <Card>
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-calm-soft text-2xl font-bold text-calm-ink">
          {step.count}
        </span>
        <h2 className="text-xl font-bold text-ink">{step.sense}</h2>
      </div>

      <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{step.prompt}</p>

      <div className="mt-6 flex gap-1.5">
        {GROUNDING_STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i <= index ? 'bg-calm' : 'bg-line',
            )}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {last ? (
          <Button size="lg" onClick={() => onDone(GROUNDING_STEPS.length * 30)}>
            <CheckIcon className="size-5" />
            Klart
          </Button>
        ) : (
          <Button size="lg" onClick={() => setIndex((current) => current + 1)}>
            Nästa
          </Button>
        )}
        {index > 0 ? (
          <Button size="lg" variant="ghost" onClick={() => setIndex(0)}>
            Börja om
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

type Mode = { kind: 'breathing'; exercise: BreathingExercise } | { kind: 'pmr' } | { kind: 'grounding' } | null

export function BreathingPage() {
  const store = useStore()
  const [mode, setMode] = useState<Mode>(null)
  const [saved, setSaved] = useState(false)

  const record = async (kind: PracticeData['kind'], exercise: string, seconds: number) => {
    await store.create<PracticeData>('practice', { kind, exercise, seconds })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2600)
  }

  if (mode) {
    return (
      <ToolPage
        toolId="breathing"
        intro={
          <Muted className="mt-3">
            {mode.kind === 'breathing'
              ? mode.exercise.description
              : mode.kind === 'pmr'
                ? 'Spänn hårt i sju sekunder, släpp helt i arton. Kontrasten är det som lär kroppen skillnaden.'
                : 'Fem sinnen, i tur och ordning. För när tankarna dragit iväg och du behöver tillbaka till rummet.'}
          </Muted>
        }
      >
        {mode.kind === 'breathing' ? (
          <BreathingSession
            exercise={mode.exercise}
            onDone={(seconds) => void record('breathing', mode.exercise.name, seconds)}
          />
        ) : mode.kind === 'pmr' ? (
          <MuscleSession onDone={(seconds) => void record('pmr', 'Progressiv muskelavslappning', seconds)} />
        ) : (
          <GroundingSession onDone={(seconds) => void record('grounding', '5-4-3-2-1', seconds)} />
        )}

        <p aria-live="polite" className="mt-4 h-5 text-sm font-medium text-primary">
          {saved ? 'Passet sparat' : ''}
        </p>

        <Button variant="ghost" className="mt-2" onClick={() => setMode(null)}>
          Välj en annan övning
        </Button>
      </ToolPage>
    )
  }

  return (
    <ToolPage toolId="breathing">
      <Card tone="muted" className="mb-6">
        <Muted>
          Nedvarvning används bäst <em>efter</em> en jobbig situation, inte i stället för den. Blir
          andningsövningen ett sätt att slippa undan blir den ett säkerhetsbeteende – och då jobbar
          den emot exponeringen.
        </Muted>
      </Card>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-faint">Andning</h2>
      <ul className="grid gap-3">
        {BREATHING_EXERCISES.map((exercise) => (
          <li key={exercise.id}>
            <button
              type="button"
              onClick={() => setMode({ kind: 'breathing', exercise })}
              className="group flex w-full items-start gap-4 rounded-2xl bg-surface p-5 text-left shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-calm-soft text-calm-ink">
                <BreathIcon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-bold text-ink">{exercise.name}</span>
                  <span className="text-xs text-ink-faint">{exercise.minutes}</span>
                </span>
                <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                  {exercise.tagline}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-ink-faint">Kropp och sinnen</h2>
      <ul className="grid gap-3">
        <li>
          <button
            type="button"
            onClick={() => setMode({ kind: 'pmr' })}
            className="flex w-full items-start gap-4 rounded-2xl bg-surface p-5 text-left shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-bold text-ink">Progressiv muskelavslappning</span>
                <span className="text-xs text-ink-faint">12–15 min</span>
              </span>
              <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                Sju muskelgrupper, spänn och släpp
              </span>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setMode({ kind: 'grounding' })}
            className="flex w-full items-start gap-4 rounded-2xl bg-surface p-5 text-left shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-bold text-ink">5-4-3-2-1</span>
                <span className="text-xs text-ink-faint">3 min</span>
              </span>
              <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                Tillbaka till rummet via sinnena
              </span>
            </span>
          </button>
        </li>
      </ul>
    </ToolPage>
  )
}
