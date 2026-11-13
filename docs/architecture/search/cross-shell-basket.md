# 跨口工作篮（Search Basket）

> **样机诚实**：今日工作篮在 `apps/search:5182` **内存 store**（可同端口多 tab 另议）；**不同 Vite 端口 = 不同 origin，`localStorage` 不共享**。  
> **落地目标**：工作篮为服务端（或 BFF）资源，经 Search API / 专用 basket API 跨壳读写。  
> **对齐**：[data-flow](../data-flow.md)（禁止「各 app 同一套 localStorage」）· [fto/deep-demo](../fto/deep-demo.md) · ai-data 键脚注同理。

## 1. 现状（样机）

| 项 | 真相 |
|----|------|
| 所在 | `apps/search` 内 `basketIds: string[]` + Hit 详情仍在本壳 hits 表 |
| 持久 | 默认会话内存；**非**跨口共享 |
| 下游 | 「送 FTO / 挖掘 / 全景 / 文档」= **事件日志 + 深链占位 URL**（壳未建或未接篮时仍如此） |
| 分端口 LS | 即便将来写入 `localStorage`，`localhost:5182` 与 `:5183`/`:5184`/… **彼此不可读** |

禁止产品文案：已跨 5182↔下游自动同步工作篮。

## 2. 目标契约（落地）

```ts
type BasketItem = {
  hitId: string
  publicationNumber?: string
  title?: string
  snapshot?: SearchHit  // 可选瘦快照，防索引变更
  addedAt: string
}

type Basket = {
  id: string
  ownerId: string
  items: BasketItem[]
  revisedAt: string
}
```

| API（名可再冻） | 语义 |
|-----------------|------|
| `GET /v1/baskets/current` | 当前用户工作篮 |
| `POST /v1/baskets/current/items` | 加 Hit（幂等） |
| `DELETE /v1/baskets/current/items/:hitId` | 移除 |
| `POST /v1/baskets/current/dispatch` | 送下游：写意图事件 + 返回深链；**不**写 case-core |

下游壳（FTO/mining/landscape/doc-harness）**只读** basket API 或接受 `basketId` 查询参数，禁止再发明第二套 Hit 列表 schema。

## 3. 样机最小示意策略（不大改 apps）

按优先级，**择一即可演示故事**（默认推荐 A）：

| 策略 | 做法 | 诚实点 |
|------|------|--------|
| **A. 共享种子 ID（推荐）** | search / FTO / mining 种子 Hit **同一批** `id`/`publicationNumber`；下游「从工作篮导入」实际加载**本壳种子篮** | toast：「样机·跨口未共享 LS，已用共享种子」 |
| **B. URL 携带瘦快照** | 深链 `?basket=base64url(json)` 限短列表（≤10） | 有长度与泄漏风险；仅演示 |
| **C. 同 origin 反代（可选）** | 开发反代多壳同 host 不同 path，再共享 LS 键 | 非默认；文档标明条件 |
| **D. 真 basket API** | 属落地 MVP，**本 N2 不做码** | — |

**明确不做（本刀）**：改五壳 bridge 扛检索篮；假装 cookie 传大块 Hit；与 `ip.harness.aiData.publishedDatasets` 混键。

## 4. 与 ai-data 键的类比

| | 工作篮 | ai-data publishedDatasets |
|--|--------|---------------------------|
| 用途 | 检索命中集合 → 分析壳 | 已发布数据集 → 训推壳 |
| 样机跨口 | 种子 ID / 深链占位 | 种子 ID；LS 仅同端口 |
| 落地 | basket API | dataset version API |

## 5. 验收（文档级）

- [ ] 写清分端口 LS 不共享  
- [ ] 目标 API 形状可开工  
- [ ] 样机默认策略 = 共享种子 ID + 诚实 toast  
