# Agent 逐步走查 · Hunt/CDP Evidence SUMMARY（S0–S9）

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai · ~12:00 CST） |
| **对象** | Agent 壳 `@ip/agent` · **localhost:5175** |
| **CasePack** | `CP-agent-stepwise` |
| **脚本** | `npm run hunt:agent-stepwise` |
| **runId** | `82c164aa-2c88-4acb-b124-b80880a3641b` |
| **status** | **passed** · steps=7 · findings fail_hard=0 · suspect=0 |
| **telemetry** | `enhancedTelemetry: 'network'` · heap=false · failed=0 · reqs≈774 |
| **禁止** | CloudAgent / L5 / 改 `apps/` · 不挡合并 |
| **Evidence 根** | `docs/ui-polish/agent-stepwise-hunt/` |

## S0–S9 总表

| ID | 结果 | 一句 |
|----|------|------|
| S0 | **Pass** | Home：竖导航、待确认、compose、单套 CaseBind |
| S1 | **SoftSkip** | 创建绑案可选；入口可见，完整流未强制自动化 |
| S2 | **Pass** | 无案点「开始办理」→ `/agent/sessions/:id`，无强制绑案挡死 |
| S3 | **Pass** | 轨迹可见（新会话系统步 + 种子 mock 剧本） |
| S4 | **Pass** | `sess-oa-1?focus=hitl` ConfirmBar「批准策略」可见可点 |
| S5 | **Pass** | 会话顶栏 CaseBind（创建/绑定/已绑）可见 |
| S6 | **Pass** | `/agent/sessions?filter=needs_human` 列表+待确认筛选 |
| S7 | **Pass** | `/agent/agents` Catalog |
| S8 | **Pass** | `proj-demo-general` 无专利步骤 |
| S9 | **Pass** | `proj-demo-patent/bots/expert-search` 专家私聊 |

## findings

计数：**fail_hard=0 · suspect=0** · 列表：_无_  
（样机白名单：Beta·非采购闭环 / 会话待确认 / HITL 等待 等不记缺陷）

## 硬闸对照

| 闸 | 观察 | 结论 |
|----|------|------|
| 无 mid 深链 | Home body 无 `:5173` | **Ok**（无 finding） |
| 无 BillingHold 全宽黄条 | `[data-billing-hold-banner]=0` | **Ok** |
| Home 案件入口=1 | `home-case-bind` count=1 | **Ok** |

## artifacts

- 本目录 `artifacts/step-001.png` … `step-007.png`
- `artifacts/report.json` / `artifacts/report.md`
- 源跑：`tools/e2e-hunt/artifacts/82c164aa-2c88-4acb-b124-b80880a3641b/`

## 截图 ↔ 步

| 文件 | 覆盖 |
|------|------|
| step-001 | S0 Home（+S1 SoftSkip 同屏入口） |
| step-002 | S2 新会话 · S3 轨迹雏形 · S5 顶栏绑案 |
| step-003 | S4 HITL ConfirmBar（+S3 种子轨迹 · S5 已绑） |
| step-004 | S6 待确认列表 |
| step-005 | S7 Catalog |
| step-006 | S8 general 项目 |
| step-007 | S9 patent 专家私聊 |

## SHA



`94f2e22f4fa294ead0ef0e48a27f91f712b14a5b`

- 新 CasePack：`tools/e2e-hunt/src/casepacks/cp-agent-stepwise.ts`
- Observer 自定义断言：`agent-s0-home` … `agent-s9-project-patent`（复用 `hitl-confirm-bar`）
- 脚本：`hunt:agent-stepwise`
- 未改 `apps/` · 未开 L5 · 未动 e2e L0 合并闸
