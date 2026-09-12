# 共享包拆分说明（Phase 1–3 + API 客户端）

原型 monorepo：`/workspace/ip-harness`。目标是把根 `src`（`@shared`）拆成可依赖 packages，根保留 **完整 re-export**，各 app 可渐进改 import。

## 包一览

| 包 | npm名 | 职责 | 不做什么 |
| --- | --- | --- | --- |
| `packages/contracts` | `@ip/contracts` | 契约唯一真相：`CommandName` / `DomainCommand`、handoff keys、ports、crossPortKeys、audit / CaseContext schema、`DOMAIN_EVENTS` | 不放 React / 业务 handler / HTTP |
| `packages/domain` | `@ip/domain` | 类型 + 域逻辑（guardrails、caseContext 构建、stages/persona 纯规则、handoff 标签映射等）；依赖并 re-export/扩展 contracts | **不双份**命令名/schema |
| `packages/app-state` | `@ip/app-state` | `AppContext` / `AgentContext` / `ProductContext` / `crossPortStore`；经 `apiMockRead` / `apiMockWrite` 接线 `@ip/api` | 不放纯展示组件 |
| `packages/ui` | `@ip/ui` | 无业务副作用展示件（`ProgressBar` / `RiskBadge` / `StageBadge` / `HandoffChip` / `FulfillmentModeBadge` / `AppSurfaceLinks` / `InsightSisterNav`） | 不依赖 `@ip/app-state`（防环）；不塞 dispatch |
| `packages/api` | `@ip/api` | 薄 HTTP 客户端 + DTO（`createApiClient`）；命令/审计类型 **re-export `@ip/contracts`**，不双份 | 不是服务端；不持业务 store |

### `@ip/api` 与 `apps/api-mock`

- **`@ip/api`**：浏览器侧客户端（依赖 contracts），给 `AppContext` 等调用 `POST /v1/commands/dispatch`、`GET /v1/cases` 等。
- **`apps/api-mock`（`@ip/api-mock`）**：同仓 **HTTP 样机服务**（默认 :5180），实现上述端点；**非真后端**，内存 store。Owner 为接口样机助手。
- 关系一句话：**客户端在 `packages/api`，样机服务在 `apps/api-mock`；二者共用 `@ip/contracts` 命令字符串，不各写一套。**

## CommandName 与 DomainCommand（已对齐）

对照实码（`packages/contracts/src/commandNames.ts` · `commands.ts`）：

| 符号 | 定义处 | 含义 |
| --- | --- | --- |
| `CommandName` | `@ip/contracts` `commandNames.ts` | **全部**可审计/可点名的命令字符串（含 `docketEscalate` / `docketComplete`） |
| `DomainCommand` | `@ip/contracts` `commands.ts` | `dispatchCommand` 主路径的 **可辨识联合**（payload 形状）；**已收齐** docket* 两支 |

因此文档口径是：

> **`CommandName` 与 `DomainCommand['type']` 已对齐**（含 `docketEscalate` / `docketComplete`）。  
> `dispatchCommandLocal` 对 docket* **委托** `escalateDocketEvent`；api-mock `KNOWN_COMMANDS` 仍由 `COMMAND_LABELS` 推导，轻量更新 `handoffNote`。  
> 勿另起第三份命令名表。

`@ip/domain` / `@ip/api` 对二者均为 **re-export**，不另起第三份名单。

## 根兼容

- `@shared/*` → 仍指向 `./src/*`
- `src/types`、`src/domain/*`、`src/context/*`、`src/components/{ProgressBar,RiskBadge,…}` 等为 **完整 re-export**
- 纯类型必须用 `export type *`（verbatim 下普通 `export *` 会蒸发）

## App 挂载

各 app tsconfig / `tools/viteAppConfig` / 根 vite 已挂（按需）：

- `@ip/contracts`、`@ip/domain`（含 `/types`）、`@ip/app-state`、`@ip/ui`、`@ip/api`

## 硬规则（总控）

1. 每刀后 `mid` / `workbench` / `agent` typecheck 必须绿  
2. 根 `src/*` re-export **不得掏空**  
3. **禁止**改 `apps/ops` 业务页  

## 验证（对照现状）

- typecheck 绿：`domain` / `contracts` / `app-state` / `ui` / `api` / `mid` / `workbench` / `agent`
- 运行时：mid Inbox 冒烟 `shots/shared-pack-mid-inbox-smoke.png`（非门禁）
- app-state 已接线 `@ip/api` 读/写样机（`apiMockRead.ts` / `apiMockWrite.ts`）；失败 fallback 内存 seed

## 刻意未迁

- ops 大盘业务页（硬规则：勿改）
- 强绑 context 的壳（Sidebar、Layout、PersonaSwitcher、TenantBanner…）
- PageHeader（依赖 AppLink）
- `RaciPanel`（依赖 `@shared/data/raci`，非纯展示；未进 `@ip/ui`）
- workbench：业务仍在 `apps/workbench/src/flows/*`；`stages/*` 仅为边界 + re-export（见 [workbench/OWNER_STATUS](./workbench/OWNER_STATUS.md)）
- 大体积 seed（`cases` / `agents` / `sessions` / `workbenchSeeds` 等）**不**硬搬进 packages

### app-state 仍依赖的根 `@shared/*`（诚实清单）

| 类别 | 路径（`@shared/...`） | 说明 |
| --- | --- | --- |
| data seed | `data/cases` · `data/agents` · `data/sessions` · `data/workbenchSeeds` · `data/workspaces` · `data/handoff` · `data/persona` · `data/docketRules` · `data/dataStrategy` | 大体积 / 运行时 seed，未硬搬 |
| utils | `utils/billing` · `utils/dynamicTodos` · `utils/docketEscalate` · `utils/fullFilingCheck` · `utils/slaInbox` · `utils/sessionSearch` | 仍挂根；低风险 stages 已可走 `@ip/domain` |
| 已改 | `data/stages` → 优先 `@ip/domain`（`getStageMeta` / `STAGE_ORDER` 等） | type-only / 已在 domain 的 re-export |

## 建议调用方

- 新代码：类型/域 → `@ip/domain`；契约常量 → `@ip/contracts`；状态 → `@ip/app-state`；纯 UI → `@ip/ui`；HTTP 样机客户端 → `@ip/api`
- 旧代码：继续 `@shared/...` 即可
- Owner：共享包助手（domain/ui/app-state + 根 re-export）；`@ip/api` 客户端边界与 contracts 对齐由共享包盯纪律，样机服务归接口样机助手

## 相关

- [architecture/codebase.md](./architecture/codebase.md) — 目录地图  
- [HARNESS.md](./HARNESS.md) · [COMMANDS.md](./COMMANDS.md)  
- [architecture/README.md](./architecture/README.md) — 已知裂缝表  
