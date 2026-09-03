import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './app/ThemeProvider'
import { VaultProvider } from './app/VaultProvider'
import './styles/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {/* Yttre skyddsnät: fångar även onboarding, låsskärm och de guidade
          flödena, som ligger utanför Layout och dess egen boundary. */}
      <ErrorBoundary>
        <VaultProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </VaultProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
