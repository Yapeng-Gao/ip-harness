import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Library } from 'lucide-react'
import { useOrgConfig } from '../departments/OrgConfigContext'
import type { OrgDept, OrgSeatId } from '../departments/orgDepts'
import { DeptChain } from '../components/departments/DeptChain'
import { DeptExpertsDialog } from '../components/departments/DeptExpertsDialog'
import { ExpertConfigDrawer } from '../components/departments/ExpertConfigDrawer'
import { CapabilityLibraryDialog } from '../components/departments/CapabilityLibraryDialog'

/**
 * 编制 · 部门管理
 * 部门 → 专家；专家 → 挂能力；能力库单独管本事条目。
 */
export function DepartmentsPage() {
  const { enabledDepts, capabilities } = useOrgConfig()

  const [openDept, setOpenDept] = useState<OrgDept | null>(null)
  const [libOpen, setLibOpen] = useState(false)
  const [config, setConfig] = useState<{
    seatId: OrgSeatId
    dept: OrgDept
    name: string
  } | null>(null)

  const mainCount = useMemo(
    () => Math.min(8, enabledDepts.length),
    [enabledDepts.length],
  )

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f5f5f7]"
      data-testid="departments-page"
      data-departments="mgmt-v4"
    >
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-start gap-2">
            <Building2
              className="mt-0.5 h-4 w-4 text-slate-600"
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-[18px] font-semibold text-slate-900">
                部门管理
              </h1>
              <p
                className="mt-1 text-[13px] leading-snug text-slate-600"
                data-testid="departments-promise"
              >
                部门管人，能力库管本事；专家从库里挂接。办活请回大厅。
              </p>
            </div>
          </div>

          <ol
            className="mt-3 space-y-1 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-[12px] leading-snug text-slate-700"
            data-testid="departments-howto"
          >
            <li>
              <span className="font-semibold text-slate-900">1.</span>{' '}
              先开「能力库」维护公司有哪些本事（可新增）
            </li>
            <li>
              <span className="font-semibold text-slate-900">2.</span>{' '}
              点部门 → 管专家（启用建议岗 / 自定义加人）
            </li>
            <li>
              <span className="font-semibold text-slate-900">3.</span>{' '}
              点专家 → 从能力库挂「会哪些本事」
            </li>
          </ol>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLibOpen(true)}
              className="btn-press focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white hover:bg-slate-800"
              data-testid="departments-open-cap-lib"
            >
              <Library className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              能力库 · {capabilities.length}
            </button>
            <Link
              to="/agent"
              className="btn-press focus-ring inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              data-testid="departments-to-hall"
            >
              回大厅办活
            </Link>
            <span className="text-[11px] text-slate-400">
              主链已开 {mainCount}/8 · 配置仅本机
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 py-4 sm:px-6">
        <DeptChain onOpenDept={setOpenDept} />
      </div>

      {libOpen ? (
        <CapabilityLibraryDialog onClose={() => setLibOpen(false)} />
      ) : null}

      {openDept ? (
        <DeptExpertsDialog
          dept={openDept}
          onClose={() => setOpenDept(null)}
          onEditExpert={(seatId, name) =>
            setConfig({ seatId, dept: openDept, name })
          }
        />
      ) : null}

      {config ? (
        <ExpertConfigDrawer
          seatId={config.seatId}
          dept={config.dept}
          displayName={config.name}
          onClose={() => setConfig(null)}
        />
      ) : null}
    </div>
  )
}
