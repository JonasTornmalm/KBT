import { openBytes, sealBytes, type SealedBytes } from './keys'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/** Krypterar ett godtyckligt JSON-serialiserbart värde med datanyckeln. */
export async function sealJson(value: unknown, dek: CryptoKey): Promise<SealedBytes> {
  return sealBytes(encoder.encode(JSON.stringify(value)), dek)
}

export async function openJson<T>(sealed: SealedBytes, dek: CryptoKey): Promise<T> {
  return JSON.parse(decoder.decode(await openBytes(sealed, dek))) as T
}
