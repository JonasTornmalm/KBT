import { useState } from 'react'
import { useStore } from '../../app/VaultProvider'
import { Button } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { TextArea, TextInput } from '../../components/Field'
import { CheckIcon, PlusIcon, TrashIcon } from '../../components/Icons'
import { ListField } from '../../components/ListField'
import { ErrorState, LoadingState } from '../../components/PageState'
import { Slider } from '../../components/Slider'
import { VALUE_DOMAINS } from '../../content/library'
import { cn } from '../../lib/cn'
import { saveStatusLabel, useAutoSaveSingleton } from '../../lib/useAutoSave'
import { useAsync } from '../../lib/useAsync'
import { EmptyState, ToolPage } from './ToolPage'

export interface ValuesData {
  /** Nyckel: domän-id. Värden 0–10. */
  importance: Record<string, number>
  living: Record<string, number>
  /** Vad du vill stå för inom området, i egna ord. */
  statements: Record<string, string>
}

export interface GoalData {
  title: string
  domain?: string
  why: string
  steps: string[]
  doneSteps: string[]
  achieved: boolean
}

function emptyValues(): ValuesData {
  return { importance: {}, living: {}, statements: {} }
}

/** Glappet mellan hur viktigt något är och hur du faktiskt lever. */
function gap(values: ValuesData, id: string): number {
  return (values.importance[id] ?? 5) - (values.living[id] ?? 5)
}

function GoalCard({
  goal,
  onToggleStep,
  onToggleAchieved,
  onDelete,
}: {
  goal: { id: string; data: GoalData }
  onToggleStep: (step: string) => void
  onToggleAchieved: () => void
  onDelete: () => void
}) {
  const done = goal.data.steps.filter((step) => goal.data.doneSteps.includes(step)).length
  const ratio = goal.data.steps.length > 0 ? done / goal.data.steps.length : 0

  return (
    <Card tone={goal.data.achieved ? 'soft' : 'surface'}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {goal.data.domain ? (
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              {goal.data.domain}
            </p>
          ) : null}
          <h3
            className={cn(
              'mt-1 font-bold text-ink',
              goal.data.achieved && 'text-primary-ink line-through decoration-primary/40',
            )}
          >
            {goal.data.title}
          </h3>
          {goal.data.why ? (
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">{goal.data.why}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Ta bort målet ${goal.data.title}`}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-crisis-soft hover:text-crisis-ink"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>

      {goal.data.steps.length > 0 ? (
        <>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
          <ul className="mt-3 grid gap-1.5">
            {goal.data.steps.map((step) => {
              const checked = goal.data.doneSteps.includes(step)
              return (
                <li key={step}>
                  <button
                    type="button"
                    onClick={() => onToggleStep(step)}
                    className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors',
                        checked ? 'border-primary bg-primary' : 'border-line-strong',
                      )}
                    >
                      {checked ? <CheckIcon className="size-3.5 text-on-primary" /> : null}
                    </span>
                    <span
                      className={cn(
                        'leading-relaxed',
                        checked ? 'text-ink-faint line-through' : 'text-ink',
                      )}
                    >
                      {step}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

      <Button
        variant={goal.data.achieved ? 'outline' : 'soft'}
        size="sm"
        className="mt-4"
        onClick={onToggleAchieved}
      >
        {goal.data.achieved ? 'Öppna igen' : 'Målet är nått'}
      </Button>
    </Card>
  )
}

export function ValuesPage() {
  const store = useStore()
  const { value, update, status, error, loading } = useAutoSaveSingleton<ValuesData>(
    'values',
    emptyValues,
  )
  const { data: goals, error: goalsError, reload } = useAsync(
    () => store.byType<GoalData>('goal'),
    [store],
  )

  const [open, setOpen] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<GoalData>({
    title: '',
    why: '',
    steps: [],
    doneSteps: [],
    achieved: false,
  })

  if (error || goalsError) {
    return (
      <ToolPage toolId="values">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }
  if (loading || !value) {
    return (
      <ToolPage toolId="values">
        <LoadingState />
      </ToolPage>
    )
  }

  const ranked = [...VALUE_DOMAINS].sort((a, b) => gap(value, b.id) - gap(value, a.id))
  const biggest = ranked.filter((domain) => gap(value, domain.id) >= 3)

  const addGoal = async () => {
    if (!draft.title.trim()) return
    await store.create<GoalData>('goal', draft)
    setDraft({ title: '', why: '', steps: [], doneSteps: [], achieved: false })
    setAdding(false)
    reload()
  }

  const updateGoal = async (id: string, next: GoalData) => {
    await store.save<GoalData>(id, 'goal', next)
    reload()
  }

  return (
    <ToolPage toolId="values">
      <Card>
        <h2 className="font-bold text-ink">Värderingskompassen</h2>
        <Muted className="mt-1">
          Skatta varje område två gånger: hur viktigt det är för dig, och hur mycket du faktiskt
          lever så just nu. Det är skillnaden mellan de två som är intressant – inte siffrorna i
          sig.
        </Muted>
      </Card>

      <ul className="mt-4 grid gap-2">
        {VALUE_DOMAINS.map((domain) => {
          const expanded = open === domain.id
          const difference = gap(value, domain.id)

          return (
            <li key={domain.id}>
              <Card className="!p-0 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : domain.id)}
                  className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{domain.name}</span>
                    <span className="mt-1 flex items-center gap-3 text-sm text-ink-soft">
                      <span>Viktigt {value.importance[domain.id] ?? 5}</span>
                      <span aria-hidden>·</span>
                      <span>Lever {value.living[domain.id] ?? 5}</span>
                    </span>
                  </span>

                  <span
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-sm font-bold tabular-nums',
                      difference >= 4
                        ? 'bg-crisis-soft text-crisis-ink'
                        : difference >= 2
                          ? 'bg-accent-soft text-accent-ink'
                          : 'bg-primary-soft text-primary-ink',
                    )}
                  >
                    {difference > 0 ? `−${difference}` : '0'}
                  </span>
                </button>

                <div hidden={!expanded} className="border-t border-line px-5 pb-5 pt-4">
                  <Muted>{domain.prompt}</Muted>
                  <div className="mt-5 grid gap-5">
                    <Slider
                      label="Hur viktigt är det för dig?"
                      value={value.importance[domain.id] ?? 5}
                      onChange={(next) =>
                        update((current) => ({
                          ...current,
                          importance: { ...current.importance, [domain.id]: next },
                        }))
                      }
                      min={0}
                      max={10}
                      anchors={['Inte alls', 'Avgörande']}
                    />
                    <Slider
                      label="Hur mycket lever du så just nu?"
                      value={value.living[domain.id] ?? 5}
                      onChange={(next) =>
                        update((current) => ({
                          ...current,
                          living: { ...current.living, [domain.id]: next },
                        }))
                      }
                      min={0}
                      max={10}
                      tone="accent"
                      anchors={['Inte alls', 'Helt och hållet']}
                    />
                    <TextArea
                      label="Vad vill du stå för här?"
                      hint="Frivilligt. Skriv som en riktning, inte som ett mål: 'vara någon som hör av sig', inte 'ringa mamma på tisdag'."
                      value={value.statements[domain.id] ?? ''}
                      onChange={(event) =>
                        update((current) => ({
                          ...current,
                          statements: { ...current.statements, [domain.id]: event.target.value },
                        }))
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      <p aria-live="polite" className="mt-4 h-5 text-sm font-medium text-primary">
        {saveStatusLabel(status)}
      </p>

      {biggest.length > 0 ? (
        <Card tone="soft" className="mt-2">
          <h2 className="font-bold text-primary-ink">Där glappet är störst</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-primary-ink">
            {biggest
              .slice(0, 3)
              .map((domain) => domain.name.toLowerCase())
              .join(', ')}
            . Det är här förändring är värd besväret – ett litet steg i ett viktigt område ger mer
            än ett stort steg i ett oviktigt.
          </p>
        </Card>
      ) : null}

      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Mål</h2>
          {!adding ? (
            <Button size="sm" variant="soft" onClick={() => setAdding(true)}>
              <PlusIcon className="size-[1.15rem]" />
              Nytt mål
            </Button>
          ) : null}
        </div>

        {adding ? (
          <Card>
            <div className="grid gap-5">
              <TextInput
                label="Vad vill du kunna göra?"
                hint="Konkret och mätbart. 'Träffa en vän varannan vecka', inte 'bli mer social'."
                value={draft.title}
                onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
              />
              <TextArea
                label="Varför spelar det roll?"
                hint="Kopplingen till en värdering är det som bär när motivationen tryter."
                value={draft.why}
                onChange={(event) => setDraft((d) => ({ ...d, why: event.target.value }))}
                rows={2}
              />
              <ListField
                label="Delsteg"
                hint="Bryt ner det tills första steget går att göra den här veckan."
                items={draft.steps}
                onChange={(steps) => setDraft((d) => ({ ...d, steps }))}
                placeholder="Skicka ett meddelande till Anna"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void addGoal()} disabled={!draft.title.trim()}>
                  Spara målet
                </Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>
                  Avbryt
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {goals && goals.length > 0 ? (
          <ul className={cn('grid gap-3', adding && 'mt-3')}>
            {goals.map((goal) => (
              <li key={goal.id}>
                <GoalCard
                  goal={goal}
                  onToggleStep={(step) =>
                    void updateGoal(goal.id, {
                      ...goal.data,
                      doneSteps: goal.data.doneSteps.includes(step)
                        ? goal.data.doneSteps.filter((item) => item !== step)
                        : [...goal.data.doneSteps, step],
                    })
                  }
                  onToggleAchieved={() =>
                    void updateGoal(goal.id, { ...goal.data, achieved: !goal.data.achieved })
                  }
                  onDelete={() =>
                    void store.remove(goal.id).then(() => {
                      reload()
                    })
                  }
                />
              </li>
            ))}
          </ul>
        ) : !adding ? (
          <EmptyState
            title="Inga mål än"
            body="Ett program utan mål blir en hobby. Vad vill du kunna göra om åtta veckor som du inte gör nu?"
            action={<Button onClick={() => setAdding(true)}>Sätt ett mål</Button>}
          />
        ) : null}
      </section>
    </ToolPage>
  )
}
