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
  Building2,
  Lock,
  FileCode,
  Languages,
  Code,
  HelpCircle,
  Info,
  X,
  Mic,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { Header } from '../components/Header'
import { HeroSection } from '../components/HeroSection'
import { SettingsModal } from '../components/SettingsModal'
import { GuideModal } from '../components/GuideModal'
import { VoiceAssistantModal } from '../components/VoiceAssistantModal'
import { SpecificationViewer } from '../components/SpecificationViewer'
import { DeliverySimulator } from '../components/DeliverySimulator'
import { synthesizeSddPackage } from '../services/aiService'
import {
  generateInterrogationQuestions,
  DOMAIN_FALLBACK_QUESTIONS,
  analyzeCustomDecisionTradeoff,
  type CustomDecisionAnalysis
} from '../services/interrogationService'
import {
  analyzeAndRecommendArchitecture,
  getOfflineRecommendation,
  type ArchitectureRecommendation
} from '../services/ideaAdvisorService'
import type { ParsedVoiceIntent } from '../services/voiceIntentParser'
import { saveInitiativeToDb } from '../utils/storageUtils'
import { downloadSddZipBundle, downloadSddJsonBundle, downloadMcpServer, downloadEnvExample, downloadFile } from '../utils/exportUtils'
import { generateCursorRules, generateClaudeMd, generateAgentsMd } from '../utils/agentRuleGenerators'
import { generateJiraCsv } from '../utils/taskExportGenerators'
import { DOMAIN_CATEGORIES } from '../utils/constants'
import type {
  RequirementInput,
  SddArtifactPackage,
  ArchitecturalInterrogationQuestion,
  TargetDepth,
  PlatformTarget,
  TechStackPreset
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
  },
  {
    id: 'edtech-lms',
    title: 'Interactive EdTech LMS & Knowledge Engine',
    category: 'Education & Learning',
    domain: 'Education, EdTech & LMS (FERPA, COPPA, xAPI)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'FERPA & xAPI LRS',
    icon: '🎓',
    description: 'Interactive course learning platform with real-time video lectures, xAPI learning analytics, quiz evaluation, and strict student privacy.',
    prompt: 'Architect an enterprise interactive learning management system (LMS). Requires student progress telemetry via xAPI with a dedicated Learning Record Store (LRS), adaptive bitrate HLS lecture video streaming with Cloudflare Stream DRM, automated rubric assessments, and COPPA/FERPA student privacy compliance.'
  },
  {
    id: 'ethical-community',
    title: 'Ethical Community & Decentralized Mutual Aid',
    category: 'Community & Social Impact',
    domain: 'Ethical, Community & Non-Profit (Zero-Knowledge, Decentralized)',
    targetDepth: 'Mission-Critical / Enterprise',
    badge: 'Zero-Knowledge & Privacy',
    icon: '🤝',
    description: 'Decentralized mutual aid and activist platform with pseudonymous identities, cryptographic verification, and community consensus moderation.',
    prompt: 'Design an ethical community and mutual aid coordination platform. Requires zero-knowledge pseudonymous member identities, transparent multi-signature community grant allocations, decentralized quorum-based abuse reporting, and automated 30-day hard database record purging for privacy preservation.'
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
    id: 'Education, EdTech & LMS (FERPA, COPPA, xAPI)',
    name: 'Education, EdTech & LMS',
    frameworks: 'FERPA, COPPA, xAPI / SCORM, Child Safety',
    icon: '🎓',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 dark:border-amber-500/40'
  },
  {
    id: 'Ethical, Community & Non-Profit (Zero-Knowledge, Decentralized)',
    name: 'Ethical & Community',
    frameworks: 'Zero-Knowledge Privacy, Decentralized Quorums',
    icon: '🤝',
    color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 dark:border-teal-500/40'
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

interface ArchitectureHelpDetail {
  id: string
  title: string
  icon: string
  badge: string
  analogy: string
  plainEnglish: string
  bestUsedFor: string[]
  whenToAvoid: string[]
  recommendedPairings: string
}

const ARCHITECTURE_HELP_DETAILS: Record<string, ArchitectureHelpDetail> = {
  'web-portal': {
    id: 'web-portal',
    title: 'Web Portals & Modern Web Applications',
    icon: '🌐',
    badge: 'Next.js / SSR',
    analogy: 'Like a modern flagship store on the main avenue—built for maximum foot traffic, discoverability, and rapid customer entry.',
    plainEnglish: 'Web applications rendered dynamically on the server and cached globally. Every page loads in a fraction of a second and can be easily found and indexed by Google.',
    bestUsedFor: [
      'Public corporate portals, customer hubs, and landing pages',
      'SEO-dependent web applications where Google ranking directly impacts revenue',
      'High-traffic portals with real-time dynamic dashboard updates'
    ],
    whenToAvoid: [
      'Apps that must run offline inside airplanes or basements without internet (choose Mobile App instead)',
      'Apps requiring continuous access to phone hardware like Bluetooth or HealthKit'
    ],
    recommendedPairings: 'Next.js 15 or Astro + Supabase/Neon PostgreSQL + Vercel / Cloudflare'
  },
  'mobile-app': {
    id: 'mobile-app',
    title: 'Mobile iOS & Android Apps (React Native / Expo)',
    icon: '📱',
    badge: 'Expo / Native',
    analogy: 'Like a personal pocket assistant that works on airplanes and in underground parking lots without an internet signal.',
    plainEnglish: 'A single codebase written in TypeScript that compiles into native iOS (App Store) and Android (Google Play) applications with native phone performance.',
    bestUsedFor: [
      'Mobile-first apps for consumers, field agents, delivery drivers, and doctors',
      'Offline-first usage with local SQLite database sync when network is spotty',
      'Push notifications, camera scanning, biometric FaceID / fingerprint authentication'
    ],
    whenToAvoid: [
      'Internal B2B enterprise dashboards with 50-column data tables (better on desktop web)',
      'Public marketing content relying on search engine crawlers'
    ],
    recommendedPairings: 'React Native (Expo SDK 52) + SQLite + Supabase + Expo EAS Cloud Build'
  },
  'saas-web': {
    id: 'saas-web',
    title: 'Enterprise Multi-Tenant B2B SaaS',
    icon: '🏢',
    badge: 'Multi-Tenant',
    analogy: 'Like a luxury commercial office building with private secure keycards for each tenant organization.',
    plainEnglish: 'A subscription-based business software where many companies (tenants) use the same system, but their data is strictly isolated using database security rules.',
    bestUsedFor: [
      'Workplace dashboards, CRM, ERP, project management, and analytics',
      'Complex multi-role permissions (Admin, Manager, Auditor, Member)',
      'Subscription billing, invoices, and per-organization audit journals'
    ],
    whenToAvoid: [
      'Simple brochure websites or one-time promotional event pages',
      'Consumer gaming or phone-only camera apps'
    ],
    recommendedPairings: 'Next.js 15 + PostgreSQL Row-Level Security (RLS) + Stripe Billing'
  },
  'e-commerce': {
    id: 'e-commerce',
    title: 'High-Volume E-Commerce & Retail',
    icon: '🛍️',
    badge: 'Store & Cart',
    analogy: 'Like a high-speed airport ticket counter during holiday peak—everyone gets checked out without lines crashing or seats being double-sold.',
    plainEnglish: 'An online storefront designed to handle thousands of simultaneous shoppers, reserving cart inventory in milliseconds so items are never oversold.',
    bestUsedFor: [
      'Flash sales, limited-edition product drops, large catalog storefronts',
      'High concurrent checkout spikes (Black Friday / Cyber Monday traffic)',
      'Multi-currency payment gateways and idempotent Stripe webhook reconciliation'
    ],
    whenToAvoid: [
      'Small team internal internal tools with only 10 users',
      'Content-only blogs and technical documentation sites'
    ],
    recommendedPairings: 'Next.js 15 + Upstash Redis Distributed Locks + Stripe / Adyen'
  },
  'nextjs-shadcn': {
    id: 'nextjs-shadcn',
    title: 'Next.js 15 (App Router) + shadcn/ui',
    icon: '⚡',
    badge: 'Recommended',
    analogy: 'Like building a house with precision architectural blueprints and pre-crafted luxury fittings—you own all the code with zero proprietary lock-in.',
    plainEnglish: 'The world-standard React framework backed by Vercel. shadcn/ui gives you beautiful, accessible buttons, dialogs, and tables where code is copied directly into your project rather than hidden in a black-box library.',
    bestUsedFor: [
      'Production SaaS platforms, customer portals, modern web apps',
      'Teams wanting full design control, dark/light themes, and strict type safety',
      'Fast server-side rendering with instant edge caching'
    ],
    whenToAvoid: [
      'Pure documentation portals where zero JavaScript is needed (Astro is lighter)',
      'Mobile-only applications'
    ],
    recommendedPairings: 'Vercel / Cloudflare Pages + Supabase/Neon PostgreSQL + Upstash Redis'
  },
  'astro-content': {
    id: 'astro-content',
    title: 'Astro 5 + Content Collections',
    icon: '🚀',
    badge: 'Content & Docs',
    analogy: 'Like a lightweight racing bicycle stripped of all unnecessary baggage—it flies down the road at maximum speed.',
    plainEnglish: 'A web framework designed for pure speed. It renders HTML on the server and strips out all JavaScript by default, achieving perfect 100/100 Google Lighthouse scores.',
    bestUsedFor: [
      'Blogs, technical documentation, knowledge bases, EdTech course sites',
      'Content-heavy websites where SEO speed is the #1 priority',
      'Writing content in Markdown or MDX with occasional interactive elements'
    ],
    whenToAvoid: [
      'Heavy interactive web apps with dozens of real-time state changes and modals (choose Next.js)',
      'Mobile applications'
    ],
    recommendedPairings: 'Cloudflare Pages / GitHub Pages + Cloudflare R2'
  },
  'react-native': {
    id: 'react-native',
    title: 'React Native + Expo SDK 52',
    icon: '📱',
    badge: 'iOS & Android',
    analogy: 'Like a universal adapter plug that powers your appliances seamlessly in both the US and Europe with a single cord.',
    plainEnglish: 'Build for both Apple iPhone and Android phones at the same time using familiar React and TypeScript. Expo takes care of camera, push notifications, and app store deployment.',
    bestUsedFor: [
      'Cross-platform mobile apps for iOS and Android',
      'Teams with web developers who want to build mobile apps without learning Swift/Kotlin',
      'Apps needing offline storage and native phone gestures'
    ],
    whenToAvoid: [
      'Desktop-only web apps or search-engine-indexed landing pages'
    ],
    recommendedPairings: 'Expo EAS Cloud Build + SQLite + Supabase'
  },
  'flutter-dart': {
    id: 'flutter-dart',
    title: 'Flutter 3.x + Material 3 (Dart)',
    icon: '🎨',
    badge: 'Dart Multi-Platform',
    analogy: 'Like an artist who paints every single pixel on canvas directly rather than asking the phone operating system to draw buttons.',
    plainEnglish: 'Google’s UI toolkit that draws every button and animation directly using a high-performance graphics engine. Looks identical across iOS, Android, and Desktop.',
    bestUsedFor: [
      'Visually custom apps with heavy fluid animations and custom graphics',
      'Cross-platform mobile, desktop (Mac/Windows), and embedded devices'
    ],
    whenToAvoid: [
      'Teams with zero Dart language experience (TypeScript/React Native is faster to hire for)'
    ],
    recommendedPairings: 'Firebase / Supabase + Appwrite'
  },
  'fastapi-react': {
    id: 'fastapi-react',
    title: 'FastAPI (Python 3.12) + React 19 SPA',
    icon: '🐍',
    badge: 'Python Backend',
    analogy: 'Like pairing a German turbo diesel engine (Python backend) with an Italian sports car body (React frontend).',
    plainEnglish: 'A high-speed Python backend that automatically produces machine-readable OpenAPI documentation, connected to an ultra-modern React user interface.',
    bestUsedFor: [
      'AI/ML platforms, scientific computing, data pipelines',
      'Teams whose engineers prefer Python for business logic and data processing'
    ],
    whenToAvoid: [
      'Teams that want a single unified TypeScript codebase across full stack'
    ],
    recommendedPairings: 'Fly.io / AWS ECS + Neon Postgres + React SPA'
  },
  'stack-agnostic': {
    id: 'stack-agnostic',
    title: 'Stack-Agnostic / AI Standard',
    icon: '🧩',
    badge: 'Decoupled',
    analogy: 'Like writing pure architectural blueprints with precise measurements without dictating which hammer or crane the construction crew must use.',
    plainEnglish: 'Generates language-independent specifications, REST contracts, and database models. Allows AI coding agents (Claude, Cursor, Antigravity) to pick the best tools based on your environment.',
    bestUsedFor: [
      'Polyglot engineering teams, legacy codebases with Go/Rust/Java',
      'Early exploratory initiatives testing different tech architectures'
    ],
    whenToAvoid: [
      'Strict enterprise teams where package-lock dependencies must be locked down'
    ],
    recommendedPairings: 'Docker + Any cloud provider'
  },
  'rtl-multilingual': {
    id: 'rtl-multilingual',
    title: 'Multilingual & Right-to-Left (RTL) Layouts',
    icon: '🌍',
    badge: 'i18n & Logical CSS',
    analogy: 'Like having an English book and an Arabic/Urdu book where the binding, cover, pages, and margins automatically mirror seamlessly without re-printing.',
    plainEnglish: 'Enforces CSS logical properties so buttons and cards flip gracefully when a user switches between English (Left-to-Right) and Arabic or Urdu (Right-to-Left). Agents are instructed never to use hardcoded physical left/right margins.',
    bestUsedFor: [
      'Global applications serving Middle East (GCC), North Africa, and South Asia',
      'Bilingual English/Arabic or English/Urdu portals'
    ],
    whenToAvoid: [
      'Single-language regional apps with no planned international expansion'
    ],
    recommendedPairings: 'Google Noto Naskh Arabic & Noto Nastaliq Urdu Fonts'
  }
}

export const VisualWorkflowPage: React.FC = () => {
  const { settings, isConfigured } = useSettings()

  // Stepper state (1 to 5)
  const [activeStage, setActiveStage] = useState<number>(1)

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [activeHelpTopic, setActiveHelpTopic] = useState<string | null>(null)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false)
  const [isAnalyzingIdea, setIsAnalyzingIdea] = useState(false)
  const [ideaRecommendation, setIdeaRecommendation] = useState<ArchitectureRecommendation | null>(null)

  // Input state
  const [input, setInput] = useState<RequirementInput>({
    requirement: '',
    domain: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)',
    targetDepth: 'Mission-Critical / Enterprise',
    platformTarget: 'web-portal',
    techStack: 'nextjs-shadcn',
    enableRtlMultilingual: false,
    companyStructure: 'Single Autonomous Squad (Unified Codebase & Full-Stack Team)',
    brownfieldAssets: ''
  })

  // Architectural Interrogation state (Stage 3)
  const [questions, setQuestions] = useState<ArchitecturalInterrogationQuestion[]>([])
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({})
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false)
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({})
  const [customAnalyses, setCustomAnalyses] = useState<Record<string, CustomDecisionAnalysis>>({})
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<Record<string, boolean>>({})
  const [hasAcceptedRecommended, setHasAcceptedRecommended] = useState(false)

  // Package Data (Stage 4 & 5)
  const [packageData, setPackageData] = useState<SddArtifactPackage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [synthesisStepIndex, setSynthesisStepIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)

  // Catalog expansion & category filtering states (Stage 1 & 2)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isCatalogExpanded, setIsCatalogExpanded] = useState<boolean>(false)

  // Persistent Skyscraper Blueprint Journey HUD State
  const [isScrolledPastHero, setIsScrolledPastHero] = useState<boolean>(false)
  const [isHudMinimized, setIsHudMinimized] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      // Reveal the sticky journey bar once user scrolls past top hero section (~320px)
      setIsScrolledPastHero(window.scrollY > 320)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleStageSelect = (stageId: number) => {
    setActiveStage(stageId)
    const workspaceElement = document.getElementById('stage-workspace')
    if (workspaceElement) {
      const yOffset = -150
      const y = workspaceElement.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    }
  }

  const BLUEPRINT_CATEGORIES = [
    'All',
    'FinTech & Banking',
    'Healthcare & Life Sciences',
    'Education & Learning',
    'Community & Social Impact',
    'AI & Autonomous Agents',
    'E-Commerce & Retail',
    'Cybersecurity & Zero-Trust',
    'Logistics & Supply Chain',
    'GovTech & Defense'
  ]

  const loadQuestionsForDomain = React.useCallback(async (_domainString?: string, forceOffline: boolean = false) => {
    setIsQuestionsLoading(true)
    try {
      // Query live AI if user configured an API key, or use smart fallback
      const shouldForceOffline = forceOffline || !settings.apiKey
      const qList = await generateInterrogationQuestions(input, settings, shouldForceOffline)
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

  const handleApplyVoiceIntent = (intent: ParsedVoiceIntent) => {
    setInput(prev => ({
      ...prev,
      requirement: intent.composedBrief,
      domain: intent.detectedDomain || prev.domain,
      targetDepth: intent.detectedDepth || prev.targetDepth
    }))
    setIsVoiceModalOpen(false)
  }

  const handleExploreIdeaWithAi = async () => {
    setIsAdvisorModalOpen(true)
    setIsAnalyzingIdea(true)
    try {
      const rec = await analyzeAndRecommendArchitecture(input.requirement, settings)
      setIdeaRecommendation(rec)
    } catch {
      setIdeaRecommendation(getOfflineRecommendation(input.requirement))
    } finally {
      setIsAnalyzingIdea(false)
    }
  }

  const handleApplyRecommendation = (rec: ArchitectureRecommendation) => {
    setInput(prev => ({
      ...prev,
      requirement: rec.refinedBrief,
      domain: rec.recommendedDomain,
      platformTarget: rec.recommendedPlatformTarget,
      techStack: rec.recommendedTechStack,
      targetDepth: rec.recommendedDepth,
      companyStructure: rec.recommendedCompanyStructure
    }))
    setIsAdvisorModalOpen(false)
    loadQuestionsForDomain(rec.recommendedDomain)
    setActiveStage(2)
  }

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
    setHasAcceptedRecommended(true)
    setTimeout(() => {
      setHasAcceptedRecommended(false)
    }, 3000)
  }

  const handleAnalyzeCustomDecision = async (q: ArchitecturalInterrogationQuestion) => {
    const customText = customAnswers[q.id]?.trim()
    if (!customText) return

    setIsAnalyzingCustom(prev => ({ ...prev, [q.id]: true }))
    try {
      const analysis = await analyzeCustomDecisionTradeoff(
        q.question,
        q.context,
        customText,
        input.domain,
        settings
      )
      setCustomAnalyses(prev => ({ ...prev, [q.id]: analysis }))
      setSelectedDecisions(prev => ({ ...prev, [q.id]: 'custom' }))
    } catch (err) {
      console.warn('Failed to analyze custom decision:', err)
    } finally {
      setIsAnalyzingCustom(prev => ({ ...prev, [q.id]: false }))
    }
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
      // Map decisions into rich architectural statements
      const decisionsMap: Record<string, string> = {}
      questions.forEach(q => {
        const catKey = q.category || q.question
        const choice = selectedDecisions[q.id]
        if (choice === 'na') {
          decisionsMap[catKey] = 'EXPLICITLY NOT APPLICABLE / OUT OF SCOPE. Omit this subsystem entirely; cataloged as an Anti-Requirement / Non-Goal in constitution.md.'
        } else if (choice === 'custom') {
          const customText = customAnswers[q.id]?.trim() || 'Custom Architectural Pattern'
          const analysis = customAnalyses[q.id]
          const tradeoffNote = analysis
            ? ` [Verified Trade-Off: ${analysis.tradeoffAnalysis} | Compliance: ${analysis.complianceVerdict}]`
            : ''
          decisionsMap[catKey] = `CUSTOM ARCHITECTURAL CHOICE: ${customText}${tradeoffNote}`
        } else {
          const selectedOption = q.options.find(opt => opt.id === choice) || q.options[0]
          if (selectedOption) {
            decisionsMap[catKey] = `${selectedOption.label} (Engineering Implication: ${selectedOption.implication})`
          }
        }
      })

      const enrichedInput: RequirementInput = {
        ...input,
        architecturalDecisions: Object.keys(decisionsMap).length > 0 ? decisionsMap : selectedDecisions
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

        {/* PERSISTENT SKYSCRAPER BLUEPRINT JOURNEY HUD (Sticky In-Your-Face Navigation) */}
        <div
          className={`sticky top-[70px] sm:top-[76px] z-30 transition-all duration-300 ${
            isScrolledPastHero
              ? 'opacity-100 translate-y-0 pointer-events-auto mb-4'
              : 'opacity-0 -translate-y-3 pointer-events-none h-0 overflow-hidden m-0 p-0 border-0'
          }`}
        >
          <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl rounded-2xl border border-cyan-500/40 dark:border-cyan-500/30 shadow-xl shadow-cyan-500/5 overflow-hidden transition-all">
            {/* HUD Header Bar */}
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base sm:text-lg">🏢</span>
                <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  The Skyscraper Blueprint Journey
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/90 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Stage {activeStage} of 5 Active
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  {activeStage * 20}% Assembled
                </span>
                <button
                  type="button"
                  onClick={() => setIsHudMinimized(!isHudMinimized)}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title={isHudMinimized ? "Expand Journey Bar" : "Minimize Journey Bar"}
                >
                  {isHudMinimized ? (
                    <>
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-500" />
                    </>
                  ) : (
                    <>
                      <span>Compact</span>
                      <ChevronUp className="w-3.5 h-3.5 text-cyan-500" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expanded 5-Step Track */}
            {!isHudMinimized && (
              <div className="p-2 sm:p-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {[
                    { id: 1, label: '01. Vision', shortLabel: 'Vision', sub: 'The Raw Idea', icon: Lightbulb, isReady: !!input.requirement, isLocked: false },
                    { id: 2, label: '02. Boundaries', shortLabel: 'Boundaries', sub: 'Laws & Rigor', icon: Globe, isReady: !!input.domain, isLocked: false },
                    { id: 3, label: '03. Interview', shortLabel: 'Interview', sub: 'Architect Dilemmas', icon: MessageSquareCode, isReady: Object.keys(selectedDecisions).length > 0, isLocked: false },
                    { id: 4, label: '04. Blueprints', shortLabel: 'Blueprints', sub: packageData ? 'Suite Ready' : 'Synthesize Suite', icon: Layers, isReady: !!packageData, isLocked: !packageData },
                    { id: 5, label: '05. Builders', shortLabel: 'Builders', sub: packageData ? 'Ready for Handoff' : 'Locked (Needs S4)', icon: Rocket, isReady: !!packageData, isLocked: !packageData }
                  ].map(step => {
                    const Icon = step.icon
                    const isActive = activeStage === step.id
                    const isDone = step.isReady && activeStage > step.id

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStageSelect(step.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-cyan-500/15 dark:bg-cyan-950/70 border-cyan-500 dark:border-cyan-400 ring-1 ring-cyan-500/30 shadow-xs'
                            : isDone
                            ? 'bg-slate-100/70 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-cyan-400/60'
                            : 'bg-white dark:bg-zinc-900/60 border-slate-200/60 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                            isActive
                              ? 'bg-cyan-600 text-white shadow-xs'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : step.isLocked
                              ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : step.isLocked ? (
                            <Lock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive
                                ? 'text-cyan-900 dark:text-cyan-200'
                                : 'text-slate-800 dark:text-zinc-200'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                            {step.sub}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Progress Strip */}
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1">
              <div
                className="bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${activeStage * 20}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5-STAGE INTERACTIVE PROGRESS PIPELINE (Large, Clear, High-Contrast) */}
        <section className="bg-white dark:bg-zinc-900/80 rounded-2xl p-4 sm:p-6 border border-slate-200/70 dark:border-zinc-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                The Skyscraper Blueprint Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                Move step-by-step through the 5 stages of Spec-Driven Engineering. No guesswork.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {activeStage} of 5 Active</span>
            </div>
          </div>

          {/* Stepper Buttons Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {[
              { id: 1, label: '01. Vision', sub: 'The Raw Idea', icon: Lightbulb, isReady: !!input.requirement, isLocked: false },
              { id: 2, label: '02. Boundaries', sub: 'Laws & Rigor', icon: Globe, isReady: !!input.domain, isLocked: false },
              { id: 3, label: '03. Interview', sub: 'Architect Dilemmas', icon: MessageSquareCode, isReady: Object.keys(selectedDecisions).length > 0, isLocked: false },
              { id: 4, label: '04. Blueprints', sub: packageData ? 'Suite Ready' : 'Synthesize Suite', icon: Layers, isReady: !!packageData, isLocked: !packageData },
              { id: 5, label: '05. Builders', sub: packageData ? 'Ready for Handoff' : 'Locked (Needs S4)', icon: Rocket, isReady: !!packageData, isLocked: !packageData }
            ].map(step => {
              const Icon = step.icon
              const isActive = activeStage === step.id
              const isDone = step.isReady && activeStage > step.id

              return (
                <button
                  key={step.id}
                  onClick={() => handleStageSelect(step.id)}
                  className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/50 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-md'
                      : isDone
                      ? 'bg-slate-50/90 dark:bg-zinc-800/60 border-slate-200/80 dark:border-zinc-700 hover:border-cyan-400 shadow-xs'
                      : 'bg-white/90 dark:bg-zinc-900 border-slate-200/70 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : isDone
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : step.isLocked
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : step.isLocked ? (
                      <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isActive
                            ? 'text-cyan-900 dark:text-cyan-200'
                            : 'text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.isLocked && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                          Lock
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate font-medium">
                      {step.sub}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Anchor for smooth stage scrolling */}
        <div id="stage-workspace" className="scroll-mt-36" />

        {/* ------------------------------------------------------------- */}
        {/* STAGE 1: TELL YOUR VISION (The Raw Business Idea)             */}
        {/* ------------------------------------------------------------- */}
        {activeStage === 1 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 dark:border-amber-500/30 shadow-xs">
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

            {/* Input Text Area with Clear Primary Visual Anchor */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Your Initiative Description</span>
                  <span className="text-rose-500">*</span>
                </label>

                {/* Primary Visual Anchor: 1-Click Enterprise Demo, Voice & AI Advisor */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStarter(STARTER_TEMPLATES[0])}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    title="Pre-fill with Battle-Tested FinTech Multi-Currency Ledger Demo"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>⚡ Load Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    title="Speak your idea using voice audio recording"
                  >
                    <Mic className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>🎙️ Voice Co-Pilot</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExploreIdeaWithAi}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500/15 via-cyan-500/15 to-purple-500/15 text-indigo-700 dark:text-cyan-300 border border-indigo-200/80 dark:border-cyan-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    title="Let AI analyze your idea and recommend the ideal platform, tech stack, and compliance"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                    <span>✨ AI Idea Advisor</span>
                  </button>

                  {input.requirement && (
                    <button
                      type="button"
                      onClick={() => setInput(prev => ({ ...prev, requirement: '' }))}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}

                  <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 pl-1">
                    {input.requirement.length} chars
                  </span>
                </div>
              </div>

              <textarea
                value={input.requirement}
                onChange={e => setInput(prev => ({ ...prev, requirement: e.target.value }))}
                rows={5}
                placeholder="e.g., We need an enterprise digital wallet and multi-currency ledger with sub-millisecond ACID settlement, distributed Redis idempotency locks, and PCI-DSS v4.0 audit logs... (or type your raw idea and click ✨ AI Idea Advisor above!)"
                className="w-full text-base sm:text-lg leading-relaxed p-4 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              />

              {/* Guiding Hand Callout Strip */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-purple-500/5 border border-indigo-500/15 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    Not sure what tech stack or platform to pick? Let AI analyze your idea and configure the entire architecture.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExploreIdeaWithAi}
                  className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <span>✨ Get AI Recommendations →</span>
                </button>
              </div>

              {/* Engine Status & Mode Callout Strip */}
              <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs transition-all ${
                isConfigured
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-xs font-semibold">
                    {isConfigured ? (
                      <>
                        <strong>Live BYOK AI Connected:</strong> Synthesizing directly with {settings.providerPreset.toUpperCase()} ({settings.model}). 100% in-browser privacy with zero third-party telemetry.
                      </>
                    ) : (
                      <>
                        <strong>Interactive Demo Simulator:</strong> Exploring with battle-tested enterprise reference templates. Connect a free Google Gemini or OpenAI key in Settings to synthesize custom live AI from your exact words.
                      </>
                    )}
                  </span>
                </div>
                {!isConfigured && (
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Connect Free API Key →</span>
                  </button>
                )}
              </div>

              {/* SDD Mental Model Educational Card (Why Blueprints Before Code?) */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/60 space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Why Spec-Driven Blueprints Before Writing Code?</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
                    The Modern AI Engineering Paradigm
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Asking AI tools (Cursor, Claude Code, Windsurf) to write raw code from a loose prompt causes <strong>context drift, regression bugs, and hallucinated dependencies</strong>. SpecGlow creates the rigid architectural contracts first. When your AI agents read these blueprints, they write production code with zero hallucinations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-sm">✓</span>
                    <div>
                      <strong className="text-slate-100 block">Zero Context Collapse</strong>
                      <span className="text-[11px] text-slate-400">Security & database invariants locked in constitution.md.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold text-sm">✓</span>
                    <div>
                      <strong className="text-slate-100 block">100% Contract Match</strong>
                      <span className="text-[11px] text-slate-400">Complete OpenAPI 3.1 contracts align frontend & backend.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2">
                    <span className="text-purple-400 font-bold text-sm">✓</span>
                    <div>
                      <strong className="text-slate-100 block">1-Click Agent Handoff</strong>
                      <span className="text-[11px] text-slate-400">Exports .cursorrules, CLAUDE.md, and atomic tasks.md.</span>
                    </div>
                  </div>
                </div>
              </div>
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
                          : 'bg-slate-100/90 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-zinc-700'
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
                    className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/60 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 hover:border-cyan-400/80 dark:hover:border-cyan-500 text-left transition-all group cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
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
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
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
            <div className="pt-4 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-end">
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
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/5 border border-cyan-500/20 dark:border-cyan-500/30 shadow-xs">
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

            {/* Quick Architectural Combinations Helper Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/20 dark:border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 dark:bg-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Need help deciding? Click any <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300 font-bold mx-0.5">?</span> icon for real-world analogies
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Learn which platform target, tech stack, and compliance combination is proven for your use case.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shrink-0 self-start sm:self-auto transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Combinations Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none ${
                        isSelected
                          ? 'bg-cyan-50/80 dark:bg-cyan-950/60 border-cyan-500/80 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-sm'
                          : 'bg-white/90 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
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
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200/70 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-950/70 space-y-2.5 shadow-xs">
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
                  className="w-full p-3 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer shadow-xs"
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

            {/* Platform Target Architecture Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span>Platform Target Architecture</span>
                </label>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">Client-Side Runtime Target</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                SpecGlow synthesizes platform-native invariants, touch target thresholds, and caching boundaries tailored to your target execution environment:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: 'web-portal' as PlatformTarget,
                    title: 'Web Portals & Apps',
                    badge: 'Next.js / SSR',
                    icon: '🌐',
                    desc: 'Corporate portals, public landing pages, SEO-indexed applications, and fast edge delivery.'
                  },
                  {
                    id: 'mobile-app' as PlatformTarget,
                    title: 'Mobile iOS & Android',
                    badge: 'Expo / Native',
                    icon: '📱',
                    desc: 'Cross-platform mobile apps with offline SQLite, APNs/FCM push, and 48px touch targets.'
                  },
                  {
                    id: 'saas-web' as PlatformTarget,
                    title: 'Enterprise B2B SaaS',
                    badge: 'Multi-Tenant',
                    icon: '🏢',
                    desc: 'Complex multi-tenant dashboards, analytical workflows, role-based controls, and billing.'
                  },
                  {
                    id: 'e-commerce' as PlatformTarget,
                    title: 'High-Volume Commerce',
                    badge: 'Store & Cart',
                    icon: '🛍️',
                    desc: 'Omnichannel storefronts, sub-second product catalogs, cart reservation, and checkout rails.'
                  }
                ].map(plat => {
                  const isSelected = (input.platformTarget || 'web-portal') === plat.id
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setInput(prev => ({ ...prev, platformTarget: plat.id }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none group ${
                        isSelected
                          ? 'bg-cyan-50/80 dark:bg-cyan-950/60 border-cyan-500/80 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-sm'
                          : 'bg-white/90 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{plat.icon}</span>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                            {plat.title}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                            {plat.badge}
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            title={`What is ${plat.title} good for? Click for plain-English analogy`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveHelpTopic(plat.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation()
                                setActiveHelpTopic(plat.id)
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label={`Learn more about ${plat.title}`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                        {plat.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preferred Tech Stack & UI System Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span>Preferred Tech Stack & UI System</span>
                </label>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Strict Library Gating</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Enforces approved package imports in agent prompt rules to eliminate hallucinated libraries:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'nextjs-shadcn' as TechStackPreset,
                    title: 'Next.js 15 + shadcn/ui',
                    badge: 'Recommended',
                    desc: 'App Router, React 19, Tailwind CSS. Strictly imports UI components from @/components/ui.'
                  },
                  {
                    id: 'astro-content' as TechStackPreset,
                    title: 'Astro 5 + Content Collections',
                    badge: 'Content & Docs',
                    desc: 'Zero-JS client by default, Tailwind CSS, and MDX for blazing fast documentation portals.'
                  },
                  {
                    id: 'react-native' as TechStackPreset,
                    title: 'React Native (Expo SDK 52)',
                    badge: 'iOS & Android',
                    desc: 'NativeWind v4 (Tailwind), local offline SQLite persistence, and universal deep links.'
                  },
                  {
                    id: 'flutter-dart' as TechStackPreset,
                    title: 'Flutter 3.x + Material 3',
                    badge: 'Dart Multi-Platform',
                    desc: 'Cross-platform native compilation with strict Riverpod state management.'
                  },
                  {
                    id: 'fastapi-react' as TechStackPreset,
                    title: 'FastAPI + React 19 SPA',
                    badge: 'Python Backend',
                    desc: 'Python 3.12 backend adhering to OpenAPI specs + React 19 SPA frontend with Tailwind.'
                  },
                  {
                    id: 'stack-agnostic' as TechStackPreset,
                    title: 'Stack-Agnostic / AI Standard',
                    badge: 'Decoupled',
                    desc: 'Framework-independent contract specifications allowing AI agents to determine optimal tooling.'
                  }
                ].map(stk => {
                  const isSelected = (input.techStack || 'nextjs-shadcn') === stk.id
                  return (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() => setInput(prev => ({ ...prev, techStack: stk.id }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none group ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500/80 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-white/90 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {stk.title}
                        </h5>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                            {stk.badge}
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            title={`What is ${stk.title} good for? Click for plain-English analogy`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveHelpTopic(stk.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation()
                                setActiveHelpTopic(stk.id)
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label={`Learn more about ${stk.title}`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                        {stk.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Multilingual & RTL Toggle */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200/70 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-950/70 space-y-2.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Multilingual & RTL Support (Arabic / Urdu / English)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                        i18n & Logical CSS
                      </span>
                      <button
                        type="button"
                        title="What is Multilingual & RTL good for? Click for plain-English explanation"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveHelpTopic('rtl-multilingual')
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        aria-label="Learn more about Multilingual and RTL"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Enforces CSS logical properties (<code className="text-purple-600 dark:text-purple-400">ms-</code>, <code className="text-purple-600 dark:text-purple-400">me-</code>, <code className="text-purple-600 dark:text-purple-400">ps-</code>, <code className="text-purple-600 dark:text-purple-400">pe-</code>, <code className="text-purple-600 dark:text-purple-400">start-</code>, <code className="text-purple-600 dark:text-purple-400">end-</code>), dynamic <code className="text-purple-600 dark:text-purple-400">dir="rtl"</code> switching, and Google Noto Naskh/Nastaliq font fallbacks in agent instructions.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInput(prev => ({ ...prev, enableRtlMultilingual: !prev.enableRtlMultilingual }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    input.enableRtlMultilingual
                      ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-500/20'
                      : 'bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${input.enableRtlMultilingual ? 'bg-white' : 'bg-slate-400'}`} />
                  <span>{input.enableRtlMultilingual ? 'RTL Enabled (Active)' : 'Enable RTL & Multilingual'}</span>
                </button>
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
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500/80 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-white/90 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
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
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none ${
                        isSelected
                          ? 'bg-cyan-50/80 dark:bg-cyan-950/60 border-cyan-500/80 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-sm'
                          : 'bg-white/90 dark:bg-zinc-950 border-slate-200/70 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
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
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 shadow-xs"
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
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 shadow-xs"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(1)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
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
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 dark:border-indigo-500/30 shadow-xs">
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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadQuestionsForDomain(input.domain, false)}
                  disabled={isQuestionsLoading}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-indigo-500/20 disabled:opacity-50"
                  title="Re-analyze your exact choices with AI and generate custom architectural dilemmas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isQuestionsLoading ? 'animate-spin' : ''}`} />
                  <span>{isQuestionsLoading ? 'Analyzing & Generating...' : '🔄 Re-Generate Dilemmas for My Project (AI)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAllRecommended}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    hasAcceptedRecommended
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400 scale-[1.02]'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                  }`}
                  title="Accept enterprise-recommended patterns across all dilemmas"
                >
                  {hasAcceptedRecommended ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" />
                      <span>✓ All Recommended Applied!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Accept All Recommended</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Feedback Confirmation Banner */}
            {hasAcceptedRecommended && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fade-in shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Applied enterprise recommended patterns across all {questions.length} dilemmas. You can synthesize immediately or adjust any decision below.</span>
              </div>
            )}

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
                {questions.map((q, idx) => {
                  const recOpt = q.options.find(o => o.isRecommended) || q.options[0]
                  const altOptions = q.options.filter(o => o.id !== recOpt?.id)
                  const isNaSelected = selectedDecisions[q.id] === 'na'
                  const isCustomSelected = selectedDecisions[q.id] === 'custom'
                  const customValue = customAnswers[q.id] || ''
                  const analysis = customAnalyses[q.id]
                  const isAnalyzing = !!isAnalyzingCustom[q.id]

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl border border-slate-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/50 space-y-4 shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
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

                      {/* 4-Option Dilemma Structure */}
                      <div className="space-y-2.5 pt-1">
                        {/* Option 1: Enterprise Recommended Pattern */}
                        {recOpt && (
                          <label
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                              selectedDecisions[q.id] === recOpt.id
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500/80 dark:border-indigo-400 ring-1 ring-indigo-500/30'
                                : 'bg-white/90 dark:bg-zinc-900 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={selectedDecisions[q.id] === recOpt.id}
                              onChange={() => setSelectedDecisions(prev => ({ ...prev, [q.id]: recOpt.id }))}
                              className="mt-1 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Option 1: {recOpt.label}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
                                  Recommended
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                <strong>Engineering Implication:</strong> {recOpt.implication}
                              </p>
                            </div>
                          </label>
                        )}

                        {/* Option 2: Alternative Pattern(s) */}
                        {altOptions.map((alt, altIdx) => {
                          const isSelected = selectedDecisions[q.id] === alt.id
                          return (
                            <label
                              key={alt.id}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                                isSelected
                                  ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500/80 dark:border-indigo-400 ring-1 ring-indigo-500/30'
                                  : 'bg-white/90 dark:bg-zinc-900 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                checked={isSelected}
                                onChange={() => setSelectedDecisions(prev => ({ ...prev, [q.id]: alt.id }))}
                                className="mt-1 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex-1 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    Option {2 + altIdx}: {alt.label}
                                  </span>
                                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-300/80 dark:border-zinc-700">
                                    Alternative
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                  <strong>Engineering Implication:</strong> {alt.implication}
                                </p>
                              </div>
                            </label>
                          )
                        })}

                        {/* Option 3: Not Applicable / Out of Scope (N/A) */}
                        <label
                          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                            isNaSelected
                              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500/80 dark:border-amber-400 ring-1 ring-amber-500/30'
                              : 'bg-white/90 dark:bg-zinc-900 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            checked={isNaSelected}
                            onChange={() => setSelectedDecisions(prev => ({ ...prev, [q.id]: 'na' }))}
                            className="mt-1 text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Option {2 + altOptions.length}: ⚪ Not Applicable / Out of Scope (N/A)
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800">
                                Excluded Subsystem
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                              <strong>Anti-Requirement Invariant:</strong> Formally excludes this subsystem from your architecture. It will be cataloged as an Anti-Requirement / Non-Goal in constitution.md so AI coding agents never invent unnecessary code or infrastructure for it.
                            </p>
                          </div>
                        </label>

                        {/* Option 4: Custom Technical Decision (Write-In) with AI Trade-Off Analysis */}
                        <div
                          className={`p-3.5 rounded-xl border transition-all shadow-xs ${
                            isCustomSelected
                              ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-500/80 dark:border-purple-400 ring-1 ring-purple-500/30'
                              : 'bg-white/90 dark:bg-zinc-900 border-slate-200/70 dark:border-zinc-800'
                          }`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={isCustomSelected}
                              onChange={() => setSelectedDecisions(prev => ({ ...prev, [q.id]: 'custom' }))}
                              className="mt-1 text-purple-600 focus:ring-purple-500"
                            />
                            <div className="flex-1 text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Option {3 + altOptions.length}: ✏️ Custom Technical Decision (Write-In)
                                </span>
                                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300/80 dark:border-purple-800">
                                  AI Verified
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                Specify your exact internal tooling, third-party vendor, or proprietary architecture. Our AI will evaluate trade-offs and regulatory compliance against {input.domain.split('(')[0].trim()}.
                              </p>
                            </div>
                          </label>

                          {/* Write-In Input & Action Button */}
                          <div className="mt-3 pl-7 space-y-2.5">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={customValue}
                                onChange={(e) => {
                                  setCustomAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                                  setSelectedDecisions(prev => ({ ...prev, [q.id]: 'custom' }))
                                }}
                                onFocus={() => setSelectedDecisions(prev => ({ ...prev, [q.id]: 'custom' }))}
                                placeholder="e.g. AWS Aurora Global Database with KMS envelopes and DynamoDB streams"
                                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleAnalyzeCustomDecision(q)}
                                disabled={!customValue.trim() || isAnalyzing}
                                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                              >
                                {isAnalyzing ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Analyzing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>⚡ Analyze Custom Decision (AI)</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* AI Trade-Off Analysis Results Card */}
                            {analysis && (
                              <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-purple-200 dark:border-purple-900/60 space-y-1.5 animate-fade-in shadow-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> AI Architect Verdict
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    analysis.isAcceptable
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                  }`}>
                                    {analysis.isAcceptable ? '✓ Enterprise Architecture Viable' : '⚠️ Architecture Exception'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-zinc-300">
                                  <strong>⚖️ Engineering Trade-Off:</strong> {analysis.tradeoffAnalysis}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-zinc-400">
                                  <strong>🛡️ Compliance & Security:</strong> {analysis.complianceVerdict}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(2)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
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
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/30 shadow-xs">
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
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
                    <span>
                      {isLoading
                        ? 'Synthesizing Blueprints...'
                        : isConfigured
                        ? `⚡ Synthesize via Live ${settings.providerPreset.toUpperCase()}`
                        : '📘 Synthesize Reference Blueprint'}
                    </span>
                  </button>

                  {!isConfigured ? (
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Connect API Key for Live AI</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => executeSynthesis(true)}
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200/90 dark:border-zinc-700 flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <Play className="w-4 h-4 text-emerald-500" />
                      <span>Instant Reference Demo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Progress Display while Loading */}
              {isLoading && (
                <div className="p-6 rounded-xl border border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/30 space-y-4 shadow-inner">
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
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200/70 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Governance Score: {packageData.governance.forecasting.velocityConfidenceScore}% • All Invariants Locked</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadSddZipBundle(packageData)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ZIP Bundle</span>
                    </button>
                    <button
                      onClick={() => downloadSddJsonBundle(packageData)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>JSON Manifest</span>
                    </button>
                    <button
                      onClick={() => setActiveStage(5)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
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
              <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300/80 dark:border-zinc-800 space-y-3 shadow-xs">
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
            <div className="pt-4 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(3)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
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
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none animate-fade-in">
            {/* Stage Plain English Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-violet-500/5 border border-violet-500/20 dark:border-violet-500/30 shadow-xs">
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

            {/* PROGRESSIVE DISCLOSURE GATE: If no package synthesized yet */}
            {!packageData ? (
              <div className="p-8 sm:p-12 text-center bg-slate-50/70 dark:bg-zinc-950/60 rounded-2xl border border-dashed border-slate-300/80 dark:border-zinc-800 space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Stage 5 Locked: Blueprints Awaiting Synthesis
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Delivery artifacts (18-file .ZIP bundle, Jira/Linear CSV, MCP server, and AI prompts) require approved architectural blueprints from Stage 4 before they can be generated.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => executeSynthesis(true)}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    <span>⚡ Synthesize Instant Demo Now</span>
                  </button>
                  <button
                    onClick={() => setActiveStage(4)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200/90 dark:border-zinc-700 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go to Stage 4 (Review Suite)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>All 18+ Architecture Artifacts, Contracts, and Agent Prompts Unlocked & Ready for Handoff</span>
              </div>
            )}

            {/* Quick Delivery Bundle Export Grid (Gated with progressive disclosure) */}
            <div className={!packageData ? 'opacity-35 grayscale pointer-events-none select-none blur-[0.5px] space-y-6' : 'space-y-6'}>
              {/* Developer Execution Guide */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-cyan-50/70 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border border-indigo-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    How to Build This in Cursor, Claude Desktop & Windsurf
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-mono text-[11px] flex items-center justify-center">1</span>
                      <span>Extract Bundle</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">
                      Click <strong>Complete .ZIP Bundle</strong> below and extract files into your codebase root folder.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[11px] flex items-center justify-center">2</span>
                      <span>Agents Auto-Detect</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">
                      Cursor and Claude Code automatically detect <code className="text-indigo-600 dark:text-indigo-400 font-semibold">.cursorrules</code> and <code className="text-indigo-600 dark:text-indigo-400 font-semibold">CLAUDE.md</code>.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-[11px] flex items-center justify-center">3</span>
                      <span>Execute Phase by Phase</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">
                      Tell your agent: <span className="italic font-semibold text-slate-800 dark:text-zinc-200">&quot;Execute Phase 1 in tasks.md&quot;</span>. The agent writes code compliant with your constitution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Download Delivery Artifacts
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      if (packageData) downloadSddZipBundle(packageData)
                      else setErrorMessage('Please synthesize blueprints in Stage 4 first.')
                    }}
                    className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 hover:border-cyan-500 text-left transition-all cursor-pointer group shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
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
                    className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 hover:border-indigo-500 text-left transition-all cursor-pointer group shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
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
                    className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 hover:border-emerald-500 text-left transition-all cursor-pointer group shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
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

                  <button
                    onClick={() => {
                      if (packageData) downloadEnvExample(packageData)
                      else setErrorMessage('Please synthesize blueprints in Stage 4 first.')
                    }}
                    className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 hover:border-teal-500 text-left transition-all cursor-pointer group shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-teal-500" />
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-500">
                        Download .env.example
                      </h5>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">
                      Cloud hosting blueprint, database URLs, auth secrets, and R2 bucket configuration.
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
                      className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/60 space-y-2 shadow-[0_1px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
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
                          className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 transition-colors cursor-pointer shadow-xs"
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

                      <pre className="text-xs p-3 rounded-lg bg-slate-100/90 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 overflow-x-auto max-h-28 font-mono">
                        {agent.getPrompt()}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synthetic Delivery Simulator (Embedded) */}
              {packageData && (
                <div className="pt-4 border-t border-slate-200/70 dark:border-zinc-800 space-y-3">
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
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStage(4)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
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
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
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
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800/80 p-6 sm:p-8 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-500" />
            <span>Why Spec-Driven Engineering? (The Old Way vs The SpecGlow Standard)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/50">
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

      {/* Plain-English Architecture Topic Help Modal */}
      {activeHelpTopic && ARCHITECTURE_HELP_DETAILS[activeHelpTopic] && (() => {
        const item = ARCHITECTURE_HELP_DETAILS[activeHelpTopic]
        const isPlatform = ['web-portal', 'mobile-app', 'saas-web', 'e-commerce'].includes(item.id)
        const isStack = ['nextjs-shadcn', 'astro-content', 'react-native', 'flutter-dart', 'fastapi-react', 'stack-agnostic'].includes(item.id)
        const isRtl = item.id === 'rtl-multilingual'

        const isCurrentlyActive = isPlatform
          ? (input.platformTarget || 'web-portal') === item.id
          : isStack
          ? (input.techStack || 'nextjs-shadcn') === item.id
          : isRtl
          ? input.enableRtlMultilingual
          : false

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Plain-English Architecture & Technology Guide</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHelpTopic(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Real World Analogy Box */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-0.5">
                    Real-World Analogy
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 font-medium leading-relaxed">
                    {item.analogy}
                  </p>
                </div>
              </div>

              {/* Plain English Explanation */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  What is this?
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed font-normal">
                  {item.plainEnglish}
                </p>
              </div>

              {/* Best Used For & When to Avoid Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Best Used For</span>
                  </div>
                  <ul className="space-y-1.5">
                    {item.bestUsedFor.map((pt, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 dark:border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>When to Avoid</span>
                  </div>
                  <ul className="space-y-1.5">
                    {item.whenToAvoid.map((pt, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Cloud & Storage Pairings */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Recommended Production Blueprint
                </span>
                <p className="text-xs text-slate-800 dark:text-zinc-200 font-mono font-medium">
                  {item.recommendedPairings}
                </p>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveHelpTopic(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isCurrentlyActive ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold border border-emerald-500/20">
                      <Check className="w-4 h-4" />
                      <span>Currently Selected in Your Architecture</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlatform) {
                          setInput(prev => ({ ...prev, platformTarget: item.id as PlatformTarget }))
                        } else if (isStack) {
                          setInput(prev => ({ ...prev, techStack: item.id as TechStackPreset }))
                        } else if (isRtl) {
                          setInput(prev => ({ ...prev, enableRtlMultilingual: true }))
                        }
                        setActiveHelpTopic(null)
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {isRtl ? 'Enable Multilingual & RTL' : `Select ${item.title}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Voice Co-Pilot & Audio Dictation Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyIntent={handleApplyVoiceIntent}
      />

      {/* AI Idea Explorer & Architecture Advisor Modal */}
      {isAdvisorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      AI Architecture & Tech Advisor
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      Guiding Hand
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    We analyze your raw idea and recommend the best domain, platform, and tech stack in plain English.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvisorModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input / Refinement Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Your Idea or Problem Statement
              </label>
              <textarea
                value={input.requirement}
                onChange={e => setInput(prev => ({ ...prev, requirement: e.target.value }))}
                rows={3}
                placeholder="Type your idea in plain English (e.g., 'An app for doctors to video call patients and send prescriptions', or 'A coffee shop mobile app with reward points')..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExploreIdeaWithAi}
                  disabled={isAnalyzingIdea || !input.requirement.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingIdea ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingIdea ? 'Analyzing Idea...' : 'Analyze Idea with AI'}</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isAnalyzingIdea && (
              <div className="py-10 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                  Solutions Architect AI is evaluating platform targets, compliance regimes, and tech stacks...
                </p>
              </div>
            )}

            {/* Recommendation Result */}
            {!isAnalyzingIdea && ideaRecommendation && (
              <div className="space-y-4 pt-2 animate-fade-in">
                {/* Plain-English summary banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/30 flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-300 mb-1">
                      Architectural Recommendation
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed font-medium">
                      {ideaRecommendation.plainEnglishSummary}
                    </p>
                  </div>
                </div>

                {/* 4 Recommendations Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Recommended Domain */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      1. Regulatory Domain & Laws
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {ideaRecommendation.recommendedDomain}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {ideaRecommendation.domainRationale}
                    </p>
                  </div>

                  {/* Recommended Platform Target */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      2. Platform Target
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {ideaRecommendation.recommendedPlatformTarget.replace('-', ' ')}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {ideaRecommendation.platformRationale}
                    </p>
                  </div>

                  {/* Recommended Tech Stack */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      3. Preferred Tech Stack
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {ideaRecommendation.recommendedTechStack}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {ideaRecommendation.techStackRationale}
                    </p>
                  </div>

                  {/* Recommended Delivery Rigor */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      4. Delivery Rigor & Topology
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {ideaRecommendation.recommendedDepth}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {ideaRecommendation.recommendedCompanyStructure}
                    </p>
                  </div>
                </div>

                {/* Refined Vision Brief */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Refined Vision Brief (Will be set as initiative description)
                  </span>
                  <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed font-mono">
                    {ideaRecommendation.refinedBrief}
                  </p>
                </div>

                {/* Footer apply action */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAdvisorModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Keep Current Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyRecommendation(ideaRecommendation)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply All Recommendations & Proceed →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
