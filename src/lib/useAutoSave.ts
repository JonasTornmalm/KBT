import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../app/VaultProvider'
import type { SingletonType } from './db/types'

export type SaveStatus = 'idle' | 'saving' | 'saved'

/**
 * Läser en singleton-post och sparar ändringar automatiskt en kort stund efter
 * att användaren slutat skriva. De långa planerna — säkerhetsplanen,
 * vidmakthållandeplanen, värderingarna — ska aldrig kunna gå förlorade för att
 * någon glömde trycka på en knapp.
 */
export function useAutoSaveSingleton<T>(type: SingletonType, fallback: () => T) {
  const store = useStore()
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timer = useRef<number | undefined>(undefined)
  const clearSaved = useRef<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    store
      .singleton<T>(type, fallback)
      .then((entry) => {
        if (!cancelled) setValue(entry.data)
      })
      .catch((caught: Error) => {
        if (!cancelled) setError(caught)
      })
    return () => {
      cancelled = true
    }
    // fallback är en fabrik som inte behöver vara stabil mellan renderingar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, type])

  useEffect(
    () => () => {
      window.clearTimeout(timer.current)
      window.clearTimeout(clearSaved.current)
    },
    [],
  )

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved =
          typeof next === 'function' ? (next as (c: T) => T)(current ?? fallback()) : next

        setStatus('saving')
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => {
          void store.saveSingleton(type, resolved).then(() => {
            setStatus('saved')
            window.clearTimeout(clearSaved.current)
            clearSaved.current = window.setTimeout(() => setStatus('idle'), 2400)
          })
        }, 600)

        return resolved
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, type],
  )

  return { value, update, status, error, loading: value === null && error === null }
}

export function saveStatusLabel(status: SaveStatus): string {
  if (status === 'saving') return 'Sparar…'
  if (status === 'saved') return 'Sparat'
  return ''
}
