export const BUSINESS_SEED_IDS = {
  A: 'case-biz-edge-scheduler',
  B: 'case-biz-sensor-pack',
  /** Knife2 · 已递交 · 审查答复样机 */
  C: 'case-biz-oa-filed',
  /** Knife3 · 启用布局 · F9→F3 飞轮样机 */
  D: 'case-biz-layout-flywheel',
} as const

const BUSINESS_SEED_ID_SET = new Set<string>(Object.values(BUSINESS_SEED_IDS))

/** 种子案 id（Lab/环边演示）；全局收件箱默认不展示其 pending */
export function isBusinessSeedCaseId(caseId: string): boolean {
  return BUSINESS_SEED_ID_SET.has(caseId)
}
