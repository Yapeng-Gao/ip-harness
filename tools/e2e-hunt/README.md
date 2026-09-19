# e2e-hunt（MVP）

最小猎虫环：Driver 语义动作 → CheapSignals → AgentLoop（observe→decide→act→judge）→ `report.json` / `report.md`。

**不替代** `e2e/l0-*.spec.ts`；Hunt 报告仅供人审。**不开 L5**（无自动修产品）。

对齐方案：`docs/architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md`（Phase 0′ · 样机白名单）。

## 前置

1. 仓库根已 `npm install`（含 `@playwright/test` / playwright）
2. 浏览器：`npx playwright install chromium`（若本机缺）
3. 目标壳就绪（按 CasePack）：
   - Search（mock）：`npm run dev:search` → `http://localhost:5182/`
   - Search（旗标 API · 分支 A）：`npm run dev:search-api`（:5190）+ `npm run dev:search:api`（:5182，`VITE_SEARCH_API_URL`）
   - Search（旗标宕机回退 · 分支 B）：`npm run dev:search:api`（:5182）且 **停掉** :5190
   - FTO：`npm run dev:fto` → `http://localhost:5183/`
   - Agent：`npm run dev:agent` → `http://localhost:5175/`
   - Figure：`npm run dev:figure` → `http://localhost:5187/`

## 跑 CasePack

```bash
# 仓库根
npm run hunt:search-smoke   # CP-search-smoke · :5182
npm run hunt:fto-five       # CP-fto-five · :5183 · 五步到报告
npm run hunt:basket-strategy-a  # CP-basket-strategy-a · :5182→:5183 · 策略 A
npm run hunt:search-api-flag      # CP-search-api-flag · :5182+:5190 · sqlite-fts 分支 A
npm run hunt:search-api-fallback  # CP-search-api-fallback · :5182 · 旗标开但 :5190 宕机回退 mock 分支 B
npm run hunt:agent-hitl           # CP-agent-hitl · :5175 · HITL ConfirmBar
npm run hunt:agent-stepwise      # CP-agent-stepwise · :5175 · S0–S9 逐步走查
npm run hunt:figure-dual          # CP-figure-dual · :5187 · 生成+编辑双闭环

# 或
npx tsx tools/e2e-hunt/src/cli.ts --case CP-search-api-fallback
```

产物目录：`tools/e2e-hunt/artifacts/<runId>/`

- `report.json` / `report.md`
- `step-00N.png` 每步截图
- 逐步可选 `agent_reasoning`（规则短路 `rule:…`；schemaVersion 仍 1.0）

## CasePack

| ID | 壳 | 目标 | 脚本 |
|----|----|------|------|
| `CP-search-smoke` | search:5182 | 关键词检索→列表可见→开 DetailDrawer | `hunt:search-smoke` |
| `CP-fto-five` | fto:5183 | 五步走到报告页（不要求真引擎） | `hunt:fto-five` |
| `CP-basket-strategy-a` | search:5182 → fto:5183 | 加篮→送 FTO→导入共享种子 + 诚实 toast（非真跨口 LS） | `hunt:basket-strategy-a` |
| `CP-search-api-flag` | search:5182 + api:5190 | 旗标 `backend: sqlite-fts` + 有命中（分支 A） | `hunt:search-api-flag` |
| `CP-search-api-fallback` | search:5182（旗标开 · :5190 宕） | toast 回退 mock + `backend: mock`（分支 B） | `hunt:search-api-fallback` |
| `CP-agent-hitl` | agent:5175 | 进入办理 → HITL ConfirmBar 可见 | `hunt:agent-hitl` |
| `CP-agent-stepwise` | agent:5175 | S0–S9 逐步走查（Home→HITL→绑案→Inbox→Catalog→Projects） | `hunt:agent-stepwise` |
| `CP-figure-dual` | figure:5187 | 上下文 → mock 生成 → 画布编辑（样机双闭环） | `hunt:figure-dual` |

详见 `CASEPACKS_NEXT_DRAFT.md`（§8.2）。

## Driver 语义（≤10）

`goto` · `click(role\|testid)` · `fill` · `scroll` · `wait` · `snapshot` · `stop`

MVP 实现：Playwright（报告字段 `driver: "playwright"`，语义对齐 cursor-browser）。

## 样机诚实

文案含「样机」「演示」「mock」「非法律意见」「非真 / 无真」等、API `backend:'mock'`、假比对 toast、策略 A「跨口未共享 / 共享种子 / 已用共享种子」、Search API「已接 Search API / sqlite-fts / 非全球专利库 / Search API 不可用 / 已回退样机 mock」、Agent「Beta·非采购闭环 / 会话待确认 / HITL 等待」、Figure「无真文生图 / 假延迟」→ **不记缺陷**。`requestfailed` 到 `localhost:5190`（分支 B 宕机）亦白名单。
