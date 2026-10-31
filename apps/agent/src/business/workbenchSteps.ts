/**
 * 工作台按步主栏 · 对齐一期产品逻辑 ④⑤⑥ + 薄部同壳
 * 主栏只展「当前步」交付物；右栏另钉本步硬请示（由页面接线）。
 * 不改 confirmGate / 进度真值；演示可用 forceStepId。
 */
import type { OrgDeptId } from '../departments/orgDepts'

export type WorkbenchStepId = string

export type WorkbenchStepDef = {
  id: WorkbenchStepId
  label: string
  hint: string
  /** 本步主栏该看什么（短） */
  mainFocus: string
  /** 本步主栏正文占位（样机级） */
  mainBody: string
}

/** 真源 ④ 交底：成稿 → 事实 → 质检 → 可交⑤ */
export const D4_STEPS: WorkbenchStepDef[] = [
  {
    id: 'draft',
    label: '成稿',
    hint: '交底正文',
    mainFocus: '本步只写成稿 · 质检与可交⑤不在本屏',
    mainBody:
      '【交底成稿 · 本步】\n\n技术领域：电机散热 / 水道与鳍片组合。\n技术问题：高功率密度下温升偏高。\n技术方案：螺旋水道 + 端盖鳍片 + 双密封（演示稿）。\n\n→ 事实确认、质检分卡在后续步打开。',
  },
  {
    id: 'fact',
    label: '事实确认',
    hint: '待你确认',
    mainFocus: '本步只核对交底事实 · 拍板在右栏对话',
    mainBody:
      '【交底书 · 待你确认事实】\n\n技术领域：电机散热。\n背景：风冷温升偏高；纯水冷结构复杂。\n方案要点：螺旋水道、端盖鳍片、错位进出口、双密封圈。\n效果：样机测温升约降 12℃（演示数据）。\n\n右栏负责人会请示：以上事实是否属实。',
  },
  {
    id: 'qc',
    label: '质检',
    hint: '复检至全绿',
    mainFocus: '本屏只处理未过项 · 交底正文折起备查',
    mainBody:
      '【质检 · 未过项】\n\n· q4 效果有数据/依据 — 黄（待补测法标注）\n· 其余项已绿（演示）\n\n正文可在材料目录展开备查；拍板仍在右栏。',
  },
  {
    id: 'hand',
    label: '可交⑤',
    hint: '硬请示',
    mainFocus: '本步确认可否打包开④→⑤工单',
    mainBody:
      '【节点交付】\n\n交底质检示意全绿后，待你拍「可交⑤」。\n全绿 ≠ 已交⑤；未拍不得开工单。',
  },
]

/** 真源 ⑤ ABC：理解 → 申不申 → 过线/递交 */
export const D5_STEPS: WorkbenchStepDef[] = [
  {
    id: 'a',
    label: 'A · 理解',
    hint: '开案复述',
    mainFocus: '本步核对开案理解 · 申不申与递交不在本屏',
    mainBody:
      '【A · 开案理解】\n\n本案交底主张：水道+鳍片+双密封组合散热。\n申请部复述：拟写独权覆盖壳体水道、端盖鳍片与双密封。\n\n右栏请示：理解是否正确。',
  },
  {
    id: 'b',
    label: 'B · 申不申',
    hint: '查新拍板',
    mainFocus: '本步只拍申不申 · 权项起草在后续',
    mainBody:
      '【B · 申不申】\n\n查新示意：D1 公开螺旋水道，未披露端盖鳍片与双密封组合。\n建议：申请发明；范围可缩到「双密封+错位进出口」。\n\n右栏请示：申 / 不申 / 改范围。',
  },
  {
    id: 'c-qc',
    label: 'C · 过线',
    hint: '质检未过',
    mainFocus: '本步盯申请文件过线项',
    mainBody:
      '【C · 申请文件过线】\n\n· 权项与交底一致 — 绿\n· 说明书支撑权项 — 绿\n· 形式要件齐全 — 黄（演示）\n\n过线后才进确认递交。',
  },
  {
    id: 'c-submit',
    label: 'C · 递交',
    hint: '确认递交',
    mainFocus: '本步确认递交 · 过线≠已递交',
    mainBody:
      '【C · 确认递交】\n\n申请包示意齐套。过线 ≠ 已递交局端。\n右栏请示：确认递交 / 暂缓。',
  },
]

/** 真源 ⑥：争点 → 策略 → 起草审核 */
export const D6_STEPS: WorkbenchStepDef[] = [
  {
    id: 'a',
    label: 'A · 争点',
    hint: '中立拆解',
    mainFocus: '本步只中立复述争点',
    mainBody:
      '【A · 争点中立复述】\n\n审查意见：D1 公开螺旋水道；认为鳍片与水道组合显而易见。\n本案拟主张：双密封+错位进出口带来的非显而易见效果。\n\n右栏请示：争点理解是否准确。',
  },
  {
    id: 'b',
    label: 'B · 策略',
    hint: '重大缩限你拍',
    mainFocus: '本步拍策略/缩限',
    mainBody:
      '【B · 策略选项】\n\nA：争辩创造性，少改权要\nB：补入双密封+错位限定（重大缩限）\n\n右栏请示：选哪条（重大缩限须你拍）。',
  },
  {
    id: 'c',
    label: 'C/D · 起草审核',
    hint: '过线后递交',
    mainFocus: '本步看答复稿 · 本轮递交另拍',
    mainBody:
      '【C/D · 答复起草】\n\n意见陈述示意已起草；修改说明待你过目。\n本轮 D 过线后，右栏再拍本轮递交。',
  },
]

/** 薄部同壳：合格线 + 边界 + 主栏示意作业（非空壳；仍标演示） */
export type ThinDeptShell = {
  line: string
  ban: string
  /** 主栏示意作业正文 */
  workTitle: string
  workBody: string
}

export const THIN_LINE_BY_DEPT: Partial<Record<OrgDeptId, ThinDeptShell>> = {
  'dept-intake': {
    line: '项目已创建 + 方向一句话 + 状态 + 用户确认',
    ban: '勿把建项说成完整论证报告；≠保护去向；≠申不申',
    workTitle: '① 建项卡（示意）',
    workBody:
      '【项目卡 · 待你确认】\n\n名称：边缘散热结构改型\n方向一句话：螺旋水道+端盖鳍片+双密封，降高功率密度温升。\n状态：草案 · 待立项确认\n可引用 ID：PRJ-DEMO-1042\n\n→ 右栏请示：确认建项 / 改方向 / 搁置。\n（完整论证报告后置，不在本屏假装已出。）',
  },
  'dept-inspire': {
    line: '问题→路径→用户选题+收藏（或跳过留痕）',
    ban: '报告/三图≠本部主交付；无授权承诺；可整段跳过',
    workTitle: '② 问题→路径→选题（示意）',
    workBody:
      '【创新激发 · 本步】\n\n问题卡点：风冷不够、纯水冷结构复杂。\n路径 A：改水道几何\n路径 B：端盖强化散热\n路径 C：密封与流阻折中\n\n推荐选题：A+B 组合（演示）。\n→ 右栏请示：选题收藏 / 改路径 / 跳过并留痕。',
  },
  'dept-mining': {
    line: '报告路径或交④点包路径择一确认',
    ban: '不代替交底 / 申不申；不承诺可授权',
    workTitle: '③ 创新点 + 拆案（示意）',
    workBody:
      '【专利挖掘 · 点包】\n\n点 1：螺旋水道螺距与截面（可专利性：中）\n点 2：端盖鳍片阵列（可专利性：中高）\n点 3：双密封+错位进出口（可专利性：高）\n\n拆案建议：主案覆盖点 2+3；点 1 可并案或后置。\n→ 右栏请示：确认点包交④ / 只要分析报告 / 改拆案。',
  },
  'dept-landscape': {
    line: '赛道一句话 + 空白点清单经你过目',
    ban: '洞察报告≠已立项；不代替挖掘/交底',
    workTitle: '赛道洞察（示意）',
    workBody: '【赛道】电机液冷端盖 · 空白：错位进出口+双密封组合披露少。\n≠已立项。',
  },
  'dept-competitor': {
    line: '竞对雷达条目 + 到期预警已展示',
    ban: '雷达有≠已采取行动',
    workTitle: '竞对雷达（示意）',
    workBody: '【雷达】竞对 A 液冷专利将到期 · 预警：黄。\n雷达有≠已行动。',
  },
  'dept-annuity': {
    line: '台账可核 + 期限提醒 +（有费）缴费经用户确认',
    ban: '台账有≠看板已交付；系统内提醒≠短信邮件已通',
    workTitle: '⑦ 维护台账（示意）',
    workBody:
      '【确权资产托管】\n\n申请号：CN2026XXXXXX.X（演示）\n下一年费：2027-03-15 · 金额示意 ¥900\n明白账：官费 + 代理费分列（样机）\n\n→ 右栏请示：确认缴费 / 暂缓 / 放弃维权评估转⑧。\n系统内提醒 ≠ 短信邮件已通。',
  },
  'dept-monetize': {
    line: '复盘/转化报告已交 + 维持或放弃已拍或只读不拍留痕',
    ban: '复盘≠情报检索；只读不拍不得回写维护台账',
    workTitle: '⑧ 复盘报告五块（示意）',
    workBody:
      '【阶段复盘】\n\n1 研发：散热改型样机温升 -12℃\n2 专利：交底全绿 1；申请在途 1\n3 系统：部门工单④→⑤已跑通（演示）\n4 上下游：供应商密封圈交期风险\n5 市场：竞对到期窗口\n\n→ 右栏请示：维持 / 放弃 / 本轮只读不拍（不回写⑦）。\n复盘 ≠ 情报官专报。',
  },
  'dept-enforcement': {
    line: '策略备忘已交 + 重大动作经你拍',
    ban: '策略备忘≠已起诉/已无效',
    workTitle: '维权策略备忘（示意）',
    workBody: '【备忘】监测疑似落入 · 建议先发函。\n≠已起诉。',
  },
  'dept-layout': {
    line: '布局要点清单经你过目',
    ban: '布局≠已撰写权要',
    workTitle: '布局要点（示意）',
    workBody: '【布局】主从案引用链 · 公开时点。\n≠已写权要。',
  },
  'dept-research': {
    line: '检索结论稿 + 三性意见待你确认',
    ban: '查新结论≠已交底全绿；≠申不申终裁',
    workTitle: '查新结论（辅链示意）',
    workBody:
      '【查新 · 辅链】\nD1 公开螺旋水道；未披露双密封+错位组合。\n三性意见：新颖性可成立；创造性建议限缩。\n≠申不申终裁（在⑤ B）。',
  },
  'dept-figure': {
    line: '图号清单 + 图注校对经你过目',
    ban: '附图齐≠申请已递交',
    workTitle: '附图齐套（辅链示意）',
    workBody: '【附图】图 1–4 图号与权要引用一致（示意）。\n≠已递交。',
  },
}

export type StepfulKind = 'd4' | 'd5' | 'd6'

export function stepfulKindForDept(deptId: OrgDeptId): StepfulKind | null {
  if (deptId === 'dept-disclosure') return 'd4'
  if (deptId === 'dept-draft' || deptId === 'dept-filing') return 'd5'
  if (deptId === 'dept-oa') return 'd6'
  return null
}

export function stepsForKind(kind: StepfulKind): WorkbenchStepDef[] {
  if (kind === 'd4') return D4_STEPS
  if (kind === 'd5') return D5_STEPS
  return D6_STEPS
}

/**
 * 由席 stepIndex / 待确认态估当前步（演示启发式；force 可覆盖）
 */
export function resolveCurrentStep(
  kind: StepfulKind,
  opts: {
    stepIndex: number
    awaitingConfirm: boolean
    leadDone: boolean
    forceStepId?: string | null
    /** filing 席默认落 C · 递交；draft 默认 A */
    deptId?: OrgDeptId
  },
): WorkbenchStepDef {
  const steps = stepsForKind(kind)
  if (opts.forceStepId) {
    const hit = steps.find((s) => s.id === opts.forceStepId)
    if (hit) return hit
  }
  if (opts.leadDone) return steps[steps.length - 1]!
  if (kind === 'd4') {
    if (opts.awaitingConfirm) return steps.find((s) => s.id === 'hand') ?? steps[1]!
    if (opts.stepIndex <= 0) return steps[1]! // 默认进事实确认（样机默认）
    if (opts.stepIndex === 1) return steps[2]!
    return steps[Math.min(opts.stepIndex, steps.length - 1)]!
  }
  if (kind === 'd5') {
    if (opts.deptId === 'dept-filing') {
      if (opts.awaitingConfirm) {
        return steps.find((s) => s.id === 'c-submit') ?? steps[steps.length - 1]!
      }
      return steps.find((s) => s.id === 'c-qc') ?? steps[2]!
    }
    // draft / 申请主场：默认 A · 理解，露出 ABC
    if (opts.awaitingConfirm) {
      return steps.find((s) => s.id === 'b') ?? steps[1]!
    }
    const i = Math.min(Math.max(opts.stepIndex, 0), steps.length - 1)
    return steps[i]!
  }
  if (opts.awaitingConfirm) {
    return steps.find((s) => s.id === 'b') ?? steps[1]!
  }
  const i = Math.min(Math.max(opts.stepIndex, 0), steps.length - 1)
  return steps[i]!
}

export function isThinShellDept(deptId: OrgDeptId): boolean {
  return stepfulKindForDept(deptId) === null
}
