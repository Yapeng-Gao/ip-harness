/** Prefill data for demo cases in workbench flows — must match each case's tech */

export const researchSeed: Record<
  string,
  {
    keywords: string
    ipc: string
    dateFrom: string
    dateTo: string
    databases: string[]
    novelty: number
    inventiveness: number
    conclusion: string
    ftoChecks: Record<string, boolean>
    ftoRisk: '低' | '中' | '高'
    searchResults: {
      id: string
      title: string
      pubNo: string
      url: string
      assignee: string
      date: string
      ipc: string
      relevance: string
      abstract: string
      noveltyDelta: number
      apiSource: string
    }[]
  }
> = {
  c2: {
    keywords: '固态电解质 硫化物 离子电导率 界面稳定性',
    ipc: 'H01M10/0562; H01M10/052',
    dateFrom: '2018-01-01',
    dateTo: '2026-09-01',
    databases: ['CNIPA', 'USPTO', 'EPO', 'WIPO'],
    novelty: 72,
    inventiveness: 68,
    conclusion: '可申请',
    ftoChecks: {
      claimOverlap: false,
      activePatents: true,
      designAround: true,
      licenseNeeded: false,
      litigationHistory: false,
    },
    ftoRisk: '中',
    searchResults: [
      {
        id: 'r1',
        title: '一种硫化物固态电解质及其制备方法',
        pubNo: 'CN117165222B',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN117165222B',
        assignee: '宁德时代新能源科技股份有限公司',
        date: '2024-11-08',
        ipc: 'H01M10/0562',
        relevance: '高相关',
        abstract: '【示意·基于公开信息改编】公开硫化物固态电解质掺杂体系及界面钝化层构筑方法，提升循环稳定性…',
        noveltyDelta: -12,
        apiSource: '商业API·IncoPat示意',
      },
      {
        id: 'r2',
        title: 'Solid electrolyte composition and all-solid-state battery',
        pubNo: 'WO2023207578A1',
        url: 'https://patents.google.com/patent/WO2023207578A1',
        assignee: '丰田自动车株式会社',
        date: '2023-11-02',
        ipc: 'H01M10/0562',
        relevance: '中相关',
        abstract: '【示意】A sulfide-based solid electrolyte with improved ionic conductivity and electrode interface…',
        noveltyDelta: -6,
        apiSource: '商业API·PatSnap示意',
      },
      {
        id: 'r3',
        title: '氧化物固态电解质与正极界面原位钝化',
        pubNo: 'CN116487712A',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN116487712A',
        assignee: '卫蓝新能源科技有限公司',
        date: '2023-07-25',
        ipc: 'H01M10/0562',
        relevance: '高相关',
        abstract: '【示意·改编】涉及氧化物电解质表面原位钝化涂层及制备工艺窗口…',
        noveltyDelta: -10,
        apiSource: '商业API·IncoPat示意',
      },
      {
        id: 'r4',
        title: '干法电极与固态电解质共烧结工艺',
        pubNo: 'CN115911541A',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN115911541A',
        assignee: '清陶（昆山）能源发展股份有限公司',
        date: '2023-04-04',
        ipc: 'H01M10/058',
        relevance: '中相关',
        abstract: '【示意】干法电极与硫化物电解质共烧结温度—压力工艺窗口…',
        noveltyDelta: -5,
        apiSource: '商业API·IncoPat示意',
      },
      {
        id: 'r5',
        title: '高离子电导率硫银锗矿型固态电解质',
        pubNo: 'CN116014218A',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN116014218A',
        assignee: '蜂巢能源科技股份有限公司',
        date: '2023-04-25',
        ipc: 'H01M10/0562',
        relevance: '中相关',
        abstract: '【示意】多层复合固态电解质结构及离子电导率优化…',
        noveltyDelta: -5,
        apiSource: '商业API·PatSnap示意',
      },
      {
        id: 'r6',
        title: '锂金属负极配套固态电解质界面层',
        pubNo: 'CN115692819A',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN115692819A',
        assignee: '赣锋锂业集团股份有限公司',
        date: '2023-02-03',
        ipc: 'H01M10/0562',
        relevance: '低相关',
        abstract: '【示意】锂金属负极侧界面缓冲层材料体系…',
        noveltyDelta: -2,
        apiSource: '商业API·IncoPat示意',
      },
      {
        id: 'r7',
        title: '硫化物固体电解质材料及全固态电池',
        pubNo: 'JP2023189012A',
        url: 'https://patents.google.com/patent/JP2023189012A',
        assignee: '松下控股株式会社',
        date: '2023-12-20',
        ipc: 'H01M10/0562',
        relevance: '中相关',
        abstract: '【示意】硫银锗矿型硫化物电解质的表面包覆改性…',
        noveltyDelta: -7,
        apiSource: '商业API·Questel示意',
      },
      {
        id: 'r8',
        title: '磷酸盐复合固态电解质及二次电池',
        pubNo: 'CN117293384A',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN117293384A',
        assignee: '比亚迪股份有限公司',
        date: '2024-01-16',
        ipc: 'H01M10/0562',
        relevance: '低相关',
        abstract: '【示意】磷酸盐基复合电解质与磷酸铁锂正极匹配…',
        noveltyDelta: -3,
        apiSource: '商业API·IncoPat示意',
      },
    ],
  },
  c8: {
    keywords: '大模型 推理 缓存 预取 KV Cache',
    ipc: 'G06F12/08; G06N3/063',
    dateFrom: '2020-01-01',
    dateTo: '2026-09-01',
    databases: ['CNIPA', 'USPTO', 'arXiv'],
    novelty: 55,
    inventiveness: 60,
    conclusion: '有条件可申请',
    ftoChecks: {
      claimOverlap: true,
      activePatents: true,
      designAround: false,
      licenseNeeded: true,
      litigationHistory: false,
    },
    ftoRisk: '高',
    searchResults: [
      {
        id: 'r1',
        title: '面向大模型推理的分层 KV Cache 管理方法',
        pubNo: 'CN117112456A',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN117112456A',
        assignee: '华为技术有限公司',
        date: '2023-11-21',
        ipc: 'G06F12/08',
        relevance: '高相关',
        abstract: '【示意】公开了一种按注意力热度分层管理 KV Cache 的方法…',
        noveltyDelta: -15,
        apiSource: '商业API·IncoPat示意',
      },
      {
        id: 'r2',
        title: 'Prefetching mechanism for transformer inference',
        pubNo: 'US20240111678A1',
        url: 'https://patents.google.com/patent/US20240111678A1',
        assignee: 'Google LLC',
        date: '2024-04-04',
        ipc: 'G06F12/08',
        relevance: '高相关',
        abstract: '【示意】Speculative prefetch of key-value tensors for LLM serving…',
        noveltyDelta: -12,
        apiSource: '商业API·PatSnap示意',
      },
      {
        id: 'r3',
        title: '推理服务缓存淘汰策略',
        pubNo: 'CN116861234A',
        url: 'https://epub.cnipa.gov.cn/Detail?pub=CN116861234A',
        assignee: '阿里云计算有限公司',
        date: '2023-10-10',
        ipc: 'G06F12/08',
        relevance: '中相关',
        abstract: '【示意】基于请求到达模式的缓存淘汰与预取协同…',
        noveltyDelta: -7,
        apiSource: '商业API·IncoPat示意',
      },
      {
        id: 'r4',
        title: 'GPU memory pooling for model serving',
        pubNo: 'WO2024012345A1',
        url: 'https://patents.google.com/patent/WO2024012345A1',
        assignee: 'NVIDIA Corporation',
        date: '2024-01-18',
        ipc: 'G06F12/02',
        relevance: '低相关',
        abstract: '【示意】Memory pool sharing across inference workers…',
        noveltyDelta: -3,
        apiSource: '公开源·Google示意',
      },
    ],
  },
}

/** Legacy export for older imports */
export const mockSearchResults = researchSeed.c2.searchResults

export const intakeSeed: Record<
  string,
  {
    inventors: string
    techSolution: string
    scenario: string
    disclosureRiskDate: string
    techScore: number
    bizScore: number
    budget: string
    quote: string
  }
> = {
  c5: {
    inventors: '孙启明、李婉清、张博',
    techSolution:
      '基于物理约束的对抗式仿真数据增强方法，通过可微渲染与动力学约束生成长尾驾驶场景，提升感知模型在极端工况下的召回率。',
    scenario: 'L3/L4 自动驾驶训练数据闭环、仿真平台、车企数据工厂',
    disclosureRiskDate: '2026-11-30',
    techScore: 4,
    bizScore: 3,
    budget: '18 万（含撰写+首年官费）',
    quote: '接案撰写费 2.8 万 + 官费代缴 + 后续 OA 按次计费',
  },
  c2: {
    inventors: '王晓彤、赵磊',
    techSolution:
      '硫化物固态电解质新型配方，通过界面包覆与组分优化兼顾离子电导率与循环稳定性，适用于全固态动力电池。',
    scenario: '动力电池电芯、储能固态电池模组',
    disclosureRiskDate: '2026-12-15',
    techScore: 4,
    bizScore: 4,
    budget: '22 万',
    quote: '接案撰写费 3.2 万 + 实验数据补充支持',
  },
  c8: {
    inventors: '韩雪、周宁',
    techSolution:
      '面向 LLM 推理服务的分层缓存与智能预取机制，降低首 token 延迟并提升吞吐。',
    scenario: '云端大模型推理平台、私有化推理集群',
    disclosureRiskDate: '2027-01-10',
    techScore: 3,
    bizScore: 4,
    budget: '16 万',
    quote: '接案撰写费 2.5 万 + 软件类申请说明',
  },
}

export function intakeDefaultsFromCase(c: {
  inventor: string
  summary: string
  title: string
}): (typeof intakeSeed)[string] {
  return {
    inventors: c.inventor,
    techSolution: c.summary,
    scenario: `与「${c.title}」相关的产品与产线场景`,
    disclosureRiskDate: '2026-12-31',
    techScore: 3,
    bizScore: 3,
    budget: '15 万（含撰写+首年官费）',
    quote: '接案撰写费 2.5 万 + 官费代缴',
  }
}

export const draftSeed: Record<
  string,
  {
    field: string
    background: string
    invention: string
    embodiment: string
    claims: { id: string; type: '独立' | '从属'; text: string; dependsOn?: string }[]
    countries: string[]
    pct: boolean
    priority: string
  }
> = {
  c4: {
    field: '物联网通信；无线 Mesh 网络路由协议',
    background:
      '现有 BLE Mesh 在大规模节点下端到端延迟高、能耗不均衡，缺乏基于链路质量与剩余能量的自适应路由机制。',
    invention:
      '提出一种面向大规模传感器网络的自适应 Mesh 路由方法，综合链路质量、跳数与节点剩余能量进行路径选择，并支持局部快速修复。',
    embodiment:
      '实施例一：在 500 节点仓库传感器网络中部署；实施例二：与标准 Friend/LPN 模式兼容的低功耗变体。',
    claims: [
      {
        id: 'cl1',
        type: '独立',
        text: '一种低功耗蓝牙 Mesh 路由方法，其特征在于，包括：获取邻居节点链路质量与剩余能量；根据综合代价函数选择下一跳；在链路失效时触发局部路径修复。',
      },
      {
        id: 'cl2',
        type: '从属',
        dependsOn: '1',
        text: '根据权利要求1所述的方法，其中综合代价函数为链路质量、跳数与剩余能量的加权和。',
      },
      {
        id: 'cl3',
        type: '从属',
        dependsOn: '1',
        text: '根据权利要求1所述的方法，其中局部路径修复在两跳范围内完成且不广播全网拓扑更新。',
      },
      {
        id: 'cl4',
        type: '独立',
        text: '一种实现权利要求1所述方法的物联网节点装置，包括射频模块、路由决策模块与能量监测模块。',
      },
    ],
    countries: ['CN', 'US', 'EP'],
    pct: true,
    priority: '拟主张中国在先申请优先权',
  },
  c10: {
    field: '区块链；跨链原子交换；智能合约',
    background:
      '现有跨链桥方案存在托管风险与异构资产证明不统一问题，难以在多链间实现可信原子交换。',
    invention:
      '提出支持多链异构资产原子交换的智能合约框架与证明机制，通过哈希时间锁与轻客户端验证保证原子性。',
    embodiment:
      '实施例一：ETH–BSC 资产互换；实施例二：含监管白名单的机构版合约变体。',
    claims: [
      {
        id: 'cl1',
        type: '独立',
        text: '一种跨链原子交换方法，其特征在于，包括：在源链锁定资产并生成证明；在目标链验证证明后释放对应资产；超时则自动退回。',
      },
      {
        id: 'cl2',
        type: '从属',
        dependsOn: '1',
        text: '根据权利要求1所述的方法，其中证明为轻客户端可验证的状态承诺。',
      },
    ],
    countries: ['CN', 'US'],
    pct: false,
    priority: '无在先优先权',
  },
}

export function draftDefaultsFromCase(c: {
  title: string
  summary: string
}): (typeof draftSeed)[string] {
  return {
    field: c.title,
    background: `现有技术在「${c.title}」相关领域仍存在不足。`,
    invention: c.summary,
    embodiment: '实施例一：典型部署场景；实施例二：变体实现。',
    claims: [
      {
        id: 'cl1',
        type: '独立',
        text: `一种与「${c.title}」相关的方法，其特征在于，包括实现所述技术方案的关键步骤。`,
      },
    ],
    countries: ['CN'],
    pct: false,
    priority: '待确认',
  }
}

export const prosecutionSeed: Record<
  string,
  {
    oaDate: string
    deadline: string
    oaType: string
    issues: {
      id: string
      type: string
      claimRefs: string
      examinerView: string
      strategy: string
      response: string
    }[]
    claimOriginal: string
    claimAmended: string
    feeReminder: string
  }
> = {
  c1: {
    oaDate: '2026-08-12',
    deadline: '2026-09-28',
    oaType: '第一次审查意见通知书',
    issues: [
      {
        id: 'i1',
        type: '创造性',
        claimRefs: '权利要求 1、3',
        examinerView:
          '对比文件1已公开基于负载的边缘节点调度，本领域技术人员容易想到结合能耗约束。',
        strategy: '缩限+论证',
        response:
          '将权利要求1限定为「负载预测模型输出与能耗阈值的联合优化」，并补充实验数据证明非显而易见的吞吐提升。',
      },
      {
        id: 'i2',
        type: '清楚性',
        claimRefs: '权利要求 5',
        examinerView: '「动态阈值」含义不清楚。',
        strategy: '澄清修改',
        response: '将「动态阈值」修改为「根据节点实时功耗与温升阈值计算的可调度窗口」。',
      },
    ],
    claimOriginal:
      '1. 一种边缘计算节点调度方法，其特征在于，根据负载预测结果对边缘节点进行动态调度。\n3. 根据权利要求1所述的方法，其中调度还考虑能耗约束。',
    claimAmended:
      '1. 一种边缘计算节点调度方法，其特征在于，包括：获取边缘节点的历史负载序列并输入负载预测模型；根据预测负载与各节点实时功耗、温升约束，求解联合优化目标以确定调度方案；按所述调度方案迁移计算任务。\n3. 根据权利要求1所述的方法，其中所述联合优化目标为最大化集群吞吐且满足各节点能耗上限。',
    feeReminder: '答复官费约 0（期限内）；超期恢复额外费用；代理答复撰写费待确认',
  },
  c7: {
    oaDate: '2026-09-01',
    deadline: '2026-10-05',
    oaType: '补正通知书',
    issues: [
      {
        id: 'i1',
        type: '形式缺陷',
        claimRefs: '说明书附图',
        examinerView: '附图标记与说明书描述不一致。',
        strategy: '澄清修改',
        response: '统一附图标记与说明书对应关系，补正请求书附件。',
      },
    ],
    claimOriginal: '（实用新型）分布式数据库一致性校验装置相关权利要求原文。',
    claimAmended: '（实用新型）补正后权利要求：明确在线增量校验模块与分片协调模块的连接关系。',
    feeReminder: '补正期限内无额外官费',
  },
}

/** Maintain 年费日程行（Inbox SLA / MaintainFlow 同源） */
export type MaintainSeedScheduleRow = {
  id: string
  year: number
  due: string
  amount: string
  paid: boolean
  officialFee?: number
  label?: string
}

export const maintainSeed = {
  c6: {
    status: '有效',
    grantDate: '2026-03-01',
    nextAnnuity: '2027-03-01',
    annuityYear: 2,
    amount: '600 元',
    changes: [{ id: 'ch1', type: '专利权人名称变更', date: '', detail: '' }],
    schedule: [
      {
        id: 'ms1',
        year: 1,
        due: '2026-03-01',
        amount: '600 元',
        paid: true,
        officialFee: 600,
      },
      {
        id: 'ms2',
        year: 2,
        due: '2027-03-01',
        amount: '600 元',
        paid: false,
        officialFee: 600,
      },
      /** 日程洞：Maintain 有、Docket 无同 due 年费事件 → Inbox 补洞 */
      {
        id: 'ms-gap',
        year: 5,
        due: '2026-09-10',
        amount: '2,000 元',
        paid: false,
        officialFee: 2000,
        label: '跨年补记·日程洞',
      },
    ] as MaintainSeedScheduleRow[],
  },
}

export const monetizeSeed: Record<
  string,
  {
    path: '自行实施' | '许可' | '转让' | '作价入股' | '维权诉讼'
    counterpart: string
    territory: string
    exclusivity: string
    royalty: string
    termYears: string
    paymentSchedule: string
    fieldLimit: string
    milestones: { id: string; label: string; due: string; done: boolean }[]
  }
> = {
  c3: {
    path: '许可',
    counterpart: '华东某智能装备有限公司',
    territory: '中国大陆',
    exclusivity: '独占许可（产线检测设备领域）',
    royalty: '入门费 120 万 + 销售额 3%',
    termYears: '5 年（可续期）',
    paymentSchedule: '签约 30 日内支付入门费；分成按季度结算',
    fieldLimit: '工业视觉缺陷检测设备及产线集成',
    milestones: [
      { id: 'm1', label: '签署正式协议', due: '2026-10-15', done: false },
      { id: 'm2', label: '首条试点线验收', due: '2026-12-01', done: false },
      { id: 'm3', label: '备案完成', due: '2027-01-15', done: false },
    ],
  },
  c11: {
    path: '作价入股',
    counterpart: '某柔性显示合资公司',
    territory: '中国大陆及东南亚',
    exclusivity: '作价入股对应专利包独占实施',
    royalty: '估值 2800 万，折股 12%',
    termYears: '与合资期限一致',
    paymentSchedule: '交割时完成股权登记',
    fieldLimit: '柔性显示弯折结构及相关模组',
    milestones: [
      { id: 'm1', label: '完成尽调', due: '2026-10-01', done: true },
      { id: 'm2', label: '签署增资协议', due: '2026-11-20', done: false },
      { id: 'm3', label: '股权交割', due: '2026-12-31', done: false },
    ],
  },
}

export const watchSeed: Record<
  string,
  {
    keywords: string
    competitors: string
    rules: { id: string; name: string; enabled: boolean; threshold: string }[]
    alerts: {
      id: string
      title: string
      level: string
      status: string
      note: string
      agencyOpinion: string
      enterpriseDecision: string
      openedAt?: string
      slaDue?: string
    }[]
  }
> = {
  c9: {
    keywords: '无人机 集群 协同避障 编队 冲突解脱',
    competitors: '大疆、Autel、某军工研究所',
    rules: [
      { id: 'wr1', name: '竞品新公开', enabled: true, threshold: '标题/摘要命中 ≥2 关键词' },
      { id: 'wr2', name: '近似权利要求', enabled: true, threshold: '独权相似度 > 70%' },
      { id: 'wr3', name: '侵权线索', enabled: false, threshold: '产品参数匹配告警' },
    ],
    alerts: [
      {
        id: 'al1',
        title: '发现近似公开案 CN202610998877.1',
        level: '高',
        status: '待处理',
        note: '权利要求1与我方独权结构相似，建议启动对比意见',
        agencyOpinion: '建议出具权利要求对比表，评估无效/侵权双路径。',
        enterpriseDecision: '',
        openedAt: '2026-08-28',
        /** Wave2 SlaInbox · 超 SLA 演示种子 */
        slaDue: '2026-09-05',
      },
      {
        id: 'al2',
        title: '竞品产品发布含「协同避障」宣传',
        level: '中',
        status: '处理中',
        note: '已取证网页，待技术比对',
        agencyOpinion: '已保全宣传页与产品手册，待企业确认是否升级。',
        enterpriseDecision: '',
        openedAt: '2026-09-08',
        slaDue: '2026-09-20',
      },
    ],
  },
}
