/**
 * 登录前宣传站货架数据 · vision §3.3 A / product-pages §4.0p
 * 只认知，不可点进作业 / 交卷 / 采纳。
 * **未**挂到登录后 `/agent`（薄入口 §3.3 B / §4.0a 禁货架）；供官网复用。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { MAIN_CHAIN_DEPT_IDS, MAIN_CHAIN_DEPTS } from '../departments/orgDepts'

/** 品类大标题（一句大字；禁堆理念句） */
export const HOME_CATEGORY_TITLE = '外挂知识产权部'
/** 可选短副（品类，非口号堆） */
export const HOME_CATEGORY_SUB = '办专利全流程'

/** E · 示范案（假数据，非真作业） */
export const HOME_DEMO_CASE = {
  title: '边缘散热结构',
  currentDeptId: 'dept-research' as OrgDeptId,
  currentDeptLabel: '查新部',
  progressLine: '查新部交卷中 · 可专利性报告待确认',
} as const

const SHORT_LABEL: Record<string, string> = {
  'dept-disclosure': '交底',
  'dept-research': '查新',
  'dept-intake': '立项',
  'dept-draft': '撰写',
  'dept-figure': '附图',
  'dept-filing': '递交',
  'dept-oa': '答复',
}

const DELIVERABLE: Record<string, string> = {
  'dept-disclosure': '技术交底书',
  'dept-research': '可专利性报告',
  'dept-intake': '决策书',
  'dept-draft': '申请文件稿',
  'dept-figure': '附图包',
  'dept-filing': '申请包',
  'dept-oa': '答复包',
}

/**
 * 七部徽章墙站：站名全展示；专家岗 ≤3 默认露出（数据来自编制 peers）
 */
export const HOME_CHAIN_STATIONS: ReadonlyArray<{
  deptId: OrgDeptId
  shortLabel: string
  deliverable: string
  /** 示意专家岗名，≤3；UI 默认露出（含首字头像），只展示不作业 */
  experts: readonly string[]
}> = MAIN_CHAIN_DEPT_IDS.map((id) => {
  const dept = MAIN_CHAIN_DEPTS.find((d) => d.id === id)
  const peers = (dept?.peers ?? []).slice(0, 3).map((p) => p.label)
  return {
    deptId: id,
    shortLabel: SHORT_LABEL[id] ?? id,
    deliverable: DELIVERABLE[id] ?? '',
    experts: peers,
  }
})

/** 与 MAIN_CHAIN_DEPT_IDS 顺序对齐（硬闸） */
export function assertHomeChainAligned(): boolean {
  return (
    HOME_CHAIN_STATIONS.length === MAIN_CHAIN_DEPT_IDS.length &&
    HOME_CHAIN_STATIONS.every((s, i) => s.deptId === MAIN_CHAIN_DEPT_IDS[i])
  )
}

/** 每部专家岗数量硬闸：1–3 */
export function assertHomeExpertsBounded(): boolean {
  return HOME_CHAIN_STATIONS.every(
    (s) => s.experts.length >= 1 && s.experts.length <= 3,
  )
}

/** D · 交卷物样例卡（只展示不编辑） */
export const HOME_SAMPLE_DELIVERABLES = [
  { name: '技术交底书', status: '已交卷' },
  { name: '可专利性报告', status: '待确认' },
  { name: '申请文件稿', status: '示意' },
] as const

/** ④ 场景卡（白话；不可当作业入口） */
export const HOME_SCENARIOS = [
  {
    id: 'agency-multi',
    title: '代理办多案',
    body: '案盘上看各案卡在哪、谁待确认，再进本案。',
  },
  {
    id: 'enterprise-chain',
    title: '企业走七部',
    body: '进公司首页看 IP 部，按部门交卷往下走。',
  },
  {
    id: 'confirm-gate',
    title: '确认拍板',
    body: '关键关交卷后待你确认；产品不替你签字。',
  },
] as const
