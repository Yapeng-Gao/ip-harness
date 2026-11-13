import { RUN_STATUS_LABEL } from '@shared/data/agents'
import type { AgentRunStatus } from '@shared/types'

/**
 * ART-M-1 · Agent shell primary status vocabulary.
 * Shared RUN_STATUS_LABEL keeps「待你确认」for mid/ops; Agent surfaces use「待确认」.
 */
export function agentRunStatusLabel(status: AgentRunStatus | string): string {
  if (status === 'needs_human') return '待确认'
  return RUN_STATUS_LABEL[status] ?? String(status)
}
