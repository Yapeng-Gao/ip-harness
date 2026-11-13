/**
 * Stage Module SKU helpers — mock tenant entitlements for sellable stages.
 * Spec: docs/workbench/STAGE_MODULE_SKU.md
 */

/** Sellable stage SKUs (home/shell is not a SKU). */
export type StageSkuId =
  | 'wb.stage.research'
  | 'wb.stage.intake'
  | 'wb.stage.draft'
  | 'wb.stage.prosecution'
  | 'wb.stage.maintain'
  | 'wb.stage.monetize'
  | 'wb.stage.watch'
  | 'wb.stage.layout'
  | 'wb.portal.inventor'

export type TenantEntitlements = {
  tenantId: string
  /** Purchased stage SKUs; empty = shell home only */
  stageSkus: StageSkuId[]
  /** Optional expiry — prototype may ignore */
  expiresAt?: string
}

/** STAGE_MODULES id → SKU; home → null (shell, always allowed). */
export const STAGE_ID_TO_SKU: Record<string, StageSkuId | null> = {
  research: 'wb.stage.research',
  intake: 'wb.stage.intake',
  draft: 'wb.stage.draft',
  prosecution: 'wb.stage.prosecution',
  maintain: 'wb.stage.maintain',
  monetize: 'wb.stage.monetize',
  watch: 'wb.stage.watch',
  layout: 'wb.stage.layout',
  home: null,
  inventor: 'wb.portal.inventor',
}

/**
 * Handoff artifact key → stage module id (aligned with STAGE_MODULES).
 * Kept local to avoid lib ↔ stages circular imports.
 */
export const HANDOFF_KEY_TO_MODULE_ID: Record<string, string> = {
  research_report: 'research',
  intake_quote: 'intake',
  draft_claims: 'draft',
  prosecution_response: 'prosecution',
  maintain_annuity: 'maintain',
  monetize_terms: 'monetize',
  watch_alert: 'watch',
  layout_insight: 'layout',
  disclosure_pack: 'inventor',
}

/** Demo default: all Core stages + inventor; layout DENIED (add-on). */
export const DEFAULT_STAGE_SKUS: StageSkuId[] = [
  'wb.stage.research',
  'wb.stage.intake',
  'wb.stage.draft',
  'wb.stage.prosecution',
  'wb.stage.maintain',
  'wb.stage.monetize',
  'wb.stage.watch',
  'wb.portal.inventor',
]

/** Chinese labels for honest empty / demo panel. */
export const STAGE_SKU_LABELS: Record<StageSkuId, string> = {
  'wb.stage.research': '调研台',
  'wb.stage.intake': '立项评估',
  'wb.stage.draft': '撰写台',
  'wb.stage.prosecution': '审查意见答复',
  'wb.stage.maintain': '年费维持',
  'wb.stage.monetize': '运营变现',
  'wb.stage.watch': '监测预警',
  'wb.stage.layout': '布局洞察（辅台）',
  'wb.portal.inventor': '发明人交底门户',
}

/** Modules that can be sold / toggled in the demo panel (excludes home). */
export const SELLABLE_MODULE_IDS = [
  'research',
  'intake',
  'draft',
  'prosecution',
  'maintain',
  'monetize',
  'watch',
  'layout',
  'inventor',
] as const

export type SellableModuleId = (typeof SELLABLE_MODULE_IDS)[number]

export const STAGE_SKU_STORAGE_KEY = 'ip-workbench-stage-skus'

export function skuForModuleId(id: string): StageSkuId | null {
  if (id in STAGE_ID_TO_SKU) return STAGE_ID_TO_SKU[id] ?? null
  return null
}

export function isModuleEntitled(
  moduleId: string,
  entitlements: TenantEntitlements,
): boolean {
  if (moduleId === 'home') return true
  const sku = STAGE_ID_TO_SKU[moduleId]
  if (sku === undefined) return false
  if (sku === null) return true
  return entitlements.stageSkus.includes(sku)
}

/**
 * Map pathname → STAGE_MODULES id.
 * Recognizes /workbench, /workbench/<stage>, /workbench/<stage>/:caseId,
 * /inventor, /portal/inventor.
 */
export function pathToStageModuleId(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/workbench') return 'home'
  if (path === '/inventor' || path.startsWith('/inventor/')) return 'inventor'
  if (path === '/portal/inventor' || path.startsWith('/portal/inventor/')) {
    return 'inventor'
  }
  const m = path.match(/^\/workbench\/([a-z]+)(?:\/|$)/)
  if (!m) return null
  const id = m[1]
  return id in STAGE_ID_TO_SKU ? id : null
}

/** Handoff artifact key → stage module id. */
export function moduleIdForHandoffKey(handoffKey: string): string | null {
  return HANDOFF_KEY_TO_MODULE_ID[handoffKey] ?? null
}

export function readStoredStageSkus(): StageSkuId[] | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STAGE_SKU_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const allowed = new Set(
      Object.values(STAGE_ID_TO_SKU).filter((v): v is StageSkuId => v != null),
    )
    return parsed.filter((x): x is StageSkuId => typeof x === 'string' && allowed.has(x as StageSkuId))
  } catch {
    return null
  }
}

export function writeStoredStageSkus(skus: StageSkuId[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STAGE_SKU_STORAGE_KEY, JSON.stringify(skus))
  } catch {
    /* ignore quota */
  }
}
