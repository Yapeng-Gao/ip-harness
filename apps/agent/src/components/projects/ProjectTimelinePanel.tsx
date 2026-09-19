import { Link } from 'react-router-dom'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import {
  getProjectExpert,
  isOrchestratorExpert,
} from '../../projects/experts'
import type { ProjectExpertId } from '../../projects/types'
import {
  generalBotPath,
  isGeneralShellId,
} from '../../projects/generalShell'

type Props = { projectId: string; currentExpertId?: ProjectExpertId }

const KIND_LABEL: Record<string, string> = {
  project_created: '创建',
  dispatch: '分派',
  expert_report: '回报',
  step: '步骤',
  hitl: '待确认',
  system: '系统',
}

export function ProjectTimelinePanel({ projectId, currentExpertId }: Props) {
  const { getTimeline, getDispatches, getProject } = useProjectFolder()
  const events = getTimeline(projectId)
  const dispatches = getDispatches(projectId)
  const project = getProject(projectId)
  const onlySeed =
    events.length === 1 && (events[0]?.kind === 'project_created' || events[0]?.kind === 'system')
  const sparse = events.length === 0 || onlySeed
  const orchId = project?.expertIds.find((id) => isOrchestratorExpert(id))
  const dispatchTargets =
    project?.expertIds.filter((id) => !isOrchestratorExpert(id)).slice(0, 3) ?? []

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-l border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-800">
        {isGeneralShellId(projectId) ? '壳时间线' : '项目时间线'}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {events.length === 0 ? (
          <div className="px-1 py-2" data-testid="project-timeline-empty">
            <p className="text-xs text-slate-500">还没有时间线事件</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              从总控分派任务后，分派与回报会显示在这里。
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="rounded-md border border-slate-100 bg-slate-50/80 px-2 py-1.5"
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="rounded bg-white px-1 py-px font-medium text-slate-600">
                    {KIND_LABEL[e.kind] ?? e.kind}
                  </span>
                  {e.expertId && (
                    <span>{getProjectExpert(e.expertId).name}</span>
                  )}
                  <span className="ml-auto">{e.at}</span>
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-slate-800">
                  {e.title}
                </div>
                <div className="mt-0.5 line-clamp-3 text-[10px] text-slate-500">
                  {e.detail}
                </div>
              </li>
            ))}
          </ul>
        )}
        {sparse && (
          <div
            className="mt-3 rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-2 py-2"
            data-testid="project-timeline-next"
          >
            <div className="text-[11px] font-semibold text-slate-700">下一步</div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              {currentExpertId && !isOrchestratorExpert(currentExpertId)
                ? '用中栏「推进一步」继续本席剧本；需要换席时再回总控分派。'
                : '在中栏用「分派给…」把任务交给专家，时间线会留下分派记录。'}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {orchId && currentExpertId !== orchId && (
                <Link
                  to={
                    isGeneralShellId(projectId)
                      ? generalBotPath(orchId)
                      : `/agent/projects/${projectId}`
                  }
                  className="btn-press focus-ring hit-40 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  data-testid="project-timeline-cta-orch"
                >
                  回总控分派
                </Link>
              )}
              {orchId && currentExpertId === orchId && (
                <p
                  className="text-[11px] text-slate-400"
                  data-testid="project-timeline-cta-orch"
                >
                  ← 请用中栏「分派给…」快捷
                </p>
              )}
              {dispatchTargets
                .filter((eid) => eid !== currentExpertId)
                .map((eid) => (
                <Link
                  key={eid}
                  to={
                    isGeneralShellId(projectId)
                      ? generalBotPath(eid)
                      : `/agent/projects/${projectId}/bots/${eid}`
                  }
                  className="btn-press focus-ring hit-40 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700"
                >
                  去{getProjectExpert(eid).name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      {dispatches.length > 0 && (
        <div className="border-t border-slate-100 px-2 py-2">
          <div className="mb-1 text-[10px] font-semibold uppercase text-slate-400">
            分派
          </div>
          <ul className="space-y-1">
            {dispatches.slice(0, 5).map((d) => (
              <li key={d.id} className="text-[10px] text-slate-600">
                <span className="font-medium">
                  {getProjectExpert(d.toExpertId).name}
                </span>
                {' · '}
                {d.status === 'open' ? '进行中' : '已回报'}
                <div className="truncate text-slate-400">{d.summary}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
