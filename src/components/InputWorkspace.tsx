import React, { useState, useRef, useEffect } from 'react'
import {
  Terminal,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Briefcase,
  Mic,
  Sparkles,
  FolderGit2,
  ChevronDown,
  ChevronUp,
  Code2,
  Upload,
  AlertTriangle,
  Database,
  Trash2,
  ShieldCheck,
  Globe,
  X,
  Clock
} from 'lucide-react'
import type { TargetDepth, RequirementInput, ComposerItem, SddArtifactPackage, RegulatoryJurisdiction, SavedInitiativeSummary } from '../types'
import { SAMPLE_INITIATIVES, DOMAIN_CATEGORIES, REGULATORY_JURISDICTIONS } from '../utils/constants'
import { getAllSavedInitiatives, deleteInitiativeFromDb } from '../utils/storageUtils'
import { PrdComposer } from './PrdComposer'
import { VoiceAssistantModal } from './VoiceAssistantModal'
import type { ParsedVoiceIntent } from '../services/voiceIntentParser'
import { useSettings } from '../context/SettingsContext'

interface InputWorkspaceProps {
  input: RequirementInput
  onChange: (input: RequirementInput) => void
  onSynthesize: (forceDemo?: boolean) => void
  onInterrogate: (forceDemo?: boolean) => void
  onImportManifest?: (importedPkg: SddArtifactPackage, importedInput?: Partial<RequirementInput>) => void
  isLoading: boolean
  isPreparingInterrogation?: boolean
  hasOutput: boolean
}

const DEPTHS: { value: TargetDepth; label: string; desc: string }[] = [
  { value: 'MVP / Fast-Track', label: 'MVP / Fast-Track', desc: 'Rapid velocity, core happy paths, essential security guards' },
  { value: 'Standard Agile Sprint', label: 'Standard Enterprise Sprint', desc: 'Full edge cases, balanced contracts, regression test graph' },
  { value: 'Mission-Critical / Enterprise', label: 'Mission-Critical Invariants', desc: 'Maximum rigor, strict audit invariants, zero-trust constraints' }
]

export const InputWorkspace: React.FC<InputWorkspaceProps> = ({
  input,
  onChange,
  onSynthesize,
  onInterrogate,
  onImportManifest,
  isLoading,
  isPreparingInterrogation = false,
  hasOutput
}) => {
  const { isConfigured } = useSettings()

  // File Rehydration State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  // Persistent Initiative Library (IndexedDB) State
  const [savedInitiatives, setSavedInitiatives] = useState<SavedInitiativeSummary[]>([])
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false)
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)

  const refreshSavedList = async () => {
    setIsLoadingSaved(true)
    try {
      const list = await getAllSavedInitiatives()
      setSavedInitiatives(list)
    } finally {
      setIsLoadingSaved(false)
    }
  }

  useEffect(() => {
    refreshSavedList()
  }, [])

  const handleLoadSaved = (saved: SavedInitiativeSummary) => {
    if (onImportManifest) {
      onImportManifest(saved.manifestData, {
        requirement: saved.manifestData.originalPrompt,
        domain: saved.manifestData.domain,
        targetDepth: saved.manifestData.targetDepth,
        jurisdiction: saved.manifestData.jurisdiction
      })
      setImportSuccess(`Loaded "${saved.title}" successfully from browser storage!`)
      setTimeout(() => setImportSuccess(null), 5000)
    }
    setIsSavedDrawerOpen(false)
  }

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteInitiativeFromDb(id)
    await refreshSavedList()
  }

  // Voice Assistant Modal & Feedback Toast State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [voiceToast, setVoiceToast] = useState<string | null>(null)

  // Domain Selection State: Categorized & Custom
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(0)
  const [isCustomDomain, setIsCustomDomain] = useState<boolean>(false)
  const [customDomainText, setCustomDomainText] = useState<string>('')
  const [isBrownfieldOpen, setIsBrownfieldOpen] = useState<boolean>(false)

  // Lifted PRD Composer State (Shared between manual Composer & Voice Co-Pilot)
  const [archetypes, setArchetypes] = useState<ComposerItem[]>([
    { id: 'arch-1', label: 'Event-Driven Microservices (Kafka / RabbitMQ / SQS)', reason: 'Decoupled asynchronous ledger processing' }
  ])
  const [capabilities, setCapabilities] = useState<ComposerItem[]>([
    { id: 'cap-1', label: 'Financial Double-Entry Ledger & Currency Settlement', reason: 'Zero floating-point balance consistency' }
  ])
  const [personas, setPersonas] = useState<ComposerItem[]>([
    { id: 'per-1', label: 'Enterprise IT Administrator / Security Officer', reason: 'Enforce dual-custody authorization' }
  ])
  const [invariants, setInvariants] = useState<ComposerItem[]>([
    { id: 'inv-1', label: 'Strict Idempotency Keys (Zero Duplicate Execution)', reason: 'Protect against network retry replays' }
  ])

  const handleSelectSample = (sample: typeof SAMPLE_INITIATIVES[0]) => {
    setIsCustomDomain(false)
    onChange({
      requirement: sample.prompt,
      domain: sample.domain,
      targetDepth: sample.targetDepth
    })
  }

  const handleApplyComposedBrief = (briefText: string) => {
    onChange({
      ...input,
      requirement: briefText
    })

    // Smoothly scroll down to the prompt textarea
    setTimeout(() => {
      const el = document.getElementById('requirement-input')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
    }, 100)
  }

  const handleApplyVoiceIntent = (intent: ParsedVoiceIntent) => {
    // 1. Update PRD Composer Items
    if (intent.archetypes.length > 0) setArchetypes(intent.archetypes)
    if (intent.capabilities.length > 0) setCapabilities(intent.capabilities)
    if (intent.personas.length > 0) setPersonas(intent.personas)
    if (intent.invariants.length > 0) setInvariants(intent.invariants)

    // 2. Update Domain
    if (intent.isCustomDomain) {
      setIsCustomDomain(true)
      setCustomDomainText(intent.detectedDomain)
    } else {
      setIsCustomDomain(false)
      // Check if domain matches any category
      const catIdx = DOMAIN_CATEGORIES.findIndex(cat =>
        cat.subdomains.some(sub => intent.detectedDomain.includes(sub.name))
      )
      if (catIdx !== -1) {
        setSelectedCategoryIdx(catIdx)
      }
    }

    // 3. Update Input (Prompt, Domain, Target Depth)
    onChange({
      requirement: intent.composedBrief,
      domain: intent.detectedDomain,
      targetDepth: intent.detectedDepth
    })

    // 4. Trigger Toast and Scroll
    setVoiceToast(intent.summaryExplanation)
    setTimeout(() => setVoiceToast(null), 6000)

    setTimeout(() => {
      const el = document.getElementById('requirement-input')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)
  }

  const handleSelectSubdomain = (domainString: string) => {
    setIsCustomDomain(false)
    onChange({
      ...input,
      domain: domainString
    })
  }

  const handleCustomDomainChange = (text: string) => {
    setCustomDomainText(text)
    onChange({
      ...input,
      domain: text.trim() || 'Custom Enterprise Domain'
    })
  }

  const activeCategory = DOMAIN_CATEGORIES[selectedCategoryIdx]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setImportError('Invalid file format. Please upload a valid .json file (e.g. sdd-manifest.json).')
      setTimeout(() => setImportError(null), 5000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        if (!text || !text.trim()) {
          throw new Error('The selected JSON file is empty.')
        }

        const data = JSON.parse(text)

        // Strict verification of SpecGlow SDD Package structure
        let pkg: SddArtifactPackage | null = null
        let reqInput: Partial<RequirementInput> | undefined = undefined

        if (data.initiative && data.initiative.constitution && data.initiative.functionalSpec) {
          pkg = data.initiative as SddArtifactPackage
          reqInput = data.requirementInput
        } else if (data.constitution && data.functionalSpec && data.taskGraph) {
          pkg = data as SddArtifactPackage
        }

        if (!pkg || !pkg.constitution || !pkg.functionalSpec) {
          throw new Error('File is missing mandatory SpecGlow SDD components (constitution, functional spec, or task graph).')
        }

        // Invoke rehydration callback in memory (BYOK zero backend preservation)
        if (onImportManifest) {
          onImportManifest(pkg, reqInput)
        }

        setImportSuccess(`Project State Restored Successfully: "${pkg.title}"`)
        setImportError(null)
        setTimeout(() => setImportSuccess(null), 5000)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not parse JSON file.'
        setImportError(`Rehydration Failed: ${message}`)
        setImportSuccess(null)
        setTimeout(() => setImportError(null), 6000)
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    reader.onerror = () => {
      setImportError('Failed to read the local file from disk.')
      setTimeout(() => setImportError(null), 5000)
    }

    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Workflow Step 1 Header Banner with Voice Co-Pilot Trigger & Rehydration Import */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-cyan-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
            1
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
              STEP 1: Choose Your Requirement Input Path (1A, 1B, or 1C)
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Pick a pre-built enterprise initiative, build with the interactive composer, or directly paste your raw PRD.
            </p>
          </div>
        </div>

        {/* Global Actions: Import SDD Manifest & Voice Co-Pilot */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Import sdd-manifest.json Button */}
          <button
            type="button"
            id="import-manifest-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-300 dark:border-zinc-700 bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-xs cursor-pointer group"
            title="Rehydrate / Import an existing sdd-manifest.json directly into app state"
          >
            <Upload className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
            <span>Import SDD Manifest</span>
          </button>

          {/* Saved Initiatives (IndexedDB) Button */}
          <button
            type="button"
            id="saved-initiatives-btn"
            onClick={() => {
              refreshSavedList()
              setIsSavedDrawerOpen(true)
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-300 dark:border-zinc-700 bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-xs cursor-pointer group"
            title="Browse and load saved initiatives from your local browser IndexedDB"
          >
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span>Saved Initiatives</span>
            {savedInitiatives.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {savedInitiatives.length}
              </span>
            )}
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Global Talk to AI / Voice Co-Pilot Button */}
          <button
            type="button"
            id="talk-to-ai-btn"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white cursor-pointer group shrink-0"
          >
            <div className="relative">
              <Mic className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <span>🎙️ Talk to AI / Voice Co-Pilot</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          </button>
        </div>
      </div>

      {/* Import Error Feedback Banner */}
      {importError && (
        <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{importError}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportError(null)}
            className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer ml-3 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Import Success Feedback Banner */}
      {importSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{importSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportSuccess(null)}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer ml-3 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Voice Auto-Configuration Success Toast */}
      {voiceToast && (
        <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{voiceToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceToast(null)}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer ml-3 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1A. Sample Initiatives Row */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
              1A
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
              PATH 1A: 1-Click Enterprise Sample Initiatives
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            Click to auto-populate PRD & requirements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {SAMPLE_INITIATIVES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-left p-3 rounded-lg border transition-all duration-200 hover:scale-[1.01] bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-cyan-500 text-slate-800 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 dark:border-zinc-800 dark:hover:border-cyan-500 dark:text-zinc-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  {sample.badge}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">Preset #{idx + 1}</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                {sample.title}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 mt-1">
                {sample.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 1B. Interactive PRD & Feature Composer (Supports Voice Co-Pilot Items) */}
      <PrdComposer
        onApplyBrief={handleApplyComposedBrief}
        archetypes={archetypes}
        setArchetypes={setArchetypes}
        capabilities={capabilities}
        setCapabilities={setCapabilities}
        personas={personas}
        setPersonas={setPersonas}
        invariants={invariants}
        setInvariants={setInvariants}
      />

      {/* 1C & Step 2 Workspace Container */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-6">
        {/* 1C. Direct Textarea Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="requirement-input" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                1C
              </span>
              <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>PATH 1C: Feature Brief, Epic Goal, or Raw PRD</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 dark:text-cyan-300 dark:bg-cyan-950/60 dark:hover:bg-cyan-900 dark:border-cyan-800 transition-colors cursor-pointer"
              >
                <Mic className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>Dictate Brief</span>
              </button>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                {input.requirement.length} characters
              </span>
            </div>
          </div>

          <textarea
            id="requirement-input"
            rows={7}
            value={input.requirement}
            onChange={e => onChange({ ...input, requirement: e.target.value })}
            placeholder="Paste your raw feature requirements or compose via Path 1B above. SpecGlow SDD Studio will synthesize a complete Project Constitution, Contract Spec, Agent Task Graph, and Delivery Risk Matrix..."
            className="w-full px-4 py-3 text-sm rounded-lg border transition-colors font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 leading-relaxed"
          />

          {/* Brownfield Project Assets & Existing Schemas (Collapsible Accordion) */}
          <div className="mt-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsBrownfieldOpen(!isBrownfieldOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Existing Project Context / Brownfield Assets (Optional)
                </span>
                {input.brownfieldAssets?.trim() ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Active Context ({input.brownfieldAssets.length} chars)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800">
                    Greenfield Default
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span className="text-[11px] font-medium hidden sm:inline">
                  {isBrownfieldOpen ? 'Collapse' : 'Expand Context'}
                </span>
                {isBrownfieldOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isBrownfieldOpen && (
              <div className="p-3.5 border-t border-slate-200 dark:border-zinc-800 space-y-2.5 bg-white dark:bg-zinc-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Paste existing schemas (<code className="text-amber-600 dark:text-amber-400">schema.prisma</code>, SQL DDL), <code className="text-amber-600 dark:text-amber-400">package.json</code>, or legacy API routing code. The AI will preserve your models and stack rather than hallucinating new ones.
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onChange({
                        ...input,
                        brownfieldAssets: `// Existing Prisma Schema & Stack Context\nmodel User {\n  id        String   @id @default(uuid())\n  email     String   @unique\n  role      String   @default("member")\n  wallets   Wallet[]\n  createdAt DateTime @default(now())\n}\n\nmodel Wallet {\n  id        String   @id @default(uuid())\n  userId    String\n  user      User     @relation(fields: [userId], references: [id])\n  balance   Decimal  @default(0.00)\n  currency  String   @default("USD")\n}`
                      })}
                      className="px-2 py-1 rounded text-[11px] font-semibold border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 cursor-pointer flex items-center gap-1"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>Sample Prisma</span>
                    </button>
                    {input.brownfieldAssets?.trim() && (
                      <button
                        type="button"
                        onClick={() => onChange({ ...input, brownfieldAssets: '' })}
                        className="px-2 py-1 rounded text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={input.brownfieldAssets || ''}
                  onChange={e => onChange({ ...input, brownfieldAssets: e.target.value })}
                  placeholder={`// Paste existing schemas or dependencies:\n// Example:\n// - schema.prisma\n// - SQL DDL (CREATE TABLE ...)\n// - package.json dependencies\n// - Existing Express/FastAPI routes`}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Categorized Domain & Delivery Rigor */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              2
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                STEP 2: Configure Industry Domain Taxonomy & Delivery Rigor
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Align the synthesis engine with your regulatory framework and architectural depth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-1">
            {/* 1. Categorized Domain Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Domain & Compliance</span>
                </label>

                {/* Toggle Custom Domain Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDomain(!isCustomDomain)
                    if (!isCustomDomain) {
                      onChange({ ...input, domain: customDomainText.trim() || 'Custom Enterprise Domain' })
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    isCustomDomain
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom</span>
                </button>
              </div>

              {isCustomDomain ? (
                <div className="p-3 rounded-lg border border-cyan-400/50 bg-cyan-50/40 dark:bg-cyan-950/20 space-y-2">
                  <label className="text-[11px] font-bold text-cyan-900 dark:text-cyan-300 block">
                    Custom Industry Domain & Mandate:
                  </label>
                  <input
                    type="text"
                    value={customDomainText}
                    onChange={e => handleCustomDomainChange(e.target.value)}
                    placeholder="e.g. GovTech (FedRAMP High)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border font-medium bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Active: <strong className="text-slate-800 dark:text-zinc-200">{input.domain}</strong>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Major Category Selector Dropdown */}
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                    <select
                      value={selectedCategoryIdx}
                      onChange={e => setSelectedCategoryIdx(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border font-semibold bg-slate-50 dark:bg-zinc-950 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                    >
                      {DOMAIN_CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={idx}>
                          {cat.icon} {cat.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subdomains / Frameworks for the Active Category */}
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {activeCategory.subdomains.map(sub => {
                      const isSelected = input.domain.includes(sub.name)
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectSubdomain(`${sub.name} (${sub.compliance})`)}
                          className={`p-2 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/10 text-cyan-950 border-cyan-500 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500 ring-1 ring-cyan-500 font-bold'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="font-bold">{sub.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            Standards: {sub.compliance}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Target Regulatory & Cybersecurity Jurisdiction (Workstream 2) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Regulatory Jurisdiction</span>
                </label>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  6-Region Matrix
                </span>
              </div>

              <div className="space-y-2">
                <select
                  value={input.jurisdiction || 'Global Baseline (Default)'}
                  onChange={e => onChange({ ...input, jurisdiction: e.target.value as RegulatoryJurisdiction })}
                  className="w-full px-3 py-2 text-xs rounded-lg border font-bold bg-slate-50 dark:bg-zinc-950 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                >
                  {REGULATORY_JURISDICTIONS.map(jur => (
                    <option key={jur.id} value={jur.id}>
                      {jur.region}
                    </option>
                  ))}
                </select>

                {(() => {
                  const currentJur = REGULATORY_JURISDICTIONS.find(j => j.id === (input.jurisdiction || 'Global Baseline (Default)')) || REGULATORY_JURISDICTIONS[6]
                  return (
                    <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-900 dark:text-indigo-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{currentJur.frameworks}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {currentJur.keyFocus}
                      </p>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Delivery Rigor & Invariant Depth */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Delivery Rigor & Invariant Depth</span>
              </label>
              <div className="space-y-2">
                {DEPTHS.map(dep => (
                  <button
                    key={dep.value}
                    type="button"
                    onClick={() => onChange({ ...input, targetDepth: dep.value })}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs border transition-all text-left cursor-pointer ${
                      input.targetDepth === dep.value
                        ? 'bg-indigo-500/10 text-indigo-950 border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{dep.label}</span>
                      <p className="text-[11px] opacity-80 mt-0.5">{dep.desc}</p>
                    </div>
                    {input.targetDepth === dep.value && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: CTA Actions Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2">
            {!isConfigured ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                ⚡ Demo mode ready (or connect your API key in Settings)
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Connected (BYOK Active)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {!isConfigured && (
              <button
                type="button"
                onClick={() => onSynthesize(true)}
                disabled={isLoading || isPreparingInterrogation}
                className="px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 cursor-pointer"
              >
                Instant Offline Demo
              </button>
            )}

            {/* Direct Quick Synthesize */}
            <button
              type="button"
              onClick={() => onSynthesize(false)}
              disabled={isLoading || isPreparingInterrogation || !input.requirement.trim()}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all bg-white hover:bg-slate-50 border-slate-300 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 cursor-pointer"
              title="Synthesize immediately using default architectural assumptions"
            >
              <span>Quick Synthesize</span>
            </button>

            {/* Architectural Interrogation 'Grill-Me' Primary CTA */}
            <button
              type="button"
              id="synthesize-cta-button"
              onClick={() => onInterrogate(false)}
              disabled={isLoading || isPreparingInterrogation || !input.requirement.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-600 via-indigo-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white shadow-cyan-500/20 cursor-pointer"
              title="Launch interactive discovery to challenge trade-offs and enforce non-negotiable invariants"
            >
              {isPreparingInterrogation ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Interrogation...</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Contracts...</span>
                </>
              ) : (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    RECOMMENDED
                  </span>
                  <ShieldAlert className="w-4 h-4" />
                  <span>{hasOutput ? 'Re-Interrogate & Synthesize' : 'Interrogate Architecture ("Grill-Me")'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Co-Pilot & Audio Dictation Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyIntent={handleApplyVoiceIntent}
      />

      {/* Persistent Initiative Library (IndexedDB) Modal */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Saved Initiatives Library</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {savedInitiatives.length} Saved
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Stored 100% locally in browser IndexedDB • Zero backend telemetry
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSavedDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Body */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {isLoadingSaved ? (
                <div className="py-12 text-center text-slate-500 dark:text-zinc-400 text-xs">
                  Loading saved initiatives...
                </div>
              ) : savedInitiatives.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Database className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    No Saved Initiatives Found
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto">
                    Whenever you synthesize an initiative or import a manifest, SpecGlow SDD Studio automatically saves a local snapshot in your browser.
                  </p>
                </div>
              ) : (
                savedInitiatives.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadSaved(item)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-slate-100/80 dark:bg-zinc-950 dark:hover:bg-zinc-800/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                          {item.domain}
                        </span>
                        {item.jurisdiction && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {item.jurisdiction}
                          </span>
                        )}
                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                        {item.manifestData?.originalPrompt || item.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLoadSaved(item)
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete initiative"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Auto-saved to client IndexedDB</span>
              <button
                type="button"
                onClick={() => setIsSavedDrawerOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
