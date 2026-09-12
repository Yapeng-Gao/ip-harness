# AI Infra 能力阶梯

> **样机诚实**：阶梯下方「已有」几乎为空，只有 ops 内模型/infra mock。  
> **落地目标**：先契约与控制台，再调度，再真集群。

## 1. 阶梯

| 阶段 | 用户可感知 | 后端真相 | 明确没有 |
|------|------------|----------|----------|
| **样机 mock** | `apps/ai-infra:5179` IA + 假数据；或 ops `/ai/*` 过渡 | 内存 mock | GPU / K8s / 真权重仓 |
| **MVP** | 能提交「假作业」状态机；模型注册表；网关可读「已发布」列表 | PG 元数据 + 对象存储清单；可选队列 | 多租户强隔离训推、自动扩缩 |
| **生产** | 真调度、SLO 告警、发布门禁、回滚 | 对接集群（K8s/厂商）；密钥仓；OTel 训推指标 | 办案库混部 |

## 2. MVP 建议切片

1. 元数据：Cluster/Queue/Job/Model/Endpoint 表（无案字段）。  
2. 控制台：jobs + models + endpoints 三页真连元数据 API。  
3. 网关契约：`GET /v1/models/published`（名可再冻）供 agent-session。  
4. 告警事件名预留（勿占 `DOMAIN_EVENTS` 办案名）；出站仍 notify。  

## 3. 与办案里程碑解耦

- case-core / Agent HITL MVP **不阻塞**等真 GPU。  
- 反向：ai-infra 生产也 **不**要求先有完整办案微服务网格。

## 4. 验收（文档级）

- [ ] 规格与 ops 边界表无交叉职责糊弄  
- [ ] 产品面默认 5179；附录过渡路径写清  
- [ ] 明文禁止 PatentCase 入 ai-infra  
- [ ] 样机横幅诚实  
