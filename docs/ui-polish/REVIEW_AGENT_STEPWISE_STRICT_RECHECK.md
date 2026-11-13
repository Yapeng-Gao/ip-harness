# AGENT_STEPWISE_STRICT 活口复检 · Must×7 · 2026-09-19

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19 13:21 CST（Asia/Shanghai） |
| **基线评** | `REVIEW_AGENT_STEPWISE_STRICT_2026-09-19.md`（`41beb03`） |
| **修复包** | `b0a0a00` · 证据声称见 `agent-stepwise-strict-fix/` |
| **HEAD tip** | `3f911ce`（含 `b0a0a00`：`merge-base --is-ancestor` ✓） |
| **活口** | `http://127.0.0.1:5175` · Playwright Chromium · 1440×900 |
| **证据** | `docs/ui-polish/agent-stepwise-strict-recheck/`（**7 PNG** + `_probe.json`） |
| **范围** | **只 docs/证据** · **未改 `apps/`** · **未 Cloud Agent** · **未 commit/push** |
| **总评** | **Go**（Must **7/7** Pass · 硬闸 Pass） |

## 硬闸

| 闸 | 结果 | 证据 |
|----|------|------|
| 无 mid 深链 `a[href*=5173]` | **Pass** | 各步 `mid=[]` |
| 无 BillingHold 全宽黄条 | **Pass** | `[data-billing-hold-banner]` 全步 false |
| Home 案件入口 = 1 | **Pass** | S0 `home-case-bind` count=**1** |
| 不恢复 prototype 欠费琥珀条 | **Pass** | 未见 BillingHold / 「不停审」全宽条；S9 绑案条非琥珀 |

## Must×7

| ID | 结果 | 一行证据 |
|----|------|----------|
| **SS-M-S0-1** | **Pass** | 「常用」折叠默认合；Core pill=0；实心主 CTA 仅「开始办理」navy；待确认 chip 白底描边弱于主钮 |
| **SS-M-S2-1** | **Pass** | 视口实心主 CTA=「启动」×1；「切换到该 Agent」非实心；空态有「下一步…点启动」锚；无 Auto/Core 英文行话 |
| **SS-M-S4-1** | **Pass** | `sess-oa-1?focus=hitl` Confirm 有「去补全」；无 Full-check/Persona/HITL；字号&lt;12 节点=0 |
| **SS-M-S6-1** | **Pass** | 搜索框=1；「新建会话」实心入口=1；H1「待确认会话」文案一致 |
| **SS-M-S7-1** | **Pass** | 启动 h=40≥36；「可稍后关联案件」间距=8px；卡面实心「启动」扫视唯一 |
| **SS-M-S8-1** | **Pass** | 实心主 CTA≤1；分派 pill h=32 / 12px；composer 内容带=140≥72；右栏 orch 非实心 |
| **SS-M-S9-1** | **Pass** | 无全宽琥珀绑案条；「推进一步」为唯一实心主 CTA；下一步文案自洽；无 snake_case |

## 方法

1. 确认 `b0a0a00` 为 `HEAD` 祖先；tip=`3f911ce`
2. 活口 Playwright 走 S0→S2→S4→S6→S7→S8→S9（直链 demo URL + Home 点「开始办理」）
3. `getBoundingClientRect` / `fontSize` / 实心 CTA 计数 / 行话扫文
4. 截图 + `_probe.json` 写入 `agent-stepwise-strict-recheck/`
5. **未**橡胶章 fix 包 `_probe.json`；本轮独立复测

## Overall

**Go** — Must **7/7** Pass；硬闸全 Pass。Fail 列表：无。

---
*UI评估助手 · STRICT recheck · 2026-09-19 13:21 CST*
