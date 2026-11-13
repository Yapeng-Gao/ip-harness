# 手感 / 深度深评 · REVIEW_DEEP_FEEL_2026-09-18

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **HEAD** | `71267f2`（`dev` · `fix(ui): clear full-skills FS-P2-7/8/9 polish`） |
| **日期** | 2026-09-18（Asia/Shanghai） |
| **基线** | `REVIEW_FULL_SKILLS_DEEP_2026-09-18.md`（路由级 Go · P0/P1=0）— **本评不复读 outline-none / forbid 剧场** |
| **命题** | 用户可感到的 **feel debt**：密度、层级、press、hover、empty→filled、Confirm 摩擦、扫视、同心圆角、光学对齐、tabular、热区、动效克制、伪生产文案 |
| **Skills（全文已读）** | `apple-design` · `make-interfaces-feel-better`（+ typography/surfaces/animations/icons）· `web-design-guidelines` + [command.md](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)（2026-09-18 抓取） |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` |
| **方法** | 14 口 HTTP 200 + Playwright **交互办理**（点击/填表/toggle/Confirm/empty→content）+ 度量脚本（hit / nest radius / tabular / disabled） |
| **证据** | `docs/ui-polish/deep-feel-evidence/` · **76 PNG** + `_*-metrics.json` |
| **总评** | **Conditional** · 手感分 **3 / 5** · **Must 4 · Should 6 · Could 3**（Must 未清不得 feel Go） |

---

## 1. Meta · 端口

| 端口 | 壳 | HTTP | 交互路径数 | 证据前缀 |
|------|-----|------|------------|----------|
| 5173 | mid | 200 | 3+ | `mid-5173-*` |
| 5174 | workbench | 200 | 2+ | `wb-5174-*` |
| 5175 | agent | 200 | 2+ | `agent-5175-*` |
| 5176 | ops | 200 | 3 | `ops-5176-*` |
| 5177 | iam | 200 | 2 | `iam-5177-*` |
| 5178 | doc-harness | 200 | 2 | `doc-5178-*` |
| 5179 | ai-infra | 200 | 3 | `ai-infra-5179-*` |
| 5181 | ai-data | 200 | 3 | `ai-data-5181-*` |
| 5182 | search | 200 | 3 | `search-5182-*` |
| 5183 | fto | 200 | 3 | `fto-5183-*` |
| 5184 | mining | 200 | 3 | `mining-5184-*` |
| 5185 | inspire | 200 | 3 | `inspire-5185-*` |
| 5186 | landscape | 200 | 3 | `landscape-5186-*` |
| 5187 | figure | 200 | 3 | `figure-5187-*` |

相对 FULL_SKILLS_DEEP：本评 **不做** P0/P1=0 复唱；强制产出非空 Must/Should。

---

## 2. Method

1. 读满三 skill 正文 + sibling（typography / surfaces / animations / icons）+ Vercel `command.md` + DS / Rubric。
2. Playwright `_feel_shot.mjs`：每壳 ≥2–3 办理路径（填/点/toggle/Confirm），截关键帧。
3. 度量：`getBoundingClientRect` 热区、`.btn-press` 探测、nest radius、tabular 抽样、disabled 旁注。
4. 人工读图：层级、密度、empty→filled、Confirm 摩擦、伪生产/调试文案。

**刻意跳过**：outline-none rg 清零剧场、transition-all 清零复唱、样机黄条诚实声明（诚实 ≠ feel 债；债在「主 UI 用 API 词当产品标题」）。

---

## 3. Per-shell path 表（≥2–3 + 证据）

| 壳 | 路径 1 | 路径 2 | 路径 3 | 关键证据 |
|----|--------|--------|--------|----------|
| **mid** | Dashboard 首屏 → Inbox「优先」行点击 | `/pipeline` 阶段卡 | `/docket` 焦点 + `/cases`→案详 | `mid-5173-dashboard-home.png` · `mid-5173-inbox-or-next-click.png` · `mid-5173-pipeline-*.png` · `mid-5173-docket-*.png` · `mid-5173-case-detail.png` |
| **wb** | `/workbench` → `/intake` 填「技术方案」→ 动作 | `/research` 交互 | — | `wb-5174-intake-filled.png` · `wb-5174-intake-after-action.png` · `wb-5174-research-*.png` |
| **agent** | `/agent` → `sess-oa-1` Confirm 区 | composer focus/fill → Confirm 点击 | — | `agent-5175-session-confirm.png` · `agent-5175-composer-*.png` · `agent-5175-confirm-interact.png` |
| **ops** | `/logs` 过滤填 error + tab | `/models` | `/config` toggle | `ops-5176-logs-*.png` · `ops-5176-config-toggle.png` |
| **iam** | `/` persona | `/login` focus→filled | — | `iam-5177-*-*.png` |
| **doc** | 编辑器打字 | 批注/修订入口 | — | `doc-5178-editor-typed.png` · `doc-5178-revision-or-anno.png` |
| **ai-infra** | `/loadtest` 禁用/空跑次 | `/jobs` 交互 | `/endpoints` | `ai-infra-5179-*.png` |
| **ai-data** | `/datasets` 发布闸 | `/sources` 拉取 | `/exports` CTA | `ai-data-5181-*.png` |
| **search** | 空台 → 填查询 → 检索 | 结果交互 | `/saved` `/corpus` | `search-5182-home-empty.png` · `search-5182-results.png` · `search-5182-saved.png` |
| **fto** | `/features` 填特征 | `/hits` 选择 | `/matrix` 单元格 | `fto-5183-features-filled.png` · `fto-5183-matrix.png` |
| **mining** | `/disclosure` 填 | `/candidates` 选 | `/score` | `mining-5184-*.png` |
| **inspire** | 输入台填/激发 | `/sparks` 空→CTA | `/favorites` | `inspire-5185-prompt*.png` · `inspire-5185-sparks.png` |
| **landscape** | domain | `/tree` 展开 | `/nodes/edrive` | `landscape-5186-*.png` |
| **figure** | list → `/new` 填 | `/edit/fig-seed-exploded` 工具 | — | `figure-5187-new-filled.png` · `figure-5187-edit-seed.png` |

度量旁证：`_mid-metrics.json` · `_agent-metrics.json` · `_figure-metrics.json` · `_ops-metrics.json` · `_wb-metrics.json` · `_findings.json`。

---

## 4. Must（必修）· 手感阻断

| ID | 壳 | 路径 | Skill / DS 条款 | 错在哪 | 验收 | 证据 |
|----|-----|------|-----------------|--------|------|------|
| **DF-M1** | mid | Dashboard → Inbox 行 | apple **Simplicity / hierarchy** · feel-better **Minimum hit + optical** · DS-SCAN-01 · D1/D2 | 行高实测 **~100px**，但行内主行动「办理/确认」是 `.dash-inbox-action` **12px caption / 高 ~18px**，远右弱链；扫视时「下一步」不像 CTA，眼动跨越大片 SLA chip 墙才落到弱字。整行可点 ≠ 主行动可读。 | 「办理」视觉权重 ≥ `ui-btn-sm`（或同权 chip-button）；列宽内行动区可读；桌面热区观感 ≥40px 高 | `mid-5173-dashboard-home.png` · 代码 `src/pages/Dashboard.tsx:584-586` · `src/index.css:1095-1103` |
| **DF-M2** | search | 检索工作台主卡 | web-guidelines **Content & Copy** · apple **Purpose / Simplicity** · DS-HONESTY-01（诚实边界 ≠ 调试词当标题） | 主 UI 标题/勾选项直接暴露 API/故障注入词：`过滤（写入 Query.filters）`、`下次强制失败（注入故障 → error）`、`同族折叠（collapseFamily）`、侧栏「同引擎形状」。样机黄条已诚实；**产品面仍像调试台**，层级泥：操作者语言 vs 协议字段混排。 | 人话标题主位；协议名降到 `code`/tooltip/`title`；故障注入收进「开发者」折叠，默认路径无 `→ error` 字面 | `search-5182-home-empty.png` · `search-5182-results.png` · `apps/search/src/pages/SearchPage.tsx:175-190,320` · `SearchShell.tsx` / `AgentPanel.tsx` |
| **DF-M3** | figure | list → edit seed 画布 | feel-better **Optical over geometric** · apple **Craft** | 种子爆炸图：`Sketch` 零件文案（传感模块/处理单元）与 `AnnotationMark` **bubble r=16** 同点位叠压，标签被编号圆 **裁切**（「传…块」「处…元」）。演示主路径一眼脏。 | bubble 默认偏移离开零件字心；或零件字避让；选中态仍可读满文案 | `figure-5187-edit-seed.png` · `apps/figure/src/components/Canvas.tsx:20-43` · `Sketch.tsx:12-17` |
| **DF-M4** | mid / agent / figure | 侧栏「洞察」折叠；工作区/Persona；figure 顶条步进链 | feel-better **Minimum Hit Area（桌面 ≥40×40）** · DS-SPACE-01 `.hit-40` · apple **Tap hysteresis** | mid「洞察」按钮复用 `.nav-section`（**0.6875rem 大写标签样式**）→ 实测高 **17px**；agent「切换工作区/Persona」**h≈26**；figure 顶条链「文档」**24×16** 等。高频 chrome 热区明显低于桌面下限。 | 控件命中 ≥40px（可见可小，伪元素扩热区且不重叠）；section label 与 button 拆类 | `mid-5173-dashboard-home.png` · `_agent-metrics.json` · `_figure-metrics.json` · `MidSidebar.tsx:231-241` · `src/index.css:410-418` · `AgentWorkspaceMenu.tsx:45` |

---

## 5. Should（应修）· 清晰抛光收益

| ID | 壳 | 路径 | Skill / DS | 错在哪 | 验收 | 证据 |
|----|-----|------|------------|--------|------|------|
| **DF-S1** | ops | `/config` toggle | feel-better hit area · apple Response | 开关可见 **`h-6 w-10`（24×40）**，无 `::after` 扩热区；行高松、钮小，宽屏左右眼距大 | 热区 ≥40×40；行高与开关光学对齐 | `ops-5176-config-toggle.png` · `apps/ops/src/pages/ConfigPage.tsx:53-63` · `_ops-metrics.json` |
| **DF-S2** | mid | Inbox 行 hover/press | apple **Response — pointer-down** · feel-better **Scale on press** · DS-MOTION | `.dash-inbox-row` 仅有 `background-color` hover；**无 active/press** 反馈。主 CTA 有 `btn-press`，但最高频列表行按下「死」。 | `:active` 可见静态线索（背景加深或 inset），可打断 transition；勿对行做夸张 scale | `mid-5173-dashboard-home.png` · `src/index.css:957-974` |
| **DF-S3** | agent | `sess-oa-1` Confirm | apple **Simplicity / Wayfinding** · DS-COMP-AGENT · D4 | Confirm 琥珀条 + 红原因 + 右栏 meta/期限/交付物 **同权密度**；「下一步」扫视需二次过滤。摩擦感来自视觉竞争，非逻辑缺闸（闸门本身合格）。 | 右栏次要块默认折叠/降对比；Confirm 主 CTA 在视口内独占一级 | `agent-5175-session-confirm.png` · `agent-5175-confirm-interact.png` |
| **DF-S4** | inspire | `/sparks` 空态 | web **Content & Copy** · DS-COMP-EMPTY | 空态 body「本页 **≥6 张卡**」像验收标准，不像用户下一步 | 改用户语言（「激发后这里会出现一组扩召卡片」）；保留 CTA「去输入台」 | `inspire-5185-sparks.png` · `apps/inspire/src/pages/SparksPage.tsx:59` |
| **DF-S5** | doc-harness | 批注草稿卡 | feel-better **Concentric radius** · DS-RADIUS-02 | `rounded-xl` + `p-3` 嵌套面板与同族圆角叠用（`AnnotationPanel` 等）；内输入 `rounded-md` 尚可，外层与邻卡易「同半径掐边」 | 外径 ≈ 内径 + padding；或 pad>24 时当独立面分别取径 | `doc-5178-revision-or-anno.png` · `apps/doc-harness/src/components/AnnotationPanel.tsx:52-63` |
| **DF-S6** | fto | `/matrix` 未填→填 | feel-better empty/filled · apple Feedback | 宽单元格大量留白，`<select>` 孤立；未填/已填主要靠 option 文案，**缺单元格级色态**，empty→filled 手感弱 | 未填 wash / 已填语义色边；点击热区扩到单元格 | `fto-5183-matrix.png` · `fto-5183-matrix-interact.png` · `MatrixPage.tsx` |

---

## 6. Could（可做）

| ID | 壳 | 路径 | 说明 | 证据 |
|----|-----|------|------|------|
| **DF-C1** | ai-infra | `/loadtest` 空跑次 | 「尚无压测」单行空态偏稀；可加次级 CTA/示意条，非阻断 | `ai-infra-5179-loadtest.png` |
| **DF-C2** | inspire | 输入台 | 主卡内按钮偏左下、右侧大空，密度偏低但可接受 | `inspire-5185-prompt.png` |
| **DF-C3** | mid | KPI chips | `kpi-tile-value` / `kpi-chip > b` 已 tabular；芯片整段文案仍比例字——动态刷新时轻微晃，优先级低 | `_mid-metrics.json` · `src/index.css:674-712` |

---

## 7. Skills 对照（本波映射 · 非复读 forbid）

| Skill 要点 | 原型已有 | 本波仍缺（feel） |
|------------|----------|------------------|
| apple **Response**（pointer-down） | `.ui-btn` / `.btn-press` → `scale(0.96)` | Inbox 行、多数 chrome 链无按下态（DF-S2） |
| apple **Interruptible / springs** | CSS transition + reduced-motion 守卫 | 手势/velocity 非本波范围；无新增 keyframe 锁死 |
| apple **Spatial / materials** | surface-card、Confirm 琥珀层 | Confirm vs 右栏材料权重接近（DF-S3） |
| feel-better **hit ≥40** | `.list-row` / 多数 `ui-btn` | 洞察 17px、Persona/工作区 ~26、figure 顶链、ops switch 24（DF-M4/S1） |
| feel-better **concentric** | `.nest-inset` / wb 部分正确（`_wb-metrics` ok） | doc 批注卡、部分并行 nest（DF-S5） |
| feel-better **optical** | 图标旁间距大体 OK | figure bubble 压字（DF-M3） |
| feel-better **tabular** | KPI 主值、SLA chip 已上 | 非主债 |
| feel-better **motion restraint** | 高频无 stagger | 合规；不升 Must |
| web **copy** | 样机黄条诚实 | 主标题 API/注入词（DF-M2）；inspire ≥6（DF-S4） |
| web **focus** | 前评已清主路径 | **本评不作为故事** |

**Apple 流体清单 vs Web 原型缺口（摘要）**：velocity handoff / rubber-band / 1:1 sheet — 原型以点击桌面办为主，未宣称手势面；缺口记 **Could 级平台债**，不升 Must。本波 Must 全部是用户在 **点击办理路径上立刻感到的** 层级/热区/叠字/文案问题。

---

## 8. 手感分与结论

| 维（手感加权） | 分 | 一句 |
|----------------|----|------|
| 层级 / 下一步 | **3** | mid 优先条强，但 Inbox 行内「办理」弱（DF-M1）；agent Confirm 被右栏抢权（DF-S3） |
| 密度 / 扫视 | **3** | 列表可用但眼动成本高；search 调试词噪音（DF-M2） |
| Press / 反馈 | **3** | 主钮有 press；最高频行与小 chrome 偏死（DF-S2/M4） |
| Empty→filled | **3** | inspire/ai-infra 空态诚实但文案/密度糙（DF-S4/C1）；fto 单元格态弱（DF-S6） |
| 光学 / 半径 / 热区 | **2** | figure 叠字 + 多处 <40 热区（DF-M3/M4/S1/S5） |
| **综合手感** | **3 / 5** | |

### Verdict

**Conditional** — 路由/forbid 基线可维持，但 **feel Go 被 Must 阻断**。

> 已深挖；**Must 4**（DF-M1…M4）/ **Should 6**（DF-S1…S6）/ **Could 3**（DF-C1…C3）。  
> **禁止**用「P0=P1=0 · Go · 无债」作为本评故事。

### 给质感助手的安装顺序（建议）

1. DF-M1 Inbox 行动权重  
2. DF-M3 figure 标注避让  
3. DF-M4 / DF-S1 热区  
4. DF-M2 search 文案分层  
5. DF-S2/S3/S4/S5/S6  

---

## 9. 报告回执字段

| 字段 | 值 |
|------|-----|
| HEAD | `71267f2` |
| Must | **4** · DF-M1, DF-M2, DF-M3, DF-M4 |
| Should | **6** · DF-S1…S6 |
| Could | **3** · DF-C1…C3 |
| Verdict | **Conditional**（手感 3/5；Must 未清） |
| Evidence PNG | **76** |
| MD path | `docs/ui-polish/REVIEW_DEEP_FEEL_2026-09-18.md` |
| Blockers | DF-M1（Inbox 行动层级）· DF-M2（search 调试文案主位）· DF-M3（figure 叠字）· DF-M4（chrome 热区） |
| 未改产品代码 | 是 · 无 commit/push · 无 Cloud Agent |

---

## 短复评附注（`d8feddf`）

见 [`REVIEW_DEEP_FEEL_RECHECK.md`](./REVIEW_DEEP_FEEL_RECHECK.md)。  
**结论**：DF-M1…M4 · DF-S1…S6 全 **PASS**（Could 亦落地）→ 手感升 **Go**。
