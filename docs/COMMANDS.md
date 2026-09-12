# Domain Command API

单一写入路径：`dispatchCommand(cmd, meta)`（`AppContext`）。  
作业中台表单按钮与 IP Agent 工具 / HITL **共用**同一组命令，保证交接状态、产物、Docket 回写一致。

审计条目：`{ actor: 'user' | 'agent', agentId?, command, caseId, at, detail }`

## 命令列表

| Command | 作用 | 典型校验 |
|---------|------|----------|
| `submitResearch` | 提交调研报告交接 | 命中绑定 / 角色 |
| `approveHandoff` | 批准策略 | 企业角色 · HITL |
| `requestChanges` | 退回修改 | 企业角色 · HITL |
| `advanceStage` | 阶段晋级 | 清单齐套 |
| `submitClaims` | 提交权利要求 | 撰写清单 |
| `analyzeAndSubmitOA` | 提交 OA 答复 | 争点策略 |
| `authorizeFile` | 授权递交 | 企业 · HITL · 发票阻塞 |
| `fileResponse` | 递交归档 + Docket 回写 | 回执号/日期 · 代理或自助 |
| `confirmQuote` | 确认立项报价 | 企业 |
| `assignAgency` | 派单代理所 | 租户 |
| `issueInvoice` | 开票 | — |
| `payInvoice` | 付款解锁 | HITL/财务 |
| `createCaseFromInsight` | 洞察立项建案 | — |
| `saveDraft` / `submitHandoff` / `startReview` | 通用交接 | 角色状态机 |

HITL **不可跳过**：Go/No-Go、批准策略、授权递交、付款解锁。Agent 可提案（submit），不可越权批准。

## 表单 vs Agent 触发映射

| 领域命令 | 作业中台（Form） | IP Agent |
|----------|------------------|----------|
| `submitResearch` | 调研工作台「提交企业审核」 | 正式执行产物就绪后 HITL 批准链中的 submit；工具语义 `submit_for_review` |
| `approveHandoff` | 交接栏「批准策略」 | HITL「批准策略」 |
| `requestChanges` | 交接栏「退回修改」 | HITL「退回修改」 |
| `advanceStage` | 调研「转入立项闸门」 | （等效演示后可接表单） |
| `analyzeAndSubmitOA` | 审查答复「提交」 | OA Agent HITL 链 submit；`analyze_oa` 草稿 |
| `authorizeFile` | 交接栏「授权递交」 | HITL「授权递交」 |
| `fileResponse` | 审查答复「递交归档」+ 回执 | 授权后「递交归档（FileResponse）」；工具 `file_oa_response` / `write_docket_event` |
| `confirmQuote` | 立项确认报价 | 立项 Agent HITL |
| `assignAgency` | 案件详情派所 | 工具 `assign_agency`；布局 HITL / 等效演示 |
| `issueInvoice` / `payInvoice` | 费用中心 / 案件发票 | 年费 HITL `pay_unlock` → PayInvoice |
| `createCaseFromInsight` | 赛道/布局/创新「生成案件」 | 工具 `create_case_from_insight`；布局 HITL / 等效演示 |

## 试运行 vs 正式执行

- **试运行**：只追加 transcript / tool cards，**不**调用 `dispatchCommand`。
- **正式执行**：transcript + HITL 批准时以 `actor:'agent'` 写入领域。
- **一键等效演示**（调研 / OA / 交底 / 权利要求 / 立项 / 年费 / 监控 / 转化 / 布局）：瞬时回放 mock 步骤并按当前角色写入命令链；UI 标注「演示捷径 · 正式产品应逐步 HITL」。

## Demo 路径

1. **IP Agent → 调研**：会话绑 `c2` →「正式执行」→ HITL 批准 → `submitResearch`（+ 企业角色下 `approveHandoff`）→ 案件交接与表单一致；审计 `actor: agent`。
2. **IP Agent → OA**：会话绑 `c1` → 正式执行 / HITL 授权 →「递交归档（FileResponse）」→ Docket 业务回写；或「一键等效演示」按角色推进。
3. **表单路径**：`/workbench/research/:id`、`/workbench/prosecution/:id` 交接栏同样走 `dispatchCommand`（`actor: user`）。
4. **审计**：案件详情「最近领域命令」与 Agent 右侧「领域命令审计」可对比 `user` vs `agent`。

## UI 提示

工具成功 / HITL 后显示：`已写入领域：SubmitResearch`（等）。  
「在作业中台打开」链到 `/cases/:caseId` 与对应工作台表单。


## HITL 闸门 → 领域命令

会话 HITL 栏按 **gate id** 分派（`gateToAction` / `sessionHitlAction`），**不是**全部映射到 approve：

| Gate id | 领域命令路径 | 角色 |
|---------|--------------|------|
| `approve_strategy` | submit → startReview → **approveHandoff**（调研=`submitResearch`；权利要求=`submitClaims`；交底=`submitHandoff`+`approveHandoff`；OA 同 approve） | 企业批准；代理所仅 submit |
| `authorize_file` | submit → startReview → **authorizeFile** | 仅企业；代理所发票阻塞 |
| `go_nogo` | submit → startReview → **confirmQuote**（立项 Go） | 仅企业 |
| `confirm_quote` | submitHandoff → startReview → **confirmQuote** | 仅企业 |
| `pay_unlock` | **payInvoice**（本案逾期/已开票/待开票发票） | 有发票才可；无则提示 |
| `request_changes` | **requestChanges** | 企业 / 代理 |

闸门清除写入 `session.clearedHitlGates`（+ system step），SPA 会话状态刷新后仍保留。


## 案级上下文契约（与 Command 同读）

办理写入仍经 `dispatchCommand`；**读路径**另有版本化案级快照：

- `src/domain/caseContextContract.ts` · `CASE_CONTEXT_SCHEMA_VERSION`
- 证据包导出带 `schemaVersion` + `caseContext`
- **纪律**：契约字段/语义变更须 bump 版本（详见 [`HARNESS.md`](./HARNESS.md)「案级上下文契约」）

## Audit schema + 回放

- `AUDIT_SCHEMA_VERSION`（`src/domain/commands.ts`，当前 `2026.09.1`）
- `pushAudit` 写入时强制带 `schemaVersion`；缺版本显示 / 导出为 `legacy`
- CaseDetail 审计 Tab：**审计回放**面板（时间序步进）
- 证据包命令序一节带每条 `schemaVersion`
- **纪律**：AuditEntry 形状/语义变更须 bump 版本（详见 [`HARNESS.md`](./HARNESS.md)）

## Skills guardrails（中央校验）

- `evaluateGuardrails`（`src/domain/guardrails.ts`）为 ConfirmBar / Session 闸 / Draft·Prosecution authorize|file 的 **唯一入口**
- 复用 `evaluateFullCheck` 等已有检查；不另起平行文案源
- 详见 [`HARNESS.md`](./HARNESS.md)「Skills guardrails」
