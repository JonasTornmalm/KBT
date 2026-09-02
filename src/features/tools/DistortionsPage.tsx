import { useState } from 'react'
import { Card, Muted } from '../../components/Card'
import { DISTORTIONS } from '../../content/distortions'
import { cn } from '../../lib/cn'
import { ToolPage } from './ToolPage'

export function DistortionsPage() {
  const [open, setOpen] = useState<string | null>(DISTORTIONS[0]?.id ?? null)

  return (
    <ToolPage toolId="distortions">
      <ul className="grid gap-2">
        {DISTORTIONS.map((distortion) => {
          const expanded = open === distortion.id
          const panelId = `distortion-${distortion.id}`

          return (
            <li key={distortion.id}>
              <Card className={cn('!p-0 overflow-hidden', expanded && 'shadow-lift')}>
                <h2>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : distortion.id)}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">{distortion.name}</span>
                      <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                        {distortion.short}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        'mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-soft transition-transform duration-300 ease-[var(--ease-calm)]',
                        expanded && 'rotate-180',
                      )}
                    >
                      <svg viewBox="0 0 20 20" className="size-4">
                        <path
                          d="M5 8l5 5 5-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </h2>

                <div id={panelId} hidden={!expanded} className="border-t border-line px-5 pb-5 pt-4">
                  <p className="leading-relaxed text-ink-soft">{distortion.description}</p>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-faint">
                    Låter ofta så här
                  </p>
                  <ul className="mt-2 grid gap-2">
                    {distortion.examples.map((example) => (
                      <li
                        key={example}
                        className="rounded-xl bg-surface-2 px-4 py-2.5 text-[0.9375rem] italic leading-relaxed text-ink"
                      >
                        &rdquo;{example}&rdquo;
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 rounded-xl border-l-[3px] border-primary bg-primary-soft/60 py-3 pl-4 pr-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-ink/70">
                      Fråga dig
                    </p>
                    <p className="mt-1 leading-relaxed text-primary-ink">{distortion.counter}</p>
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      <Card tone="muted" className="mt-6">
        <Muted>
          Att hitta en tankefälla betyder inte att tanken är fel. Den betyder att den är värd att
          granska innan du låter den bestämma vad du gör.
        </Muted>
      </Card>
    </ToolPage>
  )
}
