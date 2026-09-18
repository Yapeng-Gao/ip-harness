# 产业全景（Landscape · D4）

> **样机诚实**：单垂直域种子（**汽车**）；**无**全球实时产业库、无真图数据库、无真多源持续入库。  
> **口径**：[`PROTOTYPE_MASTER_PLAN` §4.5](../../PROTOTYPE_MASTER_PLAN.md) · D4 / **W5** 样机；本包可与 W2 **并行起草**。  
> **壳**：`apps/landscape` 端口 **5186**（不改 `APP_PORTS`）。

## 产品升格（用户定调）

行业树多层（汽车系统→零配件）+ 企业/业务线/地位 + 专利布局 + 竞品 + 卡脖子/围剿 + 前沿布局。

## 结论摘要

| 层级 | 能否做 |
|------|--------|
| **样机演示** | **能**（汽车种子；见 deep-demo） |
| **原型加深（本补丁）** | **能**（L1–L4 小图谱可导航；仍非全球库） |
| **可售真产品（全行业）** | **不能只靠现有壳** → 真落地另立 industry-graph / entity 服务面 |

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 为何独立；与 search / ai-data / case-core |
| [domains.md](./domains.md) | L1–L6 能力面 |
| [human-ui.md](./human-ui.md) | :5186 IA |
| [deep-demo.md](./deep-demo.md) | W5 最小可点闭环 |
| [deepen-l1-l4.md](./deepen-l1-l4.md) | **加深补丁**：L1–L4 真原型加深；默认壳内、可选 :5191 |
| [agent-api-shape.md](./agent-api-shape.md) | Agent 同形状查询（示意） |
| [REVIEW.md](./REVIEW.md) | 架构评审结论 |

## 上游

- [PROTOTYPE_MASTER_PLAN §4.5](../../PROTOTYPE_MASTER_PLAN.md) · [search](../search/README.md) · [ai-data](../ai-data/README.md)（明确 ≠）
