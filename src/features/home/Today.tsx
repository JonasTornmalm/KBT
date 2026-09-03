import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Backdrop } from '../../components/Backdrop'
import { Card, Muted } from '../../components/Card'
import { ArrowRightIcon, CheckIcon } from '../../components/Icons'
import { ErrorState, LoadingState } from '../../components/PageState'
import { FIRST_SESSION_SLUG, SESSIONS } from '../../content/program'
import { MOOD_LEVELS, type CheckinData } from '../../domain/checkin'
import { computeNextStep } from '../../domain/nextStep'
import { completedCount } from '../../domain/program/progress'
import { emptyProgress, type ProgramProgress } from '../../domain/program/types'
import type { AssessmentRecord } from '../../domain/assessments/scoring'
import { cn } from '../../lib/cn'
import { toDayKey } from '../../lib/date'
import type { Entry } from '../../lib/db/types'
import { useAsync } from '../../lib/useAsync'

function greeting(now = new Date()): string {
  const hour = now.getHours()
  if (hour < 5) return 'Sen kväll'
  if (hour < 10) return 'God morgon'
  if (hour < 13) return 'God förmiddag'
  if (hour < 18) return 'God eftermiddag'
  if (hour < 23) return 'God kväll'
  return 'Sen kväll'
}

/**
 * Incheckningen ligger som en smal rad, inte som ett eget beslut. Ett tryck
 * räcker, och när dagen är avklarad krymper den till en bekräftelse.
 */
function CheckinRow({
  existing,
  onSaved,
}: {
  existing: Entry<CheckinData> | undefined
  onSaved: () => void
}) {
  const store = useStore()
  const [saving, setSaving] = useState(false)

  const pick = async (mood: number) => {
    // Skrivningen och omläsningen tar en stund, och under tiden står knapparna
    // kvar. Utan spärren blir två snabba tryck två incheckningar samma dag.
    if (saving) return

    setSaving(true)
    try {
      if (existing) {
        await store.save<CheckinData>(
          existing.id,
          'checkin',
          { ...existing.data, mood },
          existing.day,
        )
      } else {
        // Bara humöret. Energi och ångest lämnas otomma tills någon faktiskt
        // skattar dem på incheckningssidan.
        await store.create<CheckinData>('checkin', { mood })
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (existing) {
    const level = MOOD_LEVELS.find((item) => item.value === existing.data.mood)
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 shadow-soft">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
          <CheckIcon className="size-5" />
        </span>
        <p className="min-w-0 flex-1 text-[0.9375rem] text-ink-soft">
          Incheckad idag – <span className="text-ink">{level?.label.toLowerCase()}</span>
        </p>
        <Link
          to="/verktyg/incheckning"
          className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Ändra
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-surface px-5 py-4 shadow-soft">
      <p className="text-[0.9375rem] font-semibold text-ink">Hur är det idag?</p>
      <div className="mt-3 flex justify-between gap-1.5">
        {MOOD_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => void pick(level.value)}
            disabled={saving}
            className="group flex flex-1 flex-col items-center gap-1.5 rounded-xl py-1.5 transition-colors hover:bg-surface-2 disabled:pointer-events-none"
          >
            <span
              className="grid size-9 place-items-center rounded-full bg-canvas-soft transition-transform duration-300 ease-[var(--ease-calm)] group-hover:scale-110"
            >
              <span className="size-3 rounded-full" style={{ background: level.color }} />
            </span>
            <span className="text-center text-[0.625rem] leading-tight text-ink-faint">
              {level.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function Today() {
  const store = useStore()
  const today = toDayKey()

  const { data, error, reload } = useAsync(async () => {
    const [checkins, progressEntry, assessments, activity] = await Promise.all([
      store.byType<CheckinData>('checkin', { from: today, to: today, limit: 1 }),
      store.singleton<ProgramProgress>('programProgress', () => emptyProgress(FIRST_SESSION_SLUG)),
      store.byType<AssessmentRecord>('assessment'),
      store.latestByType(),
    ])

    const lastRelevant = assessments.find(
      (entry) => entry.data.scale === 'phq9' || entry.data.scale === 'gad7',
    )

    return {
      today: checkins[0],
      progress: progressEntry.data,
      lastAssessmentAt: lastRelevant ? new Date(lastRelevant.createdAt) : null,
      activity,
    }
  }, [store, today])

  if (error) return <ErrorState onRetry={reload} />
  if (!data) return <LoadingState />

  const step = computeNextStep({
    progress: data.progress,
    lastAssessmentAt: data.lastAssessmentAt,
    activity: data.activity,
  })
  const done = completedCount(data.progress)

  return (
    <div className="relative">
      <Backdrop />

      <header className="mb-7">
        <p className="text-sm font-medium text-ink-faint">{greeting()}</p>
        <h1 className="mt-1 text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">
          Det här är ditt nästa steg
        </h1>
      </header>

      {/* Dagens enda beslut. Allt annat på sidan är underordnat. */}
      <Link
        to={step.to}
        className="group block rounded-3xl bg-primary p-6 text-on-primary shadow-lift transition-transform duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wide opacity-80">
            {step.eyebrow}
          </span>
          {step.minutes ? (
            <span className="rounded-full bg-on-primary/15 px-2.5 py-1 text-xs font-semibold">
              {step.minutes}
            </span>
          ) : null}
        </div>

        <h2 className="mt-3 text-[1.625rem] font-bold leading-tight sm:text-[2rem]">
          {step.title}
        </h2>
        <p className="mt-3 max-w-[32rem] leading-relaxed opacity-90">{step.why}</p>

        <span className="mt-6 inline-flex min-h-[3rem] items-center gap-2 rounded-full bg-on-primary px-6 font-semibold text-primary transition-transform duration-300 group-hover:translate-x-0.5">
          {step.cta}
          <ArrowRightIcon className="size-5" />
        </span>
      </Link>

      {step.secondary ? (
        <Link
          to={step.secondary.to}
          className="mt-3 inline-block text-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          {step.secondary.label}
        </Link>
      ) : null}

      <div className="mt-6">
        <CheckinRow existing={data.today} onSaved={reload} />
      </div>

      <Link
        to="/program"
        className="mt-4 flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors hover:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9375rem] font-semibold text-ink">Din behandling</span>
          <span className="mt-2 flex gap-1">
            {SESSIONS.map((session) => (
              <span
                key={session.slug}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  data.progress.completed.includes(session.slug) ? 'bg-primary' : 'bg-line',
                )}
              />
            ))}
          </span>
        </span>
        <span className="shrink-0 text-sm tabular-nums text-ink-faint">{done}/8</span>
      </Link>

      {done === 0 ? (
        <Card tone="muted" className="mt-6">
          <Muted>
            Programmet är upplagt som en behandling hos en psykolog: en session i veckan, med en
            uppgift emellan. Du behöver inte välja något – appen säger till när det är dags för
            nästa steg.
          </Muted>
        </Card>
      ) : null}
    </div>
  )
}
