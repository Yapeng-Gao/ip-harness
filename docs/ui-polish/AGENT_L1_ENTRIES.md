# Agent L1 顶栏并列入口（2026-09-19）

对齐冻稿：`docs/architecture/product-apps/agent-entry-modes.md` / `agent-layers.md`（`8d24a18`）。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。

## 心智

| 入口 | 路由 | 层 | 说明 |
|------|------|----|------|
| （主） | `/agent` | L1 | 仍单助手；不甩多 bot 墙 |
| **团队** | `/agent/team` | L2 | 通用协作；与 L3 **并列** |
| **专利项目** | `/agent/projects` | L3 | 列表或 `proj-demo-patent`；**不经 L2** |
| 展廊 | `/agent/lab` | — | 保留弱入口 |

**禁止**：把 L3 藏在 L2；污染 L1 主聊 / L2 team 花名册。

## 实现

- `AgentL1Shell` 顶栏薄 chrome：同等样式按钮「团队」「专利项目」；展廊仍弱链
- `data-testid`：`agent-l1-to-team` · `agent-l1-to-projects`
- 未改 mid deep-link（`b90e91f` 仍有效）

## 截图

`docs/ui-polish/agent-l1-entries/`

- `l1-topbar-entries.png` — `/agent` L1 顶栏两入口并列

## 自点

- [x] `/agent` 顶栏可见「团队」与「专利项目」，样式同等
- [x] 「团队」→ `/agent/team`（L2）
- [x] 「专利项目」→ `/agent/projects`（L3，可进 demo）
- [x] 展廊仍在；L1 主路径仍单助手
- [x] `npm run typecheck -w @ip/agent` 通过
