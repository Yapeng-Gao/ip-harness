# 原型结束后怎么落地后端（landing）

> **样机诚实**：今日仍是多 Vite 壳 + `api-mock:5180` 内存店；无真微服务、真库、真 SSO、真 SMTP、真调度器。  
> **落地目标**：本目录说明「原型结束后」如何从 `@ip/contracts` / `@ip/domain` / `apps/api-mock` **长出**可私有化的后端切分与默认栈。  
> 服务候选细节仍以上级 [../backends.md](../backends.md) 为权威；本目录侧重**落地切分、数据归属、阶段路线、提醒边界**，不重复掏空。

## 本目录

| 篇 | 路径 | 回答什么 |
|----|------|----------|
| 后端切分与数据归属 | [backends.md](./backends.md) | 落地服务面、职责、同步/异步、样机 vs 落地 |
| 技术栈选项与默认推荐 | [stack.md](./stack.md) | API/DB/队列/鉴权/文件/观测对比 + 推荐默认栈 |
| 三阶段路线图 | [roadmap.md](./roadmap.md) | 原型 → MVP → 生产；冻结项与风险 |
| 状态提醒 / 通知 | [reminders-notify.md](./reminders-notify.md) | 产品面接法、后端边界、「提醒不行」根因、MVP |

阅读顺序：本页 → [backends](./backends.md) → [stack](./stack.md) → [roadmap](./roadmap.md) → [reminders-notify](./reminders-notify.md)。

## 评审

- [REVIEW.md](./REVIEW.md) — 架构评审结论：**通过**（对照 SHA `eda0bef`；非阻塞：MVP 冻 Fastify/Hono）。


## 回链上级 architecture

- 架构索引：[../README.md](../README.md)
- 服务候选（已有完整稿）：[../backends.md](../backends.md)
- 多壳数据流：[../data-flow.md](../data-flow.md)
- 数据模型：[../data-model.md](../data-model.md)
- 仓库策略：[../repos-and-vcs.md](../repos-and-vcs.md)
- 运维可观测样机：[../ops-observability.md](../ops-observability.md)
- api-mock 权威：[../../../apps/api-mock/README.md](../../../apps/api-mock/README.md)

## 冻结口径（一句话）

先冻 `POST /v1/commands/dispatch` 与 `DomainCommand` / `DOMAIN_EVENTS` 字符串，再换实现；一期 `services/` 进同一 monorepo（对齐 [repos-and-vcs](../repos-and-vcs.md)），推荐 TypeScript + Postgres + Redis + OIDC + 对象存储 + OpenTelemetry。
