import { resolveAppHref } from './deepLinks'

/**
 * Multi-app: personaRouteAccess.redirectTo is a path; resolve to absolute APP_DEV_URLS.
 * Legacy monolith: return path unchanged for react-router Link.
 */
export function resolvePersonaRedirectTo(path: string | undefined): {
  href: string
  external: boolean
} {
  const p = path && path.length > 0 ? path : '/'
  return resolveAppHref(p)
}
