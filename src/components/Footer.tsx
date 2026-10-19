import React from 'react'
import { Award, ShieldCheck, Layers } from 'lucide-react'
import { GithubIcon } from './icons/GithubIcon'

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Agile & PMP Governance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>PMP® & PSM II Quality Standards</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every specification is modeled on the Project Management Institute (PMI) standards and Professional Scrum Master guidelines to bridge business intent with engineering execution.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>INVEST & BDD Gherkin Rigor</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Eliminates story ambiguity through the INVEST framework (Independent, Negotiable, Valuable, Estimable, Small, Testable) and executable Given-When-Then criteria.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Client-Side BYOK Architecture</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero server middleware. Direct peer-to-peer browser calls to your selected model provider (OpenAI, Groq, DeepSeek, Ollama, OpenRouter).
            </p>
          </div>

        </div>

        {/* Bottom Attribution Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs pt-4 border-t border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">
              AgileSprint AI
            </span>
            <span className="text-zinc-500">•</span>
            <span>
              Architected by <strong className="text-zinc-200">Syed Imon Rizvi (PMP®, PSM II)</strong>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-zinc-400">
              Free & Open Source for the Global IT Community (MIT License)
            </span>
            <a
              href="https://github.com/SyedImonRizvi/AgileSprint-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
