> **变更摘要（2026-09-21 · 原型定稿）**：按「只做原型、不做真沙箱」收紧——轨 C 出局；P1 必验 D1–D3+D5+D6（D4 可选）；P2 先打透 **查新+立项+撰写** 三席；四资产仅 mock 可感知档；Lab/P3 不挡深度验收。
> **变更摘要（2026-09-21 · 深度与可靠优化）**：诊断根因 = **共享剧本薄 + 壳叠层多**；优化钉 **共享深度层**，查新为样板。
# Agent 深度与可靠 · 优化规格（原型定稿）

> **状态（2026-09-21）**：**P0–P6 已落样机** · 可演示；**非**平台施工单。  
> **定位**：今日只做 Vite 原型；mock **须像真办过一趟** ≠ 真检索 / 真沙箱 / 真 KB。  
> **目标全景（不进本轮验收）**：[../incoming/AgentOS-design-docs-v1.1/](../incoming/AgentOS-design-docs-v1.1/) · [bot-expert-assets](../incoming/AgentOS-design-docs-v1.1/bot-expert-assets.md) · [线框](../incoming/AgentOS-design-docs-v1.1/agent-platform-ui-wireframes.md)。  
> **范围**：`apps/agent` 共享专家深度 + 办活可靠体验。  
> **叠前序勿回退**：[agent-business-mode](./agent-business-mode.md) · [agent-seat-as-bot](./agent-seat-as-bot.md) · [agent-biz-case-ia](./agent-biz-case-ia.md) · [agent-layers](./agent-layers.md) · [agent-patent-shell](./agent-patent-shell.md) · [agent-pack-loops-roadmap](./agent-pack-loops-roadmap.md)。

---

## 1. 一句话

**加深专家脑，不加深壳；不做真沙箱。** 业务席与 L3 共用同一套 `expertsPatent`；Team / Lab / 平台真件不进本轮深度预算。

---

## 2. 现状诊断（钉死）

| 现象 | 根因 | 非根因 |
|------|------|--------|
| 查新席「说不了啥 / 很快交卷」 | `expertsPatent` 每席约 3～4 步、script ~40 字、tool.preview 一行假数据 | 业务 IA 两栏 / 单一 CTA |
| 卡在「去确认」、不能继续聊 | **全案任一 pending → 锁干活 chip**（故意闸） | 查新剧本还有未跑分支 |
| 觉得 Team 不靠谱 | L2 无步骤机 / 无双文件 / 无 HITL 写库 | 应拿 Team 当领域深度 |
| 觉得进 Project 会更深 | L3 **remount 同一 seed**；多的是 mid map / validator UI / room | Project ≠ 更深专家 |

```text
同一专家脑 ──┬── 业务壳：进度同源 · pending 锁 · progressive 双文件
             ├── L3 壳：mid map · Pack HITL walk · DomainCommand 形状 · room
             └── Catalog：扩席入口（写回同一 caseId=projectId）

L2 Team：协作预演 only —— 不进深度 KPI
真沙箱 / Harness / 商业库：AgentOS 目标 · 本轮 Out of scope
```

**结论**：主战场 = **共享深度层内容质量**（不是加步骤空壳，也不是上平台）。

---

## 3. 三条轨（原型裁剪）

| 轨 | 名称 | 本轮 | 说明 |
|----|------|------|------|
| **A** | 样机深度层 | **主刀** | `expertsPatent` + deliverables + progressive；查新样板 → 三席打透 |
| **B** | 壳与演示编排 | **轻量、不挡 A** | pending 锁解释文案必做；Lab 五幕 / 顶栏折叠 = P3，可后置 |
| **C** | 平台真能力 | **Out of scope** | 真沙箱 / Driver / harness / 真 KB / 真检索 API —— 见 [agent-platform-gap](./agent-platform-gap.md)；**口播禁止承诺「下一步就上沙箱」** |

**推荐组合（已钉）**：演示优先变体 = **A(查新) → B(pending 文案) → A(三席) →（可选）P3 Lab**；不做轨 C。

---

## 4. 目标与非目标

### 4.1 目标

1. **查新席**达到「半页可扫读的一趟检索+三性」（§6）；业务页与 Project **同步**变深。  
2. **可靠**：进度 / pending / 双文件同源；锁干活有明示，确认后进度诚实前进。  
3. **三席打透**：查新 → 立项 → 撰写 达深度必验条；其余默认席可暂留短剧本（对外口播仍诚实）。  
4. **期望管理**：对外说清「mock 像真办一趟 ≠ 真引擎」。

### 4.2 非目标（本轮 · 钉死）

- 真 LLM、真专利检索 API、**真沙箱**、真 harness、真商业库 / 真 KB。  
- 把 `/agent` 冷启动改回 L1/L2；冷启动进 Catalog 16 席或 Team 墙。  
- 业务壳与 L3 各写一套剧本。  
- 用更多入口 / Lab 卡片伪装「更深」。  
- 取消 pending 锁干活（可调文案，**不**废闸）。  
- P1 未过就铺开全部 7 席加深（防浅复制）。  
- 对齐线框「签批队列」整页改版（本轮 **不改名不改布局**；仅席内 + pending 解释）。  
- Bot 工坊 / 组队中心 / 流程模拟器（线框有、样机可 Lab 占位，不进主刀）。

---

## 5. 分层职责

| 层 | 职责 | 深度 KPI | 可靠 KPI |
|----|------|----------|----------|
| **共享深度层** | `expertsPatent` + `patentDeliverables` + 逐步 `structuredPreview` | 可扫读产物 · 一步一产出 | 末步才 `triggersHitl` |
| **业务壳** | 开新活 · 席=bot · 单一 CTA · pending | 消费 progressive 双文件 | 同源闸 + 锁的解释句 |
| **L3 Project 壳** | mid map · Pack walk · DomainCommand 形状 · room | **禁止**另写剧本；双文件改用同一 progressive API | Confirm 宇宙唯一 |
| **Catalog** | 7 / 更多 / 全表；加席回本案 | 无独立剧本 | 同 `projectId` |
| **L2 Team** | 能力预演 | 不考核 | 诚实只读 |
| **Lab** | 内部导航 | 不挡 A 验收 | 文案对齐业务默认（P3） |

---

## 6. 深度条 · 可靠条（原型验收）

### 6.1 深度条

| # | 条 | P1 查新 | P2 立项/撰写 | 说明 |
|---|----|---------|--------------|------|
| **D1** | 步骤 ≥ 5（含交卷） | **必验** · 目标 6 步 | **必验** · ≥5 | 禁「加空步」凑数 |
| **D2** | 每步可检视结构化产出 | **必验** | **必验** | 表/列表/结论块进成果或会话卡 |
| **D3** | 双文件随步真长 | **必验** | **必验** | 业务 + L3 **同一** progressive builder |
| **D4** | 人可介入（改口/重跑） | **必验** | **必验** | 点已走步骤 / 说「回到第2步」 |
| **D5** | 交卷前成果可扫读 | **必验** | **必验** | 半页意见书级；禁只剩一行 preview |
| **D6** | 工程词默认藏 | **必验** | **必验** | `?debug=1` 可展 |

**内容质量铁律**：加深 = **写好 mock 文案与表格**，不是堆步骤数。6 个空步骤仍判不合格。

### 6.2 可靠条（跨壳 · 全程必验）

| # | 条 |
|---|----|
| R1 | 案进度只经 `advanceSeatWork` / 确认推进 |
| R2 | pending → 主 CTA「去确认」· 干活 chip 藏 · **会话内一句为何锁** + 确认项标题 |
| R3 | 确认后：本席 done + 主链前进 + 双文件可回看交卷版 |
| R4 | L3 与业务同 `caseId=projectId` |
| R5 | 未确认不 `dispatchCommand` 正式写 |

---

## 7. AgentOS 四资产 · 原型 mock 档

对齐 [bot-expert-assets](../incoming/AgentOS-design-docs-v1.1/bot-expert-assets.md)，**本轮只做可感知 mock**：

| 资产 | 原型做到 | 不做 |
|------|----------|------|
| ① SOP | 加长步骤机 + 专业口吻 script | 真 prompt 工程 / 真 LLM |
| ② KB | **一张「样例卡」占位**（如：同义词/检索式模板各 1 例展示） | 假库大 UI / RAG |
| ③ 工具 | 结构化卡片（检索式块、命中表、风险一句） | 真 `patent_search` API |
| ④ Validator | **轻量示意**：交卷前一行「覆盖度检查 · Pass」或 L3 既有 Fail→Pass 读到结构化字段 | 真规则引擎 / 自修复闭环产品化 |

---

## 8. 样板席 · 查新（`expert-research`）

### 8.1 步骤机（6 步 · P1）

| 步 | id | 标签 | 人可见产出（mock 须像真） | P1 人可介入 |
|----|-----|------|---------------------------|-------------|
| 1 | `scope` | 划定检索范围 | 技术要点 3～5 条 + 拟检索字段 | 只读展示即可 |
| 2 | `query` | 检索式 | 主式 + 2 备用式 + 布尔逻辑一句 | 改口重跑 = 点步骤 / 「回到第2步」 |
| 3 | `hits` | 命中清单 | 表：公开号 / 标题 / 相关度 / 初判（≥5 行） | 只读 |
| 4 | `cluster` | 聚类对比 | 2～3 簇 + 代表文献 | — |
| 5 | `novelty` | 三性意见草稿 | X/Y/A 对照表 + 风险一句 | 只读 |
| 6 | `report` | 报告确认 · 交卷 | 半页摘要 + worklog 关键取舍；`triggersHitl` | — |

handoff = `research_report`；Confirm 对齐现有查新结论类。

### 8.2 内容源（单写多读）

```text
expertsPatent['expert-research']     ← 步骤 + script + structuredPreview
patentDeliverables[…]                ← 成果/worklog 骨架（随步填充）
共享 progressive builder             ← 业务 BusinessSeatWorkbench + L3 SeatDualFilePanel
```

**禁止**：只在业务壳写死文案；L3 另开加长 script。

### 8.3 pending 闸体验（随 P1 必做 · 属轨 B 最小集）

| 钉 | 口径 |
|----|------|
| 会话提示 | 「本案有待确认 · 确认后本席才能继续」+ 确认项标题 |
| 主 CTA | 「去确认 · …」 |
| 只读 | 可翻成果/过程；禁干活 chip |
| 禁止 | 静默锁；确认后跳步 |

---

## 9. P2 三席打透（其余暂缓）

| 席 | id | P2 | 深度条 |
|----|-----|-----|--------|
| 查新 | `expert-research` | P1 已过则计打透 | D1–D3+D5+D6 |
| 立项 | `expert-intake` | **本轮必做** | 同上 · ≥5 步；评分卡/区别特征表 mock |
| 撰写 | `expert-draft` | **本轮必做** | 同上 · ≥5 步；权项层级/术语表 mock |
| 交底 / 附图 / 递交 / 审查答复 | … | **暂缓**（可保持短剧本） | 不挡对外演示主线 |

对外口播：主路径演示 **查新→立项→撰写**；其余席「流程在、深度后续加」。

---

## 10. 演示搭配

| 幕 | 路由 | 深度层 | 口播 |
|----|------|--------|------|
| 0 | `/sandbox`→`/team` | 否 | 可跳；非默认 |
| 1 | `/agent`→查新 6 步→pending | **是** | 主演示 |
| 2 | `/catalog` | 同脑 | 可跳 |
| 3 | room / L3 project | 同脑 | 对内：壳差不是脑差 |
| 4 | pending 确认 | — | 确认才前进 |

精简对外：**幕 1 + 4**（约 12 min）。

---

## 11. 派工阶段（收紧后）

| 阶段 | 交付 | 验收 | 是否挡演示 |
|------|------|------|------------|
| **P0** | 本文定稿 | 产品已收紧认可 | — |
| **P1** | 查新 6 步 + progressive 共用 + pending 解释句；L3 同席同步 | D1–D3+D5+D6 + R1–R5；成果 tab 截图可扫读 | **主验收 · 2026-09-21 已落样机** |
| **P2** | 立项 + 撰写 达同一深度条 | 两席 D1–D3+D5+D6 | **2026-09-21 已落** |
| **P2b** | 交底 + 附图 + 递交 + 审查答复 | 默认 7 业务席全 DEEP（总控除外） | **2026-09-21 已落** |
| **P2c** | Catalog「更多」席加深 | 17 席 DEEP；仅 orchestrator 浅 | **2026-09-21 已落** |
| **P2d** | 成果/办理过程 Markdown 渲染 | `SeatMarkdownBody`（GFM 表）· UI 壳不变 | **2026-09-21 已落** |
| **P2e** | 会话气泡人话 + Markdown | 禁裸 API id；助理含 structuredBody | **2026-09-21 已落** |
| **P3** | Lab 五幕导航；去「L1 当前默认」 | 与业务冷启动一致 | **2026-09-21 已落** |
| **P4** | D4 改口重跑（步骤条 + 对话口令） | 回退清本席 pending · 成果收短 | **2026-09-21 已落** |
| **P5** | 跨席 feedback（F5/F6/F9 外循环边） | 撰写↔交底/查新 · 附图↔撰写 · 递交↔撰写/附图 · OA↔查新/撰写 · 维权→布局 · 查新/立项回流 | **2026-09-21 已落** |
| **P6** | 席内 loop 可聊可点 | 自修复 / 缺项追问 / OA N通·理由 / HITL 驳回 · 过程+会话 | **2026-09-21 已落** |

**文件触点**：

- 主改：`expertsPatent.ts` · `patentDeliverables.ts` · progressive（`seatStepBodies.ts` 或上提）  
- 消费：`BusinessSeatWorkbench.tsx` · L3 双文件面板 / `ProjectChatPane`  
- 文案：pending 提示；P3 才动 `AgentLabGallery` / README  
- **不改**：mid · packages（除非 Confirm 元数据缺口）· 真沙箱相关一切  

---

## 12. 禁止清单

- 业务 / L3 两套剧本。  
- 空步骤凑 D1。  
- 废 pending 锁或未确认推进主链。  
- 口播「我们马上上真沙箱」。  
- P1 未过铺开 7 席。  
- 本轮改签批队列整页 IA。  
- 端用户可点 mid 深链办活。

---

## 13. 成功标准

> 打开业务案「查新」，不确认也能在成果 tab **扫读出一趟像样的检索与三性**；锁干活时知道去确认什么；确认后进度前进。立项、撰写同样可扫读。Project 里是**同一份脑**。全程无真沙箱、也不假装有。

---

## 14. 风险与对策

| 风险 | 对策 |
|------|------|
| 步骤多但仍空 | 验收盯 D2/D5 文案表，不盯步数 |
| 加深后更常撞 pending | P1 捆绑 R2 解释句 |
| 期望滑向真平台 | 文首 + 轨 C Out of scope；口播纪律 |
| 7 席一起浅复制 | P2 只三席；其余暂缓 |

---

## 15. 回链

| 文 | 关系 |
|----|------|
| [agent-business-mode](./agent-business-mode.md) | 冷启动 / 7 席 / 待确认 |
| [agent-seat-as-bot](./agent-seat-as-bot.md) | 席会话 / 交卷 HITL |
| [agent-biz-case-ia](./agent-biz-case-ia.md) | 两栏 / 单一 CTA / 藏工程词 |
| [agent-layers](./agent-layers.md) | L1/L2/L3；Team≠深度 |
| [agent-platform-gap](./agent-platform-gap.md) | 真沙箱等差距 · **本轮不施工** |
| [../incoming/AgentOS-design-docs-v1.1/](../incoming/AgentOS-design-docs-v1.1/) | 目标全景快照 |
| [bot-expert-assets](../incoming/AgentOS-design-docs-v1.1/bot-expert-assets.md) | 四资产台账 · 本轮 mock 档见 §7 |
