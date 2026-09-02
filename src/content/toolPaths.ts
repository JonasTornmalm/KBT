/**
 * Adresserna till verktygen, utan React-beroenden.
 *
 * Ligger separat från verktygsregistret så att domänlagret — som räknar ut
 * nästa steg — kan peka på ett verktyg utan att dra in ikoner och komponenter.
 */
export const TOOL_PATHS = {
  checkin: '/verktyg/incheckning',
  assessment: '/skattning',
  'thought-record': '/verktyg/tankedagbok',
  distortions: '/verktyg/tankefallor',
  experiment: '/verktyg/beteendeexperiment',
  activity: '/verktyg/aktivitet',
  exposure: '/verktyg/exponering',
  worry: '/verktyg/oro',
  'problem-solving': '/verktyg/problemlosning',
  breathing: '/verktyg/nedvarvning',
  sleep: '/verktyg/somn',
  values: '/verktyg/varderingar',
  'relapse-plan': '/verktyg/vidmakthallande',
  'safety-plan': '/verktyg/sakerhetsplan',
} as const

export type ToolId = keyof typeof TOOL_PATHS

/** Programmet hänvisar ibland till sidor som inte är verktyg. */
export function resolveToolPath(id: string): string | undefined {
  if (id === 'insights') return '/insikter'
  if (id === 'tools') return '/verktyg'
  return TOOL_PATHS[id as ToolId]
}
