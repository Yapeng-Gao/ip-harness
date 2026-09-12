# Playwright e2e RESULTS · L0 + L1 + api-mock 起/停

**实现日期：** 2026-09-12（UTC+8）  
**跑测时间：** 2026-09-12 11:05（UTC+8）  
**依据：** `e2e/PLAN-L0-L1.md` §7 已决 · `e2e/PLAN-API-MOCK-SMOKE.md` §7 已决 · `e2e/REVIEW_RUBRIC.md`  
**host：** 一律 `localhost`（禁止 `127.0.0.1`）  
**Command：** `npm run test:e2e`（`playwright test`）  
**webServer：** 无（跑前 `curl` 确认端口；未起第二套 Vite；**未杀** 5180）  
**Browser：** Chromium（headless）  
**合计：** 15 passed · 0 failed · ~21.4s（旧 13 + api-mock P0×2；L0-API-01 升格计入原 L0）

## 端口矩阵（跑前 curl）

| 壳 / 服务 | 端口 | URL | curl | 跑测 |
|-----------|------|-----|------|------|
| mid | 5173 | `http://localhost:5173/` | 200 | PASS |
| workbench | 5174 | `http://localhost:5174/workbench` | 200 | PASS |
| agent | 5175 | `http://localhost:5175/agent` | 200 | PASS |
| ops | 5176 | `http://localhost:5176/` | 200 | PASS |
| iam | 5177 | `http://localhost:5177/login` | 200 | PASS |
| api-mock | 5180 | `http://localhost:5180/health` | 200 | PASS |

## L0（零 click）

| ID | 壳 | 结果 | 备注 |
|----|----|------|------|
| L0-MID-01 | mid:5173 | PASS | heading「资产与任务」可见 |
| L0-WB-01 | workbench:5174 | PASS | heading「业务工作台」 |
| L0-AG-01 | agent:5175 | PASS | 「办理目标」/ 发送（无「要办哪件事」文案，OR 地标命中） |
| L0-OPS-01 | ops:5176 | PASS | heading「运维面总览」 |
| L0-IAM-01 | iam:5177 | PASS | heading「IP Harness」 |
| L0-API-01 | api:5180 | PASS | GET /health → 2xx + `body.ok === true`（兼看 mock/service） |

## L1

| ID | 路径 | 结果 | 备注 |
|----|------|------|------|
| L1-01 | iam:5177 → mid「资产与任务」 | PASS | enterWorkspace 强制 `localhost:5177/login` |
| L1-02 | sess-oa-1 `.confirm-hitl` CTA 可见 | PASS | 「批准策略」可见，未点 |
| L1-03 | `/cases/c1?tab=audit`「最近领域命令」 | PASS | 未点导出 |
| L1-04 | `localhost:5176/config#alerts` | PASS | 「通知渠道」+ 试发点击一次 |
| L1-05 | `/workbench` + `/workbench/research` | PASS | 「业务工作台」+「立项前调研」 |
| L1-06 | `/agent/agents` 9 heading | PASS | 仅 heading，未点卡 |
| L1-07 | sess-disclosure-1 启动 → HITL | PASS | 唯一 play 启动 click · ~9.4s |

## api-mock 起/停（P0×3 · §7 已决）

| ID | 前置 | 结果 | 备注 |
|----|------|------|------|
| L0-API-01 | **5180=起** | PASS | 升格：`ok === true`（见上 L0 表） |
| L1-API-UP-01 | **5180=起**；enterWorkspace → mid | PASS | 只验读：`waitForResponse` `/v1/cases` +「资产与任务」；无写/dispatch |
| L1-API-DOWN-01 | enterWorkspace → mid 后 **page.route 模拟不可达，进程仍起** | PASS | `route.abort('http://localhost:5180/**')` → goto mid `/`；地标可见+可交互；**非**关开关 |

口径：开关 `=0` ≠ 停服；DOWN **禁止**标成「关开关」。未跑 L0-API-02（已砍）。

## 偏差

无。对齐 api-mock §7：UP 只读、砍 L0-API-02、DOWN 仅 page.route、壳仅 mid、强制 enterWorkspace、L0-API-01 `ok === true`。旧 13 不红。
