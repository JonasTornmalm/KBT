import { describe, expect, it } from 'vitest'
import {
  WrongPassphraseError,
  deriveKek,
  generateDek,
  newSalt,
  openJson,
  sealJson,
  unwrapDek,
  wrapDek,
} from './index'
import { base64ToBytes, bytesToBase64 } from './base64'

describe('base64', () => {
  it('rundgår utan att tappa bytes', () => {
    const bytes = crypto.getRandomValues(new Uint8Array(1000))
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes)
  })

  it('klarar tomma och stora buffertar', () => {
    expect(base64ToBytes(bytesToBase64(new Uint8Array(0)))).toEqual(new Uint8Array(0))
    // getRandomValues tar max 65 536 bytes per anrop, så vi fyller i omgångar.
    const big = new Uint8Array(70_000)
    for (let i = 0; i < big.length; i += 32_768) {
      crypto.getRandomValues(big.subarray(i, Math.min(i + 32_768, big.length)))
    }
    expect(base64ToBytes(bytesToBase64(big))).toEqual(big)
  })
})

describe('sealJson/openJson', () => {
  it('krypterar och läser tillbaka ett objekt', async () => {
    const dek = await generateDek()
    const payload = { tanke: 'Jag klarar inte det här', tilltro: 85, känslor: ['oro', 'skam'] }
    const sealed = await sealJson(payload, dek)

    // Klartexten får inte gå att hitta i ciphertexten.
    const asText = new TextDecoder().decode(sealed.ciphertext)
    expect(asText).not.toContain('klarar')

    expect(await openJson(sealed, dek)).toEqual(payload)
  })

  it('ger olika ciphertext för samma innehåll', async () => {
    const dek = await generateDek()
    const a = await sealJson({ x: 1 }, dek)
    const b = await sealJson({ x: 1 }, dek)
    expect(bytesToBase64(a.ciphertext)).not.toEqual(bytesToBase64(b.ciphertext))
  })

  it('vägrar öppna med fel nyckel', async () => {
    const sealed = await sealJson({ x: 1 }, await generateDek())
    await expect(openJson(sealed, await generateDek())).rejects.toBeInstanceOf(WrongPassphraseError)
  })

  it('vägrar öppna manipulerad data', async () => {
    const dek = await generateDek()
    const sealed = await sealJson({ x: 1 }, dek)
    sealed.ciphertext.set([(sealed.ciphertext[0] ?? 0) ^ 0xff], 0)
    await expect(openJson(sealed, dek)).rejects.toBeInstanceOf(WrongPassphraseError)
  })
})

describe('nyckelwrappning', () => {
  it('återskapar datanyckeln från rätt lösenfras', async () => {
    const dek = await generateDek()
    const salt = newSalt()
    const wrapped = await wrapDek(dek, await deriveKek('en lång och lugn lösenfras', salt, 1000))

    const again = await unwrapDek(wrapped, await deriveKek('en lång och lugn lösenfras', salt, 1000))
    const sealed = await sealJson({ hemligt: true }, dek)
    expect(await openJson(sealed, again)).toEqual({ hemligt: true })
  })

  it('misslyckas med fel lösenfras', async () => {
    const salt = newSalt()
    const wrapped = await wrapDek(await generateDek(), await deriveKek('rätt', salt, 1000))
    await expect(unwrapDek(wrapped, await deriveKek('fel', salt, 1000))).rejects.toBeInstanceOf(
      WrongPassphraseError,
    )
  })

  it('normaliserar unicode så att samma lösenfras alltid ger samma nyckel', async () => {
    const salt = newSalt()
    // 'å' som ett tecken respektive 'a' + kombinerande ring.
    const composed = 'lösenfrås'
    const decomposed = composed.normalize('NFD')
    expect(composed).not.toBe(decomposed)

    const wrapped = await wrapDek(await generateDek(), await deriveKek(composed, salt, 1000))
    await expect(
      unwrapDek(wrapped, await deriveKek(decomposed, salt, 1000)),
    ).resolves.toBeDefined()
  })
})
