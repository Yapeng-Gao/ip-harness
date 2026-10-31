/**
 * T10 判断沉淀 · 对齐交互大纲 §4.4.8 / §4.5 + main-path-sample addJudgment
 * 机制：硬请示确认/驳回后写入案卷「判断档案」；可再沉淀为跨案偏好。
 * 演示密度 · 非真知识库引擎；禁只留操作考勤冒充判断。
 */
import type { BusinessConfirmKind } from './businessSeats'
import { confirmDecisionMeta } from './confirmGate'
import { buildAskEvidence } from './askEvidence'

export type JudgmentConfidence = 'high' | 'mid' | 'low' | ''

export type JudgmentRecord = {
  id: string
  caseId: string
  at: string
  /** 闸口短名 · 如「④可交⑤」「⑤申不申」 */
  gate: string
  conclusion: string
  /** 用户拍的选项 · 确认 / 驳回 / 不申结案 / 认风险… */
  option: string
  reason: string
  evidenceAnchor: string
  source: string
  compare: string
  confidence: JudgmentConfidence
  /** 认风险类 */
  riskAccepted?: boolean
  confirmId?: string
  kind?: BusinessConfirmKind
}

export type PreferenceRecord = {
  id: string
  /** null = 跨案；有值 = 本案衍生 */
  caseId: string | null
  text: string
  from: string
  precipitable: boolean
  saved: boolean
  savedAt?: string
}

export function nowJudgmentStamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function gateLabelForKind(kind: BusinessConfirmKind): string {
  const m = confirmDecisionMeta(kind)
  const map: Partial<Record<BusinessConfirmKind, string>> = {
    disclosure_ready: '④可交⑤',
    research_ready: '查新结论',
    go_nogo: '立项申不申',
    claims_ready: '⑤保护范围',
    figures_ready: '附图定稿',
    file_authorize: '⑤确认递交',
    oa_strategy: '⑥答复策略',
    layout_adjust: '布局调整',
  }
  return map[kind] ?? m.decisionShort
}

/**
 * 从硬请示项生成一条判断档案（确认或驳回）
 */
export function buildJudgmentFromConfirm(input: {
  caseId: string
  confirmId: string
  kind: BusinessConfirmKind
  summary: string
  resultPreview?: string
  processPreview?: string
  decision: 'confirmed' | 'returned'
  reason?: string
  riskAccepted?: boolean
  at?: Date
}): JudgmentRecord {
  const meta = confirmDecisionMeta(input.kind)
  const ev = buildAskEvidence({
    kind: input.kind,
    summary: input.summary,
    resultPreview: input.resultPreview,
    processPreview: input.processPreview,
  })
  const conclusion =
    ev.pieces.find((p) => p.id === 'conclusion')?.body ||
    input.summary ||
    meta.decisionShort
  const source = ev.pieces.find((p) => p.id === 'source')?.present
    ? ev.pieces.find((p) => p.id === 'source')!.body
    : ''
  const compare = ev.pieces.find((p) => p.id === 'contrast')?.present
    ? ev.pieces.find((p) => p.id === 'contrast')!.body
    : ''
  const reasoning = ev.pieces.find((p) => p.id === 'reasoning')?.present
    ? ev.pieces.find((p) => p.id === 'reasoning')!.body
    : ''
  const option =
    input.decision === 'confirmed'
      ? `确认 · ${meta.decisionShort}`
      : '驳回并退回改稿'
  const reason =
    (input.reason?.trim() ||
      (input.decision === 'confirmed'
        ? '接受结论'
        : '未填理由')) +
    (input.riskAccepted ? ' · 认风险仍继续' : '')

  return {
    id: `j-${input.confirmId}-${input.decision}-${Date.now()}`,
    caseId: input.caseId,
    at: nowJudgmentStamp(input.at),
    gate: gateLabelForKind(input.kind),
    conclusion: conclusion.slice(0, 240),
    option,
    reason,
    evidenceAnchor: reasoning ? `推演摘要` : source ? '来源入口' : '硬请示卡',
    source: source.slice(0, 200),
    compare: compare.slice(0, 200),
    confidence: ev.signReady ? 'high' : 'mid',
    riskAccepted: Boolean(input.riskAccepted),
    confirmId: input.confirmId,
    kind: input.kind,
  }
}

/** B5 等支路：不经 pending 也可写入判断 */
export function buildBranchJudgment(input: {
  caseId: string
  gate: string
  conclusion: string
  option: string
  reason?: string
  compare?: string
  at?: Date
}): JudgmentRecord {
  return {
    id: `j-branch-${Date.now()}`,
    caseId: input.caseId,
    at: nowJudgmentStamp(input.at),
    gate: input.gate,
    conclusion: input.conclusion.slice(0, 240),
    option: input.option,
    reason: input.reason?.trim() || '支路拍板（演示）',
    evidenceAnchor: '支路门',
    source: '',
    compare: input.compare ?? '',
    confidence: 'mid',
  }
}

export function preferenceCandidateFromJudgment(
  j: JudgmentRecord,
): PreferenceRecord {
  return {
    id: `pref-pend-${j.id}`,
    caseId: j.caseId,
    text: `跨案偏好：${j.gate} · ${j.option} · ${j.conclusion}`.slice(0, 120),
    from: `本案判断档案 · ${j.gate}`,
    precipitable: true,
    saved: false,
  }
}

export function savePreference(
  list: PreferenceRecord[],
  prefId: string,
  at = new Date(),
): PreferenceRecord[] {
  return list.map((p) =>
    p.id === prefId
      ? {
          ...p,
          saved: true,
          precipitable: false,
          savedAt: nowJudgmentStamp(at),
        }
      : p,
  )
}

export function precipitateJudgmentAsPreference(
  list: PreferenceRecord[],
  j: JudgmentRecord,
  at = new Date(),
): PreferenceRecord[] {
  const nid = `pref-${Date.now()}`
  return [
    {
      id: nid,
      caseId: null,
      text: `跨案偏好：${j.gate} · ${j.conclusion}`.slice(0, 120),
      from: '本次判断档案',
      precipitable: false,
      saved: true,
      savedAt: nowJudgmentStamp(at),
    },
    ...list,
  ]
}

/** 案卷抽屉展示：种子 + 实写合并（实写在前） */
export function mergeJudgmentsForDrawer(
  live: JudgmentRecord[],
  seed: { at: string; text: string }[],
): JudgmentRecord[] {
  if (live.length > 0) return live
  return seed.map((s, i) => ({
    id: `seed-${i}`,
    caseId: '',
    at: s.at,
    gate: s.at,
    conclusion: s.text,
    option: '（种子示意）',
    reason: '尚未有硬请示写回；确认后替换为本条档案',
    evidenceAnchor: '',
    source: '',
    compare: '',
    confidence: '' as JudgmentConfidence,
  }))
}
