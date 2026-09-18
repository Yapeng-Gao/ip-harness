# e2e-hunt（MVP）

最小猎虫环：Driver 语义动作 → CheapSignals → AgentLoop（observe→decide→act→judge）→ `report.json` / `report.md`。

**不替代** `e2e/l0-*.spec.ts`；Hunt 报告仅供人审。**不开 L5**（无自动修产品）。

对齐方案：`docs/architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md`（Phase 0′ · 样机白名单）。

## 前置

1. 仓库根已 `npm install`（含 `@playwright/test` / playwright）
2. 浏览器：`npx playwright install chromium`（若本机缺）
3. 目标壳就绪（按 CasePack）：
   - Search：`npm run dev:search` → `http://localhost:5182/`
   - FTO：`npm run dev:fto` → `http://localhost:5183/`

## 跑 CasePack

```bash
# 仓库根
npm run hunt:search-smoke   # CP-search-smoke · :5182
npm run hunt:fto-five       # CP-fto-five · :5183 · 五步到报告

# 或
npx tsx tools/e2e-hunt/src/cli.ts --case CP-fto-five
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

下一批草案（优先序 fto→basket→flag）：见 `CASEPACKS_NEXT_DRAFT.md`（§8.2）。

## Driver 语义（≤10）

`goto` · `click(role\|testid)` · `fill` · `scroll` · `wait` · `snapshot` · `stop`

MVP 实现：Playwright（报告字段 `driver: "playwright"`，语义对齐 cursor-browser）。

## 样机诚实

文案含「样机」「演示」「mock」「非法律意见」「非真 / 无真」等、API `backend:'mock'`、假比对 toast、策略 A「跨口未共享 / 共享种子 / 已用共享种子」→ **不记缺陷**。
