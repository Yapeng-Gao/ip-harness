# Flow 精读 16 · DraftFlow（/workbench/draft）

> 权威源：`apps/workbench/src/flows/draft/DraftFlow.tsx`（550 行）· `src/data/flowSteps.ts` · `packages/domain/src/guardrails.ts` · `fullFilingCheck.ts` · 节点总览见 [03-drafting.md](03-drafting.md)

## 1. 步骤序列（4 段）

`progressStep`（:212-219）：

| step | 条件 |
|------|------|
| 0 | 发明主题/内容非空（`field` 或 `invention`） |
| 1 | 任一权利要求有正文（`claims.some(cl.text.trim())`） |
| 2 | 选定国别（`countries.length > 0`） |
| 3 | 递交清单全齐 + 权利要求校验通过 + 交底已批准（`filingOk && claimsValid && disclosureApproved`） |

`stepperCurrent = max(当前点击 step, progressStep, 已存 stepIndex)` —— 取地板值防回退。

## 2. 关键分支逻辑

- **国别费率表**（:29-33，示意）：CN ¥3450（申请 900+公布 50+实审 2500）/ US ¥12000 / EP ¥18000 / JP ¥10000 / KR ¥8000，均标「示意官费+代理」
- **交底包联动**（:68-97）：读 `disclosure_pack` 状态，`disclosureApproved = status ∈ approved/authorized_to_file/filed`；批准后自动把「背景/1.1 摘要」「实施例」带进草稿（`appendCaseDriveItem`，注释「实施例已自交底包引入（示意）」）
- **权利要求校验**（:127-157）：`independents = claims.filter(type==='独立')`；独立权缺前序/特征、从权缺引用编号 → `claimErrorList`；`claimsValid = 无错`
- **发票自动推送**（:110-123）：`filingCheck` 全齐且未推过（`filingInvoicePushed`）→ `appendDraftInvoice`（一次性，effect 去重）

## 3. 提交闸门（`validateBefore`，:474-494，唯一入口口径）

```
a ∈ submit / authorize / file 才校验；其余返回 null
本地表单校验（非 Agent 护栏）：
  !claimsValid                                            → '请先修复权利要求校验错误'
  无独立权利要求有正文                                      → '至少 1 项独立权利要求'
  !invention.trim()                                       → '请填写发明内容'
guardrail 同源：evaluateGuardrails({ agent: agent-claims, handoffKey: 'draft_claims',
                                      disclosureStatus, filingCheck, fullCheckLite, … })
  firstGuardrailMessage(gr) 有值 → 返回该 msg（disclosure_approved / filing_check / full_check blocker）
```

注释「与 ConfirmBar 同源【唯一入口】」—— 表单本地校验 + agent guardrail 走同一函数，避免两套口径。

## 4. 写回与命令

- `saveDraft` 写权利要求/国别；`submitClaims` 推 `draft_claims`；`authorizeFile`（`authorize_file` 闸）+ `fileResponse`（file）
- 双 tab（`panel: 'claims' | 'checklist'`）：权利要求树 vs 递交清单（`getDraftFilingCheck` 5 项）
- filed → 触发 `application_fee` + `substantive_exam_request` 两条 docket（见 03 §5）

## 5. 诚实口径

费率/官费全「示意」；实施例/背景为 seed 引入（非真撰写）；「非律师意见」由 Full-check `non_legal_stamp` 强制勾选

## 6. 缺口

- 权利要求校验只查结构（前序/从权引用），不查实质新颖/创造性（非法律引擎）
- 交底包未批准时草稿仍可写，只在 submit/authorize/file 被 guardrail 挡住（与 03 §4 一致）
- 国别费率表硬编码 5 国，与 09-pct 的多国管理不通
