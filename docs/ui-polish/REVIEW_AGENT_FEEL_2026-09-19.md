# Agent 手感 / 残余债深评 · REVIEW_AGENT_FEEL_2026-09-19

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **HEAD** | `826cde8`（`dev` · `docs(ui): Agent full-shell short recheck Go`）· 产品闸门落地于 `12d39f5`+ · **as-is ✓** |
| **日期** | 2026-09-19（Asia/Shanghai · ~02:13 CST） |
| **基线** | ENTRY Go · FULL Go（`REVIEW_AGENT_FULL_RECHECK.md`）— **本评不重开已关 P0/P1** |
| **命题** | Agent 壳 **手感 / 残余债**：press · density · empty · motion · focus · hierarchy；复核 FULL **P2-AF-1…8**；产出 DEEP_FEEL 式 **Must / Should / Could** |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md` |
| **Skills（全文已读）** | `apple-design` · `make-interfaces-feel-better`（+ `typography` / `surfaces` / `animations` / `icons` / `performance`）· `web-design-guidelines` |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-19** |
| **方法** | Playwright Chromium 真导航/点击/绑案开闭 · `getBoundingClientRect` 热区/字号 · `transition-property` 探测 · **非**纯读代码 |
| **证据** | `docs/ui-polish/agent-feel-evidence/` · **27 PNG** + 测量 JSON |
| **运行时** | Vite `http://127.0.0.1:5175` · `/agent` → **200** · 主视口 **1440×900** · 对照 **1280×800** |
| **本评总评** | **Conditional** · 手感 **3 / 5** · **Must 3 · Should 7 · Could 3** · 无新硬 P0 · P2 仍开 7 + 部分 1 |

---

## 1. Meta

### 1.1 路径覆盖（要求路径全过）

| 路径 | 交互 | 关键帧 |
|------|------|--------|
| `/agent` Home | CTA hover/focus · 层级 | `01` · `01b` · `01c` |
| `/agent/sessions` | 列表密度 | `02` |
| `/agent/sessions/sess-oa-1` HITL | dock · Confirm · composer 折叠展开 · 1280 | `03`–`03d` · `09` |
| `/agent/projects` | 列表 | `04` |
| `…/proj-demo-general` | 工作区 · **绑案开/闭** · 工具卡 | `05`–`05d` |
| `…/proj-demo-patent` | 步骤条 · **绑案开/闭** · 工具 closeup · 1280 | `06`–`06e` · `09b` |
| `/agent/agents` Catalog | Core/Assist/Beta · disclaimer | `07`–`07e` |
| `/agent/harness` | 运行时 · compact 侧栏 | `08` · `08b` |

### 1.2 关键实测（相对 FULL 复测）

| 度量 | 本评 @1440 | FULL 复测阈 / 期望 | 注 |
|------|------------|-------------------|-----|
| `.agent-hitl-dock` 高 | **157** | ≤~200 · PASS 维持 | 不重开 P0-AF-1 |
| 轨迹 scroller 高 | **539**（展开 composer 后 **329**） | ≥480 默认 | 展开后压缩 → Could |
| Confirm `border-radius` | **12px** | ≥12 · PASS 维持 | 不重开 P1-AF-4 |
| `reasonCount` | **1** | 1 · PASS | 不重开 P1-AF-3 |
| 步进文案 | 「待批准 / 待授权」≠ CTA「批准策略」 | PASS | 不重开 P1-AF-6 |
| `@1280` aside / mid / dock / timeline | 224 / — / **173** / **424** | PASS 维持 | 不重开 P1-AF-1/2 |
| `bodyScroll` | **false** | PASS | |
| 主 CTA「开始办理」press | `.btn-press:active` → `scale(0.96)` · h=**40** | apple Response ✓ | |
| Confirm 内最小字号 | **10px**（待批准/待授权/逐步） | caption≥12 | → P2-AF-1 / Must |
| 会话页 `transition: all` 精确命中 | **26** | F4 禁止 | → P2-AF-2 |
| 专利工具芯片 | `dispatch_task` 等 · **11px / h=27** · 非 button | 人话标签 | → P2-AF-3 / Must |
| 项目 composer `top` | **872** / vh=900 | 贴折线 | → P2-AF-5 / Must |
| 双跳 | 顶栏 segmented **+** 右上浮层「作业中台/知产 Agent」 | F3 | → P2-AF-7 |

---

## 2. 已关闭关闸（**不重开**）

| 闸 | 状态 | 来源 |
|----|------|------|
| **P0-AE-1** · **P0-AE-2** · **P1-AE-*** | **CLOSED** | ENTRY Go · Home 单主 CTA 本评 no-regress ✓ |
| **P0-AF-1** | **CLOSED** | FULL recheck · dockH=157 · Confirm 独粘 · timeline=539 |
| **P1-AF-1…P1-AF-6** | **CLOSED** | FULL recheck 全 PASS（右栏收缩 / 无双滚 / 原因单份 / radius12 / Catalog·Harness compact / 步进≠CTA） |

本评 **零** 新硬 P0；不以残余 P2 或手感 Must 回滚上述关单。

---

## 3. P2-AF-1…8 处置表（复核）

| ID | 原问题（FULL §7） | 本评处置 | 证据句 |
|----|-------------------|----------|--------|
| **P2-AF-1** | Confirm 内 10/11px &lt; caption | **仍开**（升 **AFE-M-3**） | `_confirm-fonts.json`：待批准/待授权/逐步=**10px**；Inbox 链/补充项 summary=**11px** |
| **P2-AF-2** | 样本 `transition: all` | **仍开**（→ AFE-S-1） | `_session-feel-deep.json`：`transitionAllExact=**26**`（dock/confirm/rail/chip…） |
| **P2-AF-3** | 工具卡裸露 `dispatch_task` 等 | **仍开**（升 **AFE-M-1**） | `_tools-dual.json` · `06e`：三芯片英文 id · 11px · h=27 · `GENERAL-ORCHESTRATOR`/`ORCHESTRATOR` 标签并存 |
| **P2-AF-4** | Catalog Assist/Beta disclaimer 墙 | **仍开**（→ AFE-S-2） | `_catalog-assist.json`：Assist 卡 h=**226** textLen=108；Beta h=**211**；`07e` |
| **P2-AF-5** | 项目 composer `top≈872` 贴折线 | **仍开**（升 **AFE-M-2**） | `_patent-proj-feel.json`：composer.top=**872**；msgCard 与输入带垂直空洞/叠视口底 |
| **P2-AF-6** | Harness 信息密（Inbox+墙） | **部分修复** | compact 侧栏 ✓（P1-AF-5）；仍「最近会话」+ 9×启动 + 分层纪律墙 · `08` · `_harness-feel.json` |
| **P2-AF-7** | 顶栏 + 浮层双跳 | **仍开**（→ AFE-S-3） | `_tools-dual.json`：segmented top=12 **与** 右浮 `作业中台`/`知产 Agent` left=1341 并存 |
| **P2-AF-8** | 项目时间线单事件无下一步 | **仍开**（→ AFE-S-4） | `_patent-proj-feel.json`：`hasActionCta=false` · 仅「创建」一种子事件 |

**P2 仍开计数**：**7 仍开** · **1 部分修复（P2-AF-6）**。

---

## 4. Must（手感阻断 · `AFE-M-*`）

> 规则：新债或由 P2 **抬升**；**不**重复已关 ENTRY/FULL P0/P1。无硬 P0 → Must 未清则 **Conditional**。

### AFE-M-1 · 项目主路径工具芯片 = 英文 API id（抬升 P2-AF-3）

| 字段 | 内容 |
|------|------|
| **路径** | `/agent/projects/proj-demo-general` · `…/proj-demo-patent` |
| **Skill / DS** | web **Content & Copy** · apple **Purpose / Simplicity** · DS-HONESTY-01 · DS-FORBID **F2** · D6 |
| **错在哪** | 总控主区「工具卡 · ORCHESTRATOR」下三枚芯片直接标 `dispatch_task` / `summarize_timeline` / `open_expert_dm`（11px · 高 27 · **div 非 button**）。下方已有人话「分派给检索/撰稿/FTO」，但扫视第一眼仍是协议名 → 办理面像调试台。样机黄条已诚实；**产品主 affordance 不该是 snake_case**。 |
| **验收** | 芯片主文案改中文（「分派任务」「汇总时间线」「打开专家私信」）；英文 id 进 `title` / 「高级」折叠；可点击控件用 `button` 且热区 ≥40 高 |
| **证据** | `06e-patent-tools-closeup.png` · `05-general-workspace.png` · `06-patent-workspace.png` · `_tools-dual.json` · `_feel-general.json` |

### AFE-M-2 · 项目中栏密度：大留白 + composer 贴视口底（抬升 P2-AF-5）

| 字段 | 内容 |
|------|------|
| **路径** | `proj-demo-general` · `proj-demo-patent` |
| **Skill / DS** | feel-better **density / empty→filled** · apple **Spatial** · DS-SPACE-01 · D2/D4 |
| **错在哪** | 实测 composer `top=872` / `vh=900`（距底仅 ~28px 内容带）。中栏在工具芯片与底栏之间大块空；时间线右栏单事件。empty→filled 弱：种子消息卡后没有「下一办」锚定，输入带像被挤出折线。 |
| **验收** | composer sticky 底或中区缩短留白，使输入带进入舒适扫视带（目标 top ≲ 780@900 或内容流贴底输入）；空档填次级下一步或压缩 banner/工具带 |
| **证据** | `05-general-workspace.png` · `06-patent-workspace.png` · `_patent-proj-feel.json` · `_feel-summary.json` |

### AFE-M-3 · HITL Confirm 微字阶 + 次级热区过薄（抬升 P2-AF-1 + 新）

| 字段 | 内容 |
|------|------|
| **路径** | `/agent/sessions/sess-oa-1` |
| **Skill / DS** | DS-TYPE-01（caption≥12）· feel-better **Minimum Hit ≥40** · apple **Wayfinding** · D5 |
| **错在哪** | dock 高度已修好，但 **状态芯片「待批准/待授权」与「逐步」标签仍 10px**；「还有 3 条」热区 **22×49**；composer 折叠条高 **33**。主 CTA「批准策略」`ui-btn-sm` 高 **32**（有 press ✓）。用户在唯一 HITL 面上读状态仍费眼，手感「修好了高度、没修好可读/可点」。 |
| **验收** | Confirm 内可见字 ≥12px；「还有 N 条」与折叠条命中 ≥40 高（可见可小、伪元素扩）；主 CTA 建议 ≥36–40 高 |
| **证据** | `03b-dock-closeup.png` · `_confirm-fonts.json` · `_session-feel-deep.json` |

---

## 5. Should（应修 · `AFE-S-*`）

| ID | 路径 | Skill / DS | 错在哪 | 验收 | 证据 |
|----|------|------------|--------|------|------|
| **AFE-S-1** | sess-oa-1 等 | web Animation · DS-MOTION-01 F4 · feel **Never transition:all** | 会话页精确 `transition-property: all` **26** 处（dock、confirm、rail 行、chip…）；主钮已枚举属性 ✓ | 枚举 transform/opacity/colors；清 dock/confirm/rail | `_session-feel-deep.json` · `_feel-session-oa1.json` |
| **AFE-S-2** | Catalog Assist/Beta | feel density · D6 | Assist/Beta 卡内长 disclaimer（「非采购闭环」「无法务会签」）撑高到 211–226，与 Core 190 不齐 | line-clamp 2；详情进抽屉 | `07e` · `_catalog-assist.json` |
| **AFE-S-3** | 全局 chrome | DS-FORBID **F3** · D7 | 顶栏 segmented「作业中台/办理台/知产 Agent」**与** 右上浮层同文案按钮并存 | 只留一套跳转 | `_tools-dual.json` · `01` · `08` |
| **AFE-S-4** | 项目时间线 | DS-COMP-EMPTY · empty→filled | 单「创建」事件 · `hasActionCta=false` · 无「分派给…」锚定 | 空态 + 动作 CTA | `_patent-proj-feel.json` · `05` · `06` |
| **AFE-S-5** | 项目 / 会话 chrome | feel **hit≥40** · DS-SPACE-01 | 专家席链 h=**27**；绑案钮 h=**23**；右栏「打开对应表单工作台」h=**16**；Inbox 旁 `text-[9px]` | 高频链 ≥40 命中 | `_patent-proj-feel.json` · `_session-feel-deep.json` |
| **AFE-S-6** | sess Confirm | apple Response · hit | 主 CTA 高 32 · 折叠条 33 — press 规则在，热区偏紧 | CTA/折叠 ≥40 或伪元素扩 | `03b` · `_session-feel-deep.json` |
| **AFE-S-7** | sess 右栏 vs Confirm | apple Wayfinding · 前 DF-S3 残余 | 右栏上下文/层级/期限/产物与琥珀 Confirm **同权密度**；「下一步」仍需二次过滤 | 右栏次要默认折叠/降对比 | `03` · `03b` |

---

## 6. Could（可做 · `AFE-C-*`）

| ID | 路径 | 说明 | 证据 |
|----|------|------|------|
| **AFE-C-1** | Harness | P2-AF-6 部分修复后：仍可折叠「最近会话」/缩短分层纪律说明墙 | `08` · `_harness-feel.json` |
| **AFE-C-2** | sess composer 展开 | 展开后 timeline 539→**329**；可考虑抽屉/overlay 而非挤轨迹 | `03d` · `_feel-session-composer-open.json` |
| **AFE-C-3** | Home | 「待确认 · 3」chip 与中央「开始办理」软竞争（ENTRY 已关硬双 CTA；不重开 AE） | `01` · `_home-hierarchy.json` |

---

## 7. 新 P0 / P1

**无。** 不发明硬 P0；手感阻断一律走 **Must**。已关 P0/P1 保持 CLOSED。

---

## 8. 手感分与门禁

| 维（手感加权） | 分 | 一句 |
|----------------|----|------|
| 层级 / 下一步 | **3** | HITL dock 已清；项目工具英文 id + 右栏密度仍抢「下一步」（M-1/S-7） |
| 密度 / 扫视 | **3** | 会话轨迹回半屏 ✓；项目中栏空+composer 贴底（M-2）；Catalog Assist 墙（S-2） |
| Press / 反馈 | **4** | 主 CTA `.btn-press` scale(0.96) ✓；次级 chrome 偏死/偏薄（S-5/S-6） |
| Empty→filled | **3** | 时间线种子无动作（S-4）；项目空档无填（M-2） |
| 光学 / 字阶 / 热区 | **3** | Confirm 10px + &lt;40 热区（M-3/S-5）；radius12 已过 |
| Motion / focus | **3** | focus-ring 主路径 ✓；`transition:all` 26（S-1）；reduced-motion 未专项拨开关 |
| **综合手感** | **3 / 5** | |

### Verdict

| 门 | 本评 |
|----|------|
| **Go** | 否（Must 未清） |
| **Conditional** | **是** · 路由/FULL P0P1 维持 Go；**feel Go 被 Must 阻断** |
| **No-Go** | 否（无新硬 P0） |

> 已深挖；**Must 3**（AFE-M-1…M-3）/ **Should 7** / **Could 3**。  
> **禁止**用「FULL Go · 无债」作为本评故事。

### 给质感助手的安装顺序（建议）

1. **AFE-M-1** 工具芯片人话化（顺带关 P2-AF-3）  
2. **AFE-M-2** 项目中栏密度 / composer（P2-AF-5）  
3. **AFE-M-3** Confirm 字阶 + 热区（P2-AF-1）  
4. AFE-S-3 双跳（P2-AF-7）→ S-2 disclaimer（P2-AF-4）→ S-1 transition:all（P2-AF-2）→ S-4/S-5/S-6/S-7  

---

## 9. Skills 对照

### apple-design（Emil）

| 点 | 观察 |
|----|------|
| Response / press | 主钮 `.btn-press` ✓；Inbox 行/专家席链仍弱 |
| Wayfinding | HITL 独粘后「在哪」清晰；项目页工具 id 破坏「下一步唯一」 |
| Simplicity / Purpose | Catalog compact ✓；项目 ORCHESTRATOR 协议名未过 |
| Materials | Confirm radius12 ✓（相对 FULL 基线） |
| Interruptible motion | CSS transition 主路径；未做手势弹簧（Could 级平台债） |

### make-interfaces-feel-better（Jakub）

| 点 | 观察 |
|----|------|
| hit ≥40 | 多处 chrome &lt;40 → M-3/S-5/S-6 |
| concentric radius | Confirm/dock 已修；本评未新开半径 P0 |
| Never `transition: all` | **26** 命中 → S-1 / P2-AF-2 |
| Scale on press 0.96 | 主 CTA ✓ |
| density / empty | 项目中栏 + 时间线 → M-2/S-4 |
| tabular | 非本波主债 |

### web-design-guidelines（Vercel · 2026-09-19 抓取）

| 点 | 观察 |
|----|------|
| Focus visible | `.focus-ring` 主路径 ✓（`01c` · `03c`） |
| `transition: all` anti-pattern | 命中 → S-1 |
| Content & Copy / 具体按钮 | 「批准策略」「开始办理」✓；工具芯片英文 ✗ → M-1 |
| Icon-only aria | 主路径有文案；未升 Must |
| prefers-reduced-motion | **Not verified**（未拨系统开关） |
| Destructive confirm | HITL 门控 ✓ |

---

## 10. 做得好的地方（相对 FULL Go）

1. **HITL dock 瘦身维持**：157px · Confirm 独粘 · 轨迹 539 — P0-AF-1 无回退。  
2. **步进「待批准」≠ CTA「批准策略」** — P1-AF-6 维持。  
3. **Catalog/Harness compact 侧栏** — 浏览态不再铺满 Inbox。  
4. **主 CTA press + focus** — Home「开始办理」40px · `scale(0.96)` · focus 可见。  
5. **general / patent 语义分流 + patent 须绑案** — 绑案开闭路径可演示。  
6. **body 不滚** — 会话壳 overflow hidden 维持。

---

## 11. 证据索引

目录：`docs/ui-polish/agent-feel-evidence/` · **27 PNG**

```
01-home.png
01b-home-cta-hover.png
01c-home-cta-focus.png
02-sessions-list.png
03-session-oa1.png
03b-dock-closeup.png
03c-confirm-cta-focus.png
03d-composer-unfold.png
04-projects-list.png
05-general-workspace.png
05b-general-casebind-open.png
05c-general-casebind-closed.png
05d-general-scroll-tools.png
06-patent-workspace.png
06b-patent-casebind-open.png
06c-patent-casebind-closed.png
06d-patent-bot.png
06e-patent-tools-closeup.png
07-catalog.png
07b-catalog-scrolled.png
07c-catalog-assist.png
07d-catalog-beta.png
07e-catalog-assist-disclaimer.png
08-harness.png
08b-harness-scrolled.png
09-session-1280.png
09b-patent-1280.png
```

测量 JSON（旁证）：`_feel-summary.json` · `_feel-*.json` · `_confirm-fonts.json` · `_session-feel-deep.json` · `_patent-proj-feel.json` · `_catalog-assist.json` · `_tools-dual.json` · `_dual-jump.json` · `_harness-feel.json` · `_home-hierarchy.json` · `_press-css.json` 等。

---

## 12. 报告回执字段

| 字段 | 值 |
|------|-----|
| HEAD | `826cde8`（产品 `12d39f5`+） |
| Verdict | **Conditional**（手感 3/5；Must 未清；无新 P0） |
| Must | **3** · `AFE-M-1` · `AFE-M-2` · `AFE-M-3` |
| Should | **7** · `AFE-S-1`…`AFE-S-7` |
| Could | **3** · `AFE-C-1`…`AFE-C-3` |
| P2 仍开 | **7** 仍开 + **1** 部分（P2-AF-6） |
| Evidence PNG | **27** |
| MD path | `docs/ui-polish/REVIEW_AGENT_FEEL_2026-09-19.md` |
| 未改产品代码 | 是 · 无 commit/push · 无 Cloud Agent |

---

## 复测附注（2026-09-19 ~10:27 CST）

短复测见 **`REVIEW_AGENT_FEEL_RECHECK.md`** · HEAD `bb6f4d2` / 产品 `e431083` · **feel Go**（Must 3/3 · Should 7/7 PASS；Could 仍开仅注）。未重开 ENTRY/FULL P0/P1；未改产品代码。

*只文档与证据；未改 apps/contracts；未 git commit/push；未启 Cloud Agent。*
