/**
 * 壳内导出：与 docs/architecture/landscape/agent-api-shape 同形。
 * 纯函数调 store，非 HTTP；backend 恒为 'seed-graph'（方案 A 壳内 seed）。
 */
export { landscapeAgentApi as landscape } from '../state/store'
