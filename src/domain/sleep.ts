import { minutesBetweenClock } from '../lib/date'

/**
 * Sömndagbok och sömnrestriktion.
 *
 * Beräkningarna följer standarden i KBT vid insomni: sömneffektivitet är den
 * andel av tiden i sängen som faktiskt är sömn, och sömnrestriktion innebär att
 * man kortar tiden i sängen tills den motsvarar den sömn man ändå får. Sängen
 * ska förknippas med sömn, inte med att ligga vaken och vänta.
 */

export interface SleepEntryData {
  /** Klockslag som 'HH:MM'. */
  bedtime: string
  /** När du somnade – räknas fram ur bedtime + insomningstid. */
  minutesToFallAsleep: number
  /** Vaken tid mitt i natten, totalt. */
  minutesAwake: number
  /** När du vaknade för sista gången. */
  wakeTime: string
  /** När du steg upp. */
  riseTime: string
  /** 1–5, där 5 är utvilad. */
  quality: number
  note?: string
}

export interface SleepMetrics {
  /** Tid i sängen, minuter. */
  timeInBed: number
  /** Faktisk sömn, minuter. */
  totalSleep: number
  /** Sömneffektivitet i procent. */
  efficiency: number
}

export function sleepMetrics(entry: SleepEntryData): SleepMetrics {
  const timeInBed = minutesBetweenClock(entry.bedtime, entry.riseTime)
  const bedToWake = minutesBetweenClock(entry.bedtime, entry.wakeTime)

  const totalSleep = Math.max(
    0,
    bedToWake - entry.minutesToFallAsleep - entry.minutesAwake,
  )

  return {
    timeInBed,
    totalSleep: Math.min(totalSleep, timeInBed),
    efficiency: timeInBed > 0 ? Math.round((Math.min(totalSleep, timeInBed) / timeInBed) * 100) : 0,
  }
}

export interface SleepAdvice {
  averageEfficiency: number
  averageSleep: number
  /** Rekommenderad tid i sängen, minuter. */
  prescribedTimeInBed: number
  /** Sängtid givet att uppstigningstiden hålls fast. */
  suggestedBedtime: string
  headline: string
  body: string
}

/** Kortaste tillåtna tid i sängen. Under fem timmar är sömnrestriktion inte lämpligt. */
const MIN_TIME_IN_BED = 5 * 60

function subtractMinutes(clock: string, minutes: number): string {
  const [h, m] = clock.split(':').map(Number)
  const total = ((h ?? 0) * 60 + (m ?? 0) - minutes + 24 * 60 * 2) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/**
 * Ger ett råd utifrån den senaste veckans dagbok. Behövs minst tre nätter —
 * färre än så säger ingenting annat än hur en enskild natt var.
 */
export function sleepAdvice(entries: SleepEntryData[]): SleepAdvice | null {
  if (entries.length < 3) return null

  const metrics = entries.map(sleepMetrics)
  const averageEfficiency = Math.round(
    metrics.reduce((sum, m) => sum + m.efficiency, 0) / metrics.length,
  )
  const averageSleep = Math.round(
    metrics.reduce((sum, m) => sum + m.totalSleep, 0) / metrics.length,
  )

  const prescribedTimeInBed = Math.max(averageSleep + 30, MIN_TIME_IN_BED)
  const latestRise = entries[0]?.riseTime ?? '07:00'
  const suggestedBedtime = subtractMinutes(latestRise, prescribedTimeInBed)

  if (averageEfficiency >= 90) {
    return {
      averageEfficiency,
      averageSleep,
      prescribedTimeInBed,
      suggestedBedtime,
      headline: 'Din sömn är effektiv',
      body: 'Över 90 procent av tiden i sängen är sömn. Om du känner dig utvilad ska du inte ändra något. Känner du dig fortfarande trött kan du prova att lägga dig 15 minuter tidigare.',
    }
  }

  if (averageEfficiency >= 85) {
    return {
      averageEfficiency,
      averageSleep,
      prescribedTimeInBed,
      suggestedBedtime,
      headline: 'Nästan där',
      body: 'Sömneffektiviteten ligger i det normala intervallet. Håll fast vid samma uppstigningstid varje dag – det är den enskilt viktigaste vanan.',
    }
  }

  return {
    averageEfficiency,
    averageSleep,
    prescribedTimeInBed,
    suggestedBedtime,
    headline: 'Du ligger vaken en stor del av tiden',
    body: `Du sover i snitt ${Math.floor(averageSleep / 60)} h ${averageSleep % 60} min, men ligger i sängen betydligt längre. Sömnrestriktion innebär att du kortar tiden i sängen till ungefär den sömn du ändå får, så att sängen återigen förknippas med att sova. Behåll uppstigningstiden ${latestRise} och gå inte och lägg dig före ${suggestedBedtime}.`,
  }
}

/** Stimuluskontrollens regler. De hör ihop med sömnrestriktionen och är minst lika viktiga. */
export const STIMULUS_CONTROL_RULES = [
  'Gå och lägg dig först när du är sömnig – inte bara trött.',
  'Använd sängen till sömn och sex, inget annat. Inte jobb, inte telefon, inte tv.',
  'Ligger du vaken mer än en kvart: gå upp, gå till ett annat rum och gör något lugnt tills du blir sömnig.',
  'Upprepa så många gånger som behövs under natten.',
  'Stig upp på samma tid varje morgon, oavsett hur natten var. Även på helgen.',
  'Sov inte på dagen. Måste du, håll det under 20 minuter och före klockan tre.',
]
