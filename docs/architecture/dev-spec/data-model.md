# 落地表级数据模型（Postgres · dev-spec）

> **样机诚实**：今日**无真库**；真相 = 浏览器 `PatentCase[]` / `auditLog` + api-mock 内存 `store`（瘦 `MockCase`，≠ 完整 `PatentCase`）；双份 audit 不同步。  
> **落地目标**：Postgres 建议表名、字段、PK、索引，并映射 `@ip/contracts` / `@ip/domain`；样机内存 → PG 迁移注记。本篇是**规格**，不是 migration 已合并。

样机概念权威仍见 [../data-model.md](../data-model.md)；本篇只写落地表，不掏空上级。

## 1. 总览

| 表名 | 归属服务 | 主要映射类型 |
|------|----------|----------------|
| `tenants` | iam | 租户根（样机 `ownerEnterpriseId` 等） |
| `persona_bindings` | iam | `PersonaId` ↔ 用户/租户 |
| `cases` | case-core | `PatentCase` 聚合头 + JSON 富字段 |
| `handoffs` | case-core | `HandoffState` 按案×工件 |
| `commands` | case-core | 一次 `DomainCommand` 执行记录 |
| `audit_log` | case-core | `AuditEntry` |
| `agent_sessions` | agent-session | 会话头 + transcript 引用 |
| `hitl_gate_clears` | agent-session | `clearedHitlGates` |
| `docket_events` | docket | 期限事件 |
| `notify_outbox` | notify / case-core 写出 | 出站 / 领域事件投递 |

一期可用 **单库多 schema**（如 `core` / `iam` / `agent` / `docket` / `notify`），进程拆分后再谈分库。

**诚实**：推本文时仓库内**无** Prisma/Drizzle migration、无连接串生产配置。

---

## 2. 表定义

### 2.1 `tenants`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `text` | PK | 如 `ent-demo`；对齐 `ownerEnterpriseId` |
| `name` | `text` | NOT NULL | |
| `kind` | `text` | NOT NULL | `enterprise` \| `agency` \| … |
| `created_at` | `timestamptz` | NOT NULL DEFAULT now() | |
| `meta` | `jsonb` | | 扩展 |

索引：无额外必建（PK 足够）；按 name 搜索可加 `(name)`。

### 2.2 `persona_bindings`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `uuid` | PK | |
| `tenant_id` | `text` | FK → tenants | |
| `user_sub` | `text` | NOT NULL | OIDC `sub` |
| `persona_id` | `text` | NOT NULL | `@ip/contracts` `PersonaId` |
| `role` | `text` | | `enterprise` \| `agency` 等 |
| `is_default` | `boolean` | DEFAULT false | |
| `updated_at` | `timestamptz` | NOT NULL | |

建议索引：`UNIQUE (tenant_id, user_sub, persona_id)`；`(user_sub)`。

映射：样机 cookie Persona → 声明 + 本表；**禁止** cookie 当生产鉴权。

### 2.3 `cases`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `text` | PK | `PatentCase.id` |
| `tenant_id` | `text` | NOT NULL, FK | 行级隔离；`ownerEnterpriseId` |
| `case_no` | `text` | NOT NULL | |
| `title` | `text` | NOT NULL | |
| `type` | `text` | | `PatentType` |
| `stage` | `text` | NOT NULL | `StageId` |
| `risk` | `text` | | `RiskLevel` |
| `next_deadline` | `timestamptz` / `text` | | MVP 可 text 对齐样机 |
| `progress` | `int` | | 0–100 |
| `summary` | `text` | | |
| `inventor` | `text` | | |
| `owner_team` | `text` | | |
| `agency_name` | `text` | | |
| `assigned_agency_id` | `text` | | |
| `fulfillment_mode` | `text` | | `self_serve` \| `delegated` |
| `engagement` | `jsonb` | | `Engagement`（含 invoices） |
| `checklist` | `jsonb` | | |
| `artifacts` | `jsonb` | | |
| `timeline` | `jsonb` | | |
| `flow_progress` | `jsonb` | | `flowProgressByCase` 投影 |
| `flags` | `jsonb` | | `fromInsight` / `oaStatementConfirmed` / `quoteDispatchStatus` / `legalReview` / `linkedAlertId` 等 |
| `created_at` | `timestamptz` | NOT NULL | |
| `updated_at` | `timestamptz` | NOT NULL | |
| `row_version` | `int` / `xid` 等价 | | 乐观锁可选 |

建议索引：`(tenant_id, stage)`；`(tenant_id, updated_at DESC)`；`(case_no)` UNIQUE 可按租户：`UNIQUE (tenant_id, case_no)`；到期扫描辅助 `(next_deadline)` WHERE NOT NULL。

映射：

| PG | `@ip/domain` / API |
|----|---------------------|
| 行头字段 | `PatentCase` 标量 |
| `engagement` JSON | `Engagement` |
| 列表 API | `@ip/api` `CaseSummary`（投影：id/title/caseNo/stage/risk/nextDeadline/summary[+handoffNote]） |
| 样机 MockCase | **废弃**瘦并行；用 mapper 从本表投影 |

### 2.4 `handoffs`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `case_id` | `text` | PK 部分, FK → cases | |
| `artifact_key` | `text` | PK 部分 | `HandoffArtifactKey` |
| `status` | `text` | NOT NULL | `HandoffStatus` |
| `updated_at` | `timestamptz` | NOT NULL | |
| `updated_by` | `text` | | `UserRole` |
| `note` | `text` | | |
| `receipt_no` | `text` | | `fileResponse` |
| `filed_at` | `timestamptz` / `text` | | |
| `versions` | `jsonb` | | `ArtifactVersion[]` |
| `extra` | `jsonb` | | 齐套检查等 |

PK：`(case_id, artifact_key)`。  
建议索引：`(status, updated_at)`；`(case_id)`（FK 已覆盖）。

映射：`PatentCase.handoffs[artifact_key]` → `HandoffState`；流转规则仍在 `@ip/domain` `canPerformHandoff` / `TRANSITIONS`，**不**用 DB trigger 复制状态机。

### 2.5 `commands`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `uuid` / `text` | PK | 执行 id |
| `type` | `text` | NOT NULL | `DomainCommand['type']` / `CommandName` |
| `case_id` | `text` | | 建案前可空，成功后回填 |
| `tenant_id` | `text` | NOT NULL | |
| `payload` | `jsonb` | NOT NULL | 完整 `DomainCommand` |
| `meta` | `jsonb` | NOT NULL | `CommandMeta`（actor/agentId/detail） |
| `ok` | `boolean` | NOT NULL | |
| `message` | `text` | | `CommandResult.message` |
| `created_at` | `timestamptz` | NOT NULL | |
| `actor` | `text` | NOT NULL | 冗余便于索引：`user` \| `agent` |

建议索引：`(case_id, created_at DESC)`；`(tenant_id, created_at DESC)`；`(type, created_at DESC)`。

### 2.6 `audit_log`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `text` | PK | `AuditEntry.id` |
| `actor` | `text` | NOT NULL | `AuditActor` |
| `agent_id` | `text` | | |
| `command` | `text` | NOT NULL | `CommandName` |
| `case_id` | `text` | NOT NULL | |
| `tenant_id` | `text` | NOT NULL | |
| `at` | `timestamptz` | NOT NULL | |
| `detail` | `text` | | |
| `schema_version` | `text` | NOT NULL | 强制写 `AUDIT_SCHEMA_VERSION`（`2026.09.1`） |
| `command_id` | `uuid` / `text` | FK 可选 → commands | |

建议索引：`(case_id, at DESC)`；`(tenant_id, at DESC)`。  
**单源**：废弃壳 `auditLog` 与 mock `auditLog` 双份；暴露 `GET /v1/audit?caseId=`（扩展，非今日冻 URL）。

### 2.7 `agent_sessions`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `text` | PK | |
| `tenant_id` | `text` | NOT NULL | |
| `case_id` | `text` | | 可空仅洞察建案前 |
| `agent_def_id` | `text` | | Catalog |
| `status` | `text` | | running / waiting_hitl / closed … |
| `persona_id` | `text` | | |
| `runtime` | `text` | | `dsh` \| `codex` \| `script_mock` |
| `checkpoint_ref` | `text` | | sidecar checkpoint id / URI |
| `transcript_uri` | `text` | | 对象存储或大 JSON 外置 |
| `created_at` / `updated_at` | `timestamptz` | | |
| `meta` | `jsonb` | | |

建议索引：`(tenant_id, case_id)`；`(status, updated_at DESC)`。

### 2.8 `hitl_gate_clears`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `session_id` | `text` | PK 部分, FK | |
| `gate_id` | `text` | PK 部分 | `HitlGateId` |
| `cleared_at` | `timestamptz` | NOT NULL | |
| `cleared_by` | `text` | | user_sub / persona |
| `command_id` | `text` | | 关联已 dispatch 命令 |
| `note` | `text` | | |

PK：`(session_id, gate_id)`。映射样机 `clearedHitlGates: Set/Record`。

### 2.9 `docket_events`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `text` | PK | `DomainCommand` 的 `eventId` |
| `case_id` | `text` | NOT NULL, FK | |
| `tenant_id` | `text` | NOT NULL | |
| `title` | `text` | | |
| `due_at` | `timestamptz` | NOT NULL | |
| `status` | `text` | NOT NULL | open / escalated / done / at_risk … |
| `risk` | `text` | | |
| `last_action` | `text` | | `remind` \| `escalate_enterprise` \| `mark_at_risk` |
| `payload` | `jsonb` | | |
| `updated_at` | `timestamptz` | | |

建议索引：`(status, due_at)` — **扫描器主路径**；`(case_id, due_at)`。

升级/完成：**不**直接改 case 交接真相以外的旁路；发 `docketEscalate` / `docketComplete` 经 case-core。

### 2.10 `notify_outbox`

| 列 | 类型建议 | 约束 | 说明 |
|----|----------|------|------|
| `id` | `uuid` | PK | |
| `event_name` | `text` | NOT NULL | `DOMAIN_EVENTS` 字符串 |
| `aggregate_type` | `text` | | case / docket / command … |
| `aggregate_id` | `text` | | |
| `tenant_id` | `text` | | |
| `payload` | `jsonb` | NOT NULL | **禁止**塞完整 `PatentCase`；只要 id + 摘要 |
| `status` | `text` | NOT NULL | pending / sent / dead |
| `attempts` | `int` | DEFAULT 0 | |
| `available_at` | `timestamptz` | | 退避 |
| `created_at` | `timestamptz` | | |
| `sent_at` | `timestamptz` | | |

建议索引：`(status, available_at)` WHERE pending — outbox poller；`(event_name, created_at DESC)`。

也可用 Redis Stream 作运输层，但**投递日志**建议仍落 PG 便于审计。

---

## 3. 样机内存 → PG 注记

| 今日来源 | 迁入 | 注意 |
|----------|------|------|
| 根 `src/data/cases.ts` seed | `cases` + `handoffs` | 富字段进 JSON；勿只迁 MockCase 瘦列 |
| api-mock `store.cases` | 废弃并行真相 | 切换日只认 PG |
| `AppContext.auditLog` | `audit_log` | 合并去重 by id；强制补 `schema_version` |
| api-mock `auditLog` | 同上或丢弃未暴露部分 | 双份裂缝在 MVP 消掉 |
| `flowProgressByCase` | `cases.flow_progress` | workbench 写、mid 读 |
| Agent 内存 sessions / gates | `agent_sessions` / `hitl_gate_clears` | 无真 transcript 则空 URI |
| Docket 浏览器态 | `docket_events` | 无 cron 的历史可种子化 |
| cookie Persona | `persona_bindings` + OIDC | cookie 降为 UX 缓存 |

建案 `c-mock-*`：落地后**允许**仅 API/DB 有的 id 进入列表（消灭「仅 API 有则跳过」）。

---

## 4. 类型映射速查

| 契约 / 领域 | 表 / 列 |
|-------------|--------|
| `DomainCommand` | `commands.payload` |
| `CommandMeta` / `CommandResult` | `commands.meta` / `ok`+`message` |
| `AuditEntry` + `AUDIT_SCHEMA_VERSION` | `audit_log` |
| `DOMAIN_EVENTS` | `notify_outbox.event_name` |
| `CaseSummary` | `cases` 投影 VIEW 或查询 |
| `HandoffState` | `handoffs` |
| `PatentCase` | `cases` + 子表组装 |
| `PersonaId` | `persona_bindings.persona_id` |
| `HitlGateId` | `hitl_gate_clears.gate_id` |
| `APP_PORTS` | 不入库（开发常量） |

---

## 5. 相关链接

- [data-flow.md](./data-flow.md) · [api-contracts.md](./api-contracts.md) · [build-guide.md](./build-guide.md)
- [../data-model.md](../data-model.md)（样机完整稿）
- `packages/contracts` · `packages/domain/src/types/index.ts`
