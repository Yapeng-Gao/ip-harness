/**
 * 欢迎页货架叙事权威 · Leslie 批 A
 * 对齐 docs/superpowers/specs/2026-10-23-welcome-thin-home-dual-role.md §3
 * 与 docs/prototype/main-path/welcome.html
 *
 * 只供登录前 `/agent/welcome`；**禁止**挂入登录后 `/agent`（HomePage）。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { MAIN_CHAIN_DEPT_IDS, MAIN_CHAIN_DEPTS } from '../departments/orgDepts'

/** Hero 大标题 */
export const HOME_CATEGORY_TITLE = 'Novada Team'

/** 定位句（含「要干活，先登录。」） */
export const HOME_POSITIONING =
  'Novada Team · 专家向你汇报。把办专利全流程拆成八个部门；关键结论请示你拍。要干活，先登录。'

/** @deprecated 兼容旧名；内容即定位句短品类，勿当口号堆 */
export const HOME_CATEGORY_SUB = '办专利全流程'

/** 主 CTA */
export const HOME_CTA_PRIMARY = '登录干活'
/** 次 CTA（锚 #shelf） */
export const HOME_CTA_SECONDARY = '先看八部货架'

/** 页脚 */
export const HOME_FOOTER = 'Novada Team · 宣传站 · 未登录可达 · 无交卷 / 齐套 / 拍板'

/** E · 示范案（高亮墙用；假数据，非真作业） */
export const HOME_DEMO_CASE = {
  title: '边缘散热结构',
  currentDeptId: 'dept-disclosure' as OrgDeptId,
  currentDeptLabel: '交底部',
  progressLine: '交底部示意 · 交底包待齐套',
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

/** §3.3 七部职责一句（徽章副文 · 不是交卷物名） */
const DUTY: Record<string, string> = {
  'dept-disclosure': '交底 · 事实核对',
  'dept-research': '检索 · 结论稿',
  'dept-intake': '申不申 · 报价',
  'dept-draft': '权项 · 说明书',
  'dept-figure': '图面 · 标注',
  'dept-filing': '包齐 · 递交',
  'dept-oa': '审查意见',
}

export type HomeChainStation = {
  deptId: OrgDeptId
  shortLabel: string
  /** 职责一句（徽章副文） */
  duty: string
  /** 壳侧槽位别名；内容 = duty */
  dutyLine: string
  /**
   * 兼容旧字段名：内容 = 职责一句（不再是交卷物名）
   * @deprecated 新代码请用 duty
   */
  deliverable: string
  /** 示意专家岗名，≤3；UI 默认露出（ExpertAvatar 照片风），只展示不作业 */
  experts: readonly string[]
}

/**
 * 七部徽章墙站：部名 + 职责一句 + ≤3 专家（编制 peers）
 */
export const HOME_CHAIN_STATIONS: ReadonlyArray<HomeChainStation> =
  MAIN_CHAIN_DEPT_IDS.map((id) => {
    const dept = MAIN_CHAIN_DEPTS.find((d) => d.id === id)
    const peers = (dept?.peers ?? []).slice(0, 3).map((p) => p.label)
    const duty = DUTY[id] ?? ''
    return {
      deptId: id,
      shortLabel: SHORT_LABEL[id] ?? id,
      duty,
      dutyLine: duty,
      deliverable: duty,
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

/** 每部职责一句非空硬闸 */
export function assertHomeDutiesPresent(): boolean {
  return HOME_CHAIN_STATIONS.every((s) => s.duty.trim().length > 0)
}

/** ④ 场景卡（对齐原型；不可当作业入口） */
export const HOME_SCENARIOS = [
  {
    id: 'agency-multi',
    title: '代理办多案',
    body: '案盘看卡住哪、谁待确认；点进某案的公司首页，再下部门台。',
  },
  {
    id: 'enterprise-chain',
    title: '企业走七部',
    body: '一案一公司。七部卡片总览，点部开抽屉，去当前部门干活。',
  },
  {
    id: 'confirm-gate',
    title: '确认拍板',
    body: '交卷齐套后进人拍板。专家建议稿不是签字；过才移交，驳回回流补齐。',
  },
] as const

/** 交卷橱窗文案（只展示；无交卷按钮） */
export const HOME_SHOWCASE = {
  sectionLabel: '交卷橱窗（示意）',
  title: '交底包长什么样',
  body: '技术交底正文、附图说明、权属、发明人——齐套才能交卷。本站只展示，不提供交卷按钮。',
  fakeDocLines: ['1. 技术领域 …', '2. 背景与问题 …', '3. 技术方案概要 …'] as const,
  footnote: '登录后在部门台打开全文',
  pendingLabel: '待你确认样例',
} as const

/** 交卷物样例卡（灰态状态展示；保留「待确认」） */
export const HOME_SAMPLE_DELIVERABLES = [
  { name: '技术交底正文', status: '示意' },
  { name: '附图说明 · 权属 · 发明人', status: '示意' },
  { name: '待你确认样例', status: '待确认' },
] as const
