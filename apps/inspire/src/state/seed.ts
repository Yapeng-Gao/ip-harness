import type { InspireState, SparkCard } from './types'

/** 演示预填技术点 */
export const SEED_PROMPT =
  '硫化物固态电解质界面缓冲层，降低接触阻抗并提升循环寿命'

/** 领域种子：与 batchIndex 组合 */
export const DOMAIN_SEEDS = [
  '消费电子散热',
  '车载热管理',
  '工业边缘推理',
  '医疗可穿戴监测',
  '电网储能调度',
  '卫星通信链路',
  '机器人关节驱动',
  '光伏逆变器',
  '数据中心液冷',
  '农业传感器网络',
  '海洋浮标传感',
  '智慧矿山安监',
] as const

/** 动词 / 场景模板槽位 */
export const VERB_TEMPLATES = [
  '将 {tech} 用于 {domain}',
  '在 {domain} 场景下迁移 {tech}',
  '用 {tech} 改造 {domain} 的瓶颈环节',
  '把 {tech} 与 {domain} 的既有流程拼接',
  '面向 {domain} 的 {tech} 变体方案',
  '以 {tech} 切入 {domain} 的差异化路径',
] as const

export const TITLE_PREFIXES = [
  '跨域钩子',
  '组合灵感',
  '场景迁移',
  '边界漫游',
  '种子拼装',
  '邻域联想',
] as const

export const FAKE_HITS = [
  'CN115123456A',
  'US20230123456A1',
  'CN118234567A',
  'EP4123456A1',
  'WO2023/123456',
  'JP2023-123456A',
] as const

export const TAG_POOL = [
  '跨域',
  '界面',
  '热管理',
  '传感',
  '材料',
  '系统',
  '工艺',
  '可靠性',
] as const

const CARDS_PER_BATCH = 8

function cardId(batchIndex: number, slot: number): string {
  return `spark-b${batchIndex}-s${slot}`
}

/** 诚实扩召：词表/模板槽位 + batchIndex 驱动新集合（新 id / 不同组合） */
export function expandSparks(tech: string, batchIndex: number): SparkCard[] {
  const trimmed = tech.trim()
  if (!trimmed) return []

  const short =
    trimmed.length > 22 ? `${trimmed.slice(0, 22)}…` : trimmed
  const cards: SparkCard[] = []

  for (let slot = 0; slot < CARDS_PER_BATCH; slot++) {
    const domain =
      DOMAIN_SEEDS[(batchIndex * 3 + slot * 2) % DOMAIN_SEEDS.length]!
    const template =
      VERB_TEMPLATES[(batchIndex + slot) % VERB_TEMPLATES.length]!
    const prefix =
      TITLE_PREFIXES[(batchIndex + slot * 3) % TITLE_PREFIXES.length]!
    const hook = template
      .replace('{tech}', short)
      .replace('{domain}', domain)
    const tags = [
      TAG_POOL[(batchIndex + slot) % TAG_POOL.length]!,
      TAG_POOL[(batchIndex + slot * 2 + 1) % TAG_POOL.length]!,
      domain.slice(0, 4),
    ]
    const fakeHit =
      FAKE_HITS[(batchIndex + slot) % FAKE_HITS.length]

    cards.push({
      id: cardId(batchIndex, slot),
      title: `【${prefix}】${domain} × ${short}`,
      hook,
      tags,
      fakeHit,
    })
  }

  return cards
}

export function createInitialState(): InspireState {
  return {
    backend: 'mock',
    prompt: SEED_PROMPT,
    phase: 'idle',
    cards: [],
    cardCatalog: {},
    favorites: [],
    intents: [],
    batchIndex: 0,
    toast: null,
  }
}
