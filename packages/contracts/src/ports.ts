/**
 * Local multi-app ports (Phase 0 monorepo — not a gateway).
 * Cross-app deep links use these in dev.
 * `api` = 同仓 HTTP mock（非真后端），见 apps/api-mock。
 * 并行样机壳（search/fto/…、docHarness/aiInfra/aiData）为 additive 登记；勿删五壳 + api 既有键。
 * `searchApi` = 检索数据面 HTTP（可选），见 apps/search-api。
 */
export const APP_PORTS = {
  mid: 5173,
  workbench: 5174,
  agent: 5175,
  ops: 5176,
  iam: 5177,
  docHarness: 5178,
  aiInfra: 5179,
  api: 5180,
  aiData: 5181,
  search: 5182,
  fto: 5183,
  mining: 5184,
  inspire: 5185,
  landscape: 5186,
  figure: 5187,
  searchApi: 5190,
} as const

export type AppId = keyof typeof APP_PORTS

export const APP_DEV_URLS: Record<AppId, string> = {
  mid: `http://localhost:${APP_PORTS.mid}`,
  workbench: `http://localhost:${APP_PORTS.workbench}`,
  agent: `http://localhost:${APP_PORTS.agent}`,
  ops: `http://localhost:${APP_PORTS.ops}`,
  iam: `http://localhost:${APP_PORTS.iam}`,
  docHarness: `http://localhost:${APP_PORTS.docHarness}`,
  aiInfra: `http://localhost:${APP_PORTS.aiInfra}`,
  api: `http://localhost:${APP_PORTS.api}`,
  aiData: `http://localhost:${APP_PORTS.aiData}`,
  search: `http://localhost:${APP_PORTS.search}`,
  fto: `http://localhost:${APP_PORTS.fto}`,
  mining: `http://localhost:${APP_PORTS.mining}`,
  inspire: `http://localhost:${APP_PORTS.inspire}`,
  landscape: `http://localhost:${APP_PORTS.landscape}`,
  figure: `http://localhost:${APP_PORTS.figure}`,
  searchApi: `http://localhost:${APP_PORTS.searchApi}`,
}
