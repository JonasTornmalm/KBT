import type { DayKey } from '../date'

/**
 * Posttyperna. Typ och tidsstämplar ligger i klartext så att listor, kalendrar
 * och grafer kan indexeras utan att först dekryptera hela databasen. Allt
 * innehåll — det som faktiskt är känsligt — ligger i ciphertext.
 */
export type RecordType =
  | 'checkin'
  | 'assessment'
  | 'thoughtRecord'
  | 'activity'
  | 'exposureLadder'
  | 'exposureSession'
  | 'experiment'
  | 'worry'
  | 'problemSolving'
  | 'sleepDiary'
  | 'practice'
  | 'values'
  | 'goal'
  | 'safetyPlan'
  | 'relapsePlan'
  | 'programProgress'
  | 'profile'

/** Poster som det bara finns en av. De får ett fast id istället för ett slumpat. */
export const SINGLETON_TYPES = [
  'values',
  'safetyPlan',
  'relapsePlan',
  'programProgress',
  'profile',
] as const

export type SingletonType = (typeof SINGLETON_TYPES)[number]

export interface StoredRecord {
  id: string
  type: RecordType
  createdAt: string
  updatedAt: string
  day: DayKey
  iv: Uint8Array
  ciphertext: Uint8Array
}

/** En dekrypterad post, så som resten av appen ser den. */
export interface Entry<T> {
  id: string
  type: RecordType
  createdAt: string
  updatedAt: string
  day: DayKey
  data: T
}

export interface VaultConfig {
  id: 'vault'
  version: 1
  /** 'passphrase' = användaren låser upp med lösenfras. 'device' = nyckeln ligger i localStorage. */
  mode: 'passphrase' | 'device'
  salt: Uint8Array
  iterations: number
  wrappedDek: Uint8Array
  wrapIv: Uint8Array
  createdAt: string
  /** Fritextledtråd användaren själv valt. Frivillig, visas på låsskärmen. */
  hint?: string
}
