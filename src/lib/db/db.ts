import Dexie, { type EntityTable } from 'dexie'
import type { StoredRecord, VaultConfig } from './types'

export class KbtDatabase extends Dexie {
  records!: EntityTable<StoredRecord, 'id'>
  vault!: EntityTable<VaultConfig, 'id'>

  constructor() {
    super('kbt')
    this.version(1).stores({
      // Sammansatta index så att "alla tankedagböcker i mars" är en enda slagning.
      records: 'id, type, day, updatedAt, [type+day], [type+createdAt]',
      vault: 'id',
    })
  }
}

export const db = new KbtDatabase()
