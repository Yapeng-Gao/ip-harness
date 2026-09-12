# AI Data 能力域

> **样机诚实**：下列为目标域；样机用流水线卡片 / 假进度 / 空态即可。  
> **落地目标**：域可成模块；存储与办案库物理隔离。

## 1. 域一览

| 域 | 职责 | 典型对象 | 不做 |
|----|------|----------|------|
| **采集 / 解析** | 源接入、格式解析、增量拉取 | Source、IngestJob、RawBlob | 办案 DomainCommand |
| **标准化 / 清洗** | schema 对齐、字段规范化、破损修复 | CleanJob、SchemaSpec | 改 PatentCase |
| **去重 / 过滤** | 近重、规则过滤、黑名单 | DedupRun、FilterSet | GPU 调度 |
| **数据集发布** | 不可变 version、清单、校验和 | Dataset、DatasetVersion、Manifest | 自动晋级生产模型（属 ai-infra Release） |
| **用途切片** | 预训练 · SFT · 偏好（RLHF/DPO 等）· 评测集 | Split、Recipe | 在线推理 endpoint |
| **筛选 / 配比 / 采样** | 配比策略、分层采样、难例挖掘 | SamplePlan、MixRatio | 随机静默改生产流量 |
| **质量与安全** | 质量打分、敏感信息、污染检测、异常追踪 | QualityScore、PiiFinding、ContaminationReport | 假装已有真 PII 引擎（样机禁） |
| **元数据 / 血缘 / 处理记录** | 版本、上下游、操作人、参数快照 | LineageEdge、ProcessRecord | 替代 case audit |
| **分布式处理与布局** | 大规模作业、分区、列存/对象布局、训练 loader 契约 | LakeLayout、ShardMap、LoaderSpec | 真 Spark（样机无） |
| **评测→数据闭环** | 评测失败归因 → 新数据需求 / 难例回灌 | EvalFeedback、ImprovementTicket | 直接改 case handoff |

## 2. 与邻居的一句话

| 邻居 | 分工 |
|------|------|
| **ai-infra** | 消费已发布 dataset version；不自建语料真相 |
| **case-core** | 仅经脱敏导出管道产出 Raw/Clean 候选；无案主键业务态进湖 |
| **ops** | 可观测管道可共用采集器；数据质量告警规则属 ai-data 配置面 |
| **notify** | 可选：Pipeline 失败 / 质量门禁 → outbox；ai-data 不发 SMTP |
