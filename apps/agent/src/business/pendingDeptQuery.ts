/**
 * 确认页 · 按部身份（对齐原型 pending-confirm?dept=）
 * 只做 URL / slug ↔ confirm kind 映射；不改 confirmGate。
 */
import {
  CONFIRM_META,
  type BusinessConfirmKind,
} from './businessSeats'
import {
  deptIdFromSlug,
  deptSlug,
  orgDeptById,
  orgDeptByLeadSeat,
} from '../departments/orgDepts'
import { confirmKindOf } from '../departments/deptProgress'

/** 原型 HTML 用 decision；产品 slug 为 intake（立项） */
const DEPT_QUERY_ALIASES: Record<string, string> = {
  decision: 'intake',
}

export function normalizeDeptQuery(raw: string | null | undefined): string | null {
  const s = raw?.trim()
  if (!s) return null
  return DEPT_QUERY_ALIASES[s] ?? s
}

export function confirmKindFromDeptQuery(
  raw: string | null | undefined,
): BusinessConfirmKind | null {
  const slug = normalizeDeptQuery(raw)
  if (!slug) return null
  const id = deptIdFromSlug(slug)
  if (!id) return null
  const dept = orgDeptById(id)
  return dept ? confirmKindOf(dept) : null
}

export function deptSlugForConfirmKind(
  kind: BusinessConfirmKind,
): string | undefined {
  const seat = CONFIRM_META[kind]?.seatId
  if (!seat) return undefined
  const dept = orgDeptByLeadSeat(seat)
  return dept ? deptSlug(dept.id) : undefined
}

/** /agent/pending/:id?dept= */
export function pendingDetailPath(
  confirmId: string,
  deptSlugParam?: string | null,
): string {
  const base = `/agent/pending/${confirmId}`
  const slug = normalizeDeptQuery(deptSlugParam)
  if (!slug) return base
  return `${base}?dept=${encodeURIComponent(slug)}`
}

/** 拍板主路径：回对应部门工作台右栏（真源废独立确认页主路径） */
export function workbenchAskPath(
  caseId: string,
  kind: BusinessConfirmKind,
  opts?: { confirmId?: string | null },
): string {
  const slug = deptSlugForConfirmKind(kind)
  if (!slug) return `/agent/cases/${encodeURIComponent(caseId)}`
  const q = new URLSearchParams()
  q.set('ask', opts?.confirmId?.trim() || '1')
  return `/agent/cases/${encodeURIComponent(caseId)}/depts/${slug}?${q.toString()}`
}

/** 薄审计面（不抢拍板）；主路径请用 workbenchAskPath */
export function pendingAuditPath(
  confirmId: string,
  deptSlugParam?: string | null,
): string {
  const base = pendingDetailPath(confirmId, deptSlugParam)
  return base.includes('?') ? `${base}&audit=1` : `${base}?audit=1`
}
