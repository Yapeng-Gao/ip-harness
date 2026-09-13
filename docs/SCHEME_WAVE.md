# 方案波（文档优先 · 停原型）

> **日期**：2026-09-13 · Owner：平台总控  
> **触发**：用户 token 不足 → **停止新原型**，聚集方案。  
> **产出**：可评审的落地规格；**禁止**为本波改 `apps/*`。

## 本波两包

| ID | 主题 | 目录（架构主笔） | 用户点名 | 总控补充 |
|----|------|------------------|----------|----------|
| S1 | **检索数据面** | `docs/architecture/search/` 扩篇 或 `search-data/` | 怎么处理 / 怎么存储 / 怎么检索 | 增量索引、版本、质量合规、多源对齐、同族、与 landscape/FTO 消费、≠ ai-data |
| S2 | **模型训练** | `docs/architecture/model-training/`（新建） | 预训练·微调·RL；数据/数据集/准备；类型与配比 | 课表、评测集、安全拒答、长文专利、tokenizer、偏好对、持续学习、与 ai-data/ai-infra 契约 |

## 已有可复用

- Search 壳规格：`architecture/search/`（人机 UI · Agent 形状 · deep-demo）  
- 训练数据平面：`architecture/ai-data/`（Pipeline · 配方 · version）  
- 训推基建：`architecture/ai-infra/`（Job · GPU · 发布）  
- **本波要把「数据怎么变成可检索索引」与「各训练阶段怎么配数据」写到可开工粒度**，不是再画一张平面边界图。

## 执行

1. 架构设计主笔 → 推仓报 SHA  
2. 架构评审 REVIEW  
3. 总控验收挂本页  

## 明确不做

- 新 Vite 壳 / 扩 deep-demo 代码  
- 真 ES / 向量 / GPU / Spark 落地实施  
