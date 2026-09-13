import type {
  InsightCard,
  IngestTask,
  LandscapeState,
  NodeExtras,
  OrgCompetitorEdge,
  OrgProfile,
  PartOrgEdge,
  SearchHit,
  TaxonomyNode,
} from './types'

function n(
  id: string,
  parentId: string | null,
  name: string,
  depth: number,
  patentDensity: number,
): TaxonomyNode {
  return { id, parentId, name, depth, domain: 'automotive', patentDensity }
}

/** ≥12 节点，含 depth 0/1/2/3 */
export const SEED_NODES: TaxonomyNode[] = [
  n('auto', null, '汽车（整车）', 0, 72),
  n('power', 'auto', '动力系统', 1, 80),
  n('edrive', 'power', '电驱动', 2, 88),
  n('motor', 'edrive', '电机', 3, 85),
  n('inverter', 'edrive', '逆变器', 3, 90),
  n('reducer', 'edrive', '减速器', 3, 70),
  n('thermal', 'power', '热管理', 2, 65),
  n('batt-thermal', 'thermal', '电池热管理', 3, 78),
  n('chassis', 'auto', '底盘', 1, 55),
  n('suspension', 'chassis', '悬架', 2, 48),
  n('brake', 'chassis', '制动', 2, 60),
  n('adas', 'auto', '智能驾驶', 1, 82),
  n('perception', 'adas', '感知', 2, 86),
  n('lidar', 'perception', '激光雷达', 3, 92),
  n('planning', 'adas', '规划控制', 2, 74),
]

export const SEED_ORGS: OrgProfile[] = [
  {
    id: 'org-byd',
    name: '比亚迪',
    lines: ['整车', '刀片电池', '电驱动三合一'],
    stance: 'leader',
    nodeIds: ['auto', 'edrive', 'motor', 'inverter'],
  },
  {
    id: 'org-tesla',
    name: '特斯拉',
    lines: ['整车', '一体化压铸', '自研电驱'],
    stance: 'leader',
    nodeIds: ['auto', 'edrive', 'motor', 'inverter'],
  },
  {
    id: 'org-nio',
    name: '蔚来',
    lines: ['整车', '换电', '智能驾驶'],
    stance: 'challenger',
    nodeIds: ['auto', 'adas', 'perception'],
  },
  {
    id: 'org-xpeng',
    name: '小鹏',
    lines: ['整车', '城市 NG', '激光雷达量产'],
    stance: 'challenger',
    nodeIds: ['auto', 'adas', 'lidar', 'planning'],
  },
  {
    id: 'org-huawei',
    name: '华为智能汽车',
    lines: ['智能驾驶', '鸿蒙座舱', '电驱供应'],
    stance: 'challenger',
    nodeIds: ['adas', 'perception', 'planning', 'edrive'],
  },
  {
    id: 'org-bosch',
    name: '博世',
    lines: ['制动', '电控', '传感器'],
    stance: 'supplier',
    nodeIds: ['brake', 'chassis', 'perception'],
  },
  {
    id: 'org-conti',
    name: '大陆集团',
    lines: ['制动', '轮胎压力', 'ADAS 感知'],
    stance: 'supplier',
    nodeIds: ['brake', 'perception'],
  },
  {
    id: 'org-zf',
    name: '采埃孚',
    lines: ['减速器', '底盘', '转向'],
    stance: 'supplier',
    nodeIds: ['reducer', 'chassis', 'suspension'],
  },
  {
    id: 'org-infineon',
    name: '英飞凌',
    lines: ['SiC 功率器件', '逆变器芯片'],
    stance: 'leader',
    nodeIds: ['inverter'],
  },
  {
    id: 'org-st',
    name: '意法半导体',
    lines: ['功率模块', 'MCU'],
    stance: 'challenger',
    nodeIds: ['inverter'],
  },
  {
    id: 'org-hesai',
    name: '禾赛科技',
    lines: ['车载激光雷达'],
    stance: 'niche',
    nodeIds: ['lidar', 'perception'],
  },
  {
    id: 'org-robosense',
    name: '速腾聚创',
    lines: ['车载激光雷达', '感知软件'],
    stance: 'niche',
    nodeIds: ['lidar', 'perception'],
  },
  {
    id: 'org-valeо',
    name: '法雷奥',
    lines: ['热管理', '感知相机'],
    stance: 'supplier',
    nodeIds: ['thermal', 'batt-thermal', 'perception'],
  },
  {
    id: 'org-denso',
    name: '电装',
    lines: ['热管理', '电控', '传感器'],
    stance: 'supplier',
    nodeIds: ['thermal', 'batt-thermal', 'perception'],
  },
]

export const SEED_HITS: SearchHit[] = [
  {
    id: 'hit-1',
    publicationNumber: 'CN115123456A',
    title: '一种车用永磁同步电机转子结构',
    applicant: '比亚迪股份有限公司',
    date: '2023-08-12',
    ipc: ['H02K1/27', 'B60L15/00'],
    score: 0.92,
    snippet: '公开一种降低齿槽转矩的永磁同步电机转子…',
  },
  {
    id: 'hit-2',
    publicationNumber: 'CN114987654A',
    title: '碳化硅逆变器功率模块封装方法',
    applicant: '英飞凌科技股份公司',
    date: '2022-11-03',
    ipc: ['H01L23/00', 'H02M7/00'],
    score: 0.88,
    snippet: '涉及 SiC 功率模块散热与封装可靠性…',
  },
  {
    id: 'hit-3',
    publicationNumber: 'US20230123456A1',
    title: 'Integrated drive unit with dual inverter',
    applicant: 'Tesla, Inc.',
    date: '2023-04-20',
    ipc: ['B60K1/00', 'H02M7/48'],
    score: 0.85,
    snippet: 'Dual inverter topology for electric drive unit…',
  },
  {
    id: 'hit-4',
    publicationNumber: 'CN116555555A',
    title: '固态激光雷达收发光路校准装置',
    applicant: '禾赛科技股份有限公司',
    date: '2024-01-18',
    ipc: ['G01S7/48', 'G01S17/93'],
    score: 0.9,
    snippet: '用于车载固态激光雷达的光轴校准…',
  },
  {
    id: 'hit-5',
    publicationNumber: 'EP4123456A1',
    title: 'Battery thermal management with segmented cooling',
    applicant: 'Valeo Systemes Thermiques',
    date: '2023-09-01',
    ipc: ['B60H1/00', 'H01M10/60'],
    score: 0.79,
    snippet: 'Segmented liquid cooling plates for EV battery packs…',
  },
  {
    id: 'hit-6',
    publicationNumber: 'CN117888888A',
    title: '城市导航场景下多模态感知融合方法',
    applicant: '广州小鹏汽车科技有限公司',
    date: '2024-03-05',
    ipc: ['G06V20/56', 'B60W60/00'],
    score: 0.83,
    snippet: '摄像头与激光雷达特征级融合用于规划控制…',
  },
  {
    id: 'hit-7',
    publicationNumber: 'WO2023/098765A1',
    title: 'High-ratio planetary reducer for EV drive',
    applicant: 'ZF Friedrichshafen AG',
    date: '2023-06-15',
    ipc: ['F16H1/28', 'B60K17/04'],
    score: 0.76,
    snippet: 'Compact high gear-ratio planetary reducer…',
  },
]

export const SEED_INSIGHTS: InsightCard[] = [

  {
    id: 'ins-cp-edrive',
    kind: 'chokepoint',
    nodeId: 'edrive',
    title: '高功率电驱功率器件供给瓶颈',
    body: '示意：电驱系统级集成依赖高端功率器件与封装产能，短期扩产受限。',
  },
  {
    id: 'ins-fr-edrive',
    kind: 'frontier',
    nodeId: 'edrive',
    title: '油冷扁线电机与碳化硅协同',
    body: '示意：扁线油冷与 SiC 逆变器协同成为下一代电驱效率跃迁方向。',
  },
  {
    id: 'ins-sr-inverter',
    kind: 'surround',
    nodeId: 'inverter',
    title: '逆变器拓扑与驱动芯片专利包围',
    body: '示意：三电平拓扑、栅极驱动与故障保护相关专利形成交叉包围。',
  },
  {
    id: 'ins-cp-1',
    kind: 'chokepoint',
    nodeId: 'inverter',
    title: 'SiC 衬底与外延供给集中',
    body: '示意：高端碳化硅晶圆与外延产能高度集中于少数海外供应商，国产逆变器规模上量时易遇供货瓶颈。',
  },
  {
    id: 'ins-cp-2',
    kind: 'chokepoint',
    nodeId: 'lidar',
    title: '车规级激光器芯片依赖进口',
    body: '示意：905/1550nm 车规激光器与探测器仍大量依赖进口，量产成本与交期受制于海外供应链。',
  },
  {
    id: 'ins-cp-3',
    kind: 'chokepoint',
    nodeId: 'motor',
    title: '高性能稀土磁钢配方与专利墙',
    body: '示意：高剩磁永磁材料配方与热处理工艺专利密集，新进入者易踩到材料配方相关权利要求。',
  },
  {
    id: 'ins-sr-1',
    kind: 'surround',
    nodeId: 'edrive',
    title: '电驱三合一系统专利包围',
    body: '示意：领先整车与供应商在电机-逆变器-减速器集成布局上形成交叉许可与诉讼风险带。',
  },
  {
    id: 'ins-sr-2',
    kind: 'surround',
    nodeId: 'perception',
    title: '感知融合算法权利要求网',
    body: '示意：多传感器时空对齐与目标跟踪相关专利族互相引用，后发者需做精细规避设计。',
  },
  {
    id: 'ins-sr-3',
    kind: 'surround',
    nodeId: 'brake',
    title: '线控制动冗余架构专利网',
    body: '示意：电子液压制动与冗余电源/通信架构上存在密集布局，进入需系统级 FTO。',
  },
  {
    id: 'ins-fr-1',
    kind: 'frontier',
    nodeId: 'planning',
    title: '端到端驾驶策略学习',
    body: '示意：从规则规划向端到端策略网络迁移，公开文献与专利增速快，适合提前布局训练数据与安全验证。',
  },
  {
    id: 'ins-fr-2',
    kind: 'frontier',
    nodeId: 'batt-thermal',
    title: '浸没式与相变复合热管理',
    body: '示意：高倍率快充场景下浸没冷却与相变材料组合成为新热点，标准与测试方法尚在形成中。',
  },
  {
    id: 'ins-fr-3',
    kind: 'frontier',
    nodeId: 'inverter',
    title: '800V+ 平台 SiC 拓扑演进',
    body: '示意：800V 架构普及推动三电平与混合拓扑专利活跃，可与充电桩侧协同布局。',
  },
]

/** 零件→企业 ≥5 */
export const SEED_PART_ORG: PartOrgEdge[] = [
  { partNodeId: 'motor', orgId: 'org-byd' },
  { partNodeId: 'motor', orgId: 'org-tesla' },
  { partNodeId: 'inverter', orgId: 'org-infineon' },
  { partNodeId: 'inverter', orgId: 'org-st' },
  { partNodeId: 'reducer', orgId: 'org-zf' },
  { partNodeId: 'lidar', orgId: 'org-hesai' },
  { partNodeId: 'lidar', orgId: 'org-robosense' },
  { partNodeId: 'brake', orgId: 'org-bosch' },
  { partNodeId: 'batt-thermal', orgId: 'org-valeo' },
]

/** 企业→竞品 ≥5 */
export const SEED_ORG_COMP: OrgCompetitorEdge[] = [
  { orgId: 'org-byd', competitorOrgId: 'org-tesla' },
  { orgId: 'org-tesla', competitorOrgId: 'org-byd' },
  { orgId: 'org-nio', competitorOrgId: 'org-xpeng' },
  { orgId: 'org-xpeng', competitorOrgId: 'org-nio' },
  { orgId: 'org-hesai', competitorOrgId: 'org-robosense' },
  { orgId: 'org-infineon', competitorOrgId: 'org-st' },
  { orgId: 'org-bosch', competitorOrgId: 'org-conti' },
]

/** 节点→洞察 ≥5（由 insights.nodeId 亦可推导；显式边便于计数） */
export const SEED_NODE_INSIGHT: { nodeId: string; insightId: string }[] =
  SEED_INSIGHTS.map((i) => ({ nodeId: i.nodeId, insightId: i.id }))

function extrasFor(
  hitIds: string[],
  competitorOrgIds: string[],
  years: [string, number][],
  ipcs: [string, number][],
): NodeExtras {
  return {
    hitIds,
    competitorOrgIds,
    patentByYear: years.map(([label, count]) => ({ label, count })),
    patentByIpc: ipcs.map(([label, count]) => ({ label, count })),
  }
}

export const SEED_NODE_EXTRAS: Record<string, NodeExtras> = {
  motor: extrasFor(
    ['hit-1', 'hit-3'],
    ['org-byd', 'org-tesla', 'org-huawei'],
    [
      ['2021', 12],
      ['2022', 18],
      ['2023', 24],
      ['2024', 21],
    ],
    [
      ['H02K', 40],
      ['B60L', 22],
      ['H02P', 15],
    ],
  ),
  inverter: extrasFor(
    ['hit-2', 'hit-3'],
    ['org-infineon', 'org-st', 'org-byd', 'org-tesla'],
    [
      ['2021', 20],
      ['2022', 28],
      ['2023', 35],
      ['2024', 32],
    ],
    [
      ['H02M', 45],
      ['H01L', 30],
      ['B60L', 18],
    ],
  ),
  reducer: extrasFor(
    ['hit-7'],
    ['org-zf', 'org-byd'],
    [
      ['2021', 8],
      ['2022', 10],
      ['2023', 14],
      ['2024', 11],
    ],
    [
      ['F16H', 28],
      ['B60K', 16],
    ],
  ),
  lidar: extrasFor(
    ['hit-4', 'hit-6'],
    ['org-hesai', 'org-robosense', 'org-xpeng'],
    [
      ['2021', 15],
      ['2022', 22],
      ['2023', 30],
      ['2024', 27],
    ],
    [
      ['G01S', 50],
      ['G02B', 12],
    ],
  ),
  'batt-thermal': extrasFor(
    ['hit-5'],
    ['org-valeo', 'org-denso'],
    [
      ['2021', 9],
      ['2022', 13],
      ['2023', 17],
      ['2024', 19],
    ],
    [
      ['H01M', 26],
      ['B60H', 14],
    ],
  ),
  perception: extrasFor(
    ['hit-4', 'hit-6'],
    ['org-huawei', 'org-xpeng', 'org-hesai'],
    [
      ['2021', 18],
      ['2022', 25],
      ['2023', 33],
      ['2024', 29],
    ],
    [
      ['G06V', 35],
      ['G01S', 28],
    ],
  ),
  planning: extrasFor(
    ['hit-6'],
    ['org-xpeng', 'org-huawei', 'org-nio'],
    [
      ['2021', 10],
      ['2022', 16],
      ['2023', 22],
      ['2024', 26],
    ],
    [
      ['B60W', 32],
      ['G05D', 18],
    ],
  ),
  edrive: extrasFor(
    ['hit-1', 'hit-2', 'hit-3', 'hit-7'],
    ['org-byd', 'org-tesla', 'org-huawei'],
    [
      ['2021', 30],
      ['2022', 42],
      ['2023', 55],
      ['2024', 50],
    ],
    [
      ['H02K', 40],
      ['H02M', 38],
      ['F16H', 20],
    ],
  ),
  brake: extrasFor(
    [],
    ['org-bosch', 'org-conti'],
    [
      ['2021', 11],
      ['2022', 14],
      ['2023', 16],
      ['2024', 15],
    ],
    [
      ['B60T', 34],
      ['B60W', 10],
    ],
  ),
}

export const SEED_INGEST: IngestTask[] = [
  {
    id: 'ingest-1',
    source: '公开专利公报（示意）',
    status: 'running',
    progress: 42,
    note: '假进度条 · 未接真实爬虫；刷新可失',
  },
]

export function defaultExpanded(): Set<string> {
  return new Set(['auto', 'power', 'edrive', 'adas', 'perception'])
}

export function createInitialState(): LandscapeState {
  return {
    domain: 'automotive',
    nodes: SEED_NODES,
    orgs: SEED_ORGS,
    insights: SEED_INSIGHTS,
    hits: SEED_HITS,
    partOrgEdges: SEED_PART_ORG,
    orgCompetitorEdges: SEED_ORG_COMP,
    nodeInsightEdges: SEED_NODE_INSIGHT,
    nodeExtras: SEED_NODE_EXTRAS,
    expandedIds: defaultExpanded(),
    selectedNodeId: 'edrive',
    ingestTasks: SEED_INGEST,
    toast: null,
  }
}
