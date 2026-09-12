import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateApp } from '../lib/deepLinks'
import { workbenchPathForStage } from '../data/workbenchMap'
import {
  Grid3x3,
  Lightbulb,
  FileText,
  X,
  Package,
  Building2,
} from 'lucide-react'
import { PATENT_LAYOUTS } from '../data/insight'
import { AGENCIES } from '../data/agencies'
import { useApp } from '../context/AppContext'
import { InsightDataBanner } from '../components/InsightDataBanner'
import { PageHeader } from '../components/PageHeader'
import { InsightSisterNav } from '../components/InsightSisterNav'
import type { LayoutCell } from '../types'

const statusMeta = {
  laid: {
    label: '已布局',
    cell: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  blank: {
    label: '空白',
    cell: 'border-amber-300 bg-amber-50 hover:bg-amber-100 cursor-pointer ring-1 ring-amber-100',
    badge: 'bg-amber-100 text-amber-800',
  },
  rival_dense: {
    label: '对手密度',
    cell: 'border-rose-200 bg-rose-50 hover:bg-rose-100',
    badge: 'bg-rose-100 text-rose-800',
  },
} as const

export function InsightLayout() {
  const layout = PATENT_LAYOUTS[0]
  const { addCase, dispatchAgency, addActivity, bumpInsightDriven } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<LayoutCell | null>(null)
  const [suggestion, setSuggestion] = useState<LayoutCell | null>(null)
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const cellAt = (row: string, col: string) =>
    layout.cells.find((c) => c.row === row && c.col === col)

  const createResearch = (cell: LayoutCell) => {
    const created = addCase({
      title: `${cell.label}（布局调研）`,
      stage: 'pre_research',
      type: '发明',
      ownerTeam: '专利策略组',
      risk: cell.status === 'rival_dense' ? '高' : '中',
      inventor: '待指定',
      summary: `由专利布局「${layout.name}」空白/节点生成。矩阵：${cell.row} × ${cell.col}。状态：${statusMeta[cell.status].label}。我方 ${cell.ourCount} / 对手 ${cell.rivalCount}。${cell.note}`,
      fulfillmentMode: 'self_serve',
      agencyName: '—',
      fromInsight: true,
    })
    bumpInsightDriven()
    navigateApp(navigate, workbenchPathForStage('pre_research', created.id))
  }

  const packAndDispatch = (cell: LayoutCell, agencyName: string) => {
    const created = addCase({
      title: `${cell.label}（布局打包派所）`,
      stage: 'pre_research',
      type: '发明',
      ownerTeam: '专利策略组',
      risk: '中',
      inventor: '待指定',
      summary: `由专利布局空白格打包派所。矩阵：${cell.row} × ${cell.col}。${cell.note}`,
      fulfillmentMode: 'delegated',
      agencyName,
      quoteDispatchStatus: 'assigned',
      fromInsight: true,
    })
    bumpInsightDriven()
    dispatchAgency(created.id, agencyName)
    addActivity(`布局空白「${cell.label}」打包任务并派所给「${agencyName}」`)
    setDispatchOpen(false)
    setToast(`已创建调研案并派所「${agencyName}」`)
    window.setTimeout(() => setToast(null), 2800)
    navigate(`/cases/${created.id}`)
  }

  const onCellClick = (cell: LayoutCell) => {
    setSelected(cell)
    if (cell.status === 'blank') {
      setSuggestion(cell)
    } else {
      setSuggestion(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="专利布局"
        context="示意数据 · 技术树 / 矩阵 · 已布局 / 空白 / 对手密度 → 点击空白生成调研"
        primary={{
          label: '打开赛道洞察',
          to: '/insight/tracks',
          icon: <Lightbulb className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '创新激发', to: '/insight/innovate' }}
      />

      <InsightSisterNav />
      <InsightDataBanner compact />

      <div role="status" aria-live="polite">
        {toast && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {toast}
          </div>
        )}
      </div>

      {dispatchOpen && selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="layout-dispatch-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDispatchOpen(false)
          }}
        >
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 id="layout-dispatch-title" className="text-sm font-semibold text-slate-900">
                打包任务并派所 · {selected.label}
              </h3>
              <button
                type="button"
                onClick={() => setDispatchOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                aria-label="关闭派所对话框"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="divide-y divide-slate-100 p-2">
              {AGENCIES.map((ag) => (
                <li key={ag.id}>
                  <button
                    type="button"
                    onClick={() => packAndDispatch(selected, ag.name)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                    aria-label={`派所给 ${ag.name}`}
                  >
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800">{ag.name}</div>
                      <div className="text-xs text-slate-500">
                        擅长节点：{ag.nodeStrengths.join(' · ')} · ★ {ag.rating}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mb-6 flat-card p-4">
        <div className="mb-1 text-xs text-slate-500">{layout.domain}</div>
        <h2 className="text-lg font-semibold text-slate-900">{layout.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{layout.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(Object.keys(statusMeta) as Array<keyof typeof statusMeta>).map((k) => (
            <span
              key={k}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${statusMeta[k].badge}`}
            >
              {statusMeta[k].label}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
          <Grid3x3 className="h-4 w-4 text-slate-700" />
          布局矩阵（示意）
        </div>
        <table className="w-full min-w-[640px] border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="w-24 text-left text-xs font-medium text-slate-500" />
              {layout.cols.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 text-center text-xs font-medium text-slate-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {layout.rows.map((row) => (
              <tr key={row}>
                <th className="pr-2 text-left text-xs font-medium text-slate-700">{row}</th>
                {layout.cols.map((col) => {
                  const cell = cellAt(row, col)
                  if (!cell) return <td key={col} />
                  const meta = statusMeta[cell.status]
                  return (
                    <td key={col}>
                      <button
                        type="button"
                        onClick={() => onCellClick(cell)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${meta.cell} ${
                          selected?.id === cell.id ? 'outline outline-2 outline-slate-400' : ''
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-1">
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${meta.badge}`}>
                            {meta.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            我{cell.ourCount}/对{cell.rivalCount}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800">{cell.label}</div>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(selected || suggestion) && (
        <div className="flat-card p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-slate-800">
                {selected?.label ?? suggestion?.label}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {selected?.row} × {selected?.col} · {selected && statusMeta[selected.status].label}
              </p>
              <p className="mt-2 text-sm text-slate-600">{selected?.note}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                setSuggestion(null)
              }}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {suggestion && suggestion.status === 'blank' && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-amber-900">
                <FileText className="h-3.5 w-3.5" />
                布局建议卡片（示意）
              </div>
              <p className="text-xs leading-relaxed text-amber-900/80">
                「{suggestion.label}」公开稀疏（对手约 {suggestion.rivalCount}{' '}
                件、我方 {suggestion.ourCount}{' '}
                件）。建议：① 快速新颖性/FTO 检索；② 形成权利要求草图；③
                与研发确认实验数据后进入立项决策。
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selected && createResearch(selected)}
              className="btn-press focus-ring inline-flex items-center gap-1.5 cta-work rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              <Lightbulb className="h-4 w-4" />
              生成调研案件
            </button>
            {selected?.status === 'blank' && (
              <button
                type="button"
                onClick={() => setSuggestion(selected)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                查看布局建议
              </button>
            )}
            {selected?.status === 'blank' && (
              <button
                type="button"
                onClick={() => setDispatchOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 hover:bg-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                aria-label="打包任务并派所"
              >
                <Package className="h-4 w-4" />
                打包任务并派所
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
