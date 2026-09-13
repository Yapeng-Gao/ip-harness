# 附图生成·编辑（Figure · D5）

> **样机诚实**：**无真文生图**、无真 CAD/矢量专利图引擎；草图为 SVG/Canvas 占位或预制模板。  
> **口径**：[`PROTOTYPE_MASTER_PLAN`](../../PROTOTYPE_MASTER_PLAN.md) **D5 / W3**。  
> **硬要求**：**生成 + 编辑双闭环**；只生成不可编辑 = **不验收**。

## 人用主路径（冻结）

**上下文 → mock 生成草图 → 画布编辑（标注/图层/撤销）→ 版本资产 → 可挂文档章**

## 产品壳（推荐默认）

| 项 | 值 |
|----|-----|
| 推荐 | 独立壳 **`apps/figure`** 端口 **5187**（不改 `APP_PORTS`） |
| 备选 | 挂 `apps/doc-harness:5178` 模式（见 [overview §壳选型](./overview.md)） |
| Owner | 附图助手 |

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 为何双闭环；壳选型；边界 |
| [human-ui.md](./human-ui.md) | 生成台 + 画布 IA |
| [deep-demo.md](./deep-demo.md) | 可点状态机与验收 |
| [REVIEW.md](./REVIEW.md) | 架构评审结论 |

## 上游

- [doc-harness](../doc-harness/README.md) · [PROTOTYPE_MASTER_PLAN](../../PROTOTYPE_MASTER_PLAN.md)
