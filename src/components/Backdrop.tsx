/**
 * Bakgrundsformerna. Tre mjuka färgfält som rör sig långsamt, ungefär i takt
 * med ett djupt andetag. De är rent dekorativa och stängs av helt när
 * användaren bett om mindre rörelse (via regeln i theme.css).
 */
export function Backdrop({ tone = 'calm' }: { tone?: 'calm' | 'warm' | 'cool' }) {
  const palettes = {
    calm: ['var(--c-primary-vivid)', 'var(--c-calm)', 'var(--c-accent)'],
    warm: ['var(--c-accent)', 'var(--c-rose)', 'var(--c-primary-vivid)'],
    cool: ['var(--c-calm)', 'var(--c-primary-vivid)', 'var(--c-calm)'],
  } as const

  const [a, b, c] = palettes[tone]

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-[15%] -top-[20%] size-[28rem] rounded-full opacity-[0.16] blur-3xl animate-[var(--animate-drift)] dark:opacity-[0.14]"
        style={{ background: a }}
      />
      <div
        className="absolute -right-[18%] top-[12%] size-[24rem] rounded-full opacity-[0.14] blur-3xl animate-[var(--animate-drift)] [animation-delay:-9s] dark:opacity-[0.12]"
        style={{ background: b }}
      />
      <div
        className="absolute -bottom-[15%] left-[20%] size-[26rem] rounded-full opacity-[0.12] blur-3xl animate-[var(--animate-drift)] [animation-delay:-17s] dark:opacity-[0.1]"
        style={{ background: c }}
      />
    </div>
  )
}
