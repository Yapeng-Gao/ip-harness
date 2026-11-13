/**
 * §97 待确认全清单分组 · 交底 / 申请 / 答复 / 更多
 * 按部身份归组；不改 confirmGate。
 */
import type { BusinessConfirmKind } from './businessSeats'
import { deptSlugForConfirmKind } from './pendingDeptQuery'

export type PendingPathGroupId = 'disclosure' | 'draft' | 'oa' | 'more'

export const PENDING_PATH_GROUPS: {
  id: PendingPathGroupId
  label: string
}[] = [
  { id: 'disclosure', label: '交底' },
  { id: 'draft', label: '申请' },
  { id: 'oa', label: '答复' },
  { id: 'more', label: '更多' },
]

export function pendingPathGroupOf(
  kind: BusinessConfirmKind,
): PendingPathGroupId {
  const slug = deptSlugForConfirmKind(kind)
  if (slug === 'disclosure') return 'disclosure'
  if (slug === 'draft') return 'draft'
  if (slug === 'oa') return 'oa'
  return 'more'
}
