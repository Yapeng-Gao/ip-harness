# Agent BillingHold 全宽黄条 · 杀掉（P0）

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai） |
| **目标** | Agent Home/Sessions/Projects shell **不再**挂全宽 `AgentBillingHoldBanner`（用户恨的「仅提示·不停审」琥珀条） |
| **基线 HEAD** | `f4e180c` |
| **范围** | 仅 `apps/agent` shell chrome；不改 HITL / DomainCommand；保留 ART/ATT Must；无 mid CTA |

## 改了什么

1. **`apps/agent/src/components/AgentShell.tsx`**
   - 卸载全宽 `<AgentBillingHoldBanner compact … />`（原 ~L153）
   - 移除对应 import
   - 留注释：组件文件仍保留，供 settings/dev 弱提示复用；**壳主区永不挂**
2. **`AgentBillingHoldBanner.tsx`**：文件保留、**未被 shell 引用**（非删除组件，仅 demote out of chrome）
3. **未改**：HITL、DomainCommand、共用 mid `BillingHoldBanner`（5173）、Workbench 横幅

## 活验（Playwright · REQUIRED）

- 脚本：`docs/ui-polish/agent-billing-hold-kill/_live-verify.mjs`
- Base：`http://127.0.0.1:5175`
- 策略：注入 `overdueStopEnabled` + enterprise_ip + 逾期票后仍断言 **无**横幅（证明不是「种子未命中」假绿）
- 断言：无 `[data-billing-hold-banner]`；正文无 `不停审` / `仅提示·不停审`；无全宽琥珀欠费条
- **PASS=`true`**（见 `_live-verify.json`）

| 路由 | 截图 |
|------|------|
| `/agent`（force hold） | `live-01-home.png` |
| `/agent/sessions` | `live-02-sessions.png` |
| `/agent/projects` | `live-03-projects-list.png` |
| 项目 workspace | `live-04-project.png` |

## typecheck

`npm run typecheck -w @ip/agent` → green

## Blockers

无。
