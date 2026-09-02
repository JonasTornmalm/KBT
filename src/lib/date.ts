/**
 * Datumhjälp. Allt är lokal tid — en "dag" är användarens dag, inte UTC:s.
 * Veckan börjar på måndag, som i Sverige.
 */

export type DayKey = string // 'YYYY-MM-DD'

const pad = (n: number) => String(n).padStart(2, '0')

export function toDayKey(date: Date = new Date()): DayKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // getDay(): 0 = söndag. Vi vill ha måndag som veckans första dag.
  const offset = (d.getDay() + 6) % 7
  return addDays(d, -offset)
}

export function daysBetween(a: Date, b: Date): number {
  const ms = fromDayKey(toDayKey(b)).getTime() - fromDayKey(toDayKey(a)).getTime()
  return Math.round(ms / 86_400_000)
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDayKey(a) === toDayKey(b)
}

const dayFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
const shortFormat = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' })
const timeFormat = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit' })
const weekdayShort = new Intl.DateTimeFormat('sv-SE', { weekday: 'short' })

export const formatDay = (d: Date) => dayFormat.format(d)
export const formatShort = (d: Date) => shortFormat.format(d)
export const formatTime = (d: Date) => timeFormat.format(d)
export const formatWeekday = (d: Date) => weekdayShort.format(d)

/** "idag", "igår", annars ett datum. Mjukare än en tidsstämpel. */
export function formatRelativeDay(date: Date, now: Date = new Date()): string {
  const diff = daysBetween(date, now)
  if (diff === 0) return 'idag'
  if (diff === 1) return 'igår'
  if (diff === -1) return 'imorgon'
  if (diff > 1 && diff < 7) return `för ${diff} dagar sedan`
  return formatShort(date)
}

/** Minuter mellan två klockslag ('HH:MM'), med hänsyn till dygnsgräns. */
export function minutesBetweenClock(from: string, to: string): number {
  const parse = (v: string) => {
    const [h, m] = v.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }
  const start = parse(from)
  const end = parse(to)
  return end >= start ? end - start : end + 24 * 60 - start
}
