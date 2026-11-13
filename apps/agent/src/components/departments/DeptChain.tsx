import { ChevronRight } from 'lucide-react'
import { getProjectExpert } from '../../projects/experts'
import { ExpertAvatar } from './ExpertAvatar'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import { MAIN_CHAIN_DEPTS, type OrgDept } from '../../departments/orgDepts'
import { buildDeptExpertList } from './DeptExpertsDialog'

type Props = {
  onOpenDept: (dept: OrgDept) => void
}

/**
 * 八部主链列表 · 点部门条 → 弹窗管专家
 */
export function DeptChain({ onOpenDept }: Props) {
  const { deptLabel, deptConfigs } = useOrgConfig()

  return (
    <section aria-labelledby="dept-chain-title" data-testid="dept-chain">
      <div className="mb-2.5 flex flex-wrap items-baseline gap-2">
        <h2
          id="dept-chain-title"
          className="text-[13px] font-semibold text-slate-900"
        >
          八部岗表
        </h2>
        <span className="text-[11px] text-slate-500">
          点部门 → 管专家 · 点专家 → 改能力
        </span>
      </div>

      <ol className="space-y-2" role="list">
        {MAIN_CHAIN_DEPTS.map((dept, i) => {
          const label = deptLabel(dept)
          const enabled = deptConfigs[dept.id]?.enabled !== false
          const extras = deptConfigs[dept.id]?.extraExperts ?? []
          const rows = buildDeptExpertList(dept, extras)
          const activeCount = rows.filter((r) => r.seatId != null).length
          const lead = getProjectExpert(dept.leadSeatId)

          return (
            <li key={dept.id}>
              <button
                type="button"
                onClick={() => onOpenDept(dept)}
                className={`btn-press focus-ring flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                  enabled
                    ? 'border-slate-200'
                    : 'border-slate-200/80 opacity-70'
                }`}
                data-testid={`dept-card-${dept.id}`}
                data-enabled={enabled ? '1' : '0'}
              >
                <span className="shrink-0 tabular text-[10px] font-semibold text-slate-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ExpertAvatar
                  name={lead?.name ?? dept.leadSeatId}
                  size="sm"
                  seed={dept.leadSeatId}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-[13px] font-semibold text-slate-900">
                      {label}
                    </span>
                    {!enabled ? (
                      <span className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-600">
                        已关
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-slate-600">
                    {lead?.name ?? dept.leadSeatId} · {activeCount} 位专家
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-400"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
