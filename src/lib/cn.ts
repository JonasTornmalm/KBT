/** Slår ihop klassnamn och släpper falsy-värden. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
