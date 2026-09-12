# 架构设计文档（样机级）

> **现状样机**：多 Vite 壳 + 共享内核（根 `src/` + `@ip/*`）+ 同仓 `api-mock:5180`。  
> **不是**微服务、**不是**真库、**不是**真 SSO、**不是**真可观测。  
> 本目录三篇主文已是**完整稿**（可评审的样机级设计），不是大纲占位。凡标「现状样机」的是今天能跑的前端 harness；标「目标设计」的是未实现方向，禁止对外当已交付。

## 文档目的

- 对齐现仓真实路径 / 导出名，把「壳怎么读、命令怎么写、类型在哪个包、未来后端怎么拆」分成三篇，避免一篇里混谈。
- **诚实边界**：不把 localhost cookie / mid iframe bridge / 内存 seed 写成共享后端。
- 旧设计文档只相对链接，本目录**不复制、不掏空**。

## 本目录三篇（主责 · 完整稿）

| 篇 | 路径 | 回答什么 |
|----|------|----------|
| 多壳数据流 | [data-flow.md](./data-flow.md) | 各壳如何读/写、cookie / bridge / `@ip/api` 的优先级；含 flowchart + sequence |
| 数据模型 | [data-model.md](./data-model.md) | Case / Handoff / Command / Persona / Audit / CaseContext 与包归属 |
| 未来后端边界 | [backends.md](./backends.md) | 服务候选、同步/异步、事件名对齐 `DOMAIN_EVENTS`、迁移建议 |

阅读顺序建议：本页 → [data-flow](./data-flow.md) → [data-model](./data-model.md) → [backends](./backends.md) →（仓库策略附录）[repos-and-vcs](./repos-and-vcs.md)。

## 已有设计（只链不抄）

旧文仍是权威细节源；本目录**不复制、不掏空**。完整稿回链，勿再抄一遍。

| 主题 | 相对链接 | 注明 |
|------|----------|------|
| 包拆分纪律 | [../../PACKAGES_SPLIT.md](../../PACKAGES_SPLIT.md) | Phase 1–3：`@ip/contracts` / `@ip/domain` / `@ip/app-state` / `@ip/ui`；根 `src/*` 完整 re-export；禁止掏空、禁止改 `apps/ops` 业务页 |
| e2e 分层尺子 | [../../e2e/REVIEW_RUBRIC.md](../../e2e/REVIEW_RUBRIC.md) | L0 路由冒烟 / L1 关键路径；样机冒烟不是生产回归 |
| e2e L0+L1 计划 | [../../e2e/PLAN-L0-L1.md](../../e2e/PLAN-L0-L1.md) | 端口对照与用例表；单端口绿 ≠ 多壳绿 |
| 运维可观测/告警设计 | [./ops-observability.md](./ops-observability.md) | Owner：运维；SLA mock 示意与通知事件名已对齐；真通道仍禁 |
| ops 告警通知 | [../../apps/ops/README.md#通知渠道开发者告警样机](../../apps/ops/README.md#通知渠道开发者告警样机) | 「通知渠道」段落；入口 `/config#alerts`；不发真邮件/短信/Webhook |
| api-mock 样机 | [../../apps/api-mock/README.md](../../apps/api-mock/README.md) | 端口 5180、读/写开关、merge 语义、端点表 |
| 优化笔记 / 口径 | [../../OPTIMIZE_NOTES.md](../../OPTIMIZE_NOTES.md) | 见「[对外口径（冻结）](../../OPTIMIZE_NOTES.md#对外口径冻结)」与「[联调彩排 · 多壳深链](../../OPTIMIZE_NOTES.md#联调彩排--多壳深链2026-09-12)」 |
| 仓库与分支 | [./repos-and-vcs.md](./repos-and-vcs.md) | 总控留档：单 monorepo→企业多仓（推荐 contracts/web/services 三仓 + dev/main）；硬政策才 5 壳分仓 |

相关根文档（同样只链）：[../../README.md](../../README.md) · [../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md) · [协作章程 TEAM_CHARTER](../TEAM_CHARTER.md)。

## 现状一句话（冻结口径）

一套前端 harness，物理拆成 mid `5173` / workbench `5174` / agent `5175` / ops `5176` / iam `5177` / api-mock `5180`（`APP_PORTS`，`packages/contracts/src/ports.ts`）。  
写入口唯一：`AppContext.dispatchCommand`（`@ip/app-state`）。mid / workbench / agent / **iam** 均挂 `AppProvider`（iam 仍是薄壳，非真 SSO）。  
读优先 `@ip/api` → api-mock，失败 fallback 内存 seed；跨口大块态靠 cookie + mid bridge，**不是**共享后端。

## 已知文档裂缝（只记不修代码）

下列是文档 / 契约与实现之间的已知裂缝，**本目录只登记，不改业务代码**：

| 裂缝 | 说明 |
|------|------|
| `PACKAGES_SPLIT` 漏 `@ip/api` | [../../PACKAGES_SPLIT.md](../../PACKAGES_SPLIT.md) 包一览只列 contracts / domain / app-state / ui，未收录 `packages/api`（`@ip/api`）与 `apps/api-mock`。 |
| HARNESS / COMMANDS 仍指向 `src/domain` | [../../HARNESS.md](../../HARNESS.md)、[../../COMMANDS.md](../../COMMANDS.md) 入口路径仍写 `src/domain/caseContextContract.ts`、`src/domain/guardrails.ts`、`src/domain/commands.ts` 等。权威实现已在 `@ip/domain` / `@ip/contracts`；根 `src/domain/*` 为完整 re-export。 |
| `CommandName` ⊃ `DomainCommand` | `CommandName` 含 `docketEscalate` / `docketComplete`（`packages/contracts/src/commandNames.ts`），但 `DomainCommand` 联合（`commands.ts`）**没收**这两支。docket 写路径走 AppContext 专用函数 + `pushAudit`；api-mock 用独立 `KNOWN_COMMANDS` 白名单认这两支。 |
| mock 建案 id 读路径跳过 | api-mock `createCaseFromInsight` 生成 `c-mock-*`；读路径「仅 API 有、seed 无的 id **跳过**」，故 mock 新建案不会进壳内 `PatentCase[]`。 |
| 双份 auditLog | 壳内 `AppContext.auditLog` 与 api-mock `store.auditLog` 不同步；mock 侧无 GET 暴露。 |
| Insight* 深链残留 | 部分 Insight 页仍 `navigate('/workbench…')`（本口相对跳），见 [OPTIMIZE_NOTES · 联调彩排「残留」](../../OPTIMIZE_NOTES.md#联调彩排--多壳深链2026-09-12)。 |

评审时优先盯上表。根 README「`@ip/api` 未接线」过期句**已消**（现仓与根 README 均已写明接线）。其余修文档或收齐联合类型属后续刀，不在本目录「只写设计」范围内。
