import { Link } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Card, Muted } from '../../components/Card'
import { BarChart, TrendChart } from '../../components/Chart'
import { SCALES, SCALE_ORDER, type AssessmentKey } from '../../domain/assessments/scales'
import { scoreAssessment, type AssessmentRecord } from '../../domain/assessments/scoring'
import { moodLevel, type CheckinData } from '../../domain/checkin'
import { formatWeekday } from '../../lib/date'
import { useAsync } from '../../lib/useAsync'
import type { ActivityData } from '../tools/ActivityPage'
import { thoughtShift, type ThoughtRecordData } from '../tools/thought/types'

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function Insights() {
  const store = useStore()

  const { data } = useAsync(async () => {
    const [checkins, assessments, activities, thoughts] = await Promise.all([
      store.byType<CheckinData>('checkin', { limit: 120, order: 'asc' }),
      store.byType<AssessmentRecord>('assessment', { order: 'asc' }),
      store.byType<ActivityData>('activity', { limit: 300 }),
      store.byType<ThoughtRecordData>('thoughtRecord', { limit: 100 }),
    ])
    return { checkins, assessments, activities, thoughts }
  }, [store])

  if (!data) return null

  const { checkins, assessments, activities, thoughts } = data
  const recent = checkins.slice(-30)

  // Samband mellan aktivitet och humör: dagar med minst en genomförd aktivitet
  // jämfört med dagar utan. Det är den upptäckt vecka 2 vill leda fram till.
  const activeDays = new Set(
    activities.filter((entry) => entry.data.done).map((entry) => entry.day),
  )
  const withActivity = checkins.filter((entry) => activeDays.has(entry.day))
  const withoutActivity = checkins.filter((entry) => !activeDays.has(entry.day))
  const activityEffect =
    withActivity.length >= 3 && withoutActivity.length >= 3
      ? {
          active: round(withActivity.reduce((s, e) => s + e.data.mood, 0) / withActivity.length),
          quiet: round(withoutActivity.reduce((s, e) => s + e.data.mood, 0) / withoutActivity.length),
        }
      : null

  const beliefShift =
    thoughts.length > 0
      ? Math.round(
          thoughts.reduce((sum, entry) => sum + thoughtShift(entry.data).belief, 0) / thoughts.length,
        )
      : null

  const hasAnything = checkins.length > 0 || assessments.length > 0

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">Din utveckling</h1>
        <Muted className="mt-2 max-w-[36rem]">
          Förändring går långsamt och känns sällan när den sker. Det är därför den mäts.
        </Muted>
      </header>

      {!hasAnything ? (
        <Card tone="muted">
          <p className="font-bold text-ink">Inget att visa än</p>
          <Muted className="mt-2">
            Efter en veckas incheckningar börjar det gå att se mönster. Kurvorna dyker upp här av
            sig själva.
          </Muted>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Tillbaka till dagens steg
          </Link>
        </Card>
      ) : null}

      {recent.length >= 3 ? (
        <Card className="mb-4">
          <h2 className="font-bold text-ink">Humör över tid</h2>
          <Muted className="mt-1">
            {recent.length} incheckningar. Varje punkt är en dag du tog dig tid.
          </Muted>
          <div className="mt-5">
            <TrendChart
              label="Humör"
              points={recent.map((entry) => ({
                date: new Date(entry.createdAt),
                value: entry.data.mood,
              }))}
              domain={[1, 5]}
              color={moodLevel(recent[recent.length - 1]!.data.mood).color}
              invertGood={false}
            />
          </div>
        </Card>
      ) : null}

      {recent.length >= 5 ? (
        <Card className="mb-4">
          <h2 className="font-bold text-ink">Ångest per dag</h2>
          <Muted className="mt-1">Lägre är lugnare.</Muted>
          <div className="mt-5">
            <BarChart
              bars={recent.slice(-14).map((entry) => ({
                label: formatWeekday(new Date(entry.createdAt)),
                short: formatWeekday(new Date(entry.createdAt)).slice(0, 2),
                value: entry.data.anxiety,
                color:
                  entry.data.anxiety >= 4
                    ? 'var(--c-rose)'
                    : entry.data.anxiety === 3
                      ? 'var(--c-accent)'
                      : 'var(--c-primary)',
              }))}
              max={5}
            />
          </div>
        </Card>
      ) : null}

      {SCALE_ORDER.map((key: AssessmentKey) => {
        const entries = assessments.filter((entry) => entry.data.scale === key)
        if (entries.length < 2) return null

        const scale = SCALES[key]
        const scored = entries.map((entry) => ({
          date: new Date(entry.createdAt),
          value: scoreAssessment(key, entry.data.answers).score,
        }))
        const latest = scoreAssessment(key, entries[entries.length - 1]!.data.answers)

        return (
          <Card key={key} className="mb-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-bold text-ink">{scale.measures}</h2>
              <span className="text-sm text-ink-faint">
                {scale.name} · senast {latest.score} av {latest.max}
              </span>
            </div>
            <Muted className="mt-1">{latest.band.label}</Muted>
            <div className="mt-5">
              <TrendChart
                label={scale.measures}
                points={scored}
                domain={[0, key === 'who5' ? 100 : scale.maxScore]}
                color={
                  latest.band.tone === 'act'
                    ? 'var(--c-crisis)'
                    : latest.band.tone === 'watch'
                      ? 'var(--c-accent)'
                      : 'var(--c-primary)'
                }
                invertGood={scale.direction === 'higherIsWorse'}
              />
            </div>
          </Card>
        )
      })}

      {activityEffect ? (
        <Card className="mb-4">
          <h2 className="font-bold text-ink">Aktivitet och humör</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-primary-soft p-4">
              <p className="text-2xl font-bold tabular-nums text-primary-ink">
                {activityEffect.active}
              </p>
              <p className="mt-0.5 text-sm text-primary-ink/80">dagar du gjorde något</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-4">
              <p className="text-2xl font-bold tabular-nums text-ink">{activityEffect.quiet}</p>
              <p className="mt-0.5 text-sm text-ink-soft">dagar utan</p>
            </div>
          </div>
          <Muted className="mt-4">
            {activityEffect.active > activityEffect.quiet
              ? `Ditt humör ligger ${round(activityEffect.active - activityEffect.quiet)} steg högre de dagar du gör något. Det är sambandet beteendeaktivering bygger på – och nu är det ditt eget, inte en teori.`
              : 'Ännu ingen tydlig skillnad. Fortsätt registrera – sambandet brukar visa sig efter några veckor.'}
          </Muted>
        </Card>
      ) : null}

      {beliefShift !== null && thoughts.length >= 2 ? (
        <Card className="mb-4">
          <h2 className="font-bold text-ink">Tankearbetet</h2>
          <p className="mt-4 text-[2.5rem] font-bold leading-none tabular-nums text-ink">
            −{beliefShift}
          </p>
          <Muted className="mt-2">
            procentenheter är hur mycket din tilltro till de granskade tankarna sjunkit i
            genomsnitt, över {thoughts.length} tankedagböcker.
          </Muted>
        </Card>
      ) : null}

      {hasAnything ? (
        <Card tone="muted">
          <Muted>
            Kurvor går upp och ner. En dålig vecka betyder inte att det du gjort var förgäves – det
            är riktningen över månader som säger något, inte enskilda punkter.
          </Muted>
        </Card>
      ) : null}
    </div>
  )
}
