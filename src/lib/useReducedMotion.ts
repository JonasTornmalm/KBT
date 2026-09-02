import { useEffect, useState } from 'react'

/**
 * Säger om användaren bett systemet om mindre rörelse.
 *
 * Nästan all rörelse i appen stängs av med en CSS-regel i theme.css. Den här
 * hooken behövs bara där animationen inte är dekoration utan själva innehållet
 * — andningscirkeln, som visar takten man ska andas i.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return reduced
}
