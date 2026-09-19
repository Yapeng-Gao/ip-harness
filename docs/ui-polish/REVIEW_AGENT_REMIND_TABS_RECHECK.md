# Agent 提醒 · 左侧 Tab · Must 短复测 · REVIEW_AGENT_REMIND_TABS_RECHECK

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **对照** | `REVIEW_AGENT_REMIND_TABS_2026-09-19.md` + P0-Y 过程闸 |
| **自证** | ART/ATT：`agent-remind-tabs-fix/REPORT.md`（`c665a7d`）· Y：`AGENT_NO_MID_BANNER_REPORT.md` + `agent-p0-overlay/`（`d2d91fa`） |
| **HEAD** | `9d2ff62`（`dev`）· 产品 Y 闸 `d2d91fa` **ancestor ✓** · ART 闸 `c665a7d` **ancestor ✓** |
| **日期** | 2026-09-19（Asia/Shanghai · ~11:25 CST） |
| **运行时** | Vite `http://127.0.0.1:5175` · **活口 DOM**（非旧截图 alone）· 视口 1440×900 |
| **方法** | Playwright 强制路径扫 · 度量 · 截图 |
| **证据** | `docs/ui-polish/agent-remind-tabs-recheck/` · `_measures-recheck.json` |
| **本复测总评** | **Go**（ART×3 + ATT×2 + **P0-Y1** + **P0-Y2** = **7/7 PASS**） |

---

## 0. 活口路径（过程闸）

| # | 面 | 操作 | URL | 帧 |
|---|----|------|-----|----|
| 1 | Home | goto | `/agent` | `path-01-home.png` |
| 2 | 会话列表 | goto | `/agent/sessions` | `path-02-sessions.png` |
| 3 | 会话工作区 | **click** 首行 td | `/agent/sessions/sess-oa-1?focus=hitl` | `path-03-session-workspace.png` |
| 4 | 项目 List | goto | `/agent/projects` | `path-04-projects-list.png` |
| 5 | 项目 Workspace | **click** / goto general | `/agent/projects/proj-demo-general` | `path-05-project-workspace-general.png` |
| 6 | 项目 Workspace | goto patent | `/agent/projects/proj-demo-patent` | `path-06-project-workspace-patent.png` |

---

## 1. Must · ART / ATT（相对 `c665a7d` · 未回退）

| ID | 验收 | 复测 | 一句证据 |
|----|------|------|----------|
| **ART-M-1** | 主词「待确认」、角色次级、无「需确认」第四套 | **PASS** | sessions：`需确认=0` · `待企业确认=0` ·「待确认」×7 ·「待企业」×6；Catalog：`需确认=0`。 |
| **ART-M-2** | Home「待确认·N」可点=1；无底 strip；深 amber | **PASS** | `homeRemindClickables.length=1` · strip/bottom=0 · `.agent-remind-chip` inset amber。 |
| **ART-M-3** | badge≥11px；无 9px Inbox 幽灵链 | **PASS** | `.agent-biz-badge` fs=**11px** · h=20；幽灵「Inbox」文链 0。 |
| **ATT-M-1** | 竖向壳导航；`list-row-active`；项高≥36–40 | **PASS** | nav **vertical** ·「会话」active accent-soft · h=**40**。 |
| **ATT-M-2** | 全部·N \| 待确认·N \| 进行中·N；不粘字；待确认轻 amber | **PASS** | 三段带 `·` · sticky=false · 选中 bg=`rgb(255,251,235)`。 |

---

## 2. Must · P0-Y（`d2d91fa`）

| ID | 验收 | 复测 | 一句证据 |
|----|------|------|----------|
| **P0-Y1** | 项目 List/Workspace 顶 **无全宽样机黄条** | **PASS** | List/general/patent：`fullWidthTop=[]` · `topAmberHonesty=[]`；顶栏 closeup 无 `bg-amber-50`「样机·无真 LLM」带（`y1-*-banner-closeup.png`）。 |
| **P0-Y2** | `a[href*="5173"]=0`；无「回中台 / 运营 Inbox / 打开中台 / 在运营 Inbox… / 回中台案件库」可点 mid 深链 | **PASS** | 全路径 `a[href*="5173"]` **0**；内容区禁串 clickable **0**（会话列表/工作区/Confirm 无回中台、无运营 Inbox）。 |

**壳注（不挡 Go）**：顶栏 ProductSwitcher 仍保留文案「作业中台」按钮（`href=null` · 度量 top≈−18 折叠态），属跨壳产品切换 chrome，**非** mid 深链 CTA；与 `agent-p0-overlay` 活验 PASS 口径一致。硬闸 `a[href*="5173"]=0` 已过。

---

## 3. 门禁

| 门 | 本复测 |
|----|--------|
| **Go** | **是** · 7/7 Must PASS |
| **Conditional** | 否 |
| **No-Go** | 否 |

> 规则：Go iff ART×3 + ATT×2 + P0-Y1 + P0-Y2 全 PASS。

---

## 4. 证据索引

`docs/ui-polish/agent-remind-tabs-recheck/`

- 路径：`path-01`…`path-06`
- ART/ATT：`01-*` · `02-*` · `03-*` · `06-catalog-*`
- Y1：`y1-projects-list*.png` · `y1-project-workspace-*.png`
- 度量：`_measures-recheck.json` · `_recheck-y-sha.mjs`
- 对照自证：`docs/ui-polish/agent-p0-overlay/` · `AGENT_NO_MID_BANNER_REPORT.md`

---

## 5. 报告回执

| 字段 | 值 |
|------|-----|
| HEAD | `9d2ff62`（产品 Y=`d2d91fa` · ART=`c665a7d`） |
| ART | **3/3 PASS** |
| ATT | **2/2 PASS** |
| P0-Y | **Y1 PASS** · **Y2 PASS** |
| Verdict | **Go** |
| MD path | `docs/ui-polish/REVIEW_AGENT_REMIND_TABS_RECHECK.md` |
| Blockers | **无** |
| 未改产品代码 | 是 · 无 commit/push · 无 Cloud Agent |

---

*只文档与证据；未改 apps/contracts；未 git commit/push；未启 Cloud Agent。*
