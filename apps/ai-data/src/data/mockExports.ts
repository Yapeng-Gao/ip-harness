import type { StatusTone } from '../components/ui'

export type ExportOrder = {
  id: string
  title: string
  from: string
  status: string
  tone: StatusTone
  requested: string
  note: string
}

export const EXPORT_ORDERS: ExportOrder[] = [
  {
    id: 'exp-101',
    title: '导出单 · EXP-101',
    from: '办案侧申请（示意）',
    status: '已脱敏（假）',
    tone: 'ok',
    requested: '2026-09-11',
    note: '无案正文 · 无 PatentCase 主键业务态',
  },
  {
    id: 'exp-102',
    title: '导出单 · EXP-102',
    from: '办案侧申请（示意）',
    status: '审批中（示意）',
    tone: 'warn',
    requested: '2026-09-13',
    note: '不接 DomainCommand · 仅列表形状',
  },
]

export const EXPORT_EMPTY = {
  title: '无更多导出单',
  body: '样机只展示假导出单卡片；不读取案卷、不落湖。',
} as const
