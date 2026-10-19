import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Settings, ProviderPreset } from '../types'
import { DEFAULT_SETTINGS, PROVIDER_PRESETS } from '../utils/constants'
import { fetchLiveModels } from '../services/modelService'

export interface TestResult {
  success: boolean
  message: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  selectPreset: (preset: ProviderPreset) => void
  resetToDefault: () => void
  isConfigured: boolean
  testConnection: (overrideSettings?: Settings) => Promise<TestResult>
  availableModels: string[]
  isFetchingModels: boolean
  fetchModels: () => Promise<string[]>
}

const SETTINGS_STORAGE_KEY = 'specflow_sdd_byok_settings_v1'

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage:', e)
    }
    return DEFAULT_SETTINGS
  })

  const [availableModels, setAvailableModels] = useState<string[]>(() => {
    return PROVIDER_PRESETS[settings.providerPreset]?.models || ['gpt-4o-mini']
  })
  const [isFetchingModels, setIsFetchingModels] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e)
    }
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const selectPreset = (preset: ProviderPreset) => {
    const config = PROVIDER_PRESETS[preset]
    setSettings(prev => ({
      ...prev,
      providerPreset: preset,
      baseUrl: config.baseUrl,
      model: config.defaultModel,
    }))
    setAvailableModels(config.models)
  }

  const fetchModels = useCallback(async (): Promise<string[]> => {
    setIsFetchingModels(true)
    try {
      const models = await fetchLiveModels(settings)
      if (models && models.length > 0) {
        setAvailableModels(models)
        if (!models.includes(settings.model)) {
          updateSettings({ model: models[0] })
        }
      }
      return models
    } finally {
      setIsFetchingModels(false)
    }
  }, [settings])

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS)
    setAvailableModels(PROVIDER_PRESETS.openai.models)
  }

  const isConfigured = Boolean(
    settings.providerPreset === 'ollama' ||
    (settings.apiKey && settings.apiKey.trim().length > 0)
  )

  const testConnection = async (override?: Settings): Promise<TestResult> => {
    const active = override || settings
    const isReady = active.providerPreset === 'ollama' || (active.apiKey && active.apiKey.trim().length > 0)

    if (!isReady) {
      return {
        success: false,
        message: 'Please provide an API Key before testing the connection.',
      }
    }

    try {
      // 1. Google Gemini API
      if (active.providerPreset === 'gemini') {
        const cleanModelName = active.model.replace(/^models\//, '')
        const geminiUrl = `${active.baseUrl.replace(/\/+$/, '')}/models/${cleanModelName}:generateContent?key=${active.apiKey.trim()}`
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping. Respond with "pong" only.' }] }],
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let detail = ''
          try {
            const parsed = JSON.parse(errorText)
            detail = parsed.error?.message || errorText
          } catch {
            detail = errorText || response.statusText
          }
          return {
            success: false,
            message: `Google Gemini Error (HTTP ${response.status}): ${detail}`,
          }
        }

        return {
          success: true,
          message: `Connection Verified! Google Gemini Model "${active.model}" responded successfully.`,
        }
      }

      // 2. Anthropic API
      if (active.providerPreset === 'anthropic') {
        const anthropicUrl = `${active.baseUrl.replace(/\/+$/, '')}/messages`
        const response = await fetch(anthropicUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': active.apiKey.trim(),
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: active.model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Ping. Respond with "pong" only.' }],
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let detail = ''
          try {
            const parsed = JSON.parse(errorText)
            detail = parsed.error?.message || errorText
          } catch {
            detail = errorText || response.statusText
          }
          return {
            success: false,
            message: `Anthropic Error (HTTP ${response.status}): ${detail}`,
          }
        }

        return {
          success: true,
          message: `Connection Verified! Anthropic Claude Model "${active.model}" responded successfully.`,
        }
      }

      // 3. OpenAI & Compatible Providers (Groq, DeepSeek, Ollama, xAI, OpenRouter, Custom)
      const cleanBaseUrl = active.baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBaseUrl}/chat/completions`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (active.apiKey && active.apiKey.trim() !== '') {
        headers['Authorization'] = `Bearer ${active.apiKey.trim()}`
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: active.model,
          messages: [{ role: 'user', content: 'Ping. Respond with "pong" only.' }],
          max_tokens: 5,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let detail = ''
        try {
          const parsed = JSON.parse(errorText)
          detail = parsed.error?.message || errorText
        } catch {
          detail = errorText || response.statusText
        }
        return {
          success: false,
          message: `API Error (HTTP ${response.status} from ${active.providerPreset}): ${detail}`,
        }
      }

      const data = await response.json()
      if (data.choices && data.choices.length > 0) {
        return {
          success: true,
          message: `Connection Verified! Provider "${active.providerPreset}" model "${active.model}" responded successfully.`,
        }
      }

      return {
        success: true,
        message: 'Endpoint reachable and validated.',
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error occurred.'
      return {
        success: false,
        message: `Failed to connect: ${message}`,
      }
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        selectPreset,
        resetToDefault,
        isConfigured,
        testConnection,
        availableModels,
        isFetchingModels,
        fetchModels,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
