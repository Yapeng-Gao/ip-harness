# FTO 概览

> **样机诚实**：演示「分析业务壳」如何消费检索工作篮，不是可交付法律意见。  
> **波次**：W2 · 第一条分析业务壳（验 Search Hit）。

## 1. 为何独立壳

- FTO 路径长（特征→命中→矩阵→风险→报告），不宜塞进 search 结果页或 mid 办理流。  
- Owner 边界清晰（FTO助手）；端口 **5183** 与 search **5182** 并行，同 doc-harness / ai-* 策略。  
- 主计划：**不依赖 ai-data 训练集**；依赖 **Search Hit 工作篮**。

## 2. 边界

| 邻居 | 关系 | 禁止 |
|------|------|------|
| **search :5182** | 消费 `SearchHit`；可自带种子篮；深链/事件「送 FTO」为示意 | 在 FTO 内重造检索引擎 |
| **case-core** | **无**写路径；报告 Confirm 只产内存报告草稿 | `dispatch` / 改 handoff / 写 PatentCase |
| **ai-data** | 无关 | 把 FTO 语料当 dataset 发布 |
| **agent** | 可选读同形状 API（见 agent-api-shape） | 用 Agent 绕过 Confirm 假装已出正式意见 |

## 3. 数据心智（样机）

| 对象 | 含义 |
|------|------|
| `ProductFeature[]` | 产品特征拆解行（用户可增删改） |
| `SearchHit[]` / 工作篮 | 对比文献集合（种子或示意导入） |
| `ClaimMatrix` | 特征 × 文献权利要求（假 claim 文本）单元格 |
| `RiskLevel` | 行/全局：`low` \| `medium` \| `high` \| `unclear`（规则或人工点选） |
| `FtoReportDraft` | Confirm 后的报告草稿（markdown/结构化均可） |

## 4. 诚实横幅（建议文案）

`样机 · 无真 FTO 引擎 · 非法律意见`
