import { describe, expect, it } from 'vitest'
import { SESSIONS } from '../content/program'
import { computeNextStep, toolIntroducedIn, unlockedToolIds } from './nextStep'
import { homeworkKey, markComplete, toggleHomework } from './program/progress'
import { emptyProgress, type ProgramProgress } from './program/types'

const NOW = new Date('2026-03-10T09:00:00.000Z')
const fresh = (): ProgramProgress => emptyProgress(SESSIONS[0]!.slug)

/** Bockar av en session och låtsas att det skedde för ett visst antal dagar sedan. */
function completeSession(
  progress: ProgramProgress,
  week: number,
  daysAgo = 0,
): ProgramProgress {
  const slug = SESSIONS[week - 1]!.slug
  const updated = markComplete(progress, slug)
  return {
    ...updated,
    completedAt: {
      ...updated.completedAt,
      [slug]: new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString(),
    },
  }
}

function finishHomework(progress: ProgramProgress, week: number): ProgramProgress {
  const session = SESSIONS[week - 1]!
  return session.homework.reduce(
    (current, _, index) => toggleHomework(current, homeworkKey(session.slug, index)),
    progress,
  )
}

describe('nästa steg', () => {
  it('börjar med vecka 1 för den som inte gjort något', () => {
    const step = computeNextStep({ progress: fresh(), lastAssessmentAt: null, now: NOW })
    expect(step.kind).toBe('start')
    expect(step.to).toBe(`/program/${SESSIONS[0]!.slug}`)
    expect(step.why.length).toBeGreaterThan(20)
  })

  it('slutar föreslå hemuppgiften när verktyget faktiskt använts', () => {
    const progress = completeSession(fresh(), 1, 1)
    const usedAfterSession = new Date(NOW.getTime() - 3_600_000).toISOString()

    // Ingen har bockat av något. Att posterna finns är beviset — annars säger
    // startsidan "gör uppgiften" också till den som just gjort den.
    const before = computeNextStep({ progress, lastAssessmentAt: null, now: NOW })
    const after = computeNextStep({
      progress,
      lastAssessmentAt: null,
      now: NOW,
      activity: {
        checkin: usedAfterSession,
        assessment: usedAfterSession,
        thoughtRecord: usedAfterSession,
      },
    })

    expect(before.kind).toBe('homework')
    expect(after.kind).toBe('nextSession')
    expect(after.to).toBe(`/program/${SESSIONS[1]!.slug}`)
  })

  it('pekar på hemuppgiften direkt efter en avklarad session', () => {
    const progress = completeSession(fresh(), 1)
    const step = computeNextStep({ progress, lastAssessmentAt: null, now: NOW })

    expect(step.kind).toBe('homework')
    expect(step.title).toBe(SESSIONS[0]!.homework[0]!.text)
    expect(step.eyebrow).toContain('vecka 1')
    // Sessionen ska alltid gå att komma tillbaka till.
    expect(step.secondary?.to).toBe(`/program/${SESSIONS[0]!.slug}`)
  })

  it('går vidare till nästa vecka när hemuppgiften är avbockad', () => {
    let progress = completeSession(fresh(), 1)
    progress = finishHomework(progress, 1)

    const step = computeNextStep({ progress, lastAssessmentAt: null, now: NOW })
    expect(step.kind).toBe('nextSession')
    expect(step.to).toBe(`/program/${SESSIONS[1]!.slug}`)
    expect(step.eyebrow).toBe('Vecka 2 av 8')
  })

  it('går vidare efter en vecka även om uppgiften ligger kvar', () => {
    const stuck = completeSession(fresh(), 1, 8)
    const step = computeNextStep({ progress: stuck, lastAssessmentAt: null, now: NOW })
    expect(step.kind).toBe('nextSession')

    const recent = completeSession(fresh(), 1, 3)
    expect(computeNextStep({ progress: recent, lastAssessmentAt: null, now: NOW }).kind).toBe(
      'homework',
    )
  })

  it('leder genom hela programmet utan att fastna', () => {
    let progress = fresh()
    const seen: string[] = []

    for (let week = 1; week <= SESSIONS.length; week += 1) {
      const step = computeNextStep({ progress, lastAssessmentAt: NOW, now: NOW })
      seen.push(step.to)
      expect(step.to).toBe(`/program/${SESSIONS[week - 1]!.slug}`)

      progress = completeSession(progress, week)
      progress = finishHomework(progress, week)
    }

    expect(new Set(seen).size).toBe(SESSIONS.length)
  })

  it('föreslår ny skattning när programmet är klart och en månad gått', () => {
    let progress = fresh()
    for (let week = 1; week <= SESSIONS.length; week += 1) progress = completeSession(progress, week)

    const longAgo = new Date(NOW.getTime() - 30 * 86_400_000)
    const step = computeNextStep({ progress, lastAssessmentAt: longAgo, now: NOW })
    expect(step.kind).toBe('reassess')
    expect(step.to).toBe('/skattning')
  })

  it('går över till vidmakthållande när skattningen är färsk', () => {
    let progress = fresh()
    for (let week = 1; week <= SESSIONS.length; week += 1) progress = completeSession(progress, week)

    const recent = new Date(NOW.getTime() - 3 * 86_400_000)
    const step = computeNextStep({ progress, lastAssessmentAt: recent, now: NOW })
    expect(step.kind).toBe('maintain')
    expect(step.to).toContain('vidmakthallande')
  })

  it('ger alltid en rubrik, ett varför och en knapp', () => {
    let progress = fresh()
    for (let week = 1; week <= SESSIONS.length + 1; week += 1) {
      const step = computeNextStep({ progress, lastAssessmentAt: null, now: NOW })
      expect(step.title.trim().length).toBeGreaterThan(3)
      expect(step.why.trim().length).toBeGreaterThan(10)
      expect(step.cta.trim().length).toBeGreaterThan(2)
      expect(step.to.startsWith('/')).toBe(true)
      progress = completeSession(progress, Math.min(week, SESSIONS.length))
    }
  })
})

describe('verktyg låses upp av programmet', () => {
  it('börjar med det lilla som behövs från dag ett', () => {
    const unlocked = unlockedToolIds(fresh())
    expect(unlocked.has('checkin')).toBe(true)
    expect(unlocked.has('assessment')).toBe(true)
    // Säkerhetsplanen är alltid tillgänglig, oavsett var man är i programmet.
    expect(unlocked.has('safety-plan')).toBe(true)
    expect(unlocked.has('exposure')).toBe(false)
  })

  it('låser upp exponering först när vecka 6 nås', () => {
    let progress = fresh()
    for (let week = 1; week <= 4; week += 1) progress = markComplete(progress, SESSIONS[week - 1]!.slug)
    expect(unlockedToolIds(progress).has('exposure')).toBe(false)

    progress = markComplete(progress, SESSIONS[4]!.slug)
    expect(unlockedToolIds(progress).has('exposure')).toBe(true)
  })

  it('har allt upplåst när programmet är genomgånget', () => {
    let progress = fresh()
    for (const session of SESSIONS) progress = markComplete(progress, session.slug)

    const unlocked = unlockedToolIds(progress)
    for (const tool of ['thought-record', 'activity', 'exposure', 'worry', 'sleep', 'values']) {
      expect(unlocked.has(tool)).toBe(true)
    }
  })

  it('vet vilken vecka som introducerar ett verktyg', () => {
    expect(toolIntroducedIn('thought-record')).toBe(4)
    expect(toolIntroducedIn('exposure')).toBe(6)
    expect(toolIntroducedIn('finns-inte')).toBeNull()
  })
})
