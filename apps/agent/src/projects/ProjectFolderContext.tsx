import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  expertIdsForKind,
  getProjectExpert,
  isOrchestratorExpert,
  orchestratorIdForProject,
} from './experts'
import { PATENT_CATALOG_IDS } from './expertsPatent'
import {
  formatStepAssistantContent,
  formatStepToolContent,
} from '../lib/stepChatFormat'
import {
  GENERAL_SHELL_ID,
  buildGeneralShellProject,
  isGeneralShellId,
} from './generalShell'
import type {
  AgentProject,
  DomainCommandWriteLog,
  DomainPackId,
  ProjectChatMessage,
  ProjectDispatch,
  ProjectDispatchExpertId,
  ProjectExpertId,
  CaseBindState,
  ProjectKind,
  ProjectThread,
  ProjectTimelineEvent,
  RoomMessage,
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
        content: isGeneralShellId(projectId)
          ? `通用壳 · Grok 多专家\n${intro}`
          : `项目协作 · 总控编排\n${intro}`,
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
  const shell = buildGeneralShellProject(nowIso())
  // Pack HF: seed 16 seats + orch + FTO assist (all catalog) so DM/后置席有线程
  const patentIds = [...PATENT_CATALOG_IDS]
  const generalIds = expertIdsForKind('general')
  const patent: AgentProject = {
    id: DEMO_PATENT_ID,
    title: '边缘调度模组 · 专利演示',
    summary: 'Pack 16+总控：主链 HITL①–⑥ + 后置 F7–F9 可跑样机',
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
    summary: '通用：总控 + 研究 / 写作 / 审查（无专利步骤）',
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
      projectId: shell.id,
      kind: 'project_created',
      title: '通用自由 bot 壳已就绪',
      detail: '自由 bot 工作区 · 样机 · 无真 LLM',
      at: stamp(),
    },
    {
      id: uid('tl'),
      projectId: patent.id,
      kind: 'project_created',
      title: '专利演示项目已种子',
      detail: 'Pack 16 席+总控种子（含后置 F7–F9 可跑）',
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
    projects: [shell, general, patent],
    threads,
    timeline,
    dispatches: [],
  }
}

type ProjectFolderContextValue = {
  projects: AgentProject[]
  /** Projects excluding the implicit general Grok shell (folder list / project rail). */
  folderProjects: AgentProject[]
  /** Read-only project expert threads (view-layer aggregation; do not merge stores). */
  threads: ProjectThread[]
  createProject: (input: {
    title: string
    summary?: string
    kind: ProjectKind
    domainPackId?: DomainPackId
    caseId?: string
    expertIds?: ProjectExpertId[]
    /** optional stable id (business-mode seeds) */
    id?: string
  }) => AgentProject
  roomMessages: RoomMessage[]
  appendRoomMessage: (
    input: Omit<RoomMessage, 'id' | 'at'> & { at?: string },
  ) => void
  clearRoomMessages: (projectId: string) => void
  runPatentRoomLoop: (projectId: string) => void
  pauseRoomLoop: () => void
  roomLoopBusy: boolean
  markArtifactSubmitted: (
    projectId: string,
    expertId: ProjectExpertId,
  ) => void
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
  /**
   * 回退到已走过的步骤（含当前步重跑）。不可跳到未到达的步。
   * 清 pendingHitl / artifactSubmitted，追加说明气泡并重放该步产出。
   */
  rewindToStep: (
    projectId: string,
    expertId: ProjectExpertId,
    targetIndex: number,
  ) => { ok: true; stepLabel: string; stepIndex: number } | { ok: false; reason: string }
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
  /** L3: Confirm → DomainCommand write indications (in-memory) */
  domainCommandWrites: DomainCommandWriteLog[]
  getDomainCommandWrites: (projectId: string) => DomainCommandWriteLog[]
  recordDomainCommandWrite: (
    input: Omit<DomainCommandWriteLog, 'id' | 'at'> & { at?: string },
  ) => DomainCommandWriteLog
  /** L3 demo: orch spontaneous dispatch → draft claims card → HITL */
  runL3Demo: (projectId: string) => void
  /** L3 full chain: delayed dispatch search→…→oa with expert receipts */
  runL3FullChain: (projectId: string) => void
  fullChainBusy: boolean
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
  const [domainCommandWrites, setDomainCommandWrites] = useState<DomainCommandWriteLog[]>([])
  const [fullChainBusy, setFullChainBusy] = useState(false)
  const fullChainTimersRef = useRef<number[]>([])
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([])
  const [roomLoopBusy, setRoomLoopBusy] = useState(false)
  const roomLoopTimersRef = useRef<number[]>([])


  useEffect(() => {
    return () => {
      for (const id of fullChainTimersRef.current) window.clearTimeout(id)
      fullChainTimersRef.current = []
      for (const id of roomLoopTimersRef.current) window.clearTimeout(id)
      roomLoopTimersRef.current = []
    }
  }, [])


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
      expertIds?: ProjectExpertId[]
      id?: string
    }) => {
      const id = input.id?.trim() || uid('proj')
      const existing = projects.find((p) => p.id === id)
      if (existing) return existing
      const kind = input.kind
      const domainPackId =
        kind === 'domain' ? (input.domainPackId ?? 'patent') : undefined
      const expertIds =
        input.expertIds && input.expertIds.length > 0
          ? input.expertIds
          : expertIdsForKind(kind, domainPackId)
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
    [projects],
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
            content: formatStepAssistantContent(step),
            at: stamp(),
            meta: { backend: 'mock', stepId: step.id },
          },
        ]
        if (step.tool) {
          msgs.push({
            id: uid('msg'),
            role: 'tool',
            content: formatStepToolContent(step),
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

  const rewindToStep = useCallback(
    (
      projectId: string,
      expertId: ProjectExpertId,
      targetIndex: number,
    ):
      | { ok: true; stepLabel: string; stepIndex: number }
      | { ok: false; reason: string } => {
      const def = getProjectExpert(expertId)
      if (
        !Number.isInteger(targetIndex) ||
        targetIndex < 0 ||
        targetIndex >= def.steps.length
      ) {
        return { ok: false, reason: 'invalid' }
      }
      const t = threads.find(
        (x) => x.projectId === projectId && x.expertId === expertId,
      )
      const cur = t?.stepIndex ?? 0
      if (targetIndex > cur) {
        return { ok: false, reason: 'forward' }
      }
      const step = def.steps[targetIndex]!
      updateThread(projectId, expertId, (th) => ({
        ...th,
        stepIndex: targetIndex,
        pendingHitl: false,
        pendingGate: undefined,
        artifactSubmitted: false,
        updatedAt: nowIso(),
        messages: [
          ...th.messages,
          {
            id: uid('msg'),
            role: 'system',
            content: `已回到第 ${targetIndex + 1} 步「${step.label}」· 该步之后的产出视为草稿，可改完再往下推进。`,
            at: stamp(),
            meta: { backend: 'mock', stepId: step.id },
          },
        ],
      }))
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId,
          kind: 'step',
          title: `${def.name} · 回退到「${step.label}」`,
          detail: `从第 ${cur + 1} 步 → 第 ${targetIndex + 1} 步`,
          at: stamp(),
          expertId,
        },
      ])
      // 重放该步助理/产出（在 system 说明之后）
      pushStepMessages(projectId, expertId, targetIndex)
      return { ok: true, stepLabel: step.label, stepIndex: targetIndex }
    },
    [pushStepMessages, threads, updateThread],
  )

  const jumpToStep = useCallback(
    (projectId: string, expertId: ProjectExpertId, stepId: string) => {
      const def = getProjectExpert(expertId)
      const idx = def.steps.findIndex((s) => s.id === stepId)
      if (idx < 0) return
      // 演示/脚本可任意跳；人点步骤条请用 rewindToStep（只许回退）
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
        pendingGate: pending ? gate : undefined,
        // pending true → 待确认；pending false after unlock → 已确认
        hitlCleared: pending ? false : true,
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


  const getDomainCommandWrites = useCallback(
    (projectId: string) =>
      domainCommandWrites
        .filter((w) => w.projectId === projectId)
        .slice()
        .reverse(),
    [domainCommandWrites],
  )

  const recordDomainCommandWrite = useCallback(
    (input: Omit<DomainCommandWriteLog, 'id' | 'at'> & { at?: string }) => {
      const entry: DomainCommandWriteLog = {
        id: uid('dcw'),
        at: input.at ?? stamp(),
        projectId: input.projectId,
        expertId: input.expertId,
        command: input.command,
        payload: input.payload,
        midCaseHref: input.midCaseHref,
        note: input.note,
      }
      setDomainCommandWrites((prev) => [...prev, entry])
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId: input.projectId,
          kind: 'domain_command',
          title: `DomainCommand · ${input.command}`,
          detail: input.note,
          at: entry.at,
          expertId: input.expertId,
        },
      ])
      return entry
    },
    [],
  )

  const runL3Demo = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project || project.domainPackId !== 'patent') return

      if (!project.caseId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  caseId: 'case-mock-l3',
                  caseBindState: 'bound' as const,
                  updatedAt: nowIso(),
                }
              : p,
          ),
        )
        setTimeline((prev) => [
          ...prev,
          {
            id: uid('tl'),
            projectId,
            kind: 'system',
            title: 'L3 演示 · 已绑 mock 案件 case-mock-l3',
            detail: '样机绑定 · 非真 case-core',
            at: stamp(),
          },
        ])
      }

      const orchId = orchestratorIdForProject(project)
      appendMessage(projectId, orchId, {
        role: 'assistant',
        content:
          '【L3 演示】自发拆派撰稿专家：请出假权利要求草稿 → 提请 Confirm → DomainCommand.saveDraft 写库示意。',
        meta: { backend: 'mock' },
      })
      dispatchToExpert({
        projectId,
        toExpertId: 'expert-draft',
        summary: 'L3 演示：请生成权利要求草稿并提请 Confirm 写库示意',
      })
      jumpToStep(projectId, 'expert-draft', 'claims')
      jumpToStep(projectId, 'expert-draft', 'confirm')
      appendMessage(projectId, orchId, {
        role: 'system',
        content:
          '【L3】撰稿席已出假权利要求草稿并进入 Confirm。请到撰稿席点确认 → 观察 DomainCommand 写库示意与中台映射。',
        meta: { backend: 'mock' },
      })
    },
    [projects, appendMessage, dispatchToExpert, jumpToStep],
  )

  const FULL_CHAIN: {
    id: ProjectDispatchExpertId
    summary: string
    receipt: string
    stepId?: string
  }[] = [
    {
      id: 'expert-research',
      summary: '全链路：请跑检索式并出三性意见',
      receipt: '检索回执：命中 12 · 06_research_report + worklog（mock）',
      stepId: 'basket',
    },
    {
      id: 'expert-intake',
      summary: '全链路：请吃上游并 go_nogo',
      receipt: '立项回执：Go · 07_intake_quote + worklog（mock）',
      stepId: 'quote',
    },
    {
      id: 'expert-disclosure',
      summary: '全链路：请整理交底结构（disclosure_pack）',
      receipt: '交底回执：背景/方案/效果/实施例提纲已出（mock）',
      stepId: 'structure',
    },
    {
      id: 'expert-draft',
      summary: '全链路：请出假权利要求/摘要（draft_claims）',
      receipt: '撰稿回执：独权1+从权3 + 摘要骨架（mock）',
      stepId: 'claims',
    },
    {
      id: 'expert-figure',
      summary: '全链路：请列应补示意图并挂章占位',
      receipt: '附图回执：框图/流程/曲线清单 + fig-mock-01（mock）',
      stepId: 'list',
    },
    {
      id: 'expert-fto',
      summary: '全链路：请做自由实施矩阵与风险分级',
      receipt: 'FTO 回执：2红/1黄/3绿 · 报告草稿内存（mock）',
      stepId: 'risk',
    },
    {
      id: 'expert-filing',
      summary: '全链路：请做齐套/形式清单（禁真递交）',
      receipt: '递交回执：齐套 4/5 · 形式点 2 · 待授权闸（mock）',
      stepId: 'checklist',
    },
    {
      id: 'expert-oa',
      summary: '全链路：请对假一通出答复策略草稿',
      receipt: 'OA 回执：争辩+修改+证据提纲 · prosecution_response（mock）',
      stepId: 'draft',
    },
  ]

  const runL3FullChain = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project || project.domainPackId !== 'patent') return
      if (fullChainBusy) return

      for (const id of fullChainTimersRef.current) window.clearTimeout(id)
      fullChainTimersRef.current = []
      setFullChainBusy(true)

      if (!project.caseId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  caseId: 'case-mock-l3',
                  caseBindState: 'bound' as const,
                  updatedAt: nowIso(),
                }
              : p,
          ),
        )
        setTimeline((prev) => [
          ...prev,
          {
            id: uid('tl'),
            projectId,
            kind: 'system',
            title: 'L3 全链路 · 已绑 mock 案件 case-mock-l3',
            detail: '样机绑定 · 非真 case-core',
            at: stamp(),
          },
        ])
      }

      const orchId = orchestratorIdForProject(project)
      appendMessage(projectId, orchId, {
        role: 'assistant',
        content:
          '【演示全链路 · running】将依次分派：查新 → 立项 → 交底 → 撰写 → 制图 → FTO → 递交 → OA（mock 延迟 · 无真 LLM）。',
        meta: { backend: 'mock' },
      })
      setTimeline((prev) => [
        ...prev,
        {
          id: uid('tl'),
          projectId,
          kind: 'system',
          title: '演示全链路 · 开始',
          detail: '8 席延迟分派 + 回执',
          at: stamp(),
        },
      ])

      const STEP_MS = 450
      FULL_CHAIN.forEach((seat, i) => {
        const tDispatch = window.setTimeout(() => {
          dispatchToExpert({
            projectId,
            toExpertId: seat.id,
            summary: seat.summary,
          })
          if (seat.stepId) jumpToStep(projectId, seat.id, seat.stepId)
        }, STEP_MS * (i * 2 + 1))
        fullChainTimersRef.current.push(tDispatch)

        const tReceipt = window.setTimeout(() => {
          reportToProject({
            projectId,
            fromExpertId: seat.id,
            summary: seat.receipt,
          })
          appendMessage(projectId, seat.id, {
            role: 'assistant',
            content: `【全链路】${seat.receipt}`,
            meta: { backend: 'mock' },
          })
        }, STEP_MS * (i * 2 + 2))
        fullChainTimersRef.current.push(tReceipt)
      })

      const doneAt = STEP_MS * (FULL_CHAIN.length * 2 + 1)
      const tDone = window.setTimeout(() => {
        appendMessage(projectId, orchId, {
          role: 'assistant',
          content:
            '【演示全链路 · done】已收齐 8 席回执。可到交底/撰稿/OA 席走 Confirm→DomainCommand 写库示意；递交席仅闸示意、禁真递交。',
          meta: { backend: 'mock' },
        })
        setTimeline((prev) => [
          ...prev,
          {
            id: uid('tl'),
            projectId,
            kind: 'system',
            title: '演示全链路 · 完成',
            detail: '各专家回执已入时间线',
            at: stamp(),
          },
        ])
        setFullChainBusy(false)
      }, doneAt)
      fullChainTimersRef.current.push(tDone)
    },
    [
      projects,
      fullChainBusy,
      appendMessage,
      dispatchToExpert,
      jumpToStep,
      reportToProject,
    ],
  )


  const appendRoomMessage = useCallback(
    (input: Omit<RoomMessage, 'id' | 'at'> & { at?: string }) => {
      setRoomMessages((prev) => [
        ...prev,
        {
          id: uid('room'),
          at: input.at ?? stamp(),
          projectId: input.projectId,
          fromExpertId: input.fromExpertId,
          toExpertId: input.toExpertId,
          body: input.body,
          kind: input.kind,
          spontaneous: input.spontaneous,
        },
      ])
    },
    [],
  )

  const clearRoomMessages = useCallback((projectId: string) => {
    setRoomMessages((prev) => prev.filter((m) => m.projectId !== projectId))
  }, [])

  const pauseRoomLoop = useCallback(() => {
    for (const id of roomLoopTimersRef.current) window.clearTimeout(id)
    roomLoopTimersRef.current = []
    setRoomLoopBusy(false)
  }, [])

  const markArtifactSubmitted = useCallback(
    (projectId: string, expertId: ProjectExpertId) => {
      updateThread(projectId, expertId, (t) => ({
        ...t,
        artifactSubmitted: true,
        updatedAt: nowIso(),
      }))
    },
    [updateThread],
  )

  const ROOM_LOOP: {
    id: ProjectDispatchExpertId
    request: string
    result: string
  }[] = [
    {
      id: 'expert-research',
      request: '请出查新+三性意见书（双文件）',
      result: '已交 06_research_report.md + worklog（步骤表+关键取舍）',
    },
    {
      id: 'expert-intake',
      request: '请吃 01–06 并 go_nogo',
      result: 'Go · 07_intake_quote.md + worklog',
    },
    {
      id: 'expert-disclosure',
      request: '请整理可实施交底',
      result: '08_disclosure_pack.md + worklog 已齐',
    },
    {
      id: 'expert-draft',
      request: '请出权要+说明书',
      result: '09_draft_claims.md + worklog 已齐',
    },
    {
      id: 'expert-figure',
      request: '请冻图号清单',
      result: '10_figure_list.md + worklog（并行 FTO）',
    },
    {
      id: 'expert-fto',
      request: '请出 FTO memo + claim chart',
      result: '11_fto_memo.md + worklog',
    },
    {
      id: 'expert-filing',
      request: '请齐套并走 authorize→file 闸（示意）',
      result: '12_filing_checklist.md · file 示意完成 · 请总控派 OA',
    },
    {
      id: 'expert-oa',
      request: '已 file：请出 OA 答复策略',
      result: '13_prosecution_response.md + worklog',
    },
  ]

  const runPatentRoomLoop = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project || project.domainPackId !== 'patent') return
      if (roomLoopBusy) return
      for (const id of roomLoopTimersRef.current) window.clearTimeout(id)
      roomLoopTimersRef.current = []
      setRoomLoopBusy(true)

      const team = new Set(project.expertIds)
      const chain = ROOM_LOOP.filter((s) => team.has(s.id))
      const orchId = orchestratorIdForProject(project)

      appendRoomMessage({
        projectId,
        fromExpertId: orchId,
        toExpertId: 'all',
        body: '【loop】开始主链自发分派（mock · 无真 LLM）。缺 worklog 不派下家。',
        kind: 'note',
        spontaneous: true,
      })

      const STEP = 500
      chain.forEach((seat, i) => {
        const tReq = window.setTimeout(() => {
          appendRoomMessage({
            projectId,
            fromExpertId: orchId,
            toExpertId: seat.id,
            body: seat.request,
            kind: 'request',
            spontaneous: true,
          })
          setTimeline((prev) => [
            ...prev,
            {
              id: uid('tl'),
              projectId,
              kind: 'room_loop',
              title: `loop 分派 · ${getProjectExpert(seat.id).name}`,
              detail: seat.request,
              at: stamp(),
              expertId: seat.id,
            },
          ])
        }, STEP * (i * 2 + 1))
        roomLoopTimersRef.current.push(tReq)

        const tRes = window.setTimeout(() => {
          appendRoomMessage({
            projectId,
            fromExpertId: seat.id,
            toExpertId: orchId,
            body: `${seat.result}\n过程见对应 worklog。`,
            kind: 'result',
            spontaneous: true,
          })
          markArtifactSubmitted(projectId, seat.id)
        }, STEP * (i * 2 + 2))
        roomLoopTimersRef.current.push(tRes)
      })

      const doneAt = STEP * (chain.length * 2 + 1)
      const tDone = window.setTimeout(() => {
        appendRoomMessage({
          projectId,
          fromExpertId: orchId,
          toExpertId: 'all',
          body: '【loop · done】主链回执已齐。可打开各席看步骤条 + 双文件；OA 仅 file 后。',
          kind: 'note',
          spontaneous: true,
        })
        setRoomLoopBusy(false)
      }, doneAt)
      roomLoopTimersRef.current.push(tDone)
    },
    [
      projects,
      roomLoopBusy,
      appendRoomMessage,
      markArtifactSubmitted,
    ],
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

  const folderProjects = useMemo(
    () => projects.filter((p) => !isGeneralShellId(p.id)),
    [projects],
  )

  const value = useMemo<ProjectFolderContextValue>(
    () => ({
      projects,
      folderProjects,
      threads,
      createProject,
      getProject,
      getThread,
      getTimeline,
      getDispatches,
      appendMessage,
      advanceStep,
      rewindToStep,
      jumpToStep,
      dispatchToExpert,
      reportToProject,
      bindSession,
      setThreadHitl,
      patchThread,
      patchProject,
      domainCommandWrites,
      getDomainCommandWrites,
      recordDomainCommandWrite,
      runL3Demo,
      runL3FullChain,
      fullChainBusy,
      roomMessages,
      appendRoomMessage,
      clearRoomMessages,
      runPatentRoomLoop,
      pauseRoomLoop,
      roomLoopBusy,
      markArtifactSubmitted,
    }),
    [
      projects,
      folderProjects,
      threads,
      createProject,
      getProject,
      getThread,
      getTimeline,
      getDispatches,
      appendMessage,
      advanceStep,
      rewindToStep,
      jumpToStep,
      dispatchToExpert,
      reportToProject,
      bindSession,
      setThreadHitl,
      patchThread,
      patchProject,
      domainCommandWrites,
      getDomainCommandWrites,
      recordDomainCommandWrite,
      runL3Demo,
      runL3FullChain,
      fullChainBusy,
      roomMessages,
      appendRoomMessage,
      clearRoomMessages,
      runPatentRoomLoop,
      pauseRoomLoop,
      roomLoopBusy,
      markArtifactSubmitted,
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

export { DEMO_PATENT_ID, DEMO_GENERAL_ID, DEMO_PATENT_ID as DEMO_PROJECT_ID, GENERAL_SHELL_ID }
