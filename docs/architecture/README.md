# 架构设计文档（样机级）

> **现状样机**：多 Vite 壳 + 共享内核（根 `src/` + `@ip/*`）+ 同仓 `api-mock:5180`。  
> **不是**微服务、**不是**真库、**不是**真 SSO、**不是**真可观测。  
> 本目录三篇主文已是**完整稿**（可评审的样机级设计），不是大纲占位。凡标「现状样机」的是今天能跑的前端 harness；标「目标设计」的是未实现方向，禁止对外当已交付。

## 文档目的

- 对齐现仓真实路径 / 导出名，把「壳怎么读、命令怎么写、类型在哪个包、未来后端怎么拆」分成三篇，避免一篇里混谈。
- **诚实边界**：不把 localhost cookie / mid iframe bridge / 内存 seed 写成共享后端。
- 旧设计文档只相对链接，本目录**不复制、不掏空**。

## 本目录（主责 · 完整稿）

| 篇 | 路径 | 回答什么 |
|----|------|----------|
| 代码架构地图 | [codebase.md](./codebase.md) | 仓内分层、apps/packages/src/docs 目录职责与归档策略 |
| 多壳数据流 | [data-flow.md](./data-flow.md) | 各壳如何读/写、cookie / bridge / `@ip/api` 的优先级；含 flowchart + sequence |
| 数据模型 | [data-model.md](./data-model.md) | Case / Handoff / Command / Persona / Audit / CaseContext 与包归属 |
| 未来后端边界 | [backends.md](./backends.md) | 服务候选、同步/异步、事件名对齐 `DOMAIN_EVENTS`、迁移建议 |
| 原型后落地（landing） | [landing/README.md](./landing/README.md) | 落地切分与数据归属、默认栈、三阶段路线、提醒/通知；评审 [landing/REVIEW.md](./landing/REVIEW.md) **通过** |
| 企业级后端 + Agent 平台 | [enterprise/README.md](./enterprise/README.md) | 七面之上拓扑/多租户/HA/安全/审计/私有化；Agent 选型（**C 混合 + DSH 和/或 Codex app-server + 自有闸**；LangGraph 降档；见 [enterprise/agent-runtime-options.md](./enterprise/agent-runtime-options.md)）；相对旧 [enterprise/REVIEW.md](./enterprise/REVIEW.md)（曾锁 C+LangGraph）再评已**通过**（见 REVIEW） |
| 开发前规格包（dev-spec） | [dev-spec/README.md](./dev-spec/README.md) | 照文档开 PR：拓扑 / 落地表 / 冻 URL / 构建验收 / ADR；评审 [dev-spec/REVIEW.md](./dev-spec/REVIEW.md) **通过**（`678b54e`） |
| AI Data（数据 Pipeline） | [ai-data/README.md](./ai-data/README.md) · [REVIEW](./ai-data/REVIEW.md) | **≠ ops / ≠ ai-infra / ≠ case-core**；dataset→训推；产品壳建议 :5181；禁 PatentCase；无真 Spark/湖仓/PII |
| AI Infra（训推基建） | [ai-infra/README.md](./ai-infra/README.md) · [REVIEW](./ai-infra/REVIEW.md) | **≠ ops**：GPU/调度/训练/批推/在线推理/发布；产品壳建议 :5179；禁 PatentCase |
| 文档编辑器并行样机（doc-harness） | [doc-harness/README.md](./doc-harness/README.md) | 另壳 :5178；三栏文档+Agent；MVP draft 权利要求；五壳零改 |
| 产品面规格（product-apps） | [product-apps/README.md](./product-apps/README.md) | 五壳产品规格；默认同壳不拆节点 app；工具/MCP/插件；评审 [product-apps/REVIEW.md](./product-apps/REVIEW.md) **通过** |

阅读顺序建议：本页 → [codebase](./codebase.md) → [data-flow](./data-flow.md) → [data-model](./data-model.md) → [backends](./backends.md) → [landing](./landing/README.md)（落地）→ [enterprise](./enterprise/README.md)（企业级 + Agent）→ [dev-spec](./dev-spec/README.md)（开发前规格 · 开 PR）→ [product-apps](./product-apps/README.md)（产品面规格 · 照壳设计）→（仓库策略附录）[repos-and-vcs](./repos-and-vcs.md)。

## 已有设计（只链不抄）

旧文仍是权威细节源；本目录**不复制、不掏空**。完整稿回链，勿再抄一遍。

| 主题 | 相对链接 | 注明 |
|------|----------|------|
| 包拆分纪律 | [../PACKAGES_SPLIT.md](../PACKAGES_SPLIT.md) | Phase 1–3 + API：`@ip/contracts` / `@ip/domain` / `@ip/app-state` / `@ip/ui` / `@ip/api`（+ `apps/api-mock`）；根 `src/*` 完整 re-export；禁止掏空、禁止改 `apps/ops` 业务页 |
| e2e 分层尺子 | [../../e2e/REVIEW_RUBRIC.md](../../e2e/REVIEW_RUBRIC.md) | L0 路由冒烟 / L1 关键路径；样机冒烟不是生产回归 |
| e2e L0+L1 计划 | [../../e2e/PLAN-L0-L1.md](../../e2e/PLAN-L0-L1.md) | 端口对照与用例表；单端口绿 ≠ 多壳绿 |
| 运维可观测/告警设计 | [./ops-observability.md](./ops-observability.md) | Owner：运维；SLA mock 示意与通知事件名已对齐；真通道仍禁 |
| ops 告警通知 | [../../apps/ops/README.md#通知渠道开发者告警样机](../../apps/ops/README.md#通知渠道开发者告警样机) | 「通知渠道」段落；入口 `/config#alerts`；不发真邮件/短信/Webhook |
| api-mock 样机 | [../../apps/api-mock/README.md](../../apps/api-mock/README.md) | 端口 5180、读/写开关、merge 语义、端点表 |
| 优化笔记 / 口径 | [../OPTIMIZE_NOTES.md](../OPTIMIZE_NOTES.md) | 见「[对外口径（冻结）](../OPTIMIZE_NOTES.md#对外口径冻结)」与「[联调彩排 · 多壳深链](../OPTIMIZE_NOTES.md#联调彩排--多壳深链2026-09-12)」 |
| 仓库与分支 | [./repos-and-vcs.md](./repos-and-vcs.md) | 总控留档：单 monorepo→企业多仓（推荐 contracts/web/services 三仓 + dev/main）；硬政策才 5 壳分仓 |
| 原型后落地 | [./landing/README.md](./landing/README.md) | 后端落地切分 / 默认栈 / 路线图 / 提醒通知；引用不掏空 backends |
| 企业级 + Agent | [./enterprise/README.md](./enterprise/README.md) | 部署/租户/HA/合规/审计/私有化；C + DSH/Codex；[agent-runtime-options](./enterprise/agent-runtime-options.md)；拓扑与决策表 |
| 开发前规格 | [./dev-spec/README.md](./dev-spec/README.md) | services 树 / PG 表 / API 冻 / Day0 验收 / ADR；挂在 landing+enterprise 之后开 PR |
| 产品面规格 | [./product-apps/README.md](./product-apps/README.md) | 五壳对照 / mid·workbench·ops·iam·agent / 工具·插件 / 横切；开发可照着设计 |

相关文档（同样只链；`HARNESS` / `COMMANDS` / `PACKAGES_SPLIT` **在 `docs/`，不在根**）：[../../README.md](../../README.md) · [../HARNESS.md](../HARNESS.md) · [../COMMANDS.md](../COMMANDS.md) · [../PACKAGES_SPLIT.md](../PACKAGES_SPLIT.md) · [协作章程 TEAM_CHARTER](../TEAM_CHARTER.md) · [文档索引](../README.md)。

## 现状一句话（冻结口径）

一套前端 harness，物理拆成 mid `5173` / workbench `5174` / agent `5175` / ops `5176` / iam `5177` / api-mock `5180`（`APP_PORTS`，`packages/contracts/src/ports.ts`）。  
写入口唯一：`AppContext.dispatchCommand`（`@ip/app-state`）。mid / workbench / agent / **iam** 均挂 `AppProvider`（iam 仍是薄壳，非真 SSO）。  
读优先 `@ip/api` → api-mock，失败 fallback 内存 seed；跨口大块态靠 cookie + mid bridge，**不是**共享后端。

## 已知文档裂缝（只记不修代码）

下列是文档 / 契约与实现之间的已知裂缝，**本目录只登记，不改业务代码**：

| 裂缝 | 说明 |
|------|------|
| HARNESS / COMMANDS 仍指向 `src/domain` | [../HARNESS.md](../HARNESS.md)、[../COMMANDS.md](../COMMANDS.md) 入口路径仍写 `src/domain/caseContextContract.ts`、`src/domain/guardrails.ts`、`src/domain/commands.ts` 等。权威实现已在 `@ip/domain` / `@ip/contracts`；根 `src/domain/*` 为完整 re-export。 |
| ~~`CommandName` ⊃ `DomainCommand`~~（已消） | `DomainCommand` 已收齐 `docketEscalate` / `docketComplete`；与 `CommandName` 对齐。`dispatchCommandLocal` 委托 `escalateDocketEvent`；api-mock 仍由 `COMMAND_LABELS` 推导白名单。 |
| mock 建案 id 读路径跳过 | api-mock `createCaseFromInsight` 生成 `c-mock-*`；读路径「仅 API 有、seed 无的 id **跳过**」，故 mock 新建案不会进壳内 `PatentCase[]`。 |
| 双份 auditLog | 壳内 `AppContext.auditLog` 与 api-mock `store.auditLog` 不同步；mock 侧无 GET 暴露。 |
| Insight* 深链残留 | 部分 Insight 页仍 `navigate('/workbench…')`（本口相对跳），见 [OPTIMIZE_NOTES · 联调彩排「残留」](../OPTIMIZE_NOTES.md#联调彩排--多壳深链2026-09-12)。 |

**已消（勿再当裂缝）**：`PACKAGES_SPLIT` 漏 `@ip/api` — 包一览与 api-mock 关系节已收录；根 README「`@ip/api` 未接线」过期句已消；`HARNESS` / `COMMANDS` / `PACKAGES_SPLIT` 已迁入 `docs/`（根只留 README+CONTRIBUTING）。

评审时优先盯上表。修 HARNESS/COMMANDS 入口路径文案或收齐 `DomainCommand` 属后续刀，不在本目录「只写设计 / 不改业务代码」范围内。
