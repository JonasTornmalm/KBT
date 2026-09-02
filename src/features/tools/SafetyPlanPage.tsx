import { useState } from 'react'
import { Card, Muted } from '../../components/Card'
import { PlusIcon, TrashIcon } from '../../components/Icons'
import { ListField } from '../../components/ListField'
import { CRISIS_RESOURCES } from '../../content/crisis'
import { saveStatusLabel, useAutoSaveSingleton } from '../../lib/useAutoSave'
import { ToolPage } from './ToolPage'

export interface Contact {
  name: string
  phone: string
}

export interface SafetyPlanData {
  warningSigns: string[]
  ownStrategies: string[]
  distractions: string[]
  people: Contact[]
  professionals: Contact[]
  makeSafe: string[]
  reasons: string[]
}

function emptyPlan(): SafetyPlanData {
  return {
    warningSigns: [],
    ownStrategies: [],
    distractions: [],
    people: [],
    professionals: CRISIS_RESOURCES.filter((resource) => resource.urgent).map((resource) => ({
      name: resource.name,
      phone: resource.phone ?? '',
    })),
    makeSafe: [],
    reasons: [],
  }
}

function ContactList({
  label,
  hint,
  contacts,
  onChange,
}: {
  label: string
  hint: string
  contacts: Contact[]
  onChange: (contacts: Contact[]) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const add = () => {
    if (!name.trim()) return
    onChange([...contacts, { name: name.trim(), phone: phone.trim() }])
    setName('')
    setPhone('')
  }

  return (
    <div>
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{hint}</p>

      {contacts.length > 0 ? (
        <ul className="mt-4 grid gap-2">
          {contacts.map((contact, index) => (
            <li
              key={`${contact.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface py-2 pl-4 pr-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{contact.name}</span>
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone.replace(/[\s-]/g, '')}`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {contact.phone}
                  </a>
                ) : null}
              </span>
              <button
                type="button"
                onClick={() => onChange(contacts.filter((_, i) => i !== index))}
                aria-label={`Ta bort ${contact.name}`}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-crisis-soft hover:text-crisis-ink"
              >
                <TrashIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Namn"
          aria-label={`${label} – namn`}
          className="min-h-[3rem] min-w-0 flex-[2] rounded-xl border border-line bg-surface px-4 text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          placeholder="Telefon"
          inputMode="tel"
          aria-label={`${label} – telefon`}
          className="min-h-[3rem] min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          disabled={!name.trim()}
          aria-label="Lägg till kontakt"
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-ink transition-[filter] hover:brightness-95 disabled:opacity-40"
        >
          <PlusIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}

/**
 * Säkerhetsplan enligt Stanley och Browns modell — den mest använda och bäst
 * utvärderade formen av säkerhetsplanering.
 *
 * Ordningen på stegen är inte godtycklig: den går från det du kan göra helt
 * själv till det som kräver andra människor. Tanken är att man ska kunna börja
 * högst upp och arbeta sig nedåt, i stället för att behöva välja i ett läge då
 * det är som svårast att välja.
 */
export function SafetyPlanPage() {
  const { value, update, status, loading } = useAutoSaveSingleton<SafetyPlanData>(
    'safetyPlan',
    emptyPlan,
  )

  if (loading || !value) return null

  const steps = [
    {
      n: 1,
      title: 'Mina varningstecken',
      hint: 'Vad märker du när det börjar gå nedåt? Tankar, känslor, men framför allt beteenden – att sluta svara, sova mer, dra sig undan.',
      field: 'warningSigns' as const,
      suggestions: [
        'Slutar svara på meddelanden',
        'Sover mycket mer eller mycket mindre',
        'Ställer in saker jag planerat',
        'Tankarna går fortare på kvällen',
        'Slutar äta ordentligt',
      ],
    },
    {
      n: 2,
      title: 'Vad jag kan göra själv',
      hint: 'Saker som hjälpt förut, som du klarar utan att blanda in någon annan.',
      field: 'ownStrategies' as const,
      suggestions: [
        'Gå ut en sväng',
        'Duscha',
        'Fyrkantsandning i fem minuter',
        'Lyssna på en särskild spellista',
        'Skriva av mig i tankedagboken',
      ],
    },
    {
      n: 3,
      title: 'Personer och platser som drar mig ur det',
      hint: 'Sällskap som avleder, utan att du behöver berätta hur du mår. Ett kafé, ett bibliotek, en granne.',
      field: 'distractions' as const,
      suggestions: ['Gå till ett kafé', 'Sitta på biblioteket', 'Ringa någon och prata om annat'],
    },
    {
      n: 6,
      title: 'Göra det svårare',
      hint: 'Vad kan du lämna ifrån dig, låsa in eller be någon förvara? Att öka avståndet till det farliga är den enskilt mest skyddande åtgärden som finns.',
      field: 'makeSafe' as const,
      suggestions: [
        'Lämna medicinen hos en granne',
        'Be någon förvara nycklarna',
        'Inte vara ensam hemma ikväll',
      ],
    },
  ]

  return (
    <ToolPage
      toolId="safety-plan"
      intro={
        <Muted className="mt-3 max-w-[38rem]">
          Fyll i den när du mår hyfsat. Poängen är att du inte ska behöva tänka ut något nytt när
          det är som tyngst – då räcker det att läsa. Allt sparas automatiskt.
        </Muted>
      }
    >
      <div className="grid gap-4">
        {steps.slice(0, 3).map((step) => (
          <Card key={step.field}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-soft text-sm font-bold text-rose-ink">
                {step.n}
              </span>
              <h2 className="font-bold text-ink">{step.title}</h2>
            </div>
            <ListField
              label={step.title}
              hint={step.hint}
              items={value[step.field]}
              onChange={(items) => update((current) => ({ ...current, [step.field]: items }))}
              suggestions={step.suggestions}
            />
          </Card>
        ))}

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-soft text-sm font-bold text-rose-ink">
              4
            </span>
            <h2 className="font-bold text-ink">Personer jag kan höra av mig till</h2>
          </div>
          <ContactList
            label="Personer jag kan höra av mig till"
            hint="De som får veta hur du faktiskt har det. Skriv ner numret nu – att leta upp det i stunden är ett hinder för mycket."
            contacts={value.people}
            onChange={(people) => update((current) => ({ ...current, people }))}
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-soft text-sm font-bold text-rose-ink">
              5
            </span>
            <h2 className="font-bold text-ink">Professionell hjälp</h2>
          </div>
          <ContactList
            label="Professionell hjälp"
            hint="De nationella numren ligger redan här. Lägg till din vårdcentral, din behandlare eller din psykiatriska mottagning."
            contacts={value.professionals}
            onChange={(professionals) => update((current) => ({ ...current, professionals }))}
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-soft text-sm font-bold text-rose-ink">
              6
            </span>
            <h2 className="font-bold text-ink">{steps[3]!.title}</h2>
          </div>
          <ListField
            label={steps[3]!.title}
            hint={steps[3]!.hint}
            items={value.makeSafe}
            onChange={(makeSafe) => update((current) => ({ ...current, makeSafe }))}
            suggestions={steps[3]!.suggestions}
          />
        </Card>

        <Card tone="soft">
          <h2 className="font-bold text-primary-ink">Skäl att stanna kvar</h2>
          <ListField
            label="Skäl att stanna kvar"
            hint="Människor, djur, saker du vill hinna med. Skriv dem konkret – de ska gå att läsa och känna igen, inte bara hålla med om."
            items={value.reasons}
            onChange={(reasons) => update((current) => ({ ...current, reasons }))}
            placeholder="Min syster. Hunden. Att få se hur det går."
          />
        </Card>
      </div>

      <p aria-live="polite" className="mt-6 h-5 text-sm font-medium text-primary">
        {saveStatusLabel(status)}
      </p>

      <Card tone="muted" className="mt-2">
        <Muted>
          Planen ligger krypterad på din enhet. Vill du ha den tillgänglig även om telefonen tar
          slut på batteri: skriv av den på ett papper och lägg i plånboken.
        </Muted>
      </Card>
    </ToolPage>
  )
}
