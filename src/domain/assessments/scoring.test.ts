import { describe, expect, it } from 'vitest'
import { SCALES, SCALE_ORDER } from './scales'
import {
  IncompleteAssessmentError,
  compareScores,
  describeChange,
  findBand,
  scoreAssessment,
} from './scoring'

describe('skalornas uppbyggnad', () => {
  it.each(SCALE_ORDER)('%s har band som täcker hela skalan utan glapp', (key) => {
    const scale = SCALES[key]
    const top = key === 'who5' ? 100 : scale.maxScore
    const bands = [...scale.bands].sort((a, b) => a.min - b.min)

    expect(bands[0]?.min).toBe(0)
    expect(bands[bands.length - 1]?.max).toBe(top)
    for (let i = 1; i < bands.length; i += 1) {
      expect(bands[i]!.min).toBe(bands[i - 1]!.max + 1)
    }
  })

  it.each(SCALE_ORDER)('%s har maxpoäng som stämmer med svarsalternativen', (key) => {
    const scale = SCALES[key]
    const highest = Math.max(...scale.options.map((o) => o.value))
    expect(scale.items.length * highest).toBe(scale.maxScore)
  })

  it('har exakt en säkerhetsfråga, och den sitter i PHQ-9', () => {
    const flagged = SCALE_ORDER.flatMap((key) =>
      SCALES[key].items.filter((i) => i.safetyItem).map((i) => i.id),
    )
    expect(flagged).toEqual(['phq9-9'])
  })
})

describe('PHQ-9', () => {
  const allZero = new Array(9).fill(0)

  it('summerar och landar i rätt band', () => {
    expect(scoreAssessment('phq9', allZero).score).toBe(0)
    expect(scoreAssessment('phq9', allZero).band.label).toBe('Inga eller minimala besvär')

    const severe = new Array(9).fill(3)
    expect(scoreAssessment('phq9', severe).score).toBe(27)
    expect(scoreAssessment('phq9', severe).band.tone).toBe('act')
  })

  it('sätter banden vid exakt rätt gränser', () => {
    const bandAt = (score: number) => findBand(SCALES.phq9, score).label
    expect(bandAt(4)).toBe('Inga eller minimala besvär')
    expect(bandAt(5)).toBe('Lätta besvär')
    expect(bandAt(9)).toBe('Lätta besvär')
    expect(bandAt(10)).toBe('Måttliga besvär')
    expect(bandAt(14)).toBe('Måttliga besvär')
    expect(bandAt(15)).toBe('Medelsvåra besvär')
    expect(bandAt(19)).toBe('Medelsvåra besvär')
    expect(bandAt(20)).toBe('Svåra besvär')
  })

  it('flaggar för säkerhet så snart fråga 9 är över noll, oavsett totalsumma', () => {
    const answers = [...allZero]
    answers[8] = 1
    const result = scoreAssessment('phq9', answers)

    // Totalen är 1 – alltså lägsta bandet – men flaggan ska ändå gå upp.
    expect(result.score).toBe(1)
    expect(result.band.tone).toBe('good')
    expect(result.safetyFlag).toBe(true)
  })

  it('flaggar inte när fråga 9 är noll trots hög totalsumma', () => {
    const answers = new Array(9).fill(3)
    answers[8] = 0
    const result = scoreAssessment('phq9', answers)
    expect(result.score).toBe(24)
    expect(result.safetyFlag).toBe(false)
  })
})

describe('GAD-7', () => {
  it('summerar och tolkar', () => {
    expect(scoreAssessment('gad7', new Array(7).fill(0)).score).toBe(0)
    expect(scoreAssessment('gad7', new Array(7).fill(3)).score).toBe(21)
    expect(scoreAssessment('gad7', [2, 2, 2, 2, 1, 1, 0]).band.label).toBe('Måttlig ångest')
  })

  it('har ingen säkerhetsflagga', () => {
    expect(scoreAssessment('gad7', new Array(7).fill(3)).safetyFlag).toBe(false)
  })
})

describe('WHO-5', () => {
  it('räknar om råpoäng till procent', () => {
    const result = scoreAssessment('who5', [5, 5, 5, 5, 5])
    expect(result.raw).toBe(25)
    expect(result.score).toBe(100)
    expect(result.max).toBe(100)
    expect(result.band.tone).toBe('good')
  })

  it('lägger låga värden i det band som leder vidare till PHQ-9', () => {
    const result = scoreAssessment('who5', [1, 1, 1, 0, 1])
    expect(result.score).toBe(16)
    expect(result.band.label).toBe('Lågt välbefinnande')
    expect(result.band.advice).toContain('PHQ-9')
  })
})

describe('ofullständiga svar', () => {
  it('vägrar poängsätta för få svar', () => {
    expect(() => scoreAssessment('phq9', [0, 0, 0])).toThrow(IncompleteAssessmentError)
  })

  it('vägrar poängsätta luckor', () => {
    const answers = new Array(9).fill(0)
    answers[4] = Number.NaN
    expect(() => scoreAssessment('phq9', answers)).toThrow(IncompleteAssessmentError)
  })
})

describe('förändring över tid', () => {
  it('vet att lägre är bättre på PHQ-9', () => {
    const change = compareScores('phq9', 18, 9)
    expect(change.direction).toBe('better')
    expect(change.meaningful).toBe(true)
  })

  it('vet att högre är bättre på WHO-5', () => {
    expect(compareScores('who5', 30, 60).direction).toBe('better')
    expect(compareScores('who5', 60, 30).direction).toBe('worse')
  })

  it('kallar små skillnader för brus', () => {
    expect(compareScores('gad7', 10, 9).meaningful).toBe(false)
    expect(compareScores('gad7', 10, 6).meaningful).toBe(true)
  })

  it('beskriver försämring utan att skuldbelägga', () => {
    const text = describeChange('phq9', 8, 15)
    expect(text).toContain('sämre')
    expect(text).toContain('Bakslag hör till')
  })

  it('beskriver oförändrat läge', () => {
    expect(describeChange('gad7', 7, 7)).toBe('Oförändrat sedan förra gången.')
  })
})
