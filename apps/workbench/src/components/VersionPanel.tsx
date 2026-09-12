import { MessageSquareText, History } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import type { HandoffArtifactKey } from '@ip/domain/types'
import { HANDOFF_LABELS } from '@ip/contracts'

const panelCls = 'flat-card p-5'

export function VersionPanel({
  caseId,
  handoffKey,
}: {
  caseId: string
  handoffKey: HandoffArtifactKey
  /** @deprecated Reject lives in HandoffActionBar; kept for call-site compat */
  onAnnotateSubmit?: (annotation: string) => void
}) {
  const { role, getVersions, getCurrentVersionLabel, getHandoff } = useApp()
  const versions = getVersions(caseId, handoffKey)
  const current = getCurrentVersionLabel(caseId, handoffKey)
  const status = getHandoff(caseId, handoffKey)

  const showAgencyNotes =
    role === 'agency' &&
    (status === 'changes_requested' || versions.some((v) => !!v.annotation))

  const showEnterpriseHint =
    role === 'enterprise' &&
    ['submitted_to_enterprise', 'enterprise_review', 'approved'].includes(status)

  return (
    <div className={panelCls}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
          <History className="h-4 w-4 text-slate-700" />
          版本与批注
        </h3>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
          当前 {current}
        </span>
      </div>

      {versions.length === 0 ? (
        <p className="text-xs text-slate-500">
          暂无版本记录。提交 / 批准 / 退回修改时会自动生成。
        </p>
      ) : (
        <ul className="mb-3 max-h-48 space-y-2 overflow-y-auto">
          {[...versions].reverse().map((v) => (
            <li
              key={v.id}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-800">{v.version}</span>
                <span className="text-slate-500">{v.at}</span>
                <span className="text-slate-500">
                  {v.byRole === 'enterprise' ? '企业 IP' : '代理所'}
                </span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                  {HANDOFF_LABELS[v.status]}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{v.note}</p>
              {v.annotation && (
                <p className="mt-1 flex gap-1 rounded bg-amber-50 px-2 py-1 text-amber-800">
                  <MessageSquareText className="mt-0.5 h-3 w-3 shrink-0" />
                  批注：{v.annotation}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {showAgencyNotes && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <div className="mb-1 font-medium">企业退回批注</div>
          {versions.filter((v) => v.annotation).length === 0 ? (
            <p>请按企业意见修改后重新提交。</p>
          ) : (
            versions
              .filter((v) => v.annotation)
              .slice(-3)
              .map((v) => (
                <p key={v.id} className="mt-0.5">
                  [{v.version}] {v.annotation}
                </p>
              ))
          )}
        </div>
      )}

      {showEnterpriseHint && (
        <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
          企业退回请使用下方交接栏的「退回修改」主入口；此处仅保留版本与批注历史。
        </div>
      )}
    </div>
  )
}

export function CurrentVersionBadge({
  caseId,
  handoffKey,
}: {
  caseId: string
  handoffKey: HandoffArtifactKey
}) {
  const { getCurrentVersionLabel } = useApp()
  const label = getCurrentVersionLabel(caseId, handoffKey)
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
      {label}
    </span>
  )
}
