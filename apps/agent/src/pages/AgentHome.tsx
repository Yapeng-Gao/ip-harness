import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAgents } from '@shared/context/AgentContext'
import {
  AGENT_CATALOG,
  confirmNonCoreTier,
  defaultSessionGoal,
} from '@shared/data/agents'
import { getLastAgentSessionId } from '@shared/utils/lastVisited'
import type { AgentDef } from '@shared/types'
import { agentSessionPath } from '../lib/deepLinks'
import { freeBotPath } from '../projects/generalBots'
import { useGeneralBots } from '../projects/GeneralBotsContext'

/**
 * Legacy / compat Composer — demoted secondary entry at /agent/compose.
 * Default landing is AgentL1Shell (L1 single assistant). Spec agent-layers.
 */
export function AgentHome() {
  const { createSession, visibleSessions } = useAgents()
  const navigate = useNavigate()
  const [createToast, setCreateToast] = useState<string | null>(null)
  const createToastTimer = useRef<number | null>(null)

  const showCreateFailedToast = () => {
    setCreateToast('当前角色不能新建会话，请切换为企业 IP / 代理所')
    if (createToastTimer.current) window.clearTimeout(createToastTimer.current)
    createToastTimer.current = window.setTimeout(() => setCreateToast(null), 4500)
  }

  const lastSessionId = getLastAgentSessionId()
  const lastSession = lastSessionId
    ? visibleSessions.find((s) => s.id === lastSessionId)
    : undefined

    const { activeBots } = useGeneralBots()
  const botLinks = activeBots.map((b) => ({
    id: b.id,
    name: b.name,
    specialty: b.systemBrief.slice(0, 40),
  }))
  const startResearchCompat = () => {
    const research = AGENT_CATALOG.find((a) => a.id === 'agent-research')
    if (!research || !confirmNonCoreTier(research)) return
    const s = createSession({
      goal: defaultSessionGoal(research, { hasCase: false }),
      agentId: 'agent-research',
      title: '检索现有技术 · 新办理',
      confirmedNonCoreTier: true,
    })
    if (!s) {
      showCreateFailedToast()
      return
    }
    navigate(agentSessionPath(s.id), {
      state: { focusComposer: true, focusCaseBind: true },
    })
  }

  const startWithAgent = (a: AgentDef) => {
    if (!confirmNonCoreTier(a)) return
    const s = createSession({
      goal: defaultSessionGoal(a, { hasCase: false }),
      agentId: a.id,
      title: `${a.name} · 新任务`,
      confirmedNonCoreTier: true,
    })
    if (!s) {
      showCreateFailedToast()
      return
    }
    navigate(agentSessionPath(s.id), {
      state: { focusComposer: true, focusCaseBind: true },
    })
  }

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto">
      <div className="w-full max-w-lg px-6 py-10" data-testid="agent-compose-compat">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            次级 / 兼容入口
          </p>
          <h1 className="mt-1 text-balance text-[20px] font-semibold tracking-tight text-slate-900">
            旧 Composer · 不作为默认主心智
          </h1>
          <p className="mt-1.5 text-pretty text-sm text-slate-600">
            干活请回{' '}
            <Link
              to="/agent"
              className="font-medium text-slate-800 underline-offset-2 hover:underline"
              data-testid="compose-back-to-l1"
            >
              L1 单助手
            </Link>
            ；需要多 bot 再进{' '}
            <Link
              to="/agent/team"
              className="font-medium text-slate-800 underline-offset-2 hover:underline"
              data-testid="compose-back-to-team"
            >
              团队模式
            </Link>
            。
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-800">选自由 bot 开聊</div>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {botLinks.map((b) => (
              <li key={b.id}>
                <Link
                  to={freeBotPath(b.id)}
                  className="focus-ring flex w-full flex-col rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 text-left hover:border-slate-300 hover:bg-white"
                  data-testid={`compose-pick-bot-${b.id}`}
                >
                  <span className="text-xs font-medium text-slate-800">{b.name}</span>
                  <span className="mt-0.5 truncate text-[11px] text-slate-500">
                    {b.specialty}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
          <Link to="/agent/sessions" className="hover:text-slate-700 hover:underline">
            打开通用历史
          </Link>
          <Link to="/agent/projects" className="hover:text-slate-700 hover:underline">
            项目模式
          </Link>
          <Link to="/agent/agents" className="hover:text-slate-700 hover:underline">
            Catalog · 管理
          </Link>
          {lastSession && (
            <Link
              to={agentSessionPath(lastSession.id)}
              className="hover:text-slate-700 hover:underline"
            >
              继续上次 · {lastSession.title}
            </Link>
          )}
        </div>

        <details className="group mt-6" data-testid="compose-legacy-fold">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-[12px] text-slate-500 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
            <span className="font-medium text-slate-600">兼容 · Catalog 单聊</span>
            <span className="text-slate-400">（非默认）</span>
            <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </summary>
          <div className="mt-2 space-y-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3">
            <p className="text-[11px] text-slate-500">
              保留旧「Catalog 下拉单 Composer」路径；P0 默认仍进 research，勿默认 OA。
            </p>
            <button
              type="button"
              onClick={startResearchCompat}
              data-testid="home-send"
              className="btn-press focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              开一通检索单聊（兼容）
            </button>
            <div className="flex flex-wrap gap-1.5">
              {(['agent-research', 'agent-disclosure', 'agent-claims'] as const).map(
                (id) => {
                  const a = AGENT_CATALOG.find((x) => x.id === id)
                  if (!a) return null
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => startWithAgent(a)}
                      className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                    >
                      {a.name}
                    </button>
                  )
                },
              )}
            </div>
          </div>
        </details>
      </div>

      {createToast && (
        <div className="toast-enter pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm">
          <div role="status" className="ui-toast ui-toast-info">
            {createToast}
          </div>
        </div>
      )}
    </div>
  )
}
