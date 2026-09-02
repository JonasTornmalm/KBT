import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Så länge utgångsanimationen får ta. Måste matcha varaktigheten i klasserna nedan. */
const EXIT_MS = 200

/**
 * Modal panel: helskärm på mobil, centrerad dialog på större skärmar.
 * Fångar fokus, stänger på Escape och låser bakgrundens rullning.
 *
 * Animationen är handskriven i CSS i stället för hämtad från ett
 * animationsbibliotek. Skälet är krisvyn: den använder den här komponenten och
 * ligger därför i appens första paket. Ett bibliotek på fyrtio kilobyte för en
 * intoning är inget att lägga i den vägen.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  labelledBy = 'sheet-title',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  labelledBy?: string
}) {
  const panel = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)

  // Håll panelen monterad en kort stund efter stängning, så att den hinner tona ut.
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Nästa bildruta, så att övergången faktiskt får något att gå från.
      const frame = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return

    restoreFocus.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Fokus går till panelen, inte till första knappen: rubriken ska hinna läsas
    // innan något är valt.
    panel.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel.current) return

      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreFocus.current?.focus()
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-200 ease-[var(--ease-calm)]',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full max-w-[34rem] flex-col overflow-hidden rounded-t-3xl bg-canvas shadow-lift outline-none transition-[opacity,transform] duration-300 ease-[var(--ease-calm)] sm:rounded-3xl motion-reduce:transition-none',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 sm:translate-y-3',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <h2 id={labelledBy} className="text-xl font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
              <path
                d="m5.5 5.5 9 9m0-9-9 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-8 pt-2">{children}</div>
      </div>
    </div>
  )
}
