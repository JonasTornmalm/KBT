import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { ThemeProvider } from './app/ThemeProvider'
import { VaultProvider } from './app/VaultProvider'
import './styles/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <VaultProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </VaultProvider>
    </ThemeProvider>
  </StrictMode>,
)
