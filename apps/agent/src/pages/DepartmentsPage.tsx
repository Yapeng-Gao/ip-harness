import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ListChecks } from 'lucide-react'
import { useBusinessCases } from '../business/BusinessCaseContext'
import { useOrgConfig } from '../departments/OrgConfigContext'
import type { OrgDept } from '../departments/orgDepts'
import type { ProjectExpertId } from '../projects/types'
import { DeptChain, DeptGroups } from '../components/departments/DeptChain'
import { DeptBoard } from '../components/departments/DeptBoard'
import { CollabNetwork } from '../components/departments/CollabNetwork'
import { ExpertConfigDrawer } from '../components/departments/ExpertConfigDrawer'
import { OnboardingStrip } from '../components/departments/OnboardingStrip'
type View = 'org' | 'network' | 'board'

/**
 * 部门 · /agent/departments
 * HR 式组织页：首次配置 → 8 节点串联 → 前研 / 授权后 → 项目看板
 * 取代原 /agent/catalog（选专家建项目的动作移入部门卡）。
 */
export function DepartmentsPage() {
  const { enabledDepts } = useOrgConfig()
  const { getPendingConfirms } = useBusinessCases()
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
            部门
          </h1>
          <span className="text-[11px] text-slate-500">
            {enabledDepts.length} 个常设部门 · 每部一名主责
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/agent/pending"
              className="focus-ring hit-40 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              data-testid="departments-pending-link"
            >
              <ListChecks className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              待我确认
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
