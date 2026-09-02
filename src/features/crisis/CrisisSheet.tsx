import { Link } from 'react-router-dom'
import { Sheet } from '../../components/Sheet'
import { CRISIS_INTRO, CRISIS_RESOURCES, CRISIS_STEPS } from '../../content/crisis'
import { cn } from '../../lib/cn'

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
      <path
        d="M6.2 3.5 7.8 7l-1.6 1.4a10 10 0 0 0 5.4 5.4L13 12.2l3.5 1.6v3a1 1 0 0 1-1.1 1C8.9 17.4 2.6 11.1 2.1 4.6A1 1 0 0 1 3.1 3.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function Resource({ resource }: { resource: (typeof CRISIS_RESOURCES)[number] }) {
  return (
    <li
      className={cn(
        'rounded-2xl border p-4',
        resource.urgent ? 'border-crisis/30 bg-crisis-soft' : 'border-line bg-surface',
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className={cn('font-bold', resource.urgent ? 'text-crisis-ink' : 'text-ink')}>
          {resource.name}
        </h3>
        <span className="text-xs text-ink-faint">{resource.hours}</span>
      </div>
      <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">{resource.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {resource.phone ? (
          <a
            href={`tel:${resource.dial ?? resource.phone}`}
            className={cn(
              'inline-flex min-h-[2.75rem] items-center gap-2 rounded-full px-5 font-semibold transition-[filter] hover:brightness-110',
              resource.urgent
                ? 'bg-crisis text-on-crisis'
                : 'bg-primary-soft text-primary-ink hover:brightness-[0.97]',
            )}
          >
            <PhoneIcon />
            {resource.phone}
          </a>
        ) : null}
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-[0.9375rem] font-medium text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
          >
            {resource.urlLabel ?? 'Läs mer'}
          </a>
        ) : null}
      </div>
    </li>
  )
}

/**
 * Krisvyn. Nåbar från varje sida i appen, med ett klick.
 *
 * Tonen är avsiktligt lugn: inga varningstrianglar, inga röda utropstecken.
 * Den som öppnar den här vyn har redan tillräckligt med larm i kroppen.
 */
export function CrisisSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={CRISIS_INTRO.title} labelledBy="crisis-title">
      <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{CRISIS_INTRO.body}</p>

      <ul className="mt-5 grid gap-3">
        {CRISIS_RESOURCES.map((resource) => (
          <Resource key={resource.name} resource={resource} />
        ))}
      </ul>

      <h3 className="mt-8 font-bold text-ink">Medan du väntar på svar</h3>
      <ul className="mt-3 grid gap-3">
        {CRISIS_STEPS.map((step) => (
          <li key={step.title} className="rounded-2xl bg-surface-2 p-4">
            <p className="font-semibold text-ink">{step.title}</p>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-line p-4">
        <p className="text-[0.9375rem] leading-relaxed text-ink-soft">
          En säkerhetsplan gör det här enklare nästa gång: dina egna varningstecken, dina egna
          strategier och dina egna nummer – förberett i lugnt läge.
        </p>
        <Link
          to="/verktyg/sakerhetsplan"
          onClick={onClose}
          className="mt-3 inline-flex min-h-[2.75rem] items-center rounded-full bg-primary-soft px-5 font-semibold text-primary-ink transition-[filter] hover:brightness-[0.97]"
        >
          Gör min säkerhetsplan
        </Link>
      </div>
    </Sheet>
  )
}
