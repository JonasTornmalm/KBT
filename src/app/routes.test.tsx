import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { ThemeProvider } from './ThemeProvider'
import { VaultProvider } from './VaultProvider'
import { SESSIONS } from '../content/program'
import { TOOLS } from '../content/tools'
import { createVault, destroyEverything } from '../lib/db/vault'

/**
 * Ett svep genom varje vy i appen.
 *
 * Testet påstår inget om innehållet — det finns det andra tester för. Det
 * kontrollerar bara att sidan faktiskt renderar utan att krascha, vilket är
 * precis den sortens fel som annars slinker igenom när något gemensamt
 * ändras: en komponent som byter propnamn, en flyttad modul, en refaktorering
 * av designsystemet.
 */
function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <VaultProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </VaultProvider>
    </ThemeProvider>,
  )
}

const STATIC_ROUTES = [
  '/',
  '/program',
  '/mer',
  '/insikter',
  '/installningar',
  '/skattning',
  '/verktyg',
  '/om',
  '/om/kbt',
  '/om/integritet',
  '/om/kallor',
  '/finns-inte',
]

const FLOW_ROUTES = [
  '/skattning/phq9',
  '/skattning/gad7',
  '/skattning/who5',
  '/verktyg/tankedagbok/ny',
  '/verktyg/beteendeexperiment/ny',
  '/verktyg/problemlosning/ny',
]

describe('alla vyer renderar', () => {
  beforeAll(() => {
    // jsdom saknar matchMedia, som temat och rörelseinställningen frågar efter.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }))
  })

  beforeEach(async () => {
    localStorage.clear()
    await destroyEverything()
    await createVault('device')
  })

  it.each(STATIC_ROUTES)('%s', async (path) => {
    renderAt(path)
    // Varje vy har en rubrik. Att den dyker upp betyder att sidan laddats,
    // renderat och läst klart ur det krypterade lagret.
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })).toBeInTheDocument()
  })

  it.each(FLOW_ROUTES)('%s', async (path) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })).toBeInTheDocument()
    // Guidade flöden ska ha en knapp längst ner, aldrig en återvändsgränd.
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it.each(TOOLS.map((tool) => tool.path))('%s', async (path) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })).toBeInTheDocument()
  })

  it.each(SESSIONS.map((session) => `/program/${session.slug}`))('%s', async (path) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })).toBeInTheDocument()
  })
})
