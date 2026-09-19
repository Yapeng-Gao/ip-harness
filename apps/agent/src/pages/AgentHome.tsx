import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
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
import { getLastAgentSessionId } from '@shared/utils/lastVisited'
import type { AgentDef } from '@shared/types'
import { AgentTierBadge } from '../components/AgentTierBadge'
import { getStageMeta } from '@shared/data/stages'
import { agentSessionPath } from '../lib/deepLinks'
import { CaseBindControls } from '../components/case/CaseBindControls'

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
  const [createToast, setCreateToast] = useState<string | null>(null)
  const createToastTimer = useRef<number | null>(null)

  const showCreateFailedToast = () => {
    setCreateToast('当前 Persona 不能新建会话，请切换为企业 IP / 代理所')
    if (createToastTimer.current) window.clearTimeout(createToastTimer.current)
    createToastTimer.current = window.setTimeout(() => setCreateToast(null), 4500)
  }

  // agent-case-binding: default empty — no resolvePreferredCaseId auto-fill
  useEffect(() => {
    if (pickerTouched) return
    const fromUrl = params.get('case')
    if (fromUrl && visibleCases.some((c) => c.id === fromUrl)) {
      setCaseId(fromUrl)
    }
  }, [params, visibleCases, pickerTouched])

  const lastSessionId = getLastAgentSessionId()
  const lastSession = lastSessionId
    ? visibleSessions.find((s) => s.id === lastSessionId)
    : undefined

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
    if (!s) {
      showCreateFailedToast()
      return
    }
    navigate(agentSessionPath(s.id), {
      state: {
        focusComposer: true,
        focusCaseBind: !caseId,
      },
    })
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
    if (!s) {
      showCreateFailedToast()
      return
    }
    navigate(agentSessionPath(s.id), {
      state: {
        focusComposer: true,
        focusCaseBind: !caseId,
      },
    })
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
          <h1 className="text-balance text-[22px] font-semibold tracking-tight text-slate-900">
            知产 Agent
          </h1>
          <p className="mt-1.5 text-pretty text-sm text-slate-600">
            专利检索 · OA · 交底 · 年费 · 确认后写入案件
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Core 主闭环 · Assist 辅办 · Beta 非采购闭环
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            默认通用单聊 ·{' '}
            <Link
              to="/agent/projects"
              className="text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
            >
              项目模式
            </Link>
            （次级 · general / domain）
          </p>
        </div>

        {/* Composer — Agent primary act */}
        <div className="mt-6 rounded-[var(--radius-xl)] border border-slate-200/90 bg-white shadow-[var(--shadow-rest)] focus-within:border-[var(--color-accent)] focus-within:shadow-[var(--shadow-elevated)]">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={onKeyDown}
            rows={5}
            placeholder="例如：对本案固态电解质配方完成现有技术检索，并对照答复期限输出可专利性结论"
            className="focus-ring w-full resize-none bg-transparent px-4 pt-4 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:rounded-[var(--radius-md)]"
            aria-label="办理目标"
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 pb-3 pt-2">
            <label className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[11px] text-slate-400">关联案件（可选）</span>
              <select
                value={caseId}
                onChange={(e) => {
                  setPickerTouched(true)
                  setCaseId(e.target.value)
                }}
                className={selectCls}
                aria-label="关联案件"
              >
                <option value="">可稍后创建或绑定案件</option>
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
                <span className="hidden text-[10px] text-slate-400 sm:inline" title="确认后写入案件">
                  确认后写入案件
                </span>
              ) : null}
              <button
                type="button"
                onClick={start}
                data-testid="home-send"
                className="btn-press focus-ring cta-work rounded-md px-4 py-1.5 text-sm font-medium"
                data-primary-cta="home-start"
              >
                {selectedAgent?.tier === 'beta' ? '试用' : '开始办理'}
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

        {/* P1-AE-1: create/bind CTAs on Home when unbound */}
        {!caseId ? (
          <div className="mt-3" data-testid="home-case-bind">
            <CaseBindControls
              caseId={undefined}
              prominence="soft"
              writebackRequiresBind={false}
              onBind={(id) => {
                setPickerTouched(true)
                setCaseId(id)
              }}
            />
            <p className="mt-1.5 text-center text-[11px] text-slate-400" role="status">
              也可先开始办理 · 随后在会话顶栏「创建并绑定 / 绑定已有」
            </p>
          </div>
        ) : (
          <p className="mt-2 text-center text-[11px] text-slate-400" role="status">
            {selectedCase
              ? `已关联「${selectedCase.title}」· 确认后写入案件`
              : '已选案 · 确认后写入案件'}
          </p>
        )}

        {/* IP task chips — Core only */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {PROMPT_PILLS.map((pill) => {
            const a = AGENT_CATALOG.find((x) => x.id === pill.agentId)
            return (
              <button
                key={pill.agentId}
                type="button"
                onClick={() => onPill(pill)}
                className="btn-press focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-[var(--shadow-rest)] hover:border-slate-300 hover:bg-slate-50"
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
            <h2 className="text-balance text-[13px] font-semibold text-slate-800">推荐</h2>
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
                  className="btn-press focus-ring flex w-full flex-col items-start rounded-[var(--radius-md)] border border-slate-200/90 bg-white px-3 py-2.5 text-left shadow-[var(--shadow-rest)] hover:border-slate-300 hover:bg-slate-50"
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
          {/* ART-M-2 · remind chip lives only in compact sidebar */}
          <Link
            to="/agent/agents"
            className="hover:text-slate-700 hover:underline"
          >
            Agent 目录
          </Link>
        </div>
      </div>

      {createToast && (
        <div className="toast-enter pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm">
          <div
            role="status"
            className="ui-toast ui-toast-info"
          >
            {createToast}
          </div>
        </div>
      )}
    </div>
  )
}
