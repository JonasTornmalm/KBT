/**
 * Programmets form.
 *
 * En session är byggd som ett terapisamtal: först varför vi gör det här, sedan
 * kunskapen, sedan övningen, och sist något att ta med sig till veckan som
 * kommer. Ordningen är inte godtycklig — hemuppgiften mellan sessionerna är
 * det som faktiskt skapar förändring, allt annat förbereder den.
 */

/** Bilderna som förklarar mekanismerna. Ritas som SVG i ProgramDiagram. */
export type DiagramId =
  | 'cbt-model'
  | 'avoidance-loop'
  | 'activity-spiral'
  | 'anxiety-curve'
  | 'worry-tree'
  | 'thought-distance'

export type Block =
  | { kind: 'text'; body: string }
  | { kind: 'heading'; body: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'note'; body: string }
  | { kind: 'example'; title: string; rows: Array<[string, string]> }
  | { kind: 'diagram'; id: DiagramId; caption?: string }

export interface PracticeLink {
  /** Matchar id i verktygsregistret. */
  tool: string
  label: string
  why: string
}

export interface Homework {
  text: string
  /** Verktyget uppgiften utförs i, om det finns ett. */
  tool?: string
}

export interface Session {
  week: number
  slug: string
  title: string
  subtitle: string
  /** Vad veckan ska ge, i en mening. Visas på översikten. */
  promise: string
  minutes: number
  intro: string
  learn: Block[]
  practice: PracticeLink[]
  homework: Homework[]
  closing: string
}

export interface ProgramProgress {
  /** Slugs för avslutade sessioner. */
  completed: string[]
  /** När varje session bockades av. Styr när nästa vecka föreslås. */
  completedAt?: Record<string, string>
  /** Senast öppnade sessionen, så att "Fortsätt" hamnar rätt. */
  current: string
  startedAt: string
  /** Avbockade hemuppgifter, nyckel: `${slug}:${index}`. */
  homeworkDone: string[]
}

export function emptyProgress(firstSlug: string): ProgramProgress {
  return {
    completed: [],
    completedAt: {},
    current: firstSlug,
    startedAt: new Date().toISOString(),
    homeworkDone: [],
  }
}
