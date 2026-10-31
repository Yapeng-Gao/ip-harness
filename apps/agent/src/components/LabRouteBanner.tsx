import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'

type Props = {
  /** projects = 遗留项目夹旁路；lab = 实验室壳 */
  kind?: 'lab' | 'projects'
  className?: string
}

/**
 * 旁路/实验室顶条 · 不抢一期主链（大厅接待+八部 → 公司 → 部台）
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
              <strong>遗留项目夹</strong>
              （旁路）· 一期主路径是大厅接待+八部 → 公司案 → 部台
            </>
          ) : (
            <>
              <strong>实验室 / 旁路壳</strong>
              · 非一期主路径（大厅→公司→部台）；会话/沙箱/多 bot 仅实验，硬请示与工单请回部台
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
      <p
        className="basis-full text-[10px] leading-snug text-amber-900/70"
        data-testid="lab-banner-gate"
      >
        闸：本页不承接硬请示 / 部间工单 / 判断档案；那些只在公司案→部台。
      </p>
    </div>
  )
}
