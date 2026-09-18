# e2e-hunt（探索猎虫 Harness）

> **定位**：通用「观察→决策→动作→判定」猎虫层；产出**疑似问题 + 证据链**。  
> **不是**替换现有 L0/L1 冒烟；**不是**生产全量回归。  
> **日期**：2026-09-18 · 口径来源：用户架构草稿 + 总控评估。

## 一句话

**L0/L1 管绿灯；Hunt 管找虫。** Harness 跨系统复用，产品差异进 AppAdapter。

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 为何需要；与现 e2e 共存 |
| [architecture.md](./architecture.md) | Harness / Adapter / Driver / Loop |
| [signals-and-telemetry.md](./signals-and-telemetry.md) | CheapSignals · CDP · 截图/a11y |
| [agent-loop.md](./agent-loop.md) | observe→decide→act→judge；中止/去重 |
| [report-contract.md](./report-contract.md) | report.json / report.md |
| [ip-harness-adapter.md](./ip-harness-adapter.md) | 本仓多壳适配示意 |
| [roadmap.md](./roadmap.md) | MVP → 增强 → CI |
| [vs-l0-l1.md](./vs-l0-l1.md) | 对照 `e2e/REVIEW_RUBRIC.md` |

## 明确不做（本规格波）

- 一上来全壳全量 LLM 扫  
- 用 Hunt 报告单独挡合并（除非人工升格 P0）  
- 在通用 Rule 里写死某一产品 CSS 选择器  
