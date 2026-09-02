import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../app/VaultProvider'
import { Button } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { ArrowRightIcon, CheckIcon } from '../../components/Icons'
import { FIRST_SESSION_SLUG, SESSIONS, sessionBySlug } from '../../content/program'
import { resolveToolPath } from '../../content/toolPaths'
import {
  homeworkKey,
  isCompleted,
  markComplete,
  markIncomplete,
  toggleHomework,
} from '../../domain/program/progress'
import { emptyProgress, type ProgramProgress } from '../../domain/program/types'
import { cn } from '../../lib/cn'
import { useAsync } from '../../lib/useAsync'
import { SessionBlocks } from './SessionBlocks'

export function SessionView() {
  const { slug = '' } = useParams()
  const store = useStore()
  const navigate = useNavigate()
  const session = sessionBySlug(slug)

  const { data, reload } = useAsync(
    () =>
      store.singleton<ProgramProgress>('programProgress', () => emptyProgress(FIRST_SESSION_SLUG)),
    [store],
  )
  const progress = data?.data

  if (!session) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-ink">Sessionen finns inte</h1>
        <Muted className="mt-2">Kanske en gammal länk?</Muted>
        <Button className="mt-6" onClick={() => navigate('/program')}>
          Till programmet
        </Button>
      </div>
    )
  }

  const completed = progress ? isCompleted(session, progress) : false
  const nextWeek = SESSIONS[session.week] // sessions[week] är nästa, eftersom veckor börjar på 1

  const save = async (updated: ProgramProgress) => {
    await store.saveSingleton('programProgress', updated)
    reload()
  }

  const onToggleHomework = async (index: number) => {
    if (!progress) return
    await save(toggleHomework(progress, homeworkKey(session.slug, index)))
  }

  const onFinishSession = async () => {
    if (!progress) return
    await save(completed ? markIncomplete(progress, session.slug) : markComplete(progress, session.slug))
    if (!completed) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <article>
      <Link
        to="/program"
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
        Programmet
      </Link>

      <header className="mt-5">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Vecka {session.week} · {session.minutes} min
        </p>
        <h1 className="mt-2 text-[2rem] leading-[1.15] text-ink sm:text-[2.5rem]">
          {session.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{session.subtitle}</p>
      </header>

      <p className="mt-8 border-l-[3px] border-line pl-5 text-[1.0625rem] leading-[1.7] text-ink">
        {session.intro}
      </p>

      <SessionBlocks blocks={session.learn} />

      <section className="mt-12">
        <h2 className="text-xl font-bold text-ink">Öva</h2>
        <Muted className="mt-1">Verktygen som hör till den här veckan.</Muted>
        <div className="mt-4 grid gap-3">
          {session.practice.map((item) => {
            const path = resolveToolPath(item.tool)
            if (!path) return null
            return (
              <Link
                key={item.tool}
                to={path}
                className="group flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink">{item.label}</span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                    {item.why}
                  </span>
                </span>
                <ArrowRightIcon className="mt-1 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-ink">Till veckan</h2>
        <Muted className="mt-1">
          Det är här förändringen sker. Bocka av allteftersom – det behöver inte bli perfekt.
        </Muted>
        <ul className="mt-4 grid gap-2">
          {session.homework.map((item, index) => {
            const key = homeworkKey(session.slug, index)
            const checked = progress?.homeworkDone.includes(key) ?? false
            const path = item.tool ? resolveToolPath(item.tool) : undefined

            return (
              <li key={key}>
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border p-4 transition-colors',
                    checked ? 'border-primary/30 bg-primary-soft' : 'border-line bg-surface',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => void onToggleHomework(index)}
                    aria-pressed={checked}
                    className={cn(
                      'mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-colors',
                      checked ? 'border-primary bg-primary' : 'border-line-strong hover:border-primary',
                    )}
                  >
                    <span className="sr-only">
                      {checked ? 'Markera som ogjord' : 'Markera som klar'}: {item.text}
                    </span>
                    {checked ? <CheckIcon className="size-4 text-on-primary" /> : null}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'leading-relaxed',
                        checked ? 'text-primary-ink line-through decoration-primary/40' : 'text-ink',
                      )}
                    >
                      {item.text}
                    </p>
                    {path ? (
                      <Link
                        to={path}
                        className="mt-1 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        Öppna verktyget
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <Card tone="muted" className="mt-12">
        <p className="text-[1.0625rem] leading-[1.7] text-ink-soft">{session.closing}</p>
      </Card>

      {/* Sessionen slutar aldrig med en fråga om vad man ska göra nu. */}
      {completed ? (
        <Card tone="primary" className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wide opacity-80">Nästa steg</p>
          <h2 className="mt-2 text-xl font-bold">
            {session.homework[0]?.text ?? `Vecka ${nextWeek?.week ?? session.week}`}
          </h2>
          <p className="mt-2 leading-relaxed opacity-90">
            {session.homework.length > 0
              ? 'Gör uppgiften under veckan som kommer. När den är avbockad föreslår appen nästa session – du behöver inte hålla reda på det själv.'
              : 'Appen tar dig vidare till nästa session.'}
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex min-h-[3rem] items-center gap-2 rounded-full bg-on-primary px-6 font-semibold text-primary"
          >
            Tillbaka till idag
            <ArrowRightIcon className="size-5" />
          </Link>
        </Card>
      ) : null}

      <div className="mt-8 grid gap-3">
        <Button
          size="lg"
          fullWidth
          variant={completed ? 'outline' : 'primary'}
          onClick={() => void onFinishSession()}
        >
          {completed ? 'Markera som ogjord' : `Jag är klar med vecka ${session.week}`}
        </Button>

        {completed && nextWeek ? (
          <Button
            size="lg"
            fullWidth
            variant="soft"
            onClick={() => navigate(`/program/${nextWeek.slug}`)}
          >
            Läs vidare till vecka {nextWeek.week}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
