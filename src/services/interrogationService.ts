import type {
  ArchitecturalInterrogationQuestion,
  RequirementInput,
  Settings
} from '../types'

/**
 * Pre-compiled domain-specific architectural trade-off questions for offline and fast-track modes.
 */
export const DOMAIN_FALLBACK_QUESTIONS: Record<string, ArchitecturalInterrogationQuestion[]> = {
  fintech: [
    {
      id: 'q-fintech-1',
      category: 'Data Isolation & Ledger Immutability',
      question: 'How should ledger transaction records and account balances be stored and isolated?',
      context: 'Financial regulations (SOX, PCI-DSS) require auditability and defense against balance tampering.',
      options: [
        {
          id: 'opt-1a',
          label: 'Append-Only Write-Ahead Ledger with SQL Triggers blocking UPDATE/DELETE',
          implication: 'Maximum audit compliance and zero tamper risk. Requires compensating transactions for reversals.',
          isRecommended: true
        },
        {
          id: 'opt-1b',
          label: 'Event-Sourced Event Store with periodic materialized balance snapshots',
          implication: 'High write throughput; requires snapshot reconstruction logic during reads.'
        },
        {
          id: 'opt-1c',
          label: 'Standard Relational Tables with row-versioned audit log shadows',
          implication: 'Simplest to implement; requires strict DB privileges to prevent direct row modifications.'
        }
      ]
    },
    {
      id: 'q-fintech-2',
      category: 'Concurrency & Double-Spend Defense',
      question: 'What mechanism guarantees zero double-spend under high concurrent request volume?',
      context: 'Network latency and user re-clicks can cause duplicate debit/credit transfers.',
      options: [
        {
          id: 'opt-2a',
          label: 'Distributed Redis SETNX Idempotency Locks + PostgreSQL SERIALIZABLE isolation',
          implication: 'Strict zero-double-spend guarantee. Trades off retry latency under high contention.',
          isRecommended: true
        },
        {
          id: 'opt-2b',
          label: 'Pessimistic Row-Level Locking (SELECT ... FOR UPDATE) on Account IDs',
          implication: 'Strong consistency; potential database connection pool bottlenecks under burst loads.'
        },
        {
          id: 'opt-2c',
          label: 'Optimistic Locking with version columns and client-side exponential backoff',
          implication: 'High concurrency; fails transactions under simultaneous transfers requiring client retries.'
        }
      ]
    },
    {
      id: 'q-fintech-3',
      category: 'Settlement Latency vs. Guarantees',
      question: 'How should partner bank webhook settlement notifications be processed?',
      context: 'External payment gateways and banking rails (SWIFT, Fedwire, ACH) have variable network latencies.',
      options: [
        {
          id: 'opt-3a',
          label: 'Asynchronous Durable Message Queue (Kafka / RabbitMQ) with Dead-Letter Vault',
          implication: 'Resilient against banking rail outages; handles traffic spikes with guaranteed replay.',
          isRecommended: true
        },
        {
          id: 'opt-3b',
          label: 'Synchronous Ingress Webhook execution with 5-second HTTP timeout',
          implication: 'Simpler architecture; vulnerable to gateway timeouts during partner banking rail latency.'
        }
      ]
    }
  ],
  healthcare: [
    {
      id: 'q-health-1',
      category: 'PHI Data Protection & Field-Level Encryption',
      question: 'Where and how should Protected Health Information (PHI) be encrypted?',
      context: 'HIPAA Security Rule mandates that patient identifiers and clinical records are protected at rest and in transit.',
      options: [
        {
          id: 'opt-1a',
          label: 'Envelope Encryption via Cloud KMS (AES-256-GCM) at the application service layer',
          implication: 'Database administrators cannot view plain PHI. Requires per-tenant/record key management.',
          isRecommended: true
        },
        {
          id: 'opt-1b',
          label: 'Transparent Data Encryption (TDE) at the database storage engine volume level',
          implication: 'Zero application query overhead; DBA accounts with elevated privileges can read plain records.'
        }
      ]
    },
    {
      id: 'q-health-2',
      category: 'Audit Logging & Access Accountability',
      question: 'How should clinician access to patient charts and consultation sessions be audited?',
      context: 'HIPAA requires non-repudiable audit logs of every medical chart view.',
      options: [
        {
          id: 'opt-2a',
          label: 'WORM (Write-Once-Read-Many) append-only logging pipeline to isolated S3 object lock',
          implication: 'Immutable audit trail. Impossible for malicious insiders or compromised tokens to delete logs.',
          isRecommended: true
        },
        {
          id: 'opt-2b',
          label: 'Standard database audit table with periodic log rotation',
          implication: 'Simpler setup; vulnerable if database superuser credentials are compromised.'
        }
      ]
    },
    {
      id: 'q-health-3',
      category: 'Consultation Video Triage & Media Stream',
      question: 'What transport architecture governs physician-patient telehealth sessions?',
      context: 'Real-time video/audio must adhere to low-latency WebRTC and zero cloud storage of unrecorded calls.',
      options: [
        {
          id: 'opt-3a',
          label: 'Peer-to-Peer WebRTC with Ephemeral TURN/STUN and Zero-Retention Media Servers',
          implication: 'Zero video stream stored on intermediate servers; HIPAA compliant by architectural design.',
          isRecommended: true
        },
        {
          id: 'opt-3b',
          label: 'Selective Forwarding Unit (SFU) with optional encrypted cloud session recording',
          implication: 'Supports multi-party consults; requires secure signed BAA with SFU cloud provider.'
        }
      ]
    }
  ],
  edtech: [
    {
      id: 'q-edtech-1',
      category: 'Telemetry & Learning Analytics Standard',
      question: 'What standard will govern student activity telemetry and progress tracking?',
      context: 'FERPA and COPPA mandate strict student privacy, while institutional LMS platforms demand SCORM/xAPI interoperability.',
      options: [
        {
          id: 'opt-edtech-1a',
          label: 'xAPI (Experience API / Tin Can) with Dedicated Learning Record Store (LRS)',
          implication: 'Industry-standard fine-grained telemetry; supports offline mobile sync and statement signing.',
          isRecommended: true
        },
        {
          id: 'opt-edtech-1b',
          label: 'Internal Event-Driven Kafka Stream with Materialized Student Dashboards',
          implication: 'Maximum low-latency throughput; requires custom connector adaptors for third-party LMS integration.'
        }
      ]
    },
    {
      id: 'q-edtech-2',
      category: 'Video & Interactive Media Delivery',
      question: 'How should high-bandwidth video lectures and interactive course assets be streamed?',
      context: 'Global student bandwidth varies significantly, while intellectual property must be protected from scraping.',
      options: [
        {
          id: 'opt-edtech-2a',
          label: 'Adaptive Bitrate HLS / DASH via Edge Cloudflare Stream with DRM Tokenization',
          implication: 'Zero buffer lag across 3G/4G networks; defends video content against unauthorized downloaders.',
          isRecommended: true
        },
        {
          id: 'opt-edtech-2b',
          label: 'Pre-Signed Object Storage URLs (Cloudflare R2 / S3) with Direct MP4 Streaming',
          implication: 'Minimal operational cost; vulnerable to stream link sharing and lacks adaptive bandwidth transcoding.'
        }
      ]
    }
  ],
  'ethical-community': [
    {
      id: 'q-ethical-1',
      category: 'Identity Privacy & Anonymity Bounds',
      question: 'How will member identity, whistleblowing, and sensitive disclosures be safeguarded?',
      context: 'Community and mutual aid platforms require high psychological safety without storing vulnerable user data.',
      options: [
        {
          id: 'opt-eth-1a',
          label: 'Zero-Knowledge Pseudonymous DIDs with Ephemeral Cryptographic Signatures',
          implication: 'Guarantees that database compromises cannot de-anonymize community activists or vulnerable members.',
          isRecommended: true
        },
        {
          id: 'opt-eth-1b',
          label: 'Hashed Salted Identifiers with Automated 30-Day Hard PURGE Database Schedules',
          implication: 'Simpler relational architecture; temporary identity correlation window exists prior to purge cycle.'
        }
      ]
    },
    {
      id: 'q-ethical-2',
      category: 'Content Moderation & Reputation Governance',
      question: 'What mechanism governs community moderation and abusive content filtering?',
      context: 'Centralized admin queues risk bias, while automated moderation can silence marginalized voices.',
      options: [
        {
          id: 'opt-eth-2a',
          label: 'Decentralized Multi-Signature Community Consensus Flagging with Appeal Escrow',
          implication: 'High community trust and transparent governance; requires active quorum for dispute resolution.',
          isRecommended: true
        },
        {
          id: 'opt-eth-2b',
          label: 'Zero-Retention Client-Side Machine Moderation with Private Flag Reporting',
          implication: 'Instantaneous abuse triage; potential false positives requiring manual curator intervention.'
        }
      ]
    }
  ],
  default: [
    {
      id: 'q-default-1',
      category: 'Data Isolation & Tenancy Model',
      question: 'What multi-tenancy isolation boundary best balances data security and operational complexity?',
      context: 'Determines whether tenants share database tables, schemas, or dedicated databases.',
      options: [
        {
          id: 'opt-1a',
          label: 'Shared Database with PostgreSQL Row-Level Security (RLS) and strict tenant_id constraints',
          implication: 'Cost-effective and scalable; requires rigorous testing to guarantee zero cross-tenant leakage.',
          isRecommended: true
        },
        {
          id: 'opt-1b',
          label: 'Schema-per-tenant on a shared database cluster',
          implication: 'Strong logical separation; schema migration complexity scales linearly with tenant count.'
        },
        {
          id: 'opt-1c',
          label: 'Dedicated isolated database instance per tenant',
          implication: 'Maximum isolation for high-compliance enterprise clients; higher infrastructure overhead.'
        }
      ]
    },
    {
      id: 'q-default-2',
      category: 'API Contract & Authentication Standard',
      question: 'What authorization protocol and token verification strategy should be enforced?',
      context: 'Governs client identity, API rate limiting, and RBAC permission checks.',
      options: [
        {
          id: 'opt-2a',
          label: 'Stateless JWT Access Tokens (15m expiry) + Cryptographic Refresh Tokens in HTTP-Only Cookies',
          implication: 'Scalable across distributed nodes; requires Redis token revocation blacklist for emergency logout.',
          isRecommended: true
        },
        {
          id: 'opt-2b',
          label: 'Stateful Server-Side Sessions stored in distributed Redis cache',
          implication: 'Instant token revocation; introduces a hard dependency on Redis availability for every request.'
        },
        {
          id: 'opt-2c',
          label: 'Mutual TLS (mTLS) + HMAC API Key Header for service-to-service communication',
          implication: 'Ideal for machine-to-machine integrations; high certificate lifecycle management overhead.'
        }
      ]
    },
    {
      id: 'q-default-3',
      category: 'Consistency vs. Availability (CAP Trade-off)',
      question: 'Under network partition or high database load, which system guarantee takes priority?',
      context: 'Defines how the application behaves during distributed cache lag or database replica latency.',
      options: [
        {
          id: 'opt-3a',
          label: 'Strong Consistency (CP): Fail or reject concurrent updates if synchronous replicas are unconfirmed',
          implication: 'Guarantees absolute data accuracy; brief availability drop during primary database failover.',
          isRecommended: true
        },
        {
          id: 'opt-3b',
          label: 'Eventual Consistency (AP): Accept writes immediately and propagate asynchronously',
          implication: 'Maximum 99.99% uptime; read queries may temporarily return stale state for several seconds.'
        }
      ]
    },
    {
      id: 'q-default-4',
      category: 'Event Propagation & Async Workflows',
      question: 'How should secondary side-effects (notifications, audit logging, analytics) be processed?',
      context: 'Heavy operations inside the HTTP request loop degrade API response times.',
      options: [
        {
          id: 'opt-4a',
          label: 'Transactional Outbox Pattern with CDC / Background Worker polling',
          implication: 'Zero dual-write inconsistency between DB and message queue; atomic reliability.',
          isRecommended: true
        },
        {
          id: 'opt-4b',
          label: 'Direct fire-and-forget publish to SQS / Redis Streams in the API route',
          implication: 'Low latency; potential lost messages if message broker is down during DB commit.'
        }
      ]
    }
  ]
}

/**
 * Mandatory architectural dilemmas tailored to each of the 7 global regulatory jurisdictions.
 */
export const JURISDICTION_DILEMMAS: Record<string, ArchitecturalInterrogationQuestion> = {
  'GCC & Middle East': {
    id: 'q-jur-gcc',
    category: 'Regulatory Jurisdiction (Saudi NCA ECC/CCC & SAMA Cyber)',
    question: 'How will in-Kingdom sovereign data residency and key management compliance be enforced?',
    context: 'Saudi NCA (ECC-1:2018 / CCC-1:2020) and SAMA Cyber Framework mandate that financial and citizen data cannot egress beyond national boundaries.',
    options: [
      {
        id: 'opt-gcc-1',
        label: 'Strict In-Kingdom Cloud Region (AWS/Oracle/Google Cloud Saudi) with dedicated HSM enclave',
        implication: '100% sovereign compliance; prevents unauthorized international data egress at the network routing layer.',
        isRecommended: true
      },
      {
        id: 'opt-gcc-2',
        label: 'Hybrid Architecture with On-Premise Master HSM and regional edge compute proxies',
        implication: 'Maximum sovereignty control; introduces maintenance overhead and cross-site latency.'
      }
    ]
  },
  'European Union & UK': {
    id: 'q-jur-eu',
    category: 'Regulatory Jurisdiction (GDPR / EU AI Act Article 12 / DORA)',
    question: 'How are GDPR Right-to-be-Forgotten and EU AI Act auditability requirements architecturalized?',
    context: 'EU AI Act Article 12 mandates continuous automated event logging for high-risk systems, while GDPR Article 17 requires deterministic deletion of all PII.',
    options: [
      {
        id: 'opt-eu-1',
        label: 'Cryptographic Shredding (per-tenant encryption key destroyed upon deletion) + Immutable Append-Only Audit Trail',
        implication: 'Immediate GDPR compliance even across immutable backups, combined with tamper-proof DORA/EU AI Act compliance.',
        isRecommended: true
      },
      {
        id: 'opt-eu-2',
        label: 'Soft-Delete Tombstone Flags with scheduled asynchronous batch purge jobs',
        implication: 'Simpler application design; risks GDPR compliance breach if automated purge tasks fail or get backlogged.'
      }
    ]
  },
  'Australia & New Zealand (ANZ)': {
    id: 'q-jur-anz',
    category: 'Regulatory Jurisdiction (APRA CPS 234 / ACSC Essential Eight)',
    question: 'How will APRA CPS 234 information asset defense and Essential Eight application control be guaranteed?',
    context: 'APRA CPS 234 mandates tested operational capability against systemic disruptions and strict access control for information assets.',
    options: [
      {
        id: 'opt-anz-1',
        label: 'Multi-Factor Authenticated Immutable Backups (WORM Object Lock) + Strict Code Signing Application Whitelisting',
        implication: 'Meets ACSC Essential Eight Maturity Level 3 and APRA CPS 234 audit requirements against ransomware.',
        isRecommended: true
      },
      {
        id: 'opt-anz-2',
        label: 'Standard Periodic Cloud Snapshots with IAM role-based access controls',
        implication: 'Lower infrastructure cost; fails APRA CPS 234 immutable recovery benchmarks if IAM credentials are compromised.'
      }
    ]
  },
  'North America (US & Canada)': {
    id: 'q-jur-na',
    category: 'Regulatory Jurisdiction (SOC 2 Type II / NIST CSF 2.0 / HIPAA / PCI-DSS)',
    question: 'What architectural standard enforces zero-trust data protection at rest and in transit?',
    context: 'SOC 2 Type II and NIST CSF 2.0 require continuous cryptographic validation and least-privilege boundary enforcement.',
    options: [
      {
        id: 'opt-na-1',
        label: 'mTLS 1.3 Service Mesh + Cloud KMS Envelope Encryption (AES-256-GCM) with Automated Key Rotation',
        implication: 'Exceeds SOC 2 Type II and NIST CSF 2.0 audit benchmarks. Prevents sidecar snooping.',
        isRecommended: true
      },
      {
        id: 'opt-na-2',
        label: 'TLS Termination at API Gateway with standard VPC-isolated database storage encryption',
        implication: 'Standard architecture; requires compensating controls for internal east-west microservice traffic.'
      }
    ]
  },
  'Asia-Pacific (APAC)': {
    id: 'q-jur-apac',
    category: 'Regulatory Jurisdiction (Singapore MAS TRM / India DPDP Act 2023)',
    question: 'How will recovery time objectives (RTO < 4h) and localized consent telemetry be architecturalized?',
    context: 'Singapore MAS Technology Risk Management guidelines mandate high availability and RTO under 4 hours for critical systems.',
    options: [
      {
        id: 'opt-apac-1',
        label: 'Multi-Availability Zone Active-Active Cluster with Real-Time Data Streaming and Consent Token Vault',
        implication: 'Guarantees sub-hour RTO and meets DPDP notice and consent auditability requirements.',
        isRecommended: true
      },
      {
        id: 'opt-apac-2',
        label: 'Active-Passive Warm Standby with 15-minute asynchronous replication',
        implication: 'Cost-effective; trades off potential small data loss window during catastrophic regional failover.'
      }
    ]
  },
  'Pakistan & Emerging Markets': {
    id: 'q-jur-pk',
    category: 'Regulatory Jurisdiction (SBP Cyber Security Framework / PECA / PKCERT)',
    question: 'How is the State Bank of Pakistan (SBP) dual-site DR active-active and cryptographic mandate satisfied?',
    context: 'State Bank of Pakistan (SBP) Cyber Security Framework mandates primary and secondary DR sites with synchronized transaction replication and audited HSM keys.',
    options: [
      {
        id: 'opt-pk-1',
        label: 'Domestic Dual-Site Active-Active Architecture with Synchronous DB Mirroring and FIPS 140-2 Level 3 HSM',
        implication: '100% compliant with SBP Cyber Security Framework for digital banking, wallets, and microfinance.',
        isRecommended: true
      },
      {
        id: 'opt-pk-2',
        label: 'Primary In-Country Data Center with Cloud-based Cold Disaster Recovery Site',
        implication: 'Lower CAPEX; requires explicit regulatory exemption from SBP for cloud-based failovers.'
      }
    ]
  },
  'Global Baseline (Default)': {
    id: 'q-jur-global',
    category: 'Regulatory Jurisdiction (ISO 27001:2022 & OWASP Top 10)',
    question: 'What defense-in-depth posture will govern data protection and API security boundaries?',
    context: 'ISO 27001:2022 Control 8.28 mandates secure coding and threat protection throughout the delivery lifecycle.',
    options: [
      {
        id: 'opt-global-1',
        label: 'Automated CI/CD Invariant Gating + Zero-Trust RBAC + OWASP API Security Gateway',
        implication: 'Continuous automated defense against injection, broken object-level authorization, and architectural drift.',
        isRecommended: true
      },
      {
        id: 'opt-global-2',
        label: 'Standard Perimeter Web Application Firewall (WAF) with periodic manual pen-testing',
        implication: 'Minimal dev overhead; leaves internal API endpoints vulnerable to insider threat.'
      }
    ]
  }
}

/**
 * Generate 3-5 critical architectural trade-off questions for an initiative.
 * Executes in-browser via BYOK if configured, or falls back to pre-compiled domain questions.
 */
export async function generateInterrogationQuestions(
  input: RequirementInput,
  settings: Settings,
  forceDemo: boolean = false
): Promise<ArchitecturalInterrogationQuestion[]> {
  const isKeyNeeded = settings.providerPreset !== 'ollama'
  const isOffline = forceDemo || (isKeyNeeded && (!settings.apiKey || settings.apiKey.trim() === ''))

  const chosenJurisdiction = input.jurisdiction || 'Global Baseline (Default)'
  const jurisdictionQuestion = JURISDICTION_DILEMMAS[chosenJurisdiction] || JURISDICTION_DILEMMAS['Global Baseline (Default)']

  if (isOffline) {
    const domainLower = input.domain.toLowerCase()
    let questions = [...DOMAIN_FALLBACK_QUESTIONS['default']]

    if (domainLower.includes('fintech') || domainLower.includes('banking') || domainLower.includes('wallet') || domainLower.includes('pci')) {
      questions = [...DOMAIN_FALLBACK_QUESTIONS['fintech']]
    } else if (domainLower.includes('health') || domainLower.includes('hipaa') || domainLower.includes('telehealth') || domainLower.includes('ehr')) {
      questions = [...DOMAIN_FALLBACK_QUESTIONS['healthcare']]
    } else if (domainLower.includes('edtech') || domainLower.includes('education') || domainLower.includes('lms') || domainLower.includes('ferpa') || domainLower.includes('xapi')) {
      questions = [...DOMAIN_FALLBACK_QUESTIONS['edtech']]
    } else if (domainLower.includes('ethical') || domainLower.includes('community') || domainLower.includes('non-profit') || domainLower.includes('decentralized')) {
      questions = [...DOMAIN_FALLBACK_QUESTIONS['ethical-community']]
    }

    // Prepend the mandatory jurisdictional dilemma
    if (jurisdictionQuestion && !questions.some(q => q.id === jurisdictionQuestion.id)) {
      questions = [jurisdictionQuestion, ...questions]
    }

    // Set default selected options to recommended
    return questions.map(q => ({
      ...q,
      selectedOptionId: q.options.find(o => o.isRecommended)?.id || q.options[0].id
    }))
  }

  // BYOK Dynamic Generation Prompt
  const prompt = `You are a Principal Enterprise Systems Architect (Staff / VP of Engineering caliber).
Inspect the following software initiative and generate 3 to 4 critical, high-impact ARCHITECTURAL TRADE-OFF questions to interrogate the user BEFORE generating their specification contracts.

INITIATIVE DOMAIN: ${input.domain}
TARGET REGULATORY JURISDICTION: ${chosenJurisdiction}
RIGOR DEPTH: ${input.targetDepth}
PLATFORM TARGET: ${input.platformTarget || 'web-portal'}
PREFERRED TECH STACK: ${input.techStack || 'nextjs-shadcn'}
MULTILINGUAL / RTL SUPPORT: ${input.enableRtlMultilingual ? 'Required (Arabic / Urdu / English i18n & RTL layouts)' : 'Standard LTR'}
MANDATORY REQUIREMENT: Formulate at least 1 dilemma directly resolving legal, data sovereignty, or compliance requirements for ${chosenJurisdiction}.
${input.platformTarget === 'mobile-app' ? 'PLATFORM REQUIREMENT: Include at least 1 dilemma addressing mobile offline-first synchronization, local SQLite caching, or push notifications (APNs/FCM).\n' : ''}
${input.platformTarget === 'web-portal' ? 'PLATFORM REQUIREMENT: Include at least 1 dilemma addressing content ingestion, SEO Core Web Vitals, or Headless CMS vs Edge SSR.\n' : ''}

INITIATIVE BRIEF:
${input.requirement}${input.brownfieldAssets?.trim() ? '\n\nEXISTING BROWNFIELD ASSETS / SCHEMAS:\n' + input.brownfieldAssets.trim() + '\nFormulate dilemmas specifically addressing backward compatibility, schema migrations, and breaking changes against these brownfield assets.' : ''}

FORMAT REQUIREMENT: Return ONLY a valid JSON array of objects conforming to this exact TypeScript schema:
[
  {
    "id": "q-1",
    "category": "Data Isolation & Tenancy" | "Concurrency & Ordering" | "Security & Authentication" | "Consistency vs Availability" | "Async Processing",
    "question": "Clear, direct architectural question highlighting a major dilemma?",
    "context": "Why this decision matters for system stability, compliance, or scalability",
    "options": [
      {
        "id": "opt-1a",
        "label": "Option title (concrete pattern or technology)",
        "implication": "Engineering trade-off, latency impact, or operational cost",
        "isRecommended": true
      },
      {
        "id": "opt-1b",
        "label": "Alternative option title",
        "implication": "Trade-offs and consequences",
        "isRecommended": false
      }
    ]
  }
]`

  try {
    let content: string | undefined

    if (settings.providerPreset === 'gemini') {
      const cleanModel = settings.model.replace(/^models\//, '')
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${settings.apiKey}`
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: 'application/json', temperature: 0.3 }
        })
      })
      if (!resp.ok) throw new Error(`Gemini returned ${resp.status}`)
      const json = await resp.json()
      content = json.candidates?.[0]?.content?.parts?.[0]?.text
    } else {
      const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBaseUrl}/chat/completions`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (settings.apiKey) headers['Authorization'] = `Bearer ${settings.apiKey}`

      const payload: Record<string, unknown> = {
        model: settings.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      }
      if (['openai', 'groq', 'deepseek', 'xai'].includes(settings.providerPreset)) {
        payload.response_format = { type: 'json_object' }
      }

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      if (!resp.ok) throw new Error(`API returned ${resp.status}`)
      const json = await resp.json()
      content = json.choices?.[0]?.message?.content
    }

    if (content) {
      let cleaned = content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
      if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
        const parsedObj = JSON.parse(cleaned)
        const possibleArray = Object.values(parsedObj).find(v => Array.isArray(v)) as ArchitecturalInterrogationQuestion[] | undefined
        if (possibleArray && possibleArray.length > 0) {
          return possibleArray.map(q => ({
            ...q,
            selectedOptionId: q.options.find(o => o.isRecommended)?.id || q.options[0]?.id
          }))
        }
      }
      const parsedArray = JSON.parse(cleaned) as ArchitecturalInterrogationQuestion[]
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        return parsedArray.map(q => ({
          ...q,
          selectedOptionId: q.options.find(o => o.isRecommended)?.id || q.options[0]?.id
        }))
      }
    }
  } catch (err) {
    console.warn('Failed to dynamically generate interrogation questions, using domain fallback:', err)
  }

  // Fallback to domain questions
  const fallback = DOMAIN_FALLBACK_QUESTIONS['default']
  return fallback.map(q => ({
    ...q,
    selectedOptionId: q.options.find(o => o.isRecommended)?.id || q.options[0].id
  }))
}

export interface CustomDecisionAnalysis {
  tradeoffAnalysis: string
  complianceVerdict: string
  isAcceptable: boolean
}

/**
 * Evaluates an engineer's custom write-in architectural decision using AI or heuristic analysis.
 */
export async function analyzeCustomDecisionTradeoff(
  questionTitle: string,
  context: string,
  customAnswer: string,
  domain: string,
  settings: Settings
): Promise<CustomDecisionAnalysis> {
  const fallback: CustomDecisionAnalysis = {
    tradeoffAnalysis: `Adopting custom pattern: "${customAnswer}". Ensure integration test suites and operational runbooks are pinned in code.`,
    complianceVerdict: `Compatible with ${domain.split('(')[0].trim()} assuming tamper-evident audit logging and encryption at rest are maintained.`,
    isAcceptable: true
  }

  if (!settings.apiKey || !customAnswer.trim()) {
    return fallback
  }

  const prompt = `You are a Principal Solutions Architect and Compliance Auditor.
A software project governed by regulatory domain: "${domain}" is evaluating an architectural decision.

DILEMMA QUESTION: "${questionTitle}"
CONTEXT: "${context}"
ENGINEER'S CUSTOM DECISION: "${customAnswer.trim()}"

Analyze this custom answer and return ONLY a JSON object:
{
  "tradeoffAnalysis": "1 crisp sentence analyzing the engineering pros and cons/trade-offs of this custom choice",
  "complianceVerdict": "1 crisp sentence stating if this choice meets ${domain.split('(')[0].trim()} security/compliance standards",
  "isAcceptable": true
}`

  try {
    let content: string | undefined

    if (settings.providerPreset === 'gemini') {
      const cleanModel = settings.model.replace(/^models\//, '')
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${settings.apiKey}`
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: 'application/json', temperature: 0.2 }
        })
      })
      if (!resp.ok) throw new Error(`Gemini returned ${resp.status}`)
      const json = await resp.json()
      content = json.candidates?.[0]?.content?.parts?.[0]?.text
    } else {
      const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBaseUrl}/chat/completions`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (settings.apiKey) headers['Authorization'] = `Bearer ${settings.apiKey}`

      const payload: Record<string, unknown> = {
        model: settings.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      }
      if (['openai', 'groq', 'deepseek', 'xai'].includes(settings.providerPreset)) {
        payload.response_format = { type: 'json_object' }
      }

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      if (!resp.ok) throw new Error(`API returned ${resp.status}`)
      const json = await resp.json()
      content = json.choices?.[0]?.message?.content
    }

    if (content) {
      const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
      const parsed = JSON.parse(cleaned) as CustomDecisionAnalysis
      if (parsed.tradeoffAnalysis && parsed.complianceVerdict) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to analyze custom decision with AI, using fallback:', err)
  }

  return fallback
}
