/**
 * 交卷 · 待你确认硬闸（vision §3.1a / pages §2 · §4.11）
 * 纯函数：齐套可否交卷、是否待确认、确认页决策含义与确认人、换部是否锁。
 * 不写 progress / pending；调用方负责接线。
 */
import type { BusinessConfirmKind } from './businessSeats'
import type { EntryRole } from './entryRole'
import type { OrgDeptId } from '../departments/orgDepts'
import { MAIN_CHAIN_DEPT_IDS } from '../departments/orgDepts'

export type ChecklistItem = { label: string; done: boolean }

export type ConfirmStatusUi = 'pending' | 'confirmed' | 'returned'

/** 确认页状态标签 · 截图不能把未确认读成已办完 */
export function confirmStatusLabel(status: ConfirmStatusUi): string {
  switch (status) {
    case 'pending':
      return '待你确认'
    case 'confirmed':
      return '已通过'
    case 'returned':
      return '已驳回'
  }
}

export function canSubmitDeliverable(checklist: readonly ChecklistItem[]): boolean {
  return checklist.length > 0 && checklist.every((x) => x.done)
}

export function missingChecklistLabels(
  checklist: readonly ChecklistItem[],
): string[] {
  return checklist.filter((x) => !x.done).map((x) => x.label)
}

export type PendingLike = {
  kind: BusinessConfirmKind
  status: ConfirmStatusUi
}

export function isAwaitingConfirm(
  pending: readonly PendingLike[],
  kind: BusinessConfirmKind | null | undefined,
): boolean {
  if (!kind) return false
  return pending.some((p) => p.kind === kind && p.status === 'pending')
}

export type ConfirmDecisionMeta = {
  /** 决策短名（按钮 / 标题） */
  decisionShort: string
  /** 决策含义一句（对齐 D1–D7 时明示） */
  decisionMeaning: string
  /** 确认人（跟人；≠ 专家/起草人） */
  confirmerLabel: string
  /** 建议者（专家/起草 · 无确认权） */
  suggesterLabel: string
}

/**
 * 样机口径（decision-rights + pages）：交底不拍 D1；立项拍 D1/D2；申请部 D3；答复 D5。岗名跟八部（申请专家）。
 * 对外白话，非法条号。
 */
export const CONFIRM_DECISION_META: Record<
  BusinessConfirmKind,
  ConfirmDecisionMeta
> = {
  disclosure_ready: {
    decisionShort: '交底齐套确认',
    decisionMeaning:
      '确认技术事实与交底包可检索、可撰写（不在此拍「申不申」；D1/D2 在立项）。',
    confirmerLabel: '发明人 / 技术负责人',
    suggesterLabel: '交底专家（建议稿）',
  },
  research_ready: {
    decisionShort: '查新结论确认',
    decisionMeaning: '确认可专利性证据与结论可作立项依据（非 FTO 硬闸）。',
    confirmerLabel: '企业 IPR / 代理人',
    suggesterLabel: '查新专家（建议稿）',
  },
  go_nogo: {
    decisionShort: '立项决议（D1/D2）',
    decisionMeaning:
      'D1 申不申 + D2 类型；通过后才算立项，可进入申请部开写。无人确认不得装「已立项」。',
    confirmerLabel: '企业 IP 总监 / 委员会',
    suggesterLabel: '立项专家（建议稿）',
  },
  claims_ready: {
    decisionShort: '保护范围确认（D3）',
    decisionMeaning: 'D3 保护范围多大；确认权项/说明书边界后再往下。',
    confirmerLabel: '企业 IPR',
    suggesterLabel: '申请专家（建议稿）',
  },
  figures_ready: {
    decisionShort: '附图定稿确认',
    decisionMeaning: '确认图文一致、图号齐全，可与申请文件一并定稿。',
    confirmerLabel: '企业 IPR / 代理人',
    suggesterLabel: '附图专家（建议稿）',
  },
  file_authorize: {
    decisionShort: '递交授权（不可逆）',
    decisionMeaning:
      '授权递交申请包；无人确认不得装「已递交」。不可逆法定动作须责任人拍板。',
    confirmerLabel: '企业授权人',
    suggesterLabel: '递交专家（建议稿）',
  },
  oa_strategy: {
    decisionShort: '答复策略确认（D5）',
    decisionMeaning: 'D5 怎么答复 OA；策略有理由后再改稿/陈述。',
    confirmerLabel: '企业 IPR',
    suggesterLabel: '审查答复专家（建议稿）',
  },
  layout_adjust: {
    decisionShort: '布局调整确认',
    decisionMeaning: '确认布局补局建议可落入后续申请路径意向。',
    confirmerLabel: '企业 IP 总监',
    suggesterLabel: '布局专家（建议稿）',
  },
}

export function confirmDecisionMeta(
  kind: BusinessConfirmKind,
): ConfirmDecisionMeta {
  return CONFIRM_DECISION_META[kind]
}

/**
 * 专家/起草人不能当确认人自批。
 * 样机：入口角色 agency|enterprise 视为有确认权的人；
 * actorKind === 'expert'（演示「以专家身份」）则不可通过。
 */
export type ConfirmActorKind = 'human' | 'expert'

export function resolveConfirmActorKind(
  entryRole: EntryRole | null | undefined,
  override?: ConfirmActorKind,
): ConfirmActorKind {
  if (override) return override
  // 已选入口角色 = 人（代理/企业）；未选也按人演示，避免卡死
  if (entryRole === 'agency' || entryRole === 'enterprise' || !entryRole) {
    return 'human'
  }
  return 'human'
}

export function canActorConfirm(actor: ConfirmActorKind): boolean {
  return actor === 'human'
}

/** 驳回必须带意见 */
export function canRejectConfirm(note: string | undefined | null): boolean {
  return !!(note && note.trim().length > 0)
}

/**
 * 未齐套材料不可装「通过」。
 * 样机：缺 resultPreview 实质内容或显式 incomplete 时挡。
 */
export function canPassConfirmMaterials(args: {
  status: ConfirmStatusUi
  resultPreview?: string | null
  materialsComplete?: boolean
}): boolean {
  if (args.status !== 'pending') return false
  if (args.materialsComplete === false) return false
  const body = (args.resultPreview ?? '').trim()
  if (!body || body === '【成果】—' || body.includes('未齐套')) return false
  return true
}

export function passConfirmEnabled(args: {
  status: ConfirmStatusUi
  actor: ConfirmActorKind
  resultPreview?: string | null
  materialsComplete?: boolean
}): boolean {
  return (
    canActorConfirm(args.actor) &&
    canPassConfirmMaterials({
      status: args.status,
      resultPreview: args.resultPreview,
      materialsComplete: args.materialsComplete,
    })
  )
}

/**
 * 当前部待确认时，主链上「更靠后」的部不可作为推进换部目标。
 * 回看已过部 / 当前部仍可。
 */
export function isDeptAdvanceLocked(args: {
  currentDeptId: OrgDeptId
  targetDeptId: OrgDeptId
  awaitingConfirm: boolean
}): boolean {
  if (!args.awaitingConfirm) return false
  if (args.targetDeptId === args.currentDeptId) return false
  const cur = MAIN_CHAIN_DEPT_IDS.indexOf(args.currentDeptId)
  const tgt = MAIN_CHAIN_DEPT_IDS.indexOf(args.targetDeptId)
  if (cur < 0 || tgt < 0) return false
  return tgt > cur
}

export const AWAITING_ADVANCE_LOCK_HINT =
  '待你确认后才能推进下一部门（无人确认不换部）'
