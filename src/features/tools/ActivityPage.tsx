import { useState } from 'react'
import { useStore } from '../../app/VaultProvider'
import { Button } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { TextInput } from '../../components/Field'
import { CheckIcon, PlusIcon, TrashIcon } from '../../components/Icons'
import { ErrorState } from '../../components/PageState'
import { Sheet } from '../../components/Sheet'
import { Slider } from '../../components/Slider'
import { ACTIVITY_SUGGESTIONS } from '../../content/library'
import { cn } from '../../lib/cn'
import {
  addDays,
  formatWeekday,
  isSameDay,
  startOfWeek,
  toDayKey,
  type DayKey,
} from '../../lib/date'
import type { Entry } from '../../lib/db/types'
import { useAsync } from '../../lib/useAsync'
import { EmptyState, ToolPage } from './ToolPage'

export interface ActivityData {
  title: string
  time?: string
  domain?: string
  done: boolean
  /** Glädje 0–10: hur mycket njöt du av det? */
  pleasure?: number
  /** Bemästring 0–10: hur mycket kändes det som att du åstadkom något? */
  mastery?: number
}

const weekLabel = (start: Date) => {
  const end = addDays(start, 6)
  const sameMonth = start.getMonth() === end.getMonth()
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  })
  return `${fmt.format(start)}–${new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' }).format(end)}`
}

function RatingSheet({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: Entry<ActivityData> | null
  onClose: () => void
  onSave: (data: ActivityData) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [pleasure, setPleasure] = useState(5)
  const [mastery, setMastery] = useState(5)
  const [initialised, setInitialised] = useState<string | null>(null)

  if (entry && initialised !== entry.id) {
    setPleasure(entry.data.pleasure ?? 5)
    setMastery(entry.data.mastery ?? 5)
    setInitialised(entry.id)
  }

  return (
    <Sheet open={Boolean(entry)} onClose={onClose} title={entry?.data.title ?? ''}>
      {entry ? (
        <div className="grid gap-7">
          <Muted>
            Skatta i efterhand, inte i förväg. Poängen är att upptäcka vad som faktiskt gav dig
            något – det stämmer förvånansvärt sällan med vad man gissar.
          </Muted>

          <Slider
            label="Glädje"
            hint="Hur mycket njöt du av det, i stunden?"
            value={pleasure}
            onChange={setPleasure}
            min={0}
            max={10}
            tone="accent"
            anchors={['Inget alls', 'Väldigt mycket']}
          />
          <Slider
            label="Bemästring"
            hint="Hur mycket kändes det som att du åstadkom något?"
            value={mastery}
            onChange={setMastery}
            min={0}
            max={10}
            anchors={['Inget alls', 'Väldigt mycket']}
          />

          <div className="grid gap-3">
            <Button
              size="lg"
              fullWidth
              onClick={() =>
                void onSave({ ...entry.data, done: true, pleasure, mastery }).then(onClose)
              }
            >
              Spara som genomförd
            </Button>
            {entry.data.done ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => void onSave({ ...entry.data, done: false }).then(onClose)}
              >
                Markera som inte genomförd
              </Button>
            ) : null}
            <Button variant="ghost" fullWidth onClick={() => void onDelete().then(onClose)}>
              <TrashIcon className="size-[1.15rem]" />
              Ta bort
            </Button>
          </div>
        </div>
      ) : null}
    </Sheet>
  )
}

function AddSheet({
  open,
  day,
  onClose,
  onAdd,
}: {
  open: boolean
  day: DayKey
  onClose: () => void
  onAdd: (data: ActivityData, day: DayKey) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')

  const submit = async () => {
    if (!title.trim()) return
    await onAdd({ title: title.trim(), time: time || undefined, done: false }, day)
    setTitle('')
    setTime('')
    onClose()
  }

  const domains = [...new Set(ACTIVITY_SUGGESTIONS.map((item) => item.domain))]

  return (
    <Sheet open={open} onClose={onClose} title="Lägg till aktivitet">
      <div className="grid gap-5">
        <TextInput
          label="Vad ska du göra?"
          hint="Så konkret att du vet exakt vad som ska hända. Hellre för litet än för stort."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Promenad runt kvarteret"
        />
        <TextInput
          label="När? (frivilligt)"
          hint="En aktivitet med klockslag blir ungefär dubbelt så trolig att bli av."
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />

        <div>
          <p className="mb-2 font-semibold text-ink">Eller välj ur förslagen</p>
          <div className="grid max-h-64 gap-4 overflow-y-auto pr-1">
            {domains.map((domain) => (
              <div key={domain}>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-faint">
                  {domain}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_SUGGESTIONS.filter((item) => item.domain === domain).map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setTitle(item.label)}
                      className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-primary hover:text-primary-ink"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" fullWidth disabled={!title.trim()} onClick={() => void submit()}>
          Lägg till
        </Button>
      </div>
    </Sheet>
  )
}

export function ActivityPage() {
  const store = useStore()
  const [weekStart, setWeekStart] = useState(() => startOfWeek())
  const [addDay, setAddDay] = useState<DayKey | null>(null)
  const [rating, setRating] = useState<Entry<ActivityData> | null>(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const from = toDayKey(weekStart)
  const to = toDayKey(addDays(weekStart, 6))

  const { data, error, reload } = useAsync(async () => {
    const [week, all] = await Promise.all([
      store.byType<ActivityData>('activity', { from, to, order: 'asc' }),
      store.byType<ActivityData>('activity', { limit: 200 }),
    ])
    return { week, all }
  }, [store, from, to])

  const week = data?.week ?? []
  const rated = (data?.all ?? []).filter(
    (entry) => entry.data.done && entry.data.pleasure !== undefined,
  )

  const best = [...rated]
    .sort(
      (a, b) =>
        (b.data.pleasure ?? 0) + (b.data.mastery ?? 0) - ((a.data.pleasure ?? 0) + (a.data.mastery ?? 0)),
    )
    .slice(0, 5)

  const averages =
    rated.length > 0
      ? {
          pleasure: rated.reduce((sum, e) => sum + (e.data.pleasure ?? 0), 0) / rated.length,
          mastery: rated.reduce((sum, e) => sum + (e.data.mastery ?? 0), 0) / rated.length,
        }
      : null

  const add = async (activity: ActivityData, day: DayKey) => {
    await store.create<ActivityData>('activity', activity, { day })
    reload()
  }

  const saveActivity = async (data: ActivityData) => {
    if (!rating) return
    await store.save<ActivityData>(rating.id, 'activity', data, rating.day)
    reload()
  }

  const removeActivity = async () => {
    if (!rating) return
    await store.remove(rating.id)
    reload()
  }

  if (error) {
    return (
      <ToolPage toolId="activity">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }

  return (
    <ToolPage toolId="activity">
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            aria-label="Föregående vecka"
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
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
          <p className="font-semibold text-ink">{weekLabel(weekStart)}</p>
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            aria-label="Nästa vecka"
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
              <path
                d="M7.5 4 13.5 10l-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <ul className="divide-y divide-line">
          {days.map((day) => {
            const key = toDayKey(day)
            const items = week.filter((entry) => entry.day === key)
            const today = isSameDay(day, new Date())

            return (
              <li key={key} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={cn(
                      'text-sm font-semibold capitalize',
                      today ? 'text-primary' : 'text-ink-soft',
                    )}
                  >
                    {formatWeekday(day)} {day.getDate()}
                    {today ? ' · idag' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddDay(key)}
                    aria-label={`Lägg till aktivitet ${formatWeekday(day)}`}
                    className="grid size-9 place-items-center rounded-full text-ink-faint transition-colors hover:bg-primary-soft hover:text-primary-ink"
                  >
                    <PlusIcon className="size-[1.15rem]" />
                  </button>
                </div>

                {items.length > 0 ? (
                  <ul className="mt-1 grid gap-1.5">
                    {items.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => setRating(entry)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                            entry.data.done ? 'bg-primary-soft' : 'bg-surface-2 hover:bg-canvas-soft',
                          )}
                        >
                          <span
                            className={cn(
                              'grid size-6 shrink-0 place-items-center rounded-md border-2',
                              entry.data.done
                                ? 'border-primary bg-primary'
                                : 'border-line-strong',
                            )}
                          >
                            {entry.data.done ? (
                              <CheckIcon className="size-4 text-on-primary" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                'block truncate',
                                entry.data.done ? 'text-primary-ink' : 'text-ink',
                              )}
                            >
                              {entry.data.time ? (
                                <span className="mr-2 tabular-nums text-ink-faint">
                                  {entry.data.time}
                                </span>
                              ) : null}
                              {entry.data.title}
                            </span>
                          </span>
                          {entry.data.done && entry.data.pleasure !== undefined ? (
                            <span className="shrink-0 text-xs font-semibold tabular-nums text-primary-ink">
                              G {entry.data.pleasure} · B {entry.data.mastery}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      </Card>

      {averages ? (
        <Card className="mt-6">
          <h2 className="font-bold text-ink">Vad veckorna har gett dig</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-accent-soft p-4">
              <p className="text-2xl font-bold tabular-nums text-accent-ink">
                {averages.pleasure.toFixed(1)}
              </p>
              <p className="mt-0.5 text-sm text-accent-ink/80">Glädje i snitt</p>
            </div>
            <div className="rounded-xl bg-primary-soft p-4">
              <p className="text-2xl font-bold tabular-nums text-primary-ink">
                {averages.mastery.toFixed(1)}
              </p>
              <p className="mt-0.5 text-sm text-primary-ink/80">Bemästring i snitt</p>
            </div>
          </div>
          <Muted className="mt-4">
            {Math.abs(averages.pleasure - averages.mastery) < 1.5
              ? 'Din vecka innehåller ungefär lika mycket av båda. Det är en bra balans.'
              : averages.pleasure > averages.mastery
                ? 'Du får mer glädje än bemästring. Lägg gärna in något som känns som en prestation, även litet.'
                : 'Du får mer bemästring än glädje. Din vecka består mest av sådant du ska – lägg in något som bara är trevligt.'}
          </Muted>

          {best.length > 0 ? (
            <>
              <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-faint">
                Det som gett dig mest
              </h3>
              <ul className="mt-2 grid gap-1.5">
                {best.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-2.5"
                  >
                    <span className="min-w-0 truncate text-ink">{entry.data.title}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-soft">
                      {(entry.data.pleasure ?? 0) + (entry.data.mastery ?? 0)} / 20
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
      ) : week.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Tom vecka"
            body="Börja med att registrera det du faktiskt gör – även småsaker. Nästa vecka planerar du i förväg."
          />
        </div>
      ) : null}

      <AddSheet
        open={addDay !== null}
        day={addDay ?? toDayKey()}
        onClose={() => setAddDay(null)}
        onAdd={add}
      />
      <RatingSheet
        entry={rating}
        onClose={() => setRating(null)}
        onSave={saveActivity}
        onDelete={removeActivity}
      />
    </ToolPage>
  )
}
