import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  AGENT_CATALOG,
  AGENT_SCRIPTS,
  buildInitialRuns,
  defaultSessionGoal,
  getAgent,
  handoffKeyForAgent,
  suggestAgent,
} from '@shared/data/agents'

import { buildSeedSessions } from '@shared/data/sessions'
import type {
  AgentArtifactDoc,
  AgentDef,
  AgentRun,
  AgentRunStatus,
  AgentSession,
  AgentStep,
  HitlGateId,
} from '@ip/domain/types'
import { useApp } from './AppContext'
import { personaCanCreateAgentSession } from '@shared/data/persona'
import {
  evaluateFullCheck,
  fullCheckScopeFor,
  OA_ISSUE_TYPE_LABELS,
} from '@shared/utils/fullFilingCheck'
import {
  disclosurePackComplete,
  DISCLOSURE_PACK_CHECK_ITEMS,
  type HandoffAction,
} from '@shared/data/handoff'
import type { DomainCommand } from '@ip/domain'
import { hasVerifiableResearchHitsFromSession } from '@ip/domain'
import { COMMAND_LABELS, TOOL_TO_COMMAND } from '@ip/domain'
import type { SessionSearchState } from '@shared/utils/sessionSearch'
import { pickNextHandoffAction } from '@shared/components/agent/session/sessionGates'

/** HITL session actions — gate ids map to concrete domain commands */
export type HitlSessionAction =
  | 'approve'
  | 'approve_strategy'
  | 'request_changes'
  | 'authorize'
  | 'authorize_file'
  | 'confirm_quote'
  | 'go_nogo'
  | 'pay_unlock'

/** HITL / demo write result — optional deep-link after layout建案等 */
export type HitlActionResult = {
  ok: boolean
  message: string
  navigateTo?: string
  createdCaseId?: string
}

export interface AgentContextValue {

  agents: AgentDef[]
  runs: AgentRun[]
  visibleRuns: AgentRun[]
  getRun: (id: string) => AgentRun | undefined
  getAgentDef: (id: string) => AgentDef | undefined
  runsForAgent: (agentId: string) => AgentRun[]
  startRun: (input: {
    agentId: string
    caseId: string
    goal: string
  }) => AgentRun | null
  updateArtifact: (runId: string, artifactId: string, content: string) => void
  playMockRun: (runId: string) => void
  stopPlay: (runId: string) => void
  isPlaying: (runId: string) => boolean
  hitlAction: (
    runId: string,
    action: 'approve' | 'request_changes' | 'authorize',
    note?: string,
  ) => Promise<{ ok: boolean; message: string }>
  filterRuns: (status: AgentRunStatus | 'all') => AgentRun[]
  /** IP Agent Harness sessions (Cursor metaphor) */
  sessions: AgentSession[]
  visibleSessions: AgentSession[]
  getSession: (id: string) => AgentSession | undefined
  createSession: (input: {
    goal: string
    agentId: string | 'auto'
    caseId?: string
    title?: string
    /** Beta/Assist：须 UI 已确认；缺省则拒绝（Auto 改荐 Core） */
    confirmedNonCoreTier?: boolean
  }) => AgentSession | null
  patchSession: (
    sessionId: string,
    patch: Partial<
      Pick<
        AgentSession,
        | 'goal'
        | 'agentId'
        | 'caseId'
        | 'title'
        | 'clearedHitlGates'
        | 'archived'
        | 'failReason'
        | 'status'
        | 'hitlPending'
        | 'oaStatementConfirmed'
        | 'oaIssueType'
        | 'oaStrategyNotes'
      >
    >,
  ) => void
  archiveSession: (sessionId: string) => void
  /** Shared list search (Shell ↔ SessionsList) */
  sessionSearch: string
  setSessionSearch: (q: string) => void
  /** When true, archived sessions appear in visibleSessions */
  showArchivedSessions: boolean
  setShowArchivedSessions: (v: boolean) => void
  updateSessionArtifact: (sessionId: string, artifactId: string, content: string) => void
  playMockSession: (
    sessionId: string,
    overrides?: Partial<Pick<AgentSession, 'agentId' | 'goal' | 'caseId'>> & {
      mode?: 'dry-run' | 'formal'
    },
  ) => void
  stopSessionPlay: (sessionId: string) => void
  isSessionPlaying: (sessionId: string) => boolean
  sessionHitlAction: (
    sessionId: string,
    action: HitlSessionAction,
    note?: string,
    opts?: { stepwise?: boolean },
  ) => Promise<HitlActionResult>
  runEquivalenceDemo: (sessionId: string) => Promise<HitlActionResult>
  lastAppliedCommandLabel: string | null
  sessionRunMode: (sessionId: string) => 'dry-run' | 'formal' | null
}

const AgentContext = createContext<AgentContextValue | null>(null)

function nowIso() {
  return new Date().toISOString().slice(0, 10)
}

function nowStamp() {
  return new Date().toISOString().slice(11, 19)
}

/** 调研命中可核验 · 复用 domain/guardrails.hasVerifiableResearchHitsFromSession */
const sessionHasVerifiableResearchHits = hasVerifiableResearchHitsFromSession


export function AgentProvider({ children }: { children: ReactNode }) {
  const {
    visibleCases,
    canAccessCase,
    dispatchCommand,
    addArtifact,
    addActivity,
    processWatchAlert,
    getWatchAlerts,
    getDraftFilingCheck,
    getFullCheckLite,
    appendCaseDriveItem,
    getDisclosurePackCheck,
    hasBlockingInvoiceForCase,
    role,
    getHandoff,
    getCase,
    setOaStatementConfirmed,
    workspace,
    persona,
  } = useApp()

  const [runs, setRuns] = useState<AgentRun[]>(() => buildInitialRuns())
  const [sessions, setSessions] = useState<AgentSession[]>(() => buildSeedSessions())
  const [sessionSearch, setSessionSearch] = useState('')
  const [showArchivedSessions, setShowArchivedSessions] = useState(false)
  const timersRef = useRef<Record<string, number[]>>({})
  const playingRef = useRef<Record<string, boolean>>({})
  const modeRef = useRef<Record<string, 'dry-run' | 'formal'>>({})
  const insightCaseRef = useRef<Record<string, string>>({})
  const [lastAppliedCommandLabel, setLastAppliedCommandLabel] = useState<string | null>(null)
  const [, bump] = useState(0)

  const sessionRunMode = useCallback(
    (sessionId: string) => modeRef.current[sessionId] ?? null,
    [],
  )

  const visibleRuns = useMemo(
    () => runs.filter((r) => canAccessCase(r.caseId)),
    [runs, canAccessCase],
  )

  const getRun = useCallback((id: string) => runs.find((r) => r.id === id), [runs])

  const getAgentDef = useCallback((id: string) => getAgent(id), [])

  const runsForAgent = useCallback(
    (agentId: string) =>
      visibleRuns
        .filter((r) => r.agentId === agentId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [visibleRuns],
  )

  const filterRuns = useCallback(
    (status: AgentRunStatus | 'all') =>
      status === 'all' ? visibleRuns : visibleRuns.filter((r) => r.status === status),
    [visibleRuns],
  )

  const startRun = useCallback(
    (input: { agentId: string; caseId: string; goal: string }): AgentRun | null => {
      const agent = getAgent(input.agentId)
      if (!agent) return null
      if (!canAccessCase(input.caseId)) return null
      const c = visibleCases.find((x) => x.id === input.caseId)
      if (!c && !canAccessCase(input.caseId)) return null

      const run: AgentRun = {
        id: `run-${Date.now()}`,
        agentId: input.agentId,
        caseId: input.caseId,
        goal: input.goal.trim() || defaultSessionGoal(agent, { hasCase: true }),
        status: 'queued',
        steps: [
          {
            id: `st-${Date.now()}`,
            kind: 'system',
            title: '任务已创建',
            content: `已为「${agent.name}」备好任务 · 可预览或启动。`,
            at: `${nowIso()} ${nowStamp()}`,
          },
        ],
        artifacts: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
        scriptIndex: 0,
        hitlPending: false,
      }
      setRuns((prev) => [run, ...prev])
      addActivity(`发起知产 Agent 任务：${agent.name} · ${input.goal.slice(0, 40)}`)
      return run
    },
    [canAccessCase, visibleCases, addActivity],
  )

  const updateArtifact = useCallback(
    (runId: string, artifactId: string, content: string) => {
      setRuns((prev) =>
        prev.map((r) => {
          if (r.id !== runId) return r
          return {
            ...r,
            artifacts: r.artifacts.map((a) =>
              a.id === artifactId ? { ...a, content } : a,
            ),
            updatedAt: nowIso(),
          }
        }),
      )
    },
    [],
  )

  const stopPlay = useCallback((runId: string) => {
    const timers = timersRef.current[runId] ?? []
    timers.forEach((t) => window.clearTimeout(t))
    timersRef.current[runId] = []
    playingRef.current[runId] = false
    bump((n) => n + 1)
  }, [])

  const isPlaying = useCallback((runId: string) => !!playingRef.current[runId], [])

  const playMockRun = useCallback(
    (runId: string) => {
      const run = runs.find((r) => r.id === runId)
      if (!run) return
      stopPlay(runId)

      const script = AGENT_SCRIPTS[run.agentId] ?? AGENT_SCRIPTS['agent-research']
      let idx = run.scriptIndex
      if (idx >= script.length) {
        // restart from remaining human question if already finished
        idx = Math.max(0, script.length - 1)
        setRuns((prev) =>
          prev.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  scriptIndex: 0,
                  status: 'running',
                  hitlPending: false,
                  steps: [
                    ...r.steps,
                    {
                      id: `st-restart-${Date.now()}`,
                      kind: 'system' as const,
                      title: '重新预览',
                      content: '清空进度游标，继续追加示意步骤。',
                      at: `${nowIso()} ${nowStamp()}`,
                    },
                  ],
                }
              : r,
          ),
        )
        idx = 0
      }

      playingRef.current[runId] = true
      setRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? { ...r, status: 'running', hitlPending: false, updatedAt: nowIso() }
            : r,
        ),
      )
      bump((n) => n + 1)

      const timers: number[] = []
      let cursor = idx
      const scheduleNext = (delay: number) => {
        const t = window.setTimeout(() => {
          if (!playingRef.current[runId]) return
          if (cursor >= script.length) {
            playingRef.current[runId] = false
            bump((n) => n + 1)
            return
          }
          const item = script[cursor]
          const stepId = `st-${runId}-${cursor}-${Date.now()}`
          let newArtifact: AgentArtifactDoc | undefined
          if (item.artifact) {
            newArtifact = {
              id: `art-${runId}-${cursor}`,
              ...item.artifact,
            }
          }
          const step: AgentStep = {
            id: stepId,
            kind: item.kind,
            title: item.title,
            content: item.content,
            toolName: item.toolName,
            toolArgs: item.toolArgs,
            toolResultPreview: item.toolResultPreview,
            artifactId: newArtifact?.id,
            at: `${nowIso()} ${nowStamp()}`,
          }
          const isHitl = item.kind === 'question_to_human'
          setRuns((prev) =>
            prev.map((r) => {
              if (r.id !== runId) return r
              return {
                ...r,
                steps: [...r.steps, step],
                artifacts: newArtifact
                  ? [...r.artifacts.filter((a) => a.title !== newArtifact!.title), newArtifact!]
                  : r.artifacts,
                scriptIndex: cursor + 1,
                status: isHitl ? 'needs_human' : 'running',
                hitlPending: isHitl,
                updatedAt: nowIso(),
              }
            }),
          )
          cursor += 1
          if (isHitl) {
            playingRef.current[runId] = false
            bump((n) => n + 1)
            return
          }
          scheduleNext(700 + Math.random() * 500)
        }, delay)
        timers.push(t)
        timersRef.current[runId] = timers
      }
      scheduleNext(400)
    },
    [runs, stopPlay],
  )

  const buildCmdForAction = (
    caseId: string,
    key: ReturnType<typeof handoffKeyForAgent>,
    a: HandoffAction,
    note?: string,
    annotation?: string,
  ): DomainCommand => {
    if (a === 'file') {
      // OA/撰写/年费正式路径走 ConfirmBar 回执表单；闸链内部若必须编号，标「演示凭证号」
      const receipt =
        key === 'maintain_annuity'
          ? `AN-PAY-${Date.now().toString().slice(-8)}`
          : ''
      const fileNote =
        receipt
          ? `${note ?? '年费缴纳 Docket 回写'} · 演示凭证号 ${receipt}`
          : note
      return {
        type: 'fileResponse',
        caseId,
        handoffKey: key,
        receiptNo: receipt,
        filedAt: receipt ? nowIso() : '',
        note: fileNote,
      }
    }
    if (a === 'submit' && key === 'research_report') {
      return { type: 'submitResearch', caseId, note, artifactName: '调研结论摘要_IP办理提交.md' }
    }
    if (a === 'submit' && key === 'prosecution_response') {
      return { type: 'analyzeAndSubmitOA', caseId, note }
    }
    if (a === 'submit' && key === 'draft_claims') {
      return { type: 'submitClaims', caseId, note }
    }
    if (a === 'submit') return { type: 'submitHandoff', caseId, handoffKey: key, note }
    if (a === 'start_review') return { type: 'startReview', caseId, handoffKey: key, note }
    if (a === 'approve' && key === 'intake_quote') return { type: 'confirmQuote', caseId, note }
    if (a === 'approve') return { type: 'approveHandoff', caseId, handoffKey: key, note }
    if (a === 'request_changes') {
      return { type: 'requestChanges', caseId, handoffKey: key, note, annotation }
    }
    if (a === 'authorize') return { type: 'authorizeFile', caseId, handoffKey: key, note }
    return { type: 'saveDraft', caseId, handoffKey: key, note }
  }

  const hitlAction = useCallback(
    async (
      runId: string,
      action: 'approve' | 'request_changes' | 'authorize',
      note?: string,
    ): Promise<{ ok: boolean; message: string }> => {
      const run = runs.find((r) => r.id === runId)
      if (!run) return { ok: false, message: '运行不存在' }
      if (run.status !== 'needs_human' && !run.hitlPending) {
        return { ok: false, message: '当前不在待你确认状态' }
      }

      const key = handoffKeyForAgent(run.agentId)

      if (action === 'authorize') {
        const block = hasBlockingInvoiceForCase(run.caseId)
        if (block.blocked && role === 'agency') {
          return {
            ok: false,
            message: block.reason ?? '存在逾期/未结发票，无法授权递交',
          }
        }
      }

      // Role-aware chain: try plausible handoff steps; always close HITL UX
      const attempts: HandoffAction[] =
        action === 'request_changes'
          ? ['request_changes']
          : action === 'authorize'
            ? role === 'enterprise'
              ? ['submit', 'start_review', 'authorize']
              : ['submit', 'authorize']
            : role === 'enterprise'
              ? ['submit', 'start_review', 'approve']
              : ['submit']

      let last = { ok: false, message: '未执行交接' }
      for (const a of attempts) {
        const cmd = buildCmdForAction(
          run.caseId,
          key,
          a,
          note ??
            (a === 'submit'
              ? '知产 Agent 产物提交企业审核'
              : a === 'approve'
                ? '知产 Agent 批准策略'
                : a === 'authorize'
                  ? '知产 Agent 授权递交'
                  : '知产 Agent 退回修改'),
        )
        const r = await dispatchCommand(cmd, {
          actor: 'agent',
          agentId: run.agentId,
          detail: `运行确认 ${action} → ${cmd.type}`,
        })
        if (r.ok) {
          last = r
          setLastAppliedCommandLabel(COMMAND_LABELS[cmd.type])
        }
      }

      const art = run.artifacts[run.artifacts.length - 1]
      if (art && action !== 'request_changes') {
        addArtifact(run.caseId, art.title, art.kind)
      }

      const title =
        action === 'authorize'
          ? '已授权递交'
          : action === 'approve'
            ? role === 'agency'
              ? '已提交企业审核'
              : '已批准策略'
            : '已退回修改'

      setRuns((prev) =>
        prev.map((r) => {
          if (r.id !== runId) return r
          const sys: AgentStep = {
            id: `st-hitl-${Date.now()}`,
            kind: 'system',
            title,
            content:
              (last.ok ? last.message : `${title}（交接：${last.message}）`) +
              (art && action !== 'request_changes'
                ? ` · 产物「${art.title}」已回写案件`
                : ''),
            at: `${nowIso()} ${nowStamp()}`,
          }
          return {
            ...r,
            status: action === 'request_changes' ? 'running' : 'done',
            hitlPending: false,
            scriptIndex: action === 'request_changes' ? 0 : r.scriptIndex,
            steps: [...r.steps, sys],
            updatedAt: nowIso(),
          }
        }),
      )
      addActivity(`知产 Agent 运行 ${runId.slice(-6)} 确认：${title}`)
      return {
        ok: true,
        message: last.ok ? last.message : `${title} · ${last.message}`,
      }
    },
    [
      runs,
      dispatchCommand,
      addArtifact,
      addActivity,
      hasBlockingInvoiceForCase,
      role,
    ],
  )


  const visibleSessions = useMemo(
    () =>
      sessions.filter((s) => {
        if (s.caseId && !canAccessCase(s.caseId)) return false
        if (s.archived && !showArchivedSessions) return false
        return true
      }),
    [sessions, canAccessCase, showArchivedSessions],
  )

  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id),
    [sessions],
  )

  const createSession = useCallback(
    (input: {
      goal: string
      agentId: string | 'auto'
      caseId?: string
      title?: string
      /** Beta/Assist：须 UI 已确认；缺省则拒绝（Auto 改荐 Core） */
      confirmedNonCoreTier?: boolean
    }): AgentSession | null => {
      // Fix3：发明人/委员不可新建会话（与 personaRouteAccess 同口径）
      if (!personaCanCreateAgentSession(persona)) {
        return null
      }
      const caseForCreate = input.caseId ? getCase(input.caseId) : undefined
      const stageKey = caseForCreate
        ? handoffKeyForAgent(
            (
              {
                pre_research: 'agent-research',
                decision: 'agent-intake',
                drafting: 'agent-claims',
                prosecution: 'agent-oa',
                maintenance: 'agent-annuity',
                commercialization: 'agent-monetize',
                monitoring: 'agent-watch',
              } as Record<string, string>
            )[caseForCreate.stage] ?? 'agent-research',
          )
        : undefined
      const agentId =
        input.agentId === 'auto'
          ? suggestAgent({
              stage: caseForCreate?.stage,
              goal: input.goal,
              workspaceKind: workspace.kind,
              handoffStatus:
                input.caseId && stageKey
                  ? getHandoff(input.caseId, stageKey)
                  : undefined,
            }).agent.id
          : input.agentId
      let resolvedAgentId = agentId
      let agent = getAgent(resolvedAgentId)
      // Beta/Assist 诚实：无确认则拒绝；Auto 改荐 Core 调研
      if (
        agent &&
        (agent.tier === 'beta' || agent.tier === 'assist') &&
        !input.confirmedNonCoreTier
      ) {
        if (input.agentId === 'auto') {
          resolvedAgentId = 'agent-research'
          agent = getAgent(resolvedAgentId)
        } else {
          return null
        }
      }
      const title =
        input.title?.trim() ||
        (caseForCreate
          ? `${caseForCreate.title} · ${agent?.name ?? '自动匹配'}`
          : input.goal.trim().slice(0, 28) || `新会话 · ${agent?.name ?? '自动匹配'}`)
      const sess: AgentSession = {
        id: `sess-${Date.now()}`,
        title,
        agentId: input.agentId === 'auto' ? 'auto' : resolvedAgentId,
        caseId: input.caseId,
        goal: input.goal.trim() || defaultSessionGoal(agent, { hasCase: !!input.caseId }),
        status: 'queued',
        steps: [
          {
            id: `st-${Date.now()}`,
            kind: 'system',
            title: '会话已创建',
            content: `已为「${agent?.name ?? '自动匹配'}」备好会话 · 在底部启动，或从 ⋯ 预览`,
            at: `${nowIso()} ${nowStamp()}`,
          },
        ],
        artifacts: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
        scriptIndex: 0,
        hitlPending: false,
      }
      setSessions((prev) => [sess, ...prev])
      addActivity(`新建会话：${title}`)
      return sess
    },
    [addActivity, getCase, getHandoff, workspace.kind, persona],
  )

  const patchSession = useCallback(
    (
      sessionId: string,
      patch: Partial<
        Pick<
          AgentSession,
          | 'goal'
          | 'agentId'
          | 'caseId'
          | 'title'
          | 'clearedHitlGates'
          | 'archived'
          | 'failReason'
          | 'status'
          | 'hitlPending'
          | 'oaStatementConfirmed'
        | 'oaIssueType'
        | 'oaStrategyNotes'
        >
      >,
    ) => {
      let linkedCaseId: string | undefined
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          linkedCaseId = s.caseId
          return { ...s, ...patch, updatedAt: nowIso() }
        }),
      )
      // 案级为源：Agent 确认陈述 → 镜像案级（若已同值则跳过，避免与工作台回写互踢）
      if (
        typeof patch.oaStatementConfirmed === 'boolean' &&
        linkedCaseId &&
        !!getCase(linkedCaseId)?.oaStatementConfirmed !== patch.oaStatementConfirmed
      ) {
        setOaStatementConfirmed(linkedCaseId, patch.oaStatementConfirmed)
      }
    },
    [setOaStatementConfirmed, getCase],
  )

  const archiveSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, archived: true, updatedAt: nowIso() }
          : s,
      ),
    )
  }, [])

  const updateSessionArtifact = useCallback(
    (sessionId: string, artifactId: string, content: string) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          return {
            ...s,
            artifacts: s.artifacts.map((a) =>
              a.id === artifactId ? { ...a, content } : a,
            ),
            updatedAt: nowIso(),
          }
        }),
      )
    },
    [],
  )

  const stopSessionPlay = useCallback((sessionId: string) => {
    stopPlay(sessionId)
  }, [stopPlay])

  const isSessionPlaying = useCallback(
    (sessionId: string) => isPlaying(sessionId),
    [isPlaying],
  )

  const playMockSession = useCallback(
    (
      sessionId: string,
      overrides?: Partial<Pick<AgentSession, 'agentId' | 'goal' | 'caseId'>> & {
        mode?: 'dry-run' | 'formal'
      },
    ) => {
      const sess = sessions.find((s) => s.id === sessionId)
      if (!sess) return
      stopPlay(sessionId)

      const mode = overrides?.mode ?? 'dry-run'
      modeRef.current[sessionId] = mode

      const agentId = overrides?.agentId ?? sess.agentId
      const caseIdForSuggest = overrides?.caseId ?? sess.caseId
      const caseForSuggest = caseIdForSuggest
        ? getCase(caseIdForSuggest)
        : undefined
      const stageKeySuggest = caseForSuggest
        ? handoffKeyForAgent(
            (
              {
                pre_research: 'agent-research',
                decision: 'agent-intake',
                drafting: 'agent-claims',
                prosecution: 'agent-oa',
                maintenance: 'agent-annuity',
                commercialization: 'agent-monetize',
                monitoring: 'agent-watch',
              } as Record<string, string>
            )[caseForSuggest.stage] ?? 'agent-research',
          )
        : undefined
      const resolvedAgentId =
        agentId === 'auto'
          ? suggestAgent({
              stage: caseForSuggest?.stage,
              goal: overrides?.goal ?? sess.goal,
              workspaceKind: workspace.kind,
              handoffStatus:
                caseIdForSuggest && stageKeySuggest
                  ? getHandoff(caseIdForSuggest, stageKeySuggest)
                  : undefined,
            }).agent.id
          : agentId
      const script = AGENT_SCRIPTS[resolvedAgentId] ?? AGENT_SCRIPTS['agent-research']
      let idx = sess.scriptIndex
      const restart = idx >= script.length
      if (restart) idx = 0

      const caseId = overrides?.caseId ?? sess.caseId
      playingRef.current[sessionId] = true
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          const { mode: _m, ...restOverrides } = overrides ?? {}
          void _m
          const base = { ...s, ...restOverrides }
          return {
            ...base,
            scriptIndex: restart ? 0 : base.scriptIndex,
            status: 'running' as const,
            hitlPending: false,
            failReason: undefined,
            clearedHitlGates: restart ? [] : base.clearedHitlGates,
            updatedAt: nowIso(),
            steps: [
              ...(restart
                ? [
                    ...base.steps,
                    {
                      id: `st-restart-${Date.now()}`,
                      kind: 'system' as const,
                      title: mode === 'formal' ? '正式执行（写入领域）' : '重新预览',
                      content:
                        mode === 'formal'
                          ? '正式模式：工具成功后将调用 dispatchCommand 写入业务状态；需你确认的步骤仍不可跳过。'
                          : '预览：仅追加办理记录，不写入业务台账。',
                      at: `${nowIso()} ${nowStamp()}`,
                    },
                  ]
                : [
                    ...base.steps,
                    {
                      id: `st-mode-${Date.now()}`,
                      kind: 'system' as const,
                      title: mode === 'formal' ? '正式执行' : '预览',
                      content:
                        mode === 'formal'
                          ? '正式模式：关联案件后工具成功将写入领域命令；仍须经你批准确认。'
                          : '预览：仅办理记录，不调用业务写入。',
                      at: `${nowIso()} ${nowStamp()}`,
                    },
                  ]),
            ],
          }
        }),
      )
      bump((n) => n + 1)

      const timers: number[] = []
      let cursor = idx
      const scheduleNext = (delay: number) => {
        const t = window.setTimeout(() => {
          if (!playingRef.current[sessionId]) return
          if (cursor >= script.length) {
            playingRef.current[sessionId] = false
            bump((n) => n + 1)
            return
          }
          const item = script[cursor]
          const stepId = `st-${sessionId}-${cursor}-${Date.now()}`
          let newArtifact: AgentArtifactDoc | undefined
          if (item.artifact) {
            newArtifact = {
              id: `art-${sessionId}-${cursor}`,
              ...item.artifact,
            }
          }
          const step: AgentStep = {
            id: stepId,
            kind: item.kind,
            title: item.title,
            content: item.content,
            toolName: item.toolName,
            toolArgs: item.toolArgs,
            toolResultPreview: item.toolResultPreview,
            artifactId: newArtifact?.id,
            at: `${nowIso()} ${nowStamp()}`,
          }
          const isHitl = item.kind === 'question_to_human'

          // Fix · Seal Gate · Layout：正式 play 禁 HITL 前抢跑建案/派所
          // 工具卡仅 dry 预览「待批准后写入」；建案+派所仅在 sessionHitlAction approve
          let domainNote: AgentStep | null = null
          if (
            mode === 'formal' &&
            item.kind === 'tool_call' &&
            item.toolName
          ) {
            const mapped = TOOL_TO_COMMAND[item.toolName]
            if (mapped === 'createCaseFromInsight') {
              const title =
                typeof item.toolArgs?.title === 'string'
                  ? item.toolArgs.title
                  : '布局洞察补强案件'
              domainNote = {
                id: `st-domain-tool-${Date.now()}`,
                kind: 'system',
                title: '待批准后写入',
                content: `dry 预览 · ${item.toolName} → ${COMMAND_LABELS.createCaseFromInsight}（${title}）· 对齐护栏「批准后再建案」· 请在 ConfirmBar 批准策略后写入`,
                at: `${nowIso()} ${nowStamp()}`,
              }
            } else if (mapped === 'assignAgency') {
              const agencyName =
                typeof item.toolArgs?.agencyName === 'string'
                  ? item.toolArgs.agencyName
                  : '北京德恒知识产权代理有限公司'
              domainNote = {
                id: `st-domain-tool-${Date.now()}`,
                kind: 'system',
                title: '待批准后写入',
                content: `dry 预览 · ${item.toolName} → ${COMMAND_LABELS.assignAgency}（${agencyName}）· 批准策略后与建案一并派所`,
                at: `${nowIso()} ${nowStamp()}`,
              }
            }
          }

          // Formal: on artifact generation, mark domain-ready but do NOT skip HITL
          if (mode === 'formal' && caseId && item.kind === 'artifact') {
            const prep: Record<string, string> = {
              'agent-research':
                '调研产物已就绪；正式提交须经你「批准策略」→ SubmitResearch / ApproveHandoff',
              'agent-oa':
                'OA 答复产物已就绪；授权递交后可 FileResponse 回写 Docket',
              'agent-disclosure':
                '交底结构化产物已就绪；须经你「批准策略」→ SaveDraft / SubmitHandoff / ApproveHandoff',
              'agent-claims':
                '权利要求草稿已就绪；须经你「批准策略」→ SubmitClaims / ApproveHandoff',
              'agent-intake':
                '立项/报价草案已就绪；须经你「立项决定」+「确认报价」后写回报价',
              'agent-annuity':
                '年费计划已就绪；须经你「付款解锁」→ PayInvoice + FileResponse 回写 Docket',
              'agent-watch':
                '监控告警已就绪；须经你选择处置（确认告警 / 升级维权 / 关闭）→ submit/approve watch_alert',
              'agent-monetize':
                '转化条款已就绪；须经你批准商务策略；法务会签/合同状态在工作台（beta · 非合同 PDF）',
              'agent-layout':
                '布局洞察已就绪；须经你「批准策略」→ CreateCaseFromInsight / AssignAgency（layout_insight，不占用调研报告）',
            }
            if (prep[resolvedAgentId]) {
              domainNote = {
                id: `st-domain-prep-${Date.now()}`,
                kind: 'system',
                title: '稿件已就绪，等待你确认',
                content: prep[resolvedAgentId],
                at: `${nowIso()} ${nowStamp()}`,
              }
            }
          }

          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== sessionId) return s
              const steps = [...s.steps, step, ...(domainNote ? [domainNote] : [])]
              return {
                ...s,
                steps,
                artifacts: newArtifact
                  ? [
                      ...s.artifacts.filter((a) => a.title !== newArtifact!.title),
                      newArtifact!,
                    ]
                  : s.artifacts,
                scriptIndex: cursor + 1,
                status: isHitl ? 'needs_human' : 'running',
                hitlPending: isHitl,
                updatedAt: nowIso(),
              }
            }),
          )
          cursor += 1
          if (isHitl) {
            // Fix · Seal Gate · 交底：取消剧本到达自动勾齐；仅提示手勾确认
            if (resolvedAgentId === 'agent-disclosure' && caseId) {
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== sessionId) return s
                  return {
                    ...s,
                    steps: [
                      ...s.steps,
                      {
                        id: `st-disc-hint-${Date.now()}`,
                        kind: 'system' as const,
                        title: '请确认齐套勾选',
                        content:
                          '交底包齐套须你在 ConfirmBar 手勾确认（不再自动勾齐）· 未齐套不可批准策略',
                        at: `${nowIso()} ${nowStamp()}`,
                      },
                    ],
                  }
                }),
              )
            }
            playingRef.current[sessionId] = false
            bump((n) => n + 1)
            return
          }
          scheduleNext(700 + Math.random() * 500)
        }, delay)
        timers.push(t)
        timersRef.current[sessionId] = timers
      }
      scheduleNext(400)
    },
    [sessions, stopPlay, getCase],
  )

  const sessionHitlAction = useCallback(
    async (
      sessionId: string,
      action: HitlSessionAction,
      note?: string,
      opts?: { stepwise?: boolean },
    ): Promise<HitlActionResult> => {
      const sess = sessions.find((s) => s.id === sessionId)
      if (!sess) return { ok: false, message: '会话不存在' }
      if (sess.status !== 'needs_human' && !sess.hitlPending) {
        return { ok: false, message: '当前不在待你确认状态' }
      }

      const caseHitl = sess.caseId ? getCase(sess.caseId) : undefined
      const resolvedAgentId =
        sess.agentId === 'auto'
          ? suggestAgent({
              stage: caseHitl?.stage,
              goal: sess.goal,
              workspaceKind: workspace.kind,
              handoffStatus:
                sess.caseId && caseHitl
                  ? getHandoff(
                      sess.caseId,
                      handoffKeyForAgent(
                        (
                          {
                            pre_research: 'agent-research',
                            decision: 'agent-intake',
                            drafting: 'agent-claims',
                            prosecution: 'agent-oa',
                            maintenance: 'agent-annuity',
                            commercialization: 'agent-monetize',
                            monitoring: 'agent-watch',
                          } as Record<string, string>
                        )[caseHitl.stage] ?? 'agent-research',
                      ),
                    )
                  : undefined,
            }).agent.id
          : sess.agentId
      const key = handoffKeyForAgent(resolvedAgentId)
      const agentDef = getAgent(resolvedAgentId)
      const gates = agentDef?.hitlGates ?? []
      const cleared = [...(sess.clearedHitlGates ?? [])]

      const normalize = (
        a: HitlSessionAction,
      ):
        | 'approve_strategy'
        | 'authorize_file'
        | 'confirm_quote'
        | 'go_nogo'
        | 'pay_unlock'
        | 'request_changes' => {
        if (a === 'approve' || a === 'approve_strategy') return 'approve_strategy'
        if (a === 'authorize' || a === 'authorize_file') return 'authorize_file'
        if (a === 'confirm_quote') return 'confirm_quote'
        if (a === 'go_nogo') return 'go_nogo'
        if (a === 'pay_unlock') return 'pay_unlock'
        return 'request_changes'
      }
      const gate = normalize(action)

      const enterpriseOnly: Array<typeof gate> = [
        'approve_strategy',
        'go_nogo',
        'confirm_quote',
        'pay_unlock',
        'authorize_file',
      ]
      if (enterpriseOnly.includes(gate) && role !== 'enterprise') {
        if (!(gate === 'approve_strategy' && role === 'agency')) {
          return {
            ok: false,
            message:
              gate === 'authorize_file'
                ? '仅企业可授权递交；代理所在授权后可递交归档'
                : gate === 'pay_unlock'
                  ? '仅企业可付款解锁（财务 / IP 预算）'
                  : '仅企业角色可执行此确认步骤（批准 / Go / 确认报价）',
          }
        }
      }

      if (gate === 'authorize_file' && sess.caseId) {
        const block = hasBlockingInvoiceForCase(sess.caseId)
        if (block.blocked && role === 'agency') {
          return {
            ok: false,
            message: block.reason ?? '存在逾期/未结发票，无法授权递交',
          }
        }
        if (resolvedAgentId === 'agent-claims' || key === 'draft_claims') {
          const fc = getDraftFilingCheck(sess.caseId)
          const n = Object.values(fc).filter(Boolean).length
          if (n < 5) {
            return {
              ok: false,
              message: `递交清单未齐套（${n}/5）· 请先完成撰写五清单后再授权递交`,
            }
          }
        }
        const scope = fullCheckScopeFor(resolvedAgentId, key)
        if (scope) {
          const caseOa = getCase(sess.caseId)?.oaStatementConfirmed
          const fcResult = evaluateFullCheck({
            scope,
            disclosureStatus: getHandoff(sess.caseId, 'disclosure_pack'),
            filingCheck: getDraftFilingCheck(sess.caseId),
            lite: getFullCheckLite(sess.caseId),
            oaStatementConfirmed: !!(caseOa || sess.oaStatementConfirmed),
            oaIssueType: sess.oaIssueType,
            oaStrategyNotes: sess.oaStrategyNotes,
          })
          if (!fcResult.ok) {
            return {
              ok: false,
              message: `Full-check 未过：${fcResult.missing.slice(0, 3).join('；')}`,
            }
          }
        }
      }

      // OA：争点类型 + 策略要点后再 HITL（批准策略）
      if (
        gate === 'approve_strategy' &&
        (resolvedAgentId === 'agent-oa' || key === 'prosecution_response')
      ) {
        if (!sess.oaIssueType || !sess.oaStrategyNotes?.trim()) {
          return {
            ok: false,
            message: '请先选择 OA 争点类型并填写策略要点后再批准',
          }
        }
      }

      // Fix · Seal Gate · 交底齐套下沉：approve 写库前硬校验
      if (
        gate === 'approve_strategy' &&
        (resolvedAgentId === 'agent-disclosure' || key === 'disclosure_pack') &&
        sess.caseId
      ) {
        const pack = getDisclosurePackCheck(sess.caseId)
        if (!disclosurePackComplete(pack)) {
          const n = Object.values(pack).filter(Boolean).length
          const missing = DISCLOSURE_PACK_CHECK_ITEMS.filter((i) => !pack[i.id])
            .map((i) => i.label)
            .slice(0, 3)
          return {
            ok: false,
            message: `交底包未齐套（${n}/6）· 请先勾选 ConfirmBar · 缺 ${missing.join('、')}${missing.length >= 3 ? '…' : ''}`,
          }
        }
      }

      // Fix · Seal Gate · Claims：交底未批则禁止批准策略写库
      if (
        gate === 'approve_strategy' &&
        (resolvedAgentId === 'agent-claims' || key === 'draft_claims') &&
        sess.caseId
      ) {
        const dh = getHandoff(sess.caseId, 'disclosure_pack')
        const ok =
          dh === 'approved' || dh === 'authorized_to_file' || dh === 'filed'
        if (!ok) {
          return {
            ok: false,
            message: '交底包未批准 · 请先完成交底整理/门户后再批准权利要求策略',
          }
        }
      }

      // Fix · Seal Gate · Research：写库前须 ≥1 条可核验命中（pubNo+url）
      if (
        gate === 'approve_strategy' &&
        (resolvedAgentId === 'agent-research' ||
          (key === 'research_report' && resolvedAgentId !== 'agent-layout')) &&
        sess.caseId
      ) {
        if (!sessionHasVerifiableResearchHits(sess)) {
          return {
            ok: false,
            message:
              '调研命中未齐 · 须 ≥1 条含 pubNo+url 的可核验命中（对齐工作台 hits_verifiable）· 请重跑正式办理或补充产物',
          }
        }
      }

      const appliedLabels: string[] = []
      let last = { ok: true, message: '确认已记录' }
      let layoutDeepLinkCaseId: string | undefined
      const metaBase = {
        actor: 'agent' as const,
        agentId: resolvedAgentId,
      }

      const runCmd = async (cmd: DomainCommand, detail: string) => {
        const r = await dispatchCommand(cmd, { ...metaBase, detail })
        if (r.ok) {
          appliedLabels.push(COMMAND_LABELS[cmd.type])
          setLastAppliedCommandLabel(COMMAND_LABELS[cmd.type])
          last = { ok: true, message: r.message }
        } else {
          last = { ok: false, message: r.message }
        }
        return r
      }

      const buildApproveCmd = (
        caseId: string,
        handoffKey: ReturnType<typeof handoffKeyForAgent>,
        a: HandoffAction,
        n?: string,
      ): DomainCommand => {
        if (resolvedAgentId === 'agent-disclosure' && a === 'approve') {
          return {
            type: 'approveHandoff',
            caseId,
            handoffKey,
            note: n,
          }
        }
        return buildCmdForAction(caseId, handoffKey, a, n)
      }

      const stepwise = !!opts?.stepwise
      let chainComplete = true
      const currentHandoff = sess.caseId ? getHandoff(sess.caseId, key) : undefined
      const selectAttempts = (
        attempts: HandoffAction[],
      ): { run: HandoffAction[]; complete: boolean } => {
        if (!stepwise) return { run: attempts, complete: true }
        const next = pickNextHandoffAction(attempts, currentHandoff)
        if (!next) return { run: [], complete: true }
        return { run: [next], complete: next === attempts[attempts.length - 1] }
      }

      if (sess.caseId) {
        if (gate === 'pay_unlock') {
          const caze = getCase(sess.caseId)
          const invoices = caze?.engagement.invoices ?? []
          const target =
            invoices.find((i) => i.status === '逾期') ||
            invoices.find((i) => i.status === '已开票') ||
            invoices.find((i) => i.status === '待开票')
          const annuityAttempts: HandoffAction[] =
            role === 'enterprise'
              ? ['submit', 'start_review', 'approve', 'file']
              : ['submit']
          const runAnnuity = async (attempts: HandoffAction[], skipFile: boolean) => {
            const picked = selectAttempts(attempts)
            if (stepwise && !picked.complete) chainComplete = false
            for (const a of picked.run) {
              if (skipFile && a === 'file') {
                // Fix V · 闸完成至批准；归档一律 ConfirmBar 回执表单，禁静默 AN-PAY
                chainComplete = true
                last = {
                  ok: true,
                  message:
                    '年费已批准 · 请填写回执号后归档（与 OA 同构，勿静默编号）',
                }
                continue
              }
              const cmd = buildCmdForAction(
                sess.caseId!,
                'maintain_annuity',
                a,
                note ??
                  (a === 'file'
                    ? '付款解锁确认 → 年费缴纳 Docket 回写'
                    : a === 'submit'
                      ? '付款解锁确认 → 提交年费计划'
                      : '付款解锁确认 → 年费交接'),
              )
              await runCmd(cmd, `付款解锁确认 → ${cmd.type}`)
            }
          }
          if (target) {
            await runCmd(
              { type: 'payInvoice', caseId: sess.caseId, invoiceId: target.id },
              `付款解锁确认 → payInvoice ${target.id}`,
            )
            if (!last.ok) {
              return { ok: false, message: last.message }
            }
            if (stepwise) {
              chainComplete = false
            } else if (
              resolvedAgentId === 'agent-annuity' ||
              key === 'maintain_annuity'
            ) {
              // Fix V · 非逐步也不自动 file/AN-PAY；串到 approve，file 走 ConfirmBar
              await runAnnuity(annuityAttempts, true)
            }
          } else if (invoices.length === 0) {
            return {
              ok: false,
              message:
                '本案暂无待付发票，无法付款解锁 · 请先在费用中心开票/入账后再回来确认（/billing/cases）',
            }
          } else if (
            resolvedAgentId === 'agent-annuity' ||
            key === 'maintain_annuity'
          ) {
            // 票已付清：可串到 approve；file 一律走 ConfirmBar 回执（逐步/非逐步同构）
            await runAnnuity(annuityAttempts, true)
          }
        } else if (gate === 'confirm_quote') {
          if (role === 'enterprise') {
            const prelude: HandoffAction[] = ['submit', 'start_review']
            const picked = selectAttempts(prelude)
            for (const a of picked.run) {
              if (a === 'submit') {
                await runCmd(
                  {
                    type: 'submitHandoff',
                    caseId: sess.caseId,
                    handoffKey: key,
                    note: note ?? '确认报价前提交',
                  },
                  '确认报价 → submitHandoff',
                )
              } else if (a === 'start_review') {
                await runCmd(
                  {
                    type: 'startReview',
                    caseId: sess.caseId,
                    handoffKey: key,
                    note: note ?? '确认报价前审核',
                  },
                  '确认报价 → startReview',
                )
              }
            }
            const preludeNext = stepwise
              ? pickNextHandoffAction(prelude, currentHandoff)
              : undefined
            if (preludeNext) {
              chainComplete = false
            } else {
              await runCmd(
                {
                  type: 'confirmQuote',
                  caseId: sess.caseId,
                  note: note ?? '确认报价',
                },
                '确认报价 → confirmQuote',
              )
            }
          } else {
            await runCmd(
              {
                type: 'confirmQuote',
                caseId: sess.caseId,
                note: note ?? '确认报价',
              },
              '确认报价 → confirmQuote',
            )
          }
        } else if (gate === 'go_nogo') {
          // Go 意向：只 submit(+start_review)；禁止对企业 intake_quote 调 confirmQuote
          const attempts: HandoffAction[] =
            role === 'enterprise'
              ? ['submit', 'start_review']
              : ['submit']
          const picked = selectAttempts(attempts)
          if (stepwise && !picked.complete) chainComplete = false
          for (const a of picked.run) {
            const cmd = buildApproveCmd(
              sess.caseId,
              key,
              a,
              note ??
                (a === 'submit'
                  ? '立项 Go 提交草案'
                  : '立项 Go 进入审核'),
            )
            await runCmd(cmd, `立项确认 → ${cmd.type}`)
          }
        } else if (gate === 'authorize_file') {
          const attempts: HandoffAction[] =
            role === 'enterprise'
              ? ['submit', 'start_review', 'authorize']
              : ['submit', 'authorize']
          const picked = selectAttempts(attempts)
          if (stepwise && !picked.complete) chainComplete = false
          for (const a of picked.run) {
            const cmd = buildCmdForAction(
              sess.caseId,
              key,
              a,
              note ??
                (a === 'authorize'
                  ? '知产 Agent 授权递交'
                  : a === 'submit'
                    ? '知产 Agent 产物提交企业审核'
                    : '知产 Agent 进入审核'),
            )
            await runCmd(cmd, `授权递交确认 → ${cmd.type}`)
          }
        } else if (gate === 'request_changes') {
          const cmd = buildCmdForAction(
            sess.caseId,
            key,
            'request_changes',
            note ?? '知产 Agent 退回修改',
          )
          await runCmd(cmd, `退回修改 → ${cmd.type}`)
        } else {
          const attempts: HandoffAction[] =
            role === 'enterprise'
              ? ['submit', 'start_review', 'approve']
              : ['submit']
          const picked = selectAttempts(attempts)
          if (stepwise && !picked.complete) chainComplete = false
          for (const a of picked.run) {
            const cmd = buildApproveCmd(
              sess.caseId,
              key,
              a,
              note ??
                (a === 'submit'
                  ? '知产 Agent 产物提交企业审核'
                  : a === 'approve'
                    ? '知产 Agent 批准策略'
                    : '知产 Agent 进入审核'),
            )
            await runCmd(cmd, `批准策略 → ${cmd.type}`)
          }
          if (
            resolvedAgentId === 'agent-layout' &&
            role === 'enterprise' &&
            (!stepwise || picked.run.includes('approve'))
          ) {
            const existingInsight = insightCaseRef.current[sessionId]
            if (existingInsight) {
              layoutDeepLinkCaseId = existingInsight
              await runCmd(
                {
                  type: 'assignAgency',
                  caseId: existingInsight,
                  agencyName: '北京德恒知识产权代理有限公司',
                },
                '批准策略 → assignAgency (insight case)',
              )
            } else {
              const created = await runCmd(
                {
                  type: 'createCaseFromInsight',
                  title: '多租户隔离调度 · 能耗窗口补强',
                  stage: 'pre_research',
                  summary:
                    note ??
                    '布局洞察经你确认后由 CreateCaseFromInsight 建案',
                  fromInsight: true,
                  agencyName: '北京德恒知识产权代理有限公司',
                },
                '批准策略 → createCaseFromInsight',
              )
              if (created.ok && created.caseId) {
                insightCaseRef.current[sessionId] = created.caseId
                layoutDeepLinkCaseId = created.caseId
                await runCmd(
                  {
                    type: 'assignAgency',
                    caseId: created.caseId,
                    agencyName: '北京德恒知识产权代理有限公司',
                  },
                  '批准策略 → assignAgency',
                )
              }
            }
          }
        }

        const art = sess.artifacts[sess.artifacts.length - 1]
        if (art && gate !== 'request_changes') {
          addArtifact(sess.caseId, art.title, art.kind)
        }
      } else if (gate === 'pay_unlock') {
        return { ok: false, message: '请先关联案件后再付款解锁' }
      }

      const gateIdForClear: HitlGateId | null =
        gate === 'request_changes'
          ? null
          : (gate as HitlGateId)

      if (chainComplete && gateIdForClear && !cleared.includes(gateIdForClear)) {
        cleared.push(gateIdForClear)
      }

      // Fix S · Watch 写库门闩：仅企业 approve 链真正完成（chainComplete）才写告警 store
      // 代理仅 submit / 逐步首击未 complete：只写 note/activity，不 processWatchAlert
      let watchStoreSynced = false
      let watchStoreDeferred = false
      if (
        sess.caseId &&
        (resolvedAgentId === 'agent-watch' || key === 'watch_alert') &&
        gate === 'approve_strategy' &&
        note
      ) {
        const wantsDisposition =
          note.includes('升级维权') ||
          note.includes('关闭') ||
          note.includes('确认告警')
        if (wantsDisposition) {
          if (last.ok && chainComplete && role === 'enterprise') {
            let alertStatus: '已确认' | '已升级' | '已关闭' | null = null
            if (note.includes('升级维权')) alertStatus = '已升级'
            else if (note.includes('关闭')) alertStatus = '已关闭'
            else if (note.includes('确认告警')) alertStatus = '已确认'
            if (alertStatus) {
              const caze = getCase(sess.caseId)
              const list = getWatchAlerts(sess.caseId)
              const targetId =
                caze?.linkedAlertId &&
                list.some((a) => a.id === caze.linkedAlertId)
                  ? caze.linkedAlertId
                  : list.find((a) => a.status === '待处理')?.id ?? list[0]?.id
              if (targetId) {
                processWatchAlert(sess.caseId, targetId, alertStatus)
                watchStoreSynced = true
              }
            }
          } else {
            watchStoreDeferred = true
          }
        }
      }

      const dispositionTitle = (): string | null => {
        if (!note) return null
        if (note.includes('升级维权'))
          return role === 'agency' ? '已提交企业审核（升级维权）' : '已升级维权'
        if (note.includes('关闭'))
          return role === 'agency' ? '已提交企业审核（关闭）' : '已关闭告警'
        if (note.includes('确认告警'))
          return role === 'agency' ? '已提交企业审核（确认告警）' : '已确认告警'
        if (note.includes('法务已阅')) return '已标记法务已阅（演示）'
        return null
      }

      const title =
        gate === 'authorize_file'
          ? '已授权递交'
          : gate === 'confirm_quote'
            ? '已确认报价'
            : gate === 'go_nogo'
              ? '已确认立项 Go'
              : gate === 'pay_unlock'
                ? '已付款解锁'
                : gate === 'approve_strategy'
                  ? dispositionTitle() ??
                    (role === 'agency' ? '已提交企业审核' : '已批准策略')
                  : '已退回修改'

      const domainStrip =
        appliedLabels.length > 0
          ? ` · 已写入领域：${appliedLabels.join(' → ')}`
          : ''

      const remaining = gates.filter((g) => !cleared.includes(g))
      const stillNeeds = gate !== 'request_changes' && remaining.length > 0

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          const sys: AgentStep = {
            id: `st-hitl-${Date.now()}`,
            kind: 'system',
            title,
            content:
              (last.ok ? last.message : `${title}（${last.message}）`) +
              domainStrip +
              (note ? ` · ${note}` : '') +
              (sess.caseId && gate !== 'request_changes' && sess.artifacts.length
                ? ' · 产物已回写案件'
                : '') +
              (stillNeeds
                ? ` · 仍待确认：${remaining.join(', ')}`
                : '') +
              (gateIdForClear ? ` · 已完成确认步骤 ${gateIdForClear}` : '') +
              (watchStoreSynced
                ? ' · 已同步告警台账'
                : watchStoreDeferred
                  ? ' · 告警台账将在批准完成后同步'
                  : ''),
            at: `${nowIso()} ${nowStamp()}`,
          }
          return {
            ...s,
            status:
              gate === 'request_changes'
                ? 'running'
                : stillNeeds
                  ? 'needs_human'
                  : 'done',
            hitlPending: stillNeeds,
            clearedHitlGates: cleared,
            scriptIndex: gate === 'request_changes' ? 0 : s.scriptIndex,
            steps: [...s.steps, sys],
            updatedAt: nowIso(),
          }
        }),
      )
      if (sess.caseId && last.ok && gate !== 'request_changes' && chainComplete) {
        if (gate === 'approve_strategy') {
          const oaBit =
            sess.oaIssueType &&
            (resolvedAgentId === 'agent-oa' || key === 'prosecution_response')
              ? ` · 争点 ${OA_ISSUE_TYPE_LABELS[sess.oaIssueType]}`
              : ''
          appendCaseDriveItem(sess.caseId, {
            kind:
              resolvedAgentId === 'agent-oa' || key === 'prosecution_response'
                ? 'oa_confirm'
                : resolvedAgentId === 'agent-research' || key === 'research_report'
                  ? 'research_note'
                  : 'approval',
            title: title,
            // 与工作台 Drive 摘要口径薄对齐（勿写裸 agentId）
            summary:
              resolvedAgentId === 'agent-oa' || key === 'prosecution_response'
                ? `${oaBit ? oaBit.replace(/^ · /, '') : 'OA 陈述确认'}${note ? ` · ${note}` : ''}`
                : resolvedAgentId === 'agent-research' || key === 'research_report'
                  ? `调研批准${note ? ` · ${note}` : ''}`
                  : resolvedAgentId === 'agent-claims' || key === 'draft_claims'
                    ? `权利要求批准${note ? ` · ${note}` : ''}`
                    : `${title}${note ? ` · ${note}` : ''}`,
            source: 'agent-hitl',
          })
        }
      }

      addActivity(
        `知产 Agent 会话 ${sessionId.slice(-6)} 确认：${title}${domainStrip}${note ? ` · ${note}` : ''}`,
      )
      const baseMsg =
        (last.ok ? last.message : `${title} · ${last.message}`) + domainStrip
      const midOk =
        last.ok &&
        !!sess.caseId &&
        gate !== 'request_changes' &&
        (appliedLabels.length > 0 || domainStrip.includes('已写入'))
      const navigateTo = layoutDeepLinkCaseId
        ? `/workbench/research/${layoutDeepLinkCaseId}`
        : resolvedAgentId === 'agent-monetize' &&
            sess.caseId &&
            last.ok &&
            gate !== 'request_changes'
          ? `/workbench/monetize/${sess.caseId}`
          : undefined
      const navHint = layoutDeepLinkCaseId
        ? ` · 已建调研案 → 打开调研台 ${layoutDeepLinkCaseId}（布局台仍办源案 layout_insight）`
        : navigateTo?.includes('/monetize/')
          ? ' · 法务会签/合同状态请到转化工作台（beta · 非合同 PDF）'
          : ''
      return {
        ok: true,
        message: (midOk ? `中台已更新 · ${baseMsg}` : baseMsg) + navHint,
        navigateTo,
        createdCaseId: layoutDeepLinkCaseId,
      }
    },
    [
      sessions,
      dispatchCommand,
      addArtifact,
      addActivity,
      processWatchAlert,
      getWatchAlerts,
      getDraftFilingCheck,
      getFullCheckLite,
      getDisclosurePackCheck,
      appendCaseDriveItem,
      hasBlockingInvoiceForCase,
      role,
      getCase,
      getHandoff,
      workspace.kind,
    ],
  )

  const runEquivalenceDemo = useCallback(
    async (sessionId: string): Promise<HitlActionResult> => {
      const sess = sessions.find((s) => s.id === sessionId)
      if (!sess) return { ok: false, message: '会话不存在' }
      if (!sess.caseId) return { ok: false, message: '请先关联案件' }

      const caseEq = sess.caseId ? getCase(sess.caseId) : undefined
      const resolvedAgentId =
        sess.agentId === 'auto'
          ? suggestAgent({
              stage: caseEq?.stage,
              goal: sess.goal,
              workspaceKind: workspace.kind,
            }).agent.id
          : sess.agentId
      const key = handoffKeyForAgent(resolvedAgentId)
      const isResearch =
        resolvedAgentId === 'agent-research' ||
        (key === 'research_report' && resolvedAgentId !== 'agent-layout')
      const isOa =
        resolvedAgentId === 'agent-oa' || key === 'prosecution_response'
      const isDisclosure =
        resolvedAgentId === 'agent-disclosure' || key === 'disclosure_pack'
      const isClaims =
        resolvedAgentId === 'agent-claims' || key === 'draft_claims'
      const isIntake =
        resolvedAgentId === 'agent-intake' || key === 'intake_quote'
      const isAnnuity =
        resolvedAgentId === 'agent-annuity' || key === 'maintain_annuity'
      const isWatch =
        resolvedAgentId === 'agent-watch' || key === 'watch_alert'
      const isMonetize =
        resolvedAgentId === 'agent-monetize' || key === 'monetize_terms'
      const isLayout = resolvedAgentId === 'agent-layout'

      // Fix · Seal Gate · EQ 阉割：高风险节点直接拒绝，禁静默 file/建案
      if (isDisclosure || isClaims || isOa || isAnnuity || isLayout) {
        const which = isDisclosure
          ? '交底'
          : isClaims
            ? '权利要求'
            : isOa
              ? 'OA'
              : isAnnuity
                ? '年费'
                : '布局'
        return {
          ok: false,
          message: `一键等效演示已阉割 · ${which}请用正式办理 + ConfirmBar（禁绕过齐套/争点/回执门禁）`,
        }
      }

      if (!isResearch && !isIntake && !isWatch && !isMonetize) {
        return {
          ok: false,
          message:
            '一键等效演示（已阉割）仅支持低风险：调研 / 立项 Go / 监控 / 转化 · 交底/权利要求/OA/年费/布局请用正式办理+ConfirmBar',
        }
      }

      stopPlay(sessionId)
      modeRef.current[sessionId] = 'formal'

      const script =
        AGENT_SCRIPTS[resolvedAgentId] ?? AGENT_SCRIPTS['agent-research']
      const steps: AgentStep[] = [
        {
          id: `st-eq-${Date.now()}`,
          kind: 'system',
          title: '一键等效演示（已阉割）',
          content:
            '能力已阉割：禁 fileResponse / 禁交底·权利要求·OA·年费·布局捷径。仅低风险演示（调研等）。主路径请用「启动」+ ConfirmBar。',
          at: `${nowIso()} ${nowStamp()}`,
        },
      ]
      if (isIntake && role === 'enterprise') {
        steps.push({
          id: `st-eq-dual-${Date.now()}`,
          kind: 'system',
          title: '演示完成立项 Go · 请回 ConfirmBar 确认报价',
          content:
            '未合并：仅写入 Go（提交+开始审核）；报价闸 confirm_quote 仍待，请在 ConfirmBar 确认报价。',
          at: `${nowIso()} ${nowStamp()}`,
        })
      }
      const artifacts: AgentArtifactDoc[] = [...sess.artifacts]
      for (let i = 0; i < script.length; i++) {
        const item = script[i]
        let newArtifact: AgentArtifactDoc | undefined
        if (item.artifact) {
          newArtifact = { id: `art-eq-${sessionId}-${i}`, ...item.artifact }
          artifacts.push(newArtifact)
        }
        steps.push({
          id: `st-eq-${sessionId}-${i}`,
          kind: item.kind,
          title: item.title,
          content: item.content,
          toolName: item.toolName,
          toolArgs: item.toolArgs,
          toolResultPreview: item.toolResultPreview,
          artifactId: newArtifact?.id,
          at: `${nowIso()} ${nowStamp()}`,
        })
      }

      // Research EQ：写库前校验可核验命中（剧本产物+步骤）
      if (isResearch) {
        const probe: AgentSession = {
          ...sess,
          steps: [...sess.steps, ...steps],
          artifacts,
        }
        if (!sessionHasVerifiableResearchHits(probe)) {
          return {
            ok: false,
            message:
              '等效演示拒绝 · 调研命中缺少 pubNo+url · 请用正式办理补齐可核验命中后再提交',
          }
        }
      }

      const labels: string[] = []
      const meta = {
        actor: 'agent' as const,
        agentId: resolvedAgentId,
        detail: '一键等效演示（已阉割）',
      }

      const chain: DomainCommand[] = []
      if (isResearch) {
        chain.push({
          type: 'submitResearch',
          caseId: sess.caseId,
          note: '等效演示：调研提交',
          artifactName: '调研结论摘要_等效演示.md',
        })
        if (role === 'enterprise') {
          chain.push({
            type: 'startReview',
            caseId: sess.caseId,
            handoffKey: 'research_report',
            note: '等效演示：进入审核',
          })
          chain.push({
            type: 'approveHandoff',
            caseId: sess.caseId,
            handoffKey: 'research_report',
            note: '等效演示：批准调研策略',
          })
        }
      } else if (isIntake) {
        chain.push({
          type: 'submitHandoff',
          caseId: sess.caseId,
          handoffKey: 'intake_quote',
          note: '等效演示：立项 Go · 提交报价草案',
        })
        if (role === 'enterprise') {
          // Fix P · 禁止 confirmQuote；clearedHitlGates 只清 go_nogo
          chain.push({
            type: 'startReview',
            caseId: sess.caseId,
            handoffKey: 'intake_quote',
            note: '等效演示：立项 Go · 进入审核',
          })
        }
      } else if (isWatch) {
        chain.push({
          type: 'submitHandoff',
          caseId: sess.caseId,
          handoffKey: 'watch_alert',
          note: '等效演示：提交监控告警',
        })
        if (role === 'enterprise') {
          chain.push({
            type: 'startReview',
            caseId: sess.caseId,
            handoffKey: 'watch_alert',
            note: '等效演示：告警审核',
          })
          chain.push({
            type: 'approveHandoff',
            caseId: sess.caseId,
            handoffKey: 'watch_alert',
            note: '等效演示：批准 watch_alert',
          })
        }
      } else if (isMonetize) {
        chain.push({
          type: 'submitHandoff',
          caseId: sess.caseId,
          handoffKey: 'monetize_terms',
          note: '等效演示：提交转化条款',
        })
        if (role === 'enterprise') {
          chain.push({
            type: 'startReview',
            caseId: sess.caseId,
            handoffKey: 'monetize_terms',
            note: '等效演示：条款审核',
          })
          chain.push({
            type: 'approveHandoff',
            caseId: sess.caseId,
            handoffKey: 'monetize_terms',
            note: '等效演示：批准 monetize_terms',
          })
        }
      }

      // 硬禁任何 fileResponse（含历史 AN-EQ / CN-EQ 静默回执）
      if (chain.some((c) => c.type === 'fileResponse')) {
        return {
          ok: false,
          message: '等效演示已禁 fileResponse · 请用 ConfirmBar 回执表单归档',
        }
      }

      let lastMsg = '演示完成'
      let anyOk = false
      let createdInsightCaseId: string | undefined
      for (const cmd of chain) {
        const r = await dispatchCommand(cmd, meta)
        if (r.ok) {
          anyOk = true
          labels.push(COMMAND_LABELS[cmd.type])
          setLastAppliedCommandLabel(COMMAND_LABELS[cmd.type])
          lastMsg = r.message
          if (cmd.type === 'createCaseFromInsight' && r.caseId) {
            createdInsightCaseId = r.caseId
          }
        }
      }
      const art = artifacts[artifacts.length - 1]
      if (art) addArtifact(sess.caseId, art.title, art.kind)

      // Fix T · EQ watch 双端：handoff 成功后同步告警 store（企业演示默认「已确认」）
      let eqWatchSynced = false
      if (isWatch && anyOk && role === 'enterprise') {
        const caze = getCase(sess.caseId)
        const list = getWatchAlerts(sess.caseId)
        const targetId =
          caze?.linkedAlertId && list.some((a) => a.id === caze.linkedAlertId)
            ? caze.linkedAlertId
            : list.find((a) => a.status === '待处理')?.id ?? list[0]?.id
        if (targetId) {
          processWatchAlert(sess.caseId, targetId, '已确认')
          eqWatchSynced = true
        }
      }

      const handoffNow = getHandoff(sess.caseId, key)
      const agentDef = getAgent(resolvedAgentId)
      const clearedGates: HitlGateId[] = [...(agentDef?.hitlGates ?? [])]
      // Agency demo often stops at submitted → leave HITL for enterprise gates
      const agencyPending =
        role === 'agency' &&
        (isResearch ||
          isDisclosure ||
          isClaims ||
          isIntake ||
          isOa ||
          isAnnuity ||
          isWatch ||
          isMonetize ||
          isLayout) &&
        !(
          handoffNow === 'filed' ||
          handoffNow === 'approved' ||
          handoffNow === 'authorized_to_file'
        )

      steps.push({
        id: `st-eq-done-${Date.now()}`,
        kind: 'system',
        title: '等效演示已写入领域（已阉割）',
        content: `命令链：${labels.join(' → ') || '（部分失败）'} · 交接状态 ${handoffNow} · ${lastMsg}${
          isIntake && role === 'enterprise' ? ' · 未合并：报价闸仍待 · 请回 ConfirmBar 确认报价' : ''
        }${
          eqWatchSynced ? ' · 已同步告警 store（演示·已确认）' : ''
        } · 无 fileResponse`,
        at: `${nowIso()} ${nowStamp()}`,
      })

      // Fix P · 立项企业：只清 go_nogo，保留 confirm_quote，停在 needs_human
      const intakeGoOnly = isIntake && role === 'enterprise'
      const finalCleared: HitlGateId[] = intakeGoOnly
        ? Array.from(
            new Set([...(sess.clearedHitlGates ?? []), 'go_nogo' as HitlGateId]),
          )
        : agencyPending
          ? []
          : clearedGates
      const finalNeedsHuman = agencyPending || intakeGoOnly
      const finalStatus: AgentSession['status'] = intakeGoOnly
        ? 'needs_human'
        : handoffNow === 'filed' ||
            handoffNow === 'approved' ||
            handoffNow === 'authorized_to_file'
          ? 'done'
          : agencyPending
            ? 'needs_human'
            : labels.length > 0
              ? 'done'
              : 'needs_human'

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: finalStatus,
                hitlPending: finalNeedsHuman,
                clearedHitlGates: finalCleared,
                scriptIndex: script.length,
                steps: [...s.steps, ...steps],
                artifacts,
                updatedAt: nowIso(),
              }
            : s,
        ),
      )
      addActivity(`一键等效演示 · ${sess.title} · ${labels.join('→')}`)
      const navigateTo = createdInsightCaseId
        ? `/workbench/research/${createdInsightCaseId}`
        : undefined
      return {
        ok: anyOk,
        message: `已写入领域：${labels.join(' → ') || '无成功命令'} · 交接 ${handoffNow}${
          navigateTo
            ? ` · 已建调研案 → 打开调研台 ${createdInsightCaseId}`
            : ''
        }${intakeGoOnly ? ' · 演示完成立项 Go · 请回 ConfirmBar 确认报价' : ''}`,
        navigateTo,
        createdCaseId: createdInsightCaseId,
      }
    },
    [
      sessions,
      stopPlay,
      dispatchCommand,
      addArtifact,
      addActivity,
      processWatchAlert,
      getWatchAlerts,
      role,
      getHandoff,
      getCase,
      workspace.kind,
    ],
  )


  const value = useMemo(
    () => ({
      agents: AGENT_CATALOG,
      runs,
      visibleRuns,
      getRun,
      getAgentDef,
      runsForAgent,
      startRun,
      updateArtifact,
      playMockRun,
      stopPlay,
      isPlaying,
      hitlAction,
      filterRuns,
      sessions,
      visibleSessions,
      getSession,
      createSession,
      patchSession,
      archiveSession,
      sessionSearch,
      setSessionSearch,
      showArchivedSessions,
      setShowArchivedSessions,
      updateSessionArtifact,
      playMockSession,
      stopSessionPlay,
      isSessionPlaying,
      sessionHitlAction,
      runEquivalenceDemo,
      lastAppliedCommandLabel,
      sessionRunMode,
    }),
    [
      runs,
      visibleRuns,
      getRun,
      getAgentDef,
      runsForAgent,
      startRun,
      updateArtifact,
      playMockRun,
      stopPlay,
      isPlaying,
      hitlAction,
      filterRuns,
      sessions,
      visibleSessions,
      getSession,
      createSession,
      patchSession,
      archiveSession,
      sessionSearch,
      showArchivedSessions,
      updateSessionArtifact,
      playMockSession,
      stopSessionPlay,
      isSessionPlaying,
      sessionHitlAction,
      runEquivalenceDemo,
      lastAppliedCommandLabel,
      sessionRunMode,
    ],
  )

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgents() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgents must be used within AgentProvider')
  return ctx
}

export type { SessionSearchState }
