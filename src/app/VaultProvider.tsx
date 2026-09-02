import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { WrongPassphraseError } from '../lib/crypto'
import type { SecureStore } from '../lib/db/store'
import {
  createVault,
  destroyEverything,
  getVault,
  hasVault,
  rewrapVault,
  unlockWithDevice,
  unlockWithPassphrase,
  type LockMode,
} from '../lib/db/vault'
import { restoreBackup } from '../lib/export/backup'

export type VaultStatus = 'loading' | 'empty' | 'locked' | 'unlocked'

interface VaultState {
  status: VaultStatus
  store: SecureStore | null
  dek: CryptoKey | null
  mode: LockMode | null
  hint: string | null
}

interface VaultApi extends VaultState {
  setUp: (mode: LockMode, passphrase?: string, hint?: string) => Promise<void>
  unlock: (passphrase: string) => Promise<void>
  lock: () => void
  changeLock: (next: { mode: LockMode; passphrase?: string; hint?: string }) => Promise<void>
  restore: (contents: string, passphrase: string) => Promise<void>
  wipe: () => Promise<void>
}

const VaultContext = createContext<VaultApi | null>(null)

/** Låser appen efter en stunds stillhet. Bara i lösenfrasläge — annars vore det teater. */
const AUTO_LOCK_MS = 15 * 60 * 1000

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VaultState>({
    status: 'loading',
    store: null,
    dek: null,
    mode: null,
    hint: null,
  })
  const timer = useRef<number | undefined>(undefined)

  // Vid start: finns ett valv? Öppnar det sig självt, eller ska vi fråga?
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        if (!(await hasVault())) {
          if (!cancelled) setState((s) => ({ ...s, status: 'empty' }))
          return
        }
        const config = await getVault()
        if (config?.mode === 'device') {
          const { store, dek } = await unlockWithDevice()
          if (!cancelled) {
            setState({ status: 'unlocked', store, dek, mode: 'device', hint: null })
          }
          return
        }
        if (!cancelled) {
          setState({
            status: 'locked',
            store: null,
            dek: null,
            mode: 'passphrase',
            hint: config?.hint ?? null,
          })
        }
      } catch {
        // Enhetsnyckeln kan ha försvunnit (rensad webbläsardata). Fråga hellre
        // än att låtsas att allt är bra.
        if (!cancelled) setState((s) => ({ ...s, status: 'locked' }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const lock = useCallback(() => {
    setState((s) =>
      s.mode === 'passphrase' ? { ...s, status: 'locked', store: null, dek: null } : s,
    )
  }, [])

  // Automatiskt lås efter inaktivitet.
  useEffect(() => {
    if (state.status !== 'unlocked' || state.mode !== 'passphrase') return

    const reset = () => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(lock, AUTO_LOCK_MS)
    }
    const events = ['pointerdown', 'keydown', 'visibilitychange'] as const
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }))
    reset()

    return () => {
      window.clearTimeout(timer.current)
      events.forEach((event) => window.removeEventListener(event, reset))
    }
  }, [state.status, state.mode, lock])

  const api = useMemo<VaultApi>(
    () => ({
      ...state,
      setUp: async (mode, passphrase, hint) => {
        const { store, dek } = await createVault(mode, passphrase, hint)
        setState({ status: 'unlocked', store, dek, mode, hint: hint ?? null })
      },
      unlock: async (passphrase) => {
        const { store, dek } = await unlockWithPassphrase(passphrase)
        setState({ status: 'unlocked', store, dek, mode: 'passphrase', hint: state.hint })
      },
      lock,
      changeLock: async (next) => {
        if (!state.dek) throw new Error('Appen är låst')
        await rewrapVault(state.dek, next)
        setState((s) => ({ ...s, mode: next.mode, hint: next.hint ?? null }))
      },
      restore: async (contents, passphrase) => {
        const { store, dek } = await restoreBackup(contents, passphrase)
        setState({ status: 'unlocked', store, dek, mode: 'passphrase', hint: null })
      },
      wipe: async () => {
        await destroyEverything()
        setState({ status: 'empty', store: null, dek: null, mode: null, hint: null })
      },
    }),
    [state, lock],
  )

  return <VaultContext.Provider value={api}>{children}</VaultContext.Provider>
}

export function useVault(): VaultApi {
  const context = useContext(VaultContext)
  if (!context) throw new Error('useVault måste användas inuti VaultProvider')
  return context
}

/**
 * För vyer som bara renderas i upplåst läge. Sparar varenda sida från att
 * behöva kontrollera om store finns.
 */
export function useStore(): SecureStore {
  const { store } = useVault()
  if (!store) throw new Error('Appen är låst')
  return store
}

export { WrongPassphraseError }
