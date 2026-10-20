import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, Table2 } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import { MAIN_CHAIN_DEPTS } from '../../departments/orgDepts'
import {
  confirmKindOf,
  deptStatus,
  type DeptStatus,
} from '../../departments/deptProgress'
import { DeptStatusDot } from './DeptStatusDot'

type View = 'org' | 'board'

/**
 * 部门页 · 组织架构 / 项目看板 两视图
 * 看板是 项目 × 部门 的状态矩阵，全部读既有 context。
 */
export function DeptViewSwitch() {
  const [view, setView] = useState<View>('org')
  return (
    <div
      className="segmented"
      role="group"
      aria-label="部门视图"
      data-testid="dept-view-switch"
    >
      {(
        [
          { id: 'org', label: '组织架构', Icon: LayoutGrid },
          { id: 'board', label: '项目看板', Icon: Table2 },
        ] as const
      ).map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          aria-pressed={view === id}
          className="segmented-item inline-flex items-center gap-1"
          data-testid={`dept-view-${id}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          {label}
        </button>
      ))}
      <span className="sr-only">当前视图：{view === 'org' ? '组织架构' : '项目看板'}</span>
    </div>
  )
}

/** 项目 × 部门 矩阵 */
export function DeptBoard() {
  const { cases, getProgress, getPendingConfirms } = useBusinessCases()
  const { folderProjects } = useProjectFolder()
  const { deptLabel } = useOrgConfig()
  const pending = getPendingConfirms()

  const rows = useMemo(
    () =>
      folderProjects.map((p) => {
        const isCase = cases.some((c) => c.id === p.id)
        return { project: p, isCase }
      }),
    [folderProjects, cases],
  )

  if (rows.length === 0) {
    return (
      <div className="ui-empty mt-4 max-w-xl" data-testid="dept-board-empty">
        <p className="ui-empty-title">还没有项目</p>
        <p className="ui-empty-desc">从首页或「项目模式」建一个，这里会出现每个部门的推进状态。</p>
        <Link
          to="/agent/projects"
          className="focus-ring mt-1 inline-flex min-h-9 items-center rounded-[var(--radius-sm)] bg-slate-900 px-3 text-[12px] font-medium text-white"
        >
          去建项目
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-3 overflow-x-auto" data-testid="dept-board">
      <table className="ui-table min-w-[860px]">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 bg-[#f5f5f7]">
              项目
            </th>
            {MAIN_CHAIN_DEPTS.map((d) => (
              <th key={d.id} scope="col" className="whitespace-nowrap text-center">
                {deptLabel(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ project, isCase }) => (
            <tr key={project.id}>
              <th scope="row" className="sticky left-0 bg-white text-left font-medium">
                <Link
                  to={
                    isCase
                      ? `/agent/cases/${project.id}`
                      : `/agent/projects/${project.id}`
                  }
                  className="focus-ring rounded-sm text-[12px] text-slate-900 hover:underline"
                >
                  {project.title}
                </Link>
                {!isCase && (
                  <span className="ml-1.5 text-[10px] text-slate-500">未转案</span>
                )}
              </th>
              {MAIN_CHAIN_DEPTS.map((d) => {
                const kind = confirmKindOf(d)
                const progress = isCase ? getProgress(project.id) : null
                const mine = kind
                  ? pending.filter((p) => p.caseId === project.id && p.kind === kind)
                  : []
                const status: DeptStatus = progress
                  ? deptStatus({ dept: d, progress, pending: mine, confirmKind: kind })
                  : '锁定'
                return (
                  <td key={d.id} className="text-center">
                    <span className="inline-flex justify-center">
                      <DeptStatusDot status={status} withLabel={false} />
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-slate-500">
        样机 · 未转案的项目显示为锁定；点项目名进入工作区
      </p>
    </div>
  )
}

/** 供部门页组合：视图切换 + 条件渲染 */
export function useDeptView(): View {
  return 'org'
}
