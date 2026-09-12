import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateApp } from '../lib/deepLinks'
import { workbenchPathForStage } from '../data/workbenchMap'
import {
  Star,
  Lightbulb,
  ClipboardCheck,
  FlaskConical,
} from 'lucide-react'
import { INNOVATE_CAMPAIGNS } from '../data/insight'
import { useApp } from '../context/AppContext'
import { InsightDataBanner } from '../components/InsightDataBanner'
import { PageHeader } from '../components/PageHeader'
import { InsightSisterNav } from '../components/InsightSisterNav'
import type { InventionCandidate } from '../types'

const maturityColor: Record<string, string> = {
  概念: 'bg-slate-100 text-slate-600',
  实验室: 'bg-sky-50 text-sky-700',
  原型: 'bg-slate-100 text-slate-800',
  小试: 'bg-emerald-50 text-emerald-700',
}

const patentColor: Record<string, string> = {
  高: 'text-emerald-700',
  中高: 'text-teal-700',
  中: 'text-amber-700',
  待评估: 'text-slate-500',
}

export function InsightInnovate() {
  const campaign = INNOVATE_CAMPAIGNS[0]
  const { addCase, bumpInsightDriven } = useApp()
  const navigate = useNavigate()
  const [focused, setFocused] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const candidates = useMemo(
    () =>
      campaign.candidates.map((c) => ({
        ...c,
        focused: focused.has(c.id) || c.focused,
      })),
    [campaign.candidates, focused],
  )

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2800)
  }

  const toggleFocus = (id: string) => {
    setFocused((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    flash(focused.has(id) ? '已取消重点标记' : '已标记为重点候选')
  }

  const createResearch = (c: InventionCandidate) => {
    const created = addCase({
      title: `${c.title}（发明披露调研）`,
      stage: 'pre_research',
      type: '发明',
      ownerTeam: c.dept,
      risk: c.patentability === '高' || c.patentability === '中高' ? '中' : '低',
      inventor: c.inventor,
      summary: `由创新激发「${campaign.name}」生成立项前调研。成熟度：${c.maturity}；可专利性提示：${c.patentability}。${c.hint}`,
      fulfillmentMode: 'self_serve',
      agencyName: '—',
      fromInsight: true,
    })
    bumpInsightDriven()
    navigateApp(navigate, workbenchPathForStage('pre_research', created.id))
  }

  const pushDecision = (c: InventionCandidate) => {
    const created = addCase({
      title: `${c.title}（披露推送立项）`,
      stage: 'decision',
      type: '发明',
      ownerTeam: c.dept,
      risk: '中',
      inventor: c.inventor,
      summary: `由创新激发「${campaign.name}」推送至立项决策。发明人：${c.inventor}（${c.dept}）。${c.hint}`,
      fulfillmentMode: 'self_serve',
      agencyName: '—',
      fromInsight: true,
    })
    bumpInsightDriven()
    navigateApp(navigate, workbenchPathForStage('decision', created.id))
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="创新激发"
        context="示意数据 · 发明披露 / 创新挖掘 → 标记重点 · 生成调研 · 推送立项"
        primary={{
          label: '打开研发交底入口',
          to: '/inventor',
          icon: <FlaskConical className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '赛道洞察', to: '/insight/tracks' }}
      />

      <InsightSisterNav />
      <InsightDataBanner compact />

      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </div>
      )}

      <div className="mb-6 flat-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                {campaign.status}
              </span>
              <span className="text-xs text-slate-500">{campaign.period}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{campaign.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{campaign.theme}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {campaign.description}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <FlaskConical className="h-4 w-4 text-slate-700" />
            候选 {candidates.length} 项 · 重点 {candidates.filter((c) => c.focused).length}
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800">研发发明候选（示意）</h3>
      </div>

      <ul className="space-y-3">
        {candidates.map((c) => (
          <li
            key={c.id}
            className={`rounded-xl border bg-white p-4 ${
              c.focused ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {c.focused && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  )}
                  <h4 className="text-sm font-medium text-slate-900">{c.title}</h4>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{c.inventor}</span>
                  <span>·</span>
                  <span>{c.dept}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${maturityColor[c.maturity]}`}
                  >
                    {c.maturity}
                  </span>
                  <span className={`font-medium ${patentColor[c.patentability]}`}>
                    可专利性 {c.patentability}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{c.hint}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleFocus(c.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Star className="h-3 w-3" />
                  {c.focused ? '取消重点' : '标记为重点'}
                </button>
                <button
                  type="button"
                  onClick={() => createResearch(c)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
                >
                  <Lightbulb className="h-3 w-3" />
                  生成立项前调研案件
                </button>
                <button
                  type="button"
                  onClick={() => pushDecision(c)}
                  className="btn-press focus-ring inline-flex items-center gap-1 cta-work rounded-md px-4 py-2 text-sm font-semibold"
                >
                  <ClipboardCheck className="h-3 w-3" />
                  推送到立项决策
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
