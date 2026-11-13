import type { StatusTone } from '../components/ui'

export type EndpointCard = {
  id: string
  name: string
  model: string
  revision: string
  status: string
  tone: StatusTone
  traffic: string
  qps: string
  p95: string
  note: string
}

export const ENDPOINTS: EndpointCard[] = [
  {
    id: 'ep-claims',
    name: 'claims-draft',
    model: 'claims-draft',
    revision: 'v2.1',
    status: '已发布（示意）',
    tone: 'ok',
    traffic: '100%',
    qps: '12（假）',
    p95: '380 ms（假）',
    note: '网关可消费的「已发布」形状 · 无真推理进程',
  },
  {
    id: 'ep-prior',
    name: 'prior-art-rank',
    model: 'prior-art',
    revision: 'v1.4',
    status: '金丝雀',
    tone: 'info',
    traffic: 'canary 10%',
    qps: '2（假）',
    p95: '640 ms（假）',
    note: '切流为 UI 态 · 不改生产流量',
  },
]

export const ENDPOINT_EMPTY = {
  title: '无未发布草稿端点',
  body: '样机只列「已发布 / 金丝雀」卡片。未接扩缩容、未暴露节点 SSH。',
} as const
