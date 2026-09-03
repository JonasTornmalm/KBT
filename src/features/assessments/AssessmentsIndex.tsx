import { Link } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Card, Muted } from '../../components/Card'
import { Sparkline } from '../../components/Chart'
import { ArrowRightIcon } from '../../components/Icons'
import { ErrorState } from '../../components/PageState'
import { SCALES, SCALE_ORDER } from '../../domain/assessments/scales'
import { scoreAssessment, type AssessmentRecord } from '../../domain/assessments/scoring'
import { cn } from '../../lib/cn'
import { formatRelativeDay } from '../../lib/date'
import { useAsync } from '../../lib/useAsync'

const TONE_BADGE = {
  good: 'bg-primary-soft text-primary-ink',
  calm: 'bg-primary-soft text-primary-ink',
  watch: 'bg-accent-soft text-accent-ink',
  act: 'bg-crisis-soft text-crisis-ink',
} as const

export function AssessmentsIndex() {
  const store = useStore()
  const { data, error, reload } = useAsync(
    () => store.byType<AssessmentRecord>('assessment', { order: 'asc' }),
    [store],
  )

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">Skattningar</h1>
        <Muted className="mt-2 max-w-[36rem]">
          Tre formulär som används i svensk vård. Gör dem när du börjar, och sedan var fjärde vecka
          – oftare än så säger de mest brus.
        </Muted>
      </header>

      {/* Historiken, inte skalorna, är det som kan saknas. Att bara visa "inte
          gjord än" hade varit ett svar på en fråga vi inte kunde besvara. */}
      {error ? (
        <div className="mb-6">
          <ErrorState
            title="Dina tidigare skattningar gick inte att läsa"
            body="De ligger kvar – appen kunde bara inte öppna dem just nu. Du kan göra en ny skattning ändå."
            onRetry={reload}
          />
        </div>
      ) : null}

      <div className="grid gap-4">
        {SCALE_ORDER.map((key) => {
          const scale = SCALES[key]
          const entries = (data ?? []).filter((entry) => entry.data.scale === key)
          const scores = entries.map((entry) => scoreAssessment(key, entry.data.answers))
          const latest = scores[scores.length - 1]
          const latestEntry = entries[entries.length - 1]

          return (
            <Link
              key={key}
              to={`/skattning/${key}`}
              className="group block rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:shadow-lift sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-lg font-bold text-ink">{scale.measures}</h2>
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      {scale.name}
                    </span>
                  </div>
                  <Muted className="mt-1.5">{scale.purpose}</Muted>
                </div>
                <ArrowRightIcon className="mt-1 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>

              {latest && latestEntry ? (
                <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tabular-nums text-ink">
                        {latest.score}
                      </span>
                      <span className="text-sm text-ink-faint">/ {latest.max}</span>
                      <span
                        className={cn(
                          'ml-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                          TONE_BADGE[latest.band.tone],
                        )}
                      >
                        {latest.band.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-faint">
                      Senast {formatRelativeDay(new Date(latestEntry.createdAt))} ·{' '}
                      {entries.length} {entries.length === 1 ? 'mätning' : 'mätningar'}
                    </p>
                  </div>

                  {scores.length > 1 ? (
                    <div className="w-28 shrink-0">
                      <Sparkline
                        values={scores.map((s) => s.score)}
                        domain={[0, scale.key === 'who5' ? 100 : scale.maxScore]}
                        color={
                          latest.band.tone === 'act'
                            ? 'var(--c-crisis)'
                            : latest.band.tone === 'watch'
                              ? 'var(--c-accent)'
                              : 'var(--c-primary)'
                        }
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-5 border-t border-line pt-4 text-sm text-ink-faint">
                  Inte gjord än · {scale.items.length} frågor
                </p>
              )}
            </Link>
          )
        })}
      </div>

      <Card tone="muted" className="mt-8">
        <h2 className="font-bold text-ink">Om formulären</h2>
        <Muted className="mt-2">
          PHQ-9 och GAD-7 är fria att använda och sprida, och samma versioner används i
          primärvården. WHO-5 är utgiven av WHO. Ingen av dem ställer en diagnos – de ger ett mått
          som går att följa över tid.
        </Muted>
        <Link
          to="/om/kallor"
          className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Källor och licenser
        </Link>
      </Card>
    </div>
  )
}
