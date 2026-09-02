import {
  defaultIterations,
  deriveKek,
  generateDek,
  importDeviceKey,
  newSalt,
  randomBytes,
  unwrapDek,
  wrapDek,
} from '../crypto'
import { bytesToBase64, base64ToBytes } from '../crypto/base64'
import { db } from './db'
import { SecureStore } from './store'
import type { VaultConfig } from './types'

const DEVICE_KEY_STORAGE = 'kbt.deviceSecret'

export type LockMode = 'passphrase' | 'device'

export async function getVault(): Promise<VaultConfig | undefined> {
  return db.vault.get('vault')
}

export async function hasVault(): Promise<boolean> {
  return (await db.vault.count()) > 0
}

function readDeviceSecret(): Uint8Array | null {
  const stored = localStorage.getItem(DEVICE_KEY_STORAGE)
  return stored ? base64ToBytes(stored) : null
}

function writeDeviceSecret(secret: Uint8Array): void {
  localStorage.setItem(DEVICE_KEY_STORAGE, bytesToBase64(secret))
}

/**
 * Skapar valvet. En lösenfras krävs i låst läge; i enhetsläge genereras en
 * slumpad hemlighet som läggs i localStorage så att appen kan öppna sig själv.
 *
 * Poster från ett tidigare valv rensas. De är krypterade med en datanyckel som
 * ingen längre har, så att låta dem ligga kvar vore skräp som ändå räknas med
 * i statistiken.
 */
export async function createVault(
  mode: LockMode,
  passphrase?: string,
  hint?: string,
): Promise<{ store: SecureStore; dek: CryptoKey }> {
  const dek = await generateDek()
  const salt = newSalt()

  let kek: CryptoKey
  if (mode === 'passphrase') {
    if (!passphrase) throw new Error('Lösenfras saknas')
    kek = await deriveKek(passphrase, salt, defaultIterations)
  } else {
    const secret = randomBytes(32)
    writeDeviceSecret(secret)
    kek = await importDeviceKey(secret)
  }

  const wrapped = await wrapDek(dek, kek)
  const config: VaultConfig = {
    id: 'vault',
    version: 1,
    mode,
    salt,
    iterations: defaultIterations,
    wrappedDek: wrapped.ciphertext,
    wrapIv: wrapped.iv,
    createdAt: new Date().toISOString(),
    hint: hint || undefined,
  }
  await db.transaction('rw', db.records, db.vault, async () => {
    await db.records.clear()
    await db.vault.put(config)
  })
  return { store: new SecureStore(dek), dek }
}

/** Låser upp med lösenfras. Kastar WrongPassphraseError vid fel. */
export async function unlockWithPassphrase(
  passphrase: string,
): Promise<{ store: SecureStore; dek: CryptoKey }> {
  const config = await getVault()
  if (!config) throw new Error('Inget valv att låsa upp')
  const kek = await deriveKek(passphrase, config.salt, config.iterations)
  const dek = await unwrapDek({ iv: config.wrapIv, ciphertext: config.wrappedDek }, kek)
  return { store: new SecureStore(dek), dek }
}

/** Låser upp i enhetsläge, utan att fråga användaren om något. */
export async function unlockWithDevice(): Promise<{ store: SecureStore; dek: CryptoKey }> {
  const config = await getVault()
  if (!config || config.mode !== 'device') throw new Error('Enhetsläge är inte aktivt')
  const secret = readDeviceSecret()
  if (!secret) throw new Error('Enhetsnyckeln saknas i den här webbläsaren')
  const kek = await importDeviceKey(secret)
  const dek = await unwrapDek({ iv: config.wrapIv, ciphertext: config.wrappedDek }, kek)
  return { store: new SecureStore(dek), dek }
}

/**
 * Byter låsläge eller lösenfras. Posterna rörs inte — bara wrappningen av
 * datanyckeln görs om, vilket är hela poängen med en separat datanyckel.
 */
export async function rewrapVault(
  dek: CryptoKey,
  next: { mode: LockMode; passphrase?: string; hint?: string },
): Promise<void> {
  const config = await getVault()
  if (!config) throw new Error('Inget valv att ändra')

  const salt = newSalt()
  let kek: CryptoKey
  if (next.mode === 'passphrase') {
    if (!next.passphrase) throw new Error('Lösenfras saknas')
    kek = await deriveKek(next.passphrase, salt, defaultIterations)
    localStorage.removeItem(DEVICE_KEY_STORAGE)
  } else {
    const secret = randomBytes(32)
    writeDeviceSecret(secret)
    kek = await importDeviceKey(secret)
  }

  const wrapped = await wrapDek(dek, kek)
  await db.vault.put({
    ...config,
    mode: next.mode,
    salt,
    iterations: defaultIterations,
    wrappedDek: wrapped.ciphertext,
    wrapIv: wrapped.iv,
    hint: next.hint || undefined,
  })
}

/** Raderar allt, oåterkalleligt. */
export async function destroyEverything(): Promise<void> {
  await db.records.clear()
  await db.vault.clear()
  localStorage.removeItem(DEVICE_KEY_STORAGE)
}
