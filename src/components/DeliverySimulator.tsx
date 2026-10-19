import React, { useState, useMemo } from 'react'
import {
  TrendingUp,
  Sliders,
  Zap,
  DollarSign,
  RefreshCw,
  Clock,
  ShieldAlert
} from 'lucide-react'
import type { GovernanceRisk } from '../types'

interface DeliverySimulatorProps {
  totalStoryPoints: number
  recommendedSprintCount: number
  totalEstimatedAgentMinutes: number
  taskCount: number
  riskMatrix: GovernanceRisk[]
  confidenceScore: number
}

interface FrontierModelPricing {
  id: string
  name: string
  provider: string
  inputCostPerM: number
  outputCostPerM: number
  badgeColor: string
}

const FRONTIER_MODELS: FrontierModelPricing[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputCostPerM: 3.0,
    outputCostPerM: 15.0,
    badgeColor: 'bg-amber-600 text-white'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputCostPerM: 2.5,
    outputCostPerM: 10.0,
    badgeColor: 'bg-emerald-600 text-white'
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    inputCostPerM: 1.25,
    outputCostPerM: 5.0,
    badgeColor: 'bg-blue-600 text-white'
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 / R1',
    provider: 'DeepSeek',
    inputCostPerM: 0.14,
    outputCostPerM: 0.28,
    badgeColor: 'bg-purple-600 text-white'
  }
]

type VolatilityLevel = 'low' | 'medium' | 'high'

const VOLATILITY_MULTIPLIERS: Record<VolatilityLevel, number> = {
  low: 0.15,
  medium: 0.28,
  high: 0.45
}

function createPseudoRandom(seed: number) {
  let s = (seed + 1) | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const DeliverySimulator: React.FC<DeliverySimulatorProps> = ({
  totalStoryPoints,
  recommendedSprintCount,
  totalEstimatedAgentMinutes,
  taskCount,
  riskMatrix
}) => {
  // Configurable Simulation Parameters
  const initialVelocity = Math.max(10, Math.ceil(totalStoryPoints / Math.max(1, recommendedSprintCount)))
  const [teamVelocity, setTeamVelocity] = useState<number>(initialVelocity)
  const [agentAcceleration, setAgentAcceleration] = useState<number>(1.5)
  const [volatility, setVolatility] = useState<VolatilityLevel>('medium')
  const [sprintWeeks, setSprintWeeks] = useState<number>(2)
  const [simulationSeed, setSimulationSeed] = useState<number>(0)

  // Count high/critical architectural risks
  const criticalRiskCount = useMemo(() => {
    return riskMatrix.filter(r => r.severity === 'Critical' || r.severity === 'High').length
  }, [riskMatrix])

  // 1,000-Trial Monte Carlo Simulation Engine
  const simulationResults = useMemo(() => {
    const prng = createPseudoRandom(simulationSeed * 1000 + 42)
    const trials = 1000
    const sprintOutcomes: number[] = []
    const sigma = VOLATILITY_MULTIPLIERS[volatility]
    // Risk penalty multiplier: each high/critical risk adds potential variance
    const riskPenaltyChance = Math.min(0.7, criticalRiskCount * 0.15)

    for (let i = 0; i < trials; i++) {
      let remainingPoints = totalStoryPoints

      // Possible risk event point inflation
      if (prng() < riskPenaltyChance) {
        // High risk event triggered
        remainingPoints += Math.floor(prng() * (criticalRiskCount * 3) + 2)
      }

      let sprint = 0
      while (remainingPoints > 0 && sprint < 12) {
        sprint++
        // Gaussian approximation using Irwin-Hall
        const randomNorm = (prng() + prng() + prng() + prng() - 2) * 1.5
        const variation = 1 + randomNorm * sigma
        const effectiveVelocity = Math.max(3, teamVelocity * agentAcceleration * variation)
        remainingPoints -= effectiveVelocity
      }
      sprintOutcomes.push(sprint)
    }

    sprintOutcomes.sort((a, b) => a - b)

    const p50 = sprintOutcomes[Math.floor(trials * 0.50)]
    const p85 = sprintOutcomes[Math.floor(trials * 0.85)]
    const p95 = sprintOutcomes[Math.floor(trials * 0.95)]

    // Calculate cumulative probability per sprint milestone (Sprint 1 to 6+)
    const sprintBuckets: { sprint: number; count: number; cumulativePercent: number }[] = []
    const maxSprint = Math.max(5, p95 + 1)

    for (let s = 1; s <= maxSprint; s++) {
      const completedBy = sprintOutcomes.filter(outcome => outcome <= s).length
      sprintBuckets.push({
        sprint: s,
        count: sprintOutcomes.filter(outcome => outcome === s).length,
        cumulativePercent: Math.round((completedBy / trials) * 100)
      })
    }

    return {
      p50,
      p85,
      p95,
      sprintBuckets,
      effectiveVelocityAvg: Math.round(teamVelocity * agentAcceleration)
    }
  }, [totalStoryPoints, teamVelocity, agentAcceleration, volatility, criticalRiskCount, simulationSeed])

  // Multi-Model Frontier Token & Budget Estimator
  const tokenBudgetEstimates = useMemo(() => {
    // Standard heuristics for agentic cycles:
    // ~12,000 prompt tokens per task context
    // ~2,800 completion tokens per code/spec task
    const estimatedCycles = Math.max(taskCount, Math.ceil(totalEstimatedAgentMinutes / 20))
    const totalInputTokens = estimatedCycles * 14000
    const totalOutputTokens = estimatedCycles * 3200

    const modelEstimates = FRONTIER_MODELS.map(m => {
      const inputCost = (totalInputTokens / 1_000_000) * m.inputCostPerM
      const outputCost = (totalOutputTokens / 1_000_000) * m.outputCostPerM
      const totalCost = inputCost + outputCost

      return {
        ...m,
        inputCost,
        outputCost,
        totalCost: Number(totalCost.toFixed(2))
      }
    })

    // Approximate traditional senior software engineer equivalent hours
    const humanDevHours = Math.round(totalStoryPoints * 8)
    const humanDevCost = humanDevHours * 95 // standard $95/hr blended rate

    return {
      totalInputTokens,
      totalOutputTokens,
      estimatedCycles,
      humanDevHours,
      humanDevCost,
      modelEstimates
    }
  }, [totalStoryPoints, totalEstimatedAgentMinutes, taskCount])

  return (
    <div className="space-y-6 pt-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-gradient-to-r from-cyan-50/70 via-blue-50/50 to-indigo-50/60 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-cyan-950 dark:text-cyan-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Interactive Monte Carlo Delivery Simulator & AI Budget Engine</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Simulates 1,000 project delivery iterations combining team story points, agent acceleration multipliers, and risk variance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSimulationSeed(prev => prev + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-zinc-900 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-zinc-800 transition-all self-start md:self-center shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rerun 1,000 Trials</span>
        </button>
      </div>

      {/* Control Sliders & Sensitivity Inputs */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
          <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Delivery Simulation Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Base Team Velocity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Team Base Velocity:</span>
              <span className="font-bold text-cyan-700 dark:text-cyan-400">{teamVelocity} pts/sprint</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={teamVelocity}
              onChange={e => setTeamVelocity(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Human engineer baseline capacity</p>
          </div>

          {/* AI Agent Acceleration Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">AI Agent Multiplier:</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">{agentAcceleration.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={3.5}
              step={0.1}
              value={agentAcceleration}
              onChange={e => setAgentAcceleration(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Autonomous & pair coding speedup</p>
          </div>

          {/* Volatility / Uncertainty */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Requirement Volatility:</span>
              <span className="font-bold uppercase text-amber-700 dark:text-amber-400">{volatility}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {(['low', 'medium', 'high'] as VolatilityLevel[]).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVolatility(v)}
                  className={`py-1 text-[11px] font-bold rounded capitalize border transition-all ${
                    volatility === v
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-400 bg-white dark:bg-zinc-900'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Gaussian deviation spread</p>
          </div>

          {/* Sprint Duration */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Sprint Cadence:</span>
              <span className="font-bold text-slate-900 dark:text-white">{sprintWeeks} Weeks</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[1, 2, 3].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSprintWeeks(w)}
                  className={`py-1 text-[11px] font-bold rounded border transition-all ${
                    sprintWeeks === w
                      ? 'bg-slate-900 dark:bg-zinc-100 border-slate-900 dark:border-zinc-100 text-white dark:text-zinc-900'
                      : 'border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-400 bg-white dark:bg-zinc-900'
                  }`}
                >
                  {w}W
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Calendar time conversion</p>
          </div>
        </div>
      </div>

      {/* Percentile Milestones (P50, P85, P95) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* P50 Median */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              P50 (Median Optimistic)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white">50% Likelihood</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              Sprint {simulationResults.p50}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              (~{simulationResults.p50 * sprintWeeks} calendar weeks)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            50% probability of delivery with uninterrupted flow and average AI acceleration.
          </p>
        </div>

        {/* P85 Agile Commitment (Enterprise SLA) */}
        <div className="p-4 rounded-xl border-2 border-emerald-500/60 dark:border-emerald-600/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 relative shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>P85 (Agile Commitment Target)</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">85% SLA</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">
              Sprint {simulationResults.p85}
            </span>
            <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
              (~{simulationResults.p85 * sprintWeeks} calendar weeks)
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
            Industry gold standard for client contracts and roadmap commitments.
          </p>
        </div>

        {/* P95 Conservative Safe Haven */}
        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
              P95 (Steering Committee Safe)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white">95% Confidence</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              Sprint {simulationResults.p95}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              (~{simulationResults.p95 * sprintWeeks} calendar weeks)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Buffer accounts for critical architectural risk events and severe blocker delays.
          </p>
        </div>
      </div>

      {/* Probability S-Curve Visualization */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Cumulative Delivery Likelihood S-Curve (1,000 Iterations)
          </h4>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
            Combined Effective Velocity: ~{simulationResults.effectiveVelocityAvg} pts/sprint
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          {simulationResults.sprintBuckets.map(b => (
            <div key={b.sprint} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-800 dark:text-zinc-200">
                <span className="font-bold flex items-center gap-1.5">
                  <span>Sprint {b.sprint}</span>
                  <span className="text-[10px] font-normal text-slate-500 dark:text-zinc-400">
                    ({b.sprint * sprintWeeks} Weeks)
                  </span>
                  {b.sprint === simulationResults.p85 && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Target SLA
                    </span>
                  )}
                </span>
                <span className="font-extrabold">{b.cumulativePercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800/80 h-3 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    b.cumulativePercent >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : b.cumulativePercent >= 50
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, b.cumulativePercent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Model Frontier Token & Budget Calculator */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>AI Frontier Model Execution Budget & Token Estimator</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Predicted LLM inference spend to execute all {taskCount} tasks via autonomous coding agents.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
              In: {(tokenBudgetEstimates.totalInputTokens / 1_000_000).toFixed(2)}M tokens
            </span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
              Out: {(tokenBudgetEstimates.totalOutputTokens / 1_000_000).toFixed(2)}M tokens
            </span>
          </div>
        </div>

        {/* Pricing Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tokenBudgetEstimates.modelEstimates.map(model => (
            <div
              key={model.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{model.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${model.badgeColor}`}>
                    {model.provider}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  ${model.totalCost.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  ${model.inputCostPerM.toFixed(2)} / ${model.outputCostPerM.toFixed(2)} per 1M tok
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between">
                <span>Savings vs Dev:</span>
                <span>{Math.round(((tokenBudgetEstimates.humanDevCost - model.totalCost) / tokenBudgetEstimates.humanDevCost) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* ROI / Comparative Analysis Banner */}
        <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-800 dark:text-zinc-200">
              Equivalent Human Engineering Effort: <strong>{tokenBudgetEstimates.humanDevHours} hrs</strong> (~${tokenBudgetEstimates.humanDevCost.toLocaleString()} at $95/hr standard rate)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {criticalRiskCount > 0 && (
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{criticalRiskCount} High Risk Invariants Factored</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
