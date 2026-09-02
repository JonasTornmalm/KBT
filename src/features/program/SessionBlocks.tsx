import type { Block } from '../../domain/program/types'
import { ProgramDiagram } from './ProgramDiagram'

/** Renderar sessionernas innehållsblock. Typografin är samlad här, inte i innehållet. */
export function SessionBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mt-6">
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`

        switch (block.kind) {
          case 'heading':
            return (
              <h3 key={key} className="mt-9 text-xl font-bold text-ink first:mt-0">
                {block.body}
              </h3>
            )

          case 'text':
            return (
              <p key={key} className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft">
                {block.body}
              </p>
            )

          case 'list':
            return block.ordered ? (
              <ol key={key} className="mt-5 grid gap-3">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-3.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold tabular-nums text-primary-ink">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-[1.0625rem] leading-[1.65] text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={key} className="mt-5 grid gap-3">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-3.5">
                    <span
                      aria-hidden
                      className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="text-[1.0625rem] leading-[1.65] text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            )

          case 'note':
            return (
              <aside
                key={key}
                className="mt-6 rounded-2xl border-l-[3px] border-primary bg-primary-soft/60 py-4 pl-5 pr-4"
              >
                <p className="text-[1.0625rem] leading-[1.65] text-primary-ink">{block.body}</p>
              </aside>
            )

          case 'example':
            return (
              <div key={key} className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-soft">
                <p className="border-b border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-ink-faint">
                  {block.title}
                </p>
                <dl className="divide-y divide-line">
                  {block.rows.map(([label, value], i) => (
                    <div key={i} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
                      <dt className="text-sm font-semibold text-ink-faint sm:pt-0.5">{label}</dt>
                      <dd className="leading-relaxed text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )

          case 'diagram':
            return <ProgramDiagram key={key} id={block.id} caption={block.caption} />

          default:
            return null
        }
      })}
    </div>
  )
}
