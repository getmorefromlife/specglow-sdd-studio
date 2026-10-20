import type { SddArtifactPackage, RequirementInput, Settings } from '../types'
import { SPECGLOW_SYSTEM_PROMPT } from '../utils/constants'
import { DEMO_SDD_PACKAGES } from './demoSddPresets'

/**
 * Clean and parse JSON response from LLMs that might include markdown code fences.
 */
function cleanAndParseJSON(rawText: string): unknown {
  let cleaned = rawText.trim()
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
  }

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }

  return JSON.parse(cleaned)
}

/**
 * Synthesize a 4-Pillar SpecGlow SDD Package directly in the browser via BYOK.
 */
export async function synthesizeSddPackage(
  input: RequirementInput,
  settings: Settings,
  forceDemo: boolean = false
): Promise<SddArtifactPackage> {
  // If demo is forced or no API key is provided (except for local Ollama):
  const isKeyNeeded = settings.providerPreset !== 'ollama'
  if (forceDemo || (isKeyNeeded && (!settings.apiKey || settings.apiKey.trim() === ''))) {
    // Select best matching demo package based on domain
    let matchedDemoKey = 'saas'
    if (input.domain === 'Fintech') matchedDemoKey = 'fintech'
    else if (input.domain === 'HealthTech') matchedDemoKey = 'healthcare'

    const matched = DEMO_SDD_PACKAGES[matchedDemoKey] || DEMO_SDD_PACKAGES['fintech']
    
    // Simulate brief asynchronous synthesis progress
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      ...matched,
      id: `sdd-${Date.now()}`,
      createdAt: new Date().toISOString(),
      domain: input.domain,
      targetDepth: input.targetDepth,
      originalPrompt: input.requirement || matched.originalPrompt,
      constitution: {
        ...matched.constitution,
        technicalConstraints: [
          ...matched.constitution.technicalConstraints,
          ...(input.brownfieldAssets
            ? [{
                category: 'Database & Storage' as const,
                rule: 'Brownfield Stack & Schema Invariant: Must preserve and integrate with existing schema models, tables, and package dependencies.',
                rationale: 'Existing repository context provided by development team.'
              }]
            : []),
          ...(input.architecturalDecisions
            ? Object.entries(input.architecturalDecisions).map(([category, rule]) => ({
                category: 'Languages & Runtime' as const,
                rule: `Architectural Invariant (${category}): ${rule}`,
                rationale: 'Confirmed by Principal Architect during Pre-Synthesis Interrogation ("Grill-Me" Loop).'
              }))
            : [])
        ]
      }
    }
  }

  let decisionsBlock = ''
  if (input.architecturalDecisions && Object.keys(input.architecturalDecisions).length > 0) {
    decisionsBlock = `\nCONFIRMED ARCHITECTURAL INVARIANTS & TRADE-OFFS (DECIDED BY PRINCIPAL ARCHITECT):\n` +
      Object.entries(input.architecturalDecisions)
        .map(([category, decision]) => `- [${category}]: ${decision}`)
        .join('\n') +
      `\nYou MUST encode these exact technical choices into constitution.md technicalConstraints, securityInvariants, and tasks.md implementation steps.`
  }

  let brownfieldBlock = ''
  if (input.brownfieldAssets && input.brownfieldAssets.trim()) {
    brownfieldBlock = `\nEXISTING REPOSITORY ASSETS & BROWNFIELD CONTEXT (MANDATORY INVARIANTS):\n` +
      `\`\`\`\n${input.brownfieldAssets.trim()}\n\`\`\`\n` +
      `CRITICAL BROWNFIELD DIRECTIVE: Do NOT design in a vacuum. Your Project Constitution, API Contracts, Database Models, and Task Graph MUST directly integrate with, extend, and respect these existing schemas, dependencies, and architectural patterns. Preserve existing entity names and ORM structures.`
  }

  let companyStructureBlock = ''
  if (input.companyStructure && input.companyStructure.trim()) {
    companyStructureBlock = `\nINTERNAL COMPANY STRUCTURE & TEAM TOPOLOGY (CONWAY'S LAW INVARIANTS):\n` +
      `${input.companyStructure.trim()}\n` +
      `MANDATORY TEAM DIRECTIVE: Structure tasks.md implementation phases, component ownership, and architectural boundaries to match this team topology and governance model.`
  }

  const chosenJurisdiction = input.jurisdiction || 'Global Baseline (Default)'

  const userPrompt = `Synthesize an enterprise-grade 4-Pillar SDD specification package for the following initiative:

INITIATIVE DOMAIN: ${input.domain}
TARGET REGULATORY & CYBERSECURITY JURISDICTION: ${chosenJurisdiction}
RIGOR / TARGET DEPTH: ${input.targetDepth}

INITIATIVE / FEATURE DESCRIPTION:
${input.requirement}
${decisionsBlock}
${brownfieldBlock}
${companyStructureBlock}

MANDATORY CYBERSECURITY DIRECTIVES:
1. Automatically formulate and inject an explicit STRIDE Threat Modeling Matrix table inside constitution.strideThreatMatrix (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) with concrete architectural mitigations.
2. In constitution.technicalConstraints, strictly enforce the Approved Ecosystem Packages (Anti-Slopsquatting) invariant:
   - Auth: Native jose or @auth/core
   - Database: Parameterized queries or approved ORM (@prisma/client, drizzle-orm). Raw SQL concatenation is forbidden.
   - Crypto: Web Crypto API or Node native crypto only.
3. In constitution.securityInvariants, inject non-negotiable legal and regulatory controls reflecting ${chosenJurisdiction}.

Generate the complete JSON object including constitution, functionalSpec, taskGraph, governance, and architectureDiagrams.`


  // -------------------------------------------------------------
  // 1. Google Gemini Native API
  // -------------------------------------------------------------
  if (settings.providerPreset === 'gemini') {
    const cleanModel = settings.model.replace(/^models\//, '')
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${settings.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SPECGLOW_SYSTEM_PROMPT}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2
        }
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Google Gemini Error (${response.status}): ${err.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('No content returned from Gemini model.')

    const parsed = cleanAndParseJSON(content) as Record<string, unknown>
    return formatSddArtifactPackage(parsed, input)
  }

  // -------------------------------------------------------------
  // 2. Anthropic Claude API
  // -------------------------------------------------------------
  if (settings.providerPreset === 'anthropic') {
    const url = `${settings.baseUrl.replace(/\/+$/, '')}/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 4096,
        system: SPECGLOW_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Anthropic Claude Error (${response.status}): ${err.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text
    if (!content) throw new Error('No content returned from Anthropic model.')

    const parsed = cleanAndParseJSON(content) as Record<string, unknown>
    return formatSddArtifactPackage(parsed, input)
  }

  // -------------------------------------------------------------
  // 3. OpenAI & Compatible Providers (Groq, DeepSeek, Ollama, xAI, OpenRouter, Custom)
  // -------------------------------------------------------------
  const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '')
  const endpoint = `${cleanBaseUrl}/chat/completions`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (settings.apiKey && settings.apiKey.trim() !== '') {
    headers['Authorization'] = `Bearer ${settings.apiKey.trim()}`
  }

  const payload: Record<string, unknown> = {
    model: settings.model,
    messages: [
      { role: 'system', content: SPECGLOW_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2
  }

  // Support response_format: json_object if not Local Ollama or OpenRouter
  if (['openai', 'groq', 'deepseek', 'xai'].includes(settings.providerPreset)) {
    payload.response_format = { type: 'json_object' }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`API Error (${response.status} from ${settings.providerPreset}): ${err.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Received an empty response from model.')

  const parsed = cleanAndParseJSON(content) as Record<string, unknown>
  return formatSddArtifactPackage(parsed, input)
}

/**
 * Synthesizes default Mermaid diagrams if the model response omitted them or generated invalid syntax.
 */
function generateDefaultDiagrams(
  title: string,
  functionalSpec: SddArtifactPackage['functionalSpec']
): SddArtifactPackage['architectureDiagrams'] {
  const actor = functionalSpec.userJourneys?.[0]?.actor || 'Authorized User'
  const primaryApi = functionalSpec.apiContracts?.[0]?.endpoint || '/api/v1/resource'
  const entity = functionalSpec.stateTransitions?.[0]?.entity || 'Resource'
  const safeTitle = title.replace(/"/g, "'")

  return {
    systemContextC4: `flowchart TD
  subgraph Clients ["📱 Client Layer"]
    User["👤 ${actor}"]
  end

  subgraph Perimeter ["🛡️ API Perimeter"]
    Gateway["API Gateway & Auth Verification"]
  end

  subgraph Services ["⚙️ Application Core"]
    AppService["${safeTitle} Engine"]
    AuditSvc["Audit & Logging Service"]
  end

  subgraph DataLayer ["🗄️ Persistence Layer"]
    Cache[("⚡ Distributed Redis Cache")]
    Database[("🗄️ Primary PostgreSQL")]
  end

  User -->|HTTPS + Token| Gateway
  Gateway --> AppService
  AppService <--> Cache
  AppService --> Database
  AppService --> AuditSvc
  AuditSvc --> Database`,

    sequenceDiagram: `sequenceDiagram
  autonumber
  actor User as ${actor}
  participant GW as API Gateway & Auth
  participant Svc as Core Engine
  participant DB as PostgreSQL DB

  User->>GW: Request ${primaryApi}
  GW->>GW: Verify Auth Token & Invariants
  GW->>Svc: Forward Validated Request
  Svc->>DB: Query / Mutate State for ${entity}
  DB-->>Svc: Success
  Svc-->>GW: Synthesized Contract Payload
  GW-->>User: 200 OK Response`,

    entityRelationshipDiagram: `erDiagram
  TENANT ||--o{ ${entity.toUpperCase().replace(/[^A-Z0-9_]/g, '_')} : owns
  ${entity.toUpperCase().replace(/[^A-Z0-9_]/g, '_')} ||--o{ AUDIT_LOG : tracks
  TENANT {
    uuid id PK
    string name
    string subscription_tier
  }
  ${entity.toUpperCase().replace(/[^A-Z0-9_]/g, '_')} {
    uuid id PK
    uuid tenant_id FK
    string status
    timestamp created_at
  }
  AUDIT_LOG {
    uuid id PK
    uuid entity_id FK
    string action
    timestamp timestamp
  }`
  }
}

/**
 * Format and validate parsed object into a clean SddArtifactPackage
 */
function formatSddArtifactPackage(parsed: Record<string, unknown>, input: RequirementInput): SddArtifactPackage {
  const fallback = DEMO_SDD_PACKAGES['fintech']
  const title = (parsed.title as string) || 'Enterprise SpecGlow SDD Initiative'
  const constitution = (parsed.constitution as SddArtifactPackage['constitution']) || fallback.constitution
  const functionalSpec = (parsed.functionalSpec as SddArtifactPackage['functionalSpec']) || fallback.functionalSpec
  const taskGraph = (parsed.taskGraph as SddArtifactPackage['taskGraph']) || fallback.taskGraph
  const governance = (parsed.governance as SddArtifactPackage['governance']) || fallback.governance

  // Ensure STRIDE Threat Matrix is populated
  if (!constitution.strideThreatMatrix || constitution.strideThreatMatrix.length === 0) {
    constitution.strideThreatMatrix = [
      {
        category: 'Spoofing',
        threat: 'Adversary injects spoofed JWT bearer tokens or forges caller identities.',
        architecturalMitigation: 'Asymmetric Ed25519/RS256 JWT validation with strict issuer, audience, and expiration verification via native jose.'
      },
      {
        category: 'Tampering',
        threat: 'Modification of financial or state records directly in database or transit.',
        architecturalMitigation: 'Cryptographic HMAC-SHA256 payload signing, TLS 1.3 in-transit enforcement, and append-only audit log tables.'
      },
      {
        category: 'Repudiation',
        threat: 'User claims they did not initiate a critical state transition or transaction.',
        architecturalMitigation: 'Immutable transactional write-ahead event stream with client public key signatures and NTP-synchronized audit logs.'
      },
      {
        category: 'Information Disclosure',
        threat: 'Unauthorized leakage of PII, PHI, or secrets in API responses, logs, or error dumps.',
        architecturalMitigation: 'Envelope encryption via Cloud KMS (AES-256-GCM), zero-log PII masking filter, and strict database row-level security (RLS).'
      },
      {
        category: 'Denial of Service',
        threat: 'Exhaustion of database connection pools or compute resources via burst API traffic.',
        architecturalMitigation: 'Distributed Redis token-bucket rate-limiting (per-IP and per-tenant) with ingress WAF payload size restrictions.'
      },
      {
        category: 'Elevation of Privilege',
        threat: 'Standard tenant user accesses administrative endpoints or other tenant resources (BOLA / IDOR).',
        architecturalMitigation: 'Role-Based and Attribute-Based Access Control (RBAC/ABAC) middleware enforcing tenant boundary checks on every route.'
      }
    ]
  }

  // Ensure Anti-Slopsquatting Approved Packages invariant is explicitly in technicalConstraints
  const hasWhitelistConstraint = constitution.technicalConstraints.some(
    c => c.rule.toLowerCase().includes('approved ecosystem packages') || c.rule.toLowerCase().includes('slopsquatting')
  )
  if (!hasWhitelistConstraint) {
    constitution.technicalConstraints.unshift({
      category: 'Forbidden Packages / Patterns',
      rule: 'Approved Ecosystem Packages Only (Zero-Slopsquatting): AI coding agents must NEVER install unvetted or hallucinated third-party libraries. Auth: Native jose or @auth/core. DB: Parameterized queries or approved ORM (@prisma/client, drizzle-orm). Crypto: Web Crypto API or Node native crypto only.',
      rationale: 'Protect against package typosquatting, dependency supply-chain poisoning, and LLM package hallucination.'
    })
  }

  // Check if LLM returned valid architectureDiagrams
  const parsedDiagrams = parsed.architectureDiagrams as SddArtifactPackage['architectureDiagrams'] | undefined
  const hasValidDiagrams =
    parsedDiagrams &&
    typeof parsedDiagrams.systemContextC4 === 'string' &&
    parsedDiagrams.systemContextC4.trim() !== '' &&
    typeof parsedDiagrams.sequenceDiagram === 'string' &&
    typeof parsedDiagrams.entityRelationshipDiagram === 'string'

  const architectureDiagrams = hasValidDiagrams
    ? parsedDiagrams
    : generateDefaultDiagrams(title, functionalSpec)

  return {
    id: `sdd-${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    domain: input.domain,
    targetDepth: input.targetDepth,
    jurisdiction: input.jurisdiction || 'Global Baseline (Default)',
    originalPrompt: input.requirement,
    constitution,
    functionalSpec,
    taskGraph,
    governance,
    architectureDiagrams
  }
}

