# Agent 壳 · 总控闭环① e2e · AGENT_LOOP_E2E

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai · ~10:30 CST） |
| **对象** | Agent 壳 `@ip/agent` · **localhost:5175** |
| **范围** | L0-AG-01 + critical-paths 中 agent 相关 L1（L1-02 / L1-06 / L1-07） |
| **禁止** | L5 / 深交互新用例 · 未改 `apps/` |
| **Command** | `npx playwright test --project=agent` · `npx playwright test e2e/critical-paths.spec.ts --grep 'L1-02\|L1-06\|L1-07'` |
| **Browser** | Chromium headless · `workers: 1` |
| **依赖口** | iam:5177（enterWorkspace）· api-mock:5180/health · 均已起 |

## 端口（跑前 curl）

| 服务 | URL | curl |
|------|-----|------|
| agent | `http://localhost:5175/` | **200** · ~4ms |
| agent home | `http://localhost:5175/agent` | **200** |
| iam（L1 登录） | `http://localhost:5177/` | **200** |
| api-mock | `http://localhost:5180/health` | **200** |

## 用例结果

| ID | 名称 | Pass/Fail | 备注 |
|----|------|-----------|------|
| L0-AG-01 | agent home / 办理入口 | **Pass** | project `agent` · 498ms · 「要办哪件事」/发送\|启动/办理目标 |
| L1-02 | sess-oa-1 HITL CTA 可见（不点） | **Pass** | chromium · 1.6s · `.confirm-hitl` +「批准策略」只可见不点 |
| L1-06 | `/agent/agents` 9 heading | **Pass** | chromium · 1.5s · 目录 9 heading，未点卡 |
| L1-07 | sess-disclosure-1 启动 → HITL CTA | **Pass** | chromium · 9.9s · queued→启动\|发送→HITL |

## 合计

**4 passed · 0 failed**（L0×1 + L1×3）· 墙钟约 ~16s（分两次调用）

## 失败详情

无。

## 结论

Agent 壳 :5175 冒烟全绿，**可进下一环优化**（闭环后续手感/布局项）。本轮未改产品代码、未扩 L5。
