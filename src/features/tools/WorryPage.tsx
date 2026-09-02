import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../app/VaultProvider'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { TextArea } from '../../components/Field'
import { CheckIcon, CloudIcon, PlusIcon, TrashIcon } from '../../components/Icons'
import { Sheet } from '../../components/Sheet'
import { Slider } from '../../components/Slider'
import { cn } from '../../lib/cn'
import { daysBetween, formatRelativeDay } from '../../lib/date'
import type { Entry } from '../../lib/db/types'
import { useAsync } from '../../lib/useAsync'
import { EmptyState, ToolPage } from './ToolPage'

export interface WorryData {
  text: string
  /** Null tills oron sorterats i orosträdet. */
  controllable: boolean | null
  /** Hur troligt du trodde att farhågan skulle slå in, 0–100. */
  probability: number
  /** Ifylld vid uppföljning. */
  outcome?: string
  /** Slog farhågan in? Sätts vid uppföljning. */
  cameTrue?: boolean
}

const WORRY_MINUTES = 15

function WorryTimer({ open, onClose, worries }: { open: boolean; onClose: () => void; worries: Entry<WorryData>[] }) {
  const [left, setLeft] = useState(WORRY_MINUTES * 60)
  const [running, setRunning] = useState(false)
  const ticker = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!open) {
      setLeft(WORRY_MINUTES * 60)
      setRunning(false)
    }
  }, [open])

  useEffect(() => {
    if (!running) return
    ticker.current = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          window.clearInterval(ticker.current)
          setRunning(false)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(ticker.current)
  }, [running])

  const minutes = Math.floor(left / 60)
  const seconds = left % 60
  const progress = 1 - left / (WORRY_MINUTES * 60)

  return (
    <Sheet open={open} onClose={onClose} title="Orosstund">
      <Muted>
        Oroa dig medvetet, hela kvarten. Gå igenom listan nedan. När tiden är slut är den slut –
        det som inte fick plats får vänta till imorgon.
      </Muted>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative grid size-40 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--c-canvas-soft)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--c-calm)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 283} 283`}
              className="transition-[stroke-dasharray] duration-1000 ease-linear"
            />
          </svg>
          <span className="text-[2.25rem] font-bold tabular-nums text-ink">
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        <Button
          size="lg"
          variant={running ? 'outline' : 'primary'}
          className="mt-6"
          onClick={() => setRunning((value) => !value)}
        >
          {left === 0 ? 'Tiden är ute' : running ? 'Pausa' : 'Starta kvarten'}
        </Button>
      </div>

      {worries.length > 0 ? (
        <ul className="mt-7 grid gap-2">
          {worries.map((worry) => (
            <li key={worry.id} className="rounded-xl bg-surface-2 px-4 py-3 leading-relaxed text-ink">
              {worry.data.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-7 rounded-xl bg-surface-2 px-4 py-3 text-center text-ink-soft">
          Inget står på listan just nu.
        </p>
      )}

      {left === 0 ? (
        <Card tone="soft" className="mt-5">
          <p className="text-[0.9375rem] leading-relaxed text-primary-ink">
            Kvarten är över. Lägg märke till hur mycket av det som kändes akut tidigare idag som
            fortfarande känns akut nu.
          </p>
        </Card>
      ) : null}
    </Sheet>
  )
}

function FollowUpSheet({
  worry,
  onClose,
  onSave,
}: {
  worry: Entry<WorryData> | null
  onClose: () => void
  onSave: (id: string, data: WorryData) => Promise<void>
}) {
  const [outcome, setOutcome] = useState('')
  const [cameTrue, setCameTrue] = useState<boolean | null>(null)
  const [initialised, setInitialised] = useState<string | null>(null)

  if (worry && initialised !== worry.id) {
    setOutcome(worry.data.outcome ?? '')
    setCameTrue(worry.data.cameTrue ?? null)
    setInitialised(worry.id)
  }

  return (
    <Sheet open={Boolean(worry)} onClose={onClose} title="Hur gick det?">
      {worry ? (
        <div className="grid gap-5">
          <Card tone="muted">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Du oroade dig för</p>
            <p className="mt-2 leading-relaxed text-ink">{worry.data.text}</p>
            <p className="mt-2 text-sm text-ink-soft">
              Du satte {worry.data.probability} % sannolikhet ·{' '}
              {formatRelativeDay(new Date(worry.createdAt))}
            </p>
          </Card>

          <div>
            <p className="mb-2 font-semibold text-ink">Slog det in?</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: false, label: 'Nej' },
                { value: true, label: 'Ja' },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setCameTrue(option.value)}
                  aria-pressed={cameTrue === option.value}
                  className={cn(
                    'min-h-[3rem] rounded-xl border font-semibold transition-colors',
                    cameTrue === option.value
                      ? 'border-primary bg-primary-soft text-primary-ink'
                      : 'border-line bg-surface text-ink hover:border-line-strong',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <TextArea
            label="Vad hände i stället?"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            rows={4}
          />

          <Button
            size="lg"
            fullWidth
            disabled={cameTrue === null}
            onClick={() =>
              void onSave(worry.id, {
                ...worry.data,
                outcome,
                cameTrue: cameTrue ?? false,
              }).then(onClose)
            }
          >
            Spara uppföljning
          </Button>
        </div>
      ) : null}
    </Sheet>
  )
}

export function WorryPage() {
  const store = useStore()
  const [text, setText] = useState('')
  const [probability, setProbability] = useState(60)
  const [timerOpen, setTimerOpen] = useState(false)
  const [followUp, setFollowUp] = useState<Entry<WorryData> | null>(null)

  const { data, reload } = useAsync(() => store.byType<WorryData>('worry', { limit: 200 }), [store])
  const worries = data ?? []

  const unsorted = worries.filter((worry) => worry.data.controllable === null)
  const solvable = worries.filter(
    (worry) => worry.data.controllable === true && worry.data.cameTrue === undefined,
  )
  const parked = worries.filter(
    (worry) => worry.data.controllable === false && worry.data.cameTrue === undefined,
  )
  const followedUp = worries.filter((worry) => worry.data.cameTrue !== undefined)
  const readyForFollowUp = worries.filter(
    (worry) =>
      worry.data.cameTrue === undefined &&
      worry.data.controllable !== null &&
      daysBetween(new Date(worry.createdAt), new Date()) >= 2,
  )

  const cameTrueCount = followedUp.filter((worry) => worry.data.cameTrue).length
  const accuracy = followedUp.length > 0 ? Math.round((cameTrueCount / followedUp.length) * 100) : null

  const add = async () => {
    if (!text.trim()) return
    await store.create<WorryData>('worry', {
      text: text.trim(),
      controllable: null,
      probability,
    })
    setText('')
    setProbability(60)
    reload()
  }

  const classify = async (worry: Entry<WorryData>, controllable: boolean) => {
    await store.save<WorryData>(worry.id, 'worry', { ...worry.data, controllable }, worry.day)
    reload()
  }

  const saveFollowUp = async (id: string, updated: WorryData) => {
    const existing = worries.find((worry) => worry.id === id)
    await store.save<WorryData>(id, 'worry', updated, existing?.day)
    reload()
  }

  const remove = async (id: string) => {
    await store.remove(id)
    reload()
  }

  return (
    <ToolPage
      toolId="worry"
      action={
        <Button variant="soft" onClick={() => setTimerOpen(true)}>
          <CloudIcon className="size-5" />
          Starta orosstund
        </Button>
      }
    >
      <Card>
        <h2 className="font-bold text-ink">Skriv ner en oro</h2>
        <Muted className="mt-1">
          Få ut den ur huvudet först. Sorteringen kommer sedan – det är svårt att tänka klart om
          något som samtidigt snurrar.
        </Muted>
        <div className="mt-4 grid gap-5">
          <TextArea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="Att jag inte hinner klart till fredag och att alla ska märka det."
            aria-label="Vad oroar du dig för?"
          />
          <Slider
            label="Hur troligt tror du att det är?"
            value={probability}
            onChange={setProbability}
            step={5}
            tone="calm"
            anchors={['Osannolikt', 'Helt säkert']}
          />
          <Button onClick={() => void add()} disabled={!text.trim()}>
            <PlusIcon className="size-5" />
            Lägg till
          </Button>
        </div>
      </Card>

      {unsorted.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-1 text-lg font-bold text-ink">Sortera</h2>
          <Muted className="mb-3">
            Kan du göra något åt det – idag? Det är hela orosträdet i en fråga.
          </Muted>
          <ul className="grid gap-3">
            {unsorted.map((worry) => (
              <li key={worry.id}>
                <Card>
                  <p className="leading-relaxed text-ink">{worry.data.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void classify(worry, true)}>
                      Ja, jag kan göra något
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void classify(worry, false)}>
                      Nej, det ligger utanför
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void remove(worry.id)}>
                      <TrashIcon className="size-[1.15rem]" />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {solvable.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-1 text-lg font-bold text-ink">Går att göra något åt</h2>
          <Muted className="mb-3">
            De här är problem, inte oro. Ta dem genom problemlösningens sju steg.
          </Muted>
          <ul className="grid gap-2">
            {solvable.map((worry) => (
              <li
                key={worry.id}
                className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3"
              >
                <span className="min-w-0 flex-1 leading-relaxed text-primary-ink">
                  {worry.data.text}
                </span>
                <button
                  type="button"
                  onClick={() => void remove(worry.id)}
                  aria-label="Ta bort"
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-primary-ink/60 transition-colors hover:bg-surface hover:text-crisis-ink"
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <ButtonLink to="/verktyg/problemlosning" variant="soft" className="mt-3">
            Öppna problemlösning
          </ButtonLink>
        </section>
      ) : null}

      {parked.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-1 text-lg font-bold text-ink">Till orosstunden</h2>
          <Muted className="mb-3">
            Ingenting att lösa. All tid du lägger på dem nu är förlust – de tas under kvarten.
          </Muted>
          <ul className="grid gap-2">
            {parked.map((worry) => (
              <li
                key={worry.id}
                className="flex items-start gap-3 rounded-xl bg-calm-soft px-4 py-3"
              >
                <span className="min-w-0 flex-1 leading-relaxed text-calm-ink">
                  {worry.data.text}
                </span>
                <button
                  type="button"
                  onClick={() => void remove(worry.id)}
                  aria-label="Ta bort"
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-calm-ink/60 transition-colors hover:bg-surface hover:text-crisis-ink"
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {readyForFollowUp.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-1 text-lg font-bold text-ink">Redo att följas upp</h2>
          <Muted className="mb-3">
            Det obekvämt nyttiga steget: stämde farhågan? Det är så du bygger argument mot nästa
            oro.
          </Muted>
          <ul className="grid gap-2">
            {readyForFollowUp.map((worry) => (
              <li key={worry.id}>
                <button
                  type="button"
                  onClick={() => setFollowUp(worry)}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-primary"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block leading-relaxed text-ink">{worry.data.text}</span>
                    <span className="mt-0.5 block text-sm text-ink-faint">
                      {formatRelativeDay(new Date(worry.createdAt))} · du satte{' '}
                      {worry.data.probability} %
                    </span>
                  </span>
                  <CheckIcon className="size-5 shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {accuracy !== null && followedUp.length >= 3 ? (
        <Card tone="soft" className="mt-8">
          <h2 className="font-bold text-primary-ink">Din träffsäkerhet</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-primary-ink">
            Av {followedUp.length} uppföljda farhågor slog {cameTrueCount} in – {accuracy} procent.
            {accuracy <= 30
              ? ' Nästa gång oron säger att den vet hur det går: det är den siffran som gäller.'
              : ' Fortsätt följa upp. Mönstret blir tydligare för varje gång.'}
          </p>
        </Card>
      ) : null}

      {worries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Ingen oro nedskriven"
            body="Nästa gång något snurrar: skriv ner det här i stället för att bära det i huvudet."
          />
        </div>
      ) : null}

      <WorryTimer open={timerOpen} onClose={() => setTimerOpen(false)} worries={parked} />
      <FollowUpSheet worry={followUp} onClose={() => setFollowUp(null)} onSave={saveFollowUp} />
    </ToolPage>
  )
}
