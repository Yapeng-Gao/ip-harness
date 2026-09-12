/**
 * Local multi-app ports (Phase 0 monorepo — not a gateway).
 * Cross-app deep links use these in dev.
 * `api` = 同仓 HTTP mock（非真后端），见 apps/api-mock。
 */
export const APP_PORTS = {
  mid: 5173,
  workbench: 5174,
  agent: 5175,
  ops: 5176,
  iam: 5177,
  api: 5180,
} as const

export type AppId = keyof typeof APP_PORTS

export const APP_DEV_URLS: Record<AppId, string> = {
  mid: `http://localhost:${APP_PORTS.mid}`,
  workbench: `http://localhost:${APP_PORTS.workbench}`,
  agent: `http://localhost:${APP_PORTS.agent}`,
  ops: `http://localhost:${APP_PORTS.ops}`,
  iam: `http://localhost:${APP_PORTS.iam}`,
  api: `http://localhost:${APP_PORTS.api}`,
}
