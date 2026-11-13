# model-training 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/model-training/` + 入口 [`SCHEME_WAVE.md`](../../SCHEME_WAVE.md) |
| 对象 SHA | **`4daf889`** |
| 日期 | 2026-09-13 |
| **结论** | **通过** |

## 尺子对照

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ③ | 预训练/SFT/偏好RL + 数据类型配比 + 准备 | **过** | pretrain · sft · preference-rl；T1–T10 + CPT/SFT/DPO 配比起点；data-prep 端到端+长专利 |
| ④ | 与 ai-data / ai-infra 衔接 | **过** | dataset@version+recipe → Job `train.*`/`eval.*` → Release；curriculum 接口表 |
| ⑤ | 诚实非样机码 | **过** | 无真 GPU；办案库永不直训；明确不做绝对分数/律师意见 |

## 专项：配比与门禁

| 检查 | 结果 |
|------|------|
| 配比是否可写入 Recipe 版本 | **是**（禁口头改配比） |
| 评测集是否先冻、防泄漏 | **是**（原则 + data-prep 黑名单/同族拆分） |
| 安全是否全程混入 | **是**（原则#3；T7 + 红队门禁） |

## 非阻塞

1. 配比为起始建议，须验证集校准——文已声明。
2. Tokenizer/专利号特殊符号在补充清单，落地时进第一份 Recipe ADR。

## 裁决

**通过。**

## 轻量复评（润色 `23f4bcf` · 相对 Pass `4daf889`）

| 项 | 值 |
|----|-----|
| 范围 | 仅增量：topology / roadmap / 阶段门禁 / 任务清单等 |
| 日期 | 2026-09-13 |
| **结论** | **维持通过** |

| 增量 | 裁决 |
|------|------|
| `topology.md` | 过：ai-data→Job→门禁→Release→网关；禁 case-core |
| `roadmap.md` | 过：外购基座优先；评测骨架→SFT→偏好→可选 CPT |
| overview 阶段门禁 | 过：CPT/SFT/偏好/发布闸清楚 |
| eval-safety 发布 Go/No-Go | 过：与 Release 门禁对齐 |
| sft IP 任务清单 / RAG 对齐 / tokenizer | 过：补强可开工 |

### 黄项（非阻塞 · 整编）

润色追加导致 **章节号重复**（`preference-rl` / `eval-safety` / `data-prep` 出现双 §4）。不改变语义；择机整编编号，勿再叠床。

### 未引入裂缝

- 无真训/无绝对分数承诺
- 与 ai-data/ai-infra 契约未动摇

## N3 MVP 任务单评审（`acefd5d`）

| 项 | 值 |
|----|-----|
| 对象 | [MVP.md](./MVP.md) |
| 日期 | 2026-09-18 |
| **结论** | **通过** |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 第一刀范围可开工 | **过** | 评测骨架→dataset@version+Recipe→train.sft→门禁→Registry；对齐 roadmap「评测→SFT」 |
| ② | 明确不做 | 过 | 从零预训练/大规模 CPT、全量 DPO/RLHF、多租户网格、SOTA、直训案、大改壳 UI、全球语料 |
| ③ | 验收标准 | 过 | 不可变 version、一次 Job、先冻评测+泄漏记录、Go/No-Go 书面、审计声明、拓扑一致 |
| ④ | 与样机壳关系诚实 | 过 | :5181/:5179 可留 mock；真 Job 另通道；本单不做检索→训练导出、不改 HITL |

### 非阻塞

基座许可/最小算力/合规语料为开训闸——文已写阻塞条件，总控开基建前勿假装已训。

