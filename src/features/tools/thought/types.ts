/** Tankedagbokens sju kolumner, i den form de sparas. */
export interface ThoughtRecordData {
  situation: string
  thought: string
  /** Hur mycket du tror på tanken, 0–100, innan den prövats. */
  beliefBefore: number
  emotions: string[]
  /** Intensitet för den starkaste känslan, 0–100. */
  emotionBefore: number
  body: string[]
  behaviour: string
  distortions: string[]
  evidenceFor: string
  evidenceAgainst: string
  alternative: string
  beliefAfter: number
  emotionAfter: number
}

export function emptyThoughtRecord(): ThoughtRecordData {
  return {
    situation: '',
    thought: '',
    beliefBefore: 70,
    emotions: [],
    emotionBefore: 60,
    body: [],
    behaviour: '',
    distortions: [],
    evidenceFor: '',
    evidenceAgainst: '',
    alternative: '',
    beliefAfter: 70,
    emotionAfter: 60,
  }
}

/** Skillnaden före och efter — det som gör övningen värd besväret. */
export function thoughtShift(record: ThoughtRecordData): {
  belief: number
  emotion: number
  helped: boolean
} {
  const belief = record.beliefBefore - record.beliefAfter
  const emotion = record.emotionBefore - record.emotionAfter
  return { belief, emotion, helped: belief > 0 || emotion > 0 }
}
