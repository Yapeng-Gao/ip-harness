import { Outlet, useLocation } from 'react-router-dom'
import {
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '@shared/context/AppContext'
import { useAgents } from '@shared/context/AgentContext'
import { getAgent, suggestAgent } from '@shared/data/agents'
import { ProductSwitcher } from '@shared/components/ProductSwitcher'
import { AgentWorkspaceMenu } from './AgentWorkspaceMenu'
import { PersonaSwitcher } from '@shared/components/PersonaSwitcher'
import { agentDisplayLabel } from '@shared/hooks/useAgentDisplayLabel'
import { AgentSessionSidebar } from './AgentSessionSidebar'
import { AgentBillingHoldBanner } from './AgentBillingHoldBanner'
import { PersonaRouteGate } from '@shared/components/PersonaRouteGate'

export function AgentShell() {
  const { workspace, getCase, getHandoff } = useApp()
  const { getSession } = useAgents()
  const loc = useLocation()
  const [rightOpen, setRightOpen] = useState(false)

  const sessionIdMatch = loc.pathname.match(/^\/agent\/sessions\/([^/]+)/)
  const activeSession = sessionIdMatch ? getSession(sessionIdMatch[1]) : undefined

  const topbarAgentLabel = useMemo(() => {
    if (!activeSession) return '自动匹配'
    if (activeSession.agentId !== 'auto') {
      return agentDisplayLabel(activeSession.agentId)
    }
    const c = activeSession.caseId ? getCase(activeSession.caseId) : undefined
    const stageAgentId = c
      ? (
          {
            pre_research: 'agent-research',
            decision: 'agent-intake',
            drafting: 'agent-claims',
            prosecution: 'agent-oa',
            maintenance: 'agent-annuity',
            commercialization: 'agent-monetize',
            monitoring: 'agent-watch',
          } as Record<string, string>
        )[c.stage]
      : undefined
    const handoffStatus =
      activeSession.caseId && stageAgentId
        ? getHandoff(
            activeSession.caseId,
            getAgent(stageAgentId)?.handoffKey ?? 'research_report',
          )
        : undefined
    const suggested = suggestAgent({
      stage: c?.stage,
      goal: activeSession.goal,
      workspaceKind: workspace.kind,
      handoffStatus,
    })
    return agentDisplayLabel('auto', suggested?.agent.name)
  }, [
    activeSession?.id,
    activeSession?.agentId,
    activeSession?.goal,
    activeSession?.caseId,
    workspace.kind,
    getCase,
    getHandoff,
  ])

  const inSession = loc.pathname.startsWith('/agent/sessions/')

  return (
    <div className="app-shell-bg flex h-full min-h-screen flex-col">
      <a href="#agent-main" className="skip-link">
        跳到主要内容
      </a>

      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur lg:px-4">
        <div className="flex items-center gap-2">
          <div className="shell-brand-mark flex h-7 w-7 items-center justify-center text-[10px] font-semibold">
            IP
          </div>
          <div className="text-sm font-semibold tracking-tight text-slate-900">知产 Agent</div>
        </div>

        <div className="mx-1 hidden h-4 w-px bg-slate-200 sm:block" />

        <AgentWorkspaceMenu variant="topbar" />
        <PersonaSwitcher variant="topbar" />

        {inSession && (
          <div
            className="hidden items-center gap-1.5 truncate text-xs text-slate-500 sm:flex"
            title="在会话底部更换 Agent"
          >
            <span className="text-slate-300">·</span>
            <span className="max-w-[180px] truncate" aria-label="当前 Agent">
              {topbarAgentLabel}
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ProductSwitcher current="agent" size="md" className="hidden sm:grid" />
          {inSession && (
            <button
              type="button"
              onClick={() => setRightOpen((v) => !v)}
              className="btn-press focus-ring hit-40 hidden items-center justify-center rounded-[var(--radius-sm)] border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 lg:inline-flex"
              aria-label={rightOpen ? '折叠上下文' : '展开上下文'}
            >
              {rightOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </header>

      <AgentBillingHoldBanner
        compact
        className="mx-3 mt-2 shrink-0 lg:mx-4"
      />

      <div className="flex min-h-0 flex-1">
        <AgentSessionSidebar />

        <main
          id="agent-main"
          tabIndex={-1}
          className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-50 outline-none"
          data-right-open={rightOpen ? '1' : '0'}
        >
          <PersonaRouteGate>
            <Outlet context={{ rightOpen, setRightOpen }} />
          </PersonaRouteGate>
        </main>
      </div>
    </div>
  )
}
