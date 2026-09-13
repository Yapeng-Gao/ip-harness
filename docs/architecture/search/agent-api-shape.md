# Agent API 形状（与人机同引擎）

> **样机诚实**：可为壳内 TypeScript 函数或 `apps/search` 同仓 mock HTTP；**无**真检索引擎。  
> **落地目标**：Agent 工具适配器只翻译，不另造结果 schema。

## 1. 核心类型（示意，可冻到 `@ip/contracts` 的未来 additive）

```ts
type SearchMode = 'semantic' | 'keyword' | 'advanced'

type SearchFilters = {
  dateFrom?: string
  dateTo?: string
  ipcPrefix?: string[]
  applicants?: string[]
  docTypes?: string[]
  legalStatus?: string[]
  collapseFamily?: boolean
}

type SearchQuery = {
  mode: SearchMode
  text?: string           // semantic | keyword
  advanced?: Record<string, string>  // field -> value
  filters?: SearchFilters
  limit?: number
}

type SearchHit = {
  id: string
  publicationNumber: string
  title: string
  applicant?: string
  date?: string
  ipc?: string[]
  score: number
  familyId?: string
  snippet?: string
}

type FamilyGroup = {
  familyId: string
  members: SearchHit[]
}

type SearchResponse = {
  query: SearchQuery
  hits: SearchHit[]
  families?: FamilyGroup[]
  tookMs: number          // 假延迟也可
  backend: 'mock'         // 诚实字段，禁藏成 production
}
```

## 2. 操作面（样机）

| 操作 | 人机 | Agent |
|------|------|-------|
| `search(query)` | 点「检索」 | 工具 `commercial_patent_search` → 同函数 |
| `getFamily(familyId)` | 同族展开 | `cluster_hits` / `get_family` |
| `explainQuery(query)` | 可选「查询解释」条 | 调试用 |

**禁止**：Agent 路径返回与人机不同字段名的「另一套 hit」。

## 3. 与 DomainCommand

- 默认只读。  
- 「导入案 / 提交调研」须另走 `submitResearch` 等命令 + HITL；search 平面**不** dispatch。  
- 响应里**不**带 `PatentCase` 聚合。

## 4. 错误与诚实

| 码/字段 | 含义 |
|---------|------|
| `backend: 'mock'` | 永远标明样机 |
| `unsupported_mode` | 未实现模式 |
| 空 hits | 合法；勿伪造「全库已扫」 |
