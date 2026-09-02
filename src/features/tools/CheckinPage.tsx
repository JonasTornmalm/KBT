import { useEffect, useState } from 'react'
import { useStore } from '../../app/VaultProvider'
import { Button } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { TextArea } from '../../components/Field'
import {
  ANXIETY_LABELS,
  ENERGY_LABELS,
  MOOD_LEVELS,
  moodLevel,
  type CheckinData,
} from '../../domain/checkin'
import { cn } from '../../lib/cn'
import { formatRelativeDay, toDayKey } from '../../lib/date'
import type { Entry } from '../../lib/db/types'
import { useAsync } from '../../lib/useAsync'
import { EmptyState, ToolPage } from './ToolPage'

function ScalePicker({
  label,
  hint,
  value,
  onChange,
  labels,
  colors,
}: {
  label: string
  hint?: string
  value: number
  onChange: (value: number) => void
  labels: string[]
  colors?: string[]
}) {
  return (
    <fieldset>
      <legend className="font-semibold text-ink">{label}</legend>
      {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
        {labels.map((text, index) => {
          const level = index + 1
          const active = value === level
          const color = colors?.[index] ?? 'var(--c-primary)'
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-pressed={active}
              className={cn(
                'flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border px-1 py-2 transition-colors duration-200',
                active ? 'border-transparent' : 'border-line bg-surface hover:border-line-strong',
              )}
              style={active ? { background: `${color}`, borderColor: color } : undefined}
            >
              <span
                className="size-3 rounded-full"
                style={{ background: active ? 'var(--c-surface)' : color, opacity: active ? 1 : 0.5 }}
              />
              <span
                className={cn(
                  'text-center text-[0.6875rem] leading-tight',
                  active ? 'font-semibold' : 'text-ink-soft',
                )}
                style={active ? { color: 'var(--c-surface)' } : undefined}
              >
                {text}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function CheckinPage() {
  const store = useStore()
  const today = toDayKey()

  const { data, reload } = useAsync(async () => {
    const [todays, history] = await Promise.all([
      store.byType<CheckinData>('checkin', { from: today, to: today, limit: 1 }),
      store.byType<CheckinData>('checkin', { limit: 30 }),
    ])
    return { today: todays[0], history }
  }, [store, today])

  const [draft, setDraft] = useState<CheckinData>({ mood: 3, energy: 3, anxiety: 3, note: '' })
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (data?.today) setDraft({ note: '', ...data.today.data })
  }, [data?.today])

  const existing: Entry<CheckinData> | undefined = data?.today

  const save = async () => {
    setBusy(true)
    try {
      if (existing) await store.save<CheckinData>(existing.id, 'checkin', draft, existing.day)
      else await store.create<CheckinData>('checkin', draft)
      setSaved(true)
      reload()
      window.setTimeout(() => setSaved(false), 2600)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolPage toolId="checkin">
      <Card>
        <div className="grid gap-7">
          <ScalePicker
            label="Humör"
            value={draft.mood}
            onChange={(mood) => setDraft((d) => ({ ...d, mood }))}
            labels={MOOD_LEVELS.map((level) => level.label)}
            colors={MOOD_LEVELS.map((level) => level.color)}
          />
          <ScalePicker
            label="Energi"
            value={draft.energy}
            onChange={(energy) => setDraft((d) => ({ ...d, energy }))}
            labels={ENERGY_LABELS}
          />
          <ScalePicker
            label="Ångest"
            hint="Här betyder ett lågt värde att du är lugn."
            value={draft.anxiety}
            onChange={(anxiety) => setDraft((d) => ({ ...d, anxiety }))}
            labels={ANXIETY_LABELS}
            colors={[
              'var(--c-primary)',
              'var(--c-primary-vivid)',
              'var(--c-accent)',
              'var(--c-rose)',
              'var(--c-crisis)',
            ]}
          />

          <TextArea
            label="Något du vill minnas från idag"
            hint="Frivilligt. En rad räcker – det är den som gör kurvan begriplig om ett halvår."
            value={draft.note ?? ''}
            onChange={(event) => setDraft((d) => ({ ...d, note: event.target.value }))}
            rows={3}
            placeholder="Tog promenaden trots att jag inte ville."
          />
        </div>

        <div className="mt-7 flex items-center gap-4">
          <Button size="lg" onClick={() => void save()} disabled={busy}>
            {existing ? 'Uppdatera dagen' : 'Spara incheckning'}
          </Button>
          <span aria-live="polite" className="text-sm font-medium text-primary">
            {saved ? 'Sparat' : ''}
          </span>
        </div>
      </Card>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-ink">Tidigare dagar</h2>
        {data && data.history.length > 0 ? (
          <ul className="grid gap-2">
            {data.history.map((entry) => {
              const level = moodLevel(entry.data.mood)
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-4 rounded-xl bg-surface px-4 py-3 shadow-soft"
                >
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full"
                    style={{ background: level.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
                      <span className="font-semibold text-ink">
                        {formatRelativeDay(new Date(entry.createdAt))}
                      </span>
                      <span className="text-ink-soft">{level.label}</span>
                      <span className="text-ink-faint">
                        Energi {entry.data.energy}/5 · Ångest {entry.data.anxiety}/5
                      </span>
                    </p>
                    {entry.data.note ? (
                      <p className="mt-1 leading-relaxed text-ink-soft">{entry.data.note}</p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState
            title="Inga incheckningar än"
            body="Efter en vecka börjar mönstren synas. Efter en månad går de att lita på."
          />
        )}
        {data && data.history.length > 0 ? (
          <Muted className="mt-4">
            Visar de senaste {data.history.length} dagarna. Hela utvecklingen finns under Insikter.
          </Muted>
        ) : null}
      </section>
    </ToolPage>
  )
}
