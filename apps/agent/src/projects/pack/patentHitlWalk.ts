/**
 * Pack HITL①–⑥ walk demo — open demo project → sequential advance.
 * Memory-only · no real harness / pause-resume.
 */
import type { ProjectExpertId } from '../types'
import { getProjectExpert } from '../experts'
import { PACK_HITL8 } from './patentHitl8'

export type PackHitlWalkSeat = {
  n: 1 | 2 | 3 | 4 | 5 | 6
  seatId: ProjectExpertId
  label: string
  hitlStepId: string
}

function hitlStepIdFor(seatId: ProjectExpertId): string {
  const def = getProjectExpert(seatId)
  const hitl = def.steps.find((s) => s.triggersHitl)
  return hitl?.id ?? def.steps[def.steps.length - 1]?.id ?? 'strategy'
}

/** Main-chain HITL seats in Pack order (①–⑥). */
export const PACK_HITL_WALK_SEATS: PackHitlWalkSeat[] = PACK_HITL8.filter(
  (g) => g.n <= 6,
).map((g) => ({
  n: g.n as 1 | 2 | 3 | 4 | 5 | 6,
  seatId: g.seatId,
  label: g.label,
  hitlStepId: hitlStepIdFor(g.seatId),
}))

/** Phase HITL⑦⑧ walk targets (runnable, not locked). */
export const PACK_HITL_PHASE_SEATS: {
  n: 7 | 8
  seatId: ProjectExpertId
  label: string
  hitlStepId: string
}[] = PACK_HITL8.filter((g) => g.n >= 7).map((g) => ({
  n: g.n as 7 | 8,
  seatId: g.seatId,
  label: g.label,
  hitlStepId: hitlStepIdFor(g.seatId),
}))

export const PACK_DEMO_PROJECT_ID = 'proj-demo-patent'

export const MAIN_CHAIN_STORY =
  '检索→立项→交底→撰写→…→OA 示意（HITL①–⑥ · validator 失败→自修复→Pass→Confirm）'
