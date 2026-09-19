# agent-surface · Agent 产品面（:5175）

> **样机诚实**：`apps/agent` 是 Cursor 式 UI + `AGENT_CATALOG` + 会话内存 + ConfirmBar；工具为 **mock 卡片**（`AgentDef.tools[]`）；试运行不写库；正式/HITL 才 `dispatchCommand(actor:'agent')`。**无**真 LLM、**无**真 MCP、**无**已实现的 DSH/Codex runtime。  
> **落地目标**：5175 仍是**产品壳**；会话/HITL 走 **agent-session**；① runtime = DSH 和/或 Codex app-server；自有 Persona / HITL / DomainCommand 做领域闸；**禁 Agent 直写库**。

权威：[../../HARNESS.md](../../HARNESS.md) · [../enterprise/agent-platform.md](../enterprise/agent-platform.md) · [../enterprise/agent-runtime-options.md](../enterprise/agent-runtime-options.md)。  
Catalog 源：`src/data/agents.ts`（`AGENT_CATALOG` / `AgentDef`）；类型：`@ip/domain`。

## 1. 产品面路由（样机）

| 路由 | 意图 |
|------|------|
| `/agent` | Home |
| `/agent/sessions` | 会话列表 |
| `/agent/sessions/:id` | 会话工作区（Composer + Confirm + 上下文） |
| `/agent/agents` | Catalog |
| `/agent/harness` | Harness 架构说明页（目标形状，非已实现 runtime） |
| `/agent/skills` · `/agent/tools` | → Catalog |

## 2. Catalog · 会话 · Confirm

| 块 | 样机 | 落地 |
|----|------|------|
| Catalog | `AGENT_CATALOG`；tier Core/Assist/Beta | 版本化配置；勿卖 Beta 当 Core |
| Session | `AgentContext` 内存 | `agent_sessions` 持久化；绑 `caseId` |
| Confirm / HITL | ConfirmBar + `hitlGates`；`gateToAction` | 同 gate id → DomainCommand；框架 Approve ≠ 业务闸 |
| Orchestrator | `AGENT_SCRIPTS` 回放 | ① DSH/Codex 循环；提案再过自有闸 |
| CaseContext | 只读契约摘要 | 同 schemaVersion；bump 纪律不变 |

HITL 闸键（勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`（+ handoff `request_changes`）。

## 3. 与 ① runtime（DSH / Codex）分层

```text
③ 领域工具 + 评测     ← AgentDef.tools / 评测集（自建）
② 领域编排（可选）   ← 子图；LangGraph 仅可选，非默认 runtime
① harness/runtime     ← DSH 和/或 Codex app-server
────────────────
产品壳 5175           ← Catalog / 会话 UI / ConfirmBar
自有闸                ← Persona · HitlGateId · DomainCommand
写库                  ← 仅 POST /v1/commands/dispatch
```

| 层 | 谁负责 | 禁止 |
|----|--------|------|
| ① | 会话循环、工具沙箱、通用审批 RPC | 用框架 Approve 替代 `authorize_file` 等 |
| 自有闸 | gate 语义、RACI、发票阻塞、Persona | 把闸逻辑推给开源默认 |
| 写 | case-core | Agent/runtime **无** PG 凭据 |

企业推荐默认 = **C 混合**（见 enterprise）；LangGraph **降档**为可选 ②。

## 4. 禁直写库

- 试运行 / 草稿 / 工具预览 → **不写**案态。
- 正式提交 / HITL 通过 → 只经 `dispatchCommand`（`actor: 'agent'`）。
- 工具副作用必须可映射到 DomainCommand 或只读（见 [agent-tools-mcp.md](./agent-tools-mcp.md)）。

入口模式（通用 / 项目 general·domain）见 [agent-entry-modes.md](./agent-entry-modes.md)。  
项目文件夹 / 专家分剧本 IA 见 [agent-project-folder.md](./agent-project-folder.md)。

## 5. 样机 vs 落地

| HARNESS 概念 | 样机今 | 落地 |
|--------------|--------|------|
| Session | 内存 | agent-session + DB |
| Tools | mock 卡片 | 适配器 + 沙箱；写走 command |
| HITL | UI Confirm | 持久 gate clear + 同 id |
| Command | 浏览器执法 ± mock POST | case-core 唯一写 |
| 真模型 | 无 | 模型网关；可关 |

## 6. 相关链接

- [agent-tools-mcp.md](./agent-tools-mcp.md) · [agent-plugins.md](./agent-plugins.md)
- [../dev-spec/api-contracts.md](../dev-spec/api-contracts.md)
