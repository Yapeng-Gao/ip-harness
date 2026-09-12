# 开发前规格包（dev-spec）

> **样机诚实**：今日仍是多 Vite 壳 + `api-mock:5180` 内存店；无真 Postgres / Redis / OIDC / 微服务网格 / 真 Agent harness。  
> **落地目标**：本目录是「照文档开 PR」的开发前规格——目录树、进程边界、落地表、冻 URL、Day0→骨架验收与已拍板 ADR。  
> **不是**已交付实现；**不是**架构评审文（评审见 landing/enterprise 的 REVIEW）。

## MVP 范围（一句话）

**同仓 `services/` 以 `case-core` 承接冻 URL 唯一写（Postgres）+ Redis 最小异步（docket/notify outbox）+ OIDC 空态 + `agent-session` 接 DSH/Codex spike；壳端口与 `DomainCommand` 不变；禁 Agent 直写库；一期可单体模块，非 Day-1 网格。**

## 评审

- [REVIEW.md](./REVIEW.md) — 架构评审结论：**通过**（对象 SHA `678b54e`；非阻塞：ADR-008 开工前冻框架；Step2 钉切换日）。

## 阅读顺序

1. 本页（范围与索引）
2. [app-topology.md](./app-topology.md) — `services/` 树、进程/端口、与五壳
3. [architecture.md](./architecture.md) — 壳→网关→服务；C 混合 Agent；mermaid
4. [data-model.md](./data-model.md) — Postgres 落地表级
5. [data-flow.md](./data-flow.md) — 办理 / HITL / Docket→notify 落地流
6. [api-contracts.md](./api-contracts.md) — 冻 URL 与扩展会话/HITL
7. [build-guide.md](./build-guide.md) — Day0→骨架→验收勾选
8. [adr-decisions.md](./adr-decisions.md) — 已拍板决策

上游对齐（先读、不掏空）：

| 上游 | 路径 |
|------|------|
| 落地七面 / 栈 / 路线 | [../landing/README.md](../landing/README.md) |
| 企业级 + Agent（C 混合） | [../enterprise/README.md](../enterprise/README.md) |
| 样机数据模型 / 流 / 后端候选 | [../data-model.md](../data-model.md) · [../data-flow.md](../data-flow.md) · [../backends.md](../backends.md) |
| 命令 / Harness 纪律 | [../../COMMANDS.md](../../COMMANDS.md) · [../../HARNESS.md](../../HARNESS.md) |
| 架构总索引 | [../README.md](../README.md) |
| 产品面规格（壳设计） | [../product-apps/README.md](../product-apps/README.md) |

下游产品面（开壳 UI / 路由规格，不替代本目录进程与冻 URL）：[../product-apps/README.md](../product-apps/README.md)。

## 本目录八篇

| 篇 | 回答什么 |
|----|----------|
| [README.md](./README.md) | 阅读顺序、MVP 一句话、回链 |
| [app-topology.md](./app-topology.md) | `services/` 树；进程边界；端口；一期单体 vs 多进程 |
| [architecture.md](./architecture.md) | 逻辑图；C 混合；≥2 mermaid |
| [data-model.md](./data-model.md) | 落地表、字段、索引、类型映射 |
| [data-flow.md](./data-flow.md) | 落地数据流（相对上级不重复样机细节） |
| [api-contracts.md](./api-contracts.md) | 冻 URL + Agent/HITL 扩展建议 |
| [build-guide.md](./build-guide.md) | 分步构建 + 可勾选验收 |
| [adr-decisions.md](./adr-decisions.md) | 已拍板；Fastify/Hono 开工前冻 |

## 纪律（开 PR 前自检）

- 新增命令 / 事件：**先改** `@ip/contracts`，再实现。
- Agent **禁止**直连 PG；正式写只经 `POST /v1/commands/dispatch`（`actor: 'agent'`）。
- Runtime 默认 **DSH 和/或 Codex app-server**；LangGraph **仅**可选子图——勿退回「LangGraph 默认 runtime」。
- 一期 `services/` **同仓**；勿 Day-1 假装微服务网格。
- 每篇开篇保持「样机诚实 vs 落地目标」；勿把本文写成已上线。

## 冻结项（继承 landing，不另起）

- URL：`GET /health` · `GET /v1/cases` · `GET /v1/cases/:id` · `GET /v1/inbox` · `POST /v1/commands/dispatch`
- 命令名：`DomainCommand` / `CommandName`（含 `docketEscalate` / `docketComplete`）
- 事件名：`DOMAIN_EVENTS`
- 开发端口：`APP_PORTS`（五壳 + api `5180`）
