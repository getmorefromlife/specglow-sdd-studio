import type {
  PlatformTarget,
  TechStackPreset,
  TargetDepth,
  Settings
} from '../types'

export interface ArchitectureRecommendation {
  refinedBrief: string
  recommendedDomain: string
  domainRationale: string
  recommendedPlatformTarget: PlatformTarget
  platformRationale: string
  recommendedTechStack: TechStackPreset
  techStackRationale: string
  recommendedDepth: TargetDepth
  recommendedCompanyStructure: string
  plainEnglishSummary: string
}

/**
 * Intelligent Offline Rule-Based Fallback Recommender
 */
export function getOfflineRecommendation(rawIdea: string): ArchitectureRecommendation {
  const text = rawIdea.toLowerCase()

  // 1. Detect Domain & Compliance
  let recommendedDomain = 'General Enterprise Baseline (ISO 27001 & OWASP Top 10)'
  let domainRationale = 'Standard enterprise cybersecurity baseline adhering to ISO 27001 and OWASP ASVS guidelines.'

  if (text.match(/bank|ledger|wallet|fintech|payment|currency|trade|crypto|settle|account|transfer|pci/)) {
    recommendedDomain = 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)'
    domainRationale = 'Your idea involves financial value exchange or balances, which legally mandates PCI-DSS v4.0 and SOX 404 audit immutability.'
  } else if (text.match(/health|telehealth|doctor|patient|clinic|ehr|emr|medical|hipaa|hospital|prescript/)) {
    recommendedDomain = 'HealthTech & Telehealth Consultations (HIPAA, HITECH)'
    domainRationale = 'Handling protected health information (ePHI) strictly requires HIPAA Security Rule encryption and non-repudiation audit trails.'
  } else if (text.match(/school|student|teacher|course|learn|lms|quiz|edtech|grade|lesson|ferpa|coppa/)) {
    recommendedDomain = 'Education, EdTech & LMS (FERPA, COPPA, xAPI)'
    domainRationale = 'Educational platforms handling student records and minors require FERPA privacy and COPPA parental consent safeguards.'
  } else if (text.match(/charity|nonprofit|community|dao|volunteer|ethical|donation|cooperative|grassroots/)) {
    recommendedDomain = 'Ethical, Community & Non-Profit (Zero-Knowledge, Decentralized)'
    domainRationale = 'Community and non-profit initiatives benefit from zero-knowledge data minimization and decentralized transparency.'
  } else if (text.match(/store|shop|cart|product|checkout|e-commerce|commerce|retail|order|catalog/)) {
    recommendedDomain = 'High-Volume Omnichannel E-Commerce (PCI-DSS, CCPA)'
    domainRationale = 'E-commerce requires sub-second inventory locking and strict CCPA consumer data privacy during purchases.'
  } else if (text.match(/identity|iam|sso|auth|oauth|saml|fido2|zero-trust|mfa|login|permission/)) {
    recommendedDomain = 'Identity, SSO & Zero-Trust IAM (NIST SP 800-63B, OIDC)'
    domainRationale = 'Authentication platforms require NIST SP 800-63B phishing-resistant MFA and verifiable session tokens.'
  } else if (text.match(/saas|tenant|b2b|crm|billing|subscription|workspace|multi-tenant/)) {
    recommendedDomain = 'Multi-Tenant B2B SaaS Platform (SOC-2 Type II, GDPR)'
    domainRationale = 'Multi-tenant subscription software mandates strict tenant row-level security and SOC 2 Type II audit controls.'
  }

  // 2. Detect Platform Target
  let recommendedPlatformTarget: PlatformTarget = 'web-portal'
  let platformRationale = 'A fast server-rendered web application provides maximum SEO visibility and global accessibility across desktop and mobile browsers.'

  if (text.match(/mobile|ios|android|iphone|phone|app store|offline|gps|camera|native|field agent|driver/)) {
    recommendedPlatformTarget = 'mobile-app'
    platformRationale = 'Your users need on-the-go access with native phone hardware support (offline SQLite, push notifications, and biometric login).'
  } else if (text.match(/saas|b2b|multi-tenant|dashboard|crm|enterprise workspace|tenant|admin portal/)) {
    recommendedPlatformTarget = 'saas-web'
    platformRationale = 'Enterprise B2B software with data-dense tables, multi-role permissions, and tenant organization billing is best served as a multi-tenant web application.'
  } else if (text.match(/shop|store|checkout|cart|ecommerce|e-commerce|retail|buy now/)) {
    recommendedPlatformTarget = 'e-commerce'
    platformRationale = 'High concurrent checkout spikes and product catalogs require dedicated cart reservation rails and sub-second caching.'
  }

  // 3. Detect Preferred Tech Stack
  let recommendedTechStack: TechStackPreset = 'nextjs-shadcn'
  let techStackRationale = 'Next.js 15 App Router + shadcn/ui gives you total source control, zero vendor lock-in, and accessible, beautiful UI components.'

  if (recommendedPlatformTarget === 'mobile-app') {
    recommendedTechStack = 'react-native'
    techStackRationale = 'React Native with Expo SDK 52 allows you to write one unified TypeScript codebase that compiles into native iOS and Android apps.'
  } else if (text.match(/python|fastapi|machine learning|ai model|data pipeline|pandas|pytorch|nlp/)) {
    recommendedTechStack = 'fastapi-react'
    techStackRationale = 'Pairs a high-speed Python 3.12 backend (with automated OpenAPI schemas) with a modern React 19 single-page application.'
  } else if (text.match(/doc|docs|documentation|blog|content|mdx|static site|fastest/)) {
    recommendedTechStack = 'astro-content'
    techStackRationale = 'Astro 5 delivers zero client-side JavaScript by default, achieving perfect 100/100 Google Lighthouse speed for content-heavy sites.'
  }

  // 4. Delivery Rigor & Structure
  const isMissionCritical = recommendedDomain.includes('PCI-DSS') || recommendedDomain.includes('HIPAA') || recommendedDomain.includes('SOC-2')
  const recommendedDepth: TargetDepth = isMissionCritical ? 'Mission-Critical / Enterprise' : 'Standard Agile Sprint'
  const recommendedCompanyStructure = 'Single Autonomous Squad (Unified Codebase & Full-Stack Team)'

  // 5. Refined Brief
  const refinedBrief = rawIdea.trim().length > 20
    ? `Architect an enterprise-grade ${recommendedDomain.split('(')[0].trim()} solution. The system must support core user journeys, enforce strict ${recommendedDomain.match(/\((.*?)\)/)?.[1] || 'ISO 27001'} compliance invariants, provide deterministic transaction state boundaries, and deploy seamlessly as a ${recommendedPlatformTarget} using ${recommendedTechStack}.`
    : `Design a high-reliability ${recommendedDomain.split('(')[0].trim()} system built with ${recommendedTechStack} for ${recommendedPlatformTarget}. Enforce zero-trust boundaries, role-based controls, and automated acceptance testing.`

  const plainEnglishSummary = `Based on your idea, we recommend building a **${recommendedPlatformTarget.toUpperCase()}** using **${recommendedTechStack}** governed under **${recommendedDomain.split('(')[0].trim()}** rules. This ensures rapid developer velocity while guaranteeing zero regulatory audit surprises.`

  return {
    refinedBrief,
    recommendedDomain,
    domainRationale,
    recommendedPlatformTarget,
    platformRationale,
    recommendedTechStack,
    techStackRationale,
    recommendedDepth,
    recommendedCompanyStructure,
    plainEnglishSummary
  }
}

/**
 * AI-Powered Idea Analysis & Architecture Recommender
 * Queries user's configured LLM (BYOK) or falls back to intelligent heuristic engine.
 */
export async function analyzeAndRecommendArchitecture(
  rawIdea: string,
  settings: Settings
): Promise<ArchitectureRecommendation> {
  const offlineFallback = getOfflineRecommendation(rawIdea)

  if (!settings.apiKey || !rawIdea.trim()) {
    return offlineFallback
  }

  const prompt = `You are a Principal Solutions Architect at a world-class IT consultancy.
A client or product manager is exploring a software idea:

RAW CLIENT IDEA:
"${rawIdea.trim()}"

Analyze this idea and return a JSON object with your senior architectural recommendations:
{
  "refinedBrief": "A crisp, 2-3 sentence enterprise specification brief describing what to build with clear boundaries",
  "recommendedDomain": "One of: 'FinTech / Multi-Currency & Wallets (PCI-DSS v4.0, SOX)' | 'HealthTech & Telehealth Consultations (HIPAA, HITECH)' | 'Education, EdTech & LMS (FERPA, COPPA, xAPI)' | 'Ethical, Community & Non-Profit (Zero-Knowledge, Decentralized)' | 'Multi-Tenant B2B SaaS Platform (SOC-2 Type II, GDPR)' | 'High-Volume Omnichannel E-Commerce (PCI-DSS, CCPA)' | 'Identity, SSO & Zero-Trust IAM (NIST SP 800-63B, OIDC)' | 'General Enterprise Baseline (ISO 27001 & OWASP Top 10)'",
  "domainRationale": "Why this legal/regulatory domain fits their requirements in 1 plain English sentence",
  "recommendedPlatformTarget": "web-portal" | "mobile-app" | "saas-web" | "e-commerce",
  "platformRationale": "Why this platform fits their users in 1 plain English sentence",
  "recommendedTechStack": "nextjs-shadcn" | "astro-content" | "react-native" | "flutter-dart" | "fastapi-react" | "stack-agnostic",
  "techStackRationale": "Why this stack is ideal in 1 plain English sentence",
  "recommendedDepth": "MVP / Fast-Track" | "Standard Agile Sprint" | "Mission-Critical / Enterprise",
  "recommendedCompanyStructure": "Single Autonomous Squad (Unified Codebase & Full-Stack Team)",
  "plainEnglishSummary": "A warm, 2-sentence summary explaining the plan to a non-technical stakeholder"
}

Format: Return ONLY the raw JSON object.`

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
      const parsed = JSON.parse(cleaned) as ArchitectureRecommendation
      if (parsed.recommendedDomain && parsed.recommendedPlatformTarget && parsed.recommendedTechStack) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('AI Idea Advisor query failed, falling back to heuristic engine:', err)
  }

  return offlineFallback
}
