# Agent 席=独立 bot（规格 + 交底样板 · 2026-09-21 CST）

只改 `apps/agent/**` + docs（架构 + 本短记/截图）。禁 Cloud；未改 mid/packages。  
叠开聊首页 / 席焊接 / `faa7bd2` advance UX；**勿回退**。

## 规格（A · 先交）

权威：[agent-seat-as-bot.md](../architecture/product-apps/agent-seat-as-bot.md)  
互链：[agent-business-mode.md](../architecture/product-apps/agent-business-mode.md)

| 钉 | 口径 |
|----|------|
| 点席 | 该席独立会话（人↔席 bot），非主链 tab |
| 席面 | 会话（主）· 成果 `NN_*.md` · 办理过程 `NN_*_worklog.md` |
| 推进 | 席 bot 干活/交卷；交卷→本案 HITL；确认→主链前进 |
| 旧推进 | 复用 `advanceSeatWork` + 双文件随步；降为会话动作/次级快捷 |
| Catalog | 同一 projectId |
| 群聊 | 与单席并存；本刀可占位 |

## 样板（B）

交底席：席 bot 会话 + 双文件面板 + 交卷待确认；脚本回合 mock。

## 截图

`docs/ui-polish/agent-seat-as-bot/`（B 落地后补）
