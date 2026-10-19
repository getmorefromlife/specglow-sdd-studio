import React, { useState, useEffect } from 'react'
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  HelpCircle
} from 'lucide-react'
import { voiceService } from '../services/voiceService'
import { parseVoiceInputToIntent, type ParsedVoiceIntent } from '../services/voiceIntentParser'

interface VoiceAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyIntent: (intent: ParsedVoiceIntent) => void
}

const SAMPLE_SPEECHES = [
  {
    title: 'FinTech Multi-Currency Ledger',
    text: 'We are building an event-driven microservices financial ledger with double-entry currency settlement, strict idempotency keys, and zero-drift balance reconciliations under PCI-DSS standards for enterprise banking auditors and customers.'
  },
  {
    title: 'HealthTech HIPAA Telehealth',
    text: 'Build a mission-critical HIPAA telehealth consultation portal with real-time WebSockets, dynamic patient triage queue, clinician prescription workflows, and zero PHI log leakage invariants.'
  },
  {
    title: 'GovTech FedRAMP High Portal',
    text: 'We need a FedRAMP High public sector agency portal with zero-trust IAM, multi-factor SSO authentication, REST API gateway, strict role-based access control, and immutable audit logs.'
  },
  {
    title: 'AI RAG Document Extraction',
    text: 'Construct an AI document extraction and RAG pipeline using vector hybrid search, background worker queue for multi-format PDF layout chunking, and tenant isolation invariants.'
  }
]

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyIntent
}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [parsedPreview, setParsedPreview] = useState<ParsedVoiceIntent | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    setIsSupported(voiceService.isSupported())
  }, [])

  useEffect(() => {
    if (transcript.trim().length > 10) {
      const intent = parseVoiceInputToIntent(transcript)
      setParsedPreview(intent)
    } else {
      setParsedPreview(null)
    }
  }, [transcript])

  // Stop listening when modal closes
  useEffect(() => {
    if (!isOpen && isListening) {
      voiceService.stopListening()
      setIsListening(false)
    }
  }, [isOpen, isListening])

  if (!isOpen) return null

  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stopListening()
      setIsListening(false)
    } else {
      setSpeechError(null)
      const started = voiceService.startListening({
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
        onError: (err) => {
          setSpeechError(err)
          setIsListening(false)
        },
        onTranscript: (newText) => {
          setTranscript(newText)
        }
      })

      if (!started && !voiceService.isSupported()) {
        setSpeechError('Web Speech API is not supported in this browser. You can select a sample speech prompt or type below.')
      }
    }
  }

  const handleApply = () => {
    if (!transcript.trim()) return
    const intent = parsedPreview || parseVoiceInputToIntent(transcript)
    onApplyIntent(intent)
    onClose()
  }

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Voice Co-Pilot & Audio Dictation
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  Auto-Configuring
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Speak your feature idea or system goals. SpecGlow AI will auto-select domain, rigor, archetypes, and compose the PRD.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Support Notice if unavailable */}
        {!isSupported && (
          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Your browser doesn't expose native SpeechRecognition. You can paste speech transcripts or test with the sample audio prompts below!
            </span>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Central Audio Recording HUD */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 text-center space-y-4">
          {/* Animated Microphone Button */}
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute -inset-3 rounded-full bg-cyan-500/20 animate-ping" />
                <div className="absolute -inset-6 rounded-full bg-cyan-500/10 animate-pulse" />
              </>
            )}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 ring-4 ring-cyan-500/20'
              }`}
            >
              {isListening ? (
                <MicOff className="w-9 h-9" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {isListening ? '🎙️ Listening... Speak naturally now' : 'Click microphone to start dictation'}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Mention the problem, tech stack, compliance rules (HIPAA, PCI-DSS, FedRAMP), and key capabilities.
            </p>
          </div>

          {/* Sound wave visualizer bars when listening */}
          {isListening && (
            <div className="flex items-center gap-1.5 h-6">
              {[40, 70, 100, 60, 90, 45, 80, 95, 55, 85].map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-cyan-500 rounded-full animate-bounce"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 70}ms`,
                    animationDuration: '600ms'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Spoken Transcript Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Spoken Transcript / Dictation Text</span>
            </label>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will appear here in real-time. You can also edit or paste text directly..."
            className="w-full px-3.5 py-2.5 text-xs rounded-lg border font-mono bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Real-Time Auto-Configuration Preview */}
        {parsedPreview && (
          <div className="p-4 rounded-xl border border-cyan-400/40 bg-cyan-50/40 dark:bg-cyan-950/20 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-950 dark:text-cyan-300">
                AI Intent Extraction Preview
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">
                  Auto-Selected Domain
                </span>
                <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {parsedPreview.detectedDomain}
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">
                  Delivery Rigor Depth
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {parsedPreview.detectedDepth}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-zinc-400 flex flex-wrap gap-2">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">Auto-Configures:</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                {parsedPreview.archetypes.length} Archetype(s)
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                {parsedPreview.capabilities.length} Capability Engine(s)
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                {parsedPreview.personas.length} Persona(s)
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                {parsedPreview.invariants.length} Security Invariant(s)
              </span>
            </div>
          </div>
        )}

        {/* Quick Sample Voice Prompts */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">
            Or Test With 1-Click Spoken Samples:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_SPEECHES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s.text)}
                className="text-left p-2.5 rounded-lg border text-xs bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 transition-colors flex items-start gap-2 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{s.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">{s.text}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!transcript.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply & Auto-Configure Studio</span>
          </button>
        </div>
      </div>
    </div>
  )
}
