import { useRef, useState } from 'react'
import { Backdrop } from '../../components/Backdrop'
import { Button } from '../../components/Button'
import { ChoiceList } from '../../components/ChoiceList'
import { TextInput } from '../../components/Field'
import { HeartIcon, LockIcon, ShieldIcon, SparkIcon } from '../../components/Icons'
import { ProgressDots } from '../../components/ProgressDots'
import { useVault } from '../../app/VaultProvider'
import { WrongPassphraseError } from '../../lib/crypto'
import type { LockMode } from '../../lib/db/vault'

type StepId = 'welcome' | 'privacy' | 'lock' | 'passphrase' | 'terms'

const MIN_PASSPHRASE = 8

export function Onboarding() {
  const { setUp, restore } = useVault()
  const fileInput = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<StepId>('welcome')
  const [mode, setMode] = useState<LockMode>('passphrase')
  const [passphrase, setPassphrase] = useState('')
  const [repeat, setRepeat] = useState('')
  const [hint, setHint] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const order: StepId[] = mode === 'passphrase'
    ? ['welcome', 'privacy', 'lock', 'passphrase', 'terms']
    : ['welcome', 'privacy', 'lock', 'terms']
  const index = order.indexOf(step)

  const goTo = (next: StepId) => {
    setError(null)
    setStep(next)
  }
  const next = () => goTo(order[index + 1] ?? 'terms')
  const back = () => goTo(order[index - 1] ?? 'welcome')

  const passphraseOk =
    passphrase.length >= MIN_PASSPHRASE && passphrase === repeat

  const finish = async () => {
    setBusy(true)
    setError(null)
    try {
      await setUp(mode, mode === 'passphrase' ? passphrase : undefined, hint.trim() || undefined)
    } catch {
      setError('Något gick fel när ditt utrymme skulle skapas. Försök igen.')
      setBusy(false)
    }
  }

  const onRestoreFile = async (file: File) => {
    const contents = await file.text()
    const entered = window.prompt('Skriv lösenfrasen du valde när säkerhetskopian skapades:')
    if (entered === null) return

    setBusy(true)
    setError(null)
    try {
      await restore(contents, entered)
    } catch (caught) {
      setError(
        caught instanceof WrongPassphraseError
          ? 'Fel lösenfras för den här säkerhetskopian.'
          : 'Filen gick inte att läsa som en säkerhetskopia.',
      )
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] px-5 py-10 sm:px-8">
      <Backdrop />

      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-[32rem] flex-col">
        <div className="mb-10 flex items-center gap-4">
          {index > 0 ? (
            <button
              type="button"
              onClick={back}
              className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label="Tillbaka"
            >
              <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
                <path
                  d="M12.5 4 6.5 10l6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <span className="size-10" />
          )}
          <div className="flex-1">
            <ProgressDots total={order.length} index={Math.max(index, 0)} />
          </div>
        </div>

        <div className="flex-1">
          {/* Nyckeln startar om intoningen vid varje steg. Ingen
              utgångsanimation: nästa skärm ska aldrig behöva vänta in en. */}
          <div key={step} className="animate-[var(--animate-rise)]">
              {step === 'welcome' ? (
                <section>
                  <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <SparkIcon className="size-7" />
                  </span>
                  <h1 className="mt-6 text-[2rem] leading-[1.15] text-ink">
                    Ett lugnt ställe att arbeta med dina tankar
                  </h1>
                  <p className="mt-4 leading-relaxed text-ink-soft">
                    Det här är kognitiv beteendeterapi i självhjälpsform: ett program på åtta
                    veckor och en verktygslåda du kan gå till när du behöver den. Samma metoder
                    som används i vården, i din egen takt.
                  </p>
                  <p className="mt-3 leading-relaxed text-ink-soft">
                    Det kostar ingenting, kräver inget konto, och ingen data lämnar din enhet.
                  </p>
                </section>
              ) : null}

              {step === 'privacy' ? (
                <section>
                  <span className="grid size-14 place-items-center rounded-2xl bg-calm-soft text-calm">
                    <ShieldIcon className="size-7" />
                  </span>
                  <h1 className="mt-6 text-[2rem] leading-[1.15] text-ink">
                    Allt du skriver stannar här
                  </h1>
                  <div className="mt-5 grid gap-3">
                    {[
                      {
                        title: 'Ingen server',
                        body: 'Appen har ingen backend. Det finns ingen databas någon annanstans där dina anteckningar kan finnas.',
                      },
                      {
                        title: 'Krypterat på din enhet',
                        body: 'Allt sparas krypterat i din webbläsare. Även den som får tag i själva databasfilen ser bara oläsbar text.',
                      },
                      {
                        title: 'Ingen mätning, inga kakor',
                        body: 'Ingen analys, inga spårare, inga externa anrop. Appen fungerar lika bra i flygplansläge.',
                      },
                      {
                        title: 'Du äger kopian',
                        body: 'Säkerhetskopian är en fil du sparar själv. Den är också enda sättet att flytta datan till en annan enhet.',
                      },
                    ].map((item) => (
                      <div key={item.title} className="rounded-2xl bg-surface p-4 shadow-soft">
                        <p className="font-semibold text-ink">{item.title}</p>
                        <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {step === 'lock' ? (
                <section>
                  <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <LockIcon className="size-7" />
                  </span>
                  <h1 className="mt-6 text-[2rem] leading-[1.15] text-ink">
                    Vill du låsa appen?
                  </h1>
                  <p className="mt-4 leading-relaxed text-ink-soft">
                    Delar du enhet med någon är ett lås värt besväret. Är enheten bara din kan du
                    hoppa över det.
                  </p>
                  <div className="mt-6">
                    <ChoiceList<LockMode>
                      legend="Låsning"
                      choices={[
                        {
                          value: 'passphrase',
                          label: 'Ja, lås med en lösenfras',
                          description:
                            'Krävs varje gång du öppnar appen. Ger ett riktigt skydd, eftersom nyckeln byggs av din lösenfras.',
                        },
                        {
                          value: 'device',
                          label: 'Nej, öppna direkt',
                          description:
                            'Datan är fortfarande krypterad, men nyckeln ligger i den här webbläsaren. Skyddar mot nyfikna blickar, inte mot någon med din upplåsta enhet.',
                        },
                      ]}
                      value={mode}
                      onChange={setMode}
                    />
                  </div>
                </section>
              ) : null}

              {step === 'passphrase' ? (
                <section>
                  <h1 className="text-[2rem] leading-[1.15] text-ink">Välj din lösenfras</h1>
                  <p className="mt-4 leading-relaxed text-ink-soft">
                    Några ord du minns men ingen annan gissar. Minst {MIN_PASSPHRASE} tecken.
                  </p>

                  <div className="mt-6 grid gap-4">
                    <TextInput
                      label="Lösenfras"
                      type="password"
                      autoComplete="new-password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                    />
                    <TextInput
                      label="Skriv den en gång till"
                      type="password"
                      autoComplete="new-password"
                      value={repeat}
                      onChange={(e) => setRepeat(e.target.value)}
                    />
                    <TextInput
                      label="Ledtråd (frivillig)"
                      hint="Visas på låsskärmen. Skriv något som påminner dig – inte själva frasen."
                      value={hint}
                      maxLength={60}
                      onChange={(e) => setHint(e.target.value)}
                    />
                  </div>

                  <div aria-live="polite" className="min-h-[1.5rem] pt-2">
                    {passphrase && passphrase.length < MIN_PASSPHRASE ? (
                      <p className="text-sm text-ink-faint">
                        {MIN_PASSPHRASE - passphrase.length} tecken kvar.
                      </p>
                    ) : repeat && passphrase !== repeat ? (
                      <p className="text-sm font-medium text-crisis-ink">
                        De två fälten är inte lika.
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl border border-accent/30 bg-accent-soft p-4">
                    <p className="text-[0.9375rem] leading-relaxed text-accent-ink">
                      Glömmer du lösenfrasen finns ingen återställning. Det är inte en policy vi
                      kan göra undantag från – nyckeln existerar helt enkelt inte någon annanstans.
                    </p>
                  </div>
                </section>
              ) : null}

              {step === 'terms' ? (
                <section>
                  <span className="grid size-14 place-items-center rounded-2xl bg-crisis-soft text-crisis">
                    <HeartIcon className="size-7" />
                  </span>
                  <h1 className="mt-6 text-[2rem] leading-[1.15] text-ink">
                    En sak innan vi börjar
                  </h1>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-surface p-4 shadow-soft">
                      <p className="leading-relaxed text-ink-soft">
                        Det här är ett självhjälpsverktyg, inte vård och inte en medicinteknisk
                        produkt. Metoderna är beprövade, men appen kan inte bedöma din situation
                        och ersätter inte en behandlare.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-surface p-4 shadow-soft">
                      <p className="leading-relaxed text-ink-soft">
                        Mår du mycket dåligt, eller tänker på att skada dig själv: ring{' '}
                        <a href="tel:1177" className="font-semibold text-primary underline underline-offset-4">
                          1177
                        </a>{' '}
                        eller Självmordslinjen{' '}
                        <a href="tel:90101" className="font-semibold text-primary underline underline-offset-4">
                          90101
                        </a>
                        . Vid akut fara, ring 112. Knappen &rdquo;Stöd nu&rdquo; finns på varje sida i
                        appen.
                      </p>
                    </div>
                  </div>

                  <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-1 size-5 shrink-0 accent-[var(--c-primary)]"
                    />
                    <span className="text-[0.9375rem] leading-relaxed text-ink-soft">
                      Jag har läst det här och förstår att appen är ett stöd, inte en behandling.
                    </span>
                  </label>
                </section>
              ) : null}
          </div>
        </div>

        <div aria-live="polite" className="min-h-[1.5rem] pt-4">
          {error ? <p className="text-sm font-medium text-crisis-ink">{error}</p> : null}
        </div>

        <div className="mt-2 grid gap-3">
          {step === 'terms' ? (
            <Button size="lg" fullWidth disabled={!accepted || busy} onClick={() => void finish()}>
              {busy ? 'Skapar…' : 'Skapa mitt utrymme'}
            </Button>
          ) : (
            <Button
              size="lg"
              fullWidth
              disabled={step === 'passphrase' && !passphraseOk}
              onClick={next}
            >
              Fortsätt
            </Button>
          )}

          {step === 'welcome' ? (
            <>
              <input
                ref={fileInput}
                type="file"
                accept=".json,.kbt.json,application/json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void onRestoreFile(file)
                  e.target.value = ''
                }}
              />
              <Button
                variant="ghost"
                fullWidth
                disabled={busy}
                onClick={() => fileInput.current?.click()}
              >
                Jag har en säkerhetskopia
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
