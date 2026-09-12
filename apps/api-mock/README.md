# `@ip/api-mock` · 同仓样机 · 非真后端

本地 HTTP mock（Node 内置 `http`），端口 **5180**（`@ip/contracts` · `APP_PORTS.api`）。

> **诚实声明**：本服务是 monorepo 内的接口样机，**不是**生产后端；内存 store，进程重启即丢。  
> **第二刀已接线**：`AppContext.dispatchCommand` 写路径**优先** `@ip/api` → 本服务；失败/未起服时 **fallback** 现有内存 dispatch。跨口 `crossPortStore` / `__cross_port_bridge.html` 仍作跨口 fallback（勿拆）。  
> **读路径已接线**：`AppContext` 查询侧优先 `@ip/api` 拉 cases/inbox；按 id **merge** 瘦字段到 seed `PatentCase`；`apiMockInbox` 另存；失败 fallback 内存。样机非真后端。

## 启动

```bash
# 仓库根
npm install
npm run dev:api
# → http://localhost:5180
```

或：`npm run dev -w @ip/api-mock`

## 写路径开关（第二刀）

| 开关 | 关（仅内存） | 默认 |
|------|--------------|------|
| `VITE_IP_API_MOCK_WRITE` | `=0` | 未设 = 开 |
| `localStorage['ip-harness.api-mock.write']` | `=0` | 未设 / 非 `0` = 开 |

- **默认开**：优先 POST `/v1/commands/dispatch`；打到样机后仍执行本地内存镜像（UI 与 mock 非同进程）。
- **关**：跳过 HTTP，仅内存 `dispatchCommandLocal`。
- 实现：`packages/app-state/src/apiMockWrite.ts` · 接线在 `AppContext`。

## 读路径开关（查询侧 · 本刀）

| 开关 | 关（仅内存 seed） | 默认 |
|------|-------------------|------|
| `VITE_IP_API_MOCK_READ` | `=0` | 未设 = 开 |
| `localStorage['ip-harness.api-mock.read']` | `=0` | 未设 / 非 `0` = 开 |

- **默认开**：优先 `GET /v1/cases`、`GET /v1/cases/:id`、`GET /v1/inbox`；成功则按 **id 叠加/覆盖** 瘦字段（title/caseNo/stage/risk/nextDeadline/summary）到已有 `PatentCase[]`；API 没有的案保留 seed；**仅 API 有的 id 跳过**（避免半残 PatentCase）。
- **勿**用 `CaseSummary` 整表替换 `PatentCase`（会打爆 UI）。
- Inbox：样机结果另存 `apiMockInbox`（查询侧/调试）；**不拆**现有 sla/watch/maintain 纯函数 Inbox。
- 失败/未起服 → `null` → fallback 内存 seed；`console.info` 标明。
- 实现：`packages/app-state/src/apiMockRead.ts` · 接线在 `AppContext`（`reloadFromApiMock`）。
- **诚实声明**：同仓样机，非真后端；写路径行为不变。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | `/health` | `{ ok, mock, service }` |
| GET | `/v1/cases` | 案件摘要列表 |
| GET | `/v1/cases/:id` | 详情 / 404 |
| GET | `/v1/inbox?persona=` | 待办（可按 persona 过滤） |
| POST | `/v1/commands/dispatch` | 领域命令（CommandName 白名单） |

CORS：允许 localhost 各 app 端口（5173–5177、5180）。

## curl 样例

```bash
curl -s localhost:5180/health
curl -s localhost:5180/v1/cases
curl -s localhost:5180/v1/cases/c1
curl -s 'localhost:5180/v1/inbox?persona=enterprise_ip'
curl -s -X POST localhost:5180/v1/commands/dispatch \
  -H 'content-type: application/json' \
  -d '{"command":{"type":"submitResearch","caseId":"c2","note":"mock"},"meta":{"actor":"user"}}'
```


## CommandName 白名单说明（样机局限）

`POST /v1/commands/dispatch` 使用 `store.ts` 的 `KNOWN_COMMANDS`（字符串白名单），**不是**完整跑壳内 `canPerformHandoff` / guardrails。

| 点 | 诚实口径 |
|----|----------|
| 与 `CommandName` | 白名单覆盖 `commandNames.ts` 现有名（含 `docketEscalate` / `docketComplete`） |
| 与 `DomainCommand` | 联合类型**尚未**收 docket*；mock 对这两支只做轻审计/校验 `caseId`，不假装已进联合 |
| 执法 | 仍在浏览器 `dispatchCommandLocal`；mock 只轻改 `handoffNote` 等瘦字段 |
| 权威对照 | [docs/architecture/backends.md](../../docs/architecture/backends.md) § api-mock 局限 |

共享包若收齐 `DomainCommand` ⊇ `CommandName`，本白名单应改为派生自同一源，避免第三份列表漂移。

## getCase 手测（`GET /v1/cases/:id`）

样机级单案查询（瘦 `CaseSummary`，**不是**完整 `PatentCase`）。

```bash
# 先起服务
npm run dev:api

# 命中
curl -s localhost:5180/v1/cases/c1
# → id/title/caseNo/stage/risk/nextDeadline/summary（可选 handoffNote）

# 未命中
curl -s -o /dev/null -w "%{http_code}\n" localhost:5180/v1/cases/no-such
# → 404

# 客户端等价
# createApiClient().getCase('c1')
```

说明：AppContext 读路径 boot 主要用 `listCases` + `inbox` 做按 id merge；`getCase` 供按需/调试（`tryGetCaseFromApiMock` / `createApiClient().getCase`）。UI 仍以内存 `PatentCase` 为准。

## 客户端

薄封装见 [`packages/api`](../../packages/api)（`@ip/api` · `createApiClient`）。
