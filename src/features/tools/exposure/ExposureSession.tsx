import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../../../app/VaultProvider'
import { Button } from '../../../components/Button'
import { Card, Muted } from '../../../components/Card'
import { CheckList } from '../../../components/ChoiceList'
import { TextArea } from '../../../components/Field'
import { Slider } from '../../../components/Slider'
import { StepFlow, type FlowStep } from '../../../components/StepFlow'
import { useAsync } from '../../../lib/useAsync'
import {
  sortedSteps,
  sudSummary,
  type ExposureLadderData,
  type ExposureSessionData,
  type SudReading,
} from './types'

const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Kurvan ritas medan passet pågår. Att se den plana ut är hela poängen. */
function LiveCurve({ readings }: { readings: SudReading[] }) {
  if (readings.length === 0) {
    return (
      <div className="grid h-40 place-items-center rounded-2xl bg-surface-2">
        <p className="text-sm text-ink-faint">Din kurva ritas här</p>
      </div>
    )
  }

  const width = 320
  const height = 140
  const maxTime = Math.max(readings[readings.length - 1]!.at, 60)
  const points = readings.map((reading) => ({
    x: (reading.at / maxTime) * width,
    y: height - (reading.sud / 100) * height,
  }))

  const path = points
    .map((point, i) => {
      if (i === 0) return `M${point.x} ${point.y}`
      const previous = points[i - 1]!
      const midX = (previous.x + point.x) / 2
      return `C${midX} ${previous.y} ${midX} ${point.y} ${point.x} ${point.y}`
    })
    .join(' ')

  return (
    <div className="rounded-2xl bg-surface-2 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-hidden>
        <path
          d={`${path} L${points[points.length - 1]!.x} ${height} L${points[0]!.x} ${height} Z`}
          fill="var(--c-rose)"
          opacity={0.12}
        />
        <path d={path} fill="none" stroke="var(--c-rose)" strokeWidth={2.6} strokeLinecap="round" />
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={3.5}
            fill="var(--c-surface)"
            stroke="var(--c-rose)"
            strokeWidth={2}
          />
        ))}
      </svg>
      <p className="mt-1 text-center text-xs text-ink-faint">
        {readings.length} skattningar · ångest över tid
      </p>
    </div>
  )
}

export function ExposureSession() {
  const { id: ladderId = '' } = useParams()
  const [params] = useSearchParams()
  const stepId = params.get('steg') ?? ''
  const store = useStore()
  const navigate = useNavigate()

  const { data: ladder } = useAsync(
    () => store.get<ExposureLadderData>(ladderId),
    [store, ladderId],
  )

  const [phase, setPhase] = useState<'before' | 'during' | 'after'>('before')
  const [prediction, setPrediction] = useState('')
  const [likelihood, setLikelihood] = useState(70)
  const [dropped, setDropped] = useState<string[]>([])
  const [readings, setReadings] = useState<SudReading[]>([])
  const [currentSud, setCurrentSud] = useState(50)
  const [seconds, setSeconds] = useState(0)
  const [happened, setHappened] = useState('')
  const [learned, setLearned] = useState('')
  const [busy, setBusy] = useState(false)
  const ticker = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (phase !== 'during') return
    ticker.current = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(ticker.current)
  }, [phase])

  const step = ladder ? sortedSteps(ladder.data).find((item) => item.id === stepId) : undefined

  if (!ladder || !step) return null

  const record = () => {
    setReadings((current) => [...current, { at: seconds, sud: currentSud }])
  }

  const summary = sudSummary(readings)

  const save = async () => {
    setBusy(true)
    try {
      await store.create<ExposureSessionData>('exposureSession', {
        ladderId,
        stepId,
        stepText: step.text,
        expected: step.expected,
        prediction,
        likelihood,
        droppedSafety: dropped,
        readings,
        durationSeconds: seconds,
        happened,
        learned,
      })
      navigate(`/verktyg/exponering/${ladderId}`, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  if (phase === 'before') {
    const steps: FlowStep[] = [
      {
        id: 'prediction',
        question: 'Vad tror du kommer hända?',
        help: `Steget du valt: ${step.text}. Skriv din farhåga så konkret att den går att kontrollera efteråt.`,
        canAdvance: prediction.trim().length > 2,
        body: (
          <TextArea
            value={prediction}
            onChange={(event) => setPrediction(event.target.value)}
            rows={4}
            placeholder="Jag kommer rodna, alla ser det, och någon säger något om det."
          />
        ),
      },
      {
        id: 'likelihood',
        question: 'Hur troligt tror du att det är?',
        help: 'Den här siffran ska du få jämföra med verkligheten om en stund.',
        body: (
          <Slider
            label="Sannolikhet"
            value={likelihood}
            onChange={setLikelihood}
            suffix=" %"
            step={5}
            tone="rose"
            anchors={['Osannolikt', 'Helt säkert']}
          />
        ),
      },
      {
        id: 'safety',
        question: 'Vilka säkerhetsbeteenden ska du släppa?',
        help: 'De små knepen som gör situationen uthärdlig. Släpps de inte hamnar erfarenheten på deras konto i stället för på ditt.',
        body: (
          <CheckList
            legend="Släpp under passet"
            choices={(ladder.data.safetyBehaviours.length > 0
              ? ladder.data.safetyBehaviours
              : ['Ha någon med mig', 'Öva repliker i förväg', 'Ha en flyktväg planerad']
            ).map((item) => ({ value: item, label: item }))}
            values={dropped}
            onToggle={(value) =>
              setDropped((current) =>
                current.includes(value)
                  ? current.filter((item) => item !== value)
                  : [...current, value],
              )
            }
          />
        ),
      },
    ]

    return (
      <StepFlow
        title="Innan exponeringen"
        steps={steps}
        onFinish={() => setPhase('during')}
        onExit={() => navigate(`/verktyg/exponering/${ladderId}`)}
        finishLabel="Nu kör vi"
      />
    )
  }

  if (phase === 'during') {
    return (
      <div className="mx-auto w-full max-w-[36rem] px-5 py-8 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-ink">Pågår</p>
        <h1 className="mt-2 text-[1.75rem] leading-tight text-ink">{step.text}</h1>

        <Card className="mt-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[2.5rem] font-bold tabular-nums leading-none text-ink">
              {formatClock(seconds)}
            </span>
            {summary ? (
              <span className="text-sm tabular-nums text-ink-soft">
                Topp {summary.peak} · nu {summary.end}
              </span>
            ) : null}
          </div>

          <div className="mt-6">
            <Slider
              label="Hur mycket ångest känner du just nu?"
              value={currentSud}
              onChange={setCurrentSud}
              step={5}
              tone="rose"
              anchors={['Helt lugn', 'Värsta tänkbara']}
            />
          </div>

          <Button size="lg" fullWidth className="mt-5" onClick={record}>
            Skatta nu
          </Button>
          <Muted className="mt-3 text-center">
            Skatta en gång i minuten. Stanna kvar tills siffran sjunkit märkbart – gärna till
            hälften av toppen.
          </Muted>
        </Card>

        <div className="mt-4">
          <LiveCurve readings={readings} />
        </div>

        {summary && summary.drop >= 15 ? (
          <Card tone="soft" className="mt-4">
            <p className="text-[0.9375rem] leading-relaxed text-primary-ink">
              Ångesten har sjunkit {summary.drop} punkter från toppen. Det där är kurvan du inte
              får se när du går därifrån.
            </p>
          </Card>
        ) : null}

        <Button
          size="lg"
          fullWidth
          variant={readings.length >= 2 ? 'primary' : 'outline'}
          className="mt-6"
          onClick={() => setPhase('after')}
        >
          Avsluta passet
        </Button>
      </div>
    )
  }

  const afterSteps: FlowStep[] = [
    {
      id: 'happened',
      question: 'Vad hände egentligen?',
      help: `Du trodde: "${prediction}" – och satte ${likelihood} % sannolikhet.`,
      canAdvance: happened.trim().length > 2,
      body: (
        <TextArea
          value={happened}
          onChange={(event) => setHappened(event.target.value)}
          rows={5}
          placeholder="Jag rodnade lite. Ingen sa något. Samtalet gick vidare."
        />
      ),
    },
    {
      id: 'learned',
      question: 'Vad tar du med dig?',
      help: 'Den viktigaste frågan i hela övningen. Skriv det som en mening du kan läsa nästa gång du står inför samma sak.',
      canAdvance: learned.trim().length > 2,
      body: (
        <TextArea
          value={learned}
          onChange={(event) => setLearned(event.target.value)}
          rows={5}
          placeholder="Jag klarade av obehaget, och det gick över utan att jag gjorde något åt det."
        />
      ),
    },
  ]

  return (
    <StepFlow
      title="Efter exponeringen"
      steps={afterSteps}
      onFinish={save}
      onExit={() => setPhase('during')}
      finishLabel="Spara passet"
      busy={busy}
    />
  )
}
