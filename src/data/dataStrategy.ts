/** 数据策略 · 早期商业 API → 后期自建数据湖（全部示意，未接真实接口） */

export type ProviderStatus = '已对接示意' | '可配置' | '规划中'

export interface CommercialProvider {
  id: string
  name: string
  vendor: string
  status: ProviderStatus
  syncCadence: string
  coverage: string[]
  lastSync: string
  hitCountHint: string
  blurb: string
  badge: string
}

export const COMMERCIAL_PROVIDERS: CommercialProvider[] = [
  {
    id: 'patsnap',
    name: '智慧芽 PatSnap API',
    vendor: '智慧芽',
    status: '已对接示意',
    syncCadence: '每日增量 · 全量周更',
    coverage: ['CN', 'US', 'EP', 'WO'],
    lastSync: '2026-09-10 22:15',
    hitCountHint: '示意缓存 ~128 万条（固态电池相关切片）',
    blurb: '商业专利检索与家族分析 API · 原型仅展示对接形态，无真实调用',
    badge: '商业API·PatSnap示意',
  },
  {
    id: 'incopat',
    name: 'IncoPat',
    vendor: '合享智慧',
    status: '已对接示意',
    syncCadence: '每日增量',
    coverage: ['CN', 'US', 'EP', 'WO', 'JP'],
    lastSync: '2026-09-11 01:40',
    hitCountHint: '示意缓存 ~96 万条',
    blurb: '中文检索体验优秀的商业库 · 调研命中卡片默认徽章',
    badge: '商业API·IncoPat示意',
  },
  {
    id: 'questel',
    name: 'Questel Orbit API',
    vendor: 'Questel',
    status: '可配置',
    syncCadence: '可配置 · 建议每日',
    coverage: ['US', 'EP', 'WO', 'CN'],
    lastSync: '—',
    hitCountHint: '未启用',
    blurb: '全球专利分析 · 可在设置中填写示意凭证（不会真实请求）',
    badge: '商业API·Questel示意',
  },
  {
    id: 'google-patents',
    name: 'Google Patents Public',
    vendor: 'Google',
    status: '可配置',
    syncCadence: '按需拉取（示意）',
    coverage: ['US', 'EP', 'WO', 'CN'],
    lastSync: '2026-09-08 14:00',
    hitCountHint: '公开页面解析示意',
    blurb: '公开专利页 · 仅作补充来源示意，非正式商业授权',
    badge: '公开源·Google示意',
  },
]

export interface LakeRoadmapStep {
  id: string
  name: string
  description: string
  progress: number
  status: '已完成示意' | '进行中' | '未开始'
}

export const LAKE_ROADMAP: LakeRoadmapStep[] = [
  {
    id: 'collect',
    name: '采集',
    description: '多源专利元数据 / 全文 / 法律状态增量采集管道',
    progress: 35,
    status: '进行中',
  },
  {
    id: 'clean',
    name: '清洗',
    description: '归一化公开号、申请人消歧、IPC 映射与去重',
    progress: 18,
    status: '进行中',
  },
  {
    id: 'legal',
    name: '法律状态',
    description: '审查历程、权利状态、年费与诉讼事件对齐',
    progress: 8,
    status: '未开始',
  },
  {
    id: 'vector',
    name: '自有向量检索',
    description: '说明书 / 权利要求向量化与语义检索服务',
    progress: 5,
    status: '未开始',
  },
]

export type DataSourceMode = 'commercial_api' | 'own_lake'

export const DATA_SOURCE_MODE_LABELS: Record<DataSourceMode, string> = {
  commercial_api: '商业API（当前）',
  own_lake: '自建数据湖（规划）',
}
