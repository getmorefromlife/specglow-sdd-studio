import React from 'react'
import {
  X,
  BookOpen,
  ArrowRight
} from 'lucide-react'

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border shadow-2xl transition-all duration-200 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                SpecGlow SDD Studio: End-to-End Workflow Guide
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                5-step engineering playbook from initial concept to agent-executable delivery package
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                STEP 1: Choose Your Requirement Input Path
              </h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed ml-9">
              Eliminate blank canvas paralysis by picking any of the 3 entry paths:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 ml-9 pt-1">
              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  Path 1A: 1-Click Samples
                </span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Click a pre-engineered initiative (FinTech, HealthTech, RAG Pipeline) for instant exploration.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  Path 1B: Interactive Composer
                </span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Select multiple archetypes, engines, and personas with custom reasons, then click <em>Compose Brief</em>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Path 1C: Direct Textarea
                </span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Paste your existing PRD, feature request, meeting transcript, or Jira issue directly into the text box.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  📁 Brownfield Assets (Optional)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Paste existing schemas (<code className="text-amber-600 dark:text-amber-400">schema.prisma</code>, SQL DDL), <code className="text-amber-600 dark:text-amber-400">package.json</code>, or legacy routes.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  🔄 Rehydrate Manifest
                </span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Import an existing <code className="text-purple-600 dark:text-purple-400">sdd-manifest.json</code> to restore all 6 tabs, Monte Carlo forecasts, and diagrams into app state.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                STEP 2: Configure Industry Taxonomy & Delivery Rigor
              </h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed ml-9">
              Anchor the AI engine with real-world regulatory boundaries:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-zinc-400 space-y-1 ml-9">
              <li><strong>Categorized Industry Domains:</strong> Select from Financial Services (PCI-DSS, SOX), Healthcare (HIPAA), Cloud SaaS (SOC-2), GovTech (FedRAMP), and more.</li>
              <li><strong>➕ Custom Domain Input:</strong> Need a niche sector? Click <em>Custom Domain</em> to type any domain (e.g., <em>LegalTech / Privileged Chain of Custody</em> or <em>AgTech / Drone Telemetry</em>).</li>
              <li><strong>Delivery Rigor Depth:</strong> Pick from <em>MVP / Fast-Track</em>, <em>Standard Agile Sprint</em>, or <em>Mission-Critical Enterprise</em>.</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                STEP 3: Architectural Interrogation ("Grill-Me" Loop) & Synthesis
              </h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed ml-9">
              Launch <strong>"Interrogate Architecture ('Grill-Me')"</strong> to challenge technical trade-offs before locking contracts (e.g., PostgreSQL RLS vs. Isolated DB, Asynchronous Event Bus vs. Webhooks). The confirmed decisions are injected directly into the project constitution and task dependencies. You can also click <strong>"Quick Synthesize"</strong> or <strong>"Instant Offline Demo"</strong> to test immediately.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                STEP 4: Audit & Inspect the 4-Pillar SDD Artifacts
              </h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed ml-9">
              Explore the four generated architectural tabs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-9 pt-1">
              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white">TAB 1: 📜 Project Constitution</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                  Technical constraints, security invariants, and explicit anti-requirements (strictly out-of-scope).
                </p>
              </div>

              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white">TAB 2: ⚙️ Functional & Contract Spec</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                  User journeys, deterministic state machine tables, API request/response schemas, and Gherkin scenarios.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white">TAB 3: 🤖 Agent Task Graph (DAG)</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                  Atomic tasks with strict dependency mapping (`Blocked By`) formatted for AI coding agents.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white">TAB 4: 📊 Delivery & Risk Governance (Monte Carlo & AI Budget)</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                  1,000-trial Monte Carlo delivery simulation (P50/P85/P95), frontier model AI token budget calculator, risk matrix, and executive steering committee report.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="font-bold text-xs text-cyan-600 dark:text-cyan-400">TAB 5: 📐 Visual Architecture (Mermaid.js)</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                  Live interactive C4 System Context, E2E Sequence Flows, and Entity Relationship & State Lifecycles with SVG export.
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="font-bold text-xs text-amber-600 dark:text-amber-400">TAB 6: 🧪 Machine Contracts & Tests (OpenAPI 3.1 & Vitest)</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                  Standardized, CI/CD-ready OpenAPI 3.1 YAML contracts and executable TypeScript acceptance test suites (Vitest/Playwright).
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                STEP 5: Agent-Native, Contract & Enterprise Delivery Handoff
              </h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed ml-9">
              Take immediate action with 1-click clipboard and package exports:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-zinc-400 space-y-1 ml-9">
              <li><strong>Agent Directives (CLAUDE.md & .cursorrules):</strong> Direct instruction files for Claude Code, Cursor, Windsurf, and Devin.</li>
              <li><strong>Machine Contracts (openapi.yaml & tests):</strong> Fully typed OpenAPI 3.1 YAML specifications and executable Vitest/Playwright test suites.</li>
              <li><strong>Continuous Spec Invariant Guardrail (.github/workflows/sdd-verify.yml):</strong> Token-budgeted GitHub Actions workflow with noise exclusions to gate PRs against constitution invariants.</li>
              <li><strong>Model Context Protocol (mcp-server.js & specglow-mcp.json):</strong> Zero-dependency standalone Node 18+ MCP stdio server and config bridge for Cursor IDE and Claude Code CLI.</li>
              <li><strong>Enterprise Project Sync (Jira & Azure DevOps CSV):</strong> Native RFC 4180 CSV exports for Jira, Linear, and Microsoft Azure DevOps Boards.</li>
              <li><strong>GitHub CLI Automation (import-tasks.sh):</strong> Executable bash script creating labeled GitHub issues via <code className="text-cyan-600 dark:text-cyan-400">gh issue create</code>.</li>
              <li><strong>Download Complete SDD Bundle (.zip):</strong> In-memory PKZIP archive bundling all 15+ documentation, contract, test suite, agent rules, MCP server, and diagram files.</li>
            </ul>
          </div>
        </div>


        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
          >
            <span>Got It, Let's Build</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
