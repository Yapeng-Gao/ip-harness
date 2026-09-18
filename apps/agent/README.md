# apps/agent · 知产 Agent

Phase 0 monorepo 独立面：`/agent/*` Cursor 式 Harness（会话 / Catalog / HITL ConfirmBar）。

## 启动

```bash
# 仓库根目录
npm run dev:agent
```

→ http://localhost:5175（端口见 `@ip/contracts` · `APP_PORTS.agent`）

其它常用：

- `npm run typecheck -w @ip/agent`
- `npm run build -w @ip/agent`

## 路由（本 app）

| Path | 页面 |
|------|------|
| `/agent` | Home · 新建任务 |
| `/agent/sessions` | 全部会话列表 |
| `/agent/sessions/:id` | 会话工作区（Timeline + ConfirmBar + Composer） |
| `/agent/agents` | Agent Catalog |
| `/agent/harness` | 运行时说明 |

兼容重定向：`/` → `/agent`；`/ip-agent/*`、`/agents/*` → `/agent`。

## Inbox 深链协议（Wave2）

Helpers 在 `src/lib/deepLinks.ts`，基于 `@ip/contracts` 的 `APP_DEV_URLS`。

### Agent 会话（本面 path，给 react-router）

```ts
agentSessionPath(sessionId, { focus: 'hitl', gate?: HitlGateId })
// → /agent/sessions/:id?focus=hitl&gate=<HitlGateId>
```

会话页保留落地逻辑：`?focus=hitl` / `gate=` → 滚到并高亮 ConfirmBar。

### 回运营 Inbox（绝对 mid URL，必须用 `<a href>`）

```ts
midInboxHref({ sessionId }) // 或 { itemId }
// → http://localhost:5173/?inbox=ag-<sessionId>#ops-inbox
```

端口：`APP_PORTS.mid = 5173` · `APP_DEV_URLS.mid`。

多 app 下相对 `/?inbox=…` 会停在 Agent(5175)；ConfirmBar / Sidebar / SessionsList 的「回 Inbox」已改为绝对 mid URL。

## 包内结构

- `src/pages/*` · Home / Sessions / Workspace / Catalog / Harness（已从根 `src/pages/agent` 迁入）
- `src/components/*` · Shell / Sidebar / Catalog 卡 / session/*（含 HITL ConfirmBar）
- `src/lib/deepLinks.ts` · re-export `@shared/lib/deepLinks` + 本面专用（`agentSessionPath` / `midInboxHref` 等）
- 共享 context / data / domain / utils 仍引用 `@shared/...`（根 `src/`，本包只读）

## mid → agent 深链（已对齐）

mid(5173) 对 `/agent/*` 使用 `RedirectExternal`（`base=APP_DEV_URLS.agent`，`prefix=/agent`），**保留** pathname + search + hash，例如：

`/agent/sessions/:id?focus=hitl&gate=…` → `http://localhost:5175/agent/sessions/:id?focus=hitl&gate=…`

Agent 侧接收完整 path+query，并滚到/高亮 ConfirmBar；回 Inbox 用 `midInboxHref` 绝对 URL。

跨口 mid/workbench/iam helper 已 re-export `@shared/lib/deepLinks`（见 `src/lib/deepLinks.ts`）。
