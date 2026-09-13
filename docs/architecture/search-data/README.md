# 检索数据面（Search Data Plane）

> **文档波**：落地规格，**非**样机码。  
> **口径**：[SCHEME_WAVE](../../SCHEME_WAVE.md) · ≠ [ai-data](../ai-data/README.md)（训练语料）· 消费方 [search](../search/README.md) 人+Agent 同形状。  
> **诚实**：下文是**落地目标**；今日仓内 `apps/search:5182` 仍为内存 mock（见 search REVIEW）。

## 回答什么

1. 数据**怎么处理**（采集→解析→标准化→ enrichment → 可索引文档）  
2. **怎么存储**（对象 / 湖 / 元数据行存 / 倒排 / 向量）  
3. **怎么检索**（关键词 · 语义 · 表达式 · 混合排序 · 同族）  
4. **增量与索引版本**、质量与合规、与下游壳如何消费  

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 边界与原则 |
| [processing.md](./processing.md) | 处理流水线 |
| [storage.md](./storage.md) | 存储分层 |
| [retrieval.md](./retrieval.md) | 检索与排序 |
| [ops-quality.md](./ops-quality.md) | 增量、版本、质量、合规 |
| [ip-sources.md](./ip-sources.md) | 专利/论文/公开资料源与字段 |
| [topology.md](./topology.md) | 与 search 壳 / ai-data / 下游业务壳 |
| [roadmap.md](./roadmap.md) | MVP → 生产 |

## 与现有包

- UI/契约：`architecture/search/`（`SearchQuery` / `SearchHit`）  
- 训练：`architecture/ai-data/` + [model-training](../model-training/README.md)（**禁止**检索页一键进训练湖）  
- 消费：landscape / FTO / mining 只读 Hit  
