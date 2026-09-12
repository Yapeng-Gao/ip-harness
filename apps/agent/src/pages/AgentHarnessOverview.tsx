import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FolderOpen, MessageSquare, Plus } from 'lucide-react'
import {
  AGENT_CATALOG,
  BETA_HONEST_COPY,
  HITL_GATE_LABELS,
  RUN_STATUS_LABEL,
  confirmNonCoreTier,
  defaultSessionGoal,
  getAgent,
} from '@shared/data/agents'
import { AgentTierBadge } from '../components/AgentTierBadge'
import { getStageMeta } from '@shared/data/stages'
import { PageHeader } from '@shared/components/PageHeader'
import { useAgents } from '@shared/context/AgentContext'
import { useApp } from '@shared/context/AppContext'
import { resolvePreferredCaseId } from '@shared/utils/lastVisited'
import type { StageId } from '@shared/types'
import { agentSessionPath } from '../lib/deepLinks'

const STATUS_LABEL: Record<string, string> = {
  active: '可用',
  beta: '试用',
  deprecated: '停用',
}

/** Architecture demoted — collapsed details only */
const HARNESS_CORE = [
  { id: 'session', label: '会话', desc: '对话 + 案件/目标绑定' },
  { id: 'orchestrator', label: '编排', desc: '编排思考 / 工具 / 确认' },
  { id: 'tools', label: '工具', desc: '可插拔办理工具（见目录详情）' },
  { id: 'hitl', label: '请你确认', desc: '按 Agent 差异化确认步骤' },
  { id: 'command', label: '业务写入', desc: '与中台共用命令入口，确认后写回' },
]

export function AgentHarnessOverview() {
  const { createSession, visibleSessions } = useAgents()
  const { visibleCases } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [caseId, setCaseId] = useState('')
  const [pickerTouched, setPickerTouched] = useState(false)

  useEffect(() => {
    const url = params.get('case')
    if (url && visibleCases.some((c) => c.id === url)) {
      setCaseId(url)
    }
  }, [params, visibleCases])

  const visibleIds = visibleCases.map((c) => c.id)
  const visibleMeta = visibleCases.map((c) => ({ id: c.id, stage: c.stage }))
  const explicitCase =
    params.get('case') || (pickerTouched ? caseId : null)
  const preferredFor = (stage?: StageId) =>
    resolvePreferredCaseId(visibleIds, explicitCase, {
      stage,
      visible: visibleMeta,
    })

  const newSession = () => {
    const chosen = preferredFor()
    const s = createSession({
      goal: '',
      agentId: 'auto',
      title: '新 IP 任务会话',
      caseId: chosen || undefined,
    })
    if (!s) return
    navigate(agentSessionPath(s.id), { state: { focusComposer: true } })
  }

  const startWith = (agentId: string) => {
    const a = getAgent(agentId)
    const chosen = preferredFor(a?.stage)
    const chosenCase = visibleCases.find((c) => c.id === chosen)
    // Fix W · 阶段错配二次确认，不只 amber
    if (a && chosenCase && chosenCase.stage !== a.stage) {
      if (
        !window.confirm(
          `案阶段与 Agent 不匹配（案·${getStageMeta(chosenCase.stage).shortName} / Agent·${getStageMeta(a.stage).shortName}），仍要继续？`,
        )
      ) {
        return
      }
    }
    if (a && !confirmNonCoreTier(a)) return
    const s = createSession({
      goal: defaultSessionGoal(a, { hasCase: !!chosen }),
      agentId,
      caseId: chosen || undefined,
      title: a
        ? `${a.name} · ${a.specialty?.split('·')[0]?.trim() || '新任务'}`
        : '新任务',
      confirmedNonCoreTier: true,
    })
    if (!s) return
    navigate(agentSessionPath(s.id), { state: { focusComposer: true } })
  }

  const recent = [...visibleSessions]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
      <PageHeader
        title="运行时"
        context={
          caseId
            ? '选 Agent 建会话 · 将带上所选案件，确认后写回中台。平台分层：Core 主闭环 / Assist 辅办 / Beta 非采购闭环。'
            : '选 Agent 建会话 · 未选案则稍后关联。平台分层纪律：勿把 Assist/Beta 卖成 Core。'
        }
        primary={{
          label: '启动',
          onClick: newSession,
          icon: <Plus className="h-4 w-4" aria-hidden />,
        }}
        secondary={{
          label: 'Agent',
          to: '/agent/agents',
        }}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={caseId}
          onChange={(e) => {
            setPickerTouched(true)
            setCaseId(e.target.value)
          }}
          className="ui-input ui-input-sm focus-ring max-w-[240px] truncate"
          aria-label="覆盖关联案件，空则按 Agent 阶段优选"
        >
          <option value="">自动（按 Agent 阶段）</option>
          {visibleCases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} · {getStageMeta(c.stage).shortName}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-slate-400">
          {caseId
            ? '已覆盖：所有 Agent 将带上所选案件'
            : '未覆盖 · 启动按该 Agent 阶段优选最近案'}
        </span>
      </div>

      {/* Dense CTA row — Catalog density language */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={newSession}
          className="btn-press focus-ring cta-work inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          启动
        </button>
        <Link
          to="/agent/agents"
          className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FolderOpen className="h-3.5 w-3.5" aria-hidden />
          Agent
        </Link>
        <Link
          to="/agent/sessions"
          className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          最近会话
        </Link>
      </div>

      <div className="mb-6 max-w-4xl">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold text-slate-900">Agent</h2>
          <Link
            to="/agent/agents"
            className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
          >
            全部 Agent
          </Link>
        </div>

        <ul className="agent-harness-list">
          {AGENT_CATALOG.map((a) => {
            const stage = getStageMeta(a.stage)
            return (
              <li key={a.id} className="agent-harness-row" data-tier={a.tier}>
                <button
                  type="button"
                  onClick={() => startWith(a.id)}
                  className="btn-press focus-ring min-w-0 flex-1 rounded-md text-left"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="truncate text-sm font-semibold tracking-tight text-slate-900">
                      {a.name}
                    </div>
                    <AgentTierBadge tier={a.tier} />
                  </div>
                  <div className="mt-0.5 truncate text-[11px] leading-snug text-slate-500">
                    {stage.shortName} · {STATUS_LABEL[a.status] ?? a.status}
                    {a.hitlGates.length > 0
                      ? ` · ${a.hitlGates.map((g) => HITL_GATE_LABELS[g]).join(' / ')}`
                      : ''}
                    {a.tier === 'beta' ? ` · ${BETA_HONEST_COPY}` : ''}
                    {a.tier === 'assist' && a.tierNote ? ` · ${a.tierNote}` : ''}
                  </div>
                </button>
                {(() => {
                  const chosenId = preferredFor(a.stage)
                  const chosen = visibleCases.find((c) => c.id === chosenId)
                  const mismatch = !!chosen && chosen.stage !== a.stage
                  return (
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <button
                        type="button"
                        onClick={() => startWith(a.id)}
                        className={
                          a.tier === 'beta'
                            ? 'ui-btn ui-btn-sm btn-press focus-ring border border-amber-300 bg-amber-50 text-amber-950'
                            : 'ui-btn ui-btn-sm ui-btn-primary btn-press focus-ring'
                        }
                      >
                        {a.tier === 'beta'
                          ? '试用 · 非闭环'
                          : chosen
                            ? '启动'
                            : '启动 · 稍后关联'}
                      </button>
                      {chosen ? (
                        <span
                          className={`max-w-[140px] text-right text-[10px] leading-tight ${
                            mismatch ? 'text-amber-800' : 'text-slate-400'
                          }`}
                        >
                          {getStageMeta(chosen.stage).shortName}
                          {mismatch ? ' · 可能错配' : ''}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">稍后关联</span>
                      )}
                    </div>
                  )
                })()}
              </li>
            )
          })}
        </ul>
      </div>

      {recent.length > 0 && (
        <div className="mb-6 max-w-4xl">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold text-slate-900">最近会话</h2>
            <Link
              to="/agent/sessions"
              className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
            >
              全部
            </Link>
          </div>
          <ul className="agent-harness-list">
            {recent.map((s) => (
              <li key={s.id}>
                <Link
                  to={agentSessionPath(s.id)}
                  className="agent-harness-row block no-underline"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-800">
                        {s.title}
                      </div>
                      <div className="truncate text-xs text-slate-400">{s.goal}</div>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {RUN_STATUS_LABEL[s.status]}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="max-w-4xl border-t border-slate-100 pt-3">
        <summary className="focus-ring cursor-pointer text-xs text-slate-400 hover:text-slate-600">
          运行时构成（可选）
        </summary>
        <ul className="mt-2 divide-y divide-slate-100 border-y border-slate-200">
          {HARNESS_CORE.map((c) => (
            <li key={c.id} className="flex gap-4 py-1.5 text-xs">
              <span className="w-16 shrink-0 font-medium text-slate-700">{c.label}</span>
              <span className="text-slate-500">{c.desc}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
