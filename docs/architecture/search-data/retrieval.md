# 检索与排序（怎么检索）

## 1. 三种人机模式 → 统一执行计划

| UI 模式 | 编译为 | 引擎侧 |
|---------|--------|--------|
| 关键词 | `match` / `multi_match` + filters | 倒排 |
| 语义 | `embedding(query)` + kNN + filters | 向量（可带倒排预过滤） |
| 表达式/高级 | 解析布尔/字段算符 AST → 查询 DSL | 倒排为主，可嵌套语义子句 |

Agent 工具只提交同一 `SearchQuery` 形状，禁止另一套 Hit schema。

## 2. 执行流水线

```text
Query → Parse/Validate → Rewrite（同义词、号展开）→ Plan
     → Retrieve（倒排 topN 和/或 向量 topN）→ Fuse（RRF/加权）
     → Features（引用、同族代表、法律状态、质量）→ Rank
     → Collapse family → Slice page → SearchResponse(backend, tookMs, hits)
```

## 3. 混合检索（推荐默认）

- **候选**：倒排 200 + 向量 200 → RRF 融合 → 精排 top 50 → 分页  
- **纯关键词**：跳过向量（延迟敏感或无 embedding）  
- **纯语义**：倒排仅作 filter（国家/IPC/日期）  

## 4. 排序信号（初值）

| 信号 | 用途 |
|------|------|
| BM25 / 字段权重 | 字面相关 |
| 向量相似度 | 语义相关 |
| 公开日衰减 | 新颖性偏好可配置 |
| 被引/同族规模 | 权威性（可关） |
| qualityScore | 降权垃圾 OCR |
| 业务 boosting | FTO 场景可升权「权利要求命中」 |

## 5. 同族与去重

- 默认 collapse by `familyId`，代表件规则可配（最新公开 / 指定国家优先）  
- UI「展开同族」读 `FamilyGroup.members`  

## 6. 性能与 SLO（目标，非承诺）

| 类 | 目标 |
|----|------|
| 关键词 P95 | < 300ms（热索引、合理过滤） |
| 语义 P95 | < 800ms（含编码；可缓存 query embedding） |
| 超时 | 返回 partial + `backend` 标记 |

## 7. 可观测

- 慢查询、零结果、解析失败、filter 过窄  
- 在线/离线评测集（见 model-training 评测亦可复用「检索金标」）  
