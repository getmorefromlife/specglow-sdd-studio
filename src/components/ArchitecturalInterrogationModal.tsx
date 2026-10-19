import React, { useState } from 'react'
import {
  CheckCircle2,
  ArrowRight,
  Shield,
  X,
  FastForward
} from 'lucide-react'
import type { ArchitecturalInterrogationQuestion } from '../types'

interface ArchitecturalInterrogationModalProps {
  isOpen: boolean
  onClose: () => void
  initiativeTitle: string
  domain: string
  questions: ArchitecturalInterrogationQuestion[]
  onConfirmDecisions: (decisions: Record<string, string>) => void
  onQuickSynthesize: () => void
  isSynthesizing: boolean
}

export const ArchitecturalInterrogationModal: React.FC<ArchitecturalInterrogationModalProps> = ({
  isOpen,
  onClose,
  initiativeTitle,
  domain,
  questions,
  onConfirmDecisions,
  onQuickSynthesize,
  isSynthesizing
}) => {
  // Local state for tracking selections for each question
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const q of questions) {
      initial[q.id] = q.selectedOptionId || q.options.find(o => o.isRecommended)?.id || q.options[0]?.id || ''
    }
    return initial
  })

  if (!isOpen) return null

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }

  const handleConfirm = () => {
    // Build decision map with full label and implication for prompt injection
    const decisionSummary: Record<string, string> = {}
    for (const q of questions) {
      const selectedId = selections[q.id]
      const chosenOption = q.options.find(o => o.id === selectedId) || q.options[0]
      if (chosenOption) {
        decisionSummary[q.category] = `${chosenOption.label} — ${chosenOption.implication}`
      }
    }
    onConfirmDecisions(decisionSummary)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>PRE-SYNTHESIS DISCOVERY</span>
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {domain}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Architectural Interrogation ("Grill-Me" Loop)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Initiative: <strong className="text-slate-800 dark:text-zinc-200">"{initiativeTitle}"</strong>. Confirm these {questions.length} non-negotiable architectural trade-offs to eliminate shallow assumptions and agent hallucinations before locking specification contracts.
            </p>
          </div>


          <button
            onClick={onClose}
            disabled={isSynthesizing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Questions Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30 dark:bg-zinc-950/30">
          {questions.map((q, idx) => {
            const currentSelected = selections[q.id]
            return (
              <div
                key={q.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4 transition-all"
              >
                {/* Question Metadata */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
                      {q.category}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 italic">
                    💡 {q.context}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5">
                  {q.options.map(opt => {
                    const isSelected = currentSelected === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-cyan-50/80 border-cyan-500 text-slate-900 dark:bg-cyan-950/40 dark:border-cyan-400 dark:text-white ring-1 ring-cyan-500/50'
                            : 'bg-slate-50/60 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-zinc-600" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold leading-tight">
                              {opt.label}
                            </span>
                            {opt.isRecommended && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                            {opt.implication}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onQuickSynthesize}
            disabled={isSynthesizing}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg transition-colors order-2 sm:order-1"
            title="Proceed immediately using recommended architectural defaults"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip to Defaults</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSynthesizing}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSynthesizing}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md transition-all disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Contracts...</span>
                </>
              ) : (
                <>
                  <span>Lock Decisions & Synthesize SDD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
