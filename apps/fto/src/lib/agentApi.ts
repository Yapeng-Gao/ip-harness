/**
 * 壳内导出：与 docs/architecture/fto/agent-api-shape 同形。
 * 纯函数调 store，非 HTTP；Confirm 仍不写 case-core。
 */
export { ftoAgentApi as fto } from '../state/store'
