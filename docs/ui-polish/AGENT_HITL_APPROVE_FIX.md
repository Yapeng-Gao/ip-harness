# AGENT HITL 批准策略快修（P0）

日期：2026-09-19（Asia/Shanghai）

## 根因

1. P2-S4 无案一律 `NO_CASE_GATE_REASON` → `approve_strategy` 也被 `disabled`；原生 `disabled` 无 onClick → 「点了没反应」。
2. OA（sess-oa-1）缺争点/策略时同样 disabled、无外包反馈；「去补全」可解锁，但禁用钮本身无反馈。
3. `sessions` 仅 `buildSeedSessions()` 内存态 → 批准后 `clearedHitlGates` 刷新回滚。
4. Home 空目标 + auto 易落到审查/OA 心智；侧栏「待确认」像第一步入口。

## 修法

| 项 | 改动 |
| --- | --- |
| ① 禁用可点反馈 | `SessionConfirmBar` 禁用 CTA 外包可点层 → toast 原因 + 自动「去补全」/滚绑案；opacity/cursor 显性禁用 |
| ② 无案可清 | `gateRequiresCase`：仅 `pay_unlock` / `authorize_file` / `confirm_quote` 须案；`approve_strategy`/`go_nogo` 无案可点 → `sessionHitlAction` 清闸不写库，toast「… · 未绑案不写入」 |
| ③ Home 第一步 | 空目标+auto → 创建 **agent-research** 新会话；空目标露出「检索现有技术」chip；侧栏「待确认队列（演示）」勿暗示从这开始 |
| ④ 持久化 | `AgentContext`：`ip-harness-agent-sessions-v1` localStorage；种子 id 以持久化为准合并，刷新保留 clearedGates / OA meta / steps |

## 重点文件

- `apps/agent/.../SessionConfirmBar.tsx` · `sessionGates.ts` · `AgentSessionWorkspace.tsx` · `ExpertHitlBridge.tsx` · `AgentHome.tsx` · `AgentSessionSidebar.tsx` · `agent.css`
- `packages/app-state/src/AgentContext.tsx`（最小：持久化 + 无案 toast 文案）

## 自点活口

1. **无案**：Home 开始办理 → research 新会话 → 正式办理至 HITL → 批准策略 → toast 含「未绑案不写入」· 闸清除 · Timeline system 步。
2. **sess-oa-1?focus=hitl**：若禁用 → 原因可见 →「去补全」填争点+策略 → 批准可点 → toast/轨迹；**刷新后 clearedGates 仍在**。
3. 有案路径（c1）不被无案闸误伤。

## 非目标

- 不改 Cloud；不删 OA 种子（仅非默认第一步）。
