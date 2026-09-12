# Agent 平台选型（核心）

> **样机诚实**：今日 `agent:5175` 是 **Cursor 式 UI + `AGENT_SCRIPTS` mock 工具卡片 + HITL ConfirmBar**。会话在浏览器内存（`AgentContext`）；试运行不写库；正式/HITL 才 `dispatchCommand(actor:'agent')`。HARNESS「一套运行时」描述的是**目标形状**（Session / Tools / HITL / Command），**不是**已实现的真 LLM harness，也**没有**真模型调用。  
> **落地目标**：在不拆毁 Persona / HITL / handoff / `@ip/contracts` DomainCommand 的前提下，补上真 LLM 编排。**推荐默认 = C 混合**：成熟 harness（**DSH 和/或 Codex app-server**）做 **① runtime**；自有 **Persona / HITL / DomainCommand** 做领域闸。LangGraph **降为**可选 ② 领域子图/备选，**勿假装**保证每个业务 Agent 能力。Agent **禁止**直接改库；写只经 DomainCommand。  
> **三层纪律**：① harness/runtime ≠ ② 领域编排 ≠ ③ 领域工具+评测。任一开源都不自动保证 OA/调研 Agent 业务质量 → 见 [agent-runtime-options.md](./agent-runtime-options.md)。

权威纪律：[../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md) · landing [`agent-session`](../landing/backends.md)。Runtime 对比见 [agent-runtime-options.md](./agent-runtime-options.md)；拓扑见 [agent-topology.md](./agent-topology.md)；打分见 [decision-matrix.md](./decision-matrix.md)。

## 0. 今日样机对照（勿夸大）

| HARNESS 概念 | 样机今 | 落地仍必须保留 |
|--------------|--------|----------------|
| Session | 内存 `AgentSession`；seed + SPA 状态 | 持久化；绑 `caseId` |
| Orchestrator | **脚本回放**（`AGENT_SCRIPTS` / 一键等效演示） | 真 LLM 循环（C 的 runtime = DSH/Codex） |
| Tools | 按 `AgentDef.tools[]` **展示卡片**（mock） | 适配器：只产出提案，写库走 command |
| HITL | ConfirmBar + `clearedHitlGates`；`gateToAction` | 同一组 gate id → DomainCommand |
| Command API | `dispatchCommand`（浏览器执法 + 可选 mock POST） | `POST /v1/commands/dispatch` 唯一写 |
| Catalog | `AGENT_CATALOG`（Core/Assist/Beta） | 配置化；分层纪律不卖 Beta 当 Core |
| 真模型 | **无**（HARNESS「不做的事」） | 经模型网关；可关 |

HITL 闸（现仓键，勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`（+ handoff action `request_changes`，非 HitlGateId）。

---

## 1. 方案 A — 开源 Agent harness / 运行时

下列均为**真实可查**项目。许可以各仓库 LICENSE 为准；标注日期约 2026-09。不确定处写「需再核」，不编造。  
**A 不是推荐默认**：可当 C 的 runtime 候选池。完整对比表见 [agent-runtime-options.md](./agent-runtime-options.md)。

### 1.1 DeepSeek Harness（DSH）— 首选 runtime 候选之一

| 项 | 事实 |
|----|------|
| 项目 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`） |
| 许可 | **MIT** |
| 架构 | Cordis 插件化；**everything is a plugin**（models/tools/sessions/sandboxes/loops/UI…） |
| 状态 | 官方 **developer preview**；API 仍演进 |
| 审批 | 公开子系统 `dsh-user-approval`：`ctx.approval.request`；策略 `ask` / `never`；fail closed |
| 安全审计 | **需再核 / 预览**——勿当已审定生产基线 |

**与本仓契合**：可控性高（插件可换、可自写 answerer）；私有化许可优；HITL 可映射到 ConfirmBar，但 **gate 语义与写库仍必须自有**。通用办公能力不随 harness 附送 → 靠 ②③。

### 1.2 OpenAI Codex app-server — 首选 runtime 候选之一

| 项 | 事实 |
|----|------|
| 项目 | [openai/codex](https://github.com/openai/codex)（`codex-rs` / app-server） |
| 许可 | **Apache-2.0**（harness 代码） |
| 协议 | JSON-RPC：**thread / turn / item**；`item/permissions/requestApproval` 等审批暂停 |
| 偏向 | **编码 Agent 强**（shell、补丁、沙箱）；办公/调研须自接领域工具 |
| 供应风险 | **模型/API/订阅绑定**须诚实写：fork harness ≠ 免费推理；条款变更是产品风险 |

**与本仓契合**：成熟产品面与审批 RPC 清晰；`5175` 可作审批客户端。须把 Codex「permissions 批准」与本仓 `HitlGateId` / DomainCommand **分层**，禁止用框架 Approve 替代 `authorize_file` 等。

### 1.3 LangGraph — 降为可选领域子图 / 备选

| 项 | 事实 |
|----|------|
| 项目 | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)（Python）；另有 LangGraph.js |
| 许可 | **库 = MIT**；官方 Agent Server / `langgraph-api` **不是** MIT 私有化默认 |
| 定位 | **编排库**，非完整产品 harness |
| HITL | interrupt 可映射等待；**不保业务质量**，不自动对齐闸 id |

**本仓用法**：多专业阶段/子流程需要图编排时，可作 **② 层子图**；**不再**作为 C 的默认 ① runtime。官方 Server / LangSmith Deployments **不默认**。langhost 等自托管参考 **不升格**推荐行。

### 1.4 其他候选（不进默认）

#### Microsoft Agent Framework

| 项 | 事实 |
|----|------|
| 项目 | [microsoft/agent-framework](https://github.com/microsoft/agent-framework) |
| 许可 | **MIT**（2026-09 核） |
| 语言 | Python + .NET；与 TS 栈有语言缝 |
| 备注 | SK + AutoGen 后继；Azure Foundry **托管**勿默认 |

#### CrewAI

| 项 | 事实 |
|----|------|
| 项目 | [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) |
| 许可 | 核心框架 **MIT** |
| 契合 | 多角色故事好；与「一闸一命令」弱同构；Cloud 商业面分开 |

#### Dify（产品面）/ LlamaIndex Workflows（库）

- **Dify**：[langgenius/dify](https://github.com/langgenius/dify) — Apache-2.0 **附加条件**；与 `5175` 双 UI 冲突；多租户 **需再核**。不作 C runtime。  
- **LlamaIndex Workflows**：MIT 工作流库；适合检索子图，不升格平台内核。

---

## 2. 方案 B — 完全自建

对齐现样机，把 HARNESS 五件套在 **TypeScript 同仓**做成真运行时：不引入 DSH/Codex/LangGraph。

### 2.1 要对齐的现资产（今日是 UI+mock，不是真 harness）

| 件 | 现仓入口（权威在包；根 `src/*` 多为 re-export） | 自建要补的真能力 |
|----|-----------------------------------------------|------------------|
| Session | `AgentSession` / `AgentContext` / `apps/agent` | 持久化、多实例、流式 token |
| Tools | `AgentDef.tools[]` · `TOOL_TO_COMMAND` · mock 卡片 | 真工具执行器、超时、重试、沙箱 |
| HITL | ConfirmBar · `clearedHitlGates` · `gateToAction` | 与模型循环中断/恢复（现无模型循环） |
| Confirm | `evaluateGuardrails` 唯一硬闸 | 保持；服务端再跑一遍 |
| dispatchCommand | `@ip/app-state` → 未来 `case-core` | 正式执行唯一写；试运行零写 |

Auto 路由（`suggestAgent`：交接/阶段/关键词）可继续当**确定性预处理器**，不必交给 LLM 选 Agent。

### 2.2 利 / 弊

| 利 | 弊 |
|----|-----|
| 与 `@ip/domain` / contracts **零语言缝**；许可最干净 | 要自建：工具环、checkpoint、流式、重试、沙箱、模型适配 |
| HITL 闸与现 UI 一一对应 | 样机今日**没有**可长出的编排内核，只有脚本；工期 ≈ 再做一个小型 harness |
| 私有化无第三方预览/供应条款 | 人才与缺陷密度通常差于成熟开源 harness |
| 多壳 `5175` UI 几乎不用换 | 长期跟模型 API 是无底洞 |

### 2.3 何时才选 B

仅当：法务禁止任何第三方 Agent harness，**或** C 的 DSH/Codex spike 证明审批钩无法接到现闸（先证伪再自建）。  
**不**因为「我们已有 HARNESS.md」就选 B —— 那份是 UI 纪律，不是运行时实现。

---

## 3. 方案 C — 混合（推荐默认 · 修订 runtime）

```text
[agent:5175 UI]
    → [agent-session 自有：会话/闸/Persona/Catalog]
        → [成熟 harness：DSH 和/或 Codex app-server]
            → 工具适配器（只读检索 / 草稿）
            → 写意图 ──X──► 数据库
            → 写意图 ──► POST /v1/commands/dispatch  (case-core)
                            ▲
                            └── evaluateGuardrails / canPerformHandoff / 租户谓词
        → [可选] LangGraph 等领域子图（②），不替代 harness，不直写库
```

### 3.1 分割线（必须写进实现纪律）

| 层 | 谁做 | 禁止 |
|----|------|------|
| ① LLM 工具环 / 沙箱 / 流式 / 会话协议 | **DSH 和/或 Codex app-server** | runtime 持有 Case 写连接 |
| ② 领域闸门 HITL / Persona / 交接 | 自有 `agent-session` + ConfirmBar / gate id | 用框架「通用 approve / allowed-once」替代 `authorize_file` 等 |
| ③ 领域工具 + 评测 | 自有适配器 + eval | 无评测却宣称「业务 Agent 已成熟」 |
| 写库 | **仅** `POST /v1/commands/dispatch` | Agent、runtime、Studio、Dify 节点写 PG |
| 提醒 | runtime 失败 → `ip.command.failed` → `notify` | runtime 自带 SMTP 绕过 notify |

**一句话**：成熟 harness 是 **① Orchestrator 插件**；Harness 产品与执法（②③）仍是我们的。**任何 runtime 都不保证业务质量。**

### 3.2 为什么默认 C（相对 A、B）

1. **现仓已有** Catalog / HITL / handoff / Command / CaseContext / guardrails —— 纯 A 会再做一套会话与审批，双真相。  
2. **今日不是真 harness** —— B 要从零造工具环；C 用 DSH/Codex 换掉脚本，UI 与命令不动。  
3. **用户挑战已吸收**：DSH / Codex 在 ① 层比「只上 LangGraph 库」更接近完整 harness；LangGraph **不能**保证每个业务 Agent 能力——本修订明确三层分离。  
4. **私有化可控**：vendoring MIT/Apache harness + 自有服务；不绑官方 LangGraph Server / Foundry / Crew Cloud；Codex **模型供应**单独评估。  
5. **多壳成本低**：`5175` 继续吃 ConfirmBar；workbench 表单路径不经 runtime。  
6. **可关模型**：runtime 挂了，表单办理与 HITL 仍走 `case-core`。

### 3.3 首选 runtime = DSH 和/或 Codex app-server

| 理由 | 说明 |
|------|------|
| 完整 ① 层 | 工具环、沙箱、审批暂停、会话/thread——比「纯编排库」更接近产品 harness |
| HITL 钩 | Codex `permissions/requestApproval`；DSH `ctx.approval` / 插件闸 → 映射 ConfirmBar（详见 [agent-runtime-options.md](./agent-runtime-options.md) §2） |
| 许可 | DSH MIT；Codex Apache-2.0（代码）；避开 LangGraph 官方 Server 条款陷阱 |
| 演进 | Catalog 多 Agent = 多 session/thread 或多插件配置；Auto 路由仍用 `suggestAgent` |
| 诚实边界 | **不保证** OA/调研质量；编码偏向（尤其 Codex）须用自有 ③ 工具补齐 |

**C 内部优先级（修订）**：DSH 和/或 Codex app-server →（仅要图编排子流程）LangGraph 库作 ② →（语言/采购偏好 .NET）MAF →（多角色实验）CrewAI。Dify **不**作 runtime。

DSH vs Codex：**可双轨 spike**，按私有化、供应、审批接入、TS/插件成本择一为主、另一为备；未 spike 前不在采购单写死唯一厂商。

### 3.4 C 的落地步骤（可执行，非空喊）

**Spike（1～2 周，可废）**

- [ ] 选 DSH **或** Codex app-server（或各做半周对照）：跑通「1 个工具环 + 1 次审批暂停」。  
- [ ] 审批恢复条件 = 本仓 ConfirmBar / `approveHandoff` / `submitResearch` 等 **命令成功**，不是框架自己的 OK。  
- [ ] 证明 runtime 进程无 DB 写凭据（只有 `case-core` HTTP）。  
- [ ] Codex：记清模型/API 依赖与断供预案；DSH：记清 preview API 冻结点与安全审计缺口（**需再核**）。  
- [ ] 可选：LangGraph 只 spike「阶段子图」，不替代主 runtime。

**MVP（Agent 真循环，仍可晚于 case-core MVP）**

- [ ] `agent-session` 会话进 PG；UI 仍 `5175`。  
- [ ] 仅 **1 个 Core Agent**（建议调研检索）接真模型网关；其余保持脚本。  
- [ ] 试运行 = runtime 跑但不 dispatch；正式执行 = HITL 后 dispatch。  
- [ ] 一键等效演示保留但标「演示捷径」，不作为生产路径。  
- [ ] 审计：`actor:'agent'` + `agentId`；模型 trace id 可旁路，不冒充 `AuditEntry`。  
- [ ] 至少 1 套 ③ eval（轨迹/闸/命令）——否则不得宣称业务 Agent 就绪。

**生产**

- [ ] Catalog Core 接 runtime；Assist/Beta 仍可脚本或关。  
- [ ] 模型网关、出站策略、pin 版本；DSH 预览→稳定的升级窗口；Codex 供应合同。  
- [ ] runtime 可水平扩；办理主路径不依赖它。

### 3.5 C 的明确不做

- 不把 Dify/LangSmith Studio/Codex IDE 当办案 UI（Studio/IDE 最多开发调试）。  
- 不让 runtime 订阅 PG LISTEN 自己改 handoff。  
- 不新增第三套命令名。  
- 不在 MVP 上齐全部专业 Agent 的真模型。  
- 不宣称「上了 DSH/Codex/LangGraph = 业务 Agent 能力达标」。

---

## 4. 三方案对照（摘要）

| | A 开源当平台 | B 完全自建 | **C 混合（推荐）** |
|--|--------------|------------|-------------------|
| 谁持会话 UI | 框架/Studio/Dify | 现 `5175` | **现 `5175`** |
| 谁做 ① runtime | 框架全家桶 | 自研 | **DSH 和/或 Codex app-server** |
| 谁执法 HITL/写库 | 易被框架审批替代 | 自有 command | **自有 `case-core`** |
| LangGraph 角色 | 易被误当成平台 | — | **可选 ② 子图，非默认 ①** |
| 样机能长出什么 | 几乎扔掉 ConfirmBar | UI 留、编排从零 | UI+闸+命令留，换掉脚本 |
| 私有化 | 看 Server/预览/供应 | 最好 | **MIT/Apache 代码 + 自有服务**（Codex 模型另评） |
| 保证业务质量？ | **否** | **否** | **否**（靠 ②③） |
| 推荐 | 否 | 仅法务/证伪后 | **是（修订 runtime）** |

## 5. 相关链接

- [./README.md](./README.md) · [./agent-runtime-options.md](./agent-runtime-options.md) · [./agent-topology.md](./agent-topology.md) · [./decision-matrix.md](./decision-matrix.md) · [./backend-enterprise.md](./backend-enterprise.md)
- [../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md)
- [../landing/backends.md](../landing/backends.md) § agent-session · [../landing/roadmap.md](../landing/roadmap.md)
- 现仓：`src/data/agents.ts`（`AGENT_CATALOG`）· `packages/app-state/src/AgentContext.tsx` · `apps/agent/README.md`
