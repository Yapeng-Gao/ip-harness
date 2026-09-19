# Sessions 列表 × 项目线程合流

> **冻结**：存储可分；`/agent/sessions` **聚合展示**通用会话 + 项目专家线程。  
> **样机诚实**：mock 列表即可；不删项目夹；不造第二套案库。  
> **对齐**：[agent-entry-modes §4](./agent-entry-modes.md) · [agent-project-folder](./agent-project-folder.md) · [agent-case-binding](./agent-case-binding.md)。

## 1. 为何做

用户问「项目线程与 sessions 为何不合流」。心智上「历史」应一处看全；**不必**把底层 store 硬合成一份。

## 2. 存储（仍可分）

| 池 | 典型上下文 | 键 |
|----|------------|-----|
| 通用会话 | `AgentContext` / sessions | `sessionId`；无 `projectId` |
| 项目专家线程 | `ProjectFolderContext` threads | `projectId` + `expertId` + `threadId` |

禁止为合流新建第三套「影子会话库」或第二套案库。

## 3. 列表聚合（`/agent/sessions`）

统一行模型（示意）：

```ts
type SessionListRow = {
  id: string                 // sessionId 或 threadId
  source: 'general' | 'project'
  title: string
  updatedAt: string
  projectId?: string
  projectTitle?: string      // 行标签用
  expertId?: string
  expertName?: string        // 行标签用
  caseId?: string            // 可选展示，可空
}
```

- 打开 `/agent/sessions`：合并两池，按 `updatedAt` 降序。  
- **行标签**：`source==='project'` 显示「项目名 · 专家名」chip；通用显示「通用」或 AgentDef 名。  

### 筛选

| Chip / `?source=` | 含义 |
|-------------------|------|
| `all`（默认） | 全部 |
| `general` | 仅通用会话 |
| `project` | 仅项目专家线程 |

URL 例：`/agent/sessions?source=project`。

### 点击跳转

| 行 | 打开 |
|----|------|
| 通用 | `/agent/sessions/:id`（既有） |
| 项目线程 | 既有 `/agent/projects/:projectId/bots/:expertId`（可带 `?thread=`） |

## 4. 不做什么

| 不做 | 说明 |
|------|------|
| 删项目夹导航 | 项目仍从「项目」进；sessions 是历史聚合 |
| 强制合并底层 store | 聚合是视图层 |
| 第二套案库 | case 仍见 [agent-case-binding](./agent-case-binding.md) |
| 真 LLM / case-core | 样机 mock |

## 5. 验收

- [ ] sessions 页同时见通用行 + 至少一行项目线程（有种子时）  
- [ ] 行带来源标签（项目名/专家）  
- [ ] `?source=` 或等价 chip 可筛  
- [ ] 点击跳转路径正确  
- [ ] 项目夹入口仍在  

## 6. Owner

- 规格：架构设计（本稿）  
- 实现：Agent应用助手 · 只改 `apps/agent`

## 评审

- [product-apps/REVIEW.md](./REVIEW.md) · B席轻扫段（对象 `b4dc487`）
