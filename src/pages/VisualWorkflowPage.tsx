import React, { useState, useEffect } from 'react'
import {
  Lightbulb,
  Globe,
  MessageSquareCode,
  Layers,
  Rocket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  Zap,
  Sliders,
  FolderArchive,
  ShieldCheck,
  FileText,
  Terminal,
  Play,
  Building2
} from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { Header } from '../components/Header'
import { HeroSection } from '../components/HeroSection'
import { SettingsModal } from '../components/SettingsModal'
import { GuideModal } from '../components/GuideModal'
import { SpecificationViewer } from '../components/SpecificationViewer'
import { DeliverySimulator } from '../components/DeliverySimulator'
import { synthesizeSddPackage } from '../services/aiService'
import { generateInterrogationQuestions, DOMAIN_FALLBACK_QUESTIONS } from '../services/interrogationService'
import { saveInitiativeToDb } from '../utils/storageUtils'
import { downloadSddZipBundle, downloadSddJsonBundle, downloadMcpServer, downloadFile } from '../utils/exportUtils'
import { generateCursorRules, generateClaudeMd, generateAgentsMd } from '../utils/agentRuleGenerators'
import { generateJiraCsv } from '../utils/taskExportGenerators'
import { DOMAIN_CATEGORIES } from '../utils/constants'
import type {
  RequirementInput,
  SddArtifactPackage,
  ArchitecturalInterrogationQuestion,
  TargetDepth
} from '../types'

interface StarterTemplate {
  id: string
  title: string
  category: string
  domain: string
  targetDepth: TargetDepth
  badge: string
  icon: string
  description: string
  prompt: string
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'fintech-ledger',
    title: 'FinTech Multi-Currency Ledger',
    category: 'FinTech & Banking',
    domain: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'PCI-DSS v4.0 & SOX',
    icon: '💳',
    description: 'Sub-millisecond double-entry ledger with atomic ACID settlements, distributed Redis locks, and immutable audit logs.',
    prompt: 'Design an enterprise-grade multi-currency digital wallet and ledger service. Must feature double-entry accounting invariants, sub-millisecond ACID transaction processing, distributed idempotency locks via Redis, and zero-trust audit journaling compliant with PCI-DSS v4.0 and SOX 404.'
  },
  {
    id: 'core-banking',
    title: 'Core Banking & Real-Time Settlement',
    category: 'FinTech & Banking',
    domain: 'Core Banking & Settlement Rails (ISO 20022, Fedwire, SWIFT)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'ISO 20022 & SWIFT',
    icon: '🏦',
    description: 'High-availability core banking settlement gateway processing ISO 20022 payment messages with dual-site active-active disaster recovery.',
    prompt: 'Architect a high-availability banking settlement gateway implementing ISO 20022 MX message parsing, Fedwire and SWIFT transaction validation, HSM-backed payload signing, and active-active zero-data-loss geo-replication.'
  },
  {
    id: 'insurtech-claims',
    title: 'InsurTech Automated Claims & Actuarial',
    category: 'FinTech & Banking',
    domain: 'InsurTech & Policy Actuarial Engine (NAIC, Solvency II)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'NAIC & Solvency II',
    icon: '📑',
    description: 'Automated insurance claims adjudication engine with ML fraud scoring, policy underwriting rules, and immutable actuarial audit trails.',
    prompt: 'Develop an automated insurance claims intake and adjudication platform. Must support rule-based policy validation, real-time ML fraud anomaly detection, claimant document verification, and a Solvency II compliant immutable actuarial decision trail.'
  },
  {
    id: 'health-telehealth',
    title: 'Healthcare HIPAA Telehealth Portal',
    category: 'Healthcare & Life Sciences',
    domain: 'HealthTech & Telehealth Consultations (HIPAA, HITECH)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'HIPAA & HITECH',
    icon: '🩺',
    description: 'End-to-end encrypted clinical telehealth portal with role-based access, patient EHR sync, and audited video sessions.',
    prompt: 'Architect a HIPAA-compliant telehealth consultation platform for doctors and patients. Must include end-to-end encrypted WebRTC video signaling, FHIR R4 health record exchange, automated session transcript redaction for ePHI, and strict cryptographic audit trails for HITECH compliance.'
  },
  {
    id: 'clinical-ehr',
    title: 'Clinical Trial EHR & FDA 21 CFR',
    category: 'Healthcare & Life Sciences',
    domain: 'EHR / EMR & Clinical Trial Systems (FDA 21 CFR Part 11, HL7 FHIR)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'FDA 21 CFR Part 11',
    icon: '🧬',
    description: 'Electronic health record and clinical trial data capture system enforcing electronic signature non-repudiation and HL7 FHIR interoperability.',
    prompt: 'Build a compliant clinical trial electronic data capture (EDC) system. Enforce FDA 21 CFR Part 11 electronic signatures, audit trail non-repudiation, role-based investigator access, and bi-directional HL7 FHIR patient data synchronization.'
  },
  {
    id: 'ai-agent-engine',
    title: 'Autonomous Multi-Agent Workflow Engine',
    category: 'AI & Autonomous Agents',
    domain: 'Enterprise Cloud & B2B SaaS (SOC 2 Type II, ISO 27001)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'SOC 2 Type II',
    icon: '🤖',
    description: 'Multi-agent LLM orchestrator with human-in-the-loop governance gates, step verification, and tool sandboxing.',
    prompt: 'Build an autonomous multi-agent task orchestrator for enterprise operations. Requires directed acyclic graph (DAG) workflow scheduling, human-in-the-loop approval gates for high-risk actions, strict sandboxed tool execution, and real-time state telemetry with SOC-2 compliant tenant isolation.'
  },
  {
    id: 'multi-tenant-saas',
    title: 'Enterprise Multi-Tenant B2B SaaS',
    category: 'AI & Autonomous Agents',
    domain: 'Multi-Tenant B2B SaaS Platform (SOC-2 Type II, GDPR)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'SOC 2 & Row-Level Security',
    icon: '🏢',
    description: 'Scalable multi-tenant B2B platform with automated tenant provisioning, Postgres Row-Level Security (RLS), and custom domain routing.',
    prompt: 'Architect a multi-tenant enterprise B2B SaaS backend. Requires PostgreSQL row-level security (RLS) tenant isolation, custom tenant domain SSL routing, SAML 2.0 / OIDC single sign-on, and automated per-tenant audit journal replication.'
  },
  {
    id: 'ecommerce-flash',
    title: 'High-Volume Flash Sale Engine',
    category: 'E-Commerce & Retail',
    domain: 'High-Volume Omnichannel E-Commerce (PCI-DSS, CCPA)',
    targetDepth: 'Standard Agile Sprint',
    badge: '50k TPS & Redis Locks',
    icon: '🛍️',
    description: 'Distributed flash-sale inventory reservation engine handling 50,000 checkouts/second without overselling.',
    prompt: 'Develop a high-throughput flash sale checkout engine capable of handling 50,000 concurrent checkout requests per second. Must enforce deterministic Redis inventory reservations, optimistic concurrency control on database writes, and idempotent Stripe webhook reconciliation.'
  },
  {
    id: 'iam-zero-trust',
    title: 'Zero-Trust IAM & Passkey Authentication',
    category: 'Cybersecurity & Zero-Trust',
    domain: 'Identity, SSO & Zero-Trust IAM (NIST SP 800-63B, OIDC)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'NIST 800-63B & FIDO2',
    icon: '🛡️',
    description: 'Zero-trust identity provider featuring passwordless WebAuthn/FIDO2 passkeys, step-up biometric verification, and continuous risk scoring.',
    prompt: 'Design a high-security Zero-Trust Identity and Access Management service. Must feature WebAuthn/FIDO2 passkey passwordless auth, NIST SP 800-63B AAL3 compliance, context-aware continuous risk scoring, and OpenID Connect (OIDC) token federation.'
  },
  {
    id: 'siem-threat-intel',
    title: 'SIEM Threat Intelligence & SOC Orchestrator',
    category: 'Cybersecurity & Zero-Trust',
    domain: 'Identity, SSO & Zero-Trust IAM (NIST SP 800-63B, OIDC)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'MITRE ATT&CK & CIS v8',
    icon: '🔍',
    description: 'High-throughput security event intake pipeline parsing 100k events/sec with automated MITRE ATT&CK correlation and playbook dispatch.',
    prompt: 'Architect a cloud-native SIEM and incident response orchestrator. Must ingest 100,000 Syslog/eBPF telemetry events per second via Kafka, execute real-time Sigma rule evaluations mapped to MITRE ATT&CK tactics, and trigger automated quarantine playbooks.'
  },
  {
    id: 'supply-chain-iot',
    title: 'Global Cold-Chain Logistics & Telemetry',
    category: 'Logistics & Supply Chain',
    domain: 'General Enterprise Baseline (ISO 27001 & OWASP Top 10)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'MQTT TLS & Geo-Fencing',
    icon: '🚢',
    description: 'Real-time container logistics tracker monitoring temperature, humidity, and tamper sensors via MQTT with automated customs clearance.',
    prompt: 'Design a global cold-chain pharmaceutical tracking system. Requires MQTT TLS telemetry ingestion from IoT temperature/GPS sensors, automated geo-fence breach detection, tamper-evident shipment consignment verification, and offline edge buffering.'
  },
  {
    id: 'govtech-portal',
    title: 'GovTech Citizen Portal & FedRAMP',
    category: 'GovTech & Defense',
    domain: 'General Enterprise Baseline (ISO 27001 & OWASP Top 10)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'FedRAMP High & Section 508',
    icon: '🏛️',
    description: 'Public agency digital service portal with WCAG AAA accessibility, citizen identity verification, and FedRAMP High audit controls.',
    prompt: 'Build a secure GovTech citizen portal for public benefits and grant management. Must adhere to FedRAMP High security controls, WCAG 2.1 AAA accessibility, encrypted document vaulting with automated redaction, and strict legislative audit logging.'
  }
]

interface DomainOption {
  id: string
  name: string
  frameworks: string
  icon: string
  color: string
}

const REGULATORY_DOMAINS: DomainOption[] = [
  {
    id: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)',
    name: 'FinTech & Core Banking',
    frameworks: 'PCI-DSS v4.0, SOX, Double-Entry Invariants',
    icon: '💳',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 dark:border-amber-500/40'
  },
  {
    id: 'HealthTech & Telehealth Consultations (HIPAA, HITECH)',
    name: 'Healthcare & Telehealth',
    frameworks: 'HIPAA Security Rule, HITECH, FDA 21 CFR',
    icon: '🩺',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 dark:border-emerald-500/40'
  },
  {
    id: 'Multi-Tenant B2B SaaS Platform (SOC-2 Type II, GDPR)',
    name: 'Enterprise Cloud & B2B SaaS',
    frameworks: 'SOC-2 Type II, ISO 27001, Tenant Row-Level Security',
    icon: '🏢',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 dark:border-cyan-500/40'
  },
  {
    id: 'High-Volume Omnichannel E-Commerce (PCI-DSS, CCPA)',
    name: 'Retail & E-Commerce',
    frameworks: 'PCI-DSS v4.0, CCPA, Idempotency Locks',
    icon: '🛍️',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 dark:border-purple-500/40'
  },
  {
    id: 'Identity, SSO & Zero-Trust IAM (NIST SP 800-63B, OIDC)',
    name: 'Cybersecurity & Zero-Trust IAM',
    frameworks: 'NIST SP 800-63B, FIDO2, OIDC / SAML 2.0',
    icon: '🛡️',
    color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 dark:border-indigo-500/40'
  },
  {
    id: 'General Enterprise Baseline (ISO 27001 & OWASP Top 10)',
    name: 'Global Enterprise Baseline',
    frameworks: 'ISO 27001:2022, OWASP ASVS Level 2, 12-Factor App',
    icon: '🌐',
    color: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30 dark:border-slate-500/40'
  }
]

export const VisualWorkflowPage: React.FC = () => {
  const { settings } = useSettings()

  // Stepper state (1 to 5)
  const [activeStage, setActiveStage] = useState<number>(1)

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  // Input state
  const [input, setInput] = useState<RequirementInput>({
    requirement: '',
    domain: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)',
    targetDepth: 'Mission-Critical / Enterprise',
    companyStructure: 'Single Autonomous Squad (Unified Codebase & Full-Stack Team)',
    brownfieldAssets: ''
  })

  // Architectural Interrogation state (Stage 3)
  const [questions, setQuestions] = useState<ArchitecturalInterrogationQuestion[]>([])
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({})
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false)

  // Package Data (Stage 4 & 5)
  const [packageData, setPackageData] = useState<SddArtifactPackage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [synthesisStepIndex, setSynthesisStepIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)

  // Catalog expansion & category filtering states (Stage 1 & 2)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isCatalogExpanded, setIsCatalogExpanded] = useState<boolean>(false)

  const BLUEPRINT_CATEGORIES = [
    'All',
    'FinTech & Banking',
    'Healthcare & Life Sciences',
    'AI & Autonomous Agents',
    'E-Commerce & Retail',
    'Cybersecurity & Zero-Trust',
    'Logistics & Supply Chain',
    'GovTech & Defense'
  ]

  const loadQuestionsForDomain = React.useCallback(async (_domainString?: string) => {
    setIsQuestionsLoading(true)
    try {
      const qList = await generateInterrogationQuestions(input, settings, true)
      setQuestions(qList)

      // Auto-populate recommended choices
      const initialDecisions: Record<string, string> = {}
      qList.forEach(q => {
        const rec = q.options.find(o => o.isRecommended) || q.options[0]
        if (rec) initialDecisions[q.id] = rec.id
      })
      setSelectedDecisions(initialDecisions)
    } catch {
      // Fallback
      const fallback = DOMAIN_FALLBACK_QUESTIONS.fintech || []
      setQuestions(fallback)
    } finally {
      setIsQuestionsLoading(false)
    }
  }, [input, settings])

  // Load questions when Stage 3 is accessed or domain changes
  useEffect(() => {
    if (activeStage === 3 && questions.length === 0) {
      loadQuestionsForDomain(input.domain)
    }
  }, [activeStage, input.domain, questions.length, loadQuestionsForDomain])

  const handleSelectStarter = (starter: StarterTemplate) => {
    setInput(prev => ({
      ...prev,
      requirement: starter.prompt,
      domain: starter.domain,
      targetDepth: starter.targetDepth
    }))
    // Refresh questions for new domain
    loadQuestionsForDomain(starter.domain)
  }

  const handleAcceptAllRecommended = () => {
    const recommended: Record<string, string> = {}
    questions.forEach(q => {
      const rec = q.options.find(o => o.isRecommended) || q.options[0]
      if (rec) recommended[q.id] = rec.id
    })
    setSelectedDecisions(recommended)
  }

  const executeSynthesis = async (forceDemo: boolean = false) => {
    if (!input.requirement.trim()) {
      setErrorMessage('Please describe your vision in Stage 1 before synthesizing.')
      setActiveStage(1)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSynthesisStepIndex(0)

    // Animated feedback interval
    const interval = setInterval(() => {
      setSynthesisStepIndex(prev => (prev < 4 ? prev + 1 : prev))
    }, 900)

    try {
      const enrichedInput: RequirementInput = {
        ...input,
        architecturalDecisions: selectedDecisions
      }
      const result = await synthesizeSddPackage(enrichedInput, settings, forceDemo)
      setPackageData(result)
      saveInitiativeToDb(result).catch(err => console.warn('Could not cache initiative to IndexedDB:', err))
      setActiveStage(4)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Synthesis encountered an unexpected error.')
    } finally {
      clearInterval(interval)
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPromptId(id)
      setTimeout(() => setCopiedPromptId(null), 2500)
    } catch {
      console.error('Failed to copy to clipboard')
    }
  }

  const SYNTHESIS_STEPS = [
    'Parsing business goals, regulatory invariants, and safety boundaries...',
    'Synthesizing Pillar 1: Constitution & STRIDE Anti-theft Threat Model...',
    'Synthesizing Pillar 2: System Architecture & OpenAPI 3.1 Contracts...',
    'Synthesizing Pillar 3: AI-Executable Phased Implementation Task Graph...',
    'Synthesizing Pillar 4: Monte Carlo Delivery Weather Forecast & Attestation...'
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Application Header (Privacy Strip, Attribution, Active Model & API Status Indicator) */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Guided Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Ambient SpecGlow Hero Section (The Classic Wow Factor) */}
        <HeroSection />

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl border flex items-start gap-3 bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold uppercase tracking-wider">Attention Required</h4>
              <p className="text-sm mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 5-STAGE INTERACTIVE PROGRESS PIPELINE (Large, Clear, High-Contrast) */}
        <section className="bg-white dark:bg-zinc-900/80 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                The Skyscraper Blueprint Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                Move step-by-step through the 5 stages of Spec-Driven Engineering. No guesswork.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {activeStage} of 5 Active</span>
            </div>
          </div>

          {/* Stepper Buttons Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {[
              { id: 1, label: '01. Vision', sub: 'The Raw Idea', icon: Lightbulb, isReady: !!input.requirement },
              { id: 2, label: '02. Boundaries', sub: 'Laws & Rigor', icon: Globe, isReady: !!input.domain },
              { id: 3, label: '03. Interview', sub: 'Architect Dilemmas', icon: MessageSquareCode, isReady: Object.keys(selectedDecisions).length > 0 },
              { id: 4, label: '04. Blueprints', sub: '4-Pillar Suite', icon: Layers, isReady: !!packageData },
              { id: 5, label: '05. Builders', sub: 'Agent Handoff', icon: Rocket, isReady: !!packageData }
            ].map(step => {
              const Icon = step.icon
              const isActive = activeStage === step.id
              const isDone = step.isReady && activeStage > step.id

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStage(step.id)}
                  className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/50 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/30 dark:ring-cyan-400/20 shadow-md'
                      : isDone
                      ? 'bg-slate-50 dark:bg-zinc-800/60 border-slate-300 dark:border-zinc-700 hover:border-cyan-400'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isActive
                          ? 'text-cyan-900 dark:text-cyan-200'
                          : 'text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate font-medium">
                      {step.sub}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* STAGE 1: TELL YOUR VISION (The Raw Business Idea)             */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 1 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 dark:border-amber-500/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl">☕</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-200">
                    Stage 1: Sketching the Skyscraper on a Dinner Napkin
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1">
                    Describe what you want to build in normal, everyday human language. What does it do? Who uses it? What problem does it solve? No technical code or complex jargon needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Input Text Area (Large, Spacious, Legible) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Your Initiative Description</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  {input.requirement.length} characters entered
                </span>
              </div>
              <textarea
                value={input.requirement}
                onChange={e => setInput(prev => ({ ...prev, requirement: e.target.value }))}
                rows={5}
                placeholder="e.g., We need an enterprise digital wallet and multi-currency ledger with sub-millisecond ACID settlement, distributed Redis idempotency locks, and PCI-DSS v4.0 audit logs..."
                className="w-full text-base sm:text-lg leading-relaxed p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
              />
            </div>

            {/* 1-Click Starter Inspirations (Expandable & Categorized) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Or Start With A Battle-Tested Enterprise Blueprint</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCatalogExpanded(!isCatalogExpanded)}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{isCatalogExpanded ? '▲ Collapse to Top 4 Featured' : '▼ Browse All 12+ Industry Blueprints (Filtered)'}</span>
                </button>
              </div>

              {/* Category Filter Pills (Available when expanded or all) */}
              {isCatalogExpanded && (
                <div className="flex flex-wrap items-center gap-1.5 py-1 animate-fade-in">
                  {BLUEPRINT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {(isCatalogExpanded
                  ? (selectedCategory === 'All' ? STARTER_TEMPLATES : STARTER_TEMPLATES.filter(s => s.category === selectedCategory))
                  : STARTER_TEMPLATES.slice(0, 4)
                ).map(starter => (
                  <button
                    key={starter.id}
                    onClick={() => handleSelectStarter(starter)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 hover:border-cyan-400 dark:hover:border-cyan-500 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{starter.icon}</span>
                        <div>
                          <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {starter.title}
                          </h5>
                          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold uppercase tracking-wider">
                            {starter.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
                        {starter.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2">
                      {starter.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Forward Navigation Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end">
              <button
                onClick={() => {
                  if (!input.requirement.trim()) {
                    setErrorMessage('Please type an idea or select one of the blueprints above.')
                    return
                  }
                  setErrorMessage(null)
                  setActiveStage(2)
                }}
                className="px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <span>Next Step: Set The Boundaries & Laws</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 2: SET THE BOUNDARIES (Laws, Regulations & Rigor)       */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 2 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/5 border border-cyan-500/20 dark:border-cyan-500/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl">🏛️</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-cyan-950 dark:text-cyan-200">
                    Stage 2: Selecting City Earthquake Codes & Fire Safety Laws
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1">
                    Just as a skyscraper in Tokyo needs earthquake dampers while one in Miami needs hurricane glass, your software needs exact regulatory boundaries and engineering depth.
                  </p>
                </div>
              </div>
            </div>

            {/* Regulatory Domain Selection */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>Select Target Industry & Legal Framework</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {REGULATORY_DOMAINS.map(dom => {
                  const isSelected = input.domain === dom.id
                  return (
                    <button
                      key={dom.id}
                      onClick={() => setInput(prev => ({ ...prev, domain: dom.id }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-sm'
                          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{dom.icon}</span>
                        <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {dom.name}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                        {dom.frameworks}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* 16+ Specialized Regulatory Sub-Framework Selector */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Looking for a Hyper-Specific Industry Sub-Regime? (16+ Frameworks)</span>
                  </label>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit">
                    Full Compliance Taxonomy
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Directly enforce specialized mandates: FDA 21 CFR clinical data, SBP/SAMA central banking, FedRAMP High, ISO 13485 MedTech, or ISO 20022 settlement rails.
                </p>
                <select
                  value={input.domain}
                  onChange={e => setInput(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-inner"
                >
                  {DOMAIN_CATEGORIES.map(cat => (
                    <optgroup key={cat.category} label={`${cat.icon} ${cat.category}`}>
                      {cat.subdomains.map(sub => (
                        <option key={sub.id} value={`${sub.name} (${sub.compliance})`}>
                          {sub.name} — [{sub.compliance}]
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Depth & Rigor */}
            <div className="space-y-3 pt-2">
              <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Delivery Rigor & Engineering Depth</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  {
                    id: 'Mission-Critical / Enterprise' as TargetDepth,
                    title: 'Mission-Critical Fortress',
                    icon: '🏰',
                    desc: 'Full 4-pillar suite, STRIDE threat model, OpenAPI contracts, and 1,000-trial Monte Carlo forecast.'
                  },
                  {
                    id: 'Standard Agile Sprint' as TargetDepth,
                    title: 'Standard Agile Sprint',
                    icon: '🚀',
                    desc: 'Core architecture, REST endpoints, database schemas, and automated test matrix.'
                  },
                  {
                    id: 'MVP / Fast-Track' as TargetDepth,
                    title: 'Fast Prototype',
                    icon: '⚡',
                    desc: 'Rapid technical brief and key data models for hackathons or proof-of-concept validation.'
                  }
                ].map(depth => {
                  const isSelected = input.targetDepth === depth.id
                  return (
                    <button
                      key={depth.id}
                      onClick={() => setInput(prev => ({ ...prev, targetDepth: depth.id }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{depth.icon}</span>
                        <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {depth.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                        {depth.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Enterprise Team Topology & Company Structure (Conway's Law) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-500" />
                  <span>Company Structure & Team Delivery Topology</span>
                </label>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">Conway's Law Invariant</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                SpecGlow aligns task ownership, API boundaries, and service decoupling with how your human and AI engineering teams are structured:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[
                  {
                    id: 'Single Autonomous Squad (Unified Codebase & Full-Stack Team)',
                    title: 'Single Autonomous Squad',
                    icon: '🚀',
                    badge: 'Default / Fast-Paced',
                    desc: 'Unified modular monolith codebase, direct team ownership, zero cross-team handoff latency.'
                  },
                  {
                    id: 'Domain-Driven Pods (Multi-Team Microservices with API Contracts)',
                    title: 'Domain-Driven Pods',
                    icon: '🧩',
                    badge: 'Multi-Team Decoupled',
                    desc: 'Independent service repositories per squad, strict OpenAPI contracts, and isolated CI/CD pipelines.'
                  },
                  {
                    id: 'Platform & Product Hub-and-Spoke (Core Foundation + Feature Squads)',
                    title: 'Platform Hub & Product Spoke',
                    icon: '🌐',
                    badge: 'Enterprise Platform',
                    desc: 'Central platform engineering team providing shared primitives (Auth, Billing, Audit) to consumer squads.'
                  },
                  {
                    id: 'Regulated Enterprise with Architecture Review Board (ARB & Dual-Approval)',
                    title: 'Regulated Enterprise with ARB',
                    icon: '🏛️',
                    badge: 'Strict Governance',
                    desc: 'Formal Architecture Review Board gating, automated peer review controls, and SOC-2 change management.'
                  }
                ].map(top => {
                  const isSelected = input.companyStructure === top.id
                  return (
                    <button
                      key={top.id}
                      type="button"
                      onClick={() => setInput(prev => ({ ...prev, companyStructure: top.id }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-50/80 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-sm'
                          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{top.icon}</span>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                            {top.title}
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                          {top.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                        {top.desc}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Custom Structure override input */}
              <div className="pt-1">
                <input
                  type="text"
                  value={input.companyStructure || ''}
                  onChange={e => setInput(prev => ({ ...prev, companyStructure: e.target.value }))}
                  placeholder="Or type a custom company hierarchy / team setup (e.g. 3 Frontend, 2 Go Backend, 1 SecOps Lead)..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Optional Brownfield / Legacy Code Integration */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-slate-400" />
                  <span>Optional: Existing Database Schemas, APIs, or Legacy Code</span>
                </label>
                <span className="text-xs text-slate-400 dark:text-zinc-500">Optional</span>
              </div>
              <textarea
                value={input.brownfieldAssets || ''}
                onChange={e => setInput(prev => ({ ...prev, brownfieldAssets: e.target.value }))}
                rows={2}
                placeholder="Paste existing SQL schemas, Prisma models, or OpenAPI snippets here to guarantee backward compatibility..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(1)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Vision</span>
              </button>
              <button
                onClick={() => setActiveStage(3)}
                className="px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <span>Next Step: The Architect's Interview</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 3: THE ARCHITECT'S INTERVIEW (The "Grill-Me" Loop)       */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 3 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 dark:border-indigo-500/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl">📐</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-indigo-950 dark:text-indigo-200">
                    Stage 3: The Chief Architect's Interview (The "Grill-Me" Loop)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1">
                    Before pouring concrete, a Master Architect asks crucial questions: &quot;Do you want separate private vaults or one big vault with keycards?&quot; Answering these now guarantees AI coding agents never make disastrous assumptions later.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Architectural Trade-Off Dilemmas ({questions.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Select your preference for each decision or accept recommended enterprise defaults.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcceptAllRecommended}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Accept All Recommended Choices</span>
                </button>
                <button
                  onClick={() => loadQuestionsForDomain(input.domain)}
                  disabled={isQuestionsLoading}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Reload questions"
                >
                  <RefreshCw className={`w-4 h-4 ${isQuestionsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Questions List */}
            {isQuestionsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                  Analyzing domain invariants & formulating architectural trade-offs...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Dilemma {idx + 1}: {q.category}
                        </span>
                        <h5 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {q.question}
                        </h5>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                      <strong>Context:</strong> {q.context}
                    </p>

                    {/* Radio Options (Clear, readable, with implications) */}
                    <div className="space-y-2 pt-1">
                      {q.options.map(opt => {
                        const isSelected = selectedDecisions[q.id] === opt.id
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500/30'
                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={isSelected}
                              onChange={() => setSelectedDecisions(prev => ({ ...prev, [q.id]: opt.id }))}
                              className="mt-1 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {opt.label}
                                </span>
                                {opt.isRecommended && (
                                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                <strong>Engineering Implication:</strong> {opt.implication}
                              </p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(2)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Boundaries</span>
              </button>
              <button
                onClick={() => setActiveStage(4)}
                className="px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <span>Next Step: Synthesize Master Blueprints</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 4: THE 4-PILLAR MASTER BLUEPRINT (Synthesis & Review)    */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 4 && (
          <section className="space-y-6 animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl">🏗️</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-200">
                    Stage 4: The 4-Pillar Master Blueprint (The Miracle Engine)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1">
                    Just as structural engineers draw plumbing, electrical, and concrete schematics, SpecGlow synthesizes your complete 4-Pillar SDD suite: Constitution, OpenAPI Specifications, AI Task Graph, and Delivery Risk Matrix.
                  </p>
                </div>
              </div>
            </div>

            {/* Synthesis Launch Pad (If not generated or user wants to re-generate) */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {packageData ? 'Master Blueprint Suite Generated' : 'Ready to Synthesize Master Blueprints'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                    {packageData
                      ? `Viewing complete 6-tab package for "${packageData.title}" (${packageData.domain})`
                      : 'Choose live AI generation with your API key or generate the instant offline enterprise demo.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => executeSynthesis(false)}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isLoading ? 'Synthesizing...' : 'Synthesize with Live AI'}</span>
                  </button>

                  <button
                    onClick={() => executeSynthesis(true)}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 text-emerald-500" />
                    <span>Instant Enterprise Demo</span>
                  </button>
                </div>
              </div>

              {/* Animated Progress Display while Loading */}
              {isLoading && (
                <div className="p-6 rounded-xl border border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin" />
                    <div>
                      <h5 className="text-sm font-bold text-cyan-950 dark:text-cyan-200">
                        Synthesizing SpecGlow SDD Package...
                      </h5>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-0.5">
                        {SYNTHESIS_STEPS[synthesisStepIndex]}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-2 transition-all duration-700"
                      style={{ width: `${((synthesisStepIndex + 1) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Actions if Package Exists */}
              {packageData && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Governance Score: {packageData.governance.forecasting.velocityConfidenceScore}% • All Invariants Locked</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadSddZipBundle(packageData)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ZIP Bundle</span>
                    </button>
                    <button
                      onClick={() => downloadSddJsonBundle(packageData)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>JSON Manifest</span>
                    </button>
                    <button
                      onClick={() => setActiveStage(5)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Hand to Builders ➔</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* FULL SPECIFICATION VIEWER (All 6 Tabs, C4 Diagrams, Testing, Attestation) */}
            {packageData ? (
              <SpecificationViewer packageData={packageData} />
            ) : (
              <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 space-y-3">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-700 dark:text-zinc-300">
                  No Blueprints Synthesized Yet
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-500 max-w-md mx-auto">
                  Click &quot;Instant Enterprise Demo&quot; or &quot;Synthesize with Live AI&quot; above to generate your complete 4-Pillar Master Blueprint suite.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(3)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Interview</span>
              </button>
              <button
                onClick={() => setActiveStage(5)}
                className="px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <span>Next Step: Hand to Builders</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 5: HAND TO THE BUILDERS (Agent Handoff & Simulator)     */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 5 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-violet-500/5 border border-violet-500/20 dark:border-violet-500/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl">🚀</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-violet-950 dark:text-violet-200">
                    Stage 5: Handing Approved Blueprints to Robotic Contractors
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1">
                    Your blueprints are ready. Instead of ad-hoc chat prompts that produce bugs, give these precise blueprints to AI coding tools (Cursor, Claude Code, Antigravity, Copilot) or human squads to build with zero ambiguity.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Delivery Bundle Export Grid */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Download Delivery Artifacts
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    if (packageData) downloadSddZipBundle(packageData)
                    else setErrorMessage('Please synthesize blueprints in Stage 4 first.')
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:border-cyan-500 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-cyan-500" />
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500">
                      Complete .ZIP Bundle
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">
                    All 18+ markdown files, OpenAPI specs, and security attestation in one archive.
                  </p>
                </button>

                <button
                  onClick={() => {
                    if (packageData) downloadFile('jira-tasks.csv', generateJiraCsv(packageData), 'text/csv')
                    else setErrorMessage('Please synthesize blueprints in Stage 4 first.')
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:border-indigo-500 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-500">
                      Export Jira / Linear CSV
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">
                    Sequenced tickets with acceptance criteria and story point estimates.
                  </p>
                </button>

                <button
                  onClick={() => {
                    if (packageData) downloadMcpServer(packageData)
                    else setErrorMessage('Please synthesize blueprints in Stage 4 first.')
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-500" />
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">
                      Download MCP Stdio Server
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">
                    Standalone Model Context Protocol server exposing your spec to AI editors.
                  </p>
                </button>
              </div>
            </div>

            {/* AI Agent Execution Prompts (Cursor / Claude / Copilot) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>Ready-To-Run Prompts for AI Coding Agents</span>
              </h4>

              <div className="space-y-3">
                {[
                  {
                    id: 'cursor',
                    title: 'Cursor / Windsurf AI Rule Prompt',
                    icon: '⚡',
                    getPrompt: () => (packageData ? generateCursorRules(packageData) : 'Please synthesize Stage 4 first.')
                  },
                  {
                    id: 'claude',
                    title: 'Claude 3.5 Sonnet / Antigravity Master Agent Prompt',
                    icon: '🧠',
                    getPrompt: () => (packageData ? generateClaudeMd(packageData) : 'Please synthesize Stage 4 first.')
                  },
                  {
                    id: 'agents',
                    title: 'Universal AGENTS.md Directive (Antigravity / Devin / Copilot)',
                    icon: '💻',
                    getPrompt: () => (packageData ? generateAgentsMd(packageData) : 'Please synthesize Stage 4 first.')
                  }
                ].map(agent => (
                  <div
                    key={agent.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{agent.icon}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {agent.title}
                        </span>
                      </div>

                      <button
                        onClick={() => copyToClipboard(agent.getPrompt(), agent.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 transition-colors cursor-pointer"
                      >
                        {copiedPromptId === agent.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="text-xs p-3 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 overflow-x-auto max-h-28 font-mono">
                      {agent.getPrompt()}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthetic Delivery Simulator (Embedded) */}
            {packageData && (
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Synthetic Monte Carlo Delivery Forecast
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Simulate 1,000 synthetic agent execution runs against the task graph.
                    </p>
                  </div>
                </div>

                <DeliverySimulator
                  totalStoryPoints={packageData.governance.forecasting.totalStoryPoints}
                  recommendedSprintCount={packageData.governance.forecasting.recommendedSprintCount}
                  totalEstimatedAgentMinutes={packageData.taskGraph.totalEstimatedAgentMinutes}
                  taskCount={packageData.taskGraph.tasks.length}
                  riskMatrix={packageData.governance.riskMatrix}
                  confidenceScore={packageData.governance.forecasting.velocityConfidenceScore}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(4)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Blueprints</span>
              </button>
              <button
                onClick={() => {
                  setInput({
                    requirement: '',
                    domain: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)',
                    targetDepth: 'Mission-Critical / Enterprise'
                  })
                  setPackageData(null)
                  setActiveStage(1)
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Start Another Initiative</span>
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* EDUCATIONAL MATRIX: OLD WAY VS SPECGLOW SDD (Collapsible)      */}
        {/* ------------------------------------------------------------- */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-500" />
            <span>Why Spec-Driven Engineering? (The Old Way vs The SpecGlow Standard)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50">
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-zinc-300">Phase</th>
                  <th className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">Old Way (Ad-Hoc AI Prompting)</th>
                  <th className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">The SpecGlow SDD Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Requirements</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">Vague chat prompts with missing edge cases.</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-zinc-200">Formal PRD, user journeys & explicit anti-requirements.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Compliance</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">Forgotten until a security audit fails.</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-zinc-200">Strict regional invariants (HIPAA, PCI-DSS, GDPR) locked in.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Code Generation</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">Hallucinations, mismatched APIs, infinite refactoring loops.</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-zinc-200">Strict constitution.md & sequenced task graph executed step-by-step.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Testing</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">Manual clicking, broken tests, unexpected regressions.</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-zinc-200">Automated Vitest harness & continuous CI guardrails.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Application Footer with Official Attribution */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 text-center transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            SpecGlow SDD Studio V2 • Guided Spec-Driven Engineering & Delivery Governance Engine
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span>
              Created by{' '}
              <a
                href="https://www.mercerandmills.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 underline underline-offset-2 transition-colors"
              >
                Syed Imon Rizvi (Mercer and Mills)
              </a>
            </span>
            <span>•</span>
            <a
              href="https://www.mercerandmills.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 underline underline-offset-2 transition-colors"
            >
              www.mercerandmills.com
            </a>
            <span>•</span>
            <a
              href="https://www.linkedin.com/in/syedimonrizvi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 underline underline-offset-2 transition-colors"
            >
              LinkedIn
            </a>
            <span>•</span>
            <span>Licensed under Apache-2.0</span>
          </p>
        </div>
      </footer>

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
