/**
 * HITL 辅审（样机）· 每次待确认详情必出建议，人不自动过闸
 * 首轮可按 kind 建议退回；改稿后再交卷 → after_revise 翻成建议确认
 */
import type { BusinessConfirmKind } from './businessSeats'
import { CONFIRM_KIND_LABEL, CONFIRM_META } from './businessSeats'

export type HitlAssistVerdict = 'approve' | 'return'

export type HitlAssistPass = 'first' | 'after_revise'

export type HitlAssistReview = {
  kind: BusinessConfirmKind
  pass: HitlAssistPass
  /** 建议确认 | 建议退回修改 */
  verdict: HitlAssistVerdict
  verdictLabel: string
  /** ≤3 条人话理由 */
  reasons: string[]
  /** 一键退回时预填的备注 */
  returnNote: string
  /** 交卷席自检一句（可选并列） */
  ownerSelfCheck: string
  /** 样机脚注 */
  disclaimer: string
}

const DISCLAIMER = '样机辅审 · 非真审校模型'

const TABLE: Record<
  BusinessConfirmKind,
  Omit<HitlAssistReview, 'kind' | 'disclaimer' | 'pass'>
> = {
  research_ready: {
    verdict: 'approve',
    verdictLabel: '建议确认',
    reasons: [
      '覆盖度与三性结论可扫读，对比文件清单齐全',
      '未发现明显漏检口径冲突',
      '确认后可进入立项评分',
    ],
    returnNote: '查新覆盖度不足 · 请再扫一轮对比文件',
    ownerSelfCheck: '查新自检：检索式 + 三性表已写入成果预览',
  },
  go_nogo: {
    verdict: 'approve',
    verdictLabel: '建议确认',
    reasons: [
      '三轴分与 Go/附条件表述齐全',
      '风险点已写进人话摘要',
      '确认后可开交底',
    ],
    returnNote: '立项附条件未写清 · 请补评分说明后再提请',
    ownerSelfCheck: '立项自检：三轴雷达与附条件已落摘要',
  },
  disclosure_ready: {
    verdict: 'return',
    verdictLabel: '建议退回修改',
    reasons: [
      '效果数据段仍偏薄，实施例可再补一组数字',
      '六段结构可读，但区别特征笔墨不足',
      '建议先请交底补强再确认，避免撰写空转',
    ],
    returnNote: '交底效果数据与区别特征偏少 · 请补强后再提请确认',
    ownerSelfCheck: '交底自检：六段齐 · Warn·效果数据待补',
  },
  claims_ready: {
    verdict: 'return',
    verdictLabel: '建议退回修改',
    reasons: [
      '独权支持性有 Warn，说明书对应段需再对齐',
      '从属引用链可读，但超范围风险未消',
      '建议退回撰写改一版再确认',
    ],
    returnNote: '权要支持性 Warn / 超范围风险 · 请改一版后再提请',
    ownerSelfCheck: '撰写自检：四类校验 · 1 Warn 未清',
  },
  figures_ready: {
    verdict: 'approve',
    verdictLabel: '建议确认',
    reasons: [
      '图号与图注清单齐全，与权要术语可对齐',
      '草图为样机 mock，可读即可',
      '确认后可进入递交齐套',
    ],
    returnNote: '图注与权要术语不一致 · 请改图号/图注后再提请',
    ownerSelfCheck: '附图自检：冻图号 + OCR 术语勾选完成',
  },
  file_authorize: {
    verdict: 'approve',
    verdictLabel: '建议确认',
    reasons: [
      '齐套清单与形式点已列出',
      '摘要字数 / 附图引用链未见硬挡',
      '确认后示意递交（非真局端）',
    ],
    returnNote: '形式审查点未清 · 请改书式后再授权递交',
    ownerSelfCheck: '递交自检：齐套勾选完成 · 形式点 0 硬挡',
  },
  oa_strategy: {
    verdict: 'approve',
    verdictLabel: '建议确认',
    reasons: [
      '理由分类与子任务汇入路径清楚',
      '策略方向与本案已递交状态匹配',
      '确认后可开答复草稿',
    ],
    returnNote: '策略方向不对 · 请按审查意见重做分类与子任务',
    ownerSelfCheck: '答复自检：理由类 + 子任务表已写入过程',
  },
  layout_adjust: {
    verdict: 'return',
    verdictLabel: '建议退回修改',
    reasons: [
      '回流信封未说清「补哪一局」',
      '空白点与现有族谱对照偏粗',
      '建议布局再调一版再拍板',
    ],
    returnNote: '布局回流信封未说清补局 · 请调整后再提请确认',
    ownerSelfCheck: '布局自检：飞轮信封草案 · 补局表述待收紧',
  },
}

/** 改稿后再交卷：一律建议确认（认领上一轮批注已处理） */
function afterReviseRow(
  kind: BusinessConfirmKind,
  priorNote?: string,
): Omit<HitlAssistReview, 'kind' | 'disclaimer' | 'pass'> {
  const noteHint = priorNote?.trim().slice(0, 40)
  return {
    verdict: 'approve',
    verdictLabel: '建议确认',
    reasons: [
      noteHint
        ? `已对照退回意见「${noteHint}」补强一版（样机）`
        : '已按上一轮退回意见改稿一版（样机）',
      '原先缺口在本版过程/成果中已有对应补强痕迹',
      '可确认放行；若仍不放心可再退回',
    ],
    returnNote: TABLE[kind].returnNote,
    ownerSelfCheck: `${CONFIRM_META[kind].preparedBy}自检：改稿后复检通过（样机）`,
  }
}

/** 按确认 kind + 是否改稿后再交 出辅审 */
export function buildHitlAssistReview(
  kind: BusinessConfirmKind,
  opts?: { pass?: HitlAssistPass; priorReturnNote?: string },
): HitlAssistReview {
  const pass = opts?.pass ?? 'first'
  const row =
    pass === 'after_revise'
      ? afterReviseRow(kind, opts?.priorReturnNote)
      : TABLE[kind]
  return {
    kind,
    pass,
    ...row,
    disclaimer: DISCLAIMER,
  }
}

export function hitlAssistTitle(kind: BusinessConfirmKind): string {
  return `助手审校 · ${CONFIRM_KIND_LABEL[kind]}`
}

export function hitlAssistOwnerLabel(kind: BusinessConfirmKind): string {
  return CONFIRM_META[kind].preparedBy
}
