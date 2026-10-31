/**
 * 部间工单（④→⑤）· 对齐 04§8.1 / 交互大纲 / 线框 s-handoff
 * 演示数据：打包方=交底部负责人；三线分词勿混。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { deptSlug } from '../departments/orgDepts'

export type InterDeptTicketLine =
  | '交底质检全绿'
  | '申请尚未过线'
  | '申请文件可递交（过线）'
  | '本轮答复可递交（D 过线）'

export type InterDeptTicketChecklistItem = {
  label: string
  done: boolean
  note?: string
}

/** ④→⑤ 工单摘要（样机壳；不推进真实状态机） */
export type InterDeptTicket = {
  id: string
  fromDeptId: OrgDeptId
  toDeptId: OrgDeptId
  fromLabel: string
  toLabel: string
  /** 谁打包 */
  packer: string
  /** 谁接单 */
  receiver: string
  intent: '现在做' | '以后做' | '退回'
  intentLabel: string
  lines: InterDeptTicketLine[]
  checklist: InterDeptTicketChecklistItem[]
  toSlug: string
  fromSlug: string
}

/** 演示：交底已全绿、可开「现在做⑤」 */
export function disclosureToDraftTicket(caseId: string): InterDeptTicket {
  return {
    id: `ticket-${caseId}-d04-d05`,
    fromDeptId: 'dept-disclosure',
    toDeptId: 'dept-draft',
    fromLabel: '④ 交底部',
    toLabel: '⑤ 申请部',
    packer: '交底部 · 部门负责人',
    receiver: '申请部 · 部门负责人',
    intent: '现在做',
    intentLabel: '现在做⑤ · 申请部',
    lines: ['交底质检全绿', '申请尚未过线'],
    checklist: [
      { label: '交底正文', done: true },
      { label: '成稿事实确认', done: true },
      { label: '质检全绿记录', done: true, note: '含再检' },
      { label: '选做查新', done: false, note: '未做（备注）' },
    ],
    toSlug: deptSlug('dept-draft'),
    fromSlug: deptSlug('dept-disclosure'),
  }
}

/** ⑤ 侧接单提示一句 */
export function draftInheritedHandoffLine(): string {
  return '已接④工单 · 交底全绿已继承。建议 B 后你再拍申不申。'
}
