# 训练拓扑（ai-data ↔ ai-infra）

```mermaid
flowchart LR
  src[多源/脱敏导出] --> aidata[ai-data\nRecipe+Version]
  aidata --> job[ai-infra Train/Eval Job]
  job --> ckpt[Checkpoint]
  ckpt --> gate[评测门禁]
  gate --> rel[Model Release]
  rel --> gw[模型网关]
  gw --> agent[agent-session]
  job -.->|禁| case[case-core]
```

| 契约 | 说明 |
|------|------|
| 数据集 | `datasetId` + `version` + `manifest` checksum |
| 配方 | `recipeId`：配比、过滤、采样种子 |
| Job | `train.pretrain` / `train.sft` / `train.dpo` / `eval.*`（名可再冻） |
| 发布 | 仅门禁通过的 revision 可挂网关 |
