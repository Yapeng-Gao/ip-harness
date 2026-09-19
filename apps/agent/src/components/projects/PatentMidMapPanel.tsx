import { midCaseHref } from '../../lib/deepLinks'
import { getProjectExpert } from '../../projects/experts'
import { PATENT_MID_MAP, midMapForExpert } from '../../projects/patentMidMap'
import type { DomainCommandWriteLog, ProjectExpertId } from '../../projects/types'
import { useProjectFolder } from '../../projects/ProjectFolderContext'

type Props = {
  projectId: string
  expertId: ProjectExpertId
  caseId?: string
}

/** L3 · patent bot → mid node mapping + DomainCommand write log (prototype). */
export function PatentMidMapPanel({ projectId, expertId, caseId }: Props) {
  const { getDomainCommandWrites } = useProjectFolder()
  const row = midMapForExpert(expertId)
  const writes = getDomainCommandWrites(projectId)
  const midHref = caseId ? midCaseHref(caseId) : midCaseHref('case-mock-l3')

  return (
    <aside
      className="flex w-64 shrink-0 flex-col border-l border-slate-200 bg-slate-50/80"
      data-testid="patent-mid-map-panel"
    >
      <div className="border-b border-slate-200 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">
          L3 · 中台映射
        </div>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
          产出对齐 handoff / DomainCommand；案态以 mid 为准（样机示意）
        </p>
      </div>

      {row ? (
        <div
          className="space-y-1.5 border-b border-slate-200 px-3 py-2"
          data-testid="patent-mid-map-current"
        >
          <div className="text-[11px] font-medium text-slate-800">
            {getProjectExpert(expertId).name}
          </div>
          <div className="rounded border border-violet-200 bg-white px-2 py-1.5 text-[10px] text-slate-700">
            <div>
              <span className="text-slate-400">阶段/节点 · </span>
              {row.midStageLabel}
            </div>
            <div className="mt-0.5">
              <span className="text-slate-400">Handoff · </span>
              {row.handoffKeys?.join(' · ') ?? '—（无直接写）'}
            </div>
            <div className="mt-0.5">
              <span className="text-slate-400">写候选 · </span>
              {row.writeCommands?.join(' · ') ?? 'null'}
            </div>
            <div className="mt-1 text-[10px] text-amber-800">{row.honesty}</div>
          </div>
          <a
            href={midHref}
            target="_blank"
            rel="noreferrer"
            className="btn-press focus-ring inline-flex text-[10px] font-medium text-violet-700 underline-offset-2 hover:underline"
            data-testid="patent-mid-case-link"
          >
            深链 mid 案详（示意）
          </a>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="mb-1 px-1 text-[10px] font-semibold text-slate-500">
          固定专家 → 节点
        </div>
        <ul className="space-y-1">
          {PATENT_MID_MAP.map((r) => {
            const active = r.expertId === expertId
            return (
              <li
                key={r.expertId}
                className={`rounded border px-2 py-1 text-[10px] ${
                  active
                    ? 'border-violet-300 bg-violet-50 text-violet-950'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <div className="font-medium">
                  {getProjectExpert(r.expertId).name}
                </div>
                <div className="text-slate-400">{r.midStageLabel}</div>
              </li>
            )
          })}
        </ul>

        <div className="mb-1 mt-3 px-1 text-[10px] font-semibold text-slate-500">
          Confirm → DomainCommand 写库示意
        </div>
        {writes.length === 0 ? (
          <p
            className="px-1 text-[10px] text-slate-400"
            data-testid="patent-dc-writes-empty"
          >
            尚未写入。走撰稿 Confirm 或点总控「演示 L3」。
          </p>
        ) : (
          <ul className="space-y-1" data-testid="patent-dc-writes">
            {writes.map((w: DomainCommandWriteLog) => (
              <li
                key={w.id}
                className="rounded border border-emerald-200 bg-emerald-50/80 px-2 py-1.5 text-[10px] text-emerald-950"
              >
                <div className="font-semibold">{w.command}</div>
                <div className="mt-0.5 font-mono text-[9px] text-emerald-800">
                  {JSON.stringify(w.payload)}
                </div>
                <div className="mt-0.5 text-emerald-700">{w.note}</div>
                {w.midCaseHref ? (
                  <a
                    href={w.midCaseHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-block text-violet-700 underline"
                  >
                    mid 案详
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
