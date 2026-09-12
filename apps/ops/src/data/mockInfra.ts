import type { StatusTone } from '../components/ui'

export type HostRow = {
  id: string
  name: string
  role: string
  cpu: string
  mem: string
  tone: StatusTone
}

export const HOSTS: HostRow[] = [
  { id: 'h1', name: 'box-dev-01', role: 'Vite 宿主（五面）', cpu: '18%', mem: '41%', tone: 'ok' },
  { id: 'h2', name: 'box-dev-02', role: '预留（未编入）', cpu: '—', mem: '—', tone: 'empty' },
]

export const GPU_EMPTY = {
  title: '无 GPU 集群',
  body: '未接 GPU / 调度器。本页不展示假利用率曲线。',
} as const

export type ContainerRow = {
  id: string
  name: string
  image: string
  status: string
  tone: StatusTone
}

export const CONTAINERS: ContainerRow[] = [
  { id: 'ct-mid', name: 'ip-mid', image: 'vite:5173', status: '本机 dev（示意）', tone: 'ok' },
  { id: 'ct-wb', name: 'ip-workbench', image: 'vite:5174', status: '本机 dev（示意）', tone: 'ok' },
  { id: 'ct-ag', name: 'ip-agent', image: 'vite:5175', status: '本机 dev（示意）', tone: 'ok' },
  { id: 'ct-ops', name: 'ip-ops', image: 'vite:5176', status: '本页', tone: 'ok' },
]

export const DATA_PLANE = [
  { id: 'db', name: 'DB', detail: '无真实 Postgres · 内存/localStorage', tone: 'ok' as StatusTone },
  { id: 'obj', name: '对象存储', detail: '未接 S3/OSS · 无桶列表', tone: 'empty' as StatusTone },
  { id: 'q', name: '队列', detail: '未接 broker · 监控页为 mock 降级', tone: 'degraded' as StatusTone },
]

export const BACKUP_DRILL = {
  lastAt: '2026-09-01',
  result: '演练通过（纸面）',
  note: '未对真实库做备份/恢复。仅 runbook 占位。',
} as const

export const CERTS = [
  { id: 'cert-1', name: 'ops.local (dev)', expires: '2026-12-01', days: 80, tone: 'ok' as StatusTone },
  { id: 'cert-2', name: 'mid.local (dev)', expires: '2026-10-03', days: 21, tone: 'warn' as StatusTone },
  { id: 'cert-3', name: 'prod 通配（未签发）', expires: '—', days: null, tone: 'empty' as StatusTone },
]
