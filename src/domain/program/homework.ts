import type { RecordType } from '../../lib/db/types'

/**
 * Hemuppgifter som bockar av sig själva.
 *
 * En behandlare frågar inte "gjorde du tankedagboken?" när den ligger på
 * bordet. Appen har samma möjlighet: den vet vad som skrivits och när. Utan
 * det här steget säger startsidan "gör uppgiften" i evighet, också för den som
 * just gjort den — och då slutar man tro på det appen säger.
 *
 * Slutledningen är avsiktligt trubbig: finns det en post av rätt sort, skapad
 * efter att sessionen bockades av, räknas uppgiften som gjord. Att kräva mer
 * skulle innebära att gissa om innehållet är "tillräckligt", vilket varken
 * appen eller någon annan kan avgöra.
 */

/** Posttyper som räknas som bevis på att ett verktyg faktiskt använts. */
const TOOL_EVIDENCE: Record<string, RecordType[]> = {
  checkin: ['checkin'],
  assessment: ['assessment'],
  'thought-record': ['thoughtRecord'],
  experiment: ['experiment'],
  activity: ['activity'],
  exposure: ['exposureLadder', 'exposureSession'],
  worry: ['worry'],
  'problem-solving': ['problemSolving'],
  sleep: ['sleepDiary'],
  breathing: ['practice'],
}

/**
 * Verktyg som saknas här bockas bara av för hand. Värderingarna, säkerhets-
 * planen och vidmakthållandeplanen är singletons som skapas tomma första
 * gången sidan öppnas — deras tidsstämpel säger att sidan besökts, inte att
 * något fyllts i, och att kalla det för en gjord uppgift vore att ljuga.
 */

/** Senast skapade posten per typ, som `SecureStore.latestByType()` ger den. */
export type ToolActivity = Partial<Record<RecordType, string>>

/**
 * Sant när verktyget använts efter `since`. Saknas antingen verktyget, tiden
 * eller ett bevisspår är svaret nej — uppgiften bockas då av för hand.
 */
export function isToolUsedSince(
  tool: string | undefined,
  since: string | undefined,
  activity: ToolActivity,
): boolean {
  if (!tool || !since) return false

  const types = TOOL_EVIDENCE[tool]
  if (!types) return false

  const used = types.some((type) => {
    const latest = activity[type]
    return latest !== undefined && latest >= since
  })
  return used
}
