/** 对齐 docs/architecture/landscape/agent-api-shape.md + search SearchHit 子集 */

export type TaxonomyNode = {
  id: string
  parentId: string | null
  name: string
  depth: number
  domain: 'automotive'
  /** 假专利密度 0–100，热力条用 */
  patentDensity: number
}

export type OrgStance = 'leader' | 'challenger' | 'niche' | 'supplier'

export type OrgProfile = {
  id: string
  name: string
  lines: string[]
  stance: OrgStance
  nodeIds: string[]
}

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
  backend: 'mock'
}

/** 预置边（字段表达，无图 DB） */
export type PartOrgEdge = { partNodeId: string; orgId: string }
export type OrgCompetitorEdge = { orgId: string; competitorOrgId: string }
export type NodeInsightEdge = { nodeId: string; insightId: string }

export type PatentBar = { label: string; count: number }

export type NodeExtras = {
  /** 按年假柱 */
  patentByYear: PatentBar[]
  /** 按 IPC 假热力 */
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

export type LandscapeState = {
  domain: 'automotive'
  nodes: TaxonomyNode[]
  orgs: OrgProfile[]
  insights: InsightCard[]
  hits: SearchHit[]
  partOrgEdges: PartOrgEdge[]
  orgCompetitorEdges: OrgCompetitorEdge[]
  nodeInsightEdges: NodeInsightEdge[]
  nodeExtras: Record<string, NodeExtras>
  expandedIds: Set<string>
  selectedNodeId: string | null
  ingestTasks: IngestTask[]
  toast: string | null
}

export const HONESTY_BANNER = '样机 · 汽车种子域 · 无全球实时产业库'

export const SEARCH_DEEPLINK = 'http://localhost:5182'

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

export const DOMAINS = [
  { id: 'automotive', name: '汽车', locked: true, enabled: true },
  { id: 'pharma', name: '医药', locked: false, enabled: false },
  { id: 'semiconductor', name: '半导体', locked: false, enabled: false },
  { id: 'energy', name: '新能源（非汽车）', locked: false, enabled: false },
] as const
