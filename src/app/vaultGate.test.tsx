import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { ThemeProvider } from './ThemeProvider'
import { VaultProvider } from './VaultProvider'
import { createVault, destroyEverything } from '../lib/db/vault'

/**
 * Grinden in i appen.
 *
 * Det här är inte en inloggningsruta som går att kringgå — nyckeln till datan
 * härleds ur lösenfrasen, så utan rätt fras finns det bokstavligen ingenting
 * att visa. Testet finns för att säkerställa att grinden sitter kvar: att en
 * låst app aldrig råkar rendera innehåll, och att rätt fras släpper in.
 */
function renderApp() {
  return render(
    <ThemeProvider>
      <VaultProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </VaultProvider>
    </ThemeProvider>,
  )
}

describe('valvets grind', () => {
  beforeAll(() => {
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
  })

  it('visar introduktionen när det inte finns något valv', async () => {
    renderApp()
    expect(
      await screen.findByRole('heading', { name: /Ett lugnt ställe att arbeta med dina tankar/ }),
    ).toBeInTheDocument()
  })

  it('öppnar sig själv i enhetsläge', async () => {
    await createVault('device')
    renderApp()
    expect(await screen.findByRole('heading', { name: 'Det här är ditt nästa steg' })).toBeInTheDocument()
  })

  it('kräver lösenfras när låset är på, och visar ingen data innan dess', async () => {
    await createVault('passphrase', 'en lugn lösenfras', 'blomman i fönstret')
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Välkommen tillbaka' })).toBeInTheDocument()
    expect(screen.getByText('Din ledtråd: blomman i fönstret')).toBeInTheDocument()

    // Ingenting ur appen får synas medan den är låst.
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByText('Det här är ditt nästa steg')).not.toBeInTheDocument()
  })

  it('släpper inte in på fel lösenfras', async () => {
    await createVault('passphrase', 'rätt lösenfras')
    renderApp()
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Lösenfras'), 'fel lösenfras')
    await user.click(screen.getByRole('button', { name: 'Lås upp' }))

    expect(await screen.findByText('Det stämde inte. Försök igen.')).toBeInTheDocument()
    expect(screen.queryByText('Det här är ditt nästa steg')).not.toBeInTheDocument()
  })

  it('släpper in på rätt lösenfras', async () => {
    await createVault('passphrase', 'rätt lösenfras')
    renderApp()
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Lösenfras'), 'rätt lösenfras')
    await user.click(screen.getByRole('button', { name: 'Lås upp' }))

    expect(
      await screen.findByRole('heading', { name: 'Det här är ditt nästa steg' }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })
})
