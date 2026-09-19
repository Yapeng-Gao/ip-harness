import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { getProjectExpert } from '../../projects/experts'

type Props = { projectId: string }

const KIND_LABEL: Record<string, string> = {
  project_created: '创建',
  dispatch: '分派',
  expert_report: '回报',
  step: '步骤',
  hitl: 'HITL',
  system: '系统',
}

export function ProjectTimelinePanel({ projectId }: Props) {
  const { getTimeline, getDispatches } = useProjectFolder()
  const events = getTimeline(projectId)
  const dispatches = getDispatches(projectId)

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-l border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-800">
        项目时间线
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {events.length === 0 ? (
          <p className="px-1 text-[11px] text-slate-400">暂无事件</p>
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
