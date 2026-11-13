# Agent 闭环② · CDP/Playwright 度量驱动短评 · REVIEW_AGENT_LOOP

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **命题** | 闭环② · feel Go 之后的 **CDP/Playwright 度量驱动短评**（Agent `:5175`） |
| **基线** | ENTRY Go · FULL Go · **feel Go**（`REVIEW_AGENT_FEEL_RECHECK.md`）— **不重开**已关 P0/P1/Must（P0-AE* · P1-AE* · P0-AF-1 · P1-AF-* · AFE-M-*） |
| **HEAD** | `82c27df`（`dev` · `docs(ui): Agent loop e2e 报告…`）· **~`58f04f9`+** ✓ · 产品闸门仍为 feel 落地 `e431083` ancestor |
| **日期** | 2026-09-19（Asia/Shanghai · ~10:31 CST） |
| **运行时** | Vite `http://127.0.0.1:5175` · `/agent` → **200** · 视口 **1440×900** |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md` |
| **Skills** | `apple-design` · `make-interfaces-feel-better` · `web-design-guidelines` |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-19** |
| **方法** | Playwright Chromium 真导航 · `getBoundingClientRect` / `fontSize` / `transition-property` / console · **非**纯读代码 |
| **证据** | `docs/ui-polish/agent-loop-evidence/`（7 PNG + JSON） |
| **本评总评** | **Clear** · Must **0** · Should **0** · Could 仍开 AFE-C-1/2/3（未升格） |

---

## 1. Meta

| 路径 | 交互 | 帧 |
|------|------|-----|
| `/agent` Home | 单主 CTA 抽检 | `01-home.png` |
| `/agent/sessions/sess-oa-1` HITL | dock · timeline · Confirm · console · transition | `02` · `03-dock-closeup` |
| `/agent/projects/proj-demo-general` | 工具芯片 · composer | `04-proj-general.png` |
| `/agent/projects/proj-demo-patent` | 工具芯片 · composer | `05-proj-patent.png` |
| `/agent/agents` Catalog | compact 侧栏 glance | `06-catalog.png` |
| `/agent/harness` | compact 侧栏 glance | `07-harness.png` |

对照：`REVIEW_AGENT_FEEL_RECHECK.md`（feel Go）· `REVIEW_AGENT_FULL_RECHECK.md`（FULL Go）· `AGENT_LOOP_E2E_2026-09-19.md`（闭环① e2e）。

---

## 2. Method

1. Chromium headless · `1440×900` · `networkidle` + 短 settle。  
2. 每页：`bodyScroll` · nested overflow scroller · interactive chrome `h<40`（分类）· 主标签 `fontSize<12` · Confirm/dock 主热区 · `transition-property === 'all'`（**scoped** dock/confirm/rail **与** full session）。  
3. Console：收集 `error` / `pageerror`；过滤原型白名单（Vite HMR · React DevTools · mock/favicon/Router future flag 等）；只记 **non-whitelist**。  
4. 相对 feel Go 基线对照：dockH=**157** · timelineH=**539** · scoped `transition:all`=**0**。  
5. **未**改 `apps/` / contracts；**未** git commit/push；**未**启 Cloud Agent。

脚本：`_aloop-measure.mjs` · `_aloop-refine.mjs` → `_aloop-measures.json` · `_aloop-refine.json` · `_aloop-summary.json`。

---

## 3. Metrics tables

### 3.1 HITL dock / timeline（vs feel Go · FULL 阈）

| 度量 | 本评 @1440 | feel Go | FULL 阈 | 判读 |
|------|------------|---------|---------|------|
| `.agent-hitl-dock` 高 | **190** | 157 | ≤ ~200 | △ +33 · **仍过阈** · 不重开 P0-AF-1 |
| `session-timeline-scroller` 高 | **481** | 539 | ≥ ~480 | △ −58 · **刚过阈** · 内容恰填满（`sh=ch=481` · 暂无可滚溢出） |
| `bodyScroll` | **false** | false | false | ✓ 无壳双滚 |
| nested 可滚 | artifact-editor ×1 | timeline 为主 | 仅列内滚 | ✓ 非 body+壳双滚；timeline `overflowY:auto` 但本态无溢出 |
| Confirm 主 CTA「批准策略」 | h=**40** | 40 | ≥36–40 | ✓ |
| 「还有 N 条」/ composer fold | h=**40** / **41** | 40 | ≥40 | ✓ |
| 步进字「待批准/待授权/逐步」 | fs=**14/14/12** | ≥12 | ≥12 | ✓ · Confirm 主标签无 &lt;12 |
| `reasonCount` | **1** | 1 | 1 | ✓ 不重开 P1-AF-3 |

### 3.2 Hit areas &lt;40（interactive chrome · 分类）

会话 `sess-oa-1` 分类计数（`_aloop-refine.json`）：

| 类 | n | 代表 | 处置 |
|----|---|------|------|
| sidebar-nav | 4 | 「开始/Agent/会话/更多」h≈28 | 残余密度 · **不升 Must**（非 feel 已关主路径） |
| sidebar-new / filter-micro | 1+1 | 「新建会话」h≈27 ·「筛选」h≈21 | 同上 |
| segmented | 2 | Inbox 分段 h≈32 | 同上 |
| inbox-micro | 3 | 「Inbox」h=14 · fs=9 | 装饰级链 · 不升 |
| timeline-invoke | 3 | 「调用 · …」h≈20 | 行内次级 · 不升 |
| hitl-dock 次级 | 2 | 「授权递交」「退回」h=**36** | 距 40 差 4 · **Should 候选但非硬回归** · 本环 **Clear** 不立单 |
| aside | 5 | 「期限/产物/办理记录」h≈37 | 右栏折叠行 · 不升 |
| other | 5 | 图标「会话操作」22×22 | 图标钮 · 不升 |

项目页工具主芯片（feel M-1 维持）：patent/general「分派任务 / 汇总时间线 / 打开专家私信」均为 **BUTTON h=40** · `title=dispatch_task|…` · 主文案中文。

Home「开始办理」可见 **1** · h=**40**（ENTRY no-regress）。

> 规则：本环 **Must 仅硬新回归**。上述 &lt;40 多为侧栏/微链/次级 ghost，**未**构成相对 feel Go 的硬回退；不重开 AFE-M-* / P1-AF-*。

### 3.3 Font sizes &lt;12（primary UI labels）

| 范围 | &lt;12 主标签 | 注 |
|------|-------------|-----|
| Confirm / HITL 主状态与 CTA | **0** | 待批准等 ≥12 ✓ |
| 会话侧 Inbox 微钮等 | 有（9–11px） | **非**主标签 · 不升 Must |
| 项目工具芯片主文案 | fs=**12** | ✓ |

### 3.4 Double scroll

| 页 | bodyScroll | 判读 |
|----|------------|------|
| Home / session / general / patent / Catalog / Harness | **false** 全过 | ✓ 无壳滚 + 体滚叠加 |

会话 nested：仅 `.agent-artifact-editor` 内滚；轨迹列本态无溢出。相对 FULL P1-AF-2：**无回归**。

### 3.5 Console errors（non-whitelist）

| 项 | 值 |
|----|-----|
| 全路径 error/pageerror unique（白名单内） | 若干 Vite/DevTools/mock 类（已滤） |
| **non-whitelist page errors** | **0** |

### 3.6 `transition: all`（agent session）

| 范围 | count | 对照 |
|------|-------|------|
| **scoped** dock + confirm + rail（AFE-S-1 同口径） | **0** | feel Go = 0 · **维持** |
| full `main`/session 树（含工具类/utility） | ~**89–90** | 非 AFE-S-1 闸门；**不**据此新开 Must（Guidelines anti-pattern 记观察，不升格） |

本环口径：**闸门 = scoped 0**（与 feel recheck 一致）。full-tree 命中视为全局 utility 噪音，留给择机 Should，**本评 Clear 不立 `ALOOP-S-*`**。

### 3.7 Projects / Catalog / Harness glance

| 页 | 关键度量 | 结果 |
|----|----------|------|
| patent | chips h=40 · composerTop=**774**（≲780） | feel M-1/M-2 维持 |
| general | chips 同构 | ✓ |
| Catalog | `browse-sidebar-compact` **true** · bodyScroll false | P1-AF-5 维持 |
| Harness | compact **true** · bodyScroll false | 同上 · C-1 仍可选 |

---

## 4. e2e / Hunt signal disposition

| 源 | 状态 | 处置 |
|----|------|------|
| `docs/ui-polish/AGENT_LOOP_E2E_2026-09-19.md`（闭环① · HEAD `82c27df`） | L0-AG-01 + L1-02/06/07 · **4 passed · 0 failed** | **采纳** · 冒烟绿 · 无 UI 硬信号 |
| `e2e/RESULTS.md` | 2026-09-18 全仓矩阵绿（含 L0-AG-01 / L1-02） | 历史对照 · 无新债 |
| `tools/e2e-hunt/artifacts/*` | 最近跑次 **2026-09-18** · 多为并行壳/figure 等 · **无本环 Agent 新 Hunt 报告** | **Hunt 报告未到（本环）** · **本评以 CDP 为主** |

无 e2e/Hunt 失败可升格为 `ALOOP-M-*` / `ALOOP-S-*`。

---

## 5. Could disposition（AFE-C-* · 复评是否升格）

| ID | 原意 | 本环度量 | 升格？ |
|----|------|----------|--------|
| **AFE-C-1** | Harness 再折叠「最近会话」/纪律墙 | compact 已维持；无新密度硬指标破线 | **否** · 仍开 |
| **AFE-C-2** | composer 展开改抽屉 | composerTop=774 舒适带维持；无新贴折线回归 | **否** · 仍开 |
| **AFE-C-3** | Home「待确认」chip 软竞争 | Home 单主 CTA 维持；未测出硬竞争回归 | **否** · 仍开 · **不重开 ENTRY** |

---

## 6. Must / Should

### Must（`ALOOP-M-*`）

| ID | 项 | 状态 |
|----|-----|------|
| — | — | **Clear** · 无新硬回归 / 无破阈信号 |

### Should（`ALOOP-S-*`）

| ID | 项 | 状态 |
|----|-----|------|
| — | — | **Clear** · 次级 h=36 ghost / full-tree `transition:all` utility 噪音 **不立单**（观察 only） |

已关闭关闸 **一律不重开**（P0-AE* · P1-AE* · P0-AF-1 · P1-AF-* · AFE-M-* · AFE-S-* 已 PASS 项）。

---

## 7. Verdict

| 门 | 本评 |
|----|------|
| **Clear** | **是** · Must 0 · Should 0 |
| **Go** | 等价 Clear（无条件项）· feel Go / FULL Go / ENTRY Go **维持** |
| **Conditional** | 否 |
| **No-Go** | 否 |

**Verdict: Clear**

软观察（不挡 Clear）：dock **190**（↑）· timeline **481**（↓但仍 ≥480）— 若后续再压缩轨迹，可能贴 FULL 下限，建议质感侧监控，**本环不立单**。

---

## 8. Skills one-liner

**apple-design / feel-better / web-guidelines（2026-09-19）**：主路径 press·hit·Confirm 字阶与 scoped `transition:all=0` 维持；残余 &lt;40 侧栏/微链与 full-tree utility `transition:all` 仍属观察级，未构成闭环② 新 Must/Should。

---

## 9. Evidence index

目录：`docs/ui-polish/agent-loop-evidence/`

```
01-home.png
02-session-oa1.png
03-dock-closeup.png
04-proj-general.png
05-proj-patent.png
06-catalog.png
07-harness.png
_aloop-summary.json
_aloop-refine.json
_aloop-measures.json
_aloop-refine.mjs
_aloop-measure.mjs
```

对照：`REVIEW_AGENT_FEEL_RECHECK.md` · `agent-feel-recheck/_afe-recheck.json` · `AGENT_LOOP_E2E_2026-09-19.md`。

---

## 10. 报告回执字段

| 字段 | 值 |
|------|-----|
| HEAD | `82c27df`（~`58f04f9`+） |
| Verdict | **Clear** |
| Must / Should | **Clear**（0 / 0）· 无 `ALOOP-M-*` / `ALOOP-S-*` |
| console non-whitelist | **0** |
| MD path | `docs/ui-polish/REVIEW_AGENT_LOOP_2026-09-19.md` |
| Could | AFE-C-1/2/3 仍开 · 未升格 |
| 未改产品代码 | 是 · 无 commit/push · 无 Cloud Agent |

---

*只文档与证据；未改 apps/contracts；未 git commit/push；未启 Cloud Agent。*
