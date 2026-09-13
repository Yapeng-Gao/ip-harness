# 专利挖掘（Mining · D2）

> **样机诚实**：全内存 mock；**无**真交底解析、无真新颖性引擎、无自动立项效力。  
> **口径**：[`PROTOTYPE_MASTER_PLAN`](../../PROTOTYPE_MASTER_PLAN.md) **D2 / W4**。  
> **壳**：推荐 **`apps/mining:5184`**（不改 `APP_PORTS`）；人力紧时可挂 workbench 模块，但规格仍按独立平面。

## 人用主路径（冻结）

**交底/技术点 → 候选发明点列表 → 评分 → 送立项/撰写**

## 定调

| 做 | 不做 |
|----|------|
| 可点拆解交底 → 发明点卡片 → 打分/排序 → 送立项/撰写**占位** | `case-core` / DomainCommand **写库** |
| 可吃 **Search Hit**（种子篮或 search 深链示意） | 塞进 ai-data；改五壳业务码 |
| 与 FTO/激发边界清晰（挖掘产出「可立项点」） | 假装已创建 PatentCase |

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 边界与对象 |
| [human-ui.md](./human-ui.md) | 路由与四步 IA |
| [deep-demo.md](./deep-demo.md) | 状态机与验收 |

## 上游

- [search](../search/README.md) · [fto](../fto/README.md) · [doc-harness](../doc-harness/README.md) · [PROTOTYPE_MASTER_PLAN](../../PROTOTYPE_MASTER_PLAN.md)
