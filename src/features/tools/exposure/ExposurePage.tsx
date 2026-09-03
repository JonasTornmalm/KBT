import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../app/VaultProvider'
import { Button, ButtonLink } from '../../../components/Button'
import { Card, Muted } from '../../../components/Card'
import { TextInput } from '../../../components/Field'
import { ArrowRightIcon, PlusIcon, TrashIcon } from '../../../components/Icons'
import { ListField } from '../../../components/ListField'
import { ErrorState, LoadingState } from '../../../components/PageState'
import { Slider } from '../../../components/Slider'
import { SAFETY_BEHAVIOURS } from '../../../content/library'
import { cn } from '../../../lib/cn'
import { formatRelativeDay } from '../../../lib/date'
import { useAsync } from '../../../lib/useAsync'
import { EmptyState, ToolPage } from '../ToolPage'
import {
  sortedSteps,
  sudSummary,
  type ExposureLadderData,
  type ExposureSessionData,
} from './types'

const sudColor = (value: number) =>
  value >= 70 ? 'var(--c-crisis)' : value >= 40 ? 'var(--c-accent)' : 'var(--c-primary)'

export function ExposurePage() {
  const store = useStore()
  const navigate = useNavigate()
  const [theme, setTheme] = useState('')

  const { data, error, reload } = useAsync(async () => {
    const [ladders, sessions] = await Promise.all([
      store.byType<ExposureLadderData>('exposureLadder', { order: 'asc' }),
      store.byType<ExposureSessionData>('exposureSession'),
    ])
    return { ladders, sessions }
  }, [store])

  const create = async () => {
    if (!theme.trim()) return
    const created = await store.create<ExposureLadderData>('exposureLadder', {
      theme: theme.trim(),
      steps: [],
      safetyBehaviours: [],
    })
    setTheme('')
    reload()
    navigate(`/verktyg/exponering/${created.id}`)
  }

  const ladders = data?.ladders ?? []

  if (error) {
    return (
      <ToolPage toolId="exposure">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }

  return (
    <ToolPage toolId="exposure">
      {ladders.length === 0 ? (
        <EmptyState
          title="Ingen trappa än"
          body="Börja med att namnge vad det handlar om. Sedan fyller du på med situationer, från den lättaste till den svåraste."
        />
      ) : (
        <ul className="grid gap-3">
          {ladders.map((ladder) => {
            const steps = sortedSteps(ladder.data)
            const sessions = (data?.sessions ?? []).filter(
              (session) => session.data.ladderId === ladder.id,
            )
            return (
              <li key={ladder.id}>
                <Link
                  to={`/verktyg/exponering/${ladder.id}`}
                  className="group flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">{ladder.data.theme}</span>
                    <span className="mt-1 block text-sm text-ink-soft">
                      {steps.length} steg · {sessions.length}{' '}
                      {sessions.length === 1 ? 'genomfört pass' : 'genomförda pass'}
                    </span>
                  </span>
                  <ArrowRightIcon className="size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Card className="mt-6">
        <h2 className="font-bold text-ink">Ny trappa</h2>
        <Muted className="mt-1">
          En trappa per sak du undviker. &rdquo;Sociala situationer&rdquo; och &rdquo;att åka
          buss&rdquo; hör inte hemma i samma.
        </Muted>
        <div className="mt-4 flex gap-2">
          <TextInput
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void create()
            }}
            placeholder="Vad handlar det om?"
            aria-label="Vad trappan handlar om"
          />
          <Button onClick={() => void create()} disabled={!theme.trim()} aria-label="Skapa trappa">
            <PlusIcon className="size-5" />
          </Button>
        </div>
      </Card>
    </ToolPage>
  )
}

export function ExposureLadderPage() {
  const { id = '' } = useParams()
  const store = useStore()
  const navigate = useNavigate()

  const [draft, setDraft] = useState('')
  const [expected, setExpected] = useState(50)

  const { data, loading, error, reload } = useAsync(async () => {
    const [ladder, sessions] = await Promise.all([
      store.get<ExposureLadderData>(id),
      store.byType<ExposureSessionData>('exposureSession'),
    ])
    return { ladder, sessions: sessions.filter((session) => session.data.ladderId === id) }
  }, [store, id])

  if (error) {
    return (
      <ToolPage toolId="exposure">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }
  if (loading) {
    return (
      <ToolPage toolId="exposure">
        <LoadingState />
      </ToolPage>
    )
  }
  if (!data?.ladder) {
    return (
      <ToolPage toolId="exposure">
        <EmptyState
          title="Trappan finns inte"
          body="Den kan ha tagits bort."
          action={<ButtonLink to="/verktyg/exponering">Till exponeringen</ButtonLink>}
        />
      </ToolPage>
    )
  }
  const ladder = data.ladder
  const steps = sortedSteps(ladder.data)

  const update = async (next: ExposureLadderData) => {
    await store.save<ExposureLadderData>(id, 'exposureLadder', next, ladder.day)
    reload()
  }

  const addStep = async () => {
    if (!draft.trim()) return
    await update({
      ...ladder.data,
      steps: [
        ...ladder.data.steps,
        { id: crypto.randomUUID(), text: draft.trim(), expected },
      ],
    })
    setDraft('')
    setExpected(50)
  }

  const removeLadder = async () => {
    if (!window.confirm(`Ta bort trappan "${ladder.data.theme}" och alla dess pass?`)) return
    await store.remove(id)
    for (const session of data.sessions) await store.remove(session.id)
    navigate('/verktyg/exponering', { replace: true })
  }

  return (
    <ToolPage
      toolId="exposure"
      intro={
        <Muted className="mt-3">
          {ladder.data.theme} · {steps.length} steg. Börja runt 40 – tillräckligt obehagligt för att
          lära, tillräckligt görbart för att bli av.
        </Muted>
      }
    >
      <ol className="grid gap-2">
        {steps.map((step) => {
          const done = data.sessions.filter((session) => session.data.stepId === step.id)
          const last = done[0]
          const summary = last ? sudSummary(last.data.readings) : null

          return (
            <li key={step.id}>
              <Card className="!p-4">
                <div className="flex items-start gap-4">
                  <span
                    className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold tabular-nums"
                    style={{ background: `${sudColor(step.expected)}1f`, color: sudColor(step.expected) }}
                  >
                    {step.expected}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-ink">{step.text}</p>
                    {done.length > 0 && summary ? (
                      <p className="mt-1 text-sm text-ink-soft">
                        {done.length} {done.length === 1 ? 'pass' : 'pass'} · senast topp{' '}
                        {summary.peak} → slut {summary.end}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Button
                      size="sm"
                      variant={done.length > 0 ? 'soft' : 'primary'}
                      onClick={() =>
                        navigate(`/verktyg/exponering/${id}/pass?steg=${step.id}`)
                      }
                    >
                      {done.length > 0 ? 'Igen' : 'Gör'}
                    </Button>
                    <button
                      type="button"
                      onClick={() =>
                        void update({
                          ...ladder.data,
                          steps: ladder.data.steps.filter((item) => item.id !== step.id),
                        })
                      }
                      aria-label={`Ta bort steget: ${step.text}`}
                      className="grid size-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-crisis-soft hover:text-crisis-ink"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ol>

      <Card className={cn(steps.length > 0 && 'mt-4')}>
        <h2 className="font-bold text-ink">Lägg till ett steg</h2>
        <div className="mt-4 grid gap-5">
          <TextInput
            label="Situationen"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Fråga någon i kassan var mjölken står"
          />
          <Slider
            label="Hur mycket ångest tror du att det ger?"
            value={expected}
            onChange={setExpected}
            step={5}
            tone="rose"
            anchors={['Ingen alls', 'Värsta tänkbara']}
          />
          <Button onClick={() => void addStep()} disabled={!draft.trim()}>
            <PlusIcon className="size-5" />
            Lägg till i trappan
          </Button>
        </div>
      </Card>

      <Card className="mt-4">
        <ListField
          label="Säkerhetsbeteenden att släppa"
          hint="Knepen du använder för att stå ut. De ska bort ett i taget – annars hamnar erfarenheten på deras konto."
          items={ladder.data.safetyBehaviours}
          onChange={(safetyBehaviours) => void update({ ...ladder.data, safetyBehaviours })}
          suggestions={SAFETY_BEHAVIOURS}
        />
      </Card>

      {data.sessions.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-ink">Genomförda pass</h2>
          <ul className="grid gap-2">
            {data.sessions.map((session) => {
              const summary = sudSummary(session.data.readings)
              return (
                <li key={session.id}>
                  <Card className="!p-4">
                    <p className="text-xs text-ink-faint">
                      {formatRelativeDay(new Date(session.createdAt))} ·{' '}
                      {Math.round(session.data.durationSeconds / 60)} min
                    </p>
                    <p className="mt-1 font-medium text-ink">{session.data.stepText}</p>
                    {summary ? (
                      <p className="mt-2 text-sm tabular-nums text-ink-soft">
                        Start {summary.start} · topp {summary.peak} · slut {summary.end}
                        {summary.drop > 0 ? (
                          <span className="ml-2 font-semibold text-primary">
                            −{summary.drop} från toppen
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                    {session.data.learned ? (
                      <p className="mt-3 rounded-xl bg-primary-soft px-4 py-3 text-[0.9375rem] leading-relaxed text-primary-ink">
                        {session.data.learned}
                      </p>
                    ) : null}
                  </Card>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/verktyg/exponering" variant="soft">
          Alla trappor
        </ButtonLink>
        <Button variant="ghost" onClick={() => void removeLadder()}>
          <TrashIcon className="size-[1.15rem]" />
          Ta bort trappan
        </Button>
      </div>
    </ToolPage>
  )
}
