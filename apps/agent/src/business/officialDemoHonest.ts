/**
 * 官报 / 查新 / 递交 · 诚实示意面（样机；禁真通道）
 * Office：示意稿件、样例检索摘要、递交包预览 —— 永不装成局端实发。
 */
export type OfficialDemoKind =
  | 'research'
  | 'figure'
  | 'file'
  | 'diff'
  | 'oa-preview'
  | 'generic'

export const OFFICIAL_DEMO_HONEST =
  '示意稿件 · 样机对照 · 非真官报 / 非真检索 / 非真递交'

/** 短徽章（中栏/挂件旁） */
export const OFFICIAL_DEMO_BADGE: Record<OfficialDemoKind, string> = {
  research: '查新示意 · 非真库',
  figure: '附图示意 · 非定稿',
  file: '递交包预览 · 禁真递交',
  diff: '差分示意 · 非官报',
  'oa-preview': '答复稿示意 · 非局端',
  generic: '样机示意 · 非官报',
}

/** 脚注一句（Office 语感） */
export const OFFICIAL_DEMO_FOOTER: Record<OfficialDemoKind, string> = {
  research:
    '本稿为样例检索摘要，供章节对照；不可当作商业库实查或新颖性结论官文。',
  figure: '图号与部件为示意对齐用；正式附图另由制图环节定稿。',
  file: '递交包与回执均为预览稿；无官方通道、无真案号、不产生官费与法定期限。',
  diff: '左右差分仅对照本稿修订；非官方公报、非审查意见原文。',
  'oa-preview': '答复策略与草稿示意；确认后不写局端、不产生真递交。',
  generic: '样机示意内容；勿当作已递交或已官方回执。',
}

/** 易被误读为「真通道」的 CTA 文案 */
const LIVE_SUBMIT_RE =
  /真递交|递交官方|提交至?局|一键递交|正式递交|CNIPA\s*submit|live\s*file/i

export function looksLikeLiveSubmitCta(label: string): boolean {
  return LIVE_SUBMIT_RE.test(label.trim())
}

/** 安全示意 CTA（替代真通道措辞） */
export const OFFICIAL_DEMO_SAFE_CTA = {
  filePreview: '预览递交包（示意）',
  receiptMemo: '查看回执备忘（示意）',
  researchSample: '打开样例检索摘要',
  noLiveSubmit: '不可真递交官方（样机已禁用）',
} as const

export function officialDemoKindFromSide(
  sideId: string | null | undefined,
): OfficialDemoKind {
  if (sideId === 'research') return 'research'
  if (sideId === 'figure') return 'figure'
  if (sideId === 'file') return 'file'
  return 'generic'
}

/** 水印行：夹在正文里也一眼可辨 */
export function officialDemoWatermark(kind: OfficialDemoKind): string {
  return `【${OFFICIAL_DEMO_BADGE[kind]}】${OFFICIAL_DEMO_HONEST}`
}

/** 样例检索摘要（明确 DEMO 文献号；禁当真命中） */
export function sampleResearchSummaryDemo(): string {
  return [
    '## 样例检索摘要（示意）',
    '',
    `> ${officialDemoWatermark('research')}`,
    '',
    '| # | 示意文献号 | 对照点 | 初判 |',
    '|---|---|---|---|',
    '| 1 | DEMO-CN-AA0001A（示意） | 边缘散热结构 | 待核 · 非实查 |',
    '| 2 | DEMO-CN-BB0002A（示意） | 工质回路 | 待核 · 非实查 |',
    '| 3 | DEMO-US-CC0003A（示意） | 泄漏自检 | 弱相关 · 非实查 |',
    '',
    '**库：** 样例对照库（非商业库实连）',
    '**命中数：** 示意 3 条 · 不可用于官费/期限/三性官文',
    '',
    '— 文字工作者对照用 · 改章节请回主链交底/立项',
  ].join('\n')
}

/** 样例回执备忘（明确非官方） */
export function sampleFilingReceiptDemo(): string {
  return [
    '## 回执备忘（示意）',
    '',
    `> ${officialDemoWatermark('file')}`,
    '',
    '| 项 | 示意值 |',
    '|---|---|',
    '| 案号 | DEMO-示意-0000（非官方） |',
    '| 回执号 | 样机-RCP-····（不可核销） |',
    '| 通道 | 无 · 本页不连局端 |',
    '| 官费/期限 | 不产生 |',
    '',
    '**下一步（示意）：** 勾齐递交包目录 → 席内确认闸；**绝不**静默真递交。',
    '',
    '— 后勤挂件 · 预览稿 · 非官报 API',
  ].join('\n')
}

/** 递交包目录加深（仍示意） */
export function sampleFilingPackDemo(): string {
  return [
    '## 递交包目录（示意预览）',
    '',
    `> ${officialDemoWatermark('file')}`,
    '',
    '- [ ] 请求书（示意页）',
    '- [ ] 说明书 / 权要 / 摘要（本稿章节）',
    '- [ ] 附图（辅链图号对齐）',
    '- [ ] 费用减缓等附件（如有 · 示意）',
    '',
    '**状态：** 齐套勾选预览 · **禁真递交官方**',
    '**CTA：** 仅可「预览 / 写入挂件种子」；无「提交至局」按钮。',
    '',
    '— 预览不等于已递交',
  ].join('\n')
}
