# Flow 精读 18 · MaintainFlow（/workbench/maintain）

> 权威源：`apps/workbench/src/flows/maintain/MaintainFlow.tsx`（670 行）· `src/data/docketRules.ts`（`generateAnnuitySchedule`）· `packages/domain/src/guardrails.ts`（`evaluatePayUnlock`）· 节点总览见 [05-maintenance.md](05-maintenance.md)

## 1. 步骤序列（4 段）

`progressStep`（:186-192）：

| step | 条件 |
|------|------|
| 0 | 权利状态已填（`status`） |
| 1 | 年费日程非空或预算已确认（`schedule.length > 0 \|\| budgetConfirmed`） |
| 2 | 变更事项有内容（`changes.some(type/detail)`） |
| 3 | handoff 已进 `approved / authorized_to_file / filed / submitted_to_enterprise / enterprise_review` |

## 2. 关键分支逻辑

- **日程生成**（:326-336）：`generateAnnuitySchedule(grantDate || nextAnnuity || '2026-03-01', 5, annuityYear || 1)` → 未来 5 年日程，toast「已按 mock 年费规则生成未来 5 年日程」；`scheduleReady = 每行都有 due && amount`（:128-129）
- **「确认缴纳」按钮是故意禁用**（:344-357）：`disabled={payableInvoices.length === 0}`，点击仅弹错 toast「确认缴纳须走发票『付款解锁 / payInvoice』，不可直接将付款状态改为已结清」—— UI 层显式禁止绕过发票线（与 12-billing 的 `invoiceBlocked` 语义同源）
- **逐票付款解锁**（:551-588）：每张待付发票独立跑 `evaluatePayUnlock({ case, persona, role, isEnterprise, handoffStatus: getHandoff(caseId, 'maintain_annuity') })`；`payBlocked` 时按钮灰显 + 下方小字 `payReason`（如「无待付发票」「仅企业可付款解锁」「已归档」）；可付时 `dispatchCommand({ type: 'payInvoice', caseId, invoiceId })` → 成功 toast「付款解锁成功 · {title}（PayInvoice）」+ activity 追加
- **价值分层**（:399）：`showToast('已写入价值分层：' + label)`（组合价值口径，与灰显席 `expert-valuation` 呼应）
- seed 回填（:100-113）：`grantDate / annuityYear / schedule` 从案件 session seed 恢复，`normalizeMaintainRow` 逐行补默认

## 3. 闸门与条件

- 提交流（与 05 §4 一致）：`REQUIRED_BEFORE_SUBMIT.maintain_annuity` = `schedule`（年费计划）+ `budget`（官费/服务费确认）
- 付款族：仅企业（`isEnterprise`）；`pay_unlock` 闸由 `evaluatePayUnlock` 统一裁决，按钮级 disabled + 命令级校验双保险
- Full-check 不适用（`fullCheckScopeFor` 对本节点返回 null），递交归档无 Full-check 拦截

## 4. 写回与命令

- `saveDraft` 写 `grantDate/annuityYear/schedule/changes/budgetConfirmed`；`submitHandoff` 推 `maintain_annuity`
- `payInvoice` 命令核销发票（12-billing 状态机 `已开票→已付款`）
- docket 侧：`grant_registration`（授权登记 2 月）/ `annuity`（12 月循环 + 6 月滞纳宽限）；`docketComplete` 核销写 `receiptNo`
- 进度写 `flowProgressByCase[caseId].maintain`

## 5. 诚实口径

- 「mock 年费规则」（toast 原文）；官费 hint 全部示意；`payInvoice` 不触真支付（HITL Confirm 仅内存，`agent-annuity` honesty 同款）

## 6. 缺口

- **无放弃分支**：日程只能「生成 5 年」，缴不起的逾期后无「放弃 → 权利终止」UI（与 05 §8 缺口 4 同源）
- `changes`（变更事项）只有 type/detail 两列文本，移转/著录项无结构化对象
- 多国年费不建模（`generateAnnuitySchedule` 单国单档；见 09-pct）
- 价值分层是写入口径（`已写入价值分层`），无下游消费（06-commercialization 不读它）
