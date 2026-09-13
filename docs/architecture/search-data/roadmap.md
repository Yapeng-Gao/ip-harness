# 检索数据面 · 路线图

| 阶段 | 交付 | 明确没有 |
|------|------|----------|
| **规格（本波）** | `search-data/` 可评审；入口 [SCHEME_WAVE](../../SCHEME_WAVE.md) | 真集群 |
| **MVP** | 单源专利可检索；对象存储 + PG 元数据 + 倒排；Search API 替换 `apps/search` mock | 全球覆盖、权威同族、完整向量 |
| **增强** | 向量混合（RRF）；增量 CDC；`indexVersion` 蓝绿回滚；质量 quarantine | 全自动 PII |
| **生产** | 多源 SLA、租户 ACL、湖仓治理、检索金标在线评测 | 「一次建库永不维护」 |

## 依赖

- `@ip/contracts` 冻 Search API URL（dev-spec）  
- 密钥仓 / ops  
- 训练导出契约对齐 [model-training](../model-training/README.md)，**不阻塞**检索 MVP  

## 迁移动作（从样机）

1. 保持 `SearchQuery`/`SearchHit` 形状不变  
2. `apps/search` 改打真实 Search API；`backend` 字段从 `mock` → 引擎名  
3. Agent 工具适配器同切，禁止双 schema  
