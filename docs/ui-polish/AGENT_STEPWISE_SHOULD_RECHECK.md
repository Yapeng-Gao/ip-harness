# Agent 逐步 UI · Should 短复测 · AGENT_STEPWISE_SHOULD_RECHECK

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **对照** | `AGENT_STEPWISE_WALK_2026-09-19.md` Should：SW-S0-1 / S5-1 / S6-1 / S6-2 / S7-1 |
| **功能 SHA** | `cdbd74f` |
| **自证** | `docs/ui-polish/agent-stepwise-should-fix/REPORT.md` |
| **日期** | 2026-09-19（Asia/Shanghai · ~12:12 CST） |
| **运行时** | Vite `http://127.0.0.1:5175` · **活口独立 Playwright** |
| **证据** | `docs/ui-polish/agent-stepwise-should-recheck/` |
| **本复测总评** | **Go**（Should **5/5 PASS**） |

---

## 验收表

| ID | 活口重点 | 裁决 | 一句证据 |
|----|----------|------|----------|
| **SW-S0-1** | `/agent` 推荐 `<details>` | **PASS** | `home-recommend-fold` 存在 · 默认 `open=false` · `home-case-bind`=1 |
| **SW-S5-1** | 会话绑案单主 | **PASS** | `case-bind-controls`=1 · 无 `session-no-case-hint` · 无「关联案件」label |
| **SW-S6-1** | `?filter=needs_human` 主表=计数 | **PASS** | 深链与点击均 URL 含 filter · 主表 **3** 行；点击 segmented 写 URL |
| **SW-S6-2** | H1 随滤 | **PASS** | H1=「**待确认会话**」（深链与点击一致） |
| **SW-S7-1** | Catalog 无 Beta 叠字 | **PASS** | H2「Beta非采购闭环」· 无 `Beta Beta` |

---

## 活口路径摘要

1. `/agent` → 推荐折叠  
2. `/agent/sessions?filter=needs_human` → 主表 3 · H1 待确认会话  
3. `/agent/sessions` 点「待确认」→ URL 写入 filter · 同态  
4. `/agent/sessions/sess-disclosure-1` → 单 CaseBind  
5. `/agent/agents` → Beta 标题  

截图：`S0-home.png` · `S6-url-filter.png` · `S6-click-filter.png` · `S5-bind.png` · `S7-catalog.png` · `_live.json`

---

## 门禁

| 门 | 结果 |
|----|------|
| Should 五条 | **全 PASS** |
| Must | 本波无新 Must |
| **Verdict** | **Go** |

---

*活口抽核；只 docs。*
