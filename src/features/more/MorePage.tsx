import { Link } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Muted } from '../../components/Card'
import {
  ArrowRightIcon,
  HeartIcon,
  InsightsIcon,
  NotebookIcon,
  SettingsIcon,
  SparkIcon,
  ToolsIcon,
} from '../../components/Icons'
import { FIRST_SESSION_SLUG } from '../../content/program'
import { unlockedToolIds } from '../../domain/nextStep'
import { emptyProgress, type ProgramProgress } from '../../domain/program/types'
import { useAsync } from '../../lib/useAsync'

/**
 * Allt som inte är dagens steg samlas här.
 *
 * Sidan finns för att appen inte ska behöva gömma något — men den ligger ett
 * steg bort, så att startsidan kan hålla sig till en enda uppmaning.
 */
export function MorePage() {
  const store = useStore()
  const { data } = useAsync(
    () =>
      store.singleton<ProgramProgress>('programProgress', () => emptyProgress(FIRST_SESSION_SLUG)),
    [store],
  )

  const unlocked = data ? unlockedToolIds(data.data).size : 0

  const items = [
    {
      to: '/verktyg',
      Icon: ToolsIcon,
      title: 'Verktygslådan',
      body:
        unlocked > 0
          ? `${unlocked} verktyg är öppna för dig just nu. Fler kommer allteftersom programmet introducerar dem.`
          : 'Övningarna från behandlingen, att gå tillbaka till när du behöver dem.',
      tone: 'primary' as const,
    },
    {
      to: '/insikter',
      Icon: InsightsIcon,
      title: 'Din utveckling',
      body: 'Humör, skattningar och mönster över tid. Det minnet är dåligt på.',
      tone: 'calm' as const,
    },
    {
      to: '/skattning',
      Icon: SparkIcon,
      title: 'Skattningar',
      body: 'PHQ-9, GAD-7 och WHO-5. Gör om dem var fjärde vecka.',
      tone: 'calm' as const,
    },
    {
      to: '/verktyg/sakerhetsplan',
      Icon: HeartIcon,
      title: 'Säkerhetsplan',
      body: 'Förberedd i lugnt läge, för de stunder då det inte är lugnt.',
      tone: 'rose' as const,
    },
    {
      to: '/om',
      Icon: NotebookIcon,
      title: 'Om appen och KBT',
      body: 'Hur behandlingen är uppbyggd, var innehållet kommer ifrån, och hur din data hanteras.',
      tone: 'accent' as const,
    },
    {
      to: '/installningar',
      Icon: SettingsIcon,
      title: 'Inställningar',
      body: 'Utseende, lås och säkerhetskopiering.',
      tone: 'primary' as const,
    },
  ]

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">Mer</h1>
        <Muted className="mt-2">
          Behandlingen leder dig framåt av sig själv. Här finns resten, när du vill åt den.
        </Muted>
      </header>

      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="group flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl"
                style={{
                  background: `var(--c-${item.tone}-soft)`,
                  color: item.tone === 'primary' ? 'var(--c-primary)' : `var(--c-${item.tone}-ink)`,
                }}
              >
                <item.Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{item.title}</span>
                <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                  {item.body}
                </span>
              </span>
              <ArrowRightIcon className="mt-3 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
