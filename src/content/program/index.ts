import type { Session } from '../../domain/program/types'
import { WEEK_1, WEEK_2, WEEK_3, WEEK_4 } from './weeks1to4'
import { WEEK_5, WEEK_6, WEEK_7, WEEK_8 } from './weeks5to8'

export const SESSIONS: Session[] = [WEEK_1, WEEK_2, WEEK_3, WEEK_4, WEEK_5, WEEK_6, WEEK_7, WEEK_8]

export const FIRST_SESSION_SLUG = WEEK_1.slug

export function sessionBySlug(slug: string): Session | undefined {
  return SESSIONS.find((session) => session.slug === slug)
}

export function sessionByWeek(week: number): Session | undefined {
  return SESSIONS.find((session) => session.week === week)
}
