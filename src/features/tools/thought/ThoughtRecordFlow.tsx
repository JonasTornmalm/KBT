import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../../app/VaultProvider'
import { CheckList } from '../../../components/ChoiceList'
import { TextArea } from '../../../components/Field'
import { Slider } from '../../../components/Slider'
import { StepFlow, type FlowStep } from '../../../components/StepFlow'
import { DISTORTIONS } from '../../../content/distortions'
import { BODY_SENSATIONS, EMOTIONS } from '../../../content/library'
import { emptyThoughtRecord, type ThoughtRecordData } from './types'

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

export function ThoughtRecordFlow() {
  const store = useStore()
  const navigate = useNavigate()
  const [record, setRecord] = useState<ThoughtRecordData>(emptyThoughtRecord)
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof ThoughtRecordData>(key: K, value: ThoughtRecordData[K]) =>
    setRecord((current) => ({ ...current, [key]: value }))

  const primaryEmotion =
    EMOTIONS.find((emotion) => emotion.id === record.emotions[0])?.label.toLowerCase() ?? 'känslan'

  const steps: FlowStep[] = [
    {
      id: 'situation',
      question: 'Vad var det som hände?',
      help: 'Beskriv det en kamera hade fångat: var du var, vilka som var med, vad som sades. Inga tolkningar än – de kommer i nästa steg.',
      canAdvance: record.situation.trim().length > 2,
      body: (
        <TextArea
          value={record.situation}
          onChange={(e) => set('situation', e.target.value)}
          rows={5}
          placeholder="I går kväll, när jag såg att hen läst men inte svarat…"
        />
      ),
    },
    {
      id: 'thought',
      question: 'Vad gick genom huvudet?',
      help: 'Den första tanken, med dina egna ord. Skriv den som du tänkte den, även om den låter hård eller orimlig i skrift.',
      canAdvance: record.thought.trim().length > 2,
      body: (
        <TextArea
          value={record.thought}
          onChange={(e) => set('thought', e.target.value)}
          rows={4}
          placeholder="Hen har tröttnat på mig."
        />
      ),
    },
    {
      id: 'belief-before',
      question: 'Hur mycket tror du på tanken?',
      help: 'Just nu, i magen – inte vad du vet med huvudet. Vi kommer tillbaka till samma fråga i slutet.',
      body: (
        <Slider
          label="Tilltro till tanken"
          value={record.beliefBefore}
          onChange={(value) => set('beliefBefore', value)}
          suffix=" %"
          step={5}
          anchors={['Inte alls', 'Helt och hållet']}
        />
      ),
    },
    {
      id: 'emotions',
      question: 'Vad väckte det för känslor?',
      help: 'Välj de som stämmer. Det går bra att välja flera – lägg den starkaste först.',
      canAdvance: record.emotions.length > 0,
      body: (
        <CheckList
          legend="Känslor"
          choices={EMOTIONS.map((emotion) => ({ value: emotion.id, label: emotion.label }))}
          values={record.emotions}
          onToggle={(value) => set('emotions', toggle(record.emotions, value))}
        />
      ),
    },
    {
      id: 'emotion-before',
      question: `Hur stark var ${primaryEmotion}?`,
      body: (
        <Slider
          label="Intensitet"
          value={record.emotionBefore}
          onChange={(value) => set('emotionBefore', value)}
          suffix=" %"
          step={5}
          tone="rose"
          anchors={['Knappt märkbar', 'Så starkt det går']}
        />
      ),
    },
    {
      id: 'body',
      question: 'Vad hände i kroppen?',
      help: 'Frivilligt, men användbart: kroppen märker ofta känslan före du gör det.',
      body: (
        <CheckList
          legend="Kroppsreaktioner"
          choices={BODY_SENSATIONS.map((item) => ({ value: item, label: item }))}
          values={record.body}
          onToggle={(value) => set('body', toggle(record.body, value))}
        />
      ),
    },
    {
      id: 'behaviour',
      question: 'Vad gjorde du sedan?',
      help: 'Räkna med det du inte gjorde också – att låta bli att skriva, att ställa in, att stanna hemma.',
      body: (
        <TextArea
          value={record.behaviour}
          onChange={(e) => set('behaviour', e.target.value)}
          rows={4}
          placeholder="Lade undan telefonen och låg vaken. Skickade inget mer."
        />
      ),
    },
    {
      id: 'distortions',
      question: 'Känner du igen någon tankefälla?',
      help: 'Frivilligt. Att sätta namn på mönstret skapar ett litet avstånd till tanken.',
      body: (
        <CheckList
          legend="Tankefällor"
          choices={DISTORTIONS.map((item) => ({
            value: item.id,
            label: item.name,
            description: item.short,
          }))}
          values={record.distortions}
          onToggle={(value) => set('distortions', toggle(record.distortions, value))}
        />
      ),
    },
    {
      id: 'evidence-for',
      question: 'Vad talar för att tanken stämmer?',
      help: 'Bara fakta – sådant en utomstående hade kunnat se eller höra. Inte känslor, inte tolkningar.',
      body: (
        <TextArea
          value={record.evidenceFor}
          onChange={(e) => set('evidenceFor', e.target.value)}
          rows={5}
          placeholder="Hen läste meddelandet för sex timmar sedan och har inte svarat."
        />
      ),
    },
    {
      id: 'evidence-against',
      question: 'Och vad talar emot?',
      help: 'Det här steget går ofta trögare. Ta hjälp av frågan: vad skulle jag säga till en vän som sa det här om sig själv?',
      canAdvance: record.evidenceAgainst.trim().length > 2,
      body: (
        <TextArea
          value={record.evidenceAgainst}
          onChange={(e) => set('evidenceAgainst', e.target.value)}
          rows={5}
          placeholder="Vi sågs i tisdags och det var som vanligt. Hen har haft mycket på jobbet. Jag har själv låtit bli att svara utan att mena något med det."
        />
      ),
    },
    {
      id: 'alternative',
      question: 'Vad är en rimligare slutsats?',
      help: 'Inte en positiv tanke – en som rymmer allt du just skrev. Den ska gå att tro på, annars gör den ingen nytta.',
      canAdvance: record.alternative.trim().length > 2,
      body: (
        <TextArea
          value={record.alternative}
          onChange={(e) => set('alternative', e.target.value)}
          rows={5}
          placeholder="Jag vet inte varför hen inte svarat. Det troligaste är att det handlar om hens vecka, inte om mig."
        />
      ),
    },
    {
      id: 'belief-after',
      question: 'Hur mycket tror du på den ursprungliga tanken nu?',
      help: `Du skrev ${record.beliefBefore} % när vi började.`,
      body: (
        <Slider
          label="Tilltro till den första tanken"
          value={record.beliefAfter}
          onChange={(value) => set('beliefAfter', value)}
          suffix=" %"
          step={5}
          anchors={['Inte alls', 'Helt och hållet']}
        />
      ),
    },
    {
      id: 'emotion-after',
      question: `Och hur stark är ${primaryEmotion} nu?`,
      help: `Den var ${record.emotionBefore} % när vi började.`,
      body: (
        <Slider
          label="Intensitet"
          value={record.emotionAfter}
          onChange={(value) => set('emotionAfter', value)}
          suffix=" %"
          step={5}
          tone="rose"
          anchors={['Knappt märkbar', 'Så starkt det går']}
        />
      ),
    },
  ]

  const save = async () => {
    setBusy(true)
    try {
      const saved = await store.create<ThoughtRecordData>('thoughtRecord', record)
      navigate(`/verktyg/tankedagbok/${saved.id}`, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <StepFlow
      title="Tankedagbok"
      steps={steps}
      onFinish={save}
      onExit={() => navigate('/verktyg/tankedagbok')}
      finishLabel="Spara"
      busy={busy}
    />
  )
}
