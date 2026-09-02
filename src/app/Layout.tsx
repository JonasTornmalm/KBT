import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { HeartIcon, HomeIcon, ProgramIcon, SettingsIcon } from '../components/Icons'
import { CrisisSheet } from '../features/crisis/CrisisSheet'
import { cn } from '../lib/cn'

/**
 * Tre val, inte fem.
 *
 * "Idag" svarar på vad som ska göras nu, "Behandling" visar var i förloppet man
 * är, och allt övrigt — verktyg, insikter, inställningar — ligger samlat under
 * "Mer". Poängen är att den som öppnar appen inte ska behöva välja väg.
 */
const NAV = [
  { to: '/', label: 'Idag', Icon: HomeIcon, end: true },
  { to: '/program', label: 'Behandling', Icon: ProgramIcon, end: false },
  { to: '/mer', label: 'Mer', Icon: SettingsIcon, end: false },
]

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary-soft">
        <span className="size-3.5 rounded-full bg-primary" />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">KBT</span>
    </span>
  )
}

function CrisisButton({ onClick, compact }: { onClick: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-crisis/25 bg-crisis-soft px-4 font-semibold text-crisis-ink transition-colors hover:border-crisis/40',
        compact && 'px-3',
      )}
    >
      <HeartIcon className="size-[1.15rem]" />
      <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>Stöd nu</span>
    </button>
  )
}

/**
 * Appens ram. Sidomeny på stora skärmar, flikrad längst ner på små —
 * och samma stödknapp på båda, alltid inom räckhåll.
 */
export function Layout() {
  const [crisisOpen, setCrisisOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-[100dvh] lg:flex">
      <a href="#innehall" className="skip-link">
        Hoppa till innehållet
      </a>

      {/* Sidomeny, stora skärmar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-line px-5 py-7 lg:flex">
        <Wordmark />
        <nav aria-label="Huvudmeny" className="mt-9 flex-1">
          <ul className="grid gap-1">
            {NAV.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[2.875rem] items-center gap-3 rounded-xl px-3 font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-primary-soft text-primary-ink'
                        : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
                    )
                  }
                >
                  <Icon className="size-[1.35rem]" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <CrisisButton onClick={() => setCrisisOpen(true)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topprad, små skärmar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line/70 bg-canvas/85 px-5 py-3 backdrop-blur-md lg:hidden">
          <Wordmark />
          <CrisisButton onClick={() => setCrisisOpen(true)} compact />
        </header>

        <main
          id="innehall"
          tabIndex={-1}
          key={location.pathname}
          className="relative flex-1 animate-[var(--animate-rise)] px-5 pb-28 pt-6 outline-none sm:px-8 lg:px-12 lg:pb-16 lg:pt-10"
        >
          <div className="mx-auto w-full max-w-[46rem]">
            <Outlet />
          </div>
        </main>

        {/* Flikrad, små skärmar */}
        <nav
          aria-label="Huvudmeny"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
          <ul className="flex">
            {NAV.map(({ to, label, Icon, end }) => (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-ink-faint hover:text-ink-soft',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('size-[1.4rem]', isActive && 'stroke-[2]')} />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <CrisisSheet open={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  )
}
