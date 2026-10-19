# 专利生命周期覆盖度梳理

> 2026-10-19 · 梳理仓内「阶段轴 + 各层节点」对照标准专利生命周期，给出覆盖结论与缺口清单。
> 权威源：`@ip/contracts` `StageId` · `@ip/domain` `STAGES` · `src/data/flowSteps.ts` · `src/data/docketRules.ts` · `src/data/agents.ts` · `apps/agent` 专家席。
> 口径：多壳样机（非真后端）；本表是**静态规格对照**，非案级 Live 进度。

## 1. 生命周期主轴（仓内现有 7 Stage）

`StageId` 单一源在 [`packages/contracts/src/keys.ts`](../../packages/contracts/src/keys.ts)，元数据（runners / checklist / 配色）在 [`packages/domain/src/stages.ts`](../../packages/domain/src/stages.ts)：

| # | StageId | 名称 | 覆盖内容 | 交接产物 | workbench Flow 子步骤 |
|---|---------|------|---------|---------|----------------------|
| 1 | `pre_research` | 立项前调研 | 现有技术检索、竞品专利、可专利性初评、初步 FTO | `research_report` | 检索配置→结果研判→可专利性→FTO 初评→结论提交 |
| 2 | `decision` | 立项决策 | 发明披露、技术/商业双维评审、Go·No-Go | `intake_quote` | 发明披露→双维评分→委员投票→Go/No-Go |
| 3 | `drafting` | 撰写申请 | 交底书、权利要求布局、国别策略、提交与优先权标记 | `draft_claims` | 交底书→权利要求树→申请策略→生成清单 |
| 4 | `prosecution` | 审查答复 | OA 解析、争点策略、意见陈述、递交 | `prosecution_response` | OA 登记→争点策略→权利要求修改→答复书 |
| 5 | `maintenance` | 授权维持 | 授权登记、年费计划、权利状态、变更 | `maintain_annuity` | 权利状态→年费日程→变更事项→审批交接 |
| 6 | `commercialization` | 运用转化 | 许可/转让、诉讼维权（stub）、成果落地 | `monetize_terms` | 选择路径→条款要点→里程碑→审批交接 |
| 7 | `monitoring` | 监控预警 | 侵权/竞品监测、到期与风险提醒；「升级维权」回流 #6 | `watch_alert` | 规则配置→告警处理→交接确认 |

轴外入口 / 辅台（**无** StageId）：

- **发明人披露**（InventorPortal）：`disclosure_pack`，状态 `草稿→已提交→部门审核→IP受理→已立案/退回`，`targetStage ∈ {pre_research, decision}`
- **布局洞察**（layout）：辅台，产物 `layout_insight`，3 步（洞察摘要→国别建议→交接）

## 2. 横切节点系统（叠在主轴上）

| 系统 | 节点集 | 位置 |
|------|--------|------|
| 交接状态机 | 7 态 `drafting→submitted_to_enterprise→enterprise_review→changes_requested→approved→authorized_to_file→filed`；7 个 HandoffAction；产物版本 + 递交回执（`receiptNo`/`filedAt`） | contracts `keys.ts` · `handoff.ts`；domain `handoff.ts` |
| Docket 期限 | 7 条规则：一通答复（4 月）/ 后续 OA（2 月）/ 申请费（2 月·受理 15 日）/ 实审请求（3 年）/ 授权登记（2 月）/ 年费（12 月 + 6 月滞纳宽限）/ PCT 进中国（30 月 + 宽限 2 月）；Wave2 升级阶梯 `none→reminded→escalated_enterprise→at_risk` | `src/data/docketRules.ts`（标注「示意·审查指南」） |
| HITL 闸门 | 5 个：`go_nogo` / `approve_strategy` / `authorize_file` / `pay_unlock` / `confirm_quote`；中央聚合（Persona、交底齐套、递交 5 清单、OA 争点 + 陈述确认、法务已阅、可核验命中、Full-check 三勾） | domain `guardrails.ts` · `fullFilingCheck.ts` |
| 商务线 | `EngagementPhase` 7 段（接案评估→…→监控维权）；`QuoteDispatchStatus`；`PaymentStatus`/`InvoiceStatus`；发票阻塞反卡 `authorize_file` | domain `types/index.ts` · `persona.ts` |
| 领域命令 | 18 个 `CommandName`（submitResearch … docketComplete）+ 9 个 `DOMAIN_EVENTS` | contracts `commandNames.ts` · `events.ts` |
| Agent 映射 | 9 个 Agent 逐一挂 stage（调研检索/交底整理/立项评估/权利要求/OA 答复/年费维持/转化条款/监控预警/布局洞察），tier core/assist/beta + 各自 HITL gates | `src/data/agents.ts` |
| Agent 专家席（更细） | 默认 7 席（查新/立项/交底/撰写/附图/递交/审查答复）+ 更多席（全景/激发/竞品/挖掘/FTO）+ Phase 灰显席（布局/年费/价值/转化/维权）；`patentMidMap.ts` 把 18 席映射到 mid 节点（含 `cross_stage`/`proposal`/`drafting_assist`/`authorize_file`/`phase` 等轴外键） | `apps/agent/src/business/businessSeats.ts` · `apps/agent/src/projects/patentMidMap.ts` |

## 3. 对照标准专利生命周期（全阶段清单）

按业内常见生命周期阶段逐条对照：

| 阶段 | 仓内对应 | 覆盖判定 |
|------|---------|---------|
| 发明产生 / 披露 | InventorPortal `disclosure_pack` + `agent-disclosure` + 专家席交底 | ✅ 覆盖 |
| 现有技术调研 / 查新 | `pre_research` + ResearchFlow + `agent-research` + search 壳 :5182 | ✅ 覆盖 |
| 可专利性初评 | runners `patentability` + research 步骤「可专利性」 | ✅ 覆盖 |
| FTO / 自由实施 | research runner `fto`（初步）+ `apps/fto` :5183 + 专家席 FTO（辅席） | ✅ 覆盖（初步 + 独立壳） |
| 立项决策 / Go-NoGo | `decision` + IntakeFlow + 委员投票 + `go_nogo` 闸 | ✅ 覆盖 |
| 申请策略（类型/国别） | drafting runner `filing`「国别策略」+ layout 辅台 | ✅ 覆盖 |
| 撰写（说明书/权利要求/附图） | DraftFlow + `agent-claims` + 专家席「附图」辅席 | ✅ 覆盖 |
| 递交（国内/PCT 国家阶段） | `authorize_file`/`file` 闸 + `pct_national_entry` docket 规则 | ⚠️ 部分：PCT 仅期限规则，无独立阶段/Flow |
| 实质审查 / OA 答复 | `prosecution` + ProsecutionFlow + OA Agent + 一通/二通 docket | ✅ 覆盖 |
| 授权登记 / 年费维持 | `maintenance` + MaintainFlow + 年费 Agent + annuity/grant docket | ✅ 覆盖 |
| 无效 / 异议程序 | — | ❌ 未建模 |
| 失效 / 放弃（不缴年费终止） | 年费有滞纳宽限 docket，但无「放弃维持」路径 | ❌ 未建模 |
| 运营（许可/转让/入股） | `commercialization` + MonetizeFlow + 转化条款 Agent | ✅ 覆盖 |
| 维权 / 诉讼 | commercialization runner `litigation`（标注「示意·无独立 Flow」）+ 专家席维权（Phase 灰显）+ watch「升级维权」线索 | ⚠️ 部分：无独立 Flow |
| 失效后处置 / 专利组合退出 | — | ❌ 未建模 |
| 持续监控 | `monitoring` + WatchFlow + 监控 Agent + WatchAlert SLA | ✅ 覆盖（并回流维权） |

## 4. 结论

**主路径全**：发明披露 → 调研 → 立项 → 撰写 → 审查 → 维持 → 转化 → 监控，且 #7 回流 #6 成循环；每层（stage / flow / agent / expert seat / docket / handoff / gate）节点对齐，`StageId` 单一源无分叉。

**四个洞**（按价值排序）：

1. **无效/异议程序**：完全不建模。实务中高频（对己方专利提无效、应对他人无效宣告），至少值得进 `prosecution` 下子节点或独立 stage。→ **已补规格**：[lifecycle/nodes/22-invalidation.md](../lifecycle/nodes/22-invalidation.md)
2. **PCT / 国际进入**：只有 docket 一条规则 + drafting 文案；缺 PCT 阶段（国际阶段 vs 国家阶段）、多国费用与期限管理。→ **已补规格**：[lifecycle/nodes/09-pct-international.md](../lifecycle/nodes/09-pct-international.md)
3. **诉讼维权独立化**：现在只是 stub runner + 灰显专家席；缺「立案→证据保全→判决执行」Flow 与 docket 配合。
4. **终止/放弃路径**：年费逾期后无「放弃维持→组合退出」终态，轴默认走到底；与「价值评估」专家席（score_portfolio）天然可接。→ **已补规格**：[lifecycle/nodes/23-termination-recovery.md](../lifecycle/nodes/23-termination-recovery.md)

**补建进度**：洞 1、2、4 已产出产品级规格文档（含字段 schema、状态机、规则编号、差距表）；洞 3（诉讼维权）仍未建模。规格文档 ≠ 代码实现——四洞在代码中**均未落地**，文档是补建的施工图。

**建议落位**：1、4 走 N4（case-core / 真产业图谱）另立项口径；2、3 可作样机「补节点」小刀（加 StageId 子类或辅台 + 专家席解禁），不进真 GPU/真后端边界。

## 相关

- [codebase.md](./codebase.md) · [data-model.md](./data-model.md) · [NEXT_WAVE.md](../NEXT_WAVE.md)（N4 另立项口径）
- 权威源文件见 §1–§2 各表；勿以本文替代权威源。
