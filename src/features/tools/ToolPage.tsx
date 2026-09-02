import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Muted } from '../../components/Card'
import { toolById } from '../../content/tools'

/** Gemensamt skal för verktygssidorna: tillbakalänk, rubrik och beskrivning. */
export function ToolPage({
  toolId,
  action,
  children,
  intro,
}: {
  toolId: string
  action?: ReactNode
  children: ReactNode
  /** Ersätter verktygets standardbeskrivning när sidan behöver en egen ingress. */
  intro?: ReactNode
}) {
  const tool = toolById(toolId)

  return (
    <div>
      <Link
        to="/verktyg"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
          <path
            d="M12.5 4 6.5 10l6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Verktygslådan
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {tool ? (
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl"
                style={{
                  background: `var(--c-${tool.tone}-soft)`,
                  color: tool.tone === 'primary' ? 'var(--c-primary)' : `var(--c-${tool.tone}-ink)`,
                }}
              >
                <tool.Icon className="size-5" />
              </span>
            ) : null}
            <h1 className="text-[1.75rem] leading-tight text-ink sm:text-[2rem]">
              {tool?.name ?? 'Verktyg'}
            </h1>
          </div>
          {intro ?? <Muted className="mt-3 max-w-[38rem]">{tool?.description}</Muted>}
        </div>
        {action}
      </header>

      <div className="mt-8">{children}</div>
    </div>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
      <p className="font-bold text-ink">{title}</p>
      <Muted className="mx-auto mt-2 max-w-[26rem]">{body}</Muted>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
