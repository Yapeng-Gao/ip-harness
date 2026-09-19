# L3 专利领域 bot（中台对接 · 全链路 · 对齐工作台）

> **冻结**：L3 = 专利领域 bot；产出对接**中台/工作台**节点（壳内映射 + DomainCommand 示意）。  
> **入口**：仅 `/agent/projects`（顶栏「专利项目」）；从**创建项目**起；**禁止专家截入**。  
> **勿污染** L1 / L2。Agent **不可跳中台**验收。  
> **样机诚实**：禁真 LLM / 真 case-core；**勿臆造**写入 `packages/contracts`。  
> **对齐**：[project-cross-surface](./project-cross-surface.md) · [workbench STAGE_MODULES](../../apps/workbench/src/stages/index.ts) · `ARTIFACT_FOR_STAGE` · [agent-case-binding](./agent-case-binding.md)。

## 1. 入口（禁止截入）

| 做 | 不做 |
|----|------|
| 顶栏「专利项目」→ 创建/打开项目 → 总控拆派 | 冷启动直进 OA/递交/撰稿席 |
| 链路从前端起：调研 → 立项 → … | 无 `projectId` 的裸专家当主路径 |

详见 [project-cross-surface](./project-cross-surface.md)。

## 2. 专家席命名 / 口径（对齐 SaaS）

> 演练席已改名：调研 / 立项。壳内 **展示名**跟下表；`id` 以本表为准（旧 `expert-search`/`expert-mining` 作别名可兼容一版）。

| id（冻结） | 展示名 | 对齐 STAGE_MODULES | 产出口径 | 闸/备注 |
|------------|--------|-------------------|----------|---------|
| `orchestrator` | 总控 | — | 拆派/汇总 | 不写 handoff |
| `expert-research` | **调研** | `research` · `pre_research` | **`research_report`** | 形状对齐调研台 |
| `expert-intake` | **立项** | `intake` · `decision` | **`intake_quote`** | 须 **`go_nogo`** HITL 才算定稿/推进 |
| `expert-disclosure` | 交底整理 | `inventor`（disclosure） | **`disclosure_pack`** | 发明人交底门户同键 |
| `expert-draft` | 撰稿 | `draft` · `drafting` | **`draft_claims`** | ≠ 交底席 |
| `expert-figure` | 附图 | （辅） | **无**现成 `HandoffArtifactKey` | **辅席**；见 §3 |
| `expert-fto` | FTO | （辅） | **无**现成 key | **辅席**；见 §3；≠ `layout` 台 |
| `expert-filing` | 递交/形式 | draft→authorize/file 闸 | 齐套清单（无独立 key） | 禁真递交；闸+HITL |
| `expert-oa` | OA答复 | `prosecution` | **`prosecution_response`** | |

**兼容别名（可选）**：`expert-search`→`expert-research`；`expert-mining`→`expert-intake`。

### mock 剧本（可点）

| id | 剧本摘要 |
|----|----------|
| `expert-research` | 主题 → 假检索要点 → 填 `research_report` 结构 → Confirm |
| `expert-intake` | 吃调研回执 → 披露要点/报价草案 → Confirm + **`go_nogo`** |
| `expert-disclosure` | 技术点 → 背景/方案/效果/实施例提纲 → Confirm |
| `expert-draft` | 交底要点 → 假权利要求/摘要 → Confirm |
| `expert-figure` | 应补框图/流程图清单 → 版本占位（不真画） |
| `expert-fto` | 特征→命中→风险高/中/低→规避一句 → 报告 Confirm（默认不入库） |
| `expert-filing` | 国别/齐套/形式点 → 清单 Confirm |
| `expert-oa` | 假审查意见 → 争辩/修改/证据 → Confirm |

## 3. 附图 / FTO：辅席 · 无现成 HandoffArtifactKey

| 席 | 现状 | 文档立场 |
|----|------|----------|
| `expert-figure` | contracts **无**附图专用 key | **辅席**：产出挂在 `disclosure_pack` / `draft_claims` **附件示意**；**提案**未来可选 `figure_asset`（**仅文档提案，本刀不改 packages**） |
| `expert-fto` | **无** FTO 专用 key；勿把 FTO 写成 `layout_insight` | **辅席**：报告默认内存；入库须另命令+HITL。`layout_insight` 属工作台 **layout** 台，**不是** FTO |

## 4. STAGE_MODULES ↔ L3 专家映射表

| STAGE_MODULES `id` | SKU / stageId | `HandoffArtifactKey` | L3 专家 | 业务逻辑对齐 |
|--------------------|---------------|----------------------|---------|--------------|
| `research` | `wb.stage.research` / `pre_research` | `research_report` | **`expert-research`** | 调研报告 |
| `intake` | `wb.stage.intake` / `decision` | `intake_quote` | **`expert-intake`** | 立项+`go_nogo` |
| `inventor` | `wb.portal.inventor` | `disclosure_pack` | **`expert-disclosure`** | 交底结构 |
| `draft` | `wb.stage.draft` / `drafting` | `draft_claims` | **`expert-draft`** | 权利要求 |
| `prosecution` | `wb.stage.prosecution` | `prosecution_response` | **`expert-oa`** | OA答复 |
| `layout` | `wb.stage.layout` | `layout_insight` | **（暂无 bot）** | 布局洞察台；≠ FTO |
| `maintain` | `wb.stage.maintain` / `maintenance` | `maintain_annuity` | **缺口：暂无 bot** | 年费维持 |
| `monetize` | `wb.stage.monetize` / `commercialization` | `monetize_terms` | **缺口：暂无 bot** | 运营变现 |
| `watch` | `wb.stage.watch` / `monitoring` | `watch_alert` | **缺口：暂无 bot** | 监测预警 |
| — | — | — | `expert-figure` | 辅席 · 无独立 key |
| — | — | — | `expert-fto` | 辅席 · 无独立 key |
| — | authorize/`file` 闸 | — | `expert-filing` | 递交形式 · 无独立 key |
| — | — | — | `orchestrator` | 编排 |

权威源：`apps/workbench/src/stages/index.ts` 的 `STAGE_MODULES` + `packages/contracts` 的 `ARTIFACT_FOR_STAGE`。

## 5. 产出 ↔ 写库示意（contracts 已有键）

| 专家 | HITL 后写候选（示意） |
|------|------------------------|
| `expert-research` | `submitResearch` / `submitHandoff`（`research_report`） |
| `expert-intake` | `submitHandoff`（`intake_quote`）+ 清 **`go_nogo`** |
| `expert-disclosure` | `submitHandoff`（`disclosure_pack`） |
| `expert-draft` | `saveDraft` / `submitClaims` |
| `expert-oa` | `saveDraft` / `submitHandoff`（`prosecution_response`） |
| `expert-filing` | 提案 `authorize` / `file`（须闸）；禁真递交 |
| figure / fto | 默认不写案；见 §3 |

**本刀不改** `packages/contracts` / `packages/domain`。新 key 仅 §3 提案级。

## 6. 可点路径（从建项目起）

```text
1. 创建专利项目（/agent/projects）
2. 总控从前端拆派：research → intake(go_nogo) → disclosure → draft → …
3. 辅席 figure/fto 可穿插，不冒充主 handoff
4. Confirm → DomainCommand 壳内示意
5. 禁止：无项目直进专家；禁止可点 mid
```

## 7. 验收

- [ ] 展示名：调研 / 立项（非「检索/挖掘」当主名）  
- [ ] `research_report` / `intake_quote`+`go_nogo` 口径正确  
- [ ] figure/fto 标辅席且无伪造 contracts key  
- [ ] §4 映射表含 maintain/monetize/watch/layout **缺口**  
- [ ] 从建项目起；无专家截入；不污染 L1/L2  

## 8. Owner

规格：架构设计 · 壳：Agent应用助手  
