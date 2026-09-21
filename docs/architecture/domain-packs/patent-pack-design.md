# 专利 Domain Pack · 设计规格（正式稿）

> **正式规格**（2026-09-21）。源稿：[../incoming/patent-domain-pack-design.md](../incoming/patent-domain-pack-design.md)。  
> 平台背景：[../agent-platform.md](../agent-platform.md)。实现蓝图：[patent-pack-impl.md](./patent-pack-impl.md)。  
> **产品面**：壳 IA 以 [agent-patent-shell](../product-apps/agent-patent-shell.md) 为准；中台映射见 [agent-l3-patent](../product-apps/agent-l3-patent.md)。  
> **样机诚实**：当前 Catalog / 9–14 席演练为 Pack 的**子集/过渡**；F7–F9（年费/转化/维权）可分期落地，但矩阵**必须列全**。  
> **禁**：端用户路径以可点 mid 深链当验收。

---

## 0. 方法论：业务逻辑五层

| 层 | 内容 | 形态 |
|----|------|------|
| **规则层** | 公式 / 校验器 / 分类器 / 期限表 | **代码（裁判）** |
| **流程层** | 内循环 SOP / 分支 / 退出条件 | 编排脚本 / 状态机 |
| **行为层** | 人设 / 边界 / 追问策略 | system prompt（选手） |
| **产物层** | 模板 + Schema + validator | 契约文件 |
| **数据层** | 法条库 / TRIZ / 模板 / 判例 | KB/RAG；断网 bot 打进镜像 |

**铁律**：代码做裁判，LLM 做选手；能写成 if/公式/校验器的绝不写进 prompt。

---

## 1. 生命周期全景（F1–F9）

```text
阶段一 · 创新源头
  F1 行业洞察     [行业分析师 + 竞争情报员]
  F2 创新孵化     [创新教练 + 专利挖掘师]
  F3 布局策划     [布局策略师]              →【HITL①】布局拍板
阶段二 · 申请中
  F4 立项决策     [立项评审]                →【HITL②】立项
  F5 新申请       [交底→查新→撰写→附图→递交] →【HITL③④⑤】
  F6 OA 循环      [OA答复 + 查新 + 撰写]    →【HITL⑥】答复策略 → 授权/驳回
阶段三 · 资产管理（可 Phase，矩阵必列）
  F7 授权后管理   [年费管家 + 价值评估师]    →【HITL⑦】年费/放弃
  F8 转化变现     [转化顾问]                →【HITL⑧】交易签约
  F9 维权防御     [无效维权顾问]            → 布局漏洞回流 F3（飞轮）
```

**HITL×8（收费节点）**：①布局 ②立项 ③交底确认 ④查新结论 ⑤权项确认 ⑥OA 策略 ⑦年费 ⑧交易签约。

编排状态机（带环）：Planning → Running → Validating（自修复）→ HumanReview（HITL）→ NextStep / Feedback 退回 / Suspended(pause) / Failed。详见源稿 Mermaid；实现见 [patent-pack-impl](./patent-pack-impl.md)。

---

## 2. 16 席矩阵 × Catalog 映射

| # | Pack Bot | Flow | egress | HITL | 现有 Catalog id（若有） | 备注 |
|---|----------|------|--------|------|-------------------------|------|
| 1 | 行业分析师 | F1 | 白名单 | — | `expert-landscape` | 提案键 `landscape_report` |
| 2 | 竞争情报员 | F1/F9 | 白名单 | — | `expert-competitor` | 提案键 `competitor_watch` |
| 3 | 创新教练 | F2 | **断网** | — | `expert-inspire` | 提案键 `inspire_brief` |
| 4 | 专利挖掘师 | F2 | 白名单 | — | `expert-mining` | 提案键 `mining_pack`；≠旧「立项」 |
| 5 | 布局策略师 | F3/F9 | **断网** | ① | `expert-layout` | 可对齐 `layout_insight` 心智 |
| 6 | 立项评审 | F4 | 白名单 | ② | `expert-intake` | **`intake_quote` + `go_nogo`** |
| 7 | 交底书工程师 | F5 | **断网** | ③ | `expert-disclosure` | **`disclosure_pack`** |
| 8 | 查新检索员 | F5/F6 | 白名单 | ④ | `expert-research` | **`research_report`** |
| 9 | 撰写代理人 | F5/F6 | **断网** | ⑤ | `expert-draft` | **`draft_claims`** |
| 10 | 附图工程师 | F5/F6 | **断网** | — | `expert-figure` | 辅席；无独立 handoff key |
| 11 | 流程管家 | F5–F7 | 白名单 | — | `expert-filing`（部分） | 期限台账 + 递交齐套；样机偏递交 |
| 12 | OA答复代理 | F6 | 白名单 | ⑥ | `expert-oa` | **`prosecution_response`**；仅已 file |
| 13 | 年费管家 | F7 | 白名单 | ⑦ | **缺口**（→ `maintain`） | Phase；STAGE `maintain_annuity` |
| 14 | 价值评估师 | F7 | 白名单 | — | **缺口** | Phase；联动年费建议 |
| 15 | 转化顾问 | F8 | 白名单 | ⑧ | **缺口**（→ `monetize`） | Phase；`monetize_terms` |
| 16 | 无效维权顾问 | F9 | 白名单 | — | **缺口**（→ `watch`） | Phase；飞轮→F3；≠ `expert-fto` |

另：壳内 `orchestrator`（总控）为编排席，不计入上表 16 业务节点，但产品路径必选。  
`expert-fto`（FTO）为样机**辅席**，对应自由实施分析；与 Pack「无效维权顾问」职责相邻但**不等同**，勿合并 id。

**断网组**（生成类）：创新教练 / 布局 / 交底 / 撰写 / 附图 — 法条库与模板打进镜像。  
**白名单组**（检索/数据类）：其余。

当前壳 Catalog 默认勾选主链（查新→立项→交底→撰写→递交→OA）+ 建议制图/FTO = **子集**；完整 16 席为目标态。

---

## 3. 节点业务逻辑摘要（五层落点）

详细内循环 Mermaid 见源稿；正式规格要求每席至少具备：规则层公式或 validator、流程层退出条件、行为层边界、产物层 schema、数据层依赖。

### 阶段一

| Bot | 规则层要点 | 关键产物 |
|-----|------------|----------|
| 行业分析师 | 空白点评分 = 市场热度×(1−专利密度)×规避难度 | 全景图 / 趋势 / 空白点清单 |
| 竞争情报员 | 预警 P0/P1/P2（覆盖核心 / 进空白 / 一般） | 预警 + 竞对雷达 |
| 创新教练 | 方案四要素必填；自检撞车表 | 技术方案草案包 |
| 专利挖掘师 | 挖掘七问 checklist；三段式 validator | 可专利点清单 |
| 布局策略师 | 引用链无环+全覆盖；公开时点规则 | 布局方案【HITL①】 |

### 阶段二

| Bot | 规则层要点 | 关键产物 |
|-----|------------|----------|
| 立项评审 | 可专利性×商业价值×成本；≥75/<50 阈值 | 评分卡【HITL②】 |
| 交底书工程师 | 六段必填；效果须数据或机理 | 交底书【HITL③】 |
| 查新检索员 | 覆盖度检查；新颖性/创造性风险公式 | 检索报告+映射表【HITL④】 |
| 撰写代理人 | 引用链/支持性/单一性/清楚性四类校验 | 说明书+权项【HITL⑤】 |
| 附图工程师 | 附图规范；图注术语 ⊆ 权项术语 | 附图集（不一致→feedback） |
| 流程管家 | 期限表=代码常量；答复期计算 | 台账/提醒/递交包 |
| OA答复代理 | 理由分类器；**不得超范围检查器** | 答复策略卡【HITL⑥】+答复包 |

### 阶段三（可 Phase）

| Bot | 规则层要点 | 关键产物 |
|-----|------------|----------|
| 年费管家 | 期限+滞纳金表；联动价值分级 | 缴费/放弃【HITL⑦】 |
| 价值评估师 | 引用/同族/许可/产品映射 → 核心/外围/放弃 | 评分卡 |
| 转化顾问 | 估值公式；合同必备条款 validator | 合同草案【HITL⑧】 |
| 无效维权顾问 | 全面覆盖比对器；稳定性指标 | 比对表 + **F9→F3 回流信封** |

---

## 4. Handoff 信封

席间流转统一信封（落数据中台 = 审计链）：

```yaml
handoff:
  id: ho-…
  flow: 新申请          # F5 等
  step: 查新检索 → 撰写
  type: deliver | feedback
  from: 查新检索员
  to: 撰写代理人
  inputs: […]
  acceptance: 权利要求书草案
  feedback:               # type=feedback 时
    reason: …
    requested: …
  audit: { timestamp, sandbox_id, validator_results }
```

与现仓 `HandoffArtifactKey` / DomainCommand 关系：正式写库仍经 HITL → DomainCommand；信封是 Pack 运行时协议，**不**另起案库权威。中台键以 contracts 为准；01–05 提案键勿假装已写入 packages。

---

## 5. 产品路径约束（不推翻既有钉）

| 规则 | 说明 |
|------|------|
| 从建项目 / Catalog 组队起 | 禁止无 `projectId` 专家截入（尤禁冷启动直进 OA/递交） |
| OA 仅已 file 后由总控派 | 对齐 SEAT_ROSTER |
| 端用户禁 mid 可点深链验收 | 壳内映射 + Command 示意即可 |
| L1/L2/L3 入口并列保留 | Domain Pack 挂在 L3/专利壳；Solo/Team 命名叠层见 agent-layers |
| 双文件过程可见 | 成果 + worklog；缺过程不可交卷（壳规格） |

合规与技术秘密：开工前读平台稿 §13–14（执业边界三档定位、交底加密与租户隔离、假设验证清单）。

---

## 6. Owner

规格：架构设计 · Pack 实现：后续平台/领域刀 · 壳：Agent应用助手（Catalog/双文件，另刀）
