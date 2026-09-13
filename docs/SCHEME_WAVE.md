# 方案波（文档优先 · 停原型）

> **日期**：2026-09-13 · Owner：平台总控  
> **触发**：用户停原型 → 聚集落地级方案。  
> **产出**：可评审规格；**禁止**为本波改 `apps/*`。  
> **草案 SHA**：`4daf889` · 本页随润色版更新。

## 本波两包（路径冻结）

| ID | 主题 | 目录 | 阅读序 |
|----|------|------|--------|
| **S1** | 检索数据面 | [`docs/architecture/search-data/`](./architecture/search-data/README.md) | overview → processing → storage → retrieval → ops-quality → ip-sources → topology → roadmap |
| **S2** | 模型训练 | [`docs/architecture/model-training/`](./architecture/model-training/README.md) | overview → pretrain → sft → preference-rl → data-types-and-mix → data-prep → eval-safety → curriculum-and-ops → topology → roadmap |

## 用户点名 vs 总控补强

| 包 | 用户点名 | 补强已写入 |
|----|----------|------------|
| S1 | 处理 / 存储 / 检索 | 增量索引与 `indexVersion`、质量合规、多源字段、同族、与 landscape/FTO 消费、**≠ ai-data**、唯一 Search API |
| S2 | 预训练·微调·RL；数据/数据集/准备；类型与配比 | 课表、评测集冻结、安全拒答、长文专利切片、tokenizer、偏好对、RAG 对齐、持续学习、**ai-data↔ai-infra** 契约 |

## 已有可复用（勿重复掏空）

- 样机壳/契约：`architecture/search/` · `ai-data/` · `ai-infra/`  
- 本波写到**可开工粒度**（字段、阶段门禁、MVP 切片），不是只画平面边界。

## 执行

1. 架构设计主笔润色 → 推仓报 SHA（相对 `4daf889`）  
2. 架构评审 REVIEW（可对照草案 + 润色 diff）  
3. 总控验收挂本页  

## 明确不做

- 新 Vite 壳 / 扩 deep-demo 代码  
- 真 ES / 向量 / GPU / Spark **实施**（规格可写选型倾向）

## 评审

- 汇总：[architecture/SCHEME_WAVE_REVIEW.md](./architecture/SCHEME_WAVE_REVIEW.md)（含润色轻量复评）
- S1：[search-data/REVIEW.md](./architecture/search-data/REVIEW.md)
- S2：[model-training/REVIEW.md](./architecture/model-training/REVIEW.md)
- 润色对象 SHA：`23f4bcf`（相对草案 `4daf889`）
