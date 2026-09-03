import { describe, expect, it } from 'vitest'
import { SESSIONS } from '../../content/program'
import { isToolUsedSince } from './homework'
import { isHomeworkDone, markComplete, pendingHomework } from './progress'
import { emptyProgress, type ProgramProgress } from './types'

const NOW = new Date('2026-03-10T09:00:00.000Z')

function completedWeekOne(): ProgramProgress {
  const progress = markComplete(emptyProgress(SESSIONS[0]!.slug), SESSIONS[0]!.slug)
  return {
    ...progress,
    completedAt: { ...progress.completedAt, [SESSIONS[0]!.slug]: NOW.toISOString() },
  }
}

const later = (hours: number) => new Date(NOW.getTime() + hours * 3_600_000).toISOString()

describe('spår från verktygen', () => {
  it('räknar en post som skapats efter sessionen', () => {
    expect(isToolUsedSince('checkin', NOW.toISOString(), { checkin: later(3) })).toBe(true)
  })

  it('räknar inte en post från före sessionen', () => {
    expect(isToolUsedSince('checkin', NOW.toISOString(), { checkin: later(-3) })).toBe(false)
  })

  it('godtar vilket som helst av flera spår', () => {
    const since = NOW.toISOString()
    expect(isToolUsedSince('exposure', since, { exposureLadder: later(1) })).toBe(true)
    expect(isToolUsedSince('exposure', since, { exposureSession: later(1) })).toBe(true)
  })

  it('svarar nej för verktyg utan spår att gå på', () => {
    // Planerna är singletons som skapas tomma när sidan öppnas. Deras
    // tidsstämpel säger att sidan besökts, inte att något skrivits.
    expect(isToolUsedSince('relapse-plan', NOW.toISOString(), { relapsePlan: later(1) })).toBe(false)
    expect(isToolUsedSince('insights', NOW.toISOString(), {})).toBe(false)
  })

  it('svarar nej när sessionen inte är avbockad än', () => {
    expect(isToolUsedSince('checkin', undefined, { checkin: later(1) })).toBe(false)
  })
})

describe('hemuppgifter som bockar av sig själva', () => {
  const session = SESSIONS[0]!
  const checkinIndex = session.homework.findIndex((item) => item.tool === 'checkin')

  it('slutar föreslå en uppgift vars verktyg använts', () => {
    const progress = completedWeekOne()

    const before = pendingHomework(session, progress)
    const after = pendingHomework(session, progress, { checkin: later(2) })

    expect(before.some((item) => item.tool === 'checkin')).toBe(true)
    expect(after.some((item) => item.tool === 'checkin')).toBe(false)
    expect(after.length).toBe(before.length - 1)
  })

  it('låter övriga uppgifter stå kvar', () => {
    const progress = completedWeekOne()
    const pending = pendingHomework(session, progress, { checkin: later(2) })

    expect(pending.length).toBeGreaterThan(0)
  })

  it('räknar uppgiften som gjord även utan kryss i rutan', () => {
    const progress = completedWeekOne()

    expect(isHomeworkDone(session, checkinIndex, progress)).toBe(false)
    expect(isHomeworkDone(session, checkinIndex, progress, { checkin: later(2) })).toBe(true)
  })
})
