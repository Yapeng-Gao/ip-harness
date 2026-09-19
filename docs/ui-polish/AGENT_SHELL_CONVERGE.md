# AGENT_SHELL_CONVERGE — `/agent` 主路径新旧叠层收敛

**分支** `dev` · **范围** `apps/agent/**` + `docs/ui-polish/agent-shell-converge/` + 本短记 · **对齐** cec9d79 自由度（自由 bot vs 项目专家固定）· **禁** Cloud / 写库闸 / HITL 改写 · **禁** BillingHold 全宽黄条。

## 问题

`/agent` 自由 bot 主路径与次级入口（历史聚合 / Catalog / 旧 Composer / 项目推销）同权同视觉叠层；样机诚实条徽章全宽抢戏；绑案入口需保证每视口 ≤1。

## 改动

| 项 | 处理 |
|----|------|
| 主路径 | 侧栏：自由 bot 列表 + 新建 bot + 一对一 / 转发（`GeneralBotChatPane`） |
| 次级入口 | `GeneralBotSidebar`：「历史聚合 / Catalog / 旧 Composer / 项目列表」收进「更多」；项目仅一处弱链文案 |
| compose 侧栏 | `AgentSessionSidebar`：在 compose/catalog 折叠态，「会话 / Agent」收进「更多」；「回 Grok」为主 |
| 诚实条 | `GeneralGrokShell`：弱字一行（`general-honesty-weak`），非徽章条 |
| 绑案 | 通用壳仅 `general-case-bind-slot` 一处 `CaseBindControls`；会话页仍顶栏/Composer 互斥单挂 |
| BillingHold | `AgentShell` **未**恢复全宽黄条 |
| 文案 | `AgentHome` 回链改为「通用 Grok（自由 bot）」 |

## 活口截图

`docs/ui-polish/agent-shell-converge/`

- `before-agent.png` / `after-agent.png` / `after-agent-more.png`
- `after-compose.png` · `after-projects-list.png` · `after-project-workspace.png`（若有）

## 自点（2026-09-19 Asia/Shanghai · `http://127.0.0.1:5175`）

| 检查 | 结果 |
|------|------|
| `/agent` 侧栏可见链接 | 新建 + bots + 弱「项目模式」；无同权「历史/Catalog/Composer」 |
| 「更多」展开 | 含历史聚合 / Catalog / 旧 Composer |
| `[data-testid=case-bind-controls]` | **1** |
| `[data-testid=general-honesty-weak]` | **1** |
| `[data-billing-hold-banner]` | **0** |
| `/agent/compose` 侧栏 | 「回 Grok」+「更多」（会话/Agent 不抢戏） |
| 项目角标「项目 · 专家固定」 | 项目壳保留 |
| `npm run typecheck -w @ip/agent` | ✅ |

## 未改

写库闸 / HITL / DomainCommand / Cloud / `ExpertHitlBridge`。
