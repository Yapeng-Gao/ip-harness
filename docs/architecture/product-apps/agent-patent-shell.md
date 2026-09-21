> **变更摘要（2026-09-21 · B席）**：与 [agent-layers](./agent-layers.md) **双产品冷启动**对齐——本文件管**专利产品** `/agent`→Catalog；通用沙盒 L1 为旁路。禁 mining→intake 别名。
> **变更摘要（2026-09-21）**：本文 Catalog 花名册 = 专利 Domain Pack 的 **子集/过渡**；完整 **16 席 · F1–F9 · HITL×8** 见 [../domain-packs/patent-pack-design.md](../domain-packs/patent-pack-design.md)。目标态：规则层裁判 + Handoff 信封 + Pack HITL。端用户**仍禁** mid 可点深链。平台 [../agent-platform.md](../agent-platform.md)。
# 专利 Agent 壳重做（仅专利 · 过程可见）

> **冻结（用户开令）**：优化样机 **仅专利**，勿以通用助手为主路径。  
> 参考专利全链路 bot：**任用效果**、**双文件**（成果 + 过程可见）、席间 **loop/互通**；补上「过程可见」。  
> **样机诚实**：假数据/假文件树；Confirm→DomainCommand 示意；禁真 LLM / 真 case-core / 可点跳 mid。  
> **对齐**：[agent-l3-patent](./agent-l3-patent.md) · [project-cross-surface](./project-cross-surface.md) · [agent-l2-team](./agent-l2-team.md) · STAGE_MODULES。  
> **花名册权威材料**（已入库副本）：[SEAT_ROSTER](./patent-drill-ref/SEAT_ROSTER_FOR_PROTOTYPE.md) · [OWNER 矩阵](./patent-drill-ref/OWNER_DELIVERABLE_MATRIX.md) · [过程可见](./patent-drill-ref/PROCESS_VISIBILITY.md)。  
> **关系**：本文 = **专利产品壳 IA 主规格**；旧 L1 默认 / 自由 L2 主路径 → **降级或旁路**（见 §1）。

## 1. 默认入口 = 专利 Catalog

| 优先级 | 路由（建议） | 说明 |
|--------|--------------|------|
| **默认冷启动** | `/agent` → **专利 Catalog** | 多专家可勾选组队；「新建专利项目」主 CTA |
| 单聊 | `/agent/seats/:seatId` 或 Catalog 点席 | 与一席一对一 |
| 组队项目 | `/agent/projects/:id` | 固定/已组花名册 + 案目录双文件 |
| Grok 式群聊 | `/agent/projects/:id/room`（或等价） | bot↔bot 自发 + loop |

**废止 / 降级（本产品）**：

- ~~默认 L1 单助手（Kimi/ChatGPT）当主路径~~ → 若保留，藏到「通用沙盒」次级入口，**非**专利冷启动  
- ~~自由 L2（自设任意 bot）当主路径~~ → 专利壳用 **Catalog 席位**，不可随意改成营销 bot  
- 旧文 [agent-layers](./agent-layers.md) / [agent-entry-modes](./agent-entry-modes.md) 的「默认 L1」对 **本壳** 让位于本文  

仍遵守：[project-cross-surface](./project-cross-surface.md)——**从建项目起**；**禁止专家截入**（勿冷启动直进 OA/递交）。

## 2. 三种交互

| 模式 | 用户心智 | 行为 |
|------|----------|------|
| **A · 单聊** | 「我只找检索员问一件事」 | 一对一消息流；仍显示该席步骤条 + 双面板（可空） |
| **B · 组队项目** | 「这是一个案子的专家专班」 | 侧栏席位列表；总控拆派；各席独立线程；共享案目录 |
| **C · Grok 式群聊** | 「让他们自己传话把链路跑完」 | 同一 room：bot→bot **自发消息** + **loop**（回执→再派下一席）；用户可插话 |

A/B/C 可切换，但 **共享同一 `projectId` / 案目录**（有项目时）。无项目时 A 可先聊，创建项目后再沉淀双文件。

### Loop（样机）

```text
（可选）landscape∥inspire∥competitor → mining → layout
总控派 research → 双文件（成果+worklog）
  → intake（吃 01–06）→ go_nogo Confirm
  → disclosure → draft → figure∥fto → filing(authorize→file)
  → 仅总控派 oa
用户随时可：暂停 loop / 改派 / 打开某席单聊
```

对齐 [agent-l2-team](./agent-l2-team.md) 的 `BotMessage.spontaneous`，但是 **专利席剧本**，非自由 bot。

## 3. 每席 UI：步骤条 + 成果 + 过程（双文件心智）

```text
┌─────────────────────────────────────────────┐
│ 席名 · Owner 标签                            │
│ ●步骤1 → ●步骤2 → ○步骤3 …（业务步骤条可见）   │
├──────────────────┬──────────────────────────┤
│ 消息流 / 群聊    │ 右栏（可 Tab）             │
│                  │ ① 成果面板 = NN_*.md       │
│                  │ ② 过程面板 = NN_*_worklog  │
└──────────────────┴──────────────────────────┘
```

| 面板 | 对齐演练 | 样机行为 |
|------|----------|----------|
| **成果** | `NN_<artifact>.md` | 可滚动 Markdown；Confirm 后标「已交卷」 |
| **过程 / worklog** | `NN_*_worklog.md` | 逐步追加（检索式、判断、待确认）；**默认可见**，勿只藏成果 |
| **步骤条** | 该席「过程」阶段 | 当前步高亮；失败/pending 可标色 |

案目录（项目内）：

```text
cases/<caseOrProject>/
  07_intake_quote.md + 07_intake_quote_worklog.md
  08_disclosure_pack.md + 08_disclosure_pack_worklog.md
  09_draft_claims.md + …
  10_figure_list.md + …
  11_fto_memo.md + …
  12_filing_checklist.md + …
  13_prosecution_response.md + …
  06_research_report.md + …   # 编号可按所内规范微调，但必须双文件成对
```

样机可用内存/虚拟 FS；**不要求**真 docx，但总控验收心智 = 双文件齐（缺 worklog = 不合格，对齐 PROCESS_VISIBILITY）。

### 3.1 过程可见硬规则（并入 PROCESS_VISIBILITY）

| 规则 | 说明 |
|------|------|
| 交卷 = 成果 + 过程 | 缺 `NN_*_worklog.md` → 总控打回，不派下家 |
| worklog 最低章 | 收到什么 / 目标 / **步骤时间线** / **关键取舍≥2** / 证据 / 卡点 / 交给下家 |
| 聊天 | 摘要须指到 worklog 步骤编号；禁止只有「已落盘」 |
| 多轮 | 追加不覆盖；R 轮可用 `…_R2_worklog.md` |
| 案级 | 可选 `00_case_worklog.md`（分派/验收/闸门时间线） |

步骤条 UI ↔ worklog「步骤时间线」同行号；成果面板 ↔ `NN_*.md`；过程面板 ↔ worklog（**默认打开过程 Tab 或双栏并显**）。

## 4. 席位花名册（并入 SEAT_ROSTER · 全表）

示意流（花名册）：`全景∥激发∥竞品 → 挖掘 → 布局 → 查新 → 立项(Go) → 交底 → 撰写 → 制图∥FTO → 递交(authorize→file) → OA（未 file 不派）`。

| Catalog id | 展示名 | 成果键 → 文件 | worklog | contracts / 闸 | Catalog 默认勾 |
|------------|--------|---------------|---------|----------------|----------------|
| `orchestrator` | 专利全链路总控 | `case_state` / 时间线 | `00_case_worklog.md` | 不写 handoff；验收双文件 | ✓ 必选 |
| `expert-landscape` | 产业全景 | `landscape_report` → `01_…` | `01_…_worklog` | 提案键（**勿写死 packages**） | 立项前簇 · 可选 |
| `expert-inspire` | 创新激发 | `inspire_brief` → `02_…` | 同键 worklog | 提案键 | 可选 |
| `expert-competitor` | 竞品监控 | `competitor_watch` → `03_…` | 同键 | 提案键 | 可选 |
| `expert-mining` | 专利挖掘 | `mining_pack` → `04_…` | 同键 | 提案键（≠旧「立项」） | 可选 |
| `expert-layout` | 专利布局 | `layout_plan` → `05_…` | 同键 | 可对齐 `layout_insight` 心智；提案键 | 可选 |
| `expert-research` | 检索员（查新暨三性） | `research_report` → `06_…` | 同键 | **`research_report`** | ✓ 主链 |
| `expert-intake` | 立项决策 | `intake_quote` → `07_…` | 同键 | **`intake_quote` + `go_nogo`** | ✓ 主链 |
| `expert-disclosure` | 交底整理 | `disclosure_pack` → `08_…` | 同键 | **`disclosure_pack`** | ✓ 主链 |
| `expert-draft` | 撰写代理师 | `draft_claims` → `09_…` | 同键 | **`draft_claims`** | ✓ 主链 |
| `expert-figure` | 制图对接 | `figure_list` → `10_…` | 同键 | **无**独立 handoff key（辅） | ✓ 建议 |
| `expert-fto` | FTO律师 | `fto_memo` → `11_…` | 同键 | **无**独立 key（辅；≠三性） | ✓ 建议 |
| `expert-filing` | 递交流程员 | `filing_checklist` → `12_…` | 同键 | authorize→file 闸 | ✓ 主链 |
| `expert-oa` | OA答复代理师 | `prosecution_response` → `13_…` | 同键 | **`prosecution_response`**；**仅已 file** | ✓ 主链 |


> **Pack 对齐**：上表为样机 Catalog（含立项前簇与主链）。目标 Pack 另含年费管家 / 价值评估师 / 转化顾问 / 无效维权顾问（F7–F9）；`expert-fto` 仍为辅席，**不等于** Pack「无效维权顾问」。实现蓝图见 [../domain-packs/patent-pack-impl.md](../domain-packs/patent-pack-impl.md)。

上游/下游以 [SEAT_ROSTER](./patent-drill-ref/SEAT_ROSTER_FOR_PROTOTYPE.md) 为准。  
Owner / 过程要点 / 产出标题以 [OWNER 矩阵](./patent-drill-ref/OWNER_DELIVERABLE_MATRIX.md) 为准。  
`01–05` 产出键为**演练/样机约定**；写入 `@ip/contracts` 须另开刀，本壳只认文件名与 Catalog id。

并行：制图 ∥ FTO（权要确认后）。OA **禁**未 file 直派；递交回执后**仅总控**派 OA。

工作台 maintain/monetize/watch 与 Pack F7–F9 缺口见 [agent-l3-patent](./agent-l3-patent.md) / Pack；**F9 无效维权 ≠ `watch` 监测预警**（不借用 `watch_alert`）。

每席四件套：工具 · 剧本 · DomainCommand 候选 · 护栏。写库须 HITL。

### 4.1 Owner 摘要（并入矩阵）

| 席 | Owner（对谁负责） | 任务一句话 |
|----|-------------------|------------|
| 产业全景 | 战略/IP 决策 | 赛道全景支撑是否立项 |
| 创新激发 | 发明人/研发 | 收敛可专利方向 |
| 竞品监控 | IP/法务 | 对手威胁分级 |
| 专利挖掘 | IP/研发 | 拆可申请提案 |
| 专利布局 | IP 决策 | 主从案与保护网 |
| 检索员 | 合伙人/撰写 | 查新+三性意见书 |
| 立项决策 | 客户/IP 负责人 | Go/范围（报价附属） |
| 交底整理 | 撰写代理师 | 可实施交底书 |
| 撰写代理师 | 客户/质检 | 特征→权要+说明书（R1–R5） |
| 制图对接 | 撰写/递交 | 附图任务与冻图号 |
| FTO律师 | 业务/法务 | 自由实施+claim chart≥2 |
| 递交流程员 | 代理师/总控 | 齐套→authorize→file |
| OA答复 | 客户/发明人 | OA 策略与陈述 |
| 总控 | 用户/平台 | 分派、双文件验收、闸门、迭代 |

## 5. Catalog 组队

- Catalog 页：勾选席位 →「组成专班并建项目」  
- **默认勾选**：总控 + 主链（查新→立项→交底→撰写→递交→OA）+ 建议勾制图/FTO  
- **立项前簇**（全景/激发/竞品/挖掘/布局）：Catalog 可选，默认可不勾；勾选后可并行于查新前  
- 组队后进入模式 B；可一键开模式 C room  
- **不可**把席改成无关身份；**不可**无项目冷启动截入 OA

## 6. 与旧规格关系

| 旧文 | 本刀后 |
|------|--------|
| agent-layers L1 默认 | 专利壳 **不适用**；通用旁路可选 |
| agent-grok-replica | 视觉可借鉴到模式 C，但内容=专利席 |
| agent-l3-patent | **席位/handoff 权威**仍有效；UI/入口以本文为准 |
| 944dc8b「暂不融入样机」 | **被本开令覆盖**：Agent **按本文实现**专利壳 |

## 7. 验收

- [ ] `/agent` 冷启动 = 专利 Catalog（非通用单助手墙）  
- [ ] 三种交互均可进入；C 有 bot 自发 loop（mock）  
- [ ] 每席：步骤条 + 成果面板 + worklog 面板（过程默认可见）  
- [ ] 席名/文件键对齐 SEAT_ROSTER（含 01–13 + 总控）  
- [ ] 双文件成对；worklog 含步骤表+关键取舍；缺过程不可「交卷」  
- [ ] Owner 标签可见（矩阵）  
- [ ] 从建项目/组队起；禁专家截入；OA 仅 file 后  
- [ ] 无真 LLM/case-core；01–05 不假装已写入 contracts  

## 8. Owner

规格：架构设计 · 实现：Agent应用助手（只改 `apps/agent`）  
