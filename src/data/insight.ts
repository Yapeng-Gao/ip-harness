import type {
  InsightTrack,
  InnovateCampaign,
  PatentLayoutDomain,
  IndustryChain,
} from '../types'

/** 示意数据 · 赛道洞察 MVP */
export const INSIGHT_TRACKS: InsightTrack[] = [
  {
    id: 'track-solid-electrolyte',
    name: '固态电池电解质',
    domain: '新能源材料',
    summary:
      '硫化物 / 氧化物固态电解质近年公开量快速上升，界面稳定性与量产工艺仍是空白带。',
    labeledMock: true,
    competitors: [
      { name: '宁德时代', filings: 96, share: 18 },
      { name: '卫蓝新能源', filings: 54, share: 10 },
      { name: '清陶能源', filings: 48, share: 9 },
      { name: '丰田', filings: 72, share: 14 },
      { name: '松下', filings: 61, share: 12 },
      { name: '蜂巢能源', filings: 39, share: 7 },
      { name: '赣锋锂业', filings: 33, share: 6 },
      { name: '比亚迪', filings: 45, share: 8 },
      { name: '其他（示意）', filings: 88, share: 16 },
    ],
    blankSpots: [
      {
        id: 'bs1',
        title: '硫化物电解质界面钝化层原位构筑',
        reason: '竞品多聚焦体相电导率，界面原位钝化权利要求布局稀疏',
        opportunity: '可专利性中高 · 建议立项前调研',
      },
      {
        id: 'bs2',
        title: '干法电极与固态电解质共烧结工艺窗口',
        reason: '工艺参数组合公开少，FTO 风险相对可控',
        opportunity: '工艺专利池潜力 · 建议快速检索验证',
      },
      {
        id: 'bs3',
        title: '柔性固态电解质应力缓冲结构',
        reason: '柔性器件场景专利密度低',
        opportunity: '交叉领域空白 · 可与外观/结构组合布局',
      },
    ],
  },
]

/** 示意数据 · 创新激发 / 发明披露 */
export const INNOVATE_CAMPAIGNS: InnovateCampaign[] = [
  {
    id: 'camp-2026q3-edge-ai',
    name: '2026 Q3 边缘AI专题',
    period: '2026-07-01 ~ 2026-09-30',
    theme: '边缘推理 · 端侧模型压缩 · 感知融合',
    status: '进行中',
    description:
      '面向车载 / 工业边缘场景的发明披露与创新挖掘活动，鼓励跨部门联合披露，优先推送可专利性中高候选进入立项。',
    labeledMock: true,
    candidates: [
      {
        id: 'inv1',
        title: '端侧 Transformer 动态稀疏推理调度方法',
        inventor: '陈思远',
        dept: 'AI 平台部',
        maturity: '原型',
        patentability: '中高',
        hint: '与已知剪枝专利差异在动态调度；建议快速新颖性检索',
      },
      {
        id: 'inv2',
        title: '多传感器边缘融合的时延感知标定装置',
        inventor: '周敏',
        dept: '感知硬件组',
        maturity: '实验室',
        patentability: '高',
        hint: '结构+算法组合权利要求空间较大',
      },
      {
        id: 'inv3',
        title: '低功耗 NPU 上的量化感知训练流水线',
        inventor: '林浩',
        dept: '边缘芯片组',
        maturity: '小试',
        patentability: '中',
        hint: '与开源方案接近，需聚焦芯片特定指令集映射',
      },
      {
        id: 'inv4',
        title: '车载边缘节点的热节流与算力切片协同策略',
        inventor: '王倩',
        dept: '车载电子部',
        maturity: '概念',
        patentability: '待评估',
        hint: '披露材料不足，建议补充实验数据后再评估',
      },
      {
        id: 'inv5',
        title: '边缘侧联邦学习差分隐私噪声自适应注入',
        inventor: '赵磊',
        dept: '安全与隐私组',
        maturity: '实验室',
        patentability: '中高',
        hint: '隐私预算动态分配点可布局方法专利',
      },
    ],
  },
]

/** 示意数据 · 专利布局矩阵（固态电池） */
export const PATENT_LAYOUTS: PatentLayoutDomain[] = [
  {
    id: 'layout-solid-battery',
    name: '固态电池技术树',
    domain: '新能源 · 固态电池',
    summary:
      '按「电解质 / 正极界面 / 工艺」×「材料体系 / 结构 / 制造」矩阵示意已布局、空白与对手密度。',
    labeledMock: true,
    rows: ['电解质', '正极界面', '工艺'],
    cols: ['材料体系', '结构形态', '制造工艺'],
    cells: [
      {
        id: 'lc1',
        row: '电解质',
        col: '材料体系',
        status: 'laid',
        label: '硫化物体相配方',
        note: '我方已布局 12 件，核心族完整',
        ourCount: 12,
        rivalCount: 48,
      },
      {
        id: 'lc2',
        row: '电解质',
        col: '结构形态',
        status: 'blank',
        label: '柔性薄膜电解质夹层',
        note: '公开稀疏，建议补布局',
        ourCount: 0,
        rivalCount: 6,
      },
      {
        id: 'lc3',
        row: '电解质',
        col: '制造工艺',
        status: 'rival_dense',
        label: '湿法涂布窗口',
        note: '对手密度高，FTO 风险需监控',
        ourCount: 2,
        rivalCount: 71,
      },
      {
        id: 'lc4',
        row: '正极界面',
        col: '材料体系',
        status: 'blank',
        label: '原位钝化涂层材料',
        note: '与赛道空白点一致，优先调研',
        ourCount: 1,
        rivalCount: 9,
      },
      {
        id: 'lc5',
        row: '正极界面',
        col: '结构形态',
        status: 'laid',
        label: '梯度界面结构',
        note: '我方布局 5 件，可续族',
        ourCount: 5,
        rivalCount: 22,
      },
      {
        id: 'lc6',
        row: '正极界面',
        col: '制造工艺',
        status: 'blank',
        label: '干法界面共烧结',
        note: '工艺参数空白，建议生成调研案件',
        ourCount: 0,
        rivalCount: 4,
      },
      {
        id: 'lc7',
        row: '工艺',
        col: '材料体系',
        status: 'rival_dense',
        label: '添加剂配方库',
        note: '对手公开密集，以监控为主',
        ourCount: 3,
        rivalCount: 63,
      },
      {
        id: 'lc8',
        row: '工艺',
        col: '结构形态',
        status: 'laid',
        label: '叠片压力均匀化夹具',
        note: '结构专利已布局',
        ourCount: 4,
        rivalCount: 15,
      },
      {
        id: 'lc9',
        row: '工艺',
        col: '制造工艺',
        status: 'blank',
        label: '连续辊压-烧结联线',
        note: '量产工艺空白带，布局建议优先',
        ourCount: 0,
        rivalCount: 8,
      },
    ],
  },
]

/** 示意数据 · 产业链全景 */
export const INDUSTRY_CHAINS: IndustryChain[] = [
  {
    id: 'chain-ev-battery',
    name: '动力/储能电池产业链',
    domain: '新能源装备',
    summary: '材料 → 电芯 → 模组 → 整车/储能，示意各环节主要玩家与公开专利量。',
    labeledMock: true,
    nodes: [
      {
        id: 'n-material',
        name: '材料',
        patents: 420,
        blurb: '正极、负极、电解质、隔膜与导电剂等上游材料。',
        players: [
          { name: '天齐锂业相关公开', patents: 86, role: '锂盐/前驱体' },
          { name: '恩捷股份', patents: 112, role: '隔膜' },
          { name: '贝特瑞', patents: 94, role: '负极材料' },
          { name: '赣锋锂业', patents: 71, role: '锂化合物' },
        ],
      },
      {
        id: 'n-cell',
        name: '电芯',
        patents: 680,
        blurb: '电芯结构、化成工艺、安全与快充相关公开密集。',
        players: [
          { name: '宁德时代', patents: 320, role: '动力电芯' },
          { name: '比亚迪弗迪', patents: 210, role: '刀片电池' },
          { name: 'LGES', patents: 95, role: '软包/圆柱' },
          { name: '松下能源', patents: 55, role: '车载圆柱' },
        ],
      },
      {
        id: 'n-module',
        name: '模组/PACK',
        patents: 310,
        blurb: '热管理、结构连接、BMS 与成组工艺。',
        players: [
          { name: '宁德时代 PACK', patents: 88, role: '成组' },
          { name: '国轩高科', patents: 62, role: '模组' },
          { name: '欣旺达', patents: 54, role: '消费/动力 PACK' },
          { name: '蜂巢能源', patents: 41, role: '短刀模组' },
        ],
      },
      {
        id: 'n-vehicle',
        name: '整车/储能',
        patents: 540,
        blurb: '整车集成、换电、储能系统与电站侧应用。',
        players: [
          { name: '比亚迪汽车', patents: 180, role: '整车集成' },
          { name: '特斯拉', patents: 140, role: '整车/储能' },
          { name: '阳光电源', patents: 78, role: '储能 PCS' },
          { name: '蔚来能源', patents: 52, role: '换电' },
        ],
      },
    ],
  },
]
