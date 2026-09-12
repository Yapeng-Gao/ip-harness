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
import { EmptyState } from '@shared/components/PageHeader'
import { AgentPickerCard } from '../components/AgentPickerCard'
import { AgentTierBadge } from '../components/AgentTierBadge'
import type { AgentTier, StageId } from '@shared/types'
import { resolvePreferredCaseId } from '@shared/utils/lastVisited'
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
  const [pickerTouched, setPickerTouched] = useState(false)

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

  const visibleIds = visibleCases.map((c) => c.id)
  const visibleMeta = visibleCases.map((c) => ({ id: c.id, stage: c.stage }))
  const explicitCase =
    params.get('case') || (pickerTouched ? caseId : null)
  const preferredFor = (stage: StageId) =>
    resolvePreferredCaseId(visibleIds, explicitCase, {
      stage,
      visible: visibleMeta,
    })

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
    const chosen = preferredFor(a.stage)
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
          选 Agent 开会话 · 有最近案时默认带上 ·{' '}
          <Link to="/agent/harness" className="hover:underline">
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
            className="focus-ring max-w-[220px] truncate rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
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
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 max-w-md">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索名称 / 擅长 / 分层"
              aria-label="搜索 Agent"
              className="focus-ring w-full rounded border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as AgentTier | 'all')}
            className="focus-ring rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            aria-label="按平台分层筛选"
          >
            <option value="all">全部分层</option>
            {AGENT_TIER_ORDER.map((t) => (
              <option key={t} value={t}>
                {AGENT_TIER_LABEL[t]} · {AGENT_TIER_SHORT[t]}
              </option>
            ))}
          </select>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as StageId | 'all')}
            className="focus-ring rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
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
        <EmptyState
          title="没有匹配的 Agent"
          description={
            q.trim() || stageFilter !== 'all' || tierFilter !== 'all'
              ? '试试清空搜索或换一层 / 阶段。'
              : '当前目录为空。'
          }
          primary={{
            label: '清除筛选',
            onClick: () => {
              setQ('')
              setStageFilter('all')
              setTierFilter('all')
            },
          }}
          secondary={{ label: '回开始', to: '/agent' }}
        />
      ) : (
        <div className="max-w-6xl space-y-6">
          {grouped.map(({ tier, agents: list }) => (
            <section key={tier} aria-labelledby={`tier-${tier}`}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2
                  id={`tier-${tier}`}
                  className="flex items-center gap-2 text-[13px] font-semibold text-slate-900"
                >
                  <AgentTierBadge tier={tier} />
                  <span>{AGENT_TIER_SHORT[tier]}</span>
                </h2>
                <span className="text-[11px] text-slate-400">{list.length} 个</span>
              </div>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => {
                  const chosenId = preferredFor(a.stage)
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
                            : chosen
                              ? '启动'
                              : '启动 · 稍后关联'
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
