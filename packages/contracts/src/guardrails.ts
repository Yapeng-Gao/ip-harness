/**
 * Guardrail contract types + pure helpers.
 * Executable evaluateGuardrails remains in shared src/domain (keeps persona/data deps).
 */
import type { HandoffAction, HitlGateId } from './keys.js'

export type GuardrailAction = HitlGateId | HandoffAction | 'pay'

export type GuardrailBlocker = {
  code: string
  message: string
}

export type GuardrailEvalResult = {
  ok: boolean
  blockers: GuardrailBlocker[]
}

/** Pure: merge blocker lists (dedupe by code) */
export function mergeBlockers(
  ...lists: GuardrailBlocker[][]
): GuardrailBlocker[] {
  const seen = new Set<string>()
  const out: GuardrailBlocker[] = []
  for (const list of lists) {
    for (const b of list) {
      if (seen.has(b.code)) continue
      seen.add(b.code)
      out.push(b)
    }
  }
  return out
}

export function blockersToResult(blockers: GuardrailBlocker[]): GuardrailEvalResult {
  return { ok: blockers.length === 0, blockers }
}
