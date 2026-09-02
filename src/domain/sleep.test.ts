import { describe, expect, it } from 'vitest'
import { sleepAdvice, sleepMetrics, type SleepEntryData } from './sleep'

const night = (overrides: Partial<SleepEntryData> = {}): SleepEntryData => ({
  bedtime: '23:00',
  minutesToFallAsleep: 20,
  minutesAwake: 0,
  wakeTime: '07:00',
  riseTime: '07:00',
  quality: 3,
  ...overrides,
})

describe('sömneffektivitet', () => {
  it('räknar en enkel natt', () => {
    // 23:00–07:00 = 480 min i sängen, 20 min att somna → 460 min sömn.
    const metrics = sleepMetrics(night())
    expect(metrics.timeInBed).toBe(480)
    expect(metrics.totalSleep).toBe(460)
    expect(metrics.efficiency).toBe(96)
  })

  it('drar av vaken tid mitt i natten', () => {
    const metrics = sleepMetrics(night({ minutesAwake: 90 }))
    expect(metrics.totalSleep).toBe(370)
    expect(metrics.efficiency).toBe(77)
  })

  it('räknar med tid som ligger vaken på morgonen', () => {
    // Vaknar 05:30 men stiger upp 07:00: nittio minuter i sängen utan sömn.
    const metrics = sleepMetrics(night({ wakeTime: '05:30' }))
    expect(metrics.timeInBed).toBe(480)
    expect(metrics.totalSleep).toBe(370)
    expect(metrics.efficiency).toBe(77)
  })

  it('hanterar en natt helt utan sömn utan att bli negativ', () => {
    const metrics = sleepMetrics(
      night({ minutesToFallAsleep: 300, minutesAwake: 300, wakeTime: '06:00' }),
    )
    expect(metrics.totalSleep).toBe(0)
    expect(metrics.efficiency).toBe(0)
  })

  it('klarar dygnsgränsen åt båda håll', () => {
    const late = sleepMetrics(night({ bedtime: '01:30', wakeTime: '09:00', riseTime: '09:30' }))
    expect(late.timeInBed).toBe(480)

    const early = sleepMetrics(night({ bedtime: '21:00', wakeTime: '05:00', riseTime: '05:00' }))
    expect(early.timeInBed).toBe(480)
  })

  it('låter aldrig sömnen överstiga tiden i sängen', () => {
    const metrics = sleepMetrics(night({ minutesToFallAsleep: 0, riseTime: '06:00' }))
    expect(metrics.totalSleep).toBeLessThanOrEqual(metrics.timeInBed)
    expect(metrics.efficiency).toBeLessThanOrEqual(100)
  })
})

describe('sömnråd', () => {
  it('ger inget råd på för lite underlag', () => {
    expect(sleepAdvice([night(), night()])).toBeNull()
  })

  it('bekräftar god sömn utan att föreslå ändringar', () => {
    const advice = sleepAdvice([night(), night(), night()])
    expect(advice?.averageEfficiency).toBe(96)
    expect(advice?.headline).toBe('Din sömn är effektiv')
  })

  it('föreslår sömnrestriktion vid låg effektivitet', () => {
    const poor = night({ bedtime: '22:00', minutesToFallAsleep: 90, minutesAwake: 120 })
    const advice = sleepAdvice([poor, poor, poor, poor, poor])

    expect(advice).not.toBeNull()
    expect(advice!.averageEfficiency).toBeLessThan(85)
    expect(advice!.headline).toContain('vaken')
    // 22:00–07:00 = 540 min i sängen, minus 90 min insomning och 120 min vaken
    // ger 330 min sömn. Föreskriven tid i sängen blir sömnen plus en halvtimme.
    expect(advice!.averageSleep).toBe(330)
    expect(advice!.prescribedTimeInBed).toBe(360)
    // Uppstigningstiden 07:00 hålls fast; sängtiden flyttas sex timmar bakåt.
    expect(advice!.suggestedBedtime).toBe('01:00')
  })

  it('går aldrig under fem timmar i sängen', () => {
    const terrible = night({ minutesToFallAsleep: 200, minutesAwake: 200 })
    const advice = sleepAdvice([terrible, terrible, terrible])
    expect(advice!.prescribedTimeInBed).toBeGreaterThanOrEqual(300)
  })

  it('lägger på en halvtimme ovanför genomsnittlig sömn', () => {
    // 23:00–07:00 med 20 min insomning och 30 min vaken → 430 min sömn.
    const entry = night({ minutesAwake: 30 })
    const advice = sleepAdvice([entry, entry, entry])
    expect(advice!.averageSleep).toBe(430)
    expect(advice!.prescribedTimeInBed).toBe(460)
  })
})
