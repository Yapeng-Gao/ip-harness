# 专利 Agent 壳重做（仅专利 · 过程可见）

> **冻结（用户开令）**：优化样机 **仅专利**，勿以通用助手为主路径。  
> 参考专利全链路 bot：**任用效果**、**双文件**（成果 + 过程可见）、席间 **loop/互通**；补上「过程可见」。  
> **样机诚实**：假数据/假文件树；Confirm→DomainCommand 示意；禁真 LLM / 真 case-core / 可点跳 mid。  
> **对齐**：[agent-l3-patent](./agent-l3-patent.md) · [project-cross-surface](./project-cross-surface.md) · [agent-l2-team](./agent-l2-team.md) · STAGE_MODULES。  
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
总控派 research → [result]+双文件
  → 自发派 intake（吃上游成果路径）
  → go_nogo Confirm 闸
  → disclosure → draft → …（可截短演示）
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

样机可用内存/虚拟 FS；**不要求**真 docx，但总控验收心智 = 双文件齐。

## 4. 席位（对齐专利全链路角色）

| Catalog id | 展示名 | 主成果文件（示意） | handoff / 闸（已有 contracts） | 辅？ |
|------------|--------|-------------------|-------------------------------|------|
| `orchestrator` | 专利全链路总控 | 编排时间线 | 不写 handoff | |
| `expert-research` | 检索员（查新暨三性） | `06_research_report.md` | `research_report` | |
| `expert-intake` | 立项决策 | `07_intake_quote.md` | `intake_quote` + **`go_nogo`** | |
| `expert-disclosure` | 交底整理 | `08_disclosure_pack.md` | `disclosure_pack` | |
| `expert-draft` | 撰写代理师 | `09_draft_claims.md` | `draft_claims` | |
| `expert-figure` | 制图对接 | `10_figure_list.md` | **无**独立 key（辅席） | ✓ |
| `expert-fto` | FTO律师 | `11_fto_memo.md` | **无**独立 key（辅席；≠三性） | ✓ |
| `expert-filing` | 递交流程员 | `12_filing_checklist.md` | authorize/file 闸示意 | |
| `expert-oa` | OA答复代理师 | `13_prosecution_response.md` | `prosecution_response` | |

可选 Catalog 扩展（非默认焊死）：产业全景等——**另席**，不挡主链路。  
缺口（工作台有、默认 Catalog 暂无）：maintain / monetize / watch / layout——见 [agent-l3-patent §4](./agent-l3-patent.md)。

每席仍四件套：工具 · 剧本 · DomainCommand 候选 · 护栏。写库须 HITL。

## 5. Catalog 组队

- Catalog 页：勾选席位 →「组成专班并建项目」  
- 默认勾选主链路（总控+调研+立项+交底+撰写+递交+OA）；附图/FTO 默认勾可选  
- 组队后进入模式 B；可一键开模式 C room  
- **不可**把席改成无关身份（专利壳固定角色）

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
- [ ] 席名对齐全链路角色；双文件成对出现在案目录示意  
- [ ] 从建项目/组队起；禁专家截入  
- [ ] 不污染「通用沙盒」以外的中台跳转；无真 LLM/case-core  

## 8. Owner

规格：架构设计 · 实现：Agent应用助手（只改 `apps/agent`）  
