# Flow 精读 19 · MonetizeFlow（/workbench/monetize）

> 权威源：`apps/workbench/src/flows/monetize/MonetizeFlow.tsx`（400 行）· `packages/domain/src/guardrails.ts`（`legal_review`）· 节点总览见 [06-commercialization.md](06-commercialization.md)

## 1. 步骤序列（4 段）

`progressStep`（:121-130）：

| step | 条件 |
|------|------|
| 0 | 路径/对方主体/费率要点就绪（`termsReady && partyReady`） |
| 1 | 里程碑有内容 |
| 2 | 有里程碑 `done` 或 `in_progress`（`milestones.some(status done/in_progress)`） |
| 3 | handoff 已进 approved 族 |

**诉讼路径特殊化**：`isLitigation` 时 step 序列压缩——「路径 → 备注 → 审批」，里程碑直接跳到 3 的等价态（注释「诉讼路径不走商务里程碑：路径 → 备注 → 审批」，:121）。

## 2. 关键分支逻辑

- **路径五选一**（seed/`monetizeSeed`）：自实施 / 许可 / 转让 / 入股 / 诉讼；`isLitigation` 判定驱动整套 UI 分叉
- **诉讼路径全链路灰化**：
  - Term Sheet / 里程碑区块整体禁用（:219 原文：「诉讼路径不走商务里程碑 · 已灰化；证据/发函/立案请走监控升级维权。切回许可等路径后恢复可编辑」）
  - 提示条（:161）：「证据保全 / 发函 / 立案请走监控升级维权线索，勿把 Term Sheet 当作诉状」+ 跳转按钮「去监控台升级维权」（:165）
  - 草稿摘要行注（:85-90）：诉讼路径下里程碑行替换为「（诉讼路径不走商务里程碑）」，并附「路径标记：维权诉讼 · 商务 Term Sheet/里程碑已停用 · 法务审阅与交接仍可用」
  - 即：诉讼线**留在转化台内以 stub 形式收尾**，真办理指向 watch 的升级维权（与 07 §4 两档升级、06 §5 stub 口径闭环）
- **里程碑对象**（:51-52、:106）：`{id, label, due, done, status: pending/in-progress/done/overdue}`；新增里程碑固定 seed（`due: '2026-12-31'`，示意）
- **法务审状态**（:112-114）：`legalReviewed = legalReview === 'reviewed'`；`changes_requested` 时 `legalBlockedHint` 文案「法务已退回 · 请修订后再批准」；`inlineError` 挂区块（:355）

## 3. 闸门与条件

`validateBefore`（:365 起，注释「legalReview · 与 ConfirmBar / canPerform 同源【唯一入口】」）：

```
approve / authorize：
  legalReview === 'reviewed'  才放行
  'changes_requested'         → '法务已退回 · 请修订后再批准'
  'pending'                   → '批准前须法务已阅（非合同签署）'
（与 guardrails.ts 的 legal_review blocker 同源，UI 本地先挡一道）
```

`REQUIRED_BEFORE_SUBMIT.monetize_terms`：`terms` 核心条款 + `party` 对方主体（诉讼路径下对方主体 = 被诉方）。

## 4. 写回与命令

- 成功关键词 → 产物 `addArtifact`（Term Sheet 类）+ `nextActionsForStage('commercialization', caseId)`
- 归档 `file` 写 `monetize_terms` 回执；`CaseInvoice.relatedStage` 可挂本节点（对价走 12-billing）
- `agent-monetize`（beta 档）的 `draft_term_sheet` 出稿在 agent 侧，审批落本台

## 5. 诚实口径

- 「勿把 Term Sheet 当作诉状」「法务审阅与交接仍可用」是原文级 stub 声明；beta 档注「批准≠合同 PDF/电子签」（13-agents）

## 6. 缺口

- 里程碑 `due` 超期只标 `overdue`，无升级动作（与 docket 升级阶梯不通）
- 许可备案/强制许可无入口；费率（`royalty`）为文本，无对标模型
- 诉讼 stub 的「去监控台升级维权」是跳转提示，非自动建案（真实建案在 WatchFlow `escalateEnforcement`）
