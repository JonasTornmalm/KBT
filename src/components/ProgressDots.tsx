import { cn } from '../lib/cn'

/** Visar var i ett flöde man är. Aldrig fler än tolv prickar — då blir det en stapel. */
export function ProgressDots({ total, index }: { total: number; index: number }) {
  if (total > 12) {
    return (
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-soft">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-[var(--ease-calm)]"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-calm)]',
            i === index ? 'w-6 bg-primary' : i < index ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-line',
          )}
        />
      ))}
    </div>
  )
}
