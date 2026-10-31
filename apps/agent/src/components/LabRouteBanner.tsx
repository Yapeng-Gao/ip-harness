import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'

type Props = {
  /** projects = 旧双轨；lab = 实验室壳 */
  kind?: 'lab' | 'projects'
  className?: string
}

/**
 * 旁路/实验室顶条 · 扫描 P1/P2：不抢主链（大厅→案→部）
 */
export function LabRouteBanner({ kind = 'lab', className = '' }: Props) {
  const isProjects = kind === 'projects'
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 bg-amber-50 px-3 py-2 text-[12px] text-amber-950 ${className}`}
      data-testid="lab-route-banner"
      data-lab-kind={kind}
      role="status"
    >
      <p className="flex min-w-0 items-center gap-1.5">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          {isProjects ? (
            <>
              <strong>旧项目专家台</strong>
              （旁路）· 主路径是大厅 → 案卷 → 八部工作台
            </>
          ) : (
            <>
              <strong>实验室 / 遗骸入口</strong>
              · 非 Novada 主路径；请勿当公司办事主屏
            </>
          )}
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/agent"
          className="btn-press focus-ring rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white"
          data-testid="lab-banner-to-hall"
        >
          回大厅
        </Link>
        <Link
          to="/agent/cases"
          className="btn-press focus-ring rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-950"
          data-testid="lab-banner-to-cases"
        >
          去案盘
        </Link>
      </div>
    </div>
  )
}
