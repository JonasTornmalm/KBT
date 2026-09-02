export interface BreathPhase {
  label: string
  seconds: number
  /** Hur cirkeln ska se ut under fasen. */
  scale: 'in' | 'hold-in' | 'out' | 'hold-out'
}

export interface BreathingExercise {
  id: string
  name: string
  tagline: string
  description: string
  minutes: string
  phases: BreathPhase[]
  /** Antal andetag som föreslås. */
  suggestedCycles: number
}

/**
 * Andningsövningarna.
 *
 * Gemensamt för dem som fungerar är att utandningen är minst lika lång som
 * inandningen — det är den långa utandningen som aktiverar det parasympatiska
 * systemet och sänker pulsen. Att bara "andas djupt" gör oftast tvärtom.
 */
export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'box',
    name: 'Fyrkantsandning',
    tagline: 'Fyra takter, lika långa',
    description:
      'In i fyra, håll i fyra, ut i fyra, håll i fyra. Används av bland andra räddningstjänst och militär för att få ner stresspåslag före insats. Lätt att komma ihåg, och fungerar även när tankarna far.',
    minutes: '2–5 min',
    suggestedCycles: 8,
    phases: [
      { label: 'Andas in', seconds: 4, scale: 'in' },
      { label: 'Håll kvar', seconds: 4, scale: 'hold-in' },
      { label: 'Andas ut', seconds: 4, scale: 'out' },
      { label: 'Håll kvar', seconds: 4, scale: 'hold-out' },
    ],
  },
  {
    id: '478',
    name: '4-7-8',
    tagline: 'Lång utandning, för kvällen',
    description:
      'In genom näsan i fyra, håll i sju, ut genom munnen i åtta. Den långa utandningen sänker pulsen märkbart. Passar särskilt när du ska varva ner inför sömn.',
    minutes: '2–4 min',
    suggestedCycles: 6,
    phases: [
      { label: 'Andas in genom näsan', seconds: 4, scale: 'in' },
      { label: 'Håll kvar', seconds: 7, scale: 'hold-in' },
      { label: 'Andas ut genom munnen', seconds: 8, scale: 'out' },
    ],
  },
  {
    id: 'long-exhale',
    name: 'Förlängd utandning',
    tagline: 'Enklast av alla',
    description:
      'In i fyra, ut i sex. Inga pauser att hålla reda på. Den här går att göra mitt i ett möte utan att någon märker det.',
    minutes: '1–3 min',
    suggestedCycles: 10,
    phases: [
      { label: 'Andas in', seconds: 4, scale: 'in' },
      { label: 'Andas ut, långsamt', seconds: 6, scale: 'out' },
    ],
  },
]

export interface MuscleGroup {
  name: string
  instruction: string
}

/**
 * Progressiv muskelavslappning, förkortad version med sju grupper.
 *
 * Principen är att spänna hårt i några sekunder och sedan släppa helt.
 * Kontrasten gör det lättare att känna skillnaden mellan spänd och avslappnad
 * än att bara försöka slappna av på kommando.
 */
export const MUSCLE_GROUPS: MuscleGroup[] = [
  { name: 'Händer och underarmar', instruction: 'Knyt nävarna hårt, som om du kramar något.' },
  { name: 'Överarmar', instruction: 'Böj armarna och spänn biceps.' },
  { name: 'Ansikte', instruction: 'Rynka pannan, knip ihop ögonen, bit ihop käkarna.' },
  { name: 'Nacke och axlar', instruction: 'Dra upp axlarna mot öronen.' },
  { name: 'Bröst och rygg', instruction: 'Ta ett djupt andetag och håll det, dra ihop skulderbladen.' },
  { name: 'Mage', instruction: 'Spänn magmusklerna hårt, som inför en stöt.' },
  { name: 'Ben och fötter', instruction: 'Sträck ut benen, dra tårna mot dig.' },
]

export const TENSE_SECONDS = 7
export const RELEASE_SECONDS = 18

export interface GroundingStep {
  count: number
  sense: string
  prompt: string
}

/** 5-4-3-2-1 — för att komma tillbaka till rummet när tankarna dragit iväg. */
export const GROUNDING_STEPS: GroundingStep[] = [
  { count: 5, sense: 'saker du ser', prompt: 'Titta dig omkring. Namnge fem saker du ser, tyst för dig själv.' },
  { count: 4, sense: 'saker du känner', prompt: 'Fyra saker du känner mot kroppen: stolen, tyget, golvet, luften.' },
  { count: 3, sense: 'ljud du hör', prompt: 'Tre ljud. Lyssna efter dem som du brukar filtrera bort.' },
  { count: 2, sense: 'dofter', prompt: 'Två saker du kan känna doften av. Finns inga – hitta två du tycker om.' },
  { count: 1, sense: 'sak du kan smaka', prompt: 'En sak du kan smaka just nu.' },
]

export interface PracticeData {
  kind: 'breathing' | 'pmr' | 'grounding'
  exercise: string
  seconds: number
}
