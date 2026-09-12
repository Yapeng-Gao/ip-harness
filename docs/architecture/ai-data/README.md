# AI Data（大模型数据 Pipeline）

> **样机诚实**：今日仓内**无**真 Spark / 湖仓 / PII 扫描器 / 分布式 ETL；办案库与训练语料**未**接通。  
> **落地目标**：独立平面 **`ai-data`**——管大模型数据的采集→清洗→发布→质量与血缘；**≠** ops、**≠** ai-infra、**≠** case-core。

## 定调（冻结）

| 平面 | 管什么 | 不管什么 |
|------|--------|----------|
| **ops-platform** | 日志 / SLA / 配置 / 密钥 / OTel | 数据集 Pipeline、语料质量门禁 |
| **ai-infra** | GPU / 调度 / 训推作业 / 模型发布 | 数据集生产与血缘真相 |
| **case-core** | PatentCase / DomainCommand / handoff | 训练语料仓 |
| **ai-data** | 采集解析标准化清洗去重过滤；预训练·SFT·偏好·评测数据；配比采样；质量/敏感/污染/异常；版本·元数据·血缘·处理记录；分布式处理与训练加载布局；评测→数据改进闭环 | GPU 调度；办案写；SMTP 出站 |

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 为何单独成平面 |
| [domains.md](./domains.md) | Pipeline 各域 |
| [topology.md](./topology.md) | 与 ai-infra / case-core / ops 边界 |
| [surfaces.md](./surfaces.md) | 产品壳草案 `apps/ai-data` **:5181** |
| [roadmap.md](./roadmap.md) | mock → MVP → 生产 |
| [REVIEW.md](./REVIEW.md) | 架构评审结论 |

## 关键契约（冻结心智）

1. **ai-data 发布 `dataset version`** → **ai-infra** 训练/评测**消费**（只读引用 dataset id + revision）。  
2. **禁** `PatentCase` 进入 ai-data 写模型；办案语料仅经**脱敏导出作业**产出数据集。  
3. 样机无真 Spark/湖仓/PII——横幅须诚实。

## 上游

- [landing/backends](../landing/backends.md) · [ai-infra](../ai-infra/README.md) · [enterprise](../enterprise/README.md)
