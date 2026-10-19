import type { Settings } from '../types'
import { PROVIDER_PRESETS } from '../utils/constants'

/**
 * Dynamically fetch the list of currently active, in-service models directly from the provider's API.
 */
export async function fetchLiveModels(settings: Settings): Promise<string[]> {
  const fallback = PROVIDER_PRESETS[settings.providerPreset]?.models || ['gpt-6-sol']

  try {
    // -------------------------------------------------------------
    // 1. Google Gemini Live Model Discovery
    // -------------------------------------------------------------
    if (settings.providerPreset === 'gemini') {
      if (!settings.apiKey || settings.apiKey.trim().length === 0) {
        return fallback
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${settings.apiKey.trim()}`
      const response = await fetch(url)
      if (!response.ok) {
        console.warn(`Failed to fetch Gemini models: HTTP ${response.status}`)
        return fallback
      }

      const data = await response.json()
      if (Array.isArray(data.models)) {
        const models = data.models
          .filter((m: { supportedGenerationMethods?: string[] }) =>
            m.supportedGenerationMethods?.includes('generateContent')
          )
          .map((m: { name: string }) => m.name.replace(/^models\//, ''))
          // Prioritize Gemini 4 Argon, Gemini 3.8/3.7/3.5, and Gemini 2.5 generations
          .sort((a: string, b: string) => {
            const getPriority = (name: string) => {
              if (name.includes('gemini-4-argon')) return 1
              if (name.includes('gemini-4')) return 2
              if (name.includes('gemini-3.8')) return 3
              if (name.includes('gemini-3.7')) return 4
              if (name.includes('gemini-3.5')) return 5
              if (name.includes('gemini-3.1')) return 6
              if (name.includes('gemini-3')) return 7
              if (name.includes('gemini-2.5')) return 8
              if (name.includes('gemma-4')) return 9
              return 10
            }
            return getPriority(a) - getPriority(b) || a.localeCompare(b)
          })

        return models.length > 0 ? models : fallback
      }
      return fallback
    }

    // -------------------------------------------------------------
    // 2. Anthropic Claude Live Model Discovery
    // -------------------------------------------------------------
    if (settings.providerPreset === 'anthropic') {
      if (!settings.apiKey || settings.apiKey.trim().length === 0) {
        return fallback
      }

      try {
        const url = `${settings.baseUrl.replace(/\/+$/, '')}/models`
        const response = await fetch(url, {
          headers: {
            'x-api-key': settings.apiKey.trim(),
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.data)) {
            const list = data.data.map((m: { id: string }) => m.id)
            if (list.length > 0) return list
          }
        }
      } catch {
        // Fallback to presets
      }
      return fallback
    }

    // -------------------------------------------------------------
    // 3. Ollama Local Model Discovery
    // -------------------------------------------------------------
    if (settings.providerPreset === 'ollama') {
      const baseUrl = settings.baseUrl.replace(/\/+$/, '')
      try {
        const origin = baseUrl.replace(/\/v1$/, '')
        const res = await fetch(`${origin}/api/tags`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.models)) {
            const names = data.models.map((m: { name: string }) => m.name)
            if (names.length > 0) return names
          }
        }
      } catch {
        // Fallback to /v1/models
      }

      try {
        const res = await fetch(`${baseUrl}/models`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.data)) {
            return data.data.map((m: { id: string }) => m.id)
          }
        }
      } catch {
        // Return fallback
      }
      return fallback
    }

    // -------------------------------------------------------------
    // 4. OpenAI & Compatible Providers (Groq, DeepSeek, xAI, OpenRouter, Custom)
    // -------------------------------------------------------------
    if (!settings.apiKey || settings.apiKey.trim().length === 0) {
      return fallback
    }

    const modelsUrl = `${settings.baseUrl.replace(/\/+$/, '')}/models`
    const headers: Record<string, string> = {
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    }

    if (settings.providerPreset === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin
      headers['X-Title'] = 'SpecGlow SDD Studio'
    }

    const response = await fetch(modelsUrl, { headers })
    if (!response.ok) {
      console.warn(`Failed to fetch models from ${modelsUrl}: HTTP ${response.status}`)
      return fallback
    }

    const data = await response.json()
    if (Array.isArray(data.data)) {
      let list = data.data.map((m: { id: string }) => m.id)

      if (settings.providerPreset === 'openai') {
        list = list.filter((id: string) =>
          id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('chatgpt-')
        )
      }

      return list.length > 0 ? list.sort() : fallback
    }

    return fallback
  } catch (err) {
    console.warn('Error discovering live models:', err)
    return fallback
  }
}
