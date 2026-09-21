import { useMemo, useState } from 'react'
import { FileText, ScrollText } from 'lucide-react'
import {
  buildProgressiveArtifact,
  buildProgressiveWorklog,
} from '../../business/seatStepBodies'
import { SeatMarkdownBody } from '../business/SeatMarkdownBody'
import { getProjectExpert } from '../../projects/experts'
import { deliverableForExpert } from '../../projects/patentDeliverables'
import type { ProjectExpertId } from '../../projects/types'
import { useProjectFolder } from '../../projects/ProjectFolderContext'

type Props = {
  expertId: ProjectExpertId
  projectId?: string
  /** Default show worklog (过程可见硬规则) */
  defaultTab?: 'artifact' | 'worklog' | 'both'
}

/**
 * Dual-file panels: 成果 NN_*.md + 过程 NN_*_worklog.md
 * Spec: agent-patent-shell §3 / PROCESS_VISIBILITY
 * 有 projectId 时与业务面同一 progressive（agent-depth-reliability）
 */
export function SeatDualFilePanel({
  expertId,
  projectId,
  defaultTab = 'both',
}: Props) {
  const d = deliverableForExpert(expertId)
  const def = getProjectExpert(expertId)
  const { getThread } = useProjectFolder()
  const thread = projectId ? getThread(projectId, expertId) : undefined
  const submitted = !!thread?.artifactSubmitted
  const stepIndex = thread?.stepIndex ?? 0
  const [tab, setTab] = useState<'artifact' | 'worklog'>(
    defaultTab === 'artifact' ? 'artifact' : 'worklog',
  )

  const artifactBody = useMemo(() => {
    if (!d) return ''
    if (projectId && def.steps.length > 0) {
      return buildProgressiveArtifact(d, def.steps, stepIndex)
    }
    return d.sampleArtifact
  }, [d, def.steps, projectId, stepIndex])

  const worklogBody = useMemo(() => {
    if (!d) return ''
    if (projectId && def.steps.length > 0) {
      return buildProgressiveWorklog(d, def.steps, stepIndex)
    }
    return d.sampleWorklog
  }, [d, def.steps, projectId, stepIndex])

  if (!d) {
    return (
      <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-200 bg-slate-50/80 lg:flex">
        <div className="p-3 text-xs text-slate-400">本席暂无双文件约定</div>
      </aside>
    )
  }

  const showBoth = defaultTab === 'both'

  return (
    <aside
      className="hidden w-[min(20rem,36vw)] shrink-0 flex-col border-l border-slate-200 bg-white lg:flex"
      data-testid="seat-dual-file-panel"
    >
      <div className="flex shrink-0 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setTab('worklog')}
          className={`flex flex-1 items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold ${
            tab === 'worklog' || showBoth
              ? 'border-b-2 border-slate-900 text-slate-900'
              : 'text-slate-400'
          }`}
          data-testid="dual-tab-worklog"
        >
          <ScrollText className="h-3 w-3" aria-hidden />
          过程 worklog
        </button>
        <button
          type="button"
          onClick={() => setTab('artifact')}
          className={`flex flex-1 items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold ${
            tab === 'artifact'
              ? 'border-b-2 border-slate-900 text-slate-900'
              : 'text-slate-400'
          }`}
          data-testid="dual-tab-artifact"
        >
          <FileText className="h-3 w-3" aria-hidden />
          成果
          {submitted ? (
            <span className="rounded bg-emerald-100 px-1 text-[9px] text-emerald-800">
              已交卷
            </span>
          ) : null}
        </button>
      </div>

      {showBoth ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PanelBlock
            title={d.worklogFile}
            body={worklogBody}
            testId="dual-worklog-body"
            accent="amber"
          />
          <PanelBlock
            title={d.artifactFile}
            body={artifactBody}
            testId="dual-artifact-body"
            accent="sky"
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SeatMarkdownBody
            className="h-full max-h-none rounded-none border-0 p-2"
            data-testid={
              tab === 'worklog' ? 'dual-worklog-body' : 'dual-artifact-body'
            }
          >
            {tab === 'worklog' ? worklogBody : artifactBody}
          </SeatMarkdownBody>
        </div>
      )}

      <div className="shrink-0 border-t border-slate-100 px-2 py-1.5 text-[10px] text-slate-400">
        交卷 = 成果 + 过程 · 缺 worklog 不合格
      </div>
    </aside>
  )
}

function PanelBlock({
  title,
  body,
  testId,
  accent,
}: {
  title: string
  body: string
  testId: string
  accent: 'amber' | 'sky'
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-b border-slate-100 last:border-0">
      <div
        className={`shrink-0 px-2 py-1 font-mono text-[10px] font-semibold ${
          accent === 'amber' ? 'bg-amber-50 text-amber-900' : 'bg-sky-50 text-sky-900'
        }`}
      >
        {title}
      </div>
      <SeatMarkdownBody
        className="min-h-0 max-h-none flex-1 p-2"
        data-testid={testId}
      >
        {body}
      </SeatMarkdownBody>
    </div>
  )
}
