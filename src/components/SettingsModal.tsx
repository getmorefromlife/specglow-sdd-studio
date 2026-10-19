import React, { useState, useEffect } from 'react'
import { X, ShieldCheck, Check, Sparkles, AlertCircle, RefreshCw, Edit3, ListFilter } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { PROVIDER_PRESETS } from '../utils/constants'
import { fetchLiveModels } from '../services/modelService'
import type { ProviderPreset } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, testConnection } = useSettings()

  const [formData, setFormData] = useState(settings)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState<string>('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Live Model Discovery State
  const [availableModelList, setAvailableModelList] = useState<string[]>(() => {
    return PROVIDER_PRESETS[settings.providerPreset]?.models || ['gpt-6-sol']
  })
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null)
  const [isManualInput, setIsManualInput] = useState(false)

  // Sync available models whenever the provider changes
  useEffect(() => {
    const preset = PROVIDER_PRESETS[formData.providerPreset]
    if (preset?.models) {
      setAvailableModelList(preset.models)
      setFetchSuccessMessage(null)
    }
  }, [formData.providerPreset])

  if (!isOpen) return null

  const handlePresetSelect = (preset: ProviderPreset) => {
    const config = PROVIDER_PRESETS[preset]
    if (!config) return

    setFormData(prev => ({
      ...prev,
      providerPreset: preset,
      baseUrl: config.baseUrl,
      model: config.defaultModel,
      apiKey: preset === 'ollama' ? 'ollama-local' : prev.providerPreset === preset ? prev.apiKey : ''
    }))
    setAvailableModelList(config.models)
    setTestStatus('idle')
    setFetchSuccessMessage(null)
    setIsManualInput(false)
  }

  const handleFetchLiveModels = async () => {
    setIsFetchingModels(true)
    setFetchSuccessMessage(null)
    try {
      const live = await fetchLiveModels(formData)
      if (live && live.length > 0) {
        setAvailableModelList(live)
        setFetchSuccessMessage(`Discovered ${live.length} active models from ${activePreset?.name || formData.providerPreset}`)
        // If current model is not in list, auto-select the highest priority model
        if (!live.includes(formData.model)) {
          setFormData(prev => ({ ...prev, model: live[0] }))
        }
      } else {
        setFetchSuccessMessage('No new models returned. Using complete 2026 preset catalog.')
      }
    } catch {
      setFetchSuccessMessage('Using complete 2026 preset catalog.')
    } finally {
      setIsFetchingModels(false)
    }
  }

  const handleSave = () => {
    updateSettings(formData)
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      onClose()
    }, 800)
  }

  const handleTest = async () => {
    setTestStatus('testing')
    setTestMessage('')
    try {
      const res = await testConnection(formData)
      if (res.success) {
        setTestStatus('success')
        setTestMessage(res.message)
      } else {
        setTestStatus('error')
        setTestMessage(res.message)
      }
    } catch (err: unknown) {
      setTestStatus('error')
      setTestMessage(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  const activePreset = PROVIDER_PRESETS[formData.providerPreset]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border shadow-2xl transition-all duration-200 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Model Provider & API Settings (BYOK)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Connect your frontier LLM provider. Zero backend server costs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Privacy Guarantee Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong>🔒 100% Client-Side Privacy:</strong> Requirements and API keys never leave your browser. Zero third-party telemetry, intermediate proxies, or external database logging.
            </div>
          </div>

          {/* Provider Preset Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-2 block">
              1-Click Provider Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['openai', 'gemini', 'anthropic', 'xai', 'groq', 'deepseek', 'ollama', 'openrouter'] as ProviderPreset[]).map(key => {
                const p = PROVIDER_PRESETS[key]
                const isSelected = formData.providerPreset === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 text-cyan-900 border-cyan-500 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500 ring-1 ring-cyan-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="truncate">{p?.name.split(' ')[0] || key}</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-zinc-500 truncate mt-0.5">
                      {p?.defaultModel || 'custom'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-1.5 block">
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={activePreset?.placeholderKey || 'Enter API Key...'}
              className="w-full px-3.5 py-2 text-xs rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
            {formData.providerPreset === 'ollama' && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                ✓ Local Ollama does not require an API key when running locally on port 11434.
              </p>
            )}
          </div>

          {/* Model Identifier & Dynamic Discovery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                <span>Model Identifier</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
                  2026 Lineup
                </span>
              </label>

              <div className="flex items-center gap-2">
                {/* Refresh Live Models Button */}
                <button
                  type="button"
                  onClick={handleFetchLiveModels}
                  disabled={isFetchingModels}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 disabled:opacity-50"
                  title="Query provider's live /models endpoint to discover all active in-service models"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${isFetchingModels ? 'animate-spin' : ''}`} />
                  <span>{isFetchingModels ? 'Discovering...' : 'Fetch Live Models'}</span>
                </button>

                {/* Toggle Manual / Dropdown */}
                <button
                  type="button"
                  onClick={() => setIsManualInput(!isManualInput)}
                  className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  title={isManualInput ? 'Switch to Model Dropdown' : 'Type Custom Model Name'}
                >
                  {isManualInput ? <ListFilter className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Success message banner when models are discovered */}
            {fetchSuccessMessage && (
              <div className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-cyan-50 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/80 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>{fetchSuccessMessage}</span>
              </div>
            )}

            {isManualInput ? (
              <input
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. gemini-4-argon, gpt-6-sol, claude-sonnet-5.5"
                className="w-full px-3.5 py-2 text-xs rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-50 border-slate-300 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
              />
            ) : (
              <select
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-50 border-slate-300 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
              >
                {/* Ensure current model is an option even if custom */}
                {!availableModelList.includes(formData.model) && (
                  <option value={formData.model}>{formData.model} (Custom / Active)</option>
                )}
                {availableModelList.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Quick-Pick Recommended Models Chips */}
            {activePreset?.recommendedModels && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 self-center">Frontier Lineup:</span>
                {activePreset.recommendedModels.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, model: m })}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      formData.model === m
                        ? 'bg-cyan-600 text-white font-bold shadow-sm'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Base URL */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-1.5 block">
              API Base URL
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3.5 py-2 text-xs rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-50 border-slate-300 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Test Status Feedback */}
          {testStatus !== 'idle' && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              testStatus === 'testing' ? 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300' :
              testStatus === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
              'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            }`}>
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
              {testStatus === 'success' && <Check className="w-4 h-4 shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={handleTest}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all bg-white hover:bg-slate-100 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 disabled:opacity-50"
          >
            {testStatus === 'testing' ? 'Verifying...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold shadow-md transition-all bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{saveSuccess ? 'Saved!' : 'Save & Close'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
