# 📜 Changelog
All notable changes to **SpecGlow SDD Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.2.0] - 2026-10-20 (Pre-Launch Hardening & Brand Identity)

### 🌟 Added
- **Official 3D Isometric "S" Monogram Brand Identity:**
  - Evaluated 4 logo contenders and officially adopted the 3D Isometric Cyber "S" Monogram (`public/logo.png`, `public/favicon.png`, `src/assets/logo.png`).
  - Added an ambient cyan/indigo radial glow ring around the logo in `Header.tsx` with high-contrast Day/Night mode styling.
  - Configured `index.html` with high-res PNG favicons, `apple-touch-icon`, and OpenGraph preview tags.
- **Persistent "Skyscraper Blueprint Journey" HUD:**
  - Pinned a sticky floating HUD (`sticky top-[70px] sm:top-[76px] z-30`) in `VisualWorkflowPage.tsx` that appears automatically when scrolling into any stage.
  - Keeps all 5 stages (`01. Vision`, `02. Boundaries`, `03. Interview`, `04. Blueprints`, `05. Builders`) continuously in front of the user with live status indicators (active cyan pulse, completion checkmark `✓`, lock status `🔒`, and progress % bar).
  - 1-click stage jumping with smooth viewport centering via `#stage-workspace`.
  - Added a **Compact / Expand** toggle for customizable screen real estate.
- **Bulletproof Mermaid Diagram Engine & Zoom Controls:**
  - Added `sanitizeMermaidCode` in `MermaidViewer.tsx` to automatically strip code fences, fix missing root keywords (`flowchart TD`, `sequenceDiagram`, `erDiagram`), and programmatically quote node labels with special characters (e.g. `Client["User (Mobile)"]`).
  - Added an auto-recovery fallback renderer (`getVerifiedFallbackDiagram`) with automatic DOM error cleanup (`#d...`) so a broken diagram box is never displayed.
  - Implemented interactive vector zoom controls (`- / 100% / +` and `Reset`) with responsive canvas scaling.
  - Displayed a green `✓ Vector Syntax Stabilized` verification badge.
- **SDD Mental Model & 3-Step Agent Handoff Guide:**
  - Added the *"Why Spec-Driven Blueprints Before Writing Code?"* educational card in Stage 1 explaining why locking specifications upfront eliminates AI context drift and hallucinated APIs.
  - Added a 3-step developer blueprint execution guide in Stage 5 with copyable terminal commands for **Cursor** (`@master-spec.json`), **Claude Desktop** (via MCP stdio server), and **Windsurf**.
- **Voice AI Co-Pilot & Dynamic Architecture Advisor:**
  - Restored audio Voice Co-Pilot recording with real-time intent parsing.
  - Added AI Idea Architecture Advisor to recommend platform targets, tech stacks, and regulatory domains from natural language prompts.
  - Standardized 4-option architectural dilemma structure with instant "Accept All Recommended" reactive feedback.

### 🛡️ Hardened & Fixed
- **Single-Shot JSON Resilient Repair & Max Output Ceiling:**
  - Enhanced `cleanAndParseJSON` in `aiService.ts` with illegal control character stripping, trailing comma elimination, and mid-stream truncation repair (auto-closing open quotes, brackets, and braces).
  - Raised token generation ceiling to 8,192 tokens across Gemini, Anthropic, and OpenAI.
  - Wrapped live synthesis with an auto-fallback to high-fidelity reference specification packages on any network or rate-limit error.
- **Demo Mode vs. Live AI Transparency:**
  - Converted the header model indicator into an interactive status button distinguishing `🟡 Interactive Demo Mode • Connect Key` (with 1-click settings trigger) and `🟢 Live AI: Provider (Model)`.
  - Clarified simulated reference blueprints vs. live BYOK generation in Stage 1 and Stage 4.
- **Responsive Viewport Density for 13" Laptops & Mobile:**
  - Refactored Quick Metrics pills, diagram switcher tabs, and export action grids in `SpecificationViewer.tsx` to fluid `grid-cols-3 sm:flex` containers with horizontal scroll guards.

---

## [3.0.0] - 2026-10-20 (Enterprise Release)

### 🌟 Added
- **Global Rebranding to SpecGlow SDD Studio (`specglow-sdd-studio`):**
  - Fully rebranded application identity, metadata, page titles, and CLI bindings from SpecFlow to **SpecGlow SDD Studio**.
  - Updated `package.json` to v3.0.0 (`specglow-sdd-studio`) and licensed under **Apache-2.0**.
  - Updated copyright and attribution across application footer, documentation, and LICENSE to **Syed Imon Rizvi (Mercer and Mills)**.
  - Standardized Model Context Protocol configuration to `specglow-mcp.json` and `specglow-sdd` server name.
- **6-Region Regulatory & Cybersecurity Matrix:**
  - Added 7 distinct jurisdictional compliance profiles selectable in Step 2:
    1. **US / Canada (Federal & FinTech):** SOC 2 Type II, HIPAA, FedRAMP, CCPA, PCI-DSS v4.0, GLBA.
    2. **EU / UK (GDPR & Digital Sovereignty):** GDPR (Articles 25/32), DORA, EU AI Act, NIS2, UK DPA 2018.
    3. **GCC / Middle East (Sovereignty & Privacy):** UAE PDPL, Saudi NDMO / SAMA Cyber Security Framework, CBUAE.
    4. **Australia / New Zealand (CPS 234 & Privacy):** APRA CPS 234, Privacy Act 1988, Essential Eight, NZ Privacy Act 2020.
    5. **APAC / Singapore (MAS TRM & Cross-Border):** MAS Technology Risk Management, Singapore PDPA, Cross-Border Privacy Rules.
    6. **Pakistan (SBP & Digital Governance):** State Bank of Pakistan (SBP) Framework for Enterprise Technology Governance, PECA 2016.
    7. **Global Enterprise Baseline:** ISO/IEC 27001:2022, SOC 2 Type II, and NIST Cybersecurity Framework 2.0.
  - Mandatory jurisdictional dilemma auto-injected into Step 3 Architectural Interrogation ("Grill-Me" Loop).
- **Cybersecurity Engine: STRIDE Threat Modeling & Anti-Slopsquatting:**
  - Synthesizes an audit-ready **STRIDE Threat Modeling Matrix** table in `constitution.md` (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) with designated mitigation strategies and automated verification commands.
  - Injected an **Anti-Slopsquatting Approved Package Whitelist** invariant into `constitution.md` and `CLAUDE.md`, strictly prohibiting hallucinated or unvetted dependencies and enforcing package lockfile pinning with integrity hashes.
- **Client Security & Architecture Attestation (`SECURITY-ATTESTATION.md`):**
  - Implemented `generateSecurityAttestation(pkg)` producing an executive, audit-ready compliance document.
  - Details Executive Summary, Jurisdictional Compliance, Zero-Telemetry BYOK Privacy Attestation, STRIDE Threat Summary, Ecosystem Package Integrity, and Continuous CI Verification commitments.
  - Added 1-click download button in Step 5 and included automatically in the `.zip` export bundle.
- **Persistent Initiative Library (Native IndexedDB):**
  - Implemented 100% in-browser, zero-backend persistent storage via native IndexedDB (`specglow_sdd_db`, object store `initiatives`).
  - Automatically saves all synthesized initiatives and imported manifests.
  - Added interactive **"Saved Initiatives"** modal in Step 1 with 1-click **Load** and **Delete** actions.
- **Production Cloud Deployment & Vercel SPA Routing:**
  - Added `vercel.json` with single-page app rewrite routing for Vite.
  - Deployed to live production on Vercel: `https://specglow-sdd-studio.vercel.app`.
  - Linked remote GitHub repository: `https://github.com/getmorefromlife/specglow-sdd-studio.git`.

### 🔧 Changed
- Updated application footer to: `"Created by Syed Imon Rizvi (Mercer and Mills) • Licensed under Apache-2.0"`.
- Replaced `LICENSE` with the official Apache License Version 2.0.
- Updated `exportUtils.ts` to include `SECURITY-ATTESTATION.md` and `specglow-mcp.json` in the master `.zip` bundle (now 18+ files).
- Hardened TypeScript interfaces in `types/index.ts` with 0 `any` types.

---

## [2.2.0] - 2026-10-17

### 🌟 Added
- **Standalone Zero-Dependency MCP Server (`mcp-server.js`):**
  - Synthesizes an executable Node.js 18+ JSON-RPC 2.0 stdio server conforming to the Anthropic Model Context Protocol (`protocolVersion: '2024-11-05'`).
  - Zero external npm dependencies (uses only native `readline`, `fs`, `path`, `process` in CommonJS format). Runs immediately via `node mcp-server.js`.
  - Exposes 4 operational AI tools:
    1. `get_constitution`: Retrieves architectural invariants, security rules, and anti-requirements.
    2. `get_specification`: Retrieves functional user journeys, boundary conditions, and API schemas.
    3. `get_tasks`: Retrieves atomic DAG delivery tasks, story points, and acceptance criteria.
    4. `validate_patch`: Audits code diffs or snippets against constitutional rules and returns a structured PASS/FAIL report.
  - Dual-mode fallback: Reads `./constitution.md`, `./spec.md`, and `./tasks.md` from disk if present, with an embedded in-memory specification snapshot baked into the script for portable execution anywhere.
  - Added 1-click **"mcp-server.js"** download button in the Step 5 export toolbar and Tab 6 (*MCP & CI Guardrails*).
- **Bidirectional Project Rehydration ("Import SDD Manifest"):**
  - Added an **"Import SDD Manifest"** button and file drop handler in Step 1.
  - Safely parses `sdd-manifest.json` and `sdd-package-*.json` files 100% in-browser memory via native `FileReader.readAsText()`. Zero network egress preserving BYOK privacy.
  - Fully restores all input parameters (Feature Title, Initiative Brief, Brownfield assets, Domain, Target Depth) and rehydrates all 6 generated tabs, Monte Carlo delivery graphs, and Mermaid diagrams.
  - Defensive error handling with user feedback toasts for malformed or non-SpecFlow JSON files.
- **Hardened Token-Budgeted CI/CD Action (`.github/workflows/sdd-verify.yml`):**
  - Implemented git pathspec exclusion filters to eliminate noise: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `*.min.*`, images/SVGs, and `dist/`/`build/`/`.next/` caches.
  - Added a strict 20,000-character safety evaluation ceiling with automatic truncation flags to prevent context-window overflow and excessive LLM API costs.
  - Python evaluation engine now writes a structured markdown status table (`| Invariant Category | Target Rule | Status | Details |`) directly to `$GITHUB_STEP_SUMMARY` and PR bot comments.

### 🔧 Changed
- Updated `downloadSddZipBundle` to package all 15+ documentation, contract, test harness, MCP server, and diagram assets.
- Updated `specflow-mcp.json` and Claude Code CLI command snippet to execute `node ./mcp-server.js`.
- Synchronized [README.md](file:///Users/syedrizvi/Documents/my%20website%20projects/SpecFlow%20SDD%20Studio/README.md) and [GuideModal.tsx](file:///Users/syedrizvi/Documents/my%20website%20projects/SpecFlow%20SDD%20Studio/src/components/GuideModal.tsx) walkthroughs to document the complete MCP server, CI guardrail, and rehydration workflow.

---

## [2.1.0] - 2026-10-17

### 🌟 Added
- **Brownfield Context Ingestion:**
  - Added collapsible "Existing Project Context / Brownfield Assets" drawer in Step 1.
  - Allows pasting of `schema.prisma`, SQL DDL, `package.json`, or legacy API route structures.
  - Injected directly into the 4-Pillar synthesis prompt and the "Grill-Me" interrogation loop.
  - Includes a 1-click "+ Sample Prisma" template, character counter, active pill badge, and clear button.
- **Microsoft Azure DevOps (ADO) Boards Exporter:**
  - Added pure client-side `generateAzureDevOpsCsv(pkg)` in `taskExportGenerators.ts`.
  - Generates RFC 4180-compliant CSV files mapped to the standard Azure Boards Work Item Import schema (`Epic` and `User Story` hierarchy with Title, Description, Acceptance Criteria, Story Points, Priority, State, and Tags).
  - Added 1-click **"Export ADO CSV"** button in Step 5 toolbar.
- **Continuous Spec Invariant Guardrail Generator:**
  - Added `generateGitHubWorkflow(pkg)` synthesizing `.github/workflows/sdd-verify.yml`.
  - Automates PR diff extraction, embedded Python invariant scanning, and failure bot comments.
- **Model Context Protocol (MCP) Bridge:**
  - Added `generateSpecFlowMcpConfig(pkg)` synthesizing `specflow-mcp.json` for Cursor and Windsurf IDEs.
  - Added 1-click Claude Code CLI registration snippet (`claude mcp add`).

---

## [2.0.0] - 2026-10-17

### 🌟 Added
- **Pre-Synthesis Architectural Interrogation ("Grill-Me" Loop):**
  - Interactive multi-choice dilemma modal challenging assumptions before synthesis.
  - AI generates 3 to 5 domain-tailored architectural trade-offs (e.g., PostgreSQL RLS vs. Isolated DB, Synchronous Webhooks vs. Event Bus, Strong vs. Eventual Consistency).
  - Decisions lock into `constitution.md` and `tasks.md`.
- **Machine-Executable Contracts & Test Harness:**
  - Standards-compliant OpenAPI 3.1.0 YAML and JSON generation with request/response schemas.
  - Executable TypeScript acceptance test harness (`tests/acceptance.spec.ts`) ready for Vitest and Playwright CI test gates.
  - Dedicated Tab 6 sub-views for YAML, JSON, and test suites.
- **Monte Carlo Sprint Delivery Simulator:**
  - 1,000-trial stochastic delivery simulation with P50, P85, and P95 percentile commitments.
  - Multi-model frontier AI token & budget calculator (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, DeepSeek V3/R1).
- **Pure Client-Side Zero-Dependency In-Browser ZIP Bundler:**
  - Custom binary Uint8Array PKZIP stream generator replacing heavy external zip libraries.

---

## [1.0.0] - 2026-10-16

### 🌟 Initial Release
- 4-Pillar SDD Specification Engine (`constitution.md`, `spec.md`, `tasks.md`, `governance.md`).
- 100% Client-Side Voice Co-Pilot via Web Speech API.
- Day & Night High-Contrast Engine (WCAG AAA compliant).
- Bring Your Own Key (BYOK) privacy model supporting OpenAI, Anthropic, Gemini, Groq, DeepSeek, and local Ollama.
- Jira/Linear CSV export and GitHub CLI issue creator script.
