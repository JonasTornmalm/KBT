/**
 * Skattningsskalorna.
 *
 * PHQ-9 och GAD-7 är utvecklade av Robert L. Spitzer, Janet B.W. Williams,
 * Kurt Kroenke m.fl. med anslag från Pfizer, och är fria att återge, översätta
 * och sprida utan tillstånd. WHO-5 är utgiven av WHO:s regionkontor för Europa
 * och är fri att använda med angiven källa. Se sidan "Källor och licenser".
 *
 * Upphovsrättsskyddade instrument (t.ex. ISI, BDI, BAI) används medvetet inte.
 */

export type AssessmentKey = 'phq9' | 'gad7' | 'who5'

/** Hur ett resultat ska bemötas — styr färg och ton, aldrig larm. */
export type Tone = 'good' | 'calm' | 'watch' | 'act'

export interface ScaleOption {
  value: number
  label: string
  /** Kort form för smala skärmar. */
  short: string
}

export interface ScaleItem {
  id: string
  text: string
  /** Sätts på PHQ-9 fråga 9. Ett svar över noll öppnar stödvyn. */
  safetyItem?: boolean
}

export interface ScaleBand {
  min: number
  max: number
  label: string
  tone: Tone
  /** Vad siffran betyder, i andra person och utan diagnosspråk. */
  meaning: string
  /** Vad som är rimligt att göra härnäst. */
  advice: string
}

export interface Scale {
  key: AssessmentKey
  name: string
  fullName: string
  measures: string
  /** Varför den finns med, i en mening. */
  purpose: string
  prompt: string
  timeframe: string
  items: ScaleItem[]
  options: ScaleOption[]
  maxScore: number
  /** Om ett högre värde är bättre (WHO-5) eller sämre (PHQ-9, GAD-7). */
  direction: 'higherIsWorse' | 'higherIsBetter'
  bands: ScaleBand[]
  attribution: string
}

const FREQUENCY_OPTIONS: ScaleOption[] = [
  { value: 0, label: 'Inte alls', short: 'Inte alls' },
  { value: 1, label: 'Flera dagar', short: 'Flera dagar' },
  { value: 2, label: 'Mer än hälften av dagarna', short: 'Mer än hälften' },
  { value: 3, label: 'Nästan varje dag', short: 'Nästan dagligen' },
]

export const PHQ9: Scale = {
  key: 'phq9',
  name: 'PHQ-9',
  fullName: 'Patient Health Questionnaire-9',
  measures: 'Nedstämdhet',
  purpose:
    'Nio frågor som fångar hur nedstämdheten sett ut de senaste två veckorna. Samma formulär används i svensk primärvård.',
  prompt: 'Hur ofta har du besvärats av följande?',
  timeframe: 'Under de senaste två veckorna',
  options: FREQUENCY_OPTIONS,
  maxScore: 27,
  direction: 'higherIsWorse',
  items: [
    { id: 'phq9-1', text: 'Litet intresse eller glädje av att göra saker' },
    { id: 'phq9-2', text: 'Känt dig nedstämd, deprimerad eller upplevt hopplöshet' },
    { id: 'phq9-3', text: 'Svårt att somna, sovit oroligt eller sovit för mycket' },
    { id: 'phq9-4', text: 'Känt dig trött eller haft för lite energi' },
    { id: 'phq9-5', text: 'Dålig aptit eller ätit för mycket' },
    {
      id: 'phq9-6',
      text: 'Tyckt illa om dig själv – känt dig misslyckad eller att du svikit dig själv eller din familj',
    },
    {
      id: 'phq9-7',
      text: 'Svårt att koncentrera dig, till exempel läsa tidningen eller se på tv',
    },
    {
      id: 'phq9-8',
      text: 'Rört dig eller talat så långsamt att andra kunnat märka det – eller tvärtom varit så rastlös att du rört dig mer än vanligt',
    },
    {
      id: 'phq9-9',
      text: 'Tankar på att det skulle vara bättre om du var död, eller på att skada dig själv på något sätt',
      safetyItem: true,
    },
  ],
  bands: [
    {
      min: 0,
      max: 4,
      label: 'Inga eller minimala besvär',
      tone: 'good',
      meaning: 'Dina svar tyder inte på nedstämdhet just nu.',
      advice: 'Fortsätt med det som fungerar. Att skatta då och då gör förändringar lättare att se.',
    },
    {
      min: 5,
      max: 9,
      label: 'Lätta besvär',
      tone: 'calm',
      meaning: 'Du bär på en del nedstämdhet, men den ser ut att vara i den lättare delen av skalan.',
      advice: 'Beteendeaktivering brukar hjälpa här. Börja med vecka 2 i programmet.',
    },
    {
      min: 10,
      max: 14,
      label: 'Måttliga besvär',
      tone: 'watch',
      meaning: 'Nedstämdheten är påtaglig och påverkar sannolikt din vardag.',
      advice:
        'Det här är nivåer där KBT har god effekt. Följ programmet regelbundet, och överväg att också prata med din vårdcentral.',
    },
    {
      min: 15,
      max: 19,
      label: 'Medelsvåra besvär',
      tone: 'watch',
      meaning: 'Dina svar tyder på en tung period.',
      advice:
        'Självhjälp kan vara ett bra stöd, men bör inte vara ditt enda. Ta kontakt med din vårdcentral eller ring 1177.',
    },
    {
      min: 20,
      max: 27,
      label: 'Svåra besvär',
      tone: 'act',
      meaning: 'Dina svar tyder på svår nedstämdhet.',
      advice:
        'Du förtjänar mer stöd än en app kan ge. Kontakta din vårdcentral eller ring 1177 – gärna idag.',
    },
  ],
  attribution:
    'PHQ-9 utvecklades av Spitzer, Williams och Kroenke med anslag från Pfizer Inc. Fritt att använda, återge och sprida.',
}

export const GAD7: Scale = {
  key: 'gad7',
  name: 'GAD-7',
  fullName: 'Generalized Anxiety Disorder-7',
  measures: 'Ångest och oro',
  purpose: 'Sju frågor om ängslan, oro och spändhet de senaste två veckorna.',
  prompt: 'Hur ofta har du besvärats av följande?',
  timeframe: 'Under de senaste två veckorna',
  options: FREQUENCY_OPTIONS,
  maxScore: 21,
  direction: 'higherIsWorse',
  items: [
    { id: 'gad7-1', text: 'Känt dig nervös, ängslig eller väldigt spänd' },
    { id: 'gad7-2', text: 'Inte kunnat sluta oroa dig eller kontrollera din oro' },
    { id: 'gad7-3', text: 'Oroat dig för mycket för olika saker' },
    { id: 'gad7-4', text: 'Haft svårt att slappna av' },
    { id: 'gad7-5', text: 'Varit så rastlös att du haft svårt att sitta still' },
    { id: 'gad7-6', text: 'Blivit lätt irriterad eller retlig' },
    { id: 'gad7-7', text: 'Känt dig rädd, som om något hemskt skulle hända' },
  ],
  bands: [
    {
      min: 0,
      max: 4,
      label: 'Inga eller minimala besvär',
      tone: 'good',
      meaning: 'Dina svar tyder inte på besvärande ångest just nu.',
      advice: 'Bra. Verktygen finns kvar här om oron skulle komma tillbaka.',
    },
    {
      min: 5,
      max: 9,
      label: 'Lätt ångest',
      tone: 'calm',
      meaning: 'Du har en del oro, men på en nivå många lever med utan att det tar över.',
      advice: 'Orosstunden och nedvarvningsövningarna är bra ställen att börja på.',
    },
    {
      min: 10,
      max: 14,
      label: 'Måttlig ångest',
      tone: 'watch',
      meaning: 'Oron tar troligen tid och kraft från dig.',
      advice:
        'Exponering och arbetet med oro i vecka 6 och 7 är det som ger mest här. Överväg också att prata med vården.',
    },
    {
      min: 15,
      max: 21,
      label: 'Svår ångest',
      tone: 'act',
      meaning: 'Dina svar tyder på svår ångest.',
      advice:
        'Du bör inte behöva hantera det här ensam. Kontakta din vårdcentral eller ring 1177 för rådgivning.',
    },
  ],
  attribution:
    'GAD-7 utvecklades av Spitzer, Kroenke, Williams och Löwe med anslag från Pfizer Inc. Fritt att använda, återge och sprida.',
}

export const WHO5: Scale = {
  key: 'who5',
  name: 'WHO-5',
  fullName: 'WHO:s index för välbefinnande',
  measures: 'Välbefinnande',
  purpose:
    'Fem frågor om det som faktiskt är målet: att må bra. Ett användbart komplement till att bara mäta besvär.',
  prompt: 'Hur ofta har du känt så här?',
  timeframe: 'Under de senaste två veckorna',
  options: [
    { value: 5, label: 'Hela tiden', short: 'Hela tiden' },
    { value: 4, label: 'Största delen av tiden', short: 'Mest hela tiden' },
    { value: 3, label: 'Mer än hälften av tiden', short: 'Mer än hälften' },
    { value: 2, label: 'Mindre än hälften av tiden', short: 'Mindre än hälften' },
    { value: 1, label: 'Ibland', short: 'Ibland' },
    { value: 0, label: 'Inte någon gång', short: 'Aldrig' },
  ],
  maxScore: 25,
  direction: 'higherIsBetter',
  items: [
    { id: 'who5-1', text: 'Jag har känt mig glad och på gott humör' },
    { id: 'who5-2', text: 'Jag har känt mig lugn och avslappnad' },
    { id: 'who5-3', text: 'Jag har känt mig aktiv och energisk' },
    { id: 'who5-4', text: 'Jag har vaknat utvilad och pigg' },
    { id: 'who5-5', text: 'Min vardag har varit fylld av saker som intresserar mig' },
  ],
  // Banden anges i procent (0–100), som WHO-5 alltid redovisas.
  bands: [
    {
      min: 0,
      max: 28,
      label: 'Lågt välbefinnande',
      tone: 'act',
      meaning: 'Det finns väldigt lite som ger dig energi och glädje just nu.',
      advice:
        'Vid så här låga värden rekommenderar WHO att man också gör en skattning av nedstämdhet. Gör gärna PHQ-9 härnäst.',
    },
    {
      min: 29,
      max: 50,
      label: 'Nedsatt välbefinnande',
      tone: 'watch',
      meaning: 'Ditt välbefinnande är lägre än vad som brukar räknas som god livskvalitet.',
      advice: 'Att lägga tillbaka meningsfulla aktiviteter i veckan är det som flyttar det här mest.',
    },
    {
      min: 51,
      max: 75,
      label: 'Gott välbefinnande',
      tone: 'calm',
      meaning: 'Du har en hel del som fungerar, även om allt inte är enkelt.',
      advice: 'Fortsätt värna det som ger dig energi. Det är lika viktigt som att minska besvär.',
    },
    {
      min: 76,
      max: 100,
      label: 'Mycket gott välbefinnande',
      tone: 'good',
      meaning: 'Du mår bra på de flesta sätt som frågorna fångar.',
      advice: 'Lägg gärna märke till vad du gör som fungerar – det är värt att skydda.',
    },
  ],
  attribution:
    'WHO-5 (WHO-5 Well-Being Index, 1998) är utgiven av WHO:s regionkontor för Europa och är fri att använda med angiven källa.',
}

export const SCALES: Record<AssessmentKey, Scale> = {
  phq9: PHQ9,
  gad7: GAD7,
  who5: WHO5,
}

export const SCALE_ORDER: AssessmentKey[] = ['phq9', 'gad7', 'who5']
