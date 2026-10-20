import React from 'react'
import { ShieldCheck, Globe, Cpu, BarChart3, Sparkles } from 'lucide-react'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl p-8 sm:p-12 text-center transition-colors duration-300 shadow-sm dark:shadow-2xl">
      {/* 1. Subtle Tech Grid Pattern with Radial Vignette Mask */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15 transition-opacity"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)'
        }}
      />

      {/* 2. Dual-Theme Ambient Glow Aura Physics behind Title */}
      <div className="relative inline-block mx-auto">
        {/* Night Mode Glow Aura (Pulsating Cyan-Teal-Indigo Aurora) */}
        <div 
          className="hidden dark:block absolute -inset-x-20 -top-10 -bottom-10 bg-gradient-to-r from-cyan-500/25 via-teal-500/20 to-indigo-500/25 blur-3xl opacity-60 animate-pulse pointer-events-none rounded-full" 
          aria-hidden="true"
        />
        
        {/* Day Mode Glow Aura (Soft Refractive Bloom) */}
        <div 
          className="block dark:hidden absolute -inset-x-16 -top-8 -bottom-8 bg-gradient-to-r from-cyan-200/60 via-indigo-100/50 to-teal-100/60 blur-2xl opacity-80 pointer-events-none rounded-full" 
          aria-hidden="true"
        />

        {/* Enterprise Release Pill Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 mb-4 shadow-xs backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            v3.0 Enterprise Release • Governed Agentic Delivery Engine
          </span>
        </div>

        {/* 3. Hero Main Title with Dual-Theme Iridescent Text Gradient */}
        <h1 className="relative z-10 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight sm:leading-none">
          <span className="block text-slate-900 dark:text-zinc-100 mb-1">
            Build Software with
          </span>
          <span className="relative inline-block">
            {/* Dark Mode Gradient */}
            <span className="hidden dark:inline bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.45)]">
              SpecGlow
            </span>
            {/* Light Mode Jewel-Toned Gradient */}
            <span className="inline dark:hidden bg-gradient-to-r from-indigo-700 via-cyan-800 to-teal-700 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(14,165,233,0.3)]">
              SpecGlow
            </span>
            <span className="text-slate-900 dark:text-white font-extrabold ml-2">
              SDD Studio
            </span>
          </span>
        </h1>
      </div>

      {/* Subtitle Description */}
      <p className="relative z-10 max-w-3xl mx-auto mt-4 text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
        Transform feature briefs into a deterministic, audit-ready <strong className="text-slate-900 dark:text-zinc-200 font-semibold">4-Pillar Spec-Driven Delivery Suite</strong>. Enforce non-negotiable architectural constitutions, STRIDE threat models, and executable test contracts for autonomous AI coding agents.
      </p>

      {/* 4. Enterprise Trust & Architectural Metric Chips */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 pt-6 border-t border-slate-200/60 dark:border-zinc-800/60">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/90 dark:bg-zinc-900/80 border border-slate-300/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 shadow-xs hover:border-emerald-500/50 transition-colors">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% In-Memory (Zero Telemetry)</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/90 dark:bg-zinc-900/80 border border-slate-300/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 shadow-xs hover:border-cyan-500/50 transition-colors">
          <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>6-Region Legal Compliance</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/90 dark:bg-zinc-900/80 border border-slate-300/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 shadow-xs hover:border-indigo-500/50 transition-colors">
          <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Node 18+ stdio MCP Server</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/90 dark:bg-zinc-900/80 border border-slate-300/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 shadow-xs hover:border-purple-500/50 transition-colors">
          <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>1,000-Trial Monte Carlo</span>
        </div>
      </div>
    </section>
  )
}
