# dev-spec 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/dev-spec/` 八篇 |
| 对象 SHA | **`678b54e`**（`docs(architecture): add backend dev-spec for implementable MVP`） |
| 日期 | 2026-09-12 |
| **结论** | **通过** |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| 留档 / 父索引 | 过 | 八篇齐全；父 `architecture/README` 已链 |
| 样机诚实 vs 落地 | 过 | 各篇开篇双口径；明确「不是已交付」 |
| 可照文档开发（开 PR 粒度） | 过 | topology 树、落地表、冻 URL、Day0→Step6 验收勾选 |
| 冻 URL ↔ contracts/api-mock | 过 | 五条与 landing/api-mock 一致；`CaseSummary`/`InboxItem`/`HealthResponse`/`DomainCommand` 对齐 `@ip/api`·contracts |
| 与 landing 七面 / 栈 | 过 | case-core 等七面不另起；TS+PG+Redis+OIDC+S3+OTel |
| 与 enterprise C+DSH/Codex | 过 | ADR-002；禁退回 LangGraph 默认①；禁 Agent 直写库 |
| 不假装已交付网格/真 Agent | 过 | 「明确不做」+ 总验收禁宣称 |
| ADR 与已拍板一致 | 过 | 001–007 对齐 landing/enterprise；008 Fastify/Hono **开工前**二选一（正确未冻死） |
| build 步骤有验收 | 过 | Day0 + Step1–6 + 总验收均有勾选 |

## 抽查要点

- 端口：`APP_PORTS` + MVP 同口 `5180` 替换 api-mock（或标注双跑）清晰。
- HITL：推荐 gate 与 dispatch 一体（方案 A）；ConfirmBar 仍为 UI 真相叙事。
- data-model：tenants/cases/handoffs/commands/audit_log/agent_sessions/hitl_gate_clears/docket/notify_outbox 可开工。
- 错误码：样机偏松 → MVP 收紧已写明，须跟 e2e（非挡通过）。

## 非阻塞建议

1. **ADR-008**：第一个 `services/case-core` PR 必须勾死 Fastify 或 Hono。
2. ADR 决策日志「精确 SHA 回填」可在推 REVIEW 后补一行（可选）。
3. Step2「可先内存再换 PG」须在 PR 描述钉切换日，防双真相拖延（文已警告）。

## 裁决

**通过。** 可总控总验。不要求为建议项重开全稿。
