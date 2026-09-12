# IP Harness · 一套运行时 + 多个专业 Agent

## 一句话

**一套 Harness 运行时**编排 Session / Tools / HITL / Command；**多个专业 Agent**以插件挂载，各自携带不同的 systemPrompt、tools、hitlGates 与 RACI。Agent **不直接改库**，只经共享 `dispatchCommand`。

## 为什么要「一套 + 多个」

| 层 | 职责 | 是否可插拔 |
|----|------|------------|
| Harness 运行时 | 会话、编排、工具卡片、HITL 面板、Command API | **唯一** |
| 专业 Agent | 领域策略、工具集、人工闸门、交接键 | **多个** |

作业中台（Form SaaS）与 IP Agent **共用**领域命令（交接 / Docket / 发票 / 派所），审计 `actor: user | agent`。详见 [`COMMANDS.md`](./COMMANDS.md)。

## Harness 核心

1. **Session** — 对话 + 案件/目标绑定（Cursor 隐喻）
2. **Orchestrator** — 思考 → 工具调用 → 产物 → HITL
3. **Tools** — 按 Agent 声明的 `tools[]` 展示卡片（mock）
4. **HITL** — 仅展示**当前 Agent** 声明的闸门；授权递交始终尊重发票阻塞
5. **Command API** — `dispatchCommand` 唯一写库入口

## 专业 Agent（插件）

每个 `AgentDef` 包含：

- `systemPromptBrief` — UI 展示的短中文提示
- `tools[]` — 可用工具
- `hitlGates[]` — 该 Agent 必经人工闸
- `raciHint` — 典型 R/A
- `handoffKey` / `stage` / `workbenchPath` — 与表单中台对齐
- `tier` / 可选 `tierNote` — **Core / Assist / Beta** 平台成熟度分层

**平台分层纪律**：Core = 主办理闭环（可当采购主路径）；Assist = 辅助薄层；Beta = 非采购闭环（诚实空态/缺口）。勿把 Assist/Beta 卖成 Core。

### HITL 闸标签

| 键 | 中文 |
|----|------|
| `go_nogo` | 立项 Go/No-Go |
| `approve_strategy` | 批准策略 |
| `authorize_file` | 授权递交 |
| `pay_unlock` | 付款解锁 |
| `confirm_quote` | 确认报价 |

### 目录（示意 · 含分层）

- **Core** 调研检索 · `approve_strategy`
- **Core** 交底整理 · `approve_strategy`（发明人交底 → 结构化披露 → 撰写）
- **Core** 立项评估 · `go_nogo` + `confirm_quote`
- **Core** 权利要求撰写 · `approve_strategy` + `authorize_file`
- **Core** OA 答复 · `approve_strategy` + `authorize_file`
- **Core** 年费维持 · `pay_unlock`
- **Assist** 监控预警 · `approve_strategy`（告警辅办；维权升级长尾）
- **Beta** 转化条款 · `approve_strategy`（非采购闭环 · 无法务会签闸）
- **Beta** 布局洞察 · `approve_strategy`（非采购闭环 · 矩阵仍薄）

## Auto 路由

会话选择「IP-Harness · Auto」时，Harness 按以下优先级推荐专业 Agent，并在会话横幅展示中文理由（如「因为案件处于审查答复且交接待授权」）：

1. 交接 / 开放 HITL 需求（阶段 + handoff 状态）
2. 案件阶段映射（RACI：代理所偏执行、企业偏审批闸门）
3. 目标关键词
4. 默认调研检索

可在会话中一键切换到建议 Agent。

## 代码入口

- 类型：`src/types/index.ts` → `AgentDef` / `HitlGateId`
- 目录：`src/data/agents.ts` → `AGENT_CATALOG` / `HITL_GATE_LABELS` / `suggestAgent`
- 架构页：`/agent/harness`
- 目录页：`/agent/agents`
- 会话：`/agent/sessions/:id`（闸清单 + 差异化 HITL）

## HITL 闸门 → 命令（摘要）

| 闸门 | Command |
|------|---------|
| approve_strategy | Submit* / ApproveHandoff |
| authorize_file | AuthorizeFile |
| go_nogo / confirm_quote | ConfirmQuote |
| pay_unlock | PayInvoice |
| request_changes | RequestChanges |

详见 [`COMMANDS.md`](./COMMANDS.md)。


## 案级上下文契约（Case Context Contract）

Agent / 作业中台 / 案件详情 **同读**一份版本化快照，后续回放不靠口头约定。

| 项 | 说明 |
|----|------|
| 常量 | `CASE_CONTEXT_SCHEMA_VERSION`（当前 `2026.09.1`） |
| 入口 | `src/domain/caseContextContract.ts` → `buildCaseContext` / `buildCaseContextFromSession` |
| 快照字段 | `schemaVersion` · `caseId` · `stage` · `artifacts[{key,status}]` · checklist 摘要 · gates · Persona 可见性 · 可选 tier Agent hints · 会话绑定对齐 |
| UI | 案件概览 / Agent 会话侧栏「上下文契约 vX」只读折叠摘要 |
| 导出 | `caseEvidencePack` 含 `schemaVersion` + `caseContext` 一节 |

### 契约纪律

1. **字段或语义变更必须 bump** `CASE_CONTEXT_SCHEMA_VERSION`（建议 `YYYY.MM.N`）。
2. 消费者（Agent / 工作台 / 证据包 / 回放）按 `schemaVersion` 分支；禁止 silently 改形状。
3. 会话读取走薄对齐：`session.caseId` ↔ 本案 `id`（`sessionBind.aligned`），勿另起平行真相源。
4. 本契约是 **内存快照**，不是事件溯源库。

## Command / Audit schema（回放）

领域命令审计条目带版本，支持按案时间序回放（原型 · 内存 `auditLog`）。

| 项 | 说明 |
|----|------|
| 常量 | `AUDIT_SCHEMA_VERSION`（当前 `2026.09.1`，与契约对齐） |
| 入口 | `src/domain/commands.ts` → `AuditEntry.schemaVersion`；`AppContext.pushAudit` 写入 |
| UI | CaseDetail「审计」Tab → **审计回放**面板（步进 / 列表高亮） |
| 导出 | 证据包「审计命令序」含每条 `schemaVersion`；缺版本 = `legacy` |

### 纪律

1. **AuditEntry 形状或审计语义变更必须 bump** `AUDIT_SCHEMA_VERSION`。
2. 新写入经 `pushAudit` **必须**带版本；旧条目缺字段 UI/导出显示 `legacy`。
3. 本日志是 **内存数组**，不是事件溯源库 / 分布式 tracing。

## Skills guardrails（中央校验）

HITL / 工作台授权递交硬闸共用中央函数，避免 ConfirmBar 与 Flow「一边挡一边不挡」。

| 项 | 说明 |
|----|------|
| 入口 | `src/domain/guardrails.ts` → **`evaluateGuardrails`**【唯一入口】 |
| 出参 | `{ ok, blockers[] }`；UI 取 `firstGuardrailMessage` |
| 复用 | `evaluateFullCheck` · disclosure · OA · legal · hits_verifiable · Persona |
| 调用方 | `AgentSessionWorkspace.gateDisabledReason` · ConfirmBar `submitFile` · Draft/Prosecution/Research/Monetize/Intake |

### 纪律

1. 新硬闸优先加在 `evaluateGuardrails`，再挂 UI；禁止只在一侧复制。
2. `AgentDef.guardrails[]` 为展示文案，不以字符串解析执法。
3. 本模块是 **原型内存校验**，不是真 LLM 护栏服务。

## 不做的事

- 不引入真实 LLM
- 不破坏双产品与 Command API
- 不移除 Form SaaS
