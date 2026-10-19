import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from '../context/ThemeContext'
import { Copy, Check, Download, AlertTriangle, Code, Eye, RefreshCw } from 'lucide-react'
import type { ArchitectureDiagrams } from '../types'

interface MermaidViewerProps {
  diagrams: ArchitectureDiagrams
  initiativeTitle: string
}

type DiagramKey = 'systemContextC4' | 'sequenceDiagram' | 'entityRelationshipDiagram'

interface DiagramMeta {
  key: DiagramKey
  title: string
  subtitle: string
  badge: string
}

const DIAGRAM_CONFIGS: DiagramMeta[] = [
  {
    key: 'systemContextC4',
    title: 'C4 System Context Architecture',
    subtitle: 'Actors, boundary topologies, external APIs, and persistent storage tiers',
    badge: 'C4 Context'
  },
  {
    key: 'sequenceDiagram',
    title: 'End-to-End Sequence Flow',
    subtitle: 'Deterministic event sequencing, authorization gates, and failure handling',
    badge: 'Sequence'
  },
  {
    key: 'entityRelationshipDiagram',
    title: 'Data Model & State Lifecycle',
    subtitle: 'Database entities, cardinality, foreign keys, and state transition graph',
    badge: 'ERD / States'
  }
]

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ diagrams, initiativeTitle }) => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<DiagramKey>('systemContextC4')
  const [svgContent, setSvgContent] = useState<string>('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [isRawView, setIsRawView] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [isRendering, setIsRendering] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeDiagramCode = diagrams[activeTab] || ''

  useEffect(() => {
    let isMounted = true

    const renderDiagram = async () => {
      if (!activeDiagramCode || activeDiagramCode.trim() === '') {
        setSvgContent('')
        setRenderError('No diagram definition available for this view.')
        return
      }

      setIsRendering(true)
      setRenderError(null)

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          themeVariables: theme === 'dark' ? {
            primaryColor: '#0891b2',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#0e7490',
            lineColor: '#38bdf8',
            secondaryColor: '#4f46e5',
            tertiaryColor: '#18181b',
            background: '#18181b',
            mainBkg: '#18181b',
            nodeBorder: '#38bdf8',
            textColor: '#f1f5f9'
          } : {
            primaryColor: '#0284c7',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#0369a1',
            lineColor: '#0284c7',
            secondaryColor: '#6366f1',
            tertiaryColor: '#f8fafc',
            background: '#ffffff',
            mainBkg: '#f8fafc',
            nodeBorder: '#0284c7',
            textColor: '#0f172a'
          }
        })

        const uniqueId = `mermaid-render-${Date.now()}-${Math.random().toString(36).substring(7)}`
        const { svg } = await mermaid.render(uniqueId, activeDiagramCode)

        if (isMounted) {
          setSvgContent(svg)
          setRenderError(null)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error('Mermaid render error:', err)
          setRenderError(errMsg)
          setSvgContent('')
        }
      } finally {
        if (isMounted) {
          setIsRendering(false)
        }
      }
    }

    renderDiagram()

    return () => {
      isMounted = false
    }
  }, [activeDiagramCode, theme, activeTab])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeDiagramCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadSvg = () => {
    if (!svgContent) return
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const safeTitle = initiativeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    a.href = url
    a.download = `${safeTitle}-${activeTab}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentConfig = DIAGRAM_CONFIGS.find(c => c.key === activeTab) || DIAGRAM_CONFIGS[0]

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header with Diagram Sub-Tabs */}
      <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                Visual Architecture
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentConfig.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {currentConfig.subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsRawView(!isRawView)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-all"
              title="Toggle between rendered diagram and raw Mermaid source"
            >
              {isRawView ? <Eye className="w-3.5 h-3.5 text-cyan-500" /> : <Code className="w-3.5 h-3.5 text-cyan-500" />}
              <span>{isRawView ? 'View Render' : 'View Code'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-all"
              title="Copy diagram source code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            {svgContent && !renderError && (
              <button
                onClick={handleDownloadSvg}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-cyan-300 dark:border-cyan-800 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 transition-all shadow-xs"
                title="Download scalable SVG diagram"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SVG</span>
              </button>
            )}
          </div>
        </div>

        {/* Diagram Switcher Pills */}
        <div className="flex flex-wrap gap-2">
          {DIAGRAM_CONFIGS.map(cfg => {
            const isActive = activeTab === cfg.key
            return (
              <button
                key={cfg.key}
                onClick={() => {
                  setActiveTab(cfg.key)
                  setIsRawView(false)
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-cyan-500'}`} />
                {cfg.badge}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Diagram Canvas or Code View */}
      <div className="p-6 overflow-x-auto min-h-[420px] flex items-center justify-center bg-slate-50/30 dark:bg-zinc-950/30">
        {isRendering ? (
          <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-zinc-500 py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
            <span className="text-xs font-semibold">Synthesizing vector architecture...</span>
          </div>
        ) : isRawView ? (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase">
                Mermaid.js Source Code
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 dark:bg-black font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner max-h-[500px]">
              <code>{activeDiagramCode}</code>
            </pre>
          </div>
        ) : renderError ? (
          <div className="max-w-xl w-full p-5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Diagram Rendering Notice</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              The synthesized diagram syntax could not be rendered as SVG. You can view, copy, or edit the raw Mermaid source code below:
            </p>
            <pre className="p-3 rounded-lg bg-black/80 text-amber-200 font-mono text-xs overflow-x-auto border border-amber-500/30 max-h-60">
              <code>{activeDiagramCode}</code>
            </pre>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Raw Mermaid Code</span>
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:drop-shadow-xs"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2.5 bg-slate-100/60 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
        <span>Rendered 100% client-side via Mermaid.js vector engine</span>
        <span>Theme: {theme === 'dark' ? 'Night Zinc' : 'Day Slate'}</span>
      </div>
    </div>
  )
}
