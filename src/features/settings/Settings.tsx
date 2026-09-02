import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme, type ThemePreference } from '../../app/ThemeProvider'
import { useVault } from '../../app/VaultProvider'
import { Button } from '../../components/Button'
import { Card, Muted } from '../../components/Card'
import { ChoiceList } from '../../components/ChoiceList'
import { TextInput } from '../../components/Field'
import { DownloadIcon, LockIcon, TrashIcon, UploadIcon } from '../../components/Icons'
import { WrongPassphraseError } from '../../lib/crypto'
import { backupFilename, createBackup } from '../../lib/export/backup'
import type { LockMode } from '../../lib/db/vault'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="mb-4">
      <h2 className="font-bold text-ink">{title}</h2>
      {description ? <Muted className="mt-1">{description}</Muted> : null}
      <div className="mt-5">{children}</div>
    </Card>
  )
}

export function Settings() {
  const { preference, setPreference } = useTheme()
  const vault = useVault()
  const fileInput = useRef<HTMLInputElement>(null)

  const [exportPassphrase, setExportPassphrase] = useState('')
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [changingLock, setChangingLock] = useState(false)
  const [nextMode, setNextMode] = useState<LockMode>(vault.mode ?? 'passphrase')
  const [newPassphrase, setNewPassphrase] = useState('')
  const [repeat, setRepeat] = useState('')
  const [hint, setHint] = useState('')

  const doExport = async () => {
    if (!vault.store || !vault.dek || exportPassphrase.length < 8) return
    setExporting(true)
    setError(null)
    try {
      const contents = await createBackup(vault.store, exportPassphrase, vault.dek)
      const blob = new Blob([contents], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = backupFilename()
      link.click()
      URL.revokeObjectURL(url)

      setExportPassphrase('')
      setMessage('Säkerhetskopian är sparad. Lägg den någonstans du hittar den igen.')
    } catch {
      setError('Säkerhetskopian kunde inte skapas.')
    } finally {
      setExporting(false)
    }
  }

  const doImport = async (file: File) => {
    const contents = await file.text()
    const entered = window.prompt('Lösenfrasen för den här säkerhetskopian:')
    if (entered === null) return

    setError(null)
    try {
      await vault.restore(contents, entered)
      setMessage('Säkerhetskopian är återställd. Appen använder nu den lösenfrasen.')
    } catch (caught) {
      setError(
        caught instanceof WrongPassphraseError
          ? 'Fel lösenfras för den filen.'
          : 'Filen gick inte att läsa som en säkerhetskopia.',
      )
    }
  }

  const applyLockChange = async () => {
    if (nextMode === 'passphrase' && (newPassphrase.length < 8 || newPassphrase !== repeat)) return
    setError(null)
    try {
      await vault.changeLock({
        mode: nextMode,
        passphrase: nextMode === 'passphrase' ? newPassphrase : undefined,
        hint: hint.trim() || undefined,
      })
      setNewPassphrase('')
      setRepeat('')
      setHint('')
      setChangingLock(false)
      setMessage(
        nextMode === 'passphrase'
          ? 'Låset är uppdaterat. Nästa gång appen öppnas krävs den nya lösenfrasen.'
          : 'Låset är avstängt. Appen öppnas nu direkt på den här enheten.',
      )
    } catch {
      setError('Låset kunde inte ändras.')
    }
  }

  const wipe = async () => {
    const confirmation = window.prompt(
      'Det här raderar allt du skrivit, för alltid. Skriv RADERA för att bekräfta.',
    )
    if (confirmation !== 'RADERA') return
    await vault.wipe()
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">Inställningar</h1>
      </header>

      <Section title="Utseende">
        <ChoiceList<ThemePreference>
          legend="Tema"
          choices={[
            { value: 'system', label: 'Följ systemet' },
            { value: 'light', label: 'Ljust' },
            { value: 'dark', label: 'Mörkt' },
          ]}
          value={preference}
          onChange={setPreference}
        />
      </Section>

      <Section
        title="Lås"
        description={
          vault.mode === 'passphrase'
            ? 'Appen är låst med en lösenfras och låser sig själv efter en kvarts stillhet.'
            : 'Appen öppnas direkt. Datan är krypterad, men nyckeln ligger i den här webbläsaren.'
        }
      >
        {changingLock ? (
          <div className="grid gap-5">
            <ChoiceList<LockMode>
              legend="Hur vill du ha det?"
              choices={[
                {
                  value: 'passphrase',
                  label: 'Lås med lösenfras',
                  description: 'Krävs varje gång appen öppnas.',
                },
                {
                  value: 'device',
                  label: 'Öppna direkt',
                  description: 'Ingen lösenfras. Skyddar mot ströinsyn, inte mot någon med din enhet.',
                },
              ]}
              value={nextMode}
              onChange={setNextMode}
            />

            {nextMode === 'passphrase' ? (
              <>
                <TextInput
                  label="Ny lösenfras"
                  type="password"
                  autoComplete="new-password"
                  value={newPassphrase}
                  onChange={(event) => setNewPassphrase(event.target.value)}
                />
                <TextInput
                  label="Skriv den en gång till"
                  type="password"
                  autoComplete="new-password"
                  value={repeat}
                  onChange={(event) => setRepeat(event.target.value)}
                />
                <TextInput
                  label="Ledtråd (frivillig)"
                  value={hint}
                  maxLength={60}
                  onChange={(event) => setHint(event.target.value)}
                />
                <Muted>
                  Dina anteckningar krypteras inte om — bara nyckeln packas om. Därför går bytet
                  ögonblickligt, hur mycket du än har skrivit.
                </Muted>
              </>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void applyLockChange()}
                disabled={
                  nextMode === 'passphrase' &&
                  (newPassphrase.length < 8 || newPassphrase !== repeat)
                }
              >
                Spara
              </Button>
              <Button variant="ghost" onClick={() => setChangingLock(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="soft" onClick={() => setChangingLock(true)}>
              <LockIcon className="size-[1.15rem]" />
              {vault.mode === 'passphrase' ? 'Byt lösenfras eller stäng av' : 'Sätt på lås'}
            </Button>
            {vault.mode === 'passphrase' ? (
              <Button variant="ghost" onClick={vault.lock}>
                Lås nu
              </Button>
            ) : null}
          </div>
        )}
      </Section>

      <Section
        title="Säkerhetskopia"
        description="Enda sättet att flytta datan till en annan enhet — och enda skyddet om den här webbläsarens data rensas."
      >
        <div className="grid gap-5">
          <TextInput
            label="Lösenfras för filen"
            hint="Minst åtta tecken. Den behövs för att kunna läsa filen igen, och den går inte att återställa."
            type="password"
            autoComplete="new-password"
            value={exportPassphrase}
            onChange={(event) => setExportPassphrase(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void doExport()}
              disabled={exportPassphrase.length < 8 || exporting}
            >
              <DownloadIcon className="size-[1.15rem]" />
              {exporting ? 'Skapar…' : 'Spara säkerhetskopia'}
            </Button>

            <input
              ref={fileInput}
              type="file"
              accept=".json,.kbt.json,application/json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void doImport(file)
                event.target.value = ''
              }}
            />
            <Button variant="outline" onClick={() => fileInput.current?.click()}>
              <UploadIcon className="size-[1.15rem]" />
              Återställ från fil
            </Button>
          </div>
          <Muted>
            Att återställa ersätter allt som finns i appen just nu.
          </Muted>
        </div>
      </Section>

      <div aria-live="polite" className="min-h-[1.75rem]">
        {message ? <p className="text-sm font-medium text-primary">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-crisis-ink">{error}</p> : null}
      </div>

      <Card className="mt-2 border border-crisis/20">
        <h2 className="font-bold text-ink">Radera allt</h2>
        <Muted className="mt-1">
          Tar bort varenda anteckning, skattning och plan från den här enheten. Det går inte att
          ångra, och vi kan inte hjälpa dig få tillbaka något.
        </Muted>
        <Button variant="ghost" className="mt-4 text-crisis-ink" onClick={() => void wipe()}>
          <TrashIcon className="size-[1.15rem]" />
          Radera all min data
        </Button>
      </Card>

      <p className="mt-8 text-center text-sm text-ink-faint">
        <Link to="/om" className="underline-offset-4 hover:underline">
          Om appen, källor och integritet
        </Link>
      </p>
    </div>
  )
}
