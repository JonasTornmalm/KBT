import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

/**
 * Kortets bakgrund sätts via `tone`, inte via className.
 *
 * Anledningen är att Tailwind avgör vilken klass som vinner utifrån ordningen
 * i den genererade CSS-filen, inte utifrån ordningen i class-attributet. Ett
 * `bg-primary` som skickas in utifrån kan därför tyst förlora mot kortets eget
 * `bg-surface` — vilket i värsta fall ger vit text på vit botten.
 */
export type CardTone = 'surface' | 'muted' | 'soft' | 'primary' | 'accent' | 'crisis'

const TONES: Record<CardTone, string> = {
  surface: 'bg-surface shadow-soft',
  muted: 'bg-surface-2',
  soft: 'bg-primary-soft',
  primary: 'bg-primary text-on-primary shadow-lift',
  accent: 'border border-accent/25 bg-accent-soft',
  crisis: 'border border-crisis/25 bg-crisis-soft',
}

export function Card({
  children,
  className,
  tone = 'surface',
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  tone?: CardTone
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return (
    <Tag className={cn('rounded-2xl p-5 sm:p-6', TONES[tone], className)}>{children}</Tag>
  )
}

/** Ett kort som är en länk. Hela ytan är klickbar, med en mjuk lyftning. */
export function CardLink({
  to,
  children,
  className,
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group block rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:shadow-lift sm:p-6',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-lg font-bold text-ink">{children}</h2>
      {action}
    </div>
  )
}

export function Muted({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[0.9375rem] leading-relaxed text-ink-soft', className)}>{children}</p>
}
