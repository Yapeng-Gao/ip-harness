# 企业级后端 + Agent 平台（enterprise）

> **样机诚实**：今日仍是多 Vite 壳 + `api-mock:5180` 内存店；Agent 面（`agent:5175`）是 **UI + mock tools + HITL 面板**，**不是**真 harness / 真模型调用。无真微服务网格、真库、真 SSO、真 SMTP、真调度器。  
> **落地目标**：在已通过的 [landing](../landing/README.md) 七面之上，给出可私有化的企业级后端拓扑，以及 Agent 平台选型（**推荐默认 = C 混合**：开源 runtime 只做 LLM 编排/工具循环；领域闸门 / Persona / 交接 / 写库走自有 `case-core` + `@ip/contracts` DomainCommand）。  
> 本目录是**设计方案**，不是已交付实现。禁止对外把本文写成「已有企业网格 / 已有真 Agent 运行时」。

## 本目录

| 篇 | 路径 | 回答什么 |
|----|------|----------|
| 企业级后端 | [backend-enterprise.md](./backend-enterprise.md) | 在 landing 七面之上：部署拓扑、多租户、高可用、安全合规、审计、私有化；MVP/生产表 + 检查清单 |
| Agent 平台选型（核心） | [agent-platform.md](./agent-platform.md) | A 开源 runtime / B 完全自建 / C 混合；推荐 C + LangGraph 库 |
| Agent 拓扑 | [agent-topology.md](./agent-topology.md) | 会话·工具·模型网关·记忆·审计·与 case-core/notify 边界；含 mermaid |
| 选型决策表 | [decision-matrix.md](./decision-matrix.md) | 可控性 / 私有化 / HITL / 成本 / 与现仓演进；推荐行高亮 |

阅读顺序：本页 → [backend-enterprise](./backend-enterprise.md) → [agent-platform](./agent-platform.md) → [agent-topology](./agent-topology.md) → [decision-matrix](./decision-matrix.md)。

## 推荐默认（一句话）

**C 混合 + 首选开源 runtime = LangGraph（MIT 库；有状态编排 / HITL interrupt；官方 Agent Server 不作为私有化默认）。**

理由摘要：现仓已有 Persona / HITL / handoff / `DomainCommand`；开源 runtime 只补真 LLM 编排；写库仍禁止 Agent 直连；与 `agent:5175` 多壳演进成本最低。详见 [agent-platform.md](./agent-platform.md) §4、[decision-matrix.md](./decision-matrix.md)。

## 与 landing 的对齐（不重写）

landing 已冻七面与默认栈；本目录**只加企业级约束与 Agent 平台**，不另起服务名、不另起命令/事件字符串。

| landing 七面 | 本目录增量 |
|--------------|------------|
| `case-core` | 多租户行级隔离、审计单源、命令事务 HA |
| `workbench-command` | 仍并入/同进程；无新命令体系 |
| `agent-session` | 真会话持久化 + 接开源 runtime（C）；写办案仍只调 command |
| `iam` | OIDC + 租户/Persona 声明；禁 cookie 当生产鉴权 |
| `ops-platform` | 密钥保险库、OTel、私有化观测后端 |
| `notify` | 最小真通道 + 投递日志；不持 `PatentCase` |
| `docket` | 调度器 HA；升级仍走 DomainCommand |

默认栈仍是 landing [stack.md](../landing/stack.md)：**TypeScript + Postgres + Redis + OIDC + S3 兼容 + OpenTelemetry**。一期仍同仓 `services/`，**不是** Day-1 微服务网格。

## 回链

- 落地切分（已评审通过）：[../landing/README.md](../landing/README.md) · 评审 [../landing/REVIEW.md](../landing/REVIEW.md)
- Agent / Session / HITL / Command 纪律：[../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md)
- 架构索引：[../README.md](../README.md)
- 服务候选（样机级完整稿）：[../backends.md](../backends.md)
- 多壳数据流 / 数据模型：[../data-flow.md](../data-flow.md) · [../data-model.md](../data-model.md)
- 仓库策略：[../repos-and-vcs.md](../repos-and-vcs.md)
- 文档总索引：[../../README.md](../../README.md)

## 冻结口径（继承 landing，不另起）

先冻 `POST /v1/commands/dispatch` 与 `DomainCommand` / `DOMAIN_EVENTS` / `APP_PORTS`，再换实现。  
Agent **禁止**直接改库；正式/HITL 确认后只经 `dispatchCommand`（`actor: 'agent'`）。  
新增命令/事件：**先改 `@ip/contracts`**，再实现。
