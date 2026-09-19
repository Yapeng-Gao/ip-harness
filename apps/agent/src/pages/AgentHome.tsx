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
    setCreateToast('当前角色不能新建会话，请切换为企业 IP / 代理所')
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
    const goalTrim = goal.trim()
    // P0：空目标 + 自动匹配 → research 新会话（勿默认 OA 种子 / 审查阶段）
    let resolvedAgentId: 'auto' | string = agentId
    let resolvedGoal = goalTrim
    let resolvedSelected = selected
    if (!goalTrim && (agentId === 'auto' || !agentId)) {
      const research = AGENT_CATALOG.find((a) => a.id === 'agent-research')
      resolvedAgentId = 'agent-research'
      resolvedGoal =
        PROMPT_PILLS.find((x) => x.agentId === 'agent-research')?.goal ??
        defaultSessionGoal(research, { hasCase: !!caseId })
      resolvedSelected = research ?? null
    } else if (!goalTrim) {
      resolvedGoal = defaultSessionGoal(selected, { hasCase: !!caseId })
    }
    if (resolvedSelected && resolvedSelected !== selected) {
      if (!confirmNonCoreTier(resolvedSelected)) return
    }
    const s = createSession({
      goal: resolvedGoal,
      agentId: resolvedAgentId,
      caseId: caseId || undefined,
      title: goalTrim
        ? goalTrim.slice(0, 28)
        : resolvedAgentId === 'agent-research'
          ? '检索现有技术 · 新办理'
          : undefined,
      confirmedNonCoreTier: resolvedSelected ? true : undefined,
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
            先聊起来 · 案可选 · 确认后再写入
          </p>
          {/* SS-S-S0-1 · dual 11px meta → single line + 「说明」 */}
          <details className="mt-1.5 inline-block" data-testid="home-meta-help">
            <summary className="cursor-pointer list-none text-[12px] text-slate-400 hover:text-slate-600 [&::-webkit-details-marker]:hidden">
              说明
            </summary>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
              可先开聊，不必先选案 ·{' '}
              <Link
                to="/agent/projects"
                className="text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
              >
                项目模式
              </Link>
              （次级）
            </p>
          </details>
        </div>

        {/* Composer — Agent primary act */}
        <div className="mt-6 rounded-[var(--radius-xl)] border border-slate-200/90 bg-white shadow-[var(--shadow-rest)] focus-within:border-[var(--color-accent)] focus-within:shadow-[var(--shadow-elevated)]">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={onKeyDown}
            rows={5}
            placeholder="例如：帮我梳理这件事的目标、可选方案和下一步（案可稍后绑定）"
            className="focus-ring w-full resize-none bg-transparent px-4 pt-4 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:rounded-[var(--radius-md)]"
            aria-label="办理目标"
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 pb-3 pt-2">
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
                <span className="hidden text-[10px] text-slate-400 sm:inline" title="有案时：确认后再写入">
                  有案 · 确认后再写入
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

        {/* P0: single case entry — CaseBindControls only (no compose twin select) */}
        <div className="mt-3" data-testid="home-case-bind">
          <CaseBindControls
            caseId={caseId || undefined}
            prominence="soft"
            writebackRequiresBind={false}
            onBind={(id) => {
              setPickerTouched(true)
              setCaseId(id)
            }}
            onUnbind={() => {
              setPickerTouched(true)
              setCaseId('')
            }}
          />
          {!caseId ? (
            <p className="mt-1.5 text-center text-[11px] text-slate-400" role="status">
              也可先开始办理 · 随后在会话顶栏「创建并绑定 / 绑定已有」
            </p>
          ) : null}
        </div>

        {/* P0：空目标优先引导检索 chip（非 OA） */}
        {!goal.trim() ? (
          <div
            className="mt-3 flex flex-wrap items-center justify-center gap-2"
            data-testid="home-research-default-chip"
          >
            <button
              type="button"
              className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50"
              onClick={() => {
                const pill = PROMPT_PILLS.find((x) => x.agentId === 'agent-research')
                if (pill) onPill(pill)
              }}
            >
              检索现有技术 · 可专利性
            </button>
            <span className="text-[11px] text-slate-400">推荐第一步 · 非审查答复</span>
          </div>
        ) : null}

        {/* SS-M-S0-1 · Core pills folded — not a full row under compose */}
        <details className="group mt-4" data-testid="home-common-fold">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-[12px] text-slate-500 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
            <span className="font-medium text-slate-600">常用</span>
            <span className="text-slate-400">· 快捷任务</span>
            <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </summary>
          <div className="mt-2 flex flex-wrap justify-center gap-2" data-testid="home-common-pills">
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
        </details>

        {/* SW-S0-1 · recommend demoted — compose + primary CTA first */}
        <details className="group mt-4" data-testid="home-recommend-fold">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1 py-1.5 text-[12px] text-slate-500 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
            <span className="font-medium text-slate-600">
              推荐 Agent
              <span className="ml-1 font-normal text-slate-400">· 次级</span>
            </span>
            <span className="flex items-center gap-2">
              <Link
                to="/agent/agents"
                className="text-[11px] text-slate-400 hover:text-slate-700 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                目录 · 分层
              </Link>
              <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </span>
          </summary>
          <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                  className="btn-press focus-ring flex w-full flex-col items-start rounded-[var(--radius-md)] border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-left hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-800">{a.name}</span>
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
        </details>

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
