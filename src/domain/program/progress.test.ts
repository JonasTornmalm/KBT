import { describe, expect, it } from 'vitest'
import { SESSIONS, sessionBySlug } from '../../content/program'
import {
  completionPercent,
  homeworkKey,
  homeworkProgress,
  isCompleted,
  isProgramFinished,
  isUnlocked,
  markComplete,
  markIncomplete,
  nextSession,
  toggleHomework,
} from './progress'
import { emptyProgress, type ProgramProgress } from './types'

const fresh = (): ProgramProgress => emptyProgress(SESSIONS[0]!.slug)

describe('programmets innehåll', () => {
  it('har åtta sessioner i rätt veckoordning', () => {
    expect(SESSIONS).toHaveLength(8)
    expect(SESSIONS.map((s) => s.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('har unika slugs', () => {
    expect(new Set(SESSIONS.map((s) => s.slug)).size).toBe(SESSIONS.length)
  })

  it('har innehåll i varje session', () => {
    for (const session of SESSIONS) {
      expect(session.learn.length).toBeGreaterThan(2)
      expect(session.practice.length).toBeGreaterThan(0)
      expect(session.homework.length).toBeGreaterThan(0)
      expect(session.closing.length).toBeGreaterThan(20)
    }
  })

  it('hittar sessioner på slug', () => {
    expect(sessionBySlug(SESSIONS[3]!.slug)?.week).toBe(4)
    expect(sessionBySlug('finns-inte')).toBeUndefined()
  })
})

describe('upplåsning', () => {
  it('har alltid vecka 1 öppen', () => {
    expect(isUnlocked(SESSIONS[0]!, fresh())).toBe(true)
  })

  it('håller vecka 2 stängd tills vecka 1 är klar', () => {
    const progress = fresh()
    expect(isUnlocked(SESSIONS[1]!, progress)).toBe(false)
    expect(isUnlocked(SESSIONS[1]!, markComplete(progress, SESSIONS[0]!.slug))).toBe(true)
  })

  it('låser upp en vecka i taget', () => {
    let progress = fresh()
    for (const session of SESSIONS) {
      expect(isUnlocked(session, progress)).toBe(true)
      progress = markComplete(progress, session.slug)
    }
    expect(isProgramFinished(progress)).toBe(true)
  })
})

describe('progression', () => {
  it('pekar på första ogjorda sessionen', () => {
    let progress = fresh()
    expect(nextSession(progress).week).toBe(1)

    progress = markComplete(progress, SESSIONS[0]!.slug)
    expect(nextSession(progress).week).toBe(2)
  })

  it('hoppar över redan avklarade även om de gjorts i annan ordning', () => {
    let progress = fresh()
    progress = markComplete(progress, SESSIONS[1]!.slug)
    // Vecka 1 är fortfarande ogjord, så det är dit man ska.
    expect(nextSession(progress).week).toBe(1)
  })

  it('stannar på sista sessionen när allt är klart', () => {
    let progress = fresh()
    for (const session of SESSIONS) progress = markComplete(progress, session.slug)
    expect(nextSession(progress).week).toBe(8)
  })

  it('markerar inte samma session två gånger', () => {
    let progress = markComplete(fresh(), SESSIONS[0]!.slug)
    progress = markComplete(progress, SESSIONS[0]!.slug)
    expect(progress.completed).toEqual([SESSIONS[0]!.slug])
  })

  it('kan ångra en avklarad session', () => {
    const slug = SESSIONS[0]!.slug
    let progress = markComplete(fresh(), slug)
    expect(isCompleted(SESSIONS[0]!, progress)).toBe(true)

    progress = markIncomplete(progress, slug)
    expect(isCompleted(SESSIONS[0]!, progress)).toBe(false)
    expect(progress.current).toBe(slug)
  })

  it('räknar färdigt i procent', () => {
    let progress = fresh()
    expect(completionPercent(progress)).toBe(0)

    progress = markComplete(progress, SESSIONS[0]!.slug)
    progress = markComplete(progress, SESSIONS[1]!.slug)
    expect(completionPercent(progress)).toBe(25)
  })
})

describe('hemuppgifter', () => {
  it('bockar av och tillbaka', () => {
    const session = SESSIONS[0]!
    const key = homeworkKey(session.slug, 0)

    let progress = toggleHomework(fresh(), key)
    expect(progress.homeworkDone).toContain(key)

    progress = toggleHomework(progress, key)
    expect(progress.homeworkDone).not.toContain(key)
  })

  it('räknar andel klart per session', () => {
    const session = SESSIONS[0]!
    let progress = fresh()
    expect(homeworkProgress(session, progress)).toBe(0)

    for (let i = 0; i < session.homework.length; i += 1) {
      progress = toggleHomework(progress, homeworkKey(session.slug, i))
    }
    expect(homeworkProgress(session, progress)).toBe(1)
  })

  it('blandar inte ihop uppgifter mellan sessioner', () => {
    const progress = toggleHomework(fresh(), homeworkKey(SESSIONS[0]!.slug, 0))
    expect(homeworkProgress(SESSIONS[1]!, progress)).toBe(0)
  })
})
