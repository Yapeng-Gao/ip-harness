/** 样机诚实白名单 + 严重度口径 */

import type { CheapSignal, FindingSeverity } from './types.js'

/** 文案含下列 token 时默认不记缺陷（signals-and-telemetry §4） */
export const HONESTY_TOKENS = [
  '样机',
  '演示',
  'mock',
  'Mock',
  'MOCK',
  '非法律意见',
  '无真',
  '非真',
  '示意',
  '假延迟',
  'backend: \'mock\'',
  "backend: 'mock'",
  'backend:"mock"',
  '非真专利库',
  '非真 ES',
  // 策略 A / 跨口 toast（样机诚实 · 即使当前 Case 主要走 fto）
  '跨口未共享',
  '共享种子',
  '已用共享种子',
  '已填假比对',
] as const

export function isHonestyText(text: string): boolean {
  const t = text ?? ''
  return HONESTY_TOKENS.some((tok) => t.includes(tok))
}

/** requestfailed URL / message 白名单片段 */
export const REQUEST_WHITELIST_SUBSTRINGS = [
  'favicon.ico',
  'chrome-extension://',
] as const

export function isWhitelistedSignal(signal: CheapSignal): boolean {
  if (signal.whitelisted) return true
  if (isHonestyText(signal.text)) return true
  if (signal.url && isHonestyText(signal.url)) return true
  if (signal.kind === 'requestfailed') {
    const hay = `${signal.url ?? ''} ${signal.text}`
    if (REQUEST_WHITELIST_SUBSTRINGS.some((s) => hay.includes(s))) return true
  }
  return false
}

export function severityForSignal(signal: CheapSignal): FindingSeverity | null {
  if (isWhitelistedSignal(signal)) return null
  if (signal.kind === 'pageerror') return 'fail_hard'
  if (signal.kind === 'console' && (signal.level === 'error' || !signal.level)) {
    return 'suspect'
  }
  if (signal.kind === 'requestfailed') {
    // 5xx → fail_hard；其余失败 → suspect
    if (/\b5\d\d\b/.test(signal.text)) return 'fail_hard'
    return 'suspect'
  }
  return null
}

export function actionFingerprint(
  actionType: string,
  targetName: string,
  urlPath: string,
  checkpointId: string,
): string {
  return `${actionType}|${targetName}|${urlPath}|${checkpointId}`
}

export function describeActionTarget(action: {
  type: string
  url?: string
  role?: string
  name?: string | RegExp
  testId?: string
  label?: string
  placeholder?: string
  value?: string
  direction?: string
  reason?: string
  ms?: number
  selector?: string
}): string {
  if (action.type === 'goto') return action.url ?? ''
  if (action.type === 'stop') return action.reason ?? ''
  if (action.type === 'scroll') return action.direction ?? ''
  if (action.type === 'wait') {
    return action.selector ?? action.name?.toString() ?? String(action.ms ?? '')
  }
  if (action.testId) return `testid:${action.testId}`
  if (action.label) return `label:${action.label}`
  if (action.placeholder) return `ph:${action.placeholder}`
  if (action.role || action.name) {
    return `${action.role ?? ''}:${String(action.name ?? '')}`
  }
  if (action.value) return `value:${action.value.slice(0, 40)}`
  return action.type
}
