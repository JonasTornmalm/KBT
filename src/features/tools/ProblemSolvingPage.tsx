import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { TextArea } from '../../components/Field'
import { ArrowRightIcon, PlusIcon, TrashIcon } from '../../components/Icons'
import { ListField } from '../../components/ListField'
import { Slider } from '../../components/Slider'
import { StepFlow, type FlowStep } from '../../components/StepFlow'
import { cn } from '../../lib/cn'
import { formatRelativeDay } from '../../lib/date'
import { useAsync } from '../../lib/useAsync'
import { EmptyState, ToolPage } from './ToolPage'

export interface ProblemSolvingData {
  problem: string
  options: string[]
  chosen: string
  pros: string
  cons: string
  plan: string
  /** Fylls i efter genomförandet. */
  result?: string
  satisfaction?: number
}

const STEP_TITLES = [
  'Definiera',
  'Brainstorma',
  'Väg för och emot',
  'Välj',
  'Planera',
  'Genomför',
  'Utvärdera',
]

export function ProblemSolvingFlow() {
  const store = useStore()
  const navigate = useNavigate()
  const [data, setData] = useState<ProblemSolvingData>({
    problem: '',
    options: [],
    chosen: '',
    pros: '',
    cons: '',
    plan: '',
  })
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof ProblemSolvingData>(key: K, value: ProblemSolvingData[K]) =>
    setData((current) => ({ ...current, [key]: value }))

  const steps: FlowStep[] = [
    {
      id: 'problem',
      question: 'Vad är problemet, konkret?',
      help: 'Inte "mitt jobb är hopplöst" utan "jag hinner inte bli klar med rapporten till fredag". Ett problem som går att ta på går att lösa.',
      canAdvance: data.problem.trim().length > 4,
      body: (
        <TextArea
          value={data.problem}
          onChange={(event) => set('problem', event.target.value)}
          rows={4}
          placeholder="Jag hinner inte bli klar med rapporten till fredag."
        />
      ),
    },
    {
      id: 'options',
      question: 'Vilka lösningar finns?',
      help: 'Skriv ner allt, även det du direkt avfärdar. Dumma förslag leder ofta till bra – det är därför de ska med.',
      canAdvance: data.options.length >= 2,
      body: (
        <ListField
          label="Möjliga lösningar"
          hint="Minst två, gärna fem. Värdera dem inte än."
          items={data.options}
          onChange={(options) => set('options', options)}
          placeholder="Be om förlängd deadline"
        />
      ),
    },
    {
      id: 'pros',
      question: 'Vad talar för de bästa alternativen?',
      body: (
        <TextArea
          value={data.pros}
          onChange={(event) => set('pros', event.target.value)}
          rows={5}
          placeholder="Att be om förlängning: jag hinner göra det ordentligt, och chefen har gett förlängning förr."
        />
      ),
    },
    {
      id: 'cons',
      question: 'Och vad talar emot?',
      body: (
        <TextArea
          value={data.cons}
          onChange={(event) => set('cons', event.target.value)}
          rows={5}
          placeholder="Det känns pinsamt att fråga. Kan påverka planeringen för andra."
        />
      ),
    },
    {
      id: 'chosen',
      question: 'Vilket väljer du?',
      help: 'Den behöver inte vara den bästa lösningen. Den behöver vara tillräckligt bra för att gå att börja med.',
      canAdvance: data.chosen.trim().length > 0,
      body: (
        <div>
          {data.options.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {data.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => set('chosen', option)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    data.chosen === option
                      ? 'border-primary bg-primary-soft text-primary-ink'
                      : 'border-line text-ink-soft hover:border-line-strong',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
          <TextArea
            value={data.chosen}
            onChange={(event) => set('chosen', event.target.value)}
            rows={3}
            label="Ditt val"
          />
        </div>
      ),
    },
    {
      id: 'plan',
      question: 'Vad, när och hur?',
      help: 'Första steget ska vara så litet att det går att göra idag. En plan utan tidpunkt är en önskan.',
      canAdvance: data.plan.trim().length > 4,
      body: (
        <TextArea
          value={data.plan}
          onChange={(event) => set('plan', event.target.value)}
          rows={5}
          placeholder="Imorgon kl 9, innan mötet: skicka ett kort mejl till chefen och be om att få lämna på måndag i stället."
        />
      ),
    },
  ]

  const save = async () => {
    setBusy(true)
    try {
      const saved = await store.create<ProblemSolvingData>('problemSolving', data)
      navigate(`/verktyg/problemlosning/${saved.id}`, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <StepFlow
      title="Problemlösning"
      steps={steps}
      onFinish={save}
      onExit={() => navigate('/verktyg/problemlosning')}
      finishLabel="Spara planen"
      busy={busy}
    />
  )
}

export function ProblemSolvingDetail() {
  const { id = '' } = useParams()
  const store = useStore()
  const navigate = useNavigate()
  const { data, reload } = useAsync(() => store.get<ProblemSolvingData>(id), [store, id])

  const [result, setResult] = useState('')
  const [satisfaction, setSatisfaction] = useState(5)
  const [evaluating, setEvaluating] = useState(false)

  if (!data) return null
  const plan = data.data

  const saveResult = async () => {
    await store.save<ProblemSolvingData>(
      id,
      'problemSolving',
      { ...plan, result, satisfaction },
      data.day,
    )
    setEvaluating(false)
    reload()
  }

  const remove = async () => {
    if (!window.confirm('Ta bort den här problemlösningen?')) return
    await store.remove(id)
    navigate('/verktyg/problemlosning', { replace: true })
  }

  const sections: Array<[string, string]> = [
    ['Problemet', plan.problem],
    ['Talar för', plan.pros],
    ['Talar emot', plan.cons],
    ['Valt alternativ', plan.chosen],
    ['Planen', plan.plan],
  ]

  return (
    <ToolPage
      toolId="problem-solving"
      intro={<Muted className="mt-3">{formatRelativeDay(new Date(data.createdAt))}</Muted>}
    >
      <div className="grid gap-3">
        {sections.map(([label, value]) =>
          value.trim() ? (
            <Card key={label}>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{value}</p>
            </Card>
          ) : null,
        )}

        {plan.options.length > 0 ? (
          <Card>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Alla alternativ
            </p>
            <ul className="mt-2 grid gap-1.5">
              {plan.options.map((option) => (
                <li
                  key={option}
                  className={cn(
                    'rounded-lg px-3 py-2',
                    option === plan.chosen ? 'bg-primary-soft text-primary-ink' : 'bg-surface-2 text-ink-soft',
                  )}
                >
                  {option}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>

      <Card className="mt-4">
        <h2 className="font-bold text-ink">Steg 7: utvärdera</h2>
        {plan.result ? (
          <>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink">{plan.result}</p>
            <p className="mt-3 text-sm text-ink-soft">
              Nöjdhet med lösningen: {plan.satisfaction} av 10
            </p>
          </>
        ) : evaluating ? (
          <div className="mt-4 grid gap-5">
            <TextArea
              label="Hur gick det?"
              value={result}
              onChange={(event) => setResult(event.target.value)}
              rows={4}
            />
            <Slider
              label="Hur nöjd är du med lösningen?"
              value={satisfaction}
              onChange={setSatisfaction}
              min={0}
              max={10}
              anchors={['Inte alls', 'Mycket nöjd']}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void saveResult()} disabled={!result.trim()}>
                Spara
              </Button>
              <Button variant="ghost" onClick={() => setEvaluating(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Muted className="mt-2">
              När du gjort det du planerat: kom tillbaka hit. Fungerade det inte är det inte ett
              misslyckande – då går du tillbaka till listan med alternativ.
            </Muted>
            <Button className="mt-4" variant="soft" onClick={() => setEvaluating(true)}>
              Utvärdera nu
            </Button>
          </>
        )}
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/verktyg/problemlosning" variant="soft">
          Alla problemlösningar
        </ButtonLink>
        <Button variant="ghost" onClick={() => void remove()}>
          <TrashIcon className="size-[1.15rem]" />
          Ta bort
        </Button>
      </div>
    </ToolPage>
  )
}

export function ProblemSolvingPage() {
  const store = useStore()
  const { data } = useAsync(() => store.byType<ProblemSolvingData>('problemSolving'), [store])
  const entries = data ?? []

  return (
    <ToolPage
      toolId="problem-solving"
      action={
        <ButtonLink to="/verktyg/problemlosning/ny">
          <PlusIcon className="size-5" />
          Nytt problem
        </ButtonLink>
      }
    >
      <Card tone="muted" className="mb-6">
        <h2 className="font-bold text-ink">De sju stegen</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {STEP_TITLES.map((title, index) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary-ink">
                {index + 1}
              </span>
              <span className="text-ink-soft">{title}</span>
            </li>
          ))}
        </ol>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          title="Inga problem tagna än"
          body="Har du något som går att göra åt, men som bara snurrar? Det är precis vad de här stegen är till för."
          action={<ButtonLink to="/verktyg/problemlosning/ny">Börja</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                to={`/verktyg/problemlosning/${entry.id}`}
                className="group flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-ink-faint">
                    {formatRelativeDay(new Date(entry.createdAt))}
                    {entry.data.result ? ' · utvärderad' : ''}
                  </span>
                  <span className="mt-1 block font-semibold leading-snug text-ink">
                    {entry.data.problem}
                  </span>
                  {entry.data.chosen ? (
                    <span className="mt-1.5 block text-sm text-ink-soft">
                      Valde: {entry.data.chosen}
                    </span>
                  ) : null}
                </span>
                <ArrowRightIcon className="mt-1 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ToolPage>
  )
}
