# AGENT_SESSIONS_PROJECT_THREADS — `/agent/sessions` 聚合通用 + 项目线程

**分支** `dev` · **规格** `docs/architecture/product-apps/agent-sessions-project-threads.md`（`b4dc487`）· **范围** `apps/agent/**` · **禁** Cloud / 合并底层 store / 影子库 / 删项目夹。

## 落地

| 项 | 处理 |
|----|------|
| 行模型 | `lib/sessionListRows.ts`：`source: 'general'\|'project'`；chip 通用=Agent 名或「通用」；项目=`项目名 · 专家名` |
| 列表 | `AgentSessionsList` 合并 `visibleSessions` + `ProjectFolderContext.threads`，按 `updatedAt` 降序 |
| 筛选 | chip / `?source=all\|general\|project`；与既有 `?filter=`（needs_human 等）共存 |
| 点击 | 通用 → `/agent/sessions/:id`；项目 → `/agent/projects/:projectId/bots/:expertId`（可带 `?thread=`） |
| Context | `ProjectFolderContext` 只读暴露 `threads`（不改 store 语义） |
| 文案 | H1「会话历史」；副文「通用单聊 + 项目专家线程」；侧栏副文同步；Nav「会话」保留 |

## 验收（活口 `http://127.0.0.1:5175`）

| §5 | 结果 |
|----|------|
| ① 同时见通用行 + 项目线程（有种子） | ✅ general=4 · project=8 |
| ② 行来源标签 | ✅ 项目 chip「… · 专家」 |
| ③ `?source=` / chip | ✅ project 仅 8 行；general 仅 4 行；`filter=needs_human&source=all` 共存 |
| ④ 点击跳转 | ✅ `/agent/sessions/sess-…` · `/agent/projects/…/bots/…` |
| ⑤ 项目夹入口仍在 | ✅ 侧栏「更多 → 项目」→ `/agent/projects`（2 项目链） |

证据：`_sessions-agg-verify.json` · `_sessions-agg-all.png` · `_sessions-agg-project.png` · `_sessions-agg-project-nav.png` · `_sessions-agg-projects-entry.png`

## typecheck

`npm run typecheck -w @ip/agent` → green
