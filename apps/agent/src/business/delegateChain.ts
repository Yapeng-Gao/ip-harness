/**
 * 助手持续委托链 · vision §3.1c / product-logic §0.3
 * 提目标 → 计划可调 → 分发 → 待接力（样机示意；非官报/真检索/真鉴权）
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { deptSlug } from '../departments/orgDepts'

/** 四类权威目标 + 归不进时的 generic（须追问收窄，禁第五类冒充权威） */
export type GoalKind =
  | 'disclosure_pack'
  | 'protect_start'
  | 'fto_scan'
  | 'oa_reply'
  | 'generic'

export type PlanStep = {
  id: string
  label: string
  deptId: OrgDeptId
  slug: string
  /** 默认可点；用户可关掉（示意可调，不跳过硬闸叙事） */
  enabled: boolean
  /** 首站候选 */
  canBeFirst: boolean
}

export const GOAL_KIND_LABEL: Record<GoalKind, string> = {
  disclosure_pack: '交底齐套',
  protect_start: '开案保护',
  fto_scan: '上市风险排查',
  oa_reply: '审查答复',
  generic: '待收窄',
}

/** 自由文本归入四类；归不进 → generic（示意追问，不直接万能窗） */
export function classifyGoal(text: string): GoalKind {
  const t = text.trim()
  if (!t) return 'generic'
  if (/审查意见|答复|OA|驳回通知|补正/.test(t)) return 'oa_reply'
  if (/FTO|自由实施|上市.*风险|侵权风险|排查风险/.test(t)) return 'fto_scan'
  if (/权属|交底.*齐|缺件|声明|交底书/.test(t)) return 'disclosure_pack'
  if (/保护|开案|申请|专利|交底|撰写|技术成果|研发/.test(t)) return 'protect_start'
  return 'generic'
}

function step(
  id: string,
  label: string,
  deptId: OrgDeptId,
  enabled = true,
  canBeFirst = true,
): PlanStep {
  return {
    id,
    label,
    deptId,
    slug: deptSlug(deptId),
    enabled,
    canBeFirst,
  }
}

/** 按目标给出默认可调计划步骤（示意骨架） */
export function planStepsForGoal(kind: GoalKind): PlanStep[] {
  switch (kind) {
    case 'disclosure_pack':
      return [
        step('disclosure', '交底部 · 齐套缺件', 'dept-disclosure'),
        step('draft', '申请部 · 接齐套后撰写', 'dept-draft', true, false),
      ]
    case 'protect_start':
      return [
        step('intake', '立项部 · 立方向', 'dept-intake'),
        step('disclosure', '交底部 · 技术事实', 'dept-disclosure'),
        step('draft', '申请部 · 撰写递交', 'dept-draft', true, false),
      ]
    case 'fto_scan':
      return [
        step('enforcement', '自由实施部 · 风险排查（副线）', 'dept-enforcement'),
        step('disclosure', '交底部 · 主链不挡（可选）', 'dept-disclosure', false),
      ]
    case 'oa_reply':
      return [
        step('oa', '审查答复部 · 策略与答复', 'dept-oa'),
      ]
    case 'generic':
    default:
      return [
        step('intake', '立项部 · 先收窄目标', 'dept-intake'),
        step('disclosure', '交底部 · 若已有技术事实', 'dept-disclosure', false),
      ]
  }
}

/** 当前启用步骤里的首站（可被用户改） */
export function resolveFirstStep(
  steps: readonly PlanStep[],
  preferredId?: string | null,
): PlanStep | undefined {
  const enabled = steps.filter((s) => s.enabled)
  if (enabled.length === 0) return undefined
  if (preferredId) {
    const hit = enabled.find((s) => s.id === preferredId && s.canBeFirst)
    if (hit) return hit
  }
  return enabled.find((s) => s.canBeFirst) ?? enabled[0]
}

/** 启用步骤按当前顺序（辅链） */
export function enabledPlanChain(
  steps: readonly PlanStep[],
): PlanStep[] {
  return steps.filter((s) => s.enabled)
}

/** 上移/下移一步（示意可调序；越界 no-op） */
export function movePlanStep(
  steps: readonly PlanStep[],
  id: string,
  dir: 'up' | 'down',
): PlanStep[] {
  const list = [...steps]
  const i = list.findIndex((s) => s.id === id)
  if (i < 0) return list
  const j = dir === 'up' ? i - 1 : i + 1
  if (j < 0 || j >= list.length) return list
  const tmp = list[i]!
  list[i] = list[j]!
  list[j] = tmp
  return list
}

export type PlanChainStepStatus = 'active' | 'queued' | 'skipped'

export type PlanChainStep = {
  id: string
  label: string
  deptSlug: string
  status: PlanChainStepStatus
}

/** 分发时固化辅链：首站 active，其余启用 queued，关掉 skipped */
export function buildPlanChain(
  steps: readonly PlanStep[],
  firstStepId?: string | null,
): PlanChainStep[] {
  const first = resolveFirstStep(steps, firstStepId)
  return steps.map((s) => {
    if (!s.enabled) {
      return {
        id: s.id,
        label: s.label,
        deptSlug: s.slug,
        status: 'skipped' as const,
      }
    }
    if (first && s.id === first.id) {
      return {
        id: s.id,
        label: s.label,
        deptSlug: s.slug,
        status: 'active' as const,
      }
    }
    return {
      id: s.id,
      label: s.label,
      deptSlug: s.slug,
      status: 'queued' as const,
    }
  })
}

/** 辅链中下一站（queued 的第一个） */
export function nextQueuedStep(
  chain: readonly PlanChainStep[] | undefined | null,
): PlanChainStep | undefined {
  return chain?.find((s) => s.status === 'queued')
}

/** 写入开案/过程的计划文案（可被 casePlanDrive 解析；含多步辅链） */
export function formatCasePlanText(input: {
  goalKind: GoalKind
  goalText: string
  steps: readonly PlanStep[]
  firstStepId?: string | null
}): string {
  const first = resolveFirstStep(input.steps, input.firstStepId)
  const chain = enabledPlanChain(input.steps)
  const numbered = chain
    .map((s, i) => `${i + 1}.${s.label}`)
    .join(' → ')
  const queuedAfter = chain.filter((s) => first && s.id !== first.id)
  const lines = [
    `来稿类型：${GOAL_KIND_LABEL[input.goalKind]}`,
    `来稿意图：${input.goalText.trim().slice(0, 120)}`,
    first
      ? `开篇章节：${first.label}\n下一步：先办${first.label.split('·')[0]!.trim()}`
      : '下一步：请先勾选要办的章节',
    `本稿排期：${numbered || '（尚未勾选章节）'}`,
    queuedAfter.length
      ? `开篇之后待办：${queuedAfter.map((s) => s.label).join(' → ')}`
      : '开篇之后待办：无（本篇一站办完）',
    '（样机示意 · 非官报 · 排期可改稿）',
  ]
  return lines.join('\n')
}

export type RelayItem = {
  id: string
  title: string
  kind: 'pending' | 'handoff' | 'dispatched'
  href: string
  badge: string
}

const LS_DISPATCH = 'ip-agent-delegate-last'

export type LastDispatch = {
  at: string
  goalText: string
  goalKind: GoalKind
  caseId?: string
  deptSlug: string
  stepLabel: string
}

export function writeLastDispatch(d: LastDispatch): void {
  try {
    localStorage.setItem(LS_DISPATCH, JSON.stringify(d))
  } catch {
    /* ignore */
  }
}

export function readLastDispatch(): LastDispatch | null {
  try {
    const raw = localStorage.getItem(LS_DISPATCH)
    if (!raw) return null
    const p = JSON.parse(raw) as LastDispatch
    if (!p || typeof p.goalText !== 'string') return null
    return p
  } catch {
    return null
  }
}
