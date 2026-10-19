import React, { useState } from 'react'
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  FileEdit
} from 'lucide-react'
import type { ComposerItem } from '../types'
import {
  ARCHETYPE_PRESETS,
  CAPABILITY_PRESETS,
  PERSONA_PRESETS,
  INVARIANT_PRESETS
} from '../utils/constants'

interface PrdComposerProps {
  onApplyBrief: (briefText: string) => void
  archetypes?: ComposerItem[]
  setArchetypes?: React.Dispatch<React.SetStateAction<ComposerItem[]>>
  capabilities?: ComposerItem[]
  setCapabilities?: React.Dispatch<React.SetStateAction<ComposerItem[]>>
  personas?: ComposerItem[]
  setPersonas?: React.Dispatch<React.SetStateAction<ComposerItem[]>>
  invariants?: ComposerItem[]
  setInvariants?: React.Dispatch<React.SetStateAction<ComposerItem[]>>
}

type SectionKey = 'archetypes' | 'capabilities' | 'personas' | 'invariants'

export const PrdComposer: React.FC<PrdComposerProps> = ({
  onApplyBrief,
  archetypes: propArchetypes,
  setArchetypes: propSetArchetypes,
  capabilities: propCapabilities,
  setCapabilities: propSetCapabilities,
  personas: propPersonas,
  setPersonas: propSetPersonas,
  invariants: propInvariants,
  setInvariants: propSetInvariants
}) => {
  const [isOpen, setIsOpen] = useState(true)

  // Internal fallback state if not controlled externally
  const [internalArchetypes, setInternalArchetypes] = useState<ComposerItem[]>([
    { id: 'arch-1', label: 'Event-Driven Microservices (Kafka / RabbitMQ / SQS)', reason: 'Decoupled asynchronous ledger processing' }
  ])
  const [internalCapabilities, setInternalCapabilities] = useState<ComposerItem[]>([
    { id: 'cap-1', label: 'Financial Double-Entry Ledger & Currency Settlement', reason: 'Zero floating-point balance consistency' }
  ])
  const [internalPersonas, setInternalPersonas] = useState<ComposerItem[]>([
    { id: 'per-1', label: 'Enterprise IT Administrator / Security Officer', reason: 'Enforce dual-custody authorization' }
  ])
  const [internalInvariants, setInternalInvariants] = useState<ComposerItem[]>([
    { id: 'inv-1', label: 'Strict Idempotency Keys (Zero Duplicate Execution)', reason: 'Protect against network retry replays' }
  ])

  const archetypes = propArchetypes ?? internalArchetypes
  const setArchetypes = propSetArchetypes ?? setInternalArchetypes
  const capabilities = propCapabilities ?? internalCapabilities
  const setCapabilities = propSetCapabilities ?? setInternalCapabilities
  const personas = propPersonas ?? internalPersonas
  const setPersonas = propSetPersonas ?? setInternalPersonas
  const invariants = propInvariants ?? internalInvariants
  const setInvariants = propSetInvariants ?? setInternalInvariants

  // Custom addition dialog state
  const [activeDialog, setActiveDialog] = useState<SectionKey | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customText, setCustomText] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')

  // Optional project title and custom nuances
  const [initiativeName, setInitiativeName] = useState<string>('')
  const [extraNuances, setExtraNuances] = useState<string>('')
  const [composedSuccess, setComposedSuccess] = useState(false)

  const openAddDialog = (section: SectionKey) => {
    setActiveDialog(section)
    setCustomText('')
    setCustomReason('')
    if (section === 'archetypes') setSelectedPreset(ARCHETYPE_PRESETS[0])
    else if (section === 'capabilities') setSelectedPreset(CAPABILITY_PRESETS[0])
    else if (section === 'personas') setSelectedPreset(PERSONA_PRESETS[0])
    else if (section === 'invariants') setSelectedPreset(INVARIANT_PRESETS[0])
  }

  const handleAddItem = (section: SectionKey) => {
    const finalLabel = customText.trim() || selectedPreset
    if (!finalLabel) return

    const newItem: ComposerItem = {
      id: `${section}-${Date.now()}`,
      label: finalLabel,
      reason: customReason.trim() || undefined
    }

    if (section === 'archetypes') setArchetypes(prev => [...prev, newItem])
    else if (section === 'capabilities') setCapabilities(prev => [...prev, newItem])
    else if (section === 'personas') setPersonas(prev => [...prev, newItem])
    else if (section === 'invariants') setInvariants(prev => [...prev, newItem])

    setActiveDialog(null)
    setCustomText('')
    setCustomReason('')
  }

  const handleRemoveItem = (section: SectionKey, id: string) => {
    if (section === 'archetypes') setArchetypes(prev => prev.filter(i => i.id !== id))
    else if (section === 'capabilities') setCapabilities(prev => prev.filter(i => i.id !== id))
    else if (section === 'personas') setPersonas(prev => prev.filter(i => i.id !== id))
    else if (section === 'invariants') setInvariants(prev => prev.filter(i => i.id !== id))
  }

  const handleComposeBrief = () => {
    const title = initiativeName.trim() || 'Next-Gen Enterprise Platform Capability'

    let composed = `### Initiative Vision: ${title}\n\n`
    composed += `**1. Architecture & System Topology:**\n`
    archetypes.forEach(item => {
      composed += `- ${item.label}${item.reason ? ` — *Purpose: ${item.reason}*` : ''}\n`
    })

    composed += `\n**2. Core Functional Capabilities & Engines:**\n`
    capabilities.forEach(item => {
      composed += `- ${item.label}${item.reason ? ` — *Scope: ${item.reason}*` : ''}\n`
    })

    composed += `\n**3. Target Stakeholders & User Journeys:**\n`
    personas.forEach(item => {
      composed += `- ${item.label}${item.reason ? ` — *Key Need: ${item.reason}*` : ''}\n`
    })

    composed += `\n**4. Non-Negotiable Invariants & Compliance Rules:**\n`
    invariants.forEach(item => {
      composed += `- ${item.label}${item.reason ? ` — *Security Requirement: ${item.reason}*` : ''}\n`
    })

    if (extraNuances.trim()) {
      composed += `\n**5. Specialized Technical Nuances & Integrations:**\n`
      composed += `${extraNuances.trim()}\n`
    }

    onApplyBrief(composed)
    setComposedSuccess(true)
    setTimeout(() => setComposedSuccess(false), 3000)
  }

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header with Step 1B Badge & Collapse Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
            1B
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>PATH 1B: Interactive PRD & Feature Composer</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                Multi-Archetype Builder
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Select multiple system archetypes, engines, and personas with custom reasons to assemble a structured PRD draft.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-300 cursor-pointer"
        >
          <span>{isOpen ? 'Minimize Composer' : 'Expand Composer'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
          {/* Initiative Title & Nuances Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1 block">
                Initiative / Feature Name (Optional)
              </label>
              <input
                type="text"
                value={initiativeName}
                onChange={e => setInitiativeName(e.target.value)}
                placeholder="e.g. Real-Time Multi-Currency Settlement Engine"
                className="w-full px-3 py-1.5 text-xs rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1 block">
                Specialized Constraints or Integrations (Optional)
              </label>
              <input
                type="text"
                value={extraNuances}
                onChange={e => setExtraNuances(e.target.value)}
                placeholder="e.g. Must integrate with Stripe webhooks and legacy AS400 core"
                className="w-full px-3 py-1.5 text-xs rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* 4 Multi-Select Interactive Builder Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. System Archetypes */}
            <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>1. System Archetype(s)</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">({archetypes.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => openAddDialog('archetypes')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all bg-white hover:bg-slate-100 border-slate-300 text-cyan-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-cyan-400 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Archetype</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                {archetypes.map(item => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xs"
                  >
                    <span>{item.label}</span>
                    {item.reason && (
                      <span className="text-[10px] text-cyan-700 dark:text-cyan-400 italic">
                        ({item.reason})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('archetypes', item.id)}
                      className="ml-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Core Capabilities */}
            <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>2. Core Capability Engine(s)</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">({capabilities.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => openAddDialog('capabilities')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all bg-white hover:bg-slate-100 border-slate-300 text-indigo-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-indigo-400 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Engine</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                {capabilities.map(item => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xs"
                  >
                    <span>{item.label}</span>
                    {item.reason && (
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-400 italic">
                        ({item.reason})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('capabilities', item.id)}
                      className="ml-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Primary Stakeholders / Personas */}
            <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>3. Target Persona(s) & Actors</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">({personas.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => openAddDialog('personas')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all bg-white hover:bg-slate-100 border-slate-300 text-emerald-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Persona</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                {personas.map(item => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xs"
                  >
                    <span>{item.label}</span>
                    {item.reason && (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 italic">
                        ({item.reason})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('personas', item.id)}
                      className="ml-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Architectural & Security Invariants */}
            <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>4. Architectural & Security Invariant(s)</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">({invariants.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => openAddDialog('invariants')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all bg-white hover:bg-slate-100 border-slate-300 text-amber-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-amber-400 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Invariant</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                {invariants.map(item => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xs"
                  >
                    <span>{item.label}</span>
                    {item.reason && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                        ({item.reason})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('invariants', item.id)}
                      className="ml-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Inline Dialog for Adding Item with Custom Reason */}
          {activeDialog && (
            <div className="p-4 rounded-xl border border-cyan-400/40 bg-cyan-50/50 dark:bg-cyan-950/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200 uppercase tracking-wider">
                  Add to {activeDialog.toUpperCase()}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveDialog(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Select Standard Preset:
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={e => {
                      setSelectedPreset(e.target.value)
                      setCustomText('')
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border font-medium bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                  >
                    {(activeDialog === 'archetypes' ? ARCHETYPE_PRESETS :
                      activeDialog === 'capabilities' ? CAPABILITY_PRESETS :
                      activeDialog === 'personas' ? PERSONA_PRESETS :
                      INVARIANT_PRESETS).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Or Type Custom Item Name:
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="e.g. gRPC Real-Time Streaming or Hardware HSM Key Store"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border font-medium bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Specific Architectural Reason / Purpose in this Project (Optional):
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  placeholder="e.g. Required for sub-second quote feeds or compliance with SEC Rule 606"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border font-medium bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveDialog(null)}
                  className="px-3 py-1 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem(activeDialog)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm cursor-pointer"
                >
                  Add Selection
                </button>
              </div>
            </div>
          )}

          {/* Action Button: Compose PRD & Feature Brief */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <div className="text-xs text-slate-600 dark:text-zinc-400">
              {composedSuccess && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Feature Brief compiled and placed in requirement textarea below!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleComposeBrief}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>✨ Compose Feature Brief & PRD Draft</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
