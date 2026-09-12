import type { FulfillmentMode, StageId, StageRaci } from '../types'

/**
 * 默认委托模式下的 RACI（企业 vs 代理）
 * R=负责执行 A=问责拍板 C=咨询 I=知会
 */
export const STAGE_RACI_DELEGATED: StageRaci[] = [
  {
    stage: 'pre_research',
    enterprise: { R: false, A: true, C: true, I: true },
    agency: { R: true, A: false, C: true, I: true },
    note: '代理执行检索；企业拍板可专利性结论',
  },
  {
    stage: 'decision',
    enterprise: { R: true, A: true, C: true, I: true },
    agency: { R: false, A: false, C: true, I: true },
    note: '企业主导 Go/No-Go；代理提供接案报价',
  },
  {
    stage: 'drafting',
    enterprise: { R: false, A: true, C: true, I: true },
    agency: { R: true, A: false, C: true, I: true },
    note: '代理撰写；企业确认布局与国别策略',
  },
  {
    stage: 'prosecution',
    enterprise: { R: false, A: true, C: true, I: true },
    agency: { R: true, A: false, C: true, I: true },
    note: '代理答复 OA；企业确认争点策略',
  },
  {
    stage: 'maintenance',
    enterprise: { R: false, A: true, C: false, I: true },
    agency: { R: true, A: false, C: true, I: true },
    note: '代理办理年费与登记；企业知会',
  },
  {
    stage: 'commercialization',
    enterprise: { R: true, A: true, C: true, I: true },
    agency: { R: false, A: false, C: true, I: true },
    note: '企业主导转化；代理协助条款与备案',
  },
  {
    stage: 'monitoring',
    enterprise: { R: false, A: true, C: true, I: true },
    agency: { R: true, A: false, C: true, I: true },
    note: '代理监测告警；企业决策是否维权',
  },
]

/** 自助模式下：企业承担 R，代理行灰显未委托 */
export function getRaciForStage(
  stage: StageId,
  mode: FulfillmentMode,
): StageRaci & { agencyDisabled: boolean } {
  const base = STAGE_RACI_DELEGATED.find((r) => r.stage === stage)!
  if (mode === 'self_serve') {
    return {
      ...base,
      enterprise: { R: true, A: true, C: true, I: true },
      agency: { R: false, A: false, C: false, I: false },
      note: '企业自助办理：企业为执行与问责主体；代理未委托',
      agencyDisabled: true,
    }
  }
  return { ...base, agencyDisabled: false }
}
