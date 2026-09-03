import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../app/VaultProvider'
import { Button, ButtonLink } from '../../../components/Button'
import { Card, Muted } from '../../../components/Card'
import { ArrowRightIcon, PlusIcon, TrashIcon } from '../../../components/Icons'
import { ErrorState, LoadingState } from '../../../components/PageState'
import { DISTORTIONS } from '../../../content/distortions'
import { EMOTIONS } from '../../../content/library'
import { formatRelativeDay } from '../../../lib/date'
import { useAsync } from '../../../lib/useAsync'
import { EmptyState, ToolPage } from '../ToolPage'
import { thoughtShift, type ThoughtRecordData } from './types'

const emotionLabel = (id: string) => EMOTIONS.find((e) => e.id === id)?.label ?? id
const distortionName = (id: string) => DISTORTIONS.find((d) => d.id === id)?.name ?? id

/** Före och efter, sida vid sida. Det är den här bilden som gör poängen. */
function ShiftBars({ record }: { record: ThoughtRecordData }) {
  const rows = [
    {
      label: 'Tilltro till tanken',
      before: record.beliefBefore,
      after: record.beliefAfter,
      color: 'var(--c-primary)',
    },
    {
      label: 'Känslans styrka',
      before: record.emotionBefore,
      after: record.emotionAfter,
      color: 'var(--c-rose)',
    },
  ]

  return (
    <div className="grid gap-5">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-ink">{row.label}</span>
            <span className="text-sm tabular-nums text-ink-soft">
              {row.before} % → <span className="font-bold text-ink">{row.after} %</span>
            </span>
          </div>
          <div className="grid gap-1.5">
            <div className="h-2.5 overflow-hidden rounded-full bg-canvas-soft">
              <div
                className="h-full rounded-full opacity-40"
                style={{ width: `${row.before}%`, background: row.color }}
              />
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-canvas-soft">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-[var(--ease-calm)]"
                style={{ width: `${row.after}%`, background: row.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ThoughtRecordDetail() {
  const { id = '' } = useParams()
  const store = useStore()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(
    () => store.get<ThoughtRecordData>(id),
    [store, id],
  )

  if (error) {
    return (
      <ToolPage toolId="thought-record">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }
  if (loading) {
    return (
      <ToolPage toolId="thought-record">
        <LoadingState />
      </ToolPage>
    )
  }
  if (!data) {
    return (
      <ToolPage toolId="thought-record">
        <EmptyState
          title="Anteckningen finns inte"
          body="Den kan ha tagits bort."
          action={<ButtonLink to="/verktyg/tankedagbok">Till tankedagboken</ButtonLink>}
        />
      </ToolPage>
    )
  }

  const record = data.data
  const shift = thoughtShift(record)

  const remove = async () => {
    if (!window.confirm('Ta bort den här anteckningen? Det går inte att ångra.')) return
    await store.remove(id)
    navigate('/verktyg/tankedagbok', { replace: true })
  }

  const sections: Array<[string, string | undefined]> = [
    ['Situation', record.situation],
    ['Automatisk tanke', record.thought],
    ['Beteende', record.behaviour],
    ['Talar för', record.evidenceFor],
    ['Talar emot', record.evidenceAgainst],
    ['Rimligare slutsats', record.alternative],
  ]

  return (
    <ToolPage
      toolId="thought-record"
      intro={
        <Muted className="mt-3">
          {formatRelativeDay(new Date(data.createdAt))} ·{' '}
          {record.emotions.map(emotionLabel).join(', ') || 'ingen känsla angiven'}
        </Muted>
      }
    >
      <Card>
        <h2 className="text-lg font-bold text-ink">
          {shift.helped ? 'Så här flyttade det sig' : 'Före och efter'}
        </h2>
        <Muted className="mt-1">
          {shift.belief >= 20
            ? `Tilltron till tanken sjönk ${shift.belief} procentenheter. Det är en tydlig förändring.`
            : shift.helped
              ? 'Det rörde sig något. Små steg räknas – de flesta tankar ger inte med sig på en gång.'
              : 'Ingen förändring den här gången. Det händer, särskilt när tanken har fog för sig. Då är den kanske ett problem att lösa i stället.'}
        </Muted>
        <div className="mt-6">
          <ShiftBars record={record} />
        </div>
      </Card>

      {record.distortions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {record.distortions.map((id) => (
            <Link
              key={id}
              to="/verktyg/tankefallor"
              className="rounded-full bg-calm-soft px-3.5 py-1.5 text-sm font-medium text-calm-ink transition-[filter] hover:brightness-95"
            >
              {distortionName(id)}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {sections.map(([label, value]) =>
          value?.trim() ? (
            <Card key={label}>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{value}</p>
            </Card>
          ) : null,
        )}

        {record.body.length > 0 ? (
          <Card>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Kroppen</p>
            <p className="mt-2 leading-relaxed text-ink">{record.body.join(', ')}</p>
          </Card>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/verktyg/tankedagbok" variant="soft">
          Alla anteckningar
        </ButtonLink>
        <Button variant="ghost" onClick={() => void remove()}>
          <TrashIcon className="size-[1.15rem]" />
          Ta bort
        </Button>
      </div>
    </ToolPage>
  )
}

export function ThoughtRecordPage() {
  const store = useStore()
  const { data, error, reload } = useAsync(
    () => store.byType<ThoughtRecordData>('thoughtRecord'),
    [store],
  )
  const entries = data ?? []

  const averageShift =
    entries.length > 0
      ? Math.round(
          entries.reduce((sum, entry) => sum + thoughtShift(entry.data).belief, 0) / entries.length,
        )
      : 0

  if (error) {
    return (
      <ToolPage toolId="thought-record">
        <ErrorState onRetry={reload} />
      </ToolPage>
    )
  }

  return (
    <ToolPage
      toolId="thought-record"
      action={
        <ButtonLink to="/verktyg/tankedagbok/ny">
          <PlusIcon className="size-5" />
          Ny anteckning
        </ButtonLink>
      }
    >
      {entries.length === 0 ? (
        <EmptyState
          title="Inga anteckningar än"
          body="Nästa gång humöret svänger tvärt: stanna upp och gå igenom stegen. Det tar ungefär tio minuter."
          action={<ButtonLink to="/verktyg/tankedagbok/ny">Börja</ButtonLink>}
        />
      ) : (
        <>
          {entries.length >= 3 ? (
            <Card tone="soft" className="mb-5">
              <p className="text-[0.9375rem] leading-relaxed text-primary-ink">
                Över {entries.length} anteckningar har din tilltro till de granskade tankarna
                sjunkit med i genomsnitt{' '}
                <strong className="font-bold">{averageShift} procentenheter</strong>.
                {averageShift >= 15
                  ? ' Det är precis vad övningen ska göra.'
                  : ' Fortsätt – effekten brukar växa med vanan.'}
              </p>
            </Card>
          ) : null}

          <ul className="grid gap-3">
            {entries.map((entry) => {
              const shift = thoughtShift(entry.data)
              return (
                <li key={entry.id}>
                  <Link
                    to={`/verktyg/tankedagbok/${entry.id}`}
                    className="group flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-xs text-ink-faint">
                          {formatRelativeDay(new Date(entry.createdAt))}
                        </span>
                        {entry.data.emotions.slice(0, 2).map((id) => (
                          <span key={id} className="text-xs font-medium text-rose-ink">
                            {emotionLabel(id)}
                          </span>
                        ))}
                      </span>
                      <span className="mt-1.5 block font-semibold leading-snug text-ink">
                        {entry.data.thought || entry.data.situation}
                      </span>
                      <span className="mt-2 block text-sm tabular-nums text-ink-soft">
                        Tilltro {entry.data.beliefBefore} % → {entry.data.beliefAfter} %
                        {shift.belief > 0 ? (
                          <span className="ml-2 font-semibold text-primary">
                            −{shift.belief}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <ArrowRightIcon className="mt-2 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </ToolPage>
  )
}
