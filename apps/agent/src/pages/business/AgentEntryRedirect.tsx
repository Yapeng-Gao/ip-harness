import { Navigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { pickLatestCaseId } from '../../business/entryRole'
import { useEntryRole } from '../../business/useEntryRole'

/**
 * /agent index · 双角色默认落点（product-vision）
 * - 代理 → 多案流水 /agent/cases
 * - 企业 + 有案 → 最近案子公司首页
 * - 企业 + 无案 → 开案子 /agent/cases/new
 */
export function AgentEntryRedirect() {
  const { entryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()

  const target = useMemo(() => {
    if (entryRole === 'agency') return '/agent/cases'

    if (cases.length === 0) return '/agent/cases/new'

    const latestId = pickLatestCaseId(
      cases,
      (id) => getProgress(id).updatedAt,
      (id) => {
        const logs = getProcessLogs(id)
        if (logs.length === 0) return undefined
        return logs.reduce(
          (max, l) => (l.at > max ? l.at : max),
          logs[0]!.at,
        )
      },
    )
    return `/agent/cases/${latestId ?? cases[0]!.id}`
  }, [entryRole, cases, getProgress, getProcessLogs])

  return <Navigate to={target} replace />
}
