import type { StageId, StageMeta } from './types'

/**
 * 阶段元数据。`runners` 为静态概念目录（非案级 Live 进度）。
 * 办理子步骤以 data/flowSteps.ts + AppContext.flowProgressByCase 为准
 * （MidPlatform NodeProgress 2026-09-12：已移除 runners 活状态 / toggleRunnerStep）。
 */
export const STAGES: StageMeta[] = [
  {
    id: 'pre_research',
    name: '立项前调研',
    shortName: '调研',
    description: '技术扫描、现有技术检索、竞品专利、可专利性初评、初步 FTO',
    color: '#818cf8',
    runners: [
      {
        id: 'prior_art',
        name: '现有技术检索',
        description: '检索 CN/US/EP/WO 数据库，输出检索报告',
        steps: [
          { id: 's1', label: '确定检索关键词与分类号', done: false },
          { id: 's2', label: '执行多库并行检索', done: false },
          { id: 's3', label: '筛选相关文献并标注', done: false },
          { id: 's4', label: '生成检索报告', done: false },
        ],
      },
      {
        id: 'fto',
        name: '初步 FTO',
        description: '自由实施分析，识别潜在侵权风险',
        steps: [
          { id: 's1', label: '圈定目标产品/技术方案', done: false },
          { id: 's2', label: '检索有效专利权利要求', done: false },
          { id: 's3', label: '对比侵权可能性', done: false },
          { id: 's4', label: '输出 FTO 意见书', done: false },
        ],
      },
      {
        id: 'patentability',
        name: '可专利性初评',
        description: '新颖性、创造性、实用性快速评估',
        steps: [
          { id: 's1', label: '梳理技术要点', done: false },
          { id: 's2', label: '对比最接近现有技术', done: false },
          { id: 's3', label: '给出可专利性结论', done: false },
        ],
      },
    ],
    defaultChecklist: [
      { id: 'c1', label: '完成技术扫描报告', required: true },
      { id: 'c2', label: '完成现有技术检索', required: true },
      { id: 'c3', label: '完成竞品专利分析', required: true },
      { id: 'c4', label: '可专利性初评通过', required: true },
      { id: 'c5', label: '初步 FTO 无重大风险', required: true },
    ],
  },
  {
    id: 'decision',
    name: '立项决策',
    shortName: '决策',
    description: '发明披露、技术/商业评审、Go·No-Go 闸门',
    color: '#a78bfa',
    runners: [
      {
        id: 'disclosure',
        name: '发明披露评审',
        description: '收集发明人交底信息并组织评审',
        steps: [
          { id: 's1', label: '提交发明披露表', done: false },
          { id: 's2', label: '技术评审会议', done: false },
          { id: 's3', label: '商业价值评估', done: false },
          { id: 's4', label: 'Go / No-Go 决议', done: false },
        ],
      },
    ],
    defaultChecklist: [
      { id: 'c1', label: '发明披露表已提交', required: true },
      { id: 'c2', label: '技术评审完成', required: true },
      { id: 'c3', label: '商业评审完成', required: true },
      { id: 'c4', label: 'Go 决议已签署', required: true },
    ],
  },
  {
    id: 'drafting',
    name: '撰写申请',
    shortName: '撰写',
    description: '交底书、权利要求布局、申请国别策略、提交与优先权',
    color: '#60a5fa',
    runners: [
      {
        id: 'spec',
        name: '交底书与说明书撰写',
        description: '完善技术交底，撰写说明书与附图',
        steps: [
          { id: 's1', label: '完善技术交底书', done: false },
          { id: 's2', label: '权利要求布局设计', done: false },
          { id: 's3', label: '说明书与附图定稿', done: false },
          { id: 's4', label: '发明人确认', done: false },
        ],
      },
      {
        id: 'filing',
        name: '申请提交',
        description: '确定国别策略并提交申请',
        steps: [
          { id: 's1', label: '确定申请国别策略', done: false },
          { id: 's2', label: '准备申请文件包', done: false },
          { id: 's3', label: '提交并获取申请号', done: false },
          { id: 's4', label: '优先权期限标记', done: false },
        ],
      },
    ],
    defaultChecklist: [
      { id: 'c1', label: '交底书定稿', required: true },
      { id: 'c2', label: '权利要求布局确认', required: true },
      { id: 'c3', label: '申请国别策略确认', required: true },
      { id: 'c4', label: '申请已提交', required: true },
      { id: 'c5', label: '优先权信息已登记', required: false },
    ],
  },
  {
    id: 'prosecution',
    name: '审查答复',
    shortName: '答复',
    description: 'OA 管理、答复策略、期限与费用追踪',
    color: '#fbbf24',
    runners: [
      {
        id: 'oa',
        name: 'OA 答复流程',
        description: '分析审查意见并制定答复策略',
        steps: [
          { id: 's1', label: '接收并解析 OA', done: false },
          { id: 's2', label: '制定答复策略', done: false },
          { id: 's3', label: '撰写意见陈述与修改', done: false },
          { id: 's4', label: '提交答复并更新期限', done: false },
        ],
      },
    ],
    defaultChecklist: [
      { id: 'c1', label: 'OA 已登记并分配', required: true },
      { id: 'c2', label: '答复策略已确认', required: true },
      { id: 'c3', label: '意见陈述已提交', required: true },
      { id: 'c4', label: '费用与期限已更新', required: true },
    ],
  },
  {
    id: 'maintenance',
    name: '授权维持',
    shortName: '维持',
    description: '授权登记、年费、权利状态、证书与变更',
    color: '#34d399',
    runners: [
      {
        id: 'grant',
        name: '授权登记与年费',
        description: '办理授权手续并建立年费计划',
        steps: [
          { id: 's1', label: '缴纳授权登记费', done: false },
          { id: 's2', label: '领取专利证书', done: false },
          { id: 's3', label: '建立年费缴纳计划', done: false },
          { id: 's4', label: '权利状态同步', done: false },
        ],
      },
    ],
    defaultChecklist: [
      { id: 'c1', label: '授权登记完成', required: true },
      { id: 'c2', label: '专利证书已归档', required: true },
      { id: 'c3', label: '年费计划已建立', required: true },
      { id: 'c4', label: '权利状态已更新', required: true },
    ],
  },
  {
    id: 'commercialization',
    name: '运用转化',
    shortName: '转化',
    description: '许可/转让、作价入股、诉讼维权、成果落地',
    color: '#f472b6',
    runners: [
      {
        id: 'license',
        name: '许可转让流程',
        description: '评估转化路径并执行交易',
        steps: [
          { id: 's1', label: '评估转化路径', done: false },
          { id: 's2', label: '起草许可/转让协议', done: false },
          { id: 's3', label: '谈判与签署', done: false },
          { id: 's4', label: '备案与成果落地跟踪', done: false },
        ],
      },
      {
        id: 'litigation',
        name: '诉讼维权',
        description:
          '元数据步骤示意 · 无独立 Flow；路径标记在转化台，线索从监控「升级维权」',
        steps: [
          { id: 's1', label: '侵权证据保全（示意）', done: false },
          { id: 's2', label: '发函警告/调解（示意）', done: false },
          { id: 's3', label: '提起诉讼立案（示意）', done: false },
          { id: 's4', label: '判决执行跟踪（示意）', done: false },
        ],
      },
    ],
    defaultChecklist: [
      { id: 'c1', label: '转化路径已选定', required: true },
      { id: 'c2', label: '协议/诉讼材料齐备', required: true },
      { id: 'c3', label: '交易或维权已启动', required: true },
      { id: 'c4', label: '成果落地跟踪中', required: false },
    ],
  },
  {
    id: 'monitoring',
    name: '监控预警',
    shortName: '监控',
    description: '侵权监测、竞品动态、到期与风险提醒',
    color: '#fb7185',
    runners: [
      {
        id: 'watch',
        name: '侵权与竞品监测',
        description: '持续监测市场与专利公开动态',
        steps: [
          { id: 's1', label: '配置监测关键词与竞品', done: false },
          { id: 's2', label: '接入监测数据源', done: false },
          { id: 's3', label: '告警规则设置', done: false },
          { id: 's4', label: '定期报告输出', done: false },
        ],
      },
    ],
    defaultChecklist: [
      { id: 'c1', label: '监测范围已配置', required: true },
      { id: 'c2', label: '告警规则已生效', required: true },
      { id: 'c3', label: '到期提醒已开启', required: true },
      { id: 'c4', label: '本月监测报告已生成', required: false },
    ],
  },
]

export const STAGE_ORDER: StageId[] = STAGES.map((s) => s.id)

export function getStageMeta(id: StageId) {
  return STAGES.find((s) => s.id === id)!
}

export function getStageIndex(id: StageId) {
  return STAGE_ORDER.indexOf(id)
}
