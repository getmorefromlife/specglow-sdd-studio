import type { SddArtifactPackage, RequirementInput, Settings } from '../types'
import { SPECGLOW_SYSTEM_PROMPT } from '../utils/constants'
import { DEMO_SDD_PACKAGES } from './demoSddPresets'

/**
 * Resilient JSON repair and parser for LLM responses.
 * Handles code fences, control characters, trailing commas, and truncated payloads.
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

  // 1. Direct parse attempt
  try {
    return JSON.parse(cleaned)
  } catch {
    // Proceed to repair heuristics
  }

  // 2. Remove trailing commas before closing braces/brackets
  let repaired = cleaned.replace(/,\s*([}\]])/g, '$1')

  // Remove illegal control characters that crash JSON.parse
  repaired = repaired.replace(/[\x00-\x1F\x7F-\x9F]/g, c => (c === '\n' || c === '\r' || c === '\t' ? c : ''))

  try {
    return JSON.parse(repaired)
  } catch {
    // Proceed to truncation balancer
  }

  // 3. Truncation Balancer (recovers JSON cut off mid-stream by token limit)
  try {
    let inString = false
    let isEscaped = false
    let openBraces = 0
    let openBrackets = 0

    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i]
      if (char === '\\' && !isEscaped) {
        isEscaped = true
        continue
      }
      if (char === '"' && !isEscaped) {
        inString = !inString
      } else if (!inString) {
        if (char === '{') openBraces++
        else if (char === '}') openBraces = Math.max(0, openBraces - 1)
        else if (char === '[') openBrackets++
        else if (char === ']') openBrackets = Math.max(0, openBrackets - 1)
      }
      isEscaped = false
    }

    let balanced = repaired
    if (inString) {
      balanced += '"'
    }
    balanced = balanced.replace(/,\s*$/, '').replace(/:\s*$/, ': null')

    while (openBrackets > 0) {
      balanced += ']'
      openBrackets--
    }
    while (openBraces > 0) {
      balanced += '}'
      openBraces--
    }

    return JSON.parse(balanced)
  } catch {
    throw new Error('LLM output could not be recovered as valid JSON.')
  }
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
    return getEnrichedReferencePackage(input, settings, 'Interactive Reference Mode')
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
  const platformTarget = input.platformTarget || 'web-portal'
  const techStack = input.techStack || 'stack-agnostic'
  const enableRtl = input.enableRtlMultilingual || false

  const userPrompt = `Synthesize an enterprise-grade 4-Pillar SDD specification package for the following initiative:

INITIATIVE DOMAIN: ${input.domain}
PLATFORM DELIVERY TARGET: ${platformTarget} (e.g. web-portal, mobile-app, saas-web, e-commerce)
PREFERRED TECH STACK: ${techStack}
MULTILINGUAL & RTL SUPPORT: ${enableRtl ? 'ENABLED (Arabic, Urdu, English i18n + CSS Logical Properties)' : 'STANDARD LTR'}
TARGET REGULATORY & CYBERSECURITY JURISDICTION: ${chosenJurisdiction}
RIGOR / TARGET DEPTH: ${input.targetDepth}

INITIATIVE / FEATURE DESCRIPTION:
${input.requirement}
${decisionsBlock}
${brownfieldBlock}
${companyStructureBlock}

MANDATORY ARCHITECTURAL DIRECTIVES:
1. Automatically formulate and inject an explicit STRIDE Threat Modeling Matrix table inside constitution.strideThreatMatrix (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) with concrete architectural mitigations.
2. In constitution.technicalConstraints, strictly enforce the Approved Ecosystem Packages (Anti-Slopsquatting) invariant:
   - Auth: Native jose or @auth/core
   - Database: Parameterized queries or approved ORM (@prisma/client, drizzle-orm). Raw SQL concatenation is forbidden.
   - Crypto: Web Crypto API or Node native crypto only.
3. PLATFORM & STACK DIRECTIVES:
   ${platformTarget === 'mobile-app' ? '- Mandate offline-first persistence (SQLite/MMKV), push notification lifecycle (APNs/FCM), FaceID/Biometrics, and 48x48px WCAG tap targets.' : '- Mandate Core Web Vitals (<1.2s LCP), SEO OpenGraph metadata, JSON-LD schemas, and CDN edge cache headers.'}
   ${techStack !== 'stack-agnostic' ? `- Strictly bind implementation tasks to ${techStack}. If using Next.js + shadcn/ui, only use components from @/components/ui; never write ad-hoc CSS classes or unvetted UI libraries.` : ''}
   ${enableRtl ? '- Inject mandatory dir="rtl" support, CSS logical properties (ms-, me-, ps-, pe-), and Google Noto Naskh Arabic / Noto Nastaliq Urdu typography.' : ''}
4. CLOUD & HOSTING BLUEPRINT (in governance.executiveStatusReport):
   - Include a dedicated section detailing the "Recommended Zero/Low-Cost Production Hosting Blueprint":
     * Frontend/Web: Vercel / Cloudflare Pages
     * Database: Supabase / Neon Serverless PostgreSQL
     * Media/Video: Cloudflare R2 (zero egress fees) / Mux
     * Mobile: Expo Application Services (EAS) for iOS TestFlight & Android Play Store.
5. In constitution.securityInvariants, inject non-negotiable legal and regulatory controls reflecting ${chosenJurisdiction}.

Generate the complete JSON object including constitution, functionalSpec, taskGraph, governance, and architectureDiagrams.`


  // -------------------------------------------------------------
  // Live Model Synthesis with Resilient Auto-Recovery
  // -------------------------------------------------------------
  try {
    // 1. Google Gemini Native API
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
            temperature: 0.2,
            maxOutputTokens: 8192
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

    // 2. Anthropic Claude API
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
          max_tokens: 8192,
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

    // 3. OpenAI & Compatible Providers (Groq, DeepSeek, Ollama, xAI, OpenRouter, Custom)
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
      temperature: 0.2,
      max_tokens: 8192
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.warn(`Live AI synthesis notice (${errorMsg}); safely delivering enriched enterprise reference package.`)
    return getEnrichedReferencePackage(input, settings, `Live AI Notice: ${errorMsg}`)
  }
}

/**
 * Enriches a reference blueprint with user input parameters, architectural decisions, and platform targets.
 */
function getEnrichedReferencePackage(
  input: RequirementInput,
  _settings?: Settings,
  notice?: string
): SddArtifactPackage {
  let matchedDemoKey = 'saas'
  if (input.domain.toLowerCase().includes('fintech') || input.domain.toLowerCase().includes('bank')) {
    matchedDemoKey = 'fintech'
  } else if (input.domain.toLowerCase().includes('health') || input.domain.toLowerCase().includes('clinical')) {
    matchedDemoKey = 'healthcare'
  }

  const matched = DEMO_SDD_PACKAGES[matchedDemoKey] || DEMO_SDD_PACKAGES['fintech']
  const derivedTitle = input.requirement.trim().length > 10
    ? input.requirement.trim().split('\n')[0].substring(0, 55).replace(/[.]+$/, '')
    : matched.title

  // Format decisions as confirmed architectural constraints
  const decisionConstraints = input.architecturalDecisions
    ? Object.entries(input.architecturalDecisions).map(([category, decision]) => ({
        category: 'Architectural Invariant' as const,
        rule: `[${category}]: ${decision}`,
        rationale: 'Confirmed by Principal Architect during Pre-Synthesis Interrogation.'
      }))
    : []

  const constitution = {
    ...matched.constitution,
    technicalConstraints: [
      ...decisionConstraints,
      ...matched.constitution.technicalConstraints
    ]
  }

  let executiveReport = matched.governance.executiveStatusReport
  if (notice) {
    executiveReport = `> ℹ️ **Synthesis Mode Status:** ${notice}\n\n` + executiveReport
  }

  return formatSddArtifactPackage(
    {
      title: derivedTitle,
      constitution,
      functionalSpec: matched.functionalSpec,
      taskGraph: matched.taskGraph,
      governance: {
        ...matched.governance,
        executiveStatusReport: executiveReport
      },
      architectureDiagrams: matched.architectureDiagrams
    },
    input
  )
}

/**
 * Synthesizes default Mermaid diagrams if the model response omitted them or generated invalid syntax.
 */
function generateDefaultDiagrams(
  title: string,
  functionalSpec: SddArtifactPackage['functionalSpec']
): SddArtifactPackage['architectureDiagrams'] {
  const actor = (functionalSpec.userJourneys?.[0]?.actor || 'Authorized User').replace(/["()]/g, '')
  const primaryApi = (functionalSpec.apiContracts?.[0]?.endpoint || '/api/v1/resource').replace(/["()]/g, '')
  const rawEntity = functionalSpec.stateTransitions?.[0]?.entity || 'Resource'
  const entity = rawEntity.replace(/[^A-Za-z0-9_]/g, '_')
  const safeTitle = title.replace(/["()]/g, "'")

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

  // Inject Platform & Tech Stack Invariants if not already present
  const platformTarget = input.platformTarget || 'web-portal'
  const techStack = input.techStack || 'stack-agnostic'
  const enableRtl = input.enableRtlMultilingual || false

  if (platformTarget === 'mobile-app') {
    const hasMobile = constitution.technicalConstraints.some(c => c.rule.toLowerCase().includes('mobile native architecture') || c.rule.toLowerCase().includes('sqlite/mmkv'))
    if (!hasMobile) {
      constitution.technicalConstraints.push({
        category: 'Frameworks & Libraries',
        rule: 'Mobile Native Architecture: Offline-first persistence via SQLite/MMKV, push notification token lifecycle (APNs/FCM), FaceID/Biometrics authentication, and minimum 48x48px WCAG touch targets.',
        rationale: 'Mandatory cross-platform mobile app usability and offline resilience.'
      })
    }
  } else {
    const hasWeb = constitution.technicalConstraints.some(c => c.rule.toLowerCase().includes('web portal performance') || c.rule.toLowerCase().includes('core web vitals'))
    if (!hasWeb) {
      constitution.technicalConstraints.push({
        category: 'Frameworks & Libraries',
        rule: 'Web Portal Performance & SEO: Mandatory Core Web Vitals (<1.2s LCP, <100ms INP, 0 CLS), OpenGraph metadata, JSON-LD structured schemas, and CDN edge cache-control headers.',
        rationale: 'Public discoverability, organic search ranking, and instant first-contentful paint.'
      })
    }
  }

  if (techStack !== 'stack-agnostic') {
    const hasStack = constitution.technicalConstraints.some(c => c.rule.includes(techStack))
    if (!hasStack) {
      constitution.technicalConstraints.push({
        category: 'Frameworks & Libraries',
        rule: `Enforced Tech Stack (${techStack}): AI agents must strictly build on the designated stack. If Next.js + shadcn/ui is selected, only import components from @/components/ui; never write ad-hoc CSS classes or install rogue UI libraries.`,
        rationale: 'Strict UI consistency and prevention of dependency sprawl.'
      })
    }
  }

  if (enableRtl) {
    const hasRtl = constitution.technicalConstraints.some(c => c.rule.toLowerCase().includes('multilingual & bidirectional rtl invariant'))
    if (!hasRtl) {
      constitution.technicalConstraints.push({
        category: 'Frameworks & Libraries',
        rule: 'Multilingual & Bidirectional RTL Invariant: Enforce dir="rtl" support, CSS Logical Properties (ms-, me-, ps-, pe-, start-, end- instead of left/right), and Google Noto Naskh Arabic / Noto Nastaliq Urdu font fallbacks.',
        rationale: 'First-class localized user experience for Arabic and Urdu speaking populations.'
      })
    }
  }

  // Ensure Recommended Zero/Low-Cost Production Hosting Blueprint is in governance.executiveStatusReport
  if (!governance.executiveStatusReport.includes('Recommended Zero/Low-Cost Production Hosting Blueprint')) {
    governance.executiveStatusReport += `\n\n### 🌐 Recommended Zero/Low-Cost Production Hosting Blueprint
- **Frontend / Edge Delivery:** Vercel (Edge Network) or Cloudflare Pages (Unlimited bandwidth, global CDN).
- **Relational Database:** Supabase or Neon Serverless PostgreSQL (Automated branching, row-level security).
- **Blob & Video Storage:** Cloudflare R2 (Zero egress bandwidth fees, S3 API compatible) or Mux (for adaptive HLS video streaming).
- **Mobile Deployment (if applicable):** Expo Application Services (EAS Build & Submit) for automated iOS TestFlight and Android Google Play internal tracks.
- **CI/CD Quality Guardrails:** GitHub Actions running \`.github/workflows/sdd-verify.yml\` with zero cost on public repos.`
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
    platformTarget,
    techStack,
    enableRtlMultilingual: enableRtl,
    companyStructure: input.companyStructure,
    originalPrompt: input.requirement,
    constitution,
    functionalSpec,
    taskGraph,
    governance,
    architectureDiagrams
  }
}

