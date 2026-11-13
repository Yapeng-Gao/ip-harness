/**
 * 本案计划驱动开案落点 · 摸底 → 计划骨架（样机脚本）
 */
import type { ProjectExpertId } from '../projects/types'
import {
  BUSINESS_STAGES,
  businessSeatLabel,
  type BusinessStageId,
} from './businessSeats'

export type CasePlanStart = {
  stageId: BusinessStageId
  seatId: ProjectExpertId
  nextStepLabel: string
}

export type CaseIntakeAnswers = {
  /** 要保护什么 */
  protectWhat: string
  /** 材料齐不齐 */
  materialsReady: '齐' | '缺' | '不清'
  /** 急不急 */
  urgency: '急' | '不急' | '一般'
}

const STAGE_IDS: BusinessStageId[] = [
  'prepare',
  'intake',
  'drafting',
  'filing',
  'oa',
]

const DEPT_HINTS: Array<{
  re: RegExp
  seatId: ProjectExpertId
  stageId: BusinessStageId
}> = [
  { re: /查新/, seatId: 'expert-research', stageId: 'intake' },
  { re: /立项/, seatId: 'expert-intake', stageId: 'intake' },
  { re: /交底/, seatId: 'expert-disclosure', stageId: 'drafting' },
  { re: /申请|撰写|权要|说明书/, seatId: 'expert-draft', stageId: 'drafting' },
  { re: /附图/, seatId: 'expert-figure', stageId: 'drafting' },
  { re: /递交/, seatId: 'expert-filing', stageId: 'filing' },
  { re: /审查答复|OA|答复/, seatId: 'expert-oa', stageId: 'oa' },
  { re: /准备|前研|布局/, seatId: 'expert-research', stageId: 'prepare' },
]

function isStageId(s: string): s is BusinessStageId {
  return (STAGE_IDS as string[]).includes(s)
}

function isExpertId(s: string): s is ProjectExpertId {
  return /^expert-[\w-]+$/.test(s)
}

function fallbackStart(input: {
  skipPrepare?: boolean
  routeId?: BusinessStageId | null
}): CasePlanStart {
  if (input.skipPrepare === false || input.routeId === 'prepare') {
    return {
      stageId: 'prepare',
      seatId: 'expert-research',
      nextStepLabel: '先弄清方向（准备）',
    }
  }
  const route: BusinessStageId = input.routeId ?? 'intake'
  // 八部真源：intake 路由落①立项席，不以查新辅席抢默认
  if (route === 'intake') {
    return {
      stageId: 'intake',
      seatId: 'expert-intake',
      nextStepLabel: '去立项部开干',
    }
  }
  const stage = BUSINESS_STAGES.find((s) => s.id === route)
  const seatId = stage?.seatIds[0] ?? 'expert-research'
  const seat = businessSeatLabel(seatId)
  return {
    stageId: route,
    seatId,
    nextStepLabel: `去${seat}开干`,
  }
}

/**
 * 从 casePlan 文案解析起点阶段/席与「下一步」；无计划则回退 skipPrepare + routeId
 */
export function resolveCasePlanStart(input: {
  casePlan?: string
  skipPrepare?: boolean
  routeId?: BusinessStageId | null
}): CasePlanStart {
  const plan = (input.casePlan ?? '').trim()
  if (!plan) return fallbackStart(input)

  const seatM = plan.match(/起点席[：:]\s*(expert-[\w-]+)/)
  const stageM = plan.match(/阶段[：:]\s*(\w+)/)
  const nextM = plan.match(/下一步[：:]\s*(.+)/)

  let seatId: ProjectExpertId | undefined
  let stageId: BusinessStageId | undefined

  if (seatM?.[1] && isExpertId(seatM[1])) seatId = seatM[1]
  if (stageM?.[1] && isStageId(stageM[1])) stageId = stageM[1]

  if (!seatId || !stageId) {
    const startLine =
      plan.match(/起点节点[：:]\s*(.+)/)?.[1] ??
      plan.match(/起点部门[：:]\s*(.+)/)?.[1] ??
      plan.match(/办理起点[：:]\s*(.+)/)?.[1] ??
      plan
    for (const h of DEPT_HINTS) {
      if (h.re.test(startLine)) {
        seatId = seatId ?? h.seatId
        stageId = stageId ?? h.stageId
        break
      }
    }
  }

  const fb = fallbackStart(input)
  const resolvedSeat = seatId ?? fb.seatId
  const resolvedStage = stageId ?? fb.stageId
  const seatLabel = businessSeatLabel(resolvedSeat)
  const nextStepLabel =
    nextM?.[1]?.trim() || `按计划去${seatLabel.replace(/部$/, '')}开干`

  return {
    stageId: resolvedStage,
    seatId: resolvedSeat,
    nextStepLabel,
  }
}

/**
 * 摸底答完 → 本案计划骨架（含可解析标记）
 */
export function buildCasePlanFromIntake(input: {
  title: string
  summary?: string
  answers: CaseIntakeAnswers
  skipPrepare: boolean
  routeId: BusinessStageId | null
}): string {
  const name = input.title.trim() || '未命名案子'
  const a = input.answers
  const protect = a.protectWhat.trim() || input.summary?.trim() || '（待补充）'

  let stageId: BusinessStageId
  let seatId: ProjectExpertId
  let startBlurb: string

  if (!input.skipPrepare || input.routeId === 'prepare') {
    stageId = 'prepare'
    seatId = 'expert-intake'
    startBlurb = '先立项，交底写完再查新'
  } else if (a.materialsReady === '缺' && input.routeId === 'drafting') {
    stageId = 'drafting'
    seatId = 'expert-disclosure'
    startBlurb = '材料尚缺 → 从交底补齐再撰写'
  } else if (a.materialsReady === '缺' && (input.routeId === 'intake' || !input.routeId)) {
    stageId = 'intake'
    seatId = 'expert-intake'
    startBlurb = '已跳过准备；材料偏缺 → 先立项，交底补齐后再查新'
  } else {
    const start = fallbackStart({
      skipPrepare: input.skipPrepare,
      routeId: input.routeId,
    })
    stageId = start.stageId
    seatId = start.seatId
    startBlurb =
      input.skipPrepare
        ? '已跳过准备，从立项起办；交底后再查新'
        : '先立项，交底写完再查新'
  }

  const routeTitle =
    BUSINESS_STAGES.find((s) => s.id === (input.routeId ?? stageId))?.title ??
    '立项'
  const seatLabel = businessSeatLabel(seatId)
  const urgencyHint =
    a.urgency === '急'
      ? '优先完成本节点交卷，少开跨节点讨论'
      : a.urgency === '不急'
        ? '可先把材料与目标写清再加速'
        : '按主链节奏推进'

  const nodeWord = seatLabel.replace(/部$/, '')
  const nextStep = `去${nodeWord}开干 · ${urgencyHint}`

  return [
    `案子：${name}`,
    `目标：保护「${protect}」`,
    `客户事实：保护=${protect}；材料=${a.materialsReady}；缓急=${a.urgency}`,
    `办理起点：${startBlurb}（路线偏好：${routeTitle}）`,
    `起点节点：${nodeWord}`,
    `起点席：${seatId}`,
    `阶段：${stageId}`,
    `下一步：${nextStep}`,
  ].join('\n')
}

/** 改写时保留的客户事实段落（案子/目标/客户事实/保护/材料/缓急/摸底） */
export function extractCasePlanFactBlock(plan: string): string {
  const lines = plan.split(/\r?\n/)
  const keep = lines.filter((line) => {
    const t = line.trim()
    return /^(案子|目标|客户事实|保护|材料|缓急|摸底)[：:]/.test(t)
  })
  return keep.join('\n').trim()
}
