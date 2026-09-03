import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { TextArea } from '../../components/Field'
import { ArrowRightIcon, PlusIcon, TrashIcon } from '../../components/Icons'
import { ErrorState, LoadingState } from '../../components/PageState'
import { Slider } from '../../components/Slider'
import { StepFlow, type FlowStep } from '../../components/StepFlow'
import { formatRelativeDay } from '../../lib/date'
import { useAsync } from '../../lib/useAsync'
import { EmptyState, ToolPage } from './ToolPage'

export interface ExperimentData {
  thought: string
  prediction: string
  /** Hur troligt du trodde att förutsägelsen skulle slå in, 0–100. */
  likelihood: number
  plan: string
  outcome?: string
  conclusion?: string
  likelihoodAfter?: number
}

export function ExperimentFlow() {
  const store = useStore()
  const navigate = useNavigate()
  const [data, setData] = useState<ExperimentData>({
    thought: '',
    prediction: '',
    likelihood: 80,
    plan: '',
  })
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof ExperimentData>(key: K, value: ExperimentData[K]) =>
    setData((current) => ({ ...current, [key]: value }))

  const steps: FlowStep[] = [
    {
      id: 'thought',
      question: 'Vilken tanke ska prövas?',
      help: 'Ta den som överlevt alla argument – den du vet är orimlig men som ändå känns sann.',
      canAdvance: data.thought.trim().length > 3,
      body: (
        <TextArea
          value={data.thought}
          onChange={(event) => set('thought', event.target.value)}
          rows={4}
          placeholder="Om jag säger emot på mötet blir de irriterade på mig."
        />
      ),
    },
    {
      id: 'prediction',
      question: 'Vad förutspår tanken att som ska hända?',
      help: 'Så konkret att det går att kontrollera efteråt. "Det blir obehagligt" går inte att pröva; "två personer suckar" går.',
      canAdvance: data.prediction.trim().length > 3,
      body: (
        <TextArea
          value={data.prediction}
          onChange={(event) => set('prediction', event.target.value)}
          rows={4}
          placeholder="Någon höjer rösten, och efteråt blir det tyst kring mig i fikarummet."
        />
      ),
    },
    {
      id: 'likelihood',
      question: 'Hur troligt tror du att det är?',
      body: (
        <Slider
          label="Sannolikhet"
          value={data.likelihood}
          onChange={(value) => set('likelihood', value)}
          suffix=" %"
          step={5}
          tone="rose"
          anchors={['Osannolikt', 'Helt säkert']}
        />
      ),
    },
    {
      id: 'plan',
      question: 'Hur ska du testa det?',
      help: 'Ett experiment behöver vara litet, konkret och tidsatt. Och du behöver släppa säkerhetsbeteendena – annars mäter du dem i stället.',
      canAdvance: data.plan.trim().length > 3,
      body: (
        <TextArea
          value={data.plan}
          onChange={(event) => set('plan', event.target.value)}
          rows={5}
          placeholder="På tisdagens möte säger jag emot förslaget en gång, kort och sakligt. Jag mjukar inte upp det med skratt."
        />
      ),
    },
  ]

  const save = async () => {
    setBusy(true)
    try {
      const saved = await store.create<ExperimentData>('experiment', data)
      navigate(`/verktyg/beteendeexperiment/${saved.id}`, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <StepFlow
      title="Beteendeexperiment"
      steps={steps}
      onFinish={save}
      onExit={() => navigate('/verktyg/beteendeexperiment')}
      finishLabel="Spara experimentet"
      busy={busy}
    />
  )
}

export function ExperimentDetail() {
  const { id = '' } = useParams()
  const store = useStore()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(
    () => store.get<ExperimentData>(id),
    [store, id],
  )

  const [outcome, setOutcome] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [likelihoodAfter, setLikelihoodAfter] = useState(50)
  const [recording, setRecording] = useState(false)

  if (error) {
    return (
      <ToolPage toolId="experiment">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }
  if (loading) {
    return (
      <ToolPage toolId="experiment">
        <LoadingState />
      </ToolPage>
    )
  }
  if (!data) {
    return (
      <ToolPage toolId="experiment">
        <EmptyState
          title="Experimentet finns inte"
          body="Det kan ha tagits bort."
          action={<ButtonLink to="/verktyg/beteendeexperiment">Till experimenten</ButtonLink>}
        />
      </ToolPage>
    )
  }
  const experiment = data.data
  const complete = experiment.outcome !== undefined

  const saveOutcome = async () => {
    await store.save<ExperimentData>(
      id,
      'experiment',
      { ...experiment, outcome, conclusion, likelihoodAfter },
      data.day,
    )
    setRecording(false)
    reload()
  }

  const remove = async () => {
    if (!window.confirm('Ta bort experimentet?')) return
    await store.remove(id)
    navigate('/verktyg/beteendeexperiment', { replace: true })
  }

  const shift =
    complete && experiment.likelihoodAfter !== undefined
      ? experiment.likelihood - experiment.likelihoodAfter
      : null

  return (
    <ToolPage
      toolId="experiment"
      intro={<Muted className="mt-3">{formatRelativeDay(new Date(data.createdAt))}</Muted>}
    >
      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Tanken som prövas</p>
        <p className="mt-2 text-lg leading-relaxed text-ink">{experiment.thought}</p>
      </Card>

      <div className="mt-3 grid gap-3">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Förutsägelse</p>
          <p className="mt-2 leading-relaxed text-ink">{experiment.prediction}</p>
          <p className="mt-3 text-sm text-ink-soft">
            Du satte {experiment.likelihood} % sannolikhet
          </p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Så testar jag</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{experiment.plan}</p>
        </Card>
      </div>

      <Card className="mt-3">
        <h2 className="font-bold text-ink">Vad hände?</h2>
        {complete ? (
          <>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink">
              {experiment.outcome}
            </p>
            {experiment.conclusion ? (
              <div className="mt-4 rounded-xl border-l-[3px] border-primary bg-primary-soft/60 py-3 pl-4 pr-3">
                <p className="text-xs font-bold uppercase tracking-wide text-primary-ink/70">
                  Slutsats
                </p>
                <p className="mt-1 leading-relaxed text-primary-ink">{experiment.conclusion}</p>
              </div>
            ) : null}
            {shift !== null ? (
              <p className="mt-4 text-sm tabular-nums text-ink-soft">
                Tilltro till förutsägelsen: {experiment.likelihood} % →{' '}
                <strong className="text-ink">{experiment.likelihoodAfter} %</strong>
                {shift > 0 ? (
                  <span className="ml-2 font-semibold text-primary">−{shift}</span>
                ) : null}
              </p>
            ) : null}
          </>
        ) : recording ? (
          <div className="mt-4 grid gap-5">
            <TextArea
              label="Vad hände egentligen?"
              hint="Bara fakta. Vad sa de, vad gjorde de, vad hände sedan?"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              rows={4}
            />
            <TextArea
              label="Vad drar du för slutsats?"
              hint="En mening att ta med sig till nästa gång tanken dyker upp."
              value={conclusion}
              onChange={(event) => setConclusion(event.target.value)}
              rows={3}
            />
            <Slider
              label="Hur mycket tror du på förutsägelsen nu?"
              value={likelihoodAfter}
              onChange={setLikelihoodAfter}
              suffix=" %"
              step={5}
              anchors={['Inte alls', 'Helt och hållet']}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void saveOutcome()} disabled={!outcome.trim()}>
                Spara utfallet
              </Button>
              <Button variant="ghost" onClick={() => setRecording(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Muted className="mt-2">
              När du gjort experimentet: kom tillbaka hit och jämför med vad du trodde skulle hända.
            </Muted>
            <Button className="mt-4" variant="soft" onClick={() => setRecording(true)}>
              Fyll i utfallet
            </Button>
          </>
        )}
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/verktyg/beteendeexperiment" variant="soft">
          Alla experiment
        </ButtonLink>
        <Button variant="ghost" onClick={() => void remove()}>
          <TrashIcon className="size-[1.15rem]" />
          Ta bort
        </Button>
      </div>
    </ToolPage>
  )
}

export function ExperimentPage() {
  const store = useStore()
  const { data, error, reload } = useAsync(() => store.byType<ExperimentData>('experiment'), [store])
  const entries = data ?? []
  const completed = entries.filter((entry) => entry.data.likelihoodAfter !== undefined)

  const averageShift =
    completed.length > 0
      ? Math.round(
          completed.reduce(
            (sum, entry) => sum + (entry.data.likelihood - (entry.data.likelihoodAfter ?? 0)),
            0,
          ) / completed.length,
        )
      : 0

  if (error) {
    return (
      <ToolPage toolId="experiment">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }

  return (
    <ToolPage
      toolId="experiment"
      action={
        <ButtonLink to="/verktyg/beteendeexperiment/ny">
          <PlusIcon className="size-5" />
          Nytt experiment
        </ButtonLink>
      }
    >
      {completed.length >= 2 ? (
        <Card tone="soft" className="mb-5">
          <p className="text-[0.9375rem] leading-relaxed text-primary-ink">
            Över {completed.length} genomförda experiment har din tilltro till farhågorna sjunkit
            med i genomsnitt <strong className="font-bold">{averageShift} procentenheter</strong>.
            Det är erfarenhet, inte argument – och det är därför den sitter.
          </p>
        </Card>
      ) : null}

      {entries.length === 0 ? (
        <EmptyState
          title="Inga experiment än"
          body="Har du en tanke som inte ger med sig hur mycket du än resonerar? Då är det dags att testa den i verkligheten."
          action={<ButtonLink to="/verktyg/beteendeexperiment/ny">Planera ett experiment</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                to={`/verktyg/beteendeexperiment/${entry.id}`}
                className="group flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-ink-faint">
                    {formatRelativeDay(new Date(entry.createdAt))}
                    {entry.data.outcome !== undefined ? ' · genomfört' : ' · väntar på utfall'}
                  </span>
                  <span className="mt-1 block font-semibold leading-snug text-ink">
                    {entry.data.thought}
                  </span>
                  <span className="mt-1.5 block text-sm tabular-nums text-ink-soft">
                    {entry.data.likelihood} %
                    {entry.data.likelihoodAfter !== undefined
                      ? ` → ${entry.data.likelihoodAfter} %`
                      : ' sannolikhet'}
                  </span>
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
