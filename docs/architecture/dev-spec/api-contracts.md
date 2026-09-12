# API 契约（冻 URL + 扩展建议 · dev-spec）

> **样机诚实**：下列五条已在 `apps/api-mock` 实现（内存）；形状对齐 `@ip/contracts` / `@ip/api` 瘦 DTO；**不**跑 `@ip/domain` guardrails。  
> **落地目标**：路径与命令名**冻结**；case-core 换实现；补会话/HITL/审计扩展并标明「建议、可与 dispatch 一体」。

权威样机端点表：[../../../apps/api-mock/README.md](../../../apps/api-mock/README.md)。

## 1. 冻结 URL（破坏兼容 = 全壳 + e2e 同 PR）

| Method | Path | 落地实现方 | 样机 |
|--------|------|------------|------|
| `GET` | `/health` | case-core（或网关聚合） | api-mock |
| `GET` | `/v1/cases` | case-core | api-mock |
| `GET` | `/v1/cases/:id` | case-core | api-mock |
| `GET` | `/v1/inbox` | case-core（投影） | api-mock |
| `POST` | `/v1/commands/dispatch` | case-core **唯一写** | api-mock（轻改瘦字段） |

开发默认基址：`APP_DEV_URLS.api` → `http://localhost:5180`。

---

## 2. 请求 / 响应形状

### 2.1 `GET /health`

```json
{ "ok": true, "mock": false, "service": "case-core" }
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `ok` | boolean | |
| `mock` | boolean | 落地必须 `false`；样机为 `true` |
| `service` | string | `case-core` 等 |

对齐 `@ip/api` `HealthResponse`（可扩字段，勿删 `ok`）。

### 2.2 `GET /v1/cases` → `CaseSummary[]`

```ts
// packages/api/src/types.ts
interface CaseSummary {
  id: string
  title: string
  caseNo: string
  stage: string      // 落地宜收窄为 StageId
  risk: string
  nextDeadline: string
  summary: string
  handoffNote?: string
}
```

落地可**另增**完整案 DTO（如 `GET /v1/cases/:id?view=full`），但列表默认保持 Summary，避免打爆 UI。  
消灭「仅 API 有的 id 跳过」：建案必须可被列表查到。

### 2.3 `GET /v1/cases/:id`

- 200：`CaseSummary`（MVP 可升级为完整 `PatentCase` 序列化 + schemaVersion；若升级须版本协商）
- 404：`{ "ok": false, "message": "案件不存在: …" }`

### 2.4 `GET /v1/inbox?persona=`

```ts
interface InboxItem {
  id: string
  caseId: string
  title: string
  kind: string
  due: string
  risk: string
  personas?: string[]
}
```

`persona` 查询参数：落地以 **JWT 声明为准**，query 仅作调试过滤（生产可忽略或须匹配声明）。

### 2.5 `POST /v1/commands/dispatch`

**Request**

```json
{
  "command": { "type": "submitResearch", "caseId": "c2", "note": "…" },
  "meta": { "actor": "user", "agentId": "optional", "detail": "optional" }
}
```

| 字段 | 类型 | 必填 |
|------|------|------|
| `command` | `DomainCommand` | 是 |
| `meta` | `CommandMeta` | 建议是；缺省时服务端可默认 `actor:user` 但 Agent 路径必须显式 `agent` |
| `meta.actor` | `'user' \| 'agent'` | Agent HITL 后必为 `agent` |
| `meta.agentId` | string | actor=agent 时建议必填 |

`DomainCommand` 联合见 `packages/contracts/src/commands.ts`（含 `docketEscalate` / `docketComplete` 等）。新增 type：**先改 contracts**。

**Response** — `CommandResult`

```ts
interface CommandResult {
  ok: boolean
  message: string
  caseId?: string
  command?: CommandName
}
```

HTTP：业务拒绝可用 **200 + ok:false**（与样机一致）或 **422**；鉴权失败 **401/403**。同一错误码表见 §4——选定后写进 OpenAPI，勿混用无文档。

**建议落地默认**：

| 情况 | HTTP | body |
|------|------|------|
| 成功 | 200 | `ok: true` |
| 领域拒绝（guardrail/handoff） | 422 | `ok: false` + message / blockers |
| 坏 JSON / 缺 command | 400 | `ok: false` |
| 未认证 | 401 | |
| 无租户权限 | 403 | |
| 案不存在（需 caseId 的命令） | 404 | `ok: false` |

样机今日多为 200 甚至对未知命令也偏松——MVP 收紧时更新 e2e。

---

## 3. 扩展 API（建议 · 未冻死）

### 3.1 Agent 会话

| Method | Path | 说明 |
|--------|------|------|
| `GET` | `/v1/agent/sessions` | 列表；`?caseId=` |
| `POST` | `/v1/agent/sessions` | 创建；绑 caseId / agentDefId / runtime |
| `GET` | `/v1/agent/sessions/:id` | 详情 + 闸状态摘要 |
| `POST` | `/v1/agent/sessions/:id/run` | 试运行或正式（body: `mode`） |

归属 `agent-session`；可经 :5180 网关反代。

### 3.2 HITL gate clear — 两种标法

| 方案 | 路径 | 何时用 |
|------|------|--------|
| **A. 与 dispatch 一体（推荐 MVP）** | 仅 `POST /v1/commands/dispatch`；gate 清在 agent-session 内前置写入 `hitl_gate_clears`，**不**另开写案 URL | 少表面；闸与命令同事务叙事清晰 |
| **B. 显式 gate API** | `POST /v1/agent/sessions/:id/gates/:gateId/clear` 然后客户端再 dispatch | 闸与命令分期审计时 |

**建议**：MVP 用 **A**；文档与 UI 仍显示 ConfirmBar，但网络上「写案」只有 dispatch 一条。若选 B，clear **不得**独改 `handoffs`。

### 3.3 审计（建议）

| Method | Path | 说明 |
|--------|------|------|
| `GET` | `/v1/audit?caseId=` | 单源 `audit_log`；消双份裂缝 |

非今日冻五条之一；加时先改 contracts/e2e 计划。

---

## 4. 错误码表（落地建议）

| code | HTTP | 含义 |
|------|------|------|
| `OK` | 200 | 成功 |
| `BAD_REQUEST` | 400 | JSON / 缺字段 / 未知 command type |
| `UNAUTHORIZED` | 401 | 无/坏 token |
| `FORBIDDEN` | 403 | 租户或 Persona 不允许 |
| `NOT_FOUND` | 404 | case / session / event 不存在 |
| `GUARDRAIL_BLOCKED` | 422 | `evaluateGuardrails` 未过 |
| `HANDOFF_ILLEGAL` | 422 | `canPerformHandoff` 未过 |
| `CONFLICT` | 409 | 乐观锁 / 重复建案号 |
| `INTERNAL` | 500 | 未处理异常 |

响应扩展（建议，非样机必有）：

```json
{
  "ok": false,
  "message": "…",
  "code": "GUARDRAIL_BLOCKED",
  "blockers": []
}
```

`GuardrailEvalResult` / blockers 形状跟 `@ip/contracts` / domain，不另起。

---

## 5. 鉴权头（落地）

| 头 | MVP |
|----|-----|
| `Authorization: Bearer <access_token>` | OIDC access token；case-core 验签 |
| `Content-Type: application/json` | POST 必填 |

样机 CORS 允许 localhost 5173–5177、5180；生产收紧 Origin。

---

## 6. 相关链接

- [build-guide.md](./build-guide.md) · [data-model.md](./data-model.md)
- `packages/contracts/src/commands.ts` · `audit.ts` · `events.ts` · `ports.ts`
- `packages/api/src/types.ts` · `client.ts`
