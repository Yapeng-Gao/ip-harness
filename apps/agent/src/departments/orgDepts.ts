import type { ProjectExpertId } from '../projects/types'
import {
  BUSINESS_DEFAULT_DEPT_IDS,
  LAYOUT_DEPT,
  PREP_DEPTS,
  type DeptDef,
  type DeptPeer,
} from '../business/deptRoster'

/**
 * 组织编制数据 · 纯数据（无 React）
 * 16 部 canonical 名以 agent-case-ia-v2 §2 为准。
 * 纪律：不改 deptRoster.ts（被测试钉死），只在此叠加。
 */

export type OrgDeptId =
  | 'dept-landscape'
  | 'dept-competitor'
  | 'dept-inspire'
  | 'dept-mining'
  | 'dept-layout'
  | 'dept-intake'
  | 'dept-disclosure'
  | 'dept-research'
  | 'dept-draft'
  | 'dept-figure'
  | 'dept-filing'
  | 'dept-oa'
  | 'dept-annuity'
  | 'dept-monetize'
  | 'dept-enforcement'

export type OrgDeptGroup = 'main' | 'pre' | 'post'

export type OrgDept = {
  id: OrgDeptId
  label: string
  group: OrgDeptGroup
  leadSeatId: ProjectExpertId
  peers: DeptPeer[]
  blurb: string
}

/** 主链 8 部（布局 → 立项 → 交底 → 查新 → 撰写 → 附图 → 递交 → 审查答复） */
export const MAIN_CHAIN_DEPT_IDS: OrgDeptId[] = [
  'dept-layout',
  'dept-intake',
  'dept-disclosure',
  'dept-research',
  'dept-draft',
  'dept-figure',
  'dept-filing',
  'dept-oa',
]

export const ORG_GROUP_LABEL: Record<OrgDeptGroup, string> = {
  main: '主作业链',
  pre: '前研',
  post: '授权后',
}

const PRE_LABEL: Record<string, string> = {
  'dept-landscape': '行业洞察部',
  'dept-competitor': '竞品部',
  'dept-inspire': '创新激发部',
  'dept-mining': '专利挖掘部',
}

const BLURB: Record<string, string> = {
  'dept-landscape': '定赛道、玩家分层、找空白点',
  'dept-competitor': '竞对雷达与到期预警',
  'dept-inspire': '方向池与可专利过滤',
  'dept-mining': '挖掘七问、可专利点',
  'dept-layout': '引用链、公开时点、覆盖检查',
  'dept-intake': '区别特征、三轴评分、范围报价',
  'dept-disclosure': '六段采集、缺项追问、实施例',
  'dept-research': '检索式、覆盖度复核、三性意见',
  'dept-draft': '特征表、权要、说明书、四类质检',
  'dept-figure': '图号清单、草图、图注校对',
  'dept-filing': '齐套检查、形式审查、期限台账',
  'dept-oa': '理由分类、创造性子席、答复起草',
  'dept-annuity': '逐年缴费提醒与缴费建议',
  'dept-monetize': '转化路径与许可要点',
  'dept-enforcement': '无效与维权策略',
}

/** 授权后 3 部：deptRoster 未定义，这里补齐（壳扩展编制） */
const POST_DEPTS: OrgDept[] = [
  {
    id: 'dept-annuity',
    label: '年费部',
    group: 'post',
    leadSeatId: 'expert-annuity',
    // Pack 16 的「价值评估」与「年费」合成一个交卷单位（agent-case-ia-v2 §1）
    peers: [
      {
        id: 'peer:expert-annuity:valuation',
        label: '价值评估师',
        kind: 'session',
        leadSeatId: 'expert-annuity',
        sessionSeatId: 'expert-valuation',
      },
    ],
    blurb: BLURB['dept-annuity'],
  },
  {
    id: 'dept-monetize',
    label: '成果转化部',
    group: 'post',
    leadSeatId: 'expert-monetize',
    peers: [],
    blurb: BLURB['dept-monetize'],
  },
  {
    id: 'dept-enforcement',
    label: '维权部',
    group: 'post',
    leadSeatId: 'expert-enforcement',
    peers: [],
    blurb: BLURB['dept-enforcement'],
  },
]

function fromRoster(d: DeptDef, group: OrgDeptGroup): OrgDept {
  return {
    id: d.id as OrgDeptId,
    label: PRE_LABEL[d.id] ?? d.label,
    group,
    leadSeatId: d.leadSeatId,
    peers: d.peers,
    blurb: BLURB[d.id] ?? '',
  }
}

/** 15 个有席位的部门（FTO 为辅席、案子助手不计部门） */
export const ORG_DEPTS: OrgDept[] = [
  ...BUSINESS_DEFAULT_DEPT_IDS.map((d) => fromRoster(d, 'main')),
  fromRoster(LAYOUT_DEPT, 'main'),
  ...PREP_DEPTS.map((d) => fromRoster(d, 'pre')),
  ...POST_DEPTS,
]

export function orgDeptById(id: string): OrgDept | undefined {
  return ORG_DEPTS.find((d) => d.id === id)
}

export function orgDeptByLeadSeat(seatId: ProjectExpertId): OrgDept | undefined {
  return ORG_DEPTS.find((d) => d.leadSeatId === seatId)
}

/** 主链按 canonical 顺序排列（不是 deptRoster 的声明顺序） */
export const MAIN_CHAIN_DEPTS: OrgDept[] = MAIN_CHAIN_DEPT_IDS.map(
  (id) => ORG_DEPTS.find((d) => d.id === id)!,
).filter(Boolean)

export const PRE_DEPTS: OrgDept[] = ORG_DEPTS.filter((d) => d.group === 'pre')
export const POST_DEPTS_LIST: OrgDept[] = ORG_DEPTS.filter(
  (d) => d.group === 'post',
)

export type ExpertSkill = {
  id: string
  name: string
  level: 'core' | 'optional'
  enabled: boolean
  /** 提示词：真正影响该 skill 执行口径的那段话 */
  prompt: string
  /** 能力档 1–5，用于养成面板 */
  capability: 1 | 2 | 3 | 4 | 5
}

export type ExpertConfig = {
  seatId: ProjectExpertId
  /** 覆盖性 role 文案；空则回落到 expert.description */
  role: string
  skills: ExpertSkill[]
  /** 培养备注：语料 / 案例补充说明 */
  notes: string
  /** 养成：累计经验，决定 level */
  xp: number
}

export type OrgDeptConfig = {
  deptId: OrgDeptId
  /** 覆盖 label；空则用 canonical */
  label: string
  enabled: boolean
}

function skill(
  id: string,
  name: string,
  level: ExpertSkill['level'],
  prompt: string,
  capability: ExpertSkill['capability'],
): ExpertSkill {
  return { id, name, level, enabled: true, prompt, capability }
}

const DEFAULT_SKILLS: ExpertSkill[] = [
  skill('sk-brief', '需求澄清', 'core', '在动手前用一句话复述任务目标与交付物；目标含糊时先问不超过 2 个问题，不要自行假设。', 3),
  skill('sk-cite', '证据引用', 'core', '每条结论后附来源；无来源的判断必须标「推断」。不得编造文号、日期或对比文件。', 3),
  skill('sk-handoff', '交卷自检', 'core', '交卷前逐条核对上游输入的每一项是否已回应；有缺项则写清缺什么、要谁补。', 3),
  skill('sk-style', '行文风格对齐', 'optional', '沿用本案已有稿件的术语与句式；同一技术特征全篇只用一个叫法。', 2),
]

export function defaultSkillsFor(seatId: ProjectExpertId): ExpertSkill[] {
  if (seatId === 'expert-research') {
    return [
      skill('sk-country', '国家库利用', 'core', '优先覆盖中、美、欧、日、韩五局；小语种同族用机翻后标原文出处。', 4),
      skill('sk-query', '检索式构造', 'core', '先用分类号兜底再叠加关键词；检索式必须可复现，写明库、字段、时间窗。', 4),
      skill('sk-fig', '附图引用归一化', 'optional', '附图标记与权要引用一致；同一部件在不同图的编号不得漂移。', 2),
    ]
  }
  if (seatId === 'expert-draft') {
    return [
      skill('sk-claim-tree', '权要树设计', 'core', '独立权项只写必要技术特征；从属权项按「越靠前越重要」倒序排列。', 4),
      skill('sk-support', '支持性自查', 'core', '每个权项术语在说明书中必须有对应段落；找不到就补写或删词。', 4),
      skill('sk-term', '术语一致', 'core', '摘要、权要、说明书三处同名；避免「装置/设备/系统」混用。', 3),
    ]
  }
  return DEFAULT_SKILLS.map((s) => ({ ...s }))
}
