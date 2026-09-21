# Agent 席=独立 bot（规格 + 交底样板 · 2026-09-21 CST）

只改 `apps/agent/**` + docs（架构 + 本短记/截图）。禁 Cloud；未改 mid/packages。  
叠开聊首页 / 席焊接 / `faa7bd2` advance UX；**勿回退**。

## 规格（A · 先交）

权威：[agent-seat-as-bot.md](../architecture/product-apps/agent-seat-as-bot.md)  
互链：[agent-business-mode.md](../architecture/product-apps/agent-business-mode.md)  
**规格 SHA**：`6f706a8`

| 钉 | 口径 |
|----|------|
| 点席 | 该席独立会话（人↔席 bot），非主链 tab |
| 席面 | 会话（主）· 成果 `NN_*.md` · 办理过程 `NN_*_worklog.md` |
| 推进 | 席 bot 干活/交卷；交卷→本案 HITL；确认→主链前进 |
| 旧推进 | 复用 `advanceSeatWork` + 双文件随步；降为会话动作/次级快捷 |
| Catalog | 同一 projectId |
| 群聊 | 与单席并存；本刀侧栏占位入口 |

## 样板（B · 交底席）

| 项 | 落地 |
|----|------|
| 会话主 | `BusinessSeatWorkbench`：气泡 + 作曲器 +「让它干活 / 交卷请确认」chip |
| 脚本回合 | 发话 / chip → `advanceSeatWork`（同 HITL store）+ 短延迟「正在干活」 |
| 双文件 | 成果/办理过程 tab；文件名 `08_disclosure_pack(.md|_worklog.md)` |
| 交卷 | → 本案「确认交底」待确认页 |
| 群聊 C | 侧栏「群聊 · 本案 占位」→ `/agent/projects/:caseId/room` |
| 7 席铺开 | **下一步**（同壳复用即可） |

## 验收（:5175 · Asia/Shanghai）

- [x] `/agent` 开聊首页未回退
- [x] 交底席会话主 + 双文件面板 + 交卷待确认
- [x] mock 脚本回合体感跟 bot 聊 / 交卷
- [x] 群聊占位入口
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-seat-as-bot/`

| 文件 | 内容 |
|------|------|
| `01-home-chat-intact.png` | 开聊首页未回退 |
| `02-disclosure-seat-chat.png` | 交底席 · 会话主 + 三面 tab + 群聊占位 |
| `03-after-chat-round.png` | 发话后脚本回合 · 工具气泡 · 过程新行 |
| `04-artifact-panel.png` | 成果 `08_disclosure_pack.md` |
| `05-hitl-after-deliver.png` | 交卷 → 本案「确认交底」 |
| `06-group-chat-placeholder.png` | 群聊占位仍可见 |
