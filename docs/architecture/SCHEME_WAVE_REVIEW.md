# 方案波两包 · 汇总评审

| 项 | 值 |
|----|-----|
| 入口 | [`docs/SCHEME_WAVE.md`](../SCHEME_WAVE.md) |
| 对象 SHA | **`4daf889`** |
| 日期 | 2026-09-13 |
| **总结论** | **通过** |

| 包 | REVIEW | 结论 |
|----|--------|------|
| S1 检索数据面 | [search-data/REVIEW.md](./search-data/REVIEW.md) | 通过 |
| S2 模型训练 | [model-training/REVIEW.md](./model-training/REVIEW.md) | 通过 |

## 五条总表

| # | 尺子 | 结果 |
|---|------|------|
| ① | 检索：处理/存储/检索可开工粒度 | 过 |
| ② | ≠ ai-data | 过 |
| ③ | 训练：预训/SFT/偏好RL + 配比 + 准备 | 过 |
| ④ | 与 ai-data / ai-infra 衔接 | 过 |
| ⑤ | 诚实非样机码（停原型 · 禁改 apps） | 过 |

**可总控总验。** 本波仍禁止新原型码。

## 轻量复评（润色 SHA `23f4bcf`）

相对已 Pass 草案 **`4daf889`** / 初评 **`5f5ab84`**：只扫 topology·roadmap·门禁·字段映射增量。

| 结论 | **维持通过** |
|------|----------------|
| 禁 apps/* | 遵守 |
| 新裂缝 | **无阻塞**；黄项见下 |

**黄项（非阻塞）**

1. `search-data/ops-quality.md`：必填失败策略 §2 `quarantine` vs §6 `reject` — 须择一冻。  
2. model-training 若干篇章节号重复（润色叠加）— 整编即可。

分篇补记：[search-data/REVIEW](./search-data/REVIEW.md) · [model-training/REVIEW](./model-training/REVIEW.md)。

## N3 落地 MVP 任务单（`acefd5d`）

| 包 | 结论 |
|----|------|
| [search-data/MVP.md](./search-data/MVP.md) | **通过**（见 search-data/REVIEW） |
| [model-training/MVP.md](./model-training/MVP.md) | **通过**（见 model-training/REVIEW） |

四条尺子（可开工 / 明确不做 / 验收 / 与样机壳诚实）均过。search-data 必填→quarantine 关闭既有黄项。本刀仍禁改 `apps/*`。

