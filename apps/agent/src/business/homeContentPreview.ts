/**
 * 产品首页内容预览示意 · product-pages §4.0a 教育块 E/C/D（只认知，不可点进作业）
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { MAIN_CHAIN_DEPT_IDS } from '../departments/orgDepts'

/** E · 示范案（假数据，非真作业） */
export const HOME_DEMO_CASE = {
  title: '边缘散热结构',
  currentDeptId: 'dept-research' as OrgDeptId,
  currentDeptLabel: '查新部',
  progressLine: '查新部交卷中 · 可专利性报告待确认',
} as const

/** 七部站短名 + 典型交卷名（C · 主链缩略旁注） */
export const HOME_CHAIN_STATIONS: ReadonlyArray<{
  deptId: OrgDeptId
  shortLabel: string
  deliverable: string
}> = [
  { deptId: 'dept-disclosure', shortLabel: '交底', deliverable: '技术交底书' },
  { deptId: 'dept-research', shortLabel: '查新', deliverable: '可专利性报告' },
  { deptId: 'dept-intake', shortLabel: '立项', deliverable: '决策书' },
  { deptId: 'dept-draft', shortLabel: '撰写', deliverable: '申请文件稿' },
  { deptId: 'dept-figure', shortLabel: '附图', deliverable: '附图包' },
  { deptId: 'dept-filing', shortLabel: '递交', deliverable: '申请包' },
  { deptId: 'dept-oa', shortLabel: '答复', deliverable: '答复包' },
]

/** 与 MAIN_CHAIN_DEPT_IDS 顺序对齐（硬闸） */
export function assertHomeChainAligned(): boolean {
  return (
    HOME_CHAIN_STATIONS.length === MAIN_CHAIN_DEPT_IDS.length &&
    HOME_CHAIN_STATIONS.every((s, i) => s.deptId === MAIN_CHAIN_DEPT_IDS[i])
  )
}

/** D · 交卷物样例卡（只展示不编辑） */
export const HOME_SAMPLE_DELIVERABLES = [
  { name: '技术交底书', status: '已交卷' },
  { name: '可专利性报告', status: '待确认' },
  { name: '申请文件稿', status: '示意' },
] as const

/** A · 辅文（面积小于 E/C/D） */
export const HOME_VALUE_LINE =
  '帮企业研发和专利代理，把技术做成可递交的专利：按部门交卷往下走，关键关你确认（产品不替你签字）。'

export const HOME_HIGHLIGHTS = [
  { title: '全流程一起办', body: '从交底到递交、答复，不是只给交底模板或查新插件。' },
  { title: '按部门交卷', body: '像公司里办事，卡在哪一站看得见。' },
  { title: '关键步骤你点头', body: '待你确认后再往下；无人确认不能装成已递交。' },
] as const

/** B · 路径微图 hops */
export const HOME_PATH_HOPS = [
  '开案子 / 案盘',
  '公司首页',
  '部门交卷',
  '待你确认',
] as const
