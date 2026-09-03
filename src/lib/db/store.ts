import { openJson, sealJson } from '../crypto'
import { toDayKey, type DayKey } from '../date'
import { db } from './db'
import type { Entry, RecordType, SingletonType, StoredRecord } from './types'

/**
 * Allt läsande och skrivande av användardata går genom SecureStore, som håller
 * datanyckeln i minnet. Ingen annan del av appen rör IndexedDB direkt — det är
 * så vi kan garantera att ingenting någonsin skrivs okrypterat.
 */
export class SecureStore {
  private readonly dek: CryptoKey

  constructor(dek: CryptoKey) {
    this.dek = dek
  }

  private async decrypt<T>(record: StoredRecord): Promise<Entry<T>> {
    return {
      id: record.id,
      type: record.type,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      day: record.day,
      data: await openJson<T>({ iv: record.iv, ciphertext: record.ciphertext }, this.dek),
    }
  }

  private async encrypt<T>(
    id: string,
    type: RecordType,
    data: T,
    createdAt: string,
    day: DayKey,
  ): Promise<StoredRecord> {
    const sealed = await sealJson(data, this.dek)
    return {
      id,
      type,
      createdAt,
      updatedAt: new Date().toISOString(),
      day,
      iv: sealed.iv,
      ciphertext: sealed.ciphertext,
    }
  }

  async create<T>(
    type: RecordType,
    data: T,
    options: { id?: string; day?: DayKey; createdAt?: string } = {},
  ): Promise<Entry<T>> {
    const createdAt = options.createdAt ?? new Date().toISOString()
    const record = await this.encrypt(
      options.id ?? crypto.randomUUID(),
      type,
      data,
      createdAt,
      options.day ?? toDayKey(new Date(createdAt)),
    )
    await db.records.put(record)
    return this.decrypt<T>(record)
  }

  async get<T>(id: string): Promise<Entry<T> | undefined> {
    const record = await db.records.get(id)
    return record ? this.decrypt<T>(record) : undefined
  }

  /** Skriver om en befintlig post men behåller dess id och skapandetid. */
  async save<T>(id: string, type: RecordType, data: T, day?: DayKey): Promise<Entry<T>> {
    const existing = await db.records.get(id)
    const record = await this.encrypt(
      id,
      type,
      data,
      existing?.createdAt ?? new Date().toISOString(),
      day ?? existing?.day ?? toDayKey(),
    )
    await db.records.put(record)
    return this.decrypt<T>(record)
  }

  /** Läser, ändrar och skriver tillbaka i ett svep. */
  async update<T>(id: string, mutate: (current: T) => T): Promise<Entry<T>> {
    const current = await this.get<T>(id)
    if (!current) throw new Error(`Posten ${id} finns inte`)
    return this.save<T>(id, current.type, mutate(current.data), current.day)
  }

  async byType<T>(
    type: RecordType,
    options: { from?: DayKey; to?: DayKey; limit?: number; order?: 'asc' | 'desc' } = {},
  ): Promise<Entry<T>[]> {
    const { from, to, limit, order = 'desc' } = options
    const collection =
      from || to
        ? db.records
            .where('[type+day]')
            .between([type, from ?? '0000-00-00'], [type, to ?? '9999-99-99'], true, true)
        : db.records.where('type').equals(type)

    let records = await collection.toArray()
    records.sort((a, b) =>
      order === 'desc' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt),
    )
    if (limit !== undefined) records = records.slice(0, limit)
    return Promise.all(records.map((r) => this.decrypt<T>(r)))
  }

  async countByType(type: RecordType): Promise<number> {
    return db.records.where('type').equals(type).count()
  }

  /**
   * Tidsstämpeln för den senaste posten av varje typ.
   *
   * Läser bara nycklarna ur det sammansatta indexet, så ingenting dekrypteras
   * och ingen ciphertext lämnar databasen. Det räcker för att svara på frågan
   * "har det här verktyget använts sedan i tisdags?", vilket är precis vad
   * hemuppgifterna behöver veta.
   */
  async latestByType(): Promise<Partial<Record<RecordType, string>>> {
    // Dexie beskriver indexnycklar som en lös union; det här indexet är alltid
    // paret [typ, tid], och det vet bara schemat i db.ts.
    const keys = (await db.records.orderBy('[type+createdAt]').keys()) as unknown as Array<
      [RecordType, string]
    >

    // Nycklarna kommer sorterade på [typ, tid], så den sista per typ vinner.
    const latest: Partial<Record<RecordType, string>> = {}
    for (const [type, createdAt] of keys) {
      latest[type] = createdAt
    }
    return latest
  }

  /** Poster det bara finns en av; skapas med `fallback` första gången. */
  async singleton<T>(type: SingletonType, fallback: () => T): Promise<Entry<T>> {
    const existing = await this.get<T>(type)
    if (existing) return existing
    return this.create<T>(type, fallback(), { id: type })
  }

  async saveSingleton<T>(type: SingletonType, data: T): Promise<Entry<T>> {
    return this.save<T>(type, type, data)
  }

  async remove(id: string): Promise<void> {
    await db.records.delete(id)
  }

  async removeByType(type: RecordType): Promise<void> {
    await db.records.where('type').equals(type).delete()
  }

  /** Rå, fortfarande krypterad data — används av exporten. */
  async rawAll(): Promise<StoredRecord[]> {
    return db.records.toArray()
  }
}
