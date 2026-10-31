/**
 * T8 Agent 风格 · 一期薄项（交互大纲 §9）
 * 编制头像旁挂风格句；不阻塞主链。
 */
import type { OrgDeptId } from '../departments/orgDepts'

export type AgentStyleTag = {
  id: string
  label: string
  /** 一句风格 */
  line: string
}

const BY_DEPT: Partial<Record<OrgDeptId, AgentStyleTag>> = {
  'dept-intake': {
    id: 'style-intake',
    label: '稳妥建项',
    line: '先对齐方向一句话，再问要不要立；不堆论证。',
  },
  'dept-inspire': {
    id: 'style-inspire',
    label: '路径对比',
    line: '给 2～3 条可选路径+推荐理由，不替你选题。',
  },
  'dept-mining': {
    id: 'style-mining',
    label: '点包克制',
    line: '创新点可交④为准；不承诺可授权。',
  },
  'dept-disclosure': {
    id: 'style-disclosure',
    label: '事实优先',
    line: '先钉技术事实与缺料，再谈全绿；禁空转。',
  },
  'dept-draft': {
    id: 'style-draft',
    label: '权项克制',
    line: '申不申分清；过线≠递交；术语全篇统一。',
  },
  'dept-filing': {
    id: 'style-filing',
    label: '齐套递交',
    line: '回执入⑦；不装官报已通。',
  },
  'dept-oa': {
    id: 'style-oa',
    label: '争点对照',
    line: '陈述与对照分栏；A/B 不混步；期限明示。',
  },
  'dept-annuity': {
    id: 'style-annuity',
    label: '明白账',
    line: '官费/代理费分列；提醒≠邮件已发。',
  },
  'dept-monetize': {
    id: 'style-monetize',
    label: '五块复盘',
    line: '只读不拍不回写台账；复盘≠情报官专报。',
  },
}

export function styleTagForDept(deptId: OrgDeptId): AgentStyleTag {
  return (
    BY_DEPT[deptId] || {
      id: 'style-default',
      label: '克制汇报',
      line: '一句结论 + 选项；依据折进展开。',
    }
  )
}

/** 岗名纠偏：旧「撰写专家」→ 申请专家（跟八部） */
export function normalizePeerJobTitle(raw: string): string {
  return raw
    .replace(/撰写专家/g, '申请专家')
    .replace(/交底撰写/g, '交底专家')
}
