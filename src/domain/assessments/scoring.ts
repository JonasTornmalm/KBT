import { SCALES, type AssessmentKey, type Scale, type ScaleBand } from './scales'

export interface AssessmentAnswers {
  /** Ett värde per fråga, i frågornas ordning. */
  answers: number[]
}

/** Det som sparas i databasen när en skattning är gjord. */
export interface AssessmentRecord extends AssessmentAnswers {
  scale: AssessmentKey
  /** Råpoäng. För WHO-5 är detta 0–25; den procentuella siffran räknas fram. */
  raw: number
}

export interface AssessmentResult {
  scale: Scale
  /** Den siffra som visas för användaren: råpoäng, eller procent för WHO-5. */
  score: number
  raw: number
  max: number
  band: ScaleBand
  /** Sant om PHQ-9 fråga 9 besvarats med mer än "inte alls". */
  safetyFlag: boolean
}

export class IncompleteAssessmentError extends Error {
  constructor() {
    super('Alla frågor är inte besvarade')
    this.name = 'IncompleteAssessmentError'
  }
}

/** WHO-5 redovisas alltid som procent av maxpoängen. */
export function toDisplayScore(scale: Scale, raw: number): number {
  return scale.key === 'who5' ? raw * 4 : raw
}

export function findBand(scale: Scale, score: number): ScaleBand {
  const band = scale.bands.find((b) => score >= b.min && score <= b.max)
  // Banden täcker hela skalan; fallbacken finns bara för att typen ska hålla.
  return band ?? scale.bands[scale.bands.length - 1]!
}

export function scoreAssessment(key: AssessmentKey, answers: number[]): AssessmentResult {
  const scale = SCALES[key]
  if (answers.length !== scale.items.length || answers.some((a) => !Number.isFinite(a))) {
    throw new IncompleteAssessmentError()
  }

  const raw = answers.reduce((sum, value) => sum + value, 0)
  const score = toDisplayScore(scale, raw)
  const safetyItemIndex = scale.items.findIndex((item) => item.safetyItem)

  return {
    scale,
    raw,
    score,
    max: toDisplayScore(scale, scale.maxScore),
    band: findBand(scale, score),
    safetyFlag: safetyItemIndex >= 0 && (answers[safetyItemIndex] ?? 0) > 0,
  }
}

export function scoreFromRecord(record: AssessmentRecord): AssessmentResult {
  return scoreAssessment(record.scale, record.answers)
}

/**
 * Skillnaden mellan två skattningar, uttryckt så som användaren bör läsa den.
 * "Bättre" beror på skalans riktning: färre poäng är bättre på PHQ-9,
 * fler poäng är bättre på WHO-5.
 */
export interface ScoreChange {
  delta: number
  direction: 'better' | 'worse' | 'same'
  /** Om skillnaden är stor nog att vara meningsfull och inte bara brus. */
  meaningful: boolean
}

/**
 * Gränsen för vad som brukar räknas som en kliniskt meningsfull förändring:
 * 5 poäng på PHQ-9, 4 på GAD-7, 10 procentenheter på WHO-5.
 */
const MEANINGFUL_CHANGE: Record<AssessmentKey, number> = {
  phq9: 5,
  gad7: 4,
  who5: 10,
}

export function compareScores(
  key: AssessmentKey,
  earlier: number,
  later: number,
): ScoreChange {
  const scale = SCALES[key]
  const delta = later - earlier
  const improved = scale.direction === 'higherIsWorse' ? delta < 0 : delta > 0

  return {
    delta,
    direction: delta === 0 ? 'same' : improved ? 'better' : 'worse',
    meaningful: Math.abs(delta) >= MEANINGFUL_CHANGE[key],
  }
}

/** En mening som sammanfattar utvecklingen, i uppmuntrande men ärlig ton. */
export function describeChange(key: AssessmentKey, earlier: number, later: number): string {
  const change = compareScores(key, earlier, later)
  const size = Math.abs(change.delta)

  if (change.direction === 'same') return 'Oförändrat sedan förra gången.'
  if (change.direction === 'better') {
    return change.meaningful
      ? `Tydlig förbättring – ${size} poäng bättre än förra gången.`
      : `Något bättre än förra gången, ${size} poäng.`
  }
  return change.meaningful
    ? `${size} poäng sämre än förra gången. Bakslag hör till, men är värda att ta på allvar.`
    : `${size} poäng sämre än förra gången. Små svängningar är helt normala.`
}
