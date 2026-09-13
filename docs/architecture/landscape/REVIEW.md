# landscape 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/landscape/`（README · overview · domains · human-ui · deep-demo · agent-api-shape） |
| 对象 SHA | **`f0e1c28`**（`docs(architecture): industrial landscape spec (D4, auto seed)`） |
| 日期 | 2026-09-13 |
| **结论** | **通过**（只锁规格；实现仍 W5） |

## 尺子对照（总控点名）

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | §4.5 汽车种子域闭环 | 过 | 树≥3层+企业+布局+竞品+卡脖子/围剿/前沿；deep-demo 验收对齐主计划 |
| ② | :5186 独立壳、不改 APP_PORTS | 过 | 与并行壳策略一致；域选择锁汽车 |
| ③ | L1–L6 写清 + 真全行业另立项 | 过 | domains 表完整；README/overview 明示可售真产品另立 industry-graph |
| ④ | ≠ ai-data / ≠ case-core 写库 | 过 | 多篇硬分界；Agent 禁写 PatentCase / 禁发 dataset |
| ⑤ | 与 search Hit 下钻边界 | 过 | Hit=入口非图谱主存；工作篮占位；深链只读 :5182 |

## 非阻塞建议

1. 实现 W5 时按 deep-demo 种子量（树≥12 节点、企业≥12、Hit≥6）落地。
2. L3 ingest 保持假进度即可，勿假装持续爬取。

## 裁决

**通过。** 规格可锁；实现归 W5，本评不验收代码。
