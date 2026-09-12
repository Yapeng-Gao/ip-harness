# Agent P0 验收清单 · 深链 / 字体 / Billing banner

日期：2026-09-12（CST）  
范围：仅 `apps/agent/**`（contracts/domain/根 src 只读）

## 改了什么

### A. 深链扫尾
- 扩展 `src/lib/deepLinks.ts`：
  - 新增 `iamHref` / `iamLoginHref`
  - 新增 `midCaseHref` / `midCasesHref` / `midDocketHref` / `midBillingHref`
  - 新增 `resolveActionHref` / `isAbsoluteHttpUrl`
  - 保留既有 `midHref` / `workbenchHref` / `midInboxHref` / `agentSessionPath`
- 新增 `AgentWorkspaceMenu`：顶栏「重新选择工作区」→ `iamHref('/')`（`<a href>`），替换共享 `WorkspaceMenu` 的相对 `/login`
- 新增 `AgentBillingHoldBanner`：案链 / 费用中心全部 `midCaseHref` / `midBillingHref` 绝对深链
- `AgentShell` 改用上述本地组件
- `SessionConfirmBar` 费用链改为 `midBillingHref('cases')`
- 本面 `/agent/*` 仍用 react-router `Link` / `navigate`（未改）

### B. 入口字体与根/mid 统一
- 新增 `src/agent.css`：与 mid `mid.css` 同栈  
  `"Noto Sans CJK SC", "Noto Sans SC", "Noto Sans CJK", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`
- `src/main.tsx`：`@shared/index.css` + `./agent.css`（对齐 mid：`@shared/index.css` + `./mid.css`）
- `index.html`：favicon 改为 `/favicon.svg`（与 mid / `public/favicon.svg` 一致）

### C. PageHeader / Billing banner
- PageHeader 用法（SessionsList / HarnessOverview）：跨口 secondary 已是 `window.location.href = midHref/workbenchHref`；本面 `to="/agent/..."` 保持相对 — 无需再改
- Billing banner：本地 `AgentBillingHoldBanner` 文案/层级/compact 与共用组件对齐；链接一律绝对 mid，不再相对跳费用页

## 深链对照（新增）

| Helper | 目标口 | 示例 |
|--------|--------|------|
| `iamHref('/')` | iam:5177 | `http://localhost:5177/` |
| `iamLoginHref()` | iam:5177 | `http://localhost:5177/login` |
| `midCaseHref(id)` | mid:5173 | `…/cases/:id` |
| `midCasesHref()` | mid:5173 | `…/cases` |
| `midDocketHref(id?)` | mid:5173 | `…/docket` / `…/docket?case=` |
| `midBillingHref('cases')` | mid:5173 | `…/billing/cases` |
| `midBillingHref('/billing/cases?tab=ledger&status=逾期')` | mid:5173 | 完整费用台账逾期筛 |
| `midHref` / `workbenchHref` / `midInboxHref` | 既有 | 不变 |

## 字体怎么统一
入口与 mid 已统一做法一致：共享 `index.css` 提供 type scale + body 默认栈；app 本地 css 在 Linux/box 优先 Noto Sans CJK SC，避免小写拉丁抢匹配破中文。

## Banner 怎么对齐
- 数据源：只读 `@shared/utils/billingHoldBanner`（`summarizeBillingHold` + `BILLING_HOLD_COPY`）
- 视觉：headline / 计数 / body / 涉案链 / CTA 层级与共用 `BillingHoldBanner` 一致；`compact` 行为同壳
- 链接：`<a href={mid…}>`，不用 react-router `Link`

## tsc 结果
```
npm run typecheck -w @ip/agent
> tsc -p tsconfig.json --noEmit
（exit 0，无错误）
```

## 改动文件列表
- `apps/agent/src/lib/deepLinks.ts`（扩展）
- `apps/agent/src/agent.css`（新）
- `apps/agent/src/main.tsx`
- `apps/agent/index.html`
- `apps/agent/src/components/AgentWorkspaceMenu.tsx`（新）
- `apps/agent/src/components/AgentBillingHoldBanner.tsx`（新）
- `apps/agent/src/components/AgentShell.tsx`
- `apps/agent/src/components/session/SessionConfirmBar.tsx`
- `apps/agent/AGENT_P0_ACCEPTANCE.md`（本清单）

## 已知遗漏 / 边界
- 共享 `@shared` 的 `WorkspaceMenu` / `BillingHoldBanner` 本身未改（按约束只读根 src）；agent 面已本地替换
- `ProductSwitcher` / `PersonaSwitcher` 仍用共享组件；ProductSwitcher 已走 `APP_DEV_URLS`，Persona 无跨口链
- mid(5173) 上 `/agent/*` MetaRedirect 丢 path 问题仍在 mid 侧（agent README 已知限制）
- workbench 面仍直接挂共享 `BillingHoldBanner`（相对链在 5174 上同样会错口）— 非本任务范围
