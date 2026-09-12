import type { PatentCase, PersonaId, UserRole, WorkbenchTodo } from '../types'
import { todoVisibleToPersona } from '../utils/dynamicTodos'

export type WorkspaceKind = 'enterprise' | 'agency'

export interface Workspace {
  id: string
  kind: WorkspaceKind
  role: UserRole
  name: string
  /** e.g. 企业租户 · 星河智造 */
  chipLabel: string
  orgName: string
  brandColor: string
  brandBg: string
  homeEmphasis: string
  homeBlurb: string
  logoLetter: string
  /** tenant key used for case isolation */
  tenantId: string
}

export const ENTERPRISE_XINGHE = 'ent-xinghe'
export const AGENCY_DEHENG = 'ag-deheng'
export const AGENCY_JINGSHI = 'ag-jingshi'
export const AGENCY_JINDU = 'ag-jindu'

export const WORKSPACES: Workspace[] = [
  {
    id: 'ws-xinghe',
    kind: 'enterprise',
    role: 'enterprise',
    name: '星河智造',
    chipLabel: '企业租户 · 星河智造',
    orgName: '星河智造股份有限公司',
    brandColor: 'text-indigo-700',
    brandBg: 'bg-indigo-600',
    homeEmphasis: '资产漏斗 · 闸门决策 · 洞察立项',
    homeBlurb: '企业 IP 中台：审核代理稿、确认策略、授权递交；可自助办理未委托案件。',
    logoLetter: '星',
    tenantId: ENTERPRISE_XINGHE,
  },
  {
    id: 'ws-deheng',
    kind: 'agency',
    role: 'agency',
    name: '德恒知产',
    chipLabel: '代理所租户 · 德恒知产',
    orgName: '北京德恒知识产权代理有限公司',
    brandColor: 'text-emerald-700',
    brandBg: 'bg-emerald-600',
    homeEmphasis: '待办队列 · 撰写答复 · 报价递交',
    homeBlurb: '代理所工作台：接案评估、权利要求撰写、OA 答复、年费代缴与递交归档。',
    logoLetter: '德',
    tenantId: AGENCY_DEHENG,
  },
  {
    id: 'ws-jingshi',
    kind: 'agency',
    role: 'agency',
    name: '京师华信',
    chipLabel: '代理所租户 · 京师华信',
    orgName: '京师华信专利代理事务所',
    brandColor: 'text-sky-700',
    brandBg: 'bg-sky-600',
    homeEmphasis: 'OA 争点 · 软硬交叉撰写',
    homeBlurb: '专注云计算 / AI 基础设施类发明撰写与审查答复。',
    logoLetter: '京',
    tenantId: AGENCY_JINGSHI,
  },
]

export function getWorkspace(id: string): Workspace {
  return WORKSPACES.find((w) => w.id === id) ?? WORKSPACES[0]
}

/** Map agency display name → tenant agency id */
export function agencyIdFromName(name: string): string | undefined {
  if (!name || name === '—') return undefined
  if (name.includes('德恒')) return AGENCY_DEHENG
  if (name.includes('京师华信')) return AGENCY_JINGSHI
  if (name.includes('金杜')) return AGENCY_JINDU
  if (name.includes('中科')) return 'ag-zk'
  if (name.includes('集佳')) return 'ag-jijia'
  if (name.includes('柳沈')) return 'ag-liushen'
  if (name.includes('上海专利')) return 'ag-sipo-sh'
  return undefined
}

/**
 * True dual-tenant isolation:
 * - enterprise workspace → only that enterprise's cases
 * - agency workspace → only cases assigned to that agency (never self_serve unless dispatched)
 */
export function filterCasesForWorkspace(
  cases: PatentCase[],
  ws: Workspace,
): PatentCase[] {
  if (ws.kind === 'enterprise') {
    return cases.filter((c) => c.ownerEnterpriseId === ws.tenantId)
  }
  return cases.filter((c) => c.assignedAgencyId === ws.tenantId)
}

export function canAccessCase(c: PatentCase | undefined, ws: Workspace): boolean {
  if (!c) return false
  if (ws.kind === 'enterprise') return c.ownerEnterpriseId === ws.tenantId
  return c.assignedAgencyId === ws.tenantId
}

/** Per-workspace todo emphasis labels (overlay on shared todos) */
export const WORKSPACE_TODO_EMPHASIS: Record<
  string,
  { headline: string; emptyHint: string }
> = {
  'ws-xinghe': {
    headline: '企业审核队列 · 待确认策略 / 授权递交',
    emptyHint: '暂无待企业审核事项，可前往洞察生成调研或派单代理。',
  },
  'ws-deheng': {
    headline: '德恒知产 · 代理办理队列',
    emptyHint: '暂无待办，等待企业派单或继续起草中案件。',
  },
  'ws-jingshi': {
    headline: '京师华信 · 代理办理队列',
    emptyHint: '暂无待办，可从案件库认领撰写 / 答复任务。',
  },
}

export function filterTodosForWorkspace(
  todos: WorkbenchTodo[],
  ws: Workspace,
  visibleCaseIds?: Set<string>,
): WorkbenchTodo[] {
  let list = todos
  if (visibleCaseIds) {
    list = list.filter((t) => visibleCaseIds.has(t.caseId))
  }
  if (ws.kind === 'enterprise') {
    return list.filter(
      (t) =>
        t.assignee === 'enterprise' ||
        t.assignee === 'both' ||
        t.assignee === undefined,
    )
  }
  return list.filter(
    (t) =>
      t.assignee === 'agency' ||
      t.assignee === 'both' ||
      t.assignee === undefined,
  )
}

/** WorkbenchHome / Dashboard / opsInbox：履约模式 + 阶段可见性 + Persona（在 workspaceTodos 之上再滤） */
export function filterWorkbenchQueue(
  todos: WorkbenchTodo[],
  cases: PatentCase[],
  role: UserRole,
  persona?: PersonaId,
): WorkbenchTodo[] {
  return todos.filter((t) => {
    if (persona && !todoVisibleToPersona(t, persona, role)) return false

    const c = cases.find((x) => x.id === t.caseId)
    const mode = c?.fulfillmentMode ?? 'delegated'

    if (mode === 'self_serve') {
      if (role === 'agency') return false
      // self_serve：企业侧仍受 Persona 约束（上方已滤）；assignee 放宽
      return true
    }

    if (t.assignee && t.assignee !== 'both' && t.assignee !== role) return false

    // Wave2：交接/期限升级待办以 assignee/Persona 为准，不受阶段白名单压制
    if (t.source === 'handoff' || t.source === 'docket') return true

    // layout_insight 非 STAGE_ORDER：挂 pre_research 案，但入口在 /workbench/layout
    const isLayoutTodo =
      t.handoffKey === 'layout_insight' ||
      (t.actionPath?.includes('/workbench/layout') ?? false)

    if (role === 'enterprise') {
      return (
        isLayoutTodo ||
        [
          'decision',
          'drafting',
          'prosecution',
          'commercialization',
          'monitoring',
          'maintenance',
        ].includes(t.stage)
      )
    }
    return (
      isLayoutTodo ||
      [
        'pre_research',
        'drafting',
        'prosecution',
        'maintenance',
        'decision',
      ].includes(t.stage)
    )
  })
}
