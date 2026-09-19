import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  expertIdsForKind,
  getProjectExpert,
  isOrchestratorExpert,
  orchestratorIdForProject,
} from './experts'
import type {
  AgentProject,
  DomainPackId,
  ProjectChatMessage,
  ProjectDispatch,
  ProjectDispatchExpertId,
  ProjectExpertId,
  CaseBindState,
  ProjectKind,
  ProjectThread,
  ProjectTimelineEvent,
} from './types'

function nowIso(): string {
  return new Date().toISOString()
}

function stamp(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyThread(
  projectId: string,
  expertId: ProjectExpertId,
): ProjectThread {
  const def = getProjectExpert(expertId)
  const intro = def.steps[0]?.script ?? `${def.name} 已就绪。`
  return {
    id: uid(`thr-${expertId}`),
    projectId,
    expertId,
    kind: isOrchestratorExpert(expertId) ? 'orchestrator' : 'expert',
    title: def.name,
    messages: [
      {
        id: uid('msg'),
        role: 'system',
        content: `项目协作 · 总控编排\n${intro}`,
        at: stamp(),
        meta: { backend: 'mock', stepId: def.steps[0]?.id },
      },
    ],
    stepIndex: 0,
    updatedAt: nowIso(),
  }
}

const DEMO_PATENT_ID = 'proj-demo-patent'
const DEMO_GENERAL_ID = 'proj-demo-general'

function buildDemo(): {
  projects: AgentProject[]
  threads: ProjectThread[]
  timeline: ProjectTimelineEvent[]
  dispatches: ProjectDispatch[]
} {
  const patentIds = expertIdsForKind('domain', 'patent')
  const generalIds = expertIdsForKind('general')
  const patent: AgentProject = {
    id: DEMO_PATENT_ID,
    title: '边缘调度模组 · 专利演示',
    summary: 'domain/patent：总控 + 检索/撰稿/FTO',
    kind: 'domain',
    domainPackId: 'patent',
    caseBindState: 'none',
    expertIds: [...patentIds],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const general: AgentProject = {
    id: DEMO_GENERAL_ID,
    title: '课题协作 · 通用演示',
    summary: 'general：总控 + 研究/写作/审查（无专利步骤）',
    kind: 'general',
    caseBindState: 'none',
    expertIds: [...generalIds],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const threads = [
    ...patentIds.map((id) => emptyThread(patent.id, id)),
    ...generalIds.map((id) => emptyThread(general.id, id)),
  ]
  const timeline: ProjectTimelineEvent[] = [
    {
      id: uid('tl'),
      projectId: patent.id,
      kind: 'project_created',
      title: '专利演示项目已种子',
      detail: '专利领域 · 总控 + 检索/撰稿/FTO',
      at: stamp(),
    },
    {
      id: uid('tl'),
      projectId: general.id,
      kind: 'project_created',
      title: '通用演示项目已种子',
      detail: 'general · 总控 + 研究/写作/审查 · 无专利步骤',
      at: stamp(),
    },
  ]
  return {
    projects: [general, patent],
    threads,
    timeline,
    dispatches: [],
  }
}

type ProjectFolderContextValue = {
  projects: AgentProject[]
  createProject: (input: {
    title: string
    summary?: string
    kind: ProjectKind
    domainPackId?: DomainPackId
    caseId?: string
  }) => AgentProject
  getProject: (id: string) => AgentProject | undefined
  getThread: (
    projectId: string,
    expertId: ProjectExpertId,
  ) => ProjectThread | undefined
  getTimeline: (projectId: string) => ProjectTimelineEvent[]
  getDispatches: (projectId: string) => ProjectDispatch[]
  appendMessage: (
    projectId: string,
    expertId: ProjectExpertId,
    msg: Omit<ProjectChatMessage, 'id' | 'at'> & { at?: string },
  ) => void
  advanceStep: (projectId: string, expertId: ProjectExpertId) => void
  jumpToStep: (
    projectId: string,
    expertId: ProjectExpertId,
    stepId: string,
  ) => void
  dispatchToExpert: (input: {
    projectId: string
    toExpertId: ProjectDispatchExpertId
    summary: string
  }) => ProjectDispatch | null
  reportToProject: (input: {
    projectId: string
    fromExpertId: ProjectDispatchExpertId
    summary?: string
  }) => void
  bindSession: (
    projectId: string,
    expertId: ProjectExpertId,
    sessionId: string,
  ) => void
  setThreadHitl: (
    projectId: string,
    expertId: ProjectExpertId,
    pending: boolean,
    gate?: ProjectThread['pendingGate'],
  ) => void
  patchThread: (
    projectId: string,
    expertId: ProjectExpertId,
    patch: Partial<Pick<ProjectThread, 'boundSessionId' | 'pendingHitl' | 'pendingGate' | 'stepIndex'>>,
  ) => void
  patchProject: (
    projectId: string,
    patch: Partial<Pick<AgentProject, 'caseId' | 'caseBindState' | 'title' | 'summary'>>,
  ) => void
}

const ProjectFolderContext = createContext<ProjectFolderContextValue | null>(
  null,
)

export function ProjectFolderProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => buildDemo(), [])
  const [projects, setProjects] = useState<AgentProject[]>(seed.projects)
  const [threads, setThreads] = useState<ProjectThread[]>(seed.threads)
  const [timeline, setTimeline] = useState<ProjectTimelineEvent[]>(seed.timeline)
  const [dispatches, setDispatches] = useState<ProjectDispatch[]>(seed.dispatches)

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  )

  const getThread = useCallback(
    (projectId: string, expertId: ProjectExpertId) =>
      threads.find((t) => t.projectId === projectId && t.expertId === expertId),
    [threads],
  )

  const getTimeline = useCallback(
    (projectId: string) =>
      timeline
        .filter((e) => e.projectId === projectId)
        .slice()
        .reverse(),
    [timeline],
  )

  const getDispatches = useCallback(
    (projectId: string) =>
      dispatches.filter((d) => d.projectId === projectId).slice().reverse(),
    [dispatches],
  )

  const touchProject = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, updatedAt: nowIso() } : p,
      ),
    )
  }, [])

  const updateThread = useCallback(
    (
      projectId: string,
      expertId: ProjectExpertId,
      updater: (t: ProjectThread) => ProjectThread,
    ) => {
      setThreads((prev) => {
        const idx = prev.findIndex(
          (t) => t.projectId === projectId && t.expertId === expertId,
        )
        if (idx < 0) {
          const base = emptyThread(projectId, expertId)
          return [updater(base), ...prev]
        }
        const next = [...prev]
        next[idx] = updater(prev[idx]!)
        return next
      })
      touchProject(projectId)
    },
    [touchProject],
  )

  const createProject = useCallback(
    (input: {
      title: string
      summary?: string
      kind: ProjectKind
      domainPackId?: DomainPackId
      caseId?: string
    }) => {
      const id = uid('proj')
      const kind = input.kind
      const domainPackId =
        kind === 'domain' ? (input.domainPackId ?? 'patent') : undefined
      const expertIds = expertIdsForKind(kind, domainPackId)
      const caseId = input.caseId || undefined
      const project: AgentProject = {
        id,
        title: input.title.trim() || '未命名项目',
        summary: input.summary?.trim() || '',
        kind,
        domainPackId,
        caseId,
        caseBindState: caseId ? 'bound' : 'none',
        expertIds: [...expertIds],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      const newThreads = expertIds.map((eid) => emptyThread(id, eid))
      setProjects((prev) => [project, ...prev])
      setThreads((prev) => [...newThreads, ...prev])
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId: id,
          kind: 'project_created',
          title: '项目已创建',
          detail: project.title,
          at: stamp(),
        },
      ])
      return project
    },
    [],
  )

  const appendMessage = useCallback(
    (
      projectId: string,
      expertId: ProjectExpertId,
      msg: Omit<ProjectChatMessage, 'id' | 'at'> & { at?: string },
    ) => {
      updateThread(projectId, expertId, (t) => ({
        ...t,
        updatedAt: nowIso(),
        messages: [
          ...t.messages,
          {
            id: uid('msg'),
            at: msg.at ?? stamp(),
            role: msg.role,
            content: msg.content,
            meta: { backend: 'mock', ...msg.meta },
          },
        ],
      }))
    },
    [updateThread],
  )

  const pushStepMessages = useCallback(
    (
      projectId: string,
      expertId: ProjectExpertId,
      stepIndex: number,
    ) => {
      const def = getProjectExpert(expertId)
      const step = def.steps[stepIndex]
      if (!step) return
      updateThread(projectId, expertId, (t) => {
        const msgs: ProjectChatMessage[] = [
          ...t.messages,
          {
            id: uid('msg'),
            role: 'assistant',
            content: step.script,
            at: stamp(),
            meta: { backend: 'mock', stepId: step.id },
          },
        ]
        if (step.tool) {
          msgs.push({
            id: uid('msg'),
            role: 'tool',
            content: `${step.tool.name}\n${step.tool.preview}`,
            at: stamp(),
            meta: {
              backend: 'mock',
              toolName: step.tool.name,
              stepId: step.id,
            },
          })
        }
        return {
          ...t,
          stepIndex,
          pendingHitl: !!step.triggersHitl,
          pendingGate: step.hitlGate,
          updatedAt: nowIso(),
          messages: msgs,
        }
      })
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId,
          kind: 'step',
          title: `${def.name} · ${step.label}`,
          detail: step.script.slice(0, 80),
          at: stamp(),
          expertId,
        },
      ])
    },
    [updateThread],
  )

  const advanceStep = useCallback(
    (projectId: string, expertId: ProjectExpertId) => {
      const t = threads.find(
        (x) => x.projectId === projectId && x.expertId === expertId,
      )
      const def = getProjectExpert(expertId)
      const cur = t?.stepIndex ?? 0
      const next = Math.min(cur + 1, def.steps.length - 1)
      if (next === cur && t && t.stepIndex === next) {
        // re-play current step script if already at end
        pushStepMessages(projectId, expertId, next)
        return
      }
      pushStepMessages(projectId, expertId, next)
    },
    [pushStepMessages, threads],
  )

  const jumpToStep = useCallback(
    (projectId: string, expertId: ProjectExpertId, stepId: string) => {
      const def = getProjectExpert(expertId)
      const idx = def.steps.findIndex((s) => s.id === stepId)
      if (idx < 0) return
      pushStepMessages(projectId, expertId, idx)
    },
    [pushStepMessages],
  )

  const dispatchToExpert = useCallback(
    (input: {
      projectId: string
      toExpertId: ProjectDispatchExpertId
      summary: string
    }) => {
      const project = projects.find((p) => p.id === input.projectId)
      if (!project) return null
      const summary = input.summary.trim() || '请按本专家剧本推进并回报'
      const d: ProjectDispatch = {
        id: uid('disp'),
        projectId: input.projectId,
        toExpertId: input.toExpertId,
        summary,
        at: stamp(),
        status: 'open',
      }
      setDispatches((prev) => [...prev, d])
      const target = getProjectExpert(input.toExpertId)
      const orchId = orchestratorIdForProject(project)
      appendMessage(input.projectId, orchId, {
        role: 'assistant',
        content: `已分派给「${target.name}」：${summary}`,
        meta: { backend: 'mock', dispatchId: d.id },
      })
      appendMessage(input.projectId, input.toExpertId, {
        role: 'system',
        content: `📩 总控分派任务：${summary}\n请用本专家工具条/步骤推进，完成后点「回报总控/项目」。`,
        meta: { backend: 'mock', dispatchId: d.id },
      })
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId: input.projectId,
          kind: 'dispatch',
          title: `分派 → ${target.name}`,
          detail: summary,
          at: stamp(),
          expertId: input.toExpertId,
          dispatchId: d.id,
        },
      ])
      touchProject(input.projectId)
      return d
    },
    [appendMessage, projects, touchProject],
  )

  const reportToProject = useCallback(
    (input: {
      projectId: string
      fromExpertId: ProjectDispatchExpertId
      summary?: string
    }) => {
      const def = getProjectExpert(input.fromExpertId)
      const t = threads.find(
        (x) =>
          x.projectId === input.projectId && x.expertId === input.fromExpertId,
      )
      const step = def.steps[t?.stepIndex ?? 0]
      const summary =
        input.summary?.trim() ||
        `当前步骤「${step?.label ?? '?'}」：${(step?.script ?? '').slice(0, 60)}`
      appendMessage(input.projectId, input.fromExpertId, {
        role: 'assistant',
        content: `已回报总控/项目：${summary}`,
        meta: { backend: 'mock' },
      })
      const project = projects.find((p) => p.id === input.projectId)
      const orchId = project
        ? orchestratorIdForProject(project)
        : 'orchestrator'
      appendMessage(input.projectId, orchId, {
        role: 'system',
        content: `📥 ${def.name} 回执：${summary}`,
        meta: { backend: 'mock' },
      })
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId: input.projectId,
          kind: 'expert_report',
          title: `${def.name} 回报`,
          detail: summary,
          at: stamp(),
          expertId: input.fromExpertId,
        },
      ])
      setDispatches((prev) =>
        prev.map((d) =>
          d.projectId === input.projectId &&
          d.toExpertId === input.fromExpertId &&
          d.status === 'open'
            ? { ...d, status: 'reported' as const }
            : d,
        ),
      )
      touchProject(input.projectId)
    },
    [appendMessage, projects, threads, touchProject],
  )

  const bindSession = useCallback(
    (projectId: string, expertId: ProjectExpertId, sessionId: string) => {
      updateThread(projectId, expertId, (t) => ({
        ...t,
        boundSessionId: sessionId,
        updatedAt: nowIso(),
      }))
    },
    [updateThread],
  )

  const setThreadHitl = useCallback(
    (
      projectId: string,
      expertId: ProjectExpertId,
      pending: boolean,
      gate?: ProjectThread['pendingGate'],
    ) => {
      updateThread(projectId, expertId, (t) => ({
        ...t,
        pendingHitl: pending,
        pendingGate: gate,
        updatedAt: nowIso(),
      }))
    },
    [updateThread],
  )

  const patchThread = useCallback(
    (
      projectId: string,
      expertId: ProjectExpertId,
      patch: Partial<
        Pick<
          ProjectThread,
          'boundSessionId' | 'pendingHitl' | 'pendingGate' | 'stepIndex'
        >
      >,
    ) => {
      updateThread(projectId, expertId, (t) => ({
        ...t,
        ...patch,
        updatedAt: nowIso(),
      }))
    },
    [updateThread],
  )

  const patchProject = useCallback(
    (
      projectId: string,
      patch: Partial<Pick<AgentProject, 'caseId' | 'caseBindState' | 'title' | 'summary'>>,
    ) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p
          const next = { ...p, ...patch, updatedAt: nowIso() }
          if ('caseId' in patch) {
            const cid = patch.caseId
            next.caseBindState = (
              patch.caseBindState ??
              (cid ? 'bound' : 'none')
            ) as CaseBindState
            if (!cid) next.caseId = undefined
          }
          return next
        }),
      )
      // pending_create-only is a UI flash — no timeline spam
      const pendingOnly =
        patch.caseBindState === 'pending_create' && !('caseId' in patch)
      if (pendingOnly) return
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId,
          kind: 'system',
          title: patch.caseId
            ? `已绑定案件 ${patch.caseId}`
            : 'caseId' in patch
              ? '已解除案件绑定'
              : '项目已更新',
          detail: patch.caseId
            ? '样机绑定 · 非真 case-core'
            : '',
          at: stamp(),
        },
      ])
    },
    [],
  )

  const value = useMemo<ProjectFolderContextValue>(
    () => ({
      projects,
      createProject,
      getProject,
      getThread,
      getTimeline,
      getDispatches,
      appendMessage,
      advanceStep,
      jumpToStep,
      dispatchToExpert,
      reportToProject,
      bindSession,
      setThreadHitl,
      patchThread,
      patchProject,
    }),
    [
      projects,
      createProject,
      getProject,
      getThread,
      getTimeline,
      getDispatches,
      appendMessage,
      advanceStep,
      jumpToStep,
      dispatchToExpert,
      reportToProject,
      bindSession,
      setThreadHitl,
      patchThread,
      patchProject,
    ],
  )

  return (
    <ProjectFolderContext.Provider value={value}>
      {children}
    </ProjectFolderContext.Provider>
  )
}

export function useProjectFolder() {
  const ctx = useContext(ProjectFolderContext)
  if (!ctx) {
    throw new Error('useProjectFolder must be used within ProjectFolderProvider')
  }
  return ctx
}

export { DEMO_PATENT_ID, DEMO_GENERAL_ID, DEMO_PATENT_ID as DEMO_PROJECT_ID }
