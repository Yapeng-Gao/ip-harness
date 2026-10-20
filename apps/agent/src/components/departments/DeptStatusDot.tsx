import type { DeptStatus } from '../../departments/deptProgress'

const DOT: Record<DeptStatus, string> = {
  未到: 'bg-white border-slate-300',
  进行中: 'bg-sky-500 border-sky-500',
  待确认: 'bg-amber-500 border-amber-500',
  已完成: 'bg-emerald-600 border-emerald-600',
  退回: 'bg-rose-600 border-rose-600',
  锁定: 'bg-slate-300 border-slate-300',
}

const TEXT: Record<DeptStatus, string> = {
  未到: 'text-slate-500',
  进行中: 'text-sky-700',
  待确认: 'text-amber-800',
  已完成: 'text-emerald-700',
  退回: 'text-rose-700',
  锁定: 'text-slate-500',
}

/** 部门状态点 + 文案（与左栏点语义一致） */
export function DeptStatusDot({
  status,
  withLabel = true,
}: {
  status: DeptStatus
  withLabel?: boolean
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <span
        className={`inline-block h-2 w-2 rounded-full border ${DOT[status]}`}
        aria-hidden
      />
      {withLabel && (
        <span className={`text-[10px] font-medium ${TEXT[status]}`}>{status}</span>
      )}
    </span>
  )
}
