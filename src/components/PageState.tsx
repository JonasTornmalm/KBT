import { Button } from './Button'

/**
 * Vad en vy visar när den inte har något att visa än — eller inte kunde få tag
 * i det.
 *
 * Varje läsning ur valvet är en dekryptering, så det finns ett verkligt
 * ögonblick mellan att en sida öppnas och att den har innehåll. Att rendera
 * ingenting under tiden är frestande, men i en app där all data ligger på
 * enheten läses en tom sida som att datan är borta. Den skillnaden måste synas.
 */

/**
 * Laddningsplatshållare. Tonas in med fördröjning, så att en snabb läsning —
 * vilket är det normala — inte hinner blinka förbi.
 */
export function LoadingState({ label = 'Hämtar dina anteckningar' }: { label?: string }) {
  return (
    <div className="animate-[var(--animate-appear)]" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden className="grid gap-3">
        <div className="h-24 rounded-2xl bg-surface-2" />
        <div className="h-16 rounded-2xl bg-surface-2" />
        <div className="h-16 w-2/3 rounded-2xl bg-surface-2" />
      </div>
    </div>
  )
}

/**
 * Läsningen gick fel. Tonen är avsiktligt lugn och konkret: det vanligaste
 * skälet är en webbläsare som blockerar lagring, inte att något gått förlorat.
 */
export function ErrorState({
  title = 'Anteckningarna gick inte att läsa',
  body = 'Ingenting är borta – appen kunde bara inte öppna dem just nu. Det händer om webbläsaren blockerar lagring, till exempel i privat läge.',
  onRetry,
}: {
  title?: string
  body?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[30rem] leading-relaxed text-ink-soft">{body}</p>
      {onRetry ? (
        <Button variant="soft" className="mt-5" onClick={onRetry}>
          Försök igen
        </Button>
      ) : null}
    </div>
  )
}
