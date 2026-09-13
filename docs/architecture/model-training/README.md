# 模型训练方案（预训练 · 微调 · 强化学习）

> **文档波**：落地规格，**非**样机码。  
> **口径**：[SCHEME_WAVE](../../SCHEME_WAVE.md)  
> **数据面**：[ai-data](../ai-data/README.md) 生产 `dataset version`  
> **算力面**：[ai-infra](../ai-infra/README.md) 跑 Job / 发布模型  
> **诚实**：无真 GPU/真训练集群；本包写清阶段、数据与配比，供日后开工。

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 阶段全景与原则 |
| [pretrain.md](./pretrain.md) | 预训练 |
| [sft.md](./sft.md) | 监督微调 |
| [preference-rl.md](./preference-rl.md) | 偏好学习 / RL |
| [data-types-and-mix.md](./data-types-and-mix.md) | 数据类型与配比 |
| [data-prep.md](./data-prep.md) | 数据怎么准备 |
| [eval-safety.md](./eval-safety.md) | 评测与安全 |
| [curriculum-and-ops.md](./curriculum-and-ops.md) | 课表、持续学习、与平台衔接 |

## 一句话

**ai-data 出有版本的数据集 → ai-infra 按阶段课表训练/对齐 → 评测门禁 → 模型发布；办案库永不直训。**
