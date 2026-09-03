import { useState, type FormEvent } from 'react'
import { Backdrop } from '../../components/Backdrop'
import { Button } from '../../components/Button'
import { LockIcon } from '../../components/Icons'
import { WrongPassphraseError, useVault } from '../../app/VaultProvider'

/**
 * Låsskärmen. Enda vägen in när appen är låst — och den kan inte kringgås,
 * eftersom nyckeln till datan bokstavligen härleds ur det som skrivs här.
 */
export function LockScreen() {
  const { unlock, hint } = useVault()
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!passphrase || busy) return

    setBusy(true)
    setError(null)
    try {
      await unlock(passphrase)
    } catch (caught) {
      setError(
        caught instanceof WrongPassphraseError
          ? 'Det stämde inte. Försök igen.'
          : 'Något gick fel när appen skulle låsas upp.',
      )
      setPassphrase('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-[100dvh] place-items-center px-5 py-12">
      <Backdrop tone="cool" />

      <div className="w-full max-w-[24rem] text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <LockIcon className="size-7" />
        </span>

        <h1 className="mt-6 text-[1.75rem] text-ink">Välkommen tillbaka</h1>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Skriv din lösenfras för att låsa upp. Den finns bara hos dig.
        </p>

        <form onSubmit={submit} className="mt-8 text-left">
          <label htmlFor="passphrase" className="sr-only">
            Lösenfras
          </label>
          <input
            id="passphrase"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'lock-error' : hint ? 'lock-hint' : undefined}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-center text-lg tracking-wider text-ink transition-colors focus:border-primary"
            placeholder="••••••••"
          />

          <div aria-live="polite" className="min-h-[1.5rem] pt-2 text-center">
            {error ? (
              <p id="lock-error" className="text-sm font-medium text-crisis-ink">
                {error}
              </p>
            ) : hint ? (
              <p id="lock-hint" className="text-sm text-ink-faint">
                Din ledtråd: {hint}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            className="mt-3"
            disabled={!passphrase || busy}
          >
            {busy ? 'Låser upp…' : 'Lås upp'}
          </Button>
        </form>

        <p className="mt-8 text-sm leading-relaxed text-ink-faint">
          Har du glömt lösenfrasen går datan inte att få tillbaka – inte av oss heller. Det är
          priset för att ingen annan kan läsa den.
        </p>
      </div>
    </div>
  )
}
