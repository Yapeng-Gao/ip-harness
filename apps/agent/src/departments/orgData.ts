import type { OrgDeptId } from './orgDepts'

/**
 * 部门运营数据 · 专家 / 主理 / 执行集群 / 支撑工具 / 协作边
 *
 * 说明：
 * - 主理 Agent、专家 Agent、工具版本与周调用为**样机数据**
 * - 「在办 / 待确认 / 已完成」由业务案实时投影，不在此文件
 * - 协作边与周协作量是样机示意，但边的走向对齐 agent-case-ia-v2 /
 *   agent-interaction 里写过的真实协作（退回、旁路、补检索）
 */

export type AgentLevel = 1 | 2 | 3 | 4 | 5

export const LEVEL_LABEL: Record<AgentLevel, string> = {
  1: 'L1·见习',
  2: 'L2·熟练',
  3: 'L3·资深',
  4: 'L4·首席',
  5: 'L5·宗师',
}

/** 主理 Agent 的样机基准经验（用户训练量叠在上面，见 OrgConfigContext.xp） */
export const DEPT_MAIN_XP: Record<string, number> = {
  'dept-layout': 300,
  'dept-intake': 180,
  'dept-disclosure': 260,
  'dept-research': 340,
  'dept-draft': 260,
  'dept-figure': 220,
  'dept-filing': 150,
  'dept-oa': 320,
}

/** 升到下一档所需累计经验（最后一档不再升） */
export const XP_STEPS = [0, 40, 100, 200, 360]

export function levelFromXp(xp: number): AgentLevel {
  if (xp >= 360) return 5
  if (xp >= 200) return 4
  if (xp >= 100) return 3
  if (xp >= 40) return 2
  return 1
}

/** 当前档位内的进度，用于养成进度条 */
export function xpProgress(totalXp: number): {
  level: AgentLevel
  current: number
  need: number
  pct: number
} {
  const level = levelFromXp(totalXp)
  if (level === 5) return { level, current: 1, need: 1, pct: 100 }
  const base = XP_STEPS[level - 1]
  const next = XP_STEPS[level]
  const current = totalXp - base
  const need = next - base
  return { level, current, need, pct: Math.round((current / need) * 100) }
}

export type MainAgent = {
  name: string
  code: string
  duty: string
  tags: string[]
}

export type DeptExpertAgent = {
  /** 配置键：子专家用合成 id，主责用真实 seat id */
  id: string
  name: string
  code: string
  /** 起始经验（决定默认档位） */
  baseXp: number
  specialty: string
  status: '任务中' | '运行中' | '待命'
}

export type DeptTool = {
  id: string
  name: string
  code: string
  version: string
  weeklyCalls: number
  /** 自动化率 % */
  automation: number
}

export type DeptRich = {
  deptId: OrgDeptId
  mainAgent: MainAgent
  experts: DeptExpertAgent[]
  workerPrefix: string
  workerCount: number
  tools: DeptTool[]
}

const EXPERT = (
  id: string,
  name: string,
  code: string,
  baseXp: number,
  specialty: string,
  status: DeptExpertAgent['status'],
): DeptExpertAgent => ({ id, name, code, baseXp, specialty, status })

export const DEPT_RICH: Record<string, DeptRich> = {
  'dept-layout': {
    deptId: 'dept-layout',
    mainAgent: {
      name: '严布',
      code: 'AGT-LAYT-00',
      duty: '部门统筹 · 组合设计 · 申请节奏',
      tags: ['全局视角', '算账精', '不急不躁'],
    },
    experts: [
      EXPERT('sub-layt-portfolio', '组合规划专家', 'LAYT-E-01', 240, '申请树 · 优先权链', '运行中'),
      EXPERT('sub-layt-region', '地域布局专家', 'LAYT-E-02', 140, 'PCT · 巴黎公约', '待命'),
      EXPERT('sub-layt-cite', '引证链专家', 'LAYT-E-03', 120, '引用关系 · 公开时点', '任务中'),
      EXPERT('sub-layt-fee', '年费测算专家', 'LAYT-E-04', 55, '维持成本 · 放弃时点', '待命'),
    ],
    workerPrefix: 'LAYT-W',
    workerCount: 6,
    tools: [
      { id: 'tl-layt-01', name: '组合沙盘', code: 'TL-LAYT-01', version: 'v2.1', weeklyCalls: 96, automation: 68 },
      { id: 'tl-layt-02', name: '引证链分析', code: 'TL-LAYT-02', version: 'v1.8', weeklyCalls: 54, automation: 74 },
    ],
  },
  'dept-intake': {
    deptId: 'dept-intake',
    mainAgent: {
      name: '沈评',
      code: 'AGT-INTA-00',
      duty: '部门统筹 · 价值判断 · 预算定档',
      tags: ['保守派', '一票否决', '留痕控'],
    },
    experts: [
      EXPERT('sub-inta-score', '三轴评分专家', 'INTA-E-01', 230, '技术 · 市场 · 法律', '运行中'),
      EXPERT('sub-inta-diff', '区别特征专家', 'INTA-E-02', 150, '对比文件 · 区别点', '任务中'),
      EXPERT('sub-inta-quote', '报价测算专家', 'INTA-E-03', 60, '范围 · 档位 · 折扣', '待命'),
    ],
    workerPrefix: 'INTA-W',
    workerCount: 8,
    tools: [
      { id: 'tl-inta-01', name: '价值评分器', code: 'TL-INTA-01', version: 'v3.0', weeklyCalls: 128, automation: 82 },
      { id: 'tl-inta-02', name: '报价测算', code: 'TL-INTA-02', version: 'v1.4', weeklyCalls: 41, automation: 55 },
    ],
  },
  'dept-disclosure': {
    deptId: 'dept-disclosure',
    mainAgent: {
      name: '诸葛问',
      code: 'AGT-DISC-00',
      duty: '部门统筹 · 技术还原 · 缺项追问',
      tags: ['刨根问底', '不留含糊', '擅长补锅'],
    },
    experts: [
      EXPERT('sub-disc-six', '六段采集专家', 'DISC-E-01', 260, '技术问题 · 方案 · 效果', '运行中'),
      EXPERT('sub-disc-ask', '追问专家', 'DISC-E-02', 160, '缺项识别 · 追问话术', '任务中'),
      EXPERT('sub-disc-emb', '实施例专家', 'DISC-E-03', 130, '边界例 · 变形例', '运行中'),
      EXPERT('sub-disc-sketch', '附图草绘专家', 'DISC-E-04', 50, '结构草图 · 剖视', '待命'),
    ],
    workerPrefix: 'DISC-W',
    workerCount: 9,
    tools: [
      { id: 'tl-disc-01', name: '交底结构化', code: 'TL-DISC-01', version: 'v2.5', weeklyCalls: 210, automation: 77 },
      { id: 'tl-disc-02', name: '追问生成', code: 'TL-DISC-02', version: 'v2.0', weeklyCalls: 156, automation: 63 },
    ],
  },
  'dept-research': {
    deptId: 'dept-research',
    mainAgent: {
      name: '查无遗',
      code: 'AGT-RSRC-00',
      duty: '部门统筹 · 检索策略 · 三性判断',
      tags: ['强迫症', '穷举癖', '语料库狂热'],
    },
    experts: [
      EXPERT('sub-rsrc-elec', '电学检索专家', 'RSRC-E-01', 280, '电路 · 通信 · 半导体', '任务中'),
      EXPERT('sub-rsrc-mech', '机械检索专家', 'RSRC-E-02', 250, '结构 · 传动 · 工艺', '运行中'),
      EXPERT('sub-rsrc-chem', '化学检索专家', 'RSRC-E-03', 150, '组合物 · 制备方法', '运行中'),
      EXPERT('sub-rsrc-soft', '软通检索专家', 'RSRC-E-04', 140, '算法 · 商业方法', '任务中'),
      EXPERT('sub-rsrc-rehearing', '复审检索专家', 'RSRC-E-05', 65, '无效 · 复审证据', '待命'),
    ],
    workerPrefix: 'RSRC-W',
    workerCount: 12,
    tools: [
      { id: 'tl-rsrc-01', name: '检索式引擎', code: 'TL-RSRC-01', version: 'v5.2', weeklyCalls: 412, automation: 71 },
      { id: 'tl-rsrc-02', name: '三性判断', code: 'TL-RSRC-02', version: 'v3.1', weeklyCalls: 288, automation: 66 },
    ],
  },
  'dept-draft': {
    deptId: 'dept-draft',
    mainAgent: {
      name: '阿撰',
      code: 'AGT-DRFT-00',
      duty: '部门统筹 · 权要布局 · 定稿签发',
      tags: ['完美主义', '改稿不倦', '手法挑剔'],
    },
    experts: [
      EXPERT('sub-drft-elec', '电学撰写专家', 'DRFT-E-01', 300, '权要布局 · 电学/通信', '任务中'),
      EXPERT('sub-drft-mech', '机械撰写专家', 'DRFT-E-02', 270, '结构撰写 · 制图审核', '运行中'),
      EXPERT('sub-drft-chem', '化学撰写专家', 'DRFT-E-03', 160, '实施例 · 马库什权要', '任务中'),
      EXPERT('sub-drft-soft', '软件撰写专家', 'DRFT-E-04', 145, '算法保护 · 商业方法', '运行中'),
      EXPERT('sub-drft-bio', '生物医药撰写专家', 'DRFT-E-05', 110, '序列/化合物 · 实验数据', '待命'),
    ],
    workerPrefix: 'DRFT-W',
    workerCount: 14,
    tools: [
      { id: 'tl-drft-01', name: '撰写生成引擎', code: 'TL-DRFT-01', version: 'v4.2', weeklyCalls: 312, automation: 71 },
      { id: 'tl-drft-02', name: '权要优化引擎', code: 'TL-DRFT-02', version: 'v2.8', weeklyCalls: 148, automation: 66 },
      { id: 'tl-drft-03', name: '说明书装配', code: 'TL-DRFT-03', version: 'v1.9', weeklyCalls: 205, automation: 58 },
    ],
  },
  'dept-figure': {
    deptId: 'dept-figure',
    mainAgent: {
      name: '图匠',
      code: 'AGT-FIGR-00',
      duty: '部门统筹 · 图面规划 · 标号一致',
      tags: ['毫米级', '标号洁癖', '对照狂'],
    },
    experts: [
      EXPERT('sub-figr-draw', '制图专家', 'FIGR-E-01', 240, '结构 · 剖视 · 爆炸图', '运行中'),
      EXPERT('sub-figr-caption', '图注校对专家', 'FIGR-E-02', 150, '标号 · 引线 · 术语', '任务中'),
      EXPERT('sub-figr-struct', '结构拆解专家', 'FIGR-E-03', 120, '部件划分 · 视角选择', '运行中'),
    ],
    workerPrefix: 'FIGR-W',
    workerCount: 7,
    tools: [
      { id: 'tl-figr-01', name: '附图生成引擎', code: 'TL-FIGR-01', version: 'v1.5', weeklyCalls: 121, automation: 88 },
      { id: 'tl-figr-02', name: '标号一致性', code: 'TL-FIGR-02', version: 'v1.2', weeklyCalls: 88, automation: 92 },
    ],
  },
  'dept-filing': {
    deptId: 'dept-filing',
    mainAgent: {
      name: '齐套',
      code: 'AGT-FILE-00',
      duty: '部门统筹 · 齐套校验 · 期限台账',
      tags: ['清单控', '零容错', '提前交'],
    },
    experts: [
      EXPERT('sub-file-pack', '齐套检查专家', 'FILE-E-01', 230, '文件清单 · 缺失识别', '运行中'),
      EXPERT('sub-file-form', '形式审查专家', 'FILE-E-02', 150, '格式 · 著录项', '任务中'),
      EXPERT('sub-file-docket', '期限台账专家', 'FILE-E-03', 140, '绝限期 · 宽限期', '运行中'),
    ],
    workerPrefix: 'FILE-W',
    workerCount: 6,
    tools: [
      { id: 'tl-file-01', name: '齐套校验器', code: 'TL-FILE-01', version: 'v3.3', weeklyCalls: 176, automation: 94 },
      { id: 'tl-file-02', name: '期限台账', code: 'TL-FILE-02', version: 'v2.7', weeklyCalls: 133, automation: 86 },
    ],
  },
  'dept-oa': {
    deptId: 'dept-oa',
    mainAgent: {
      name: '答有理',
      code: 'AGT-OANS-00',
      duty: '部门统筹 · 理由分类 · 答复定稿',
      tags: ['辩论家', '引用成癖', '不退让'],
    },
    experts: [
      EXPERT('sub-oans-inventive', '创造性答复专家', 'OANS-E-01', 290, '技术启示 · 区别技术特征', '任务中'),
      EXPERT('sub-oans-novel', '新颖性答复专家', 'OANS-E-02', 160, '公开内容 · 惯用手段', '运行中'),
      EXPERT('sub-oans-form', '形式缺陷专家', 'OANS-E-03', 130, '不清楚 · 不支持', '运行中'),
      EXPERT('sub-oans-search', '补充检索专家', 'OANS-E-04', 120, '答复拉动 · 新证据', '待命'),
    ],
    workerPrefix: 'OANS-W',
    workerCount: 10,
    tools: [
      { id: 'tl-oans-01', name: 'OA 理由分类', code: 'TL-OANS-01', version: 'v2.4', weeklyCalls: 164, automation: 79 },
      { id: 'tl-oans-02', name: '答复草拟', code: 'TL-OANS-02', version: 'v2.1', weeklyCalls: 118, automation: 61 },
    ],
  },
}

export type CollabEdge = {
  from: OrgDeptId
  to: OrgDeptId
  label: string
  /** 周协作量（样机） */
  weekly: number
  kind: 'handoff' | 'cross'
}

/** 主链移交（实线）+ 横向协作（虚线）；走向对齐既有交互规格 */
export const COLLAB_EDGES: CollabEdge[] = [
  { from: 'dept-layout', to: 'dept-intake', label: '布局方案移交', weekly: 18, kind: 'handoff' },
  { from: 'dept-intake', to: 'dept-disclosure', label: '立项决议移交', weekly: 22, kind: 'handoff' },
  { from: 'dept-disclosure', to: 'dept-research', label: '交底书移交', weekly: 26, kind: 'handoff' },
  { from: 'dept-research', to: 'dept-draft', label: '查新意见移交', weekly: 24, kind: 'handoff' },
  { from: 'dept-draft', to: 'dept-figure', label: '申请文件包移交', weekly: 20, kind: 'handoff' },
  { from: 'dept-figure', to: 'dept-filing', label: '附图任务单移交', weekly: 17, kind: 'handoff' },
  { from: 'dept-filing', to: 'dept-oa', label: '递交作业单移交', weekly: 14, kind: 'handoff' },

  { from: 'dept-research', to: 'dept-draft', label: '对比文件复核', weekly: 34, kind: 'cross' },
  { from: 'dept-oa', to: 'dept-draft', label: 'OA 联席答复', weekly: 22, kind: 'cross' },
  { from: 'dept-figure', to: 'dept-draft', label: '图注与权要核对', weekly: 18, kind: 'cross' },
  { from: 'dept-layout', to: 'dept-research', label: '预检索委托', weekly: 15, kind: 'cross' },
  { from: 'dept-research', to: 'dept-oa', label: '答复补充检索', weekly: 12, kind: 'cross' },
  { from: 'dept-disclosure', to: 'dept-draft', label: '交底缺项追问', weekly: 9, kind: 'cross' },
  { from: 'dept-filing', to: 'dept-oa', label: '文件与答复对齐', weekly: 7, kind: 'cross' },
]

/** 协作网络里的固定摆位（0-100 的百分比坐标） */
export const NETWORK_POS: Record<string, { x: number; y: number }> = {
  'dept-layout': { x: 17, y: 30 },
  'dept-intake': { x: 36, y: 14 },
  'dept-disclosure': { x: 58, y: 22 },
  'dept-research': { x: 74, y: 34 },
  'dept-draft': { x: 76, y: 56 },
  'dept-figure': { x: 55, y: 63 },
  'dept-filing': { x: 34, y: 62 },
  'dept-oa': { x: 16, y: 54 },
}

/** 部门在某案上的负荷：待确认多 = 高负荷 */
export type DeptLoad = '高负荷' | '运转中' | '待命'

export function deptLoad(pendingCount: number, activeCount: number): DeptLoad {
  if (pendingCount > 0) return '高负荷'
  if (activeCount > 0) return '运转中'
  return '待命'
}

export function workerIds(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`)
}

/** 该部门的上游 / 下游（主链）与横向协作 */
export function relationsFor(deptId: OrgDeptId) {
  const handoffs = COLLAB_EDGES.filter((e) => e.kind === 'handoff')
  const from = handoffs.find((e) => e.to === deptId)
  const to = handoffs.find((e) => e.from === deptId)
  const cross = COLLAB_EDGES.filter(
    (e) =>
      e.kind === 'cross' && (e.from === deptId || e.to === deptId),
  )
  return { upstream: from, downstream: to, cross }
}
