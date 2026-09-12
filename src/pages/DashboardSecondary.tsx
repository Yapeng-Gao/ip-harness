import { Link } from 'react-router-dom'
import { Activity, ArrowRight, FlaskConical, Grid3x3, Link2 } from 'lucide-react'
import { STAGES } from '../data/stages'
import type { PatentCase } from '../types'

type ActivityRow = { id: string; text: string; time: string }

type Props = {
  cases: PatentCase[]
  recentActivity: ActivityRow[]
  selfServeCount: number
  delegatedCount: number
  selfServePct: number
  delegatedPct: number
}

/** Collapsed secondary panel — funnel + insight links + activity (no demo health fluff). */
export function DashboardSecondary({
  cases,
  recentActivity,
  selfServeCount,
  delegatedCount,
  selfServePct,
  delegatedPct,
}: Props) {
  const byStage = STAGES.map((s) => ({
    ...s,
    count: cases.filter((c) => c.stage === s.id).length,
  }))
  const maxCount = Math.max(...byStage.map((s) => s.count), 1)

  return (
    <details className="mb-6 rounded-lg border border-slate-200 bg-white">
      <summary className="focus-ring cursor-pointer list-none rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        阶段漏斗 · 洞察 · 最近动态{' '}
        <span className="ml-2 text-xs font-normal text-slate-400">展开</span>
      </summary>
      <div className="space-y-5 border-t border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <span>
            办理模式 · 自助 {selfServeCount}（{selfServePct}%）· 委托 {delegatedCount}（
            {delegatedPct}%）
          </span>
          <Link to="/agencies" className="text-slate-700 hover:underline focus-ring rounded">
            代理所
          </Link>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-slate-500">洞察入口</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link
              to="/insight/innovate"
              className="inline-flex items-center gap-1 text-slate-700 hover:underline focus-ring rounded"
            >
              <FlaskConical className="h-3.5 w-3.5 text-sky-600" aria-hidden />
              创新激发
            </Link>
            <Link
              to="/insight/layout"
              className="inline-flex items-center gap-1 text-slate-700 hover:underline focus-ring rounded"
            >
              <Grid3x3 className="h-3.5 w-3.5 text-slate-700" aria-hidden />
              专利布局
            </Link>
            <Link
              to="/insight/chain"
              className="inline-flex items-center gap-1 text-slate-700 hover:underline focus-ring rounded"
            >
              <Link2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              产业链全景
            </Link>
            <Link
              to="/insight/tracks"
              className="text-slate-500 hover:underline focus-ring rounded"
            >
              赛道 →
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-800">阶段漏斗</h2>
            <Link
              to="/pipeline"
              className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 focus-ring rounded"
            >
              流水线 <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          <div className="flex items-end gap-2" style={{ height: 100 }}>
            {byStage.map((s) => (
              <Link
                key={s.id}
                to={`/pipeline?stage=${s.id}`}
                className="group flex flex-1 flex-col items-center gap-1.5 focus-ring rounded"
              >
                <span className="text-xs font-medium text-slate-700">{s.count}</span>
                <div
                  className="w-full rounded-t-md transition-opacity group-hover:opacity-80"
                  style={{
                    height: `${(s.count / maxCount) * 100}%`,
                    minHeight: s.count > 0 ? 10 : 3,
                    background: s.color,
                    opacity: 0.85,
                  }}
                />
                <span className="truncate text-[10px] text-slate-500">{s.shortName}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-700" aria-hidden />
            <h2 className="text-sm font-medium text-slate-800">最近动态</h2>
          </div>
          <ul className="space-y-2.5">
            {recentActivity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3 border-b border-slate-100 pb-2.5 last:border-0">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">{a.text}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
