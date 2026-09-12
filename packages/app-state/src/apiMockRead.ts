/**
 * 读路径优先 api-mock（样机，非真后端）。
 * 默认开；VITE_IP_API_MOCK_READ=0 或 localStorage['ip-harness.api-mock.read']='0' 关。
 * API 可达时按 id 叠加/覆盖瘦字段到已有 PatentCase；勿用 CaseSummary 整表替换。
 */
import { createApiClient, type CaseSummary, type InboxItem } from '@ip/api'
import { STAGE_ORDER } from '@ip/domain'
import type { PatentCase, RiskLevel, StageId } from '@ip/domain/types'

const LS_KEY = 'ip-harness.api-mock.read'

const RISK_LEVELS = new Set<string>(['低', '中', '高'])
const STAGE_IDS = new Set<string>(STAGE_ORDER)

function readViteFlag(): string | undefined {
  try {
    return import.meta.env?.VITE_IP_API_MOCK_READ
  } catch {
    return undefined
  }
}

function readLocalStorageFlag(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(LS_KEY)
  } catch {
    return null
  }
}

/** 默认开：仅当 env 或 LS 显式为 '0' 时关 */
export function isApiMockReadPreferred(): boolean {
  if (readViteFlag() === '0') return false
  if (readLocalStorageFlag() === '0') return false
  return true
}

export function apiMockReadModeLabel(): string {
  return isApiMockReadPreferred()
    ? '读路径优先 @ip/api → api-mock:5180（样机）；失败 fallback 内存 seed；按 id 叠加瘦字段'
    : '读路径仅内存 seed（api-mock 读开关已关）'
}

function isStageId(v: string): v is StageId {
  return STAGE_IDS.has(v)
}

function isRiskLevel(v: string): v is RiskLevel {
  return RISK_LEVELS.has(v)
}

/**
 * 将 CaseSummary 瘦字段叠加到已有 PatentCase。
 * stage 非法则保留原 stage；handoffNote 轻量并入 summary（不强制改 timeline）。
 */
export function mergeCaseSummaryOntoPatentCase(
  c: PatentCase,
  s: CaseSummary,
): PatentCase {
  const next: PatentCase = {
    ...c,
    title: s.title || c.title,
    caseNo: s.caseNo || c.caseNo,
    nextDeadline: s.nextDeadline || c.nextDeadline,
    summary: s.summary || c.summary,
  }
  if (isStageId(s.stage)) {
    next.stage = s.stage
  }
  if (isRiskLevel(s.risk)) {
    next.risk = s.risk
  }
  if (s.handoffNote?.trim()) {
    const note = s.handoffNote.trim()
    // 轻量展示：若 summary 尚未包含该备注则追加一行
    if (!next.summary.includes(note)) {
      next.summary = next.summary
        ? `${next.summary} · ${note}`
        : note
    }
  }
  return next
}

/** GET /v1/cases → CaseSummary[]；网络/抛错 → null */
export async function tryListCasesFromApiMock(): Promise<CaseSummary[] | null> {
  try {
    const client = createApiClient()
    return await client.listCases()
  } catch {
    return null
  }
}

/** GET /v1/cases/:id → CaseSummary；网络/抛错/404 → null */
export async function tryGetCaseFromApiMock(
  id: string,
): Promise<CaseSummary | null> {
  try {
    const client = createApiClient()
    return await client.getCase(id)
  } catch {
    return null
  }
}

/** GET /v1/inbox → InboxItem[]；网络/抛错 → null（不拆现有 sla/watch Inbox） */
export async function tryGetInboxFromApiMock(
  persona?: string,
): Promise<InboxItem[] | null> {
  try {
    const client = createApiClient()
    return await client.getInbox(persona)
  } catch {
    return null
  }
}
