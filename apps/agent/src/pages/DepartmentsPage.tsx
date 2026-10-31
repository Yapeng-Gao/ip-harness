import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ListChecks } from 'lucide-react'
import { useBusinessCases } from '../business/BusinessCaseContext'
import { useOrgConfig } from '../departments/OrgConfigContext'
import { HALL_DEPT_DOORS } from '../business/hallDepts'
import { pickLatestCaseId } from '../business/entryRole'
import type { OrgDept } from '../departments/orgDepts'
import type { ProjectExpertId } from '../projects/types'
import { DeptChain, DeptGroups } from '../components/departments/DeptChain'
import { DeptBoard } from '../components/departments/DeptBoard'
import { CollabNetwork } from '../components/departments/CollabNetwork'
import { ExpertConfigDrawer } from '../components/departments/ExpertConfigDrawer'
import { OnboardingStrip } from '../components/departments/OnboardingStrip'
type View = 'org' | 'network' | 'board'

/**
 * 专业/编制 · /agent/departments
 * 对齐编制总览：让该部能开工。作业主路径仍是大厅 → 公司案 → 部门工作台。
 */
export function DepartmentsPage() {
  const { enabledDepts } = useOrgConfig()
  const { getPendingConfirms, cases, getProgress, getProcessLogs } = useBusinessCases()
  const latestId = pickLatestCaseId(
    cases,
    (id) => getProgress(id).updatedAt,
    (id) => {
      const logs = getProcessLogs(id)
      if (!logs.length) return undefined
      return logs.reduce((max, l) => (l.at > max ? l.at : max), logs[0]!.at)
    },
  )
  const [view, setView] = useState<View>('org')
  const [config, setConfig] = useState<{ seatId: ProjectExpertId; dept: OrgDept } | null>(
    null,
  )

  const pending = getPendingConfirms()

  const counts = useMemo(() => {
    const byDept = new Map<string, number>()
    for (const d of enabledDepts) byDept.set(d.id, 0)
    return { total: pending.length, byDept }
  }, [enabledDepts, pending.length])

  const onConfigure = (seatId: ProjectExpertId, dept: OrgDept) =>
    setConfig({ seatId, dept })

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f5f5f7]"
      data-testid="departments-page"
    >
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-3.5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-600" strokeWidth={1.75} aria-hidden />
          <h1 className="text-[16px] font-semibold tracking-tight text-slate-900">
            专业 / 编制
          </h1>
          <span className="text-[11px] text-slate-500">
            全库配置旁路 · 作业以{' '}
            <Link
              to="/agent/cases"
              className="font-medium text-sky-700 hover:underline"
              data-testid="departments-to-cases"
            >
              案子 → 公司首页八部
            </Link>{' '}
            为主 · {enabledDepts.length} 个常设部门
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/agent/pending?audit=1"
              className="focus-ring hit-40 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              data-testid="departments-pending-link"
            >
              <ListChecks className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              待确认审计
              {counts.total > 0 && (
                <span className="tabular rounded-full bg-amber-600 px-1.5 py-px text-[10px] font-semibold text-white">
                  {counts.total > 9 ? '9+' : counts.total}
                </span>
              )}
            </Link>

            <div
              className="segmented"
              role="group"
              aria-label="部门视图"
              data-testid="dept-view-switch"
            >
              <button
                type="button"
                onClick={() => setView('org')}
                aria-pressed={view === 'org'}
                className="segmented-item inline-flex items-center gap-1"
                data-testid="dept-view-org"
              >
                组织架构
              </button>
              <button
                type="button"
                onClick={() => setView('network')}
                aria-pressed={view === 'network'}
                className="segmented-item inline-flex items-center gap-1"
                data-testid="dept-view-network"
              >
                协作网络
              </button>
              <button
                type="button"
                onClick={() => setView('board')}
                aria-pressed={view === 'board'}
                className="segmented-item inline-flex items-center gap-1"
                data-testid="dept-view-board"
              >
                项目看板
              </button>
            </div>
          </div>
        </div>
      </header>

      <section
        className="shrink-0 border-b border-slate-200/70 bg-white px-5 py-3 sm:px-6"
        data-testid="departments-start-dept"
        aria-labelledby="departments-start-title"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            id="departments-start-title"
            className="text-[13px] font-semibold text-slate-900"
          >
            让该部开工
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            编制在此配置；开工作业仍进公司案 → 八部工作台（非本页假装交卷）。
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5" data-testid="departments-eight-doors">
            {HALL_DEPT_DOORS.map((d) => (
              <li key={d.deptId}>
                <Link
                  to={
                    latestId
                      ? `/agent/cases/${latestId}/depts/${d.slug}`
                      : '/agent/cases/new'
                  }
                  className="btn-press focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-white"
                  data-testid={`departments-door-${d.slug}`}
                >
                  <span className="text-slate-400">{d.num}</span>
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>


      <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-6">
        <OnboardingStrip onConfigure={onConfigure} />

        {view === 'org' ? (
          <div className="mt-4">
            <DeptChain onConfigure={onConfigure} />
            <DeptGroups onConfigure={onConfigure} />
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              样机 · 部门 / 专家 / skill 为产品心智，不接真组织 IAM；配置只在本机保存 · 部门闸只由主责交卷，副席不进待确认
            </p>
          </div>
        ) : view === 'network' ? (
          <div className="mt-4">
            <CollabNetwork />
          </div>
        ) : (
          <div className="mt-1">
            <DeptBoard />
          </div>
        )}
      </div>

      {config && (
        <ExpertConfigDrawer
          seatId={config.seatId}
          dept={config.dept}
          onClose={() => setConfig(null)}
        />
      )}
    </div>
  )
}
