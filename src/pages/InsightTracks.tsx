import { useNavigate } from 'react-router-dom'
import { navigateApp } from '../lib/deepLinks'
import { workbenchPathForStage } from '../data/workbenchMap'
import { Lightbulb, ArrowRight } from 'lucide-react'
import { INSIGHT_TRACKS } from '../data/insight'
import { useApp } from '../context/AppContext'
import { InsightDataBanner } from '../components/InsightDataBanner'
import { InsightSisterNav } from '../components/InsightSisterNav'
import { PageHeader } from '../components/PageHeader'

export function InsightTracks() {
  const track = INSIGHT_TRACKS[0]
  const { addCase, bumpInsightDriven } = useApp()
  const navigate = useNavigate()
  const maxFilings = Math.max(...track.competitors.map((c) => c.filings), 1)

  const createResearchCase = (blankTitle?: string) => {
    const title = blankTitle
      ? `${blankTitle}（洞察立项）`
      : `${track.name} · 立项前调研`
    const created = addCase({
      title,
      stage: 'pre_research',
      type: '发明',
      ownerTeam: '创新孵化组',
      risk: '中',
      inventor: '待指定',
      summary: `由赛道洞察「${track.name}」生成。${blankTitle ? `空白点：${blankTitle}。` : ''}${track.summary}`,
      fulfillmentMode: 'self_serve',
      agencyName: '—',
      fromInsight: true,
    })
    bumpInsightDriven()
    navigateApp(navigate, workbenchPathForStage('pre_research', created.id))
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="赛道洞察"
        context="示意数据 · Insight MVP · 竞品分布与空白点 → 一键生成立项前调研案件"
        primary={{
          label: '生成立项前调研案件',
          onClick: () => createResearchCase(),
          icon: <Lightbulb className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '打开创新激发', to: '/insight/innovate' }}
      />

      <InsightSisterNav />
      <InsightDataBanner compact />

      <div className="mb-5 flat-card p-4">
        <div className="mb-1 text-xs text-slate-500">{track.domain}</div>
        <h2 className="text-lg font-semibold text-slate-900">{track.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{track.summary}</p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="flat-card p-4">
          <h3 className="mb-4 text-sm font-medium text-slate-800">竞品公开量（示意）</h3>
          <ul className="space-y-3">
            {track.competitors.map((c) => (
              <li key={c.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-700">{c.name}</span>
                  <span className="text-slate-500">
                    {c.filings} 件 · {c.share}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-600"
                    style={{ width: `${(c.filings / maxFilings) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flat-card p-4">
          <h3 className="mb-4 text-sm font-medium text-slate-800">空白点机会</h3>
          <ul className="space-y-3">
            {track.blankSpots.map((bs) => (
              <li
                key={bs.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="text-sm font-medium text-slate-800">{bs.title}</div>
                <p className="mt-1 text-xs text-slate-500">{bs.reason}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-emerald-700">{bs.opportunity}</span>
                  <button
                    type="button"
                    onClick={() => createResearchCase(bs.title)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                  >
                    生成调研案件 <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
