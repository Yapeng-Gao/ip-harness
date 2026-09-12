/**
 * Shared cross-app deep links（@shared）。
 * multi-app（VITE_MULTI_APP）：跨面 path → APP_DEV_URLS 绝对 URL + <a href>；
 * 同面内 path 保持相对，可继续用 react-router Link / navigate。
 * legacy 单体：一律相对 path。
 */
import { APP_DEV_URLS, APP_PORTS, type AppId } from '@ip/contracts'

export function isMultiApp(): boolean {
  return import.meta.env.VITE_MULTI_APP === 'true'
}

export function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function normalizePath(path: string): string {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function barePathname(path: string): string {
  const p = normalizePath(path)
  const cut = p.split(/[?#]/)[0]
  return cut.length > 0 ? cut : '/'
}

/** Classify a path to owning app surface; null = unknown / keep relative. */
export function surfaceForPath(path: string): AppId | null {
  const p = barePathname(path)
  if (p.startsWith('/workbench') || p === '/inventor' || p.startsWith('/inventor/')) {
    return 'workbench'
  }
  if (
    p.startsWith('/agent') ||
    p.startsWith('/ip-agent') ||
    p.startsWith('/agents')
  ) {
    return 'agent'
  }
  if (p.startsWith('/login')) return 'iam'
  if (
    p === '/' ||
    p.startsWith('/cases') ||
    p.startsWith('/docket') ||
    p.startsWith('/billing') ||
    p.startsWith('/pipeline') ||
    p.startsWith('/insight') ||
    p.startsWith('/settings') ||
    p.startsWith('/agencies') ||
    p.startsWith('/hub') ||
    p.startsWith('/stage') ||
    p.startsWith('/monitor')
  ) {
    return 'mid'
  }
  return null
}

/** Detect current Vite app by dev port（multi-app only）. */
export function currentAppId(): AppId | null {
  if (typeof window === 'undefined') return null
  if (!isMultiApp()) return null
  const port = Number(window.location.port)
  if (!Number.isFinite(port) || port <= 0) return null
  for (const id of Object.keys(APP_PORTS) as AppId[]) {
    if (APP_PORTS[id] === port) return id
  }
  return null
}

function absDevUrl(base: string, path: string): string {
  if (isAbsoluteHttpUrl(path)) return path
  return `${base}${normalizePath(path)}`
}

export function midHref(path = '/'): string {
  return absDevUrl(APP_DEV_URLS.mid, path)
}

export function workbenchHref(path = '/workbench'): string {
  return absDevUrl(APP_DEV_URLS.workbench, path)
}

export function agentHref(path = '/agent'): string {
  return absDevUrl(APP_DEV_URLS.agent, path)
}

export function iamHref(path = '/'): string {
  return absDevUrl(APP_DEV_URLS.iam, path)
}

export type ResolvedAppHref = {
  href: string
  /** true → must use <a href> / window.location，勿用 react-router Link */
  external: boolean
}

/**
 * Resolve a path for navigation.
 * multi-app + 跨面 → APP_DEV_URLS 绝对 URL；同面 / legacy → 相对 path。
 */
export function resolveAppHref(path: string): ResolvedAppHref {
  if (isAbsoluteHttpUrl(path)) {
    return { href: path, external: true }
  }
  const normalized = normalizePath(path)
  if (!isMultiApp()) {
    return { href: normalized, external: false }
  }
  const target = surfaceForPath(normalized)
  if (!target) {
    return { href: normalized, external: false }
  }
  const current = currentAppId()
  if (current === target) {
    return { href: normalized, external: false }
  }
  return {
    href: absDevUrl(APP_DEV_URLS[target], normalized),
    external: true,
  }
}

/** Convenience: href string only（绝对或相对）. */
export function appHref(path: string): string {
  return resolveAppHref(path).href
}

/**
 * navigate 包装：跨面用 location.assign，同面用 react-router navigate。
 */
export function navigateApp(
  navigate: (to: string) => void,
  path: string,
): void {
  const { href, external } = resolveAppHref(path)
  if (external) {
    window.location.assign(href)
    return
  }
  navigate(href)
}
