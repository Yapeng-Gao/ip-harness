import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAgents } from '@shared/context/AgentContext'
import { useApp } from '@shared/context/AppContext'
import {
  AGENT_CATALOG,
  AGENT_TIER_LABEL,
  BETA_HONEST_COPY,
  confirmNonCoreTier,
  defaultSessionGoal,
} from '@shared/data/agents'
import { getLastAgentSessionId, resolvePreferredCaseId } from '@shared/utils/lastVisited'
import type { AgentDef } from '@shared/types'
import { AgentTierBadge } from '../components/AgentTierBadge'
import { getStageMeta } from '@shared/data/stages'
import { agentSessionPath } from '../lib/deepLinks'

/** 知产 Agent 任务 chips — 仅 Core 主路径，非 Beta 一键当真闭环 */
const PROMPT_PILLS: { label: string; agentId: string; goal: string }[] = [
  {
    label: '检索现有技术 · 可专利性',
    agentId: 'agent-research',
    goal: '对本案技术方案检索现有技术并输出可专利性结论',
  },
  {
    label: '拆 OA · 起草答复',
    agentId: 'agent-oa',
    goal: '拆解本通审查意见并起草答复与意见陈述',
  },
  {
    label: '立项评估 · 报价',
    agentId: 'agent-intake',
    goal: '完成立项评估并确认报价与 Go/No-Go',
  },
  {
    label: '整理发明交底包',
    agentId: 'agent-disclosure',
    goal: '整理发明交底材料并核对齐套',
  },
  {
    label: '核对年费 · 解锁付款',
    agentId: 'agent-annuity',
    goal: '核对本案年费期限并解锁付款',
  },
  {
    label: '梳理权利要求与期限',
    agentId: 'agent-claims',
    goal: '梳理权利要求保护范围并对照答复期限',
  },
]

/** Home 推荐卡：Core 优先；Assist 可展示；Beta 不入默认可一键闭环 */
const HOME_RECOMMEND_IDS = [
  'agent-research',
  'agent-disclosure',
  'agent-intake',
  'agent-claims',
  'agent-oa',
  'agent-watch',
] as const

const selectCls =
  'focus-ring appearance-none rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-white max-w-[160px] truncate'

export function AgentHome() {
  const { createSession, visibleSessions } = useAgents()
  const { visibleCases } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [goal, setGoal] = useState('')
  const [agentId, setAgentId] = useState<string>('auto')
  const [caseId, setCaseId] = useState('')
  const [pickerTouched, setPickerTouched] = useState(false)

  useEffect(() => {
    if (pickerTouched) return
    const fromUrl = params.get('case')
    const visibleIds = visibleCases.map((c) => c.id)
    const preferred = resolvePreferredCaseId(visibleIds, fromUrl)
    setCaseId(preferred)
  }, [params, visibleCases, pickerTouched])

  const lastSessionId = getLastAgentSessionId()
  const lastSession = lastSessionId
    ? visibleSessions.find((s) => s.id === lastSessionId)
    : undefined

  const needsHumanCount = useMemo(
    () =>
      visibleSessions.filter(
        (s) => !s.archived && (s.status === 'needs_human' || s.hitlPending),
      ).length,
    [visibleSessions],
  )

  const selectedCase = caseId
    ? visibleCases.find((c) => c.id === caseId)
    : undefined

  const recommendCards = useMemo(
    () =>
      HOME_RECOMMEND_IDS.map((id) => AGENT_CATALOG.find((a) => a.id === id)).filter(
        (a): a is AgentDef => !!a,
      ),
    [],
  )

  const selectedAgent =
    agentId !== 'auto' ? AGENT_CATALOG.find((x) => x.id === agentId) : null

  const start = () => {
    const selected = selectedAgent
    if (selected && !confirmNonCoreTier(selected)) return
    const s = createSession({
      goal: goal.trim() || defaultSessionGoal(selected, { hasCase: !!caseId }),
      agentId: agentId as 'auto' | string,
      caseId: caseId || undefined,
      title: goal.trim() ? goal.trim().slice(0, 28) : undefined,
      confirmedNonCoreTier: selected ? true : undefined,
    })
    if (!s) return
    navigate(agentSessionPath(s.id), { state: { focusComposer: true } })
  }

  const startWithAgent = (a: AgentDef, promptGoal: string) => {
    if (!confirmNonCoreTier(a)) return
    setAgentId(a.id)
    setGoal(promptGoal)
    const s = createSession({
      goal: promptGoal || defaultSessionGoal(a, { hasCase: !!caseId }),
      agentId: a.id,
      caseId: caseId || undefined,
      title: promptGoal.slice(0, 28) || `${a.name} · 新任务`,
      confirmedNonCoreTier: true,
    })
    if (!s) return
    navigate(agentSessionPath(s.id), { state: { focusComposer: true } })
  }

  const onPill = (pill: (typeof PROMPT_PILLS)[number]) => {
    const a = AGENT_CATALOG.find((x) => x.id === pill.agentId)
    if (!a) {
      setGoal(pill.goal)
      setAgentId(pill.agentId)
      return
    }
    startWithAgent(a, pill.goal)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      start()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      start()
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl px-6 py-10">
        {/* IP brand line — not a page header block */}
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-wide text-slate-500">
            知产 Agent
          </p>
          <p className="mt-1 text-sm text-slate-700">
            专利检索 · OA · 交底 · 年费 · 写回中台
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Core 主闭环 · Assist 辅办 · Beta 非采购闭环
          </p>
        </div>

        {/* Composer — Agent primary act */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white focus-within:border-slate-400">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={onKeyDown}
            rows={5}
            placeholder="例如：对本案固态电解质配方完成现有技术检索，并对照答复期限输出可专利性结论"
            className="w-full resize-none bg-transparent px-4 pt-4 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="办理目标"
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 pb-3 pt-2">
            <label className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[11px] text-slate-400">关联案件</span>
              <select
                value={caseId}
                onChange={(e) => {
                  setPickerTouched(true)
                  setCaseId(e.target.value)
                }}
                className={selectCls}
                aria-label="关联案件"
              >
                <option value="">{caseId ? '稍后关联' : '可选'}</option>
                {visibleCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[11px] text-slate-400">Agent</span>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className={selectCls}
                aria-label="Agent"
              >
                <option value="auto">自动匹配</option>
                {AGENT_CATALOG.map((a) => (
                  <option key={a.id} value={a.id}>
                    {AGENT_TIER_LABEL[a.tier]} · {a.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedAgent ? (
              <AgentTierBadge tier={selectedAgent.tier} />
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              {caseId ? (
                <span className="hidden text-[10px] text-slate-400 sm:inline" title="确认后写入作业中台">
                  确认后写入作业中台
                </span>
              ) : null}
              <button
                type="button"
                onClick={start}
                className="btn-press focus-ring cta-work rounded-md px-4 py-1.5 text-sm font-medium"
              >
                {selectedAgent?.tier === 'beta' ? '试用' : '发送'}
              </button>
            </div>
          </div>
          {selectedAgent?.tier === 'beta' ? (
            <p className="border-t border-amber-100 bg-amber-50/60 px-3 py-1.5 text-[11px] text-amber-900">
              {BETA_HONEST_COPY}
              {selectedAgent.tierNote
                ? ` · ${selectedAgent.tierNote.replace(/^Beta·非采购闭环[：:]?\s*/, '')}`
                : ''}
              — 不可一键当真闭环
            </p>
          ) : null}
        </div>

        {/* Harness writeback cue */}
        <p className="mt-2 text-center text-[11px] text-slate-400" role="status">
          {caseId && selectedCase
            ? `已关联「${selectedCase.title}」· 确认后写入作业中台`
            : '未关联案件时确认不会写回中台'}
        </p>

        {/* IP task chips — Core only */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {PROMPT_PILLS.map((pill) => {
            const a = AGENT_CATALOG.find((x) => x.id === pill.agentId)
            return (
              <button
                key={pill.agentId}
                type="button"
                onClick={() => onPill(pill)}
                className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              >
                {a ? <AgentTierBadge tier={a.tier} /> : null}
                {pill.label}
              </button>
            )
          })}
        </div>

        {/* Recommended agent cards with tier badges */}
        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[12px] font-semibold text-slate-700">推荐</h2>
            <Link
              to="/agent/agents"
              className="text-[11px] text-slate-400 hover:text-slate-700 hover:underline"
            >
              目录 · 分层
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {recommendCards.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() =>
                    startWithAgent(
                      a,
                      defaultSessionGoal(a, { hasCase: !!caseId }),
                    )
                  }
                  className="btn-press focus-ring flex w-full flex-col items-start rounded-md border border-slate-200 bg-white px-3 py-2 text-left hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-900">{a.name}</span>
                    <AgentTierBadge tier={a.tier} />
                  </div>
                  <span className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                    {getStageMeta(a.stage).shortName} ·{' '}
                    {a.specialty.split('·')[0]?.trim()}
                    {a.tier === 'assist' && a.tierNote
                      ? ` · ${a.tierNote.split('；')[0]}`
                      : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Beta（转化 / 布局）不在默认可一键闭环推荐内 · 见{' '}
            <Link to="/agent/agents?tier=beta" className="hover:underline">
              目录 Beta
            </Link>
          </p>
        </div>

        {/* Thin strip: continue / HITL queue / catalog */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-center text-[11px] text-slate-400">
          {lastSession && (
            <Link
              to={agentSessionPath(lastSession.id)}
              className="hover:text-slate-700 hover:underline"
            >
              继续上次 · {lastSession.title}
            </Link>
          )}
          {needsHumanCount > 0 && (
            <Link
              to="/agent/sessions"
              className="hover:text-slate-700 hover:underline"
            >
              {needsHumanCount} 个会话待确认
            </Link>
          )}
          <Link
            to="/agent/agents"
            className="hover:text-slate-700 hover:underline"
          >
            Agent 目录
          </Link>
        </div>
      </div>
    </div>
  )
}
