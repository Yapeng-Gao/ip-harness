# e2e-hunt 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/e2e-hunt/`（README · overview · architecture · signals · agent-loop · report-contract · ip-harness-adapter · roadmap · vs-l0-l1） |
| 对象 SHA | **`4c83476`**（`docs(architecture): add e2e-hunt harness scheme`） |
| 日期 | 2026-09-18 |
| **结论** | **通过** |

## 尺子对照（总控点名）

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | Harness / Adapter 分离 | **过** | architecture 两层图；通用层禁产品 CSS；选择器/URL/CasePack 仅 Adapter |
| ② | 与 L0/L1 共存不替代 | **过** | vs-l0-l1 + README；Hunt 默认不挡合并；禁用 Hunt 绿代 L0 绿；回写窄 L1 路径清 |
| ③ | CheapSignals 优先于 LLM | **过** | signals §1 默开规则定论不烧 LLM；增强遥测默关；LLM 只管探索/歧义 |
| ④ | report 契约 | **过** | report.json 最小 schema + summary 四态 + findings/evidence；Driver 换实现契约不变 |
| ⑤ | MVP 边界清晰 | **过** | roadmap：一 Adapter + 一条 CasePack；不做全壳扫/heap/CI 阻断/Playwright 批跑 |

## 专项

| 检查 | 结果 |
|------|------|
| 样机诚实白名单 | 有（mock / 样机横幅 ≠ 缺陷） |
| 中止/去重 | agent-loop 必实现（maxSteps / stall / fingerprint） |
| 与 `e2e/REVIEW_RUBRIC` | 已双向链；不推翻 L0/L1 |

## 非阻塞

1. `architecture/README.md` 开评时未挂本包索引（本提交已补）。  
2. MVP CasePack 建议 search 或 agent HITL——实现 Owner 择一即可。  
3. `summary.status` 与 `budget_exceeded` 文案：agent-loop 写 abort 原因、契约用 `aborted`——实现时对齐字段即可。

## 裁决

**通过。** 可总控总验。本波文档先行；实现另开 Owner，勿用 Hunt 替代 L0。
