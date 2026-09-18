# N1 UI Re-evaluation Notes (static)

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只读 / 不改产品代码） |
| **仓 HEAD** | `2a43dbf`（`docs: set N-wave priority after quota refresh (N1=UI)`） |
| **对照** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md`（apple-design · make-interfaces-feel-better · web-design-guidelines；**非** apple-hig-full） |
| **方法** | Scope A：六并行壳 `src/` layout·pages·components/ui + README；Scope B：五壳静态回归抽检 |
| **日期** | 2026-09-18（上海） |
| **证据目录** | `docs/ui-polish/n1-evidence/`（已有 `*-home.png`；本文件为代码静态笔记） |

> 分数为 **草案**（1–5 整数），待浏览器走查补截图 URL 后写入正式 `REVIEW_*.md`。

---

## 总览门禁（草案）

| 壳 | 端口 | 门禁草案 | 一句话 |
|----|------|----------|--------|
| search | 5182 | **Conditional Go** | 壳/诚实强；F1 mock-chip violet、HABIT-05 空态缺 CTA、空篮禁用无内联原因 |
| fto | 5183 | **Conditional Go** | 五步闸门与 Confirm 理由好；顶栏 raw localhost（F8）、F1 violet 残留 |
| mining | 5184 | **Conditional Go** | 空态 CTA 好；F1 violet 选中卡、顶栏多 raw 深链、送出禁用偶发无旁注 |
| inspire | 5185 | **Conditional Go**（偏紧） | **首页 textarea = F1+F5**（violet focus + outline-none）；其余壳语言尚可 |
| landscape | 5186 | **Conditional Go** | 诚实域锁定好；F1 热力/柱条 violet、灰域禁用「不可用」缺内联原因 |
| figure | 5187 | **Conditional Go** | 闭环与诚实文案最完整；仅共享 mock Chip violet + 偶发 slate-400 |
| mid / wb / agent / ops / iam | 5173–77 | 见 §Scope B | 无大面积 F1 回归；ops/iam focus 缺口、agent composer outline-none |

**跨并行壳共性问题（优先修）**

1. **F1**：六壳 `components/ui.tsx` 的 `Chip tone="mock"` 一律 `violet-*`（及页面级 Beaker/选中/热力 violet）。
2. **F8**：深链常量写死 `http://localhost:51xx`，且顶栏/按钮旁 **可见倾倒** 完整 URL（fto/mining/inspire/landscape/figure/search 下游 href）。
3. **HABIT-05**：并行壳 `EmptyState` 支持 `action`，但 search/inspire/landscape 多处调用未传 CTA。
4. **未用** `.ui-empty` token 类（自绘 dashed 盒）→ S1 与主五壳有缝。

---

# Scope A — 六并行壳

## A1 · search · `:5182`

### Shell / IA

| 项 | 证据 |
|----|------|
| 壳 | `apps/search/src/layout/SearchShell.tsx`：`app-shell-bg` · `shell-aside` · `shell-banner-demo` · `shell-page-kicker` · `list-row-active` / `sidebar-link` / `focus-ring` |
| 诚实横幅 | `HONESTY_BANNER`（`state/types.ts`）：样机 · 无真检索后台 · 非真专利库… |
| 侧栏 IA | `/` 检索工作台 · `/saved` 收藏/工作篮 · `/corpus` 语料/索引；深链注 `/families/:id` |
| 路由 | `App.tsx`：`/` · `/families/:familyId` · `/saved` · `/corpus` |
| 附加 | 宽屏右侧 `AgentPanel`；窄屏 `<details>` JSON 面板（诚实、偏调试噪音） |

### Anti-patterns / 规范对照

| 检查 | 结果 | 路径 |
|------|------|------|
| F1 indigo/violet | **有**：`Chip tone="mock"` → `border-violet-200 bg-violet-50 text-violet-900` | `components/ui.tsx:113` |
| F4 `transition-all` | **有**：入库进度条 | `pages/CorpusPage.tsx:138` |
| F5 outline-none 无替换 | **未检出**裸 F5 | — |
| F8 raw localhost | **有**：`DOWNSTREAM_PLACEHOLDERS` href `5183/5184/5186/5178` | `state/types.ts:193–196` |
| focus-ring / ui-btn / btn-press | **Button 基座齐全** | `components/ui.tsx:92` |
| DS-DISABLED-01 | **弱**：空篮「送 Agent/下游」仅 `disabled={empty}`，无旁注/Chip | `SearchPage.tsx:536+` · `SavedPage.tsx:40+` |
| HABIT-05 EmptyState CTA | **部分缺**：尚未检索 / 无命中 / 尚无入库任务 / 尚无收藏 **无 action**；同族未找到 **有** Link | `SearchPage` · `CorpusPage` · `SavedPage` · `FamilyPage` |
| 对比风险 | 次要文大量 `text-slate-400/500`（侧栏注、时间戳） | 多页 |
| 业务→UX | 诚实：不声称全库已扫；送下游只写事件。无谎称跨口同步。 | README + 文案 |

### 草案分

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 |
|----|----|----|----|----|----|----|----|----|----|
| 4 | 4 | 3 | 4 | 3 | 4 | 3 | 3 | 4 | 3 |

### 候选 P0 / P1 / P2

| 级 | ID | 问题 | 条款 | 验收 | Path |
|----|-----|------|------|------|------|
| P1 | SR-P1-1 | mock Chip 全 violet | F1 · DS-COLOR-02 | `tone=mock` 改 amber/slate 语义（对齐 `shell-banner-demo`） | `components/ui.tsx` |
| P1 | SR-P1-2 | 空篮/未检索禁用无内联原因 | DS-DISABLED-01 · HABIT-03 | 旁注「请先加入工作篮」或禁用态 Chip | `/` · `/saved` |
| P1 | SR-P1-3 | 多处 EmptyState 无 CTA | HABIT-05 | 至少链到「去检索」/点上方入库说明旁钮 | `/` · `/corpus` · `/saved` |
| P2 | SR-P2-1 | `transition-all` 进度条 | F4 · DS-MOTION-01 | 枚举 `width`/`opacity` | `/corpus` |
| P2 | SR-P2-2 | 下游 href 常量 localhost | F8 · HABIT-06 | 标签「送 FTO」+ 相对/配置深链，产品面不倾倒 URL | `state/types.ts` |

**门禁草案**：**Conditional Go**

---

## A2 · fto · `:5183`

### Shell / IA

| 项 | 证据 |
|----|------|
| 壳 | `layout/FtoShell.tsx`：`app-shell-bg` · `shell-aside` · `shell-banner-demo` · 顶栏步骤条 `STEPS` |
| 诚实 | `HONESTY_BANNER`：样机 · 无真 FTO 引擎 · 非法律意见 |
| 路由 | `/` 项目卡 · `/features` · `/hits` · `/matrix` · `/risk` · `/report` |
| 深链 | 顶栏可见：`检索 search → http://localhost:5182`（**F8**） |

### Anti-patterns

| 检查 | 结果 | 路径 |
|------|------|------|
| F1 | mock Chip violet；`HomePage` Beaker `text-violet-600`；`HitsPage` `text-violet-700` 假 claim | `ui.tsx` · `HomePage.tsx:19` · `HitsPage.tsx:83` |
| F4 / F5 | 未检出 | — |
| F8 | 顶栏完整 localhost 文案 | `FtoShell.tsx:38–43` |
| DS-DISABLED-01 | **较好**：Report `disabled={!gate.ok}` + `title` + **可见** `<Chip>无法 Confirm：{gate.reason}</Chip>`；Matrix `title` 有因；Features 有「只读（已 Confirm）」Chip | `ReportPage.tsx` · `MatrixPage.tsx` · `FeaturesPage.tsx` |
| HABIT-05 | Hits/Matrix 空态 **有** CTA | `HitsPage` · `MatrixPage` |
| btn-press / focus-ring | Button 基座有 | `ui.tsx` |
| 业务→UX | 「从 Search 导入」明示示意补种子；矩阵「自动填假比对」诚实。无谎跨口同步。 | Hits/Matrix 文案 |

### 草案分

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 |
|----|----|----|----|----|----|----|----|----|----|
| 4 | 4 | 3 | 4 | 4 | 3 | 3 | 3 | 4 | 4 |

### 候选缺陷

| 级 | ID | 问题 | 条款 | 验收 | Path |
|----|-----|------|------|------|------|
| P1 | FTO-P1-1 | 顶栏 raw `localhost:5182` | F8 | 改为「打开检索」标签，URL 仅 `title`/devtools | `/` 壳顶栏 |
| P1 | FTO-P1-2 | violet mock / icon / 假 claim 文 | F1 | 改 accent/amber/slate | `ui.tsx` · `HomePage` · `HitsPage` |
| P2 | FTO-P2-1 | Hits 空矩阵钮仅 `title=` | HABIT-03 | 可见 Chip「至少 1 条命中」（已有空态 Chip，确认锁定态亦可见） | `/hits` |
| P2 | FTO-P2-2 | 部分 locked 控件无 Chip（Risk/Hits） | DS-DISABLED-01 | 与 Features 同「只读（已 Confirm）」 | `/risk` · `/hits` |

**门禁草案**：**Conditional Go**

---

## A3 · mining · `:5184`

### Shell / IA

| 项 | 证据 |
|----|------|
| 壳 | `layout/MiningShell.tsx`：标准并行壳 + `shell-banner-demo` |
| 诚实 | `样机 · 无真挖掘引擎 · 不写立案库` |
| 路由 | `/` · `/disclosure` · `/candidates` · `/score` · `/send` |
| 深链 | 顶栏 workbench `:5174` · doc `:5178` · search `:5182`（全文 URL） |

### Anti-patterns

| 检查 | 结果 | 路径 |
|------|------|------|
| F1 | mock Chip violet；Home Beaker violet；Send/Disclosure **选中卡** `border-violet-200 bg-violet-50` | `ui.tsx` · `HomePage.tsx:21` · `SendPage.tsx:85` · `DisclosurePage.tsx:93` |
| F8 | 三深链 raw localhost | `MiningShell.tsx` + `types.ts` |
| HABIT-05 | Candidates/Score/Send 空态 **有** CTA | 各页 |
| DS-DISABLED-01 | Send `disabled={!canSend}` **未见**旁注（仅空态分支有说明）；Score 空候选禁用无 title | `SendPage.tsx:119+` · `ScorePage.tsx:32` |
| 业务→UX | 送立项/撰写明示只写 intents、不创建案件 — **诚实** | `SendPage` |

### 草案分

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 |
|----|----|----|----|----|----|----|----|----|----|
| 4 | 4 | 3 | 4 | 3 | 3 | 3 | 3 | 4 | 3 |

### 候选缺陷

| 级 | ID | 问题 | 条款 | 验收 | Path |
|----|-----|------|------|------|------|
| P1 | MN-P1-1 | 选中态 violet wash | F1 | 改 `accent-soft` / `list-row-active` | `/send` · `/disclosure` |
| P1 | MN-P1-2 | 顶栏三 raw URL | F8 | 标签化深链 | 壳顶栏 |
| P1 | MN-P1-3 | 送出禁用无内联原因（有候选但未勾选） | DS-DISABLED-01 | 「请先勾选候选」Chip | `/send` |
| P2 | MN-P2-1 | mock Chip violet 共享 | F1 | 同 SR-P1-1 | `ui.tsx` |

**门禁草案**：**Conditional Go**

---

## A4 · inspire · `:5185`

### Shell / IA

| 项 | 证据 |
|----|------|
| 壳 | `layout/InspireShell.tsx`：标准壳 + banner |
| 诚实 | `样机 · 无真 LLM · 扩召为种子拼装` |
| 路由 | `/` Prompt · `/sparks` · `/favorites` · `/send` |
| 深链 | mining / doc / search localhost |

### Anti-patterns（重点）

| 检查 | 结果 | 路径 |
|------|------|------|
| **F1+F5（首页主输入）** | textarea：`focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200` | **`pages/PromptPage.tsx:36`** |
| F1 | mock Chip；Send 选中 `violet` wash | `ui.tsx` · `SendPage.tsx:101` |
| HABIT-05 | Sparks「暂无灵感卡」分支 **无 action**；「还没有扩召结果」**有** CTA | `SparksPage.tsx:32` vs `:57` |
| DS-DISABLED-01 | Favorites「去送出」`disabled={favorites.length===0}` 无旁注（同屏 EmptyState 有出口） | `FavoritesPage.tsx:34` |
| 业务→UX | 假 Hit / 非 LLM 文案清晰 | Sparks/Prompt |

### 草案分

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 |
|----|----|----|----|----|----|----|----|----|----|
| 4 | 4 | 2 | 3 | 2 | 3 | 3 | 2 | 3 | 3 |

### 候选缺陷

| 级 | ID | 问题 | 条款 | 验收 | Path |
|----|-----|------|------|------|------|
| **P0** | IN-P0-1 | 主路径 Prompt 输入 **outline-none + violet focus** | **F1 · F5 · DS-FOCUS-01** | 改 `.ui-input` / `focus-ring` + accent soft ring；去掉 violet | `/` |
| P1 | IN-P1-1 | Sparks 空态一支无 CTA | HABIT-05 | 加「去输入台」 | `/sparks` |
| P1 | IN-P1-2 | Send 选中 violet + 顶栏 localhost | F1 · F8 | accent-soft + 标签深链 | `/send` · 壳 |
| P2 | IN-P2-1 | Favorites 禁用送出钮无内联原因 | HABIT-03 | Chip 或依赖 EmptyState 足够近并标注 | `/favorites` |

**门禁草案**：**Conditional Go**（P0 未关前 **不得全量 Go**；若走查确认键盘焦点不可见 → 可升 **No-Go**）

---

## A5 · landscape · `:5186`

### Shell / IA

| 项 | 证据 |
|----|------|
| 壳 | `layout/LandscapeShell.tsx`：标准壳 + banner |
| 诚实 | `样机 · 汽车种子域 · 无全球实时产业库` |
| 路由 | `/` Domain · `/tree` · `/nodes/:nodeId` · `/orgs/:orgId` · `/insights` · `/ingest` |
| 深链 | search `:5182` |

### Anti-patterns

| 检查 | 结果 | 路径 |
|------|------|------|
| F1 | mock Chip；Domain `Car` violet；Tree 柱 `bg-violet-400/80`；Ingest 进度 violet | `ui.tsx` · `DomainPage.tsx:30` · `TreePage.tsx:139` · `IngestPage.tsx:40` |
| DS-DISABLED-01 | 非样机域按钮 `disabled` 文案「不可用」——卡内有说明，但按钮旁无独立原因行 | `DomainPage.tsx:59–61` |
| HABIT-05 | Node/Org 404 **有** CTA；Ingest 空态 **无** action | `IngestPage.tsx:15` |
| 业务→UX | 域锁定「另立项」诚实；入库「不触发网络抓取」；工作篮 toast「未跨口同步」 | Domain/Ingest/store |

### 草案分

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 |
|----|----|----|----|----|----|----|----|----|----|
| 4 | 4 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 |

### 候选缺陷

| 级 | ID | 问题 | 条款 | 验收 | Path |
|----|-----|------|------|------|------|
| P1 | LS-P1-1 | 热力/进度/图标 violet | F1 | 改 accent / slate / status token | `/` · `/tree` · `/ingest` |
| P1 | LS-P1-2 | 灰域「不可用」死按钮感 | DS-DISABLED-01 | 旁注「另立项」或改 ghost+说明，勿仅靠 opacity | `/` |
| P1 | LS-P1-3 | Ingest 空态无动作 | HABIT-05 | CTA「查看技术树」或说明上方无触发属预期 | `/ingest` |
| P2 | LS-P2-1 | search raw URL | F8 | 标签化 | 壳顶栏 |

**门禁草案**：**Conditional Go**

---

## A6 · figure · `:5187`

### Shell / IA

| 项 | 证据 |
|----|------|
| 壳 | `layout/FigureShell.tsx`：标准壳 + 步骤 pill + banner |
| 诚实 | `样机 · 无真文生图 · 生成+编辑双闭环` |
| 路由 | `/` · `/new` · `/generate/:draftId` · `/edit/:assetId` · `/versions/:assetId` · `/attach/:assetId` |
| 深链 | doc-harness `:5178` |

### Anti-patterns

| 检查 | 结果 | 路径 |
|------|------|------|
| F1 | 主要仅 mock Chip violet（无页面级大块 violet） | `ui.tsx:115` |
| F4/F5 | 未检出 | — |
| HABIT-05 | 资产/草稿不存在空态 **均有** CTA | Edit/Generate/Versions/Attach |
| DS-DISABLED-01 | Undo/Redo、generating 禁用可接受（状态自解释）；无闸门级死钮 | Edit/Generate |
| btn-press / focus-ring | 齐全 | `ui.tsx` |
| 业务→UX | 挂章/恢复版本 Confirm + 不写 case-core — **示范级诚实** | Attach/Versions |

### 草案分

| D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 |
|----|----|----|----|----|----|----|----|----|----|
| 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | 4 |

### 候选缺陷

| 级 | ID | 问题 | 条款 | 验收 | Path |
|----|-----|------|------|------|------|
| P1 | FG-P1-1 | mock Chip violet（共享模式） | F1 | 改 amber mock 语义 | `ui.tsx` |
| P2 | FG-P2-1 | doc-harness localhost 深链 | F8 | 标签「打开文档壳」 | `/attach` · 壳 |
| P2 | FG-P2-2 | 时间戳 `text-slate-400` | D6 对比 | 升至 `#3f3f46` / slate-600 | `HomePage` |

**门禁草案**：**Conditional Go**（六壳中最接近可演示 Go；仍受共享 F1 Chip 拖累）

---

## Scope A · 分表并排

| 壳 | D1 | D2 | D3 | D4 | D5 | D6 | D7 | S1 | S2 | S3 | 门禁 |
|----|----|----|----|----|----|----|----|----|----|----|------|
| search | 4 | 4 | 3 | 4 | 3 | 4 | 3 | 3 | 4 | 3 | Conditional |
| fto | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 3 | 4 | 4 | Conditional |
| mining | 4 | 4 | 3 | 4 | 3 | 3 | 3 | 3 | 4 | 3 | Conditional |
| inspire | 4 | 4 | 2 | 3 | 2 | 3 | 3 | 2 | 3 | 3 | Conditional* |
| landscape | 4 | 4 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | Conditional |
| figure | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | Conditional |

\*inspire：P0（Prompt F1+F5）未关则不可宣称 Go。

---

# Scope B — 五壳静态回归抽检

对照已知 DS 风险：**F1 violet** · **禁用缺原因** · **tip 叠层**。关键页：mid `/` `/cases`；wb `/workbench`；agent `/agent`；ops `/`；iam `/`。

| 壳 | 端口 | F1 violet | 禁用原因 | tip 叠层 | 其他回归 | 笔记 |
|----|------|-----------|----------|----------|----------|------|
| **mid** | 5173 | **无**（`apps/mid` + 共享 `src/pages/Dashboard` 无 violet/indigo） | Dashboard 主路径用 `dash-next`；历史 P0-1 scan chips 仍在 `Dashboard.tsx` | 壳层无 wb-tip 墙 | `MidLayout` `outline-none` **有** `focus-visible:ring-accent` 替换 → **非 F5** | `/` · `/cases` 未见 DS 回归；保持 Go 水位（以既有 REVIEW 为准） |
| **workbench** | 5174 | **无** | Intake/Draft/Handoff：**有** persona title、sticky tip、inline「请先…」；`HandoffActionBar` invoice reason | `WbStickyTip` 多处 **if/else 互斥**（如 `ProsecutionFlow` 陈述 vs Full-check；Intake 红灯链）→ HABIT-04 **未回归叠墙** | Research 注释明示 blocker 降级防叠 | `/workbench` 步进：无新 P0 迹象 |
| **agent** | 5175 | **无** | `SessionConfirmBar` 仍用 `.agent-confirm-reason` / `data-tone="block"` | Confirm 区主因 id=`agent-confirm-reason-primary` | Composer/`AgentHome` textarea **`outline-none`**，靠父级 `focus-within:border` — **弱 F5**（焦点环不完整） | `/agent`：P0-2 模式仍在；记 **P2** 补 focus-ring/soft ring |
| **ops** | 5176 | **无** | 轻壳；无闸门级死 CTA | `shell-banner-demo` 单条 | ① 侧栏 `sidebar-link` **缺 focus-ring**（`OpsShell.tsx`）② `AlertNotifyPanel`/`LogsPage` `focus:outline-none` **无** focus-visible ③ `EmptyState` **无 action 槽**（HABIT-05）④ 壳已用 `AppSurfaceLinks` → **F8 未回归** | `/`：记 P1 focus + EmptyState |
| **iam** | 5177 | **无** | `OidcEmptyState` disabled + `title="当前未接入 OIDC"` + 诚实文案 | banner 单条 | `ui-btn` **缺 focus-ring**（`IamHome`/`IamLoginPage`）；`deepLinks` 注释避免硬编码 localhost | `/`：诚实空态好；记 **P2** 补 focus-ring |

### Scope B · 候选回归单

| 级 | ID | 壳 | 问题 | 验收 | Path |
|----|-----|-----|------|------|------|
| P1 | OPS-P1-1 | ops | 输入 `outline-none` 无 focus-visible；侧栏无 focus-ring | DS-FOCUS-01 | `/logs` · `/` Alert 面板 · 侧栏 |
| P1 | OPS-P1-2 | ops | EmptyState 无 CTA 槽 | HABIT-05 | `components/ui.tsx` · Infra/Logs |
| P2 | AG-P2-1 | agent | Composer outline-none | 容器或控件补 accent soft ring | `/agent` · SessionComposer |
| P2 | IAM-P2-1 | iam | 主按钮缺 focus-ring | 加 `focus-ring` | `/` · `/login` |
| — | mid/wb | — | **无** F1 / tip 叠层 / 禁用原因回归 | 保持 | `/` · `/cases` · `/workbench` |

---

## apple-design / feel-better / web-guidelines 抽记

| Skill | 并行壳观察 |
|-------|------------|
| **apple-design** | `btn-press` 普遍挂在 `Button`；未见 `scale` 过小。`transition-all` 仅 search corpus 进度（打断性差）。inspire/agent 焦点环不合规伤害「按压可感知」链。 |
| **make-interfaces-feel-better** | 并行壳 Card=`rounded-xl`+`shadow-rest` 齐；与主仓 `surface-card`/`ui-empty` 仍有 class 分叉（S1=3）。 |
| **web-design-guidelines** | inspire Prompt F5；ops/iam focus 缺口；slate-400 次要文对比风险（建议抽测 ≥4.5:1）。 |

---

## 建议下一步（给 UI质感助手，非本角色改码）

1. **统一修 F1**：并行六壳 `Chip tone="mock"` → amber/slate；inspire Prompt 去 violet focus。  
2. **inspire P0**：`PromptPage` textarea → `ui-input` + accent focus。  
3. **F8**：壳顶栏/下游改为标签深链（可保留 `title` tooltip）。  
4. **HABIT-05**：search/inspire/landscape/ops 空态补 CTA。  
5. 浏览器补证：各壳首页 + 一深页截图入 `n1-evidence/`，再出正式 `REVIEW_N1_parallel.md`。

---

*本文件仅笔记；未修改任何产品 `.tsx/.ts/.css`。*
