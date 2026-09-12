/** 中国发明专利期限引擎 · 示意规则（标注来源·专利法实施细则/审查指南） */

export type DocketRuleId =
  | 'oa1_response'
  | 'oa_subsequent'
  | 'application_fee'
  | 'substantive_exam_request'
  | 'grant_registration'
  | 'annuity'
  | 'pct_national_entry'

export interface DocketRule {
  id: DocketRuleId
  name: string
  triggerLabel: string
  /** human-readable period */
  periodHint: string
  /** months (approx) from trigger; for day-based use days instead */
  months?: number
  days?: number
  /** grace / surcharge months */
  graceMonths?: number
  officialFeeHint: string
  sourceNote: string
  slaDefaultDays: number
}

export const DOCKET_RULES: DocketRule[] = [
  {
    id: 'oa1_response',
    name: '一通答复',
    triggerLabel: '发文日（实审第一次审查意见）',
    periodHint: '发文日起约 4 个月',
    months: 4,
    officialFeeHint: '延期请求费（示意）：第1月 ¥300 / 第2月 ¥600 / 第3月 ¥900',
    sourceNote: '示意·审查指南 / 专利法实施细则 · 指定期限常见 4 个月（一通）',
    slaDefaultDays: 120,
  },
  {
    id: 'oa_subsequent',
    name: '后续审查意见答复',
    triggerLabel: '发文日（二通及以后）',
    periodHint: '指定期限常见 2 个月',
    months: 2,
    officialFeeHint: '延期请求费（示意）按月累进',
    sourceNote: '示意·审查指南 · 后续意见通知书指定期限常见 2 个月',
    slaDefaultDays: 60,
  },
  {
    id: 'application_fee',
    name: '申请费缴纳',
    triggerLabel: '申请日 / 收到受理通知书',
    periodHint: '申请日起 2 个月 / 收到受理通知 15 日',
    months: 2,
    days: 15,
    officialFeeHint: '发明申请费（示意）¥900 + 公布印刷费 ¥50；实审费另计',
    sourceNote: '示意·专利法实施细则 · 申请费缴纳期限',
    slaDefaultDays: 60,
  },
  {
    id: 'substantive_exam_request',
    name: '实审请求',
    triggerLabel: '优先权日（无优先权则申请日）',
    periodHint: '优先权日起 3 年',
    months: 36,
    officialFeeHint: '发明实质审查费（示意）¥2,500',
    sourceNote: '示意·专利法 · 实质审查请求期限',
    slaDefaultDays: 1095,
  },
  {
    id: 'grant_registration',
    name: '授权登记 / 年费',
    triggerLabel: '收到授权登记通知书',
    periodHint: '收到登记通知起 2 个月',
    months: 2,
    officialFeeHint: '登记费 + 印花税 + 当年年费（示意）合计约 ¥255–¥数千',
    sourceNote: '示意·专利法实施细则 · 办理登记手续期限',
    slaDefaultDays: 60,
  },
  {
    id: 'annuity',
    name: '年费',
    triggerLabel: '申请日届满对应日',
    periodHint: '届满前缴纳；逾期 6 个月可缴滞纳金',
    months: 12,
    graceMonths: 6,
    officialFeeHint: '发明年费（示意）：1–3 年 ¥900 / 4–6 年 ¥1,200 / … 递增',
    sourceNote: '示意·专利法实施细则 · 年费及滞纳金',
    slaDefaultDays: 365,
  },
  {
    id: 'pct_national_entry',
    name: 'PCT 进中国',
    triggerLabel: '优先权日',
    periodHint: '优先权起 30 月（宽限 32 月）',
    months: 30,
    graceMonths: 2,
    officialFeeHint: '进入国家阶段费用（示意）：申请费 + 附加费 + 实审费等',
    sourceNote: '示意·PCT 细则 / 中国国家阶段进入期限',
    slaDefaultDays: 912,
  },
]

export function getDocketRule(id: DocketRuleId): DocketRule {
  return DOCKET_RULES.find((r) => r.id === id) ?? DOCKET_RULES[0]
}

export function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate.slice(0, 10) + 'T00:00:00')
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate.slice(0, 10) + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function computeDueDate(
  ruleId: DocketRuleId,
  triggerDate: string,
): string {
  const rule = getDocketRule(ruleId)
  if (rule.months != null) return addMonths(triggerDate, rule.months)
  if (rule.days != null) return addDays(triggerDate, rule.days)
  return triggerDate
}

export type DocketEventStatus = 'upcoming' | 'due_soon' | 'overdue' | 'done'

/** Wave2 Docket 升级阶梯 */
export type DocketEscalationLevel =
  | 'none'
  | 'reminded'
  | 'escalated_enterprise'
  | 'at_risk'

export interface DocketEvent {
  id: string
  caseId: string
  ruleId: DocketRuleId
  title: string
  triggerDate: string
  dueDate: string
  status: DocketEventStatus
  officialFeeHint: string
  linkedHandoffKey?: string
  note?: string
  receiptNo?: string
  /** 由业务办理递交归档回写生成 */
  fromHandoffWriteback?: boolean
  /** Wave2：升级阶梯（缺省 none） */
  escalationLevel?: DocketEscalationLevel
  escalationAt?: string
  escalationActor?: string
  /** 标记风险旗标（事件级） */
  atRisk?: boolean
}

/** Seed docket events for demo cases (示意) */
export const INITIAL_DOCKET_EVENTS: DocketEvent[] = [
  {
    id: 'de1',
    caseId: 'c1',
    ruleId: 'oa1_response',
    title: '一通答复 · 边缘计算节点调度',
    triggerDate: '2026-05-28',
    dueDate: '2026-09-16',
    status: 'due_soon',
    officialFeeHint: '延期请求费（示意）按月累进',
    linkedHandoffKey: 'prosecution_response',
    note: '由 OA 发文日生成 · 发文日 2026-05-28',
  },
  {
    id: 'de1b',
    caseId: 'c1',
    ruleId: 'oa_subsequent',
    title: '二通答复（示意）· 边缘计算节点调度',
    triggerDate: '2026-03-10',
    dueDate: '2026-05-10',
    status: 'done',
    officialFeeHint: '后续意见指定期限常见 2 个月',
    linkedHandoffKey: 'prosecution_response',
    note: '历史二通已答复 · 回执 CN2026OA-C1-PREV',
    receiptNo: 'CN2026OA-C1-PREV',
    fromHandoffWriteback: true,
  },
  {
    id: 'de2',
    caseId: 'c7',
    ruleId: 'oa_subsequent',
    title: '补正答复 · 分布式数据库一致性',
    triggerDate: '2026-08-05',
    dueDate: '2026-10-05',
    status: 'upcoming',
    officialFeeHint: '形式补正通常无额外官费（示意）',
    linkedHandoffKey: 'prosecution_response',
  },
  {
    id: 'de3',
    caseId: 'c4',
    ruleId: 'application_fee',
    title: '申请费缴纳 · 低功耗蓝牙 Mesh',
    triggerDate: '2026-08-20',
    dueDate: '2026-10-20',
    status: 'upcoming',
    officialFeeHint: '发明申请费 ¥900 + 公布印刷费 ¥50（示意）',
    linkedHandoffKey: 'draft_claims',
  },
  {
    id: 'de4',
    caseId: 'c4',
    ruleId: 'substantive_exam_request',
    title: '实审请求 · 低功耗蓝牙 Mesh',
    triggerDate: '2026-08-20',
    dueDate: '2029-08-20',
    status: 'upcoming',
    officialFeeHint: '实质审查费 ¥2,500（示意）',
  },
  {
    id: 'de5',
    caseId: 'c6',
    ruleId: 'annuity',
    title: '第 2 年年费 · 医疗影像三维重建外观',
    triggerDate: '2026-03-01',
    dueDate: '2027-03-01',
    status: 'upcoming',
    officialFeeHint: '外观设计年费（示意）¥600',
    linkedHandoffKey: 'maintain_annuity',
  },
  {
    id: 'de6',
    caseId: 'c2',
    ruleId: 'substantive_exam_request',
    title: '实审请求预估 · 固态电池电解质配方',
    triggerDate: '2026-09-01',
    dueDate: '2029-09-01',
    status: 'upcoming',
    officialFeeHint: '实质审查费 ¥2,500（示意）· 立案后适用',
  },
  {
    id: 'de7',
    caseId: 'c9',
    ruleId: 'pct_national_entry',
    title: 'PCT 进中国 · 示意案件',
    triggerDate: '2024-04-15',
    dueDate: '2026-10-15',
    status: 'due_soon',
    officialFeeHint: '进入国家阶段费用合计（示意）约 ¥5,000+',
    note: '优先权起 30 月；宽限至 32 月',
  },
  {
    id: 'de8',
    caseId: 'c3',
    ruleId: 'annuity',
    title: '年费 · 工业视觉缺陷检测系统',
    triggerDate: '2025-10-15',
    dueDate: '2026-10-15',
    status: 'upcoming',
    officialFeeHint: '发明年费第 4–6 年 ¥1,200（示意）',
    linkedHandoffKey: 'maintain_annuity',
  },
  {
    id: 'de9',
    caseId: 'c7',
    ruleId: 'oa_subsequent',
    title: '补正逾期示意 · 分布式数据库一致性',
    triggerDate: '2026-06-01',
    dueDate: '2026-08-01',
    status: 'overdue',
    officialFeeHint: '逾期未答复风险（示意）',
    linkedHandoffKey: 'prosecution_response',
    note: 'Wave1 Inbox 种子 · overdue 分类',
  },
]

export function generateDocketFromEvent(opts: {
  caseId: string
  ruleId: DocketRuleId
  triggerDate: string
  caseTitle?: string
  linkedHandoffKey?: string
}): DocketEvent {
  const rule = getDocketRule(opts.ruleId)
  const dueDate = computeDueDate(opts.ruleId, opts.triggerDate)
  return {
    id: `de-gen-${Date.now()}`,
    caseId: opts.caseId,
    ruleId: opts.ruleId,
    title: `${rule.name}${opts.caseTitle ? ` · ${opts.caseTitle}` : ''}`,
    triggerDate: opts.triggerDate,
    dueDate,
    status: 'upcoming',
    officialFeeHint: rule.officialFeeHint,
    linkedHandoffKey: opts.linkedHandoffKey,
    note: `由事件生成期限 · ${rule.sourceNote}`,
  }
}



/** Mock 发明年费档位（示意） */
const ANNUITY_FEES = [900, 900, 900, 1200, 1200, 1200, 2000, 2000, 2000, 4000]

export function generateAnnuitySchedule(
  baseDate: string,
  years = 5,
  startYear = 1,
): { year: number; due: string; amount: string; paid: boolean; officialFee: number }[] {
  const out: { year: number; due: string; amount: string; paid: boolean; officialFee: number }[] = []
  for (let i = 0; i < years; i++) {
    const year = startYear + i
    const fee = ANNUITY_FEES[Math.min(year - 1, ANNUITY_FEES.length - 1)]
    out.push({
      year,
      due: addMonths(baseDate, 12 * i),
      amount: `${fee} 元`,
      paid: false,
      officialFee: fee,
    })
  }
  return out
}
