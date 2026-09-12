import type { CaseContextSnapshot } from '../domain/caseContextContract'
import {
  CASE_CONTEXT_SCHEMA_VERSION,
  caseContextVersionLabel,
  summarizeCaseContext,
} from '../domain/caseContextContract'

type Props = {
  snap: CaseContextSnapshot | null | undefined
  /** Compact for agent sidebar */
  compact?: boolean
  className?: string
  /** Start expanded */
  defaultOpen?: boolean
}

/**
 * 只读「上下文契约 vX」摘要（可折叠）
 */
export function CaseContextContractPanel({
  snap,
  compact = false,
  className = '',
  defaultOpen = false,
}: Props) {
  const version = snap?.schemaVersion ?? CASE_CONTEXT_SCHEMA_VERSION
  const title = caseContextVersionLabel(version)

  if (!snap) {
    return (
      <details
        className={`border border-slate-200 bg-slate-50/80 ${compact ? 'rounded-lg' : 'rounded-xl'} ${className}`}
      >
        <summary
          className={`cursor-pointer font-medium text-slate-500 hover:text-slate-700 ${
            compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-2.5 text-xs'
          }`}
        >
          {title}
          <span className="ml-1.5 font-normal text-slate-400">· 无案级快照</span>
        </summary>
        <p
          className={`border-t border-slate-100 text-slate-400 ${
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-xs'
          }`}
        >
          未关联案件时无法 build 契约快照。绑定案件后由 buildCaseContext 生成。
        </p>
      </details>
    )
  }

  const lines = summarizeCaseContext(snap)

  return (
    <details
      open={defaultOpen || undefined}
      className={`border border-slate-200 bg-white ${compact ? 'rounded-lg' : 'rounded-xl'} ${className}`}
    >
      <summary
        className={`cursor-pointer font-medium text-slate-600 hover:text-slate-800 ${
          compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-2.5 text-xs'
        }`}
      >
        <span className="tabular-nums">{title}</span>
        <span className="ml-1.5 font-normal text-slate-400">
          · {snap.stageName}
          {snap.checklist.complete ? ' · 清单齐' : ''}
          {snap.sessionBind
            ? snap.sessionBind.aligned
              ? ' · 会话对齐'
              : ' · 会话未对齐'
            : ''}
          <span className="ml-1 text-slate-300">只读</span>
        </span>
      </summary>
      <div
        className={`border-t border-slate-100 space-y-1 ${
          compact ? 'px-3 py-2' : 'px-4 py-3'
        }`}
      >
        <ul className={`space-y-1 text-slate-600 ${compact ? 'text-[11px]' : 'text-xs'}`}>
          {lines.map((line) => (
            <li key={line} className="leading-relaxed break-words">
              {line}
            </li>
          ))}
        </ul>
        <p className={`pt-1 text-slate-400 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
          契约纪律：字段/语义变更须 bump CASE_CONTEXT_SCHEMA_VERSION（见 HARNESS.md）
        </p>
      </div>
    </details>
  )
}
