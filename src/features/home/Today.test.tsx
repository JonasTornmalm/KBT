import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/App'
import { ThemeProvider } from '../../app/ThemeProvider'
import { VaultProvider } from '../../app/VaultProvider'
import type { CheckinData } from '../../domain/checkin'
import type { SecureStore } from '../../lib/db/store'
import { createVault, destroyEverything } from '../../lib/db/vault'

/**
 * Snabbincheckningen på startsidan.
 *
 * Ett tryck ska bli en incheckning — inte två, och inte en incheckning med
 * ifyllda värden ingen skattat. Graferna under Insikter läser den här datan
 * rakt av, så allt som skrivs här måste vara något användaren faktiskt sagt.
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

describe('snabbincheckningen', () => {
  let store: SecureStore

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
    store = (await createVault('device')).store
  })

  it('sparar humöret och inget annat', async () => {
    renderApp()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Bra' }))
    expect(await screen.findByText(/Incheckad idag/)).toBeInTheDocument()

    const checkins = await store.byType<CheckinData>('checkin')
    expect(checkins).toHaveLength(1)
    expect(checkins[0]!.data.mood).toBe(4)

    // Ingen påhittad skattning: ångestgrafen ska aldrig kunna rita en siffra
    // som användaren inte har angett.
    expect(checkins[0]!.data.anxiety).toBeUndefined()
    expect(checkins[0]!.data.energy).toBeUndefined()
  })
})
