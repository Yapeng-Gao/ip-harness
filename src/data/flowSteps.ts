import type { FlowKey, StageId } from '../types'

/**
 * Workbench Flow 子步骤目录（与各 *Flow.tsx STEPS 同源）。
 * 案级进度写在 AppContext.flowProgressByCase；中台 CaseDetail 只读本目录 + store。
 */
export type { FlowKey }

export interface FlowStepCatalog {
  key: FlowKey
  /** 中台节点树显示名 */
  label: string
  /** 主阶段；layout 为洞察布局辅台，无主 StageId */
  stageId?: StageId
  steps: readonly string[]
  path: string
}

export const FLOW_CATALOG: readonly FlowStepCatalog[] = [
  {
    key: 'research',
    label: '立项前调研',
    stageId: 'pre_research',
    steps: ['检索配置', '结果研判', '可专利性', 'FTO 初评', '结论提交'],
    path: '/workbench/research',
  },
  {
    key: 'intake',
    label: '立项决策',
    stageId: 'decision',
    steps: ['发明披露', '双维评分', '委员投票', 'Go/No-Go'],
    path: '/workbench/intake',
  },
  {
    key: 'layout',
    label: '布局洞察（辅台）',
    steps: ['洞察摘要', '国别建议', '交接'],
    path: '/workbench/layout',
  },
  {
    key: 'draft',
    label: '撰写申请',
    stageId: 'drafting',
    steps: ['交底书', '权利要求树', '申请策略', '生成清单'],
    path: '/workbench/draft',
  },
  {
    key: 'prosecution',
    label: '审查答复',
    stageId: 'prosecution',
    steps: ['OA 登记', '争点策略', '权利要求修改', '答复书'],
    path: '/workbench/prosecution',
  },
  {
    key: 'maintain',
    label: '授权维持',
    stageId: 'maintenance',
    steps: ['权利状态', '年费日程', '变更事项', '审批交接'],
    path: '/workbench/maintain',
  },
  {
    key: 'monetize',
    label: '运用转化',
    stageId: 'commercialization',
    steps: ['选择路径', '条款要点', '里程碑', '审批交接'],
    path: '/workbench/monetize',
  },
  {
    key: 'watch',
    label: '案件监控',
    stageId: 'monitoring',
    steps: ['规则配置', '告警处理', '交接确认'],
    path: '/workbench/watch',
  },
] as const

export const FLOW_BY_KEY: Record<FlowKey, FlowStepCatalog> = Object.fromEntries(
  FLOW_CATALOG.map((f) => [f.key, f]),
) as Record<FlowKey, FlowStepCatalog>

/** 主阶段 → Flow（layout 无主阶段） */
export const FLOW_KEY_BY_STAGE: Partial<Record<StageId, FlowKey>> = {
  pre_research: 'research',
  decision: 'intake',
  drafting: 'draft',
  prosecution: 'prosecution',
  maintenance: 'maintain',
  commercialization: 'monetize',
  monitoring: 'watch',
}

export function stepsForFlow(key: FlowKey): readonly string[] {
  return FLOW_BY_KEY[key].steps
}
