# Agent 逐步业务债修复 · P1 通用历史 + P2 S4 无案闸

> **口**：`apps/agent` · 分支 `dev` · 基线审计 `docs/audit/AGENT_STEPWISE_BIZ_2026-09-19.md`（`7057e37`）  
> **日期**：2026-09-19（CST）  
> **范围**：只改 `apps/agent/**` · 禁 Cloud · 不恢复全宽 amber / BillingHold · 不重开 mid 深链 CTA · 不抢 UI质感 Should

## P1 · sessions 心智钉「通用历史」

| 面 | 改前 | 改后 |
|----|------|------|
| `AgentSessionsList` H1 | 「全部会话」 | **「通用历史」**（筛选取「待确认 · 通用历史」等） |
| 列表 context / 空态 | 未点明 vs 项目 | 明示「通用单聊历史 · 与项目文件夹区分」 |
| `AgentSessionSidebar` 列表头 / 底链 / 空态 | 「会话」「全部会话 →」 | **「通用历史」** + 副文「通用单聊历史 · 非项目文件夹」；底链「通用历史 →」 |

主链 Nav 短标仍可写「会话」；**不作**「全部会话」主标题。

## P2 · S4 无案 Confirm 闸芯片禁用

- `sessionGates.NO_CASE_GATE_REASON` = `写入案件前须绑定`（与 `CaseBindControls` strong 同句）
- `AgentSessionWorkspace.gateDisabledReason`：无 `caseId` → 直接返回该原因（芯片 `disabled` + ConfirmBar 主因可见）
- `ExpertHitlBridge`：无案同禁；**FTO** `approve_strategy` 仍可确认口径（不写库）
- `SessionConfirmBar`：无案禁用 CTA 带 `data-testid=confirm-gate-no-case` + 显性 disabled 样式

**不做**：线程合流 / `pending_create` 接线（仍记账 P2，另单）。

## 自点

1. `/agent/sessions` 页标题含 **通用历史**
2. 无案会话打开 Confirm：主闸 CTA 不可点，可见「写入案件前须绑定」

## 自点结果（:5175 · 2026-09-19 CST）

| 项 | 结果 |
|----|------|
| `/agent/sessions` H1 | **通用历史**（无「全部会话」） |
| 侧栏列表头 / 副文 / 底链 | **通用历史** ·「通用单聊历史 · 非项目文件夹」·「通用历史 →」 |
| 无案会话 Confirm | 启动 mock → 闸 CTA `disabled` · `data-testid=confirm-gate-no-case` · title/主因 **写入案件前须绑定** · 无可点清写库闸 |

证据：`docs/ui-polish/agent-stepwise-biz-fix/`（sessions-list.png · no-case-gate-ok.png · _probe*.json）
