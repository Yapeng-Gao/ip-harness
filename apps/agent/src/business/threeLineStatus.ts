/**
 * 三线分名 · 00-用户与系统 §6.1 / 交互大纲原则 3
 * ④全绿 ≠ ⑤过线 ≠ ⑥本轮 D 过线 —— 分开展示、分名词，禁止混成一条「已过」。
 */
import type { CaseProgress } from './BusinessCaseContext'
import type { ProjectExpertId } from '../projects/types'

export type ThreeLineKey = 'd4_green' | 'd5_pass' | 'd6_d_pass'

export type ThreeLineRow = {
  key: ThreeLineKey
  /** 屏上名词 · 勿合并 */
  label: string
  /** 否定句 · 防混线 */
  not: string
  reached: boolean
  detail: string
}

function hasSeat(done: ProjectExpertId[] | undefined, id: ProjectExpertId): boolean {
  return Boolean(done?.includes(id))
}

/**
 * 从同源进度推导三线（演示密度：席位 done + filed/oaRound）。
 * 不假装真质检引擎；缺席 = 未到。
 */
export function threeLineStatus(
  prog: Pick<CaseProgress, 'doneSeatIds' | 'filed' | 'oaRound' | 'completedStages'>,
): ThreeLineRow[] {
  const d4 = hasSeat(prog.doneSeatIds, 'expert-disclosure')
  // ⑤过线：申请席完成或已递交标记（filed）—— 演示级，非真 A–J 质检
  const d5Pass = hasSeat(prog.doneSeatIds, 'expert-draft') || Boolean(prog.filed)
  // ⑥ D 过线：答复席完成；仅 filed/oaRound 只说明进入⑥，≠ D 过线
  const d6Pass = hasSeat(prog.doneSeatIds, 'expert-oa')
  const inOa = Boolean(prog.filed) || (prog.oaRound ?? 0) > 0

  return [
    {
      key: 'd4_green',
      label: '④全绿',
      not: '≠ ⑤过线 · ≠ 已递交',
      reached: d4,
      detail: d4 ? '交底质检全绿（席位已确认）' : '交底质检 · 未全绿',
    },
    {
      key: 'd5_pass',
      label: '⑤过线',
      not: '≠ ④全绿 · ≠ 确认递交',
      reached: d5Pass,
      detail: d5Pass
        ? '申请文件可递交（过线）'
        : d4
          ? '申请尚未过线'
          : '未到 · 须先④全绿或工单',
    },
    {
      key: 'd6_d_pass',
      label: '⑥本轮 D 过线',
      not: '≠ ⑤过线 · ≠ 授权结果',
      reached: d6Pass,
      detail: d6Pass
        ? '本轮答复可递交（D 过线）'
        : inOa
          ? '已入答复阶段 · 本轮 D 未过线'
          : '未到',
    },
  ]
}

/** 大厅/公司「进行中工单」一句 */
export function inProgressTicketLine(
  prog: Pick<CaseProgress, 'doneSeatIds' | 'filed' | 'oaRound' | 'completedStages'>,
): string | null {
  const lines = threeLineStatus(prog)
  const d4 = lines.find((l) => l.key === 'd4_green')!
  const d5 = lines.find((l) => l.key === 'd5_pass')!
  const d6 = lines.find((l) => l.key === 'd6_d_pass')!
  if (d4.reached && !d5.reached) return '④→⑤ 工单可开 / 申请尚未过线'
  if (d5.reached && !d6.reached && !prog.filed && (prog.oaRound ?? 0) === 0) {
    return '⑤过线后待确认递交（演示）'
  }
  if ((prog.filed || (prog.oaRound ?? 0) > 0) && !d6.reached) {
    return '⑥ 本轮答复进行中 · D 未过线'
  }
  if (d4.reached && d5.reached && d6.reached) return null
  if (!d4.reached) return '主链作业进行中 · ④尚未全绿'
  return '主链进行中'
}
