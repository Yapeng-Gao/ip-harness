# 专利 Agent 壳（2026-09-20）

对齐规格：`docs/architecture/product-apps/agent-patent-shell.md`（`25475b4`）· 花名册 `SEAT_ROSTER_FOR_PROTOTYPE`。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。通用 L1/L2 降为旁路（`/agent/sandbox` · `/agent/team`）。

## 落地

| 项 | 实现 |
|----|------|
| 冷启动 `/agent` | `PatentCatalogPage`：01–13 + 总控；勾选组队；立项前簇默认可不勾 |
| 单聊 | `/agent/seats/:seatId`；递交/OA 禁截入 |
| 组队项目 | Catalog「组成专班并建项目」→ `/agent/projects/:id`；席固定 + Owner |
| 群聊 room | `/agent/projects/:id/room`；「演示 loop」bot 自发分派 |
| 每席 UI | 步骤条 + `SeatDualFilePanel`（成果 + worklog，过程默认可见） |
| 席名/文件 | §4 花名册；`patentDeliverables.ts` 双文件成对 |
| 旁路 | `/agent/sandbox` = 旧 L1；`/agent/team` = 旧自由 L2 |

## 截图

`docs/ui-polish/agent-patent-shell/`

- `01-catalog.png` — 专利 Catalog 组队
- `02-seat-research.png` — 检索员单聊 + 双文件
- `03-project-workspace.png` — 专班项目 · 步骤条 + worklog
- `04-project-draft.png` — 撰写席
- `05-room.png` — 群聊 loop（自发）
- `06-sandbox-bypass.png` — 通用沙盒旁路

## 自点（Asia/Shanghai · `http://127.0.0.1:5175`）

- [x] `/agent` = 专利 Catalog（非 L1 单助手墙）
- [x] 勾选组队 → 建项目；可开 room
- [x] 单聊检索员可见步骤条 + 成果/worklog
- [x] 项目席名对齐花名册；Owner 标签可见
- [x] room「演示 loop」出现 bot→bot 自发消息
- [x] 递交/OA Catalog 单聊拦截（须建项目）
- [x] `npm run typecheck -w @ip/agent` 通过
