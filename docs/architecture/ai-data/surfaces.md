# 产品面：`apps/ai-data` :5181

> **样机诚实**：壳可由 AI Data助手实现；本篇为路由与 IA 草案。端口 **5181** 写在 app Vite 配置；**不**改现有 `APP_PORTS`（与 ai-infra:5179 / doc-harness:5178 同策略）。  
> **落地目标**：数据工程师 / 算法协作控制台，与训推壳、运维壳并行。

## 1. 推荐默认：独立壳

| 项 | 值 |
|----|-----|
| 包路径 | `apps/ai-data`（实现 Owner：AI Data助手） |
| 端口 | **5181**（app 内固定） |
| 与邻居 | **并行** ops:5176 / ai-infra:5179；不掏空其路由 |

### 路由草案（样机）

| 路径 | 页面 | 示意 |
|------|------|------|
| `/` | Overview | Pipeline 健康 / 最近发布 mock |
| `/sources` | 数据源 | 接入卡片空态 |
| `/pipelines` | 流水线 | 采集→清洗→发布假进度 |
| `/datasets` | 数据集 | 列表 + version 标签 |
| `/recipes` | 配比 / 采样 | 预训练·SFT·偏好·评测配方 |
| `/quality` | 质量与安全 | 打分 / 敏感 / 污染示意（标「非真 PII」） |
| `/lineage` | 血缘 | 简单 DAG mock |
| `/exports` | 脱敏导出 | 从办案侧申请的导出单（无案正文） |

横幅：「样机 · 非真 Spark / 湖仓 / PII」。

## 2. 与 APP_PORTS

本期：**不**修改 `packages/contracts` `APP_PORTS`。  
可选后期：`aiData: 5181` additive（总控开闸）。

## 3. product-apps 索引

五壳规格包可不扩全文；在 [product-apps/README](../product-apps/README.md) **加一行**并行壳说明即可（见回链提交）。
