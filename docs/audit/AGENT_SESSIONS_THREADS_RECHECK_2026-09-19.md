# Sessions × 项目线程合流复检

> **日期**：2026-09-19（CST）· Owner：业务深度审计（B 席）  
> **对象 SHA**：`9598f6e`（`feat(agent): aggregate project threads into /agent/sessions list`）  
> **规格**：`docs/architecture/product-apps/agent-sessions-project-threads.md`（`b4dc487`）五条  
> **活口**：`/agent/sessions`  
> **Owner 说明 / 证据**：`docs/ui-polish/AGENT_SESSIONS_PROJECT_THREADS.md` · `_sessions-agg-verify.json`  
> **性质**：只评不改。

## 总判一行

视图层聚合立住：两池合并展示、来源标签、`?source=` chip、点击分路径、底层 store **未**并——对齐规格「存储可分 · 列表聚合」。原 AGENT_STEPWISE_BIZ **P2 线程合流**可记 **已收**。

## 五条对照

| # | 规格要求 | 活口证据（`9598f6e`） | 判 |
|---|----------|----------------------|-----|
| 1 | **聚合展示** 通用会话 + 项目专家线程，按 `updatedAt` 降序 | `buildSessionListRows` 合并 `visibleSessions` + `ProjectFolderContext.threads`；表 `data-testid=sessions-aggregated-table`；Owner 自点 general=4 · project=8 | **Pass** |
| 2 | **行标签** project=`项目名 · 专家名`；通用=「通用」或 AgentDef 名 | `sourceLabel` + 列「来源」chip `sessions-source-chip`；自点 project chips 含「… · 专家」 | **Pass** |
| 3 | **`?source=` / chip** `all` \| `general` \| `project` | `parseSourceParam` + `sessions-source-chips`；URL `?source=project` / `general`；与 `?filter=` 共存（自点 `filter=needs_human&source=all`） | **Pass** |
| 4 | **点击深链分路径** 通用→`/agent/sessions/:id`；项目→`/agent/projects/:id/bots/:expertId`（可 `?thread=`） | `generalSessionToRow.href` / `projectThreadToRow.href`；`navigate(row.href)`；自点两侧 URL 正确 | **Pass** |
| 5 | **存储未并**；不删项目夹；无第三套影子库 | 注释钉「does NOT merge stores」；`ProjectFolderContext` 仍独立 `useState` threads；侧栏「更多 → 项目」入口在 | **Pass** |

## 计数影响

| 原债（逐步业务审计） | 复检后 |
|----------------------|--------|
| P2 项目线程 ↔ sessions 未标签合流 | **已收**（`9598f6e`） |
| P2 `pending_create` / Home 副文案 | **仍开**（本复检未点） |
| Won't 全宽黄条 | 不动 |

**复检后（相对上轮 RECHECK）**：P0=0 · P1=0 · P2=2 · Won't=1

## 毛刺（不升债）

- 侧栏会话轨仍主要列通用 `visibleSessions`（聚合主战场在列表页）——规格验收对象是 `/agent/sessions` 页，不要求侧栏全量双池。  
- H1 从「通用历史」演进为「会话历史」——与双源聚合一致，不重开 P1。  
- `?filter=running|done|archived` 时项目行被 `rowMatchesStatusFilter` 排除（无对应状态模型）——诚实可接受，口播勿吹「状态筛含全部项目线程」。

## 方法

静态读 `sessionListRows.ts` · `AgentSessionsList.tsx` · `ProjectFolderContext.tsx`（threads 暴露）· 侧栏项目入口；交叉 Owner `_sessions-agg-verify.json`（`passAll: true`）。未重跑浏览器。
