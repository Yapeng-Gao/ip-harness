# cross-cutting · 产品面横切

> **样机诚实**：跨口靠 `APP_DEV_URLS` + cookie + mid bridge；契约在 `@ip/contracts` / `@ip/domain`；e2e 是样机冒烟非生产回归。  
> **落地目标**：深链主机名可换、契约仍冻字符串；身份改真会话；写仍唯一；多壳 e2e 保留端口矩阵语义。

## 1. 深链与 `APP_DEV_URLS`

权威：`packages/contracts/src/ports.ts`。

| 常量 | 开发 URL |
|------|----------|
| mid | `http://localhost:5173` |
| workbench | `http://localhost:5174` |
| agent | `http://localhost:5175` |
| ops | `http://localhost:5176` |
| iam | `http://localhost:5177` |
| api | `http://localhost:5180` |

纪律：

- 跨口导航用 `AppLink` / `navigateApp`（解析 `APP_DEV_URLS`）；禁对本口外路径裸 `Link`。
- 改端口含义 → 全壳 + e2e **同 PR**。
- 生产用网关主机名；`APP_PORTS` 只保留本地联调语义。

常见深链：mid ` /cases/:id?tab=audit`；workbench `/workbench/<stage>`；agent `/agent/sessions/:id`；ops → mid 审计。

## 2. contracts / domain

| 包 | 产品面用法 |
|----|------------|
| `@ip/contracts` | `APP_PORTS`、handoff keys/labels、`CommandName`、PersonaId、事件名 |
| `@ip/domain` | `AgentDef` 类型、guardrails、getStageMeta、执法逻辑 |
| `@ip/app-state` | `AppProvider` / `dispatchCommand` |
| `@ip/api` | 读/写 HTTP 客户端（对 5180） |

新增命令/事件：**先改 contracts**，再实现壳与服务。禁在 stage / Agent 内再定义平行 key。

## 3. 禁壳直写库

```text
壳 UI ──X──► Postgres / 内存 seed「假装正式写」
壳 UI ──► dispatchCommand / POST /v1/commands/dispatch ──► case-core
```

- mid / workbench / agent / iam：正式写只经 DomainCommand。
- ops：不持案、不写办案命令。
- Agent 工具：见 [agent-tools-mcp.md](./agent-tools-mcp.md)。

## 4. Persona

- 样机：cookie + `PersonaRouteGate`；iam 薄壳写入。
- 落地：OIDC 声明；见 [iam.md](./iam.md)。
- CaseContext / 审计须能解释「谁在看 / 谁在批」。

## 5. e2e 多壳

| 层 | 含义 |
|----|------|
| L0 | 各口路由可达（单端口绿 ≠ 多壳绿） |
| L1 | 关键办理 / HITL / 深链路径 |

权威：[../../../e2e/REVIEW_RUBRIC.md](../../../e2e/REVIEW_RUBRIC.md) · [../../../e2e/PLAN-L0-L1.md](../../../e2e/PLAN-L0-L1.md)。

若拆 workbench 子 app（不推荐默认）：必须扩端口表与 L0/L1，见 [workbench.md](./workbench.md) 检查清单。

## 6. 与上游冻结项

继承 landing / dev-spec，不另起：

- URL：`GET /health` · `GET /v1/cases` · `GET /v1/cases/:id` · `GET /v1/inbox` · `POST /v1/commands/dispatch`
- `DomainCommand` / `DOMAIN_EVENTS`
- Agent 默认 C 混合（DSH/Codex + 自有闸）

## 7. 相关链接

- [../data-flow.md](../data-flow.md) · [../README.md](../README.md)
- [README.md](./README.md)（本目录索引）
