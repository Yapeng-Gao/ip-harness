# 共享包拆分说明（Phase 1–3 + API 客户端）

原型 monorepo：`/workspace/ip-harness`。目标是把根 `src`（`@shared`）拆成可依赖 packages，根保留 **完整 re-export**，各 app 可渐进改 import。

## 包一览

| 包 | npm名 | 职责 | 不做什么 |
| --- | --- | --- | --- |
| `packages/contracts` | `@ip/contracts` | 契约唯一真相：命令名、handoff keys、ports、crossPortKeys、audit schema 等 | 不放 React / 业务 handler / HTTP |
| `packages/domain` | `@ip/domain` | 类型 + 域逻辑（guardrails、caseContext 构建、stages/persona 纯规则、handoff 标签映射等）；依赖并 re-export/扩展 contracts | **不双份**命令名/schema |
| `packages/app-state` | `@ip/app-state` | `AppContext` / `AgentContext` / `ProductContext` / `crossPortStore`；可接线 `@ip/api` 读写样机 | 不放纯展示组件 |
| `packages/ui` | `@ip/ui` | 无业务副作用展示件（badge/chip/ProgressBar…） | 不依赖 `@ip/app-state`（防环）；不塞 dispatch |
| `packages/api` | `@ip/api` | 薄 HTTP 客户端 + DTO（`createApiClient`）；命令/审计类型 **re-export `@ip/contracts`**，不双份 | 不是服务端；不持业务 store |

### `@ip/api` 与 `apps/api-mock`

- **`@ip/api`**：浏览器侧客户端（依赖 contracts），给 `AppContext` 等调用 `POST /v1/commands/dispatch`、`GET /v1/cases` 等。
- **`apps/api-mock`（`@ip/api-mock`）**：同仓 **HTTP 样机服务**（默认 :5180），实现上述端点；**非真后端**，内存 store。Owner 为接口样机助手。
- 关系一句话：**客户端在 `packages/api`，样机服务在 `apps/api-mock`；二者共用 `@ip/contracts` 命令字符串，不各写一套。**

## CommandName 与 DomainCommand（勿混为一谈）

| 符号 | 定义处 | 含义 |
| --- | --- | --- |
| `CommandName` | `@ip/contracts` `commandNames.ts` | **全部**可审计/可点名的命令字符串（含 `docketEscalate` / `docketComplete`） |
| `DomainCommand` | `@ip/contracts` `commands.ts` | `dispatchCommand` 主路径的 **可辨识联合**（payload 形状）；**现状样机尚未**收齐 docket* 两支 |

因此文档口径是：

> **`CommandName` ⊇ `DomainCommand['type']`（现状：真包含 / 超集）**  
> docket 写路径走 AppContext 专用函数 + `pushAudit`；api-mock 可用独立白名单认 docket*。  
> **不是**「两个名字互相矛盾」，而是「全名表」与「已建模联合」的刻意裂缝；收齐时只扩 `DomainCommand`，不改已有 `CommandName` 字符串。

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

## 验证（P1）

- typecheck 绿：`domain` / `contracts` / `app-state` / `ui` / `mid` / `workbench` / `agent`
- 运行时：mid Inbox 冒烟 `shots/shared-pack-mid-inbox-smoke.png`（非门禁）

## 刻意未迁

- ops 大盘业务页
- 强绑 context 的壳（Sidebar、Layout、PersonaSwitcher、TenantBanner…）
- PageHeader（依赖 AppLink）
- app-state 仍依赖根 seed/utils（后续可再收）
- `DomainCommand` 尚未收 docket*（见上节）

## 建议调用方

- 新代码：类型/域 → `@ip/domain`；契约常量 → `@ip/contracts`；状态 → `@ip/app-state`；纯 UI → `@ip/ui`；HTTP 样机客户端 → `@ip/api`
- 旧代码：继续 `@shared/...` 即可
- Owner：共享包助手（domain/ui/app-state + 根 re-export）；`@ip/api` 客户端边界与 contracts 对齐由共享包盯纪律，样机服务归接口样机助手
