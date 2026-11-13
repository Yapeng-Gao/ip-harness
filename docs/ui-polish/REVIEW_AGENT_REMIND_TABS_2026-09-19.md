# Agent 提醒 · 左侧 Tab 设计债 · REVIEW_AGENT_REMIND_TABS_2026-09-19

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **HEAD** | `5cee2ad`（`dev` · `docs(ui): AGENT_LOOP_HUNT SHA 对齐 hunt 接线提交`）· **as-is ✓** |
| **日期** | 2026-09-19（Asia/Shanghai · ~11:08 CST） |
| **范围 CHANGE** | **Agent shell :5175 ONLY** · Mid 复评已取消 · **不**扫 mid/wb/ops |
| **用户原话** | ①「提醒的 ui 设计不行」②「左侧那几个 tab 的设计也不行」 |
| **基线** | ENTRY Go · FULL Go · FEEL Conditional — **本评不重开**已关 ENTRY/FULL/feel P0/P1/Must（可评贴邻提醒层 / 左 tab **新**设计债） |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md` |
| **Skills（全文已读）** | `apple-design` · `make-interfaces-feel-better` · `web-design-guidelines` |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-19** |
| **方法** | Playwright Chromium 真导航 · 截图 · `getBoundingClientRect` / 字号测量 · 文案撞车审计 · **非**改产品码 |
| **证据** | `docs/ui-polish/agent-remind-tabs-evidence/` · **21 PNG** + `_measures.json` · `_density.json` · `_copy-audit.json` |
| **运行时** | Vite `http://127.0.0.1:5175` · 主视口 **1440×900** · 对照 **1280×800** |
| **本评总评** | **Conditional** · 提醒面 **2 / 5** · 左 tab **2 / 5** · **Must 5 · Should 7 · Could 6** · 用户已点名「不行」— **不得 Clear** |

---

## 0. 一句话

提醒层是 **多套文案 + 多入口琥珀皮** 叠出来的「待办感」，不是单一可扫的提醒系统；左侧 chrome 是 **壳顶 4 等权 tab + 会话 2 格 segmented + 筛选藏菜单 + compact 空洞** 的拼盘——两面都支撑用户观感，**本面不得 Go**。

---

## 1. Meta · 覆盖清单

### 1.1 A · 提醒 UI（全找）

| 面 | 发现 | 关键帧 |
|----|------|--------|
| Home「待确认」chip | 底栏 strip **+** compact 侧栏 **双挂** 同文「待确认 · 3」琥珀 pill；h≈23–30 · 11–12px | `01` · `01b` · `01c` |
| Sessions 列表 / 侧栏 filter & badges | segmented「待确认3」· 行内橙点 · 「待你确认」副文 · **9px「待企业确认」** · 灰「Inbox」 | `02` · `02b` · `03` · `03b` · `10` |
| HITL ConfirmBar 提醒层 | `.confirm-hitl` 左琥珀轨 +「需要你确认」+ 步进空圈 + Inbox 链；**不**评 dock 高度（P0-AF-1 已关） | `04` · `04b` |
| Inbox / Reminder\|Notify\|待办 copy | Agent 内无独立 Reminder 组件；提醒语义靠 **待确认/待你确认/待企业确认/需确认** + mid「运营 Inbox」外链 | `_copy-audit.json` · `04b` |
| Catalog「需确认 N」 | 卡脚灰字「需确认 1/2」——**无**琥珀/chip 权重 | `06` |
| Toast | Home/Sessions 创建 toast 仍琥珀皮（非 `.ui-toast`）— 与提醒同色相，易混 | 代码抽检 · 历史 R-P* |

### 1.2 B · 左侧 tabs / chrome

| 面 | 发现 | 关键帧 |
|----|------|--------|
| 壳顶 segmented（开始/Agent/会话/更多） | 224px 轨顶 4 等权 icon+12px 文 · 选中仅粗体+底线 · h=28 | `02c` · `01c` · `02b` |
| 会话 segmented（全部/待确认） | 仅 2 格；进行中/已完成/归档/按 Agent **藏「筛选」**；计数粘标签「全部4」「待确认3」 | `02b` · `03b` · `08b` |
| 会话行 / 选中 | 行密三层（标题/副文/badge）· Inbox 右飘 9px | `02b` · `03b` · `04c` |
| Project folder / expert | 项目选中 **黑条** vs 专家选中 **蓝底** 两套语言；专家 pastel 胶囊 | `05` · `05b` |
| Browse compact（Catalog/Harness/Home） | 大片空白 + 说明灰字 + 单枚琥珀「待确认」· 项目模式次级链 | `01c` · `06b` · `07b` |
| Catalog 主区 segmented | 另有「全部/Core/Assist/Beta」— 同壳第三套分段 | `06` |

### 1.3 已关闭关闸（**不重开**）

| 闸 | 状态 | 本评态度 |
|----|------|----------|
| ENTRY P0/P1 · FULL P0-AF-1 · P1-AF-1…6 | **CLOSED** | 不重开 dock 高度 / Confirm radius / 原因单份 / compact 存在性 |
| FEEL Must（工具芯片英文 id 等） | 仍开于 FEEL 面 | **本评不并入**；只点名提醒+左 tab **新债** |

可贴邻批评：ConfirmBar **提醒层**的扫视与文案（非 dock 几何）；compact **内容空洞与提醒芯片角色**（非「该不该收起」闸）。

---

## 2. Skills 对照摘要

| Skill / 规范 | 本面命中 |
|--------------|----------|
| **apple-design** · Response / restraint | 提醒 chip 无 press 层级差；compact 空轨无「活」反馈；选中态偏静态 underline |
| **make-interfaces-feel-better** · 光学对齐 / 字号 / 密度 | badge **9px** &lt; caption；「全部4」光学粘连；壳顶 4 tab 挤在窄轨 |
| **web-design-guidelines**（2026-09-19） | Hover/contrast：灰 Inbox 链对比弱；数字宜 `tabular`（segment 有 · badge 无）；URL 反映 filter ✓（`?filter=needs_human`） |
| **DS-SCAN-01** | 待确认语义未 chip 化统一；同视口多套「待*确认」 |
| **DS-STATUS-01** | amber 滥用：提醒 chip / Confirm 轨 / toast 同相，提醒≠办理完成未分层 |
| **DS-COMP-SEG** | 会话 segmented 形态对，但 **只暴露 2/5 状态**；选中白片对比偏弱 |
| **DS-UX-HABIT-01/04/06** | 提醒入口多处同权；Confirm 顶行 tip/链叠；跨壳「Inbox」文案与 Agent 内「待确认」未对齐 |

---

## 3. 总评门

| 门 | 判定 |
|----|------|
| **Go** | ❌ 提醒+左 tab 设计债未关；用户已否决观感 |
| **Conditional** | ✅ 产品路径可演示（深链/筛选/HITL 功能在）；**Must 必须进质感单**后方可宣称本面设计过关 |
| **No-Go** | 非全壳 No-Go（ENTRY/FULL 已关）；**本命题面**若单列则可视为设计 No-Go |

**Verdict → Conditional**（本面提醒/左 tab：**不得 Clear / 不得 Go**）。

---

## 4. 提醒 · Must / Should / Could

### Must

#### ART-M-1 · 提醒文案四套撞车（待确认 / 待你确认 / 待企业确认 / 需确认）

- **现象**：同一次「有人要动」在侧栏 segmented 写「待确认」、行副文「待你确认」、badge「待企业确认」、Catalog 脚「需确认 N」、表列「待你确认」——`_copy-audit.json` 一次扫出 ≥6 种撞车串。
- **为何糟**：用户无法建立单一心理模型（谁确认？企业还是我？）；DS-SCAN-01 / HABIT-06 要求状态可扫、跨壳文案一致；web-guidelines「specific labels」被稀释成近义词墙。
- **改法**：冻结 **一套** 主标签（建议侧栏/筛选：**待确认**；行内角色用次级：「我方 / 企业 / 代理」或单 chip「待企业」）；Catalog「需确认」并入同词；禁第四套「需确认」灰字。
- **验收**：Agent 全壳「待*确认|需确认」主词 ≤2；截图侧栏+列表+Catalog 脚文案同源；`_copy-audit` 再跑无新同义簇。
- **证据**：`03` · `02b` · `06` · `_copy-audit.json`

#### ART-M-2 · Home / Browse 提醒芯片双挂且低紧迫

- **现象**：Home compact 侧栏「待确认 · 3」**与**主区底 strip 同款琥珀 pill 并存（`01`+`01c`）；Catalog/Harness compact 再挂同一枚（`06b`/`07b`）。chip h=23–30 · 11–12px · `amber-50` 浅底——在白壳上像 tip，不像队列 CTA。
- **为何糟**：同信号双挂违反 HABIT-01（单一下一步）与 HABIT-04（tip 上限精神）；apple restraint：提醒应「安全可预期」而非到处飘；用户说「提醒 UI 不行」首靶即此。
- **改法**：每视口 **一处** 主提醒入口（建议：会话页靠 segmented；Home/Browse 仅侧栏一枚或顶栏 badge，删底 strip 重复）；视觉升一级（更深 amber / inset 强调轨，对齐 `.dash-next` 精神，仍诚实非 success 绿）。
- **验收**：Home 视口「待确认 · N」可点入口 =1；对比度与主 CTA 有明确次级但仍可 1s 内扫到；无底栏+侧栏双胞胎。
- **证据**：`01` · `01b` · `01c` · `06b`

#### ART-M-3 · 行内提醒 badge 9px +「Inbox」幽灵链

- **现象**：侧栏/列表「待企业确认」`text-[9px]`/`10px` · h≈18（`_density.json` / `_measures.json`）；旁挂「Inbox」/`运营 Inbox` `text-slate-400` 9–10px——像调试后缀。
- **为何糟**：make-interfaces caption 惯例与 FEEL 已记的 &lt;12px 债同构；扫视失败（DS-SCAN-01）；Inbox 外链无按钮皮，提醒行动不可发现（guidelines：interactive states / specific labels）。
- **改法**：badge ≥11–12px（或改用标准 `.dash-scan-chip` / status chip）；Inbox 改为 secondary `ui-btn-sm` 或收入 overflow「在运营 Inbox 打开」；行内保留 **一个** 状态 chip + 可选一点。
- **验收**：侧栏待确认行 badge 字号 ≥11px；无 9px 状态文；Inbox 热区 ≥ hit-40 或明确菜单项。
- **证据**：`02b` · `03` · `03b` · `_density.json`

### Should

#### ART-S-1 · ConfirmBar 提醒层顶行过密（不重开 dock 高）

- **现象**：`04b` 同一行塞：需要你确认 + 批准策略 + 交接 pill + 待批准/待授权空圈 + 主 CTA + 退回 + 运营 Inbox 链 + 逐步——提醒「谁/下一步」被挤扁。
- **为何糟**：HABIT-04 叠层；apple 理解成本高；**不**主张加高 dock（P0-AF-1 已关），主张 **减噪重排**。
- **改法**：第一行只留「确认什么 + 主 CTA」；步进圈/Inbox/逐步收入第二行或「更多」；保留单主因红字（已关 P1-AF-3）。
- **验收**：Confirm 首行可扫元素 ≤4；Inbox 不与主 CTA 同权。
- **证据**：`04b` · `04`

#### ART-S-2 · Catalog 卡脚「需确认 N」不可扫

- **现象**：`06` 卡脚灰字「详情 · 工具 N · 需确认 N」——与 Core 绿 badge / 大「启动」比，提醒权重≈0。
- **改法**：有待确认闸时用迷你琥珀 chip 或卡眉点；无则隐藏「需确认 0」。
- **验收**：目录页 1s 内能数出「哪个 Agent 要确认」。
- **证据**：`06`

#### ART-S-3 · 提醒反馈皮与 toast 同相（琥珀）

- **现象**：创建/提示 toast 手写 `border-amber-200 bg-amber-50`（Home/Sessions/Sidebar），与待确认 chip 同皮 → 提醒态 vs 反馈态混淆（历史 R-P1-5 精神，Agent 面残留）。
- **改法**：提醒入口保持 pending/amber；toast 改 `.ui-toast` info/success 语义分离。
- **验收**：截图对比 chip vs toast 不同 token。
- **证据**：代码 `AgentHome.tsx` toast · `01`

### Could

| ID | 现象 · 改法 |
|----|-------------|
| ART-C-1 | Confirm「还有 3 条」链可改成「下一条待确认」带标题预览 |
| ART-C-2 | 右栏上下文 badge 把 pending 算进数字——可与左侧待确认同源提示 |
| ART-C-3 | 监控/布局会话「待企业确认」是否对代理所 Persona 误导 → 文案按角色切换 |

---

## 5. 左 tab · Must / Should / Could

### Must

#### ATT-M-1 · 壳顶「开始 / Agent / 会话 / 更多」等权挤轨 · 选中弱

- **现象**：224px 侧栏顶横排 4 项，每项 ≈52–56×28 · 12px（`_density.json`）；选中靠字重+底线，无填充轨/软底（`02c`）；「更多」把 Harness 等藏进溢出。
- **为何糟**：用户点名「左侧那几个 tab」；窄宽横排 4 等权违反层级（IA）；apple spatial consistency / feel-better 选中应更醒目；与下方「新建会话」灰按钮抢第一视觉带。
- **改法**：改为竖向 nav-section 列表（icon+标签，选中 `list-row-active` / accent-soft inset）**或** 3 主项+溢出且选中有填充；保证 hit ≥40 高。
- **验收**：选中态 1s 可辨；项高 ≥36–40；无 4 等权挤一行；截图 `02c` 对照后。
- **证据**：`02c` · `01c` · `02b`

#### ATT-M-2 · 会话 segmented IA 残缺 · 计数粘字 · 筛选藏状态

- **现象**：主分段仅「全部4 / 待确认3」（计数紧贴汉字，光学成词）；进行中/已完成/归档/按 Agent 进「筛选」菜单（`08b`）；选中白片 vs 未选 `rgba(60,60,67,0.6)` 对比偏弱（`_measures`）。
- **为何糟**：DS-COMP-SEG 期望分段承载互斥主视图——却把半数状态藏菜单；粘连计数损害 tabular 扫视；待确认作为提醒主入口却看起来像普通 segment。
- **改法**：① 标签与计数空格/tabular 分离（`全部 · 4`）；② 主分段至少「全部 | 待确认 | 进行中」或 chip 行；③ 待确认选中可用轻 amber 轨（与提醒语义挂钩，仍非第三套控件）；④ 筛选只留次要（Agent/归档）。
- **验收**：不点「筛选」也能达进行中；计数不粘字；待确认选中与全部有色相或权重差。
- **证据**：`02b` · `03b` · `08b` · `_density.json`

### Should

#### ATT-S-1 · Compact 侧栏空洞 · 提醒芯片成孤岛

- **现象**：Home/Catalog/Harness compact：上说明灰字 → 中琥珀 chip → 下「项目模式（次级）」→ **大片死白**（`01c` `06b` `07b`）。
- **为何糟**：收起 Inbox（P1-AF-5 已关）合理，但空轨无结构感；提醒芯片像被遗弃的唯一家具。
- **改法**：保留 compact，但加迷你结构：最近 1–2 待确认标题链 / 「打开会话 Inbox」主次按钮组；减少说教灰字。
- **验收**：compact 不再 &gt;50% 空白无内容；仍不恢复完整列表（不重开 AF-5）。
- **证据**：`01c` · `06b` · `07b`

#### ATT-S-2 · 项目 folder 双选中语言 + 专家彩虹胶囊

- **现象**：项目行选中 = 黑底白字；专家选中 = 蓝软底（`05b`）；专家标签各 pastel 色（检索蓝/撰稿紫/FTO 黄）。
- **为何糟**：同一侧栏两套 selected；彩色无强语义 → 扫视噪音（feel-better / DS 一致）。
- **改法**：统一 `list-row-active`；专家色降为左 3px accent 或单 icon tint，标签 mono。
- **验收**：项目与专家选中同族 token；一屏 ≤1 高对比选中块。
- **证据**：`05b`

#### ATT-S-3 · Catalog 主区再套 segmented（全部/Core/Assist/Beta）

- **现象**：同壳已有顶 tab + 会话 segmented，Catalog 又一段（`06`）。
- **改法**：改为 filter chips 或下拉；避免第三套 iOS segmented 抢「tab」心智。
- **验收**：Agent 壳「segmented」实例有文档化层级（壳导航 ≠ 内容过滤）。
- **证据**：`06`

#### ATT-S-4 · 会话行三层密度 + 右飘 Inbox

- **现象**：标题 / 「Agent · 待你…」 / badge 三行 + 右侧 Inbox（`02b`）。
- **改法**：副文与 badge 合并一行；Inbox 进 hover 或菜单。
- **验收**：待确认行视觉行数 ≤2；列表更易扫。
- **证据**：`02b` · `03b`

### Could

| ID | 现象 · 改法 |
|----|-------------|
| ATT-C-1 | 「新建会话」灰边按钮可再降权或移入溢出，让 tab 区更净 |
| ATT-C-2 | 项目「通用/专利」9px 角标与专家胶囊统一尺寸阶梯 |
| ATT-C-3 | 1280 下 sidebarW 测量偶发 null——窄断点再验 segmented 两格是否过挤（`10`） |

---

## 6. 优先级建议（给 UI质感助手）

1. **ART-M-1 + ART-M-3**（文案统一 + badge 可读）— 提醒「能看懂」  
2. **ATT-M-1 + ATT-M-2**（壳 tab 层级 + 会话分段 IA）— 左栏「像导航」  
3. **ART-M-2**（去双胞胎 chip / 升紧迫）  
4. ATT-S-1 · ART-S-1 · ATT-S-2  

---

## 7. 证据索引

| 文件 | 内容 |
|------|------|
| `01-home-remind-chip.png` | Home 全页 · 双「待确认」 |
| `01b-home-chip-closeup.png` | 底 strip chip |
| `01c-home-compact-sidebar.png` | Home compact 空洞+chip |
| `02-sessions-list-all.png` | 会话表+侧栏 |
| `02b-sidebar-segments-closeup.png` | segmented+行徽章 |
| `02c-shell-nav-tabs.png` | 开始/Agent/会话/更多 |
| `03-sessions-filter-needs-human.png` | 待确认筛选 |
| `03b-sidebar-needs-human-selected.png` | 选中待确认 |
| `04-session-hitl-full.png` | HITL 会话全页 |
| `04b-confirmbar-remind-closeup.png` | Confirm 提醒层 |
| `04c-session-sidebar-tabs.png` | 会话内左栏 |
| `05-project-workspace.png` / `05b-…` | 项目 folder |
| `06` / `06b` | Catalog + compact |
| `07` / `07b` | Harness + compact |
| `08` / `08b` | 筛选菜单 |
| `09-projects-list.png` | 项目列表 |
| `10-sessions-1280-needs-human.png` | 1280 对照 |
| `_measures.json` · `_density.json` · `_copy-audit.json` | 度量 |

---

## 8. 回报摘要（给编排）

| 项 | 值 |
|----|-----|
| **HEAD** | `5cee2ad` |
| **Verdict** | **Conditional** |
| **Must IDs** | `ART-M-1` · `ART-M-2` · `ART-M-3` · `ATT-M-1` · `ATT-M-2` |
| **Should count** | **7** |
| **Could count** | **6**（ART-C 3 + ATT-C 3） |
| **Evidence PNG** | **21** |
| **md path** | `docs/ui-polish/REVIEW_AGENT_REMIND_TABS_2026-09-19.md` |
| **产品码** | **未改** · **未 commit/push** · **未开 Cloud Agent** |

**Should 精确计数**：ART-S-1, ART-S-2, ART-S-3, ATT-S-1, ATT-S-2, ATT-S-3, ATT-S-4 → **7**。
