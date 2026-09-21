/**
 * 跨席 feedback（外循环边）· 对齐 patent-pack-design §2 / §5 Loop 总索引
 * 样机：下游请上游 bot 调整 → 上游出 v2 → 下游基于新产物接着做（不回退下游 stepIndex）
 */
import type { ProjectExpertId } from '../projects/types'
import { businessSeatLabel } from './businessSeats'

export type SeatFeedbackEdge = {
  from: ProjectExpertId
  to: ProjectExpertId
  /** 芯片文案 */
  chip: string
  /** 默认反馈原因 */
  defaultReason: string
  /** 匹配用户口令（在 from 席内） */
  match: RegExp
  /** 灰回流 / 飞轮等：过程面板可标 muted 心智（业务仍可点） */
  muted?: boolean
}

/**
 * Pack 外循环可点边（样机全集）
 * F5 主链 · F6 OA 子任务 · F9→F3 飞轮 · 查新不乐观 / 立项低分回流
 */
export const SEAT_FEEDBACK_EDGES: SeatFeedbackEdge[] = [
  // —— F5 回流转 ——
  {
    from: 'expert-draft',
    to: 'expert-disclosure',
    chip: '请交底调整',
    defaultReason: '撰写需要补效果数据与实施例笔墨',
    match: /交底/,
  },
  {
    from: 'expert-draft',
    to: 'expert-research',
    chip: '请查新补检索',
    defaultReason: '独权特征缺最接近对比文件，请补检索',
    match: /查新|检索|对比文件/,
  },
  {
    from: 'expert-figure',
    to: 'expert-draft',
    chip: '请撰写改术语',
    defaultReason: '图注与权项术语不一致，请统一后回传',
    match: /撰写|术语|权项/,
  },
  {
    from: 'expert-research',
    to: 'expert-disclosure',
    chip: '请交底补特征',
    defaultReason: '检索发现交底缺关键区别特征描述，请补强',
    match: /交底|特征/,
  },
  {
    from: 'expert-intake',
    to: 'expert-research',
    chip: '请查新再扫一轮',
    defaultReason: '立项评分吃紧，请再扫一轮覆盖度',
    match: /查新|检索|覆盖/,
  },
  {
    from: 'expert-filing',
    to: 'expert-draft',
    chip: '请撰写改书式',
    defaultReason: '形式审查点：摘要字数 / 权要引用链需改',
    match: /撰写|书式|权要|摘要/,
  },
  {
    from: 'expert-filing',
    to: 'expert-figure',
    chip: '请附图改图注',
    defaultReason: '附图图注与说明书附图说明不一致',
    match: /附图|图注/,
  },
  // —— F6 OA 子任务汇入 ——
  {
    from: 'expert-oa',
    to: 'expert-research',
    chip: '请查新补充检索',
    defaultReason: '创造性争点：请补充检索对比文件',
    match: /查新|检索|创造性|对比/,
  },
  {
    from: 'expert-oa',
    to: 'expert-draft',
    chip: '请撰写修清楚性',
    defaultReason: '清楚性：请修术语与权要表述后回传',
    match: /撰写|术语|清楚|权要/,
  },
  // —— F9→F3 布局飞轮 ——
  {
    from: 'expert-enforcement',
    to: 'expert-layout',
    chip: '漏洞回流布局',
    defaultReason: '维权比对发现布局漏洞，请布局策略师重排保护网',
    match: /布局|漏洞|飞轮|回流/,
  },
  // —— 查新不乐观 → F2/F3 ——
  {
    from: 'expert-research',
    to: 'expert-inspire',
    chip: '不乐观·换方向',
    defaultReason: '查新结论不乐观，建议换创新方向（示意）',
    match: /方向|灵感|inspire|不乐观/,
    muted: true,
  },
  {
    from: 'expert-research',
    to: 'expert-layout',
    chip: '不乐观·调布局',
    defaultReason: '查新不乐观，建议调整布局策略（示意）',
    match: /布局/,
    muted: true,
  },
  // —— 立项低分 → F2 ——
  {
    from: 'expert-intake',
    to: 'expert-inspire',
    chip: '低分·换方向',
    defaultReason: '立项评分偏低，建议放弃或换方向（示意）',
    match: /方向|灵感|低分|放弃/,
    muted: true,
  },
]

export function feedbackEdgesFrom(
  from: ProjectExpertId,
): SeatFeedbackEdge[] {
  return SEAT_FEEDBACK_EDGES.filter((e) => e.from === from)
}

/**
 * 解析跨席反馈口令。席内「回到第N步」不抢。
 * 多边时优先更长 match 命中（避免「查新」误伤）。
 */
export function parseUpstreamFeedbackIntent(
  text: string,
  fromSeat: ProjectExpertId,
): { toSeat: ProjectExpertId; reason: string; edge: SeatFeedbackEdge } | null {
  const t = text.trim()
  if (!t) return null
  if (/回到|回退到?|从\s*第\s*\d+\s*步/.test(t)) return null

  const edges = feedbackEdgesFrom(fromSeat)
  if (edges.length === 0) return null

  const hasAsk =
    /请|让|烦请|麻烦|帮我|需要|补|改|调整|退回|feedback|反馈|回流|飞轮|不乐观|低分/.test(
      t,
    )
  if (!hasAsk) return null

  const hit = edges
    .map((edge) => {
      const m = t.match(edge.match)
      return m ? { edge, score: m[0]!.length } : null
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)[0]

  if (!hit) return null
  const edge = hit.edge
  const reason = t.length > 4 && t.length < 120 ? t : edge.defaultReason
  return { toSeat: edge.to, reason, edge }
}

const TOOL_BY_SEAT: Partial<Record<ProjectExpertId, string>> = {
  'expert-disclosure': 'pack_disclosure',
  'expert-draft': 'draft_claims',
  'expert-research': 'commercial_patent_search',
  'expert-figure': 'ocr_term_check',
  'expert-intake': 'propose_go_nogo',
  'expert-layout': 'draft_layout_plan',
  'expert-inspire': 'draft_inspire_brief',
  'expert-filing': 'formality_scan',
  'expert-oa': 'oa_strategy',
  'expert-enforcement': 'draft_enforcement_brief',
}

export function feedbackToolName(toSeat: ProjectExpertId): string {
  return TOOL_BY_SEAT[toSeat] ?? 'accept_dual_file'
}

/** 上游调整完成时的助理文案（v2） */
export function upstreamAdjustScript(
  toSeat: ProjectExpertId,
  fromSeat: ProjectExpertId,
  reason: string,
): string {
  const to = businessSeatLabel(toSeat)
  const from = businessSeatLabel(fromSeat)
  const head = [
    `【${to}】已按「${from}」反馈改出 **v2**（样机）。`,
    '',
    `**反馈原文**：${reason}`,
    '',
  ]

  switch (toSeat) {
    case 'expert-disclosure':
      return [
        ...head,
        '**本轮补强**',
        '1. 效果数据：边缘节点能耗下降约 12%（示意实验窗）',
        '2. 实施例：热插拔联动调度补一段可复现步骤',
        '3. 术语：与撰写独权「多约束联合调度」对齐',
        '',
        '已回传下游 · 无需把案子进度拨回交底。',
      ].join('\n')
    case 'expert-draft':
      return [
        ...head,
        '**统一术语 / 书式**',
        '- 节点模组 ↔ 热插拔单元；降级窗口 ↔ 云边协同窗口',
        '- 摘要与权要引用链已按形式意见收紧（示意）',
        '',
        '已回传下游席 · 可继续。',
      ].join('\n')
    case 'expert-research':
      return [
        ...head,
        '**补检索要点**',
        '- 新增对比文件示意：CN11xxxxxxA · 特征 F3 覆盖',
        '- 覆盖度自修复 +1（样机 ≤3）',
        '',
        '已回传下游 · 可基于新清单续写。',
      ].join('\n')
    case 'expert-figure':
      return [
        ...head,
        '**图注修订**',
        '- 图 2 / 图 3 术语与说明书附图说明对齐',
        '',
        '已回传递交/下游 · 可再齐套。',
      ].join('\n')
    case 'expert-layout':
      return [
        ...head,
        '**布局 v2（飞轮）**',
        '- 主案 + 2 子案时序重排；空白点补一层从权族',
        '- 待你确认布局调整（若已启用布局席）',
        '',
        'F9→F3 信封已消化（样机）。',
      ].join('\n')
    case 'expert-inspire':
      return [
        ...head,
        '**方向简报 v2**',
        '- 保留「热插拔联动」；放弃纯云端调度支路',
        '- 建议回立项/查新重评（示意）',
        '',
        '回流 F2 已落地（样机）。',
      ].join('\n')
    default:
      return `${head.join('\n')}已回传「${from}」· 可基于新产物继续。`
  }
}

/** 下游收到 v2 后继续（不倒 stepIndex） */
export function downstreamResumeScript(
  fromSeat: ProjectExpertId,
  toSeat: ProjectExpertId,
): string {
  const from = businessSeatLabel(fromSeat)
  const to = businessSeatLabel(toSeat)
  return `【${from}】已收到「${to}」v2 · **基于新产物继续本步**（进度不回退）。可再点「让它干活」往下推进。`
}

/** 需要挂到「更多专家」才能看见的席 */
export function feedbackNeedsMoreSeat(toSeat: ProjectExpertId): boolean {
  return (
    toSeat === 'expert-layout' ||
    toSeat === 'expert-inspire' ||
    toSeat === 'expert-enforcement' ||
    toSeat === 'expert-competitor' ||
    toSeat === 'expert-mining' ||
    toSeat === 'expert-landscape' ||
    toSeat === 'expert-fto'
  )
}
