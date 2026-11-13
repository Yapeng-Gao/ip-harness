import type {
  ClaimMatrix,
  FtoState,
  ProductFeature,
  RiskAssessment,
  SearchHit,
} from './types'

const MARK = '【示意·非真库】'

/** 策略 A：与 search 共享公开号；id 对齐 search（h01/h02/h03/h15） */
export const SEED_HITS: SearchHit[] = [
  {
    id: 'h01',
    publicationNumber: 'CN115123456A',
    title: '一种固态电解质及其制备方法',
    applicant: '宁德时代新能源科技股份有限公司',
    snippet: '硫化物固态电解质 · 离子电导率',
    familyId: 'fam-battery-solid',
    mockClaims: [
      {
        id: 'c1',
        text: `${MARK} 1. 一种固态电解质，其特征在于包含硫化物骨架与锂盐…`,
      },
      {
        id: 'c2',
        text: `${MARK} 2. 根据权利要求1所述的电解质，其中硫化物为 Li6PS5Cl…`,
      },
    ],
  },
  {
    id: 'h02',
    publicationNumber: 'US20230123456A1',
    title: 'Solid-state electrolyte and preparation thereof',
    applicant: 'Contemporary Amperex Technology Co., Limited',
    snippet: 'sulfide solid-state electrolyte',
    familyId: 'fam-battery-solid',
    mockClaims: [
      {
        id: 'c1',
        text: `${MARK} 1. A solid-state electrolyte comprising a sulfide framework…`,
      },
    ],
  },
  {
    id: 'h03',
    publicationNumber: 'EP4123456A1',
    title: 'Festelektrolyt und Herstellungsverfahren',
    applicant: 'Contemporary Amperex Technology Co., Limited',
    snippet: 'Sulfid-Festelektrolyt',
    familyId: 'fam-battery-solid',
    mockClaims: [
      {
        id: 'c1',
        text: `${MARK} 1. Ein Festelektrolyt, umfassend…`,
      },
    ],
  },
  {
    id: 'h15',
    publicationNumber: 'CN118234567A',
    title: '刀片电池模组热管理系统',
    applicant: '比亚迪股份有限公司',
    snippet: '刀片电池 · 热管理',
    familyId: 'fam-byd-thermal',
    mockClaims: [
      {
        id: 'c1',
        text: `${MARK} 1. 一种电池模组热管理系统，包含液冷板…`,
      },
    ],
  },
]

export const SEED_FEATURES: ProductFeature[] = [
  {
    id: 'feat-1',
    name: '硫化物固态电解质层',
    description: '产品电芯内采用硫化物固态电解质薄膜，提升离子电导率。',
    keywords: ['硫化物', '固态电解质', '离子电导率', 'Li6PS5Cl'],
  },
  {
    id: 'feat-2',
    name: '液冷热管理模组',
    description: '刀片式电芯模组配套液冷板与热失控抑制结构。',
    keywords: ['液冷', '热管理', '刀片电池', '模组'],
  },
  {
    id: 'feat-3',
    name: '界面缓冲涂层',
    description: '电解质与电极界面的柔性缓冲涂层，改善循环稳定性。',
    keywords: ['界面', '涂层', '缓冲', '循环'],
  },
]

export function emptyMatrix(): ClaimMatrix {
  return { cells: [] }
}

export function emptyRisk(): RiskAssessment {
  return {
    byFeature: [],
    byHit: [],
    overall: 'unclear',
    overallOverridden: false,
  }
}

export function createInitialState(): FtoState {
  return {
    projectId: 'proj-fto-demo',
    projectName: '样机项目 · 固态电池电芯 FTO',
    features: SEED_FEATURES.map((f) => ({
      ...f,
      keywords: f.keywords ? [...f.keywords] : undefined,
    })),
    hits: SEED_HITS.map((h) => ({
      ...h,
      mockClaims: h.mockClaims?.map((c) => ({ ...c })),
    })),
    matrix: emptyMatrix(),
    risk: emptyRisk(),
    report: { status: 'draft' },
    toast: null,
    matrixRunning: false,
  }
}
