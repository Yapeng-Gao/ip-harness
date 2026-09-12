# landing 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 SHA | `eda0bef`（`docs(architecture): landing backends, stack, roadmap, notify`） |
| 对象 | `docs/architecture/landing/` 五篇（README · backends · stack · roadmap · reminders-notify） |
| 日期 | 2026-09-12 |
| **结论** | **通过** |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| 留档 `docs/architecture/` | 过 | 五篇在 `landing/`；父 `architecture/README` 已索引 |
| 索引完整 | 过 | landing README 列全四主文；回链上级 backends/data-flow/data-model/repos/ops/api-mock |
| 样机诚实 vs 落地目标 | 过 | 各篇开篇双口径；roadmap 三阶段分「已有/必做/禁止」 |
| 与现仓 contracts / api-mock 可演进 | 过 | 冻 `POST /v1/commands/dispatch`、cases/inbox/health；`DOMAIN_EVENTS` / `APP_PORTS` / `DomainCommand`（含 docket*）对齐现仓 |
| 不假装微服务 / 真库 | 过 | 一期同仓 `services/` 模块；明确非 Day-1 网格；样机无 PG/Redis/OIDC/SMTP/调度 |
| 切分可落地 | 过 | `case-core` 合并 command/case/handoff/audit；与上级 backends 映射表清晰；壳不做微服务 |
| 推荐栈有理由 | 过 | TS+Fastify/Hono+PG+Redis+OIDC+S3兼容+OTel；对比表含私有化与样机关系 |
| roadmap 三阶段清晰 | 过 | 原型→MVP→生产；MVP 有可执行验收；冻结项表可核对 |
| 提醒/通知边界诚实 | 过 | 根因表（无调度/无通道/双轨 Inbox/无 bus）；MVP 最小集与「不做」分明 |

## 抽查要点（与仓）

- 端口与 `APP_PORTS`（含 api 5180）一致。
- 事件名摘录与 `packages/contracts/src/events.ts` 一致（含 `ip.docket.escalated` / `ip.command.failed`）。
- `DomainCommand` 现已含 `docketEscalate` / `docketComplete`（与 landing 表述一致；父索引裂缝表已标「已消」）。
- api-mock 路径集合与 roadmap 冻结 URL 一致。
- 与已收上级 `backends.md`：落地名映射表无冲突；billing 未单列但注明可挂 `case-core`，可接受。

## 非阻塞建议（不挡通过）

1. stack「Fastify 或 Hono」择一冻可在 MVP 开工 PR 里定死，本文已声明即可。
2. landing README 可在父「已知裂缝」旁加一句：MVP 用实现消双 auditLog / mock 新建跳过（roadmap §5.3 已写，索引层可更显眼）。

## 裁决

**通过。** 可总控总验。不要求为建议项重开全稿。
