import { APP_DEV_URLS } from '@ip/contracts'

/** 对齐 docs/architecture/landscape/deepen-l1-l4.md + search SearchHit 子集 */

export type GraphVersion = {
  id: string
  label: string
  domain: 'automotive'
}

export type TaxonomyNode = {
  id: string
  parentId: string | null
  name: string
  depth: number
  domain: 'automotive'
  /** 假专利密度 0–100，热力条用 */
  patentDensity: number
  code?: string
  aliases?: string[]
}

/** 规格 TaxNode 别名 */
export type TaxNode = TaxonomyNode

export type OrgStance = 'leader' | 'challenger' | 'niche' | 'supplier'

export type OrgProfile = {
  id: string
  name: string
  lines: string[]
  stance: OrgStance
  nodeIds: string[]
  /** 集团示意（可选） */
  groupId?: string
  /** 持股对象示意（可选） */
  holdingOf?: string
}

export type Org = OrgProfile

export type InsightKind = 'chokepoint' | 'surround' | 'frontier'

export type InsightCard = {
  id: string
  kind: InsightKind
  nodeId: string
  title: string
  body: string
}

/** 对齐 search SearchHit 核心字段 */
export type SearchHit = {
  id: string
  publicationNumber: string
  title: string
  applicant?: string
  date?: string
  ipc?: string[]
  score: number
  snippet?: string
}

/** 统一边联合（含可选 org-standard） */
export type Edge =
  | { type: 'part-org'; partId: string; orgId: string; role?: string }
  | { type: 'org-competitor'; a: string; b: string }
  | { type: 'part-hit'; partId: string; hitId: string }
  | { type: 'node-insight'; nodeId: string; insightId: string }
  | { type: 'org-standard'; orgId: string; standardId: string; relation?: string }

export type LandscapeBackend = 'seed-graph'

export type LandscapeQuery = {
  domain: 'automotive'
  nodeId?: string
  orgId?: string
}

export type LandscapeResponse = {
  query: LandscapeQuery
  tree?: TaxonomyNode[]
  orgs?: OrgProfile[]
  insights?: InsightCard[]
  hits?: SearchHit[]
  edges?: Edge[]
  version?: GraphVersion
  backend: LandscapeBackend
}

export type PatentBar = { label: string; count: number }

export type NodeExtras = {
  patentByYear: PatentBar[]
  patentByIpc: PatentBar[]
  hitIds: string[]
  competitorOrgIds: string[]
}

export type IngestTask = {
  id: string
  source: string
  status: 'idle' | 'running' | 'done'
  progress: number
  note: string
}

export type StandardDoc = {
  id: string
  code: string
  title: string
}

export type LandscapeState = {
  domain: 'automotive'
  version: GraphVersion
  /** 只读切换用的第二标签（不换数据，仅展示） */
  versionId: string
  availableVersions: GraphVersion[]
  nodes: TaxonomyNode[]
  orgs: OrgProfile[]
  edges: Edge[]
  insights: InsightCard[]
  hits: SearchHit[]
  standards: StandardDoc[]
  nodeExtras: Record<string, NodeExtras>
  expandedIds: Set<string>
  selectedNodeId: string | null
  ingestTasks: IngestTask[]
  /** ingest 是否已追加过预置包 */
  ingestAppended: boolean
  toast: string | null
  backend: LandscapeBackend
}

export const HONESTY_BANNER = '样机 · 汽车种子域 · 加深图谱 · 无全球实时产业库'

export const SEARCH_DEEPLINK = APP_DEV_URLS.search

export const STANCE_LABELS: Record<OrgStance, string> = {
  leader: '领先者',
  challenger: '挑战者',
  niche: '利基',
  supplier: '供应商',
}

export const KIND_LABELS: Record<InsightKind, string> = {
  chokepoint: '卡脖子',
  surround: '围剿',
  frontier: '前沿',
}

export const EDGE_TYPE_LABELS: Record<Edge['type'], string> = {
  'part-org': '零件→企业',
  'org-competitor': '企业竞品',
  'part-hit': '零件→文献',
  'node-insight': '节点→洞察',
  'org-standard': '企业→标准',
}

export const DOMAINS = [
  { id: 'automotive', name: '汽车', locked: true, enabled: true },
  { id: 'pharma', name: '医药', locked: false, enabled: false },
  { id: 'semiconductor', name: '半导体', locked: false, enabled: false },
  { id: 'energy', name: '新能源（非汽车）', locked: false, enabled: false },
] as const
