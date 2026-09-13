/** FTO 消费形状（与 search 对齐子集 + mockClaims） */
export type SearchHit = {
  id: string
  publicationNumber: string
  title: string
  applicant?: string
  snippet?: string
  familyId?: string
  mockClaims?: { id: string; text: string }[]
}

export type ProductFeature = {
  id: string
  name: string
  description: string
  keywords?: string[]
}

export type CellVerdict = '可能覆盖' | '未涉及' | '需人工'

export type MatrixCell = {
  featureId: string
  hitId: string
  verdict: CellVerdict
  claimSnippet?: string
}

export type ClaimMatrix = {
  cells: MatrixCell[]
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'unclear'

export type FeatureRisk = {
  featureId: string
  level: RiskLevel
  overridden: boolean
}

export type HitRisk = {
  hitId: string
  level: RiskLevel
  overridden: boolean
}

export type RiskAssessment = {
  byFeature: FeatureRisk[]
  byHit: HitRisk[]
  overall: RiskLevel
  overallOverridden: boolean
}

export type ReportStatus = 'draft' | 'confirmed'

export type FtoReport = {
  status: ReportStatus
  confirmedAt?: string
}

export type FtoState = {
  projectId: string
  projectName: string
  features: ProductFeature[]
  hits: SearchHit[]
  matrix: ClaimMatrix
  risk: RiskAssessment
  report: FtoReport
  toast: string | null
  matrixRunning: boolean
}

export type FtoReportDraft = {
  projectId: string
  status: ReportStatus
  features: { id: string; name: string }[]
  hits: { id: string; publicationNumber: string; title: string }[]
  overallRisk: RiskLevel
  matrixSummary: string
  disclaimer: '样机·非法律意见'
  backend: 'mock'
}

export const HONESTY_BANNER = '样机 · 无真 FTO 引擎 · 非法律意见'

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  unclear: '不明',
}

export const RISK_ORDER: RiskLevel[] = ['low', 'medium', 'high', 'unclear']

export const SEARCH_DEEPLINK = 'http://localhost:5182'

export const STEPS = [
  { path: '/features', step: 1, label: '产品特征', short: '特征' },
  { path: '/hits', step: 2, label: '检索命中', short: '命中' },
  { path: '/matrix', step: 3, label: '对比矩阵', short: '矩阵' },
  { path: '/risk', step: 4, label: '风险等级', short: '风险' },
  { path: '/report', step: 5, label: '报告 Confirm', short: '报告' },
] as const
