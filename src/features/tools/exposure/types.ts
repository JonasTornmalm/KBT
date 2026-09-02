export interface LadderStep {
  id: string
  text: string
  /** Förväntad ångest, 0–100 (SUD — Subjective Units of Distress). */
  expected: number
}

export interface ExposureLadderData {
  /** Vad trappan handlar om: "sociala situationer", "att åka buss". */
  theme: string
  steps: LadderStep[]
  safetyBehaviours: string[]
}

export interface SudReading {
  /** Sekunder sedan passet startade. */
  at: number
  sud: number
}

export interface ExposureSessionData {
  ladderId: string
  stepId: string
  stepText: string
  expected: number
  prediction: string
  /** Hur troligt du tyckte att det var att förutsägelsen skulle slå in, 0–100. */
  likelihood: number
  droppedSafety: string[]
  readings: SudReading[]
  durationSeconds: number
  happened: string
  learned: string
}

export function sortedSteps(ladder: ExposureLadderData): LadderStep[] {
  return [...ladder.steps].sort((a, b) => a.expected - b.expected)
}

/** Start-, topp- och slutvärde ur en serie skattningar. */
export function sudSummary(readings: SudReading[]): {
  start: number
  peak: number
  end: number
  drop: number
} | null {
  if (readings.length === 0) return null
  const values = readings.map((reading) => reading.sud)
  const start = values[0]!
  const end = values[values.length - 1]!
  const peak = Math.max(...values)
  return { start, peak, end, drop: peak - end }
}
