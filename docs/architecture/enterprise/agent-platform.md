# Agent 平台选型（核心）

> **样机诚实**：今日 `agent:5175` 是 **Cursor 式 UI + `AGENT_SCRIPTS` mock 工具卡片 + HITL ConfirmBar**。会话在浏览器内存（`AgentContext`）；试运行不写库；正式/HITL 才 `dispatchCommand(actor:'agent')`。HARNESS「一套运行时」描述的是**目标形状**（Session / Tools / HITL / Command），**不是**已实现的真 LLM harness，也**没有**真模型调用。  
> **落地目标**：在不拆毁 Persona / HITL / handoff / `@ip/contracts` DomainCommand 的前提下，补上真 LLM 编排。**推荐默认 = C 混合**：开源 runtime 只负责思考→工具循环；领域闸门、Persona、交接、写库必须走自有 `case-core`。Agent **禁止**直接改库。

权威纪律：[../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md) · landing [`agent-session`](../landing/backends.md)。拓扑见 [agent-topology.md](./agent-topology.md)；打分见 [decision-matrix.md](./decision-matrix.md)。

## 0. 今日样机对照（勿夸大）

| HARNESS 概念 | 样机今 | 落地仍必须保留 |
|--------------|--------|----------------|
| Session | 内存 `AgentSession`；seed + SPA 状态 | 持久化；绑 `caseId` |
| Orchestrator | **脚本回放**（`AGENT_SCRIPTS` / 一键等效演示） | 真 LLM 循环（C 的 runtime） |
| Tools | 按 `AgentDef.tools[]` **展示卡片**（mock） | 适配器：只产出提案，写库走 command |
| HITL | ConfirmBar + `clearedHitlGates`；`gateToAction` | 同一组 gate id → DomainCommand |
| Command API | `dispatchCommand`（浏览器执法 + 可选 mock POST） | `POST /v1/commands/dispatch` 唯一写 |
| Catalog | `AGENT_CATALOG`（Core/Assist/Beta） | 配置化；分层纪律不卖 Beta 当 Core |
| 真模型 | **无**（HARNESS「不做的事」） | 经模型网关；可关 |

HITL 闸（现仓键，勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`（+ `request_changes`）。

---

## 1. 方案 A — 开源 Agent harness / 运行时

下列均为**真实可查**项目。许可以各仓库 LICENSE 为准；标注日期约 2026-09。不确定处写「需再核」，不编造。  
**A 不是推荐默认**：可当 C 的 runtime 候选池。官方「Agent Server / 云控制面」与 **MIT 库**必须分开写。

### 1.1 LangGraph（首选 runtime 候选）

| 项 | 事实 |
|----|------|
| 项目 | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)（Python）；另有 LangGraph.js |
| 许可 | **库 = MIT**（GitHub / PyPI 可见） |
| 能力 | 有状态图编排、checkpoint、streaming、**interrupt / HITL**、工具循环；可脱离 LangSmith 只用库 |
| 自托管 | **库**：可完全自托管。**官方 Agent Server / `langgraph-api`**：生产自托管通常要 `LANGGRAPH_CLOUD_LICENSE_KEY`（或开发用 LangSmith key），并可能访问 `beacon.langchain.com` —— **不是** MIT 私有化默认 |
| langhost | [langhost/langhost](https://github.com/langhost/langhost)（MIT；独立项目，**非** LangChain 官方）：自称用自有 Postgres+Redis runtime 跑 Agent Server API。**可作自托管参考**，但生态仍在演进（星少、需跟官方 API 版本）；且文档写明仍可能依赖 stock `langgraph-api`（**Elastic License 2.0，需再核**是否可进私有化包） |

**与本仓契合**

| 维 | 评 |
|----|----|
| 可控性 | **高（只用库）**。图节点、interrupt 点可对齐 HITL 闸；工具函数由我们实现。 |
| 私有化 | **库优**。勿把官方 Server 写成唯一路径；langhost 仅参考。 |
| DomainCommand / HITL | **高**：图在 `authorize_file` 等节点 interrupt → 等 ConfirmBar / 命令成功再 resume。工具返回「提案」而非写库。 |
| 与 TS 栈 | Python 库更成熟；**LangGraph.js** 可同仓少语言缝，但 JS 与 Python 功能对等性 **需再核**（checkpoint / HITL / Studio）。MVP 可 Python sidecar + TS `agent-session`。 |
| 风险 | ① 文档把「LangGraph」与「LangSmith Deployments」混为一谈，私有化踩许可。② 生态演进快，pin 版本。③ 若用 JS，先做 spike 再承诺。④ langhost 不能当采购唯一依赖。 |

### 1.2 Microsoft Agent Framework（AutoGen + Semantic Kernel 统一后继）

| 项 | 事实 |
|----|------|
| 项目 | [microsoft/agent-framework](https://github.com/microsoft/agent-framework) |
| 许可 | **MIT**（仓库 `LICENSE`，2026-09 核） |
| 语言 | **Python + .NET** |
| 定位 | Semantic Kernel 仓库已指向本项目为后继；AutoGen 多角色编排 + SK 企业向基础（中间件、遥测、多模型）合一。SK / 原 AutoGen 进维护期（时间表 **需再核** 官方迁移指南） |
| 自托管 | SDK 可自托管。Azure AI Foundry **托管** Agent 是另一套商业计费，**不是**本方案默认 |

**与本仓契合**

| 维 | 评 |
|----|----|
| 可控性 | 中高。工作流/中间件强；要把「插件工具」收口到 DomainCommand 需自写一层。 |
| 私有化 | SDK MIT 优；避免默认绑 Foundry。 |
| DomainCommand / HITL | 中高：有 HITL/审批模式可对，但闸 id、发票阻塞、Persona 仍要我们执法。 |
| 与 TS 栈 | **语言缝**：.NET/Python，无官方 TS 一等公民。现仓 TS+`@ip/domain` 复用差于 LangGraph.js 路线。 |
| 风险 | ① 1.0 前后 API 仍新，pin。② 团队若无 Python/.NET，成本高于「只加一个图库」。③ 名称易与 Azure 托管混淆。 |

### 1.3 CrewAI

| 项 | 事实 |
|----|------|
| 项目 | [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) |
| 许可 | **核心框架 MIT**（仓库 LICENSE） |
| 能力 | 多角色 Crew + 事件驱动 Flows；角色/目标/任务抽象 |
| 自托管 | 库可本地跑。CrewAI AMP / Cloud / 企业治理（SSO 等）是**商业面**，与 MIT 库分开 |

**与本仓契合**

| 维 | 评 |
|----|----|
| 可控性 | 中。角色自治强，**确定性闸门**弱于图 interrupt。 |
| 私有化 | 库优；不要把 Cloud 当私有化。 |
| DomainCommand / HITL | **中偏低**：多角色「商量」与本仓「一闸一命令、不可跳过」不完全同构。可把每个专业 Agent 做成 Crew 角色，但批准必须出 Crew、进 ConfirmBar。 |
| 与 Catalog | 角色抽象接近 `AgentDef`（prompt/tools/RACI），易讲故事，易**绕过**单一 Command API。 |
| 风险 | ① 默认自主循环烧掉额、难审计。② Python only。③ 企业功能在商业面，评估时勿把营销页当 MIT 能力。 |

### 1.4 可选第 4：Dify（产品面）或 LlamaIndex Workflows（库）

两者**只评一个作备选**，不进入推荐默认。

#### Dify

| 项 | 事实 |
|----|------|
| 项目 | [langgenius/dify](https://github.com/langgenius/dify) |
| 许可 | **Apache-2.0 附加条件**（控制台去品牌、**未经书面授权不得用源码运营多租户服务**）。**不是**纯 Apache。对外 SaaS / 多租户产品 **需再核** 商业许可 |
| 能力 | 工作流 + LLM 应用产品面（工作室、模型接入、RAG）；Docker 可自托管 Community Edition |
| 契合 | 私有化**内场单租户试用**可以；与本仓 **agent:5175 已有产品面冲突**（会双 UI、双会话）。多租户 IP SaaS **许可风险高** |
| 风险 | 许可附加条款；重栈（PG/Redis/向量/worker）；HITL/交接难对齐 DomainCommand；易变成「再做一个 Dify」 |

#### LlamaIndex Workflows

| 项 | 事实 |
|----|------|
| 项目 | `llama-index-workflows`（[PyPI](https://pypi.org/project/llama-index-workflows/) · 文档称 MIT） |
| 许可 | **MIT**（包元数据；若锁定版本须再核 tarball LICENSE） |
| 能力 | 步骤/事件工作流、分支、与 LlamaIndex RAG 集成 |
| 契合 | 调研检索 / 交底文档类 **Assist 工具**好；**不是**完整 Agent Server。HITL 有，但产品/会话面仍要自建 |
| 风险 | 若已选 LangGraph，再引入第二套工作流易双编排。适合「检索子图」而非平台内核 |

---

## 2. 方案 B — 完全自建

对齐现样机，把 HARNESS 五件套在 **TypeScript 同仓**做成真运行时：不引入 LangGraph/MAF/Crew。

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
|----|----|
| 与 `@ip/domain` / contracts **零语言缝**；许可最干净 | 要自建：图/状态机、checkpoint、流式、重试、并发会话、模型适配、token 计量 |
| HITL 闸与现 UI 一一对应，无「框架自带审批」分叉 | 样机今日**没有**可长出的编排内核，只有脚本；工期 ≈ 再做一个小型 LangGraph |
| 私有化无第三方 Server 条款 | 人才与缺陷密度通常差于成熟开源编排 |
| 多壳 `5175` UI 几乎不用换 | 长期跟模型 API（工具调用格式、多模态）是无底洞 |

### 2.3 何时才选 B

仅当：法务禁止任何第三方 Agent 框架，**或** C 的 spike 证明 HITL interrupt 无法接到现闸（先证伪再自建）。  
**不**因为「我们已有 HARNESS.md」就选 B —— 那份是 UI 纪律，不是运行时实现。

---

## 3. 方案 C — 混合（推荐默认）

```text
[agent:5175 UI]
    → [agent-session 自有：会话/闸/Persona/Catalog]
        → [开源 runtime：LLM 编排 + 工具循环 + checkpoint]
            → 工具适配器（只读检索 / 草稿）
            → 写意图 ──X──► 数据库
            → 写意图 ──► POST /v1/commands/dispatch  (case-core)
                            ▲
                            └── evaluateGuardrails / canPerformHandoff / 租户谓词
```

### 3.1 分割线（必须写进实现纪律）

| 层 | 谁做 | 禁止 |
|----|------|------|
| LLM 编排 / 工具循环 / 流式 / checkpoint | 开源 runtime（默认 **LangGraph 库**） | runtime 持有 Case 写连接 |
| 领域闸门 HITL | 自有 `agent-session` + 现 ConfirmBar / gate id | 用框架「通用 approve」替代 `authorize_file` 等 |
| Persona / 可见性 / RACI | 自有 iam 声明 + `@ip/domain` | 让模型「扮演财务」来绕过付款闸 |
| 交接 / 阶段 / Docket / 发票 | `case-core` + DomainCommand | 工具内直接 `UPDATE` / 调未登记 API |
| 写库 | **仅** `POST /v1/commands/dispatch` | Agent、runtime、LangSmith、Dify 工作流节点写 PG |
| 提醒 | runtime 失败 → `ip.command.failed` → `notify` | runtime 自带 SMTP 绕过 notify |

**一句话**：开源 runtime 是 **Orchestrator 插件**；Harness 的产品与执法仍是我们的。

### 3.2 为什么默认 C（相对 A、B）

1. **现仓已有** Catalog / HITL / handoff / Command / CaseContext / guardrails —— A 会再做一套会话与审批，双真相。  
2. **今日不是真 harness** —— B 要从零造编排，耽误落地；C 把「脚本回放」换成图，UI 与命令不动。  
3. **私有化可控**：只 vendoring MIT 库 + 自有服务；不绑官方 Agent Server / Foundry / Crew Cloud。  
4. **多壳成本低**：`agent:5175` 继续吃 `AgentSession` + ConfirmBar；workbench 表单路径完全不经过 runtime。  
5. **可关模型**：runtime 挂了，表单办理与 HITL 仍走 `case-core`（见 backend-enterprise 故障域）。

### 3.3 首选开源 runtime = LangGraph（库）

在 A 的候选里选 LangGraph 作为 C 的默认引擎，不是选「LangGraph Cloud」。

| 理由 | 说明 |
|------|------|
| HITL 同构 | interrupt/resume ≈ `clearedHitlGates` 等待 ConfirmBar |
| 状态 | checkpoint 可落 **我们的 PG**（与 landing 栈一致），会话元数据仍归 `agent-session` |
| 许可 | 库 MIT；Server 商业条款可避开 |
| 工具 | 每个 `AgentDef.tools[]` 做成节点/tool；`TOOL_TO_COMMAND` 只在正式执行触发 |
| 演进 | Catalog 多 Agent = 多图或一图多入口；Auto 路由仍用 `suggestAgent` |

备选顺序（C 内部，非并列默认）：LangGraph 库 →（语言/采购偏好 .NET）MAF →（只要多角色实验）CrewAI。Dify **不**作 C 的 runtime（产品面冲突 + 许可附加条款）。LlamaIndex Workflows 可作调研子图，不升格为平台。

### 3.4 C 的落地步骤（可执行，非空喊）

**Spike（1～2 周，可废）**

- [ ] 用 LangGraph（先 Python sidecar **或** LangGraph.js spike，二选一写结论）跑通：`agent-research` 一图，2 个 mock 工具 + 1 个 interrupt（`approve_strategy`）。  
- [ ] interrupt 恢复条件 = 本仓 `approveHandoff` / `submitResearch` **命令成功**，不是框架自己的 OK 按钮。  
- [ ] 证明 runtime 进程无 DB 写凭据（只有 `case-core` HTTP）。  
- [ ] 记下 JS vs Python：checkpoint、HITL、与 Node `services/` 部署谁更省；**未核则不写进采购**。

**MVP（Agent 真循环，仍可晚于 case-core MVP）**

- [ ] `agent-session` 会话进 PG；UI 仍 `5175`。  
- [ ] 仅 **1 个 Core Agent**（建议调研检索）接真模型网关；其余保持脚本。  
- [ ] 试运行 = runtime 跑但不 dispatch；正式执行 = HITL 后 dispatch。  
- [ ] 一键等效演示保留但标「演示捷径」，不作为生产路径。  
- [ ] 审计：`actor:'agent'` + `agentId`；模型 trace id 可空写会话旁路，不冒充 `AuditEntry`。

**生产**

- [ ] Catalog Core 图化；Assist/Beta 仍可脚本或关。  
- [ ] 模型网关、出站策略、pin 版本、无官方 Server 许可依赖。  
- [ ] runtime 可水平扩；办理主路径不依赖它。

### 3.5 C 的明确不做

- 不把 Dify/LangSmith Studio 当办案 UI（Studio 最多开发调试）。  
- 不让 runtime 订阅 PG LISTEN 自己改 handoff。  
- 不新增第三套命令名。  
- 不在 MVP 上齐全部专业 Agent 的真模型。

---

## 4. 三方案对照（摘要）

| | A 开源当平台 | B 完全自建 | **C 混合（推荐）** |
|--|--------------|------------|-------------------|
| 谁持会话 UI | 框架/Studio/Dify | 现 `5175` | **现 `5175`** |
| 谁编排 LLM | 框架 | 自研 | **LangGraph 库** |
| 谁执法 HITL/写库 | 易被框架审批替代 | 自有 command | **自有 `case-core`** |
| 样机能长出什么 | 几乎扔掉 ConfirmBar | UI 留、编排从零 | UI+闸+命令留，换掉脚本 |
| 私有化 | 看 Server/附加许可 | 最好 | **库 MIT + 自有服务** |
| 语言缝 | 常有 | 无 | 可控（JS spike 或 sidecar） |
| 推荐 | 否 | 仅法务/证伪后 | **是** |

## 5. 相关链接

- [./README.md](./README.md) · [./agent-topology.md](./agent-topology.md) · [./decision-matrix.md](./decision-matrix.md) · [./backend-enterprise.md](./backend-enterprise.md)
- [../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md)
- [../landing/backends.md](../landing/backends.md) § agent-session · [../landing/roadmap.md](../landing/roadmap.md)
- 现仓：`src/data/agents.ts`（`AGENT_CATALOG`）· `packages/app-state/src/AgentContext.tsx` · `apps/agent/README.md`
