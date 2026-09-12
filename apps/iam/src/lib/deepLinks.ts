/**
 * IAM 面跨口绝对深链 helpers。
 * 多 app 下相对路径会停在错误端口：跨 mid/workbench/agent/ops/iam 一律用 APP_DEV_URLS + <a href>。
 */
import { APP_DEV_URLS } from '@ip/contracts'

/**
 * Join APP_DEV_URLS base with path/query/hash.
 * Already-absolute http(s) URLs are returned unchanged.
 */
export function absDevUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

/** 跨面绝对 URL → mid:5173。必须用 <a href> 或 window.location，不要用 react-router Link。 */
export function midHref(path = '/'): string {
  return absDevUrl(APP_DEV_URLS.mid, path)
}

/** 跨面绝对 URL → workbench:5174 */
export function workbenchHref(path = '/workbench'): string {
  return absDevUrl(APP_DEV_URLS.workbench, path)
}

/** 跨面绝对 URL → agent:5175 */
export function agentHref(path = '/agent'): string {
  return absDevUrl(APP_DEV_URLS.agent, path)
}

/** 跨面绝对 URL → ops:5176 */
export function opsHref(path = '/'): string {
  return absDevUrl(APP_DEV_URLS.ops, path)
}

/** 本面 / 跨口 → iam:5177 */
export function iamHref(path = '/'): string {
  return absDevUrl(APP_DEV_URLS.iam, path)
}

/** mid 跨口 bridge 页（勿硬编码 localhost:5173） */
export function crossPortBridgeHref(): string {
  return `${APP_DEV_URLS.mid}/__cross_port_bridge.html`
}

const APP_DEV_URL_PREFIXES = Object.values(APP_DEV_URLS)

/**
 * 仅允许以任一 APP_DEV_URLS.* 为前缀的 http(s) URL（防开放重定向）。
 */
export function isAllowedReturnUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const href = parsed.href
    return APP_DEV_URL_PREFIXES.some(
      (base) => href === base || href.startsWith(`${base}/`) || href.startsWith(`${base}?`) || href.startsWith(`${base}#`),
    )
  } catch {
    return false
  }
}

/**
 * 读 `return` 或 `next` query，校验后返回绝对深链；非法或不存在则 null。
 */
export function resolveReturnUrl(
  searchParams: URLSearchParams | { get(name: string): string | null },
): string | null {
  const raw = searchParams.get('return') ?? searchParams.get('next')
  if (!raw) return null
  let candidate = raw
  try {
    candidate = decodeURIComponent(raw)
  } catch {
    // keep raw
  }
  return isAllowedReturnUrl(candidate) ? candidate : null
}
