# search-data 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/search-data/` + 入口 [`SCHEME_WAVE.md`](../../SCHEME_WAVE.md) |
| 对象 SHA | **`4daf889`**（`docs: scheme wave — search data plane + model training`） |
| 日期 | 2026-09-13 |
| **结论** | **通过** |

## 尺子对照

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 处理/存储/检索可开工粒度 | **过** | processing 八阶段+专利特有；storage L0–L3 + SearchDocument 字段；retrieval 三模式→计划+RRF+同族 |
| ② | ≠ ai-data | **过** | overview 原则#6；旁路导出/另桶；禁结果页一键进训湖；三分：search / search-data / ai-data |
| ⑤子集 | 诚实非样机码 | **过** | README「文档波·非样机码」；今日仍 mock；非目标禁真集群/`apps/**` |

## 专项：可开工性

| 检查 | 结果 |
|------|------|
| 读者能否指出全文/过滤/关键词/语义各落哪层 | **能**（L0–L3 + API） |
| 下游是否只能经 Search API | **是**（原则#1；Agent 同形状） |
| 增量/版本/合规 | ops-quality 覆盖 indexVersion 别名、quarantine、许可 |

## 非阻塞

1. overview 偏短，细节在 processing/storage/retrieval——可接受；勿再叠口号篇。
2. 首个落地 PR 仍须冻倒排引擎与向量选型（文已给倾向，未锁采购）。

## 裁决

**通过。**

## 轻量复评（润色 `23f4bcf` · 相对 Pass `4daf889`）

| 项 | 值 |
|----|-----|
| 范围 | 仅增量：topology / roadmap / 门禁 / 字段映射等 |
| 日期 | 2026-09-13 |
| **结论** | **维持通过** |

| 增量 | 裁决 |
|------|------|
| `topology.md` | 过：唯一 Search API；训练旁路；禁直训/禁 ES 直连 |
| `roadmap.md` | 过：MVP→生产诚实；契约形状不变迁移动作清 |
| `ip-sources` 字段映射 | 过：专利→SearchDocument 例表可开工 |
| overview MVP 切片 / processing 验收 | 过：补强可开工，无假装已交付 |
| `ops-quality` 增量管道+验收 | 过：watermark/死信/导出作业 ID |

### 黄项（非阻塞 · 须择一冻）

`ops-quality.md` **§2** 必填失败=`quarantine`，**§6** 同检查=`reject`——润色叠床未整编。**落地前择一写入单表**，删重复节。

### 未引入裂缝

- 无 `apps/*`
- ≠ ai-data / 旁路导出未动摇

## N3 MVP 任务单评审（`acefd5d`）

| 项 | 值 |
|----|-----|
| 对象 | [MVP.md](./MVP.md) |
| 日期 | 2026-09-18 |
| **结论** | **通过** |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 第一刀范围可开工 | **过** | 契约→入库→倒排→API→quarantine→接线准备六包；对齐 roadmap MVP |
| ② | 明确不做 | 过 | 全球库/权威同族/完整向量/Iceberg/训导出/改 apps/case-core 主存 |
| ③ | 验收标准 | 过 | 样本命中、`backend≠mock`、quarantine、别名回滚、同 Hit schema、禁混桶书面确认 |
| ④ | 与样机壳关系诚实 | 过 | :5182 仍可 mock；切 API **另 PR**；本单不改壳码 |

### 黄项关闭

本 MVP §2#5 / §3 将必填失败策略冻为 **quarantine**，关闭润色复评「§2 quarantine vs §6 reject」黄项。建议后续删 `ops-quality` 重复 §6 或改注「以 MVP 为准」。

