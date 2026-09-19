# Agent IA · 自由 bot vs 固定专家（2026-09-19）

对齐规格：`docs/architecture/product-apps/agent-entry-modes.md`（自由度冻结 SHA `cec9d79`）。
相对 `4dd523e`（壳侧栏焊死专利专家）**废止**焊死花名册。

## 落地

| 项 | 实现 |
|----|------|
| 默认 `/agent` | `GeneralGrokShell`：自由 bot 列表（种子 2 个示例 custom）+ 一对一 |
| 新建 bot | `/agent/bots/new` 或侧栏「新建 bot」→ name + kind + systemBrief，内存 |
| 一对一 | `/agent/bots/:botId` → `GeneralBotChatPane` |
| bot 互通 | 会话内「转发给 bot…」→ 目标线程引用消息 + intercom 事件 |
| 专利能力 | 可选 `template:…` 种；**非**焊死唯一列表 |
| 项目模式 | 侧栏固定专家；角标「项目 · 专家固定」；**无**「新建专家」 |
| 自定义 bot | **不**进入项目花名册 |
| HITL | 项目路径保留 `ExpertHitlBridge` / 5226b33；自定义 bot 默认只读无 DomainCommand |

## 验收（活口 · §8）

- [x] 通用：可 mock 新建 bot；可一对一；可 mock 转发
- [x] 项目：专家固定；无「新建专家」；角标可感知
- [x] 通用 ≠ 项目自由度（「自由 bot」vs「专家固定」角标）
- [x] 默认进通用 Grok
- [x] 写库路径未放松（HITL→DomainCommand 仍在项目专家）
- [x] `npm run typecheck -w @ip/agent` 通过

## 禁 Cloud

仅 `apps/agent/**` + 本短记；未动 Cloud。
