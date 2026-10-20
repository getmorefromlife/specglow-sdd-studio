import type { ProviderPreset, TargetDepth, Settings, RegulatoryJurisdiction } from '../types'

export interface PresetConfig {
  name: string
  baseUrl: string
  defaultModel: string
  placeholderKey: string
  models: string[]
  recommendedModels: string[]
  description: string
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-6-sol',
  providerPreset: 'openai'
}

export const PROVIDER_PRESETS: Record<ProviderPreset, PresetConfig> = {
  openai: {
    name: 'OpenAI (The GPT Series)',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-6-sol',
    placeholderKey: 'sk-proj-...',
    models: [
      'gpt-6-astra',
      'gpt-6.1-sol',
      'gpt-6-sol',
      'gpt-6-luna',
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini',
      'o1',
      'o1-mini',
      'gpt-4.5-preview'
    ],
    recommendedModels: [
      'gpt-6-astra',
      'gpt-6.1-sol',
      'gpt-6-sol',
      'gpt-6-luna',
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini',
      'o1'
    ],
    description: 'Frontier reasoning (GPT-6 Astra/Sol) and low-latency production models.'
  },
  gemini: {
    name: 'Google Gemini (The Gemini Series)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-4-argon',
    placeholderKey: 'AIzaSy...',
    models: [
      'gemini-4-argon',
      'gemini-4',
      'gemini-3.8-flash',
      'gemini-3.8-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.1-pro',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemma-4'
    ],
    recommendedModels: [
      'gemini-4-argon',
      'gemini-4',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-2.5-flash',
      'gemma-4'
    ],
    description: 'Google DeepMind flagship models including Gemini 4 Argon and Gemini 3.8/3.7.'
  },
  anthropic: {
    name: 'Anthropic (Claude Series)',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-5.5',
    placeholderKey: 'sk-ant-...',
    models: [
      'claude-opus-5.5',
      'claude-sonnet-5.5',
      'claude-fable-5.1',
      'claude-3-7-sonnet',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022'
    ],
    recommendedModels: [
      'claude-opus-5.5',
      'claude-sonnet-5.5',
      'claude-fable-5.1',
      'claude-3-7-sonnet',
      'claude-3-5-sonnet-20241022'
    ],
    description: 'Peak architectural reasoning and code generation models.'
  },
  xai: {
    name: 'xAI (Grok Series)',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-3',
    placeholderKey: 'xai-...',
    models: [
      'grok-3',
      'grok-2-1212',
      'grok-2',
      'grok-beta'
    ],
    recommendedModels: [
      'grok-3',
      'grok-2-1212',
      'grok-beta'
    ],
    description: 'High-throughput reasoning and code synthesis powered by xAI Colossus.'
  },
  groq: {
    name: 'Groq (Ultra-Fast LPUs)',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    placeholderKey: 'gsk_...',
    models: [
      'llama-3.3-70b-versatile',
      'deepseek-r1-distill-llama-70b',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ],
    recommendedModels: [
      'llama-3.3-70b-versatile',
      'deepseek-r1-distill-llama-70b',
      'llama-3.1-8b-instant'
    ],
    description: 'Near-instant sub-second inference speeds powered by Groq LPUs.'
  },
  deepseek: {
    name: 'DeepSeek (Reasoning & Code)',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-reasoner',
    placeholderKey: 'sk-...',
    models: [
      'deepseek-reasoner',
      'deepseek-chat',
      'deepseek-r1'
    ],
    recommendedModels: [
      'deepseek-reasoner',
      'deepseek-chat',
      'deepseek-r1'
    ],
    description: 'Cost-effective high-reasoning coding models (R1 and V3).'
  },
  ollama: {
    name: 'Local Ollama (Offline / Air-Gapped)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'gemma-4',
    placeholderKey: 'ollama (not required)',
    models: [
      'gemma-4',
      'deepseek-r1',
      'llama3.3',
      'qwen2.5-coder',
      'mistral',
      'llama3'
    ],
    recommendedModels: [
      'gemma-4',
      'deepseek-r1',
      'llama3.3',
      'qwen2.5-coder'
    ],
    description: 'Run 100% locally on your workstation. Zero external network egress.'
  },
  openrouter: {
    name: 'OpenRouter (Universal Router)',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-6-sol',
    placeholderKey: 'sk-or-...',
    models: [
      'openai/gpt-6-sol',
      'anthropic/claude-sonnet-5.5',
      'google/gemini-4-argon',
      'deepseek/deepseek-r1',
      'meta-llama/llama-3.3-70b-instruct'
    ],
    recommendedModels: [
      'openai/gpt-6-sol',
      'anthropic/claude-sonnet-5.5',
      'google/gemini-4-argon',
      'deepseek/deepseek-r1'
    ],
    description: 'Single API key access to hundreds of open-source and proprietary models.'
  },
  custom: {
    name: 'Custom OpenAI-Compatible Gateway',
    baseUrl: 'https://my-custom-proxy.internal/v1',
    defaultModel: 'gpt-6-sol',
    placeholderKey: 'bearer-token...',
    models: ['gpt-6-sol', 'gpt-4o', 'custom-model'],
    recommendedModels: ['gpt-6-sol', 'gpt-4o'],
    description: 'Connect to any enterprise proxy, vLLM, LiteLLM, or internal API gateway.'
  }
}

// -----------------------------------------------------------------
// 6-REGION GLOBAL REGULATORY & CYBERSECURITY JURISDICTIONS
// -----------------------------------------------------------------
export interface JurisdictionProfile {
  id: RegulatoryJurisdiction
  region: string
  frameworks: string
  keyFocus: string
}

export const REGULATORY_JURISDICTIONS: JurisdictionProfile[] = [
  {
    id: 'North America (US & Canada)',
    region: 'North America (US & Canada)',
    frameworks: 'SOC 2 Type II, HIPAA (HITECH), NIST CSF 2.0, PCI-DSS v4.0',
    keyFocus: 'Zero-trust architecture, TLS 1.3, continuous audit trails, and strict PII/PHI isolation.'
  },
  {
    id: 'European Union & UK',
    region: 'European Union & UK',
    frameworks: 'GDPR, EU AI Act (High-Risk Auditability), DORA, NIS2',
    keyFocus: 'Right-to-be-Forgotten, explainable AI model governance, operational resilience & sub-processor audit.'
  },
  {
    id: 'GCC & Middle East',
    region: 'GCC & Middle East',
    frameworks: 'Saudi NCA (ECC-1:2018 & CCC-1:2020), SAMA Cyber Framework, UAE NESA / DESC',
    keyFocus: 'In-Kingdom sovereign data residency, mandatory air-gapped encryption key vaults, and multi-factor admin access.'
  },
  {
    id: 'Australia & New Zealand (ANZ)',
    region: 'Australia & New Zealand (ANZ)',
    frameworks: 'APRA CPS 234 (Information Security), ACSC Essential Eight, Privacy Act (APPs)',
    keyFocus: 'Immutable backup retention, continuous third-party security assurance, and application whitelisting.'
  },
  {
    id: 'Asia-Pacific (APAC)',
    region: 'Asia-Pacific (APAC)',
    frameworks: 'Singapore MAS TRM, India DPDP Act 2023 & RBI Framework, Singapore PDPA',
    keyFocus: 'Strict recovery time objectives (RTO < 4h), cross-border data transfer controls, and consent management.'
  },
  {
    id: 'Pakistan & Emerging Markets',
    region: 'Pakistan & Emerging Markets',
    frameworks: 'SBP Cyber Security Framework (Banks & FinTechs), PKCERT / NCSP, PECA',
    keyFocus: 'Mandatory localized dual-site DR active-active topology, SBP IT governance, and audited HSM integration.'
  },
  {
    id: 'Global Baseline (Default)',
    region: 'Global Baseline (Default)',
    frameworks: 'ISO 27001:2022 & OWASP Top 10',
    keyFocus: 'Comprehensive enterprise defense-in-depth, least privilege access, and secure SDLC CI/CD gates.'
  }
]

// -----------------------------------------------------------------
// CATEGORIZED INDUSTRY DOMAIN & COMPLIANCE TAXONOMY
// -----------------------------------------------------------------
export interface DomainCategory {
  category: string
  icon: string
  subdomains: {
    id: string
    name: string
    compliance: string
  }[]
}

export const DOMAIN_CATEGORIES: DomainCategory[] = [
  {
    category: 'Financial Services & Banking',
    icon: '💳',
    subdomains: [
      { id: 'fintech-wallet', name: 'FinTech / Multi-Currency & Wallets', compliance: 'PCI-DSS v4.0, SOX, Double-Entry' },
      { id: 'core-banking', name: 'Core Banking & Settlement Rails', compliance: 'ISO 20022, Fedwire, SWIFT' },
      { id: 'insurtech', name: 'InsurTech & Policy Actuarial Engine', compliance: 'NAIC, Solvency II, Audit Trail' },
      { id: 'wealthtech', name: 'WealthTech & High-Frequency Trading', compliance: 'MiFID II, SEC Rule 606' }
    ]
  },
  {
    category: 'Healthcare & Life Sciences',
    icon: '🩺',
    subdomains: [
      { id: 'healthtech-telehealth', name: 'HealthTech & Telehealth Consultations', compliance: 'HIPAA Security Rule, HITECH' },
      { id: 'clinical-ehr', name: 'EHR / EMR & Clinical Trial Systems', compliance: 'FDA 21 CFR Part 11, HL7 FHIR' },
      { id: 'medtech-iot', name: 'MedTech Diagnostics & Device Telemetry', compliance: 'ISO 13485, IEC 62304' }
    ]
  },
  {
    category: 'Enterprise Cloud & B2B SaaS',
    icon: '🏢',
    subdomains: [
      { id: 'multi-tenant-saas', name: 'Multi-Tenant B2B SaaS Platform', compliance: 'SOC-2 Type II, ISO 27001, GDPR' },
      { id: 'ai-rag-pipeline', name: 'AI Document Extraction & RAG Pipeline', compliance: 'Tenant Isolation, Zero-Data Retention' },
      { id: 'enterprise-erp', name: 'Enterprise ERP & Supply Chain Logistics', compliance: 'Audit Logging, SOX-404' }
    ]
  },
  {
    category: 'Cybersecurity & Zero-Trust',
    icon: '🛡️',
    subdomains: [
      { id: 'iam-auth', name: 'Identity, SSO & Zero-Trust IAM', compliance: 'NIST SP 800-63B, OIDC, FIDO2' },
      { id: 'siem-threat', name: 'SIEM & Threat Intelligence Hub', compliance: 'MITRE ATT&CK, CIS Controls v8' }
    ]
  },
  {
    category: 'Defense, GovTech & Public Sector',
    icon: '🏛️',
    subdomains: [
      { id: 'govtech-fedramp', name: 'GovTech & Public Agency Portals', compliance: 'FedRAMP High, NIST 800-53' },
      { id: 'defense-itar', name: 'Defense Logistics & Sensitive Systems', compliance: 'ITAR, CMMC Level 2' }
    ]
  },
  {
    category: 'Retail, E-Commerce & IoT',
    icon: '🛍️',
    subdomains: [
      { id: 'ecommerce-omni', name: 'High-Volume Omnichannel E-Commerce', compliance: 'PCI-DSS, CCPA, Inventory Locks' },
      { id: 'iot-telemetry', name: 'Industrial IoT & Sensor Telemetry', compliance: 'MQTT TLS, Edge Buffering' }
    ]
  },
  {
    category: 'Education, EdTech & LMS',
    icon: '🎓',
    subdomains: [
      { id: 'edtech-lms', name: 'EdTech / Video LMS & Course Delivery', compliance: 'FERPA, COPPA, SCORM / xAPI' },
      { id: 'interactive-quiz', name: 'Interactive Quiz & Proctoring Engine', compliance: 'WCAG 2.1 AA, Anti-Cheating Invariants' }
    ]
  },
  {
    category: 'Ethical, Community & Non-Profit',
    icon: '🤝',
    subdomains: [
      { id: 'community-portal', name: 'Ethical / Faith-Based Knowledge & Community Portal', compliance: 'GDPR Donor Privacy, Multilingual RTL' },
      { id: 'charity-donations', name: 'Non-Profit / NGO Transparent Aid Allocation', compliance: 'Zero-Egress Auditing, Micro-Grants' }
    ]
  }
]

// -----------------------------------------------------------------
// PRESETS FOR INTERACTIVE PRD & FEATURE COMPOSER
// -----------------------------------------------------------------
export const ARCHETYPE_PRESETS = [
  'Event-Driven Microservices (Kafka / RabbitMQ / SQS)',
  'Public REST & OpenAPI Gateway (FastAPI / Express / Go)',
  'Real-Time WebSockets & Signaling Hub',
  'Asynchronous Background Pipeline & Worker Queue',
  'Multi-Tenant Enterprise SaaS Web Portal',
  'Edge & Distributed CDN Caching Tier',
  'Graph Database & Entity Topology Engine',
  'Serverless Function Mesh with Step Workflows'
]

export const CAPABILITY_PRESETS = [
  'Financial Double-Entry Ledger & Currency Settlement',
  'Role-Based Access Control (RBAC/ABAC) & Step-Up MFA',
  'Deterministic Workflow State Machine with Human Approvals',
  'Semantic Vector Retrieval (RAG) & Hybrid BM25 Search',
  'Automated Document Ingestion & Multi-Format OCR',
  'Immutable Audit Journaling & Forensic Telemetry',
  'Dynamic Pricing, Quote Locking & Tariff Rule Engine',
  'Real-Time Triage Acuity Scoring & Dispatching'
]

export const PERSONA_PRESETS = [
  'Enterprise IT Administrator / Security Officer',
  'End-Consumer / Mobile App User',
  'Regulatory Compliance Officer & External Auditor',
  'Third-Party B2B Integration Developer',
  'Frontline Healthcare Clinician / Nurse',
  'Financial Risk Analyst / Treasurer',
  'DevOps & Platform Site Reliability Engineer'
]

export const INVARIANT_PRESETS = [
  'Strict Idempotency Keys (Zero Duplicate Execution)',
  'Field-Level Encryption at Rest via AES-256-GCM',
  'Zero PHI / PII Telemetry Leakage in Application Logs',
  'Sub-100ms P99 Latency with Read-Replica Cache Tiering',
  'Transactional Outbox Pattern & Eventual Consistency',
  'Two-Person Rule / Dual-Authorization for High-Impact Actions',
  'Automated Circuit Breaking with Fallback Graceful Degradation',
  'Immutable Write-Ahead Database Audit Triggers'
]

export interface SampleInitiative {
  title: string
  badge: string
  domain: string
  targetDepth: TargetDepth
  prompt: string
}

export const SAMPLE_INITIATIVES: SampleInitiative[] = [
  {
    title: 'Fintech Multi-Currency Wallet & Settlement Service',
    badge: 'FinTech',
    domain: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)',
    targetDepth: 'Mission-Critical / Enterprise',
    prompt: `Architect a real-time multi-currency digital wallet and FX settlement engine.
Users must be able to hold balances in USD, EUR, GBP, and JPY.
Requirements:
1. Double-entry ledger with strict idempotency keys on every transaction to prevent double spending.
2. Real-time FX exchange quote locking (30-second lock window) before final execution.
3. Automated daily sweep and multi-bank settlement reconciliation pipeline.
4. Compliance with PCI-DSS v4.0 and financial audit logging invariants.`
  },
  {
    title: 'Healthcare HIPAA-Compliant Telehealth Queue',
    badge: 'HealthTech',
    domain: 'HealthTech & Telehealth Consultations (HIPAA Security Rule)',
    targetDepth: 'Mission-Critical / Enterprise',
    prompt: `Design a HIPAA-compliant real-time patient triage queue and telehealth video consultation dispatch system.
Requirements:
1. Dynamic priority scoring based on clinical acuity (Emergency, Urgent, Routine).
2. End-to-end encrypted WebRTC session signaling with zero PHI leakage in logs or URL parameters.
3. Automated provider assignment based on medical state licensing and active shift schedule.
4. Immutable audit trail of clinician chart access and patient handoff records compliant with HIPAA Security Rule.`
  },
  {
    title: 'SaaS AI Document Extraction & RAG Pipeline',
    badge: 'Enterprise SaaS',
    domain: 'AI Document Extraction & RAG Pipeline (Tenant Isolation)',
    targetDepth: 'Standard Agile Sprint',
    prompt: `Build an asynchronous, multi-tenant document ingestion, chunking, and semantic vector retrieval (RAG) pipeline.
Requirements:
1. Ingest PDF, DOCX, and scanned TIFFs with OCR fallback and semantic layout chunking.
2. Tenant-isolated vector embeddings stored with hybrid search (dense cosine + sparse BM25).
3. Resilient background job queue with exponential backoff, dead-letter queue, and status webhooks.
4. Strict RBAC restricting document search access to authorized tenant project groups.`
  }
]

export const SPECGLOW_SYSTEM_PROMPT = `You are SpecGlow SDD Studio — an elite Enterprise Solutions Architect and AI-Native Delivery Director.
Your task is to take a raw feature prompt, initiative brief, or PRD and synthesize a complete, production-grade 4-Pillar Spec-Driven Development (SDD) delivery package adhering to modern enterprise engineering and agile delivery standards.

IMPORTANT CYBERSECURITY & ECOSYSTEM INVARIANTS:
1. APPROVED PACKAGES ONLY (ANTI-SLOPSQUATTING):
   - AI coding agents must NEVER install unvetted or hallucinated third-party libraries.
   - Auth: Native jose or @auth/core only.
   - Database: Parameterized queries or approved ORM (@prisma/client, drizzle-orm). Raw SQL string concatenation is strictly forbidden.
   - Crypto: Web Crypto API or Node native crypto only.
2. STRIDE THREAT MATRIX:
   - Provide an explicit STRIDE Threat Modeling Matrix covering Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege with concrete architectural mitigations.
3. JURISDICTION COMPLIANCE:
   - If a regulatory jurisdiction is specified (e.g., GCC NCA/SAMA, ANZ APRA CPS 234, EU GDPR/AI Act, US SOC2/HIPAA, PK SBP), inject non-negotiable legal and regulatory invariants reflecting that jurisdiction into the constitution.

You must respond ONLY with a single valid JSON object strictly matching this schema with NO markdown code block wrappers:

{
  "title": "Clear, professional initiative title",
  "constitution": {
    "systemOverview": "Rigorous high-level architecture overview, regulatory baseline, and operating environment.",
    "technicalConstraints": [
      {
        "category": "Languages & Runtime" | "Frameworks & Libraries" | "Database & Storage" | "Forbidden Packages / Patterns",
        "rule": "Concrete architectural rule (including Anti-Slopsquatting Approved Packages Only invariant)",
        "rationale": "Engineering reason and risk avoided"
      }
    ],
    "securityInvariants": [
      {
        "id": "SEC-01",
        "category": "Authentication" | "Authorization (RBAC/ABAC)" | "Input Validation & Sanitization" | "OWASP Defense" | "Data Protection",
        "invariant": "Non-negotiable security requirement including jurisdictional regulatory mandate",
        "enforcementMechanism": "Exact technical implementation mechanism"
      }
    ],
    "antiRequirements": [
      {
        "id": "ANTI-01",
        "item": "Specific feature or pattern explicitly prohibited",
        "reason": "Why this is strictly out of scope to avoid AI scope creep"
      }
    ],
    "strideThreatMatrix": [
      {
        "category": "Spoofing" | "Tampering" | "Repudiation" | "Information Disclosure" | "Denial of Service" | "Elevation of Privilege",
        "threat": "Specific threat scenario for this system",
        "architecturalMitigation": "Concrete architectural countermeasure (e.g. HMAC-SHA256 signatures, Row-Level Security, Token bucket rate limiting)"
      }
    ]
  },
  "functionalSpec": {
    "userJourneys": [
      {
        "actor": "Actor role",
        "goal": "Core objective",
        "happyPathSteps": ["Step 1...", "Step 2...", "Step 3..."],
        "edgeCases": ["Edge case 1...", "Edge case 2..."]
      }
    ],
    "stateTransitions": [
      {
        "entity": "Core entity name",
        "initialState": "Initial state",
        "triggerEvent": "Event/Action",
        "finalState": "Target state",
        "guardCondition": "Condition required to allow transition"
      }
    ],
    "apiContracts": [
      {
        "endpoint": "/api/v1/resource",
        "method": "POST",
        "description": "Clear purpose",
        "requestSchema": "{\\n  \\"key\\": \\"type\\"\\n}",
        "responseSchema": "{\\n  \\"id\\": \\"string\\",\\n  \\"status\\": \\"success\\"\\n}",
        "statusCodes": [
          {"code": 200, "description": "OK"},
          {"code": 400, "description": "Validation error"},
          {"code": 409, "description": "Idempotency conflict"}
        ]
      }
    ],
    "acceptanceCriteria": [
      {
        "id": "AC-01",
        "title": "Scenario title",
        "given": "Preconditions",
        "when": "Action taken",
        "then": "Expected outcome",
        "and": ["Additional invariant check"],
        "fullGherkin": "Scenario: Scenario title\\n  Given Preconditions\\n  When Action taken\\n  Then Expected outcome"
      }
    ]
  },
  "taskGraph": {
    "totalEstimatedAgentMinutes": 180,
    "criticalPathSummary": "Sequencing rationale across DB, API, UI, and QA layers.",
    "tasks": [
      {
        "id": "TASK-1",
        "taskNumber": 1,
        "title": "Atomic task title",
        "layer": "Database & Migration" | "Backend Service & API" | "Frontend Component & State" | "Security & Middleware" | "Test Suite & CI",
        "description": "Precise instruction for an autonomous AI coding agent (Claude Code, Antigravity, Cursor, Devin).",
        "blockedBy": ["None" or "TASK-1"],
        "targetFilePaths": ["src/db/migrations/001_init.sql"],
        "complexityPoints": 3,
        "estimatedAgentMinutes": 30,
        "acceptanceTestCriteria": "Test command and verification condition"
      }
    ]
  },
  "governance": {
    "forecasting": {
      "totalStoryPoints": 21,
      "velocityConfidenceScore": 92,
      "confidenceRationale": "Explanation of complexity, team dependencies, and technical risk.",
      "recommendedSprintCount": 1,
      "developerSkillMix": [
        {"role": "Backend / DB Engineer", "percentage": 45},
        {"role": "Frontend / UI Engineer", "percentage": 30},
        {"role": "QA / Security Automation", "percentage": 25}
      ]
    },
    "riskMatrix": [
      {
        "id": "RSK-01",
        "category": "Architectural Debt" | "Security & Compliance" | "Scalability & Concurrency" | "Vendor & Dependency" | "Data Integrity",
        "severity": "Critical" | "High" | "Medium" | "Low",
        "probability": "High" | "Medium" | "Low",
        "risk": "Description of risk",
        "impact": "Concrete failure impact",
        "mitigation": "Proactive architectural mitigation"
      }
    ],
    "executiveStatusReport": "A polished, professional one-paragraph executive summary ready for steering committees and client stakeholders detailing scope readiness, architecture posture, and delivery risk profile."
  }
}
`

export const SPECFLOW_SYSTEM_PROMPT = SPECGLOW_SYSTEM_PROMPT

