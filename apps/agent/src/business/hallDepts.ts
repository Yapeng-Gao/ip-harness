/**
 * 大厅八部门名牌 · 对齐 01-接待与引导 / 交互大纲
 * slug 落到现有 orgDepts；标签用真源①～⑧名（与旧「上手七部」叙事区分）。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { deptSlug } from '../departments/orgDepts'

export type HallDeptDoor = {
  num: string
  label: string
  deptId: OrgDeptId
  slug: string
  thin: boolean
  desc: string
}

export const HALL_DEPT_DOORS: HallDeptDoor[] = [
  {
    num: '①',
    label: '立项部',
    deptId: 'dept-intake',
    slug: deptSlug('dept-intake'),
    thin: true,
    desc: '要不要立这个方向',
  },
  {
    num: '②',
    label: '创新激发部',
    deptId: 'dept-inspire',
    slug: deptSlug('dept-inspire'),
    thin: true,
    desc: '问题卡点 → 路径 → 方案',
  },
  {
    num: '③',
    label: '专利挖掘部',
    deptId: 'dept-mining',
    slug: deptSlug('dept-mining'),
    thin: true,
    desc: '研发资料 → 创新点 + 拆案',
  },
  {
    num: '④',
    label: '交底部',
    deptId: 'dept-disclosure',
    slug: deptSlug('dept-disclosure'),
    thin: false,
    desc: '技术事实 → 交底书全绿',
  },
  {
    num: '⑤',
    label: '申请部',
    deptId: 'dept-draft',
    slug: deptSlug('dept-draft'),
    thin: false,
    desc: '合格交底 → 申请文件 → 递交',
  },
  {
    num: '⑥',
    label: '答复部',
    deptId: 'dept-oa',
    slug: deptSlug('dept-oa'),
    thin: false,
    desc: '通知书 → 策略 → 答复',
  },
  {
    num: '⑦',
    label: '维护部',
    deptId: 'dept-annuity',
    slug: deptSlug('dept-annuity'),
    thin: true,
    desc: '确权后期限 · 年费 · 台账',
  },
  {
    num: '⑧',
    label: '复盘部',
    deptId: 'dept-monetize',
    slug: deptSlug('dept-monetize'),
    thin: true,
    desc: '年末/阶段复盘报告',
  },
]

export function hallDeptHref(caseId: string | undefined, door: HallDeptDoor): string {
  if (!caseId) return '/agent/cases/new'
  return `/agent/cases/${caseId}/depts/${door.slug}`
}
