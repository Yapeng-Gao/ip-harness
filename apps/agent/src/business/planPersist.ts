/**
 * 委托计划 ↔ progress 状态机（样机 LS；非官报）
 */
import type { CaseDelegateDispatch, CaseProgress } from './BusinessCaseContext'

export function dispatchFromProgress(
  prog: Pick<CaseProgress, 'delegate' | 'casePlan'>,
): CaseDelegateDispatch | null {
  return prog.delegate ?? null
}

/** 缺口卡「下一步」是否已反映计划 */
export function gapNextReflectsPlan(
  nextStep: string,
  prog: Pick<CaseProgress, 'delegate' | 'casePlan'>,
): boolean {
  if (prog.delegate?.stepLabel && nextStep.includes(prog.delegate.stepLabel)) {
    return true
  }
  if (prog.casePlan && nextStep.includes('（计划）')) return true
  return false
}
