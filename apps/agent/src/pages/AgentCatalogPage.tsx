import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAgents } from '@shared/context/AgentContext'
import { useApp } from '@shared/context/AppContext'
import { getStageMeta, STAGES } from '@shared/data/stages'
import {
  AGENT_TIER_LABEL,
  AGENT_TIER_ORDER,
  AGENT_TIER_SHORT,
  confirmNonCoreTier,
  defaultSessionGoal,
} from '@shared/data/agents'
import { AgentPickerCard } from '../components/AgentPickerCard'
import { AgentTierBadge } from '../components/AgentTierBadge'
import type { AgentTier, StageId } from '@shared/types'
import { agentSessionPath } from '../lib/deepLinks'

export function AgentCatalogPage() {
  const { agents, createSession } = useAgents()
  const { visibleCases } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const loc = useLocation()
  const [stageFilter, setStageFilter] = useState<StageId | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<AgentTier | 'all'>('all')
  const [q, setQ] = useState('')
  const [highlight, setHighlight] = useState<string | null>(null)
  const [caseId, setCaseId] = useState('')
  const [, setPickerTouched] = useState(false)

  useEffect(() => {
    const fromQuery = params.get('agent') || params.get('highlight')
    const fromHash = loc.hash?.replace(/^#/, '') || null
    const id = fromQuery || fromHash
    if (id) {
      setHighlight(id)
      requestAnimationFrame(() => {
        document.getElementById(`agent-card-${id}`)?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        })
      })
    }
  }, [params, loc.hash])

  useEffect(() => {
    const url = params.get('case')
    if (url && visibleCases.some((c) => c.id === url)) {
      setCaseId(url)
    }
  }, [params, visibleCases])

  useEffect(() => {
    const t = params.get('tier')
    if (t === 'core' || t === 'assist' || t === 'beta') {
      setTierFilter(t)
    }
  }, [params])

  // agent-case-binding: only explicit picker / URL — no auto prefer
  const chosenCaseId = caseId || params.get('case') || ''

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return agents.filter((a) => {
      if (stageFilter !== 'all' && a.stage !== stageFilter) return false
      if (tierFilter !== 'all' && a.tier !== tierFilter) return false
      if (!needle) return true
      const hay =
        `${a.name} ${a.specialty} ${a.description} ${a.raciHint} ${a.whenToUse ?? ''} ${a.outputsHint ?? ''} ${a.tier} ${a.tierNote ?? ''}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [agents, stageFilter, tierFilter, q])

  const grouped = useMemo(() => {
    return AGENT_TIER_ORDER.map((tier) => ({
      tier,
      agents: filtered.filter((a) => a.tier === tier),
    })).filter((g) => g.agents.length > 0)
  }, [filtered])

  const startWith = (a: (typeof agents)[number]) => {
    const chosen = chosenCaseId
    const chosenCase = visibleCases.find((c) => c.id === chosen)
    // Fix W · 阶段错配二次确认，不只 amber
    if (chosenCase && chosenCase.stage !== a.stage) {
      if (
        !window.confirm(
          `案阶段与 Agent 不匹配（案·${getStageMeta(chosenCase.stage).shortName} / Agent·${getStageMeta(a.stage).shortName}），仍要继续？`,
        )
      ) {
        return
      }
    }
    // Beta/Assist · 不默认可「一键当真闭环」
    if (!confirmNonCoreTier(a)) return
    const s = createSession({
      goal: defaultSessionGoal(a, { hasCase: !!chosen }),
      agentId: a.id,
      caseId: chosen || undefined,
      title: `${a.name} · ${a.specialty?.split('·')[0]?.trim() || '新任务'}`,
      confirmedNonCoreTier: true,
    })
    if (!s) return
    navigate(agentSessionPath(s.id), { state: { focusComposer: true } })
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
      <header className="mb-5 max-w-5xl">
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Agent</h1>
        <p className="mt-1 text-sm text-slate-500">
          选 Agent 开会话 · 案可选，可稍后创建或绑定 ·{' '}
          <Link to="/agent/harness" className="ui-link-weak">
            运行说明
          </Link>
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-slate-400" role="note">
          平台分层纪律：Core 主办理闭环 · Assist 辅助薄层 · Beta 非采购闭环 — 勿把 Assist/Beta
          卖成 Core。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={caseId}
            onChange={(e) => {
              setPickerTouched(true)
              setCaseId(e.target.value)
            }}
            className="ui-input ui-input-sm focus-ring max-w-[220px] truncate"
            aria-label="关联案件（可选）"
          >
            <option value="">可稍后创建或绑定案件</option>
            {visibleCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} · {getStageMeta(c.stage).shortName}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-400">
            {caseId
              ? '已选：新建会话将带上所选案件'
              : '可不选 · 无案也可开会话'}
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] max-w-md flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索名称 / 擅长 / 分层"
              aria-label="搜索 Agent"
              className="ui-input ui-input-sm focus-ring w-full pl-8"
            />
          </div>
          <div
            className="segmented"
            role="tablist"
            aria-label="按平台分层筛选"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tierFilter === 'all'}
              className="segmented-item"
              onClick={() => setTierFilter('all')}
            >
              全部
            </button>
            {AGENT_TIER_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tierFilter === t}
                className="segmented-item"
                onClick={() => setTierFilter(t)}
                title={AGENT_TIER_SHORT[t]}
              >
                {AGENT_TIER_LABEL[t]}
              </button>
            ))}
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as StageId | 'all')}
            className="ui-input ui-input-sm focus-ring max-w-[160px]"
            aria-label="按阶段筛选"
          >
            <option value="all">全部阶段</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="ui-empty max-w-xl">
          <p className="ui-empty-title">没有匹配的 Agent</p>
          <p className="ui-empty-desc">
            {q.trim() || stageFilter !== 'all' || tierFilter !== 'all'
              ? '试试清空搜索或换一层 / 阶段。'
              : '当前目录为空。'}
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="ui-btn ui-btn-sm ui-btn-primary btn-press focus-ring"
              onClick={() => {
                setQ('')
                setStageFilter('all')
                setTierFilter('all')
              }}
            >
              清除筛选
            </button>
            <Link
              to="/agent"
              className="ui-btn ui-btn-sm ui-btn-secondary btn-press focus-ring"
            >
              回开始
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl space-y-6">
          {grouped.map(({ tier, agents: list }) => (
            <section key={tier} aria-labelledby={`tier-${tier}`}>
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <h2
                  id={`tier-${tier}`}
                  className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-slate-900"
                >
                  <AgentTierBadge tier={tier} />
                  <span>{AGENT_TIER_SHORT[tier]}</span>
                </h2>
                <span className="tabular text-[11px] text-slate-400">{list.length} 个</span>
              </div>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => {
                  const chosenId = chosenCaseId
                  const chosen = visibleCases.find((c) => c.id === chosenId)
                  const mismatch = !!chosen && chosen.stage !== a.stage
                  return (
                    <li key={a.id} className="min-h-0">
                      <AgentPickerCard
                        id={`agent-card-${a.id}`}
                        agent={a}
                        highlight={highlight === a.id}
                        showDetails
                        caseHint={
                          chosen
                            ? {
                                title: chosen.title,
                                stageShort: getStageMeta(chosen.stage).shortName,
                                mismatch,
                              }
                            : null
                        }
                        startLabel={
                          a.tier === 'beta'
                            ? '试用 · 非闭环'
                            : '启动'
                        }
                        onStart={() => startWith(a)}
                      />
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
