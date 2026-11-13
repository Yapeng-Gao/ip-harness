# Agent IA · Grok 多专家壳（2026-09-19）

对齐规格：`docs/architecture/product-apps/agent-entry-modes.md`（SHA `101e948`）。

## 落地

| 项 | 实现 |
|----|------|
| 默认 `/agent` | `GeneralGrokShell`：左壳级专利 bot + 总控，中一对一（复用 `ProjectChatPane` / HITL） |
| 路由 | `/agent`、`/agent/bots/:botId`；`?bot=` 规范化；项目仍 `/agent/projects…` |
| 废止单 Composer 主心智 | 旧 `AgentHome` 迁至 `/agent/compose`（次级/兼容） |
| 专家名单 | orchestrator / search / draft / fto；`expert-mining` 侧栏灰显 |
| 剧本 | 复用 `expertsPatent.ts`，挂隐式 `ws-general-shell`（不进项目列表） |
| 项目 | 同壳形态；创建默认 **专利 Pack**（`kind=domain`） |
| 保留 | sessions 聚合（壳线程→general）、Catalog 管理向、先聊后案、5226b33 HITL/清闸/持久化 |

## 验收（自点 · Playwright）

- [x] `/agent` 多 bot 侧栏（总控+≥2 专家）可单独聊；非单 Composer 主心智
- [x] `/agent/bots/expert-search` 可进；总控回 `/agent`
- [x] 项目夹仍可用；壳不泄漏进项目列表
- [x] sessions / Catalog / compose 次级入口可用
- [x] `npm run typecheck` 通过

## 禁 Cloud

本改仅 `apps/agent/**` + 本短记；未动 Cloud。
