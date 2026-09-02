import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { ChoiceList } from '../../components/ChoiceList'
import { HeartIcon } from '../../components/Icons'
import { StepFlow, type FlowStep } from '../../components/StepFlow'
import { CRISIS_RESOURCES } from '../../content/crisis'
import { SCALES, type AssessmentKey } from '../../domain/assessments/scales'
import {
  describeChange,
  scoreAssessment,
  type AssessmentRecord,
  type AssessmentResult,
} from '../../domain/assessments/scoring'
import { cn } from '../../lib/cn'

const TONE_STYLES = {
  good: 'bg-primary-soft text-primary-ink',
  calm: 'bg-primary-soft text-primary-ink',
  watch: 'bg-accent-soft text-accent-ink',
  act: 'bg-crisis-soft text-crisis-ink',
} as const

/**
 * Kortet som visas när PHQ-9 fråga 9 besvarats med mer än "inte alls".
 *
 * Tonen är avgörande. Ett larm gör att man ångrar sitt ärliga svar och svarar
 * försiktigare nästa gång, vilket förstör själva mätningen. Därför: lugnt,
 * bekräftande, och med konkreta nummer.
 */
function SafetyCard() {
  const urgent = CRISIS_RESOURCES.filter((resource) => resource.urgent)

  return (
    <Card tone="crisis">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-crisis/15 text-crisis-ink">
          <HeartIcon className="size-5" />
        </span>
        <div>
          <h3 className="font-bold text-crisis-ink">Du svarade att du haft såna tankar</h3>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-crisis-ink/90">
            Tack för att du var ärlig – det är svårare än det låter. Tankar på att inte vilja
            finnas är vanligare än de flesta tror, och de går över. Men de ska inte bäras ensam.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {urgent.map((resource) => (
          <a
            key={resource.name}
            href={`tel:${resource.dial ?? resource.phone}`}
            className="flex min-h-[3rem] items-center justify-between gap-3 rounded-xl bg-surface px-4 font-semibold text-ink transition-[filter] hover:brightness-95"
          >
            <span>{resource.name}</span>
            <span className="text-crisis-ink">{resource.phone}</span>
          </a>
        ))}
      </div>

      <ButtonLink to="/verktyg/sakerhetsplan" variant="crisis" fullWidth className="mt-3">
        Gör en säkerhetsplan
      </ButtonLink>
    </Card>
  )
}

function ResultView({
  result,
  previous,
  onDone,
}: {
  result: AssessmentResult
  previous: number | undefined
  onDone: () => void
}) {
  const { scale, band, score, max } = result
  const percent = Math.round((score / max) * 100)

  return (
    <div className="mx-auto w-full max-w-[42rem] px-5 py-8 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">{scale.name}</p>
      <h1 className="mt-2 text-[2rem] leading-tight text-ink">Ditt resultat</h1>

      <Card className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[3.5rem] font-bold leading-none tabular-nums text-ink">{score}</p>
            <p className="mt-1 text-sm text-ink-faint">av {max} möjliga</p>
          </div>
          <span className={cn('rounded-full px-4 py-2 font-semibold', TONE_STYLES[band.tone])}>
            {band.label}
          </span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-canvas-soft">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-[var(--ease-calm)]"
            style={{
              width: `${percent}%`,
              background:
                band.tone === 'act'
                  ? 'var(--c-crisis)'
                  : band.tone === 'watch'
                    ? 'var(--c-accent)'
                    : 'var(--c-primary)',
            }}
          />
        </div>

        <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink">{band.meaning}</p>
        <Muted className="mt-3">{band.advice}</Muted>

        {previous !== undefined ? (
          <p className="mt-5 rounded-xl bg-surface-2 px-4 py-3 text-[0.9375rem] text-ink-soft">
            {describeChange(scale.key, previous, score)}
          </p>
        ) : null}
      </Card>

      {result.safetyFlag ? (
        <div className="mt-4">
          <SafetyCard />
        </div>
      ) : null}

      <Card tone="muted" className="mt-4">
        <Muted>
          Det här är en skattning, inte en diagnos. Siffran säger något om hur de senaste två
          veckorna har varit – inget om vem du är, och inget om hur det kommer bli.
        </Muted>
      </Card>

      <div className="mt-8 grid gap-3">
        <Button size="lg" fullWidth onClick={onDone}>
          Klart
        </Button>
        <ButtonLink to="/insikter" variant="ghost" fullWidth>
          Se utvecklingen över tid
        </ButtonLink>
      </div>
    </div>
  )
}

export function AssessmentRunner() {
  const { scale: scaleKey } = useParams<{ scale: string }>()
  const store = useStore()
  const navigate = useNavigate()

  const key = (scaleKey ?? '') as AssessmentKey
  const scale = SCALES[key]

  const [answers, setAnswers] = useState<Array<number | undefined>>([])
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [previous, setPrevious] = useState<number | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (scale) setAnswers(new Array(scale.items.length).fill(undefined))
  }, [scale])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!scale) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-ink">Okänd skattning</h1>
        <Button className="mt-6" onClick={() => navigate('/skattning')}>
          Till skattningarna
        </Button>
      </div>
    )
  }

  if (result) {
    return <ResultView result={result} previous={previous} onDone={() => navigate('/skattning')} />
  }

  const answer = (questionIndex: number, value: number) => {
    setAnswers((current) => {
      const next = [...current]
      next[questionIndex] = value
      return next
    })

    // Hoppa fram automatiskt. Ett formulär på nio frågor blir annars nio extra
    // klick, och pausen finns för att svaret ska hinna synas innan det byter.
    window.clearTimeout(timer.current)
    if (questionIndex < scale.items.length - 1) {
      timer.current = window.setTimeout(() => setIndex(questionIndex + 1), 260)
    }
  }

  const steps: FlowStep[] = scale.items.map((item, i) => ({
    id: item.id,
    question: item.text,
    help: i === 0 ? scale.timeframe + ', hur ofta har du besvärats av det här?' : undefined,
    canAdvance: answers[i] !== undefined,
    body: (
      <ChoiceList
        legend={scale.prompt}
        hideLegend
        choices={scale.options.map((option) => ({ value: option.value, label: option.label }))}
        value={answers[i]}
        onChange={(value) => answer(i, value)}
      />
    ),
  }))

  const finish = async () => {
    const filled = answers.map((value) => value ?? 0)
    setBusy(true)
    try {
      // Hämta den senaste skattningen med samma skala innan den nya sparas,
      // så att jämförelsen inte råkar bli mot sig själv.
      const history = await store.byType<AssessmentRecord>('assessment')
      const lastOfSame = history.find((entry) => entry.data.scale === key)

      const computed = scoreAssessment(key, filled)
      await store.create<AssessmentRecord>('assessment', {
        scale: key,
        answers: filled,
        raw: computed.raw,
      })

      setPrevious(lastOfSame ? scoreAssessment(key, lastOfSame.data.answers).score : undefined)
      setResult(computed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <StepFlow
      title={`${scale.name} · ${scale.measures}`}
      steps={steps}
      index={index}
      onIndexChange={setIndex}
      onFinish={finish}
      onExit={() => navigate('/skattning')}
      finishLabel="Se resultatet"
      busy={busy}
    />
  )
}
