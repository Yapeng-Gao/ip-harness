# 模型训练 · 落地 MVP 任务单

> **依据**：[README](./README.md) · [roadmap](./roadmap.md) · 优先序 **评测骨架 → SFT →（非本刀）偏好/CPT**。  
> **本页**：第一刀可开工；**禁**本单改 `apps/*`。

## 1. 目标一句话

外购基座 + **小规模 SFT** + **冻结评测集** + **一门禁**后的模型 Release 记录（可先挂内网端点或仅 Registry）；数据经 **ai-data `dataset@version`**，Job 经 **ai-infra** 契约形状（可先同 monorepo 最小实现）。

## 2. 第一刀范围（做）

| # | 工作包 | 交付物 |
|---|--------|--------|
| 1 | 评测骨架 | 冻结 val/test 切分；任务回归最小集（摘要/改写/拒答至少各一切片） |
| 2 | 数据 | ai-data：一个 SFT `dataset@version` + Recipe（配比写死）+ 许可清单；**无** PatentCase 直训 |
| 3 | 训练 | ai-infra：一个 `train.sft` Job 定义（超参清单、引用 version）；可在小 GPU/云实例跑通一次 |
| 4 | 门禁 | 对照 [eval-safety](./eval-safety.md) 发布表：回归不低于约定阈值；高危红队样例抽检 |
| 5 | 发布记录 | Registry 记 revision；`backend`/模型 id 可供 agent-session **配置引用**（真接线可另 PR） |

## 3. 明确不做

| 不做 | 说明 |
|------|------|
| 从零预训练 / 大规模 CPT | 归增强 |
| DPO/RLHF 全量 | 归增强；本刀最多留接口名 |
| 真多租户训练配额 / K8s 生产网格 | 可单机或托管单 Job |
| 保证 SOTA 分数 | 只设相对门禁 |
| 办案库直训 / 未脱敏交底 | 硬禁 |
| 改 `apps/ai-data`·`ai-infra` 大改 UI | 本单以后端/流水线切片为主；壳 deep-demo 不扩范围 |
| 真全球语料采购 | 小样本合规语料即可 |

## 4. 验收标准

- [ ] 存在不可变 `dataset@version` + recipe 文档/清单  
- [ ] 一次 SFT Job 跑完并落 checkpoint（或托管等价物）  
- [ ] 评测集在训练前已冻结；泄漏检查（文献号级）有记录  
- [ ] Go/No-Go 表有一次书面结论（Pass 才标 Release）  
- [ ] 无 case-core / 未脱敏案进训的审计声明  
- [ ] 与 [topology](./topology.md) 一致：训推不经 Search API 旁路灌数  

## 5. 与现样机壳关系

| 壳 / 包 | 关系 |
|---------|------|
| **`apps/ai-data:5181`** | 样机继续 mock Pipeline；MVP 真 version 可先 API/CLI，壳接线另 PR |
| **`apps/ai-infra:5179`** | 样机 Job 状态机可保留；真 Job 另通道，避免假装 GPU |
| **`apps/search:5182`** | 仅作未来导出源；本 MVP **不**做检索→训练导出 |
| **agent:5175** | Release 后可选改模型配置；本单不改 Confirm/HITL |
| **办案五壳** | 无关 |

## 6. 建议 Owner / 依赖

- 数据：AI Data · 训练 Job：AI Infra · 评测门禁：算法+架构会签  
- 阻塞：无基座许可、无最小算力、无合规语料则不开训  
