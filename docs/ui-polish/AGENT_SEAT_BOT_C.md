# Agent 席=bot · C（7 席同构 + 群聊 room · 2026-09-21 CST）

只改 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。  
叠 `6f706a8` 规格 + `21ce0fc` 交底样板；**勿回退**开聊首页 / 席焊接 / `faa7bd2`。

权威规格：[agent-seat-as-bot.md](../architecture/product-apps/agent-seat-as-bot.md) · 样板短记：[AGENT_SEAT_AS_BOT.md](./AGENT_SEAT_AS_BOT.md)

## C 落地

| 项 | 口径 |
|----|------|
| **7 席同构** | 查新→立项→交底→撰写→附图→递交→审查答复；同一 `BusinessSeatWorkbench` 壳（会话主 + 成果 `NN_*.md` + worklog + 交卷 HITL） |
| 切席 | 复位会话主；`data-seat-id` |
| 交卷 | 复用 `advanceSeatWork` + 本案 HITL（附图等无闸席只交卷不 pending） |
| **群聊** | 侧栏「群聊 · 本案」→ `/agent/cases/:caseId/room` 最小可进 room；「多席互喊示意」mock 气泡 |
| 与单席 | 并存；room 侧栏链回各席独立会话 |

## 验收（:5175 · Asia/Shanghai）

- [x] 默认 7 席任一席 = 同构 bot 壳（会话/成果/办理过程）
- [x] 交底样板路径未回退；开聊首页 / 焊接 / faa7bd2 未回退
- [x] 群聊可进 room + 多席互喊示意
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-seat-bot-c/`

| 文件 | 内容 |
|------|------|
| `01-home-intact.png` | 开聊首页未回退 |
| `02-research-seat.png` | 查新席 · 同构壳 |
| `03-intake-seat.png` | 立项席 |
| `04-seven-rail.png` | 侧栏 7 席 + 群聊 room 入口 |
| `05-room-empty.png` | 群聊最小 room 空态 |
| `06-room-shout.png` | 多席互喊示意气泡 |
| `07-disclosure-still.png` | 交底席样板仍在 |
