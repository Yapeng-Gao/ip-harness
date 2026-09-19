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
| `/agent` | Home · 新建任务 |
| `/agent/sessions` | 全部会话列表 |
| `/agent/sessions/:id` | 会话工作区（Timeline + ConfirmBar + Composer） |
| `/agent/agents` | Agent Catalog |
| `/agent/harness` | 运行时说明 |
| `/agent/projects` | **项目文件夹**列表 + 新建 |
| `/agent/projects/:projectId` | 项目总控席（编排/分派）+ 侧栏专家 + 时间线 |
| `/agent/projects/:projectId/experts/:expertId` | 专家一对一私聊（独立步骤条/工具卡/HITL） |

兼容重定向：`/` → `/agent`；`/ip-agent/*`、`/agents/*` → `/agent`。

## 口播：项目文件夹（样机 · 无真 LLM）

规格：[docs/architecture/product-apps/agent-project-folder.md](../../docs/architecture/product-apps/agent-project-folder.md)

1. 打开 `/agent/projects`（或 Home「项目文件夹」入口）→ 可见种子演示项目，或点「创建并打开总控」。
2. 进入项目总控席 → 点「分派给检索 / 撰稿 / FTO」→ 项目时间线出现分派事件；对应专家私聊出现任务卡。
3. 左侧点进**检索 / 撰稿 / FTO**专家 → 步骤条、工具卡、快捷动作、mock 剧本明显不同。
4. 专家侧点「回报总控/项目」→ 时间线记回报；总控线程出现回执。
5. 推进到 HITL 步骤 → ConfirmBar 绑定底层 `AgentSession`，确认走 `sessionHitlAction` → DomainCommand（试运行不写；FTO 默认不写案）。

### 三专家差异（摘要）

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
- `src/projects/*` · ProjectFolderContext · 专家四件套定义（按 expertId 分剧本）
- `src/lib/deepLinks.ts` · re-export `@shared/lib/deepLinks` + 本面专用
- 共享 context / data / domain / utils 仍引用 `@shared/...`（根 `src/`，本包只读）

## mid → agent 深链（已对齐）

mid(5173) 对 `/agent/*` 使用 `RedirectExternal`（`base=APP_DEV_URLS.agent`，`prefix=/agent`），**保留** pathname + search + hash。

跨口 mid/workbench/iam helper 已 re-export `@shared/lib/deepLinks`（见 `src/lib/deepLinks.ts`）。
