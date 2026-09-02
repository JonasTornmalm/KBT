/** Visas den bråkdel av en sekund det tar att läsa valvet ur IndexedDB. */
export function Splash() {
  return (
    <div className="grid min-h-[100dvh] place-items-center">
      <span className="sr-only">Laddar</span>
      <span className="size-14 rounded-2xl bg-primary-soft animate-[var(--animate-breathe)]" />
    </div>
  )
}
