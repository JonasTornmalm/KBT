import { useId, type ReactNode, type TextareaHTMLAttributes, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="mb-2">
      <label htmlFor={htmlFor} className="block font-semibold text-ink">
        {children}
      </label>
      {hint ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{hint}</p> : null}
    </div>
  )
}

// Ingen `outline-none` här. Kantfärgen är en trevlig markering men inte en
// fokusindikator — den globala ringen i theme.css ska få göra sitt jobb.
const CONTROL =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-ink-faint transition-colors duration-200 focus:border-primary'

export function TextArea({
  label,
  hint,
  className,
  rows = 4,
  ...rest
}: { label?: ReactNode; hint?: ReactNode } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <div>
      {label ? (
        <FieldLabel htmlFor={id} hint={hint}>
          {label}
        </FieldLabel>
      ) : null}
      <textarea id={id} rows={rows} className={cn(CONTROL, 'resize-y', className)} {...rest} />
    </div>
  )
}

export function TextInput({
  label,
  hint,
  className,
  ...rest
}: { label?: ReactNode; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div>
      {label ? (
        <FieldLabel htmlFor={id} hint={hint}>
          {label}
        </FieldLabel>
      ) : null}
      <input id={id} className={cn(CONTROL, className)} {...rest} />
    </div>
  )
}
