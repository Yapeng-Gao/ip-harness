# 产业全景 · Agent API 形状（示意）

> **样机诚实**：`backend: 'mock'`；与人机同一种子图。

```ts
type TaxonomyNode = {
  id: string
  parentId: string | null
  name: string
  depth: number
  domain: 'automotive'
}

type OrgProfile = {
  id: string
  name: string
  lines: string[]
  stance: 'leader' | 'challenger' | 'niche' | 'supplier'
  nodeIds: string[]
}

type InsightKind = 'chokepoint' | 'surround' | 'frontier'

type InsightCard = {
  id: string
  kind: InsightKind
  nodeId: string
  title: string
  body: string
}

type LandscapeQuery = {
  domain: 'automotive'
  nodeId?: string
  orgId?: string
}

type LandscapeResponse = {
  query: LandscapeQuery
  tree?: TaxonomyNode[]
  orgs?: OrgProfile[]
  insights?: InsightCard[]
  hits?: { id: string; publicationNumber: string; title: string }[]
  backend: 'mock'
}
```

| 操作 | 含义 |
|------|------|
| `landscape.getTree(domain)` | 取种子树 |
| `landscape.getNode(nodeId)` | 节点+企业+洞察+hits |
| `landscape.listInsights(kind?)` | 洞察列表 |

禁止：Agent 经此 API 写 PatentCase / 发布 ai-data version。
