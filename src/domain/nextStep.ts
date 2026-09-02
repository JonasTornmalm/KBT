import { SESSIONS, sessionBySlug } from '../content/program'
import { resolveToolPath } from '../content/toolPaths'
import { isProgramFinished, nextSession, pendingHomework } from './program/progress'
import type { ProgramProgress } from './program/types'

/**
 * Nästa steg.
 *
 * Appen ska aldrig lämna användaren med frågan "vad gör jag nu?". Den här
 * modulen räknar ut ett enda svar utifrån var i behandlingen personen befinner
 * sig — precis som en behandlare avslutar varje samtal med att säga vad som
 * gäller till nästa gång.
 *
 * Ordningen mellan reglerna är behandlingens ordning: sessionen först,
 * hemuppgiften därefter, och nästa vecka när uppgiften är gjord eller när en
 * vecka ändå har gått.
 */

export type NextStepKind =
  | 'start'
  | 'session'
  | 'homework'
  | 'nextSession'
  | 'reassess'
  | 'maintain'

export interface NextStep {
  kind: NextStepKind
  /** Liten etikett ovanför rubriken: "Vecka 3 av 8". */
  eyebrow: string
  title: string
  /** Varför just det här steget, i en mening. */
  why: string
  cta: string
  to: string
  minutes?: string
  /** Sekundär väg, när det finns en naturlig sådan. */
  secondary?: { label: string; to: string }
}

export interface NextStepInput {
  progress: ProgramProgress
  /** Senaste PHQ-9- eller GAD-7-skattningen. */
  lastAssessmentAt: Date | null
  now?: Date
}

/** Efter en vecka föreslås nästa session även om hemuppgiften inte är avbockad. */
const HOMEWORK_GRACE_DAYS = 7

/** Skattningarna görs om var fjärde vecka. Oftare än så mäter mest brus. */
const REASSESS_DAYS = 28

function daysSince(from: Date, now: Date): number {
  return Math.floor((now.getTime() - from.getTime()) / 86_400_000)
}

export function computeNextStep({
  progress,
  lastAssessmentAt,
  now = new Date(),
}: NextStepInput): NextStep {
  const session = nextSession(progress)

  // 1. Ingenting påbörjat.
  if (progress.completed.length === 0) {
    return {
      kind: 'start',
      eyebrow: 'Börja här',
      title: SESSIONS[0]!.title,
      why: 'Första sessionen ger dig kartan över vad som håller besvären igång. Allt annat bygger på den.',
      cta: 'Börja behandlingen',
      to: `/program/${SESSIONS[0]!.slug}`,
      minutes: `${SESSIONS[0]!.minutes} min`,
    }
  }

  // 2. Programmet är genomgånget.
  if (isProgramFinished(progress)) {
    if (!lastAssessmentAt || daysSince(lastAssessmentAt, now) >= REASSESS_DAYS) {
      return {
        kind: 'reassess',
        eyebrow: 'Dags att stämma av',
        title: 'Skatta hur du mår nu',
        why: 'Det har gått en månad sedan sist. Siffrorna säger något minnet är dåligt på: hur det faktiskt var då.',
        cta: 'Gör skattningen',
        to: '/skattning',
        minutes: '3 min',
      }
    }
    return {
      kind: 'maintain',
      eyebrow: 'Vidmakthållande',
      title: 'Fortsätt med det som fungerade',
      why: 'Behandlingen är klar, men färdigheterna behöver användas för att sitta kvar. Din plan säger vilka som är dina.',
      cta: 'Öppna min plan',
      to: resolveToolPath('relapse-plan') ?? '/verktyg',
      secondary: { label: 'Se din utveckling', to: '/insikter' },
    }
  }

  const weekLabel = `Vecka ${session.week} av ${SESSIONS.length}`

  // 3. Nästa session är inte genomgången än.
  const previous = SESSIONS[session.week - 2]
  if (!previous) {
    return {
      kind: 'session',
      eyebrow: weekLabel,
      title: session.title,
      why: session.promise,
      cta: 'Fortsätt',
      to: `/program/${session.slug}`,
      minutes: `${session.minutes} min`,
    }
  }

  // 4. Förra veckans session är klar. Är hemuppgiften gjord?
  const pending = pendingHomework(previous, progress)
  const completedAt = progress.completedAt?.[previous.slug]
  const daysSinceSession = completedAt ? daysSince(new Date(completedAt), now) : HOMEWORK_GRACE_DAYS

  if (pending.length > 0 && daysSinceSession < HOMEWORK_GRACE_DAYS) {
    const task = pending[0]!
    const toolPath = task.tool ? resolveToolPath(task.tool) : undefined
    return {
      kind: 'homework',
      eyebrow: `Uppgift från vecka ${previous.week}`,
      title: task.text,
      why: 'Det är övningen mellan sessionerna som skapar förändringen. Sessionen förbereder den bara.',
      cta: toolPath ? 'Gör uppgiften' : 'Öppna sessionen',
      to: toolPath ?? `/program/${previous.slug}`,
      secondary: { label: `Tillbaka till vecka ${previous.week}`, to: `/program/${previous.slug}` },
    }
  }

  // 5. Dags för nästa vecka.
  return {
    kind: 'nextSession',
    eyebrow: weekLabel,
    title: session.title,
    why: session.promise,
    cta: 'Öppna vecka ' + session.week,
    to: `/program/${session.slug}`,
    minutes: `${session.minutes} min`,
  }
}

/**
 * Verktygen som programmet hunnit introducera. Resten visas som kommande, så
 * att verktygslådan blir en följd av behandlingen i stället för en meny att
 * välja ur.
 */
export function unlockedToolIds(progress: ProgramProgress): Set<string> {
  const unlocked = new Set<string>(['checkin', 'assessment', 'safety-plan'])
  const reached = nextSession(progress).week

  for (const session of SESSIONS) {
    if (session.week > reached) continue
    for (const practice of session.practice) unlocked.add(practice.tool)
    for (const item of session.homework) if (item.tool) unlocked.add(item.tool)
  }
  return unlocked
}

/** Sessionen där ett verktyg introduceras – används för att förklara varför det är låst. */
export function toolIntroducedIn(toolId: string): number | null {
  for (const session of SESSIONS) {
    if (session.practice.some((practice) => practice.tool === toolId)) return session.week
  }
  return null
}

export { sessionBySlug }
