# 📜 Changelog
All notable changes to **SpecFlow SDD Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
