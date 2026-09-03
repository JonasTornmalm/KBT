/**
 * Den dagliga incheckningen. Tre skattningar och en valfri rad — kort nog att
 * bli av varje dag, vilket är hela poängen. Det är den här datan som gör att
 * mönster går att se i efterhand.
 */

export interface CheckinData {
  /** 1 = mycket tungt, 5 = riktigt bra. */
  mood: number
  /**
   * 1 = helt tom, 5 = full av energi. Odefinierad när dagen bara snabbcheckats
   * in från startsidan — ett ifyllt standardvärde hade blivit en mätning ingen
   * gjort, och graferna hämtar sitt förtroende från att det aldrig händer.
   */
  energy?: number
  /** 1 = lugn, 5 = mycket ångest. Vänd skala mot de andra, med flit. Se energy. */
  anxiety?: number
  note?: string
}

export interface MoodLevel {
  value: number
  label: string
  /** Färgen används i graferna och på knapparna. */
  color: string
}

export const MOOD_LEVELS: MoodLevel[] = [
  { value: 1, label: 'Mycket tungt', color: 'var(--c-rose)' },
  { value: 2, label: 'Tungt', color: 'var(--c-accent)' },
  { value: 3, label: 'Mittemellan', color: 'var(--c-ink-faint)' },
  { value: 4, label: 'Bra', color: 'var(--c-primary-vivid)' },
  { value: 5, label: 'Riktigt bra', color: 'var(--c-primary)' },
]

export const ENERGY_LABELS = ['Helt tom', 'Låg', 'Sådär', 'God', 'Full av energi']
export const ANXIETY_LABELS = ['Lugn', 'Lite spänd', 'Orolig', 'Mycket ångest', 'Panikartat']

export function moodLevel(value: number): MoodLevel {
  return MOOD_LEVELS.find((level) => level.value === value) ?? MOOD_LEVELS[2]!
}
