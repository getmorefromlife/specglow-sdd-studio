import React, { useState } from 'react'
import {
  FileText,
  Code2,
  GitBranch,
  BarChart3,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Clock,
  Sparkles,
  Archive,
  Layers,
  Terminal,
  FileSpreadsheet,
  Cpu,
  FileCode,
  FlaskConical
} from 'lucide-react'
import type { SddArtifactPackage } from '../types'
import { MermaidViewer } from './MermaidViewer'
import { DeliverySimulator } from './DeliverySimulator'
import {
  generateConstitutionMarkdown,
  generateSpecMarkdown,
  generateTasksMarkdown,
  generateGovernanceMarkdown,
  generateFullPackageMarkdown,
  generateJiraEpicMarkdown,
  downloadSddZipBundle,
  downloadSddJsonBundle,
  generateClaudeMd,
  generateAgentsMd,
  generateCursorRules,
  generateJiraCsv,
  generateAzureDevOpsCsv,
  generateGitHubIssueScript,
  generateOpenApiYaml,
  generateOpenApiJson,
  generateAcceptanceTestHarness,
  generateGitHubWorkflow,
  generateSecurityAttestation,
  generateSpecGlowMcpConfig,
  generateClaudeMcpCommand,
  generateStandaloneMcpServer,
  downloadMcpServer,
  downloadEnvExample,
  downloadFile
} from '../utils/exportUtils'

interface SpecificationViewerProps {
  packageData: SddArtifactPackage
}

type TabKey = 'constitution' | 'spec' | 'tasks' | 'governance' | 'diagrams' | 'contracts'

export const SpecificationViewer: React.FC<SpecificationViewerProps> = ({ packageData }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('constitution')
  const [contractSubTab, setContractSubTab] = useState<'openapi' | 'tests' | 'mcp'>('openapi')
  const [copiedAction, setCopiedAction] = useState<string | null>(null)

  const handleCopy = (text: string, actionName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAction(actionName)
    setTimeout(() => setCopiedAction(null), 2500)
  }

  const safeFilename = packageData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="space-y-6">
      {/* Top Metadata & Action Toolbar */}
      <div className="bg-white dark:bg-zinc-900/95 border border-slate-200/70 dark:border-zinc-800 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-cyan-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
                STEP 4: AUDIT 4-PILLAR & ARCHITECTURE ARTIFACTS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                {packageData.domain}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                {packageData.targetDepth}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Created: {new Date(packageData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {packageData.title}
            </h2>
          </div>

          {/* Quick Metrics Header Pills */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
            <div className="px-3.5 py-1.5 rounded-lg border bg-slate-50/80 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Story Points</div>
              <div className="text-base font-extrabold text-cyan-700 dark:text-cyan-400">
                {packageData.governance.forecasting.totalStoryPoints} pts
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg border bg-slate-50/80 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Agent Cycle</div>
              <div className="text-base font-extrabold text-indigo-700 dark:text-indigo-400">
                ~{packageData.taskGraph.totalEstimatedAgentMinutes}m
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg border bg-slate-50/80 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Confidence</div>
              <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {packageData.governance.forecasting.velocityConfidenceScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Global Export Actions Toolbar (Step 5) */}
        <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Core & Agent Exports */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mr-1">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-[11px] flex items-center justify-center">
                  5
                </span>
                <span>STEP 5 EXPORTS:</span>
              </span>

              {/* Full Markdown */}
              <button
                onClick={() => handleCopy(generateFullPackageMarkdown(packageData), 'full')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                {copiedAction === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAction === 'full' ? 'Full Spec Copied!' : 'Copy Full Spec'}</span>
              </button>

              {/* CLAUDE.md */}
              <button
                onClick={() => handleCopy(generateClaudeMd(packageData), 'claude')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:border-amber-800 dark:text-amber-200"
                title="Copy instructions tailored for Anthropic's Claude Code CLI"
              >
                {copiedAction === 'claude' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                <span>{copiedAction === 'claude' ? 'CLAUDE.md Copied!' : 'Copy CLAUDE.md'}</span>
              </button>

              {/* AGENTS.md */}
              <button
                onClick={() => handleCopy(generateAgentsMd(packageData), 'agents')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-900 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:border-purple-800 dark:text-purple-200"
                title="Copy universal instructions for autonomous AI coding agents"
              >
                {copiedAction === 'agents' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                <span>{copiedAction === 'agents' ? 'AGENTS.md Copied!' : 'Copy AGENTS.md'}</span>
              </button>

              {/* .cursorrules */}
              <button
                onClick={() => handleCopy(generateCursorRules(packageData), 'cursor')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                title="Copy rules for Cursor IDE & Windsurf"
              >
                {copiedAction === 'cursor' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
                <span>{copiedAction === 'cursor' ? '.cursorrules Copied!' : 'Copy .cursorrules'}</span>
              </button>

              {/* Jira Epic Format */}
              <button
                onClick={() => handleCopy(generateJiraEpicMarkdown(packageData), 'jira-epic')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                title="Copy Jira Epic and Stories in Jira markup format"
              >
                {copiedAction === 'jira-epic' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <GitBranch className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                <span>{copiedAction === 'jira-epic' ? 'Jira Epic Copied!' : 'Copy Jira Epic'}</span>
              </button>

              {/* Jira CSV Download */}
              <button
                onClick={() => downloadFile(`${safeFilename}-jira-tasks.csv`, generateJiraCsv(packageData), 'text/csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:border-blue-800 dark:text-blue-200"
                title="Download CSV formatted for 1-click Jira / Linear bulk issue import"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Export Jira CSV</span>
              </button>

              {/* Azure DevOps CSV Download */}
              <button
                onClick={() => downloadFile(`${safeFilename}-ado-work-items.csv`, generateAzureDevOpsCsv(packageData), 'text/csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-900 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 dark:border-sky-800 dark:text-sky-200"
                title="Download CSV strictly formatted for Microsoft Azure DevOps Boards Work Item import"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Export ADO CSV</span>
              </button>


              {/* GitHub CLI Script Download */}
              <button
                onClick={() => downloadFile(`import-tasks-${safeFilename}.sh`, generateGitHubIssueScript(packageData), 'application/x-sh')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:border-emerald-800 dark:text-emerald-200"
                title="Download bash script to create GitHub issues automatically with gh CLI"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>GitHub CLI Script</span>
              </button>

              {/* OpenAPI 3.1 YAML Download */}
              <button
                onClick={() => downloadFile(`${safeFilename}-openapi.yaml`, generateOpenApiYaml(packageData), 'text/yaml')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:border-amber-800 dark:text-amber-200"
                title="Download machine-valid OpenAPI 3.1 YAML specification"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>OpenAPI 3.1</span>
              </button>

              {/* Vitest / Playwright Acceptance Test Harness */}
              <button
                onClick={() => downloadFile(`acceptance-${safeFilename}.spec.ts`, generateAcceptanceTestHarness(packageData), 'text/typescript')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-900 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:border-purple-800 dark:text-purple-200"
                title="Download executable TypeScript acceptance test suite (Vitest/Playwright)"
              >
                <FlaskConical className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Test Harness</span>
              </button>

              {/* CI Guardrail YAML Download */}
              <button
                onClick={() => downloadFile('sdd-verify.yml', generateGitHubWorkflow(packageData), 'text/yaml')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                title="Download GitHub Actions workflow (.github/workflows/sdd-verify.yml) to gate PRs against constitution invariants"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>CI Guardrail</span>
              </button>

              {/* Security Attestation Download (Workstream 4) */}
              <button
                onClick={() => downloadFile(`${safeFilename}-SECURITY-ATTESTATION.md`, generateSecurityAttestation(packageData), 'text/markdown')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:border-emerald-800 dark:text-emerald-200"
                title="Download formal Client Security & Architecture Attestation (SECURITY-ATTESTATION.md)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Security Attestation (.md)</span>
              </button>

              {/* MCP Server Config Download */}
              <button
                onClick={() => downloadFile('specglow-mcp.json', generateSpecGlowMcpConfig(packageData), 'application/json')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-indigo-50 hover:bg-indigo-100 border-indigo-300 text-indigo-900 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:border-indigo-800 dark:text-indigo-200"
                title="Download Model Context Protocol (MCP) server configuration for Cursor / Claude Code"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>MCP Config</span>
              </button>

              {/* Standalone MCP Server Download */}
              <button
                onClick={() => downloadMcpServer(packageData)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-900 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:border-purple-800 dark:text-purple-200"
                title="Download zero-dependency runnable Node.js MCP server (mcp-server.js)"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>mcp-server.js</span>
              </button>

              {/* .env.example Download */}
              <button
                onClick={() => downloadEnvExample(packageData)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 dark:border-teal-800 dark:text-teal-200"
                title="Download complete production & staging environment configuration (.env.example)"
              >
                <FileCode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>.env.example</span>
              </button>
            </div>

            {/* Download SDD Bundle (ZIP) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadSddZipBundle(packageData)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white"
                title="Exports all 10+ files: constitution, spec, tasks, governance, CLAUDE.md, AGENTS.md, .cursorrules, jira-tasks.csv, import-tasks.sh, and manifest"
              >
                <Archive className="w-4 h-4" />
                <span>Download Complete SDD Bundle (.zip)</span>
              </button>

              <button
                onClick={() => downloadSddJsonBundle(packageData)}
                className="p-2 rounded-lg border transition-all bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                title="Download raw JSON package"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Tab SDD Navigation (4 Pillars + Architecture Diagrams) */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('constitution')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'constitution'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>TAB 1: 📜 Project Constitution</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800">constitution.md</span>
        </button>

        <button
          onClick={() => setActiveTab('spec')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'spec'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>TAB 2: ⚙️ Functional & Contract Spec</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800">spec.md</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>TAB 3: 🤖 Agent-Executable Tasks</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800">tasks.md</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'governance'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>TAB 4: 📊 Delivery & Risk Governance</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800">governance.md</span>
        </button>

        <button
          onClick={() => setActiveTab('diagrams')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'diagrams'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>TAB 5: 📐 Visual Architecture</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">Mermaid.js</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>TAB 6: 🧪 Machine Contracts & Tests</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">OpenAPI 3.1 & Vitest</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">

        {/* ============================================================== */}
        {/* TAB 1: 📜 PROJECT CONSTITUTION                                 */}
        {/* ============================================================== */}
        {activeTab === 'constitution' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Project Constitution & Non-Negotiable Invariants</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Establishes hard architectural constraints, security rules, and anti-requirements to prevent AI scope drift.
                </p>
              </div>
              <button
                onClick={() => handleCopy(generateConstitutionMarkdown(packageData), 'constitution-single')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
              >
                {copiedAction === 'constitution-single' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Tab Markdown</span>
              </button>
            </div>

            {/* System Overview */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                System Architectural Blueprint
              </h4>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-zinc-200">
                {packageData.constitution.systemOverview}
              </p>
            </div>

            {/* Technical Constraints */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3">
                Technical Constraints & Invariants
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                    <tr>
                      <th className="py-2.5 px-3.5 font-bold">Category</th>
                      <th className="py-2.5 px-3.5 font-bold">Non-Negotiable Rule</th>
                      <th className="py-2.5 px-3.5 font-bold">Engineering Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-slate-800 dark:text-zinc-200">
                    {packageData.constitution.technicalConstraints.map((tc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-950/50">
                        <td className="py-2.5 px-3.5 font-semibold text-cyan-700 dark:text-cyan-400 whitespace-nowrap">
                          {tc.category}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium">{tc.rule}</td>
                        <td className="py-2.5 px-3.5 text-slate-600 dark:text-zinc-400">{tc.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security Invariants */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3">
                Security & Compliance Invariants
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packageData.constitution.securityInvariants.map(si => (
                  <div key={si.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {si.id} • {si.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 mb-1">
                      {si.invariant}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      <strong>Enforcement:</strong> {si.enforcementMechanism}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explicit Anti-Requirements */}
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Explicit Anti-Requirements (Strictly OUT OF SCOPE)</span>
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300/80 mb-3">
                Autonomous coding agents and engineers are strictly barred from building the following features:
              </p>
              <div className="space-y-2">
                {packageData.constitution.antiRequirements.map(ar => (
                  <div key={ar.id} className="text-xs text-rose-900 dark:text-rose-200">
                    <span className="font-bold underline">[{ar.id}] {ar.item}:</span>{' '}
                    <span>{ar.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ⚙️ FUNCTIONAL & CONTRACT SPEC                           */}
        {/* ============================================================== */}
        {activeTab === 'spec' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Functional Specification & Interface Contracts</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  User journeys, deterministic state transitions, API schemas, and Gherkin acceptance criteria.
                </p>
              </div>
              <button
                onClick={() => handleCopy(generateSpecMarkdown(packageData), 'spec-single')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
              >
                {copiedAction === 'spec-single' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Tab Markdown</span>
              </button>
            </div>

            {/* User Journeys */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                User Journeys & Actor Flows
              </h4>
              {packageData.functionalSpec.userJourneys.map((uj, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">Actor: {uj.actor}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">Goal: {uj.goal}</span>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">Happy Path Steps:</h5>
                    <ol className="list-decimal list-inside text-xs text-slate-800 dark:text-zinc-300 space-y-1">
                      {uj.happyPathSteps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  {uj.edgeCases.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1">Edge Cases & Failure Flows:</h5>
                      <ul className="list-disc list-inside text-xs text-slate-700 dark:text-zinc-300 space-y-0.5">
                        {uj.edgeCases.map((ec, ecIdx) => (
                          <li key={ecIdx}>{ec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* State Transitions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3">
                Deterministic State Transition Table
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                    <tr>
                      <th className="py-2.5 px-3.5 font-bold">Entity</th>
                      <th className="py-2.5 px-3.5 font-bold">Initial State</th>
                      <th className="py-2.5 px-3.5 font-bold">Trigger Event</th>
                      <th className="py-2.5 px-3.5 font-bold">Final State</th>
                      <th className="py-2.5 px-3.5 font-bold">Guard Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-slate-800 dark:text-zinc-200">
                    {packageData.functionalSpec.stateTransitions.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-950/50">
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{st.entity}</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-700 dark:text-amber-400">{st.initialState}</td>
                        <td className="py-2.5 px-3.5 font-medium">{st.triggerEvent}</td>
                        <td className="py-2.5 px-3.5 font-mono text-emerald-700 dark:text-emerald-400">{st.finalState}</td>
                        <td className="py-2.5 px-3.5 text-slate-600 dark:text-zinc-400">{st.guardCondition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Contracts */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Data Models & API Contracts
              </h4>
              <div className="space-y-4">
                {packageData.functionalSpec.apiContracts.map((api, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                          api.method === 'POST' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' :
                          api.method === 'GET' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {api.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {api.endpoint}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-zinc-400">{api.description}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">Request Payload Schema</div>
                        <pre className="p-2.5 rounded bg-slate-900 dark:bg-black text-cyan-300 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                          {api.requestSchema}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">Response Payload Schema</div>
                        <pre className="p-2.5 rounded bg-slate-900 dark:bg-black text-emerald-300 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                          {api.responseSchema}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gherkin Scenarios */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3">
                Gherkin Acceptance Scenarios
              </h4>
              <div className="space-y-3">
                {packageData.functionalSpec.acceptanceCriteria.map(ac => (
                  <div key={ac.id} className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">[{ac.id}] {ac.title}</span>
                      <button
                        onClick={() => handleCopy(ac.fullGherkin, `ac-${ac.id}`)}
                        className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {copiedAction === `ac-${ac.id}` ? 'Copied!' : 'Copy Gherkin'}
                      </button>
                    </div>
                    <pre className="p-3 rounded bg-slate-900 dark:bg-black text-zinc-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                      {ac.fullGherkin}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: 🤖 AGENT-EXECUTABLE TASK GRAPH                          */}
        {/* ============================================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Agent-Executable Task Graph (DAG)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Atomic tasks formatted for autonomous AI coding agents (Claude Code, Antigravity, Cursor, Devin) with strict dependency chains.
                </p>
              </div>
              <button
                onClick={() => handleCopy(generateTasksMarkdown(packageData), 'tasks-single')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
              >
                {copiedAction === 'tasks-single' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy tasks.md</span>
              </button>
            </div>

            {/* Critical Path Header */}
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                  Agent Critical Path Rationale & Sequencing
                </h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  {packageData.taskGraph.criticalPathSummary}
                </p>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-4">
              {packageData.taskGraph.tasks.map(task => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-3 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        #{task.taskNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        [{task.id}] {task.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {task.layer}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                        {task.complexityPoints} pts
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        <Clock className="w-3 h-3" /> ~{task.estimatedAgentMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Dependency Chain */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-zinc-400">Blocked By:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {task.blockedBy.map((blocker, bIdx) => (
                        <span
                          key={bIdx}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            blocker.includes('None')
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {blocker}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Agent Directives */}
                  <div className="text-xs text-slate-800 dark:text-zinc-300 leading-relaxed">
                    {task.description}
                  </div>

                  {/* Target File Paths */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">Target Files:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {task.targetFilePaths.map((fp, fpIdx) => (
                        <code key={fpIdx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200 dark:bg-zinc-900 text-slate-800 dark:text-zinc-300">
                          {fp}
                        </code>
                      ))}
                    </div>
                  </div>

                  {/* Acceptance Test Criteria */}
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Verification Test Command:</span>
                    <pre className="mt-1 p-2 rounded bg-slate-900 dark:bg-black text-emerald-400 text-xs font-mono border border-slate-800">
                      {task.acceptanceTestCriteria}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: 📊 DELIVERY & RISK GOVERNANCE                           */}
        {/* ============================================================== */}
        {activeTab === 'governance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>AI-Native Delivery & Risk Governance</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Forecasting, developer capacity allocation, architectural risk matrix, and executive steering committee report.
                </p>
              </div>
              <button
                onClick={() => handleCopy(generateGovernanceMarkdown(packageData), 'gov-single')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
              >
                {copiedAction === 'gov-single' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Tab Markdown</span>
              </button>
            </div>

            {/* Executive Status Report */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Executive Status Report (Client Steering Committee)</span>
                </h4>
                <button
                  onClick={() => handleCopy(packageData.governance.executiveStatusReport, 'exec-inline')}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedAction === 'exec-inline' ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>
              <p className="text-sm leading-relaxed text-slate-900 dark:text-zinc-100 italic">
                "{packageData.governance.executiveStatusReport}"
              </p>
            </div>

            {/* Capacity & Velocity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                <div className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">Total Story Points</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {packageData.governance.forecasting.totalStoryPoints} pts
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Recommended: {packageData.governance.forecasting.recommendedSprintCount} Sprint(s)
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                <div className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">Velocity Confidence</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {packageData.governance.forecasting.velocityConfidenceScore}%
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  High alignment with invariant rules
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                <div className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">Agent Cycle Time</div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {packageData.taskGraph.totalEstimatedAgentMinutes} mins
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Autonomous completion projection
                </p>
              </div>
            </div>

            {/* Skill Mix */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3">
                Recommended Engineering Skill Mix
              </h4>
              <div className="space-y-2">
                {packageData.governance.forecasting.developerSkillMix.map((mix, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-800 dark:text-zinc-200">
                      <span>{mix.role}</span>
                      <span className="font-bold">{mix.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-600 dark:bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${mix.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Monte Carlo Delivery Simulator & AI Budget Engine */}
            <DeliverySimulator
              totalStoryPoints={packageData.governance.forecasting.totalStoryPoints}
              recommendedSprintCount={packageData.governance.forecasting.recommendedSprintCount}
              totalEstimatedAgentMinutes={packageData.taskGraph.totalEstimatedAgentMinutes}
              taskCount={packageData.taskGraph.tasks.length}
              riskMatrix={packageData.governance.riskMatrix}
              confidenceScore={packageData.governance.forecasting.velocityConfidenceScore}
            />

            {/* Technical Risk Matrix */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3">
                Architecture & Technical Risk Matrix
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                    <tr>
                      <th className="py-2.5 px-3.5 font-bold">Risk ID</th>
                      <th className="py-2.5 px-3.5 font-bold">Category</th>
                      <th className="py-2.5 px-3.5 font-bold">Severity</th>
                      <th className="py-2.5 px-3.5 font-bold">Probability</th>
                      <th className="py-2.5 px-3.5 font-bold">Risk Description</th>
                      <th className="py-2.5 px-3.5 font-bold">Proactive Mitigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-slate-800 dark:text-zinc-200">
                    {packageData.governance.riskMatrix.map(risk => (
                      <tr key={risk.id} className="hover:bg-slate-50 dark:hover:bg-zinc-950/50">
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{risk.id}</td>
                        <td className="py-2.5 px-3.5 font-medium">{risk.category}</td>
                        <td className="py-2.5 px-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            risk.severity === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            risk.severity === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}>
                            {risk.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-medium">{risk.probability}</td>
                        <td className="py-2.5 px-3.5">
                          <p className="font-semibold text-slate-900 dark:text-zinc-100">{risk.risk}</p>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">Impact: {risk.impact}</p>
                        </td>
                        <td className="py-2.5 px-3.5 text-emerald-800 dark:text-emerald-300 font-medium">
                          {risk.mitigation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: 📐 VISUAL ARCHITECTURE (Mermaid.js)                      */}
        {/* ============================================================== */}
        {activeTab === 'diagrams' && (
          <div>
            {packageData.architectureDiagrams ? (
              <MermaidViewer
                diagrams={packageData.architectureDiagrams}
                initiativeTitle={packageData.title}
              />
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-zinc-400">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No architecture diagrams available for this specification.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: 🧪 MACHINE CONTRACTS & TEST HARNESS                      */}
        {/* ============================================================== */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Machine-Executable Contracts & Acceptance Test Harness</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  CI/CD-ready OpenAPI 3.1 specification and executable Vitest/Playwright test suite generated directly from the functional specification.
                </p>
              </div>

              {/* Sub-view toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setContractSubTab('openapi')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    contractSubTab === 'openapi'
                      ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>openapi.yaml</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContractSubTab('tests')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    contractSubTab === 'tests'
                      ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>tests/acceptance.spec.ts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContractSubTab('mcp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    contractSubTab === 'mcp'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>MCP & CI Guardrails</span>
                </button>
              </div>
            </div>

            {/* Sub-tab 1: OpenAPI 3.1 YAML */}
            {contractSubTab === 'openapi' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-600 text-white">
                      OpenAPI 3.1.0
                    </span>
                    <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                      {packageData.functionalSpec.apiContracts.length} Endpoints Normalized with Schema Definitions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(generateOpenApiYaml(packageData), 'openapi-yaml')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                    >
                      {copiedAction === 'openapi-yaml' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAction === 'openapi-yaml' ? 'YAML Copied!' : 'Copy YAML'}</span>
                    </button>
                    <button
                      onClick={() => handleCopy(generateOpenApiJson(packageData), 'openapi-json')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                    >
                      {copiedAction === 'openapi-json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAction === 'openapi-json' ? 'JSON Copied!' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={() => downloadFile(`${safeFilename}-openapi.yaml`, generateOpenApiYaml(packageData), 'text/yaml')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .yaml</span>
                    </button>
                  </div>
                </div>

                <div className="relative rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed">
                  <pre>{generateOpenApiYaml(packageData)}</pre>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Acceptance Test Suite */}
            {contractSubTab === 'tests' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-purple-600 text-white">
                      Vitest & Playwright Ready
                    </span>
                    <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                      {packageData.functionalSpec.acceptanceCriteria.length} BDD Scenarios + {packageData.functionalSpec.apiContracts.length} Contract Assertions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(generateAcceptanceTestHarness(packageData), 'acceptance-suite')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                    >
                      {copiedAction === 'acceptance-suite' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAction === 'acceptance-suite' ? 'Test Suite Copied!' : 'Copy TypeScript'}</span>
                    </button>
                    <button
                      onClick={() => downloadFile(`acceptance-${safeFilename}.spec.ts`, generateAcceptanceTestHarness(packageData), 'text/typescript')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .spec.ts</span>
                    </button>
                  </div>
                </div>

                <div className="relative rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed">
                  <pre>{generateAcceptanceTestHarness(packageData)}</pre>
                </div>
              </div>
            )}

            {/* Sub-tab 3: MCP Server Configuration & CI Guardrail */}
            {contractSubTab === 'mcp' && (
              <div className="space-y-6">
                {/* MCP Server Integration */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-600 text-white">
                        Model Context Protocol (MCP)
                      </span>
                      <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                        Live IDE & Agent Spec Bridge (Cursor, Windsurf, Claude Code)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(generateSpecGlowMcpConfig(packageData), 'mcp-config')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                      >
                        {copiedAction === 'mcp-config' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAction === 'mcp-config' ? 'Config Copied!' : 'Copy specglow-mcp.json'}</span>
                      </button>
                      <button
                        onClick={() => downloadFile('specglow-mcp.json', generateSpecGlowMcpConfig(packageData), 'application/json')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .json</span>
                      </button>
                    </div>
                  </div>

                  {/* Claude Code CLI Snippet Box */}
                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        Claude Code CLI Registration Command:
                      </span>
                      <button
                        onClick={() => handleCopy(generateClaudeMcpCommand(), 'claude-mcp-cmd')}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        {copiedAction === 'claude-mcp-cmd' ? 'Command Copied!' : 'Copy Command'}
                      </button>
                    </div>
                    <pre className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                      <code>{generateClaudeMcpCommand()}</code>
                    </pre>
                  </div>

                  {/* Cursor / Windsurf MCP Config File Preview */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Cursor / Windsurf Configuration (<code className="text-cyan-600 dark:text-cyan-400">.cursor/mcp.json</code>):
                    </div>
                    <div className="relative rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[160px] leading-relaxed">
                      <pre>{generateSpecGlowMcpConfig(packageData)}</pre>
                    </div>
                  </div>

                  {/* Standalone Zero-Dependency MCP Server Script */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Standalone Zero-Dependency MCP Server (<code>mcp-server.js</code>)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Executes natively on Node 18+ via <code>node mcp-server.js</code> without <code>npm install</code>. Implements JSON-RPC 2.0 stdio with baked-in fallback.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(generateStandaloneMcpServer(packageData), 'mcp-server-js')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                        >
                          {copiedAction === 'mcp-server-js' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAction === 'mcp-server-js' ? 'Script Copied!' : 'Copy Script'}</span>
                        </button>
                        <button
                          onClick={() => downloadMcpServer(packageData)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download mcp-server.js</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continuous Spec Invariant Guardrail (GitHub Actions) */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-600 text-white">
                        CI/CD Pull Request Gate
                      </span>
                      <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                        .github/workflows/sdd-verify.yml (Continuous Spec Drift Guardrail)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(generateGitHubWorkflow(packageData), 'github-workflow')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                      >
                        {copiedAction === 'github-workflow' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAction === 'github-workflow' ? 'Workflow Copied!' : 'Copy Workflow YAML'}</span>
                      </button>
                      <button
                        onClick={() => downloadFile('sdd-verify.yml', generateGitHubWorkflow(packageData), 'text/yaml')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .yml</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[350px] leading-relaxed">
                    <pre>{generateGitHubWorkflow(packageData)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

