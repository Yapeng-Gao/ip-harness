# Agent 入口 / 会话 / 项目 · UI 正式评估 · REVIEW_AGENT_ENTRY_2026-09-19

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **HEAD** | `ee34d63`（`dev` · `feat(agent): case-binding UX — optional case at entry, bind in workspace`）· **≥ ee34d63 ✓** |
| **日期** | 2026-09-19（Asia/Shanghai · 仓内时钟） |
| **范围** | **仅** Agent 壳 `http://127.0.0.1:5175` · `/agent` · `/agent/sessions` · `/agent/sessions/sess-oa-1` · `/agent/projects` · general/patent 工作区 · 顶栏 Persona/跨面 · 一瞥 `/agent/agents` · `/agent/harness` |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md`（冻结三 skill） |
| **Skills（全文已读）** | `apple-design` · `make-interfaces-feel-better`（+ sibling md）· `web-design-guidelines` |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-19** |
| **方法** | Playwright 真点击/键入/开菜单/建项目/绑案（**非**纯读代码）· `http://127.0.0.1:5175` HTTP 200 |
| **证据** | `docs/ui-polish/agent-entry-evidence/` · **31 PNG** |
| **本评总评** | **No-Go**（**P0=2 · P1=3 · P2=3**）· 入口双叙事与侧栏/主区抢权属真实产品债，不作 surface-Go |

---

## 0. 用户投诉焦点（必须显式回应）

| 投诉 | 本评结论 | 证据 |
|------|----------|------|
| **入口混乱 / 双「新建」叙事**（Home 聊天 vs Projects） | **成立 · P0-AE-1**。侧栏主钮「+ 新建会话」与 Home 中央大输入+「发送」同权；副文案写「默认通用单聊 · 项目模式（次级）」，同时侧栏「项目」与 Home 链「项目模式」仍构成第二套开工故事。 | `01-agent-home.png` · `01b-agent-home-input-filled.png` · `04-agent-projects-list.png` |
| **绑案可见性** | **半成立 · P1-AE-1**。Home 仅「关联案件（可选）」下拉 + 弱说明，**无**「创建并绑定新案 / 绑定已有」主路径按钮；工作区条可见且可点通，但偏「可选条」而非办理前置。 | `01-agent-home.png` · `05c-general-case-bind-none.png` · `10c-patent-nocase-bind-visible.png` · `06d`–`06f` |
| **侧栏 vs 主区层级** | **成立 · P0-AE-2 / P1-AE-2**。Home 左栏会话 Inbox（待确认角标）与中央「开工大输入」抢首屏；会话页三栏（会话列表 \| 轨迹+Confirm+绑案+Composer \| 上下文）主任务被挤。 | `01-agent-home.png` · `03-agent-session-sess-oa-1.png` · `03c-agent-session-confirmbar.png` |

---

## 1. 环境与抽检覆盖

| 路由 / 步骤 | HTTP / 交互 | 关键帧 |
|-------------|-------------|--------|
| `/agent` Home 大输入 / 新聊 | 200 · 填输入 · 扫竞品 CTA | `01` · `01b` · `01c` |
| `/agent/sessions` | 200 · 列表扫视 | `02` |
| `/agent/sessions/sess-oa-1` | 200 · Composer focus · ConfirmBar · 侧栏 | `03` · `03b` · `03c` · `03d` |
| `/agent/projects` · general vs domain/patent | 200 · 切换类型 · 创建 | `04` · `04b` · `04c` · `10` |
| General 工作区 · 研究/写作/审查 + 总控 · **无**专利步骤条 | 200 · 点「研究」· 绑案开合 | `05` · `05b` · `05c` · `05d` · `09` · `09b` |
| Patent 工作区 · 检索/撰稿/FTO + 总控 · 步骤条差异 | 200 · 建专利项目 · 绑案 · 已绑 | `06` · `06b`–`06f` · `10b`–`10d` |
| 无案路径 →「创建并绑定」/「绑定已有」 | 点击开合 · 专利完成绑定 | `05c`–`05d` · `06c`–`06f` · `10c`–`10d` |
| Topbar Persona / 跨面 · ConfirmBar | Persona 开 · 顶栏跨面 | `07` · `07c` · `03c` |
| `/agent/agents` · `/agent/harness`（一瞥） | 200 | `08` · `08b` |

**运行时**：`npm`/Vite agent `:5175` 已起；Playwright Chromium 1440×900。

---

## 2. 七维 + 附加分

| # | 维度 | 分 | 证据（URL + 图） | DS / 说明 |
|---|------|----|------------------|-----------|
| D1 | 信息层级与首屏「下一步」 | **2** | `http://127.0.0.1:5175/agent` · `01`/`01b` | **DS-UX-HABIT-01** 违规：侧栏「新建会话」与中央「发送」同权主 CTA；项目为「次级」文案但导航仍并列。找不到**单一**「现在该做什么」。 |
| D2 | 间距 / 密度 / 对齐 | **3** | `03` · `05` · `10b` | 4/8 大体在；会话三栏 + Confirm + 绑案 + Composer 垂直堆叠偏挤（DS-SPACE）。项目工作区相对干净。 |
| D3 | 视觉一致性 | **4** | `01` · `04` · `08` | navy/`cta-work` 主钮、surface 卡、amber 样机条可读；未见紫靛主 CTA（F1）。零星 one-off 密度。 |
| D4 | 流程内页质感 | **3** | `03c` · `05` · `10b` | `agent-*` / Confirm / 工具卡已抬升；会话内 Confirm+绑案+校验红字叠层仍「壳好看、办理带糙」。general **无**专利步骤条 ✓；patent 有 `1收目标…4汇总` ✓。 |
| D5 | 交互反馈 | **3** | `03c` · `06e` · `07` | Confirm 禁用旁有红字原因（**DS-DISABLED-01 方向对**）；绑案开合可点。Confirm **非 sticky dock**，长轨迹时可达性弱。Focus 主路径有 `.focus-ring` 痕迹。 |
| D6 | 文案可读与噪音 | **3** | `01` · `05` · `10b` | 样机诚实横幅多（DS-HONESTY 加分）但与工具卡英文 id、护栏句叠成墙；Home 副文案多层（Core/Assist/Beta + 单聊/项目）。 |
| D7 | 跨壳一致（本评仅 agent，抽顶栏） | **3** | `01c` · `07c` | 顶栏 IP Apps 分段与 mid 语言一致；右侧另见「作业中台 / 知产 Agent」浮层与顶部分段**双跳暗示**（F3 风险 · 记 P2）。 |
| **S1** | 风格统一 | **4** | `01`+`04`+`08` 并排 | 高频 btn/input/card 可追溯 DS-COMP；项目创建卡与会话扁卡略两套密度。 |
| **S3** | UX 习惯 | **2** | HABIT-01/02/05 抽检 | HABIT-01 **未过**；绑案 HABIT 空态有动作（工作区）但 Home 弱；待确认默认展开上下文（sess-oa-1 右栏开）尚可。 |

*S2 本评不单列全 Flow 木桶；Agent interiors 取 D4=3。*

**综合印象**：~**2.9 / 5**（表内整数如上）。

---

## 3. General vs Patent（必分清）

| | General | Patent / domain |
|--|---------|-----------------|
| 专家席 | 总控 + 研究 / 写作 / 审查 | 总控席 + 检索 / 撰稿 / FTO |
| 步骤条 | **无**专利步骤条（文案明示「通用项目 · 无专利步骤条」） | 有 `1收目标 → 2拆派 → 3等回执 → 4汇总` |
| 工具卡 | `GENERAL-ORCHESTRATOR` | `ORCHESTRATOR` + 领域分派 |
| 绑案权重 | soft / 可选条 | 同可选，但领域办理更依赖案（文案仍「可选」→ 摩擦） |
| 证据 | `05` · `05b` · `09` | `06` · `10b` · `10c` |

**结论**：类型分流在工作区**已落地**，不是同一套 UI 硬贴标签；入口层仍未帮用户先选「单聊 vs 项目 vs 专利包」。

---

## 4. P0 / P1 / P2

### P0（不过则不能 Go）

#### P0-AE-1 · 入口双「新建」同权叙事
| 字段 | 内容 |
|------|------|
| **severity** | P0 |
| **URL** | `http://127.0.0.1:5175/agent` · 对照 `…/agent/projects` |
| **问题** | 侧栏「+ 新建会话」与 Home 大输入「发送」同时扮演主开工；另有「项目模式（次级）」链与侧栏「项目」。用户无法一眼建立「唯一正确下一步」（DS-UX-HABIT-01 · apple-design Purpose/Simplicity · D1=2）。 |
| **验收标准** | （1）首屏**仅一个**视觉主 CTA 承载「开工」；（2）另一入口降为次级文案链或移入「更多」；（3）项目创建不得与「新建会话」同权并排于同一决策层；（4）截图复测 Home 无双 navy 主钮抢焦点。 |
| **证据** | `01-agent-home.png` · `01b-agent-home-input-filled.png` · `04-agent-projects-list.png` |

#### P0-AE-2 · Home 侧栏 Inbox 与主区「新聊」抢层级
| 字段 | 内容 |
|------|------|
| **severity** | P0 |
| **URL** | `http://127.0.0.1:5175/agent` |
| **问题** | 左栏「待确认」会话列表（强状态徽章）与中央空态开工同屏同权，扫视目标分裂：是处理 Inbox 还是开新聊？违反信息层级与 HABIT「首屏单一下一步」。 |
| **验收标准** | （1）Home 默认主区只服务「新办」或只服务「待确认」之一为 primary；（2）另一模式用计数 chip 深链到 `/agent/sessions?filter=…`，不在同屏用完整列表抢焦点；（3）复测首屏热区眼动只有一个主故事。 |
| **证据** | `01-agent-home.png` · `02-agent-sessions-list.png` |

### P1

#### P1-AE-1 · Home / 入口绑案可见性不足
| 字段 | 内容 |
|------|------|
| **Severity** | P1 |
| **URL** | `http://127.0.0.1:5175/agent` |
| **问题** | 仅有「关联案件（可选）」下拉与「可稍后创建或绑定」文案；投诉要求的「创建并绑定新案 / 绑定已有」在 **Home 不可见**，只在项目/会话工作区出现 → 无案路径认知断裂。 |
| **验收标准** | 无案时 Home 或发送后第一屏提供与工作区同文案的绑案双 CTA，或明确「发送后在会话顶栏绑定」的一步引导；复测无案用户不靠猜。 |
| **证据** | `01-agent-home.png` · `05c-general-case-bind-none.png` · `10c-patent-nocase-bind-visible.png` |

#### P1-AE-2 · 会话页 ConfirmBar 密度与可达性
| 字段 | 内容 |
|------|------|
| **Severity** | P1 |
| **URL** | `http://127.0.0.1:5175/agent/sessions/sess-oa-1` |
| **问题** | ConfirmBar（策略批准）夹在轨迹与绑案/Composer 之间，非视口 sticky；同屏还有校验红字、多 CTA、绑案三钮 → HITL 主路径易被挤出折线（DS-UX-HABIT-02/04 · DS-COMP-AGENT）。 |
| **验收标准** | ConfirmBar 在 `needs_human` 时 sticky 于主列底或顶且不与绑案抢同一视觉带；主 CTA 单一；禁用原因保留（已有红字须保留）。 |
| **证据** | `03-agent-session-sess-oa-1.png` · `03c-agent-session-confirmbar.png` |

#### P1-AE-3 · 专利无案仍标「可选」导致办理前置弱
| 字段 | 内容 |
|------|------|
| **Severity** | P1 |
| **URL** | `http://127.0.0.1:5175/agent/projects/<patent-id>` |
| **问题** | domain/patent 工作区绑案控件可见（✓），但文案仍「案件（可选）」；与写回中台/领域剧本预期冲突，摩擦来自**语义过软**而非按钮缺失。 |
| **验收标准** | patent 包下无案时用 info/warn 语气标明「写回中台前须绑定」；general 可保持 soft。 |
| **证据** | `10c-patent-nocase-bind-visible.png` · `06c-patent-case-bind-none.png` · `06f-patent-case-bound.png` |

### P2

| ID | 问题 | URL / 证据 | 验收要点 |
|----|------|------------|----------|
| **P2-AE-1** | 顶栏 IP Apps 分段之外，视口右侧再浮「作业中台 / 知产 Agent」→ 双跳暗示（F3） | `01c` · `07c` | 只留一套跨面切换 |
| **P2-AE-2** | 工具卡暴露 `dispatch_task` 等英文 id，偏调试墙字（F2） | `05` · `10b` | 产品面中文标签，id 进高级折叠 |
| **P2-AE-3** | `/agent/harness` 一瞥信息密、样机说明长 | `08b` | 目录页分层，默认折叠实验字段 |

---

## 5. 门禁裁决

| 门 | 本评 |
|----|------|
| **Go** | 否 · P0 未清 · D1=2 |
| **Conditional Go** | 否 · 入口混乱属结构性，演示会误导「该开聊还是开项目」 |
| **No-Go** | **是** · **P0-AE-1 / P0-AE-2 未过** · 符合 EVAL §5「任一 P0 未过 → No-Go」 |

**关闭 No-Go 最低集**：修 P0-AE-1 + P0-AE-2（统一入口主叙事 + Home 层级），并复测绑案 P1-AE-1 至少降级为「有引导」。P1-AE-2/3 可进 Conditional 波次。

---

## 6. Skills 对照

### apple-design（Emil）
| 点 | 观察 |
|----|------|
| Purpose / Simplicity | **未过** · 首屏多目的（Inbox + 新聊 + 项目次级） |
| Agency / Feedback | Confirm 有阻断原因 ✓；press 主钮有 `btn-press` 迹象 |
| Wayfinding | 「我在哪」靠侧栏图标尚可；「下一步唯一」失败 |
| Materials / depth | 顶栏 blur/白卡分层基本对 |

### make-interfaces-feel-better（Jakub）
| 点 | 观察 |
|----|------|
| 主次 CTA / 热区 | 双主钮 · **HIGH** |
| 密度 / 层级 | 会话三栏 + HITL 带 · **MEDIUM** |
| 光学对齐 / 圆角 | 大输入卡与 pill 尚可 · 未做 10% 动效逐帧 |
| tabular / 扫视 | 待确认计数可读；专利步骤数字可再强化 tabular |

### web-design-guidelines（Vercel · 2026-09-19 抓取）
| 点 | 观察 |
|----|------|
| Focus visible | 主路径控件有 focus-ring 方向 ✓ |
| Labels / 具体按钮文案 | 「批准策略」等具体 ✓；「发送」泛 |
| `transition: all` | 本评未全仓 rg；承接前波已清，不新开 |
| Icon-only aria | 侧栏图标带可见文案为主 |
| 破坏性确认 | HITL 有多步门，未见一键毁数据 |

---

## 7. 做得好的地方（避免只骂）

1. **general / patent 工作区语义已分开**（专家席 + 步骤条有无）——不是假标签。  
2. **工作区绑案双 CTA 真实可点**，专利路径可走到「已绑定」（`06f`）。  
3. **ConfirmBar 禁用有原因**（DS-DISABLED-01 方向正确）。  
4. **样机诚实**（无真 LLM / Confirm→DomainCommand）符合 DS-HONESTY-01。  
5. **Persona / 租户顶栏**可达（`07`）。

---

## 8. 证据索引

目录：`docs/ui-polish/agent-entry-evidence/`（**31** PNG）

```
01-agent-home.png
01b-agent-home-input-filled.png
01c-agent-home-topbar.png
02-agent-sessions-list.png
03-agent-session-sess-oa-1.png
03b-agent-session-composer-focus.png
03c-agent-session-confirmbar.png
03d-agent-session-sidebar.png
04-agent-projects-list.png
04b-projects-create-general.png
04c-projects-create-domain-patent.png
05-project-general-workspace.png
05b-general-bot-研究.png
05c-general-case-bind-none.png
05d-general-case-bind-create-open.png
06-project-patent-workspace.png
06b-patent-bot-总控.png
06c-patent-case-bind-none.png
06d-patent-case-bind-existing-open.png
06e-patent-case-bind-create-open.png
06f-patent-case-bound.png
07-topbar-persona-open.png
07c-cross-surface-links.png
08-agent-catalog.png
08b-agent-harness.png
09-created-general-project.png
09b-created-general-case-bind.png
10-projects-form-patent-selected.png
10b-created-patent-project.png
10c-patent-nocase-bind-visible.png
10d-patent-bind-existing-friction.png
```

辅助：`_notes.txt`（DOM 摘录，非评分依据）。

---

## 9. 分数速览

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S3 |
|----|----|----|----|----|----|----|----|----|
| 2 | 3 | 4 | 3 | 3 | 3 | 3 | 4 | 2 |

**Verdict: No-Go** · P0: `P0-AE-1`, `P0-AE-2` · P1: `P1-AE-1`, `P1-AE-2`, `P1-AE-3` · P2: `P2-AE-1`–`3`

---

*只文档与证据；未改 apps/contracts；未 git commit/push；未启 Cloud Agent。*

---

## 复评附注（2026-09-19）

短复评见 **`REVIEW_AGENT_ENTRY_RECHECK.md`** · HEAD `3fc2827` · 点名 **P0-AE-1/2 · P1-AE-1/2/3 全 PASS** → **Go**。证据：`docs/ui-polish/agent-entry-recheck/`。
