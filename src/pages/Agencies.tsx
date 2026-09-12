import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Star,
  Briefcase,
  Tag,
  MessageSquareQuote,
  Send,
  Layers,
} from 'lucide-react'
import { AGENCIES } from '../data/agencies'
import { agencyIdFromName } from '../data/workspaces'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/PageHeader'

export function Agencies() {
  const {
    visibleCases,
    role,
    workspace,
    submitAgencyIntent,
    visibleAgencyIntents,
  } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<string | null>(null)
  const [quoteAgency, setQuoteAgency] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState('')
  const [selectedNode, setSelectedNode] = useState('')

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3000)
  }

  const openQuote = (agencyId: string, nodes: string[]) => {
    setQuoteAgency(agencyId)
    setSelectedNode(nodes[0] ?? '')
    setSelectedCase(visibleCases[0]?.id ?? '')
  }

  const submitQuoteIntent = () => {
    const ag = AGENCIES.find((a) => a.id === quoteAgency)
    if (!ag) return
    const c = visibleCases.find((x) => x.id === selectedCase)
    const agencyId =
      role === 'agency' && workspace.kind === 'agency'
        ? workspace.tenantId
        : agencyIdFromName(ag.name) ?? ag.id
    if (c) {
      submitAgencyIntent({
        caseId: c.id,
        agencyId,
        agencyName: ag.name,
        node: selectedNode,
        quoteBudget: ag.priceRange,
        note: role === 'agency' ? '代理所抢单意向' : '企业发起询价',
      })
      flash(`已记录对「${c.title}」的询价/抢单意向 · ${ag.name} · ${selectedNode}`)
    } else {
      flash('请选择关联案件以进入意向状态机（none → intent）')
    }
    setQuoteAgency(null)
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="代理所市场"
        context="示意数据 · 能力标签 / 擅长节点 / 履约评价 · 询价意向状态机 none→intent→quoted→confirmed→assigned"
        primary={{
          label: role === 'enterprise' ? '打开案件库派单' : '查看承办案件',
          to: '/cases',
          icon: <Briefcase className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '打开工作台待办', to: '/workbench' }}
      />

      {workspace.kind === 'agency' && visibleAgencyIntents.filter((i) => i.status === 'intent').length === 0 && (
        <div className="mb-6 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
          <p className="text-sm text-slate-600">暂无进行中的询价/抢单意向</p>
          <p className="mt-1 text-xs text-slate-400">
            选择案件后提交「询价/抢单意向」，企业确认后将派所并进入 assigned。
          </p>
        </div>
      )}

      {visibleAgencyIntents.filter((i) => i.status === 'intent').length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-slate-950">进行中意向</h2>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {visibleAgencyIntents
              .filter((i) => i.status === 'intent')
              .map((i) => (
                <li key={i.id}>
                  {i.agencyName} · {i.node} · 案件{' '}
                  <Link to={`/cases/${i.caseId}`} className="text-slate-800 underline">
                    {i.caseId}
                  </Link>
                  {workspace.kind === 'enterprise' && (
                    <span className="ml-2 text-slate-500">（可在案件详情接受/忽略）</span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div role="status" aria-live="polite">
        {toast && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {toast}
          </div>
        )}
      </div>

      {quoteAgency && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-intent-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuoteAgency(null)
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 id="quote-intent-title" className="text-sm font-semibold text-slate-900">
              按节点询价 / 抢单意向
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {AGENCIES.find((a) => a.id === quoteAgency)?.name}
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs text-slate-600">擅长节点</span>
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                aria-label="选择节点"
              >
                {(AGENCIES.find((a) => a.id === quoteAgency)?.nodeStrengths ?? []).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs text-slate-600">关联案件（可选）</span>
              <select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                aria-label="选择案件"
              >
                <option value="">仅记录意向（不派单）</option>
                {visibleCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setQuoteAgency(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitQuoteIntent}
                className="btn-press focus-ring inline-flex items-center gap-1 cta-work rounded-lg px-3 py-1.5 text-xs font-medium"
                aria-label="确认询价意向"
              >
                <Send className="h-3.5 w-3.5" /> 提交意向
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AGENCIES.map((ag) => {
          const avg =
            ag.reviews.length > 0
              ? (
                  ag.reviews.reduce((s, r) => s + r.rating, 0) / ag.reviews.length
                ).toFixed(1)
              : ag.rating.toFixed(1)
          return (
            <div
              key={ag.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-muted">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-slate-900">{ag.name}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{ag.blurb}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400">
                  <Layers className="h-3 w-3" /> 能力标签
                </div>
                <div className="flex flex-wrap gap-1">
                  {ag.capabilityTags.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-slate-200 bg-accent-soft px-2 py-0.5 text-xs text-accent-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400">
                  <Briefcase className="h-3 w-3" /> 擅长节点
                </div>
                <div className="flex flex-wrap gap-1">
                  {ag.nodeStrengths.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400">
                  <Tag className="h-3 w-3" /> 领域标签
                </div>
                <div className="flex flex-wrap gap-1">
                  {ag.domains.map((d) => (
                    <span
                      key={d}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                    <MessageSquareQuote className="h-3.5 w-3.5 text-amber-600" />
                    履约评价
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {avg} · {ag.reviews.length} 条
                  </span>
                </div>
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${(Number(avg) / 5) * 100}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedReviews((e) => (e === ag.id ? null : ag.id))
                  }
                  className="text-xs text-slate-700 hover:text-slate-900"
                  aria-label={`查看 ${ag.name} 评价`}
                >
                  {expandedReviews === ag.id ? '收起评价' : '展开评价'}
                </button>
                {expandedReviews === ag.id && (
                  <ul className="mt-2 space-y-2">
                    {ag.reviews.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-700">{r.by}</span>
                          <span className="text-amber-600">★ {r.rating}</span>
                        </div>
                        <p className="mt-0.5 text-slate-600">{r.comment}</p>
                        <div className="mt-0.5 text-xs text-slate-400">
                          {r.at}
                          {r.node ? ` · ${r.node}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                <div>
                  <div className="text-xs text-slate-400">报价区间</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-800">{ag.priceRange}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">评分</div>
                  <div className="mt-0.5 inline-flex items-center gap-0.5 text-xs font-medium text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {ag.rating}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">在办量</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-800">{ag.activeCases}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openQuote(ag.id, ag.nodeStrengths)}
                className="btn-press focus-ring cta-work mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
                aria-label={`按节点询价 ${ag.name}`}
              >
                <Send className="h-3.5 w-3.5" />
                按节点询价/抢单意向
              </button>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        派单入口亦在{' '}
        <Link to="/cases" className="text-slate-700 hover:underline">
          案件详情 → 委托关系
        </Link>
      </p>
    </div>
  )
}
