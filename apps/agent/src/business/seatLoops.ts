/**
 * 席内 loop 动作（内循环自修复 / OA N 通 / HITL 驳回）
 * 对齐 patent-pack-design §5 · 与跨席 feedback 同级：芯片 + 口令可点可聊
 */
import type { ProjectExpertId } from '../projects/types'

/** 与 BusinessCaseContext.LoopDemoKey 对齐的子集 */
export type SeatLoopDemoKey =
  | 'disclosure_ask'
  | 'research_heal'
  | 'draft_heal'
  | 'draft_escalate'
  | 'oa_inventive'
  | 'oa_clarity'
  | 'oa_round2'
  | 'oa_blocker'
  | 'oa_strategy_reject'

export type SeatLoopActionId =
  | 'ask'
  | 'heal'
  | 'heal_escalate'
  | 'oa_inventive'
  | 'oa_clarity'
  | 'oa_round'
  | 'oa_blocker'
  | 'hitl_reject'

export type SeatLoopAction = {
  id: SeatLoopActionId
  chip: string
  match: RegExp
  demo?: SeatLoopDemoKey
  needsPending?: boolean
  needsFiled?: boolean
}

const DISCLOSURE: SeatLoopAction[] = [
  {
    id: 'ask',
    chip: '缺项追问一轮',
    match: /追问|缺项|六段|采集/,
    demo: 'disclosure_ask',
  },
  {
    id: 'hitl_reject',
    chip: '驳回带批注重跑',
    match: /驳回|退回修改|带批注/,
    needsPending: true,
  },
]

const RESEARCH: SeatLoopAction[] = [
  {
    id: 'heal',
    chip: '覆盖度自修复',
    match: /自修复|覆盖度|重试|再查/,
    demo: 'research_heal',
  },
  {
    id: 'heal_escalate',
    chip: '自修复升级接手',
    match: /升级|兜底|人工接手|超.?3/,
  },
  {
    id: 'hitl_reject',
    chip: '驳回带批注重跑',
    match: /驳回|退回修改|带批注/,
    needsPending: true,
  },
]

const DRAFT: SeatLoopAction[] = [
  {
    id: 'heal',
    chip: '四类校验自修复',
    match: /自修复|四类|校验|重试/,
    demo: 'draft_heal',
  },
  {
    id: 'heal_escalate',
    chip: '校验升级接手',
    match: /升级|兜底|人工接手|超.?3/,
    demo: 'draft_escalate',
  },
  {
    id: 'hitl_reject',
    chip: '驳回带批注重跑',
    match: /驳回|退回修改|带批注/,
    needsPending: true,
  },
]

const INTAKE: SeatLoopAction[] = [
  {
    id: 'hitl_reject',
    chip: '驳回带批注重跑',
    match: /驳回|退回修改|带批注|低分/,
    needsPending: true,
  },
]

const FILING: SeatLoopAction[] = [
  {
    id: 'hitl_reject',
    chip: '驳回带批注重跑',
    match: /驳回|退回修改|带批注/,
    needsPending: true,
  },
]

const OA: SeatLoopAction[] = [
  {
    id: 'oa_inventive',
    chip: '创造性·补检索',
    match: /创造性|补检索|补充检索/,
    demo: 'oa_inventive',
    needsFiled: true,
  },
  {
    id: 'oa_clarity',
    chip: '清楚性·修术语',
    match: /清楚|修术语|清楚性/,
    demo: 'oa_clarity',
    needsFiled: true,
  },
  {
    id: 'oa_round',
    chip: '下一通到达',
    match: /下一通|第.?通|N通|新通知书/,
    demo: 'oa_round2',
    needsFiled: true,
  },
  {
    id: 'oa_blocker',
    chip: '超范围红线',
    match: /超范围|blocker|红线/,
    demo: 'oa_blocker',
    needsFiled: true,
  },
  {
    id: 'hitl_reject',
    chip: '策略驳回重做',
    match: /驳回|退回|策略不对/,
    needsPending: true,
  },
]

const LAYOUT: SeatLoopAction[] = [
  {
    id: 'hitl_reject',
    chip: '驳回带批注重跑',
    match: /驳回|退回|调整布局/,
    needsPending: true,
  },
]

const BY_SEAT: Partial<Record<ProjectExpertId, SeatLoopAction[]>> = {
  'expert-disclosure': DISCLOSURE,
  'expert-research': RESEARCH,
  'expert-draft': DRAFT,
  'expert-intake': INTAKE,
  'expert-filing': FILING,
  'expert-oa': OA,
  'expert-layout': LAYOUT,
}

export function loopActionsForSeat(
  seatId: ProjectExpertId,
  opts?: { hasPending?: boolean; filed?: boolean },
): SeatLoopAction[] {
  const all = BY_SEAT[seatId] ?? []
  return all.filter((a) => {
    if (a.needsPending && !opts?.hasPending) return false
    if (a.needsFiled && !opts?.filed) return false
    return true
  })
}

export function parseSeatLoopIntent(
  text: string,
  seatId: ProjectExpertId,
  opts?: { hasPending?: boolean; filed?: boolean },
): SeatLoopAction | null {
  const t = text.trim()
  if (!t) return null
  if (/回到|回退到?|从\s*第\s*\d+\s*步/.test(t)) return null
  // 跨席 feedback 口令不抢（含「请交底」等）
  if (
    /请(交底|查新|撰写|附图|布局)|feedback|反馈信封|漏洞回流|不乐观|低分·/.test(
      t,
    )
  ) {
    return null
  }

  const actions = loopActionsForSeat(seatId, opts)
  if (actions.length === 0) return null

  const hasIntent =
    /追问|缺项|自修复|覆盖度|四类|校验|重试|升级|兜底|人工接手|创造性|清楚|下一通|第.?通|超范围|驳回|退回|带批注|策略/.test(
      t,
    )
  if (!hasIntent) return null

  const hit = actions
    .map((a) => {
      const m = t.match(a.match)
      return m ? { a, score: m[0]!.length } : null
    })
    .filter(Boolean)
    .sort((x, y) => y!.score - x!.score)[0]

  return hit?.a ?? null
}

/** 解析 demo key（research escalate 用 research 专用脚本，见 runner） */
export function resolveLoopDemo(
  seatId: ProjectExpertId,
  action: SeatLoopAction,
): SeatLoopDemoKey | 'research_escalate' | null {
  if (action.id === 'hitl_reject') return null
  if (action.id === 'heal_escalate' && seatId === 'expert-research') {
    return 'research_escalate'
  }
  return action.demo ?? null
}

export function seatLoopChatScript(
  seatId: ProjectExpertId,
  actionId: SeatLoopActionId,
  extra?: string,
): { lines: string[]; delayMs: number[] } {
  switch (actionId) {
    case 'ask':
      return {
        lines: [
          '【交底】缺项追问第 1 轮：实施例还缺可复现步骤与效果数据（样机）。',
          '【交底】缺项追问第 2 轮：六段已齐 · 待你确认交底。',
        ],
        delayMs: [0, 500],
      }
    case 'heal':
      return {
        lines: [
          seatId === 'expert-research'
            ? '【查新】覆盖度检查未过 · 自修复 1/3（样机）。'
            : '【撰写】四类校验未过 · 自修复 1/3（样机）。',
          seatId === 'expert-research'
            ? '【查新】覆盖度已通过（重试 2/3）· 可继续交卷。'
            : '【撰写】四类校验已通过（重试 2/3）· 可继续交卷。',
        ],
        delayMs: [0, 600],
      }
    case 'heal_escalate':
      return {
        lines: [
          '检查连续未过 · 已达上限。',
          '【需人工接手】已升级兜底台（禁静默死循环）。',
        ],
        delayMs: [0, 500],
      }
    case 'oa_inventive':
      return {
        lines: [
          '【审查答复】理由分类：创造性 · 已派查新做补充检索子任务（样机）。',
          '补充检索回执已汇入 · 可起草策略待你确认。',
        ],
        delayMs: [0, 550],
      }
    case 'oa_clarity':
      return {
        lines: [
          '【审查答复】理由分类：清楚性 · 已请撰写修术语（样机）。',
          '术语修订回执已汇入 · 可起草策略待你确认。',
        ],
        delayMs: [0, 550],
      }
    case 'oa_round':
      return {
        lines: [
          '【审查答复】新通知书到达 · 进入下一通外循环（样机）。',
          '进度已记 N 通 · 请重新拆解理由并出策略。',
        ],
        delayMs: [0, 500],
      }
    case 'oa_blocker':
      return {
        lines: [
          '【审查答复】检测到超范围修改意图。',
          '【红线】0 次自修复 · 需人工接手（禁自动改超范围）。',
        ],
        delayMs: [0, 400],
      }
    case 'hitl_reject':
      return {
        lines: [
          `已按意见驳回带批注重跑（样机）· ${extra?.trim() || '请按意见修改'}。`,
          '该项回到待确认 · 本席可改完再交卷。',
        ],
        delayMs: [0, 400],
      }
    default:
      return { lines: ['已执行环边动作（样机）'], delayMs: [0] }
  }
}
