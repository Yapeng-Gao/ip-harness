import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { businessSeatLabel, CONFIRM_META } from '../../business/businessSeats'
import { ORG_DEPTS } from '../../departments/orgDepts'
import { confirmKindOf } from '../../departments/deptProgress'

/**
 * 首页简报 · 按现有数据派生（样机）
 * 无新后端：在办项目 / 在办案子 / 最近动作。待确认只在顶栏铃铛；简报默认折叠。
 */
export function HomeBriefing() {
  const { cases, getProgress, getProcessLogs, stageLabel } =
    useBusinessCases()
  const { folderProjects, getTimeline } = useProjectFolder()

  const stats = useMemo(
    () => ({
      activeProjects: folderProjects.length,
      activeCases: cases.filter((c) => getProgress(c.id).completedStages.length < 5)
        .length,
    }),
    [cases, folderProjects, getProgress],
  )

  /** 最近动作：优先 process log，没有则退到 timeline */
  const latest = useMemo(() => {
    const logs = getProcessLogs()
      .slice()
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 3)
    if (logs.length > 0) {
      return logs.map((l) => {
        const dept = l.seatId
          ? ORG_DEPTS.find((d) => d.leadSeatId === l.seatId)
          : undefined
        return {
          id: l.id,
          title: l.message,
          dept: dept?.label ?? (l.seatId ? businessSeatLabel(l.seatId) : '案子助手'),
        }
      })
    }
    const out: Array<{ id: string; title: string; dept: string }> = []
    for (const p of folderProjects) {
      const t = getTimeline(p.id)[0]
      if (t) out.push({ id: t.id, title: t.title, dept: p.title })
    }
    return out.slice(0, 3)
  }, [getProcessLogs, folderProjects, getTimeline])

  const focusCase = useMemo(() => {
    const withStage = cases.find((c) => {
      const p = getProgress(c.id)
      return p.completedStages.length > 0 && p.completedStages.length < 5
    })
    if (!withStage) return null
    const p = getProgress(withStage.id)
    const next = ORG_DEPTS.find(
      (d) =>
        d.group === 'main' &&
        confirmKindOf(d) !== null &&
        !p.doneSeatIds.includes(d.leadSeatId),
    )
    return {
      id: withStage.id,
      title: withStage.title,
      stage: stageLabel(p.stageId),
      nextDept: next?.label ?? null,
      nextConfirm: next ? CONFIRM_META[confirmKindOf(next)!].preparedBy : null,
    }
  }, [cases, getProgress, stageLabel])

  const [open, setOpen] = useState(false)

  return (
    <section aria-label="今日简报" data-testid="home-briefing" className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] text-left"
        data-testid="home-briefing-toggle"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} aria-hidden />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} aria-hidden />
        )}
        <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">简报</h2>
        <span className="ml-auto text-[11px] text-slate-500">
          {open ? '样机 · 按现有数据派生' : '点击展开'}
        </span>
      </button>

      {open && (
      <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <StatTile icon={FolderKanban} label="在办项目" value={stats.activeProjects} />
        <StatTile icon={Activity} label="在办案子" value={stats.activeCases} />
      </div>

      {focusCase && (
        <div className="rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-2.5 shadow-[var(--shadow-rest)]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500"
              aria-hidden
            />
            当前焦点
          </div>
          <p className="mt-1 truncate text-[13px] font-medium text-slate-900">
            {focusCase.title}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] text-slate-600">
            <span>{focusCase.stage}</span>
            {focusCase.nextDept && (
              <>
                <ArrowRight
                  className="h-3 w-3 text-slate-400"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>下一步 · {focusCase.nextDept}</span>
              </>
            )}
          </p>
          <Link
            to={`/agent/cases/${focusCase.id}`}
            className="focus-ring mt-1.5 inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-sm)] text-[12px] font-medium text-sky-700 hover:underline"
            data-testid="home-briefing-focus-link"
          >
            打开案子
            <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      )}

      {latest.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            最近动作
          </p>
          <ul className="space-y-1">
            {latest.map((l) => (
              <li
                key={l.id}
                className="flex items-start gap-2 rounded-[var(--radius-sm)] px-1.5 py-1 text-[12px] text-slate-700"
              >
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 leading-snug">{l.title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">
                    {l.dept}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
      )}
    </section>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: number
  tone?: 'amber'
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-slate-200 bg-white px-2.5 py-2 shadow-[var(--shadow-rest)]">
      <div className="flex items-center gap-1.5">
        <Icon
          className={`h-3.5 w-3.5 ${tone === 'amber' ? 'text-amber-700' : 'text-slate-500'}`}
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="truncate text-[11px] text-slate-600">{label}</span>
      </div>
      <p
        className={`mt-1 tabular text-[20px] font-semibold leading-none ${
          tone === 'amber' && value > 0 ? 'text-amber-700' : 'text-slate-900'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
