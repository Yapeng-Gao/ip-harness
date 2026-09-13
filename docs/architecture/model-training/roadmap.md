# 模型训练 · 路线图

| 阶段 | 交付 | 没有 |
|------|------|------|
| **规格（本波）** | `model-training/` 可评审 | 真训 |
| **MVP** | 外购基座 + 小规模 SFT + 冻结评测 + 一门禁 Release | 自研从零预训练 |
| **增强** | 小规模 CPT；DPO；工具调用 / RAG 专项 SFT | 保证 SOTA 分数 |
| **生产** | 课表化持续学习、红队常态、多租户训练配额 | 办案库直训 |

## 优先序（冻结建议）

**评测与安全骨架 → SFT → 偏好对齐 →（可选）CPT**  

## 与平台衔接

| 步 | 系统 |
|----|------|
| 数据发布 | ai-data `dataset@version` + recipe |
| 训练/评测 Job | ai-infra |
| 上线 | ai-infra Release → 模型网关 → agent-session |
