# `@ip/api` · 薄 HTTP 客户端

面向同仓样机 `apps/api-mock`（**非真后端**）的 `fetch` 封装。

- 默认 base：`http://localhost:5180`（`@ip/contracts` · `APP_DEV_URLS.api`）
- **第二刀（写）**：`@ip/app-state` 的 `AppContext.dispatchCommand` 写路径优先本客户端 → api-mock:5180；失败 fallback 内存；跨口 bridge / `crossPortStore` 仍保留
- 写开关：`VITE_IP_API_MOCK_WRITE` / `localStorage['ip-harness.api-mock.write']`（`0`=关，仅内存；默认开）
- **读路径**：`listCases` / `getCase` / `getInbox` 供 AppContext 查询侧优先拉取；成功则按 id **叠加** `CaseSummary` 瘦字段到已有 `PatentCase`（非整表替换）；Inbox 另存 `apiMockInbox`；失败 fallback 内存 seed
- 读开关：`VITE_IP_API_MOCK_READ` / `localStorage['ip-harness.api-mock.read']`（`0`=关；默认开）

```ts
import { createApiClient } from '@ip/api'

const api = createApiClient()
await api.health()
await api.listCases()
await api.dispatchCommand(
  { type: 'submitResearch', caseId: 'c2', note: 'mock' },
  { actor: 'user' },
)
```

> 样机声明：同仓 mock，不是生产后端。UI 成功写路径后会在 message 中附带 `· via api-mock:5180（样机）`；不可达时附带 `· api-mock 不可达，已 fallback 内存`。读路径 merge 语义见 `apps/api-mock/README.md`；实现见 `packages/app-state/src/apiMockRead.ts`。
