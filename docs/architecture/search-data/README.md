# 检索数据面（Search Data Plane）

> **文档波**：落地规格，**非**样机码。  
> **口径**：[SCHEME_WAVE](../../SCHEME_WAVE.md) · ≠ [ai-data](../ai-data/README.md)（训练语料）· 消费方 [search](../search/README.md) 人+Agent 同形状。  
> **诚实**：下文描述**目标架构**；今日仓内仍是 mock。

## 回答什么

1. 数据**怎么处理**（采集→解析→标准化→ enrichment → 可索引文档）  
2. **怎么存储**（湖 / 元数据行存 / 倒排 / 向量 / 对象正文）  
3. **怎么检索**（关键词 · 语义 · 表达式 · 混合排序 · 同族）  

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 边界与原则 |
| [processing.md](./processing.md) | 处理流水线 |
| [storage.md](./storage.md) | 存储分层 |
| [retrieval.md](./retrieval.md) | 检索与排序 |
| [ops-quality.md](./ops-quality.md) | 增量、版本、质量、合规 |
| [ip-sources.md](./ip-sources.md) | 专利/论文/公开资料源与字段 |

## 与现有包关系

- UI/契约形状：`architecture/search/`  
- 训练湖与配方：`architecture/ai-data/`（**禁止**从检索结果页一键进训练湖）  
- 产业全景消费检索 Hit / 实体：`architecture/landscape/`  
