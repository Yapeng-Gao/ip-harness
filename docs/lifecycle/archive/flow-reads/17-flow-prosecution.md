# Flow 精读 17 · ProsecutionFlow（/workbench/prosecution）

> 权威源：`apps/workbench/src/flows/prosecution/ProsecutionFlow.tsx`（475 行）· `packages/domain/src/guardrails.ts` · 节点总览见 [04-prosecution.md](04-prosecution.md)

## 1. 步骤序列（4 段）

`progressStep`（:143-149）：

| step | 条件 |
|------|------|
| 0 | OA 日期 / 期限已登记（`oaDate \|\| deadline`） |
| 1 | 至少一条争点有策略 + 答复要点（`issues.some(strategy && response)`） |
| 2 | 修改后权利要求有正文（`claimAmended.trim()`） |
| 3 | 陈述已确认或 handoff 已进 `approved/authorized_to_file/filed` |

## 2. 关键分支逻辑

- **争点类型映射**（`mapIssueType`，:64-70）：seed 文案→类型码 `新颖性→novelty / 创造性→inventiveness / 清楚性→clarity / 支持→support_disclosure / 其他→other`；`oaStrategyNotes` 由「策略：答复」拼接生成（guardrail 读的就是这个拼接串）
- **OA 陈述确认**（:195、:290-326）：未确认时顶部常驻提示条；确认动作 `patchSession(s.id, { oaStatementConfirmed })`，行注「对齐 Agent oaStatementConfirmed · 授权/递交前必勾」
- **`checkedRequired` 动态化**（:404-411 前）：`strategy` 勾项按「有策略」出现、`claims_amended` 按「有修改权项」出现 —— 与 `REQUIRED_BEFORE_SUBMIT.prosecution_response` 两项对齐但条件化展示

## 3. 提交闸门（`validateBefore`，:404-437）

```
a === 'submit'：
  无任何争点策略+答复要点 → '请至少完成一条争点的策略与答复要点'
a ∈ authorize / file：
  evaluateGuardrails({ agent: agent-oa, session: {oaStatementConfirmed, oaIssueType, oaStrategyNotes},
                       action, persona, role, handoffKey: 'prosecution_response', fullCheckLite })
  → firstGuardrailMessage（oa_meta / oa_statement / full_check blocker，与 ConfirmBar 同源【唯一入口】）
```

## 4. 写回与命令（`onResult`，:438-467）

- **submit 成功**：`markChecklistDone(['c1','c2'])` + 产物 `意见陈述书_代理稿.docx`（kind 答复）+ drive item「答复策略已提交（争点 X · 策略）」+ `setStep(3)`
- **authorize/file 成功**：全勾 `['c1'..'c4']` + 产物 `意见陈述书_已确认.docx`；msg 含「归档/递交」→ `setDocketBanner({caseId})` + toast「已追加 Docket 事件（OA 答复已递交）」—— 期限回写在**归档/递交**瞬间生成
- next 按钮：`nextActionsForStage('prosecution', caseId)`（msg 含 提交/批准/授权/递交/归档 时展示）

## 5. 诚实口径

- 无真 OA 通知书：`seed.issues / claimOriginal / claimAmended / feeReminder` 全 seed；延期费为逐月累进 hint 文案（与 11-docket 一致）
- 「仅已 file 案件可走」由 agent 侧 honesty 维持

## 6. 缺口

- 多轮 OA 无轮次对象（与 04 §8 同源）：`issues` 数组按 seed 一条起，不通/二通切换靠换 seed 案件
- `oaStatementConfirmed` 是 case 级单值（`c?.oaStatementConfirmed`），多轮答复会互相覆盖
- `checkedRequired` 的条件化展示与 required 语义存在缝隙：`claims_amended` 实际非必带（「如需」），UI 勾选只是提示
