# AGENT_HOME_CASE_ENTRY_DEDUP — Home 案件入口去双胞胎

**分支** `dev` · **范围** `apps/agent/**`（短记本目录）· **边界** 不重开 BillingHold / mid / dock。

## 问题（P0 IA）

`AgentHome` 主区案件入口双挂：

1. compose 底栏「关联案件」`<select>`
2. 下方 `CaseBindControls`（创建并绑定 / 绑定已有）

同义重复，用户不知该点哪一处。

## 改动

| 项 | 处理 |
|----|------|
| compose「关联案件」label + select | **删除** |
| compose「Agent / 自动匹配」select | **保留** |
| 下方 `CaseBindControls` | **唯一案件入口**；绑定后仍挂载（含解除绑定） |
| 弱提示「也可先开始…会话顶栏」 | **保留**（仅未绑定时） |
| `caseId` state | URL `?case=` + `CaseBindControls` `onBind`/`onUnbind`；`start` / `startWithAgent` / `createSession` 仍读同一 `caseId` |

文件：`apps/agent/src/pages/AgentHome.tsx`

## 自证（活口 `http://127.0.0.1:5175/agent`）

| 检查 | 结果 |
|------|------|
| `关联案件` label / `select[aria-label=关联案件]` | **0** |
| `[data-testid=home-case-bind]` + `case-bind-controls` | **各 1** |
| 「自动匹配」+「创建并绑定」+「绑定已有」 | 可见 |
| `npm run typecheck -w @ip/agent` | ✅ |
| 截图 | `_agent-home-case-entry-dedup.png` |

