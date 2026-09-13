# FTO（自由实施分析 · 样机）

> **样机诚实**：**无真 FTO 引擎**、无真权利要求解析、无律师意见效力；全流程内存 mock。  
> **口径**：[`PROTOTYPE_MASTER_PLAN`](../../PROTOTYPE_MASTER_PLAN.md) **D1 / W2**。  
> **壳**：`apps/fto` 端口 **5183**（不改 `APP_PORTS`）。

## 人用主路径（冻结）

**产品特征拆解 → 检索命中 → 权利要求对比矩阵 → 风险等级 → 报告 Confirm**

## 定调

| 做 | 不做 |
|----|------|
| 吃 **Search Hit**（自带种子篮 或 深链/事件示意来自 :5182） | `case-core` / DomainCommand **写库** |
| 可点对比矩阵 + 风险色阶 + Confirm 出报告草稿 | 真侵权比对 / 真法律结论 |
| 与 search **同 Hit 形状**消费 | 塞进 ai-data；改五壳业务码 |

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 为何独立壳；与 search / case-core 边界 |
| [human-ui.md](./human-ui.md) | 路由与五步 IA |
| [deep-demo.md](./deep-demo.md) | 内存状态机与验收 |
| [agent-api-shape.md](./agent-api-shape.md) | （可选）Agent 同形状只读/报告草稿 |

## 上游

- [../search/](../search/README.md) · [../PROTOTYPE_MASTER_PLAN.md](../../PROTOTYPE_MASTER_PLAN.md) · [../product-apps/agent-tools-mcp.md](../product-apps/agent-tools-mcp.md)
