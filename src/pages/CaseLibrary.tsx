import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Briefcase, Bot } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { STAGES, getStageMeta } from '../data/stages'
import { RiskBadge } from '../components/RiskBadge'
import { StageBadge } from '../components/StageBadge'
import { ProgressBar } from '../components/ProgressBar'
import type { StageId, RiskLevel } from '../types'
import { TenantBanner } from '../components/TenantBanner'
import { PageHeader, EmptyState } from '../components/PageHeader'
import {
  getCaseLibraryFilters,
  setCaseLibraryFilters,
} from '../utils/lastVisited'

type StatusChip = 'all' | 'active' | 'pending' | 'done'

function sensibleDefaultStatus(
  counts: { pending: number; active: number },
): StatusChip {
  if (counts.pending > 0) return 'pending'
  if (counts.active > 0) return 'active'
  return 'all'
}

export function CaseLibrary() {
  const { visibleCases: cases, workspace } = useApp()
  const navigate = useNavigate()
  const saved = useMemo(() => getCaseLibraryFilters(), [])

  const statusCounts = useMemo(() => {
    const active = cases.filter((c) => c.progress > 0 && c.progress < 100).length
    const pending = cases.filter((c) => c.progress === 0).length
    const done = cases.filter((c) => c.progress >= 100).length
    return { all: cases.length, active, pending, done }
  }, [cases])

  const [qDraft, setQDraft] = useState(saved?.q ?? '')
  const [q, setQ] = useState(saved?.q ?? '')
  const [stage, setStage] = useState<StageId | 'all'>(
    (saved?.stage as StageId | 'all') ?? 'all',
  )
  const [risk, setRisk] = useState<RiskLevel | 'all'>(
    (saved?.risk as RiskLevel | 'all') ?? 'all',
  )
  const [status, setStatus] = useState<StatusChip>(() => {
    if (saved?.status && ['all', 'active', 'pending', 'done'].includes(saved.status)) {
      return saved.status as StatusChip
    }
    return sensibleDefaultStatus({
      pending: cases.filter((c) => c.progress === 0).length,
      active: cases.filter((c) => c.progress > 0 && c.progress < 100).length,
    })
  })

  useEffect(() => {
    setCaseLibraryFilters({ q, stage, risk, status })
  }, [q, stage, risk, status])

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (status === 'active' && !(c.progress > 0 && c.progress < 100)) return false
      if (status === 'pending' && c.progress !== 0) return false
      if (status === 'done' && c.progress < 100) return false
      if (stage !== 'all' && c.stage !== stage) return false
      if (risk !== 'all' && c.risk !== risk) return false
      if (q) {
        const s = q.toLowerCase()
        return (
          c.title.toLowerCase().includes(s) ||
          c.caseNo.toLowerCase().includes(s) ||
          c.ownerTeam.toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [cases, q, stage, risk, status])


  const clearFilters = () => {
    setQ('')
    setQDraft('')
    setStage('all')
    setRisk('all')
    setStatus('all')
  }

  const hasActiveFilter =
    q !== '' || stage !== 'all' || risk !== 'all' || status !== 'all'

  return (
    <div className="px-5 py-5 lg:px-8 lg:py-6">
      <TenantBanner />
      <PageHeader
        sticky
        title="案件库"
        context={
          <>
            {workspace.chipLabel} · 租户隔离可见{' '}
            <span className="tabular-nums">{cases.length}</span> 案
            {workspace.kind === 'agency' ? '（不含未派发的自助案）' : ''}
            {status === 'pending' ? ' · 默认偏向待处理' : ''}
          </>
        }
        primary={{
          label: '打开工作台待办',
          to: '/workbench',
          icon: <Briefcase className="h-4 w-4" aria-hidden />,
        }}
        secondary={{
          label: '用知产 Agent',
          to: '/agent',
          icon: <Bot className="h-4 w-4" aria-hidden />,
        }}
      >
        <div className="segmented mt-4" role="group" aria-label="状态筛选">
          {(
            [
              ['all', '全部', statusCounts.all],
              ['active', '进行中', statusCounts.active],
              ['pending', '待处理', statusCounts.pending],
              ['done', '已完成', statusCounts.done],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatus(id)}
              className="segmented-item btn-press focus-ring"
              aria-pressed={status === id}
              aria-label={`筛选${label}，共 ${count} 件`}
            >
              {label} <span className="ml-1 tabular opacity-80">{count}</span>
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <form
          className="relative min-w-[200px] flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            setQ(qDraft.trim())
          }}
          role="search"
          aria-label="搜索案件"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            placeholder="搜索标题、案号、团队…"
            className="focus-ring hit-40 w-full rounded-[var(--radius-md)] border border-slate-200/90 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-[var(--shadow-rest)] placeholder:text-slate-400 focus:border-[var(--color-accent)]"
            aria-label="搜索标题、案号或团队"
            name="case-search"
            autoComplete="off"
          />
        </form>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as StageId | 'all')}
          className="focus-ring hit-40 rounded-[var(--radius-md)] border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-700 shadow-[var(--shadow-rest)]"
          aria-label="按阶段筛选案件"
        >
          <option value="all">全部阶段</option>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value as RiskLevel | 'all')}
          className="focus-ring hit-40 rounded-[var(--radius-md)] border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-700 shadow-[var(--shadow-rest)]"
          aria-label="按风险筛选案件"
        >
          <option value="all">全部风险</option>
          <option value="高">高风险</option>
          <option value="中">中风险</option>
          <option value="低">低风险</option>
        </select>
        <span className="self-center text-xs tabular text-slate-500" aria-live="polite">
          结果 {filtered.length}
        </span>
      </div>

      <div className="surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title={cases.length === 0 ? '本租户暂无可见案件' : '无匹配案件'}
            description={
              hasActiveFilter
                ? '可清除筛选，或前往工作台 / 知产 Agent 继续。'
                : '前往工作台查看待办，或在知产 Agent 发起。'
            }
            primary={
              hasActiveFilter
                ? { label: '清除筛选条件', onClick: clearFilters }
                : { label: '打开工作台待办', to: '/workbench' }
            }
            secondary={
              hasActiveFilter
                ? { label: '打开工作台待办', to: '/workbench' }
                : { label: '新建会话', to: '/agent' }
            }
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/70 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">案件</th>
                <th className="px-4 py-3 font-medium" scope="col">类型</th>
                <th className="px-4 py-3 font-medium" scope="col">阶段</th>
                <th className="px-4 py-3 font-medium" scope="col">办理模式</th>
                <th className="px-4 py-3 font-medium" scope="col">风险</th>
                <th className="px-4 py-3 font-medium" scope="col">进度</th>
                <th className="px-4 py-3 font-medium" scope="col">期限</th>
                <th className="px-4 py-3 font-medium" scope="col">团队</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/cases/${c.id}`)
                    }
                  }}
                  className="focus-row cursor-pointer border-b border-slate-100 transition-colors hover:bg-[var(--color-accent-soft)]/40"
                  aria-label={`打开案件 ${c.title}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{c.title}</div>
                    <div className="font-mono text-xs text-slate-500">{c.caseNo}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.type}</td>
                  <td className="px-4 py-3">
                    <StageBadge stage={c.stage} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        c.fulfillmentMode === 'self_serve'
                          ? 'border-sky-200 bg-sky-50 text-sky-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {c.fulfillmentMode === 'self_serve' ? '企业自助' : '已委托'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge risk={c.risk} />
                  </td>
                  <td className="w-32 px-4 py-3">
                    <div className="mb-1 text-xs tabular-nums text-slate-500">{c.progress}%</div>
                    <ProgressBar value={c.progress} color={getStageMeta(c.stage).color} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-400">{c.nextDeadline}</td>
                  <td className="px-4 py-3 text-slate-400">{c.ownerTeam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
