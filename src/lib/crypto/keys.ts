/**
 * Nyckelhantering.
 *
 * Modellen är avsiktligt enkel och standardmässig:
 *
 *   lösenfras --PBKDF2--> KEK --AES-GCM--> wrappad DEK --AES-GCM--> varje post
 *
 * DEK:en är slumpad och byts aldrig. Det gör att användaren kan ändra sin
 * lösenfras utan att en enda post behöver krypteras om — bara wrappningen görs
 * om. Det gör också exporten möjlig: samma DEK wrappas en gång till med en
 * exportlösenfras.
 */

const PBKDF2_ITERATIONS = 310_000
const SALT_BYTES = 16
const IV_BYTES = 12

export class WrongPassphraseError extends Error {
  constructor() {
    super('Fel lösenfras')
    this.name = 'WrongPassphraseError'
  }
}

export interface SealedBytes {
  iv: Uint8Array
  ciphertext: Uint8Array
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

export function newSalt(): Uint8Array {
  return randomBytes(SALT_BYTES)
}

export const defaultIterations = PBKDF2_ITERATIONS

/** Härleder en nyckelkrypteringsnyckel ur en lösenfras. */
export async function deriveKek(
  passphrase: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase.normalize('NFKC')),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Nyckel för läget "utan kodlås": 32 slumpade bytes som ligger i localStorage.
 * Detta skyddar mot att någon råkar läsa databasen, inte mot någon som har
 * din upplåsta enhet. UI:t säger det rakt ut istället för att låtsas.
 */
export async function importDeviceKey(secret: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', secret as BufferSource, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

/** Skapar en ny datakrypteringsnyckel. */
export async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}

export async function wrapDek(dek: CryptoKey, kek: CryptoKey): Promise<SealedBytes> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', dek))
  return sealBytes(raw, kek)
}

export async function unwrapDek(sealed: SealedBytes, kek: CryptoKey): Promise<CryptoKey> {
  const raw = await openBytes(sealed, kek)
  return crypto.subtle.importKey('raw', raw as BufferSource, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ])
}

export async function sealBytes(plaintext: Uint8Array, key: CryptoKey): Promise<SealedBytes> {
  const iv = randomBytes(IV_BYTES)
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      plaintext as BufferSource,
    ),
  )
  return { iv, ciphertext }
}

export async function openBytes(sealed: SealedBytes, key: CryptoKey): Promise<Uint8Array> {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: sealed.iv as BufferSource },
      key,
      sealed.ciphertext as BufferSource,
    )
    return new Uint8Array(plain)
  } catch {
    // AES-GCM misslyckas på exakt samma sätt vid fel nyckel som vid manipulerad
    // data. Vi kan inte skilja dem åt, och behöver inte heller.
    throw new WrongPassphraseError()
  }
}
