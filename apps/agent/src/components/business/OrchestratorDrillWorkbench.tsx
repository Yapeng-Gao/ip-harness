import { useMemo, useState } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  DRILL_CLUSTERS,
  DRILL_ORCH_ID,
  DRILL_OWNER_IDS,
  drillDispatchBrief,
  drillSeatLabel,
} from '../../business/drillRoster'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { ProjectExpertId } from '../../projects/types'
import { CaseProcessPanel } from './CaseProcessPanel'

type Props = {
  caseId: string
  onSwitchSeat?: (seatId: ProjectExpertId) => void
}

/**
 * 演练旁路 · 总控工作面：分派 / 双文件验收 / 转 Word / 过程
 */
export function OrchestratorDrillWorkbench({ caseId, onSwitchSeat }: Props) {
  const {
    dispatchDrillSeat,
    acceptDrillDualFile,
    recordWordExportHint,
    getPendingConfirms,
  } = useBusinessCases()
  const { getThread } = useProjectFolder()
  const thread = getThread(caseId, DRILL_ORCH_ID)
  const [flash, setFlash] = useState<string | null>(null)
  const [target, setTarget] = useState<ProjectExpertId>('expert-research')
  const [acceptSeat, setAcceptSeat] = useState<ProjectExpertId>('expert-research')
  const pending = getPendingConfirms(caseId)

  const messages = thread?.messages ?? []

  const onDispatch = () => {
    const r = dispatchDrillSeat(caseId, target)
    if (r.ok) {
      setFlash(`已分派 · ${drillSeatLabel(target)}`)
      if (r.switchToSeat) onSwitchSeat?.(r.switchToSeat)
    } else {
      setFlash(r.reason ?? '分派失败')
    }
  }

  const onAccept = (ok: boolean) => {
    const r = acceptDrillDualFile(
      caseId,
      acceptSeat,
      ok,
      ok ? undefined : '过程或缺关键取舍 · 请补再交',
    )
    if (r.ok) {
      setFlash(ok ? `验收通过 · ${drillSeatLabel(acceptSeat)}` : `已退回 · ${drillSeatLabel(acceptSeat)}`)
      if (!ok) onSwitchSeat?.(acceptSeat)
    } else {
      setFlash(r.reason ?? '操作失败')
    }
  }

  const ownerOptions = useMemo(() => DRILL_OWNER_IDS, [])

  return (
    <div
      className="flex flex-col gap-3"
      data-testid="orchestrator-drill-workbench"
      data-drill="1"
    >
      <header className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2.5">
        <h2 className="text-sm font-semibold text-indigo-950">总控 · 演练调度台</h2>
        <p className="mt-0.5 text-[11px] text-indigo-900/80">
          样机旁路 · 分派 / 双文件验收 / 转 Word · 不替代「待我确认」闸门
          {pending.length > 0 ? ` · 本案仍有 ${pending.length} 项待人确认` : ''}
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="text-[11px] font-semibold text-slate-700">分派到席</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as ProjectExpertId)}
            className="focus-ring rounded-md border border-slate-200 px-2 py-1.5 text-xs"
            data-testid="drill-dispatch-select"
          >
            {DRILL_CLUSTERS.map((c) => (
              <optgroup key={c.id} label={c.title}>
                {c.seatIds.map((id) => (
                  <option key={id} value={id}>
                    {drillSeatLabel(id)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            onClick={onDispatch}
            className="btn-press focus-ring rounded-md bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white"
            data-testid="drill-dispatch-submit"
          >
            分派
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-500">
          {drillDispatchBrief(target)}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="text-[11px] font-semibold text-slate-700">双文件验收</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={acceptSeat}
            onChange={(e) => setAcceptSeat(e.target.value as ProjectExpertId)}
            className="focus-ring rounded-md border border-slate-200 px-2 py-1.5 text-xs"
            data-testid="drill-accept-select"
          >
            {ownerOptions.map((id) => (
              <option key={id} value={id}>
                {drillSeatLabel(id)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onAccept(true)}
            className="btn-press focus-ring rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
            data-testid="drill-accept-pass"
          >
            验收通过
          </button>
          <button
            type="button"
            onClick={() => onAccept(false)}
            className="btn-press focus-ring rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-900"
            data-testid="drill-accept-fail"
          >
            不过 · 退回 owner
          </button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            recordWordExportHint(caseId)
            setFlash('已示意转 Word')
          }}
          className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800"
          data-testid="drill-word-hint"
        >
          转 Word（示意）
        </button>
      </div>

      {flash && (
        <p
          className="text-[11px] font-medium text-emerald-700"
          role="status"
          data-testid="drill-flash"
        >
          {flash}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700">
          总控会话
        </h3>
        <div
          className="max-h-48 space-y-2 overflow-y-auto px-3 py-2"
          data-testid="drill-orch-chat"
        >
          {messages.length === 0 ? (
            <p className="text-[11px] text-slate-400">尚无消息 · 先分派一席</p>
          ) : (
            messages.slice(-12).map((m) => (
              <div
                key={m.id}
                className="rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700 whitespace-pre-wrap"
              >
                {m.content}
              </div>
            ))
          )}
        </div>
      </section>

      <CaseProcessPanel caseId={caseId} />
    </div>
  )
}
