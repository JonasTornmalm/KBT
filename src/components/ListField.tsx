import { useState, type KeyboardEvent } from 'react'
import { PlusIcon, TrashIcon } from './Icons'
import { cn } from '../lib/cn'

/**
 * Redigerbar lista med korta rader. Används av säkerhetsplanen, oroslistan,
 * ångesttrappan, problemlösningen och målen — överallt där användaren bygger
 * upp något punkt för punkt.
 */
export function ListField({
  label,
  hint,
  items,
  onChange,
  placeholder = 'Skriv och tryck enter',
  suggestions = [],
  max = 30,
}: {
  label: string
  hint?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  /** Förslag att fylla på med, för när det är svårt att komma på något själv. */
  suggestions?: string[]
  max?: number
}) {
  const [draft, setDraft] = useState('')

  const add = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || items.includes(trimmed) || items.length >= max) return
    onChange([...items, trimmed])
    setDraft('')
  }

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved!)
    onChange(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      add(draft)
    }
  }

  const unused = suggestions.filter((suggestion) => !items.includes(suggestion))

  return (
    <div>
      <p className="font-semibold text-ink">{label}</p>
      {hint ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{hint}</p> : null}

      {items.length > 0 ? (
        <ul className="mt-4 grid gap-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface py-2 pl-4 pr-2"
            >
              <span className="min-w-0 flex-1 py-1 leading-relaxed text-ink">{item}</span>

              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Flytta upp: ${item}`}
                  className="grid size-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                    <path
                      d="M5 12.5 10 7.5l5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Flytta ner: ${item}`}
                  className="grid size-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                    <path
                      d="M5 7.5 10 12.5l5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Ta bort: ${item}`}
                  className="grid size-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-crisis-soft hover:text-crisis-ink"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {items.length < max ? (
        <div className={cn('flex gap-2', items.length > 0 ? 'mt-3' : 'mt-4')}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={label}
            className="min-h-[3rem] w-full rounded-xl border border-line bg-surface px-4 text-ink placeholder:text-ink-faint transition-colors focus:border-primary"
          />
          <button
            type="button"
            onClick={() => add(draft)}
            disabled={!draft.trim()}
            aria-label="Lägg till"
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-ink transition-[filter] hover:brightness-95 disabled:opacity-40"
          >
            <PlusIcon className="size-5" />
          </button>
        </div>
      ) : null}

      {unused.length > 0 && items.length < max ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {unused.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-primary hover:text-primary-ink"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
