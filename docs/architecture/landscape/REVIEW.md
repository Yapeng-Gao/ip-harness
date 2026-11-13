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

## 轻扫 · L1–L4 加深补丁（`f1623be`）

| 项 | 值 |
|----|-----|
| 对象 | [deepen-l1-l4.md](./deepen-l1-l4.md) |
| 日期 | 2026-09-18 |
| **结论** | **Pass**（黄项非阻塞） |

| 尺子 | 结果 |
|------|------|
| L1–L4 加深范围 | 过：做/不做表可开工；L5 仅规则增强；L6 仍 :5186 |
| 汽车种子 | 过：域锁汽车；非汽车 disabled |
| 横幅冻结 | 过：含「加深图谱」+「无全球实时」 |
| 默认 A / 可选 B:5191 | 过：默认壳内；5191 须旗标回退、不进 APP_PORTS |
| 禁项 | 过：case-core / 真 GPU / 他域 apps / APP_PORTS；≠ search-api/ai-data |

### 黄项（非阻塞）

1. ~~L4 `org-standard?`~~ — **已关**（`c07c4b3`：表与 Edge 联合均含 `org-standard` 可选）。  
2. overview 旧横幅未含「加深图谱」——加深 UI 以本补丁冻结文案为准即可，不必强改 overview。

