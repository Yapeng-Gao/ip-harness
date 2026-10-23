/**
 * 部门台 / 公司首页 · 对外叙事文案（product-pages §2 / §4.3–4.10）
 * 只做展示层覆盖；不改 slug、不改 deptRoster 结构。
 */
import type { OrgDeptId } from './orgDepts'

export type DeptHandoffCopy = {
  /** 一句话目标（部门头） */
  purpose: string
  deliverable: string
  checklist: string[]
  /** peer.id → 对外岗名（pages 专家岗示例） */
  peerLabels: Record<string, string>
  /** peer.id → 建议稿占位（诚实白话，非法条） */
  peerHints: Record<string, string>
}

export const DEPT_HANDOFF: Partial<Record<OrgDeptId, DeptHandoffCopy>> = {
  'dept-disclosure': {
    purpose: '写成可检索、可撰写的技术交底包（不拍板申不申）',
    deliverable: '交底包：六项技术说明 + 权属/署名/奖酬/公开时点四组事实',
    checklist: [
      '六项技术内容已填',
      '四组事实已闭合',
      '发明人已确认',
      '须法务会签时已通过',
    ],
    peerLabels: {
      'peer:expert-disclosure:six': '交底辅导',
      'peer:expert-disclosure:ask': '事实核对',
      'peer:expert-disclosure:emb': '评分建议起草',
    },
    peerHints: {
      'peer:expert-disclosure:six': '建议稿占位：交底结构提示（样机，非法律意见）',
      'peer:expert-disclosure:ask': '建议稿占位：待核事实清单',
      'peer:expert-disclosure:emb': '建议稿占位：可选评分草稿',
    },
  },
  'dept-research': {
    purpose: '可专利性证据齐套；给出继续/改写/暂缓/放弃建议',
    deliverable: '查新报告：检索式、命中对比、可专利性结论',
    checklist: [
      '检索式与范围已记',
      '对比文件已梳理',
      '可专利性结论已给出',
    ],
    peerLabels: {
      'peer:expert-research:query': '检索策略',
      'peer:expert-research:coverage': '对比文件梳理',
      'peer:expert-research:novelty': '结论稿（建议）',
    },
    peerHints: {
      'peer:expert-research:query': '建议稿占位：检索策略提纲',
      'peer:expert-research:coverage': '建议稿占位：对比文件梳理表',
      'peer:expert-research:novelty': '建议稿占位：结论建议（待确认）',
    },
  },
  'dept-intake': {
    purpose: 'D1 申不申 / D2 类型；报价与委托意向',
    deliverable: '单案决策书 + 范围报价（决议签署、国际路径意向）',
    checklist: [
      '报价齐套（或 No-Go 理由已记）',
      '决议已签署或 No-Go 已归档',
      '国际路径意向已记',
    ],
    peerLabels: {
      'peer:expert-intake:diff': '评分卡汇总',
      'peer:expert-intake:score': '报价草稿',
      'peer:expert-intake:quote': '会议纪要助手',
    },
    peerHints: {
      'peer:expert-intake:diff': '建议稿占位：评分卡汇总',
      'peer:expert-intake:score': '建议稿占位：范围报价草稿',
      'peer:expert-intake:quote': '建议稿占位：会议纪要提纲',
    },
  },
  'dept-draft': {
    purpose: '单案权利边界成型；权项 + 说明书等',
    deliverable: '权项与说明书（权利边界成型）',
    checklist: [
      '权项树非空',
      '说明书关键章节已齐',
      '与附图引用口径一致',
    ],
    peerLabels: {
      'peer:expert-draft:features': '权项结构建议',
      'peer:expert-draft:spec': '说明书章节补全',
      'peer:expert-draft:qa': '术语一致检查',
    },
    peerHints: {
      'peer:expert-draft:features': '建议稿占位：权项结构建议',
      'peer:expert-draft:spec': '建议稿占位：说明书章节补全提示',
      'peer:expert-draft:qa': '建议稿占位：术语一致检查项',
    },
  },
  'dept-figure': {
    purpose: '图文一致的附图定稿',
    deliverable: '附图包：图号、简要说明与说明书引用一致',
    checklist: [
      '图号齐全',
      '与说明书实施例引用一致',
      '格式满足递交相关检查',
    ],
    peerLabels: {
      'peer:expert-figure:list': '制图',
      'peer:expert-figure:sketch': '图号核对',
      'peer:expert-figure:caption': '图文一致性检查',
    },
    peerHints: {
      'peer:expert-figure:list': '建议稿占位：制图任务单',
      'peer:expert-figure:sketch': '建议稿占位：图号核对表',
      'peer:expert-figure:caption': '建议稿占位：图文一致性检查',
    },
  },
  'dept-filing': {
    purpose: '申请包齐套、缴费/递交责任确认；拿回执',
    deliverable: '申请包 + 递交检查清单 + 回执/凭证',
    checklist: [
      '递交检查项全绿',
      '授权人确认就绪',
      '回执/凭证可登记',
    ],
    peerLabels: {
      'peer:expert-filing:pack': '形式审查清单',
      'peer:expert-filing:form': '官费/费减核对',
      'peer:expert-filing:deadline': '递交队列状态',
    },
    peerHints: {
      'peer:expert-filing:pack': '建议稿占位：形式审查清单',
      'peer:expert-filing:form': '建议稿占位：官费/费减核对（金额以当期公告为准）',
      'peer:expert-filing:deadline': '建议稿占位：递交队列状态',
    },
  },
  'dept-oa': {
    purpose: '登记 OA、定策略、改权项/陈述',
    deliverable: '答复包：争点、策略、修改对照、陈述确认',
    checklist: [
      '答复包必填项齐全',
      '策略有理由',
      '期限可见',
    ],
    peerLabels: {
      'peer:expert-oa:classify': '争点拆解',
      'peer:expert-oa:inventive': '策略三选一建议',
      'peer:expert-oa:reply': '修改对照稿',
    },
    peerHints: {
      'peer:expert-oa:classify': '建议稿占位：争点拆解',
      'peer:expert-oa:inventive': '建议稿占位：策略三选一（待确认）',
      'peer:expert-oa:reply': '建议稿占位：修改对照稿',
    },
  },
}

/** 七部对外部门名微调（pages：递交与程序部） */
export const DEPT_DISPLAY_LABEL: Partial<Record<OrgDeptId, string>> = {
  'dept-filing': '递交与程序部',
}

export function peerDisplayLabel(
  deptId: OrgDeptId,
  peerId: string,
  fallback: string,
): string {
  return DEPT_HANDOFF[deptId]?.peerLabels[peerId] ?? fallback
}

export function peerSuggestionHint(
  deptId: OrgDeptId,
  peerId: string,
): string {
  return (
    DEPT_HANDOFF[deptId]?.peerHints[peerId] ??
    '建议稿占位：进岗后生成（样机，非法律意见）'
  )
}
