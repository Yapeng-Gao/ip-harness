import { CRITICAL_ALERTS, SERVICE_HEALTH } from './mockMonitor'
import { LICENSE } from './mockConfig'

export const OVERVIEW = {
  env: 'harness-dev',
  envNote: '本机五面 Vite · 非生产',
  alerts: CRITICAL_ALERTS,
  license: LICENSE,
  healthOk: SERVICE_HEALTH.filter((s) => s.tone === 'ok').length,
  healthTotal: SERVICE_HEALTH.length,
  healthLabel: SERVICE_HEALTH.some((s) => s.tone !== 'ok') ? '部分降级' : '正常',
} as const
