# AI Data 能力阶梯

> **样机诚实**：阶梯下方「已有」为空（或仅有导出空态）。  
> **落地目标**：先版本与清单契约，再处理引擎，再真湖仓。

## 1. 阶梯

| 阶段 | 用户可感知 | 后端真相 | 明确没有 |
|------|------------|----------|----------|
| **样机 mock** | `apps/ai-data:5181` IA + 假 Pipeline | 内存 mock | Spark / 湖仓 / 真 PII |
| **MVP** | Dataset + Version + Manifest；一条清洗状态机；导出单状态 | PG 元数据 + 对象存储清单 | 多租户强隔离湖、自动污染检测生产级 |
| **生产** | 分布式作业、血缘查询、质量门禁挡发布、评测闭环工单 | 对接处理引擎 + 湖；密钥仓；审计导出 | 与办案库混部；明文 PII 进训练桶 |

## 2. MVP 建议切片

1. 元数据：Source / Dataset / DatasetVersion / Manifest / ProcessRecord。  
2. 发布 API：`POST .../datasets/{id}/versions`（名可再冻）供 ai-infra 引用。  
3. 导出：仅存导出单元数据 + 脱敏产物路径；**无** PatentCase 列。  
4. 质量：规则分可 mock；真 PII 开闸后接。  

## 3. 与 ai-infra / 办案解耦

- ai-infra 训练 MVP 可先用**手工登记**的 dataset version。  
- case-core MVP **不**阻塞等湖仓。  
- 反向：ai-data 生产不要求完整微服务网格。

## 4. 验收（文档级）

- [ ] ≠ ops / ≠ ai-infra / ≠ case-core 边界表清晰  
- [ ] 产品面默认 :5181；不改 APP_PORTS  
- [ ] 禁 PatentCase；脱敏导出写明  
- [ ] 样机横幅诚实（无 Spark/湖仓/PII）  
