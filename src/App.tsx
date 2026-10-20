import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import { VisualWorkflowPage } from './pages/VisualWorkflowPage'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <VisualWorkflowPage />
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default App
