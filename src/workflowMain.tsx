import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import { VisualWorkflowPage } from './pages/VisualWorkflowPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <VisualWorkflowPage />
      </SettingsProvider>
    </ThemeProvider>
  </StrictMode>,
)
