# Agent 逐步 UI · Should 修复报告

**日期** 2026-09-19（Asia/Shanghai）  
**范围** `apps/agent/**`（+ 共享 CSS 如需）  
**基线** `docs/ui-polish/agent-stepwise-ui/` · 权威 Should：`AGENT_STEPWISE_WALK_2026-09-19.md` §Should  
**约束** Must=0 · 保留 REMIND_TABS / 无 mid CTA / 无 BillingHold 全宽 · 无 HITL/DomainCommand / 无 Cloud Agent

## 勾选

| ID | 项 | 结果 | 说明 |
|----|----|------|------|
| **SW-S6-1** | 筛选写入 URL + 主表跟随 | ✅ | 侧栏 segmented 写/清 `?filter=`；主表与侧栏共用 URL；空态诚实；刷新可恢复 |
| **SW-S6-2** | 标题跟随筛选 | ✅ | `needs_human`→「待确认会话」；`running`→「进行中」等 |
| **SW-S0-1** | Home 推荐密度 | ✅ | 推荐卡收入 `<details>` 次级折叠；compose + 主 CTA 留白优先；不碰 Home 案件去重（`beeb35b`） |
| **SW-S5-1** | 会话绑案双入口感 | ✅ | 去掉 composer 案件 select + 顶栏 `no_case` 平行 CTA；`CaseBindControls` 单主入口；绑后顶带 `!caseId` 才展示 |
| **SW-S7-1** | Catalog Beta 叠字 | ✅ | H2：`Beta` 徽标 +「非采购闭环」（去重 Beta） |

## 活验（localhost:5175）

见 `_probe.json`：

- 点「待确认·3」→ URL=`/agent/sessions?filter=needs_human` · 主表行数=3=徽标 · H1=「待确认会话」· 刷新保持
- Catalog H2：`Beta` / `非采购闭环`（非 `Beta Beta·…`）
- Home：`[data-testid=home-recommend-fold]` 存在
- Session：composer 无「关联案件」select；无 `session-no-case-hint`

## AFTER 截图

- `AFTER-S6-filter-needs.png`
- `AFTER-S0-density.png`
- `AFTER-S5-bind.png`
- `AFTER-S7-catalog.png`

## 可点 URL

- http://127.0.0.1:5175/agent/sessions?filter=needs_human
- http://127.0.0.1:5175/agent
- http://127.0.0.1:5175/agent/agents
- http://127.0.0.1:5175/agent/sessions

## typecheck

`npm run typecheck -w @ip/agent` ✅

## Blockers

无
