import { SESSIONS } from '../../content/program'
import type { ProgramProgress, Session } from './types'

/**
 * Sessioner låses upp i ordning, men låsningen är en rekommendation och ingen
 * spärr: den som vill läsa framåt får göra det. Att låsa ute någon ur sitt eget
 * material vore fel sorts omtanke.
 */
export function isUnlocked(session: Session, progress: ProgramProgress): boolean {
  if (session.week === 1) return true
  const previous = SESSIONS[session.week - 2]
  return previous ? progress.completed.includes(previous.slug) : true
}

export function isCompleted(session: Session, progress: ProgramProgress): boolean {
  return progress.completed.includes(session.slug)
}

/** Den session användaren bör fortsätta med: första ogjorda, annars den sista. */
export function nextSession(progress: ProgramProgress): Session {
  return SESSIONS.find((session) => !progress.completed.includes(session.slug)) ?? SESSIONS[SESSIONS.length - 1]!
}

export function completedCount(progress: ProgramProgress): number {
  return SESSIONS.filter((session) => progress.completed.includes(session.slug)).length
}

export function completionPercent(progress: ProgramProgress): number {
  return Math.round((completedCount(progress) / SESSIONS.length) * 100)
}

export function isProgramFinished(progress: ProgramProgress): boolean {
  return completedCount(progress) === SESSIONS.length
}

export function markComplete(progress: ProgramProgress, slug: string): ProgramProgress {
  if (progress.completed.includes(slug)) return progress
  const completed = [...progress.completed, slug]
  const upcoming = SESSIONS.find((session) => !completed.includes(session.slug))
  return {
    ...progress,
    completed,
    completedAt: { ...progress.completedAt, [slug]: new Date().toISOString() },
    current: upcoming?.slug ?? slug,
  }
}

export function markIncomplete(progress: ProgramProgress, slug: string): ProgramProgress {
  const completedAt = { ...progress.completedAt }
  delete completedAt[slug]
  return {
    ...progress,
    completed: progress.completed.filter((entry) => entry !== slug),
    completedAt,
    current: slug,
  }
}

export function homeworkKey(slug: string, index: number): string {
  return `${slug}:${index}`
}

export function toggleHomework(progress: ProgramProgress, key: string): ProgramProgress {
  const done = progress.homeworkDone.includes(key)
  return {
    ...progress,
    homeworkDone: done
      ? progress.homeworkDone.filter((entry) => entry !== key)
      : [...progress.homeworkDone, key],
  }
}

/** Hemuppgifter som ännu inte är avbockade för en session. */
export function pendingHomework(
  session: Session,
  progress: ProgramProgress,
): Array<{ index: number; text: string; tool?: string }> {
  return session.homework
    .map((item, index) => ({ index, text: item.text, tool: item.tool }))
    .filter((item) => !progress.homeworkDone.includes(homeworkKey(session.slug, item.index)))
}

/** Andel avbockade hemuppgifter för en session. */
export function homeworkProgress(session: Session, progress: ProgramProgress): number {
  if (session.homework.length === 0) return 0
  const done = session.homework.filter((_, index) =>
    progress.homeworkDone.includes(homeworkKey(session.slug, index)),
  ).length
  return done / session.homework.length
}
