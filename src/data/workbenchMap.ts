import type { StageId } from '../types'
import { appHref } from '../lib/deepLinks'

export const STAGE_WORKBENCH_PATH: Record<StageId, string> = {
  pre_research: '/workbench/research',
  decision: '/workbench/intake',
  drafting: '/workbench/draft',
  prosecution: '/workbench/prosecution',
  maintenance: '/workbench/maintain',
  commercialization: '/workbench/monetize',
  monitoring: '/workbench/watch',
}

/** Relative path（本面 / legacy）. */
export function workbenchPathForStage(stage: StageId, caseId?: string) {
  const base = STAGE_WORKBENCH_PATH[stage]
  return caseId ? `${base}/${caseId}` : base
}

/** multi-app 下跨口绝对 URL；同面仍相对. */
export function workbenchHrefForStage(stage: StageId, caseId?: string) {
  return appHref(workbenchPathForStage(stage, caseId))
}
