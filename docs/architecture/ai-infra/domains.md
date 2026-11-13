# AI Infra 能力域

> **样机诚实**：下列均为目标域；样机用表格/空态/假进度条示意即可。  
> **落地目标**：按域建模块或服务，数据面与办案库隔离。

## 1. 域一览

| 域 | 职责 | 典型对象 | 不做 |
|----|------|----------|------|
| **GPU 资源** | 池、分区、配额、驱动/MIG 视图 | cluster、node、gpu_slot | 办案租户 Persona |
| **任务调度** | 队列、优先级、抢占、重试 | Job、Queue | DomainCommand |
| **环境 / 容器** | 镜像、运行时、依赖锁定、部署模板 | Image、RuntimeSpec | 五壳 Vite 构建 |
| **训练** | 分布式训练作业、checkpoint、实验元数据 | TrainJob、Run、Checkpoint | 直接读 PatentCase 正文当语料（须经脱敏导出流水线） |
| **批量推理** | 离线批打、回填、评测批 | BatchInferJob | 在线会话 turn |
| **在线推理** | 服务化端点、扩缩容、路由 | Endpoint、Revision、TrafficSplit | HITL Confirm |
| **发布** | 模型注册、晋级、回滚、审批 | ModelCard、Release | 自动改 case handoff |
| **性能优化** | 吞吐/延迟剖析、量化/批处理建议（工具向） | ProfileReport | 静默改生产流量 |
| **压测 / 监控告警 / 诊断** | 负载、SLO、故障定位 | LoadTest、AlertRule（AI 向） | 替换 ops 全局 OTel |
| **标准化协作** | 训练→评测→部署→迭代门禁 | PipelineTemplate | 替代算法团队责任 |

## 2. 与 ops 可观测的分界

| | ops-platform | ai-infra |
|--|--------------|----------|
| 日志 | 平台/应用日志、审计深链 | 训练/推理 job 日志、GPU 事件 |
| 指标 | 业务 SLA、依赖健康 | tokens/s、GPU util、队列等待、TTFT |
| 告警 | 通道配置 + 平台告警 | 训推 SLO 告警（可复用 notify 出站，**配置面仍分家**） |

## 3. 数据隔离（硬）

- ai-infra 库/桶：**无** `cases` / `handoffs` / `audit_log`（办案）。  
- 若需语料：经**导出作业**产生脱敏数据集 ID，只存数据集引用，不存案主键业务态。  
- 模型网关只暴露 `model_id` / `endpoint_url` / 配额，不暴露 GPU 节点 SSH。
