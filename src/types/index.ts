export type ProviderPreset = 
  | 'openai' 
  | 'groq' 
  | 'deepseek' 
  | 'ollama' 
  | 'gemini' 
  | 'anthropic' 
  | 'xai' 
  | 'openrouter' 
  | 'custom'

export interface Settings {
  apiKey: string
  baseUrl: string
  model: string
  providerPreset: ProviderPreset
}

export type DomainType = string

export type TargetDepth = 
  | 'MVP / Fast-Track' 
  | 'Standard Agile Sprint' 
  | 'Mission-Critical / Enterprise'

export type RegulatoryJurisdiction =
  | 'North America (US & Canada)'
  | 'European Union & UK'
  | 'GCC & Middle East'
  | 'Australia & New Zealand (ANZ)'
  | 'Asia-Pacific (APAC)'
  | 'Pakistan & Emerging Markets'
  | 'Global Baseline (Default)'

export interface ArchitecturalTradeoffOption {
  id: string
  label: string
  implication: string
  isRecommended?: boolean
}

export interface ArchitecturalInterrogationQuestion {
  id: string
  category: string
  question: string
  context: string
  options: ArchitecturalTradeoffOption[]
  selectedOptionId?: string
}

export type PlatformTarget = 
  | 'web-portal'       // Modern Web Portal & Content Platform (Educational, Ethical, Media, NGO)
  | 'mobile-app'      // Native / Cross-Platform Mobile App (iOS & Android)
  | 'saas-web'        // Enterprise Web App & Cloud SaaS (Dashboards, B2B)
  | 'e-commerce'     // E-Commerce Storefront & Marketplace

export type TechStackPreset = 
  | 'nextjs-shadcn'   // Next.js (App Router) + Tailwind CSS + shadcn/ui + Supabase
  | 'astro-content'   // Astro (SSR/SSG) + Tailwind CSS (Ultra-fast Content & Portals)
  | 'react-native'    // React Native (Expo) + NativeWind + SQLite (iOS & Android)
  | 'flutter-dart'    // Flutter + Dart + Firebase/Supabase (Cross-Platform Mobile)
  | 'fastapi-react'   // FastAPI (Python) + React 19 + PostgreSQL
  | 'stack-agnostic'  // AI Recommended Stack (Default)

export interface RequirementInput {
  requirement: string
  domain: DomainType
  targetDepth: TargetDepth
  jurisdiction?: RegulatoryJurisdiction
  platformTarget?: PlatformTarget
  techStack?: TechStackPreset
  enableRtlMultilingual?: boolean
  architecturalDecisions?: Record<string, string>
  brownfieldAssets?: string
  companyStructure?: string
}

// Backward-compatible alias for InitiativeInput
export type InitiativeInput = RequirementInput

export interface AzureDevOpsWorkItem {
  id?: string
  workItemType: 'Epic' | 'Issue' | 'User Story' | 'Task'
  title: string
  description: string
  acceptanceCriteria: string
  storyPoints: number
  priority: 1 | 2 | 3 | 4
  state: 'New' | 'Active' | 'Resolved' | 'Closed'
  tags: string
}

export interface SpecGlowMcpServerConfig {
  mcpServers: {
    [serverName: string]: {
      command: string
      args: string[]
      env?: Record<string, string>
    }
  }
}

// Backward compatibility alias
export type SpecFlowMcpServerConfig = SpecGlowMcpServerConfig

// -------------------------------------------------------------
// PRD & FEATURE COMPOSER DATA CONTRACTS
// -------------------------------------------------------------
export interface ComposerItem {
  id: string
  label: string
  reason?: string // Optional specific architectural rationale / use-case
}

export interface ComposerState {
  archetypes: ComposerItem[]
  capabilities: ComposerItem[]
  personas: ComposerItem[]
  invariants: ComposerItem[]
  initiativeName: string
  specialNotes: string
}

// -------------------------------------------------------------
// TAB 1: 📜 PROJECT CONSTITUTION (constitution.md)
// -------------------------------------------------------------
export interface TechnicalConstraint {
  category: 'Languages & Runtime' | 'Frameworks & Libraries' | 'Database & Storage' | 'Forbidden Packages / Patterns'
  rule: string
  rationale: string
}

export interface SecurityInvariant {
  id: string
  category: 'Authentication' | 'Authorization (RBAC/ABAC)' | 'Input Validation & Sanitization' | 'OWASP Defense' | 'Data Protection'
  invariant: string
  enforcementMechanism: string
}

export interface AntiRequirement {
  id: string
  item: string
  reason: string
}

export interface StrideThreatEntry {
  category: 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege'
  threat: string
  architecturalMitigation: string
}

export interface ProjectConstitution {
  systemOverview: string
  technicalConstraints: TechnicalConstraint[]
  securityInvariants: SecurityInvariant[]
  antiRequirements: AntiRequirement[]
  strideThreatMatrix?: StrideThreatEntry[]
}

// -------------------------------------------------------------
// TAB 2: ⚙️ FUNCTIONAL & CONTRACT SPEC (spec.md)
// -------------------------------------------------------------
export interface StateTransition {
  entity: string
  initialState: string
  triggerEvent: string
  finalState: string
  guardCondition: string
}

export interface ApiContract {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  requestSchema: string
  responseSchema: string
  statusCodes: { code: number; description: string }[]
}

export interface GherkinScenario {
  id: string
  title: string
  given: string
  when: string
  then: string
  and?: string[]
  fullGherkin: string
}

export interface FunctionalSpec {
  userJourneys: {
    actor: string
    goal: string
    happyPathSteps: string[]
    edgeCases: string[]
  }[]
  stateTransitions: StateTransition[]
  apiContracts: ApiContract[]
  acceptanceCriteria: GherkinScenario[]
}

// -------------------------------------------------------------
// TAB 3: 🤖 AGENT-EXECUTABLE TASK GRAPH (tasks.md)
// -------------------------------------------------------------
export interface AgentTask {
  id: string
  taskNumber: number
  title: string
  layer: 'Database & Migration' | 'Backend Service & API' | 'Frontend Component & State' | 'Security & Middleware' | 'Test Suite & CI'
  description: string
  blockedBy: string[]
  targetFilePaths: string[]
  complexityPoints: 1 | 2 | 3 | 5 | 8
  estimatedAgentMinutes: number
  acceptanceTestCriteria: string
}

export interface AgentTaskGraph {
  totalEstimatedAgentMinutes: number
  criticalPathSummary: string
  tasks: AgentTask[]
}

// -------------------------------------------------------------
// TAB 4: 📊 AI-NATIVE DELIVERY & RISK GOVERNANCE (governance.md)
// -------------------------------------------------------------
export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type RiskProbability = 'Low' | 'Medium' | 'High'

export interface GovernanceRisk {
  id: string
  category: 'Architectural Debt' | 'Security & Compliance' | 'Scalability & Concurrency' | 'Vendor & Dependency' | 'Data Integrity'
  severity: RiskSeverity
  probability: RiskProbability
  risk: string
  impact: string
  mitigation: string
}

export interface DeliveryForecasting {
  totalStoryPoints: number
  velocityConfidenceScore: number
  confidenceRationale: string
  recommendedSprintCount: number
  developerSkillMix: { role: string; percentage: number }[]
}

export interface DeliveryGovernance {
  forecasting: DeliveryForecasting
  riskMatrix: GovernanceRisk[]
  executiveStatusReport: string
}

// -------------------------------------------------------------
// 📐 ARCHITECTURE DIAGRAMS (Mermaid.js)
// -------------------------------------------------------------
export interface ArchitectureDiagrams {
  systemContextC4: string
  sequenceDiagram: string
  entityRelationshipDiagram: string
}

// -------------------------------------------------------------
// COMPLETE 4-PILLAR SDD ARTIFACT
// -------------------------------------------------------------
export interface SddArtifactPackage {
  id: string
  title: string
  createdAt: string
  domain: DomainType
  targetDepth: TargetDepth
  jurisdiction?: RegulatoryJurisdiction
  platformTarget?: PlatformTarget
  techStack?: TechStackPreset
  enableRtlMultilingual?: boolean
  companyStructure?: string
  originalPrompt: string
  brownfieldAssets?: string
  constitution: ProjectConstitution
  functionalSpec: FunctionalSpec
  taskGraph: AgentTaskGraph
  governance: DeliveryGovernance
  architectureDiagrams?: ArchitectureDiagrams
}

// -------------------------------------------------------------
// PERSISTENT INITIATIVE LIBRARY (IndexedDB)
// -------------------------------------------------------------
export interface SavedInitiativeSummary {
  id: string
  title: string
  domain: string
  jurisdiction?: RegulatoryJurisdiction
  targetDepth: TargetDepth
  storyPoints: number
  updatedAt: string
  manifestData: SddArtifactPackage
}

