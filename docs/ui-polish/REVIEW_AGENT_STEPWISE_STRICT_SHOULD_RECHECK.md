# AGENT_STEPWISE_STRICT 活口复检 · Should×8 · 2026-09-19

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19 13:58 CST（Asia/Shanghai） |
| **基线评** | `REVIEW_AGENT_STEPWISE_STRICT_2026-09-19.md` |
| **修复包** | `0fe67d5` · 声称见 `agent-stepwise-strict-should/` |
| **HEAD tip** | `9d0fa99`（含 `0fe67d5`：`merge-base --is-ancestor` ✓） |
| **活口** | `http://127.0.0.1:5175` · Playwright Chromium · 1440×900 |
| **证据** | `docs/ui-polish/agent-stepwise-strict-should-recheck/`（**11 PNG** + `_probe.json`） |
| **范围** | **只 docs/证据** · **未改 `apps/`** · **未 Cloud Agent** · **未 commit/push** |
| **总评** | **Go**（Should **8/8** Pass · 硬闸 Pass） |

## 硬闸（抽检）

| 闸 | 结果 | 证据 |
|----|------|------|
| 无 mid 深链 `a[href*=5173]` | **Pass** | Home `mid=[]` |
| 无 BillingHold 全宽黄条 | **Pass** | `[data-billing-hold-banner]` false |
| Home 案件入口 = 1 | **Pass** | `home-case-bind` count=**1** |

## Should×8

| ID | 结果 | 一行证据 |
|----|------|----------|
| **SS-S-S0-1** | **Pass** | Home 标题下无双行 11px meta；「说明」popover 默认合上（`home-meta-help`） |
| **SS-S-S3-1** | **Pass** | `sess-oa-1` 见「调用组 · OA 争点分析 ×2」·「默认折叠细节」；无 3× 同文墙 |
| **SS-S-S4-1** | **Pass** | `?focus=hitl` 右栏 `aside-hitl-collapse` 默认合（「案件与 Agent 概况」）；Confirm 在 |
| **SS-S-S5-1** | **Pass** | 绑案后会话无「切换到该 Agent」实心条；`session-match-switch` 无 |
| **SS-S-S6-1** | **Pass** | `/sessions?filter=needs_human` H1=「待确认会话」；无「待确认 · 通用历史」 |
| **SS-S-S7-1** | **Pass** | Assist tier-note `-webkit-line-clamp:1`（高≈17）；卡高差 Core205→Assist238 已收敛 |
| **SS-S-S8-1** | **Pass** | 项目列表/新建表无人话面 `DomainPack`/`mock`/`pack=`；见「领域包」 |
| **SS-S-S9-1** | **Pass** | `expert-search` 无「布尔检索 →」链；步骤「检索式/命中/工作篮/策略确认」人话 |

## 方法

1. 确认 `0fe67d5` 为 `HEAD` 祖先；tip=`9d0fa99`
2. 活口 Playwright 走 Home / `sess-oa-1` / `?focus=hitl` / 绑案会话 / needs_human / Catalog / projects / expert-search
3. DOM 文案 · 折叠态 · 卡高 · 行话扫检；**未**橡胶章 fix 包 `_probe.json`
4. 证据写入 `agent-stepwise-strict-should-recheck/`

## Overall

**Go** — Should **8/8** Pass；硬闸全 Pass。Fail 列表：无。

---
*UI评估助手 · STRICT Should recheck · 2026-09-19 13:58 CST*
