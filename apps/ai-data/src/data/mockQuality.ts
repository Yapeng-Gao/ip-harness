import type { StatusTone } from '../components/ui'

export type QualityRow = {
  id: string
  dataset: string
  score: string
  sensitive: string
  contamination: string
  tone: StatusTone
  note: string
}

export const QUALITY_ROWS: QualityRow[] = [
  {
    id: 'q1',
    dataset: 'claims-sft @ v1.4',
    score: '0.86（假）',
    sensitive: '示意命中 0 · 非真 PII',
    contamination: '低（假）',
    tone: 'ok',
    note: '质量打分 mock · 无真引擎',
  },
  {
    id: 'q2',
    dataset: 'pretrain-mix @ v0.9',
    score: '0.71（假）',
    sensitive: '示意规则命中 · 非真 PII',
    contamination: '中（假）',
    tone: 'warn',
    note: '污染检测为卡片 · 无真扫描',
  },
  {
    id: 'q3',
    dataset: 'pref-dpo @ v0.2',
    score: '—',
    sensitive: '待跑（示意）',
    contamination: '未检',
    tone: 'empty',
    note: '空跑示意 · 标「非真 PII」',
  },
]

export const QUALITY_BANNER =
  '本页全部为示意分数与敏感/污染卡片。样机无真 PII 引擎、不处理真实个人信息。'
