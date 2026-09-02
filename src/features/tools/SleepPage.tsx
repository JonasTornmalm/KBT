import { useState } from 'react'
import { useStore } from '../../app/VaultProvider'
import { Button } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { BarChart } from '../../components/Chart'
import { TextArea, TextInput } from '../../components/Field'
import { MoonIcon, TrashIcon } from '../../components/Icons'
import { Slider } from '../../components/Slider'
import {
  STIMULUS_CONTROL_RULES,
  sleepAdvice,
  sleepMetrics,
  type SleepEntryData,
} from '../../domain/sleep'
import { addDays, formatShort, formatWeekday, toDayKey } from '../../lib/date'
import { useAsync } from '../../lib/useAsync'
import { EmptyState, ToolPage } from './ToolPage'

const formatDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`

function emptyEntry(): SleepEntryData {
  return {
    bedtime: '23:00',
    minutesToFallAsleep: 20,
    minutesAwake: 0,
    wakeTime: '07:00',
    riseTime: '07:00',
    quality: 3,
    note: '',
  }
}

export function SleepPage() {
  const store = useStore()
  const [draft, setDraft] = useState<SleepEntryData>(emptyEntry)
  const [saved, setSaved] = useState(false)

  const { data, reload } = useAsync(
    () => store.byType<SleepEntryData>('sleepDiary', { limit: 60 }),
    [store],
  )
  const entries = data ?? []
  const advice = sleepAdvice(entries.slice(0, 7).map((entry) => entry.data))

  const set = <K extends keyof SleepEntryData>(key: K, value: SleepEntryData[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const preview = sleepMetrics(draft)

  const save = async () => {
    // Natten hör till morgonen den avslutas, alltså gårdagen om man fyller i på kvällen.
    const yesterday = toDayKey(addDays(new Date(), 0))
    await store.create<SleepEntryData>('sleepDiary', draft, { day: yesterday })
    setSaved(true)
    reload()
    window.setTimeout(() => setSaved(false), 2600)
  }

  const remove = async (id: string) => {
    await store.remove(id)
    reload()
  }

  const bars = entries
    .slice(0, 14)
    .reverse()
    .map((entry) => {
      const metrics = sleepMetrics(entry.data)
      return {
        label: formatShort(new Date(entry.createdAt)),
        short: formatWeekday(new Date(entry.createdAt)).slice(0, 2),
        value: Math.round((metrics.totalSleep / 60) * 10) / 10,
        color:
          metrics.efficiency >= 85
            ? 'var(--c-primary)'
            : metrics.efficiency >= 70
              ? 'var(--c-accent)'
              : 'var(--c-rose)',
      }
    })

  return (
    <ToolPage toolId="sleep">
      <Card>
        <h2 className="font-bold text-ink">Hur var natten?</h2>
        <Muted className="mt-1">Fyll i på morgonen, medan du minns. Ungefärligt räcker.</Muted>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Jag la mig"
              type="time"
              value={draft.bedtime}
              onChange={(event) => set('bedtime', event.target.value)}
            />
            <TextInput
              label="Jag vaknade för sista gången"
              type="time"
              value={draft.wakeTime}
              onChange={(event) => set('wakeTime', event.target.value)}
            />
            <TextInput
              label="Jag steg upp"
              type="time"
              value={draft.riseTime}
              onChange={(event) => set('riseTime', event.target.value)}
            />
          </div>

          <Slider
            label="Minuter för att somna"
            value={draft.minutesToFallAsleep}
            onChange={(value) => set('minutesToFallAsleep', value)}
            min={0}
            max={180}
            step={5}
            suffix=" min"
            tone="calm"
            anchors={['Direkt', '3 timmar']}
          />
          <Slider
            label="Vaken under natten, totalt"
            value={draft.minutesAwake}
            onChange={(value) => set('minutesAwake', value)}
            min={0}
            max={240}
            step={5}
            suffix=" min"
            tone="calm"
            anchors={['Inte alls', '4 timmar']}
          />
          <Slider
            label="Hur utvilad kändes du?"
            value={draft.quality}
            onChange={(value) => set('quality', value)}
            min={1}
            max={5}
            anchors={['Helt slut', 'Pigg']}
          />

          <TextArea
            label="Något som påverkade natten? (frivilligt)"
            value={draft.note ?? ''}
            onChange={(event) => set('note', event.target.value)}
            rows={2}
            placeholder="Kaffe efter fyra. Låg och tänkte på mötet."
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-surface-2 p-4 text-center">
          <div>
            <p className="text-lg font-bold tabular-nums text-ink">
              {formatDuration(preview.timeInBed)}
            </p>
            <p className="text-xs text-ink-faint">i sängen</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-ink">
              {formatDuration(preview.totalSleep)}
            </p>
            <p className="text-xs text-ink-faint">sömn</p>
          </div>
          <div>
            <p
              className="text-lg font-bold tabular-nums"
              style={{
                color:
                  preview.efficiency >= 85
                    ? 'var(--c-primary)'
                    : preview.efficiency >= 70
                      ? 'var(--c-accent)'
                      : 'var(--c-rose)',
              }}
            >
              {preview.efficiency} %
            </p>
            <p className="text-xs text-ink-faint">effektivitet</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <Button size="lg" onClick={() => void save()}>
            Spara natten
          </Button>
          <span aria-live="polite" className="text-sm font-medium text-primary">
            {saved ? 'Sparat' : ''}
          </span>
        </div>
      </Card>

      {advice ? (
        <Card className="mt-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-calm-soft text-calm-ink">
              <MoonIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-bold text-ink">{advice.headline}</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{advice.body}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-2 p-4">
              <p className="text-2xl font-bold tabular-nums text-ink">
                {advice.averageEfficiency} %
              </p>
              <p className="mt-0.5 text-sm text-ink-faint">effektivitet i snitt</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-4">
              <p className="text-2xl font-bold tabular-nums text-ink">
                {formatDuration(advice.averageSleep)}
              </p>
              <p className="mt-0.5 text-sm text-ink-faint">sömn per natt</p>
            </div>
          </div>
        </Card>
      ) : null}

      {bars.length > 0 ? (
        <Card className="mt-6">
          <h2 className="font-bold text-ink">Sömn per natt</h2>
          <Muted className="mt-1">Timmar sömn. Färgen visar effektiviteten.</Muted>
          <div className="mt-5">
            <BarChart bars={bars} max={10} suffix=" h" />
          </div>
        </Card>
      ) : null}

      <Card tone="muted" className="mt-6">
        <h2 className="font-bold text-ink">Stimuluskontroll</h2>
        <Muted className="mt-1">
          Reglerna som hör ihop med sömnrestriktion. De är minst lika viktiga som tiderna.
        </Muted>
        <ul className="mt-4 grid gap-3">
          {STIMULUS_CONTROL_RULES.map((rule, index) => (
            <li key={rule} className="flex gap-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-calm-soft text-sm font-bold text-calm-ink">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed text-ink-soft">{rule}</span>
            </li>
          ))}
        </ul>
      </Card>

      {entries.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-ink">Tidigare nätter</h2>
          <ul className="grid gap-2">
            {entries.slice(0, 14).map((entry) => {
              const metrics = sleepMetrics(entry.data)
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-4 rounded-xl bg-surface px-4 py-3 shadow-soft"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {formatShort(new Date(entry.createdAt))} · {entry.data.bedtime}–
                      {entry.data.riseTime}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {formatDuration(metrics.totalSleep)} sömn · {metrics.efficiency} %
                      effektivitet
                    </p>
                    {entry.data.note ? (
                      <p className="mt-1 text-sm text-ink-faint">{entry.data.note}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(entry.id)}
                    aria-label="Ta bort natten"
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-crisis-soft hover:text-crisis-ink"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Inga nätter registrerade"
            body="Efter tre nätter kan appen räkna ut din sömneffektivitet och föreslå en sängtid."
          />
        </div>
      )}
    </ToolPage>
  )
}
