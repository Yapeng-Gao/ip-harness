import type { StatusTone } from '../components/ui'

export const OPS_ALERTS_URL = 'http://localhost:5176/config#alerts'

export type AlertRule = {
  id: string
  name: string
  scope: 'train' | 'infer'
  condition: string
  severity: string
  tone: StatusTone
  outbound: string
}

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'ar-gpu',
    name: 'GPU 占用持续偏高',
    scope: 'train',
    condition: 'util > 95% · 持续 10 min（假）',
    severity: 'warn',
    tone: 'warn',
    outbound: 'notify · 未接 SMTP',
  },
  {
    id: 'ar-job',
    name: '训练作业失败',
    scope: 'train',
    condition: 'Job status = failed',
    severity: 'error',
    tone: 'down',
    outbound: 'notify · 未接 Webhook',
  },
  {
    id: 'ar-p95',
    name: '在线推理 p95 超阈',
    scope: 'infer',
    condition: 'p95 > 800 ms',
    severity: 'warn',
    tone: 'warn',
    outbound: 'notify · 未接短信网关',
  },
]

export const ALERT_SCOPE_LABEL = {
  train: '训练',
  infer: '推理',
} as const
