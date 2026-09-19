# AGENT_NO_BILLING_HOLD_TOPBAR — 去掉 Agent 壳全宽欠费黄条（P0）

**分支** `dev` · **范围** `apps/agent/**` + 本短记 · **边界** 不重开 dock/ENTRY/FULL；不链 mid；禁 Cloud。

## 结论

| 项 | 状态 |
|----|------|
| `AgentShell` 挂载 `<AgentBillingHoldBanner/>` | **已卸**（协同 `7755a9c`；壳仅留注释，组件文件保留未引用） |
| 主区顶全宽 amber「仅提示·不停审」 | **禁止 / 已确认无** |
| 欠费信息弱提示 | 侧栏底部 **slate 弱 chip**（`data-billing-hold-chip`），非全宽黄条、无 mid 链 |

## 本提交改动

1. **确认** `AgentShell.tsx` 无 `AgentBillingHoldBanner` import/JSX（勿加回顶条）
2. **`AgentSessionSidebar.tsx`**：底部弱 chip（`summarizeBillingHold` + `BILLING_HOLD_COPY` headline + 案/票计数）；`bg-slate-50` 非 amber 全宽条

## 自点（Playwright · 2026-09-19 Asia/Shanghai）

- 基址 `http://127.0.0.1:5175` · 复用已有 `dev:agent`
- `/agent`：强制 `engagement.invoices` 为逾期后
  - **无** `[data-billing-hold-banner]`
  - header 下一兄弟为主区 `flex` 容器（非黄条）
  - 侧栏可见弱 chip（例：`递交已停权 · N 案 · N 张欠票`）
- 证据：`docs/ui-polish/_billing-hold-topbar-home.png` · `_billing-hold-topbar-verify.json`

## typecheck

`npm run typecheck -w @ip/agent` → green

## SHA

`5329956f4540b7627ce194f67e0d17969b38a32c`
