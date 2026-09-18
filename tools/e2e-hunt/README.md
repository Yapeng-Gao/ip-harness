# e2e-hunt（MVP）

最小猎虫环：Driver 语义动作 → CheapSignals → AgentLoop（observe→decide→act→judge）→ `report.json` / `report.md`。

**不替代** `e2e/l0-*.spec.ts`；Hunt 报告仅供人审。

## 前置

1. 仓库根已 `npm install`（含 `@playwright/test` / playwright）
2. 浏览器：`npx playwright install chromium`（若本机缺）
3. Search 壳就绪：`npm run dev:search`（`http://localhost:5182/`）

## 跑 CP-search-smoke

```bash
# 仓库根
npm run hunt:search-smoke

# 或
npx tsx tools/e2e-hunt/src/cli.ts --case CP-search-smoke
```

产物目录：`tools/e2e-hunt/artifacts/<runId>/`

- `report.json` / `report.md`
- `step-00N.png` 每步截图

## CasePack

| ID | 壳 | 目标 |
|----|----|------|
| `CP-search-smoke` | search:5182 | 关键词检索→列表可见→开 DetailDrawer |

## Driver 语义（≤10）

`goto` · `click(role\|testid)` · `fill` · `scroll` · `wait` · `snapshot` · `stop`

MVP 实现：Playwright（报告字段 `driver: "playwright"`，语义对齐 cursor-browser）。

## 样机诚实

文案含「样机」「演示」「mock」「非法律意见」等、API `backend:'mock'`、样机横幅 → **不记缺陷**。
