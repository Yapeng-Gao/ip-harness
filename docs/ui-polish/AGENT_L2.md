# Agent L2 团队 bot→bot 协作（2026-09-19）

对齐规格：`docs/architecture/product-apps/agent-l2-team.md`（`ee40a57`）· `agent-layers.md`。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。**勿污染 L1**（`/agent` 仍单助手）。

## §6 验收对照

| 验收 | 落地 |
|------|------|
| 仅 team/bots 路径具备自发 bot→bot | `showCollabLoop` / `botSendToBot` 只挂 `GeneralGrokShell`；L1 `showForward={false}` |
| 一条协作任务可点完，消息自动落相关 bot 线程 | 「演示协作任务」：编排→search request→result→draft request→result→done |
| L1 `/agent` 仍单助手、无多 bot 墙 | 路由未改回多 bot（c2ed004） |

## 实现要点

- `BotMessage`：`kind: request|result|note` · `spontaneous: true` · `taskId`
- `CollabTask`：`running → done` + 步骤清单（任务卡在总控头）
- 气泡标注：`分派/回执/完成 · 自发` + `A → B`
- 用户转发仍次级（`forwardToBot` · `spontaneous: false`）

## 截图

`docs/ui-polish/agent-l2/`：

- `l2-team-home.png` — `/agent/team` 总控 +「演示协作任务」
- `l2-collab-loop-orch.png` — 编排侧：任务卡 done + 自发标注
- `l2-collab-labels-scribe.png` — 检索侧：收到 request / 发出 result（文件名历史保留）

## 自点

- [x] `/agent/team` 点「演示协作任务」无点转发即可跑完
- [x] 聊天可见 bot→bot + 自发标注；任务卡 running→done
- [x] `/agent` 仍 L1（无侧栏墙、无协作 CTA）
- [x] `npm run typecheck -w @ip/agent` 通过
