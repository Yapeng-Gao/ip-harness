import type { StatusTone } from '../components/ui'

export type ModelVersion = {
  id: string
  version: string
  stage: string
  tone: StatusTone
  metrics: string
  created: string
  note: string
}

export type ModelFamily = {
  id: string
  name: string
  owner: string
  versions: ModelVersion[]
}

export const MODEL_FAMILIES: ModelFamily[] = [
  {
    id: 'mf-claims',
    name: 'claims-draft',
    owner: '算法（示意）',
    versions: [
      {
        id: 'v21',
        version: 'v2.1',
        stage: '生产',
        tone: 'ok',
        metrics: 'eval F1 0.81（假）',
        created: '2026-09-10',
        note: '当前「已发布」指向',
      },
      {
        id: 'v20',
        version: 'v2.0',
        stage: '可回滚',
        tone: 'info',
        metrics: 'eval F1 0.79（假）',
        created: '2026-08-28',
        note: '回滚按钮不切真流量',
      },
      {
        id: 'v22rc',
        version: 'v2.2-rc',
        stage: '评测中',
        tone: 'warn',
        metrics: '门槛未过',
        created: '2026-09-13',
        note: '晋级按钮不写真权重仓',
      },
    ],
  },
]

export const MODEL_EMPTY = {
  title: 'prior-art · 无待晋级版本',
  body: '第二个模型族保持空态，避免假装已有完整注册表。',
} as const
