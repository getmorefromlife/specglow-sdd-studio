import React from 'react'
import { Settings as SettingsIcon, ShieldCheck, Sun, Moon, Sparkles, BookOpen } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useTheme } from '../context/ThemeContext'
import { PROVIDER_PRESETS } from '../utils/constants'

interface HeaderProps {
  onOpenSettings: () => void
  onOpenGuide: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenGuide }) => {
  const { settings, isConfigured } = useSettings()
  const { theme, toggleTheme } = useTheme()
  const preset = PROVIDER_PRESETS[settings.providerPreset]

  return (
    <header className="border-b transition-colors duration-200 border-slate-200/70 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:shadow-none">
      {/* Privacy Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-cyan-950/40 dark:to-indigo-950/40 border-b border-emerald-500/20 dark:border-emerald-500/30 px-4 py-1.5 text-center text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>100% Client-Side Privacy:</strong> Requirements and API keys never leave your browser. Zero third-party data logging.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              {/* Ambient Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/40 via-indigo-500/30 to-violet-500/40 blur-xs opacity-75 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative w-11 h-11 rounded-xl p-0.5 bg-gradient-to-br from-cyan-400 via-indigo-500 to-slate-900 shadow-md overflow-hidden border border-cyan-400/30 dark:border-cyan-500/40">
                <img
                  src="/logo.png"
                  alt="SpecGlow SDD Studio Logo"
                  className="w-full h-full object-cover rounded-[10px] transform group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  SpecGlow SDD Studio
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI-Native SDD
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                AI-Native Spec-Driven Development & Delivery Governance Engine
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5">
                Created by{' '}
                <a
                  href="https://www.mercerandmills.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 underline underline-offset-2 transition-colors"
                >
                  Syed Imon Rizvi (Mercer and Mills)
                </a>{' '}
                • Licensed under Apache-2.0
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Active Provider Pill / Demo Mode Indicator */}
            <button
              onClick={onOpenSettings}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isConfigured
                  ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'bg-amber-50/80 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
              title={isConfigured ? 'Live BYOK AI Connected - Click to configure' : 'Running in Interactive Demo Mode - Click to connect your free Google Gemini or OpenAI key'}
            >
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isConfigured ? (
                <span>
                  <strong className="text-emerald-700 dark:text-emerald-400">Live AI:</strong> {preset?.name || settings.providerPreset} ({settings.model})
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="font-bold">Interactive Demo Mode</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal underline">Connect Key</span>
                </span>
              )}
            </button>

            {/* Workflow Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 bg-cyan-50 hover:bg-cyan-100 border-cyan-200/80 text-cyan-800 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 dark:border-cyan-800 dark:text-cyan-300 shadow-xs cursor-pointer"
              title="View the 5-step end-to-end workflow guide"
            >
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Workflow Guide</span>
            </button>

            {/* Day / Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Day and Night Theme"
              className="p-2 rounded-lg border transition-all duration-200 bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 shadow-xs cursor-pointer"
              title={theme === 'dark' ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                isConfigured
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/80'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>API Settings</span>
              {!isConfigured && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
