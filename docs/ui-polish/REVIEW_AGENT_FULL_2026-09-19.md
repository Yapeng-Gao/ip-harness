# Agent 全壳 · UI / 布局 / UX 正式评估 · REVIEW_AGENT_FULL_2026-09-19

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **HEAD** | `3fc2827`（`dev` · `fix(agent): close Agent entry P0/P1 gates (single CTA, Home hierarchy)`）· **as-is ✓** |
| **相对** | 评审过程中从 `335c0ca` 前进到 `3fc2827`；**:5175 实机已含 ENTRY 修复**（单主 CTA / Home 层级 / Confirm sticky dock / patent 须绑）。本评**不以 ENTRY 关单代替全壳 Go**。 |
| **日期** | 2026-09-19（Asia/Shanghai） |
| **范围** | Agent 壳全路由：`/agent` · `/agent/sessions` · `/agent/sessions/sess-oa-1` · `/agent/projects` · `proj-demo-general` · `proj-demo-patent` · `/agent/agents` · `/agent/harness` · 断点 ~1440 / ~1280 |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md` |
| **Skills（全文已读）** | `apple-design` · `make-interfaces-feel-better`（+ `typography` / `surfaces` / `animations` / `icons` / `performance`）· `web-design-guidelines` |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-19** |
| **方法** | Playwright Chromium 真导航/点击 bot 席/滚内栏 · `getBoundingClientRect` 量栏宽高 · HTTP 200 · **非**纯读代码 |
| **证据** | `docs/ui-polish/agent-full-evidence/` · **33 PNG** + 测量 JSON |
| **先验** | `REVIEW_AGENT_ENTRY_2026-09-19.md`（No-Go · **P0-AE-1 / P0-AE-2**）— 本评**引用**但**不复述为唯一债**；新开 `AF-L-*` / `AF-V-*` / `AF-X-*` |
| **本评总评** | **No-Go**（新 **P0-AF-1** HITL dock 高度霸占；ENTRY 入口项在本 HEAD 已明显缓解但仍见残留层级竞争）· Conditional 亦不可宣称 |

---

## 1. Meta

### 1.1 HEAD / 运行时

- `git rev-parse HEAD` → `3fc2827af47c38fcbfccb286e1fccdcd08759f53`（父 `335c0ca`）
- Vite `http://127.0.0.1:5175` · `/agent` → **200**（实机已含 ENTRY fix）
- Viewport 主测：**1440×900**；对照：**1280×800**

### 1.2 抽检覆盖

| 路由 | 交互 | 关键帧 |
|------|------|--------|
| `/agent` Home | 顶栏 / 侧栏 / 主 compose / CTA 计数 | `01` · `01b` · `01c` · `01d` · `09b` |
| `/agent/sessions` | 列表密度 | `02` |
| `/agent/sessions/sess-oa-1` | **三栏** · Confirm · Composer · 上下文轨 · 内滚 · dock 解剖 | `03`–`03e` · `10` · `11` · `09` · `09e` |
| `/agent/projects` | 列表 / 创建面板 | `04` · `04b` · `09d` |
| `…/proj-demo-general` | bot 席 · 无专利步骤 · 绑案 soft · 工具卡 · 时间线 | `05c`–`05f` |
| `…/proj-demo-patent` | 步骤条 · 绑案 warn · 检索/总控 · 英文 id | `06c`–`06h` |
| `/agent/agents` Catalog | 卡密度 · 侧栏并存 | `07` · `07b` · `09c` |
| `/agent/harness` | 运行时墙 / 行密度 | `08` · `08b` |

### 1.3 关键实测数字（1440 / 1280）

| 度量 | 1440×900 | 1280×800 |
|------|----------|----------|
| `.shell-aside` 宽 | **224** | **224** |
| `.agent-aside` 宽 | **320**（`w-72` / `xl:w-80`） | **320**（不缩） |
| 中栏可用宽 | **896** | **736** |
| `.agent-hitl-dock` 高 | **383**（sticky bottom） | **383** |
| 其中 `.confirm-hitl` | **173** | **173** |
| dock 内 Composer 带 | **~210** | **~210** |
| 轨迹 scroller 高 | **347** | **247** |
| `confirm-hitl` `border-radius` | **`0px`** | 同 |
| 禁用原因节点数 | **2**（同文案重复） | 同 |
| `body` 可滚 + 内栏 scroller | **是**（双滚） | 同 |

证据：`_dock-anatomy.json` · `_squeeze-1280.json` · `_measure-session-oa1-*.json` · `11-hitl-dock-anatomy.png`

---

## 2. 七维 1–5 + 附加 + 门禁

| # | 维度 | 分 | 证据 | DS / 说明 |
|---|------|----|------|-----------|
| D1 | 信息层级与首屏「下一步」 | **2** | `01` · `_home-cta` | Home 主 CTA 已收敛为「开始办理」（单 navy · ENTRY 修复方向对），但 **待确认 chip + 项目模式 + 推荐卡启动** 仍多故事；会话页 HITL 与 Composer 同 dock 抢「现在该做什么」。 |
| D2 | 间距 / 密度 / 对齐 | **2** | `03` · `09` · `11` | 三栏 224+896+320；1280 中栏挤到 736 而右栏仍 320。**HITL dock 383px** 吃掉 ~43% 视口 → 轨迹仅 247–347px。项目工作区中栏空旷、composer 贴底折线（`top≈872`）。 |
| D3 | 视觉一致性 | **3** | `03` · `07` · `06c` | navy/`cta-work`、surface 卡大体服从 token；**Confirm `radius: 0`（F7）**；工具卡英文 id（F2）；字阶出现 **10px** 分段标签（低于 `--font-size-caption` 12）。 |
| D4 | 流程内页质感 | **3** | `03c` · `05d` · `06c` | `agent-*` / Confirm / 项目步骤条已抬升；会话内 dock 叠层与 catalog/harness「会话 Inbox 常驻」仍显办理带糙。general **无**专利步骤 ✓；patent 有 `1收目标…4汇总` + 写回须绑案 warn ✓。 |
| D5 | 交互反馈 | **3** | `10` · `11` · `_focus-probe` | Confirm 禁用有原因（**DS-DISABLED-01 方向对**）但 **原因双份**；`.focus-ring` / `btn-press` 可见；样本控件存在 **`transition: all`（F4）**；Confirm sticky **有**（经 `.agent-hitl-dock`）但因过高而伤害可达性。 |
| D6 | 文案可读与噪音 | **3** | `06c` · `07` · `08` | 样机诚实横幅加分；`dispatch_task` / `GENERAL-ORCHESTRATOR` / Assist 长 disclaimer 成墙；Catalog 卡脚 meta 挤。 |
| D7 | 跨壳一致（本评 agent + 顶栏） | **3** | `01` · `07` · `08` | 顶栏 IP Apps 分段与 mid 语言接近；视口右侧再浮「作业中台 / 知产 Agent」→ **F3 双跳暗示**（承接 ENTRY P2-AE-1）。 |
| **S1** | 风格统一 | **3** | `01`+`03`+`07` | 高频 btn/card 可追溯；Confirm 0 半径与会话扁卡/项目空区两套密度。 |
| **S2** | 深内页（Agent interiors） | **2** | sess-oa-1 · projects · catalog | 木桶：会话 HITL dock / 轨迹高度为最低项。 |
| **S3** | UX 习惯 | **2** | HABIT-01/02/04 | HABIT-01 入口仍弱；HABIT-02 Confirm 虽 sticky 但与 Composer 同带；tip/原因叠层。 |

**综合印象**：~**2.6 / 5**。

### 门禁

| 门 | 本评 |
|----|------|
| **Go** | 否 |
| **Conditional Go** | 否 · 仍有全壳 **P0-AF-1** |
| **No-Go** | **是** |

关闭 No-Go 最低集：**P0-AF-1**（HITL dock 瘦身 / Confirm 与 Composer 解耦）。ENTRY 入口项建议用 `agent-entry-recheck` 正式关单；残留 Home「待确认」chip 竞争可降为 P1。其余 P1 可进 Conditional 波次。

---

## 3. 布局专章

### 3.1 栅格与栏宽

- **壳侧栏**固定语义宽 ~`lg:w-56` → 实测 **224px**（Home / Sessions / Catalog / Harness 一致）。
- **会话右栏** `.agent-aside`：`w-72`（288）/ `xl:w-80` → 实测 **320px**；**1280 不断档隐藏、也不收缩** → 中栏从 896→**736**（−18%）。
- **项目工作区**左项目树 **224** + 右时间线 **224**；中栏名义宽裕，但垂直被 banner + 步骤 + 工具卡切碎，日志区大块留白、composer 贴视口底（`top: 872` / `vh: 900`）。

**债**：`AF-L-1` 右栏固定宽导致 1280 中栏挤压（见 §7）。

### 3.2 滚动与 sticky

- 会话页：`document` **可滚**（`docScrollH: 957 > 900`）+ 轨迹 `overflow-y-auto` + 右栏 artifact editor 自滚 → **双（多）滚**。
- `.agent-hitl-dock` = `position: sticky; bottom: 0; z-20`；子级 `.confirm-hitl` 自身为 `relative`（非 sticky）——sticky **生效在 dock 容器**，不是 Confirm 单卡。
- 问题不在「有没有 sticky」，而在 **sticky 容器过高（383）**：轨迹可视高度被压到 247–347px，长 OA 轨迹几乎无法扫视。

**债**：`AF-L-2`（P0）· `AF-L-3` 双滚。

### 3.3 折行 / 空态 / 三栏竞争

- 左 Inbox 长标题 truncate（会话名 + Inbox 徽章）在 224 宽下挤。
- 项目右「项目时间线」窄栏单条种子事件，空态偏「未发生」而非「下一步」。
- Catalog / Harness **仍挂完整会话 Inbox 侧栏** → 浏览目录时三栏叙事（Inbox | Catalog | —）与「选 Agent 启动」竞争（`AF-L-5`）。
- Home 中区 compose 居中留白大，与侧栏「待确认 · 3」抢扫视（承接 AE-2）。

### 3.4 断点

| 断点 | 观察 |
|------|------|
| 1440 | 三栏可演示，但 dock 已过高 |
| 1280 | 右栏 320 不让步；轨迹 **247px**；HITL 主路径演示风险高 → **breakpoint debt**（`AF-L-1`） |

未测 &lt;1024；`agent-aside` 有 `hidden … lg:flex`，更窄时应收拢，但 1280 仍 `lg` 全开。

---

## 4. UI 专章（token / 字阶 / 色 / 圆角 / 阴影 / press / focus）

| 主题 | 观察 | 条款 |
|------|------|------|
| Token / 主色 | 主 CTA navy；accent 选中轨可见；未见紫靛主 CTA | DS-COLOR · F1 ✓ |
| 字阶 | Confirm 内部分段标签实测 **10px**；策略 textarea `text-[11px]` — 低于 caption 12 | DS-TYPE-01 · `AF-V-2` |
| 圆角 | **`.confirm-hitl` `border-radius: 0px`**；dock 父级亦 0 — 产品面硬直角 | **F7** · `AF-V-1` |
| 阴影 | dock 下半 Composer 带有上投影 `shadow-[0_-4px_…]`；卡 rest 大体克制 | DS-SHADOW |
| Press | `btn-press` / `active:scale` 痕迹在主钮 | DS-MOTION · apple Response |
| Focus | `.focus-ring` 在主路径；输入 soft ring 方向对 | DS-FOCUS-01 |
| Motion | 样本约 **9** 个控件 `transition-property: all` | **F4** · `AF-V-3` |
| Catalog 卡 | `agent-picker-card` ~376×190；Assist/Beta 卡更高（211–226）disclaimer 挤 | `AF-V-4` |
| 工具卡 | `dispatch_task` / `summarize_timeline` / `open_expert_dm` 裸露 | F2 · `AF-V-5` |

同心圆角：Confirm 0 半径直接违规；项目内嵌 pill 与外卡大体可用，未做全页半径审计。

---

## 5. UX 专章（流程 / 反馈 / 可达 / 错误禁用 / HITL）

### 5.1 流程

- Home：「开始办理」单一 navy ✓（相对 ENTRY 有改善迹象），但推荐卡「启动」与「待确认」仍分流。
- Sessions：Inbox → 会话 → Confirm 路径清晰，执行时被 dock 高度打断。
- Projects：general / patent **语义分流已落地**（步骤条有无、专家席名、patent 写回须绑案 warn）✓。
- Catalog / Harness：双入口「启动 Agent」与侧栏「新建会话」并存。

### 5.2 反馈与可达

- 禁用原因文案正确（「请先选争点类型并填策略要点」）但 **DOM 内出现 2 次**（Confirm 内 + Composer 旁）→ 噪音（`AF-X-1`）。
- 分段「批准策略」圆点 + 按钮「批准策略」**同名双 affordance**（`AF-X-2`）。
- sticky dock 本意提升 HITL 可达；因叠 Composer，**批准区与新办输入同带**，违反「关键默认展开且不与次要带抢」（HABIT-02/04）。

### 5.3 错误 / 禁用 / HITL

- `agent-confirm-cta` disabled + `.agent-confirm-reason` → **DS-DISABLED-01 方向通过**。
- 「授权递交」灰显可读。
- 补充项折叠「陈述/争点 · Full-check」混中英，增加扫视成本。

### 5.4 绑案

- Patent：黄条「写回中台前须绑定」✓（相对 ENTRY P1-AE-3 有改善）。
- General：仍「案件（可选）」soft — 可接受差异。
- Home：已见「创建并绑定新案 / 绑定已有案」（相对 ENTRY P1-AE-1 有改善迹象）；是否关单待 ENTRY 复测。

---

## 6. Relation to ENTRY

| ENTRY ID | 本评状态 | 说明 |
|----------|----------|------|
| **P0-AE-1** 入口双新建叙事 | **明显缓解（`3fc2827`）** | Home 实测仅 **1** 个 navy「开始办理」；侧栏 Home 不再并排「新建会话」主钮。会话/Catalog 侧栏仍有「新建会话」— 建议 ENTRY 复测关单，本评不重开 P0。 |
| **P0-AE-2** Home Inbox vs 新聊抢权 | **部分缓解 / 残留** | 完整 Inbox 列表已弱化；仍保留「待确认 · 3」chip 与中央开工同屏竞争 → 建议降 P1 由 ENTRY 复测裁定。 |
| P1-AE-1 绑案可见性 | **缓解** | Home 可见「创建并绑定 / 绑定已有」 |
| P1-AE-2 Confirm 非 sticky | **形态变化 → 新债** | 经 `.agent-hitl-dock` sticky，但 **过高（383px）** → 「可达却挤死轨迹」= **P0-AF-1** |
| P1-AE-3 patent「可选」过软 | **缓解** | 黄条「写回中台前须绑定」 |
| P2-AE-1 双跳 | **仍在** | `AF-X-4` |
| P2-AE-2 英文 id | **仍在** | `AF-V-5` |
| P2-AE-3 harness 墙 | **仍在** | `AF-L-6` / P2 |

**本评新增 ID 前缀**：`AF-L-*` 布局 · `AF-V-*` 视觉 · `AF-X-*` UX；门禁级用 `P0-AF-*` / `P1-AF-*` / `P2-AF-*`。

---

## 7. P0 / P1 / P2

### P0

#### P0-AF-1 · HITL dock 过高：Confirm + Composer 同 sticky 带（新）

| 字段 | 内容 |
|------|------|
| **Severity** | **P0** |
| **URL** | `http://127.0.0.1:5175/agent/sessions/sess-oa-1` |
| **问题** | `.agent-hitl-dock` sticky 高 **383px**（Confirm 173 + Composer/Agent 选择带 ~210）。1440 轨迹仅 **347px**，1280 仅 **247px**。HITL「批准策略」虽留在视口，但主轨迹无法扫视、补充项/争点上下文被挤出——办理决策缺少上文。违反 DS-COMP-AGENT「blocker 不得落折线」精神与 apple Wayfinding。 |
| **验收** | （1）`needs_human` 时 Confirm **单独** sticky，高度目标 ≤ ~180–200px；（2）Composer / Agent 切换移出 dock 或默认折叠；（3）1440 轨迹 scroller ≥ ~480px，1280 ≥ ~360px；（4）复测截图 dock 不再吞近半屏。 |
| **证据** | `11-hitl-dock-anatomy.png` · `03-agent-session-sess-oa-1.png` · `09-session-1280.png` · `_dock-anatomy.json` · `_squeeze-1280.json` |

#### P0-AE-1 / P0-AE-2（ENTRY · 本 HEAD 已明显缓解 · 不重复开单）

见 `REVIEW_AGENT_ENTRY_2026-09-19.md` 与提交 `3fc2827`。本评 **不以全壳 Go 代替 ENTRY 正式复测关单**；全壳 No-Go 由 **P0-AF-1** 独立成立。

---

### P1

#### P1-AF-1 · `AF-L-1` 三栏右轨固定 320：1280 中栏挤压

| 字段 | 内容 |
|------|------|
| **URL** | `…/agent/sessions/sess-oa-1` @ 1280 |
| **问题** | 左 224 + 右 320 固定，中栏 736；上下文轨不参与收缩。 |
| **验收** | &lt;1440 时右栏改 `w-64` / 可折叠抽屉；或 `xl` 才 320。中栏 ≥ 820 @1280 或右栏收为 icon rail。 |
| **证据** | `09-session-1280.png` · `_squeeze-1280.json` · `_three-col-1280.json` |

#### P1-AF-2 · `AF-L-3` 双滚（body + 轨迹 + artifact）

| 字段 | 内容 |
|------|------|
| **URL** | `…/sess-oa-1` |
| **问题** | `bodyScroll: true` 且轨迹 / artifact 各自 overflow — 滚轮落点不可预测。 |
| **验收** | 壳 `h-screen` + `overflow-hidden`；仅轨迹列与右栏各自一滚；body 不滚。 |
| **证据** | `_measure-session-oa1-1440.json` · `03b` · `03e` |

#### P1-AF-3 · `AF-X-1` 禁用原因双份渲染

| 字段 | 内容 |
|------|------|
| **URL** | `…/sess-oa-1` |
| **问题** | `.agent-confirm-reason` 同文案出现 **2** 次（Confirm 内 + Composer 旁）。 |
| **验收** | 全局仅一处 block 原因；另一处删除或改为 aria-live 不重复可见。 |
| **证据** | `11-hitl-dock-anatomy.png` · `_dock-anatomy.json` · `_focus-probe.json` |

#### P1-AF-4 · `AF-V-1` Confirm / dock `border-radius: 0`（F7）

| 字段 | 内容 |
|------|------|
| **URL** | `…/sess-oa-1` |
| **问题** | 实测 `border-radius: 0px` — 禁止产品面硬直角。 |
| **验收** | Confirm 容器 ≥ `--radius-md`；与父 dock 同心（DS-RADIUS-02）。 |
| **证据** | `_dock-anatomy.json` · `10-session-confirm-closeup.png` |

#### P1-AF-5 · `AF-L-5` Catalog / Harness 常驻会话 Inbox 侧栏

| 字段 | 内容 |
|------|------|
| **URL** | `http://127.0.0.1:5175/agent/agents` · `/agent/harness` |
| **问题** | 选 Agent / 看运行时仍铺满「待确认」列表，目录主任务被 Inbox 抢宽。 |
| **验收** | Catalog/Harness 默认收起会话列表或改为窄 icon rail；需要时再展开。 |
| **证据** | `07-agent-catalog.png` · `08-agent-harness.png` |

#### P1-AF-6 · `AF-X-2` HITL「批准策略」双控件同名

| 字段 | 内容 |
|------|------|
| **URL** | `…/sess-oa-1` |
| **问题** | 步进圆点「批准策略」与主按钮「批准策略」并存，认知重复。 |
| **验收** | 步进用状态名（「待批准」）或只保留一处可点主 CTA。 |
| **证据** | `11-hitl-dock-anatomy.png` · `03c` |

---

### P2

| ID | 映射 | 问题 | URL / 证据 | 验收要点 |
|----|------|------|------------|----------|
| **P2-AF-1** | `AF-V-2` | Confirm 内 10px / 11px 字阶低于 caption | `11` · `_dock-anatomy` | ≥12px（`--font-size-caption`） |
| **P2-AF-2** | `AF-V-3` | 样本 `transition: all` | `_focus-probe` | 枚举属性（F4） |
| **P2-AF-3** | `AF-V-5` | 工具卡裸露 `dispatch_task` 等 | `05d` · `06c` | 中文标签；id 进「高级」 |
| **P2-AF-4** | `AF-V-4` | Catalog Assist/Beta 卡 disclaimer 墙 | `07` · `07b` | 卡内 line-clamp；详情进抽屉 |
| **P2-AF-5** | `AF-L-4` | 项目 composer `top≈872` 贴折线 | `05d` · `06c` · `_patent-layout` | composer sticky 底或缩短中区留白 |
| **P2-AF-6** | `AF-L-6` | Harness「运行时」+ Agent 列表 + 侧栏 Inbox 信息密 | `08` · `08b` | 默认折叠最近会话 / 实验字段 |
| **P2-AF-7** | `AF-X-4` | 顶栏分段 + 浮层「作业中台/知产 Agent」双跳 | `01` · `07` | 只留一套（F3） |
| **P2-AF-8** | — | 项目时间线单事件空态无下一步 | `05d` · `06c` | 空态 + 动作（「分派给…」） |

---

## 8. Skills 对照

### apple-design（Emil）

| 点 | 观察 |
|----|------|
| Purpose / Simplicity | **未过** · 会话页 Confirm+Composer+Inbox 多目的；Catalog 双栏抢权 |
| Response / Feedback | 主钮 press / 禁用原因有；原因双份抵消清晰度 |
| Wayfinding | 顶栏/侧栏「我在哪」尚可；「下一步唯一」在 HITL dock 失败 |
| Materials / depth | 顶栏分层基本对；Confirm **0 半径**破坏材料感 |
| Agency | Confirm 多出口（批准/退回/Inbox）尚可；勿迫使误点灰钮 ✓ |

### make-interfaces-feel-better（Jakub）

| 点 | 观察 |
|----|------|
| 密度 / 层级 | HITL dock · **HIGH** → P0-AF-1 |
| 同心圆角 | Confirm 0 · **HIGH** |
| `transition: all` | 样本命中 · **MEDIUM** |
| 字阶 / tabular | 10px 标签 · **MEDIUM**；步骤数字可再 tabular |
| Scale on press | `btn-press` 方向对 |
| 光学对齐 | 未做 10% 动效逐帧；侧栏徽章与截断标题挤 |

### web-design-guidelines（Vercel · 2026-09-19 抓取）

| 点 | 观察 |
|----|------|
| Focus visible | 主路径 `.focus-ring` ✓ |
| 具体按钮文案 | 「批准策略」「开始办理」具体 ✓；部分「启动」泛 |
| `transition: all` | 命中 · 记 P2-AF-2 |
| Icon-only aria | 主侧栏有可见文案；样本空文按钮探测有噪音（chip 误计）— 不升 P0 |
| 破坏性确认 | HITL 门控 ✓ |
| 长内容 truncate / min-w-0 | 侧栏标题截断存在；中栏长文尚可 |
| prefers-reduced-motion | 本评未专项拨系统开关 · **Not verified** |

---

## 9. 做得好的地方

1. **general / patent 工作区语义真实分流**（步骤条、专家席、patent 绑案 warn）。  
2. **Confirm 禁用有内联原因**（DS-DISABLED-01 方向正确）。  
3. **样机诚实**（无真 LLM / Confirm→DomainCommand）符合 DS-HONESTY-01。  
4. **HITL 已接入 sticky dock 容器**（意图正确；执行过量）。  
5. **Home 主 CTA 呈现为单 navy「开始办理」**（相对 ENTRY 双 navy 有改善迹象）。  
6. **Skip link「跳到主要内容」存在**（a11y 加分）。

---

## 10. 证据索引

目录：`docs/ui-polish/agent-full-evidence/`（**33** PNG）

```
01-agent-home.png
01b-agent-home-topbar-sidebar.png
01c-agent-home-compose-filled.png
01d-agent-home-remeasure.png
02-agent-sessions-list.png
03-agent-session-sess-oa-1.png
03b-agent-session-scrolled.png
03c-agent-session-composer-focus.png
03d-agent-session-three-columns.png
03e-session-after-inner-scroll.png
04-agent-projects-list.png
04b-projects-create-panel.png
05c-general-casebind.png
05d-general-workspace.png
05e-general-bot-研究.png
05f-general-timeline-tools.png
06c-patent-workspace.png
06d-patent-bot-检索.png
06e-patent-bot-总控.png
06f-patent-casebind-bar.png
06g-patent-timeline-tools.png
06h-patent-full.png
07-agent-catalog.png
07b-agent-catalog-scrolled.png
08-agent-harness.png
08b-agent-harness-scrolled.png
09-session-1280.png
09b-home-1280.png
09c-catalog-1280.png
09d-projects-1280.png
09e-session-1280-dock.png
10-session-confirm-closeup.png
11-hitl-dock-anatomy.png
```

辅助测量（非评分主证据）：`_dock-anatomy.json` · `_squeeze-1280.json` · `_measure-*.json` · `_three-col-*.json` · `_focus-probe.json` · `_catalog-density.json` · `_harness-wall.json` · `_patent-layout.json` · `_home-cta.json` 等。

---

## 11. 分数速览

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 |
|----|----|----|----|----|----|----|----|----|----|
| 2 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 2 | 2 |

**Verdict: No-Go**

| 级 | 计数 | IDs |
|----|------|-----|
| **P0（新 · 挡 Go）** | **1** | `P0-AF-1`（`AF-L-2`） |
| **P0（ENTRY）** | **0 新开** | `P0-AE-1/2` 本 HEAD 缓解 · 待 ENTRY 复测关单 |
| **P1（新）** | **6** | `P1-AF-1`…`P1-AF-6` |
| **P2（新）** | **8** | `P2-AF-1`…`P2-AF-8` |

---

*只文档与证据；未改 apps/contracts；未 git commit/push；未启 Cloud Agent。*
