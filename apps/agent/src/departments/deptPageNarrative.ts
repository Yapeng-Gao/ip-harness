/**
 * 部门台 / 公司首页 · 对外叙事文案（product-pages §2 / §4.3–4.10）
 * 对齐一期八部交卷物与齐套缺项关键词；只做展示层，不改 slug / roster。
 */
import type { OrgDeptId } from './orgDepts'

export type DeptHandoffCopy = {
  /** 一句话目标（部门头） */
  purpose: string
  deliverable: string
  checklist: string[]
  /**
   * 齐套中演示缺项短名（G1 硬闸关键词）
   * → 公司抽屉 / 右栏交卷态：「未齐套 · 缺{demoGap}」
   */
  demoGap: string
  /** peer.id → 对外岗名（pages 专家岗示例） */
  peerLabels: Record<string, string>
  /** peer.id → 建议稿占位（诚实白话，非法条） */
  peerHints: Record<string, string>
}

export const DEPT_HANDOFF: Partial<Record<OrgDeptId, DeptHandoffCopy>> = {
  'dept-disclosure': {
    purpose: '写成可检索、可撰写的技术交底包（不拍板申不申）',
    deliverable: '交底包：技术交底正文 + 附图说明 + 权属声明',
    checklist: [
      '技术交底正文',
      '附图说明',
      '发明人名单',
      '权属声明（含签字页）',
    ],
    demoGap: '权属声明',
    peerLabels: {
      'peer:expert-disclosure:six': '交底辅导',
      'peer:expert-disclosure:ask': '事实核对',
      'peer:expert-disclosure:emb': '权属',
    },
    peerHints: {
      'peer:expert-disclosure:six': '建议稿占位：交底结构提示（样机，非法律意见）',
      'peer:expert-disclosure:ask': '建议稿占位：待核事实清单（样机，非法律意见）',
      'peer:expert-disclosure:emb': '建议稿占位：权属声明缺项提醒（样机，非法律意见）',
    },
  },
  'dept-research': {
    purpose: '可专利性证据齐套；给出继续/改写/暂缓/放弃建议',
    deliverable: '查新报告：检索式、命中对比、结论稿',
    checklist: [
      '检索式',
      '命中列表',
      '对比文件',
      '范围声明',
      '结论稿',
    ],
    demoGap: '结论稿',
    peerLabels: {
      'peer:expert-research:query': '检索策略',
      'peer:expert-research:coverage': '对比文件梳理',
      'peer:expert-research:novelty': '结论稿',
    },
    peerHints: {
      'peer:expert-research:query': '建议稿占位：检索策略提纲（样机，非法律意见）',
      'peer:expert-research:coverage': '建议稿占位：对比文件梳理表（样机，非法律意见）',
      'peer:expert-research:novelty': '建议稿占位：结论稿建议（样机，非法律意见）',
    },
  },
  'dept-intake': {
    purpose: 'D1 申不申 / D2 类型；报价与委托意向',
    deliverable: '单案决策书 + 范围报价（含决议签署）',
    checklist: [
      '评分卡汇总',
      '报价',
      '国际路径意向',
      '会议纪要',
      '决议签署',
    ],
    demoGap: '决议签署',
    peerLabels: {
      'peer:expert-intake:diff': '评分卡汇总',
      'peer:expert-intake:score': '报价草稿',
      'peer:expert-intake:quote': '会议纪要助手',
    },
    peerHints: {
      'peer:expert-intake:diff': '建议稿占位：评分卡汇总（样机，非法律意见）',
      'peer:expert-intake:score': '建议稿占位：范围报价草稿（样机，非法律意见）',
      'peer:expert-intake:quote': '建议稿占位：会议纪要提纲（样机，非法律意见）',
    },
  },
  'dept-draft': {
    purpose: '单案权利边界成型；权项 + 说明书等',
    deliverable: '权项树与说明书（权利边界成型）',
    checklist: [
      '说明书骨架',
      '实施例',
      '术语表',
      '摘要',
      '权项树',
    ],
    demoGap: '权项树',
    peerLabels: {
      'peer:expert-draft:features': '权项结构',
      'peer:expert-draft:spec': '说明书章节',
      'peer:expert-draft:qa': '术语一致检查',
    },
    peerHints: {
      'peer:expert-draft:features': '建议稿占位：权项结构建议（样机，非法律意见）',
      'peer:expert-draft:spec': '建议稿占位：说明书章节补全提示（样机，非法律意见）',
      'peer:expert-draft:qa': '建议稿占位：术语一致检查项（样机，非法律意见）',
    },
  },
  'dept-figure': {
    purpose: '图文一致的附图定稿',
    deliverable: '附图包：图号、简要说明与说明书引用一致',
    checklist: [
      '图1',
      '图2',
      '简要说明',
      '格式检查',
      '图号核对',
    ],
    demoGap: '图号核对',
    peerLabels: {
      'peer:expert-figure:list': '制图',
      'peer:expert-figure:sketch': '图号核对',
      'peer:expert-figure:caption': '图文一致性检查',
    },
    peerHints: {
      'peer:expert-figure:list': '建议稿占位：制图任务单（样机，非法律意见）',
      'peer:expert-figure:sketch': '建议稿占位：图号核对表（样机，非法律意见）',
      'peer:expert-figure:caption': '建议稿占位：图文一致性检查（样机，非法律意见）',
    },
  },
  'dept-filing': {
    purpose: '申请包齐套、缴费/递交责任确认；拿回执',
    deliverable: '申请包 + filing_check + 回执（含授权人确认）',
    checklist: [
      '申请包',
      'filing_check',
      '官费',
      '回执',
      '授权人确认',
    ],
    demoGap: '授权人确认',
    peerLabels: {
      'peer:expert-filing:pack': '形式审查清单',
      'peer:expert-filing:form': '官费/费减核对',
      'peer:expert-filing:deadline': '递交队列状态',
    },
    peerHints: {
      'peer:expert-filing:pack': '建议稿占位：形式审查清单（样机，非法律意见）',
      'peer:expert-filing:form':
        '建议稿占位：官费/费减核对（金额以当期公告为准；样机，非法律意见）',
      'peer:expert-filing:deadline': '建议稿占位：递交队列状态（样机，非法律意见）',
    },
  },
  'dept-oa': {
    purpose: '登记 OA、定策略、改权项/陈述',
    deliverable: '答复包：争点、策略、修改对照、企业确认意见',
    checklist: [
      'OA登记',
      '争点',
      '修改对照',
      '期限',
      '企业确认意见',
    ],
    demoGap: '企业确认意见',
    peerLabels: {
      'peer:expert-oa:classify': '争点拆解',
      'peer:expert-oa:inventive': '策略三选一建议',
      'peer:expert-oa:reply': '修改对照稿',
    },
    peerHints: {
      'peer:expert-oa:classify': '建议稿占位：争点拆解（样机，非法律意见）',
      'peer:expert-oa:inventive': '建议稿占位：策略三选一（待确认；样机，非法律意见）',
      'peer:expert-oa:reply': '建议稿占位：修改对照稿（样机，非法律意见）',
    },
  },
}

/** 辅链/对外部门名微调（pages：递交与程序部；主链以 orgDepts 八部为准） */
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
