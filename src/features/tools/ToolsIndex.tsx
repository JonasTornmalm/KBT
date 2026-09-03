import { Link } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Card, Muted } from '../../components/Card'
import { ArrowRightIcon, LockIcon } from '../../components/Icons'
import { ErrorState, LoadingState } from '../../components/PageState'
import { FIRST_SESSION_SLUG, sessionByWeek } from '../../content/program'
import { TOOLS, type ToolDef } from '../../content/tools'
import { toolIntroducedIn, unlockedToolIds } from '../../domain/nextStep'
import { emptyProgress, type ProgramProgress } from '../../domain/program/types'
import { cn } from '../../lib/cn'
import { useAsync } from '../../lib/useAsync'

function ToolRow({ tool, locked }: { tool: ToolDef; locked?: number | null }) {
  const inner = (
    <>
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl"
        style={
          locked
            ? { background: 'var(--c-surface-2)', color: 'var(--c-ink-faint)' }
            : {
                background: `var(--c-${tool.tone}-soft)`,
                color: tool.tone === 'primary' ? 'var(--c-primary)' : `var(--c-${tool.tone}-ink)`,
              }
        }
      >
        {locked ? <LockIcon className="size-5" /> : <tool.Icon className="size-5" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={cn('font-bold', locked ? 'text-ink-soft' : 'text-ink')}>
            {tool.name}
          </span>
          <span className="text-xs text-ink-faint">{tool.minutes}</span>
        </span>
        <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
          {locked ? `Introduceras i vecka ${locked}` : tool.tagline}
        </span>
      </span>

      {locked ? null : (
        <ArrowRightIcon className="mt-3 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
    </>
  )

  if (locked) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-dashed border-line px-5 py-4">
        {inner}
      </div>
    )
  }

  return (
    <Link
      to={tool.path}
      className="group flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:shadow-lift"
    >
      {inner}
    </Link>
  )
}

/**
 * Verktygslådan visar inte allt på en gång.
 *
 * Ett verktyg är öppet när programmet har hunnit förklara det. Resten står
 * kvar, nedtonade, med veckan de hör hemma i. Det gör listan begriplig i
 * stället för överväldigande, och det speglar hur en behandling faktiskt går
 * till: man får en färdighet i taget.
 */
export function ToolsIndex() {
  const store = useStore()
  const { data, error, reload } = useAsync(
    () =>
      store.singleton<ProgramProgress>('programProgress', () => emptyProgress(FIRST_SESSION_SLUG)),
    [store],
  )

  if (error) return <ErrorState onRetry={reload} />
  if (!data) return <LoadingState />

  const unlocked = unlockedToolIds(data.data)
  const open = TOOLS.filter((tool) => unlocked.has(tool.id))
  const upcoming = TOOLS.filter((tool) => !unlocked.has(tool.id))

  const nextTool = upcoming[0]
  const nextWeek = nextTool ? toolIntroducedIn(nextTool.id) : null
  const nextSessionTitle = nextWeek ? sessionByWeek(nextWeek)?.title : undefined

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">Dina verktyg</h1>
        <Muted className="mt-2 max-w-[36rem]">
          Verktygen öppnas allteftersom behandlingen introducerar dem. Du behöver inte välja bland
          dem – programmet säger till när ett verktyg är dags.
        </Muted>
      </header>

      <ul className="grid gap-3">
        {open.map((tool) => (
          <li key={tool.id}>
            <ToolRow tool={tool} />
          </li>
        ))}
      </ul>

      {upcoming.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-faint">
            Kommer längre fram
          </h2>
          <Muted className="mb-4">
            {nextSessionTitle
              ? `Näst på tur: ${nextTool?.name.toLowerCase()}, i vecka ${nextWeek} – ${nextSessionTitle.toLowerCase()}.`
              : 'De öppnas när du kommer till veckan de hör hemma i.'}
          </Muted>
          <ul className="grid gap-2">
            {upcoming.map((tool) => (
              <li key={tool.id}>
                <ToolRow tool={tool} locked={toolIntroducedIn(tool.id) ?? 8} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Card tone="muted" className="mt-8">
        <Muted>
          Vill du använda ett verktyg innan din vecka kommit? Gå till behandlingen och öppna
          sessionen – den är aldrig låst, bara ännu inte föreslagen.
        </Muted>
        <Link
          to="/program"
          className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Till behandlingen
        </Link>
      </Card>
    </div>
  )
}
