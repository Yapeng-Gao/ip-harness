# AI Infra（训推基建平面）

> **样机诚实**：今日仓内**无**真 GPU 池、K8s 作业、训练集群、批量/在线推理平台；`apps/ops` 的「模型/基础设施」仅为 mock UI。  
> **落地目标**：从 **ops-platform** 拆出独立服务面 **`ai-infra`**：管大模型训练、批量推理、在线推理基建与发布闭环；办案 Agent **不**直管 GPU。

## 定调（冻结）

| 平面 | 管什么 | 不管什么 |
|------|--------|----------|
| **ops-platform** | 日志 / SLA / 配置 / 密钥引用 / 告警渠道配置 / OTel | 训推作业、GPU 池、模型权重发布流水线 |
| **ai-infra** | GPU 与调度、环境/镜像、训练与批推/在线推理、压测与诊断、模型发布与迭代标准 | `PatentCase` / DomainCommand 办案写；用户 SMTP 出站（属 notify） |

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 为何从 ops 拆出 |
| [domains.md](./domains.md) | GPU / 调度 / 环境 / 训练 / 批推 / 在线推理 / 发布 / 可观测 |
| [topology.md](./topology.md) | 与 ops / notify / agent-session / case-core 边界 |
| [surfaces.md](./surfaces.md) | 产品壳草案 `apps/ai-infra` **:5179** |
| [roadmap.md](./roadmap.md) | mock → MVP → 生产阶梯 |
| [REVIEW.md](./REVIEW.md) | 架构评审结论 |

## 与 Agent / 网关

- **ai-infra**：训推基建、配额池、模型版本发布。  
- **办案路径**：`agent-session` → **模型网关**（按租户配额调已发布端点）→ 不直连 GPU 调度 API。  
- **禁**：把 `PatentCase` / 交接状态写入 ai-infra。

## 上游

- [landing/backends](../landing/backends.md) · [ops-observability](../ops-observability.md) · [product-apps/ops](../product-apps/ops.md) · [enterprise](../enterprise/README.md)
