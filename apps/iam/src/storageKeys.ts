/**
 * IAM 壳知晓的存储 / 跨口 key —— 一律 re-export `@ip/contracts`（crossPortKeys），
 * 勿在本文件手写魔法字符串。
 *
 * 诚实边界：
 * - Cookie（localhost 各端口可共享）→ Persona / 工作区 **样机 cookie**（CROSS_PORT_*），
 *   **不是**真 SSO 会话 cookie
 * - localStorage 按 origin+port 隔离 → 同口多 tab；跨口依赖 mid bridge / legacy
 * - cookie 跨口 vs 同口 LS 分口径；禁止文案「各业务 app 同一套 localStorage」
 */
export {
  CROSS_PORT_PERSONA_COOKIE,
  CROSS_PORT_WORKSPACE_COOKIE,
  CROSS_PORT_SNAPSHOT_LS_KEY,
  ACTIVE_PRODUCT_LS_KEY,
  COMMITTEE_VOTE_HARD_BLOCK_LS_KEY,
  CROSS_PORT_BROADCAST_CHANNEL,
  CROSS_PORT_BRIDGE_MESSAGE_TYPE,
} from '@ip/contracts'
