import { Card, Muted } from '../../components/Card'
import { TextArea } from '../../components/Field'
import { ListField } from '../../components/ListField'
import { ErrorState, LoadingState } from '../../components/PageState'
import { saveStatusLabel, useAutoSaveSingleton } from '../../lib/useAutoSave'
import { ToolPage } from './ToolPage'

export interface RelapsePlanData {
  whatHelped: string[]
  warningSigns: string[]
  firstSteps: string[]
  toolbox: string[]
  whenToSeekCare: string
  letterToSelf: string
}

function emptyPlan(): RelapsePlanData {
  return {
    whatHelped: [],
    warningSigns: [],
    firstSteps: [],
    toolbox: [],
    whenToSeekCare: '',
    letterToSelf: '',
  }
}

/**
 * Vidmakthållandeplanen skrivs i slutet av programmet, men läses långt senare.
 * Därför är alla frågor formulerade mot en framtida läsare som är tröttare och
 * mer pessimistisk än den som skriver — det är den personen planen ska nå.
 */
export function RelapsePlanPage() {
  const { value, update, status, error, loading } = useAutoSaveSingleton<RelapsePlanData>(
    'relapsePlan',
    emptyPlan,
  )

  if (error) {
    return (
      <ToolPage toolId="relapse-plan">
        <ErrorState />
      </ToolPage>
    )
  }
  if (loading || !value) {
    return (
      <ToolPage toolId="relapse-plan">
        <LoadingState />
      </ToolPage>
    )
  }

  const sections = [
    {
      key: 'whatHelped' as const,
      title: 'Vad som faktiskt hjälpte',
      hint: 'Var konkret. "Promenad före frukost" – inte "att röra på sig". Ju mer specifikt, desto lättare att göra om.',
      suggestions: [
        'Tankedagbok när något biter sig fast',
        'Promenad varje morgon',
        'Planera in en meningsfull sak per dag',
        'Orosstund på kvällen',
        'Fast uppstigningstid',
      ],
    },
    {
      key: 'warningSigns' as const,
      title: 'Mina tidiga varningstecken',
      hint: 'De märks oftast i beteendet innan de märks i humöret. Vad slutar du göra först?',
      suggestions: [
        'Slutar svara på meddelanden',
        'Ställer in träningen',
        'Sover längre men blir tröttare',
        'Skjuter upp räkningar och post',
        'Börjar undvika en viss person eller plats',
      ],
    },
    {
      key: 'firstSteps' as const,
      title: 'De tre första sakerna jag gör',
      hint: 'När varningstecknen dyker upp. I ordning, så att inget behöver bestämmas i stunden.',
      suggestions: [
        'Börja checka in dagligen igen',
        'Lägga in en aktivitet om dagen',
        'Göra PHQ-9 och se var jag ligger',
        'Berätta för någon',
      ],
    },
    {
      key: 'toolbox' as const,
      title: 'Min verktygslåda',
      hint: 'De verktyg härifrån du vet att du kommer använda. Fyra räcker – en lång lista blir inte gjord.',
      suggestions: [
        'Tankedagbok',
        'Beteendeaktivering',
        'Exponeringstrappan',
        'Orosstund',
        'Fyrkantsandning',
        'Problemlösning',
      ],
    },
  ]

  return (
    <ToolPage
      toolId="relapse-plan"
      intro={
        <Muted className="mt-3 max-w-[38rem]">
          Ett bakslag är en dålig vecka. Ett återfall är att sluta använda det som fungerade.
          Skillnaden ligger inte i hur du mår, utan i vad du gör med det – och det är vad den här
          planen är till för. Allt sparas automatiskt.
        </Muted>
      }
    >
      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.key}>
            <h2 className="mb-3 font-bold text-ink">{section.title}</h2>
            <ListField
              label={section.title}
              hint={section.hint}
              items={value[section.key]}
              onChange={(items) => update((current) => ({ ...current, [section.key]: items }))}
              suggestions={section.suggestions}
            />
          </Card>
        ))}

        <Card>
          <h2 className="mb-3 font-bold text-ink">När jag söker vård</h2>
          <TextArea
            label="Min gräns"
            hint="Sätt den nu, medan du tänker klart. Till exempel: om jag inte kommit igång på två veckor, eller om PHQ-9 går över 15."
            value={value.whenToSeekCare}
            onChange={(event) =>
              update((current) => ({ ...current, whenToSeekCare: event.target.value }))
            }
            rows={3}
            placeholder="Om jag inte har checkat in på två veckor, eller om jag börjar tänka att det inte spelar någon roll – då ringer jag vårdcentralen."
          />
        </Card>

        <Card tone="soft">
          <h2 className="mb-3 font-bold text-primary-ink">Brev till mig själv</h2>
          <TextArea
            label="Till dig som läser det här senare"
            hint="Vad behöver du höra av dig själv en dålig vecka? Skriv det du skulle säga till en vän i samma läge."
            value={value.letterToSelf}
            onChange={(event) =>
              update((current) => ({ ...current, letterToSelf: event.target.value }))
            }
            rows={7}
            placeholder="Om du läser det här är det förmodligen tungt igen. Det betyder inte att allt du gjorde var förgäves…"
          />
        </Card>
      </div>

      <p aria-live="polite" className="mt-6 h-5 text-sm font-medium text-primary">
        {saveStatusLabel(status)}
      </p>
    </ToolPage>
  )
}
