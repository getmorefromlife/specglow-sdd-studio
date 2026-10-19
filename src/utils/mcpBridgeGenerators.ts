import type { SddArtifactPackage, SpecGlowMcpServerConfig } from '../types'

/**
 * Generates an MCP server configuration object formatted for
 * Cursor IDE, Windsurf, Claude Code, and Claude Desktop.
 */
export function generateSpecGlowMcpConfig(pkg: SddArtifactPackage): string {
  const config: SpecGlowMcpServerConfig = {
    mcpServers: {
      'specglow-sdd': {
        command: 'node',
        args: ['./mcp-server.js'],
        env: {
          SDD_INITIATIVE_TITLE: pkg.title,
          SDD_DOMAIN: pkg.domain,
          SDD_RIGOR_DEPTH: pkg.targetDepth
        }
      }
    }
  }

  return JSON.stringify(config, null, 2)
}

// Backward compatibility alias
export const generateSpecFlowMcpConfig = generateSpecGlowMcpConfig

/**
 * Returns the exact terminal command for Anthropic Claude Code CLI
 * to register the local SDD specification as an active MCP server.
 */
export function generateClaudeMcpCommand(): string {
  return 'claude mcp add specglow node ./mcp-server.js'
}

/**
 * Returns instructions and snippet for Cursor IDE `.cursor/mcp.json`.
 */
export function generateCursorMcpSnippet(pkg: SddArtifactPackage): string {
  return generateSpecGlowMcpConfig(pkg)
}

/**
 * Generates a standalone, zero-external-dependency Node.js MCP Server script (mcp-server.js).
 * Runs natively on Node.js 18+ via `node mcp-server.js`.
 * 
 * Implements JSON-RPC 2.0 over standard I/O (stdio) conforming to the Model Context Protocol (MCP).
 * Exposes 4 tools:
 * 1. get_constitution - Non-negotiable architectural invariants and anti-requirements
 * 2. get_specification - Functional user journeys, state transitions, and API contracts
 * 3. get_tasks - Atomic delivery tasks, story points, and acceptance criteria
 * 4. validate_patch - Validates code diffs or snippets against constitutional invariants
 */
export function generateStandaloneMcpServer(pkg: SddArtifactPackage): string {
  const bakedAntiReqs = JSON.stringify(pkg.constitution.antiRequirements, null, 2)
  const bakedSecurity = JSON.stringify(pkg.constitution.securityInvariants, null, 2)
  const bakedConstraints = JSON.stringify(pkg.constitution.technicalConstraints, null, 2)

  return `#!/usr/bin/env node
/**
 * SpecGlow SDD Studio — Local Model Context Protocol (MCP) Stdio Server
 * Initiative: ${pkg.title.replace(/\*/g, '')}
 * Domain: ${pkg.domain}
 * Depth: ${pkg.targetDepth}
 * Generated: ${pkg.createdAt}
 *
 * ZERO EXTERNAL DEPENDENCIES: Runs natively in Node.js 18+ (CommonJS).
 * Compatible with Claude Code CLI, Cursor IDE, Windsurf, and Claude Desktop.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const process = require('process');

// Protocol version constant
const PROTOCOL_VERSION = '2024-11-05';

// Baked-in specification fallback metadata
const INITIATIVE_METADATA = {
  title: ${JSON.stringify(pkg.title)},
  domain: ${JSON.stringify(pkg.domain)},
  targetDepth: ${JSON.stringify(pkg.targetDepth)},
  antiRequirements: ${bakedAntiReqs},
  securityInvariants: ${bakedSecurity},
  technicalConstraints: ${bakedConstraints}
};

/**
 * Helper to safely read a local markdown file, falling back to a default if absent
 */
function readLocalFile(filename, fallbackText) {
  try {
    const fullPath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
  } catch (err) {
    process.stderr.write('[SpecGlow MCP Warning] Could not read ' + filename + ': ' + err.message + '\\n');
  }
  return fallbackText;
}

/**
 * Tool definitions exposed to the AI model
 */
const TOOLS = [
  {
    name: 'get_constitution',
    description: 'Retrieve non-negotiable architectural invariants, security rules, and forbidden anti-requirements for this project.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional filter: "anti_requirements", "security_invariants", or "constraints"'
        }
      }
    }
  },
  {
    name: 'get_specification',
    description: 'Retrieve functional user journeys, boundary conditions, deterministic state transitions, and API contracts.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: 'Optional section filter: "journeys", "state_transitions", or "api_contracts"'
        }
      }
    }
  },
  {
    name: 'get_tasks',
    description: 'Retrieve atomic sprint delivery tasks with story points, priority, dependencies, and Gherkin acceptance criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        epic: {
          type: 'string',
          description: 'Optional epic filter or keyword'
        }
      }
    }
  },
  {
    name: 'validate_patch',
    description: 'Audit a git diff or code snippet against the project constitution to detect spec violations or forbidden packages.',
    inputSchema: {
      type: 'object',
      properties: {
        patch: {
          type: 'string',
          description: 'The code snippet, diff, or file contents to validate against invariants'
        }
      },
      required: ['patch']
    }
  }
];

/**
 * Handlers for tool execution
 */
function handleToolCall(name, args) {
  if (name === 'get_constitution') {
    const fileContent = readLocalFile('constitution.md', null);
    if (fileContent) {
      return { content: [{ type: 'text', text: fileContent }] };
    }
    // Return structured baked-in constitution
    const text = [
      '# Architectural Constitution: ' + INITIATIVE_METADATA.title,
      'Domain: ' + INITIATIVE_METADATA.domain + ' | Rigor: ' + INITIATIVE_METADATA.targetDepth,
      '',
      '## Anti-Requirements & Forbidden Patterns',
      ...INITIATIVE_METADATA.antiRequirements.map((r) => '- [' + r.id + '] **' + r.item + '**: ' + r.reason),
      '',
      '## Security Invariants',
      ...INITIATIVE_METADATA.securityInvariants.map((s) => '- [' + s.id + '] (' + s.category + ') ' + s.invariant + ' [Enforcement: ' + s.enforcementMechanism + ']'),
      '',
      '## Technical Constraints',
      ...INITIATIVE_METADATA.technicalConstraints.map((c) => '- ' + c.category + ': ' + c.rule + ' (Rationale: ' + c.rationale + ')')
    ].join('\\n');
    return { content: [{ type: 'text', text }] };
  }

  if (name === 'get_specification') {
    const content = readLocalFile('spec.md', 'Specification file (spec.md) not found in current directory. Please run SpecGlow SDD Studio export in the repo root.');
    return { content: [{ type: 'text', text: content }] };
  }

  if (name === 'get_tasks') {
    const content = readLocalFile('tasks.md', 'Tasks file (tasks.md) not found in current directory. Please run SpecGlow SDD Studio export in the repo root.');
    return { content: [{ type: 'text', text: content }] };
  }

  if (name === 'validate_patch') {
    const patch = (args && args.patch) ? String(args.patch).toLowerCase() : '';
    const violations = [];

    // Check anti-requirements keywords
    INITIATIVE_METADATA.antiRequirements.forEach((r) => {
      const words = r.item.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w) => w.length > 5);
      const matched = words.filter((w) => patch.includes(w));
      if (matched.length >= 2) {
        violations.push({
          type: 'Anti-Requirement Conflict',
          id: r.id,
          rule: r.item,
          matchedKeywords: matched
        });
      }
    });

    // Check forbidden constraints
    INITIATIVE_METADATA.technicalConstraints.forEach((c) => {
      if (c.category === 'Forbidden Packages / Patterns') {
        const cleanPkg = c.rule.toLowerCase().trim();
        if (cleanPkg && patch.includes(cleanPkg)) {
          violations.push({
            type: 'Forbidden Package / Pattern Breach',
            category: c.category,
            forbiddenItem: c.rule
          });
        }
      }
    });

    const isPass = violations.length === 0;
    const summary = [
      '### SpecGlow SDD Invariant Audit Report',
      '**Result:** ' + (isPass ? '🟢 PASS (0 Violations)' : '🔴 FAIL (' + violations.length + ' Violations Detected)'),
      '',
      isPass
        ? 'No constitutional anti-requirements or forbidden package signatures were detected in the supplied patch.'
        : '#### Invariant Violations Detected:\\n' + violations.map((v, i) => (i + 1) + '. **[' + v.type + ']** ' + (v.rule || v.forbiddenItem)).join('\\n'),
      '',
      '---',
      '*SpecGlow SDD Governance Engine • Model Context Protocol Bridge*'
    ].join('\\n');

    return { content: [{ type: 'text', text: summary }] };
  }

  throw new Error('Unknown tool: ' + name);
}

/**
 * Handle incoming JSON-RPC 2.0 messages from stdio
 */
function handleMessage(message) {
  if (!message || typeof message !== 'object') return;

  const { id, method, params } = message;

  // Handle Notifications (no response needed)
  if (id === undefined || id === null) {
    if (method === 'notifications/initialized') {
      process.stderr.write('[SpecGlow MCP] Client successfully initialized session.\\n');
    }
    return;
  }

  // Handle standard JSON-RPC requests
  if (method === 'initialize') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'specglow-sdd-server',
          version: '3.0.0'
        }
      }
    });
    return;
  }

  if (method === 'ping') {
    sendResponse({ jsonrpc: '2.0', id, result: {} });
    return;
  }

  if (method === 'tools/list') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        tools: TOOLS
      }
    });
    return;
  }

  if (method === 'tools/call') {
    try {
      const toolName = params && params.name;
      const toolArgs = params && params.arguments;
      const result = handleToolCall(toolName, toolArgs);
      sendResponse({
        jsonrpc: '2.0',
        id,
        result
      });
    } catch (err) {
      sendResponse({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err.message || 'Internal tool execution error'
        }
      });
    }
    return;
  }

  // Method not found
  sendResponse({
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: 'Method not found: ' + method
    }
  });
}

function sendResponse(response) {
  const jsonStr = JSON.stringify(response);
  process.stdout.write(jsonStr + '\\n');
}

/**
 * Main stdio listener loop
 */
function start() {
  process.stderr.write('[SpecGlow MCP] Server started for initiative: ' + INITIATIVE_METADATA.title + '\\n');
  process.stderr.write('[SpecGlow MCP] Listening for JSON-RPC 2.0 requests on stdio...\\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const msg = JSON.parse(trimmed);
      handleMessage(msg);
    } catch (err) {
      process.stderr.write('[SpecGlow MCP Error] Failed to parse JSON-RPC line: ' + err.message + '\\n');
      sendResponse({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error: invalid JSON'
        }
      });
    }
  });

  rl.on('close', () => {
    process.stderr.write('[SpecGlow MCP] stdio stream closed, shutting down.\\n');
    process.exit(0);
  });
}

start();
`
}
