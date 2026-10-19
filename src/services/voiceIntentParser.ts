import type { ComposerItem, TargetDepth } from '../types'
import {
  ARCHETYPE_PRESETS,
  CAPABILITY_PRESETS,
  PERSONA_PRESETS,
  INVARIANT_PRESETS
} from '../utils/constants'

export interface ParsedVoiceIntent {
  detectedDomain: string
  isCustomDomain: boolean
  detectedDepth: TargetDepth
  archetypes: ComposerItem[]
  capabilities: ComposerItem[]
  personas: ComposerItem[]
  invariants: ComposerItem[]
  composedBrief: string
  summaryExplanation: string
}

export function parseVoiceInputToIntent(rawSpeech: string): ParsedVoiceIntent {
  const text = rawSpeech.toLowerCase()

  // -------------------------------------------------------------
  // 1. Detect Domain & Compliance Standard
  // -------------------------------------------------------------
  let detectedDomain = 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)'
  let isCustomDomain = false

  if (text.includes('health') || text.includes('telehealth') || text.includes('hipaa') || text.includes('patient') || text.includes('doctor') || text.includes('clinician') || text.includes('medical')) {
    detectedDomain = 'HealthTech & Telehealth Consultations (HIPAA Security Rule)'
  } else if (text.includes('gov') || text.includes('defense') || text.includes('fedramp') || text.includes('military') || text.includes('itar') || text.includes('public sector')) {
    detectedDomain = 'GovTech & Public Agency Portals (FedRAMP High, NIST 800-53)'
  } else if (text.includes('rag') || text.includes('vector') || text.includes('embedding') || text.includes('document') || text.includes('ocr') || text.includes('pdf') || text.includes('chunk')) {
    detectedDomain = 'AI Document Extraction & RAG Pipeline (Tenant Isolation)'
  } else if (text.includes('saas') || text.includes('tenant') || text.includes('b2b') || text.includes('subscription')) {
    detectedDomain = 'Multi-Tenant B2B SaaS Platform (SOC-2 Type II, ISO 27001)'
  } else if (text.includes('security') || text.includes('iam') || text.includes('sso') || text.includes('auth') || text.includes('identity') || text.includes('zero trust')) {
    detectedDomain = 'Identity, SSO & Zero-Trust IAM (NIST SP 800-63B)'
  } else if (text.includes('ecommerce') || text.includes('commerce') || text.includes('cart') || text.includes('checkout') || text.includes('shop') || text.includes('retail')) {
    detectedDomain = 'High-Volume Omnichannel E-Commerce (PCI-DSS, CCPA)'
  } else if (text.includes('legal') || text.includes('attorney') || text.includes('law')) {
    detectedDomain = 'LegalTech / Privileged Chain of Custody'
    isCustomDomain = true
  } else if (text.includes('drone') || text.includes('agtech') || text.includes('agriculture') || text.includes('farm')) {
    detectedDomain = 'AgTech / Autonomous Drone Telemetry (FAA Part 107)'
    isCustomDomain = true
  }

  // -------------------------------------------------------------
  // 2. Detect Delivery Rigor Depth
  // -------------------------------------------------------------
  let detectedDepth: TargetDepth = 'Standard Agile Sprint'
  if (text.includes('mvp') || text.includes('fast') || text.includes('quick') || text.includes('prototype') || text.includes('poc') || text.includes('speed')) {
    detectedDepth = 'MVP / Fast-Track'
  } else if (text.includes('strict') || text.includes('mission-critical') || text.includes('mission critical') || text.includes('compliance') || text.includes('zero downtime') || text.includes('audit') || text.includes('pci') || text.includes('hipaa') || text.includes('financial') || text.includes('banking') || text.includes('security rule')) {
    detectedDepth = 'Mission-Critical / Enterprise'
  }

  // -------------------------------------------------------------
  // 3. Extract Archetypes
  // -------------------------------------------------------------
  const archetypes: ComposerItem[] = []
  if (text.includes('microservice') || text.includes('kafka') || text.includes('event') || text.includes('rabbitmq') || text.includes('messaging')) {
    archetypes.push({
      id: `arch-${Date.now()}-1`,
      label: ARCHETYPE_PRESETS[0],
      reason: 'Asynchronous event streaming and decoupled processing'
    })
  }
  if (text.includes('websocket') || text.includes('real time') || text.includes('real-time') || text.includes('live') || text.includes('stream') || text.includes('socket')) {
    archetypes.push({
      id: `arch-${Date.now()}-2`,
      label: ARCHETYPE_PRESETS[2],
      reason: 'Low-latency bidirectional live updates and push notifications'
    })
  }
  if (text.includes('rest') || text.includes('api') || text.includes('endpoint') || text.includes('gateway') || text.includes('graphql')) {
    archetypes.push({
      id: `arch-${Date.now()}-3`,
      label: ARCHETYPE_PRESETS[1],
      reason: 'Type-safe public and internal interface contract gateway'
    })
  }
  if (text.includes('queue') || text.includes('worker') || text.includes('async') || text.includes('background') || text.includes('job')) {
    archetypes.push({
      id: `arch-${Date.now()}-4`,
      label: ARCHETYPE_PRESETS[3],
      reason: 'Resilient background task execution with retry policies'
    })
  }
  // Fallback if none matched
  if (archetypes.length === 0) {
    archetypes.push({
      id: `arch-${Date.now()}-def`,
      label: ARCHETYPE_PRESETS[0],
      reason: 'Core system architectural baseline'
    })
  }

  // -------------------------------------------------------------
  // 4. Extract Core Capabilities
  // -------------------------------------------------------------
  const capabilities: ComposerItem[] = []
  if (text.includes('ledger') || text.includes('currency') || text.includes('settlement') || text.includes('wallet') || text.includes('money') || text.includes('payment')) {
    capabilities.push({
      id: `cap-${Date.now()}-1`,
      label: CAPABILITY_PRESETS[0],
      reason: 'Double-entry balance reconciliation with zero rounding drift'
    })
  }
  if (text.includes('rbac') || text.includes('permission') || text.includes('role') || text.includes('sso') || text.includes('mfa') || text.includes('login') || text.includes('auth')) {
    capabilities.push({
      id: `cap-${Date.now()}-2`,
      label: CAPABILITY_PRESETS[1],
      reason: 'Granular role-based authorization and session verification'
    })
  }
  if (text.includes('rag') || text.includes('vector') || text.includes('search') || text.includes('semantic') || text.includes('embedding')) {
    capabilities.push({
      id: `cap-${Date.now()}-3`,
      label: CAPABILITY_PRESETS[3],
      reason: 'Hybrid vector search with dense cosine and sparse BM25 ranking'
    })
  }
  if (text.includes('ocr') || text.includes('document') || text.includes('extract') || text.includes('pdf') || text.includes('upload')) {
    capabilities.push({
      id: `cap-${Date.now()}-4`,
      label: CAPABILITY_PRESETS[4],
      reason: 'Automated multi-format document extraction and layout chunking'
    })
  }
  if (text.includes('triage') || text.includes('queue') || text.includes('acuity') || text.includes('dispatch') || text.includes('consultation')) {
    capabilities.push({
      id: `cap-${Date.now()}-5`,
      label: CAPABILITY_PRESETS[7],
      reason: 'Dynamic emergency severity indexing and provider assignment'
    })
  }
  if (capabilities.length === 0) {
    capabilities.push({
      id: `cap-${Date.now()}-def`,
      label: CAPABILITY_PRESETS[2],
      reason: 'Deterministic workflow state engine with validation checkpoints'
    })
  }

  // -------------------------------------------------------------
  // 5. Extract Personas
  // -------------------------------------------------------------
  const personas: ComposerItem[] = []
  if (text.includes('admin') || text.includes('manager') || text.includes('owner') || text.includes('it')) {
    personas.push({
      id: `per-${Date.now()}-1`,
      label: PERSONA_PRESETS[0],
      reason: 'Oversee system security, role assignments, and tenant governance'
    })
  }
  if (text.includes('patient') || text.includes('doctor') || text.includes('nurse') || text.includes('clinician')) {
    personas.push({
      id: `per-${Date.now()}-2`,
      label: PERSONA_PRESETS[4],
      reason: 'Access triage queue and execute clinical encounters'
    })
  }
  if (text.includes('customer') || text.includes('user') || text.includes('shopper') || text.includes('consumer') || text.includes('client')) {
    personas.push({
      id: `per-${Date.now()}-3`,
      label: PERSONA_PRESETS[1],
      reason: 'Frictionless self-service interactions and real-time status visibility'
    })
  }
  if (text.includes('auditor') || text.includes('compliance') || text.includes('legal')) {
    personas.push({
      id: `per-${Date.now()}-4`,
      label: PERSONA_PRESETS[2],
      reason: 'Review immutable audit logs and regulatory conformance proofs'
    })
  }
  if (personas.length === 0) {
    personas.push({
      id: `per-${Date.now()}-def`,
      label: PERSONA_PRESETS[1],
      reason: 'Primary operational user of the system'
    })
  }

  // -------------------------------------------------------------
  // 6. Extract Invariants
  // -------------------------------------------------------------
  const invariants: ComposerItem[] = []
  if (text.includes('idempot') || text.includes('duplicate') || text.includes('replay') || text.includes('retry')) {
    invariants.push({
      id: `inv-${Date.now()}-1`,
      label: INVARIANT_PRESETS[0],
      reason: 'Enforce atomic key locks in distributed cache to stop double-processing'
    })
  }
  if (text.includes('encrypt') || text.includes('aes') || text.includes('kms') || text.includes('pci')) {
    invariants.push({
      id: `inv-${Date.now()}-2`,
      label: INVARIANT_PRESETS[1],
      reason: 'Field-level envelope encryption for sensitive payload data at rest'
    })
  }
  if (text.includes('phi') || text.includes('pii') || text.includes('privacy') || text.includes('hipaa') || text.includes('leak')) {
    invariants.push({
      id: `inv-${Date.now()}-3`,
      label: INVARIANT_PRESETS[2],
      reason: 'Zero sensitive data logged in stdout, URL query strings, or error monitoring'
    })
  }
  if (text.includes('latency') || text.includes('fast') || text.includes('speed') || text.includes('sub-100ms') || text.includes('cache')) {
    invariants.push({
      id: `inv-${Date.now()}-4`,
      label: INVARIANT_PRESETS[3],
      reason: 'Tiered Redis caching to guarantee sub-100ms response SLAs'
    })
  }
  if (invariants.length === 0) {
    invariants.push({
      id: `inv-${Date.now()}-def`,
      label: INVARIANT_PRESETS[0],
      reason: 'Transactional consistency and non-repudiation'
    })
  }

  // -------------------------------------------------------------
  // 7. Compose Structured Feature Brief Text
  // -------------------------------------------------------------
  let composedBrief = `### Spoken Voice Brief: ${rawSpeech.trim()}\n\n`
  composedBrief += `**1. Architecture & System Topology:**\n`
  archetypes.forEach(a => {
    composedBrief += `- ${a.label}${a.reason ? ` — *Purpose: ${a.reason}*` : ''}\n`
  })

  composedBrief += `\n**2. Core Functional Capabilities & Engines:**\n`
  capabilities.forEach(c => {
    composedBrief += `- ${c.label}${c.reason ? ` — *Scope: ${c.reason}*` : ''}\n`
  })

  composedBrief += `\n**3. Target Stakeholders & User Journeys:**\n`
  personas.forEach(p => {
    composedBrief += `- ${p.label}${p.reason ? ` — *Key Need: ${p.reason}*` : ''}\n`
  })

  composedBrief += `\n**4. Non-Negotiable Invariants & Compliance Rules:**\n`
  invariants.forEach(i => {
    composedBrief += `- ${i.label}${i.reason ? ` — *Security Requirement: ${i.reason}*` : ''}\n`
  })

  const summaryExplanation = `Voice Co-Pilot Auto-Configured: Domain set to "${detectedDomain}" • Rigor set to "${detectedDepth}" • Extracted ${archetypes.length} Archetype(s), ${capabilities.length} Capability Engine(s), and ${invariants.length} Invariant(s).`

  return {
    detectedDomain,
    isCustomDomain,
    detectedDepth,
    archetypes,
    capabilities,
    personas,
    invariants,
    composedBrief,
    summaryExplanation
  }
}
