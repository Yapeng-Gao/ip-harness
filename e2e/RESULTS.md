# Playwright e2e RESULTS · L0 + L1 + api-mock 起/停 + 并行壳 L0

**实现日期：** 2026-09-12（UTC+8）  
**最近完整跑测时间（12/12 齐口）：** 2026-09-18 10:34（UTC+8）· 五壳 + api + 并行六壳齐口 · 21 passed  
**本轮跑测时间：** 2026-09-21 10:56（UTC+8）· becca1e 后 L0-AG-01/S0 地标改「我的案子」并复跑主门禁  
**依据：** `e2e/PLAN-L0-L1.md` §7 已决 · `e2e/PLAN-API-MOCK-SMOKE.md` §7 已决 · `e2e/PLAN-L0-PARALLEL-5182-5187.md` §6 已决 · `e2e/REVIEW_RUBRIC.md` · 总控 becca1e（`/agent`=我的案子；Catalog→`/agent/catalog`）  
**host：** 一律 `localhost`（禁止 `127.0.0.1`）  
**Command（本轮）：** `npm run test:e2e -- --project=mid --project=workbench --project=agent --project=ops --project=iam --project=chromium`；另 `-g 'S0 Home' --project=agent-stepwise` 复验  
**webServer：** 无（主 6/6 齐口）  
**Browser：** Chromium（headless）  
**本轮合计：** **15 passed**（主门禁 · 33.3s）；**L0-AG-01 PASS**（511ms）；agent-stepwise **S0 PASS**（1.8s）  
**失败：** 无

## 最新跑测（2026-09-21 10:56 UTC+8 · 周一）

**巡检命令：** `curl -sS --max-time 3` 检查旧壳、api-mock、并行壳。  
**结论：** 主门禁齐（5173–5177 + 5180/health 均 200 / `ok===true`），故跑非并行 project；并行壳 5182–5187 全部 DOWN，记「未跑」（不挡主绿盘，禁止假绿）。  
**过滤原因：** 全量含 search/fto/mining/inspire/landscape/figure 会在端口 DOWN 时 Fail；故用 `--project` 排除并行六壳，只覆盖既有主门禁 15 条。  
**与上次完整回归相比：** 2026-09-18 为 12/12 UP、21 passed；本轮主 6/6 UP + 并行 0/6、主测 **15/15** 绿。  
**本轮纪律：** 未改 `apps/`；仅改 e2e 地标 + RESULTS；禁止假绿。

### 端口矩阵（本轮 curl · 跑前）

| 壳 / 服务 | 端口 | URL | curl | 跑测 |
|-----------|------|-----|------|------|
| mid | 5173 | `http://localhost:5173/` | 200 | PASS |
| workbench | 5174 | `http://localhost:5174/workbench` | 200 | PASS |
| agent | 5175 | `http://localhost:5175/agent` | 200 | PASS（地标=我的案子） |
| ops | 5176 | `http://localhost:5176/` | 200 | PASS |
| iam | 5177 | `http://localhost:5177/login` | 200 | PASS |
| api-mock | 5180 | `http://localhost:5180/health` | 200 · `ok===true` | PASS |
| search | 5182 | `http://localhost:5182/` | DOWN | 未跑 |
| fto | 5183 | `http://localhost:5183/` | DOWN | 未跑 |
| mining | 5184 | `http://localhost:5184/` | DOWN | 未跑 |
| inspire | 5185 | `http://localhost:5185/` | DOWN | 未跑 |
| landscape | 5186 | `http://localhost:5186/` | DOWN | 未跑 |
| figure | 5187 | `http://localhost:5187/` | DOWN | 未跑 |

**门禁：** 主 6 project 退出码 **0**（15 passed）。并行 DOWN 仍记「未跑」。

## 端口矩阵（上次完整齐口 · 2026-09-18 10:34 UTC+8）

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

纪律：端口不齐则该口 RESULTS 写「未跑」、禁止假绿。2026-09-18 为 12/12 可达全量绿。

## L0（零 click）· 五壳 + api（本轮 2026-09-21 10:56）

| ID | 壳 | 结果 | 备注 |
|----|----|------|------|
| L0-MID-01 | mid:5173 | PASS | heading「资产与任务」可见 · 1.3s |
| L0-WB-01 | workbench:5174 | PASS | heading「业务工作台」 · 942ms |
| L0-AG-01 | agent:5175 | PASS | heading「我的案子」+ `business-cases-page` · 511ms · 零 click |
| L0-OPS-01 | ops:5176 | PASS | 运维标题可见 · 940ms |
| L0-IAM-01 | iam:5177 | PASS | heading「IP Harness」 · 969ms |
| L0-API-01 | api:5180 | PASS | GET /health → 2xx + `body.ok === true` · 33ms |

## L0（零 click）· 并行壳 5182–5187（本轮）

**计划：** [`PLAN-L0-PARALLEL-5182-5187.md`](./PLAN-L0-PARALLEL-5182-5187.md) §6 已决 · spec：`l0-parallel-smoke.spec.ts`

| ID | 壳 | 端口 | 结果 | 备注 |
|----|----|------|------|------|
| L0-SEARCH-01 | search | 5182 | 未跑 | curl DOWN |
| L0-FTO-01 | fto | 5183 | 未跑 | curl DOWN |
| L0-MINING-01 | mining | 5184 | 未跑 | curl DOWN |
| L0-INSPIRE-01 | inspire | 5185 | 未跑 | curl DOWN |
| L0-LANDSCAPE-01 | landscape | 5186 | 未跑 | curl DOWN |
| L0-FIGURE-01 | figure | 5187 | 未跑 | curl DOWN |

## L1（本轮 2026-09-21 10:56）

| ID | 路径 | 结果 | 备注 |
|----|------|------|------|
| L1-01 | iam:5177 → mid「资产与任务」 | PASS | 1.6s |
| L1-02 | sess-oa-1 HITL CTA 可见（不点） | PASS | 1.6s |
| L1-03 | `/cases/c1?tab=audit`「最近领域命令」 | PASS | 1.7s |
| L1-04 | `localhost:5176/config#alerts` | PASS | 1.2s |
| L1-05 | `/workbench` + `/workbench/research` | PASS | 2.3s |
| L1-06 | `/agent/agents` 9 heading | PASS | 1.6s |
| L1-07 | sess-disclosure-1 启动 → HITL | PASS | 9.5s |

## api-mock 起/停（P0×3 · §7 已决 · 本轮）

| ID | 前置 | 结果 | 备注 |
|----|------|------|------|
| L0-API-01 | **5180=起** | PASS | 升格：`ok === true`（见上 L0 表） |
| L1-API-UP-01 | **5180=起**；enterWorkspace → mid | PASS | 只验读：`/v1/cases` + 地标 · 1.7s；无写/dispatch |
| L1-API-DOWN-01 | enterWorkspace → mid 后 **page.route 模拟不可达，进程仍起** | PASS | 模拟 5180 不可达 → fallback 壳可用 · 2.0s；**非**关开关 |

口径：开关 `=0` ≠ 停服；DOWN **禁止**标成「关开关」。未跑 L0-API-02（已砍）。

## 失败详情（本轮）

无。主门禁 15/15 绿。

### 地标变更备注（2026-09-21 · becca1e）

- `/agent` 冷启动 = **「我的案子」**（`BusinessCasesPage` · `data-testid=business-cases-page`）；Catalog 迁 **`/agent/catalog`**（不再是 L0-AG 主断言）。
- `e2e/l0-smoke.spec.ts` L0-AG-01 → `getByRole('heading', { name: '我的案子' })` + `getByTestId('business-cases-page')`（零 click）。
- `e2e/agent-stepwise-s0-s2.spec.ts` S0：硬闸（origin=5175 / 无 mid）保留；地标改「我的案子」+ `business-cases-page`；断言无 `patent-catalog-page`；业务面侧栏隐藏故去掉 `agent-side-nav`。
- **未改** `apps/`。

## 偏差

1. **`workers: 1`**：本机多壳 Vite 并存时 free RAM 约 ~900Mi；默认多 worker 曾致 search/mining/inspire `page.goto: Page crashed`。config 钉 `workers: 1` 以保证稳定；未改断言口径。
2. 未改 `apps/`；5182–5187 **未**写入 `APP_PORTS`（§6 E）。
3. Hunt 不进本表；agent-stepwise 本轮仅复验 S0（PASS），S1+ 未跑（S1/S2 仍指向旧 compose 入口，业务模式后可能 Skip/Fail，未本轮扩改）。
4. 本轮并行壳未起 → 六条 L0 并行仍记「未跑」；全量齐口回归仍待并行壳 UP 后补跑。
