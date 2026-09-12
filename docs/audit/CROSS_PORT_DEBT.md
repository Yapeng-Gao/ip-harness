# 跨口消债（业务深评 Owner）

> 更新：2026-09-12 · 范围：共享内核 `src/`（`@shared`）+ 多壳深链  
> **勿动**：`apps/ops`；`src/types/index.ts`（保持 `export type * from '@ip/domain/types'`）  
> **冻结设计债**（本单不改）：Docket×Maintain 分表、Drive 双存、建案进调研台

## 已清主路径

| 面 | 机制 | 代表落点 |
|----|------|----------|
| 深链解析 | `src/lib/deepLinks.ts` · `resolveAppHref` / `navigateApp` / `surfaceForPath` | multi-app 跨面 → `APP_DEV_URLS` 绝对 URL |
| 链组件 | `src/components/AppLink.tsx` · `AppLink` / `AppNavLink` | 跨面 `<a>`，同面 `Link`/`NavLink` |
| 壳 / 中台 | PageHeader、Sidebar、WorkspaceMenu、BillingHoldBanner、Dashboard、CaseLibrary、CaseDetail、Docket、Pipeline、opsInbox / slaInbox | 已接 AppLink / `appHref` |
| Agent 会话壳 | SessionConfirmBar / SessionWorkspaceHeader / SessionContextPanel 等 | HITL 后回 WB / mid |
| Flow toast | `components/workbench/flow/toast.tsx` · `ToastBanner` | nextActions 已走 AppLink |
| Insight* → workbench | `InsightTracks` / `Innovate` / `Layout` / `Chain` | **已** `navigateApp`（订正旧 NOTES「仍 navigate」说法） |
| apps/workbench | 本地 `midCaseHref` / `midDocketHref` / `resolveActionHref` 等 | 分叉面绝对深链（与共享 AppLink 并存） |
| apps/agent | 本地 `midHref` / `workbenchAbsHref` | 分叉面绝对深链 |

## 本单要消（P0 / P1）

### P0

- [x] `src/pages/agent/AgentSessionWorkspace.tsx` — 域同步 toast「打开案件 / 打开对应工作台」→ `AppLink`（`resolveAppHref`）

### P1

- [x] `src/pages/agent/AgentSessionsList.tsx` — `/cases`、`/cases/:id` → `AppLink`
- [x] `src/pages/InventorPortal.tsx` — `/agent`、`/cases` 链与 toast → `AppLink` / `navigateApp`
- [x] Flow（`src/pages/workbench`）跨面链：
  - Watch → `/cases`（及 `/docket` toast 已由 ToastBanner AppLink）
  - Monetize → `/cases`
  - Prosecution → `/docket`
  - Maintain → `/billing/cases`
  - Intake → `/agent/agents`
- [x] `src/pages/workbench/WorkbenchHome.tsx` — 跨面 `actionPath`（尤其 `/docket`、`/pipeline`）→ `AppLink`

## 冻结设计债（不动）

1. **Docket × Maintain 分表** — 期限表与维持办理分表并存，不合并 schema。
2. **Drive 双存** — 样机双写 / 双读语义保留。
3. **建案进调研台** — Agent / Insight 建案深链仍进 research（`CreateCaseFromInsight` → research），设计如此。

## 样机限制

- **cookie ≠ SSO**：`persona` / `workspace` 经 localhost host-only cookie 跨口可读，**不是**真 SSO 会话。
- **大块态依赖 mid bridge**：cases / auditLog / flowProgressByCase / docketEvents 跨口靠 mid `5173` iframe + postMessage；mid 须在跑；非共享后端；不等同真多租户同步。
- UI 诚实一句见 `CROSS_PORT_LIMITS_ZH`（`@ip/app-state` / `crossPortStore`）。

## Insight* 订正

旧 `OPTIMIZE_NOTES` 联调表曾写 Insight*「仍 `navigate('/workbench…')`，靠 mid `RedirectExternal`」。  
**现状**：四页均已 `navigateApp(navigate, workbenchPathForStage(…))`；multi-app 下直接绝对跳 5174，不再依赖该残留说法。

## 验证

```bash
npm run typecheck -w @ip/mid -w @ip/workbench -w @ip/agent
```
