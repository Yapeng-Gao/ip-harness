import type { Disclosure, MiningState, SearchHit } from './types'

const MARK = '【示意·非真库】'

/** 策略 A：与 fto / search 共享公开号（对齐键）；id 可壳内不同（mining-h01…） */
export const SEED_HITS: SearchHit[] = [
  {
    id: 'mining-h01',
    publicationNumber: 'CN115123456A',
    title: '一种固态电解质及其制备方法',
    applicant: '宁德时代新能源科技股份有限公司',
    snippet: `${MARK} 硫化物固态电解质 · 离子电导率`,
  },
  {
    id: 'mining-h02',
    publicationNumber: 'US20230123456A1',
    title: 'Solid-state electrolyte and preparation thereof',
    applicant: 'Contemporary Amperex Technology Co., Limited',
    snippet: `${MARK} sulfide solid-state electrolyte`,
  },
  {
    id: 'mining-h03',
    publicationNumber: 'CN118234567A',
    title: '刀片电池模组热管理系统',
    applicant: '比亚迪股份有限公司',
    snippet: `${MARK} 刀片电池 · 热管理`,
  },
  {
    id: 'mining-h04',
    publicationNumber: 'EP4123456A1',
    title: 'Festelektrolyt und Herstellungsverfahren',
    applicant: 'Contemporary Amperex Technology Co., Limited',
    snippet: `${MARK} Sulfid-Festelektrolyt`,
  },
]

export const SEED_DISCLOSURE: Disclosure = {
  background:
    '现有固态电池电芯在硫化物电解质与电极界面处易产生阻抗升高，循环寿命受限；同时刀片式模组热管理对界面稳定性提出更高要求。',
  techPoints:
    '1. 在硫化物固态电解质层与正极之间增设柔性缓冲涂层，改善界面接触。\n2. 采用分段式液冷板结构，针对刀片电芯高热区局部强化散热。\n3. 电解质配方中引入微量掺杂剂以提升室温离子电导率。',
  effects:
    '降低界面阻抗、延长循环寿命；改善热失控前兆温升；室温电导率示意提升。本段为样机交底种子，非真实技术秘密。',
  relatedHitIds: ['mining-h01', 'mining-h03'],
}

export function emptyDisclosure(): Disclosure {
  return {
    background: '',
    techPoints: '',
    effects: '',
    relatedHitIds: [],
  }
}

export function createInitialState(): MiningState {
  return {
    project: {
      id: 'proj-mining-demo',
      name: '样机项目 · 固态电池交底挖掘',
    },
    disclosure: {
      ...SEED_DISCLOSURE,
      relatedHitIds: [...SEED_DISCLOSURE.relatedHitIds],
    },
    candidates: [],
    scores: [],
    intents: [],
    hits: SEED_HITS.map((h) => ({ ...h })),
    toast: null,
    generating: false,
    scoreSortDesc: true,
  }
}
