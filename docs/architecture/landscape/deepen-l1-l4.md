# 产业图谱加深补丁（L1–L4 · 真原型加深）

> **触发**：用户批准「真产业图谱」**原型加深**（仍非全球爬取生产库）。  
> **域**：种子仍锁 **汽车（Automotive）**。  
> **禁**：case-core / DomainCommand、真 GPU、改他域 `apps/*`、改 `APP_PORTS`。  
> **横幅（冻结文案）**：`样机 · 汽车种子域 · 加深图谱 · 无全球实时产业库`

相对 [deep-demo](./deep-demo.md)（W5 最小闭环）本补丁把 **L1–L4** 从「可点外形」加深到「可导航的小图谱」；**L5 分析**只允许规则增强，不接真模型；**L6** 仍为 `:5186` 壳。

## 1. 加深范围（做 / 不做）

| 层 | 加深做什么 | 明确不做 |
|----|------------|----------|
| **L1 Taxonomy** | 树 ≥4 层或节点 ≥30；节点含 `code`/`aliases`/`version`；可按版本切换只读标签 | 全行业多域切换；用户在线编辑永久存库 |
| **L2 实体** | 企业 ≥25；业务线 ≥1 条/企；地位枚举稳定；集团/持股 **示意边** | 工商真源同步；股权穿透生产级 |
| **L3 多源** | ingest 假任务可「跑完」并 **追加** 预置 Hit/边到图（内存或本地 JSON） | 真爬虫、真论文 API、持续调度 |
| **L4 图谱** | 边类型齐全可查：`part-org` / `org-competitor` / `part-hit` / `org-standard?`；节点详情出邻居表；简单「一度邻居」浏览 | Neo4j/真图 DB；全图力导向大表演除非已有轻量 |

L5：允许在现有洞察卡上 **按节点过滤/计数**；禁止假装实时舆情。

## 2. 种子与诚实

- 域选择：非汽车仍 disabled +「另立项」。  
- 公开号与 search 策略 A 对齐（至少含 `CN115123456A` 等，见 [basket-strategy-a-checklist](../search/basket-strategy-a-checklist.md)）；可补 `CN118234567A`。  
- UI 处处可见加深横幅；Agent/`backend` 若仍本地则为 `'mock'` 或 `'seed-graph'`（二选一写死，禁标 production）。

## 3. 是否另开 `:port` mock API

| 方案 | 端口 | 何时用 |
|------|------|--------|
| **A. 壳内加深（默认推荐）** | 仅 **5186** | 图数据 = 模块 seed + 可选 `localStorage`/`import JSON`；实现快、边界清 |
| **B. 另进程 mock API** | 建议 **5191**（`apps/landscape-api`，不改 APP_PORTS） | 需要与壳解耦、或多客户端/Agent 打 HTTP 同形状；旗标 `VITE_LANDSCAPE_API_URL`，失败回退壳内 seed（类比 search→5190） |

**本补丁冻结默认 = A**。若实现中途要升 B：须另开小 PR + 架构轻扫；URL 自管，**禁止**登记进 `APP_PORTS`。

不做：把图谱塞进 `search-api:5190` 或 `ai-data`。

## 4. 数据形状（加深最小集）

```ts
type GraphVersion = { id: string; label: string; domain: 'automotive' }

type TaxNode = { id: string; parentId: string | null; name: string; depth: number; code?: string }

type Org = {
  id: string
  name: string
  lines: string[]
  stance: 'leader' | 'challenger' | 'niche' | 'supplier'
  nodeIds: string[]
}

type Edge =
  | { type: 'part-org'; partId: string; orgId: string; role?: string }
  | { type: 'org-competitor'; a: string; b: string }
  | { type: 'part-hit'; partId: string; hitId: string }
  | { type: 'node-insight'; nodeId: string; insightId: string }

type LandscapeGraph = {
  version: GraphVersion
  nodes: TaxNode[]
  orgs: Org[]
  edges: Edge[]
  hits: SearchHit[]      // 对齐 search 子集
  insights: InsightCard[]
  backend: 'mock' | 'seed-graph'
}
```

壳查询：按 `nodeId` / `orgId` / `edge.type` 过滤；禁止每次全量 JSON 无分页地假装「亿级图」。

## 5. 实现边界（Owner：产业全景助手）

| 做 | 不做 |
|----|------|
| 只改 `apps/landscape/**`（及本目录文档） | 改 search/fto/mining/ai-*/五壳 |
| 加深 seed + 邻居浏览 + ingest 假推进 | case-core、真 GPU、真爬取 |
| 横幅与 `backend` 诚实 | 文案「全球产业库已上线」 |

## 6. 验收（加深）

- [ ] L1 深度或规模达 §1  
- [ ] L2 ≥25 企 + 业务线/地位可见  
- [ ] L4 至少 3 类边可在 UI 列出邻居  
- [ ] L3 假 ingest 能改变图上可见计数（内存即可）  
- [ ] 横幅含「加深图谱」且「无全球实时」  
- [ ] 默认无新端口；若开 5191 须旗标+回退  
- [ ] 无他域 apps 变更  

## 7. 评审后动作

架构评审 Pass → 产业全景助手按本补丁加深样机 → 总控验收。
