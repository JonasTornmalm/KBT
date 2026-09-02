import { Link } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Card, Muted } from '../../components/Card'
import { ArrowRightIcon, CheckIcon, LockIcon } from '../../components/Icons'
import { FIRST_SESSION_SLUG, SESSIONS } from '../../content/program'
import {
  completedCount,
  completionPercent,
  isCompleted,
  isUnlocked,
  nextSession,
} from '../../domain/program/progress'
import { emptyProgress, type ProgramProgress } from '../../domain/program/types'
import { cn } from '../../lib/cn'
import { useAsync } from '../../lib/useAsync'

export function ProgramOverview() {
  const store = useStore()
  const { data } = useAsync(
    () => store.singleton<ProgramProgress>('programProgress', () => emptyProgress(FIRST_SESSION_SLUG)),
    [store],
  )

  const progress = data?.data
  const done = progress ? completedCount(progress) : 0
  const next = progress ? nextSession(progress) : SESSIONS[0]!

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">
          Programmet på åtta veckor
        </h1>
        <Muted className="mt-2 max-w-[36rem]">
          Upplagt som en behandling: en session i veckan, med hemuppgifter mellan gångerna. Det är
          hemuppgifterna som gör jobbet – sessionerna förbereder dem.
        </Muted>
      </header>

      {progress ? (
        <Card tone="soft" className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-ink">
                {done === 0
                  ? 'Du har inte börjat än'
                  : done === SESSIONS.length
                    ? 'Hela programmet är genomgånget'
                    : `${done} av 8 sessioner klara`}
              </p>
              <p className="mt-1 text-xl font-bold text-primary-ink">
                {done === SESSIONS.length ? 'Fortsätt använda verktygen' : next.title}
              </p>
            </div>
            <Link
              to={`/program/${next.slug}`}
              className="inline-flex min-h-[3rem] items-center gap-2 rounded-full bg-primary px-6 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              {done === 0 ? 'Börja' : 'Fortsätt'}
              <ArrowRightIcon className="size-5" />
            </Link>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[var(--ease-calm)]"
              style={{ width: `${completionPercent(progress)}%` }}
            />
          </div>
        </Card>
      ) : null}

      <ol className="grid gap-3">
        {SESSIONS.map((session) => {
          const completed = progress ? isCompleted(session, progress) : false
          const unlocked = progress ? isUnlocked(session, progress) : session.week === 1
          const isNext = !completed && session.slug === next.slug

          return (
            <li key={session.slug}>
              <Link
                to={`/program/${session.slug}`}
                className={cn(
                  'group flex items-start gap-4 rounded-2xl p-5 transition-[transform,box-shadow] duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:shadow-lift',
                  isNext ? 'bg-surface shadow-soft ring-2 ring-primary/25' : 'bg-surface shadow-soft',
                  !unlocked && !completed && 'opacity-70',
                )}
              >
                <span
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums',
                    completed
                      ? 'bg-primary text-on-primary'
                      : unlocked
                        ? 'bg-primary-soft text-primary-ink'
                        : 'bg-surface-2 text-ink-faint',
                  )}
                >
                  {completed ? (
                    <CheckIcon className="size-5" />
                  ) : unlocked ? (
                    session.week
                  ) : (
                    <LockIcon className="size-4" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-bold text-ink">{session.title}</span>
                    <span className="text-xs text-ink-faint">{session.minutes} min</span>
                  </span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                    {session.subtitle}
                  </span>
                  {!unlocked && !completed ? (
                    <span className="mt-2 block text-xs text-ink-faint">
                      Låses upp när vecka {session.week - 1} är klar – men du får läsa ändå.
                    </span>
                  ) : null}
                </span>

                <ArrowRightIcon className="mt-3 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
