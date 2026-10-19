import React, { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { Header } from './components/Header'
import { InputWorkspace } from './components/InputWorkspace'
import { SpecificationViewer } from './components/SpecificationViewer'
import { SettingsModal } from './components/SettingsModal'
import { GuideModal } from './components/GuideModal'
import { ArchitecturalInterrogationModal } from './components/ArchitecturalInterrogationModal'
import { synthesizeSddPackage } from './services/aiService'
import { generateInterrogationQuestions } from './services/interrogationService'
import { saveInitiativeToDb } from './utils/storageUtils'
import type { RequirementInput, SddArtifactPackage, ArchitecturalInterrogationQuestion } from './types'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const AppContent: React.FC = () => {
  const { settings } = useSettings()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [importSuccessBanner, setImportSuccessBanner] = useState<string | null>(null)

  // Architectural Interrogation ("Grill-Me" Loop) State
  const [isInterrogationOpen, setIsInterrogationOpen] = useState(false)
  const [interrogationQuestions, setInterrogationQuestions] = useState<ArchitecturalInterrogationQuestion[]>([])
  const [isPreparingInterrogation, setIsPreparingInterrogation] = useState(false)

  const [input, setInput] = useState<RequirementInput>({
    requirement: '',
    domain: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)',
    targetDepth: 'Mission-Critical / Enterprise'
  })

  const [packageData, setPackageData] = useState<SddArtifactPackage | null>(null)

  const handleImportManifest = (importedPkg: SddArtifactPackage, importedInput?: Partial<RequirementInput>) => {
    // 1. Rehydrate complete 6-tab package data into state
    setPackageData(importedPkg)

    // Auto-save snapshot to IndexedDB
    saveInitiativeToDb(importedPkg).catch(err => console.warn('Failed to save imported initiative to IndexedDB:', err))

    // 2. Hydrate input parameters
    if (importedInput) {
      setInput(prev => ({
        ...prev,
        ...importedInput,
        requirement: importedInput.requirement || importedPkg.originalPrompt || prev.requirement,
        domain: importedInput.domain || importedPkg.domain || prev.domain,
        targetDepth: importedInput.targetDepth || importedPkg.targetDepth || prev.targetDepth,
        brownfieldAssets: importedInput.brownfieldAssets !== undefined ? importedInput.brownfieldAssets : (importedPkg.brownfieldAssets || prev.brownfieldAssets)
      }))
    } else {
      setInput(prev => ({
        ...prev,
        domain: importedPkg.domain || prev.domain,
        targetDepth: importedPkg.targetDepth || prev.targetDepth,
        brownfieldAssets: importedPkg.brownfieldAssets || prev.brownfieldAssets,
        requirement: importedPkg.originalPrompt || importedPkg.title || prev.requirement
      }))
    }

    setErrorMessage(null)
    setImportSuccessBanner(`Successfully restored initiative: "${importedPkg.title}" (${importedPkg.domain})`)
    setTimeout(() => setImportSuccessBanner(null), 6000)

    // 3. Scroll smoothly to Specification Viewer
    setTimeout(() => {
      const viewerElement = document.getElementById('sdd-viewer-section')
      if (viewerElement) {
        viewerElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 150)
  }

  const executeSynthesis = async (inputToUse: RequirementInput, forceDemo: boolean = false) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await synthesizeSddPackage(inputToUse, settings, forceDemo)
      setPackageData(result)

      // Auto-save snapshot to IndexedDB (Workstream 5)
      saveInitiativeToDb(result).catch(err => console.warn('Failed to auto-save initiative to IndexedDB:', err))

      // Scroll smoothly down to the specification viewer
      setTimeout(() => {
        const viewerElement = document.getElementById('sdd-viewer-section')
        if (viewerElement) {
          viewerElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to synthesize SDD package.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInterrogation = async (forceDemo: boolean = false) => {
    setIsPreparingInterrogation(true)
    setErrorMessage(null)

    try {
      const questions = await generateInterrogationQuestions(input, settings, forceDemo)
      setInterrogationQuestions(questions)
      setIsInterrogationOpen(true)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate architectural discovery questions.')
    } finally {
      setIsPreparingInterrogation(false)
    }
  }

  const handleConfirmInterrogationAndSynthesize = async (decisions: Record<string, string>) => {
    setIsInterrogationOpen(false)
    const enrichedInput: RequirementInput = {
      ...input,
      architecturalDecisions: decisions
    }
    setInput(enrichedInput)
    await executeSynthesis(enrichedInput, false)
  }

  const handleQuickSynthesizeFromModal = async () => {
    setIsInterrogationOpen(false)
    await executeSynthesis(input, false)
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Rehydration Success Banner */}
        {importSuccessBanner && (
          <div className="p-4 rounded-xl border flex items-start gap-3 bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">Project State Rehydrated</h4>
              <p className="text-xs mt-0.5 font-medium">{importSuccessBanner}</p>
            </div>
            <button
              onClick={() => setImportSuccessBanner(null)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl border flex items-start gap-3 bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">Synthesis Error</h4>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Input Workspace with Steps 1, 2, 3 */}
        <section>
          <InputWorkspace
            input={input}
            onChange={setInput}
            onSynthesize={(forceDemo) => executeSynthesis(input, forceDemo)}
            onInterrogate={handleStartInterrogation}
            onImportManifest={handleImportManifest}
            isLoading={isLoading}
            isPreparingInterrogation={isPreparingInterrogation}
            hasOutput={!!packageData}
          />
        </section>

        {/* Output Specification Viewer with Steps 4 & 5 */}
        {packageData && (
          <section id="sdd-viewer-section" className="scroll-mt-20">
            <SpecificationViewer packageData={packageData} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t transition-colors duration-200 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            SpecGlow SDD Studio • AI-Native Spec-Driven Development & Delivery Governance Engine
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Architected by <span className="font-semibold text-slate-700 dark:text-zinc-300">Syed Imon Rizvi (PMP®, PSM II)</span> • Open-Source for the Global Engineering Community
          </p>
        </div>
      </footer>

      {/* Pre-Synthesis Architectural Interrogation Modal ("Grill-Me" Loop) */}
      <ArchitecturalInterrogationModal
        isOpen={isInterrogationOpen}
        onClose={() => setIsInterrogationOpen(false)}
        initiativeTitle={input.requirement.slice(0, 60) || 'Initiative'}
        domain={input.domain}
        questions={interrogationQuestions}
        onConfirmDecisions={handleConfirmInterrogationAndSynthesize}
        onQuickSynthesize={handleQuickSynthesizeFromModal}
        isSynthesizing={isLoading}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Workflow User Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  )
}


export function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default App
