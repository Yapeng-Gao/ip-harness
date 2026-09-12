/**
 * Enterprise Wave2 · DynamicTodos
 * 交接状态变更 → 运营待办真相源（原型 · 内存 · 不接真队列服务）
 *
 * InboxDeepLink 核验：Agent ConfirmBar 清闸经 sessionHitlAction → transitionHandoff，
 * 已由 upsertDynamicTodo / completeOpenDynamicTodos 消账（approve/authorize 接替；file 完结）。
 * 无需另开平行 inbox-todo 通道。
 */
import type {
  HandoffArtifactKey,
  PersonaId,
  StageId,
  UserRole,
  WorkbenchTodo,
  WorkbenchTodoActionKind,
  WorkbenchTodoSource,
} from '../types'
import type { HandoffAction } from '../data/handoff'
import { ARTIFACT_FOR_STAGE, HANDOFF_ARTIFACT_LABELS } from '../data/handoff'
import { WORKBENCH_TODOS } from '../data/workbenchTodos'

export const HANDOFF_ACTION_PATH: Record<HandoffArtifactKey, (caseId: string) => string> = {
  research_report: (id) => `/workbench/research/${id}`,
  intake_quote: (id) => `/workbench/intake/${id}`,
  disclosure_pack: (id) => `/inventor?case=${id}`,
  layout_insight: (id) => `/workbench/layout/${id}`,
  draft_claims: (id) => `/workbench/draft/${id}`,
  prosecution_response: (id) => `/workbench/prosecution/${id}`,
  maintain_annuity: (id) => `/workbench/maintain/${id}`,
  monetize_terms: (id) => `/workbench/monetize/${id}`,
  watch_alert: (id) => `/workbench/watch/${id}`,
}

/** 同案+工件+动作指纹（合并去重用） */
export function todoFingerprint(
  caseId: string,
  artifactKey: string | undefined,
  actionKind?: string,
): string {
  return `${caseId}:${artifactKey ?? '_'}:${actionKind ?? '_'}`
}

export function seedHandoffKey(t: WorkbenchTodo): HandoffArtifactKey | undefined {
  if (t.handoffKey) return t.handoffKey
  return ARTIFACT_FOR_STAGE[t.stage]
}

export function normalizeSeedTodo(t: WorkbenchTodo): WorkbenchTodo {
  return {
    ...t,
    handoffKey: seedHandoffKey(t),
    source: (t.source ?? 'seed') as WorkbenchTodoSource,
  }
}

export interface BuildHandoffTodoInput {
  caseId: string
  caseTitle: string
  stage: StageId
  key: HandoffArtifactKey
  action: HandoffAction
  due?: string
  now?: number
}

/**
 * 交接成功后的待办：生成下一条 / 或指示完结。
 * - submit / start_review → 企业待批
 * - request_changes → 代理待改
 * - approve / authorize → 代理下一动作（可 file）
 * - file → complete（消账）
 * - save_draft → 无新待办
 */
export function buildTodoFromHandoffTransition(
  input: BuildHandoffTodoInput,
): { kind: 'upsert'; todo: WorkbenchTodo } | { kind: 'complete' } | { kind: 'noop' } {
  const { caseId, caseTitle, stage, key, action, due } = input
  const label = HANDOFF_ARTIFACT_LABELS[key]
  const actionPath = HANDOFF_ACTION_PATH[key](caseId)
  const id = `dyn-${input.now ?? Date.now()}`
  const dueDate = due && due.length > 0 ? due : '2026-12-31'

  if (action === 'save_draft') return { kind: 'noop' }

  if (action === 'file') return { kind: 'complete' }

  if (action === 'submit' || action === 'start_review') {
    const actionKind: WorkbenchTodoActionKind = 'enterprise_review'
    const todo: WorkbenchTodo = {
      id,
      caseId,
      stage,
      title: `${caseTitle} · ${label}待企业审核`,
      due: dueDate,
      priority: '高',
      enterpriseLabel: '审核并确认策略 / 退回修改 / 批准',
      agencyLabel: '等待企业审核结果',
      actionPath,
      assignee: 'enterprise',
      assigneePersona: 'enterprise_ip',
      handoffKey: key,
      source: 'handoff',
      actionKind,
    }
    return { kind: 'upsert', todo }
  }

  if (action === 'request_changes') {
    const actionKind: WorkbenchTodoActionKind = 'agency_revise'
    const todo: WorkbenchTodo = {
      id,
      caseId,
      stage,
      title: `${caseTitle} · ${label}需修改`,
      due: dueDate,
      priority: '高',
      enterpriseLabel: '等待代理修改后重新提交',
      agencyLabel: '按企业意见修改并重新提交',
      actionPath,
      assignee: 'agency',
      assigneePersona: 'agency',
      handoffKey: key,
      source: 'handoff',
      actionKind,
    }
    return { kind: 'upsert', todo }
  }

  if (action === 'approve' || action === 'authorize') {
    const actionKind: WorkbenchTodoActionKind = 'agency_next'
    const todo: WorkbenchTodo = {
      id,
      caseId,
      stage,
      title: `${caseTitle} · ${label}${action === 'authorize' ? '可递交' : '已批准'}`,
      due: dueDate,
      priority: '中',
      enterpriseLabel: '已完成审核',
      agencyLabel:
        action === 'authorize' ? '按授权完成递交并归档' : '企业已批准，可继续办理 / 递交',
      actionPath,
      assignee: 'agency',
      assigneePersona: 'agency',
      handoffKey: key,
      source: 'handoff',
      actionKind,
    }
    return { kind: 'upsert', todo }
  }

  return { kind: 'noop' }
}

/** 标记同案+工件的开放动态待办为完成（消账） */
export function completeOpenDynamicTodos(
  todos: WorkbenchTodo[],
  caseId: string,
  key: HandoffArtifactKey,
): WorkbenchTodo[] {
  return todos.map((t) =>
    t.caseId === caseId && t.handoffKey === key && !t.done ? { ...t, done: true } : t,
  )
}

/** 用新待办接替同案+工件开放项（旧条 done，新条置顶） */
export function upsertDynamicTodo(
  todos: WorkbenchTodo[],
  todo: WorkbenchTodo,
): WorkbenchTodo[] {
  const completed = todos.map((t) =>
    t.caseId === todo.caseId &&
    t.handoffKey === todo.handoffKey &&
    !t.done
      ? { ...t, done: true }
      : t,
  )
  return [{ ...todo, source: todo.source ?? 'handoff', done: false }, ...completed]
}

/** 匹配应 dismiss 的 seed id（同案+工件） */
export function matchingSeedIdsForArtifact(
  caseId: string,
  key: HandoffArtifactKey,
): string[] {
  return WORKBENCH_TODOS.filter((t) => {
    if (t.caseId !== caseId) return false
    return seedHandoffKey(t) === key
  }).map((t) => t.id)
}

/**
 * 动态为主、seed 冷启动补齐；同 case+artifact(+actionKind) 不双计。
 * 优先保留 source=handoff；seed 之间同指纹只留一条。
 */
export function mergeDynamicAndSeedTodos(
  dynamicTodos: WorkbenchTodo[],
  dismissedSeedIds: string[],
): WorkbenchTodo[] {
  const dynOpen = dynamicTodos.filter((t) => !t.done)
  const seeds = WORKBENCH_TODOS.filter((t) => !dismissedSeedIds.includes(t.id)).map(
    normalizeSeedTodo,
  )

  const seenArtifact = new Set<string>()
  const seenFingerprint = new Set<string>()
  const out: WorkbenchTodo[] = []

  // 动态优先
  for (const t of dynOpen) {
    const art = `${t.caseId}:${t.handoffKey ?? t.id}`
    const fp = todoFingerprint(t.caseId, t.handoffKey, t.actionKind)
    seenArtifact.add(art)
    seenFingerprint.add(fp)
    out.push(t)
  }

  // seed 仅补齐尚无动态覆盖的案+工件
  for (const t of seeds) {
    const art = `${t.caseId}:${t.handoffKey ?? t.id}`
    if (seenArtifact.has(art)) continue
    const fp = todoFingerprint(t.caseId, t.handoffKey, t.actionKind)
    if (seenFingerprint.has(fp)) continue
    seenArtifact.add(art)
    seenFingerprint.add(fp)
    out.push(t)
  }

  return out
}

/** Persona 视角下待办是否应对「我」显示（与 role 过滤互补） */
export function todoVisibleToPersona(
  todo: WorkbenchTodo,
  persona: PersonaId,
  role: UserRole,
): boolean {
  if (persona === 'inventor') return false
  if (persona === 'committee') {
    return todo.stage === 'decision' || todo.handoffKey === 'intake_quote'
  }
  if (todo.assigneePersona) {
    if (persona === 'enterprise_ip') return todo.assigneePersona === 'enterprise_ip'
    if (persona === 'agency') return todo.assigneePersona === 'agency'
  }
  if (todo.assignee === 'both' || todo.assignee === undefined) return true
  return todo.assignee === role
}
