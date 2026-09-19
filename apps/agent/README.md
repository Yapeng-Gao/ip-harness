# apps/agent · 知产 Agent

Phase 0 monorepo 独立面：`/agent/*` Cursor 式 Harness（会话 / Catalog / HITL ConfirmBar）+ **项目文件夹**（总控编排 + 专家私聊，形式像 Grok Bot，专家自带业务逻辑）。

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
| `/agent` | **默认**通用单聊（Catalog 选 AgentDef / Composer） |
| `/agent/sessions` | 通用历史会话（兼容；不抢主心智） |
| `/agent/sessions/:id` | 会话工作区（Timeline + ConfirmBar + Composer） |
| `/agent/agents` | Agent Catalog |
| `/agent/harness` | 运行时说明 |
| `/agent/projects` | 项目模式列表（general | domain）+ 新建 |
| `/agent/projects/:projectId` | 项目总控席 + 侧栏 bot + 时间线 |
| `/agent/projects/:projectId/bots/:botId` | 一对一 bot 聊（该 bot 剧本） |
| `/agent/projects/:projectId/experts/:expertId` | 兼容深链 → 重定向到 `/bots/:id` |

兼容重定向：`/` → `/agent`；`/ip-agent/*`、`/agents/*` → `/agent`。

## 口播：入口收敛（样机 · 无真 LLM）

规格：[docs/architecture/product-apps/agent-entry-modes.md](../../docs/architecture/product-apps/agent-entry-modes.md)

1. **通用单聊（默认）**：打开 `/agent` → Composer / pills / Catalog 开单会话；**不**强制建项目。sessions 只作历史，不抢主入口。
2. **新建通用项目**：`/agent/projects` → 选「通用」→ 创建 → 侧栏总控 + 研究/写作/审查；**无**专利步骤条 / FTO / 权利要求 HITL。
3. **新建专利项目**：同页选「领域包 · patent」→ 总控 + 检索/撰稿/FTO；保留步骤条与 ExpertHitlBridge。
4. 列表/侧栏徽章区分「通用」「专利」；bot 深链用 `/bots/:botId`（`/experts/:id` 兼容重定向）。
5. 专利逻辑不泄漏进通用：`expertsGeneral.ts` 与 `expertsPatent.ts` 分文件；general 的 `catalogAgentId=null`。

### domain/patent 三专家差异（摘要）

| 专家 | 工具条 | 快捷 | 剧本步骤 | Confirm / 命令候选 |
|------|--------|------|----------|-------------------|
| 检索 `expert-search` | commercial_patent_search / cluster_hits / … | 跑检索式·看命中·入工作篮 | query→hits→basket→策略 | `approve_strategy`；通常只读 / 可选 submitResearch |
| 撰稿 `expert-draft` | draft_claims / expand_dependent / … | 生成章节·修订·提请确认 | 章节→修订→策略→授权 | `approve_strategy` + `authorize_file`；saveDraft / submitHandoff |
| FTO `expert-fto` | extract_fto_features / 矩阵 / 风险卡… | 抽特征·风险矩阵·风险卡片 | 特征→命中→矩阵→风险→报告 | `approve_strategy` 仅确认口径；**默认不写案** |

总控席：仅 `dispatch_task` / 汇总；**禁止**一键写库。

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

- `src/pages/*` · Home / Sessions / Workspace / Catalog / Harness / **projects/**
- `src/components/*` · Shell / Sidebar / session/* / **projects/**（HITL 桥接）
- `src/projects/*` · ProjectFolderContext · `expertsGeneral.ts` / `expertsPatent.ts`（按 kind/pack 分剧本）
- `src/lib/deepLinks.ts` · re-export `@shared/lib/deepLinks` + 本面专用
- 共享 context / data / domain / utils 仍引用 `@shared/...`（根 `src/`，本包只读）

## mid → agent 深链（已对齐）

mid(5173) 对 `/agent/*` 使用 `RedirectExternal`（`base=APP_DEV_URLS.agent`，`prefix=/agent`），**保留** pathname + search + hash。

跨口 mid/workbench/iam helper 已 re-export `@shared/lib/deepLinks`（见 `src/lib/deepLinks.ts`）。
