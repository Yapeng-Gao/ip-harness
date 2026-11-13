# 专利 Bot × SaaS Stage 办理逻辑审计

> **口**：`apps/agent` DomainPack:`patent` · 对照 `apps/workbench` `STAGE_MODULES`  
> **分支**：`dev` · HEAD `a5028bc`  
> **日期**：2026-09-19 21:34 CST（Asia/Shanghai）  
> **性质**：只评、不派工；**不改**产品码；**不** commit/push。  
> **诚实口径**：mock OK（HITL→DomainCommand、步骤条、闸形状在即可）；仅 toast/placeholder、无 stage/handoff 映射 = **空壳**。

## 总判

专利 DomainPack **不是**「换皮聊天」：九席各有独立 `steps` / `tools` / `hitlGates` / `domainCommandCandidates`，总控禁写库，Confirm 经 `ExpertHitlBridge`→`sessionHitlAction`→`dispatchCommand`（样机内存）。  
但相对 Workbench **可卖 Core stage 全表**，集体只扎实覆盖 **授权前主链**（调研→立项占位→交底→撰稿→递交闸→OA）；**maintain / monetize / watch 在专利 Pack 内为零席**——L1 Catalog 虽有 `agent-annuity|monetize|watch`，**未焊入** L3 项目花名册。  
**一句**：前半段是真办理形状的领域 bot；后半段 SaaS 办理节点对专利 bot 而言仍是 **空位**——整体 ≠ 全生命周期 stage 办理，≠ 纯 chat skin。

---

## 方法与权威源

| 源 | 路径 | 用途 |
|----|------|------|
| STAGE_MODULES | `apps/workbench/src/stages/index.ts` | 可卖 stage 边界权威 |
| SKU 表 | `docs/workbench/STAGE_MODULE_SKU.md` | id/path/stageId/handoffKey |
| ARTIFACT_FOR_STAGE | `packages/contracts/src/handoff.ts` | stage↔工件 |
| STAGES runners | `packages/domain/src/stages.ts` | 阶段业务故事（含 FTO 属调研） |
| 专利专家 | `apps/agent/src/projects/expertsPatent.ts` | 剧本/闸/命令候选 |
| 中台映射 | `apps/agent/src/projects/patentMidMap.ts` | expert↔midStage |
| HITL 桥 | `apps/agent/src/components/projects/ExpertHitlBridge.tsx` | Confirm→DomainCommand |
| Pack 注册 | `apps/agent/src/projects/experts.ts` · `types.ts` `DomainPackId='patent'` | 焊死花名册 |
| 规格 | `agent-l3-patent.md` · `agent-entry-modes.md` · `agent-project-folder.md` | L3 故意止于 OA |
| L1 Catalog | `src/data/agents.ts` | 对照：有 annuity/monetize/watch/intake，Pack 未全用 |

**判级**：

| 判 | 含义 |
|----|------|
| **承载** | 步骤条可点 + HITL 闸 + DomainCommand 候选（或诚实只读）+ handoff/stage 映射自洽 |
| **半壳** | 有剧本/映射，但闸/catalog/写库键串工件、或只覆盖 stage 子集 |
| **空壳** | 专利 Pack 无对应席；或仅 toast/无 stage 映射 |

---

## Coverage 矩阵 · STAGE_MODULES → 专利专家

| STAGE id | stageId | handoffKey | 对应专利席 | 判 | 一句话 |
|----------|---------|------------|------------|----|--------|
| **research** | `pre_research` | `research_report` | `expert-search`（主）；`expert-fto` 覆盖 STAGES.runners.fto 故事 | **承载** / FTO 侧 **半壳** | 检索四步+可选 `submitResearch`；FTO 五步有但默认不写案且 mid 标 layout |
| **intake** | `decision` | `intake_quote` | `expert-mining` 仅 | **半壳** | 有洞察建案 HITL，**无** `agent-intake` 的 `go_nogo`/`confirm_quote` 双闸席 |
| **draft** | `drafting` | `draft_claims` | `expert-draft`（主）；`expert-figure` 辅；`expert-filing` 齐套/授权闸 | **承载** / figure **半壳** | 撰稿权项剧本+写候选齐；附图仅事件；递交席挂 drafting 尾 |
| **prosecution** | `prosecution` | `prosecution_response` | `expert-oa` | **半壳** | 剧本与 handoff 声明正确，但 HitlBridge `saveDraft` **写死** `draft_claims` |
| **maintain** | `maintenance` | `maintain_annuity` | — | **空壳** | Catalog 有 `agent-annuity`，Pack **无席** |
| **monetize** | `commercialization` | `monetize_terms` | — | **空壳** | Catalog 有 `agent-monetize`，Pack **无席** |
| **watch** | `monitoring` | `watch_alert` | — | **空壳** | Catalog 有 `agent-watch`，Pack **无席** |
| **layout** | — | `layout_insight` | `expert-fto`（mid 表松绑） | **半壳** | 非默认可卖；FTO≠布局台 Flow |
| **home** | — | — | `orchestrator`（跨阶段编排） | **N/A·壳** | 总控非办理节点；符合「禁写库」 |
| **inventor** | — | `disclosure_pack` | `expert-disclosure` | **承载** | 交底结构→HITL→`saveDraft`/`submitHandoff` 形状在；写库键见 P0 |

**Coverage 摘要（stage→expert）**

```text
research     → expert-search (+ expert-fto 故事重叠)
intake       → expert-mining（残缺 vs agent-intake）
draft        → expert-draft · expert-figure · expert-filing
prosecution  → expert-oa
maintain     → ∅
monetize     → ∅
watch        → ∅
layout       → expert-fto（松）
inventor     → expert-disclosure
home         → orchestrator（编排 only）
```

---

## 逐 Stage 详表

### 1. research · `pre_research` · `research_report`

| 列 | 内容 |
|----|------|
| **业务故事** | 技术扫描、现有技术检索、可专利性；STAGES 另含初步 FTO runner |
| **屏上或剧本** | 检索：检索式→命中→工作篮→策略确认；FTO：特征→命中→矩阵→风险→报告确认；总控可「演示全链路」首派 search |
| **代码证据** | `expertsPatent.ts` `expert-search` steps/query|hits|basket|strategy · `hitlGates:['approve_strategy']` · `submitResearch` 候选 · `catalogAgentId:'agent-research'`；`patentMidMap` midStage=`pre_research` handoff=`research_report`；`ProjectChatPane` `domain-step-bar`；FTO：`expert-fto` 五步 + 默认 `command:null` |
| **判** | search **承载**；同 stage 的 FTO runner 由独立席 **半壳**承载（诚实不写案 OK，但 mid 标 `layout_insight`/`drafting_assist` 与 domain STAGES「FTO∈调研」漂移） |
| **级** | P1（FTO mid 映射漂移） |

### 2. intake · `decision` · `intake_quote`

| 列 | 内容 |
|----|------|
| **业务故事** | 发明披露评审、Go/No-Go、报价确认（Workbench `IntakeFlow` + Catalog `agent-intake` 双闸） |
| **屏上或剧本** | 挖掘：技术点→方向→评分→「送立项确认」HITL；**无**报价确认条、无 go_nogo 芯片 |
| **代码证据** | `expert-mining` → `createCaseFromInsight` · preview 写 `handoffKey=intake_quote`；`catalogAgentId:'agent-research'`（**非** `agent-intake`）；`agent-intake` 在 `src/data/agents.ts` 有 `go_nogo`+`confirm_quote` 但 **未**进 `PATENT_PROJECT_EXPERT_IDS`；Workbench `IntakeFlow.tsx` action `go_nogo` |
| **判** | **半壳** — 立项「建案占位」形状在；决策台双闸办理 **未**进 Pack |
| **级** | **P1** |

### 3. draft · `drafting` · `draft_claims`

| 列 | 内容 |
|----|------|
| **业务故事** | 交底完善、权利要求、国别/提交（filing runner） |
| **屏上或剧本** | 撰稿：权项→摘要→修订→策略批准；附图：清单→草图→挂章；递交：国别→齐套→形式→`authorize_file` |
| **代码证据** | `expert-draft`：`saveDraft`/`submitClaims`/`submitHandoff` · `catalogAgentId:'agent-claims'` · mid `drafting`/`draft_claims`；`expert-figure`：`command:null` 事件挂章；`expert-filing`：`authorize_file` + `authorizeFile`/`fileResponse` · 但 `catalogAgentId:'agent-claims'`（复用撰稿目录） |
| **判** | draft **承载**；figure **半壳**（诚实事件 OK）；filing **半壳**（闸形状对，catalog/handoff 绑 claims） |
| **级** | P1（filing catalog 复用；figure 无真 revision 已自承） |

### 4. prosecution · `prosecution` · `prosecution_response`

| 列 | 内容 |
|----|------|
| **业务故事** | OA 解析、答复策略、意见陈述提交 |
| **屏上或剧本** | 审查意见→策略→答复草稿→答复确认；handoff 文案=`prosecution_response` |
| **代码证据** | `expert-oa` steps + `saveDraft`/`submitHandoff` · `catalogAgentId:'agent-oa'` · mid `prosecution`；**但是** `ExpertHitlBridge.tsx` L217–231：凡 `saveDraft` payload.`handoffKey='draft_claims'`，凡 `submitHandoff` → `'disclosure_pack'` — OA Confirm 写库示意 **串工件** |
| **判** | **半壳** — 剧本/目录/mid 表立住；写库示意键未跟席 |
| **级** | **P0** |

### 5. maintain · `maintenance` · `maintain_annuity`

| 列 | 内容 |
|----|------|
| **业务故事** | 授权登记、年费计划、权利状态（Core 可卖） |
| **屏上或剧本** | 专利项目侧栏 **无** 维持席；L1 Catalog/`AGENT_SCRIPTS` 有 `agent-annuity`，与 L3 Pack 隔离 |
| **代码证据** | `STAGE_MODULES` maintain 行；`PATENT_PROJECT_EXPERT_IDS` 无 annuity；`expertsPatent.ts` 无 maintain_*；`agent-annuity` @ `src/data/agents.ts` |
| **判** | **空壳**（对专利 Pack） |
| **级** | **P1**（相对「全 SaaS stage」；L3 规格故意止于 OA 则记覆盖缺口而非 L3 违约） |

### 6. monetize · `commercialization` · `monetize_terms`

| 列 | 内容 |
|----|------|
| **业务故事** | 许可/转让条款（可 Assist/Beta） |
| **屏上或剧本** | Pack 无席 |
| **代码证据** | 同上模式 · `agent-monetize` 仅 Catalog |
| **判** | **空壳** |
| **级** | **P1** |

### 7. watch · `monitoring` · `watch_alert`

| 列 | 内容 |
|----|------|
| **业务故事** | 侵权/竞品监测、告警处置 |
| **屏上或剧本** | Pack 无席 |
| **代码证据** | `agent-watch` 仅 Catalog；`SessionConfirmBar` 有 watch 专用 UI，属 L1 会话非 L3 Pack |
| **判** | **空壳** |
| **级** | **P1** |

### 8. layout · 辅台 · `layout_insight`

| 列 | 内容 |
|----|------|
| **业务故事** | 布局洞察；SKU 默认不可卖 |
| **屏上或剧本** | 无 layout 专家；FTO mid 行声称可链 `layout_insight` |
| **代码证据** | `patentMidMap` expert-fto `handoffKeys:['layout_insight']`；`expert-fto` 自身 `command:null`；Workbench `LayoutFlow` 独立 |
| **判** | **半壳**（松绑文案，无布局办理剧本） |
| **级** | P2（默认可卖=否，降级） |

### 9. inventor · `disclosure_pack`

| 列 | 内容 |
|----|------|
| **业务故事** | 发明人交底入口；与 draft/intake 可捆绑 |
| **屏上或剧本** | 交底：技术点→结构→实施例→交底确认 HITL |
| **代码证据** | `expert-disclosure` · `catalogAgentId:'agent-disclosure'` · mid handoff `disclosure_pack`；候选 `saveDraft`/`submitHandoff`；HitlBridge 对 `saveDraft` 仍写死 `draft_claims`（首候选若为 saveDraft 则串键） |
| **判** | 剧本 **承载**；Confirm 写库键 **半壳**（同 P0 根因） |
| **级** | 归入 **P0**（与 OA 同源） |

### 10. home · 壳

| 列 | 内容 |
|----|------|
| **业务故事** | 导航/待办壳，不单卖 |
| **屏上或剧本** | 总控：收目标→拆派→等回执→汇总；`command:null`；无 catalog |
| **代码证据** | `orchestrator` · `ExpertHitlBridge` 无 catalog→「总控席无写库确认闸」；`runFullChainDemo` 分派八席 |
| **判** | **N/A·壳**（编排承载，非 stage 办理） |
| **级** | — |

---

## 专家侧一览（是否空壳）

| 专家 | 四件套 | catalogAgentId | 主 handoff/命令 | 对 Stage | 判 |
|------|--------|----------------|-----------------|----------|-----|
| orchestrator | 有步骤；闸空；命令 null | `null` | 无写 | home/跨阶段 | 编排承载 |
| expert-search | 齐 | `agent-research` | `submitResearch` / research_report | research | **承载** |
| expert-mining | 齐 | `agent-research` ⚠️ | `createCaseFromInsight` | intake 残 | **半壳** |
| expert-disclosure | 齐 | `agent-disclosure` | disclosure_pack | inventor | **承载*** |
| expert-draft | 齐 | `agent-claims` | draft_claims | draft | **承载*** |
| expert-figure | 齐；命令 null | `agent-claims` | 事件挂章 | draft 辅 | **半壳** |
| expert-fto | 齐；命令 null | `agent-research` | 口径确认 | research/layout 松 | **半壳**（诚实只读） |
| expert-filing | 齐 | `agent-claims` ⚠️ | authorizeFile | draft 尾 | **半壳** |
| expert-oa | 齐 | `agent-oa` | prosecution_response | prosecution | **半壳*** |

\* Confirm 写库 payload handoff 硬编码见 P0。

---

## HITL / DomainCommand / catalog 接线笔记

| 点 | 证据 | 评 |
|----|------|-----|
| 真闸路径 | `ExpertHitlBridge` 绑 `createSession({agentId:catalogId})` → `SessionConfirmBar` → `sessionHitlAction` → `dispatchCommand` + `recordDomainCommandWrite` | 形状 **立住**（mock OK） |
| 总控/无 catalog | `catalogAgentId=null` → 弱确认/禁写 | 诚实 |
| FTO 无案 | 本地 ack「未写库」 | 诚实 |
| **写库键硬编码** | `saveDraft`→`draft_claims`；`submitHandoff`→`disclosure_pack` 无视席位 mid/handoff | **P0 串工件** |
| catalog 复用 | mining/fto/search→`agent-research`；filing/figure/draft→`agent-claims` | 会话 AgentDef/handoff 与席位声明易不一致 → P1 |
| 缺席 Catalog 资产 | `agent-intake` / `agent-annuity` / `agent-monetize` / `agent-watch` 未入 Pack | 授权后三台 + 立项双闸缺口 |

---

## Gap 表（只评不派工）

| ID | 级 | 现象 | 证据路径 |
|----|----|------|----------|
| G1 | **P0** | L3 Confirm 写库示意 **串 handoffKey**：OA/交底等席 `saveDraft`/`submitHandoff` 不跟 `patentMidMap` / 专家声明 | `apps/agent/src/components/projects/ExpertHitlBridge.tsx` ~217–231；对照 `patentMidMap.ts` · `expertsPatent.ts` expert-oa/disclosure |
| G2 | **P1** | Core 可卖 stage **maintain / monetize / watch** 在专利 DomainPack **零席**；全生命周期办理不可宣称 | `STAGE_MODULES` + `PATENT_PROJECT_EXPERT_IDS`；Catalog `agent-annuity|monetize|watch` 未引用 |
| G3 | **P1** | intake/decision：**无** `go_nogo`/`confirm_quote` 席；mining 绑 `agent-research` 非 `agent-intake` | `expertsPatent.ts` expert-mining；`src/data/agents.ts` agent-intake |
| G4 | **P1** | `catalogAgentId` 多席复用同一 Catalog Agent → 底层 session 的 `handoffKey`/`hitlGates` 与专家声明漂移 | `expertsPatent.ts` catalog 字段；`getAgent` in HitlBridge |
| G5 | **P1** | filing 挂 `agent-claims`；齐套/authorize 故事与 claims handoff 混绑 | `expertsPatent.ts` expert-filing L705 |
| G6 | **P2** | FTO mid=`layout_insight`/`drafting_assist` vs domain STAGES FTO∈`pre_research` | `patentMidMap.ts`；`packages/domain/src/stages.ts` |
| G7 | **P2** | layout 默认可卖=否；无专用专家 — 可接受为辅台债 | `STAGE_MODULE_SKU.md` |

**P0 计数：1**（G1）  
**P1 计数：4**（G2–G5）  
**P2 计数：2**（G6–G7，可选）

---

## 与规格对齐（防误杀）

| 规格主张 | 审计读法 |
|----------|----------|
| `agent-l3-patent` 全链路止于 OA（无 maintain/monetize/watch） | G2 是 **相对 SaaS STAGE_MODULES 的覆盖缺口**，不是「L3 自违约」；若产品口头说「专利 bot=全 stage 办理」则升格 |
| mock / 禁真递交 / FTO 不入库 | **不**判空壳；逻辑形状在即算承载/半壳 |
| 总控禁写库 | 已落实，加分 |
| inventor / disclosure ≠ draft claims | 专家剧本已分席；HitlBridge 硬编码反而破坏该分界 → G1 |

---

## 结论（给 Parent）

1. **文档路径**：`docs/audit/PATENT_BOT_STAGE_LOGIC_2026-09-19.md`  
2. **总判**：授权前主链有真办理形状（非 chat skin）；授权后三 Core stage 在专利 Pack 为空 → **集体未覆盖全 SaaS stage 办理**。  
3. **P0×1**：HitlBridge 写库 handoff 硬编码串工件。**P1×4**：后置三台空席；intake 双闸缺席；catalog 复用漂移；filing 绑 claims。  
4. **矩阵**：research✓ · intake△ · draft✓(+辅△) · prosecution△ · maintain∅ · monetize∅ · watch∅ · layout△ · inventor✓* · home=编排。

