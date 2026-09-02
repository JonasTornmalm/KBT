import {
  base64ToBytes,
  bytesToBase64,
  defaultIterations,
  deriveKek,
  newSalt,
  unwrapDek,
  wrapDek,
} from '../crypto'
import { db } from '../db/db'
import { SecureStore } from '../db/store'
import type { StoredRecord } from '../db/types'

export const BACKUP_FORMAT = 'kbt-backup'
export const BACKUP_VERSION = 1

interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: number
  createdAt: string
  kdf: { salt: string; iterations: number }
  wrappedDek: { iv: string; ct: string }
  records: Array<{
    id: string
    type: string
    createdAt: string
    updatedAt: string
    day: string
    iv: string
    ct: string
  }>
}

/**
 * Skapar en säkerhetskopia. Posterna kopieras precis som de ligger, fortfarande
 * krypterade med samma datanyckel. Det enda som görs om är wrappningen av
 * nyckeln, nu med den exportlösenfras användaren angett. Filen är därför
 * oanvändbar för den som inte kan lösenfrasen.
 */
export async function createBackup(
  store: SecureStore,
  exportPassphrase: string,
  dek: CryptoKey,
): Promise<string> {
  const salt = newSalt()
  const kek = await deriveKek(exportPassphrase, salt, defaultIterations)
  const wrapped = await wrapDek(dek, kek)
  const records = await store.rawAll()

  const file: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    kdf: { salt: bytesToBase64(salt), iterations: defaultIterations },
    wrappedDek: { iv: bytesToBase64(wrapped.iv), ct: bytesToBase64(wrapped.ciphertext) },
    records: records.map((r) => ({
      id: r.id,
      type: r.type,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      day: r.day,
      iv: bytesToBase64(r.iv),
      ct: bytesToBase64(r.ciphertext),
    })),
  }
  return JSON.stringify(file)
}

export class InvalidBackupError extends Error {
  constructor(message = 'Filen ser inte ut som en KBT-säkerhetskopia') {
    super(message)
    this.name = 'InvalidBackupError'
  }
}

function parseBackup(contents: string): BackupFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(contents)
  } catch {
    throw new InvalidBackupError()
  }
  const file = parsed as BackupFile
  if (file?.format !== BACKUP_FORMAT || !Array.isArray(file.records) || !file.kdf) {
    throw new InvalidBackupError()
  }
  if (file.version > BACKUP_VERSION) {
    throw new InvalidBackupError(
      'Filen kommer från en nyare version av appen. Uppdatera appen och försök igen.',
    )
  }
  return file
}

/**
 * Återställer en säkerhetskopia och ersätter allt som finns lokalt. Nyckeln
 * låses upp först — går inte lösenfrasen igenom rörs ingenting.
 */
export async function restoreBackup(
  contents: string,
  passphrase: string,
): Promise<{ store: SecureStore; dek: CryptoKey }> {
  const file = parseBackup(contents)
  const salt = base64ToBytes(file.kdf.salt)
  const kek = await deriveKek(passphrase, salt, file.kdf.iterations)

  const wrapIv = base64ToBytes(file.wrappedDek.iv)
  const wrappedDek = base64ToBytes(file.wrappedDek.ct)
  const dek = await unwrapDek({ iv: wrapIv, ciphertext: wrappedDek }, kek)

  const records: StoredRecord[] = file.records.map((r) => ({
    id: r.id,
    type: r.type as StoredRecord['type'],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    day: r.day,
    iv: base64ToBytes(r.iv),
    ciphertext: base64ToBytes(r.ct),
  }))

  await db.transaction('rw', db.records, db.vault, async () => {
    await db.records.clear()
    await db.records.bulkPut(records)
    await db.vault.put({
      id: 'vault',
      version: 1,
      mode: 'passphrase',
      salt,
      iterations: file.kdf.iterations,
      wrappedDek,
      wrapIv,
      createdAt: file.createdAt,
    })
  })

  return { store: new SecureStore(dek), dek }
}

export function backupFilename(date = new Date()): string {
  return `kbt-sakerhetskopia-${date.toISOString().slice(0, 10)}.kbt.json`
}
