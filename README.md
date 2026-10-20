# 🚀 SpecGlow SDD Studio (v3.0 Enterprise Release)
### Enterprise Agentic Spec-Driven Development & Delivery Governance Engine

> **Created by Syed Imon Rizvi (Mercer and Mills) — Free & Open Source for Global IT Consultancies & Enterprise Teams.**  
> *100% Client-Side In-Memory Execution • Zero Backend Server Cost • Bring Your Own Key (BYOK) • Zero Telemetry*

---

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v3.0%20Enterprise-emerald.svg)](package.json)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-v8-646cff.svg)](https://vitejs.dev)
[![Architecture](https://img.shields.io/badge/Architecture-SDD%204--Pillar-violet.svg)](#-the-4-pillar-sdd-architecture)

---

## 📌 Executive Summary

Modern enterprise software engineering is fundamentally evolving from ad-hoc, hallucination-prone prompting to **Spec-Driven Development (SDD)**. Autonomous AI coding agents (Claude Code, Antigravity, Cursor, Devin) and multi-disciplinary distributed teams require deterministic architectural boundaries, zero-trust security invariants, and explicit dependency graphs to ship mission-critical software safely.

**SpecGlow SDD Studio** transforms feature briefs, requirements, and voice recordings into a comprehensive, machine-executable **Agent-Native SDD Delivery & Governance Suite** tailored to major global markets (US, EU, GCC, ANZ, APAC, and Pakistan).

---

## 🌟 What's New in v3.0 Enterprise Release

### 1. 🌐 6-Region Regulatory & Compliance Matrix
Tailor every synthesized specification to jurisdictional mandates across 7 distinct profiles:
- **US / Canada (Federal & FinTech):** SOC 2 Type II, HIPAA, FedRAMP, CCPA, PCI-DSS v4.0, GLBA.
- **EU / UK (GDPR & Digital Sovereignty):** GDPR (Articles 25/32), DORA, EU AI Act, NIS2, UK Data Protection Act.
- **GCC / Middle East (Sovereignty & Privacy):** UAE PDPL, Saudi NDMO / SAMA Cyber Security Framework, UAE CBUAE standards.
- **Australia / New Zealand (CPS 234 & Privacy):** APRA CPS 234, Privacy Act 1988, Essential Eight, NZ Privacy Act 2020.
- **APAC / Singapore (MAS TRM & Cross-Border):** MAS Technology Risk Management Guidelines, Singapore PDPA, Cross-Border Privacy Rules.
- **Pakistan (SBP & Digital Governance):** State Bank of Pakistan (SBP) Framework for Enterprise Technology Governance, PECA 2016.
- **Global Enterprise Baseline:** ISO/IEC 27001:2022, SOC 2 Type II, and NIST Cybersecurity Framework 2.0.

### 2. 🛡️ Advanced Cybersecurity Engine: STRIDE & Anti-Slopsquatting
- **STRIDE Threat Modeling Matrix:** Every initiative includes a complete threat model table covering **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service, and **E**levation of Privilege with designated mitigation strategies and verification commands.
- **Anti-Slopsquatting Ecosystem Whitelist:** Strict runtime invariant prohibiting hallucinated or untrusted third-party dependencies, enforcing vetted, production-grade packages (e.g., `@prisma/client`, `zod`, `pino`, `jose`, `bcryptjs`, `helmet`) and mandating package lockfile pinning with integrity hashes.

### 3. 📜 Client Security & Architecture Attestation (`SECURITY-ATTESTATION.md`)
- Formal, audit-ready attestation report generated directly in the browser for client enterprise sign-off.
- Details Executive Summary, Jurisdictional Compliance, Zero-Telemetry BYOK Privacy Attestation, STRIDE Threat Summary, Ecosystem Package Integrity, and Continuous CI Verification commitments.
- Available via **1-click download** in Step 5 and included automatically in the `.zip` export bundle.

### 4. 🗄️ Persistent Initiative Library (Native IndexedDB)
- 100% in-browser, zero-backend persistent storage powered by native IndexedDB (`specglow_sdd_db`).
- Seamlessly auto-saves all synthesized initiatives and imported manifests.
- **Saved Initiatives Drawer:** Instantly browse previous work, review story points, model used, and jurisdiction, with **1-click Load** and **Delete** actions.

### 5. 🔌 SpecGlow MCP Bridge (`specglow-mcp.json` & `mcp-server.js`)
- Model Context Protocol stdio server allowing Claude Code CLI, Cursor, and Windsurf to query constitution invariants, functional specs, task graphs, and validate code patches directly against architectural rules.

### 6. 🏗️ Guided Skyscraper Blueprint Journey (5-Stage Studio Experience)
- **Stage 1 (Tell Your Vision):** Plain-English intake with 12+ battle-tested starter blueprints across 8 industries (*FinTech, Healthcare, AI Agents, E-Commerce, Security, Supply Chain, GovTech*).
- **Stage 2 (Set The Boundaries):** 6 core regulatory archetypes + 16-framework compliance taxonomy + Conway's Law Team Delivery Topology selector (*Single Squad, Domain Pods, Hub-and-Spoke, Regulated ARB*).
- **Stage 3 (The Architect's Interview):** The "Grill-Me" discovery loop solving architectural dilemmas with 1-click recommended enterprise defaults.
- **Stage 4 (The 4-Pillar Master Blueprint):** Live AI or instant offline synthesis generating `constitution.md`, `spec.md`, `tasks.md`, `governance.md`, and C4 Mermaid diagrams.
- **Stage 5 (Hand to the Builders):** 1-click prompts for Cursor, Claude 3.5 Sonnet, and AGENTS.md, Jira CSV export, and synthetic Monte Carlo simulation.

---

## 🏛️ The 4-Pillar SDD Architecture

```mermaid
flowchart TD
    subgraph SpecGlow["SpecGlow SDD Studio (Client-Side Engine)"]
        P1["📜 Pillar 1: Project Constitution\n(constitution.md)\n• Non-negotiable Invariants\n• STRIDE Threat Matrix\n• Anti-Slopsquatting Whitelist\n• Strict Anti-Requirements"]
        P2["⚙️ Pillar 2: Functional & Contract Spec\n(spec.md)\n• User Journeys & Edge Cases\n• Deterministic State Matrix\n• JSON Schemas (Request/Response)\n• Gherkin Acceptance Scenarios"]
        P3["🤖 Pillar 3: Agent Task Graph\n(tasks.md)\n• Atomic DAG Dependency Sequencing\n• Explicit 'Blocked By' IDs\n• Target File Paths\n• Automated Acceptance Commands"]
        P4["📊 Pillar 4: Delivery & Risk Governance\n(governance.md)\n• Monte Carlo 1,000-Trial Forecast\n• P50 / P85 / P95 Confidence Dates\n• Multi-Model Token & Budget Calculator\n• Architectural Risk Heatmap"]
    end

    Input["Initiative Input + 6-Region Taxonomy"] --> SpecGlow
    SpecGlow --> Exports["Enterprise Deliverables (.zip, CSV, YAML, Tests, MCP, CI)"]
```

1. **📜 Project Constitution (`constitution.md`):** Non-negotiable technical constraints, runtime rules, security invariants, STRIDE threat mitigations, and explicit anti-requirements (strictly out-of-scope).
2. **⚙️ Functional & Contract Spec (`spec.md`):** Actor journeys, deterministic state transition matrices, API request/response JSON schemas, and executable Gherkin acceptance criteria.
3. **🤖 Agent-Executable Task Graph (`tasks.md`):** Atomic tasks sequenced in a directed acyclic graph (DAG) with explicit dependency blockers (`Blocked By`), target file paths, and automated acceptance test commands for AI coding agents.
4. **📊 Delivery & Risk Governance (`governance.md`):** Sprint velocity forecasting (Fibonacci story points), interactive 1,000-trial Monte Carlo delivery simulation with P50/P85/P95 percentile commitments, multi-model frontier AI token & budget calculator (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, DeepSeek V3/R1), architectural risk matrix, and a steering-committee-ready executive status report.

---

## 🗺️ End-to-End 5-Step Workflow

```mermaid
flowchart LR
    A["STEP 1: Input Path\n(1A Presets | 1B Composer | 1C Raw | 🎙️ Voice | 🗄️ Library)"] --> B["STEP 2: Taxonomy, Jurisdiction & Rigor\n(Domain, 6-Region Compliance, Rigor Depth)"]
    B --> C["STEP 3: Synthesis Engine\n(Grill-Me Dilemmas + BYOK Frontier Models / Demo)"]
    C --> D["STEP 4: Spec & Architecture Viewer\n(Constitution | Spec | Tasks | Governance | Visual C4 | Contracts)"]
    D --> E["STEP 5: Agent & Enterprise Exports\n(CLAUDE.md | .cursorrules | Attestation | OpenAPI 3.1 | Jira/ADO | MCP | ZIP)"]
```

### **STEP 1: Requirement Ingestion, Brownfield Context & Library**
- **Path 1A (1-Click Enterprise Presets):** Instant real-world initiatives across FinTech, HealthTech, and Cloud SaaS.
- **Path 1B (Interactive PRD Composer):** Multi-archetype builder allowing engineers to combine topologies, capability engines, personas, and security invariants with custom architectural rationales.
- **Path 1C (Direct PRD Textarea):** Direct markdown, meeting transcripts, or user stories.
- **📁 Brownfield Ingestion:** Paste existing schemas (`schema.prisma`, SQL DDL), `package.json`, or API routing files so the AI preserves and extends existing database tables and packages.
- **🗄️ Saved Initiatives Library:** Access previously generated initiatives stored in browser IndexedDB with 1-click restore.
- **🔄 Bidirectional Rehydration:** Click **"Import SDD Manifest"** to upload any previously exported `sdd-manifest.json` and restore all state into memory.
- **🎙️ Voice Co-Pilot:** Dictate your feature idea and let the AI auto-configure the studio.

### **STEP 2: Industry Taxonomy, Regulatory Jurisdiction & Rigor**
- **Domain Categories:** FinTech & Banking, HealthTech & Life Sciences, GovTech & Public Sector, Cloud B2B SaaS, Omnichannel Commerce, AI & Data Engineering, and Custom Domains.
- **6-Region Compliance Matrix:** Select from US/Canada, EU/UK, GCC/Middle East, ANZ, APAC, Pakistan, or Global Baseline.
- **Delivery Rigor:**
  - *MVP / Fast-Track:* Rapid velocity, core happy paths, essential security guards.
  - *Standard Agile Sprint:* Full edge cases, balanced contracts, regression test graph.
  - *Mission-Critical / Enterprise:* Maximum rigor, strict audit invariants, zero-trust constraints.

### **STEP 3: Architectural Interrogation ("Grill-Me" Loop) & Synthesis**
- **🛡️ Architectural Interrogation (Grill-Me Loop):** Challenges assumptions before generation with 3 to 5 critical architectural dilemmas, including mandatory jurisdiction-specific dilemmas (e.g., GCC data residency, EU GDPR Article 25 privacy by design, or US HIPAA audit logging).
- **Injected Invariants:** Confirmed trade-offs and brownfield assets are directly injected into prompt context and locked inside `constitution.md`.
- **Flexible Modes:** Full interactive interrogation with custom trade-offs, standard defaults, or **Instant Offline Demo**.

### **STEP 4: Inspect 4-Pillars, Diagrams & Machine Contracts**
- **6-Tab Navigation:**
  - `constitution.md`: Security invariants, STRIDE threat matrix, anti-requirements, package whitelist.
  - `spec.md`: User journeys, state matrix, JSON contracts, Gherkin scenarios.
  - `tasks.md`: Sequenced atomic DAG tasks with blockers.
  - `governance.md`: Monte Carlo 1,000-trial delivery simulation, multi-model AI token budget estimator, and risk heatmap.
  - `📐 Visual Architecture`: Interactive C4 Context, Sequence, and ERD diagrams rendered live via client-side Mermaid.js with SVG download.
  - `🧪 Machine Contracts & Tests`: Standards-compliant OpenAPI 3.1 YAML schema, executable Vitest/Playwright acceptance test harness, and live MCP IDE bridge.

### **STEP 5: Agent, Contract & Enterprise Exports**
- **Client Security Attestation (`SECURITY-ATTESTATION.md`):** Executive compliance and security verification document.
- **Agent Instruction Contracts:** 1-click clipboard or download for `CLAUDE.md` (Claude Code CLI), `AGENTS.md` (Universal Agentic Standard), and `.cursorrules` (Cursor IDE / Windsurf).
- **Standalone Zero-Dependency MCP Server (`mcp-server.js`):** Executable Node 18+ JSON-RPC 2.0 stdio server connecting Cursor and Claude Code (`claude mcp add`) directly to the spec with zero `npm install` needed.
- **Continuous Spec Invariant Guardrail (`.github/workflows/sdd-verify.yml`):** Token-budgeted GitHub Actions workflow with pathspec exclusions and a safety budget gating pull requests against anti-requirements and forbidden dependencies.
- **Enterprise Project Management Sync:** 1-click `jira-tasks.csv` (RFC 4180 bulk import for Jira/Linear), `ado-work-items.csv` (Microsoft Azure DevOps Boards format), and `import-tasks.sh` (executable GitHub CLI script to batch-create issues with story points and labels).
- **1-Click Complete SDD Bundle:** Pure client-side PKZIP stream packaging all 18+ documentation, contract, test suite, agent instruction, CI guardrail, MCP config, and diagram files with zero external server dependencies.

---

## 🔒 100% Client-Side Privacy (BYOK Architecture)

SpecGlow SDD Studio runs with **zero proprietary backend servers**. 

- **Direct In-Browser Invocations:** Requirements and API keys never touch an intermediate proxy or server.
- **Zero Third-Party Telemetry:** Requirements, API keys, and generated specifications remain strictly in your browser.
- **Local Storage & IndexedDB Sandbox:** Provider configurations, saved initiatives, and themes persist exclusively in your device's browser memory.

### Supported Model Providers:
| Provider | Default Base URL | Recommended Models | Notes |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta` | `gemini-2.5-flash`, `gemini-4-argon` | Native structured JSON support |
| **Anthropic** | `https://api.anthropic.com/v1` | `claude-3-5-sonnet`, `claude-3-7-sonnet` | Direct browser access enabled |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini`, `gpt-4o`, `gpt-4.5` | Industry standard structured outputs |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Ultra-fast LPU inference |
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat`, `deepseek-reasoner` | High-reasoning coding models |
| **Local Ollama** | `http://localhost:11434/v1` | `llama3`, `mistral`, `deepseek-r1` | 100% offline & local (No key needed) |
| **xAI** | `https://api.x.ai/v1` | `grok-2-1212`, `grok-3` | High-throughput reasoning |
| **OpenRouter** | `https://openrouter.ai/api/v1` | Any OpenRouter endpoint | Universal multi-model gateway |
| **Custom Gateway** | Configurable | Any OpenAI-compatible proxy | Enterprise LiteLLM, vLLM |

---

## 📦 In-Browser ZIP Bundler Artifact Suite

Clicking **"Download Complete SDD Bundle (.zip)"** packages the complete 18+ artifact suite directly into a standard ZIP archive in client memory using binary Uint8Array streams:
```
sdd-bundle-[initiative-name].zip
├── constitution.md              # Project Constitution & STRIDE Threat Modeling Matrix
├── spec.md                      # Functional & Contract Specifications
├── tasks.md                     # Agent-Executable Task Graph (DAG)
├── governance.md                # Sprint Velocity & Risk Governance
├── SECURITY-ATTESTATION.md      # Client Security & Architecture Attestation Report
├── CLAUDE.md                    # Tailored instructions for Claude Code CLI
├── AGENTS.md                    # Universal AI Agent Operational Directive
├── .cursorrules                 # Cursor IDE / Windsurf Context Rules
├── openapi.yaml                 # OpenAPI 3.1 Contract Specification
├── tests/acceptance.spec.ts     # Vitest & Playwright Acceptance Harness
├── .github/workflows/sdd-verify.yml # Token-budgeted PR Invariant Guardrail
├── specglow-mcp.json            # Model Context Protocol configuration
├── mcp-server.js                # Standalone Node 18+ stdio MCP Server (0 deps)
├── jira-tasks.csv               # RFC 4180 CSV for Jira / Linear bulk import
├── ado-work-items.csv           # Azure DevOps Boards Work Item CSV
├── import-tasks.sh              # Executable GitHub CLI (gh) issue creator
├── architecture-c4.mermaid      # C4 System Context Diagram source
├── architecture-sequence.mermaid# End-to-End Sequence Diagram source
├── architecture-erd.mermaid     # Data Model & State Transition source
└── sdd-manifest.json            # Bi-directional rehydration manifest
```

---

## 🚀 Quickstart & Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/specglow-sdd-studio.git
cd specglow-sdd-studio

# Install dependencies
npm install

# Start local development server
npm run dev

# Run compilation check & build
npm run build

# Run linter
npm run lint

# Preview production build locally
npm run preview
```

---

## 📜 License & Open-Source Attribution

This project is licensed under the **Apache-2.0 License** — see the [LICENSE](LICENSE) file for details.

**Created by:**  
**Syed Imon Rizvi (Mercer and Mills)**  
- 🌐 **Website:** [www.mercerandmills.com](https://www.mercerandmills.com)  
- 💼 **LinkedIn:** [https://www.linkedin.com/in/syedimonrizvi](https://www.linkedin.com/in/syedimonrizvi)  
- ✉️ **Contact:** [contact@mercerandmills.com](mailto:contact@mercerandmills.com)  

*Enterprise Solutions Architect & Agile Delivery Governance Leader*
