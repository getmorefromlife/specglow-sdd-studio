import type { SddArtifactPackage } from '../types'

/**
 * Escapes text for RFC 4180 compliant CSV format.
 */
function escapeCsv(text: string | number | undefined): string {
  if (text === undefined || text === null) return '""'
  const str = String(text).replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Generates an RFC 4180-compliant CSV export of the task graph
 * designed for direct 1-click import into Jira, Linear, or Azure DevOps.
 */
export function generateJiraCsv(pkg: SddArtifactPackage): string {
  const headers = [
    'Issue Type',
    'Summary',
    'Description',
    'Story Points',
    'Layer',
    'Blocked By',
    'Target Files',
    'Acceptance Criteria'
  ]

  const rows: string[] = [headers.join(',')]

  // 1. Epic row for the initiative
  rows.push([
    escapeCsv('Epic'),
    escapeCsv(`[EPIC] ${pkg.title}`),
    escapeCsv(`SpecGlow SDD Initiative: ${pkg.title}\nDomain: ${pkg.domain}\nRigor: ${pkg.targetDepth}\n\n${pkg.constitution.systemOverview}`),
    escapeCsv(pkg.governance.forecasting.totalStoryPoints),
    escapeCsv('Architecture & Governance'),
    escapeCsv('None'),
    escapeCsv('constitution.md, spec.md, tasks.md, governance.md'),
    escapeCsv('All 4 SDD pillars reviewed and verified by engineering leads.')
  ].join(','))

  // 2. Individual story/task rows
  for (const task of pkg.taskGraph.tasks) {
    const description = `${task.description}\n\nTarget File Paths:\n${task.targetFilePaths.map(f => `- ${f}`).join('\n')}`
    
    rows.push([
      escapeCsv('Story'),
      escapeCsv(`[${task.id}] ${task.title}`),
      escapeCsv(description),
      escapeCsv(task.complexityPoints),
      escapeCsv(task.layer),
      escapeCsv(task.blockedBy.length > 0 ? task.blockedBy.join(', ') : 'None'),
      escapeCsv(task.targetFilePaths.join(', ')),
      escapeCsv(task.acceptanceTestCriteria)
    ].join(','))
  }

  return rows.join('\r\n')
}

/**
 * Generates an RFC 4180-compliant CSV export structured specifically
 * for Microsoft Azure DevOps (ADO) Boards Work Item import.
 */
export function generateAzureDevOpsCsv(pkg: SddArtifactPackage): string {
  const headers = [
    'Work Item Type',
    'Title',
    'Description',
    'Acceptance Criteria',
    'Story Points',
    'Priority',
    'State',
    'Tags'
  ]

  const rows: string[] = [headers.join(',')]

  // 1. Root Epic row for the initiative
  rows.push([
    escapeCsv('Epic'),
    escapeCsv(`[EPIC] ${pkg.title}`),
    escapeCsv(`SpecGlow SDD Initiative: ${pkg.title}\nDomain: ${pkg.domain}\nRigor: ${pkg.targetDepth}\n\n${pkg.constitution.systemOverview}`),
    escapeCsv('All 4 SDD pillars reviewed, constitution invariants locked, and architecture diagrams verified.'),
    escapeCsv(pkg.governance.forecasting.totalStoryPoints),
    escapeCsv(1),
    escapeCsv('New'),
    escapeCsv(`SpecGlow; SDD; Epic; ${pkg.domain.replace(/[^a-zA-Z0-9]+/g, '-')}`)
  ].join(','))

  // 2. Individual User Story / Task rows
  for (const task of pkg.taskGraph.tasks) {
    const description = `${task.description}\n\nTarget File Paths:\n${task.targetFilePaths.map(f => `- ${f}`).join('\n')}`
    const priority = task.layer === 'Database & Migration' || task.layer === 'Security & Middleware' ? 1 : (task.layer === 'Backend Service & API' ? 2 : 3)
    const layerTag = task.layer.replace(/[^a-zA-Z0-9]+/g, '-')
    const blockerTag = task.blockedBy.length > 0 ? `; BlockedBy-${task.blockedBy.join('-')}` : ''

    rows.push([
      escapeCsv('User Story'),
      escapeCsv(`[${task.id}] ${task.title}`),
      escapeCsv(description),
      escapeCsv(task.acceptanceTestCriteria),
      escapeCsv(task.complexityPoints),
      escapeCsv(priority),
      escapeCsv('New'),
      escapeCsv(`SpecGlow; SDD; ${layerTag}${blockerTag}`)
    ].join(','))
  }

  return rows.join('\r\n')
}

/**
 * Generates an executable bash script that utilizes the GitHub CLI (`gh issue create`)
 * to spin up issues with labels, milestones, story points, and acceptance verification criteria.
 */
export function generateGitHubIssueScript(pkg: SddArtifactPackage): string {
  const parts: string[] = []

  parts.push('#!/usr/bin/env bash')
  parts.push('# =============================================================================')
  parts.push('# SpecGlow SDD Studio: GitHub Issues Automated Importer')
  parts.push(`# Initiative: ${pkg.title}`)
  parts.push(`# Generated at: ${pkg.createdAt}`)
  parts.push('# =============================================================================')
  parts.push('# PREREQUISITES: Ensure GitHub CLI is installed and authenticated (`gh auth login`).')
  parts.push('')
  parts.push('set -euo pipefail')
  parts.push('')
  parts.push(`echo "🚀 Initializing SpecGlow SDD task import for initiative: ${pkg.title}"`)
  parts.push('')
  parts.push('if ! command -v gh &> /dev/null; then')
  parts.push('  echo "❌ Error: GitHub CLI (\'gh\') is not installed. Please install from https://cli.github.com/"')
  parts.push('  exit 1')
  parts.push('fi')
  parts.push('')
  parts.push('echo "📌 Creating Epic issue..."')

  const epicBody = [
    `## 🏛️ SDD Initiative Epic: ${pkg.title}`,
    `**Domain:** ${pkg.domain} | **Rigor:** ${pkg.targetDepth}`,
    `**Total Story Points:** ${pkg.governance.forecasting.totalStoryPoints} pts`,
    `**Estimated Agent Cycle:** ~${pkg.taskGraph.totalEstimatedAgentMinutes} minutes`,
    '',
    '### System Overview',
    pkg.constitution.systemOverview
  ].join('\\n')

  const domainTag = pkg.domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  parts.push(`gh issue create --title "[EPIC] ${pkg.title.replace(/"/g, '\\"')}" --label "specglow,epic,${domainTag}" --body "${epicBody.replace(/"/g, '\\"')}"`)
  parts.push('echo "✅ Epic created!"')
  parts.push('')
  parts.push('echo "📋 Creating individual atomic tasks..."')
  parts.push('')

  for (const task of pkg.taskGraph.tasks) {
    const layerLabel = task.layer.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const blockedByText = task.blockedBy.length > 0 ? task.blockedBy.join(', ') : 'None'
    const targetFilesText = task.targetFilePaths.join(', ')

    const taskBody = [
      '### 🎯 Task Objective',
      task.description,
      '',
      `**Layer:** ${task.layer}`,
      `**Complexity:** ${task.complexityPoints} Story Points (~${task.estimatedAgentMinutes} mins agent cycle)`,
      `**Blocked By:** ${blockedByText}`,
      `**Target File Paths:** ${targetFilesText}`,
      '',
      '### 🧪 Automated Acceptance Verification',
      '```bash',
      task.acceptanceTestCriteria,
      '```',
      '',
      '> *Automated task generated by SpecGlow SDD Studio.*'
    ].join('\\n')

    parts.push(`echo "-> Creating [${task.id}] ${task.title.replace(/"/g, '\\"')}..."`)
    parts.push(`gh issue create --title "[${task.id}] ${task.title.replace(/"/g, '\\"')}" --label "specglow,${layerLabel},${task.complexityPoints}pts" --body "${taskBody.replace(/"/g, '\\"')}"`)
    parts.push('')
  }

  parts.push('echo ""')
  parts.push(`echo "🎉 Successfully imported all ${pkg.taskGraph.tasks.length} tasks for '${pkg.title}' into GitHub Issues!"`)

  return parts.join('\n')
}
