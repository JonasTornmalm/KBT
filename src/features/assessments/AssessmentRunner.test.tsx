import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { VaultProvider, useVault } from '../../app/VaultProvider'
import { PHQ9 } from '../../domain/assessments/scales'
import { destroyEverything, createVault } from '../../lib/db/vault'
import { AssessmentRunner } from './AssessmentRunner'

/** Motsvarar grinden i App: vyerna renderas först när valvet är upplåst. */
function WhenUnlocked({ children }: { children: React.ReactNode }) {
  return useVault().status === 'unlocked' ? <>{children}</> : null
}

function renderRunner() {
  return render(
    <VaultProvider>
      <WhenUnlocked>
        <MemoryRouter initialEntries={['/skattning/phq9']}>
          <Routes>
            <Route path="/skattning/:scale" element={<AssessmentRunner />} />
            <Route path="/skattning" element={<p>Skattningar</p>} />
            <Route path="/verktyg/sakerhetsplan" element={<p>Säkerhetsplan</p>} />
          </Routes>
        </MemoryRouter>
      </WhenUnlocked>
    </VaultProvider>,
  )
}

/** Besvarar hela PHQ-9. `lastAnswer` är svaret på fråga nio. */
async function answerAll(lastAnswer: string) {
  const user = userEvent.setup()

  for (let i = 0; i < PHQ9.items.length; i += 1) {
    const item = PHQ9.items[i]!
    await screen.findByRole('heading', { name: item.text })

    const label = i === PHQ9.items.length - 1 ? lastAnswer : 'Inte alls'
    await user.click(screen.getByRole('radio', { name: label }))

    const button = screen.getByRole('button', {
      name: i === PHQ9.items.length - 1 ? 'Se resultatet' : 'Nästa',
    })
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)
  }
}

/**
 * Säkerhetsspärren är appens känsligaste vy: den visas när någon svarat att de
 * haft tankar på att inte vilja leva. Den måste dyka upp varje gång, oavsett
 * hur låg totalsumman är — och den får inte dyka upp i onödan, eftersom ett
 * larm på fel grund lär användaren att svara mindre ärligt nästa gång.
 */
describe('PHQ-9 i gränssnittet', () => {
  beforeEach(async () => {
    localStorage.clear()
    await destroyEverything()
    await createVault('device')
  })

  it('visar stöd när fråga nio besvaras med mer än "inte alls"', async () => {
    renderRunner()
    await answerAll('Flera dagar')

    expect(await screen.findByText('Du svarade att du haft såna tankar')).toBeInTheDocument()

    // Numren ska gå att ringa direkt, utan att leta.
    expect(screen.getByRole('link', { name: /90101/ })).toHaveAttribute('href', 'tel:90101')
    expect(screen.getByRole('link', { name: /112/ })).toHaveAttribute('href', 'tel:112')
    expect(screen.getByRole('link', { name: 'Gör en säkerhetsplan' })).toBeInTheDocument()

    // Totalsumman är 1 – lägsta bandet – men stödet ska visas ändå.
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Inga eller minimala besvär')).toBeInTheDocument()
  })

  it('visar inget stöd när fråga nio är "inte alls"', async () => {
    renderRunner()
    await answerAll('Inte alls')

    expect(await screen.findByText('Ditt resultat')).toBeInTheDocument()
    expect(screen.queryByText('Du svarade att du haft såna tankar')).not.toBeInTheDocument()
  })

  it('formulerar resultatet som en skattning, inte som en diagnos', async () => {
    renderRunner()
    await answerAll('Inte alls')

    expect(await screen.findByText(/en skattning, inte en diagnos/)).toBeInTheDocument()
  })

  it('kräver ett svar innan man kan gå vidare', async () => {
    renderRunner()
    await screen.findByRole('heading', { name: PHQ9.items[0]!.text })
    expect(screen.getByRole('button', { name: 'Nästa' })).toBeDisabled()
  })
})
