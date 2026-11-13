import type { StatusTone } from '../components/ui'

export type GpuNode = {
  id: string
  name: string
  sku: string
  cards: number
  pool: string
  used: number
  quota: string
  tone: StatusTone
  note: string
}

export const GPU_NODES: GpuNode[] = [
  {
    id: 'gpu-a',
    name: 'gpu-node-a（示意）',
    sku: 'A100 80G',
    cards: 4,
    pool: 'algo-train',
    used: 3,
    quota: '训练配额 60%',
    tone: 'degraded',
    note: '占用为假数字 · 无 nvidia-smi',
  },
  {
    id: 'gpu-b',
    name: 'gpu-node-b（示意）',
    sku: 'A100 80G',
    cards: 4,
    pool: 'infer',
    used: 1,
    quota: '推理配额 40%',
    tone: 'ok',
    note: '空闲示意 · 未编入真节点',
  },
]

export type QuotaRow = {
  id: string
  team: string
  pool: string
  reserved: string
  used: string
  tone: StatusTone
}

export const QUOTAS: QuotaRow[] = [
  { id: 'q1', team: '算法 · 权利要求', pool: 'algo-train', reserved: '4 卡', used: '3 卡（假）', tone: 'degraded' },
  { id: 'q2', team: '平台 · 在线推理', pool: 'infer', reserved: '3 卡', used: '1 卡（假）', tone: 'ok' },
  { id: 'q3', team: '评测批推', pool: 'batch', reserved: '1 卡', used: '0', tone: 'empty' },
]

export const GPU_HONESTY = {
  title: '无真实 GPU 集群',
  body: '节点与配额为 IA 示意。未接 kubelet / device plugin / MIG。不展示假利用率曲线当 live。',
} as const
