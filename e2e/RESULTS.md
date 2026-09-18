# Playwright e2e RESULTS · L0 + L1 + api-mock 起/停 + 并行壳 L0

**实现日期：** 2026-09-12（UTC+8）  
**跑测时间：** 2026-09-18 10:34（UTC+8）· 五壳 + api + 并行六壳齐口  
**依据：** `e2e/PLAN-L0-L1.md` §7 已决 · `e2e/PLAN-API-MOCK-SMOKE.md` §7 已决 · `e2e/PLAN-L0-PARALLEL-5182-5187.md` §6 已决 · `e2e/REVIEW_RUBRIC.md`  
**host：** 一律 `localhost`（禁止 `127.0.0.1`）  
**Command：** `npm run test:e2e -- --reporter=list`（`playwright test` · `workers: 1`）  
**webServer：** 无（跑前 `curl` 确认端口；未起第二套 Vite；**未杀** 5180）  
**Browser：** Chromium（headless）  
**合计：** 21 passed · 0 failed · 46.8s（含并行壳 L0×6）

## 端口矩阵（跑前 curl · 2026-09-18 10:34 UTC+8）

| 壳 / 服务 | 端口 | URL | curl | 跑测 |
|-----------|------|-----|------|------|
| mid | 5173 | `http://localhost:5173/` | 200 | PASS |
| workbench | 5174 | `http://localhost:5174/workbench` | 200 | PASS |
| agent | 5175 | `http://localhost:5175/agent` | 200 | PASS |
| ops | 5176 | `http://localhost:5176/` | 200 | PASS |
| iam | 5177 | `http://localhost:5177/login` | 200 | PASS |
| api-mock | 5180 | `http://localhost:5180/health` | 200 · `ok===true` | PASS |
| search | 5182 | `http://localhost:5182/` | 200 | PASS |
| fto | 5183 | `http://localhost:5183/` | 200 | PASS |
| mining | 5184 | `http://localhost:5184/` | 200 | PASS |
| inspire | 5185 | `http://localhost:5185/` | 200 | PASS |
| landscape | 5186 | `http://localhost:5186/` | 200 | PASS |
| figure | 5187 | `http://localhost:5187/` | 200 | PASS |

纪律：端口不齐则该口 RESULTS 写「未跑」、禁止假绿。本轮 12/12 可达，故执行全量（含并行壳 L0）。

## L0（零 click）· 五壳 + api

| ID | 壳 | 结果 | 备注 |
|----|----|------|------|
| L0-MID-01 | mid:5173 | PASS | heading「资产与任务」可见 · 1.2s |
| L0-WB-01 | workbench:5174 | PASS | heading「业务工作台」 · 848ms |
| L0-AG-01 | agent:5175 | PASS | agent home / 办理入口 · 508ms |
| L0-OPS-01 | ops:5176 | PASS | heading「运维占位标题」 · 962ms |
| L0-IAM-01 | iam:5177 | PASS | heading「IP Harness」 · 952ms |
| L0-API-01 | api:5180 | PASS | GET /health → 2xx + `body.ok === true` · 32ms |

## L0（零 click）· 并行壳 5182–5187

**计划：** [`PLAN-L0-PARALLEL-5182-5187.md`](./PLAN-L0-PARALLEL-5182-5187.md) §6 已决 · spec：`l0-parallel-smoke.spec.ts`

| ID | 壳 | 端口 | 结果 | 备注 |
|----|----|------|------|------|
| L0-SEARCH-01 | search | 5182 | PASS | h1「专利检索工作台」 · 859ms |
| L0-FTO-01 | fto | 5183 | PASS | h1「FTO 样机项目」 · 841ms |
| L0-MINING-01 | mining | 5184 | PASS | h1「专利挖掘样机项目」 · 806ms |
| L0-INSPIRE-01 | inspire | 5185 | PASS | h1「问题 / 技术点」（.or 创新激发备援） · 797ms |
| L0-LANDSCAPE-01 | landscape | 5186 | PASS | h1「选择产业域」 · 749ms |
| L0-FIGURE-01 | figure | 5187 | PASS | h1「附图资产」 · 759ms |

## L1

| ID | 路径 | 结果 | 备注 |
|----|------|------|------|
| L1-01 | iam:5177 → mid「资产与任务」 | PASS | enterWorkspace 强制 `localhost:5177/login` · 1.6s |
| L1-02 | sess-oa-1 HITL CTA 可见（不点） | PASS | 未点 CTA · 1.5s |
| L1-03 | `/cases/c1?tab=audit`「最近领域命令」 | PASS | 未点导出 · 1.7s |
| L1-04 | `localhost:5176/config#alerts` | PASS | 「通知渠道」+ 试发一次 · 1.3s |
| L1-05 | `/workbench` + `/workbench/research` | PASS | 「业务工作台」+ research · 5.8s |
| L1-06 | `/agent/agents` 9 heading | PASS | 仅 heading，未点卡 · 1.8s |
| L1-07 | sess-disclosure-1 启动 → HITL | PASS | 唯一 play 启动 click · 10.6s |

## api-mock 起/停（P0×3 · §7 已决）

| ID | 前置 | 结果 | 备注 |
|----|------|------|------|
| L0-API-01 | **5180=起** | PASS | 升格：`ok === true`（见上 L0 表） |
| L1-API-UP-01 | **5180=起**；enterWorkspace → mid | PASS | 只验读：`/v1/cases` + 地标 · 1.7s；无写/dispatch |
| L1-API-DOWN-01 | enterWorkspace → mid 后 **page.route 模拟不可达，进程仍起** | PASS | 模拟 5180 不可达 → fallback 壳可用 · 2.0s；**非**关开关 |

口径：开关 `=0` ≠ 停服；DOWN **禁止**标成「关开关」。未跑 L0-API-02（已砍）。

## 偏差

1. **`workers: 1`**：本机多壳 Vite 并存时 free RAM 约 ~900Mi；默认多 worker 曾致 search/mining/inspire `page.goto: Page crashed`。config 钉 `workers: 1` 以保证 `npm run test:e2e` 稳定绿；未改断言口径。
2. 未改 `apps/`；5182–5187 **未**写入 `APP_PORTS`（§6 E）。
3. Hunt 不进本表。
