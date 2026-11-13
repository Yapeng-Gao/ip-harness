import type { StatusTone } from '../components/ui'

export type DatasetRow = {
  id: string
  name: string
  purpose: string
  versions: { tag: string; tone: StatusTone; note: string }[]
  rows: string
  updated: string
  note: string
}

export const DATASETS: DatasetRow[] = [
  {
    id: 'ds-claims-sft',
    name: 'claims-sft',
    purpose: 'SFT',
    versions: [
      { tag: 'v1.4', tone: 'ok', note: '当前发布（假）' },
      { tag: 'v1.3', tone: 'info', note: '可回退标签' },
      { tag: 'v1.5-rc', tone: 'warn', note: '门禁中' },
    ],
    rows: '12.4k（假）',
    updated: '2026-09-12',
    note: 'version 标签可见 · 无对象存储',
  },
  {
    id: 'ds-pretrain-mix',
    name: 'pretrain-mix',
    purpose: '预训练',
    versions: [
      { tag: 'v0.9', tone: 'ok', note: '当前发布（假）' },
      { tag: 'v0.8', tone: 'empty', note: '归档示意' },
    ],
    rows: '2.1M（假）',
    updated: '2026-09-11',
    note: '配比切片见 /recipes',
  },
  {
    id: 'ds-pref-dpo',
    name: 'pref-dpo',
    purpose: '偏好',
    versions: [{ tag: 'v0.2', tone: 'info', note: '评测中' }],
    rows: '3.8k（假）',
    updated: '2026-09-09',
    note: '无真偏好对落盘',
  },
  {
    id: 'ds-eval-hard',
    name: 'eval-hard',
    purpose: '评测',
    versions: [
      { tag: 'v2.0', tone: 'ok', note: '当前发布（假）' },
      { tag: 'v1.9', tone: 'info', note: '基线' },
    ],
    rows: '860（假）',
    updated: '2026-09-10',
    note: '供 ai-infra 消费形状 · 未真推送',
  },
]
