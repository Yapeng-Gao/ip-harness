/**
 * 公司活动流 · localStorage 持久化（同标签可恢复）
 * 类别：发言 / 交接 / 挑刺 / 通过 / 待确认
 */
import { formatElapsed } from './demoPace'

export const COMPANY_ACTIVITY_LS_KEY = 'ip-agent-company-activity-v1'
const MAX_EVENTS = 80

export const ACTIVITY_CATEGORY_LABEL = {
  speak: '发言',
  handoff: '交接',
  critique: '挑刺',
  pass: '通过',
  pending: '待确认',
} as const

export type ActivityCategory = keyof typeof ACTIVITY_CATEGORY_LABEL

export type ActivityHandoff = {
  fromSlug: string
  toSlug: string
  phrase: string
}

export type CompanyActivityEvent = {
  id: string
  at: string
  category: ActivityCategory
  roleId: string
  roleName: string
  caseId?: string
  caseTitle?: string
  deptSlug?: string
  message: string
  artifactPreview?: string
  handoff?: ActivityHandoff
}

export type CompanyActivityInput = Omit<CompanyActivityEvent, 'id' | 'at'> & {
  id?: string
  at?: string
}

const ROLE_DOT: Record<string, string> = {
  reception: 'bg-[#007aff]',
  'expert-intake': 'bg-slate-500',
  'expert-inspire': 'bg-slate-700',
  'expert-mining': 'bg-slate-400',
  'expert-disclosure': 'bg-[#007aff]',
  'expert-draft': 'bg-emerald-600',
  'expert-oa': 'bg-amber-600',
  'expert-annuity': 'bg-zinc-500',
  'expert-monetize': 'bg-[#0066d6]',
}

const STAGE_BY_KIND: Record<string, string> = {
  go_nogo: '受理',
  disclosure_ready: '办理',
  research_ready: '办理',
  claims_ready: '撰写',
  figures_ready: '撰写',
  file_authorize: '撰写',
  oa_strategy: '待确认',
  layout_adjust: '挑刺',
}

type Listener = (events: CompanyActivityEvent[]) => void

const listeners = new Set<Listener>()

function uid(): string {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function roleDotClass(roleId: string): string {
  return ROLE_DOT[roleId] ?? 'bg-slate-500'
}

export function isActivityCategory(v: unknown): v is ActivityCategory {
  return v === 'speak' || v === 'handoff' || v === 'critique' || v === 'pass' || v === 'pending'
}

export function hasCompanyActivityStore(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem(COMPANY_ACTIVITY_LS_KEY) != null
  } catch {
    return false
  }
}

function normalizeEvent(raw: unknown): CompanyActivityEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Partial<CompanyActivityEvent>
  if (!row.id || !row.at || !row.message || !row.roleName || !row.roleId) return null
  if (!isActivityCategory(row.category)) return null
  return {
    id: row.id,
    at: row.at,
    category: row.category,
    roleId: row.roleId,
    roleName: row.roleName,
    caseId: row.caseId,
    caseTitle: row.caseTitle,
    deptSlug: row.deptSlug,
    message: row.message,
    artifactPreview: row.artifactPreview,
    handoff: row.handoff,
  }
}

export function loadCompanyActivity(): CompanyActivityEvent[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(COMPANY_ACTIVITY_LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { v?: number; events?: unknown[] }
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.events)) return []
    return parsed.events.map(normalizeEvent).filter((e): e is CompanyActivityEvent => !!e)
  } catch {
    return []
  }
}

function persist(events: CompanyActivityEvent[]): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(
      COMPANY_ACTIVITY_LS_KEY,
      JSON.stringify({ v: 1, events }),
    )
  } catch {
    /* quota */
  }
}

function notify(events: CompanyActivityEvent[]): void {
  for (const listener of listeners) listener(events)
}

export function subscribeCompanyActivity(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitCompanyActivity(input: CompanyActivityInput): CompanyActivityEvent {
  const event: CompanyActivityEvent = {
    id: input.id ?? uid(),
    at: input.at ?? new Date().toISOString(),
    category: input.category,
    roleId: input.roleId,
    roleName: input.roleName,
    caseId: input.caseId,
    caseTitle: input.caseTitle,
    deptSlug: input.deptSlug,
    message: input.message,
    artifactPreview: input.artifactPreview,
    handoff: input.handoff,
  }
  const next = [event, ...loadCompanyActivity()].slice(0, MAX_EVENTS)
  persist(next)
  notify(next)
  return event
}

export function clearCompanyActivity(): void {
  persist([])
  notify([])
}

export function resetCompanyActivityState(): void {
  listeners.clear()
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(COMPANY_ACTIVITY_LS_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function buildSeedActivityEvents(at = new Date().toISOString()): CompanyActivityEvent[] {
  return [
    {
      id: 'seed-handoff-disclosure',
      at,
      category: 'handoff',
      roleId: 'expert-disclosure',
      roleName: '林交底',
      caseId: 'case-biz-sensor-pack',
      caseTitle: '传感校准套件',
      deptSlug: 'disclosure',
      message: '交底齐了，申请部接着写。',
      artifactPreview: '交底包',
      handoff: {
        fromSlug: 'disclosure',
        toSlug: 'draft',
        phrase: '交底齐了，申请部接着写。',
      },
    },
    {
      id: 'seed-pending-claims',
      at,
      category: 'pending',
      roleId: 'expert-draft',
      roleName: '顾知远',
      caseId: 'case-biz-sensor-pack',
      caseTitle: '传感校准套件',
      deptSlug: 'draft',
      message: '顾知远交卷「权利要求」，请你确认。',
      artifactPreview: '权利要求 1–8',
    },
    {
      id: 'seed-critique-oa',
      at,
      category: 'critique',
      roleId: 'expert-oa',
      roleName: '沈答复',
      caseId: 'case-biz-oa-filed',
      caseTitle: '边缘散热结构 · 审查中',
      deptSlug: 'oa',
      message: '沈答复挑了一处：创造性论述还撑不住独权。',
      artifactPreview: '答复策略',
    },
    {
      id: 'seed-pass-intake',
      at,
      category: 'pass',
      roleId: 'expert-intake',
      roleName: '立项',
      caseId: 'case-biz-edge-scheduler',
      caseTitle: '边缘调度模组',
      deptSlug: 'intake',
      message: '立项建议已通过，方向先立住。',
    },
    {
      id: 'seed-speak-reception',
      at,
      category: 'speak',
      roleId: 'reception',
      roleName: '小林',
      message: '前台：先把来意记下，再送去对应的房间。',
    },
  ]
}

/** 仅在从未写入过时播种，清过后的空列表不会被填回。 */
export function seedCompanyActivityIfEmpty(): CompanyActivityEvent[] {
  if (hasCompanyActivityStore()) return loadCompanyActivity()
  const events = buildSeedActivityEvents()
  persist(events)
  notify(events)
  return events
}

export function artifactPreviewLine(raw: string | undefined, max = 72): string {
  if (!raw?.trim()) return '暂无成果预览'
  const line =
    raw
      .split('\n')
      .map((s) => s.replace(/^【[^】]+】/, '').trim())
      .find((s) => s.length > 0) ?? ''
  if (!line) return '暂无成果预览'
  return line.length > max ? `${line.slice(0, max)}…` : line
}

export function elapsedLabel(createdAt: string | undefined, now = Date.now()): string {
  if (!createdAt) return '—'
  const t = Date.parse(createdAt)
  if (Number.isNaN(t)) return `登记于 ${createdAt}`
  return formatElapsed(Math.max(0, now - t))
}

export function stageLabelForConfirmKind(kind: string | undefined): string {
  if (!kind) return '办理'
  return STAGE_BY_KIND[kind] ?? '办理'
}

export function pendingCardFacts(input: {
  kind?: string
  createdAt?: string
  resultPreview?: string
  now?: number
}): { stage: string; elapsed: string; artifactPreview: string } {
  return {
    stage: stageLabelForConfirmKind(input.kind),
    elapsed: elapsedLabel(input.createdAt, input.now),
    artifactPreview: artifactPreviewLine(input.resultPreview),
  }
}
