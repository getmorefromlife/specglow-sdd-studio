import type { SddArtifactPackage } from '../types'

export const DEMO_SDD_PACKAGES: Record<string, SddArtifactPackage> = {
  'fintech': {
    id: 'sdd-fintech-wallet-01',
    title: 'Fintech Multi-Currency Wallet & Settlement Service',
    createdAt: new Date().toISOString(),
    domain: 'Fintech',
    targetDepth: 'Mission-Critical / Enterprise',
    originalPrompt: 'Architect a real-time multi-currency digital wallet and FX settlement engine with double-entry ledger, idempotency keys, and 30-second quote locking.',
    constitution: {
      systemOverview: 'High-throughput, event-driven ledger architecture with ACID-compliant double-entry accounting. Operates under financial regulatory constraints requiring zero floating-point rounding errors and strictly enforced cryptographic audit chains.',
      technicalConstraints: [
        {
          category: 'Languages & Runtime',
          rule: 'TypeScript on Node.js v20+ LTS with strict immutable BigNumber decimal arithmetic.',
          rationale: 'Avoid IEEE-754 binary floating-point precision loss on sub-cent FX currency conversions.'
        },
        {
          category: 'Database & Storage',
          rule: 'PostgreSQL 16 with write-ahead append-only journal entries. Updates to settled transaction records are strictly blocked by database triggers.',
          rationale: 'Double-entry ledgers must be tamper-evident and immutable for SOC-1 and SOX financial audits.'
        },
        {
          category: 'Frameworks & Libraries',
          rule: 'Redis Enterprise for distributed transaction locks and 30-second FX quote expiration TTL keys.',
          rationale: 'Prevent quote slippage and race conditions across distributed microservice worker pods.'
        },
        {
          category: 'Forbidden Packages / Patterns',
          rule: 'No client-side rate conversion calculations. No arbitrary float operations. No mutable SQL updates on ledger_entries table.',
          rationale: 'Client tampering vulnerability and financial non-repudiation violations.'
        }
      ],
      securityInvariants: [
        {
          id: 'SEC-01',
          category: 'Authentication',
          invariant: 'Mutual TLS (mTLS) + HMAC-SHA256 signature verification on all incoming partner banking settlement webhooks.',
          enforcementMechanism: 'API Gateway middleware rejects any payload with mismatched timestamp (>30s skew) or invalid HMAC hash.'
        },
        {
          id: 'SEC-02',
          category: 'Authorization (RBAC/ABAC)',
          invariant: 'Two-person rule (dual authorization) enforced on manual adjustments or FX settlements exceeding $50,000 equivalent.',
          enforcementMechanism: 'Step-up MFA with separate compliance officer cryptographic signature approval.'
        },
        {
          id: 'SEC-03',
          category: 'OWASP Defense',
          invariant: 'Strict Idempotency-Key HTTP header required on all debit, credit, and FX trade endpoints.',
          enforcementMechanism: 'Atomic Redis SETNX on idempotency key with 24-hour cache lock; duplicate requests return cached response.'
        },
        {
          id: 'SEC-04',
          category: 'Data Protection',
          invariant: 'PCI-DSS v4.0 field-level encryption on all bank account numbers and beneficiary transit numbers at rest via AES-256-GCM.',
          enforcementMechanism: 'KMS-managed envelope encryption before persistence layer insertion.'
        }
      ],
      antiRequirements: [
        {
          id: 'ANTI-01',
          item: 'Direct cryptocurrency or blockchain wallet settlement integrations.',
          reason: 'Out of scope for Phase 1 fiat regulatory charter; prevents unbounded regulatory compliance overhead.'
        },
        {
          id: 'ANTI-02',
          item: 'Synchronous third-party bank ACH rail dispatching in the API request loop.',
          reason: 'Banking APIs exhibit variable latency up to 12s; must be decoupled via durable Kafka queue.'
        }
      ]
    },
    functionalSpec: {
      userJourneys: [
        {
          actor: 'Verified Commercial Merchant',
          goal: 'Lock FX quote and execute cross-currency conversion between USD and EUR balances.',
          happyPathSteps: [
            'Merchant requests indicative rate quote for 100,000 USD to EUR.',
            'System reserves liquidity with banking liquidity partner and issues 30-second signed Quote ID.',
            'Merchant confirms trade with Quote ID and Idempotency Key within 30-second window.',
            'Ledger debits 100,000 USD and credits 92,450 EUR atomically in balanced journal transaction.',
            'Webhook emits `wallet.fx_trade.settled` event to merchant ERP system.'
          ],
          edgeCases: [
            'Quote expired at second 31: System rejects trade with HTTP 410 Quote Expired and triggers automatic refresh.',
            'Insufficient balance during atomic lock: Rollback transaction without debiting any currency; return HTTP 422.',
            'Network disconnect during trade confirmation: Idempotency key replay returns previous confirmed status.'
          ]
        }
      ],
      stateTransitions: [
        {
          entity: 'FXQuote',
          initialState: 'DRAFT',
          triggerEvent: 'RequestLiquidityLock',
          finalState: 'LOCKED',
          guardCondition: 'Liquidity provider confirms rate spread within slippage tolerance'
        },
        {
          entity: 'FXQuote',
          initialState: 'LOCKED',
          triggerEvent: 'TTL_Expired_30s',
          finalState: 'EXPIRED',
          guardCondition: 'Now() > Quote.expires_at AND status == LOCKED'
        },
        {
          entity: 'LedgerTransaction',
          initialState: 'PENDING_AUTHORIZATION',
          triggerEvent: 'DualSignatureApproved',
          finalState: 'SETTLED',
          guardCondition: 'Sum(DebitEntries) == Sum(CreditEntries) AND Balance >= Amount'
        }
      ],
      apiContracts: [
        {
          endpoint: '/api/v1/fx/quotes',
          method: 'POST',
          description: 'Request a guaranteed 30-second FX rate lock between two tenant wallet currencies.',
          requestSchema: '{\n  "baseCurrency": "USD",\n  "targetCurrency": "EUR",\n  "baseAmount": "100000.00"\n}',
          responseSchema: '{\n  "quoteId": "qt_98a7fbc2",\n  "baseCurrency": "USD",\n  "targetCurrency": "EUR",\n  "rate": "0.9245",\n  "targetAmount": "92450.00",\n  "expiresAt": "2026-10-17T06:30:30.000Z",\n  "signature": "hmac_sha256_sig"\n}',
          statusCodes: [
            { code: 201, description: 'Quote locked successfully for 30 seconds' },
            { code: 400, description: 'Invalid currency pair or unsupported decimal precision' },
            { code: 429, description: 'Rate limit exceeded on market quote requests' }
          ]
        },
        {
          endpoint: '/api/v1/fx/trades',
          method: 'POST',
          description: 'Execute currency conversion against an active guaranteed quote with idempotency check.',
          requestSchema: '{\n  "quoteId": "qt_98a7fbc2",\n  "walletId": "wal_01h9x3",\n  "idempotencyKey": "idem_8f3910c"\n}',
          responseSchema: '{\n  "tradeId": "trd_771029",\n  "status": "SETTLED",\n  "settledAt": "2026-10-17T06:30:12.000Z",\n  "journalEntryId": "jrn_991823"\n}',
          statusCodes: [
            { code: 200, description: 'Trade executed and ledger journal atomically balanced' },
            { code: 410, description: 'Quote has expired; request new quote' },
            { code: 422, description: 'Insufficient funds in base currency account' }
          ]
        }
      ],
      acceptanceCriteria: [
        {
          id: 'AC-01',
          title: 'Guaranteed 30-Second FX Rate Execution',
          given: 'A merchant has an active wallet with $150,000 USD and requests a locked quote for EUR',
          when: 'The merchant submits a trade execution request within 25 seconds of quote generation',
          then: 'The system locks both currency balances and writes a balanced double-entry transaction record',
          and: ['The USD wallet decreases by exactly $100,000.00', 'The EUR wallet increases by exactly €92,450.00', 'The quote state changes to EXECUTED and cannot be reused'],
          fullGherkin: `Scenario: Guaranteed 30-Second FX Rate Execution
  Given a merchant has an active wallet with $150,000 USD and requests a locked quote for EUR
  When the merchant submits a trade execution request within 25 seconds of quote generation
  Then the system locks both currency balances and writes a balanced double-entry transaction record
  And the USD wallet decreases by exactly $100,000.00
  And the EUR wallet increases by exactly €92,450.00
  And the quote state changes to EXECUTED and cannot be reused`
        },
        {
          id: 'AC-02',
          title: 'Idempotency Key Replay Protection on Network Timeout',
          given: 'A trade execution request has already succeeded with Idempotency-Key "idem_8f3910c"',
          when: 'The merchant client experiences network timeout and retries the exact same request',
          then: 'The system detects the duplicate key in Redis cache and returns HTTP 200 with the original trade receipt',
          and: ['No secondary ledger debit or duplicate currency credit occurs'],
          fullGherkin: `Scenario: Idempotency Key Replay Protection on Network Timeout
  Given a trade execution request has already succeeded with Idempotency-Key "idem_8f3910c"
  When the merchant client experiences network timeout and retries the exact same request
  Then the system detects the duplicate key in Redis cache and returns HTTP 200 with the original trade receipt
  And no secondary ledger debit or duplicate currency credit occurs`
        }
      ]
    },
    taskGraph: {
      totalEstimatedAgentMinutes: 240,
      criticalPathSummary: 'Database migration and schema invariants must complete before building the atomic transaction repository. Redis locking precedes the API routing layer.',
      tasks: [
        {
          id: 'TASK-1',
          taskNumber: 1,
          title: 'PostgreSQL Schema & Append-Only Double Entry Ledger Tables',
          layer: 'Database & Migration',
          description: 'Implement SQL migration for accounts, ledger_journals, and ledger_entries. Add database trigger preventing UPDATE or DELETE on ledger_entries.',
          blockedBy: ['None (Foundation Task)'],
          targetFilePaths: ['src/db/migrations/001_ledger_schema.sql', 'src/db/triggers/immutable_journal.sql'],
          complexityPoints: 5,
          estimatedAgentMinutes: 45,
          acceptanceTestCriteria: 'npm run test:db-migration && psql -c "UPDATE ledger_entries SET amount = 0" must throw trigger error'
        },
        {
          id: 'TASK-2',
          taskNumber: 2,
          title: 'Redis Distributed Lock & Idempotency Key Interceptor',
          layer: 'Security & Middleware',
          description: 'Create Express/Fastify middleware that intercepts Idempotency-Key headers, validates UUID format, and uses Redis SETNX with atomic TTL.',
          blockedBy: ['None (Foundation Task)'],
          targetFilePaths: ['src/middleware/idempotency.ts', 'src/services/redisLock.ts'],
          complexityPoints: 3,
          estimatedAgentMinutes: 30,
          acceptanceTestCriteria: 'vitest run tests/middleware/idempotency.test.ts'
        },
        {
          id: 'TASK-3',
          taskNumber: 3,
          title: 'Atomic Double-Entry Settlement Transaction Service',
          layer: 'Backend Service & API',
          description: 'Write TypeScript service executing debit and credit pairs inside SERIALIZABLE database transactions. Verify Zero-Sum invariant before commit.',
          blockedBy: ['TASK-1', 'TASK-2'],
          targetFilePaths: ['src/services/ledgerService.ts', 'src/models/transaction.ts'],
          complexityPoints: 5,
          estimatedAgentMinutes: 60,
          acceptanceTestCriteria: 'vitest run tests/services/ledger.concurrency.test.ts'
        },
        {
          id: 'TASK-4',
          taskNumber: 4,
          title: 'FX 30-Second Quote Generation & Lock Endpoints',
          layer: 'Backend Service & API',
          description: 'Expose POST /api/v1/fx/quotes and POST /api/v1/fx/trades with Joi/Zod input validation and HMAC signature generation.',
          blockedBy: ['TASK-3'],
          targetFilePaths: ['src/controllers/fxController.ts', 'src/routes/fxRoutes.ts'],
          complexityPoints: 3,
          estimatedAgentMinutes: 45,
          acceptanceTestCriteria: 'vitest run tests/api/fxRoutes.test.ts'
        },
        {
          id: 'TASK-5',
          taskNumber: 5,
          title: 'Multi-Currency Balance Summary UI Component',
          layer: 'Frontend Component & State',
          description: 'Build React UI widget displaying real-time balance cards in USD, EUR, GBP with visual 30s countdown bar during active quotes.',
          blockedBy: ['TASK-4'],
          targetFilePaths: ['src/components/WalletCard.tsx', 'src/components/FxQuoteModal.tsx'],
          complexityPoints: 3,
          estimatedAgentMinutes: 40,
          acceptanceTestCriteria: 'npm run test:ui && npm run build'
        },
        {
          id: 'TASK-6',
          taskNumber: 6,
          title: 'Race Condition & Concurrent Replay E2E Test Suite',
          layer: 'Test Suite & CI',
          description: 'Implement automated Artillery / k6 load test firing 50 concurrent requests with duplicate idempotency keys to ensure zero double-spend.',
          blockedBy: ['TASK-3', 'TASK-4'],
          targetFilePaths: ['tests/e2e/concurrency.loadtest.ts'],
          complexityPoints: 2,
          estimatedAgentMinutes: 20,
          acceptanceTestCriteria: 'npm run test:load-concurrency'
        }
      ]
    },
    governance: {
      forecasting: {
        totalStoryPoints: 21,
        velocityConfidenceScore: 94,
        confidenceRationale: 'High confidence based on well-defined PostgreSQL SERIALIZABLE primitives and standard Redis SETNX locking patterns. Scope strictly bound by explicit anti-requirements.',
        recommendedSprintCount: 1,
        developerSkillMix: [
          { role: 'Senior Backend / DB Architect', percentage: 50 },
          { role: 'Security / Systems Engineer', percentage: 25 },
          { role: 'Frontend React Engineer', percentage: 25 }
        ]
      },
      riskMatrix: [
        {
          id: 'RSK-01',
          category: 'Data Integrity',
          severity: 'Critical',
          probability: 'Low',
          risk: 'PostgreSQL deadlocks under high-concurrency ledger balance updates across adjacent account IDs.',
          impact: 'Transaction rollbacks and degraded API response latency during market peak trading hours.',
          mitigation: 'Enforce deterministic account locking order (sort account IDs ascending before acquiring row-level SELECT FOR UPDATE locks).'
        },
        {
          id: 'RSK-02',
          category: 'Scalability & Concurrency',
          severity: 'High',
          probability: 'Medium',
          risk: 'Redis cluster failover causing dropped lock state and potential quote replay window.',
          impact: 'Executing an FX conversion against a stale rate resulting in negative spread loss.',
          mitigation: 'Implement Redis Redlock algorithm across multi-AZ nodes with read-your-own-writes consistency check.'
        },
        {
          id: 'RSK-03',
          category: 'Security & Compliance',
          severity: 'Critical',
          probability: 'Low',
          risk: 'Sub-cent floating point precision drift accumulating over millions of micro-transactions.',
          impact: 'Audit failure during annual financial regulatory examination and balance discrepancy.',
          mitigation: 'Enforce strict SQL NUMERIC(28, 8) and JavaScript BigNumber arithmetic with zero round-half-up truncation.'
        }
      ],
      executiveStatusReport: 'The Multi-Currency Wallet & Settlement initiative is architecturally sound and primed for engineering execution. Strict double-entry accounting invariants and Redis idempotency safeguards protect against financial race conditions. Total engineering effort is sized at 21 Story Points with a 94% velocity confidence rating, projected for delivery within a single high-rigor sprint.'
    },
    architectureDiagrams: {
      systemContextC4: `flowchart TD
  subgraph ClientTier ["📱 Client & Partner Tier"]
    User["👤 Mobile / Web Trader"]
    Partner["🏦 Banking Partner / SWIFT"]
  end

  subgraph IngressGateway ["🛡️ Secure API Perimeter"]
    GW["mTLS & HMAC Gateway"]
    Auth["Zero-Trust Auth & MFA"]
  end

  subgraph CoreServices ["⚙️ Core Ledger Engine"]
    FxSvc["FX Rate & Quote Service"]
    LedgerSvc["Double-Entry Ledger Engine"]
    AuditSvc["Cryptographic Audit Svc"]
  end

  subgraph StorageTier ["🗄️ Storage & Caching Layer"]
    Redis[("⚡ Redis (30s Quote Lock & Idempotency)")]
    Postgres[("🗄️ PostgreSQL 16 (Append-Only Journal)")]
    AuditLog[("📜 Tamper-Proof Audit Vault")]
  end

  User -->|HTTPS + JWT| GW
  Partner -->|mTLS + Signed Webhook| GW
  GW --> Auth
  Auth --> FxSvc
  Auth --> LedgerSvc
  FxSvc <-->|SETEX 30s TTL| Redis
  LedgerSvc <-->|SETNX Idempotency| Redis
  LedgerSvc -->|ACID Double-Entry| Postgres
  LedgerSvc --> AuditSvc
  AuditSvc --> AuditLog`,
      sequenceDiagram: `sequenceDiagram
  autonumber
  actor User as Trader / Client
  participant GW as API Gateway & Auth
  participant FX as FX Quote Service
  participant Redis as Redis Cache
  participant Ledger as Ledger Engine
  participant DB as PostgreSQL DB

  User->>GW: POST /api/v1/quotes (USD -> EUR)
  GW->>FX: Calculate Rate with Spread
  FX->>Redis: SETEX quote:{id} 30s (Rate Lock)
  FX-->>User: 200 OK (Quote ID, Locked Rate, TTL 30s)

  User->>GW: POST /api/v1/settlements (Quote ID, Idempotency-Key)
  GW->>Redis: SETNX idempotency:{key}
  alt Duplicate Request
    Redis-->>GW: Key Exists
    GW-->>User: 409 Conflict (Replay Cached Result)
  else Unique Request
    GW->>Ledger: Execute Double-Entry Transfer
    Ledger->>DB: BEGIN Transaction
    Ledger->>DB: INSERT debit (USD Account)
    Ledger->>DB: INSERT credit (EUR Account)
    Ledger->>DB: COMMIT (Append-Only)
    Ledger-->>User: 201 Created (Settlement Receipt)
  end`,
      entityRelationshipDiagram: `erDiagram
  ACCOUNT ||--o{ LEDGER_ENTRY : contains
  TRANSACTION ||--|{ LEDGER_ENTRY : produces
  QUOTE ||--o| TRANSACTION : locks
  ACCOUNT {
    uuid id PK
    string tenant_id
    string currency
    string balance_scaled
    string status
  }
  TRANSACTION {
    uuid id PK
    string idempotency_key UK
    string status
    timestamp settled_at
  }
  LEDGER_ENTRY {
    uuid id PK
    uuid transaction_id FK
    uuid account_id FK
    string entry_type
    string amount_scaled
  }
  QUOTE {
    uuid id PK
    string from_currency
    string to_currency
    string locked_rate
    timestamp expires_at
  }`
    }
  },
  'healthcare': {
    id: 'sdd-healthcare-telehealth-02',
    title: 'Healthcare HIPAA-Compliant Telehealth Queue',
    createdAt: new Date().toISOString(),
    domain: 'HealthTech',
    targetDepth: 'Mission-Critical / Enterprise',
    originalPrompt: 'Design a HIPAA-compliant real-time patient triage queue and telehealth video consultation dispatch system with E2E encrypted WebRTC and zero PHI leakage.',
    constitution: {
      systemOverview: 'Zero-trust clinical communications and patient routing platform. Built strictly adhering to HIPAA Security Rule 45 CFR Part 160/164, requiring end-to-end cryptographic protection of Protected Health Information (PHI) and immutable audit telemetry.',
      technicalConstraints: [
        {
          category: 'Languages & Runtime',
          rule: 'Strict TypeScript on Next.js / Node.js with server-side rendering for clinician portal.',
          rationale: 'Prevent accidental exposure of patient medical records in client-side bundles or local storage.'
        },
        {
          category: 'Database & Storage',
          rule: 'PostgreSQL with Transparent Data Encryption (TDE) and AWS KMS customer-managed encryption keys (CMEK).',
          rationale: 'Mandatory cryptographic isolation of patient medical records at rest for HIPAA compliance.'
        },
        {
          category: 'Frameworks & Libraries',
          rule: 'WebSockets with TLS 1.3 for real-time queue signaling; ephemeral SFU (Selective Forwarding Unit) for WebRTC video streams.',
          rationale: 'Video and audio packet streams are peer-encrypted and never stored on proxy disk.'
        },
        {
          category: 'Forbidden Packages / Patterns',
          rule: 'No third-party analytics scripts (Google Analytics, Mixpanel, Hotjar) on any patient-facing or doctor-facing URL.',
          rationale: 'Strict prohibition under HHS guidance regarding tracking technologies and PHI transmission.'
        }
      ],
      securityInvariants: [
        {
          id: 'SEC-01',
          category: 'Data Protection',
          invariant: 'Zero PHI logged in standard application stdout or error monitoring payloads (Sentry / Datadog).',
          enforcementMechanism: 'Custom Pino logger serializer redacts names, MRNs, DOBs, and symptoms matching regex patterns.'
        },
        {
          id: 'SEC-02',
          category: 'Authorization (RBAC/ABAC)',
          invariant: 'Attribute-Based Access Control (ABAC): Clinicians can only view chart data for patients actively assigned to their consultation room.',
          enforcementMechanism: 'Database Row-Level Security (RLS) policies checking active `consultation_sessions` relationship.'
        },
        {
          id: 'SEC-03',
          category: 'OWASP Defense',
          invariant: 'Signed short-lived JWT tokens (5-minute expiration) required for WebRTC room join signaling.',
          enforcementMechanism: 'Signaling server verifies room membership and medical license verification before issuing peer exchange credentials.'
        }
      ],
      antiRequirements: [
        {
          id: 'ANTI-01',
          item: 'Persistent server-side recording of video consultation sessions.',
          reason: 'Prohibited in Phase 1 to eliminate high-liability video PHI storage and retention compliance exposure.'
        },
        {
          id: 'ANTI-02',
          item: 'Public patient self-scheduling calendar links.',
          reason: 'All appointments must route through dynamic triage acuity assessment first.'
        }
      ]
    },
    functionalSpec: {
      userJourneys: [
        {
          actor: 'Emergency Triage Nurse & Remote Patient',
          goal: 'Ingest triage symptoms, assign acuity score, and connect patient to licensed physician within 4 minutes.',
          happyPathSteps: [
            'Patient completes encrypted symptom intake questionnaire on mobile browser.',
            'System calculates ESI (Emergency Severity Index) score and places patient in prioritized queue.',
            'Available physician licensed in patient state accepts case notification.',
            'Dual-handshake initiates WebRTC video connection over encrypted media channel.',
            'Physician completes consultation and signs clinical note; session terminates securely.'
          ],
          edgeCases: [
            'Patient connectivity drop: 90-second reconnect grace period maintains room token before escalation.',
            'Physician disconnect: Immediate failover to on-call backup clinician with full state preservation.'
          ]
        }
      ],
      stateTransitions: [
        {
          entity: 'PatientQueueItem',
          initialState: 'TRIAGE_PENDING',
          triggerEvent: 'AcuityScoreCalculated',
          finalState: 'QUEUED',
          guardCondition: 'Valid state license pool exists'
        },
        {
          entity: 'PatientQueueItem',
          initialState: 'QUEUED',
          triggerEvent: 'ClinicianClaimSession',
          finalState: 'IN_CONSULTATION',
          guardCondition: 'Physician holds active state medical credential'
        },
        {
          entity: 'PatientQueueItem',
          initialState: 'IN_CONSULTATION',
          triggerEvent: 'ClinicianSignsEncounter',
          finalState: 'COMPLETED',
          guardCondition: 'Encounter summary submitted to EHR'
        }
      ],
      apiContracts: [
        {
          endpoint: '/api/v1/telehealth/queue/claim',
          method: 'POST',
          description: 'Clinician claims the highest-priority patient in their licensed jurisdiction queue.',
          requestSchema: '{\n  "clinicianId": "dr_0182",\n  "stateLicense": "CA",\n  "activeShiftId": "shf_881"\n}',
          responseSchema: '{\n  "sessionId": "ses_9921",\n  "roomToken": "jwt_signed_ephemeral_token",\n  "patientAcuity": "ESI-2",\n  "assignedAt": "2026-10-17T06:35:00.000Z"\n}',
          statusCodes: [
            { code: 200, description: 'Patient claimed and WebRTC room token generated' },
            { code: 204, description: 'Queue empty for specified state jurisdiction' },
            { code: 403, description: 'Clinician license expired or unverified' }
          ]
        }
      ],
      acceptanceCriteria: [
        {
          id: 'AC-01',
          title: 'Dynamic Acuity Priority Queue Dispatch',
          given: 'Two patients enter the queue: Patient A (ESI-3, Urgent) at 10:00 AM, and Patient B (ESI-1, Resuscitation/Critical) at 10:02 AM',
          when: 'An emergency physician becomes available at 10:03 AM and clicks "Next Available Patient"',
          then: 'The system dispatches Patient B first regardless of wait time due to higher medical acuity priority',
          and: ['An audit event is logged recording dispatch timestamp and triage rationale without exposing patient name in telemetry'],
          fullGherkin: `Scenario: Dynamic Acuity Priority Queue Dispatch
  Given two patients enter the queue: Patient A (ESI-3, Urgent) at 10:00 AM, and Patient B (ESI-1, Critical) at 10:02 AM
  When an emergency physician becomes available at 10:03 AM and clicks "Next Available Patient"
  Then the system dispatches Patient B first regardless of wait time due to higher medical acuity priority
  And an audit event is logged recording dispatch timestamp and triage rationale without exposing patient name`
        }
      ]
    },
    taskGraph: {
      totalEstimatedAgentMinutes: 195,
      criticalPathSummary: 'Encryption infrastructure and PHI redacting logger must be finalized prior to building the WebSocket dispatch signaling layer.',
      tasks: [
        {
          id: 'TASK-1',
          taskNumber: 1,
          title: 'HIPAA Redacting Logger & Sanitized Exception Handler',
          layer: 'Security & Middleware',
          description: 'Build custom logging pipeline that scrubs SSNs, MRNs, names, phone numbers, and dates of birth before writing to stdout.',
          blockedBy: ['None (Foundation Task)'],
          targetFilePaths: ['src/utils/phiScrubber.ts', 'src/logger/hipaaLogger.ts'],
          complexityPoints: 3,
          estimatedAgentMinutes: 30,
          acceptanceTestCriteria: 'vitest run tests/security/phiScrubber.test.ts'
        },
        {
          id: 'TASK-2',
          taskNumber: 2,
          title: 'PostgreSQL Acuity Queue & Row Level Security (RLS)',
          layer: 'Database & Migration',
          description: 'Create migration for telehealth_encounters table and apply RLS policies ensuring only assigned clinicians can query rows.',
          blockedBy: ['None (Foundation Task)'],
          targetFilePaths: ['src/db/migrations/002_telehealth_rls.sql'],
          complexityPoints: 5,
          estimatedAgentMinutes: 45,
          acceptanceTestCriteria: 'npm run test:db-rls'
        },
        {
          id: 'TASK-3',
          taskNumber: 3,
          title: 'Real-Time WebSocket Queue Signaling Engine',
          layer: 'Backend Service & API',
          description: 'Implement WebSocket hub managing patient arrivals, acuity recalculation, and doctor presence broadcasts.',
          blockedBy: ['TASK-1', 'TASK-2'],
          targetFilePaths: ['src/services/queueSocketHub.ts'],
          complexityPoints: 5,
          estimatedAgentMinutes: 60,
          acceptanceTestCriteria: 'vitest run tests/sockets/queue.test.ts'
        },
        {
          id: 'TASK-4',
          taskNumber: 4,
          title: 'Clinician Queue Board & Patient Acuity UI',
          layer: 'Frontend Component & State',
          description: 'Develop React dashboard showing triage patients categorized by ESI badge with 1-click Claim button and sound alert on critical arrivals.',
          blockedBy: ['TASK-3'],
          targetFilePaths: ['src/components/ClinicianDashboard.tsx', 'src/components/PatientQueueCard.tsx'],
          complexityPoints: 3,
          estimatedAgentMinutes: 40,
          acceptanceTestCriteria: 'npm run build'
        },
        {
          id: 'TASK-5',
          taskNumber: 5,
          title: 'HIPAA Compliance & Audit Log Automated Test Suite',
          layer: 'Test Suite & CI',
          description: 'Write test suite inspecting network payloads and server logs for forbidden keywords and verifying 100% audit trail coverage.',
          blockedBy: ['TASK-1', 'TASK-3'],
          targetFilePaths: ['tests/compliance/hipaaAudit.test.ts'],
          complexityPoints: 2,
          estimatedAgentMinutes: 20,
          acceptanceTestCriteria: 'vitest run tests/compliance/hipaaAudit.test.ts'
        }
      ]
    },
    governance: {
      forecasting: {
        totalStoryPoints: 18,
        velocityConfidenceScore: 91,
        confidenceRationale: 'Well-scoped regulatory parameters with strict boundary definitions. Clear isolation between patient triage logic and WebRTC media channels.',
        recommendedSprintCount: 1,
        developerSkillMix: [
          { role: 'Security & Compliance Specialist', percentage: 40 },
          { role: 'Backend & WebSocket Engineer', percentage: 35 },
          { role: 'Healthcare UX Specialist', percentage: 25 }
        ]
      },
      riskMatrix: [
        {
          id: 'RSK-01',
          category: 'Security & Compliance',
          severity: 'Critical',
          probability: 'Low',
          risk: 'Accidental PHI leakage via client-side error tracking tools or unscrubbed URL query parameters.',
          impact: 'HIPAA Class 3 regulatory violation and severe mandatory breach reporting requirements.',
          mitigation: 'Implement strict Content Security Policy (CSP) blocking external telemetry endpoints and enforce server-side error scrubbers.'
        },
        {
          id: 'RSK-02',
          category: 'Scalability & Concurrency',
          severity: 'High',
          probability: 'Medium',
          risk: 'WebSocket connection drops on rural cellular mobile networks during video triage.',
          impact: 'Patient abandoned in critical condition without clinician communication.',
          mitigation: 'Auto-reconnect with fallback SMS link trigger containing single-use encrypted consultation session resume token.'
        }
      ],
      executiveStatusReport: 'The HIPAA Telehealth Queue platform adheres to zero-trust privacy benchmarks. Critical security invariants prevent PHI leakage, while automated ESI acuity sorting optimizes physician utilization. Sized at 18 Story Points with 91% confidence for single-sprint deployment.'
    },
    architectureDiagrams: {
      systemContextC4: `flowchart TD
  subgraph Clients ["🩺 Triage Participants"]
    Patient["👤 Patient (Web / Mobile)"]
    Clinician["👨‍⚕️ Emergency Physician"]
  end

  subgraph Boundary ["🛡️ HIPAA Certified Perimeter"]
    WAF["WAF & TLS 1.3 Terminus"]
    Auth["Role-Based IAM & PHI Scrubber"]
  end

  subgraph RealtimeSvc ["⚡ Clinical Coordination Engine"]
    QueueSvc["Emergency Triage Sorter (ESI 1-5)"]
    Signaling["WebRTC Signaling Hub"]
    AuditSvc["HIPAA Access Audit Logger"]
  end

  subgraph DataLayer ["🔒 Encrypted Data Tier"]
    RedisQueue[("⚡ Redis Priority Queue")]
    EncryptedDB[("🗄️ AES-256 PostgreSQL (PHI Encrypted)")]
  end

  Patient -->|WebRTC + WSS| WAF
  Clinician -->|HTTPS + MFA| WAF
  WAF --> Auth
  Auth --> QueueSvc
  Auth --> Signaling
  QueueSvc <--> RedisQueue
  QueueSvc --> EncryptedDB
  Auth --> AuditSvc
  AuditSvc --> EncryptedDB`,
      sequenceDiagram: `sequenceDiagram
  autonumber
  actor Patient as Patient
  participant GW as Gateway & PHI Scrubber
  participant Queue as Triage Queue Engine
  participant Redis as Priority Queue
  actor Doctor as Clinician

  Patient->>GW: POST /api/v1/triage/queue (Encrypted Vitals)
  GW->>GW: Scrub Client Telemetry & Verify HIPAA Consent
  GW->>Queue: Enqueue Intake
  Queue->>Queue: Calculate ESI Acuity Score
  Queue->>Redis: ZADD triage:queue (Acuity, PatientID)
  Queue-->>Patient: 201 Created (Token, Est Wait Time)

  Doctor->>GW: POST /api/v1/consultations/admit
  GW->>Queue: Request Highest Acuity Patient
  Queue->>Redis: ZPOPMIN triage:queue
  Redis-->>Queue: Patient Session
  Queue-->>Doctor: 200 OK (Patient Brief, WebRTC Session Key)
  Doctor->>Patient: Establish P2P WebRTC Video Call`,
      entityRelationshipDiagram: `erDiagram
  PATIENT ||--o{ TRIAGE_ENTRY : submits
  CLINICIAN ||--o{ CONSULTATION : conducts
  TRIAGE_ENTRY ||--o| CONSULTATION : resolves
  PATIENT {
    uuid id PK
    string mrn_encrypted
    string name_encrypted
    string dob_encrypted
  }
  TRIAGE_ENTRY {
    uuid id PK
    uuid patient_id FK
    int esi_score
    string chief_complaint
    string status
    timestamp arrived_at
  }
  CONSULTATION {
    uuid id PK
    uuid triage_entry_id FK
    uuid clinician_id FK
    timestamp started_at
    timestamp ended_at
    string disposition
  }
  CLINICIAN {
    uuid id PK
    string npi_number
    string specialization
    string status
  }`
    }
  },
  'saas': {
    id: 'sdd-saas-rag-03',
    title: 'SaaS AI Document Extraction & RAG Pipeline',
    createdAt: new Date().toISOString(),
    domain: 'Enterprise SaaS',
    targetDepth: 'Standard Agile Sprint',
    originalPrompt: 'Build an asynchronous multi-tenant document ingestion, chunking, and semantic vector retrieval (RAG) pipeline with hybrid search and RBAC.',
    constitution: {
      systemOverview: 'High-scale multi-tenant retrieval-augmented generation (RAG) pipeline. Designed for enterprise document governance, semantic chunking, and isolated vector embeddings with strict tenant privacy partitions.',
      technicalConstraints: [
        {
          category: 'Languages & Runtime',
          rule: 'Python 3.12 / FastAPI for high-throughput embedding calculations; TypeScript on Node.js for API gateway.',
          rationale: 'Optimal native hardware vectorization for text-embedding models combined with type-safe web APIs.'
        },
        {
          category: 'Database & Storage',
          rule: 'PostgreSQL with pgvector extension using HNSW indexing and tenant_id column partitioning.',
          rationale: 'Enforces complete relational and vector co-locality with sub-10ms similarity searches under multi-tenant RLS.'
        },
        {
          category: 'Frameworks & Libraries',
          rule: 'Celery / Redis for distributed asynchronous background extraction and chunking workers.',
          rationale: 'Decouple computationally heavy document parsing and OCR from real-time customer query paths.'
        },
        {
          category: 'Forbidden Packages / Patterns',
          rule: 'No shared global vector index across multiple enterprise tenants. Cross-tenant vector similarity joins are strictly prohibited.',
          rationale: 'Eliminate risk of enterprise data exfiltration or cross-tenant contamination in RAG prompt context.'
        }
      ],
      securityInvariants: [
        {
          id: 'SEC-01',
          category: 'Authorization (RBAC/ABAC)',
          invariant: 'Hard tenant vector boundary: Every similarity search query must include tenant_id in its WHERE clause filter.',
          enforcementMechanism: 'PostgreSQL Row-Level Security (RLS) enforces tenant_id matching authenticated user claims.'
        },
        {
          id: 'SEC-02',
          category: 'Input Validation & Sanitization',
          invariant: 'Malicious PDF and macro execution prevention during document ingestion.',
          enforcementMechanism: 'Sandboxed parsing worker executes within unprivileged Docker container with zero egress network permissions.'
        }
      ],
      antiRequirements: [
        {
          id: 'ANTI-01',
          item: 'Fine-tuning custom LLM foundation weights.',
          reason: 'Out of scope for Phase 1; RAG with optimized context chunking achieves desired enterprise accuracy without heavy training expense.'
        }
      ]
    },
    functionalSpec: {
      userJourneys: [
        {
          actor: 'Enterprise Compliance Auditor',
          goal: 'Upload 400-page vendor audit PDF and execute semantic queries with source page citations.',
          happyPathSteps: [
            'User uploads document via signed S3/GCS upload URL.',
            'Background worker triggers layout-aware chunking and computes dense vector embeddings.',
            'User submits query: "What are the SOC 2 disaster recovery commitments?"',
            'System executes hybrid search (dense cosine + sparse BM25) and returns synthesized answer with exact page citations.'
          ],
          edgeCases: [
            'Scanned unsearchable PDF: Worker triggers OCR pipeline automatically.',
            'Document exceeds 50MB: Streaming chunk processor prevents worker out-of-memory crash.'
          ]
        }
      ],
      stateTransitions: [
        {
          entity: 'DocumentJob',
          initialState: 'UPLOADED',
          triggerEvent: 'WorkerPicksUpJob',
          finalState: 'PROCESSING_CHUNKS',
          guardCondition: 'File virus scan returns clean'
        },
        {
          entity: 'DocumentJob',
          initialState: 'PROCESSING_CHUNKS',
          triggerEvent: 'EmbeddingsIndexed',
          finalState: 'INDEXED_READY',
          guardCondition: 'All vector embeddings successfully committed to pgvector'
        }
      ],
      apiContracts: [
        {
          endpoint: '/api/v1/rag/query',
          method: 'POST',
          description: 'Perform tenant-isolated hybrid vector search and generate context-grounded response.',
          requestSchema: '{\n  "query": "What are the compliance guarantees?",\n  "collectionId": "col_1829",\n  "topK": 5\n}',
          responseSchema: '{\n  "answer": "The vendor guarantees 99.99% uptime with 4-hour disaster recovery RTO.",\n  "sources": [\n    {"documentId": "doc_99", "pageNumber": 14, "similarityScore": 0.91}\n  ]\n}',
          statusCodes: [
            { code: 200, description: 'Query answered with grounded citations' },
            { code: 403, description: 'Unauthorized access to requested collection' }
          ]
        }
      ],
      acceptanceCriteria: [
        {
          id: 'AC-01',
          title: 'Strict Tenant Partitioning during Semantic Search',
          given: 'Tenant A uploads confidential financial document and Tenant B uploads unrelated technical manual',
          when: 'Tenant B performs a semantic search with keywords matching Tenant A\'s financial document',
          then: 'The system returns zero matches from Tenant A\'s collection',
          and: ['Database execution plan verifies tenant_id filter was enforced via index scan'],
          fullGherkin: `Scenario: Strict Tenant Partitioning during Semantic Search
  Given Tenant A uploads confidential financial document and Tenant B uploads unrelated manual
  When Tenant B performs a semantic search with keywords matching Tenant A's document
  Then the system returns zero matches from Tenant A's collection
  And database execution plan verifies tenant_id filter was enforced via index scan`
        }
      ]
    },
    taskGraph: {
      totalEstimatedAgentMinutes: 210,
      criticalPathSummary: 'pgvector schema migration and text chunking pipeline are prerequisite for the FastAPI query controller.',
      tasks: [
        {
          id: 'TASK-1',
          taskNumber: 1,
          title: 'PostgreSQL pgvector Schema & HNSW Indexing',
          layer: 'Database & Migration',
          description: 'Create migration installing pgvector extension and creating document_chunks table with 1536-dimensional vector column.',
          blockedBy: ['None (Foundation Task)'],
          targetFilePaths: ['src/db/migrations/003_pgvector.sql'],
          complexityPoints: 3,
          estimatedAgentMinutes: 30,
          acceptanceTestCriteria: 'npm run test:pgvector'
        },
        {
          id: 'TASK-2',
          taskNumber: 2,
          title: 'Layout-Aware Semantic Chunking & Background Worker',
          layer: 'Backend Service & API',
          description: 'Implement background worker that parses document sections into 500-token chunks with 50-token overlap.',
          blockedBy: ['TASK-1'],
          targetFilePaths: ['src/workers/chunkingWorker.ts'],
          complexityPoints: 5,
          estimatedAgentMinutes: 60,
          acceptanceTestCriteria: 'vitest run tests/workers/chunking.test.ts'
        },
        {
          id: 'TASK-3',
          taskNumber: 3,
          title: 'Hybrid Search (pgvector + BM25) Query Engine',
          layer: 'Backend Service & API',
          description: 'Build query controller that computes Reciprocal Rank Fusion (RRF) between dense vector results and full-text search.',
          blockedBy: ['TASK-1', 'TASK-2'],
          targetFilePaths: ['src/services/hybridSearch.ts', 'src/controllers/queryController.ts'],
          complexityPoints: 5,
          estimatedAgentMinutes: 60,
          acceptanceTestCriteria: 'vitest run tests/services/hybridSearch.test.ts'
        },
        {
          id: 'TASK-4',
          taskNumber: 4,
          title: 'RAG Search UI with Interactive Source Inspector',
          layer: 'Frontend Component & State',
          description: 'Develop React query interface displaying streaming answer text with clickable source citation badges opening PDF page preview.',
          blockedBy: ['TASK-3'],
          targetFilePaths: ['src/components/RagSearchBox.tsx', 'src/components/SourceCitationDrawer.tsx'],
          complexityPoints: 3,
          estimatedAgentMinutes: 40,
          acceptanceTestCriteria: 'npm run build'
        },
        {
          id: 'TASK-5',
          taskNumber: 5,
          title: 'Cross-Tenant Leakage Integration Security Test',
          layer: 'Test Suite & CI',
          description: 'Write integration test simulating concurrent queries across two separate tenant accounts to verify 0% data cross-contamination.',
          blockedBy: ['TASK-1', 'TASK-3'],
          targetFilePaths: ['tests/security/tenantIsolation.test.ts'],
          complexityPoints: 2,
          estimatedAgentMinutes: 20,
          acceptanceTestCriteria: 'vitest run tests/security/tenantIsolation.test.ts'
        }
      ]
    },
    governance: {
      forecasting: {
        totalStoryPoints: 18,
        velocityConfidenceScore: 93,
        confidenceRationale: 'PostgreSQL pgvector architecture simplifies multi-tenancy compared to external vector DBs. Clear task segregation between background worker and API query paths.',
        recommendedSprintCount: 1,
        developerSkillMix: [
          { role: 'AI / Data Engineer', percentage: 45 },
          { role: 'Full-Stack TypeScript Engineer', percentage: 35 },
          { role: 'QA & Security Automation', percentage: 20 }
        ]
      },
      riskMatrix: [
        {
          id: 'RSK-01',
          category: 'Scalability & Concurrency',
          severity: 'High',
          probability: 'Medium',
          risk: 'Worker memory exhaustion when processing dense multi-hundred page PDF documents.',
          impact: 'Pod OOM kills and delayed document indexing jobs during batch uploads.',
          mitigation: 'Implement streaming page-by-page generator with strict worker memory limits and disk spillover.'
        },
        {
          id: 'RSK-02',
          category: 'Data Integrity',
          severity: 'Critical',
          probability: 'Low',
          risk: 'Hallucinated citations where LLM references page numbers not present in retrieved context.',
          impact: 'User mistrust and flawed enterprise compliance decisions.',
          mitigation: 'Enforce strict citation validation step verifying referenced text exact-match against source chunk content.'
        }
      ],
      executiveStatusReport: 'The SaaS AI Document Extraction & RAG Pipeline delivers enterprise-grade semantic search with strict tenant isolation via PostgreSQL pgvector. Sized at 18 Story Points with 93% velocity confidence, prepared for single-sprint delivery.'
    },
    architectureDiagrams: {
      systemContextC4: `flowchart TD
  subgraph Users ["🏢 Enterprise Tenants"]
    TenantAdmin["👤 Tenant Admin"]
    AppClient["💻 Web Application"]
  end

  subgraph API ["🛡️ Ingress & Security"]
    Gateway["API Gateway & JWT Router"]
    TenantRLS["PostgreSQL RLS Context Setter"]
  end

  subgraph Pipeline ["🧠 Ingestion & RAG Pipeline"]
    DocWorker["Document Extraction Worker"]
    Embedder["Embedding Engine (OpenAI / Cohere)"]
    RagEngine["Hybrid Vector & BM25 Search"]
  end

  subgraph Storage ["🗄️ Isolated Multi-Tenant Storage"]
    S3[("📦 S3 Encrypted Document Store")]
    VectorDB[("🗄️ PostgreSQL 16 + pgvector (RLS Enforced)")]
    RedisCache[("⚡ Redis Query Cache")]
  end

  Users -->|HTTPS + Tenant Header| Gateway
  Gateway --> TenantRLS
  TenantRLS --> RagEngine
  TenantRLS --> DocWorker
  DocWorker --> S3
  DocWorker --> Embedder
  Embedder --> VectorDB
  RagEngine <--> RedisCache
  RagEngine <--> VectorDB`,
      sequenceDiagram: `sequenceDiagram
  autonumber
  actor User as Enterprise User
  participant GW as Gateway & RLS Filter
  participant RAG as RAG Query Engine
  participant VectorDB as PostgreSQL pgvector
  participant LLM as Frontier Model API

  User->>GW: POST /api/v1/search/query (Query, TenantID)
  GW->>GW: Set local app.current_tenant_id = {TenantID}
  GW->>RAG: Synthesize Search Request
  RAG->>VectorDB: Query cosine_similarity() WHERE tenant_id = current_tenant
  VectorDB-->>RAG: Filtered Top-K Chunks with Exact Citations
  RAG->>LLM: Prompt + Context Chunks + Citation Strictness
  LLM-->>RAG: Synthesized Answer with Footnotes
  RAG->>RAG: Verify Citations Match Source Documents
  RAG-->>User: 200 OK (Grounded Response & Evidence Links)`,
      entityRelationshipDiagram: `erDiagram
  TENANT ||--o{ DOCUMENT : owns
  DOCUMENT ||--|{ CHUNK : contains
  CHUNK ||--o{ CITATION : references
  TENANT {
    uuid id PK
    string name
    string subscription_tier
    boolean zero_retention
  }
  DOCUMENT {
    uuid id PK
    uuid tenant_id FK
    string title
    string s3_key
    int page_count
  }
  CHUNK {
    uuid id PK
    uuid document_id FK
    uuid tenant_id FK
    text chunk_text
    vector embedding_1536
    int page_number
  }
  CITATION {
    uuid id PK
    uuid chunk_id FK
    string query_hash
    timestamp cited_at
  }`
    }
  }
}

