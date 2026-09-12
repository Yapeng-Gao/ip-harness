# 未来后端拆分边界（完整稿 · 样机级）

> **现状样机**：没有真后端。`apps/api-mock` 是同仓 Node `http` 内存店，端口 `APP_PORTS.api = 5180`。  
> 本篇谈**目标设计**的服务候选，事件名对齐 `@ip/contracts` `DOMAIN_EVENTS`。未实现的一律标「目标」，禁止写成已拆微服务。  
> api-mock 读/写开关、merge、双写语义与 [apps/api-mock/README.md](../../apps/api-mock/README.md) 对齐；端点细节以该 README 为准，本篇只标局限与迁移方向。

## 1. 诚实边界

### 现状样机

- 六个端口 = 五个 Vite 壳 + 一个 mock HTTP，**不是**服务网格。
- `@ip/api` `createApiClient` 只打 mock（端点表见 api-mock README）：`/health` · `/v1/cases` · `/v1/cases/:id` · `/v1/inbox` · `POST /v1/commands/dispatch`。
- **已接线**：读路径优先 `@ip/api`（merge 瘦字段 + `apiMockInbox`）；写路径优先 POST dispatch，打到样机后仍 local 镜像；失败/未起服 fallback 内存。跨口仍靠 `crossPortStore` / mid bridge。
- mock store（`apps/api-mock/src/store.ts`）只对 `handoffNote` 等瘦字段做轻突变；**不**跑 `canPerformHandoff` / `evaluateGuardrails`。执法仍在浏览器 `dispatchCommandLocal`。
- ops / iam 无后端：通知试发写 sessionStorage；Persona 写 cookie。
- `DOMAIN_EVENTS` 注释原文：*no bus implementation — contract only*。

### 目标设计

- 先抽「命令 + 案读模型 + 审计」三块，再考虑交接/期限/费用/会话。
- 事件名**复用**现常量，不另起一套字符串。
- **今日无真库 / 真微服务**；迁移时先冻结 URL 与命令名（见 §7）。

---

## 2. 服务候选（每节：现状样机 vs 目标设计）

按现仓概念切，不按今日 Vite 壳 1:1 拆。壳继续做 BFF 消费者。

### 2.1 command（命令服务）

| | |
|--|--|
| **对齐现仓** | `dispatchCommand` / `DomainCommand` / `CommandResult` / `evaluateGuardrails` / `canPerformHandoff` |
| **现状样机** | 浏览器 `dispatchCommandLocal` 执法；可选 POST 到 api-mock（轻突变 + 自有 auditLog）；成功后再镜像 local |
| **目标设计** | `POST /v1/commands/dispatch`（沿用路径）为**唯一**写；服务内跑 domain 纯模块；返回 `CommandResult`；发 `ip.command.dispatched` / `ip.command.failed` |
| **不做什么** | 不直接改 UI；不绕过 guardrails；不把壳升级成微服务 |

### 2.2 case-read（案读模型）

| | |
|--|--|
| **对齐现仓** | `PatentCase` 投影 / `CaseSummary` / `buildCaseContext` / `reloadFromApiMock` |
| **现状样机** | GET cases → 按 id **merge** 瘦字段到 seed；仅 API 有的 id 跳过；无完整聚合读 |
| **目标设计** | `GET /v1/cases` · `GET /v1/cases/:id` · 未来 `GET /v1/cases/:id/context`；完整 DTO 或分层资源；订阅命令/交接事件建投影 |
| **不做什么** | 不接受除命令外的 PATCH |

### 2.3 handoff（可并入 command 一期）

| | |
|--|--|
| **对齐现仓** | `HandoffState` / `TRANSITIONS` / `canPerformHandoff` |
| **现状样机** | 状态机在浏览器；mock 最多改 `handoffNote` |
| **目标设计** | 随命令副作用；或 `GET .../handoffs`；壳内不再实现状态机 |
| **不做什么** | 不在壳内再实现状态机 |

### 2.4 audit（审计）

| | |
|--|--|
| **对齐现仓** | `AuditEntry` / `pushAudit` / `AUDIT_SCHEMA_VERSION` |
| **现状样机** | 壳内 `auditLog` + mock 进程内 `auditLog`（无 GET、不同步） |
| **目标设计** | 追加只写；`GET .../audit?caseId=` 供回放 / 证据包；强制 `schemaVersion` |
| **不做什么** | 不是分布式 tracing |

### 2.5 inbox

| | |
|--|--|
| **对齐现仓** | `@ip/api` `InboxItem` + sla/watch 纯函数待办 |
| **现状样机** | GET `/v1/inbox?persona=` → `apiMockInbox`；与纯函数 Inbox **双轨** |
| **目标设计** | 单一查询服务；可订阅 `ip.handoff.changed` / `ip.docket.escalated` |
| **不做什么** | 不替代独立 Docket SLA 引擎（若拆） |

### 2.6 docket（期限）

| | |
|--|--|
| **对齐现仓** | `DocketEvent` / `docketEscalate` / `docketComplete` |
| **现状样机** | AppContext 专用函数 + `pushAudit`；命令未进 `DomainCommand`；mock 白名单认 docket* |
| **目标设计** | 期限查询 + 升级命令；发 `ip.docket.escalated` |
| **不做什么** | 不接真官方官网爬取 |

### 2.7 billing（费用）

| | |
|--|--|
| **对齐现仓** | `CaseInvoice` / `issueInvoice` / `payInvoice` / BillingHoldBanner |
| **现状样机** | 内存 engagement.invoices；付款闸走 guardrails |
| **目标设计** | 开票/付款命令；发 `ip.billing.holdChanged` |
| **不做什么** | 不接真支付 |

### 2.8 iam

| | |
|--|--|
| **对齐现仓** | `PersonaId` / workspace cookie / iam 薄壳 |
| **现状样机** | cookie 跨口；**非真 SSO**；iam 壳空态占位 |
| **目标设计** | 真会话 / OIDC（**未排期**）；发 `ip.persona.changed`；办案服务只收已验证声明 |
| **不做什么** | 今日禁止假装已接通 |

### 2.9 agent-session

| | |
|--|--|
| **对齐现仓** | `AgentSession` / HITL / `AGENT_CATALOG` / `clearedHitlGates` |
| **现状样机** | 浏览器内存会话；试运行不写库；正式/HITL 调 `dispatchCommand(actor:'agent')` |
| **目标设计** | 会话 + 闸状态服务；写办案仍调 command |
| **不做什么** | **不**引入真 LLM（[HARNESS.md](../../HARNESS.md)「不做的事」） |

### 2.10 notify（ops）

| | |
|--|--|
| **对齐现仓** | ops `/config#alerts` 样机 |
| **现状样机** | sessionStorage 试发；不发真邮件/短信/Webhook（见 [ops README](../../apps/ops/README.md#通知渠道开发者告警样机)） |
| **目标设计** | 出站通道；订阅 `ip.command.failed` / `ip.docket.escalated` 等；**不**持有 `PatentCase` |
| **不做什么** | 今日明确不接真通道；不改 `apps/ops` 业务页预埋假后端 |

**一期建议（目标，未排期）**：command + case-read + audit。其余继续内存。

---

## 3. 同步 vs 异步边界

### 现状样机

- 全部同步：一次 `dispatchCommand` 内改 cases + pushAudit + 可选 flow bump；HTTP 往返后再 local 镜像。
- 无队列、无 outbox、无订阅者。

### 目标设计

| 路径 | 模式 | 理由 |
|------|------|------|
| 办理命令（提交/批准/授权/递交/开票/付款） | **同步** 命令-应答 | HITL / 表单要立刻 `CommandResult` + 刷新交接 |
| 案读 / Inbox / CaseContext | **同步** GET | 壳首屏 |
| 审计追加 | 同步写库 + **异步** 通知订阅方 | UI 回放要立刻可见；ops / Inbox 可稍后 |
| Docket 升级、billing hold、跨面横幅 | **异步** 事件 | 不阻塞递交主路径 |
| Agent 试运行 / 工具卡片 | 仍可前端脚本 | 正式执行才进 command |
| ops 告警出站 | 异步（真通道日） | 与办案命令解耦 |

失败语义（目标）：命令同步失败不发后续事件；`ip.command.failed` 仅用于可观测 / 补偿，不回滚已成功的别的聚合（一期单聚合内事务即可）。

---

## 4. 事件名对齐（`DOMAIN_EVENTS`）

常量源：`packages/contracts/src/events.ts`。**现状：无名消费方（无 bus）。** 目标按名挂订阅，勿改字符串。

| 常量键 | 事件名（真实常量） | 建议生产者（目标） | 建议消费者（目标） | 同步/异步 |
|--------|--------------------|--------------------|--------------------|-----------|
| `commandDispatched` | `ip.command.dispatched` | command | case-read 投影 / audit / Inbox | 异步投影；命令本身同步 |
| `commandFailed` | `ip.command.failed` | command | ops 示意 / 客户端 toast | 异步 |
| `handoffChanged` | `ip.handoff.changed` | command 或 handoff | mid 案详 / workbench 栏 / Agent 侧栏 | 异步 |
| `auditAppended` | `ip.audit.appended` | audit | CaseDetail 回放 / 证据包 | 近实时 |
| `caseContextBuilt` | `ip.caseContext.built` | case-read（或命令后重建） | Agent / 工作台同读 | 可同步构建、异步广播 |
| `personaChanged` | `ip.persona.changed` | iam | 各壳刷新可见性 / Inbox | 异步 |
| `productSwitched` | `ip.product.switched` | 产品面（今日 `ProductContext` / `ACTIVE_PRODUCT_LS_KEY`） | 壳 IA | 仍可前端；非领域核心 |
| `docketEscalated` | `ip.docket.escalated` | docket | Inbox / mid 风险条 | 异步 |
| `billingHoldChanged` | `ip.billing.holdChanged` | billing | `BillingHoldBanner` / authorize 闸 | 异步 |

新增事件必须先改 `@ip/contracts`，再写生产者。禁止壳内私自 invent 字符串。  
`ip.product.switched` 建议保持前端事件、不强制进领域总线。

---

## 5. 数据归属（目标）与现状对照

| 归属 | 目标 | 现状对照 |
|------|------|----------|
| command / case 写 | 唯一写入；删除浏览器业务 handler | `dispatchCommandLocal` + 可选 mock 双写 |
| case-read | 订阅命令/交接事件建投影 | `AppContext` state + merge 瘦字段 |
| audit | 命令成功副作用；强制 schemaVersion | 壳 auditLog ≠ mock auditLog |
| iam | Persona / workspace 声明 | cookie |
| agent-session | 会话与闸；写办案调 command | 内存 `AgentSession` |
| ops notify | 独立；不持有 PatentCase | sessionStorage 试发 |
| 跨口大块态 | 后端 | `crossPortStore` last-write-wins |

---

## 6. api-mock 局限（样机 · 与 README 一致）

以下为**诚实局限**，细节以 [api-mock README](../../apps/api-mock/README.md) 为准：

| 局限 | 说明 |
|------|------|
| 非真后端 | Node `http` 内存店；进程重启即丢 |
| **不跑** `canPerformHandoff` / `evaluateGuardrails` | 只做瘦字段轻突变；执法在浏览器 |
| 自有 `auditLog` 不同步 | mock 进程内追加；无 GET 暴露；与壳 `AppContext.auditLog` 无关 |
| `MockCase` ≠ `PatentCase` | 字段对齐 `CaseSummary`；读路径按 id merge，仅 API 有的 id 跳过 |
| 写双镜像 | POST 成功后仍 `dispatchCommandLocal`（UI 与 mock 非同进程） |
| 命令白名单 | `KNOWN_COMMANDS` 含 `docketEscalate` / `docketComplete`（`DomainCommand` 联合未收） |
| `createCaseFromInsight` | 生成 `c-mock-*`；读路径跳过 → 壳看不到新案 |

---

## 7. 迁移路径建议（目标 · 未排期）

**原则：先冻结 URL / 命令名，再换实现。**

1. **冻结合同**：保留 `POST /v1/commands/dispatch`、`GET /v1/cases`、`GET /v1/cases/:id`、`GET /v1/inbox`、`GET /health`；`DomainCommand.type` / `CommandName` 字符串不改（收齐 docket* 时只扩联合，不改已有名）。
2. 把 `evaluateGuardrails` + `canPerformHandoff` 做成 command 服务纯模块（已是 `@ip/domain`，可原样搬）。
3. 命令 HTTP 成为**唯一**写；删除成功后再 local 镜像。
4. case-read 用完整 DTO 替换「`CaseSummary` 按 id 叠加」。
5. 暴露 `GET /v1/audit`；废弃 mock 内隐匿 `auditLog`。
6. 再谈事件总线与 docket/billing/iam 拆分。

幂等 / 审计 id（今日 `aud-${Date.now()}-…` / `aud-mock-N`）、多租户 `ownerEnterpriseId` 服务端强制点：一期设计时再定，本篇不假装已有。

---

## 8. 明确不做（与总控对齐）

- 不把 mid/workbench/agent **壳**升级成微服务。
- 不把 api-mock 内存店对外说成生产 API。
- 不引入真 LLM、真 SSO、真 ELK/Prometheus、真 SMTP/短信（见根 README / HARNESS / ops README）。
- 不改 `apps/ops` 业务页来「预埋」假后端（[PACKAGES_SPLIT.md](../../PACKAGES_SPLIT.md) 硬规则）。
- 不双份 `CommandName` / handoff 键（domain 只 re-export contracts）。

---

## 9. 相关链接

- [data-flow.md](./data-flow.md) — 壳读写与双写镜像  
- [data-model.md](./data-model.md) — 类型与包归属  
- [repos-and-vcs.md](./repos-and-vcs.md) — 附录：仓策略（单 monorepo → 企业多仓推荐 contracts/web/services + dev/main）（总控留档）  
- [api-mock README](../../apps/api-mock/README.md) — 端点 / 开关权威  
- [COMMANDS.md](../../COMMANDS.md) · [HARNESS.md](../../HARNESS.md)
