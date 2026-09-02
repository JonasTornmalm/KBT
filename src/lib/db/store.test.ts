import { beforeEach, describe, expect, it } from 'vitest'
import { WrongPassphraseError } from '../crypto'
import { createBackup, restoreBackup, InvalidBackupError } from '../export/backup'
import { db } from './db'
import type { SecureStore } from './store'
import {
  createVault,
  destroyEverything,
  hasVault,
  rewrapVault,
  unlockWithDevice,
  unlockWithPassphrase,
} from './vault'

interface Thought {
  situation: string
  belief: number
}

async function freshVault(passphrase = 'lugn och trygg 42') {
  await destroyEverything()
  return createVault('passphrase', passphrase)
}

describe('valvet', () => {
  beforeEach(async () => {
    await destroyEverything()
    localStorage.clear()
  })

  it('börjar tomt', async () => {
    expect(await hasVault()).toBe(false)
  })

  it('skapas och låses upp med rätt lösenfras', async () => {
    const { store } = await createVault('passphrase', 'min lösenfras', 'blomman i fönstret')
    await store.create<Thought>('thoughtRecord', { situation: 'möte', belief: 80 })

    const reopened = await unlockWithPassphrase('min lösenfras')
    const found = await reopened.store.byType<Thought>('thoughtRecord')
    expect(found).toHaveLength(1)
    expect(found[0]?.data.situation).toBe('möte')
  })

  it('vägrar låsa upp med fel lösenfras', async () => {
    await createVault('passphrase', 'rätt lösenfras')
    await expect(unlockWithPassphrase('fel lösenfras')).rejects.toBeInstanceOf(WrongPassphraseError)
  })

  it('låser upp sig själv i enhetsläge', async () => {
    const { store } = await createVault('device')
    await store.create<Thought>('thoughtRecord', { situation: 'bussen', belief: 60 })

    const reopened = await unlockWithDevice()
    expect(await reopened.store.countByType('thoughtRecord')).toBe(1)
  })

  it('byter lösenfras utan att kryptera om posterna', async () => {
    const { store, dek } = await createVault('passphrase', 'gammal')
    await store.create<Thought>('thoughtRecord', { situation: 'kön till kassan', belief: 40 })
    const before = await db.records.toArray()

    await rewrapVault(dek, { mode: 'passphrase', passphrase: 'ny lösenfras' })

    const after = await db.records.toArray()
    expect(after[0]?.ciphertext).toEqual(before[0]?.ciphertext)

    await expect(unlockWithPassphrase('gammal')).rejects.toBeInstanceOf(WrongPassphraseError)
    const reopened = await unlockWithPassphrase('ny lösenfras')
    expect((await reopened.store.byType<Thought>('thoughtRecord'))[0]?.data.belief).toBe(40)
  })

  it('går från enhetsläge till lösenfraslås och tar bort enhetsnyckeln', async () => {
    const { store, dek } = await createVault('device')
    await store.create<Thought>('thoughtRecord', { situation: 'x', belief: 1 })

    await rewrapVault(dek, { mode: 'passphrase', passphrase: 'nu låser vi' })

    expect(localStorage.getItem('kbt.deviceSecret')).toBeNull()
    await expect(unlockWithDevice()).rejects.toThrow()
    await expect(unlockWithPassphrase('nu låser vi')).resolves.toBeDefined()
  })
})

describe('SecureStore', () => {
  let store: SecureStore

  beforeEach(async () => {
    localStorage.clear()
    store = (await freshVault()).store
  })

  it('skriver ingenting i klartext', async () => {
    await store.create('checkin', { humör: 4, anteckning: 'kände mig hoppfull idag' })
    const raw = await db.records.toArray()
    const dump = JSON.stringify(raw)
    expect(dump).not.toContain('hoppfull')
    expect(raw[0]?.type).toBe('checkin')
  })

  it('hämtar en post med id', async () => {
    const created = await store.create<Thought>('thoughtRecord', { situation: 'a', belief: 10 })
    const fetched = await store.get<Thought>(created.id)
    expect(fetched?.data).toEqual({ situation: 'a', belief: 10 })
  })

  it('uppdaterar och behåller skapandetid och id', async () => {
    const created = await store.create<Thought>('thoughtRecord', { situation: 'a', belief: 90 })
    const updated = await store.update<Thought>(created.id, (t) => ({ ...t, belief: 20 }))
    expect(updated.id).toBe(created.id)
    expect(updated.createdAt).toBe(created.createdAt)
    expect(updated.data.belief).toBe(20)
    expect(await store.countByType('thoughtRecord')).toBe(1)
  })

  it('sorterar nyast först och respekterar limit', async () => {
    await store.create('checkin', { n: 1 }, { createdAt: '2026-01-01T10:00:00.000Z' })
    await store.create('checkin', { n: 2 }, { createdAt: '2026-01-03T10:00:00.000Z' })
    await store.create('checkin', { n: 3 }, { createdAt: '2026-01-02T10:00:00.000Z' })

    const latest = await store.byType<{ n: number }>('checkin', { limit: 2 })
    expect(latest.map((e) => e.data.n)).toEqual([2, 3])

    const oldest = await store.byType<{ n: number }>('checkin', { order: 'asc', limit: 1 })
    expect(oldest[0]?.data.n).toBe(1)
  })

  it('filtrerar på datumintervall', async () => {
    await store.create('checkin', { n: 1 }, { day: '2026-01-01' })
    await store.create('checkin', { n: 2 }, { day: '2026-02-15' })
    await store.create('checkin', { n: 3 }, { day: '2026-03-30' })

    const february = await store.byType<{ n: number }>('checkin', {
      from: '2026-02-01',
      to: '2026-02-28',
    })
    expect(february.map((e) => e.data.n)).toEqual([2])
  })

  it('skapar singletons en gång och skriver sedan över dem', async () => {
    const first = await store.singleton('safetyPlan', () => ({ steg: [] as string[] }))
    expect(first.id).toBe('safetyPlan')

    await store.saveSingleton('safetyPlan', { steg: ['ringa Anna'] })
    const again = await store.singleton<{ steg: string[] }>('safetyPlan', () => ({ steg: [] }))
    expect(again.data.steg).toEqual(['ringa Anna'])
    expect(await store.countByType('safetyPlan')).toBe(1)
  })

  it('tar bort poster', async () => {
    const created = await store.create('worry', { text: 'oro' })
    await store.remove(created.id)
    expect(await store.get(created.id)).toBeUndefined()
  })
})

describe('säkerhetskopia', () => {
  beforeEach(async () => {
    localStorage.clear()
    await destroyEverything()
  })

  it('exporteras och återställs på en tom enhet', async () => {
    const { store, dek } = await createVault('passphrase', 'ursprunglig')
    await store.create<Thought>('thoughtRecord', { situation: 'presentationen', belief: 75 })
    await store.saveSingleton('values', { hälsa: 8 })
    const file = await createBackup(store, 'exportlösenfras', dek)

    // Simulera en ny enhet.
    await destroyEverything()
    expect(await hasVault()).toBe(false)

    const restored = await restoreBackup(file, 'exportlösenfras')
    const thoughts = await restored.store.byType<Thought>('thoughtRecord')
    expect(thoughts[0]?.data.situation).toBe('presentationen')
    expect((await restored.store.get<{ hälsa: number }>('values'))?.data.hälsa).toBe(8)

    // Efter återställning är exportlösenfrasen appens lösenfras.
    await expect(unlockWithPassphrase('exportlösenfras')).resolves.toBeDefined()
  })

  it('innehåller ingen läsbar klartext', async () => {
    const { store, dek } = await createVault('passphrase', 'p')
    await store.create('checkin', { anteckning: 'väldigt privat mening' })
    const file = await createBackup(store, 'export', dek)
    expect(file).not.toContain('privat')
  })

  it('rör inte befintlig data när lösenfrasen är fel', async () => {
    const { store, dek } = await createVault('passphrase', 'a')
    await store.create('checkin', { n: 1 })
    const file = await createBackup(store, 'exportnyckel', dek)

    const { store: other } = await createVault('passphrase', 'b')
    await other.create('checkin', { n: 99 })

    await expect(restoreBackup(file, 'fel nyckel')).rejects.toBeInstanceOf(WrongPassphraseError)
    expect(await other.countByType('checkin')).toBe(1)
    expect((await other.byType<{ n: number }>('checkin'))[0]?.data.n).toBe(99)
  })

  it('avvisar filer som inte är säkerhetskopior', async () => {
    await expect(restoreBackup('{}', 'x')).rejects.toBeInstanceOf(InvalidBackupError)
    await expect(restoreBackup('inte json alls', 'x')).rejects.toBeInstanceOf(InvalidBackupError)
  })
})
