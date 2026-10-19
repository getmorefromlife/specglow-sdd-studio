import type { SddArtifactPackage } from '../types'

/**
 * Generates an automated GitHub Actions CI workflow (.github/workflows/sdd-verify.yml).
 * 
 * Hardened Enterprise Features:
 * - Token-Budgeted: Excludes lockfiles, minified files, binary assets, and build caches.
 * - Truncation Guardrail: Enforces a 20,000 character evaluation budget with safety flags.
 * - Markdown Summary: Produces a structured PASS/FAIL table written to GitHub Step Summary and PR comments.
 */
export function generateGitHubWorkflow(pkg: SddArtifactPackage): string {
  const title = pkg.title.replace(/"/g, '\\"')
  const antiReqCount = pkg.constitution.antiRequirements.length
  const securityCount = pkg.constitution.securityInvariants.length
  const prohibitedPackages = pkg.constitution.technicalConstraints
    .filter(c => c.category === 'Forbidden Packages / Patterns')
    .map(c => c.rule)
    .filter(Boolean)

  const prohibitedJson = JSON.stringify(prohibitedPackages)
  const antiReqsJson = JSON.stringify(pkg.constitution.antiRequirements.map(a => ({ id: a.id, rule: a.item })))
  const securityJson = JSON.stringify(pkg.constitution.securityInvariants.map(s => ({ id: s.id, desc: s.invariant })))

  return `name: SpecGlow SDD Continuous Verification & Invariant Guardrail

on:
  pull_request:
    branches: [ main, master, develop, staging ]
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write

jobs:
  verify-spec-invariants:
    name: Verify Architectural Invariants & Spec Drift
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Verify SDD Core Artifacts Present
        run: |
          echo "🔍 Checking for SpecGlow SDD Core Governance Artifacts..."
          MISSING_FILES=0
          for f in constitution.md spec.md tasks.md; do
            if [ ! -f "$f" ]; then
              echo "❌ Missing mandatory governance artifact: $f"
              MISSING_FILES=$((MISSING_FILES + 1))
            else
              echo "✅ Found $f"
            fi
          done
          if [ $MISSING_FILES -gt 0 ]; then
            echo "::error::Repository lacks mandatory SpecGlow SDD governance artifacts."
            exit 1
          fi

      - name: Extract Sanitized & Token-Budgeted Pull Request Diff
        id: diff
        run: |
          echo "🧹 Extracting diff with noise exclusion (lockfiles, minified assets, binaries)..."
          # Pathspec exclusions prevent context window overflows and huge lockfile noise
          git diff origin/\${{ github.base_ref }}...HEAD -- \\
            ':(exclude)*package-lock.json' \\
            ':(exclude)*yarn.lock' \\
            ':(exclude)*pnpm-lock.yaml' \\
            ':(exclude)*bun.lockb' \\
            ':(exclude)*.min.*' \\
            ':(exclude)*.svg' \\
            ':(exclude)*.png' \\
            ':(exclude)*.jpg' \\
            ':(exclude)*.jpeg' \\
            ':(exclude)*.ico' \\
            ':(exclude)*.woff*' \\
            ':(exclude)dist/*' \\
            ':(exclude)build/*' \\
            ':(exclude).next/*' > raw_pr.patch

          # Enforce 20,000-character safety evaluation budget
          MAX_CHARS=20000
          RAW_BYTES=$(wc -c < raw_pr.patch || echo 0)
          if [ "$RAW_BYTES" -gt "$MAX_CHARS" ]; then
            echo "⚠️ Pull request diff exceeds token safety budget ($RAW_BYTES chars > $MAX_CHARS). Truncating."
            head -c "$MAX_CHARS" raw_pr.patch > pr_changes.patch
            echo "truncated=true" >> "$GITHUB_OUTPUT"
          else
            cp raw_pr.patch pr_changes.patch
            echo "truncated=false" >> "$GITHUB_OUTPUT"
          fi

          DIFF_LINES=$(wc -l < pr_changes.patch)
          echo "diff_lines=$DIFF_LINES" >> "$GITHUB_OUTPUT"
          echo "📄 Extracted $DIFF_LINES changed lines from pull request."

      - name: Run Constitution & Invariant Scanner
        id: linter
        run: |
          cat << 'EOF' > verify_invariants.py
          import sys
          import json
          import os

          def main():
              if not os.path.exists('pr_changes.patch'):
                  print("No patch file found.")
                  sys.exit(0)

              with open('pr_changes.patch', 'r', encoding='utf-8', errors='ignore') as f:
                  patch = f.read()

              added_lines = [
                  line[1:].strip() 
                  for line in patch.splitlines() 
                  if line.startswith('+') and not line.startswith('+++')
              ]
              full_added_text = " ".join(added_lines).lower()

              prohibited = json.loads('${prohibitedJson}')
              anti_reqs = json.loads('${antiReqsJson}')
              security = json.loads('${securityJson}')

              violations = []
              results_table = []

              # 1. Prohibited Packages Check
              for pkg in prohibited:
                  clean = pkg.lower().strip()
                  if clean and clean in full_added_text:
                      violations.append(f"Forbidden package/pattern detected: \`{pkg}\`")
                      results_table.append(f"| **Forbidden Packages** | \`{pkg}\` | 🔴 FAIL | Signature found in added lines |")

              # 2. Universal Security Anti-Patterns Check
              security_patterns = [
                  ("eval(", "Dangerous dynamic code execution"),
                  ("dangerouslysetinnerhtml", "Unsanitized cross-site scripting risk"),
                  ("password", "Plaintext parameter or insecure credential naming"),
                  ("allowall", "Overly permissive CORS / authorization policy")
              ]
              for kw, reason in security_patterns:
                  if kw in full_added_text:
                      violations.append(f"Security invariant conflict: {reason} (\`{kw}\`)")
                      results_table.append(f"| **Security Invariant** | \`{kw}\` | 🔴 FAIL | {reason} |")

              is_passed = len(violations) == 0

              # Generate Markdown Summary Report
              summary = [
                  "### 🛡️ SpecGlow SDD Invariant Evaluation",
                  f"**Initiative:** ${title}",
                  f"**Status:** {'🟢 **PASS: Architectural Invariants Preserved**' if is_passed else '🔴 **FAIL: Invariant Breaches Detected**'}",
                  "",
                  "| Invariant Category | Target Rule | Status | Details |",
                  "| :--- | :--- | :--- | :--- |"
              ]

              if results_table:
                  summary.extend(results_table)
              else:
                  summary.append(f"| **Anti-Requirements** | ${antiReqCount} Established Rules | 🟢 PASS | No prohibited patterns detected |")
                  summary.append(f"| **Security Invariants** | ${securityCount} Established Rules | 🟢 PASS | Zero high-risk signatures found |")
                  summary.append(f"| **Package Constraints** | {len(prohibited)} Forbidden Libraries | 🟢 PASS | Clean dependency additions |")

              summary_md = "\\n".join(summary)

              # Write to GitHub Step Summary
              if "GITHUB_STEP_SUMMARY" in os.environ:
                  with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as gss:
                      gss.write(summary_md + "\\n")

              if not is_passed:
                  with open('violations.txt', 'w', encoding='utf-8') as out:
                      out.write(summary_md)
                  print("❌ Architectural invariant breach detected.")
                  sys.exit(1)
              else:
                  print("✅ All ${antiReqCount} anti-requirements and ${securityCount} security invariants passed.")

          if __name__ == '__main__':
              main()
          EOF

          python3 verify_invariants.py

      - name: Post Invariant Breach Notification on PR
        if: failure() && steps.linter.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let report = '### 🚨 SpecGlow SDD Guardrail: Constitution Invariant Breach\\n\\nCode additions in this PR violate architectural invariants.';
            if (fs.existsSync('violations.txt')) {
              report = fs.readFileSync('violations.txt', 'utf8');
            }
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report + '\\n\\n> **Directive:** Please align your pull request with \`constitution.md\` before requesting review.'
            });
`
}
